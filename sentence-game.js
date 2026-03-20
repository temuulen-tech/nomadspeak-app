/**
 * sentence-game.js
 * Sentence-building game specific constants, content loading helpers, and string helpers.
 *
 * Real content insertion ownership:
 * - Register sentence bank ids and their data source here.
 * - Keep runtime loading flow stable by pointing each bank at the same JSON/data contract unless a later migration is intentional.
 * - When a chapter gets its own sentence bank, add the bank here and reference its id from chapters.js and/or worlds.js.
 */

import {
  CONTENT_COLLECTIONS,
  CONTENT_TEMPLATE_SECTIONS,
  DIFFICULTY_LEVELS,
  FUTURE_CONTENT_SLOTS,
  PLACEHOLDER_STATES,
  WORLD_IDS,
  cloneInsertionExample,
  createPlaceholderMeta,
  createStarterTemplateManifest,
} from "./constants.js";

export const SENTENCE_GAME_DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.BEGINNER]: "Анхан шат",
  [DIFFICULTY_LEVELS.INTERMEDIATE]: "Дунд шат",
  [DIFFICULTY_LEVELS.ADVANCED]: "Дээд түвшин",
};

export const SENTENCE_GAME_DATA_PATH = "data/sentences.json";

export const SENTENCE_CONTENT_INSERTION_EXAMPLE = {
  id: "sentence-bank-world1-ch2-core",
  worldId: WORLD_IDS.WORLD_1,
  difficulty: DIFFICULTY_LEVELS.BEGINNER,
  state: PLACEHOLDER_STATES.READY,
  dataPath: SENTENCE_GAME_DATA_PATH,
  expansion: {
    sentenceBank: createPlaceholderMeta({
      collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
      slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
      id: "sentence-bank-world1-ch2-core",
      state: PLACEHOLDER_STATES.READY,
      notes: "Point this id at Chapter 2 sentence rows in the shared JSON dataset.",
    }),
  },
};

export const SENTENCE_CONTENT_BANKS = [
  {
    id: "sentence-bank-shared-default",
    worldId: WORLD_IDS.WORLD_1,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.READY,
    dataPath: SENTENCE_GAME_DATA_PATH,
    expansion: {
      sentenceBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
        slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
        id: "sentence-bank-shared-default",
        state: PLACEHOLDER_STATES.READY,
      }),
    },
  },
  {
    id: "sentence-bank-world1-ch2-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    dataPath: SENTENCE_GAME_DATA_PATH,
    expansion: {
      sentenceBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
        slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
        id: "sentence-bank-world1-ch2-placeholder",
        notes: "Insert Chapter 2 sentence data later, keeping the same JSON loading flow.",
      }),
    },
  },
  {
    id: "sentence-bank-world1-ch3-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    dataPath: SENTENCE_GAME_DATA_PATH,
    expansion: {
      sentenceBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
        slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
        id: "sentence-bank-world1-ch3-placeholder",
        notes: "Insert Chapter 3 sentence data later, keeping the same JSON loading flow.",
      }),
    },
  },
  {
    id: "sentence-bank-world1-ch4-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    dataPath: SENTENCE_GAME_DATA_PATH,
    expansion: {
      sentenceBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
        slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
        id: "sentence-bank-world1-ch4-placeholder",
        notes: "Insert Chapter 4 sentence data later, keeping the same JSON loading flow.",
      }),
    },
  },
  {
    id: "sentence-bank-world2-placeholder",
    worldId: WORLD_IDS.WORLD_2,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    dataPath: SENTENCE_GAME_DATA_PATH,
    expansion: {
      sentenceBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
        slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
        id: "sentence-bank-world2-placeholder",
        notes: "Insert World 2 sentence data later.",
      }),
    },
  },
  {
    id: "sentence-bank-world3-placeholder",
    worldId: WORLD_IDS.WORLD_3,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    dataPath: SENTENCE_GAME_DATA_PATH,
    expansion: {
      sentenceBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
        slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
        id: "sentence-bank-world3-placeholder",
        notes: "Insert World 3 sentence data later.",
      }),
    },
  },
];

export function tokenizeSentence(sentence = "") {
  const tokens = sentence.match(/[A-Za-z0-9']+|[^\sA-Za-z0-9']/g);
  return tokens ? tokens.filter(Boolean) : [];
}

export function prepareSentenceItems(items = []) {
  return items.map((item) => ({ ...item, tokens: tokenizeSentence(item.en) }));
}

export const SENTENCE_STARTER_TEMPLATES = SENTENCE_CONTENT_BANKS.map((bank) => createStarterTemplateManifest({
  section: CONTENT_TEMPLATE_SECTIONS.SENTENCE,
  worldId: bank.worldId,
  difficultyId: bank.difficulty,
  sentenceBankId: bank.id,
  notes: bank.expansion?.sentenceBank?.notes || "Insert sentence rows in the shared dataset for this bank id.",
}));

export const SENTENCE_CONTENT_BANK_INDEX = SENTENCE_CONTENT_BANKS.reduce((acc, bank) => ({ ...acc, [bank.id]: bank }), {});

export function getSentenceContentBank(bankId = "sentence-bank-shared-default") {
  return SENTENCE_CONTENT_BANK_INDEX[bankId] || SENTENCE_CONTENT_BANKS[0] || null;
}

export function resolveSentenceContentBank({ bankId = null, worldId = null, difficulty = DIFFICULTY_LEVELS.BEGINNER } = {}) {
  if (bankId) return getSentenceContentBank(bankId);
  return SENTENCE_CONTENT_BANKS.find((bank) => (
    (!worldId || bank.worldId === worldId)
    && bank.difficulty === difficulty
    && bank.state === PLACEHOLDER_STATES.READY
  )) || SENTENCE_CONTENT_BANKS.find((bank) => (!worldId || bank.worldId === worldId) && bank.difficulty === difficulty) || SENTENCE_CONTENT_BANKS[0] || null;
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

export function getSentenceContentInsertionGuide() {
  return {
    ownership: {
      file: "sentence-game.js",
      manages: [
        "sentence bank registrations",
        "bank-to-data path mapping",
        "difficulty-specific sentence bank routing",
      ],
    },
    starterTemplates: SENTENCE_STARTER_TEMPLATES.map((template) => ({ ...template })),
    example: cloneInsertionExample(SENTENCE_CONTENT_INSERTION_EXAMPLE),
  };
}
