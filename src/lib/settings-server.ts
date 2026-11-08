import fs from "fs";
import path from "path";
import { SiteSettings, DEFAULT_SETTINGS } from "./settings";

// Storage file location
const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

let memorySettingsCache: SiteSettings | null = null;

export function getSiteSettings(): SiteSettings {
  if (memorySettingsCache) {
    return memorySettingsCache;
  }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      // Merge with default in case new fields were added
      memorySettingsCache = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        features: {
          ...DEFAULT_SETTINGS.features,
          ...(parsed.features || {}),
        },
      };
      return memorySettingsCache!;
    }
  } catch (err) {
    console.error("Failed to read settings.json, using defaults:", err);
  }

  memorySettingsCache = { ...DEFAULT_SETTINGS };
  return memorySettingsCache;
}

export function saveSiteSettings(newSettings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const merged: SiteSettings = {
    ...current,
    ...newSettings,
    features: {
      ...current.features,
      ...(newSettings.features || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
    memorySettingsCache = merged;
  } catch (err) {
    console.error("Failed to save settings.json:", err);
    memorySettingsCache = merged;
  }

  return merged;
}
