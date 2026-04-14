import {
  CHAPTER_IDS,
  CONTENT_COLLECTIONS,
  CONTENT_TEMPLATE_SECTIONS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_LEVEL_LIST,
  FUTURE_CONTENT_SLOTS,
  PLACEHOLDER_STATES,
  WORLD_IDS,
  cloneInsertionExample,
  createPlaceholderMeta,
  createStarterTemplateManifest,
} from "./constants.js";
import { CONTENT_GROUPS, getChapterContentRefs } from "./content-registry.js";

/**
 * lesson.js
 * Lesson content and core lesson helpers (question bank, labels, options).
 *
 * Real content insertion ownership:
 * - Store full lesson prompt/answer rows here.
 * - Store lesson-side word bank tokens here when they are learned/reviewed alongside the lesson pack.
 * - Keep ids aligned with worlds.js and chapters.js so routing stays data-driven.
 * - Prefer filling placeholder packs instead of adding special-case lesson flow elsewhere.
 */

const BEGINNER_PACK_ENTRIES = [
  { q: "Hello!", qMn: "Сайн уу!", a: "Hello!", aMn: "Сайн уу!" },
  { q: "Good morning.", qMn: "Өглөөний мэнд.", a: "Good morning.", aMn: "Өглөөний мэнд." },
  { q: "Good afternoon.", qMn: "Өдрийн мэнд.", a: "Good afternoon.", aMn: "Өдрийн мэнд." },
  { q: "Good evening.", qMn: "Оройн мэнд.", a: "Good evening.", aMn: "Оройн мэнд." },
  { q: "Goodbye.", qMn: "Баяртай.", a: "Goodbye.", aMn: "Баяртай." },
  { q: "See you later.", qMn: "Дараа уулзъя.", a: "See you later.", aMn: "Дараа уулзъя." },
  { q: "What is your name?", qMn: "Таныг хэн гэдэг вэ?", a: "My name is Sara.", aMn: "Миний нэр Сара." },
  { q: "Who are you?", qMn: "Та хэн бэ?", a: "I am Sara.", aMn: "Би Сара байна." },
  { q: "How are you?", qMn: "Сайн байна уу?", a: "I am fine, thank you.", aMn: "Би сайн байна, баярлалаа." },
  { q: "Where are you from?", qMn: "Та хаанаас ирсэн бэ?", a: "I am from Mongolia.", aMn: "Би Монголоос ирсэн." },
  { q: "Where is the school?", qMn: "Сургууль хаана байна вэ?", a: "The school is here.", aMn: "Сургууль энд байна." },
  { q: "When do you study?", qMn: "Та хэзээ хичээллэдэг вэ?", a: "I study in the morning.", aMn: "Би өглөө хичээллэдэг." },
  { q: "What is this?", qMn: "Энэ юу вэ?", a: "This is a book.", aMn: "Энэ бол ном." },
  { q: "Who is he?", qMn: "Тэр хэн бэ?", a: "He is my friend.", aMn: "Тэр бол миний найз." },
  { q: "This is my friend.", qMn: "Энэ бол миний найз.", a: "Hello, friend.", aMn: "Сайн уу, найз аа." },
  { q: "Do you speak English?", qMn: "Та англиар ярьдаг уу?", a: "A little.", aMn: "Бага зэрэг." },
  { q: "I want water.", qMn: "Би ус хүсэж байна.", a: "Here is water.", aMn: "Энд ус байна." },
  { q: "I want tea.", qMn: "Би цай хүсэж байна.", a: "Here is tea.", aMn: "Энд цай байна." },
  { q: "Are you ready?", qMn: "Та бэлэн үү?", a: "Yes, I am ready.", aMn: "Тийм ээ, би бэлэн байна." },
  { q: "Where is your home?", qMn: "Таны гэр хаана байдаг вэ?", a: "My home is near the park.", aMn: "Миний гэр цэцэрлэгт хүрээлэнгийн ойролцоо байдаг." },
  { q: "What do you do every day?", qMn: "Та өдөр бүр юу хийдэг вэ?", a: "I study every day.", aMn: "Би өдөр бүр хичээллэдэг." },
  { q: "When do you sleep?", qMn: "Та хэзээ унтдаг вэ?", a: "I sleep at night.", aMn: "Би шөнө унтдаг." },
  { q: "Who is this?", qMn: "Энэ хэн бэ?", a: "This is my mother.", aMn: "Энэ бол миний ээж." },
  { q: "Who is in your family?", qMn: "Танай гэр бүлд хэн байдаг вэ?", a: "My family has four people.", aMn: "Миний гэр бүл дөрвөн хүнтэй." },
  { q: "Where is your father?", qMn: "Таны аав хаана байна вэ?", a: "My father is at work.", aMn: "Миний аав ажил дээрээ байна." },
  { q: "What is for breakfast?", qMn: "Өглөөний цайнд юу байна вэ?", a: "Bread and eggs.", aMn: "Талх, өндөг байна." },
  { q: "What do you want to eat?", qMn: "Та юу идэхийг хүсэж байна вэ?", a: "I want rice and soup.", aMn: "Би будаа, шөл идмээр байна." },
  { q: "Where is the kitchen?", qMn: "Гал тогоо хаана байна вэ?", a: "The kitchen is next to the living room.", aMn: "Гал тогоо зочны өрөөний хажууд байна." },
  { q: "What time is it?", qMn: "Хэдэн цаг болж байна вэ?", a: "It is seven o'clock.", aMn: "Долоон цаг болж байна." },
  { q: "When do you go to work?", qMn: "Та хэзээ ажилдаа явдаг вэ?", a: "I go to work at eight.", aMn: "Би найман цагт ажилдаа явдаг." },
  { q: "Where do you work?", qMn: "Та хаана ажилладаг вэ?", a: "I work in a shop.", aMn: "Би дэлгүүрт ажилладаг." },
  { q: "Which bus do we take?", qMn: "Бид ямар автобусанд суух вэ?", a: "We take bus number two.", aMn: "Бид хоёр дугаартай автобусанд сууна." },
  { q: "Where do I turn left?", qMn: "Би хаана зүүн тийш эргэх вэ?", a: "Turn left at the bank.", aMn: "Банк дээр зүүн тийш эргэ." },
  { q: "How do I get home?", qMn: "Би гэртээ яаж харих вэ?", a: "Go straight and turn right.", aMn: "Чигээрээ яваад баруун тийш эргэ." },
  { q: "What is on the table?", qMn: "Ширээн дээр юу байна вэ?", a: "There is rice on the table.", aMn: "Ширээн дээр будаа байна." },
  { q: "Who cooks at home?", qMn: "Гэрт хэн хоол хийдэг вэ?", a: "My sister cooks at home.", aMn: "Миний эгч гэрт хоол хийдэг." },
  { q: "When do you eat dinner?", qMn: "Та оройн хоолоо хэзээ иддэг вэ?", a: "I eat dinner at six.", aMn: "Би зургаан цагт оройн хоолоо иддэг." },
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


const PLACEHOLDER_CHAPTER_IDS = CONTENT_GROUPS.WORLD_1_PLACEHOLDER_CHAPTERS;

function createWorld1PlaceholderLessonPack(chapterId) {
  const contentRefs = getChapterContentRefs(WORLD_IDS.WORLD_1, chapterId);
  return createLessonContentPack({
    id: contentRefs.lessonPackId,
    worldId: WORLD_IDS.WORLD_1,
    chapterId,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    title: `World 1 · ${chapterId.toUpperCase()} placeholder lesson pack`,
    description: `Expansion-ready placeholder pack for future ${chapterId.toUpperCase()} lesson insertion.`,
    entries: [],
    wordBankId: contentRefs.wordBankId,
    sentenceBankId: contentRefs.sentenceBankId,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    notes: `Insert final ${chapterId.toUpperCase()} lesson entries here later.`,
  });
}

function createLessonWordBank({ id, chapterId, state = PLACEHOLDER_STATES.PLACEHOLDER, tokens = [] } = {}) {
  return {
    id,
    worldId: WORLD_IDS.WORLD_1,
    chapterId,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state,
    tokens,
  };
}

function createLessonThreeWordBankCompat() {
  const lessonThreeRefs = getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH3);
  return createLessonWordBank({
    id: lessonThreeRefs.wordBankId,
    chapterId: CHAPTER_IDS.CH3,
    tokens: [],
  });
}

