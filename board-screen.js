/**
 * board-screen.js
 * Owns board gameplay screen interactions (dice, board scene hooks, board controls).
 */

import { renderBoardRollState } from "./render-board.js";
import { SCREEN_NAMES } from "./constants.js";
import { getBoardEntryState } from "./state.js";
import { getWorldConfig } from "./worlds.js";
import { bindClickOnce, bindManagedEvent } from "./ui.js";
import { createScreenLifecycle } from "./screen-lifecycle.js";

export function initBoardScreen(handlers = {}) {
  const boardScreenEl = document.getElementById("board-game-screen");
  const resolveRollBtn = () => document.getElementById("board-game-roll-btn") || document.getElementById("board-game-dice");
  const resolveDiceEl = () => document.getElementById("board-game-dice");

  const syncBoardBackground = () => {
    if (!boardScreenEl) return;
    const selectedWorld = getWorldConfig(getBoardEntryState().worldId);
    const backgroundAsset = selectedWorld?.visualAssets?.background || null;
    boardScreenEl.style.setProperty("--board-world-bg-image", backgroundAsset?.path ? `url("${backgroundAsset.path}")` : "none");
    boardScreenEl.style.setProperty("--board-world-bg-position", backgroundAsset?.presentation?.objectPosition || "center 42%");
  };

  const wireControls = () => {
    const rollBtn = resolveRollBtn();
    const diceEl = resolveDiceEl();
    bindClickOnce(rollBtn, "board:roll-button", () => handlers.onRollDice?.());
    bindClickOnce(diceEl, "board:roll-dice", () => handlers.onRollDice?.());
    return { rollBtn, diceEl };
  };

  wireControls();

  bindManagedEvent(window, "resize", "board:resize-visible", () => {
    if (!boardScreenEl || boardScreenEl.classList.contains("hidden")) return;
    handlers.onResizeWhileVisible?.();
  });

  return createScreenLifecycle({
    id: SCREEN_NAMES.BOARD,
    element: boardScreenEl,
    onEnter: () => {
      const { rollBtn, diceEl } = wireControls();
      syncBoardBackground();
      renderBoardRollState({ enabled: true, rollBtn, diceEl });
      handlers.onActivate?.();
    },
    onReenter: () => {
      const { rollBtn, diceEl } = wireControls();
      syncBoardBackground();
      renderBoardRollState({ enabled: true, rollBtn, diceEl });
      handlers.onActivate?.();
    },
    onLeave: () => handlers.onDeactivate?.(),
  });
}
