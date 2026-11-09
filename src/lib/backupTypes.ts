import { SiteSettings, DEFAULT_SETTINGS } from "./settings";
import { BookingRecord } from "./bookings";

export interface BackupStats {
  roomCount: number;
  diningCount: number;
  destinationCount: number;
  bookingCount: number;
  totalRevenueUSD: number;
}

export interface BackupSnapshot {
  id: string;
  version: string;
  timestamp: string;
  reason: "auto_change" | "interval" | "manual" | "pre_restore" | "init";
  title: string;
  notes?: string;
  settings: SiteSettings;
  bookings: BookingRecord[];
  stats: BackupStats;
}

export function computeBackupStats(
  settings: SiteSettings,
  bookings: BookingRecord[]
): BackupStats {
  const roomCount = Array.isArray(settings?.rooms) ? settings.rooms.length : 0;
  const diningCount = Array.isArray(settings?.dining) ? settings.dining.length : 0;
  const destinationCount = Array.isArray(settings?.destinations)
    ? settings.destinations.length
    : 0;
  const bookingCount = Array.isArray(bookings) ? bookings.length : 0;
  const totalRevenueUSD = Array.isArray(bookings)
    ? bookings.reduce((sum, b) => sum + (Number(b.totalAmountUSD) || 0), 0)
    : 0;

  return {
    roomCount,
    diningCount,
    destinationCount,
    bookingCount,
    totalRevenueUSD,
  };
}

export function createBackupSnapshot(
  settings: SiteSettings,
  bookings: BookingRecord[],
  reason: "auto_change" | "interval" | "manual" | "pre_restore" | "init" = "manual",
  title?: string,
  notes?: string
): BackupSnapshot {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateTag = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const id = `backup_${dateTag}_${randomSuffix}`;

  const reasonLabels: Record<string, string> = {
    auto_change: "ស្វ័យប្រវត្តពេលកែប្រែទិន្នន័យ (Auto on Update)",
    interval: "ស្វ័យប្រវត្តតាមកាលកំណត់ (Auto Periodic Interval)",
    manual: "បង្កើតដោយអ្នកគ្រប់គ្រង (Manual Manager Snapshot)",
    pre_restore: "Snapshot ការពារមុនពេលស្ដារ (Pre-Restore Safety Snapshot)",
    init: "បង្កើតដំបូងពេលបើកប្រព័ន្ធ (System Initialization)",
  };

  const snapshotTitle =
    title || reasonLabels[reason] || "ការបម្រុងទុកទិន្នន័យប្រព័ន្ធ VVotel";

  return {
    id,
    version: "2.1.0",
    timestamp: now.toISOString(),
    reason,
    title: snapshotTitle,
    notes,
    settings: JSON.parse(JSON.stringify(settings || DEFAULT_SETTINGS)),
    bookings: JSON.parse(JSON.stringify(bookings || [])),
    stats: computeBackupStats(settings, bookings),
  };
}
