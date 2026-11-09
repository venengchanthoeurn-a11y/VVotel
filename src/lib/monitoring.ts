import { logAuditEvent, AuditEventType } from "./auditLog";
import { getSiteSettings } from "./settings-server";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface SecurityAlert {
  alertId: string;
  severity: AlertSeverity;
  category:
    | "SUSPICIOUS_LOGIN_ATTEMPTS"
    | "PAYMENT_TAMPERING_OR_FAILURE"
    | "DATABASE_CONNECTION_FAILURE"
    | "BACKUP_SYSTEM_FAILURE"
    | "AUDIT_LOG_TAMPER_DETECTED"
    | "RATE_LIMIT_BURST_ATTACK";
  title: string;
  details: Record<string, any>;
  actorIp?: string;
  timestamp: string;
}

/**
 * Dispatch real-time security alerts to management channel and audit ledger
 */
export async function dispatchSecurityAlert(alert: Omit<SecurityAlert, "alertId" | "timestamp">): Promise<SecurityAlert> {
  const fullAlert: SecurityAlert = {
    ...alert,
    alertId: `SEC-ALT-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
  };

  // 1. Record in tamper-evident audit ledger
  const auditType: AuditEventType =
    alert.severity === "CRITICAL"
      ? "SECURITY_INTEGRITY_ALERT"
      : alert.category === "SUSPICIOUS_LOGIN_ATTEMPTS"
      ? "AUTH_LOCKOUT"
      : "SECURITY_UNAUTHORIZED_ACCESS";

  await logAuditEvent(
    auditType,
    { ip: alert.actorIp || "127.0.0.1", username: "SECURITY_MONITOR" },
    alert.severity === "CRITICAL" ? "DENIED" : "FAILURE",
    {
      category: alert.category,
      title: alert.title,
      severity: alert.severity,
      ...alert.details,
    }
  );

  // 2. Dispatch real-time Telegram notification if configured
  try {
    const settings = getSiteSettings();
    const botToken = process.env.TELEGRAM_BOT_TOKEN || settings.telegramBotToken;
    const chatId = process.env.TELEGRAM_CHAT_ID || settings.telegramAdminChatId;

    if (botToken && chatId) {
      const emoji = alert.severity === "CRITICAL" ? "🚨" : alert.severity === "WARNING" ? "⚠️" : "ℹ️";
      const messageText = [
        `${emoji} *[VVOTEL SECURITY ALERT – ${alert.severity}]*`,
        `*Category:* \`${alert.category}\``,
        `*Incident:* ${alert.title}`,
        `*IP Address:* \`${alert.actorIp || "N/A"}\``,
        `*Time:* \`${fullAlert.timestamp}\``,
        `*Details:* \`\`\`json\n${JSON.stringify(alert.details, null, 2).slice(0, 400)}\n\`\`\``,
      ].join("\n");

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "Markdown",
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("Failed to dispatch real-time Telegram security alert:", err);
  }

  return fullAlert;
}

/**
 * Standard Operational Incident Response Protocols
 */
export const INCIDENT_RESPONSE_PLAYBOOK = {
  SUSPICIOUS_LOGIN_BURST: {
    protocol: "IR-01: Account Lockout & Credential Revocation",
    actions: [
      "1. Automated sliding-window IP lockout enforced (15 minutes).",
      "2. Immediate revocation of all active sessions for targeted username.",
      "3. Front Desk & IT notification dispatched via Telegram.",
      "4. Mandatory MFA challenge required upon next login attempt.",
    ],
  },
  PAYMENT_REPLAY_OR_AMOUNT_TAMPER: {
    protocol: "IR-02: Financial Transaction Rejection & Audit Lock",
    actions: [
      "1. Immediate HTTP 409/400 rejection; transaction marked VOID/FAILED.",
      "2. Claimed transaction ID locked in Redis ledger (90 days).",
      "3. Booking stays in PENDING state; room inventory reservation is held pending review.",
      "4. General Manager notified with transaction hash and attempted amount.",
    ],
  },
  DATABASE_DESYNC_OR_OUTAGE: {
    protocol: "IR-03: Failover to Distributed Redis & Snapshot Recovery",
    actions: [
      "1. Application automatically routes reads/writes to Redis primary replica.",
      "2. Read-only filesystem alerts logged without crashing Lambda execution.",
      "3. Trigger AES-256-GCM encrypted backup restore from vvotel_backup_latest if needed.",
    ],
  },
};
