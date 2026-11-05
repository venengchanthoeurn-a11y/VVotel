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
  Compass,
} from "lucide-react";
import { BookingRecord } from "@/lib/bookings";
import { PrintableReceipt } from "@/components/PrintableReceipt";

// Harmonic Web Audio Chime for Real-Time Booking Alerts (Works without external mp3 files)
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
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [rememberLogin, setRememberLogin] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Live Clock State (Phnom Penh / Kampong Cham time)
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
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL"); // ALL, CONFIRMED, CHECKED_IN, CHECKED_OUT, PAID
  const [dateFilter, setDateFilter] = useState<string>("ALL"); // ALL, TODAY_IN, TODAY_OUT

  // Known booking IDs tracking for real-time alert trigger
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

  // Check-in / Room assign modal state
  const [checkInModalBooking, setCheckInModalBooking] = useState<BookingRecord | null>(null);
  const [assignedRoomNumber, setAssignedRoomNumber] = useState<string>("");

  // New Walk-in Booking modal state
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState<boolean>(false);
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
      setPasscodeError(
        "លេខកូដសម្ងាត់មិនត្រឹមត្រូវឡើយ! ប្រព័ន្ធអនុញ្ញាតសម្រាប់តែអ្នកគ្រប់គ្រង និងបុគ្គលិកសណ្ឋាគារប៉ុណ្ណោះ។"
      );
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

      // Check client-side recorded bookings (from website booking or dining reservation)
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
          message: data.message || "បានផ្ញើ Alert ទៅកាន់ @vvotel_bot រួចរាល់!",
        });
      } else {
        setTelegramStatus({
          loading: false,
          success: false,
          message: data.error || "មិនអាចផ្ញើទៅកាន់ Telegram បានទេ",
        });
      }
    } catch {
      setTelegramStatus({
        loading: false,
        success: false,
        message: "Network Error: មិនអាចទាក់ទង Telegram API បានទេ",
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
      ? "តើអ្នកពិតជាចង់បញ្ចប់ការទទួលទាន (Complete Dining Order) មែនទេ?"
      : "តើអ្នកពិតជាចង់ Check-out ភ្ញៀវនេះមែនទេ? (Check-out Time: 12:00 Standard)";
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
        if (data.success) {
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
        if (data.success) {
          setIsNewBookingModalOpen(false);
          await fetchBookings(false);
          if (data.booking) {
            setReceiptBooking(data.booking);
            setReceiptOpen(true);
          }
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

  const todayCheckIns = bookings.filter((b) => b.checkIn === todayStr);
  const todayCheckOuts = bookings.filter((b) => b.checkOut === todayStr);
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
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0c2340] border-2 border-amber-300 flex items-center justify-center text-amber-300 font-black text-2xl shadow-lg animate-pulse">
            V
          </div>
          <span className="text-xs font-bold text-gray-600">កំពុងផ្ទៀងផ្ទាត់សិទ្ធិគ្រប់គ្រង...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: EXECUTIVE FULL-SCREEN RESPONSIVE SECURITY GATE / LOGIN PORTAL
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF7F2] font-sans antialiased overflow-x-hidden">
        {/* Left Hero Panel (Takes 60% on desktop, stacks gracefully on tablet/mobile) */}
        <div className="lg:w-7/12 xl:w-3/5 min-h-[460px] lg:min-h-screen relative p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden bg-[#0c2340] text-white shadow-2xl">
          {/* Subtle Ambient Golden Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-700/25 via-[#0c2340] to-[#061424] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#12335e] to-[#0c2340] border-2 border-amber-300/80 flex items-center justify-center text-amber-300 font-black text-3xl shadow-xl shadow-amber-950/20">
                V
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 block">
                  Five-Star Luxury Riverfront Hotel
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  VVotel Kampong Cham
                </h1>
                <p className="text-xs text-amber-100/70">
                  សណ្ឋាគារ វឌ្ឍនៈ កំពង់ចាម • ប្រព័ន្ធគ្រប់គ្រងផ្ទៃក្នុងកណ្តាល
                </p>
              </div>
            </div>
          </div>

          {/* Center Showcase Details */}
          <div className="relative z-10 py-10 lg:py-0 space-y-6 max-w-xl">
            {/* Live Cambodia Clock Card */}
            <div className="inline-flex items-center space-x-2.5 bg-white/10 backdrop-blur-md border border-amber-300/30 px-4 py-2 rounded-2xl text-xs text-amber-200">
              <Clock className="w-4 h-4 text-amber-300 shrink-0" />
              <span>ម៉ោងនៅកំពង់ចាម: <strong>{currentTimeStr || "Loading..."}</strong></span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black leading-tight text-white tracking-tight">
              ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារ និងភោជនីយដ្ឋានកណ្តាល
              <span className="text-amber-300 block mt-1 font-serif italic text-xl sm:text-2xl">
                Accor PMS Hub & Real-time Bot Alerts
              </span>
            </h2>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start space-x-3 backdrop-blur-sm">
                <Send className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Telegram Bot Real-Time</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">Alerts រាល់ការកក់បន្ទប់ និងតុអាហារ</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start space-x-3 backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Payment Gateway 3DS</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">Bakong KHQR & 3D Secure Card</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start space-x-3 backdrop-blur-sm">
                <Building className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">ALL Accor PMS Sync</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">ភ្ជាប់ផ្ទាល់ទៅកាន់ប្រព័ន្ធកណ្តាល</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start space-x-3 backdrop-blur-sm">
                <Printer className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Dual Print Engine</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">POS 80mm & A4 Tax Invoice</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Status */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-gray-300 gap-2">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-bold">Cloud PMS Live: 100% Active</span>
            </span>
            <span>អាសយដ្ឋាន: អគារលេខ ២០៥២, ផ្លូវព្រះមុនីវង្ស, ភូមិ៧, កំពង់ចាម</span>
          </div>
        </div>

        {/* Right Security Login Portal Panel (Auto size responsive screen) */}
        <div className="lg:w-5/12 xl:w-2/5 p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center items-center bg-[#FAF7F2] w-full">
          <div className="w-full max-w-md bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-amber-950/5 relative overflow-hidden">
            {/* Top Decorative Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            {/* Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-[#0c2340] border-2 border-amber-300 flex items-center justify-center text-amber-300 font-black text-2xl shadow-md mx-auto">
                V
              </div>
              <span className="text-[11px] font-black tracking-widest uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                Hotel Executive Security Gate
              </span>
              <h2 className="text-2xl font-black text-[#0c2340] tracking-tight">
                ផ្ទាំងគ្រប់គ្រងសណ្ឋាគារ
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                សូមបញ្ចូលលេខកូដសម្ងាត់អ្នកគ្រប់គ្រងដើម្បីចូលប្រើប្រាស់
              </p>
            </div>

            {/* Error Notice */}
            {passcodeError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-xs text-red-700 font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  លេខកូដសម្ងាត់អ្នកគ្រប់គ្រង (Admin Passcode / PIN):
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
                    placeholder="បញ្ចូលលេខសម្ងាត់ (ឧ. 2052)"
                    className="w-full bg-[#FAF8F4] border border-amber-200 rounded-2xl pl-10 pr-11 py-3.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white transition shadow-inner"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 top-4 text-gray-400 hover:text-gray-700 transition"
                    title={showPasscode ? "លាក់លេខកូដ" : "បង្ហាញលេខកូដ"}
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Quick Fill Passcode Buttons */}
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2.5">
                  <span className="text-[11px] text-gray-500">ចុចជ្រើសលេខកូដរហ័ស:</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setPasscode("2052")}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-mono font-bold transition shadow-2xs"
                    >
                      PIN: 2052
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasscode("vvotel2026")}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-lg text-[11px] font-mono font-bold transition shadow-2xs"
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
                  ចងចាំការចូលប្រើលើឧបករណ៍នេះ (Remember Session)
                </label>
              </div>

              {/* Enter Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-md shadow-amber-900/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>ចូលផ្ទាំងគ្រប់គ្រង (ENTER ADMIN PMS)</span>
              </button>
            </form>

            {/* Back to Home Link */}
            <div className="mt-6 pt-4 border-t border-amber-100 text-center">
              <Link
                href="/"
                className="text-xs text-gray-500 hover:text-amber-800 font-bold transition inline-flex items-center space-x-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>ត្រឡប់ទៅគេហទំព័រ VVotel</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED LUXURY PMS DASHBOARD
  // Full-width fluid responsive design with Warm Egg-Cream & Pure White
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-gray-900 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Top Navigation Bar: Full Width & Clean */}
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 xl:px-12 py-3 shadow-sm">
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Live Clock */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0c2340] border border-amber-300 flex items-center justify-center text-amber-300 font-black text-xl shadow-sm shrink-0">
              V
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-extrabold text-lg text-[#0c2340] tracking-tight">
                  VVotel PMS Admin Portal
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live System
                </span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Authorized Manager
                </span>
              </div>
              <p className="text-[11px] text-gray-500 flex items-center space-x-2 mt-0.5">
                <span>សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម</span>
                <span>•</span>
                <span className="font-mono font-bold text-amber-800">{currentTimeStr}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Audio Alert Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition border ${
                soundEnabled
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-gray-100 text-gray-500 border-gray-300"
              }`}
              title={soundEnabled ? "សំឡេង Alert កំពុងបើក (ចុចដើម្បីបិទ)" : "សំឡេង Alert កំពុងបិទ (ចុចដើម្បីបើក)"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{soundEnabled ? "សំឡេង Alert: បើក" : "សំឡេង: បិទ"}</span>
            </button>

            {/* Telegram Bot Alert Test */}
            <button
              onClick={handleTestTelegram}
              disabled={telegramStatus.loading}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
              title="ផ្ញើសារ Alert សាកល្បងទៅកាន់ Telegram Bot @vvotel_bot"
            >
              <Send className={`w-3.5 h-3.5 ${telegramStatus.loading ? "animate-spin" : ""}`} />
              <span>{telegramStatus.loading ? "កំពុងផ្ញើ..." : "ផ្ញើ Alert ទៅ @vvotel_bot"}</span>
            </button>

            {/* Direct Link to Telegram Bot */}
            <a
              href="https://t.me/vvotel_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-amber-50 text-sky-700 border border-amber-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
            >
              <span>Telegram Bot</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Refresh */}
            <button
              onClick={() => fetchBookings(false)}
              disabled={loading}
              className="bg-white hover:bg-amber-50 text-gray-700 border border-amber-200 text-xs font-bold p-2 sm:px-3 sm:py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
              title="ទាញទិន្នន័យថ្មី"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
              <span className="hidden sm:inline">ទាញទិន្នន័យ</span>
            </button>

            {/* Add Walk-in */}
            <button
              onClick={() => setIsNewBookingModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>កក់ផ្ទាល់ / Walk-in</span>
            </button>

            {/* Accor PMS link */}
            <a
              href="https://t.me/vvotel_bot?start=accor_pms"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
            >
              <span>ALL Accor PMS</span>
              <ExternalLink className="w-3 h-3 text-purple-600" />
            </a>

            {/* Website Link */}
            <Link
              href="/"
              className="bg-white hover:bg-amber-50 text-gray-700 border border-amber-200 text-xs font-bold p-2 sm:px-3 sm:py-2 rounded-xl flex items-center space-x-1 transition"
              title="ត្រឡប់ទៅកាន់គេហទំព័រ"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">គេហទំព័រដើម</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 transition"
              title="ចាកចេញពីប្រព័ន្ធគ្រប់គ្រង (Sign Out)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ចាកចេញ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Fluid Content Area (Expanded to full screen with balanced gutters) */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 flex-1 space-y-6">
        {/* Real-time Dynamic Booking Alert Banner (Pops up when a new room or dining booking arrives) */}
        {newBookingAlert && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-4 rounded-2xl shadow-lg border border-amber-300 flex items-center justify-between animate-in slide-in-from-top-3 duration-300">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-amber-700 flex items-center justify-center font-black shadow-md shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    {newBookingAlert.category === "DINING" ? "🍽️ ការកក់តុអាហារថ្មី" : "🛏️ ការកក់បន្ទប់ថ្មី"}
                  </span>
                  <span className="font-mono text-xs opacity-90">{newBookingAlert.id}</span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base mt-0.5">
                  ភ្ញៀវ <strong>{newBookingAlert.guestName}</strong> បានកក់ <strong>{newBookingAlert.title}</strong>
                </h4>
                <p className="text-[11px] text-amber-100">
                  ទិន្នន័យត្រូវបានបញ្ជូនទៅកាន់ Telegram Bot (@vvotel_bot) និងបាន Update លើផ្ទាំងគ្រប់គ្រងរួចរាល់!
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

        {/* Telegram Test Alert Feedback Toast */}
        {telegramStatus.message && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold shadow-md animate-in fade-in slide-in-from-top-2 ${
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

        {/* Executive KPI Metric Cards (Responsive Grid filling full screen width) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 xl:gap-5">
          {/* Card 1: Total Bookings */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>ការកក់សរុប</span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-black text-[#0c2340]">{bookings.length}</span>
              <span className="text-xs text-gray-500 ml-1">កក់</span>
            </div>
            <span className="text-[10px] text-emerald-700 mt-1 font-semibold">ទិន្នន័យកត់ត្រា 100%</span>
          </div>

          {/* Card 2: Total Revenue USD */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>ចំណូលសរុប (USD)</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
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
              <span>បន្ទប់ស្នាក់នៅ</span>
              <BedDouble className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-black text-sky-900">{roomBookings.length}</span>
              <span className="text-xs text-gray-500 ml-1">បន្ទប់</span>
            </div>
            <span className="text-[10px] text-sky-700 mt-1 font-semibold">Accommodation</span>
          </div>

          {/* Card 4: Dining & Table Orders */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>កក់តុអាហារ</span>
              <Utensils className="w-4 h-4 text-amber-700" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-900">{diningBookings.length}</span>
              <span className="text-xs text-gray-500 ml-1">តុ</span>
            </div>
            <span className="text-[10px] text-amber-700 mt-1 font-semibold">Dining & Bar</span>
          </div>

          {/* Card 5: In-House & Seated */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>កំពុងស្នាក់នៅ/តុ</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-black text-purple-900">{inHouseGuests.length}</span>
              <span className="text-xs text-gray-500 ml-1">ភ្ញៀវ</span>
            </div>
            <span className="text-[10px] text-purple-700 mt-1 font-semibold">Active In-House</span>
          </div>

          {/* Card 6: Telegram Bot Status */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>Telegram Bot</span>
              <Send className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xl sm:text-2xl font-black text-[#0c2340]">Active</span>
            </div>
            <span className="text-[10px] text-sky-700 mt-1 font-mono">@vvotel_bot</span>
          </div>
        </div>

        {/* Search, Filter Toolbar & Export */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាម ឈ្មោះភ្ញៀវ, លេខកូដកក់, លេខទូរស័ព្ទ, លេខបន្ទប់ ឬតុ..."
              className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          {/* Category Tabs: All, Rooms, Dining */}
          <div className="flex items-center flex-wrap gap-1 bg-[#FAF8F4] p-1 rounded-xl border border-amber-200/60 text-xs">
            {[
              { id: "ALL", label: "ទាំងអស់" },
              { id: "ROOM", label: "🛏️ បន្ទប់" },
              { id: "DINING", label: "🍽️ តុអាហារ" },
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
              { id: "ALL", label: "គ្រប់ស្ថានភាព" },
              { id: "CONFIRMED", label: "បានកក់" },
              { id: "IN_HOUSE", label: "កំពុងស្នាក់នៅ/តុ" },
              { id: "CHECKED_OUT", label: "បានចេញ/ចប់" },
              { id: "PAID", label: "បង់រួច" },
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
              className="bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">គ្រប់កាលបរិច្ឆេទ</option>
              <option value="TODAY_IN">ចូលថ្ងៃនេះ</option>
              <option value="TODAY_OUT">ចេញថ្ងៃនេះ</option>
            </select>

            <button
              onClick={exportToCSV}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
              title="នាំចេញទិន្នន័យជាឯកសារ Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Live Booking Table in Crisp Pure White & Egg-Cream Header */}
        <div className="bg-white border border-amber-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-amber-200/60 bg-[#FAF8F4] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-sm sm:text-base text-[#0c2340]">
                តារាងគ្រប់គ្រងការកក់បន្ទប់ និងតុអាហារ ({filteredBookings.length})
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              ម៉ោង Check-in: <strong className="text-amber-800">14:00</strong> | ម៉ោង Check-out: <strong className="text-amber-800">12:00</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#F6F2E9] text-gray-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-amber-200/70">
                <tr>
                  <th className="py-4 px-4 sm:px-5">កូដកក់ / ប្រភេទ</th>
                  <th className="py-4 px-4 sm:px-5">ឈ្មោះភ្ញៀវ & ទំនាក់ទំនង</th>
                  <th className="py-4 px-4 sm:px-5">បន្ទប់ / ភោជនីយដ្ឋាន</th>
                  <th className="py-4 px-4 sm:px-5">កាលបរិច្ឆេទ & ពេលវេលា</th>
                  <th className="py-4 px-4 sm:px-5">ទឹកប្រាក់ & វិធីទូទាត់</th>
                  <th className="py-4 px-4 sm:px-5">ស្ថានភាព</th>
                  <th className="py-4 px-4 sm:px-5 text-right">សកម្មភាពគ្រប់គ្រង</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                      <span>កំពុងទាញទិន្នន័យពីប្រព័ន្ធកណ្តាល...</span>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      មិនមានទិន្នន័យត្រូវគ្នានឹងការស្វែងរកឡើយ
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
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <Utensils className="w-2.5 h-2.5" />
                                <span>កក់តុអាហារ</span>
                              </span>
                            ) : (
                              <span className="bg-sky-100 text-sky-900 border border-sky-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <BedDouble className="w-2.5 h-2.5" />
                                <span>កក់បន្ទប់</span>
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-amber-900 block text-xs">
                            {b.id}
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            {new Date(b.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Guest Info */}
                        <td className="py-4 px-4 sm:px-5">
                          <span className="font-extrabold text-[#0c2340] text-sm block">
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
                          <span className="font-bold text-gray-900 block text-xs truncate max-w-[220px]" title={b.roomNameKm || b.roomNameEn}>
                            {b.roomNameKm || b.roomNameEn || b.roomType}
                          </span>
                          <div className="flex items-center space-x-2 mt-1 text-[10px]">
                            {b.roomNumber ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                                {isDin ? b.roomNumber : `បន្ទប់: ${b.roomNumber}`}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">មិនទាន់កំណត់</span>
                            )}
                            <span className="text-gray-500">
                              {isDin ? `${b.adults} នាក់` : `(${b.adults} ធំ, ${b.children} ក្មេង)`}
                            </span>
                          </div>
                        </td>

                        {/* Dates & Schedule */}
                        <td className="py-4 px-4 sm:px-5">
                          {isDin ? (
                            <div>
                              <div className="font-bold text-gray-900">{b.checkIn}</div>
                              <span className="text-[10px] text-amber-800 font-bold block mt-0.5">
                                ម៉ោងកក់: {b.checkInTime || b.reservationTime || "19:00"}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-gray-900">
                                {b.checkIn} → {b.checkOut}
                              </div>
                              <span className="text-[10px] text-gray-500 block mt-0.5">
                                {b.nights} យប់ • In 14:00 / Out 12:00
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Financials & Payment */}
                        <td className="py-4 px-4 sm:px-5">
                          {isDin ? (
                            <div>
                              <span className="font-bold text-gray-900 block text-xs">
                                កក់តុជាមុន (Table Reserve)
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                                ធានាកក់រួចរាល់
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-black text-emerald-700 block font-mono text-sm">
                                ${(b.totalAmountUSD || 0).toFixed(2)}
                              </span>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span
                                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
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
                                  {b.paymentStatus === "PAID" ? "✅ បង់រួច" : "⏳ ធានាកក់"}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Stay / Dining Status */}
                        <td className="py-4 px-4 sm:px-5">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-flex items-center space-x-1 ${
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
                                ? "🛎️ កំពុងស្នាក់នៅ"
                                : b.stayStatus === "SEATED"
                                ? "🍽️ កំពុងទទួលទាន"
                                : b.stayStatus === "CHECKED_OUT"
                                ? "🚪 បានចេញ (Checked Out)"
                                : b.stayStatus === "COMPLETED"
                                ? "🎉 រួចរាល់ (Completed)"
                                : b.stayStatus === "CANCELLED"
                                ? "❌ បានលុបចោល"
                                : "✅ បានកក់ (Confirmed)"}
                            </span>
                          </span>
                        </td>

                        {/* Management Actions */}
                        <td className="py-4 px-4 sm:px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Room Check-In or Dining Seat */}
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
                                  title={isDin ? "ទទួលភ្ញៀវចូលតុ" : "ចុះឈ្មោះភ្ញៀវចូលស្នាក់នៅ (Standard Check-in 14:00)"}
                                >
                                  {isDin ? "ទទួលតុ" : "Check-In"}
                                </button>
                              )}

                            {/* Room Check-Out or Dining Complete */}
                            {(b.stayStatus === "CHECKED_IN" || b.stayStatus === "SEATED") && (
                              <button
                                onClick={() => handleCheckOut(b.id, isDin)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shadow-sm"
                                title={isDin ? "បញ្ចប់ការទទួលទាន" : "ចុះឈ្មោះភ្ញៀវចេញ (Standard Check-out 12:00)"}
                              >
                                {isDin ? "បញ្ចប់" : "Check-Out"}
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
                              title="បោះពុម្ពវិក្កយបត្រ 80mm POS Thermal Receipt"
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
                              title="បោះពុម្ពវិក្កយបត្រពន្ធផ្លូវការ A4 Tax Invoice"
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
      </main>

      {/* ======================= MODAL 1: CHECK-IN / SEAT GUEST ======================= */}
      {checkInModalBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-[#0c2340] text-base">
                  {checkInModalBooking.bookingCategory === "DINING" || checkInModalBooking.id.startsWith("DIN")
                    ? "ទទួលភ្ញៀវចូលតុ & កំណត់លេខតុ"
                    : "Check-In ភ្ញៀវ & កំណត់លេខបន្ទប់"}
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
                  លេខកូដកក់: <strong className="text-amber-800">{checkInModalBooking.id}</strong>
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
                    ? "លេខតុជាក់ស្តែង (Table Number):"
                    : "លេខបន្ទប់ជាក់ស្តែង (Room Number):"}
                </label>
                <input
                  type="text"
                  required
                  value={assignedRoomNumber}
                  onChange={(e) => setAssignedRoomNumber(e.target.value)}
                  placeholder="ឧទាហរណ៍: 201, Table 5, Mekong Suite..."
                  className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3.5 py-2.5 text-gray-900 text-sm font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckInModalBooking(null)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                >
                  បញ្ជាក់ Check-In ឥឡូវ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 2: WALK-IN / NEW BOOKING ======================= */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-[#0c2340] text-base">
                  បង្កើតការកក់ថ្មី (Walk-in / Phone Reservation)
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
                <label className="block text-gray-700 font-bold mb-1">ប្រភេទនៃការកក់</label>
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
                    <span>កក់បន្ទប់ស្នាក់នៅ</span>
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
                    <span>កក់តុអាហារ</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">ឈ្មោះភ្ញៀវ *</label>
                  <input
                    type="text"
                    required
                    value={newBookingData.guestName}
                    onChange={(e) => setNewBookingData({ ...newBookingData, guestName: e.target.value })}
                    placeholder="ឧ. Sokha Heng"
                    className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">លេខទូរស័ព្ទ *</label>
                  <input
                    type="text"
                    required
                    value={newBookingData.phone}
                    onChange={(e) => setNewBookingData({ ...newBookingData, phone: e.target.value })}
                    placeholder="+855 12 888 999"
                    className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
                  />
                </div>
              </div>

              {newBookingData.bookingCategory === "ROOM" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">ប្រភេទបន្ទប់</label>
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
                        className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white cursor-pointer"
                      >
                        <option value="standard-city">បន្ទប់ស្តង់ដារ ទេសភាពទីក្រុង ($85/យប់)</option>
                        <option value="superior-river">បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេ ($125/យប់)</option>
                        <option value="executive-suite">បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ ($195/យប់)</option>
                        <option value="royal-family-suite">បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ ($280/យប់)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">តម្លៃសរុប (USD)</label>
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
                      <label className="block text-gray-700 font-bold mb-1">កាលបរិច្ឆេទ Check-in (14:00)</label>
                      <input
                        type="date"
                        required
                        value={newBookingData.checkIn}
                        onChange={(e) => setNewBookingData({ ...newBookingData, checkIn: e.target.value })}
                        className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">កាលបរិច្ឆេទ Check-out (12:00)</label>
                      <input
                        type="date"
                        required
                        value={newBookingData.checkOut}
                        onChange={(e) => setNewBookingData({ ...newBookingData, checkOut: e.target.value })}
                        className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">កាលបរិច្ឆេទទទួលទាន</label>
                    <input
                      type="date"
                      required
                      value={newBookingData.checkIn}
                      onChange={(e) => setNewBookingData({ ...newBookingData, checkIn: e.target.value })}
                      className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">ម៉ោងកក់</label>
                    <input
                      type="time"
                      required
                      value={newBookingData.reservationTime}
                      onChange={(e) => setNewBookingData({ ...newBookingData, reservationTime: e.target.value })}
                      className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">ចំនួនភ្ញៀវ (Pax)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newBookingData.adults}
                      onChange={(e) => setNewBookingData({ ...newBookingData, adults: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
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
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black rounded-xl shadow transition"
                >
                  រក្សាទុក & ផ្ញើ Alert ទៅ Bot
                </button>
              </div>
            </form>
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
