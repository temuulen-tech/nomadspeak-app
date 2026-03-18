/**
 * worlds.js
 * Centralized world definitions and world-level metadata used across the app.
 */

import { ASSETS } from "./assets.js";
import { GAME_MODES, WORLD_IDS } from "./constants.js";

export const WORLD_CONFIGS = {
  [WORLD_IDS.WORLD_1]: {
    id: WORLD_IDS.WORLD_1,
    title: "Колумб ба Шинэ тивийнхэн",
    subtitle: "Та битгий уурлаарай",
    introCoverImage: ASSETS.chapterCovers.columbusNewWorld,
    backgroundImage: ASSETS.worldBackgrounds.sailorsDeck,
    ambienceWorldId: WORLD_IDS.SEA,
  },
  [WORLD_IDS.SEA]: {
    id: WORLD_IDS.SEA,
    title: "Далайн ертөнц",
    audioTrack: {
      src: "assets/audio/sea-sailors-world.mp3",
      volume: 0.16,
      loop: true,
      fadeInMs: 1800,
      fadeOutMs: 1100,
      supportedModes: [GAME_MODES.HOME, GAME_MODES.LESSON, GAME_MODES.SENTENCES, GAME_MODES.BOARD_GAME],
    },
  },
};

export const DEFAULT_WORLD_ID = WORLD_IDS.WORLD_1;

export function getWorldConfig(worldId = DEFAULT_WORLD_ID) {
  return WORLD_CONFIGS[worldId] || null;
}

export function getWorldAudioTrack(worldId = WORLD_IDS.SEA) {
  return WORLD_CONFIGS[worldId]?.audioTrack || null;
}
