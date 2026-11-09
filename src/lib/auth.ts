import crypto from "crypto";
import { safeCache } from "./redis";
import { logAuditEvent } from "./auditLog";
import { getClientIp } from "./rateLimit";

export type Role = "SUPER_ADMIN" | "ADMINISTRATOR" | "MANAGER" | "EDITOR" | "STAFF";

export type Permission =
  | "bookings:read"
  | "bookings:create"
  | "bookings:update"
  | "bookings:delete"
  | "settings:read_sensitive"
  | "settings:update"
  | "backup:read"
  | "backup:create"
  | "backup:restore"
  | "reports:generate"
  | "telegram:manage"
  | "audit:read";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  permissions: Permission[];
}

export interface SessionData {
  sessionId: string;
  user: AuthUser;
  createdAt: number;
  expiresAt: number;
  ip: string;
  userAgent?: string;
}

// Role Permissions Matrix
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "bookings:read",
    "bookings:create",
    "bookings:update",
    "bookings:delete",
    "settings:read_sensitive",
    "settings:update",
    "backup:read",
    "backup:create",
    "backup:restore",
    "reports:generate",
    "telegram:manage",
    "audit:read",
  ],
  ADMINISTRATOR: [
    "bookings:read",
    "bookings:create",
    "bookings:update",
    "bookings:delete",
    "settings:read_sensitive",
    "settings:update",
    "backup:read",
    "backup:create",
    "backup:restore",
    "reports:generate",
    "telegram:manage",
    "audit:read",
  ],
  MANAGER: [
    "bookings:read",
    "bookings:create",
    "bookings:update",
    "settings:read_sensitive",
    "backup:read",
    "backup:create",
    "reports:generate",
    "audit:read",
  ],
  EDITOR: [
    "bookings:read",
    "reports:generate",
  ],
  STAFF: [
    "bookings:read",
    "bookings:create",
    "bookings:update",
  ],
};

export const SESSION_COOKIE_NAME = "vvotel_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 Hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 Minutes

/**
 * Timing-safe string comparison to protect against timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Constant time dummy comparison of same length to prevent timing leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hash password or passcode with PBKDF2
 */
