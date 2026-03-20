import test from 'node:test';
import assert from 'node:assert/strict';

const readiness = await import('../content-readiness.js');
const chapters = await import('../chapters.js');
const constants = await import('../constants.js');
const lesson = await import('../lesson.js');

test('content readiness report isolates starter-ready chapter 1 from placeholder chapters', () => {
  const report = readiness.getContentReadinessReport();

  assert.deepEqual(report.readyChapterIds, [constants.CHAPTER_IDS.CH1]);
  assert.deepEqual(report.placeholderChapterIds, [constants.CHAPTER_IDS.CH2, constants.CHAPTER_IDS.CH3, constants.CHAPTER_IDS.CH4]);
  assert.equal(report.blockers.length, 0);
});

test('scoped lesson resolution no longer silently falls back to starter entries for placeholder chapters', () => {
  const chapter2 = chapters.getChapterConfig(constants.CHAPTER_IDS.CH2);
  const resolved = lesson.resolveLessonContent({
    packId: chapter2.lessonPackId,
    worldId: chapter2.worldId,
    chapterId: chapter2.id,
    difficulty: constants.DIFFICULTY_LEVELS.BEGINNER,
  });

  assert.equal(resolved.pack?.id, chapter2.lessonPackId);
  assert.equal(resolved.entries.length, 0);
  assert.equal(resolved.usesDifficultyFallback, true);
});
