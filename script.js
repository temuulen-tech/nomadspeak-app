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
import {
  isAudioInteractionUnlocked,
  isAudioPrimed,
  markAudioPrimed,
  playTone,
  primeAudioContext,
  setSoundEnabled as setGlobalSoundEnabled,
  unlockAudioInteraction,
} from "./audio.js";
import { initHomeScreen } from "./home-screen.js";
import { initChapterCoverScreen } from "./chapter-cover-screen.js";
import { BOARD_WORLD_CHAPTERS, getChapterConfig, getDefaultChapterForWorld, resolveBoardSelectionRoute, resolveChapterContent } from "./chapters.js";
import { initBoardScreen } from "./board-screen.js";
import { initLessonScreen } from "./lesson-screen.js";
import { LESSON_TRANSLATIONS, buildOptions, levelName } from "./lesson.js";
import { initStatsScreen } from "./stats-screen.js";
import { createQaControls } from "./qa-wiring.js";
import { createAudioControls } from "./audio-wiring.js";
import { createSentenceFilterControls, createSentenceGameControls } from "./sentence-game-wiring.js";
import { createVaultManager } from "./vault-manager.js";
import { createVaultUiBridge } from "./vault-ui-bridge.js";
import { createAppTimerManager } from "./app-timer.js";
import { createSentenceGameRewardManager } from "./sentence-game-reward-manager.js";
import { createSessionElapsedTimer } from "./session-elapsed-timer.js";
import { createScreenNavigator } from "./screen-navigation.js";
import { REWARD_ICON_SEQUENCE } from "./assets.js";
import {
  renderHomeScreen,
  setHomeModesPanelOpen,
  setStartIntroOpen,
  setStartLevelMenuOpen as renderStartLevelMenuOpen,
  updateStartButtonLabel as renderStartButtonLabel,
} from "./render-home.js";
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
} from "./render-rewards.js";
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
  filterSentenceItemsForBank,
  prepareSentenceItems,
  resolveSentenceContentBank,
  tokenizeSentence,
} from "./sentence-game.js";
import {
  QA_REWARD_STEPS,
  QA_ROUNDS,
} from "./qa-game.js";
import { initDebugTools } from "./debug-tools.js";
import {
  createCompletionBannerController,
  createProgressUi,
  createTimedRewardTrack,
  renderLinearRewardBar,
  renderSentencesRewardStrip,
  startLevelLabel,
} from "./progress-ui.js";
import { getWorldAudioTrack } from "./worlds.js";
import { createAppBootstrap } from "./app-bootstrap.js";
import { createAudioEngine, createWorldSoundscape, SOUND_EVENT_HOOKS } from "./app-audio-manager.js";
import { createBoardRuntime } from "./board-runtime.js";
import { showWorldFeedbackChip as renderWorldFeedbackChip, updateCompanionLine as updateCompanionLineUi } from "./world-ui.js";
import { getAppDom } from "./app-dom.js";
import {
  createBoardHandlers,
  createChapterCoverHandlers,
  createHomeHandlers,
  createInitialHomeUiSetter,
  createLessonHandlers,
  createPlayExitControls,
  createPremiumControls,
  createSpeechControls,
  createStartLevelSelectionHandler,
  createStatsHandlers,
} from "./app-orchestration.js";
import { createLessonFlow } from "./lesson-flow.js";
import { createQaFlow } from "./qa-flow.js";
import {
  BOARD_SELECTOR_STEPS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_LEVEL_LIST,
  FLOW_DESTINATIONS,
  GAME_MODES,
  REWARD_TABS,
  SCREEN_NAMES,
  STATS_PERIODS,
} from "./constants.js";

// ======================
// NomadSpeak Quiz Engine
// 4 options • 3 levels • score • end screen
// ======================

// ---- Lesson content lives in lesson.js; script.js keeps orchestration only. ----

