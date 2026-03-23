# UI Validation & Dev Checks

This document adds a lightweight, developer-facing validation layer for future UI/content work. It is intentionally **non-breaking** and **mapping-first**: use it to detect drift before changing shared structures.

## Connected foundation files

- `SCREEN_RENDER_MAP.md` — render-path map for major screens.
- `source-map.js` — machine-readable shared UI ownership, duplicate hotspots, and placement rules.
- `docs/shared-ui-map.md` — duplication and future source-of-truth guidance.
- `asset-registry.js` — asset usage, duplicate groups, and hardcoded path tracking.
- `docs/placement-system-map.md` — parent-container and ordering rules.
- `ui-validation.js` — dormant helper/report API for fast developer checks.

## Fastest way to use it

1. Read the target block in `source-map.js`.
2. If debug mode is on (`?debug=1`), use `window.NomadSpeakValidation.printValidationSnapshot()` in DevTools.
3. Validate the correct render path, owner container, and asset source **before** editing HTML or runtime wiring.

---

## 1) Render source validation

### What should be true

- Every screen-level change starts from one known render path.
- `screen-navigation.js` remains the switchboard for active-screen visibility.
- `app-dom.js` remains the selector registry for shared screen elements.
- Shared blocks are traced through **all** of their current render paths, not just the first one a developer sees.

### What usually goes wrong

- A developer edits `index.html` but misses matching shell/runtime output in `render-shell.js`, `script.js`, or screen-specific renderers.
- QA behavior is changed in static markup, but `qa-flow.js` still normalizes/removes conflicting wrappers.
- Reward or status updates are made on one screen without checking the parallel learning screens.

### Where the risk currently exists

- **Top action buttons** live in learning screens in `index.html` and in shell-mounted variants in `render-shell.js`.
- **Status bar** ownership is split between shared learning markup and QA runtime normalization.
- **Reward panel / time-reward area** spans static HTML, shared reward renderers, sentence-game runtime management, and stats/profile rendering.

### Quick verification

- Confirm the target screen in `APP_SOURCE_MAP.screens`.
- Confirm the block in `APP_SOURCE_MAP.sharedUiBlocks`.
- Ask: “Am I changing the actual owner, or just one adapter?”

### High-priority render targets to trace

- Top action buttons
- Status bar
- Reward panel / time-reward area
- Audio/control panel
- Title/time chip area
- QA-specific runtime wrappers

---

## 2) Shared UI usage validation

### What should be true

- Shared blocks have one documented future owner direction, even if runtime extraction has not happened yet.
- Non-owner screens should adapt to that block rather than inventing a new variant.
- Learning screens and shell screens can share concepts without forcing full structural parity.

### What usually goes wrong

- A “temporary” variant becomes a permanent duplicate hotspot.
- Shell screens grow learning-screen fragments that do not belong there.
- QA gets lesson/sentences structure inserted directly without adapter rules.

### Where the risk currently exists

- **Top action buttons** are the highest-risk shared block.
- **Status bar** is duplicated, with QA using a bespoke wrapper.
- **Reward panel / time-reward area** is conceptually shared but structurally split.
- **Audio/control panel** is repeated with screen-specific wrappers.
- **Title/time chip area** exists on lesson/sentences/sentence-game but not QA in the same shape.

### Quick verification

- Check `APP_SOURCE_MAP.sharedUiBlocks[blockKey]`.
- If the block already has `recommendedSourceOfTruth`, prefer that direction over a local one-off change.
- For shell-only changes, verify the change is a subset fragment, not a new shared contract.

---

## 3) Asset reference validation

### What should be true

- Runtime-facing asset ids start in `assets.js`.
- Duplication and raw-path tracking stay documented in `asset-registry.js`.
- Repeated reward/world asset paths are reused intentionally, not copied ad hoc.

### What usually goes wrong

- Developers copy an existing raw image path from HTML/CSS instead of using an id-backed asset.
- Placeholder art spreads to more files without a registry note.
- New UI work references a path directly from a local component or screen module.

### Where the risk currently exists

- **Repeated reward asset paths** across `index.html`, `progress-ui.js`, `service-worker.js`, and `assets.js`.
- **Board cover/background fallbacks** that still use raw paths outside the central asset registry.
- Future media-bearing work that may bypass the registry entirely.

### Quick verification

- Use `getRepeatedAssetPathReport()` from `ui-validation.js`.
- Check `APP_ASSET_REGISTRY.categories.hardcodedReferences`.
- If an asset already has an id in `assets.js`, do not add a new raw path reference.

### Repeated asset paths to watch first

- `assets/rewards/icons/reward-flag.png`
- `assets/rewards/icons/reward-star.png`
- `assets/rewards/icons/reward-coin.png`
- `assets/rewards/icons/reward-trophy.png`
- `assets/rewards/icons/reward-diamond.png`
- `assets/visuals/worlds/sailors/intro/world-cover-sailors-columbus-new-world-placeholder.svg`
- `assets/visuals/worlds/sailors/backgrounds/world-bg-sailors-ship-deck-placeholder.svg`

