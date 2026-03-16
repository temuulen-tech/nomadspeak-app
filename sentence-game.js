/**
 * sentence-game.js
 * Sentence-building game specific constants and string helpers.
 */

export const SENTENCE_GAME_DIFFICULTY_LABELS = {
  beginner: "Анхан шат",
  intermediate: "Дунд шат",
  advanced: "Дээд түвшин",
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