// ---- DOM ----
const appDom = getAppDom();
const {
  screens: {
    startScreen,
    quizScreen,
    sentencesScreen,
    statsScreen,
    sentenceGameScreen,
    qaGameScreen,
    boardGameIntroScreen,
    boardGameScreen,
    profileScreen,
    endScreen,
  },
  lesson: {
    topbar,
    levelLabel,
    scoreEl,
    progressEl,
    questionEl,
    optionsEl,
    resultEl,
    startBtn,
    introToggleBtn,
    introPanel,
    finalTextEl,
    lessonFlowCopyEl,
    lessonRewardCopyEl,
    lessonFinishTitleEl,
    lessonFinishCopyEl,
    startLevelDropdown,
    startLevelOptions,
    lessonRewardBarEl,
    lessonVaultBtn,
    lessonVaultBadge,
    lessonSaveBtn,
    lessonCompanionLineEl,
  },
  home: {
    navModesBtn,
    homeModesPanel,
  },
  sentences: {
    levelPickerEl: sentencesLevelPickerEl,
    levelPickerBtn: sentencesLevelPickerBtn,
    levelOptionsEl: sentencesLevelOptionsEl,
    levelOptionButtons: sentencesLevelOptionButtons,
    sentencesListEl,
    rewardStripEl: sentencesRewardStripEl,
    vaultBtn: sentencesVaultBtn,
    vaultBadge: sentencesVaultBadge,
    saveBtn: sentencesSaveBtn,
    companionLineEl: sentencesCompanionLineEl,
  },
  sentenceGame: {
    dropzoneEl: sentenceGameDropzoneEl,
    poolEl: sentenceGamePoolEl,
    undoBtn: sentenceGameUndoBtn,
    showCorrectBtn: sentenceGameShowCorrectBtn,
    retryBtn: sentenceGameRetryBtn,
    prevBtn: sentenceGamePrevBtn,
    nextBtn: sentenceGameNextBtn,
    feedbackEl: sentenceGameFeedbackEl,
    toastEl: sentenceGameToastEl,
    correctPanelEl: sentenceGameCorrectPanelEl,
    correctEnEl: sentenceGameCorrectEnEl,
    correctMnEl: sentenceGameCorrectMnEl,
    tipToggleBtn: sentenceGameTipToggleBtn,
    tipPanelEl: sentenceGameTipPanelEl,
    tipTextEl: sentenceGameTipTextEl,
    tipSpeakBtn: sentenceGameTipSpeakBtn,
    tipStopBtn: sentenceGameTipStopBtn,
    tipReadBtn: sentenceGameTipReadBtn,
    tipCloseRowEl: sentenceGameTipCloseRowEl,
    tipCloseBtn: sentenceGameTipCloseBtn,
    climbEl: sentenceGameClimbEl,
    climberEl: sentenceGameClimberEl,
    rewardIconEl: sentenceGameRewardIconEl,
    rewardBannerEl: sentenceGameRewardBannerEl,
    rewardRowEl: sentenceGameRewardRowEl,
    rewardImageEls: sentenceGameRewardImageEls,
    difficultyToggleBtn: sentenceGameDifficultyToggleBtn,
    difficultyPanelEl: sentenceGameDifficultyPanelEl,
    difficultyButtons: sentenceGameDifficultyButtons,
    vaultBtn: sentenceGameVaultBtn,
    vaultBadge: sentenceGameVaultBadge,
    saveBtn: sentenceGameSaveBtn,
  },
  qa: {
    rewardBarEl: qaRewardBarEl,
    toastEl: qaToastEl,
    levelSelectBtn: qaLevelSelectBtn,
    levelOptionsEl: qaLevelOptionsEl,
    levelButtons: qaLevelButtons,
    roundPanelEl: qaRoundPanelEl,
    toggleQuestionBtn: qaToggleQuestionBtn,
    toggleAnswerBtn: qaToggleAnswerBtn,
    mnQuestionEl: qaMnQuestionEl,
    mnAnswerEl: qaMnAnswerEl,
    enQuestionWrap: qaEnQuestionWrap,
    enAnswerWrap: qaEnAnswerWrap,
    enQuestionEl: qaEnQuestionEl,
    enAnswerEl: qaEnAnswerEl,
    questionLineEl: qaQuestionLineEl,
    answerLineEl: qaAnswerLineEl,
    wordBankEl: qaWordBankEl,
    checkBtn: qaCheckBtn,
    feedbackEl: qaFeedbackEl,
    showSentencesBtn: qaShowSentencesBtn,
    showHelpBtn: qaShowHelpBtn,
    modalEl: qaModalEl,
    modalTitleEl: qaModalTitleEl,
    modalBodyEl: qaModalBodyEl,
    modalCloseBtn: qaModalCloseBtn,
    vaultBtn: qaVaultBtn,
    vaultBadge: qaVaultBadge,
    saveBtn: qaSaveBtn,
  },
  profile: {
    premiumOverlay,
    premiumTitleEl,
    premiumMessageEl,
    premiumOkBtn,
    upgradePremiumBtn,
    profileNameInput,
    profileNameSaved,
    profileTotalXpEl,
    profileLevelEl,
    profileStreakDaysEl,
    profileDailyProgressEl,
    profileRewardStageEl,
    profilePlanStatusEl,
  },
  stats: {
    statsTotalXpEl,
    statsLevelEl,
    statsStreakEl,
    statsTodayProgressEl,
    statsTodayMinutesEl,
    statsThisWeekTimeEl,
    statsLastWeekTimeEl,
    statsThisMonthTimeEl,
    statsLast7DaysEl,
    statsPeriodButtons,
    statsKpiLabelEl,
    statsKpiValueEl,
    statsKpiNormEl,
    statsKpiPercentEl,
    statsThermometerFillEl,
    statsThermometerMarkerEl,
    statsThermometerTierEl,
    statsRewardTabButtons,
    statsRewardCardsEl,
    todayTimeEls,
    timeDetailsYesterdayEl,
    timeDetailsThisWeekEl,
    timeDetailsLastWeekEl,
    timeDetailsThisMonthEl,
    timeDetailsLastMonthEl,
  },
  board: {
    boardEl: boardGameBoardEl,
    tokenEl: boardGameTokenEl,
    rollBtn: boardGameRollBtn,
    positionEl: boardGamePositionEl,
    totalTilesEl: boardGameTotalTilesEl,
    lastRollEl: boardGameLastRollEl,
    chapterTitleEl: boardGameChapterTitleEl,
    chapterTextEl: boardGameChapterTextEl,
    challengeTitleEl: boardGameChallengeTitleEl,
    challengeTextEl: boardGameChallengeTextEl,
    screenTitleEl: boardGameScreenTitleEl,
    feedbackEl: boardGameFeedbackEl,
    optionsEl: boardGameOptionsEl,
    diceEl: boardGameDiceEl,
    xpEl: boardGameXpEl,
    coinsEl: boardGameCoinsEl,
    chapterIndexEl: boardGameChapterIndexEl,
    feedbackHubEl: boardGameFeedbackHubEl,
    particlesEl: boardGameParticlesEl,
  },
  appChrome: {
    completionBannerEl,
    completionBannerTextEl,
    installHintEl,
    installBtn,
    worldFeedbackHubEl,
    voiceOptionButtons,
    ttsRateSlider,
    ttsRateValueEl,
    soundToggleButtons,
    playExitButtons,
  },
  vault: {
    modalEl: vaultModalEl,
    titleEl: vaultModalTitleEl,
    bodyEl: vaultModalBodyEl,
    closeBtn: vaultModalCloseBtn,
    replayBtn: vaultReplayBtn,
    deleteBtn: vaultDeleteBtn,
    learnedBtn: vaultLearnedBtn,
  },
  rewards: {
    levelImageEls: rewardLevelImageEls,
    sentenceGameRewardImageEls: rewardStripImageEls,
    qaRewardImageEls,
    lessonRewardImageEls,
  },
} = appDom;

