/**
 * asset-registry.js
 * Lightweight developer-facing asset map for NomadSpeak.
 *
 * Purpose:
 * - Keep one readable registry for image/audio/animation references.
 * - Document where assets are currently used before a larger runtime migration.
 * - Highlight duplicated or hardcoded paths that should be unified later.
 *
 * Runtime policy for this file:
 * - Safe/source-of-truth metadata only in this step.
 * - Do not import this file into UI flows until each category is migrated intentionally.
 */

const ASSET_STATUS = {
  USED: "used",
  PLANNED: "planned",
  DUPLICATED: "duplicated",
  PLACEHOLDER: "placeholder",
};

function createAssetEntry({
  key,
  path = null,
  currentUsage = [],
  notes = "",
  status = ASSET_STATUS.PLANNED,
  duplicateGroup = null,
} = {}) {
  return {
    key,
    path,
    currentUsage,
    notes,
    status,
    duplicateGroup,
  };
}

export const APP_ASSET_REGISTRY = {
  meta: {
    ownerFile: "assets.js",
    purpose: "Developer-facing source map for visual/audio/animation assets before deeper runtime consolidation.",
    migrationPolicy: [
      "Register new runtime-facing asset ids in assets.js first.",
      "Use this file to track categories, usage, duplication, and future cleanup priorities.",
      "Prefer replacing raw path usage with stable asset ids in follow-up steps.",
    ],
  },
  categories: {
    icons: [
      createAssetEntry({
        key: "app-icon-192",
        path: "assets/icons/icon-192.svg",
        currentUsage: ["assets.js -> ASSETS.appIcons.icon192", "index.html favicon/apple-touch-icon", "manifest.json", "service-worker.js precache"],
        notes: "Already reused across app shell files; good candidate for later shell metadata normalization.",
        status: ASSET_STATUS.USED,
        duplicateGroup: "app-shell-icons",
      }),
      createAssetEntry({
        key: "app-icon-512",
        path: "assets/icons/icon-512.svg",
        currentUsage: ["assets.js -> ASSETS.appIcons.icon512", "manifest.json", "service-worker.js precache"],
        notes: "Stable install icon. Keep in registry before any PWA icon expansion.",
        status: ASSET_STATUS.USED,
        duplicateGroup: "app-shell-icons",
      }),
    ],
    sounds: [
      createAssetEntry({
        key: "sea-sailors-world",
        path: "assets/audio/sea-sailors-world.mp3",
        currentUsage: ["assets.js -> audioTrackEntries", "worlds.js -> world1 audio track"],
        notes: "Primary world ambience track currently wired through assets.js and worlds.js.",
        status: ASSET_STATUS.USED,
      }),
      createAssetEntry({
        key: "shared-background-track-placeholder",
        path: "assets/audio/background.mp3",
        currentUsage: ["assets/audio/README.md local testing example only"],
        notes: "Documented example path, not currently registered in runtime.",
        status: ASSET_STATUS.PLANNED,
        duplicateGroup: "audio-placeholder-paths",
      }),
    ],
    rewardArt: [
      createAssetEntry({
        key: "reward-flag",
        path: "assets/rewards/icons/reward-flag.png",
        currentUsage: ["assets.js rewardIconEntries", "index.html lesson reward bar", "index.html sentences reward strip", "progress-ui.js stats reward cards", "service-worker.js precache"],
        notes: "Repeated as raw HTML image path in multiple places; highest-value reward art normalization target.",
        status: ASSET_STATUS.DUPLICATED,
        duplicateGroup: "reward-icons",
      }),
      createAssetEntry({
        key: "reward-star",
        path: "assets/rewards/icons/reward-star.png",
        currentUsage: ["assets.js rewardIconEntries", "index.html lesson reward bar", "index.html sentences reward strip", "progress-ui.js stats reward cards", "service-worker.js precache"],
        notes: "Shares the same duplication pattern as the rest of reward icons.",
        status: ASSET_STATUS.DUPLICATED,
        duplicateGroup: "reward-icons",
      }),
      createAssetEntry({
        key: "reward-coin",
        path: "assets/rewards/icons/reward-coin.png",
        currentUsage: ["assets.js rewardIconEntries", "index.html lesson reward bar", "index.html sentences reward strip", "progress-ui.js stats reward cards", "service-worker.js precache"],
        notes: "Also used by stats card rendering through ASSETS.rewardIcons.coin.",
        status: ASSET_STATUS.DUPLICATED,
        duplicateGroup: "reward-icons",
      }),
      createAssetEntry({
        key: "reward-trophy",
        path: "assets/rewards/icons/reward-trophy.png",
        currentUsage: ["assets.js rewardIconEntries", "index.html lesson reward bar", "index.html sentences reward strip", "progress-ui.js stats reward cards", "service-worker.js precache"],
        notes: "Future reward rendering should hydrate from one shared reward config only.",
        status: ASSET_STATUS.DUPLICATED,
        duplicateGroup: "reward-icons",
      }),
      createAssetEntry({
        key: "reward-diamond",
        path: "assets/rewards/icons/reward-diamond.png",
        currentUsage: ["assets.js rewardIconEntries", "index.html lesson reward bar", "index.html sentences reward strip", "progress-ui.js stats reward cards", "service-worker.js precache"],
        notes: "Highest-tier reward image. Same duplicated path pattern as the other reward icons.",
        status: ASSET_STATUS.DUPLICATED,
        duplicateGroup: "reward-icons",
      }),
    ],
    chapterWorldArt: [
      createAssetEntry({
        key: "world1-cover",
        path: "assets/visuals/worlds/sailors/intro/world-cover-sailors-columbus-new-world-placeholder.svg",
        currentUsage: ["assets.js worldVisualEntries", "index.html board/chapter cover preview fallback"],
        notes: "World cover is registered in assets.js but still appears as a hardcoded preview path in index.html.",
        status: ASSET_STATUS.DUPLICATED,
        duplicateGroup: "world-cover-placeholders",
      }),
      createAssetEntry({
        key: "world2-cover-placeholder",
        path: "assets/visuals/worlds/sailors/intro/world-cover-sailors-columbus-new-world-placeholder.svg",
        currentUsage: ["assets.js worldVisualEntries"],
        notes: "Shares world1 placeholder art while future world art is pending.",
        status: ASSET_STATUS.PLACEHOLDER,
        duplicateGroup: "world-cover-placeholders",
      }),
      createAssetEntry({
        key: "world3-cover-placeholder",
        path: "assets/visuals/worlds/sailors/intro/world-cover-sailors-columbus-new-world-placeholder.svg",
        currentUsage: ["assets.js worldVisualEntries"],
        notes: "Shares world1 placeholder art while future world art is pending.",
        status: ASSET_STATUS.PLACEHOLDER,
        duplicateGroup: "world-cover-placeholders",
      }),
      createAssetEntry({
        key: "world1-ch2-cover",
        path: "assets/visuals/worlds/world-1/chapter-covers/world-cover-world-1-chapter-2-placeholder.svg",
        currentUsage: ["assets.js worldVisualEntries", "chapters.js chapter art lookup through assets.js"],
        notes: "Already routed through assets.js asset ids; this is the preferred pattern for future chapter covers.",
        status: ASSET_STATUS.USED,
      }),
    ],
    characterArt: [
      createAssetEntry({
        key: "hero-main",
        path: "assets/characters/hero-main.png",
        currentUsage: ["assets.js -> ASSETS.characterImages.hero", "service-worker.js precache"],
        notes: "Single registry reference today; keep character art expansions grouped here before screen-specific use grows.",
        status: ASSET_STATUS.USED,
      }),
    ],
    backgrounds: [
      createAssetEntry({
        key: "sailors-deck",
        path: "assets/visuals/worlds/sailors/backgrounds/world-bg-sailors-ship-deck-placeholder.svg",
        currentUsage: ["assets.js worldBackgroundEntries", "board-screen.css fallback background image", "board-screen.js runtime CSS variable"],
        notes: "Background is partly centralized already, but CSS still contains a raw fallback path.",
        status: ASSET_STATUS.DUPLICATED,
        duplicateGroup: "world-background-placeholders",
      }),
      createAssetEntry({
        key: "shared-world-background-placeholder",
        path: "assets/visuals/worlds/sailors/backgrounds/world-bg-sailors-ship-deck-placeholder.svg",
        currentUsage: ["assets.js worldBackgroundEntries"],
        notes: "Shared placeholder reused for worlds without dedicated art yet.",
        status: ASSET_STATUS.PLACEHOLDER,
        duplicateGroup: "world-background-placeholders",
      }),
      createAssetEntry({
        key: "world1-ch2-background",
        path: "assets/visuals/worlds/world-1/backgrounds/world-bg-world-1-chapter-2-placeholder.svg",
        currentUsage: ["assets.js worldBackgroundEntries", "chapters.js chapter art lookup through assets.js"],
        notes: "Preferred world/chapter background registration pattern for future additions.",
        status: ASSET_STATUS.USED,
      }),
    ],
    animationRefs: [
      createAssetEntry({
        key: "world-intro-hook",
        path: "assets/animations/",
        currentUsage: ["assets.js -> FUTURE_VISUAL_LIBRARY.animationHooks"],
        notes: "Animation hook id exists, but no concrete animation asset file is attached yet.",
        status: ASSET_STATUS.PLANNED,
      }),
      createAssetEntry({
        key: "chapter-reveal-hook",
        path: "assets/animations/",
        currentUsage: ["assets.js -> FUTURE_VISUAL_LIBRARY.animationHooks", "chapters.js animation hook metadata access"],
        notes: "Keep future reveal config linked through hook id instead of adding ad-hoc screen imports.",
        status: ASSET_STATUS.PLANNED,
      }),
      createAssetEntry({
        key: "lesson-success-hook",
        path: "assets/animations/",
        currentUsage: ["assets.js -> FUTURE_VISUAL_LIBRARY.animationHooks"],
        notes: "Reserved for later reward animation work.",
        status: ASSET_STATUS.PLANNED,
      }),
      createAssetEntry({
        key: "qa-reward-hook",
        path: "assets/animations/",
        currentUsage: ["assets.js -> FUTURE_VISUAL_LIBRARY.animationHooks", "qa-game.js hook import dependency"],
        notes: "Important to keep distinct from reward image normalization.",
        status: ASSET_STATUS.PLANNED,
      }),
      createAssetEntry({
        key: "sentence-success-hook",
        path: "assets/animations/",
        currentUsage: ["assets.js -> FUTURE_VISUAL_LIBRARY.animationHooks"],
        notes: "Gameplay-specific hook placeholder.",
        status: ASSET_STATUS.PLANNED,
      }),
      createAssetEntry({
        key: "world-reward-hook",
        path: "assets/animations/",
        currentUsage: ["assets.js -> FUTURE_VISUAL_LIBRARY.animationHooks"],
        notes: "Reserved for future world reward sequences.",
        status: ASSET_STATUS.PLANNED,
      }),
    ],
    hardcodedReferences: [
      createAssetEntry({
        key: "index-html-reward-icons",
        path: "assets/rewards/icons/*.png",
        currentUsage: ["index.html lesson reward markup", "index.html sentences reward markup"],
        notes: "Safe to leave today, but the highest-risk hardcoded image path cluster.",
        status: ASSET_STATUS.DUPLICATED,
      }),
      createAssetEntry({
        key: "index-html-board-cover-preview",
        path: "assets/visuals/worlds/sailors/intro/world-cover-sailors-columbus-new-world-placeholder.svg",
        currentUsage: ["index.html board/chapter cover preview"],
        notes: "Should eventually hydrate from assets.js or a small preview adapter.",
        status: ASSET_STATUS.DUPLICATED,
      }),
      createAssetEntry({
        key: "board-screen-css-background-fallback",
        path: "assets/visuals/worlds/sailors/backgrounds/world-bg-sailors-ship-deck-placeholder.svg",
        currentUsage: ["board-screen.css fallback var value"],
        notes: "CSS fallback is safe, but it bypasses the main asset registry.",
        status: ASSET_STATUS.DUPLICATED,
      }),
      createAssetEntry({
        key: "service-worker-precache-assets",
        path: "service-worker.js asset list",
        currentUsage: ["service-worker.js"],
        notes: "Precache list mirrors registry paths manually; keep synced when real art/assets arrive.",
        status: ASSET_STATUS.DUPLICATED,
      }),
    ],
  },
  highestRiskScatteredAreas: [
    {
      area: "Reward images",
      reason: "Same reward icon paths are registered in assets.js but also hardcoded in index.html and mirrored in service-worker.js.",
      firstUnificationStep: "Move reward image hydration fully behind assets.js/reward config so HTML only declares slots.",
      priority: 1,
    },
    {
      area: "Repeated app/icon references",
      reason: "App icon paths are repeated across assets.js, index.html, manifest.json, and service-worker.js.",
      firstUnificationStep: "Introduce a shell metadata helper or build-time manifest sync only after reward art cleanup.",
      priority: 2,
    },
    {
      area: "Chapter/world cover and background art",
      reason: "Most art is registered in assets.js, but raw fallback paths still live in index.html and board-screen.css.",
      firstUnificationStep: "Route the remaining static preview/fallback paths through tiny adapters that read stable asset ids.",
      priority: 3,
    },
    {
      area: "Audio asset references",
      reason: "Current runtime audio is centralized better than visuals, but README/example paths and world mapping can drift as more tracks arrive.",
      firstUnificationStep: "Expand audio registry fields first before adding more world/chapter sounds.",
      priority: 4,
    },
  ],
  recommendedNextUnification: {
    category: "rewardArt",
    reason: "Reward art has the clearest repeated raw paths across runtime, static HTML, stats rendering, and precache lists while still being low-risk to centralize behind one config.",
  },
};

export { ASSET_STATUS };
