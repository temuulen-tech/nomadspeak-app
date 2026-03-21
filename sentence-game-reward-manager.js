export function createSentenceGameRewardManager({
  storageKeys,
  rewardThresholds = [],
  rewardBanners = [],
  idleTimeoutSeconds = 0,
  dom = {},
  state = {},
  actions = {},
}) {
  const {
    activeSecondsKey,
    rewardLevelKey,
    lastTickKey,
  } = storageKeys || {};

  let rewardBannerTimer = null;
  let activeTimer = null;

  function getRewardLevelFromSeconds(seconds = 0) {
    let level = 0;
    rewardThresholds.forEach((threshold, index) => {
      if (seconds >= threshold) level = index + 1;
    });
    return level;
  }

  function persistState() {
    try {
      const storedActiveRaw = Number(localStorage.getItem(activeSecondsKey));
      const storedRewardRaw = Number(localStorage.getItem(rewardLevelKey));
      const storedTickRaw = Number(localStorage.getItem(lastTickKey));
      const safeActiveSeconds = Math.max(0, Math.floor(state.getActiveSeconds?.() || 0));
      const safeRewardLevel = Math.max(0, Math.min(5, Math.floor(state.getRewardLevel?.() || 0)));
      const safeLastTick = state.getLastTick?.() || Date.now();

      localStorage.setItem(activeSecondsKey, String(Math.max(Number.isFinite(storedActiveRaw) ? Math.floor(storedActiveRaw) : 0, safeActiveSeconds)));
      localStorage.setItem(rewardLevelKey, String(Math.max(Number.isFinite(storedRewardRaw) ? Math.floor(storedRewardRaw) : 0, safeRewardLevel)));
      localStorage.setItem(lastTickKey, String(Math.max(Number.isFinite(storedTickRaw) ? storedTickRaw : 0, safeLastTick)));
    } catch {
      // noop
    }
  }

  function loadState() {
    try {
      const activeRaw = Number(localStorage.getItem(activeSecondsKey));
      const rewardRaw = Number(localStorage.getItem(rewardLevelKey));
      const tickRaw = Number(localStorage.getItem(lastTickKey));

      state.setActiveSeconds?.(Number.isFinite(activeRaw) ? Math.max(0, Math.floor(activeRaw)) : 0);
      state.setRewardLevel?.(Number.isFinite(rewardRaw) ? Math.max(0, Math.min(5, Math.floor(rewardRaw))) : 0);
      state.setLastTick?.(Number.isFinite(tickRaw) ? tickRaw : Date.now());
    } catch {
      state.setActiveSeconds?.(0);
      state.setRewardLevel?.(0);
      state.setLastTick?.(Date.now());
    }

    const computedLevel = getRewardLevelFromSeconds(state.getActiveSeconds?.() || 0);
    state.setRewardLevel?.(Math.max(state.getRewardLevel?.() || 0, computedLevel));
  }

  function reconcileRewardTierProgress() {
    actions.loadProgressState?.({ rehydrate: false });
    const progressState = actions.getProgressState?.() || {};
    const derivedRewardTier = Math.max(progressState.rewardTierUnlocked || 1, state.getRewardLevel?.() || 0);
    if (derivedRewardTier <= (progressState.rewardTierUnlocked || 1)) return false;

    actions.applyProgressPatch?.((progress) => {
      progress.rewardTierUnlocked = Math.max(progress.rewardTierUnlocked || 1, derivedRewardTier);
    }, "progress");
    actions.syncCoreStateReferences?.();
    actions.persistProgressState?.();
    return true;
  }

  function renderRewardState() {
    dom.rewardImageEls?.forEach((imgEl) => {
      const level = Number(imgEl.dataset.level || 0);
      const rewardLevel = state.getRewardLevel?.() || 0;
      const active = level > 0 && level === rewardLevel;
      const unlocked = level > 0 && level <= rewardLevel;
      const tileEl = imgEl.closest(".reward-tile");
      if (tileEl) {
        tileEl.classList.toggle("is-active", active);
        tileEl.classList.toggle("is-unlocked", unlocked);
        tileEl.classList.toggle("is-locked", !unlocked);
      }
      imgEl.classList.toggle("active", active);
      imgEl.classList.toggle("is-active", active);
      imgEl.classList.toggle("is-unlocked", unlocked);
      imgEl.classList.toggle("is-locked", !unlocked);
    });
  }

  function playUnlockChime(level) {
    if (!actions.isSoundEnabled?.()) return;
    const patterns = {
      1: [660, 792, 990],
      2: [740, 932, 1175],
      3: [784, 988, 1319],
      4: [880, 1109, 1480],
      5: [988, 1319, 1760],
    };
    (patterns[level] || patterns[1]).forEach((frequency, index) => {
      setTimeout(() => {
        actions.playTone?.({ frequency, type: "triangle", duration: 0.09, volume: 0.12, attack: 0.005, release: 0.09 });
      }, index * 86);
    });
  }

  function showRewardBanner(level) {
    if (!dom.rewardBannerEl || level < 1 || level > 5) return;

    if (rewardBannerTimer) {
      clearTimeout(rewardBannerTimer);
      rewardBannerTimer = null;
    }

    dom.rewardBannerEl.textContent = rewardBanners[level - 1];
    dom.rewardBannerEl.classList.remove("hidden", "hide", "show");
    void dom.rewardBannerEl.offsetWidth;
    dom.rewardBannerEl.classList.add("show");

    rewardBannerTimer = setTimeout(() => {
      dom.rewardBannerEl.classList.remove("show");
      dom.rewardBannerEl.classList.add("hide");
      setTimeout(() => {
        dom.rewardBannerEl.classList.add("hidden");
        dom.rewardBannerEl.classList.remove("hide");
      }, 280);
    }, 4300);

    playUnlockChime(level);
  }

  function updateRewardLevel({ allowBanner = false } = {}) {
    const nextLevel = getRewardLevelFromSeconds(state.getActiveSeconds?.() || 0);
    if (nextLevel > (state.getRewardLevel?.() || 0)) {
      state.setRewardLevel?.(nextLevel);
      renderRewardState();
      persistState();
      if (allowBanner) showRewardBanner(nextLevel);
      return;
    }

    state.setRewardLevel?.(Math.max(state.getRewardLevel?.() || 0, nextLevel));
    renderRewardState();
  }

  function flushActiveTimeTick() {
    const lastActivityAt = state.getLastActivityAt?.() || 0;
    if (!lastActivityAt) return false;

    const now = Date.now();
    const elapsedSinceActivity = Math.floor((now - lastActivityAt) / 1000);
    const activeSeconds = Math.max(0, Math.min(idleTimeoutSeconds, elapsedSinceActivity));
    const tickBase = state.getLastTick?.() || lastActivityAt;
    const elapsedFromTick = Math.max(0, Math.floor((now - tickBase) / 1000));
    const addSeconds = Math.min(activeSeconds, elapsedFromTick);

    if (addSeconds <= 0) return false;

    state.setActiveSeconds?.((state.getActiveSeconds?.() || 0) + addSeconds);
    state.setLastTick?.(now);

    actions.loadProgressState?.();
    actions.syncProgressForToday?.();
    actions.applyProgressPatch?.((progress) => {
      progress.todaySecondsRemainder = (progress.todaySecondsRemainder || 0) + addSeconds;
      if (progress.todaySecondsRemainder >= 60) {
        const gainedMinutes = Math.floor(progress.todaySecondsRemainder / 60);
        progress.todayMinutes += gainedMinutes;
        progress.todaySecondsRemainder = progress.todaySecondsRemainder % 60;
      }
      progress.rewardTierUnlocked = Math.max(progress.rewardTierUnlocked || 1, getRewardLevelFromSeconds(state.getActiveSeconds?.() || 0) || 1);
      progress.lastStatsDate = actions.getTodayKey?.();
    }, "progress");
    actions.syncCoreStateReferences?.();

    updateRewardLevel({ allowBanner: true });
    persistState();
    renderRewardState();
    actions.updateHeaderStatus?.();
    if (actions.isStatsVisible?.()) actions.updateStatsUI?.();
    return true;
  }

  function startActiveTimer() {
    if (activeTimer) return;
    activeTimer = setInterval(() => {
      flushActiveTimeTick();
    }, 1000);
  }

  function stopActiveTimer() {
    if (!activeTimer) return;
    clearInterval(activeTimer);
    activeTimer = null;
  }

  function markActivity() {
    if (!actions.isSentenceGameVisible?.()) return;
    flushActiveTimeTick();
    const now = Date.now();
    state.setLastActivityAt?.(now);
    state.setLastTick?.(now);
    persistState();
  }

  function beginSession() {
    const now = Date.now();
    state.setLastActivityAt?.(now);
    state.setLastTick?.(now);
    renderRewardState();
    startActiveTimer();
    persistState();
  }

  function endSession() {
    flushActiveTimeTick();
    stopActiveTimer();
    state.setLastTick?.(Date.now());
    persistState();
  }

  return {
    beginSession,
    endSession,
    flushActiveTimeTick,
    getRewardLevelFromSeconds,
    loadState,
    markActivity,
    persistState,
    reconcileRewardTierProgress,
    renderRewardState,
    updateRewardLevel,
  };
}
