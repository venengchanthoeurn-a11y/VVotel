"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SiteSettings, DEFAULT_SETTINGS } from "@/lib/settings";

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

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn("Could not load dynamic settings from API, using defaults:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen for custom settings update events across browser tabs/windows
    const handleSettingsUpdated = () => {
      fetchSettings();
    };

    window.addEventListener("vvotel-settings-updated", handleSettingsUpdated);
    window.addEventListener("storage", (e) => {
      if (e.key === "vvotel_settings_sync") {
        fetchSettings();
      }
    });

    return () => {
      window.removeEventListener("vvotel-settings-updated", handleSettingsUpdated);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          // Broadcast to all active tabs and windows
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("vvotel-settings-updated"));
            localStorage.setItem("vvotel_settings_sync", Date.now().toString());
          }
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Failed to update settings:", err);
      return false;
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
