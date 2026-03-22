/**
 * source-map.js
 * Developer-facing source-of-truth map for screen render ownership and shared UI duplication hotspots.
 */

export const APP_SOURCE_MAP = {
  screens: {
    home: {
      id: "start-screen",
      routeKey: "START",
      primaryFiles: ["index.html", "home-screen.js", "render-home.js", "screen-navigation.js"],
      renderFunctions: ["initHomeScreen", "renderHomeScreen", "showScreen"],
      childAreas: ["home header", "intro panel", "modes menu", "stats/profile entry buttons"],
    },
    lesson: {
      id: "quiz-screen",
      routeKey: "LESSON",
      primaryFiles: ["index.html", "lesson-screen.js", "render-lesson.js", "lesson-flow.js", "screen-navigation.js"],
      renderFunctions: ["initLessonScreen", "renderLessonScreen", "renderLessonAnswerState", "createLessonFlow", "showScreen"],
      childAreas: ["top action buttons", "lesson status bar", "lesson flow panel", "reward bar", "question/options area"],
    },
    sentences: {
      id: "sentences-screen",
      routeKey: "SENTENCES",
      primaryFiles: ["index.html", "sentence-game-wiring.js", "script.js", "screen-navigation.js"],
      renderFunctions: ["createSentenceFilterControls", "renderSentencesRewardStrip", "showScreen"],
      childAreas: ["top action buttons", "status bar", "reward strip", "tts controls", "sentences list"],
    },
    qaGame: {
      id: "qa-game-screen",
      routeKey: "QA_GAME",
      primaryFiles: ["index.html", "qa-flow.js", "qa-wiring.js", "screen-navigation.js"],
      renderFunctions: ["createQaFlow", "createQaControls", "showScreen"],
      childAreas: ["top action buttons", "QA runtime status bar", "round panel", "word bank", "help/sentences modal"],
    },
    sentenceGame: {
      id: "sentence-game-screen",
      routeKey: "SENTENCE_GAME",
      primaryFiles: ["index.html", "sentence-game-wiring.js", "sentence-runtime.js", "sentence-game-reward-manager.js", "screen-navigation.js"],
      renderFunctions: ["createSentenceGameControls", "createSentenceRuntime", "createSentenceGameRewardManager", "showScreen"],
      childAreas: ["top action buttons", "status bar", "reward row/banner", "builder controls", "tip/audio panel"],
    },
    boardEntry: {
      id: "board-game-intro-screen",
      routeKey: "CHAPTER_COVER",
      primaryFiles: ["index.html", "chapter-cover-screen.js", "screen-navigation.js"],
      renderFunctions: ["initChapterCoverScreen", "setPreview", "syncSelectorUi", "showScreen"],
      childAreas: ["cover art", "entry panel", "world selector", "difficulty selector"],
    },
    board: {
      id: "board-game-screen",
      routeKey: "BOARD",
      primaryFiles: ["index.html", "board-screen.js", "render-board.js", "board-runtime.js", "screen-navigation.js"],
      renderFunctions: ["initBoardScreen", "renderBoardScreen", "renderBoardMeta", "renderBoardChallenge", "showScreen"],
      childAreas: ["board top bar", "story panel", "challenge panel", "dice/roll controls", "feedback hub"],
    },
    stats: {
      id: "stats-screen",
      routeKey: "STATS",
      primaryFiles: ["render-shell.js", "stats-screen.js", "progress-ui.js", "screen-navigation.js"],
      renderFunctions: ["mountAppShell", "initStatsScreen", "createProgressUi", "showScreen"],
      childAreas: ["exit row", "progress summary", "time KPI blocks", "reward tabs/cards"],
    },
    rewardAreas: {
      id: "cross-screen-rewards",
      routeKey: "REWARD_SYSTEM",
      primaryFiles: ["render-rewards.js", "progress-ui.js", "sentence-game-reward-manager.js", "render-shell.js", "index.html"],
      renderFunctions: ["renderRewards", "renderRewardStripTiles", "renderLinearRewardBar", "renderSentencesRewardStrip", "createTimedRewardTrack", "createSentenceGameRewardManager"],
      childAreas: ["lesson reward bar", "sentences reward strip", "sentence game reward row/banner", "QA reward bar", "stats reward cards", "profile reward snapshot"],
    },
  },
  sharedUiBlocks: {
    topActionButtons: {
      label: "Top action buttons",
      currentFiles: ["index.html", "render-shell.js", "standardized-labels.js"],
      duplicated: true,
      recommendedSourceOfTruth: "shared-top-actions.js or a render-shell fragment factory used by index.html + shell-mounted screens",
      riskyDuplicates: ["lesson", "sentences", "sentence game", "QA", "stats/profile/end exit rows"],
    },
    statusBar: {
      label: "Status bar",
      currentFiles: ["index.html", "app-dom.js", "screen-navigation.js", "qa-flow.js"],
      duplicated: true,
      recommendedSourceOfTruth: "app-dom.js selectors + shared status-bar renderer/helper",
      riskyDuplicates: ["lesson topbar", "sentences game-status-bar", "sentence-game game-status-bar", "qa-runtime-status-bar"],
    },
    rewardPanel: {
      label: "Reward panel",
      currentFiles: ["index.html", "render-rewards.js", "progress-ui.js", "sentence-game-reward-manager.js", "render-shell.js"],
      duplicated: true,
      recommendedSourceOfTruth: "render-rewards.js + reward panel config per mode",
      riskyDuplicates: ["lesson reward tiles", "sentences reward strip", "sentence-game reward row", "QA reward row", "stats reward cards"],
    },
    lessonFlowPanel: {
      label: "Lesson flow panel",
      currentFiles: ["index.html", "render-lesson.js", "lesson-flow.js"],
      duplicated: false,
      recommendedSourceOfTruth: "lesson-flow.js + render-lesson.js",
      riskyDuplicates: ["copy/state text split across markup and render logic"],
    },
    audioControlPanel: {
      label: "Audio/control panel",
      currentFiles: ["index.html", "audio-wiring.js", "sentence-game-wiring.js", "qa-wiring.js", "standardized-labels.js"],
      duplicated: true,
      recommendedSourceOfTruth: "shared learning utility controls module with per-screen config",
      riskyDuplicates: ["sound toggle buttons", "time-details buttons", "vault/save buttons", "level-picker wrappers"],
    },
  },
  renderSources: {
    domRegistry: ["app-dom.js"],
    screenLifecycle: ["home-screen.js", "lesson-screen.js", "chapter-cover-screen.js", "board-screen.js", "stats-screen.js"],
    navigation: ["screen-navigation.js"],
    shellMountedMarkup: ["render-shell.js"],
    staticMarkup: ["index.html"],
  },
  riskyDuplicateAreas: [
    {
      area: "QA status area",
      why: "QA has a custom runtime status shell plus cleanup logic in qa-flow.js, while other learning screens hardcode similar status bars in index.html.",
      files: ["index.html", "qa-flow.js", "app-dom.js"],
    },
    {
      area: "Top action buttons",
      why: "Exit/time/vault/save/sound controls are repeated with near-identical markup across lesson, sentences, sentence game, QA, and shell-mounted screens.",
      files: ["index.html", "render-shell.js", "standardized-labels.js"],
    },
    {
      area: "Reward and time-reward UI",
      why: "Reward tiles/rows are partly hardcoded in HTML and partly rendered by shared reward helpers, increasing drift risk across learning modes and stats.",
      files: ["index.html", "render-rewards.js", "progress-ui.js", "sentence-game-reward-manager.js"],
    },
  ],
};
