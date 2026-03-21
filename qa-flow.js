import { DIFFICULTY_LEVELS } from "./constants.js";
import { openModal, closeModal } from "./modal.js";
import { QA_LONG_EXPLANATION_TEXT, formatQaBuiltLine, getQaContentSet, getQaWordBankTokens, qaRoundPoolForLevel, qaShuffle } from "./qa-game.js";
import { setHidden, toggleClass } from "./ui.js";

function qaLevelLabel(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд" : levelKey === DIFFICULTY_LEVELS.ADVANCED ? "Дээд" : "Анхан";
}

export function createQaFlow({ state = {}, dom = {}, actions = {} } = {}) {
  const runtimeState = {
    qaGameLevel: state.qaGameLevel ?? null,
    qaContentSetId: state.qaContentSetId ?? null,
    qaRoundPool: Array.isArray(state.qaRoundPool) ? state.qaRoundPool : [],
    qaRoundIndex: Number.isFinite(state.qaRoundIndex) ? state.qaRoundIndex : 0,
    qaBank: Array.isArray(state.qaBank) ? state.qaBank : [],
    qaQuestionBuilt: Array.isArray(state.qaQuestionBuilt) ? state.qaQuestionBuilt : [],
    qaAnswerBuilt: Array.isArray(state.qaAnswerBuilt) ? state.qaAnswerBuilt : [],
    qaQuestionSolved: Boolean(state.qaQuestionSolved),
    qaElapsedSeconds: Number.isFinite(state.qaElapsedSeconds) ? state.qaElapsedSeconds : 0,
    qaUnlockedRewards: Number.isFinite(state.qaUnlockedRewards) ? state.qaUnlockedRewards : 0,
    qaTimerStartedAt: state.qaTimerStartedAt ?? null,
    qaToastTimer: null,
  };

  const {
    qaToastEl,
    qaLevelSelectBtn,
    qaLevelOptionsEl,
    qaRoundPanelEl,
    qaFeedbackEl,
    qaMnQuestionEl,
    qaMnAnswerEl,
    qaEnQuestionEl,
    qaEnAnswerEl,
    qaEnQuestionWrap,
    qaEnAnswerWrap,
    qaToggleQuestionBtn,
    qaToggleAnswerBtn,
    qaQuestionLineEl,
    qaAnswerLineEl,
    qaWordBankEl,
    qaModalEl,
    qaModalTitleEl,
    qaModalBodyEl,
  } = dom;

  const {
    getActiveLearningSelection,
    startQaTimer,
    stopQaTimer,
    updateQaTimerUi,
    renderQaRewards,
    showWorldFeedbackChip,
  } = actions;

  function getState() {
    return runtimeState;
  }

  function getQaCurrentRound() {
    const pool = runtimeState.qaRoundPool;
    return pool[runtimeState.qaRoundIndex % pool.length];
  }

  function showQaToast(message) {
    if (!qaToastEl) return;
    qaToastEl.textContent = message;
    setHidden(qaToastEl, false);
    toggleClass(qaToastEl, "show", true);
    clearTimeout(runtimeState.qaToastTimer);
    runtimeState.qaToastTimer = setTimeout(() => {
      toggleClass(qaToastEl, "show", false);
      setHidden(qaToastEl, true);
    }, 2200);
  }

  function updateQaBuiltTextPreview() {
    if (!qaFeedbackEl) return;
    const questionText = formatQaBuiltLine(runtimeState.qaQuestionBuilt.map((chip) => chip.token));
    const answerText = formatQaBuiltLine(runtimeState.qaAnswerBuilt.map((chip) => chip.token));
    qaFeedbackEl.textContent = `Q: ${questionText || "..."} | A: ${answerText || "..."}`;
  }

  function renderQaBuilder() {
    if (!qaQuestionLineEl || !qaAnswerLineEl || !qaWordBankEl) return;
    const activeLine = runtimeState.qaQuestionSolved ? "answer" : "question";
    const { qaQuestionBuilt, qaAnswerBuilt, qaBank } = runtimeState;

    qaQuestionLineEl.innerHTML = qaQuestionBuilt.length
      ? qaQuestionBuilt.map((chip) => `<button class="qa-chip placed" data-chip-id="${chip.id}" data-source="question" type="button">${chip.token}</button>`).join("")
      : '<span class="qa-placeholder">Асуултын мөрөнд үгсээ байрлуулна.</span>';

    qaAnswerLineEl.innerHTML = qaAnswerBuilt.length
      ? qaAnswerBuilt.map((chip) => `<button class="qa-chip placed" data-chip-id="${chip.id}" data-source="answer" type="button">${chip.token}</button>`).join("")
      : '<span class="qa-placeholder">Хариултын мөрөнд үгсээ байрлуулна.</span>';

    toggleClass(qaAnswerLineEl, "locked", !runtimeState.qaQuestionSolved);

    qaWordBankEl.innerHTML = qaBank.map((chip) => `<button class="qa-chip" data-chip-id="${chip.id}" type="button">${chip.token}</button>`).join("");

    qaWordBankEl.querySelectorAll(".qa-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextBank = [...runtimeState.qaBank];
        const questionBuiltRef = [...runtimeState.qaQuestionBuilt];
        const answerBuiltRef = [...runtimeState.qaAnswerBuilt];
        const chipIndex = nextBank.findIndex((chip) => chip.id === btn.dataset.chipId);
        if (chipIndex < 0) return;
        const [chip] = nextBank.splice(chipIndex, 1);
        if (activeLine === "question") questionBuiltRef.push(chip);
        else answerBuiltRef.push(chip);
        runtimeState.qaBank = nextBank;
        runtimeState.qaQuestionBuilt = questionBuiltRef;
        runtimeState.qaAnswerBuilt = answerBuiltRef;
        renderQaBuilder();
        updateQaBuiltTextPreview();
      });
    });

    [qaQuestionLineEl, qaAnswerLineEl].forEach((lineEl) => {
      lineEl.querySelectorAll(".qa-chip.placed").forEach((btn) => {
        btn.addEventListener("click", () => {
          const source = btn.dataset.source;
          const nextBank = [...runtimeState.qaBank];
          const lineRef = source === "question" ? [...runtimeState.qaQuestionBuilt] : [...runtimeState.qaAnswerBuilt];
          const idx = lineRef.findIndex((chip) => chip.id === btn.dataset.chipId);
          if (idx < 0) return;
          const [chip] = lineRef.splice(idx, 1);
          nextBank.push(chip);
          runtimeState.qaBank = nextBank;
          if (source === "question") runtimeState.qaQuestionBuilt = lineRef;
          else runtimeState.qaAnswerBuilt = lineRef;
          renderQaBuilder();
          updateQaBuiltTextPreview();
        });
      });
    });
  }

  function setupQaRound(options = {}) {
    const round = options.round || getQaCurrentRound();
    if (!round) {
      runtimeState.qaQuestionSolved = false;
      runtimeState.qaQuestionBuilt = [];
      runtimeState.qaAnswerBuilt = [];
      runtimeState.qaBank = [];
      qaMnQuestionEl.textContent = "Энэ бүлгийн QA агуулга хараахан бэлэн болоогүй байна.";
      qaMnAnswerEl.textContent = "";
      qaEnQuestionEl.textContent = "";
      qaEnAnswerEl.textContent = "";
      renderQaBuilder();
      updateQaBuiltTextPreview();
      return;
    }

    const sourceTokens = Array.isArray(options.wordBankTokens) && options.wordBankTokens.length
      ? options.wordBankTokens
      : getQaWordBankTokens(round);

    runtimeState.qaQuestionSolved = false;
    runtimeState.qaQuestionBuilt = [];
    runtimeState.qaAnswerBuilt = [];
    runtimeState.qaBank = qaShuffle(sourceTokens).map((token, index) => ({ id: `${Date.now()}-${index}-${Math.random()}`, token }));

    qaMnQuestionEl.textContent = round.mnQuestion;
    qaMnAnswerEl.textContent = round.mnAnswer;
    qaEnQuestionEl.textContent = round.enQuestion;
    qaEnAnswerEl.textContent = round.enAnswer;
    setHidden(qaEnQuestionWrap, true);
    setHidden(qaEnAnswerWrap, true);
    if (qaToggleQuestionBtn) qaToggleQuestionBtn.textContent = "Асуултыг харах";
    if (qaToggleAnswerBtn) qaToggleAnswerBtn.textContent = "Хариултыг харах";

    renderQaBuilder();
    updateQaBuiltTextPreview();
  }

  function checkQaAnswer() {
    const round = getQaCurrentRound();
    if (!round) return;
    const targetQuestion = round.enQuestion.split(" ");
    const targetAnswer = round.enAnswer.split(" ");
    const questionTokens = runtimeState.qaQuestionBuilt.map((chip) => chip.token);
    const answerTokens = runtimeState.qaAnswerBuilt.map((chip) => chip.token);

    if (!runtimeState.qaQuestionSolved) {
      if (questionTokens.length !== targetQuestion.length) {
        qaFeedbackEl.textContent = "Асуултын үгийн тоо дутуу/илүү байна.";
        return;
      }
      const isQuestionCorrect = questionTokens.every((token, idx) => token === targetQuestion[idx]);
      if (!isQuestionCorrect) {
        qaFeedbackEl.textContent = "Асуулт буруу байна. Дахин оролдоорой.";
        return;
      }
      runtimeState.qaQuestionSolved = true;
      qaFeedbackEl.textContent = "✅ Асуулт зөв! Одоо хариултаа бүтээнэ үү.";
      renderQaBuilder();
      return;
    }

    if (answerTokens.length !== targetAnswer.length) {
      qaFeedbackEl.textContent = "Хариултын үгийн тоо дутуу/илүү байна.";
      return;
    }
    const isAnswerCorrect = answerTokens.every((token, idx) => token === targetAnswer[idx]);
    if (!isAnswerCorrect) {
      qaFeedbackEl.textContent = "Хариулт буруу байна. Дахин оролдоорой.";
      return;
    }

    qaFeedbackEl.textContent = "🎉 Баяр хүргэе! Дараагийн тойрог...";
    runtimeState.qaRoundIndex = (runtimeState.qaRoundIndex + 1) % runtimeState.qaRoundPool.length;
    setupQaRound();
  }

  function openQaModal(title, htmlBody) {
    if (!qaModalEl || !qaModalTitleEl || !qaModalBodyEl) return;
    openModal(qaModalEl, { titleEl: qaModalTitleEl, title, bodyEl: qaModalBodyEl, bodyHtml: htmlBody });
  }

  function closeQaModal() {
    if (!qaModalEl) return;
    closeModal(qaModalEl);
  }

  function buildQaSentencesModalHtml() {
    const rounds = runtimeState.qaRoundPool.length
      ? runtimeState.qaRoundPool
      : qaRoundPoolForLevel(runtimeState.qaGameLevel || DIFFICULTY_LEVELS.BEGINNER, runtimeState.qaContentSetId);
    return rounds
      .map((round) => `<p>${round.enQuestion} - ${round.enAnswer}</p><p>${round.mnQuestion} - ${round.mnAnswer}</p>`)
      .join("");
  }

  function selectQaLevel(levelKey) {
    const nextContentSetId = getActiveLearningSelection().qaSetId || runtimeState.qaContentSetId;
    runtimeState.qaGameLevel = levelKey;
    runtimeState.qaContentSetId = nextContentSetId;
    runtimeState.qaRoundPool = qaRoundPoolForLevel(levelKey, nextContentSetId);
    runtimeState.qaRoundIndex = 0;
    setHidden(qaRoundPanelEl, false);
    setHidden(qaLevelOptionsEl, true);
    qaLevelSelectBtn.textContent = `Сонгосон түвшин: ${qaLevelLabel(levelKey)}`;
    setupQaRound();
    startQaTimer();
  }

  function resetRuntimeState() {
    runtimeState.qaBank = [];
    runtimeState.qaQuestionBuilt = [];
    runtimeState.qaAnswerBuilt = [];
    runtimeState.qaQuestionSolved = false;
    runtimeState.qaElapsedSeconds = 0;
    runtimeState.qaUnlockedRewards = 0;
    runtimeState.qaTimerStartedAt = null;
  }

  function resetQaGameScreen() {
    const initialLevel = runtimeState.qaGameLevel || DIFFICULTY_LEVELS.BEGINNER;
    const nextContentSetId = getActiveLearningSelection().qaSetId || runtimeState.qaContentSetId;
    runtimeState.qaContentSetId = nextContentSetId;
    runtimeState.qaGameLevel = initialLevel;
    runtimeState.qaRoundPool = qaRoundPoolForLevel(initialLevel, nextContentSetId);
    runtimeState.qaRoundIndex = 0;
    resetRuntimeState();
    stopQaTimer();
    updateQaTimerUi();
    renderQaRewards();
    setHidden(qaRoundPanelEl, false);
    setHidden(qaLevelOptionsEl, true);
    qaLevelSelectBtn.textContent = `Сонгосон түвшин: ${qaLevelLabel(initialLevel)}`;
    qaFeedbackEl.textContent = "";
    if (!getQaContentSet(nextContentSetId)?.rounds?.length) {
      showWorldFeedbackChip("⚠️ Энэ бүлгийн QA багц одоохондоо хоосон байна.", "warning");
    }
    setupQaRound();
    startQaTimer();
  }

  function loadRound(round) {
    runtimeState.qaGameLevel = DIFFICULTY_LEVELS.INTERMEDIATE;
    runtimeState.qaRoundPool = [round];
    runtimeState.qaRoundIndex = 0;
    setHidden(qaRoundPanelEl, false);
    setHidden(qaLevelOptionsEl, true);
    qaLevelSelectBtn.textContent = "Сонгосон түвшин: Давтах";
    const questionTokens = round.enQuestion.split(" ").filter(Boolean);
    const answerTokens = round.enAnswer.split(" ").filter(Boolean);
    setupQaRound({ round, wordBankTokens: [...questionTokens, ...answerTokens] });
    startQaTimer();
  }

  return {
    getState,
    getQaCurrentRound,
    showQaToast,
    renderQaBuilder,
    updateQaBuiltTextPreview,
    setupQaRound,
    checkQaAnswer,
    openQaModal,
    closeQaModal,
    buildQaSentencesModalHtml,
    selectQaLevel,
    resetQaGameScreen,
    resetRuntimeState,
    loadRound,
    openHelpModal: () => openQaModal("Тоглоомын тайлбар", `<p>${QA_LONG_EXPLANATION_TEXT}</p>`),
    openSentencesModal: () => openQaModal("Бүтэн өгүүлбэрүүд", buildQaSentencesModalHtml()),
  };
}
