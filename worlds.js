/**
 * worlds.js
 * Centralized world definitions and world-level metadata used across the app.
 *
 * Real content insertion ownership:
 * - Keep only world-level routing metadata here: titles, subtitles, difficulty-to-lesson pack refs, shared world QA/sentence defaults, and asset ids.
 * - Do not place full lesson entries, QA rounds, or sentence rows in this file. Those live in their dedicated content modules.
 * - When adding a new world, register asset ids here only after adding the asset records in assets.js.
 * Quick drop-in order for a future pack:
 * 1) add/update world-level ids here,
 * 2) mirror chapter-level ids in chapters.js,
 * 3) fill the referenced content in lesson.js / qa-game.js / sentence-game.js / assets.js.
 */

import {
  getAnimationHookMeta,
  getAudioTrackAsset,
  getWorldArtRegistryEntry,
  getWorldBackgroundAsset,
  getWorldBackgroundAssetById,
  getWorldCoverAsset,
  getWorldVisualAssetById,
} from "./assets.js";
import { getChapterContentRefs, SHARED_CONTENT_IDS } from "./content-registry.js";
import {
  ANIMATION_HOOKS,
  CHAPTER_IDS,
  CONTENT_COLLECTIONS,
  CONTENT_TEMPLATE_SECTIONS,
  DIFFICULTY_LEVELS,
  FUTURE_CONTENT_SLOTS,
  GAME_MODES,
  PLACEHOLDER_STATES,
  SHARED_BOARD_LAYOUT_WORLD_ID,
  WORLD_IDS,
  cloneInsertionExample,
  createPlaceholderMeta,
  createStarterTemplateManifest,
} from "./constants.js";

const WORLD_CONTENT_INSERTION_EXAMPLE = {
  id: "worldX",
  title: "Future world title",
  subtitle: "Short learner-facing subtitle",
  content: {
    pilotLessonPackId: "worldX-ch1-beginner-core",
    lessonContentMap: {
      [DIFFICULTY_LEVELS.BEGINNER]: "worldX-ch1-beginner-core",
      [DIFFICULTY_LEVELS.INTERMEDIATE]: "worldX-ch1-intermediate-core",
      [DIFFICULTY_LEVELS.ADVANCED]: "worldX-ch1-advanced-core",
    },
    sentenceBankId: "sentence-bank-worldX-ch1-beginner",
    qaSetId: "qa-set-worldX-ch1-beginner",
  },
  visuals: {
    coverAssetId: "worldX-cover",
    backgroundAssetId: "worldX-background",
    rewardVisualThemeId: "reward-theme-worldX",
  },
  audio: { ambienceWorldId: WORLD_IDS.SEA },
  board: { configId: "worldX" },
  expansion: {
    animationHooks: [ANIMATION_HOOKS.WORLD_INTRO, ANIMATION_HOOKS.WORLD_REWARD],
  },
};

function createWorldDefinition({
  id,
  title,
  subtitle,
  selectable = true,
  content = {},
  visuals = {},
  audio = {},
  board = {},
  expansion = {},
} = {}) {
  return {
    id,
    title,
    subtitle,
    selectable,
    content: {
      pilotLessonPackId: content.pilotLessonPackId || null,
      lessonContentMap: { ...(content.lessonContentMap || {}) },
      sentenceBankId: content.sentenceBankId || null,
      qaSetId: content.qaSetId || null,
    },
    visuals: {
      coverAssetId: visuals.coverAssetId || null,
      backgroundAssetId: visuals.backgroundAssetId || null,
      rewardVisualThemeId: visuals.rewardVisualThemeId || null,
    },
    audio: {
      ambienceWorldId: audio.ambienceWorldId || null,
    },
    board: {
      configId: board.configId || id || null,
    },
    expansion,
  };
}

