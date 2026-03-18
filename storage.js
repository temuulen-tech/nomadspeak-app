/**
 * storage.js
 * Centralized persistence keys and local/session storage helpers.
 */

import { CURRENT_SAVE_VERSION, STORAGE_KEYS as APP_STORAGE_KEYS } from "./constants.js";
import { createDefaultProgressState, DEFAULT_TTS_SETTINGS, normalizeProgressState, normalizeTtsSettings } from "./state.js";

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

function isRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value);
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

function loadBooleanString(key, fallback = false) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw === "true" || raw === "on";
  } catch (_) {
    return fallback;
  }
}

function sanitizeProfileName(rawProfileName) {
  return typeof rawProfileName === "string" ? rawProfileName.trim() : "";
}

function loadRawSaveData() {
  return {
    saveVersion: undefined,
    progress: loadJson(STORAGE_KEYS.progressSettings, null),
    ttsSettings: loadJson(STORAGE_KEYS.ttsSettings, null),
    legacyTtsRate: Number(localStorage.getItem(STORAGE_KEYS.legacyTtsRate)),
    soundEnabled: loadBooleanString(STORAGE_KEYS.soundEnabled, true),
    premium: loadBooleanString(STORAGE_KEYS.premium, false),
    profileName: loadString(STORAGE_KEYS.profileName, ""),
  };
}

/**
 * Upgrades any older or incomplete local save shape to the current schema
 * without discarding player progress unless the source data is unusable.
 */
export function migrateSaveData(rawSaveData = {}) {
  const defaultProgress = createDefaultProgressState();
  const rawProgress = isRecord(rawSaveData.progress) ? rawSaveData.progress : {};
  const detectedVersion = Number.isFinite(Number(rawProgress.saveVersion))
    ? Math.max(0, Math.floor(Number(rawProgress.saveVersion)))
    : 0;

  let progress = normalizeProgressState(rawProgress);

  if (detectedVersion < 1) {
    progress = normalizeProgressState({
      ...defaultProgress,
      ...rawProgress,
      xp: rawProgress.xp ?? rawProgress.xpTotal ?? defaultProgress.xp,
      streak: rawProgress.streak ?? rawProgress.streakDays ?? defaultProgress.streak,
      dailyGoalXP: rawProgress.dailyGoalXP ?? defaultProgress.dailyGoalXP,
      dailyGoalCount: rawProgress.dailyGoalCount ?? defaultProgress.dailyGoalCount,
      rewardTierUnlocked: rawProgress.rewardTierUnlocked ?? defaultProgress.rewardTierUnlocked,
      weeklyMinutes: Array.isArray(rawProgress.weeklyMinutes) ? rawProgress.weeklyMinutes : defaultProgress.weeklyMinutes,
      dailyXP: rawProgress.dailyXP ?? defaultProgress.dailyXP,
      dailyCompleted: rawProgress.dailyCompleted ?? defaultProgress.dailyCompleted,
    });
  }

  const rawTtsSettings = isRecord(rawSaveData.ttsSettings) ? rawSaveData.ttsSettings : null;
  const hasLegacyRate = Number.isFinite(rawSaveData.legacyTtsRate) && rawSaveData.legacyTtsRate >= 0.45 && rawSaveData.legacyTtsRate <= 1.4;
  const ttsSettings = rawTtsSettings
    ? normalizeTtsSettings(rawTtsSettings)
    : normalizeTtsSettings(hasLegacyRate ? { ...DEFAULT_TTS_SETTINGS, rate: rawSaveData.legacyTtsRate } : DEFAULT_TTS_SETTINGS);

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    progress: {
      ...progress,
      saveVersion: CURRENT_SAVE_VERSION,
    },
    settings: {
      ttsSettings,
      soundEnabled: Boolean(rawSaveData.soundEnabled),
      premium: Boolean(rawSaveData.premium),
      profileName: sanitizeProfileName(rawSaveData.profileName),
    },
  };
}

/**
 * Triggers save migration during normal startup loading and writes the
 * normalized result back to storage so future reads stay on one schema.
 */
export function loadAppSaveData() {
  const migratedSave = migrateSaveData(loadRawSaveData());
  persistProgressState(migratedSave.progress);
  persistTtsSettings(migratedSave.settings.ttsSettings);
  persistSoundSetting(migratedSave.settings.soundEnabled);
  persistPremiumStatus(migratedSave.settings.premium);
  persistProfileName(migratedSave.settings.profileName);
  return migratedSave;
}

export function persistProgressState(progressState) {
  const normalized = {
    ...normalizeProgressState(progressState),
    saveVersion: CURRENT_SAVE_VERSION,
  };
  return saveJson(STORAGE_KEYS.progressSettings, normalized);
}

export function persistTtsSettings(ttsSettings) {
  const normalized = normalizeTtsSettings(ttsSettings);
  const saved = saveJson(STORAGE_KEYS.ttsSettings, normalized);
  saveString(STORAGE_KEYS.legacyTtsRate, String(normalized.rate));
  return saved;
}

export function persistSoundSetting(soundEnabled) {
  return saveString(STORAGE_KEYS.soundEnabled, soundEnabled ? "true" : "false");
}

export function persistPremiumStatus(isPremium) {
  return saveString(STORAGE_KEYS.premium, isPremium ? "true" : "false");
}

export function persistProfileName(profileName) {
  return saveString(STORAGE_KEYS.profileName, sanitizeProfileName(profileName));
}
