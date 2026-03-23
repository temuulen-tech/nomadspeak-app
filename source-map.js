/**
 * source-map.js
 * Developer-facing source-of-truth map for screen render ownership and shared UI duplication hotspots.
 */

export const APP_SOURCE_MAP = {
  assetRegistry: {
    primaryRegistryFile: "assets.js",
    planningRegistryFile: "asset-registry.js",
    purpose: "Keep runtime asset ids in assets.js and track usage/duplication cleanup in asset-registry.js before broader migration work.",
    nextMigrationFocus: "rewardArt",
  },
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
      appearsOnScreens: ["lesson", "sentences", "sentenceGame", "qaGame", "stats", "profile", "end"],
      currentRenderPaths: [
        "index.html -> #quiz-screen .top-action-buttons",
        "index.html -> #sentences-screen .top-action-buttons",
        "index.html -> #sentence-game-screen .top-action-buttons",
        "index.html -> #qa-game-screen .top-action-buttons",
        "render-shell.js -> #stats-screen .play-exit-row",
        "render-shell.js -> #profile-screen .panel-header",
        "render-shell.js -> #end-screen .panel-header",
      ],
      currentFiles: ["index.html", "render-shell.js", "standardized-labels.js", "app-dom.js"],
      duplicationStatus: "duplicated",
      recommendedSourceOfTruth: "shared-ui/learning-top-actions.js or a render-shell fragment factory used by index.html + shell-mounted screens",
      riskNotes: [
        "Highest-risk duplicate: exit/time/vault/save/sound controls drift across lesson, sentences, sentence game, QA, and shell screens.",
        "Standardized labels already exist in standardized-labels.js, which makes this the safest first extraction target.",
      ],
    },
    statusBar: {
      label: "Status bar",
      appearsOnScreens: ["lesson", "sentences", "sentenceGame", "qaGame"],
      currentRenderPaths: [
        "index.html -> #topbar .game-status-bar[data-game-status='lesson']",
        "index.html -> #sentences-screen .game-status-bar[data-game-status='sentences']",
        "index.html -> #sentence-game-screen .game-status-bar[data-game-status='sentence-game']",
        "index.html -> #qa-runtime-status-bar",
      ],
      currentFiles: ["index.html", "app-dom.js", "script.js", "qa-flow.js"],
      duplicationStatus: "duplicated with QA-specific wrapper",
      recommendedSourceOfTruth: "app-dom.js selector registry + shared status-bar renderer/helper",
      riskNotes: [
        "QA status markup is not structurally identical to the learning-status-shell used elsewhere.",
        "qa-flow.js performs runtime normalization/removal of progress-like nodes, so extraction needs explicit QA adapter hooks.",
      ],
    },
    rewardPanel: {
      label: "Reward panel / time-reward area",
      appearsOnScreens: ["lesson", "sentences", "sentenceGame", "qaGame", "stats", "profile"],
      currentRenderPaths: [
        "index.html -> #lesson-reward-bar",
        "index.html -> #sentences-reward-strip",
        "index.html -> #sentence-game-reward-row + #sentence-game-reward-banner",
        "script.js -> qa reward bindings via qaRewardBarEl/qaRewardImageEls",
        "progress-ui.js -> stats reward cards",
        "render-shell.js -> stats/profile reward containers",
      ],
      currentFiles: ["index.html", "render-rewards.js", "progress-ui.js", "sentence-game-reward-manager.js", "render-shell.js", "script.js"],
      duplicationStatus: "partially duplicated / partially shared",
      recommendedSourceOfTruth: "render-rewards.js + reward panel config per mode, with sentence-game banner kept as a mode-specific adapter",
      riskNotes: [
        "Shared reward logic exists, but the DOM contract differs by screen.",
        "Sentence game owns its own reward manager while lesson/sentences rely more directly on shared helpers.",
      ],
    },
    audioControlPanel: {
      label: "Audio/control panel",
      appearsOnScreens: ["sentences", "sentenceGame", "qaGame", "profile", "end"],
      currentRenderPaths: [
        "index.html -> .sentences-top-controls",
        "index.html -> #sentence-game-tip-panel",
        "index.html -> .qa-learning-tools",
        "render-shell.js -> shell sound toggle buttons",
      ],
      currentFiles: ["index.html", "audio-wiring.js", "sentence-game-wiring.js", "qa-wiring.js", "render-shell.js", "standardized-labels.js"],
      duplicationStatus: "partially duplicated",
      recommendedSourceOfTruth: "shared learning utility controls module with per-screen config",
      riskNotes: [
        "Controls are conceptually related but not yet structurally identical.",
      ],
    },
    lessonFlowPanel: {
      label: "Lesson flow panel",
      appearsOnScreens: ["lesson"],
      currentRenderPaths: ["index.html -> .lesson-flow-panel", "render-lesson.js -> lesson answer state", "lesson-flow.js -> flow state"],
      currentFiles: ["index.html", "render-lesson.js", "lesson-flow.js"],
      duplicationStatus: "already somewhat shared",
      recommendedSourceOfTruth: "lesson-flow.js + render-lesson.js",
      riskNotes: [
        "Use this as the reference owner for lesson flow; do not generalize during the mapping step.",
      ],
    },
    titleTimeChipArea: {
      label: "Top title/time chip area",
      appearsOnScreens: ["lesson", "sentences", "sentenceGame", "end", "stats/profile partials"],
      currentRenderPaths: [
        "index.html -> #quiz-screen .learning-header-row",
        "index.html -> #sentences-screen .learning-header-row",
        "index.html -> #sentence-game-screen .learning-header-row",
        "render-shell.js -> #end-screen .time-widget",
      ],
      currentFiles: ["index.html", "render-shell.js", "app-dom.js", "script.js"],
      duplicationStatus: "partially duplicated",
      recommendedSourceOfTruth: "shared header-row fragment alongside the future status-bar renderer",
      riskNotes: [
        "QA does not use the same title/time row, so it should join later through an adapter rather than forcing exact parity.",
      ],
    },
    utilityRowsAndButtons: {
      label: "Repeated utility rows/buttons",
      appearsOnScreens: ["lesson", "sentences", "sentenceGame", "qaGame"],
      currentRenderPaths: [
        "index.html -> learning-master-row blocks across lesson/sentences/sentence-game/QA",
        "index.html -> sentences/QA/sentence-game support control groups",
        "standardized-labels.js -> cross-screen button label normalization",
      ],
      currentFiles: ["index.html", "standardized-labels.js", "script.js", "audio-wiring.js", "sentence-game-wiring.js", "qa-wiring.js"],
      duplicationStatus: "duplicated / partially duplicated",
      recommendedSourceOfTruth: "shared row renderer with per-screen config objects for level pickers and auxiliary tools",
      riskNotes: [
        "Sentence vs QA vs quiz control structures use the same grouping idea but with mismatched wrappers and control inventories.",
      ],
    },
  },
  renderSources: {
    domRegistry: ["app-dom.js"],
    screenLifecycle: ["home-screen.js", "lesson-screen.js", "chapter-cover-screen.js", "board-screen.js", "stats-screen.js"],
    navigation: ["screen-navigation.js"],
    shellMountedMarkup: ["render-shell.js"],
    staticMarkup: ["index.html"],
  },
  recommendedUnificationOrder: [
    "topActionButtons",
    "statusBar",
    "titleTimeChipArea",
    "rewardPanel",
    "utilityRowsAndButtons",
    "audioControlPanel",
  ],
  riskyDuplicateAreas: [
    {
      area: "Top action buttons",
      why: "Exit/time/vault/save/sound controls are repeated with near-identical markup across lesson, sentences, sentence game, QA, and shell-mounted screens.",
      files: ["index.html", "render-shell.js", "standardized-labels.js", "app-dom.js"],
      priority: 1,
    },
    {
      area: "QA status area and runtime wrappers",
      why: "QA has a custom runtime status shell plus cleanup logic in qa-flow.js, while other learning screens hardcode similar status bars in index.html.",
      files: ["index.html", "qa-flow.js", "app-dom.js", "script.js"],
      priority: 2,
    },
    {
      area: "Reward and time-reward UI",
      why: "Reward tiles/rows are partly hardcoded in HTML and partly rendered by shared reward helpers, increasing drift risk across learning modes and stats.",
      files: ["index.html", "render-rewards.js", "progress-ui.js", "sentence-game-reward-manager.js", "script.js"],
      priority: 3,
    },
    {
      area: "Sentence vs QA vs quiz duplicated control structures",
      why: "Learning control groups follow the same conceptual layout but use different wrappers, level pickers, and helper rows that will complicate unification.",
      files: ["index.html", "sentence-game-wiring.js", "qa-wiring.js", "audio-wiring.js"],
      priority: 4,
    },
  ],
};

