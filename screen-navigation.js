import { GAME_MODES, SCREEN_NAMES } from "./constants.js";
import { hideElement, showElement } from "./ui.js";

export function createScreenNavigator({
  screens = {},
  screenIds = {},
  screenRegistry = {},
  getActiveScreenId = () => null,
  setActiveScreenId = () => {},
  setStateValue = () => {},
  setAppMode = () => {},
  state = {},
  boardEntry = {},
  getCoreState = () => ({}),
  getDefaultChapterForWorld = () => null,
  updateBoardEntryState = () => {},
  updateSelections = () => {},
  updateState = () => {},
  stopSpeaking = () => {},
  startQuiz = () => {},
  ensureSentenceItemsLoaded = () => Promise.resolve(),
  initSentenceGameRound = () => {},
  enforceFreeXpGate = () => {},
  resetQaGameScreen = () => {},
  initBoardGameMvp = () => {},
  updateStatsUI = () => {},
  updateProfileUI = () => {},
  updateHeaderStatus = () => {},
  hideStartIntroPanel = () => {},
  setStartLevelMenuOpen = () => {},
  resetLessonProgress = () => {},
  closeHomeModesPanel = () => {},
  worldSoundscape = { start: () => {} },
  updateCompanionLine = () => {},
  startSession = () => {},
  startTimeUiUpdater = () => {},
  refreshTimeSummaryUI = () => {},
  screenVisibility = {},
  timers = {},
  isolateGameScreens = () => {},
}) {
  const DYNAMIC_SCREEN_CONTENT_SELECTORS = {
    [SCREEN_NAMES.LESSON]: [
      "#options",
      "#result",
    ],
    [SCREEN_NAMES.SENTENCES]: [
      "#sentences-list",
    ],
    [SCREEN_NAMES.SENTENCE_GAME]: [
      "#sentence-game-dropzone",
      "#sentence-game-pool",
      "#sentence-game-feedback",
      "#sentence-game-toast",
      "#sentence-game-correct-en",
      "#sentence-game-correct-mn",
    ],
    [SCREEN_NAMES.QA_GAME]: [
      "#qa-question-line",
      "#qa-answer-line",
      "#qa-word-bank",
      "#qa-feedback",
      "#qa-toast",
      "#qa-en-question",
      "#qa-en-answer",
    ],
    [SCREEN_NAMES.BOARD]: [
      "#board-game-options",
      "#board-game-feedback-hub",
      "#board-game-particles",
    ],
  };

  function clearElementContent(selector) {
    const element = document.querySelector(selector);
    if (!element) return;
    element.replaceChildren();
  }

  function isolateNonTargetScreenContent(targetScreenId) {
    Object.entries(DYNAMIC_SCREEN_CONTENT_SELECTORS).forEach(([screenId, selectors]) => {
      if (screenId === targetScreenId) return;
      selectors.forEach((selector) => clearElementContent(selector));
    });
  }

  function resolveScreenId(screenId) {
    return typeof screenId === "string"
      ? screenId
      : Object.keys(screens).find((id) => screens[id] === screenId);
  }

  function showScreen(screenId) {
    const resolvedScreenId = resolveScreenId(screenId);
    if (!resolvedScreenId || !screens[resolvedScreenId]) return;

    const targetScreen = screens[resolvedScreenId];
    setStateValue("currentScreen", resolvedScreenId);

    const visibility = {
      wasSentenceGameVisible: screenVisibility.sentenceGameVisible?.(),
      wasQaGameVisible: screenVisibility.qaVisible?.(),
      wasSentencesVisible: screenVisibility.sentencesVisible?.(),
      wasLessonVisible: screenVisibility.lessonVisible?.(),
    };

    const previousScreenId = getActiveScreenId();
    screenRegistry[previousScreenId]?.leave?.({ nextScreenId: resolvedScreenId, previousScreenId });

    isolateNonTargetScreenContent(resolvedScreenId);
    isolateGameScreens({ targetScreenId: resolvedScreenId, previousScreenId });

    Object.values(screens).forEach((screenEl) => hideElement(screenEl));
    showElement(targetScreen);
    const homeShellEl = typeof document?.getElementById === "function" ? document.getElementById("home-shell") : null;
    if (homeShellEl) {
      if (targetScreen === state.startScreen) showElement(homeShellEl);
      else hideElement(homeShellEl);
    }

    setActiveScreenId(resolvedScreenId);
    screenRegistry[resolvedScreenId]?.enter?.({ previousScreenId, nextScreenId: resolvedScreenId });

    if (state.topbar) {
      if (targetScreen === state.quizScreen) showElement(state.topbar);
      else hideElement(state.topbar);
    }

    if (targetScreen === state.profileScreen) updateProfileUI();
    if (targetScreen === state.sentenceGameScreen && !visibility.wasSentenceGameVisible) timers.beginSentenceGameSession?.();
    if (targetScreen !== state.sentenceGameScreen && visibility.wasSentenceGameVisible) timers.endSentenceGameSession?.();
    if (targetScreen === state.quizScreen && !visibility.wasLessonVisible) timers.startLessonTimer?.();
    if (targetScreen !== state.quizScreen && visibility.wasLessonVisible) timers.stopLessonTimer?.();
    if (targetScreen === state.qaGameScreen && !visibility.wasQaGameVisible && state.hasQaGameLevel?.()) timers.startQaTimer?.();
    if (targetScreen !== state.qaGameScreen && visibility.wasQaGameVisible) timers.stopQaTimer?.();
    if (targetScreen === state.sentencesScreen && !visibility.wasSentencesVisible) timers.startSentencesTimer?.();
    if (targetScreen !== state.sentencesScreen && visibility.wasSentencesVisible) timers.stopSentencesTimer?.();

    const domScreenId = targetScreen.id ? (screenIds[targetScreen.id] || targetScreen.id) : null;
    setAppMode(targetScreen === state.startScreen ? GAME_MODES.HOME : GAME_MODES.LEARNING);
    if (document.body) document.body.dataset.activeScreen = domScreenId || "home";

    const ambienceMode = domScreenId === "lesson" ? "lesson" : (domScreenId === "sentences" ? "sentences" : "home");
    worldSoundscape.start(ambienceMode);
    if (domScreenId === "lesson") updateCompanionLine("lesson", "idle");
    if (domScreenId === "sentences") updateCompanionLine("sentences", "idle");

    startSession(domScreenId);
    startTimeUiUpdater();
    refreshTimeSummaryUI();
    updateHeaderStatus();
  }

  function syncBoardEntryFlowState({ step, worldId, difficultyId, chapterId } = {}) {
    const currentEntry = boardEntry.getState?.() || {};
    const nextWorldId = worldId || currentEntry.worldId;
    const nextDifficultyId = difficultyId || currentEntry.difficultyId;
    const nextChapterId = chapterId || currentEntry.chapterId || getDefaultChapterForWorld(nextWorldId)?.id || null;

    updateBoardEntryState({
      ...(step ? { step } : {}),
      ...(worldId ? { worldId } : {}),
      ...(difficultyId ? { difficultyId } : {}),
      chapterId: nextChapterId,
    });

    updateSelections({ selectedWorldId: nextWorldId, selectedDifficultyId: nextDifficultyId });
    updateState((appState) => {
      appState.flow.lastRequestedScreen = step === boardEntry.steps?.PLAY ? SCREEN_NAMES.BOARD : SCREEN_NAMES.CHAPTER_COVER;
    });
    screenRegistry[SCREEN_NAMES.CHAPTER_COVER]?.refresh?.();
    return boardEntry.getState?.();
  }

  const navigationHandlers = {
    [state.destinations.HOME]: () => {
      stopSpeaking();
      hideStartIntroPanel();
      showScreen(SCREEN_NAMES.START);
    },
    [state.destinations.LESSON]: () => {
      stopSpeaking();
      hideStartIntroPanel();
      setStartLevelMenuOpen(false);
      startQuiz();
    },
    [state.destinations.SENTENCES]: () => {
      stopSpeaking();
      showScreen(SCREEN_NAMES.SENTENCES);
      ensureSentenceItemsLoaded().catch(() => {});
    },
    [state.destinations.SENTENCE_GAME]: () => {
      stopSpeaking();
      showScreen(SCREEN_NAMES.SENTENCE_GAME);
      ensureSentenceItemsLoaded().then(() => initSentenceGameRound()).catch(() => {});
      enforceFreeXpGate();
    },
    [state.destinations.QA_GAME]: () => {
      stopSpeaking();
      showScreen(SCREEN_NAMES.QA_GAME);
      resetQaGameScreen();
    },
    [state.destinations.BOARD_ENTRY]: () => {
      stopSpeaking();
      const { selectedWorldId, selectedDifficultyId } = getCoreState();
      boardEntry.reset?.({
        worldId: selectedWorldId,
        difficultyId: selectedDifficultyId,
        chapterId: getDefaultChapterForWorld(selectedWorldId)?.id || null,
      });
      syncBoardEntryFlowState({ step: boardEntry.steps?.ENTRY });
      showScreen(SCREEN_NAMES.CHAPTER_COVER);
    },
    [state.destinations.BOARD_COVER]: () => {
      stopSpeaking();
      syncBoardEntryFlowState({ step: boardEntry.steps?.COVER });
      showScreen(SCREEN_NAMES.CHAPTER_COVER);
    },
    [state.destinations.BOARD_PLAY]: () => {
      stopSpeaking();
      syncBoardEntryFlowState({ step: boardEntry.steps?.PLAY });
      showScreen(SCREEN_NAMES.BOARD);
      initBoardGameMvp();
    },
    [state.destinations.STATS]: () => {
      stopSpeaking();
      showScreen(SCREEN_NAMES.STATS);
      updateStatsUI();
    },
    [state.destinations.PROFILE]: () => {
      stopSpeaking();
      showScreen(SCREEN_NAMES.PROFILE);
    },
  };

  function navigateTo(destination) {
    navigationHandlers[destination]?.();
  }

  function requestNavigation(destination) {
    closeHomeModesPanel();
    if (destination !== state.destinations.LESSON) resetLessonProgress();
    updateState((appState) => {
      appState.flow.lastRequestedScreen = destination;
    });
    navigateTo(destination);
  }

  function initializeActiveScreen() {
    const initialVisibleScreen = document.querySelector(".card:not(.hidden)");
    if (!initialVisibleScreen) {
      setAppMode(GAME_MODES.HOME);
      return;
    }

    const initialScreenId = resolveScreenId(initialVisibleScreen.id);
    const isHomeVisible = initialVisibleScreen === state.startScreen;
    const homeShellEl = typeof document?.getElementById === "function" ? document.getElementById("home-shell") : null;
    if (homeShellEl) {
      if (isHomeVisible) showElement(homeShellEl);
      else hideElement(homeShellEl);
    }

    setActiveScreenId(initialScreenId);
    screenRegistry[initialScreenId]?.enter?.({ previousScreenId: null, nextScreenId: initialScreenId });
    setAppMode(isHomeVisible ? GAME_MODES.HOME : GAME_MODES.LEARNING);

    const domScreenId = initialVisibleScreen.id ? (screenIds[initialVisibleScreen.id] || initialVisibleScreen.id) : null;
    if (document.body) document.body.dataset.activeScreen = domScreenId || "home";

    startSession(domScreenId || initialScreenId);
    startTimeUiUpdater();
  }

  return {
    navigateTo,
    initializeActiveScreen,
    requestNavigation,
    showScreen,
    syncBoardEntryFlowState,
  };
}
