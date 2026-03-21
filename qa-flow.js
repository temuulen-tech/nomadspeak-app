import { DIFFICULTY_LEVELS } from "./constants.js";
import { openModal, closeModal } from "./modal.js";
import { QA_LONG_EXPLANATION_TEXT, formatQaBuiltLine, getQaContentSet, getQaWordBankTokens, qaRoundPoolForLevel, qaShuffle } from "./qa-game.js";
import { setHidden, toggleClass } from "./ui.js";

function qaLevelLabel(levelKey) {
  return levelKey === DIFFICULTY_LEVELS.INTERMEDIATE ? "Дунд" : levelKey === DIFFICULTY_LEVELS.ADVANCED ? "Дээд" : "Анхан";
}

export function createQaFlow({ state = {}, dom = {}, actions = {} } = {}) {
  const {
    getQaGameLevel,
    setQaGameLevel,
    getQaContentSetId,
    setQaContentSetId,
    getQaRoundPool,
    setQaRoundPool,
    getQaRoundIndex,
    setQaRoundIndex,
    getQaBank,
    setQaBank,
    getQaQuestionBuilt,
    setQaQuestionBuilt,
    getQaAnswerBuilt,
    setQaAnswerBuilt,
    isQaQuestionSolved,
    setQaQuestionSolved,
    getQaElapsedSeconds,
    setQaElapsedSeconds,
    getQaUnlockedRewards,
    setQaUnlockedRewards,
    setQaTimerStartedAt,
  } = state;

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

  let qaToastTimer = null;

  function getQaCurrentRound() {
    const pool = getQaRoundPool();
    return pool[getQaRoundIndex() % pool.length];
  }

  function showQaToast(message) {
    if (!qaToastEl) return;
    qaToastEl.textContent = message;
    setHidden(qaToastEl, false);
    toggleClass(qaToastEl, "show", true);
    clearTimeout(qaToastTimer);
    qaToastTimer = setTimeout(() => {
      toggleClass(qaToastEl, "show", false);
      setHidden(qaToastEl, true);
    }, 2200);
  }

  function updateQaBuiltTextPreview() {
    if (!qaFeedbackEl) return;
    const questionText = formatQaBuiltLine(getQaQuestionBuilt().map((chip) => chip.token));
    const answerText = formatQaBuiltLine(getQaAnswerBuilt().map((chip) => chip.token));
    qaFeedbackEl.textContent = `Q: ${questionText || "..."} | A: ${answerText || "..."}`;
  }

  function renderQaBuilder() {
    if (!qaQuestionLineEl || !qaAnswerLineEl || !qaWordBankEl) return;
    const activeLine = isQaQuestionSolved() ? "answer" : "question";
    const questionBuilt = getQaQuestionBuilt();
    const answerBuilt = getQaAnswerBuilt();
    const qaBank = getQaBank();

    qaQuestionLineEl.innerHTML = questionBuilt.length
      ? questionBuilt.map((chip) => `<button class="qa-chip placed" data-chip-id="${chip.id}" data-source="question" type="button">${chip.token}</button>`).join("")
      : '<span class="qa-placeholder">Асуултын мөрөнд үгсээ байрлуулна.</span>';

    qaAnswerLineEl.innerHTML = answerBuilt.length
      ? answerBuilt.map((chip) => `<button class="qa-chip placed" data-chip-id="${chip.id}" data-source="answer" type="button">${chip.token}</button>`).join("")
      : '<span class="qa-placeholder">Хариултын мөрөнд үгсээ байрлуулна.</span>';

    toggleClass(qaAnswerLineEl, "locked", !isQaQuestionSolved());

    qaWordBankEl.innerHTML = qaBank.map((chip) => `<button class="qa-chip" data-chip-id="${chip.id}" type="button">${chip.token}</button>`).join("");

    qaWordBankEl.querySelectorAll(".qa-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextBank = [...getQaBank()];
        const questionBuiltRef = [...getQaQuestionBuilt()];
        const answerBuiltRef = [...getQaAnswerBuilt()];
        const chipIndex = nextBank.findIndex((chip) => chip.id === btn.dataset.chipId);
        if (chipIndex < 0) return;
        const [chip] = nextBank.splice(chipIndex, 1);
        if (activeLine === "question") questionBuiltRef.push(chip);
        else answerBuiltRef.push(chip);
        setQaBank(nextBank);
        setQaQuestionBuilt(questionBuiltRef);
        setQaAnswerBuilt(answerBuiltRef);
        renderQaBuilder();
        updateQaBuiltTextPreview();
      });
    });

    [qaQuestionLineEl, qaAnswerLineEl].forEach((lineEl) => {
      lineEl.querySelectorAll(".qa-chip.placed").forEach((btn) => {
        btn.addEventListener("click", () => {
          const source = btn.dataset.source;
          const nextBank = [...getQaBank()];
          const lineRef = source === "question" ? [...getQaQuestionBuilt()] : [...getQaAnswerBuilt()];
          const idx = lineRef.findIndex((chip) => chip.id === btn.dataset.chipId);
          if (idx < 0) return;
          const [chip] = lineRef.splice(idx, 1);
          nextBank.push(chip);
          setQaBank(nextBank);
          if (source === "question") setQaQuestionBuilt(lineRef);
          else setQaAnswerBuilt(lineRef);
          renderQaBuilder();
          updateQaBuiltTextPreview();
        });
      });
    });
  }

  function setupQaRound(options = {}) {
    const round = options.round || getQaCurrentRound();
    if (!round) {
      setQaQuestionSolved(false);
      setQaQuestionBuilt([]);
      setQaAnswerBuilt([]);
      setQaBank([]);
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

    setQaQuestionSolved(false);
    setQaQuestionBuilt([]);
    setQaAnswerBuilt([]);
    setQaBank(qaShuffle(sourceTokens).map((token, index) => ({ id: `${Date.now()}-${index}-${Math.random()}`, token })));

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
    const questionTokens = getQaQuestionBuilt().map((chip) => chip.token);
    const answerTokens = getQaAnswerBuilt().map((chip) => chip.token);

    if (!isQaQuestionSolved()) {
      if (questionTokens.length !== targetQuestion.length) {
        qaFeedbackEl.textContent = "Асуултын үгийн тоо дутуу/илүү байна.";
        return;
      }
      const isQuestionCorrect = questionTokens.every((token, idx) => token === targetQuestion[idx]);
      if (!isQuestionCorrect) {
        qaFeedbackEl.textContent = "Асуулт буруу байна. Дахин оролдоорой.";
        return;
      }
      setQaQuestionSolved(true);
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
    setQaRoundIndex((getQaRoundIndex() + 1) % getQaRoundPool().length);
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
    const qaGameLevel = getQaGameLevel();
    const qaContentSetId = getQaContentSetId();
    const rounds = getQaRoundPool().length ? getQaRoundPool() : qaRoundPoolForLevel(qaGameLevel || DIFFICULTY_LEVELS.BEGINNER, qaContentSetId);
    return rounds
      .map((round) => `<p>${round.enQuestion} - ${round.enAnswer}</p><p>${round.mnQuestion} - ${round.mnAnswer}</p>`)
      .join("");
  }

  function selectQaLevel(levelKey) {
    const nextContentSetId = getActiveLearningSelection().qaSetId || getQaContentSetId();
    setQaGameLevel(levelKey);
    setQaContentSetId(nextContentSetId);
    setQaRoundPool(qaRoundPoolForLevel(levelKey, nextContentSetId));
    setQaRoundIndex(0);
    setHidden(qaRoundPanelEl, false);
    setHidden(qaLevelOptionsEl, true);
    qaLevelSelectBtn.textContent = `Сонгосон түвшин: ${qaLevelLabel(levelKey)}`;
    setupQaRound();
    startQaTimer();
  }

  function resetQaGameScreen() {
    const initialLevel = getQaGameLevel() || DIFFICULTY_LEVELS.BEGINNER;
    const nextContentSetId = getActiveLearningSelection().qaSetId || getQaContentSetId();
    setQaContentSetId(nextContentSetId);
    setQaGameLevel(initialLevel);
    setQaRoundPool(qaRoundPoolForLevel(initialLevel, nextContentSetId));
    setQaRoundIndex(0);
    setQaBank([]);
    setQaQuestionBuilt([]);
    setQaAnswerBuilt([]);
    setQaQuestionSolved(false);
    setQaElapsedSeconds(0);
    setQaUnlockedRewards(0);
    setQaTimerStartedAt(null);
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
    setQaGameLevel(DIFFICULTY_LEVELS.INTERMEDIATE);
    setQaRoundPool([round]);
    setQaRoundIndex(0);
    setHidden(qaRoundPanelEl, false);
    setHidden(qaLevelOptionsEl, true);
    qaLevelSelectBtn.textContent = "Сонгосон түвшин: Давтах";
    const questionTokens = round.enQuestion.split(" ").filter(Boolean);
    const answerTokens = round.enAnswer.split(" ").filter(Boolean);
    setupQaRound({ round, wordBankTokens: [...questionTokens, ...answerTokens] });
    startQaTimer();
  }

  return {
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
    loadRound,
    openHelpModal: () => openQaModal("Тоглоомын тайлбар", `<p>${QA_LONG_EXPLANATION_TEXT}</p>`),
    openSentencesModal: () => openQaModal("Бүтэн өгүүлбэрүүд", buildQaSentencesModalHtml()),
  };
}
