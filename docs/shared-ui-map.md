# Shared UI Map

This document is the next foundation layer for **shared UI ownership** across the app. It is intentionally mapping-focused: it traces repeated UI blocks, where they currently render, where they drift, and which file should become the future source of truth.

## Scope guardrails

- No Home screen redesign or layout changes in this step.
- No new lessons, images, or animation work in this step.
- No risky refactors in this step; this is source tracing plus lightweight TODO marking.

## Recommended next unification order

1. **Top action buttons**
2. **Status bar + title/time chip header row**
3. **Reward / time-reward blocks**
4. **QA runtime wrappers around the shared learning header model**
5. **Sentence vs QA vs quiz control clusters**

## Shared UI block map

| UI block | Current screens | Current files / render path | Duplication status | Recommended future source of truth | Risk notes |
| --- | --- | --- | --- | --- | --- |
| Top action buttons | Lesson, Sentences, Sentence Game, QA, plus exit/time/sound variants in Stats/Profile/End | Static learning-screen markup in `index.html`; shell variants in `render-shell.js`; label normalization in `standardized-labels.js`; button querying in `app-dom.js` | **Duplicated** | `shared-ui/learning-top-actions.js` or a `render-shell`-owned fragment factory consumed by learning screens and shell screens | Highest-risk duplicate. Same exit / time / vault / save / sound structure is copied across multiple screens with slight picker differences. Drift risk is high when labels, order, aria, or spacing changes. |
| Status bar | Lesson, Sentences, Sentence Game, QA | Static status markup in `index.html`; selectors in `app-dom.js`; status cleanup/runtime normalization in `qa-flow.js`; updates wired from `script.js` | **Duplicated with QA-specific wrapper** | `shared-ui/status-bar.js` backed by a config map in `app-dom.js` / `source-map.js` | QA uses `#qa-runtime-status-bar` and performs runtime cleanup of progress/reward wrappers, so it is not structurally identical to lesson/sentences/sentence-game. |
| Reward panel / time-reward area | Lesson reward row, Sentences reward strip, Sentence Game reward row + reward banner, QA reward/time area, Stats reward cards, Profile reward snapshot | Static markup in `index.html`; shared reward updates in `render-rewards.js`; stats/profile cards in `progress-ui.js` and `render-shell.js`; sentence-game-specific reward runtime in `sentence-game-reward-manager.js`; orchestration in `script.js` | **Partially duplicated / partially shared** | `render-rewards.js` plus a per-mode reward config registry, with stats/profile adapters separate from learning-screen strips | High-risk because runtime ownership is split: some screens rely on static HTML tiles, sentence-game has its own manager, QA has custom runtime wrapper expectations, and stats/profile use card rendering rather than strip rendering. |
| Audio / control panel | Sentences TTS controls, Sentence Game tip/audio actions, QA help/sentences utility buttons, shell sound buttons | `index.html`; `audio-wiring.js`; `sentence-game-wiring.js`; `qa-wiring.js`; shell button markup in `render-shell.js` | **Partially duplicated** | `shared-ui/learning-utility-panels.js` with per-screen button/control config | Not visually identical yet, but the repeated “supporting controls near the learning core” pattern exists across sentence, sentence-game, and QA screens. |
| Lesson flow panel | Lesson only today; conceptually mirrored by QA round panel and sentence-game helper/tip flow | `index.html`; `render-lesson.js`; `lesson-flow.js` | **Somewhat shared conceptually, not structurally** | Keep `lesson-flow.js` / `render-lesson.js` as source of truth, then extract shared “learning flow state copy” utilities later if needed | Low risk in this step. Best treated as the canonical quiz flow panel, not generalized yet. |
| Top title/time chip area | Lesson, Sentences, Sentence Game; partial equivalents in End and Stats/Profile headers | Static markup in `index.html`; shell header markup in `render-shell.js`; time updates through `app-dom.js` and `script.js` | **Partially duplicated** | Shared header row fragment adjacent to status bar extraction | The learning screens repeat a title chip + today-time chip row, but QA currently omits that exact row and shell screens use a looser variant. |
| Repeated utility rows/buttons across lesson/game screens | Level pickers, vault/save row, time-details row, sound toggle row, help/tip/sentences action rows | `index.html`; button label normalization in `standardized-labels.js`; screen wiring in `script.js`, `qa-wiring.js`, `sentence-game-wiring.js`, `audio-wiring.js` | **Duplicated / partially duplicated** | Per-screen config objects backed by a shared row renderer | Main drift risk is inconsistent grouping and wrapper structure even when labels are standardized. |

