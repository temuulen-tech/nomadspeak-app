/**
 * Centralized visual asset registry for NomadSpeak.
 * Keep image/icon/cover/background/audio paths here so screen modules can reference one source of truth.
 *
 * Real content insertion ownership:
 * - Store file-path-based asset registrations here.
 * - worlds.js and chapters.js should reference asset ids from this file instead of hardcoding paths.
 * - Future animation hooks should be registered here first, then referenced elsewhere by hook id.
 */

import {
  ANIMATION_HOOKS,
  CONTENT_COLLECTIONS,
  FUTURE_CONTENT_SLOTS,
  PLACEHOLDER_STATES,
  WORLD_IDS,
  createPlaceholderMeta,
} from "./constants.js";

export const ASSET_INSERTION_EXAMPLE = {
  worldVisual: {
    id: "world1-ch2-cover",
    worldId: WORLD_IDS.WORLD_1,
    slot: FUTURE_CONTENT_SLOTS.WORLD_COVER,
    state: PLACEHOLDER_STATES.READY,
    path: "assets/worlds/world1/ch2-cover.png",
    alt: "World 1 Chapter 2 cover",
  },
  worldBackground: {
    id: "world1-ch2-background",
    worldId: WORLD_IDS.WORLD_1,
    slot: FUTURE_CONTENT_SLOTS.WORLD_BACKGROUND,
    state: PLACEHOLDER_STATES.READY,
    path: "assets/worlds/world1/ch2-background.png",
    alt: "World 1 Chapter 2 background",
  },
  animationHook: {
    id: ANIMATION_HOOKS.CHAPTER_REVEAL,
    collection: CONTENT_COLLECTIONS.ANIMATION_HOOKS,
    slot: FUTURE_CONTENT_SLOTS.INTRO_ANIMATION,
    notes: "Attach config for later motion without changing selection flow.",
  },
};

const rewardIconEntries = [
  { id: "flag", path: "assets/rewards/reward-flag.png", alt: "Шагнал туг" },
  { id: "star", path: "assets/rewards/reward-star.png", alt: "Шагнал од" },
  { id: "coin", path: "assets/rewards/reward-coin.png", alt: "Шагнал зоос" },
  { id: "trophy", path: "assets/rewards/reward-trophy.png", alt: "Шагнал цом" },
  { id: "diamond", path: "assets/rewards/reward-diamond.png", alt: "Шагнал эрдэнэ" },
];

const worldVisualEntries = [
  {
    id: "world1-cover",
    worldId: WORLD_IDS.WORLD_1,
    slot: FUTURE_CONTENT_SLOTS.WORLD_COVER,
    state: PLACEHOLDER_STATES.READY,
    path: "assets/worlds/sailors/intro/game-cover-columbus-new-world-portrait.png",
    alt: "Колумб ба Шинэ тивийнхэн ертөнцийн хавтас",
  },
  {
    id: "world2-cover-placeholder",
    worldId: WORLD_IDS.WORLD_2,
    slot: FUTURE_CONTENT_SLOTS.WORLD_COVER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    path: "assets/worlds/sailors/intro/game-cover-columbus-new-world-portrait.png",
    alt: "Ирээдүйн ертөнцийн placeholder хавтас",
  },
  {
    id: "world3-cover-placeholder",
    worldId: WORLD_IDS.WORLD_3,
    slot: FUTURE_CONTENT_SLOTS.WORLD_COVER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    path: "assets/worlds/sailors/intro/game-cover-columbus-new-world-portrait.png",
    alt: "Ирээдүйн ертөнцийн placeholder хавтас",
  },
];

const worldBackgroundEntries = [
  {
    id: "sailors-deck",
    worldId: WORLD_IDS.WORLD_1,
    slot: FUTURE_CONTENT_SLOTS.WORLD_BACKGROUND,
    state: PLACEHOLDER_STATES.READY,
    path: "assets/worlds/sailors/ship-deck.png",
    alt: "Хөлгийн тавцангийн дэвсгэр",
  },
  {
    id: "shared-world-background-placeholder",
    worldId: null,
    slot: FUTURE_CONTENT_SLOTS.WORLD_BACKGROUND,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    path: "assets/worlds/sailors/ship-deck.png",
    alt: "Ирээдүйн ертөнцийн дэвсгэр placeholder",
  },
];

const audioTrackEntries = [
  {
    id: "sea-sailors-world",
    worldId: WORLD_IDS.SEA,
    slot: FUTURE_CONTENT_SLOTS.AMBIENCE_TRACK,
    state: PLACEHOLDER_STATES.READY,
    path: "assets/audio/sea-sailors-world.mp3",
  },
];

