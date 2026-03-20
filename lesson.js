import { DIFFICULTY_LEVELS } from "./constants.js";

/**
 * lesson.js
 * Lesson content and core lesson helpers (question bank, labels, options).
 */
export const LESSON_BANK = {
  [DIFFICULTY_LEVELS.BEGINNER]: [
    { q: "What month is it now?", qMn: "Одоо хэдэн сар вэ?", a: "It is September now.", aMn: "Одоо есдүгээр сар байна." },
    { q: "What day is it today?", qMn: "Өнөөдөр ямар гараг вэ?", a: "Today is Monday", aMn: "Өнөөдөр Даваа гараг." },
    { q: "What is your name?", qMn: "Таны нэрийг хэн гэдэг вэ?", a: "My name is Nasaa", aMn: "Миний нэрийг Насаа гэдэг." },
    { q: "Where do you live?", qMn: "Та хаана амьдардаг вэ?", a: "I live in Ulaanbaatar city", aMn: "Би Улаанбаатар хотод амьдардаг." },
    { q: "Where are you from?", qMn: "Та хаанаас ирсэн бэ?", a: "I from Mongolia", aMn: "Би Монголоос ирсэн." },
    { q: "Where are you going?", qMn: "Та хаашаа явж байна вэ?", a: "I am going to Shanghai.", aMn: "Би Шанхай руу явж байна." },
    { q: "Are you hungry?", qMn: "Та өлсөж байна уу?", a: "Yes, I'm a little hungry.", aMn: "Тийм ээ, би бага зэрэг өлсөж байна." },
    { q: "Have you eaten dinner?", qMn: "Та оройн хоолоо идсэн үү?", a: "I ate dinner.", aMn: "Би оройн хоолоо идсэн." },
    { q: "What is your hobby?", qMn: "Таны хобби юу вэ?", a: "My hobby is roller skating.", aMn: "Миний хобби бол дугуйт тэшүүр." },
    { q: "What is your favourite fruit?", qMn: "Таны дуртай жимс юу вэ?", a: "I like to eat apples.", aMn: "Би алим идэх дуртай." },
  ],
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

export function getLessonEntries(levelKey = DIFFICULTY_LEVELS.BEGINNER) {
  return LESSON_BANK[levelKey] || [];
}

export function getAllLessonAnswers() {
  return Object.values(LESSON_BANK).flatMap((bucket) => (bucket || []).map((item) => item.a));
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
