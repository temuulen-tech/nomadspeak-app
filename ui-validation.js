/**
 * ui-validation.js
 * Lightweight developer-facing validation helpers for shared UI/render ownership.
 *
 * Goals:
 * - stay non-breaking and dormant unless explicitly imported/called
 * - connect render-source, shared-ui, asset-registry, and placement-foundation docs
 * - give developers fast report/checklist helpers before UI/content changes
 */

import { APP_ASSET_REGISTRY } from "./asset-registry.js";
import { APP_PLACEMENT_SYSTEM, APP_SOURCE_MAP } from "./source-map.js";

function freezeClone(value) {
  return Object.freeze(structuredClone(value));
}

function collectAssetPathEntries() {
  return Object.values(APP_ASSET_REGISTRY.categories || {})
    .flatMap((entries) => (Array.isArray(entries) ? entries : []))
    .filter((entry) => entry?.path);
}

function buildRepeatedAssetPathGroups() {
  const grouped = new Map();

  collectAssetPathEntries().forEach((entry) => {
    const key = entry.path;
    const items = grouped.get(key) || [];
    items.push({
      key: entry.key,
      status: entry.status,
      duplicateGroup: entry.duplicateGroup || null,
      currentUsage: Array.isArray(entry.currentUsage) ? entry.currentUsage.slice() : [],
    });
    grouped.set(key, items);
  });

  return [...grouped.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([path, entries]) => ({ path, entries }))
    .sort((a, b) => b.entries.length - a.entries.length || a.path.localeCompare(b.path));
}

const LEGACY_WRAPPER_KEYS = {
  QA_RUNTIME_STATUS_BAR: "qa-runtime-status-bar",
  LEARNING_MASTER_TOP: "learning-master-top",
  SCREEN_SHELL_AUX: "screen-shell-aux",
  QA_STATUS_PROGRESS_TRACK: "qa-status-progress-track",
};

const RISKY_LEGACY_WRAPPERS = [
  {
    key: LEGACY_WRAPPER_KEYS.QA_RUNTIME_STATUS_BAR,
    selector: "#qa-runtime-status-bar",
    phaseOutReason: "QA status/reward cleanup is bespoke and can hide shared fragments inserted into the wrong wrapper.",
    replacementDirection: "Use a QA adapter contract backed by APP_PLACEMENT_SYSTEM.placements.statusBar/rewardPanel before sharing renderers.",
  },
  {
    key: LEGACY_WRAPPER_KEYS.LEARNING_MASTER_TOP,
    selector: ".learning-master-top",
    phaseOutReason: "Reward and status ownership drift when new shared blocks are dropped here ad hoc.",
    replacementDirection: "Route shared blocks through learning header + status + reward placement entries instead of umbrella wrappers.",
  },
  {
    key: LEGACY_WRAPPER_KEYS.SCREEN_SHELL_AUX,
    selector: "#screen-shell-aux",
    phaseOutReason: "Shell screens reuse utility subsets that can drift away from learning-screen top actions.",
    replacementDirection: "Adopt a shared top-action fragment subset instead of expanding shell-local variants.",
  },
  {
    key: LEGACY_WRAPPER_KEYS.QA_STATUS_PROGRESS_TRACK,
    selector: ".qa-status-progress-track, .qa-status-track",
    phaseOutReason: "Legacy progress-like wrappers are explicitly removed during QA runtime normalization.",
    replacementDirection: "Keep progress/status ownership in the status-bar adapter rather than bespoke nested tracks.",
  },
];

