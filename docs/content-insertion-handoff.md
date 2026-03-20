# Content insertion checklist / handoff guide

This phase is a **handoff only**. Do **not** redesign the UI, change the gameplay route, or reset progress while inserting future real content.

## Baseline status

As of **Phase 54**, the current architecture should be treated as the **locked content-ready baseline**. Future work should assume the routing/state/render structure is stable enough for real content insertion, and should focus mainly on replacing placeholder ids/data/assets rather than reopening architecture churn.

## Where future content work should start

Start with the existing data-driven flow that already powers the live app:

1. `worlds.js`
2. `chapters.js`
3. `lesson.js`
4. `qa-game.js`
5. `sentence-game.js`
6. `data/sentences.json`
7. `assets.js`
8. `constants.js` only if a new stable id/helper is truly needed

Recommended first real insertion target: **World 1 → Beginner → Chapter 2** because the current board/lesson flow already uses World 1, so this is the lowest-risk next pack to replace with real content.

## File ownership map

| Content type | Primary file(s) to edit | What belongs there |
| --- | --- | --- |
| World metadata | `worlds.js` | World title/subtitle, world-level default lesson/QA/sentence ids, cover/background/reward/audio ids |
| Chapter metadata | `chapters.js` | Chapter order, story text, board tile range, chapter lesson/word-bank/QA/sentence ids |
| Lesson content | `lesson.js` | Lesson prompt/answer rows and lesson pack definitions |
| Lesson word banks | `lesson.js` | Lesson-side vocabulary/token banks that match a lesson pack |
| QA content | `qa-game.js` | QA round sets and QA helper word-bank ids |
| Sentence-game bank registration | `sentence-game.js` | Sentence bank ids, world/chapter/difficulty routing, JSON dataset mapping |
| Sentence/question row data | `data/sentences.json` | Sentence rows loaded by the sentence game |
| Images / world covers / backgrounds / audio | `assets.js` | Stable asset ids and file paths |
| Future animation hooks/assets | `assets.js` | Animation hook metadata and future animation asset registrations |
| Shared ids / helper constants | `constants.js` | Reusable ids, insertion sequence, ownership map, helper builders |

## Recommended order for inserting one new content pack

Use this order to avoid broken references:

1. **Confirm the pack target in `constants.js` (optional).**
   - Only edit if you truly need a new stable id pattern or handoff helper.
   - Prefer reusing the current naming conventions.

2. **Add or update world metadata in `worlds.js`.**
   - Confirm the world id already exists or add it.
   - Set/confirm world-level `lessonContentMap`, `qaSetId`, `sentenceBankId`, and asset ids.

3. **Add or update chapter metadata in `chapters.js`.**
   - Set/confirm `lessonPackId`, `wordBankId`, `qaSetId`, and `sentenceBankId` for the chapter.
   - Keep chapter index, story, and tile ranges intact unless the content pack truly requires a new chapter entry.

4. **Insert the lesson pack and lesson word bank in `lesson.js`.**
   - Add the real lesson entries for the `lessonPackId` used by the chapter/world.
   - Keep the lesson pack id aligned with `chapters.js` / `worlds.js`.

5. **Insert the QA rounds in `qa-game.js`.**
   - Add the QA set matching the `qaSetId` from `chapters.js` or `worlds.js`.
   - Keep the same round contract so the current QA screen keeps working.

6. **Register the sentence bank in `sentence-game.js`.**
   - Add or update the `sentenceBankId` entry.
   - Keep it routed through the current sentence-bank loading flow.

7. **Insert the sentence rows in `data/sentences.json` if the bank uses the shared JSON dataset.**
   - Add the actual sentence rows needed by the registered sentence bank.
   - Reuse the current JSON structure instead of changing runtime flow.

8. **Register visual/audio references in `assets.js`.**
   - Add cover, background, reward, lesson visual, or audio asset ids first.
   - Then point `worlds.js` / `chapters.js` to those ids.

9. **Register future animation hooks/assets in `assets.js` only when needed.**
   - Add hook metadata or future animation asset references there.
   - Then reference hook ids from `worlds.js` or `chapters.js` without changing screen logic.

## Verification checklist after each pack

Run this quick manual check without changing the flow:

- World selector still opens and shows the expected world.
- Difficulty selector still routes to the expected pack.
- Chapter cover still loads the expected title and cover/background.
- Lesson screen shows the new lesson rows.
- QA game shows the expected QA set.
- Sentence game loads the expected sentence bank/data.
- No buttons/navigation paths changed.
- Existing saved progress still remains untouched.

## Safe insertion rules

- **Do not put full lesson/QA/sentence datasets into `worlds.js` or `chapters.js`.** Keep those files as routing metadata.
- **Do not hardcode raw asset paths inside screen/render files.** Register them in `assets.js` first.
- **Do not add a parallel flow for new content.** Reuse the existing ids and placeholder slots.
- **Do not reset storage or change progress logic** just to load a new pack.
- **Do not redesign visuals in this phase.** This guide is only for future content insertion.

## Baseline-lock reminder

Use the existing modules as stable ownership boundaries:

- Keep routing metadata in `worlds.js` and `chapters.js`.
- Keep lesson/QA/sentence datasets in `lesson.js`, `qa-game.js`, `sentence-game.js`, and `data/sentences.json`.
- Keep cover/background/reward/audio/animation registrations in `assets.js`.
- Keep navigation, screen lifecycle, and progress handling intact unless a truly necessary bug fix or migration is discovered.

If a future task is only about adding real lessons, images, word banks, question sets, sentence rows, or motion assets, it should normally **not** require a render/navigation refactor.
