import { NextResponse } from "next/server";
import { verifyPayWayWebhook, PayWayCallbackPayload } from "@/lib/payway";
import { getBookingByIdAsync, updateBookingPaymentStatus } from "@/lib/bookings";
import { safeCache } from "@/lib/redis";
import { logAuditEvent } from "@/lib/auditLog";
import { getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const payload: PayWayCallbackPayload = await request.json().catch(() => ({}));
    if (!payload || !payload.tran_id) {
      return NextResponse.json({ status: -1, description: "Invalid callback payload" }, { status: 400 });
    }

    // 1. Webhook Signature Validation (HMAC-SHA512)
    const isValidSignature = verifyPayWayWebhook(payload);
    if (!isValidSignature) {
      await logAuditEvent("SECURITY_INTEGRITY_ALERT", { ip }, "DENIED", {
        reason: "ABA_PAYWAY_INVALID_WEBHOOK_SIGNATURE",
        tran_id: payload.tran_id,
      });
      return NextResponse.json({ status: -2, description: "Invalid webhook signature" }, { status: 403 });
    }

    // 2. Locate matching authoritative booking
    const booking = await getBookingByIdAsync(payload.tran_id);
    if (!booking) {
      return NextResponse.json({ status: -3, description: "Booking reference not found" }, { status: 404 });
    }

    // 3. Amount & Currency Matching
    const callbackAmount = parseFloat(payload.amount);
    const expectedAmount = booking.totalAmountUSD;
    if (Math.abs(callbackAmount - expectedAmount) > 0.01 || payload.currency !== "USD") {
      await logAuditEvent("SECURITY_INTEGRITY_ALERT", { ip }, "DENIED", {
        reason: "PAYMENT_AMOUNT_MISMATCH",
        callbackAmount,
        expectedAmount,
        currency: payload.currency,
      });
      return NextResponse.json({ status: -4, description: "Amount or currency mismatch" }, { status: 400 });
    }

    // 4. Transaction Replay Protection
    const replayClaimed = await safeCache.setNX(`payment_txn:${payload.tran_id}`, booking.id, 86400 * 90);
    if (!replayClaimed) {
      // Idempotent: Already processed
      return NextResponse.json({ status: 0, description: "Already processed" });
    }

    // 5. Update Payment State Machine
    if (payload.status === 0) {
      updateBookingPaymentStatus(booking.id, "PAID", payload.tran_id);

      await logAuditEvent("BOOKING_STATUS_CHANGED", { ip, username: "ABA_PAYWAY_WEBHOOK" }, "SUCCESS", {
        bookingId: booking.id,
        paymentStatus: "PAID",
        provider: "ABA_PAYWAY",
        amountUSD: callbackAmount,
        approvalCode: payload.apv,
      });
    }

    return NextResponse.json({ status: 0, description: "OK" });
  } catch (err: any) {
    console.error("ABA PayWay webhook error:", err);
    return NextResponse.json({ status: -5, description: "Internal server error" }, { status: 500 });
  }
}
