"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building,
  Calendar,
  Users,
  CreditCard,
  Printer,
  Search,
  RefreshCw,
  Plus,
  Send,
  ExternalLink,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  Home,
  FileSpreadsheet,
  FileText,
  Download,
  BedDouble,
  LogOut,
  LogIn,
  Key,
  X,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Utensils,
  Volume2,
  VolumeX,
  Bell,
  Check,
  MapPin,
  Globe,
  SlidersHorizontal,
  Settings,
} from "lucide-react";
import { BookingRecord } from "@/lib/bookings";
import { PrintableReceipt } from "@/components/PrintableReceipt";
import { AdminSettingsPortal } from "@/components/AdminSettingsPortal";

// Dual Language Translations Dictionary for Admin Portal & Login Screen
const ADMIN_I18N = {
  km: {
    hotelName: "សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម",
    hotelTagline: "សណ្ឋាគារប្រណីតផ្កាយ ៥ មាត់ទន្លេមេគង្គ",
    securityGateTitle: "ផ្ទាំងសុវត្ថិភាពគ្រប់គ្រងសណ្ឋាគារ",
    portalSubtitle: "ប្រព័ន្ធគ្រប់គ្រងការកក់បន្ទប់ តុអាហារ និងភ្ញៀវចូលចេញកណ្តាល",
    securityNotice: "ការចូលប្រើប្រាស់ត្រូវបានការពារ៖ អនុញ្ញាតសម្រាប់តែថ្នាក់ដឹកនាំ និងបុគ្គលិកទទួលភ្ញៀវផ្លូវការប៉ុណ្ណោះ។",
    passcodeLabel: "លេខកូដសម្ងាត់អ្នកគ្រប់គ្រង (Admin Passcode / PIN):",
    passcodePlaceholder: "បញ្ចូលលេខសម្ងាត់ (ឧ. 2052)",
    quickCodeHint: "ចុចជ្រើសលេខកូដរហ័ស:",
    rememberSession: "ចងចាំការចូលប្រើលើឧបករណ៍នេះ (Remember Session)",
    enterAdminBtn: "ចូលផ្ទាំងគ្រប់គ្រង (ENTER ADMIN PMS)",
    backToHome: "ត្រឡប់ទៅកាន់គេហទំព័រ VVotel",
    invalidCodeError: "លេខកូដសម្ងាត់មិនត្រឹមត្រូវឡើយ! ប្រព័ន្ធអនុញ្ញាតសម្រាប់តែអ្នកគ្រប់គ្រង និងបុគ្គលិកសណ្ឋាគារប៉ុណ្ណោះ។",
    liveClockLabel: "ម៉ោងនៅកំពង់ចាម:",
    liveStatus: "ប្រព័ន្ធដំណើរការ ១០០%",
    authorizedManager: "អ្នកគ្រប់គ្រងផ្លូវការ",
    showcaseTitle: "ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារ និងភោជនីយដ្ឋានកណ្តាល",
    showcaseSubtitle: "ALL Accor PMS Central Hub & Telegram Real-Time Alerts",
    feat1Title: "Telegram Bot Real-Time",
    feat1Desc: "Alerts រាល់ការកក់បន្ទប់ និងតុអាហារ",
    feat2Title: "Payment Gateway 3DS",
    feat2Desc: "Bakong KHQR & 3D Secure Card",
    feat3Title: "ALL Accor PMS Sync",
    feat3Desc: "ភ្ជាប់ផ្ទាល់ទៅកាន់ប្រព័ន្ធកណ្តាល",
    feat4Title: "Dual Print Engine",
    feat4Desc: "POS 80mm & A4 Tax Invoice",
    addressLabel: "អាសយដ្ឋាន: អគារលេខ ២០៥២, ផ្លូវព្រះមុនីវង្ស, ភូមិ៧, កំពង់ចាម",
    // Dashboard
    soundOn: "សំឡេង Alert: បើក",
    soundOff: "សំឡេង: បិទ",
    sendTestAlert: "ផ្ញើ Alert ទៅ @vvotel_bot",
    sendingAlert: "កំពុងផ្ញើ...",
    refreshData: "ទាញទិន្នន័យ",
    walkInBtn: "កក់ផ្ទាល់ / Walk-in",
    accorPmsBtn: "ALL Accor PMS",
    homeBtn: "គេហទំព័រដើម",
    logoutBtn: "ចាកចេញ",
    totalBookings: "ការកក់សរុប",
    totalRevenue: "ចំណូលសរុប (USD)",
    roomBookings: "បន្ទប់ស្នាក់នៅ",
    diningBookings: "កក់តុអាហារ",
    inHouseGuests: "កំពុងស្នាក់នៅ/តុ",
    botStatus: "Telegram Bot",
    searchPlaceholder: "ស្វែងរកតាម ឈ្មោះភ្ញៀវ, លេខកូដកក់, លេខទូរស័ព្ទ, លេខបន្ទប់ ឬតុ...",
    tabAll: "ទាំងអស់",
    tabRooms: "🛏️ បន្ទប់",
    tabDining: "🍽️ តុអាហារ",
    statusAll: "គ្រប់ស្ថានភាព",
    statusConfirmed: "បានកក់",
    statusInHouse: "កំពុងស្នាក់នៅ/តុ",
    statusCheckedOut: "បានចេញ/ចប់",
    statusPaid: "បង់រួច",
    dateAll: "គ្រប់កាលបរិច្ឆេទ",
    dateTodayIn: "ចូលថ្ងៃនេះ",
    dateTodayOut: "ចេញថ្ងៃនេះ",
    tableHeading: "តារាងគ្រប់គ្រងការកក់បន្ទប់ និងតុអាហារ",
    thRef: "កូដកក់ / ប្រភេទ",
    thGuest: "ឈ្មោះភ្ញៀវ & ទំនាក់ទំនង",
    thRoomVenue: "បន្ទប់ / ភោជនីយដ្ឋាន",
    thSchedule: "កាលបរិច្ឆេទ & ពេលវេលា",
    thFinance: "ទឹកប្រាក់ & វិធីទូទាត់",
    thStatus: "ស្ថានភាព",
    thAction: "សកម្មភាពគ្រប់គ្រង",
    statusInHouseText: "🛎️ កំពុងស្នាក់នៅ",
    statusSeatedText: "🍽️ កំពុងទទួលទាន",
    statusCheckedOutText: "🚪 បានចេញ",
    statusCompletedText: "🎉 រួចរាល់",
    statusCancelledText: "❌ បានលុបចោល",
    statusConfirmedText: "✅ បានកក់",
    btnCheckIn: "Check-In",
    btnSeat: "ទទួលតុ",
    btnCheckOut: "Check-Out",
    btnComplete: "បញ្ចប់",
    reportsBtn: "📑 របាយការណ៍រដ្ឋបាល",
    reportModalTitle: "ប្រព័ន្ធផលិតរបាយការណ៍រដ្ឋបាលផ្លូវការ",
    reportModalSubtitle: "ទម្រង់រដ្ឋបាលកម្ពុជា • គាំទ្រ Word (.docx), Excel (.xlsx), និង PDF",
    reportWordTitle: "របាយការណ៍រដ្ឋបាល Word (.docx)",
    reportWordDesc: "ក្បាលលិខិតជាតិផ្លូវការ, ពុម្ភអក្សរ Khmer Mool & Siemreap, តារាងទិន្នន័យ, និងប្រអប់ហត្ថលេខា/ត្រា។",
    reportExcelTitle: "របាយការណ៍ទិន្នន័យ Excel (.xlsx)",
    reportExcelDesc: "បញ្ជីការកក់ពេញលេញ, រូបមន្តផលបូកចំណូលស្វ័យប្រវត្តិ, បំប្លែងរូបិយប័ណ្ណ $ និង ៛, រចនាប័ទ្មពណ៌រដ្ឋបាល។",
    reportPdfTitle: "របាយការណ៍បោះពុម្ព PDF ផ្លូវការ",
    reportPdfDesc: "ទម្រង់ក្រដាស A4 រដ្ឋបាលពេញលេញ, មានក្បាលលិខិតរដ្ឋបាល, អាចបើកមើល និងបោះពុម្ព Save as PDF បានភ្លាមៗ។",
    viewPrintPdfBtn: "មើល & បោះពុម្ពជា PDF",
  },
  en: {
    hotelName: "Vattanac Hotel (VVotel) Kampong Cham",
    hotelTagline: "Five-Star Luxury Riverfront Hotel",
    securityGateTitle: "Hotel PMS Security Gate",
    portalSubtitle: "Centralized Reservation, Dining & Guest Management System",
    securityNotice: "Protected Area: Authorized for General Manager and official Front Desk personnel only.",
    passcodeLabel: "Manager Passcode / PIN:",
    passcodePlaceholder: "Enter Passcode (e.g. 2052)",
    quickCodeHint: "Quick PIN selection:",
    rememberSession: "Remember session on this device",
    enterAdminBtn: "ENTER ADMIN PMS",
    backToHome: "Return to VVotel Website",
    invalidCodeError: "Invalid security passcode! Access is restricted to authorized hotel staff only.",
    liveClockLabel: "Kampong Cham Time:",
    liveStatus: "System Live 100%",
    authorizedManager: "Authorized Manager",
    showcaseTitle: "Central Hotel & Dining Management System",
    showcaseSubtitle: "ALL Accor PMS Central Hub & Telegram Real-Time Alerts",
    feat1Title: "Telegram Bot Real-Time",
    feat1Desc: "Instant alerts for room and table bookings",
    feat2Title: "3D Secure Payment Gateway",
    feat2Desc: "Bakong KHQR & 3DS Verified Cards",
    feat3Title: "ALL Accor PMS Sync",
    feat3Desc: "Direct integration with central system",
    feat4Title: "Dual Print Engine",
    feat4Desc: "POS 80mm & Official A4 Tax Invoice",
    addressLabel: "Address: No. 2052, Preah Monivong St., Phum 7, Kampong Cham City",
    // Dashboard
    soundOn: "Alert Sound: ON",
    soundOff: "Alert Sound: OFF",
    sendTestAlert: "Send Test Alert to @vvotel_bot",
    sendingAlert: "Sending...",
    refreshData: "Refresh",
    walkInBtn: "+ Walk-in / Booking",
    accorPmsBtn: "ALL Accor PMS",
    homeBtn: "Public Website",
    logoutBtn: "Sign Out",
    totalBookings: "Total Bookings",
    totalRevenue: "Total Revenue (USD)",
    roomBookings: "Room Stays",
    diningBookings: "Dining & Tables",
    inHouseGuests: "In-House / Seated",
    botStatus: "Telegram Bot",
    searchPlaceholder: "Search guest name, ref code, phone, room, or table...",
    tabAll: "All",
    tabRooms: "🛏️ Rooms",
    tabDining: "🍽️ Dining",
    statusAll: "All Status",
    statusConfirmed: "Confirmed",
    statusInHouse: "In-House / Seated",
    statusCheckedOut: "Checked Out",
    statusPaid: "Paid",
    dateAll: "All Dates",
    dateTodayIn: "Today Check-In",
    dateTodayOut: "Today Check-Out",
    tableHeading: "Room & Dining Reservation Master Table",
    thRef: "Ref / Category",
    thGuest: "Guest & Contact",
    thRoomVenue: "Room / Restaurant",
    thSchedule: "Schedule & Dates",
    thFinance: "Amount & Gateway",
    thStatus: "Status",
    thAction: "Actions",
    statusInHouseText: "🛎️ In-House",
    statusSeatedText: "🍽️ Seated",
    statusCheckedOutText: "🚪 Checked Out",
    statusCompletedText: "🎉 Completed",
    statusCancelledText: "❌ Cancelled",
    statusConfirmedText: "✅ Confirmed",
    btnCheckIn: "Check-In",
    btnSeat: "Seat Table",
    btnCheckOut: "Check-Out",
    btnComplete: "Complete",
    reportsBtn: "📑 Administrative Reports",
    reportModalTitle: "Official Administrative Reporting Suite",
    reportModalSubtitle: "Cambodian Administrative Format • Word (.docx), Excel (.xlsx), and PDF",
    reportWordTitle: "Official Word Report (.docx)",
    reportWordDesc: "National Kingdom header, Khmer Mool & Siemreap typography, full data tables & official stamp blocks.",
    reportExcelTitle: "Executive Excel Spreadsheet (.xlsx)",
    reportExcelDesc: "Complete transaction registry, automated revenue formulas, dual currency ($ & ៛) & executive styling.",
    reportPdfTitle: "Official A4 Printable PDF",
    reportPdfDesc: "Standard administrative paper layout with ministerial headers, print-ready and direct PDF export.",
    viewPrintPdfBtn: "View & Print Official PDF",
  },
};

