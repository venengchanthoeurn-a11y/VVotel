"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { BookingRecord } from "@/lib/bookings";
import { PrintableReceipt } from "@/components/PrintableReceipt";

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [rememberLogin, setRememberLogin] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Bookings Data State
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL"); // ALL, TODAY_IN, TODAY_OUT

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
  const [newBookingData, setNewBookingData] = useState({
    guestName: "",
    phone: "",
    email: "",
    roomType: "superior-river",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    adults: 2,
    children: 0,
    includeBreakfast: true,
    totalAmountUSD: 125,
    paymentMethod: "PAY_AT_HOTEL",
    roomNumber: "201",
  });

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

    // Authorized Master Passcodes: 2052 (Address No. 2052) or vvotel2026 or admin2052
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
      fetchBookings();
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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

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

  // Perform Check-in
  const handleConfirmCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInModalBooking) return;

    try {
      const res = await fetch(`/api/bookings/${checkInModalBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayStatus: "CHECKED_IN",
          roomNumber: assignedRoomNumber || checkInModalBooking.roomNumber || "101",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckInModalBooking(null);
        setAssignedRoomNumber("");
        await fetchBookings();
      }
    } catch (err) {
      alert("Failed to check-in guest");
    }
  };

  // Perform Check-out
  const handleCheckOut = async (id: string) => {
    if (!confirm("តើអ្នកពិតជាចង់ Check-out ភ្ញៀវនេះមែនទេ? (Check-out Time: 12:00 Standard)")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayStatus: "CHECKED_OUT",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBookings();
      }
    } catch (err) {
      alert("Failed to check-out guest");
    }
  };

  // Create Walk-in Booking
  const handleCreateWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        await fetchBookings();
        if (data.booking) {
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
      "Guest Name",
      "Phone",
      "Email",
      "Room Type",
      "Room Number",
      "Check-In (14:00)",
      "Check-Out (12:00)",
      "Nights",
      "Adults",
      "Children",
      "Total USD",
      "Total KHR",
      "Payment Method",
      "Payment Status",
      "Stay Status",
      "Created At",
    ];

    const rows = bookings.map((b) => [
      b.id,
      `"${b.guestName}"`,
      `"${b.phone}"`,
      `"${b.email}"`,
      `"${b.roomNameEn || b.roomType}"`,
      `"${b.roomNumber || "Unassigned"}"`,
      b.checkIn,
      b.checkOut,
      b.nights,
      b.adults,
      b.children,
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
      `VVotel_Bookings_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const totalRevenueUSD = bookings
    .filter((b) => b.paymentStatus === "PAID" || b.paymentStatus === "GUARANTEED")
    .reduce((acc, b) => acc + (b.totalAmountUSD || 0), 0);
  const totalRevenueKHR = totalRevenueUSD * 4100;

  const todayCheckIns = bookings.filter((b) => b.checkIn === todayStr);
  const todayCheckOuts = bookings.filter((b) => b.checkOut === todayStr);
  const inHouseGuests = bookings.filter((b) => b.stayStatus === "CHECKED_IN");

  // Filtering
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
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
      b.paymentStatus === selectedStatus;

    const matchesDate =
      dateFilter === "ALL" ||
      (dateFilter === "TODAY_IN" && b.checkIn === todayStr) ||
      (dateFilter === "TODAY_OUT" && b.checkOut === todayStr);

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-black text-2xl shadow-sm animate-pulse">
            V
          </div>
          <span className="text-xs font-bold text-gray-500">កំពុងផ្ទៀងផ្ទាត់សិទ្ធិគ្រប់គ្រង...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: SECURITY GATE / LOGIN MODAL (FOR UNAUTHENTICATED USERS)
  // Luxury Egg-Cream (ពណ៌ពងមាន់) & Pure White Security Lock Screen
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#F4EFE6] to-[#ECE5D8] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-950/5 relative overflow-hidden">
          {/* Top Decorative Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

          {/* Luxury Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-[#0c2340] border-2 border-amber-300 flex items-center justify-center text-amber-300 font-black text-3xl shadow-md">
              V
            </div>
            <div>
              <span className="text-[11px] font-black tracking-widest uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Hotel Executive Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight mt-1.5">
                VVotel PMS Security Gate
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម • ប្រព័ន្ធគ្រប់គ្រងផ្ទៃក្នុង
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>ការចូលប្រើប្រាស់ត្រូវបានការពារ៖</strong> អនុញ្ញាតសម្រាប់តែថ្នាក់ដឹកនាំ និងបុគ្គលិកទទួលភ្ញៀវផ្លូវការប៉ុណ្ណោះ។
            </div>
          </div>

          {/* Error Message */}
          {passcodeError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-xs text-red-700 font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passcodeError}</span>
            </div>
          )}

          {/* Passcode Login Form */}
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
                  className="w-full bg-[#FAF8F4] border border-amber-200 rounded-2xl pl-10 pr-11 py-3 text-sm font-mono text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white transition shadow-inner"
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-700 transition"
                  title={showPasscode ? "លាក់លេខកូដ" : "បង្ហាញលេខកូដ"}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5">
                <span className="font-medium text-amber-800">
                  💡 លេខកូដសម្ងាត់សណ្ឋាគារ៖ <strong>2052</strong> (អគារលេខ ២០៥២)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer select-none">
                ចងចាំការចូលប្រើលើឧបករណ៍នេះ (Remember Session)
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>ចូលផ្ទាំងគ្រប់គ្រង (Enter Admin PMS)</span>
            </button>
          </form>

          {/* Bottom Link Back to Website */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-gray-500 hover:text-[#0c2340] transition flex items-center justify-center space-x-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>ត្រឡប់ទៅគេហទំព័រដើម VVotel</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED LUXURY PMS DASHBOARD
  // Warm Egg-Cream (ពណ៌ពងមាន់ - #FAF7F2) & Pure Crisp White (#FFFFFF)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-gray-900 flex flex-col font-sans">
      {/* Top Navigation Bar in Pure White & Warm Ivory */}
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-200/70 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c2340] border border-amber-300 flex items-center justify-center text-amber-300 font-black text-xl shadow-sm">
              V
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl text-[#0c2340] tracking-tight">
                  VVotel PMS Admin Portal
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live System
                </span>
                <span className="hidden sm:inline bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Authorized Manager
                </span>
              </div>
              <p className="text-xs text-gray-500">
                សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម • ប្រព័ន្ធគ្រប់គ្រងការកក់បន្ទប់ និងភ្ញៀវចូលចេញ
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Telegram Bot Alert Test */}
            <button
              onClick={handleTestTelegram}
              disabled={telegramStatus.loading}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
              title="ផ្ញើសារ Alert សាកល្បងទៅកាន់ Telegram Bot @vvotel_bot"
            >
              <Send className={`w-3.5 h-3.5 ${telegramStatus.loading ? "animate-spin" : ""}`} />
              <span>
                {telegramStatus.loading ? "កំពុងផ្ញើ..." : "ផ្ញើ Alert ទៅ @vvotel_bot"}
              </span>
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
              onClick={fetchBookings}
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

            {/* Accor PMS Telegram link */}
            <a
              href="https://t.me/vvotel_bot?start=accor_pms"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
              title="ភ្ជាប់ទៅកាន់ប្រព័ន្ធកណ្តាល ALL Accor PMS តាម Telegram Bot (@vvotel_bot)"
            >
              <span>ALL Accor PMS</span>
              <Send className="w-3 h-3 text-purple-600" />
            </a>

            {/* Return to main website */}
            <Link
              href="/"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">គេហទំព័រដើម</span>
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-6">
        {/* Telegram Alert Feedback Toast */}
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

        {/* Telegram Integration Notice Card in Warm Pastel Styling */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-sky-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-amber-300 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-[#0c2340] text-sm sm:text-base">
                  ប្រព័ន្ធភ្ជាប់ស្វ័យប្រវត្តិ Telegram Alert (@vvotel_bot)
                </h4>
                <span className="bg-sky-100 text-sky-800 border border-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Bot ID: 9278143321
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                រាល់ពេលភ្ញៀវធ្វើការកក់បន្ទប់ ឬបាញ់លុយតាម <strong className="text-amber-800 font-bold">Bakong KHQR</strong> / <strong className="text-amber-800 font-bold">កាតធនាគារ 3D Secure</strong> លើ Website នោះទិន្នន័យទាំងអស់នឹងរត់ចូល Telegram Bot នេះភ្លាមៗ ២៤ម៉ោង!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <a
              href="https://t.me/vvotel_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial text-center bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
            >
              <span>បើកប្រើ @vvotel_bot</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Executive KPI Metric Cards in Pure White with Warm Ivory Accents */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Total Bookings */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>ការកក់សរុប</span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-[#0c2340]">{bookings.length}</span>
              <span className="text-xs text-gray-500 ml-1">កក់</span>
            </div>
            <span className="text-[10px] text-emerald-700 mt-1 font-semibold">ទិន្នន័យកត់ត្រា 100%</span>
          </div>

          {/* Card 2: Revenue USD */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>ចំណូលសរុប (USD)</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                ${totalRevenueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 font-mono">
              ≈ ៛{Math.round(totalRevenueKHR).toLocaleString()} KHR
            </span>
          </div>

          {/* Card 3: In-House Guests */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>កំពុងស្នាក់នៅ</span>
              <BedDouble className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">{inHouseGuests.length}</span>
              <span className="text-xs text-gray-500 ml-1">បន្ទប់</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 font-semibold">In-House Guests</span>
          </div>

          {/* Card 4: Today Check-Ins */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>ចូលថ្ងៃនេះ (14:00)</span>
              <LogIn className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-blue-700">{todayCheckIns.length}</span>
              <span className="text-xs text-gray-500 ml-1">នាក់</span>
            </div>
            <span className="text-[10px] text-blue-700 mt-1 font-semibold">Standard: 14:00</span>
          </div>

          {/* Card 5: Today Check-Outs */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>ចេញថ្ងៃនេះ (12:00)</span>
              <LogOut className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-purple-700">{todayCheckOuts.length}</span>
              <span className="text-xs text-gray-500 ml-1">នាក់</span>
            </div>
            <span className="text-[10px] text-purple-700 mt-1 font-semibold">Standard: 12:00</span>
          </div>

          {/* Card 6: Telegram Connection */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
              <span>Telegram Bot</span>
              <Send className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-3 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-base sm:text-lg font-black text-[#0c2340]">Active</span>
            </div>
            <span className="text-[10px] text-sky-700 mt-1 font-mono truncate">@vvotel_bot</span>
          </div>
        </div>

        {/* Filter and Search Controls in Crisp White Container */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាម ឈ្មោះភ្ញៀវ, លេខកូដកក់ (VVT-KC-...), លេខទូរស័ព្ទ, លេខបន្ទប់..."
              className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 bg-[#FAF8F4] p-1 rounded-xl border border-amber-200/60 text-xs">
            {[
              { id: "ALL", label: "ទាំងអស់" },
              { id: "CONFIRMED", label: "បានកក់" },
              { id: "CHECKED_IN", label: "កំពុងស្នាក់នៅ" },
              { id: "CHECKED_OUT", label: "បានចេញ" },
              { id: "PAID", label: "បង់រួច" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  selectedStatus === tab.id
                    ? "bg-[#0c2340] text-amber-300 shadow-sm"
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
              <option value="TODAY_IN">ចូលថ្ងៃនេះ (14:00)</option>
              <option value="TODAY_OUT">ចេញថ្ងៃនេះ (12:00)</option>
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

        {/* Live Booking Table in Crisp White */}
        <div className="bg-white border border-amber-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-amber-200/60 bg-[#FAF8F4] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-sm sm:text-base text-[#0c2340]">
                បញ្ជីភ្ញៀវ និងការកក់ទាំងអស់ ({filteredBookings.length})
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              ម៉ោង Check-in ស្តង់ដារ: <strong className="text-amber-800">14:00</strong> | ម៉ោង Check-out: <strong className="text-amber-800">12:00</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#F6F2E9] text-gray-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-amber-200/70">
                <tr>
                  <th className="py-3.5 px-4">កូដកក់ / កាលបរិច្ឆេទ</th>
                  <th className="py-3.5 px-4">ឈ្មោះភ្ញៀវ & ទំនាក់ទំនង</th>
                  <th className="py-3.5 px-4">ប្រភេទបន្ទប់ & លេខបន្ទប់</th>
                  <th className="py-3.5 px-4">កាលបរិច្ឆេទស្នាក់នៅ</th>
                  <th className="py-3.5 px-4">ទឹកប្រាក់ & វិធីទូទាត់</th>
                  <th className="py-3.5 px-4">ស្ថានភាពស្នាក់នៅ</th>
                  <th className="py-3.5 px-4 text-right">សកម្មភាពគ្រប់គ្រង</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                      <span>កំពុងទាញទិន្នន័យការកក់ពីប្រព័ន្ធ...</span>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      មិនមានទិន្នន័យការកក់ត្រូវគ្នានឹងការស្វែងរកឡើយ
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-amber-50/40 transition">
                      {/* Ref & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-800 block">
                          {b.id}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          {new Date(b.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Guest Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#0c2340] block">
                          {b.guestName}
                        </span>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-2.5 h-2.5 text-gray-400" />
                            <span>{b.phone}</span>
                          </span>
                          <span>•</span>
                          <span>{b.country || "Cambodia"}</span>
                        </div>
                      </td>

                      {/* Room & Room Number */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block truncate max-w-[200px]" title={b.roomNameKm || b.roomNameEn}>
                          {b.roomNameKm || b.roomNameEn || b.roomType}
                        </span>
                        <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
                          {b.roomNumber ? (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                              បន្ទប់: {b.roomNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">មិនទាន់កំណត់បន្ទប់</span>
                          )}
                          <span className="text-gray-500">({b.adults} ធំ, {b.children} ក្មេង)</span>
                        </div>
                      </td>

                      {/* Stay Dates */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">
                          {b.checkIn} → {b.checkOut}
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {b.nights} យប់ • In 14:00 / Out 12:00
                        </span>
                      </td>

                      {/* Financials & Payment */}
                      <td className="py-3.5 px-4">
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
                      </td>

                      {/* Stay Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-flex items-center space-x-1 ${
                            b.stayStatus === "CHECKED_IN"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : b.stayStatus === "CHECKED_OUT"
                              ? "bg-purple-100 text-purple-900 border-purple-300"
                              : b.stayStatus === "CANCELLED"
                              ? "bg-red-100 text-red-900 border-red-300"
                              : "bg-emerald-100 text-emerald-900 border-emerald-300"
                          }`}
                        >
                          <span>
                            {b.stayStatus === "CHECKED_IN"
                              ? "🛎️ កំពុងស្នាក់នៅ"
                              : b.stayStatus === "CHECKED_OUT"
                              ? "🚪 បានចេញ (Checked Out)"
                              : b.stayStatus === "CANCELLED"
                              ? "❌ បានលុបចោល"
                              : "✅ បានកក់ (Confirmed)"}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Check-In Button */}
                          {b.stayStatus !== "CHECKED_IN" && b.stayStatus !== "CHECKED_OUT" && (
                            <button
                              onClick={() => {
                                setCheckInModalBooking(b);
                                setAssignedRoomNumber(b.roomNumber || "");
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shadow-sm"
                              title="ចុះឈ្មោះភ្ញៀវចូលស្នាក់នៅ (Standard Check-in 14:00)"
                            >
                              Check-In
                            </button>
                          )}

                          {/* Check-Out Button */}
                          {b.stayStatus === "CHECKED_IN" && (
                            <button
                              onClick={() => handleCheckOut(b.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shadow-sm"
                              title="ចុះឈ្មោះភ្ញៀវចេញ (Standard Check-out 12:00)"
                            >
                              Check-Out
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ======================= MODAL 1: CHECK-IN ASSIGN ROOM ======================= */}
      {checkInModalBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-[#0c2340] text-base">
                  Check-In ភ្ញៀវ & កំណត់លេខបន្ទប់
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
                <p className="text-emerald-700 font-semibold">
                  ម៉ោង Check-in ស្តង់ដារ: 14:00 (ម៉ោងបច្ចុប្បន្នត្រូវបានកត់ត្រា)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  លេខបន្ទប់ជាក់ស្តែង (Room Number):
                </label>
                <input
                  type="text"
                  required
                  value={assignedRoomNumber}
                  onChange={(e) => setAssignedRoomNumber(e.target.value)}
                  placeholder="ឧទាហរណ៍: 201, 305, Mekong Suite 501..."
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">អ៊ីមែល</label>
                  <input
                    type="email"
                    value={newBookingData.email}
                    onChange={(e) => setNewBookingData({ ...newBookingData, email: e.target.value })}
                    placeholder="guest@example.com"
                    className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white"
                  />
                </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">វិធីទូទាត់</label>
                  <select
                    value={newBookingData.paymentMethod}
                    onChange={(e) => setNewBookingData({ ...newBookingData, paymentMethod: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white cursor-pointer"
                  >
                    <option value="PAY_AT_HOTEL">ទូទាត់នៅកន្លែងទទួលភ្ញៀវ (Cash/POS)</option>
                    <option value="KHQR_BAKONG">Bakong KHQR (ស្កេនទូទាត់)</option>
                    <option value="CARD_3DSECURE_V2">Credit/Debit Card (3D Secure)</option>
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
