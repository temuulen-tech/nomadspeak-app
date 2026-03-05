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
const sentenceGameScreen = document.getElementById("sentence-game-screen");
const qaGameScreen = document.getElementById("qa-game-screen");
const profileScreen = document.getElementById("profile-screen");
const endScreen = document.getElementById("end-screen");

const topbar = document.getElementById("topbar");
const levelLabel = document.getElementById("level-label");
const scoreEl = document.getElementById("score");
const progressEl = document.getElementById("progress");

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const resultEl = document.getElementById("result");

const startBtn = document.getElementById("start-btn");
const introToggleBtn = document.getElementById("intro-toggle-btn");
const introPanel = document.getElementById("intro-panel");
const introCloseBtn = document.getElementById("intro-close-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const backBtn = document.getElementById("back-btn");

const navHomeBtn = document.getElementById("nav-home-btn");
const navSentencesBtn = document.getElementById("nav-sentences-btn");
const navSentenceGameBtn = document.getElementById("nav-sentence-game-btn");
const navQaGameBtn = document.getElementById("nav-qa-game-btn");
const navStatsBtn = document.getElementById("nav-stats-btn");
const navProfileBtn = document.getElementById("nav-profile-btn");

const confirmOverlay = document.getElementById("confirm-overlay");
const confirmYesBtn = document.getElementById("confirm-yes-btn");
const confirmNoBtn = document.getElementById("confirm-no-btn");

const levelButtons = document.querySelectorAll(".level-btn");
const sentenceFilterButtons = document.querySelectorAll(".filter-btn");
const sentencesListEl = document.getElementById("sentences-list");
const voiceOptionButtons = document.querySelectorAll(".tts-option-btn[data-voice]");
const ttsRateSlider = document.getElementById("tts-rate-slider");
const ttsRateValueEl = document.getElementById("tts-rate-value");
const soundToggleButtons = document.querySelectorAll(".sound-toggle-btn");
const statusXpEl = document.getElementById("status-xp");
const statusStreakEl = document.getElementById("status-streak");
const statusTodayEl = document.getElementById("status-today");
const statusRewardEl = document.getElementById("status-reward");
const sentenceGameDropzoneEl = document.getElementById("sentence-game-dropzone");
const sentenceGamePoolEl = document.getElementById("sentence-game-pool");
const sentenceGameUndoBtn = document.getElementById("sentence-game-undo-btn");
const sentenceGameShowCorrectBtn = document.getElementById("sentence-game-show-correct-btn");
const sentenceGameRetryBtn = document.getElementById("sentence-game-retry-btn");
const sentenceGamePrevBtn = document.getElementById("sentence-game-prev-btn");
const sentenceGameNextBtn = document.getElementById("sentence-game-next-btn");
const sentenceGameFeedbackEl = document.getElementById("sentence-game-feedback");
const sentenceGameToastEl = document.getElementById("sentence-game-toast");
const sentenceGameCorrectPanelEl = document.getElementById("sentence-game-correct-panel");
const sentenceGameCorrectEnEl = document.getElementById("sentence-game-correct-en");
const sentenceGameCorrectMnEl = document.getElementById("sentence-game-correct-mn");
const sentenceGameTipToggleBtn = document.getElementById("sentence-game-tip-toggle-btn");
const sentenceGameTipPanelEl = document.getElementById("sentence-game-tip-panel");
const sentenceGameTipTextEl = document.getElementById("sentence-game-tip-text");
const sentenceGameTipSpeakBtn = document.getElementById("sentence-game-tip-speak-btn");
const sentenceGameTipStopBtn = document.getElementById("sentence-game-tip-stop-btn");
const sentenceGameTipReadBtn = document.getElementById("sentence-game-tip-read-btn");
const sentenceGameTipCloseRowEl = document.getElementById("sentence-game-tip-close-row");
const sentenceGameTipCloseBtn = document.getElementById("sentence-game-tip-close-btn");
const sentenceGameClimbEl = document.getElementById("sentence-game-climb");
const sentenceGameClimberEl = document.getElementById("sentence-game-climber");
const sentenceGameRewardIconEl = document.getElementById("sentence-game-reward-icon");
const sentenceGameRewardBannerEl = document.getElementById("sentence-game-reward-banner");
const sentenceGameRewardTimeEl = document.getElementById("sentence-game-active-time");
const sentenceGameRewardImageEls = document.querySelectorAll(".sentence-game-reward-image");
const sentenceGameDifficultyToggleBtn = document.getElementById("sentence-game-difficulty-toggle-btn");
const sentenceGameDifficultyPanelEl = document.getElementById("sentence-game-difficulty-panel");
const sentenceGameDifficultyButtons = document.querySelectorAll(".sentence-game-difficulty-btn");
const completionBannerEl = document.getElementById("completion-banner");
const completionBannerTextEl = completionBannerEl ? completionBannerEl.querySelector(".banner-text") : null;
const DEFAULT_COMPLETION_TEXT = "Алтан цагаа боловсролдоо зориулсан танд баярлалаа. Өдөр тутмын дадал “Амжилтын үндэс” шүү. Танд улам их амжилт хүсье.";
const DAILY_GOAL_COMPLETION_TEXT = "Өнөөдөр чиний хийсэн ганцхан цагийн дадлага бүр нэгдсээр далай мэт мэдлэгийг бий болгодог. Гэрэлт ирээдүйгээ бүтээж байгаа чамд улам их амжилт хүсье. Шинэ зууны иргэн танд урт холын аялалдаа гарч байгаад баярлалаа.";


const premiumOverlay = document.getElementById("premium-overlay");
const premiumTitleEl = document.getElementById("premium-title");
const premiumMessageEl = document.getElementById("premium-message");
const premiumOkBtn = document.getElementById("premium-ok-btn");
const upgradePremiumBtn = document.getElementById("upgrade-premium-btn");
const profileNameInput = document.getElementById("profile-name-input");
const profileNameSaved = document.getElementById("profile-name-saved");
const profileTotalXpEl = document.getElementById("profile-total-xp");
const profileLevelEl = document.getElementById("profile-level");
const profileStreakDaysEl = document.getElementById("profile-streak-days");
const profileDailyProgressEl = document.getElementById("profile-daily-progress");
const profileRewardStageEl = document.getElementById("profile-reward-stage");
const profilePlanStatusEl = document.getElementById("profile-plan-status");
const statsTotalXpEl = document.getElementById("stats-total-xp");
const statsLevelEl = document.getElementById("stats-level");
const statsStreakEl = document.getElementById("stats-streak");
const statsTodayProgressEl = document.getElementById("stats-today-progress");
const statsTodayMinutesEl = document.getElementById("stats-today-minutes");

const qaGameBackBtn = document.getElementById("qa-game-back-btn");
const qaRewardBarEl = document.getElementById("qa-reward-bar");
const qaTimerEl = document.getElementById("qa-timer");
const qaNextRewardEl = document.getElementById("qa-next-reward");
const sentencesRewardStripEl = document.getElementById("sentences-reward-strip");
const sentencesTimerEl = document.getElementById("sentences-timer");
const sentencesNextRewardEl = document.getElementById("sentences-next-reward");
const qaToastEl = document.getElementById("qa-toast");
const qaLevelSelectBtn = document.getElementById("qa-level-select-btn");
const qaLevelOptionsEl = document.getElementById("qa-level-options");
const qaLevelButtons = document.querySelectorAll("[data-qa-level]");
const qaRoundPanelEl = document.getElementById("qa-round-panel");
const qaToggleQuestionBtn = document.getElementById("qa-toggle-question-btn");
const qaToggleAnswerBtn = document.getElementById("qa-toggle-answer-btn");
const qaMnQuestionEl = document.getElementById("qa-mn-question");
const qaMnAnswerEl = document.getElementById("qa-mn-answer");
const qaEnQuestionWrap = document.getElementById("qa-en-question-wrap");
const qaEnAnswerWrap = document.getElementById("qa-en-answer-wrap");
const qaEnQuestionEl = document.getElementById("qa-en-question");
const qaEnAnswerEl = document.getElementById("qa-en-answer");
const qaQuestionLineEl = document.getElementById("qa-question-line");
const qaAnswerLineEl = document.getElementById("qa-answer-line");
const qaWordBankEl = document.getElementById("qa-word-bank");
const qaCheckBtn = document.getElementById("qa-check-btn");
const qaFeedbackEl = document.getElementById("qa-feedback");
const qaShowSentencesBtn = document.getElementById("qa-show-sentences-btn");
const qaShowHelpBtn = document.getElementById("qa-show-help-btn");
const qaModalEl = document.getElementById("qa-modal");
const qaModalTitleEl = document.getElementById("qa-modal-title");
const qaModalBodyEl = document.getElementById("qa-modal-body");
const qaModalCloseBtn = document.getElementById("qa-modal-close-btn");

const weeklyChartEl = document.getElementById("weekly-chart");
const statsRewardTierLabelEl = document.getElementById("stats-reward-tier-label");
const statsRewardImageEls = document.querySelectorAll(".stats-reward-image");
const statsResetBtn = document.getElementById("stats-reset-btn");
const installHintEl = document.getElementById("install-hint");
const installBtn = document.getElementById("install-btn");

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

let sentenceGameHistory = [];
let sentenceGameIndex = -1;
let sentenceGameTiles = [];
let sentenceGameBuilt = [];
let sentenceGameCompleted = false;
let sentenceGameXpAwarded = false;
let sentenceGameHintXpAwarded = false;
let sentenceGameUsedShowCorrect = false;
let sentenceGameCorrectVisible = false;
let draggingTileId = null;
let sentenceGameTipSpeaking = false;
let sentenceGameToastTimer = null;
let sentenceGameToastHideTimer = null;
let sentenceGameToastSpeechTimer = null;
let sentenceGameToastShownAt = 0;
let sentenceGameToastHideDeadline = 0;
let sentenceGameToastSpeechActive = false;
let sentenceGameSuccessAlreadyShownForThisSentence = false;
let sentenceGameSuccessToastLockUntil = 0;
let sentenceGameLastOutcomeForThisSentence = null;
let sentenceGameClimbLevel = 0;
let sentenceGameLastRenderedClimbLevel = 0;
let sentenceGamePeakPulseTimer = null;
let sentenceGameAttemptResolved = false;
let sentenceGameActiveSeconds = 0;
let sentenceGameRewardLevel = 0;
let sentenceGameLastActivityAt = 0;
let sentenceGameLastTick = 0;
let sentenceGameActiveTimer = null;
let sentenceGameRewardBannerTimer = null;
let sentenceGameDifficulty = "beginner";

const SENTENCE_GAME_TOAST_DURATION = 8000;
const SENTENCE_GAME_TOAST_SPEECH_END_BUFFER = 800;
const SENTENCE_GAME_TOAST_SPEECH_DELAY = 350;
const SENTENCE_GAME_TOAST_MAX_DURATION = 12000;
const SENTENCE_GAME_SUCCESS_TOAST_LOCK_MS = 1000;

const SENTENCE_GAME_CORRECT_TOAST = "Чи уулын оргилд гарлаа.";
const SENTENCE_GAME_INCORRECT_TOAST = "Өөө.. Гэхдээ зүгээрээ, Андаа.";
const SENTENCE_GAME_SHOW_CORRECT_TOAST = "Өөө.. Яагаад бэлэнчлээд байна аа, Андаа.";
const SENTENCE_GAME_DEBUG = false;
const SENTENCE_GAME_CLIMB_STORAGE_KEY = "sentenceGameClimbLevel";
const SENTENCE_GAME_ACTIVE_SECONDS_KEY = "sentenceGameActiveSeconds";
const SENTENCE_GAME_REWARD_LEVEL_KEY = "sentenceGameRewardLevel";
const SENTENCE_GAME_LAST_TICK_KEY = "sentenceGameLastTick";
const SENTENCE_GAME_DIFFICULTY_KEY = "sentenceGameDifficulty";
const SENTENCE_GAME_IDLE_TIMEOUT_SECONDS = 60;
const SENTENCE_GAME_DIFFICULTY_LABELS = {
  beginner: "Анхан шат",
  intermediate: "Дунд шат",
  advanced: "Дээд түвшин",
};
const SENTENCE_GAME_REWARD_THRESHOLDS = [1200, 1800, 3000, 3600, 5400];
const SENTENCE_GAME_REWARD_BANNERS = [
  "🏳️ Эхлэл амжилттай!",
  "⭐ Улаан одын Эзэн",
  "🪙 Алтан зоос Чинийх",
  "🏆 Алтан цомын Эзэн",
  "💎 Алмөөз эрдэнэ Чинийх",
];
const SENTENCE_GAME_CLIMB_POSITIONS = [
  { x: 14, y: 102 },
  { x: 62, y: 88 },
  { x: 138, y: 72 },
  { x: 208, y: 57 },
  { x: 286, y: 38 },
  { x: 362, y: 20 },
];

const SENTENCE_GAME_TIP_TEXT = "ТАЙЛБАР: Найзаа, чи тоглох явцдаа зөвхөн оноо авах, хөгжилдөхдөө  бус Өгүүлбэрийн бүтэцийг, үгс өнгөрсөн,одоо, ирээдүй цагуудад хэрхэн өөрчлөгдөж байгааг сайн ажиглаарай. Энэ нь, чиний өгүүлбэр зохиож ярьж сурахд тус болно шүү. Анхандаа маш богино энгийн асуулт, хариултууд бүтээж өөрөөсөө асууж өөртөө хариулаарай-ярилцах хүнтэй бол бүр сайн маш багаас л, эхлээрэй. Хэт их дүрэм уншиж сурах урам зоригоо бүү унтраа маш багаар хүнтэй ойлголцож эхлэх нь, урам өгч суралцах хүсэл бадараадаг. Тоглоом нь, чамайг ядаргаатай дүрэмүүдээс ангид өгүүлбэр зохиож, ярьж сургахад гол зорилго нь, байгаа шдэ… Мундагууд тийм төрдөггүй тэд өөрсдийгөө бүтээдэг шдэ. Чи ч, бас бүтээгээрэй.";

const QA_LONG_EXPLANATION_TEXT = "Энэ тоглоом нь асуулт, хариултын бүтэц дээр төвлөрч, англи өгүүлбэрийг зөв дарааллаар бодож бүтээх дадлыг хөгжүүлнэ. Та эхлээд ангиллаа сонгоод тоглоомоо эхлүүлнэ. Асуултын мөрийг зөв бүтээсний дараа л хариултын мөр нээгдэнэ. Ингэснээр та асуулт-хариултын логик дарааллыг бодитоор сурна. Үгийн сангийн chip-үүд дээр дарж мөр рүү оруулна, буцаахдаа мөр дээрх chip дээр дахин дарна. Зөв хариулт гарвал дараагийн тойрог руу шилжиж, хугацааны дагуу шагналууд нээгдэнэ. Хэрэв та төөрвөл англи асуулт, хариултыг харах товчоор түр харж болно. Тогтмол тоглосноор өгүүлбэр бүтээх хурд, хэлний мэдрэмж эрс сайжирна.";
const QA_REWARD_STEPS = [
  { icon: "🏳️", label: "Эхлэл амжилттай!", seconds: 20 * 60, image: "assets/rewards/1-flag.png", alt: "Q&A reward flag" },
  { icon: "⭐", label: "Улаан одын Эзэн", seconds: 30 * 60, image: "assets/rewards/2-star.png", alt: "Q&A reward star" },
  { icon: "🪙", label: "Алтан зоос Чинийх", seconds: 50 * 60, image: "assets/rewards/3-coin.png", alt: "Q&A reward coin" },
  { icon: "🏆", label: "Алтан цомын Эзэн", seconds: 60 * 60, image: "assets/rewards/4-trophy.png", alt: "Q&A reward trophy" },
  { icon: "💎", label: "Алмөөз эрдэнэ Чинийх", seconds: 90 * 60, image: "assets/rewards/5-diamond.png", alt: "Q&A reward diamond" },
];
const SENTENCES_REWARD_STEPS = [...QA_REWARD_STEPS];

const QA_WORD_BANK_BASE = ["I","China","from","?","arrived","Where","to","yesterday","did","you","are","come","Mongolia","from","I","When","in","you","am","China","?"];
const QA_ROUNDS = [
  { id: "A", mnQuestion: "Чи хаанаас ирсэн бэ ?", mnAnswer: "Би Монголоос ирсэн.", enQuestion: "Where are you from ?", enAnswer: "I am from Mongolia ." },
  { id: "B", mnQuestion: "Чи хэзээ ирсэн бэ ?", mnAnswer: "Би өчигдөр Хятадад ирсэн.", enQuestion: "When did you come to China ?", enAnswer: "I arrived in China yesterday ." },
];

let qaGameLevel = null;
let qaRoundPool = [];
let qaRoundIndex = 0;
let qaBank = [];
let qaQuestionBuilt = [];
let qaAnswerBuilt = [];
let qaQuestionSolved = false;
let qaElapsedSeconds = 0;
let qaUnlockedRewards = 0;
let qaTimerInterval = null;
let qaTimerStarted = false;
let qaToastTimer = null;
let sentencesElapsedSeconds = 0;
let sentencesUnlockedRewards = 0;
let sentencesTimerInterval = null;


const TTS_SETTINGS_KEY = "nomadspeak:tts:v1";
const LEGACY_TTS_RATE_KEY = "ttsRate";
const SOUND_SETTINGS_KEY = "soundEnabled";
const PROGRESS_SETTINGS_KEY = "nomadProgress";
const PROFILE_NAME_STORAGE_KEY = "nomadProfileName";
const PREMIUM_STORAGE_KEY = "isPremium";
const FREE_DAILY_XP_LIMIT = 10;
const DEFAULT_DAILY_GOAL = 10;
const DEFAULT_TTS_SETTINGS = {
  voice: "auto",
  rate: 0.85,
};

let ttsSettings = { ...DEFAULT_TTS_SETTINGS };
let soundEnabled = true;
let audioContext = null;
let audioPrimed = false;
let completionBannerTimer = null;
let isPremium = false;
let profileName = "";

let progressState = {
  xp: 35,
  level: 1,
  streak: 1,
  lastActiveDate: null,
  lastStatsDate: null,
  dailyGoalXP: DEFAULT_DAILY_GOAL,
  dailyGoalCount: 10,
  todayCount: 2,
  todayMinutes: 8,
  todaySecondsRemainder: 0,
  weeklyMinutes: [12, 18, 9, 16, 20, 11, 8],
  rewardTierUnlocked: 1,
  xpTotal: 35,
  streakDays: 1,
  dailyXP: 0,
  dailyCompleted: false,
};


let deferredInstallPrompt = null;

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // silent fail in unsupported/private contexts
    });
  });
}

