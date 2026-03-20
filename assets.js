/**
 * Centralized visual asset registry for NomadSpeak.
 * Keep image/icon/cover/background/audio paths here so screen modules can reference one source of truth.
 */

const rewardIconEntries = [
  { id: "flag", path: "assets/rewards/reward-flag.png", alt: "Шагнал туг" },
  { id: "star", path: "assets/rewards/reward-star.png", alt: "Шагнал од" },
  { id: "coin", path: "assets/rewards/reward-coin.png", alt: "Шагнал зоос" },
  { id: "trophy", path: "assets/rewards/reward-trophy.png", alt: "Шагнал цом" },
  { id: "diamond", path: "assets/rewards/reward-diamond.png", alt: "Шагнал эрдэнэ" },
];

export const ASSETS = {
  chapterCovers: {
    columbusNewWorld: "assets/worlds/sailors/intro/game-cover-columbus-new-world-portrait.png",
  },
  rewardIcons: rewardIconEntries.reduce((acc, entry) => ({
    ...acc,
    [entry.id]: entry.path,
  }), {}),
  rewardIconEntries,
  worldBackgrounds: {
    sailorsDeck: "assets/worlds/sailors/ship-deck.png",
  },
  audioTracks: {
    seaSailorsWorld: "assets/audio/sea-sailors-world.mp3",
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
