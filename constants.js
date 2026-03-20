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

export const FLOW_DESTINATIONS = {
  HOME: SCREEN_NAMES.HOME,
  LESSON: SCREEN_NAMES.LESSON,
  SENTENCES: SCREEN_NAMES.SENTENCES,
  SENTENCE_GAME: SCREEN_NAMES.SENTENCE_GAME,
  QA_GAME: SCREEN_NAMES.QA_GAME,
  BOARD_ENTRY: SCREEN_NAMES.BOARD_GAME,
  BOARD_COVER: SCREEN_NAMES.CHAPTER_COVER,
  BOARD_PLAY: SCREEN_NAMES.BOARD,
  STATS: SCREEN_NAMES.STATS,
  PROFILE: SCREEN_NAMES.PROFILE,
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

export const DIFFICULTY_OPTION_CONFIGS = [
  { id: DIFFICULTY_LEVELS.BEGINNER, label: "Анхан" },
  { id: DIFFICULTY_LEVELS.INTERMEDIATE, label: "Дунд" },
  { id: DIFFICULTY_LEVELS.ADVANCED, label: "Ахисан" },
];

export const WORLD_IDS = {
  WORLD_1: "world1",
  WORLD_2: "world2",
  WORLD_3: "world3",
  SEA: "sea",
};

export const BOARD_SELECTOR_STEPS = {
  ENTRY: "entry",
  WORLD: "world",
  DIFFICULTY: "difficulty",
  READY: "ready",
  COVER: "cover",
  PLAY: "play",
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

export const CONTENT_COLLECTIONS = {
  LESSON_PACKS: "lesson-packs",
  WORD_BANKS: "word-banks",
  QA_SETS: "qa-sets",
  SENTENCE_BANKS: "sentence-banks",
  WORLD_VISUALS: "world-visuals",
  REWARD_VISUALS: "reward-visuals",
  ANIMATION_HOOKS: "animation-hooks",
};

export const PLACEHOLDER_STATES = {
  READY: "ready",
  PLACEHOLDER: "placeholder",
};

export const FUTURE_CONTENT_SLOTS = {
  LESSON_PACK: "lessonPack",
  WORD_BANK: "wordBank",
  QA_SET: "qaSet",
  SENTENCE_BANK: "sentenceBank",
  WORLD_COVER: "worldCover",
  WORLD_REWARD_VISUAL: "worldRewardVisual",
  WORLD_BACKGROUND: "worldBackground",
  AMBIENCE_TRACK: "ambienceTrack",
  INTRO_ANIMATION: "introAnimation",
  REWARD_ANIMATION: "rewardAnimation",
  GAMEPLAY_ANIMATION: "gameplayAnimation",
};

export const CONTENT_INSERTION_OWNERSHIP = {
  worldMetadata: "worlds.js",
  chapterMetadata: "chapters.js",
  lessonContent: "lesson.js",
  lessonWordBanks: "lesson.js",
  qaContent: "qa-game.js",
  sentenceGameContent: "sentence-game.js",
  imageAssetRefs: "assets.js",
  animationHooks: "assets.js",
};

export const REAL_CONTENT_INSERTION_SEQUENCE = [
  "1. Register or confirm world-level metadata and world-to-difficulty content refs in worlds.js.",
  "2. Register chapter-level metadata and per-chapter content ids in chapters.js.",
  "3. Add the lesson pack and lesson word bank in lesson.js using the same ids.",
  "4. Add QA rounds in qa-game.js using the qaSetId referenced by world/chapter content.",
  "5. Add the sentence bank registration in sentence-game.js using the sentenceBankId referenced by world/chapter content.",
  "6. Add cover/background/audio asset references in assets.js, then point worlds.js to those asset ids.",
  "7. Attach future animation hook metadata in assets.js and reference those hook ids from worlds.js/chapters.js when motion is ready.",
];

export const FIRST_REAL_CONTENT_INSERTION_TARGET = {
  worldId: WORLD_IDS.WORLD_1,
  difficultyId: DIFFICULTY_LEVELS.BEGINNER,
  chapterId: CHAPTER_IDS.CH2,
  rationale: "World 1 beginner already drives the live board/lesson flow, so Chapter 2 is the lowest-risk next real-content insertion target.",
};

export const ANIMATION_HOOKS = {
  WORLD_INTRO: "world-intro",
  CHAPTER_REVEAL: "chapter-reveal",
  LESSON_SUCCESS: "lesson-success",
  QA_REWARD: "qa-reward",
  SENTENCE_SUCCESS: "sentence-success",
  WORLD_REWARD: "world-reward",
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

export function getDifficultyOption(difficultyId = DIFFICULTY_LEVELS.BEGINNER) {
  return DIFFICULTY_OPTION_CONFIGS.find((option) => option.id === difficultyId) || DIFFICULTY_OPTION_CONFIGS[0];
}

export function createPlaceholderMeta({
  collection,
  slot,
  state = PLACEHOLDER_STATES.PLACEHOLDER,
  id = null,
  notes = "",
} = {}) {
  return {
    collection: collection || null,
    slot: slot || null,
    state,
    id,
    notes,
  };
}
