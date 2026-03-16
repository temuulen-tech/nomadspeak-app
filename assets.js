/**
 * Centralized visual asset registry for NomadSpeak.
 * Keep image/icon/cover/background paths here so screen modules can reference one source of truth.
 */

export const ASSETS = {
  chapterCovers: {
    columbusNewWorld: "assets/worlds/sailors/intro/game-cover-columbus-new-world-portrait.png",
  },
  rewardIcons: {
    flag: "assets/rewards/reward-flag.png",
    star: "assets/rewards/reward-star.png",
    coin: "assets/rewards/reward-coin.png",
    trophy: "assets/rewards/reward-trophy.png",
    diamond: "assets/rewards/reward-diamond.png",
  },
  worldBackgrounds: {
    sailorsDeck: "assets/worlds/sailors/ship-deck.png",
  },
  characterImages: {
    hero: "assets/hero.png",
  },
  appIcons: {
    icon192: "assets/icons/icon-192.svg",
    icon512: "assets/icons/icon-512.svg",
  },
};

export const REWARD_ICON_SEQUENCE = [
  ASSETS.rewardIcons.flag,
  ASSETS.rewardIcons.star,
  ASSETS.rewardIcons.coin,
  ASSETS.rewardIcons.trophy,
  ASSETS.rewardIcons.diamond,
];
