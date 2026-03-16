/**
 * lesson-screen.js
 * Owns lesson screen controls and lesson-specific entry actions.
 */

import { renderLessonScreen } from "./render-lesson.js";
import { SCREEN_NAMES } from "./constants.js";

export function initLessonScreen(handlers = {}) {
  const lessonScreenEl = document.getElementById("quiz-screen");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");

  if (nextBtn) nextBtn.addEventListener("click", () => handlers.onNext?.());
  if (restartBtn) restartBtn.addEventListener("click", () => handlers.onRestart?.());

  return {
    id: SCREEN_NAMES.LESSON,
    element: lessonScreenEl,
    activate: () => {
      renderLessonScreen();
      handlers.onActivate?.();
    },
    deactivate: () => handlers.onDeactivate?.(),
  };
}
