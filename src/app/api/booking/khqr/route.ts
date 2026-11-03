import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, bookingRef, guestName } = await request.json();

    const amt = Number(amount) || 120;
    const riels = Math.round(amt * 4100);
    const qrData = `KHQR://BAKONG.GOV.KH/MERCHANT/VVOTEL_KAMPONGCHAM_HOTEL?amount=${amt}&currency=USD&ref=${bookingRef}`;

    return NextResponse.json({
      success: true,
      bookingRef,
      merchantName: "VVOTEL KAMPONG CHAM HOTEL",
      merchantCity: "KAMPONG CHAM",
      currency: "USD",
      amountUSD: amt.toFixed(2),
      amountKHR: riels.toLocaleString(),
      qrPayload: qrData,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      supportedBanks: [
        { name: "ABA Bank", logo: "ABA", color: "#004a7c" },
        { name: "Bakong", logo: "BAKONG", color: "#d92d27" },
        { name: "ACLEDA Bank", logo: "ACLEDA", color: "#1c3c6d" },
        { name: "Wing Bank", logo: "WING", color: "#8cc63f" },
        { name: "Canadia Bank", logo: "CANADIA", color: "#b91c1c" },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate KHQR" },
      { status: 500 }
    );
  }
}
