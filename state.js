/**
 * state.js
 * Shared runtime app state and small accessor helpers.
 */

import { BOARD_SELECTOR_STEPS, CURRENT_SAVE_VERSION, DIFFICULTY_LEVELS, SCREEN_NAMES } from "./constants.js";
import { getDefaultChapterForWorld } from "./chapters.js";
import { DEFAULT_WORLD_ID, getSelectableBoardWorlds } from "./worlds.js";

export const DEFAULT_DAILY_GOAL = 10;

export const DEFAULT_TTS_SETTINGS = {
  voice: "auto",
  rate: 0.85,
};

export function createDefaultProgressState() {
  return {
    xp: 35,
    level: 1,
    streak: 1,
    lastActiveDate: null,
    lastStatsDate: null,
    dailyGoalXP: DEFAULT_DAILY_GOAL,
    dailyGoalCount: 10,
    todayCount: 2,
    todayMinutes: 8,
    todaySecondsRemainder: 0,
    weeklyMinutes: [12, 18, 9, 16, 20, 11, 8],
    rewardTierUnlocked: 1,
    xpTotal: 35,
    streakDays: 1,
    dailyXP: 0,
    dailyCompleted: false,
    saveVersion: CURRENT_SAVE_VERSION,
  };
}

function toPlainObject(value) {
  return value && typeof value === "object" ? value : {};
}

export function normalizeProgressState(raw = {}) {
  const source = toPlainObject(raw);
  const defaults = createDefaultProgressState();
  const configuredDailyGoal = Number.isFinite(Number(source.dailyGoalXP)) && Number(source.dailyGoalXP) > 0
    ? Math.floor(Number(source.dailyGoalXP))
    : defaults.dailyGoalXP;
  const xp = Number.isFinite(Number(source.xp))
    ? Math.max(0, Math.floor(Number(source.xp)))
    : (Number.isFinite(Number(source.xpTotal)) ? Math.max(0, Math.floor(Number(source.xpTotal))) : defaults.xp);
  const streak = Number.isFinite(Number(source.streak))
    ? Math.max(0, Math.floor(Number(source.streak)))
    : (Number.isFinite(Number(source.streakDays)) ? Math.max(0, Math.floor(Number(source.streakDays))) : defaults.streak);
  const todayCount = Number.isFinite(Number(source.todayCount)) ? Math.max(0, Math.floor(Number(source.todayCount))) : defaults.todayCount;
  const todayMinutes = Number.isFinite(Number(source.todayMinutes)) ? Math.max(0, Math.floor(Number(source.todayMinutes))) : defaults.todayMinutes;
  const todaySecondsRemainder = Number.isFinite(Number(source.todaySecondsRemainder)) ? Math.max(0, Math.floor(Number(source.todaySecondsRemainder))) : defaults.todaySecondsRemainder;
  const weeklyRaw = Array.isArray(source.weeklyMinutes) ? source.weeklyMinutes : [];
  const weeklyMinutes = Array.from({ length: 7 }, (_, index) => {
    const source = weeklyRaw[index];
    const fallback = [...defaults.weeklyMinutes.slice(0, 6), todayMinutes][index];
    return Number.isFinite(Number(source)) ? Math.max(0, Math.floor(Number(source))) : fallback;
  });
  const rewardTierUnlocked = Number.isFinite(Number(source.rewardTierUnlocked)) ? Math.max(1, Math.min(5, Math.floor(Number(source.rewardTierUnlocked)))) : defaults.rewardTierUnlocked;
  const level = Math.floor(xp / 100) + 1;

  return {
    xp,
    level,
    streak,
    lastActiveDate: typeof source.lastActiveDate === "string" ? source.lastActiveDate : defaults.lastActiveDate,
    lastStatsDate: typeof source.lastStatsDate === "string" ? source.lastStatsDate : defaults.lastStatsDate,
    dailyGoalXP: configuredDailyGoal,
    dailyGoalCount: Number.isFinite(Number(source.dailyGoalCount)) && Number(source.dailyGoalCount) > 0 ? Math.floor(Number(source.dailyGoalCount)) : defaults.dailyGoalCount,
    todayCount,
    todayMinutes,
    todaySecondsRemainder,
    weeklyMinutes,
    rewardTierUnlocked,
    xpTotal: xp,
    streakDays: streak,
    dailyXP: Number.isFinite(Number(source.dailyXP)) ? Math.max(0, Number(source.dailyXP)) : defaults.dailyXP,
    dailyCompleted: Boolean(source.dailyCompleted),
    saveVersion: CURRENT_SAVE_VERSION,
  };
}

