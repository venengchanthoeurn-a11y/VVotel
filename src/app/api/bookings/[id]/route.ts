import { NextResponse } from "next/server";
import { getBookingById, updateBookingStayStatus, getAllBookings, saveAllBookings } from "@/lib/bookings";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
  try {
    const { stayStatus, roomNumber } = await request.json();
    const updated = updateBookingStayStatus(params.id, stayStatus, roomNumber);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookings = getAllBookings();
    const filtered = bookings.filter((b) => b.id.toLowerCase() !== params.id.toLowerCase());
    saveAllBookings(filtered);
    return NextResponse.json({ success: true, message: "Booking removed" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete booking" }, { status: 500 });
  }
}