function updateInstallHintVisibility() {
  if (!installHintEl) return;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (standalone) {
    hide(installHintEl);
    return;
  }

  if (deferredInstallPrompt) {
    show(installHintEl);
  } else {
    hide(installHintEl);
  }
}

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

function tokenizeSentence(sentence = "") {
  const tokens = sentence.match(/[A-Za-z0-9']+|[^\sA-Za-z0-9']/g);
  return tokens ? tokens.filter(Boolean) : [];
}

function levelName(lv) {
  if (lv === "beginner") return "Анхан";
  if (lv === "intermediate") return "Дунд";
  return "Дээд";
}

function getTodayKey() {
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

function normalizeProgressState(raw = {}) {
  const configuredDailyGoal = Number.isFinite(Number(raw.dailyGoalXP)) && Number(raw.dailyGoalXP) > 0
    ? Math.floor(Number(raw.dailyGoalXP))
    : DEFAULT_DAILY_GOAL;
  const xp = Number.isFinite(Number(raw.xp))
    ? Math.max(0, Math.floor(Number(raw.xp)))
    : (Number.isFinite(Number(raw.xpTotal)) ? Math.max(0, Math.floor(Number(raw.xpTotal))) : 35);
  const streak = Number.isFinite(Number(raw.streak))
    ? Math.max(0, Math.floor(Number(raw.streak)))
    : (Number.isFinite(Number(raw.streakDays)) ? Math.max(0, Math.floor(Number(raw.streakDays))) : 1);
  const todayCount = Number.isFinite(Number(raw.todayCount)) ? Math.max(0, Math.floor(Number(raw.todayCount))) : 2;
  const todayMinutes = Number.isFinite(Number(raw.todayMinutes)) ? Math.max(0, Math.floor(Number(raw.todayMinutes))) : 8;
  const todaySecondsRemainder = Number.isFinite(Number(raw.todaySecondsRemainder)) ? Math.max(0, Math.floor(Number(raw.todaySecondsRemainder))) : 0;
  const weeklyRaw = Array.isArray(raw.weeklyMinutes) ? raw.weeklyMinutes : [];
  const weeklyMinutes = Array.from({ length: 7 }, (_, index) => {
    const source = weeklyRaw[index];
    const fallback = [12, 18, 9, 16, 20, 11, todayMinutes][index];
    return Number.isFinite(Number(source)) ? Math.max(0, Math.floor(Number(source))) : fallback;
  });
  const rewardTierUnlocked = Number.isFinite(Number(raw.rewardTierUnlocked)) ? Math.max(1, Math.min(5, Math.floor(Number(raw.rewardTierUnlocked)))) : 1;
  const level = Math.floor(xp / 100) + 1;
  return {
    xp,
    level,
    streak,
    lastActiveDate: typeof raw.lastActiveDate === "string" ? raw.lastActiveDate : null,
    lastStatsDate: typeof raw.lastStatsDate === "string" ? raw.lastStatsDate : null,
    dailyGoalXP: configuredDailyGoal,
    dailyGoalCount: Number.isFinite(Number(raw.dailyGoalCount)) && Number(raw.dailyGoalCount) > 0 ? Math.floor(Number(raw.dailyGoalCount)) : 10,
    todayCount,
    todayMinutes,
    todaySecondsRemainder,
    weeklyMinutes,
    rewardTierUnlocked,
    xpTotal: xp,
    streakDays: streak,
    dailyXP: Number.isFinite(Number(raw.dailyXP)) ? Math.max(0, Number(raw.dailyXP)) : 0,
    dailyCompleted: Boolean(raw.dailyCompleted),
  };
}

function syncProgressForToday() {
  const today = getTodayKey();
  const lastStatsDate = progressState.lastStatsDate || progressState.lastActiveDate;
  if (!lastStatsDate || lastStatsDate === today) return;
  const yesterday = previousDayKey(today);
  if (progressState.lastActiveDate !== yesterday) {
    progressState.streak = 0;
    progressState.streakDays = 0;
  }
  const weekly = Array.isArray(progressState.weeklyMinutes) ? progressState.weeklyMinutes.slice(-7) : [0, 0, 0, 0, 0, 0, 0];
  while (weekly.length < 7) weekly.unshift(0);
  weekly.shift();
  weekly.push(Math.max(0, Math.floor(progressState.todayMinutes || 0)));
  progressState.weeklyMinutes = weekly;
  progressState.todayCount = 0;
  progressState.todayMinutes = 0;
  progressState.todaySecondsRemainder = 0;
  progressState.dailyXP = 0;
  progressState.dailyCompleted = false;
  progressState.lastStatsDate = today;
}

function persistProgressState() {
  progressState.xpTotal = progressState.xp;
  progressState.streakDays = progressState.streak;
  progressState.level = Math.floor(progressState.xp / 100) + 1;
  if (Array.isArray(progressState.weeklyMinutes) && progressState.weeklyMinutes.length) {
    progressState.weeklyMinutes[progressState.weeklyMinutes.length - 1] = Math.max(0, Math.floor(progressState.todayMinutes || 0));
  }
  localStorage.setItem(PROGRESS_SETTINGS_KEY, JSON.stringify(progressState));
}

function loadProgressState() {
  try {
    const raw = localStorage.getItem(PROGRESS_SETTINGS_KEY);
    progressState = raw ? normalizeProgressState(JSON.parse(raw)) : normalizeProgressState();
  } catch (error) {
    progressState = normalizeProgressState();
  }

  syncProgressForToday();
}

function loadPremiumStatus() {
  try {
    isPremium = localStorage.getItem(PREMIUM_STORAGE_KEY) === "true";
  } catch (error) {
    isPremium = false;
  }
}

function persistPremiumStatus() {
  localStorage.setItem(PREMIUM_STORAGE_KEY, isPremium ? "true" : "false");
}

function loadProfileName() {
  try {
    profileName = (localStorage.getItem(PROFILE_NAME_STORAGE_KEY) || "").trim();
  } catch (error) {
    profileName = "";
  }
}

function persistProfileName() {
  localStorage.setItem(PROFILE_NAME_STORAGE_KEY, profileName);
}

function openPremiumModal(message, title = "Premium") {
  if (!premiumOverlay || !premiumMessageEl) return;
  premiumTitleEl.textContent = title;
  premiumMessageEl.textContent = message;
  show(premiumOverlay);
}

function closePremiumModal() {
  if (!premiumOverlay) return;
  hide(premiumOverlay);
}

function canEarnMoreSentenceGameXp(amount = 0) {
  if (isPremium) return true;
  loadProgressState();
  syncProgressForToday();
  return progressState.dailyXP + amount <= FREE_DAILY_XP_LIMIT;
}

function enforceFreeXpGate() {
  if (isPremium) return false;
  loadProgressState();
  syncProgressForToday();
  if (progressState.dailyXP >= FREE_DAILY_XP_LIMIT) {
    openPremiumModal("Premium авахад хязгааргүй болно", "Free хязгаар хүрлээ");
    return true;
  }
  return false;
}

function updateProfileUI() {
  loadProgressState();
  syncProgressForToday();
  if (profileNameInput) profileNameInput.value = profileName;
  if (profileNameSaved) profileNameSaved.textContent = `Хадгалагдсан нэр: ${profileName || "—"}`;
  if (profileTotalXpEl) profileTotalXpEl.textContent = String(progressState.xp);
  if (profileLevelEl) profileLevelEl.textContent = String(progressState.level);
  if (profileStreakDaysEl) profileStreakDaysEl.textContent = `${progressState.streak} өдөр`;
  if (profileDailyProgressEl) profileDailyProgressEl.textContent = `${progressState.todayCount}/${progressState.dailyGoalCount}`;
  if (profileRewardStageEl) profileRewardStageEl.textContent = `Tier ${progressState.rewardTierUnlocked}`;
  if (profilePlanStatusEl) profilePlanStatusEl.textContent = `Төлөв: ${isPremium ? "Premium" : "Free"}`;
}

function playDailyGoalSuccessChime() {
  if (!soundEnabled) return;
  [988, 1319].forEach((frequency, index) => {
    setTimeout(() => {
      playTone({ frequency, type: "triangle", duration: 0.08, volume: 0.09, attack: 0.006, release: 0.08 });
    }, index * 90);
  });
}

function awardXP(amount, reason = "") {
  const earned = Number(amount);
  if (!Number.isFinite(earned) || earned <= 0) return;

  if (reason.startsWith("sentence_game") && !canEarnMoreSentenceGameXp(earned)) {
    openPremiumModal("Premium авахад хязгааргүй болно", "Free хязгаар хүрлээ");
    return;
  }

  loadProgressState();
  syncProgressForToday();

  const today = getTodayKey();
  const yesterday = previousDayKey(today);
  const firstActivityToday = progressState.lastActiveDate !== today;

  progressState.xp += earned;
  progressState.xpTotal = progressState.xp;
  progressState.dailyXP += earned;
  progressState.level = Math.floor(progressState.xp / 100) + 1;

  const wasDailyCompleted = progressState.dailyCompleted;
  if (progressState.dailyXP >= progressState.dailyGoalXP) {
    progressState.dailyCompleted = true;
    if (!wasDailyCompleted) playDailyGoalSuccessChime();
  }

  if (firstActivityToday) {
    progressState.streak = progressState.lastActiveDate === yesterday
      ? progressState.streak + 1
      : 1;
    progressState.streakDays = progressState.streak;
  }

  if (reason === "sentence_game_success") {
    progressState.todayCount += 1;
  }

  if (reason.startsWith("sentence_game")) {
    const rewardFromTime = sentenceGameRewardLevelFromSeconds((progressState.todayMinutes || 0) * 60);
    progressState.rewardTierUnlocked = Math.max(progressState.rewardTierUnlocked || 1, rewardFromTime || 1);
  }

  progressState.lastActiveDate = today;
  progressState.lastStatsDate = today;
  persistProgressState();
  updateHeaderStatus();
  updateStatsUI();

  if (SENTENCE_GAME_DEBUG) {
    console.log("[Progress] awardXP", { amount: earned, reason, ...progressState });
  }
}

function formatLast7DayLabels() {
  const names = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
  return Array.from({ length: 7 }, (_, index) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (6 - index));
    return names[dt.getDay()];
  });
}

