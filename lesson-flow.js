import { buildOptions, levelName, resolveLessonContent } from "./lesson.js";
import { renderLessonScreen, renderLessonAnswerState } from "./render-lesson.js";
import { QA_REWARD_STEPS } from "./qa-game.js";

export function createLessonFlow({
  state = {},
  dom = {},
  actions = {},
  helpers = {},
} = {}) {
  const {
    getLevel,
    setQuestions,
    getQuestions,
    setCurrentIndex,
    getCurrentIndex,
    setScore,
    getScore,
    getLocked,
    setLocked,
    setLessonReviewMode,
    isLessonReviewMode,
    getLessonUnlockedRewards,
  } = state;

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

  const {
    getCoreState,
  } = helpers;

  function updateLessonFlowUi() {
    const questions = getQuestions();
    const currentIndex = getCurrentIndex();
    const lessonUnlockedRewards = getLessonUnlockedRewards();

    if (lessonFlowCopyEl) {
      lessonFlowCopyEl.textContent = "Асуултаа уншаад зөв хариултаа сонгоно уу.";
    }

    if (lessonRewardCopyEl) {
      const currentQuestionNumber = Math.min(currentIndex + 1, questions.length || 1);
      const nextRewardLevel = Math.min(lessonUnlockedRewards + 1, QA_REWARD_STEPS.length);
      const nextReward = QA_REWARD_STEPS[nextRewardLevel - 1];
      lessonRewardCopyEl.textContent = nextReward
        ? `${currentQuestionNumber}/${questions.length} асуулт • дараагийн шагнал: ${nextReward.label}`
        : `${currentQuestionNumber}/${questions.length} асуулт • бүх шагнал нээгдсэн байна.`;
    }
  }

  function renderQuestion() {
    setLocked(false);
    const questions = getQuestions();
    const currentIndex = getCurrentIndex();
    const item = questions[currentIndex];
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
    const level = getLevel();
    const chapterContent = getActiveLearningSelection();
    const lessonContent = resolveLessonContent({
      packId: chapterContent.lessonPackId,
      worldId: chapterContent.worldId,
      chapterId: chapterContent.chapter?.id || null,
      difficulty: level,
    });
    const questions = shuffle(lessonContent.entries).slice(0);
    setQuestions(questions);
    if (!questions.length) {
      showWorldFeedbackChip("⚠️ Энэ бүлгийн lesson pack-д бодит агуулга хараахан ороогүй байна.", "warning");
      return;
    }

    setCurrentIndex(0);
    setScore(0);
    setLocked(false);
    setLessonReviewMode(false);
    loadProgressState();
    syncProgressForToday();
    persistProgressState();
    stopSpeaking();
    showLessonScreen();
    renderQuestion();
  }

  function pickAnswer(buttonEl, selected) {
    if (getLocked()) return;
    setLocked(true);

    const questions = getQuestions();
    const currentIndex = getCurrentIndex();
    const correct = questions[currentIndex].a;

    const { isCorrect } = renderLessonAnswerState({
      selectedButton: buttonEl,
      correctAnswer: correct,
      selectedAnswer: selected,
      revealed: true,
      nextActionLabel: currentIndex >= questions.length - 1 ? "Үр дүн, шагналаа харах" : "Дараагийн асуулт руу",
    });

    if (isCorrect) {
      if (!isLessonReviewMode()) {
        setScore(getScore() + 1);
        awardXp(1, "quiz_correct_answer", getLessonRewardEventId({
          coreState: getCoreState(),
          level: getLevel(),
          currentIndex,
          question: questions[currentIndex]?.q || "",
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
    const questions = getQuestions();
    const score = getScore();
    const level = getLevel();
    const totalQuestions = questions.length;
    const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const rewardCount = getLessonUnlockedRewards();

    if (finalTextEl) {
      finalTextEl.textContent = `Таны оноо: ${score} / ${questions.length}  •  Түвшин: ${levelName(level)}`;
    }
    if (lessonFinishTitleEl) {
      lessonFinishTitleEl.textContent = `Хичээл дууслаа — ${score}/${totalQuestions} зөв, ${percent}% амжилттай.`;
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
    const nextIndex = getCurrentIndex() + 1;
    setCurrentIndex(nextIndex);
    updateHeaderStatus();
    if (nextIndex < getQuestions().length) {
      renderQuestion();
      return;
    }
    endQuiz();
  }

  function startReview(savedItem) {
    setLessonReviewMode(true);
    setQuestions([{
      q: savedItem.questionText || "",
      a: savedItem.correctAnswer || "",
      replayOptions: Array.isArray(savedItem.options) ? savedItem.options.slice() : [],
    }]);
    setCurrentIndex(0);
    setLocked(false);
    stopSpeaking();
    showLessonScreen();
    renderQuestion();
  }

  return {
    startQuiz,
    renderQuestion,
    nextQuestion,
    startReview,
    updateLessonFlowUi,
  };
}
