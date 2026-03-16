/**
 * home-screen.js
 * Owns home/landing screen element access and home-specific event wiring.
 */

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

  if (navLessonBtn) navLessonBtn.addEventListener("click", () => handlers.onNavigate?.("lesson"));
  if (navSentencesBtn) navSentencesBtn.addEventListener("click", () => handlers.onNavigate?.("sentences"));
  if (navSentenceGameBtn) navSentenceGameBtn.addEventListener("click", () => handlers.onNavigate?.("sentence-game"));
  if (navQaGameBtn) navQaGameBtn.addEventListener("click", () => handlers.onNavigate?.("qa-game"));
  if (navBoardGameBtn) navBoardGameBtn.addEventListener("click", () => handlers.onNavigate?.("board-game"));
  if (navStatsBtn) navStatsBtn.addEventListener("click", () => handlers.onNavigate?.("stats"));
  if (navProfileBtn) navProfileBtn.addEventListener("click", () => handlers.onNavigate?.("profile"));
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

  return {
    id: "home",
    element: startScreenEl,
    activate: () => handlers.onActivate?.(),
    deactivate: () => handlers.onDeactivate?.(),
  };
}
