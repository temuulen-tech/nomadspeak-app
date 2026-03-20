/**
 * lesson-screen.js
 * Owns lesson screen controls and lesson-specific entry actions.
 */

import { renderLessonScreen } from "./render-lesson.js";
import { SCREEN_NAMES } from "./constants.js";
import { bindClickOnce } from "./ui.js";
import { createScreenLifecycle } from "./screen-lifecycle.js";

export function initLessonScreen(handlers = {}) {
  const lessonScreenEl = document.getElementById("quiz-screen");
  const wireControls = () => {
    const nextBtn = document.getElementById("next-btn");
    const restartBtn = document.getElementById("restart-btn");
    const startBtn = document.getElementById("start-btn");
    const startLevelDropdown = document.getElementById("start-level-dropdown");
    const startLevelOptions = Array.from(document.querySelectorAll(".start-level-option"));

    bindClickOnce(nextBtn, "lesson:next", () => handlers.onNext?.());
    bindClickOnce(restartBtn, "lesson:restart", () => handlers.onRestart?.());

    bindClickOnce(startBtn, "lesson:start-level-menu-toggle", () => {
      if (!startLevelDropdown) return;
      const willOpen = startLevelDropdown.classList.contains("hidden");
      handlers.onSetStartLevelMenuOpen?.(willOpen);
    });

    startLevelOptions.forEach((btn) => {
      bindClickOnce(btn, `lesson:start-level-option:${btn.dataset.level || btn.textContent}`, () => {
        handlers.onSelectStartLevel?.(btn);
      });
    });
  };

  wireControls();

  bindClickOnce(document, "lesson:close-start-level-menu-outside-click", (event) => {
    const startLevelDropdown = document.getElementById("start-level-dropdown");
    const startBtn = document.getElementById("start-btn");
    const startLevelPicker = document.querySelector(".start-level-picker");
    if (!startLevelDropdown || !startBtn || !startLevelPicker) return;
    if (startLevelDropdown.classList.contains("hidden")) return;
    if (startLevelPicker.contains(event.target)) return;
    handlers.onSetStartLevelMenuOpen?.(false);
  });

  return createScreenLifecycle({
    id: SCREEN_NAMES.LESSON,
    element: lessonScreenEl,
    onEnter: () => {
      wireControls();
      renderLessonScreen();
      handlers.onActivate?.();
    },
    onReenter: () => {
      wireControls();
      renderLessonScreen();
      handlers.onActivate?.();
    },
    onLeave: () => handlers.onDeactivate?.(),
  });
}
