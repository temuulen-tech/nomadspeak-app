import { DIFFICULTY_LEVELS } from "./constants.js";
import { bindClickOnce, isHidden, setActiveState, setCheckedState, setExpandedState } from "./ui.js";

export function createSentenceGameControls({
  dom = {},
  helpers = {},
}) {
  const {
    tipTextEl,
    tipToggleBtn,
    tipSpeakBtn,
    tipStopBtn,
    tipReadBtn,
    tipCloseBtn,
    difficultyToggleBtn,
    difficultyPanelEl,
    difficultyButtons = [],
    undoBtn,
    showCorrectBtn,
    retryBtn,
    prevBtn,
    nextBtn,
  } = dom;

  const {
    tipText = "",
    toggleTipPanel = () => {},
    speakTip = () => {},
    stopTipSpeech = () => {},
    showTipText = () => {},
    closeTipPanel = () => {},
    setDifficultyPanelOpen = () => {},
    selectDifficulty = () => {},
    updateTipControls = () => {},
    undoMove = () => {},
    showCorrectAnswer = () => {},
    retryRound = () => {},
    prevRound = () => {},
    nextRound = () => {},
  } = helpers;

  return function initializeSentenceGameControls() {
    if (tipTextEl) tipTextEl.textContent = tipText;

    bindClickOnce(tipToggleBtn, "sentence-game:tip-toggle", toggleTipPanel);
    bindClickOnce(tipSpeakBtn, "sentence-game:tip-speak", speakTip);
    bindClickOnce(tipStopBtn, "sentence-game:tip-stop", stopTipSpeech);
    bindClickOnce(tipReadBtn, "sentence-game:tip-read", showTipText);
    bindClickOnce(tipCloseBtn, "sentence-game:tip-close", closeTipPanel);
    bindClickOnce(difficultyToggleBtn, "sentence-game:difficulty-toggle", () => {
      const nextOpen = difficultyPanelEl ? isHidden(difficultyPanelEl) : false;
      setDifficultyPanelOpen(nextOpen);
    });

    difficultyButtons.forEach((btn) => {
      bindClickOnce(btn, `sentence-game:difficulty:${btn.dataset.difficulty || btn.textContent}`, () => {
        selectDifficulty(btn.dataset.difficulty || DIFFICULTY_LEVELS.BEGINNER, { collapsePanel: true });
      });
    });

    bindClickOnce(undoBtn, "sentence-game:undo", undoMove);
    bindClickOnce(showCorrectBtn, "sentence-game:show-correct", showCorrectAnswer);
    bindClickOnce(retryBtn, "sentence-game:retry", retryRound);
    bindClickOnce(prevBtn, "sentence-game:prev", prevRound);
    bindClickOnce(nextBtn, "sentence-game:next", nextRound);

    setDifficultyPanelOpen(false);
    updateTipControls();
  };
}

function sentenceLevelFilterLabel(filterKey) {
  return filterKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд" : filterKey === DIFFICULTY_LEVELS.ADVANCED ? "Дээд" : "Анхан";
}

export function createSentenceFilterControls({
  dom = {},
  state = {},
  actions = {},
  bindManagedEvent = () => {},
}) {
  const {
    pickerEl,
    pickerBtn,
    optionsEl,
    optionButtons = [],
  } = dom;
  const {
    getFilter = () => DIFFICULTY_LEVELS.BEGINNER,
    setFilter = () => {},
  } = state;
  const {
    stopSpeaking = () => {},
    renderSentences = () => {},
    updateHeaderStatus = () => {},
  } = actions;

  function setPickerOpen(isOpen) {
    if (!optionsEl || !pickerBtn) return;
    setExpandedState(pickerBtn, optionsEl, isOpen);
  }

  function updateActiveState() {
    const filter = getFilter();
    if (pickerBtn) {
      pickerBtn.textContent = `Түвшин сонгох: ${sentenceLevelFilterLabel(filter)}`;
    }

    optionButtons.forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      setActiveState(btn, isActive);
      setCheckedState(btn, isActive);
    });
  }

  return function initializeSentenceFilterControls() {
    updateActiveState();
    setPickerOpen(false);

    bindClickOnce(pickerBtn, "sentences:filter-toggle", () => {
      const nextOpen = optionsEl ? isHidden(optionsEl) : false;
      setPickerOpen(nextOpen);
    });

    optionButtons.forEach((btn) => {
      bindClickOnce(btn, `sentences:filter:${btn.dataset.filter || btn.textContent}`, () => {
        setFilter(btn.dataset.filter || DIFFICULTY_LEVELS.BEGINNER);
        updateActiveState();
        setPickerOpen(false);
        stopSpeaking();
        renderSentences();
        updateHeaderStatus();
      });
    });

    bindManagedEvent(document, "click", "sentences:filter-close-outside", (event) => {
      if (!pickerEl || !optionsEl || isHidden(optionsEl)) return;
      if (!pickerEl.contains(event.target)) {
        setPickerOpen(false);
      }
    });
  };
}