let debugUnlockedChapterIds = BOARD_WORLD_CHAPTERS[0] ? [BOARD_WORLD_CHAPTERS[0].id] : [];

hydrateRewardImagesByLevel({
  imageEls: rewardLevelImageEls,
  rewardIcons: REWARD_ICON_SEQUENCE,
});

hydrateRewardStripImages({
  imageEls: rewardStripImageEls,
  rewardIcons: REWARD_ICON_SEQUENCE,
});

// ---- State ----
let level = DIFFICULTY_LEVELS.BEGINNER;

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
let sentenceGameDifficulty = DIFFICULTY_LEVELS.BEGINNER;

const SENTENCE_GAME_ACTIVE_SECONDS_KEY = "sentenceGameActiveSeconds";
const SENTENCE_GAME_REWARD_LEVEL_KEY = "sentenceGameRewardLevel";
const SENTENCE_GAME_LAST_TICK_KEY = "sentenceGameLastTick";
const SENTENCE_GAME_DIFFICULTY_KEY = "sentenceGameDifficulty";

let sentencesElapsedSeconds = 0;
let sentencesUnlockedRewards = 0;
let sentencesTimerInterval = null;

const SENTENCES_REWARD_STEPS = [...QA_REWARD_STEPS];

const SENTENCE_GAME_CLIMB_STORAGE_KEY = "sentenceGameClimbLevel";

const APP_TIME_DAILY_TOTALS_KEY = STORAGE_KEYS.appTimeDailyTotals;
const APP_TIME_ACTIVE_SESSION_KEY = STORAGE_KEYS.appTimeActiveSession;
const FREE_DAILY_XP_LIMIT = 10;
let appSettings = getCoreState().settings;
const BACKGROUND_AUDIO_ENABLED = true;
function syncCoreStateReferences() {
  const coreState = getCoreState();
  progressState = coreState.progress;
  appSettings = coreState.settings;
  return coreState;
}

function renderCoreStateSnapshot() {
  syncCoreStateReferences();
  updateSoundToggleState();
  progressUi?.renderProfileSnapshot();
  progressUi?.renderStatsSnapshot();
}

function persistCoreAppState() {
  syncCoreStateReferences();
  saveCoreState();
}


let progressState = getCoreState().progress;
let statsSelectedPeriod = STATS_PERIODS.DAY;
let statsRewardTab = REWARD_TABS.DAYS;

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

// ---- Helpers ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSentenceGameEventId(kind = "progress") {
  const item = sentenceGameSentence();
  const sentenceKey = String(item?.id || item?.en || "").trim().toLowerCase();
  if (!sentenceKey) return "";
  return [
    "sentence-game",
    getCoreState().selectedWorldId || "world",
    sentenceGameDifficulty || DIFFICULTY_LEVELS.BEGINNER,
    kind,
    sentenceKey,
  ].join(":");
}

function lessonMnTranslation(value) {
  if (!value) return "";
  return LESSON_TRANSLATIONS.questionMnByEn[value]
    || LESSON_TRANSLATIONS.answerMnByEn[value]
    || "";
}

let appTimerManager = null;
let vaultManager = null;
let screenNavigator = null;
let progressUi = null;
const completionBanner = createCompletionBannerController({
  completionBannerEl,
  completionBannerTextEl,
  appSettings: () => appSettings,
  speakText: speakBannerText,
  playTone,
});

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

const audioEngine = createAudioEngine({
  getAppSettings: () => appSettings,
  isAudioInteractionUnlocked,
  getWorldAudioTrack,
  backgroundAudioEnabled: BACKGROUND_AUDIO_ENABLED,
});

const { worldSoundscape, gameFeelSoundManager } = createWorldSoundscape({
  audioEngine,
  getAppSettings: () => appSettings,
  playTone,
  playSuccessSound: () => playSuccessSound(),
  playErrorSound: () => playErrorSound(),
});

function updateCompanionLine(mode, tone = "idle") {
  updateCompanionLineUi(mode, tone, { lessonCompanionLineEl, sentencesCompanionLineEl });
}

function showWorldFeedbackChip(text, tone = "reward") {
  showWorldFeedbackChipUi(text, tone);
}

const showWorldFeedbackChipUi = (text, tone = "reward") => renderWorldFeedbackChip(worldFeedbackHubEl, text, tone);

const boardRuntime = createBoardRuntime({
  dom: appDom.board,
  appDom,
  getBoardEntryState,
  gameFeelSoundManager,
  persistActionRewards,
});

const {
  boardGameRollDice,
  initBoardGameMvp: initializeBoardGameRuntime,
  updateBoardGameTokenPosition,
  syncBoardGameDebugState,
} = boardRuntime;

function initBoardGameMvp() {
  boardGameBootstrapped = true;
  initializeBoardGameRuntime();
}

const vaultUiBridge = createVaultUiBridge({
  getVaultManager: () => vaultManager,
  filteredSentences,
  getSpeakingSentenceId: () => speakingSentenceId,
  lessonFlow,
  buildOptions,
  lessonMnTranslation,
  levelName,
  getLessonLevel: () => level,
  qaFlow,
  getSentenceGameSentence: () => sentenceGameSentence(),
  getSentenceGameDifficulty: () => sentenceGameDifficulty,
});

const {
  vaultKeyForScreen,
  updateVaultBadge,
  renderVaultModal,
  saveSentenceListItem,
  saveCurrentSentencesItem,
  saveCurrentLessonItem,
  saveCurrentQaRound,
  saveCurrentSentenceGameItem,
} = vaultUiBridge;