---

## 4) Placement consistency validation

### What should be true

- Shared learning blocks follow the documented order:
  1. top action buttons
  2. title/time chip area
  3. status bar
  4. reward panel
  5. audio/control panel or screen-specific helper panel
  6. content body
- QA-specific placement rules remain adapter-driven.
- Shared blocks are inserted into the correct parent wrapper, not just a convenient wrapper.

### What usually goes wrong

- Reward blocks get inserted into status wrappers.
- Control rows are added inside header containers.
- Shared content is appended into legacy wrappers that are already marked for phase-out.

### Where the risk currently exists

- **Status bar** placement drift between lesson/sentences/sentence-game vs. QA.
- **Reward panel / time-reward area** placement inconsistency across strips, banners, and runtime bindings.
- **Audio/control panel** wrappers vary per screen.
- **QA-specific runtime wrappers** remove incompatible progress/reward-like descendants.

### Quick verification

- Check `APP_PLACEMENT_SYSTEM.placements[blockKey]`.
- Check `forbiddenOrLegacyContainers` before adding or moving DOM.
- If touching QA, verify the change stays outside `#qa-runtime-status-bar` unless explicitly adapter-approved.

---

## 5) Duplicate-risk hotspot reporting

### What should be true

- Developers review duplicate hotspots before broad UI/content changes.
- Legacy wrappers are treated as warning zones, not expansion targets.
- Reviewers can identify which changes should stay adapter-local vs. become source-of-truth changes.

### What usually goes wrong

- The app accumulates more duplicate wrappers because existing hotspots are convenient insertion points.
- Refactors start from the wrong hotspot and expand migration scope unexpectedly.
- Shared ownership drifts because no one checks the current risk map first.

### Where the risk currently exists

- **Top action buttons**
- **QA-specific runtime wrappers**
- **Reward panel / time-reward area**
- **Audio/control panel structure drift**
- **Repeated asset paths**
- **Risky legacy containers/wrappers**

### Quick verification

- Review `APP_SOURCE_MAP.riskyDuplicateAreas`.
- Review `getLegacyWrapperPhaseoutReport()`.
- Use `createValidationSnapshot()` to get one combined report.

---

## Targeted validation checklist by block

### Top action buttons

- Should be the first shared learning block.
- Most likely to drift in label/order/ownership.
- Validate all learning screens plus shell utility-row variants.

### Status bar

- Should stay directly below header ownership.
- QA must keep its runtime adapter behavior.
- Validate that no reward/control DOM is silently mixed into status ownership.

### Reward panel / time-reward area

- Should stay outside QA runtime status cleanup wrappers.
- Should not gain new raw reward asset paths when ids already exist.
- Validate both learning-screen strips and stats/profile reward surfaces.

### Audio/control panel

- Should stay screen-adapter owned for now.
- Should not be merged into header/status wrappers.
- Validate sentencess/QA/sentence-game wrapper ownership before adding controls.

### Title/time chip area

- Shared across lesson/sentences/sentence-game, but not QA in the same shape.
- Validate whether a change is for learning headers only or also for shell time widgets.

### QA-specific runtime wrappers

- Must preserve `qa-flow.js` cleanup expectations.
- Any shared extraction touching QA must be adapter-aware first.

### Repeated asset paths

- Treat as registry cleanup candidates before adding new visual surfaces.
- Prefer registry ids over raw-path duplication.

### Risky legacy containers/wrappers

- `#qa-runtime-status-bar`
- `.learning-master-top`
- `#screen-shell-aux`
- `.qa-status-progress-track` / `.qa-status-track`

Do not expand these wrappers without first checking the placement map and phase-out report.

---

## Dormant debug helpers

These helpers are intentionally lightweight and dormant unless explicitly enabled:

- `window.NomadSpeakValidation.createValidationSnapshot()`
- `window.NomadSpeakValidation.printValidationSnapshot()`
- `window.NomadSpeakValidation.getRepeatedAssetPathReport()`
- `window.NomadSpeakValidation.getLegacyWrapperPhaseoutReport()`
- `window.NomadSpeakValidation.getAssetSourceRecommendation(assetKeyOrPath)`

These helpers are attached only when debug mode is enabled through the existing debug tooling.

---

## Top 3 validations to do before future UI/content work

1. **Validate top action button ownership first.**
   - It is the most duplicated block and the safest first unification anchor.

2. **Validate QA status/reward wrapper rules second.**
   - QA has the highest silent-break risk because runtime normalization removes incompatible nodes.

3. **Validate repeated reward/world asset references third.**
   - Asset drift will compound quickly once future visuals or reward surfaces expand.

---

## Recommended first cleanup after this validation layer

**Extract a shared top-action-buttons fragment/config first**, while keeping shell screens on a subset adapter.

Why this should happen first:

- It has the clearest shared contract.
- It does not require a reward-system migration first.
- It creates a stable header anchor for later status bar and title/time chip cleanup.
- It reduces the highest duplicate-risk hotspot before future content/UI work grows the surface area.