export const APP_PLACEMENT_SYSTEM = {
  version: "phase-55-placement-foundation",
  purpose: "Placement ownership map for repeated learning-screen UI blocks and future asset-bearing surfaces.",
  guardrails: [
    "Do not change Home screen layout or appearance while applying this map.",
    "Use this map to decide parent containers/order before migrating shared UI fragments.",
    "Prefer config and documentation updates over runtime refactors in this phase.",
  ],
  canonicalContainers: {
    learningScreenShell: {
      selector: ".learning-screen-shell",
      role: "Top-level owner for lesson, sentences, sentence game, and QA screen block ordering.",
    },
    learningHeader: {
      selector: ".learning-layout-header",
      role: "Owns top action buttons and any title/time chip row before status/reward content.",
    },
    learningStatusShell: {
      selector: ".learning-status-shell, #qa-runtime-status-bar",
      role: "Owns score/progress/timer state blocks directly below header/title rows.",
    },
    contentBody: {
      selector: "screen-specific content wrapper",
      role: "Owns lesson flow, QA round content, sentence lists, or sentence-builder runtime content.",
    },
  },
  orderRules: {
    learningScreensDefault: [
      "topActionButtons",
      "titleTimeChipArea",
      "statusBar",
      "rewardPanel",
      "audioControlPanel",
      "lessonFlowPanel",
      "qaContentPanel",
      "sentenceQuizContentList",
      "futureMediaStage",
    ],
    lessonAndSentencePattern: [
      "topActionButtons -> titleTimeChipArea -> statusBar -> rewardPanel -> screen-specific control/content blocks",
      "Reward should stay above the question/list content area unless a mode-specific adapter explicitly owns an inline banner.",
    ],
    qaPattern: [
      "topActionButtons -> qa status shell -> qa round panel content",
      "QA should not receive lesson/sentences reward wrappers inside #qa-runtime-status-bar without an adapter because qa-flow.js removes legacy progress-like nodes.",
    ],
    sentenceGamePattern: [
      "topActionButtons -> titleTimeChipArea -> statusBar -> reward banner/row adapters -> tip/audio panel -> builder content/actions",
      "Sentence-game reward banner can stay separate, but its ownership should still resolve through the shared reward placement entry.",
    ],
  },
  placements: {
    topActionButtons: {
      blockName: "Top action buttons",
      intendedScreens: ["lesson", "sentences", "sentenceGame", "qaGame"],
      correctParentContainer: ".learning-layout-header > .top-action-buttons",
      correctRelativeOrder: 1,
      forbiddenOrLegacyContainers: [".question-text-wrap", ".qa-round-panel", ".sentences-list", "#screen-shell-aux"],
      currentRuntimeSources: [
        "index.html -> #quiz-screen .top-action-buttons",
        "index.html -> #sentences-screen .top-action-buttons",
        "index.html -> #sentence-game-screen .top-action-buttons",
        "index.html -> #qa-game-screen .top-action-buttons",
        "render-shell.js -> shell-only utility variants",
      ],
      riskNotes: [
        "Highest duplication area; labels/order drift easily across learning screens.",
        "Should migrate before status/reward so a single header contract exists.",
      ],
    },
    titleTimeChipArea: {
      blockName: "Title/time chip area",
      intendedScreens: ["lesson", "sentences", "sentenceGame"],
      correctParentContainer: ".learning-layout-header > .learning-header-row",
      correctRelativeOrder: 2,
      forbiddenOrLegacyContainers: ["#qa-runtime-status-bar", ".qa-round-panel", ".sentence-game-tip-panel"],
      currentRuntimeSources: [
        "index.html -> #quiz-screen .learning-header-row",
        "index.html -> #sentences-screen .learning-header-row",
        "index.html -> #sentence-game-screen .learning-header-row",
        "render-shell.js -> end/profile partial time widgets",
      ],
      riskNotes: [
        "QA currently has no equivalent title/time chip row, so parity should come through an adapter later.",
      ],
    },
    statusBar: {
      blockName: "Status bar",
      intendedScreens: ["lesson", "sentences", "sentenceGame", "qaGame"],
      correctParentContainer: "lesson/sentences/sentenceGame: .learning-layout-header + .learning-status-shell; QA: #qa-runtime-status-bar directly below .qa-game-header",
      correctRelativeOrder: 3,
      forbiddenOrLegacyContainers: [".lesson-flow-panel", ".qa-round-panel .qa-learning-tools", ".sentences-top-controls"],
      currentRuntimeSources: [
        "index.html -> #topbar .game-status-bar[data-game-status='lesson']",
        "index.html -> #sentences-screen .game-status-bar[data-game-status='sentences']",
        "index.html -> #sentence-game-screen .game-status-bar[data-game-status='sentence-game']",
        "index.html -> #qa-runtime-status-bar",
        "qa-flow.js -> normalizeQaStatusUi() cleanup adapter",
      ],
      riskNotes: [
        "Status bar placement drift is already present because QA uses a separate shell and cleanup rules.",
        "Do not insert reward/progress tracks into the QA status shell until qa-flow.js adapter rules are formalized.",
      ],
    },
    rewardPanel: {
      blockName: "Reward panel / reward strip",
      intendedScreens: ["lesson", "sentences", "sentenceGame", "qaGame", "stats", "profile"],
      correctParentContainer: "lesson/sentences/sentenceGame: direct child of .learning-screen-shell after status/header blocks; QA: adapter-owned runtime container outside #qa-runtime-status-bar; stats/profile: shell-owned reward containers",
      correctRelativeOrder: 4,
      forbiddenOrLegacyContainers: ["#qa-runtime-status-bar", ".learning-master-top", ".qa-learning-tools", ".question-row"],
      currentRuntimeSources: [
        "index.html -> #lesson-reward-bar",
        "index.html -> #sentences-reward-strip",
        "index.html -> #sentence-game-reward-row + #sentence-game-reward-banner",
        "script.js -> qa reward bindings via qaRewardBarEl / qaRewardImageEls",
        "render-rewards.js -> shared reward rendering helpers",
        "sentence-game-reward-manager.js -> sentence-game reward adapter",
      ],
      riskNotes: [
        "Reward block placement is inconsistent today across static strips, banners, and QA runtime bindings.",
        "Most likely to break when assets or animation hooks arrive unless placement ownership is unified first.",
      ],
    },
    audioControlPanel: {
      blockName: "Audio/control panel",
      intendedScreens: ["sentences", "sentenceGame", "qaGame"],
      correctParentContainer: "sentences: .learning-screen-shell > .sentences-top-controls; sentenceGame: #sentence-game-tip-panel; QA: .qa-round-content > .qa-learning-tools",
      correctRelativeOrder: 5,
      forbiddenOrLegacyContainers: [".learning-layout-header", "#qa-runtime-status-bar", ".learning-header-row"],
      currentRuntimeSources: [
        "index.html -> .sentences-top-controls",
        "index.html -> #sentence-game-tip-panel",
        "index.html -> .qa-learning-tools",
        "audio-wiring.js / sentence-game-wiring.js / qa-wiring.js -> runtime control ownership",
      ],
      riskNotes: [
        "Duplicated per-screen control containers exist today; do not merge them blindly because their action inventories differ.",
      ],
    },
    lessonFlowPanel: {
      blockName: "Lesson flow panel",
      intendedScreens: ["lesson"],
      correctParentContainer: "#quiz-screen > .learning-screen-shell",
      correctRelativeOrder: 5,
      forbiddenOrLegacyContainers: [".learning-layout-header", ".question-row", "#screen-shell-aux"],
      currentRuntimeSources: [
        "index.html -> .lesson-flow-panel",
        "render-lesson.js -> answer-state messaging",
        "lesson-flow.js -> canonical lesson flow owner",
      ],
      riskNotes: [
        "Keep lesson-flow.js as the owner; do not force QA or sentence-game wrappers into this panel shape yet.",
      ],
    },
    qaContentPanel: {
      blockName: "QA-specific content panel",
      intendedScreens: ["qaGame"],
      correctParentContainer: "#qa-game-screen > .learning-screen-shell > .qa-round-panel",
      correctRelativeOrder: 5,
      forbiddenOrLegacyContainers: [".learning-layout-header", "#qa-runtime-status-bar", "#screen-shell-aux"],
      currentRuntimeSources: [
        "index.html -> #qa-round-panel",
        "qa-flow.js -> setupQaRound()/renderQaBuilder()",
        "qa-wiring.js -> QA controls/runtime hookup",
      ],
      riskNotes: [
        "QA runtime wrappers are the highest-risk placement problem because normalization currently removes legacy progress/reward shells.",
      ],
    },
    sentenceQuizContentList: {
      blockName: "Sentence/quiz content list area",
      intendedScreens: ["lesson", "sentences", "sentenceGame"],
      correctParentContainer: "screen-specific body container after header/status/reward/support blocks",
      correctRelativeOrder: 6,
      forbiddenOrLegacyContainers: [".learning-master-top", ".learning-header-row", "#qa-runtime-status-bar"],
      currentRuntimeSources: [
        "index.html -> #quiz-screen .question-text-wrap",
        "index.html -> #sentences-screen #sentences-list",
        "index.html -> #sentence-game-screen #sentence-game-dropzone + #sentence-game-pool + actions",
      ],
      riskNotes: [
        "Content should remain below reward/control blocks so future placement migrations do not interleave feedback UI with active tasks.",
      ],
    },
    futureMediaStage: {
      blockName: "Future image/art/animation blocks",
      intendedScreens: ["lesson", "sentences", "sentenceGame", "qaGame", "boardEntry", "board"],
      correctParentContainer: "Dedicated media-stage child inside the screen-specific content body, never injected into top action/status wrappers",
      correctRelativeOrder: 7,
      forbiddenOrLegacyContainers: [".top-action-buttons", ".learning-header-row", "#qa-runtime-status-bar", ".reward-row", ".sentences-top-controls"],
      currentRuntimeSources: [
        "assets.js -> future asset ids",
        "asset-registry.js -> migration planning for asset-bearing UI",
        "index.html -> current reward images are the closest existing asset-bearing reference surface",
      ],
      riskNotes: [
        "Future image/animation placement risk is high because no canonical media-stage container exists yet.",
        "Create per-screen media-stage slots before adding images or animation blocks to avoid ad hoc wrapper insertion.",
      ],
    },
  },
  highestRiskHotspots: [
    {
      area: "QA runtime wrappers",
      why: "normalizeQaStatusUi() actively removes progress/reward-like nodes, so shared fragment insertion can silently disappear or break order.",
      migrationAdvice: "Define a QA adapter contract before moving shared status/reward renderers into QA.",
    },
    {
      area: "Reward block placement",
      why: "Lesson/sentences use static reward strips, sentence-game uses a banner + manager, and QA relies on runtime bindings without one stable parent container.",
      migrationAdvice: "Introduce a reward placement registry before changing DOM structure.",
    },
    {
      area: "Status bar placement drift",
      why: "Lesson/sentences/sentence-game keep status inside header-adjacent shells while QA uses a standalone runtime bar.",
      migrationAdvice: "Unify parent-container rules first, then extract rendering.",
    },
    {
      area: "Duplicated per-screen control containers",
      why: "Sentences, sentence-game, and QA all own their own support-control wrappers with similar intent but different structure.",
      migrationAdvice: "Keep per-screen adapters while migrating only placement ownership first.",
    },
    {
      area: "Future image/animation placement",
      why: "Without a media-stage slot, future art and animation blocks are likely to be inserted into reward/header/control wrappers opportunistically.",
      migrationAdvice: "Reserve media-stage ownership in the source map before new assets land.",
    },
  ],
  recommendedFirstMigration: {
    block: "topActionButtons",
    why: [
      "Most repeated shared block across learning screens.",
      "Lowest-risk first extraction because it does not require changing reward or QA cleanup logic.",
      "Creates the anchor order contract for the rest of the placement system.",
    ],
  },
};

