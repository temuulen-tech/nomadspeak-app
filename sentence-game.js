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
  const tokens = sentence.match(/[A-Za-z0-9']+|[^\sA-Za-z0-9']/g);
  return tokens ? tokens.filter(Boolean) : [];
}

export const SENTENCE_GAME_TOAST_DURATION = 8000;
export const SENTENCE_GAME_TOAST_SPEECH_END_BUFFER = 800;
export const SENTENCE_GAME_TOAST_SPEECH_DELAY = 350;
export const SENTENCE_GAME_TOAST_MAX_DURATION = 12000;
export const SENTENCE_GAME_SUCCESS_TOAST_LOCK_MS = 1000;

export const SENTENCE_GAME_CORRECT_TOAST = "Чи уулын оргилд гарлаа.";
export const SENTENCE_GAME_INCORRECT_TOAST = "Өөө.. Гэхдээ зүгээрээ, Андаа.";
export const SENTENCE_GAME_SHOW_CORRECT_TOAST = "Өөө.. Яагаад бэлэнчлээд байна аа, Андаа.";
export const SENTENCE_GAME_DEBUG = false;
export const SENTENCE_GAME_IDLE_TIMEOUT_SECONDS = 60;
export const SENTENCE_GAME_REWARD_THRESHOLDS = [1200, 1800, 3000, 3600, 5400];
export const SENTENCE_GAME_REWARD_BANNERS = [
  "Эхлэл амжилттай!",
  "Улаан одын Эзэн",
  "Алтан зоос Чинийх",
  "Алтан цомын Эзэн",
  "Алмөөз эрдэнэ Чинийх",
];
export const SENTENCE_GAME_CLIMB_POSITIONS = [
  { x: 14, y: 102 },
  { x: 62, y: 88 },
  { x: 138, y: 72 },
  { x: 208, y: 57 },
  { x: 286, y: 38 },
  { x: 362, y: 20 },
];

export const SENTENCE_GAME_TIP_TEXT = "ТАЙЛБАР: Найзаа, чи тоглох явцдаа зөвхөн оноо авах, хөгжилдөхдөө  бус Өгүүлбэрийн бүтэцийг, үгс өнгөрсөн,одоо, ирээдүй цагуудад хэрхэн өөрчлөгдөж байгааг сайн ажиглаарай. Энэ нь, чиний өгүүлбэр зохиож ярьж сурахд тус болно шүү. Анхандаа маш богино энгийн асуулт, хариултууд бүтээж өөрөөсөө асууж өөртөө хариулаарай-ярилцах хүнтэй бол бүр сайн маш багаас л, эхлээрэй. Хэт их дүрэм уншиж сурах урам зоригоо бүү унтраа маш багаар хүнтэй ойлголцож эхлэх нь, урам өгч суралцах хүсэл бадараадаг. Тоглоом нь, чамайг ядаргаатай дүрэмүүдээс ангид өгүүлбэр зохиож, ярьж сургахад гол зорилго нь, байгаа шдэ… Мундагууд тийм төрдөггүй тэд өөрсдийгөө бүтээдэг шдэ. Чи ч, бас бүтээгээрэй.";

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
