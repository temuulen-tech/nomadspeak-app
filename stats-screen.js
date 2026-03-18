import { SCREEN_NAMES } from "./constants.js";
import { bindModalDismissal, openModal } from "./modal.js";

/**
 * stats-screen.js
 * Owns stats/performance screen controls and stats-specific UI interactions.
 */

export function initStatsScreen(handlers = {}) {
  const statsScreenEl = document.getElementById("stats-screen");
  const statsPeriodButtons = Array.from(document.querySelectorAll("[data-period]"));
  const statsRewardTabButtons = Array.from(document.querySelectorAll(".stats-reward-tab"));
  const timeDetailsButtons = Array.from(document.querySelectorAll(".time-details-btn"));
  const timeDetailsModalEl = document.getElementById("time-details-modal");
  const timeDetailsCloseBtn = document.getElementById("time-details-close-btn");

  statsPeriodButtons.forEach((btn) => {
    btn.addEventListener("click", () => handlers.onPeriodChange?.(btn));
  });

  statsRewardTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => handlers.onRewardTabChange?.(btn));
  });

  timeDetailsButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      handlers.onBeforeOpenTimeDetails?.();
      openModal(timeDetailsModalEl);
    });
  });

  bindModalDismissal({
    modalEl: timeDetailsModalEl,
    closeBtn: timeDetailsCloseBtn,
  });

  return {
    id: SCREEN_NAMES.STATS,
    element: statsScreenEl,
    activate: () => handlers.onActivate?.(),
    deactivate: () => handlers.onDeactivate?.(),
  };
}
