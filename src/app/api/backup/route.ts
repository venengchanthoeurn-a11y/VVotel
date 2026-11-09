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
import { verifyAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/auditLog";
import { getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Enforce authentication for system backup retrieval and downloading
  const auth = await verifyAuth(request, "backup:read");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

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
        const currentSettings = getSiteSettings();
        const currentBookings = getAllBookings();
        snapshot = createBackupSnapshot(
          currentSettings,
          currentBookings,
          "manual",
          "ការទាញយក Backup ពេញលេញដោយផ្ទាល់ (Live Database Export)"
        );
      }

      const ip = getClientIp(request);
      await logAuditEvent(
        "BACKUP_CREATED",
        { username: auth.user?.username, role: auth.user?.role, ip },
        "SUCCESS",
        { action: "download", snapshotId: snapshot.id }
      );

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
  const ip = getClientIp(request);

  try {
    const body = await request.json();
    const action = body.action || "create";

    if (action === "create") {
      // Require backup:create permission (Manager, Admin, Super Admin)
      const auth = await verifyAuth(request, "backup:create");
      if (!auth.authorized) {
        return auth.errorResponse!;
      }

      const { settings, bookings, reason, title, notes } = body;
      const snapshot = createBackupSnapshot(
        settings || getSiteSettings(),
        bookings || getAllBookings(),
        reason || "auto_change",
        title,
        notes
      );

      saveSnapshotToDisk(snapshot);

      await logAuditEvent(
        "BACKUP_CREATED",
        { username: auth.user?.username, role: auth.user?.role, ip },
        "SUCCESS",
        { snapshotId: snapshot.id, reason: snapshot.reason, title: snapshot.title }
      );

      return NextResponse.json({
        success: true,
        message: "បានបង្កើត និងរក្សាទុក Backup ដោយជោគជ័យ!",
        snapshot,
      });
    }

    if (action === "restore") {
      // System restore is a highly privileged operation: requires backup:restore (Super Admin only)
      const auth = await verifyAuth(request, "backup:restore");
      if (!auth.authorized) {
        return auth.errorResponse!;
      }

      // Control C requirement: Restore operations strictly restricted to SUPER_ADMIN role
      if (auth.user?.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: "SUPERADMIN_ROLE_REQUIRED",
            message: "Disaster recovery restore is strictly restricted to authorized Super Administrators.",
          },
          { status: 403 }
        );
      }

      const snapshot: BackupSnapshot = body.snapshot;
      if (!snapshot || !snapshot.settings) {
        return NextResponse.json(
          { success: false, error: "Invalid snapshot data" },
          { status: 400 }
        );
      }

      // Control C requirement: High-water mark protection prevents overwriting newer records with stale backup
      const currentBookings = getAllBookings();
      const newestExistingDate = currentBookings.reduce((max, b) => {
        const t = new Date(b.createdAt).getTime();
        return t > max ? t : max;
      }, 0);

      const snapshotDate = snapshot.timestamp ? new Date(snapshot.timestamp).getTime() : 0;
      if (newestExistingDate > 0 && snapshotDate < newestExistingDate && !body.forceOlderSnapshot) {
        return NextResponse.json(
          {
            success: false,
            error: "STALE_SNAPSHOT_OVERWRITE_PREVENTED",
            message:
              "High-water mark protection: Snapshot is older than the newest existing database records. To prevent data loss, set forceOlderSnapshot: true if this rollback is intentional.",
            newestExistingRecordDate: new Date(newestExistingDate).toISOString(),
            snapshotDate: snapshot.timestamp,
          },
          { status: 409 }
        );
      }

      // Safety: Create pre-restore snapshot first before overwriting
      const currentSettings = getSiteSettings();
      const preRestoreSnapshot = createBackupSnapshot(
        currentSettings,
        currentBookings,
        "pre_restore",
        "ការបម្រុងទុកការពារមុនពេលស្ដារ (Pre-Restore Safety)"
      );
      saveSnapshotToDisk(preRestoreSnapshot);

      const restoreResult = restoreSnapshotOnDisk(snapshot);

      await logAuditEvent(
        "BACKUP_RESTORED",
        { username: auth.user?.username, role: auth.user?.role, ip },
        "SUCCESS",
        {
          restoredSnapshotId: snapshot.id,
          roomsCount: snapshot.stats?.roomCount,
          bookingsCount: snapshot.stats?.bookingCount,
        }
      );

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
