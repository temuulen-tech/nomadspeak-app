/**
 * board-screen.js
 * Owns board gameplay screen interactions (dice, board scene hooks, board controls).
 */

import { renderBoardRollState } from "./render-board.js";
import { SCREEN_NAMES } from "./constants.js";
import { bindClickOnce, bindManagedEvent } from "./ui.js";
import { createScreenLifecycle } from "./screen-lifecycle.js";

export function initBoardScreen(handlers = {}) {
  const boardScreenEl = document.getElementById("board-game-screen");
  const rollBtn = document.getElementById("board-game-roll-btn");
  const diceEl = document.getElementById("board-game-dice");

  bindClickOnce(rollBtn, "board:roll-button", () => handlers.onRollDice?.());
  bindClickOnce(diceEl, "board:roll-dice", () => handlers.onRollDice?.());

  bindManagedEvent(window, "resize", "board:resize-visible", () => {
    if (!boardScreenEl || boardScreenEl.classList.contains("hidden")) return;
    handlers.onResizeWhileVisible?.();
  });

  return createScreenLifecycle({
    id: SCREEN_NAMES.BOARD,
    element: boardScreenEl,
    onEnter: () => {
      renderBoardRollState({ enabled: true, rollBtn, diceEl });
      handlers.onActivate?.();
    },
    onReenter: () => {
      renderBoardRollState({ enabled: true, rollBtn, diceEl });
      handlers.onActivate?.();
    },
    onLeave: () => handlers.onDeactivate?.(),
  });
}
