import { NextResponse } from "next/server";
import { getAllBookings, createBooking } from "@/lib/bookings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query")?.toLowerCase();

    let bookings = getAllBookings();

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
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newBooking = await createBooking(data);
    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
