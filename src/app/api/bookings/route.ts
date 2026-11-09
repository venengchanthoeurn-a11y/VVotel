import { NextResponse } from "next/server";
import { getAllBookings, getAllBookingsAsync, createBooking } from "@/lib/bookings";
import { verifyAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/auditLog";
import { getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Enforce server-side authorization: Staff or higher required to access guest booking records
  const auth = await verifyAuth(request, "bookings:read");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query")?.toLowerCase();

    let bookings = await getAllBookingsAsync();

    if (status && status !== "ALL") {
      bookings = bookings.filter((b) => b.stayStatus === status || b.paymentStatus === status);
    }

    if (query) {
      bookings = bookings.filter(
        (b) =>
          b.id.toLowerCase().includes(query) ||
          b.guestName.toLowerCase().includes(query) ||
          b.phone.includes(query) ||
          b.email.toLowerCase().includes(query) ||
          (b.roomNumber && b.roomNumber.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await verifyAuth(request, "bookings:create");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const ip = getClientIp(request);

  try {
    const data = await request.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid booking data" },
        { status: 400 }
      );
    }

    const newBooking = await createBooking(data);

    await logAuditEvent(
      "BOOKING_CREATED",
      { username: auth.user?.username, role: auth.user?.role, ip },
      "SUCCESS",
      { bookingId: newBooking.id, guestName: newBooking.guestName, totalAmountUSD: newBooking.totalAmountUSD }
    );

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
