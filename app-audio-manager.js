import { GAME_MODES, WORLD_IDS } from "./constants.js";

export const SOUND_EVENT_HOOKS = {
  diceRoll: "dice-roll",
  answerCorrect: "answer-correct",
  answerWrong: "answer-wrong",
  chestReward: "chest-reward",
  progression: "progression",
};

export const GAME_FEEL_SOUND_EVENTS = {
  ambient: "ambient",
  dice: "dice",
  correct: "correct",
  wrong: "wrong",
  reward: "reward",
  chest: "chest",
  finish: "finish",
};

export function createAudioEngine({ getAppSettings, isAudioInteractionUnlocked, getWorldAudioTrack, backgroundAudioEnabled = true }) {
  return {
    worldId: WORLD_IDS.SEA,
    activeMode: GAME_MODES.HOME,
    worldTracks: {},
    failedTracks: new Set(),
    activeTrackAudio: null,
    fadeRequestId: 0,
    resolveTrack(worldId = this.worldId) {
      return getWorldAudioTrack(worldId);
    },
    ensureTrack(worldId = this.worldId) {
      if (this.failedTracks.has(worldId)) return null;
      const track = this.resolveTrack(worldId);
      if (!track) return null;
      if (!this.worldTracks[worldId]) {
        const audio = new Audio(track.src);
        audio.loop = track.loop !== false;
        audio.preload = "auto";
        audio.volume = 0;
        audio.addEventListener("error", () => {
          this.failedTracks.add(worldId);
          if (this.activeTrackAudio === audio) this.stop(true);
        });
        this.worldTracks[worldId] = audio;
      }
      return this.worldTracks[worldId];
    },
    fadeTrack(audio, targetVolume, durationMs = 1200, onDone = null) {
      if (!audio) {
        if (typeof onDone === "function") onDone();
        return;
      }
      if (this.fadeRequestId) cancelAnimationFrame(this.fadeRequestId);
      const initialVolume = Number.isFinite(audio.volume) ? audio.volume : 0;
      const startTime = performance.now();
      const safeDuration = Math.max(durationMs, 1);
      const runFade = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / safeDuration, 1);
        const nextVolume = initialVolume + ((targetVolume - initialVolume) * progress);
        audio.volume = Math.max(0, Math.min(1, nextVolume));
        if (progress >= 1) {
          this.fadeRequestId = 0;
          if (typeof onDone === "function") onDone();
          return;
        }
        this.fadeRequestId = requestAnimationFrame(runFade);
      };
      this.fadeRequestId = requestAnimationFrame(runFade);
    },
    start(worldId = WORLD_IDS.SEA, mode = GAME_MODES.LESSON) {
      this.worldId = worldId;
      this.activeMode = mode;
      if (!getAppSettings().soundEnabled || !isAudioInteractionUnlocked() || mode === GAME_MODES.HOME || !backgroundAudioEnabled) {
        this.stop(true);
        return;
      }
      const track = this.resolveTrack(worldId);
      if (!track) {
        this.stop(true);
        return;
      }
      const audio = this.ensureTrack(worldId);
      if (!audio) return;
      if (this.activeTrackAudio && this.activeTrackAudio !== audio) this.stop(true);
      this.activeTrackAudio = audio;
      audio.loop = track.loop !== false;
      const targetVolume = track.volume ?? 0.2;
      const fadeInMs = track.fadeInMs ?? 1600;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});
      this.fadeTrack(audio, targetVolume, fadeInMs);
    },
    stop(immediate = false) {
      const audio = this.activeTrackAudio || this.ensureTrack(this.worldId);
      if (!audio) return;
      if (this.fadeRequestId) cancelAnimationFrame(this.fadeRequestId);
      this.fadeRequestId = 0;
      if (immediate) {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
        this.activeTrackAudio = null;
        return;
      }
      const track = this.resolveTrack(this.worldId) || {};
      this.fadeTrack(audio, 0, track.fadeOutMs ?? 1000, () => {
        audio.pause();
        audio.currentTime = 0;
        this.activeTrackAudio = null;
      });
    },
    onVisibilityChange() {
      if (document.hidden) {
        this.stop();
        return;
      }
      this.start(this.worldId, this.activeMode);
    },
  };
}

