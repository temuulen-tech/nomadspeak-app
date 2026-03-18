/**
 * state.js
 * Shared runtime app state and small accessor helpers.
 */

import { DIFFICULTY_LEVELS, SCREEN_NAMES } from "./constants.js";

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

const state = {
  currentScreen: SCREEN_NAMES.START,
  level: DIFFICULTY_LEVELS.BEGINNER,
  flow: {
    lastRequestedScreen: SCREEN_NAMES.START,
    boardEntry: {
      step: "entry",
      worldId: null,
      difficultyId: DIFFICULTY_LEVELS.BEGINNER,
      chapterId: null,
    },
  },
  lesson: { currentIndex: 0, score: 0, locked: false, reviewMode: false },
  progress: null,
  rewards: {},
  difficulty: { qa: null, sentenceGame: DIFFICULTY_LEVELS.BEGINNER },
  flags: {},
};

export function getState() { return state; }
export function getStateValue(key) { return state[key]; }
export function setStateValue(key, value) { state[key] = value; return state[key]; }
export function updateState(mutator) { if (typeof mutator === "function") mutator(state); return state; }
