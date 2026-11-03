"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Award, Sparkles, ChevronRight, Gift, Percent } from "lucide-react";

export const LoyaltyBanner: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-[#0c2340] via-[#14325c] to-[#0c2340] text-white py-12 px-4 sm:px-6 relative overflow-hidden border-y border-vvotel-gold/20">
      {/* Subtle background luxury pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex items-start space-x-4 max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-vvotel-gold/20 border border-vvotel-gold/40 flex items-center justify-center shrink-0 text-vvotel-gold shadow-lg">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-vvotel-gold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VVOTEL ALL • ACCOR LIVE LIMITLESS</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t("loyaltyTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              {t("loyaltyDesc")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => alert(lang === "km" ? "សូមស្វាគមន៍មកកាន់កម្មវិធីភាពស្មោះត្រង់ VVotel ALL! កាតសមាជិកឌីជីថលរបស់អ្នកត្រូវបានដំណើរការ។" : "Welcome to VVotel ALL loyalty program! Your digital membership card is now active.")}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-vvotel-gold to-amber-500 hover:from-amber-400 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
          >
            <span>{t("joinToday")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
