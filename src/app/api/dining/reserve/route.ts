import { NextResponse } from "next/server";
import { createBooking } from "@/lib/bookings";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logAuditEvent } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Rate limiting: 20 dining reservations per minute per IP
    const rateCheck = await checkRateLimit(`dining:${ip}`, 20, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: "Too many reservation requests. Please wait." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
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
      guestName: (guestName || "").trim() || "Dining Guest",
      phone: (guestPhone || "").trim() || "+855 12 345 678",
      email: (guestEmail || "").trim() || "dining@vvotel.com",
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
      adults: Math.max(1, Math.min(50, Number(guestCount) || 2)),
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

    await logAuditEvent(
      "BOOKING_CREATED",
      { ip },
      "SUCCESS",
      {
        bookingId: ref,
        category: "DINING",
        venue: venueNameEn || venueId,
        guestCount: newDiningReservation.adults,
      }
    );

    return NextResponse.json({
      success: true,
      booking: newDiningReservation,
      message: "Dining reservation created and Telegram alert dispatched successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create dining reservation" },
      { status: 500 }
    );
  }
}
