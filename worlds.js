/**
 * worlds.js
 * Centralized world definitions and world-level metadata used across the app.
 */

import { getAnimationHookMeta, getAudioTrackAsset, getWorldBackgroundAsset, getWorldCoverAsset } from "./assets.js";
import {
  ANIMATION_HOOKS,
  CONTENT_COLLECTIONS,
  DIFFICULTY_LEVELS,
  FUTURE_CONTENT_SLOTS,
  GAME_MODES,
  PLACEHOLDER_STATES,
  WORLD_IDS,
  createPlaceholderMeta,
} from "./constants.js";

const SELECTABLE_WORLD_CONTENT = [
  {
    id: WORLD_IDS.WORLD_1,
    title: "Колумб ба Шинэ тивийнхэн",
    subtitle: "Та битгий уурлаарай",
    pilotContentPackId: "world1-ch1-beginner-landing-kit",
    lessonContentMap: {
      [DIFFICULTY_LEVELS.BEGINNER]: "world1-ch1-beginner-landing-kit",
      [DIFFICULTY_LEVELS.INTERMEDIATE]: null,
      [DIFFICULTY_LEVELS.ADVANCED]: null,
    },
    sentenceBankId: "sentence-bank-shared-default",
    qaSetId: "qa-set-shared-core",
    introCoverAssetId: "world1-cover",
    backgroundAssetId: "sailors-deck",
    rewardVisualThemeId: "reward-theme-shared-core",
    ambienceWorldId: WORLD_IDS.SEA,
    selectable: true,
    boardConfigId: WORLD_IDS.WORLD_1,
    expansion: {
      coverImage: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.WORLD_VISUALS,
        slot: FUTURE_CONTENT_SLOTS.WORLD_COVER,
        state: PLACEHOLDER_STATES.READY,
        id: "world1-cover",
      }),
      rewardVisual: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.REWARD_VISUALS,
        slot: FUTURE_CONTENT_SLOTS.WORLD_REWARD_VISUAL,
        state: PLACEHOLDER_STATES.PLACEHOLDER,
        id: "reward-theme-shared-core",
        notes: "Swap this to a world-specific reward theme when art is ready.",
      }),
      animationHooks: [ANIMATION_HOOKS.WORLD_INTRO, ANIMATION_HOOKS.WORLD_REWARD],
    },
  },
  {
    id: WORLD_IDS.WORLD_2,
    title: "Эртний Хятад ба Торгоны зам",
    subtitle: "Та битгий уурлаарай",
    pilotContentPackId: null,
    lessonContentMap: {
      [DIFFICULTY_LEVELS.BEGINNER]: null,
      [DIFFICULTY_LEVELS.INTERMEDIATE]: null,
      [DIFFICULTY_LEVELS.ADVANCED]: null,
    },
    sentenceBankId: "sentence-bank-world2-placeholder",
    qaSetId: "qa-set-world2-placeholder",
    introCoverAssetId: "world2-cover-placeholder",
    backgroundAssetId: "shared-world-background-placeholder",
    rewardVisualThemeId: "reward-theme-world2-placeholder",
    ambienceWorldId: WORLD_IDS.SEA,
    selectable: true,
    boardConfigId: WORLD_IDS.WORLD_1,
    expansion: {
      coverImage: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.WORLD_VISUALS,
        slot: FUTURE_CONTENT_SLOTS.WORLD_COVER,
        id: "world2-cover-placeholder",
        notes: "Replace with the final Silk Road world cover image later.",
      }),
      rewardVisual: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.REWARD_VISUALS,
        slot: FUTURE_CONTENT_SLOTS.WORLD_REWARD_VISUAL,
        id: "reward-theme-world2-placeholder",
        notes: "Attach world-specific rewards later without changing flow logic.",
      }),
      animationHooks: [ANIMATION_HOOKS.WORLD_INTRO, ANIMATION_HOOKS.WORLD_REWARD],
    },
  },
  {
    id: WORLD_IDS.WORLD_3,
    title: "Ромын эзэнт гүрэн ба Гладиаторууд",
    subtitle: "Та битгий уурлаарай",
    pilotContentPackId: null,
    lessonContentMap: {
      [DIFFICULTY_LEVELS.BEGINNER]: null,
      [DIFFICULTY_LEVELS.INTERMEDIATE]: null,
      [DIFFICULTY_LEVELS.ADVANCED]: null,
    },
    sentenceBankId: "sentence-bank-world3-placeholder",
    qaSetId: "qa-set-world3-placeholder",
    introCoverAssetId: "world3-cover-placeholder",
    backgroundAssetId: "shared-world-background-placeholder",
    rewardVisualThemeId: "reward-theme-world3-placeholder",
    ambienceWorldId: WORLD_IDS.SEA,
    selectable: true,
    boardConfigId: WORLD_IDS.WORLD_1,
    expansion: {
      coverImage: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.WORLD_VISUALS,
        slot: FUTURE_CONTENT_SLOTS.WORLD_COVER,
        id: "world3-cover-placeholder",
        notes: "Replace with the final Roman world cover image later.",
      }),
      rewardVisual: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.REWARD_VISUALS,
        slot: FUTURE_CONTENT_SLOTS.WORLD_REWARD_VISUAL,
        id: "reward-theme-world3-placeholder",
        notes: "Attach world-specific rewards later without changing flow logic.",
      }),
      animationHooks: [ANIMATION_HOOKS.WORLD_INTRO, ANIMATION_HOOKS.WORLD_REWARD],
    },
  },
];

function createWorldConfig(definition) {
  const coverAsset = getWorldCoverAsset(definition.id);
  const backgroundAsset = getWorldBackgroundAsset(definition.id);
  return {
    ...definition,
    introCoverImage: coverAsset?.path || null,
    backgroundImage: backgroundAsset?.path || null,
    visualAssets: {
      cover: coverAsset,
      background: backgroundAsset,
      rewardThemeId: definition.rewardVisualThemeId || null,
    },
    animationHooks: (definition.expansion?.animationHooks || []).map((hookId) => getAnimationHookMeta(hookId)).filter(Boolean),
  };
}

const WORLD_AUDIO_TRACKS = {
  [WORLD_IDS.SEA]: {
    id: WORLD_IDS.SEA,
    audioTrack: {
      src: getAudioTrackAsset("sea-sailors-world")?.path || null,
      volume: 0.16,
      loop: true,
      fadeInMs: 1800,
      fadeOutMs: 1100,
      supportedModes: [GAME_MODES.HOME, GAME_MODES.LESSON, GAME_MODES.SENTENCES, GAME_MODES.BOARD_GAME],
      expansion: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.WORLD_VISUALS,
        slot: FUTURE_CONTENT_SLOTS.AMBIENCE_TRACK,
        state: PLACEHOLDER_STATES.READY,
        id: "sea-sailors-world",
      }),
    },
  },
};

export const WORLD_CONFIGS = {
  ...SELECTABLE_WORLD_CONTENT.reduce((acc, world) => ({ ...acc, [world.id]: createWorldConfig(world) }), {}),
  ...WORLD_AUDIO_TRACKS,
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

export function getWorldExpansionPlan(worldId = DEFAULT_WORLD_ID) {
  return getWorldConfig(worldId)?.expansion || null;
}
