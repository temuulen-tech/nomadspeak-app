/**
 * storage.js
 * Centralized persistence keys and local/session storage helpers.
 */

import { STORAGE_KEYS as APP_STORAGE_KEYS } from "./constants.js";

export const STORAGE_KEYS = {
  ttsSettings: APP_STORAGE_KEYS.TTS_SETTINGS,
  legacyTtsRate: APP_STORAGE_KEYS.LEGACY_TTS_RATE,
  soundEnabled: APP_STORAGE_KEYS.SOUND_ENABLED,
  progressSettings: APP_STORAGE_KEYS.PROGRESS_SETTINGS,
  appTimeDailyTotals: APP_STORAGE_KEYS.APP_TIME_DAILY_TOTALS,
  appTimeActiveSession: APP_STORAGE_KEYS.APP_TIME_ACTIVE_SESSION,
  profileName: APP_STORAGE_KEYS.PROFILE_NAME,
  premium: APP_STORAGE_KEYS.PREMIUM,
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
