"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Download,
  X,
  Smartphone,
  Sparkles,
  Share,
  PlusSquare,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export const PwaInstallPrompt: React.FC = () => {
  const { lang } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker and purge obsolete caches
    if (typeof window !== "undefined") {
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            if (name === "vvotel-v1") {
              caches.delete(name);
            }
          });
        });
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js?v=2")
          .then((reg) => {
            reg.update();
            console.log("Service Worker registered and refreshed:", reg.scope);
          })
          .catch((err) => {
            console.warn("Service Worker registration failed:", err);
          });
      }
    }

    // 2. Check if already installed / in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Detect iOS / iPadOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.maxTouchPoints > 1 && /macintosh/.test(ua));
    setIsIosDevice(isIos);

    // 4. Capture native beforeinstallprompt (Android / Chrome / Edge)
    const promptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem("vvotel_pwa_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };
    window.addEventListener("beforeinstallprompt", promptHandler);

    // 5. On iOS or general mobile, beforeinstallprompt never fires!
    // So we show the banner with a slight delay (1.5s) if not dismissed
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("vvotel_pwa_dismissed");
      if (!dismissed && !isStandalone) {
        setShowPrompt(true);
      }
    }, 1500);

    // 6. Listen for appinstalled
    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    // 7. Global custom event to trigger install from any button in the app
    const customTriggerHandler = () => {
      if (isIos) {
        setShowIosModal(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowAndroidModal(true);
      }
    };
    window.addEventListener("open-pwa-install", customTriggerHandler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", promptHandler);
      window.removeEventListener("appinstalled", installedHandler);
      window.removeEventListener("open-pwa-install", customTriggerHandler);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIosDevice) {
      setShowIosModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowAndroidModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("vvotel_pwa_dismissed", "true");
  };

  return (
    <>
      {/* Floating Bottom Install Banner (Shows on Mobile, iPad, and Desktop) */}
      {!isInstalled && showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#0c2340] text-white p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-vvotel-gold/60 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src="/icons/icon-192.png?v=2"
                alt="VVotel App"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain shrink-0 shadow-lg border border-vvotel-gold/50 bg-white p-0.5"
              />
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-vvotel-gold">
                    PWA APPLICATION
                  </span>
                  <Sparkles className="w-3 h-3 text-vvotel-gold shrink-0" />
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
                  {lang === "km" ? "ដំឡើងកម្មវិធី VVotel" : "Install VVotel App"}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-gray-300 line-clamp-1">
                  {lang === "km"
                    ? "ប្រើប្រាស់លឿន ងាយស្រួល និងដំណើរការ offline"
                    : "Fast access & offline riverside guide on your device"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-2 bg-gradient-to-r from-vvotel-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-vvotel-navy font-black text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
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
      )}

      {/* iOS / iPad Step-by-Step Installation Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-gray-900 border border-gray-200 relative animate-in slide-in-from-bottom-6 duration-300">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/icons/icon-192.png?v=2"
                alt="VVotel App"
                className="w-12 h-12 rounded-2xl object-contain shadow-md border border-vvotel-gold/50 bg-white p-1 shrink-0"
              />
              <div>
                <h3 className="font-extrabold text-base text-vvotel-navy">
                  {lang === "km" ? "ដំឡើង VVotel លើ iPhone / iPad" : "Install VVotel on iPhone & iPad"}
                </h3>
                <p className="text-xs text-gray-500">
                  {lang === "km"
                    ? "អនុវត្តតាម ៣ ជំហានងាយៗក្នុង Safari"
                    : "Follow 3 quick steps in Safari browser"}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 py-3 border-y border-gray-100 text-xs">
              {/* Step 1 */}
              <div className="flex items-start space-x-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/50">
                <div className="w-6 h-6 rounded-full bg-vvotel-navy text-vvotel-gold font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {lang === "km"
                      ? "ចុចប៊ូតុង Share (ចែករំលែក)"
                      : "Tap the Share button"}
                  </p>
                  <p className="text-gray-600 mt-0.5">
                    {lang === "km"
                      ? "នៅលើរបារ Safari (ខាងក្រោមលើ iPhone ឬខាងលើលើ iPad) ចុចលើរូបសញ្ញាប្រអប់មានព្រួញឡើងលើ "
                      : "On Safari toolbar (bottom on iPhone, top on iPad), tap the square icon with arrow pointing up "}
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono text-[11px] font-bold text-sky-600">
                      <Share className="w-3 h-3 inline mr-1" /> Share
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/50">
                <div className="w-6 h-6 rounded-full bg-vvotel-navy text-vvotel-gold font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {lang === "km"
                      ? "ជ្រើសរើស «Add to Home Screen»"
                      : "Select 'Add to Home Screen'"}
                  </p>
                  <p className="text-gray-600 mt-0.5">
                    {lang === "km"
                      ? "អូសផ្ទាំងចែករំលែកចុះក្រោមបន្តិច រួចចុចលើ "
                      : "Scroll down the share sheet and tap "}
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-white rounded border border-gray-300 font-bold text-gray-800">
                      <PlusSquare className="w-3 h-3 inline mr-1 text-vvotel-gold" />
                      {lang === "km" ? "បន្ថែមទៅអេក្រង់ដើម" : "Add to Home Screen"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/50">
                <div className="w-6 h-6 rounded-full bg-vvotel-navy text-vvotel-gold font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {lang === "km"
                      ? "ចុចប៊ូតុង «Add» (បន្ថែម)"
                      : "Tap 'Add' to finish"}
                  </p>
                  <p className="text-gray-600 mt-0.5">
                    {lang === "km"
                      ? "ចុចពាក្យ Add នៅជ្រុងខាងលើស្តាំ។ កម្មវិធី VVotel នឹងលោតលើអេក្រង់ iPhone/iPad ដូច App ធម្មតា!"
                      : "Tap 'Add' at the top-right corner. VVotel will appear directly on your home screen!"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => setShowIosModal(false)}
                className="w-full py-2.5 bg-vvotel-navy text-white font-bold rounded-xl text-xs hover:bg-vvotel-blue transition"
              >
                {lang === "km" ? "យល់ព្រម" : "Got It"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android / Desktop Manual Guide Modal (if native prompt was blocked) */}
      {showAndroidModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-gray-900 border border-gray-200 relative">
            <button
              onClick={() => setShowAndroidModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/icons/icon-192.png?v=2"
                alt="VVotel App"
                className="w-12 h-12 rounded-2xl object-contain shadow-md border border-vvotel-gold/50 bg-white p-1 shrink-0"
              />
              <div>
                <h3 className="font-extrabold text-base text-vvotel-navy">
                  {lang === "km" ? "ដំឡើងកម្មវិធី VVotel" : "Install VVotel Application"}
                </h3>
                <p className="text-xs text-gray-500">
                  {lang === "km"
                    ? "ការដំឡើងលើ Android / Chrome / Edge"
                    : "Install guide for Android & Desktop"}
                </p>
              </div>
            </div>

            <div className="space-y-3 py-3 border-y border-gray-100 text-xs">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  {lang === "km"
                    ? "នៅលើ Chrome (Android): ចុចលើសញ្ញាចុចបី ⋮ នៅជ្រុងខាងលើស្តាំ ➡️ ជ្រើសរើស «Install app» (ឬ «Add to Home screen»)"
                    : "On Chrome (Android): Tap menu ⋮ at top-right ➡️ Select 'Install app' (or 'Add to Home screen')"}
                </p>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  {lang === "km"
                    ? "នៅលើកុំព្យូទ័រ (PC/Mac): ចុចលើរូប Icon Install 📥 នៅខាងស្តាំរបារអាសយដ្ឋាន URL"
                    : "On Desktop: Click the Install icon in your browser's address bar"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowAndroidModal(false)}
                className="w-full py-2.5 bg-vvotel-navy text-white font-bold rounded-xl text-xs hover:bg-vvotel-blue transition"
              >
                {lang === "km" ? "យល់ព្រម" : "Got It"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
