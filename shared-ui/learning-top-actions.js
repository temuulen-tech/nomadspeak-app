import { STANDARDIZED_UI_LABELS } from "../constants.js";

const TOP_ACTION_IDS = {
  LESSON: "lesson",
  SENTENCES: "sentences",
  SENTENCE_GAME: "sentence-game",
  QA: "qa",
};

const SHARED_BUTTON_CLASSES = {
  exit: "primary play-exit-btn game-exit-btn learning-exit-btn top-action-button",
  timeDetails: "secondary time-details-btn learning-utility-btn learning-alltime-btn top-action-button",
  vaultOpen: "secondary vault-open-btn learning-utility-btn learning-utility-btn--stacked top-action-button",
  save: "secondary vault-save-btn learning-utility-btn learning-utility-btn--stacked top-action-button",
  sound: "secondary sound-toggle-btn learning-utility-btn top-action-button",
};

function createButtonMarkup({ id = "", className, label, attrs = "", badgeId = "" }) {
  const idAttr = id ? ` id="${id}"` : "";
  const badgeMarkup = badgeId ? ` <span class="vault-badge" id="${badgeId}">0</span>` : "";
  return `<button class="${className}"${idAttr} type="button"${attrs}>${label}${badgeMarkup}</button>`;
}

function createRowMarkup(rowNumber, content) {
  return `<div class="learning-master-row learning-master-row-${rowNumber}">${content}</div>`;
}

function createLessonLevelPickerMarkup() {
  return `
    <div class="start-level-picker">
      <button
        class="secondary learning-utility-btn learning-level-btn top-action-button"
        id="start-btn"
        type="button"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="start-level-dropdown"
      >Түвшин сонгох</button>
      <div class="start-level-dropdown hidden" id="start-level-dropdown" role="menu" aria-label="Түвшин сонгох">
        <button class="start-level-option active" type="button" data-level="beginner" role="menuitem">Анхан</button>
        <button class="start-level-option" type="button" data-level="intermediate" role="menuitem">Дунд</button>
        <button class="start-level-option" type="button" data-level="advanced" role="menuitem">Дээд</button>
      </div>
    </div>
  `;
}

function createSentencesLevelPickerMarkup() {
  return `
    <div class="sentences-level-picker" id="sentences-level-picker">
      <button class="filter-btn sentences-level-picker-btn learning-level-btn top-action-button" id="sentences-level-picker-btn" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="sentences-level-options">Түвшин сонгох: Анхан</button>
      <div class="sentences-level-options hidden" id="sentences-level-options" role="menu" aria-label="Түвшин сонголт">
        <button class="sentences-level-option" type="button" role="menuitemradio" aria-checked="true" data-filter="beginner">Анхан</button>
        <button class="sentences-level-option" type="button" role="menuitemradio" aria-checked="false" data-filter="intermediate">Дунд</button>
        <button class="sentences-level-option" type="button" role="menuitemradio" aria-checked="false" data-filter="advanced">Дээд</button>
      </div>
    </div>
  `;
}

function createSentenceGameLevelPickerMarkup() {
  return `
    <div class="sentence-game-difficulty-wrap">
      <button class="sentence-game-difficulty-toggle learning-level-btn top-action-button" id="sentence-game-difficulty-toggle-btn" type="button" aria-expanded="false" aria-controls="sentence-game-difficulty-panel">Түвшин сонгох</button>
      <div class="sentence-game-difficulty-panel hidden" id="sentence-game-difficulty-panel">
        <button class="sentence-game-difficulty-btn" type="button" data-difficulty="beginner">Анхан шат</button>
        <button class="sentence-game-difficulty-btn" type="button" data-difficulty="intermediate">Дунд шат</button>
        <button class="sentence-game-difficulty-btn" type="button" data-difficulty="advanced">Дээд түвшин</button>
      </div>
    </div>
  `;
}

