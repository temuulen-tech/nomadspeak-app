/**
 * chapters.js
 * Centralized chapter definitions used by the board game and chapter-related screens.
 */

import { getAnimationHookMeta } from "./assets.js";
import {
  ANIMATION_HOOKS,
  CHAPTER_IDS,
  CONTENT_COLLECTIONS,
  FUTURE_CONTENT_SLOTS,
  PLACEHOLDER_STATES,
  SCREEN_NAMES,
  WORLD_IDS,
  createPlaceholderMeta,
} from "./constants.js";
import { getWorldConfig, resolveBoardWorld } from "./worlds.js";

const CHAPTER_CONTENT = [
  {
    id: CHAPTER_IDS.CH1,
    worldId: WORLD_IDS.WORLD_1,
    index: 1,
    lessonPackId: "world1-ch1-beginner-landing-kit",
    wordBankId: "word-bank-world1-ch1-core",
    qaSetId: "qa-set-shared-core",
    sentenceBankId: "sentence-bank-shared-default",
    title: "1-р бүлэг · Далай гатлалт",
    story: "Далайчид салхи, өлсгөлөн, айдастай нүүр тулж, алс эргийн ард түмэн өдөр тутмын амьдралаа үргэлжлүүлнэ.",
    nodeCount: 6,
    startTile: 1,
    endTile: 6,
    expansion: {
      rewardVisualId: "reward-theme-shared-core",
      animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
    },
  },
  {
    id: CHAPTER_IDS.CH2,
    worldId: WORLD_IDS.WORLD_1,
    index: 2,
    lessonPackId: "world1-ch2-placeholder",
    wordBankId: "word-bank-world1-ch2-placeholder",
    qaSetId: "qa-set-world1-ch2-placeholder",
    sentenceBankId: "sentence-bank-world1-ch2-placeholder",
    title: "2-р бүлэг · Газардаж анх уулзсан нь",
    story: "Газар харагдаж, сониуч зан нэмэгдэнэ. Анхны солилцоо бэлэг, дохио, үл ойлголцлоор өрнөнө.",
    nodeCount: 6,
    startTile: 7,
    endTile: 12,
    expansion: {
      rewardVisualId: "reward-theme-shared-core",
      animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
    },
  },
  {
    id: CHAPTER_IDS.CH3,
    worldId: WORLD_IDS.WORLD_1,
    index: 3,
    lessonPackId: "world1-ch3-placeholder",
    wordBankId: "word-bank-world1-ch3-placeholder",
    qaSetId: "qa-set-world1-ch3-placeholder",
    sentenceBankId: "sentence-bank-world1-ch3-placeholder",
    title: "3-р бүлэг · Солилцоо, алт, хурцадмал байдал",
    story: "Солилцоо эхлэх ч алт эрсэн шахалт нэмэгдэж, үл ойлголцол итгэлцлийг сулруулна.",
    nodeCount: 8,
    startTile: 13,
    endTile: 20,
    expansion: {
      rewardVisualId: "reward-theme-shared-core",
      animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
    },
  },
  {
    id: CHAPTER_IDS.CH4,
    worldId: WORLD_IDS.WORLD_1,
    index: 4,
    lessonPackId: "world1-ch4-placeholder",
    wordBankId: "word-bank-world1-ch4-placeholder",
    qaSetId: "qa-set-world1-ch4-placeholder",
    sentenceBankId: "sentence-bank-world1-ch4-placeholder",
    title: "4-р бүлэг · Амьд үлдэхүй ба эмзэг суурьшил",
    story: "Шуурга, хомсдол, айдас нь тодорхойгүй өдрүүдэд амьд үлдэх гэж буй суурьшигчдыг сорьно.",
    nodeCount: 6,
    startTile: 21,
    endTile: 26,
    expansion: {
      rewardVisualId: "reward-theme-shared-core",
      animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
    },
  },
];