export function normalizeTtsSettings(rawSettings = {}) {
  const source = toPlainObject(rawSettings);
  const voice = ["auto", "male", "female"].includes(source.voice)
    ? source.voice
    : DEFAULT_TTS_SETTINGS.voice;

  const rateCandidate = Number(source.rate);
  const rate = Number.isFinite(rateCandidate) && rateCandidate >= 0.45 && rateCandidate <= 1.4
    ? Math.round(rateCandidate * 20) / 20
    : DEFAULT_TTS_SETTINGS.rate;

  return { voice, rate };
}

export function normalizeRewardsWallet(rawWallet = {}) {
  const source = toPlainObject(rawWallet);
  return {
    coins: Math.max(0, Math.floor(Number(source.coins) || 0)),
    gems: Math.max(0, Math.floor(Number(source.gems) || 0)),
  };
}

export function createDefaultBoardEntryState() {
  return {
    step: BOARD_SELECTOR_STEPS.ENTRY,
    worldId: DEFAULT_WORLD_ID,
    difficultyId: DIFFICULTY_LEVELS.BEGINNER,
    chapterId: getDefaultChapterForWorld(DEFAULT_WORLD_ID)?.id || null,
  };
}

export function createDefaultCoreState() {
  return {
    progress: createDefaultProgressState(),
    settings: {
      ttsSettings: { ...DEFAULT_TTS_SETTINGS },
      soundEnabled: true,
      premium: false,
      profileName: "",
    },
    rewardsWallet: normalizeRewardsWallet(),
    learnedWords: [],
    unlockedChapterIds: [],
    selectedWorldId: DEFAULT_WORLD_ID,
    selectedDifficultyId: DIFFICULTY_LEVELS.BEGINNER,
  };
}

export function normalizeCoreState(rawCore = {}) {
  const source = toPlainObject(rawCore);
  const defaults = createDefaultCoreState();
  const selectableWorldIds = new Set(getSelectableBoardWorlds().map((world) => world.id));
  const rawSettings = source.settings && typeof source.settings === "object" ? source.settings : {};
  const learnedWords = Array.isArray(source.learnedWords)
    ? [...new Set(source.learnedWords.map((word) => String(word || "").trim()).filter(Boolean))]
    : defaults.learnedWords;
  const unlockedChapterIds = Array.isArray(source.unlockedChapterIds)
    ? [...new Set(source.unlockedChapterIds.map((id) => String(id || "").trim()).filter(Boolean))]
    : defaults.unlockedChapterIds;

  return {
    progress: normalizeProgressState(source.progress),
    settings: {
      ttsSettings: normalizeTtsSettings(rawSettings.ttsSettings),
      soundEnabled: typeof rawSettings.soundEnabled === "boolean" ? rawSettings.soundEnabled : defaults.settings.soundEnabled,
      premium: typeof rawSettings.premium === "boolean" ? rawSettings.premium : defaults.settings.premium,
      profileName: typeof rawSettings.profileName === "string" ? rawSettings.profileName.trim() : defaults.settings.profileName,
    },
    rewardsWallet: normalizeRewardsWallet(source.rewardsWallet),
    learnedWords,
    unlockedChapterIds,
    selectedWorldId: typeof source.selectedWorldId === "string" && selectableWorldIds.has(source.selectedWorldId)
      ? source.selectedWorldId
      : defaults.selectedWorldId,
    selectedDifficultyId: Object.values(DIFFICULTY_LEVELS).includes(source.selectedDifficultyId) ? source.selectedDifficultyId : defaults.selectedDifficultyId,
  };
}