const sentenceGameRewardManager = createSentenceGameRewardManager({
  storageKeys: {
    activeSecondsKey: SENTENCE_GAME_ACTIVE_SECONDS_KEY,
    rewardLevelKey: SENTENCE_GAME_REWARD_LEVEL_KEY,
    lastTickKey: SENTENCE_GAME_LAST_TICK_KEY,
  },
  rewardThresholds: SENTENCE_GAME_REWARD_THRESHOLDS,
  rewardBanners: SENTENCE_GAME_REWARD_BANNERS,
  idleTimeoutSeconds: SENTENCE_GAME_IDLE_TIMEOUT_SECONDS,
  dom: {
    rewardBannerEl: sentenceGameRewardBannerEl,
    rewardImageEls: sentenceGameRewardImageEls,
  },
  state: {
    getActiveSeconds: () => sentenceGameActiveSeconds,
    setActiveSeconds: (value) => { sentenceGameActiveSeconds = value; },
    getRewardLevel: () => sentenceGameRewardLevel,
    setRewardLevel: (value) => { sentenceGameRewardLevel = value; },
    getLastActivityAt: () => sentenceGameLastActivityAt,
    setLastActivityAt: (value) => { sentenceGameLastActivityAt = value; },
    getLastTick: () => sentenceGameLastTick,
    setLastTick: (value) => { sentenceGameLastTick = value; },
  },
  actions: {
    loadProgressState,
    syncProgressForToday,
    applyProgressPatch,
    syncCoreStateReferences,
    persistProgressState,
    getProgressState: () => progressState,
    getTodayKey,
    updateHeaderStatus,
    updateStatsUI,
    isStatsVisible: () => !isHidden(statsScreen),
    isSentenceGameVisible: sentenceGameScreenVisible,
    isSoundEnabled: () => appSettings.soundEnabled,
    playTone,
  },
});

function sentenceGameRewardLevelFromSeconds(seconds = 0) {
  return sentenceGameRewardManager.getRewardLevelFromSeconds(seconds);
}

function persistSentenceGameRewardState() {
  sentenceGameRewardManager.persistState();
}

function loadSentenceGameRewardState() {
  sentenceGameRewardManager.loadState();
}

function reconcileRewardTierProgress() {
  return sentenceGameRewardManager.reconcileRewardTierProgress();
}

function renderSentenceGameRewardState() {
  sentenceGameRewardManager.renderRewardState();
}

function updateSentenceGameRewardLevel(options = {}) {
  sentenceGameRewardManager.updateRewardLevel(options);
}

function flushSentenceGameActiveTimeTick() {
  return sentenceGameRewardManager.flushActiveTimeTick();
}

function markSentenceGameActivity() {
  sentenceGameRewardManager.markActivity();
}

function beginSentenceGameSession() {
  sentenceGameRewardManager.beginSession();
}

function endSentenceGameSession() {
  sentenceGameRewardManager.endSession();
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
    eventId: String(eventId || "").trim(),
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
  const normalizedProgressEventId = String(progressEventId || "").trim();
  const normalizedRewardEventId = String(rewardEventId || normalizedProgressEventId).trim();

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
      eventId: normalizedProgressEventId,
    });
  }

  if (Number(coins) > 0 || Number(gems) > 0 || Number.isFinite(Number(rewardTierUnlocked))) {
    claimReward({
      coins,
      gems,
      rewardTierUnlocked,
      eventId: normalizedRewardEventId,
    });
  }

  syncCoreStateReferences();
  persistProgressState();
  renderCoreStateSnapshot();
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
  if (shouldOpen) {
    setStartIntroOpen(false);
  }
  setHomeModesPanelOpen(shouldOpen);
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
  lessonFlow.resetRuntimeState();
  stopLessonTimer();
  updateLessonTimerUI();
  renderLessonRewards();
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
  lessonFlow.getState().unlockedRewards = Math.max(lessonFlow.getState().unlockedRewards, REWARD_ICON_SEQUENCE.length);
  qaFlow.getState().qaUnlockedRewards = Math.max(qaFlow.getState().qaUnlockedRewards, REWARD_ICON_SEQUENCE.length);
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
  ].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (_error) {
      // ignore storage errors in private mode
    }
  });

  resetCoreState(createDefaultCoreState());
  syncCoreStateReferences();
  sentenceGameClimbLevel = 0;
  sentenceGameRewardLevel = 0;
  sentenceGameActiveSeconds = 0;
  sentenceGameLastTick = Date.now();
  lessonFlow.getState().unlockedRewards = 0;
  qaFlow.getState().qaUnlockedRewards = 0;
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
  const lessonState = lessonFlow.getState();
  levelLabel.textContent = levelName(level);
  scoreEl.textContent = lessonState.score;
  progressEl.textContent = `${lessonState.currentIndex + 1}/${lessonState.questions.length}`;
}

// ---- UI switch ----
function hideStartIntroPanel() {
  setStartIntroOpen(false);
}

