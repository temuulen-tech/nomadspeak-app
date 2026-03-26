import test from 'node:test';
import assert from 'node:assert/strict';

import { createScreenNavigator } from '../screen-navigation.js';
import { FLOW_DESTINATIONS, SCREEN_NAMES } from '../constants.js';

function createClassList() {
  const set = new Set();
  return {
    contains: (name) => set.has(name),
    toggle: (name, force) => {
      if (typeof force === 'boolean') {
        if (force) set.add(name);
        else set.delete(name);
        return force;
      }
      if (set.has(name)) {
        set.delete(name);
        return false;
      }
      set.add(name);
      return true;
    },
  };
}

function createScreen(id, hidden = true) {
  const classList = createClassList();
  if (hidden) classList.toggle('hidden', true);
  return { id, classList };
}

function setMockDocument({ initialVisibleScreen = null } = {}) {
  globalThis.document = {
    body: {
      dataset: {},
      classList: createClassList(),
    },
    querySelector: (selector) => (selector === '.card:not(.hidden)' ? initialVisibleScreen : null),
  };
}

test('core stability: initializeActiveScreen tracks mobile session under mapped screen id', () => {
  const startScreen = createScreen('start-screen', false);
  setMockDocument({ initialVisibleScreen: startScreen });

  const sessionStarts = [];
  const navigator = createScreenNavigator({
    screens: { [SCREEN_NAMES.START]: startScreen },
    screenIds: { 'start-screen': FLOW_DESTINATIONS.HOME },
    screenRegistry: {},
    state: { startScreen, destinations: FLOW_DESTINATIONS },
    setAppMode: () => {},
    setActiveScreenId: () => {},
    startSession: (screenId) => sessionStarts.push(screenId),
    startTimeUiUpdater: () => {},
  });

  navigator.initializeActiveScreen();

  assert.deepEqual(sessionStarts, [FLOW_DESTINATIONS.HOME]);
  assert.equal(globalThis.document.body.dataset.activeScreen, FLOW_DESTINATIONS.HOME);
});

test('core stability: sentence-game flow remains navigable when async sentence load fails', async () => {
  const startScreen = createScreen('start-screen', false);
  const sentenceGameScreen = createScreen('sentence-game-screen', true);
  setMockDocument({ initialVisibleScreen: startScreen });

  let activeScreenId = SCREEN_NAMES.START;
  let sentenceRoundInitCount = 0;
  let freeGateCount = 0;

  const navigator = createScreenNavigator({
    screens: {
      [SCREEN_NAMES.START]: startScreen,
      [SCREEN_NAMES.SENTENCE_GAME]: sentenceGameScreen,
    },
    screenIds: {
      'start-screen': FLOW_DESTINATIONS.HOME,
      'sentence-game-screen': SCREEN_NAMES.SENTENCE_GAME,
    },
    screenRegistry: {},
    state: {
      startScreen,
      sentenceGameScreen,
      destinations: FLOW_DESTINATIONS,
    },
    getActiveScreenId: () => activeScreenId,
    setActiveScreenId: (id) => {
      activeScreenId = id;
    },
    setStateValue: () => {},
    setAppMode: () => {},
    closeHomeModesPanel: () => {},
    resetLessonProgress: () => {},
    updateState: () => {},
    stopSpeaking: () => {},
    ensureSentenceItemsLoaded: () => Promise.reject(new Error('offline fixture')),
    initSentenceGameRound: () => {
      sentenceRoundInitCount += 1;
    },
    enforceFreeXpGate: () => {
      freeGateCount += 1;
    },
    startSession: () => {},
    startTimeUiUpdater: () => {},
    refreshTimeSummaryUI: () => {},
    updateHeaderStatus: () => {},
  });

  navigator.requestNavigation(FLOW_DESTINATIONS.SENTENCE_GAME);
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(activeScreenId, SCREEN_NAMES.SENTENCE_GAME);
  assert.equal(sentenceRoundInitCount, 0);
  assert.equal(freeGateCount, 1);
});
