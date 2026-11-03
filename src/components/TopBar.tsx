"use client";

import React, { useState } from "react";
import {
  useLanguage,
  SUPPORTED_LANGUAGES,
  Language,
} from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import {
  Eye,
  Globe,
  User,
  X,
  RotateCcw,
  Check,
  Search,
} from "lucide-react";

export const TopBar: React.FC = () => {
  const { lang, setLang, t, currentLanguageMeta } = useLanguage();
  const {
    contrast,
    setContrast,
    dyslexiaFont,
    setDyslexiaFont,
    largeSpacing,
    setLargeSpacing,
    resetAll,
  } = useAccessibility();

  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.region.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <>
      <div className="bg-[#0c2340] text-gray-200 text-xs border-b border-white/10 z-50 relative">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between h-9">
          {/* Left: Accessibility & Skip */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAccessPanel(!showAccessPanel)}
              className="flex items-center space-x-1.5 hover:text-white transition px-2 py-1 rounded bg-white/5 border border-white/10"
              title={t("accessibility")}
            >
              <Eye className="w-3.5 h-3.5 text-vvotel-gold" />
              <span className="hidden sm:inline font-medium">{t("accessibility")}</span>
            </button>

            <a
              href="#main-content"
              className="hidden md:inline-block text-gray-300 hover:text-white text-[11px]"
            >
              {t("skipToContent")}
            </a>
          </div>

          {/* Center: Hotel Tagline */}
          <div className="text-center font-medium tracking-wide text-vvotel-gold truncate px-2 hidden sm:block">
            {t("brandName")}
          </div>

          {/* Right: Login & Language Switcher */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                alert(
                  lang === "km"
                    ? "ប្រព័ន្ធសមាជិក ALL Accor នឹងបើកដំណើរការឆាប់ៗនេះ"
                    : "VVotel ALL Member login portal is opening soon."
                )
              }
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition"
            >
              <User className="w-3.5 h-3.5 text-vvotel-gold" />
              <span>{t("login")}</span>
            </button>

            {/* Language Trigger */}
            <button
              onClick={() => setShowLangModal(true)}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 transition px-2.5 py-1 rounded border border-white/15 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-vvotel-gold" />
              <span className="font-semibold text-white flex items-center space-x-1 text-xs">
                <span>{currentLanguageMeta.flag}</span>
                <span>{currentLanguageMeta.nativeName}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Popover Panel */}
      {showAccessPanel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-start p-4 sm:p-12">
          <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-vvotel-gold" />
                <h3 className="font-bold text-base">{t("accessibility")}</h3>
              </div>
              <button
                onClick={() => setShowAccessPanel(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contrast */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                {t("contrast")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setContrast(contrast === "bw" ? "default" : "bw")}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition flex items-center justify-center space-x-1.5 ${
                    contrast === "bw"
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  <span>Black & White</span>
                  {contrast === "bw" && <Check className="w-3 h-3 text-white" />}
                </button>
                <button
                  onClick={() => setContrast(contrast === "by" ? "default" : "by")}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition flex items-center justify-center space-x-1.5 ${
                    contrast === "by"
                      ? "bg-black text-yellow-300 border-yellow-400"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  <span>Black & Yellow</span>
                  {contrast === "by" && <Check className="w-3 h-3 text-yellow-300" />}
                </button>
              </div>
            </div>

            {/* Font & Spacing */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                {t("font")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDyslexiaFont(!dyslexiaFont)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition flex items-center justify-center space-x-1 ${
                    dyslexiaFont
                      ? "bg-vvotel-blue text-white border-vvotel-blue"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  <span>{t("dyslexiaFont")}</span>
                  {dyslexiaFont && <Check className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setLargeSpacing(!largeSpacing)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition flex items-center justify-center space-x-1 ${
                    largeSpacing
                      ? "bg-vvotel-blue text-white border-vvotel-blue"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  <span>{t("largerSpacing")}</span>
                  {largeSpacing && <Check className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Reset */}
            <div className="mt-5 pt-3 border-t flex justify-end">
              <button
                onClick={resetAll}
                className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-50 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("resetAll")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal with ALL 16 Languages */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-vvotel-gold" />
                <h3 className="font-extrabold text-xl text-vvotel-navy">
                  {t("chooseLanguage")}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowLangModal(false);
                  setLangSearch("");
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Language Search Input */}
            <div className="pt-4 pb-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter language (e.g. French, ភាសាខ្មែរ, 中文, Deutsch, 日本語)..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs sm:text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-vvotel-gold transition text-gray-800"
                />
              </div>
            </div>

            {/* 16 Languages Grid */}
            <div className="mt-3 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredLanguages.map((l) => {
                  const isSelected = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setShowLangModal(false);
                        setLangSearch("");
                      }}
                      className={`p-3 rounded-xl border-2 flex items-center justify-between text-left transition cursor-pointer group ${
                        isSelected
                          ? "border-vvotel-gold bg-amber-50 text-vvotel-navy font-bold shadow-sm"
                          : "border-gray-100 hover:border-vvotel-gold/50 bg-white hover:bg-amber-50/30 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{l.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-vvotel-navy group-hover:text-amber-700 transition">
                            {l.nativeName}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {l.name} • {l.region}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-vvotel-gold shrink-0 font-bold" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
              <span>
                {SUPPORTED_LANGUAGES.length} {lang === "km" ? "ភាសាគាំទ្រលើគេហទំព័រ" : "Languages supported across VVotel"}
              </span>
              <button
                onClick={() => {
                  setShowLangModal(false);
                  setLangSearch("");
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
