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
  LESSON_VISUAL: "lessonVisual",
  AMBIENCE_TRACK: "ambienceTrack",
  INTRO_ANIMATION: "introAnimation",
  REWARD_ANIMATION: "rewardAnimation",
  GAMEPLAY_ANIMATION: "gameplayAnimation",
};

export const CONTENT_TEMPLATE_SECTIONS = {
  WORLD: "world",
  DIFFICULTY: "difficulty",
  CHAPTER: "chapter",
  LESSON: "lesson",
  QA: "qa",
  SENTENCE: "sentence",
  ASSET: "asset",
  ANIMATION: "animation",
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

export const CONTENT_DROP_IN_FILES = {
  worldMetadata: "worlds.js",
  chapterMetadata: "chapters.js",
  lessonContent: "lesson.js",
  qaContent: "qa-game.js",
  sentenceContent: "sentence-game.js",
  assetReferences: "assets.js",
  sharedWorkflowConstants: "constants.js",
};

export const CONTENT_TEMPLATE_DIRECTORY = "content-packs/templates";

export const CONTENT_TEMPLATE_FILES = {
  lessonPack: `${CONTENT_TEMPLATE_DIRECTORY}/lesson-pack.template.json`,
  wordBank: `${CONTENT_TEMPLATE_DIRECTORY}/word-bank.template.json`,
  sentenceBank: `${CONTENT_TEMPLATE_DIRECTORY}/sentence-bank.template.json`,
  qaSet: `${CONTENT_TEMPLATE_DIRECTORY}/qa-set.template.json`,
  contentPackManifest: `${CONTENT_TEMPLATE_DIRECTORY}/content-pack-manifest.template.json`,
};

export const CONTENT_HANDOFF_ENTRYPOINTS = [
  { order: 1, area: "World metadata", file: CONTENT_DROP_IN_FILES.worldMetadata },
  { order: 2, area: "Chapter metadata", file: CONTENT_DROP_IN_FILES.chapterMetadata },
  { order: 3, area: "Lesson packs + lesson word banks", file: CONTENT_DROP_IN_FILES.lessonContent },
  { order: 4, area: "QA rounds + QA helper banks", file: CONTENT_DROP_IN_FILES.qaContent },
  { order: 5, area: "Sentence bank registrations", file: CONTENT_DROP_IN_FILES.sentenceContent },
  { order: 6, area: "Visual/audio/animation asset references", file: CONTENT_DROP_IN_FILES.assetReferences },
];

export const CONTENT_ID_PATTERNS = {
  lessonPack: "world{n}-ch{n}-{difficulty}-{descriptor}",
  lessonWordBank: "word-bank-world{n}-ch{n}-{descriptor}",
  qaSet: "qa-set-world{n}-ch{n}-{descriptor}",
  qaWordBank: "qa-word-bank-world{n}-ch{n}-{descriptor}",
  sentenceBank: "sentence-bank-world{n}-ch{n}-{descriptor}",
  worldCoverAsset: "world{n}-cover",
  worldBackgroundAsset: "world{n}-background",
  rewardThemeAsset: "reward-theme-world{n}",
};

export const REAL_CONTENT_INSERTION_SEQUENCE = [
  "1. Update worlds.js with world metadata plus world-level default content and asset ids.",
  "2. Update chapters.js with chapter order/story metadata and per-chapter lesson/word-bank/QA/sentence ids.",
  "3. Update lesson.js with the lesson pack entries and the matching lesson word bank using the same ids from chapters.js/worlds.js.",
  "4. Update qa-game.js with QA rounds for the qaSetId referenced by the world/chapter config.",
  "5. Update sentence-game.js with the sentence bank registration that points to the intended sentence dataset path.",
  "6. Update assets.js with cover/background/audio/image references before wiring those ids back into worlds.js or chapters.js.",
  "7. Update assets.js with animation hook metadata only when the related motion asset/config is ready, then reference those hook ids from worlds.js/chapters.js.",
];

export const FIRST_REAL_CONTENT_INSERTION_TARGET = {
  worldId: WORLD_IDS.WORLD_1,
  difficultyId: DIFFICULTY_LEVELS.BEGINNER,
  chapterId: CHAPTER_IDS.CH2,
  rationale: "World 1 beginner already drives the live board/lesson flow, so Chapter 2 is the lowest-risk next real-content insertion target.",
};

export const CONTENT_READY_BASELINE = {
  phase: 54,
  name: "final stable baseline sign-off",
  status: "content-ready",
  architecturePolicy: {
    baselineLocked: true,
    preferNextWork: [
      "content insertion",
      "asset insertion",
      "lesson pack insertion",
      "sentence/question dataset insertion",
      "animation asset/hook insertion",
    ],
    avoidByDefault: [
      "new parallel gameplay flows",
      "screen/render rewrites for content-only changes",
      "hardcoded asset paths inside screen modules",
      "moving content datasets back into routing modules",
      "progress/storage rewrites unless a real save migration is required",
    ],
  },
  stablePaths: {
    appBootstrap: "app.js",
    stateAndPersistence: ["state.js", "actions.js", "storage.js"],
    worldAndChapterRouting: ["worlds.js", "chapters.js"],
    lessonAndGameContent: ["lesson.js", "qa-game.js", "sentence-game.js", "data/sentences.json"],
    visualAndAnimationAssets: ["assets.js"],
    screensAndRenderers: [
      "home-screen.js",
      "chapter-cover-screen.js",
      "board-screen.js",
      "lesson-screen.js",
      "stats-screen.js",
      "render-home.js",
      "render-board.js",
      "render-lesson.js",
      "render-rewards.js",
      "render-shell.js",
    ],
    lifecycleAndNavigation: ["screen-lifecycle.js", "script.js"],
  },
};

export const SHARED_BOARD_LAYOUT_WORLD_ID = WORLD_IDS.WORLD_1;

export const ANIMATION_HOOKS = {
  WORLD_INTRO: "world-intro",
  CHAPTER_REVEAL: "chapter-reveal",
  LESSON_SUCCESS: "lesson-success",
  QA_REWARD: "qa-reward",
  SENTENCE_SUCCESS: "sentence-success",
  WORLD_REWARD: "world-reward",
};

// Increment this when the persisted save shape changes in a backwards-compatible migration.
export const CURRENT_SAVE_VERSION = 2;

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

export function cloneInsertionExample(example) {
  if (typeof structuredClone === "function") return structuredClone(example);
  return JSON.parse(JSON.stringify(example));
}

export function createStarterTemplateManifest({
  section,
  worldId = null,
  difficultyId = null,
  chapterId = null,
  lessonPackId = null,
  wordBankId = null,
  qaSetId = null,
  sentenceBankId = null,
  assetIds = {},
  animationHooks = [],
  notes = "",
} = {}) {
  return {
    section: section || null,
    worldId,
    difficultyId,
    chapterId,
    lessonPackId,
    wordBankId,
    qaSetId,
    sentenceBankId,
    assetIds: { ...assetIds },
    animationHooks: [...animationHooks],
    notes,
  };
}

export function buildChapterScopedContentId({
  type = "content",
  worldNumber = "1",
  chapterNumber = "1",
  difficulty = null,
  descriptor = "core",
} = {}) {
  const chapterStem = `world${worldNumber}-ch${chapterNumber}`;
  const normalizedDescriptor = descriptor || "core";

  switch (type) {
    case "lessonPack":
      return [chapterStem, difficulty || DIFFICULTY_LEVELS.BEGINNER, normalizedDescriptor].join("-");
    case "lessonWordBank":
      return `word-bank-${chapterStem}-${normalizedDescriptor}`;
    case "qaSet":
      return `qa-set-${chapterStem}-${normalizedDescriptor}`;
    case "qaWordBank":
      return `qa-word-bank-${chapterStem}-${normalizedDescriptor}`;
    case "sentenceBank":
      return `sentence-bank-${chapterStem}-${normalizedDescriptor}`;
    default:
      return `${chapterStem}-${normalizedDescriptor}`;
  }
}

export function buildWorldAssetId({
  worldNumber = "1",
  assetType = "cover",
  descriptor = null,
} = {}) {
  const worldStem = `world${worldNumber}`;
  const suffix = descriptor ? `-${descriptor}` : "";
  return `${worldStem}-${assetType}${suffix}`;
}

export function getContentDropInWorkflowGuide() {
  return {
    files: { ...CONTENT_DROP_IN_FILES },
    ownership: { ...CONTENT_INSERTION_OWNERSHIP },
    idPatterns: { ...CONTENT_ID_PATTERNS },
    sequence: [...REAL_CONTENT_INSERTION_SEQUENCE],
    entrypoints: CONTENT_HANDOFF_ENTRYPOINTS.map((entry) => ({ ...entry })),
    recommendedFirstTarget: { ...FIRST_REAL_CONTENT_INSERTION_TARGET },
    baseline: {
      ...CONTENT_READY_BASELINE,
      architecturePolicy: {
        ...CONTENT_READY_BASELINE.architecturePolicy,
        preferNextWork: [...CONTENT_READY_BASELINE.architecturePolicy.preferNextWork],
        avoidByDefault: [...CONTENT_READY_BASELINE.architecturePolicy.avoidByDefault],
      },
      stablePaths: Object.fromEntries(Object.entries(CONTENT_READY_BASELINE.stablePaths).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])),
    },
    notes: [
      "Keep ids stable across files so existing board, lesson, QA, and sentence routing continues to work without UI changes.",
      "Prefer filling placeholder entries over introducing parallel flow paths.",
      "Add assets first in assets.js, then reference their ids from worlds.js or chapters.js.",
      "Treat this architecture as the locked content-ready baseline unless a truly necessary migration is discovered.",
    ],
  };
}

export function getContentReadyBaselineSummary() {
  return {
    ...CONTENT_READY_BASELINE,
    architecturePolicy: {
      ...CONTENT_READY_BASELINE.architecturePolicy,
      preferNextWork: [...CONTENT_READY_BASELINE.architecturePolicy.preferNextWork],
      avoidByDefault: [...CONTENT_READY_BASELINE.architecturePolicy.avoidByDefault],
    },
    stablePaths: Object.fromEntries(Object.entries(CONTENT_READY_BASELINE.stablePaths).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])),
    nextFocus: [
      "replace placeholder packs with real lessons",
      "insert sentence/question datasets behind existing ids",
      "swap placeholder visuals/rewards with final assets",
      "attach animation configs/assets through assets.js + existing hook ids",
    ],
  };
}
