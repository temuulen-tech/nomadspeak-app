/**
 * qa-game.js
 * Question-answer game constants and mode-specific helper functions.
 */

import { ASSETS } from "./assets.js";
import { DIFFICULTY_LEVELS } from "./constants.js";

export const QA_REWARD_STEPS = [
  { icon: "🏳️", label: "Эхлэл амжилттай!", seconds: 20 * 60, image: ASSETS.rewardIcons.flag, alt: "Асуулт-хариултын шагнал туг" },
  { icon: "⭐", label: "Улаан одын Эзэн", seconds: 30 * 60, image: ASSETS.rewardIcons.star, alt: "Асуулт-хариултын шагнал од" },
  { icon: "🪙", label: "Алтан зоос Чинийх", seconds: 50 * 60, image: ASSETS.rewardIcons.coin, alt: "Асуулт-хариултын шагнал зоос" },
  { icon: "🏆", label: "Алтан цомын Эзэн", seconds: 60 * 60, image: ASSETS.rewardIcons.trophy, alt: "Асуулт-хариултын шагнал цом" },
  { icon: "💎", label: "Алмөөз эрдэнэ Чинийх", seconds: 90 * 60, image: ASSETS.rewardIcons.diamond, alt: "Асуулт-хариултын шагнал эрдэнэ" },
];

export const QA_WORD_BANK_BASE = ["I","China","from","?","arrived","Where","to","yesterday","did","you","are","come","Mongolia","from","I","When","in","you","am","China","?"];

export const QA_ROUNDS = [
  { id: "A", mnQuestion: "Чи хаанаас ирсэн бэ ?", mnAnswer: "Би Монголоос ирсэн.", enQuestion: "Where are you from ?", enAnswer: "I am from Mongolia ." },
  { id: "B", mnQuestion: "Чи хэзээ ирсэн бэ ?", mnAnswer: "Би өчигдөр Хятадад ирсэн.", enQuestion: "When did you come to China ?", enAnswer: "I arrived in China yesterday ." },
];

export function qaShuffle(array) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export function formatQaBuiltLine(tokens) {
  return tokens.join(" ").replace(/\s+([?.])/g, "$1");
}

export function qaLevelLabel(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.BEGINNER ? "Анхан шат" : levelKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд шат" : "Дээд түвшин";
}

export function qaRoundPoolForLevel(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.BEGINNER ? [QA_ROUNDS[0]] : levelKey === DIFFICULTY_LEVELS.INTERMEDIATE ? [QA_ROUNDS[1]] : [...QA_ROUNDS];
}