export function hashCredential(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

/**
 * Account Configuration
 * Supports environment variable overrides for enterprise deployments
 */
interface SystemAccount {
  username: string;
  displayName: string;
  role: Role;
  passcodes: string[];
}

function getSystemAccounts(): SystemAccount[] {
  const customSuperAdminPass = process.env.SUPER_ADMIN_PASSCODE;
  const customAdminPass = process.env.ADMIN_PASSCODE;

  const superAdminPasses = ["vvotel@admin", "admin2052", "vvotel2026"];
  if (customSuperAdminPass) superAdminPasses.push(customSuperAdminPass);

  const adminPasses = ["vvotel2026", "2052"];
  if (customAdminPass) adminPasses.push(customAdminPass);

  return [
    {
      username: "superadmin",
      displayName: "VVotel Chief Security Administrator",
      role: "SUPER_ADMIN",
      passcodes: superAdminPasses,
    },
    {
      username: "admin",
      displayName: "General Manager / IT Director",
      role: "ADMINISTRATOR",
      passcodes: adminPasses,
    },
    {
      username: "manager",
      displayName: "Duty Operations Manager",
      role: "MANAGER",
      passcodes: ["2052", "manager2052"],
    },
    {
      username: "staff",
      displayName: "Front Desk & Guest Concierge",
      role: "STAFF",
      passcodes: ["staff2052", "2052"],
    },
  ];
}

/**
 * Check if an IP or username is currently locked out
 */
export async function isAccountLocked(identifier: string): Promise<{ locked: boolean; remainingSeconds: number }> {
  const lockKey = `auth_lock:${identifier}`;
  const raw = await safeCache.get(lockKey);
  if (!raw) return { locked: false, remainingSeconds: 0 };

  const lockUntil = parseInt(raw, 10);
  const now = Date.now();
  if (now < lockUntil) {
    return { locked: true, remainingSeconds: Math.ceil((lockUntil - now) / 1000) };
  }

  await safeCache.del(lockKey);
  return { locked: false, remainingSeconds: 0 };
}

/**
 * Record a failed authentication attempt and enforce lockout if threshold exceeded
 */
export async function recordFailedAuth(
  ip: string,
  identifier: string
): Promise<{ lockedNow: boolean; remainingAttempts: number; lockoutSeconds: number }> {
  const failKey = `auth_fails:${ip}`;
  const raw = await safeCache.get(failKey);
  let fails = raw ? parseInt(raw, 10) : 0;
  fails += 1;

  if (fails >= MAX_FAILED_ATTEMPTS) {
    // Lock both IP and user identifier
    const lockUntil = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
    await safeCache.set(`auth_lock:${ip}`, lockUntil.toString(), "EX", LOCKOUT_DURATION_SECONDS);
    await safeCache.set(`auth_lock:${identifier}`, lockUntil.toString(), "EX", LOCKOUT_DURATION_SECONDS);
    await safeCache.del(failKey);

    await logAuditEvent("AUTH_LOCKOUT", { ip }, "FAILURE", {
      identifier,
      failedAttempts: fails,
      lockoutDurationSeconds: LOCKOUT_DURATION_SECONDS,
    });

    return { lockedNow: true, remainingAttempts: 0, lockoutSeconds: LOCKOUT_DURATION_SECONDS };
  }

  await safeCache.set(failKey, fails.toString(), "EX", LOCKOUT_DURATION_SECONDS);
  return {
    lockedNow: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - fails,
    lockoutSeconds: 0,
  };
}

/**
 * Reset failed attempts on successful authentication
 */
export async function resetFailedAuth(ip: string, identifier: string): Promise<void> {
  await safeCache.del(`auth_fails:${ip}`);
  await safeCache.del(`auth_lock:${ip}`);
  await safeCache.del(`auth_lock:${identifier}`);
}

/**
 * Authenticate credentials against system accounts
 */
export async function authenticateCredentials(
  credentialInput: string,
  usernameInput?: string,
  ip = "127.0.0.1",
  userAgent?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string; locked?: boolean; remainingSeconds?: number }> {
  const cleanPass = (credentialInput || "").trim();
  const cleanUser = (usernameInput || "").trim().toLowerCase();

  // 1. Check Lockout
  const ipLock = await isAccountLocked(ip);
  if (ipLock.locked) {
    return {
      success: false,
      error: `គណនី ឬ IP ត្រូវបានចាក់សោបណ្តោះអាសន្នដោយសារការបញ្ចូលខុសច្រើនដង។ សូមរង់ចាំ ${ipLock.remainingSeconds} វិនាទី។`,
      locked: true,
      remainingSeconds: ipLock.remainingSeconds,
    };
  }

  if (cleanUser) {
    const userLock = await isAccountLocked(cleanUser);
    if (userLock.locked) {
      return {
        success: false,
        error: `គណនី ${cleanUser} ត្រូវបានចាក់សោបណ្តោះអាសន្ន។ សូមរង់ចាំ ${userLock.remainingSeconds} វិនាទី។`,
        locked: true,
        remainingSeconds: userLock.remainingSeconds,
      };
    }
  }

  const accounts = getSystemAccounts();

  // Case A: Specific username requested
  if (cleanUser) {
    const matched = accounts.find((a) => a.username === cleanUser);
    if (matched) {
      const passMatches = matched.passcodes.some((p) => timingSafeCompare(p, cleanPass));
      if (passMatches) {
        await resetFailedAuth(ip, cleanUser);
        const user: AuthUser = {
          id: `USR-${matched.username.toUpperCase()}`,
          username: matched.username,
          displayName: matched.displayName,
          role: matched.role,
          permissions: ROLE_PERMISSIONS[matched.role],
        };
        await logAuditEvent("AUTH_LOGIN_SUCCESS", { username: user.username, role: user.role, ip, userAgent }, "SUCCESS");
        return { success: true, user };
      }
    }
  }

  // Case B: Direct PIN / Passcode login (standard PMS fast login)
  for (const acc of accounts) {
    const matched = acc.passcodes.some((p) => timingSafeCompare(p, cleanPass));
    if (matched) {
      await resetFailedAuth(ip, acc.username);
      const user: AuthUser = {
        id: `USR-${acc.username.toUpperCase()}`,
        username: acc.username,
        displayName: acc.displayName,
        role: acc.role,
        permissions: ROLE_PERMISSIONS[acc.role],
      };
      await logAuditEvent("AUTH_LOGIN_SUCCESS", { username: user.username, role: user.role, ip, userAgent }, "SUCCESS");
      return { success: true, user };
    }
  }

  // Failed Authentication
  const failResult = await recordFailedAuth(ip, cleanUser || "passcode_user");
  await logAuditEvent(
    "AUTH_LOGIN_FAILED",
    { ip, userAgent },
    "FAILURE",
    { cleanUser, remainingAttempts: failResult.remainingAttempts }
  );

  return {
    success: false,
    error: failResult.lockedNow
      ? `ការបញ្ចូលខុសលើសចំនួនកំណត់ (៥ ដង)! ប្រព័ន្ធបានចាក់សោគណនីរង់ចាំ ${failResult.lockoutSeconds} វិនាទី។`
      : `លេខកូដសម្ងាត់ ឬគណនីមិនត្រឹមត្រូវឡើយ! (សល់ ${failResult.remainingAttempts} ដងទៀតមុនពេលចាក់សោ)`,
    locked: failResult.lockedNow,
    remainingSeconds: failResult.lockoutSeconds,
  };
}

/**
 * Create a new cryptographic session
 */
export async function createSession(user: AuthUser, ip: string, userAgent?: string): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const sessionData: SessionData = {
    sessionId,
    user,
    createdAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
    ip,
    userAgent,
  };

  const key = `session:${sessionId}`;
  await safeCache.set(key, JSON.stringify(sessionData), "EX", SESSION_TTL_SECONDS);
  return sessionId;
}

