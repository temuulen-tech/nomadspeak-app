/**
 * lesson-screen.js
 * Owns lesson screen controls and lesson-specific entry actions.
 */

import { renderLessonScreen } from "./render-lesson.js";
import { SCREEN_NAMES } from "./constants.js";
import { bindClickOnce } from "./ui.js";

export function initLessonScreen(handlers = {}) {
  const lessonScreenEl = document.getElementById("quiz-screen");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");

  bindClickOnce(nextBtn, "lesson:next", () => handlers.onNext?.());
  bindClickOnce(restartBtn, "lesson:restart", () => handlers.onRestart?.());

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
