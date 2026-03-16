/**
 * stats-screen.js
 * Owns stats/performance screen controls and stats-specific UI interactions.
 */

export function initStatsScreen(handlers = {}) {
  const statsScreenEl = document.getElementById("stats-screen");
  const statsPeriodButtons = Array.from(document.querySelectorAll("[data-period]"));
  const statsRewardTabButtons = Array.from(document.querySelectorAll(".stats-reward-tab"));

  statsPeriodButtons.forEach((btn) => {
    btn.addEventListener("click", () => handlers.onPeriodChange?.(btn));
  });

  statsRewardTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => handlers.onRewardTabChange?.(btn));
  });

  return {
    id: "stats",
    element: statsScreenEl,
    activate: () => handlers.onActivate?.(),
    deactivate: () => handlers.onDeactivate?.(),
  };
}
