/**
 * board-screen.js
 * Owns board gameplay screen interactions (dice, board scene hooks, board controls).
 */

import { renderBoardRollState } from "./render-board.js";
import { SCREEN_NAMES } from "./constants.js";
import { bindClickOnce } from "./ui.js";

let boardResizeBindingInitialized = false;

export function initBoardScreen(handlers = {}) {
  const boardScreenEl = document.getElementById("board-game-screen");
  const rollBtn = document.getElementById("board-game-roll-btn");
  const diceEl = document.getElementById("board-game-dice");

  bindClickOnce(rollBtn, "board:roll-button", () => handlers.onRollDice?.());
  bindClickOnce(diceEl, "board:roll-dice", () => handlers.onRollDice?.());

  if (!boardResizeBindingInitialized) {
    boardResizeBindingInitialized = true;
    window.addEventListener("resize", () => {
      if (!boardScreenEl || boardScreenEl.classList.contains("hidden")) return;
      handlers.onResizeWhileVisible?.();
    });
  }

  return {
    id: SCREEN_NAMES.BOARD,
    element: boardScreenEl,
    activate: () => {
      renderBoardRollState({ enabled: true, rollBtn, diceEl });
      handlers.onActivate?.();
    },
    deactivate: () => handlers.onDeactivate?.(),
  };
}
