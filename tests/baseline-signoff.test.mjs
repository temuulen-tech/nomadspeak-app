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
const chapters = await import('../chapters.js');

function reset() {
  localStorage.clear();
  actions.resetCoreState(state.createDefaultCoreState());
}

test.beforeEach(() => {
  reset();
});

test('baseline boot state keeps the home-to-board selector route intact', () => {
  const runtimeState = state.getState();
  const boardEntry = state.getBoardEntryState();
  const defaultChapter = chapters.getDefaultChapterForWorld(runtimeState.core.selectedWorldId);

  assert.equal(runtimeState.currentScreen, constants.SCREEN_NAMES.START);
  assert.equal(runtimeState.core.selectedWorldId, 'world1');
  assert.equal(runtimeState.core.selectedDifficultyId, constants.DIFFICULTY_LEVELS.BEGINNER);
  assert.equal(boardEntry.step, constants.BOARD_SELECTOR_STEPS.ENTRY);
  assert.equal(boardEntry.worldId, runtimeState.core.selectedWorldId);
  assert.equal(boardEntry.difficultyId, runtimeState.core.selectedDifficultyId);
  assert.equal(boardEntry.chapterId, defaultChapter?.id);
});

test('progress, rewards, settings, and board selections survive save and reload', () => {
  actions.updateSelections({
    selectedWorldId: 'world1',
    selectedDifficultyId: constants.DIFFICULTY_LEVELS.ADVANCED,
  });
  actions.unlockChapter('ch2');
  actions.markWordLearned('harbor');
  actions.completeLesson({
    xpEarned: 15,
    today: '2026-03-20',
    yesterday: '2026-03-19',
    countLesson: true,
    rewardTierUnlocked: 2,
    eventId: 'phase54:lesson:1',
  });
  actions.claimReward({
    coins: 10,
    gems: 1,
    eventId: 'phase54:reward:1',
  });
  actions.updateSettings({
    soundEnabled: false,
    profileName: ' Baseline Tester ',
    ttsSettings: { voice: 'female', rate: 1.1 },
  });

  const reloaded = actions.loadCoreState();

  assert.equal(reloaded.selectedDifficultyId, constants.DIFFICULTY_LEVELS.ADVANCED);
  assert.equal(reloaded.selectedWorldId, 'world1');
  assert.deepEqual(reloaded.unlockedChapterIds, ['ch2']);
  assert.deepEqual(reloaded.learnedWords, ['harbor']);
  assert.equal(reloaded.progress.xp, 50);
  assert.equal(reloaded.progress.todayCount, 3);
  assert.equal(reloaded.progress.rewardTierUnlocked, 2);
  assert.equal(reloaded.rewardsWallet.coins, 10);
  assert.equal(reloaded.rewardsWallet.gems, 1);
  assert.equal(reloaded.settings.soundEnabled, false);
  assert.equal(reloaded.settings.profileName, 'Baseline Tester');
  assert.deepEqual(reloaded.settings.ttsSettings, { voice: 'female', rate: 1.1 });
});

test('content-ready ownership stays mapped to dedicated modules instead of script.js', () => {
  assert.equal(constants.CONTENT_READY_BASELINE.phase, 54);
  assert.equal(constants.CONTENT_READY_BASELINE.status, 'content-ready');
  assert.deepEqual(constants.CONTENT_READY_BASELINE.stablePaths.worldAndChapterRouting, ['worlds.js', 'chapters.js']);
  assert.deepEqual(constants.CONTENT_READY_BASELINE.stablePaths.lessonAndGameContent, [
    'lesson.js',
    'qa-game.js',
    'sentence-game.js',
    'data/sentences.json',
  ]);
  assert.deepEqual(constants.CONTENT_READY_BASELINE.stablePaths.visualAndAnimationAssets, ['assets.js']);
  assert.ok(constants.CONTENT_READY_BASELINE.stablePaths.lifecycleAndNavigation.includes('script.js'));
});
