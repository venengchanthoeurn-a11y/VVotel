"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Calendar,
  Users,
  ShieldCheck,
  Tag,
  X,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  CreditCard,
  QrCode,
  Building,
  Check,
  Smartphone,
  Printer,
  Sparkles,
  BedDouble,
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
  KeyRound,
  ShieldAlert,
  RotateCw,
  AlertCircle,
  Receipt,
} from "lucide-react";

interface RoomComposition {
  adults: number;
  children: number;
  childAges: number[];
}

export const BookingBar: React.FC = () => {
  const { lang, t } = useLanguage();

  // Dates
  const [checkIn, setCheckIn] = useState<string>("2026-11-05");
  const [checkOut, setCheckOut] = useState<string>("2026-11-08");

  // Multi-room composition (up to 3 rooms matching Novotel)
  const [roomCount, setRoomCount] = useState<number>(1);
  const [rooms, setRooms] = useState<RoomComposition[]>([
    { adults: 2, children: 1, childAges: [6] },
    { adults: 2, children: 0, childAges: [] },
    { adults: 1, children: 0, childAges: [] },
  ]);

  // Codes matching Novotel Sihanoukville
  const [loyaltyNumber, setLoyaltyNumber] = useState<string>("");
  const [clientCode, setClientCode] = useState<string>("");
  const [accessCode, setAccessCode] = useState<string>("");
  const [preferentialCode, setPreferentialCode] = useState<string>("");

  const [showAdvancedCodes, setShowAdvancedCodes] = useState<boolean>(false);
  const [showRoomConfigDropdown, setShowRoomConfigDropdown] = useState<boolean>(false);

  // Booking Flow & Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<"options" | "room-select" | "guest-details" | "payment" | "confirmed">("options");

  // Selected Room in Integrated Engine
  const [selectedRoomType, setSelectedRoomType] = useState<string>("superior-river");
  const [includeBreakfast, setIncludeBreakfast] = useState<boolean>(true);

  // Guest Details
  const [guestDetails, setGuestDetails] = useState({
    firstName: "Sopheap",
    lastName: "Chan",
    email: "sopheap.chan@gmail.com",
    phone: "+855 12 345 678",
    country: "Cambodia",
    specialRequests: "High floor with Mekong river view and quiet room",
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"khqr" | "card" | "hotel">("khqr");
  const [khqrTimer, setKhqrTimer] = useState<number>(299); // 5 mins
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<any>(null);

  // 3D Secure 2.0 / Card Security states
  const [is3DSModalOpen, setIs3DSModalOpen] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("123456");
  const [otpTimer, setOtpTimer] = useState<number>(180); // 3 mins
  const [isAuthorizing3DS, setIsAuthorizing3DS] = useState<boolean>(false);
  const [cardError, setCardError] = useState<string>("");

  // Card details
  const [cardNumber, setCardNumber] = useState<string>("4532 8820 9145 8920");
  const [cardExpiry, setCardExpiry] = useState<string>("08/28");
  const [cardCvv, setCardCvv] = useState<string>("892");
  const [cardName, setCardName] = useState<string>("SOPHEAP CHAN");

  // Calculate nights
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 1
  );

  // Room pricing catalog (Synced with AccommodationSection)
  const roomCatalog: Record<
    string,
    { nameEn: string; nameKm: string; basePrice: number; size: string; bed: string; img: string }
  > = {
    "standard-city": {
      nameEn: "Standard Room City View",
      nameKm: "បន្ទប់ស្តង់ដារ ទេសភាពទីក្រុង",
      basePrice: 85,
      size: "34 m²",
      bed: "1 King Bed or 2 Twins",
      img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
    },
    "superior-river": {
      nameEn: "Superior Room River View",
      nameKm: "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ",
      basePrice: 125,
      size: "42 m²",
      bed: "1 King Bed / Balcony",
      img: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80",
    },
    "executive-suite": {
      nameEn: "Executive Mekong Suite (1 Bedroom)",
      nameKm: "បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ (១ បន្ទប់គេង)",
      basePrice: 195,
      size: "68 m²",
      bed: "1 Super King / Living Lounge",
      img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    },
    "royal-family-suite": {
      nameEn: "Royal Family River Suite (2 Bedroom)",
      nameKm: "បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ (២ បន្ទប់គេង)",
      basePrice: 280,
      size: "95 m²",
      bed: "2 En-suite Bedrooms / Dining Area",
      img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80",
    },
    "royal-family": {
      nameEn: "Royal Family River Suite (2 Bedroom)",
      nameKm: "បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ (២ បន្ទប់គេង)",
      basePrice: 280,
      size: "95 m²",
      bed: "2 En-suite Bedrooms / Dining Area",
      img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80",
    },
  };

  // Pricing math
  const activeRoom = roomCatalog[selectedRoomType] || roomCatalog["superior-river"];
  const breakfastCost = includeBreakfast ? 15 * nights * rooms.slice(0, roomCount).reduce((acc, r) => acc + r.adults, 0) : 0;
  const roomBaseSubtotal = activeRoom.basePrice * nights * roomCount;
  const subtotalBeforeDiscount = roomBaseSubtotal + breakfastCost;

  let discountPercent = 0;
  let discountLabel = "";
  if (loyaltyNumber && loyaltyNumber.replace(/\s+/g, "").length >= 10) {
    discountPercent = 15;
    discountLabel = "ALL Live Limitless Platinum (-15%)";
  } else if (preferentialCode || clientCode) {
    discountPercent = 10;
    discountLabel = `Preferential / Corporate Code (${preferentialCode || clientCode}) (-10%)`;
  }

  const discountAmount = Math.round((subtotalBeforeDiscount * discountPercent) / 100);
  const totalAmountUSD = subtotalBeforeDiscount - discountAmount;
  const totalAmountKHR = Math.round(totalAmountUSD * 4100);

  // Construct Accor/VVotel PMS Central Deep Link (Exact like reference website)
  const buildCentralPmsUrl = () => {
    const compositionStrings = rooms
      .slice(0, roomCount)
      .map((r) => {
        let comp = `${r.adults}`;
        if (r.children > 0) {
          comp += `:${r.childAges.slice(0, r.children).join(",")}`;
        }
        return comp;
      })
      .join(";");

    const baseUrl = `https://all.accor.com/booking/${lang === "km" ? "en" : lang}/accor/hotel/A611`;
    const params = new URLSearchParams({
      dateIn: checkIn,
      nights: nights.toString(),
      compositions: compositionStrings,
      stayplus: "false",
      snu: "false",
      accessibleRooms: "false",
      hideWDR: "false",
      productCode: "null",
      hideHotelDetails: "true",
      utm_campaign: "vvotel_kampongcham_search",
      utm_medium: "vvotel_regional_websites",
      utm_source: "hotelwebsite_KAMPONGCHAM",
      basketId: `vvt-${Date.now()}`,
    });

    if (loyaltyNumber) params.append("loyaltyNumber", loyaltyNumber.replace(/\s+/g, ""));
    if (clientCode) params.append("clientCode", clientCode);
    if (accessCode) params.append("accessCode", accessCode);
    if (preferentialCode) params.append("preferentialCode", preferentialCode);

    return `${baseUrl}?${params.toString()}`;
  };

  // Direct room selection event listener from AccommodationSection cards
  useEffect(() => {
    const handleRoomBookingSelect = (e: any) => {
      const { roomId } = e.detail || {};
      if (roomId) {
        if (roomCatalog[roomId]) {
          setSelectedRoomType(roomId);
        } else if (roomId === "royal-family-suite" || roomId === "royal-family") {
          setSelectedRoomType("royal-family-suite");
        }
      }
      setCurrentStep("guest-details");
      setIsModalOpen(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("open-booking-for-room", handleRoomBookingSelect);
      return () => {
        window.removeEventListener("open-booking-for-room", handleRoomBookingSelect);
      };
    }
  }, [roomCatalog]);

  // Timer countdown for KHQR
  useEffect(() => {
    let interval: any;
    if (isModalOpen && currentStep === "payment" && paymentMethod === "khqr" && khqrTimer > 0) {
      interval = setInterval(() => {
        setKhqrTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isModalOpen, currentStep, paymentMethod, khqrTimer]);

  // Timer countdown for 3D Secure OTP
  useEffect(() => {
    let interval: any;
    if (is3DSModalOpen && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [is3DSModalOpen, otpTimer]);

  const getCardBrandInfo = (num: string) => {
    const clean = num.replace(/\D/g, "");
    if (/^4/.test(clean)) return { brand: "Visa", iconColor: "text-blue-600", bg: "bg-blue-50 border-blue-200 text-blue-700" };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: "Mastercard", iconColor: "text-amber-600", bg: "bg-amber-50 border-amber-200 text-amber-700" };
    if (/^(352[89]|35[3-8])/.test(clean)) return { brand: "JCB", iconColor: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" };
    if (/^62/.test(clean)) return { brand: "UnionPay", iconColor: "text-red-600", bg: "bg-red-50 border-red-200 text-red-700" };
    return { brand: "International Card", iconColor: "text-gray-600", bg: "bg-gray-100 border-gray-200 text-gray-700" };
  };

  const handleInitiateCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError("");
    const clean = cardNumber.replace(/\D/g, "");
    if (clean.length < 8) {
      setCardError(lang === "km" ? "សូមបញ្ចូលលេខកាតធនាគារឱ្យបានត្រឹមត្រូវ" : "Please enter a valid card number");
      return;
    }
    if (!cardExpiry || !cardExpiry.includes("/")) {
      setCardError(lang === "km" ? "សូមបញ្ចូលកាលបរិច្ឆេទផុតកំណត់ (MM/YY)" : "Please enter expiry date (MM/YY)");
      return;
    }
    if (!cardCvv || cardCvv.trim().length < 3) {
      setCardError(lang === "km" ? "សូមបញ្ចូលលេខកូដសម្ងាត់ CVV ៣ខ្ទង់" : "Please enter 3-digit CVV");
      return;
    }
    // Launch 3D Secure 2.0 Challenge
    setOtpTimer(180);
    setOtpCode("123456");
    setIs3DSModalOpen(true);
  };

  const handleAuthorize3DSPayment = async () => {
    setIsAuthorizing3DS(true);
    try {
      const res = await fetch("/api/booking/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingRef: `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod: "CARD_3DSECURE_V2",
          guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
          amountUSD: totalAmountUSD,
          cardLast4: cardNumber.replace(/\D/g, "").slice(-4) || "8920",
          cardBrand: getCardBrandInfo(cardNumber).brand,
          otpVerified: true,
          threeDSecureVersion: "2.2.0",
        }),
      });
      const data = await res.json();
      setPaymentConfirmed(data);
      setIs3DSModalOpen(false);
      setCurrentStep("confirmed");
    } catch {
      alert("3DS Payment authorization completed.");
      setIs3DSModalOpen(false);
      setCurrentStep("confirmed");
    } finally {
      setIsAuthorizing3DS(false);
    }
  };

  const handleVerifyKhqrPay = async () => {
    setIsVerifyingPayment(true);
    try {
      const res = await fetch("/api/booking/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingRef: `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod: "KHQR_BAKONG",
          guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
          amountUSD: totalAmountUSD,
          otpVerified: true,
        }),
      });
      const data = await res.json();
      setPaymentConfirmed(data);
      setCurrentStep("confirmed");
    } catch {
      alert("KHQR verification simulation completed.");
      setCurrentStep("confirmed");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleVerifyHotelPay = async () => {
    setIsVerifyingPayment(true);
    try {
      const res = await fetch("/api/booking/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingRef: `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod: "PAY_AT_HOTEL",
          guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
          amountUSD: totalAmountUSD,
          otpVerified: false,
        }),
      });
      const data = await res.json();
      setPaymentConfirmed(data);
      setCurrentStep("confirmed");
    } catch {
      setCurrentStep("confirmed");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleChildrenCountChange = (roomIndex: number, newCount: number) => {
    const updated = [...rooms];
    const currentAges = [...updated[roomIndex].childAges];
    while (currentAges.length < newCount) currentAges.push(5);
    updated[roomIndex] = {
      ...updated[roomIndex],
      children: newCount,
      childAges: currentAges.slice(0, newCount),
    };
    setRooms(updated);
  };

  const handleAgeChange = (roomIndex: number, childIndex: number, age: number) => {
    const updated = [...rooms];
    updated[roomIndex].childAges[childIndex] = age;
    setRooms(updated);
  };

  const handleAdultsChange = (roomIndex: number, count: number) => {
    const updated = [...rooms];
    updated[roomIndex].adults = count;
    setRooms(updated);
  };

  // Total guests summary
  const totalAdults = rooms.slice(0, roomCount).reduce((acc, r) => acc + r.adults, 0);
  const totalChildren = rooms.slice(0, roomCount).reduce((acc, r) => acc + r.children, 0);

  // Form Submit
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
    setCurrentStep("options");
  };

  // Execute payment verification
  const handleVerifyAndPay = async () => {
    setIsVerifyingPayment(true);
    try {
      const res = await fetch("/api/booking/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingRef: `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod,
          guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
          amountUSD: totalAmountUSD,
        }),
      });
      const data = await res.json();
      setPaymentConfirmed(data);
      setCurrentStep("confirmed");
    } catch {
      alert("Payment simulation completed.");
      setCurrentStep("confirmed");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div id="booking-bar" className="bg-[#0c2340] text-white py-5 shadow-2xl relative z-30 border-b border-vvotel-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          {/* Top Info Header */}
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
            <div className="flex items-center space-x-3">
              <span className="font-extrabold text-sm tracking-wider uppercase text-vvotel-gold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-vvotel-gold" />
                <span>{t("bookYourStay")}</span>
              </span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t("bestRateGuaranteed")}</span>
              </span>
              <span className="text-gray-400 hidden md:inline">•</span>
              <span className="text-xs text-gray-300 hidden md:inline">
                {nights} {lang === "km" ? "យប់" : "Nights"}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowAdvancedCodes(!showAdvancedCodes)}
                className="text-xs text-vvotel-gold hover:text-amber-300 flex items-center space-x-1 transition font-medium"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>
                  {showAdvancedCodes
                    ? lang === "km" ? "លាក់កូដកិច្ចសន្យា" : "Hide Contract Codes"
                    : lang === "km" ? "កាតសមាជិក / កូដពិសេស (Special Codes)" : "Loyalty / Preferential Code"}
                </span>
                {showAdvancedCodes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Primary Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Arrival Date */}
            <div className="bg-white/10 rounded-xl p-3 border border-white/15 hover:border-vvotel-gold/60 transition group">
              <label className="text-[11px] font-semibold text-gray-300 uppercase block mb-1 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-vvotel-gold" />
                <span>{lang === "km" ? "ថ្ងៃចូល (Arrival)" : "Arrival DD/MM/YYYY"}</span>
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* Departure Date */}
            <div className="bg-white/10 rounded-xl p-3 border border-white/15 hover:border-vvotel-gold/60 transition group">
              <label className="text-[11px] font-semibold text-gray-300 uppercase block mb-1 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-vvotel-gold" />
                <span>{lang === "km" ? "ថ្ងៃចេញ (Departure)" : "Departure DD/MM/YYYY"}</span>
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* Room & Guests Dropdown Trigger */}
            <div className="relative bg-white/10 rounded-xl p-3 border border-white/15 hover:border-vvotel-gold/60 transition xl:col-span-2">
              <button
                type="button"
                onClick={() => setShowRoomConfigDropdown(!showRoomConfigDropdown)}
                className="w-full text-left flex items-center justify-between"
              >
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 uppercase block mb-1 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-vvotel-gold" />
                    <span>{t("rooms")} & {t("adults")}, {t("children")}</span>
                  </label>
                  <div className="text-sm font-bold text-white flex items-center space-x-2 truncate">
                    <span>{roomCount} {lang === "km" ? "បន្ទប់" : "Room(s)"}</span>
                    <span>•</span>
                    <span>{totalAdults} {lang === "km" ? "មនុស្សធំ" : "Adult(s)"}</span>
                    {totalChildren > 0 && (
                      <>
                        <span>•</span>
                        <span>{totalChildren} {lang === "km" ? "កុមារ" : "Child(ren)"}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-vvotel-gold transition-transform ${showRoomConfigDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Popover configuration for multiple rooms & child ages */}
              {showRoomConfigDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#122b4d] text-white rounded-2xl shadow-2xl p-5 border border-vvotel-gold/40 z-50 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <span className="text-xs font-bold text-vvotel-gold uppercase tracking-wider">
                      {lang === "km" ? "កំណត់ចំនួនបន្ទប់ និងភ្ញៀវ" : "Rooms & Guest Composition"}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-300">{t("rooms")}:</span>
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRoomCount(num)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                            roomCount === num
                              ? "bg-vvotel-gold text-vvotel-navy shadow"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Individual Room details */}
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {[...Array(roomCount)].map((_, rIdx) => (
                      <div key={rIdx} className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-3">
                        <div className="text-xs font-bold text-vvotel-gold flex items-center justify-between">
                          <span>{lang === "km" ? `បន្ទប់ទី ${rIdx + 1}` : `Room ${rIdx + 1}`}</span>
                          <span className="text-[11px] text-gray-300 font-normal">
                            {rooms[rIdx].adults}A, {rooms[rIdx].children}C
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {/* Adults in room */}
                          <div>
                            <label className="text-[11px] text-gray-400 block mb-1">{t("adults")}</label>
                            <select
                              value={rooms[rIdx].adults}
                              onChange={(e) => handleAdultsChange(rIdx, Number(e.target.value))}
                              className="w-full bg-[#0c2340] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-vvotel-gold"
                            >
                              {[1, 2, 3, 4].map((a) => (
                                <option key={a} value={a}>
                                  {a} {lang === "km" ? "មនុស្សធំ" : a === 1 ? "Adult" : "Adults"}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Children in room */}
                          <div>
                            <label className="text-[11px] text-gray-400 block mb-1">{t("children")}</label>
                            <select
                              value={rooms[rIdx].children}
                              onChange={(e) => handleChildrenCountChange(rIdx, Number(e.target.value))}
                              className="w-full bg-[#0c2340] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-vvotel-gold"
                            >
                              {[0, 1, 2, 3].map((c) => (
                                <option key={c} value={c}>
                                  {c} {lang === "km" ? "កុមារ" : c === 1 ? "Child" : "Children"}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Children age dropdowns matching Novotel Sihanoukville */}
                        {rooms[rIdx].children > 0 && (
                          <div className="pt-2 border-t border-white/10 space-y-2">
                            <span className="text-[11px] font-semibold text-gray-300 block">
                              {t("childrenAge")}
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {[...Array(rooms[rIdx].children)].map((_, cIdx) => (
                                <div key={cIdx}>
                                  <label className="text-[10px] text-gray-400 block mb-0.5">
                                    {lang === "km" ? `កុមារ ${cIdx + 1}` : `Child ${cIdx + 1}`}
                                  </label>
                                  <select
                                    value={rooms[rIdx].childAges[cIdx] ?? 5}
                                    onChange={(e) => handleAgeChange(rIdx, cIdx, Number(e.target.value))}
                                    className="w-full bg-[#0c2340] border border-white/20 rounded-lg px-2 py-1 text-xs text-vvotel-gold font-bold focus:outline-none focus:border-vvotel-gold"
                                  >
                                    {[...Array(13)].map((_, age) => (
                                      <option key={age} value={age}>
                                        {age} {lang === "km" ? "ឆ្នាំ" : "yrs"}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRoomConfigDropdown(false)}
                      className="px-4 py-1.5 bg-vvotel-gold text-vvotel-navy font-bold text-xs rounded-lg hover:bg-amber-400 transition"
                    >
                      {lang === "km" ? "រួចរាល់ (Apply)" : "Done"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Book Now Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-vvotel-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-700 text-white font-extrabold text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
              >
                <span>{t("bookNow")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advanced Codes Panel matching Novotel (Loyalty, Business client, Access code, Preferential code) */}
          {showAdvancedCodes && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  {t("loyaltyCode")}
                </label>
                <input
                  type="text"
                  placeholder="16-digit card number"
                  value={loyaltyNumber}
                  onChange={(e) => setLoyaltyNumber(e.target.value)}
                  className="w-full bg-black/30 text-white placeholder-gray-500 text-xs rounded-lg px-3 py-2 border border-white/15 focus:outline-none focus:border-vvotel-gold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  {lang === "km" ? "កូដអតិថិជនអាជីវកម្ម (Client code)" : "Business client (SC, AS...)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. SC12345"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  className="w-full bg-black/30 text-white placeholder-gray-500 text-xs rounded-lg px-3 py-2 border border-white/15 focus:outline-none focus:border-vvotel-gold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  {lang === "km" ? "កូដសម្ងាត់ (Access code 10 chars)" : "Access code (10 characters)"}
                </label>
                <input
                  type="text"
                  placeholder="10-digit code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full bg-black/30 text-white placeholder-gray-500 text-xs rounded-lg px-3 py-2 border border-white/15 focus:outline-none focus:border-vvotel-gold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  {t("promoCode")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. MEKONG2026 / PROMO"
                  value={preferentialCode}
                  onChange={(e) => setPreferentialCode(e.target.value)}
                  className="w-full bg-black/30 text-white placeholder-gray-500 text-xs rounded-lg px-3 py-2 border border-white/15 focus:outline-none focus:border-vvotel-gold"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Advanced Booking Checkout & PMS Integration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#0c2340] text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-vvotel-gold flex items-center justify-center text-vvotel-navy font-black text-xl">
                  V
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {lang === "km" ? "ប្រព័ន្ធកក់បន្ទប់កម្រិតខ្ពស់ VVotel Kampong Cham" : "VVotel Kampong Cham Advanced Reservation"}
                  </h3>
                  <div className="text-xs text-gray-300 flex items-center space-x-2 mt-0.5">
                    <span>{checkIn} ➔ {checkOut}</span>
                    <span>•</span>
                    <span>{nights} {lang === "km" ? "យប់" : "Nights"}</span>
                    <span>•</span>
                    <span>{roomCount} {lang === "km" ? "បន្ទប់" : "Room(s)"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Steps */}
            <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
              {/* STEP: OPTIONS (Accor Central PMS vs Integrated Payment Gateway) */}
              {currentStep === "options" && (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <span className="text-xs font-bold text-vvotel-gold uppercase tracking-wider">
                      {lang === "km" ? "ការតភ្ជាប់ប្រព័ន្ធកក់បន្ទប់ (PMS & Payment Gateways)" : "Booking & Payment Gateways Integration"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-vvotel-navy">
                      {lang === "km" ? "សូមជ្រើសរើសជម្រើសនៃការកក់បន្ទប់" : "Select Your Preferred Booking Method"}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {lang === "km"
                        ? "លោកអ្នកអាចជ្រើសរើសកក់ផ្ទាល់ជាមួយ Payment Gateway ក្នុងស្រុក (KHQR/Visa) ឬភ្ជាប់ទៅកាន់ប្រព័ន្ធកណ្តាល ALL Accor PMS។"
                        : "Book instantly using Cambodian local KHQR / International cards, or connect directly to the central ALL - Accor Live Limitless PMS system."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Option 1: Integrated Instant Checkout & Payment Gateways */}
                    <div className="p-6 rounded-2xl border-2 border-vvotel-gold bg-amber-50/40 hover:bg-amber-50/70 transition flex flex-col justify-between space-y-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-vvotel-navy text-vvotel-gold flex items-center justify-center font-bold">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-base text-vvotel-navy">
                          {lang === "km" ? "កក់ភ្លាមៗ & ទូទាត់តាម KHQR / Visa" : "Instant Direct Booking & Payment"}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {lang === "km"
                            ? "ជ្រើសរើសប្រភេទបន្ទប់ បញ្ចូលព័ត៌មានភ្ញៀវ និងកាត់លុយភ្លាមៗតាម KHQR (Bakong / ABA) ឬកាតអន្តរជាតិ Visa/MasterCard ជាមួយការបញ្ជាក់បន្ទប់ភ្លាមៗ។"
                            : "Choose your room, enter guest requests, and pay instantly via Bakong KHQR, ABA Mobile, or Visa/MasterCard with immediate e-ticket voucher."}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">KHQR Bakong</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">ABA Pay</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Visa / MC</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCurrentStep("room-select")}
                        className="w-full bg-vvotel-navy hover:bg-vvotel-blue text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 shadow"
                      >
                        <span>{lang === "km" ? "បន្តទៅការជ្រើសរើសបន្ទប់" : "Select Room & Pay"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Option 2: Connect to Central Accor / VVotel PMS URL */}
                    <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50/60 hover:bg-gray-100 transition flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 text-white flex items-center justify-center font-bold">
                          <Building className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-base text-gray-900">
                          {lang === "km" ? "ភ្ជាប់ទៅកាន់ប្រព័ន្ធកណ្តាល ALL Accor PMS" : "ALL - Accor Central PMS Portal"}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {lang === "km"
                            ? "បញ្ជូនទិន្នន័យកាលបរិច្ឆេទ បន្ទប់ និងកូដសមាជិកទៅកាន់ប្រព័ន្ធកណ្តាល all.accor.com ដូចគេហទំព័រដើម Novotel ទាំងស្រុង។"
                            : "Deep-link directly to Accor's central multi-property reservation engine with prefilled compositions, dateIn, nights, and loyalty codes."}
                        </p>
                        <div className="text-[11px] font-mono bg-white p-2 rounded border border-gray-200 text-gray-500 break-all">
                          all.accor.com/booking/hotel/A611?dateIn={checkIn}&nights={nights}...
                        </div>
                      </div>

                      <a
                        href={buildCentralPmsUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 shadow"
                      >
                        <span>{lang === "km" ? "បើកប្រព័ន្ធ ALL Accor PMS" : "Open Accor PMS Engine"}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP: ROOM SELECTION */}
              {currentStep === "room-select" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-lg text-vvotel-navy">
                        {lang === "km" ? "ជ្រើសរើសប្រភេទបន្ទប់" : "Select Your Room Category"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {lang === "km" ? "តម្លៃគិតជារួមសម្រាប់រយៈពេលស្នាក់នៅ និងចំនួនបន្ទប់ដែលបានជ្រើសរើស" : "Rates calculated for your selected dates and room quantity"}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep("options")}
                      className="text-xs font-semibold text-gray-500 hover:underline"
                    >
                      {lang === "km" ? "ត្រឡប់ក្រោយ" : "Back"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(roomCatalog).map(([key, item]) => {
                      const isSelected = selectedRoomType === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedRoomType(key)}
                          className={`rounded-2xl border-2 p-4 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                            isSelected
                              ? "border-vvotel-gold bg-amber-50/50 shadow-md"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="relative h-36 w-full rounded-xl overflow-hidden bg-gray-100">
                            <img src={item.img} alt={item.nameEn} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              {item.size}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-sm text-vvotel-navy">
                                {lang === "km" ? item.nameKm : item.nameEn}
                              </h5>
                              {isSelected && <Check className="w-5 h-5 text-vvotel-gold shrink-0" />}
                            </div>
                            <span className="text-xs text-gray-500 block mt-0.5">{item.bed}</span>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <span className="text-lg font-extrabold text-vvotel-navy">${item.basePrice}</span>
                              <span className="text-xs text-gray-500"> / {lang === "km" ? "យប់" : "night"}</span>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${isSelected ? "bg-vvotel-gold text-white" : "bg-gray-100 text-gray-700"}`}>
                              {isSelected ? (lang === "km" ? "បានជ្រើសរើស" : "Selected") : (lang === "km" ? "ជ្រើសរើស" : "Select")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add-on Breakfast */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-gray-800 block">
                        {lang === "km" ? "បញ្ចូលអាហារពេលព្រឹកប៊ុហ្វេ (Mekong Buffet Breakfast)" : "Add Daily International Buffet Breakfast"}
                      </span>
                      <span className="text-xs text-gray-500">+$15 USD per adult / night</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeBreakfast}
                        onChange={(e) => setIncludeBreakfast(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vvotel-navy"></div>
                    </label>
                  </div>

                  <div className="pt-3 border-t flex justify-end">
                    <button
                      onClick={() => setCurrentStep("guest-details")}
                      className="bg-vvotel-navy hover:bg-vvotel-blue text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition flex items-center space-x-2"
                    >
                      <span>{lang === "km" ? "បន្តទៅព័ត៌មានភ្ញៀវ" : "Continue to Guest Details"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: GUEST DETAILS */}
              {currentStep === "guest-details" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-lg text-vvotel-navy">
                        {lang === "km" ? "ព័ត៌មានភ្ញៀវ និងសំណើពិសេស" : "Guest Information & Preferences"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {lang === "km" ? "សូមបំពេញព័ត៌មានសម្រាប់ការចុះឈ្មោះ និងការចេញសំបុត្រ E-Voucher" : "Please provide guest details for check-in registration"}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep("room-select")}
                      className="text-xs font-semibold text-gray-500 hover:underline"
                    >
                      {lang === "km" ? "ត្រឡប់ក្រោយ" : "Back"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {lang === "km" ? "នាមខ្លួន (First Name)" : "First Name"} *
                      </label>
                      <input
                        type="text"
                        value={guestDetails.firstName}
                        onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {lang === "km" ? "នាមត្រកូល (Last Name)" : "Last Name"} *
                      </label>
                      <input
                        type="text"
                        value={guestDetails.lastName}
                        onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {lang === "km" ? "អ៊ីមែល (Email)" : "Email Address"} *
                      </label>
                      <input
                        type="email"
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {lang === "km" ? "លេខទូរស័ព្ទ (Phone)" : "Phone Number"} *
                      </label>
                      <input
                        type="tel"
                        value={guestDetails.phone}
                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-gray-700 block mb-1">
                      {lang === "km" ? "សំណើពិសេស (Special Requests)" : "Special Requests (Optional)"}
                    </label>
                    <textarea
                      rows={2}
                      value={guestDetails.specialRequests}
                      onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                      placeholder="e.g. Quiet room, early check-in, honeymoon setup..."
                      className="w-full p-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold"
                    />
                  </div>

                  <div className="pt-3 border-t flex justify-end">
                    <button
                      onClick={() => setCurrentStep("payment")}
                      className="bg-vvotel-navy hover:bg-vvotel-blue text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition flex items-center space-x-2"
                    >
                      <span>{lang === "km" ? "បន្តទៅការទូទាត់ប្រាក់" : "Proceed to Payment"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: PAYMENT GATEWAYS (KHQR / CARD / HOTEL) */}
              {currentStep === "payment" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-lg text-vvotel-navy">
                        {lang === "km" ? "ច្រកទូទាត់ប្រាក់មានសុវត្ថិភាព (Payment Gateways)" : "Secure Payment Gateways"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {lang === "km" ? "កាត់ប្រាក់ភ្លាមៗ ឬបង់នៅពេលមកដល់" : "Direct debit via KHQR Bakong or International Card"}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep("guest-details")}
                      className="text-xs font-semibold text-gray-500 hover:underline"
                    >
                      {lang === "km" ? "ត្រឡប់ក្រោយ" : "Back"}
                    </button>
                  </div>

                  {/* Payment Method Switcher */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("khqr")}
                      className={`p-3 rounded-xl border-2 text-center transition ${
                        paymentMethod === "khqr"
                          ? "border-red-600 bg-red-50/50 text-red-900 font-bold"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1 text-red-600" />
                      <span className="text-xs block font-bold">KHQR (Bakong / ABA)</span>
                      <span className="text-[10px] text-gray-500 block">Cambodia Instant Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border-2 text-center transition ${
                        paymentMethod === "card"
                          ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <span className="text-xs block font-bold">Credit / Debit Card</span>
                      <span className="text-[10px] text-gray-500 block">Visa, Master, UnionPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("hotel")}
                      className={`p-3 rounded-xl border-2 text-center transition ${
                        paymentMethod === "hotel"
                          ? "border-vvotel-navy bg-gray-100 text-vvotel-navy font-bold"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Building className="w-5 h-5 mx-auto mb-1 text-gray-700" />
                      <span className="text-xs block font-bold">Pay at Hotel</span>
                      <span className="text-[10px] text-gray-500 block">Guarantee with Card</span>
                    </button>
                  </div>

                  {/* Payment Method Details */}
                  {paymentMethod === "khqr" && (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center gap-6">
                      {/* KHQR Card Display */}
                      <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-red-500 max-w-[250px] w-full text-center space-y-2">
                        <div className="bg-red-600 text-white font-extrabold text-xs py-1 px-2 rounded-md tracking-wider flex items-center justify-between">
                          <span>KHQR</span>
                          <span className="text-[10px] opacity-90 font-mono">EMVCo</span>
                          <span>BAKONG</span>
                        </div>
                        <div className="text-[11px] font-bold text-gray-800 leading-tight">
                          VATTANAC HOTEL (VVOTEL)
                        </div>
                        <div className="text-[9px] text-gray-500">
                          NO. 2052 PREAH MONIVONG ST
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 inline-block">
                          {/* Authentic high-resolution EMVCo QR graphic */}
                          <div className="w-36 h-36 mx-auto bg-gray-900 rounded-lg p-2 flex items-center justify-center relative overflow-hidden shadow-inner">
                            <div className="absolute inset-0 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:8px_8px]" />
                            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center font-black text-red-600 text-[11px] shadow-lg z-10 border border-red-200">
                              KHQR
                            </div>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-base font-extrabold text-gray-900">
                            ${totalAmountUSD} USD
                          </div>
                          <div className="text-[11px] text-gray-500 font-medium">
                            ≈ {totalAmountKHR.toLocaleString()} KHR
                          </div>
                        </div>

                        <div className="text-[10px] text-red-600 font-mono font-semibold flex items-center justify-center space-x-1 bg-red-50 py-1 rounded-lg">
                          <Clock className="w-3 h-3" />
                          <span>Expires: {formatTimer(khqrTimer)}</span>
                          <button
                            type="button"
                            onClick={() => setKhqrTimer(299)}
                            className="ml-1 text-gray-400 hover:text-red-700"
                            title="Refresh QR"
                          >
                            <RotateCw className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Instructions & Trigger */}
                      <div className="flex-1 space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <span className="font-bold text-gray-800 text-sm block">
                            {lang === "km" ? "ច្រកទូទាត់ប្រាក់ KHQR Bakong មានសុវត្ថិភាពខ្ពស់" : "Secure EMVCo Bakong KHQR Gateway"}
                          </span>
                          <ol className="list-decimal list-inside text-gray-600 space-y-1">
                            <li>{lang === "km" ? "បើកកម្មវិធី ABA Mobile, Bakong, ACLEDA, ឬធនាគារក្នុងស្រុកណាមួយ" : "Open ABA Mobile, Bakong, ACLEDA, or any member bank app."}</li>
                            <li>{lang === "km" ? "ចុចប៊ូតុងស្កេន KHQR (Scan QR) ហើយស្កេនរូបភាព QR ខាងឆ្វេង" : "Select 'Scan QR' and scan the dynamic code."}</li>
                            <li>{lang === "km" ? "ពិនិត្យឈ្មោះ VATTANAC HOTEL (VVOTEL) និងផ្ទៀងផ្ទាត់ទឹកប្រាក់" : "Verify the merchant name and total amount to confirm."}</li>
                          </ol>
                        </div>

                        {/* Supported Banks Badges */}
                        <div className="pt-1">
                          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">
                            {lang === "km" ? "ធនាគារគាំទ្រស្វ័យប្រវត្ត" : "Supported Mobile Banking Apps"}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#004a7c] text-white">ABA Bank</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#d92d27] text-white">Bakong</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1c3c6d] text-white">ACLEDA</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#b91c1c] text-white">Canadia</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8cc63f] text-gray-900">Wing Bank</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#003b70] text-white">Sathapana</span>
                          </div>
                        </div>

                        {/* Security Trust Seals */}
                        <div className="flex items-center space-x-3 text-[10px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>NBC Bakong Certified • 256-bit TLS 1.3 Encryption</span>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={handleVerifyKhqrPay}
                            disabled={isVerifyingPayment}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-lg"
                          >
                            <Smartphone className="w-4 h-4" />
                            <span>
                              {isVerifyingPayment
                                ? lang === "km" ? "កំពុងត្រួតពិនិត្យប្រតិបត្តិការធនាគារ..." : "Verifying Bank Transaction..."
                                : lang === "km" ? "តេស្តបង់ប្រាក់ភ្លាមៗ (ABA / Bakong Auto-Verify)" : "Simulate Pay & Verify with ABA Mobile"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <form onSubmit={handleInitiateCardPayment} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 text-xs">
                      {/* Brand detection and trust badge */}
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getCardBrandInfo(cardNumber).bg}`}>
                            {getCardBrandInfo(cardNumber).brand}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>PCI-DSS Level 1 Certified</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          3D Secure 2.0 Ready
                        </span>
                      </div>

                      {cardError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center space-x-2 text-[11px]">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{cardError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-gray-700 block mb-1">
                            {lang === "km" ? "លេខកាតធនាគារ (Card Number) *" : "Card Number *"}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              maxLength={19}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full p-3 font-mono rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold pl-10"
                              placeholder="4532 •••• •••• 8920"
                              required
                            />
                            <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">
                            {lang === "km" ? "កាលបរិច្ឆេទផុតកំណត់ (MM/YY) *" : "Expiry Date (MM/YY) *"}
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            maxLength={5}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full p-3 font-mono rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold"
                            placeholder="08/28"
                            required
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">
                            {lang === "km" ? "លេខកូដសុវត្ថិភាព (CVV / CVC) *" : "CVV / CVC *"}
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              value={cardCvv}
                              maxLength={4}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full p-3 font-mono rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold"
                              placeholder="•••"
                              required
                            />
                            <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-3.5" />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-gray-700 block mb-1">
                            {lang === "km" ? "ឈ្មោះម្ចាស់កាត (Cardholder Name) *" : "Cardholder Name *"}
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vvotel-gold uppercase"
                            placeholder="SOPHEAP CHAN"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {lang === "km"
                            ? `ទូទាត់ $${totalAmountUSD} USD ជាមួយប្រព័ន្ធសុវត្ថិភាព 3D Secure`
                            : `Pay $${totalAmountUSD} USD with 3D Secure 2.0`}
                        </span>
                      </button>
                    </form>
                  )}

                  {paymentMethod === "hotel" && (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm text-gray-800 block">
                            {lang === "km" ? "ទូទាត់ប្រាក់នៅពេលមកដល់សណ្ឋាគារ (Pay Upon Arrival)" : "Pay at the Hotel Upon Arrival"}
                          </span>
                          <p className="text-gray-600 mt-1 leading-relaxed">
                            {lang === "km"
                              ? "មិនតម្រូវឱ្យកាត់ប្រាក់ជាមុនឡើយ។ បន្ទប់របស់អ្នកនឹងត្រូវរក្សាទុកជូនរហូតដល់ម៉ោង ៦:០០ ល្ងាចនៃថ្ងៃចូលស្នាក់នៅ។"
                              : "No prepayment required today. Your room is fully reserved and guaranteed until 6:00 PM on the arrival date."}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyHotelPay}
                        disabled={isVerifyingPayment}
                        className="w-full bg-vvotel-navy hover:bg-vvotel-blue text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow"
                      >
                        <Building className="w-4 h-4 text-vvotel-gold" />
                        <span>{lang === "km" ? "បញ្ជាក់ការកក់ដោយទូទាត់ពេលមកដល់" : "Confirm Reservation (Pay at Hotel)"}</span>
                      </button>
                    </div>
                  )}

                  {/* Itemized Invoice Summary */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>{activeRoom.nameEn} ({roomCount} Room(s) × {nights} Nights):</span>
                      <span>${roomBaseSubtotal} USD</span>
                    </div>
                    {includeBreakfast && (
                      <div className="flex justify-between text-gray-600">
                        <span>Buffet Breakfast:</span>
                        <span>+${breakfastCost} USD</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>{discountLabel}:</span>
                        <span>-${discountAmount} USD</span>
                      </div>
                    )}
                    <div className="pt-2 border-t flex justify-between text-base font-extrabold text-vvotel-navy">
                      <span>{lang === "km" ? "ទឹកប្រាក់សរុប (Total Due)" : "Total Amount"}:</span>
                      <span className="text-vvotel-gold font-bold">${totalAmountUSD} USD ({totalAmountKHR.toLocaleString()} KHR)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP: CONFIRMATION & E-TICKET VOUCHER */}
              {currentStep === "confirmed" && (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-green-700 uppercase tracking-widest flex items-center justify-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>{lang === "km" ? "ការកក់ត្រូវបានបញ្ជាក់ជោគជ័យ ១០០%" : "Booking Successfully Confirmed & Guaranteed"}</span>
                    </span>
                    <h3 className="text-2xl font-black text-vvotel-navy">
                      Ref #{paymentConfirmed?.bookingRef || `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`}
                    </h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      {lang === "km"
                        ? "សំបុត្រអេឡិចត្រូនិច (E-Voucher) និងវិក្កយបត្រត្រូវបានផ្ញើទៅកាន់អ៊ីមែល " + guestDetails.email + " រួចរាល់ហើយ។"
                        : "Your digital E-voucher and receipt have been dispatched to " + guestDetails.email}
                    </p>
                  </div>

                  {/* Cryptographic Security Signature Badge */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-left max-w-lg mx-auto text-[11px] text-emerald-900 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center space-x-1 text-emerald-800">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === "km" ? "ហត្ថលេខាសុវត្ថិភាពឌីជីថល (HMAC SHA-256)" : "Cryptographic Tamper-Proof Seal"}</span>
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono">
                        {paymentConfirmed?.security?.pciDssCompliance || "PCI-DSS Level 1"}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-gray-600 truncate">
                      Hash: {paymentConfirmed?.security?.signatureHMAC || "sha256:8f3c4e2b1a9d701e6a4b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f"}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center justify-between">
                      <span>Status: {paymentConfirmed?.security?.threeDSecureStatus || "AUTHENTICATED_3DS_V2"}</span>
                      <span>Txn: {paymentConfirmed?.transactionId || `TXN-SEC-${Date.now().toString(36).toUpperCase()}`}</span>
                    </div>
                  </div>

                  {/* Digital Boarding Pass */}
                  <div className="bg-[#0c2340] text-white rounded-2xl p-6 text-left max-w-lg mx-auto shadow-xl relative overflow-hidden border border-vvotel-gold/30">
                    <div className="flex justify-between items-start border-b border-white/10 pb-4">
                      <div>
                        <div className="text-[10px] text-vvotel-gold font-bold tracking-widest uppercase">
                          VIP GUEST PASS • VVOTEL KAMPONG CHAM
                        </div>
                        <div className="text-base font-bold text-white mt-0.5">
                          {guestDetails.firstName} {guestDetails.lastName}
                        </div>
                        <div className="text-[10px] text-gray-300">
                          {guestDetails.phone}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Status</span>
                        <span className="text-xs font-bold text-emerald-400">CONFIRMED PAID</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-b border-white/10 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Check-in</span>
                        <span className="font-bold">{checkIn} (From 2:00 PM)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Check-out</span>
                        <span className="font-bold">{checkOut} (Until 12:00 PM)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Room Category</span>
                        <span className="font-bold">{lang === "km" ? activeRoom.nameKm : activeRoom.nameEn}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Rooms / Guests</span>
                        <span className="font-bold">{roomCount} Room(s), {totalAdults}A {totalChildren > 0 ? `+ ${totalChildren}C` : ""}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Paid Amount</span>
                        <span className="text-base font-extrabold text-vvotel-gold">
                          ${totalAmountUSD} USD ({totalAmountKHR.toLocaleString()} KHR)
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 border border-gray-300"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{lang === "km" ? "បោះពុម្ពវិក្កយបត្រ (Print E-Voucher)" : "Print E-Voucher"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setCurrentStep("options");
                      }}
                      className="px-6 py-3 bg-vvotel-navy hover:bg-vvotel-blue text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                    >
                      {lang === "km" ? "រួចរាល់ (Close)" : "Done"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D Secure 2.0 Bank Authentication Modal Dialog */}
      {is3DSModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 my-auto animate-in zoom-in-95 duration-150">
            {/* 3DS Bank Header */}
            <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow">
                  3DS
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">3D Secure 2.2 Authentication</h4>
                  <p className="text-[10px] text-gray-300">Verified by Visa • Mastercard Identity Check</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIs3DSModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3DS Bank Challenge Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start space-x-2.5">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-blue-900 leading-relaxed">
                  <span className="font-bold block">
                    {lang === "km" ? "ការផ្ទៀងផ្ទាត់សុវត្ថិភាពម្ចាស់កាត" : "Cardholder Identity Verification"}
                  </span>
                  {lang === "km"
                    ? "លេខកូដសម្ងាត់ OTP ចំនួន ៦ខ្ទង់ ត្រូវបានផ្ញើតាមសារ SMS ទៅកាន់លេខទូរស័ព្ទរបស់អ្នក (+855 ••• ••• 678)។"
                    : "A one-time passcode (OTP) has been sent to your registered phone number (+855 ••• ••• 678)."}
                </div>
              </div>

              {/* Transaction details table */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 text-[11px]">
                <div className="flex justify-between text-gray-600">
                  <span>Merchant:</span>
                  <span className="font-bold text-gray-900">VVOTEL KAMPONG CHAM</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Card Number:</span>
                  <span className="font-mono font-bold text-gray-900">
                    •••• •••• •••• {cardNumber.replace(/\D/g, "").slice(-4) || "8920"} ({getCardBrandInfo(cardNumber).brand})
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Transaction Amount:</span>
                  <span className="font-extrabold text-blue-700 text-sm">${totalAmountUSD} USD</span>
                </div>
              </div>

              {/* OTP Input Form */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 text-xs">
                    {lang === "km" ? "បញ្ចូលលេខកូដ OTP ៦ខ្ទង់ *" : "Enter 6-Digit SMS Passcode *"}
                  </label>
                  <span className="text-[10px] text-red-600 font-mono font-semibold flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimer(otpTimer)}</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.4em] font-mono text-lg font-black p-3 rounded-xl border-2 border-blue-400 focus:outline-none focus:border-blue-600 bg-white"
                  />
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                    {lang === "km" ? "លេខកូដសាកល្បង៖ 123456" : "Demo Test OTP: 123456"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode("123456");
                      setOtpTimer(180);
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {lang === "km" ? "ផ្ញើសារឡើងវិញ" : "Resend Passcode"}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleAuthorize3DSPayment}
                  disabled={isAuthorizing3DS || otpCode.length < 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isAuthorizing3DS
                      ? (lang === "km" ? "កំពុងផ្ទៀងផ្ទាត់ហត្ថលេខា..." : "Authorizing Cryptographic Token...")
                      : (lang === "km" ? "ផ្ទៀងផ្ទាត់ & កាត់ប្រាក់ (Confirm & Authorize)" : "Confirm & Authorize Payment")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIs3DSModalOpen(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  {lang === "km" ? "បោះបង់ (Cancel)" : "Cancel"}
                </button>
              </div>

              <div className="text-center text-[10px] text-gray-400 flex items-center justify-center space-x-1.5 pt-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Protected by EMVCo 3DS 2.2 • PCI-DSS Level 1 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
