/**
 * audio.js
 * Audio settings and lightweight playback state helpers.
 */

let soundEnabled = true;
let audioContext = null;
let audioPrimed = false;
let audioInteractionUnlocked = false;

export function isSoundEnabled() { return soundEnabled; }
export function setSoundEnabled(enabled) { soundEnabled = Boolean(enabled); return soundEnabled; }

export function getAudioRuntimeState() {
  return {
    audioContext,
    audioPrimed,
    audioInteractionUnlocked,
  };
}

export function isAudioInteractionUnlocked() {
  return audioInteractionUnlocked;
}

export function getOrCreateAudioContext() {
  if (!(window.AudioContext || window.webkitAudioContext)) return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

export function primeAudioContext() {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

export function markAudioPrimed() {
  audioPrimed = true;
}

export function isAudioPrimed() {
  return audioPrimed;
}

export function unlockAudioInteraction() {
  audioInteractionUnlocked = true;
}

export function playTone({ frequency, type, duration, volume, attack = 0.005, release = 0.05 }) {
  if (!soundEnabled || !audioInteractionUnlocked) return;
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.linearRampToValueAtTime(Math.max(volume * 0.55, 0.0001), now + Math.max(duration - release, attack + 0.01));
  gain.gain.linearRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.01);
}
