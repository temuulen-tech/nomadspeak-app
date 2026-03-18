/**
 * debug-tools.js
 * Centralized developer-only debug mode helpers and hidden debug panel wiring.
 * Enable with ?debug=1 (or true/on) or localStorage key nomadspeak:debug-mode=on.
 */

import { BOARD_WORLD_CHAPTERS } from "./chapters.js";
import { SCREEN_NAMES, STORAGE_KEYS } from "./constants.js";
import { loadString, persistDebugModeSetting } from "./storage.js";

const DEBUG_QUERY_PARAM = "debug";
const DEBUG_ON_VALUES = new Set(["1", "true", "on", "yes", "dev"]);
const DEBUG_OFF_VALUES = new Set(["0", "false", "off", "no"]);

function readQueryFlag(search = window.location.search) {
  const params = new URLSearchParams(search || "");
  const raw = params.get(DEBUG_QUERY_PARAM);
  if (raw == null) return null;
  const normalized = String(raw).trim().toLowerCase();
  if (DEBUG_ON_VALUES.has(normalized)) return true;
  if (DEBUG_OFF_VALUES.has(normalized)) return false;
  return null;
}

function readStoredFlag() {
  const raw = loadString(STORAGE_KEYS.DEBUG_MODE, "");
  if (!raw) return false;
  return DEBUG_ON_VALUES.has(String(raw).trim().toLowerCase());
}

export function isDebugModeEnabled() {
  const queryFlag = readQueryFlag();
  if (typeof queryFlag === "boolean") return queryFlag;
  return readStoredFlag();
}

export function persistDebugMode(enabled) {
  return persistDebugModeSetting(enabled);
}

function createScreenButtonMarkup(screen) {
  return `<button class="debug-panel-btn" type="button" data-debug-nav="${screen.id}">${screen.label}</button>`;
}

function createPanelMarkup() {
  const navScreens = [
    { id: SCREEN_NAMES.HOME, label: "Home" },
    { id: SCREEN_NAMES.LESSON, label: "Lesson" },
    { id: SCREEN_NAMES.SENTENCES, label: "Sentences" },
    { id: SCREEN_NAMES.SENTENCE_GAME, label: "Sentence Game" },
    { id: SCREEN_NAMES.QA_GAME, label: "Q&A" },
    { id: SCREEN_NAMES.STATS, label: "Stats" },
    { id: SCREEN_NAMES.PROFILE, label: "Profile" },
  ];

  return `
    <button class="debug-fab" id="debug-fab" type="button" aria-expanded="false" aria-controls="debug-panel">🛠 Dev</button>
    <aside class="debug-panel hidden" id="debug-panel" aria-label="Developer debug tools">
      <div class="debug-panel-header">
        <div>
          <p class="chip-label">Debug / Dev Mode</p>
          <p class="muted debug-panel-note">Enabled via <code>?debug=1</code> or <code>localStorage.${STORAGE_KEYS.DEBUG_MODE}='on'</code>.</p>
        </div>
        <button class="secondary debug-panel-close" id="debug-panel-close" type="button">Хаах</button>
      </div>

      <section class="debug-panel-section">
        <p class="chip-label">Quick navigation</p>
        <div class="debug-panel-grid">${navScreens.map(createScreenButtonMarkup).join("")}
          <button class="debug-panel-btn" type="button" data-debug-action="jump-cover">Chapter cover</button>
          <button class="debug-panel-btn" type="button" data-debug-action="jump-board">Board</button>
        </div>
      </section>

      <section class="debug-panel-section">
        <p class="chip-label">Chapter preview & board jumps</p>
        <label class="debug-panel-field" for="debug-chapter-select">Chapter</label>
        <select class="debug-panel-select" id="debug-chapter-select"></select>
        <div class="debug-panel-grid">
          <button class="debug-panel-btn" type="button" data-debug-action="preview-cover">Preview cover</button>
          <button class="debug-panel-btn" type="button" data-debug-action="jump-board-chapter">Board @ chapter start</button>
          <button class="debug-panel-btn" type="button" data-debug-action="unlock-chapters">Unlock all chapters</button>
        </div>
      </section>

      <section class="debug-panel-section">
        <p class="chip-label">Progress helpers</p>
        <div class="debug-panel-grid">
          <button class="debug-panel-btn" type="button" data-debug-action="give-xp-10">Give +10 XP</button>
          <button class="debug-panel-btn" type="button" data-debug-action="give-xp-100">Give +100 XP</button>
          <button class="debug-panel-btn" type="button" data-debug-action="give-rewards">Max rewards</button>
          <button class="debug-panel-btn debug-panel-btn-danger" type="button" data-debug-action="reset-progress">Reset progress</button>
        </div>
      </section>
    </aside>
  `;
}


