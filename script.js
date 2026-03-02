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
const statusXpEl = document.getElementById("status-xp");
const statusStreakEl = document.getElementById("status-streak");
const statusTodayEl = document.getElementById("status-today");
const statusRewardEl = document.getElementById("status-reward");
const completionBannerEl = document.getElementById("completion-banner");
const completionBannerTextEl = completionBannerEl ? completionBannerEl.querySelector(".banner-text") : null;
const DEFAULT_COMPLETION_TEXT = "Алтан цагаа боловсролдоо зориулсан танд баярлалаа. Өдөр тутмын дадал “Амжилтын үндэс” шүү. Танд улам их амжилт хүсье.";
const DAILY_GOAL_COMPLETION_TEXT = "Өнөөдөр чиний хийсэн ганцхан цагийн дадлага бүр нэгдсээр далай мэт мэдлэгийг бий болгодог. Гэрэлт ирээдүйгээ бүтээж байгаа чамд улам их амжилт хүсье. Шинэ зууны иргэн танд урт холын аялалдаа гарч байгаад баярлалаа.";

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
const PROGRESS_SETTINGS_KEY = "nomadspeak:progress:v1";
const DEFAULT_DAILY_GOAL = 10;
const DAILY_GOAL_SETTINGS_KEY = "nomadspeak:daily-goal:v1";
const DEFAULT_TTS_SETTINGS = {
  voice: "auto",
  rate: 1,
};

