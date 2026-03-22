function normalizeText(value = "") {
  return String(value || "").trim();
}

function normalizeItemType(value = "lesson") {
  return value === "qa" ? "qa" : "lesson";
}

function normalizeRoundId(value = "") {
  return normalizeText(value);
}

export function buildReviewItemKey({
  itemType = "lesson",
  worldId = "",
  chapterId = "",
  level = "",
  question = "",
  answer = "",
  roundId = "",
} = {}) {
  return [
    normalizeItemType(itemType),
    worldId,
    chapterId,
    level,
    normalizeRoundId(roundId),
    normalizeText(question).toLowerCase(),
    normalizeText(answer).toLowerCase(),
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join("::");
}

export function normalizeReviewItem(rawItem = {}) {
  const item = rawItem && typeof rawItem === "object" ? rawItem : {};
  const options = Array.isArray(item.options)
    ? [...new Set(item.options.map((option) => normalizeText(option)).filter(Boolean))].slice(0, 16)
    : [];

  return {
    key: normalizeText(item.key),
    itemType: normalizeItemType(item.itemType),
    worldId: normalizeText(item.worldId),
    chapterId: normalizeText(item.chapterId),
    level: normalizeText(item.level),
    qaSetId: normalizeText(item.qaSetId),
    roundId: normalizeRoundId(item.roundId),
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
      itemType: item.itemType,
      worldId: item.worldId,
      chapterId: item.chapterId,
      level: item.level,
      roundId: item.roundId,
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
      if ((right.lastMissedAt || 0) !== (left.lastMissedAt || 0)) return (right.lastMissedAt || 0) - (left.lastMissedAt || 0);
      return (left.queuedAt || 0) - (right.queuedAt || 0);
    })
    .slice(0, 60);
}
