/**
 * constants.js
 * Centralized registry for reusable app-wide constant values and identifiers.
 */

export const SCREEN_NAMES = {
  START: "start",
  HOME: "home",
  LESSON: "lesson",
  SENTENCES: "sentences",
  SENTENCE_GAME: "sentence-game",
  QA_GAME: "qa-game",
  CHAPTER_COVER: "chapter-cover",
  BOARD: "board",
  BOARD_GAME: "board-game",
  STATS: "stats",
  PROFILE: "profile",
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

export const DIFFICULTY_LEVEL_LIST = [
  DIFFICULTY_LEVELS.BEGINNER,
  DIFFICULTY_LEVELS.INTERMEDIATE,
  DIFFICULTY_LEVELS.ADVANCED,
];

export const WORLD_IDS = {
  WORLD_1: "world1",
  SEA: "sea",
};

export const CHAPTER_IDS = {
  CH1: "ch1",
  CH2: "ch2",
  CH3: "ch3",
  CH4: "ch4",
};

export const GAME_MODES = {
  HOME: "home",
  LEARNING: "learning",
  LESSON: "lesson",
  SENTENCES: "sentences",
  BOARD_GAME: "board-game",
};

export const STATS_PERIODS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

export const REWARD_TABS = {
  DAYS: "days",
  WEEKS: "weeks",
  MONTHS: "months",
};

// Increment this when the persisted save shape changes in a backwards-compatible migration.
export const CURRENT_SAVE_VERSION = 1;

export const STORAGE_KEYS = {
  TTS_SETTINGS: "nomadspeak:tts:v1",
  LEGACY_TTS_RATE: "ttsRate",
  SOUND_ENABLED: "soundEnabled",
  PROGRESS_SETTINGS: "nomadProgress",
  APP_TIME_DAILY_TOTALS: "appTimeDailyTotals",
  APP_TIME_ACTIVE_SESSION: "appTimeActiveSession",
  PROFILE_NAME: "nomadProfileName",
  PREMIUM: "isPremium",
  DEBUG_MODE: "nomadspeak:debug-mode",
};
