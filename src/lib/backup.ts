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

export type { BackupStats, BackupSnapshot };
export { computeBackupStats, createBackupSnapshot };

const BACKUP_DIR = path.join(process.cwd(), "data", "backups");
const LATEST_BACKUP_PATH = path.join(process.cwd(), "data", "backup_latest.json");

/**
 * Server-side: Save snapshot to file system
 */
export function saveSnapshotToDisk(snapshot: BackupSnapshot): boolean {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Save specific snapshot file
    const snapshotFile = path.join(BACKUP_DIR, `${snapshot.id}.json`);
    const serialized = JSON.stringify(snapshot, null, 2);
    fs.writeFileSync(snapshotFile, serialized, "utf-8");

    // Also update backup_latest.json
    fs.writeFileSync(LATEST_BACKUP_PATH, serialized, "utf-8");

    // Maintain max 30 snapshots on server disk to avoid runaway storage
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 30) {
      files.slice(30).forEach((f) => {
        try {
          fs.unlinkSync(path.join(BACKUP_DIR, f.name));
        } catch (e) {}
      });
    }

    return true;
  } catch (err) {
    console.error("Failed to save backup snapshot to disk:", err);
    return false;
  }
}

/**
 * Server-side: Get all backup snapshots from disk
 */
export function getSnapshotsFromDisk(): BackupSnapshot[] {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }

    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => b.localeCompare(a));

    const list: BackupSnapshot[] = [];
    for (const f of files.slice(0, 20)) {
      try {
        const raw = fs.readFileSync(path.join(BACKUP_DIR, f), "utf-8");
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
