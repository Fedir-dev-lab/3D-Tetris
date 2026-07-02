import {
  renderer, camera, orbitControls, scene,
  updatePieceVisual, rebuildLockedVisual
} from './renderer.js';
import { createGameState, startGame, updateGame, getGhostY } from './game.js';
import { getColor } from './tetromino.js';
import { setupControls } from './controls.js';
import {
  showMenu, showGame, showPause, hidePause,
  showGameOver, showScores, showSettings, showClearMessage,
  updateHUD, bindMenuButtons, getBaseInterval
} from './ui.js';

const state = createGameState();

// ── Старт / рестарт ──────────────────────────────
function onStart() {
  const baseInterval = getBaseInterval();
  startGame(state, baseInterval);
  rebuildLockedVisual(state.board);
  showGame();
  updateHUD(state.score, state.level, state.linesCleared);
}

// ── Пауза ────────────────────────────────────────
function onPause() {
  if (!state.isRunning) return;
  state.isPaused = !state.isPaused;
  if (state.isPaused) showPause();
  else hidePause();
}

// ── Оновлення поля після фіксації фігури ─────────
function onBoardUpdate(result) {
  rebuildLockedVisual(state.board);
  updateHUD(state.score, state.level, state.linesCleared);
  if (result.linesCleared > 0) showClearMessage(result.linesCleared);
  if (result.gameOver) showGameOver(state.score, state.level, state.linesCleared);
}

// ── Прив'язка кнопок меню ────────────────────────
bindMenuButtons({
  onStart:    onStart,
  onScores:   showScores,
  onSettings: showSettings,
  onMenu:     showMenu,
  onResume:   onPause,
});

setupControls(state, onBoardUpdate, onPause);

// ── Рендер-цикл ──────────────────────────────────
function animate(timestamp) {
  requestAnimationFrame(animate);

  if (state.isRunning && !state.isPaused) {
    const result = updateGame(state, timestamp);
    if (result.locked) onBoardUpdate(result);

    if (state.type) {
      updatePieceVisual(
        state.cells, state.ox, state.oy, state.oz,
        getColor(state.type), getGhostY(state)
      );
    }
  }

  orbitControls.update();
  renderer.render(scene, camera);
}

animate(0);
showMenu();