function formatStudyMinutes(totalMinutes) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  if (safeMinutes < 60) return `${safeMinutes} мин`;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours} цаг ${minutes} мин`;
}

function updateStatsUI() {
  loadProgressState();
  syncProgressForToday();

  if (statsTotalXpEl) statsTotalXpEl.textContent = String(progressState.xp);
  if (statsLevelEl) statsLevelEl.textContent = `Lv.${progressState.level}`;
  if (statsStreakEl) statsStreakEl.textContent = `${progressState.streak} өдөр`;
  if (statsTodayProgressEl) statsTodayProgressEl.textContent = `${progressState.todayCount}/${progressState.dailyGoalCount}`;
  if (statsTodayMinutesEl) statsTodayMinutesEl.textContent = formatStudyMinutes(progressState.todayMinutes);
  if (statsRewardTierLabelEl) statsRewardTierLabelEl.textContent = `Одоогийн түвшин: ${progressState.rewardTierUnlocked}`;

  statsRewardImageEls.forEach((imgEl) => {
    const tier = Number(imgEl.dataset.tier || 0);
    imgEl.classList.toggle("active", tier === progressState.rewardTierUnlocked);
  });

  if (weeklyChartEl) {
    const labels = formatLast7DayLabels();
    const values = Array.isArray(progressState.weeklyMinutes) ? progressState.weeklyMinutes.slice(-7) : [0, 0, 0, 0, 0, 0, 0];
    const max = Math.max(1, ...values);
    weeklyChartEl.innerHTML = values.map((value, index) => {
      const height = Math.max(8, Math.round((value / max) * 100));
      return `<div class="weekly-bar-wrap"><div class="weekly-bar" style="height:${height}%"></div><span class="weekly-value">${value}</span><span class="weekly-label">${labels[index]}</span></div>`;
    }).join("");
  }

  persistProgressState();
}

function resetStatistics() {
  progressState = normalizeProgressState({
    xp: 0,
    streak: 0,
    todayCount: 0,
    todayMinutes: 0,
    weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
    rewardTierUnlocked: 1,
    dailyGoalCount: 10,
    dailyGoalXP: DEFAULT_DAILY_GOAL,
    dailyXP: 0,
    lastActiveDate: null,
    lastStatsDate: getTodayKey(),
  });
  persistProgressState();
  updateHeaderStatus();
  updateProfileUI();
  updateStatsUI();
}

function updateHeaderStatus() {
  loadProgressState();
  syncProgressForToday();
  statusXpEl.textContent = `⭐ XP: ${progressState.xp}`;
  statusStreakEl.textContent = `🔥 Цуврал: ${progressState.streak} өдөр`;
  statusTodayEl.textContent = `📅 Өнөөдөр: ${progressState.todayCount}/${progressState.dailyGoalCount}`;
  statusRewardEl.textContent = `Lv.${progressState.level} • Tier ${progressState.rewardTierUnlocked}`;
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

function toastSpeechText(message = "") {
  return String(message || "").replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
}

function toastTypeFromMessage(message = "") {
  if (message === SENTENCE_GAME_CORRECT_TOAST) return "success";
  if (message === SENTENCE_GAME_INCORRECT_TOAST) return "fail";
  if (message === SENTENCE_GAME_SHOW_CORRECT_TOAST) return "hint";
  return "unknown";
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
  utterance.rate = ttsSettings.rate;
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
  const wasSentenceGameVisible = sentenceGameScreenVisible();
  const wasQaGameVisible = qaGameScreen && !qaGameScreen.classList.contains("hidden");
  const wasSentencesVisible = sentencesScreen && !sentencesScreen.classList.contains("hidden");

  hide(startScreen);
  hide(quizScreen);
  hide(sentencesScreen);
  hide(sentenceGameScreen);
  hide(qaGameScreen);
  hide(statsScreen);
  hide(profileScreen);
  hide(endScreen);
  show(screen);

  if (screen === quizScreen) {
    show(topbar);
  } else {
    hide(topbar);
  }

  if (screen === profileScreen) {
    updateProfileUI();
  }

  if (screen === sentenceGameScreen && !wasSentenceGameVisible) {
    beginSentenceGameSession();
  }

  if (screen !== sentenceGameScreen && wasSentenceGameVisible) {
    endSentenceGameSession();
  }

  if (screen !== qaGameScreen && wasQaGameVisible) {
    stopQaTimer();
  }

  if (screen === sentencesScreen && !wasSentencesVisible) {
    startSentencesTimer();
  }

  if (screen !== sentencesScreen && wasSentencesVisible) {
    stopSentencesTimer();
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
    hideStartIntroPanel();
    showScreen(startScreen);
  }

  if (destination === "sentences") {
    stopSpeaking();
    showScreen(sentencesScreen);
  }

  if (destination === "sentence-game") {
    stopSpeaking();
    showScreen(sentenceGameScreen);
    initSentenceGameRound();
    enforceFreeXpGate();
  }

  if (destination === "qa-game") {
    stopSpeaking();
    showScreen(qaGameScreen);
    resetQaGameScreen();
  }

  if (destination === "stats") {
    stopSpeaking();
    showScreen(statsScreen);
    updateStatsUI();
  }

  if (destination === "profile") {
    stopSpeaking();
    showScreen(profileScreen);
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

function hideStartIntroPanel() {
  if (!introPanel || !introToggleBtn) return;
  hide(introPanel);
  introToggleBtn.setAttribute("aria-expanded", "false");
}

function toggleStartIntroPanel() {
  if (!introPanel || !introToggleBtn) return;
  const willOpen = introPanel.classList.contains("hidden");
  introPanel.classList.toggle("hidden", !willOpen);
  introToggleBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
}


function loadSoundSettings() {
  try {
    const raw = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (raw === null) {
      soundEnabled = true;
      return;
    }

    soundEnabled = raw === "true" || raw === "on";
  } catch (error) {
    soundEnabled = true;
  }
}

function persistSoundSettings() {
  localStorage.setItem(SOUND_SETTINGS_KEY, soundEnabled ? "true" : "false");
}

function updateSoundToggleState() {
  soundToggleButtons.forEach(toggleBtn => {
    toggleBtn.textContent = soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
    toggleBtn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
  });
}

function getAudioContext() {
  if (!(window.AudioContext || window.webkitAudioContext)) return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

function primeAudioContext() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

function ensureAudioUnlocked() {
  if (audioPrimed) return;
  audioPrimed = true;

  const unlock = () => {
    primeAudioContext();
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };

  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
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

function playSuccessSound() {
  playTone({ frequency: 880, type: "sine", duration: 0.08, volume: 0.12, attack: 0.004, release: 0.06 });
  setTimeout(() => {
    playTone({ frequency: 1320, type: "sine", duration: 0.09, volume: 0.1, attack: 0.004, release: 0.07 });
  }, 55);
}

function playErrorSound() {
  playTone({ frequency: 190, type: "sawtooth", duration: 0.1, volume: 0.11, attack: 0.002, release: 0.08 });
  setTimeout(() => {
    playTone({ frequency: 130, type: "square", duration: 0.12, volume: 0.1, attack: 0.001, release: 0.09 });
  }, 35);
}

function playCorrectSound() {
  playSuccessSound();
}

function playWrongSound() {
  playErrorSound();
}

function stageRewardIconSvg(stage = 0) {
  if (stage === 1) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5v18.5" stroke="#ffe6bf" stroke-width="2.1" stroke-linecap="round"/><path d="M6.3 4h12l-2.8 4.1 2.8 4.1h-12z" fill="#e53a3a" stroke="#ffd1d1" stroke-width="1.2"/></svg>';
  }
  if (stage === 2) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.6 5.3 5.8.8-4.2 4.1 1 5.6-5.2-2.7-5.2 2.7 1-5.6-4.2-4.1 5.8-.8z" fill="#ff4f58" stroke="#ffe8b0" stroke-width="1.2"/><circle cx="12" cy="12" r="9" fill="none" stroke="#ff7880" stroke-opacity=".55" stroke-width="1.4"/></svg>';
  }
  if (stage === 3) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6" fill="#f4bf44" stroke="#ffe6a7" stroke-width="1.6"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="#b17815" stroke-width="1.4"/><path d="M12 6.6v10.8M6.6 12h10.8" stroke="#f8d88e" stroke-width="1" opacity=".8"/></svg>';
  }
  if (stage === 4) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5.1h10v3.2c0 3.7-2.2 6.6-5 6.6s-5-3-5-6.6z" fill="#edbe5f" stroke="#ffe8b2" stroke-width="1.2"/><path d="M4.8 5.8h2c0 2.5-.9 3.8-2.8 3.8V7.8c.5 0 .8-.3.8-2zm14.4 0h-2c0 2.5.9 3.8 2.8 3.8V7.8c-.5 0-.8-.3-.8-2z" fill="#f9d782"/><path d="M10 14.9h4v2.8h-4zM8.2 18h7.6v2.2H8.2z" fill="#d69c2e"/></svg>';
  }
  if (stage === 5) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.1l6.8 6.9L12 21.9 5.2 9z" fill="#7deaff" stroke="#dcf9ff" stroke-width="1.3"/><path d="M12 2.1v19.8M5.2 9h13.6" stroke="#45bfd6" stroke-width="1.1"/></svg>';
  }
  return "";
}

function persistSentenceGameClimbLevel() {
  try {
    localStorage.setItem(SENTENCE_GAME_CLIMB_STORAGE_KEY, String(sentenceGameClimbLevel));
  } catch (error) {
    // noop
  }
}

function loadSentenceGameClimbLevel() {
  try {
    const raw = localStorage.getItem(SENTENCE_GAME_CLIMB_STORAGE_KEY);
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      sentenceGameClimbLevel = Math.max(0, Math.min(5, Math.round(parsed)));
      sentenceGameLastRenderedClimbLevel = sentenceGameClimbLevel;
      return;
    }
  } catch (error) {
    // noop
  }
  sentenceGameClimbLevel = 0;
  sentenceGameLastRenderedClimbLevel = 0;
}

function renderSentenceGameClimb(level = 0, options = {}) {
  if (!sentenceGameClimberEl || !sentenceGameClimbEl) return;
  const position = SENTENCE_GAME_CLIMB_POSITIONS[level] || SENTENCE_GAME_CLIMB_POSITIONS[0];
  sentenceGameClimberEl.style.setProperty("--x", `${position.x}px`);
  sentenceGameClimberEl.style.setProperty("--y", `${position.y}px`);
  sentenceGameClimbEl.setAttribute("aria-label", `Mountain climb progress level ${level} of 5`);

  if (sentenceGameRewardIconEl) {
    sentenceGameRewardIconEl.innerHTML = stageRewardIconSvg(level);
  }

  document.querySelectorAll(".sentence-game-peak").forEach((peakEl) => {
    const peak = Number(peakEl.dataset.peak || 0);
    peakEl.classList.toggle("active", peak > 0 && peak <= level);
    peakEl.classList.remove("pulse");
  });

  if (options.pulsePeak && level > 0) {
    const reachedPeak = document.querySelector(`.sentence-game-peak[data-peak="${level}"]`);
    if (reachedPeak) {
      void reachedPeak.getBoundingClientRect();
      reachedPeak.classList.add("pulse");
      if (sentenceGamePeakPulseTimer) clearTimeout(sentenceGamePeakPulseTimer);
      sentenceGamePeakPulseTimer = setTimeout(() => {
        reachedPeak.classList.remove("pulse");
      }, 620);
    }
  }
}

function playSentenceGameLevelUpSound(stage) {
  if (!soundEnabled || stage < 1 || stage > 5) return;
  const stagePatterns = {
    1: [620, 740, 930],
    2: [660, 880, 1100],
    3: [720, 960, 1280],
    4: [784, 1046, 1396],
    5: [880, 1174, 1568],
  };
  const notes = stagePatterns[stage] || stagePatterns[1];
  notes.forEach((freq, index) => {
    setTimeout(() => {
      playTone({ frequency: freq, type: "triangle", duration: 0.08, volume: 0.11 + stage * 0.01, attack: 0.006, release: 0.09 });
    }, index * 78);
  });
}

function playSentenceGameLevelDownSound() {
  if (!soundEnabled) return;
  [300, 230, 170].forEach((freq, index) => {
    setTimeout(() => {
      playTone({ frequency: freq, type: "sawtooth", duration: 0.09, volume: 0.095, attack: 0.002, release: 0.08 });
    }, index * 62);
  });
}

function sentenceGameRewardLevelFromSeconds(seconds = 0) {
  let level = 0;
  SENTENCE_GAME_REWARD_THRESHOLDS.forEach((threshold, index) => {
    if (seconds >= threshold) level = index + 1;
  });
  return level;
}

function formatSecondsAsClock(totalSeconds = 0) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = String(Math.floor(safe / 60)).padStart(2, "0");
  const secs = String(safe % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function persistSentenceGameRewardState() {
  try {
    localStorage.setItem(SENTENCE_GAME_ACTIVE_SECONDS_KEY, String(Math.max(0, Math.floor(sentenceGameActiveSeconds))));
    localStorage.setItem(SENTENCE_GAME_REWARD_LEVEL_KEY, String(sentenceGameRewardLevel));
    localStorage.setItem(SENTENCE_GAME_LAST_TICK_KEY, String(sentenceGameLastTick || Date.now()));
  } catch (error) {
    // noop
  }
}

function loadSentenceGameRewardState() {
  try {
    const activeRaw = Number(localStorage.getItem(SENTENCE_GAME_ACTIVE_SECONDS_KEY));
    const rewardRaw = Number(localStorage.getItem(SENTENCE_GAME_REWARD_LEVEL_KEY));
    const tickRaw = Number(localStorage.getItem(SENTENCE_GAME_LAST_TICK_KEY));

    sentenceGameActiveSeconds = Number.isFinite(activeRaw) ? Math.max(0, Math.floor(activeRaw)) : 0;
    sentenceGameRewardLevel = Number.isFinite(rewardRaw) ? Math.max(0, Math.min(5, Math.floor(rewardRaw))) : 0;
    sentenceGameLastTick = Number.isFinite(tickRaw) ? tickRaw : Date.now();
  } catch (error) {
    sentenceGameActiveSeconds = 0;
    sentenceGameRewardLevel = 0;
    sentenceGameLastTick = Date.now();
  }

  const computedLevel = sentenceGameRewardLevelFromSeconds(sentenceGameActiveSeconds);
  sentenceGameRewardLevel = Math.max(sentenceGameRewardLevel, computedLevel);
}

function renderSentenceGameRewardState() {
  sentenceGameRewardImageEls.forEach((imgEl) => {
    const level = Number(imgEl.dataset.level || 0);
    imgEl.classList.toggle("active", level > 0 && level === sentenceGameRewardLevel);
  });

  if (sentenceGameRewardTimeEl) {
    sentenceGameRewardTimeEl.textContent = `Тоглосон хугацаа: ${formatSecondsAsClock(sentenceGameActiveSeconds)}`;
  }
}

function playSentenceGameUnlockChime(level) {
  if (!soundEnabled) return;
  const patterns = {
    1: [660, 792, 990],
    2: [740, 932, 1175],
    3: [784, 988, 1319],
    4: [880, 1109, 1480],
    5: [988, 1319, 1760],
  };
  (patterns[level] || patterns[1]).forEach((frequency, index) => {
    setTimeout(() => {
      playTone({ frequency, type: "triangle", duration: 0.09, volume: 0.12, attack: 0.005, release: 0.09 });
    }, index * 86);
  });
}

function showSentenceGameRewardBanner(level) {
  if (!sentenceGameRewardBannerEl || level < 1 || level > 5) return;

  if (sentenceGameRewardBannerTimer) {
    clearTimeout(sentenceGameRewardBannerTimer);
    sentenceGameRewardBannerTimer = null;
  }

  sentenceGameRewardBannerEl.textContent = SENTENCE_GAME_REWARD_BANNERS[level - 1];
  sentenceGameRewardBannerEl.classList.remove("hidden", "hide", "show");
  void sentenceGameRewardBannerEl.offsetWidth;
  sentenceGameRewardBannerEl.classList.add("show");

  sentenceGameRewardBannerTimer = setTimeout(() => {
    sentenceGameRewardBannerEl.classList.remove("show");
    sentenceGameRewardBannerEl.classList.add("hide");
    setTimeout(() => {
      sentenceGameRewardBannerEl.classList.add("hidden");
      sentenceGameRewardBannerEl.classList.remove("hide");
    }, 280);
  }, 4300);

  playSentenceGameUnlockChime(level);
}

function updateSentenceGameRewardLevel({ allowBanner = false } = {}) {
  const nextLevel = sentenceGameRewardLevelFromSeconds(sentenceGameActiveSeconds);
  if (nextLevel > sentenceGameRewardLevel) {
    sentenceGameRewardLevel = nextLevel;
    renderSentenceGameRewardState();
    persistSentenceGameRewardState();
    if (allowBanner) showSentenceGameRewardBanner(nextLevel);
    return;
  }

  if (nextLevel < sentenceGameRewardLevel) {
    sentenceGameRewardLevel = nextLevel;
  }

  renderSentenceGameRewardState();
}

function flushSentenceGameActiveTimeTick() {
  if (!sentenceGameLastActivityAt) return false;
  const now = Date.now();
  const elapsedSinceActivity = Math.floor((now - sentenceGameLastActivityAt) / 1000);
  const activeSeconds = Math.max(0, Math.min(SENTENCE_GAME_IDLE_TIMEOUT_SECONDS, elapsedSinceActivity));
  const tickBase = sentenceGameLastTick || sentenceGameLastActivityAt;
  const elapsedFromTick = Math.max(0, Math.floor((now - tickBase) / 1000));
  const addSeconds = Math.min(activeSeconds, elapsedFromTick);

  if (addSeconds <= 0) return false;

  sentenceGameActiveSeconds += addSeconds;
  sentenceGameLastTick = now;

  loadProgressState();
  syncProgressForToday();
  progressState.todaySecondsRemainder = (progressState.todaySecondsRemainder || 0) + addSeconds;
  if (progressState.todaySecondsRemainder >= 60) {
    const gainedMinutes = Math.floor(progressState.todaySecondsRemainder / 60);
    progressState.todayMinutes += gainedMinutes;
    progressState.todaySecondsRemainder = progressState.todaySecondsRemainder % 60;
  }
  progressState.rewardTierUnlocked = Math.max(progressState.rewardTierUnlocked || 1, sentenceGameRewardLevelFromSeconds(sentenceGameActiveSeconds) || 1);
  progressState.lastStatsDate = getTodayKey();
  persistProgressState();

  updateSentenceGameRewardLevel({ allowBanner: true });
  persistSentenceGameRewardState();
  renderSentenceGameRewardState();
  updateHeaderStatus();
  if (!statsScreen.classList.contains("hidden")) updateStatsUI();
  return true;
}

function startSentenceGameActiveTimer() {
  if (sentenceGameActiveTimer) return;
  sentenceGameActiveTimer = setInterval(() => {
    flushSentenceGameActiveTimeTick();
  }, 1000);
}

function stopSentenceGameActiveTimer() {
  if (!sentenceGameActiveTimer) return;
  clearInterval(sentenceGameActiveTimer);
  sentenceGameActiveTimer = null;
}

function sentenceGameScreenVisible() {
  return sentenceGameScreen && !sentenceGameScreen.classList.contains("hidden");
}

function markSentenceGameActivity() {
  if (!sentenceGameScreenVisible()) return;
  flushSentenceGameActiveTimeTick();
  sentenceGameLastActivityAt = Date.now();
  sentenceGameLastTick = sentenceGameLastActivityAt;
  persistSentenceGameRewardState();
}

function beginSentenceGameSession() {
  sentenceGameLastActivityAt = Date.now();
  sentenceGameLastTick = sentenceGameLastActivityAt;
  renderSentenceGameRewardState();
  startSentenceGameActiveTimer();
  persistSentenceGameRewardState();
}

function endSentenceGameSession() {
  flushSentenceGameActiveTimeTick();
  stopSentenceGameActiveTimer();
  sentenceGameLastTick = Date.now();
  persistSentenceGameRewardState();
}

function updateSentenceGameClimbFromOutcome(outcome) {
  if (!outcome) return;
  const previousLevel = sentenceGameClimbLevel;
  if (outcome === "success") {
    sentenceGameClimbLevel = Math.min(5, sentenceGameClimbLevel + 1);
  }
  if (outcome === "fail") {
    sentenceGameClimbLevel = Math.max(0, sentenceGameClimbLevel - 1);
  }

  if (sentenceGameClimbLevel === previousLevel) {
    renderSentenceGameClimb(sentenceGameClimbLevel);
    return;
  }

  const leveledUp = sentenceGameClimbLevel > previousLevel;
  sentenceGameClimberEl?.setAttribute("data-animating", "true");
  renderSentenceGameClimb(sentenceGameClimbLevel, { pulsePeak: leveledUp });
  persistSentenceGameClimbLevel();
  sentenceGameLastRenderedClimbLevel = sentenceGameClimbLevel;

  if (leveledUp) {
    playSentenceGameLevelUpSound(sentenceGameClimbLevel);
  } else {
    playSentenceGameLevelDownSound();
  }

  setTimeout(() => {
    sentenceGameClimberEl?.setAttribute("data-animating", "false");
  }, 620);
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

  const rateCandidate = Number(rawSettings.rate);
  const rate = Number.isFinite(rateCandidate) && rateCandidate >= 0.45 && rateCandidate <= 1.4
    ? Math.round(rateCandidate * 20) / 20
    : DEFAULT_TTS_SETTINGS.rate;

  return { voice, rate };
}

function loadTtsSettings() {
  try {
    const raw = localStorage.getItem(TTS_SETTINGS_KEY);
    if (raw) {
      ttsSettings = normalizeTtsSettings(JSON.parse(raw));
      return;
    }

    const legacyRate = Number(localStorage.getItem(LEGACY_TTS_RATE_KEY));
    if (Number.isFinite(legacyRate) && legacyRate >= 0.45 && legacyRate <= 1.4) {
      ttsSettings = { ...DEFAULT_TTS_SETTINGS, rate: Math.round(legacyRate * 20) / 20 };
      return;
    }

    ttsSettings = { ...DEFAULT_TTS_SETTINGS };
  } catch (error) {
    ttsSettings = { ...DEFAULT_TTS_SETTINGS };
  }
}

function persistTtsSettings() {
  localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(ttsSettings));
  localStorage.setItem(LEGACY_TTS_RATE_KEY, String(ttsSettings.rate));
}

function updateTtsControlState() {
  voiceOptionButtons.forEach(btn => {
    const isActive = btn.dataset.voice === ttsSettings.voice;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (ttsRateSlider) {
    ttsRateSlider.value = ttsSettings.rate.toFixed(2);
  }

  if (ttsRateValueEl) {
    ttsRateValueEl.textContent = `${ttsSettings.rate.toFixed(2)}x`;
  }
}

function stopSentenceGameTipSpeech() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  sentenceGameTipSpeaking = false;
  updateSentenceGameTipControls();
}

function updateSentenceGameTipControls() {
  if (sentenceGameTipSpeakBtn) {
    sentenceGameTipSpeakBtn.disabled = sentenceGameTipSpeaking;
  }

  if (sentenceGameTipStopBtn) {
    sentenceGameTipStopBtn.hidden = !sentenceGameTipSpeaking;
    sentenceGameTipStopBtn.disabled = !sentenceGameTipSpeaking;
  }
}

function closeSentenceGameTipPanel() {
  markSentenceGameActivity();
  if (!sentenceGameTipPanelEl || !sentenceGameTipToggleBtn) return;
  stopSentenceGameTipSpeech();
  sentenceGameTipPanelEl.classList.add("hidden");
  sentenceGameTipToggleBtn.setAttribute("aria-expanded", "false");

  if (sentenceGameTipTextEl) {
    sentenceGameTipTextEl.classList.add("hidden");
  }
  if (sentenceGameTipCloseRowEl) {
    sentenceGameTipCloseRowEl.classList.add("hidden");
  }
}

function toggleSentenceGameTipPanel() {
  markSentenceGameActivity();
  if (!sentenceGameTipPanelEl || !sentenceGameTipToggleBtn) return;
  const willOpen = sentenceGameTipPanelEl.classList.contains("hidden");
  sentenceGameTipPanelEl.classList.toggle("hidden", !willOpen);
  sentenceGameTipToggleBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
  if (!willOpen) {
    closeSentenceGameTipPanel();
    return;
  }
  updateSentenceGameTipControls();
}

function showSentenceGameTipText() {
  markSentenceGameActivity();
  if (sentenceGameTipTextEl) {
    sentenceGameTipTextEl.classList.remove("hidden");
  }
  if (sentenceGameTipCloseRowEl) {
    sentenceGameTipCloseRowEl.classList.remove("hidden");
  }
}

function speakSentenceGameTip() {
  markSentenceGameActivity();
  if (!soundEnabled) return;
  if (!("speechSynthesis" in window)) return;
  stopSentenceGameTipSpeech();

  const utterance = new SpeechSynthesisUtterance(SENTENCE_GAME_TIP_TEXT);
  const mnVoice = mongolianVoice();
  if (mnVoice) {
    utterance.voice = mnVoice;
    utterance.lang = mnVoice.lang || "mn-MN";
  } else {
    utterance.lang = "mn-MN";
  }
  utterance.rate = ttsSettings.rate;
  utterance.onstart = () => {
    sentenceGameTipSpeaking = true;
    updateSentenceGameTipControls();
  };
  utterance.onend = () => {
    sentenceGameTipSpeaking = false;
    closeSentenceGameTipPanel();
  };
  utterance.onerror = () => {
    sentenceGameTipSpeaking = false;
    updateSentenceGameTipControls();
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  sentenceGameTipSpeaking = false;
  updateSentenceGameTipControls();
  speakingSentenceId = null;
  updateSpeakingState();
}

function speakSentence(item) {
  if (!soundEnabled) return;
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
    sentenceItems = sentenceItems.map((item) => ({ ...item, tokens: tokenizeSentence(item.en) }));
    renderSentences();
    sentenceGameHistory = [];
    sentenceGameIndex = -1;
    if (!sentenceGameScreen.classList.contains("hidden")) initSentenceGameRound();
  } catch (error) {
    sentencesListEl.innerHTML = '<p class="muted">Өгүүлбэрүүдийг ачаалж чадсангүй.</p>';
  }
}


function sentenceGameSentence() {
  if (!sentenceGameHistory.length || sentenceGameIndex < 0) return null;
  return sentenceGameHistory[sentenceGameIndex] || null;
}

function sentenceGameComplexityScore(item = {}) {
  const levelTag = String(item.level || item.cefr || "").toLowerCase();
  const levelWeight = levelTag.includes("advanced") || levelTag.includes("c1") || levelTag.includes("c2")
    ? 8
    : (levelTag.includes("intermediate") || levelTag.includes("b1") || levelTag.includes("b2")
      ? 4
      : (levelTag.includes("beginner") || levelTag.includes("a1") || levelTag.includes("a2") ? 0 : 2));
  const tokenCount = tokenizeSentence(item.en || "").length;
  const longWordCount = String(item.en || "").split(/\s+/).filter((word) => word.replace(/[^A-Za-z]/g, "").length >= 8).length;
  return tokenCount * 2 + longWordCount + levelWeight;
}

function sentenceGameBucketsByFallback() {
  const sorted = [...sentenceItems].sort((a, b) => sentenceGameComplexityScore(a) - sentenceGameComplexityScore(b));
  if (!sorted.length) return { beginner: [], intermediate: [], advanced: [] };
  const beginnerEnd = Math.max(1, Math.ceil(sorted.length / 3));
  const intermediateEnd = Math.max(beginnerEnd + 1, Math.ceil((sorted.length * 2) / 3));
  return {
    beginner: sorted.slice(0, beginnerEnd),
    intermediate: sorted.slice(beginnerEnd, intermediateEnd),
    advanced: sorted.slice(intermediateEnd),
  };
}

function sentenceGameSentencesByDifficulty(difficulty = sentenceGameDifficulty) {
  const normalizedDifficulty = ["beginner", "intermediate", "advanced"].includes(difficulty) ? difficulty : "beginner";
  const tagged = sentenceItems.filter((item) => {
    const rawLevel = String(item.level || item.cefr || "").toLowerCase();
    if (normalizedDifficulty === "beginner") return rawLevel.includes("beginner") || rawLevel.includes("a1") || rawLevel.includes("a2");
    if (normalizedDifficulty === "intermediate") return rawLevel.includes("intermediate") || rawLevel.includes("b1") || rawLevel.includes("b2");
    return rawLevel.includes("advanced") || rawLevel.includes("c1") || rawLevel.includes("c2");
  });

  if (tagged.length) return tagged;

  const fallback = sentenceGameBucketsByFallback();
  const selectedFallback = fallback[normalizedDifficulty] || [];
  if (selectedFallback.length) return selectedFallback;

  return sentenceItems;
}

function sentenceGameRandomSentence() {
  const available = sentenceGameSentencesByDifficulty(sentenceGameDifficulty);
  if (!available.length) return null;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex] || null;
}

function sentenceGameDifficultyButtonLabel(difficulty = sentenceGameDifficulty) {
  return SENTENCE_GAME_DIFFICULTY_LABELS[difficulty] || SENTENCE_GAME_DIFFICULTY_LABELS.beginner;
}

function updateSentenceGameDifficultyUI() {
  if (sentenceGameDifficultyToggleBtn) {
    const label = sentenceGameDifficultyButtonLabel(sentenceGameDifficulty);
    sentenceGameDifficultyToggleBtn.textContent = `Тоглох түвшин: ${label}`;
  }

  sentenceGameDifficultyButtons.forEach((btn) => {
    const isActive = btn.dataset.difficulty === sentenceGameDifficulty;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function setSentenceGameDifficultyPanelOpen(isOpen) {
  if (!sentenceGameDifficultyPanelEl || !sentenceGameDifficultyToggleBtn) return;
  sentenceGameDifficultyPanelEl.classList.toggle("hidden", !isOpen);
  sentenceGameDifficultyToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function loadSentenceGameDifficulty() {
  try {
    const stored = localStorage.getItem(SENTENCE_GAME_DIFFICULTY_KEY);
    if (["beginner", "intermediate", "advanced"].includes(stored || "")) {
      sentenceGameDifficulty = stored;
    } else {
      sentenceGameDifficulty = "beginner";
      localStorage.setItem(SENTENCE_GAME_DIFFICULTY_KEY, sentenceGameDifficulty);
    }
  } catch (_error) {
    sentenceGameDifficulty = "beginner";
  }

  updateSentenceGameDifficultyUI();
}

function selectSentenceGameDifficulty(difficulty, { collapsePanel = true } = {}) {
  if (!["beginner", "intermediate", "advanced"].includes(difficulty)) return;
  sentenceGameDifficulty = difficulty;
  try {
    localStorage.setItem(SENTENCE_GAME_DIFFICULTY_KEY, sentenceGameDifficulty);
  } catch (_error) {
    // ignore storage errors in private mode
  }

  updateSentenceGameDifficultyUI();
  sentenceGameHistory = [];
  sentenceGameIndex = -1;
  initSentenceGameRound();

  if (collapsePanel && window.matchMedia("(max-width: 700px)").matches) {
    setSentenceGameDifficultyPanelOpen(false);
  }
}

function updateSentenceGameNavButtons() {

  if (sentenceGamePrevBtn) {
    sentenceGamePrevBtn.disabled = sentenceGameIndex <= 0;
  }
}

function sentenceGameIsSolved() {
  return evaluateSentenceGameAttempt().isAllCorrect;
}

function normalizeSentence(str = "") {
  return String(str)
    .replace(/[’`´]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?:;])/g, "$1")
    .replace(/([.,!?:;])(?!\s|$)/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getPlacedSentenceText() {
  const placedTokens = sentenceGameBuilt
    .map((tileId) => sentenceGameTiles.find((tile) => tile.id === tileId)?.value || "")
    .filter(Boolean);

  return normalizeSentence(placedTokens.join(" "));
}

function isSentenceFullyCorrect() {
  const current = sentenceGameSentence();
  if (!current) return false;

  const expectedSentence = current.en || "";
  const placedSentence = getPlacedSentenceText();
  const normalizedPlaced = normalizeSentence(placedSentence);
  const normalizedExpected = normalizeSentence(expectedSentence);

  return normalizedPlaced === normalizedExpected;
}

function normalizeSentenceGameToken(token = "") {
  return String(token).replace(/\s+/g, " ").trim();
}

function evaluateSentenceGameAttempt() {
  const current = sentenceGameSentence();
  const expectedTokens = current?.tokens || [];
  const totalSlots = expectedTokens.length;

  let correctCount = 0;
  let wrongCount = 0;

  for (let idx = 0; idx < totalSlots; idx += 1) {
    const placedTileId = sentenceGameBuilt[idx];
    const placedTile = sentenceGameTiles.find(item => item.id === placedTileId);
    const expectedToken = normalizeSentenceGameToken(expectedTokens[idx]);
    const placedToken = normalizeSentenceGameToken(placedTile?.value || "");

    if (!placedToken) continue;
    if (placedToken === expectedToken) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }
  }

  const isAllCorrect = totalSlots > 0 && correctCount === totalSlots;
  return { isAllCorrect, totalSlots, correctCount, wrongCount };
}

