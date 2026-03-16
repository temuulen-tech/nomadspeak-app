import { SCREEN_NAMES } from "./constants.js";

/**
 * chapter-cover-screen.js
 * Owns the chapter/game cover screen and start-game entry interaction.
 */

export function initChapterCoverScreen(handlers = {}) {
  const chapterCoverScreenEl = document.getElementById("board-game-intro-screen");
  const continueBtn = document.getElementById("board-game-intro-continue-btn");

  if (continueBtn) {
    continueBtn.addEventListener("click", () => handlers.onStartGame?.());
  }

  return {
    id: SCREEN_NAMES.CHAPTER_COVER,
    element: chapterCoverScreenEl,
    activate: () => handlers.onActivate?.(),
    deactivate: () => handlers.onDeactivate?.(),
  };
}
