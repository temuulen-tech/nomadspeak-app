/**
 * state.js
 * Shared runtime app state and small accessor helpers.
 */

import { BOARD_SELECTOR_STEPS, DIFFICULTY_LEVELS, SCREEN_NAMES } from "./constants.js";
import { getDefaultChapterForWorld } from "./chapters.js";
import { DEFAULT_WORLD_ID } from "./worlds.js";

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
  };
}

export function normalizeProgressState(raw = {}) {
  const defaults = createDefaultProgressState();
  const configuredDailyGoal = Number.isFinite(Number(raw.dailyGoalXP)) && Number(raw.dailyGoalXP) > 0
    ? Math.floor(Number(raw.dailyGoalXP))
    : defaults.dailyGoalXP;
  const xp = Number.isFinite(Number(raw.xp))
    ? Math.max(0, Math.floor(Number(raw.xp)))
    : (Number.isFinite(Number(raw.xpTotal)) ? Math.max(0, Math.floor(Number(raw.xpTotal))) : defaults.xp);
  const streak = Number.isFinite(Number(raw.streak))
    ? Math.max(0, Math.floor(Number(raw.streak)))
    : (Number.isFinite(Number(raw.streakDays)) ? Math.max(0, Math.floor(Number(raw.streakDays))) : defaults.streak);
  const todayCount = Number.isFinite(Number(raw.todayCount)) ? Math.max(0, Math.floor(Number(raw.todayCount))) : defaults.todayCount;
  const todayMinutes = Number.isFinite(Number(raw.todayMinutes)) ? Math.max(0, Math.floor(Number(raw.todayMinutes))) : defaults.todayMinutes;
  const todaySecondsRemainder = Number.isFinite(Number(raw.todaySecondsRemainder)) ? Math.max(0, Math.floor(Number(raw.todaySecondsRemainder))) : defaults.todaySecondsRemainder;
  const weeklyRaw = Array.isArray(raw.weeklyMinutes) ? raw.weeklyMinutes : [];
  const weeklyMinutes = Array.from({ length: 7 }, (_, index) => {
    const source = weeklyRaw[index];
    const fallback = [...defaults.weeklyMinutes.slice(0, 6), todayMinutes][index];
    return Number.isFinite(Number(source)) ? Math.max(0, Math.floor(Number(source))) : fallback;
  });
  const rewardTierUnlocked = Number.isFinite(Number(raw.rewardTierUnlocked)) ? Math.max(1, Math.min(5, Math.floor(Number(raw.rewardTierUnlocked)))) : defaults.rewardTierUnlocked;
  const level = Math.floor(xp / 100) + 1;

  return {
    xp,
    level,
    streak,
    lastActiveDate: typeof raw.lastActiveDate === "string" ? raw.lastActiveDate : defaults.lastActiveDate,
    lastStatsDate: typeof raw.lastStatsDate === "string" ? raw.lastStatsDate : defaults.lastStatsDate,
    dailyGoalXP: configuredDailyGoal,
    dailyGoalCount: Number.isFinite(Number(raw.dailyGoalCount)) && Number(raw.dailyGoalCount) > 0 ? Math.floor(Number(raw.dailyGoalCount)) : defaults.dailyGoalCount,
    todayCount,
    todayMinutes,
    todaySecondsRemainder,
    weeklyMinutes,
    rewardTierUnlocked,
    xpTotal: xp,
    streakDays: streak,
    dailyXP: Number.isFinite(Number(raw.dailyXP)) ? Math.max(0, Number(raw.dailyXP)) : defaults.dailyXP,
    dailyCompleted: Boolean(raw.dailyCompleted),
  };
}

export function normalizeTtsSettings(rawSettings = {}) {
  const voice = ["auto", "male", "female"].includes(rawSettings.voice)
    ? rawSettings.voice
    : DEFAULT_TTS_SETTINGS.voice;

  const rateCandidate = Number(rawSettings.rate);
  const rate = Number.isFinite(rateCandidate) && rateCandidate >= 0.45 && rateCandidate <= 1.4
    ? Math.round(rateCandidate * 20) / 20
    : DEFAULT_TTS_SETTINGS.rate;

  return { voice, rate };
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
    learnedWords: [],
    unlockedChapterIds: [],
    selectedWorldId: DEFAULT_WORLD_ID,
    selectedDifficultyId: DIFFICULTY_LEVELS.BEGINNER,
  };
}