const FOCUS_BLOCK_VALIDATIONS = {
  topActionButtons: {
    blockKey: "topActionButtons",
    label: "Top action buttons",
    validationArea: "sharedUiUsageValidation",
    whatShouldBeTrue: [
      "The active screen uses the documented top-action owner instead of adding new button rows in local screen markup.",
      "Exit/time/vault/save/sound actions stay aligned with the shared top-actions direction from APP_SOURCE_MAP.",
    ],
    whatUsuallyGoesWrong: [
      "A single screen gets an extra wrapper or button order change and becomes the accidental source of truth.",
      "Shell screens and learning screens drift on labels, aria copy, or control grouping.",
    ],
    whereRiskCurrentlyExists: [
      "index.html learning-screen headers for lesson, sentences, sentence game, and QA.",
      "render-shell.js utility/header rows for stats/profile/end variants.",
    ],
    quickVerify: [
      "Check APP_SOURCE_MAP.sharedUiBlocks.topActionButtons.currentRenderPaths before editing any top-row buttons.",
      "Confirm whether the change belongs in the shared fragment direction or only a screen adapter.",
    ],
  },
  statusBar: {
    blockKey: "statusBar",
    label: "Status bar",
    validationArea: "placementConsistencyValidation",
    whatShouldBeTrue: [
      "Lesson/sentences/sentence-game status stays in .learning-status-shell, while QA status stays in #qa-runtime-status-bar.",
      "Status wrappers own status only; reward, media, and helper controls remain outside unless an adapter documents otherwise.",
    ],
    whatUsuallyGoesWrong: [
      "Progress/reward nodes get dropped into a status container because it is nearby in the DOM.",
      "QA receives the lesson status shell structure without preserving runtime cleanup rules.",
    ],
    whereRiskCurrentlyExists: [
      "index.html duplicated status shells across learning screens.",
      "qa-flow.js normalizeQaStatusUi() cleanup logic and app-dom.js selector ownership.",
    ],
    quickVerify: [
      "Compare APP_PLACEMENT_SYSTEM.placements.statusBar parent/forbidden containers before changing status DOM.",
      "Review qa-flow.js adapter expectations if the change touches #qa-runtime-status-bar.",
    ],
  },
  rewardPanel: {
    blockKey: "rewardPanel",
    label: "Reward panel / time-reward area",
    validationArea: "assetReferenceValidation",
    whatShouldBeTrue: [
      "Reward strips/banners use the shared reward rendering direction and preserve per-mode adapters.",
      "Reward imagery references a registry-backed asset source instead of introducing new raw duplicate paths.",
    ],
    whatUsuallyGoesWrong: [
      "Developers change one reward strip but forget stats/profile or sentence-game banner ownership.",
      "New reward images are copied as raw HTML paths instead of using assets.js-backed ids.",
    ],
    whereRiskCurrentlyExists: [
      "index.html lesson/sentences static reward markup.",
      "sentence-game-reward-manager.js, progress-ui.js, render-rewards.js, and script.js QA reward bindings.",
    ],
    quickVerify: [
      "Run getRepeatedAssetPathReport() and inspect reward-icons duplicate groups before adding reward imagery.",
      "Check APP_SOURCE_MAP.sharedUiBlocks.rewardPanel.currentFiles to see every runtime owner involved.",
    ],
  },
  audioControlPanel: {
    blockKey: "audioControlPanel",
    label: "Audio / control panel",
    validationArea: "sharedUiUsageValidation",
    whatShouldBeTrue: [
      "Support controls stay in screen-specific adapter containers while following the shared utility-panel direction.",
      "Audio/help/tip utilities are not moved into the learning header or status wrappers.",
    ],
    whatUsuallyGoesWrong: [
      "Sentence, sentence-game, and QA controls get treated as interchangeable despite different wrapper contracts.",
      "Sound or help actions are duplicated into the top-action row without documenting ownership.",
    ],
    whereRiskCurrentlyExists: [
      "index.html .sentences-top-controls, #sentence-game-tip-panel, and .qa-learning-tools.",
      "audio-wiring.js, sentence-game-wiring.js, and qa-wiring.js.",
    ],
    quickVerify: [
      "Check APP_SOURCE_MAP.sharedUiBlocks.audioControlPanel before moving or reusing support controls.",
      "Use getValidationChecklist('audioControlPanel') to review allowed vs. risky ownership notes quickly.",
    ],
  },
  titleTimeChipArea: {
    blockKey: "titleTimeChipArea",
    label: "Title / time chip area",
    validationArea: "renderSourceValidation",
    whatShouldBeTrue: [
      "Title/time chip rows stay adjacent to the shared learning header contract for lesson, sentences, and sentence game.",
      "QA and shell screens only adopt this row through adapters, not copy-paste parity.",
    ],
    whatUsuallyGoesWrong: [
      "A time chip change lands only on one learning screen.",
      "QA is forced into the lesson row structure even though it uses a bespoke runtime header/status relationship.",
    ],
    whereRiskCurrentlyExists: [
      "index.html .learning-header-row blocks and render-shell.js time-widget variants.",
      "script.js/app-dom.js time updates that assume specific chip selectors.",
    ],
    quickVerify: [
      "Check APP_SOURCE_MAP.sharedUiBlocks.titleTimeChipArea.currentRenderPaths before editing header chips.",
      "Validate the intended screen owner with getRenderSourceAdvice('titleTimeChipArea').",
    ],
  },
  qaRuntimeWrappers: {
    label: "QA-specific runtime wrappers",
    validationArea: "duplicateRiskHotspotReporting",
    whatShouldBeTrue: [
      "QA cleanup behavior remains explicit and adapter-owned before any shared fragment reuse.",
      "Reward/status fragments inserted for QA respect the standalone runtime status shell and round-panel boundaries.",
    ],
    whatUsuallyGoesWrong: [
      "Shared lesson wrappers get copied into QA and later removed by normalization.",
      "Progress/reward DOM is inserted into #qa-runtime-status-bar, then disappears at runtime.",
    ],
    whereRiskCurrentlyExists: [
      "qa-flow.js normalizeQaStatusUi() and index.html QA header/status markup.",
      "APP_SOURCE_MAP.riskyDuplicateAreas entry for QA status area and runtime wrappers.",
    ],
    quickVerify: [
      "Review getLegacyWrapperPhaseoutReport() for QA wrapper warnings before changing QA status/reward markup.",
      "Use getValidationChecklist('qaRuntimeWrappers') before reusing any lesson/sentences fragment in QA.",
    ],
  },
  repeatedAssetPaths: {
    label: "Repeated asset paths",
    validationArea: "assetReferenceValidation",
    whatShouldBeTrue: [
      "Repeated raw asset paths are tracked and reviewed before new content/UI introduces more duplication.",
      "Developers can ask the validation layer which registry entry should own a path before adding it.",
    ],
    whatUsuallyGoesWrong: [
      "A path is copied from HTML/CSS because it already works, bypassing assets.js and duplication notes.",
      "Placeholder paths spread across multiple screens without a cleanup target.",
    ],
    whereRiskCurrentlyExists: [
      "Reward icons, world cover placeholders, and board background fallbacks in asset-registry.js duplicate groups.",
      "index.html and board-screen.css hardcoded path clusters.",
    ],
    quickVerify: [
      "Run getRepeatedAssetPathReport() and getAssetSourceRecommendation(pathOrKey) before adding an image/audio path.",
      "Check APP_ASSET_REGISTRY.categories.hardcodedReferences for known duplication hotspots.",
    ],
  },
  riskyLegacyWrappers: {
    label: "Risky legacy containers / wrappers",
    validationArea: "placementConsistencyValidation",
    whatShouldBeTrue: [
      "Legacy wrappers are treated as migration hotspots, not expansion points for new shared UI.",
      "Any future cleanup references the documented phase-out direction for each wrapper.",
    ],
    whatUsuallyGoesWrong: [
      "A convenient umbrella wrapper keeps collecting new UI, which deepens future migration cost.",
      "Developers forget which wrappers are temporary and which are intended long-term owners.",
    ],
    whereRiskCurrentlyExists: [
      ".learning-master-top, #screen-shell-aux, #qa-runtime-status-bar, and legacy QA progress-track wrappers.",
      "Placement drift around reward/status ownership when these wrappers gain more child UI.",
    ],
    quickVerify: [
      "Run getLegacyWrapperPhaseoutReport() and avoid adding new shared children there unless explicitly documented.",
      "Use createValidationSnapshot() to review phase-out guidance with duplicate hotspot context.",
    ],
  },
};

