/**
 * state.js
 * Shared runtime app state and small accessor helpers.
 */

import { DIFFICULTY_LEVELS, SCREEN_NAMES } from "./constants.js";

const state = {
  currentScreen: SCREEN_NAMES.START,
  level: DIFFICULTY_LEVELS.BEGINNER,
  lesson: { currentIndex: 0, score: 0, locked: false, reviewMode: false },
  progress: null,
  rewards: {},
  difficulty: { qa: null, sentenceGame: DIFFICULTY_LEVELS.BEGINNER },
  flags: {},
};

export function getState() { return state; }
export function getStateValue(key) { return state[key]; }
export function setStateValue(key, value) { state[key] = value; return state[key]; }
export function updateState(mutator) { if (typeof mutator === "function") mutator(state); return state; }
