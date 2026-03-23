# UI Validation / Dev Checks Playbook

This is a lightweight, developer-facing validation layer for future UI/content work. It is intentionally **non-breaking**, **mapping-first**, and **safe to ignore at runtime unless debug helpers are explicitly enabled**.

## Purpose

Use this playbook before changing shared learning UI, asset-bearing blocks, or screen wrappers.

It connects the existing foundation files:

- `SCREEN_RENDER_MAP.md`
- `docs/shared-ui-map.md`
- `docs/placement-system-map.md`
- `source-map.js`
- `asset-registry.js`
- `ui-validation.js`

## Fastest developer workflow

1. Identify the screen or shared block in `APP_SOURCE_MAP`.
2. Check ownership with `getSharedUiOwnerHint(blockKey)` or `getRenderSourceAdvice(target)`.
3. Confirm placement with `APP_PLACEMENT_SYSTEM.placements[blockKey]`.
4. Review duplicate-risk and wrapper warnings with `createValidationSnapshot()`.
5. If asset paths are involved, review `getRepeatedAssetPathReport()` and `getAssetSourceRecommendation()`.

## Validation areas

### 1. Render source validation

**What should be true**
- Every change starts from one known render path.
- `screen-navigation.js` remains the active-screen switchboard.
- `app-dom.js` remains the selector registry.

**What usually goes wrong**
- Static HTML is updated without matching runtime render helpers.
- A shell screen and a learning screen drift for the same shared block.

**Where risk currently exists**
- Top action buttons across `index.html` and `render-shell.js`.
- Reward/time-reward ownership split between static markup and runtime helpers.
- QA status behavior split between `index.html` and `qa-flow.js`.

**Quick verification**
- Run `window.NomadSpeakValidation?.getRenderSourceAdvice('topActionButtons')` in debug mode.
- Or inspect `APP_SOURCE_MAP.screens` / `APP_SOURCE_MAP.sharedUiBlocks` directly.

### 2. Shared UI usage validation

**What should be true**
- Shared UI blocks have one recommended owner direction.
- Other screens should act as adapters, not fresh sources of truth.

**What usually goes wrong**
- One screen invents a “small temporary variant” that becomes permanent.
- QA or shell screens get a lesson-style block without adapter rules.

**Where risk currently exists**
- Top action buttons.
- Audio/control panels.
- Title/time chip rows.

**Quick verification**
- Run `getSharedUiOwnerHint('topActionButtons')`.
- Run `getValidationChecklist('audioControlPanel')`.

### 3. Asset reference validation

**What should be true**
- Runtime asset ids originate in `assets.js`.
- Duplicate/path cleanup stays visible in `asset-registry.js`.
- Repeated paths are reviewed before adding more raw references.

**What usually goes wrong**
- HTML/CSS copies a working path instead of using a registry-backed asset id.
- Placeholder world/reward paths spread without a cleanup target.

**Where risk currently exists**
- Repeated reward icon paths.
- Reused world cover placeholder paths.
- Board background CSS fallback paths.

**Quick verification**
- Run `getRepeatedAssetPathReport()`.
- Run `getAssetSourceRecommendation('reward-star')` or by path fragment.

### 4. Placement consistency validation

**What should be true**
- Shared learning blocks follow the documented order:
  1. top action buttons
  2. title/time chip area
  3. status bar
  4. reward panel
  5. audio/control panel
  6. content body
- QA remains adapter-driven rather than assuming lesson placement rules.

**What usually goes wrong**
- Reward or helper controls get inserted into status/header wrappers.
- New UI lands inside a convenient umbrella container.

**Where risk currently exists**
- `#qa-runtime-status-bar`
- `.learning-master-top`
- reward/time-reward wrappers

**Quick verification**
- Inspect `APP_PLACEMENT_SYSTEM.placements[blockKey]`.
- Run `getSharedUiOwnerHint(blockKey)` for parent/order/forbidden-container context.

### 5. Duplicate-risk hotspot reporting

**What should be true**
- Hotspots are reviewed before future UI/content work starts.
- Legacy wrappers are treated as migration targets, not growth surfaces.

**What usually goes wrong**
- New shared UI is added to wrappers already marked risky.
- Teams forget where adapter logic currently lives.

**Where risk currently exists**
- QA runtime wrappers.
- duplicated top action rows.
- reward/time-reward split ownership.
- legacy shell/learning umbrella wrappers.

**Quick verification**
- Run `createValidationSnapshot()`.
- Review `duplicateRiskHotspots` and `riskyLegacyWrappers` first.

## Focus block quick checks

### Top action buttons
- Validate owner: `getSharedUiOwnerHint('topActionButtons')`
- Validate render paths: `getRenderSourceAdvice('topActionButtons')`
- Do not add new copied rows in screen-local markup unless it is a documented adapter.

### Status bar
- Validate owner: `getSharedUiOwnerHint('statusBar')`
- Confirm QA special case before edits: `getValidationChecklist('qaRuntimeWrappers')`
- Do not put reward or media blocks into status wrappers.

### Reward panel / time-reward area
- Validate owner: `getSharedUiOwnerHint('rewardPanel')`
- Validate repeated assets: `getRepeatedAssetPathReport()`
- Check reward imagery source: `getAssetSourceRecommendation('reward-star')`

### Audio / control panel
- Validate owner: `getSharedUiOwnerHint('audioControlPanel')`
- Review block-specific rules: `getValidationChecklist('audioControlPanel')`

### Title / time chip area
- Validate owner: `getSharedUiOwnerHint('titleTimeChipArea')`
- Validate render path: `getRenderSourceAdvice('titleTimeChipArea')`

### QA-specific runtime wrappers
- Review checklist: `getValidationChecklist('qaRuntimeWrappers')`
- Review phase-out report: `getLegacyWrapperPhaseoutReport()`

### Repeated asset paths
- Report: `getValidationChecklist('repeatedAssetPaths')`
- Data: `getRepeatedAssetPathReport()`

### Risky legacy containers / wrappers
- Report: `getValidationChecklist('riskyLegacyWrappers')`
- Data: `getLegacyWrapperPhaseoutReport()`

## Debug helpers

These helpers stay dormant unless debug mode is enabled through the existing dev tools (`?debug=1` or `localStorage.nomadspeak:debug-mode='on'`).

When debug mode is on, `window.NomadSpeakValidation` exposes:

- `getRenderSourceAdvice(target)`
- `getSharedUiOwnerHint(blockKey)`
- `getActiveScreenRenderPath(screenId?)`
- `getValidationChecklist(targetKey)`
- `getRepeatedAssetPathReport()`
- `getAssetSourceRecommendation(assetKeyOrPath)`
- `getLegacyWrapperPhaseoutReport()`
- `createValidationSnapshot()`
- `printValidationSnapshot()`

## First 3 checks developers should run before future UI/content changes

1. **Validate the intended owner and render path first.**
   - Start with `getRenderSourceAdvice(...)` and `getSharedUiOwnerHint(...)`.
2. **Validate QA and placement constraints second.**
   - Check `statusBar`, `rewardPanel`, and QA wrapper rules before moving DOM.
3. **Validate asset duplication before adding art-bearing UI.**
   - Run `getRepeatedAssetPathReport()` and use `getAssetSourceRecommendation(...)`.

## Recommended first cleanup after this layer

**Extract/unify the top action buttons first.**

Why:
- It is the highest duplicate-risk block.
- It spans the most screens.
- It has the clearest ownership contract.
- It can be improved with adapters before a broader runtime migration.
