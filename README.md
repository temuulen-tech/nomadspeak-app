# nomadspeak-app
NomadSpeak – English learning app for Mongolians

## Content drop-in workflow prep

This phase does **not** add the final content library yet. It keeps the current flow intact while making future content insertion more predictable.

### Future drop-in workflow

1. **World metadata** → edit `worlds.js`.
   - Add or confirm the world title, subtitle, world-level default lesson/QA/sentence ids, and asset ids.
2. **Chapter metadata** → edit `chapters.js`.
   - Add or confirm chapter order, story copy, board range, and the chapter-specific lesson/word-bank/QA/sentence ids.
3. **Lesson pack + lesson word bank** → edit `lesson.js`.
   - Add the actual lesson prompt/answer entries and the matching lesson word bank using the same ids from `chapters.js`.
4. **QA rounds** → edit `qa-game.js`.
   - Add the rounds that belong to the `qaSetId` referenced by the world/chapter configuration.
5. **Sentence bank registration** → edit `sentence-game.js`.
   - Register the sentence bank id and keep it pointed at the expected dataset path.
6. **Images/audio/animation references** → edit `assets.js`.
   - Register new cover/background/reward/audio/animation ids first, then reference those ids from `worlds.js` and `chapters.js`.
7. **Shared naming / workflow helpers** → confirm `constants.js`.
   - Keep ids and insertion order aligned with the shared workflow helpers/constants so future packs follow the same shape.

### File ownership quick guide

- `worlds.js`: world metadata, difficulty-to-pack refs, world-level QA/sentence defaults, world asset ids.
- `chapters.js`: chapter metadata, chapter routing ids, chapter starter templates.
- `lesson.js`: lesson packs and lesson-side word banks.
- `qa-game.js`: QA round sets and QA-specific helper token banks.
- `sentence-game.js`: sentence bank registrations and sentence dataset routing.
- `assets.js`: image/audio/animation asset references and animation hook metadata.
- `constants.js`: shared id patterns, insertion sequence, and workflow helpers.

### Safe rule for future content packs

When adding a new content pack, **reuse the existing ids and placeholders where possible** instead of creating a new flow path. That keeps the current UI, buttons, progress handling, and gameplay route unchanged.

See `docs/content-insertion-handoff.md` for the step-by-step handoff checklist used for future real content drops. Copyable prep templates now live in `content-packs/templates/` so real content can be drafted separately from the starter/demo packs before final insertion.
For a dry-run status snapshot of which chapters are starter-ready vs still placeholder-only, use `content-readiness.js` and its matching test coverage in `tests/content-readiness.test.mjs`.

## Phase 54 baseline sign-off

The app should now be treated as the **stable content-ready baseline** for future production work.

### What is considered locked

- `app.js` + `script.js` keep bootstrap, navigation, and runtime orchestration.
- `state.js` + `actions.js` keep state shape, normalization, persistence, and progress mutations.
- `worlds.js` + `chapters.js` keep routing metadata and content/asset ids.
- `lesson.js`, `qa-game.js`, `sentence-game.js`, and `data/sentences.json` are the intended insertion paths for lesson/question/sentence content.
- `assets.js` is the intended insertion path for covers, backgrounds, rewards, audio, and future animation hooks/assets.
- screen/render modules should keep consuming config/content ids instead of becoming new content stores.

### What future work should prefer

1. Insert real world/chapter metadata through the existing config ids.
2. Replace placeholder lesson packs, QA sets, sentence banks, and JSON rows with real content.
3. Swap placeholder cover/background/reward art in `assets.js`.
4. Attach future animation configs/assets through the existing hook ids before touching screen flow.

### What to avoid unless truly necessary

- Another architecture rewrite for content-only changes.
- New parallel lesson/gameplay routes for new packs.
- Hardcoded asset paths in screen/render modules.
- Save/progress rewrites unless a real storage migration is required.

This keeps the current UI, button flow, and learner progress intact while making future phases primarily about content production.