const SELECTABLE_WORLD_CONTENT = [
  createWorldDefinition({
    id: WORLD_IDS.WORLD_1,
    title: "Колумб ба Шинэ тивийнхэн",
    subtitle: "Та битгий уурлаарай",
    content: {
      pilotLessonPackId: getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH1).lessonPackId,
      lessonContentMap: {
        [DIFFICULTY_LEVELS.BEGINNER]: "world1-ch1-beginner-first-steps",
        [DIFFICULTY_LEVELS.INTERMEDIATE]: null,
        [DIFFICULTY_LEVELS.ADVANCED]: null,
      },
      sentenceBankId: getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH1).sentenceBankId,
      qaSetId: getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH1).qaSetId,
    },
    visuals: {
      ...getWorldArtRegistryEntry(WORLD_IDS.WORLD_1),
      rewardVisualThemeId: SHARED_CONTENT_IDS.rewardTheme,
    },
    audio: {
      ambienceWorldId: WORLD_IDS.SEA,
    },
    board: {
      configId: SHARED_BOARD_LAYOUT_WORLD_ID,
    },
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
        id: SHARED_CONTENT_IDS.rewardTheme,
        notes: "Swap this to a world-specific reward theme when art is ready.",
      }),
      animationHooks: [ANIMATION_HOOKS.WORLD_INTRO, ANIMATION_HOOKS.WORLD_REWARD],
    },
  }),
  createWorldDefinition({
    id: WORLD_IDS.WORLD_2,
    title: "Эртний Хятад ба Торгоны зам",
    subtitle: "Та битгий уурлаарай",
    content: {
      lessonContentMap: {
        [DIFFICULTY_LEVELS.BEGINNER]: null,
        [DIFFICULTY_LEVELS.INTERMEDIATE]: null,
        [DIFFICULTY_LEVELS.ADVANCED]: null,
      },
      sentenceBankId: "sentence-bank-world2-placeholder",
      qaSetId: "qa-set-world2-placeholder",
    },
    visuals: {
      ...getWorldArtRegistryEntry(WORLD_IDS.WORLD_2),
      rewardVisualThemeId: "reward-theme-world2-placeholder",
    },
    audio: {
      ambienceWorldId: WORLD_IDS.SEA,
    },
    board: {
      configId: SHARED_BOARD_LAYOUT_WORLD_ID,
    },
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
  }),
  createWorldDefinition({
    id: WORLD_IDS.WORLD_3,
    title: "Ромын эзэнт гүрэн ба Гладиаторууд",
    subtitle: "Та битгий уурлаарай",
    content: {
      lessonContentMap: {
        [DIFFICULTY_LEVELS.BEGINNER]: null,
        [DIFFICULTY_LEVELS.INTERMEDIATE]: null,
        [DIFFICULTY_LEVELS.ADVANCED]: null,
      },
      sentenceBankId: "sentence-bank-world3-placeholder",
      qaSetId: "qa-set-world3-placeholder",
    },
    visuals: {
      ...getWorldArtRegistryEntry(WORLD_IDS.WORLD_3),
      rewardVisualThemeId: "reward-theme-world3-placeholder",
    },
    audio: {
      ambienceWorldId: WORLD_IDS.SEA,
    },
    board: {
      configId: SHARED_BOARD_LAYOUT_WORLD_ID,
    },
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
  }),
];