export function createWorldSoundscape({ audioEngine, getAppSettings, playTone, playSuccessSound, playErrorSound }) {
  const gameFeelSoundManager = {
    playSoundHook(eventName) {
      if (!getAppSettings().soundEnabled) return;
      if (eventName === SOUND_EVENT_HOOKS.diceRoll) {
        playTone({ frequency: 420, type: "triangle", duration: 0.06, volume: 0.08, attack: 0.003, release: 0.05 });
        setTimeout(() => playTone({ frequency: 260, type: "triangle", duration: 0.08, volume: 0.07, attack: 0.004, release: 0.06 }), 70);
        return;
      }
      if (eventName === SOUND_EVENT_HOOKS.answerCorrect) {
        playSuccessSound();
        return;
      }
      if (eventName === SOUND_EVENT_HOOKS.answerWrong) {
        playErrorSound();
        return;
      }
      if (eventName === SOUND_EVENT_HOOKS.chestReward) {
        playTone({ frequency: 320, type: "square", duration: 0.1, volume: 0.07, attack: 0.001, release: 0.08 });
        setTimeout(() => playTone({ frequency: 760, type: "triangle", duration: 0.11, volume: 0.09, attack: 0.004, release: 0.07 }), 95);
        return;
      }
      if (eventName === SOUND_EVENT_HOOKS.progression) {
        [660, 880, 1174].forEach((freq, i) => {
          setTimeout(() => playTone({ frequency: freq, type: "triangle", duration: 0.1, volume: 0.11, attack: 0.005, release: 0.08 }), i * 90);
        });
      }
    },
    play(eventName) {
      const map = {
        [GAME_FEEL_SOUND_EVENTS.dice]: SOUND_EVENT_HOOKS.diceRoll,
        [GAME_FEEL_SOUND_EVENTS.correct]: SOUND_EVENT_HOOKS.answerCorrect,
        [GAME_FEEL_SOUND_EVENTS.wrong]: SOUND_EVENT_HOOKS.answerWrong,
        [GAME_FEEL_SOUND_EVENTS.reward]: SOUND_EVENT_HOOKS.progression,
        [GAME_FEEL_SOUND_EVENTS.chest]: SOUND_EVENT_HOOKS.chestReward,
        [GAME_FEEL_SOUND_EVENTS.finish]: SOUND_EVENT_HOOKS.progression,
      };
      const hook = map[eventName];
      if (hook) this.playSoundHook(hook);
    },
    startAmbient() {
      audioEngine.start(WORLD_IDS.SEA, GAME_MODES.BOARD_GAME);
    },
    stopAmbient() {
      audioEngine.stop();
    },
  };

  return {
    worldSoundscape: {
      start(mode = GAME_MODES.LESSON) {
        audioEngine.start(WORLD_IDS.SEA, mode);
      },
      stop() {
        audioEngine.stop();
      },
      play(eventName) {
        if (!getAppSettings().soundEnabled) return;
        if (eventName === "reward") {
          playTone({ frequency: 1046, type: "sine", duration: 0.08, volume: 0.09, attack: 0.003, release: 0.06 });
          setTimeout(() => playTone({ frequency: 1318, type: "triangle", duration: 0.1, volume: 0.08, attack: 0.004, release: 0.08 }), 55);
          return;
        }
        if (eventName === "soft-fail") {
          playTone({ frequency: 210, type: "sawtooth", duration: 0.08, volume: 0.07, attack: 0.002, release: 0.07 });
        }
      },
    },
    gameFeelSoundManager,
  };
}
