import { buildOptions, levelName, resolveLessonContent } from "./lesson.js";
import { renderLessonScreen, renderLessonAnswerState } from "./render-lesson.js";
import { QA_REWARD_STEPS } from "./qa-game.js";

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
  }

  function updateLessonFlowUi() {
    const { questions, currentIndex, unlockedRewards } = runtimeState;

    if (lessonFlowCopyEl) {
      lessonFlowCopyEl.textContent = "Асуултаа уншаад зөв хариултаа сонгоно уу.";
    }

    if (lessonRewardCopyEl) {
      const currentQuestionNumber = Math.min(currentIndex + 1, questions.length || 1);
      const nextRewardLevel = Math.min(unlockedRewards + 1, QA_REWARD_STEPS.length);
      const nextReward = QA_REWARD_STEPS[nextRewardLevel - 1];
      lessonRewardCopyEl.textContent = nextReward
        ? `${currentQuestionNumber}/${questions.length} асуулт • дараагийн шагнал: ${nextReward.label}`
        : `${currentQuestionNumber}/${questions.length} асуулт • бүх шагнал нээгдсэн байна.`;
    }
  }

  function renderQuestion() {
    runtimeState.locked = false;
    const item = runtimeState.questions[runtimeState.currentIndex];
    const options = Array.isArray(item.replayOptions) && item.replayOptions.length
      ? item.replayOptions.slice()
      : buildOptions(item.a);

    renderLessonScreen({
      question: item.q,
      options,
      onPickAnswer: (btn, opt) => pickAnswer(btn, opt),
    });

    updateTopbar();
    updateHeaderStatus();
    updateCompanionLine("lesson", "idle");
    updateLessonFlowUi();
  }

  function startQuiz() {
    const chapterContent = getActiveLearningSelection();
    const lessonContent = resolveLessonContent({
      packId: chapterContent.lessonPackId,
      worldId: chapterContent.worldId,
      chapterId: chapterContent.chapter?.id || null,
      difficulty: runtimeState.level,
    });
    const questions = shuffle(lessonContent.entries).slice(0);
    runtimeState.questions = questions;
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

  function pickAnswer(buttonEl, selected) {
    if (runtimeState.locked) return;
    runtimeState.locked = true;

    const currentQuestion = runtimeState.questions[runtimeState.currentIndex];
    const correct = currentQuestion.a;

    const { isCorrect } = renderLessonAnswerState({
      selectedButton: buttonEl,
      correctAnswer: correct,
      selectedAnswer: selected,
      revealed: true,
      nextActionLabel: runtimeState.currentIndex >= runtimeState.questions.length - 1 ? "Үр дүн, шагналаа харах" : "Дараагийн асуулт руу",
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
      playSuccessSound();
      playRewardSoundscape();
      updateCompanionLine("lesson", "success");
      showWorldFeedbackChip("✨ Зөв хариулт! Зам тань гэрэлтлээ.", "reward");
    } else {
      playErrorSound();
      playSoftFailSoundscape();
      updateCompanionLine("lesson", "error");
      showWorldFeedbackChip("⚠️ Дахин оролдоод үзээрэй, баатар аа.", "warning");
    }

    updateTopbar();
    updateHeaderStatus();
  }

  function endQuiz() {
    const totalQuestions = runtimeState.questions.length;
    const percent = totalQuestions > 0 ? Math.round((runtimeState.score / totalQuestions) * 100) : 0;
    const rewardCount = runtimeState.unlockedRewards;

    if (finalTextEl) {
      finalTextEl.textContent = `Таны оноо: ${runtimeState.score} / ${runtimeState.questions.length}  •  Түвшин: ${levelName(runtimeState.level)}`;
    }
    if (lessonFinishTitleEl) {
      lessonFinishTitleEl.textContent = `Хичээл дууслаа — ${runtimeState.score}/${totalQuestions} зөв, ${percent}% амжилттай.`;
    }
    if (lessonFinishCopyEl) {
      lessonFinishCopyEl.textContent = rewardCount > 0
        ? `Та ${rewardCount} шатны шагнал нээж, өнөөдрийн ахицаа шинэчиллээ. Одоо ахиц & шагналын дэлгэц рүү орж үр дүнгээ харна уу.`
        : "Энэ удаа шагналын шат нээгдээгүй ч XP, өдөр тутмын ахиц хадгалагдсан. Одоо ахицын дэлгэц рүү орж үр дүнгээ харна уу.";
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
    endQuiz();
  }

  function startReview(savedItem) {
    runtimeState.lessonReviewMode = true;
    runtimeState.questions = [{
      q: savedItem.questionText || "",
      a: savedItem.correctAnswer || "",
      replayOptions: Array.isArray(savedItem.options) ? savedItem.options.slice() : [],
    }];
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
