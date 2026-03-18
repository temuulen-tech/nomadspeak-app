/**
 * ui.js
 * Shared UI controller/helpers for common UI state and interaction behavior.
 */

function resolveElement(elementOrSelector) {
  if (!elementOrSelector) return null;
  if (typeof elementOrSelector === "string") return document.querySelector(elementOrSelector);
  return elementOrSelector;
}

export function toggleClass(elementOrSelector, className, force) {
  const element = resolveElement(elementOrSelector);
  if (!element || !className) return false;
  if (typeof force === "boolean") {
    element.classList.toggle(className, force);
    return force;
  }
  return element.classList.toggle(className);
}

export function setHidden(elementOrSelector, hidden = true) {
  const element = resolveElement(elementOrSelector);
  if (!element) return false;
  element.classList.toggle("hidden", hidden);
  return hidden;
}

export function showElement(elementOrSelector) {
  return setHidden(elementOrSelector, false);
}

export function hideElement(elementOrSelector) {
  return setHidden(elementOrSelector, true);
}

export function isHidden(elementOrSelector) {
  const element = resolveElement(elementOrSelector);
  return !element || element.classList.contains("hidden");
}

export function setExpandedState(controlEl, targetEl, isOpen) {
  const control = resolveElement(controlEl);
  if (targetEl) setHidden(targetEl, !isOpen);
  if (control) control.setAttribute("aria-expanded", isOpen ? "true" : "false");
  return isOpen;
}

export function toggleExpandedPanel(controlEl, targetEl, nextOpen) {
  const isOpen = typeof nextOpen === "boolean" ? nextOpen : isHidden(targetEl);
  return setExpandedState(controlEl, targetEl, isOpen);
}

export function setPressedState(elementOrSelector, isPressed) {
  const element = resolveElement(elementOrSelector);
  if (!element) return isPressed;
  element.setAttribute("aria-pressed", isPressed ? "true" : "false");
  return isPressed;
}

export function setSelectedState(elementOrSelector, isSelected) {
  const element = resolveElement(elementOrSelector);
  if (!element) return isSelected;
  element.setAttribute("aria-selected", isSelected ? "true" : "false");
  return isSelected;
}

export function setCheckedState(elementOrSelector, isChecked) {
  const element = resolveElement(elementOrSelector);
  if (!element) return isChecked;
  element.setAttribute("aria-checked", isChecked ? "true" : "false");
  return isChecked;
}

export function setText(elementOrSelector, text = "") {
  const element = resolveElement(elementOrSelector);
  if (!element) return;
  element.textContent = text;
}

export function setDisabledState(elementOrSelector, isDisabled, ariaTarget = elementOrSelector) {
  const element = resolveElement(elementOrSelector);
  const ariaElement = resolveElement(ariaTarget);
  if (element && "disabled" in element) element.disabled = isDisabled;
  if (ariaElement) ariaElement.setAttribute("aria-disabled", isDisabled ? "true" : "false");
  return isDisabled;
}

export function setActiveState(elementOrSelector, isActive, activeClass = "active") {
  toggleClass(elementOrSelector, activeClass, isActive);
  return isActive;
}

export function syncToggleButtons(buttons, isActive, options = {}) {
  const list = Array.from(buttons || []);
  const {
    activeClass = "active",
    pressed = true,
    selected = false,
    checked = false,
  } = options;

  list.forEach((button) => {
    if (!button) return;
    toggleClass(button, activeClass, isActive(button));
    if (pressed) setPressedState(button, isActive(button));
    if (selected) setSelectedState(button, isActive(button));
    if (checked) setCheckedState(button, isActive(button));
  });
}
