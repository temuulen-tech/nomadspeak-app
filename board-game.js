/**
 * board-game.js
 * Board game-only data model and board construction helpers.
 */

import { CHAPTER_IDS, WORLD_IDS } from "./constants.js";

export const BOARD_GAME_CONFIG = {
  levels: {
    [WORLD_IDS.WORLD_1]: {
      totalTiles: 26,
      chapters: [
        { id: CHAPTER_IDS.CH1, index: 1, title: "I бүлэг: Аяллын эхлэл", story: "Та хилийн боомт дээр ирлээ.", startTile: 1, endTile: 5 },
        { id: CHAPTER_IDS.CH2, index: 2, title: "II бүлэг: Хотын төв", story: "Та хэл сурах шинэ орчинд орлоо.", startTile: 6, endTile: 10 },
        { id: CHAPTER_IDS.CH3, index: 3, title: "III бүлэг: Захын буудал", story: "Одоо та аяллын хурдыг мэдэрч эхэллээ.", startTile: 11, endTile: 15 },
        { id: CHAPTER_IDS.CH4, index: 4, title: "IV бүлэг: Соёлын өртөө", story: "Яриа улам гүнзгий болж байна.", startTile: 16, endTile: 20 },
        { id: CHAPTER_IDS.CH5, index: 5, title: "V бүлэг: Оргил хүрэх зам", story: "Та финалын сорилтод ойртож байна.", startTile: 21, endTile: 26 },
      ],
    },
  },
};

export function boardTileEmoji(tileType) {
  const map = { normal: "·", reward: "💰", penalty: "⚠", story: "📜", checkpoint: "🏁", finish: "👑" };
  return map[tileType] || "·";
}

export function buildBoardGameTiles(levelConfig) {
  const typeByTile = {
    1: "story", 5: "reward", 7: "checkpoint", 10: "penalty", 12: "story", 14: "reward", 16: "penalty", 18: "story", 20: "checkpoint", 22: "reward", 25: "penalty", 26: "finish",
  };

  return Array.from({ length: levelConfig.totalTiles }, (_, index) => {
    const tileNumber = index + 1;
    const chapter = levelConfig.chapters.find((item) => tileNumber >= item.startTile && tileNumber <= item.endTile) || levelConfig.chapters[0];
    return {
      id: `tile-${tileNumber}`,
      tileNumber,
      tileType: typeByTile[tileNumber] || "normal",
      chapterId: chapter.id,
      label: String(tileNumber),
    };
  });
}
