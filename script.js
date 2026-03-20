import {
  STORAGE_KEYS,
} from "./storage.js";
import {
  createDefaultCoreState,
  DEFAULT_TTS_SETTINGS,
  getBoardEntryState,
  getCoreState,
  getState,
  resetBoardEntryState,
  setStateValue,
  subscribeState,
  updateBoardEntryState,
  updateState,
} from "./state.js";
import {
  applyProgressPatch,
  claimReward,
  clearPersistedCoreState,
  completeLesson,
  loadCoreState,
  markWordLearned,
  replaceProgress,
  resetCoreState,
  saveCoreState,
  unlockChapter,
  updateSelections,
  updateSettings,
  updateStreak,
} from "./actions.js";
import { setSoundEnabled as setGlobalSoundEnabled } from "./audio.js";
import { initHomeScreen } from "./home-screen.js";
import { initChapterCoverScreen } from "./chapter-cover-screen.js";
import { BOARD_WORLD_CHAPTERS, getChapterConfig, getDefaultChapterForWorld, resolveBoardSelectionRoute, resolveChapterContent } from "./chapters.js";
import { initBoardScreen } from "./board-screen.js";
import { initLessonScreen } from "./lesson-screen.js";
import { LESSON_TRANSLATIONS, buildOptions, levelName, resolveLessonContent } from "./lesson.js";
import { initStatsScreen } from "./stats-screen.js";
import { createVaultManager } from "./vault-manager.js";
import { createAppTimerManager } from "./app-timer.js";
import { createScreenNavigator } from "./screen-navigation.js";
import { ASSETS, REWARD_ICON_SEQUENCE } from "./assets.js";
import {
  renderHomeScreen,
  setHomeModesPanelOpen,
  setStartIntroOpen,
  setStartLevelMenuOpen as renderStartLevelMenuOpen,
  updateStartButtonLabel as renderStartButtonLabel,
} from "./render-home.js";
import {
  renderBoardScreen,
  updateBoardToken,
  renderBoardChapterPanel,
  renderBoardMeta,
  renderBoardRollState,
  renderBoardChallenge,
  renderBoardFeedbackVisual,
  renderBoardPopup,
} from "./render-board.js";
import { renderLessonScreen, renderLessonAnswerState } from "./render-lesson.js";
import {
  bindClickOnce,
  bindManagedEvent,
  hasClickBinding,
  hideElement,
  isHidden,
  setActiveState,
  setCheckedState,
  setDisabledState,
  setExpandedState,
  setHidden,
  setPressedState,
  setSelectedState,
  showElement,
  syncToggleButtons,
  toggleClass,
} from "./ui.js";
import { bindModalDismissal, closeModal, openModal } from "./modal.js";
import {
  hydrateRewardImagesByLevel,
  hydrateRewardStripImages,
  renderRewards,
  renderRewardStripTiles,
} from "./render-rewards.js";
import { BOARD_GAME_CONFIG, buildBoardGameTiles, boardTileEmoji } from "./board-game.js";
import {
  SENTENCE_GAME_CLIMB_POSITIONS,
  SENTENCE_GAME_CORRECT_TOAST,
  SENTENCE_GAME_DEBUG,
  SENTENCE_GAME_DIFFICULTY_LABELS,
  SENTENCE_GAME_IDLE_TIMEOUT_SECONDS,
  SENTENCE_GAME_INCORRECT_TOAST,
  SENTENCE_GAME_REWARD_BANNERS,
  SENTENCE_GAME_REWARD_THRESHOLDS,
  SENTENCE_GAME_SHOW_CORRECT_TOAST,
  SENTENCE_GAME_SUCCESS_TOAST_LOCK_MS,
  SENTENCE_GAME_TIP_TEXT,
  SENTENCE_GAME_TOAST_DURATION,
  SENTENCE_GAME_TOAST_MAX_DURATION,
  SENTENCE_GAME_TOAST_SPEECH_DELAY,
  SENTENCE_GAME_TOAST_SPEECH_END_BUFFER,
  SENTENCE_GAME_DATA_PATH,
  prepareSentenceItems,
  tokenizeSentence,
} from "./sentence-game.js";
import {
  QA_LONG_EXPLANATION_TEXT,
  QA_REWARD_STEPS,
  QA_ROUNDS,
  formatQaBuiltLine,
  getQaWordBankTokens,
  qaRoundPoolForLevel,
  qaShuffle,
} from "./qa-game.js";
import { initDebugTools } from "./debug-tools.js";
import { getSelectableBoardWorlds, getWorldAudioTrack, getWorldConfig } from "./worlds.js";
import {
  BOARD_SELECTOR_STEPS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_LEVEL_LIST,
  FLOW_DESTINATIONS,
  GAME_MODES,
  REWARD_TABS,
  SCREEN_NAMES,
  STATS_PERIODS,
  getDifficultyOption,
  WORLD_IDS,
} from "./constants.js";

// ======================
// NomadSpeak Quiz Engine
// 4 options • 3 levels • score • end screen
// ======================

// ---- Lesson content lives in lesson.js; script.js keeps orchestration only. ----

// ---- DOM ----
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const sentencesScreen = document.getElementById("sentences-screen");
const statsScreen = document.getElementById("stats-screen");
const sentenceGameScreen = document.getElementById("sentence-game-screen");
const qaGameScreen = document.getElementById("qa-game-screen");
const boardGameIntroScreen = document.getElementById("board-game-intro-screen");
const boardGameScreen = document.getElementById("board-game-screen");
const profileScreen = document.getElementById("profile-screen");
const endScreen = document.getElementById("end-screen");
let debugUnlockedChapterIds = BOARD_WORLD_CHAPTERS[0] ? [BOARD_WORLD_CHAPTERS[0].id] : [];

hydrateRewardImagesByLevel({
  imageEls: document.querySelectorAll(".reward-img[data-level]"),
  rewardIcons: REWARD_ICON_SEQUENCE,
});

hydrateRewardStripImages({
  imageEls: document.querySelectorAll("#sentence-game-reward-row .reward-img"),
  rewardIcons: REWARD_ICON_SEQUENCE,
});

const topbar = document.getElementById("topbar");
const levelLabel = document.getElementById("level-label");
const scoreEl = document.getElementById("score");
const progressEl = document.getElementById("progress");

let questionEl = document.getElementById("question");
let optionsEl = document.getElementById("options");
let resultEl = document.getElementById("result");

const startBtn = document.getElementById("start-btn");
const introToggleBtn = document.getElementById("intro-toggle-btn");
const introPanel = document.getElementById("intro-panel");
const finalTextEl = document.getElementById("final-text");

const navModesBtn = document.getElementById("nav-modes-btn");
const homeModesPanel = document.getElementById("home-modes-panel");

const startLevelDropdown = document.getElementById("start-level-dropdown");
const startLevelOptions = document.querySelectorAll(".start-level-option");
const sentencesLevelPickerEl = document.getElementById("sentences-level-picker");
const sentencesLevelPickerBtn = document.getElementById("sentences-level-picker-btn");
const sentencesLevelOptionsEl = document.getElementById("sentences-level-options");
const sentencesLevelOptionButtons = document.querySelectorAll(".sentences-level-option");
const sentencesListEl = document.getElementById("sentences-list");
const voiceOptionButtons = document.querySelectorAll(".tts-option-btn[data-voice]");
const ttsRateSlider = document.getElementById("tts-rate-slider");
const ttsRateValueEl = document.getElementById("tts-rate-value");
const soundToggleButtons = document.querySelectorAll(".sound-toggle-btn");
const playExitButtons = document.querySelectorAll(".play-exit-btn, .game-exit-btn");
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
const sentenceGameRewardRowEl = document.getElementById("sentence-game-reward-row");
const sentenceGameRewardImageEls = sentenceGameRewardRowEl ? sentenceGameRewardRowEl.querySelectorAll(".reward-img") : [];
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
const statsThisWeekTimeEl = document.getElementById("stats-this-week-time");
const statsLastWeekTimeEl = document.getElementById("stats-last-week-time");
const statsThisMonthTimeEl = document.getElementById("stats-this-month-time");
const statsLast7DaysEl = document.getElementById("stats-last-7-days");
const statsPeriodButtons = document.querySelectorAll(".stats-period-btn");
const statsKpiLabelEl = document.getElementById("stats-kpi-label");
const statsKpiValueEl = document.getElementById("stats-kpi-value");
const statsKpiNormEl = document.getElementById("stats-kpi-norm");
const statsKpiPercentEl = document.getElementById("stats-kpi-percent");
const statsThermometerFillEl = document.getElementById("stats-thermometer-fill");
const statsThermometerMarkerEl = document.getElementById("stats-thermometer-marker");
const statsThermometerTierEl = document.getElementById("stats-thermometer-tier");
const statsRewardTabButtons = document.querySelectorAll(".stats-reward-tab");
const statsRewardCardsEl = document.getElementById("stats-reward-cards");
const todayTimeEls = document.querySelectorAll("[id^='today-time-']");
const timeDetailsYesterdayEl = document.getElementById("time-details-yesterday");
const timeDetailsThisWeekEl = document.getElementById("time-details-this-week");
const timeDetailsLastWeekEl = document.getElementById("time-details-last-week");
const timeDetailsThisMonthEl = document.getElementById("time-details-this-month");
const timeDetailsLastMonthEl = document.getElementById("time-details-last-month");

const qaRewardBarEl = document.getElementById("qa-reward-bar");
const qaRewardImageEls = () => qaRewardBarEl ? qaRewardBarEl.querySelectorAll(".reward-img") : [];
const lessonRewardBarEl = document.getElementById("lesson-reward-bar");
const lessonRewardImageEls = () => lessonRewardBarEl ? lessonRewardBarEl.querySelectorAll(".reward-img") : [];
const sentencesRewardStripEl = document.getElementById("sentences-reward-strip");
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

let statsSelectedPeriod = STATS_PERIODS.DAY;
let statsRewardTab = REWARD_TABS.DAYS;
const installHintEl = document.getElementById("install-hint");
const installBtn = document.getElementById("install-btn");
const worldFeedbackHubEl = document.getElementById("world-feedback-hub");
const lessonCompanionLineEl = document.getElementById("lesson-companion-line");
const sentencesCompanionLineEl = document.getElementById("sentences-companion-line");

const boardGameBoardEl = document.getElementById("board-game-board");
const boardGameTokenEl = document.getElementById("board-game-token");
const boardGameRollBtn = document.getElementById("board-game-roll-btn") || document.getElementById("board-game-dice");
const boardGamePositionEl = document.getElementById("board-game-position");
const boardGameTotalTilesEl = document.getElementById("board-game-total-tiles");
const boardGameLastRollEl = document.getElementById("board-game-last-roll");
const boardGameChapterTitleEl = document.getElementById("board-game-chapter-title");
const boardGameChapterTextEl = document.getElementById("board-game-chapter-text");
const boardGameChallengeTitleEl = document.getElementById("board-game-challenge-title");
const boardGameChallengeTextEl = document.getElementById("board-game-challenge-text");
const boardGameScreenTitleEl = document.getElementById("board-game-screen-title");
const boardGameFeedbackEl = document.getElementById("board-game-feedback");
const boardGameOptionsEl = document.getElementById("board-game-options");
const boardGameDiceEl = document.getElementById("board-game-dice");
const boardGameXpEl = document.getElementById("board-game-xp");
const boardGameCoinsEl = document.getElementById("board-game-coins");
const boardGameChapterIndexEl = document.getElementById("board-game-chapter-index");


const boardGameFeedbackHubEl = document.getElementById("board-game-feedback-hub");
const boardGameParticlesEl = document.getElementById("board-game-particles");


const lessonVaultBtn = document.getElementById("lesson-vault-btn");
const lessonVaultBadge = document.getElementById("lesson-vault-badge");
const lessonSaveBtn = document.getElementById("lesson-save-btn");
const sentencesVaultBtn = document.getElementById("sentences-vault-btn");
const sentencesVaultBadge = document.getElementById("sentences-vault-badge");
const sentencesSaveBtn = document.getElementById("sentences-save-btn");
const sentenceGameVaultBtn = document.getElementById("sentence-game-vault-btn");
const sentenceGameVaultBadge = document.getElementById("sentence-game-vault-badge");
const sentenceGameSaveBtn = document.getElementById("sentence-game-save-btn");
const qaVaultBtn = document.getElementById("qa-vault-btn");
const qaVaultBadge = document.getElementById("qa-vault-badge");
const qaSaveBtn = document.getElementById("qa-save-btn");
const vaultModalEl = document.getElementById("vault-modal");
const vaultModalTitleEl = document.getElementById("vault-modal-title");
const vaultModalBodyEl = document.getElementById("vault-modal-body");
const vaultModalCloseBtn = document.getElementById("vault-modal-close-btn");
const vaultReplayBtn = document.getElementById("vault-replay-btn");
const vaultDeleteBtn = document.getElementById("vault-delete-btn");
const vaultLearnedBtn = document.getElementById("vault-learned-btn");

// ---- State ----
let level = DIFFICULTY_LEVELS.BEGINNER;
let questions = [];
let currentIndex = 0;
let score = 0;
let locked = false;
let lessonReviewMode = false;

let sentenceItems = [];
let sentenceFilter = DIFFICULTY_LEVELS.BEGINNER;
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
let sentenceGameDifficulty = DIFFICULTY_LEVELS.BEGINNER;

const SENTENCE_GAME_ACTIVE_SECONDS_KEY = "sentenceGameActiveSeconds";
const SENTENCE_GAME_REWARD_LEVEL_KEY = "sentenceGameRewardLevel";
const SENTENCE_GAME_LAST_TICK_KEY = "sentenceGameLastTick";
const SENTENCE_GAME_DIFFICULTY_KEY = "sentenceGameDifficulty";

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
let qaTimerStartedAt = null;
let qaToastTimer = null;
let lessonElapsedSeconds = 0;
let lessonUnlockedRewards = 0;
let lessonTimerInterval = null;
let lessonTimerStartedAt = null;
let sentencesElapsedSeconds = 0;
let sentencesUnlockedRewards = 0;
let sentencesTimerInterval = null;

const SENTENCES_REWARD_STEPS = [...QA_REWARD_STEPS];

const SENTENCE_GAME_CLIMB_STORAGE_KEY = "sentenceGameClimbLevel";

const APP_TIME_DAILY_TOTALS_KEY = STORAGE_KEYS.appTimeDailyTotals;
const APP_TIME_ACTIVE_SESSION_KEY = STORAGE_KEYS.appTimeActiveSession;
const FREE_DAILY_XP_LIMIT = 10;
let appSettings = getCoreState().settings;
let audioContext = null;
let audioPrimed = false;
let audioInteractionUnlocked = false;
const BACKGROUND_AUDIO_ENABLED = true;
let completionBannerTimer = null;
function syncCoreStateReferences() {
  const coreState = getCoreState();
  progressState = coreState.progress;
  appSettings = coreState.settings;
  return coreState;
}

function renderCoreStateSnapshot() {
  syncCoreStateReferences();
  updateSoundToggleState();
  renderProfileSnapshot();
  renderStatsSnapshot();
}

function persistCoreAppState() {
  syncCoreStateReferences();
  saveCoreState();
}

function schedulePostStartupTask(task, { timeout = 1200 } = {}) {
  if (typeof task !== "function") return;

  const runTask = () => {
    try {
      task();
    } catch (error) {
      console.error("[NomadSpeak] Deferred startup task failed.", error);
    }
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(runTask, { timeout });
    return;
  }

  window.setTimeout(runTask, 0);
}

const SOUND_EVENT_HOOKS = {
  diceRoll: "dice-roll",
  answerCorrect: "answer-correct",
  answerWrong: "answer-wrong",
  chestReward: "chest-reward",
  progression: "progression",
};

let progressState = getCoreState().progress;


let deferredInstallPrompt = null;
let appTimeUiInterval = null;
let appInitialized = false;
let stateSubscriptionsInitialized = false;
let sentenceItemsLoadPromise = null;
let boardGameBootstrapped = false;

