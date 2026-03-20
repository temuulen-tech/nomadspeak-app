import {
  CHAPTER_IDS,
  CONTENT_COLLECTIONS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_LEVEL_LIST,
  FUTURE_CONTENT_SLOTS,
  PLACEHOLDER_STATES,
  WORLD_IDS,
  createPlaceholderMeta,
} from "./constants.js";

/**
 * lesson.js
 * Lesson content and core lesson helpers (question bank, labels, options).
 */

const BEGINNER_PACK_ENTRIES = [
  { q: "Where is the ship going?", qMn: "Усан онгоц хаашаа явж байна вэ?", a: "The ship is going west.", aMn: "Усан онгоц баруун зүг рүү явж байна." },
  { q: "Who is on the deck?", qMn: "Тавцан дээр хэн байна вэ?", a: "The sailors are on the deck.", aMn: "Далайчид тавцан дээр байна." },
  { q: "What do the sailors see?", qMn: "Далайчид юу харж байна вэ?", a: "They see land ahead.", aMn: "Тэд урд талд газар харж байна." },
  { q: "Are the waves strong today?", qMn: "Өнөөдөр давалгаа хүчтэй байна уу?", a: "Yes, the waves are strong today.", aMn: "Тийм ээ, өнөөдөр давалгаа хүчтэй байна." },
  { q: "What is the captain holding?", qMn: "Ахмад юу барьж байна вэ?", a: "The captain is holding a map.", aMn: "Ахмад газрын зураг барьж байна." },
  { q: "Are the travelers tired?", qMn: "Аялагчид ядарсан уу?", a: "Yes, they are tired after the voyage.", aMn: "Тийм ээ, тэд аяллын дараа ядарсан байна." },
  { q: "What do they need now?", qMn: "Тэдэнд одоо юу хэрэгтэй вэ?", a: "They need fresh water now.", aMn: "Тэдэнд одоо цэвэр ус хэрэгтэй." },
  { q: "Is the new shore quiet?", qMn: "Шинэ эрэг нам гүм байна уу?", a: "No, the new shore is full of birds.", aMn: "Үгүй ээ, шинэ эрэг шувуудаар дүүрэн байна." },
];

const INTERMEDIATE_FALLBACK_ENTRIES = [
  { q: "When were you born?", qMn: "Та хэзээ төрсөн бэ?", a: "I was born on September 8", aMn: "Би есдүгээр сарын 8-нд төрсөн." },
  { q: "Where were you born?", qMn: "Та хаана төрсөн бэ?", a: "I was born in Ulaanbaatar city", aMn: "Би Улаанбаатар хотод төрсөн." },
  { q: "What do you do in your free time?", qMn: "Та чөлөөт цагаараа юу хийдэг вэ?", a: "I read books in my free time.", aMn: "Би чөлөөт цагаараа ном уншдаг." },
  { q: "What is your dream?", qMn: "Таны мөрөөдөл юу вэ?", a: "I will be a great businessman.", aMn: "Би агуу бизнесмен болно." },
  { q: "What color do you like?", qMn: "Та ямар өнгөнд дуртай вэ?", a: "I like the color red.", aMn: "Би улаан өнгөнд дуртай." },
  { q: "When did you wake up?", qMn: "Та хэзээ сэрсэн бэ?", a: "I woke up at 8 in the morning.", aMn: "Би өглөө 8 цагт сэрсэн." },
  { q: "When did you go to sleep?", qMn: "Та хэзээ унтсан бэ?", a: "I went to bed at 10 o'clock yesterday.", aMn: "Би өчигдөр 10 цагт унтсан." },
  { q: "How old are you?", qMn: "Та хэдэн настай вэ?", a: "I am thirty years old.", aMn: "Би гучин настай." },
];

