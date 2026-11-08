import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sendTelegramBookingAlert } from "./telegram";

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
  paymentMethod: string;
  paymentStatus: "PAID" | "GUARANTEED" | "PENDING" | "PARTIALLY_PAID";
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

import os from "os";

declare global {
  var _vvotelBookingsCache: BookingRecord[] | undefined;
}

const SEED_BOOKINGS_FILE = path.join(process.cwd(), "data", "bookings.json");
const TMP_BOOKINGS_FILE = path.join(os.tmpdir(), "vvotel_bookings.json");

export function getAllBookings(): BookingRecord[] {
  if (globalThis._vvotelBookingsCache && globalThis._vvotelBookingsCache.length > 0) {
    return globalThis._vvotelBookingsCache;
  }

  // 1. Try tmp file
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

  // 1. Write to tmp directory (always writable on Vercel serverless)
  try {
    const tmpDir = path.dirname(TMP_BOOKINGS_FILE);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(TMP_BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write to tmp bookings file:", e);
  }

  // 2. Write to project data/ if writable
  try {
    const dir = path.dirname(SEED_BOOKINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SEED_BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (error) {
    // Normal on Vercel read-only Lambda
  }
}

export function getBookingById(id: string): BookingRecord | null {
  const bookings = getAllBookings();
  return bookings.find((b) => b.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function createBooking(data: Partial<BookingRecord>): Promise<BookingRecord> {
  const bookings = getAllBookings();
  const id = data.id || `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`;

  const nights = Math.max(1, Number(data.nights) || 1);
  const basePrice = Number(data.basePrice) || 125;
  const roomCount = Number(data.roomCount) || 1;
  const breakfastCost = data.includeBreakfast ? Number(data.breakfastCost) || 15 * nights * Number(data.adults || 2) : 0;
  const subtotal = basePrice * nights * roomCount + breakfastCost;
  const discount = Number(data.discount) || 0;
  const totalAmountUSD = Math.max(0, subtotal - discount);
  const totalAmountKHR = Math.round(totalAmountUSD * 4100);

  const txId = data.transactionId || `TXN-SEC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const secretKey = process.env.PAYMENT_SIGNATURE_SECRET || "vvotel-sec-gateway-prod-key-2026";
  const signaturePayload = `${id}:${txId}:${totalAmountUSD.toFixed(2)}:${data.paymentMethod || "KHQR_BAKONG"}`;
  const hmac = crypto.createHmac("sha256", secretKey).update(signaturePayload).digest("hex");

  const newBooking: BookingRecord = {
    id,
    createdAt: new Date().toISOString(),
    bookingCategory: data.bookingCategory || (data.id?.startsWith("DIN") ? "DINING" : "ROOM"),
    guestName: data.guestName || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Sopheap Chan",
    firstName: data.firstName || "Sopheap",
    lastName: data.lastName || "Chan",
    email: data.email || "sopheap.chan@gmail.com",
    phone: data.phone || "+855 12 345 678",
    country: data.country || "Cambodia",
    specialRequests: data.specialRequests || "High floor with Mekong river view",
    roomType: data.roomType || (data.venueId ? "dining-table" : "superior-river"),
    roomNameKm: data.roomNameKm || data.venueNameKm || "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ",
    roomNameEn: data.roomNameEn || data.venueNameEn || "Superior Room River View",
    roomCount,
    roomNumber: data.roomNumber || (data.bookingCategory === "DINING" ? `Table ${Math.floor(1 + Math.random() * 20)}` : `Room ${Math.floor(201 + Math.random() * 29)}`),
    basePrice,
    checkIn: data.checkIn || data.reservationDate || "2026-11-05",
    checkOut: data.checkOut || data.checkIn || "2026-11-08",
    checkInTime: data.checkInTime || data.reservationTime || "14:00 (Check-in from 2:00 PM)",
    checkOutTime: data.checkOutTime || "12:00 (Check-out until 12:00 PM)",
    nights,
    adults: Number(data.adults) || 2,
    children: Number(data.children) || 0,
    includeBreakfast: Boolean(data.includeBreakfast),
    breakfastCost,
    subtotal,
    discount,
    totalAmountUSD,
    totalAmountKHR,
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
}

export function updateBookingStayStatus(
  id: string,
  stayStatus: BookingRecord["stayStatus"],
  roomNumber?: string
): BookingRecord | null {
  const bookings = getAllBookings();
  const index = bookings.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

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
