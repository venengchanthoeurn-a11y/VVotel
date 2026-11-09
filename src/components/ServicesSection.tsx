"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Waves,
  Sparkles,
  Dumbbell,
  Smile,
  Bike,
  Compass,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

export interface ResortService {
  id: string;
  name: { en: string; km: string };
  category: { en: string; km: string };
  hours: { en: string; km: string };
  tagline: { en: string; km: string };
  description: { en: string; km: string };
  features: { en: string; km: string }[];
  imageUrl: string;
  icon: string;
}

export const RESORT_SERVICES: ResortService[] = [
  {
    id: "infinity-pool",
    name: {
      en: "Mekong Infinity Pool & Sun Deck",
      km: "អាងហែលទឹកអណ្តែតមាត់ទន្លេមេគង្គ",
    },
    category: { en: "Aquatic Relaxation", km: "ការលំហែកាយលើផ្ទៃទឹក" },
    hours: { en: "06:00 - 21:00 Daily", km: "០៦:០០ - ២១:០០ ជារៀងរាល់ថ្ងៃ" },
    tagline: {
      en: "Swim right along the edge of the mighty Mekong with chilled towel and coconut service",
      km: "ហែលទឹកគយគន់ទន្លេមេគង្គដ៏ធំល្វឹងល្វើយ ជាមួយសេវាកន្សែងត្រជាក់ និងដូងក្រអូប",
    },
    description: {
      en: "Our 35-meter temperature-controlled infinity pool merges seamlessly with the horizon of the Mekong. Unwind on submerged loungers, soak in the shallow kids splash pool, and sip tropical refreshments from the poolside bar.",
      km: "អាងហែលទឹកខ្នាត ៣៥ ម៉ែត្ររចនាយ៉ាងពិសេសជាប់នឹងជើងមេឃនៃទន្លេមេគង្គ។ មានរានគេងត្រាំទឹក អាងទឹកសុវត្ថិភាពសម្រាប់កុមារ និងបារបម្រើភេសជ្ជៈស្រស់ស្រាយ។",
    },
    features: [
      { en: "35m Mekong riverfront infinity edge", km: "អាងហែលទឹក ៣៥ ម៉ែត្រជាប់មាត់ទន្លេ" },
      { en: "Separate dedicated kids wading pool", km: "អាងទឹកដាច់ដោយឡែកសម្រាប់កុមារ" },
      { en: "Complimentary sun loungers & towel service", km: "កៅអីគេងថ្ងៃ & កន្សែងងូតទឹកឥតគិតថ្លៃ" },
    ],
    imageUrl:
      "/images/rooms/vv_real_room_1280_4.jpg",
    icon: "waves",
  },
  {
    id: "lotus-spa",
    name: {
      en: "VVotel Lotus Spa & Wellness",
      km: "វីវ៉ូថែល ឈូកស្ប៉ា & ព្យាបាលបុរាណ",
    },
    category: { en: "Holistic Wellbeing", km: "សុខុមាលភាពរាងកាយ និងចិត្ត" },
    hours: { en: "09:00 - 22:00 Daily", km: "០៩:០០ - ២២:០០ ជារៀងរាល់ថ្ងៃ" },
    tagline: {
      en: "Ancient Khmer herbal therapies and restorative essential oils",
      km: "ការព្យាបាលដោយឱសថបុរាណខ្មែរ និងប្រេងធម្មជាតិជួយសម្រួលសរសៃ",
    },
    description: {
      en: "Drawing upon time-honored Cambodian healing traditions, Lotus Spa offers 6 private treatment sanctuaries, herbal steam chambers, foot reflexology lounges, and organic body scrubs using Kampong Cham salt and wild honey.",
      km: "ផ្អែកលើក្បួនព្យាបាលបុរាណខ្មែរ ឈូកស្ប៉ា មានបន្ទប់ព្យាបាលឯកជនចំនួន ៦ បន្ទប់ស្ទីមឱសថបុរាណ កន្លែងម៉ាស្សាជើង និងស្ក្រាប់ខាត់ស្បែកផ្សំពីអំបិលធម្មជាតិ និងទឹកឃ្មុំព្រៃ។",
    },
    features: [
      { en: "6 Private single & couple treatment suites", km: "បន្ទប់ព្យាបាលទោល & គូស្នេហ៍ឯកជន ៦ បន្ទប់" },
      { en: "Traditional Khmer herbal steam & sauna", km: "បន្ទប់ស្ទីមឱសថខ្មែរ & សោណា" },
      { en: "Signature Mekong Warm Bamboo Massage", km: "ម៉ាស្សាប្ញស្សីក្តៅមេគង្គពិសេស" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
    icon: "sparkles",
  },
  {
    id: "fitness-center",
    name: {
      en: "24/7 Riverside Fitness Studio",
      km: "បន្ទប់ហាត់ប្រាណទំនើប ២៤/៧",
    },
    category: { en: "Active Health", km: "សុខភាព និងកាយសម្បទា" },
    hours: { en: "24 Hours Daily (Keycard Access)", km: "២៤ ម៉ោងពេញ (ប្រើកាតបន្ទប់)" },
    tagline: {
      en: "State-of-the-art Technogym equipment with floor-to-ceiling river views",
      km: "ឧបករណ៍ហាត់ប្រាណ Technogym ទំនើបចុងក្រោយ មើលឃើញទន្លេមេគង្គ",
    },
    description: {
      en: "Maintain your workout routine with our top-tier cardio machines, free weight zone, yoga studio mats, and panoramic windows facing the morning sunrise over the Mekong River. Personal trainers available on appointment.",
      km: "រក្សាភាពរឹងមាំនៃរាងកាយជាមួយម៉ាស៊ីនរត់ ឧបករណ៍លើកទម្ងន់ កម្រាលយោគៈ និងបង្អួចកញ្ចក់ធំទូលាយគយគន់ថ្ងៃរះលើទន្លេមេគង្គ។ មានគ្រូបង្វឹកផ្ទាល់ខ្លួនតាមការណាត់ជួប។",
    },
    features: [
      { en: "Latest Technogym cardio & strength machines", km: "ម៉ាស៊ីន Technogym ជំនាន់ចុងក្រោយបង្អស់" },
      { en: "Dedicated yoga and stretching area", km: "កន្លែងហាត់យោគៈ និងពត់ខ្លួនដាច់ដោយឡែក" },
      { en: "Filtered chilled water & fresh fruit station", km: "ទឹកបរិសុទ្ធត្រជាក់ និងផ្លែឈើស្រស់ឥតគិតថ្លៃ" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    icon: "dumbbell",
  },
  {
    id: "kids-club",
    name: {
      en: "The Mekong Explorers Kids Club",
      km: "ក្លឹបកុមារអ្នករុករកទន្លេមេគង្គ",
    },
    category: { en: "Family Fun", km: "ភាពសប្បាយរីករាយសម្រាប់កុមារ" },
    hours: { en: "08:00 - 18:00 Daily", km: "០៨:០០ - ១៨:០០ ជារៀងរាល់ថ្ងៃ" },
    tagline: {
      en: "Supervised cultural games, Khmer craft workshops, and splash pad adventures",
      km: "ល្បែងកម្សាន្តបែបវប្បធម៌ សិក្ខាសាលាសិល្បៈខ្មែរ និងទីលានលេងទឹក",
    },
    description: {
      en: "A vibrant wonderland designed for our young VIPs aged 3-12. Dedicated child-care animators lead daily workshops in Khmer shadow puppet making, kite flying, eco-gardening, and outdoor games.",
      km: "ពិភពកម្សាន្តដ៏សម្បូរបែបសម្រាប់កុមារអាយុ ៣ ដល់ ១២ ឆ្នាំ។ មានបុគ្គលិកជំនាញរៀបចំកម្មវិធីធ្វើល្ខោនស្បែក បង្ហើរខ្លែង ដាំបន្លែសរីរាង្គ និងល្បែងប្រជាប្រិយខ្មែរ។",
    },
    features: [
      { en: "Supervised arts, crafts & shadow puppets", km: "ការបង្រៀនគំនូរ សិល្បៈ និងល្ខោនស្បែក" },
      { en: "Safe outdoor playground & splash zone", km: "កន្លែងលេងក្រៅផ្ទះប្រកបដោយសុវត្ថិភាព" },
      { en: "PlayStation 5 & family board games library", km: "ហ្គេម PlayStation 5 និងក្តារហ្គេមគ្រួសារ" },
    ],
    imageUrl:
      "/images/rooms/vv_family_space.jpg",
    icon: "smile",
  },
  {
    id: "bicycle-rentals",
    name: {
      en: "Complimentary Bicycles & E-Scooters",
      km: "សេវាជួលកង់ & ម៉ូតូអគ្គិសនីឥតគិតថ្លៃ",
    },
    category: { en: "Eco Mobility", km: "ការធ្វើដំណើរអេកូទេសចរណ៍" },
    hours: { en: "Available from Sunrise to Sunset", km: "មានផ្តល់ជូនពីថ្ងៃរះដល់ថ្ងៃលិច" },
    tagline: {
      en: "Pedal across the bamboo bridge and explore peaceful Koh Pen orchard trails",
      km: "ជិះកង់ឆ្លងកាត់ស្ពានឫស្សី និងទស្សនាចម្ការផ្លែឈើលើកោះប៉ែន",
    },
    description: {
      en: "We provide hotel guests with complimentary cruiser bicycles, mountain bikes, and kids' bikes complete with helmets, locks, and curated GPS trail maps to discover the rural beauty of Kampong Cham at your own pace.",
      km: "យើងខ្ញុំផ្តល់ជូនកង់ភ្នំ កង់ទីក្រុង និងកង់កុមារ រួមជាមួយមួកសុវត្ថិភាព សោ និងផែនទី GPS ដើម្បីឱ្យភ្ញៀវអាចជិះកម្សាន្តក្នុងក្រុង និងកោះប៉ែនតាមចិត្តចង់។",
    },
    features: [
      { en: "Trek mountain bikes & classic Dutch cruisers", km: "កង់ភ្នំ Trek និងកង់ជិះលំហែបុរាណ" },
      { en: "Kids bicycles & infant safety seats", km: "កង់កុមារ និងកៅអីសុវត្ថិភាពទារក" },
      { en: "Custom Koh Pen island self-guided route map", km: "ផែនទីណែនាំផ្លូវជិះកង់លើកោះប៉ែន" },
    ],
    imageUrl:
      "/images/destinations/koh-pen-cycling.jpg",
    icon: "bike",
  },
  {
    id: "boat-charters",
    name: {
      en: "Private Mekong River Boat Charters",
      km: "សេវាទូកទេសចរណ៍ឯកជនលើទន្លេមេគង្គ",
    },
    category: { en: "River Exploration", km: "ការរុករកតាមដងទន្លេ" },
    hours: { en: "Reservations required 2 hours in advance", km: "តម្រូវឱ្យកក់មុន ២ ម៉ោង" },
    tagline: {
      en: "Private longtail boat excursions for sunset champagne or island picnics",
      km: "ដំណើរកម្សាន្តតាមទូកឯកជន គយគន់ថ្ងៃលិចជាមួយសំប៉ាញ ឬពិកនិកលើកោះ",
    },
    description: {
      en: "Board our private hotel vessel directly from the VVotel jetty. Enjoy bespoke river journeys to Phnom Hanchey mountain temple, rural sandbar sandbanks, or a romantic twilight champagne cruise.",
      km: "ឡើងជិះទូកឯកជនរបស់សណ្ឋាគារចេញពីផែ VVotel ផ្ទាល់។ រីករាយជាមួយដំណើរកម្សាន្តទៅកាន់ភ្នំហាន់ជ័យ ឆ្នេរខ្សាច់កោះកណ្តាលទន្លេ ឬការជិះទូកគយគន់ថ្ងៃលិចដ៏រ៉ូមែនទិក។",
    },
    features: [
      { en: "Private boarding from VVotel river jetty", km: "ឡើងទូកពីផែផ្ទាល់ខ្លួនរបស់ VVotel" },
      { en: "Catered sunset canapés & beverage service", km: "អាហារសម្រន់ពេលថ្ងៃលិច & ភេសជ្ជៈលើទូក" },
      { en: "Life jackets & full safety certification", km: "អាវពោងសុវត្ថិភាព & ប័ណ្ណបើកបរស្របច្បាប់" },
    ],
    imageUrl:
      "/images/destinations/sunset-cruise.jpg",
    icon: "compass",
  },
];

export const ServicesSection: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <section id="services" className="w-full py-16 sm:py-24 bg-white border-b border-gray-200/60">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="space-y-3 max-w-4xl w-full">
            <div className="inline-flex items-center space-x-2 bg-sky-50 text-sky-800 border border-sky-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>{lang === "km" ? "សេវាកម្ម & បរិក្ខារប្រណីត" : "Hotel Services & Experiences"}</span>
            </div>
            <h2 className="text-[clamp(1.15rem,2.6vw,2.2rem)] font-black text-vvotel-navy tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {lang === "km"
                ? "បំពេញគ្រប់តម្រូវការនៃការស្នាក់នៅដ៏ល្អឥតខ្ចោះ"
                : "Every Comfort, Thoughtfully Crafted for You"}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {lang === "km"
                ? "រីករាយជាមួយអាងហែលទឹកអណ្តែតមាត់ទន្លេ ឈូកស្ប៉ា ក្លឹបកុមារ កង់ជិះលំហែកាយ និងទូកទេសចរណ៍ឯកជនដែលរៀបចំឡើងយ៉ាងផ្ចិតផ្ចង់។"
                : "Immerse yourself in world-class amenities designed for wellness, family connection, and adventure along the timeless waters of the Mekong."}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
            <ShieldCheck className="w-4 h-4 text-vvotel-gold" />
            <span>{lang === "km" ? "បម្រើសេវាកម្មកម្រិតផ្កាយ ៥" : "5-Star Hospitality Standards"}</span>
          </div>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {RESORT_SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="bg-[#fbfaf8] rounded-2xl overflow-hidden border border-gray-200/80 hover:border-vvotel-gold/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <img
                    src={srv.imageUrl}
                    alt={lang === "km" ? srv.name.km : srv.name.en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-vvotel-navy/90 backdrop-blur-md text-vvotel-gold text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-vvotel-gold/30">
                    {lang === "km" ? srv.category.km : srv.category.en}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-vvotel-navy">
                      {lang === "km" ? srv.name.km : srv.name.en}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-amber-700 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lang === "km" ? srv.hours.km : srv.hours.en}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {lang === "km" ? srv.description.km : srv.description.en}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs text-gray-700">
                    {srv.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-vvotel-gold shrink-0 mt-0.5" />
                        <span>{lang === "km" ? feat.km : feat.en}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <a
                  href="tel:+85542982999"
                  className="block w-full py-2.5 rounded-xl border border-gray-300 hover:border-vvotel-navy text-vvotel-navy font-bold text-xs transition text-center hover:bg-gray-100"
                >
                  {lang === "km" ? "សាកសួរព័ត៌មានបន្ថែម" : "Inquire at Concierge"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
