// ======================
// NomadSpeak Quiz Engine
// 4 options • 3 levels • score • end screen
// ======================

// ---- Question bank (эхний багц). Дараа нь бид үүнийг олон болгоно. ----
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
const sentencesScreen = document.getElementById("sentences-screen");
const statsScreen = document.getElementById("stats-screen");
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

const navHomeBtn = document.getElementById("nav-home-btn");
const navSentencesBtn = document.getElementById("nav-sentences-btn");
const navStatsBtn = document.getElementById("nav-stats-btn");

const confirmOverlay = document.getElementById("confirm-overlay");
const confirmYesBtn = document.getElementById("confirm-yes-btn");
const confirmNoBtn = document.getElementById("confirm-no-btn");

const levelButtons = document.querySelectorAll(".level-btn");
const sentenceFilterButtons = document.querySelectorAll(".filter-btn");
const sentencesListEl = document.getElementById("sentences-list");

// ---- State ----
let level = "beginner";
let questions = [];
let currentIndex = 0;
let score = 0;
let locked = false;
let pendingNavigation = null;

let sentenceItems = [];
let sentenceFilter = "all";
let speakingSentenceId = null;
let availableVoices = [];

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
  if (lv === "beginner") return "Анхан";
  if (lv === "intermediate") return "Дунд";
  return "Дээд";
}

function getAllAnswersExcept(correct) {
  const all = [
    ...BANK.beginner.map(x => x.a),
    ...BANK.intermediate.map(x => x.a),
    ...BANK.advanced.map(x => x.a),
  ];
  return all.filter(a => a !== correct);
}

function isQuizInProgress() {
  return !quizScreen.classList.contains("hidden");
}

function showScreen(screen) {
  hide(startScreen);
  hide(quizScreen);
  hide(sentencesScreen);
  hide(statsScreen);
  hide(endScreen);
  show(screen);

  if (screen === quizScreen) {
    show(topbar);
  } else {
    hide(topbar);
  }
}

function confirmNavigation(destination) {
  pendingNavigation = destination;
  show(confirmOverlay);
  confirmNoBtn.focus();
}

function navigateTo(destination) {
  if (destination === "home") {
    stopSpeaking();
    showScreen(startScreen);
  }

  if (destination === "sentences") {
    showScreen(sentencesScreen);
  }

  if (destination === "stats") {
    stopSpeaking();
    showScreen(statsScreen);
  }
}

function requestNavigation(destination) {
  if (isQuizInProgress()) {
    confirmNavigation(destination);
    return;
  }

  navigateTo(destination);
}

// 4 option хийх: 1 зөв + 3 буруу
function buildOptions(correct) {
  const pool = shuffle(unique(getAllAnswersExcept(correct)));
  const wrongs = pool.slice(0, 3);
  const mixed = shuffle([correct, ...wrongs]);
  return mixed;
}

function updateTopbar() {
  levelLabel.textContent = levelName(level);
  scoreEl.textContent = score;
  progressEl.textContent = `${currentIndex + 1}/${questions.length}`;
}

// ---- UI switch ----
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

// ---- Speech & sentences ----
function loadVoices() {
  if (!("speechSynthesis" in window)) return;
  availableVoices = window.speechSynthesis.getVoices();
}

function bestEnglishVoice() {
  if (!availableVoices.length) return null;
  return (
    availableVoices.find(v => v.lang.toLowerCase().startsWith("en-us")) ||
    availableVoices.find(v => v.lang.toLowerCase().startsWith("en")) ||
    availableVoices[0]
  );
}

function stopSpeaking() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  speakingSentenceId = null;
  updateSpeakingState();
}

function speakSentence(item) {
  if (!("speechSynthesis" in window)) return;

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(item.en);
  utterance.lang = "en-US";

  const selectedVoice = bestEnglishVoice();
  if (selectedVoice) utterance.voice = selectedVoice;

  speakingSentenceId = item.id;
  updateSpeakingState();

  utterance.onend = () => {
    speakingSentenceId = null;
    updateSpeakingState();
  };

  utterance.onerror = () => {
    speakingSentenceId = null;
    updateSpeakingState();
  };

  window.speechSynthesis.speak(utterance);
}

