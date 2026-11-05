"use client";

import React, { useEffect, useRef, useState } from "react";
import { Destination, HOTEL_INFO } from "@/data/destinations";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Layers,
  Maximize2,
  Minimize2,
  LocateFixed,
  Sparkles,
} from "lucide-react";

interface InteractiveMapProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  selectedCategory: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations,
  onSelectDestination,
  selectedCategory,
}) => {
  const { lang, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const currentTileLayerRef = useRef<any>(null);

  const [mapType, setMapType] = useState<"google-road" | "google-satellite" | "google-live">("google-road");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      // Create map centered on Kampong Cham
      const map = L.map(mapContainerRef.current, {
        center: [HOTEL_INFO.latitude, HOTEL_INFO.longitude],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      // Add Google Maps Roadmap tile layer by default
      const googleRoadTiles = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> | VVotel Kampong Cham',
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      );

      googleRoadTiles.addTo(map);
      currentTileLayerRef.current = googleRoadTiles;

      // Add Hotel Marker (Gold luxury star pin)
      const hotelIcon = L.divIcon({
        className: "custom-hotel-pin",
        html: `
          <div style="background-color: #0c2340; border: 3px solid #c5a059; width: 44px; height: 44px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(0,0,0,0.5);">
            <div style="transform: rotate(45deg); color: #c5a059; font-weight: 900; font-size: 18px;">V</div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -44],
      });

      const hotelSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Vattanac Hotel (VVotel), No. 2052 Preah Monivong St, Kampong Cham, Cambodia")}`;

      const hotelPopup = `
        <div style="width: 270px; font-family: sans-serif; padding: 12px;">
          <div style="font-size: 10px; font-weight: bold; color: #c5a059; text-transform: uppercase;">
            ${lang === "km" ? "ទីតាំងសណ្ឋាគារផ្លូវការ (Official Location)" : "Official Hotel Location"}
          </div>
          <div style="font-size: 14px; font-weight: bold; color: #0c2340; margin-top: 2px;">
            ${lang === "km" ? HOTEL_INFO.name.km : HOTEL_INFO.name.en}
          </div>
          <div style="font-size: 11px; color: #555; margin-top: 4px; line-height: 1.4;">
            ${lang === "km" ? HOTEL_INFO.address.km : HOTEL_INFO.address.en}
          </div>
          <div style="margin-top: 8px; font-size: 11px; font-weight: bold; color: #0c2340;">
            📞 ${HOTEL_INFO.phone}
          </div>
          <div style="margin-top: 10px;">
            <a href="${hotelSearchUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #0c2340; color: #c5a059; padding: 7px 0; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;">
              ${lang === "km" ? "បើកទីតាំងក្នុង Google Maps ➔" : "Open in Google Maps ➔"}
            </a>
          </div>
        </div>
      `;

      L.marker([HOTEL_INFO.latitude, HOTEL_INFO.longitude], { icon: hotelIcon })
        .addTo(map)
        .bindPopup(hotelPopup);

      mapInstanceRef.current = map;

      // Invalidate size multiple times to prevent any grey tiles
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 500);
      setTimeout(() => map.invalidateSize(), 1200);
    };

    if (mapType !== "google-live") {
      initMap();
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapType]);

  // Handle Tile Switcher (Google Roadmap vs Google Satellite Hybrid vs Google Live Embed)
  const switchMapType = async (type: "google-road" | "google-satellite" | "google-live") => {
    setMapType(type);
    if (type === "google-live") {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Re-init leaflet if coming from live embed
    if (!mapInstanceRef.current && mapContainerRef.current) {
      const L = (await import("leaflet")).default;
      const map = L.map(mapContainerRef.current, {
        center: [HOTEL_INFO.latitude, HOTEL_INFO.longitude],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      const tileUrl =
        type === "google-satellite"
          ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

      const newLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> | VVotel Kampong Cham',
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      });
      newLayer.addTo(map);
      currentTileLayerRef.current = newLayer;
      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
      return;
    }

    if (!mapInstanceRef.current) return;
    const L = (await import("leaflet")).default;
    const map = mapInstanceRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const tileUrl =
      type === "google-satellite"
        ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

    const newLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> | VVotel Kampong Cham',
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    });

    newLayer.addTo(map);
    currentTileLayerRef.current = newLayer;
  };

  // Recenter on VVotel Hotel
  const recenterMap = () => {
    setActiveDestination(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([HOTEL_INFO.latitude, HOTEL_INFO.longitude], 13, {
        duration: 1.2,
      });
    }
  };

  // Render Category Pins
  useEffect(() => {
    if (!mapInstanceRef.current || mapType === "google-live") return;

    const renderPins = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      // Clear existing pins
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const categoryColors: Record<string, string> = {
        "beaches-nature": "#0284c7",
        "sports-activities": "#16a34a",
        "culture-local-life": "#e11d48",
        restaurants: "#d97706",
      };

      const categoryIcons: Record<string, string> = {
        "beaches-nature": "🏝️",
        "sports-activities": "🚴",
        "culture-local-life": "🏛️",
        restaurants: "🍽️",
      };

      destinations.forEach((dest) => {
        const pinColor = categoryColors[dest.category] || "#4f46e5";
        const pinEmoji = categoryIcons[dest.category] || "📍";

        const icon = L.divIcon({
          className: "custom-dest-pin",
          html: `
            <div style="background-color: ${pinColor}; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); cursor: pointer;">
              <div style="transform: rotate(45deg); font-size: 13px;">${pinEmoji}</div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -34],
        });

        // Exact official Google Maps place search and navigation links
        const googlePlaceSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dest.title.en}, Kampong Cham, Cambodia`)}`;
        const directionUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("Vattanac Hotel (VVotel), No. 2052 Preah Monivong St, Kampong Cham, Cambodia")}&destination=${encodeURIComponent(`${dest.title.en}, Kampong Cham, Cambodia`)}`;

        const popupContent = `
          <div style="width: 270px; font-family: sans-serif; overflow: hidden; border-radius: 8px;">
            <div style="position: relative; height: 110px; width: 100%; overflow: hidden;">
              <img src="${dest.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${dest.title.en}" />
              <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(12, 35, 64, 0.9); color: #fff; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: bold;">
                ${lang === "km" ? dest.distanceFromHotel.km : dest.distanceFromHotel.en}
              </div>
            </div>
            <div style="padding: 12px;">
              <div style="font-size: 10px; font-weight: bold; color: ${pinColor}; text-transform: uppercase;">
                ${lang === "km" ? dest.categoryName.km : dest.categoryName.en}
              </div>
              <div style="font-size: 13px; font-weight: bold; color: #0c2340; margin-top: 2px;">
                ${lang === "km" ? dest.title.km : dest.title.en}
              </div>
              <div style="font-size: 11px; color: #555; margin-top: 4px; line-height: 1.35;">
                ${lang === "km" ? dest.summary.km : dest.summary.en}
              </div>
              <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 5px;">
                <a href="${googlePlaceSearchUrl}" target="_blank" rel="noopener noreferrer" style="text-align: center; background: #0c2340; color: #c5a059; padding: 6px 0; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;">
                  📍 ${lang === "km" ? "មើលទីតាំងលើ Google Maps App" : "View on Google Maps"}
                </a>
                <a href="${directionUrl}" target="_blank" rel="noopener noreferrer" style="text-align: center; background: #c5a059; color: #0c2340; padding: 6px 0; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;">
                  🚗 ${lang === "km" ? "នាំផ្លូវពីសណ្ឋាគារ VVotel" : "Directions from VVotel"}
                </a>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([dest.latitude, dest.longitude], { icon })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on("click", () => {
          setActiveDestination(dest);
          onSelectDestination(dest);
        });

        markersRef.current.push(marker);
      });
    };

    renderPins();
  }, [destinations, lang, mapType, onSelectDestination]);

  return (
    <div
      id="map-section"
      className={`bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 flex flex-col" : "w-full"
      }`}
    >
      {/* Map Control Bar */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-[#0c2340] text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-vvotel-gold text-vvotel-navy flex items-center justify-center font-bold shadow">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-white">
                {lang === "km" ? "Google Maps ផែនទីអន្តរកម្មខេត្តកំពង់ចាម" : "Interactive Google Maps — Kampong Cham"}
              </h3>
              <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Live Google Data</span>
              </span>
            </div>
            <p className="text-xs text-gray-300">
              {lang === "km"
                ? "ទិន្នន័យទីតាំងពិតប្រាកដក្នុងខេត្តកំពង់ចាម ភ្ជាប់ទៅកាន់ Google Maps និងការនាំផ្លូវផ្ទាល់"
                : "Real verified coordinates & places in Kampong Cham with official Google Maps data"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Layer Switcher with Google Live Embed option */}
          <div className="bg-white/10 rounded-xl p-1 flex items-center space-x-1 border border-white/15 text-xs font-semibold">
            <button
              onClick={() => switchMapType("google-road")}
              className={`px-2.5 py-1 rounded-lg transition ${
                mapType === "google-road"
                  ? "bg-vvotel-gold text-vvotel-navy font-bold shadow"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => switchMapType("google-satellite")}
              className={`px-2.5 py-1 rounded-lg transition ${
                mapType === "google-satellite"
                  ? "bg-vvotel-gold text-vvotel-navy font-bold shadow"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => switchMapType("google-live")}
              className={`px-2.5 py-1 rounded-lg transition ${
                mapType === "google-live"
                  ? "bg-red-600 text-white font-bold shadow"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Google Live View
            </button>
          </div>

          {/* Recenter */}
          <button
            onClick={recenterMap}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-vvotel-gold transition border border-white/15"
            title="Recenter on VVotel Hotel"
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setTimeout(() => {
                if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
              }, 200);
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition border border-white/15"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Content: Leaflet or Official Google Maps Live Embed */}
      {mapType === "google-live" ? (
        <div className={`w-full bg-slate-100 relative ${isFullscreen ? "flex-1" : "h-[450px] sm:h-[550px] lg:h-[620px]"}`}>
          <iframe
            title="Google Maps Live Embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              activeDestination
                ? `${activeDestination.title.en}, Kampong Cham, Cambodia`
                : "Vattanac Hotel (VVotel), No. 2052 Preah Monivong St, Kampong Cham, Cambodia"
            )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-200 flex flex-wrap items-center justify-between gap-2 z-20">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">
                {lang === "km" ? "ទីតាំងបច្ចុប្បន្នលើ Google Maps" : "Current Google Place:"}
              </span>
              <span className="text-xs sm:text-sm font-black text-vvotel-navy">
                {activeDestination ? (lang === "km" ? activeDestination.title.km : activeDestination.title.en) : (lang === "km" ? HOTEL_INFO.name.km : HOTEL_INFO.name.en)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={
                  activeDestination
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeDestination.title.en}, Kampong Cham, Cambodia`)}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Vattanac Hotel (VVotel), No. 2052 Preah Monivong St, Kampong Cham, Cambodia")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#0c2340] text-vvotel-gold font-bold text-xs rounded-xl hover:bg-black transition flex items-center space-x-1"
              >
                <span>Google Maps App ➔</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          className={`w-full z-10 bg-slate-100 ${
            isFullscreen ? "flex-1" : "h-[450px] sm:h-[550px] lg:h-[620px]"
          }`}
        />
      )}

      {/* Interactive Quick Selector Pill Bar Below Map */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 overflow-x-auto flex items-center space-x-2 scrollbar-none">
        <span className="text-[11px] font-bold text-gray-500 uppercase px-2 shrink-0">
          {lang === "km" ? "ចុចដើម្បី Zoom ទៅកាន់ទីតាំង：" : "Quick Zoom To Place:"}
        </span>
        <button
          onClick={recenterMap}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1 ${
            !activeDestination
              ? "bg-vvotel-navy text-vvotel-gold ring-2 ring-vvotel-gold"
              : "bg-vvotel-navy text-white hover:opacity-90"
          }`}
        >
          <span>⭐ {lang === "km" ? "សណ្ឋាគារ វឌ្ឍនៈ (VVotel)" : "Vattanac Hotel (VVotel)"}</span>
        </button>
        {destinations.map((d) => {
          const isSelected = activeDestination?.id === d.id;
          return (
            <button
              key={d.id}
              onClick={() => {
                setActiveDestination(d);
                onSelectDestination(d);
                if (mapInstanceRef.current && mapType !== "google-live") {
                  mapInstanceRef.current.flyTo([d.latitude, d.longitude], 15, { duration: 1 });
                }
              }}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isSelected
                  ? "bg-vvotel-gold text-vvotel-navy font-bold border-vvotel-gold shadow"
                  : "bg-white hover:bg-amber-50 text-gray-700 border-gray-200"
              }`}
            >
              {lang === "km" ? d.title.km : d.title.en}
            </button>
          );
        })}
      </div>
    </div>
  );
};
