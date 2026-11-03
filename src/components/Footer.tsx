"use client";

import React from "react";
import { HOTEL_INFO } from "@/data/destinations";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Phone, Mail, FileText, Shield, Cookie, HelpCircle, Share2 } from "lucide-react";

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#08182b] text-gray-400 text-xs border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Property Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-vvotel-gold flex items-center justify-center text-vvotel-navy font-black text-xl shadow">
                V
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block">
                  VVOTEL
                </span>
                <span className="text-[10px] tracking-wider uppercase text-vvotel-gold -mt-1 block">
                  {lang === "km" ? "សណ្ឋាគារ វឌ្ឍនៈ (VVOTEL) កំពង់ចាម" : "VATTANAC HOTEL (VVOTEL) • KAMPONG CHAM"}
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed max-w-md">
              {lang === "km"
                ? "សណ្ឋាគារប្រណីតលំដាប់ខ្ពស់ជាប់មាត់ទន្លេមេគង្គក្នុងក្រុងកំពង់ចាម ផ្តល់ជូននូវបន្ទប់ស្នាក់នៅដ៏មានផាសុកភាព ម្ហូបអាហារឆ្ងាញ់ពិសា និងមគ្គុទ្ទេសក៍ទេសចរណ៍រុករកវប្បធម៌ខ្មែរដ៏សម្បូរបែប។"
                : "A luxurious riverfront hotel along the legendary Mekong in Kampong Cham. Enjoy world-class hospitality, panoramic river views, authentic gastronomy, and enriching cultural discovery tours."}
            </p>

            <div className="space-y-2 pt-2 text-gray-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-vvotel-gold shrink-0 mt-0.5" />
                <span>{lang === "km" ? HOTEL_INFO.address.km : HOTEL_INFO.address.en}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-vvotel-gold shrink-0" />
                <a href={`tel:${HOTEL_INFO.phone}`} className="hover:text-white transition">
                  {HOTEL_INFO.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-vvotel-gold shrink-0" />
                <a href={`mailto:${HOTEL_INFO.email}`} className="hover:text-white transition">
                  {HOTEL_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Useful Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              {lang === "km" ? "ព័ត៌មានភ្ញៀវ" : "Guest Information"}
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#factsheet"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(lang === "km" ? "ឯកសារ Factsheet & Brochure របស់ VVotel កំពង់ចាម កំពុងទាញយក..." : "Downloading VVotel Kampong Cham Factsheet & Brochure PDF...");
                  }}
                  className="hover:text-vvotel-gold transition flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lang === "km" ? "ខិត្តប័ណ្ណសណ្ឋាគារ & Factsheet" : "Hotel Brochures & Factsheet"}</span>
                </a>
              </li>
              <li>
                <a href="#destination-guide" className="hover:text-vvotel-gold transition">
                  {t("destinationGuide")}
                </a>
              </li>
              <li>
                <a href="#rooms" className="hover:text-vvotel-gold transition">
                  {t("accommodation")}
                </a>
              </li>
              <li>
                <a href="#dining" className="hover:text-vvotel-gold transition">
                  {t("dining")}
                </a>
              </li>
              <li>
                <a href="#loyalty" className="hover:text-vvotel-gold transition">
                  {lang === "km" ? "កម្មវិធីសមាជិក ALL" : "ALL Loyalty Program"}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Corporate */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              {lang === "km" ? "លក្ខខណ្ឌ & គោលនយោបាយ" : "Legal & Policies"}
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#legal" className="hover:text-vvotel-gold transition flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{lang === "km" ? "សេចក្តីជូនដំណឹងផ្លូវច្បាប់" : "Legal Notice"}</span>
                </a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-vvotel-gold transition flex items-center space-x-1.5">
                  <Cookie className="w-3.5 h-3.5" />
                  <span>{lang === "km" ? "គោលការណ៍ខូឃី (Cookie Policy)" : "Cookie Policy"}</span>
                </a>
              </li>
              <li>
                <a href="#sitemap" className="hover:text-vvotel-gold transition">
                  {lang === "km" ? "ប្លង់គេហទំព័រ (Sitemap)" : "Sitemap"}
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-vvotel-gold transition">
                  {lang === "km" ? "ឱកាសការងារ (Careers)" : "Careers"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
          <div>
            © {new Date().getFullYear()} VVotel Kampong Cham Riverside Hotel. All Rights Reserved. Managed in accordance with Accor Brand Standards.
          </div>
          <div className="flex items-center space-x-4">
            <span>Powered by Next.js & Redis Cache & CDN</span>
            <span>•</span>
            <span className="text-vvotel-gold font-bold">100% Kampong Cham Local Destinations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
