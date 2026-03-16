/**
 * render-lesson.js
 * Renders and updates only lesson/quiz UI (prompt, options, answer/result display).
 */

export function renderLessonScreen({ question, options = [], onPickAnswer } = {}) {
  const questionEl = document.getElementById("question");
  const optionsEl = document.getElementById("options");
  const resultEl = document.getElementById("result");

  if (resultEl) {
    resultEl.textContent = "";
    resultEl.className = "result hidden";
  }

  if (questionEl) questionEl.textContent = question || "";
  if (!optionsEl) return;

  optionsEl.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt;
    btn.addEventListener("click", () => onPickAnswer?.(btn, opt));
    optionsEl.appendChild(btn);
  });
}

export function renderLessonAnswerState({ selectedButton, correctAnswer, selectedAnswer, revealed = true } = {}) {
  const optionsEl = document.getElementById("options");
  const resultEl = document.getElementById("result");
  const buttons = optionsEl ? [...optionsEl.querySelectorAll(".option")] : [];

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) btn.classList.add("correct");
  });

  const isCorrect = selectedAnswer === correctAnswer;
  if (selectedButton) selectedButton.classList.add(isCorrect ? "correct" : "wrong");

  if (resultEl) {
    resultEl.textContent = isCorrect ? "✅ Зөв!" : `❌ Буруу! Зөв нь: ${correctAnswer}`;
    resultEl.classList.add(isCorrect ? "ok" : "bad");
    if (revealed) resultEl.classList.remove("hidden");
  }

  return { isCorrect };
}