const SCREEN_IDS = {
  [startScreen.id]: SCREEN_NAMES.START,
  [quizScreen.id]: SCREEN_NAMES.LESSON,
  [sentencesScreen.id]: SCREEN_NAMES.SENTENCES,
  [sentenceGameScreen.id]: SCREEN_NAMES.SENTENCE_GAME,
  [qaGameScreen.id]: SCREEN_NAMES.QA_GAME,
  [boardGameIntroScreen.id]: SCREEN_NAMES.CHAPTER_COVER,
  [boardGameScreen.id]: SCREEN_NAMES.BOARD,
  [statsScreen.id]: SCREEN_NAMES.STATS,
  [profileScreen.id]: SCREEN_NAMES.PROFILE,
  [endScreen.id]: "end",
};

const SCREENS = {
  start: startScreen,
  lesson: quizScreen,
  sentences: sentencesScreen,
  [SCREEN_NAMES.SENTENCE_GAME]: sentenceGameScreen,
  [SCREEN_NAMES.QA_GAME]: qaGameScreen,
  [SCREEN_NAMES.CHAPTER_COVER]: boardGameIntroScreen,
  [SCREEN_NAMES.BOARD]: boardGameScreen,
  stats: statsScreen,
  profile: profileScreen,
  end: endScreen,
};

const SCREEN_REGISTRY = {};
let activeScreenId = null;

function setAppMode(mode) {
  if (!document.body) return;
  const resolvedMode = mode === GAME_MODES.HOME ? GAME_MODES.HOME : GAME_MODES.LEARNING;
  document.body.dataset.mode = resolvedMode;
  document.body.classList.toggle("mode-home", resolvedMode === GAME_MODES.HOME);
  document.body.classList.toggle("mode-learning", resolvedMode === GAME_MODES.LEARNING);
}

function unregisterServiceWorkers() {
  if (!("serviceWorker" in navigator) || typeof navigator.serviceWorker.getRegistrations !== "function") return;

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  }).catch(() => {
    // silent fail in unsupported/private contexts
  });
}

function isWrapperLikeRuntime() {
  const protocol = window.location.protocol;
  if (!["http:", "https:"].includes(protocol)) return true;

  const userAgent = navigator.userAgent || "";
  return /Android.*Version\/|\bwv\)|WebView|; wv\b|FBAN|FBAV|Instagram|Line\//i.test(userAgent);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const isSecureContext = window.location.protocol === "https:";
  const shouldAvoidServiceWorker = isLocal || !isSecureContext || isWrapperLikeRuntime();

  if (shouldAvoidServiceWorker) {
    unregisterServiceWorkers();
    return;
  }

  const serviceWorkerUrl = new URL("./service-worker.js", window.location.href);

  navigator.serviceWorker.register(serviceWorkerUrl, { scope: "./" }).catch(() => {
    // silent fail in unsupported/private contexts
  });
}

function updateInstallHintVisibility() {
  if (!installHintEl) return;

  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const shouldHideInstallHint = standalone || isWrapperLikeRuntime();
  if (shouldHideInstallHint) {
    hideElement(installHintEl);
    return;
  }

  if (deferredInstallPrompt) {
    showElement(installHintEl);
  } else {
    hideElement(installHintEl);
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

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (_error) {
    return false;
  }
}

function safeLocalStorageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (_error) {
    return false;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function lessonMnTranslation(value) {
  if (!value) return "";
  return LESSON_TRANSLATIONS.questionMnByEn[value]
    || LESSON_TRANSLATIONS.answerMnByEn[value]
    || "";
}

function saveCurrentSentencesItem() {
  const visible = filteredSentences();
  if (!visible.length) return;
  const active = visible.find((item) => String(item.id) === String(speakingSentenceId || ""));
  saveSentenceListItem(active || visible[0]);
}

let appTimerManager = null;
let vaultManager = null;
let screenNavigator = null;

function vaultKeyForScreen(screenId) {
  return vaultManager?.keyForScreen(screenId) || `repeatVault_${screenId}`;
}

function updateVaultBadge(key) {
  vaultManager?.updateBadge(key);
}

function renderVaultModal(key) {
  vaultManager?.renderModal(key);
}

function saveSentenceListItem(item) {
  vaultManager?.saveSentenceListItem(item);
}

function saveCurrentLessonItem() {
  const item = questions[currentIndex];
  if (!item) return;
  const options = buildOptions(item.a);
  const optionMnMap = options.reduce((acc, option) => {
    acc[option] = lessonMnTranslation(option);
    return acc;
  }, {});
  const payload = {
    id: `lesson:${item.q.toLowerCase().trim()}`,
    questionText: item.q,
    questionMn: item.qMn || lessonMnTranslation(item.q),
    correctAnswer: item.a,
    correctAnswerMn: item.aMn || lessonMnTranslation(item.a),
    options,
    optionMnMap,
    level: levelName(level),
    timestamp: Date.now(),
  };
  const key = vaultKeyForScreen(SCREEN_NAMES.LESSON);
  const result = vaultManager?.saveToVault(key, payload);
  updateVaultBadge(key);
  vaultManager?.showSaveResult(result);
}

function saveCurrentQaRound() {
  const round = getQaCurrentRound();
  if (!round) return;
  const payload = {
    id: `qna:${round.id}`,
    mnQuestion: round.mnQuestion,
    mnAnswer: round.mnAnswer,
    enQuestion: round.enQuestion,
    enAnswer: round.enAnswer,
    level: levelName(qaGameLevel || "beginner"),
    timestamp: Date.now(),
  };
  const key = vaultKeyForScreen("qna");
  const result = vaultManager?.saveToVault(key, payload);
  updateVaultBadge(key);
  vaultManager?.showSaveResult(result);
}

function saveCurrentSentenceGameItem() {
  const item = sentenceGameSentence();
  if (!item) return;
  const payload = {
    id: `sentenceGame:${String(item.en || "").toLowerCase().trim()}`,
    enSentence: item.en,
    mnTranslation: item.mn || "",
    level: levelName(sentenceGameDifficulty),
    timestamp: Date.now(),
  };
  const key = vaultKeyForScreen("sentenceGame");
  const result = vaultManager?.saveToVault(key, payload);
  updateVaultBadge(key);
  vaultManager?.showSaveResult(result);
}

function showScreen(screenId) {
  screenNavigator?.showScreen(screenId);
}

function syncBoardEntryFlowState(options) {
  return screenNavigator?.syncBoardEntryFlowState(options);
}

function navigateTo(destination) {
  screenNavigator?.navigateTo(destination);
}

function requestNavigation(destination) {
  screenNavigator?.requestNavigation(destination);
}


function getLocalDateKey(date = new Date()) {
  return appTimerManager?.getLocalDateKey(date) || "";
}

function getTodayKey() {
  return getLocalDateKey(new Date());
}

function getAppTimeDailyTotals() {
  return appTimerManager?.getAppTimeDailyTotals() || {};
}

function addSecondsToDate(dateKey, seconds) {
  appTimerManager?.addSecondsToDate(dateKey, seconds);
}

function previousDayKey(dayKey) {
  return appTimerManager?.previousDayKey(dayKey) || "";
}

function loadProgressState(options) {
  appTimerManager?.loadProgressState(options);
}

function syncProgressForToday() {
  appTimerManager?.syncProgressForToday();
}

function persistProgressState() {
  appTimerManager?.persistProgressState();
}

function refreshTimeSummaryUI() {
  appTimerManager?.refreshTimeSummaryUI();
}

function readActiveSession() {
  return appTimerManager?.readActiveSession() || null;
}

function startSession(screenId) {
  appTimerManager?.startSession(screenId);
}

function stopSession() {
  appTimerManager?.stopSession();
}

function ensureStoppedIfHidden() {
  appTimerManager?.ensureStoppedIfHidden();
}

function persistAllActiveTime() {
  appTimerManager?.persistAllActiveTime();
}

function formatHHMMSS(totalSeconds) {
  return appTimerManager?.formatHHMMSS(totalSeconds) || "00:00:00";
}

function startTimeUiUpdater() {
  appTimerManager?.startTimeUiUpdater();
}

function stopTimeUiUpdater() {
  appTimerManager?.stopTimeUiUpdater();
}

function showVaultToast(message) {
  showQaToast(message);
}

function loadPremiumStatus() {
  syncCoreStateReferences();
}

function loadProfileName() {
  syncCoreStateReferences();
}

function openPremiumModal(message, title = "Дээд багц") {
  if (!premiumOverlay || !premiumMessageEl) return;
  premiumTitleEl.textContent = title;
  premiumMessageEl.textContent = message;
  openModal(premiumOverlay, { titleEl: premiumTitleEl, title, bodyEl: premiumMessageEl, body: message });
}

function closePremiumModal() {
  if (!premiumOverlay) return;
  closeModal(premiumOverlay);
}

function canEarnMoreSentenceGameXp(amount = 0) {
  if (appSettings.premium) return true;
  loadProgressState();
  syncProgressForToday();
  return progressState.dailyXP + amount <= FREE_DAILY_XP_LIMIT;
}

function enforceFreeXpGate() {
  if (appSettings.premium) return false;
  loadProgressState();
  syncProgressForToday();
  if (progressState.dailyXP >= FREE_DAILY_XP_LIMIT) {
    openPremiumModal("Дээд багц авбал хязгааргүй болно", "Үнэгүй багцын хязгаарт хүрлээ");
    return true;
  }
  return false;
}

function renderProfileSnapshot() {
  if (profileNameInput) profileNameInput.value = appSettings.profileName;
  if (profileNameSaved) profileNameSaved.textContent = `Хадгалагдсан нэр: ${appSettings.profileName || "—"}`;
  if (profileTotalXpEl) profileTotalXpEl.textContent = String(progressState.xp);
  if (profileLevelEl) profileLevelEl.textContent = String(progressState.level);
  if (profileStreakDaysEl) profileStreakDaysEl.textContent = `${progressState.streak} өдөр`;
  if (profileDailyProgressEl) profileDailyProgressEl.textContent = `${progressState.todayCount}/${progressState.dailyGoalCount}`;
  if (profileRewardStageEl) profileRewardStageEl.textContent = `Tier ${progressState.rewardTierUnlocked}`;
  if (profilePlanStatusEl) profilePlanStatusEl.textContent = `Төлөв: ${appSettings.premium ? "Дээд багц" : "Үнэгүй"}`;
}

function updateProfileUI() {
  appTimerManager?.updateProfileUI();
}

function playDailyGoalSuccessChime() {
  if (!appSettings.soundEnabled) return;
  [988, 1319].forEach((frequency, index) => {
    setTimeout(() => {
      playTone({ frequency, type: "triangle", duration: 0.08, volume: 0.09, attack: 0.006, release: 0.08 });
    }, index * 90);
  });
}

function awardXP(amount, reason = "", eventId = "") {
  const earned = Number(amount);
  if (!Number.isFinite(earned) || earned <= 0) return;

  if (reason.startsWith("sentence_game") && !canEarnMoreSentenceGameXp(earned)) {
    openPremiumModal("Дээд багц авбал хязгааргүй болно", "Үнэгүй багцын хязгаарт хүрлээ");
    return;
  }

  loadProgressState();
  syncProgressForToday();

  const today = getTodayKey();
  const yesterday = previousDayKey(today);
  const wasDailyCompleted = progressState.dailyCompleted;
  const rewardFromTime = reason.startsWith("sentence_game")
    ? sentenceGameRewardLevelFromSeconds((progressState.todayMinutes || 0) * 60)
    : null;

  const nextProgress = completeLesson({
    xpEarned: earned,
    today,
    yesterday,
    countDailyProgress: reason === "sentence_game_success",
    rewardTierUnlocked: rewardFromTime,
    eventId,
  });

  syncCoreStateReferences();

  if (!wasDailyCompleted && nextProgress?.dailyCompleted) playDailyGoalSuccessChime();

  persistProgressState();

  if (SENTENCE_GAME_DEBUG) {
    console.log("[Progress] awardXP", { amount: earned, reason, ...progressState });
  }
}

function persistActionRewards({
  xp = 0,
  coins = 0,
  gems = 0,
  rewardTierUnlocked = null,
  progressEventId = "",
  rewardEventId = "",
  countDailyProgress = false,
} = {}) {
  loadProgressState();
  syncProgressForToday();

  const today = getTodayKey();
  const yesterday = previousDayKey(today);

  if (Number(xp) > 0) {
    completeLesson({
      xpEarned: xp,
      today,
      yesterday,
      countDailyProgress,
      rewardTierUnlocked,
      eventId: progressEventId,
    });
  }

  if (Number(coins) > 0 || Number(gems) > 0 || Number.isFinite(Number(rewardTierUnlocked))) {
    claimReward({
      coins,
      gems,
      rewardTierUnlocked,
      eventId: rewardEventId,
    });
  }

  syncCoreStateReferences();
  persistProgressState();
  renderCoreStateSnapshot();
}

function getGaugeTierBySeconds(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  if (safeSeconds >= 120 * 60) return { label: "Онц сайн", index: 4 };
  if (safeSeconds >= 60 * 60) return { label: "Сайн", index: 3 };
  if (safeSeconds >= 30 * 60) return { label: "Хэвийн", index: 2 };
  if (safeSeconds >= 20 * 60) return { label: "Дунд", index: 1 };
  return { label: "Муу", index: 0 };
}

function getGaugeTierByPercent(percent) {
  const safePercent = Math.max(0, Number(percent) || 0);
  if (safePercent >= 100) return { label: "Онц сайн", index: 4 };
  if (safePercent >= 75) return { label: "Сайн", index: 3 };
  if (safePercent >= 50) return { label: "Хэвийн", index: 2 };
  if (safePercent >= 25) return { label: "Дунд", index: 1 };
  return { label: "Муу", index: 0 };
}

function buildLast7DaysTimeRows() {
  const totals = getAppTimeDailyTotals();
  return Array.from({ length: 7 }, (_, index) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - index);
    const key = getLocalDateKey(dt);
    const label = dt.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" });
    return `<li><span class="chip-label">${label}</span><strong class="chip-time">${formatHHMMSS(totals[key] || 0)}</strong></li>`;
  }).reverse().join("");
}

function getRangeDays(baseDate, startOffsetDays) {
  return Array.from({ length: 7 }, (_, index) => {
    const dt = new Date(baseDate);
    dt.setDate(dt.getDate() + startOffsetDays + index);
    return dt;
  });
}

function rewardTierForDailySeconds(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (safeSeconds >= 120 * 60) return 5;
  if (safeSeconds >= 90 * 60) return 4;
  if (safeSeconds >= 60 * 60) return 3;
  if (safeSeconds >= 30 * 60) return 2;
  if (safeSeconds >= 20 * 60) return 1;
  return 0;
}

const statsRewardDefs = [
  { tier: 1, image: ASSETS.rewardIcons.flag, threshold: "20:00+", label: "Муу", alt: "Туг шагнал" },
  { tier: 2, image: ASSETS.rewardIcons.star, threshold: "30:00+", label: "Дунд", alt: "Од шагнал" },
  { tier: 3, image: ASSETS.rewardIcons.coin, threshold: "60:00+", label: "Хэвийн", alt: "Зоос шагнал" },
  { tier: 4, image: ASSETS.rewardIcons.trophy, threshold: "90:00+", label: "Сайн", alt: "Цом шагнал" },
  { tier: 5, image: ASSETS.rewardIcons.diamond, threshold: "120:00+", label: "Онц сайн", alt: "Эрдэнэ шагнал" },
];

function rewardTierByPercent(percent) {
  return getGaugeTierByPercent(percent).index + 1;
}

