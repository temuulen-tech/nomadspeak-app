/**
 * render-rewards.js
 * Renders and updates only reward UI strips/bars/chips across lesson, sentence, and QA screens.
 */

function getVisibleRewardLevel({ unlockedRewards = 0, totalSteps = 0 } = {}) {
  if (!Number.isFinite(totalSteps) || totalSteps <= 0) return 0;
  const safeUnlockedRewards = Number.isFinite(unlockedRewards) ? Math.max(0, Math.floor(unlockedRewards)) : 0;
  return Math.min(Math.max(safeUnlockedRewards, 1), totalSteps);
}

function setRewardTileVisibility({ tileEl, visible = false } = {}) {
  if (!tileEl) return;
  tileEl.hidden = !visible;
  tileEl.classList.toggle("is-visible", visible);
}

export function renderRewards({ rewardBarEl, rewardImageEls, unlockedRewards, totalSteps } = {}) {
  if (!rewardBarEl || !rewardImageEls) return;
  const visibleLevel = getVisibleRewardLevel({ unlockedRewards, totalSteps });
  const nextLevel = Math.min((Number.isFinite(unlockedRewards) ? unlockedRewards : 0) + 1, totalSteps);

  rewardBarEl.dataset.visibleRewardLevel = String(visibleLevel || 0);
  rewardBarEl.dataset.nextRewardLevel = String(nextLevel || 0);
  rewardBarEl.classList.add("reward-row--single");

  rewardImageEls().forEach((imgEl) => {
    const level = Number(imgEl.dataset.level || imgEl.closest(".reward-tile")?.dataset.level || 0);
    const unlocked = level > 0 && level <= unlockedRewards;
    const active = level > 0 && level === nextLevel;
    const visible = level > 0 && level === visibleLevel;
    const tileEl = imgEl.closest(".reward-tile");

    if (tileEl) {
      tileEl.classList.toggle("is-unlocked", unlocked);
      tileEl.classList.toggle("is-locked", !unlocked);
      tileEl.classList.toggle("is-active", active);
      setRewardTileVisibility({ tileEl, visible });
    }

    imgEl.classList.toggle("is-unlocked", unlocked);
    imgEl.classList.toggle("is-locked", !unlocked);
    imgEl.classList.toggle("active", active);
    imgEl.classList.toggle("is-active", active);
  });
}

export function renderRewardStripTiles({ containerEl, rewards = [], unlockedRewards = 0 } = {}) {
  if (!containerEl) return;
  const visibleLevel = getVisibleRewardLevel({ unlockedRewards, totalSteps: rewards.length });
  const reward = rewards[visibleLevel - 1];
  const nextLevel = Math.min((Number.isFinite(unlockedRewards) ? unlockedRewards : 0) + 1, rewards.length);

  containerEl.classList.add("reward-row--single");
  containerEl.dataset.visibleRewardLevel = String(visibleLevel || 0);
  containerEl.dataset.nextRewardLevel = String(nextLevel || 0);

  if (!reward) {
    containerEl.innerHTML = "";
    return;
  }

  const unlocked = visibleLevel <= unlockedRewards;
  const active = visibleLevel === nextLevel;

  containerEl.innerHTML = `
    <article class="reward-tile reward-tile--single ${unlocked ? "is-unlocked" : "is-locked"} ${active ? "is-active" : ""} is-visible" data-reward-index="${visibleLevel - 1}" data-level="${visibleLevel}">
      <p class="reward-label-chip">${reward.label}</p>
      <img class="reward-img" src="${reward.image}" alt="${reward.alt}" loading="lazy" />
    </article>
  `;
}

export function hydrateRewardImagesByLevel({ imageEls, rewardIcons } = {}) {
  imageEls?.forEach((imgEl) => {
    const level = Number(imgEl.dataset.level);
    if (!Number.isFinite(level) || level < 1 || level > rewardIcons.length) return;
    imgEl.src = rewardIcons[level - 1];
  });
}

export function hydrateRewardStripImages({ imageEls, rewardIcons } = {}) {
  imageEls?.forEach((imgEl, index) => {
    if (index >= rewardIcons.length) return;
    imgEl.src = rewardIcons[index];
  });
}
