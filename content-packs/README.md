# Content packs handoff folder

This folder is the **drop-in handoff area** for future real lesson/game content preparation.

## Purpose

- Keep starter/demo content separate from future production-ready content.
- Provide copyable template files for each content type without changing runtime flow.
- Give the content owner one place to start before wiring final ids into the live modules.

## Recommended future workflow

1. Copy the template file you need from `content-packs/templates/`.
2. Fill it with the real lesson/game content using the final ids.
3. Mirror those ids into the live routing files:
   - `worlds.js`
   - `chapters.js`
   - `lesson.js`
   - `qa-game.js`
   - `sentence-game.js`
   - `data/sentences.json`
4. Keep demo/starter ids separate from final content ids until the final insertion pass.

## Template files

- `templates/lesson-pack.template.json`
- `templates/word-bank.template.json`
- `templates/sentence-bank.template.json`
- `templates/qa-set.template.json`
- `templates/content-pack-manifest.template.json`

## Important rule

Do **not** point the app at these template files directly. They are handoff references for preparing real content before inserting it into the app's live data modules.
