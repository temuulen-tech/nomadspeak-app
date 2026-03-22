/**
 * state.js
 * Shared runtime app state and accessor helpers.
 *
 * Architecture split:
 * - Source of truth: central `state` object.
 * - Actions: external modules mutate through exported helpers/actions.
 * - Render: screens subscribe and read from state without owning persistence.
 */

import { BOARD_SELECTOR_STEPS, CURRENT_SAVE_VERSION, DIFFICULTY_LEVELS, SCREEN_NAMES } from "./constants.js";
import { normalizeReviewQueue } from "./smart-review.js";
import { getChapterConfig, getDefaultChapterForWorld } from "./chapters.js";
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
    const entry = weeklyRaw[index];
    const fallback = [...defaults.weeklyMinutes.slice(0, 6), todayMinutes][index];
    return Number.isFinite(Number(entry)) ? Math.max(0, Math.floor(Number(entry))) : fallback;
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

function normalizeBoardEntryState(rawEntry = {}) {
  const source = toPlainObject(rawEntry);
  const defaults = createDefaultBoardEntryState();
  const selectableWorldIds = new Set(getSelectableBoardWorlds().map((world) => world.id));
  const worldId = typeof source.worldId === "string" && selectableWorldIds.has(source.worldId)
    ? source.worldId
    : defaults.worldId;
  const difficultyId = Object.values(DIFFICULTY_LEVELS).includes(source.difficultyId)
    ? source.difficultyId
    : defaults.difficultyId;
  const step = Object.values(BOARD_SELECTOR_STEPS).includes(source.step)
    ? source.step
    : defaults.step;
  const defaultChapterId = getDefaultChapterForWorld(worldId)?.id || defaults.chapterId;
  const rawChapterId = typeof source.chapterId === "string" && source.chapterId.trim()
    ? source.chapterId.trim()
    : defaultChapterId;
  const chapterConfig = getChapterConfig(rawChapterId);
  const chapterId = chapterConfig && chapterConfig.worldId === worldId
    ? chapterConfig.id
    : defaultChapterId;

  return {
    step,
    worldId,
    difficultyId,
    chapterId,
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
    processedRewardIds: [],
    learnedWords: [],
    unlockedChapterIds: [],
    selectedWorldId: DEFAULT_WORLD_ID,
    selectedDifficultyId: DIFFICULTY_LEVELS.BEGINNER,
    reviewQueue: [],
  };
}

export function normalizeCoreState(rawCore = {}) {
  const source = toPlainObject(rawCore);
  const defaults = createDefaultCoreState();
  const selectableWorldIds = new Set(getSelectableBoardWorlds().map((world) => world.id));
  const rawSettings = source.settings && typeof source.settings === "object" ? source.settings : {};
  const processedRewardIds = Array.isArray(source.processedRewardIds)
    ? [...new Set(source.processedRewardIds.map((id) => String(id || "").trim()).filter(Boolean))].slice(-250)
    : defaults.processedRewardIds;
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
    processedRewardIds,
    learnedWords,
    unlockedChapterIds,
    selectedWorldId: typeof source.selectedWorldId === "string" && selectableWorldIds.has(source.selectedWorldId)
      ? source.selectedWorldId
      : defaults.selectedWorldId,
    selectedDifficultyId: Object.values(DIFFICULTY_LEVELS).includes(source.selectedDifficultyId) ? source.selectedDifficultyId : defaults.selectedDifficultyId,
    reviewQueue: normalizeReviewQueue(source.reviewQueue),
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
    processedRewardIds: source.processedRewardIds,
    learnedWords: source.learnedWords,
    unlockedChapterIds: source.unlockedChapterIds,
    selectedWorldId: source.selectedWorldId,
    selectedDifficultyId: source.selectedDifficultyId,
    reviewQueue: source.reviewQueue,
  });
}

function createDefaultState() {
  return {
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
}

function normalizeState(rawState = {}) {
  const source = toPlainObject(rawState);
  const defaults = createDefaultState();
  return {
    ...defaults,
    ...source,
    currentScreen: typeof source.currentScreen === "string" ? source.currentScreen : defaults.currentScreen,
    level: Object.values(DIFFICULTY_LEVELS).includes(source.level) ? source.level : defaults.level,
    flow: {
      ...defaults.flow,
      ...toPlainObject(source.flow),
      lastRequestedScreen: typeof toPlainObject(source.flow).lastRequestedScreen === "string"
        ? toPlainObject(source.flow).lastRequestedScreen
        : defaults.flow.lastRequestedScreen,
      boardEntry: normalizeBoardEntryState(toPlainObject(source.flow).boardEntry),
    },
    lesson: {
      ...defaults.lesson,
      ...toPlainObject(source.lesson),
    },
    core: normalizeCoreState(source.core),
    rewards: toPlainObject(source.rewards),
    difficulty: {
      ...defaults.difficulty,
      ...toPlainObject(source.difficulty),
      qa: typeof toPlainObject(source.difficulty).qa === "string" ? toPlainObject(source.difficulty).qa : defaults.difficulty.qa,
      sentenceGame: Object.values(DIFFICULTY_LEVELS).includes(toPlainObject(source.difficulty).sentenceGame)
        ? toPlainObject(source.difficulty).sentenceGame
        : defaults.difficulty.sentenceGame,
    },
    flags: toPlainObject(source.flags),
  };
}

const state = createDefaultState();
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

function commitState(scope = "app") {
  const nextState = normalizeState(state);
  Object.keys(state).forEach((key) => {
    delete state[key];
  });
  Object.assign(state, nextState);
  notifyStateListeners(scope);
  return state;
}

export function subscribeState(listener) {
  if (typeof listener !== "function") return () => {};
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}

export function getState() { return state; }
export function getStateValue(key) { return state[key]; }
export function setStateValue(key, value, scope = key || "app") { state[key] = value; commitState(scope); return state[key]; }
export function updateState(mutator, scope = "app") { if (typeof mutator === "function") mutator(state); commitState(scope); return state; }

export function getBoardEntryState() { return state.flow.boardEntry; }

export function updateBoardEntryState(patch = {}, scope = "boardEntry") {
  state.flow.boardEntry = normalizeBoardEntryState({ ...state.flow.boardEntry, ...patch });
  notifyStateListeners(scope);
  return state.flow.boardEntry;
}

export function resetBoardEntryState(overrides = {}, scope = "boardEntry") {
  const patch = overrides && typeof overrides === "object" ? overrides : {};
  state.flow.boardEntry = normalizeBoardEntryState({
    ...createDefaultBoardEntryState(),
    ...patch,
  });
  notifyStateListeners(scope);
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
    processedRewardIds: coreState.processedRewardIds ?? state.core.processedRewardIds,
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
