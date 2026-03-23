# Placement System Map

This document defines the **next foundation layer** for shared UI and future asset-bearing blocks across lesson/game screens. It is intentionally **documentation-first and non-breaking**: it creates a source-of-truth placement map without changing the current Home screen layout or redesigning the app.

## Guardrails

- Do **not** change the current Home screen layout or appearance in this phase.
- Do **not** add new lesson content, images, or animations in this phase.
- Do **not** migrate large runtime structures yet; use this map to stop ad hoc wrapper insertion first.
- Prefer `source-map.js` placement ownership entries and lightweight TODO comments over structural refactors.

## Canonical placement ownership

The placement system adds a single question for repeated UI blocks: **which container owns this block, and in what order does it appear?**

### Core container model

1. **`.learning-screen-shell`**
   - Top-level placement owner for lesson, sentences, sentence game, and QA screens.
   - Shared blocks should be ordered here before they branch into mode-specific content wrappers.

2. **`.learning-layout-header`**
   - Owns the header-level cluster only.
   - Correct for **top action buttons** and **title/time chip rows**.
   - Not correct for reward strips, sentence lists, or QA builder content.

3. **`.learning-status-shell` / `#qa-runtime-status-bar`**
   - Owns status-only UI directly under the header.
   - Reward bars, media stages, and content lists should not be inserted here.

4. **Screen-specific content body wrappers**
   - Examples: `.lesson-flow-panel`, `.qa-round-panel`, `#sentences-list`, `#sentence-game-dropzone`.
   - Own screen-specific content after shared header/status/reward rules are applied.

## Shared block placement entries

| Block | Intended screen(s) | Correct parent container | Correct relative order | Forbidden / legacy containers | Current runtime source(s) | Risk notes |
| --- | --- | --- | --- | --- | --- | --- |
| Top action buttons | Lesson, Sentences, Sentence Game, QA | `.learning-layout-header > .top-action-buttons` | 1 | `.question-text-wrap`, `.qa-round-panel`, `.sentences-list`, `#screen-shell-aux` | `index.html` learning-screen header blocks; shell utility variants in `render-shell.js` | Highest duplication area. Best first migration target because it has the clearest shared contract. |
| Title/time chip area | Lesson, Sentences, Sentence Game | `.learning-layout-header > .learning-header-row` | 2 | `#qa-runtime-status-bar`, `.qa-round-panel`, `.sentence-game-tip-panel` | `index.html` learning header rows; shell time widgets in `render-shell.js` | QA does not currently share this exact pattern, so it should join later via adapter rules. |
| Status bar | Lesson, Sentences, Sentence Game, QA | Lesson/sentences/sentence-game: `.learning-status-shell`; QA: `#qa-runtime-status-bar` directly below `.qa-game-header` | 3 | `.lesson-flow-panel`, `.qa-learning-tools`, `.sentences-top-controls` | `index.html`; `qa-flow.js` cleanup/normalization; selectors in `app-dom.js` | Status bar placement drift already exists because QA owns a bespoke runtime shell. |
| Reward panel / reward strip | Lesson, Sentences, Sentence Game, QA, Stats, Profile | Learning screens: direct child of `.learning-screen-shell` after header/status blocks; QA only through adapter-owned runtime container outside `#qa-runtime-status-bar` | 4 | `#qa-runtime-status-bar`, `.learning-master-top`, `.qa-learning-tools`, `.question-row` | `index.html`; `render-rewards.js`; `sentence-game-reward-manager.js`; QA reward bindings in `script.js` | Reward placement is inconsistent today across strips, rows, banners, and runtime bindings. |
| Audio/control panel | Sentences, Sentence Game, QA | Sentences: `.sentences-top-controls`; Sentence Game: `#sentence-game-tip-panel`; QA: `.qa-round-content > .qa-learning-tools` | 5 | `.learning-layout-header`, `#qa-runtime-status-bar`, `.learning-header-row` | `index.html`; `audio-wiring.js`; `sentence-game-wiring.js`; `qa-wiring.js` | Duplicated per-screen control containers exist; keep adapters while the placement contract stabilizes. |
| Lesson flow panel | Lesson | `#quiz-screen > .learning-screen-shell` | 5 | `.learning-layout-header`, `.question-row`, `#screen-shell-aux` | `index.html`; `render-lesson.js`; `lesson-flow.js` | Treat as lesson-owned, not a cross-screen shared block yet. |
| QA-specific content panel | QA | `#qa-game-screen > .learning-screen-shell > .qa-round-panel` | 5 | `.learning-layout-header`, `#qa-runtime-status-bar`, `#screen-shell-aux` | `index.html`; `qa-flow.js`; `qa-wiring.js` | Highest-risk placement problem because QA runtime normalization removes legacy progress/reward wrappers. |
| Sentence/quiz content list area | Lesson, Sentences, Sentence Game | Screen-specific body container after header/status/reward/support blocks | 6 | `.learning-master-top`, `.learning-header-row`, `#qa-runtime-status-bar` | `index.html` question/list/builder areas | Keep active learning content below shared support/reward UI to prevent interleaving regressions. |
| Future image/art/animation blocks | Lesson, Sentences, Sentence Game, QA, Board Entry, Board | Dedicated media-stage child inside each screen’s content body | 7 | `.top-action-buttons`, `.learning-header-row`, `#qa-runtime-status-bar`, `.reward-row`, `.sentences-top-controls` | Future asset ids in `assets.js`; planning in `asset-registry.js`; current reward images are the nearest reference surface | High future risk because no canonical media-stage slot exists yet. |

