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

const RISKY_LEGACY_WRAPPERS = [
  {
    key: "qa-runtime-status-bar",
    selector: "#qa-runtime-status-bar",
    phaseOutReason: "QA status/reward cleanup is bespoke and can hide shared fragments inserted into the wrong wrapper.",
    replacementDirection: "Use a QA adapter contract backed by APP_PLACEMENT_SYSTEM.placements.statusBar/rewardPanel before sharing renderers.",
  },
  {
    key: "learning-master-top",
    selector: ".learning-master-top",
    phaseOutReason: "Reward and status ownership drift when new shared blocks are dropped here ad hoc.",
    replacementDirection: "Route shared blocks through learning header + status + reward placement entries instead of umbrella wrappers.",
  },
  {
    key: "screen-shell-aux",
    selector: "#screen-shell-aux",
    phaseOutReason: "Shell screens reuse utility subsets that can drift away from learning-screen top actions.",
    replacementDirection: "Adopt a shared top-action fragment subset instead of expanding shell-local variants.",
  },
  {
    key: "qa-status-progress-track",
    selector: ".qa-status-progress-track, .qa-status-track",
    phaseOutReason: "Legacy progress-like wrappers are explicitly removed during QA runtime normalization.",
    replacementDirection: "Keep progress/status ownership in the status-bar adapter rather than bespoke nested tracks.",
  },
];

export const UI_VALIDATION_FOUNDATION = freezeClone({
  version: "phase-56-validation-foundation",
  connectsTo: {
    screenRenderMap: "SCREEN_RENDER_MAP.md",
    sourceMapModule: "source-map.js",
    sharedUiMap: "docs/shared-ui-map.md",
    assetRegistry: "asset-registry.js",
    placementSystem: "docs/placement-system-map.md",
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

export function createValidationSnapshot() {
  return {
    version: UI_VALIDATION_FOUNDATION.version,
    activeRenderTargets: getRenderSourceValidationSummary(),
    sharedUiOwners: getSharedUiValidationSummary(),
    placementOwners: getPlacementValidationSummary(),
    repeatedAssetPaths: getRepeatedAssetPathReport(),
    duplicateRiskHotspots: APP_SOURCE_MAP.riskyDuplicateAreas.slice(),
    riskyLegacyWrappers: getLegacyWrapperPhaseoutReport(),
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
    createValidationSnapshot,
    printValidationSnapshot,
  };

  target.NomadSpeakValidation = api;
  return api;
}
