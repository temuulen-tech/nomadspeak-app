import { ASSETS } from "./assets.js";
import { DIFFICULTY_LEVELS, REWARD_TABS, STATS_PERIODS } from "./constants.js";
import { renderRewards, renderRewardStripTiles } from "./render-rewards.js";

const statsRewardDefs = [
  { tier: 1, image: ASSETS.rewardIcons.flag, threshold: "20:00+", label: "Муу", alt: "Туг шагнал" },
  { tier: 2, image: ASSETS.rewardIcons.star, threshold: "30:00+", label: "Дунд", alt: "Од шагнал" },
  { tier: 3, image: ASSETS.rewardIcons.coin, threshold: "60:00+", label: "Хэвийн", alt: "Зоос шагнал" },
  { tier: 4, image: ASSETS.rewardIcons.trophy, threshold: "90:00+", label: "Сайн", alt: "Цом шагнал" },
  { tier: 5, image: ASSETS.rewardIcons.diamond, threshold: "120:00+", label: "Онц сайн", alt: "Эрдэнэ шагнал" },
];

function getGaugeTierBySeconds(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  if (safeSeconds >= 120 * 60) return { label: "Онц сайн", index: 4 };
  if (safeSeconds >= 60 * 60) return { label: "Сайн", index: 3 };
  if (safeSeconds >= 30 * 60) return { label: "Хэвийн", index: 2 };
  if (safeSeconds >= 20 * 60) return { label: "Дунд", index: 1 };
  return { label: "Муу", index: 0 };
}

function getGaugeTierByPercent(percent) {
  const safePercent = Math.max(0, Number(percent) || 0);
  if (safePercent >= 100) return { label: "Онц сайн", index: 4 };
  if (safePercent >= 75) return { label: "Сайн", index: 3 };
  if (safePercent >= 50) return { label: "Хэвийн", index: 2 };
  if (safePercent >= 25) return { label: "Дунд", index: 1 };
  return { label: "Муу", index: 0 };
}

function rewardTierForDailySeconds(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (safeSeconds >= 120 * 60) return 5;
  if (safeSeconds >= 90 * 60) return 4;
  if (safeSeconds >= 60 * 60) return 3;
  if (safeSeconds >= 30 * 60) return 2;
  if (safeSeconds >= 20 * 60) return 1;
  return 0;
}

function rewardTierByPercent(percent) {
  return getGaugeTierByPercent(percent).index + 1;
}