function getPlacementEntry(blockKey) {
  return APP_PLACEMENT_SYSTEM.placements?.[blockKey] || null;
}

function getSharedUiBlock(blockKey) {
  return APP_SOURCE_MAP.sharedUiBlocks?.[blockKey] || null;
}

function createRenderTargetMap() {
  return Object.fromEntries(
    Object.entries(APP_SOURCE_MAP.screens || {}).map(([key, screen]) => ([key, {
      screenId: screen.id,
      routeKey: screen.routeKey,
      primaryFiles: screen.primaryFiles.slice(),
      renderFunctions: screen.renderFunctions.slice(),
      childAreas: screen.childAreas.slice(),
    }]))
  );
}

function getScreenKeyById(screenId = "") {
  const normalized = String(screenId || "").trim();
  return Object.entries(APP_SOURCE_MAP.screens || {}).find(([, screen]) => screen.id === normalized)?.[0] || null;
}

export const UI_VALIDATION_FOUNDATION = freezeClone({
  version: "phase-56-validation-foundation",
  connectsTo: {
    screenRenderMap: "SCREEN_RENDER_MAP.md",
    sourceMapModule: "source-map.js",
    sharedUiMap: "docs/shared-ui-map.md",
    assetRegistry: "asset-registry.js",
    placementSystem: "docs/placement-system-map.md",
    validationPlaybook: "docs/ui-validation-dev-checks.md",
  },
  areas: {
    renderSourceValidation: {
      whatShouldBeTrue: [
        "Each screen/block change traces back to one primary render path before editing markup or runtime wiring.",
        "screen-navigation.js remains the active-screen switchboard and app-dom.js remains the selector registry.",
      ],
      whatUsuallyGoesWrong: [
        "Developers patch static markup and runtime renderers independently, causing drift.",
        "A shared block is changed on one screen without updating its shell or alternate render path.",
      ],
      currentRisk: [
        "Top action buttons and reward areas render from both index.html and render-shell.js/script.js paths.",
        "QA status behavior is partly static markup and partly runtime normalization in qa-flow.js.",
      ],
      quickVerify: [
        "Confirm the target screen in APP_SOURCE_MAP.screens before editing.",
        "Check APP_SOURCE_MAP.sharedUiBlocks for all current render paths of the block you are changing.",
      ],
    },
    sharedUiUsageValidation: {
      whatShouldBeTrue: [
        "Shared blocks have an explicit owner, and non-owner screens act as adapters rather than inventing new wrapper structures.",
        "Top actions, status, reward, and title/time chip blocks align to one documented source-of-truth direction.",
      ],
      whatUsuallyGoesWrong: [
        "One screen adds a small variant and becomes the accidental new source of truth.",
        "QA or shell screens receive a lesson-style fragment without adapter rules.",
      ],
      currentRisk: [
        "topActionButtons, statusBar, rewardPanel, audioControlPanel, and titleTimeChipArea in APP_SOURCE_MAP.sharedUiBlocks.",
      ],
      quickVerify: [
        "Run getSharedUiValidationSummary() and inspect owner/risk notes for the block being touched.",
        "Confirm whether the change belongs in the shared block recommendation or only in a screen adapter.",
      ],
    },
    assetReferenceValidation: {
      whatShouldBeTrue: [
        "Runtime-facing asset ids live in assets.js first, while duplication tracking stays in asset-registry.js.",
        "Raw paths are not introduced for shared reward/world assets when a stable id already exists.",
      ],
      whatUsuallyGoesWrong: [
        "New UI work copies an existing raw asset path from HTML/CSS instead of using an id-backed registry entry.",
        "Placeholder/world assets are reused across screens without clear duplicate-risk notes.",
      ],
      currentRisk: [
        "Reward icon paths repeated across index.html, progress-ui.js, service-worker.js, and assets.js.",
        "Board/world cover/background fallbacks still include raw path references outside the registry.",
      ],
      quickVerify: [
        "Run getRepeatedAssetPathReport() before adding new asset-bearing UI.",
        "Check APP_ASSET_REGISTRY.categories.hardcodedReferences and duplicateGroup metadata first.",
      ],
    },
    placementConsistencyValidation: {
      whatShouldBeTrue: [
        "Shared learning blocks appear in the documented order: top actions, title/time, status, reward, controls, content.",
        "QA reward/status insertions respect the QA adapter rules instead of reusing lesson placement blindly.",
      ],
      whatUsuallyGoesWrong: [
        "A shared block is added to a convenient wrapper instead of the correct parent container.",
        "Reward or control UI gets inserted into status/header wrappers and later disappears or drifts.",
      ],
      currentRisk: [
        "APP_PLACEMENT_SYSTEM.highestRiskHotspots for QA wrappers, reward placement, and status drift.",
      ],
      quickVerify: [
        "Check APP_PLACEMENT_SYSTEM.placements[blockKey] before moving DOM or adding a wrapper.",
        "Use getPlacementValidationSummary() to compare intended parent/order vs. forbidden containers.",
      ],
    },
    duplicateRiskHotspotReporting: {
      whatShouldBeTrue: [
        "High-risk duplicate areas are reviewed before broad visual/content work starts.",
        "Developers know which wrappers and paths are temporary hotspots, not safe expansion points.",
      ],
      whatUsuallyGoesWrong: [
        "New work lands inside a hotspot because it looks reusable, increasing future migration cost.",
        "Legacy wrappers survive because their phase-out target was never captured centrally.",
      ],
      currentRisk: [
        "APP_SOURCE_MAP.riskyDuplicateAreas and the legacy wrapper list in this module.",
      ],
      quickVerify: [
        "Run createValidationSnapshot() and review duplicateRiskHotspots + riskyLegacyWrappers.",
        "Treat hotspot hits as review blockers before adding new UI/content structure.",
      ],
    },
  },
  focusBlocks: {
    topActionButtons: APP_SOURCE_MAP.sharedUiBlocks.topActionButtons,
    statusBar: APP_SOURCE_MAP.sharedUiBlocks.statusBar,
    rewardPanel: APP_SOURCE_MAP.sharedUiBlocks.rewardPanel,
    audioControlPanel: APP_SOURCE_MAP.sharedUiBlocks.audioControlPanel,
    titleTimeChipArea: APP_SOURCE_MAP.sharedUiBlocks.titleTimeChipArea,
  },
  validationTargets: FOCUS_BLOCK_VALIDATIONS,
  qaRuntimeWrapperRisk: {
    owner: "qa-flow.js normalizeQaStatusUi()",
    validationRule: "Any shared status/reward extraction touching QA must preserve runtime cleanup through an explicit adapter instead of new nested wrappers.",
  },
  riskyLegacyWrappers: RISKY_LEGACY_WRAPPERS,
});

