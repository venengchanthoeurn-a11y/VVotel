import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    // Rate calculation
    const basePricePerNight = 120; // USD
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      ) || 1
    );

    let discountPercent = 0;
    let loyaltyTier = "Standard Guest";

    if (loyaltyCode && loyaltyCode.length >= 10) {
      discountPercent = 15;
      loyaltyTier = "VVotel ALL Platinum Member (15% Off)";
    } else if (promoCode) {
      discountPercent = 10;
      loyaltyTier = "Promo Special (10% Off)";
    }

    const subtotal = basePricePerNight * nights * Number(rooms);
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;
    const bookingRef = `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      bookingReference: bookingRef,
      hotel: "VVotel Kampong Cham Riverside Resort",
      roomType,
      nights,
      rooms: Number(rooms),
      guests: { adults: Number(adults), children: Number(children) },
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
