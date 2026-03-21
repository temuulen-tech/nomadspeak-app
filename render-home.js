/**
 * render-home.js
 * Renders and updates only the home screen UI state (menus, intro, start-level controls).
 */

import { setExpandedState, setText } from "./ui.js";

function homeEls() {
  return {
    navModesBtn: document.getElementById("nav-modes-btn"),
    homeModesPanel: document.getElementById("home-modes-panel"),
    introToggleBtn: document.getElementById("intro-toggle-btn"),
    introPanel: document.getElementById("intro-panel"),
    startBtn: document.getElementById("start-btn"),
    startLevelDropdown: document.getElementById("start-level-dropdown"),
    homeFlowHint: document.getElementById("home-flow-hint"),
  };
}

export function renderHomeScreen({ levelLabel, homeFlowHint } = {}) {
  if (levelLabel) updateStartButtonLabel(levelLabel);
  if (homeFlowHint) updateHomeFlowHint(homeFlowHint);
}

export function updateStartButtonLabel(label) {
  const { startBtn } = homeEls();
  if (!startBtn) return;
  setText(startBtn, `Түвшин сонгох: ${label}`);
}

export function setStartLevelMenuOpen(isOpen) {
  const { startBtn, startLevelDropdown } = homeEls();
  if (!startBtn || !startLevelDropdown) return;
  setExpandedState(startBtn, startLevelDropdown, isOpen);
}

export function setHomeModesPanelOpen(isOpen) {
  const { navModesBtn, homeModesPanel } = homeEls();
  if (!navModesBtn || !homeModesPanel) return;
  setExpandedState(navModesBtn, homeModesPanel, isOpen);
}

export function setStartIntroOpen(isOpen) {
  const { introPanel, introToggleBtn } = homeEls();
  if (!introPanel || !introToggleBtn) return;
  setExpandedState(introToggleBtn, introPanel, isOpen);
}

export function updateHomeFlowHint(label) {
  const { homeFlowHint } = homeEls();
  if (!homeFlowHint) return;
  setText(homeFlowHint, label);
}
