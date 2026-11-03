"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

export const PwaInstallPrompt: React.FC = () => {
  const { lang, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });
    }

    // Check if already in standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed previously in this session
      const dismissed = sessionStorage.getItem("vvotel_pwa_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions if browser doesn't support automatic prompt
      alert(
        lang === "km"
          ? "ដើម្បីដំឡើងកម្មវិធី VVotel:\n- លើទូរស័ព្ទ iPhone/Safari: ចុចប៊ូតុង Share (ចែករំលែក) រួចជ្រើស 'Add to Home Screen'\n- លើ Android/Chrome: ចុចសញ្ញាចុចបី ⋮ ខាងលើស្តាំ រួចជ្រើស 'Install app'"
          : "To install VVotel App:\n- On iPhone/Safari: Tap Share button and select 'Add to Home Screen'\n- On Android/Chrome: Tap menu ⋮ and select 'Install app'"
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("vvotel_pwa_dismissed", "true");
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#0c2340] text-white p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-vvotel-gold/50 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-vvotel-gold text-vvotel-navy font-black text-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/20">
            V
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-vvotel-gold">
                PWA Application
              </span>
              <Sparkles className="w-3.5 h-3.5 text-vvotel-gold" />
            </div>
            <h4 className="text-sm font-extrabold text-white leading-tight">
              {lang === "km" ? "ដំឡើងកម្មវិធី VVotel" : "Install VVotel App"}
            </h4>
            <p className="text-[11px] text-gray-300 line-clamp-1">
              {lang === "km"
                ? "ប្រើប្រាស់លឿន ងាយស្រួល និងដំណើរការ offline"
                : "Fast access & offline riverside guide on your device"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-gradient-to-r from-vvotel-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-vvotel-navy font-black text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === "km" ? "ដំឡើង" : "Install"}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