export function getRenderSourceValidationSummary() {
  return APP_SOURCE_MAP.screens;
}

export function getSharedUiValidationSummary() {
  return APP_SOURCE_MAP.sharedUiBlocks;
}

export function getPlacementValidationSummary() {
  return APP_PLACEMENT_SYSTEM.placements;
}

export function getRepeatedAssetPathReport() {
  return buildRepeatedAssetPathGroups();
}

export function getAssetSourceRecommendation(assetKeyOrPath = "") {
  const normalized = String(assetKeyOrPath || "").trim();
  const allEntries = collectAssetPathEntries();
  const exactEntry = allEntries.find((entry) => entry.key === normalized || entry.path === normalized);
  if (exactEntry) return exactEntry;

  return allEntries.find((entry) => entry.path.includes(normalized) || entry.key.includes(normalized)) || null;
}

export function getLegacyWrapperPhaseoutReport() {
  return RISKY_LEGACY_WRAPPERS.slice();
}

export function getValidationChecklist(targetKey = "") {
  const normalized = String(targetKey || "").trim();
  return FOCUS_BLOCK_VALIDATIONS[normalized] || null;
}

export function getRenderSourceAdvice(target = "") {
  const normalized = String(target || "").trim();
  const block = getSharedUiBlock(normalized);
  if (block) {
    return {
      type: "shared-ui-block",
      key: normalized,
      label: block.label,
      currentRenderPaths: block.currentRenderPaths.slice(),
      currentFiles: block.currentFiles.slice(),
      recommendedSourceOfTruth: block.recommendedSourceOfTruth,
    };
  }

  const screenKey = getScreenKeyById(normalized) || normalized;
  const screen = APP_SOURCE_MAP.screens?.[screenKey] || null;
  if (!screen) return null;

  return {
    type: "screen",
    key: screenKey,
    screenId: screen.id,
    routeKey: screen.routeKey,
    primaryFiles: screen.primaryFiles.slice(),
    renderFunctions: screen.renderFunctions.slice(),
    childAreas: screen.childAreas.slice(),
  };
}

