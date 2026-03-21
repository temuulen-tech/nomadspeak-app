export function createStartLevelSelectionHandler({
  startLevelOptions,
  syncToggleButtons,
  setLevel,
  markExplicitSelection,
  updateStartButtonLabel,
  setStartLevelMenuOpen,
  updateHeaderStatus,
  startQuiz,
}) {
  return function handleStartLevelSelection(button) {
    if (!button) return;
    syncToggleButtons(startLevelOptions, (option) => option === button, { pressed: false });
    setLevel(button.dataset.level);
    markExplicitSelection(true);
    updateStartButtonLabel();
    setStartLevelMenuOpen(false);
    updateHeaderStatus();
    startQuiz();
  };
}

export function createPlayExitControls({ playExitButtons, bindClickOnce, onExit }) {
  return function initializePlayExitControls() {
    playExitButtons.forEach((btn) => {
      bindClickOnce(btn, `app:play-exit:${btn.id || btn.className}`, onExit);
    });
  };
}

export function createHomeHandlers({ requestNavigation, toggleHomeModesPanel, closeHomeModesPanel, toggleStartIntroPanel, hideStartIntroPanel, setStartLevelMenuOpen, handleStartLevelSelection, destinations }) {
  return {
    onNavigate: (destination) => requestNavigation(destination),
    onToggleModes: () => toggleHomeModesPanel(),
    onCloseModes: () => closeHomeModesPanel(),
    onToggleIntro: () => toggleStartIntroPanel(),
    onCloseIntro: () => hideStartIntroPanel(),
    onSetStartLevelMenuOpen: (isOpen) => setStartLevelMenuOpen(isOpen),
    onSelectStartLevel: (button) => handleStartLevelSelection(button),
    destinations,
  };
}

export function createChapterCoverHandlers({ getSelectionState, syncBoardEntryFlowState, getDefaultChapterForWorld, resolveBoardSelectionRoute, navigateTo, boardSelectorSteps, boardPlayDestination }) {
  return {
    getSelectionState,
    onAdvanceSelectorStep: (step) => {
      syncBoardEntryFlowState({ step });
    },
    onSelectWorld: (worldId) => {
      syncBoardEntryFlowState({
        step: boardSelectorSteps.DIFFICULTY,
        worldId,
        chapterId: getDefaultChapterForWorld(worldId)?.id || null,
      });
    },
    onSelectDifficulty: (difficultyId) => {
      syncBoardEntryFlowState({
        step: boardSelectorSteps.READY,
        difficultyId,
      });
    },
    onStartGame: (selection = {}) => {
      const route = resolveBoardSelectionRoute(selection);
      syncBoardEntryFlowState({
        step: boardSelectorSteps.PLAY,
        worldId: route.worldId,
        difficultyId: route.difficultyId,
        chapterId: route.chapterId,
      });
      navigateTo(boardPlayDestination);
    },
  };
}


export function createBoardHandlers({ boardGameRollDice, updateBoardGameTokenPosition, initBoardGameMvp, isBoardGameBootstrapped, navigateTo }) {
  return {
    onRollDice: () => boardGameRollDice(),
    onBack: (destination) => navigateTo(destination),
    onResizeWhileVisible: () => updateBoardGameTokenPosition(),
    onActivate: () => {
      if (!isBoardGameBootstrapped()) initBoardGameMvp();
    },
  };
}

export function createLessonHandlers({ lessonFlow, navigateTo, statsDestination, exitPlayModeToHome, setStartLevelMenuOpen, handleStartLevelSelection }) {
  return {
    onNext: () => lessonFlow.nextQuestion(),
    onRestart: () => lessonFlow.startQuiz(),
    onOpenProgress: () => navigateTo(statsDestination),
    onReturnHome: () => exitPlayModeToHome(),
    onSetStartLevelMenuOpen: (isOpen) => setStartLevelMenuOpen(isOpen),
    onSelectStartLevel: (button) => handleStartLevelSelection(button),
  };
}

export function createStatsHandlers({ syncToggleButtons, setActiveState, setSelectedState, refreshTimeSummaryUI, progressUi, setStatsSelectedPeriod, setStatsRewardTab, statsPeriods, rewardTabs, statsPeriodButtons, statsRewardTabButtons }) {
  return {
    onBeforeOpenTimeDetails: () => refreshTimeSummaryUI(),
    onPeriodChange: (btn) => {
      setStatsSelectedPeriod(btn.dataset.period || statsPeriods.DAY);
      syncToggleButtons(statsPeriodButtons, (item) => item === btn, { pressed: false });
      refreshTimeSummaryUI();
    },
    onRewardTabChange: (btn) => {
      setStatsRewardTab(btn.dataset.rewardTab || rewardTabs.DAYS);
      statsRewardTabButtons.forEach((item) => {
        const active = item === btn;
        setActiveState(item, active);
        setSelectedState(item, active);
      });
      progressUi()?.renderRewardsTab();
    },
  };
}

export function createSpeechControls({ bindManagedEvent, loadVoices, profileNameInput, updateSettings, persistCoreAppState, updateProfileUI }) {
  return function initializeSpeechControls() {
    if ("speechSynthesis" in window) {
      loadVoices();
      bindManagedEvent(window.speechSynthesis, "voiceschanged", "tts:voiceschanged", loadVoices);
    }
    bindManagedEvent(profileNameInput, "input", "profile:name-input", () => {
      updateSettings({ profileName: profileNameInput.value.trim() });
      persistCoreAppState();
      updateProfileUI();
    });
  };
}

export function createPremiumControls({ bindClickOnce, bindModalDismissal, upgradePremiumBtn, openPremiumModal, premiumOverlay, premiumOkBtn, closePremiumModal }) {
  return function initializePremiumControls() {
    bindClickOnce(upgradePremiumBtn, "premium:upgrade", () => {
      openPremiumModal("Төлбөрийн хэсэг удахгүй нээгдэнэ");
    });
    bindModalDismissal({
      modalEl: premiumOverlay,
      closeBtn: premiumOkBtn,
      onClose: closePremiumModal,
    });
  };
}

export function createInitialHomeUiSetter({ setStartLevelMenuOpen, updateStartButtonLabel, setAppMode, homeMode, syncToggleButtons, startLevelOptions, getLevel }) {
  return function setInitialHomeUi() {
    setStartLevelMenuOpen(false);
    updateStartButtonLabel();
    setAppMode(homeMode);
    syncToggleButtons(startLevelOptions, (btn) => btn.dataset.level === getLevel(), { pressed: false });
  };
}
