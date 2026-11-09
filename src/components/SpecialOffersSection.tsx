"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  Tag,
  Calendar,
  Gift,
  ArrowRight,
  Clock,
  CheckCircle2,
  Percent,
} from "lucide-react";

export interface SpecialOffer {
  id: string;
  code: string;
  discountBadge: { en: string; km: string };
  title: { en: string; km: string };
  tagline: { en: string; km: string };
  validity: { en: string; km: string };
  description: { en: string; km: string };
  inclusions: { en: string; km: string }[];
  imageUrl: string;
}

export const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: "weekend-getaway",
    code: "WEEKEND25",
    discountBadge: { en: "Save 25%", km: "បញ្ចុះតម្លៃ ២៥%" },
    title: {
      en: "Weekend Mekong Getaway",
      km: "កញ្ចប់សម្រាកចុងសប្តាហ៍មាត់ទន្លេមេគង្គ",
    },
    tagline: {
      en: "Recharge your spirit with a tranquil weekend escape on the Mekong",
      km: "បញ្ចូលថាមពលជីវិតជាមួយវិស្សមកាលចុងសប្តាហ៍ដ៏ស្ងប់ស្ងាត់មាត់ទន្លេ",
    },
    validity: {
      en: "Valid for Friday - Sunday stays through 2026",
      km: "សុពលភាពសម្រាប់ការស្នាក់នៅថ្ងៃសុក្រ ដល់ អាទិត្យ ពេញមួយឆ្នាំ ២០២៦",
    },
    description: {
      en: "Escape the city bustle and immerse in the serene riverside beauty of Kampong Cham. Book a minimum 2-night weekend stay and enjoy 25% off our best available rates plus daily buffet breakfast for two.",
      km: "គេចចេញពីភាពអ៊ូអរក្នុងក្រុងមកទទួលយកខ្យល់អាកាសដ៏បរិសុទ្ធមាត់ទន្លេមេគង្គ។ កក់ការស្នាក់នៅចាប់ពី ២ យប់ឡើងទៅ ទទួលបានការបញ្ចុះតម្លៃ ២៥% រួមទាំងប៊ូហ្វេអាហារពេលព្រឹកសម្រាប់ ២ នាក់។",
    },
    inclusions: [
      { en: "Daily Riverside Buffet Breakfast for 2", km: "ប៊ូហ្វេអាហារពេលព្រឹកមាត់ទន្លេសម្រាប់ ២ នាក់" },
      { en: "Complimentary Sunset Cocktail at Sunset Lounge", km: "ស្រាក្រឡុកពេលថ្ងៃលិចឥតគិតថ្លៃនៅ Sunset Lounge" },
      { en: "Complimentary Mountain Bicycles for Koh Pen", km: "កង់ជិះកម្សាន្តកោះប៉ែនឥតគិតថ្លៃ" },
      { en: "Late Check-out until 14:00", km: "ចាកចេញយឺតរហូតដល់ម៉ោង ២ រសៀល" },
    ],
    imageUrl:
      "/images/rooms/vv_google_maps_photo.jpg",
  },
  {
    id: "family-holiday",
    code: "FAMILYFUN",
    discountBadge: { en: "Kids Stay & Eat Free", km: "កុមារស្នាក់នៅ & ញ៉ាំឥតគិតថ្លៃ" },
    title: {
      en: "Family River Discovery Package",
      km: "កញ្ចប់ដំណើរកម្សាន្តគ្រួសាររីករាយ",
    },
    tagline: {
      en: "Unforgettable memories with spacious suites and complimentary kids activities",
      km: "អនុស្សាវរីយ៍មិនអាចបំភ្លេចបានជាមួយបន្ទប់ស្វ៊ីតធំទូលាយ & សកម្មភាពកុមារ",
    },
    validity: {
      en: "Valid for families with children under 12",
      km: "សម្រាប់ក្រុមគ្រួសារដែលមានកុមារក្រោមអាយុ ១២ ឆ្នាំ",
    },
    description: {
      en: "Treat the whole family to an enriching riverside adventure. Children under 12 stay and dine complimentary with parents, plus enjoy full access to The Mekong Explorers Kids Club and island discovery kits.",
      km: "ផ្តល់ជូនដំណើរកម្សាន្តដ៏មានន័យសម្រាប់គ្រួសារទាំងមូល។ កុមារក្រោម ១២ ឆ្នាំស្នាក់នៅ និងទទួលទានអាហារឥតគិតថ្លៃជាមួយឪពុកម្តាយ ព្រមទាំងចូលរួមលេងនៅ Kids Club ដោយសេរី។",
    },
    inclusions: [
      { en: "Kids under 12 stay & eat free from Kids Menu", km: "កុមារក្រោម ១២ ឆ្នាំស្នាក់នៅ និងញ៉ាំឥតគិតថ្លៃ" },
      { en: "Daily Kids Club Explorer activities & games", km: "សកម្មភាពហ្គេម & ការកម្សាន្តនៅ Kids Club រាល់ថ្ងៃ" },
      { en: "Family passes for Koh Pen Bamboo Bridge", km: "សំបុត្រឆ្លងកាត់ស្ពានឫស្សីកោះប៉ែនសម្រាប់គ្រួសារ" },
      { en: "Complimentary extra rollaway bed in suite", km: "គ្រែបន្ថែមឥតគិតថ្លៃក្នុងបន្ទប់ស្វ៊ីត" },
    ],
    imageUrl:
      "/images/rooms/vv_executive_living.jpg",
  },
  {
    id: "romantic-retreat",
    code: "ROMANCE",
    discountBadge: { en: "All-Inclusive Romance", km: "កញ្ចប់គូស្នេហ៍ពិសេស" },
    title: {
      en: "Romantic Mekong Sunset Retreat",
      km: "វិស្សមកាលផ្អែមល្ហែមគូស្នេហ៍មាត់ទន្លេ",
    },
    tagline: {
      en: "Candlelit dinners, couple massage, and chilled sparkling wine",
      km: "អាហារពេលល្ងាចក្រោមពន្លឺទៀន ម៉ាស្សាគូស្នេហ៍ និងស្រាសំប៉ាញត្រជាក់ស្រេប",
    },
    validity: {
      en: "Year-round romantic escape package",
      km: "កញ្ចប់គូស្នេហ៍មានពេញមួយឆ្នាំ",
    },
    description: {
      en: "Celebrate your love with a magical getaway. Indulge in a 60-minute relaxing Khmer herbal massage for two at Lotus Spa, a bottle of French sparkling wine on arrival, and a 4-course candlelit dinner under the stars.",
      km: "អបអរសាទរថ្ងៃពិសេសជាមួយមនុស្សជាទីស្រឡាញ់។ រីករាយជាមួយការម៉ាស្សាឱសថបុរាណខ្មែរ ៦០ នាទីសម្រាប់ ២ នាក់នៅ Lotus Spa ស្រាសំប៉ាញបារាំង ១ ដប និងអាហារ ៤ មុខក្រោមពន្លឺផ្កាយ។",
    },
    inclusions: [
      { en: "Bottle of French sparkling wine & fruit basket", km: "ស្រាសំប៉ាញបារាំង ១ ដប និងកន្ត្រកផ្លែឈើស្រស់" },
      { en: "60-minute Couple Herbal Massage at Lotus Spa", km: "ម៉ាស្សាឱសថបុរាណ ៦០ នាទីសម្រាប់ ២ នាក់នៅ Lotus Spa" },
      { en: "4-Course Candlelit Dinner at Mekong Breeze", km: "អាហារពេលល្ងាចក្រោមពន្លឺទៀន ៤ មុខនៅ Mekong Breeze" },
      { en: "Romantic flower petal bath decoration", km: "ការរៀបចំផ្កាកុលាបក្នុងអាងត្រាំទឹកយ៉ាងផ្អែមល្ហែម" },
    ],
    imageUrl:
      "/images/rooms/vv_real_room_1280_4.jpg",
  },
];