function getPercentRatingLabel(percent) {
  return getGaugeTierByPercent(percent).label;
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map((n) => Number(n));
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function getTotalsEntries() {
  const totals = getAppTimeDailyTotals();
  return Object.entries(totals).map(([key, value]) => ({
    key,
    date: parseDateKey(key),
    seconds: Math.max(0, Math.floor(Number(value) || 0)),
  })).filter((item) => item.date instanceof Date && !Number.isNaN(item.date.getTime()));
}

function getMonthTotalSeconds(monthIndex, year) {
  return getTotalsEntries().reduce((sum, item) => {
    if (item.date.getFullYear() === year && item.date.getMonth() === monthIndex) return sum + item.seconds;
    return sum;
  }, 0);
}

function getYearTotalSeconds(year) {
  return getTotalsEntries().reduce((sum, item) => item.date.getFullYear() === year ? sum + item.seconds : sum, 0);
}

function getDailyRatingLabel(seconds) {
  if (seconds >= 120 * 60) return "Онц сайн";
  if (seconds >= 60 * 60) return "Сайн";
  if (seconds >= 30 * 60) return "Хэвийн";
  if (seconds >= 20 * 60) return "Дунд";
  return "Муу";
}

function buildRewardCard({ title, subtitle, tier, thresholdText, tierLabel, range, ratingLabel, cardClass = "", imageClass = "" }) {
  const reward = statsRewardDefs[Math.max(0, Math.min(4, (tier || 1) - 1))];
  const titleMarkup = title ? `<p class="stats-reward-title chip-label">${title}</p>` : "";
  const rangeMarkup = range ? `<p class="stats-reward-range chip-label">${range}</p>` : "";
  const subtitleMarkup = subtitle ? `<p class="stats-reward-subtitle chip-label">${subtitle}</p>` : "";
  const tierMarkup = tierLabel ? `<p class="stats-reward-tier chip-label">${tierLabel}</p>` : "";
  const thresholdMarkup = thresholdText ? `<p class="stats-reward-threshold chip-label">${thresholdText}</p>` : "";
  const ratingMarkup = ratingLabel ? `<p class="stats-reward-rating chip-label">${ratingLabel}</p>` : "";
  const cardClasses = ["stats-reward-card", cardClass].filter(Boolean).join(" ");
  const imageClasses = ["stats-reward-img", imageClass].filter(Boolean).join(" ");
  return `<article class="${cardClasses}"><div class="stats-reward-main"><div class="stats-reward-left">${titleMarkup}${rangeMarkup}${subtitleMarkup}</div><div class="stats-reward-right">${thresholdMarkup}${ratingMarkup}${tierMarkup}</div></div><img class="${imageClasses}" src="${reward.image}" alt="${reward.alt}" loading="lazy" /></article>`;
}

function getWeekBucketsForMonth(monthIndex, year, totals = getAppTimeDailyTotals()) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const buckets = [];
  for (let startDay = 1; startDay <= daysInMonth; startDay += 7) {
    const endDay = Math.min(daysInMonth, startDay + 6);
    const startDate = new Date(year, monthIndex, startDay);
    const endDate = new Date(year, monthIndex, endDay);
    let seconds = 0;
    for (let d = startDay; d <= endDay; d += 1) {
      const key = getLocalDateKey(new Date(year, monthIndex, d));
      seconds += Math.max(0, Math.floor(Number(totals[key]) || 0));
    }
    buckets.push({
      index: buckets.length + 1,
      seconds,
      range: `${startDate.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" })}–${endDate.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" })}`,
    });
  }
  return buckets;
}

function renderRewardsTab() {
  if (!statsRewardCardsEl) return;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (statsRewardTab === REWARD_TABS.DAYS) {
    const totals = getAppTimeDailyTotals();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    statsRewardCardsEl.innerHTML = Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
      const dt = new Date(currentYear, currentMonth, day);
      const key = getLocalDateKey(dt);
      const seconds = Math.max(0, Math.floor(Number(totals[key]) || 0));
      const tier = rewardTierForDailySeconds(seconds);
      const reward = tier > 0 ? statsRewardDefs[tier - 1] : statsRewardDefs[0];
      return buildRewardCard({
        title: dt.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" }),
        tier: Math.max(1, tier),
        thresholdText: reward.threshold,
        ratingLabel: getDailyRatingLabel(seconds),
      });
    }).join("");
    return;
  }

  if (statsRewardTab === REWARD_TABS.WEEKS) {
    const weeklyNorm = (10 * 3600) + (30 * 60);
    const cards = getWeekBucketsForMonth(currentMonth, currentYear, getAppTimeDailyTotals()).map((week) => {
      const percent = weeklyNorm > 0 ? (week.seconds / weeklyNorm) * 100 : 0;
      const tier = rewardTierByPercent(percent);
      const reward = statsRewardDefs[tier - 1];
      return buildRewardCard({
        title: `${week.index}-р 7 хоног`,
        range: week.range,
        tier,
        thresholdText: `${percent.toFixed(1)}%`,
        tierLabel: reward.label,
      });
    });
    statsRewardCardsEl.innerHTML = cards.join("");
    return;
  }

  if (statsRewardTab === REWARD_TABS.MONTHS) {
    const cards = Array.from({ length: 12 }, (_, monthIndex) => {
      const seconds = getMonthTotalSeconds(monthIndex, currentYear);
      const norm = 90 * 60 * new Date(currentYear, monthIndex + 1, 0).getDate();
      const percent = norm > 0 ? (seconds / norm) * 100 : 0;
      const tier = rewardTierByPercent(percent);
      return buildRewardCard({
        title: "",
        subtitle: `${monthIndex + 1}-р сар`,
        tier,
        thresholdText: `${percent.toFixed(1)}%`,
        ratingLabel: getPercentRatingLabel(percent),
      });
    });
    statsRewardCardsEl.innerHTML = cards.join("");
    return;
  }

  const yearlyNorm = 90 * 60 * 365;
  const seconds = getYearTotalSeconds(currentYear);
  const percent = yearlyNorm > 0 ? (seconds / yearlyNorm) * 100 : 0;
  const tier = rewardTierByPercent(percent);
  statsRewardCardsEl.innerHTML = buildRewardCard({
    title: `${currentYear}`,
    tier,
    thresholdText: `${percent.toFixed(1)}%`,
    ratingLabel: getPercentRatingLabel(percent),
    cardClass: "stats-reward-card-year",
    imageClass: "stats-reward-img-year",
  });
}

function updateGaugeUI(aggregates, now = new Date()) {
  if (!statsThermometerFillEl || !statsThermometerTierEl || !statsKpiLabelEl || !statsKpiValueEl || !statsKpiNormEl || !statsKpiPercentEl) return;

  const yearDays = ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || (now.getFullYear() % 400 === 0)) ? 366 : 365;
  const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  let periodLabel = "Өнөөдөр";
  let seconds = aggregates.today;
  let normSeconds = 90 * 60;

  if (statsSelectedPeriod === STATS_PERIODS.WEEK) {
    periodLabel = "Энэ 7 хоног";
    seconds = aggregates.thisWeek;
    normSeconds = 90 * 60 * 7;
  } else if (statsSelectedPeriod === STATS_PERIODS.MONTH) {
    periodLabel = "Энэ сар";
    seconds = aggregates.thisMonth;
    normSeconds = 90 * 60 * monthDays;
  } else if (statsSelectedPeriod === "year") {
    periodLabel = "Энэ жил";
    const totals = getAppTimeDailyTotals();
    const yearPrefix = `${now.getFullYear()}-`;
    seconds = Object.entries(totals).reduce((sum, [key, val]) => key.startsWith(yearPrefix) ? sum + Math.max(0, Math.floor(Number(val) || 0)) : sum, 0);
    normSeconds = 90 * 60 * yearDays;
  }

  const percent = normSeconds > 0 ? (seconds / normSeconds) * 100 : 0;
  const normalized = Math.min(1, Math.max(0, percent / 100));
  const tier = statsSelectedPeriod === STATS_PERIODS.DAY ? getGaugeTierBySeconds(seconds) : getGaugeTierByPercent(percent);
  const fillPercent = Math.max(8, Math.round(normalized * 100));

  statsKpiLabelEl.textContent = periodLabel;
  statsKpiValueEl.textContent = formatHHMMSS(seconds);
  statsKpiNormEl.textContent = formatHHMMSS(normSeconds);
  statsKpiPercentEl.textContent = `${percent.toFixed(1)}%`;

  statsThermometerFillEl.style.height = `${fillPercent}%`;
  if (statsThermometerMarkerEl) statsThermometerMarkerEl.style.bottom = `${fillPercent}%`;
  statsThermometerTierEl.textContent = `Түвшин: ${tier.label}`;
}

function refreshTimeSummaryUI() {
  const aggregates = getAggregates(new Date());
  const todayFormatted = formatHHMMSS(aggregates.today);
  todayTimeEls.forEach((el) => {
    el.textContent = todayFormatted;
  });

  if (timeDetailsYesterdayEl) timeDetailsYesterdayEl.textContent = formatHHMMSS(aggregates.yesterday);
  if (timeDetailsThisWeekEl) timeDetailsThisWeekEl.textContent = formatHHMMSS(aggregates.thisWeek);
  if (timeDetailsLastWeekEl) timeDetailsLastWeekEl.textContent = formatHHMMSS(aggregates.lastWeek);
  if (timeDetailsThisMonthEl) timeDetailsThisMonthEl.textContent = formatHHMMSS(aggregates.thisMonth);
  if (timeDetailsLastMonthEl) timeDetailsLastMonthEl.textContent = formatHHMMSS(aggregates.lastMonth);

  if (statsTodayMinutesEl) statsTodayMinutesEl.textContent = formatHHMMSS(aggregates.today);
  if (statsThisWeekTimeEl) statsThisWeekTimeEl.textContent = formatHHMMSS(aggregates.thisWeek);
  if (statsLastWeekTimeEl) statsLastWeekTimeEl.textContent = formatHHMMSS(aggregates.lastWeek);
  if (statsThisMonthTimeEl) statsThisMonthTimeEl.textContent = formatHHMMSS(aggregates.thisMonth);
  if (statsLast7DaysEl) statsLast7DaysEl.innerHTML = buildLast7DaysTimeRows();

  updateGaugeUI(aggregates);
  renderRewardsTab();
}

function startTimeUiUpdater() {
  if (appTimeUiInterval) {
    clearInterval(appTimeUiInterval);
    appTimeUiInterval = null;
  }

  appTimeUiInterval = setInterval(() => {
    if (readActiveSession()) {
      refreshTimeSummaryUI();
    }
  }, 1000);
}

function stopTimeUiUpdater() {
  if (!appTimeUiInterval) return;
  clearInterval(appTimeUiInterval);
  appTimeUiInterval = null;
}

function renderStatsSnapshot() {
  if (statsTotalXpEl) statsTotalXpEl.textContent = String(progressState.xp);
  if (statsLevelEl) statsLevelEl.textContent = `Lv.${progressState.level}`;
  if (statsStreakEl) statsStreakEl.textContent = `${progressState.streak} өдөр`;
  if (statsTodayProgressEl) statsTodayProgressEl.textContent = `${progressState.todayCount}/${progressState.dailyGoalCount}`;

  refreshTimeSummaryUI();
}

function updateStatsUI() {
  appTimerManager?.updateStatsUI();
}

function updateHeaderStatus() {
  appTimerManager?.updateHeaderStatus();
}


function closeHomeModesPanel() {
  setHomeModesPanelOpen(false);
}

function toggleHomeModesPanel() {
  if (!homeModesPanel) return;
  const shouldOpen = isHidden(homeModesPanel);
  setHomeModesPanelOpen(shouldOpen);
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
  if (!appSettings.soundEnabled) return;
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
  if (!appSettings.soundEnabled) return;
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
  if (!appSettings.soundEnabled) return;
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const mnVoice = mongolianVoice();
  if (!mnVoice) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = mnVoice.lang || "mn-MN";
  utterance.voice = mnVoice;
  utterance.rate = appSettings.ttsSettings.rate;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}


function resetLessonProgress() {
  questions = [];
  currentIndex = 0;
  lessonReviewMode = false;
  locked = false;
  lessonElapsedSeconds = 0;
  lessonUnlockedRewards = 0;
  lessonTimerStartedAt = null;
  stopLessonTimer();
  updateLessonTimerUI();
  renderLessonRewards();
}

// ---- Board Game MVP ----

const BOARD_GAME_CHALLENGES_WORLD1 = [
  { id: "c1", tileNumber: 2, promptMn: "ЮУ", options: ["What", "Where", "When", "Why"], answer: "What", tip: "Асуух үг" },
  { id: "c2", tileNumber: 3, promptMn: "ХААНА", options: ["Where", "Who", "How", "Which"], answer: "Where", tip: "Асуух үг" },
  { id: "c3", tileNumber: 4, promptMn: "ХЭН", options: ["Who", "When", "Why", "What"], answer: "Who", tip: "Асуух үг" },
  { id: "c4", tileNumber: 6, promptMn: "ХЭЗЭЭ", options: ["When", "Where", "How", "Who"], answer: "When", tip: "Асуух үг" },
  { id: "c5", tileNumber: 8, promptMn: "ЯАГААД", options: ["Why", "What", "Where", "Whose"], answer: "Why", tip: "Асуух үг" },
  { id: "c6", tileNumber: 9, promptMn: "САЙН БАЙНА УУ", options: ["Hello / How are you?", "Good night", "Please sit", "I am hungry"], answer: "Hello / How are you?", tip: "Энгийн яриа" },
  { id: "c7", tileNumber: 11, promptMn: "БИ ЯВЖ БАЙНА", options: ["I am going", "I am eating", "I am sleeping", "I am waiting"], answer: "I am going", tip: "Хөдөлгөөний үйл үг" },
  { id: "c8", tileNumber: 13, promptMn: "БИД ИРЛЭЭ", options: ["We arrived", "We forgot", "We traded", "We left"], answer: "We arrived", tip: "Аяллын үйлдэл" },
  { id: "c9", tileNumber: 15, promptMn: "СОЛИЛЦОО", options: ["Trade / Exchange", "Storm", "Ship", "Danger"], answer: "Trade / Exchange", tip: "Солилцооны үг" },
  { id: "c10", tileNumber: 17, promptMn: "БЭЛЭГ", options: ["Gift", "Map", "Sword", "Harbor"], answer: "Gift", tip: "Зүйл заах үг" },
  { id: "c11", tileNumber: 19, promptMn: "АЛТ", options: ["Gold", "Salt", "Forest", "Road"], answer: "Gold", tip: "Зүйл заах үг" },
  { id: "c12", tileNumber: 21, promptMn: "АЮУЛ", options: ["Danger", "Music", "Festival", "Bridge"], answer: "Danger", tip: "Амьдралын үг" },
  { id: "c13", tileNumber: 23, promptMn: "ХООЛ", options: ["Food", "Horse", "Ocean", "Village"], answer: "Food", tip: "Амьдралын үг" },
  { id: "c14", tileNumber: 24, promptMn: "УС", options: ["Water", "Fire", "Wind", "Stone"], answer: "Water", tip: "Амьдралын үг" },
  { id: "c15", tileNumber: 26, promptMn: "ДУУСЛАА", options: ["Finished", "Started", "Returned", "Lost"], answer: "Finished", tip: "Дуусгах үг" },
];


const boardGameState = {
  levelId: WORLD_IDS.WORLD_1,
  tiles: [],
  challenges: BOARD_GAME_CHALLENGES_WORLD1,
  player: { currentTile: 1, token: "⛵", xp: 0, coins: 0 },
  dice: { sides: 6, lastRoll: null, canRoll: true, rolling: false },
  movement: { isMoving: false },
  challenge: { activeChallenge: null, pendingRoll: 0, resolvedTile: 1 },
  feedback: { message: "Түүхэн аяллаа эхлүүлэхийн тулд шоо шиднэ үү.", type: "info" },
};

const GAME_FEEL_MOTION = {
  tilePulseMs: 900,
  rewardPopMs: 850,
  penaltyMs: 520,
  moveStepMs: 210,
};

const GAME_FEEL_SOUND_EVENTS = {
  ambient: "ambient",
  dice: "dice",
  correct: "correct",
  wrong: "wrong",
  reward: "reward",
  chest: "chest",
  finish: "finish",
};

const ADVENTURE_COMPANION_LINES = {
  lesson: {
    idle: "Өнөөдрийн аяллаа эхлүүлэхэд бэлэн. Зөв хариулт бүр таны замыг гэрэлтүүлнэ.",
    success: "Гайхалтай! Одон зам таны өмнө улам гэрэлтлээ.",
    error: "Зүгээр ээ, баатар аа. Дараагийн алхам дээрээ эрчээ нэмээрэй.",
    reward: "Шагналын авдар ойртож байна. Эрчээ битгий суллаарай.",
  },
  sentences: {
    idle: "Өгүүлбэр бүрийг амилуулж сонсоорой. Дуугаа дарж аяллын хэлээ хөгжүүлээрэй.",
    success: "Чи өгүүлбэрийн хэмнэлийг маш сайн барьж байна.",
    reward: "Сайхан ахиц! Түүхэн замд шинэ тэмдэг нээгдлээ.",
  },
};

