import { CHAPTER_IDS, DIFFICULTY_LEVELS, PLACEHOLDER_STATES, WORLD_IDS } from "./constants.js";

export const CONTENT_GROUPS = {
  WORLD_1_PLACEHOLDER_CHAPTERS: [CHAPTER_IDS.CH2, CHAPTER_IDS.CH3, CHAPTER_IDS.CH4],
};

export function createChapterContentRefs({
  lessonPackId = null,
  wordBankId = null,
  qaSetId = null,
  sentenceBankId = null,
} = {}) {
  return {
    lessonPackId,
    wordBankId,
    qaSetId,
    sentenceBankId,
  };
}

export function buildWorldChapterContentIds({ worldId, chapterId, descriptor = "placeholder", difficulty = DIFFICULTY_LEVELS.BEGINNER } = {}) {
  const chapterStem = `${worldId}-${chapterId}`;
  return createChapterContentRefs({
    lessonPackId: `${chapterStem}-${difficulty}-${descriptor}`,
    wordBankId: `word-bank-${chapterStem}-${descriptor}`,
    qaSetId: `qa-set-${chapterStem}-${descriptor}`,
    sentenceBankId: `sentence-bank-${chapterStem}-${descriptor}`,
  });
}

export const SHARED_CONTENT_IDS = {
  rewardTheme: "reward-theme-shared-core",
  world1Chapter1: createChapterContentRefs({
    lessonPackId: "world1-ch1-beginner-first-steps",
    wordBankId: "word-bank-world1-ch1-first-steps",
    qaSetId: "qa-set-world1-ch1-first-steps",
    sentenceBankId: "sentence-bank-world1-ch1-first-steps",
  }),
};

export const CHAPTER_CONTENT_REGISTRY = {
  [WORLD_IDS.WORLD_1]: {
    [CHAPTER_IDS.CH1]: SHARED_CONTENT_IDS.world1Chapter1,
    [CHAPTER_IDS.CH2]: buildWorldChapterContentIds({ worldId: WORLD_IDS.WORLD_1, chapterId: CHAPTER_IDS.CH2 }),
    [CHAPTER_IDS.CH3]: buildWorldChapterContentIds({ worldId: WORLD_IDS.WORLD_1, chapterId: CHAPTER_IDS.CH3 }),
    [CHAPTER_IDS.CH4]: buildWorldChapterContentIds({ worldId: WORLD_IDS.WORLD_1, chapterId: CHAPTER_IDS.CH4 }),
  },
};

export function getChapterContentRefs(worldId, chapterId) {
  return CHAPTER_CONTENT_REGISTRY[worldId]?.[chapterId]
    ? { ...CHAPTER_CONTENT_REGISTRY[worldId][chapterId] }
    : createChapterContentRefs();
}

export function createSentenceBankRoute({
  id,
  worldId,
  chapterId = null,
  difficulty = DIFFICULTY_LEVELS.BEGINNER,
  dataPath = "data/sentences.json",
  datasetKey = null,
  state = PLACEHOLDER_STATES.PLACEHOLDER,
  notes = "",
} = {}) {
  return {
    id,
    worldId,
    chapterId,
    difficulty,
    dataPath,
    datasetKey: datasetKey || id,
    state,
    notes,
  };
}

export const SENTENCE_BANK_ROUTE_REGISTRY = {
  "sentence-bank-world1-ch1-first-steps": createSentenceBankRoute({
    id: "sentence-bank-world1-ch1-first-steps",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH1,
    state: PLACEHOLDER_STATES.READY,
    notes: "Starter Chapter 1 sentence bank for greetings, simple words, and daily conversation.",
  }),
  "sentence-bank-shared-default": createSentenceBankRoute({
    id: "sentence-bank-shared-default",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH1,
    state: PLACEHOLDER_STATES.READY,
    datasetKey: "sentence-bank-world1-ch1-first-steps",
    notes: "Legacy fallback alias for the Chapter 1 starter sentence bank.",
  }),
  "sentence-bank-world1-ch2-placeholder": createSentenceBankRoute({
    id: "sentence-bank-world1-ch2-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH2,
    notes: "Insert CH2 sentence data later, keeping the same JSON loading flow.",
  }),
  "sentence-bank-world1-ch3-placeholder": createSentenceBankRoute({
    id: "sentence-bank-world1-ch3-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH3,
    notes: "Insert CH3 sentence data later, keeping the same JSON loading flow.",
  }),
  "sentence-bank-world1-ch4-placeholder": createSentenceBankRoute({
    id: "sentence-bank-world1-ch4-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH4,
    notes: "Insert CH4 sentence data later, keeping the same JSON loading flow.",
  }),
  "sentence-bank-world2-placeholder": createSentenceBankRoute({
    id: "sentence-bank-world2-placeholder",
    worldId: WORLD_IDS.WORLD_2,
    notes: "Insert World 2 sentence data later.",
  }),
  "sentence-bank-world3-placeholder": createSentenceBankRoute({
    id: "sentence-bank-world3-placeholder",
    worldId: WORLD_IDS.WORLD_3,
    notes: "Insert World 3 sentence data later.",
  }),
};

export function getSentenceBankRoute(bankId) {
  return bankId && SENTENCE_BANK_ROUTE_REGISTRY[bankId]
    ? { ...SENTENCE_BANK_ROUTE_REGISTRY[bankId] }
    : null;
}

export function normalizeSentenceDatasetRow(row = {}, index = 0) {
  return {
    id: row.id ?? index + 1,
    bankId: row.bankId || "sentence-bank-world1-ch1-first-steps",
    worldId: row.worldId || WORLD_IDS.WORLD_1,
    chapterId: row.chapterId || null,
    level: row.level || DIFFICULTY_LEVELS.BEGINNER,
    topic: row.topic || "",
    en: row.en || "",
    mn: row.mn || "",
  };
}
