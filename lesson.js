import { CHAPTER_IDS, DIFFICULTY_LEVELS, WORLD_IDS } from "./constants.js";

/**
 * lesson.js
 * Lesson content and core lesson helpers (question bank, labels, options).
 */
export const LESSON_CONTENT_PACKS = [
  {
    id: "world1-ch1-beginner-landing-kit",
    worldId: WORLD_IDS.WORLD_1,
    chapterId: CHAPTER_IDS.CH1,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    title: "Колумб ба Шинэ тивийнхэн · 1-р бүлгийн анхан багц",
    description: "Далай гатлалт ба анхны буултын сэдэвтэй анхны бодит lesson content pack.",
    entries: [
      { q: "Where is the ship going?", qMn: "Усан онгоц хаашаа явж байна вэ?", a: "The ship is going west.", aMn: "Усан онгоц баруун зүг рүү явж байна." },
      { q: "Who is on the deck?", qMn: "Тавцан дээр хэн байна вэ?", a: "The sailors are on the deck.", aMn: "Далайчид тавцан дээр байна." },
      { q: "What do the sailors see?", qMn: "Далайчид юу харж байна вэ?", a: "They see land ahead.", aMn: "Тэд урд талд газар харж байна." },
      { q: "Are the waves strong today?", qMn: "Өнөөдөр давалгаа хүчтэй байна уу?", a: "Yes, the waves are strong today.", aMn: "Тийм ээ, өнөөдөр давалгаа хүчтэй байна." },
      { q: "What is the captain holding?", qMn: "Ахмад юу барьж байна вэ?", a: "The captain is holding a map.", aMn: "Ахмад газрын зураг барьж байна." },
      { q: "Are the travelers tired?", qMn: "Аялагчид ядарсан уу?", a: "Yes, they are tired after the voyage.", aMn: "Тийм ээ, тэд аяллын дараа ядарсан байна." },
      { q: "What do they need now?", qMn: "Тэдэнд одоо юу хэрэгтэй вэ?", a: "They need fresh water now.", aMn: "Тэдэнд одоо цэвэр ус хэрэгтэй." },
      { q: "Is the new shore quiet?", qMn: "Шинэ эрэг нам гүм байна уу?", a: "No, the new shore is full of birds.", aMn: "Үгүй ээ, шинэ эрэг шувуудаар дүүрэн байна." },
    ],
  },
];

export const LESSON_BANK = {
  [DIFFICULTY_LEVELS.BEGINNER]: LESSON_CONTENT_PACKS
    .filter((pack) => pack.difficulty === DIFFICULTY_LEVELS.BEGINNER)
    .flatMap((pack) => pack.entries),
  [DIFFICULTY_LEVELS.INTERMEDIATE]: [
    { q: "When were you born?", qMn: "Та хэзээ төрсөн бэ?", a: "I was born on September 8", aMn: "Би есдүгээр сарын 8-нд төрсөн." },
    { q: "Where were you born?", qMn: "Та хаана төрсөн бэ?", a: "I was born in Ulaanbaatar city", aMn: "Би Улаанбаатар хотод төрсөн." },
    { q: "What do you do in your free time?", qMn: "Та чөлөөт цагаараа юу хийдэг вэ?", a: "I read books in my free time.", aMn: "Би чөлөөт цагаараа ном уншдаг." },
    { q: "What is your dream?", qMn: "Таны мөрөөдөл юу вэ?", a: "I will be a great businessman.", aMn: "Би агуу бизнесмен болно." },
    { q: "What color do you like?", qMn: "Та ямар өнгөнд дуртай вэ?", a: "I like the color red.", aMn: "Би улаан өнгөнд дуртай." },
    { q: "When did you wake up?", qMn: "Та хэзээ сэрсэн бэ?", a: "I woke up at 8 in the morning.", aMn: "Би өглөө 8 цагт сэрсэн." },
    { q: "When did you go to sleep?", qMn: "Та хэзээ унтсан бэ?", a: "I went to bed at 10 o'clock yesterday.", aMn: "Би өчигдөр 10 цагт унтсан." },
    { q: "How old are you?", qMn: "Та хэдэн настай вэ?", a: "I am thirty years old.", aMn: "Би гучин настай." },
  ],
  [DIFFICULTY_LEVELS.ADVANCED]: [
    { q: "Where was his/her father born?", qMn: "Түүний аав хаана төрсөн бэ?", a: "His father was born in America.", aMn: "Түүний аав Америкт төрсөн." },
    { q: "Where was his/her mother born?", qMn: "Түүний ээж хаана төрсөн бэ?", a: "Her mother was born in France", aMn: "Түүний ээж Францад төрсөн." },
    { q: "How often do you meet him?", qMn: "Та түүнтэй хэр олон уулздаг вэ?", a: "I meet him 3 times a week.", aMn: "Би түүнтэй долоо хоногт 3 удаа уулздаг." },
    { q: "How many books does he have?", qMn: "Түүнд хэдэн ном байдаг вэ?", a: "He has 1000 books.", aMn: "Түүнд 1000 ном бий." },
    { q: "How long will we travel?", qMn: "Бид хэр удаан аялах вэ?", a: "Both will travel for 3 months.", aMn: "Хоёул 3 сарын турш аялна." },
    { q: "Where is their home?", qMn: "Тэдний гэр хаана байдаг вэ?", a: "Their home is in Berlin.", aMn: "Тэдний гэр Берлинд байдаг." },
    { q: "Do you remember her?", qMn: "Та түүнийг санаж байна уу?", a: "I miss her very much.", aMn: "Би түүнийг маш их санаж байна." },
  ],
};

export const BANK = LESSON_BANK;

export function findLessonContentPack({ worldId = null, chapterId = null, difficulty = DIFFICULTY_LEVELS.BEGINNER } = {}) {
  return LESSON_CONTENT_PACKS.find((pack) => (
    pack.difficulty === difficulty
    && (!worldId || pack.worldId === worldId)
    && (!chapterId || pack.chapterId === chapterId)
  )) || null;
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
