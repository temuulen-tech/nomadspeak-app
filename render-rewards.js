/**
 * render-rewards.js
 * Renders and updates only reward UI strips/bars/chips across lesson, sentence, and QA screens.
 */

export function renderRewards({ rewardBarEl, rewardImageEls, unlockedRewards, totalSteps } = {}) {
  if (!rewardBarEl || !rewardImageEls) return;
  const activeLevel = Math.min(unlockedRewards + 1, totalSteps);

  rewardImageEls().forEach((imgEl) => {
    const level = Number(imgEl.dataset.level || 0);
    const unlocked = level > 0 && level <= unlockedRewards;
    const active = level > 0 && level === activeLevel;
    const tileEl = imgEl.closest(".reward-tile");

    if (tileEl) {
      tileEl.classList.toggle("is-unlocked", unlocked);
      tileEl.classList.toggle("is-locked", !unlocked);
      tileEl.classList.toggle("is-active", active);
    }

    imgEl.classList.toggle("is-unlocked", unlocked);
    imgEl.classList.toggle("is-locked", !unlocked);
    imgEl.classList.toggle("active", active);
    imgEl.classList.toggle("is-active", active);
  });
}

export function renderRewardStripTiles({ containerEl, rewards = [], unlockedRewards = 0 } = {}) {
  if (!containerEl) return;
  const activeLevel = Math.min(unlockedRewards + 1, rewards.length);
  containerEl.innerHTML = rewards.map((reward, index) => {
    const level = index + 1;
    const unlocked = level <= unlockedRewards;
    const active = level === activeLevel;
    return `
      <article class="reward-tile ${unlocked ? "is-unlocked" : "is-locked"} ${active ? "is-active" : ""}" data-reward-index="${index}" data-level="${level}">
        <p class="reward-label-chip">${reward.label}</p>
        <img class="reward-img" src="${reward.image}" alt="${reward.alt}" loading="lazy" />
      </article>
    `;
  }).join("");
}
