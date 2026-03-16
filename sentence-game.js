/**
 * sentence-game.js
 * Sentence-building game specific constants and string helpers.
 */

import { DIFFICULTY_LEVELS } from "./constants.js";

export const SENTENCE_GAME_DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.BEGINNER]: "Анхан шат",
  [DIFFICULTY_LEVELS.INTERMEDIATE]: "Дунд шат",
  [DIFFICULTY_LEVELS.ADVANCED]: "Дээд түвшин",
};

export function tokenizeSentence(sentence = "") {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

export function normalizeSentence(str = "") {
  return str
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSentenceGameToken(token = "") {
  return token.replace(/\s+/g, " ").trim();
}
