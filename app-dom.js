function byId(id) {
  return document.getElementById(id);
}

function query(selector) {
  return document.querySelector(selector);
}

function queryAll(selector) {
  return document.querySelectorAll(selector);
}

const screens = {
  startScreen: byId("start-screen"),
  quizScreen: byId("quiz-screen"),
  sentencesScreen: byId("sentences-screen"),
  statsScreen: byId("stats-screen"),
  sentenceGameScreen: byId("sentence-game-screen"),
  qaGameScreen: byId("qa-game-screen"),
  boardGameIntroScreen: byId("board-game-intro-screen"),
  boardGameScreen: byId("board-game-screen"),
  profileScreen: byId("profile-screen"),
  endScreen: byId("end-screen"),
};

const lesson = {
  topbar: byId("topbar"),
  levelLabel: byId("level-label"),
  scoreEl: byId("score"),
  progressEl: byId("progress"),
  questionEl: byId("question"),
  optionsEl: byId("options"),
  resultEl: byId("result"),
  startBtn: byId("start-btn"),
  introToggleBtn: byId("intro-toggle-btn"),
  introPanel: byId("intro-panel"),
  finalTextEl: byId("final-text"),
  lessonFlowCopyEl: byId("lesson-flow-copy"),
  lessonRewardCopyEl: byId("lesson-reward-copy"),
  lessonFinishTitleEl: byId("lesson-finish-title"),
  lessonFinishCopyEl: byId("lesson-finish-copy"),
  startLevelDropdown: byId("start-level-dropdown"),
  startLevelOptions: queryAll(".start-level-option"),
  lessonRewardBarEl: byId("lesson-reward-bar"),
  lessonVaultBtn: byId("lesson-vault-btn"),
  lessonVaultBadge: byId("lesson-vault-badge"),
  lessonSaveBtn: byId("lesson-save-btn"),
};

const home = {
  navModesBtn: byId("nav-modes-btn"),
  homeModesPanel: byId("home-modes-panel"),
  navLessonBtn: byId("nav-lesson-btn"),
  navSentencesBtn: byId("nav-sentences-btn"),
  navSentenceGameBtn: byId("nav-sentence-game-btn"),
  navQaGameBtn: byId("nav-qa-game-btn"),
  navBoardGameBtn: byId("nav-board-game-btn"),
  navStatsBtn: byId("nav-stats-btn"),
  navProfileBtn: byId("nav-profile-btn"),
};

const sentences = {
  levelPickerEl: byId("sentences-level-picker"),
  levelPickerBtn: byId("sentences-level-picker-btn"),
  levelOptionsEl: byId("sentences-level-options"),
  levelOptionButtons: queryAll(".sentences-level-option"),
  sentencesListEl: byId("sentences-list"),
  rewardStripEl: byId("sentences-reward-strip"),
  vaultBtn: byId("sentences-vault-btn"),
  vaultBadge: byId("sentences-vault-badge"),
  saveBtn: byId("sentences-save-btn"),
};

const sentenceGame = {
  dropzoneEl: byId("sentence-game-dropzone"),
  poolEl: byId("sentence-game-pool"),
  undoBtn: byId("sentence-game-undo-btn"),
  showCorrectBtn: byId("sentence-game-show-correct-btn"),
  retryBtn: byId("sentence-game-retry-btn"),
  prevBtn: byId("sentence-game-prev-btn"),
  nextBtn: byId("sentence-game-next-btn"),
  feedbackEl: byId("sentence-game-feedback"),
  toastEl: byId("sentence-game-toast"),
  correctPanelEl: byId("sentence-game-correct-panel"),
  correctEnEl: byId("sentence-game-correct-en"),
  correctMnEl: byId("sentence-game-correct-mn"),
  tipToggleBtn: byId("sentence-game-tip-toggle-btn"),
  tipPanelEl: byId("sentence-game-tip-panel"),
  tipTextEl: byId("sentence-game-tip-text"),
  tipSpeakBtn: byId("sentence-game-tip-speak-btn"),
  tipStopBtn: byId("sentence-game-tip-stop-btn"),
  tipReadBtn: byId("sentence-game-tip-read-btn"),
  tipCloseRowEl: byId("sentence-game-tip-close-row"),
  tipCloseBtn: byId("sentence-game-tip-close-btn"),
  climbEl: byId("sentence-game-climb"),
  climberEl: byId("sentence-game-climber"),
  rewardIconEl: byId("sentence-game-reward-icon"),
  rewardBannerEl: byId("sentence-game-reward-banner"),
  rewardRowEl: byId("sentence-game-reward-row"),
  rewardImageEls: byId("sentence-game-reward-row")?.querySelectorAll(".reward-img") || [],
  difficultyToggleBtn: byId("sentence-game-difficulty-toggle-btn"),
  difficultyPanelEl: byId("sentence-game-difficulty-panel"),
  difficultyButtons: queryAll(".sentence-game-difficulty-btn"),
  vaultBtn: byId("sentence-game-vault-btn"),
  vaultBadge: byId("sentence-game-vault-badge"),
  saveBtn: byId("sentence-game-save-btn"),
};

