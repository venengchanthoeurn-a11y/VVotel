"use client";

import React from "react";
import { Destination } from "@/data/destinations";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, MapPin, ArrowUpRight, Sparkles } from "lucide-react";

interface DestinationCardProps {
  destination: Destination;
  onOpenDetail: (dest: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onOpenDetail,
}) => {
  const { lang, t } = useLanguage();

  const categoryColorClasses: Record<string, string> = {
    "beaches-nature": "bg-sky-50 text-sky-700 border-sky-200",
    "sports-activities": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "culture-local-life": "bg-rose-50 text-rose-700 border-rose-200",
    "restaurants": "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={destination.imageUrl}
          alt={destination.title.en}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/destinations/bamboo-bridge.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Highlight Badge */}
        {destination.highlightBadge && (
          <div className="absolute top-3 left-3 bg-vvotel-gold text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>{lang === "km" ? destination.highlightBadge.km : destination.highlightBadge.en}</span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md bg-white/90 ${
              categoryColorClasses[destination.category]
            }`}
          >
            {lang === "km" ? destination.categoryName.km : destination.categoryName.en}
          </span>
        </div>

        {/* Distance from Hotel pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-medium bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center space-x-1.5 border border-white/20">
            <Clock className="w-3.5 h-3.5 text-vvotel-gold" />
            <span>{lang === "km" ? destination.distanceFromHotel.km : destination.distanceFromHotel.en}</span>
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-vvotel-gold uppercase tracking-wider mb-1">
            {lang === "km" ? destination.tagline.km : destination.tagline.en}
          </div>
          <h3 className="font-extrabold text-lg text-vvotel-navy group-hover:text-vvotel-gold transition-colors line-clamp-1">
            {lang === "km" ? destination.title.km : destination.title.en}
          </h3>
          <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
            {lang === "km" ? destination.summary.km : destination.summary.en}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 flex items-center space-x-1 truncate max-w-[65%]">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">{lang === "km" ? destination.address.km : destination.address.en}</span>
          </div>

          <button
            onClick={() => onOpenDetail(destination)}
            className="inline-flex items-center space-x-1 text-xs font-bold text-vvotel-navy hover:text-vvotel-gold transition group-hover:translate-x-0.5"
          >
            <span>{t("discoverMore")}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
