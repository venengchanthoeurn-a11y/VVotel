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
} from "lucide-react";
import { BookingRecord } from "@/lib/bookings";
import { PrintableReceipt } from "@/components/PrintableReceipt";

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL"); // ALL, TODAY

  // Telegram test state
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
    fetchBookings();
  }, []);

  // Send Telegram test alert to @vvotel_bot
  const handleTestTelegram = async () => {
    setTelegramStatus({ loading: true });
    try {
      const res = await fetch("/api/telegram/test");
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
        // open print receipt
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

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VVotel_Bookings_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for KPI Cards
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
    // Search query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.roomNumber && b.roomNumber.toLowerCase().includes(q));

    // Status filter
    const matchesStatus =
      selectedStatus === "ALL" ||
      b.stayStatus === selectedStatus ||
      b.paymentStatus === selectedStatus;

    // Date filter
    const matchesDate =
      dateFilter === "ALL" ||
      (dateFilter === "TODAY_IN" && b.checkIn === todayStr) ||
      (dateFilter === "TODAY_OUT" && b.checkOut === todayStr);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-vvotel-gold/20 border border-vvotel-gold/40 flex items-center justify-center text-vvotel-gold font-black text-xl shadow">
              V
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  VVotel PMS Admin Portal
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live System
                </span>
              </div>
              <p className="text-xs text-slate-400">
                សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម • ប្រព័ន្ធគ្រប់គ្រងការកក់បន្ទប់ និងភ្ញៀវចូលចេញ
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Telegram Bot Alert Test */}
            <button
              onClick={handleTestTelegram}
              disabled={telegramStatus.loading}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-2 shadow transition disabled:opacity-50"
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
              className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
            >
              <span>Telegram Bot</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Refresh */}
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold p-2 sm:px-3 sm:py-2 rounded-xl flex items-center space-x-1.5 transition"
              title="ទាញទិន្នន័យថ្មី"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-vvotel-gold" : ""}`} />
              <span className="hidden sm:inline">ទាញទិន្នន័យ</span>
            </button>

            {/* Add Walk-in */}
            <button
              onClick={() => setIsNewBookingModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>កក់ផ្ទាល់ / Walk-in</span>
            </button>

            {/* Accor PMS Central deep link */}
            <a
              href="https://all.accor.com/booking/en/accor/hotel/A611"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
              title="ភ្ជាប់ទៅកាន់ប្រព័ន្ធកណ្តាល ALL Accor PMS Hotel A611"
            >
              <span>ALL Accor PMS</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Return to main website */}
            <Link
              href="/"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">គេហទំព័រដើម</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-6">
        {/* Telegram Alert Feedback Toast */}
        {telegramStatus.message && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-2 ${
              telegramStatus.success
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                : "bg-red-950/80 border-red-500/50 text-red-300"
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{telegramStatus.message}</span>
            </div>
            <button
              onClick={() => setTelegramStatus({ loading: false })}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Telegram Integration Notice Card */}
        <div className="bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-white text-sm sm:text-base">
                  ប្រព័ន្ធភ្ជាប់ស្វ័យប្រវត្តិ Telegram Alert (@vvotel_bot)
                </h4>
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Bot ID: 9278143321
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                រាល់ពេលភ្ញៀវធ្វើការកក់បន្ទប់ ឬបាញ់លុយតាម <strong className="text-amber-400">Bakong KHQR</strong> / <strong className="text-amber-400">កាតធនាគារ 3D Secure</strong> លើ Website នោះទិន្នន័យទាំងអស់នឹងរត់ចូល Telegram Bot នេះភ្លាមៗ ២៤ម៉ោង!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <a
              href="https://t.me/vvotel_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial text-center bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center justify-center space-x-2"
            >
              <span>បើកប្រើ @vvotel_bot</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Total Bookings */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>ការកក់សរុប</span>
              <Calendar className="w-4 h-4 text-vvotel-gold" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white">{bookings.length}</span>
              <span className="text-xs text-slate-400 ml-1">កក់</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 font-semibold">ទិន្នន័យកត់ត្រា 100%</span>
          </div>

          {/* Card 2: Revenue USD */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>ចំណូលសរុប (USD)</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                ${totalRevenueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">
              ≈ ៛{Math.round(totalRevenueKHR).toLocaleString()} KHR
            </span>
          </div>

          {/* Card 3: In-House Guests */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>កំពុងស្នាក់នៅ</span>
              <BedDouble className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{inHouseGuests.length}</span>
              <span className="text-xs text-slate-400 ml-1">បន្ទប់</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">In-House Guests</span>
          </div>

          {/* Card 4: Today Check-Ins */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>ចូលថ្ងៃនេះ (14:00)</span>
              <LogIn className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-blue-400">{todayCheckIns.length}</span>
              <span className="text-xs text-slate-400 ml-1">នាក់</span>
            </div>
            <span className="text-[10px] text-blue-300/80 mt-1 font-semibold">Standard: 14:00</span>
          </div>

          {/* Card 5: Today Check-Outs */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>ចេញថ្ងៃនេះ (12:00)</span>
              <LogOut className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-purple-400">{todayCheckOuts.length}</span>
              <span className="text-xs text-slate-400 ml-1">នាក់</span>
            </div>
            <span className="text-[10px] text-purple-300/80 mt-1 font-semibold">Standard: 12:00</span>
          </div>

          {/* Card 6: Telegram Connection */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Telegram Bot</span>
              <Send className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-3 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-base sm:text-lg font-black text-white">Active</span>
            </div>
            <span className="text-[10px] text-sky-400 mt-1 font-mono truncate">@vvotel_bot</span>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាម ឈ្មោះភ្ញៀវ, លេខកូដកក់ (VVT-KC-...), លេខទូរស័ព្ទ, លេខបន្ទប់..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vvotel-gold transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
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
                    ? "bg-vvotel-gold text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
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
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-vvotel-gold"
            >
              <option value="ALL">គ្រប់កាលបរិច្ឆេទ</option>
              <option value="TODAY_IN">ចូលថ្ងៃនេះ (14:00)</option>
              <option value="TODAY_OUT">ចេញថ្ងៃនេះ (12:00)</option>
            </select>

            <button
              onClick={exportToCSV}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
              title="នាំចេញទិន្នន័យជាឯកសារ Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Live Booking Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-vvotel-gold" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                បញ្ជីភ្ញៀវ និងការកក់ទាំងអស់ ({filteredBookings.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              ម៉ោង Check-in ស្តង់ដារ: <strong className="text-amber-400">14:00</strong> | ម៉ោង Check-out: <strong className="text-amber-400">12:00</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">កូដកក់ / កាលបរិច្ឆេទ</th>
                  <th className="py-3 px-4">ឈ្មោះភ្ញៀវ & ទំនាក់ទំនង</th>
                  <th className="py-3 px-4">ប្រភេទបន្ទប់ & លេខបន្ទប់</th>
                  <th className="py-3 px-4">កាលបរិច្ឆេទស្នាក់នៅ</th>
                  <th className="py-3 px-4">ទឹកប្រាក់ & វិធីទូទាត់</th>
                  <th className="py-3 px-4">ស្ថានភាពស្នាក់នៅ</th>
                  <th className="py-3 px-4 text-right">សកម្មភាពគ្រប់គ្រង</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-vvotel-gold" />
                      <span>កំពុងទាញទិន្នន័យការកក់ពីប្រព័ន្ធ...</span>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      មិនមានទិន្នន័យការកក់ត្រូវគ្នានឹងការស្វែងរកឡើយ
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/50 transition">
                      {/* Ref & Date */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-vvotel-gold block">
                          {b.id}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(b.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Guest Info */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-white block">
                          {b.guestName}
                        </span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-2.5 h-2.5 text-slate-500" />
                            <span>{b.phone}</span>
                          </span>
                          <span>•</span>
                          <span>{b.country || "Cambodia"}</span>
                        </div>
                      </td>

                      {/* Room & Room Number */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-200 block truncate max-w-[200px]" title={b.roomNameKm || b.roomNameEn}>
                          {b.roomNameKm || b.roomNameEn || b.roomType}
                        </span>
                        <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
                          {b.roomNumber ? (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                              បន្ទប់: {b.roomNumber}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">មិនទាន់កំណត់បន្ទប់</span>
                          )}
                          <span className="text-slate-400">({b.adults} ធំ, {b.children} ក្មេង)</span>
                        </div>
                      </td>

                      {/* Stay Dates */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {b.checkIn} → {b.checkOut}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {b.nights} យប់ • In 14:00 / Out 12:00
                        </span>
                      </td>

                      {/* Financials & Payment */}
                      <td className="py-3 px-4">
                        <span className="font-black text-emerald-400 block font-mono text-sm">
                          ${(b.totalAmountUSD || 0).toFixed(2)}
                        </span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              b.paymentMethod === "KHQR_BAKONG"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : b.paymentMethod.includes("CARD")
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {b.paymentMethod === "KHQR_BAKONG"
                              ? "Bakong KHQR"
                              : b.paymentMethod.includes("CARD")
                              ? "Card 3D Sec"
                              : "Pay at Hotel"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {b.paymentStatus === "PAID" ? "✅ បង់រួច" : "⏳ ធានាកក់"}
                          </span>
                        </div>
                      </td>

                      {/* Stay Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-flex items-center space-x-1 ${
                            b.stayStatus === "CHECKED_IN"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : b.stayStatus === "CHECKED_OUT"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : b.stayStatus === "CANCELLED"
                              ? "bg-red-500/20 text-red-300 border-red-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Check-In Button */}
                          {b.stayStatus !== "CHECKED_IN" && b.stayStatus !== "CHECKED_OUT" && (
                            <button
                              onClick={() => {
                                setCheckInModalBooking(b);
                                setAssignedRoomNumber(b.roomNumber || "");
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shadow"
                              title="ចុះឈ្មោះភ្ញៀវចូលស្នាក់នៅ (Standard Check-in 14:00)"
                            >
                              Check-In
                            </button>
                          )}

                          {/* Check-Out Button */}
                          {b.stayStatus === "CHECKED_IN" && (
                            <button
                              onClick={() => handleCheckOut(b.id)}
                              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shadow"
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
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-1.5 rounded-lg transition"
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
                            className="bg-slate-800 hover:bg-slate-700 text-vvotel-gold border border-slate-700 px-2 py-1.5 rounded-lg text-[10px] font-bold transition"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-vvotel-gold" />
                <h3 className="font-extrabold text-white text-base">
                  Check-In ភ្ញៀវ & កំណត់លេខបន្ទប់
                </h3>
              </div>
              <button
                onClick={() => setCheckInModalBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckIn} className="mt-4 space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400">
                  លេខកូដកក់: <strong className="text-vvotel-gold">{checkInModalBooking.id}</strong>
                </p>
                <p className="text-white font-bold text-sm">
                  {checkInModalBooking.guestName} ({checkInModalBooking.phone})
                </p>
                <p className="text-slate-300">
                  {checkInModalBooking.roomNameKm || checkInModalBooking.roomNameEn}
                </p>
                <p className="text-emerald-400 font-semibold">
                  ម៉ោង Check-in ស្តង់ដារ: 14:00 (ម៉ោងបច្ចុប្បន្នត្រូវបានកត់ត្រា)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  លេខបន្ទប់ជាក់ស្តែង (Room Number):
                </label>
                <input
                  type="text"
                  required
                  value={assignedRoomNumber}
                  onChange={(e) => setAssignedRoomNumber(e.target.value)}
                  placeholder="ឧទាហរណ៍: 201, 305, Mekong Suite 501..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-vvotel-gold"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckInModalBooking(null)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-vvotel-gold" />
                <h3 className="font-extrabold text-white text-base">
                  បង្កើតការកក់ថ្មី (Walk-in / Phone Reservation)
                </h3>
              </div>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkInBooking} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ឈ្មោះភ្ញៀវ *</label>
                  <input
                    type="text"
                    required
                    value={newBookingData.guestName}
                    onChange={(e) => setNewBookingData({ ...newBookingData, guestName: e.target.value })}
                    placeholder="ឧ. Sokha Heng"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">លេខទូរស័ព្ទ *</label>
                  <input
                    type="text"
                    required
                    value={newBookingData.phone}
                    onChange={(e) => setNewBookingData({ ...newBookingData, phone: e.target.value })}
                    placeholder="+855 12 888 999"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">អ៊ីមែល</label>
                  <input
                    type="email"
                    value={newBookingData.email}
                    onChange={(e) => setNewBookingData({ ...newBookingData, email: e.target.value })}
                    placeholder="guest@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ប្រភេទបន្ទប់</label>
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
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
                  <label className="block text-slate-300 font-bold mb-1">កាលបរិច្ឆេទ Check-in (14:00)</label>
                  <input
                    type="date"
                    required
                    value={newBookingData.checkIn}
                    onChange={(e) => setNewBookingData({ ...newBookingData, checkIn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">កាលបរិច្ឆេទ Check-out (12:00)</label>
                  <input
                    type="date"
                    required
                    value={newBookingData.checkOut}
                    onChange={(e) => setNewBookingData({ ...newBookingData, checkOut: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">វិធីទូទាត់</label>
                  <select
                    value={newBookingData.paymentMethod}
                    onChange={(e) => setNewBookingData({ ...newBookingData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PAY_AT_HOTEL">ទូទាត់នៅកន្លែងទទួលភ្ញៀវ (Cash/POS)</option>
                    <option value="KHQR_BAKONG">Bakong KHQR (ស្កេនទូទាត់)</option>
                    <option value="CARD_3DSECURE_V2">Credit/Debit Card (3D Secure)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">តម្លៃសរុប (USD)</label>
                  <input
                    type="number"
                    value={newBookingData.totalAmountUSD}
                    onChange={(e) => setNewBookingData({ ...newBookingData, totalAmountUSD: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition"
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