function getPercentRatingLabel(percent) {
  return getGaugeTierByPercent(percent).label;
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map((n) => Number(n));
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function getDailyRatingLabel(seconds) {
  if (seconds >= 120 * 60) return "Онц сайн";
  if (seconds >= 60 * 60) return "Сайн";
  if (seconds >= 30 * 60) return "Хэвийн";
  if (seconds >= 20 * 60) return "Дунд";
  return "Муу";
}

function buildRewardCard({ title, subtitle, tier, thresholdText, tierLabel, range, ratingLabel, cardClass = "", imageClass = "" }) {
  const reward = statsRewardDefs[Math.max(0, Math.min(4, (tier || 1) - 1))];
  const titleMarkup = title ? `<p class="stats-reward-title chip-label">${title}</p>` : "";
  const rangeMarkup = range ? `<p class="stats-reward-range chip-label">${range}</p>` : "";
  const subtitleMarkup = subtitle ? `<p class="stats-reward-subtitle chip-label">${subtitle}</p>` : "";
  const tierMarkup = tierLabel ? `<p class="stats-reward-tier chip-label">${tierLabel}</p>` : "";
  const thresholdMarkup = thresholdText ? `<p class="stats-reward-threshold chip-label">${thresholdText}</p>` : "";
  const ratingMarkup = ratingLabel ? `<p class="stats-reward-rating chip-label">${ratingLabel}</p>` : "";
  const cardClasses = ["stats-reward-card", cardClass].filter(Boolean).join(" ");
  const imageClasses = ["stats-reward-img", imageClass].filter(Boolean).join(" ");
  return `<article class="${cardClasses}"><div class="stats-reward-main"><div class="stats-reward-left">${titleMarkup}${rangeMarkup}${subtitleMarkup}</div><div class="stats-reward-right">${thresholdMarkup}${ratingMarkup}${tierMarkup}</div></div><img class="${imageClasses}" src="${reward.image}" alt="${reward.alt}" loading="lazy" /></article>`;
}

function getTotalsEntries(getAppTimeDailyTotals) {
  const totals = getAppTimeDailyTotals();
  return Object.entries(totals).map(([key, value]) => ({
    key,
    date: parseDateKey(key),
    seconds: Math.max(0, Math.floor(Number(value) || 0)),
  })).filter((item) => item.date instanceof Date && !Number.isNaN(item.date.getTime()));
}

function getMonthTotalSeconds(monthIndex, year, getAppTimeDailyTotals) {
  return getTotalsEntries(getAppTimeDailyTotals).reduce((sum, item) => {
    if (item.date.getFullYear() === year && item.date.getMonth() === monthIndex) return sum + item.seconds;
    return sum;
  }, 0);
}

function getYearTotalSeconds(year, getAppTimeDailyTotals) {
  return getTotalsEntries(getAppTimeDailyTotals).reduce((sum, item) => item.date.getFullYear() === year ? sum + item.seconds : sum, 0);
}

function getWeekBucketsForMonth(monthIndex, year, { getAppTimeDailyTotals, getLocalDateKey }) {
  const totals = getAppTimeDailyTotals();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const buckets = [];
  for (let startDay = 1; startDay <= daysInMonth; startDay += 7) {
    const endDay = Math.min(daysInMonth, startDay + 6);
    const startDate = new Date(year, monthIndex, startDay);
    const endDate = new Date(year, monthIndex, endDay);
    let seconds = 0;
    for (let d = startDay; d <= endDay; d += 1) {
      const key = getLocalDateKey(new Date(year, monthIndex, d));
      seconds += Math.max(0, Math.floor(Number(totals[key]) || 0));
    }
    buckets.push({
      index: buckets.length + 1,
      seconds,
      range: `${startDate.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" })}–${endDate.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" })}`,
    });
  }
  return buckets;
}

export function buildLast7DaysTimeRows({ getAppTimeDailyTotals, getLocalDateKey, formatHHMMSS }) {
  const totals = getAppTimeDailyTotals();
  return Array.from({ length: 7 }, (_, index) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - index);
    const key = getLocalDateKey(dt);
    const label = dt.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" });
    return `<li><span class="chip-label">${label}</span><strong class="chip-time">${formatHHMMSS(totals[key] || 0)}</strong></li>`;
  }).reverse().join("");
}