export function normalizeCoreState(rawCore = {}) {
  const defaults = createDefaultCoreState();
  const rawSettings = rawCore.settings && typeof rawCore.settings === "object" ? rawCore.settings : {};
  const learnedWords = Array.isArray(rawCore.learnedWords)
    ? [...new Set(rawCore.learnedWords.map((word) => String(word || "").trim()).filter(Boolean))]
    : defaults.learnedWords;
  const unlockedChapterIds = Array.isArray(rawCore.unlockedChapterIds)
    ? [...new Set(rawCore.unlockedChapterIds.map((id) => String(id || "").trim()).filter(Boolean))]
    : defaults.unlockedChapterIds;

  return {
    progress: normalizeProgressState(rawCore.progress),
    settings: {
      ttsSettings: normalizeTtsSettings(rawSettings.ttsSettings),
      soundEnabled: typeof rawSettings.soundEnabled === "boolean" ? rawSettings.soundEnabled : defaults.settings.soundEnabled,
      premium: typeof rawSettings.premium === "boolean" ? rawSettings.premium : defaults.settings.premium,
      profileName: typeof rawSettings.profileName === "string" ? rawSettings.profileName.trim() : defaults.settings.profileName,
    },
    learnedWords,
    unlockedChapterIds,
    selectedWorldId: typeof rawCore.selectedWorldId === "string" && rawCore.selectedWorldId ? rawCore.selectedWorldId : defaults.selectedWorldId,
    selectedDifficultyId: Object.values(DIFFICULTY_LEVELS).includes(rawCore.selectedDifficultyId) ? rawCore.selectedDifficultyId : defaults.selectedDifficultyId,
  };
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
    learnedWords: coreState.learnedWords ?? state.core.learnedWords,
    unlockedChapterIds: coreState.unlockedChapterIds ?? state.core.unlockedChapterIds,
    selectedWorldId: coreState.selectedWorldId ?? state.core.selectedWorldId,
    selectedDifficultyId: coreState.selectedDifficultyId ?? state.core.selectedDifficultyId,
  });
  notifyStateListeners("core");
  return state.core;
}

export function updateCoreState(mutator) {
  if (typeof mutator === "function") mutator(state.core);
  state.core = normalizeCoreState(state.core);
  notifyStateListeners("core");
  return state.core;
}

export function replaceProgressState(progressState) {
  state.core.progress = normalizeProgressState(progressState);
  notifyStateListeners("progress");
  return state.core.progress;
}

export function completeLesson({ xpEarned = 0, today = null, yesterday = null, countLesson = false, countDailyProgress = false, rewardTierUnlocked = null } = {}) {
  const earned = Number(xpEarned);
  if (!Number.isFinite(earned) || earned <= 0) return state.core.progress;
  const progress = state.core.progress;
  const firstActivityToday = today && progress.lastActiveDate !== today;

  progress.xp += earned;
  progress.xpTotal = progress.xp;
  progress.dailyXP += earned;
  progress.level = Math.floor(progress.xp / 100) + 1;

  if (progress.dailyXP >= progress.dailyGoalXP) {
    progress.dailyCompleted = true;
  }

  if (today && firstActivityToday) {
    progress.streak = progress.lastActiveDate === yesterday ? progress.streak + 1 : 1;
    progress.streakDays = progress.streak;
  }

  if (countLesson || countDailyProgress) {
    progress.todayCount += 1;
  }

  if (Number.isFinite(Number(rewardTierUnlocked))) {
    progress.rewardTierUnlocked = Math.max(progress.rewardTierUnlocked || 1, Math.floor(Number(rewardTierUnlocked)));
  }

  if (today) {
    progress.lastActiveDate = today;
    progress.lastStatsDate = today;
  }

  notifyStateListeners("progress");
  return progress;
}

export function claimReward({ rewardTierUnlocked = null, coins = 0, gems = 0 } = {}) {
  if (!state.core.rewardsWallet) state.core.rewardsWallet = { coins: 0, gems: 0 };
  if (Number.isFinite(Number(rewardTierUnlocked))) {
    state.core.progress.rewardTierUnlocked = Math.max(state.core.progress.rewardTierUnlocked || 1, Math.floor(Number(rewardTierUnlocked)));
  }
  state.core.rewardsWallet.coins = Math.max(0, Math.floor((state.core.rewardsWallet.coins || 0) + Number(coins || 0)));
  state.core.rewardsWallet.gems = Math.max(0, Math.floor((state.core.rewardsWallet.gems || 0) + Number(gems || 0)));
  notifyStateListeners("core");
  return state.core;
}

export function unlockChapter(chapterId) {
  const id = String(chapterId || "").trim();
  if (!id) return state.core.unlockedChapterIds;
  if (!state.core.unlockedChapterIds.includes(id)) state.core.unlockedChapterIds.push(id);
  notifyStateListeners("core");
  return state.core.unlockedChapterIds;
}

export function markWordLearned(word) {
  const learnedWord = String(word || "").trim();
  if (!learnedWord) return state.core.learnedWords;
  if (!state.core.learnedWords.includes(learnedWord)) state.core.learnedWords.push(learnedWord);
  notifyStateListeners("core");
  return state.core.learnedWords;
}

export function updateSettings(patch = {}) {
  const nextSettings = { ...state.core.settings, ...patch };
  nextSettings.ttsSettings = normalizeTtsSettings(nextSettings.ttsSettings);
  if (typeof nextSettings.profileName === "string") nextSettings.profileName = nextSettings.profileName.trim();
  state.core.settings = nextSettings;
  notifyStateListeners("settings");
  return state.core.settings;
}
