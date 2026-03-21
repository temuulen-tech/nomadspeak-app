import {
  SENTENCE_GAME_CLIMB_POSITIONS,
  SENTENCE_GAME_CORRECT_TOAST,
  SENTENCE_GAME_INCORRECT_TOAST,
  SENTENCE_GAME_SHOW_CORRECT_TOAST,
  SENTENCE_GAME_TIP_TEXT,
} from "./sentence-game.js";
import {
  findMongolianVoice,
  getToastType,
  normalizeToastSpeechText,
  speakMongolianText,
} from "./speech-utils.js";
import {
  isHidden,
  setDisabledState,
  setExpandedState,
  setHidden,
} from "./ui.js";
import { SOUND_EVENT_HOOKS } from "./app-audio-manager.js";

export function createSpeechStateController({ getAppSettings }) {
  let availableVoices = [];

  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    availableVoices = window.speechSynthesis.getVoices();
  }

  function getAvailableVoices() {
    return availableVoices;
  }

  function mongolianVoice() {
    return findMongolianVoice(availableVoices);
  }

  function englishVoices() {
    return availableVoices.filter((voice) => {
      const lang = (voice.lang || "").toLowerCase();
      return lang.startsWith("en-us") || lang.startsWith("en-gb") || lang.startsWith("en");
    });
  }

  function bestEnglishVoice() {
    const voices = englishVoices();
    if (!voices.length) return null;

    return (
      voices.find((voice) => (voice.lang || "").toLowerCase().startsWith("en-us"))
      || voices.find((voice) => (voice.lang || "").toLowerCase().startsWith("en-gb"))
      || voices[0]
    );
  }

  function voiceMatchesHint(voice, selectedVoiceType) {
    const name = (voice.name || "").toLowerCase();

    if (selectedVoiceType === "male") {
      return ["male", "man", "david", "guy", "daniel", "james", "mark", "tom", "john", "matthew", "michael", "george"]
        .some((hint) => name.includes(hint));
    }

    if (selectedVoiceType === "female") {
      return ["female", "woman", "zira", "susan", "samantha", "jenny", "anna", "victoria", "emma", "kate", "sara", "aria"]
        .some((hint) => name.includes(hint));
    }

    return false;
  }

  function selectedEnglishVoice() {
    const voices = englishVoices();
    if (!voices.length) return null;

    const voiceSetting = getAppSettings().ttsSettings.voice;
    if (voiceSetting === "male" || voiceSetting === "female") {
      const hinted = voices.find((voice) => voiceMatchesHint(voice, voiceSetting));
      if (hinted) return hinted;
    }

    return bestEnglishVoice();
  }

  function toastSpeechText(message = "") {
    return normalizeToastSpeechText(message);
  }

  function toastTypeFromMessage(message = "") {
    return getToastType(message, {
      correct: SENTENCE_GAME_CORRECT_TOAST,
      incorrect: SENTENCE_GAME_INCORRECT_TOAST,
      hint: SENTENCE_GAME_SHOW_CORRECT_TOAST,
    });
  }

  function speakBannerText(text) {
    const appSettings = getAppSettings();
    if (!appSettings.soundEnabled) return;
    if (!("speechSynthesis" in window)) return;

    speakMongolianText({
      text,
      voices: availableVoices,
      rate: appSettings.ttsSettings.rate,
      cancelFirst: true,
      speechSynthesisRef: window.speechSynthesis,
      utteranceFactory: (value) => new SpeechSynthesisUtterance(value),
    });
  }

  return {
    loadVoices,
    getAvailableVoices,
    mongolianVoice,
    selectedEnglishVoice,
    toastSpeechText,
    toastTypeFromMessage,
    speakBannerText,
  };
}

