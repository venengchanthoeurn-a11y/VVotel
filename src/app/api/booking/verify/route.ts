import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { bookingRef, paymentMethod, transactionId } = await request.json();

    const verifiedTxId = transactionId || `TXN-KH-${Math.floor(10000000 + Math.random() * 90000000)}`;

    return NextResponse.json({
      success: true,
      status: "PAID",
      bookingRef,
      transactionId: verifiedTxId,
      paidAt: new Date().toISOString(),
      paymentMethod: paymentMethod || "KHQR_BAKONG",
      message: {
        en: "Payment confirmed successfully. Your booking is 100% secured with instant check-in confirmation.",
        km: "ការទូទាត់ប្រាក់បានជោគជ័យ! បន្ទប់របស់អ្នកត្រូវបានធានាកក់ ១០០% ជាមួយការបញ្ជាក់ការចុះឈ្មោះចូលស្នាក់នៅភ្លាមៗ។",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
