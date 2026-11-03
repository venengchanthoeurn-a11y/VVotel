"use client";

import React from "react";
import { Destination } from "@/data/destinations";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  MapPin,
  Clock,
  Phone,
  Globe,
  Compass,
  Navigation,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface DestinationDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose,
}) => {
  const { lang, t } = useLanguage();

  if (!destination) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 my-auto">
        {/* Modal Image Header */}
        <div className="relative h-64 sm:h-72 w-full shrink-0 overflow-hidden bg-gray-900">
          <img
            src={destination.imageUrl}
            alt={destination.title.en}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tag & Distance Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-vvotel-gold text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {lang === "km" ? destination.categoryName.km : destination.categoryName.en}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-xs font-medium text-vvotel-gold uppercase tracking-wider mb-1">
              {lang === "km" ? destination.tagline.km : destination.tagline.en}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
              {lang === "km" ? destination.title.km : destination.title.en}
            </h2>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-gray-800">
          {/* Key Facts Pill Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-vvotel-gold/20 flex items-center space-x-3">
              <Clock className="w-5 h-5 text-vvotel-gold shrink-0" />
              <div>
                <span className="text-gray-500 block">{lang === "km" ? "រយៈពេលពីសណ្ឋាគារ" : "From VVotel Kampong Cham"}</span>
                <span className="font-bold text-vvotel-navy text-sm">
                  {lang === "km" ? destination.distanceFromHotel.km : destination.distanceFromHotel.en}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center space-x-3">
              <Compass className="w-5 h-5 text-vvotel-navy shrink-0" />
              <div>
                <span className="text-gray-500 block">{lang === "km" ? "កូអរដោនេ GPS" : "GPS Coordinates"}</span>
                <span className="font-mono font-bold text-xs text-gray-700">
                  {destination.latitude.toFixed(4)}° N, {destination.longitude.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Narrative */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">
              {lang === "km" ? "ព័ត៌មានលម្អិតអំពីទីតាំង" : "Destination Overview"}
            </h4>
            <p className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-line">
              {lang === "km" ? destination.fullDescription.km : destination.fullDescription.en}
            </p>
          </div>

          {/* Location & Contact Info */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-3 text-xs">
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-800 block mb-0.5">
                  {lang === "km" ? "អាសយដ្ឋានទីតាំង" : "Address"}
                </span>
                <span className="text-gray-600">
                  {lang === "km" ? destination.address.km : destination.address.en}
                </span>
              </div>
            </div>

            {destination.phone && (
              <div className="flex items-center space-x-2.5 pt-2 border-t border-gray-200/60">
                <Phone className="w-4 h-4 text-green-600 shrink-0" />
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-800">
                    {lang === "km" ? "ទូរស័ព្ទ៖" : "Phone:"}
                  </span>
                  <a
                    href={`tel:${destination.phone}`}
                    className="text-vvotel-navy font-bold hover:underline"
                  >
                    {destination.phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Reception Assistance Note (Exact like Novotel) */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                {lang === "km" ? "សេវាកម្មរៀបចំការធ្វើដំណើរនៅ Reception" : "Concierge & Guided Tours"}
              </span>
              <p className="text-blue-800/90 leading-relaxed">
                {t("enquireAtReception")} — +855 (0) 42 982 999
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <a
            href={destination.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-vvotel-navy hover:bg-vvotel-blue text-white font-bold py-3.5 px-4 rounded-xl text-center text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow"
          >
            <Navigation className="w-4 h-4 text-vvotel-gold" />
            <span>{t("getDirections")}</span>
          </a>

          {destination.websiteUrl && (
            <a
              href={destination.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3.5 bg-white hover:bg-gray-100 text-vvotel-navy font-bold rounded-xl border border-gray-200 text-xs uppercase tracking-wider transition flex items-center space-x-1.5"
            >
              <span>{t("visitWebsite")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={onClose}
            className="px-6 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs uppercase tracking-wider transition"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};
