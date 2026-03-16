/**
 * storage.js
 * Centralized persistence keys and local/session storage helpers.
 */

export const STORAGE_KEYS = {
  ttsSettings: "nomadspeak:tts:v1",
  legacyTtsRate: "ttsRate",
  soundEnabled: "soundEnabled",
  progressSettings: "nomadProgress",
  appTimeDailyTotals: "appTimeDailyTotals",
  appTimeActiveSession: "appTimeActiveSession",
  profileName: "nomadProfileName",
  premium: "isPremium",
};

export function loadJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

export function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_) {
    return false;
  }
}

export function loadString(key, fallback = "") {
  const value = localStorage.getItem(key);
  return value == null ? fallback : value;
}

export function saveString(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (_) {
    return false;
  }
}
