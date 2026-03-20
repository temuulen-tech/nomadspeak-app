/**
 * chapters.js
 * Centralized chapter definitions used by the board game and chapter-related screens.
 *
 * Real content insertion ownership:
 * - Keep chapter order, story copy, node ranges, and per-chapter content ids here.
 * - Each chapter should point to exactly one lessonPackId, wordBankId, qaSetId, and sentenceBankId for the current insertion pass.
 * - Screen modules read chapter configs; they should not need edits when new real content is inserted with the same ids.
 * Quick drop-in reminder:
 * - If a chapter gets new real content, update the ids here first, then fill those ids in lesson.js / qa-game.js / sentence-game.js.
 */

import { getAnimationHookMeta } from "./assets.js";
import { getLessonContentPackById } from "./lesson.js";
import { getQaContentSet } from "./qa-game.js";
import { getSentenceContentBank } from "./sentence-game.js";
import {
  ANIMATION_HOOKS,
  CHAPTER_IDS,
  CONTENT_TEMPLATE_SECTIONS,
  CONTENT_COLLECTIONS,
  FUTURE_CONTENT_SLOTS,
  PLACEHOLDER_STATES,
  SCREEN_NAMES,
  WORLD_IDS,
  cloneInsertionExample,
  createPlaceholderMeta,
  createStarterTemplateManifest,
} from "./constants.js";
import { getWorldConfig, resolveBoardWorld, resolveWorldContentRefs } from "./worlds.js";

const CHAPTER_CONTENT_INSERTION_EXAMPLE = {
  id: "chX",
  worldId: WORLD_IDS.WORLD_1,
  index: 2,
  title: "2-р бүлэг · Future chapter",
  story: "Short chapter summary shown in the current board flow.",
  nodeCount: 6,
  startTile: 7,
  endTile: 12,
  content: {
    lessonPackId: "world1-ch2-beginner-core",
    wordBankId: "word-bank-world1-ch2-core",
    qaSetId: "qa-set-world1-ch2-core",
    sentenceBankId: "sentence-bank-world1-ch2-core",
  },
  expansion: {
    rewardVisualId: "reward-theme-shared-core",
    animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
  },
};

function createChapterDefinition({
  id,
  worldId,
  index,
  title,
  story,
  nodeCount,
  startTile,
  endTile,
  content = {},
  expansion = {},
} = {}) {
  return {
    id,
    worldId,
    index,
    title,
    story,
    nodeCount,
    startTile,
    endTile,
    content: {
      lessonPackId: content.lessonPackId || null,
      wordBankId: content.wordBankId || null,
      qaSetId: content.qaSetId || null,
      sentenceBankId: content.sentenceBankId || null,
    },
    expansion,
  };
}

const CHAPTER_CONTENT = [
  createChapterDefinition({
    id: CHAPTER_IDS.CH1,
    worldId: WORLD_IDS.WORLD_1,
    index: 1,
    content: {
      lessonPackId: "world1-ch1-beginner-landing-kit",
      wordBankId: "word-bank-world1-ch1-core",
      qaSetId: "qa-set-shared-core",
      sentenceBankId: "sentence-bank-shared-default",
    },
    title: "1-р бүлэг · Далай гатлалт",
    story: "Далайчид салхи, өлсгөлөн, айдастай нүүр тулж, алс эргийн ард түмэн өдөр тутмын амьдралаа үргэлжлүүлнэ.",
    nodeCount: 6,
    startTile: 1,
    endTile: 6,
    expansion: {
      rewardVisualId: "reward-theme-shared-core",
      animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
    },
  }),
  createChapterDefinition({
    id: CHAPTER_IDS.CH2,
    worldId: WORLD_IDS.WORLD_1,
    index: 2,
    content: {
      lessonPackId: "world1-ch2-placeholder",
      wordBankId: "word-bank-world1-ch2-placeholder",
      qaSetId: "qa-set-world1-ch2-placeholder",
      sentenceBankId: "sentence-bank-world1-ch2-placeholder",
    },
    title: "2-р бүлэг · Газардаж анх уулзсан нь",
    story: "Газар харагдаж, сониуч зан нэмэгдэнэ. Анхны солилцоо бэлэг, дохио, үл ойлголцлоор өрнөнө.",
    nodeCount: 6,
    startTile: 7,
    endTile: 12,
    expansion: {
      rewardVisualId: "reward-theme-shared-core",
      animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
    },
  }),
  createChapterDefinition({
    id: CHAPTER_IDS.CH3,
    worldId: WORLD_IDS.WORLD_1,
    index: 3,
    content: {
      lessonPackId: "world1-ch3-placeholder",
      wordBankId: "word-bank-world1-ch3-placeholder",
      qaSetId: "qa-set-world1-ch3-placeholder",
      sentenceBankId: "sentence-bank-world1-ch3-placeholder",
    },
    title: "3-р бүлэг · Солилцоо, алт, хурцадмал байдал",
    story: "Солилцоо эхлэх ч алт эрсэн шахалт нэмэгдэж, үл ойлголцол итгэлцлийг сулруулна.",
    nodeCount: 8,
    startTile: 13,
    endTile: 20,
    expansion: {
      rewardVisualId: "reward-theme-shared-core",
      animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
    },
  }),
  createChapterDefinition({
    id: CHAPTER_IDS.CH4,
    worldId: WORLD_IDS.WORLD_1,
    index: 4,
    content: {
      lessonPackId: "world1-ch4-placeholder",
      wordBankId: "word-bank-world1-ch4-placeholder",
      qaSetId: "qa-set-world1-ch4-placeholder",
      sentenceBankId: "sentence-bank-world1-ch4-placeholder",
    },
    title: "4-р бүлэг · Амьд үлдэхүй ба эмзэг суурьшил",
    story: "Шуурга, хомсдол, айдас нь тодорхойгүй өдрүүдэд амьд үлдэх гэж буй суурьшигчдыг сорьно.",
    nodeCount: 6,
    startTile: 21,
    endTile: 26,
    expansion: {
      rewardVisualId: "reward-theme-shared-core",
      animationHooks: [ANIMATION_HOOKS.CHAPTER_REVEAL, ANIMATION_HOOKS.LESSON_SUCCESS],
    },
  }),
];

