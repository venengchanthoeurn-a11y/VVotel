"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  Maximize2,
  Calendar,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Mail,
  X,
  Presentation,
  Award,
} from "lucide-react";

export interface EventSpace {
  id: string;
  name: { en: string; km: string };
  sizeSqm: number;
  capacityTheatre: number;
  capacityBanquet: number;
  capacityCocktail: number;
  description: { en: string; km: string };
  highlights: { en: string; km: string }[];
  imageUrl: string;
}

export const EVENT_SPACES: EventSpace[] = [
  {
    id: "grand-ballroom",
    name: {
      en: "Grand Mekong Ballroom",
      km: "សាលមហោស្រពមេគង្គ (Grand Mekong Ballroom)",
    },
    sizeSqm: 450,
    capacityTheatre: 500,
    capacityBanquet: 350,
    capacityCocktail: 600,
    description: {
      en: "Kampong Cham's largest pillarless luxury ballroom. Equipped with a motorized 4K LED video wall, acoustic soundproofing, crystal chandeliers, and dedicated pre-function foyer overlooking the Mekong.",
      km: "សាលមហោស្រពគ្មានសសរកណ្តាលធំជាងគេបង្អស់ក្នុងខេត្តកំពង់ចាម។ បំពាក់ដោយផ្ទាំង LED 4K ធំទូលាយ ប្រព័ន្ធការពារសំឡេង ភ្លើងចង្កៀងគ្រីស្តាល់ប្រណីត និងសាលទទួលភ្ញៀវបែរមុខទៅទន្លេមេគង្គ។",
    },
    highlights: [
      { en: "High 6.5m ceiling with motorized rigging", km: "ពិដានកម្ពស់ ៦.៥ ម៉ែត្រ មានរ៉កស្វ័យប្រវត្ត" },
      { en: "Built-in 4K LED Screen (8m x 4m)", km: "ផ្ទាំងអេក្រង់ LED 4K ភ្ជាប់ស្រាប់ (៨ម x ៤ម)" },
      { en: "VIP green room & private bridal suite", km: "បន្ទប់រៀបចំខ្លួន VIP និងបន្ទប់កូនក្រមុំ" },
    ],
    imageUrl:
      "/images/rooms/vv_deluxe_double.jpg",
  },
  {
    id: "kizuna-boardroom",
    name: {
      en: "Kizuna Executive Boardroom",
      km: "បន្ទប់ប្រជុំថ្នាក់ដឹកនាំគីហ្សូណា",
    },
    sizeSqm: 65,
    capacityTheatre: 30,
    capacityBanquet: 20,
    capacityCocktail: 35,
    description: {
      en: "Tailored for high-level summits, board meetings, and hybrid conferences. Outfitted with Cisco Webex / Zoom dual-camera auto-tracking systems and Herman Miller ergonomic leather chairs.",
      km: "រចនាឡើងយ៉ាងពិសេសសម្រាប់កិច្ចប្រជុំកំពូល ក្រុមប្រឹក្សាភិបាល និងសន្និសីទអនឡាញ។ បំពាក់ដោយប្រព័ន្ធកាមេរ៉ាស្វ័យប្រវត្តតាមដានសំឡេង Cisco Webex/Zoom និងកៅអីស្បែកប្រណីត។",
    },
    highlights: [
      { en: "Ultra HD Hybrid Video Conference System", km: "ប្រព័ន្ធសន្និសីទវីដេអូអនឡាញ Ultra HD" },
      { en: "Soundproof acoustic timber wall paneling", km: "ជញ្ជាំងឈើស្រូបសំឡេងកម្រិតខ្ពស់" },
      { en: "Dedicated Nespresso lounge & refreshment bar", km: "កន្លែងឆុងកាហ្វេ Nespresso និងភេសជ្ជៈផ្ទាល់ខ្លួន" },
    ],
    imageUrl:
      "/images/rooms/vv_room_interior_1.jpg",
  },
  {
    id: "riverside-lawn",
    name: {
      en: "Mekong Riverside Lawn & Terrace",
      km: "ទីធ្លារាបស្មៅមាត់ទន្លេមេគង្គ",
    },
    sizeSqm: 650,
    capacityTheatre: 400,
    capacityBanquet: 300,
    capacityCocktail: 550,
    description: {
      en: "A magnificent open-air venue bathed in river breezes. The premier backdrop in eastern Cambodia for glamorous sunset weddings, corporate cocktail receptions, and festive gala dinners under swaying palms.",
      km: "ទីតាំងក្រៅអាគារដ៏ស្រស់ត្រកាលដែលទទួលបានខ្យល់ទន្លេមេគង្គដ៏ត្រជាក់។ ជាទីតាំងលេខ១ សម្រាប់ពិធីមង្គលការពេលថ្ងៃលិច ពិធីជប់លៀងក្រុមហ៊ុន និងពិធីជួបជុំធំៗក្រោមម្លប់ដើមត្នោត។",
    },
    highlights: [
      { en: "Direct Mekong River sunset panorama", km: "ទេសភាពថ្ងៃលិចលើទន្លេមេគង្គចំៗ" },
      { en: "Outdoor BBQ live grilling & bar setup", km: "កន្លែងអាំងសាច់ BBQ ផ្ទាល់ និងបារចល័ត" },
      { en: "Illuminated fairy light canopy overhead", km: "ខ្សែភ្លើងរចនាលើមេឃយ៉ាងស្រស់ស្អាតពេលរាត្រី" },
    ],
    imageUrl:
      "/images/rooms/vv_hallway.jpg",
  },
];

