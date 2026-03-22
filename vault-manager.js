import { closeModal, openModal } from "./modal.js";
import { DIFFICULTY_LEVELS, SCREEN_NAMES } from "./constants.js";
import { setDisabledState, toggleClass } from "./ui.js";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderVaultEnMnLine(enText, mnText) {
  const safeEn = escapeHtml(enText || "");
  const safeMn = escapeHtml(mnText || "");
  return `<span class="vault-entry-en">${safeEn}</span><span class="vault-entry-mn">${safeMn}</span>`;
}

export function createVaultManager({
  badgeElsByScreen = {},
  modal = {},
  showVaultToast = () => {},
  lessonMnTranslation = () => "",
  sentencesListEl = null,
  appSettings = () => ({}),
  sentenceItems = () => [],
  speakingSentenceId = () => null,
  stopSpeaking = () => {},
  speakSentence = () => {},
  sentenceGame = {},
  qa = {},
  lesson = {},
  markWordLearned = () => {},
  showScreen = () => {},
  screens = {},
}) {
  const VAULT_KEY_BY_SCREEN = {
    lesson: "repeatVault_lesson",
    qna: "repeatVault_qna",
    sentenceGame: "repeatVault_sentenceGame",
    sentences: "repeatVault_sentences",
  };

  const VAULT_SCREEN_META = {
    lesson: { badgeEl: badgeElsByScreen.lesson, title: "Хичээлийн хадгалсан асуултууд" },
    qna: { badgeEl: badgeElsByScreen.qna, title: "Q&A тоглоомын хадгалсан зүйлс" },
    sentenceGame: { badgeEl: badgeElsByScreen.sentenceGame, title: "Өгүүлбэрийн тоглоомын хадгалсан зүйлс" },
    sentences: { badgeEl: badgeElsByScreen.sentences, title: "Өгүүлбэрүүдийн хадгалсан зүйлс" },
  };

  function enrichLessonVaultItemWithMn(item) {
    if (!item || typeof item !== "object") return item;
    const next = { ...item };
    next.questionMn = next.questionMn || lessonMnTranslation(next.questionText);
    next.correctAnswerMn = next.correctAnswerMn || lessonMnTranslation(next.correctAnswer);

    const options = Array.isArray(next.options) ? next.options.slice() : [];
    const optionMnMap = (next.optionMnMap && typeof next.optionMnMap === "object") ? { ...next.optionMnMap } : {};
    options.forEach((option) => {
      if (!optionMnMap[option]) optionMnMap[option] = lessonMnTranslation(option);
    });
    next.optionMnMap = optionMnMap;
    return next;
  }

  const VAULT_ITEM_RENDERERS = {
    lesson: (item) => {
      const options = Array.isArray(item.options) ? item.options : [];
      const optionMnMap = (item.optionMnMap && typeof item.optionMnMap === "object") ? item.optionMnMap : {};
      const optionsHtml = options.map((option, index) => {
        const mnText = optionMnMap[option] || lessonMnTranslation(option);
        const correctBadge = option === item.correctAnswer ? ' <span class="vault-option-badge">(Зөв)</span>' : "";
        return `<div class="vault-option-line">${index + 1}. ${renderVaultEnMnLine(option, mnText)}${correctBadge}</div>`;
      }).join("");

      return `
        <p><strong>Түвшин:</strong> ${escapeHtml(item.level || "")}</p>
        <p><strong>Асуулт:</strong> ${renderVaultEnMnLine(item.questionText, item.questionMn || lessonMnTranslation(item.questionText))}</p>
        <p class="vault-correct-answer"><strong>Зөв хариулт:</strong> ${renderVaultEnMnLine(item.correctAnswer, item.correctAnswerMn || lessonMnTranslation(item.correctAnswer))}</p>
        <div class="vault-options-list">${optionsHtml}</div>
      `;
    },
    qna: (item) => `<p><strong>Монгол Асуулт:</strong> ${item.mnQuestion || ""}</p><p><strong>Монгол Хариулт:</strong> ${item.mnAnswer || ""}</p><p><strong>Англи Асуулт:</strong> ${item.enQuestion || ""}</p><p><strong>Англи Хариулт:</strong> ${item.enAnswer || ""}</p><p><strong>Түвшин:</strong> ${item.level || ""}</p>`,
    sentenceGame: (item) => `<p><strong>Англи:</strong> ${item.enSentence || ""}</p><p><strong>Монгол:</strong> ${item.mnTranslation || "-"}</p><p><strong>Түвшин:</strong> ${item.level || ""}</p>`,
    sentences: (item) => `
      <p><strong>Англи:</strong> ${item.enSentence || ""}</p>
      <p><strong>Монгол:</strong> ${item.mnTranslation || "-"}</p>
      <button type="button" class="vault-sentence-speak-btn" data-id="${item.id}" aria-pressed="false">▶ Дараад сонс</button>
    `,
  };

  function safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function keyForScreen(screenId) {
    return VAULT_KEY_BY_SCREEN[screenId] || `repeatVault_${screenId}`;
  }

  function loadVault(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      if (key !== keyForScreen(SCREEN_NAMES.LESSON)) return parsed;

      let changed = false;
      const normalized = parsed.map((item) => {
        const enriched = enrichLessonVaultItemWithMn(item);
        if (JSON.stringify(enriched) !== JSON.stringify(item)) changed = true;
        return enriched;
      });
      if (changed) safeLocalStorageSet(key, JSON.stringify(normalized));
      return normalized;
    } catch {
      return [];
    }
  }

  function saveToVault(key, item) {
    if (!item || !item.id) return { ok: false, reason: "invalid" };
    const list = loadVault(key);
    if (list.some((entry) => entry.id === item.id)) return { ok: false, reason: "duplicate" };
    list.unshift(item);
    if (!safeLocalStorageSet(key, JSON.stringify(list))) return { ok: false, reason: "storage" };
    return { ok: true, reason: "saved", count: list.length };
  }

  function removeFromVault(key, id) {
    const next = loadVault(key).filter((entry) => entry.id !== id);
    safeLocalStorageSet(key, JSON.stringify(next));
    return next;
  }

  function updateBadge(key) {
    const screenId = Object.keys(VAULT_KEY_BY_SCREEN).find((id) => VAULT_KEY_BY_SCREEN[id] === key);
    const meta = screenId ? VAULT_SCREEN_META[screenId] : null;
    if (!meta?.badgeEl) return;
    meta.badgeEl.textContent = String(loadVault(key).length);
  }

  function showSaveResult(result = {}) {
    if (result.reason === "duplicate") return showVaultToast("Өмнө нь хадгалсан байна");
    if (result.reason === "storage") return showVaultToast("Хадгалах үед алдаа гарлаа. Дахин оролдоно уу.");
    showVaultToast("Хадгаллаа ✅");
  }

  function findItem(sectionKey, itemId) {
    if (!sectionKey || !itemId) return null;
    return loadVault(keyForScreen(sectionKey)).find((entry) => entry.id === itemId) || null;
  }

  function focusSentenceFromVault(savedItem) {
    if (!savedItem || !sentencesListEl) return;
    const targetSentence = String(savedItem.enSentence || "").trim().toLowerCase();
    if (!targetSentence) return;

    const rows = [...sentencesListEl.querySelectorAll(".sentence-row")];
    const targetRow = rows.find((row) => String(row.querySelector(".sentence-en")?.textContent || "").trim().toLowerCase() === targetSentence);

    if (!targetRow) {
      qa.openModal?.(
        "Өгүүлбэр давтах",
        `<p><strong>Англи:</strong> ${escapeHtml(savedItem.enSentence || "")}</p><p><strong>Монгол:</strong> ${escapeHtml(savedItem.mnTranslation || "-")}</p>`
      );
      return;
    }

    sentencesListEl.querySelectorAll(".sentence-row.is-repeat-target").forEach((row) => row.classList.remove("is-repeat-target"));
    targetRow.classList.add("is-repeat-target");
    targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
    targetRow.querySelector(".speak-btn")?.focus();

    if (appSettings().soundEnabled) {
      const sourceItem = sentenceItems().find((item) => String(item.en || "").trim().toLowerCase() === targetSentence)
        || { id: Number(targetRow.querySelector(".speak-btn")?.dataset.id || 0), en: savedItem.enSentence };
      setTimeout(() => speakSentence(sourceItem), 120);
    }
  }

  function loadSentenceGameFromVault(savedItem) {
    if (!savedItem?.enSentence) return;
    const normalized = String(savedItem.enSentence).trim().toLowerCase();
    const matched = sentenceItems().find((item) => String(item.en || "").trim().toLowerCase() === normalized)
      || { en: savedItem.enSentence, mn: savedItem.mnTranslation || "", level: (savedItem.level || DIFFICULTY_LEVELS.BEGINNER).toLowerCase() };
    sentenceGame.setHistory?.([matched]);
    sentenceGame.setIndex?.(0);
    sentenceGame.initRound?.();
  }

  function loadQaRoundFromVault(savedItem) {
    if (!savedItem) return;
    const round = {
      id: savedItem.id || `vault-${Date.now()}`,
      mnQuestion: savedItem.mnQuestion || "",
      mnAnswer: savedItem.mnAnswer || "",
      enQuestion: savedItem.enQuestion || "",
      enAnswer: savedItem.enAnswer || "",
    };
    qa.loadRound?.(round);
  }

  function repeatFromVault(sectionKey, itemId) {
    const savedItem = findItem(sectionKey, itemId);
    if (!savedItem) {
      showVaultToast("Хадгалсан өгөгдөл олдсонгүй.");
      return;
    }

    closeModal(modal.modalEl);

    if (sectionKey === SCREEN_NAMES.LESSON) return lesson.startFromSaved?.(savedItem);
    if (sectionKey === SCREEN_NAMES.SENTENCES) {
      stopSpeaking();
      showScreen(screens.sentences);
      sentenceGame.renderSentences?.();
      focusSentenceFromVault(savedItem);
      return;
    }
    if (sectionKey === "sentenceGame") {
      stopSpeaking();
      showScreen(screens.sentenceGame);
      loadSentenceGameFromVault(savedItem);
      sentenceGame.enforceFreeXpGate?.();
      return;
    }
    if (sectionKey === "qna") {
      stopSpeaking();
      showScreen(screens.qaGame);
      loadQaRoundFromVault(savedItem);
    }
  }

  function renderModalForKey(key) {
    const { modalEl, bodyEl, titleEl, replayBtn, deleteBtn, learnedBtn } = modal;
    if (!modalEl || !bodyEl || !titleEl) return;
    const screenId = Object.keys(VAULT_KEY_BY_SCREEN).find((id) => VAULT_KEY_BY_SCREEN[id] === key);
    const list = loadVault(key);
    const meta = VAULT_SCREEN_META[screenId] || { title: "Хадгалсан дасгал" };
    titleEl.textContent = meta.title;

    let selectedId = list.length ? list[0].id : "";
    const setSelectedEntry = (entryId) => {
      selectedId = entryId || "";
      bodyEl.querySelectorAll(".vault-entry").forEach((entry) => {
        toggleClass(entry, "is-selected", entry.dataset.id === selectedId);
      });
    };

    [replayBtn, deleteBtn, learnedBtn].forEach((button) => {
      if (button) setDisabledState(button, !list.length);
    });

    if (!list.length) {
      bodyEl.innerHTML = '<div class="vault-list"><p>Одоогоор хадгалсан зүйл алга.</p></div>';
      openModal(modalEl);
      return;
    }

    const renderItem = VAULT_ITEM_RENDERERS[screenId] || ((item) => `<p>${item.id}</p>`);
    openModal(modalEl, {
      titleEl,
      title: meta.title,
      bodyEl,
      bodyHtml: `<div class="vault-list">${list.map((item) => `<article class="vault-entry" data-id="${item.id}">${renderItem(item)}</article>`).join("")}</div>`,
    });
    setSelectedEntry(selectedId);

    bodyEl.querySelectorAll(".vault-entry").forEach((entry) => {
      entry.addEventListener("click", () => {
        const itemId = entry.dataset.id;
        if (itemId) setSelectedEntry(itemId);
      });
    });

    if (screenId === SCREEN_NAMES.SENTENCES) {
      bodyEl.querySelectorAll(".vault-sentence-speak-btn").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          const itemId = String(btn.dataset.id || "");
          if (!itemId) return;
          setSelectedEntry(itemId);
          const sentenceText = list.find((entry) => String(entry.id) === itemId)?.enSentence || "";
          if (!sentenceText) return;
          if (String(speakingSentenceId() || "") === itemId) {
            stopSpeaking();
            return;
          }
          speakSentence({ id: itemId, en: sentenceText });
        });
      });
    }

    if (replayBtn) {
      replayBtn.onclick = () => {
        if (screenId && selectedId) repeatFromVault(screenId, selectedId);
      };
    }

    const removeSelected = () => {
      if (!selectedId) return;
      removeFromVault(key, selectedId);
      updateBadge(key);
      showVaultToast("Хадгалсанаас устгалаа 🗑️");
      renderModalForKey(key);
    };

    if (deleteBtn) deleteBtn.onclick = removeSelected;
    if (learnedBtn) {
      learnedBtn.onclick = () => {
        const learnedEntry = list.find((entry) => entry.id === selectedId);
        const learnedWord = learnedEntry?.enSentence || learnedEntry?.correctAnswer || learnedEntry?.enAnswer || learnedEntry?.questionText;
        if (learnedWord) markWordLearned(learnedWord);
        removeSelected();
      };
    }
  }

  return {
    keyForScreen,
    loadVault,
    saveToVault,
    updateBadge,
    showSaveResult,
    renderModal: renderModalForKey,
    saveSentenceListItem(item) {
      if (!item) return;
      const payload = {
        id: `sentences:${String(item.en || "").toLowerCase().trim()}`,
        enSentence: item.en,
        mnTranslation: item.mn || "",
        voiceSetting: appSettings().ttsSettings?.voice,
        timestamp: Date.now(),
      };
      const key = keyForScreen(SCREEN_NAMES.SENTENCES);
      const result = saveToVault(key, payload);
      updateBadge(key);
      showSaveResult(result);
    },
  };
}