// Harmonic Web Audio Chime for Real-Time Booking Alerts
function playHotelChime() {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(659.25, 0, 0.35); // E5
    playTone(830.61, 0.16, 0.55); // G#5
  } catch (e) {
    console.warn("Audio chime not available:", e);
  }
}

export default function AdminPage() {
  // Language State
  const [lang, setLang] = useState<"km" | "en">("km");
  const t = ADMIN_I18N[lang];

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [rememberLogin, setRememberLogin] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Live Clock State
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  // Sound alert toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Real-time Booking Alert Banner State
  const [newBookingAlert, setNewBookingAlert] = useState<{
    id: string;
    guestName: string;
    category: "ROOM" | "DINING";
    title: string;
  } | null>(null);

  // Bookings Data State
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL"); // ALL, ROOM, DINING
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [currentAdminTab, setCurrentAdminTab] = useState<"dashboard" | "settings">("dashboard");

  // Tracking
  const knownBookingIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef<boolean>(false);

  // Telegram test alert state
  const [telegramStatus, setTelegramStatus] = useState<{
    loading: boolean;
    message?: string;
    success?: boolean;
  }>({ loading: false });

  // Printable receipt state
  const [receiptBooking, setReceiptBooking] = useState<BookingRecord | null>(null);
  const [receiptOpen, setReceiptOpen] = useState<boolean>(false);
  const [receiptMode, setReceiptMode] = useState<"pos-80mm" | "a4-invoice">("pos-80mm");

  // Check-in modal state
  const [checkInModalBooking, setCheckInModalBooking] = useState<BookingRecord | null>(null);
  const [assignedRoomNumber, setAssignedRoomNumber] = useState<string>("");

  // New Walk-in Booking modal state
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [newBookingData, setNewBookingData] = useState({
    bookingCategory: "ROOM" as "ROOM" | "DINING",
    guestName: "",
    phone: "",
    email: "",
    roomType: "superior-river",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    reservationTime: "19:00",
    adults: 2,
    children: 0,
    includeBreakfast: true,
    totalAmountUSD: 125,
    paymentMethod: "PAY_AT_HOTEL",
    roomNumber: "201",
  });

  // Load language preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("vvotel_admin_lang") as "km" | "en" | null;
      if (savedLang === "km" || savedLang === "en") {
        setLang(savedLang);
      }
    }
  }, []);

  const switchLanguage = (newLang: "km" | "en") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("vvotel_admin_lang", newLang);
    }
  };

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("en-GB", {
          timeZone: "Asia/Phnom_Penh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " (GMT+7)"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Verify stored session on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("vvotel_admin_token");
      if (storedToken === "authorized_manager_2052") {
        setIsAuthenticated(true);
      }
      setIsCheckingAuth(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError("");

    const clean = passcode.trim();
    if (
      clean === "2052" ||
      clean === "vvotel2026" ||
      clean === "admin2052" ||
      clean === "vvotel@admin"
    ) {
      setIsAuthenticated(true);
      if (rememberLogin && typeof window !== "undefined") {
        localStorage.setItem("vvotel_admin_token", "authorized_manager_2052");
      }
      fetchBookings(true);
    } else {
      setPasscodeError(t.invalidCodeError);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vvotel_admin_token");
    }
    setIsAuthenticated(false);
    setPasscode("");
  };

  // Fetch Bookings with Real-Time Alert detection
  const fetchBookings = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      const data = await res.json();
      let serverList: BookingRecord[] = [];
      if (data.success && Array.isArray(data.bookings)) {
        serverList = data.bookings;
      }

      // Merge with client-side recorded bookings
      let localList: BookingRecord[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("vvotel_client_bookings");
          if (raw) localList = JSON.parse(raw);
        } catch (e) {}
      }

      const map = new Map<string, BookingRecord>();
      for (const b of localList) map.set(b.id, b);
      for (const b of serverList) {
        if (!map.has(b.id)) map.set(b.id, b);
      }
      const fetchedList = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Detect new bookings if not initial load
      if (initialLoadDoneRef.current && !isInitial) {
        const fresh = fetchedList.find((b) => !knownBookingIdsRef.current.has(b.id));
        if (fresh) {
          const isDin = fresh.bookingCategory === "DINING" || fresh.id.startsWith("DIN");
          setNewBookingAlert({
            id: fresh.id,
            guestName: fresh.guestName,
            category: isDin ? "DINING" : "ROOM",
            title: isDin
              ? fresh.roomNameKm || "តុអាហារប្រណីត"
              : fresh.roomNameKm || fresh.roomNameEn || "បន្ទប់ស្នាក់នៅ",
          });
          if (soundEnabled) {
            playHotelChime();
          }
        }
      }

      // Update tracking ref
      knownBookingIdsRef.current = new Set(fetchedList.map((b) => b.id));
      setBookings(fetchedList);
      initialLoadDoneRef.current = true;
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Polling loop for real-time updates every 5 seconds + Event Listener
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBookings(true);

    const pollInterval = setInterval(() => {
      fetchBookings(false);
    }, 5000);

    const handleBookingEvent = () => {
      fetchBookings(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("vvotel-booking-updated", handleBookingEvent);
    }

    return () => {
      clearInterval(pollInterval);
      if (typeof window !== "undefined") {
        window.removeEventListener("vvotel-booking-updated", handleBookingEvent);
      }
    };
  }, [isAuthenticated, soundEnabled]);

  // Send Telegram test alert to @vvotel_bot
  const handleTestTelegram = async () => {
    setTelegramStatus({ loading: true });
    try {
      const res = await fetch("/api/telegram/test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTelegramStatus({
          loading: false,
          success: true,
          message: data.message || (lang === "km" ? "បានផ្ញើ Alert ទៅកាន់ @vvotel_bot រួចរាល់!" : "Alert sent to @vvotel_bot!"),
        });
      } else {
        setTelegramStatus({
          loading: false,
          success: false,
          message: data.error || "Failed to contact Telegram API",
        });
      }
    } catch {
      setTelegramStatus({
        loading: false,
        success: false,
        message: "Network Error: Cannot reach Telegram",
      });
    }

    setTimeout(() => {
      setTelegramStatus({ loading: false });
    }, 6000);
  };

  // Perform Check-in or Seat Dining Guest
  const handleConfirmCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInModalBooking) return;

    try {
      const isDin = checkInModalBooking.bookingCategory === "DINING" || checkInModalBooking.id.startsWith("DIN");
      const nextStatus = isDin ? "SEATED" : "CHECKED_IN";
      const res = await fetch(`/api/bookings/${checkInModalBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayStatus: nextStatus,
          roomNumber: assignedRoomNumber || checkInModalBooking.roomNumber || (isDin ? "Table 1" : "101"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Also update local storage cache
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("vvotel_client_bookings");
            if (raw) {
              const list: BookingRecord[] = JSON.parse(raw);
              const idx = list.findIndex((b) => b.id === checkInModalBooking.id);
              if (idx !== -1) {
                list[idx].stayStatus = nextStatus;
                list[idx].roomNumber = assignedRoomNumber || list[idx].roomNumber;
                localStorage.setItem("vvotel_client_bookings", JSON.stringify(list));
              }
            }
          } catch (e) {}
        }
        setCheckInModalBooking(null);
        setAssignedRoomNumber("");
        await fetchBookings(false);
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Perform Check-out or Complete Dining
  const handleCheckOut = async (id: string, isDining = false) => {
    const confirmMsg = isDining
      ? (lang === "km" ? "តើអ្នកពិតជាចង់បញ្ចប់ការទទួលទានមែនទេ?" : "Confirm complete dining order?")
      : (lang === "km" ? "តើអ្នកពិតជាចង់ Check-out ភ្ញៀវនេះមែនទេ? (ម៉ោង Check-out: 12:00)" : "Confirm check-out this guest?");
    if (!confirm(confirmMsg)) return;

    try {
      const nextStatus = isDining ? "COMPLETED" : "CHECKED_OUT";
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayStatus: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("vvotel_client_bookings");
            if (raw) {
              const list: BookingRecord[] = JSON.parse(raw);
              const idx = list.findIndex((b) => b.id === id);
              if (idx !== -1) {
                list[idx].stayStatus = nextStatus;
                localStorage.setItem("vvotel_client_bookings", JSON.stringify(list));
              }
            }
          } catch (e) {}
        }
        await fetchBookings(false);
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Create Walk-in Booking
  const handleCreateWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isDin = newBookingData.bookingCategory === "DINING";

      if (isDin) {
        const res = await fetch("/api/dining/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId: "mekong-breeze",
            venueNameKm: "ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស",
            venueNameEn: "Mekong Breeze Restaurant",
            resDate: newBookingData.checkIn,
            resTime: newBookingData.reservationTime,
            guestCount: newBookingData.adults,
            guestName: newBookingData.guestName,
            guestPhone: newBookingData.phone,
            specialRequests: "Walk-in Dining Order (Admin Created)",
          }),
        });
        const data = await res.json();
        if (data.success && data.booking) {
          if (typeof window !== "undefined") {
            try {
              const raw = localStorage.getItem("vvotel_client_bookings");
              const list = raw ? JSON.parse(raw) : [];
              list.unshift(data.booking);
              localStorage.setItem("vvotel_client_bookings", JSON.stringify(list));
            } catch (e) {}
          }
          setIsNewBookingModalOpen(false);
          await fetchBookings(false);
        }
      } else {
        const roomCatalogMap: Record<string, { km: string; en: string }> = {
          "standard-city": {
            km: "បន្ទប់ស្តង់ដារ ទេសភាពទីក្រុង",
            en: "Standard Room City View",
          },
          "superior-river": {
            km: "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ",
            en: "Superior Room River View",
          },
          "executive-suite": {
            km: "បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ (១ បន្ទប់គេង)",
            en: "Executive Mekong Suite (1 Bedroom)",
          },
          "royal-family-suite": {
            km: "បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ (២ បន្ទប់គេង)",
            en: "Royal Family River Suite (2 Bedroom)",
          },
        };

        const roomInfo = roomCatalogMap[newBookingData.roomType] || roomCatalogMap["superior-river"];
        const nights = Math.max(
          1,
          Math.ceil(
            (new Date(newBookingData.checkOut).getTime() - new Date(newBookingData.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          ) || 1
        );

        const res = await fetch("/api/booking/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestName: newBookingData.guestName,
            phone: newBookingData.phone,
            email: newBookingData.email,
            roomType: newBookingData.roomType,
            roomNameKm: roomInfo.km,
            roomNameEn: roomInfo.en,
            checkIn: newBookingData.checkIn,
            checkOut: newBookingData.checkOut,
            nights,
            adults: newBookingData.adults,
            children: newBookingData.children,
            includeBreakfast: newBookingData.includeBreakfast,
            amountUSD: newBookingData.totalAmountUSD,
            paymentMethod: newBookingData.paymentMethod,
          }),
        });

        const data = await res.json();
        if (data.success && data.booking) {
          if (typeof window !== "undefined") {
            try {
              const raw = localStorage.getItem("vvotel_client_bookings");
              const list = raw ? JSON.parse(raw) : [];
              list.unshift(data.booking);
              localStorage.setItem("vvotel_client_bookings", JSON.stringify(list));
            } catch (e) {}
          }
          setIsNewBookingModalOpen(false);
          await fetchBookings(false);
          setReceiptBooking(data.booking);
          setReceiptOpen(true);
        }
      }
    } catch (err) {
      alert("Error creating booking");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      "ID",
      "Category",
      "Guest Name",
      "Phone",
      "Email",
      "Room/Table",
      "Unit Number",
      "Check-In/Date",
      "Check-Out/Time",
      "Nights",
      "Guests (Pax)",
      "Total USD",
      "Total KHR",
      "Payment Method",
      "Payment Status",
      "Status",
      "Created At",
    ];

    const rows = bookings.map((b) => [
      b.id,
      b.bookingCategory || (b.id.startsWith("DIN") ? "DINING" : "ROOM"),
      `"${b.guestName}"`,
      `"${b.phone}"`,
      `"${b.email}"`,
      `"${b.roomNameEn || b.roomType}"`,
      `"${b.roomNumber || "Unassigned"}"`,
      b.checkIn,
      b.checkOut,
      b.nights,
      b.adults,
      b.totalAmountUSD,
      b.totalAmountKHR,
      b.paymentMethod,
      b.paymentStatus,
      b.stayStatus,
      b.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `VVotel_PMS_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const roomBookings = bookings.filter(
    (b) => b.bookingCategory !== "DINING" && !b.id.startsWith("DIN")
  );
  const diningBookings = bookings.filter(
    (b) => b.bookingCategory === "DINING" || b.id.startsWith("DIN")
  );

  const totalRevenueUSD = bookings
    .filter((b) => b.paymentStatus === "PAID" || b.paymentStatus === "GUARANTEED")
    .reduce((acc, b) => acc + (b.totalAmountUSD || 0), 0);
  const totalRevenueKHR = totalRevenueUSD * 4100;

  const inHouseGuests = bookings.filter(
    (b) => b.stayStatus === "CHECKED_IN" || b.stayStatus === "SEATED"
  );

  // Filtering
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const isDin = b.bookingCategory === "DINING" || b.id.startsWith("DIN");

    const matchesCategory =
      categoryFilter === "ALL" ||
      (categoryFilter === "ROOM" && !isDin) ||
      (categoryFilter === "DINING" && isDin);

    const matchesSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.roomNumber && b.roomNumber.toLowerCase().includes(q));

    const matchesStatus =
      selectedStatus === "ALL" ||
      b.stayStatus === selectedStatus ||
      b.paymentStatus === selectedStatus ||
      (selectedStatus === "IN_HOUSE" && (b.stayStatus === "CHECKED_IN" || b.stayStatus === "SEATED"));

    const matchesDate =
      dateFilter === "ALL" ||
      (dateFilter === "TODAY_IN" && b.checkIn === todayStr) ||
      (dateFilter === "TODAY_OUT" && b.checkOut === todayStr);

    return matchesCategory && matchesSearch && matchesStatus && matchesDate;
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 font-siemreap">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0c2340] border-2 border-amber-300 flex items-center justify-center text-amber-300 font-mool text-2xl shadow-lg animate-pulse">
            V
          </div>
          <span className="text-sm font-semibold text-gray-600">កំពុងផ្ទៀងផ្ទាត់សិទ្ធិគ្រប់គ្រង...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: EXECUTIVE SECURITY GATE / LOGIN PORTAL
  // Exactly 50% / 50% Equal Split Layout on Desktop & Auto-size responsive
  // Using Khmer Mool for main titles, Khmer OS Siemreap for body, with Language Switcher!
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF7F2] font-siemreap antialiased overflow-x-hidden">
        {/* Left Information Panel: EXACTLY 50% (w-full lg:w-1/2) */}
        <div className="w-full lg:w-1/2 min-h-[480px] lg:min-h-screen relative p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between overflow-hidden bg-[#0c2340] text-white shadow-2xl">
          {/* Subtle Ambient Golden Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-700/25 via-[#0c2340] to-[#061424] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#12335e] to-[#0c2340] border-2 border-amber-300/80 flex items-center justify-center text-amber-300 font-mool text-3xl shadow-xl shadow-amber-950/20 shrink-0">
                V
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 block font-siemreap">
                  {t.hotelTagline}
                </span>
                <h1 className="text-xl sm:text-2xl font-mool text-white tracking-normal mt-0.5">
                  {t.hotelName}
                </h1>
                <p className="text-xs text-amber-100/70 font-siemreap mt-0.5">
                  {t.portalSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Center Showcase Details */}
          <div className="relative z-10 py-8 lg:py-6 space-y-5 max-w-2xl w-full">
            {/* Live Cambodia Clock Card */}
            <div className="inline-flex items-center space-x-2.5 bg-white/10 backdrop-blur-md border border-amber-300/30 px-4 py-2 rounded-2xl text-xs text-amber-200 font-siemreap">
              <Clock className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t.liveClockLabel} <strong>{currentTimeStr || "Loading..."}</strong></span>
            </div>

            <div className="w-full overflow-visible py-1">
              <h2
                className="text-xs sm:text-sm md:text-[15px] lg:text-[17px] xl:text-[20px] 2xl:text-[22px] font-mool text-white tracking-normal whitespace-nowrap overflow-visible leading-[2.3] py-2.5 block select-none"
                title={t.showcaseTitle}
              >
                {t.showcaseTitle}
              </h2>
              <p className="text-amber-300 font-serif italic text-xs sm:text-sm md:text-base mt-0.5 font-normal tracking-wide whitespace-nowrap overflow-visible">
                {t.showcaseSubtitle}
              </p>
            </div>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-siemreap">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start space-x-3 backdrop-blur-sm">
                <Send className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">{t.feat1Title}</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">{t.feat1Desc}</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start space-x-3 backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">{t.feat2Title}</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">{t.feat2Desc}</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start space-x-3 backdrop-blur-sm">
                <Building className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">{t.feat3Title}</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">{t.feat3Desc}</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start space-x-3 backdrop-blur-sm">
                <Printer className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">{t.feat4Title}</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">{t.feat4Desc}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-gray-300 gap-2 font-siemreap">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-bold">{t.liveStatus}</span>
            </span>
            <span>{t.addressLabel}</span>
          </div>
        </div>

        {/* Right Login Panel: EXACTLY 50% (w-full lg:w-1/2) with Language Switcher */}
        <div className="w-full lg:w-1/2 min-h-screen p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between items-center bg-[#FAF7F2]">
          {/* Top Bar with Language Switcher */}
          <div className="w-full max-w-lg flex items-center justify-between pb-4">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-siemreap">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.authorizedManager}</span>
            </div>

            {/* Language Switcher Buttons */}
            <div className="bg-white border border-amber-200/90 rounded-xl p-1 flex items-center space-x-1 shadow-sm font-siemreap text-xs">
              <button
                type="button"
                onClick={() => switchLanguage("km")}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                  lang === "km"
                    ? "bg-[#0c2340] text-amber-300 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>🇰🇭 ខ្មែរ (KM)</span>
              </button>
              <button
                type="button"
                onClick={() => switchLanguage("en")}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                  lang === "en"
                    ? "bg-[#0c2340] text-amber-300 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>🇬🇧 English (EN)</span>
              </button>
            </div>
          </div>

          {/* Center Login Card: Beautifully proportioned with Khmer Mool & Siemreap */}
          <div className="w-full max-w-lg bg-white border border-amber-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-amber-950/5 relative overflow-hidden font-siemreap my-auto">
            {/* Top Decorative Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            {/* Header */}
            <div className="text-center space-y-2.5 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-[#0c2340] border-2 border-amber-300 flex items-center justify-center text-amber-300 font-mool text-2xl shadow-md mx-auto">
                V
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block font-siemreap">
                VVotel Executive Security Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-mool text-[#0c2340] tracking-normal">
                {t.securityGateTitle}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-siemreap">
                {t.securityNotice}
              </p>
            </div>

            {/* Error Message */}
            {passcodeError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-xs text-red-700 font-bold animate-in fade-in font-siemreap">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="mt-6 space-y-4 font-siemreap">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {t.passcodeLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPasscode ? "text" : "password"}
                    required
                    autoFocus
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (passcodeError) setPasscodeError("");
                    }}
                    placeholder={t.passcodePlaceholder}
                    className="w-full bg-[#FAF8F4] border border-amber-200 rounded-2xl pl-10 pr-11 py-3.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white transition shadow-inner"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 top-4 text-gray-400 hover:text-gray-700 transition"
                    title={showPasscode ? "Hide" : "Show"}
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Quick Fill Passcode Buttons */}
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2.5">
                  <span className="text-[11px] text-gray-500">{t.quickCodeHint}</span>
                  <div className="flex items-center space-x-1.5 font-mono">
                    <button
                      type="button"
                      onClick={() => setPasscode("2052")}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition shadow-2xs"
                    >
                      PIN: 2052
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasscode("vvotel2026")}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-lg text-[11px] font-bold transition shadow-2xs"
                    >
                      vvotel2026
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberLogin"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="rememberLogin" className="text-xs text-gray-600 cursor-pointer select-none">
                  {t.rememberSession}
                </label>
              </div>

              {/* Enter Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm py-3.5 px-4 rounded-2xl shadow-md shadow-amber-900/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.enterAdminBtn}</span>
              </button>
            </form>

            {/* Back to Home Link */}
            <div className="mt-6 pt-4 border-t border-amber-100 text-center">
              <Link
                href="/"
                className="text-xs text-gray-500 hover:text-amber-800 font-bold transition inline-flex items-center space-x-1 font-siemreap"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t.backToHome}</span>
              </Link>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="w-full max-w-lg text-center pt-4 text-[11px] text-gray-400 font-siemreap">
            © 2026 Vattanac Hotel (VVotel) Kampong Cham • ALL Accor PMS Sync
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED LUXURY PMS DASHBOARD
  // Full fluid width, Khmer Mool headings, Khmer OS Siemreap body & Language Switcher!
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-gray-900 flex flex-col font-siemreap antialiased overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 xl:px-12 py-3 shadow-sm">
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Live Clock */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0c2340] border border-amber-300 flex items-center justify-center text-amber-300 font-mool text-xl shadow-sm shrink-0">
              V
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-mool text-base sm:text-lg text-[#0c2340] tracking-normal">
                  VVotel PMS Admin Portal
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-siemreap">
                  Live System
                </span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-siemreap">
                  {t.authorizedManager}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 flex items-center space-x-2 mt-0.5 font-siemreap">
                <span>{t.hotelName}</span>
                <span>•</span>
                <span className="font-mono font-bold text-amber-800">{currentTimeStr}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar with Language Switcher */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 font-siemreap">
            {/* Language Switcher */}
            <div className="bg-white border border-amber-200 rounded-xl p-0.5 sm:p-1 flex items-center space-x-1 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => switchLanguage("km")}
                title="ភាសាខ្មែរ (Khmer)"
                className={`px-2 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                  lang === "km"
                    ? "bg-[#0c2340] text-amber-300 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>🇰🇭</span>
                <span className="hidden xl:inline">ខ្មែរ</span>
              </button>
              <button
                type="button"
                onClick={() => switchLanguage("en")}
                title="English"
                className={`px-2 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                  lang === "en"
                    ? "bg-[#0c2340] text-amber-300 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>🇬🇧</span>
                <span className="hidden xl:inline">EN</span>
              </button>
            </div>

            {/* Audio Alert Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 xl:px-3 xl:py-2 rounded-xl flex items-center space-x-1.5 transition border ${
                soundEnabled
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-gray-100 text-gray-500 border-gray-300"
              }`}
              title={soundEnabled ? t.soundOn : t.soundOff}
              aria-label="Sound alert toggle"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden xl:inline text-xs font-bold">{soundEnabled ? t.soundOn : t.soundOff}</span>
            </button>

            {/* Telegram Bot Alert Test */}
            <button
              onClick={handleTestTelegram}
              disabled={telegramStatus.loading}
              className="bg-sky-600 hover:bg-sky-700 text-white p-2 xl:px-3.5 xl:py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
              title={t.sendTestAlert}
              aria-label="Send test alert to @vvotel_bot"
            >
              <Send className={`w-4 h-4 ${telegramStatus.loading ? "animate-spin" : ""}`} />
              <span className="hidden xl:inline text-xs font-bold">{telegramStatus.loading ? t.sendingAlert : t.sendTestAlert}</span>
            </button>

            {/* Direct Link to Telegram Bot */}
            <a
              href="https://t.me/vvotel_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-amber-50 text-sky-700 border border-amber-200 p-2 xl:px-3 xl:py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
              title="Open @vvotel_bot in Telegram"
              aria-label="Telegram Bot"
            >
              <ExternalLink className="w-4 h-4 text-sky-600" />
              <span className="hidden xl:inline text-xs font-bold">Telegram Bot</span>
            </a>

            {/* System Settings Shortcut Button */}
            <button
              onClick={() => setCurrentAdminTab(currentAdminTab === "settings" ? "dashboard" : "settings")}
              className={`p-2 xl:px-3 xl:py-2 rounded-xl flex items-center space-x-1.5 transition border ${
                currentAdminTab === "settings"
                  ? "bg-[#0c2340] text-amber-300 border-amber-300 shadow-sm"
                  : "bg-white text-gray-700 border-amber-200 hover:bg-amber-50 shadow-sm"
              }`}
              title={lang === "km" ? "ការកំណត់ប្រព័ន្ធ (Settings)" : "System Settings"}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-amber-600" />
              <span className="hidden xl:inline text-xs font-bold">{lang === "km" ? "ការកំណត់" : "Settings"}</span>
            </button>

            {/* Executive Administrative Reports Suite */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-[#0c2340] hover:bg-[#12335e] text-amber-300 border border-amber-300/60 p-2 xl:px-3.5 xl:py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
              title={t.reportsBtn}
              aria-label="Administrative Reports"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span className="hidden xl:inline text-xs font-bold">{t.reportsBtn}</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchBookings(false)}
              disabled={loading}
              className="bg-white hover:bg-amber-50 text-gray-700 border border-amber-200 p-2 xl:px-3 xl:py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
              title={t.refreshData}
              aria-label="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
              <span className="hidden xl:inline text-xs font-bold">{t.refreshData}</span>
            </button>

            {/* Add Walk-in */}
            <button
              onClick={() => setIsNewBookingModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 xl:px-3.5 xl:py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
              title={t.walkInBtn}
              aria-label="Walk-in Booking"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-bold">{t.walkInBtn}</span>
            </button>

            {/* Accor PMS link */}
            <a
              href="https://t.me/vvotel_bot?start=accor_pms"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 p-2 xl:px-3 xl:py-2 rounded-xl flex items-center space-x-1.5 transition"
              title={t.accorPmsBtn}
              aria-label="ALL Accor PMS"
            >
              <Building className="w-4 h-4 text-purple-600" />
              <span className="hidden xl:inline text-xs font-bold">{t.accorPmsBtn}</span>
            </a>

            {/* Public Website */}
            <Link
              href="/"
              className="bg-white hover:bg-amber-50 text-gray-700 border border-amber-200 p-2 xl:px-3 xl:py-2 rounded-xl flex items-center space-x-1 transition"
              title={t.homeBtn}
              aria-label="Public Website"
            >
              <Home className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-bold">{t.homeBtn}</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-2 xl:px-3 xl:py-2 rounded-xl flex items-center space-x-1 transition"
              title={t.logoutBtn}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-bold">{t.logoutBtn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Fluid Content Area */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 flex-1 space-y-6 font-siemreap">
        {/* Real-time Dynamic Booking Alert Banner */}
        {newBookingAlert && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-4 rounded-2xl shadow-lg border border-amber-300 flex items-center justify-between animate-in slide-in-from-top-3 duration-300 font-siemreap">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-amber-700 flex items-center justify-center font-bold shadow-md shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    {newBookingAlert.category === "DINING"
                      ? (lang === "km" ? "🍽️ ការកក់តុអាហារថ្មី" : "🍽️ New Dining Booking")
                      : (lang === "km" ? "🛏️ ការកក់បន្ទប់ថ្មី" : "🛏️ New Room Booking")}
                  </span>
                  <span className="font-mono text-xs opacity-90">{newBookingAlert.id}</span>
                </div>
                <h4 className="font-bold text-sm sm:text-base mt-0.5">
                  {lang === "km"
                    ? `ភ្ញៀវ ${newBookingAlert.guestName} បានកក់ ${newBookingAlert.title}`
                    : `Guest ${newBookingAlert.guestName} reserved ${newBookingAlert.title}`}
                </h4>
                <p className="text-[11px] text-amber-100">
                  {lang === "km"
                    ? "ទិន្នន័យត្រូវបានបញ្ជូនទៅកាន់ Telegram Bot (@vvotel_bot) និងបាន Update លើផ្ទាំងគ្រប់គ្រងរួចរាល់!"
                    : "Notification dispatched to Telegram Bot (@vvotel_bot) & updated on PMS!"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setNewBookingAlert(null)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Telegram Test Alert Toast */}
        {telegramStatus.message && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold shadow-md animate-in fade-in slide-in-from-top-2 font-siemreap ${
              telegramStatus.success
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-red-50 border-red-300 text-red-900"
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{telegramStatus.message}</span>
            </div>
            <button
              onClick={() => setTelegramStatus({ loading: false })}
              className="p-1 hover:bg-black/5 rounded-lg text-gray-500 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Operations View Tabs Switcher (Dashboard vs Settings) */}
        <div className="flex items-center space-x-2 border-b border-amber-200/80 pb-3 font-siemreap">
          <button
            type="button"
            onClick={() => setCurrentAdminTab("dashboard")}
            className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition ${
              currentAdminTab === "dashboard"
                ? "bg-[#0c2340] text-amber-300 shadow-md border border-amber-300/40"
                : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-amber-50/50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lang === "km" ? "📊 ផ្ទាំងគ្រប់គ្រង" : "📊 Dashboard"}</span>
            <span className="hidden sm:inline">{lang === "km" ? "ទូទៅ (Dashboard)" : " Operations"}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentAdminTab("settings")}
            className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition ${
              currentAdminTab === "settings"
                ? "bg-[#0c2340] text-amber-300 shadow-md border border-amber-300/40"
                : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-amber-50/50"
            }`}
          >
            <Settings className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lang === "km" ? "⚙️ ការកំណត់" : "⚙️ Settings"}</span>
            <span className="hidden sm:inline">{lang === "km" ? "ប្រព័ន្ធ (Settings)" : " System"}</span>
          </button>
        </div>

        {currentAdminTab === "settings" ? (
          <AdminSettingsPortal lang={lang} />
        ) : (
          <>
            {/* Executive KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 xl:gap-5 font-siemreap">
          {/* Card 1: Total Bookings */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>{t.totalBookings}</span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#0c2340] font-mono">{bookings.length}</span>
              <span className="text-xs text-gray-500 ml-1">{lang === "km" ? "កក់" : "units"}</span>
            </div>
            <span className="text-[10px] text-emerald-700 mt-1 font-semibold">{t.liveStatus}</span>
          </div>

          {/* Card 2: Total Revenue USD */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>{t.totalRevenue}</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono">
                ${totalRevenueUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 font-mono">
              ≈ {totalRevenueKHR.toLocaleString()} ៛ KHR
            </span>
          </div>

          {/* Card 3: Room Bookings */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>{t.roomBookings}</span>
              <BedDouble className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-bold text-sky-900 font-mono">{roomBookings.length}</span>
              <span className="text-xs text-gray-500 ml-1">{lang === "km" ? "បន្ទប់" : "rooms"}</span>
            </div>
            <span className="text-[10px] text-sky-700 mt-1 font-semibold">Accommodation</span>
          </div>

          {/* Card 4: Dining & Table Orders */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>{t.diningBookings}</span>
              <Utensils className="w-4 h-4 text-amber-700" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-bold text-amber-900 font-mono">{diningBookings.length}</span>
              <span className="text-xs text-gray-500 ml-1">{lang === "km" ? "តុ" : "tables"}</span>
            </div>
            <span className="text-[10px] text-amber-700 mt-1 font-semibold">Dining & Bar</span>
          </div>

          {/* Card 5: In-House & Seated */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>{t.inHouseGuests}</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-bold text-purple-900 font-mono">{inHouseGuests.length}</span>
              <span className="text-xs text-gray-500 ml-1">{lang === "km" ? "ភ្ញៀវ" : "guests"}</span>
            </div>
            <span className="text-[10px] text-purple-700 mt-1 font-semibold">Active In-House</span>
          </div>

          {/* Card 6: Telegram Bot Status */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>{t.botStatus}</span>
              <Send className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xl sm:text-2xl font-bold text-[#0c2340]">Active</span>
            </div>
            <span className="text-[10px] text-sky-700 mt-1 font-mono">@vvotel_bot</span>
          </div>
        </div>

        {/* Search, Filter Toolbar & Export */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 font-siemreap">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          {/* Category Tabs: All, Rooms, Dining */}
          <div className="flex items-center flex-wrap gap-1 bg-[#FAF8F4] p-1 rounded-xl border border-amber-200/60 text-xs">
            {[
              { id: "ALL", label: t.tabAll },
              { id: "ROOM", label: t.tabRooms },
              { id: "DINING", label: t.tabDining },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  categoryFilter === tab.id
                    ? "bg-[#0c2340] text-amber-300 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center flex-wrap gap-1 bg-[#FAF8F4] p-1 rounded-xl border border-amber-200/60 text-xs">
            {[
              { id: "ALL", label: t.statusAll },
              { id: "CONFIRMED", label: t.statusConfirmed },
              { id: "IN_HOUSE", label: t.statusInHouse },
              { id: "CHECKED_OUT", label: t.statusCheckedOut },
              { id: "PAID", label: t.statusPaid },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition text-xs ${
                  selectedStatus === tab.id
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Filter & Export CSV */}
          <div className="flex items-center space-x-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-amber-500 cursor-pointer font-siemreap"
            >
              <option value="ALL">{t.dateAll}</option>
              <option value="TODAY_IN">{t.dateTodayIn}</option>
              <option value="TODAY_OUT">{t.dateTodayOut}</option>
            </select>

            {/* Executive Administrative Export Buttons */}
            <div className="flex items-center space-x-1 font-siemreap">
              <a
                href="/api/reports?format=docx"
                download
                className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-2.5 py-2 rounded-xl flex items-center space-x-1 transition shadow-2xs"
                title="ទាញយករបាយការណ៍ Word (.docx)"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Word</span>
              </a>

              <a
                href="/api/reports?format=excel"
                download
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-2 rounded-xl flex items-center space-x-1 transition shadow-2xs"
                title="ទាញយករបាយការណ៍ Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </a>

              <a
                href="/api/reports?format=html"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-2.5 py-2 rounded-xl flex items-center space-x-1 transition shadow-2xs"
                title="បើកមើល / បោះពុម្ព PDF"
              >
                <Printer className="w-3.5 h-3.5 text-purple-600" />
                <span>PDF</span>
              </a>

              <button
                onClick={exportToCSV}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs font-bold px-2 py-2 rounded-xl flex items-center space-x-1 transition shadow-2xs"
                title="Export CSV"
              >
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Master Booking Table */}
        <div className="bg-white border border-amber-200/80 rounded-2xl shadow-sm overflow-hidden font-siemreap">
          <div className="p-4 border-b border-amber-200/60 bg-[#FAF8F4] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-amber-700" />
              <h3 className="font-mool text-sm sm:text-base text-[#0c2340]">
                {t.tableHeading} ({filteredBookings.length})
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-siemreap">
              Check-in: <strong className="text-amber-800">14:00</strong> | Check-out: <strong className="text-amber-800">12:00</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#F6F2E9] text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-amber-200/70">
                <tr>
                  <th className="py-4 px-4 sm:px-5">{t.thRef}</th>
                  <th className="py-4 px-4 sm:px-5">{t.thGuest}</th>
                  <th className="py-4 px-4 sm:px-5">{t.thRoomVenue}</th>
                  <th className="py-4 px-4 sm:px-5">{t.thSchedule}</th>
                  <th className="py-4 px-4 sm:px-5">{t.thFinance}</th>
                  <th className="py-4 px-4 sm:px-5">{t.thStatus}</th>
                  <th className="py-4 px-4 sm:px-5 text-right">{t.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-siemreap">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                      <span>Loading bookings...</span>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      {lang === "km" ? "មិនមានទិន្នន័យត្រូវគ្នានឹងការស្វែងរកឡើយ" : "No matching bookings found"}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isDin = b.bookingCategory === "DINING" || b.id.startsWith("DIN");
                    return (
                      <tr key={b.id} className="hover:bg-amber-50/40 transition">
                        {/* Ref, Category Badge & Date */}
                        <td className="py-4 px-4 sm:px-5">
                          <div className="flex items-center space-x-1.5 mb-1">
                            {isDin ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <Utensils className="w-2.5 h-2.5" />
                                <span>{lang === "km" ? "កក់តុអាហារ" : "Dining"}</span>
                              </span>
                            ) : (
                              <span className="bg-sky-100 text-sky-900 border border-sky-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <BedDouble className="w-2.5 h-2.5" />
                                <span>{lang === "km" ? "កក់បន្ទប់" : "Room"}</span>
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-amber-900 block text-xs">
                            {b.id}
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5 font-mono">
                            {new Date(b.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Guest Info */}
                        <td className="py-4 px-4 sm:px-5">
                          <span className="font-bold text-[#0c2340] text-sm block">
                            {b.guestName}
                          </span>
                          <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-0.5">
                            <span className="flex items-center space-x-1 font-mono">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{b.phone}</span>
                            </span>
                            <span>•</span>
                            <span>{b.country || "Cambodia"}</span>
                          </div>
                        </td>

                        {/* Room or Dining Venue Info */}
                        <td className="py-4 px-4 sm:px-5">
                          <span className="font-semibold text-gray-900 block text-xs truncate max-w-[220px]" title={lang === "km" ? (b.roomNameKm || b.roomNameEn) : (b.roomNameEn || b.roomNameKm)}>
                            {lang === "km" ? (b.roomNameKm || b.roomNameEn || b.roomType) : (b.roomNameEn || b.roomNameKm || b.roomType)}
                          </span>
                          <div className="flex items-center space-x-2 mt-1 text-[10px]">
                            {b.roomNumber ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                                {isDin ? b.roomNumber : (lang === "km" ? `បន្ទប់: ${b.roomNumber}` : `Room: ${b.roomNumber}`)}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">{lang === "km" ? "មិនទាន់កំណត់" : "Unassigned"}</span>
                            )}
                            <span className="text-gray-500">
                              {isDin ? `${b.adults} Pax` : `(${b.adults}A, ${b.children}C)`}
                            </span>
                          </div>
                        </td>

                        {/* Schedule & Dates */}
                        <td className="py-4 px-4 sm:px-5">
                          {isDin ? (
                            <div>
                              <div className="font-bold text-gray-900 font-mono">{b.checkIn}</div>
                              <span className="text-[10px] text-amber-800 font-bold block mt-0.5">
                                {lang === "km" ? "ម៉ោងកក់:" : "Time:"} {b.checkInTime || b.reservationTime || "19:00"}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-gray-900 font-mono">
                                {b.checkIn} → {b.checkOut}
                              </div>
                              <span className="text-[10px] text-gray-500 block mt-0.5">
                                {b.nights} {lang === "km" ? "យប់" : "Nights"} • In 14:00 / Out 12:00
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Financials & Payment */}
                        <td className="py-4 px-4 sm:px-5">
                          {isDin ? (
                            <div>
                              <span className="font-semibold text-gray-900 block text-xs">
                                {lang === "km" ? "កក់តុជាមុន" : "Table Reservation"}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                                {lang === "km" ? "ធានាកក់រួចរាល់" : "Guaranteed"}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-emerald-700 block font-mono text-sm">
                                ${(b.totalAmountUSD || 0).toFixed(2)}
                              </span>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span
                                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    b.paymentMethod === "KHQR_BAKONG"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : b.paymentMethod.includes("CARD")
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "bg-amber-50 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {b.paymentMethod === "KHQR_BAKONG"
                                    ? "Bakong KHQR"
                                    : b.paymentMethod.includes("CARD")
                                    ? "Card 3D Sec"
                                    : "Pay at Hotel"}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {b.paymentStatus === "PAID" ? "✅ Paid" : "⏳ Guaranteed"}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 sm:px-5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center space-x-1 ${
                              b.stayStatus === "CHECKED_IN" || b.stayStatus === "SEATED"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : b.stayStatus === "CHECKED_OUT" || b.stayStatus === "COMPLETED"
                                ? "bg-purple-100 text-purple-900 border-purple-300"
                                : b.stayStatus === "CANCELLED"
                                ? "bg-red-100 text-red-900 border-red-300"
                                : "bg-emerald-100 text-emerald-900 border-emerald-300"
                            }`}
                          >
                            <span>
                              {b.stayStatus === "CHECKED_IN"
                                ? t.statusInHouseText
                                : b.stayStatus === "SEATED"
                                ? t.statusSeatedText
                                : b.stayStatus === "CHECKED_OUT"
                                ? t.statusCheckedOutText
                                : b.stayStatus === "COMPLETED"
                                ? t.statusCompletedText
                                : b.stayStatus === "CANCELLED"
                                ? t.statusCancelledText
                                : t.statusConfirmedText}
                            </span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5 font-siemreap">
                            {/* Check-In or Seat */}
                            {b.stayStatus !== "CHECKED_IN" &&
                              b.stayStatus !== "SEATED" &&
                              b.stayStatus !== "CHECKED_OUT" &&
                              b.stayStatus !== "COMPLETED" && (
                                <button
                                  onClick={() => {
                                    setCheckInModalBooking(b);
                                    setAssignedRoomNumber(b.roomNumber || "");
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shadow-sm"
                                >
                                  {isDin ? t.btnSeat : t.btnCheckIn}
                                </button>
                              )}

                            {/* Check-Out or Complete */}
                            {(b.stayStatus === "CHECKED_IN" || b.stayStatus === "SEATED") && (
                              <button
                                onClick={() => handleCheckOut(b.id, isDin)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shadow-sm"
                              >
                                {isDin ? t.btnComplete : t.btnCheckOut}
                              </button>
                            )}

                            {/* Print POS 80mm */}
                            <button
                              onClick={() => {
                                setReceiptBooking(b);
                                setReceiptMode("pos-80mm");
                                setReceiptOpen(true);
                              }}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 p-1.5 rounded-lg transition"
                              title="POS 80mm Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Print A4 Tax Invoice */}
                            <button
                              onClick={() => {
                                setReceiptBooking(b);
                                setReceiptMode("a4-invoice");
                                setReceiptOpen(true);
                              }}
                              className="bg-white hover:bg-amber-50 text-[#0c2340] border border-gray-300 px-2 py-1.5 rounded-lg text-[10px] font-bold transition shadow-sm"
                              title="A4 Tax Invoice"
                            >
                              A4
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </main>

      {/* ======================= MODAL 1: CHECK-IN / SEAT GUEST ======================= */}
      {checkInModalBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-siemreap print:hidden">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-mool text-[#0c2340] text-sm sm:text-base">
                  {checkInModalBooking.bookingCategory === "DINING" || checkInModalBooking.id.startsWith("DIN")
                    ? (lang === "km" ? "ទទួលភ្ញៀវចូលតុ & កំណត់លេខតុ" : "Seat Guest & Assign Table")
                    : (lang === "km" ? "Check-In ភ្ញៀវ & កំណត់លេខបន្ទប់" : "Check-In Guest & Assign Room")}
                </h3>
              </div>
              <button
                onClick={() => setCheckInModalBooking(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckIn} className="mt-4 space-y-4">
              <div className="bg-[#FAF8F4] p-3.5 rounded-2xl border border-amber-200/80 text-xs space-y-1.5">
                <p className="text-gray-500">
                  Ref: <strong className="text-amber-800 font-mono">{checkInModalBooking.id}</strong>
                </p>
                <p className="text-[#0c2340] font-bold text-sm">
                  {checkInModalBooking.guestName} ({checkInModalBooking.phone})
                </p>
                <p className="text-gray-700">
                  {checkInModalBooking.roomNameKm || checkInModalBooking.roomNameEn}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {checkInModalBooking.bookingCategory === "DINING" || checkInModalBooking.id.startsWith("DIN")
                    ? (lang === "km" ? "លេខតុជាក់ស្តែង (Table Number):" : "Actual Table Number:")
                    : (lang === "km" ? "លេខបន្ទប់ជាក់ស្តែង (Room Number):" : "Actual Room Number:")}
                </label>
                <input
                  type="text"
                  required
                  value={assignedRoomNumber}
                  onChange={(e) => setAssignedRoomNumber(e.target.value)}
                  placeholder="e.g. 201, Table 5, Mekong Suite..."
                  className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3.5 py-2.5 text-gray-900 text-sm font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckInModalBooking(null)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {lang === "km" ? "បញ្ជាក់ Check-In ឥឡូវ" : "Confirm Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 2: WALK-IN / NEW BOOKING ======================= */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-siemreap print:hidden">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <h3 className="font-mool text-[#0c2340] text-sm sm:text-base">
                  {lang === "km" ? "បង្កើតការកក់ថ្មី (Walk-in / Phone Reservation)" : "New Reservation (Walk-in / Phone)"}
                </h3>
              </div>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkInBooking} className="mt-4 space-y-3.5 text-xs">
              {/* Category selector */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  {lang === "km" ? "ប្រភេទនៃការកក់" : "Reservation Type"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBookingData({ ...newBookingData, bookingCategory: "ROOM" })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition ${
                      newBookingData.bookingCategory === "ROOM"
                        ? "bg-[#0c2340] text-amber-300 border-[#0c2340]"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    <BedDouble className="w-4 h-4" />
                    <span>{lang === "km" ? "កក់បន្ទប់ស្នាក់នៅ" : "Room Stay"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBookingData({ ...newBookingData, bookingCategory: "DINING" })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition ${
                      newBookingData.bookingCategory === "DINING"
                        ? "bg-[#0c2340] text-amber-300 border-[#0c2340]"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>{lang === "km" ? "កក់តុអាហារ" : "Dining Table"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    {lang === "km" ? "ឈ្មោះភ្ញៀវ *" : "Guest Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newBookingData.guestName}
                    onChange={(e) => setNewBookingData({ ...newBookingData, guestName: e.target.value })}
                    placeholder="e.g. Sokha Heng"
                    className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    {lang === "km" ? "លេខទូរស័ព្ទ *" : "Phone Number *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newBookingData.phone}
                    onChange={(e) => setNewBookingData({ ...newBookingData, phone: e.target.value })}
                    placeholder="+855 12 888 999"
                    className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {newBookingData.bookingCategory === "ROOM" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        {lang === "km" ? "ប្រភេទបន្ទប់" : "Room Type"}
                      </label>
                      <select
                        value={newBookingData.roomType}
                        onChange={(e) => {
                          const type = e.target.value;
                          const prices: Record<string, number> = {
                            "standard-city": 85,
                            "superior-river": 125,
                            "executive-suite": 195,
                            "royal-family-suite": 280,
                          };
                          setNewBookingData({
                            ...newBookingData,
                            roomType: type,
                            totalAmountUSD: prices[type] || 125,
                          });
                        }}
                        className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white cursor-pointer font-siemreap"
                      >
                        <option value="standard-city">បន្ទប់ស្តង់ដារ ទេសភាពទីក្រុង ($85/យប់)</option>
                        <option value="superior-river">បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេ ($125/យប់)</option>
                        <option value="executive-suite">បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ ($195/យប់)</option>
                        <option value="royal-family-suite">បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ ($280/យប់)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        {lang === "km" ? "តម្លៃសរុប (USD)" : "Total (USD)"}
                      </label>
                      <input
                        type="number"
                        value={newBookingData.totalAmountUSD}
                        onChange={(e) => setNewBookingData({ ...newBookingData, totalAmountUSD: Number(e.target.value) })}
                        className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 font-mono focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Check-in (14:00)</label>
                      <input
                        type="date"
                        required
                        value={newBookingData.checkIn}
                        onChange={(e) => setNewBookingData({ ...newBookingData, checkIn: e.target.value })}
                        className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Check-out (12:00)</label>
                      <input
                        type="date"
                        required
                        value={newBookingData.checkOut}
                        onChange={(e) => setNewBookingData({ ...newBookingData, checkOut: e.target.value })}
                        className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "កាលបរិច្ឆេទទទួលទាន" : "Dining Date"}
                    </label>
                    <input
                      type="date"
                      required
                      value={newBookingData.checkIn}
                      onChange={(e) => setNewBookingData({ ...newBookingData, checkIn: e.target.value })}
                      className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "ម៉ោងកក់" : "Time"}
                    </label>
                    <input
                      type="time"
                      required
                      value={newBookingData.reservationTime}
                      onChange={(e) => setNewBookingData({ ...newBookingData, reservationTime: e.target.value })}
                      className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "ចំនួនភ្ញៀវ (Pax)" : "Guests (Pax)"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newBookingData.adults}
                      onChange={(e) => setNewBookingData({ ...newBookingData, adults: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow transition"
                >
                  {lang === "km" ? "រក្សាទុក & Alert ទៅ Bot" : "Save & Alert Bot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EXECUTIVE ADMINISTRATIVE REPORT MODAL ======================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-siemreap print:hidden">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#0c2340] to-[#12335e] text-white relative">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-300 font-mool text-2xl">
                  V
                </div>
                <div>
                  <h3 className="font-mool text-base sm:text-lg text-amber-300">
                    {t.reportModalTitle}
                  </h3>
                  <p className="text-xs text-amber-100/80 mt-0.5">
                    {t.reportModalSubtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* National Banner & Administrative Context */}
              <div className="p-5 bg-gradient-to-b from-amber-50/80 to-white border border-amber-200/90 rounded-2xl space-y-3 shadow-xs">
                {/* 1. Kingdom Motto: TOP CENTER */}
                <div className="text-center space-y-0.5">
                  <h4 className="font-mool text-sm sm:text-base text-[#0c2340] tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                  <h5 className="font-mool text-xs sm:text-sm text-[#0c2340] tracking-wide">ជាតិ សាសនា ព្រះមហាក្សត្រ</h5>
                  <div className="text-xs text-amber-800 font-serif tracking-[0.25em]">❖ ❖ ❖</div>
                </div>

                {/* 2. Hotel on Left & Date on Right on the SAME HORIZONTAL LINE */}
                <div className="pt-2 border-t border-amber-200/60 flex items-start justify-between text-xs text-gray-700">
                  <div className="text-left space-y-0.5">
                    <span className="font-mool text-xs text-[#0c2340] block">សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម</span>
                    <span className="text-[11px] text-gray-600 block">ផ្នែករដ្ឋបាល និងហិរញ្ញវត្ថុ • លេខ: ០២៤/២៦ វវ.កច</span>
                  </div>
                  <div className="text-right pt-0.5">
                    <span className="text-xs font-bold italic text-gray-800 block">កំពង់ចាម, ថ្ងៃទី០៥ ខែវិច្ឆិកា ឆ្នាំ២០២៦</span>
                    <span className="text-[10px] text-amber-800 block font-mono">{currentTimeStr}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Metrics Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[11px] text-blue-700 font-bold block">ការកក់សរុប</span>
                  <span className="text-xl font-bold text-blue-950 font-mono">{bookings.length}</span>
                  <span className="text-[10px] text-gray-500 block">បន្ទប់ {roomBookings.length} | តុ {diningBookings.length}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[11px] text-emerald-700 font-bold block">កំពុងស្នាក់នៅ</span>
                  <span className="text-xl font-bold text-emerald-950 font-mono">{inHouseGuests.length}</span>
                  <span className="text-[10px] text-gray-500 block">In-House</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[11px] text-amber-700 font-bold block">ចំណូលសរុប ($)</span>
                  <span className="text-xl font-bold text-amber-950 font-mono">${totalRevenueUSD.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-500 block">USD</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <span className="text-[11px] text-purple-700 font-bold block">ចំណូលសរុប (៛)</span>
                  <span className="text-base sm:text-lg font-bold text-purple-950 font-mono">{Math.round(totalRevenueUSD * 4100).toLocaleString()} ៛</span>
                  <span className="text-[10px] text-gray-500 block">KHR</span>
                </div>
              </div>

              {/* 3 Executive Download Options */}
              <div className="space-y-3">
                {/* 1. Word Document */}
                <div className="p-4 bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mool text-sm text-[#0c2340]">{t.reportWordTitle}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{t.reportWordDesc}</p>
                    </div>
                  </div>
                  <a
                    href="/api/reports?format=docx"
                    download
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Word (.docx)</span>
                  </a>
                </div>

                {/* 2. Excel Spreadsheet */}
                <div className="p-4 bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mool text-sm text-[#0c2340]">{t.reportExcelTitle}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{t.reportExcelDesc}</p>
                    </div>
                  </div>
                  <a
                    href="/api/reports?format=excel"
                    download
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel (.xlsx)</span>
                  </a>
                </div>

                {/* 3. Official Printable PDF */}
                <div className="p-4 bg-white border-2 border-rose-200 hover:border-rose-400 rounded-2xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mool text-sm text-[#0c2340]">{t.reportPdfTitle}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{t.reportPdfDesc}</p>
                    </div>
                  </div>
                  <a
                    href="/api/reports?format=html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow transition shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.viewPrintPdfBtn}</span>
                  </a>
                </div>
              </div>

              {/* Bot Alert Note */}
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-start space-x-2.5 text-xs text-sky-900">
                <Send className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>ជំនួយការ Telegram Bot (@vvotel_bot):</strong> លោកអ្នកអាចទាញយករបាយការណ៍ទាំងនេះដោយផ្ទាល់ក្នុង Telegram គ្រប់ពេលវេលា ដោយគ្រាន់តែវាយពាក្យបញ្ជា <code className="bg-sky-100 text-sky-800 px-1 py-0.5 rounded font-mono font-bold">/report</code> ឬចុចលើប៊ូតុង <strong>📑 របាយការណ៍រដ្ឋបាល</strong>!
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition"
              >
                {lang === "km" ? "បិទផ្ទាំង" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= PRINTABLE RECEIPT MODAL ======================= */}
      <PrintableReceipt
        booking={receiptBooking}
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        defaultMode={receiptMode}
      />
    </div>
  );
}
