/**
 * chapters.js
 * Centralized chapter definitions used by the board game and chapter-related screens.
 */

import { CHAPTER_IDS, SCREEN_NAMES, WORLD_IDS } from "./constants.js";
import { getWorldConfig, resolveBoardWorld } from "./worlds.js";

const CHAPTER_CONTENT = [
  {
    id: CHAPTER_IDS.CH1,
    worldId: WORLD_IDS.WORLD_1,
    index: 1,
    title: "1-р бүлэг · Далай гатлалт",
    story: "Далайчид салхи, өлсгөлөн, айдастай нүүр тулж, алс эргийн ард түмэн өдөр тутмын амьдралаа үргэлжлүүлнэ.",
    nodeCount: 6,
    startTile: 1,
    endTile: 6,
  },
  {
    id: CHAPTER_IDS.CH2,
    worldId: WORLD_IDS.WORLD_1,
    index: 2,
    title: "2-р бүлэг · Газардаж анх уулзсан нь",
    story: "Газар харагдаж, сониуч зан нэмэгдэнэ. Анхны солилцоо бэлэг, дохио, үл ойлголцлоор өрнөнө.",
    nodeCount: 6,
    startTile: 7,
    endTile: 12,
  },
  {
    id: CHAPTER_IDS.CH3,
    worldId: WORLD_IDS.WORLD_1,
    index: 3,
    title: "3-р бүлэг · Солилцоо, алт, хурцадмал байдал",
    story: "Солилцоо эхлэх ч алт эрсэн шахалт нэмэгдэж, үл ойлголцол итгэлцлийг сулруулна.",
    nodeCount: 8,
    startTile: 13,
    endTile: 20,
  },
  {
    id: CHAPTER_IDS.CH4,
    worldId: WORLD_IDS.WORLD_1,
    index: 4,
    title: "4-р бүлэг · Амьд үлдэхүй ба эмзэг суурьшил",
    story: "Шуурга, хомсдол, айдас нь тодорхойгүй өдрүүдэд амьд үлдэх гэж буй суурьшигчдыг сорьно.",
    nodeCount: 6,
    startTile: 21,
    endTile: 26,
  },
];

function createChapterConfig(definition) {
  const worldConfig = getWorldConfig(definition.worldId);
  return {
    ...definition,
    coverImage: worldConfig?.introCoverImage || null,
    startScreen: SCREEN_NAMES.CHAPTER_COVER,
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
