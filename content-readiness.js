import { CHAPTER_CONFIGS } from "./chapters.js";
import { getLessonContentPackById, getLessonWordBank } from "./lesson.js";
import { getQaContentSet } from "./qa-game.js";
import { getSentenceContentBank } from "./sentence-game.js";
import sentenceRows from "./data/sentences.json" with { type: "json" };

function summarizeChapterReadiness(chapter) {
  const lessonPack = getLessonContentPackById(chapter.lessonPackId);
  const lessonWordBank = getLessonWordBank({ packId: chapter.lessonPackId, worldId: chapter.worldId, chapterId: chapter.id });
  const qaSet = getQaContentSet(chapter.qaSetId);
  const sentenceBank = getSentenceContentBank(chapter.sentenceBankId);
  const sentenceRowCount = sentenceRows.filter((row) => row.bankId === chapter.sentenceBankId).length;

  return {
    chapterId: chapter.id,
    worldId: chapter.worldId,
    title: chapter.title,
    lessonPackId: chapter.lessonPackId,
    lessonEntryCount: lessonPack?.entries?.length || 0,
    lessonState: lessonPack?.expansion?.lessonPack?.state || "missing",
    wordBankId: chapter.wordBankId,
    wordBankTokenCount: lessonWordBank?.tokens?.length || 0,
    wordBankState: lessonWordBank?.state || "missing",
    qaSetId: chapter.qaSetId,
    qaRoundCount: qaSet?.rounds?.length || 0,
    qaState: qaSet?.state || "missing",
    sentenceBankId: chapter.sentenceBankId,
    sentenceBankState: sentenceBank?.state || "missing",
    sentenceRowCount,
    blockers: [
      ...(lessonPack ? [] : [`Missing lesson pack ${chapter.lessonPackId}`]),
      ...(lessonWordBank ? [] : [`Missing word bank ${chapter.wordBankId}`]),
      ...(qaSet ? [] : [`Missing QA set ${chapter.qaSetId}`]),
      ...(sentenceBank ? [] : [`Missing sentence bank ${chapter.sentenceBankId}`]),
    ],
  };
}

export function getContentReadinessReport() {
  const chapters = Object.values(CHAPTER_CONFIGS).map((chapter) => summarizeChapterReadiness(chapter));
  const placeholderChapters = chapters.filter((chapter) => (
    chapter.lessonState !== "ready"
    || chapter.qaState !== "ready"
    || chapter.sentenceBankState !== "ready"
    || chapter.sentenceRowCount === 0
  ));

  return {
    chapters,
    readyChapterIds: chapters.filter((chapter) => (
      chapter.lessonEntryCount > 0
      && chapter.qaRoundCount > 0
      && chapter.sentenceRowCount > 0
      && chapter.blockers.length === 0
    )).map((chapter) => chapter.chapterId),
    placeholderChapterIds: placeholderChapters.map((chapter) => chapter.chapterId),
    blockers: chapters.flatMap((chapter) => chapter.blockers.map((blocker) => `${chapter.chapterId}: ${blocker}`)),
  };
}
