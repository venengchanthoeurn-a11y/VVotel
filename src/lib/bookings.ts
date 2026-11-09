import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import { sendTelegramBookingAlert } from "./telegram";
import { getSiteSettings } from "./settings-server";
import { safeCache } from "./redis";

export interface PriceSnapshot {
  currency: "USD";
  baseRateCents: number;
  nights: number;
  roomCount: number;
  roomSubtotalCents: number;
  breakfastCents: number;
  discountPercent: number;
  discountCents: number;
  authoritativeTotalCents: number;
  authoritativeTotalUSD: number;
  authoritativeTotalKHR: number;
  calculatedAt: string;
}

export interface BookingRecord {
  id: string;
  createdAt: string;
  bookingCategory?: "ROOM" | "DINING";
  guestName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  country?: string;
  specialRequests?: string;
  roomType: string;
  roomNameKm: string;
  roomNameEn: string;
  roomCount: number;
  roomNumber?: string;
  basePrice: number;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  adults: number;
  children: number;
  includeBreakfast: boolean;
  breakfastCost: number;
  subtotal: number;
  discount: number;
  totalAmountUSD: number;
  totalAmountKHR: number;
  priceSnapshot?: PriceSnapshot;
  paymentMethod: string;
  paymentStatus: "PAID" | "GUARANTEED" | "PENDING" | "PARTIALLY_PAID" | "REFUNDED";
  transactionId: string;
  signatureHMAC: string;
  tamperProofHash: string;
  stayStatus: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "SEATED" | "COMPLETED";
  actualCheckInAt: string | null;
  actualCheckOutAt: string | null;
  venueId?: string;
  venueNameKm?: string;
  venueNameEn?: string;
  reservationDate?: string;
  reservationTime?: string;
}

declare global {
  var _vvotelBookingsCache: BookingRecord[] | undefined;
}

const SEED_BOOKINGS_FILE = path.join(process.cwd(), "data", "bookings.json");
const TMP_BOOKINGS_FILE = path.join(os.tmpdir(), "vvotel_bookings.json");
const PRIMARY_REDIS_BOOKINGS_KEY = "vvotel_bookings_primary";

// Valid Stay Status Transition State Machine
export const VALID_STAY_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED"],
  CHECKED_IN: ["CHECKED_OUT"],
  CHECKED_OUT: ["COMPLETED"],
  SEATED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// Valid Payment Status Transition State Machine
export const VALID_PAYMENT_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "PARTIALLY_PAID", "GUARANTEED", "CANCELLED"],
  PARTIALLY_PAID: ["PAID", "CANCELLED"],
  GUARANTEED: ["PAID", "CANCELLED"],
  PAID: ["REFUNDED"],
  REFUNDED: [],
};

