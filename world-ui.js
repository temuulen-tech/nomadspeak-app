export const ADVENTURE_COMPANION_LINES = {
  sentences: {
    idle: "Өгүүлбэр бүрийг амилуулж сонсоорой. Дуугаа дарж аяллын хэлээ хөгжүүлээрэй.",
    success: "Чи өгүүлбэрийн хэмнэлийг маш сайн барьж байна.",
    reward: "Сайхан ахиц! Түүхэн замд шинэ тэмдэг нээгдлээ.",
  },
};

export function showWorldFeedbackChip(hubEl, text, tone = "reward") {
  if (!hubEl || !text) return;
  const chip = document.createElement("div");
  chip.className = `world-feedback-chip world-feedback-${tone}`;
  chip.textContent = text;
  hubEl.appendChild(chip);
  requestAnimationFrame(() => chip.classList.add("show"));
  setTimeout(() => {
    chip.classList.remove("show");
    setTimeout(() => chip.remove(), 260);
  }, 1700);
}

export function updateCompanionLine(mode, tone = "idle", dom = {}) {
  const { sentencesCompanionLineEl = null } = dom;
  if (mode === "sentences" && sentencesCompanionLineEl) {
    sentencesCompanionLineEl.textContent = ADVENTURE_COMPANION_LINES.sentences[tone] || ADVENTURE_COMPANION_LINES.sentences.idle;
  }
}