function filteredSentences() {
  if (sentenceFilter === "all") return sentenceItems;
  return sentenceItems.filter(item => item.level === sentenceFilter);
}

function updateSpeakingState() {
  const allButtons = sentencesListEl.querySelectorAll(".speak-btn");
  allButtons.forEach(btn => {
    const isPlaying = Number(btn.dataset.id) === speakingSentenceId;
    btn.classList.toggle("playing", isPlaying);
    btn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    btn.setAttribute("aria-label", isPlaying ? "Уншиж байна" : "Дуу сонсох");
  });
}

function renderSentences() {
  const list = filteredSentences();

  if (!list.length) {
    sentencesListEl.innerHTML = '<p class="muted">Өгүүлбэр олдсонгүй.</p>';
    return;
  }

  sentencesListEl.innerHTML = "";

  list.forEach(item => {
    const row = document.createElement("div");
    row.className = "sentence-row";

    const textWrap = document.createElement("div");
    textWrap.className = "sentence-text";

    const en = document.createElement("p");
    en.className = "sentence-en";
    en.textContent = item.en;

    const mn = document.createElement("p");
    mn.className = "sentence-mn muted";
    mn.textContent = item.mn;

    textWrap.appendChild(en);
    textWrap.appendChild(mn);

    const speakBtn = document.createElement("button");
    speakBtn.type = "button";
    speakBtn.className = "speak-btn";
    speakBtn.dataset.id = item.id;
    speakBtn.setAttribute("aria-label", "Дуу сонсох");
    speakBtn.textContent = "🔊";
    speakBtn.addEventListener("click", () => speakSentence(item));

    row.appendChild(textWrap);
    row.appendChild(speakBtn);
    sentencesListEl.appendChild(row);
  });

  updateSpeakingState();
}

async function loadSentences() {
  try {
    const response = await fetch("data/sentences.json");
    if (!response.ok) throw new Error("Өгөгдөл ачаалж чадсангүй.");
    sentenceItems = await response.json();
    renderSentences();
  } catch (error) {
    sentencesListEl.innerHTML = '<p class="muted">Өгүүлбэрүүдийг ачаалж чадсангүй.</p>';
  }
}

// ---- Quiz logic ----
function startQuiz() {
  questions = shuffle(BANK[level]).slice(0); // бүгдийг
  currentIndex = 0;
  score = 0;
  locked = false;

  stopSpeaking();
  showScreen(quizScreen);
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

  // бүх товчийг disable болгох + өнгө
  const buttons = [...document.querySelectorAll(".option")];
  buttons.forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add("correct");
  });

  if (selected === correct) {
    score += 1;
    buttonEl.classList.add("correct");
    resultEl.textContent = "✅ Зөв!";
    resultEl.classList.add("ok");
  } else {
    buttonEl.classList.add("wrong");
    resultEl.textContent = `❌ Буруу! Зөв нь: ${correct}`;
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

function endQuiz() {
  showScreen(endScreen);

  const finalText = document.getElementById("final-text");
  finalText.textContent = `Таны оноо: ${score} / ${questions.length}  •  Түвшин: ${levelName(level)}`;
}

function backToStart() {
  stopSpeaking();
  showScreen(startScreen);
}

// ---- Events ----
levelButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    levelButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    level = btn.dataset.level;
  });
});

sentenceFilterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sentenceFilterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    sentenceFilter = btn.dataset.filter;
    stopSpeaking();
    renderSentences();
  });
});

navHomeBtn.addEventListener("click", () => requestNavigation("home"));
navSentencesBtn.addEventListener("click", () => requestNavigation("sentences"));
navStatsBtn.addEventListener("click", () => requestNavigation("stats"));

confirmNoBtn.addEventListener("click", () => {
  pendingNavigation = null;
  hide(confirmOverlay);
});

confirmYesBtn.addEventListener("click", () => {
  hide(confirmOverlay);

  if (pendingNavigation) {
    navigateTo(pendingNavigation);
    pendingNavigation = null;
  }
});

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);
backBtn.addEventListener("click", backToStart);

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
}

loadSentences();
