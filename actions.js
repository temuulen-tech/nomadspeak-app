/**
 * actions.js
 * Centralizes app state mutations so UI/render modules stay read-only.
 */

import { clearAppSaveData, loadAppState, saveAppState } from "./storage.js";
import {
  buildCoreStateFromStorage,
  createDefaultCoreState,
  getCoreState,
  initializeCoreState,
  normalizeRewardsWallet,
  normalizeTtsSettings,
  replaceProgressState,
  updateCoreState,
} from "./state.js";

function persistCoreState() {
  const normalized = getCoreState();
  saveAppState(normalized);
  return normalized;
}

function commitCoreMutation(mutator, scope = "core") {
  updateCoreState((core) => {
    if (typeof mutator === "function") mutator(core);
  }, scope);
  return persistCoreState();
}

function syncDerivedProgress(progress) {
  if (!progress || typeof progress !== "object") return progress;

  progress.xp = Math.max(0, Math.floor(Number(progress.xp) || 0));
  progress.xpTotal = progress.xp;
  progress.streak = Math.max(0, Math.floor(Number(progress.streak) || 0));
  progress.streakDays = progress.streak;
  progress.todayCount = Math.max(0, Math.floor(Number(progress.todayCount) || 0));
  progress.todayMinutes = Math.max(0, Math.floor(Number(progress.todayMinutes) || 0));
  progress.todaySecondsRemainder = Math.max(0, Math.floor(Number(progress.todaySecondsRemainder) || 0));
  progress.dailyXP = Math.max(0, Number(progress.dailyXP) || 0);
  progress.level = Math.floor(progress.xp / 100) + 1;
  progress.dailyCompleted = Boolean(progress.dailyCompleted || progress.dailyXP >= progress.dailyGoalXP);
  return progress;
}

export function saveCoreState() {
  return persistCoreState();
}

export function loadCoreState() {
  const normalized = buildCoreStateFromStorage(loadAppState());
  initializeCoreState(normalized);
  saveAppState(getCoreState());
  return getCoreState();
}

export function resetCoreState(coreState = createDefaultCoreState()) {
  initializeCoreState(coreState);
  saveAppState(getCoreState());
  return getCoreState();
}

export function clearPersistedCoreState() {
  clearAppSaveData();
}