function createSentenceGameTileButton(tile, inPool) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sentence-game-tile";
  btn.textContent = tile.value;
  btn.dataset.tileId = String(tile.id);
  btn.draggable = true;

  btn.addEventListener("dragstart", (event) => {
    draggingTileId = tile.id;
    event.dataTransfer.setData("text/plain", String(tile.id));
  });

  btn.addEventListener("click", () => {
    if (inPool) {
      placeSentenceGameTile(tile.id);
    } else {
      removeSentenceGameTile(tile.id);
    }
  });

  btn.addEventListener("pointerdown", () => {
    draggingTileId = tile.id;
  });

  return btn;
}

function sentenceGamePlacementStatus(slotIndex) {
  const current = sentenceGameSentence();
  if (!current) return "";
  const placedTileId = sentenceGameBuilt[slotIndex];
  const placedTile = sentenceGameTiles.find(item => item.id === placedTileId);
  if (!placedTile) return "";
  return current.tokens[slotIndex] === placedTile.value ? "word-correct" : "word-wrong";
}

function renderSentenceGameBoard() {
  const current = sentenceGameSentence();
  if (!current) {
    sentenceGameDropzoneEl.innerHTML = '<p class="muted">Өгүүлбэр алга.</p>';
    sentenceGamePoolEl.innerHTML = "";
    return;
  }

  sentenceGameDropzoneEl.innerHTML = "";
  for (let idx = 0; idx < current.tokens.length; idx += 1) {
    const slot = document.createElement("div");
    slot.className = "sentence-game-slot";

    const tileId = sentenceGameBuilt[idx];
    if (tileId !== undefined) {
      const tile = sentenceGameTiles.find(item => item.id === tileId);
      if (tile) {
        const placedTileButton = createSentenceGameTileButton(tile, false);
        placedTileButton.classList.remove("word-correct", "word-wrong");
        const placementStatus = sentenceGamePlacementStatus(idx);
        if (placementStatus) placedTileButton.classList.add(placementStatus);
        slot.appendChild(placedTileButton);
      }
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "sentence-game-slot-placeholder";
      placeholder.textContent = "...";
      slot.appendChild(placeholder);
    }

    slot.addEventListener("dragover", (event) => event.preventDefault());
    slot.addEventListener("drop", (event) => {
      event.preventDefault();
      const droppedId = Number(event.dataTransfer.getData("text/plain") || draggingTileId);
      placeSentenceGameTile(droppedId);
      draggingTileId = null;
    });
    slot.addEventListener("pointerup", () => {
      if (draggingTileId !== null) placeSentenceGameTile(Number(draggingTileId));
      draggingTileId = null;
    });
    sentenceGameDropzoneEl.appendChild(slot);
  }

  sentenceGamePoolEl.innerHTML = "";
  sentenceGamePoolEl.ondragover = (event) => event.preventDefault();
  sentenceGamePoolEl.ondrop = (event) => {
    event.preventDefault();
    const droppedId = Number(event.dataTransfer.getData("text/plain") || draggingTileId);
    removeSentenceGameTile(droppedId);
  };
  sentenceGamePoolEl.onpointerup = () => {
    if (draggingTileId !== null) removeSentenceGameTile(Number(draggingTileId));
    draggingTileId = null;
  };

  sentenceGameTiles.forEach(tile => {
    if (sentenceGameBuilt.includes(tile.id)) return;
    sentenceGamePoolEl.appendChild(createSentenceGameTileButton(tile, true));
  });

  sentenceGameUndoBtn.disabled = sentenceGameBuilt.length === 0;
}

