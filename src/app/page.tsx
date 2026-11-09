"use client";

import React, { useState, useMemo } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { BookingBar } from "@/components/BookingBar";
import { DestinationCard } from "@/components/DestinationCard";
import { DestinationDetailModal } from "@/components/DestinationDetailModal";
import { InteractiveMap } from "@/components/InteractiveMap";
import { AccommodationSection } from "@/components/AccommodationSection";
import { DiningSection } from "@/components/DiningSection";
import { SpecialOffersSection } from "@/components/SpecialOffersSection";
import { MeetingEventsSection } from "@/components/MeetingEventsSection";
import { ServicesSection } from "@/components/ServicesSection";
import { LoyaltyBanner } from "@/components/LoyaltyBanner";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DESTINATIONS, Destination } from "@/data/destinations";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import {
  Compass,
  Search,
  Palmtree,
  UtensilsCrossed,
  Landmark,
  Bike,
  Sparkles,
  Info,
  PhoneCall,
  MapPin,
  Maximize2,
} from "lucide-react";

export default function HomePage() {
  const { lang, t } = useLanguage();
  const { settings } = useSettings();

  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Merge static DESTINATIONS with any custom destinations configured in Settings
  const allDestinations: Destination[] = useMemo(() => {
    const list: Destination[] = [...DESTINATIONS];
    if (settings?.destinations && settings.destinations.length > 0) {
      settings.destinations.forEach((custom) => {
        const existingIdx = list.findIndex((d) => d.id === custom.id || d.slug === custom.slug);
        const mapped: Destination = {
          id: custom.id,
          slug: custom.slug,
          category: custom.category,
          categoryName: {
            en: custom.categoryNameEn || "Attraction",
            km: custom.categoryNameKm || "រមណីយដ្ឋាន",
          },
          title: {
            en: custom.nameEn,
            km: custom.nameKm,
          },
          tagline: {
            en: custom.taglineEn || custom.nameEn,
            km: custom.taglineKm || custom.nameKm,
          },
          summary: {
            en: custom.descriptionEn || "",
            km: custom.descriptionKm || "",
          },
          fullDescription: {
            en: custom.descriptionEn || "",
            km: custom.descriptionKm || "",
          },
          distanceFromHotel: {
            en: `${custom.travelTimeMinutes || 10} mins from hotel`,
            km: `${custom.travelTimeMinutes || 10} នាទីពីសណ្ឋាគារ`,
          },
          address: {
            en: "Kampong Cham Province, Cambodia",
            km: "ខេត្តកំពង់ចាម, ប្រទេសកម្ពុជា",
          },
          latitude: custom.latitude,
          longitude: custom.longitude,
          googleMapsUrl: custom.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${custom.latitude},${custom.longitude}`,
          imageUrl: custom.imageUrl || "/images/destinations/koh-pen-beach.jpg",
          travelTimeMinutes: custom.travelTimeMinutes || 10,
        };
        if (existingIdx !== -1) {
          list[existingIdx] = { ...list[existingIdx], ...mapped };
        } else if (custom.enabled !== false) {
          list.push(mapped);
        }
      });
    }
    return list;
  }, [settings?.destinations]);

  // Filtered destinations
  const filteredDestinations = useMemo(() => {
    return allDestinations.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCategory;

      const matchSearch =
        item.title.en.toLowerCase().includes(q) ||
        item.title.km.toLowerCase().includes(q) ||
        item.summary.en.toLowerCase().includes(q) ||
        item.summary.km.toLowerCase().includes(q) ||
        item.address.en.toLowerCase().includes(q) ||
        item.address.km.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [allDestinations, selectedCategory, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    return {
      all: allDestinations.length,
      "beaches-nature": allDestinations.filter((d) => d.category === "beaches-nature").length,
      restaurants: allDestinations.filter((d) => d.category === "restaurants").length,
      "culture-local-life": allDestinations.filter((d) => d.category === "culture-local-life").length,
      "sports-activities": allDestinations.filter((d) => d.category === "sports-activities").length,
    };
  }, [allDestinations]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf8] text-[#1e293b]">
      {/* Top Access & Language Bar */}
      <TopBar />

      {/* Main Luxury Header with persistent MenuSidebar trigger */}
      <Header />

      {/* Sticky Advanced Multi-Room Booking Bar */}
      <BookingBar />

      <main id="main-content" className="flex-1 w-full">
        {/* Full-width Immersive Hero Section */}
        <section className="relative w-full bg-gradient-to-b from-[#08182b] via-[#0c2340] to-[#14325c] text-white py-20 sm:py-28 px-4 sm:px-8 lg:px-16 overflow-hidden">
          {/* Background Atmospheric Imagery - Authentic Kampong Cham Mekong Sunset */}
          <div className="absolute inset-0 opacity-25 bg-[url('/images/destinations/sunset-cruise.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08182b] via-[#0c2340]/60 to-[#08182b]/80" />

          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 text-xs text-vvotel-gold font-extrabold tracking-widest uppercase shadow-lg">
              <Compass className="w-4 h-4 text-vvotel-gold animate-spin-slow" />
              <span>{t("heroTitle")} • KAMPONG CHAM, CAMBODIA</span>
            </div>

            <h1 className="text-[clamp(1.15rem,2.8vw,2.3rem)] font-black tracking-tight text-white leading-normal drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis max-w-full mx-auto px-2">
              {t("heroSubtitle")}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed pt-2 font-normal">
              {t("heroDescription")}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/15 text-gray-200">
                <MapPin className="w-4 h-4 text-vvotel-gold" />
                <span className="font-semibold">{lang === "km" ? "២០ ទីតាំងពិតប្រាកដក្នុងខេត្តកំពង់ចាម" : "20 Authentic Kampong Cham Attractions"}</span>
              </span>
              <a
                href="tel:+85542982999"
                className="flex items-center space-x-2 bg-gradient-to-r from-vvotel-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-white px-5 py-2 rounded-xl transition font-extrabold shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>+855 (0) 42 982 999</span>
              </a>
            </div>
          </div>
        </section>

        {/* Accommodation Section (#rooms) */}
        <AccommodationSection />

        {/* Dining Section (#dining) */}
        <DiningSection />

        {/* Full-width Expansive Content Area */}
        <section id="destination-guide" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 sm:py-16 space-y-10">
          {/* Category Filter Pills & Search Bar (Full Screen Breadth) */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
            {/* Category Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 shadow-sm ${
                  selectedCategory === "all"
                    ? "bg-vvotel-navy text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{t("allPoints")}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${selectedCategory === "all" ? "bg-vvotel-gold text-vvotel-navy font-bold" : "bg-gray-200 text-gray-700"}`}>
                  {categoryCounts.all}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory("beaches-nature")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 shadow-sm ${
                  selectedCategory === "beaches-nature"
                    ? "bg-sky-600 text-white shadow-md"
                    : "bg-sky-50 text-sky-800 hover:bg-sky-100"
                }`}
              >
                <Palmtree className="w-4 h-4" />
                <span>{t("beachesNature")}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/40">
                  {categoryCounts["beaches-nature"]}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory("restaurants")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 shadow-sm ${
                  selectedCategory === "restaurants"
                    ? "bg-amber-600 text-white shadow-md"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>{t("restaurants")}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/40">
                  {categoryCounts.restaurants}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory("culture-local-life")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 shadow-sm ${
                  selectedCategory === "culture-local-life"
                    ? "bg-rose-600 text-white shadow-md"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>{t("cultureLocalLife")}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/40">
                  {categoryCounts["culture-local-life"]}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory("sports-activities")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 shadow-sm ${
                  selectedCategory === "sports-activities"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>{t("sportsActivities")}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/40">
                  {categoryCounts["sports-activities"]}
                </span>
              </button>
            </div>

            {/* Live Search */}
            <div className="relative min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-vvotel-gold bg-gray-50 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Interactive Google Maps Component (Full Screen Breadth) */}
          <InteractiveMap
            destinations={filteredDestinations}
            onSelectDestination={(d) => setSelectedDestination(d)}
            selectedCategory={selectedCategory}
          />

          {/* Featured Destinations Grid */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-vvotel-navy tracking-tight">
                  {lang === "km" ? "គោលដៅទេសចរណ៍ពិសេសៗនៅកំពង់ចាម (Featured Destinations)" : "Featured Kampong Cham Destinations"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {lang === "km"
                    ? `បង្ហាញចំនួន ${filteredDestinations.length} ក្នុងចំណោម ២០ ទីតាំងទេសចរណ៍ពិតប្រាកដក្នុងខេត្តកំពង់ចាម`
                    : `Showing ${filteredDestinations.length} of 20 authentic landmarks and attractions around Kampong Cham`}
                </p>
              </div>

              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs font-bold text-vvotel-gold hover:underline"
                >
                  {lang === "km" ? "បង្ហាញទីតាំងទាំងអស់ឡើងវិញ (View All)" : "View All Locations"}
                </button>
              )}
            </div>

            {filteredDestinations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <Compass className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-bold text-base text-gray-700">
                  {lang === "km" ? "រកមិនឃើញទីតាំងដែលត្រូវនឹងការស្វែងរកទេ" : "No destinations match your filter"}
                </h3>
                <p className="text-xs text-gray-500">
                  {lang === "km" ? "សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬជ្រើសរើសប្រភេទផ្សេងទៀត" : "Try searching for another keyword or reset the category filter"}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-2 px-5 py-2.5 bg-vvotel-navy text-white text-xs font-bold rounded-xl"
                >
                  {lang === "km" ? "កំណត់ឡើងវិញ (Reset Filter)" : "Reset Filter"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredDestinations.map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    onOpenDetail={(d) => setSelectedDestination(d)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Special Offers Section (#special-offers) */}
        <SpecialOffersSection />

        {/* Meeting & Event Spaces Section (#meeting-events) */}
        <MeetingEventsSection />

        {/* Services & Facilities Section (#services) */}
        <ServicesSection />

        {/* Loyalty Program Section */}
        <LoyaltyBanner />

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>

      {/* Destination Detail Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
      />

      {/* Global Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar (Icons for all key actions on mobile) */}
      <MobileBottomNav />
    </div>
  );
}