export function createSentenceGameTipController({
  dom,
  getAppSettings,
  getMongolianVoice,
  markSentenceGameActivity,
}) {
  const {
    tipPanelEl,
    tipToggleBtn,
    tipTextEl,
    tipCloseRowEl,
    tipSpeakBtn,
    tipStopBtn,
  } = dom;

  let tipSpeaking = false;

  function updateTipControls() {
    if (tipSpeakBtn) {
      setDisabledState(tipSpeakBtn, tipSpeaking);
    }

    if (tipStopBtn) {
      tipStopBtn.hidden = !tipSpeaking;
      setDisabledState(tipStopBtn, !tipSpeaking);
    }
  }

  function stopTipSpeech() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    tipSpeaking = false;
    updateTipControls();
  }

  function closeTipPanel() {
    markSentenceGameActivity();
    if (!tipPanelEl || !tipToggleBtn) return;
    stopTipSpeech();
    setExpandedState(tipToggleBtn, tipPanelEl, false);

    if (tipTextEl) {
      setHidden(tipTextEl, true);
    }
    if (tipCloseRowEl) {
      setHidden(tipCloseRowEl, true);
    }
  }

  function toggleTipPanel() {
    markSentenceGameActivity();
    if (!tipPanelEl || !tipToggleBtn) return;
    const willOpen = isHidden(tipPanelEl);
    setExpandedState(tipToggleBtn, tipPanelEl, willOpen);
    if (!willOpen) {
      closeTipPanel();
      return;
    }
    updateTipControls();
  }

  function showTipText() {
    markSentenceGameActivity();
    if (tipTextEl) {
      setHidden(tipTextEl, false);
    }
    if (tipCloseRowEl) {
      setHidden(tipCloseRowEl, false);
    }
  }

  function speakTip() {
    markSentenceGameActivity();
    const appSettings = getAppSettings();
    if (!appSettings.soundEnabled) return;
    if (!("speechSynthesis" in window)) return;
    stopTipSpeech();

    const utterance = new SpeechSynthesisUtterance(SENTENCE_GAME_TIP_TEXT);
    const mnVoice = getMongolianVoice();
    if (mnVoice) {
      utterance.voice = mnVoice;
      utterance.lang = mnVoice.lang || "mn-MN";
    } else {
      utterance.lang = "mn-MN";
    }
    utterance.rate = appSettings.ttsSettings.rate;
    utterance.onstart = () => {
      tipSpeaking = true;
      updateTipControls();
    };
    utterance.onend = () => {
      tipSpeaking = false;
      closeTipPanel();
    };
    utterance.onerror = () => {
      tipSpeaking = false;
      updateTipControls();
    };

    window.speechSynthesis.speak(utterance);
  }

  return {
    updateTipControls,
    stopTipSpeech,
    closeTipPanel,
    toggleTipPanel,
    showTipText,
    speakTip,
  };
}

