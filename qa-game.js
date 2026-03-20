/**
 * qa-game.js
 * Question-answer game constants and mode-specific helper functions.
 */

import { getRewardAssetByLevel } from "./assets.js";
import {
  CONTENT_COLLECTIONS,
  DIFFICULTY_LEVELS,
  FUTURE_CONTENT_SLOTS,
  PLACEHOLDER_STATES,
  createPlaceholderMeta,
} from "./constants.js";

export const QA_REWARD_STEPS = [
  { icon: "🏳️", label: "Эхлэл амжилттай!", seconds: 20 * 60, ...getRewardAssetByLevel(1), alt: "Асуулт-хариултын шагнал туг" },
  { icon: "⭐", label: "Улаан одын Эзэн", seconds: 30 * 60, ...getRewardAssetByLevel(2), alt: "Асуулт-хариултын шагнал од" },
  { icon: "🪙", label: "Алтан зоос Чинийх", seconds: 50 * 60, ...getRewardAssetByLevel(3), alt: "Асуулт-хариултын шагнал зоос" },
  { icon: "🏆", label: "Алтан цомын Эзэн", seconds: 60 * 60, ...getRewardAssetByLevel(4), alt: "Асуулт-хариултын шагнал цом" },
  { icon: "💎", label: "Алмөөз эрдэнэ Чинийх", seconds: 90 * 60, ...getRewardAssetByLevel(5), alt: "Асуулт-хариултын шагнал эрдэнэ" },
];

const QA_CONTENT_SETS = [
  {
    id: "qa-set-shared-core",
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.READY,
    rounds: [
      {
        id: "A",
        mnQuestion: "Чи хаанаас ирсэн бэ ?",
        mnAnswer: "Би Монголоос ирсэн.",
        enQuestion: "Where are you from ?",
        enAnswer: "I am from Mongolia .",
        wordBankTokens: ["I", "China", "from", "?", "arrived", "Where", "to", "yesterday", "did", "you", "are", "come", "Mongolia", "from", "I", "When", "in", "you", "am", "China", "?"],
      },
      {
        id: "B",
        mnQuestion: "Чи хэзээ ирсэн бэ ?",
        mnAnswer: "Би өчигдөр Хятадад ирсэн.",
        enQuestion: "When did you come to China ?",
        enAnswer: "I arrived in China yesterday .",
        wordBankTokens: ["I", "China", "from", "?", "arrived", "Where", "to", "yesterday", "did", "you", "are", "come", "Mongolia", "from", "I", "When", "in", "you", "am", "China", "?"],
      },
    ],
    expansion: {
      qaSet: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.QA_SETS,
        slot: FUTURE_CONTENT_SLOTS.QA_SET,
        id: "qa-set-shared-core",
        state: PLACEHOLDER_STATES.READY,
      }),
      wordBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.WORD_BANKS,
        slot: FUTURE_CONTENT_SLOTS.WORD_BANK,
        id: "qa-word-bank-shared-core",
        state: PLACEHOLDER_STATES.READY,
      }),
    },
  },
  {
    id: "qa-set-world2-placeholder",
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    rounds: [],
    expansion: {
      qaSet: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.QA_SETS,
        slot: FUTURE_CONTENT_SLOTS.QA_SET,
        id: "qa-set-world2-placeholder",
        notes: "Insert Silk Road QA rounds here later.",
      }),
    },
  },
  {
    id: "qa-set-world3-placeholder",
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    rounds: [],
    expansion: {
      qaSet: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.QA_SETS,
        slot: FUTURE_CONTENT_SLOTS.QA_SET,
        id: "qa-set-world3-placeholder",
        notes: "Insert Roman world QA rounds here later.",
      }),
    },
  },
];

const sharedCoreRounds = QA_CONTENT_SETS[0].rounds;

export const QA_ROUNDS = sharedCoreRounds;

export const QA_WORD_BANK_BASE = QA_ROUNDS[0].wordBankTokens;

export function getQaContentSet(setId = "qa-set-shared-core") {
  return QA_CONTENT_SETS.find((set) => set.id === setId) || QA_CONTENT_SETS[0] || null;
}

export function getQaWordBankTokens(round = QA_ROUNDS[0]) {
  return Array.isArray(round?.wordBankTokens) && round.wordBankTokens.length
    ? round.wordBankTokens.slice()
    : QA_WORD_BANK_BASE.slice();
}

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

export const QA_LONG_EXPLANATION_TEXT = "Энэ тоглоом нь асуулт, хариултын бүтэц дээр төвлөрч, англи өгүүлбэрийг зөв дарааллаар бодож бүтээх дадлыг хөгжүүлнэ. Та эхлээд ангиллаа сонгоод тоглоомоо эхлүүлнэ. Асуултын мөрийг зөв бүтээсний дараа л хариултын мөр нээгдэнэ. Ингэснээр та асуулт-хариултын логик дарааллыг бодитоор сурна. Үгийн сангийн chip-үүд дээр дарж мөр рүү оруулна, буцаахдаа мөр дээрх chip дээр дахин дарна. Зөв хариулт гарвал дараагийн тойрог руу шилжиж, хугацааны дагуу шагналууд нээгдэнэ. Хэрэв та төөрвөл англи асуулт, хариултыг харах товчоор түр харж болно. Тогтмол тоглосноор өгүүлбэр бүтээх хурд, хэлний мэдрэмж эрс сайжирна.";

export function qaRoundPoolForLevel(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.BEGINNER ? [QA_ROUNDS[0]] : [QA_ROUNDS[0], QA_ROUNDS[1]];
}

export function getQaExpansionManifest() {
  return QA_CONTENT_SETS.map((set) => ({
    id: set.id,
    difficulty: set.difficulty,
    state: set.state,
    roundCount: set.rounds.length,
    expansion: set.expansion,
  }));
}
