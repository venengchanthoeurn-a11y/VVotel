import { NextResponse } from "next/server";
import { createBooking } from "@/lib/bookings";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      venueId,
      venueNameKm,
      venueNameEn,
      resDate,
      resTime,
      guestCount,
      guestName,
      guestPhone,
      guestEmail,
      specialRequests,
    } = body;

    const ref = `DIN-KC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newDiningReservation = await createBooking({
      id: ref,
      bookingCategory: "DINING",
      guestName: guestName || "Dining Guest",
      phone: guestPhone || "+855 12 345 678",
      email: guestEmail || "dining@vvotel.com",
      country: "Cambodia",
      specialRequests: specialRequests || "Window table with Mekong River view",
      roomType: venueId || "dining-table",
      roomNameKm: venueNameKm || "តុអាហារប្រណីត",
      roomNameEn: venueNameEn || "Dining Table",
      venueId,
      venueNameKm,
      venueNameEn,
      reservationDate: resDate || new Date().toISOString().split("T")[0],
      reservationTime: resTime || "19:00",
      checkIn: resDate || new Date().toISOString().split("T")[0],
      checkOut: resDate || new Date().toISOString().split("T")[0],
      checkInTime: resTime || "19:00",
      checkOutTime: "",
      nights: 0,
      adults: Number(guestCount) || 2,
      children: 0,
      roomCount: 1,
      roomNumber: `Table ${Math.floor(1 + Math.random() * 20)}`,
      basePrice: 0,
      totalAmountUSD: 0,
      totalAmountKHR: 0,
      paymentMethod: "RESERVE_TABLE",
      paymentStatus: "GUARANTEED",
      stayStatus: "CONFIRMED",
    });

    return NextResponse.json({
      success: true,
      booking: newDiningReservation,
      message: "Dining reservation created and Telegram alert dispatched successfully",
    });
  } catch (error) {
    console.error("Failed to process dining reservation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reserve dining table" },
      { status: 500 }
    );
  }
}
