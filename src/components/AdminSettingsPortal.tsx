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
  Database,
  HardDrive,
  RotateCcw,
  FileJson,
  Download,
  History,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { SiteSettings, RoomSetting, DestinationSetting, DiningItemSetting } from "@/lib/settings";
import { BackupSnapshot } from "@/lib/backupTypes";
import {
  recordClientAutoBackup,
  getClientBackupHistory,
  downloadSnapshotJson,
} from "@/lib/clientBackup";
import { BookingRecord } from "@/lib/bookings";

interface AdminSettingsPortalProps {
  lang: "km" | "en";
}

export const AdminSettingsPortal: React.FC<AdminSettingsPortalProps> = ({ lang }) => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const [formSettings, setFormSettings] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState<
    "general" | "banking" | "rooms" | "dining" | "destinations" | "features" | "telegram" | "backup"
  >("general");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [showApiToken, setShowApiToken] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);

  // Auto Backup & Snapshot States
  const [backupSnapshots, setBackupSnapshots] = useState<BackupSnapshot[]>([]);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const loadSnapshots = async () => {
    try {
      const localList = getClientBackupHistory();
      const res = await fetch("/api/backup?action=list");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.snapshots)) {
          const map = new Map<string, BackupSnapshot>();
          for (const s of localList) map.set(s.id, s);
          for (const s of data.snapshots) if (!map.has(s.id)) map.set(s.id, s);
          const combined = Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setBackupSnapshots(combined);
          return;
        }
      }
      setBackupSnapshots(localList);
    } catch (e) {
      setBackupSnapshots(getClientBackupHistory());
    }
  };

  useEffect(() => {
    if (activeTab === "backup") {
      loadSnapshots();
    }
  }, [activeTab]);

  const handleTakeInstantSnapshot = async () => {
    setIsTakingSnapshot(true);
    try {
      let clientBookings: BookingRecord[] = [];
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("vvotel_client_bookings");
        if (raw) clientBookings = JSON.parse(raw);
      }
      const snapshot = recordClientAutoBackup(
        formSettings,
        clientBookings,
        "manual",
        "áž€áž¶ážšáž”áž˜áŸ’ážšáž»áž„áž‘áž»áž€ážŠáŸ„áž™ážŠáŸƒ (Manual Snapshot ážŠáŸ„áž™ Manager)"
      );
      setBackupNotice({
        type: "success",
        msg: lang === "km" ? `áž”áž¶áž“áž”áž„áŸ’áž€áž¾áž Snapshot ážŠáŸ„áž™áž‡áŸ„áž‚áž‡áŸáž™! (${snapshot.id})` : `Snapshot created! (${snapshot.id})`,
      });
      await loadSnapshots();
    } catch (e) {
      setBackupNotice({ type: "error", msg: "Failed to take snapshot" });
    } finally {
      setIsTakingSnapshot(false);
      setTimeout(() => setBackupNotice(null), 5000);
    }
  };

  const handleDownloadFullBackup = () => {
    let clientBookings: BookingRecord[] = [];
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("vvotel_client_bookings");
      if (raw) clientBookings = JSON.parse(raw);
    }
    const snapshot = recordClientAutoBackup(
      formSettings,
      clientBookings,
      "manual",
      "Full Database JSON Export"
    );
    downloadSnapshotJson(snapshot);
  };

  const handleRestoreSnapshot = async (snapshot: BackupSnapshot) => {
    const confirmMsg = lang === "km"
      ? `ážáž¾áž¢áŸ’áž“áž€áž–áž·ážáž‡áž¶áž…áž„áŸ‹ážŸáŸ’ážŠáž¶ážšáž‘áž·áž“áŸ’áž“áž“áŸáž™áž–áž¸ Snapshot áž“áŸáŸ‡áž˜áŸ‚áž“áž‘áŸ? (${snapshot.timestamp})\náž”áž“áŸ’áž‘áž”áŸ‹: ${snapshot.stats.roomCount}, áž˜áŸ’áž áž¼áž”: ${snapshot.stats.diningCount}, áž‘áž¸ážáž¶áŸ†áž„: ${snapshot.stats.destinationCount}, áž€áž¶ážšáž€áž€áŸ‹: ${snapshot.stats.bookingCount}`
      : `Restore this backup snapshot from ${snapshot.timestamp}?`;
    if (!confirm(confirmMsg)) return;

    setIsRestoring(true);
    try {
      // 1. Restore settings in context & local state
      await updateSettings(snapshot.settings);
      setFormSettings(snapshot.settings);

      // 2. Restore bookings to localStorage
      if (Array.isArray(snapshot.bookings) && typeof window !== "undefined") {
        localStorage.setItem("vvotel_client_bookings", JSON.stringify(snapshot.bookings));
        window.dispatchEvent(new CustomEvent("vvotel-booking-updated"));
      }

      // 3. Inform server API
      await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", snapshot }),
      });

      setBackupNotice({
        type: "success",
        msg: lang === "km" ? "ðŸŽ‰ ážŸáŸ’ážŠáž¶ážšáž‘áž·áž“áŸ’áž“áž“áŸáž™áž”áž¶áž“áž‡áŸ„áž‚áž‡áŸáž™áž–áŸáž‰áž›áŸáž‰!" : "ðŸŽ‰ Data successfully restored!",
      });
      await refreshSettings();
      await loadSnapshots();
    } catch (e) {
      setBackupNotice({ type: "error", msg: "Error restoring snapshot" });
    } finally {
      setIsRestoring(false);
      setTimeout(() => setBackupNotice(null), 5000);
    }
  };

  const handleUploadBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed: BackupSnapshot = JSON.parse(text);
        if (!parsed.settings) {
          alert(lang === "km" ? "áž¯áž€ážŸáž¶ážšáž“áŸáŸ‡áž˜áž·áž“áž˜áŸ‚áž“áž‡áž¶áž‘áž˜áŸ’ážšáž„áŸ‹ Backup ážáŸ’ážšáž¹áž˜ážáŸ’ážšáž¼ážœáž‘áŸ!" : "Invalid backup file format");
          return;
        }
        await handleRestoreSnapshot(parsed);
      } catch (err) {
        alert("Error parsing backup JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Client-Side Image Upload with Canvas Compression
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(lang === "km" ? "ážŸáž¼áž˜áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸáž¯áž€ážŸáž¶ážšážšáž¼áž”áž—áž¶áž– (JPG, PNG, WebP)" : "Please select an image file (JPG, PNG, WebP)");
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
    categoryKm: "áž”áŸ’ážšážŽáž¸ážáž—áž¶áž–",
    categoryEn: "Luxury",
    basePrice: 95,
    originalPrice: 120,
    sizeSqm: 38,
    bedTypeKm: "áž‚áŸ’ážšáŸ‚ážƒáž¸áž„ áŸ¡ áž¬áž‚áŸ’ážšáŸ‚áž‘áŸ„áž› áŸ¢",
    bedTypeEn: "1 King or 2 Twin Beds",
    capacityAdults: 2,
    capacityChildren: 1,
    availableCount: 8,
    viewKm: "áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚",
    viewEn: "Mekong River View",
    viewTypeKm: "áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚",
    viewTypeEn: "Mekong River View",
    imageUrl: "/images/rooms/vv_deluxe_double.jpg",
    descriptionKm: "áž”áž“áŸ’áž‘áž”áŸ‹áž”áŸ’ážšážŽáž¸ážáž”áŸ†áž–áž¶áž€áŸ‹áž‚áŸ’ážšáž¿áž„ážŸáž„áŸ’áž áž¶ážšáž·áž˜áž‘áŸ†áž“áž¾áž” áž“áž·áž„áž˜áž¶áž“áž™áŸ‰ážšáž‚áž™áž‚áž“áŸ‹áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚áŸ”",
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
    const updated = [...formSettings.rooms];
    updated[editingRoomIndex] = {
      ...editingRoom,
      viewKm: editingRoom.viewKm || editingRoom.viewTypeKm || "áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚",
      viewEn: editingRoom.viewEn || editingRoom.viewTypeEn || "Mekong River View",
    };
    const nextSettings = { ...formSettings, rooms: updated };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
    setIsEditRoomModalOpen(false);
    setEditingRoom(null);
    setEditingRoomIndex(null);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.nameKm || !newRoom.nameEn) {
      alert(lang === "km" ? "ážŸáž¼áž˜áž”áž‰áŸ’áž…áž¼áž›ážˆáŸ’áž˜áŸ„áŸ‡áž”áž“áŸ’áž‘áž”áŸ‹áž‘áž¶áŸ†áž„ážáŸ’áž˜áŸ‚ážš áž“áž·áž„áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ" : "Please enter room names");
      return;
    }
    const roomId = newRoom.id || newRoom.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const roomToAdd: RoomSetting = {
      ...newRoom,
      id: roomId,
      viewKm: newRoom.viewKm || newRoom.viewTypeKm || "áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚",
      viewEn: newRoom.viewEn || newRoom.viewTypeEn || "Mekong River View",
    };
    const nextSettings = {
      ...formSettings,
      rooms: [...formSettings.rooms, roomToAdd],
    };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
    setIsAddRoomModalOpen(false);
    setNewRoom({
      id: "",
      nameKm: "",
      nameEn: "",
      categoryKm: "áž”áŸ’ážšážŽáž¸ážáž—áž¶áž–",
      categoryEn: "Luxury",
      basePrice: 95,
      originalPrice: 120,
      sizeSqm: 38,
      bedTypeKm: "áž‚áŸ’ážšáŸ‚ážƒáž¸áž„ áŸ¡ áž¬áž‚áŸ’ážšáŸ‚áž‘áŸ„áž› áŸ¢",
      bedTypeEn: "1 King or 2 Twin Beds",
      capacityAdults: 2,
      capacityChildren: 1,
      availableCount: 8,
      viewKm: "áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚",
      viewEn: "Mekong River View",
      viewTypeKm: "áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚",
      viewTypeEn: "Mekong River View",
      imageUrl: "/images/rooms/vv_deluxe_double.jpg",
      descriptionKm: "áž”áž“áŸ’áž‘áž”áŸ‹áž”áŸ’ážšážŽáž¸ážáž”áŸ†áž–áž¶áž€áŸ‹áž‚áŸ’ážšáž¿áž„ážŸáž„áŸ’áž áž¶ážšáž·áž˜áž‘áŸ†áž“áž¾áž” áž“áž·áž„áž˜áž¶áž“áž™áŸ‰ážšáž‚áž™áž‚áž“áŸ‹áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚áŸ”",
      descriptionEn: "Modern luxury room with private balcony overlooking the Mekong River.",
      enabled: true,
    });
  };

  const handleDeleteRoom = (index: number) => {
    const room = formSettings.rooms[index];
    if (!confirm(lang === "km" ? `ážáž¾áž¢áŸ’áž“áž€áž–áž·ážáž‡áž¶áž…áž„áŸ‹áž›áž»áž”áž”áž“áŸ’áž‘áž”áŸ‹ "${room.nameKm}" áž˜áŸ‚áž“áž‘áŸ?` : `Delete room "${room.nameEn}"?`)) return;
    const nextSettings = {
      ...formSettings,
      rooms: formSettings.rooms.filter((_, i) => i !== index),
    };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
  };

  // ======================= DINING CRUD STATE =======================
  const [isAddDiningModalOpen, setIsAddDiningModalOpen] = useState(false);
  const [newDining, setNewDining] = useState<DiningItemSetting>({
    id: "",
    nameKm: "",
    nameEn: "",
    cuisineKm: "áž˜áŸ’áž áž¼áž”ážáŸ’áž˜áŸ‚ážš & áž¢áž“áŸ’ážážšáž‡áž¶ážáž·",
    cuisineEn: "Khmer & International Cuisine",
    hoursKm: "áŸ áŸ¦:áŸ áŸ  - áŸ¢áŸ¢:áŸ áŸ ",
    hoursEn: "06:00 - 22:00 Daily",
    dressCodeKm: "ážŸáž˜áŸ’áž›áŸ€áž€áž”áŸ†áž–áž¶áž€áŸ‹ážŸáž˜ážšáž˜áŸ’áž™",
    dressCodeEn: "Smart Casual",
    priceRangeUSD: "$$ - $$$",
    taglineKm: "ážšážŸáž‡áž¶ážáž·áž”áŸ’ážšážŽáž¸ážáž˜áž¶ážáŸ‹áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚",
    taglineEn: "Riverside fine dining experience",
    descriptionKm: "áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“áž•áŸ’ážáž›áŸ‹áž‡áž¼áž“áž˜áŸ’áž áž¼áž”áž†áŸ’áž„áž¶áž‰áŸ‹áŸ— áž“áž·áž„ážŸáŸ’ážšážŸáŸ‹áŸ— ážšáž½áž˜áž‡áž¶áž˜áž½áž™áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚ážŠáŸážŸáŸ’ážšážŸáŸ‹áž”áŸ†áž–áŸ’ážšáž„áŸ”",
    descriptionEn: "Offering gourmet dishes and fresh local flavors overlooking the majestic Mekong River.",
    signatureDishesKm: ["áž¢áž¶áž˜áŸ‰áž»áž€ážáŸ’ážšáž¸áž˜áŸáž‚áž„áŸ’áž‚", "áž”áž„áŸ’áž€áž„áž¢áž¶áŸ†áž„áž‘áž¹áž€ážáŸ’ážšáž¸áž€áŸ„áŸ‡áž€áž»áž„"],
    signatureDishesEn: ["Mekong Fish Amok", "Grilled River Lobster"],
    imageUrl: "/images/rooms/vv_room_interior_1.jpg",
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
    const updated = [...(formSettings.dining || [])];
    updated[editingDiningIndex] = editingDining;
    const nextSettings = { ...formSettings, dining: updated };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
    setIsEditDiningModalOpen(false);
    setEditingDining(null);
    setEditingDiningIndex(null);
  };

  const handleAddDining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDining.nameKm || !newDining.nameEn) {
      alert(lang === "km" ? "ážŸáž¼áž˜áž”áž‰áŸ’áž…áž¼áž›ážˆáŸ’áž˜áŸ„áŸ‡áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“/áž˜áž»ážáž˜áŸ’áž áž¼áž”áž‘áž¶áŸ†áž„ážáŸ’áž˜áŸ‚ážš áž“áž·áž„áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ" : "Please enter venue names");
      return;
    }
    const diningId = newDining.id || newDining.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const diningToAdd: DiningItemSetting = {
      ...newDining,
      id: diningId,
    };
    const nextSettings = {
      ...formSettings,
      dining: [...(formSettings.dining || []), diningToAdd],
    };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
    setIsAddDiningModalOpen(false);
    setNewDining({
      id: "",
      nameKm: "",
      nameEn: "",
      cuisineKm: "áž˜áŸ’áž áž¼áž”ážáŸ’áž˜áŸ‚ážš & áž¢áž“áŸ’ážážšáž‡áž¶ážáž·",
      cuisineEn: "Khmer & International Cuisine",
      hoursKm: "áŸ áŸ¦:áŸ áŸ  - áŸ¢áŸ¢:áŸ áŸ ",
      hoursEn: "06:00 - 22:00 Daily",
      dressCodeKm: "ážŸáž˜áŸ’áž›áŸ€áž€áž”áŸ†áž–áž¶áž€áŸ‹ážŸáž˜ážšáž˜áŸ’áž™",
      dressCodeEn: "Smart Casual",
      priceRangeUSD: "$$ - $$$",
      taglineKm: "ážšážŸáž‡áž¶ážáž·áž”áŸ’ážšážŽáž¸ážáž˜áž¶ážáŸ‹áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚",
      taglineEn: "Riverside fine dining experience",
      descriptionKm: "áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“áž•áŸ’ážáž›áŸ‹áž‡áž¼áž“áž˜áŸ’áž áž¼áž”áž†áŸ’áž„áž¶áž‰áŸ‹áŸ— áž“áž·áž„ážŸáŸ’ážšážŸáŸ‹áŸ— ážšáž½áž˜áž‡áž¶áž˜áž½áž™áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚ážŠáŸážŸáŸ’ážšážŸáŸ‹áž”áŸ†áž–áŸ’ážšáž„áŸ”",
      descriptionEn: "Offering gourmet dishes and fresh local flavors overlooking the majestic Mekong River.",
      signatureDishesKm: ["áž¢áž¶áž˜áŸ‰áž»áž€ážáŸ’ážšáž¸áž˜áŸáž‚áž„áŸ’áž‚", "áž”áž„áŸ’áž€áž„áž¢áž¶áŸ†áž„áž‘áž¹áž€ážáŸ’ážšáž¸áž€áŸ„áŸ‡áž€áž»áž„"],
      signatureDishesEn: ["Mekong Fish Amok", "Grilled River Lobster"],
      imageUrl: "/images/rooms/vv_room_interior_1.jpg",
      enabled: true,
    });
  };

  const handleDeleteDining = (index: number) => {
    const venue = (formSettings.dining || [])[index];
    if (!confirm(lang === "km" ? `ážáž¾áž¢áŸ’áž“áž€áž–áž·ážáž‡áž¶áž…áž„áŸ‹áž›áž»áž” "${venue.nameKm}" áž˜áŸ‚áž“áž‘áŸ?` : `Delete venue "${venue.nameEn}"?`)) return;
    const nextSettings = {
      ...formSettings,
      dining: (formSettings.dining || []).filter((_, i) => i !== index),
    };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
  };

  const handleToggleDining = (index: number) => {
    const updated = [...(formSettings.dining || [])];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    const nextSettings = { ...formSettings, dining: updated };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
  };

  // ======================= DESTINATIONS CRUD STATE =======================
  const [isAddDestModalOpen, setIsAddDestModalOpen] = useState(false);
  const [newDest, setNewDest] = useState<Partial<DestinationSetting>>({
    nameKm: "",
    nameEn: "",
    category: "culture-local-life",
    categoryNameKm: "ážœáž”áŸ’áž”áž’áž˜áŸŒ & áž‡áž¸ážœáž—áž¶áž–áž¢áŸ’áž“áž€ážŸáŸ’ážšáž»áž€",
    categoryNameEn: "Culture & Local Life",
    distanceKm: 2.5,
    travelTimeMinutes: 8,
    latitude: 11.9924,
    longitude: 105.4645,
    taglineKm: "",
    taglineEn: "",
    descriptionKm: "",
    descriptionEn: "",
    imageUrl: "/images/destinations/bamboo-bridge.jpg",
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
    const updated = formSettings.destinations.map((d) => (d.id === editingDestId ? editingDest : d));
    const nextSettings = { ...formSettings, destinations: updated };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
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
    setFormSettings((prev) => {
      const nextSettings = {
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: !prev.features[featureKey],
        },
      };
      updateSettings(nextSettings);
      return nextSettings;
    });
  };

  // Room item updater
  const handleRoomChange = (index: number, field: keyof RoomSetting, value: any) => {
    setFormSettings((prev) => {
      const updatedRooms = [...prev.rooms];
      updatedRooms[index] = {
        ...updatedRooms[index],
        [field]: value,
      };
      const nextSettings = {
        ...prev,
        rooms: updatedRooms,
      };
      updateSettings(nextSettings);
      return nextSettings;
    });
  };

  // Destination item updater
  const handleDestinationToggle = (id: number) => {
    const nextSettings = {
      ...formSettings,
      destinations: formSettings.destinations.map((d) =>
        d.id === id ? { ...d, enabled: !d.enabled } : d
      ),
    };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
  };

  const handleDeleteDestination = (id: number) => {
    if (!confirm(lang === "km" ? "ážáž¾áž¢áŸ’áž“áž€áž–áž·ážáž‡áž¶áž…áž„áŸ‹áž›áž»áž”áž‘áž¸ážáž¶áŸ†áž„áž“áŸáŸ‡áž˜áŸ‚áž“áž‘áŸ?" : "Delete this destination?")) return;
    const nextSettings = {
      ...formSettings,
      destinations: formSettings.destinations.filter((d) => d.id !== id),
    };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);
  };

  // Add new destination submit
  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.nameKm || !newDest.nameEn) {
      alert(lang === "km" ? "ážŸáž¼áž˜áž”áž‰áŸ’áž…áž¼áž›ážˆáŸ’áž˜áŸ„áŸ‡áž‘áž¸ážáž¶áŸ†áž„áž‘áž¶áŸ†áž„áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš áž“áž·áž„áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ" : "Please enter location names");
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
      categoryNameKm: newDest.category === "beaches-nature" ? "áž†áŸ’áž“áŸážšážáŸ’ážŸáž¶áž…áŸ‹ & áž’áž˜áŸ’áž˜áž‡áž¶ážáž·" :
        newDest.category === "sports-activities" ? "áž€áž¸áž¡áž¶ & ážŸáž€áž˜áŸ’áž˜áž—áž¶áž–áž•áŸ’ážŸáž„áž–áŸ’ážšáŸáž„" :
        newDest.category === "restaurants" ? "áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ & áž˜áŸ’áž áž¼áž”áž¢áž¶áž áž¶ážš" : "ážœáž”áŸ’áž”áž’áž˜áŸŒ & áž‡áž¸ážœáž—áž¶áž–áž¢áŸ’áž“áž€ážŸáŸ’ážšáž»áž€",
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
      imageUrl: newDest.imageUrl || "/images/destinations/bamboo-bridge.jpg",
      googleMapsUrl: newDest.googleMapsUrl || `https://maps.google.com/?q=${newDest.latitude || 11.9924},${newDest.longitude || 105.4645}`,
      enabled: true,
    };

    const nextSettings = {
      ...formSettings,
      destinations: [...formSettings.destinations, completeDest],
    };
    setFormSettings(nextSettings);
    updateSettings(nextSettings);

    setIsAddDestModalOpen(false);
    // Reset form
    setNewDest({
      nameKm: "",
      nameEn: "",
      category: "culture-local-life",
      categoryNameKm: "ážœáž”áŸ’áž”áž’áž˜áŸŒ & áž‡áž¸ážœáž—áž¶áž–áž¢áŸ’áž“áž€ážŸáŸ’ážšáž»áž€",
      categoryNameEn: "Culture & Local Life",
      distanceKm: 2.5,
      travelTimeMinutes: 8,
      latitude: 11.9924,
      longitude: 105.4645,
      taglineKm: "",
      taglineEn: "",
      descriptionKm: "",
      descriptionEn: "",
      imageUrl: "/images/destinations/bamboo-bridge.jpg",
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
            ? "âœ… áž€áž¶ážšáž€áŸ†ážŽážáŸ‹ážáŸ’ážšáž¼ážœáž”áž¶áž“ážšáž€áŸ’ážŸáž¶áž‘áž»áž€ áž“áž·áž„ sync áž‘áŸ…áž€áž¶áž“áŸ‹áž‚áŸáž áž‘áŸ†áž–áŸážšáž‘áž¶áŸ†áž„áž˜áž¼áž›ážŠáŸ„áž™áž‡áŸ„áž‚áž‡áŸáž™!"
            : "âœ… Settings successfully saved and synchronized across the entire website!"
        );
        setTimeout(() => setSaveSuccessMsg(""), 6000);
      } else {
        alert(lang === "km" ? "áž˜áž·áž“áž¢áž¶áž…ážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž€áž¶ážšáž€áŸ†ážŽážáŸ‹áž”áž¶áž“áž‘áŸ ážŸáž¼áž˜áž–áŸ’áž™áž¶áž™áž¶áž˜áž˜áŸ’ážáž„áž‘áŸ€áž" : "Failed to save settings");
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
              <h2 className="font-siemreap font-bold text-lg sm:text-xl text-[#0c2340]">
                {lang === "km" ? "áž€áž¶ážšáž€áŸ†ážŽážáŸ‹áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš VVotel" : "VVotel System Settings Portal"}
              </h2>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Dynamic Sync
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "áž€áŸ†ážŽážáŸ‹áž–áŸážáŸŒáž˜áž¶áž“ Logo, áž’áž“áž¶áž‚áž¶ážš KHQR, ážáž˜áŸ’áž›áŸƒáž”áž“áŸ’áž‘áž”áŸ‹, áž‘áž¸ážáž¶áŸ†áž„áž‘áŸážŸáž…ážšážŽáŸ áž“áž·áž„áž˜áž»ážáž„áž¶ážšážœáŸáž”ážŸáž¶áž™áž‘áž¶áŸ†áž„áž¢ážŸáŸ‹"
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
                ? (lang === "km" ? "áž€áŸ†áž–áž»áž„ážšáž€áŸ’ážŸáž¶áž‘áž»áž€..." : "Saving...")
                : (lang === "km" ? "ážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž€áž¶ážšáž€áŸ†ážŽážáŸ‹áž‘áž¶áŸ†áž„áž¢ážŸáŸ‹ (Save All)" : "Save All Settings")}
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
          { key: "general", labelKm: "ðŸ¨ áž–áŸážáŸŒáž˜áž¶áž“áž‘áž¼áž‘áŸ… & Logo", labelEn: "ðŸ¨ General & Logo" },
          { key: "banking", labelKm: "ðŸ¦ áž’áž“áž¶áž‚áž¶ážš & Bakong KHQR", labelEn: "ðŸ¦ Banking & KHQR" },
          { key: "rooms", labelKm: "ðŸ›ï¸ áž”áž“áŸ’áž‘áž”áŸ‹ & ážáž˜áŸ’áž›áŸƒážŸáŸ’áž“áž¶áž€áŸ‹áž“áŸ…", labelEn: "ðŸ›ï¸ Rooms & Pricing" },
          { key: "dining", labelKm: "ðŸ½ï¸ áž¢áž¶áž áž¶ážš & áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“", labelEn: "ðŸ½ï¸ Dining & Venues" },
          { key: "destinations", labelKm: "ðŸ—ºï¸ áž‘áž¸ážáž¶áŸ†áž„áž‘áŸážŸáž…ážšážŽáŸ & áž•áŸ‚áž“áž‘áž¸", labelEn: "ðŸ—ºï¸ Destinations & Map" },
          { key: "features", labelKm: "ðŸŽ›ï¸ áž”áž¾áž€/áž”áž·áž‘ áž˜áž»ážáž„áž¶ážšáž”áŸ’ážšáž–áŸáž“áŸ’áž’", labelEn: "ðŸŽ›ï¸ Feature Toggles" },
          { key: "telegram", labelKm: "ðŸ¤– Telegram Bot", labelEn: "ðŸ¤– Telegram Bot" },
          { key: "backup", labelKm: "ðŸ’¾ áž”áž˜áŸ’ážšáž»áž„áž‘áž»áž€ & ážŸáŸ’ážŠáž¶ážš (Auto Backup)", labelEn: "ðŸ’¾ Auto Backup & Restore" },
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
            <h3 className="font-siemreap font-bold text-base sm:text-lg text-[#0c2340]">
              {lang === "km" ? "áž–áŸážáŸŒáž˜áž¶áž“áž¢ážáŸ’ážážŸáž‰áŸ’áž‰áž¶ážŽážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš & Logo" : "Hotel Branding, Contact & Logo"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "áž–áŸážáŸŒáž˜áž¶áž“áž‘áž¶áŸ†áž„áž“áŸáŸ‡áž“áž¹áž„áž”áž„áŸ’áž áž¶áž‰áž“áŸ…áž›áž¾ Header, Footer, Hero, áž“áž·áž„ážšáž”áž¶áž™áž€áž¶ážšážŽáŸážšážŠáŸ’áž‹áž”áž¶áž›áž‘áž¶áŸ†áž„áž¢ážŸáŸ‹áŸ”"
                : "These properties are rendered on the Header, Footer, Hero, and Official Reports."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotel Name KM */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "ážˆáŸ’áž˜áŸ„áŸ‡ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš):" : "Hotel Name (Khmer):"}
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
                {lang === "km" ? "ážˆáŸ’áž˜áŸ„áŸ‡ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ):" : "Hotel Name (English):"}
              </label>
              <input
                type="text"
                value={formSettings.hotelNameEn}
                onChange={(e) => handleFieldChange("hotelNameEn", e.target.value)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Admin Portal Title KM */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "áž…áŸ†ážŽáž„áž‡áž¾áž„ Admin Portal (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš):" : "Admin Portal Title (Khmer):"}
              </label>
              <input
                type="text"
                value={formSettings.adminPortalTitleKm || ""}
                onChange={(e) => handleFieldChange("adminPortalTitleKm", e.target.value)}
                placeholder="áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš áž“áž·áž„áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ VVotel"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-siemreap"
              />
            </div>

            {/* Admin Portal Title EN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "áž…áŸ†ážŽáž„áž‡áž¾áž„ Admin Portal (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ):" : "Admin Portal Title (English):"}
              </label>
              <input
                type="text"
                value={formSettings.adminPortalTitleEn || ""}
                onChange={(e) => handleFieldChange("adminPortalTitleEn", e.target.value)}
                placeholder="VVotel Central PMS Admin Portal"
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tagline KM */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "áž–áž¶áž€áŸ’áž™ážŸáŸ’áž›áŸ„áž€/Tagline (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš):" : "Hotel Tagline (Khmer):"}
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
                {lang === "km" ? "áž–áž¶áž€áŸ’áž™ážŸáŸ’áž›áŸ„áž€/Tagline (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ):" : "Hotel Tagline (English):"}
              </label>
              <input
                type="text"
                value={formSettings.hotelTaglineEn}
                onChange={(e) => handleFieldChange("hotelTaglineEn", e.target.value)}
                className="w-full bg-[#FAF8F4] border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Logo Text & Image Upload Section */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl border-2 border-amber-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {lang === "km" ? "áž¢áž€áŸ’ážŸážš Logo ážŸáž„áŸ’ážáŸáž” (Logo Text Badge):" : "Logo Text Badge:"}
                </label>
                <input
                  type="text"
                  value={formSettings.logoText}
                  onChange={(e) => handleFieldChange("logoText", e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 font-bold"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  {lang === "km" ? "áž”áž„áŸ’áž áž¶áž‰áž‡áŸ†áž“áž½ážŸáž–áŸáž›áž‚áŸ’áž˜áž¶áž“ážšáž¼áž”áž—áž¶áž– (áž§. VVOTEL)" : "Used as fallback badge if no image"}
                </p>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="block text-xs font-bold text-gray-700">
                  {lang === "km"
                    ? "ážšáž¼áž”áž—áž¶áž– Logo ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš & Admin (áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”áž—áž¶áž–áž–áž¸áž‘áž¼ážšážŸáŸáž–áŸ’áž‘ / áž€áž»áŸ†áž–áŸ’áž™áž¼áž‘áŸážš áž¬ URL):"
                    : "Official Hotel & Admin Logo (Upload from Phone/PC or paste URL):"}
                </label>

                {/* Prominent Direct Upload Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="cursor-pointer flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-dashed border-amber-400 bg-white hover:bg-amber-50 hover:border-amber-600 transition text-xs font-bold text-amber-950 shadow-xs group">
                    <Upload className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
                    <span>
                      {lang === "km"
                        ? "ðŸ“ áž…áž»áž…ážáŸ’ážšáž„áŸ‹áž“áŸáŸ‡ážŠáž¾áž˜áŸ’áž”áž¸áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”áž—áž¶áž– Logo (Upload File)"
                        : "ðŸ“ Click here to Upload Logo Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (dataUrl) => {
                          const updated = { ...formSettings, logoImageUrl: dataUrl };
                          setFormSettings(updated);
                          updateSettings(updated);
                        })
                      }
                    />
                  </label>

                  {/* Logo Preview & Clear */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {formSettings.logoImageUrl ? (
                      <div className="w-14 h-14 rounded-xl border-2 border-amber-300 overflow-hidden bg-white p-1 shadow-sm flex items-center justify-center">
                        <img
                          src={formSettings.logoImageUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => ((e.target as any).style.display = "none")}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl border-2 border-amber-300 overflow-hidden bg-white p-1 shadow-sm flex items-center justify-center">
                        <img
                          src="/icons/icon-192.png?v=2"
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {formSettings.logoImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...formSettings, logoImageUrl: "" };
                          setFormSettings(updated);
                          updateSettings(updated);
                        }}
                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition"
                        title={lang === "km" ? "áž›áž»áž”ážšáž¼áž”áž—áž¶áž–" : "Clear Logo"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional URL Input */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="áž¬ áž”áž‰áŸ’áž…áž¼áž›ážáŸ†ážŽáž—áŸ’áž‡áž¶áž”áŸ‹ URL (https://.../logo.png)"
                    value={formSettings.logoImageUrl}
                    onChange={(e) => handleFieldChange("logoImageUrl", e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Contact Phone & Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "áž›áŸážáž‘áž¼ážšážŸáŸáž–áŸ’áž‘áž•áŸ’áž›áž¼ážœáž€áž¶ážš:" : "Official Phone Number:"}
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
                {lang === "km" ? "áž¢áŸŠáž¸áž˜áŸ‚áž›áž•áŸ’áž›áž¼ážœáž€áž¶ážš:" : "Official Email Address:"}
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
                {lang === "km" ? "áž¢áž¶ážŸáž™ážŠáŸ’áž‹áž¶áž“ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš):" : "Address (Khmer):"}
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
                {lang === "km" ? "áž¢áž¶ážŸáž™ážŠáŸ’áž‹áž¶áž“ (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ):" : "Address (English):"}
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
                {lang === "km" ? "áž€áž¼áž¢ážšážŠáŸ„áž“áŸ Latitude (GPS):" : "Latitude (GPS):"}
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
                {lang === "km" ? "áž€áž¼áž¢ážšážŠáŸ„áž“áŸ Longitude (GPS):" : "Longitude (GPS):"}
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
            <h3 className="font-siemreap font-bold text-base sm:text-lg text-[#0c2340]">
              {lang === "km" ? "áž€áž¶ážšáž€áŸ†ážŽážáŸ‹áž€áž»áž„áž’áž“áž¶áž‚áž¶ážš & áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž‘áž¼áž‘áž¶ážáŸ‹ Bakong KHQR" : "Banking & Bakong KHQR Gateway"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "áž€áŸ†ážŽážáŸ‹áž‚ážŽáž“áž¸áž’áž“áž¶áž‚áž¶ážšáž‘áž‘áž½áž›áž”áŸ’ážšáž¶áž€áŸ‹ áž“áž·áž„áž”áž¾áž€ážŠáŸ†ážŽáž¾ážšáž€áž¶ážšáž˜áž»ážáž„áž¶ážšáž•áŸ’áž‘áŸ€áž„áž•áŸ’áž‘áž¶ážáŸ‹áž›áž»áž™áž…áž¼áž›áž€áž»áž„áž–áž·ážáž”áŸ’ážšáž¶áž€ážŠáž˜áž»áž“áž–áŸáž›áž€áž€áŸ‹"
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
                  <h4 className="font-siemreap font-bold text-[#0c2340] text-sm sm:text-base">
                    {lang === "km"
                      ? "ážáŸ’ážšáž½ážáž–áž·áž“áž·ážáŸ’áž™áž”áŸ’ážšáž¶áž€áŸ‹áž…áž¼áž›áž€áž»áž„áž–áž·ážáž”áŸ’ážšáž¶áž€ážŠ (Strict Real-time Bank Check)"
                      : "Strict Real-time Bank Verification (NBC Bakong)"}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formSettings.strictBakongVerification
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {formSettings.strictBakongVerification ? "Active (ážáž¹áž„ážšáŸ‰áž¹áž„)" : "Off"}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {lang === "km"
                    ? "áž“áŸ…áž–áŸáž›áž”áž¾áž€áŸ– áž—áŸ’áž‰áŸ€ážœážáŸ’ážšáž¼ážœážáŸ‚áž”áž¶áž‰áŸ‹áž”áŸ’ážšáž¶áž€áŸ‹áž…áž¼áž›áž€áž»áž„áž’áž“áž¶áž‚áž¶ážšáž–áž·ážáž”áŸ’ážšáž¶áž€ážŠ áž‘áž¾áž”áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž¢áž“áž»áž‰áŸ’áž‰áž¶ážáž±áŸ’áž™ verify áž“áž·áž„áž…áŸáž‰ážœáž·áž€áŸ’áž€áž™áž”ážáŸ’ážšáž€áž€áŸ‹ážšáž½áž…ážšáž¶áž›áŸ‹ ážŠáŸ„áž™ážŸáŸ’ážœáŸáž™áž”áŸ’ážšážœážáŸ’ážáž·ážáž¶áž˜ážšáž™áŸˆ NBC Bakong OpenAPI MD5 Hash check!"
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
              <span>{formSettings.strictBakongVerification ? "âœ“ áž”áž¶áž“áž”áž¾áž€ (Enabled)" : "áž”áž·áž‘ (Disabled)"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Bank Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === "km" ? "ážˆáŸ’áž˜áŸ„áŸ‡áž’áž“áž¶áž‚áž¶ážš (Bank Name):" : "Bank Name:"}
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
                {lang === "km" ? "ážˆáŸ’áž˜áŸ„áŸ‡áž˜áŸ’áž…áž¶ážŸáŸ‹áž‚ážŽáž“áž¸ (Account Name):" : "Account Holder Name:"}
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
                {lang === "km" ? "áž›áŸážáž€áž»áž„áž’áž“áž¶áž‚áž¶ážš (Account Number):" : "Account Number:"}
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
                {lang === "km" ? "Bakong Merchant ID (áž”áž¾áž˜áž¶áž“):" : "Merchant ID:"}
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
            <div className="md:col-span-2 p-5 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl border-2 border-amber-200 space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                {lang === "km"
                  ? "ážšáž¼áž”áž—áž¶áž– QR Code áž•áŸ’áž‘áž¶áž›áŸ‹ážáŸ’áž›áž½áž“ (áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”áž—áž¶áž–áž–áž¸áž‘áž¼ážšážŸáŸáž–áŸ’áž‘ / áž€áž»áŸ†áž–áŸ’áž™áž¼áž‘áŸážš áž¬ áž”áž‰áŸ’áž…áž¼áž› URL):"
                  : "Custom QR Code Image (Upload from Phone/PC or paste URL):"}
              </label>

              {/* Prominent Direct Upload Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label className="cursor-pointer flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-dashed border-amber-400 bg-white hover:bg-amber-50 hover:border-amber-600 transition text-xs font-bold text-amber-950 shadow-xs group">
                  <Upload className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span>
                    {lang === "km"
                      ? "ðŸ“ áž…áž»áž…ážáŸ’ážšáž„áŸ‹áž“áŸáŸ‡ážŠáž¾áž˜áŸ’áž”áž¸áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”áž—áž¶áž– QR Code (Upload File)"
                      : "ðŸ“ Click here to Upload QR Code Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(e, (dataUrl) => {
                        const updated = { ...formSettings, qrCustomImageUrl: dataUrl };
                        setFormSettings(updated);
                        updateSettings(updated);
                      })
                    }
                  />
                </label>

                {/* QR Preview & Clear */}
                <div className="flex items-center space-x-2 shrink-0">
                  {formSettings.qrCustomImageUrl ? (
                    <div className="w-16 h-16 bg-white rounded-xl border-2 border-amber-300 p-1 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={formSettings.qrCustomImageUrl}
                        alt="Custom QR Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : null}

                  {formSettings.qrCustomImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...formSettings, qrCustomImageUrl: "" };
                        setFormSettings(updated);
                        updateSettings(updated);
                      }}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition shrink-0"
                      title={lang === "km" ? "áž›áž»áž”ážšáž¼áž”áž—áž¶áž– QR" : "Clear QR"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Optional URL Input */}
              <div className="pt-1">
                <input
                  type="text"
                  value={formSettings.qrCustomImageUrl}
                  onChange={(e) => handleFieldChange("qrCustomImageUrl", e.target.value)}
                  placeholder="áž¬ áž”áž‰áŸ’áž…áž¼áž›ážáŸ†ážŽáž—áŸ’áž‡áž¶áž”áŸ‹ URL (https://.../my-aba-khqr.png)"
                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                {lang === "km"
                  ? "áž…áŸ†ážŽáž¶áŸ†áŸ– áž›áŸ„áž€áž¢áŸ’áž“áž€áž¢áž¶áž… Upload ážšáž¼áž”áž—áž¶áž–áž€áž¼ážŠ QR áž–áž¸áž‘áž¼ážšážŸáŸáž–áŸ’áž‘áž•áŸ’áž‘áž¶áž›áŸ‹ áž¬áž”áŸ’ážšáž¾áž”áŸ’ážšáž–áŸáž“áŸ’áž’ Dynamic Bakong KHQR EMVCo áž•áŸ’áž›áž¼ážœáž€áž¶ážšáŸ”"
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
              <h3 className="font-siemreap font-bold text-base sm:text-lg text-[#0c2340]">
                {lang === "km" ? "áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„áž”áž“áŸ’áž‘áž”áŸ‹ & áž€áŸ‚ážŸáž˜áŸ’ážšáž½áž›ážáž˜áŸ’áž›áŸƒážŸáŸ’áž“áž¶áž€áŸ‹áž“áŸ…" : "Manage Rooms & Room Pricing"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === "km"
                  ? "ážáž˜áŸ’áž›áŸƒážŠáŸ‚áž›áž”áž¶áž“áž€áŸ‚ážŸáž˜áŸ’ážšáž½áž›áž“áŸ…áž‘áž¸áž“áŸáŸ‡ áž“áž¹áž„ update áž›áž¾ BookingBar, Accommodation Section, áž“áž·áž„áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž€áž€áŸ‹áž—áŸ’áž›áž¶áž˜áŸ—áŸ”"
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
                <span>{lang === "km" ? "áž”áž“áŸ’ážáŸ‚áž˜áž”áž“áŸ’áž‘áž”áŸ‹ážáŸ’áž˜áž¸ (Add Room)" : "+ Add New Room"}</span>
              </button>

              {/* Breakfast price setting */}
              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl shrink-0">
                <span className="text-xs font-bold text-gray-700">
                  {lang === "km" ? "áž¢áž¶áž áž¶ážšáž–áŸáž›áž–áŸ’ážšáž¹áž€/áž“áž¶áž€áŸ‹:" : "Breakfast Rate:"}
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
                  <th className="py-3 px-4">áž”áž“áŸ’áž‘áž”áŸ‹ / Room</th>
                  <th className="py-3 px-4">ážáž˜áŸ’áž›áŸƒ ($/áž™áž”áŸ‹)</th>
                  <th className="py-3 px-4">ážáž˜áŸ’áž›áŸƒážŠáž¾áž˜ ($)</th>
                  <th className="py-3 px-4">áž‘áŸ†áž áŸ† (mÂ²)</th>
                  <th className="py-3 px-4">áž˜áž“áž»ážŸáŸ’ážŸáž…áž¶ážŸáŸ‹ / áž€áŸ’áž˜áŸáž„</th>
                  <th className="py-3 px-4">áž…áŸ†áž“áž½áž“áž”áž“áŸ’áž‘áž”áŸ‹</th>
                  <th className="py-3 px-4 text-center">ážŸáŸ’ážáž¶áž“áž—áž¶áž–</th>
                  <th className="py-3 px-4 text-center">ážŸáž€áž˜áŸ’áž˜áž—áž¶áž–</th>
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
                            {room.id} â€¢ {room.categoryEn}
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
                        {room.enabled ? "áž”áž¾áž€" : "áž”áž·áž‘"}
                      </button>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditRoom(idx)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg transition"
                          title={lang === "km" ? "áž€áŸ‚áž”áŸ’ážšáŸ‚áž”áž“áŸ’áž‘áž”áŸ‹" : "Edit Room"}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(idx)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition"
                          title={lang === "km" ? "áž›áž»áž”áž”áž“áŸ’áž‘áž”áŸ‹" : "Delete Room"}
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
              <h3 className="font-siemreap font-bold text-base sm:text-lg text-[#0c2340]">
                {lang === "km" ? "ðŸ½ï¸ áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ áž”áž¶ážš & áž˜áž»ážáž˜áŸ’áž áž¼áž”áž–áž·ážŸáŸážŸ" : "ðŸ½ï¸ Manage Dining, Bars & Menus"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === "km"
                  ? "áž”áž“áŸ’ážáŸ‚áž˜ áž€áŸ‚áž”áŸ’ážšáŸ‚ážšáž¼áž”áž—áž¶áž– áž˜áŸ‰áŸ„áž„áž”áž¾áž€ ážáž˜áŸ’áž›áŸƒ áž“áž·áž„áž˜áž»ážáž˜áŸ’áž áž¼áž”áž›áŸ’áž”áž¸áŸ—áž”áŸ’ážšáž…áž¶áŸ†áž áž¶áž„ ážŠáŸ‚áž›áž”áž„áŸ’áž áž¶áž‰áž›áž¾áž‚áŸáž áž‘áŸ†áž–áŸážš áž“áž·áž„áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž€áž€áŸ‹ážáž»áŸ”"
                  : "Add or edit restaurant venues, upload dining photos, set hours, dress code, and signature dishes."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddDiningModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "km" ? "áž”áž“áŸ’ážáŸ‚áž˜áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“/áž˜áž»ážáž˜áŸ’áž áž¼áž”" : "+ Add Dining Venue"}</span>
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
                        {venue.enabled ? (lang === "km" ? "áž”áž¾áž€" : "Active") : (lang === "km" ? "áž”áž·áž‘" : "Disabled")}
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
                      <span>â€¢</span>
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
                        ðŸ´ {dish}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDining(idx)}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                      title={lang === "km" ? "áž€áŸ‚áž”áŸ’ážšáŸ‚" : "Edit"}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{lang === "km" ? "áž€áŸ‚áž”áŸ’ážšáŸ‚" : "Edit"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDining(idx)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition"
                      title={lang === "km" ? "áž›áž»áž”" : "Delete"}
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
              <h3 className="font-siemreap font-bold text-base sm:text-lg text-[#0c2340]">
                {lang === "km" ? "áž‘áž¸ážáž¶áŸ†áž„áž‘áŸážŸáž…ážšážŽáŸážáŸážáŸ’ážáž€áŸ†áž–áž„áŸ‹áž…áž¶áž˜ & áž•áŸ‚áž“áž‘áž¸" : "Kampong Cham Tourist Destinations & Map"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === "km"
                  ? "áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„áž‘áž¸ážáž¶áŸ†áž„ áž”áž“áŸ’ážáŸ‚áž˜áž‘áž¸ážáž¶áŸ†áž„ážáŸ’áž˜áž¸ áž“áž·áž„áž€áž¼áž¢ážšážŠáŸ„áž“áŸáž›áž¾áž•áŸ‚áž“áž‘áž¸áž¢áž“áŸ’ážážšáž€áž˜áŸ’áž˜ Live Google Maps / Leaflet"
                  : "Manage tourist spots, add new locations, and verify exact GPS coordinates."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddDestModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "km" ? "áž”áž“áŸ’ážáŸ‚áž˜áž‘áž¸ážáž¶áŸ†áž„ážáŸ’áž˜áž¸ (Add Location)" : "+ Add New Destination"}</span>
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
                      <span>â€¢</span>
                      <span>{dest.travelTimeMinutes} áž“áž¶áž‘áž¸</span>
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
                      title={lang === "km" ? "áž€áŸ‚áž”áŸ’ážšáŸ‚áž‘áž¸ážáž¶áŸ†áž„" : "Edit Destination"}
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
            <h3 className="font-siemreap font-bold text-base sm:text-lg text-[#0c2340]">
              {lang === "km" ? "áž”áž¾áž€/áž”áž·áž‘ áž˜áž»ážáž„áž¶ážšáž”áŸ’ážšáž–áŸáž“áŸ’áž’áž“áŸ…áž›áž¾ Website" : "Website Feature Flags & Controls"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "áž›áŸ„áž€áž¢áŸ’áž“áž€áž¢áž¶áž…áž”áž¾áž€ áž¬áž”áž·áž‘áž˜áž»ážáž„áž¶ážšáž“áž¸áž˜áž½áž™áŸ—áž”áž¶áž“áž™áŸ‰áž¶áž„áž„áž¶áž™ážŸáŸ’ážšáž½áž›ážŠáŸ„áž™áž‚áŸ’ážšáž¶áž“áŸ‹ážáŸ‚áž…áž»áž…áž”áŸŠáž¼ážáž»áž„ážáž¶áž„áž€áŸ’ážšáŸ„áž˜áŸ”"
                : "Toggle platform modules on/off dynamically across the entire website."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                key: "enableDiningBooking" as const,
                titleKm: "áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž€áž€áŸ‹ážáž»áž¢áž¶áž áž¶ážš",
                titleEn: "Dining Table Reservation",
                descKm: "áž¢áž“áž»áž‰áŸ’áž‰áž¶ážáž±áŸ’áž™áž—áŸ’áž‰áŸ€ážœáž€áž€áŸ‹ážáž»áž¢áž¶áž áž¶ážšáž“áŸ…áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ Mekong Breeze áž“áž·áž„ Sunset Lounge",
                descEn: "Enable live restaurant reservations and dining orders",
                icon: "ðŸ½ï¸",
              },
              {
                key: "enableKhqrBakong" as const,
                titleKm: "áž€áž¶ážšáž‘áž¼áž‘áž¶ážáŸ‹ Bakong KHQR",
                titleEn: "NBC Bakong KHQR Gateway",
                descKm: "áž”áž„áŸ’áž€áž¾ážáž€áž¼ážŠ KHQR ážŸáŸ’ážáž„áŸ‹ážŠáž¶ážš EMVCo ážŸáž˜áŸ’ážšáž¶áž”áŸ‹ážŸáŸ’áž€áŸáž“áž‘áž¼áž‘áž¶ážáŸ‹ážáž¶áž˜ App áž’áž“áž¶áž‚áž¶ážšáž‚áŸ’ážšáž”áŸ‹áž”áŸ’ážšáž—áŸáž‘",
                descEn: "Enable dynamic EMVCo KHQR code generator for mobile banking",
                icon: "ðŸ’³",
              },
              {
                key: "enableCard3DS" as const,
                titleKm: "áž€áž¶ážáž¥ážŽáž‘áž¶áž“ 3D Secure",
                titleEn: "3D Secure Card Gateway",
                descKm: "áž‘áž‘áž½áž›áž€áž¶ážšáž‘áž¼áž‘áž¶ážáŸ‹ážáž¶áž˜áž€áž¶áž Visa, Mastercard, JCB, UnionPay",
                descEn: "Accept Visa, Mastercard, JCB with OTP authentication",
                icon: "ðŸ”’",
              },
              {
                key: "enablePayAtHotel" as const,
                titleKm: "áž‘áž¼áž‘áž¶ážáŸ‹áž•áŸ’áž‘áž¶áž›áŸ‹áž“áŸ…ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš",
                titleEn: "Pay at Hotel (Cash/Card)",
                descKm: "áž¢áž“áž»áž‰áŸ’áž‰áž¶ážáž±áŸ’áž™áž—áŸ’áž‰áŸ€ážœáž€áž€áŸ‹áž‘áž»áž€áž˜áž»áž“ áž áž¾áž™áž˜áž€áž‘áž¼áž‘áž¶ážáŸ‹áž”áŸ’ážšáž¶áž€áŸ‹áž“áŸ… Front Desk áž–áŸáž› Check-in",
                descEn: "Allow guests to reserve and pay upon arrival at Front Desk",
                icon: "ðŸ¨",
              },
              {
                key: "enableTelegramAlerts" as const,
                titleKm: "Telegram Bot Alert (@vvotel_bot)",
                titleEn: "Instant Telegram Alerts",
                descKm: "áž•áŸ’áž‰áž¾áž€áž¶ážšáž‡áž¼áž“ážŠáŸ†ážŽáž¹áž„áž—áŸ’áž›áž¶áž˜áŸ—áž‘áŸ…áž€áž¶áž“áŸ‹ Bot ážšáž¶áž›áŸ‹áž–áŸáž›áž˜áž¶áž“áž€áž¶ážšáž€áž€áŸ‹áž”áž“áŸ’áž‘áž”áŸ‹ áž¬ážáž»áž¢áž¶áž áž¶ážšážáŸ’áž˜áž¸",
                descEn: "Dispatch instant reservation alerts to @vvotel_bot",
                icon: "ðŸ¤–",
              },
              {
                key: "enableLeafletMap" as const,
                titleKm: "áž•áŸ‚áž“áž‘áž¸áž¢áž“áŸ’ážážšáž€áž˜áŸ’áž˜ážáŸážáŸ’ážáž€áŸ†áž–áž„áŸ‹áž…áž¶áž˜",
                titleEn: "Interactive Tourist Map",
                descKm: "áž”áž„áŸ’áž áž¶áž‰áž•áŸ‚áž“áž‘áž¸ážšáž»áž€ážšáž€ážáŸ†áž”áž“áŸ‹áž‘áŸážŸáž…ážšážŽáŸ áž“áž·áž„áž”áž„áŸ’áž áž¶áž‰áž€áž¼áž¢ážšážŠáŸ„áž“áŸáž•áŸ’áž›áž¼ážœáž’áŸ’ážœáž¾ážŠáŸ†ážŽáž¾ážš",
                descEn: "Display interactive Leaflet & Google Map with tourist pins",
                icon: "ðŸ—ºï¸",
              },
              {
                key: "enablePwaInstall" as const,
                titleKm: "áž€áž¶ážšážŠáŸ†áž¡áž¾áž„áž€áž˜áŸ’áž˜ážœáž·áž’áž¸ PWA App",
                titleEn: "PWA Mobile App Install",
                descKm: "áž”áž„áŸ’áž áž¶áž‰áž•áŸ’áž‘áž¶áŸ†áž„áž±áŸ’áž™áž—áŸ’áž‰áŸ€ážœ Install áž‚áŸáž áž‘áŸ†áž–áŸážšáž‘áŸ…áž€áŸ’áž“áž»áž„áž‘áž¼ážšážŸáŸáž–áŸ’áž‘ážŠáž¼áž… App áž•áŸ’áž›áž¼ážœáž€áž¶ážš",
                descEn: "Display mobile PWA install prompts for iOS & Android",
                icon: "ðŸ“²",
              },
              {
                key: "enableAccessibilityPanel" as const,
                titleKm: "áž•áŸ’áž‘áž¶áŸ†áž„áž‡áŸ†áž“áž½áž™áž€áž¶ážšáž˜áž¾áž› áž“áž·áž„áž¢áž¶áž“",
                titleEn: "Accessibility Controls",
                descKm: "áž§áž”áž€ážšážŽáŸáž–áž„áŸ’ážšáž¸áž€áž¢áž€áŸ’ážŸážš áž”áŸ’ážáž¼ážšáž–ážŽáŸŒáž€áž˜áŸ’ážšáž·ážážáŸ’áž–ážŸáŸ‹ áž“áž·áž„áž‡áŸ†áž“áž½áž™áž‡áž“áž–áž·áž€áž¶ážš",
                descEn: "High contrast, font scaling, and voice reading aids",
                icon: "ðŸ‘ï¸",
              },
              {
                key: "enableWeatherWidget" as const,
                titleKm: "áž€áž¶ážšáž–áŸ’áž™áž¶áž€ážšážŽáŸáž¢áž¶áž€áž¶ážŸáž’áž¶ážáž»áž”áŸ’ážšáž…áž¶áŸ†ážáŸ’áž„áŸƒ",
                titleEn: "Live Weather Widget",
                descKm: "áž”áž„áŸ’áž áž¶áž‰ážŸáž¸ážáž»ážŽáŸ’áž áž—áž¶áž– áž“áž·áž„áž¢áž¶áž€áž¶ážŸáž’áž¶ážáž»áž“áŸ…áž€áŸ’ážšáž»áž„áž€áŸ†áž–áž„áŸ‹áž…áž¶áž˜áž•áŸ’áž‘áž¶áž›áŸ‹",
                descEn: "Display real-time temperature and forecast in Kampong Cham",
                icon: "â›…",
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
                      {isEnabled ? "áž”áž¾áž€ (ON)" : "áž”áž·áž‘ (OFF)"}
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
            <h3 className="font-siemreap font-bold text-base sm:text-lg text-[#0c2340]">
              {lang === "km" ? "áž€áž¶ážšáž€áŸ†ážŽážáŸ‹ Telegram Bot (@vvotel_bot)" : "Telegram Bot Setup & Alert Routing"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "km"
                ? "áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„ Bot Token, Username, áž“áž·áž„ Chat ID ážŠáž¾áž˜áŸ’áž”áž¸áž‘áž‘áž½áž› Alert ážšáž¶áž›áŸ‹áž–áŸáž›áž˜áž¶áž“áž—áŸ’áž‰áŸ€ážœáž€áž€áŸ‹ áž¬áž”áž„áŸ‹áž”áŸ’ážšáž¶áž€áŸ‹"
                : "Manage bot token and receiver chat IDs for instantaneous dispatch."}
            </p>
          </div>

          <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start space-x-3 text-xs text-sky-900">
            <Send className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Official Hotel Bot:</strong> Bot áž•áŸ’áž›áž¼ážœáž€áž¶ážšážšáž”ážŸáŸ‹ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážšáž‚ážº{" "}
              <a
                href="https://t.me/vvotel_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline text-sky-700"
              >
                @vvotel_bot
              </a>
              áŸ” ážšáž¶áž›áŸ‹áž€áž¶ážšáž€áž€áŸ‹áž”áž“áŸ’áž‘áž”áŸ‹ áž€áž¶ážšáž€áž€áŸ‹ážáž»áž¢áž¶áž áž¶ážš áž¬áž€áž¶ážšáž•áŸ’áž‘áŸ€áž„áž•áŸ’áž‘áž¶ážáŸ‹áž›áž»áž™áž…áž¼áž›áž€áž»áž„ áž“áž¹áž„áž›áŸ„ážážŸáž¶ážš Alert áž‘áŸ…áž€áž¶áž“áŸ‹ Bot áž—áŸ’áž›áž¶áž˜áŸ—áž€áŸ’áž“áž»áž„áž–áŸáž› Real-time!
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
                {lang === "km" ? "Admin Chat ID áž‘áž‘áž½áž› Alert:" : "Admin Chat ID:"}
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
                {lang === "km" ? "Telegram Bot API Token (áž–áž¸ @BotFather):" : "Telegram Bot API Token:"}
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

      {/* ======================= TAB 8: AUTO BACKUP & RESTORE ======================= */}
      {activeTab === "backup" && (
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-siemreap font-bold text-base sm:text-lg text-[#0c2340]">
                  {lang === "km" ? "áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž”áž˜áŸ’ážšáž»áž„áž‘áž»áž€áž‘áž·áž“áŸ’áž“áž“áŸáž™ážŸáŸ’ážœáŸáž™áž”áŸ’ážšážœážáŸ’ážáž· (Auto Backup)" : "Automatic Continuous Data Backup & Restore"}
                </h3>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Active 24/7</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === "km"
                  ? "áž‘áž·áž“áŸ’áž“áž“áŸáž™áž‘áž¶áŸ†áž„áž¢ážŸáŸ‹ (áž”áž“áŸ’áž‘áž”áŸ‹, áž˜áž»ážáž˜áŸ’áž áž¼áž”, áž‘áž¸ážáž¶áŸ†áž„, áž€áž¶ážšáž€áž€áŸ‹ áž“áž·áž„áž€áž¶ážšáž€áŸ†ážŽážáŸ‹) ážáŸ’ážšáž¼ážœáž”áž¶áž“ážážáž”áž˜áŸ’ážšáž»áž„áž‘áž»áž€áž‡áž¶áž”áŸ’ážšáž…áž¶áŸ†ážŠáŸ„áž™ážŸáŸ’ážœáŸáž™áž”áŸ’ážšážœážáŸ’ážáž· áž‡áž¶áž”áŸ‹ážšáž áž¼ážáž˜áž·áž“áž”áž¶ážáŸ‹áž”áž„áŸ‹áž¡áž¾áž™áŸ”"
                  : "All data including rooms, menus, locations, bookings and settings are continuously backed up and preserved."}
              </p>
            </div>

            <button
              type="button"
              onClick={loadSnapshots}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
              <span>{lang === "km" ? "Refresh áž”áž‰áŸ’áž‡áž¸" : "Refresh List"}</span>
            </button>
          </div>

          {/* Backup Notice Alert */}
          {backupNotice && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in ${
                backupNotice.type === "success"
                  ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                  : "bg-red-50 border border-red-300 text-red-900"
              }`}
            >
              <div className="flex items-center space-x-2">
                {backupNotice.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{backupNotice.msg}</span>
              </div>
              <button
                onClick={() => setBackupNotice(null)}
                className="text-gray-500 hover:text-gray-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Protection Card */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-siemreap font-bold text-sm text-emerald-950">
                    {lang === "km" ? "ážŠáŸ†ážŽáž¾ážšáž€áž¶ážšáž€áž¶ážšáž–áž¶ážšáž‘áž·áž“áŸ’áž“áž“áŸáž™ážŸáŸ’ážœáŸáž™áž”áŸ’ážšážœážáŸ’áž (Continuous Auto-Backup Active)" : "Continuous Data Protection Active"}
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  {lang === "km"
                    ? "ážšáž¶áž›áŸ‹áž–áŸáž›áž˜áž¶áž“áž€áž¶ážšáž•áŸ’áž›áž¶ážŸáŸ‹áž”áŸ’ážáž¼ážšáž‘áž·áž“áŸ’áž“áž“áŸáž™ (Add, Update, Edit, Delete áž”áž“áŸ’áž‘áž”áŸ‹, áž˜áž»ážáž˜áŸ’áž áž¼áž”, áž‘áž¸ážáž¶áŸ†áž„, áž€áž¶ážšáž€áž€áŸ‹) áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž“áž¹áž„ážáž Snapshot ážšáž€áŸ’ážŸáž¶áž‘áž»áž€ážŠáŸ„áž™ážŸáŸ’ážœáŸáž™áž”áŸ’ážšážœážáŸ’ážáž·áž—áŸ’áž›áž¶áž˜áŸ— áž‘áž¶áŸ†áž„áž€áŸ’áž“áž»áž„ Local Device áž“áž·áž„ Server DiskáŸ” áž›áž¾ážŸáž–áž¸áž“áŸáŸ‡ áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž€áŸáž’áŸ’ážœáž¾áž€áž¶ážš Auto-Backup ážšáŸ€áž„ážšáž¶áž›áŸ‹ áŸ¥ áž“áž¶áž‘áž¸áž˜áŸ’ážáž„áž‡áž¶áž”áŸ’ážšáž…áž¶áŸ†áŸ”"
                    : "Every modification (rooms, foods, destinations, bookings) is instantly auto-saved to disk and browser storage, plus a 5-minute background interval."}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-800 font-bold">
              <div className="flex items-center space-x-1.5">
                <span>âš¡ ážŸáŸ’ážœáŸáž™áž”áŸ’ážšážœážáŸ’ážáž–áŸáž›áž€áŸ‚áž”áŸ’ážšáŸ‚áž‘áž·áž“áŸ’áž“áž“áŸáž™</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span>â±ï¸ Backup ážšáŸ€áž„ážšáž¶áž›áŸ‹ áŸ¥ áž“áž¶áž‘áž¸</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span>ðŸ›¡ï¸ Snapshot áž€áž¶ážšáž–áž¶ážšáž˜áž»áž“áž–áŸáž› Restore</span>
              </div>
            </div>
          </div>

          {/* 3 Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Download Full Backup JSON */}
            <div className="p-5 bg-gradient-to-b from-blue-50/70 to-white border border-blue-200 rounded-2xl space-y-3 flex flex-col justify-between shadow-2xs hover:border-blue-400 transition">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="font-siemreap font-bold text-xs sm:text-sm text-[#0c2340]">
                  {lang === "km" ? "áž‘áž¶áž‰áž™áž€ Backup áž–áŸáž‰áž›áŸáž‰" : "Export Full Backup"}
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {lang === "km"
                    ? "áž‘áž¶áž‰áž™áž€áž‘áž·áž“áŸ’áž“áž“áŸáž™áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž‘áž¶áŸ†áž„áž¢ážŸáŸ‹áž‡áž¶áž¯áž€ážŸáž¶ážš .json áž‘áž»áž€áž€áŸ’áž“áž»áž„áž€áž»áŸ†áž–áŸ’áž™áž¼áž‘áŸážšáž•áŸ’áž‘áž¶áž›áŸ‹ážáŸ’áž›áž½áž“ážŠáž¾áž˜áŸ’áž”áž¸ážŸáž»ážœážáŸ’ážáž·áž—áž¶áž–áŸ”"
                    : "Download complete database as a .json file to your computer drive."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadFullBackup}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === "km" ? "áž‘áž¶áž‰áž™áž€ File .json" : "Download .json"}</span>
              </button>
            </div>

            {/* Action 2: Create Instant Snapshot */}
            <div className="p-5 bg-gradient-to-b from-amber-50/70 to-white border border-amber-200 rounded-2xl space-y-3 flex flex-col justify-between shadow-2xs hover:border-amber-400 transition">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h4 className="font-siemreap font-bold text-xs sm:text-sm text-[#0c2340]">
                  {lang === "km" ? "áž”áž„áŸ’áž€áž¾áž Snapshot ážáŸ’áž˜áž¸áž¥áž¡áž¼ážœáž“áŸáŸ‡" : "Create Instant Snapshot"}
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {lang === "km"
                    ? "ážáž Snapshot ážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž‘áž·áž“áŸ’áž“áž“áŸáž™áž‡áž¶áž€áŸ‹ážŸáŸ’ážáŸ‚áž„áž–áŸáž›áž“áŸáŸ‡áž—áŸ’áž›áž¶áž˜áŸ— ážŠáž¾áž˜áŸ’áž”áž¸áž¢áž¶áž…ážŸáŸ’ážŠáž¶ážšáž¡áž¾áž„ážœáž·áž‰áž”áž¶áž“áž‚áŸ’ážšáž”áŸ‹áž–áŸáž›áŸ”"
                    : "Freeze current system state into a new snapshot right now."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTakeInstantSnapshot}
                disabled={isTakingSnapshot}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTakingSnapshot ? "animate-spin" : ""}`} />
                <span>{isTakingSnapshot ? (lang === "km" ? "áž€áŸ†áž–áž»áž„áž”áž„áŸ’áž€áž¾áž..." : "Saving...") : (lang === "km" ? "áž”áž„áŸ’áž€áž¾áž Snapshot áž—áŸ’áž›áž¶áž˜áŸ—" : "Create Snapshot")}</span>
              </button>
            </div>

            {/* Action 3: Restore From File */}
            <div className="p-5 bg-gradient-to-b from-purple-50/70 to-white border border-purple-200 rounded-2xl space-y-3 flex flex-col justify-between shadow-2xs hover:border-purple-400 transition">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h4 className="font-siemreap font-bold text-xs sm:text-sm text-[#0c2340]">
                  {lang === "km" ? "ážŸáŸ’ážŠáž¶ážšáž¡áž¾áž„ážœáž·áž‰áž–áž¸ File .json" : "Restore From File"}
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {lang === "km"
                    ? "áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸáž¯áž€ážŸáž¶ážš Backup .json áž–áž¸áž€áž»áŸ†áž–áŸ’áž™áž¼áž‘áŸážš ážŠáž¾áž˜áŸ’áž”áž¸ážŸáŸ’ážŠáž¶ážšáž”áŸ’ážšáž–áŸáž“áŸ’áž’ áž“áž·áž„áž‘áž·áž“áŸ’áž“áž“áŸáž™áž‘áž¶áŸ†áž„áž˜áž¼áž›áž¡áž¾áž„ážœáž·áž‰áž—áŸ’áž›áž¶áž˜áŸ—áŸ”"
                    : "Upload a previously saved .json backup file to restore all data."}
                </p>
              </div>
              <label className="w-full py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === "km" ? "áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸ File Restore..." : "Select File to Restore..."}</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleUploadBackupFile}
                  disabled={isRestoring}
                />
              </label>
            </div>
          </div>

          {/* Recent Snapshots History Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-siemreap font-bold text-xs sm:text-sm text-[#0c2340] flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-600" />
                <span>{lang === "km" ? "áž”áž‰áŸ’áž‡áž¸ Snapshot áž”áž˜áŸ’ážšáž»áž„áž‘áž»áž€áž‘áž·áž“áŸ’áž“áž“áŸáž™ážáŸ’áž˜áž¸áŸ—" : "Recent Backup Snapshots"}</span>
                <span className="text-xs font-mono font-normal text-gray-500">({backupSnapshots.length})</span>
              </h4>
              <span className="text-[11px] text-gray-500 italic">
                {lang === "km" ? "áž…áž»áž…áž”áŸŠáž¼ážáž»áž„ \"ážŸáŸ’ážŠáž¶ážšáž‘áž·áž“áŸ’áž“áž“áŸáž™\" ážŠáž¾áž˜áŸ’áž”áž¸ážáŸ’ážšáž¡áž”áŸ‹áž‘áŸ…ážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž…áž¶ážŸáŸ‹" : "Click Restore to rollback to any snapshot"}
              </span>
            </div>

            {backupSnapshots.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <Database className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-600 font-bold">
                  {lang === "km" ? "áž˜áž·áž“áž‘áž¶áž“áŸ‹áž˜áž¶áž“ Snapshot áž‘áŸ! ážŸáž¼áž˜áž…áž»áž…áž”áž„áŸ’áž€áž¾áž Snapshot ážáŸ’áž˜áž¸ážáž¶áž„áž›áž¾áŸ”" : "No snapshots recorded yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {backupSnapshots.map((snap) => {
                  const dateStr = new Date(snap.timestamp).toLocaleString("km-KH", {
                    timeZone: "Asia/Phnom_Penh",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <div
                      key={snap.id}
                      className="p-4 bg-white border border-gray-200 hover:border-amber-300 rounded-2xl transition flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-[#0c2340]">{snap.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              snap.reason === "auto_change"
                                ? "bg-blue-100 text-blue-800"
                                : snap.reason === "interval"
                                ? "bg-emerald-100 text-emerald-800"
                                : snap.reason === "manual"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-purple-100 text-purple-900"
                            }`}
                          >
                            {snap.reason}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 font-mono">
                          <span>{snap.id}</span>
                          <span>â€¢</span>
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600 pt-0.5 font-bold">
                          <span>ðŸ›ï¸ áž”áž“áŸ’áž‘áž”áŸ‹: {snap.stats?.roomCount ?? snap.settings?.rooms?.length ?? 0}</span>
                          <span>ðŸ½ï¸ áž˜áŸ’áž áž¼áž”: {snap.stats?.diningCount ?? snap.settings?.dining?.length ?? 0}</span>
                          <span>ðŸ—ºï¸ áž‘áž¸ážáž¶áŸ†áž„: {snap.stats?.destinationCount ?? snap.settings?.destinations?.length ?? 0}</span>
                          <span>ðŸ“‘ áž€áž¶ážšáž€áž€áŸ‹: {snap.stats?.bookingCount ?? snap.bookings?.length ?? 0}</span>
                          {snap.stats?.totalRevenueUSD !== undefined && (
                            <span className="text-emerald-700">${snap.stats.totalRevenueUSD.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => downloadSnapshotJson(snap)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                          title="Download Snapshot JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.json</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot(snap)}
                          disabled={isRestoring}
                          className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? "animate-spin" : ""}`} />
                          <span>{lang === "km" ? "ážŸáŸ’ážŠáž¶ážšáž‘áž·áž“áŸ’áž“áž“áŸáž™ (Restore)" : "Restore"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODAL 1: ADD ROOM ======================= */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-siemreap animate-in fade-in duration-200">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-siemreap font-bold text-base text-[#0c2340]">
                {lang === "km" ? "âž• áž”áž“áŸ’ážáŸ‚áž˜áž”áž“áŸ’áž‘áž”áŸ‹ážŸáŸ’áž“áž¶áž€áŸ‹áž“áŸ…ážáŸ’áž˜áž¸" : "âž• Add New Room"}
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž”áž“áŸ’áž‘áž”áŸ‹ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom.nameKm}
                    onChange={(e) => setNewRoom({ ...newRoom, nameKm: e.target.value })}
                    placeholder="áž§. áž”áž“áŸ’áž‘áž”áŸ‹ážŠáŸáž›áž»áž…áŸ’ážŸ áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸ"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ážˆáŸ’áž˜áŸ„áŸ‡áž”áž“áŸ’áž‘áž”áŸ‹ (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ) *
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
                    ážáž˜áŸ’áž›áŸƒ ($/áž™áž”áŸ‹) *
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
                    ážáž˜áŸ’áž›áŸƒážŠáž¾áž˜ ($)
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
                  <label className="block font-bold text-gray-700 mb-1">áž‘áŸ†áž áŸ† (mÂ²)</label>
                  <input
                    type="number"
                    min={10}
                    value={newRoom.sizeSqm}
                    onChange={(e) => setNewRoom({ ...newRoom, sizeSqm: parseInt(e.target.value) || 30 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž…áŸ†áž“áž½áž“áž”áž“áŸ’áž‘áž”áŸ‹ážŸážšáž»áž” (Units)</label>
                  <input
                    type="number"
                    min={1}
                    value={newRoom.availableCount}
                    onChange={(e) => setNewRoom({ ...newRoom, availableCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž‚áŸ’ážšáŸ‚ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš)</label>
                  <input
                    type="text"
                    value={newRoom.bedTypeKm}
                    onChange={(e) => setNewRoom({ ...newRoom, bedTypeKm: e.target.value })}
                    placeholder="áž‚áŸ’ážšáŸ‚ážƒáž¸áž„ áŸ¡ áž¬ áž‚áŸ’ážšáŸ‚áž‘áŸ„áž› áŸ¢"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž‚áŸ’ážšáŸ‚ (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ)</label>
                  <input
                    type="text"
                    value={newRoom.bedTypeEn}
                    onChange={(e) => setNewRoom({ ...newRoom, bedTypeEn: e.target.value })}
                    placeholder="1 King or 2 Twin Beds"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž˜áž“áž»ážŸáŸ’ážŸáž…áž¶ážŸáŸ‹ / áž€áŸ’áž˜áŸáž„ (Pax)</label>
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
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž‘áŸážŸáž—áž¶áž– (View)</label>
                  <input
                    type="text"
                    value={newRoom.viewTypeKm}
                    onChange={(e) => setNewRoom({ ...newRoom, viewTypeKm: e.target.value })}
                    placeholder="áž‘áŸážŸáž—áž¶áž–áž‘áž“áŸ’áž›áŸáž˜áŸáž‚áž„áŸ’áž‚"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">ážšáž¼áž”áž—áž¶áž–áž”áž“áŸ’áž‘áž”áŸ‹ (Image Upload áž¬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”áž–áž¸áž‘áž¼ážšážŸáŸáž–áŸ’áž‘...</span>
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
                      placeholder="https://... áž¬ Upload áž•áŸ’áž‘áž¶áž›áŸ‹"
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
                  <label className="block font-bold text-gray-700 mb-1">áž€áž¶ážšáž–áž·áž–ážŽáŸŒáž“áž¶áž–áž¸áž”áž“áŸ’áž‘áž”áŸ‹ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš)</label>
                  <textarea
                    rows={2}
                    value={newRoom.descriptionKm || ""}
                    onChange={(e) => setNewRoom({ ...newRoom, descriptionKm: e.target.value })}
                    placeholder="áž–áž·áž–ážŽáŸŒáž“áž¶áž–áž¸áž…áŸ†ážŽáž»áž…áž–áž·ážŸáŸážŸáž“áŸƒáž”áž“áŸ’áž‘áž”áŸ‹..."
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
                  {lang === "km" ? "áž”áŸ„áŸ‡áž”áž„áŸ‹" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "áž™áž›áŸ‹áž–áŸ’ážšáž˜áž”áž“áŸ’ážáŸ‚áž˜áž”áž“áŸ’áž‘áž”áŸ‹" : "Add Room"}
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
              <h3 className="font-siemreap font-bold text-base text-[#0c2340]">
                {lang === "km" ? "âœï¸ áž€áŸ‚áž”áŸ’ážšáŸ‚áž–áŸážáŸŒáž˜áž¶áž“áž”áž“áŸ’áž‘áž”áŸ‹" : "âœï¸ Edit Room"}
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž”áž“áŸ’áž‘áž”áŸ‹ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš) *
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž”áž“áŸ’áž‘áž”áŸ‹ (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ) *
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
                  <label className="block font-bold text-gray-700 mb-1">ážáž˜áŸ’áž›áŸƒ ($/áž™áž”áŸ‹) *</label>
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
                  <label className="block font-bold text-gray-700 mb-1">ážáž˜áŸ’áž›áŸƒážŠáž¾áž˜ ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingRoom.originalPrice}
                    onChange={(e) => setEditingRoom({ ...editingRoom, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž‘áŸ†áž áŸ† (mÂ²)</label>
                  <input
                    type="number"
                    min={10}
                    value={editingRoom.sizeSqm}
                    onChange={(e) => setEditingRoom({ ...editingRoom, sizeSqm: parseInt(e.target.value) || 30 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž…áŸ†áž“áž½áž“áž”áž“áŸ’áž‘áž”áŸ‹ážŸážšáž»áž” (Units)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingRoom.availableCount}
                    onChange={(e) => setEditingRoom({ ...editingRoom, availableCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž‚áŸ’ážšáŸ‚ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš)</label>
                  <input
                    type="text"
                    value={editingRoom.bedTypeKm || ""}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedTypeKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž‚áŸ’ážšáŸ‚ (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ)</label>
                  <input
                    type="text"
                    value={editingRoom.bedTypeEn || ""}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedTypeEn: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">ážšáž¼áž”áž—áž¶áž–áž”áž“áŸ’áž‘áž”áŸ‹ (Image Upload áž¬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”ážáŸ’áž˜áž¸...</span>
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
                  <label className="block font-bold text-gray-700 mb-1">áž€áž¶ážšáž–áž·áž–ážŽáŸŒáž“áž¶áž–áž¸áž”áž“áŸ’áž‘áž”áŸ‹ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš)</label>
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
                  {lang === "km" ? "áž”áŸ„áŸ‡áž”áž„áŸ‹" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "ážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž€áž¶ážšáž€áŸ‚áž”áŸ’ážšáŸ‚" : "Save Changes"}
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
              <h3 className="font-siemreap font-bold text-base text-[#0c2340]">
                {lang === "km" ? "âž• áž”áž“áŸ’ážáŸ‚áž˜áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ / áž˜áž»ážáž˜áŸ’áž áž¼áž”ážáŸ’áž˜áž¸" : "âž• Add Dining Venue / Menu"}
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“/áž áž¶áž„ (ážáŸ’áž˜áŸ‚ážš) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDining.nameKm}
                    onChange={(e) => setNewDining({ ...newDining, nameKm: e.target.value })}
                    placeholder="áž§. áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ áž˜áŸáž‚áž„áŸ’áž‚áž”áŸ’ážšáŸŠáž¸ážŸ"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ážˆáŸ’áž˜áŸ„áŸ‡áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“/áž áž¶áž„ (áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ) *
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
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž˜áŸ’áž áž¼áž” (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš)</label>
                  <input
                    type="text"
                    value={newDining.cuisineKm}
                    onChange={(e) => setNewDining({ ...newDining, cuisineKm: e.target.value })}
                    placeholder="áž˜áŸ’áž áž¼áž”ážáŸ’áž˜áŸ‚ážš & áž¢áž“áŸ’ážážšáž‡áž¶ážáž·"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž˜áŸ’áž áž¼áž” (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ)</label>
                  <input
                    type="text"
                    value={newDining.cuisineEn}
                    onChange={(e) => setNewDining({ ...newDining, cuisineEn: e.target.value })}
                    placeholder="Khmer & International Cuisine"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž˜áŸ‰áŸ„áž„áž”áž¾áž€áž”áž˜áŸ’ážšáž¾</label>
                  <input
                    type="text"
                    value={newDining.hoursKm}
                    onChange={(e) => setNewDining({ ...newDining, hoursKm: e.target.value, hoursEn: e.target.value })}
                    placeholder="áŸ áŸ¦:áŸ áŸ  - áŸ¢áŸ¢:áŸ áŸ "
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž€áž˜áŸ’ážšáž·ážážáž˜áŸ’áž›áŸƒ (Price Range)</label>
                  <input
                    type="text"
                    value={newDining.priceRangeUSD || "$$"}
                    onChange={(e) => setNewDining({ ...newDining, priceRangeUSD: e.target.value })}
                    placeholder="$$ - $$$ (áž§. $10 - $50)"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">ážšáž¼áž”áž—áž¶áž–áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ (Image Upload áž¬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”áž–áž¸áž‘áž¼ážšážŸáŸáž–áŸ’áž‘...</span>
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
                      placeholder="https://... áž¬ Upload ážšáž¼áž”áž•áŸ’áž‘áž¶áž›áŸ‹"
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
                  <label className="block font-bold text-gray-700 mb-1">áž˜áž»ážáž˜áŸ’áž áž¼áž”áž›áŸ’áž”áž¸áŸ— (áž”áŸ†áž”áŸ‚áž€ážŠáŸ„áž™ážŸáž‰áŸ’áž‰áž¶áž€áŸ’áž”áŸ€ážŸ ,)</label>
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
                    placeholder="áž¢áž¶áž˜áŸ‰áž»áž€ážáŸ’ážšáž¸áž˜áŸáž‚áž„áŸ’áž‚, áž”áž„áŸ’áž€áž„áž‘áž“áŸ’áž›áŸáž¢áž¶áŸ†áž„, ážŸáž¶áž…áŸ‹áž‚áŸ„áž¢áž¶áŸ†áž„"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">áž€áž¶ážšáž–áž·áž–ážŽáŸŒáž“áž¶ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš)</label>
                  <textarea
                    rows={2}
                    value={newDining.descriptionKm || ""}
                    onChange={(e) => setNewDining({ ...newDining, descriptionKm: e.target.value })}
                    placeholder="áž–áž·áž–ážŽáŸŒáž“áž¶áž–áž¸áž”ážšáž·áž™áž¶áž€áž¶ážŸ áž“áž·áž„ážšážŸáž‡áž¶ážáž·áž˜áŸ’áž áž¼áž”..."
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
                  {lang === "km" ? "áž”áŸ„áŸ‡áž”áž„áŸ‹" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "áž™áž›áŸ‹áž–áŸ’ážšáž˜áž”áž“áŸ’ážáŸ‚áž˜" : "Add Venue"}
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
              <h3 className="font-siemreap font-bold text-base text-[#0c2340]">
                {lang === "km" ? "âœï¸ áž€áŸ‚áž”áŸ’ážšáŸ‚áž–áŸážáŸŒáž˜áž¶áž“áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“/áž˜áž»ážáž˜áŸ’áž áž¼áž”" : "âœï¸ Edit Dining Venue / Menu"}
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“/áž áž¶áž„ (ážáŸ’áž˜áŸ‚ážš) *
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“/áž áž¶áž„ (áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ) *
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
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž˜áŸ’áž áž¼áž” (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš)</label>
                  <input
                    type="text"
                    value={editingDining.cuisineKm}
                    onChange={(e) => setEditingDining({ ...editingDining, cuisineKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž˜áŸ‰áŸ„áž„áž”áž¾áž€áž”áž˜áŸ’ážšáž¾</label>
                  <input
                    type="text"
                    value={editingDining.hoursKm}
                    onChange={(e) => setEditingDining({ ...editingDining, hoursKm: e.target.value, hoursEn: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž€áž˜áŸ’ážšáž·ážážáž˜áŸ’áž›áŸƒ (Price Range)</label>
                  <input
                    type="text"
                    value={editingDining.priceRangeUSD || "$$"}
                    onChange={(e) => setEditingDining({ ...editingDining, priceRangeUSD: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ážŸáž˜áŸ’áž›áŸ€áž€áž”áŸ†áž–áž¶áž€áŸ‹ (Dress Code)</label>
                  <input
                    type="text"
                    value={editingDining.dressCodeKm || ""}
                    onChange={(e) => setEditingDining({ ...editingDining, dressCodeKm: e.target.value })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">ážšáž¼áž”áž—áž¶áž–áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ (Image Upload áž¬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”ážáŸ’áž˜áž¸...</span>
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
                  <label className="block font-bold text-gray-700 mb-1">áž˜áž»ážáž˜áŸ’áž áž¼áž”áž›áŸ’áž”áž¸áŸ— (áž”áŸ†áž”áŸ‚áž€ážŠáŸ„áž™ážŸáž‰áŸ’áž‰áž¶áž€áŸ’áž”áŸ€ážŸ ,)</label>
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
                  <label className="block font-bold text-gray-700 mb-1">áž€áž¶ážšáž–áž·áž–ážŽáŸŒáž“áž¶ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš)</label>
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
                  {lang === "km" ? "áž”áŸ„áŸ‡áž”áž„áŸ‹" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "ážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž€áž¶ážšáž€áŸ‚áž”áŸ’ážšáŸ‚" : "Save Changes"}
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
              <h3 className="font-siemreap font-bold text-base text-[#0c2340]">
                {lang === "km" ? "âž• áž”áž“áŸ’ážáŸ‚áž˜áž‘áž¸ážáž¶áŸ†áž„áž‘áŸážŸáž…ážšážŽáŸážáŸ’áž˜áž¸" : "âž• Add New Destination"}
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž‘áž¸ážáž¶áŸ†áž„ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDest.nameKm}
                    onChange={(e) => setNewDest({ ...newDest, nameKm: e.target.value })}
                    placeholder="áž§. áž—áŸ’áž“áŸ†áž”áŸ’ážšáž»ážŸ áž—áŸ’áž“áŸ†ážŸáŸ’ážšáž¸"
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ážˆáŸ’áž˜áŸ„áŸ‡áž‘áž¸ážáž¶áŸ†áž„ (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ) *
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
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž‘áž¸ážáž¶áŸ†áž„</label>
                  <select
                    value={newDest.category}
                    onChange={(e) => setNewDest({ ...newDest, category: e.target.value as any })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="culture-local-life">ážœáž”áŸ’áž”áž’áž˜áŸŒ & áž‡áž¸ážœáž—áž¶áž–áž¢áŸ’áž“áž€ážŸáŸ’ážšáž»áž€ (Culture)</option>
                    <option value="beaches-nature">áž†áŸ’áž“áŸážšážáŸ’ážŸáž¶áž…áŸ‹ & áž’áž˜áŸ’áž˜áž‡áž¶ážáž· (Nature)</option>
                    <option value="sports-activities">áž€áž¸áž¡áž¶ & áž•áŸ’ážŸáž„áž–áŸ’ážšáŸáž„ (Activities)</option>
                    <option value="restaurants">áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ & áž˜áŸ’áž áž¼áž”áž¢áž¶áž áž¶ážš (Dining)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž…áž˜áŸ’áž„áž¶áž™áž–áž¸ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš (km)</label>
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
                    <label className="block font-bold text-gray-700">ážšáž¼áž”áž—áž¶áž–áž‘áž¸ážáž¶áŸ†áž„ (Image Upload áž¬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”áž–áž¸áž‘áž¼ážšážŸáŸáž–áŸ’áž‘...</span>
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
                      placeholder="https://images.unsplash.com/... áž¬ Upload ážšáž¼áž”áž•áŸ’áž‘áž¶áž›áŸ‹"
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
                  {lang === "km" ? "áž”áŸ„áŸ‡áž”áž„áŸ‹" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "áž™áž›áŸ‹áž–áŸ’ážšáž˜áž”áž“áŸ’ážáŸ‚áž˜" : "Add Location"}
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
              <h3 className="font-siemreap font-bold text-base text-[#0c2340]">
                {lang === "km" ? "âœï¸ áž€áŸ‚áž”áŸ’ážšáŸ‚áž‘áž¸ážáž¶áŸ†áž„áž‘áŸážŸáž…ážšážŽáŸ" : "âœï¸ Edit Destination"}
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž‘áž¸ážáž¶áŸ†áž„ (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš) *
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
                    ážˆáŸ’áž˜áŸ„áŸ‡áž‘áž¸ážáž¶áŸ†áž„ (áž—áž¶ážŸáž¶áž¢áž„áŸ‹áž‚áŸ’áž›áŸážŸ) *
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
                  <label className="block font-bold text-gray-700 mb-1">áž”áŸ’ážšáž—áŸáž‘áž‘áž¸ážáž¶áŸ†áž„</label>
                  <select
                    value={editingDest.category}
                    onChange={(e) => setEditingDest({ ...editingDest, category: e.target.value as any })}
                    className="w-full bg-[#FAF8F4] border border-gray-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="culture-local-life">ážœáž”áŸ’áž”áž’áž˜áŸŒ & áž‡áž¸ážœáž—áž¶áž–áž¢áŸ’áž“áž€ážŸáŸ’ážšáž»áž€ (Culture)</option>
                    <option value="beaches-nature">áž†áŸ’áž“áŸážšážáŸ’ážŸáž¶áž…áŸ‹ & áž’áž˜áŸ’áž˜áž‡áž¶ážáž· (Nature)</option>
                    <option value="sports-activities">áž€áž¸áž¡áž¶ & áž•áŸ’ážŸáž„áž–áŸ’ážšáŸáž„ (Activities)</option>
                    <option value="restaurants">áž—áŸ„áž‡áž“áž¸áž™ážŠáŸ’áž‹áž¶áž“ & áž˜áŸ’áž áž¼áž”áž¢áž¶áž áž¶ážš (Dining)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">áž…áž˜áŸ’áž„áž¶áž™áž–áž¸ážŸážŽáŸ’áž‹áž¶áž‚áž¶ážš (km)</label>
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
                    <label className="block font-bold text-gray-700">ážšáž¼áž”áž—áž¶áž–áž‘áž¸ážáž¶áŸ†áž„ (Image Upload áž¬ URL)</label>
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-amber-800" />
                      <span>áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸážšáž¼áž”ážáŸ’áž˜áž¸...</span>
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
                  {lang === "km" ? "áž”áŸ„áŸ‡áž”áž„áŸ‹" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow"
                >
                  {lang === "km" ? "ážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž€áž¶ážšáž€áŸ‚áž”áŸ’ážšáŸ‚" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
