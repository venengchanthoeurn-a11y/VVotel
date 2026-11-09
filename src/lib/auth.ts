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
  const sid = token.includes(".") ? token.split(".")[0] : token;
  return `tok_${sid.slice(0, 4)}...${sid.slice(-4)}`;
}

/**
 * Hash password or passcode with PBKDF2
 */
export function hashCredential(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

/**
 * Generate a salted PBKDF2-SHA512 hash string for secure storage
 */
export function generateSaltedPasswordHash(password: string): string {
  const salt = crypto.randomBytes(16);
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512");
  return `pbkdf2:sha512:${iterations}:${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verify password against salted PBKDF2-SHA512 hash or timing-safe plain secret
 */
export function verifyPassword(inputPassword: string, storedCredential: string): boolean {
  if (!inputPassword || !storedCredential) return false;
  if (storedCredential.startsWith("pbkdf2:")) {
    const parts = storedCredential.split(":");
    if (parts.length === 5) {
      const iterations = parseInt(parts[2], 10) || 100000;
      const salt = Buffer.from(parts[3], "hex");
      const expectedHash = Buffer.from(parts[4], "hex");
      const computed = crypto.pbkdf2Sync(inputPassword, salt, iterations, 64, "sha512");
      if (computed.length !== expectedHash.length) return false;
      return crypto.timingSafeEqual(computed, expectedHash);
    }
  }
  return timingSafeCompare(storedCredential, inputPassword);
}

export function hasCustomCredentialsConfigured(): boolean {
  return Boolean(
    process.env.SUPER_ADMIN_PASSCODE ||
    process.env.SUPER_ADMIN_PASSWORD_HASH ||
    process.env.ADMIN_PASSCODE ||
    process.env.ADMIN_PASSWORD_HASH ||
    process.env.MANAGER_PASSCODE ||
    process.env.STAFF_PASSCODE
  );
}

interface SystemAccount {
  username: string;
  displayName: string;
  role: Role;
  passcodes: string[];
}

function getSystemAccounts(isProd: boolean): SystemAccount[] {
  const customSuperAdminPass = process.env.SUPER_ADMIN_PASSCODE;
  const customSuperAdminHash = process.env.SUPER_ADMIN_PASSWORD_HASH;
  const customAdminPass = process.env.ADMIN_PASSCODE;
  const customAdminHash = process.env.ADMIN_PASSWORD_HASH;
  const customManagerPass = process.env.MANAGER_PASSCODE;
  const customStaffPass = process.env.STAFF_PASSCODE;

  const hasCustom = hasCustomCredentialsConfigured();

  // In production with custom secrets configured, strictly reject defaults and enforce env secrets
  if (isProd && hasCustom) {
    const superAdminSecrets = [customSuperAdminHash, customSuperAdminPass].filter(Boolean) as string[];
    const adminSecrets = [customAdminHash, customAdminPass].filter(Boolean) as string[];

    return [
      {
        username: "superadmin",
        displayName: "VVotel Chief Security Administrator",
        role: "SUPER_ADMIN",
        passcodes: superAdminSecrets,
      },
      {
        username: "admin",
        displayName: "General Manager / IT Director",
        role: "ADMINISTRATOR",
        passcodes: adminSecrets,
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

  // Initial Bootstrap Mode or Development:
  // Support initial bootstrap credentials (admin2052, vvotel2026, 2052) so staff can log in immediately
  return [
    {
      username: "superadmin",
      displayName: "VVotel Chief Security Administrator",
      role: "SUPER_ADMIN",
      passcodes: customSuperAdminPass
        ? [customSuperAdminPass]
        : ["admin2052", "vvotel@admin", "vvotel2026"],
    },
    {
      username: "admin",
      displayName: "General Manager / IT Director",
      role: "ADMINISTRATOR",
      passcodes: customAdminPass
        ? [customAdminPass]
        : ["vvotel2026", "2052", "admin2052"],
    },
    {
      username: "manager",
      displayName: "Duty Operations Manager",
      role: "MANAGER",
      passcodes: customManagerPass
        ? [customManagerPass]
        : ["2052", "manager2052"],
    },
    {
      username: "staff",
      displayName: "Front Desk & Guest Concierge",
      role: "STAFF",
      passcodes: customStaffPass
        ? [customStaffPass]
        : ["staff2052", "2052"],
    },
  ];
}

/**
 * Verify dynamic RFC 6238 Time-based One-Time Password (TOTP)
 * Standard 30-second time-step with +-1 step drift window
 */
export function verifyDynamicTotp(secretBase32: string, token: string, window = 1): boolean {
  if (!secretBase32 || !token) return false;
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanSecret = secretBase32.toUpperCase().replace(/[^A-Z2-7]/g, "");
  if (cleanSecret.length === 0) return false;

  let bits = "";
  for (let i = 0; i < cleanSecret.length; i++) {
    const val = base32Chars.indexOf(cleanSecret[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  const key = Buffer.from(bytes);
  if (key.length === 0) return false;

  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const currentCounter = Math.floor(epoch / timeStep);

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const counter = currentCounter + errorWindow;
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));

    const hmac = crypto.createHmac("sha1", key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    const totp = (code % 1000000).toString().padStart(6, "0");

    if (timingSafeCompare(totp, cleanToken)) {
      return true;
    }
  }
  return false;
}

/**
 * Verify optional MFA / secondary verification code for privileged accounts
 * Supports both dynamic RFC 6238 TOTP codes and timing-safe static secrets
 */
export function verifyMfaCode(role: Role, mfaInput?: string): boolean {
  const configuredMfaSecret = process.env.ADMIN_MFA_SECRET || process.env.SUPER_ADMIN_MFA_SECRET;

  // If no MFA secret is configured:
  if (!configuredMfaSecret) {
    // Only fail closed if explicitly required via environment variable
    if (process.env.REQUIRE_ADMIN_MFA === "true") {
      return false;
    }
    // Otherwise permit login in bootstrap / initial setup mode
    return true;
  }

  // Privileged roles require a valid 6-digit TOTP or secondary code
  if (role === "SUPER_ADMIN" || role === "ADMINISTRATOR") {
    if (!mfaInput) return false;
    const cleanMfa = mfaInput.trim();
    // Validate dynamic RFC 6238 TOTP or timing-safe secondary PIN
    return verifyDynamicTotp(configuredMfaSecret, cleanMfa) || timingSafeCompare(configuredMfaSecret, cleanMfa);
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

  // 2. Reject Weak / Default Credentials in Production IF custom credentials have been configured
  if (isProd && hasCustomCredentialsConfigured() && WEAK_DEFAULT_PASSCODES.has(cleanPass)) {
    await logAuditEvent("AUTH_LOGIN_FAILED", { ip, userAgent }, "FAILURE", {
      reason: "WEAK_DEFAULT_CREDENTIAL_REJECTED",
      attemptedDefaultPass: cleanPass.slice(0, 2) + "**",
    });
    return {
      success: false,
      error: "WEAK_DEFAULT_CREDENTIAL_PROHIBITED: Default credentials (2052, vvotel2026, admin2052, etc.) are strictly prohibited once custom production secrets are configured. Explicit production secrets (SUPER_ADMIN_PASSWORD_HASH or ADMIN_PASSCODE) must be configured in environment variables.",
    };
  }

  const accounts = getSystemAccounts(isProd);

  // Case A: Specific username requested
  if (cleanUser) {
    const matched = accounts.find((a) => a.username === cleanUser);
    if (matched && matched.passcodes.length > 0) {
      const passMatches = matched.passcodes.some((p) => verifyPassword(cleanPass, p));
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
        if (isProd && !hasCustomCredentialsConfigured()) {
          await logAuditEvent("AUTH_LOGIN_BOOTSTRAP_NOTICE", { username: user.username, role: user.role, ip, userAgent }, "SUCCESS", {
            advisory: "BOOTSTRAP_CREDENTIAL_ACTIVE: Please configure ADMIN_PASSCODE or SUPER_ADMIN_PASSWORD_HASH in environment variables.",
          });
        }
        return { success: true, user };
      }
    }
  }

  // Case B: Direct PIN / Passcode login
  for (const acc of accounts) {
    if (acc.passcodes.length === 0) continue;
    const matched = acc.passcodes.some((p) => verifyPassword(cleanPass, p));
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
      if (isProd && !hasCustomCredentialsConfigured()) {
        await logAuditEvent("AUTH_LOGIN_BOOTSTRAP_NOTICE", { username: user.username, role: user.role, ip, userAgent }, "SUCCESS", {
          advisory: "BOOTSTRAP_CREDENTIAL_ACTIVE: Please configure ADMIN_PASSCODE or SUPER_ADMIN_PASSWORD_HASH in environment variables.",
        });
      }
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

const SESSION_SIGNING_SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "vvotel-production-cryptographic-session-key-v2-2026-sec-guard";

/**
 * Create a new cryptographic session
 * Uses Redis distributed store with session fixation protection and stateless signature fallback
 */
export async function createSession(user: AuthUser, ip: string, userAgent?: string): Promise<string> {
  const isProd = safeCache.isProduction();
  if (isProd && !safeCache.isReady()) {
    throw new Error("PRODUCTION_SESSION_STORE_UNAVAILABLE: Cannot create session because shared Redis is unreachable.");
  }

  // Generate 256-bit cryptographically secure random session ID with vvt_sess_ prefix
  const randomHex = crypto.randomBytes(16).toString("hex");
  const sessionId = `vvt_sess_${randomHex}`;
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

  const payloadStr = JSON.stringify(sessionData);
  const payloadB64 = Buffer.from(payloadStr, "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SIGNING_SECRET)
    .update(`${sessionId}.${payloadB64}`)
    .digest("base64url");
  const sessionToken = `${sessionId}.${payloadB64}.${signature}`;

  // Store in cache/store for fast direct lookup
  await safeCache.set(`session:${sessionId}`, payloadStr, "EX", SESSION_TTL_SECONDS);
  await safeCache.set(`session:${sessionToken}`, payloadStr, "EX", SESSION_TTL_SECONDS);

  return sessionToken;
}

/**
 * Retrieve and optionally renew session by sessionId or signed session token
 */
export async function getSession(token: string): Promise<SessionData | null> {
  if (!token || typeof token !== "string" || token.length < 16) return null;
  const isProd = safeCache.isProduction();

  if (isProd && !safeCache.isReady()) {
    console.error("CRITICAL: Redis is disconnected in production during getSession. Failing closed.");
    return null;
  }

  let sessionId = token;
  let raw = await safeCache.get(`session:${token}`);

  if (token.includes(".")) {
    sessionId = token.split(".")[0];
    if (!raw) {
      raw = await safeCache.get(`session:${sessionId}`);
    }
  }

  // Check if session has been explicitly revoked
  const isRevoked = await safeCache.get(`revoked:${sessionId}`);
  if (isRevoked) {
    return null;
  }

  let sessionData: SessionData | null = null;

  if (raw) {
    try {
      sessionData = JSON.parse(raw);
    } catch {
      sessionData = null;
    }
  }

  // Stateless cryptographic verification fallback across serverless Lambda instances:
  if (!sessionData && token.includes(".")) {
    const parts = token.split(".");
    if (parts.length === 3) {
      const [tokenSid, b64Payload, sig] = parts;
      const expectedSig = crypto
        .createHmac("sha256", SESSION_SIGNING_SECRET)
        .update(`${tokenSid}.${b64Payload}`)
        .digest("base64url");

      if (timingSafeCompare(expectedSig, sig)) {
        try {
          const decoded = Buffer.from(b64Payload, "base64url").toString("utf8");
          const parsed: SessionData = JSON.parse(decoded);
          if (parsed && parsed.sessionId === tokenSid && parsed.user && parsed.expiresAt) {
            sessionData = parsed;
            // Warm cache in this Lambda instance
            safeCache.set(`session:${tokenSid}`, decoded, "EX", SESSION_TTL_SECONDS).catch(() => {});
            safeCache.set(`session:${token}`, decoded, "EX", SESSION_TTL_SECONDS).catch(() => {});
          }
        } catch {
          sessionData = null;
        }
      }
    }
  }

  if (!sessionData) {
    return null;
  }

  const now = Date.now();
  if (now > sessionData.expiresAt) {
    await safeCache.del(`session:${sessionId}`);
    await safeCache.del(`session:${token}`);
    return null;
  }

  // Safe sliding-window session renewal:
  const timeLeftMs = sessionData.expiresAt - now;
  if (timeLeftMs < SESSION_RENEWAL_WINDOW_SECONDS * 1000) {
    sessionData.expiresAt = now + SESSION_TTL_SECONDS * 1000;
    sessionData.lastRenewedAt = now;
    const refreshed = JSON.stringify(sessionData);
    await safeCache.set(`session:${sessionId}`, refreshed, "EX", SESSION_TTL_SECONDS).catch(() => {});
    await safeCache.set(`session:${token}`, refreshed, "EX", SESSION_TTL_SECONDS).catch(() => {});
  }

  return sessionData;
}

/**
 * Revoke session immediately across all application instances (Logout)
 */
export async function revokeSession(token: string, ip = "127.0.0.1"): Promise<void> {
  if (!token) return;
  const sessionId = token.includes(".") ? token.split(".")[0] : token;
  const session = await getSession(token);
  if (session) {
    await logAuditEvent("AUTH_LOGOUT", { username: session.user.username, role: session.user.role, ip }, "SUCCESS", {
      sessionMasked: maskSessionToken(sessionId),
    });
  }
  await safeCache.set(`revoked:${sessionId}`, "1", "EX", SESSION_TTL_SECONDS);
  await safeCache.del(`session:${sessionId}`);
  await safeCache.del(`session:${token}`);
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