function showWorldFeedbackChip(text, tone = "reward") {
  if (!worldFeedbackHubEl || !text) return;
  const chip = document.createElement("div");
  chip.className = `world-feedback-chip world-feedback-${tone}`;
  chip.textContent = text;
  worldFeedbackHubEl.appendChild(chip);
  requestAnimationFrame(() => chip.classList.add("show"));
  setTimeout(() => {
    chip.classList.remove("show");
    setTimeout(() => chip.remove(), 260);
  }, 1700);
}

function updateCompanionLine(mode, tone = "idle") {
  if (mode === "lesson" && lessonCompanionLineEl) {
    lessonCompanionLineEl.textContent = ADVENTURE_COMPANION_LINES.lesson[tone] || ADVENTURE_COMPANION_LINES.lesson.idle;
  }
  if (mode === "sentences" && sentencesCompanionLineEl) {
    sentencesCompanionLineEl.textContent = ADVENTURE_COMPANION_LINES.sentences[tone] || ADVENTURE_COMPANION_LINES.sentences.idle;
  }
}

const audioEngine = {
  worldId: WORLD_IDS.SEA,
  activeMode: GAME_MODES.HOME,
  worldTracks: {},
  failedTracks: new Set(),
  activeTrackAudio: null,
  fadeRequestId: 0,
  resolveTrack(worldId = this.worldId) {
    return getWorldAudioTrack(worldId);
  },
  ensureTrack(worldId = this.worldId) {
    if (this.failedTracks.has(worldId)) return null;
    const track = this.resolveTrack(worldId);
    if (!track) return null;
    if (!this.worldTracks[worldId]) {
      const audio = new Audio(track.src);
      audio.loop = track.loop !== false;
      audio.preload = "auto";
      audio.volume = 0;
      audio.addEventListener("error", () => {
        this.failedTracks.add(worldId);
        if (this.activeTrackAudio === audio) {
          this.stop(true);
        }
      });
      this.worldTracks[worldId] = audio;
    }
    return this.worldTracks[worldId];
  },
  fadeTrack(audio, targetVolume, durationMs = 1200, onDone = null) {
    if (!audio) {
      if (typeof onDone === "function") onDone();
      return;
    }
    if (this.fadeRequestId) cancelAnimationFrame(this.fadeRequestId);
    const initialVolume = Number.isFinite(audio.volume) ? audio.volume : 0;
    const startTime = performance.now();
    const safeDuration = Math.max(durationMs, 1);
    const runFade = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / safeDuration, 1);
      const nextVolume = initialVolume + ((targetVolume - initialVolume) * progress);
      audio.volume = Math.max(0, Math.min(1, nextVolume));
      if (progress >= 1) {
        this.fadeRequestId = 0;
        if (typeof onDone === "function") onDone();
        return;
      }
      this.fadeRequestId = requestAnimationFrame(runFade);
    };
    this.fadeRequestId = requestAnimationFrame(runFade);
  },
  start(worldId = WORLD_IDS.SEA, mode = GAME_MODES.LESSON) {
    this.worldId = worldId;
    this.activeMode = mode;
    if (!appSettings.soundEnabled || !audioInteractionUnlocked || mode === GAME_MODES.HOME || !BACKGROUND_AUDIO_ENABLED) {
      this.stop(true);
      return;
    }
    const track = this.resolveTrack(worldId);
    if (!track) {
      this.stop(true);
      return;
    }
    const audio = this.ensureTrack(worldId);
    if (!audio) return;

    if (this.activeTrackAudio && this.activeTrackAudio !== audio) {
      this.stop(true);
    }
    this.activeTrackAudio = audio;
    audio.loop = track.loop !== false;
    const targetVolume = track.volume ?? 0.2;
    const fadeInMs = track.fadeInMs ?? 1600;

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Playback can fail until browser fully allows media; we'll retry on next interaction.
      });
    }
    this.fadeTrack(audio, targetVolume, fadeInMs);
  },
  stop(immediate = false) {
    const audio = this.activeTrackAudio || this.ensureTrack(this.worldId);
    if (!audio) return;

    if (this.fadeRequestId) cancelAnimationFrame(this.fadeRequestId);
    this.fadeRequestId = 0;
    if (immediate) {
      audio.volume = 0;
      audio.pause();
      audio.currentTime = 0;
      this.activeTrackAudio = null;
      return;
    }
    const track = this.resolveTrack(this.worldId) || {};
    this.fadeTrack(audio, 0, track.fadeOutMs ?? 1000, () => {
      audio.pause();
      audio.currentTime = 0;
      this.activeTrackAudio = null;
    });
  },
  onVisibilityChange() {
    if (document.hidden) {
      this.stop();
      return;
    }
    this.start(this.worldId, this.activeMode);
  },
};

const worldSoundscape = {
  start(mode = GAME_MODES.LESSON) {
    audioEngine.start(WORLD_IDS.SEA, mode);
  },
  stop() {
    audioEngine.stop();
  },
  play(eventName) {
    if (!appSettings.soundEnabled) return;
    if (eventName === "reward") {
      playTone({ frequency: 1046, type: "sine", duration: 0.08, volume: 0.09, attack: 0.003, release: 0.06 });
      setTimeout(() => playTone({ frequency: 1318, type: "triangle", duration: 0.1, volume: 0.08, attack: 0.004, release: 0.08 }), 55);
      return;
    }
    if (eventName === "soft-fail") {
      playTone({ frequency: 210, type: "sawtooth", duration: 0.08, volume: 0.07, attack: 0.002, release: 0.07 });
    }
  },
};

const gameFeelSoundManager = {
  playSoundHook(eventName) {
    if (!appSettings.soundEnabled) return;
    if (eventName === SOUND_EVENT_HOOKS.diceRoll) {
      playTone({ frequency: 420, type: "triangle", duration: 0.06, volume: 0.08, attack: 0.003, release: 0.05 });
      setTimeout(() => playTone({ frequency: 260, type: "triangle", duration: 0.08, volume: 0.07, attack: 0.004, release: 0.06 }), 70);
      return;
    }
    if (eventName === SOUND_EVENT_HOOKS.answerCorrect) {
      playSuccessSound();
      return;
    }
    if (eventName === SOUND_EVENT_HOOKS.answerWrong) {
      playErrorSound();
      return;
    }
    if (eventName === SOUND_EVENT_HOOKS.chestReward) {
      playTone({ frequency: 320, type: "square", duration: 0.1, volume: 0.07, attack: 0.001, release: 0.08 });
      setTimeout(() => playTone({ frequency: 760, type: "triangle", duration: 0.11, volume: 0.09, attack: 0.004, release: 0.07 }), 95);
      return;
    }
    if (eventName === SOUND_EVENT_HOOKS.progression) {
      [660, 880, 1174].forEach((freq, i) => {
        setTimeout(() => playTone({ frequency: freq, type: "triangle", duration: 0.1, volume: 0.11, attack: 0.005, release: 0.08 }), i * 90);
      });
    }
  },
  play(eventName) {
    const map = {
      [GAME_FEEL_SOUND_EVENTS.dice]: SOUND_EVENT_HOOKS.diceRoll,
      [GAME_FEEL_SOUND_EVENTS.correct]: SOUND_EVENT_HOOKS.answerCorrect,
      [GAME_FEEL_SOUND_EVENTS.wrong]: SOUND_EVENT_HOOKS.answerWrong,
      [GAME_FEEL_SOUND_EVENTS.reward]: SOUND_EVENT_HOOKS.progression,
      [GAME_FEEL_SOUND_EVENTS.chest]: SOUND_EVENT_HOOKS.chestReward,
      [GAME_FEEL_SOUND_EVENTS.finish]: SOUND_EVENT_HOOKS.progression,
    };
    const hook = map[eventName];
    if (hook) this.playSoundHook(hook);
  },
  startAmbient() {
    audioEngine.start(WORLD_IDS.SEA, GAME_MODES.BOARD_GAME);
  },
  stopAmbient() {
    audioEngine.stop();
  },
};

function gameFeelAnimate(el, className, duration = 600) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

function spawnBoardParticles(type = "reward") {
  if (!boardGameParticlesEl) return;
  const count = type === "finish" ? 14 : 8;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = `board-particle is-${type}`;
    particle.style.left = `${10 + Math.random() * 80}%`;
    particle.style.animationDelay = `${Math.random() * 180}ms`;
    particle.style.animationDuration = `${700 + Math.random() * 500}ms`;
    boardGameParticlesEl.appendChild(particle);
    setTimeout(() => particle.remove(), 1500);
  }
}

function showBoardGamePopup(type, text) {
  renderBoardPopup({ hubEl: boardGameFeedbackHubEl, type, text });
}

function applyBoardGameTileMoment(tileType) {
  const activeTile = boardGameBoardEl?.querySelector(`[data-tile="${boardGameState.player.currentTile}"]`);
  if (tileType === "checkpoint") gameFeelAnimate(activeTile, "gf-checkpoint-glow", 1000);
  if (tileType === "reward") gameFeelAnimate(activeTile, "gf-reward-pop", GAME_FEEL_MOTION.rewardPopMs);
  if (tileType === "penalty") gameFeelAnimate(activeTile, "gf-penalty-flash", GAME_FEEL_MOTION.penaltyMs);
  if (tileType === "finish") {
    gameFeelAnimate(activeTile, "gf-chest-open", 1200);
    spawnBoardParticles("finish");
  }
}

function boardLevelConfig() {
  return BOARD_GAME_CONFIG.levels[boardGameState.levelId];
}

function boardTileByNumber(tileNumber) {
  return boardGameState.tiles.find((tile) => tile.tileNumber === tileNumber) || boardGameState.tiles[0];
}

function boardGameChapterByTile(tileNumber) {
  const chapter = boardLevelConfig().chapters.find((item) => tileNumber >= item.startTile && tileNumber <= item.endTile);
  return chapter || boardLevelConfig().chapters[0];
}

function boardGameChallengeByTile(tileNumber) {
  return boardGameState.challenges.find((challenge) => challenge.tileNumber === tileNumber) || null;
}

function renderBoardGameTiles() {
  renderBoardScreen({
    boardEl: boardGameBoardEl,
    tokenEl: boardGameTokenEl,
    tiles: boardGameState.tiles,
    currentTile: boardGameState.player.currentTile,
    tileEmoji: boardTileEmoji,
    animate: gameFeelAnimate,
    tokenStepClass: "gf-token-step",
    tokenStepDuration: GAME_FEEL_MOTION.moveStepMs,
  });
}

function updateBoardGameTokenPosition() {
  updateBoardToken({
    boardEl: boardGameBoardEl,
    tokenEl: boardGameTokenEl,
    currentTile: boardGameState.player.currentTile,
    tokenStepClass: "gf-token-step",
    tokenStepDuration: GAME_FEEL_MOTION.moveStepMs,
    animate: gameFeelAnimate,
  });
}

function updateBoardGameChapterPanel() {
  const chapter = boardGameChapterByTile(boardGameState.player.currentTile);
  const storyPanelEl = document.querySelector(".board-game-story-panel");
  renderBoardChapterPanel({
    chapter,
    titleEl: boardGameChapterTitleEl,
    textEl: boardGameChapterTextEl,
    indexEl: boardGameChapterIndexEl,
    storyPanelEl,
    animate: gameFeelAnimate,
  });
}

function updateBoardGameMetaUi() {
  renderBoardMeta({
    currentTile: boardGameState.player.currentTile,
    totalTiles: boardLevelConfig().totalTiles,
    lastRoll: boardGameState.dice.lastRoll,
    feedback: boardGameState.feedback.message,
    xp: boardGameState.player.xp,
    coins: boardGameState.player.coins,
    positionEl: boardGamePositionEl,
    totalTilesEl: boardGameTotalTilesEl,
    lastRollEl: boardGameLastRollEl,
    feedbackEl: boardGameFeedbackEl,
    xpEl: boardGameXpEl,
    coinsEl: boardGameCoinsEl,
  });
}

function updateBoardGameScreenTitle() {
  if (!boardGameScreenTitleEl) return;
  const route = resolveBoardSelectionRoute(getBoardEntryState());
  const worldLabel = route.selectedWorld?.title || getSelectableBoardWorlds()[0]?.label || "Колумб ба Шинэ тивийнхэн";
  const difficultyLabel = getDifficultyOption(route.difficultyId)?.label || "Анхан";
  boardGameScreenTitleEl.textContent = `Та битгий уурлаарай · ${worldLabel} · ${difficultyLabel}`;
}

function setBoardGameRollEnabled(enabled) {
  boardGameState.dice.canRoll = enabled;
  renderBoardRollState({ enabled, rollBtn: boardGameRollBtn, diceEl: boardGameDiceEl });
}

function renderBoardGameChallenge() {
  const challenge = boardGameState.challenge.activeChallenge;
  const panelEl = document.querySelector(".board-game-challenge-panel");
  renderBoardChallenge({
    challenge,
    titleEl: boardGameChallengeTitleEl,
    textEl: boardGameChallengeTextEl,
    optionsEl: boardGameOptionsEl,
    panelEl,
    onSelectOption: (option) => handleBoardGameAnswer(option),
  });
}

function applyBoardTileEffect(tile) {
  const effect = boardLevelConfig().tileEffects[tile.tileType];
  if (!effect) return "";

  boardGameState.player.xp = Math.max(0, boardGameState.player.xp + (effect.xp || 0));
  boardGameState.player.coins = Math.max(0, boardGameState.player.coins + (effect.coins || 0));

  if ((effect.xp || 0) > 0 || (effect.coins || 0) > 0) {
    const route = resolveBoardSelectionRoute(getBoardEntryState());
    const rewardBaseEventId = [
      "board",
      route.selectedWorld?.id || getBoardEntryState().worldId || "world",
      route.difficultyId || getBoardEntryState().difficultyId || "difficulty",
      tile.chapterId || "chapter",
      tile.tileNumber,
      tile.tileType,
    ].join(":");

    persistActionRewards({
      xp: Math.max(0, effect.xp || 0),
      coins: Math.max(0, effect.coins || 0),
      progressEventId: `${rewardBaseEventId}:progress`,
      rewardEventId: `${rewardBaseEventId}:wallet`,
    });
  }

  if (tile.tileType === "reward") return `Шагналын нүд: +${effect.xp} туршлага, +${effect.coins} зоос.`;
  if (tile.tileType === "penalty") return `Торгуулийн нүд: ${effect.xp} туршлага, ${effect.coins} зоос.`;
  if (tile.tileType === "checkpoint") return `Шалган нэвтрэх нүдэнд хүрлээ: +${effect.xp} туршлага, +${effect.coins} зоос.`;
  if (tile.tileType === "finish") return `Барианы нүдийг давлаа: +${effect.xp} туршлага, +${effect.coins} зоос.`;
  return "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateBoardGameDice(roll) {
  if (!boardGameDiceEl) return;
  boardGameState.dice.rolling = true;
  boardGameDiceEl.classList.add("gf-dice-roll");
  gameFeelSoundManager.play(GAME_FEEL_SOUND_EVENTS.dice);
  for (let i = 0; i < 14; i += 1) {
    const randomFace = Math.floor(Math.random() * 6) + 1;
    boardGameDiceEl.dataset.face = String(randomFace);
    await sleep(72);
  }
  boardGameDiceEl.dataset.face = String(roll);
  boardGameDiceEl.classList.remove("gf-dice-roll");
  boardGameState.dice.rolling = false;
}

async function animateBoardGameMovement(fromTile, toTile) {
  if (toTile === fromTile) return;
  boardGameState.movement.isMoving = true;
  const step = toTile > fromTile ? 1 : -1;
  for (let tile = fromTile + step; step > 0 ? tile <= toTile : tile >= toTile; tile += step) {
    boardGameState.player.currentTile = tile;
    updateBoardGameChapterPanel();
    updateBoardGameMetaUi();
    updateBoardGameTokenPosition();
    await sleep(GAME_FEEL_MOTION.moveStepMs);
  }
  boardGameState.movement.isMoving = false;
}

