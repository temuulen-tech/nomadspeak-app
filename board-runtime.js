import { BOARD_GAME_CONFIG, buildBoardGameTiles, boardTileEmoji } from "./board-game.js";
import {
  renderBoardScreen,
  updateBoardToken,
  renderBoardChapterPanel,
  renderBoardMeta,
  renderBoardRollState,
  renderBoardChallenge,
  
 renderBoardFeedbackVisual,
  renderBoardPopup,
} from "./render-board.js";
import { resolveBoardSelectionRoute } from "./chapters.js";
import { WORLD_IDS, getDifficultyOption } from "./constants.js";
import { getSelectableBoardWorlds } from "./worlds.js";

const BOARD_GAME_CHALLENGES_WORLD1 = [
  { id: "c1", tileNumber: 2, promptMn: "ЮУ", options: ["What", "Where", "When", "Why"], answer: "What", tip: "Асуух үг" },
  { id: "c2", tileNumber: 3, promptMn: "ХААНА", options: ["Where", "Who", "How", "Which"], answer: "Where", tip: "Асуух үг" },
  { id: "c3", tileNumber: 4, promptMn: "ХЭН", options: ["Who", "When", "Why", "What"], answer: "Who", tip: "Асуух үг" },
  { id: "c4", tileNumber: 6, promptMn: "ХЭЗЭЭ", options: ["When", "Where", "How", "Who"], answer: "When", tip: "Асуух үг" },
  { id: "c5", tileNumber: 8, promptMn: "ЯАГААД", options: ["Why", "What", "Where", "Whose"], answer: "Why", tip: "Асуух үг" },
  { id: "c6", tileNumber: 9, promptMn: "САЙН БАЙНА УУ", options: ["Hello / How are you?", "Good night", "Please sit", "I am hungry"], answer: "Hello / How are you?", tip: "Энгийн яриа" },
  { id: "c7", tileNumber: 11, promptMn: "БИ ЯВЖ БАЙНА", options: ["I am going", "I am eating", "I am sleeping", "I am waiting"], answer: "I am going", tip: "Хөдөлгөөний үйл үг" },
  { id: "c8", tileNumber: 13, promptMn: "БИД ИРЛЭЭ", options: ["We arrived", "We forgot", "We traded", "We left"], answer: "We arrived", tip: "Аяллын үйлдэл" },
  { id: "c9", tileNumber: 15, promptMn: "СОЛИЛЦОО", options: ["Trade / Exchange", "Storm", "Ship", "Danger"], answer: "Trade / Exchange", tip: "Солилцооны үг" },
  { id: "c10", tileNumber: 17, promptMn: "БЭЛЭГ", options: ["Gift", "Map", "Sword", "Harbor"], answer: "Gift", tip: "Зүйл заах үг" },
  { id: "c11", tileNumber: 19, promptMn: "АЛТ", options: ["Gold", "Salt", "Forest", "Road"], answer: "Gold", tip: "Зүйл заах үг" },
  { id: "c12", tileNumber: 21, promptMn: "АЮУЛ", options: ["Danger", "Music", "Festival", "Bridge"], answer: "Danger", tip: "Амьдралын үг" },
  { id: "c13", tileNumber: 23, promptMn: "ХООЛ", options: ["Food", "Horse", "Ocean", "Village"], answer: "Food", tip: "Амьдралын үг" },
  { id: "c14", tileNumber: 24, promptMn: "УС", options: ["Water", "Fire", "Wind", "Stone"], answer: "Water", tip: "Амьдралын үг" },
  { id: "c15", tileNumber: 26, promptMn: "ДУУСЛАА", options: ["Finished", "Started", "Returned", "Lost"], answer: "Finished", tip: "Дуусгах үг" },
];

