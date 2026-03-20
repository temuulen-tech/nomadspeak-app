import { SCREEN_NAMES } from "./constants.js";
import { bindModalDismissal, openModal } from "./modal.js";
import { bindClickOnce } from "./ui.js";
import { createScreenLifecycle } from "./screen-lifecycle.js";

/**
 * stats-screen.js
 * Owns stats/performance screen controls and stats-specific UI interactions.
 */

export function initStatsScreen(handlers = {}) {
  const statsScreenEl = document.getElementById("stats-screen");
  const timeDetailsModalEl = document.getElementById("time-details-modal");
  const timeDetailsCloseBtn = document.getElementById("time-details-close-btn");

  const wireControls = () => {
    const statsPeriodButtons = Array.from(document.querySelectorAll("[data-period]"));
    const statsRewardTabButtons = Array.from(document.querySelectorAll(".stats-reward-tab"));
    const timeDetailsButtons = Array.from(document.querySelectorAll(".time-details-btn"));

    statsPeriodButtons.forEach((btn) => {
      bindClickOnce(btn, `stats:period:${btn.dataset.period || btn.textContent}`, () => handlers.onPeriodChange?.(btn));
    });

    statsRewardTabButtons.forEach((btn) => {
      bindClickOnce(btn, `stats:reward-tab:${btn.dataset.rewardTab || btn.textContent}`, () => handlers.onRewardTabChange?.(btn));
    });

    timeDetailsButtons.forEach((btn, index) => {
      bindClickOnce(btn, `stats:time-details:${btn.id || index}`, () => {
        handlers.onBeforeOpenTimeDetails?.();
        openModal(timeDetailsModalEl);
      });
    });
  };

  wireControls();

  bindModalDismissal({
    modalEl: timeDetailsModalEl,
    closeBtn: timeDetailsCloseBtn,
  });

  return createScreenLifecycle({
    id: SCREEN_NAMES.STATS,
    element: statsScreenEl,
    onEnter: () => {
      wireControls();
      handlers.onActivate?.();
    },
    onReenter: () => {
      wireControls();
      handlers.onActivate?.();
    },
    onLeave: () => handlers.onDeactivate?.(),
  });
}
