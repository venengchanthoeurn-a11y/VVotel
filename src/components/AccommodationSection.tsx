"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  BedDouble,
  Users,
  Maximize,
  Wifi,
  Tv,
  Coffee,
  Bath,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
} from "lucide-react";

export interface RoomItem {
  id: string;
  name: { en: string; km: string };
  category: { en: string; km: string };
  sizeSqm: number;
  bedType: { en: string; km: string };
  maxOccupancy: { en: string; km: string };
  pricePerNightUSD: number;
  view: { en: string; km: string };
  tagline: { en: string; km: string };
  description: { en: string; km: string };
  imageUrl: string;
  amenities: { en: string; km: string }[];
  highlight: { en: string; km: string };
}

export const ROOMS: RoomItem[] = [
  {
    id: "standard-city",
    name: {
      en: "Standard Room City View",
      km: "បន្ទប់ស្តង់ដារ ទេសភាពទីក្រុង",
    },
    category: {
      en: "Classic Comfort",
      km: "ផាសុកភាពបុរាណ",
    },
    sizeSqm: 34,
    bedType: {
      en: "1 King Bed or 2 Twin Beds",
      km: "គ្រែឃីង ១ ឬគ្រែទោល ២",
    },
    maxOccupancy: {
      en: "2 Adults, 1 Child (under 12)",
      km: "មនុស្សចាស់ ២, ក្មេង ១ (ក្រោម ១២ឆ្នាំ)",
    },
    pricePerNightUSD: 85,
    view: {
      en: "Kampong Cham City Skyline",
      km: "ទេសភាពទីក្រុងកំពង់ចាម",
    },
    tagline: {
      en: "Modern sanctuary blending contemporary elegance with Khmer accents",
      km: "កន្លែងសម្រាកដ៏ទំនើបដែលរួមបញ្ចូលភាពប្រណីតជាមួយរចនាបថខ្មែរ",
    },
    description: {
      en: "Designed for business or leisure travelers, our Standard Room features plush signature bedding, an ergonomic workstation, high-speed Wi-Fi, and expansive soundproof windows overlooking the vibrant streetscapes of Kampong Cham.",
      km: "រចនាឡើងយ៉ាងស័ក្តិសមសម្រាប់ភ្ញៀវទេសចរនិងធុរកិច្ច បន្ទប់ស្តង់ដារបំពាក់ដោយពូកប្រណីត តុធ្វើការ អ៊ីនធឺណិតល្បឿនលឿន និងបង្អួចកញ្ចក់ការពារសំឡេងយ៉ាងទូលាយមើលឃើញទិដ្ឋភាពក្រុងកំពង់ចាម។",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    highlight: {
      en: "Best Value",
      km: "តម្លៃសន្សំសំចៃបំផុត",
    },
    amenities: [
      { en: "High-Speed Wi-Fi 6", km: "វ៉ាយហ្វាយល្បឿនលឿន Wi-Fi 6" },
      { en: "50-inch 4K Smart TV", km: "ទូរទស្សន៍ឆ្លាតវៃ 50 អ៊ីញ 4K" },
      { en: "Rainfall Shower & Organic Toiletries", km: "ផ្កាឈូកទឹកក្តៅត្រជាក់ & សម្ភារៈបន្ទប់ទឹកធម្មជាតិ" },
      { en: "Tea & Local Coffee Station", km: "កន្លែងឆុងតែ & កាហ្វេកំពង់ចាម" },
      { en: "In-room Digital Safe", km: "ទូដែកសុវត្ថិភាពឌីជីថល" },
      { en: "Individual Climate Control", km: "ម៉ាស៊ីនត្រជាក់កម្រិតស្វ័យប្រវត្ត" },
    ],
  },
  {
    id: "superior-river",
    name: {
      en: "Superior Room River View",
      km: "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ",
    },
    category: {
      en: "River Panorama",
      km: "ទេសភាពទន្លេមេគង្គ",
    },
    sizeSqm: 42,
    bedType: {
      en: "1 King Bed with Luxury Pillowtop",
      km: "គ្រែឃីងធំ ១ ពូកទន់ប្រណីត",
    },
    maxOccupancy: {
      en: "2 Adults, 1 Child (under 12)",
      km: "មនុស្សចាស់ ២, ក្មេង ១ (ក្រោម ១២ឆ្នាំ)",
    },
    pricePerNightUSD: 125,
    view: {
      en: "Direct Mekong River & Koh Pen Island",
      km: "ទេសភាពទន្លេមេគង្គចំៗ និងកោះប៉ែន",
    },
    tagline: {
      en: "Private riverside balcony with mesmerizing sunrise over the Mekong",
      km: "យ៉រឯកជនមាត់ទន្លេ គយគន់ថ្ងៃរះដ៏អស្ចារ្យលើផ្ទៃទន្លេមេគង្គ",
    },
    description: {
      en: "Indulge in peaceful mornings watching traditional longboats glide across the golden waters of the Mekong. Features a private furnished balcony, marble bathroom with deep soaking tub, and premium French linen.",
      km: "ទទួលអារម្មណ៍ស្រស់ស្រាយនាពេលព្រឹកព្រលឹមគយគន់ទូកនេសាទលើទន្លេមេគង្គ។ មានយ៉រឯកជន បន្ទប់ទឹកថ្មម៉ាបជាមួយអាងត្រាំទឹកធំទូលាយ និងកម្រាលពូកកប្បាសបារាំងប្រណីត។",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
    highlight: {
      en: "Most Popular",
      km: "ពេញនិយមបំផុត",
    },
    amenities: [
      { en: "Private Mekong River Balcony", km: "យ៉រឯកជនមើលទន្លេមេគង្គ" },
      { en: "Deep Soaking Marble Bathtub", km: "អាងត្រាំទឹកថ្មម៉ាបប្រណីត" },
      { en: "Nespresso Coffee Machine", km: "ម៉ាស៊ីនឆុងកាហ្វេ Nespresso" },
      { en: "55-inch 4K Smart TV with Chromecast", km: "ទូរទស្សន៍ 55 អ៊ីញ ភ្ជាប់ Chromecast" },
      { en: "Plush Bathrobes & Spa Slippers", km: "អាវឃ្លុំងូតទឹក & ស្បែកជើងស្ប៉ា" },
      { en: "Complimentary Minibar Refreshment", km: "ភេសជ្ជៈបំពេញបន្ថែមឥតគិតថ្លៃ" },
    ],
  },
  {
    id: "executive-suite",
    name: {
      en: "Executive Mekong Suite (1 Bedroom)",
      km: "បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ (១ បន្ទប់គេង)",
    },
    category: {
      en: "VIP Executive",
      km: "វីអាយភី អ៊ិចសេគ្យូទីវ",
    },
    sizeSqm: 68,
    bedType: {
      en: "1 Grand King Bed + Rollaway Option",
      km: "គ្រែហ្គ្រែនឃីង ១ + ជម្រើសបន្ថែមគ្រែ",
    },
    maxOccupancy: {
      en: "3 Adults or 2 Adults + 2 Children",
      km: "មនុស្សចាស់ ៣ ឬមនុស្សចាស់ ២ + ក្មេង ២",
    },
    pricePerNightUSD: 195,
    view: {
      en: "180° Panoramic Mekong & Kizuna Bridge",
      km: "ទេសភាព ១៨០° ទន្លេមេគង្គ និងស្ពានគីហ្សូណា",
    },
    tagline: {
      en: "Expansive luxury suite with separate salon and Executive Lounge access",
      km: "បន្ទប់ស្វ៊ីតប្រណីតធំទូលាយ មានបន្ទប់ទទួលភ្ញៀវដាច់ដោយឡែក & សិទ្ធិចូល Executive Lounge",
    },
    description: {
      en: "A refined residential haven boasting a private living salon, executive dining table, freestanding stone bathtub facing the river, and VIP privileges including afternoon tea and sunset cocktails at the Club Lounge.",
      km: "លំនៅឋានដ៏ប្រណីតដែលមានបន្ទប់ទទួលភ្ញៀវធំទូលាយ តុទទួលទានអាហារ អាងត្រាំទឹកបែរមុខទៅទន្លេ និងសិទ្ធិពិសេស VIP ទទួលទានតែពេលរសៀល និងស្រាក្រឡុកពេលថ្ងៃលិចនៅ Club Lounge។",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    highlight: {
      en: "VIP Club Privileges",
      km: "សិទ្ធិពិសេស VIP",
    },
    amenities: [
      { en: "Executive Lounge Access (Tea & Cocktails)", km: "សិទ្ធិចូល Executive Lounge (តែ & ស្រាក្រឡុក)" },
      { en: "Separate Living Room & Dining Area", km: "បន្ទប់ទទួលភ្ញៀវ & តុអាហារដាច់ដោយឡែក" },
      { en: "Freestanding River-View Bathtub", km: "អាងត្រាំទឹកបែរមុខទៅទន្លេមេគង្គ" },
      { en: "Bose SoundLink Premium Audio", km: "ប្រព័ន្ធបំពងសំឡេង Bose SoundLink" },
      { en: "Free Laundry Service (2 pcs/day)", km: "សេវាបោកអ៊ុតឥតគិតថ្លៃ (២ កំប្លេ/ថ្ងៃ)" },
      { en: "Late Checkout until 15:00 (Subject to availability)", km: "ចាកចេញយឺតរហូតដល់ម៉ោង ៣ រសៀល" },
    ],
  },
  {
    id: "royal-family-suite",
    name: {
      en: "Royal Family River Suite (2 Bedroom)",
      km: "បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ (២ បន្ទប់គេង)",
    },
    category: {
      en: "Signature Family",
      km: "ប្រណីតភាពសម្រាប់គ្រួសារ",
    },
    sizeSqm: 110,
    bedType: {
      en: "1 Master King + 2 Queen Beds (2 Ensuite Bathrooms)",
      km: "បន្ទប់មេគ្រែឃីង ១ + បន្ទប់កូនគ្រែឃ្វីន ២ (បន្ទប់ទឹក ២)",
    },
    maxOccupancy: {
      en: "4 Adults + 3 Children",
      km: "មនុស្សចាស់ ៤ + ក្មេង ៣",
    },
    pricePerNightUSD: 280,
    view: {
      en: "Top-Floor Dual-Aspect River & City Panorama",
      km: "ជាន់លើបង្អស់ មើលឃើញទន្លេមេគង្គ និងក្រុងកំពង់ចាមទាំងមូល",
    },
    tagline: {
      en: "The ultimate family getaway with two master suites, kitchen, and panoramic terrace",
      km: "វិស្សមកាលគ្រួសារកម្រិតខ្ពស់ បន្ទប់មេ ២ កន្លែងចម្អិនអាហារ និងរាបលំហែកាយ",
    },
    description: {
      en: "Our flagship accommodation provides ultimate space and privacy for families. Features two expansive ensuite bedrooms, kids’ welcome gifts, fully equipped kitchenette, dining table for 6, and wraparound terrace over the Mekong.",
      km: "បន្ទប់លំដាប់កំពូលផ្តល់ភាពឯកជននិងផាសុកភាពសម្រាប់គ្រួសារធំ។ មានបន្ទប់គេងភ្ជាប់បន្ទប់ទឹកចំនួន ២ កាដូស្វាគមន៍សម្រាប់កុមារ ផ្ទះបាយខ្នាតតូច តុអាហារសម្រាប់ ៦ នាក់ និងរាបធំទូលាយគយគន់ទន្លេមេគង្គ។",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
    highlight: {
      en: "Ultimate Family Luxury",
      km: "ល្អបំផុតសម្រាប់គ្រួសារ",
    },
    amenities: [
      { en: "Two Private Ensuite Bedrooms", km: "បន្ទប់គេងឯកជនធំៗចំនួន ២ ភ្ជាប់បន្ទប់ទឹក" },
      { en: "Kids’ Explorer Kit & Bedtime Storybook", km: "កញ្ចប់កាដូកុមារ & សៀវភៅរឿងនិទាន" },
      { en: "Equipped Kitchenette & Microwave", km: "ផ្ទះបាយខ្នាតតូច & មីក្រូវ៉េវ" },
      { en: "Dining Area Seating 6 Guests", km: "តុអាហារគ្រួសារសម្រាប់ ៦ នាក់" },
      { en: "Complimentary Kids Club Access", km: "សិទ្ធិចូលលេងក្លឹបកុមារឥតគិតថ្លៃ" },
      { en: "24-Hour Dedicated Butler Service", km: "សេវាអ្នកបម្រើផ្ទាល់ខ្លួន ២៤ ម៉ោង" },
    ],
  },
];

export const AccommodationSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const [activeModalRoom, setActiveModalRoom] = useState<RoomItem | null>(null);

  const handleBookRoom = (room: RoomItem) => {
    // 1. Dispatch custom event to select room and open booking modal directly
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-booking-for-room", {
          detail: { roomId: room.id, roomName: room.name.km, price: room.pricePerNightUSD },
        })
      );
    }
    // 2. Scroll smoothly to booking bar
    const bookingBar = document.getElementById("booking-bar");
    if (bookingBar) {
      bookingBar.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="rooms" className="w-full py-16 sm:py-24 bg-[#f8f7f4] border-t border-b border-gray-200/60">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="space-y-3 max-w-4xl w-full">
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-vvotel-navy px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <BedDouble className="w-4 h-4 text-vvotel-gold" />
              <span>{lang === "km" ? "បន្ទប់ និងបន្ទប់ស្វ៊ីតប្រណីត" : "Luxury Rooms & Suites"}</span>
            </div>
            <h2 className="text-[clamp(1.15rem,2.6vw,2.2rem)] font-black text-vvotel-navy tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {lang === "km"
                ? "សម្រាកលំហែកាយជាមួយបន្ទប់ប្រណីតមាត់ទន្លេមេគង្គ"
                : "Sleep in Sublime Riverside Serenity"}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {lang === "km"
                ? "បន្ទប់នីមួយៗនៅ VVotel Kampong Cham ត្រូវបានរៀបចំយ៉ាងយកចិត្តទុកដាក់ ដើម្បីផ្តល់នូវផាសុកភាពខ្ពស់បំផុត ទេសភាពមាត់ទន្លេ និងបច្ចេកវិទ្យាទំនើប។"
                : "Every room and suite at VVotel Kampong Cham offers floor-to-ceiling river panoramas, bespoke artisan woodcraft, intuitive smart-room controls, and the legendary warmth of Khmer hospitality."}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold text-gray-500">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{lang === "km" ? "ធានាតម្លៃល្អបំផុត" : "Best Rate Guarantee"}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{lang === "km" ? "លុបចោលឥតគិតថ្លៃ" : "Free Cancellation"}</span>
            </span>
          </div>
        </div>

        {/* Room Grid (4 luxury cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {ROOMS.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
            >
              {/* Image Header */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={room.imageUrl}
                  alt={lang === "km" ? room.name.km : room.name.en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Highlight Badge */}
                <div className="absolute top-3 left-3 bg-vvotel-navy/90 backdrop-blur-md text-vvotel-gold text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-vvotel-gold/30 shadow">
                  {lang === "km" ? room.highlight.km : room.highlight.en}
                </div>

                {/* Price Pill */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">
                    {lang === "km" ? "ចាប់ពី" : "From"}
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-black text-vvotel-navy">
                      ${room.pricePerNightUSD}
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold">
                      /{lang === "km" ? "យប់" : "night"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    {lang === "km" ? room.category.km : room.category.en}
                  </div>
                  <h3 className="text-lg font-extrabold text-vvotel-navy leading-snug">
                    {lang === "km" ? room.name.km : room.name.en}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {lang === "km" ? room.tagline.km : room.tagline.en}
                  </p>
                </div>

                {/* Quick specs pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex items-center space-x-1.5">
                    <Maximize className="w-3.5 h-3.5 text-vvotel-gold" />
                    <span>{room.sizeSqm} m²</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-vvotel-gold" />
                    <span className="truncate">{lang === "km" ? room.bedType.km : room.bedType.en}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 col-span-2">
                    <Users className="w-3.5 h-3.5 text-vvotel-gold" />
                    <span className="truncate">{lang === "km" ? room.maxOccupancy.km : room.maxOccupancy.en}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => setActiveModalRoom(room)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 hover:border-vvotel-navy text-vvotel-navy text-xs font-bold transition hover:bg-gray-50 text-center"
                  >
                    {lang === "km" ? "ព័ត៌មានលម្អិត" : "Details"}
                  </button>
                  <button
                    onClick={() => handleBookRoom(room)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-vvotel-navy hover:bg-[#14325c] text-white text-xs font-extrabold transition shadow flex items-center justify-center space-x-1"
                  >
                    <span>{lang === "km" ? "កក់បន្ទប់" : "Book"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-vvotel-gold" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Detail Modal */}
      {activeModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Image */}
            <div className="relative aspect-[16/9] w-full">
              <img
                src={activeModalRoom.imageUrl}
                alt={lang === "km" ? activeModalRoom.name.km : activeModalRoom.name.en}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalRoom(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-vvotel-navy/95 text-white px-4 py-1.5 rounded-xl text-xs font-black">
                ${activeModalRoom.pricePerNightUSD} / {lang === "km" ? "យប់" : "night"}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase">
                  {lang === "km" ? activeModalRoom.category.km : activeModalRoom.category.en}
                </span>
                <h3 className="text-2xl font-black text-vvotel-navy">
                  {lang === "km" ? activeModalRoom.name.km : activeModalRoom.name.en}
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {lang === "km" ? activeModalRoom.description.km : activeModalRoom.description.en}
                </p>
              </div>

              {/* Room Specs */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl text-xs text-gray-700 border border-gray-100">
                <div>
                  <span className="text-gray-400 block font-semibold">{lang === "km" ? "ទំហំ" : "Size"}</span>
                  <span className="font-bold">{activeModalRoom.sizeSqm} m²</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">{lang === "km" ? "គ្រែ" : "Bed"}</span>
                  <span className="font-bold">{lang === "km" ? activeModalRoom.bedType.km : activeModalRoom.bedType.en}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">{lang === "km" ? "ទេសភាព" : "View"}</span>
                  <span className="font-bold">{lang === "km" ? activeModalRoom.view.km : activeModalRoom.view.en}</span>
                </div>
              </div>

              {/* Key Amenities */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-vvotel-navy uppercase tracking-wider">
                  {lang === "km" ? "សម្ភារៈ និងសេវាកម្មក្នុងបន្ទប់" : "Included Room Amenities"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  {activeModalRoom.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-vvotel-gold shrink-0" />
                      <span>{lang === "km" ? amenity.km : amenity.en}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">{lang === "km" ? "តម្លៃសរុបចាប់ពី" : "Rate starting from"}</span>
                  <span className="text-2xl font-black text-vvotel-navy">
                    ${activeModalRoom.pricePerNightUSD}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveModalRoom(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    {lang === "km" ? "បិទ" : "Close"}
                  </button>
                  <button
                    onClick={() => {
                      setActiveModalRoom(null);
                      handleBookRoom(activeModalRoom);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-vvotel-navy hover:bg-[#14325c] text-white text-xs font-black transition shadow-lg flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4 text-vvotel-gold" />
                    <span>{lang === "km" ? "កក់បន្ទប់នេះភ្លាមៗ" : "Book This Room"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
