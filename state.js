/**
 * state.js
 * Shared runtime app state and small accessor helpers.
 */

const state = {
  currentScreen: "start",
  level: "beginner",
  lesson: { currentIndex: 0, score: 0, locked: false, reviewMode: false },
  progress: null,
  rewards: {},
  difficulty: { qa: null, sentenceGame: "beginner" },
  flags: {},
};

export function getState() { return state; }
export function getStateValue(key) { return state[key]; }
export function setStateValue(key, value) { state[key] = value; return state[key]; }
export function updateState(mutator) { if (typeof mutator === "function") mutator(state); return state; }
