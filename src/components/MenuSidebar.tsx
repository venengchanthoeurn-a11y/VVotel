"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { HOTEL_INFO } from "@/data/destinations";
import {
  X,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Compass,
  BedDouble,
  Utensils,
  Sparkles,
  Calendar,
  Users,
  Smile,
  ShieldCheck,
} from "lucide-react";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const MenuSidebar: React.FC<MenuSidebarProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const { lang, t } = useLanguage();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("about");

  if (!isOpen) return null;

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Sidebar Drawer (Left side) */}
      <div className="fixed inset-y-0 left-0 max-w-md w-full bg-[#0c2340] text-white shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-vvotel-gold/30 animate-in slide-in-from-left duration-300">
        {/* Top Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#08182b]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-vvotel-gold text-vvotel-navy flex items-center justify-center font-black text-xl shadow">
              V
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white">
                {lang === "km" ? "វីវ៉ូថែល កំពង់ចាម" : "VVOTEL KAMPONG CHAM"}
              </div>
              <div className="text-[10px] text-vvotel-gold uppercase tracking-widest font-semibold">
                Holiday Resort & Spa
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-2 text-sm font-medium">
          {/* Home */}
          <a
            href="/"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 hover:text-white transition"
          >
            <span>{lang === "km" ? "ទំព័រដើម (Home)" : "Home"}</span>
          </a>

          {/* About Us (With Submenu) */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button
              onClick={() => toggleSubmenu("about")}
              className="w-full flex items-center justify-between p-3 text-left font-bold text-vvotel-gold hover:bg-white/5 transition"
            >
              <div className="flex items-center space-x-2.5">
                <Compass className="w-4 h-4" />
                <span>{lang === "km" ? "អំពីយើងខ្ញុំ (About Us)" : "About Us"}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openSubmenu === "about" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSubmenu === "about" && (
              <div className="pl-9 pr-4 pb-3 space-y-2 text-xs text-gray-300 pt-1 border-t border-white/10">
                <a
                  href="#destination-guide"
                  onClick={onClose}
                  className="block py-1.5 hover:text-vvotel-gold transition font-bold text-white flex items-center space-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-vvotel-gold" />
                  <span>{lang === "km" ? "មគ្គុទ្ទេសក៍ទេសចរណ៍ (Destination Guide)" : "Destination Guide"}</span>
                </a>
                <a
                  href="#map-section"
                  onClick={onClose}
                  className="block py-1.5 hover:text-vvotel-gold transition"
                >
                  {lang === "km" ? "ទីតាំងនៅលើផែនទី (Location & Map)" : "Location & Map"}
                </a>
                <a
                  href="#sustainability"
                  onClick={onClose}
                  className="block py-1.5 hover:text-vvotel-gold transition"
                >
                  {lang === "km" ? "គោលដៅនិរន្តរភាព (Our Sustainability Goals)" : "Our Sustainability Goals"}
                </a>
                <a
                  href="#gallery"
                  onClick={onClose}
                  className="block py-1.5 hover:text-vvotel-gold transition"
                >
                  {lang === "km" ? "វិចិត្រសាលរូបភាព (Photo Gallery)" : "Photo Gallery"}
                </a>
                <a
                  href="#contact"
                  onClick={onClose}
                  className="block py-1.5 hover:text-vvotel-gold transition"
                >
                  {lang === "km" ? "ទំនាក់ទំនងយើងខ្ញុំ (Contact us)" : "Contact us"}
                </a>
              </div>
            )}
          </div>

          {/* Accommodation (With Submenu) */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button
              onClick={() => toggleSubmenu("rooms")}
              className="w-full flex items-center justify-between p-3 text-left font-bold text-white hover:bg-white/5 transition"
            >
              <div className="flex items-center space-x-2.5">
                <BedDouble className="w-4 h-4 text-vvotel-gold" />
                <span>{t("accommodation")}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openSubmenu === "rooms" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSubmenu === "rooms" && (
              <div className="pl-9 pr-4 pb-3 space-y-2 text-xs text-gray-300 pt-1 border-t border-white/10">
                <a href="#rooms" onClick={onClose} className="block py-1.5 hover:text-vvotel-gold transition">
                  {lang === "km" ? "បន្ទប់ស្តង់ដារ ទេសភាពក្រុង (Standard Room City View)" : "Standard Room City View"}
                </a>
                <a href="#rooms" onClick={onClose} className="block py-1.5 hover:text-vvotel-gold transition">
                  {lang === "km" ? "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេ (Superior Room River View)" : "Superior Room River View"}
                </a>
                <a href="#rooms" onClick={onClose} className="block py-1.5 hover:text-vvotel-gold transition">
                  {lang === "km" ? "បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ ១ បន្ទប់គេង (Suite Executive River View)" : "Suite Executive River View (1 bedroom)"}
                </a>
                <a href="#rooms" onClick={onClose} className="block py-1.5 hover:text-vvotel-gold transition">
                  {lang === "km" ? "បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ ២ បន្ទប់គេង (Suite Royal Family River View)" : "Suite Royal Family River View (2 bedroom)"}
                </a>
              </div>
            )}
          </div>

          {/* Dining */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button
              onClick={() => toggleSubmenu("dining")}
              className="w-full flex items-center justify-between p-3 text-left font-bold text-white hover:bg-white/5 transition"
            >
              <div className="flex items-center space-x-2.5">
                <Utensils className="w-4 h-4 text-vvotel-gold" />
                <span>{t("dining")}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openSubmenu === "dining" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSubmenu === "dining" && (
              <div className="pl-9 pr-4 pb-3 space-y-2 text-xs text-gray-300 pt-1 border-t border-white/10">
                <a href="#dining" onClick={onClose} className="block py-1.5 hover:text-vvotel-gold transition">
                  {lang === "km" ? "ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស (Mekong Breeze)" : "Mekong Breeze Restaurant"}
                </a>
                <a href="#dining" onClick={onClose} className="block py-1.5 hover:text-vvotel-gold transition">
                  {lang === "km" ? "សាន់សិត រីវើឡោញ & បារ (Sunset River Lounge)" : "Sunset River Lounge & Cigar Terrace"}
                </a>
                <a href="#dining" onClick={onClose} className="block py-1.5 hover:text-vvotel-gold transition">
                  {lang === "km" ? "ហ្គរម៉េ រីវើកាហ្វេ & ហាងនំប៉័ង (Gourmet River Café)" : "Gourmet River Café & French Bakery"}
                </a>
                <a href="#dining" onClick={onClose} className="block py-1.5 hover:text-vvotel-gold transition">
                  {lang === "km" ? "សេវាអាហារដល់បន្ទប់ ២៤/៧ (In-Room Dining)" : "In-Room Dining 24/7"}
                </a>
              </div>
            )}
          </div>

          {/* Special Offers */}
          <a
            href="#special-offers"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 hover:text-white transition"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-vvotel-gold" />
              <span>{t("specialOffers")}</span>
            </div>
            <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">Hot</span>
          </a>

          {/* Services */}
          <a
            href="#services"
            onClick={onClose}
            className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-white/5 text-gray-200 hover:text-white transition"
          >
            <Users className="w-4 h-4 text-vvotel-gold" />
            <span>{t("services")}</span>
          </a>

          {/* Meeting & Events */}
          <a
            href="#meeting-events"
            onClick={onClose}
            className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-white/5 text-gray-200 hover:text-white transition"
          >
            <Calendar className="w-4 h-4 text-vvotel-gold" />
            <span>{t("meetingEvents")}</span>
          </a>

          {/* Services */}
          <a
            href="#services"
            onClick={onClose}
            className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-white/5 text-gray-200 hover:text-white transition"
          >
            <Users className="w-4 h-4 text-vvotel-gold" />
            <span>{t("services")}</span>
          </a>
        </div>

        {/* Contacts & Quick Booking Action */}
        <div className="p-6 border-t border-white/10 bg-[#08182b] space-y-4">
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-vvotel-gold shrink-0 mt-0.5" />
              <span className="text-gray-300 leading-tight">
                {lang === "km" ? HOTEL_INFO.address.km : HOTEL_INFO.address.en}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-vvotel-gold shrink-0" />
              <a href={`tel:${HOTEL_INFO.phone}`} className="hover:text-white font-bold">
                {HOTEL_INFO.phone}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-vvotel-gold shrink-0" />
              <a href={`mailto:${HOTEL_INFO.email}`} className="hover:text-white truncate">
                {HOTEL_INFO.email}
              </a>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="w-full bg-gradient-to-r from-vvotel-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{t("bookNow")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
