"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Home,
  BedDouble,
  Utensils,
  Compass,
  Calendar,
  Building,
  ShieldCheck,
} from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const { lang } = useLanguage();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 py-1.5 flex items-center justify-around safe-area-inset-bottom">
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex flex-col items-center justify-center p-1 text-gray-600 hover:text-vvotel-navy active:scale-95 transition"
      >
        <Home className="w-5 h-5 text-vvotel-navy" />
        <span className="text-[10px] mt-0.5 font-bold">
          {lang === "km" ? "ដើម" : "Home"}
        </span>
      </button>

      {/* 2. Rooms */}
      <button
        type="button"
        onClick={() => scrollTo("rooms")}
        className="flex flex-col items-center justify-center p-1 text-gray-600 hover:text-vvotel-navy active:scale-95 transition"
      >
        <BedDouble className="w-5 h-5 text-amber-700" />
        <span className="text-[10px] mt-0.5 font-bold">
          {lang === "km" ? "បន្ទប់" : "Rooms"}
        </span>
      </button>

      {/* 3. Dining */}
      <button
        type="button"
        onClick={() => scrollTo("dining")}
        className="flex flex-col items-center justify-center p-1 text-gray-600 hover:text-vvotel-navy active:scale-95 transition"
      >
        <Utensils className="w-5 h-5 text-amber-700" />
        <span className="text-[10px] mt-0.5 font-bold">
          {lang === "km" ? "អាហារ" : "Dining"}
        </span>
      </button>

      {/* 4. Map Guide */}
      <button
        type="button"
        onClick={() => scrollTo("destination-guide")}
        className="flex flex-col items-center justify-center p-1 text-gray-600 hover:text-vvotel-navy active:scale-95 transition"
      >
        <Compass className="w-5 h-5 text-blue-700 animate-spin-slow" />
        <span className="text-[10px] mt-0.5 font-bold">
          {lang === "km" ? "ផែនទី" : "Map"}
        </span>
      </button>

      {/* 5. ALL Accor PMS (Telegram Bot) */}
      <a
        href="https://t.me/vvotel_bot?start=accor_pms"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center p-1 text-purple-700 hover:text-purple-900 active:scale-95 transition"
      >
        <Building className="w-5 h-5 text-purple-700" />
        <span className="text-[10px] mt-0.5 font-bold">PMS</span>
      </a>

      {/* 6. Admin Portal */}
      <a
        href="/admin"
        className="flex flex-col items-center justify-center p-1 text-slate-700 hover:text-slate-900 active:scale-95 transition"
      >
        <ShieldCheck className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] mt-0.5 font-bold">Admin</span>
      </a>

      {/* 7. Book Now Highlight Action */}
      <button
        type="button"
        onClick={() => scrollTo("booking-bar")}
        className="flex flex-col items-center justify-center px-3 py-1 bg-gradient-to-r from-vvotel-gold to-amber-600 text-white rounded-xl shadow-md active:scale-95 transition"
      >
        <Calendar className="w-4 h-4 text-white" />
        <span className="text-[10px] mt-0.5 font-extrabold uppercase">
          {lang === "km" ? "កក់" : "Book"}
        </span>
      </button>
    </div>
  );
};
