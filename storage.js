/**
 * storage.js
 * Centralized persistence keys and raw local/session storage helpers.
 */

import { STORAGE_KEYS as APP_STORAGE_KEYS } from "./constants.js";

export const STORAGE_KEYS = {
  appStateSnapshot: "nomadspeak:app-state-snapshot",
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
  reviewQueue: "nomadspeak:review-queue",
};

function buildSerializableAppState(coreState = {}) {
  const settings = coreState.settings || {};
  return {
    progress: coreState.progress ?? null,
    settings: {
      ttsSettings: settings.ttsSettings ?? null,
      soundEnabled: Boolean(settings.soundEnabled),
      premium: Boolean(settings.premium),
      profileName: typeof settings.profileName === "string" ? settings.profileName : "",
      legacyTtsRate: settings.ttsSettings?.rate != null ? Number(settings.ttsSettings.rate) : Number(loadString(STORAGE_KEYS.legacyTtsRate, "")),
    },
    rewardsWallet: coreState.rewardsWallet ?? null,
    processedRewardIds: coreState.processedRewardIds ?? [],
    learnedWords: coreState.learnedWords ?? [],
    unlockedChapterIds: coreState.unlockedChapterIds ?? [],
    selectedWorldId: coreState.selectedWorldId ?? "",
    selectedDifficultyId: coreState.selectedDifficultyId ?? "",
    reviewQueue: coreState.reviewQueue ?? [],
  };
}

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
  const snapshot = loadJson(STORAGE_KEYS.appStateSnapshot, null);
  const snapshotState = snapshot && typeof snapshot === "object" ? snapshot : {};
  const snapshotSettings = snapshotState.settings && typeof snapshotState.settings === "object" ? snapshotState.settings : {};
  const hasStoredValue = (value) => value !== null && value !== "";

  return {
    progress: loadJson(STORAGE_KEYS.progressSettings, snapshotState.progress ?? null),
    settings: {
      ttsSettings: loadJson(STORAGE_KEYS.ttsSettings, snapshotSettings.ttsSettings ?? null),
      soundEnabled: hasStoredValue(loadString(STORAGE_KEYS.soundEnabled, null))
        ? loadBoolean(STORAGE_KEYS.soundEnabled, true)
        : Boolean(snapshotSettings.soundEnabled),
      premium: hasStoredValue(loadString(STORAGE_KEYS.premium, null))
        ? loadBoolean(STORAGE_KEYS.premium, false)
        : Boolean(snapshotSettings.premium),
      profileName: loadString(STORAGE_KEYS.profileName, snapshotSettings.profileName ?? ""),
      legacyTtsRate: Number(loadString(STORAGE_KEYS.legacyTtsRate, String(snapshotSettings.legacyTtsRate ?? ""))),
    },
    rewardsWallet: loadJson(STORAGE_KEYS.rewardsWallet, snapshotState.rewardsWallet ?? null),
    processedRewardIds: loadJson(STORAGE_KEYS.processedRewardIds, snapshotState.processedRewardIds ?? null),
    learnedWords: loadJson(STORAGE_KEYS.learnedWords, snapshotState.learnedWords ?? null),
    unlockedChapterIds: loadJson(STORAGE_KEYS.unlockedChapterIds, snapshotState.unlockedChapterIds ?? null),
    selectedWorldId: loadString(STORAGE_KEYS.selectedWorldId, snapshotState.selectedWorldId ?? ""),
    selectedDifficultyId: loadString(STORAGE_KEYS.selectedDifficultyId, snapshotState.selectedDifficultyId ?? ""),
    reviewQueue: loadJson(STORAGE_KEYS.reviewQueue, snapshotState.reviewQueue ?? null),
  };
}

export function saveAppState(coreState = {}) {
  const serializableState = buildSerializableAppState(coreState);
  const settings = serializableState.settings || {};
  saveJson(STORAGE_KEYS.appStateSnapshot, serializableState);
  saveJson(STORAGE_KEYS.progressSettings, serializableState.progress);
  saveJson(STORAGE_KEYS.ttsSettings, settings.ttsSettings ?? null);
  if (settings.ttsSettings?.rate != null) saveString(STORAGE_KEYS.legacyTtsRate, String(settings.ttsSettings.rate));
  saveString(STORAGE_KEYS.soundEnabled, settings.soundEnabled ? "true" : "false");
  saveString(STORAGE_KEYS.premium, settings.premium ? "true" : "false");
  saveString(STORAGE_KEYS.profileName, settings.profileName || "");
  saveJson(STORAGE_KEYS.rewardsWallet, serializableState.rewardsWallet);
  saveJson(STORAGE_KEYS.processedRewardIds, serializableState.processedRewardIds);
  saveJson(STORAGE_KEYS.learnedWords, serializableState.learnedWords);
  saveJson(STORAGE_KEYS.unlockedChapterIds, serializableState.unlockedChapterIds);
  saveString(STORAGE_KEYS.selectedWorldId, serializableState.selectedWorldId);
  saveString(STORAGE_KEYS.selectedDifficultyId, serializableState.selectedDifficultyId);
  saveJson(STORAGE_KEYS.reviewQueue, serializableState.reviewQueue);
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