let ttsSettings = { ...DEFAULT_TTS_SETTINGS };
let soundEnabled = true;
let audioContext = null;
let completionBannerTimer = null;
let progressState = {
  xp: 0,
  streak: 0,
  lastCompletionDate: "",
  todayDate: "",
  todayProgress: 0,
  dailySession: {
    date: "",
    dailyCount: DEFAULT_DAILY_GOAL,
    currentIndex: -1,
    answeredCount: 0,
    completed: false,
  },
};

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

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function previousDayKey(dayKey) {
  if (!dayKey) return "";
  const dt = new Date(`${dayKey}T00:00:00`);
  dt.setDate(dt.getDate() - 1);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function rewardForStreak(streak) {
  if (streak >= 30) return "💎 Бриллиант";
  if (streak >= 7) return "🏆 Алтан цом";
  return "⭐ Таван хошуу";
}

function getDailyGoalCount() {
  const raw = localStorage.getItem(DAILY_GOAL_SETTINGS_KEY);
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  return DEFAULT_DAILY_GOAL;
}

function normalizeProgressState(raw = {}) {
  const configuredDailyGoal = getDailyGoalCount();
  const xpCandidate = raw.xp ?? raw.totalXp ?? raw.totalXP ?? raw.points;
  const streakCandidate = raw.streak ?? raw.streakDays ?? raw.streakCount;
  const todayProgressCandidate = raw.todayProgress ?? raw.todayCount ?? raw.dailyProgress;
  const lastCompletionDateCandidate = raw.lastCompletionDate ?? raw.lastCompletedDate;
  const todayDateCandidate = raw.todayDate ?? raw.currentDate;
  const sessionRaw = raw.dailySession || {};
  const sessionDailyCountCandidate = sessionRaw.dailyCount ?? raw.dailyCount ?? configuredDailyGoal;

  return {
    xp: Number.isFinite(Number(xpCandidate)) ? Math.max(0, Number(xpCandidate)) : 0,
    streak: Number.isFinite(Number(streakCandidate)) ? Math.max(0, Number(streakCandidate)) : 0,
    lastCompletionDate: typeof lastCompletionDateCandidate === "string" ? lastCompletionDateCandidate : "",
    todayDate: typeof todayDateCandidate === "string" ? todayDateCandidate : "",
    todayProgress: Number.isFinite(Number(todayProgressCandidate))
      ? Math.max(0, Math.min(configuredDailyGoal, Number(todayProgressCandidate)))
      : 0,
    dailySession: {
      date: typeof sessionRaw.date === "string" ? sessionRaw.date : "",
      dailyCount: Number.isFinite(Number(sessionDailyCountCandidate))
        ? Math.max(1, Math.floor(Number(sessionDailyCountCandidate)))
        : configuredDailyGoal,
      currentIndex: Number.isFinite(Number(sessionRaw.currentIndex)) ? Number(sessionRaw.currentIndex) : -1,
      answeredCount: Number.isFinite(Number(sessionRaw.answeredCount))
        ? Math.max(0, Number(sessionRaw.answeredCount))
        : 0,
      completed: Boolean(sessionRaw.completed),
    },
  };
}

function syncDailyProgressDate() {
  const today = todayKey();
  if (progressState.todayDate !== today) {
    progressState.todayDate = today;
    progressState.todayProgress = 0;
  }

  if (!progressState.dailySession || progressState.dailySession.date !== today) {
    progressState.dailySession = {
      date: today,
      dailyCount: getDailyGoalCount(),
      currentIndex: -1,
      answeredCount: progressState.todayProgress,
      completed: progressState.todayProgress >= getDailyGoalCount(),
    };
  }
}

function persistProgressState() {
  localStorage.setItem(PROGRESS_SETTINGS_KEY, JSON.stringify(progressState));
}

function loadProgressState() {
  try {
    const raw = localStorage.getItem(PROGRESS_SETTINGS_KEY);
    progressState = raw ? normalizeProgressState(JSON.parse(raw)) : normalizeProgressState();
  } catch (error) {
    progressState = normalizeProgressState();
  }

  syncDailyProgressDate();
}

function updateHeaderStatus() {
  loadProgressState();
  syncDailyProgressDate();
  statusXpEl.textContent = `⭐ XP: ${progressState.xp}`;
  statusStreakEl.textContent = `🔥 Цуврал: ${progressState.streak} өдөр`;
  statusTodayEl.textContent = `📅 Өнөөдөр: ${progressState.todayProgress}/${progressState.dailySession.dailyCount}`;
  statusRewardEl.textContent = rewardForStreak(progressState.streak);
}

function incrementTodayProgress() {
  syncDailyProgressDate();
  if (progressState.todayProgress < progressState.dailySession.dailyCount) {
    progressState.todayProgress += 1;
  }
}

function updateDailySessionProgress() {
  syncDailyProgressDate();
  progressState.dailySession.currentIndex = currentIndex;
  progressState.dailySession.answeredCount = Math.min(
    progressState.dailySession.dailyCount,
    progressState.todayProgress
  );
  progressState.dailySession.completed =
    progressState.dailySession.completed ||
    progressState.todayProgress >= progressState.dailySession.dailyCount ||
    (
      progressState.dailySession.currentIndex >= progressState.dailySession.dailyCount - 1 &&
      progressState.dailySession.answeredCount === progressState.dailySession.dailyCount
    );
}

function isDailySessionCompletedToday() {
  const session = progressState.dailySession;
  if (!session) return false;
  const isToday = session.date === todayKey();
  if (!isToday) return false;

  return session.completed || (
    session.currentIndex >= session.dailyCount - 1 &&
    session.answeredCount === session.dailyCount
  );
}

function markDailyCompletion() {
  const today = todayKey();
  if (progressState.lastCompletionDate === today) return;

  const yesterday = previousDayKey(today);
  progressState.streak = progressState.lastCompletionDate === yesterday
    ? progressState.streak + 1
    : 1;
  progressState.lastCompletionDate = today;
}

function clearBannerEffects() {
  if (!completionBannerEl) return;
  const effectsLayer = completionBannerEl.querySelector(".banner-effects");
  if (effectsLayer) {
    effectsLayer.innerHTML = "";
  }
}

function createParticle(layer, className, color, x, y, vars = {}) {
  const particle = document.createElement("span");
  particle.className = className;
  particle.style.setProperty("--particle-color", color);
  particle.style.setProperty("--x", `${x}px`);
  particle.style.setProperty("--y", `${y}px`);
  Object.entries(vars).forEach(([key, value]) => {
    particle.style.setProperty(key, value);
  });
  layer.appendChild(particle);
  particle.addEventListener("animationend", () => particle.remove(), { once: true });
}

function spawnBannerStars() {
  if (!completionBannerEl) return;
  const effectsLayer = completionBannerEl.querySelector(".banner-effects");
  if (!effectsLayer) return;

  const colors = ["#ff4f57", "#ffd54d", "#76ff8b", "#ffffff", "#ffd54d", "#ffffff"];
  const width = completionBannerEl.clientWidth;
  const height = completionBannerEl.clientHeight;
  const count = 30;

  const edgePoint = () => {
    const side = Math.floor(Math.random() * 4);
    const inset = 10;
    if (side === 0) return { x: inset + Math.random() * Math.max(10, width - inset * 2), y: 0, nx: 0, ny: -1 };
    if (side === 1) return { x: width, y: inset + Math.random() * Math.max(10, height - inset * 2), nx: 1, ny: 0 };
    if (side === 2) return { x: inset + Math.random() * Math.max(10, width - inset * 2), y: height, nx: 0, ny: 1 };
    return { x: 0, y: inset + Math.random() * Math.max(10, height - inset * 2), nx: -1, ny: 0 };
  };

  for (let i = 0; i < count; i += 1) {
    const origin = edgePoint();
    const spread = (Math.random() - 0.5) * 0.8;
    const tangentX = -origin.ny;
    const tangentY = origin.nx;
    const burst = 16 + Math.random() * 20;
    const drift = (Math.random() - 0.5) * 8;
    const duration = 780 + Math.random() * 620;

    createParticle(effectsLayer, "banner-star", colors[i % colors.length], origin.x, origin.y, {
      "--dx": `${origin.nx * burst + tangentX * spread * 14 + drift}px`,
      "--dy": `${origin.ny * burst + tangentY * spread * 14 + drift}px`,
      "--size": `${3 + Math.random() * 3}px`,
      "--duration": `${duration}ms`,
    });
  }
}

function spawnDailyGoalEffects() {
  if (!completionBannerEl) return;
  const effectsLayer = completionBannerEl.querySelector(".banner-effects");
  if (!effectsLayer) return;

  const confettiColors = ["#f8e083", "#f7c944", "#ffeb99", "#f5d878"];
  const width = completionBannerEl.clientWidth;

  for (let i = 0; i < 36; i += 1) {
    createParticle(
      effectsLayer,
      "banner-confetti",
      confettiColors[i % confettiColors.length],
      12 + Math.random() * (width - 24),
      -10,
      {
        "--drift": `${(Math.random() * 2 - 1) * 40}px`,
        "--fall": `${34 + Math.random() * 46}px`,
        "--delay": `${Math.random() * 200}ms`,
      }
    );
  }

  const shine = document.createElement("span");
  shine.className = "banner-shine";
  effectsLayer.appendChild(shine);
  shine.addEventListener("animationend", () => shine.remove(), { once: true });
}

function showCompletionBanner(showDailyGoalUpgrade = false) {
  if (!completionBannerEl) return;

  const bannerText = showDailyGoalUpgrade
    ? DAILY_GOAL_COMPLETION_TEXT
    : DEFAULT_COMPLETION_TEXT;

  if (completionBannerTextEl) {
    completionBannerTextEl.textContent = bannerText;
  }
  completionBannerEl.classList.toggle("premium", showDailyGoalUpgrade);

  completionBannerEl.classList.remove("hidden", "showing");
  void completionBannerEl.offsetWidth;
  completionBannerEl.classList.add("showing");
  clearBannerEffects();
  spawnBannerStars();
  speakBannerText(bannerText);
  if (showDailyGoalUpgrade) {
    playDailyVictoryChime();
  } else {
    playCompletionBannerSound();
  }

  if (completionBannerTimer) clearTimeout(completionBannerTimer);

  completionBannerTimer = setTimeout(() => {
    completionBannerEl.classList.remove("showing");
    clearBannerEffects();
    setTimeout(() => {
      completionBannerEl.classList.add("hidden");
      completionBannerEl.classList.remove("premium");
      if (completionBannerTextEl) completionBannerTextEl.textContent = DEFAULT_COMPLETION_TEXT;
    }, 450);
  }, 10000);
}

function playCompletionBannerSound() {
  if (!soundEnabled) return;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      playTone({
        frequency,
        type: "sine",
        duration: 0.11,
        volume: 0.08,
        attack: 0.01,
        release: 0.1,
      });
    }, index * 120);
  });
}