function buildChapterExpansion(definition, worldConfig) {
  return {
    lessonPack: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.LESSON_PACKS,
      slot: FUTURE_CONTENT_SLOTS.LESSON_PACK,
      id: definition.lessonPackId,
      state: definition.lessonPackId === "world1-ch1-beginner-landing-kit" ? PLACEHOLDER_STATES.READY : PLACEHOLDER_STATES.PLACEHOLDER,
    }),
    wordBank: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.WORD_BANKS,
      slot: FUTURE_CONTENT_SLOTS.WORD_BANK,
      id: definition.wordBankId,
      notes: "Add chapter-specific word bank data later without editing screen flow.",
    }),
    qaSet: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.QA_SETS,
      slot: FUTURE_CONTENT_SLOTS.QA_SET,
      id: definition.qaSetId,
      notes: "Add chapter-specific QA round data later if needed.",
    }),
    sentenceBank: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
      slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
      id: definition.sentenceBankId,
      notes: "Add chapter-specific sentence bank content later.",
    }),
    worldCover: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.WORLD_VISUALS,
      slot: FUTURE_CONTENT_SLOTS.WORLD_COVER,
      state: worldConfig?.expansion?.coverImage?.state || PLACEHOLDER_STATES.PLACEHOLDER,
      id: worldConfig?.expansion?.coverImage?.id || null,
    }),
    rewardVisual: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.REWARD_VISUALS,
      slot: FUTURE_CONTENT_SLOTS.WORLD_REWARD_VISUAL,
      id: definition.expansion?.rewardVisualId || null,
      notes: "Add chapter/world-specific reward art later if desired.",
    }),
    animationHooks: (definition.expansion?.animationHooks || []).map((hookId) => getAnimationHookMeta(hookId)).filter(Boolean),
  };
}

function createChapterConfig(definition) {
  const worldConfig = getWorldConfig(definition.worldId);
  return {
    ...definition,
    coverImage: worldConfig?.introCoverImage || null,
    startScreen: SCREEN_NAMES.CHAPTER_COVER,
    expansion: buildChapterExpansion(definition, worldConfig),
  };
}

export const CHAPTER_CONFIGS = CHAPTER_CONTENT.reduce((acc, definition) => ({
  ...acc,
  [definition.id]: createChapterConfig(definition),
}), {});

export const BOARD_WORLD_CHAPTERS = Object.values(CHAPTER_CONFIGS)
  .filter((chapter) => chapter.worldId === WORLD_IDS.WORLD_1)
  .sort((a, b) => a.index - b.index);

export function getChapterConfig(chapterId) {
  return CHAPTER_CONFIGS[chapterId] || null;
}

export function getChaptersByWorld(worldId) {
  return Object.values(CHAPTER_CONFIGS)
    .filter((chapter) => chapter.worldId === worldId)
    .sort((a, b) => a.index - b.index);
}

export function getDefaultChapterForWorld(worldId) {
  const { effectiveBoardWorldId } = resolveBoardWorld(worldId);
  return getChaptersByWorld(effectiveBoardWorldId)[0] || BOARD_WORLD_CHAPTERS[0] || null;
}

export function resolveBoardSelectionRoute({ worldId, difficultyId, chapterId } = {}) {
  const { selectedWorld, effectiveBoardWorldId, effectiveBoardWorld } = resolveBoardWorld(worldId);
  const resolvedChapter = getChapterConfig(chapterId)
    || getDefaultChapterForWorld(selectedWorld?.id || effectiveBoardWorldId)
    || null;

  return {
    worldId: selectedWorld?.id || effectiveBoardWorldId,
    effectiveBoardWorldId,
    difficultyId: difficultyId || null,
    chapterId: resolvedChapter?.id || null,
    nextScreen: SCREEN_NAMES.BOARD,
    previewScreen: SCREEN_NAMES.CHAPTER_COVER,
    selectedWorld,
    effectiveBoardWorld,
    chapter: resolvedChapter,
  };
}
