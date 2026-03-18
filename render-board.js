/**
 * render-board.js
 * Renders and updates only board gameplay UI (board tiles, token/dice visuals, board panels, feedback DOM).
 */

import { setDisabledState, toggleClass } from "./ui.js";

export function renderBoardScreen({
  tiles = [],
  currentTile = 1,
  tileEmoji,
  tokenEl,
  boardEl,
  tokenStepClass,
  tokenStepDuration,
  animate,
} = {}) {
  if (!boardEl) return;
  boardEl.innerHTML = tiles.map((tile) => (
    `<button class="board-game-tile tile-type-${tile.tileType}" data-tile="${tile.tileNumber}" type="button"><span>${tile.tileNumber}</span><small>${tileEmoji ? tileEmoji(tile.tileType) : "·"}</small></button>`
  )).join("");

  updateBoardToken({ boardEl, tokenEl, currentTile, tokenStepClass, tokenStepDuration, animate });
}

export function updateBoardToken({ boardEl, tokenEl, currentTile, tokenStepClass, tokenStepDuration, animate } = {}) {
  if (!boardEl || !tokenEl) return;
  const activeTile = boardEl.querySelector(`[data-tile="${currentTile}"]`);
  if (!activeTile) return;

  const boardRect = boardEl.getBoundingClientRect();
  const tileRect = activeTile.getBoundingClientRect();
  tokenEl.style.left = `${tileRect.left - boardRect.left + (tileRect.width / 2)}px`;
  tokenEl.style.top = `${tileRect.top - boardRect.top + (tileRect.height / 2)}px`;

  boardEl.querySelectorAll(".board-game-tile").forEach((tileEl) => {
    const tileNumber = Number(tileEl.dataset.tile || 0);
    const isActive = tileNumber === currentTile;
    toggleClass(tileEl, "active", isActive);
    toggleClass(tileEl, "gf-tile-pulse", isActive);
  });

  if (animate && tokenStepClass) animate(tokenEl, tokenStepClass, tokenStepDuration || 600);
}

export function renderBoardChapterPanel({ chapter, titleEl, textEl, indexEl, storyPanelEl, animate } = {}) {
  if (!chapter) return;
  if (titleEl) titleEl.textContent = chapter.title;
  if (textEl) textEl.textContent = chapter.story;
  if (indexEl) indexEl.textContent = String(chapter.index);
  if (animate && storyPanelEl) animate(storyPanelEl, "gf-story-panel-in", 420);
}

export function renderBoardMeta({
  currentTile,
  totalTiles,
  lastRoll,
  feedback,
  xp,
  coins,
  positionEl,
  totalTilesEl,
  lastRollEl,
  feedbackEl,
  xpEl,
  coinsEl,
} = {}) {
  if (positionEl) positionEl.textContent = String(currentTile);
  if (totalTilesEl) totalTilesEl.textContent = String(totalTiles);
  if (lastRollEl) lastRollEl.textContent = lastRoll === null ? "-" : String(lastRoll);
  if (feedbackEl) feedbackEl.textContent = feedback || "";
  if (xpEl) xpEl.textContent = String(xp);
  if (coinsEl) coinsEl.textContent = String(coins);
}

export function renderBoardRollState({ enabled, rollBtn, diceEl } = {}) {
  setDisabledState(rollBtn, !enabled);
  setDisabledState(diceEl, !enabled);
}

export function renderBoardChallenge({ challenge, titleEl, textEl, optionsEl, panelEl, onSelectOption } = {}) {
  if (titleEl) {
    titleEl.textContent = challenge
      ? `Монгол өгүүлбэр · ${challenge.promptMn}`
      : "Энэ нүдэнд сорил алга. Үргэлжлүүлэхийн тулд дахин шоо шиднэ үү.";
  }

  if (textEl) {
    textEl.textContent = challenge
      ? `Хамгийн зөв англи хариултыг сонгоно уу (${challenge.tip}).`
      : "Өгүүлэмж, шагнал, торгууль, шалган нэвтрэх нүдний нөлөө автоматаар хэрэгжинэ.";
  }

  toggleClass(panelEl, "show", Boolean(challenge));
  if (!optionsEl) return;

  optionsEl.innerHTML = "";
  if (!challenge) return;

  challenge.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary board-game-option-btn";
    btn.textContent = option;
    btn.addEventListener("click", () => onSelectOption?.(option));
    optionsEl.appendChild(btn);
  });
}

export function renderBoardFeedbackVisual({ feedbackEl, type, animate } = {}) {
  if (!feedbackEl) return;
  feedbackEl.dataset.type = type;
  if (animate) animate(feedbackEl, type === "penalty" ? "gf-feedback-penalty" : "gf-feedback-success", 500);
}

export function renderBoardPopup({ hubEl, type, text } = {}) {
  if (!hubEl) return;
  const chip = document.createElement("div");
  chip.className = `board-popup board-popup-${type}`;
  chip.textContent = text;
  hubEl.appendChild(chip);
  requestAnimationFrame(() => chip.classList.add("show"));
  setTimeout(() => {
    chip.classList.remove("show");
    setTimeout(() => chip.remove(), 280);
  }, 1800);
}
