// ======================
// NomadSpeak Quiz Engine
// 4 options • 3 levels • score • end screen
// ======================

const STORAGE_KEY = "nomadspeak_stats_v1";

const UI = {
  brandSubtitle: "Англи хэл сурах сорил",
  topbar: {
    level: "Түвшин",
    score: "Оноо",
    question: "Асуулт",
  },
  start: {
    title: "Эхлэхээс өмнө",
    description: "Түвшин сонгоод “Эхлэх” дар.",
    button: "Эхлэх",
    chooseLevel: "Түвшин сонгох",
  },
  levels: {
    beginner: "Анхан",
    intermediate: "Дунд",
    advanced: "Дээд",
  },
  quiz: {
    nextQuestion: "Дараагийн асуулт",
    correct: "✅ Зөв!",
    incorrectPrefix: "❌ Буруу! Зөв нь:",
  },
  end: {
    title: "Дууслаа 🎉",
    yourScore: "Таны оноо",
    level: "Түвшин",
    restart: "Дахин эхлэх",
    back: "Буцаад түвшин сонгох",
  },
  stats: {
    title: "Статистик",
    totalAnswered: "Нийт хариулсан",
    totalCorrect: "Нийт зөв",
    accuracy: "Зөв хариултын хувь",
    totalScore: "Нийт оноо",
    streak: days => `Цуврал: ${days} өдөр`,
    last7Days: "Сүүлийн 7 хоног",
    perLevel: "Түвшин тус бүр",
    noHistory: "Одоогоор түүх алга.",
    pts: "оноо",
  },
  footer: "© NomadSpeak",
};

// ---- Асуултын сан (асуулт, хариулт англи хэвээр) ----
const BANK = {
  beginner: [
    { q: "What month is it now?", a: "It is September now." },
    { q: "What day is it today?", a: "Today is Monday" },
    { q: "What is your name?", a: "My name is Nasaa" },
    { q: "Where do you live?", a: "I live in Ulaanbaatar city" },
    { q: "Where are you from?", a: "I from Mongolia" },
    { q: "Where are you going?", a: "I am going to Shanghai." },
    { q: "Are you hungry?", a: "Yes, I'm a little hungry." },
    { q: "Have you eaten dinner?", a: "I ate dinner." },
    { q: "What is your hobby?", a: "My hobby is roller skating." },
    { q: "What is your favourite fruit?", a: "I like to eat apples." },
  ],
  intermediate: [
    { q: "When were you born?", a: "I was born on September 8" },
    { q: "Where were you born?", a: "I was born in Ulaanbaatar city" },
    { q: "What do you do in your free time?", a: "I read books in my free time." },
    { q: "What is your dream?", a: "I will be a great businessman." },
    { q: "What color do you like?", a: "I like the color red." },
    { q: "When did you wake up?", a: "I woke up at 8 in the morning." },
    { q: "When did you go to sleep?", a: "I went to bed at 10 o'clock yesterday." },
    { q: "How old are you?", a: "I am thirty years old." },
  ],
  advanced: [
    { q: "Where was his/her father born?", a: "His father was born in America." },
    { q: "Where was his/her mother born?", a: "Her mother was born in France" },
    { q: "How often do you meet him?", a: "I meet him 3 times a week." },
    { q: "How many books does he have?", a: "He has 1000 books." },
    { q: "How long will we travel?", a: "Both will travel for 3 months." },
    { q: "Where is their home?", a: "Their home is in Berlin." },
    { q: "Do you remember her?", a: "I miss her very much." },
  ],
};

// ---- DOM ----
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const endScreen = document.getElementById("end-screen");

const topbar = document.getElementById("topbar");
const levelLabel = document.getElementById("level-label");
const scoreEl = document.getElementById("score");
const progressEl = document.getElementById("progress");

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const resultEl = document.getElementById("result");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const backBtn = document.getElementById("back-btn");

const levelButtons = document.querySelectorAll(".level-btn");

// ---- State ----
let level = "beginner";
let questions = [];
let currentIndex = 0;
let score = 0;
let locked = false;
let quizAnswered = 0;
let quizCorrect = 0;
let stats = loadStats();

// ---- Helpers ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function unique(array) {
  return [...new Set(array)];
}

