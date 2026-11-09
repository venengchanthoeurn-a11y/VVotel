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
  | "BOOKING_CREATED"
  | "BOOKING_UPDATED"
  | "BOOKING_STATUS_CHANGED"
  | "BOOKING_DELETED"
  | "SETTINGS_UPDATED"
  | "BACKUP_CREATED"
  | "BACKUP_RESTORED"
  | "REPORT_GENERATED"
  | "SECURITY_RATE_LIMIT"
  | "SECURITY_UNAUTHORIZED_ACCESS";

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
  integrityHash: string;
}

const AUDIT_LOG_TMP_FILE = path.join(os.tmpdir(), "vvotel_audit_logs.json");
const AUDIT_LOG_CACHE_KEY = "vvotel_audit_logs";
const MAX_LOGS = 500;

function computeIntegrityHash(entry: Omit<AuditLogEntry, "integrityHash">): string {
  const secret = process.env.AUDIT_LOG_SECRET || "vvotel-audit-log-tamper-guard-2026";
  const payload = `${entry.id}|${entry.timestamp}|${entry.eventType}|${entry.actor.ip}|${entry.status}|${JSON.stringify(entry.details)}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function logAuditEvent(
  eventType: AuditEventType,
  actor: { username?: string; role?: string; ip: string; userAgent?: string },
  status: "SUCCESS" | "FAILURE" | "DENIED",
  details: Record<string, any> = {},
  resource?: string
): Promise<AuditLogEntry> {
  const id = `AUDIT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex")}`;
  const timestamp = new Date().toISOString();

  const partial: Omit<AuditLogEntry, "integrityHash"> = {
    id,
    timestamp,
    eventType,
    actor,
    resource,
    status,
    details,
  };

  const entry: AuditLogEntry = {
    ...partial,
    integrityHash: computeIntegrityHash(partial),
  };

  try {
    // 1. Read existing logs from cache
    let logs = await getAuditLogs(MAX_LOGS);
    logs.unshift(entry);
    if (logs.length > MAX_LOGS) logs = logs.slice(0, MAX_LOGS);

    // 2. Persist to cache (Redis / Memory)
    await safeCache.set(AUDIT_LOG_CACHE_KEY, JSON.stringify(logs), "EX", 86400 * 30);

    // 3. Persist to tmp file for resilience
    try {
      fs.writeFileSync(AUDIT_LOG_TMP_FILE, JSON.stringify(logs), "utf-8");
    } catch {}
  } catch (err) {
    console.warn("Could not persist audit log entry:", err);
  }

  return entry;
}

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