const qa = {
  toastEl: byId("qa-toast"),
  levelSelectBtn: byId("qa-level-select-btn"),
  levelOptionsEl: byId("qa-level-options"),
  levelButtons: queryAll("[data-qa-level]"),
  roundPanelEl: byId("qa-round-panel"),
  toggleQuestionBtn: byId("qa-toggle-question-btn"),
  toggleAnswerBtn: byId("qa-toggle-answer-btn"),
  mnQuestionEl: byId("qa-mn-question"),
  mnAnswerEl: byId("qa-mn-answer"),
  enQuestionWrap: byId("qa-en-question-wrap"),
  enAnswerWrap: byId("qa-en-answer-wrap"),
  enQuestionEl: byId("qa-en-question"),
  enAnswerEl: byId("qa-en-answer"),
  questionLineEl: byId("qa-question-line"),
  answerLineEl: byId("qa-answer-line"),
  wordBankEl: byId("qa-word-bank"),
  checkBtn: byId("qa-check-btn"),
  feedbackEl: byId("qa-feedback"),
  showSentencesBtn: byId("qa-show-sentences-btn"),
  showHelpBtn: byId("qa-show-help-btn"),
  modalEl: byId("qa-modal"),
  modalTitleEl: byId("qa-modal-title"),
  modalBodyEl: byId("qa-modal-body"),
  modalCloseBtn: byId("qa-modal-close-btn"),
  vaultBtn: byId("qa-vault-btn"),
  vaultBadge: byId("qa-vault-badge"),
  saveBtn: byId("qa-save-btn"),
};

// TODO(source-map): Promote these per-screen status selectors into a shared status-bar config when lesson/sentences/sentence-game/QA converge on one renderer.
const gameStatus = {
  sentencesLevelEl: byId("sentences-status-level"),
  sentencesScoreEl: byId("sentences-status-score"),
  sentencesProgressEl: byId("sentences-status-progress"),
  sentenceGameLevelEl: byId("sentence-game-status-level"),
  sentenceGameScoreEl: byId("sentence-game-status-score"),
  sentenceGameProgressEl: byId("sentence-game-status-progress"),
  qaLevelEl: byId("qa-status-level"),
  qaScoreEl: byId("qa-status-score"),
  qaProgressEl: byId("qa-status-progress"),
};

const profile = {
  premiumOverlay: byId("premium-overlay"),
  premiumTitleEl: byId("premium-title"),
  premiumMessageEl: byId("premium-message"),
  premiumOkBtn: byId("premium-ok-btn"),
  upgradePremiumBtn: byId("upgrade-premium-btn"),
  profileNameInput: byId("profile-name-input"),
  profileNameSaved: byId("profile-name-saved"),
  profileTotalXpEl: byId("profile-total-xp"),
  profileLevelEl: byId("profile-level"),
  profileStreakDaysEl: byId("profile-streak-days"),
  profileDailyProgressEl: byId("profile-daily-progress"),
  profileRewardStageEl: byId("profile-reward-stage"),
  profilePlanStatusEl: byId("profile-plan-status"),
  authStatusEl: byId("auth-status-text"),
  authProviderEl: byId("auth-provider-text"),
  authUserEmailEl: byId("auth-user-email"),
  authErrorEl: byId("auth-error-text"),
  authGuestHintEl: byId("auth-guest-hint"),
  authLoginFormEl: byId("auth-login-form"),
  authSignupFormEl: byId("auth-signup-form"),
  authLogoutBtn: byId("auth-logout-btn"),
};

const stats = {
  statsTotalXpEl: byId("stats-total-xp"),
  statsLevelEl: byId("stats-level"),
  statsStreakEl: byId("stats-streak"),
  statsTodayProgressEl: byId("stats-today-progress"),
  statsTodayMinutesEl: byId("stats-today-minutes"),
  statsThisWeekTimeEl: byId("stats-this-week-time"),
  statsLastWeekTimeEl: byId("stats-last-week-time"),
  statsThisMonthTimeEl: byId("stats-this-month-time"),
  statsLast7DaysEl: byId("stats-last-7-days"),
  statsPeriodButtons: queryAll(".stats-period-btn"),
  statsKpiLabelEl: byId("stats-kpi-label"),
  statsKpiValueEl: byId("stats-kpi-value"),
  statsKpiNormEl: byId("stats-kpi-norm"),
  statsKpiPercentEl: byId("stats-kpi-percent"),
  statsThermometerFillEl: byId("stats-thermometer-fill"),
  statsThermometerMarkerEl: byId("stats-thermometer-marker"),
  statsThermometerTierEl: byId("stats-thermometer-tier"),
  statsRewardTabButtons: queryAll(".stats-reward-tab"),
  statsRewardCardsEl: byId("stats-reward-cards"),
  todayTimeEls: queryAll("[id^='today-time-']"),
  timeDetailsYesterdayEl: byId("time-details-yesterday"),
  timeDetailsThisWeekEl: byId("time-details-this-week"),
  timeDetailsLastWeekEl: byId("time-details-last-week"),
  timeDetailsThisMonthEl: byId("time-details-this-month"),
  timeDetailsLastMonthEl: byId("time-details-last-month"),
};

