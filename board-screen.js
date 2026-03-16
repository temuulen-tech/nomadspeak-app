/**
 * board-screen.js
 * Owns board gameplay screen interactions (dice, board scene hooks, board controls).
 */

import { renderBoardRollState } from "./render-board.js";

export function initBoardScreen(handlers = {}) {
  const boardScreenEl = document.getElementById("board-game-screen");
  const rollBtn = document.getElementById("board-game-roll-btn");
  const diceEl = document.getElementById("board-game-dice");

  if (rollBtn) rollBtn.addEventListener("click", () => handlers.onRollDice?.());
  if (diceEl) diceEl.addEventListener("click", () => handlers.onRollDice?.());

  window.addEventListener("resize", () => {
    if (!boardScreenEl || boardScreenEl.classList.contains("hidden")) return;
    handlers.onResizeWhileVisible?.();
  });

  return {
    id: "board",
    element: boardScreenEl,
    activate: () => {
      renderBoardRollState({ enabled: true, rollBtn, diceEl });
      handlers.onActivate?.();
    },
    deactivate: () => handlers.onDeactivate?.(),
  };
}
