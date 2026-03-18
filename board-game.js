/**
 * board-game.js
 * Board game-only data model and board construction helpers.
 */

import { getChaptersByWorld } from "./chapters.js";
import { WORLD_IDS } from "./constants.js";

export const BOARD_GAME_CONFIG = {
  levels: {
    [WORLD_IDS.WORLD_1]: {
      id: WORLD_IDS.WORLD_1,
      totalTiles: 26,
      chapters: getChaptersByWorld(WORLD_IDS.WORLD_1),
      tileEffects: {
        reward: { xp: 12, coins: 8 },
        penalty: { xp: -5, coins: -4 },
        checkpoint: { xp: 15, coins: 10 },
        finish: { xp: 40, coins: 30 },
      },
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
