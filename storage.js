/**
 * storage.js
 * Centralized persistence keys and raw local/session storage helpers.
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
  debugMode: APP_STORAGE_KEYS.DEBUG_MODE,
  learnedWords: "nomadspeak:learned-words",
  unlockedChapterIds: "nomadspeak:unlocked-chapter-ids",
  rewardsWallet: "nomadspeak:rewards-wallet",
  processedRewardIds: "nomadspeak:processed-reward-ids",
  selectedWorldId: "nomadspeak:selected-world-id",
  selectedDifficultyId: "nomadspeak:selected-difficulty-id",
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
  try {
    const value = localStorage.getItem(key);
    return value == null ? fallback : value;
  } catch (_) {
    return fallback;
  }
}

export function saveString(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (_) {
    return false;
  }
}

export function loadBoolean(key, fallback = false) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw === "true" || raw === "on";
  } catch (_) {
    return fallback;
  }
}

export function loadAppState() {
  return {
    progress: loadJson(STORAGE_KEYS.progressSettings, null),
    settings: {
      ttsSettings: loadJson(STORAGE_KEYS.ttsSettings, null),
      soundEnabled: loadBoolean(STORAGE_KEYS.soundEnabled, true),
      premium: loadBoolean(STORAGE_KEYS.premium, false),
      profileName: loadString(STORAGE_KEYS.profileName, ""),
      legacyTtsRate: Number(loadString(STORAGE_KEYS.legacyTtsRate, "")),
    },
    rewardsWallet: loadJson(STORAGE_KEYS.rewardsWallet, null),
    processedRewardIds: loadJson(STORAGE_KEYS.processedRewardIds, null),
    learnedWords: loadJson(STORAGE_KEYS.learnedWords, null),
    unlockedChapterIds: loadJson(STORAGE_KEYS.unlockedChapterIds, null),
    selectedWorldId: loadString(STORAGE_KEYS.selectedWorldId, ""),
    selectedDifficultyId: loadString(STORAGE_KEYS.selectedDifficultyId, ""),
  };
}

export function saveAppState(coreState = {}) {
  const settings = coreState.settings || {};
  saveJson(STORAGE_KEYS.progressSettings, coreState.progress ?? null);
  saveJson(STORAGE_KEYS.ttsSettings, settings.ttsSettings ?? null);
  if (settings.ttsSettings?.rate != null) saveString(STORAGE_KEYS.legacyTtsRate, String(settings.ttsSettings.rate));
  saveString(STORAGE_KEYS.soundEnabled, settings.soundEnabled ? "true" : "false");
  saveString(STORAGE_KEYS.premium, settings.premium ? "true" : "false");
  saveString(STORAGE_KEYS.profileName, typeof settings.profileName === "string" ? settings.profileName : "");
  saveJson(STORAGE_KEYS.rewardsWallet, coreState.rewardsWallet ?? null);
  saveJson(STORAGE_KEYS.processedRewardIds, coreState.processedRewardIds ?? []);
  saveJson(STORAGE_KEYS.learnedWords, coreState.learnedWords ?? []);
  saveJson(STORAGE_KEYS.unlockedChapterIds, coreState.unlockedChapterIds ?? []);
  saveString(STORAGE_KEYS.selectedWorldId, coreState.selectedWorldId ?? "");
  saveString(STORAGE_KEYS.selectedDifficultyId, coreState.selectedDifficultyId ?? "");
  return coreState;
}

export function persistDebugModeSetting(enabled) {
  return saveString(STORAGE_KEYS.debugMode, enabled ? "on" : "off");
}

export function clearAppSaveData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (_) {
      // ignore private mode/storage quota issues during debug resets
    }
  });
}
