import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getSiteSettings } from "@/lib/settings-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Rate limiting: 60 inquiries per minute per IP
    const rateCheck = await checkRateLimit(`rate_inquiry:${ip}`, 60, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: "Too many rate inquiries. Please wait." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      checkIn,
      checkOut,
      rooms = 1,
      adults = 2,
      children = 0,
      loyaltyCode,
      promoCode,
      roomType = "Superior River View",
    } = body;

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, message: "Please provide valid check-in and check-out dates" },
        { status: 400 }
      );
    }

    const inTime = new Date(checkIn).getTime();
    const outTime = new Date(checkOut).getTime();
    if (isNaN(inTime) || isNaN(outTime) || outTime <= inTime) {
      return NextResponse.json(
        { success: false, message: "Invalid check-in/check-out dates" },
        { status: 400 }
      );
    }

    const nights = Math.min(90, Math.max(1, Math.ceil((outTime - inTime) / (1000 * 60 * 60 * 24))));
    const settings = getSiteSettings();
    const matchedRoom = settings.rooms.find(
      (r) => r.id.toLowerCase() === roomType.toLowerCase() || r.nameEn.toLowerCase().includes(roomType.toLowerCase())
    );

    const basePricePerNight = matchedRoom ? matchedRoom.basePrice : 120;

    let discountPercent = 0;
    let loyaltyTier = "Standard Guest";

    if (loyaltyCode && loyaltyCode.length >= 10) {
      discountPercent = 15;
      loyaltyTier = "VVotel ALL Platinum Member (15% Off)";
    } else if (promoCode) {
      discountPercent = 10;
      loyaltyTier = "Promo Special (10% Off)";
    }

    const roomQty = Math.max(1, Math.min(10, Number(rooms) || 1));
    const subtotal = basePricePerNight * nights * roomQty;
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;
    const bookingRef = `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      bookingReference: bookingRef,
      hotel: settings.hotelNameEn || "VVotel Kampong Cham Riverside Hotel",
      roomType,
      nights,
      rooms: roomQty,
      guests: { adults: Number(adults) || 2, children: Number(children) || 0 },
      pricing: {
        currency: "USD",
        baseRate: basePricePerNight,
        subtotal,
        discountPercent,
        discountAmount,
        totalEstimated: total,
      },
      benefits: [
        "Best Rate Guaranteed",
        "Complimentary Buffet Breakfast at River View Cafe",
        "Free High-speed Wi-Fi & Sunset Boat Cruise Voucher",
        "Free Cancellation up to 24h prior to arrival",
      ],
      loyaltyStatus: loyaltyTier,
      confirmationMessage: {
        en: `Your reservation inquiry #${bookingRef} has been received. Our concierge team will guarantee your reservation at VVotel Kampong Cham.`,
        km: `សំណើកក់បន្ទប់លេខ #${bookingRef} ត្រូវបានទទួលជោគជ័យ។ ក្រុមការងារសណ្ឋាគារ វីវ៉ូថែល កំពង់ចាម នឹងបញ្ជាក់ការកក់ជូនលោកអ្នកដោយតម្លៃល្អដាច់គេ។`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
