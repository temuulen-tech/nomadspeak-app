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
