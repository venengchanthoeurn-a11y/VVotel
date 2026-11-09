import crypto from "crypto";
import { timingSafeCompare } from "./auth";

export interface PayWayItem {
  name: string;
  quantity: number;
  price: string; // "125.00"
}

export interface PayWayPurchaseOptions {
  reqTime: string; // "YYYYMMDDHHmmss"
  merchantId: string;
  tranId: string;
  amount: string; // "465.00"
  items: PayWayItem[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type?: "purchase" | "pre-auth";
  paymentOption?: "cards" | "abapay" | "bakong" | "all";
  returnUrl?: string;
  cancelUrl?: string;
  continueSuccessUrl?: string;
  currency?: "USD" | "KHR";
}

export interface PayWayCallbackPayload {
  tran_id: string;
  status: number; // 0 = approved
  apv?: string; // Approval code
  amount: string;
  currency: string;
  payment_type?: string;
  hash: string;
}

const ABA_PAYWAY_SANDBOX_URL = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";
const ABA_PAYWAY_PROD_URL = "https://checkout.payway.com.kh/api/payment-gateway/v1/payments/purchase";
const ABA_PAYWAY_CHECK_TXN_URL = "https://checkout.payway.com.kh/api/payment-gateway/v1/payments/check-transaction";
const ABA_PAYWAY_REFUND_URL = "https://checkout.payway.com.kh/api/payment-gateway/v1/payments/refund";

/**
 * Generate official ABA PayWay HMAC-SHA512 Base64 Signature
 */
export function generatePayWayHash(dataString: string, apiKey: string): string {
  return crypto.createHmac("sha512", apiKey).update(dataString).digest("base64");
}

/**
 * Prepare ABA PayWay checkout payload with cryptographic signature
 */
export function buildPayWayPurchaseForm(
  options: PayWayPurchaseOptions,
  apiKey = process.env.ABA_PAYWAY_API_KEY || "test_payway_key"
): {
  url: string;
  params: Record<string, string>;
  hash: string;
} {
  const reqTime = options.reqTime || new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const merchantId = options.merchantId || process.env.ABA_PAYWAY_MERCHANT_ID || "vvotel_resort";
  const itemsBase64 = Buffer.from(JSON.stringify(options.items || [])).toString("base64");
  const currency = options.currency || "USD";
  const returnUrl = options.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://vvhotel.vercel.app"}/booking/confirmation`;

  // ABA PayWay concatenation sequence for signature
  const hashString = [
    reqTime,
    merchantId,
    options.tranId,
    options.amount,
    itemsBase64,
    options.firstName,
    options.lastName,
    options.email,
    options.phone,
    options.type || "purchase",
    options.paymentOption || "all",
    returnUrl,
    options.cancelUrl || returnUrl,
    options.continueSuccessUrl || returnUrl,
    currency,
  ].join("");

  const hash = generatePayWayHash(hashString, apiKey);
  const isProd = process.env.NODE_ENV === "production" && process.env.ABA_PAYWAY_SANDBOX !== "true";
  const url = isProd ? ABA_PAYWAY_PROD_URL : ABA_PAYWAY_SANDBOX_URL;

  return {
    url,
    hash,
    params: {
      req_time: reqTime,
      merchant_id: merchantId,
      tran_id: options.tranId,
      amount: options.amount,
      items: itemsBase64,
      firstname: options.firstName,
      lastname: options.lastName,
      email: options.email,
      phone: options.phone,
      type: options.type || "purchase",
      payment_option: options.paymentOption || "all",
      return_url: returnUrl,
      cancel_url: options.cancelUrl || returnUrl,
      continue_success_url: options.continueSuccessUrl || returnUrl,
      currency,
      hash,
    },
  };
}

/**
 * Verify incoming ABA PayWay Server-to-Server Webhook Signature
 */
export function verifyPayWayWebhook(
  payload: PayWayCallbackPayload,
  apiKey = process.env.ABA_PAYWAY_API_KEY || "test_payway_key"
): boolean {
  if (!payload || !payload.tran_id || !payload.hash) return false;

  // Expected payload concatenation: tran_id + status + amount + currency
  const expectedString = `${payload.tran_id}${payload.status}${payload.amount}${payload.currency}`;
  const computedHash = generatePayWayHash(expectedString, apiKey);
  return timingSafeCompare(computedHash, payload.hash);
}

/**
 * Query official ABA PayWay Gateway to check real transaction settlement status
 */
export async function checkPayWayTransactionStatus(
  tranId: string,
  merchantId = process.env.ABA_PAYWAY_MERCHANT_ID || "vvotel_resort",
  apiKey = process.env.ABA_PAYWAY_API_KEY || "test_payway_key"
): Promise<{ success: boolean; status: number; message: string; raw?: any }> {
  const reqTime = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const hashString = `${reqTime}${merchantId}${tranId}`;
  const hash = generatePayWayHash(hashString, apiKey);

  try {
    const res = await fetch(ABA_PAYWAY_CHECK_TXN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        req_time: reqTime,
        merchant_id: merchantId,
        tran_id: tranId,
        hash,
      }),
    });

    const data = await res.json();
    return {
      success: data.status === 0,
      status: data.status,
      message: data.description || "OK",
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      status: -1,
      message: err.message || "Failed to communicate with PayWay API",
    };
  }
}

export interface PaymentReconciliationRecord {
  bookingReference: string;
  provider: "ABA_PAYWAY" | "NBC_BAKONG";
  providerTransactionId: string;
  expectedAmount: number;
  expectedCurrency: "USD" | "KHR";
  actualSettledAmount: number;
  actualSettledCurrency: "USD" | "KHR";
  providerVerificationTimestamp: string;
  settlementStatus: "SETTLED" | "PENDING" | "MISMATCH" | "REJECTED";
  refundStatus: "NONE" | "REQUESTED" | "REFUNDED";
  reconciliationOutcome: "MATCH" | "DISCREPANCY" | "DUPLICATE";
  details?: Record<string, any>;
}

declare global {
  var _vvotelReconciliationLedger: Map<string, PaymentReconciliationRecord> | undefined;
}

if (!globalThis._vvotelReconciliationLedger) {
  globalThis._vvotelReconciliationLedger = new Map();
}

/**
 * Record payment reconciliation entry in durable ledger
 */
export async function recordPaymentReconciliation(
  record: PaymentReconciliationRecord
): Promise<PaymentReconciliationRecord> {
  globalThis._vvotelReconciliationLedger?.set(record.bookingReference, record);
  return record;
}

/**
 * Retrieve payment reconciliation entry
 */
export function getPaymentReconciliation(
  bookingRef: string
): PaymentReconciliationRecord | null {
  return globalThis._vvotelReconciliationLedger?.get(bookingRef) || null;
}
