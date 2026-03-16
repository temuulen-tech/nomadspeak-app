/**
 * lesson-screen.js
 * Owns lesson screen controls and lesson-specific entry actions.
 */

export function initLessonScreen(handlers = {}) {
  const lessonScreenEl = document.getElementById("quiz-screen");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");

  if (nextBtn) nextBtn.addEventListener("click", () => handlers.onNext?.());
  if (restartBtn) restartBtn.addEventListener("click", () => handlers.onRestart?.());

  return {
    id: "lesson",
    element: lessonScreenEl,
    activate: () => handlers.onActivate?.(),
    deactivate: () => handlers.onDeactivate?.(),
  };
}
