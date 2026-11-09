import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { safeCache } from "./redis";

export type AuditEventType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "AUTH_LOCKOUT"
  | "AUTH_MFA_CHALLENGE"
  | "BOOKING_CREATED"
  | "BOOKING_UPDATED"
  | "BOOKING_STATUS_CHANGED"
  | "BOOKING_DELETED"
  | "SETTINGS_UPDATED"
  | "BACKUP_CREATED"
  | "BACKUP_RESTORED"
  | "REPORT_GENERATED"
  | "SECURITY_RATE_LIMIT"
  | "SECURITY_UNAUTHORIZED_ACCESS"
  | "SECURITY_INTEGRITY_ALERT";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  actor: {
    username?: string;
    role?: string;
    ip: string;
    userAgent?: string;
  };
  resource?: string;
  status: "SUCCESS" | "FAILURE" | "DENIED";
  details: Record<string, any>;
  previousHash: string;
  integrityHash: string;
}

const AUDIT_LOG_TMP_FILE = path.join(os.tmpdir(), "vvotel_audit_logs.json");
const AUDIT_LOG_CACHE_KEY = "vvotel_audit_logs_v2";
const GENESIS_CHAIN_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
const MAX_LOGS = 1000;

/**
 * Sanitize sensitive fields (passwords, tokens, PANs, CVVs) before logging
 */
export function sanitizeAuditDetails(details: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = new Set([
    "password",
    "passcode",
    "token",
    "secret",
    "session",
    "cookie",
    "cvv",
    "cvc",
    "privatekey",
  ]);

  for (const [key, val] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "cardnumber" || lowerKey === "pan" || lowerKey.includes("card")) {
      sanitized[key] = typeof val === "string" && val.length > 4 ? `****-****-****-${val.slice(-4)}` : "[REDACTED]";
    } else if (sensitiveKeys.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizeAuditDetails(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Compute HMAC-SHA256 hash for a log entry bound to its predecessor (hash chaining)
 */
export function computeChainedHash(
  entry: Omit<AuditLogEntry, "integrityHash">,
  secretKey?: string
): string {
  const secret = secretKey || process.env.AUDIT_LOG_SECRET || "vvotel-audit-log-tamper-guard-2026";
  const payload = [
    entry.id,
    entry.timestamp,
    entry.eventType,
    entry.actor.ip,
    entry.actor.username || "",
    entry.status,
    entry.previousHash,
    JSON.stringify(entry.details),
  ].join("|");

  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Centralized durable audit logger with cryptographic hash-chaining
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  actor: { username?: string; role?: string; ip: string; userAgent?: string },
  status: "SUCCESS" | "FAILURE" | "DENIED",
  details: Record<string, any> = {},
  resource?: string
): Promise<AuditLogEntry> {
  const id = `AUDIT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex")}`;
  const timestamp = new Date().toISOString();
  const cleanDetails = sanitizeAuditDetails(details);

  // 1. Fetch current latest log to chain with its hash
  let existingLogs = await getAuditLogs(MAX_LOGS);
  const previousHash = existingLogs.length > 0 ? existingLogs[0].integrityHash : GENESIS_CHAIN_HASH;

  const partial: Omit<AuditLogEntry, "integrityHash"> = {
    id,
    timestamp,
    eventType,
    actor: {
      username: actor.username,
      role: actor.role,
      ip: actor.ip,
      userAgent: actor.userAgent?.slice(0, 150),
    },
    resource,
    status,
    details: cleanDetails,
    previousHash,
  };

  const entry: AuditLogEntry = {
    ...partial,
    integrityHash: computeChainedHash(partial),
  };

  try {
    existingLogs.unshift(entry);
    if (existingLogs.length > MAX_LOGS) existingLogs = existingLogs.slice(0, MAX_LOGS);

    // 2. Persist to Redis (distributed primary)
    await safeCache.set(AUDIT_LOG_CACHE_KEY, JSON.stringify(existingLogs), "EX", 86400 * 90);

    // 3. Persist local replica
    try {
      fs.writeFileSync(AUDIT_LOG_TMP_FILE, JSON.stringify(existingLogs), "utf-8");
    } catch {}
  } catch (err) {
    console.warn("Could not persist audit log entry:", err);
  }

  return entry;
}

/**
 * Retrieve audit logs from distributed store with local fallback
 */
export async function getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
  try {
    const raw = await safeCache.get(AUDIT_LOG_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, limit);
    }
  } catch {}

  try {
    if (fs.existsSync(AUDIT_LOG_TMP_FILE)) {
      const raw = fs.readFileSync(AUDIT_LOG_TMP_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, limit);
    }
  } catch {}

  return [];
}

/**
 * Cryptographic Hash Chain Verification Function
 * Verifies that no log entries have been altered, injected, or removed
 */
export function verifyAuditLogChain(
  logs: AuditLogEntry[],
  secretKey?: string
): { valid: boolean; totalEntries: number; brokenAtIndex?: number; reason?: string } {
  if (!logs || logs.length === 0) {
    return { valid: true, totalEntries: 0 };
  }

  // Logs are ordered newest-first: logs[0] is newest, logs[N-1] is oldest
  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i];
    const expectedHash = computeChainedHash(entry, secretKey);

    // Check entry self-integrity
    if (entry.integrityHash !== expectedHash) {
      return {
        valid: false,
        totalEntries: logs.length,
        brokenAtIndex: i,
        reason: `Integrity signature mismatch at log index ${i} (${entry.id})`,
      };
    }

    // Check chaining to predecessor (older log entry at i + 1)
    if (i < logs.length - 1) {
      const olderEntry = logs[i + 1];
      if (entry.previousHash !== olderEntry.integrityHash) {
        return {
          valid: false,
          totalEntries: logs.length,
          brokenAtIndex: i,
          reason: `Hash chain broken between entry ${entry.id} and predecessor ${olderEntry.id}`,
        };
      }
    } else {
      // Oldest entry in slice must chain to either genesis or a valid predecessor hash
      if (entry.previousHash.length !== 64) {
        return {
          valid: false,
          totalEntries: logs.length,
          brokenAtIndex: i,
          reason: `Invalid root/genesis hash in oldest entry ${entry.id}`,
        };
      }
    }
  }

  return { valid: true, totalEntries: logs.length };
}
