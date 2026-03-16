/**
 * audio.js
 * Audio settings and lightweight playback state helpers.
 */

let soundEnabled = true;

export function isSoundEnabled() { return soundEnabled; }
export function setSoundEnabled(enabled) { soundEnabled = Boolean(enabled); return soundEnabled; }
