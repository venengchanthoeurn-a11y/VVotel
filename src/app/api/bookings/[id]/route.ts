import { NextResponse } from "next/server";
import { getBookingById, updateBookingStayStatus, getAllBookings, saveAllBookings } from "@/lib/bookings";
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
    const { stayStatus, roomNumber } = await request.json();
    const existing = getBookingById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const updated = updateBookingStayStatus(params.id, stayStatus, roomNumber);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Booking update failed" }, { status: 404 });
    }

    await logAuditEvent(
      "BOOKING_STATUS_CHANGED",
      { username: auth.user?.username, role: auth.user?.role, ip },
      "SUCCESS",
      {
        bookingId: params.id,
        previousStatus: existing.stayStatus,
        newStatus: stayStatus,
        roomNumber: roomNumber || existing.roomNumber,
      }
    );

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
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