function playDailyVictoryChime() {
  if (!soundEnabled) return;
  const notes = [587.33, 783.99, 987.77, 1174.66];
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      playTone({
        frequency,
        type: "triangle",
        duration: 0.1,
        volume: 0.05,
        attack: 0.005,
        release: 0.11,
      });
    }, index * 130);
  });
}


function mongolianVoice() {
  const voices = (availableVoices || []).filter(v => (v.lang || "").toLowerCase().startsWith("mn"));
  if (!voices.length) return null;

  const femaleHints = ["female", "woman", "эм", "эмэгтэй", "girl", "bolorma", "saraa", "anu", "naraa"];
  const femaleVoice = voices.find(v => {
    const name = (v.name || "").toLowerCase();
    return femaleHints.some(hint => name.includes(hint));
  });

  return femaleVoice || voices[0];
}

function speakBannerText(text) {
  if (!soundEnabled) return;
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const mnVoice = mongolianVoice();
  if (!mnVoice) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = mnVoice.lang || "mn-MN";
  utterance.voice = mnVoice;
  utterance.rate = 0.88;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
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

  updateHeaderStatus();
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
  syncDailyProgressDate();
  progressState.dailySession = {
    date: todayKey(),
    dailyCount: getDailyGoalCount(),
    currentIndex: -1,
    answeredCount: Math.min(getDailyGoalCount(), progressState.todayProgress),
    completed: false,
  };
  persistProgressState();

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
  updateHeaderStatus();
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

  incrementTodayProgress();
  updateDailySessionProgress();

  if (selected === correct) {
    score += 1;
    progressState.xp += 1;
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
  persistProgressState();
  updateHeaderStatus();
}

function nextQuestion() {
  currentIndex += 1;
  updateHeaderStatus();
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

  updateDailySessionProgress();
  const completedDailyGoalSession = isDailySessionCompletedToday();
  showCompletionBanner(completedDailyGoalSession);

  if (completedDailyGoalSession) {
    markDailyCompletion();
  }

  persistProgressState();
  updateHeaderStatus();
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
loadProgressState();
updateHeaderStatus();
persistProgressState();

levelButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    levelButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    level = btn.dataset.level;
    updateHeaderStatus();
  });
});

sentenceFilterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sentenceFilterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    sentenceFilter = btn.dataset.filter;
    stopSpeaking();
    renderSentences();
    updateHeaderStatus();
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
