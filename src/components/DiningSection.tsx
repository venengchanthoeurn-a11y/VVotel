"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Utensils,
  Clock,
  Sparkles,
  PhoneCall,
  Calendar,
  CheckCircle2,
  X,
  Coffee,
  Wine,
  ChefHat,
  Users,
} from "lucide-react";

export interface DiningVenue {
  id: string;
  name: { en: string; km: string };
  cuisine: { en: string; km: string };
  hours: { en: string; km: string };
  dressCode: { en: string; km: string };
  tagline: { en: string; km: string };
  description: { en: string; km: string };
  signatureDishes: { en: string; km: string }[];
  imageUrl: string;
}

export const DINING_VENUES: DiningVenue[] = [
  {
    id: "mekong-breeze",
    name: {
      en: "Mekong Breeze Restaurant",
      km: "ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស",
    },
    cuisine: {
      en: "Authentic Khmer Royal Cuisine & Contemporary International",
      km: "ម្ហូបខ្មែរបុរាណបែបព្រះបរមរាជវាំង & ម្ហូបអន្តរជាតិទំនើប",
    },
    hours: {
      en: "Breakfast: 06:00 - 10:30 | Lunch & Dinner: 11:30 - 22:30",
      km: "អាហារពេលព្រឹក: ០៦:០០ - ១០:៣០ | ថ្ងៃត្រង់ & ពេលល្ងាច: ១១:៣០ - ២២:៣០",
    },
    dressCode: {
      en: "Smart Casual",
      km: "សម្លៀកបំពាក់សមរម្យ",
    },
    tagline: {
      en: "All-day riverside dining celebrating the freshest Mekong fish and organic produce",
      km: "ទទួលទានអាហារមាត់ទន្លេមេគង្គ ជាមួយត្រីទន្លេស្រស់ៗ និងបន្លែសរីរាង្គក្នុងតំបន់",
    },
    description: {
      en: "Overlooking the sweeping waters of the Mekong, Mekong Breeze blends the rich culinary heritage of Cambodia with French gastronomic precision. Savor live-station buffet breakfasts, succulent river lobsters, and our renowned Steamed Fish Amok in banana leaf boat.",
      km: "បែរមុខទៅរកផ្ទៃទន្លេមេគង្គ ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស រួមបញ្ចូលគ្នានូវកេរដំណែលម្ហូបខ្មែរជាមួយរសជាតិបារាំងដ៏ឈ្ងុយឆ្ងាញ់។ ផ្តល់ជូនប៊ូហ្វេពេលព្រឹកស្រស់ៗ បង្កងទន្លេមេគង្គអាំង និងអាម៉ុកត្រីកែវប្រណីត។",
    },
    signatureDishes: [
      { en: "Signature Mekong River Prawn Amok", km: "អាម៉ុកបង្កងទន្លេមេគង្គពិសេស" },
      { en: "Slow-Braised Beef Saraman Curry", km: "ការីសារ៉ាម៉ាន់សាច់គោផុយ" },
      { en: "Kampot Pepper Wok-Fried Squid", km: "មឹកឆាម្រេចខ្ចីកំពត" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sunset-lounge",
    name: {
      en: "Sunset River Lounge & Cigar Terrace",
      km: "សាន់សិត រីវើឡោញ & បារបារី",
    },
    cuisine: {
      en: "Artisan Cocktails, Tapas & Cellar Wines",
      km: "ស្រាក្រឡុកប្រណីត អាហារសម្រន់តាប៉ាស & ស្រាទំពាំងបាយជូរ",
    },
    hours: {
      en: "Daily: 16:00 - 00:00 (Midnight)",
      km: "រៀងរាល់ថ្ងៃ: ១៦:០០ - ០០:០០ (អធ្រាត្រ)",
    },
    dressCode: {
      en: "Casual Chic",
      km: "សម្លៀកបំពាក់សុភាពទាន់សម័យ",
    },
    tagline: {
      en: "The premier vantage point in Kampong Cham for golden sunset cocktails",
      km: "ចំណុចទស្សនាថ្ងៃលិចដ៏ស្រស់ស្អាតបំផុតក្នុងខេត្តកំពង់ចាម ជាមួយស្រាក្រឡុក",
    },
    description: {
      en: "Perched above the riverfront with an open-air wooden deck, the Sunset Lounge is the ideal spot to unwind as the sky transforms into hues of violet and gold. Features signature cocktails infused with local pomelo, lemongrass, and Kampot peppercorns.",
      km: "ស្ថិតនៅលើរានឈើបែបទំនើបមាត់ទន្លេ សាន់សិត រីវើឡោញ គឺជាទីតាំងដ៏ស័ក្តិសមសម្រាប់លំហែកាយពេលព្រលប់។ រីករាយជាមួយស្រាក្រឡុកផ្សំពីក្រូចថ្លុងកោះប៉ែន ស្លឹកគ្រៃ និងម្រេចកំពត។",
    },
    signatureDishes: [
      { en: "Kampong Cham Pomelo Spritz", km: "ស្រាក្រឡុកក្រូចថ្លុងកំពង់ចាម" },
      { en: "Mekong Lemongrass Duck Spring Rolls", km: "ណែមទាស្លឹកគ្រៃមេគង្គបំពង" },
      { en: "Artisan Cheese & Charcuterie Board", km: "ឈីស & សាច់ក្រកស្ងួតអន្តរជាតិ" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "gourmet-cafe",
    name: {
      en: "Gourmet River Café & French Bakery",
      km: "ហ្គរម៉េ រីវើកាហ្វេ & ហាងនំប៉័ងបារាំង",
    },
    cuisine: {
      en: "Specialty Coffee, Viennoiserie, French Pastries & Gelato",
      km: "កាហ្វេពិសេស នំដុតបារាំង នំខេក & ការ៉េមជេឡាតូ",
    },
    hours: {
      en: "Daily: 06:30 - 19:00",
      km: "រៀងរាល់ថ្ងៃ: ០៦:៣០ - ១៩:០០",
    },
    dressCode: {
      en: "Casual",
      km: "សម្លៀកបំពាក់ធម្មតា",
    },
    tagline: {
      en: "Freshly baked butter croissants and single-origin Cambodian coffee roasts",
      km: "នំខ្វាសង់ប៊ឺរស្រស់ៗក្តៅៗ និងកាហ្វេគ្រាប់សុទ្ធមកពីខ្ពង់រាបកម្ពុជា",
    },
    description: {
      en: "Awaken to the tempting aroma of freshly baked French baguettes, flaky croissants, and hand-crafted patisserie. Pair with single-origin beans roasted in-house or refreshing fresh fruit smoothies from Koh Pen orchards.",
      km: "ដាស់អារម្មណ៍ជាមួយក្លិនឈ្ងុយនៃនំប៉័ងបារាំងដុតក្តៅៗ នំខ្វាសង់ និងនំខេកចម្រុះ។ ទទួលទានជាមួយកាហ្វេម៉ាស៊ីន ឬទឹកផ្លែឈើស្រស់ៗដែលបេះពីចម្ការកោះប៉ែន។",
    },
    signatureDishes: [
      { en: "Hand-Rolled French Butter Croissant", km: "នំខ្វាសង់ប៊ឺរបារាំងបុរាណ" },
      { en: "Iced Palm Sugar Coconut Latte", km: "ឡាតេដូងស្ករត្នោតខ្មែរទឹកកក" },
      { en: "Passionfruit & Mango Tartlet", km: "នំថាតផ្លែផាសិន & ស្វាយទុំ" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "in-room-dining",
    name: {
      en: "In-Room Private Balcony Dining 24/7",
      km: "សេវាអាហារដល់បន្ទប់ ២៤/៧",
    },
    cuisine: {
      en: "Comprehensive 24-Hour International & Khmer Comfort Menu",
      km: "ម្ហូបអន្តរជាតិ & ខ្មែរគ្រប់មុខ ២៤ ម៉ោងពេញ",
    },
    hours: {
      en: "24 Hours Daily",
      km: "២៤ ម៉ោងជារៀងរាល់ថ្ងៃ",
    },
    dressCode: {
      en: "Comfort of Your Room",
      km: "តាមផាសុកភាពក្នុងបន្ទប់",
    },
    tagline: {
      en: "Candlelit dining on your private balcony overlooking the shimmering Mekong",
      km: "ទទួលទានអាហារក្រោមពន្លឺទៀនលើយ៉រផ្ទាល់ខ្លួន គយគន់ពន្លឺទន្លេមេគង្គ",
    },
    description: {
      en: "Enjoy an intimate gourmet dinner without ever leaving the comfort of your room. Whether it's a sunrise champagne breakfast or midnight comfort noodles, our culinary team is at your beck and call 24 hours a day.",
      km: "រីករាយជាមួយអាហារដ៏ឆ្ងាញ់ពិសាដោយមិនបាច់ចាកចេញពីបន្ទប់របស់អ្នកឡើយ។ មិនថាជាអាហារពេលព្រឹកជាមួយសំប៉ាញ ឬមីគោកពេលយប់ជ្រៅនោះទេ ក្រុមមេចុងភៅយើងខ្ញុំត្រៀមបម្រើ ២៤ ម៉ោង។",
    },
    signatureDishes: [
      { en: "Riverside Champagne Breakfast Tray", km: "ថាសអាហារពេលព្រឹកជាមួយសំប៉ាញ" },
      { en: "Charcoal-Grilled Australian Ribeye", km: "សាច់គោអូស្ត្រាលីអាំងធ្យូង" },
      { en: "Late-Night Phnom Penh Kuy Teav Noodle", km: "គុយទាវភ្នំពេញពិសេសពេលយប់" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  },
];

export const DiningSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const [activeReservation, setActiveReservation] = useState<DiningVenue | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [resDate, setResDate] = useState("2026-11-04");
  const [resTime, setResTime] = useState("19:00");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState(false);

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setReservationSuccess(true);
    setTimeout(() => {
      setReservationSuccess(false);
      setActiveReservation(null);
    }, 3000);
  };

  return (
    <section id="dining" className="w-full py-16 sm:py-24 bg-white border-b border-gray-200/60">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <ChefHat className="w-4 h-4 text-amber-600" />
              <span>{lang === "km" ? "ភោជនីយដ្ឋាន & បារប្រណីត" : "Restaurants & Bars"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-vvotel-navy tracking-tight">
              {lang === "km"
                ? "រសជាតិដ៏វិសេសវិសាលជាប់មាត់ទន្លេមេគង្គ"
                : "Culinary Excellence on the Riverfront"}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {lang === "km"
                ? "ស្វែងយល់ពីពិភពនៃរសជាតិដ៏សម្បូរបែប ចាប់ពីម្ហូបខ្មែរពិតប្រាកដ រហូតដល់ស្រាក្រឡុកពេលថ្ងៃលិច និងនំប៉័ងបារាំងដុតថ្មីៗ។"
                : "Experience four distinct dining venues crafted by our award-winning master chefs, honoring Cambodia’s heritage with fresh seasonal river bounty and world-class hospitality."}
            </p>
          </div>

          <a
            href="tel:+85542982999"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-vvotel-navy text-white text-xs font-bold hover:bg-[#14325c] transition shadow"
          >
            <PhoneCall className="w-4 h-4 text-vvotel-gold" />
            <span>{lang === "km" ? "កក់តុជាមុន: +855 42 982 999" : "Table Reservations: +855 42 982 999"}</span>
          </a>
        </div>

        {/* 4 Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {DINING_VENUES.map((venue) => (
            <div
              key={venue.id}
              className="bg-[#fbfaf8] rounded-2xl overflow-hidden border border-gray-200/80 hover:border-vvotel-gold/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                <img
                  src={venue.imageUrl}
                  alt={lang === "km" ? venue.name.km : venue.name.en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-black uppercase text-vvotel-gold tracking-widest block">
                    {lang === "km" ? venue.cuisine.km : venue.cuisine.en}
                  </span>
                  <h3 className="text-2xl font-black text-white drop-shadow">
                    {lang === "km" ? venue.name.km : venue.name.en}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {lang === "km" ? venue.description.km : venue.description.en}
                  </p>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-white p-3.5 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-vvotel-gold shrink-0" />
                      <span className="font-semibold">{lang === "km" ? "ម៉ោងបើក:" : "Hours:"}</span>
                      <span>{lang === "km" ? venue.hours.km : venue.hours.en}</span>
                    </div>
                  </div>

                  {/* Signature Dishes */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-amber-700 tracking-wider block">
                      {lang === "km" ? "មុខម្ហូបល្បីប្រចាំហាង:" : "Chef's Signatures:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.signatureDishes.map((dish, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-1 rounded-lg font-medium"
                        >
                          {lang === "km" ? dish.km : dish.en}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    onClick={() => setActiveReservation(venue)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-vvotel-navy hover:bg-[#14325c] text-white text-xs font-black transition shadow flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-vvotel-gold" />
                    <span>{lang === "km" ? "កក់តុអាហារ" : "Book a Table"}</span>
                  </button>
                  <a
                    href="tel:+85542982999"
                    className="py-2.5 px-4 rounded-xl border border-gray-300 hover:border-vvotel-navy text-vvotel-navy text-xs font-bold transition hover:bg-gray-100 flex items-center space-x-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{lang === "km" ? "ទូរស័ព្ទ" : "Call"}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Modal */}
      {activeReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs text-amber-700 font-bold uppercase">
                  {lang === "km" ? "កក់តុទទួលទានអាហារ" : "Restaurant Reservation"}
                </span>
                <h3 className="text-xl font-black text-vvotel-navy">
                  {lang === "km" ? activeReservation.name.km : activeReservation.name.en}
                </h3>
              </div>
              <button
                onClick={() => setActiveReservation(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reservationSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-black">
                  {lang === "km" ? "ការកក់តុរបស់អ្នកទទួលបានជោគជ័យ!" : "Table Reservation Confirmed!"}
                </h4>
                <p className="text-xs">
                  {lang === "km"
                    ? `យើងខ្ញុំបានកត់ត្រាការកក់សម្រាប់ ${guestCount} នាក់ នៅថ្ងៃទី ${resDate} វេលាម៉ោង ${resTime}។ ក្រុមការងារយើងនឹងទាក់ទងបញ្ជាក់តាមទូរស័ព្ទ។`
                    : `We have reserved a table for ${guestCount} guests on ${resDate} at ${resTime}. Our host will contact you shortly.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReservation} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "កាលបរិច្ឆេទ" : "Date"}
                    </label>
                    <input
                      type="date"
                      value={resDate}
                      onChange={(e) => setResDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "ម៉ោង" : "Time"}
                    </label>
                    <input
                      type="time"
                      value={resTime}
                      onChange={(e) => setResTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "ចំនួនភ្ញៀវ" : "Number of Guests"}
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                        <option key={num} value={num}>
                          {num} {lang === "km" ? "នាក់" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "លេខទូរស័ព្ទ" : "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="012 345 678"
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    {lang === "km" ? "ឈ្មោះអ្នកកក់" : "Your Full Name"}
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={lang === "km" ? "ឧ. សុខ ចិន្តា" : "e.g. John Doe"}
                    className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveReservation(null)}
                    className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100"
                  >
                    {lang === "km" ? "បោះបង់" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-vvotel-navy hover:bg-[#14325c] text-white font-black rounded-xl shadow"
                  >
                    {lang === "km" ? "បញ្ជាក់ការកក់" : "Confirm Reservation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