function getContentRefState(ref) {
  return ref?.state === PLACEHOLDER_STATES.READY ? PLACEHOLDER_STATES.READY : PLACEHOLDER_STATES.PLACEHOLDER;
}

function buildChapterExpansion(definition, worldConfig) {
  const lessonPackMeta = getLessonContentPackById(definition.content.lessonPackId)?.expansion?.lessonPack || null;
  const lessonWordBankMeta = getLessonContentPackById(definition.content.lessonPackId)?.expansion?.wordBank || null;
  const qaSetMeta = getQaContentSet(definition.content.qaSetId)?.expansion?.qaSet || null;
  const sentenceBankMeta = getSentenceContentBank(definition.content.sentenceBankId)?.expansion?.sentenceBank || null;

  return {
    lessonPack: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.LESSON_PACKS,
      slot: FUTURE_CONTENT_SLOTS.LESSON_PACK,
      id: definition.content.lessonPackId,
      state: getContentRefState(lessonPackMeta),
    }),
    wordBank: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.WORD_BANKS,
      slot: FUTURE_CONTENT_SLOTS.WORD_BANK,
      id: definition.content.wordBankId,
      state: getContentRefState(lessonWordBankMeta),
      notes: "Add chapter-specific word bank data later without editing screen flow.",
    }),
    qaSet: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.QA_SETS,
      slot: FUTURE_CONTENT_SLOTS.QA_SET,
      id: definition.content.qaSetId,
      state: getContentRefState(qaSetMeta),
      notes: "Add chapter-specific QA round data later if needed.",
    }),
    sentenceBank: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
      slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
      id: definition.content.sentenceBankId,
      state: getContentRefState(sentenceBankMeta),
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
  const contentRefs = { ...definition.content };
  return {
    ...definition,
    contentRefs,
    lessonPackId: contentRefs.lessonPackId,
    wordBankId: contentRefs.wordBankId,
    qaSetId: contentRefs.qaSetId,
    sentenceBankId: contentRefs.sentenceBankId,
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

export const CHAPTER_STARTER_CONTENT_TEMPLATES = Object.values(CHAPTER_CONFIGS).map((chapter) => createStarterTemplateManifest({
  section: CONTENT_TEMPLATE_SECTIONS.CHAPTER,
  worldId: chapter.worldId,
  chapterId: chapter.id,
  lessonPackId: chapter.lessonPackId,
  wordBankId: chapter.wordBankId,
  qaSetId: chapter.qaSetId,
  sentenceBankId: chapter.sentenceBankId,
  assetIds: {
    coverAssetId: chapter.expansion?.worldCover?.id || null,
    rewardVisualThemeId: chapter.expansion?.rewardVisual?.id || null,
  },
  animationHooks: (chapter.expansion?.animationHooks || []).map((hook) => hook.id),
  notes: `Insert chapter-specific content by keeping ids aligned with ${chapter.id}.`,
}));

export function getChapterStarterTemplate(chapterId) {
  return CHAPTER_STARTER_CONTENT_TEMPLATES.find((template) => template.chapterId === chapterId) || null;
}

export function resolveChapterContent({ chapterId = null, worldId = null, difficultyId = null } = {}) {
  const chapter = getChapterConfig(chapterId) || getDefaultChapterForWorld(worldId);
  const worldContent = resolveWorldContentRefs(chapter?.worldId || worldId, difficultyId);

  return {
    chapter,
    worldId: chapter?.worldId || worldContent.worldId,
    difficultyId: difficultyId || null,
    lessonPackId: chapter?.contentRefs?.lessonPackId || worldContent.lessonPackId || null,
    wordBankId: chapter?.contentRefs?.wordBankId || null,
    qaSetId: chapter?.contentRefs?.qaSetId || worldContent.qaSetId || null,
    sentenceBankId: chapter?.contentRefs?.sentenceBankId || worldContent.sentenceBankId || null,
  };
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
    content: resolveChapterContent({
      chapterId: resolvedChapter?.id || null,
      worldId: selectedWorld?.id || effectiveBoardWorldId,
      difficultyId,
    }),
  };
}

export function getChapterContentInsertionGuide() {
  return {
    ownership: {
      file: "chapters.js",
      manages: [
        "chapter-level routing ids",
        "chapter story/node metadata",
        "chapter starter content templates",
      ],
    },
    starterTemplates: CHAPTER_STARTER_CONTENT_TEMPLATES.map((template) => ({ ...template })),
    example: cloneInsertionExample(CHAPTER_CONTENT_INSERTION_EXAMPLE),
  };
}
