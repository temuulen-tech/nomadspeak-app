import { bindClickOnce } from "./ui.js";

export function createAudioControls({
  dom = {},
  appState = {},
  actions = {},
  bindManagedEvent = () => {},
}) {
  const {
    voiceOptionButtons = [],
    ttsRateSlider,
    soundToggleButtons = [],
  } = dom;
  const {
    getSettings = () => ({}),
  } = appState;
  const {
    updateVoice = () => {},
    updateRate = () => {},
    persistTtsSettings = () => {},
    updateTtsControlState = () => {},
    toggleSound = () => {},
  } = actions;

  return function initializeAudioControls() {
    voiceOptionButtons.forEach((btn) => {
      bindClickOnce(btn, `tts:voice:${btn.dataset.voice || btn.textContent}`, () => {
        updateVoice(btn.dataset.voice, getSettings());
        updateTtsControlState();
        persistTtsSettings();
      });
    });

    bindManagedEvent(ttsRateSlider, "input", "tts:rate", () => {
      updateRate(Number(ttsRateSlider.value), getSettings());
      updateTtsControlState();
      persistTtsSettings();
    });

    soundToggleButtons.forEach((toggleBtn) => {
      bindClickOnce(toggleBtn, `app:sound-toggle:${toggleBtn.id || toggleBtn.className}`, () => {
        toggleSound();
      });
    });
  };
}