function createWorldConfig(definition) {
  const coverAsset = getWorldVisualAssetById(definition.visuals.coverAssetId) || getWorldCoverAsset(definition.id);
  const backgroundAsset = getWorldBackgroundAssetById(definition.visuals.backgroundAssetId) || getWorldBackgroundAsset(definition.id);
  const contentRefs = {
    pilotLessonPackId: definition.content.pilotLessonPackId,
    lessonContentMap: { ...definition.content.lessonContentMap },
    sentenceBankId: definition.content.sentenceBankId,
    qaSetId: definition.content.qaSetId,
  };
  const assetRefs = {
    coverAssetId: definition.visuals.coverAssetId,
    backgroundAssetId: definition.visuals.backgroundAssetId,
    rewardVisualThemeId: definition.visuals.rewardVisualThemeId,
  };

  return {
    ...definition,
    contentRefs,
    assetRefs,
    pilotContentPackId: contentRefs.pilotLessonPackId,
    lessonContentMap: contentRefs.lessonContentMap,
    sentenceBankId: contentRefs.sentenceBankId,
    qaSetId: contentRefs.qaSetId,
    introCoverAssetId: assetRefs.coverAssetId,
    backgroundAssetId: assetRefs.backgroundAssetId,
    rewardVisualThemeId: assetRefs.rewardVisualThemeId,
    ambienceWorldId: definition.audio.ambienceWorldId,
    boardConfigId: definition.board.configId,
    introCoverImage: coverAsset?.path || null,
    backgroundImage: backgroundAsset?.path || null,
    visualAssets: {
      cover: coverAsset,
      background: backgroundAsset,
      rewardThemeId: assetRefs.rewardVisualThemeId || null,
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
export const DEFAULT_WORLD_BOARD_CONFIG_ID = SHARED_BOARD_LAYOUT_WORLD_ID;

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

export function getWorldContentRefs(worldId = DEFAULT_WORLD_ID) {
  return getWorldConfig(worldId)?.contentRefs || null;
}

export function resolveWorldContentRefs(worldId = DEFAULT_WORLD_ID, difficulty = DIFFICULTY_LEVELS.BEGINNER) {
  const world = getWorldConfig(worldId) || getWorldConfig(DEFAULT_WORLD_ID);
  const lessonPackId = world?.contentRefs?.lessonContentMap?.[difficulty] || world?.contentRefs?.pilotLessonPackId || null;

  return {
    world,
    worldId: world?.id || DEFAULT_WORLD_ID,
    difficulty,
    lessonPackId,
    sentenceBankId: world?.contentRefs?.sentenceBankId || null,
    qaSetId: world?.contentRefs?.qaSetId || null,
  };
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

export const WORLD_STARTER_CONTENT_TEMPLATES = SELECTABLE_WORLD_CONTENT.flatMap((world) => (
  Object.values(DIFFICULTY_LEVELS).map((difficultyId) => createStarterTemplateManifest({
    section: CONTENT_TEMPLATE_SECTIONS.WORLD,
    worldId: world.id,
    difficultyId,
    lessonPackId: world.content.lessonContentMap?.[difficultyId] || world.content.pilotLessonPackId || null,
    qaSetId: world.content.qaSetId || null,
    sentenceBankId: world.content.sentenceBankId || null,
    assetIds: {
      coverAssetId: world.visuals.coverAssetId || null,
      backgroundAssetId: world.visuals.backgroundAssetId || null,
      rewardVisualThemeId: world.visuals.rewardVisualThemeId || null,
    },
    animationHooks: world.expansion?.animationHooks || [],
    notes: `Register ${world.id} ${difficultyId} content here before swapping in final lesson/game data.`,
  }))
));

export function getWorldStarterTemplate(worldId = DEFAULT_WORLD_ID, difficultyId = DIFFICULTY_LEVELS.BEGINNER) {
  return WORLD_STARTER_CONTENT_TEMPLATES.find((template) => template.worldId === worldId && template.difficultyId === difficultyId) || null;
}

export function getWorldContentInsertionGuide() {
  return {
    ownership: {
      file: "worlds.js",
      manages: [
        "world metadata",
        "difficulty-to-lesson pack ids",
        "default QA/sentence bank ids",
        "world-level visual/audio references",
        "shared board layout ownership for worlds still reusing World 1 board tiles",
      ],
    },
    recommendedFirstTarget: {
      worldId: WORLD_IDS.WORLD_1,
      difficultyId: DIFFICULTY_LEVELS.BEGINNER,
      chapterId: CHAPTER_IDS.CH2,
    },
    starterTemplates: WORLD_STARTER_CONTENT_TEMPLATES.map((template) => ({ ...template })),
    example: cloneInsertionExample(WORLD_CONTENT_INSERTION_EXAMPLE),
    notes: [
      `Worlds that still reuse the shared board path should keep board.configId = ${SHARED_BOARD_LAYOUT_WORLD_ID} until their own board layout is introduced.`,
      "If a world only needs new copy/assets/content ids, do not change render modules or board flow.",
    ],
  };
}