## Order rules

### Shared learning-screen order

Use this default order unless a screen-specific adapter explicitly overrides it:

1. `topActionButtons`
2. `titleTimeChipArea`
3. `statusBar`
4. `rewardPanel`
5. `audioControlPanel` or mode-specific flow/helper panel
6. `lessonFlowPanel` / `qaContentPanel` / sentence content body
7. `futureMediaStage` inside the content body, not the header/status region

### Real project patterns to preserve

#### Lesson + Sentences pattern

- Top action buttons come first in `.learning-layout-header`.
- Title/time chip row comes next.
- Status bar sits below the header row.
- Reward strip sits below status and above the main question/list content.
- Content-specific UI follows afterward.

#### QA pattern

- Top action buttons remain first.
- `#qa-runtime-status-bar` stays directly below `.qa-game-header`.
- QA-specific content stays in `.qa-round-panel`.
- Reward blocks must **not** be dropped into `#qa-runtime-status-bar` unless a QA adapter explicitly allows it, because `qa-flow.js` currently removes progress-like nodes during runtime normalization.

#### Sentence Game pattern

- Shared header/status structure mirrors lesson and sentences.
- Reward ownership is split between a reward banner and a dedicated reward row/manager.
- Tip/audio support remains below reward ownership and above builder content.

## Highest-risk placement hotspots

### 1. QA runtime wrappers

Why high risk:
- `qa-flow.js` actively normalizes/removes progress-like wrappers.
- Shared status/reward fragments can silently disappear if inserted into the wrong parent.
- QA has the most bespoke runtime contract today.

### 2. Reward block placement

Why high risk:
- Lesson and sentences use static strips.
- Sentence game uses a dedicated reward manager plus banner behavior.
- QA reward ownership is runtime-bound instead of clearly placed in shared markup.

### 3. Status bar placement drift

Why high risk:
- Lesson, sentences, and sentence game place status inside `.learning-status-shell`.
- QA uses a standalone `#qa-runtime-status-bar`.
- Without a parent-container rule, future changes can split status behavior even more.

### 4. Duplicated per-screen control containers

Why high risk:
- Sentences, sentence game, and QA all own similar helper/control blocks with different wrappers.
- These look “shareable,” but they are not structurally identical yet.

### 5. Future image/art/animation placement

Why high risk:
- There is no dedicated media-stage slot today.
- Future assets are likely to be inserted opportunistically into reward/header/control wrappers unless ownership is defined now.

## Safe TODO markers added in runtime files

Lightweight TODO comments were added only around already-duplicated learning-screen wrappers in `index.html` and QA normalization in `qa-flow.js`.

These TODOs are meant to:
- mark risky legacy wrappers,
- remind future migrations to use the placement map,
- avoid changing runtime behavior today.

## Recommended first migration after this mapping step

**Migrate `topActionButtons` first.**

Why this block first:
- It is the most repeated block across lesson/game screens.
- It has the simplest shared order contract.
- Standardized labels already exist, reducing migration risk.
- Extracting it first creates a stable header anchor for later status/reward placement work.

## Files tied to the placement system

- `source-map.js` — machine-readable placement ownership map and risk registry.
- `docs/placement-system-map.md` — developer-facing placement rules and migration guidance.
- `index.html` — safe TODO markers on risky duplicated wrappers only.
- `qa-flow.js` — safe TODO marker for QA runtime adapter risk.
