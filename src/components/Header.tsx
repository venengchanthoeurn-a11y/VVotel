"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Menu, ChevronDown, Phone, Compass, BedDouble, Utensils, Sparkles, Calendar, Users } from "lucide-react";
import { MenuSidebar } from "@/components/MenuSidebar";

export const Header: React.FC = () => {
  const { lang, t } = useLanguage();
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
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo & Sliding Sidebar Trigger */}
            <div className="flex items-center space-x-4">
              {/* Luxury Menu Hamburger Button (Accessible on both Desktop and Mobile matching Novotel) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-vvotel-navy hover:text-white text-vvotel-navy transition flex items-center space-x-2 border border-gray-200 group"
                title="Open main navigation menu (menu_sidebar)"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-xs font-bold uppercase tracking-wider">
                  {lang === "km" ? "ម៉ឺនុយ" : "Menu"}
                </span>
              </button>

              <a href="/" className="flex items-center space-x-2.5 group">
                <div className="w-11 h-11 rounded-xl bg-vvotel-navy flex items-center justify-center text-vvotel-gold font-black text-2xl shadow-md group-hover:scale-105 transition-transform border border-vvotel-gold/30">
                  V
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-2xl tracking-tighter text-vvotel-navy">
                    VVOTEL
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-vvotel-gold -mt-1">
                    KAMPONG CHAM HOTEL
                  </span>
                </div>
              </a>
            </div>

            {/* Center Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-sm font-medium text-gray-700">
              {/* Accommodation Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown("acc")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href="#rooms"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition"
                >
                  <span>{t("accommodation")}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </a>
                {openDropdown === "acc" && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    {accommodationItems.map((item, idx) => (
                      <a
                        key={idx}
                        href="#rooms"
                        className="block px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-amber-50/60 hover:text-vvotel-navy transition"
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
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition"
                >
                  <span>{t("dining")}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </a>
                {openDropdown === "dining" && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    {diningItems.map((item, idx) => (
                      <a
                        key={idx}
                        href="#dining"
                        className="block px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-amber-50/60 hover:text-vvotel-navy transition"
                      >
                        {lang === "km" ? item.km : item.en}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="#special-offers"
                className="px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition"
              >
                {t("specialOffers")}
              </a>

              <a
                href="#meeting-events"
                className="px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition"
              >
                {t("meetingEvents")}
              </a>

              <a
                href="#services"
                className="px-3 py-2 rounded-lg hover:text-vvotel-navy hover:bg-gray-50 transition"
              >
                {t("services")}
              </a>

              {/* Active Destination Guide Nav Item */}
              <a
                href="#destination-guide"
                className="px-3.5 py-2 rounded-xl bg-vvotel-navy text-white font-bold flex items-center space-x-2 shadow-sm"
              >
                <Compass className="w-4 h-4 text-vvotel-gold animate-spin-slow" />
                <span>{t("destinationGuide")}</span>
              </a>
            </nav>

            {/* Right Quick Actions */}
            <div className="flex items-center space-x-3">
              <a
                href="tel:+85542982999"
                className="hidden sm:flex items-center space-x-2 text-xs font-bold text-vvotel-navy bg-amber-50/80 hover:bg-amber-100 px-3.5 py-2.5 rounded-xl border border-vvotel-gold/30 transition shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-vvotel-gold" />
                <span>+855 (0) 42 982 999</span>
              </a>

              <button
                onClick={scrollToBooking}
                className="bg-gradient-to-r from-vvotel-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition"
              >
                {t("bookNow")}
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