export function completeLesson({ xpEarned = 0, today = null, yesterday = null, countLesson = false, countDailyProgress = false, rewardTierUnlocked = null } = {}) {
  const earned = Number(xpEarned);
  if (!Number.isFinite(earned) || earned <= 0) return getCoreState().progress;

  let nextProgress = getCoreState().progress;
  commitCoreMutation((core) => {
    const progress = core.progress;
    const firstActivityToday = today && progress.lastActiveDate !== today;

    progress.xp += earned;
    progress.dailyXP += earned;

    if (today && firstActivityToday) {
      progress.streak = progress.lastActiveDate === yesterday ? progress.streak + 1 : 1;
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

    nextProgress = syncDerivedProgress(progress);
  }, "progress");

  return nextProgress;
}

export function claimReward({ rewardTierUnlocked = null, coins = 0, gems = 0 } = {}) {
  let coreState = getCoreState();
  commitCoreMutation((core) => {
    core.rewardsWallet = normalizeRewardsWallet({
      coins: (core.rewardsWallet?.coins || 0) + Number(coins || 0),
      gems: (core.rewardsWallet?.gems || 0) + Number(gems || 0),
    });

    if (Number.isFinite(Number(rewardTierUnlocked))) {
      core.progress.rewardTierUnlocked = Math.max(core.progress.rewardTierUnlocked || 1, Math.floor(Number(rewardTierUnlocked)));
    }

    coreState = core;
  }, "rewards");

  return coreState;
}

export function unlockChapter(chapterId) {
  const id = String(chapterId || "").trim();
  if (!id) return getCoreState().unlockedChapterIds;

  let unlockedChapterIds = getCoreState().unlockedChapterIds;
  commitCoreMutation((core) => {
    if (!core.unlockedChapterIds.includes(id)) core.unlockedChapterIds.push(id);
    unlockedChapterIds = core.unlockedChapterIds;
  }, "chapters");

  return unlockedChapterIds;
}

export function markWordLearned(word) {
  const learnedWord = String(word || "").trim();
  if (!learnedWord) return getCoreState().learnedWords;

  let learnedWords = getCoreState().learnedWords;
  commitCoreMutation((core) => {
    if (!core.learnedWords.includes(learnedWord)) core.learnedWords.push(learnedWord);
    learnedWords = core.learnedWords;
  }, "learnedWords");

  return learnedWords;
}

export function updateStreak({ today, yesterday, todayMinutes = 0, weeklyMinutes = [], resetDaily = false } = {}) {
  let nextProgress = getCoreState().progress;
  commitCoreMutation((core) => {
    const progress = core.progress;
    progress.todayMinutes = Math.max(0, Math.floor(Number(todayMinutes) || 0));
    progress.weeklyMinutes = Array.isArray(weeklyMinutes)
      ? weeklyMinutes.map((value) => Math.max(0, Math.floor(Number(value) || 0))).slice(-7)
      : progress.weeklyMinutes;

    const lastStatsDate = progress.lastStatsDate || progress.lastActiveDate;
    if (resetDaily && today && lastStatsDate && lastStatsDate !== today) {
      if (progress.lastActiveDate !== yesterday) {
        progress.streak = 0;
        progress.streakDays = 0;
      }
      progress.todayCount = 0;
      progress.todayMinutes = 0;
      progress.todaySecondsRemainder = 0;
      progress.dailyXP = 0;
      progress.dailyCompleted = false;
      progress.lastStatsDate = today;
    }

    nextProgress = syncDerivedProgress(progress);
  }, "progress");

  return nextProgress;
}

export function applyProgressPatch(mutator, scope = "progress") {
  let nextProgress = getCoreState().progress;
  commitCoreMutation((core) => {
    if (typeof mutator === "function") mutator(core.progress, core);
    nextProgress = syncDerivedProgress(core.progress);
  }, scope);
  return nextProgress;
}

export function replaceProgress(progressState, scope = "progress") {
  replaceProgressState(progressState, scope);
  saveAppState(getCoreState());
  return getCoreState().progress;
}

export function updateSettings(patch = {}) {
  let settings = getCoreState().settings;
  commitCoreMutation((core) => {
    const nextSettings = {
      ...core.settings,
      ...patch,
      ttsSettings: patch.ttsSettings ? normalizeTtsSettings(patch.ttsSettings) : core.settings.ttsSettings,
    };
    if (typeof nextSettings.profileName === "string") nextSettings.profileName = nextSettings.profileName.trim();
    core.settings = nextSettings;
    settings = core.settings;
  }, "settings");
  return settings;
}

export function setSelectedWorld(worldId) {
  const nextWorldId = String(worldId || "").trim();
  if (!nextWorldId) return getCoreState().selectedWorldId;

  commitCoreMutation((core) => {
    core.selectedWorldId = nextWorldId;
  }, "selectedWorld");

  return getCoreState().selectedWorldId;
}

export function setSelectedDifficulty(difficultyId) {
  const nextDifficultyId = String(difficultyId || "").trim();
  if (!nextDifficultyId) return getCoreState().selectedDifficultyId;

  commitCoreMutation((core) => {
    core.selectedDifficultyId = nextDifficultyId;
  }, "selectedDifficulty");

  return getCoreState().selectedDifficultyId;
}

export function updateSelections(patch = {}) {
  const nextWorldId = typeof patch.selectedWorldId === "string" ? patch.selectedWorldId.trim() : "";
  const nextDifficultyId = typeof patch.selectedDifficultyId === "string" ? patch.selectedDifficultyId.trim() : "";
  if (!nextWorldId && !nextDifficultyId) {
    return {
      selectedWorldId: getCoreState().selectedWorldId,
      selectedDifficultyId: getCoreState().selectedDifficultyId,
    };
  }

  commitCoreMutation((core) => {
    if (nextWorldId) core.selectedWorldId = nextWorldId;
    if (nextDifficultyId) core.selectedDifficultyId = nextDifficultyId;
  }, "selections");

  return {
    selectedWorldId: getCoreState().selectedWorldId,
    selectedDifficultyId: getCoreState().selectedDifficultyId,
  };
}