/**
 * Retrieve session by sessionId
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 32) return null;
  const key = `session:${sessionId}`;
  const raw = await safeCache.get(key);
  if (!raw) return null;

  try {
    const data: SessionData = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      await safeCache.del(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Revoke session immediately (logout)
 */
export async function revokeSession(sessionId: string, ip = "127.0.0.1"): Promise<void> {
  const session = await getSession(sessionId);
  if (session) {
    await logAuditEvent("AUTH_LOGOUT", { username: session.user.username, role: session.user.role, ip }, "SUCCESS");
  }
  await safeCache.del(`session:${sessionId}`);
}

/**
 * Extract session token from Request (via Cookie or Bearer header)
 */
export function extractSessionToken(request: Request): string | null {
  // 1. From Cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match && match[1]) return decodeURIComponent(match[1]);
  }

  // 2. From Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  // 3. Fallback: query param or legacy header if necessary
  const customHeader = request.headers.get("x-vvotel-admin-token");
  if (customHeader) return customHeader;

  return null;
}

/**
 * Core Route Guard: Verifies authentication and checks permission
 */
export async function verifyAuth(
  request: Request,
  requiredPermission?: Permission
): Promise<{ authorized: boolean; user?: AuthUser; session?: SessionData; errorResponse?: Response }> {
  const token = extractSessionToken(request);
  const ip = getClientIp(request);

  if (!token) {
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: "UNAUTHORIZED",
          message: "ការចូលប្រើប្រាស់ត្រូវបានបដិសេធ៖ មិនទាន់មាន Session ឬ Token ត្រឹមត្រូវឡើយ (Please log in to VVotel PMS).",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  // Check if legacy manager token is used, auto-grant MANAGER for seamless upgrade
  if (token === "authorized_manager_2052") {
    const legacyUser: AuthUser = {
      id: "USR-LEGACY-MANAGER",
      username: "manager",
      displayName: "VVotel Authorized Duty Manager",
      role: "MANAGER",
      permissions: ROLE_PERMISSIONS.MANAGER,
    };
    if (requiredPermission && !legacyUser.permissions.includes(requiredPermission)) {
      return {
        authorized: false,
        errorResponse: new Response(
          JSON.stringify({
            success: false,
            error: "FORBIDDEN",
            message: `សិទ្ធិមិនគ្រប់គ្រាន់ឡើយ (Requires permission: ${requiredPermission}).`,
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        ),
      };
    }
    return { authorized: true, user: legacyUser };
  }

  const session = await getSession(token);
  if (!session) {
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: "SESSION_EXPIRED",
          message: "Session របស់អ្នកបានផុតកំណត់ហើយ! សូម Login ចូលម្តងទៀត។",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  if (requiredPermission && !session.user.permissions.includes(requiredPermission)) {
    await logAuditEvent(
      "SECURITY_UNAUTHORIZED_ACCESS",
      { username: session.user.username, role: session.user.role, ip },
      "DENIED",
      { requiredPermission, userRole: session.user.role }
    );
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: "FORBIDDEN",
          message: `គណនីតួនាទី ${session.user.role} មិនមានសិទ្ធិអនុវត្តមុខងារនេះទេ (Requires: ${requiredPermission}).`,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return { authorized: true, user: session.user, session };
}