export const FUTURE_VISUAL_LIBRARY = {
  worlds: worldVisualEntries,
  backgrounds: worldBackgroundEntries,
  rewards: rewardIconEntries,
  audioTracks: audioTrackEntries,
  animationHooks: [
    {
      id: ANIMATION_HOOKS.WORLD_INTRO,
      ...createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.ANIMATION_HOOKS,
        slot: FUTURE_CONTENT_SLOTS.INTRO_ANIMATION,
        id: ANIMATION_HOOKS.WORLD_INTRO,
        notes: "Attach future world intro animation config here when visuals are ready.",
      }),
    },
    {
      id: ANIMATION_HOOKS.CHAPTER_REVEAL,
      ...createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.ANIMATION_HOOKS,
        slot: FUTURE_CONTENT_SLOTS.INTRO_ANIMATION,
        id: ANIMATION_HOOKS.CHAPTER_REVEAL,
        notes: "Attach future chapter reveal animation config here.",
      }),
    },
    {
      id: ANIMATION_HOOKS.LESSON_SUCCESS,
      ...createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.ANIMATION_HOOKS,
        slot: FUTURE_CONTENT_SLOTS.REWARD_ANIMATION,
        id: ANIMATION_HOOKS.LESSON_SUCCESS,
        notes: "Attach future lesson success animation config here.",
      }),
    },
    {
      id: ANIMATION_HOOKS.QA_REWARD,
      ...createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.ANIMATION_HOOKS,
        slot: FUTURE_CONTENT_SLOTS.REWARD_ANIMATION,
        id: ANIMATION_HOOKS.QA_REWARD,
        notes: "Attach future QA reward animation config here.",
      }),
    },
    {
      id: ANIMATION_HOOKS.SENTENCE_SUCCESS,
      ...createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.ANIMATION_HOOKS,
        slot: FUTURE_CONTENT_SLOTS.GAMEPLAY_ANIMATION,
        id: ANIMATION_HOOKS.SENTENCE_SUCCESS,
        notes: "Attach future sentence success animation config here.",
      }),
    },
    {
      id: ANIMATION_HOOKS.WORLD_REWARD,
      ...createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.ANIMATION_HOOKS,
        slot: FUTURE_CONTENT_SLOTS.REWARD_ANIMATION,
        id: ANIMATION_HOOKS.WORLD_REWARD,
        notes: "Attach future world reward animation config here.",
      }),
    },
  ],
};

export const ASSETS = {
  chapterCovers: {
    columbusNewWorld: worldVisualEntries[0].path,
  },
  rewardIcons: rewardIconEntries.reduce((acc, entry) => ({
    ...acc,
    [entry.id]: entry.path,
  }), {}),
  rewardIconEntries,
  worldVisualEntries,
  worldBackgroundEntries,
  audioTrackEntries,
  worldBackgrounds: {
    sailorsDeck: worldBackgroundEntries[0].path,
  },
  audioTracks: {
    seaSailorsWorld: audioTrackEntries[0].path,
  },
  characterImages: {
    hero: "assets/hero.png",
  },
  appIcons: {
    icon192: "assets/icons/icon-192.svg",
    icon512: "assets/icons/icon-512.svg",
  },
};

export const REWARD_ICON_SEQUENCE = ASSETS.rewardIconEntries.map((entry) => entry.path);

export function getRewardAssetByLevel(level = 1) {
  const rewardEntry = ASSETS.rewardIconEntries[level - 1] || null;
  return rewardEntry ? { ...rewardEntry, level, image: rewardEntry.path } : null;
}

export function getWorldCoverAsset(worldId) {
  return worldVisualEntries.find((entry) => entry.worldId === worldId && entry.slot === FUTURE_CONTENT_SLOTS.WORLD_COVER) || null;
}

export function getWorldBackgroundAsset(worldId) {
  return worldBackgroundEntries.find((entry) => entry.worldId === worldId)
    || worldBackgroundEntries.find((entry) => entry.id === "shared-world-background-placeholder")
    || null;
}

export function getAudioTrackAsset(trackId) {
  return audioTrackEntries.find((entry) => entry.id === trackId) || null;
}

export function getAnimationHookMeta(hookId) {
  return FUTURE_VISUAL_LIBRARY.animationHooks.find((entry) => entry.id === hookId) || null;
}

export function getAssetInsertionGuide() {
  return {
    ownership: {
      file: "assets.js",
      manages: [
        "cover/background/audio asset ids",
        "reward art ids",
        "future animation hook registrations",
      ],
    },
    example: JSON.parse(JSON.stringify(ASSET_INSERTION_EXAMPLE)),
  };
}