export function getSharedUiOwnerHint(blockKey = "") {
  const sharedBlock = getSharedUiBlock(blockKey);
  if (!sharedBlock) return null;

  const placement = getPlacementEntry(blockKey);
  return {
    blockKey,
    label: sharedBlock.label,
    recommendedSourceOfTruth: sharedBlock.recommendedSourceOfTruth,
    duplicationStatus: sharedBlock.duplicationStatus,
    currentFiles: sharedBlock.currentFiles.slice(),
    currentRenderPaths: sharedBlock.currentRenderPaths.slice(),
    intendedPlacement: placement
      ? {
          parent: placement.correctParentContainer,
          order: placement.correctRelativeOrder,
          forbiddenContainers: placement.forbiddenOrLegacyContainers.slice(),
        }
      : null,
  };
}

export function getActiveScreenRenderPath(screenId, options = {}) {
  const activeId = screenId
    || options.screenId
    || options.document?.querySelector?.('.screen:not(.hidden)[id]')?.id
    || options.document?.querySelector?.('[data-active-screen="true"][id]')?.id
    || null;

  if (!activeId) return null;
  return getRenderSourceAdvice(activeId);
}

export function createValidationSnapshot() {
  return {
    version: UI_VALIDATION_FOUNDATION.version,
    activeRenderTargets: createRenderTargetMap(),
    sharedUiOwners: getSharedUiValidationSummary(),
    placementOwners: getPlacementValidationSummary(),
    repeatedAssetPaths: getRepeatedAssetPathReport(),
    duplicateRiskHotspots: APP_SOURCE_MAP.riskyDuplicateAreas.slice(),
    riskyLegacyWrappers: getLegacyWrapperPhaseoutReport(),
    validationTargets: freezeClone(FOCUS_BLOCK_VALIDATIONS),
  };
}