export const MeetingEventsSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const [rfpOpen, setRfpOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string>("Grand Mekong Ballroom");
  const [eventType, setEventType] = useState("Corporate Conference");
  const [attendees, setAttendees] = useState(100);
  const [eventDate, setEventDate] = useState("2026-12-15");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [rfpSuccess, setRfpSuccess] = useState(false);

  const handleSubmitRFP = (e: React.FormEvent) => {
    e.preventDefault();
    setRfpSuccess(true);
    setTimeout(() => {
      setRfpSuccess(false);
      setRfpOpen(false);
    }, 3500);
  };

  return (
    <section id="meeting-events" className="w-full py-16 sm:py-24 bg-[#f8f7f4] border-b border-gray-200/60">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="space-y-3 max-w-4xl w-full">
            <div className="inline-flex items-center space-x-2 bg-vvotel-navy text-vvotel-gold px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Presentation className="w-4 h-4 text-vvotel-gold" />
              <span>{lang === "km" ? "កន្លែងរៀបចំកិច្ចប្រជុំ & ព្រឹត្តិការណ៍" : "Meetings & Celebrations"}</span>
            </div>
            <h2 className="text-[clamp(1.15rem,2.6vw,2.2rem)] font-black text-vvotel-navy tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {lang === "km"
                ? "ទីកន្លែងដ៏ល្អឥតខ្ចោះសម្រាប់សន្និសីទ និងអាពាហ៍ពិពាហ៍"
                : "Inspiring Spaces for Gatherings of Grandeur"}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {lang === "km"
                ? "ពីសាលប្រជុំថ្នាក់ដឹកនាំរហូតដល់សាលមហោស្រពធំទូលាយ និងទីធ្លាមាត់ទន្លេ VVotel Kampong Cham ត្រៀមខ្លួនជាស្រេចដើម្បីធ្វើឱ្យព្រឹត្តិការណ៍របស់អ្នកទទួលបានជោគជ័យ។"
                : "From executive boardroom summits to fairy-tale weddings, our versatile venues combine advanced technology, bespoke catering, and dedicated event specialists."}
            </p>
          </div>

          <button
            onClick={() => setRfpOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-vvotel-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-vvotel-navy font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>{lang === "km" ? "ស្នើសុំសម្រង់តម្លៃ (RFP)" : "Request Event Proposal"}</span>
          </button>
        </div>

        {/* 3 Spaces Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {EVENT_SPACES.map((space) => (
            <div
              key={space.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <img
                    src={space.imageUrl}
                    alt={lang === "km" ? space.name.km : space.name.en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-vvotel-navy/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
                    {space.sizeSqm} m²
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-black text-vvotel-navy">
                    {lang === "km" ? space.name.km : space.name.en}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {lang === "km" ? space.description.km : space.description.en}
                  </p>

                  {/* Capacities Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">
                        {lang === "km" ? "រោងកុន" : "Theatre"}
                      </span>
                      <span className="text-sm font-extrabold text-vvotel-navy">
                        {space.capacityTheatre}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">
                        {lang === "km" ? "តុមូល" : "Banquet"}
                      </span>
                      <span className="text-sm font-extrabold text-vvotel-navy">
                        {space.capacityBanquet}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">
                        {lang === "km" ? "ស្រាក្រឡុក" : "Cocktail"}
                      </span>
                      <span className="text-sm font-extrabold text-vvotel-navy">
                        {space.capacityCocktail}
                      </span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                    {space.highlights.map((h, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-vvotel-gold shrink-0 mt-0.5" />
                        <span>{lang === "km" ? h.km : h.en}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setSelectedSpace(space.name.en);
                    setRfpOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-vvotel-navy hover:bg-vvotel-navy hover:text-white text-vvotel-navy font-bold text-xs transition text-center"
                >
                  {lang === "km" ? "ស្នើសុំកក់ទីតាំងនេះ" : "Inquire About This Space"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proposal Request Modal */}
      {rfpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs text-amber-700 font-bold uppercase">
                  {lang === "km" ? "ស្នើសុំសម្រង់តម្លៃព្រឹត្តិការណ៍" : "Event Inquiries & RFP"}
                </span>
                <h3 className="text-2xl font-black text-vvotel-navy">
                  {lang === "km" ? "រៀបចំកិច្ចប្រជុំ ឬពិធីមង្គលការ" : "Plan Your Event at VVotel"}
                </h3>
              </div>
              <button
                onClick={() => setRfpOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {rfpSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-xl font-black">
                  {lang === "km" ? "សំណើរបស់អ្នកត្រូវបានបញ្ជូនជោគជ័យ!" : "Event Proposal Request Received!"}
                </h4>
                <p className="text-xs">
                  {lang === "km"
                    ? "ក្រុមការងាររៀបចំព្រឹត្តិការណ៍របស់យើងខ្ញុំនឹងទាក់ទងមកលោកអ្នកជាមួយសម្រង់តម្លៃលម្អិតក្នុងរយៈពេល ២៤ ម៉ោង។"
                    : "Our professional event specialists will contact you within 24 hours with a tailored itinerary and quotation."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRFP} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "ទីកន្លែងដែលពេញចិត្ត" : "Preferred Venue"}
                    </label>
                    <select
                      value={selectedSpace}
                      onChange={(e) => setSelectedSpace(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                    >
                      <option value="Grand Mekong Ballroom">Grand Mekong Ballroom (450 m²)</option>
                      <option value="Kizuna Executive Boardroom">Kizuna Executive Boardroom (65 m²)</option>
                      <option value="Mekong Riverside Lawn & Terrace">Mekong Riverside Lawn (650 m²)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "ប្រភេទព្រឹត្តិការណ៍" : "Event Type"}
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                    >
                      <option value="Corporate Conference">Corporate Conference / Seminar</option>
                      <option value="Wedding Banquet">Wedding Ceremony & Banquet</option>
                      <option value="Gala Dinner">Gala Dinner / Product Launch</option>
                      <option value="Private Celebration">Private Birthday / Anniversary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "កាលបរិច្ឆេទព្រឹត្តិការណ៍" : "Estimated Date"}
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "ចំនួនភ្ញៀវប៉ាន់ស្មាន" : "Estimated Attendees"}
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={600}
                      value={attendees}
                      onChange={(e) => setAttendees(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {lang === "km" ? "ឈ្មោះអ្នកទំនាក់ទំនង" : "Contact Person Full Name"}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={lang === "km" ? "ឧ. ហេង វណ្ណា" : "e.g. Sok Sovan"}
                      className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        {lang === "km" ? "អ៊ីមែល" : "Email Address"}
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="events@company.com"
                        className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        {lang === "km" ? "លេខទូរស័ព្ទ" : "Phone Number"}
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+855 12 345 678"
                        className="w-full px-3 py-2 border rounded-xl text-gray-800 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setRfpOpen(false)}
                    className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100"
                  >
                    {lang === "km" ? "បោះបង់" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-vvotel-navy hover:bg-[#14325c] text-white font-black rounded-xl shadow"
                  >
                    {lang === "km" ? "ផ្ញើសំណើសម្រង់តម្លៃ" : "Submit Proposal Request"}
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
