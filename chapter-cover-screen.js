import { SCREEN_NAMES, WORLD_IDS } from "./constants.js";
import { BOARD_WORLD_CHAPTERS, getChapterConfig } from "./chapters.js";
import { getWorldConfig } from "./worlds.js";

const BOARD_WORLD_OPTIONS = [
  { id: "world1", label: "Колумб ба Шинэ тивийнхэн" },
  { id: "world2", label: "Эртний Хятад ба Торгоны зам" },
  { id: "world3", label: "Ромын эзэнт гүрэн ба Гладиаторууд" },
];

const BOARD_DIFFICULTY_OPTIONS = [
  { id: "beginner", label: "Анхан" },
  { id: "intermediate", label: "Дунд" },
  { id: "advanced", label: "Ахисан" },
];

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
  const worldButtons = Array.from(document.querySelectorAll(".board-game-world-option"));
  const difficultySelectorEl = document.getElementById("board-game-difficulty-selector");
  const selectedWorldLabelEl = document.getElementById("board-game-selected-world-label");
  const difficultyButtons = Array.from(document.querySelectorAll(".board-game-difficulty-option"));
  const worldConfig = getWorldConfig(WORLD_IDS.WORLD_1);
  const state = {
    previewChapterId: BOARD_WORLD_CHAPTERS[0]?.id || null,
    debugMetaEl: null,
    selectedWorldId: BOARD_WORLD_OPTIONS[0]?.id || null,
    selectedDifficultyId: BOARD_DIFFICULTY_OPTIONS[0]?.id || null,
  };

  const syncSelectorUi = () => {
    worldButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.boardWorld === state.selectedWorldId);
      btn.setAttribute("aria-pressed", btn.dataset.boardWorld === state.selectedWorldId ? "true" : "false");
    });

    difficultyButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.boardDifficulty === state.selectedDifficultyId);
      btn.setAttribute("aria-pressed", btn.dataset.boardDifficulty === state.selectedDifficultyId ? "true" : "false");
    });

    if (difficultySelectorEl) {
      difficultySelectorEl.classList.toggle("hidden", !state.selectedWorldId);
    }

    const selectedWorld = BOARD_WORLD_OPTIONS.find((item) => item.id === state.selectedWorldId);
    if (selectedWorldLabelEl && selectedWorld) {
      selectedWorldLabelEl.textContent = `Сонгосон ертөнц: ${selectedWorld.label}`;
    }

    if (continueBtn) {
      continueBtn.disabled = !state.selectedWorldId || !state.selectedDifficultyId;
    }
  };

  if (coverImageEl && worldConfig?.introCoverImage) {
    coverImageEl.src = worldConfig.introCoverImage;
  }

  const setPreview = (chapterId = BOARD_WORLD_CHAPTERS[0]?.id) => {
    const chapter = getChapterConfig(chapterId) || BOARD_WORLD_CHAPTERS[0] || null;
    if (!chapter) return null;

    state.previewChapterId = chapter.id;

    if (coverImageEl && chapter.coverImage) {
      coverImageEl.src = chapter.coverImage;
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

  if (continueBtn) {
    continueBtn.addEventListener("click", () => handlers.onStartGame?.({
      worldId: state.selectedWorldId,
      difficultyId: state.selectedDifficultyId,
    }));
  }

  worldButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedWorldId = btn.dataset.boardWorld || BOARD_WORLD_OPTIONS[0]?.id || null;
      syncSelectorUi();
    });
  });

  difficultyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedDifficultyId = btn.dataset.boardDifficulty || BOARD_DIFFICULTY_OPTIONS[0]?.id || null;
      syncSelectorUi();
    });
  });

  setPreview(state.previewChapterId);
  syncSelectorUi();

  return {
    id: SCREEN_NAMES.CHAPTER_COVER,
    element: chapterCoverScreenEl,
    activate: () => {
      syncSelectorUi();
      handlers.onActivate?.();
    },
    deactivate: () => handlers.onDeactivate?.(),
    setPreview,
    getPreviewChapterId: () => state.previewChapterId,
    getSelectedWorld: () => BOARD_WORLD_OPTIONS.find((item) => item.id === state.selectedWorldId) || null,
    getSelectedDifficulty: () => BOARD_DIFFICULTY_OPTIONS.find((item) => item.id === state.selectedDifficultyId) || null,
    resetSelection: () => {
      state.selectedWorldId = BOARD_WORLD_OPTIONS[0]?.id || null;
      state.selectedDifficultyId = BOARD_DIFFICULTY_OPTIONS[0]?.id || null;
      syncSelectorUi();
    },
    getAvailableDebugChapters: (unlockedIds = []) => {
      const allowedIds = unlockedIds.length ? unlockedIds : [state.previewChapterId].filter(Boolean);
      return BOARD_WORLD_CHAPTERS.filter((chapter) => allowedIds.includes(chapter.id));
    },
  };
}
