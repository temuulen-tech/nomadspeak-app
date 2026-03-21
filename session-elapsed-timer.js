export function createSessionElapsedTimer({
  getElapsedSeconds,
  setElapsedSeconds,
  getStartedAt,
  setStartedAt,
  onTick = () => {},
}) {
  let intervalId = null;

  function syncElapsedSeconds() {
    const startedAt = getStartedAt?.();
    if (!startedAt) return;
    const runningSeconds = Math.floor((Date.now() - startedAt) / 1000);
    setElapsedSeconds?.(Math.max(getElapsedSeconds?.() || 0, runningSeconds));
  }

  function updateUi() {
    syncElapsedSeconds();
    onTick();
  }

  function stop() {
    syncElapsedSeconds();
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setStartedAt?.(null);
  }

  function start() {
    if (intervalId) return;
    setStartedAt?.(Date.now() - ((getElapsedSeconds?.() || 0) * 1000));
    updateUi();
    intervalId = setInterval(() => {
      updateUi();
    }, 1000);
  }

  return {
    start,
    stop,
    syncElapsedSeconds,
    updateUi,
  };
}
