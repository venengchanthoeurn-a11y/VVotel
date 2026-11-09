"use client";

import { SiteSettings } from "./settings";
import { BookingRecord } from "./bookings";
import { BackupSnapshot, computeBackupStats } from "./backupTypes";

const AUTO_BACKUP_HISTORY_KEY = "vvotel_auto_backup_history";
const MAX_LOCAL_SNAPSHOTS = 15;

/**
 * Saves a snapshot to the browser's localStorage history and optionally syncs to server
 */
export function recordClientAutoBackup(
  settings: SiteSettings,
  bookings: BookingRecord[],
  reason: "auto_change" | "interval" | "manual" | "pre_restore" | "init",
  title?: string
): BackupSnapshot {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateTag = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const id = `client_backup_${dateTag}_${randomSuffix}`;

  const reasonLabels: Record<string, string> = {
    auto_change: "ស្វ័យប្រវត្តពេលកែប្រែទិន្នន័យ (Auto on Update)",
    interval: "ស្វ័យប្រវត្តរៀងរាល់ ៥ នាទី (Continuous 5-min Auto Backup)",
    manual: "បង្កើតដោយអ្នកគ្រប់គ្រង (Manual Manager Snapshot)",
    pre_restore: "Snapshot ការពារមុនពេលស្ដារ (Pre-Restore Safety)",
    init: "បង្កើតដំបូងពេលបើកប្រព័ន្ធ (System Initialization)",
  };

  const snapshot: BackupSnapshot = {
    id,
    version: "2.1.0",
    timestamp: now.toISOString(),
    reason,
    title: title || reasonLabels[reason] || "Auto Backup Snapshot",
    settings: JSON.parse(JSON.stringify(settings)),
    bookings: JSON.parse(JSON.stringify(bookings)),
    stats: computeBackupStats(settings, bookings),
  };

  // Save to client localStorage
  if (typeof window !== "undefined") {
    try {
      const existingRaw = localStorage.getItem(AUTO_BACKUP_HISTORY_KEY);
      let list: BackupSnapshot[] = existingRaw ? JSON.parse(existingRaw) : [];
      if (!Array.isArray(list)) list = [];

      // Prepend the new snapshot
      list = [snapshot, ...list].slice(0, MAX_LOCAL_SNAPSHOTS);
      localStorage.setItem(AUTO_BACKUP_HISTORY_KEY, JSON.stringify(list));
      localStorage.setItem("vvotel_last_auto_backup_time", now.toISOString());
    } catch (e) {
      console.warn("Could not save snapshot to localStorage:", e);
    }

    // Background sync to server API
    fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        settings,
        bookings,
        reason,
        title: snapshot.title,
      }),
    }).catch((err) => {
      console.warn("Server backup sync skipped (running offline/serverless):", err);
    });
  }

  return snapshot;
}

/**
 * Get all client-side stored snapshots
 */
export function getClientBackupHistory(): BackupSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUTO_BACKUP_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Download a snapshot as a .json file directly in browser
 */
export function downloadSnapshotJson(snapshot: BackupSnapshot) {
  if (typeof window === "undefined") return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `VVotel_Backup_${snapshot.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