const LESSON_CONTENT_INSERTION_EXAMPLE = {
  pack: {
    id: "world1-ch2-beginner-core",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH2,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    title: "World 1 · Chapter 2 beginner pack",
    description: "One lesson set for a single world/chapter/difficulty insertion.",
    entries: [
      {
        q: "Who is waiting on the shore?",
        qMn: "Эрэг дээр хэн хүлээж байна вэ?",
        a: "A family is waiting on the shore.",
        aMn: "Эрэг дээр нэг гэр бүл хүлээж байна.",
      },
    ],
    wordBankId: getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH2).wordBankId,
    sentenceBankId: getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH2).sentenceBankId,
  },
  wordBank: {
    id: "word-bank-world1-ch2-core",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH2,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.READY,
    tokens: ["shore", "family", "gift", "canoe"],
  },
};

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
    id: "world1-ch1-beginner-first-steps",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH1,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    title: "Колумб ба Шинэ тивийнхэн · 1-р бүлгийн анхан багц",
    description: "Анхны суралцах замд зориулсан энгийн үг, богино өгүүлбэр, мэндчилгээ, үндсэн асуулт-хариултын багц.",
    entries: BEGINNER_PACK_ENTRIES,
    wordBankId: getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH1).wordBankId,
    sentenceBankId: getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH1).sentenceBankId,
  }),
  ...PLACEHOLDER_CHAPTER_IDS.map((chapterId) => createWorld1PlaceholderLessonPack(chapterId)),
];

