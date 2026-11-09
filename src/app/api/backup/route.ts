import { NextRequest, NextResponse } from "next/server";
import {
  createBackupSnapshot,
  saveSnapshotToDisk,
  getSnapshotsFromDisk,
  restoreSnapshotOnDisk,
  BackupSnapshot,
} from "@/lib/backup";
import { getSiteSettings } from "@/lib/settings-server";
import { getAllBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "latest";

    if (action === "list") {
      const list = getSnapshotsFromDisk();
      return NextResponse.json({ success: true, snapshots: list });
    }

    if (action === "download") {
      const id = searchParams.get("id");
      let snapshot: BackupSnapshot | null = null;

      if (id) {
        const list = getSnapshotsFromDisk();
        snapshot = list.find((s) => s.id === id) || null;
      }

      if (!snapshot) {
        // Fallback: create fresh live snapshot of current system
        const currentSettings = getSiteSettings();
        const currentBookings = getAllBookings();
        snapshot = createBackupSnapshot(
          currentSettings,
          currentBookings,
          "manual",
          "ការទាញយក Backup ពេញលេញដោយផ្ទាល់ (Live Database Export)"
        );
      }

      const filename = `VVotel_Backup_${snapshot.id}.json`;
      return new NextResponse(JSON.stringify(snapshot, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    // Default: return live system snapshot JSON
    const settings = getSiteSettings();
    const bookings = getAllBookings();
    const liveSnapshot = createBackupSnapshot(
      settings,
      bookings,
      "interval",
      "Live Current System Snapshot"
    );

    return NextResponse.json({
      success: true,
      snapshot: liveSnapshot,
    });
  } catch (err: any) {
    console.error("Backup GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process backup request" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || "create";

    if (action === "create") {
      const { settings, bookings, reason, title, notes } = body;
      const snapshot = createBackupSnapshot(
        settings || getSiteSettings(),
        bookings || getAllBookings(),
        reason || "auto_change",
        title,
        notes
      );

      saveSnapshotToDisk(snapshot);

      return NextResponse.json({
        success: true,
        message: "បានបង្កើត និងរក្សាទុក Backup ដោយជោគជ័យ!",
        snapshot,
      });
    }

    if (action === "restore") {
      const snapshot: BackupSnapshot = body.snapshot;
      if (!snapshot || !snapshot.settings) {
        return NextResponse.json(
          { success: false, error: "Invalid snapshot data" },
          { status: 400 }
        );
      }

      // Safety: Create pre-restore snapshot first before overwriting
      const currentSettings = getSiteSettings();
      const currentBookings = getAllBookings();
      const preRestoreSnapshot = createBackupSnapshot(
        currentSettings,
        currentBookings,
        "pre_restore",
        "ការបម្រុងទុកការពារមុនពេលស្ដារ (Pre-Restore Safety)"
      );
      saveSnapshotToDisk(preRestoreSnapshot);

      const restoreResult = restoreSnapshotOnDisk(snapshot);

      return NextResponse.json({
        success: restoreResult.success,
        message: restoreResult.message,
        restoredSnapshot: snapshot,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown backup action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Backup POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