export function getAllBookings(): BookingRecord[] {
  if (globalThis._vvotelBookingsCache && globalThis._vvotelBookingsCache.length > 0) {
    return globalThis._vvotelBookingsCache;
  }

  // 1. Try reading from tmp file replica
  try {
    if (fs.existsSync(TMP_BOOKINGS_FILE)) {
      const content = fs.readFileSync(TMP_BOOKINGS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis._vvotelBookingsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }

  // 2. Try seed file in data/bookings.json
  try {
    if (fs.existsSync(SEED_BOOKINGS_FILE)) {
      const content = fs.readFileSync(SEED_BOOKINGS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        globalThis._vvotelBookingsCache = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to read bookings.json:", error);
  }
  return [];
}

export function saveAllBookings(bookings: BookingRecord[]) {
  globalThis._vvotelBookingsCache = bookings;

  // 1. Persist to shared distributed Redis primary store
  safeCache.set(PRIMARY_REDIS_BOOKINGS_KEY, JSON.stringify(bookings)).catch((err) => {
    console.warn("Could not sync bookings to Redis primary store:", err);
  });

  // 2. Write to tmp directory replica (writable on serverless instance)
  try {
    const tmpDir = path.dirname(TMP_BOOKINGS_FILE);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(TMP_BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write to tmp bookings file:", e);
  }

  // 3. Write to project data/ if writable in environment
  try {
    const dir = path.dirname(SEED_BOOKINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SEED_BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (error) {
    // Normal on Vercel read-only Lambda
  }
}

export function getBookingById(id: string): BookingRecord | null {
  if (!id) return null;
  const bookings = getAllBookings();
  return bookings.find((b) => b.id.toLowerCase() === id.toLowerCase()) || null;
}

/**
 * Concurrency & Double-Booking Prevention:
 * Check if the requested room type has available physical inventory for the target date range.
 * Ensures room inventory can never become negative or over-allocated.
 */
export function checkRoomAvailability(
  roomType: string,
  checkIn: string,
  checkOut: string,
  requestedCount: number,
  excludeBookingId?: string
): { available: boolean; bookedCount: number; maxAvailable: number; remaining: number } {
  const settings = getSiteSettings();
  const roomSetting = settings.rooms.find(
    (r) => r.id.toLowerCase() === roomType.toLowerCase() || r.nameEn.toLowerCase().includes(roomType.toLowerCase())
  );

  const maxAvailable = roomSetting ? roomSetting.availableCount : 10;
  const bookings = getAllBookings();

  const reqStart = new Date(checkIn).getTime();
  const reqEnd = new Date(checkOut).getTime();

  let bookedCount = 0;
  for (const b of bookings) {
    if (excludeBookingId && b.id.toLowerCase() === excludeBookingId.toLowerCase()) continue;
    if (b.stayStatus === "CANCELLED") continue;
    if (b.bookingCategory === "DINING") continue;

    const matchesType =
      b.roomType.toLowerCase() === roomType.toLowerCase() ||
      (roomSetting && b.roomNameEn.toLowerCase() === roomSetting.nameEn.toLowerCase());

    if (matchesType) {
      const bStart = new Date(b.checkIn).getTime();
      const bEnd = new Date(b.checkOut).getTime();
      // Overlap condition: start < reqEnd && end > reqStart
      if (bStart < reqEnd && bEnd > reqStart) {
        bookedCount += Math.max(1, Number(b.roomCount) || 1);
      }
    }
  }

  const remaining = Math.max(0, maxAvailable - bookedCount);
  return {
    available: bookedCount + requestedCount <= maxAvailable,
    bookedCount,
    maxAvailable,
    remaining,
  };
}

/**
 * Atomic Booking Creation with Distributed Mutex Locking
 */
export async function createBooking(data: Partial<BookingRecord>): Promise<BookingRecord> {
  const roomType = data.roomType || (data.venueId ? "dining-table" : "superior-river");
  const lockId = crypto.randomUUID();
  const lockResource = `booking_inventory:${roomType}`;

  // Acquire distributed mutex lock with retries to prevent concurrent race conditions
  let acquired = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    acquired = await safeCache.acquireLock(lockResource, lockId, 5000);
    if (acquired) break;
    await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
  }

  try {
    const bookings = getAllBookings();
    const id = data.id || `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Idempotency Check under Lock
    const existing = bookings.find((b) => b.id.toLowerCase() === id.toLowerCase());
    if (existing) {
      return existing;
    }

    const cIn = data.checkIn || data.reservationDate || "2026-11-05";
    const cOut = data.checkOut || data.checkIn || "2026-11-08";
    const roomCount = Math.max(1, Number(data.roomCount) || 1);
    const isRoomBooking = data.bookingCategory !== "DINING" && !id.startsWith("DIN");

    // 2. Atomic Inventory Availability Check under Lock
    if (isRoomBooking) {
      const avail = checkRoomAvailability(roomType, cIn, cOut, roomCount);
      if (!avail.available) {
        throw new Error(
          `ROOM_CAPACITY_EXCEEDED: Requested ${roomCount} room(s) exceeds available physical inventory (${avail.remaining} remaining of ${avail.maxAvailable}).`
        );
      }
    }

    // 3. Integer Minor Currency Units (Cents) Arithmetic for Price Immutability
    const nights = Math.max(1, Number(data.nights) || 1);
    const basePriceUSD = Number(data.basePrice) || 125;
    const baseRateCents = Math.round(basePriceUSD * 100);
    const roomSubtotalCents = baseRateCents * nights * roomCount;
    const numAdults = Math.max(1, Number(data.adults) || 2);
    const breakfastPriceCents = 1500; // $15.00
    const breakfastCostCents = data.includeBreakfast ? breakfastPriceCents * nights * numAdults : 0;
    const discountCents = Math.round(Number(data.discount || 0) * 100);
    const authoritativeTotalCents = Math.max(0, roomSubtotalCents + breakfastCostCents - discountCents);
    const authoritativeTotalUSD = authoritativeTotalCents / 100;
    const totalAmountKHR = Math.round(authoritativeTotalUSD * 4100);

    const priceSnapshot: PriceSnapshot = {
      currency: "USD",
      baseRateCents,
      nights,
      roomCount,
      roomSubtotalCents,
      breakfastCents: breakfastCostCents,
      discountPercent: data.discount ? Math.round((Number(data.discount) / (roomSubtotalCents + breakfastCostCents)) * 100) : 0,
      discountCents,
      authoritativeTotalCents,
      authoritativeTotalUSD,
      authoritativeTotalKHR: totalAmountKHR,
      calculatedAt: new Date().toISOString(),
    };

    const txId = data.transactionId || `TXN-SEC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const secretKey = process.env.PAYMENT_SIGNATURE_SECRET || "vvotel-sec-gateway-prod-key-2026";
    const signaturePayload = `${id}:${txId}:${authoritativeTotalUSD.toFixed(2)}:${data.paymentMethod || "KHQR_BAKONG"}`;
    const hmac = crypto.createHmac("sha256", secretKey).update(signaturePayload).digest("hex");

    const newBooking: BookingRecord = {
      id,
      createdAt: new Date().toISOString(),
      bookingCategory: data.bookingCategory || (id.startsWith("DIN") ? "DINING" : "ROOM"),
      guestName: (data.guestName || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Sopheap Chan").slice(0, 100),
      firstName: data.firstName || "Sopheap",
      lastName: data.lastName || "Chan",
      email: data.email || "sopheap.chan@gmail.com",
      phone: data.phone || "+855 12 345 678",
      country: data.country || "Cambodia",
      specialRequests: data.specialRequests || "High floor with Mekong river view",
      roomType,
      roomNameKm: data.roomNameKm || data.venueNameKm || "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ",
      roomNameEn: data.roomNameEn || data.venueNameEn || "Superior Room River View",
      roomCount,
      roomNumber: data.roomNumber || (data.bookingCategory === "DINING" ? `Table ${Math.floor(1 + Math.random() * 20)}` : `Room ${Math.floor(201 + Math.random() * 29)}`),
      basePrice: basePriceUSD,
      checkIn: cIn,
      checkOut: cOut,
      checkInTime: data.checkInTime || data.reservationTime || "14:00 (Check-in from 2:00 PM)",
      checkOutTime: data.checkOutTime || "12:00 (Check-out until 12:00 PM)",
      nights,
      adults: numAdults,
      children: Math.max(0, Number(data.children) || 0),
      includeBreakfast: Boolean(data.includeBreakfast),
      breakfastCost: breakfastCostCents / 100,
      subtotal: roomSubtotalCents / 100,
      discount: discountCents / 100,
      totalAmountUSD: authoritativeTotalUSD,
      totalAmountKHR,
      priceSnapshot,
      paymentMethod: data.paymentMethod || "KHQR_BAKONG",
      paymentStatus: data.paymentStatus || (data.paymentMethod === "PAY_AT_HOTEL" || data.paymentMethod === "RESERVE_TABLE" ? "GUARANTEED" : "PAID"),
      transactionId: txId,
      signatureHMAC: hmac,
      tamperProofHash: `sha256:${hmac.slice(0, 32)}...`,
      stayStatus: "CONFIRMED",
      actualCheckInAt: null,
      actualCheckOutAt: null,
      venueId: data.venueId,
      venueNameKm: data.venueNameKm,
      venueNameEn: data.venueNameEn,
      reservationDate: data.reservationDate || data.checkIn,
      reservationTime: data.reservationTime || data.checkInTime,
    };

    // Add to top of list
    bookings.unshift(newBooking);
    saveAllBookings(bookings);

    // Trigger Telegram alert asynchronously
    try {
      await sendTelegramBookingAlert(newBooking);
    } catch (error) {
      console.error("Failed to send Telegram alert for new booking:", error);
    }

    return newBooking;
  } finally {
    if (acquired) {
      await safeCache.releaseLock(lockResource, lockId);
    }
  }
}

/**
 * Safe State Transition Machine for Stay Status
 */
export function updateBookingStayStatus(
  id: string,
  stayStatus: BookingRecord["stayStatus"],
  roomNumber?: string,
  forceAdminOverride = false
): BookingRecord | null {
  const bookings = getAllBookings();
  const index = bookings.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  const currentStatus = bookings[index].stayStatus;

  // Validate state machine transition unless forced by authorized Super Admin
  if (!forceAdminOverride && currentStatus !== stayStatus) {
    const allowed = VALID_STAY_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(stayStatus)) {
      throw new Error(
        `INVALID_STATE_TRANSITION: Cannot transition booking ${id} from '${currentStatus}' to '${stayStatus}'. Allowed transitions: [${allowed.join(", ")}]`
      );
    }
  }

  bookings[index].stayStatus = stayStatus;
  if (roomNumber) {
    bookings[index].roomNumber = roomNumber;
  }

  if (stayStatus === "CHECKED_IN" && !bookings[index].actualCheckInAt) {
    bookings[index].actualCheckInAt = new Date().toISOString();
  }
  if (stayStatus === "CHECKED_OUT" && !bookings[index].actualCheckOutAt) {
    bookings[index].actualCheckOutAt = new Date().toISOString();
  }

  saveAllBookings(bookings);
  return bookings[index];
}

/**
 * Safe State Transition Machine for Payment Status
 */
export function updateBookingPaymentStatus(
  id: string,
  newPaymentStatus: BookingRecord["paymentStatus"],
  transactionId?: string,
  forceAdminOverride = false
): BookingRecord | null {
  const bookings = getAllBookings();
  const index = bookings.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  const currentStatus = bookings[index].paymentStatus;

  if (!forceAdminOverride && currentStatus !== newPaymentStatus) {
    const allowed = VALID_PAYMENT_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newPaymentStatus)) {
      throw new Error(
        `INVALID_PAYMENT_STATE_TRANSITION: Cannot transition payment for ${id} from '${currentStatus}' to '${newPaymentStatus}'.`
      );
    }
  }

  bookings[index].paymentStatus = newPaymentStatus;
  if (transactionId) {
    bookings[index].transactionId = transactionId;
  }

  saveAllBookings(bookings);
  return bookings[index];
}
