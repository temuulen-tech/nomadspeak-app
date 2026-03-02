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
const voiceOptionButtons = document.querySelectorAll(".tts-option-btn[data-voice]");
const rateOptionButtons = document.querySelectorAll(".tts-option-btn[data-rate]");
const soundToggleBtn = document.getElementById("sound-toggle-btn");

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

const TTS_SETTINGS_KEY = "nomadspeak:tts:v1";
const SOUND_SETTINGS_KEY = "nomadspeak:sfx:v1";
const DEFAULT_TTS_SETTINGS = {
  voice: "auto",
  rate: 1,
};

let ttsSettings = { ...DEFAULT_TTS_SETTINGS };
let soundEnabled = true;
let audioContext = null;

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

function loadSoundSettings() {
  try {
    const raw = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (raw === null) {
      soundEnabled = true;
      return;
    }

    soundEnabled = raw === "on";
  } catch (error) {
    soundEnabled = true;
  }
}

function persistSoundSettings() {
  localStorage.setItem(SOUND_SETTINGS_KEY, soundEnabled ? "on" : "off");
}

function updateSoundToggleState() {
  if (!soundToggleBtn) return;
  soundToggleBtn.textContent = soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
  soundToggleBtn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
}

function getAudioContext() {
  if (!(window.AudioContext || window.webkitAudioContext)) return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

function playTone({ frequency, type, duration, volume, attack = 0.005, release = 0.05 }) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + release + 0.02);
}

function playCorrectSound() {
  playTone({ frequency: 880, type: "sine", duration: 0.08, volume: 0.12, attack: 0.004, release: 0.06 });
  setTimeout(() => {
    playTone({ frequency: 1320, type: "sine", duration: 0.09, volume: 0.1, attack: 0.004, release: 0.07 });
  }, 55);
}

function playWrongSound() {
  playTone({ frequency: 170, type: "triangle", duration: 0.12, volume: 0.1, attack: 0.002, release: 0.1 });
}

// ---- Speech & sentences ----
function loadVoices() {
  if (!("speechSynthesis" in window)) return;
  availableVoices = window.speechSynthesis.getVoices();
}

function englishVoices() {
  return availableVoices.filter(v => {
    const lang = (v.lang || "").toLowerCase();
    return lang.startsWith("en-us") || lang.startsWith("en-gb") || lang.startsWith("en");
  });
}

function bestEnglishVoice() {
  const voices = englishVoices();
  if (!voices.length) return null;

  return (
    voices.find(v => (v.lang || "").toLowerCase().startsWith("en-us")) ||
    voices.find(v => (v.lang || "").toLowerCase().startsWith("en-gb")) ||
    voices[0]
  );
}

function voiceMatchesHint(voice, selectedVoiceType) {
  const name = (voice.name || "").toLowerCase();

  if (selectedVoiceType === "male") {
    return ["male", "man", "david", "guy", "daniel", "james", "mark", "tom", "john", "matthew", "michael", "george"].some(hint => name.includes(hint));
  }

  if (selectedVoiceType === "female") {
    return ["female", "woman", "zira", "susan", "samantha", "jenny", "anna", "victoria", "emma", "kate", "sara", "aria"].some(hint => name.includes(hint));
  }

  return false;
}

function selectedEnglishVoice() {
  const voices = englishVoices();
  if (!voices.length) return null;

  if (ttsSettings.voice === "male" || ttsSettings.voice === "female") {
    const hinted = voices.find(v => voiceMatchesHint(v, ttsSettings.voice));
    if (hinted) return hinted;
  }

  return bestEnglishVoice();
}

function normalizeTtsSettings(rawSettings = {}) {
  const voice = ["auto", "male", "female"].includes(rawSettings.voice)
    ? rawSettings.voice
    : DEFAULT_TTS_SETTINGS.voice;

  const rate = [0.8, 1, 1.2].includes(Number(rawSettings.rate))
    ? Number(rawSettings.rate)
    : DEFAULT_TTS_SETTINGS.rate;

  return { voice, rate };
}

function loadTtsSettings() {
  try {
    const raw = localStorage.getItem(TTS_SETTINGS_KEY);
    if (!raw) {
      ttsSettings = { ...DEFAULT_TTS_SETTINGS };
      return;
    }

    ttsSettings = normalizeTtsSettings(JSON.parse(raw));
  } catch (error) {
    ttsSettings = { ...DEFAULT_TTS_SETTINGS };
  }
}

function persistTtsSettings() {
  localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(ttsSettings));
}

function updateTtsControlState() {
  voiceOptionButtons.forEach(btn => {
    const isActive = btn.dataset.voice === ttsSettings.voice;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  rateOptionButtons.forEach(btn => {
    const isActive = Number(btn.dataset.rate) === ttsSettings.rate;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
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

  const selectedVoice = selectedEnglishVoice();
  utterance.lang = selectedVoice && selectedVoice.lang
    ? selectedVoice.lang
    : "en-US";
  utterance.rate = ttsSettings.rate;

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
    playCorrectSound();
  } else {
    buttonEl.classList.add("wrong");
    resultEl.textContent = `❌ Буруу! Зөв нь: ${correct}`;
    resultEl.classList.add("bad");
    playWrongSound();
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
loadTtsSettings();
updateTtsControlState();
loadSoundSettings();
updateSoundToggleState();

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

voiceOptionButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    ttsSettings.voice = btn.dataset.voice;
    updateTtsControlState();
    persistTtsSettings();
  });
});

rateOptionButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    ttsSettings.rate = Number(btn.dataset.rate);
    updateTtsControlState();
    persistTtsSettings();
  });
});

if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    updateSoundToggleState();
    persistSoundSettings();
  });
}

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
