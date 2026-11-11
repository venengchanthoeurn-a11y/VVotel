"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SiteSettings, DEFAULT_SETTINGS, sanitizeMediaSettings } from "@/lib/settings";
import { recordClientAutoBackup } from "@/lib/clientBackup";
import { BookingRecord } from "@/lib/bookings";

const PERSISTED_SETTINGS_KEY = "vvotel_persisted_site_settings_v4";

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: async () => false,
});

function sanitizeSettingsMedia(st: any): SiteSettings {
  return sanitizeMediaSettings(st);
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Synchronously load from localStorage on client mount so settings are instantly restored
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // Purge obsolete legacy storage keys that may contain old building or pool photos
        localStorage.removeItem("vvotel_persisted_site_settings");
        localStorage.removeItem("vvotel_persisted_site_settings_v2");
        localStorage.removeItem("vvotel_persisted_site_settings_v3");
      }
      const local = localStorage.getItem(PERSISTED_SETTINGS_KEY);
      if (local) {
        const rawParsed = JSON.parse(local);
        const parsed = sanitizeSettingsMedia(rawParsed);
        // Overwrite localStorage with sanitized version so broken URLs are permanently eradicated
        localStorage.setItem(PERSISTED_SETTINGS_KEY, JSON.stringify(parsed));
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          features: {
            ...prev.features,
            ...(parsed.features || {}),
          },
        }));
        setLoading(false);
      }
    } catch (e) {
      console.warn("Could not parse cached settings:", e);
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          let activeSettings = sanitizeSettingsMedia(data.settings);

          // Check if local cache has user edits that must be preserved
          if (typeof window !== "undefined") {
            try {
              const local = localStorage.getItem(PERSISTED_SETTINGS_KEY);
              if (local) {
                const parsedLocal = sanitizeSettingsMedia(JSON.parse(local));
                const localIsCustomized = Boolean(parsedLocal._isUserCustomized);
                const serverIsCustomized = Boolean(data.settings._isUserCustomized);

                const localTime = parsedLocal.updatedAt ? new Date(parsedLocal.updatedAt).getTime() : 0;
                const serverTime = data.settings.updatedAt ? new Date(data.settings.updatedAt).getTime() : 0;

                // Rule 1: If local has user customization but server does not, LOCAL ALWAYS WINS!
                // Rule 2: If both are customized, newer timestamp wins.
                if (localIsCustomized && (!serverIsCustomized || localTime >= serverTime)) {
                  activeSettings = sanitizeSettingsMedia({
                    ...data.settings,
                    ...parsedLocal,
                    _isUserCustomized: true,
                    features: {
                      ...data.settings.features,
                      ...(parsedLocal.features || {}),
                    },
                  });

                  // Re-sync local user customizations to server container in background if privileged
                  if (data.isPrivileged) {
                    fetch("/api/settings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(activeSettings),
                    }).catch(() => {});
                  }
                } else if (serverIsCustomized && serverTime > localTime) {
                  activeSettings = sanitizeSettingsMedia({
                    ...data.settings,
                    _isUserCustomized: true,
                  });
                } else if (localIsCustomized) {
                  activeSettings = sanitizeSettingsMedia({
                    ...data.settings,
                    ...parsedLocal,
                    _isUserCustomized: true,
                  });
                }
              }
            } catch (e) {}
          }

          activeSettings = sanitizeSettingsMedia(activeSettings);
          setSettings(activeSettings);
          if (typeof window !== "undefined") {
            localStorage.setItem(PERSISTED_SETTINGS_KEY, JSON.stringify(activeSettings));
          }
        }
      }
    } catch (err) {
      console.warn("Could not load dynamic settings from API, using cached:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen for custom settings update events across browser tabs/windows
    const handleSettingsUpdated = () => {
      try {
        const local = localStorage.getItem(PERSISTED_SETTINGS_KEY);
        if (local) {
          setSettings(JSON.parse(local));
        }
      } catch (e) {}
      fetchSettings();
    };

    window.addEventListener("vvotel-settings-updated", handleSettingsUpdated);
    window.addEventListener("storage", (e) => {
      if (e.key === "vvotel_settings_sync" || e.key === PERSISTED_SETTINGS_KEY) {
        handleSettingsUpdated();
      }
    });

    // Background continuous auto-backup interval: every 5 minutes
    const backupInterval = setInterval(() => {
      try {
        let currentBookings: BookingRecord[] = [];
        const raw = localStorage.getItem("vvotel_client_bookings");
        if (raw) currentBookings = JSON.parse(raw);
        recordClientAutoBackup(settings, currentBookings, "interval", "ការបម្រុងទុកស្វ័យប្រវត្តរៀងរាល់ ៥ នាទី (5-Min Auto Backup)");
      } catch (e) {}
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("vvotel-settings-updated", handleSettingsUpdated);
      clearInterval(backupInterval);
    };
  }, [settings]);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    try {
      const merged: SiteSettings = sanitizeSettingsMedia({
        ...settings,
        ...newSettings,
        features: {
          ...settings.features,
          ...(newSettings.features || {}),
        },
        _isUserCustomized: true,
        updatedAt: new Date().toISOString(),
      });

      // 1. Immediately persist to localStorage for permanent retention across sessions
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(PERSISTED_SETTINGS_KEY, JSON.stringify(merged));
          localStorage.setItem("vvotel_settings_sync", Date.now().toString());
          window.dispatchEvent(new CustomEvent("vvotel-settings-updated"));

          // Auto-backup snapshot on every change
          let clientBookings: BookingRecord[] = [];
          const rawB = localStorage.getItem("vvotel_client_bookings");
          if (rawB) clientBookings = JSON.parse(rawB);
          recordClientAutoBackup(merged, clientBookings, "auto_change", "កែប្រែការកំណត់ប្រព័ន្ធ (Settings Updated)");
        } catch (e) {}
      }

      setSettings(merged);

      // 2. Persist to server backend API
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(PERSISTED_SETTINGS_KEY, JSON.stringify(data.settings));
            } catch (e) {}
          }
          return true;
        }
      }
      return true; // Succeeded locally
    } catch (err) {
      console.error("Failed to update settings:", err);
      return true; // Still persisted in client localStorage
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