const ADVANCED_FALLBACK_ENTRIES = [
  { q: "Where was his/her father born?", qMn: "Түүний аав хаана төрсөн бэ?", a: "His father was born in America.", aMn: "Түүний аав Америкт төрсөн." },
  { q: "Where was his/her mother born?", qMn: "Түүний ээж хаана төрсөн бэ?", a: "Her mother was born in France", aMn: "Түүний ээж Францад төрсөн." },
  { q: "How often do you meet him?", qMn: "Та түүнтэй хэр олон уулздаг вэ?", a: "I meet him 3 times a week.", aMn: "Би түүнтэй долоо хоногт 3 удаа уулздаг." },
  { q: "How many books does he have?", qMn: "Түүнд хэдэн ном байдаг вэ?", a: "He has 1000 books.", aMn: "Түүнд 1000 ном бий." },
  { q: "How long will we travel?", qMn: "Бид хэр удаан аялах вэ?", a: "Both will travel for 3 months.", aMn: "Хоёул 3 сарын турш аялна." },
  { q: "Where is their home?", qMn: "Тэдний гэр хаана байдаг вэ?", a: "Their home is in Berlin.", aMn: "Тэдний гэр Берлинд байдаг." },
  { q: "Do you remember her?", qMn: "Та түүнийг санаж байна уу?", a: "I miss her very much.", aMn: "Би түүнийг маш их санаж байна." },
];

function createLessonContentPack({
  id,
  worldId = null,
  chapterId = null,
  difficulty = DIFFICULTY_LEVELS.BEGINNER,
  title,
  description = "",
  entries = [],
  wordBankId = null,
  sentenceBankId = null,
  state = PLACEHOLDER_STATES.READY,
  notes = "",
} = {}) {
  return {
    id,
    worldId,
    chapterId,
    difficulty,
    title,
    description,
    entries,
    expansion: {
      lessonPack: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.LESSON_PACKS,
        slot: FUTURE_CONTENT_SLOTS.LESSON_PACK,
        id,
        state,
        notes,
      }),
      wordBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.WORD_BANKS,
        slot: FUTURE_CONTENT_SLOTS.WORD_BANK,
        id: wordBankId,
        state: wordBankId ? state : PLACEHOLDER_STATES.PLACEHOLDER,
        notes: "Attach lesson-specific word bank data here later.",
      }),
      sentenceBank: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.SENTENCE_BANKS,
        slot: FUTURE_CONTENT_SLOTS.SENTENCE_BANK,
        id: sentenceBankId,
        state: sentenceBankId ? state : PLACEHOLDER_STATES.PLACEHOLDER,
        notes: "Attach related sentence practice content here later.",
      }),
    },
  };
}

export const LESSON_CONTENT_PACKS = [
  createLessonContentPack({
    id: "world1-ch1-beginner-landing-kit",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH1,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    title: "Колумб ба Шинэ тивийнхэн · 1-р бүлгийн анхан багц",
    description: "Далай гатлалт ба анхны буултын сэдэвтэй анхны бодит lesson content pack.",
    entries: BEGINNER_PACK_ENTRIES,
    wordBankId: "word-bank-world1-ch1-core",
    sentenceBankId: "sentence-bank-shared-default",
  }),
  createLessonContentPack({
    id: "world1-ch2-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH2,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    title: "World 1 · Chapter 2 placeholder lesson pack",
    description: "Expansion-ready placeholder pack for future chapter lesson insertion.",
    entries: [],
    wordBankId: "word-bank-world1-ch2-placeholder",
    sentenceBankId: "sentence-bank-world1-ch2-placeholder",
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    notes: "Insert final Chapter 2 lesson entries here later.",
  }),
  createLessonContentPack({
    id: "world1-ch3-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH3,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    title: "World 1 · Chapter 3 placeholder lesson pack",
    description: "Expansion-ready placeholder pack for future chapter lesson insertion.",
    entries: [],
    wordBankId: "word-bank-world1-ch3-placeholder",
    sentenceBankId: "sentence-bank-world1-ch3-placeholder",
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    notes: "Insert final Chapter 3 lesson entries here later.",
  }),
  createLessonContentPack({
    id: "world1-ch4-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH4,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    title: "World 1 · Chapter 4 placeholder lesson pack",
    description: "Expansion-ready placeholder pack for future chapter lesson insertion.",
    entries: [],
    wordBankId: "word-bank-world1-ch4-placeholder",
    sentenceBankId: "sentence-bank-world1-ch4-placeholder",
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    notes: "Insert final Chapter 4 lesson entries here later.",
  }),
];

export const LESSON_PACK_INDEX = LESSON_CONTENT_PACKS.reduce((acc, pack) => ({
  ...acc,
  [pack.id]: pack,
}), {});

