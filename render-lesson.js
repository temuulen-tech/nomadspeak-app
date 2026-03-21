/**
 * render-lesson.js
 * Renders and updates only lesson/quiz UI (prompt, options, answer/result display).
 */

export function renderLessonScreen({ question, options = [], onPickAnswer } = {}) {
  const questionEl = document.getElementById("question");
  const optionsEl = document.getElementById("options");
  const resultEl = document.getElementById("result");
  const flowCopyEl = document.getElementById("lesson-flow-copy");
  const nextBtn = document.getElementById("next-btn");
  const flowStepEls = [...document.querySelectorAll(".lesson-flow-step")];

  if (resultEl) {
    resultEl.textContent = "";
    resultEl.className = "result hidden";
  }

  if (flowCopyEl) flowCopyEl.textContent = "Асуултаа уншаад зөв хариултаа сонгоно уу.";
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.textContent = "Хариулсны дараа дараагийн алхам нээгдэнэ";
  }
  flowStepEls.forEach((stepEl, index) => stepEl.classList.toggle("is-active", index === 0));

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

export function renderLessonAnswerState({ selectedButton, correctAnswer, selectedAnswer, revealed = true, nextActionLabel = "Дараагийн асуулт руу" } = {}) {
  const optionsEl = document.getElementById("options");
  const resultEl = document.getElementById("result");
  const nextBtn = document.getElementById("next-btn");
  const flowCopyEl = document.getElementById("lesson-flow-copy");
  const flowStepEls = [...document.querySelectorAll(".lesson-flow-step")];
  const buttons = optionsEl ? [...optionsEl.querySelectorAll(".option")] : [];

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) btn.classList.add("correct");
  });

  const isCorrect = selectedAnswer === correctAnswer;
  if (selectedButton) selectedButton.classList.add(isCorrect ? "correct" : "wrong");

  if (resultEl) {
    resultEl.textContent = isCorrect
      ? "✅ Зөв! Одоо дараагийн алхам руу орно уу."
      : `❌ Буруу! Зөв нь: ${correctAnswer}. Одоо үргэлжлүүлээд дараагийн асуулт руу орж болно.`;
    resultEl.classList.add(isCorrect ? "ok" : "bad");
    if (revealed) resultEl.classList.remove("hidden");
  }

  if (flowCopyEl) {
    flowCopyEl.textContent = isCorrect
      ? "Сайн байна! Үр дүнгээ хараад дараагийн асуулт руу шилжинэ үү."
      : "Зөв хариултыг харлаа. Одоо дараагийн асуултаар ахицаа үргэлжлүүлээрэй.";
  }
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.textContent = nextActionLabel;
  }
  flowStepEls.forEach((stepEl, index) => stepEl.classList.toggle("is-active", index === 2));

  return { isCorrect };
}