const board = {
  boardEl: byId("board-game-board"),
  tokenEl: byId("board-game-token"),
  rollBtn: byId("board-game-roll-btn") || byId("board-game-dice"),
  positionEl: byId("board-game-position"),
  totalTilesEl: byId("board-game-total-tiles"),
  lastRollEl: byId("board-game-last-roll"),
  chapterTitleEl: byId("board-game-chapter-title"),
  chapterTextEl: byId("board-game-chapter-text"),
  challengeTitleEl: byId("board-game-challenge-title"),
  challengeTextEl: byId("board-game-challenge-text"),
  screenTitleEl: byId("board-game-screen-title"),
  difficultyEl: byId("board-game-difficulty-label"),
  feedbackEl: byId("board-game-feedback"),
  optionsEl: byId("board-game-options"),
  diceEl: byId("board-game-dice"),
  xpEl: byId("board-game-xp"),
  coinsEl: byId("board-game-coins"),
  chapterIndexEl: byId("board-game-chapter-index"),
  feedbackHubEl: byId("board-game-feedback-hub"),
  particlesEl: byId("board-game-particles"),
  getStoryPanelEl: () => query(".board-game-story-panel"),
  getChallengePanelEl: () => query(".board-game-challenge-panel"),
  getContinueBtn: () => byId("board-game-intro-continue-btn"),
};

const appChrome = {
  completionBannerEl: byId("completion-banner"),
  completionBannerTextEl: byId("completion-banner")?.querySelector(".banner-text") || null,
  installHintEl: byId("install-hint"),
  installBtn: byId("install-btn"),
  worldFeedbackHubEl: byId("world-feedback-hub"),
  voiceOptionButtons: queryAll(".tts-option-btn[data-voice]"),
  ttsRateSlider: byId("tts-rate-slider"),
  ttsRateValueEl: byId("tts-rate-value"),
  soundToggleButtons: queryAll(".sound-toggle-btn"),
  playExitButtons: queryAll(".play-exit-btn, .game-exit-btn"),
};

const vault = {
  modalEl: byId("vault-modal"),
  titleEl: byId("vault-modal-title"),
  bodyEl: byId("vault-modal-body"),
  closeBtn: byId("vault-modal-close-btn"),
  replayBtn: byId("vault-replay-btn"),
  deleteBtn: byId("vault-delete-btn"),
  learnedBtn: byId("vault-learned-btn"),
};

// TODO(source-map): Reward DOM ownership is split across static strips and screen-specific runtimes; centralize via render-rewards mode config before refactoring markup.
const rewards = {
  levelImageEls: queryAll(".reward-img[data-level]"),
  sentenceGameRewardImageEls: queryAll("#sentence-game-reward-row .reward-img"),
  qaRewardImageEls: () => qa.rewardBarEl?.querySelectorAll(".reward-img") || [],
  lessonRewardImageEls: () => lesson.lessonRewardBarEl?.querySelectorAll(".reward-img") || [],
};

export function getAppDom() {
  return {
    screens,
    lesson,
    home,
    sentences,
    sentenceGame,
    qa,
    gameStatus,
    profile,
    stats,
    board,
    appChrome,
    vault,
    rewards,
    queries: {
      getSentenceGamePeaks: () => queryAll(".sentence-game-peak"),
      getSentenceGamePeak: (level) => query(`.sentence-game-peak[data-peak="${level}"]`),
    },
    audit: {
      primaryButtons: {
        homeModes: home.navModesBtn,
        homeLesson: home.navLessonBtn,
        homeSentences: home.navSentencesBtn,
        homeSentenceGame: home.navSentenceGameBtn,
        homeQaGame: home.navQaGameBtn,
        homeBoardGame: home.navBoardGameBtn,
        homeStats: home.navStatsBtn,
        homeProfile: home.navProfileBtn,
        lessonStartLevel: lesson.startBtn,
        boardContinue: board.getContinueBtn(),
      },
      lessonNextBtn: byId("next-btn"),
    },
  };
}
