# NomadSpeak screen/render map

This file is a lightweight source-of-truth map for **where each major screen is rendered from** and **which UI blocks are currently duplicated**.

## Render path overview

1. `app.js` mounts shell fragments with `mountAppShell()` and then loads `initializeApp()` from `script.js`.
2. `script.js` pulls DOM references from `app-dom.js`, initializes screen lifecycles, and wires navigation/render helpers.
3. `screen-navigation.js` is the runtime switchboard that hides/shows screens and triggers each screen lifecycle.
4. Screen markup is split across:
   - `index.html` for home + core learning/game screens.
   - `render-shell.js` for stats/profile/end screens and shared overlays.

## Screen map

| Screen | Screen id | Rendered from | Main render/entry functions | Important child UI areas |
| --- | --- | --- | --- | --- |
| Home | `start-screen` | `index.html`, `home-screen.js`, `render-home.js`, `screen-navigation.js` | `initHomeScreen()`, `renderHomeScreen()`, `showScreen()` | Home header, intro panel, modes panel, stats/profile entry buttons |
| Lesson / Quiz | `quiz-screen` | `index.html`, `lesson-screen.js`, `render-lesson.js`, `lesson-flow.js`, `screen-navigation.js` | `initLessonScreen()`, `renderLessonScreen()`, `renderLessonAnswerState()`, `createLessonFlow()`, `showScreen()` | Top action buttons, lesson status bar, lesson flow panel, reward bar, question/options/result |
| Sentences | `sentences-screen` | `index.html`, `sentence-game-wiring.js`, `script.js`, `screen-navigation.js` | `createSentenceFilterControls()`, `renderSentencesRewardStrip()`, `showScreen()` | Top action buttons, status bar, reward strip, TTS controls, sentence list |
| QA Game | `qa-game-screen` | `index.html`, `qa-flow.js`, `qa-wiring.js`, `screen-navigation.js` | `createQaFlow()`, `createQaControls()`, `showScreen()` | Top action buttons, QA status area, round panel, word bank, help/sentences modal |
| Sentence Game | `sentence-game-screen` | `index.html`, `sentence-game-wiring.js`, `sentence-runtime.js`, `sentence-game-reward-manager.js`, `screen-navigation.js` | `createSentenceGameControls()`, `createSentenceRuntime()`, `createSentenceGameRewardManager()`, `showScreen()` | Top action buttons, status bar, reward row/banner, sentence builder, tip/audio controls |
| Board entry / cover | `board-game-intro-screen` | `index.html`, `chapter-cover-screen.js`, `screen-navigation.js` | `initChapterCoverScreen()`, `setPreview()`, `syncSelectorUi()`, `showScreen()` | Cover art, entry panel, world selector, difficulty selector |
| Board screen | `board-game-screen` | `index.html`, `board-screen.js`, `render-board.js`, `board-runtime.js`, `screen-navigation.js` | `initBoardScreen()`, `renderBoardScreen()`, `renderBoardMeta()`, `renderBoardChallenge()`, `showScreen()` | Board top bar, story panel, challenge panel, dice controls, feedback hub |
| Stats screen | `stats-screen` | `render-shell.js`, `stats-screen.js`, `progress-ui.js`, `screen-navigation.js` | `mountAppShell()`, `initStatsScreen()`, `createProgressUi()`, `showScreen()` | Exit row, progress summary, KPI/time panels, reward tabs/cards |
| Reward-related areas | `cross-screen-rewards` | `index.html`, `render-shell.js`, `render-rewards.js`, `progress-ui.js`, `sentence-game-reward-manager.js` | `renderRewards()`, `renderRewardStripTiles()`, `renderLinearRewardBar()`, `renderSentencesRewardStrip()`, `createTimedRewardTrack()`, `createSentenceGameRewardManager()` | Lesson reward bar, sentences reward strip, sentence-game reward row/banner, QA reward bar, stats reward cards, profile reward snapshot |

## Shared UI map

| Shared UI block | Current files / locations | Duplicated? | Recommended source-of-truth |
| --- | --- | --- | --- |
| Top action buttons | `index.html` learning headers; `render-shell.js` exit/time/sound rows; `standardized-labels.js` label normalization | Yes | Shared render fragment/module for exit + time + vault/save/sound controls |
| Status bar | `index.html` lesson/sentences/sentence-game/QA status shells; `app-dom.js` selectors; `qa-flow.js` cleanup logic | Yes | Shared status bar helper driven by per-screen config from `app-dom.js` |
| Reward panel | `index.html` lesson/sentences/QA/sentence-game markup; `render-rewards.js`; `progress-ui.js`; `sentence-game-reward-manager.js`; `render-shell.js` stats cards | Yes | `render-rewards.js` plus mode config, with static HTML reduced over time |
| Lesson flow panel | `index.html`; `render-lesson.js`; `lesson-flow.js` | Partial | Keep `lesson-flow.js` + `render-lesson.js` as the owner and minimize text state in markup |
| Audio/control panel | `index.html` learning control groups; `audio-wiring.js`; `sentence-game-wiring.js`; `qa-wiring.js`; `standardized-labels.js` | Yes | Shared learning utilities module with per-screen button config |

## Highest-risk duplicate areas to unify next

1. **Top action buttons**
   - Same exit/time/vault/save/sound pattern appears in multiple learning screens plus shell-mounted screens.
   - Risk: copy changes drift per screen.

2. **QA status area**
   - QA has a custom status shell and cleanup pass in `qa-flow.js`, while other screens use similar static status markup.
   - Risk: status-bar updates or redesigns need custom handling in multiple places.

3. **Reward/time-reward UI**
   - Reward rows are partly static in `index.html` and partly updated through shared reward helpers.
   - Risk: labels, unlock rules, or visual states can diverge between lesson, sentences, sentence game, QA, stats, and profile.

## Notes for future cleanup

- Prefer moving repeated learning-header fragments into a shared renderer before any visual redesign.
- Keep `app-dom.js` as the central selector registry while shared fragments are introduced.
- Treat `screen-navigation.js` as the runtime source of truth for which screen is active; avoid per-screen ad hoc show/hide logic.
