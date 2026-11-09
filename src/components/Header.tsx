"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { Menu, ChevronDown, Phone, Compass, BedDouble, Utensils, Sparkles, Calendar, Users, Download, Building, ShieldCheck, Bell } from "lucide-react";
import { MenuSidebar } from "@/components/MenuSidebar";

export const Header: React.FC = () => {
  const { lang, t } = useLanguage();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const accommodationItems = [
    { en: "Standard Room City View", km: "បន្ទប់ស្តង់ដារ ទេសភាពក្រុង" },
    { en: "Superior Room River View", km: "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ" },
    { en: "Executive Mekong Suite (1 Bedroom)", km: "បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ (១ បន្ទប់គេង)" },
    { en: "Royal Family River Suite (2 Bedroom)", km: "បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ (២ បន្ទប់គេង)" },
  ];

  const diningItems = [
    { en: "Mekong Breeze Restaurant", km: "ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស (Mekong Breeze)" },
    { en: "Sunset River Lounge & Cigar Bar", km: "សាន់សិត រីវើឡោញ និងបារបារី" },
    { en: "Gourmet River Café & Bakery", km: "ហ្គរម៉េ រីវើកាហ្វេ និងហាងនំប៉័ង" },
    { en: "In-Room Dining 24/7", km: "សេវាអាហារដល់បន្ទប់ ២៤/៧" },
  ];

  const scrollToBooking = () => {
    const el = document.getElementById("booking-bar");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-gray-100 transition-all w-full">
        {/* Full-width container with generous padding */}
        <div className="w-full px-3 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo & Sliding Sidebar Trigger */}
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              {/* Luxury Menu Hamburger Button (Accessible on both Desktop and Mobile) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl bg-gray-100 hover:bg-vvotel-navy hover:text-white text-vvotel-navy transition flex items-center space-x-1.5 border border-gray-200 group"
                title="Open main navigation menu (menu_sidebar)"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-xs font-bold uppercase tracking-wider">
                  {lang === "km" ? "ម៉ឺនុយ" : "Menu"}
                </span>
              </button>

              <a href="/" className="flex items-center space-x-2 sm:space-x-2.5 group">
                {settings.logoImageUrl ? (
                  <img
                    src={settings.logoImageUrl}
                    alt={settings.hotelNameEn}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain shadow-md border border-vvotel-gold/30 shrink-0"
                  />
                ) : (
                  <img
                    src="/icons/icon-192.png?v=2"
                    alt={settings.hotelNameEn}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain shadow-md border border-vvotel-gold/30 shrink-0 group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="hidden md:flex flex-col min-w-0">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tighter text-vvotel-navy leading-none truncate">
                    {settings.logoText || "VVOTEL"}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-vvotel-gold mt-0.5 truncate max-w-[130px] sm:max-w-none">
                    {lang === "km" ? settings.hotelNameKm : settings.hotelNameEn}
                  </span>
                </div>
              </a>
            </div>

            {/* Center Navigation:
                - On Tablet / iPad / Medium screens (md:flex xl:hidden): AUTO ICON-ONLY quick bar with tooltips (Zero text wrapping)
                - On Large Desktop (xl:flex): Full luxury text & dropdown menus with whitespace-nowrap
                - On Mobile (< md): Hidden (accessible via ☰ Hamburger Menu sidebar)
            */}
            {/* 1. Medium Screen Auto Icon-Only Navigation (md:flex xl:hidden) */}
            <nav className="hidden md:flex xl:hidden items-center space-x-1 sm:space-x-1.5 px-2 py-1 bg-gray-50/90 rounded-2xl border border-gray-200/80 shadow-2xs">
              {/* Rooms Icon */}
              <a
                href="#rooms"
                className="p-2 rounded-xl text-gray-700 hover:text-vvotel-navy hover:bg-white hover:shadow-xs transition relative group"
                title={lang === "km" ? "បន្ទប់ស្នាក់នៅ (Accommodation)" : "Accommodation"}
                aria-label="Accommodation"
              >
                <BedDouble className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
              </a>

              {/* Dining Icon */}
              <a
                href="#dining"
                className="p-2 rounded-xl text-gray-700 hover:text-vvotel-navy hover:bg-white hover:shadow-xs transition relative group"
                title={lang === "km" ? "ភោជនីយដ្ឋាន & អាហារ (Dining)" : "Dining"}
                aria-label="Dining"
              >
                <Utensils className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
              </a>

              {/* Offers Icon */}
              <a
                href="#special-offers"
                className="p-2 rounded-xl text-gray-700 hover:text-vvotel-navy hover:bg-white hover:shadow-xs transition relative group"
                title={lang === "km" ? "ការផ្តល់ជូនពិសេស (Special Offers)" : "Special Offers"}
                aria-label="Special Offers"
              >
                <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </a>

              {/* Meetings Icon */}
              <a
                href="#meeting-events"
                className="p-2 rounded-xl text-gray-700 hover:text-vvotel-navy hover:bg-white hover:shadow-xs transition relative group"
                title={lang === "km" ? "សាលប្រជុំ & ព្រឹត្តិការណ៍ (Meetings & Events)" : "Meetings & Events"}
                aria-label="Meetings & Events"
              >
                <Users className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
              </a>

              {/* Services Icon */}
              <a
                href="#services"
                className="p-2 rounded-xl text-gray-700 hover:text-vvotel-navy hover:bg-white hover:shadow-xs transition relative group"
                title={lang === "km" ? "សេវាកម្ម & បរិក្ខារ (Services)" : "Services"}
                aria-label="Services"
              >
                <Bell className="w-4 h-4 text-purple-700 group-hover:scale-110 transition-transform" />
              </a>

              {/* Guide Icon */}
              <a
                href="#destination-guide"
                className="p-2 rounded-xl bg-vvotel-navy text-vvotel-gold hover:bg-[#12335e] shadow-xs transition relative group"
                title={lang === "km" ? "មគ្គុទ្ទេសក៍ទេសចរណ៍ (Destination Guide)" : "Destination Guide"}
                aria-label="Destination Guide"
              >
                <Compass className="w-4 h-4 animate-spin-slow" />
              </a>

              {/* ALL Accor PMS Bot Icon */}
              <a
                href="https://t.me/vvotel_bot?start=accor_pms"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition relative group"
                title="ALL Accor PMS (@vvotel_bot)"
                aria-label="ALL Accor PMS"
              >
                <Building className="w-4 h-4 text-purple-700" />
              </a>

              {/* Admin Portal Icon */}
              <a
                href="/admin"
                className="p-2 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition relative group"
                title="Admin Management Portal"
                aria-label="Admin Portal"
              >
                <ShieldCheck className="w-4 h-4 text-slate-700" />
              </a>
            </nav>

            {/* 2. Large Desktop Navigation (xl:flex) with whitespace-nowrap */}
            <nav className="hidden xl:flex items-center space-x-1 2xl:space-x-2 text-xs 2xl:text-sm font-semibold text-gray-700">
              {/* Accommodation Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown("acc")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href="#rooms"
                  className="flex items-center space-x-1 px-2.5 2xl:px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition whitespace-nowrap"
                >
                  <BedDouble className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="whitespace-nowrap">{t("accommodation")}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </a>
                {openDropdown === "acc" && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    {accommodationItems.map((item, idx) => (
                      <a
                        key={idx}
                        href="#rooms"
                        className="block px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-amber-50/60 hover:text-vvotel-navy transition whitespace-nowrap"
                      >
                        {lang === "km" ? item.km : item.en}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Dining Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown("dining")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href="#dining"
                  className="flex items-center space-x-1 px-2.5 2xl:px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition whitespace-nowrap"
                >
                  <Utensils className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="whitespace-nowrap">{t("dining")}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </a>
                {openDropdown === "dining" && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    {diningItems.map((item, idx) => (
                      <a
                        key={idx}
                        href="#dining"
                        className="block px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-amber-50/60 hover:text-vvotel-navy transition whitespace-nowrap"
                      >
                        {lang === "km" ? item.km : item.en}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="#special-offers"
                className="flex items-center space-x-1 px-2.5 2xl:px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">{t("specialOffers")}</span>
              </a>

              <a
                href="#meeting-events"
                className="flex items-center space-x-1 px-2.5 2xl:px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="whitespace-nowrap">{t("meetingEvents")}</span>
              </a>

              <a
                href="#services"
                className="flex items-center space-x-1 px-2.5 2xl:px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition whitespace-nowrap"
              >
                <Bell className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span className="whitespace-nowrap">{t("services")}</span>
              </a>

              {/* Active Destination Guide Nav Item */}
              <a
                href="#destination-guide"
                className="px-3 py-1.5 rounded-xl bg-vvotel-navy text-white font-bold flex items-center space-x-1.5 shadow-sm whitespace-nowrap shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-vvotel-gold animate-spin-slow shrink-0" />
                <span className="whitespace-nowrap">{t("destinationGuide")}</span>
              </a>

              {/* Accor PMS Telegram Bot Link */}
              <a
                href="https://t.me/vvotel_bot?start=accor_pms"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg text-purple-900 bg-purple-50 hover:bg-purple-100 transition font-extrabold text-xs border border-purple-200 whitespace-nowrap shrink-0"
                title="ភ្ជាប់ទៅកាន់ប្រព័ន្ធកណ្តាល ALL Accor PMS តាម Telegram Bot (@vvotel_bot)"
              >
                ALL Accor PMS
              </a>

              {/* Admin Portal Link */}
              <a
                href="/admin"
                className="px-2.5 py-1.5 rounded-lg text-slate-800 bg-slate-100 hover:bg-slate-200 transition font-extrabold text-xs border border-slate-300 whitespace-nowrap shrink-0"
                title="ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារ VVotel PMS Admin"
              >
                Admin
              </a>
            </nav>

            {/* Right Quick Actions: Auto-Icons on tablet/iPad, labels on 2XL */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Install PWA Button */}
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-pwa-install"));
                }}
                className="flex items-center space-x-1.5 text-xs font-bold text-vvotel-navy bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 p-2 sm:px-2.5 sm:py-2 rounded-xl border border-vvotel-gold/50 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                title={lang === "km" ? "ដំឡើងកម្មវិធីលើទូរស័ព្ទ / iPad" : "Install VVotel App"}
                aria-label="Install App"
              >
                <Download className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="hidden 2xl:inline text-[11px] font-extrabold whitespace-nowrap">
                  {lang === "km" ? "ដំឡើង App" : "Install App"}
                </span>
              </button>

              {/* Direct Phone Call */}
              <a
                href={settings.phone ? `tel:${settings.phone.replace(/[^0-9+]/g, "")}` : "tel:+85542982999"}
                className="flex items-center space-x-1.5 text-xs font-bold text-vvotel-navy bg-amber-50 hover:bg-amber-100 p-2 sm:px-2.5 sm:py-2 rounded-xl border border-vvotel-gold/30 transition shadow-xs shrink-0"
                title={settings.phone || "+855 (0) 42 982 999"}
                aria-label="Call Reception"
              >
                <Phone className="w-4 h-4 text-vvotel-gold shrink-0" />
                <span className="hidden 2xl:inline whitespace-nowrap">{settings.phone || "+855 (0) 42 982 999"}</span>
              </a>

              {/* Book Now Button: Always crisp, whitespace-nowrap */}
              <button
                type="button"
                onClick={scrollToBooking}
                className="bg-gradient-to-r from-vvotel-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider p-2 sm:px-3.5 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
                title={t("bookNow")}
                aria-label={t("bookNow")}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{t("bookNow")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Sidebar (Drawer) */}
      <MenuSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenBooking={scrollToBooking}
      />
    </>
  );
};