function createQaLevelPickerMarkup() {
  return `
    <div class="qa-level-picker">
      <button class="secondary learning-level-btn top-action-button" id="qa-level-select-btn" type="button">Түвшин сонгох</button>
      <div class="qa-level-options hidden" id="qa-level-options">
        <button class="secondary" type="button" data-qa-level="beginner">Анхан</button>
        <button class="secondary" type="button" data-qa-level="intermediate">Дунд</button>
        <button class="secondary" type="button" data-qa-level="advanced">Дээд</button>
      </div>
    </div>
  `;
}

const TOP_ACTION_RENDERERS = {
  [TOP_ACTION_IDS.LESSON]: () => createTopActionsMarkup({
    vaultButtonClassName: SHARED_BUTTON_CLASSES.vaultOpen,
    vaultButtonId: "lesson-vault-btn",
    vaultBadgeId: "lesson-vault-badge",
    levelPickerMarkup: createLessonLevelPickerMarkup(),
    saveButtonId: "lesson-save-btn",
  }),
  [TOP_ACTION_IDS.SENTENCES]: () => createTopActionsMarkup({
    vaultButtonClassName: `${SHARED_BUTTON_CLASSES.vaultOpen} sentences-vault-compact-btn`,
    vaultButtonId: "sentences-vault-btn",
    vaultBadgeId: "sentences-vault-badge",
    levelPickerMarkup: createSentencesLevelPickerMarkup(),
    saveButtonId: "sentences-save-btn",
  }),
  [TOP_ACTION_IDS.SENTENCE_GAME]: () => createTopActionsMarkup({
    vaultButtonClassName: SHARED_BUTTON_CLASSES.vaultOpen,
    vaultButtonId: "sentence-game-vault-btn",
    vaultBadgeId: "sentence-game-vault-badge",
    levelPickerMarkup: createSentenceGameLevelPickerMarkup(),
    saveButtonId: "sentence-game-save-btn",
  }),
  [TOP_ACTION_IDS.QA]: () => createTopActionsMarkup({
    vaultButtonClassName: SHARED_BUTTON_CLASSES.vaultOpen,
    vaultButtonId: "qa-vault-btn",
    vaultBadgeId: "qa-vault-badge",
    levelPickerMarkup: createQaLevelPickerMarkup(),
    saveButtonId: "qa-save-btn",
  }),
};

function createTopActionsMarkup({ vaultButtonClassName, vaultButtonId, vaultBadgeId, levelPickerMarkup, saveButtonId }) {
  return `
    ${createRowMarkup(1, [
      createButtonMarkup({ className: SHARED_BUTTON_CLASSES.exit, label: "Тоглоомоос гарах" }),
      createButtonMarkup({ className: SHARED_BUTTON_CLASSES.timeDetails, label: STANDARDIZED_UI_LABELS.timeDetails }),
    ].join(""))}
    ${createRowMarkup(2, [
      createButtonMarkup({ className: vaultButtonClassName, id: vaultButtonId, label: STANDARDIZED_UI_LABELS.savedExercises, badgeId: vaultBadgeId }),
      levelPickerMarkup.trim(),
    ].join(""))}
    ${createRowMarkup(3, [
      createButtonMarkup({ className: SHARED_BUTTON_CLASSES.save, id: saveButtonId, label: STANDARDIZED_UI_LABELS.saveExercise }),
      createButtonMarkup({ className: SHARED_BUTTON_CLASSES.sound, label: "🔊 Дуу: АСААЛТТАЙ", attrs: ' aria-pressed="true"' }),
    ].join(""))}
  `;
}

export function renderLearningTopActions(variant) {
  const render = TOP_ACTION_RENDERERS[variant];
  if (!render) return "";
  return render().trim();
}

export function mountLearningTopActions(root = document) {
  if (!root?.querySelectorAll) return;

  root.querySelectorAll("[data-learning-top-actions]").forEach((container) => {
    const variant = container.dataset.learningTopActions;
    const markup = renderLearningTopActions(variant);
    if (!markup) return;
    container.innerHTML = markup;
  });
}

export const LEARNING_TOP_ACTION_VARIANTS = Object.freeze({ ...TOP_ACTION_IDS });
