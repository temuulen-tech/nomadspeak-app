/**
 * home-screen.js
 * Owns home/landing screen element access and home-specific event wiring.
 */

import { renderHomeScreen } from "./render-home.js";
import { FLOW_DESTINATIONS, SCREEN_NAMES } from "./constants.js";
import { bindClickOnce } from "./ui.js";
import { createScreenLifecycle } from "./screen-lifecycle.js";

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
  bindClickOnce(navLessonBtn, "home:navigate-lesson", () => handlers.onNavigate?.(FLOW_DESTINATIONS.LESSON));
  bindClickOnce(navSentencesBtn, "home:navigate-sentences", () => handlers.onNavigate?.(FLOW_DESTINATIONS.SENTENCES));
  bindClickOnce(navSentenceGameBtn, "home:navigate-sentence-game", () => handlers.onNavigate?.(FLOW_DESTINATIONS.SENTENCE_GAME));
  bindClickOnce(navQaGameBtn, "home:navigate-qa-game", () => handlers.onNavigate?.(FLOW_DESTINATIONS.QA_GAME));
  bindClickOnce(navBoardGameBtn, "home:navigate-board-game", () => handlers.onNavigate?.(FLOW_DESTINATIONS.BOARD_ENTRY));
  bindClickOnce(navStatsBtn, "home:navigate-stats", () => handlers.onNavigate?.(FLOW_DESTINATIONS.STATS));
  bindClickOnce(navProfileBtn, "home:navigate-profile", () => handlers.onNavigate?.(FLOW_DESTINATIONS.PROFILE));
  bindClickOnce(navModesBtn, "home:toggle-modes", () => handlers.onToggleModes?.());

  bindClickOnce(document, "home:close-modes-outside-click", (event) => {
    if (!homeModesPanel || !navModesBtn) return;
    if (homeModesPanel.classList.contains("hidden")) return;
    if (homeModesPanel.contains(event.target) || navModesBtn.contains(event.target)) return;
    handlers.onCloseModes?.();
  });

  bindClickOnce(introToggleBtn, "home:toggle-intro", () => handlers.onToggleIntro?.());
  bindClickOnce(introCloseBtn, "home:close-intro", () => handlers.onCloseIntro?.());


  return createScreenLifecycle({
    id: SCREEN_NAMES.START,
    element: startScreenEl,
    onEnter: () => {
      renderHomeScreen();
      handlers.onActivate?.();
    },
    onReenter: () => {
      renderHomeScreen();
      handlers.onActivate?.();
    },
    onLeave: () => handlers.onDeactivate?.(),
  });
}