export function buildCoreStateFromStorage(rawSave = {}) {
  const source = toPlainObject(rawSave);
  const defaults = createDefaultCoreState();
  const rawProgress = source.progress && typeof source.progress === "object" ? source.progress : {};
  const detectedVersion = Number.isFinite(Number(rawProgress.saveVersion))
    ? Math.max(0, Math.floor(Number(rawProgress.saveVersion)))
    : 0;

  let progress = normalizeProgressState(rawProgress);
  if (detectedVersion < 1) {
    progress = normalizeProgressState({
      ...defaults.progress,
      ...rawProgress,
      xp: rawProgress.xp ?? rawProgress.xpTotal ?? defaults.progress.xp,
      streak: rawProgress.streak ?? rawProgress.streakDays ?? defaults.progress.streak,
      dailyGoalXP: rawProgress.dailyGoalXP ?? defaults.progress.dailyGoalXP,
      dailyGoalCount: rawProgress.dailyGoalCount ?? defaults.progress.dailyGoalCount,
      rewardTierUnlocked: rawProgress.rewardTierUnlocked ?? defaults.progress.rewardTierUnlocked,
      weeklyMinutes: Array.isArray(rawProgress.weeklyMinutes) ? rawProgress.weeklyMinutes : defaults.progress.weeklyMinutes,
      dailyXP: rawProgress.dailyXP ?? defaults.progress.dailyXP,
      dailyCompleted: rawProgress.dailyCompleted ?? defaults.progress.dailyCompleted,
    });
  }

  const rawSettings = source.settings && typeof source.settings === "object" ? source.settings : {};
  const legacyRate = Number(rawSettings.legacyTtsRate);
  const ttsSettings = rawSettings.ttsSettings
    ? normalizeTtsSettings(rawSettings.ttsSettings)
    : normalizeTtsSettings(Number.isFinite(legacyRate) ? { ...DEFAULT_TTS_SETTINGS, rate: legacyRate } : DEFAULT_TTS_SETTINGS);

  return normalizeCoreState({
    ...defaults,
    ...source,
    progress,
    settings: {
      ...defaults.settings,
      ...rawSettings,
      ttsSettings,
    },
    rewardsWallet: source.rewardsWallet,
    learnedWords: source.learnedWords,
    unlockedChapterIds: source.unlockedChapterIds,
    selectedWorldId: source.selectedWorldId,
    selectedDifficultyId: source.selectedDifficultyId,
  });
}

const state = {
  currentScreen: SCREEN_NAMES.START,
  level: DIFFICULTY_LEVELS.BEGINNER,
  flow: {
    lastRequestedScreen: SCREEN_NAMES.START,
    boardEntry: createDefaultBoardEntryState(),
  },
  lesson: { currentIndex: 0, score: 0, locked: false, reviewMode: false },
  core: createDefaultCoreState(),
  rewards: {},
  difficulty: { qa: null, sentenceGame: DIFFICULTY_LEVELS.BEGINNER },
  flags: {},
};

const stateListeners = new Set();

function notifyStateListeners(scope = "app") {
  stateListeners.forEach((listener) => {
    try {
      listener(state, scope);
    } catch (_) {
      // keep state notifications best-effort only
    }
  });
}

export function subscribeState(listener) {
  if (typeof listener !== "function") return () => {};
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}


export function getState() { return state; }
export function getStateValue(key) { return state[key]; }
export function setStateValue(key, value) { state[key] = value; return state[key]; }
export function updateState(mutator) { if (typeof mutator === "function") mutator(state); return state; }

export function getBoardEntryState() { return state.flow.boardEntry; }

export function updateBoardEntryState(patch = {}) {
  const nextEntry = { ...state.flow.boardEntry, ...patch };
  if (!nextEntry.chapterId) {
    nextEntry.chapterId = getDefaultChapterForWorld(nextEntry.worldId)?.id || null;
  }
  state.flow.boardEntry = nextEntry;
  return state.flow.boardEntry;
}

export function resetBoardEntryState() {
  state.flow.boardEntry = createDefaultBoardEntryState();
  return state.flow.boardEntry;
}

export function getCoreState() {
  return state.core;
}

export function initializeCoreState(coreState = {}) {
  state.core = normalizeCoreState({
    ...coreState,
    progress: coreState.progress ?? state.core.progress,
    settings: coreState.settings ?? state.core.settings,
    rewardsWallet: coreState.rewardsWallet ?? state.core.rewardsWallet,
    learnedWords: coreState.learnedWords ?? state.core.learnedWords,
    unlockedChapterIds: coreState.unlockedChapterIds ?? state.core.unlockedChapterIds,
    selectedWorldId: coreState.selectedWorldId ?? state.core.selectedWorldId,
    selectedDifficultyId: coreState.selectedDifficultyId ?? state.core.selectedDifficultyId,
  });
  notifyStateListeners("core");
  return state.core;
}

export function updateCoreState(mutator, scope = "core") {
  if (typeof mutator === "function") mutator(state.core);
  state.core = normalizeCoreState(state.core);
  notifyStateListeners(scope);
  return state.core;
}

export function replaceProgressState(progressState, scope = "progress") {
  state.core.progress = normalizeProgressState(progressState);
  notifyStateListeners(scope);
  return state.core.progress;
}

export function updateSettingsState(patch = {}) {
  const nextSettings = { ...state.core.settings, ...patch };
  nextSettings.ttsSettings = normalizeTtsSettings(nextSettings.ttsSettings);
  if (typeof nextSettings.profileName === "string") nextSettings.profileName = nextSettings.profileName.trim();
  state.core.settings = nextSettings;
  notifyStateListeners("settings");
  return state.core.settings;
}
