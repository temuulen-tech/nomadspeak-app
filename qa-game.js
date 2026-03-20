/**
 * qa-game.js
 * Question-answer game constants and mode-specific helper functions.
 *
 * Real content insertion ownership:
 * - Store QA round sets here.
 * - Each set id should match the qaSetId referenced from worlds.js and/or chapters.js.
 * - Keep word-bank tokens needed for the QA build flow inside each round so gameplay code does not change.
 * - Prefer replacing placeholder sets with real rounds instead of branching QA flow logic.
 */

import { getRewardAssetByLevel } from "./assets.js";
import {
  CONTENT_COLLECTIONS,
  CONTENT_TEMPLATE_SECTIONS,
  DIFFICULTY_LEVELS,
  FUTURE_CONTENT_SLOTS,
  PLACEHOLDER_STATES,
  cloneInsertionExample,
  createPlaceholderMeta,
  createStarterTemplateManifest,
} from "./constants.js";
import { CONTENT_GROUPS, getChapterContentRefs } from "./content-registry.js";

export const QA_REWARD_STEPS = [
  { icon: "🏳️", label: "Эхлэл амжилттай!", seconds: 20 * 60, ...getRewardAssetByLevel(1), alt: "Асуулт-хариултын шагнал туг" },
  { icon: "⭐", label: "Улаан одын Эзэн", seconds: 30 * 60, ...getRewardAssetByLevel(2), alt: "Асуулт-хариултын шагнал од" },
  { icon: "🪙", label: "Алтан зоос Чинийх", seconds: 50 * 60, ...getRewardAssetByLevel(3), alt: "Асуулт-хариултын шагнал зоос" },
  { icon: "🏆", label: "Алтан цомын Эзэн", seconds: 60 * 60, ...getRewardAssetByLevel(4), alt: "Асуулт-хариултын шагнал цом" },
  { icon: "💎", label: "Алмөөз эрдэнэ Чинийх", seconds: 90 * 60, ...getRewardAssetByLevel(5), alt: "Асуулт-хариултын шагнал эрдэнэ" },
];


const WORLD_1_PLACEHOLDER_CHAPTERS = CONTENT_GROUPS.WORLD_1_PLACEHOLDER_CHAPTERS;

function createWorld1PlaceholderQaSet(chapterId) {
  return createQaContentSet({
    id: getChapterContentRefs("world1", chapterId).qaSetId,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    qaNotes: `Insert ${chapterId.toUpperCase()} QA rounds here later.`,
    wordBankId: `qa-word-bank-world1-${chapterId}-placeholder`,
    wordBankNotes: `Add ${chapterId.toUpperCase()} QA helper tokens later if this bank diverges from the shared core.`,
  });
}

export const QA_CONTENT_INSERTION_EXAMPLE = {
  id: "qa-set-world1-ch2-core",
  difficulty: DIFFICULTY_LEVELS.BEGINNER,
  state: PLACEHOLDER_STATES.READY,
  rounds: [
    {
      id: "A",
      mnQuestion: "Тэд эрэг дээр юу авчирсан бэ?",
      mnAnswer: "Тэд жижиг бэлэг авчирсан.",
      enQuestion: "What did they bring to the shore ?",
      enAnswer: "They brought small gifts to the shore .",
      wordBankTokens: ["What", "did", "they", "bring", "to", "the", "shore", "?", "They", "brought", "small", "gifts", "."],
    },
  ],
};

function createQaContentSet({
  id,
  difficulty = DIFFICULTY_LEVELS.BEGINNER,
  state = PLACEHOLDER_STATES.PLACEHOLDER,
  rounds = [],
  qaNotes = "",
  wordBankId = null,
  wordBankState = state,
  wordBankNotes = "",
} = {}) {
  return {
    id,
    difficulty,
    state,
    rounds,
    expansion: {
      qaSet: createPlaceholderMeta({
        collection: CONTENT_COLLECTIONS.QA_SETS,
        slot: FUTURE_CONTENT_SLOTS.QA_SET,
        id,
        state,
        notes: qaNotes,
      }),
      ...(wordBankId ? {
        wordBank: createPlaceholderMeta({
          collection: CONTENT_COLLECTIONS.WORD_BANKS,
          slot: FUTURE_CONTENT_SLOTS.WORD_BANK,
          id: wordBankId,
          state: wordBankState,
          notes: wordBankNotes,
        }),
      } : {}),
    },
  };
}