export function createSentenceGameClimbController({
  appDom,
  dom,
  storageKey,
  getAppSettings,
  gameFeelSoundManager,
  playTone,
}) {
  const {
    climbEl,
    climberEl,
    rewardIconEl,
  } = dom;

  let climbLevel = 0;
  let lastRenderedClimbLevel = 0;
  let peakPulseTimer = null;

  function stageRewardIconSvg(stage = 0) {
    if (stage === 1) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5v18.5" stroke="#ffe6bf" stroke-width="2.1" stroke-linecap="round"/><path d="M6.3 4h12l-2.8 4.1 2.8 4.1h-12z" fill="#e53a3a" stroke="#ffd1d1" stroke-width="1.2"/></svg>';
    }
    if (stage === 2) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.6 5.3 5.8.8-4.2 4.1 1 5.6-5.2-2.7-5.2 2.7 1-5.6-4.2-4.1 5.8-.8z" fill="#ff4f58" stroke="#ffe8b0" stroke-width="1.2"/><circle cx="12" cy="12" r="9" fill="none" stroke="#ff7880" stroke-opacity=".55" stroke-width="1.4"/></svg>';
    }
    if (stage === 3) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6" fill="#f4bf44" stroke="#ffe6a7" stroke-width="1.6"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="#b17815" stroke-width="1.4"/><path d="M12 6.6v10.8M6.6 12h10.8" stroke="#f8d88e" stroke-width="1" opacity=".8"/></svg>';
    }
    if (stage === 4) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5.1h10v3.2c0 3.7-2.2 6.6-5 6.6s-5-3-5-6.6z" fill="#edbe5f" stroke="#ffe8b2" stroke-width="1.2"/><path d="M4.8 5.8h2c0 2.5-.9 3.8-2.8 3.8V7.8c.5 0 .8-.3.8-2zm14.4 0h-2c0 2.5.9 3.8 2.8 3.8V7.8c-.5 0-.8-.3-.8-2z" fill="#f9d782"/><path d="M10 14.9h4v2.8h-4zM8.2 18h7.6v2.2H8.2z" fill="#d69c2e"/></svg>';
    }
    if (stage === 5) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.1l6.8 6.9L12 21.9 5.2 9z" fill="#7deaff" stroke="#dcf9ff" stroke-width="1.3"/><path d="M12 2.1v19.8M5.2 9h13.6" stroke="#45bfd6" stroke-width="1.1"/></svg>';
    }
    return "";
  }

  function persistClimbLevel() {
    try {
      localStorage.setItem(storageKey, String(climbLevel));
    } catch (_error) {
      // noop
    }
  }

  function loadClimbLevel() {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        climbLevel = Math.max(0, Math.min(5, Math.round(parsed)));
        lastRenderedClimbLevel = climbLevel;
        return;
      }
    } catch (_error) {
      // noop
    }
    climbLevel = 0;
    lastRenderedClimbLevel = 0;
  }

  function renderClimb(level = 0, options = {}) {
    if (!climberEl || !climbEl) return;
    const position = SENTENCE_GAME_CLIMB_POSITIONS[level] || SENTENCE_GAME_CLIMB_POSITIONS[0];
    climberEl.style.setProperty("--x", `${position.x}px`);
    climberEl.style.setProperty("--y", `${position.y}px`);
    climbEl.setAttribute("aria-label", `Mountain climb progress level ${level} of 5`);

    if (rewardIconEl) {
      rewardIconEl.innerHTML = stageRewardIconSvg(level);
    }

    appDom.queries.getSentenceGamePeaks().forEach((peakEl) => {
      const peak = Number(peakEl.dataset.peak || 0);
      peakEl.classList.toggle("active", peak > 0 && peak <= level);
      peakEl.classList.remove("pulse");
    });

    if (options.pulsePeak && level > 0) {
      const reachedPeak = appDom.queries.getSentenceGamePeak(level);
      if (reachedPeak) {
        void reachedPeak.getBoundingClientRect();
        reachedPeak.classList.add("pulse");
        if (peakPulseTimer) clearTimeout(peakPulseTimer);
        peakPulseTimer = setTimeout(() => {
          reachedPeak.classList.remove("pulse");
        }, 620);
      }
    }
  }

  function playLevelUpSound(stage) {
    if (!getAppSettings().soundEnabled || stage < 1 || stage > 5) return;
    gameFeelSoundManager.playSoundHook(SOUND_EVENT_HOOKS.progression);
    const stagePatterns = {
      1: [620, 740, 930],
      2: [660, 880, 1100],
      3: [720, 960, 1280],
      4: [784, 1046, 1396],
      5: [880, 1174, 1568],
    };
    const notes = stagePatterns[stage] || stagePatterns[1];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playTone({ frequency: freq, type: "triangle", duration: 0.08, volume: 0.11 + stage * 0.01, attack: 0.006, release: 0.09 });
      }, index * 78);
    });
  }

  function playLevelDownSound() {
    if (!getAppSettings().soundEnabled) return;
    gameFeelSoundManager.playSoundHook(SOUND_EVENT_HOOKS.answerWrong);
    [300, 230, 170].forEach((freq, index) => {
      setTimeout(() => {
        playTone({ frequency: freq, type: "sawtooth", duration: 0.09, volume: 0.095, attack: 0.002, release: 0.08 });
      }, index * 62);
    });
  }

  function updateFromOutcome(outcome) {
    if (!outcome) return;
    const previousLevel = climbLevel;
    if (outcome === "success") {
      climbLevel = Math.min(5, climbLevel + 1);
    }
    if (outcome === "fail") {
      climbLevel = Math.max(0, climbLevel - 1);
    }

    if (climbLevel === previousLevel) {
      renderClimb(climbLevel);
      return;
    }

    const leveledUp = climbLevel > previousLevel;
    climberEl?.setAttribute("data-animating", "true");
    renderClimb(climbLevel, { pulsePeak: leveledUp });
    persistClimbLevel();
    lastRenderedClimbLevel = climbLevel;

    if (leveledUp) {
      playLevelUpSound(climbLevel);
    } else {
      playLevelDownSound();
    }

    setTimeout(() => {
      climberEl?.setAttribute("data-animating", "false");
    }, 620);
  }

  return {
    loadClimbLevel,
    persistClimbLevel,
    renderClimb,
    updateFromOutcome,
    getClimbLevel: () => climbLevel,
    setClimbLevel: (value) => {
      climbLevel = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
      lastRenderedClimbLevel = climbLevel;
    },
    getLastRenderedClimbLevel: () => lastRenderedClimbLevel,
  };
}