## Screen-by-screen duplication trace

### Lesson / Quiz

- Repeats the full learning header structure: exit row, time-details button, vault button, level picker, save button, sound button, title/time chip row, status bar, and reward row.
- Current render path: `index.html` static shell + `render-lesson.js` + `lesson-flow.js` + `script.js` reward/status updates.
- Future owner: first candidate for the canonical shared learning header + reward strip shape because the lesson screen is the simplest complete version.

### Sentences

- Reuses the same header/status/reward skeleton as lesson, but inserts sentence-specific TTS controls below it.
- Current render path: `index.html` static shell + `sentence-game-wiring.js` / `script.js` reward updates + audio wiring.
- Future owner: should consume the same shared header/status/reward renderer with a sentences-specific level picker adapter.

### Sentence Game

- Reuses the same top action cluster and status row pattern, but reward behavior is managed by a dedicated runtime manager and the support controls live in the tip/audio panel.
- Current render path: `index.html` static header/status + `sentence-game-reward-manager.js` + `sentence-runtime.js` + `sentence-game-wiring.js`.
- Future owner: should share the header/status renderer first, then adopt a reward adapter so its dedicated reward banner logic can stay separate.

### QA Game

- Reuses the top action button cluster, but not the exact title/time/status shell structure used by lesson/sentences/sentence-game.
- Current render path: `index.html` static header + `qa-flow.js` runtime normalization + `qa-wiring.js` + `script.js` status/reward updates.
- Future owner: should converge on the shared header/status model only after preserving `qa-flow.js` cleanup rules as explicit config or adapter hooks.
- Key risk: QA currently has the most bespoke runtime wrapper behavior.

### Stats / Profile / End

- These screens do not match the learning screens one-to-one, but they repeat smaller utility subsets like exit, time-details, sound toggle, title/time chip concepts, and reward presentations.
- Current render path: `render-shell.js` + `progress-ui.js`.
- Future owner: consume only the utility-row subset, not the entire learning header abstraction.

## Highest-risk duplication hotspots

### 1. Top action buttons

Why it is risky:
- Present on nearly every learning screen.
- Contains the same high-touch controls users interact with most often.
- Small label/ARIA/order changes currently require editing several blocks.

Files involved:
- `index.html`
- `render-shell.js`
- `standardized-labels.js`
- `app-dom.js`

### 2. QA-specific runtime wrappers

Why it is risky:
- `qa-flow.js` removes progress/reward-like elements to normalize the runtime shell.
- That means a future shared status/reward fragment could silently break QA if introduced without explicit adapter rules.

Files involved:
- `index.html`
- `qa-flow.js`
- `app-dom.js`
- `script.js`

### 3. Reward / time-reward structures

Why it is risky:
- Shared reward rendering exists, but ownership is split across static HTML strips, dynamic tile rendering, and sentence-game-specific runtime behavior.
- The concept is shared, but the DOM contract is not yet unified.

Files involved:
- `index.html`
- `render-rewards.js`
- `progress-ui.js`
- `sentence-game-reward-manager.js`
- `script.js`

## Specific follow-up recommendation

**Unify first next: top action buttons.**

Reasoning:
- They are the most repeated block.
- They have the clearest shared contract.
- They can be extracted without forcing a redesign.
- Standardized labels already exist, which gives the extraction a partial foundation.

## Top 3 duplication/risk hotspots summary

1. **Top action buttons** — copied across lesson, sentences, sentence game, QA, and shell-style screens.
2. **QA runtime status/reward wrappers** — custom cleanup makes this the easiest place for regressions during shared extraction.
3. **Reward / time-reward UI** — partially shared logic with mismatched DOM ownership across learning and progress screens.