function toggleStartIntroPanel() {
  if (!introPanel) return;
  const willOpen = isHidden(introPanel);
  if (willOpen) {
    setHomeModesPanelOpen(false);
  }
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

function ensureAudioUnlocked() {
  if (isAudioPrimed()) return;
  markAudioPrimed();

  const unlock = () => {
    unlockAudioInteraction();
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

  appDom.queries.getSentenceGamePeaks().forEach((peakEl) => {
    const peak = Number(peakEl.dataset.peak || 0);
    peakEl.classList.toggle("active", peak > 0 && peak <= level);
    peakEl.classList.remove("pulse");
  });

  if (options.pulsePeak && level > 0) {
    const reachedPeak = appDom.queries.getSentenceGamePeak(level);
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

function sentenceGameScreenVisible() {
  return sentenceGameScreen && !isHidden(sentenceGameScreen);
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
    const allSentenceItems = prepareSentenceItems(await response.json());
    const chapterContent = getActiveLearningSelection();
    const sentenceBank = resolveSentenceContentBank({
      bankId: chapterContent.sentenceBankId,
      worldId: chapterContent.worldId,
      difficulty: level,
    });
    const requestedSentenceBankId = sentenceBank?.id || chapterContent.sentenceBankId;
    sentenceItems = filterSentenceItemsForBank(allSentenceItems, requestedSentenceBankId);
    if (requestedSentenceBankId && !allSentenceItems.some((item) => item.bankId === requestedSentenceBankId)) {
      showWorldFeedbackChip("⚠️ Энэ бүлгийн sentence bank одоохондоо хоосон байна.", "warning");
    }
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
      awardXP(10, "sentence_game_success", buildSentenceGameEventId("success"));
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
      awardXP(3, "hint_used", buildSentenceGameEventId("hint"));
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

let hasExplicitStartLevelSelection = false;


function renderSentencesRewards() {
  renderSentencesRewardStrip({
    containerEl: sentencesRewardStripEl,
    rewards: SENTENCES_REWARD_STEPS,
    unlockedRewards: sentencesUnlockedRewards,
  });
}

function renderQaRewards() {
  renderLinearRewardBar({
    rewardBarEl: qaRewardBarEl,
    rewardImageEls: qaRewardImageEls,
    unlockedRewards: qaFlow.getState().qaUnlockedRewards,
    totalSteps: QA_REWARD_STEPS.length,
  });
}

function renderLessonRewards() {
  renderLinearRewardBar({
    rewardBarEl: lessonRewardBarEl,
    rewardImageEls: lessonRewardImageEls,
    unlockedRewards: lessonFlow.getState().unlockedRewards,
    totalSteps: QA_REWARD_STEPS.length,
  });
}

const updateSentencesTimerRewards = createTimedRewardTrack({
  getElapsedSeconds: () => sentencesElapsedSeconds,
  getUnlockedRewards: () => sentencesUnlockedRewards,
  setUnlockedRewards: (value) => { sentencesUnlockedRewards = value; },
  rewardSteps: SENTENCES_REWARD_STEPS,
  render: renderSentencesRewards,
  onUnlock: (count) => {
    updateCompanionLine("sentences", "reward");
    showWorldFeedbackChip(`🎁 ${count}-р шагнал нээгдлээ!`, "reward");
    worldSoundscape.play("reward");
  },
});

const updateLessonTimerRewards = createTimedRewardTrack({
  getElapsedSeconds: () => lessonFlow.getState().elapsedSeconds,
  getUnlockedRewards: () => lessonFlow.getState().unlockedRewards,
  setUnlockedRewards: (value) => { lessonFlow.getState().unlockedRewards = value; },
  rewardSteps: QA_REWARD_STEPS,
  render: renderLessonRewards,
});

const updateQaTimerRewards = createTimedRewardTrack({
  getElapsedSeconds: () => qaFlow.getState().qaElapsedSeconds,
  getUnlockedRewards: () => qaFlow.getState().qaUnlockedRewards,
  setUnlockedRewards: (value) => { qaFlow.getState().qaUnlockedRewards = value; },
  rewardSteps: QA_REWARD_STEPS,
  render: renderQaRewards,
  onUnlock: (_count, step) => {
    qaFlow.showQaToast(`Шагнал авлаа: ${step.label}`);
  },
});

function updateStartButtonLabel() {
  renderStartButtonLabel(startLevelLabel(level));
  renderHomeScreen({
    levelLabel: startLevelLabel(level),
    homeFlowHint: `Одоогийн түвшин: ${startLevelLabel(level)} — эхлээд хичээлээ эхлүүлээд, дараа нь ахиц ба шагналаа хараарай.`,
  });
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

function updateSentencesTimerUI() {
  updateSentencesTimerRewards();
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

function getActiveLearningSelection() {
  const core = getCoreState();
  const boardEntry = getBoardEntryState();
  const worldId = core.selectedWorldId;
  const difficultyId = level || core.selectedDifficultyId || DIFFICULTY_LEVELS.BEGINNER;
  const chapterId = boardEntry?.worldId === worldId
    ? (boardEntry.chapterId || getDefaultChapterForWorld(worldId)?.id || null)
    : (getDefaultChapterForWorld(worldId)?.id || null);

  return resolveChapterContent({ worldId, chapterId, difficultyId });
}

function updateLessonTimerUI() {
  updateLessonTimerRewards();
}

function updateQaTimerUI() {
  updateQaTimerRewards();
}

const lessonTimer = createSessionElapsedTimer({
  getElapsedSeconds: () => lessonFlow.getState().elapsedSeconds,
  setElapsedSeconds: (value) => { lessonFlow.getState().elapsedSeconds = value; },
  getStartedAt: () => lessonFlow.getState().timerStartedAt,
  setStartedAt: (value) => { lessonFlow.getState().timerStartedAt = value; },
  onTick: updateLessonTimerUI,
});

function stopLessonTimer() {
  lessonTimer.stop();
}

function startLessonTimer() {
  lessonTimer.start();
}

const qaTimer = createSessionElapsedTimer({
  getElapsedSeconds: () => qaFlow.getState().qaElapsedSeconds,
  setElapsedSeconds: (value) => { qaFlow.getState().qaElapsedSeconds = value; },
  getStartedAt: () => qaFlow.getState().qaTimerStartedAt,
  setStartedAt: (value) => { qaFlow.getState().qaTimerStartedAt = value; },
  onTick: updateQaTimerUI,
});

function stopQaTimer() {
  qaTimer.stop();
}

function startQaTimer() {
  qaTimer.start();
}

const lessonFlow = createLessonFlow({
  state: {
    level,
  },
  dom: {
    finalTextEl,
    lessonFinishTitleEl,
    lessonFinishCopyEl,
    lessonFlowCopyEl,
    lessonRewardCopyEl,
  },
  actions: {
    getActiveLearningSelection,
    shuffle,
    loadProgressState,
    syncProgressForToday,
    persistProgressState,
    stopSpeaking,
    showLessonScreen: () => showScreen(quizScreen),
    showEndScreen: () => showScreen(endScreen),
    awardXp: awardXP,
    getLessonRewardEventId: ({ coreState, level, currentIndex, question }) => `lesson:${coreState.selectedWorldId}:${level}:${currentIndex}:${question}`,
    playSuccessSound,
    playErrorSound,
    playRewardSoundscape: () => worldSoundscape.play("reward"),
    playSoftFailSoundscape: () => worldSoundscape.play("soft-fail"),
    updateCompanionLine,
    showWorldFeedbackChip,
    updateTopbar,
    updateHeaderStatus,
    loadProgressAfterCompletion: loadProgressState,
    showCompletionBanner: () => completionBanner.show(progressState.dailyCompleted),
  },
  helpers: {
    getCoreState,
  },
});

const qaFlow = createQaFlow({
  state: {},
  dom: {
    qaToastEl,
    qaLevelSelectBtn,
    qaLevelOptionsEl,
    qaRoundPanelEl,
    qaFeedbackEl,
    qaMnQuestionEl,
    qaMnAnswerEl,
    qaEnQuestionEl,
    qaEnAnswerEl,
    qaEnQuestionWrap,
    qaEnAnswerWrap,
    qaToggleQuestionBtn,
    qaToggleAnswerBtn,
    qaQuestionLineEl,
    qaAnswerLineEl,
    qaWordBankEl,
    qaModalEl,
    qaModalTitleEl,
    qaModalBodyEl,
  },
  actions: {
    getActiveLearningSelection,
    startQaTimer,
    stopQaTimer,
    updateQaTimerUi: updateQaTimerUI,
    renderQaRewards,
    showWorldFeedbackChip,
  },
});

const handleStartLevelSelection = createStartLevelSelectionHandler({
  startLevelOptions,
  syncToggleButtons,
  setLevel: (value) => {
    level = value;
    lessonFlow.setLevel(value);
  },
  markExplicitSelection: (value) => { hasExplicitStartLevelSelection = value; },
  updateStartButtonLabel,
  setStartLevelMenuOpen,
  updateHeaderStatus,
  startQuiz: () => lessonFlow.startQuiz(),
});

const initializeSentenceGameControls = createSentenceGameControls({
  dom: {
    tipTextEl: sentenceGameTipTextEl,
    tipToggleBtn: sentenceGameTipToggleBtn,
    tipSpeakBtn: sentenceGameTipSpeakBtn,
    tipStopBtn: sentenceGameTipStopBtn,
    tipReadBtn: sentenceGameTipReadBtn,
    tipCloseBtn: sentenceGameTipCloseBtn,
    difficultyToggleBtn: sentenceGameDifficultyToggleBtn,
    difficultyPanelEl: sentenceGameDifficultyPanelEl,
    difficultyButtons: sentenceGameDifficultyButtons,
    undoBtn: sentenceGameUndoBtn,
    showCorrectBtn: sentenceGameShowCorrectBtn,
    retryBtn: sentenceGameRetryBtn,
    prevBtn: sentenceGamePrevBtn,
    nextBtn: sentenceGameNextBtn,
  },
  helpers: {
    tipText: SENTENCE_GAME_TIP_TEXT,
    toggleTipPanel: toggleSentenceGameTipPanel,
    speakTip: speakSentenceGameTip,
    stopTipSpeech: stopSentenceGameTipSpeech,
    showTipText: showSentenceGameTipText,
    closeTipPanel: closeSentenceGameTipPanel,
    setDifficultyPanelOpen: setSentenceGameDifficultyPanelOpen,
    selectDifficulty: selectSentenceGameDifficulty,
    updateTipControls: updateSentenceGameTipControls,
    undoMove: undoSentenceGameMove,
    showCorrectAnswer: showSentenceGameCorrectAnswer,
    retryRound: retrySentenceGameRound,
    prevRound: prevSentenceGameRound,
    nextRound: nextSentenceGameRound,
  },
});

const initializeQaControls = createQaControls({
  dom: {
    levelSelectBtn: qaLevelSelectBtn,
    levelOptionsEl: qaLevelOptionsEl,
    levelButtons: qaLevelButtons,
    checkBtn: qaCheckBtn,
    toggleQuestionBtn: qaToggleQuestionBtn,
    toggleAnswerBtn: qaToggleAnswerBtn,
    enQuestionWrap: qaEnQuestionWrap,
    enAnswerWrap: qaEnAnswerWrap,
    showSentencesBtn: qaShowSentencesBtn,
    showHelpBtn: qaShowHelpBtn,
    modalEl: qaModalEl,
    modalCloseBtn: qaModalCloseBtn,
  },
  actions: {
    resetScreen: qaFlow.resetQaGameScreen,
    selectLevel: qaFlow.selectQaLevel,
    checkAnswer: qaFlow.checkQaAnswer,
    openSentencesModal: qaFlow.openSentencesModal,
    openHelpModal: qaFlow.openHelpModal,
    closeModal: qaFlow.closeQaModal,
  },
});

const initializeSentenceFilterControls = createSentenceFilterControls({
  dom: {
    pickerEl: sentencesLevelPickerEl,
    pickerBtn: sentencesLevelPickerBtn,
    optionsEl: sentencesLevelOptionsEl,
    optionButtons: sentencesLevelOptionButtons,
  },
  state: {
    getFilter: () => sentenceFilter,
    setFilter: (value) => { sentenceFilter = value; },
  },
  actions: {
    stopSpeaking,
    renderSentences,
    updateHeaderStatus,
  },
  bindManagedEvent,
});

const initializeAudioControls = createAudioControls({
  dom: {
    voiceOptionButtons,
    ttsRateSlider,
    soundToggleButtons,
  },
  appState: {
    getSettings: () => appSettings,
  },
  actions: {
    updateVoice: (voice) => {
      appSettings.ttsSettings.voice = voice;
    },
    updateRate: (value) => {
      appSettings.ttsSettings.rate = Math.round(value * 20) / 20;
    },
    persistTtsSettings,
    updateTtsControlState,
    toggleSound: () => {
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
    },
  },
  bindManagedEvent,
});

const { initializeApp } = createAppBootstrap({
  createProgressUi,
  createAppTimerManager,
  createVaultManager,
  createScreenNavigator,
  setProgressUi: (value) => { progressUi = value; },
  setAppTimerManager: (value) => { appTimerManager = value; },
  setVaultManager: (value) => { vaultManager = value; },
  setScreenNavigator: (value) => { screenNavigator = value; },
  getScreenNavigator: () => screenNavigator,
  getProgressState: () => progressState,
  getProfileName: () => appSettings.profileName,
  isPremium: () => appSettings.premium,
  getAppTimeDailyTotals,
  getLocalDateKey,
  formatHHMMSS,
  refreshTimeSummaryUI,
  getStatsSelectedPeriod: () => statsSelectedPeriod,
  getStatsRewardTab: () => statsRewardTab,
  profileDom: {
    profileNameInput,
    profileNameSaved,
    profileTotalXpEl,
    profileLevelEl,
    profileStreakDaysEl,
    profileDailyProgressEl,
    profileRewardStageEl,
    profilePlanStatusEl,
    statsTotalXpEl,
    statsLevelEl,
    statsStreakEl,
    statsTodayProgressEl,
    statsKpiLabelEl,
    statsKpiValueEl,
    statsKpiNormEl,
    statsKpiPercentEl,
    statsThermometerFillEl,
    statsThermometerMarkerEl,
    statsThermometerTierEl,
    statsRewardCardsEl,
  },
  appTimer: {
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
    replaceProgress,
    updateStreak,
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
      buildLast7DaysTimeRows: () => progressUi?.buildLast7DaysTimeRows() || "",
      updateGaugeUI: (...args) => progressUi?.updateGaugeUI(...args),
      renderRewardsTab: () => progressUi?.renderRewardsTab(),
      renderStatsSnapshot: () => progressUi?.renderStatsSnapshot(),
      renderProfileSnapshot: () => progressUi?.renderProfileSnapshot(),
    },
  },
  vault: {
    badgeElsByScreen: { lesson: lessonVaultBadge, qna: qaVaultBadge, sentenceGame: sentenceGameVaultBadge, sentences: sentencesVaultBadge },
    modal: {
      modalEl: vaultModalEl,
      titleEl: vaultModalTitleEl,
      bodyEl: vaultModalBodyEl,
      replayBtn: vaultReplayBtn,
      deleteBtn: vaultDeleteBtn,
      learnedBtn: vaultLearnedBtn,
    },
    vaultModalCloseBtn,
    lessonSaveBtn,
    sentencesSaveBtn,
    qaSaveBtn,
    sentenceGameSaveBtn,
    lessonVaultBtn,
    sentencesVaultBtn,
    qaVaultBtn,
    sentenceGameVaultBtn,
    showVaultToast,
    lessonMnTranslation,
    sentencesListEl,
    appSettings: () => appSettings,
    sentenceItems: () => sentenceItems,
    speakingSentenceId: () => speakingSentenceId,
    speakSentence,
    sentenceGame: {
      setHistory: (history) => { sentenceGameHistory = history; },
      setIndex: (index) => { sentenceGameIndex = index; },
      initRound: initSentenceGameRound,
      enforceFreeXpGate,
      renderSentences,
    },
    qa: {
      openModal: qaFlow.openQaModal,
      loadRound: (round) => {
        qaFlow.loadRound(round);
      },
    },
    lesson: {
      startFromSaved: (savedItem) => {
        lessonFlow.startReview(savedItem);
      },
    },
    markWordLearned,
    showScreen,
    screens: {
      sentences: SCREEN_NAMES.SENTENCES,
      sentenceGame: SCREEN_NAMES.SENTENCE_GAME,
      qaGame: SCREEN_NAMES.QA_GAME,
    },
  },
  screens: SCREENS,
  screenIds: SCREEN_IDS,
  screenRegistry: SCREEN_REGISTRY,
  getActiveScreenId: () => activeScreenId,
  setActiveScreenId: (screenId) => { activeScreenId = screenId; },
  setStateValue,
  setAppMode,
  navigationState: {
    topbar,
    startScreen,
    quizScreen,
    sentencesScreen,
    sentenceGameScreen,
    qaGameScreen,
    profileScreen,
    destinations: FLOW_DESTINATIONS,
    hasQaGameLevel: () => Boolean(qaFlow.getState().qaGameLevel),
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
  startQuiz: () => lessonFlow.startQuiz(),
  ensureSentenceItemsLoaded,
  initSentenceGameRound,
  enforceFreeXpGate,
  resetQaGameScreen: () => qaFlow.resetQaGameScreen(),
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
  subscribeState,
  renderCoreStateSnapshot,
  loadCoreState,
  syncCoreStateReferences,
  syncProgressForToday,
  persistProgressState,
  updateTtsControlState,
  updateSoundToggleState,
  ensureAudioUnlocked,
  loadSentenceGameClimbLevel,
  renderSentenceGameClimb,
  getSentenceGameClimbLevel: () => sentenceGameClimbLevel,
  loadSentenceGameRewardState,
  updateSentenceGameRewardLevel,
  reconcileRewardTierProgress,
  persistSentenceGameRewardState,
  loadSentenceGameDifficulty,
  syncBoardEntryFlowState,
  initDebugTools,
  getDebugChapterOptions: () => SCREEN_REGISTRY[SCREEN_NAMES.CHAPTER_COVER]?.getAvailableDebugChapters(debugUnlockedChapterIds) || [],
  requestNavigation,
  previewChapterCover,
  jumpToBoardChapter,
  unlockAllDebugChapters,
  giveDebugXp,
  giveDebugRewards,
  resetDebugProgress,
  renderSentencesRewards,
  updateSentencesTimerUI,
  renderLessonRewards,
  updateLessonTimerUI,
  sentenceGameControls: initializeSentenceGameControls,
  bindClickOnce,
  bindModalDismissal,
  updateVaultBadge,
  vaultKeyForScreen,
  renderVaultModal,
  saveCurrentLessonItem,
  saveCurrentSentencesItem,
  saveCurrentQaRound,
  saveCurrentSentenceGameItem,
  screenNames: SCREEN_NAMES,
  qaControls: initializeQaControls,
  sentenceFilterControls: initializeSentenceFilterControls,
  audioControls: initializeAudioControls,
  playExitControls: createPlayExitControls({
    playExitButtons,
    bindClickOnce,
    onExit: () => {
      gameFeelSoundManager.stopAmbient();
      worldSoundscape.stop();
      exitPlayModeToHome();
    },
  }),
  homeScreen: initHomeScreen,
  chapterCoverScreen: initChapterCoverScreen,
  boardScreen: initBoardScreen,
  lessonScreen: initLessonScreen,
  statsScreen: initStatsScreen,
  homeHandlers: createHomeHandlers({
    requestNavigation,
    toggleHomeModesPanel,
    closeHomeModesPanel,
    toggleStartIntroPanel,
    hideStartIntroPanel,
    setStartLevelMenuOpen,
    handleStartLevelSelection,
    destinations: FLOW_DESTINATIONS,
  }),
  chapterCoverHandlers: createChapterCoverHandlers({
    getSelectionState: () => getBoardEntryState(),
    syncBoardEntryFlowState,
    getDefaultChapterForWorld,
    resolveBoardSelectionRoute,
    navigateTo,
    boardSelectorSteps: BOARD_SELECTOR_STEPS,
    boardPlayDestination: FLOW_DESTINATIONS.BOARD_PLAY,
  }),
  boardHandlers: createBoardHandlers({
    boardGameRollDice,
    updateBoardGameTokenPosition,
    initBoardGameMvp,
    isBoardGameBootstrapped: () => boardGameBootstrapped,
  }),
  lessonHandlers: createLessonHandlers({
    lessonFlow,
    navigateTo,
    statsDestination: FLOW_DESTINATIONS.STATS,
    exitPlayModeToHome,
    setStartLevelMenuOpen,
    handleStartLevelSelection,
  }),
  statsHandlers: createStatsHandlers({
    syncToggleButtons,
    setActiveState,
    setSelectedState,
    refreshTimeSummaryUI,
    progressUi: () => progressUi,
    setStatsSelectedPeriod: (value) => { statsSelectedPeriod = value; },
    setStatsRewardTab: (value) => { statsRewardTab = value; },
    statsPeriods: STATS_PERIODS,
    rewardTabs: REWARD_TABS,
    statsPeriodButtons,
    statsRewardTabButtons,
  }),
  bindManagedEvent,
  persistAllActiveTime,
  ensureStoppedIfHidden,
  stopTimeUiUpdater,
  audioEngine,
  speechControls: createSpeechControls({
    bindManagedEvent,
    loadVoices,
    profileNameInput,
    updateSettings,
    persistCoreAppState,
    updateProfileUI,
  }),
  premiumControls: createPremiumControls({
    bindClickOnce,
    bindModalDismissal,
    upgradePremiumBtn,
    openPremiumModal,
    premiumOverlay,
    premiumOkBtn,
    closePremiumModal,
  }),
  installPrompt: {
    installHintEl,
    installBtn,
    setVisibility: (isVisible) => {
      if (isVisible) showElement(installHintEl);
      else hideElement(installHintEl);
    },
  },
  hasClickBinding,
  primaryButtonAudit: () => {
    const buttonAudit = [
      { name: "home modes", element: navModesBtn, key: "home:toggle-modes" },
      { name: "home lesson", element: appDom.audit.primaryButtons.homeLesson, key: "home:navigate-lesson" },
      { name: "home sentences", element: appDom.audit.primaryButtons.homeSentences, key: "home:navigate-sentences" },
      { name: "home sentence game", element: appDom.audit.primaryButtons.homeSentenceGame, key: "home:navigate-sentence-game" },
      { name: "home q&a", element: appDom.audit.primaryButtons.homeQaGame, key: "home:navigate-qa-game" },
      { name: "home board game", element: appDom.audit.primaryButtons.homeBoardGame, key: "home:navigate-board-game" },
      { name: "home stats", element: appDom.audit.primaryButtons.homeStats, key: "home:navigate-stats" },
      { name: "home profile", element: appDom.audit.primaryButtons.homeProfile, key: "home:navigate-profile" },
      { name: "lesson start level", element: startBtn, key: "lesson:start-level-menu-toggle" },
      { name: "board continue", element: appDom.audit.primaryButtons.boardContinue, key: "board-entry:continue" },
      { name: "board roll", element: boardGameRollBtn, key: "board:roll-button" },
      { name: "lesson next", element: appDom.audit.lessonNextBtn, key: "lesson:next" },
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
    return buttonAudit;
  },
  setInitialHomeUi: createInitialHomeUiSetter({
    setStartLevelMenuOpen,
    updateStartButtonLabel,
    setAppMode,
    homeMode: GAME_MODES.HOME,
    syncToggleButtons,
    startLevelOptions,
    getLevel: () => level,
  }),
});

export { initializeApp };
