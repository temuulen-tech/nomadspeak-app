/**
 * render-home.js
 * Renders and updates only the home screen UI state (menus, intro, start-level controls).
 */

function homeEls() {
  return {
    navModesBtn: document.getElementById("nav-modes-btn"),
    homeModesPanel: document.getElementById("home-modes-panel"),
    introToggleBtn: document.getElementById("intro-toggle-btn"),
    introPanel: document.getElementById("intro-panel"),
    startBtn: document.getElementById("start-btn"),
    startLevelDropdown: document.getElementById("start-level-dropdown"),
  };
}

export function renderHomeScreen({ levelLabel } = {}) {
  if (levelLabel) updateStartButtonLabel(levelLabel);
}

export function updateStartButtonLabel(label) {
  const { startBtn } = homeEls();
  if (!startBtn) return;
  startBtn.textContent = `Түвшин сонгох: ${label}`;
}

export function setStartLevelMenuOpen(isOpen) {
  const { startBtn, startLevelDropdown } = homeEls();
  if (!startBtn || !startLevelDropdown) return;
  startLevelDropdown.classList.toggle("hidden", !isOpen);
  startBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

export function setHomeModesPanelOpen(isOpen) {
  const { navModesBtn, homeModesPanel } = homeEls();
  if (!navModesBtn || !homeModesPanel) return;
  homeModesPanel.classList.toggle("hidden", !isOpen);
  navModesBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

export function setStartIntroOpen(isOpen) {
  const { introPanel, introToggleBtn } = homeEls();
  if (!introPanel || !introToggleBtn) return;
  introPanel.classList.toggle("hidden", !isOpen);
  introToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}
