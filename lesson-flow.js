import { buildOptions, levelName, resolveLessonContent } from "./lesson.js";
import { renderLessonScreen, renderLessonAnswerState } from "./render-lesson.js";
import { QA_REWARD_STEPS } from "./qa-game.js";

const REVIEW_BATCH_LIMIT = 3;

function cloneLessonQuestion(item = {}, overrides = {}) {
  const options = Array.isArray(item.replayOptions) && item.replayOptions.length
    ? item.replayOptions.slice()
    : buildOptions(item.a);

  return {
    ...item,
    replayOptions: options,
    ...overrides,
  };
}

export function createLessonFlow({
  state = {},
  dom = {},
  actions = {},
  helpers = {},
} = {}) {
  const runtimeState = {
    level: state.level,
    questions: Array.isArray(state.questions) ? state.questions : [],
    currentIndex: Number.isFinite(state.currentIndex) ? state.currentIndex : 0,
    score: Number.isFinite(state.score) ? state.score : 0,
    locked: Boolean(state.locked),
    lessonReviewMode: Boolean(state.lessonReviewMode),
    elapsedSeconds: Number.isFinite(state.elapsedSeconds) ? state.elapsedSeconds : 0,
    unlockedRewards: Number.isFinite(state.unlockedRewards) ? state.unlockedRewards : 0,
    timerStartedAt: state.timerStartedAt ?? null,
    pendingReviewQuestions: [],
    baseQuestionCount: 0,
    surfacedSavedReviewCount: 0,
    missedQuestionsCount: 0,
    resolvedReviewCount: 0,
    sessionId: null,
    completionRecorded: false,
  };

  const {
    finalTextEl,
    lessonFinishTitleEl,
    lessonFinishCopyEl,
    lessonFlowCopyEl,
    lessonRewardCopyEl,
  } = dom;

  const {
    getActiveLearningSelection,
    shuffle,
    loadProgressState,
    syncProgressForToday,
    persistProgressState,
    stopSpeaking,
    showLessonScreen,
    showEndScreen,
    awardXp,
    getLessonRewardEventId,
    getLessonCompletionEventId,
    getTodayKey,
    getYesterdayKey,
    recordLessonCheckpoint,
    queueLessonReviewItem,
    resolveLessonReviewItem,
    playSuccessSound,
    playErrorSound,
    playRewardSoundscape,
    playSoftFailSoundscape,
    updateCompanionLine,
    showWorldFeedbackChip,
    updateTopbar,
    updateHeaderStatus,
    loadProgressAfterCompletion,
    showCompletionBanner,
  } = actions;

  const { getCoreState } = helpers;

  function getState() {
    return runtimeState;
  }

  function setLevel(level) {
    runtimeState.level = level;
  }

  function resetRuntimeState() {
    runtimeState.questions = [];
    runtimeState.currentIndex = 0;
    runtimeState.score = 0;
    runtimeState.locked = false;
    runtimeState.lessonReviewMode = false;
    runtimeState.elapsedSeconds = 0;
    runtimeState.unlockedRewards = 0;
    runtimeState.timerStartedAt = null;
    runtimeState.pendingReviewQuestions = [];
    runtimeState.baseQuestionCount = 0;
    runtimeState.surfacedSavedReviewCount = 0;
    runtimeState.missedQuestionsCount = 0;
    runtimeState.resolvedReviewCount = 0;
    runtimeState.sessionId = null;
    runtimeState.completionRecorded = false;
  }

  function getCurrentQuestion() {
    return runtimeState.questions[runtimeState.currentIndex] || null;
  }

  function buildStartQuestions() {
    const chapterContent = getActiveLearningSelection();
    const lessonContent = resolveLessonContent({
      packId: chapterContent.lessonPackId,
      worldId: chapterContent.worldId,
      chapterId: chapterContent.chapter?.id || null,
      difficulty: runtimeState.level,
    });
    const freshQuestions = shuffle(lessonContent.entries).map((entry) => cloneLessonQuestion(entry, {
      source: "lesson",
      worldId: chapterContent.worldId,
      chapterId: chapterContent.chapter?.id || null,
      level: runtimeState.level,
    }));
    const savedReviewItems = (getCoreState()?.reviewQueue || [])
      .filter((item) => item.level === runtimeState.level && item.worldId === chapterContent.worldId)
      .slice(0, REVIEW_BATCH_LIMIT)
      .map((item) => cloneLessonQuestion({
        q: item.questionText,
        qMn: item.questionMn,
        a: item.correctAnswer,
        aMn: item.correctAnswerMn,
        replayOptions: item.options,
      }, {
        source: "saved-review",
        reviewKey: item.key,
        worldId: item.worldId,
        chapterId: item.chapterId,
        level: item.level,
      }));

    return {
      chapterContent,
      freshQuestions,
      questions: [...savedReviewItems, ...freshQuestions],
      surfacedSavedReviewCount: savedReviewItems.length,
    };
  }

  function updateLessonFlowUi() {
    const { questions, currentIndex, unlockedRewards, lessonReviewMode, pendingReviewQuestions, surfacedSavedReviewCount } = runtimeState;
    const total = questions.length || 1;
    const currentQuestionNumber = Math.min(currentIndex + 1, total);
    const nextRewardLevel = Math.min(unlockedRewards + 1, QA_REWARD_STEPS.length);
    const nextReward = QA_REWARD_STEPS[nextRewardLevel - 1];

    if (lessonFlowCopyEl) {
      if (lessonReviewMode) {
        lessonFlowCopyEl.textContent = "Алдсан асуултуудаа дахин давтаж баталгаажуулна уу.";
      } else if (surfacedSavedReviewCount > 0 && currentIndex < surfacedSavedReviewCount) {
        lessonFlowCopyEl.textContent = "Эхлээд өмнө алдсан асуултуудаа давтаад дараа нь шинэ хичээлээ үргэлжлүүлнэ.";
      } else {
        lessonFlowCopyEl.textContent = "Асуултаа уншаад зөв хариултаа сонгоно уу.";
      }
    }

    if (lessonRewardCopyEl) {
      const reviewTail = pendingReviewQuestions.length && !lessonReviewMode
        ? ` • ${pendingReviewQuestions.length} алдаа давталтанд шилжинэ`
        : "";
      lessonRewardCopyEl.textContent = nextReward
        ? `${currentQuestionNumber}/${total} асуулт • дараагийн шагнал: ${nextReward.label}${reviewTail}`
        : `${currentQuestionNumber}/${total} асуулт • бүх шагнал нээгдсэн байна.${reviewTail}`;
    }
  }

  function renderQuestion() {
    runtimeState.locked = false;
    const item = getCurrentQuestion();
    if (!item) return;

    renderLessonScreen({
      question: item.q,
      options: Array.isArray(item.replayOptions) && item.replayOptions.length ? item.replayOptions.slice() : buildOptions(item.a),
      onPickAnswer: (btn, opt) => pickAnswer(btn, opt),
    });

    updateTopbar();
    updateHeaderStatus();
    updateCompanionLine("lesson", runtimeState.lessonReviewMode ? "review" : "idle");
    updateLessonFlowUi();
  }

  function startQuiz() {
    const { freshQuestions, questions, surfacedSavedReviewCount } = buildStartQuestions();
    runtimeState.questions = questions;
    runtimeState.baseQuestionCount = freshQuestions.length;
    runtimeState.surfacedSavedReviewCount = surfacedSavedReviewCount;
    runtimeState.pendingReviewQuestions = [];
    runtimeState.missedQuestionsCount = 0;
    runtimeState.resolvedReviewCount = 0;
    runtimeState.sessionId = `lesson-session:${Date.now()}:${runtimeState.level}`;
    runtimeState.completionRecorded = false;

    if (!questions.length) {
      showWorldFeedbackChip("⚠️ Энэ бүлгийн lesson pack-д бодит агуулга хараахан ороогүй байна.", "warning");
      return;
    }

    runtimeState.currentIndex = 0;
    runtimeState.score = 0;
    runtimeState.locked = false;
    runtimeState.lessonReviewMode = false;
    loadProgressState();
    syncProgressForToday();
    persistProgressState();
    stopSpeaking();
    showLessonScreen();
    renderQuestion();
  }

  function queueCurrentQuestionForReview(currentQuestion, reviewKey = currentQuestion.reviewKey) {

    if (!currentQuestion._queuedForSessionReview) {
      runtimeState.pendingReviewQuestions.push(cloneLessonQuestion(currentQuestion, {
        source: "session-review",
        reviewKey,
      }));
      currentQuestion._queuedForSessionReview = true;
      runtimeState.missedQuestionsCount += 1;
    }
  }

  function pickAnswer(buttonEl, selected) {
    if (runtimeState.locked) return;
    runtimeState.locked = true;

    const currentQuestion = getCurrentQuestion();
    const correct = currentQuestion.a;

    const { isCorrect } = renderLessonAnswerState({
      selectedButton: buttonEl,
      correctAnswer: correct,
      selectedAnswer: selected,
      revealed: true,
      nextActionLabel: runtimeState.currentIndex >= runtimeState.questions.length - 1
        ? (runtimeState.lessonReviewMode ? "Үр дүн, ахицаа харах" : "Давталт эсвэл үр дүн рүү шилжих")
        : "Дараагийн асуулт руу",
    });

    if (isCorrect) {
      if (!runtimeState.lessonReviewMode) {
        runtimeState.score += 1;
        awardXp(1, "quiz_correct_answer", getLessonRewardEventId({
          coreState: getCoreState(),
          level: runtimeState.level,
          currentIndex: runtimeState.currentIndex,
          question: currentQuestion?.q || "",
        }));
      }
      if (currentQuestion.reviewKey) {
        resolveLessonReviewItem(currentQuestion.reviewKey);
        runtimeState.resolvedReviewCount += 1;
      }
      playSuccessSound();
      playRewardSoundscape();
      updateCompanionLine("lesson", "success");
      showWorldFeedbackChip("✨ Зөв хариулт! Зам тань гэрэлтлээ.", "reward");
    } else {
      const queuedReviewItem = queueLessonReviewItem({
        worldId: currentQuestion.worldId || getCoreState()?.selectedWorldId || "",
        chapterId: currentQuestion.chapterId || getActiveLearningSelection()?.chapter?.id || "",
        level: currentQuestion.level || runtimeState.level,
        questionText: currentQuestion.q,
        questionMn: currentQuestion.qMn || "",
        correctAnswer: currentQuestion.a,
        correctAnswerMn: currentQuestion.aMn || "",
        options: currentQuestion.replayOptions,
        optionMnMap: {},
      });
      currentQuestion.reviewKey = queuedReviewItem?.key || currentQuestion.reviewKey || null;
      if (!runtimeState.lessonReviewMode) queueCurrentQuestionForReview(currentQuestion, currentQuestion.reviewKey);
      playErrorSound();
      playSoftFailSoundscape();
      updateCompanionLine("lesson", "error");
      showWorldFeedbackChip("⚠️ Дахин оролдоод үзээрэй, баатар аа.", "warning");
    }

    persistProgressState();
    updateTopbar();
    updateHeaderStatus();
  }

  function maybeStartReviewLoop() {
    if (runtimeState.lessonReviewMode || !runtimeState.pendingReviewQuestions.length) return false;
    runtimeState.lessonReviewMode = true;
    runtimeState.questions = runtimeState.pendingReviewQuestions.splice(0, runtimeState.pendingReviewQuestions.length);
    runtimeState.currentIndex = 0;
    renderQuestion();
    showWorldFeedbackChip("🔁 Алдсан асуултууд автоматаар дахин гарч ирлээ.", "reward");
    return true;
  }

  function endQuiz() {
    const totalQuestions = runtimeState.baseQuestionCount || runtimeState.questions.length;
    const percent = totalQuestions > 0 ? Math.round((runtimeState.score / totalQuestions) * 100) : 0;
    const rewardCount = runtimeState.unlockedRewards;
    const completionEventId = getLessonCompletionEventId?.({
      coreState: getCoreState(),
      sessionId: runtimeState.sessionId,
      level: runtimeState.level,
    }) || runtimeState.sessionId;

    if (!runtimeState.completionRecorded && completionEventId) {
      loadProgressState();
      syncProgressForToday();
      const today = getTodayKey?.() || new Date().toISOString().slice(0, 10);
      recordLessonCheckpoint({
        today,
        yesterday: getYesterdayKey?.(today) || null,
        countLesson: true,
        rewardTierUnlocked: rewardCount || null,
        eventId: completionEventId,
      });
      persistProgressState();
      runtimeState.completionRecorded = true;
    }

    if (finalTextEl) {
      finalTextEl.textContent = `Таны оноо: ${runtimeState.score} / ${totalQuestions}  •  Түвшин: ${levelName(runtimeState.level)}`;
    }
    if (lessonFinishTitleEl) {
      lessonFinishTitleEl.textContent = `Хичээл дууслаа — ${runtimeState.score}/${totalQuestions} зөв, ${percent}% амжилттай.`;
    }
    if (lessonFinishCopyEl) {
      const summaryBits = [];
      if (runtimeState.surfacedSavedReviewCount > 0) summaryBits.push(`${runtimeState.surfacedSavedReviewCount} хадгалсан review асуулт эхэнд орсон`);
      if (runtimeState.missedQuestionsCount > 0) summaryBits.push(`${runtimeState.missedQuestionsCount} алдаа review дараалалд хадгалагдсан`);
      if (runtimeState.resolvedReviewCount > 0) summaryBits.push(`${runtimeState.resolvedReviewCount} review item цэвэрлэгдсэн`);
      const summaryText = summaryBits.length ? `${summaryBits.join(" • ")}. ` : "";
      lessonFinishCopyEl.textContent = rewardCount > 0
        ? `${summaryText}Та ${rewardCount} шатны шагнал нээж, өнөөдрийн ахицаа шинэчиллээ. Одоо ахиц & шагналын дэлгэц рүү орж үр дүнгээ харна уу.`
        : `${summaryText}XP болон өдөр тутмын ахиц хадгалагдсан. Одоо ахицын дэлгэц рүү орж үр дүнгээ харна уу.`;
    }

    showEndScreen();
    loadProgressAfterCompletion();
    showCompletionBanner();
    updateHeaderStatus();
  }

  function nextQuestion() {
    runtimeState.currentIndex += 1;
    updateHeaderStatus();
    if (runtimeState.currentIndex < runtimeState.questions.length) {
      renderQuestion();
      return;
    }
    if (maybeStartReviewLoop()) return;
    endQuiz();
  }

  function startReview(savedItem) {
    runtimeState.lessonReviewMode = true;
    runtimeState.questions = [cloneLessonQuestion({
      q: savedItem.questionText || "",
      qMn: savedItem.questionMn || "",
      a: savedItem.correctAnswer || "",
      aMn: savedItem.correctAnswerMn || "",
      replayOptions: Array.isArray(savedItem.options) ? savedItem.options.slice() : [],
    }, {
      reviewKey: savedItem.key || null,
      source: "saved-review",
      worldId: savedItem.worldId || getCoreState()?.selectedWorldId || "",
      chapterId: savedItem.chapterId || getActiveLearningSelection()?.chapter?.id || "",
      level: savedItem.level || runtimeState.level,
    })];
    runtimeState.baseQuestionCount = 1;
    runtimeState.currentIndex = 0;
    runtimeState.locked = false;
    stopSpeaking();
    showLessonScreen();
    renderQuestion();
  }

  return {
    getState,
    setLevel,
    resetRuntimeState,
    startQuiz,
    renderQuestion,
    nextQuestion,
    startReview,
    updateLessonFlowUi,
  };
}
