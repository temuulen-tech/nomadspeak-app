import { formatHHMMSS as formatDuration } from "./stats.js";

export function createAppTimerManager({
  storageKeys = {},
  stopActivityTimers = () => {},
  syncCoreStateReferences = () => {},
  getProgressState = () => ({}),
  replaceProgress = () => {},
  updateStreak = () => {},
  renderCoreStateSnapshot = () => {},
  getTodayKey = () => "",
  dom = {},
  rewardTabs = {},
}) {
  const { dailyTotalsKey, activeSessionKey } = storageKeys;
  let appTimeUiInterval = null;

  function safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function safeLocalStorageRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function previousDayKey(dayKey) {
    if (!dayKey) return "";
    const dt = new Date(`${dayKey}T00:00:00`);
    dt.setDate(dt.getDate() - 1);
    return getLocalDateKey(dt);
  }

  function getAppTimeDailyTotals() {
    try {
      const raw = localStorage.getItem(dailyTotalsKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function setAppTimeDailyTotals(nextTotals) {
    safeLocalStorageSet(dailyTotalsKey, JSON.stringify(nextTotals || {}));
  }

  function addSecondsToDate(dateKey, secondsToAdd) {
    if (!dateKey || !Number.isFinite(secondsToAdd) || secondsToAdd <= 0) return;
    const totals = getAppTimeDailyTotals();
    totals[dateKey] = Math.max(0, Math.floor(Number(totals[dateKey]) || 0) + Math.floor(secondsToAdd));
    setAppTimeDailyTotals(totals);
  }

  function splitAcrossMidnight(startMs, endMs) {
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return;
    let cursor = startMs;
    while (cursor < endMs) {
      const current = new Date(cursor);
      const dayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate());
      const nextMidnight = dayStart.getTime() + (24 * 60 * 60 * 1000);
      const segmentEnd = Math.min(endMs, nextMidnight);
      const seconds = Math.floor((segmentEnd - cursor) / 1000);
      if (seconds > 0) addSecondsToDate(getLocalDateKey(current), seconds);
      cursor = segmentEnd;
    }
  }

  function readActiveSession() {
    try {
      const raw = localStorage.getItem(activeSessionKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.screenId || !Number.isFinite(Number(parsed.startedAtEpochMs))) return null;
      return { screenId: parsed.screenId, startedAtEpochMs: Number(parsed.startedAtEpochMs) };
    } catch {
      return null;
    }
  }

  function writeActiveSession(session) {
    if (!session) return safeLocalStorageRemove(activeSessionKey);
    return safeLocalStorageSet(activeSessionKey, JSON.stringify(session));
  }

  function stopSession() {
    const active = readActiveSession();
    if (!active) return;
    splitAcrossMidnight(active.startedAtEpochMs, Date.now());
    writeActiveSession(null);
  }

  function startSession(screenId) {
    stopSession();
    if (!screenId) return;
    writeActiveSession({ screenId, startedAtEpochMs: Date.now() });
  }

  function ensureStoppedIfHidden() {
    if (document.hidden) stopSession();
  }

  function persistAllActiveTime() {
    stopActivityTimers();
    stopSession();
  }

  function getAggregates(now = new Date()) {
    const todayKey = getLocalDateKey(now);
    const yesterdayKey = previousDayKey(todayKey);
    const weekday = now.getDay();
    const mondayOffset = (weekday + 6) % 7;
    const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
    const startOfNextWeek = new Date(startOfThisWeek.getFullYear(), startOfThisWeek.getMonth(), startOfThisWeek.getDate() + 7);
    const startOfLastWeek = new Date(startOfThisWeek.getFullYear(), startOfThisWeek.getMonth(), startOfThisWeek.getDate() - 7);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const active = readActiveSession();
    if (active) {
      splitAcrossMidnight(active.startedAtEpochMs, Date.now());
      writeActiveSession({ screenId: active.screenId, startedAtEpochMs: Date.now() });
    }

    const totals = getAppTimeDailyTotals();
    const parseKeyDate = (key) => new Date(`${key}T00:00:00`);
    const sumRange = (start, end) => Object.entries(totals).reduce((sum, [key, value]) => {
      const date = parseKeyDate(key);
      if (date >= start && date < end) return sum + Math.max(0, Math.floor(Number(value) || 0));
      return sum;
    }, 0);

    return {
      today: Math.max(0, Math.floor(Number(totals[todayKey]) || 0)),
      yesterday: Math.max(0, Math.floor(Number(totals[yesterdayKey]) || 0)),
      thisWeek: sumRange(startOfThisWeek, startOfNextWeek),
      lastWeek: sumRange(startOfLastWeek, startOfThisWeek),
      thisMonth: sumRange(startOfThisMonth, startOfNextMonth),
      lastMonth: sumRange(startOfLastMonth, startOfThisMonth),
    };
  }

  function syncProgressForToday() {
    const today = getTodayKey();
    const aggregates = getAggregates(new Date());
    const dailyTotals = getAppTimeDailyTotals();
    const weeklyMinutes = Array.from({ length: 7 }, (_, index) => {
      const dt = new Date();
      dt.setDate(dt.getDate() - (6 - index));
      return Math.floor((Number(dailyTotals[getLocalDateKey(dt)]) || 0) / 60);
    });
    const progressState = getProgressState();
    const lastStatsDate = progressState.lastStatsDate || progressState.lastActiveDate;
    updateStreak({
      today,
      yesterday: previousDayKey(today),
      todayMinutes: Math.floor(aggregates.today / 60),
      weeklyMinutes,
      resetDaily: Boolean(lastStatsDate && lastStatsDate !== today),
    });
    syncCoreStateReferences();
  }

  function persistProgressState() {
    syncCoreStateReferences();
    const progressState = getProgressState();
    const weeklyMinutes = Array.isArray(progressState.weeklyMinutes) ? progressState.weeklyMinutes.slice() : [];
    if (weeklyMinutes.length) weeklyMinutes[weeklyMinutes.length - 1] = Math.max(0, Math.floor(progressState.todayMinutes || 0));
    replaceProgress({
      ...progressState,
      xpTotal: progressState.xp,
      streakDays: progressState.streak,
      level: Math.floor(progressState.xp / 100) + 1,
      weeklyMinutes,
    });
    syncCoreStateReferences();
  }

  function loadProgressState({ rehydrate = true, persistAfterSync = true } = {}) {
    if (rehydrate) {
      rewardTabs.loadCoreState?.({ persist: false });
      syncCoreStateReferences();
    }
    syncProgressForToday();
    if (persistAfterSync) persistProgressState();
  }

  function formatHHMMSS(totalSeconds) {
    return formatDuration(totalSeconds);
  }

  function refreshTimeSummaryUI() {
    const aggregates = getAggregates(new Date());
    const todayFormatted = formatHHMMSS(aggregates.today);
    dom.todayTimeEls?.forEach((el) => {
      el.textContent = todayFormatted;
    });

    if (dom.timeDetailsYesterdayEl) dom.timeDetailsYesterdayEl.textContent = formatHHMMSS(aggregates.yesterday);
    if (dom.timeDetailsThisWeekEl) dom.timeDetailsThisWeekEl.textContent = formatHHMMSS(aggregates.thisWeek);
    if (dom.timeDetailsLastWeekEl) dom.timeDetailsLastWeekEl.textContent = formatHHMMSS(aggregates.lastWeek);
    if (dom.timeDetailsThisMonthEl) dom.timeDetailsThisMonthEl.textContent = formatHHMMSS(aggregates.thisMonth);
    if (dom.timeDetailsLastMonthEl) dom.timeDetailsLastMonthEl.textContent = formatHHMMSS(aggregates.lastMonth);
    if (dom.statsTodayMinutesEl) dom.statsTodayMinutesEl.textContent = formatHHMMSS(aggregates.today);
    if (dom.statsThisWeekTimeEl) dom.statsThisWeekTimeEl.textContent = formatHHMMSS(aggregates.thisWeek);
    if (dom.statsLastWeekTimeEl) dom.statsLastWeekTimeEl.textContent = formatHHMMSS(aggregates.lastWeek);
    if (dom.statsThisMonthTimeEl) dom.statsThisMonthTimeEl.textContent = formatHHMMSS(aggregates.thisMonth);
    if (dom.statsLast7DaysEl) dom.statsLast7DaysEl.innerHTML = rewardTabs.buildLast7DaysTimeRows?.() || "";

    rewardTabs.updateGaugeUI?.(aggregates);
    rewardTabs.renderRewardsTab?.();
  }

  function startTimeUiUpdater() {
    if (appTimeUiInterval) clearInterval(appTimeUiInterval);
    appTimeUiInterval = setInterval(() => {
      if (readActiveSession()) refreshTimeSummaryUI();
    }, 1000);
  }

  function stopTimeUiUpdater() {
    if (!appTimeUiInterval) return;
    clearInterval(appTimeUiInterval);
    appTimeUiInterval = null;
  }

  function updateStatsUI() {
    syncCoreStateReferences();
    syncProgressForToday();
    rewardTabs.renderStatsSnapshot?.();
    persistProgressState();
  }

  function updateProfileUI() {
    syncCoreStateReferences();
    syncProgressForToday();
    rewardTabs.renderProfileSnapshot?.();
  }

  function updateHeaderStatus() {
    syncCoreStateReferences();
    syncProgressForToday();
  }

  return {
    addSecondsToDate,
    ensureStoppedIfHidden,
    formatHHMMSS,
    getAggregates,
    getAppTimeDailyTotals,
    getLocalDateKey,
    loadProgressState,
    persistAllActiveTime,
    persistProgressState,
    previousDayKey,
    readActiveSession,
    refreshTimeSummaryUI,
    startSession,
    startTimeUiUpdater,
    stopSession,
    stopTimeUiUpdater,
    syncProgressForToday,
    updateHeaderStatus,
    updateProfileUI,
    updateStatsUI,
  };
}
