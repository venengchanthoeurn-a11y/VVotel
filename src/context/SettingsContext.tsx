"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SiteSettings, DEFAULT_SETTINGS } from "@/lib/settings";

const PERSISTED_SETTINGS_KEY = "vvotel_persisted_site_settings";

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

  // Synchronously load from localStorage on client mount so settings are instantly restored
  useEffect(() => {
    try {
      const local = localStorage.getItem(PERSISTED_SETTINGS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
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
          let activeSettings = data.settings;

          // Check if local cache has newer edits that haven't synced yet
          if (typeof window !== "undefined") {
            try {
              const local = localStorage.getItem(PERSISTED_SETTINGS_KEY);
              if (local) {
                const parsedLocal = JSON.parse(local);
                if (
                  parsedLocal.updatedAt &&
                  data.settings.updatedAt &&
                  new Date(parsedLocal.updatedAt).getTime() > new Date(data.settings.updatedAt).getTime()
                ) {
                  activeSettings = {
                    ...data.settings,
                    ...parsedLocal,
                    features: {
                      ...data.settings.features,
                      ...(parsedLocal.features || {}),
                    },
                  };

                  // Sync newer local edits to server in background
                  fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(activeSettings),
                  }).catch(() => {});
                }
              }
            } catch (e) {}
          }

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

    return () => {
      window.removeEventListener("vvotel-settings-updated", handleSettingsUpdated);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    try {
      const merged: SiteSettings = {
        ...settings,
        ...newSettings,
        features: {
          ...settings.features,
          ...(newSettings.features || {}),
        },
        updatedAt: new Date().toISOString(),
      };

      // 1. Immediately persist to localStorage for permanent retention across sessions
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(PERSISTED_SETTINGS_KEY, JSON.stringify(merged));
          localStorage.setItem("vvotel_settings_sync", Date.now().toString());
          window.dispatchEvent(new CustomEvent("vvotel-settings-updated"));
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
