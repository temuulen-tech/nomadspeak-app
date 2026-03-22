function normalizeText(value = "") {
  return String(value || "").trim();
}

export function buildReviewItemKey({ worldId = "", chapterId = "", level = "", question = "", answer = "" } = {}) {
  return [worldId, chapterId, level, normalizeText(question).toLowerCase(), normalizeText(answer).toLowerCase()]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join("::");
}

export function normalizeReviewItem(rawItem = {}) {
  const item = rawItem && typeof rawItem === "object" ? rawItem : {};
  const options = Array.isArray(item.options)
    ? [...new Set(item.options.map((option) => normalizeText(option)).filter(Boolean))].slice(0, 8)
    : [];

  return {
    key: normalizeText(item.key),
    worldId: normalizeText(item.worldId),
    chapterId: normalizeText(item.chapterId),
    level: normalizeText(item.level),
    questionText: normalizeText(item.questionText),
    questionMn: normalizeText(item.questionMn),
    correctAnswer: normalizeText(item.correctAnswer),
    correctAnswerMn: normalizeText(item.correctAnswerMn),
    options,
    optionMnMap: item.optionMnMap && typeof item.optionMnMap === "object" ? { ...item.optionMnMap } : {},
    missedCount: Math.max(1, Math.floor(Number(item.missedCount) || 1)),
    queuedAt: Number.isFinite(Number(item.queuedAt)) ? Number(item.queuedAt) : Date.now(),
    lastMissedAt: Number.isFinite(Number(item.lastMissedAt)) ? Number(item.lastMissedAt) : Date.now(),
    lastReviewedAt: Number.isFinite(Number(item.lastReviewedAt)) ? Number(item.lastReviewedAt) : null,
  };
}

export function normalizeReviewQueue(rawQueue = []) {
  if (!Array.isArray(rawQueue)) return [];
  const deduped = new Map();
  rawQueue.forEach((entry) => {
    const item = normalizeReviewItem(entry);
    const fallbackKey = buildReviewItemKey({
      worldId: item.worldId,
      chapterId: item.chapterId,
      level: item.level,
      question: item.questionText,
      answer: item.correctAnswer,
    });
    const key = item.key || fallbackKey;
    if (!key || !item.questionText || !item.correctAnswer) return;
    deduped.set(key, {
      ...item,
      key,
    });
  });

  return [...deduped.values()]
    .sort((left, right) => {
      if (right.missedCount !== left.missedCount) return right.missedCount - left.missedCount;
      return (right.lastMissedAt || 0) - (left.lastMissedAt || 0);
    })
    .slice(0, 60);
}