export const LESSON_PACK_INDEX = LESSON_CONTENT_PACKS.reduce((acc, pack) => ({
  ...acc,
  [pack.id]: pack,
}), {});

export const LESSON_STARTER_TEMPLATES = LESSON_CONTENT_PACKS.map((pack) => createStarterTemplateManifest({
  section: CONTENT_TEMPLATE_SECTIONS.LESSON,
  worldId: pack.worldId,
  difficultyId: pack.difficulty,
  chapterId: pack.chapterId,
  lessonPackId: pack.id,
  wordBankId: pack.expansion?.wordBank?.id || null,
  sentenceBankId: pack.expansion?.sentenceBank?.id || null,
  notes: pack.expansion?.lessonPack?.notes || "Insert lesson entries and matching word bank tokens here.",
}));

export const LESSON_PACKS_BY_CONTEXT = LESSON_CONTENT_PACKS.reduce((acc, pack) => {
  const key = [pack.worldId || "*", pack.chapterId || "*", pack.difficulty].join("::");
  acc[key] = pack;
  return acc;
}, {});

export const LESSON_WORD_BANKS = {
  [getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH1).wordBankId]: createLessonWordBank({
    id: getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH1).wordBankId,
    chapterId: CHAPTER_IDS.CH1,
    state: PLACEHOLDER_STATES.READY,
    tokens: ["hello", "good morning", "good afternoon", "good evening", "goodbye", "see you later", "name", "who", "fine", "from Mongolia", "school", "here", "morning", "book", "friend", "English", "a little", "water", "tea", "ready", "home", "park", "every day", "night", "nice to meet you", "mother", "family", "father", "work", "breakfast", "bread", "eggs", "rice", "soup", "kitchen", "living room", "time", "seven o'clock", "shop", "bus number two", "left", "right", "bank", "table", "sister", "dinner"],
  }),
  [getChapterContentRefs(WORLD_IDS.WORLD_1, CHAPTER_IDS.CH3).wordBankId]: createLessonThreeWordBankCompat(),
  ...Object.fromEntries(PLACEHOLDER_CHAPTER_IDS.map((chapterId) => {
    if (chapterId === CHAPTER_IDS.CH3) {
      return null;
    }
    const id = getChapterContentRefs(WORLD_IDS.WORLD_1, chapterId).wordBankId;
    return [id, createLessonWordBank({ id, chapterId, tokens: [] })];
  }).filter(Boolean)),
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
  const contextKey = [worldId || "*", chapterId || "*", difficulty].join("::");
  const matchedPack = LESSON_PACKS_BY_CONTEXT[contextKey]
    || LESSON_CONTENT_PACKS.find((pack) => (
      pack.difficulty === difficulty
      && (!worldId || pack.worldId === worldId)
      && (!chapterId || pack.chapterId === chapterId)
    ))
    || null;

  return matchedPack && Array.isArray(matchedPack.entries) && matchedPack.entries.length
    ? matchedPack
    : null;
}

