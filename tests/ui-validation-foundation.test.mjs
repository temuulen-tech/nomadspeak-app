import test from "node:test";
import assert from "node:assert/strict";

const validation = await import("../ui-validation.js");
const { APP_SOURCE_MAP, APP_PLACEMENT_SYSTEM } = await import("../source-map.js");

test("ui validation foundation exposes the required validation areas and core focus blocks", () => {
  const foundation = validation.UI_VALIDATION_FOUNDATION;

  assert.equal(foundation.version, "phase-56-validation-foundation");
  assert.deepEqual(Object.keys(foundation.areas), [
    "renderSourceValidation",
    "sharedUiUsageValidation",
    "assetReferenceValidation",
    "placementConsistencyValidation",
    "duplicateRiskHotspotReporting",
  ]);

  [
    "topActionButtons",
    "statusBar",
    "rewardPanel",
    "audioControlPanel",
    "titleTimeChipArea",
  ].forEach((blockKey) => {
    assert.deepEqual(foundation.focusBlocks[blockKey], APP_SOURCE_MAP.sharedUiBlocks[blockKey]);
  });
});

test("ui validation snapshot keeps placement and duplicate hotspot references connected to the foundation maps", () => {
  const snapshot = validation.createValidationSnapshot();

  assert.deepEqual(snapshot.placementOwners, APP_PLACEMENT_SYSTEM.placements);
  assert.equal(snapshot.duplicateRiskHotspots.length, APP_SOURCE_MAP.riskyDuplicateAreas.length);
  assert.ok(snapshot.riskyLegacyWrappers.some((entry) => entry.selector === "#qa-runtime-status-bar"));
});

test("repeated asset path report catches shared placeholder/path duplication hotspots", () => {
  const repeatedPaths = validation.getRepeatedAssetPathReport();
  const sailorsCoverGroup = repeatedPaths.find((entry) => entry.path === "assets/visuals/worlds/sailors/intro/world-cover-sailors-columbus-new-world-placeholder.svg");
  const sailorsBackgroundGroup = repeatedPaths.find((entry) => entry.path === "assets/visuals/worlds/sailors/backgrounds/world-bg-sailors-ship-deck-placeholder.svg");

  assert.ok(sailorsCoverGroup);
  assert.ok(sailorsCoverGroup.entries.length >= 2);
  assert.ok(sailorsBackgroundGroup);
  assert.ok(sailorsBackgroundGroup.entries.length >= 2);
});

test("asset source recommendation resolves by key and by path fragment", () => {
  const byKey = validation.getAssetSourceRecommendation("reward-star");
  const byPath = validation.getAssetSourceRecommendation("world-bg-sailors-ship-deck-placeholder.svg");

  assert.equal(byKey?.path, "assets/rewards/icons/reward-star.png");
  assert.equal(byPath?.key, "sailors-deck");
});