export function printValidationSnapshot(logger = console) {
  const snapshot = createValidationSnapshot();
  logger.group?.("NomadSpeak validation snapshot");
  logger.info?.("Active render targets", snapshot.activeRenderTargets);
  logger.info?.("Shared UI owners", snapshot.sharedUiOwners);
  logger.info?.("Placement owners", snapshot.placementOwners);
  logger.info?.("Repeated asset paths", snapshot.repeatedAssetPaths);
  logger.info?.("Duplicate risk hotspots", snapshot.duplicateRiskHotspots);
  logger.info?.("Risky legacy wrappers", snapshot.riskyLegacyWrappers);
  logger.info?.("Validation checklists", snapshot.validationTargets);
  logger.groupEnd?.();
  return snapshot;
}

export function attachValidationDebugHelpers(target = window) {
  if (!target) return null;

  const api = {
    foundation: UI_VALIDATION_FOUNDATION,
    getRenderSourceValidationSummary,
    getSharedUiValidationSummary,
    getPlacementValidationSummary,
    getRepeatedAssetPathReport,
    getAssetSourceRecommendation,
    getLegacyWrapperPhaseoutReport,
    getValidationChecklist,
    getRenderSourceAdvice,
    getSharedUiOwnerHint,
    getActiveScreenRenderPath,
    createValidationSnapshot,
    printValidationSnapshot,
  };

  target.NomadSpeakValidation = api;
  return api;
}