function chapterOptionsMarkup(chapters = []) {
  return chapters.map((chapter) => `<option value="${chapter.id}">${chapter.index}. ${chapter.title}</option>`).join("");
}

export function initDebugTools(config = {}) {
  if (!isDebugModeEnabled()) return null;

  persistDebugMode(true);

  const root = document.createElement("div");
  root.className = "debug-panel-root";
  root.innerHTML = createPanelMarkup();
  document.body.appendChild(root);

  const fab = root.querySelector("#debug-fab");
  const panel = root.querySelector("#debug-panel");
  const closeBtn = root.querySelector("#debug-panel-close");
  const chapterSelect = root.querySelector("#debug-chapter-select");

  const setOpen = (isOpen) => {
    panel?.classList.toggle("hidden", !isOpen);
    fab?.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  const refreshChapterOptions = (chapters = config.getChapterOptions?.() || [BOARD_WORLD_CHAPTERS[0]]) => {
    if (!chapterSelect) return;
    const previousValue = chapterSelect.value;
    chapterSelect.innerHTML = chapterOptionsMarkup(chapters.filter(Boolean));
    chapterSelect.value = chapters.some((chapter) => chapter.id === previousValue) ? previousValue : (chapters[0]?.id || "");
  };

  refreshChapterOptions();

  const getSelectedChapterId = () => chapterSelect?.value || BOARD_WORLD_CHAPTERS[0]?.id;

  fab?.addEventListener("click", () => setOpen(panel?.classList.contains("hidden")));
  closeBtn?.addEventListener("click", () => setOpen(false));

  root.querySelectorAll("[data-debug-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      config.navigateTo?.(button.dataset.debugNav);
      setOpen(false);
    });
  });

  root.querySelectorAll("[data-debug-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const chapterId = getSelectedChapterId();
      const action = button.dataset.debugAction;
      if (action === "preview-cover") config.previewChapterCover?.(chapterId);
      if (action === "jump-cover") config.previewChapterCover?.(chapterId);
      if (action === "jump-board") config.jumpToBoard?.();
      if (action === "jump-board-chapter") config.jumpToBoardChapter?.(chapterId);
      if (action === "unlock-chapters") {
        config.unlockAllChapters?.();
        refreshChapterOptions();
      }
      if (action === "give-xp-10") config.giveXp?.(10);
      if (action === "give-xp-100") config.giveXp?.(100);
      if (action === "give-rewards") config.giveRewards?.();
      if (action === "reset-progress") config.resetProgress?.();
    });
  });

  const api = {
    enabled: true,
    open: () => setOpen(true),
    close: () => setOpen(false),
    isEnabled: () => true,
    disable: () => persistDebugMode(false),
    navigateTo: (screenId) => config.navigateTo?.(screenId),
    previewChapterCover: (chapterId = getSelectedChapterId()) => config.previewChapterCover?.(chapterId),
    jumpToBoard: () => config.jumpToBoard?.(),
    jumpToBoardChapter: (chapterId = getSelectedChapterId()) => config.jumpToBoardChapter?.(chapterId),
    unlockAllChapters: () => config.unlockAllChapters?.(),
    giveXp: (amount = 10) => config.giveXp?.(amount),
    giveRewards: () => config.giveRewards?.(),
    resetProgress: () => config.resetProgress?.(),
    chapters: () => (config.getChapterOptions?.() || BOARD_WORLD_CHAPTERS).map((chapter) => ({ ...chapter })),
    refreshChapters: () => refreshChapterOptions(),
  };

  window.NomadSpeakDebug = api;
  return api;
}