function updateSentenceGameState() {
  const evaluation = evaluateSentenceGameAttempt();
  const allSlotsFilled = evaluation.totalSlots > 0 && sentenceGameBuilt.length === evaluation.totalSlots;
  const sentenceCorrect = allSlotsFilled && isSentenceFullyCorrect();
  sentenceGameCompleted = sentenceCorrect;
  sentenceGameNextBtn.disabled = false;

  if (SENTENCE_GAME_DEBUG) {
    console.log("[SentenceGame] evaluation", {
      isAllCorrect: evaluation.isAllCorrect,
      totalSlots: evaluation.totalSlots,
      correctCount: evaluation.correctCount,
      wrongCount: evaluation.wrongCount,
    });
  }

  if (sentenceCorrect) {
    if (!sentenceGameSuccessAlreadyShownForThisSentence) {
      showSentenceGameToast(SENTENCE_GAME_CORRECT_TOAST);
      sentenceGameSuccessAlreadyShownForThisSentence = true;
    }

    if (!sentenceGameUsedShowCorrect) {
      sentenceGameFeedbackEl.textContent = "Зөв!";
      sentenceGameFeedbackEl.classList.add("ok");
    }
    if (!sentenceGameXpAwarded && !sentenceGameUsedShowCorrect) {
      awardXP(10, "sentence_game_success");
      sentenceGameXpAwarded = true;
      playCorrectSound();
    }
  } else if (!sentenceGameUsedShowCorrect) {
    sentenceGameSuccessAlreadyShownForThisSentence = false;
    sentenceGameFeedbackEl.textContent = "";
    sentenceGameFeedbackEl.classList.remove("ok");
  }

  if (allSlotsFilled && !sentenceGameAttemptResolved) {
    sentenceGameAttemptResolved = true;
    sentenceGameLastOutcomeForThisSentence = sentenceCorrect ? "success" : "fail";
    updateSentenceGameClimbFromOutcome(sentenceGameLastOutcomeForThisSentence);
    if (!sentenceCorrect && !sentenceGameUsedShowCorrect) {
      showSentenceGameToast(SENTENCE_GAME_INCORRECT_TOAST);
    }
  } else if (!allSlotsFilled && !sentenceGameAttemptResolved) {
    sentenceGameLastOutcomeForThisSentence = null;
  }
}

