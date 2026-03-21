import {
  DIFFICULTY_LEVEL_LIST,
  DIFFICULTY_LEVELS,
} from "./constants.js";
import {
  SENTENCE_GAME_CORRECT_TOAST,
  SENTENCE_GAME_DATA_PATH,
  SENTENCE_GAME_DEBUG,
  SENTENCE_GAME_DIFFICULTY_LABELS,
  SENTENCE_GAME_INCORRECT_TOAST,
  SENTENCE_GAME_SHOW_CORRECT_TOAST,
  SENTENCE_GAME_SUCCESS_TOAST_LOCK_MS,
  SENTENCE_GAME_TOAST_DURATION,
  SENTENCE_GAME_TOAST_MAX_DURATION,
  SENTENCE_GAME_TOAST_SPEECH_DELAY,
  SENTENCE_GAME_TOAST_SPEECH_END_BUFFER,
  filterSentenceItemsForBank,
  normalizeSentence,
  normalizeSentenceGameToken,
  prepareSentenceItems,
  resolveSentenceContentBank,
  tokenizeSentence,
} from "./sentence-game.js";
import {
  isHidden,
  setActiveState,
  setExpandedState,
  setHidden,
  setPressedState,
  showElement,
} from "./ui.js";

const SENTENCE_GAME_DIFFICULTY_KEY = "sentenceGameDifficulty";