function setBoardGameFeedback(message, type = "info") {
  boardGameState.feedback.message = message;
  boardGameState.feedback.type = type;
  renderBoardFeedbackVisual({ feedbackEl: boardGameFeedbackEl, type, animate: gameFeelAnimate });
  showBoardGamePopup(type, message);
  updateBoardGameMetaUi();
}

function applyPostLandingTileFeedback(tile) {
  if (tile.tileType === "story") {
    setBoardGameFeedback("Өгүүлэмжийн нүд: хоёр ертөнц сониуч бөгөөд болгоомжтойгоор бие биеэ ажиглана.", "story");
    return;
  }
  const effectMessage = applyBoardTileEffect(tile);
  if (effectMessage) {
    setBoardGameFeedback(effectMessage, tile.tileType);
    applyBoardGameTileMoment(tile.tileType);
    if (tile.tileType === "reward") {
      gameFeelSoundManager.play(GAME_FEEL_SOUND_EVENTS.reward);
      spawnBoardParticles("reward");
    }
    if (tile.tileType === "penalty") gameFeelSoundManager.play(GAME_FEEL_SOUND_EVENTS.wrong);
    if (tile.tileType === "checkpoint") gameFeelSoundManager.play(GAME_FEEL_SOUND_EVENTS.chest);
    if (tile.tileType === "finish") gameFeelSoundManager.play(GAME_FEEL_SOUND_EVENTS.finish);
  }
}

async function resolveBoardLanding(tileNumber, rolledValue) {
  const tile = boardTileByNumber(tileNumber);
  boardGameState.challenge.pendingRoll = rolledValue;
  boardGameState.challenge.resolvedTile = tileNumber;
  boardGameState.challenge.activeChallenge = boardGameChallengeByTile(tileNumber);

  applyPostLandingTileFeedback(tile);
  renderBoardGameChallenge();
  updateBoardGameMetaUi();

  if (!boardGameState.challenge.activeChallenge) {
    if (tile.tileType === "finish") setBoardGameRollEnabled(false);
    else setBoardGameRollEnabled(true);
  }
}

async function handleBoardGameAnswer(selectedOption) {
  const challenge = boardGameState.challenge.activeChallenge;
  if (!challenge) return;

  const optionButtons = boardGameOptionsEl ? [...boardGameOptionsEl.querySelectorAll("button")] : [];
  optionButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === challenge.answer) btn.classList.add("correct");
    if (btn.textContent === selectedOption && selectedOption !== challenge.answer) btn.classList.add("wrong");
  });

  const wasCorrect = selectedOption === challenge.answer;
  if (wasCorrect) {
    boardGameState.player.xp += 20;
    boardGameState.player.coins += 12;
    const route = resolveBoardSelectionRoute(getBoardEntryState());
    const rewardBaseEventId = [
      "board-challenge",
      route.selectedWorld?.id || getBoardEntryState().worldId || "world",
      route.difficultyId || getBoardEntryState().difficultyId || "difficulty",
      challenge.id || boardGameState.player.currentTile,
      boardGameState.player.currentTile,
      "success",
    ].join(":");
    persistActionRewards({
      xp: 20,
      coins: 12,
      progressEventId: `${rewardBaseEventId}:progress`,
      rewardEventId: `${rewardBaseEventId}:wallet`,
    });
    setBoardGameFeedback(`Зөв! ${challenge.promptMn} = ${challenge.answer}. Байрлалаа хадгалж, +20 туршлага, +12 зоос авлаа.`, "success");
    gameFeelSoundManager.play(GAME_FEEL_SOUND_EVENTS.correct);
    spawnBoardParticles("reward");
    gameFeelAnimate(boardGameOptionsEl, "gf-reward-pop", GAME_FEEL_MOTION.rewardPopMs);
    boardGameState.challenge.activeChallenge = null;
    renderBoardGameChallenge();
    if (boardGameState.player.currentTile === boardLevelConfig().totalTiles) setBoardGameRollEnabled(false);
    else setBoardGameRollEnabled(true);
    return;
  }

  setBoardGameFeedback(`Буруу хариулт. ${challenge.promptMn} нь ${challenge.answer} гэсэн утгатай. ${boardGameState.challenge.pendingRoll} нүд ухарна.`, "penalty");
  gameFeelSoundManager.play(GAME_FEEL_SOUND_EVENTS.wrong);
  gameFeelAnimate(boardGameTokenEl, "gf-penalty-shake", GAME_FEEL_MOTION.penaltyMs);
  await sleep(450);

  const fromTile = boardGameState.player.currentTile;
  const toTile = Math.max(1, fromTile - boardGameState.challenge.pendingRoll);
  await animateBoardGameMovement(fromTile, toTile);

  boardGameState.challenge.activeChallenge = null;
  renderBoardGameChallenge();

  const retreatTile = boardTileByNumber(toTile);
  if (retreatTile.tileType === "checkpoint") {
    setBoardGameFeedback("Та шалган нэвтрэх нүд рүү ухарлаа. Дахин төвлөрч шоо шиднэ үү.", "checkpoint");
  }

  setBoardGameRollEnabled(true);
  updateBoardGameMetaUi();
}

async function boardGameRollDice() {
  if (!boardGameState.dice.canRoll || boardGameState.movement.isMoving || boardGameState.dice.rolling) return;

  setBoardGameRollEnabled(false);
  const roll = Math.floor(Math.random() * boardGameState.dice.sides) + 1;
  const fromTile = boardGameState.player.currentTile;
  const toTile = Math.min(boardLevelConfig().totalTiles, fromTile + roll);

  boardGameState.dice.lastRoll = roll;
  await animateBoardGameDice(roll);
  await animateBoardGameMovement(fromTile, toTile);
  await resolveBoardLanding(toTile, roll);
}

function initBoardGameMvp() {
  boardGameBootstrapped = true;
  boardGameState.tiles = buildBoardGameTiles(boardLevelConfig());
  boardGameState.player.currentTile = 1;
  boardGameState.player.xp = 0;
  boardGameState.player.coins = 0;
  boardGameState.dice.lastRoll = null;
  boardGameState.challenge.activeChallenge = null;
  boardGameState.feedback.message = "Түүхэн аяллаа эхлүүлэхийн тулд шоо шиднэ үү.";

  updateBoardGameScreenTitle();
  renderBoardGameTiles();
  updateBoardGameChapterPanel();
  renderBoardGameChallenge();
  updateBoardGameMetaUi();
  updateBoardGameTokenPosition();
  setBoardGameRollEnabled(true);
  if (boardGameDiceEl) boardGameDiceEl.dataset.face = "1";
  if (boardGameFeedbackHubEl) boardGameFeedbackHubEl.innerHTML = "";
  gameFeelSoundManager.startAmbient();
}

function syncBoardGameDebugState(tileNumber, message = "Debug jump completed.") {
  const nextTile = Math.max(1, Math.min(boardLevelConfig().totalTiles, Math.floor(Number(tileNumber) || 1)));
  boardGameState.player.currentTile = nextTile;
  boardGameState.dice.lastRoll = null;
  boardGameState.challenge.activeChallenge = null;
  boardGameState.feedback.message = message;
  renderBoardGameTiles();
  updateBoardGameChapterPanel();
  renderBoardGameChallenge();
  updateBoardGameMetaUi();
  updateBoardGameTokenPosition();
  setBoardGameRollEnabled(true);
}

function jumpToBoardChapter(chapterId = BOARD_WORLD_CHAPTERS[0]?.id) {
  const chapter = getChapterConfig(chapterId) || BOARD_WORLD_CHAPTERS[0] || null;
  if (!chapter) return;
  SCREEN_REGISTRY[SCREEN_NAMES.CHAPTER_COVER]?.setPreview(chapter.id);
  navigateTo(FLOW_DESTINATIONS.BOARD_PLAY);
  syncBoardGameDebugState(chapter.startTile, `${chapter.title} · chapter start preview.`);
}

function previewChapterCover(chapterId = BOARD_WORLD_CHAPTERS[0]?.id) {
  SCREEN_REGISTRY[SCREEN_NAMES.CHAPTER_COVER]?.setPreview(chapterId);
  showScreen(SCREEN_NAMES.CHAPTER_COVER);
}

function giveDebugXp(amount = 10) {
  awardXP(amount, "debug_reward");
  showWorldFeedbackChip(`🧪 Debug XP +${amount}`, "reward");
}

function giveDebugRewards() {
  sentenceGameClimbLevel = 5;
  sentenceGameRewardLevel = 5;
  sentenceGameActiveSeconds = Math.max(sentenceGameActiveSeconds, 120 * 60);
  lessonUnlockedRewards = Math.max(lessonUnlockedRewards, REWARD_ICON_SEQUENCE.length);
  qaUnlockedRewards = Math.max(qaUnlockedRewards, REWARD_ICON_SEQUENCE.length);
  sentencesUnlockedRewards = Math.max(sentencesUnlockedRewards, REWARD_ICON_SEQUENCE.length);
  loadProgressState();
  applyProgressPatch((progress) => {
    progress.rewardTierUnlocked = 5;
    progress.todayMinutes = Math.max(progress.todayMinutes || 0, 120);
    progress.dailyCompleted = true;
  }, "progress");
  syncCoreStateReferences();
  persistSentenceGameRewardState();
  renderSentenceGameClimb(sentenceGameClimbLevel);
  renderSentenceGameRewardState();
  renderSentencesRewards();
  renderLessonRewards();
  renderQaRewards();
  updateProfileUI();
  updateStatsUI();
  showWorldFeedbackChip("🧪 Debug rewards applied.", "reward");
}

function resetDebugProgress() {
  clearPersistedCoreState();
  [
    SENTENCE_GAME_CLIMB_STORAGE_KEY,
    SENTENCE_GAME_ACTIVE_SECONDS_KEY,
    SENTENCE_GAME_REWARD_LEVEL_KEY,
    SENTENCE_GAME_LAST_TICK_KEY,
    SENTENCE_GAME_DIFFICULTY_KEY,
  ].forEach((key) => safeLocalStorageRemove(key));

  resetCoreState(createDefaultCoreState());
  syncCoreStateReferences();
  sentenceGameClimbLevel = 0;
  sentenceGameRewardLevel = 0;
  sentenceGameActiveSeconds = 0;
  sentenceGameLastTick = Date.now();
  lessonUnlockedRewards = 0;
  qaUnlockedRewards = 0;
  sentencesUnlockedRewards = 0;
  updateSettings({
    premium: false,
    profileName: "",
    soundEnabled: true,
    ttsSettings: DEFAULT_TTS_SETTINGS,
  });
  replaceProgress(progressState);
  syncCoreStateReferences();
  loadTtsSettings();
  loadSoundSettings();
  loadPremiumStatus();
  loadProfileName();
  loadProgressState();
  updateSoundToggleState();
  renderSentenceGameClimb(sentenceGameClimbLevel);
  renderSentenceGameRewardState();
  renderSentencesRewards();
  renderLessonRewards();
  renderQaRewards();
  updateHeaderStatus();
  updateProfileUI();
  updateStatsUI();
  refreshTimeSummaryUI();
  showWorldFeedbackChip("🧪 Debug reset complete.", "warning");
}

function unlockAllDebugChapters() {
  debugUnlockedChapterIds = BOARD_WORLD_CHAPTERS.map((chapter) => chapter.id);
  debugUnlockedChapterIds.forEach((chapterId) => unlockChapter(chapterId));
  setStateValue("flags", { ...getState().flags, debugUnlockedChapterIds: [...debugUnlockedChapterIds] });
  showWorldFeedbackChip(`🧪 ${debugUnlockedChapterIds.length} chapters unlocked for preview.`, "reward");
}

function updateTopbar() {
  levelLabel.textContent = levelName(level);
  scoreEl.textContent = score;
  progressEl.textContent = `${currentIndex + 1}/${questions.length}`;
}

// ---- UI switch ----
function hideStartIntroPanel() {
  setStartIntroOpen(false);
}

function toggleStartIntroPanel() {
  if (!introPanel) return;
  const willOpen = isHidden(introPanel);
  setStartIntroOpen(willOpen);
}

function loadSoundSettings() {
  syncCoreStateReferences();
}

function persistSoundSettings() {
  persistCoreAppState();
}

