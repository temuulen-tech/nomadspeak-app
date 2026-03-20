/**
 * worlds.js
 * Centralized world definitions and world-level metadata used across the app.
 */

import { ASSETS } from "./assets.js";
import { GAME_MODES, WORLD_IDS } from "./constants.js";

const SELECTABLE_WORLD_CONTENT = [
  {
    id: WORLD_IDS.WORLD_1,
    title: "Колумб ба Шинэ тивийнхэн",
    subtitle: "Та битгий уурлаарай",
    introCoverImage: ASSETS.chapterCovers.columbusNewWorld,
    backgroundImage: ASSETS.worldBackgrounds.sailorsDeck,
    ambienceWorldId: WORLD_IDS.SEA,
    selectable: true,
    boardConfigId: WORLD_IDS.WORLD_1,
  },
  {
    id: WORLD_IDS.WORLD_2,
    title: "Эртний Хятад ба Торгоны зам",
    subtitle: "Та битгий уурлаарай",
    introCoverImage: ASSETS.chapterCovers.columbusNewWorld,
    backgroundImage: ASSETS.worldBackgrounds.sailorsDeck,
    ambienceWorldId: WORLD_IDS.SEA,
    selectable: true,
    boardConfigId: WORLD_IDS.WORLD_1,
  },
  {
    id: WORLD_IDS.WORLD_3,
    title: "Ромын эзэнт гүрэн ба Гладиаторууд",
    subtitle: "Та битгий уурлаарай",
    introCoverImage: ASSETS.chapterCovers.columbusNewWorld,
    backgroundImage: ASSETS.worldBackgrounds.sailorsDeck,
    ambienceWorldId: WORLD_IDS.SEA,
    selectable: true,
    boardConfigId: WORLD_IDS.WORLD_1,
  },
];

export const WORLD_CONFIGS = {
  ...SELECTABLE_WORLD_CONTENT.reduce((acc, world) => ({ ...acc, [world.id]: world }), {}),
  [WORLD_IDS.SEA]: {
    id: WORLD_IDS.SEA,
    title: "Далайн ертөнц",
    audioTrack: {
      src: ASSETS.audioTracks.seaSailorsWorld,
      volume: 0.16,
      loop: true,
      fadeInMs: 1800,
      fadeOutMs: 1100,
      supportedModes: [GAME_MODES.HOME, GAME_MODES.LESSON, GAME_MODES.SENTENCES, GAME_MODES.BOARD_GAME],
    },
  },
};

export const DEFAULT_WORLD_ID = WORLD_IDS.WORLD_1;
export const DEFAULT_WORLD_BOARD_CONFIG_ID = WORLD_IDS.WORLD_1;

export const BOARD_WORLD_SELECTIONS = SELECTABLE_WORLD_CONTENT.map((world) => ({
  id: world.id,
  label: world.title,
  subtitle: world.subtitle || "",
}));

export function getWorldConfig(worldId = DEFAULT_WORLD_ID) {
  return WORLD_CONFIGS[worldId] || null;
}

export function getSelectableBoardWorlds() {
  return BOARD_WORLD_SELECTIONS.map((world) => ({ ...world }));
}

export function resolveBoardWorld(worldId = DEFAULT_WORLD_ID) {
  const selectedWorld = getWorldConfig(worldId) || getWorldConfig(DEFAULT_WORLD_ID);
  const effectiveBoardWorldId = selectedWorld?.boardConfigId || DEFAULT_WORLD_BOARD_CONFIG_ID;

  return {
    selectedWorld,
    effectiveBoardWorldId,
    effectiveBoardWorld: getWorldConfig(effectiveBoardWorldId) || selectedWorld || null,
  };
}

export function getWorldAudioTrack(worldId = WORLD_IDS.SEA) {
  return WORLD_CONFIGS[worldId]?.audioTrack || null;
}