function levelName(lv) {
  if (lv === "beginner") return UI.levels.beginner;
  if (lv === "intermediate") return UI.levels.intermediate;
  return UI.levels.advanced;
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function safePercentage(correctCount, answeredCount) {
  if (!answeredCount) return 0;
  return Math.round((correctCount / answeredCount) * 100);
}

function defaultStats() {
  return {
    totalAnswered: 0,
    totalCorrect: 0,
    totalScore: 0,
    history: [],
    perLevel: {
      beginner: { answered: 0, correct: 0, score: 0 },
      intermediate: { answered: 0, correct: 0, score: 0 },
      advanced: { answered: 0, correct: 0, score: 0 },
    },
  };
}

function sanitizeStats(data) {
  const base = defaultStats();
  if (!data || typeof data !== "object") return base;

  const out = {
    ...base,
    ...data,
    perLevel: {
      beginner: { ...base.perLevel.beginner, ...(data.perLevel?.beginner || {}) },
      intermediate: { ...base.perLevel.intermediate, ...(data.perLevel?.intermediate || {}) },
      advanced: { ...base.perLevel.advanced, ...(data.perLevel?.advanced || {}) },
    },
    history: Array.isArray(data.history) ? data.history : [],
  };

  out.history = out.history
    .filter(item => item && typeof item.date === "string")
    .map(item => ({
      date: item.date,
      score: Number(item.score) || 0,
      answered: Number(item.answered) || 0,
      correct: Number(item.correct) || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return out;
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    return sanitizeStats(JSON.parse(raw));
  } catch {
    return defaultStats();
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function upsertTodayHistory(scoreDelta, answeredDelta, correctDelta) {
  const today = isoToday();
  const existing = stats.history.find(item => item.date === today);
  if (existing) {
    existing.score += scoreDelta;
    existing.answered += answeredDelta;
    existing.correct += correctDelta;
  } else {
    stats.history.push({
      date: today,
      score: scoreDelta,
      answered: answeredDelta,
      correct: correctDelta,
    });
  }
  stats.history.sort((a, b) => a.date.localeCompare(b.date));
}

function calculateStreakDays() {
  if (!stats.history.length) return 0;

  const uniqueDates = [...new Set(stats.history.map(item => item.date))].sort((a, b) => a.localeCompare(b));
  let streak = 0;
  let cursor = new Date(`${isoToday()}T00:00:00`);

  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!uniqueDates.includes(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function renderStats() {
  const totalAnswered = stats.totalAnswered;
  const totalCorrect = stats.totalCorrect;
  const totalScore = stats.totalScore;
  const accuracy = safePercentage(totalCorrect, totalAnswered);

  document.getElementById("stats-total-answered-value").textContent = totalAnswered;
  document.getElementById("stats-total-correct-value").textContent = totalCorrect;
  document.getElementById("stats-accuracy-value").textContent = `${accuracy}%`;
  document.getElementById("stats-total-score-value").textContent = totalScore;
  document.getElementById("stats-streak").textContent = UI.stats.streak(calculateStreakDays());

  const historyEl = document.getElementById("stats-history");
  historyEl.innerHTML = "";

  const sortedDesc = [...stats.history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  if (!sortedDesc.length) {
    const li = document.createElement("li");
    li.textContent = UI.stats.noHistory;
    historyEl.appendChild(li);
  } else {
    sortedDesc.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.date} — ${item.score} ${UI.stats.pts}`;
      historyEl.appendChild(li);
    });
  }

  const levelList = document.getElementById("stats-level-list");
  levelList.innerHTML = "";

  ["beginner", "intermediate", "advanced"].forEach(lv => {
    const item = stats.perLevel[lv];
    const row = document.createElement("div");
    row.className = "stats-level-item";

    const name = document.createElement("span");
    name.textContent = levelName(lv);

    const value = document.createElement("strong");
    const pct = safePercentage(item.correct, item.answered);
    value.textContent = `${item.score} ${UI.stats.pts} • ${pct}%`;

    row.appendChild(name);
    row.appendChild(value);
    levelList.appendChild(row);
  });
}

function applyUIText() {
  document.getElementById("subtitle").textContent = UI.brandSubtitle;
  document.getElementById("level-pill-label").textContent = UI.topbar.level;
  document.getElementById("score-pill-label").textContent = UI.topbar.score;
  document.getElementById("question-pill-label").textContent = UI.topbar.question;

  document.getElementById("start-title").textContent = UI.start.title;
  document.getElementById("start-description").textContent = UI.start.description;
  startBtn.textContent = UI.start.button;

  const levelBeginner = document.getElementById("level-beginner");
  const levelIntermediate = document.getElementById("level-intermediate");
  const levelAdvanced = document.getElementById("level-advanced");

  levelBeginner.textContent = UI.levels.beginner;
  levelIntermediate.textContent = UI.levels.intermediate;
  levelAdvanced.textContent = UI.levels.advanced;

  levelBeginner.setAttribute("aria-label", `${UI.start.chooseLevel}: ${UI.levels.beginner}`);
  levelIntermediate.setAttribute("aria-label", `${UI.start.chooseLevel}: ${UI.levels.intermediate}`);
  levelAdvanced.setAttribute("aria-label", `${UI.start.chooseLevel}: ${UI.levels.advanced}`);

  nextBtn.textContent = UI.quiz.nextQuestion;
  document.getElementById("end-title").textContent = UI.end.title;
  restartBtn.textContent = UI.end.restart;
  backBtn.textContent = UI.end.back;

  document.getElementById("stats-title").textContent = UI.stats.title;
  document.getElementById("stats-total-answered-label").textContent = UI.stats.totalAnswered;
  document.getElementById("stats-total-correct-label").textContent = UI.stats.totalCorrect;
  document.getElementById("stats-accuracy-label").textContent = UI.stats.accuracy;
  document.getElementById("stats-total-score-label").textContent = UI.stats.totalScore;
  document.getElementById("stats-last7-title").textContent = UI.stats.last7Days;
  document.getElementById("stats-level-title").textContent = UI.stats.perLevel;

  document.getElementById("footer-text").textContent = UI.footer;
}

function getAllAnswersExcept(correct) {
  const all = [
    ...BANK.beginner.map(x => x.a),
    ...BANK.intermediate.map(x => x.a),
    ...BANK.advanced.map(x => x.a),
  ];
  return all.filter(answer => answer !== correct);
}

// 4 сонголт хийх: 1 зөв + 3 буруу
function buildOptions(correct) {
  const pool = shuffle(unique(getAllAnswersExcept(correct)));
  const wrongs = pool.slice(0, 3);
  return shuffle([correct, ...wrongs]);
}

function updateTopbar() {
  levelLabel.textContent = levelName(level);
  scoreEl.textContent = score;
  progressEl.textContent = `${currentIndex + 1}/${questions.length}`;
}

// ---- UI switch ----
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function showOnlyScreen(screenEl) {
  [startScreen, quizScreen, endScreen].forEach(hide);
  show(screenEl);
}

// ---- Quiz logic ----
function startQuiz() {
  questions = shuffle(BANK[level]).slice(0);
  currentIndex = 0;
  score = 0;
  locked = false;
  quizAnswered = 0;
  quizCorrect = 0;

  showOnlyScreen(quizScreen);
  show(topbar);
  renderQuestion();
}

function renderQuestion() {
  locked = false;
  resultEl.textContent = "";
  resultEl.className = "result hidden";
  hide(nextBtn);

  const item = questions[currentIndex];
  questionEl.textContent = item.q;

  const options = buildOptions(item.a);
  optionsEl.innerHTML = "";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt;
    btn.addEventListener("click", () => pickAnswer(btn, opt));
    optionsEl.appendChild(btn);
  });

  updateTopbar();
}

function pickAnswer(buttonEl, selected) {
  if (locked) return;
  locked = true;

  const correct = questions[currentIndex].a;
  quizAnswered += 1;

  const buttons = [...document.querySelectorAll(".option")];
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) btn.classList.add("correct");
  });

  if (selected === correct) {
    score += 1;
    quizCorrect += 1;
    buttonEl.classList.add("correct");
    resultEl.textContent = UI.quiz.correct;
    resultEl.classList.add("ok");
  } else {
    buttonEl.classList.add("wrong");
    resultEl.textContent = `${UI.quiz.incorrectPrefix} ${correct}`;
    resultEl.classList.add("bad");
  }

  show(resultEl);
  show(nextBtn);
  updateTopbar();
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    endQuiz();
  }
}

function updateStatsFromQuiz() {
  stats.totalAnswered += quizAnswered;
  stats.totalCorrect += quizCorrect;
  stats.totalScore += score;

  stats.perLevel[level].answered += quizAnswered;
  stats.perLevel[level].correct += quizCorrect;
  stats.perLevel[level].score += score;

  upsertTodayHistory(score, quizAnswered, quizCorrect);
  saveStats();
}

function endQuiz() {
  updateStatsFromQuiz();
  renderStats();

  hide(topbar);
  showOnlyScreen(endScreen);

  const finalText = document.getElementById("final-text");
  finalText.textContent = `${UI.end.yourScore}: ${score} / ${questions.length}  •  ${UI.end.level}: ${levelName(level)}`;
}

function backToStart() {
  hide(topbar);
  renderStats();
  showOnlyScreen(startScreen);
}

// ---- Events ----
levelButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    levelButtons.forEach(button => button.classList.remove("active"));
    btn.classList.add("active");
    level = btn.dataset.level;
  });
});

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);
backBtn.addEventListener("click", backToStart);

applyUIText();
renderStats();
