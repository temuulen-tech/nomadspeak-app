/**
 * modal.js
 * Modal/overlay controller for shared dialog and overlay lifecycle behavior.
 */

import { hideElement, showElement, setText } from "./ui.js";

function resolveElement(elementOrSelector) {
  if (!elementOrSelector) return null;
  if (typeof elementOrSelector === "string") return document.querySelector(elementOrSelector);
  return elementOrSelector;
}

export function openModal(modalEl, options = {}) {
  const modal = resolveElement(modalEl);
  if (!modal) return false;

  const {
    titleEl,
    title,
    bodyEl,
    body,
    bodyHtml,
  } = options;

  if (titleEl && title !== undefined) setText(titleEl, title);

  const resolvedBody = resolveElement(bodyEl);
  if (resolvedBody) {
    if (bodyHtml !== undefined) resolvedBody.innerHTML = bodyHtml;
    else if (body !== undefined) setText(resolvedBody, body);
  }

  showElement(modal);
  return true;
}

export function closeModal(modalEl) {
  const modal = resolveElement(modalEl);
  if (!modal) return false;
  hideElement(modal);
  return true;
}

export function bindModalBackdropClose(modalEl, onClose = () => closeModal(modalEl)) {
  const modal = resolveElement(modalEl);
  if (!modal) return;
  modal.addEventListener("click", (event) => {
    if (event.target === modal) onClose();
  });
}

export function bindModalDismissal({ modalEl, closeBtn, onClose = () => closeModal(modalEl) } = {}) {
  const modal = resolveElement(modalEl);
  const button = resolveElement(closeBtn);
  if (button) button.addEventListener("click", onClose);
  bindModalBackdropClose(modal, onClose);
}
