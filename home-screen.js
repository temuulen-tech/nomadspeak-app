/**
 * home-screen.js
 * Owns home/landing screen element access and home-specific event wiring.
 */

import { renderHomeScreen } from "./render-home.js";
import { SCREEN_NAMES } from "./constants.js";
import { bindClickOnce } from "./ui.js";

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
  const homeModesShortcutBtn = document.getElementById("home-modes-shortcut");
  const homeStatsShortcutBtn = document.getElementById("home-stats-shortcut");
  const homeIntroShortcutBtn = document.getElementById("home-intro-shortcut");
  const startBtn = document.getElementById("start-btn");
  const startLevelDropdown = document.getElementById("start-level-dropdown");
  const startLevelPicker = document.querySelector(".start-level-picker");
  const startLevelOptions = Array.from(document.querySelectorAll(".start-level-option"));

  bindClickOnce(navLessonBtn, "home:navigate-lesson", () => handlers.onNavigate?.(SCREEN_NAMES.LESSON));
  bindClickOnce(navSentencesBtn, "home:navigate-sentences", () => handlers.onNavigate?.(SCREEN_NAMES.SENTENCES));
  bindClickOnce(navSentenceGameBtn, "home:navigate-sentence-game", () => handlers.onNavigate?.(SCREEN_NAMES.SENTENCE_GAME));
  bindClickOnce(navQaGameBtn, "home:navigate-qa-game", () => handlers.onNavigate?.(SCREEN_NAMES.QA_GAME));
  bindClickOnce(navBoardGameBtn, "home:navigate-board-game", () => handlers.onNavigate?.(SCREEN_NAMES.BOARD_GAME));
  bindClickOnce(navStatsBtn, "home:navigate-stats", () => handlers.onNavigate?.(SCREEN_NAMES.STATS));
  bindClickOnce(navProfileBtn, "home:navigate-profile", () => handlers.onNavigate?.(SCREEN_NAMES.PROFILE));
  bindClickOnce(navModesBtn, "home:toggle-modes", () => handlers.onToggleModes?.());
  bindClickOnce(homeModesShortcutBtn, "home:toggle-modes-shortcut", () => handlers.onToggleModes?.());
  bindClickOnce(homeStatsShortcutBtn, "home:navigate-stats-shortcut", () => handlers.onNavigate?.(SCREEN_NAMES.STATS));
  bindClickOnce(homeIntroShortcutBtn, "home:toggle-intro-shortcut", () => handlers.onToggleIntro?.());

  bindClickOnce(document, "home:close-modes-outside-click", (event) => {
    if (!homeModesPanel || !navModesBtn) return;
    if (homeModesPanel.classList.contains("hidden")) return;
    if (homeModesPanel.contains(event.target) || navModesBtn.contains(event.target)) return;
    handlers.onCloseModes?.();
  });

  bindClickOnce(introToggleBtn, "home:toggle-intro", () => handlers.onToggleIntro?.());
  bindClickOnce(introCloseBtn, "home:close-intro", () => handlers.onCloseIntro?.());

  bindClickOnce(startBtn, "lesson:start-level-menu-toggle", () => {
    if (!startLevelDropdown) return;
    const willOpen = startLevelDropdown.classList.contains("hidden");
    handlers.onSetStartLevelMenuOpen?.(willOpen);
  });

  bindClickOnce(document, "lesson:close-start-level-menu-outside-click", (event) => {
    if (!startLevelDropdown || !startBtn || !startLevelPicker) return;
    if (startLevelDropdown.classList.contains("hidden")) return;
    if (startLevelPicker.contains(event.target)) return;
    handlers.onSetStartLevelMenuOpen?.(false);
  });

  startLevelOptions.forEach((btn) => {
    bindClickOnce(btn, `lesson:start-level-option:${btn.dataset.level || btn.textContent}`, () => {
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