export function getLessonContentPackById(packId) {
  return LESSON_PACK_INDEX[packId] || null;
}

export function resolveLessonContent({ packId = null, worldId = null, chapterId = null, difficulty = DIFFICULTY_LEVELS.BEGINNER } = {}) {
  const pack = (packId && getLessonContentPackById(packId))
    || findLessonContentPack({ worldId, chapterId, difficulty })
    || null;
  const hasScopedRequest = Boolean(packId || worldId || chapterId);
  const usesDifficultyFallback = !pack?.entries?.length;
  const entries = usesDifficultyFallback && !hasScopedRequest
    ? (LESSON_BANK[difficulty] || [])
    : (pack?.entries?.length ? pack.entries : []);
  const wordBank = getLessonWordBank({ packId: pack?.id || packId, worldId, chapterId });

  return {
    pack,
    entries,
    wordBank,
    usesDifficultyFallback,
    worldId: pack?.worldId || worldId || null,
    chapterId: pack?.chapterId || chapterId || null,
    difficulty,
  };
}

export function getLessonEntries(levelKey = DIFFICULTY_LEVELS.BEGINNER, context = {}) {
  return resolveLessonContent({
    packId: context.packId,
    worldId: context.worldId,
    chapterId: context.chapterId,
    difficulty: levelKey,
  }).entries;
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

export function getLessonStarterTemplate({ packId = null, worldId = null, chapterId = null, difficulty = DIFFICULTY_LEVELS.BEGINNER } = {}) {
  if (packId) return LESSON_STARTER_TEMPLATES.find((template) => template.lessonPackId === packId) || null;
  return LESSON_STARTER_TEMPLATES.find((template) => (
    template.worldId === worldId
    && template.chapterId === chapterId
    && template.difficultyId === difficulty
  )) || null;
}

export function getLessonContentInsertionGuide() {
  return {
    ownership: {
      file: "lesson.js",
      manages: [
        "lesson content packs",
        "lesson word banks",
        "lesson starter templates",
        "the World 1 chapter placeholder pattern used for later real pack drop-ins",
      ],
    },
    starterTemplates: LESSON_STARTER_TEMPLATES.map((template) => ({ ...template })),
    example: cloneInsertionExample(LESSON_CONTENT_INSERTION_EXAMPLE),
    recommendedPattern: [
      "Create one pack id per world/chapter/difficulty.",
      "Keep lesson entries self-contained with q/qMn/a/aMn fields.",
      "Create a matching word bank id in LESSON_WORD_BANKS when vocabulary should be surfaced with that pack.",
    ],
  };
}
