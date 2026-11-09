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
  mfaVerified?: boolean;
}

export interface SessionData {
  sessionId: string;
  user: AuthUser;
  createdAt: number;
  expiresAt: number;
  lastRenewedAt: number;
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
export const SESSION_RENEWAL_WINDOW_SECONDS = 3 * 60 * 60; // Renew if within 3 hours of expiry
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 Minutes

// Known default credentials that MUST be rejected in production
export const WEAK_DEFAULT_PASSCODES = new Set([
  "2052",
  "vvotel2026",
  "admin2052",
  "vvotel@admin",
  "manager2052",
  "staff2052",
  "authorized_manager_2052",
  "admin",
  "password",
  "123456",
  "hotel2026",
]);

/**
 * Timing-safe string comparison to protect against timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Mask raw session tokens for safe audit logging
 */
export function maskSessionToken(token: string): string {
  if (!token || typeof token !== "string") return "unknown";
  return `tok_${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Hash password or passcode with PBKDF2
 */
export function hashCredential(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

interface SystemAccount {
  username: string;
  displayName: string;
  role: Role;
  passcodes: string[];
}

function getSystemAccounts(isProd: boolean): SystemAccount[] {
  const customSuperAdminPass = process.env.SUPER_ADMIN_PASSCODE;
  const customAdminPass = process.env.ADMIN_PASSCODE;
  const customManagerPass = process.env.MANAGER_PASSCODE;
  const customStaffPass = process.env.STAFF_PASSCODE;

  // In production, reject default passcodes and strictly require env secrets
  if (isProd) {
    return [
      {
        username: "superadmin",
        displayName: "VVotel Chief Security Administrator",
        role: "SUPER_ADMIN",
        passcodes: customSuperAdminPass ? [customSuperAdminPass] : [],
      },
      {
        username: "admin",
        displayName: "General Manager / IT Director",
        role: "ADMINISTRATOR",
        passcodes: customAdminPass ? [customAdminPass] : [],
      },
      {
        username: "manager",
        displayName: "Duty Operations Manager",
        role: "MANAGER",
        passcodes: customManagerPass ? [customManagerPass] : [],
      },
      {
        username: "staff",
        displayName: "Front Desk & Guest Concierge",
        role: "STAFF",
        passcodes: customStaffPass ? [customStaffPass] : [],
      },
    ];
  }

  // In development / test environment, support development conveniences with prominent warning
  return [
    {
      username: "superadmin",
      displayName: "VVotel Chief Security Administrator",
      role: "SUPER_ADMIN",
      passcodes: customSuperAdminPass ? [customSuperAdminPass] : ["vvotel@admin", "admin2052", "vvotel2026"],
    },
    {
      username: "admin",
      displayName: "General Manager / IT Director",
      role: "ADMINISTRATOR",
      passcodes: customAdminPass ? [customAdminPass] : ["vvotel2026", "2052"],
    },
    {
      username: "manager",
      displayName: "Duty Operations Manager",
      role: "MANAGER",
      passcodes: customManagerPass ? [customManagerPass] : ["2052", "manager2052"],
    },
    {
      username: "staff",
      displayName: "Front Desk & Guest Concierge",
      role: "STAFF",
      passcodes: customStaffPass ? [customStaffPass] : ["staff2052", "2052"],
    },
  ];
}

/**
 * Verify optional MFA / secondary verification code for privileged accounts
 */
export function verifyMfaCode(role: Role, mfaInput?: string): boolean {
  // If MFA is globally disabled via env, allow bypass in non-production
  if (process.env.REQUIRE_ADMIN_MFA !== "true" && process.env.NODE_ENV !== "production") {
    return true;
  }

  // Privileged roles require a valid 6-digit TOTP or secondary code
  if (role === "SUPER_ADMIN" || role === "ADMINISTRATOR") {
    const configuredMfaSecret = process.env.ADMIN_MFA_SECRET || process.env.SUPER_ADMIN_MFA_SECRET;
    if (!configuredMfaSecret) {
      // If no MFA secret is configured in dev, allow passage with warning
      if (process.env.NODE_ENV !== "production") return true;
      return false; // Fail closed in production if MFA secret is missing
    }

    if (!mfaInput) return false;
    const cleanMfa = mfaInput.trim();
    return timingSafeCompare(configuredMfaSecret, cleanMfa);
  }

  return true;
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
 * Authenticate credentials against system accounts with production hardening
 */
export async function authenticateCredentials(
  credentialInput: string,
  usernameInput?: string,
  mfaCodeInput?: string,
  ip = "127.0.0.1",
  userAgent?: string
): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
  locked?: boolean;
  remainingSeconds?: number;
  mfaRequired?: boolean;
}> {
  const cleanPass = (credentialInput || "").trim();
  const cleanUser = (usernameInput || "").trim().toLowerCase();
  const isProd = safeCache.isProduction();

  // Fail closed in production if distributed session store is disconnected
  if (isProd && !safeCache.isReady()) {
    return {
      success: false,
      error: "PRODUCTION_SESSION_STORE_UNAVAILABLE: Centralized Redis distributed session store is required in production but unavailable. Failing closed to protect multi-instance session integrity.",
    };
  }

  // 1. Check Lockout
  const ipLock = await isAccountLocked(ip);
  if (ipLock.locked) {
    return {
      success: false,
      error: `គណនី ឬ IP ត្រូវបានចាក់សោបណ្តោះអាសន្ន។ សូមរង់ចាំ ${ipLock.remainingSeconds} វិនាទី។`,
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

  // 2. Reject Weak / Default Credentials in Production
  if (isProd && WEAK_DEFAULT_PASSCODES.has(cleanPass)) {
    await logAuditEvent("AUTH_LOGIN_FAILED", { ip, userAgent }, "FAILURE", {
      reason: "WEAK_DEFAULT_CREDENTIAL_REJECTED",
      attemptedDefaultPass: cleanPass.slice(0, 2) + "**",
    });
    return {
      success: false,
      error: "WEAK_DEFAULT_CREDENTIAL_PROHIBITED: Default credentials (2052, vvotel2026, admin2052, etc.) are strictly prohibited in production. Explicit production secrets (SUPER_ADMIN_PASSWORD_HASH or ADMIN_PASSCODE) must be configured in environment variables.",
    };
  }

  const accounts = getSystemAccounts(isProd);

  // Case A: Specific username requested
  if (cleanUser) {
    const matched = accounts.find((a) => a.username === cleanUser);
    if (matched && matched.passcodes.length > 0) {
      const passMatches = matched.passcodes.some((p) => timingSafeCompare(p, cleanPass));
      if (passMatches) {
        // Check MFA for privileged accounts
        if (!verifyMfaCode(matched.role, mfaCodeInput)) {
          return {
            success: false,
            mfaRequired: true,
            error: "MFA_REQUIRED: Privileged administrative access requires secondary multi-factor verification code.",
          };
        }

        await resetFailedAuth(ip, cleanUser);
        const user: AuthUser = {
          id: `USR-${matched.username.toUpperCase()}`,
          username: matched.username,
          displayName: matched.displayName,
          role: matched.role,
          permissions: ROLE_PERMISSIONS[matched.role],
          mfaVerified: true,
        };
        await logAuditEvent("AUTH_LOGIN_SUCCESS", { username: user.username, role: user.role, ip, userAgent }, "SUCCESS");
        return { success: true, user };
      }
    }
  }

  // Case B: Direct PIN / Passcode login
  for (const acc of accounts) {
    if (acc.passcodes.length === 0) continue;
    const matched = acc.passcodes.some((p) => timingSafeCompare(p, cleanPass));
    if (matched) {
      // Check MFA for privileged accounts
      if (!verifyMfaCode(acc.role, mfaCodeInput)) {
        return {
          success: false,
          mfaRequired: true,
          error: "MFA_REQUIRED: Privileged administrative access requires secondary multi-factor verification code.",
        };
      }

      await resetFailedAuth(ip, acc.username);
      const user: AuthUser = {
        id: `USR-${acc.username.toUpperCase()}`,
        username: acc.username,
        displayName: acc.displayName,
        role: acc.role,
        permissions: ROLE_PERMISSIONS[acc.role],
        mfaVerified: true,
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
 * Uses Redis distributed store with session fixation protection
 */
export async function createSession(user: AuthUser, ip: string, userAgent?: string): Promise<string> {
  const isProd = safeCache.isProduction();
  if (isProd && !safeCache.isReady()) {
    throw new Error("PRODUCTION_SESSION_STORE_UNAVAILABLE: Cannot create session because shared Redis is unreachable.");
  }

  // Generate 256-bit cryptographically secure random session ID
  const sessionId = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const sessionData: SessionData = {
    sessionId,
    user,
    createdAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
    lastRenewedAt: now,
    ip,
    userAgent,
  };

  const key = `session:${sessionId}`;
  await safeCache.set(key, JSON.stringify(sessionData), "EX", SESSION_TTL_SECONDS);
  return sessionId;
}

/**
 * Retrieve and optionally renew session by sessionId
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 32) return null;
  const isProd = safeCache.isProduction();

  if (isProd && !safeCache.isReady()) {
    console.error("CRITICAL: Redis is disconnected in production during getSession. Failing closed.");
    return null;
  }

  const key = `session:${sessionId}`;
  const raw = await safeCache.get(key);
  if (!raw) return null;

  try {
    const data: SessionData = JSON.parse(raw);
    const now = Date.now();
    if (now > data.expiresAt) {
      await safeCache.del(key);
      return null;
    }

    // Safe sliding-window session renewal:
    // If within renewal window (e.g. last 3 hours of session), extend expiration
    const timeLeftMs = data.expiresAt - now;
    if (timeLeftMs < SESSION_RENEWAL_WINDOW_SECONDS * 1000) {
      data.expiresAt = now + SESSION_TTL_SECONDS * 1000;
      data.lastRenewedAt = now;
      await safeCache.set(key, JSON.stringify(data), "EX", SESSION_TTL_SECONDS);
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Revoke session immediately across all application instances (Logout)
 */
export async function revokeSession(sessionId: string, ip = "127.0.0.1"): Promise<void> {
  if (!sessionId) return;
  const session = await getSession(sessionId);
  if (session) {
    await logAuditEvent("AUTH_LOGOUT", { username: session.user.username, role: session.user.role, ip }, "SUCCESS", {
      sessionMasked: maskSessionToken(sessionId),
    });
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
  const isProd = safeCache.isProduction();

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

  // In non-production development mode only, support legacy test token for development convenience
  if (!isProd && token === "authorized_manager_2052") {
    const legacyUser: AuthUser = {
      id: "USR-DEV-MANAGER",
      username: "manager",
      displayName: "VVotel Authorized Duty Manager (Dev)",
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

  // In production, reject legacy test token outright
  if (isProd && token === "authorized_manager_2052") {
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: "LEGACY_TOKEN_REJECTED",
          message: "Legacy tokens are strictly prohibited in production. Please log in with a valid session.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  const session = await getSession(token);
  if (!session) {
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: "SESSION_EXPIRED",
          message: "Session របស់អ្នកបានផុតកំណត់ ឬត្រូវបានលុបចេញពីប្រព័ន្ធ! សូម Login ចូលម្តងទៀត។",
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
      { requiredPermission, userRole: session.user.role, sessionMasked: maskSessionToken(token) }
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
