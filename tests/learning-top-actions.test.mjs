import test from "node:test";
import assert from "node:assert/strict";

const { renderLearningTopActions, LEARNING_TOP_ACTION_VARIANTS } = await import("../shared-ui/learning-top-actions.js");

const EXPECTED_BUTTON_ORDER = [
  "Тоглоомоос гарах",
  "Тоглосон хугацаанууд",
  "Хадгалсан дасгал",
  "Түвшин сонгох",
  "Дасгалыг хадгалах",
  "Дуу: АСААЛТТАЙ",
];

test("learning top action renderer exposes the shared migrated variants", () => {
  assert.deepEqual(Object.values(LEARNING_TOP_ACTION_VARIANTS), ["lesson", "sentences", "sentence-game", "qa"]);
});

test("learning top action renderer keeps the shared button order and structure for migrated screens", () => {
  for (const variant of Object.values(LEARNING_TOP_ACTION_VARIANTS)) {
    const markup = renderLearningTopActions(variant);
    assert.match(markup, /learning-master-row learning-master-row-1/);
    assert.match(markup, /learning-master-row learning-master-row-2/);
    assert.match(markup, /learning-master-row learning-master-row-3/);

    let lastIndex = -1;
    EXPECTED_BUTTON_ORDER.forEach((label) => {
      const nextIndex = markup.indexOf(label);
      assert.notEqual(nextIndex, -1, `expected ${label} in ${variant}`);
      assert.ok(nextIndex > lastIndex, `expected ${label} to stay ordered in ${variant}`);
      lastIndex = nextIndex;
    });
  }
});

test("learning top action renderer preserves per-screen ids and picker hooks", () => {
  const lesson = renderLearningTopActions("lesson");
  const sentences = renderLearningTopActions("sentences");
  const sentenceGame = renderLearningTopActions("sentence-game");
  const qa = renderLearningTopActions("qa");

  assert.match(lesson, /id="lesson-vault-btn"/);
  assert.match(lesson, /id="start-btn"/);
  assert.match(sentences, /id="sentences-vault-btn"/);
  assert.match(sentences, /id="sentences-level-picker-btn"/);
  assert.match(sentenceGame, /id="sentence-game-vault-btn"/);
  assert.match(sentenceGame, /id="sentence-game-difficulty-toggle-btn"/);
  assert.match(qa, /id="qa-vault-btn"/);
  assert.match(qa, /id="qa-level-select-btn"/);
});
