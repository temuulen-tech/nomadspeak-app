import test from 'node:test';
import assert from 'node:assert/strict';

const registry = await import('../content-registry.js');
const chapters = await import('../chapters.js');
const sentenceGame = await import('../sentence-game.js');
const constants = await import('../constants.js');

test('chapter configs and registry stay aligned for world 1 content ids', () => {
  const chapter2Refs = registry.getChapterContentRefs(constants.WORLD_IDS.WORLD_1, constants.CHAPTER_IDS.CH2);
  const chapter2 = chapters.getChapterConfig(constants.CHAPTER_IDS.CH2);

  assert.equal(chapter2.lessonPackId, chapter2Refs.lessonPackId);
  assert.equal(chapter2.wordBankId, chapter2Refs.wordBankId);
  assert.equal(chapter2.qaSetId, chapter2Refs.qaSetId);
  assert.equal(chapter2.sentenceBankId, chapter2Refs.sentenceBankId);
});

test('sentence rows normalize routing metadata and can be filtered by bank id', () => {
  const items = sentenceGame.prepareSentenceItems([
    { id: 1, bankId: 'sentence-bank-shared-default', worldId: 'world1', chapterId: 'ch1', level: 'beginner', topic: 'A', en: 'Hello there.', mn: 'Сайн уу.' },
    { id: 2, bankId: 'sentence-bank-world1-ch2-placeholder', worldId: 'world1', chapterId: 'ch2', level: 'beginner', topic: 'B', en: 'They see the shore.', mn: 'Тэд эргийг харж байна.' },
  ]);

  const chapter2Items = sentenceGame.filterSentenceItemsForBank(items, 'sentence-bank-world1-ch2-placeholder');
  const fallbackItems = sentenceGame.filterSentenceItemsForBank(items, 'missing-bank');

  assert.equal(chapter2Items.length, 1);
  assert.equal(chapter2Items[0].chapterId, 'ch2');
  assert.deepEqual(chapter2Items[0].tokens, ['They', 'see', 'the', 'shore', '.']);
  assert.equal(fallbackItems.length, 1);
  assert.equal(fallbackItems[0].bankId, 'sentence-bank-shared-default');
});