export function createCompletionBannerController({
  completionBannerEl = null,
  completionBannerTextEl = null,
  appSettings = () => ({}),
  speakText = () => {},
  playTone = () => {},
  defaultText = "",
  dailyGoalText = "",
}) {
  let completionBannerTimer = null;

  const resolvedDefaultText = String(defaultText || completionBannerTextEl?.textContent || "").trim();
  const resolvedDailyGoalText = String(dailyGoalText || resolvedDefaultText).trim();

  function clearEffects() {
    if (!completionBannerEl) return;
    const effectsLayer = completionBannerEl.querySelector(".banner-effects");
    if (effectsLayer) effectsLayer.innerHTML = "";
  }

  function createParticle(layer, className, color, x, y, vars = {}) {
    const particle = document.createElement("span");
    particle.className = className;
    particle.style.setProperty("--particle-color", color);
    particle.style.setProperty("--x", `${x}px`);
    particle.style.setProperty("--y", `${y}px`);
    Object.entries(vars).forEach(([key, value]) => {
      particle.style.setProperty(key, value);
    });
    layer.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }

  function spawnBannerStars() {
    if (!completionBannerEl) return;
    const effectsLayer = completionBannerEl.querySelector(".banner-effects");
    if (!effectsLayer) return;

    const colors = ["#ff4f57", "#ffd54d", "#76ff8b", "#ffffff", "#ffd54d", "#ffffff"];
    const width = completionBannerEl.clientWidth;
    const height = completionBannerEl.clientHeight;

    const edgePoint = () => {
      const side = Math.floor(Math.random() * 4);
      const inset = 10;
      if (side === 0) return { x: inset + Math.random() * Math.max(10, width - inset * 2), y: 0, nx: 0, ny: -1 };
      if (side === 1) return { x: width, y: inset + Math.random() * Math.max(10, height - inset * 2), nx: 1, ny: 0 };
      if (side === 2) return { x: inset + Math.random() * Math.max(10, width - inset * 2), y: height, nx: 0, ny: 1 };
      return { x: 0, y: inset + Math.random() * Math.max(10, height - inset * 2), nx: -1, ny: 0 };
    };

    for (let i = 0; i < 30; i += 1) {
      const origin = edgePoint();
      const spread = (Math.random() - 0.5) * 0.8;
      const tangentX = -origin.ny;
      const tangentY = origin.nx;
      const burst = 16 + Math.random() * 20;
      const drift = (Math.random() - 0.5) * 8;
      const duration = 780 + Math.random() * 620;

      createParticle(effectsLayer, "banner-star", colors[i % colors.length], origin.x, origin.y, {
        "--dx": `${origin.nx * burst + tangentX * spread * 14 + drift}px`,
        "--dy": `${origin.ny * burst + tangentY * spread * 14 + drift}px`,
        "--size": `${3 + Math.random() * 3}px`,
        "--duration": `${duration}ms`,
      });
    }
  }

  function spawnDailyGoalEffects() {
    if (!completionBannerEl) return;
    const effectsLayer = completionBannerEl.querySelector(".banner-effects");
    if (!effectsLayer) return;

    const confettiColors = ["#f8e083", "#f7c944", "#ffeb99", "#f5d878"];
    const width = completionBannerEl.clientWidth;

    for (let i = 0; i < 36; i += 1) {
      createParticle(effectsLayer, "banner-confetti", confettiColors[i % confettiColors.length], 12 + Math.random() * (width - 24), -10, {
        "--drift": `${(Math.random() * 2 - 1) * 40}px`,
        "--fall": `${34 + Math.random() * 46}px`,
        "--delay": `${Math.random() * 200}ms`,
      });
    }

    const shine = document.createElement("span");
    shine.className = "banner-shine";
    effectsLayer.appendChild(shine);
    shine.addEventListener("animationend", () => shine.remove(), { once: true });
  }

  function playCompletionBannerSound() {
    if (!appSettings().soundEnabled) return;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      setTimeout(() => {
        playTone({
          frequency,
          type: "sine",
          duration: 0.11,
          volume: 0.08,
          attack: 0.01,
          release: 0.1,
        });
      }, index * 120);
    });
  }

  function playDailyVictoryChime() {
    if (!appSettings().soundEnabled) return;
    [587.33, 783.99, 987.77, 1174.66].forEach((frequency, index) => {
      setTimeout(() => {
        playTone({
          frequency,
          type: "triangle",
          duration: 0.1,
          volume: 0.05,
          attack: 0.005,
          release: 0.11,
        });
      }, index * 130);
    });
  }

  return {
    show(showDailyGoalUpgrade = false) {
      if (!completionBannerEl) return;

      const bannerText = showDailyGoalUpgrade ? resolvedDailyGoalText : resolvedDefaultText;
      if (completionBannerTextEl) completionBannerTextEl.textContent = bannerText;
      completionBannerEl.classList.toggle("premium", showDailyGoalUpgrade);
      completionBannerEl.classList.remove("hidden", "showing");
      void completionBannerEl.offsetWidth;
      completionBannerEl.classList.add("showing");
      clearEffects();
      spawnBannerStars();
      if (showDailyGoalUpgrade) spawnDailyGoalEffects();
      speakText(bannerText);

      if (showDailyGoalUpgrade) playDailyVictoryChime();
      else playCompletionBannerSound();

      if (completionBannerTimer) clearTimeout(completionBannerTimer);
      completionBannerTimer = setTimeout(() => {
        completionBannerEl.classList.remove("showing");
        clearEffects();
        setTimeout(() => {
          completionBannerEl.classList.add("hidden");
          completionBannerEl.classList.remove("premium");
          if (completionBannerTextEl) completionBannerTextEl.textContent = resolvedDefaultText;
        }, 450);
      }, 10000);
    },
  };
}

