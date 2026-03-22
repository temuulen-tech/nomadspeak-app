import { STANDARDIZED_UI_LABELS } from "./constants.js";

const VAULT_BUTTON_IDS = [
  "lesson-vault-btn",
  "sentences-vault-btn",
  "sentence-game-vault-btn",
  "qa-vault-btn",
];

const SAVE_BUTTON_IDS = [
  "lesson-save-btn",
  "sentences-save-btn",
  "sentence-game-save-btn",
  "qa-save-btn",
];

function setButtonLabel(button, label) {
  if (!button) return;
  button.textContent = label;
}

function setBadgeButtonLabel(button, label) {
  if (!button) return;
  const badge = button.querySelector(".vault-badge");
  if (!badge) {
    button.textContent = label;
    return;
  }
  button.replaceChildren(document.createTextNode(`${label} `), badge);
}

export function applyStandardizedButtonLabels(root = document) {
  if (!root) return;

  root.querySelectorAll(".time-details-btn").forEach((button) => {
    setButtonLabel(button, STANDARDIZED_UI_LABELS.timeDetails);
  });

  VAULT_BUTTON_IDS.forEach((id) => {
    setBadgeButtonLabel(root.getElementById(id), STANDARDIZED_UI_LABELS.savedExercises);
  });

  SAVE_BUTTON_IDS.forEach((id) => {
    setButtonLabel(root.getElementById(id), STANDARDIZED_UI_LABELS.saveExercise);
  });
}
