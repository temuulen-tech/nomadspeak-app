/**
 * home-screen.js
 * Owns home/landing screen element access and home-specific event wiring.
 */

import { renderHomeScreen } from "./render-home.js";
import { SCREEN_NAMES } from "./constants.js";

export function initHomeScreen(handlers = {}) {
  const startScreenEl = document.getElementById("start-screen");
  const navLessonBtn = document.getElementById("nav-lesson-btn");
  const navSentencesBtn = document.getElementById("nav-sentences-btn");
  const navSentenceGameBtn = document.getElementById("nav-sentence-game-btn");
  const navQaGameBtn = document.getElementById("nav-qa-game-btn");
  const navBoardGameBtn = document.getElementById("nav-board-game-btn");
  const navStatsBtn = document.getElementById("nav-stats-btn");
  const navProfileBtn = document.getElementById("nav-profile-btn");
  const navModesBtn = document.getElementById("nav-modes-btn");
  const homeModesPanel = document.getElementById("home-modes-panel");
  const introToggleBtn = document.getElementById("intro-toggle-btn");
  const introCloseBtn = document.getElementById("intro-close-btn");
  const startBtn = document.getElementById("start-btn");
  const startLevelDropdown = document.getElementById("start-level-dropdown");
  const startLevelPicker = document.querySelector(".start-level-picker");
  const startLevelOptions = Array.from(document.querySelectorAll(".start-level-option"));

  if (navLessonBtn) navLessonBtn.addEventListener("click", () => handlers.onNavigate?.(SCREEN_NAMES.LESSON));
  if (navSentencesBtn) navSentencesBtn.addEventListener("click", () => handlers.onNavigate?.(SCREEN_NAMES.SENTENCES));
  if (navSentenceGameBtn) navSentenceGameBtn.addEventListener("click", () => handlers.onNavigate?.(SCREEN_NAMES.SENTENCE_GAME));
  if (navQaGameBtn) navQaGameBtn.addEventListener("click", () => handlers.onNavigate?.(SCREEN_NAMES.QA_GAME));
  if (navBoardGameBtn) navBoardGameBtn.addEventListener("click", () => handlers.onNavigate?.(SCREEN_NAMES.BOARD_GAME));
  if (navStatsBtn) navStatsBtn.addEventListener("click", () => handlers.onNavigate?.(SCREEN_NAMES.STATS));
  if (navProfileBtn) navProfileBtn.addEventListener("click", () => handlers.onNavigate?.(SCREEN_NAMES.PROFILE));
  if (navModesBtn) navModesBtn.addEventListener("click", () => handlers.onToggleModes?.());

  document.addEventListener("click", (event) => {
    if (!homeModesPanel || !navModesBtn) return;
    if (homeModesPanel.classList.contains("hidden")) return;
    if (homeModesPanel.contains(event.target) || navModesBtn.contains(event.target)) return;
    handlers.onCloseModes?.();
  });

  if (introToggleBtn) introToggleBtn.addEventListener("click", () => handlers.onToggleIntro?.());
  if (introCloseBtn) introCloseBtn.addEventListener("click", () => handlers.onCloseIntro?.());

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (!startLevelDropdown) return;
      const willOpen = startLevelDropdown.classList.contains("hidden");
      handlers.onSetStartLevelMenuOpen?.(willOpen);
    });
  }

  document.addEventListener("click", (event) => {
    if (!startLevelDropdown || !startBtn || !startLevelPicker) return;
    if (startLevelDropdown.classList.contains("hidden")) return;
    if (startLevelPicker.contains(event.target)) return;
    handlers.onSetStartLevelMenuOpen?.(false);
  });

  startLevelOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      handlers.onSelectStartLevel?.(btn);
    });
  });

  return {
    id: SCREEN_NAMES.HOME,
    element: startScreenEl,
    activate: () => {
      renderHomeScreen();
      handlers.onActivate?.();
    },
    deactivate: () => handlers.onDeactivate?.(),
  };
}
