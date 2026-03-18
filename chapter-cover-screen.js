import { BOARD_SELECTOR_STEPS, SCREEN_NAMES, getDifficultyOption } from "./constants.js";
import { getDefaultChapterForWorld, getChapterConfig } from "./chapters.js";
import { getBoardEntryState } from "./state.js";
import { getSelectableBoardWorlds, getWorldConfig } from "./worlds.js";
import { bindClickOnce } from "./ui.js";

/**
 * chapter-cover-screen.js
 * Owns the chapter/game cover screen, preview state, and start-game entry interaction.
 */

function ensureDebugChapterPreviewMeta(state, screenEl) {
  if (state.debugMetaEl || !screenEl) return state.debugMetaEl;
  state.debugMetaEl = document.createElement("div");
  state.debugMetaEl.className = "debug-chapter-preview hidden";
  screenEl.appendChild(state.debugMetaEl);
  return state.debugMetaEl;
}

export function initChapterCoverScreen(handlers = {}) {
  const chapterCoverScreenEl = document.getElementById("board-game-intro-screen");
  const continueBtn = document.getElementById("board-game-intro-continue-btn");
  const coverImageEl = document.querySelector("#board-game-intro-screen .board-game-intro-cover");
  const entryPanelEl = document.getElementById("board-game-entry-panel");
  const worldSelectionEl = document.getElementById("board-game-world-selection");
  const worldButtons = Array.from(document.querySelectorAll(".board-game-world-option"));
  const difficultySelectorEl = document.getElementById("board-game-difficulty-selector");
  const selectedWorldLabelEl = document.getElementById("board-game-selected-world-label");
  const difficultyButtons = Array.from(document.querySelectorAll(".board-game-difficulty-option"));
  const state = {
    previewChapterId: getBoardEntryState().chapterId,
    debugMetaEl: null,
  };

  const worldOptions = getSelectableBoardWorlds();

  worldButtons.forEach((btn, index) => {
    const world = worldOptions[index];
    if (!world) return;
    btn.dataset.boardWorld = world.id;
    btn.textContent = world.label;
  });

  difficultyButtons.forEach((btn) => {
    const difficulty = getDifficultyOption(btn.dataset.boardDifficulty);
    if (difficulty) btn.textContent = difficulty.label;
  });

  const getSelectionState = () => handlers.getSelectionState?.() || getBoardEntryState();

  const syncSelectorUi = () => {
    const selection = getSelectionState();
    const selectedWorld = getWorldConfig(selection.worldId);
    const selectedDifficulty = getDifficultyOption(selection.difficultyId);
    const selectorVisible = selection.step !== BOARD_SELECTOR_STEPS.ENTRY;

    entryPanelEl?.classList.toggle("hidden", selectorVisible);
    worldSelectionEl?.classList.toggle("hidden", !selectorVisible);

    worldButtons.forEach((btn) => {
      const active = btn.dataset.boardWorld === selection.worldId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    difficultyButtons.forEach((btn) => {
      const active = btn.dataset.boardDifficulty === selection.difficultyId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    if (difficultySelectorEl) {
      difficultySelectorEl.classList.toggle("hidden", !selection.worldId);
    }

    if (selectedWorldLabelEl && selectedWorld) {
      selectedWorldLabelEl.textContent = `Сонгосон ертөнц: ${selectedWorld.title}`;
    }

    if (continueBtn) {
      continueBtn.textContent = selectorVisible ? "Тоглож эхлэх" : "Үргэлжлүүлэх";
      continueBtn.disabled = selectorVisible && (!selectedWorld || !selectedDifficulty);
    }
  };

  const setPreview = (chapterId = getSelectionState().chapterId) => {
    const chapter = getChapterConfig(chapterId) || getDefaultChapterForWorld(getSelectionState().worldId);
    if (!chapter) return null;

    state.previewChapterId = chapter.id;

    const worldConfig = getWorldConfig(getSelectionState().worldId) || getWorldConfig(chapter.worldId);
    const coverImage = chapter.coverImage || worldConfig?.introCoverImage || null;
    if (coverImageEl && coverImage) {
      coverImageEl.src = coverImage;
      coverImageEl.alt = `${chapter.title} cover`;
    }

    chapterCoverScreenEl?.setAttribute("data-debug-chapter-id", chapter.id);

    const previewMetaEl = ensureDebugChapterPreviewMeta(state, chapterCoverScreenEl);
    if (previewMetaEl) {
      previewMetaEl.innerHTML = `<strong>${chapter.title}</strong><span>${chapter.story}</span>`;
      previewMetaEl.classList.toggle("hidden", !window.NomadSpeakDebug);
    }

    if (continueBtn) {
      continueBtn.dataset.debugChapterId = chapter.id;
    }

    return chapter;
  };

  bindClickOnce(continueBtn, "board-entry:continue", () => {
    const selection = getSelectionState();
    if (selection.step === BOARD_SELECTOR_STEPS.ENTRY) {
      handlers.onAdvanceSelectorStep?.(BOARD_SELECTOR_STEPS.WORLD);
      syncSelectorUi();
      return;
    }

    handlers.onStartGame?.(selection);
  });

  worldButtons.forEach((btn) => {
    bindClickOnce(btn, `board-entry:world:${btn.dataset.boardWorld || btn.textContent}`, () => {
      const worldId = btn.dataset.boardWorld || worldOptions[0]?.id || null;
      handlers.onSelectWorld?.(worldId);
      setPreview(getDefaultChapterForWorld(worldId)?.id || null);
      syncSelectorUi();
    });
  });

  difficultyButtons.forEach((btn) => {
    bindClickOnce(btn, `board-entry:difficulty:${btn.dataset.boardDifficulty || btn.textContent}`, () => {
      handlers.onSelectDifficulty?.(btn.dataset.boardDifficulty);
      syncSelectorUi();
    });
  });

  setPreview(state.previewChapterId);
  syncSelectorUi();

  return {
    id: SCREEN_NAMES.CHAPTER_COVER,
    element: chapterCoverScreenEl,
    activate: () => {
      setPreview(getSelectionState().chapterId);
      syncSelectorUi();
      handlers.onActivate?.();
    },
    deactivate: () => handlers.onDeactivate?.(),
    setPreview,
    getPreviewChapterId: () => state.previewChapterId,
    refresh: () => {
      setPreview(getSelectionState().chapterId);
      syncSelectorUi();
    },
    getSelectionSnapshot: () => ({ ...getSelectionState(), previewChapterId: state.previewChapterId }),
    getAvailableDebugChapters: (unlockedIds = []) => {
      const allowedIds = unlockedIds.length ? unlockedIds : [state.previewChapterId].filter(Boolean);
      return allowedIds.map((chapterId) => getChapterConfig(chapterId)).filter(Boolean);
    },
  };
}