export function createProgressUi(deps) {
  const {
    getProgressState,
    getAppTimeDailyTotals,
    getLocalDateKey,
    formatHHMMSS,
    refreshTimeSummaryUI,
    getStatsSelectedPeriod,
    getStatsRewardTab,
    dom,
  } = deps;

  function renderProfileSnapshot() {
    const progressState = getProgressState();
    if (dom.profileNameInput) dom.profileNameInput.value = deps.getProfileName();
    if (dom.profileNameSaved) dom.profileNameSaved.textContent = `Хадгалагдсан нэр: ${deps.getProfileName() || "—"}`;
    if (dom.profileTotalXpEl) dom.profileTotalXpEl.textContent = String(progressState.xp);
    if (dom.profileLevelEl) dom.profileLevelEl.textContent = String(progressState.level);
    if (dom.profileStreakDaysEl) dom.profileStreakDaysEl.textContent = `${progressState.streak} өдөр`;
    if (dom.profileDailyProgressEl) dom.profileDailyProgressEl.textContent = `${progressState.todayCount}/${progressState.dailyGoalCount}`;
    if (dom.profileRewardStageEl) dom.profileRewardStageEl.textContent = `Tier ${progressState.rewardTierUnlocked}`;
    if (dom.profilePlanStatusEl) dom.profilePlanStatusEl.textContent = `Төлөв: ${deps.isPremium() ? "Дээд багц" : "Үнэгүй"}`;
  }

  function updateGaugeUI(aggregates, now = new Date()) {
    if (!dom.statsThermometerFillEl || !dom.statsThermometerTierEl || !dom.statsKpiLabelEl || !dom.statsKpiValueEl || !dom.statsKpiNormEl || !dom.statsKpiPercentEl) return;
    const yearDays = ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || (now.getFullYear() % 400 === 0)) ? 366 : 365;
    const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    let periodLabel = "Өнөөдөр";
    let seconds = aggregates.today;
    let normSeconds = 90 * 60;
    const selectedPeriod = getStatsSelectedPeriod();

    if (selectedPeriod === STATS_PERIODS.WEEK) {
      periodLabel = "Энэ 7 хоног";
      seconds = aggregates.thisWeek;
      normSeconds = 90 * 60 * 7;
    } else if (selectedPeriod === STATS_PERIODS.MONTH) {
      periodLabel = "Энэ сар";
      seconds = aggregates.thisMonth;
      normSeconds = 90 * 60 * monthDays;
    } else if (selectedPeriod === "year") {
      periodLabel = "Энэ жил";
      const totals = getAppTimeDailyTotals();
      const yearPrefix = `${now.getFullYear()}-`;
      seconds = Object.entries(totals).reduce((sum, [key, val]) => key.startsWith(yearPrefix) ? sum + Math.max(0, Math.floor(Number(val) || 0)) : sum, 0);
      normSeconds = 90 * 60 * yearDays;
    }

    const percent = normSeconds > 0 ? (seconds / normSeconds) * 100 : 0;
    const normalized = Math.min(1, Math.max(0, percent / 100));
    const tier = selectedPeriod === STATS_PERIODS.DAY ? getGaugeTierBySeconds(seconds) : getGaugeTierByPercent(percent);
    const fillPercent = Math.max(8, Math.round(normalized * 100));

    dom.statsKpiLabelEl.textContent = periodLabel;
    dom.statsKpiValueEl.textContent = formatHHMMSS(seconds);
    dom.statsKpiNormEl.textContent = formatHHMMSS(normSeconds);
    dom.statsKpiPercentEl.textContent = `${percent.toFixed(1)}%`;
    dom.statsThermometerFillEl.style.height = `${fillPercent}%`;
    if (dom.statsThermometerMarkerEl) dom.statsThermometerMarkerEl.style.bottom = `${fillPercent}%`;
    dom.statsThermometerTierEl.textContent = `Түвшин: ${tier.label}`;
  }

  function renderRewardsTab() {
    if (!dom.statsRewardCardsEl) return;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const activeTab = getStatsRewardTab();

    if (activeTab === REWARD_TABS.DAYS) {
      const totals = getAppTimeDailyTotals();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      dom.statsRewardCardsEl.innerHTML = Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
        const dt = new Date(currentYear, currentMonth, day);
        const key = getLocalDateKey(dt);
        const seconds = Math.max(0, Math.floor(Number(totals[key]) || 0));
        const tier = rewardTierForDailySeconds(seconds);
        const reward = tier > 0 ? statsRewardDefs[tier - 1] : statsRewardDefs[0];
        return buildRewardCard({
          title: dt.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" }),
          tier: Math.max(1, tier),
          thresholdText: reward.threshold,
          ratingLabel: getDailyRatingLabel(seconds),
        });
      }).join("");
      return;
    }

    if (activeTab === REWARD_TABS.WEEKS) {
      const weeklyNorm = (10 * 3600) + (30 * 60);
      const cards = getWeekBucketsForMonth(currentMonth, currentYear, { getAppTimeDailyTotals, getLocalDateKey }).map((week) => {
        const percent = weeklyNorm > 0 ? (week.seconds / weeklyNorm) * 100 : 0;
        const tier = rewardTierByPercent(percent);
        const reward = statsRewardDefs[tier - 1];
        return buildRewardCard({
          title: `${week.index}-р 7 хоног`,
          range: week.range,
          tier,
          thresholdText: `${percent.toFixed(1)}%`,
          tierLabel: reward.label,
        });
      });
      dom.statsRewardCardsEl.innerHTML = cards.join("");
      return;
    }

    if (activeTab === REWARD_TABS.MONTHS) {
      const cards = Array.from({ length: 12 }, (_, monthIndex) => {
        const seconds = getMonthTotalSeconds(monthIndex, currentYear, getAppTimeDailyTotals);
        const norm = 90 * 60 * new Date(currentYear, monthIndex + 1, 0).getDate();
        const percent = norm > 0 ? (seconds / norm) * 100 : 0;
        const tier = rewardTierByPercent(percent);
        return buildRewardCard({
          title: "",
          subtitle: `${monthIndex + 1}-р сар`,
          tier,
          thresholdText: `${percent.toFixed(1)}%`,
          ratingLabel: getPercentRatingLabel(percent),
        });
      });
      dom.statsRewardCardsEl.innerHTML = cards.join("");
      return;
    }

    const yearlyNorm = 90 * 60 * 365;
    const seconds = getYearTotalSeconds(currentYear, getAppTimeDailyTotals);
    const percent = yearlyNorm > 0 ? (seconds / yearlyNorm) * 100 : 0;
    const tier = rewardTierByPercent(percent);
    dom.statsRewardCardsEl.innerHTML = buildRewardCard({
      title: `${currentYear}`,
      tier,
      thresholdText: `${percent.toFixed(1)}%`,
      ratingLabel: getPercentRatingLabel(percent),
      cardClass: "stats-reward-card-year",
      imageClass: "stats-reward-img-year",
    });
  }

  function renderStatsSnapshot() {
    const progressState = getProgressState();
    if (dom.statsTotalXpEl) dom.statsTotalXpEl.textContent = String(progressState.xp);
    if (dom.statsLevelEl) dom.statsLevelEl.textContent = `Lv.${progressState.level}`;
    if (dom.statsStreakEl) dom.statsStreakEl.textContent = `${progressState.streak} өдөр`;
    if (dom.statsTodayProgressEl) dom.statsTodayProgressEl.textContent = `${progressState.todayCount}/${progressState.dailyGoalCount}`;
    refreshTimeSummaryUI();
  }

  return {
    buildLast7DaysTimeRows: () => buildLast7DaysTimeRows({ getAppTimeDailyTotals, getLocalDateKey, formatHHMMSS }),
    renderProfileSnapshot,
    renderRewardsTab,
    renderStatsSnapshot,
    updateGaugeUI,
  };
}

export function createTimedRewardTrack({
  getElapsedSeconds,
  getUnlockedRewards,
  setUnlockedRewards,
  rewardSteps,
  render,
  onUnlock = () => {},
}) {
  return function update() {
    let unlockedChanged = false;
    while (getUnlockedRewards() < rewardSteps.length && getElapsedSeconds() >= rewardSteps[getUnlockedRewards()].seconds) {
      setUnlockedRewards(getUnlockedRewards() + 1);
      unlockedChanged = true;
      onUnlock(getUnlockedRewards(), rewardSteps[getUnlockedRewards() - 1]);
    }
    if (unlockedChanged) render();
  };
}

export function renderSentencesRewardStrip({ containerEl, rewards, unlockedRewards }) {
  renderRewardStripTiles({ containerEl, rewards, unlockedRewards });
}

export function renderLinearRewardBar({ rewardBarEl, rewardImageEls, unlockedRewards, totalSteps }) {
  renderRewards({ rewardBarEl, rewardImageEls, unlockedRewards, totalSteps });
}

export function startLevelLabel(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.BEGINNER ? "Анхан" : levelKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд" : "Дээд";
}
