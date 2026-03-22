import test from 'node:test';
import assert from 'node:assert/strict';

class LocalStorageMock {
  constructor() {
    this.store = new Map();
  }
  clear() {
    this.store.clear();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
}

globalThis.localStorage = new LocalStorageMock();

const actions = await import('../actions.js');
const state = await import('../state.js');
const constants = await import('../constants.js');

function reset() {
  localStorage.clear();
  actions.resetCoreState(state.createDefaultCoreState());
}

test.beforeEach(() => {
  reset();
});

test('updateSelections ignores unsupported world and difficulty ids', () => {
  const baseline = state.getCoreState();
  assert.equal(baseline.selectedWorldId, 'world1');
  assert.equal(baseline.selectedDifficultyId, constants.DIFFICULTY_LEVELS.BEGINNER);

  const result = actions.updateSelections({
    selectedWorldId: 'not-a-world',
    selectedDifficultyId: 'impossible',
  });

  assert.equal(result.selectedWorldId, baseline.selectedWorldId);
  assert.equal(result.selectedDifficultyId, baseline.selectedDifficultyId);
  assert.equal(state.getCoreState().selectedWorldId, baseline.selectedWorldId);
  assert.equal(state.getCoreState().selectedDifficultyId, baseline.selectedDifficultyId);
});

test('updateSelections persists valid board selections', () => {
  const result = actions.updateSelections({
    selectedWorldId: 'world1',
    selectedDifficultyId: constants.DIFFICULTY_LEVELS.ADVANCED,
  });

  assert.equal(result.selectedWorldId, 'world1');
  assert.equal(result.selectedDifficultyId, constants.DIFFICULTY_LEVELS.ADVANCED);

  assert.equal(localStorage.getItem('nomadspeak:selected-world-id'), 'world1');
  assert.equal(localStorage.getItem('nomadspeak:selected-difficulty-id'), constants.DIFFICULTY_LEVELS.ADVANCED);
});

test('reward events are only applied once per event id', () => {
  actions.completeLesson({ xpEarned: 12, today: '2026-03-20', yesterday: '2026-03-19', eventId: 'board:tile:5:progress' });
  actions.completeLesson({ xpEarned: 12, today: '2026-03-20', yesterday: '2026-03-19', eventId: 'board:tile:5:progress' });
  actions.claimReward({ coins: 8, eventId: 'board:tile:5:wallet' });
  actions.claimReward({ coins: 8, eventId: 'board:tile:5:wallet' });

  const core = state.getCoreState();
  assert.equal(core.progress.xp, 47);
  assert.equal(core.rewardsWallet.coins, 8);
  assert.deepEqual(core.processedRewardIds.slice(-2), [
    'board:tile:5:progress',
    'board:tile:5:wallet',
  ]);
});

test('review queue survives save and reload without duplicating entries', () => {
  actions.queueLessonReviewItem({
    itemType: 'lesson',
    worldId: 'world1',
    chapterId: 'ch1',
    level: constants.DIFFICULTY_LEVELS.BEGINNER,
    questionText: 'Hello?',
    questionMn: 'Сайн уу?',
    correctAnswer: 'Hi',
    correctAnswerMn: 'Сайн',
    options: ['Hi', 'Bye'],
  });
  actions.queueLessonReviewItem({
    itemType: 'lesson',
    worldId: 'world1',
    chapterId: 'ch1',
    level: constants.DIFFICULTY_LEVELS.BEGINNER,
    questionText: 'Hello?',
    questionMn: 'Сайн уу?',
    correctAnswer: 'Hi',
    correctAnswerMn: 'Сайн',
    options: ['Hi', 'Bye'],
  });

  const reloaded = actions.loadCoreState();

  assert.equal(reloaded.reviewQueue.length, 1);
  assert.equal(reloaded.reviewQueue[0].questionText, 'Hello?');
  assert.equal(reloaded.reviewQueue[0].missedCount, 2);
  assert.equal(reloaded.reviewQueue[0].key, 'lesson::world1::ch1::beginner::hello?::hi');
});
