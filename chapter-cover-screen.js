import { SCREEN_NAMES, WORLD_IDS } from "./constants.js";
import { BOARD_WORLD_CHAPTERS, getChapterConfig } from "./chapters.js";
import { getWorldConfig } from "./worlds.js";

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
  const worldConfig = getWorldConfig(WORLD_IDS.WORLD_1);
  const state = {
    previewChapterId: BOARD_WORLD_CHAPTERS[0]?.id || null,
    debugMetaEl: null,
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
    continueBtn.addEventListener("click", () => handlers.onStartGame?.());
  }

  setPreview(state.previewChapterId);

  return {
    id: SCREEN_NAMES.CHAPTER_COVER,
    element: chapterCoverScreenEl,
    activate: () => handlers.onActivate?.(),
    deactivate: () => handlers.onDeactivate?.(),
    setPreview,
    getPreviewChapterId: () => state.previewChapterId,
    getAvailableDebugChapters: (unlockedIds = []) => {
      const allowedIds = unlockedIds.length ? unlockedIds : [state.previewChapterId].filter(Boolean);
      return BOARD_WORLD_CHAPTERS.filter((chapter) => allowedIds.includes(chapter.id));
    },
  };
}
