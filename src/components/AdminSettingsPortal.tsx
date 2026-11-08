"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Building,
  CreditCard,
  BedDouble,
  MapPin,
  Sliders,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Phone,
  Mail,
  Compass,
  Check,
  RefreshCw,
  X,
  ShieldCheck,
  Upload,
  Edit2,
  UtensilsCrossed,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { SiteSettings, RoomSetting, DestinationSetting, DiningItemSetting } from "@/lib/settings";

interface AdminSettingsPortalProps {
  lang: "km" | "en";
}

export const AdminSettingsPortal: React.FC<AdminSettingsPortalProps> = ({ lang }) => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const [formSettings, setFormSettings] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState<
    "general" | "banking" | "rooms" | "dining" | "destinations" | "features" | "telegram"
  >("general");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [showApiToken, setShowApiToken] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);

  // Client-Side Image Upload with Canvas Compression
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(lang === "km" ? "សូមជ្រើសរើសឯកសាររូបភាព (JPG, PNG, WebP)" : "Please select an image file (JPG, PNG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          onSuccess(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ======================= ROOMS CRUD STATE =======================
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState<RoomSetting>({
    id: "",
    nameKm: "",
    nameEn: "",
    categoryKm: "ប្រណីតភាព",
    categoryEn: "Luxury",
    basePrice: 95,
    originalPrice: 120,
    sizeSqm: 38,
    bedTypeKm: "គ្រែឃីង ១ ឬគ្រែទោល ២",
    bedTypeEn: "1 King or 2 Twin Beds",
    capacityAdults: 2,
    capacityChildren: 1,
    availableCount: 8,
    viewKm: "ទេសភាពទន្លេមេគង្គ",
    viewEn: "Mekong River View",
    viewTypeKm: "ទេសភាពទន្លេមេគង្គ",
    viewTypeEn: "Mekong River View",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    descriptionKm: "បន្ទប់ប្រណីតបំពាក់គ្រឿងសង្ហារិមទំនើប និងមានយ៉រគយគន់ទន្លេមេគង្គ។",
    descriptionEn: "Modern luxury room with private balcony overlooking the Mekong River.",
    enabled: true,
  });

  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomSetting | null>(null);

  const handleOpenEditRoom = (index: number) => {
    setEditingRoomIndex(index);
    setEditingRoom({ ...formSettings.rooms[index] });
    setIsEditRoomModalOpen(true);
  };

  const handleSaveEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoomIndex === null || !editingRoom) return;
    setFormSettings((prev) => {
      const updated = [...prev.rooms];
      updated[editingRoomIndex] = {
        ...editingRoom,
        viewKm: editingRoom.viewKm || editingRoom.viewTypeKm || "ទេសភាពទន្លេមេគង្គ",
        viewEn: editingRoom.viewEn || editingRoom.viewTypeEn || "Mekong River View",
      };
      return { ...prev, rooms: updated };
    });
    setIsEditRoomModalOpen(false);
    setEditingRoom(null);
    setEditingRoomIndex(null);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.nameKm || !newRoom.nameEn) {
      alert(lang === "km" ? "សូមបញ្ចូលឈ្មោះបន្ទប់ទាំងខ្មែរ និងអង់គ្លេស" : "Please enter room names");
      return;
    }
    const roomId = newRoom.id || newRoom.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const roomToAdd: RoomSetting = {
      ...newRoom,
      id: roomId,
      viewKm: newRoom.viewKm || newRoom.viewTypeKm || "ទេសភាពទន្លេមេគង្គ",
      viewEn: newRoom.viewEn || newRoom.viewTypeEn || "Mekong River View",
    };
    setFormSettings((prev) => ({
      ...prev,
      rooms: [...prev.rooms, roomToAdd],
    }));
    setIsAddRoomModalOpen(false);
    setNewRoom({
      id: "",
      nameKm: "",
      nameEn: "",
      categoryKm: "ប្រណីតភាព",
      categoryEn: "Luxury",
      basePrice: 95,
      originalPrice: 120,
      sizeSqm: 38,
      bedTypeKm: "គ្រែឃីង ១ ឬគ្រែទោល ២",
      bedTypeEn: "1 King or 2 Twin Beds",
      capacityAdults: 2,
      capacityChildren: 1,
      availableCount: 8,
      viewKm: "ទេសភាពទន្លេមេគង្គ",
      viewEn: "Mekong River View",
      viewTypeKm: "ទេសភាពទន្លេមេគង្គ",
      viewTypeEn: "Mekong River View",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      descriptionKm: "បន្ទប់ប្រណីតបំពាក់គ្រឿងសង្ហារិមទំនើប និងមានយ៉រគយគន់ទន្លេមេគង្គ។",
      descriptionEn: "Modern luxury room with private balcony overlooking the Mekong River.",
      enabled: true,
    });
  };

  const handleDeleteRoom = (index: number) => {
    const room = formSettings.rooms[index];
    if (!confirm(lang === "km" ? `តើអ្នកពិតជាចង់លុបបន្ទប់ "${room.nameKm}" មែនទេ?` : `Delete room "${room.nameEn}"?`)) return;
    setFormSettings((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }));
  };

  // ======================= DINING CRUD STATE =======================
  const [isAddDiningModalOpen, setIsAddDiningModalOpen] = useState(false);
  const [newDining, setNewDining] = useState<DiningItemSetting>({
    id: "",
    nameKm: "",
    nameEn: "",
    cuisineKm: "ម្ហូបខ្មែរ & អន្តរជាតិ",
    cuisineEn: "Khmer & International Cuisine",
    hoursKm: "០៦:០០ - ២២:០០",
    hoursEn: "06:00 - 22:00 Daily",
    dressCodeKm: "សម្លៀកបំពាក់សមរម្យ",
    dressCodeEn: "Smart Casual",
    priceRangeUSD: "$$ - $$$",
    taglineKm: "រសជាតិប្រណីតមាត់ទន្លេមេគង្គ",
    taglineEn: "Riverside fine dining experience",
    descriptionKm: "ភោជនីយដ្ឋានផ្តល់ជូនម្ហូបឆ្ងាញ់ៗ និងស្រស់ៗ រួមជាមួយទេសភាពទន្លេមេគង្គដ៏ស្រស់បំព្រង។",
    descriptionEn: "Offering gourmet dishes and fresh local flavors overlooking the majestic Mekong River.",
    signatureDishesKm: ["អាម៉ុកត្រីមេគង្គ", "បង្កងអាំងទឹកត្រីកោះកុង"],
    signatureDishesEn: ["Mekong Fish Amok", "Grilled River Lobster"],
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    enabled: true,
  });

  const [isEditDiningModalOpen, setIsEditDiningModalOpen] = useState(false);
  const [editingDiningIndex, setEditingDiningIndex] = useState<number | null>(null);
  const [editingDining, setEditingDining] = useState<DiningItemSetting | null>(null);

  const handleOpenEditDining = (index: number) => {
    setEditingDiningIndex(index);
    setEditingDining({ ...(formSettings.dining || [])[index] });
    setIsEditDiningModalOpen(true);
  };

  const handleSaveEditDining = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDiningIndex === null || !editingDining) return;
    setFormSettings((prev) => {
      const updated = [...(prev.dining || [])];
      updated[editingDiningIndex] = editingDining;
      return { ...prev, dining: updated };
    });
    setIsEditDiningModalOpen(false);
    setEditingDining(null);
    setEditingDiningIndex(null);
  };

  const handleAddDining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDining.nameKm || !newDining.nameEn) {
      alert(lang === "km" ? "សូមបញ្ចូលឈ្មោះភោជនីយដ្ឋាន/មុខម្ហូបទាំងខ្មែរ និងអង់គ្លេស" : "Please enter venue names");
      return;
    }
    const diningId = newDining.id || newDining.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const diningToAdd: DiningItemSetting = {
      ...newDining,
      id: diningId,
    };
    setFormSettings((prev) => ({
      ...prev,
      dining: [...(prev.dining || []), diningToAdd],
    }));
    setIsAddDiningModalOpen(false);
    setNewDining({
      id: "",
      nameKm: "",
      nameEn: "",
      cuisineKm: "ម្ហូបខ្មែរ & អន្តរជាតិ",
      cuisineEn: "Khmer & International Cuisine",
      hoursKm: "០៦:០០ - ២២:០០",
      hoursEn: "06:00 - 22:00 Daily",
      dressCodeKm: "សម្លៀកបំពាក់សមរម្យ",
      dressCodeEn: "Smart Casual",
      priceRangeUSD: "$$ - $$$",
      taglineKm: "រសជាតិប្រណីតមាត់ទន្លេមេគង្គ",
      taglineEn: "Riverside fine dining experience",
      descriptionKm: "ភោជនីយដ្ឋានផ្តល់ជូនម្ហូបឆ្ងាញ់ៗ និងស្រស់ៗ រួមជាមួយទេសភាពទន្លេមេគង្គដ៏ស្រស់បំព្រង។",
      descriptionEn: "Offering gourmet dishes and fresh local flavors overlooking the majestic Mekong River.",
      signatureDishesKm: ["អាម៉ុកត្រីមេគង្គ", "បង្កងអាំងទឹកត្រីកោះកុង"],
      signatureDishesEn: ["Mekong Fish Amok", "Grilled River Lobster"],
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      enabled: true,
    });
  };

  const handleDeleteDining = (index: number) => {
    const venue = (formSettings.dining || [])[index];
    if (!confirm(lang === "km" ? `តើអ្នកពិតជាចង់លុប "${venue.nameKm}" មែនទេ?` : `Delete venue "${venue.nameEn}"?`)) return;
    setFormSettings((prev) => ({
      ...prev,
      dining: (prev.dining || []).filter((_, i) => i !== index),
    }));
  };

  const handleToggleDining = (index: number) => {
    setFormSettings((prev) => {
      const updated = [...(prev.dining || [])];
      updated[index] = { ...updated[index], enabled: !updated[index].enabled };
      return { ...prev, dining: updated };
    });
  };

  // ======================= DESTINATIONS CRUD STATE =======================
  const [isAddDestModalOpen, setIsAddDestModalOpen] = useState(false);
  const [newDest, setNewDest] = useState<Partial<DestinationSetting>>({
    nameKm: "",
    nameEn: "",
    category: "culture-local-life",
    categoryNameKm: "វប្បធម៌ & ជីវភាពអ្នកស្រុក",
    categoryNameEn: "Culture & Local Life",
    distanceKm: 2.5,
    travelTimeMinutes: 8,
    latitude: 11.9924,
    longitude: 105.4645,
    taglineKm: "",
    taglineEn: "",
    descriptionKm: "",
    descriptionEn: "",
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    googleMapsUrl: "https://maps.google.com/?q=11.9924,105.4645",
    enabled: true,
  });

  const [isEditDestModalOpen, setIsEditDestModalOpen] = useState(false);
  const [editingDestId, setEditingDestId] = useState<number | null>(null);
  const [editingDest, setEditingDest] = useState<DestinationSetting | null>(null);

  const handleOpenEditDest = (dest: DestinationSetting) => {
    setEditingDestId(dest.id);
    setEditingDest({ ...dest });
    setIsEditDestModalOpen(true);
  };

  const handleSaveEditDest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDest || editingDestId === null) return;
    setFormSettings((prev) => ({
      ...prev,
      destinations: prev.destinations.map((d) => (d.id === editingDestId ? editingDest : d)),
    }));
    setIsEditDestModalOpen(false);
    setEditingDest(null);
    setEditingDestId(null);
  };

  // Sync state when settings initializes
  useEffect(() => {
    if (settings) {
      setFormSettings(settings);
    }
  }, [settings]);

  // General field updater
  const handleFieldChange = <K extends keyof SiteSettings>(field: K, value: SiteSettings[K]) => {
    setFormSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Feature toggle updater
  const handleFeatureToggle = (featureKey: keyof SiteSettings["features"]) => {
    setFormSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey],
      },
    }));
  };

  // Room item updater
  const handleRoomChange = (index: number, field: keyof RoomSetting, value: any) => {
    setFormSettings((prev) => {
      const updatedRooms = [...prev.rooms];
      updatedRooms[index] = {
        ...updatedRooms[index],
        [field]: value,
      };
      return {
        ...prev,
        rooms: updatedRooms,
      };
    });
  };

  // Destination item updater
  const handleDestinationToggle = (id: number) => {
    setFormSettings((prev) => ({
      ...prev,
      destinations: prev.destinations.map((d) =>
        d.id === id ? { ...d, enabled: !d.enabled } : d
      ),
    }));
  };

  const handleDeleteDestination = (id: number) => {
    if (!confirm(lang === "km" ? "តើអ្នកពិតជាចង់លុបទីតាំងនេះមែនទេ?" : "Delete this destination?")) return;
    setFormSettings((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d.id !== id),
    }));
  };

  // Add new destination submit
  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.nameKm || !newDest.nameEn) {
      alert(lang === "km" ? "សូមបញ្ចូលឈ្មោះទីតាំងទាំងភាសាខ្មែរ និងអង់គ្លេស" : "Please enter location names");
      return;
    }

    const nextId = formSettings.destinations.length > 0
      ? Math.max(...formSettings.destinations.map((d) => d.id)) + 1
      : 1;

    const completeDest: DestinationSetting = {
      id: nextId,
      slug: (newDest.nameEn || "destination").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nameKm: newDest.nameKm || "",
      nameEn: newDest.nameEn || "",
      category: newDest.category || "culture-local-life",
      categoryNameKm: newDest.category === "beaches-nature" ? "ឆ្នេរខ្សាច់ & ធម្មជាតិ" :
        newDest.category === "sports-activities" ? "កីឡា & សកម្មភាពផ្សងព្រេង" :
        newDest.category === "restaurants" ? "ភោជនីយដ្ឋាន & ម្ហូបអាហារ" : "វប្បធម៌ & ជីវភាពអ្នកស្រុក",
      categoryNameEn: newDest.category === "beaches-nature" ? "Beaches & Nature" :
        newDest.category === "sports-activities" ? "Sports & Activities" :
        newDest.category === "restaurants" ? "Restaurants & Cafes" : "Culture & Local Life",
      distanceKm: Number(newDest.distanceKm) || 1,
      travelTimeMinutes: Number(newDest.travelTimeMinutes) || 5,
      latitude: Number(newDest.latitude) || 11.9924,
      longitude: Number(newDest.longitude) || 105.4645,
      taglineKm: newDest.taglineKm || "",
      taglineEn: newDest.taglineEn || "",
      descriptionKm: newDest.descriptionKm || "",
      descriptionEn: newDest.descriptionEn || "",
      imageUrl: newDest.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
      googleMapsUrl: newDest.googleMapsUrl || `https://maps.google.com/?q=${newDest.latitude || 11.9924},${newDest.longitude || 105.4645}`,
      enabled: true,
    };

    setFormSettings((prev) => ({
      ...prev,
      destinations: [...prev.destinations, completeDest],
    }));

    setIsAddDestModalOpen(false);
    // Reset form
    setNewDest({
      nameKm: "",
      nameEn: "",
      category: "culture-local-life",
      categoryNameKm: "វប្បធម៌ & ជីវភាពអ្នកស្រុក",
      categoryNameEn: "Culture & Local Life",
      distanceKm: 2.5,
      travelTimeMinutes: 8,
      latitude: 11.9924,
      longitude: 105.4645,
      taglineKm: "",
      taglineEn: "",
      descriptionKm: "",
      descriptionEn: "",
      imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
      googleMapsUrl: "https://maps.google.com/?q=11.9924,105.4645",
      enabled: true,
    });
  };

  // Save Settings
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccessMsg("");
    try {
      const ok = await updateSettings(formSettings);
      if (ok) {
        setSaveSuccessMsg(
          lang === "km"
            ? "✅ ការកំណត់ត្រូវបានរក្សាទុក និង sync ទៅកាន់គេហទំព័រទាំងមូលដោយជោគជ័យ!"
            : "✅ Settings successfully saved and synchronized across the entire website!"
        );
        setTimeout(() => setSaveSuccessMsg(""), 6000);
      } else {
        alert(lang === "km" ? "មិនអាចរក្សាទុកការកំណត់បានទេ សូមព្យាយាមម្តងទៀត" : "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-siemreap">
      {/* Top Banner & Save Action Header */}
      <div className="bg-white border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0c2340] to-[#1a3a60] text-amber-300 flex items-center justify-center font-bold text-xl shadow-md border border-amber-300/40 shrink-0">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-mool text-lg sm:text-xl text-[#0c2340]">
                {lang === "km" ? "ការកំណត់ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារ VVotel" : "VVotel System Settings Portal"}
              </h2>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Dynamic Sync
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "កំណត់ព័ត៌មាន Logo, ធនាគារ KHQR, តម្លៃបន្ទប់, ទីតាំងទេសចរណ៍ និងមុខងារវេបសាយទាំងអស់"
                : "Manage hotel branding, logo, bank accounts, room pricing, tourist locations & feature toggles."}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/10 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
            ) : (
              <Save className="w-4 h-4 text-amber-200" />
            )}
            <span>
              {isSaving
                ? (lang === "km" ? "កំពុងរក្សាទុក..." : "Saving...")
                : (lang === "km" ? "រក្សាទុកការកំណត់ទាំងអស់ (Save All)" : "Save All Settings")}
            </span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg("")}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs Pill Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { key: "general", labelKm: "🏨 ព័ត៌មានទូទៅ & Logo", labelEn: "🏨 General & Logo" },
          { key: "banking", labelKm: "🏦 ធនាគារ & Bakong KHQR", labelEn: "🏦 Banking & KHQR" },
          { key: "rooms", labelKm: "🛏️ បន្ទប់ & តម្លៃស្នាក់នៅ", labelEn: "🛏️ Rooms & Pricing" },
          { key: "dining", labelKm: "🍽️ អាហារ & ភោជនីយដ្ឋាន", labelEn: "🍽️ Dining & Venues" },
          { key: "destinations", labelKm: "🗺️ ទីតាំងទេសចរណ៍ & ផែនទី", labelEn: "🗺️ Destinations & Map" },
          { key: "features", labelKm: "🎛️ បើក/បិទ មុខងារប្រព័ន្ធ", labelEn: "🎛️ Feature Toggles" },
          { key: "telegram", labelKm: "🤖 Telegram Bot", labelEn: "🤖 Telegram Bot" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center space-x-2 ${
              activeTab === tab.key
                ? "bg-[#0c2340] text-amber-300 shadow-md border border-amber-300/40"
                : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-amber-50/50"
            }`}
          >
            <span>{lang === "km" ? tab.labelKm : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* ======================= TAB 1: GENERAL INFO & LOGO ======================= */}
      {activeTab === "general" && (
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-mool text-base sm:text-lg text-[#0c2340]">
              {lang === "km" ? "ព័ត៌មានអត្តសញ្ញាណសណ្ឋាគារ & Logo" : "Hotel Branding, Contact & Logo"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "ព័ត៌មានទាំងនេះនឹងបង្ហាញនៅលើ Header, Footer, Hero, និងរបាយការណ៍រដ្ឋបាលទាំងអស់។"
                : "These properties are rendered on the Header, Footer, Hero, and Official Reports."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotel Name KM */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "ឈ្មោះសណ្ឋាគារ (ភាសាខ្មែរ):" : "Hotel Name (Khmer):"}
              </label>
              <input
                type="text"
                value={formSettings.hotelNameKm}
                onChange={(e) => handleFieldChange("hotelNameKm", e.target.value)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-siemreap"
              />
            </div>

            {/* Hotel Name EN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "ឈ្មោះសណ្ឋាគារ (ភាសាអង់គ្លេស):" : "Hotel Name (English):"}
              </label>
              <input
                type="text"
                value={formSettings.hotelNameEn}
                onChange={(e) => handleFieldChange("hotelNameEn", e.target.value)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tagline KM */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "ពាក្យស្លោក/Tagline (ភាសាខ្មែរ):" : "Hotel Tagline (Khmer):"}
              </label>
              <input
                type="text"
                value={formSettings.hotelTaglineKm}
                onChange={(e) => handleFieldChange("hotelTaglineKm", e.target.value)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-siemreap"
              />
            </div>

            {/* Tagline EN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "ពាក្យស្លោក/Tagline (ភាសាអង់គ្លេស):" : "Hotel Tagline (English):"}
              </label>
              <input
                type="text"
                value={formSettings.hotelTaglineEn}
                onChange={(e) => handleFieldChange("hotelTaglineEn", e.target.value)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Logo Text & Image URL */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {lang === "km" ? "អក្សរ Logo សង្ខេប (Logo Text):" : "Logo Text Badge:"}
                </label>
                <input
                  type="text"
                  value={formSettings.logoText}
                  onChange={(e) => handleFieldChange("logoText", e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    {lang === "km" ? "រូបភាព Logo (ជ្រើសរើសរូបពីទូរស័ព្ទ/កុំព្យូទ័រ ឬ URL):" : "Custom Logo Image (Upload or URL):"}
                  </label>
                  <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-amber-800" />
                    <span>{lang === "km" ? "ជ្រើសរើសរូបភាព..." : "Upload File..."}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (dataUrl) => handleFieldChange("logoImageUrl", dataUrl))}
                    />
                  </label>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <input
                    type="text"
                    placeholder="https://.../hotel-logo.png ឬ Upload រូបផ្ទាល់"
                    value={formSettings.logoImageUrl}
                    onChange={(e) => handleFieldChange("logoImageUrl", e.target.value)}
                    className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  {formSettings.logoImageUrl && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange("logoImageUrl", "")}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition"
                      title={lang === "km" ? "លុបរូបភាព" : "Clear Logo"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {formSettings.logoImageUrl ? (
                    <div className="w-12 h-12 rounded-xl border border-amber-300 overflow-hidden bg-white shrink-0 flex items-center justify-center p-1 shadow-sm">
                      <img
                        src={formSettings.logoImageUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => ((e.target as any).style.display = "none")}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-vvotel-navy text-amber-300 font-mool flex items-center justify-center text-xl shrink-0 shadow-sm border border-amber-300/40">
                      {formSettings.logoText || "V"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Phone & Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "លេខទូរស័ព្ទផ្លូវការ:" : "Official Phone Number:"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formSettings.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "អ៊ីមែលផ្លូវការ:" : "Official Email Address:"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formSettings.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Address KM */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "អាសយដ្ឋាន (ភាសាខ្មែរ):" : "Address (Khmer):"}
              </label>
              <textarea
                rows={2}
                value={formSettings.addressKm}
                onChange={(e) => handleFieldChange("addressKm", e.target.value)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-siemreap"
              />
            </div>

            {/* Address EN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "អាសយដ្ឋាន (ភាសាអង់គ្លេស):" : "Address (English):"}
              </label>
              <textarea
                rows={2}
                value={formSettings.addressEn}
                onChange={(e) => handleFieldChange("addressEn", e.target.value)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "កូអរដោនេ Latitude (GPS):" : "Latitude (GPS):"}
              </label>
              <input
                type="number"
                step="any"
                value={formSettings.latitude}
                onChange={(e) => handleFieldChange("latitude", parseFloat(e.target.value) || 0)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "កូអរដោនេ Longitude (GPS):" : "Longitude (GPS):"}
              </label>
              <input
                type="number"
                step="any"
                value={formSettings.longitude}
                onChange={(e) => handleFieldChange("longitude", parseFloat(e.target.value) || 0)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: BANKING & BAKONG KHQR ======================= */}
      {activeTab === "banking" && (
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-mool text-base sm:text-lg text-[#0c2340]">
              {lang === "km" ? "ការកំណត់កុងធនាគារ & ប្រព័ន្ធទូទាត់ Bakong KHQR" : "Banking & Bakong KHQR Gateway"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "កំណត់គណនីធនាគារទទួលប្រាក់ និងបើកដំណើរការមុខងារផ្ទៀងផ្ទាត់លុយចូលកុងពិតប្រាកដមុនពេលកក់"
                : "Configure merchant bank account, custom QR, and strict real-time verification rules."}
            </p>
          </div>

          {/* Strict Bank Verification Highlight Box */}
          <div className="p-5 bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-mool text-[#0c2340] text-sm sm:text-base">
                    {lang === "km"
                      ? "ត្រួតពិនិត្យប្រាក់ចូលកុងពិតប្រាកដ (Strict Real-time Bank Check)"
                      : "Strict Real-time Bank Verification (NBC Bakong)"}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formSettings.strictBakongVerification
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {formSettings.strictBakongVerification ? "Active (តឹងរ៉ឹង)" : "Off"}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {lang === "km"
                    ? "នៅពេលបើក៖ ភ្ញៀវត្រូវតែបាញ់ប្រាក់ចូលកុងធនាគារពិតប្រាកដ ទើបប្រព័ន្ធអនុញ្ញាតឱ្យ verify និងចេញវិក្កយបត្រកក់រួចរាល់ ដោយស្វ័យប្រវត្តិតាមរយៈ NBC Bakong OpenAPI MD5 Hash check!"
                    : "When enabled: The system queries NBC Bakong OpenAPI to verify that money was genuinely received before confirming bookings."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleFieldChange("strictBakongVerification", !formSettings.strictBakongVerification)
              }
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 shrink-0 ${
                formSettings.strictBakongVerification
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              <span>{formSettings.strictBakongVerification ? "✓ បានបើក (Enabled)" : "បិទ (Disabled)"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Bank Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "ឈ្មោះធនាគារ (Bank Name):" : "Bank Name:"}
              </label>
              <input
                type="text"
                value={formSettings.bankName}
                onChange={(e) => handleFieldChange("bankName", e.target.value)}
                placeholder="ABA Bank / NBC Bakong"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Bank Account Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "ឈ្មោះម្ចាស់គណនី (Account Name):" : "Account Holder Name:"}
              </label>
              <input
                type="text"
                value={formSettings.bankAccountName}
                onChange={(e) => handleFieldChange("bankAccountName", e.target.value)}
                placeholder="VATTANAC HOTEL VVOTEL KPC"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            {/* Bank Account Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "លេខកុងធនាគារ (Account Number):" : "Account Number:"}
              </label>
              <input
                type="text"
                value={formSettings.bankAccountNumber}
                onChange={(e) => handleFieldChange("bankAccountNumber", e.target.value)}
                placeholder="001 888 999"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            {/* Bakong Account ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "Bakong Account ID (e.g. vvotel@aba):" : "Bakong Account ID:"}
              </label>
              <input
                type="text"
                value={formSettings.bakongAccountId}
                onChange={(e) => handleFieldChange("bakongAccountId", e.target.value)}
                placeholder="vvotel_kpc@aba"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Bakong Merchant ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "Bakong Merchant ID (បើមាន):" : "Merchant ID:"}
              </label>
              <input
                type="text"
                value={formSettings.bakongMerchantId}
                onChange={(e) => handleFieldChange("bakongMerchantId", e.target.value)}
                placeholder="KAMPONGCHAM_HOTEL_001"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Bakong Open API Token */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "NBC Bakong OpenAPI Bearer Token:" : "NBC Bakong OpenAPI Token:"}
              </label>
              <div className="relative">
                <input
                  type={showApiToken ? "text" : "password"}
                  value={formSettings.bakongOpenApiToken}
                  onChange={(e) => handleFieldChange("bakongOpenApiToken", e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl pl-4 pr-11 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiToken(!showApiToken)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                >
                  {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Custom QR Code Image Upload & URL */}
            <div className="md:col-span-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {lang === "km"
                    ? "រូបភាព QR Code ផ្ទាល់ខ្លួន (Upload ពីរូបភាព ឬ បញ្ចូល URL):"
                    : "Custom QR Code Image (Upload or URL):"}
                </label>
                <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-amber-800" />
                  <span>{lang === "km" ? "ជ្រើសរើសរូប QR..." : "Upload QR Image..."}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, (dataUrl) => handleFieldChange("qrCustomImageUrl", dataUrl))}
                  />
                </label>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="text"
                  value={formSettings.qrCustomImageUrl}
                  onChange={(e) => handleFieldChange("qrCustomImageUrl", e.target.value)}
                  placeholder="https://.../my-aba-khqr.png ឬ Upload រូប QR ផ្ទាល់"
                  className="flex-1 w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                />
                {formSettings.qrCustomImageUrl && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange("qrCustomImageUrl", "")}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition shrink-0"
                    title={lang === "km" ? "លុបរូបភាព QR" : "Clear QR"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {formSettings.qrCustomImageUrl && (
                  <div className="w-20 h-20 bg-white rounded-xl border border-amber-300 p-1 shadow shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={formSettings.qrCustomImageUrl}
                      alt="Custom QR Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                {lang === "km"
                  ? "ចំណាំ៖ លោកអ្នកអាច Upload រូបភាពកូដ QR ពីទូរស័ព្ទផ្ទាល់ ឬប្រើ Dynamic Bakong KHQR EMVCo ផ្លូវការ។"
                  : "Note: You can upload your official QR code image directly or use dynamic EMVCo Bakong KHQR."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: ROOMS & PRICING ======================= */}
      {activeTab === "rooms" && (
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-mool text-base sm:text-lg text-[#0c2340]">
                {lang === "km" ? "គ្រប់គ្រងបន្ទប់ & កែសម្រួលតម្លៃស្នាក់នៅ" : "Manage Rooms & Room Pricing"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === "km"
                  ? "តម្លៃដែលបានកែសម្រួលនៅទីនេះ នឹង update លើ BookingBar, Accommodation Section, និងប្រព័ន្ធកក់ភ្លាមៗ។"
                  : "Pricing edits here immediately update the BookingBar, Accommodation grid, and booking catalog."}
              </p>
            </div>

            {/* Actions: Add Room & Breakfast Rate */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddRoomModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === "km" ? "បន្ថែមបន្ទប់ថ្មី (Add Room)" : "+ Add New Room"}</span>
              </button>

              {/* Breakfast price setting */}
              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl shrink-0">
                <span className="text-xs font-bold text-gray-700">
                  {lang === "km" ? "អាហារពេលព្រឹក/នាក់:" : "Breakfast Rate:"}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-vvotel-navy font-mono">$</span>
                  <input
                    type="number"
                    min={0}
                    value={formSettings.breakfastPriceUSD}
                    onChange={(e) => handleFieldChange("breakfastPriceUSD", parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-bold font-mono text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F4] border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">បន្ទប់ / Room</th>
                  <th className="py-3 px-4">តម្លៃ ($/យប់)</th>
                  <th className="py-3 px-4">តម្លៃដើម ($)</th>
                  <th className="py-3 px-4">ទំហំ (m²)</th>
                  <th className="py-3 px-4">មនុស្សចាស់ / ក្មេង</th>
                  <th className="py-3 px-4">ចំនួនបន្ទប់</th>
                  <th className="py-3 px-4 text-center">ស្ថានភាព</th>
                  <th className="py-3 px-4 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-siemreap">
                {formSettings.rooms.map((room, idx) => (
                  <tr key={room.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={room.imageUrl}
                          alt={room.nameEn}
                          className="w-12 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#0c2340] text-xs sm:text-sm">
                            {lang === "km" ? room.nameKm : room.nameEn}
                          </div>
                          <span className="text-[10px] text-amber-700 font-mono block">
                            {room.id} • {room.categoryEn}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Base Price */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-emerald-700">$</span>
                        <input
                          type="number"
                          min={1}
                          value={room.basePrice}
                          onChange={(e) => handleRoomChange(idx, "basePrice", parseFloat(e.target.value) || 0)}
                          className="w-20 bg-white border border-gray-300 rounded-lg px-2 py-1.5 font-bold text-gray-900 focus:border-amber-500 font-mono"
                        />
                      </div>
                    </td>

                    {/* Original Price */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          min={1}
                          value={room.originalPrice}
                          onChange={(e) => handleRoomChange(idx, "originalPrice", parseFloat(e.target.value) || 0)}
                          className="w-20 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-500 focus:border-amber-500 font-mono"
                        />
                      </div>
                    </td>

                    {/* Size Sqm */}
                    <td className="py-3.5 px-4 font-mono">
                      <input
                        type="number"
                        min={10}
                        value={room.sizeSqm}
                        onChange={(e) => handleRoomChange(idx, "sizeSqm", parseInt(e.target.value) || 30)}
                        className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1.5 font-bold text-gray-900 font-mono text-center"
                      />
                    </td>

                    {/* Occupancy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <input
                          type="number"
                          min={1}
                          value={room.capacityAdults}
                          onChange={(e) => handleRoomChange(idx, "capacityAdults", parseInt(e.target.value) || 1)}
                          className="w-12 bg-white border border-gray-300 rounded-lg px-1.5 py-1 text-center font-bold"
                          title="Adults"
                        />
                        <span className="text-gray-400">A /</span>
                        <input
                          type="number"
                          min={0}
                          value={room.capacityChildren}
                          onChange={(e) => handleRoomChange(idx, "capacityChildren", parseInt(e.target.value) || 0)}
                          className="w-12 bg-white border border-gray-300 rounded-lg px-1.5 py-1 text-center font-bold"
                          title="Children"
                        />
                        <span className="text-gray-400">C</span>
                      </div>
                    </td>

                    {/* Count */}
                    <td className="py-3.5 px-4 font-mono">
                      <input
                        type="number"
                        min={1}
                        value={room.availableCount}
                        onChange={(e) => handleRoomChange(idx, "availableCount", parseInt(e.target.value) || 1)}
                        className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1.5 font-bold text-gray-900 font-mono text-center"
                      />
                    </td>

                    {/* Enabled Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRoomChange(idx, "enabled", !room.enabled)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                          room.enabled
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}
                      >
                        {room.enabled ? "បើក" : "បិទ"}
                      </button>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditRoom(idx)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg transition"
                          title={lang === "km" ? "កែប្រែបន្ទប់" : "Edit Room"}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(idx)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition"
                          title={lang === "km" ? "លុបបន្ទប់" : "Delete Room"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB: DINING & VENUES ======================= */}
      {activeTab === "dining" && (
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-mool text-base sm:text-lg text-[#0c2340]">
                {lang === "km" ? "🍽️ គ្រប់គ្រងភោជនីយដ្ឋាន បារ & មុខម្ហូបពិសេស" : "🍽️ Manage Dining, Bars & Menus"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === "km"
                  ? "បន្ថែម កែប្រែរូបភាព ម៉ោងបើក តម្លៃ និងមុខម្ហូបល្បីៗប្រចាំហាង ដែលបង្ហាញលើគេហទំព័រ និងប្រព័ន្ធកក់តុ។"
                  : "Add or edit restaurant venues, upload dining photos, set hours, dress code, and signature dishes."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddDiningModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "km" ? "បន្ថែមភោជនីយដ្ឋាន/មុខម្ហូប" : "+ Add Dining Venue"}</span>
            </button>
          </div>

          {/* Dining Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(formSettings.dining || []).map((venue, idx) => (
              <div
                key={venue.id || idx}
                className={`rounded-2xl border p-4 sm:p-5 transition flex flex-col justify-between space-y-4 ${
                  venue.enabled
                    ? "bg-[#FCFAF7] border-amber-200/80 shadow-2xs hover:shadow-md"
                    : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-gray-100 border border-amber-200 shrink-0 relative">
                    <img
                      src={venue.imageUrl}
                      alt={venue.nameEn}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-black/60 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                      {venue.priceRangeUSD || "$$"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider truncate">
                        {lang === "km" ? venue.cuisineKm : venue.cuisineEn}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleDining(idx)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          venue.enabled
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {venue.enabled ? (lang === "km" ? "បើក" : "Active") : (lang === "km" ? "បិទ" : "Disabled")}
                      </button>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-[#0c2340] truncate">
                      {lang === "km" ? venue.nameKm : venue.nameEn}
                    </h4>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {lang === "km" ? venue.descriptionKm : venue.descriptionEn}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{lang === "km" ? venue.hoursKm : venue.hoursEn}</span>
                      </span>
                      <span>•</span>
                      <span>{lang === "km" ? venue.dressCodeKm : venue.dressCodeEn}</span>
                    </div>
                  </div>
                </div>

                {/* Signature Dishes & Action Buttons */}
                <div className="pt-3 border-t border-amber-100 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(lang === "km" ? venue.signatureDishesKm : venue.signatureDishesEn)
                      ? ((lang === "km" ? venue.signatureDishesKm : venue.signatureDishesEn) as string[])
                      : typeof (lang === "km" ? venue.signatureDishesKm : venue.signatureDishesEn) === "string"
                      ? ((lang === "km" ? venue.signatureDishesKm : venue.signatureDishesEn) as string).split(",").map((s) => s.trim()).filter(Boolean)
                      : []
                    ).slice(0, 2).map((dish, di) => (
                      <span key={di} className="text-[10px] bg-white border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-medium">
                        🍴 {dish}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDining(idx)}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                      title={lang === "km" ? "កែប្រែ" : "Edit"}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{lang === "km" ? "កែប្រែ" : "Edit"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDining(idx)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition"
                      title={lang === "km" ? "លុប" : "Delete"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 4: DESTINATIONS & MAP ======================= */}
      {activeTab === "destinations" && (
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-mool text-base sm:text-lg text-[#0c2340]">
                {lang === "km" ? "ទីតាំងទេសចរណ៍ខេត្តកំពង់ចាម & ផែនទី" : "Kampong Cham Tourist Destinations & Map"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === "km"
                  ? "គ្រប់គ្រងទីតាំង បន្ថែមទីតាំងថ្មី និងកូអរដោនេលើផែនទីអន្តរកម្ម Live Google Maps / Leaflet"
                  : "Manage tourist spots, add new locations, and verify exact GPS coordinates."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddDestModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "km" ? "បន្ថែមទីតាំងថ្មី (Add Location)" : "+ Add New Destination"}</span>
            </button>
          </div>

          {/* Destinations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formSettings.destinations.map((dest) => (
              <div
                key={dest.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                  dest.enabled
                    ? "bg-white border-amber-200/80 shadow-2xs hover:shadow-md"
                    : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={dest.imageUrl}
                    alt={dest.nameEn}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase truncate">
                        {lang === "km" ? dest.categoryNameKm : dest.categoryNameEn}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDestinationToggle(dest.id)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          dest.enabled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {dest.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-[#0c2340] truncate mt-0.5">
                      {lang === "km" ? dest.nameKm : dest.nameEn}
                    </h4>
                    <p className="text-[11px] text-gray-500 flex items-center space-x-2 mt-1">
                      <span>{dest.distanceKm} km</span>
                      <span>•</span>
                      <span>{dest.travelTimeMinutes} នាទី</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-400 font-mono">
                    Lat: {dest.latitude.toFixed(4)}, Lng: {dest.longitude.toFixed(4)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDest(dest)}
                      className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                      title={lang === "km" ? "កែប្រែទីតាំង" : "Edit Destination"}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={dest.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"
                      title="Open Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteDestination(dest.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 5: FEATURE TOGGLES ======================= */}
      {activeTab === "features" && (
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-mool text-base sm:text-lg text-[#0c2340]">
              {lang === "km" ? "បើក/បិទ មុខងារប្រព័ន្ធនៅលើ Website" : "Website Feature Flags & Controls"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "លោកអ្នកអាចបើក ឬបិទមុខងារនីមួយៗបានយ៉ាងងាយស្រួលដោយគ្រាន់តែចុចប៊ូតុងខាងក្រោម។"
                : "Toggle platform modules on/off dynamically across the entire website."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                key: "enableDiningBooking" as const,
                titleKm: "ប្រព័ន្ធកក់តុអាហារ",
                titleEn: "Dining Table Reservation",
                descKm: "អនុញ្ញាតឱ្យភ្ញៀវកក់តុអាហារនៅភោជនីយដ្ឋាន Mekong Breeze និង Sunset Lounge",
                descEn: "Enable live restaurant reservations and dining orders",
                icon: "🍽️",
              },
              {
                key: "enableKhqrBakong" as const,
                titleKm: "ការទូទាត់ Bakong KHQR",
                titleEn: "NBC Bakong KHQR Gateway",
                descKm: "បង្កើតកូដ KHQR ស្តង់ដារ EMVCo សម្រាប់ស្កេនទូទាត់តាម App ធនាគារគ្រប់ប្រភេទ",
                descEn: "Enable dynamic EMVCo KHQR code generator for mobile banking",
                icon: "💳",
              },
              {
                key: "enableCard3DS" as const,
                titleKm: "កាតឥណទាន 3D Secure",
                titleEn: "3D Secure Card Gateway",
                descKm: "ទទួលការទូទាត់តាមកាត Visa, Mastercard, JCB, UnionPay",
                descEn: "Accept Visa, Mastercard, JCB with OTP authentication",
                icon: "🔒",
              },
              {
                key: "enablePayAtHotel" as const,
                titleKm: "ទូទាត់ផ្ទាល់នៅសណ្ឋាគារ",
                titleEn: "Pay at Hotel (Cash/Card)",
                descKm: "អនុញ្ញាតឱ្យភ្ញៀវកក់ទុកមុន ហើយមកទូទាត់ប្រាក់នៅ Front Desk ពេល Check-in",
                descEn: "Allow guests to reserve and pay upon arrival at Front Desk",
                icon: "🏨",
              },
              {
                key: "enableTelegramAlerts" as const,
                titleKm: "Telegram Bot Alert (@vvotel_bot)",
                titleEn: "Instant Telegram Alerts",
                descKm: "ផ្ញើការជូនដំណឹងភ្លាមៗទៅកាន់ Bot រាល់ពេលមានការកក់បន្ទប់ ឬតុអាហារថ្មី",
                descEn: "Dispatch instant reservation alerts to @vvotel_bot",
                icon: "🤖",
              },
              {
                key: "enableLeafletMap" as const,
                titleKm: "ផែនទីអន្តរកម្មខេត្តកំពង់ចាម",
                titleEn: "Interactive Tourist Map",
                descKm: "បង្ហាញផែនទីរុករកតំបន់ទេសចរណ៍ និងបង្ហាញកូអរដោនេផ្លូវធ្វើដំណើរ",
                descEn: "Display interactive Leaflet & Google Map with tourist pins",
                icon: "🗺️",
              },
              {
                key: "enablePwaInstall" as const,
                titleKm: "ការដំឡើងកម្មវិធី PWA App",
                titleEn: "PWA Mobile App Install",
                descKm: "បង្ហាញផ្ទាំងឱ្យភ្ញៀវ Install គេហទំព័រទៅក្នុងទូរស័ព្ទដូច App ផ្លូវការ",
                descEn: "Display mobile PWA install prompts for iOS & Android",
                icon: "📲",
              },
              {
                key: "enableAccessibilityPanel" as const,
                titleKm: "ផ្ទាំងជំនួយការមើល និងអាន",
                titleEn: "Accessibility Controls",
                descKm: "ឧបករណ៍ពង្រីកអក្សរ ប្តូរពណ៌កម្រិតខ្ពស់ និងជំនួយជនពិការ",
                descEn: "High contrast, font scaling, and voice reading aids",
                icon: "👁️",
              },
              {
                key: "enableWeatherWidget" as const,
                titleKm: "ការព្យាករណ៍អាកាសធាតុប្រចាំថ្ងៃ",
                titleEn: "Live Weather Widget",
                descKm: "បង្ហាញសីតុណ្ហភាព និងអាកាសធាតុនៅក្រុងកំពង់ចាមផ្ទាល់",
                descEn: "Display real-time temperature and forecast in Kampong Cham",
                icon: "⛅",
              },
            ].map((feat) => {
              const isEnabled = formSettings.features[feat.key];
              return (
                <div
                  key={feat.key}
                  onClick={() => handleFeatureToggle(feat.key)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isEnabled
                      ? "bg-amber-50/50 border-amber-400 shadow-sm"
                      : "bg-white border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{feat.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isEnabled
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isEnabled ? "បើក (ON)" : "បិទ (OFF)"}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#0c2340]">
                      {lang === "km" ? feat.titleKm : feat.titleEn}
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      {lang === "km" ? feat.descKm : feat.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 6: TELEGRAM BOT ======================= */}
      {activeTab === "telegram" && (
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-mool text-base sm:text-lg text-[#0c2340]">
              {lang === "km" ? "ការកំណត់ Telegram Bot (@vvotel_bot)" : "Telegram Bot Setup & Alert Routing"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "គ្រប់គ្រង Bot Token, Username, និង Chat ID ដើម្បីទទួល Alert រាល់ពេលមានភ្ញៀវកក់ ឬបង់ប្រាក់"
                : "Manage bot token and receiver chat IDs for instantaneous dispatch."}
            </p>
          </div>

          <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start space-x-3 text-xs text-sky-900">
            <Send className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Official Hotel Bot:</strong> Bot ផ្លូវការរបស់សណ្ឋាគារគឺ{" "}
              <a
                href="https://t.me/vvotel_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline text-sky-700"
              >
                @vvotel_bot
              </a>
              ។ រាល់ការកក់បន្ទប់ ការកក់តុអាហារ ឬការផ្ទៀងផ្ទាត់លុយចូលកុង នឹងលោតសារ Alert ទៅកាន់ Bot ភ្លាមៗក្នុងពេល Real-time!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "Telegram Bot Username:" : "Bot Username:"}
              </label>
              <input
                type="text"
                value={formSettings.telegramBotUsername}
                onChange={(e) => handleFieldChange("telegramBotUsername", e.target.value)}
                placeholder="vvotel_bot"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "Admin Chat ID ទទួល Alert:" : "Admin Chat ID:"}
              </label>
              <input
                type="text"
                value={formSettings.telegramAdminChatId}
                onChange={(e) => handleFieldChange("telegramAdminChatId", e.target.value)}
                placeholder="5052445839"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "Telegram Bot API Token (ពី @BotFather):" : "Telegram Bot API Token:"}
              </label>
              <div className="relative">
                <input
                  type={showBotToken ? "text" : "password"}
                  value={formSettings.telegramBotToken}
                  onChange={(e) => handleFieldChange("telegramBotToken", e.target.value)}
                  placeholder="9278143321:AAE73YdgWRNZQzwjBUZ1v7Lt4MdXmhGNImk"
                  className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl pl-4 pr-11 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowBotToken(!showBotToken)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                >
                  {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL 1: ADD ROOM ======================= */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-siemreap animate-in fade-in duration-200">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-mool text-base text-[#0c2340]">
                {lang === "km" ? "➕ បន្ថែមបន្ទប់ស្នាក់នៅថ្មី" : "➕ Add New Room"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRoomModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះបន្ទប់ (ភាសាខ្មែរ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom.nameKm}
                    onChange={(e) => setNewRoom({ ...newRoom, nameKm: e.target.value })}
                    placeholder="ឧ. បន្ទប់ដេលុច្ស ទេសភាពទន្លេ"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះបន្ទប់ (ភាសាអង់គ្លេស) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom.nameEn}
                    onChange={(e) => setNewRoom({ ...newRoom, nameEn: e.target.value })}
                    placeholder="e.g. Deluxe Mekong River Room"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    តម្លៃ ($/យប់) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newRoom.basePrice}
                    onChange={(e) => setNewRoom({ ...newRoom, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    តម្លៃដើម ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newRoom.originalPrice}
                    onChange={(e) => setNewRoom({ ...newRoom, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ទំហំ (m²)</label>
                  <input
                    type="number"
                    min={10}
                    value={newRoom.sizeSqm}
                    onChange={(e) => setNewRoom({ ...newRoom, sizeSqm: parseInt(e.target.value) || 30 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ចំនួនបន្ទប់សរុប (Units)</label>
                  <input
                    type="number"
                    min={1}
                    value={newRoom.availableCount}
                    onChange={(e) => setNewRoom({ ...newRoom, availableCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទគ្រែ (ភាសាខ្មែរ)</label>
                  <input
                    type="text"
                    value={newRoom.bedTypeKm}
                    onChange={(e) => setNewRoom({ ...newRoom, bedTypeKm: e.target.value })}
                    placeholder="គ្រែឃីង ១ ឬ គ្រែទោល ២"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទគ្រែ (ភាសាអង់គ្លេស)</label>
                  <input
                    type="text"
                    value={newRoom.bedTypeEn}
                    onChange={(e) => setNewRoom({ ...newRoom, bedTypeEn: e.target.value })}
                    placeholder="1 King or 2 Twin Beds"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">មនុស្សចាស់ / ក្មេង (Pax)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      value={newRoom.capacityAdults}
                      onChange={(e) => setNewRoom({ ...newRoom, capacityAdults: parseInt(e.target.value) || 1 })}
                      className="w-1/2 bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-center"
                      title="Adults"
                    />
                    <span className="text-gray-400">/</span>
                    <input
                      type="number"
                      min={0}
                      value={newRoom.capacityChildren}
                      onChange={(e) => setNewRoom({ ...newRoom, capacityChildren: parseInt(e.target.value) || 0 })}
                      className="w-1/2 bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-center"
                      title="Children"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទទេសភាព (View)</label>
                  <input
                    type="text"
                    value={newRoom.viewTypeKm}
                    onChange={(e) => setNewRoom({ ...newRoom, viewTypeKm: e.target.value })}
                    placeholder="ទេសភាពទន្លេមេគង្គ"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">រូបភាពបន្ទប់ (Image Upload ឬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>ជ្រើសរើសរូបពីទូរស័ព្ទ...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (dataUrl) => setNewRoom({ ...newRoom, imageUrl: dataUrl }))}
                      />
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newRoom.imageUrl}
                      onChange={(e) => setNewRoom({ ...newRoom, imageUrl: e.target.value })}
                      placeholder="https://... ឬ Upload ផ្ទាល់"
                      className="flex-1 bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    {newRoom.imageUrl && (
                      <div className="w-12 h-10 rounded-lg border border-amber-300 overflow-hidden bg-gray-100 shrink-0">
                        <img src={newRoom.imageUrl} alt="Room Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">ការពិពណ៌នាពីបន្ទប់ (ភាសាខ្មែរ)</label>
                  <textarea
                    rows={2}
                    value={newRoom.descriptionKm || ""}
                    onChange={(e) => setNewRoom({ ...newRoom, descriptionKm: e.target.value })}
                    placeholder="ពិពណ៌នាពីចំណុចពិសេសនៃបន្ទប់..."
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-100"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "យល់ព្រមបន្ថែមបន្ទប់" : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 2: EDIT ROOM ======================= */}
      {isEditRoomModalOpen && editingRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-siemreap animate-in fade-in duration-200">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-mool text-base text-[#0c2340]">
                {lang === "km" ? "✏️ កែប្រែព័ត៌មានបន្ទប់" : "✏️ Edit Room"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditRoomModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះបន្ទប់ (ភាសាខ្មែរ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoom.nameKm}
                    onChange={(e) => setEditingRoom({ ...editingRoom, nameKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះបន្ទប់ (ភាសាអង់គ្លេស) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoom.nameEn}
                    onChange={(e) => setEditingRoom({ ...editingRoom, nameEn: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">តម្លៃ ($/យប់) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingRoom.basePrice}
                    onChange={(e) => setEditingRoom({ ...editingRoom, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">តម្លៃដើម ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingRoom.originalPrice}
                    onChange={(e) => setEditingRoom({ ...editingRoom, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ទំហំ (m²)</label>
                  <input
                    type="number"
                    min={10}
                    value={editingRoom.sizeSqm}
                    onChange={(e) => setEditingRoom({ ...editingRoom, sizeSqm: parseInt(e.target.value) || 30 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ចំនួនបន្ទប់សរុប (Units)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingRoom.availableCount}
                    onChange={(e) => setEditingRoom({ ...editingRoom, availableCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទគ្រែ (ភាសាខ្មែរ)</label>
                  <input
                    type="text"
                    value={editingRoom.bedTypeKm || ""}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedTypeKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទគ្រែ (ភាសាអង់គ្លេស)</label>
                  <input
                    type="text"
                    value={editingRoom.bedTypeEn || ""}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedTypeEn: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">រូបភាពបន្ទប់ (Image Upload ឬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>ជ្រើសរើសរូបថ្មី...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (dataUrl) => setEditingRoom({ ...editingRoom, imageUrl: dataUrl }))}
                      />
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingRoom.imageUrl}
                      onChange={(e) => setEditingRoom({ ...editingRoom, imageUrl: e.target.value })}
                      className="flex-1 bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    {editingRoom.imageUrl && (
                      <div className="w-12 h-10 rounded-lg border border-amber-300 overflow-hidden bg-gray-100 shrink-0">
                        <img src={editingRoom.imageUrl} alt="Room Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">ការពិពណ៌នាពីបន្ទប់ (ភាសាខ្មែរ)</label>
                  <textarea
                    rows={2}
                    value={editingRoom.descriptionKm || ""}
                    onChange={(e) => setEditingRoom({ ...editingRoom, descriptionKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditRoomModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-100"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "រក្សាទុកការកែប្រែ" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 3: ADD DINING ======================= */}
      {isAddDiningModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-siemreap animate-in fade-in duration-200">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-mool text-base text-[#0c2340]">
                {lang === "km" ? "➕ បន្ថែមភោជនីយដ្ឋាន / មុខម្ហូបថ្មី" : "➕ Add Dining Venue / Menu"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDiningModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDining} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះភោជនីយដ្ឋាន/ហាង (ខ្មែរ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDining.nameKm}
                    onChange={(e) => setNewDining({ ...newDining, nameKm: e.target.value })}
                    placeholder="ឧ. ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះភោជនីយដ្ឋាន/ហាង (អង់គ្លេស) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDining.nameEn}
                    onChange={(e) => setNewDining({ ...newDining, nameEn: e.target.value })}
                    placeholder="e.g. Mekong Breeze Restaurant"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទម្ហូប (ភាសាខ្មែរ)</label>
                  <input
                    type="text"
                    value={newDining.cuisineKm}
                    onChange={(e) => setNewDining({ ...newDining, cuisineKm: e.target.value })}
                    placeholder="ម្ហូបខ្មែរ & អន្តរជាតិ"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទម្ហូប (ភាសាអង់គ្លេស)</label>
                  <input
                    type="text"
                    value={newDining.cuisineEn}
                    onChange={(e) => setNewDining({ ...newDining, cuisineEn: e.target.value })}
                    placeholder="Khmer & International Cuisine"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ម៉ោងបើកបម្រើ</label>
                  <input
                    type="text"
                    value={newDining.hoursKm}
                    onChange={(e) => setNewDining({ ...newDining, hoursKm: e.target.value, hoursEn: e.target.value })}
                    placeholder="០៦:០០ - ២២:០០"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">កម្រិតតម្លៃ (Price Range)</label>
                  <input
                    type="text"
                    value={newDining.priceRangeUSD || "$$"}
                    onChange={(e) => setNewDining({ ...newDining, priceRangeUSD: e.target.value })}
                    placeholder="$$ - $$$ (ឧ. $10 - $50)"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">រូបភាពភោជនីយដ្ឋាន (Image Upload ឬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>ជ្រើសរើសរូបពីទូរស័ព្ទ...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (dataUrl) => setNewDining({ ...newDining, imageUrl: dataUrl }))}
                      />
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newDining.imageUrl}
                      onChange={(e) => setNewDining({ ...newDining, imageUrl: e.target.value })}
                      placeholder="https://... ឬ Upload រូបផ្ទាល់"
                      className="flex-1 bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    {newDining.imageUrl && (
                      <div className="w-12 h-10 rounded-lg border border-amber-300 overflow-hidden bg-gray-100 shrink-0">
                        <img src={newDining.imageUrl} alt="Dining Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">មុខម្ហូបល្បីៗ (បំបែកដោយសញ្ញាក្បៀស ,)</label>
                  <input
                    type="text"
                    value={
                      Array.isArray(newDining.signatureDishesKm)
                        ? newDining.signatureDishesKm.join(", ")
                        : typeof newDining.signatureDishesKm === "string"
                        ? newDining.signatureDishesKm
                        : ""
                    }
                    onChange={(e) => {
                      const list = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                      setNewDining({ ...newDining, signatureDishesKm: list, signatureDishesEn: list });
                    }}
                    placeholder="អាម៉ុកត្រីមេគង្គ, បង្កងទន្លេអាំង, សាច់គោអាំង"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">ការពិពណ៌នា (ភាសាខ្មែរ)</label>
                  <textarea
                    rows={2}
                    value={newDining.descriptionKm || ""}
                    onChange={(e) => setNewDining({ ...newDining, descriptionKm: e.target.value })}
                    placeholder="ពិពណ៌នាពីបរិយាកាស និងរសជាតិម្ហូប..."
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddDiningModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-100"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "យល់ព្រមបន្ថែម" : "Add Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 4: EDIT DINING ======================= */}
      {isEditDiningModalOpen && editingDining && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-siemreap animate-in fade-in duration-200">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-mool text-base text-[#0c2340]">
                {lang === "km" ? "✏️ កែប្រែព័ត៌មានភោជនីយដ្ឋាន/មុខម្ហូប" : "✏️ Edit Dining Venue / Menu"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditDiningModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDining} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះភោជនីយដ្ឋាន/ហាង (ខ្មែរ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDining.nameKm}
                    onChange={(e) => setEditingDining({ ...editingDining, nameKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះភោជនីយដ្ឋាន/ហាង (អង់គ្លេស) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDining.nameEn}
                    onChange={(e) => setEditingDining({ ...editingDining, nameEn: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទម្ហូប (ភាសាខ្មែរ)</label>
                  <input
                    type="text"
                    value={editingDining.cuisineKm}
                    onChange={(e) => setEditingDining({ ...editingDining, cuisineKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ម៉ោងបើកបម្រើ</label>
                  <input
                    type="text"
                    value={editingDining.hoursKm}
                    onChange={(e) => setEditingDining({ ...editingDining, hoursKm: e.target.value, hoursEn: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">កម្រិតតម្លៃ (Price Range)</label>
                  <input
                    type="text"
                    value={editingDining.priceRangeUSD || "$$"}
                    onChange={(e) => setEditingDining({ ...editingDining, priceRangeUSD: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">សម្លៀកបំពាក់ (Dress Code)</label>
                  <input
                    type="text"
                    value={editingDining.dressCodeKm || ""}
                    onChange={(e) => setEditingDining({ ...editingDining, dressCodeKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">រូបភាពភោជនីយដ្ឋាន (Image Upload ឬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>ជ្រើសរើសរូបថ្មី...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (dataUrl) => setEditingDining({ ...editingDining, imageUrl: dataUrl }))}
                      />
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingDining.imageUrl}
                      onChange={(e) => setEditingDining({ ...editingDining, imageUrl: e.target.value })}
                      className="flex-1 bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    {editingDining.imageUrl && (
                      <div className="w-12 h-10 rounded-lg border border-amber-300 overflow-hidden bg-gray-100 shrink-0">
                        <img src={editingDining.imageUrl} alt="Dining Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">មុខម្ហូបល្បីៗ (បំបែកដោយសញ្ញាក្បៀស ,)</label>
                  <input
                    type="text"
                    value={
                      Array.isArray(editingDining.signatureDishesKm)
                        ? editingDining.signatureDishesKm.join(", ")
                        : typeof editingDining.signatureDishesKm === "string"
                        ? editingDining.signatureDishesKm
                        : ""
                    }
                    onChange={(e) => {
                      const list = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                      setEditingDining({ ...editingDining, signatureDishesKm: list, signatureDishesEn: list });
                    }}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">ការពិពណ៌នា (ភាសាខ្មែរ)</label>
                  <textarea
                    rows={2}
                    value={editingDining.descriptionKm || ""}
                    onChange={(e) => setEditingDining({ ...editingDining, descriptionKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditDiningModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-100"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "រក្សាទុកការកែប្រែ" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 5: ADD DESTINATION ======================= */}
      {isAddDestModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-siemreap animate-in fade-in duration-200">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-mool text-base text-[#0c2340]">
                {lang === "km" ? "➕ បន្ថែមទីតាំងទេសចរណ៍ថ្មី" : "➕ Add New Destination"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDestModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDestination} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះទីតាំង (ភាសាខ្មែរ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDest.nameKm}
                    onChange={(e) => setNewDest({ ...newDest, nameKm: e.target.value })}
                    placeholder="ឧ. ភ្នំប្រុស ភ្នំស្រី"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះទីតាំង (ភាសាអង់គ្លេស) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDest.nameEn}
                    onChange={(e) => setNewDest({ ...newDest, nameEn: e.target.value })}
                    placeholder="e.g. Phnom Pros Phnom Srei"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទទីតាំង</label>
                  <select
                    value={newDest.category}
                    onChange={(e) => setNewDest({ ...newDest, category: e.target.value as any })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="culture-local-life">វប្បធម៌ & ជីវភាពអ្នកស្រុក (Culture)</option>
                    <option value="beaches-nature">ឆ្នេរខ្សាច់ & ធម្មជាតិ (Nature)</option>
                    <option value="sports-activities">កីឡា & ផ្សងព្រេង (Activities)</option>
                    <option value="restaurants">ភោជនីយដ្ឋាន & ម្ហូបអាហារ (Dining)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ចម្ងាយពីសណ្ឋាគារ (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDest.distanceKm}
                    onChange={(e) => setNewDest({ ...newDest, distanceKm: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={newDest.latitude}
                    onChange={(e) => setNewDest({ ...newDest, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={newDest.longitude}
                    onChange={(e) => setNewDest({ ...newDest, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">រូបភាពទីតាំង (Image Upload ឬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>ជ្រើសរើសរូបពីទូរស័ព្ទ...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (dataUrl) => setNewDest({ ...newDest, imageUrl: dataUrl }))}
                      />
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newDest.imageUrl}
                      onChange={(e) => setNewDest({ ...newDest, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... ឬ Upload រូបផ្ទាល់"
                      className="flex-1 bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    {newDest.imageUrl && (
                      <div className="w-12 h-10 rounded-lg border border-amber-300 overflow-hidden bg-gray-100 shrink-0">
                        <img src={newDest.imageUrl} alt="Dest Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Google Maps Link</label>
                  <input
                    type="url"
                    value={newDest.googleMapsUrl}
                    onChange={(e) => setNewDest({ ...newDest, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddDestModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-100"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "យល់ព្រមបន្ថែម" : "Add Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 6: EDIT DESTINATION ======================= */}
      {isEditDestModalOpen && editingDest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-siemreap animate-in fade-in duration-200">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-mool text-base text-[#0c2340]">
                {lang === "km" ? "✏️ កែប្រែទីតាំងទេសចរណ៍" : "✏️ Edit Destination"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditDestModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះទីតាំង (ភាសាខ្មែរ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDest.nameKm}
                    onChange={(e) => setEditingDest({ ...editingDest, nameKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ឈ្មោះទីតាំង (ភាសាអង់គ្លេស) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDest.nameEn}
                    onChange={(e) => setEditingDest({ ...editingDest, nameEn: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ប្រភេទទីតាំង</label>
                  <select
                    value={editingDest.category}
                    onChange={(e) => setEditingDest({ ...editingDest, category: e.target.value as any })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="culture-local-life">វប្បធម៌ & ជីវភាពអ្នកស្រុក (Culture)</option>
                    <option value="beaches-nature">ឆ្នេរខ្សាច់ & ធម្មជាតិ (Nature)</option>
                    <option value="sports-activities">កីឡា & ផ្សងព្រេង (Activities)</option>
                    <option value="restaurants">ភោជនីយដ្ឋាន & ម្ហូបអាហារ (Dining)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ចម្ងាយពីសណ្ឋាគារ (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingDest.distanceKm}
                    onChange={(e) => setEditingDest({ ...editingDest, distanceKm: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingDest.latitude}
                    onChange={(e) => setEditingDest({ ...editingDest, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingDest.longitude}
                    onChange={(e) => setEditingDest({ ...editingDest, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">រូបភាពទីតាំង (Image Upload ឬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>ជ្រើសរើសរូបថ្មី...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (dataUrl) => setEditingDest({ ...editingDest, imageUrl: dataUrl }))}
                      />
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingDest.imageUrl}
                      onChange={(e) => setEditingDest({ ...editingDest, imageUrl: e.target.value })}
                      className="flex-1 bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    {editingDest.imageUrl && (
                      <div className="w-12 h-10 rounded-lg border border-amber-300 overflow-hidden bg-gray-100 shrink-0">
                        <img src={editingDest.imageUrl} alt="Dest Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Google Maps Link</label>
                  <input
                    type="url"
                    value={editingDest.googleMapsUrl}
                    onChange={(e) => setEditingDest({ ...editingDest, googleMapsUrl: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditDestModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-100"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "រក្សាទុកការកែប្រែ" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
