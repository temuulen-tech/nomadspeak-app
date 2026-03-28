export function createAppBootstrap(deps = {}) {
  const {
    createProgressUi,
    createAppTimerManager,
    createVaultManager,
    createScreenNavigator,
    getProgressState,
    getProfileName,
    isPremium,
    getAppTimeDailyTotals,
    getLocalDateKey,
    formatHHMMSS,
    refreshTimeSummaryUI,
    getStatsSelectedPeriod,
    getStatsRewardTab,
    profileDom,
    appTimer,
    vault,
    lesson,
    qa,
    sentenceGame,
    screens,
    screenIds,
    screenRegistry,
    getActiveScreenId,
    setActiveScreenId,
    setStateValue,
    setAppMode,
    navigationState,
    boardEntry,
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
    screenVisibility,
    timers,
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
    getSentenceGameClimbLevel,
    loadSentenceGameRewardState,
    updateSentenceGameRewardLevel,
    reconcileRewardTierProgress,
    persistSentenceGameRewardState,
    loadSentenceGameDifficulty,
    syncBoardEntryFlowState,
    initDebugTools,
    getDebugChapterOptions,
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
    sentenceGameControls,
    bindClickOnce,
    bindModalDismissal,
    updateVaultBadge,
    vaultKeyForScreen,
    renderVaultModal,
    saveCurrentLessonItem,
    saveCurrentSentencesItem,
    saveCurrentQaRound,
    saveCurrentSentenceGameItem,
    screenNames,
    qaControls,
    sentenceFilterControls,
    audioControls,
    playExitControls,
    homeScreen,
    chapterCoverScreen,
    boardScreen,
    lessonScreen,
    statsScreen,
    homeHandlers,
    chapterCoverHandlers,
    boardHandlers,
    lessonHandlers,
    statsHandlers,
    bindManagedEvent,
    persistAllActiveTime,
    ensureStoppedIfHidden,
    stopTimeUiUpdater,
    audioEngine,
    speechControls,
    premiumControls,
    installPrompt,
    hasClickBinding,
    primaryButtonAudit,
    setInitialHomeUi,
  } = deps;

  let appInitialized = false;
  let stateSubscriptionsInitialized = false;
  let deferredInstallPrompt = null;

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

  function unregisterServiceWorkers() {
    if (!("serviceWorker" in navigator) || typeof navigator.serviceWorker.getRegistrations !== "function") return;
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  }

  function isLocalLikeHost(host = window.location.hostname) {
    if (!host) return false;
    const normalizedHost = host.trim().toLowerCase();
    if (["localhost", "127.0.0.1", "::1"].includes(normalizedHost) || normalizedHost.endsWith(".local")) {
      return true;
    }
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalizedHost)) return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(normalizedHost)) return true;
    const privateRange172 = normalizedHost.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
    if (privateRange172) {
      const secondOctet = Number(privateRange172[1]);
      return secondOctet >= 16 && secondOctet <= 31;
    }
    return false;
  }

  function isWrapperLikeRuntime() {
    const protocol = window.location.protocol;
    if (!["http:", "https:"].includes(protocol)) return true;
    const userAgent = navigator.userAgent || "";
    return /Android.*Version\/|\bwv\)|WebView|; wv\b|FBAN|FBAV|Instagram|Line\//i.test(userAgent);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    const isSecureContext = window.location.protocol === "https:";
    const searchParams = new URLSearchParams(window.location.search);
    const isServiceWorkerDisabled = searchParams.get("sw") === "off";
    const shouldAvoidServiceWorker = isLocalLikeHost() || !isSecureContext || isWrapperLikeRuntime() || isServiceWorkerDisabled;
    if (shouldAvoidServiceWorker) {
      unregisterServiceWorkers();
      return;
    }
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).catch(() => {});
  }

  function updateInstallHintVisibility() {
    const { installHintEl } = installPrompt;
    if (!installHintEl) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    const shouldHideInstallHint = standalone || isWrapperLikeRuntime();
    installPrompt.setVisibility(!shouldHideInstallHint && Boolean(deferredInstallPrompt));
  }

  function initializeManagers() {
    deps.setProgressUi(createProgressUi({
      getProgressState,
      getProfileName,
      isPremium,
      getAppTimeDailyTotals,
      getLocalDateKey,
      formatHHMMSS,
      refreshTimeSummaryUI,
      getStatsSelectedPeriod,
      getStatsRewardTab,
      dom: profileDom,
    }));

    deps.setAppTimerManager(createAppTimerManager({
      storageKeys: appTimer.storageKeys,
      stopActivityTimers: appTimer.stopActivityTimers,
      syncCoreStateReferences,
      getProgressState,
      replaceProgress: appTimer.replaceProgress,
      updateStreak: appTimer.updateStreak,
      renderCoreStateSnapshot,
      getTodayKey: appTimer.getTodayKey,
      dom: appTimer.dom,
      rewardTabs: appTimer.rewardTabs,
    }));

    deps.setVaultManager(createVaultManager({
      badgeElsByScreen: vault.badgeElsByScreen,
      modal: vault.modal,
      showVaultToast: vault.showVaultToast,
      lessonMnTranslation: vault.lessonMnTranslation,
      sentencesListEl: vault.sentencesListEl,
      appSettings: vault.appSettings,
      sentenceItems: vault.sentenceItems,
      speakingSentenceId: vault.speakingSentenceId,
      stopSpeaking,
      speakSentence: vault.speakSentence,
      sentenceGame: vault.sentenceGame,
      qa: vault.qa,
      lesson: vault.lesson,
      markWordLearned: vault.markWordLearned,
      showScreen: vault.showScreen,
      screens: vault.screens,
    }));

    deps.setScreenNavigator(createScreenNavigator({
      screens,
      screenIds,
      screenRegistry,
      getActiveScreenId,
      setActiveScreenId,
      setStateValue,
      setAppMode,
      state: navigationState,
      boardEntry,
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
      screenVisibility,
      timers,
    }));
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
    renderSentenceGameClimb(getSentenceGameClimbLevel());
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
    syncBoardEntryFlowState({ worldId: selectedWorldId, difficultyId: selectedDifficultyId });
  }

  function initializeDebugMode() {
    initDebugTools({
      getChapterOptions: getDebugChapterOptions,
      navigateTo: (screenId) => requestNavigation(screenId),
      previewChapterCover: (chapterId) => previewChapterCover(chapterId),
      jumpToBoard: () => requestNavigation(homeHandlers.destinations.BOARD_ENTRY),
      jumpToBoardChapter: (chapterId) => jumpToBoardChapter(chapterId),
      unlockAllChapters: () => unlockAllDebugChapters(),
      giveXp: (amount) => giveDebugXp(amount),
      giveRewards: () => giveDebugRewards(),
      resetProgress: () => resetDebugProgress(),
    });
    screenRegistry[screenNames.CHAPTER_COVER]?.setPreview();
  }

  function initializeRewardUi() {
    renderSentencesRewards();
    updateSentencesTimerUI();
    renderLessonRewards();
    updateLessonTimerUI();
  }

  function initializeSentenceGameControls() { sentenceGameControls(); }
  function initializeVaultControls() {
    bindClickOnce(vault.lessonSaveBtn, "vault:save-lesson", saveCurrentLessonItem);
    bindClickOnce(vault.sentencesSaveBtn, "vault:save-sentences", saveCurrentSentencesItem);
    bindClickOnce(vault.qaSaveBtn, "vault:save-qa", saveCurrentQaRound);
    bindClickOnce(vault.sentenceGameSaveBtn, "vault:save-sentence-game", saveCurrentSentenceGameItem);
    bindClickOnce(vault.lessonVaultBtn, "vault:open-lesson", () => renderVaultModal(vaultKeyForScreen(screenNames.LESSON)));
    bindClickOnce(vault.qaVaultBtn, "vault:open-qa", () => renderVaultModal(vaultKeyForScreen("qna")));
    bindClickOnce(vault.sentenceGameVaultBtn, "vault:open-sentence-game", () => renderVaultModal(vaultKeyForScreen("sentenceGame")));
    bindClickOnce(vault.sentencesVaultBtn, "vault:open-sentences", () => renderVaultModal(vaultKeyForScreen(screenNames.SENTENCES)));
    bindModalDismissal({ modalEl: vault.modal.modalEl, closeBtn: vault.vaultModalCloseBtn });
    [screenNames.LESSON, "qna", "sentenceGame", screenNames.SENTENCES].forEach((screenId) => updateVaultBadge(vaultKeyForScreen(screenId)));
  }
  function initializeQaControls() { qaControls(); }
  function initializeSentenceFilterControls() { sentenceFilterControls(); }
  function initializeAudioAndSentenceControls() { audioControls(); }
  function initializePlayExitControls() { playExitControls(); }

  function initializeScreenRegistry() {
    setInitialHomeUi();
    screenRegistry.start = homeScreen(homeHandlers);
    screenRegistry[screenNames.CHAPTER_COVER] = chapterCoverScreen(chapterCoverHandlers);
    screenRegistry[screenNames.BOARD] = boardScreen(boardHandlers);
    screenRegistry.lesson = lessonScreen(lessonHandlers);
    screenRegistry.stats = statsScreen(statsHandlers);
  }

  function initializeLifecycleEvents() {
    bindManagedEvent(document, "visibilitychange", "app:lifecycle:persist-visibility", () => {
      if (document.hidden) {
        persistAllActiveTime();
        ensureStoppedIfHidden();
        stopTimeUiUpdater();
        return;
      }
      if (screenVisibility.sentenceGameVisible()) {
        timers.beginSentenceGameSession?.();
      }
      const visibleScreen = document.querySelector(".card:not(.hidden)");
      if (visibleScreen) {
        const screenId = screenIds[visibleScreen.id] || visibleScreen.id;
        startSession(screenId);
        startTimeUiUpdater();
        refreshTimeSummaryUI();
      }
    });

    bindManagedEvent(window, "pagehide", "app:lifecycle:pagehide", () => { persistAllActiveTime(); stopTimeUiUpdater(); });
    bindManagedEvent(window, "beforeunload", "app:lifecycle:beforeunload", () => { persistAllActiveTime(); stopTimeUiUpdater(); });
    bindManagedEvent(document, "visibilitychange", "app:lifecycle:audio-visibility", () => { audioEngine.onVisibilityChange(); });
  }

  function initializeSpeechAndProfileControls() { speechControls(); }
  function initializePremiumControls() { premiumControls(); }

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
    bindClickOnce(installPrompt.installBtn, "app:install:prompt", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      updateInstallHintVisibility();
    });
    updateInstallHintVisibility();
  }

  function initializeActiveScreenTracking() { deps.getScreenNavigator()?.initializeActiveScreen(); }

  function auditPrimaryButtonWiring() {
    const missingBindings = primaryButtonAudit().filter(({ element, key }) => !hasClickBinding(element, key));
    if (missingBindings.length) {
      console.warn("[NomadSpeak] Missing primary button click wiring:", missingBindings.map(({ name }) => name));
    }
  }

  function initializeApp() {
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
    schedulePostStartupTask(() => { ensureSentenceItemsLoaded().catch(() => {}); });
  }

  return { initializeApp, auditPrimaryButtonWiring };
}