const QA_CONTENT_SETS = [
  createQaContentSet({
    id: "qa-set-world1-ch1-first-steps",
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.READY,
    rounds: [
      {
        id: "A",
        mnQuestion: "Таныг хэн гэдэг вэ ?",
        mnAnswer: "Миний нэр Сара.",
        enQuestion: "What is your name ?",
        enAnswer: "My name is Sara .",
        wordBankTokens: ["What", "is", "your", "name", "?", "My", "name", "is", "Sara", "."],
      },
      {
        id: "B",
        mnQuestion: "Сайн байна уу ?",
        mnAnswer: "Би сайн байна, баярлалаа.",
        enQuestion: "How are you ?",
        enAnswer: "I am fine , thank you .",
        wordBankTokens: ["How", "are", "you", "?", "I", "am", "fine", ",", "thank", "you", "."],
      },
      {
        id: "C",
        mnQuestion: "Та хаанаас ирсэн бэ ?",
        mnAnswer: "Би Монголоос ирсэн.",
        enQuestion: "Where are you from ?",
        enAnswer: "I am from Mongolia .",
        wordBankTokens: ["Where", "are", "you", "from", "?", "I", "am", "from", "Mongolia", "."],
      },
      {
        id: "D",
        mnQuestion: "Та англиар ярьдаг уу ?",
        mnAnswer: "Бага зэрэг.",
        enQuestion: "Do you speak English ?",
        enAnswer: "A little .",
        wordBankTokens: ["Do", "you", "speak", "English", "?", "A", "little", "."],
      },
      {
        id: "E",
        mnQuestion: "Та бэлэн үү ?",
        mnAnswer: "Тийм ээ, би бэлэн байна.",
        enQuestion: "Are you ready ?",
        enAnswer: "Yes , I am ready .",
        wordBankTokens: ["Are", "you", "ready", "?", "Yes", ",", "I", "am", "ready", "."],
      },
      {
        id: "F",
        mnQuestion: "Энэ юу вэ ?",
        mnAnswer: "Энэ бол ном.",
        enQuestion: "What is this ?",
        enAnswer: "This is a book .",
        wordBankTokens: ["What", "is", "this", "?", "This", "is", "a", "book", "."],
      },
      {
        id: "G",
        mnQuestion: "Тэр хэн бэ ?",
        mnAnswer: "Тэр бол миний найз.",
        enQuestion: "Who is he ?",
        enAnswer: "He is my friend .",
        wordBankTokens: ["Who", "is", "he", "?", "He", "is", "my", "friend", "."],
      },
      {
        id: "H",
        mnQuestion: "Сургууль хаана байна вэ ?",
        mnAnswer: "Сургууль энд байна.",
        enQuestion: "Where is the school ?",
        enAnswer: "The school is here .",
        wordBankTokens: ["Where", "is", "the", "school", "?", "The", "school", "is", "here", "."],
      },
      {
        id: "I",
        mnQuestion: "Та хэзээ хичээллэдэг вэ ?",
        mnAnswer: "Би өглөө хичээллэдэг.",
        enQuestion: "When do you study ?",
        enAnswer: "I study in the morning .",
        wordBankTokens: ["When", "do", "you", "study", "?", "I", "study", "in", "the", "morning", "."],
      },
      {
        id: "J",
        mnQuestion: "Таны гэр хаана байдаг вэ ?",
        mnAnswer: "Миний гэр цэцэрлэгт хүрээлэнгийн ойролцоо байдаг.",
        enQuestion: "Where is your home ?",
        enAnswer: "My home is near the park .",
        wordBankTokens: ["Where", "is", "your", "home", "?", "My", "home", "is", "near", "the", "park", "."],
      },
    ],
    wordBankId: "qa-word-bank-world1-ch1-first-steps",
    wordBankState: PLACEHOLDER_STATES.READY,
  }),
  ...WORLD_1_PLACEHOLDER_CHAPTERS.map((chapterId) => createWorld1PlaceholderQaSet(chapterId)),
  createQaContentSet({
    id: "qa-set-world2-placeholder",
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    qaNotes: "Insert Silk Road QA rounds here later.",
  }),
  createQaContentSet({
    id: "qa-set-world3-placeholder",
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    state: PLACEHOLDER_STATES.PLACEHOLDER,
    qaNotes: "Insert Roman world QA rounds here later.",
  }),
];

export const QA_STARTER_TEMPLATES = QA_CONTENT_SETS.map((set) => createStarterTemplateManifest({
  section: CONTENT_TEMPLATE_SECTIONS.QA,
  difficultyId: set.difficulty,
  qaSetId: set.id,
  wordBankId: set.expansion?.wordBank?.id || null,
  notes: set.expansion?.qaSet?.notes || "Insert QA rounds here while keeping the same round contract.",
}));

export const QA_CONTENT_SET_INDEX = QA_CONTENT_SETS.reduce((acc, set) => ({ ...acc, [set.id]: set }), {});

const sharedCoreRounds = QA_CONTENT_SETS[0].rounds;

export const QA_ROUNDS = sharedCoreRounds;

export const QA_WORD_BANK_BASE = QA_ROUNDS[0].wordBankTokens;

export function getQaContentSet(setId = "qa-set-world1-ch1-first-steps") {
  return QA_CONTENT_SET_INDEX[setId] || QA_CONTENT_SETS[0] || null;
}

export function getQaRounds(setId = "qa-set-world1-ch1-first-steps") {
  return getQaContentSet(setId)?.rounds?.slice() || QA_ROUNDS.slice();
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

export function qaRoundPoolForLevel(levelKey, setId = "qa-set-world1-ch1-first-steps") {
  const rounds = getQaRounds(setId);
  return levelKey === DIFFICULTY_LEVELS.BEGINNER ? rounds.slice(0, 1) : rounds.slice(0, 2);
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

export function getQaContentInsertionGuide() {
  return {
    ownership: {
      file: "qa-game.js",
      manages: [
        "QA round sets",
        "round-specific token banks",
        "QA expansion manifest state",
        "the shared placeholder-id pattern for upcoming chapter QA sets",
      ],
    },
    starterTemplates: QA_STARTER_TEMPLATES.map((template) => ({ ...template })),
    example: cloneInsertionExample(QA_CONTENT_INSERTION_EXAMPLE),
  };
}
