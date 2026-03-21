import { bindModalDismissal } from "./modal.js";
import { bindClickOnce, isHidden, setHidden } from "./ui.js";

export function createQaControls({ dom = {}, actions = {} }) {
  const {
    levelSelectBtn,
    levelOptionsEl,
    levelButtons = [],
    checkBtn,
    toggleQuestionBtn,
    toggleAnswerBtn,
    enQuestionWrap,
    enAnswerWrap,
    showSentencesBtn,
    showHelpBtn,
    modalEl,
    modalCloseBtn,
  } = dom;

  const {
    resetScreen = () => {},
    selectLevel = () => {},
    checkAnswer = () => {},
    openSentencesModal = () => {},
    openHelpModal = () => {},
    closeModal = () => {},
  } = actions;

  return function initializeQaControls() {
    resetScreen();

    bindClickOnce(levelSelectBtn, "qa:level-toggle", () => {
      setHidden(levelOptionsEl, !isHidden(levelOptionsEl));
    });

    levelButtons.forEach((btn) => {
      bindClickOnce(btn, `qa:level:${btn.dataset.qaLevel || btn.textContent}`, () => selectLevel(btn.dataset.qaLevel));
    });

    bindClickOnce(checkBtn, "qa:check", checkAnswer);
    bindClickOnce(toggleQuestionBtn, "qa:toggle-question", () => {
      const willShow = isHidden(enQuestionWrap);
      setHidden(enQuestionWrap, !willShow);
      toggleQuestionBtn.textContent = willShow ? "Асуултыг нуух" : "Асуултыг харах";
    });
    bindClickOnce(toggleAnswerBtn, "qa:toggle-answer", () => {
      const willShow = isHidden(enAnswerWrap);
      setHidden(enAnswerWrap, !willShow);
      toggleAnswerBtn.textContent = willShow ? "Хариултыг нуух" : "Хариултыг харах";
    });
    bindClickOnce(showSentencesBtn, "qa:show-sentences", openSentencesModal);
    bindClickOnce(showHelpBtn, "qa:show-help", openHelpModal);
    bindModalDismissal({
      modalEl,
      closeBtn: modalCloseBtn,
      onClose: closeModal,
    });
  };
}