const GAME_FEEL_MOTION = {
  tilePulseMs: 900,
  rewardPopMs: 850,
  penaltyMs: 520,
  moveStepMs: 210,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createBoardRuntime({
  dom,
  appDom,
  getBoardEntryState,
  gameFeelSoundManager,
  persistActionRewards,
}) {
  const state = {
    levelId: WORLD_IDS.WORLD_1,
    tiles: [],
    challenges: BOARD_GAME_CHALLENGES_WORLD1,
    player: { currentTile: 1, token: "⛵", xp: 0, coins: 0 },
    dice: { sides: 6, lastRoll: null, canRoll: true, rolling: false },
    movement: { isMoving: false },
    challenge: { activeChallenge: null, pendingRoll: 0, resolvedTile: 1 },
    feedback: { message: "Түүхэн аяллаа эхлүүлэхийн тулд шоо шиднэ үү.", type: "info" },
  };

  function gameFeelAnimate(el, className, duration = 600) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), duration);
  }

  function spawnBoardParticles(type = "reward") {
    if (!dom.particlesEl) return;
    const count = type === "finish" ? 14 : 8;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("span");
      particle.className = `board-particle is-${type}`;
      particle.style.left = `${10 + Math.random() * 80}%`;
      particle.style.animationDelay = `${Math.random() * 180}ms`;
      particle.style.animationDuration = `${700 + Math.random() * 500}ms`;
      dom.particlesEl.appendChild(particle);
      setTimeout(() => particle.remove(), 1500);
    }
  }

  function showBoardGamePopup(type, text) {
    renderBoardPopup({ hubEl: dom.feedbackHubEl, type, text });
  }

  function boardLevelConfig() {
    return BOARD_GAME_CONFIG.levels[state.levelId];
  }

  function boardTileByNumber(tileNumber) {
    return state.tiles.find((tile) => tile.tileNumber === tileNumber) || state.tiles[0];
  }

  function boardGameChapterByTile(tileNumber) {
    const chapter = boardLevelConfig().chapters.find((item) => tileNumber >= item.startTile && tileNumber <= item.endTile);
    return chapter || boardLevelConfig().chapters[0];
  }

  function boardGameChallengeByTile(tileNumber) {
    return state.challenges.find((challenge) => challenge.tileNumber === tileNumber) || null;
  }

  function renderBoardGameTiles() {
    renderBoardScreen({
      boardEl: dom.boardEl,
      tokenEl: dom.tokenEl,
      tiles: state.tiles,
      currentTile: state.player.currentTile,
      tileEmoji: boardTileEmoji,
      animate: gameFeelAnimate,
      tokenStepClass: "gf-token-step",
      tokenStepDuration: GAME_FEEL_MOTION.moveStepMs,
    });
  }

  function updateBoardGameTokenPosition() {
    updateBoardToken({
      boardEl: dom.boardEl,
      tokenEl: dom.tokenEl,
      currentTile: state.player.currentTile,
      tokenStepClass: "gf-token-step",
      tokenStepDuration: GAME_FEEL_MOTION.moveStepMs,
      animate: gameFeelAnimate,
    });
  }

  function updateBoardGameChapterPanel() {
    const chapter = boardGameChapterByTile(state.player.currentTile);
    const storyPanelEl = appDom.board.getStoryPanelEl();
    renderBoardChapterPanel({
      chapter,
      titleEl: dom.chapterTitleEl,
      textEl: dom.chapterTextEl,
      indexEl: dom.chapterIndexEl,
      storyPanelEl,
      animate: gameFeelAnimate,
    });
  }

  function updateBoardGameMetaUi() {
    renderBoardMeta({
      currentTile: state.player.currentTile,
      totalTiles: boardLevelConfig().totalTiles,
      lastRoll: state.dice.lastRoll,
      feedback: state.feedback.message,
      xp: state.player.xp,
      coins: state.player.coins,
      positionEl: dom.positionEl,
      totalTilesEl: dom.totalTilesEl,
      lastRollEl: dom.lastRollEl,
      feedbackEl: dom.feedbackEl,
      xpEl: dom.xpEl,
      coinsEl: dom.coinsEl,
    });
  }

  function updateBoardGameScreenTitle() {
    if (!dom.screenTitleEl) return;
    const route = resolveBoardSelectionRoute(getBoardEntryState());
    const worldLabel = route.selectedWorld?.title || getSelectableBoardWorlds()[0]?.label || "Колумб ба Шинэ тивийнхэн";
    const difficultyLabel = getDifficultyOption(route.difficultyId)?.label || "Анхан";
    dom.screenTitleEl.textContent = `Та битгий уурлаарай · ${worldLabel}`;
    if (dom.difficultyEl) dom.difficultyEl.textContent = difficultyLabel;
  }

  function setBoardGameRollEnabled(enabled) {
    state.dice.canRoll = enabled;
    renderBoardRollState({ enabled, rollBtn: dom.rollBtn, diceEl: dom.diceEl });
  }

  async function handleBoardGameAnswer(selectedOption) {
    const challenge = state.challenge.activeChallenge;
    if (!challenge) return;
    const optionButtons = dom.optionsEl ? [...dom.optionsEl.querySelectorAll("button")] : [];
    optionButtons.forEach((btn) => {
      btn.disabled = true;
      if (btn.textContent === challenge.answer) btn.classList.add("correct");
      if (btn.textContent === selectedOption && selectedOption !== challenge.answer) btn.classList.add("wrong");
    });
    const wasCorrect = selectedOption === challenge.answer;
    if (wasCorrect) {
      state.player.xp += 20;
      state.player.coins += 12;
      const route = resolveBoardSelectionRoute(getBoardEntryState());
      const rewardBaseEventId = [
        "board-challenge",
        route.selectedWorld?.id || getBoardEntryState().worldId || "world",
        route.difficultyId || getBoardEntryState().difficultyId || "difficulty",
        challenge.id || state.player.currentTile,
        state.player.currentTile,
        "success",
      ].join(":");
      persistActionRewards({
        xp: 20,
        coins: 12,
        progressEventId: `${rewardBaseEventId}:progress`,
        rewardEventId: `${rewardBaseEventId}:wallet`,
      });
      setBoardGameFeedback(`Зөв! ${challenge.promptMn} = ${challenge.answer}. Байрлалаа хадгалж, +20 туршлага, +12 зоос авлаа.`, "success");
      gameFeelSoundManager.play("correct");
      spawnBoardParticles("reward");
      gameFeelAnimate(dom.optionsEl, "gf-reward-pop", GAME_FEEL_MOTION.rewardPopMs);
      state.challenge.activeChallenge = null;
      renderBoardGameChallenge();
      setBoardGameRollEnabled(state.player.currentTile !== boardLevelConfig().totalTiles);
      return;
    }

    setBoardGameFeedback(`Буруу хариулт. ${challenge.promptMn} нь ${challenge.answer} гэсэн утгатай. ${state.challenge.pendingRoll} нүд ухарна.`, "penalty");
    gameFeelSoundManager.play("wrong");
    gameFeelAnimate(dom.tokenEl, "gf-penalty-shake", GAME_FEEL_MOTION.penaltyMs);
    await sleep(450);
    const fromTile = state.player.currentTile;
    const toTile = Math.max(1, fromTile - state.challenge.pendingRoll);
    await animateBoardGameMovement(fromTile, toTile);
    state.challenge.activeChallenge = null;
    renderBoardGameChallenge();
    const retreatTile = boardTileByNumber(toTile);
    if (retreatTile.tileType === "checkpoint") {
      setBoardGameFeedback("Та шалган нэвтрэх нүд рүү ухарлаа. Дахин төвлөрч шоо шиднэ үү.", "checkpoint");
    }
    setBoardGameRollEnabled(true);
    updateBoardGameMetaUi();
  }

  function renderBoardGameChallenge() {
    const challenge = state.challenge.activeChallenge;
    const panelEl = appDom.board.getChallengePanelEl();
    renderBoardChallenge({
      challenge,
      titleEl: dom.challengeTitleEl,
      textEl: dom.challengeTextEl,
      optionsEl: dom.optionsEl,
      panelEl,
      onSelectOption: (option) => handleBoardGameAnswer(option),
    });
  }

  function applyBoardGameTileMoment(tileType) {
    const activeTile = dom.boardEl?.querySelector(`[data-tile="${state.player.currentTile}"]`);
    if (tileType === "checkpoint") gameFeelAnimate(activeTile, "gf-checkpoint-glow", 1000);
    if (tileType === "reward") gameFeelAnimate(activeTile, "gf-reward-pop", GAME_FEEL_MOTION.rewardPopMs);
    if (tileType === "penalty") gameFeelAnimate(activeTile, "gf-penalty-flash", GAME_FEEL_MOTION.penaltyMs);
    if (tileType === "finish") {
      gameFeelAnimate(activeTile, "gf-chest-open", 1200);
      spawnBoardParticles("finish");
    }
  }

  function applyBoardTileEffect(tile) {
    const effect = boardLevelConfig().tileEffects[tile.tileType];
    if (!effect) return "";
    state.player.xp = Math.max(0, state.player.xp + (effect.xp || 0));
    state.player.coins = Math.max(0, state.player.coins + (effect.coins || 0));
    if ((effect.xp || 0) > 0 || (effect.coins || 0) > 0) {
      const route = resolveBoardSelectionRoute(getBoardEntryState());
      const rewardBaseEventId = [
        "board",
        route.selectedWorld?.id || getBoardEntryState().worldId || "world",
        route.difficultyId || getBoardEntryState().difficultyId || "difficulty",
        tile.chapterId || "chapter",
        tile.tileNumber,
        tile.tileType,
      ].join(":");
      persistActionRewards({
        xp: Math.max(0, effect.xp || 0),
        coins: Math.max(0, effect.coins || 0),
        progressEventId: `${rewardBaseEventId}:progress`,
        rewardEventId: `${rewardBaseEventId}:wallet`,
      });
    }
    if (tile.tileType === "reward") return `Шагналын нүд: +${effect.xp} туршлага, +${effect.coins} зоос.`;
    if (tile.tileType === "penalty") return `Торгуулийн нүд: ${effect.xp} туршлага, ${effect.coins} зоос.`;
    if (tile.tileType === "checkpoint") return `Шалган нэвтрэх нүдэнд хүрлээ: +${effect.xp} туршлага, +${effect.coins} зоос.`;
    if (tile.tileType === "finish") return `Барианы нүдийг давлаа: +${effect.xp} туршлага, +${effect.coins} зоос.`;
    return "";
  }

  function setBoardGameFeedback(message, type = "info") {
    state.feedback.message = message;
    state.feedback.type = type;
    renderBoardFeedbackVisual({ feedbackEl: dom.feedbackEl, type, animate: gameFeelAnimate });
    showBoardGamePopup(type, message);
    updateBoardGameMetaUi();
  }

  function applyPostLandingTileFeedback(tile) {
    if (tile.tileType === "story") {
      setBoardGameFeedback("Өгүүлэмжийн нүд: хоёр ертөнц сониуч бөгөөд болгоомжтойгоор бие биеэ ажиглана.", "story");
      return;
    }
    const effectMessage = applyBoardTileEffect(tile);
    if (!effectMessage) return;
    setBoardGameFeedback(effectMessage, tile.tileType);
    applyBoardGameTileMoment(tile.tileType);
    if (tile.tileType === "reward") {
      gameFeelSoundManager.play("reward");
      spawnBoardParticles("reward");
    }
    if (tile.tileType === "penalty") gameFeelSoundManager.play("wrong");
    if (tile.tileType === "checkpoint") gameFeelSoundManager.play("chest");
    if (tile.tileType === "finish") gameFeelSoundManager.play("finish");
  }

  async function animateBoardGameDice(roll) {
    if (!dom.diceEl) return;
    state.dice.rolling = true;
    dom.diceEl.classList.add("gf-dice-roll");
    gameFeelSoundManager.play("dice");
    for (let i = 0; i < 14; i += 1) {
      const randomFace = Math.floor(Math.random() * 6) + 1;
      dom.diceEl.dataset.face = String(randomFace);
      await sleep(72);
    }
    dom.diceEl.dataset.face = String(roll);
    dom.diceEl.classList.remove("gf-dice-roll");
    state.dice.rolling = false;
  }

  async function animateBoardGameMovement(fromTile, toTile) {
    if (toTile === fromTile) return;
    state.movement.isMoving = true;
    const step = toTile > fromTile ? 1 : -1;
    for (let tile = fromTile + step; step > 0 ? tile <= toTile : tile >= toTile; tile += step) {
      state.player.currentTile = tile;
      updateBoardGameChapterPanel();
      updateBoardGameMetaUi();
      updateBoardGameTokenPosition();
      await sleep(GAME_FEEL_MOTION.moveStepMs);
    }
    state.movement.isMoving = false;
  }

  async function resolveBoardLanding(tileNumber, rolledValue) {
    const tile = boardTileByNumber(tileNumber);
    state.challenge.pendingRoll = rolledValue;
    state.challenge.resolvedTile = tileNumber;
    state.challenge.activeChallenge = boardGameChallengeByTile(tileNumber);
    applyPostLandingTileFeedback(tile);
    renderBoardGameChallenge();
    updateBoardGameMetaUi();
    if (!state.challenge.activeChallenge) setBoardGameRollEnabled(tile.tileType !== "finish");
  }

  async function boardGameRollDice() {
    if (!state.dice.canRoll || state.movement.isMoving || state.dice.rolling) return;
    setBoardGameRollEnabled(false);
    const roll = Math.floor(Math.random() * state.dice.sides) + 1;
    const fromTile = state.player.currentTile;
    const toTile = Math.min(boardLevelConfig().totalTiles, fromTile + roll);
    state.dice.lastRoll = roll;
    await animateBoardGameDice(roll);
    await animateBoardGameMovement(fromTile, toTile);
    await resolveBoardLanding(toTile, roll);
  }

  function initBoardGameMvp() {
    state.tiles = buildBoardGameTiles(boardLevelConfig());
    state.player.currentTile = 1;
    state.player.xp = 0;
    state.player.coins = 0;
    state.dice.lastRoll = null;
    state.challenge.activeChallenge = null;
    state.feedback.message = "Түүхэн аяллаа эхлүүлэхийн тулд шоо шиднэ үү.";
    updateBoardGameScreenTitle();
    renderBoardGameTiles();
    updateBoardGameChapterPanel();
    renderBoardGameChallenge();
    updateBoardGameMetaUi();
    updateBoardGameTokenPosition();
    setBoardGameRollEnabled(true);
    if (dom.diceEl) dom.diceEl.dataset.face = "1";
    if (dom.feedbackHubEl) dom.feedbackHubEl.innerHTML = "";
    gameFeelSoundManager.startAmbient();
  }

  function syncBoardGameDebugState(tileNumber, message = "Debug jump completed.") {
    const nextTile = Math.max(1, Math.min(boardLevelConfig().totalTiles, Math.floor(Number(tileNumber) || 1)));
    state.player.currentTile = nextTile;
    state.dice.lastRoll = null;
    state.challenge.activeChallenge = null;
    state.feedback.message = message;
    renderBoardGameTiles();
    updateBoardGameChapterPanel();
    renderBoardGameChallenge();
    updateBoardGameMetaUi();
    updateBoardGameTokenPosition();
    setBoardGameRollEnabled(true);
  }


  return {
    boardGameRollDice,
    initBoardGameMvp,
    updateBoardGameTokenPosition,
    syncBoardGameDebugState,
    isRollingOrMoving: () => state.dice.rolling || state.movement.isMoving,
    getState: () => state,
    updateBoardGameScreenTitle,
  };
}
