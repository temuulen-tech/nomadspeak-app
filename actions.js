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
  updateSettingsState,
} from "./state.js";

function persistCoreState() {
  const normalized = getCoreState();
  saveAppState(normalized);
  return normalized;
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
  updateCoreState((core) => {
    const progress = core.progress;
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

    nextProgress = progress;
  }, "progress");

  persistCoreState();
  return nextProgress;
}

export function claimReward({ rewardTierUnlocked = null, coins = 0, gems = 0 } = {}) {
  let coreState = getCoreState();
  updateCoreState((core) => {
    core.rewardsWallet = normalizeRewardsWallet({
      coins: (core.rewardsWallet?.coins || 0) + Number(coins || 0),
      gems: (core.rewardsWallet?.gems || 0) + Number(gems || 0),
    });

    if (Number.isFinite(Number(rewardTierUnlocked))) {
      core.progress.rewardTierUnlocked = Math.max(core.progress.rewardTierUnlocked || 1, Math.floor(Number(rewardTierUnlocked)));
    }

    coreState = core;
  }, "rewards");

  persistCoreState();
  return coreState;
}

export function unlockChapter(chapterId) {
  const id = String(chapterId || "").trim();
  if (!id) return getCoreState().unlockedChapterIds;

  let unlockedChapterIds = getCoreState().unlockedChapterIds;
  updateCoreState((core) => {
    if (!core.unlockedChapterIds.includes(id)) core.unlockedChapterIds.push(id);
    unlockedChapterIds = core.unlockedChapterIds;
  }, "chapters");

  persistCoreState();
  return unlockedChapterIds;
}

export function markWordLearned(word) {
  const learnedWord = String(word || "").trim();
  if (!learnedWord) return getCoreState().learnedWords;

  let learnedWords = getCoreState().learnedWords;
  updateCoreState((core) => {
    if (!core.learnedWords.includes(learnedWord)) core.learnedWords.push(learnedWord);
    learnedWords = core.learnedWords;
  }, "learnedWords");

  persistCoreState();
  return learnedWords;
}

export function updateStreak({ today, yesterday, todayMinutes = 0, weeklyMinutes = [], resetDaily = false } = {}) {
  let nextProgress = getCoreState().progress;
  updateCoreState((core) => {
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

    progress.xpTotal = progress.xp;
    progress.streakDays = progress.streak;
    progress.level = Math.floor(progress.xp / 100) + 1;
    nextProgress = progress;
  }, "progress");

  persistCoreState();
  return nextProgress;
}

export function applyProgressPatch(mutator, scope = "progress") {
  let nextProgress = getCoreState().progress;
  updateCoreState((core) => {
    if (typeof mutator === "function") mutator(core.progress, core);
    nextProgress = core.progress;
  }, scope);
  persistCoreState();
  return nextProgress;
}

export function replaceProgress(progressState, scope = "progress") {
  replaceProgressState(progressState, scope);
  saveAppState(getCoreState());
  return getCoreState().progress;
}

export function updateSettings(patch = {}) {
  updateSettingsState({
    ...patch,
    ttsSettings: patch.ttsSettings ? normalizeTtsSettings(patch.ttsSettings) : getCoreState().settings.ttsSettings,
  });
  saveAppState(getCoreState());
  return getCoreState().settings;
}

export function updateSelections(patch = {}) {
  updateCoreState((core) => {
    if (typeof patch.selectedWorldId === "string" && patch.selectedWorldId) {
      core.selectedWorldId = patch.selectedWorldId;
    }

    if (typeof patch.selectedDifficultyId === "string" && patch.selectedDifficultyId) {
      core.selectedDifficultyId = patch.selectedDifficultyId;
    }
  }, "selections");

  saveAppState(getCoreState());
  return {
    selectedWorldId: getCoreState().selectedWorldId,
    selectedDifficultyId: getCoreState().selectedDifficultyId,
  };
}
