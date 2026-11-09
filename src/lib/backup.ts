import fs from "fs";
import path from "path";
import { SiteSettings } from "./settings";
import { BookingRecord, getAllBookings, saveAllBookings } from "./bookings";
import {
  BackupStats,
  BackupSnapshot,
  computeBackupStats,
  createBackupSnapshot,
} from "./backupTypes";
import { getSiteSettings, saveSiteSettings } from "./settings-server";

import os from "os";
import { safeCache } from "./redis";
import {
  encryptBackupSnapshot,
  decryptBackupSnapshot,
  EncryptedBackupEnvelope,
  verifyBackupEnvelopeIntegrity,
} from "./backupCrypto";

export type { BackupStats, BackupSnapshot, EncryptedBackupEnvelope };
export {
  computeBackupStats,
  createBackupSnapshot,
  encryptBackupSnapshot,
  decryptBackupSnapshot,
  verifyBackupEnvelopeIntegrity,
};

const BACKUP_DIR = path.join(process.cwd(), "data", "backups");
const TMP_BACKUP_DIR = path.join(os.tmpdir(), "vvotel_backups");
const LATEST_BACKUP_PATH = path.join(process.cwd(), "data", "backup_latest.json");
const TMP_LATEST_BACKUP_PATH = path.join(os.tmpdir(), "vvotel_backup_latest.json");
const REDIS_LATEST_BACKUP_KEY = "vvotel_backup_latest";

/**
 * Server-side: Save snapshot to file system and Redis store
 */
export function saveSnapshotToDisk(snapshot: BackupSnapshot): boolean {
  const serialized = JSON.stringify(snapshot, null, 2);

  // 1. Persist to Redis (distributed primary)
  safeCache.set(REDIS_LATEST_BACKUP_KEY, serialized).catch(() => {});
  safeCache.set(`vvotel_backup:${snapshot.id}`, serialized, "EX", 86400 * 30).catch(() => {});

  // 2. Try writing to process.cwd() data/backups (development / persistent FS)
  let wroteDisk = false;
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const snapshotFile = path.join(BACKUP_DIR, `${snapshot.id}.json`);
    fs.writeFileSync(snapshotFile, serialized, "utf-8");
    fs.writeFileSync(LATEST_BACKUP_PATH, serialized, "utf-8");
    wroteDisk = true;
  } catch (err) {
    // Expected on Vercel read-only Lambda
  }

  // 3. Writable fallback in /tmp for Serverless Lambdas
  try {
    if (!fs.existsSync(TMP_BACKUP_DIR)) {
      fs.mkdirSync(TMP_BACKUP_DIR, { recursive: true });
    }
    const tmpFile = path.join(TMP_BACKUP_DIR, `${snapshot.id}.json`);
    fs.writeFileSync(tmpFile, serialized, "utf-8");
    fs.writeFileSync(TMP_LATEST_BACKUP_PATH, serialized, "utf-8");
    wroteDisk = true;
  } catch (err) {
    console.warn("Failed to write snapshot to tmp backup dir:", err);
  }

  return wroteDisk;
}

/**
 * Server-side: Get all backup snapshots from disk
 */
export function getSnapshotsFromDisk(): BackupSnapshot[] {
  try {
    const targetDir = fs.existsSync(BACKUP_DIR) ? BACKUP_DIR : fs.existsSync(TMP_BACKUP_DIR) ? TMP_BACKUP_DIR : null;
    if (!targetDir) {
      return [];
    }

    const files = fs
      .readdirSync(targetDir)
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => b.localeCompare(a));

    const list: BackupSnapshot[] = [];
    for (const f of files.slice(0, 20)) {
      try {
        const raw = fs.readFileSync(path.join(targetDir, f), "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.id && parsed.timestamp) {
          list.push(parsed);
        }
      } catch (e) {}
    }

    return list;
  } catch (err) {
    console.error("Failed to list backup snapshots:", err);
    return [];
  }
}

/**
 * Server-side: Restore snapshot to active site_settings.json and bookings.json
 */
export function restoreSnapshotOnDisk(snapshot: BackupSnapshot): {
  success: boolean;
  message: string;
} {
  try {
    if (!snapshot || !snapshot.settings) {
      return { success: false, message: "Invalid snapshot payload" };
    }

    // 1. Save settings
    saveSiteSettings(snapshot.settings);

    // 2. Save bookings if provided
    if (Array.isArray(snapshot.bookings)) {
      saveAllBookings(snapshot.bookings);
    }

    return {
      success: true,
      message: `ទិន្នន័យត្រូវបានស្ដារជោគជ័យ! បន្ទប់: ${snapshot.stats.roomCount}, ម្ហូប: ${snapshot.stats.diningCount}, ទីតាំង: ${snapshot.stats.destinationCount}, ការកក់: ${snapshot.stats.bookingCount}`,
    };
  } catch (err) {
    console.error("Failed to restore snapshot:", err);
    return { success: false, message: "Error restoring snapshot" };
  }
}