function clearSentenceGameToastTimers() {
  if (sentenceGameToastTimer) {
    clearTimeout(sentenceGameToastTimer);
    sentenceGameToastTimer = null;
  }
  if (sentenceGameToastHideTimer) {
    clearTimeout(sentenceGameToastHideTimer);
    sentenceGameToastHideTimer = null;
  }
  if (sentenceGameToastSpeechTimer) {
    clearTimeout(sentenceGameToastSpeechTimer);
    sentenceGameToastSpeechTimer = null;
  }
  sentenceGameToastSpeechActive = false;
}

function speakSentenceGameToast(message, handlers = {}) {
  if (!soundEnabled) return;
  if (!("speechSynthesis" in window)) return;

  const textToSpeak = toastSpeechText(message);
  if (!textToSpeak) return;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  const mnVoice = mongolianVoice();
  const toastType = handlers.toastType || toastTypeFromMessage(message);

  utterance.lang = "mn-MN";
  if (mnVoice) {
    utterance.voice = mnVoice;
    utterance.lang = (mnVoice.lang || "").toLowerCase().startsWith("mn") ? mnVoice.lang : "mn-MN";
  } else {
    utterance.lang = "mn";
  }
  utterance.rate = ttsSettings.rate;
  utterance.pitch = 1;
  utterance.onstart = () => {
    console.log(`[SentenceGameToast][${toastType}] speech start`);
    if (typeof handlers.onstart === "function") handlers.onstart();
  };
  utterance.onend = () => {
    console.log(`[SentenceGameToast][${toastType}] speech end`);
    if (typeof handlers.onend === "function") handlers.onend();
  };
  utterance.onerror = () => {
    console.log(`[SentenceGameToast][${toastType}] speech end (error)`);
    if (typeof handlers.onend === "function") handlers.onend();
  };
  window.speechSynthesis.speak(utterance);
}

function scheduleSentenceGameToastHide(targetTimestamp) {
  sentenceGameToastHideDeadline = Math.max(sentenceGameToastHideDeadline, targetTimestamp);

  if (sentenceGameToastTimer) {
    clearTimeout(sentenceGameToastTimer);
    sentenceGameToastTimer = null;
  }

  const wait = Math.max(0, sentenceGameToastHideDeadline - Date.now());
  sentenceGameToastTimer = setTimeout(() => {
    if (sentenceGameToastSpeechActive) {
      scheduleSentenceGameToastHide(Date.now() + 180);
      return;
    }
    hideSentenceGameToast();
  }, wait);
}

function hideSentenceGameToast() {
  clearSentenceGameToastTimers();
  if (!sentenceGameToastEl) return;

  sentenceGameToastEl.classList.remove("show");
  sentenceGameToastEl.classList.add("hide");
  sentenceGameToastEl.setAttribute("aria-hidden", "true");

  sentenceGameToastHideTimer = setTimeout(() => {
    if (!sentenceGameToastEl) return;
    sentenceGameToastEl.classList.remove("hide");
    sentenceGameToastEl.textContent = "";
  }, 320);
}