export const LESSON_WORD_BANKS = {
  "word-bank-world1-ch1-core": {
    id: "word-bank-world1-ch1-core",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH1,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.READY,
    tokens: ["ship", "west", "deck", "captain", "map", "shore", "water", "sailors"],
  },
  "word-bank-world1-ch2-placeholder": {
    id: "word-bank-world1-ch2-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH2,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    tokens: [],
  },
  "word-bank-world1-ch3-placeholder": {
    id: "word-bank-world1-ch3-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH3,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    tokens: [],
  },
  "word-bank-world1-ch4-placeholder": {
    id: "word-bank-world1-ch4-placeholder",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH4,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    tokens: [],
  },
};

export const LESSON_BANK = {
  [DIFFICULTY_LEVELS.BEGINNER]: LESSON_CONTENT_PACKS
    .filter((pack) => pack.difficulty === DIFFICULTY_LEVELS.BEGINNER && pack.entries.length)
    .flatMap((pack) => pack.entries),
  [DIFFICULTY_LEVELS.INTERMEDIATE]: INTERMEDIATE_FALLBACK_ENTRIES,
  [DIFFICULTY_LEVELS.ADVANCED]: ADVANCED_FALLBACK_ENTRIES,
};

export const BANK = LESSON_BANK;

export function findLessonContentPack({ worldId = null, chapterId = null, difficulty = DIFFICULTY_LEVELS.BEGINNER } = {}) {
  return LESSON_CONTENT_PACKS.find((pack) => (
    pack.difficulty === difficulty
    && (!worldId || pack.worldId === worldId)
    && (!chapterId || pack.chapterId === chapterId)
    && Array.isArray(pack.entries)
    && pack.entries.length > 0
  )) || null;
}

export function getLessonContentPackById(packId) {
  return LESSON_PACK_INDEX[packId] || null;
}

export function getLessonEntries(levelKey = DIFFICULTY_LEVELS.BEGINNER, context = {}) {
  const matchedPack = findLessonContentPack({
    worldId: context.worldId,
    chapterId: context.chapterId,
    difficulty: levelKey,
  });

  if (matchedPack?.entries?.length) return matchedPack.entries;
  return LESSON_BANK[levelKey] || [];
}

export function getLessonWordBank({ packId = null, worldId = null, chapterId = null } = {}) {
  if (packId && getLessonContentPackById(packId)?.expansion?.wordBank?.id) {
    return LESSON_WORD_BANKS[getLessonContentPackById(packId).expansion.wordBank.id] || null;
  }

  return Object.values(LESSON_WORD_BANKS).find((bank) => (
    (!worldId || bank.worldId === worldId) && (!chapterId || bank.chapterId === chapterId)
  )) || null;
}

export function getLessonContentManifest() {
  return DIFFICULTY_LEVEL_LIST.map((difficulty) => ({
    difficulty,
    packs: LESSON_CONTENT_PACKS.filter((pack) => pack.difficulty === difficulty),
  }));
}

export function getAllLessonAnswers() {
  return [
    ...LESSON_CONTENT_PACKS.flatMap((pack) => (pack.entries || []).map((item) => item.a)),
    ...Object.entries(LESSON_BANK)
      .filter(([levelKey]) => levelKey !== DIFFICULTY_LEVELS.BEGINNER)
      .flatMap(([, bucket]) => (bucket || []).map((item) => item.a)),
  ];
}

export function buildLessonTranslationMaps(bank = LESSON_BANK) {
  const questionMnByEn = {};
  const answerMnByEn = {};
  Object.values(bank).forEach((bucket) => {
    (bucket || []).forEach((entry) => {
      if (entry.q) questionMnByEn[entry.q] = entry.qMn || "";
      if (entry.a) answerMnByEn[entry.a] = entry.aMn || "";
    });
  });
  return { questionMnByEn, answerMnByEn };
}

export const LESSON_TRANSLATIONS = buildLessonTranslationMaps();

export function levelName(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.BEGINNER ? "Анхан" : levelKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд" : "Дээд";
}

export function buildOptions(correct, allAnswers = getAllLessonAnswers()) {
  const others = allAnswers.filter((item) => item !== correct);
  const options = [correct];
  while (options.length < 4 && others.length > 0) {
    const pick = others.splice(Math.floor(Math.random() * others.length), 1)[0];
    if (pick && !options.includes(pick)) options.push(pick);
  }
  return options.sort(() => Math.random() - 0.5);
}
