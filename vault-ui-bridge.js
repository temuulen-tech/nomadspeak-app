import { SCREEN_NAMES } from "./constants.js";

export function createVaultUiBridge({
  getVaultManager,
  filteredSentences,
  getSpeakingSentenceId,
  lessonFlow,
  buildOptions,
  lessonMnTranslation,
  levelName,
  getLessonLevel,
  qaFlow,
  getSentenceGameSentence,
  getSentenceGameDifficulty,
}) {
  function vaultKeyForScreen(screenId) {
    return getVaultManager()?.keyForScreen(screenId) || `repeatVault_${screenId}`;
  }

  function updateVaultBadge(key) {
    getVaultManager()?.updateBadge(key);
  }

  function renderVaultModal(key) {
    getVaultManager()?.renderModal(key);
  }

  function saveSentenceListItem(item) {
    getVaultManager()?.saveSentenceListItem(item);
  }

  function saveCurrentSentencesItem() {
    const visible = filteredSentences();
    if (!visible.length) return;
    const active = visible.find((item) => String(item.id) === String(getSpeakingSentenceId() || ""));
    saveSentenceListItem(active || visible[0]);
  }

  function saveCurrentLessonItem() {
    const lessonState = lessonFlow.getState();
    const item = lessonState.questions[lessonState.currentIndex];
    if (!item) return;
    const options = buildOptions(item.a);
    const optionMnMap = options.reduce((acc, option) => {
      acc[option] = lessonMnTranslation(option);
      return acc;
    }, {});
    const payload = {
      id: `lesson:${item.q.toLowerCase().trim()}`,
      questionText: item.q,
      questionMn: item.qMn || lessonMnTranslation(item.q),
      correctAnswer: item.a,
      correctAnswerMn: item.aMn || lessonMnTranslation(item.a),
      options,
      optionMnMap,
      level: levelName(getLessonLevel()),
      timestamp: Date.now(),
    };
    const key = vaultKeyForScreen(SCREEN_NAMES.LESSON);
    const result = getVaultManager()?.saveToVault(key, payload);
    updateVaultBadge(key);
    getVaultManager()?.showSaveResult(result);
  }

  function saveCurrentQaRound() {
    const round = qaFlow.getQaCurrentRound();
    if (!round) return;
    const payload = {
      id: `qna:${round.id}`,
      mnQuestion: round.mnQuestion,
      mnAnswer: round.mnAnswer,
      enQuestion: round.enQuestion,
      enAnswer: round.enAnswer,
      level: levelName(qaFlow.getState().qaGameLevel || "beginner"),
      timestamp: Date.now(),
    };
    const key = vaultKeyForScreen("qna");
    const result = getVaultManager()?.saveToVault(key, payload);
    updateVaultBadge(key);
    getVaultManager()?.showSaveResult(result);
  }

  function saveCurrentSentenceGameItem() {
    const item = getSentenceGameSentence();
    if (!item) return;
    const payload = {
      id: `sentenceGame:${String(item.en || "").toLowerCase().trim()}`,
      enSentence: item.en,
      mnTranslation: item.mn || "",
      level: levelName(getSentenceGameDifficulty()),
      timestamp: Date.now(),
    };
    const key = vaultKeyForScreen("sentenceGame");
    const result = getVaultManager()?.saveToVault(key, payload);
    updateVaultBadge(key);
    getVaultManager()?.showSaveResult(result);
  }

  return {
    vaultKeyForScreen,
    updateVaultBadge,
    renderVaultModal,
    saveSentenceListItem,
    saveCurrentSentencesItem,
    saveCurrentLessonItem,
    saveCurrentQaRound,
    saveCurrentSentenceGameItem,
  };
}