function updateSoundToggleState() {
  soundToggleButtons.forEach(toggleBtn => {
    toggleBtn.textContent = appSettings.soundEnabled ? "🔊 Дуу: АСААЛТТАЙ" : "🔇 Дуу: УНТРААЛТТАЙ";
    setPressedState(toggleBtn, appSettings.soundEnabled);
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
    audioInteractionUnlocked = true;
    primeAudioContext();
    const activeScreen = document.body?.dataset.activeScreen || "home";
    if (appSettings.soundEnabled) {
      if (boardGameScreen && !isHidden(boardGameScreen)) gameFeelSoundManager.startAmbient();
      else worldSoundscape.start(activeScreen === "lesson" ? "lesson" : (activeScreen === "sentences" ? "sentences" : "home"));
    }
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };

  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

function playTone({ frequency, type, duration, volume, attack = 0.005, release = 0.05 }) {
  if (!appSettings.soundEnabled || !audioInteractionUnlocked) return;
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
  if (!appSettings.soundEnabled || stage < 1 || stage > 5) return;
  gameFeelSoundManager.playSoundHook(SOUND_EVENT_HOOKS.progression);
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
  if (!appSettings.soundEnabled) return;
  gameFeelSoundManager.playSoundHook(SOUND_EVENT_HOOKS.answerWrong);
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

function persistSentenceGameRewardState() {
  try {
    const storedActiveRaw = Number(localStorage.getItem(SENTENCE_GAME_ACTIVE_SECONDS_KEY));
    const storedRewardRaw = Number(localStorage.getItem(SENTENCE_GAME_REWARD_LEVEL_KEY));
    const storedTickRaw = Number(localStorage.getItem(SENTENCE_GAME_LAST_TICK_KEY));
    const safeActiveSeconds = Math.max(0, Math.floor(sentenceGameActiveSeconds));
    const safeRewardLevel = Math.max(0, Math.min(5, Math.floor(sentenceGameRewardLevel)));
    const safeLastTick = sentenceGameLastTick || Date.now();

    localStorage.setItem(SENTENCE_GAME_ACTIVE_SECONDS_KEY, String(Math.max(Number.isFinite(storedActiveRaw) ? Math.floor(storedActiveRaw) : 0, safeActiveSeconds)));
    localStorage.setItem(SENTENCE_GAME_REWARD_LEVEL_KEY, String(Math.max(Number.isFinite(storedRewardRaw) ? Math.floor(storedRewardRaw) : 0, safeRewardLevel)));
    localStorage.setItem(SENTENCE_GAME_LAST_TICK_KEY, String(Math.max(Number.isFinite(storedTickRaw) ? storedTickRaw : 0, safeLastTick)));
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

function reconcileRewardTierProgress() {
  loadProgressState({ rehydrate: false });
  const derivedRewardTier = Math.max(progressState.rewardTierUnlocked || 1, sentenceGameRewardLevel || 0);
  if (derivedRewardTier <= (progressState.rewardTierUnlocked || 1)) return false;

  applyProgressPatch((progress) => {
    progress.rewardTierUnlocked = Math.max(progress.rewardTierUnlocked || 1, derivedRewardTier);
  }, "progress");
  syncCoreStateReferences();
  persistProgressState();
  return true;
}

function renderSentenceGameRewardState() {
  sentenceGameRewardImageEls.forEach((imgEl) => {
    const level = Number(imgEl.dataset.level || 0);
    const active = level > 0 && level === sentenceGameRewardLevel;
    const tileEl = imgEl.closest(".reward-tile");
    if (tileEl) {
      tileEl.classList.toggle("is-active", active);
      tileEl.classList.toggle("is-unlocked", level > 0 && level <= sentenceGameRewardLevel);
      tileEl.classList.toggle("is-locked", !(level > 0 && level <= sentenceGameRewardLevel));
    }
    imgEl.classList.toggle("active", active);
    imgEl.classList.toggle("is-active", active);
    imgEl.classList.toggle("is-unlocked", level > 0 && level <= sentenceGameRewardLevel);
    imgEl.classList.toggle("is-locked", !(level > 0 && level <= sentenceGameRewardLevel));
  });

}

function playSentenceGameUnlockChime(level) {
  if (!appSettings.soundEnabled) return;
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

  sentenceGameRewardLevel = Math.max(sentenceGameRewardLevel, nextLevel);
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
  applyProgressPatch((progress) => {
    progress.todaySecondsRemainder = (progress.todaySecondsRemainder || 0) + addSeconds;
    if (progress.todaySecondsRemainder >= 60) {
      const gainedMinutes = Math.floor(progress.todaySecondsRemainder / 60);
      progress.todayMinutes += gainedMinutes;
      progress.todaySecondsRemainder = progress.todaySecondsRemainder % 60;
    }
    progress.rewardTierUnlocked = Math.max(progress.rewardTierUnlocked || 1, sentenceGameRewardLevelFromSeconds(sentenceGameActiveSeconds) || 1);
    progress.lastStatsDate = getTodayKey();
  }, "progress");
  syncCoreStateReferences();

  updateSentenceGameRewardLevel({ allowBanner: true });
  persistSentenceGameRewardState();
  renderSentenceGameRewardState();
  updateHeaderStatus();
  if (!isHidden(statsScreen)) updateStatsUI();
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
  return sentenceGameScreen && !isHidden(sentenceGameScreen);
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

  if (appSettings.ttsSettings.voice === "male" || appSettings.ttsSettings.voice === "female") {
    const hinted = voices.find(v => voiceMatchesHint(v, appSettings.ttsSettings.voice));
    if (hinted) return hinted;
  }

  return bestEnglishVoice();
}

function loadTtsSettings() {
  syncCoreStateReferences();
}

function persistTtsSettings() {
  persistCoreAppState();
}

function updateTtsControlState() {
  voiceOptionButtons.forEach(btn => {
    const isActive = btn.dataset.voice === appSettings.ttsSettings.voice;
    setActiveState(btn, isActive);
    setPressedState(btn, isActive);
  });

  if (ttsRateSlider) {
    ttsRateSlider.value = appSettings.ttsSettings.rate.toFixed(2);
  }

  if (ttsRateValueEl) {
    ttsRateValueEl.textContent = `${appSettings.ttsSettings.rate.toFixed(2)}x`;
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
    setDisabledState(sentenceGameTipSpeakBtn, sentenceGameTipSpeaking);
  }

  if (sentenceGameTipStopBtn) {
    sentenceGameTipStopBtn.hidden = !sentenceGameTipSpeaking;
    setDisabledState(sentenceGameTipStopBtn, !sentenceGameTipSpeaking);
  }
}

function closeSentenceGameTipPanel() {
  markSentenceGameActivity();
  if (!sentenceGameTipPanelEl || !sentenceGameTipToggleBtn) return;
  stopSentenceGameTipSpeech();
  setExpandedState(sentenceGameTipToggleBtn, sentenceGameTipPanelEl, false);

  if (sentenceGameTipTextEl) {
    setHidden(sentenceGameTipTextEl, true);
  }
  if (sentenceGameTipCloseRowEl) {
    setHidden(sentenceGameTipCloseRowEl, true);
  }
}

function toggleSentenceGameTipPanel() {
  markSentenceGameActivity();
  if (!sentenceGameTipPanelEl || !sentenceGameTipToggleBtn) return;
  const willOpen = isHidden(sentenceGameTipPanelEl);
  setExpandedState(sentenceGameTipToggleBtn, sentenceGameTipPanelEl, willOpen);
  if (!willOpen) {
    closeSentenceGameTipPanel();
    return;
  }
  updateSentenceGameTipControls();
}

function showSentenceGameTipText() {
  markSentenceGameActivity();
  if (sentenceGameTipTextEl) {
    setHidden(sentenceGameTipTextEl, false);
  }
  if (sentenceGameTipCloseRowEl) {
    setHidden(sentenceGameTipCloseRowEl, false);
  }
}

function speakSentenceGameTip() {
  markSentenceGameActivity();
  if (!appSettings.soundEnabled) return;
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
  utterance.rate = appSettings.ttsSettings.rate;
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
  if (!appSettings.soundEnabled) return;
  if (!("speechSynthesis" in window)) return;
  updateCompanionLine("sentences", "success");
  showWorldFeedbackChip("🗣️ Амилуулж уншлаа!", "reward");
  worldSoundscape.play("reward");

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(item.en);

  const selectedVoice = selectedEnglishVoice();
  utterance.lang = selectedVoice && selectedVoice.lang
    ? selectedVoice.lang
    : "en-US";
  utterance.rate = appSettings.ttsSettings.rate;

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
  return sentenceItems.filter(item => item.level === sentenceFilter);
}

function updateSpeakingState() {
  const allButtons = sentencesListEl.querySelectorAll(".speak-btn");
  allButtons.forEach(btn => {
    const isPlaying = Number(btn.dataset.id) === speakingSentenceId;
    btn.classList.toggle("playing", isPlaying);
    setPressedState(btn, isPlaying);
    btn.setAttribute("aria-label", isPlaying ? "Уншиж байна" : "Дуу сонсох");
  });

  if (!vaultModalBodyEl) return;
  const vaultButtons = vaultModalBodyEl.querySelectorAll(".vault-sentence-speak-btn");
  vaultButtons.forEach((btn) => {
    const isPlaying = String(btn.dataset.id || "") === String(speakingSentenceId || "");
    btn.classList.toggle("playing", isPlaying);
    setPressedState(btn, isPlaying);
    btn.textContent = isPlaying ? "⏸ Зогсоох" : "▶ Дараад сонс";
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

    const rowActions = document.createElement("div");
    rowActions.className = "sentence-row-actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "secondary sentence-save-btn";
    saveBtn.textContent = "⭐";
    saveBtn.setAttribute("aria-label", "Өгүүлбэр хадгалах");
    saveBtn.addEventListener("click", () => saveSentenceListItem(item));

    const speakBtn = document.createElement("button");
    speakBtn.type = "button";
    speakBtn.className = "speak-btn";
    speakBtn.dataset.id = item.id;
    speakBtn.setAttribute("aria-label", "Дуу сонсох");
    speakBtn.textContent = "🔊";
    speakBtn.addEventListener("click", () => speakSentence(item));

    rowActions.appendChild(saveBtn);
    rowActions.appendChild(speakBtn);

    row.appendChild(textWrap);
    row.appendChild(rowActions);
    sentencesListEl.appendChild(row);
  });

  updateSpeakingState();
}

async function loadSentences() {
  try {
    const response = await fetch(SENTENCE_GAME_DATA_PATH);
    if (!response.ok) throw new Error("Өгөгдөл ачаалж чадсангүй.");
    sentenceItems = prepareSentenceItems(await response.json());
    renderSentences();
    sentenceGameHistory = [];
    sentenceGameIndex = -1;
    if (!isHidden(sentenceGameScreen)) initSentenceGameRound();
    return sentenceItems;
  } catch (error) {
    sentencesListEl.innerHTML = '<p class="muted">Өгүүлбэрүүдийг ачаалж чадсангүй.</p>';
    sentenceItemsLoadPromise = null;
    throw error;
  }
}

function ensureSentenceItemsLoaded() {
  if (sentenceItems.length) return Promise.resolve(sentenceItems);
  if (sentenceItemsLoadPromise) return sentenceItemsLoadPromise;

  sentenceItemsLoadPromise = loadSentences().catch((error) => {
    sentenceItemsLoadPromise = null;
    throw error;
  });

  return sentenceItemsLoadPromise;
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
  const normalizedDifficulty = DIFFICULTY_LEVEL_LIST.includes(difficulty) ? difficulty : DIFFICULTY_LEVELS.BEGINNER;
  const tagged = sentenceItems.filter((item) => {
    const rawLevel = String(item.level || item.cefr || "").toLowerCase();
    if (normalizedDifficulty === DIFFICULTY_LEVELS.BEGINNER) return rawLevel.includes("beginner") || rawLevel.includes("a1") || rawLevel.includes("a2");
    if (normalizedDifficulty === DIFFICULTY_LEVELS.INTERMEDIATE) return rawLevel.includes("intermediate") || rawLevel.includes("b1") || rawLevel.includes("b2");
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
    setActiveState(btn, isActive);
    setPressedState(btn, isActive);
  });
}

function setSentenceGameDifficultyPanelOpen(isOpen) {
  if (!sentenceGameDifficultyPanelEl || !sentenceGameDifficultyToggleBtn) return;
  setExpandedState(sentenceGameDifficultyToggleBtn, sentenceGameDifficultyPanelEl, isOpen);
}

function loadSentenceGameDifficulty() {
  try {
    const stored = localStorage.getItem(SENTENCE_GAME_DIFFICULTY_KEY);
    if (DIFFICULTY_LEVEL_LIST.includes(stored || "")) {
      sentenceGameDifficulty = stored;
    } else {
      sentenceGameDifficulty = DIFFICULTY_LEVELS.BEGINNER;
      localStorage.setItem(SENTENCE_GAME_DIFFICULTY_KEY, sentenceGameDifficulty);
    }
  } catch (_error) {
    sentenceGameDifficulty = DIFFICULTY_LEVELS.BEGINNER;
  }

  updateSentenceGameDifficultyUI();
}

function selectSentenceGameDifficulty(difficulty, { collapsePanel = true } = {}) {
  if (!DIFFICULTY_LEVEL_LIST.includes(difficulty)) return;
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

  if (collapsePanel) {
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
  if (!appSettings.soundEnabled) return;
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
  utterance.rate = appSettings.ttsSettings.rate;
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
  setHidden(sentenceGameCorrectPanelEl, true);
}

function renderSentenceGameCorrectPanel() {
  const current = sentenceGameSentence();
  if (!current || !sentenceGameCorrectPanelEl || !sentenceGameCorrectEnEl || !sentenceGameCorrectMnEl) return;
  sentenceGameCorrectEnEl.textContent = current.en || "";
  sentenceGameCorrectMnEl.textContent = current.mn || "";
  showElement(sentenceGameCorrectPanelEl);
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
  const { selectedWorldId } = getCoreState();
  const chapterId = getDefaultChapterForWorld(selectedWorldId)?.id || null;
  const chapterContent = resolveChapterContent({ worldId: selectedWorldId, chapterId, difficultyId: level });
  questions = shuffle(resolveLessonContent({
    packId: chapterContent.lessonPackId,
    worldId: chapterContent.worldId,
    chapterId: chapterContent.chapter?.id || chapterId,
    difficulty: level,
  }).entries).slice(0); // бүгдийг
  currentIndex = 0;
  score = 0;
  locked = false;
  lessonReviewMode = false;
  loadProgressState();
  syncProgressForToday();
  persistProgressState();

  stopSpeaking();
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  locked = false;
  const item = questions[currentIndex];
  const options = Array.isArray(item.replayOptions) && item.replayOptions.length
    ? item.replayOptions.slice()
    : buildOptions(item.a);

  renderLessonScreen({
    question: item.q,
    options,
    onPickAnswer: (btn, opt) => pickAnswer(btn, opt),
  });

  updateTopbar();
  updateHeaderStatus();
  updateCompanionLine(GAME_MODES.LESSON, "idle");
}

function pickAnswer(buttonEl, selected) {
  if (locked) return;
  locked = true;

  const correct = questions[currentIndex].a;

  const { isCorrect } = renderLessonAnswerState({
    selectedButton: buttonEl,
    correctAnswer: correct,
    selectedAnswer: selected,
    revealed: true,
  });

  if (isCorrect) {
    if (!lessonReviewMode) {
      score += 1;
      const lessonRewardEventId = `lesson:${getCoreState().selectedWorldId}:${level}:${currentIndex}:${questions[currentIndex]?.q || ""}`;
      awardXP(1, "quiz_correct_answer", lessonRewardEventId);
    }
    playSuccessSound();
    worldSoundscape.play("reward");
    updateCompanionLine(GAME_MODES.LESSON, "success");
    showWorldFeedbackChip("✨ Зөв хариулт! Зам тань гэрэлтлээ.", "reward");
  } else {
    playErrorSound();
    worldSoundscape.play("soft-fail");
    updateCompanionLine(GAME_MODES.LESSON, "error");
    showWorldFeedbackChip("⚠️ Дахин оролдоод үзээрэй, баатар аа.", "warning");
  }

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
  if (finalTextEl) {
    finalTextEl.textContent = `Таны оноо: ${score} / ${questions.length}  •  Түвшин: ${levelName(level)}`;
  }
  showScreen(endScreen);

  loadProgressState();
  showCompletionBanner(progressState.dailyCompleted);
  updateHeaderStatus();
}

function startLevelLabel(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.BEGINNER ? "Анхан" : levelKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд" : "Дээд";
}

let hasExplicitStartLevelSelection = false;

function updateStartButtonLabel() {
  renderStartButtonLabel(startLevelLabel(level));
  renderHomeScreen({ levelLabel: startLevelLabel(level) });
}

function setStartLevelMenuOpen(isOpen) {
  renderStartLevelMenuOpen(isOpen);
}

function exitPlayModeToHome() {
  stopSpeaking();
  hideStartIntroPanel();
  closeHomeModesPanel();
  setStartLevelMenuOpen(false);
  persistAllActiveTime();
  stopSession();
  resetLessonProgress();
  navigateTo(SCREEN_NAMES.HOME);
}

function renderSentencesRewards() {
  renderRewardStripTiles({
    containerEl: sentencesRewardStripEl,
    rewards: SENTENCES_REWARD_STEPS,
    unlockedRewards: sentencesUnlockedRewards,
  });
}

function updateSentencesTimerUI() {
  while (sentencesUnlockedRewards < SENTENCES_REWARD_STEPS.length && sentencesElapsedSeconds >= SENTENCES_REWARD_STEPS[sentencesUnlockedRewards].seconds) {
    sentencesUnlockedRewards += 1;
    renderSentencesRewards();
    updateCompanionLine("sentences", "reward");
    showWorldFeedbackChip(`🎁 ${sentencesUnlockedRewards}-р шагнал нээгдлээ!`, "reward");
    worldSoundscape.play("reward");
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

function getQaCurrentRound() {
  return qaRoundPool[qaRoundIndex % qaRoundPool.length];
}

function renderQaRewards() {
  renderRewards({
    rewardBarEl: qaRewardBarEl,
    rewardImageEls: qaRewardImageEls,
    unlockedRewards: qaUnlockedRewards,
    totalSteps: QA_REWARD_STEPS.length,
  });
}

function renderLessonRewards() {
  renderRewards({
    rewardBarEl: lessonRewardBarEl,
    rewardImageEls: lessonRewardImageEls,
    unlockedRewards: lessonUnlockedRewards,
    totalSteps: QA_REWARD_STEPS.length,
  });
}

function syncLessonElapsedSeconds() {
  if (!lessonTimerStartedAt) return;
  const runningSeconds = Math.floor((Date.now() - lessonTimerStartedAt) / 1000);
  lessonElapsedSeconds = Math.max(lessonElapsedSeconds, runningSeconds);
}

function updateLessonTimerUI() {
  syncLessonElapsedSeconds();

  let unlockedChanged = false;
  while (lessonUnlockedRewards < QA_REWARD_STEPS.length && lessonElapsedSeconds >= QA_REWARD_STEPS[lessonUnlockedRewards].seconds) {
    lessonUnlockedRewards += 1;
    unlockedChanged = true;
  }

  if (unlockedChanged) renderLessonRewards();
}

function stopLessonTimer() {
  syncLessonElapsedSeconds();
  if (lessonTimerInterval) {
    clearInterval(lessonTimerInterval);
    lessonTimerInterval = null;
  }
  lessonTimerStartedAt = null;
}

function startLessonTimer() {
  if (lessonTimerInterval) return;
  lessonTimerStartedAt = Date.now() - (lessonElapsedSeconds * 1000);
  updateLessonTimerUI();
  lessonTimerInterval = setInterval(() => {
    updateLessonTimerUI();
  }, 1000);
}

function showQaToast(message) {
  if (!qaToastEl) return;
  qaToastEl.textContent = message;
  setHidden(qaToastEl, false);
  toggleClass(qaToastEl, "show", true);
  clearTimeout(qaToastTimer);
  qaToastTimer = setTimeout(() => {
    toggleClass(qaToastEl, "show", false);
    setHidden(qaToastEl, true);
  }, 2200);
}

function syncQaElapsedSeconds() {
  if (!qaTimerStartedAt) return;
  const runningSeconds = Math.floor((Date.now() - qaTimerStartedAt) / 1000);
  qaElapsedSeconds = Math.max(qaElapsedSeconds, runningSeconds);
}

function updateQaTimerUI() {
  syncQaElapsedSeconds();
  let unlockedChanged = false;
  while (qaUnlockedRewards < QA_REWARD_STEPS.length && qaElapsedSeconds >= QA_REWARD_STEPS[qaUnlockedRewards].seconds) {
    showQaToast(`Шагнал авлаа: ${QA_REWARD_STEPS[qaUnlockedRewards].label}`);
    qaUnlockedRewards += 1;
    unlockedChanged = true;
  }

  if (unlockedChanged) renderQaRewards();
}

function stopQaTimer() {
  syncQaElapsedSeconds();
  if (qaTimerInterval) {
    clearInterval(qaTimerInterval);
    qaTimerInterval = null;
  }
  qaTimerStartedAt = null;
}

function startQaTimer() {
  if (qaTimerInterval) return;
  qaTimerStartedAt = Date.now() - (qaElapsedSeconds * 1000);
  updateQaTimerUI();
  qaTimerInterval = setInterval(() => {
    updateQaTimerUI();
  }, 1000);
}

function renderQaBuilder() {
  if (!qaQuestionLineEl || !qaAnswerLineEl || !qaWordBankEl) return;
  const activeLine = qaQuestionSolved ? "answer" : "question";

  qaQuestionLineEl.innerHTML = qaQuestionBuilt.length
    ? qaQuestionBuilt.map((chip) => `<button class="qa-chip placed" data-chip-id="${chip.id}" data-source="question" type="button">${chip.token}</button>`).join("")
    : '<span class="qa-placeholder">Асуултын мөрөнд үгсээ байрлуулна.</span>';

  qaAnswerLineEl.innerHTML = qaAnswerBuilt.length
    ? qaAnswerBuilt.map((chip) => `<button class="qa-chip placed" data-chip-id="${chip.id}" data-source="answer" type="button">${chip.token}</button>`).join("")
    : '<span class="qa-placeholder">Хариултын мөрөнд үгсээ байрлуулна.</span>';

  toggleClass(qaAnswerLineEl, "locked", !qaQuestionSolved);

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

function setupQaRound(options = {}) {
  const round = options.round || getQaCurrentRound();
  const sourceTokens = Array.isArray(options.wordBankTokens) && options.wordBankTokens.length
    ? options.wordBankTokens
    : getQaWordBankTokens(round);

  qaQuestionSolved = false;
  qaQuestionBuilt = [];
  qaAnswerBuilt = [];
  qaBank = qaShuffle(sourceTokens).map((token, index) => ({ id: `${Date.now()}-${index}-${Math.random()}`, token }));

  qaMnQuestionEl.textContent = round.mnQuestion;
  qaMnAnswerEl.textContent = round.mnAnswer;
  qaEnQuestionEl.textContent = round.enQuestion;
  qaEnAnswerEl.textContent = round.enAnswer;
  setHidden(qaEnQuestionWrap, true);
  setHidden(qaEnAnswerWrap, true);
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
  openModal(qaModalEl, { titleEl: qaModalTitleEl, title, bodyEl: qaModalBodyEl, bodyHtml: htmlBody });
}

function closeQaModal() {
  if (!qaModalEl) return;
  closeModal(qaModalEl);
}

function buildQaSentencesModalHtml() {
  const rounds = qaRoundPool.length ? qaRoundPool : qaRoundPoolForLevel(qaGameLevel || DIFFICULTY_LEVELS.BEGINNER);
  return rounds
    .map((round) => `<p>${round.enQuestion} - ${round.enAnswer}</p><p>${round.mnQuestion} - ${round.mnAnswer}</p>`)
    .join("");
}

function qaLevelLabel(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд" : levelKey === DIFFICULTY_LEVELS.ADVANCED ? "Дээд" : "Анхан";
}

function selectQaLevel(levelKey) {
  qaGameLevel = levelKey;
  qaRoundPool = qaRoundPoolForLevel(levelKey);
  qaRoundIndex = 0;
  setHidden(qaRoundPanelEl, false);
  setHidden(qaLevelOptionsEl, true);
  qaLevelSelectBtn.textContent = `Сонгосон түвшин: ${qaLevelLabel(levelKey)}`;
  setupQaRound();
  startQaTimer();
}

function resetQaGameScreen() {
  const initialLevel = qaGameLevel || DIFFICULTY_LEVELS.BEGINNER;
  qaGameLevel = initialLevel;
  qaRoundPool = qaRoundPoolForLevel(initialLevel);
  qaRoundIndex = 0;
  qaBank = [];
  qaQuestionBuilt = [];
  qaAnswerBuilt = [];
  qaQuestionSolved = false;
  qaElapsedSeconds = 0;
  qaUnlockedRewards = 0;
  qaTimerStartedAt = null;
  stopQaTimer();
  updateQaTimerUI();
  renderQaRewards();
  setHidden(qaRoundPanelEl, false);
  setHidden(qaLevelOptionsEl, true);
  qaLevelSelectBtn.textContent = `Сонгосон түвшин: ${qaLevelLabel(initialLevel)}`;
  qaFeedbackEl.textContent = "";
  setupQaRound();
  startQaTimer();
}


function initializeManagers() {
  appTimerManager = createAppTimerManager({
    storageKeys: {
      dailyTotalsKey: APP_TIME_DAILY_TOTALS_KEY,
      activeSessionKey: APP_TIME_ACTIVE_SESSION_KEY,
    },
    stopActivityTimers: () => {
      endSentenceGameSession();
      stopLessonTimer();
      stopQaTimer();
      stopSentencesTimer();
    },
    syncCoreStateReferences,
    getProgressState: () => progressState,
    replaceProgress,
    updateStreak,
    renderCoreStateSnapshot,
    getTodayKey,
    dom: {
      todayTimeEls,
      timeDetailsYesterdayEl,
      timeDetailsThisWeekEl,
      timeDetailsLastWeekEl,
      timeDetailsThisMonthEl,
      timeDetailsLastMonthEl,
      statsTodayMinutesEl,
      statsThisWeekTimeEl,
      statsLastWeekTimeEl,
      statsThisMonthTimeEl,
      statsLast7DaysEl,
    },
    rewardTabs: {
      loadCoreState,
      buildLast7DaysTimeRows,
      updateGaugeUI,
      renderRewardsTab,
      renderStatsSnapshot,
      renderProfileSnapshot,
    },
  });

  vaultManager = createVaultManager({
    badgeElsByScreen: { lesson: lessonVaultBadge, qna: qaVaultBadge, sentenceGame: sentenceGameVaultBadge, sentences: sentencesVaultBadge },
    modal: {
      modalEl: vaultModalEl,
      titleEl: vaultModalTitleEl,
      bodyEl: vaultModalBodyEl,
      replayBtn: vaultReplayBtn,
      deleteBtn: vaultDeleteBtn,
      learnedBtn: vaultLearnedBtn,
    },
    showVaultToast,
    lessonMnTranslation,
    sentencesListEl,
    appSettings: () => appSettings,
    sentenceItems: () => sentenceItems,
    speakingSentenceId: () => speakingSentenceId,
    stopSpeaking,
    speakSentence,
    sentenceGame: {
      setHistory: (history) => { sentenceGameHistory = history; },
      setIndex: (index) => { sentenceGameIndex = index; },
      initRound: initSentenceGameRound,
      enforceFreeXpGate,
      renderSentences,
    },
    qa: {
      openModal: openQaModal,
      loadRound: (round) => {
        qaGameLevel = DIFFICULTY_LEVELS.INTERMEDIATE;
        qaRoundPool = [round];
        qaRoundIndex = 0;
        setHidden(qaRoundPanelEl, false);
        setHidden(qaLevelOptionsEl, true);
        qaLevelSelectBtn.textContent = "Сонгосон түвшин: Давтах";
        const questionTokens = round.enQuestion.split(" ").filter(Boolean);
        const answerTokens = round.enAnswer.split(" ").filter(Boolean);
        setupQaRound({ round, wordBankTokens: [...questionTokens, ...answerTokens] });
        startQaTimer();
      },
    },
    lesson: {
      startFromSaved: (savedItem) => {
        lessonReviewMode = true;
        questions = [{
          q: savedItem.questionText || "",
          a: savedItem.correctAnswer || "",
          replayOptions: Array.isArray(savedItem.options) ? savedItem.options.slice() : [],
        }];
        currentIndex = 0;
        locked = false;
        stopSpeaking();
        showScreen(SCREEN_NAMES.LESSON);
        renderQuestion();
      },
    },
    markWordLearned,
    showScreen,
    screens: {
      sentences: SCREEN_NAMES.SENTENCES,
      sentenceGame: SCREEN_NAMES.SENTENCE_GAME,
      qaGame: SCREEN_NAMES.QA_GAME,
    },
  });

  screenNavigator = createScreenNavigator({
    screens: SCREENS,
    screenIds: SCREEN_IDS,
    screenRegistry: SCREEN_REGISTRY,
    getActiveScreenId: () => activeScreenId,
    setActiveScreenId: (screenId) => { activeScreenId = screenId; },
    setStateValue,
    setAppMode,
    state: {
      topbar,
      startScreen,
      quizScreen,
      sentencesScreen,
      sentenceGameScreen,
      qaGameScreen,
      profileScreen,
      destinations: FLOW_DESTINATIONS,
      hasQaGameLevel: () => Boolean(qaGameLevel),
    },
    boardEntry: {
      getState: getBoardEntryState,
      reset: resetBoardEntryState,
      steps: BOARD_SELECTOR_STEPS,
    },
    getCoreState,
    getDefaultChapterForWorld,
    updateBoardEntryState,
    updateSelections,
    updateState,
    stopSpeaking,
    startQuiz,
    ensureSentenceItemsLoaded,
    initSentenceGameRound,
    enforceFreeXpGate,
    resetQaGameScreen,
    initBoardGameMvp,
    updateStatsUI,
    updateProfileUI,
    updateHeaderStatus,
    hideStartIntroPanel,
    setStartLevelMenuOpen,
    resetLessonProgress,
    closeHomeModesPanel,
    worldSoundscape,
    updateCompanionLine,
    startSession,
    startTimeUiUpdater,
    refreshTimeSummaryUI,
    screenVisibility: {
      sentenceGameVisible: sentenceGameScreenVisible,
      qaVisible: () => qaGameScreen && !isHidden(qaGameScreen),
      sentencesVisible: () => sentencesScreen && !isHidden(sentencesScreen),
      lessonVisible: () => quizScreen && !isHidden(quizScreen),
    },
    timers: {
      beginSentenceGameSession,
      endSentenceGameSession,
      startLessonTimer,
      stopLessonTimer,
      startQaTimer,
      stopQaTimer,
      startSentencesTimer,
      stopSentencesTimer,
    },
  });
}

function initializeStateSubscriptions() {
  if (stateSubscriptionsInitialized) return;
  stateSubscriptionsInitialized = true;

  subscribeState((_state, scope) => {
    if (["core", "progress", "settings", "rewards", "learnedWords", "chapters", "selectedWorld", "selectedDifficulty", "selections"].includes(scope)) {
      renderCoreStateSnapshot();
    }
  });
}

function initializeAppState() {
  loadCoreState({ persist: false });
  syncCoreStateReferences();
  syncProgressForToday();
  persistProgressState();

  updateTtsControlState();
  updateSoundToggleState();
  ensureAudioUnlocked();
  loadSentenceGameClimbLevel();
  renderSentenceGameClimb(sentenceGameClimbLevel);
  loadSentenceGameRewardState();
  updateSentenceGameRewardLevel({ allowBanner: false });
  reconcileRewardTierProgress();
  persistSentenceGameRewardState();
  loadSentenceGameDifficulty();
  updateHeaderStatus();
  updateProfileUI();
  updateStatsUI();
  refreshTimeSummaryUI();
  const { selectedWorldId, selectedDifficultyId } = getCoreState();
  syncBoardEntryFlowState({
    worldId: selectedWorldId,
    difficultyId: selectedDifficultyId,
  });
}

function initializeDebugMode() {
  initDebugTools({
    getChapterOptions: () => SCREEN_REGISTRY[SCREEN_NAMES.CHAPTER_COVER]?.getAvailableDebugChapters(debugUnlockedChapterIds) || [],
    navigateTo: (screenId) => requestNavigation(screenId),
    previewChapterCover: (chapterId) => previewChapterCover(chapterId),
    jumpToBoard: () => requestNavigation(FLOW_DESTINATIONS.BOARD_ENTRY),
    jumpToBoardChapter: (chapterId) => jumpToBoardChapter(chapterId),
    unlockAllChapters: () => unlockAllDebugChapters(),
    giveXp: (amount) => giveDebugXp(amount),
    giveRewards: () => giveDebugRewards(),
    resetProgress: () => resetDebugProgress(),
  });
  SCREEN_REGISTRY[SCREEN_NAMES.CHAPTER_COVER]?.setPreview();
}

function initializeRewardUi() {
  renderSentencesRewards();
  updateSentencesTimerUI();
  renderLessonRewards();
  updateLessonTimerUI();
}

function initializeSentenceGameControls() {
  if (sentenceGameTipTextEl) {
    sentenceGameTipTextEl.textContent = SENTENCE_GAME_TIP_TEXT;
  }

  bindClickOnce(sentenceGameTipToggleBtn, "sentence-game:tip-toggle", toggleSentenceGameTipPanel);

  bindClickOnce(sentenceGameTipSpeakBtn, "sentence-game:tip-speak", speakSentenceGameTip);

  bindClickOnce(sentenceGameTipStopBtn, "sentence-game:tip-stop", stopSentenceGameTipSpeech);

  bindClickOnce(sentenceGameTipReadBtn, "sentence-game:tip-read", showSentenceGameTipText);

  bindClickOnce(sentenceGameTipCloseBtn, "sentence-game:tip-close", closeSentenceGameTipPanel);

  bindClickOnce(sentenceGameDifficultyToggleBtn, "sentence-game:difficulty-toggle", () => {
    const nextOpen = sentenceGameDifficultyPanelEl ? isHidden(sentenceGameDifficultyPanelEl) : false;
    setSentenceGameDifficultyPanelOpen(nextOpen);
  });

  sentenceGameDifficultyButtons.forEach((btn) => {
    bindClickOnce(btn, `sentence-game:difficulty:${btn.dataset.difficulty || btn.textContent}`, () => {
      selectSentenceGameDifficulty(btn.dataset.difficulty || DIFFICULTY_LEVELS.BEGINNER, { collapsePanel: true });
    });
  });

  bindClickOnce(sentenceGameUndoBtn, "sentence-game:undo", undoSentenceGameMove);
  bindClickOnce(sentenceGameShowCorrectBtn, "sentence-game:show-correct", showSentenceGameCorrectAnswer);
  bindClickOnce(sentenceGameRetryBtn, "sentence-game:retry", retrySentenceGameRound);
  bindClickOnce(sentenceGamePrevBtn, "sentence-game:prev", prevSentenceGameRound);
  bindClickOnce(sentenceGameNextBtn, "sentence-game:next", nextSentenceGameRound);

  setSentenceGameDifficultyPanelOpen(false);
  updateSentenceGameTipControls();
}

function initializeVaultControls() {
  bindClickOnce(lessonSaveBtn, "vault:save-lesson", saveCurrentLessonItem);
  bindClickOnce(sentencesSaveBtn, "vault:save-sentences", saveCurrentSentencesItem);
  bindClickOnce(qaSaveBtn, "vault:save-qa", saveCurrentQaRound);
  bindClickOnce(sentenceGameSaveBtn, "vault:save-sentence-game", saveCurrentSentenceGameItem);

  bindClickOnce(lessonVaultBtn, "vault:open-lesson", () => renderVaultModal(vaultKeyForScreen(SCREEN_NAMES.LESSON)));
  bindClickOnce(qaVaultBtn, "vault:open-qa", () => renderVaultModal(vaultKeyForScreen("qna")));
  bindClickOnce(sentenceGameVaultBtn, "vault:open-sentence-game", () => renderVaultModal(vaultKeyForScreen("sentenceGame")));
  bindClickOnce(sentencesVaultBtn, "vault:open-sentences", () => renderVaultModal(vaultKeyForScreen(SCREEN_NAMES.SENTENCES)));

  bindModalDismissal({
    modalEl: vaultModalEl,
    closeBtn: vaultModalCloseBtn,
  });

  [SCREEN_NAMES.LESSON, "qna", "sentenceGame", SCREEN_NAMES.SENTENCES].forEach((screenId) => updateVaultBadge(vaultKeyForScreen(screenId)));
}

function initializeQaControls() {
  resetQaGameScreen();

  bindClickOnce(qaLevelSelectBtn, "qa:level-toggle", () => {
    setHidden(qaLevelOptionsEl, !isHidden(qaLevelOptionsEl));
  });

  qaLevelButtons.forEach((btn) => {
    bindClickOnce(btn, `qa:level:${btn.dataset.qaLevel || btn.textContent}`, () => selectQaLevel(btn.dataset.qaLevel));
  });

  bindClickOnce(qaCheckBtn, "qa:check", checkQaAnswer);

  bindClickOnce(qaToggleQuestionBtn, "qa:toggle-question", () => {
    const willShow = isHidden(qaEnQuestionWrap);
    setHidden(qaEnQuestionWrap, !willShow);
    qaToggleQuestionBtn.textContent = willShow ? "Асуултыг нуух" : "Асуултыг харах";
  });

  bindClickOnce(qaToggleAnswerBtn, "qa:toggle-answer", () => {
    const willShow = isHidden(qaEnAnswerWrap);
    setHidden(qaEnAnswerWrap, !willShow);
    qaToggleAnswerBtn.textContent = willShow ? "Хариултыг нуух" : "Хариултыг харах";
  });

  bindClickOnce(qaShowSentencesBtn, "qa:show-sentences", () => openQaModal("Бүтэн өгүүлбэрүүд", buildQaSentencesModalHtml()));

  bindClickOnce(qaShowHelpBtn, "qa:show-help", () => openQaModal("Тоглоомын тайлбар", `<p>${QA_LONG_EXPLANATION_TEXT}</p>`));

  bindModalDismissal({
    modalEl: qaModalEl,
    closeBtn: qaModalCloseBtn,
    onClose: closeQaModal,
  });
}

function initializeSentenceFilterControls() {
  updateSentenceFilterActiveState();
  setSentencesLevelPickerOpen(false);

  bindClickOnce(sentencesLevelPickerBtn, "sentences:filter-toggle", () => {
    const nextOpen = sentencesLevelOptionsEl ? isHidden(sentencesLevelOptionsEl) : false;
    setSentencesLevelPickerOpen(nextOpen);
  });

  sentencesLevelOptionButtons.forEach((btn) => {
    bindClickOnce(btn, `sentences:filter:${btn.dataset.filter || btn.textContent}`, () => {
      sentenceFilter = btn.dataset.filter || DIFFICULTY_LEVELS.BEGINNER;
      updateSentenceFilterActiveState();
      setSentencesLevelPickerOpen(false);
      stopSpeaking();
      renderSentences();
      updateHeaderStatus();
    });
  });

  bindManagedEvent(document, "click", "sentences:filter-close-outside", (event) => {
    if (!sentencesLevelPickerEl || !sentencesLevelOptionsEl || isHidden(sentencesLevelOptionsEl)) return;
    if (!sentencesLevelPickerEl.contains(event.target)) {
      setSentencesLevelPickerOpen(false);
    }
  });
}

function initializeAudioAndSentenceControls() {
  voiceOptionButtons.forEach((btn) => {
    bindClickOnce(btn, `tts:voice:${btn.dataset.voice || btn.textContent}`, () => {
      appSettings.ttsSettings.voice = btn.dataset.voice;
      updateTtsControlState();
      persistTtsSettings();
    });
  });

  bindManagedEvent(ttsRateSlider, "input", "tts:rate", () => {
    appSettings.ttsSettings.rate = Math.round(Number(ttsRateSlider.value) * 20) / 20;
    updateTtsControlState();
    persistTtsSettings();
  });

  soundToggleButtons.forEach((toggleBtn) => {
    bindClickOnce(toggleBtn, `app:sound-toggle:${toggleBtn.id || toggleBtn.className}`, () => {
      const nextSoundEnabled = !appSettings.soundEnabled;
      updateSettings({ soundEnabled: nextSoundEnabled });
      syncCoreStateReferences();
      setGlobalSoundEnabled(appSettings.soundEnabled);
      if (!appSettings.soundEnabled) {
        stopSpeaking();
        gameFeelSoundManager.stopAmbient();
        worldSoundscape.stop();
      } else if (boardGameScreen && !isHidden(boardGameScreen)) {
        gameFeelSoundManager.startAmbient();
      } else {
        const activeScreen = document.body?.dataset.activeScreen || "home";
        worldSoundscape.start(activeScreen === "lesson" ? "lesson" : (activeScreen === "sentences" ? "sentences" : "home"));
      }
      updateSoundToggleState();
    });
  });
}

function initializePlayExitControls() {
  playExitButtons.forEach((btn) => {
    bindClickOnce(btn, `app:play-exit:${btn.id || btn.className}`, () => {
      gameFeelSoundManager.stopAmbient();
      worldSoundscape.stop();
      exitPlayModeToHome();
    });
  });
}

function handleStartLevelSelection(button) {
  if (!button) return;
  syncToggleButtons(startLevelOptions, (option) => option === button, { pressed: false });
  level = button.dataset.level;
  hasExplicitStartLevelSelection = true;
  updateStartButtonLabel();
  setStartLevelMenuOpen(false);
  updateHeaderStatus();
  startQuiz();
}

function initializeScreenRegistry() {
  setStartLevelMenuOpen(false);
  updateStartButtonLabel();
  setAppMode(GAME_MODES.HOME);
  syncToggleButtons(startLevelOptions, (btn) => btn.dataset.level === level, { pressed: false });

  SCREEN_REGISTRY.start = initHomeScreen({
    onNavigate: (destination) => requestNavigation(destination),
    onToggleModes: () => toggleHomeModesPanel(),
    onCloseModes: () => closeHomeModesPanel(),
    onToggleIntro: () => toggleStartIntroPanel(),
    onCloseIntro: () => hideStartIntroPanel(),
    onSetStartLevelMenuOpen: (isOpen) => setStartLevelMenuOpen(isOpen),
    onSelectStartLevel: (button) => handleStartLevelSelection(button),
  });

  SCREEN_REGISTRY[SCREEN_NAMES.CHAPTER_COVER] = initChapterCoverScreen({
    getSelectionState: () => getBoardEntryState(),
    onAdvanceSelectorStep: (step) => {
      syncBoardEntryFlowState({ step });
    },
    onSelectWorld: (worldId) => {
      syncBoardEntryFlowState({
        step: BOARD_SELECTOR_STEPS.DIFFICULTY,
        worldId,
        chapterId: getDefaultChapterForWorld(worldId)?.id || null,
      });
    },
    onSelectDifficulty: (difficultyId) => {
      syncBoardEntryFlowState({
        step: BOARD_SELECTOR_STEPS.READY,
        difficultyId,
      });
    },
    onStartGame: (selection = {}) => {
      const route = resolveBoardSelectionRoute(selection);
      syncBoardEntryFlowState({
        step: BOARD_SELECTOR_STEPS.PLAY,
        worldId: route.worldId,
        difficultyId: route.difficultyId,
        chapterId: route.chapterId,
      });
      navigateTo(FLOW_DESTINATIONS.BOARD_PLAY);
    },
  });

  SCREEN_REGISTRY[SCREEN_NAMES.BOARD] = initBoardScreen({
    onRollDice: () => boardGameRollDice(),
    onResizeWhileVisible: () => updateBoardGameTokenPosition(),
    onActivate: () => {
      if (!boardGameBootstrapped) initBoardGameMvp();
    },
  });

  SCREEN_REGISTRY.lesson = initLessonScreen({
    onNext: () => nextQuestion(),
    onRestart: () => startQuiz(),
    onSetStartLevelMenuOpen: (isOpen) => setStartLevelMenuOpen(isOpen),
    onSelectStartLevel: (button) => handleStartLevelSelection(button),
  });

  SCREEN_REGISTRY.stats = initStatsScreen({
    onBeforeOpenTimeDetails: () => refreshTimeSummaryUI(),
    onPeriodChange: (btn) => {
      statsSelectedPeriod = btn.dataset.period || STATS_PERIODS.DAY;
      syncToggleButtons(statsPeriodButtons, (item) => item === btn, { pressed: false });
      refreshTimeSummaryUI();
    },
    onRewardTabChange: (btn) => {
      statsRewardTab = btn.dataset.rewardTab || REWARD_TABS.DAYS;
      statsRewardTabButtons.forEach((item) => {
        const active = item === btn;
        setActiveState(item, active);
        setSelectedState(item, active);
      });
      renderRewardsTab();
    },
  });
}

function initializeLifecycleEvents() {
  bindManagedEvent(document, "visibilitychange", "app:lifecycle:persist-visibility", () => {
    if (document.hidden) {
      persistAllActiveTime();
      ensureStoppedIfHidden();
      stopTimeUiUpdater();
      return;
    }

    if (sentenceGameScreenVisible()) {
      beginSentenceGameSession();
    }

    const visibleScreen = document.querySelector(".card:not(.hidden)");
    if (visibleScreen) {
      const screenId = SCREEN_IDS[visibleScreen.id] || visibleScreen.id;
      startSession(screenId);
      startTimeUiUpdater();
      refreshTimeSummaryUI();
    }
  });

  bindManagedEvent(window, "pagehide", "app:lifecycle:pagehide", () => {
    persistAllActiveTime();
    stopTimeUiUpdater();
  });

  bindManagedEvent(window, "beforeunload", "app:lifecycle:beforeunload", () => {
    persistAllActiveTime();
    stopTimeUiUpdater();
  });

  bindManagedEvent(document, "visibilitychange", "app:lifecycle:audio-visibility", () => {
    audioEngine.onVisibilityChange();
  });
}

function initializeSpeechAndProfileControls() {
  if ("speechSynthesis" in window) {
    loadVoices();
    bindManagedEvent(window.speechSynthesis, "voiceschanged", "tts:voiceschanged", loadVoices);
  }

  bindManagedEvent(profileNameInput, "input", "profile:name-input", () => {
    updateSettings({ profileName: profileNameInput.value.trim() });
    persistCoreAppState();
    updateProfileUI();
  });
}

function initializePremiumControls() {
  bindClickOnce(upgradePremiumBtn, "premium:upgrade", () => {
    openPremiumModal("Төлбөрийн хэсэг удахгүй нээгдэнэ");
  });

  bindModalDismissal({
    modalEl: premiumOverlay,
    closeBtn: premiumOkBtn,
    onClose: closePremiumModal,
  });
}

function initializeInstallPrompt() {
  schedulePostStartupTask(() => registerServiceWorker(), { timeout: 3000 });

  bindManagedEvent(window, "beforeinstallprompt", "app:install:beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallHintVisibility();
  });

  bindManagedEvent(window, "appinstalled", "app:install:installed", () => {
    deferredInstallPrompt = null;
    updateInstallHintVisibility();
  });

  bindClickOnce(installBtn, "app:install:prompt", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallHintVisibility();
  });

  updateInstallHintVisibility();
}

function initializeActiveScreenTracking() {
  const initialVisibleScreen = document.querySelector(".card:not(.hidden)");
  if (initialVisibleScreen) {
    const initialScreenId = SCREEN_IDS[initialVisibleScreen.id] || initialVisibleScreen.id;
    const isHomeVisible = initialVisibleScreen === startScreen;
    activeScreenId = initialScreenId;
    SCREEN_REGISTRY[initialScreenId]?.enter?.({ previousScreenId: null, nextScreenId: initialScreenId });
    setAppMode(isHomeVisible ? GAME_MODES.HOME : GAME_MODES.LEARNING);
    startSession(initialScreenId);
    startTimeUiUpdater();
  } else {
    setAppMode(GAME_MODES.HOME);
  }
}

function auditPrimaryButtonWiring() {
  const buttonAudit = [
    { name: "home modes", element: navModesBtn, key: "home:toggle-modes" },
    { name: "home lesson", element: document.getElementById("nav-lesson-btn"), key: "home:navigate-lesson" },
    { name: "home sentences", element: document.getElementById("nav-sentences-btn"), key: "home:navigate-sentences" },
    { name: "home sentence game", element: document.getElementById("nav-sentence-game-btn"), key: "home:navigate-sentence-game" },
    { name: "home q&a", element: document.getElementById("nav-qa-game-btn"), key: "home:navigate-qa-game" },
    { name: "home board game", element: document.getElementById("nav-board-game-btn"), key: "home:navigate-board-game" },
    { name: "home stats", element: document.getElementById("nav-stats-btn"), key: "home:navigate-stats" },
    { name: "home profile", element: document.getElementById("nav-profile-btn"), key: "home:navigate-profile" },
    { name: "lesson start level", element: startBtn, key: "lesson:start-level-menu-toggle" },
    { name: "board continue", element: document.getElementById("board-game-intro-continue-btn"), key: "board-entry:continue" },
    { name: "board roll", element: boardGameRollBtn, key: "board:roll-button" },
    { name: "lesson next", element: document.getElementById("next-btn"), key: "lesson:next" },
  ];

  soundToggleButtons.forEach((button, index) => {
    buttonAudit.push({
      name: `sound toggle ${index + 1}`,
      element: button,
      key: `app:sound-toggle:${button.id || button.className}`,
    });
  });

  playExitButtons.forEach((button, index) => {
    buttonAudit.push({
      name: `play exit ${index + 1}`,
      element: button,
      key: `app:play-exit:${button.id || button.className}`,
    });
  });

  const missingBindings = buttonAudit.filter(({ element, key }) => !hasClickBinding(element, key));
  if (missingBindings.length) {
    console.warn("[NomadSpeak] Missing primary button click wiring:", missingBindings.map(({ name }) => name));
  }
}

export function initializeApp() {
  if (appInitialized) {
    auditPrimaryButtonWiring();
    return;
  }

  appInitialized = true;
  initializeManagers();
  initializeAppState();
  renderCoreStateSnapshot();
  initializeStateSubscriptions();
  initializeScreenRegistry();
  initializeDebugMode();
  initializeRewardUi();
  initializeSentenceGameControls();
  initializeVaultControls();
  initializeQaControls();
  initializeSentenceFilterControls();
  initializeAudioAndSentenceControls();
  initializePlayExitControls();
  initializeLifecycleEvents();
  initializeSpeechAndProfileControls();
  initializePremiumControls();
  initializeInstallPrompt();
  initializeActiveScreenTracking();
  auditPrimaryButtonWiring();

  schedulePostStartupTask(() => {
    ensureSentenceItemsLoaded().catch(() => {});
  });
}

function sentenceLevelFilterLabel(filterKey) {
  return filterKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд" : filterKey === DIFFICULTY_LEVELS.ADVANCED ? "Дээд" : "Анхан";
}

function setSentencesLevelPickerOpen(isOpen) {
  if (!sentencesLevelOptionsEl || !sentencesLevelPickerBtn) return;
  setExpandedState(sentencesLevelPickerBtn, sentencesLevelOptionsEl, isOpen);
}

function updateSentenceFilterActiveState() {
  if (sentencesLevelPickerBtn) {
    sentencesLevelPickerBtn.textContent = `Түвшин сонгох: ${sentenceLevelFilterLabel(sentenceFilter)}`;
  }

  sentencesLevelOptionButtons.forEach((btn) => {
    const isActive = btn.dataset.filter === sentenceFilter;
    setActiveState(btn, isActive);
    setCheckedState(btn, isActive);
  });
}
