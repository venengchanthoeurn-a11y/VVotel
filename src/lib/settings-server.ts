import fs from "fs";
import path from "path";
import os from "os";
import { SiteSettings, DEFAULT_SETTINGS } from "./settings";

const SEED_SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");
const TMP_SETTINGS_FILE = path.join(os.tmpdir(), "vvotel_settings.json");

declare global {
  var _vvotelSettingsMemoryCache: SiteSettings | undefined;
}

export function getSiteSettings(): SiteSettings {
  if (globalThis._vvotelSettingsMemoryCache) {
    return globalThis._vvotelSettingsMemoryCache;
  }

  // 1. Try reading from TMP_SETTINGS_FILE (persisted during container lifetime)
  try {
    if (fs.existsSync(TMP_SETTINGS_FILE)) {
      const raw = fs.readFileSync(TMP_SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      globalThis._vvotelSettingsMemoryCache = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        features: {
          ...DEFAULT_SETTINGS.features,
          ...(parsed.features || {}),
        },
      };
      return globalThis._vvotelSettingsMemoryCache!;
    }
  } catch (err) {
    // Continue to seed file
  }

  // 2. Try reading from project data/settings.json
  try {
    if (fs.existsSync(SEED_SETTINGS_FILE)) {
      const raw = fs.readFileSync(SEED_SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      globalThis._vvotelSettingsMemoryCache = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        features: {
          ...DEFAULT_SETTINGS.features,
          ...(parsed.features || {}),
        },
      };
      return globalThis._vvotelSettingsMemoryCache!;
    }
  } catch (err) {
    console.warn("Failed to read settings.json, using defaults:", err);
  }

  globalThis._vvotelSettingsMemoryCache = { ...DEFAULT_SETTINGS };
  return globalThis._vvotelSettingsMemoryCache;
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
    _isUserCustomized: true,
    updatedAt: new Date().toISOString(),
  };

  globalThis._vvotelSettingsMemoryCache = merged;

  // 1. Write to /tmp for Vercel Serverless persistence
  try {
    const tmpDir = path.dirname(TMP_SETTINGS_FILE);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(TMP_SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write to tmp settings file:", err);
  }

  // 2. Write to data/settings.json if writable (local dev, or during build)
  try {
    const dir = path.dirname(SEED_SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SEED_SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    // Expected on Vercel Lambda read-only FS
  }

  return merged;
}
