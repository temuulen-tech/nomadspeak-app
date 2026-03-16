/**
 * stats.js
 * Stats/time formatting and summary helper functions.
 */

export function formatHHMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function secondsBetween(a, b) {
  return Math.max(0, Math.floor((b - a) / 1000));
}