function showSentenceGameToast(message) {
  if (!sentenceGameToastEl || !message) return;

  const isSuccessToast = message === SENTENCE_GAME_CORRECT_TOAST;
  if (!isSuccessToast && Date.now() < sentenceGameSuccessToastLockUntil) {
    return;
  }

  if (isSuccessToast) {
    sentenceGameSuccessToastLockUntil = Date.now() + SENTENCE_GAME_SUCCESS_TOAST_LOCK_MS;
  }

  const hasActiveToast =
    sentenceGameToastEl.classList.contains("show") ||
    sentenceGameToastSpeechActive ||
    Boolean(sentenceGameToastSpeechTimer);

  if (hasActiveToast && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  clearSentenceGameToastTimers();

  sentenceGameToastEl.textContent = message;
  sentenceGameToastEl.setAttribute("aria-hidden", "false");
  sentenceGameToastEl.classList.remove("hide");
  sentenceGameToastEl.classList.remove("show");
  void sentenceGameToastEl.offsetWidth;
  sentenceGameToastEl.classList.add("show");

  sentenceGameToastShownAt = Date.now();
  const maxHideTimestamp = sentenceGameToastShownAt + SENTENCE_GAME_TOAST_MAX_DURATION;
  sentenceGameToastHideDeadline = sentenceGameToastShownAt + SENTENCE_GAME_TOAST_DURATION;
  sentenceGameToastSpeechActive = false;
  const toastType = toastTypeFromMessage(message);

  sentenceGameToastSpeechTimer = setTimeout(() => {
    speakSentenceGameToast(message, {
      toastType,
      onstart: () => {
        sentenceGameToastSpeechActive = true;
      },
      onend: () => {
        sentenceGameToastSpeechActive = false;
        const nextHideAt = Math.min(Date.now() + SENTENCE_GAME_TOAST_SPEECH_END_BUFFER, maxHideTimestamp);
        scheduleSentenceGameToastHide(nextHideAt);
      },
    });
  }, SENTENCE_GAME_TOAST_SPEECH_DELAY);

  scheduleSentenceGameToastHide(Math.min(sentenceGameToastHideDeadline, maxHideTimestamp));
}

function hideSentenceGameCorrectPanel() {
  sentenceGameCorrectVisible = false;
  if (sentenceGameCorrectPanelEl) sentenceGameCorrectPanelEl.classList.add("hidden");
}

function renderSentenceGameCorrectPanel() {
  const current = sentenceGameSentence();
  if (!current || !sentenceGameCorrectPanelEl || !sentenceGameCorrectEnEl || !sentenceGameCorrectMnEl) return;
  sentenceGameCorrectEnEl.textContent = current.en || "";
  sentenceGameCorrectMnEl.textContent = current.mn || "";
  sentenceGameCorrectPanelEl.classList.remove("hidden");
}

function showSentenceGameCorrectAnswer() {
  markSentenceGameActivity();
  const current = sentenceGameSentence();
  if (!current) return;

  sentenceGameUsedShowCorrect = true;
  sentenceGameCorrectVisible = !sentenceGameCorrectVisible;

  if (sentenceGameCorrectVisible) {
    renderSentenceGameCorrectPanel();
  } else {
    hideSentenceGameCorrectPanel();
  }

  if (sentenceGameCorrectVisible) {
    if (!sentenceGameHintXpAwarded) {
      awardXP(3, "hint_used");
      sentenceGameHintXpAwarded = true;
    }
    showSentenceGameToast(SENTENCE_GAME_SHOW_CORRECT_TOAST);
  }

  if (!sentenceGameCompleted) {
    sentenceGameFeedbackEl.textContent = "";
    sentenceGameFeedbackEl.classList.remove("ok");
  }
}

function placeSentenceGameTile(tileId) {
  if (!Number.isFinite(tileId) || sentenceGameBuilt.includes(tileId)) return;
  markSentenceGameActivity();
  if (sentenceGameBuilt.length >= sentenceGameTiles.length) return;
  sentenceGameBuilt.push(tileId);

  const current = sentenceGameSentence();
  const insertedIndex = sentenceGameBuilt.length - 1;
  const placedTile = sentenceGameTiles.find(tile => tile.id === tileId);
  const isCorrectPlacement = Boolean(current && placedTile && current.tokens[insertedIndex] === placedTile.value);

  renderSentenceGameBoard();
  updateSentenceGameState();

  if (isCorrectPlacement) {
    playSuccessSound();
  } else {
    playErrorSound();
  }
}

function removeSentenceGameTile(tileId) {
  markSentenceGameActivity();
  const idx = sentenceGameBuilt.indexOf(tileId);
  if (idx === -1) return;
  sentenceGameBuilt.splice(idx, 1);
  sentenceGameSuccessAlreadyShownForThisSentence = false;
  sentenceGameLastOutcomeForThisSentence = null;
  renderSentenceGameBoard();
  updateSentenceGameState();
}

function undoSentenceGameMove() {
  if (!sentenceGameBuilt.length) return;
  markSentenceGameActivity();
  sentenceGameBuilt.pop();
  sentenceGameSuccessAlreadyShownForThisSentence = false;
  sentenceGameLastOutcomeForThisSentence = null;
  renderSentenceGameBoard();
  updateSentenceGameState();
}

function initSentenceGameRound() {
  hideSentenceGameToast();
  if (!sentenceGameHistory.length || sentenceGameIndex < 0) {
    sentenceGameHistory = [];
    const firstSentence = sentenceGameRandomSentence();
    if (!firstSentence) return;
    sentenceGameHistory.push(firstSentence);
    sentenceGameIndex = 0;
  }

  const current = sentenceGameSentence();
  if (!current) return;

  current.tokens = tokenizeSentence(current.en);
  sentenceGameTiles = shuffle(current.tokens.map((value, id) => ({ id, value })));
  sentenceGameBuilt = [];
  sentenceGameCompleted = false;
  sentenceGameXpAwarded = false;
  sentenceGameHintXpAwarded = false;
  sentenceGameUsedShowCorrect = false;
  sentenceGameSuccessAlreadyShownForThisSentence = false;
  sentenceGameSuccessToastLockUntil = 0;
  sentenceGameLastOutcomeForThisSentence = null;
  sentenceGameAttemptResolved = false;
  hideSentenceGameCorrectPanel();
  sentenceGameFeedbackEl.textContent = "";
  sentenceGameFeedbackEl.classList.remove("ok");
  sentenceGameNextBtn.disabled = false;
  updateSentenceGameNavButtons();
  renderSentenceGameBoard();
}

function nextSentenceGameRound() {
  markSentenceGameActivity();
  const nextIndex = sentenceGameIndex + 1;

  if (nextIndex < sentenceGameHistory.length) {
    sentenceGameIndex = nextIndex;
    initSentenceGameRound();
    return;
  }

  const nextSentence = sentenceGameRandomSentence();
  if (!nextSentence) return;
  sentenceGameHistory.push(nextSentence);
  sentenceGameIndex = nextIndex;
  initSentenceGameRound();
}

function prevSentenceGameRound() {
  if (sentenceGameIndex <= 0) return;
  markSentenceGameActivity();
  sentenceGameIndex -= 1;
  initSentenceGameRound();
}

function retrySentenceGameRound() {
  markSentenceGameActivity();
  hideSentenceGameToast();
  sentenceGameBuilt = [];
  sentenceGameCompleted = false;
  sentenceGameXpAwarded = false;
  sentenceGameHintXpAwarded = false;
  sentenceGameUsedShowCorrect = false;
  sentenceGameSuccessAlreadyShownForThisSentence = false;
  sentenceGameSuccessToastLockUntil = 0;
  sentenceGameLastOutcomeForThisSentence = null;
  sentenceGameAttemptResolved = false;
  hideSentenceGameCorrectPanel();
  sentenceGameFeedbackEl.textContent = "";
  sentenceGameFeedbackEl.classList.remove("ok");
  renderSentenceGameBoard();
  updateSentenceGameState();
  updateSentenceGameNavButtons();
}

// ---- Quiz logic ----
function startQuiz() {
  questions = shuffle(BANK[level]).slice(0); // бүгдийг
  currentIndex = 0;
  score = 0;
  locked = false;
  loadProgressState();
  syncProgressForToday();
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

  if (selected === correct) {
    score += 1;
    awardXP(1, "quiz_correct_answer");
    buttonEl.classList.add("correct");
    resultEl.textContent = "✅ Зөв!";
    resultEl.classList.add("ok");
    playSuccessSound();
  } else {
    buttonEl.classList.add("wrong");
    resultEl.textContent = `❌ Буруу! Зөв нь: ${correct}`;
    resultEl.classList.add("bad");
    playErrorSound();
  }

  show(resultEl);
  show(nextBtn);
  updateTopbar();
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

  loadProgressState();
  showCompletionBanner(progressState.dailyCompleted);
  updateHeaderStatus();
}

function backToStart() {
  stopSpeaking();
  hideStartIntroPanel();
  showScreen(startScreen);
}

function formatQaBuiltLine(tokens) {
  return tokens.join(" ").replace(/\s+([?.])/g, "$1");
}

function formatQaHMS(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function renderSentencesRewards() {
  if (!sentencesRewardStripEl) return;
  sentencesRewardStripEl.innerHTML = SENTENCES_REWARD_STEPS.map((reward, index) => {
    const unlocked = index < sentencesUnlockedRewards;
    return `
      <article class="qna-reward-tile ${unlocked ? "is-unlocked" : ""}" data-reward-index="${index}">
        <p class="qna-reward-label">${reward.icon} ${reward.label}</p>
        <img class="qna-reward-image" src="${reward.image}" alt="${reward.alt}" loading="lazy" />
      </article>
    `;
  }).join("");
}

function updateSentencesTimerUI() {
  while (sentencesUnlockedRewards < SENTENCES_REWARD_STEPS.length && sentencesElapsedSeconds >= SENTENCES_REWARD_STEPS[sentencesUnlockedRewards].seconds) {
    sentencesUnlockedRewards += 1;
    renderSentencesRewards();
  }
  if (sentencesTimerEl) sentencesTimerEl.textContent = `Тоглосон хугацаа: ${formatQaHMS(sentencesElapsedSeconds)}`;
  const nextReward = SENTENCES_REWARD_STEPS[sentencesUnlockedRewards];
  if (sentencesNextRewardEl) {
    sentencesNextRewardEl.textContent = nextReward
      ? `Next reward in ${formatQaHMS(Math.max(nextReward.seconds - sentencesElapsedSeconds, 0))}`
      : "Бүх шагналыг авсан байна 🎉";
  }
}

function stopSentencesTimer() {
  if (sentencesTimerInterval) {
    clearInterval(sentencesTimerInterval);
    sentencesTimerInterval = null;
  }
}

function startSentencesTimer() {
  stopSentencesTimer();
  sentencesTimerInterval = setInterval(() => {
    sentencesElapsedSeconds += 1;
    updateSentencesTimerUI();
  }, 1000);
}

function qaShuffle(array) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function getQaCurrentRound() {
  return qaRoundPool[qaRoundIndex % qaRoundPool.length];
}

function renderQaRewards() {
  if (!qaRewardBarEl) return;
  qaRewardBarEl.innerHTML = QA_REWARD_STEPS.map((reward, index) => {
    const unlocked = index < qaUnlockedRewards;
    return `
      <article class="qna-reward-tile ${unlocked ? "is-unlocked" : ""}" data-reward-index="${index}">
        <p class="qna-reward-label">${reward.icon} ${reward.label}</p>
        <img class="qna-reward-image" src="${reward.image}" alt="${reward.alt}" loading="lazy" />
      </article>
    `;
  }).join("");
}

function showQaToast(message) {
  if (!qaToastEl) return;
  qaToastEl.textContent = message;
  qaToastEl.classList.remove("hidden");
  qaToastEl.classList.add("show");
  clearTimeout(qaToastTimer);
  qaToastTimer = setTimeout(() => {
    qaToastEl.classList.remove("show");
    qaToastEl.classList.add("hidden");
  }, 2200);
}

function updateQaTimerUI() {
  if (qaTimerEl) qaTimerEl.textContent = `Тоглосон хугацаа: ${formatQaHMS(qaElapsedSeconds)}`;
  const nextReward = QA_REWARD_STEPS[qaUnlockedRewards];
  if (qaNextRewardEl) {
    qaNextRewardEl.textContent = nextReward
      ? `Next reward in ${formatQaHMS(Math.max(nextReward.seconds - qaElapsedSeconds, 0))}`
      : "Бүх шагналыг авсан байна 🎉";
  }
  while (qaUnlockedRewards < QA_REWARD_STEPS.length && qaElapsedSeconds >= QA_REWARD_STEPS[qaUnlockedRewards].seconds) {
    showQaToast(`🎉 Шагнал авлаа: ${QA_REWARD_STEPS[qaUnlockedRewards].label}`);
    qaUnlockedRewards += 1;
    renderQaRewards();
  }
}

function stopQaTimer() {
  if (qaTimerInterval) {
    clearInterval(qaTimerInterval);
    qaTimerInterval = null;
  }
}

function startQaTimer() {
  if (qaTimerStarted) return;
  qaTimerStarted = true;
  stopQaTimer();
  qaTimerInterval = setInterval(() => {
    qaElapsedSeconds += 1;
    updateQaTimerUI();
  }, 1000);
}

function renderQaBuilder() {
  if (!qaQuestionLineEl || !qaAnswerLineEl || !qaWordBankEl) return;
  const activeLine = qaQuestionSolved ? "answer" : "question";

  qaQuestionLineEl.innerHTML = qaQuestionBuilt.length
    ? qaQuestionBuilt.map((chip) => `<button class="qa-chip placed" data-chip-id="${chip.id}" data-source="question" type="button">${chip.token}</button>`).join("")
    : '<span class="qa-placeholder">Question энд үгсээ байрлуулна.</span>';

  qaAnswerLineEl.innerHTML = qaAnswerBuilt.length
    ? qaAnswerBuilt.map((chip) => `<button class="qa-chip placed" data-chip-id="${chip.id}" data-source="answer" type="button">${chip.token}</button>`).join("")
    : '<span class="qa-placeholder">Answer энд үгсээ байрлуулна.</span>';

  qaAnswerLineEl.classList.toggle("locked", !qaQuestionSolved);

  qaWordBankEl.innerHTML = qaBank.map((chip) => `<button class="qa-chip" data-chip-id="${chip.id}" type="button">${chip.token}</button>`).join("");

  qaWordBankEl.querySelectorAll(".qa-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chipIndex = qaBank.findIndex((chip) => chip.id === btn.dataset.chipId);
      if (chipIndex < 0) return;
      const [chip] = qaBank.splice(chipIndex, 1);
      if (activeLine === "question") qaQuestionBuilt.push(chip);
      else qaAnswerBuilt.push(chip);
      renderQaBuilder();
      updateQaBuiltTextPreview();
    });
  });

  [qaQuestionLineEl, qaAnswerLineEl].forEach((lineEl) => {
    lineEl.querySelectorAll(".qa-chip.placed").forEach((btn) => {
      btn.addEventListener("click", () => {
        const source = btn.dataset.source;
        const lineRef = source === "question" ? qaQuestionBuilt : qaAnswerBuilt;
        const idx = lineRef.findIndex((chip) => chip.id === btn.dataset.chipId);
        if (idx < 0) return;
        const [chip] = lineRef.splice(idx, 1);
        qaBank.push(chip);
        renderQaBuilder();
        updateQaBuiltTextPreview();
      });
    });
  });
}

