import { NextResponse } from "next/server";
import {
  getBookingById,
  updateBookingStayStatus,
  updateBookingPaymentStatus,
  getAllBookings,
  saveAllBookings,
} from "@/lib/bookings";
import { verifyAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/auditLog";
import { getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request, "bookings:read");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const booking = getBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request, "bookings:update");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const ip = getClientIp(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { stayStatus, paymentStatus, roomNumber, force } = body;
    const existing = getBookingById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const isSuperAdmin = auth.user?.role === "SUPER_ADMIN";
    const canForce = isSuperAdmin && Boolean(force);

    let updated = existing;

    if (stayStatus && stayStatus !== existing.stayStatus) {
      const res = updateBookingStayStatus(params.id, stayStatus, roomNumber, canForce);
      if (!res) {
        return NextResponse.json({ success: false, error: "Booking stay status update failed" }, { status: 404 });
      }
      updated = res;
    } else if (roomNumber && roomNumber !== existing.roomNumber) {
      const res = updateBookingStayStatus(params.id, existing.stayStatus, roomNumber, true);
      if (res) updated = res;
    }

    if (paymentStatus && paymentStatus !== existing.paymentStatus) {
      const res = updateBookingPaymentStatus(params.id, paymentStatus, undefined, canForce);
      if (!res) {
        return NextResponse.json({ success: false, error: "Booking payment status update failed" }, { status: 404 });
      }
      updated = res;
    }

    await logAuditEvent(
      "BOOKING_STATUS_CHANGED",
      { username: auth.user?.username, role: auth.user?.role, ip },
      "SUCCESS",
      {
        bookingId: params.id,
        previousStayStatus: existing.stayStatus,
        newStayStatus: updated.stayStatus,
        previousPaymentStatus: existing.paymentStatus,
        newPaymentStatus: updated.paymentStatus,
        roomNumber: roomNumber || existing.roomNumber,
      }
    );

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    const errorMsg = error?.message || "Failed to update booking";
    if (errorMsg.includes("INVALID_STATE_TRANSITION") || errorMsg.includes("INVALID_PAYMENT_STATE_TRANSITION")) {
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Deleting records requires privileged administrator authority
  const auth = await verifyAuth(request, "bookings:delete");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const ip = getClientIp(request);

  try {
    const bookings = getAllBookings();
    const existing = bookings.find((b) => b.id.toLowerCase() === params.id.toLowerCase());
    if (!existing) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const filtered = bookings.filter((b) => b.id.toLowerCase() !== params.id.toLowerCase());
    saveAllBookings(filtered);

    await logAuditEvent(
      "BOOKING_DELETED",
      { username: auth.user?.username, role: auth.user?.role, ip },
      "SUCCESS",
      { bookingId: params.id, guestName: existing.guestName, totalAmountUSD: existing.totalAmountUSD }
    );

    return NextResponse.json({ success: true, message: "Booking removed safely" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete booking" }, { status: 500 });
  }
}