export function createSentenceRuntime({ dom = {}, deps = {} } = {}) {
  const {
    sentencesListEl,
    sentenceGameScreen,
    vaultModalBodyEl,
    sentenceGameDropzoneEl,
    sentenceGamePoolEl,
    sentenceGameUndoBtn,
    sentenceGamePrevBtn,
    sentenceGameNextBtn,
    sentenceGameFeedbackEl,
    sentenceGameToastEl,
    sentenceGameCorrectPanelEl,
    sentenceGameCorrectEnEl,
    sentenceGameCorrectMnEl,
    sentenceGameDifficultyToggleBtn,
    sentenceGameDifficultyPanelEl,
    sentenceGameDifficultyButtons = [],
  } = dom;

  const {
    getCurrentLevel = () => DIFFICULTY_LEVELS.BEGINNER,
    getSelectedEnglishVoice = () => null,
    getAvailableVoices = () => [],
    getAppSettings = () => ({ soundEnabled: true, ttsSettings: { rate: 1 } }),
    getActiveLearningSelection = () => ({}),
    updateCompanionLine = () => {},
    showWorldFeedbackChip = () => {},
    playRewardSound = () => {},
    speakMongolianText = () => null,
    toastSpeechText = (message) => message,
    toastTypeFromMessage = () => "toast",
    awardXP = () => {},
    buildSentenceGameEventId = () => "",
    playCorrectSound = () => {},
    playSuccessSound = () => {},
    playErrorSound = () => {},
    markSentenceGameActivity = () => {},
    updateSentenceGameClimbFromOutcome = () => {},
    getSaveSentenceListItem = () => () => {},
    onSentenceItemsLoaded = () => {},
    onSentenceGameStateReset = () => {},
    onSentenceGameRoundReady = () => {},
    sentenceGameScreenVisible = () => Boolean(sentenceGameScreen && !isHidden(sentenceGameScreen)),
    shuffle = (items) => [...items],
    createEnglishUtterance = (value) => new SpeechSynthesisUtterance(value),
    createMongolianUtterance = (value) => new SpeechSynthesisUtterance(value),
    getSpeechSynthesis = () => (typeof window !== "undefined" ? window.speechSynthesis : null),
  } = deps;

  const state = {
    sentenceItems: [],
    sentenceFilter: DIFFICULTY_LEVELS.BEGINNER,
    speakingSentenceId: null,
    sentenceItemsLoadPromise: null,
    history: [],
    index: -1,
    tiles: [],
    built: [],
    completed: false,
    xpAwarded: false,
    hintXpAwarded: false,
    usedShowCorrect: false,
    correctVisible: false,
    draggingTileId: null,
    toastTimer: null,
    toastHideTimer: null,
    toastSpeechTimer: null,
    toastShownAt: 0,
    toastHideDeadline: 0,
    toastSpeechActive: false,
    successAlreadyShownForThisSentence: false,
    successToastLockUntil: 0,
    lastOutcomeForThisSentence: null,
    attemptResolved: false,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
  };

  function getSpeech() {
    return getSpeechSynthesis?.() || null;
  }

  function currentSentence() {
    if (!state.history.length || state.index < 0) return null;
    return state.history[state.index] || null;
  }

  function filteredSentences() {
    return state.sentenceItems.filter((item) => item.level === state.sentenceFilter);
  }

  function updateSpeakingState() {
    const allButtons = sentencesListEl?.querySelectorAll(".speak-btn") || [];
    allButtons.forEach((btn) => {
      const isPlaying = Number(btn.dataset.id) === state.speakingSentenceId;
      btn.classList.toggle("playing", isPlaying);
      setPressedState(btn, isPlaying);
      btn.setAttribute("aria-label", isPlaying ? "Уншиж байна" : "Дуу сонсох");
    });

    if (!vaultModalBodyEl) return;
    const vaultButtons = vaultModalBodyEl.querySelectorAll(".vault-sentence-speak-btn");
    vaultButtons.forEach((btn) => {
      const isPlaying = String(btn.dataset.id || "") === String(state.speakingSentenceId || "");
      btn.classList.toggle("playing", isPlaying);
      setPressedState(btn, isPlaying);
      btn.textContent = isPlaying ? "⏸ Зогсоох" : "▶ Дараад сонс";
    });
  }

  function stopSpeaking() {
    const speech = getSpeech();
    if (!speech) return;
    speech.cancel();
    state.speakingSentenceId = null;
    updateSpeakingState();
  }

  function speakSentence(item) {
    const appSettings = getAppSettings();
    if (!appSettings.soundEnabled) return;

    const speech = getSpeech();
    if (!speech) return;

    updateCompanionLine("sentences", "success");
    showWorldFeedbackChip("🗣️ Амилуулж уншлаа!", "reward");
    playRewardSound();

    stopSpeaking();

    const utterance = createEnglishUtterance(item.en);
    const selectedVoice = getSelectedEnglishVoice();
    utterance.lang = selectedVoice?.lang || "en-US";
    utterance.rate = appSettings.ttsSettings.rate;
    if (selectedVoice) utterance.voice = selectedVoice;

    state.speakingSentenceId = item.id;
    updateSpeakingState();

    utterance.onend = () => {
      state.speakingSentenceId = null;
      updateSpeakingState();
    };

    utterance.onerror = () => {
      state.speakingSentenceId = null;
      updateSpeakingState();
    };

    speech.speak(utterance);
  }

  function renderSentences() {
    if (!sentencesListEl) return;
    const list = filteredSentences();

    if (!list.length) {
      sentencesListEl.innerHTML = '<p class="muted">Өгүүлбэр олдсонгүй.</p>';
      return;
    }

    sentencesListEl.innerHTML = "";

    list.forEach((item) => {
      const row = document.createElement("div");
      row.className = "sentence-row";

      const textWrap = document.createElement("div");
      textWrap.className = "sentence-text";

      const en = document.createElement("p");
      en.className = "sentence-en";
      en.textContent = item.en;

      const mn = document.createElement("p");
      mn.className = "sentence-mn muted";
      mn.textContent = item.mn;

      textWrap.appendChild(en);
      textWrap.appendChild(mn);

      const rowActions = document.createElement("div");
      rowActions.className = "sentence-row-actions";

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "secondary sentence-save-btn";
      saveBtn.textContent = "⭐";
      saveBtn.setAttribute("aria-label", "Өгүүлбэр хадгалах");
      saveBtn.addEventListener("click", () => getSaveSentenceListItem()(item));

      const speakBtn = document.createElement("button");
      speakBtn.type = "button";
      speakBtn.className = "speak-btn";
      speakBtn.dataset.id = item.id;
      speakBtn.setAttribute("aria-label", "Дуу сонсох");
      speakBtn.textContent = "🔊";
      speakBtn.addEventListener("click", () => speakSentence(item));

      rowActions.appendChild(saveBtn);
      rowActions.appendChild(speakBtn);
      row.appendChild(textWrap);
      row.appendChild(rowActions);
      sentencesListEl.appendChild(row);
    });

    updateSpeakingState();
  }

  async function loadSentences() {
    try {
      const response = await fetch(SENTENCE_GAME_DATA_PATH);
      if (!response.ok) throw new Error("Өгөгдөл ачаалж чадсангүй.");
      const allSentenceItems = prepareSentenceItems(await response.json());
      const chapterContent = getActiveLearningSelection();
      const sentenceBank = resolveSentenceContentBank({
        bankId: chapterContent.sentenceBankId,
        worldId: chapterContent.worldId,
        difficulty: getCurrentLevel(),
      });
      const requestedSentenceBankId = sentenceBank?.id || chapterContent.sentenceBankId;
      state.sentenceItems = filterSentenceItemsForBank(allSentenceItems, requestedSentenceBankId);
      if (requestedSentenceBankId && !allSentenceItems.some((item) => item.bankId === requestedSentenceBankId)) {
        showWorldFeedbackChip("⚠️ Энэ бүлгийн sentence bank одоохондоо хоосон байна.", "warning");
      }
      renderSentences();
      state.history = [];
      state.index = -1;
      onSentenceItemsLoaded(state.sentenceItems);
      onSentenceGameStateReset();
      if (sentenceGameScreenVisible()) initSentenceGameRound();
      return state.sentenceItems;
    } catch (error) {
      if (sentencesListEl) sentencesListEl.innerHTML = '<p class="muted">Өгүүлбэрүүдийг ачаалж чадсангүй.</p>';
      state.sentenceItemsLoadPromise = null;
      throw error;
    }
  }

  function ensureSentenceItemsLoaded() {
    if (state.sentenceItems.length) return Promise.resolve(state.sentenceItems);
    if (state.sentenceItemsLoadPromise) return state.sentenceItemsLoadPromise;

    state.sentenceItemsLoadPromise = loadSentences().catch((error) => {
      state.sentenceItemsLoadPromise = null;
      throw error;
    });

    return state.sentenceItemsLoadPromise;
  }

  function sentenceGameComplexityScore(item = {}) {
    const levelTag = String(item.level || item.cefr || "").toLowerCase();
    const levelWeight = levelTag.includes("advanced") || levelTag.includes("c1") || levelTag.includes("c2")
      ? 8
      : (levelTag.includes("intermediate") || levelTag.includes("b1") || levelTag.includes("b2")
        ? 4
        : (levelTag.includes("beginner") || levelTag.includes("a1") || levelTag.includes("a2") ? 0 : 2));
    const tokenCount = tokenizeSentence(item.en || "").length;
    const longWordCount = String(item.en || "").split(/\s+/).filter((word) => word.replace(/[^A-Za-z]/g, "").length >= 8).length;
    return tokenCount * 2 + longWordCount + levelWeight;
  }

  function sentenceGameBucketsByFallback() {
    const sorted = [...state.sentenceItems].sort((a, b) => sentenceGameComplexityScore(a) - sentenceGameComplexityScore(b));
    if (!sorted.length) return { beginner: [], intermediate: [], advanced: [] };
    const beginnerEnd = Math.max(1, Math.ceil(sorted.length / 3));
    const intermediateEnd = Math.max(beginnerEnd + 1, Math.ceil((sorted.length * 2) / 3));
    return {
      beginner: sorted.slice(0, beginnerEnd),
      intermediate: sorted.slice(beginnerEnd, intermediateEnd),
      advanced: sorted.slice(intermediateEnd),
    };
  }

  function sentenceGameSentencesByDifficulty(difficulty = state.difficulty) {
    const normalizedDifficulty = DIFFICULTY_LEVEL_LIST.includes(difficulty) ? difficulty : DIFFICULTY_LEVELS.BEGINNER;
    const tagged = state.sentenceItems.filter((item) => {
      const rawLevel = String(item.level || item.cefr || "").toLowerCase();
      if (normalizedDifficulty === DIFFICULTY_LEVELS.BEGINNER) return rawLevel.includes("beginner") || rawLevel.includes("a1") || rawLevel.includes("a2");
      if (normalizedDifficulty === DIFFICULTY_LEVELS.INTERMEDIATE) return rawLevel.includes("intermediate") || rawLevel.includes("b1") || rawLevel.includes("b2");
      return rawLevel.includes("advanced") || rawLevel.includes("c1") || rawLevel.includes("c2");
    });

    if (tagged.length) return tagged;

    const fallback = sentenceGameBucketsByFallback();
    const selectedFallback = fallback[normalizedDifficulty] || [];
    if (selectedFallback.length) return selectedFallback;

    return state.sentenceItems;
  }

  function sentenceGameRandomSentence() {
    const available = sentenceGameSentencesByDifficulty(state.difficulty);
    if (!available.length) return null;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex] || null;
  }

  function sentenceGameDifficultyButtonLabel(difficulty = state.difficulty) {
    return SENTENCE_GAME_DIFFICULTY_LABELS[difficulty] || SENTENCE_GAME_DIFFICULTY_LABELS.beginner;
  }

  function updateSentenceGameDifficultyUI() {
    if (sentenceGameDifficultyToggleBtn) {
      const label = sentenceGameDifficultyButtonLabel(state.difficulty);
      sentenceGameDifficultyToggleBtn.textContent = `Тоглох түвшин: ${label}`;
    }

    sentenceGameDifficultyButtons.forEach((btn) => {
      const isActive = btn.dataset.difficulty === state.difficulty;
      setActiveState(btn, isActive);
      setPressedState(btn, isActive);
    });
  }

  function setSentenceGameDifficultyPanelOpen(isOpen) {
    if (!sentenceGameDifficultyPanelEl || !sentenceGameDifficultyToggleBtn) return;
    setExpandedState(sentenceGameDifficultyToggleBtn, sentenceGameDifficultyPanelEl, isOpen);
  }

  function loadSentenceGameDifficulty() {
    try {
      const stored = localStorage.getItem(SENTENCE_GAME_DIFFICULTY_KEY);
      if (DIFFICULTY_LEVEL_LIST.includes(stored || "")) {
        state.difficulty = stored;
      } else {
        state.difficulty = DIFFICULTY_LEVELS.BEGINNER;
        localStorage.setItem(SENTENCE_GAME_DIFFICULTY_KEY, state.difficulty);
      }
    } catch (_error) {
      state.difficulty = DIFFICULTY_LEVELS.BEGINNER;
    }

    updateSentenceGameDifficultyUI();
  }

  function selectSentenceGameDifficulty(difficulty, { collapsePanel = true } = {}) {
    if (!DIFFICULTY_LEVEL_LIST.includes(difficulty)) return;
    state.difficulty = difficulty;
    try {
      localStorage.setItem(SENTENCE_GAME_DIFFICULTY_KEY, state.difficulty);
    } catch (_error) {
      // ignore storage errors in private mode
    }

    updateSentenceGameDifficultyUI();
    state.history = [];
    state.index = -1;
    initSentenceGameRound();

    if (collapsePanel) {
      setSentenceGameDifficultyPanelOpen(false);
    }
  }

  function updateSentenceGameNavButtons() {
    if (sentenceGamePrevBtn) {
      sentenceGamePrevBtn.disabled = state.index <= 0;
    }
  }

  function evaluateSentenceGameAttempt() {
    const current = currentSentence();
    const expectedTokens = current?.tokens || [];
    const totalSlots = expectedTokens.length;

    let correctCount = 0;
    let wrongCount = 0;

    for (let idx = 0; idx < totalSlots; idx += 1) {
      const placedTileId = state.built[idx];
      const placedTile = state.tiles.find((item) => item.id === placedTileId);
      const expectedToken = normalizeSentenceGameToken(expectedTokens[idx]);
      const placedToken = normalizeSentenceGameToken(placedTile?.value || "");

      if (!placedToken) continue;
      if (placedToken === expectedToken) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }
    }

    const isAllCorrect = totalSlots > 0 && correctCount === totalSlots;
    return { isAllCorrect, totalSlots, correctCount, wrongCount };
  }

  function sentenceGameIsSolved() {
    return evaluateSentenceGameAttempt().isAllCorrect;
  }

  function getPlacedSentenceText() {
    const placedTokens = state.built
      .map((tileId) => state.tiles.find((tile) => tile.id === tileId)?.value || "")
      .filter(Boolean);

    return normalizeSentence(placedTokens.join(" "));
  }

  function isSentenceFullyCorrect() {
    const current = currentSentence();
    if (!current) return false;

    const normalizedPlaced = normalizeSentence(getPlacedSentenceText());
    const normalizedExpected = normalizeSentence(current.en || "");
    return normalizedPlaced === normalizedExpected;
  }

  function createSentenceGameTileButton(tile, inPool) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sentence-game-tile";
    btn.textContent = tile.value;
    btn.dataset.tileId = String(tile.id);
    btn.draggable = true;

    btn.addEventListener("dragstart", (event) => {
      state.draggingTileId = tile.id;
      event.dataTransfer.setData("text/plain", String(tile.id));
    });

    btn.addEventListener("click", () => {
      if (inPool) {
        placeSentenceGameTile(tile.id);
      } else {
        removeSentenceGameTile(tile.id);
      }
    });

    btn.addEventListener("pointerdown", () => {
      state.draggingTileId = tile.id;
    });

    return btn;
  }

  function sentenceGamePlacementStatus(slotIndex) {
    const current = currentSentence();
    if (!current) return "";
    const placedTileId = state.built[slotIndex];
    const placedTile = state.tiles.find((item) => item.id === placedTileId);
    if (!placedTile) return "";
    return current.tokens[slotIndex] === placedTile.value ? "word-correct" : "word-wrong";
  }

  function renderSentenceGameBoard() {
    const current = currentSentence();
    if (!sentenceGameDropzoneEl || !sentenceGamePoolEl) return;

    if (!current) {
      sentenceGameDropzoneEl.innerHTML = '<p class="muted">Өгүүлбэр алга.</p>';
      sentenceGamePoolEl.innerHTML = "";
      return;
    }

    sentenceGameDropzoneEl.innerHTML = "";
    for (let idx = 0; idx < current.tokens.length; idx += 1) {
      const slot = document.createElement("div");
      slot.className = "sentence-game-slot";

      const tileId = state.built[idx];
      if (tileId !== undefined) {
        const tile = state.tiles.find((item) => item.id === tileId);
        if (tile) {
          const placedTileButton = createSentenceGameTileButton(tile, false);
          placedTileButton.classList.remove("word-correct", "word-wrong");
          const placementStatus = sentenceGamePlacementStatus(idx);
          if (placementStatus) placedTileButton.classList.add(placementStatus);
          slot.appendChild(placedTileButton);
        }
      } else {
        const placeholder = document.createElement("span");
        placeholder.className = "sentence-game-slot-placeholder";
        placeholder.textContent = "...";
        slot.appendChild(placeholder);
      }

      slot.addEventListener("dragover", (event) => event.preventDefault());
      slot.addEventListener("drop", (event) => {
        event.preventDefault();
        const droppedId = Number(event.dataTransfer.getData("text/plain") || state.draggingTileId);
        placeSentenceGameTile(droppedId);
        state.draggingTileId = null;
      });
      slot.addEventListener("pointerup", () => {
        if (state.draggingTileId !== null) placeSentenceGameTile(Number(state.draggingTileId));
        state.draggingTileId = null;
      });
      sentenceGameDropzoneEl.appendChild(slot);
    }

    sentenceGamePoolEl.innerHTML = "";
    sentenceGamePoolEl.ondragover = (event) => event.preventDefault();
    sentenceGamePoolEl.ondrop = (event) => {
      event.preventDefault();
      const droppedId = Number(event.dataTransfer.getData("text/plain") || state.draggingTileId);
      removeSentenceGameTile(droppedId);
    };
    sentenceGamePoolEl.onpointerup = () => {
      if (state.draggingTileId !== null) removeSentenceGameTile(Number(state.draggingTileId));
      state.draggingTileId = null;
    };

    state.tiles.forEach((tile) => {
      if (state.built.includes(tile.id)) return;
      sentenceGamePoolEl.appendChild(createSentenceGameTileButton(tile, true));
    });

    if (sentenceGameUndoBtn) sentenceGameUndoBtn.disabled = state.built.length === 0;
  }

  function clearSentenceGameToastTimers() {
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }
    if (state.toastHideTimer) {
      clearTimeout(state.toastHideTimer);
      state.toastHideTimer = null;
    }
    if (state.toastSpeechTimer) {
      clearTimeout(state.toastSpeechTimer);
      state.toastSpeechTimer = null;
    }
    state.toastSpeechActive = false;
  }

  function hideSentenceGameToast() {
    clearSentenceGameToastTimers();
    if (!sentenceGameToastEl) return;

    sentenceGameToastEl.classList.remove("show");
    sentenceGameToastEl.classList.add("hide");
    sentenceGameToastEl.setAttribute("aria-hidden", "true");

    state.toastHideTimer = setTimeout(() => {
      if (!sentenceGameToastEl) return;
      sentenceGameToastEl.classList.remove("hide");
      sentenceGameToastEl.textContent = "";
    }, 320);
  }

  function scheduleSentenceGameToastHide(targetTimestamp) {
    state.toastHideDeadline = Math.max(state.toastHideDeadline, targetTimestamp);

    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }

    const wait = Math.max(0, state.toastHideDeadline - Date.now());
    state.toastTimer = setTimeout(() => {
      if (state.toastSpeechActive) {
        scheduleSentenceGameToastHide(Date.now() + 180);
        return;
      }
      hideSentenceGameToast();
    }, wait);
  }

  function speakSentenceGameToast(message, handlers = {}) {
    const appSettings = getAppSettings();
    if (!appSettings.soundEnabled) return;

    const speech = getSpeech();
    if (!speech) return;

    const textToSpeak = toastSpeechText(message);
    if (!textToSpeak) return;

    const toastType = handlers.toastType || toastTypeFromMessage(message);
    const spoken = speakMongolianText({
      text: textToSpeak,
      voices: getAvailableVoices(),
      rate: appSettings.ttsSettings.rate,
      speechSynthesisRef: speech,
      utteranceFactory: createMongolianUtterance,
      configureUtterance: (utterance) => {
        utterance.onstart = () => {
          console.log(`[SentenceGameToast][${toastType}] speech start`);
          if (typeof handlers.onstart === "function") handlers.onstart();
        };
        utterance.onend = () => {
          console.log(`[SentenceGameToast][${toastType}] speech end`);
          if (typeof handlers.onend === "function") handlers.onend();
        };
        utterance.onerror = () => {
          console.log(`[SentenceGameToast][${toastType}] speech end (error)`);
          if (typeof handlers.onend === "function") handlers.onend();
        };
      },
    });
    if (!spoken?.utterance) return;
  }

  function showSentenceGameToast(message) {
    if (!sentenceGameToastEl || !message) return;

    const isSuccessToast = message === SENTENCE_GAME_CORRECT_TOAST;
    if (!isSuccessToast && Date.now() < state.successToastLockUntil) {
      return;
    }

    if (isSuccessToast) {
      state.successToastLockUntil = Date.now() + SENTENCE_GAME_SUCCESS_TOAST_LOCK_MS;
    }

    const hasActiveToast =
      sentenceGameToastEl.classList.contains("show")
      || state.toastSpeechActive
      || Boolean(state.toastSpeechTimer);

    const speech = getSpeech();
    if (hasActiveToast && speech) {
      speech.cancel();
    }

    clearSentenceGameToastTimers();

    sentenceGameToastEl.textContent = message;
    sentenceGameToastEl.setAttribute("aria-hidden", "false");
    sentenceGameToastEl.classList.remove("hide");
    sentenceGameToastEl.classList.remove("show");
    void sentenceGameToastEl.offsetWidth;
    sentenceGameToastEl.classList.add("show");

    state.toastShownAt = Date.now();
    const maxHideTimestamp = state.toastShownAt + SENTENCE_GAME_TOAST_MAX_DURATION;
    state.toastHideDeadline = state.toastShownAt + SENTENCE_GAME_TOAST_DURATION;
    state.toastSpeechActive = false;
    const toastType = toastTypeFromMessage(message);

    state.toastSpeechTimer = setTimeout(() => {
      speakSentenceGameToast(message, {
        toastType,
        onstart: () => {
          state.toastSpeechActive = true;
        },
        onend: () => {
          state.toastSpeechActive = false;
          const nextHideAt = Math.min(Date.now() + SENTENCE_GAME_TOAST_SPEECH_END_BUFFER, maxHideTimestamp);
          scheduleSentenceGameToastHide(nextHideAt);
        },
      });
    }, SENTENCE_GAME_TOAST_SPEECH_DELAY);

    scheduleSentenceGameToastHide(Math.min(state.toastHideDeadline, maxHideTimestamp));
  }

  function hideSentenceGameCorrectPanel() {
    state.correctVisible = false;
    setHidden(sentenceGameCorrectPanelEl, true);
  }

  function renderSentenceGameCorrectPanel() {
    const current = currentSentence();
    if (!current || !sentenceGameCorrectPanelEl || !sentenceGameCorrectEnEl || !sentenceGameCorrectMnEl) return;
    sentenceGameCorrectEnEl.textContent = current.en || "";
    sentenceGameCorrectMnEl.textContent = current.mn || "";
    showElement(sentenceGameCorrectPanelEl);
  }

  function updateSentenceGameState() {
    const evaluation = evaluateSentenceGameAttempt();
    const allSlotsFilled = evaluation.totalSlots > 0 && state.built.length === evaluation.totalSlots;
    const sentenceCorrect = allSlotsFilled && isSentenceFullyCorrect();
    state.completed = sentenceCorrect;
    if (sentenceGameNextBtn) sentenceGameNextBtn.disabled = false;

    if (SENTENCE_GAME_DEBUG) {
      console.log("[SentenceGame] evaluation", evaluation);
    }

    if (sentenceCorrect) {
      if (!state.successAlreadyShownForThisSentence) {
        showSentenceGameToast(SENTENCE_GAME_CORRECT_TOAST);
        state.successAlreadyShownForThisSentence = true;
      }

      if (!state.usedShowCorrect && sentenceGameFeedbackEl) {
        sentenceGameFeedbackEl.textContent = "Зөв!";
        sentenceGameFeedbackEl.classList.add("ok");
      }
      if (!state.xpAwarded && !state.usedShowCorrect) {
        awardXP(10, "sentence_game_success", buildSentenceGameEventId("success"));
        state.xpAwarded = true;
        playCorrectSound();
      }
    } else if (!state.usedShowCorrect && sentenceGameFeedbackEl) {
      state.successAlreadyShownForThisSentence = false;
      sentenceGameFeedbackEl.textContent = "";
      sentenceGameFeedbackEl.classList.remove("ok");
    }

    if (allSlotsFilled && !state.attemptResolved) {
      state.attemptResolved = true;
      state.lastOutcomeForThisSentence = sentenceCorrect ? "success" : "fail";
      updateSentenceGameClimbFromOutcome(state.lastOutcomeForThisSentence);
      if (!sentenceCorrect && !state.usedShowCorrect) {
        showSentenceGameToast(SENTENCE_GAME_INCORRECT_TOAST);
      }
    } else if (!allSlotsFilled && !state.attemptResolved) {
      state.lastOutcomeForThisSentence = null;
    }
  }

  function showSentenceGameCorrectAnswer() {
    markSentenceGameActivity();
    const current = currentSentence();
    if (!current) return;

    state.usedShowCorrect = true;
    state.correctVisible = !state.correctVisible;

    if (state.correctVisible) {
      renderSentenceGameCorrectPanel();
    } else {
      hideSentenceGameCorrectPanel();
    }

    if (state.correctVisible) {
      if (!state.hintXpAwarded) {
        awardXP(3, "hint_used", buildSentenceGameEventId("hint"));
        state.hintXpAwarded = true;
      }
      showSentenceGameToast(SENTENCE_GAME_SHOW_CORRECT_TOAST);
    }

    if (!state.completed && sentenceGameFeedbackEl) {
      sentenceGameFeedbackEl.textContent = "";
      sentenceGameFeedbackEl.classList.remove("ok");
    }
  }

  function placeSentenceGameTile(tileId) {
    if (!Number.isFinite(tileId) || state.built.includes(tileId)) return;
    markSentenceGameActivity();
    if (state.built.length >= state.tiles.length) return;
    state.built.push(tileId);

    const current = currentSentence();
    const insertedIndex = state.built.length - 1;
    const placedTile = state.tiles.find((tile) => tile.id === tileId);
    const isCorrectPlacement = Boolean(current && placedTile && current.tokens[insertedIndex] === placedTile.value);

    renderSentenceGameBoard();
    updateSentenceGameState();

    if (isCorrectPlacement) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  }

  function removeSentenceGameTile(tileId) {
    markSentenceGameActivity();
    const idx = state.built.indexOf(tileId);
    if (idx === -1) return;
    state.built.splice(idx, 1);
    state.successAlreadyShownForThisSentence = false;
    state.lastOutcomeForThisSentence = null;
    renderSentenceGameBoard();
    updateSentenceGameState();
  }

  function undoSentenceGameMove() {
    if (!state.built.length) return;
    markSentenceGameActivity();
    state.built.pop();
    state.successAlreadyShownForThisSentence = false;
    state.lastOutcomeForThisSentence = null;
    renderSentenceGameBoard();
    updateSentenceGameState();
  }

  function initSentenceGameRound() {
    hideSentenceGameToast();
    if (!state.history.length || state.index < 0) {
      state.history = [];
      const firstSentence = sentenceGameRandomSentence();
      if (!firstSentence) return;
      state.history.push(firstSentence);
      state.index = 0;
    }

    const current = currentSentence();
    if (!current) return;

    current.tokens = tokenizeSentence(current.en);
    state.tiles = shuffle(current.tokens.map((value, id) => ({ id, value })));
    state.built = [];
    state.completed = false;
    state.xpAwarded = false;
    state.hintXpAwarded = false;
    state.usedShowCorrect = false;
    state.successAlreadyShownForThisSentence = false;
    state.successToastLockUntil = 0;
    state.lastOutcomeForThisSentence = null;
    state.attemptResolved = false;
    hideSentenceGameCorrectPanel();
    if (sentenceGameFeedbackEl) {
      sentenceGameFeedbackEl.textContent = "";
      sentenceGameFeedbackEl.classList.remove("ok");
    }
    if (sentenceGameNextBtn) sentenceGameNextBtn.disabled = false;
    updateSentenceGameNavButtons();
    renderSentenceGameBoard();
    onSentenceGameRoundReady(current);
  }

  function nextSentenceGameRound() {
    markSentenceGameActivity();
    const nextIndex = state.index + 1;

    if (nextIndex < state.history.length) {
      state.index = nextIndex;
      initSentenceGameRound();
      return;
    }

    const nextSentence = sentenceGameRandomSentence();
    if (!nextSentence) return;
    state.history.push(nextSentence);
    state.index = nextIndex;
    initSentenceGameRound();
  }

  function prevSentenceGameRound() {
    if (state.index <= 0) return;
    markSentenceGameActivity();
    state.index -= 1;
    initSentenceGameRound();
  }

  function retrySentenceGameRound() {
    markSentenceGameActivity();
    hideSentenceGameToast();
    state.built = [];
    state.completed = false;
    state.xpAwarded = false;
    state.hintXpAwarded = false;
    state.usedShowCorrect = false;
    state.successAlreadyShownForThisSentence = false;
    state.successToastLockUntil = 0;
    state.lastOutcomeForThisSentence = null;
    state.attemptResolved = false;
    hideSentenceGameCorrectPanel();
    if (sentenceGameFeedbackEl) {
      sentenceGameFeedbackEl.textContent = "";
      sentenceGameFeedbackEl.classList.remove("ok");
    }
    renderSentenceGameBoard();
    updateSentenceGameState();
    updateSentenceGameNavButtons();
  }

  return {
    filteredSentences,
    stopSpeaking,
    speakSentence,
    renderSentences,
    ensureSentenceItemsLoaded,
    currentSentence,
    getSentenceGameDifficulty: () => state.difficulty,
    setSentenceFilter: (value) => { state.sentenceFilter = value; },
    getSentenceFilter: () => state.sentenceFilter,
    getSentenceItems: () => state.sentenceItems,
    getSpeakingSentenceId: () => state.speakingSentenceId,
    setSentenceGameHistory: (history) => { state.history = history; },
    setSentenceGameIndex: (index) => { state.index = index; },
    initSentenceGameRound,
    loadSentenceGameDifficulty,
    setSentenceGameDifficultyPanelOpen,
    selectSentenceGameDifficulty,
    updateSentenceGameTipControls: () => {},
    undoSentenceGameMove,
    showSentenceGameCorrectAnswer,
    retrySentenceGameRound,
    prevSentenceGameRound,
    nextSentenceGameRound,
    sentenceGameIsSolved,
  };
}