export const SpecialOffersSection: React.FC = () => {
  const { lang, t } = useLanguage();

  const handleClaimOffer = (offer: SpecialOffer) => {
    // Scroll to booking bar and update promo code if available
    const bookingBar = document.getElementById("booking-bar");
    if (bookingBar) {
      bookingBar.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="special-offers" className="w-full py-16 sm:py-24 bg-[#08182b] text-white">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-4xl w-full">
            <div className="inline-flex items-center space-x-2 bg-vvotel-gold/20 text-vvotel-gold border border-vvotel-gold/40 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-vvotel-gold" />
              <span>{lang === "km" ? "ការផ្តល់ជូនពិសេស & ប្រូម៉ូសិន" : "Exclusive Special Offers"}</span>
            </div>
            <h2 className="text-[clamp(1.15rem,2.6vw,2.2rem)] font-black text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {lang === "km"
                ? "កញ្ចប់ដំណើរកម្សាន្ត និងតម្លៃពិសេសសម្រាប់អ្នក"
                : "Curated Packages & Exceptional Savings"}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {lang === "km"
                ? "រីករាយជាមួយកញ្ចប់ស្នាក់នៅប្រណីតដែលមានរួមបញ្ចូលអាហារ ស្ប៉ា និងសកម្មភាពទេសចរណ៍ជាច្រើន ជាមួយនឹងតម្លៃពិសេសបំផុត។"
                : "Elevate your journey to Kampong Cham with our limited-time special packages tailored for romantic couples, family getaways, and weekend retreats."}
            </p>
          </div>

          <div className="text-xs text-vvotel-gold font-bold flex items-center space-x-1.5 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
            <Tag className="w-4 h-4" />
            <span>{lang === "km" ? "បញ្ចុះតម្លៃរហូតដល់ ៣០% ពេលកក់ផ្ទាល់" : "Up to 30% Off Direct Bookings"}</span>
          </div>
        </div>

        {/* 3 Offers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SPECIAL_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="bg-[#0f2d52] rounded-2xl overflow-hidden border border-white/10 hover:border-vvotel-gold/60 shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                  <img
                    src={offer.imageUrl}
                    alt={lang === "km" ? offer.title.km : offer.title.en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f2d52] via-transparent to-transparent" />

                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-[11px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                    {lang === "km" ? offer.discountBadge.km : offer.discountBadge.en}
                  </div>

                  {/* Promo Code Pill */}
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-vvotel-gold text-xs font-mono font-bold border border-vvotel-gold/30">
                    CODE: {offer.code}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-black text-white group-hover:text-vvotel-gold transition-colors">
                    {lang === "km" ? offer.title.km : offer.title.en}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {lang === "km" ? offer.description.km : offer.description.en}
                  </p>

                  {/* Inclusions */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-vvotel-gold block">
                      {lang === "km" ? "អត្ថប្រយោជន៍រួមបញ្ចូល:" : "Package Inclusions:"}
                    </span>
                    <div className="space-y-1.5 text-xs text-gray-200">
                      {offer.inclusions.map((inc, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-vvotel-gold shrink-0 mt-0.5" />
                          <span>{lang === "km" ? inc.km : inc.en}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleClaimOffer(offer)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-vvotel-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-vvotel-navy font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>{lang === "km" ? "កក់ជាមួយប្រូម៉ូសិននេះ" : "Book This Offer"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