function updateQaBuiltTextPreview() {
  if (!qaFeedbackEl) return;
  const questionText = formatQaBuiltLine(qaQuestionBuilt.map((chip) => chip.token));
  const answerText = formatQaBuiltLine(qaAnswerBuilt.map((chip) => chip.token));
  qaFeedbackEl.textContent = `Q: ${questionText || "..."} | A: ${answerText || "..."}`;
}

function setupQaRound() {
  const round = getQaCurrentRound();
  qaQuestionSolved = false;
  qaQuestionBuilt = [];
  qaAnswerBuilt = [];
  qaBank = qaShuffle(QA_WORD_BANK_BASE).map((token, index) => ({ id: `${Date.now()}-${index}-${Math.random()}`, token }));

  qaMnQuestionEl.textContent = round.mnQuestion;
  qaMnAnswerEl.textContent = round.mnAnswer;
  qaEnQuestionEl.textContent = round.enQuestion;
  qaEnAnswerEl.textContent = round.enAnswer;
  qaEnQuestionWrap.classList.add("hidden");
  qaEnAnswerWrap.classList.add("hidden");
  if (qaToggleQuestionBtn) qaToggleQuestionBtn.textContent = "Асуултыг харах";
  if (qaToggleAnswerBtn) qaToggleAnswerBtn.textContent = "Хариултыг харах";

  renderQaBuilder();
  updateQaBuiltTextPreview();
}

function checkQaAnswer() {
  const round = getQaCurrentRound();
  const targetQuestion = round.enQuestion.split(" ");
  const targetAnswer = round.enAnswer.split(" ");
  const questionTokens = qaQuestionBuilt.map((chip) => chip.token);
  const answerTokens = qaAnswerBuilt.map((chip) => chip.token);

  if (!qaQuestionSolved) {
    if (questionTokens.length !== targetQuestion.length) {
      qaFeedbackEl.textContent = "Асуултын үгийн тоо дутуу/илүү байна.";
      return;
    }
    const isQuestionCorrect = questionTokens.every((token, idx) => token === targetQuestion[idx]);
    if (!isQuestionCorrect) {
      qaFeedbackEl.textContent = "Асуулт буруу байна. Дахин оролдоорой.";
      return;
    }
    qaQuestionSolved = true;
    qaFeedbackEl.textContent = "✅ Асуулт зөв! Одоо хариултаа бүтээнэ үү.";
    renderQaBuilder();
    return;
  }

  if (answerTokens.length !== targetAnswer.length) {
    qaFeedbackEl.textContent = "Хариултын үгийн тоо дутуу/илүү байна.";
    return;
  }
  const isAnswerCorrect = answerTokens.every((token, idx) => token === targetAnswer[idx]);
  if (!isAnswerCorrect) {
    qaFeedbackEl.textContent = "Хариулт буруу байна. Дахин оролдоорой.";
    return;
  }

  qaFeedbackEl.textContent = "🎉 Баяр хүргэе! Дараагийн тойрог...";
  qaRoundIndex = (qaRoundIndex + 1) % qaRoundPool.length;
  setupQaRound();
}

function openQaModal(title, htmlBody) {
  if (!qaModalEl || !qaModalTitleEl || !qaModalBodyEl) return;
  qaModalTitleEl.textContent = title;
  qaModalBodyEl.innerHTML = htmlBody;
  qaModalEl.classList.remove("hidden");
}

function closeQaModal() {
  if (!qaModalEl) return;
  qaModalEl.classList.add("hidden");
}

function selectQaLevel(levelKey) {
  qaGameLevel = levelKey;
  qaRoundPool = levelKey === "beginner" ? [QA_ROUNDS[0]] : [QA_ROUNDS[0], QA_ROUNDS[1]];
  qaRoundIndex = 0;
  qaRoundPanelEl.classList.remove("hidden");
  qaLevelOptionsEl.classList.add("hidden");
  qaLevelSelectBtn.textContent = `Сонгосон түвшин: ${levelKey === "beginner" ? "Анхан" : levelKey === "intermediate" ? "Дунд" : "Дээд"}`;
  setupQaRound();
  startQaTimer();
}

function resetQaGameScreen() {
  qaGameLevel = null;
  qaRoundPool = [];
  qaRoundIndex = 0;
  qaBank = [];
  qaQuestionBuilt = [];
  qaAnswerBuilt = [];
  qaQuestionSolved = false;
  qaElapsedSeconds = 0;
  qaUnlockedRewards = 0;
  qaTimerStarted = false;
  stopQaTimer();
  updateQaTimerUI();
  renderQaRewards();
  qaRoundPanelEl.classList.add("hidden");
  qaLevelOptionsEl.classList.add("hidden");
  qaLevelSelectBtn.textContent = "Тоглох ангилалаа сонгоорой";
  qaFeedbackEl.textContent = "";
}

// ---- Events ----
loadTtsSettings();
updateTtsControlState();
loadSoundSettings();
updateSoundToggleState();
ensureAudioUnlocked();
loadSentenceGameClimbLevel();
renderSentenceGameClimb(sentenceGameClimbLevel);
loadSentenceGameRewardState();
updateSentenceGameRewardLevel({ allowBanner: false });
persistSentenceGameRewardState();
loadPremiumStatus();
loadProfileName();
loadProgressState();
updateHeaderStatus();
updateProfileUI();
updateStatsUI();
persistPremiumStatus();
persistProgressState();

renderSentencesRewards();
updateSentencesTimerUI();

if (sentenceGameTipTextEl) {
  sentenceGameTipTextEl.textContent = SENTENCE_GAME_TIP_TEXT;
}

if (sentenceGameTipToggleBtn) {
  sentenceGameTipToggleBtn.addEventListener("click", toggleSentenceGameTipPanel);
}

if (sentenceGameTipSpeakBtn) {
  sentenceGameTipSpeakBtn.addEventListener("click", speakSentenceGameTip);
}

if (sentenceGameTipStopBtn) {
  sentenceGameTipStopBtn.addEventListener("click", stopSentenceGameTipSpeech);
}

if (sentenceGameTipReadBtn) {
  sentenceGameTipReadBtn.addEventListener("click", showSentenceGameTipText);
}

if (sentenceGameTipCloseBtn) {
  sentenceGameTipCloseBtn.addEventListener("click", closeSentenceGameTipPanel);
}

if (sentenceGameDifficultyToggleBtn) {
  sentenceGameDifficultyToggleBtn.addEventListener("click", () => {
    const nextOpen = sentenceGameDifficultyPanelEl ? sentenceGameDifficultyPanelEl.classList.contains("hidden") : false;
    setSentenceGameDifficultyPanelOpen(nextOpen);
  });
}

sentenceGameDifficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectSentenceGameDifficulty(btn.dataset.difficulty || "beginner", { collapsePanel: true });
  });
});

updateSentenceGameTipControls();
resetQaGameScreen();

if (qaLevelSelectBtn) {
  qaLevelSelectBtn.addEventListener("click", () => {
    qaLevelOptionsEl.classList.toggle("hidden");
  });
}

qaLevelButtons.forEach((btn) => {
  btn.addEventListener("click", () => selectQaLevel(btn.dataset.qaLevel));
});

if (qaCheckBtn) qaCheckBtn.addEventListener("click", checkQaAnswer);
if (qaToggleQuestionBtn) {
  qaToggleQuestionBtn.addEventListener("click", () => {
    const willShow = qaEnQuestionWrap.classList.contains("hidden");
    qaEnQuestionWrap.classList.toggle("hidden", !willShow);
    qaToggleQuestionBtn.textContent = willShow ? "Асуултыг нуух" : "Асуултыг харах";
  });
}
if (qaToggleAnswerBtn) {
  qaToggleAnswerBtn.addEventListener("click", () => {
    const willShow = qaEnAnswerWrap.classList.contains("hidden");
    qaEnAnswerWrap.classList.toggle("hidden", !willShow);
    qaToggleAnswerBtn.textContent = willShow ? "Хариултыг нуух" : "Хариултыг харах";
  });
}
if (qaGameBackBtn) qaGameBackBtn.addEventListener("click", () => requestNavigation("home"));
if (qaShowSentencesBtn) {
  qaShowSentencesBtn.addEventListener("click", () => openQaModal("Бүтэн өгүүлбэрүүд", `<p>Where are you from ? - I am from Mongolia</p><p>Чи хэзээ ирсэн бэ ? - Би Монголоос ирсэн.</p><p>When did you come to China ? - I arrived in China yesterday.</p><p>Чи хэзээ ирсэн бэ ?  - Би өчигдөр Хятадад ирсэн.</p>`));
}
if (qaShowHelpBtn) {
  qaShowHelpBtn.addEventListener("click", () => openQaModal("Тоглоомын тайлбар", `<p>${QA_LONG_EXPLANATION_TEXT}</p>`));
}
if (qaModalCloseBtn) qaModalCloseBtn.addEventListener("click", closeQaModal);
if (qaModalEl) qaModalEl.addEventListener("click", (event) => { if (event.target === qaModalEl) closeQaModal(); });

loadSentenceGameDifficulty();
setSentenceGameDifficultyPanelOpen(false);
updateSentenceFilterActiveState();

levelButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    levelButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    level = btn.dataset.level;
    updateHeaderStatus();
  });
});

function updateSentenceFilterActiveState() {
  sentenceFilterButtons.forEach((btn) => {
    const isActive = btn.dataset.filter === sentenceFilter;
    btn.classList.toggle("active", isActive);
  });
}

sentenceFilterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sentenceFilter = btn.dataset.filter;
    updateSentenceFilterActiveState();
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

if (ttsRateSlider) {
  ttsRateSlider.addEventListener("input", () => {
    ttsSettings.rate = Math.round(Number(ttsRateSlider.value) * 20) / 20;
    updateTtsControlState();
    persistTtsSettings();
  });
}

soundToggleButtons.forEach(toggleBtn => {
  toggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) {
      stopSpeaking();
    }
    updateSoundToggleState();
    persistSoundSettings();
  });
});

navHomeBtn.addEventListener("click", () => requestNavigation("home"));
navSentencesBtn.addEventListener("click", () => requestNavigation("sentences"));
navSentenceGameBtn.addEventListener("click", () => requestNavigation("sentence-game"));
if (navQaGameBtn) navQaGameBtn.addEventListener("click", () => requestNavigation("qa-game"));
navStatsBtn.addEventListener("click", () => requestNavigation("stats"));
navProfileBtn.addEventListener("click", () => requestNavigation("profile"));

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

if (introToggleBtn) {
  introToggleBtn.addEventListener("click", toggleStartIntroPanel);
}

if (introCloseBtn) {
  introCloseBtn.addEventListener("click", hideStartIntroPanel);
}

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);
backBtn.addEventListener("click", backToStart);
sentenceGameUndoBtn.addEventListener("click", undoSentenceGameMove);
sentenceGameShowCorrectBtn.addEventListener("click", showSentenceGameCorrectAnswer);
sentenceGameRetryBtn.addEventListener("click", retrySentenceGameRound);
if (sentenceGamePrevBtn) {
  sentenceGamePrevBtn.addEventListener("click", prevSentenceGameRound);
}
sentenceGameNextBtn.addEventListener("click", nextSentenceGameRound);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    endSentenceGameSession();
    return;
  }

  if (sentenceGameScreenVisible()) {
    beginSentenceGameSession();
  }
});

window.addEventListener("pagehide", () => {
  endSentenceGameSession();
});

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
}


if (profileNameInput) {
  profileNameInput.addEventListener("input", () => {
    profileName = profileNameInput.value.trim();
    persistProfileName();
    updateProfileUI();
  });
}

if (upgradePremiumBtn) {
  upgradePremiumBtn.addEventListener("click", () => {
    openPremiumModal("Төлбөрийн хэсэг удахгүй (Play Store / App Store In-App Purchase)");
  });
}

if (statsResetBtn) {
  statsResetBtn.addEventListener("click", resetStatistics);
}

if (premiumOkBtn) {
  premiumOkBtn.addEventListener("click", closePremiumModal);
}

if (premiumOverlay) {
  premiumOverlay.addEventListener("click", (event) => {
    if (event.target === premiumOverlay) closePremiumModal();
  });
}


registerServiceWorker();

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallHintVisibility();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  updateInstallHintVisibility();
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallHintVisibility();
  });
}

updateInstallHintVisibility();

loadSentences();
