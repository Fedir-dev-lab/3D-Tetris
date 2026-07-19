import { tryMove, tryRotateH, tryRotateF, tryRotateR, tryRotateG } from './game.js';
import { rotateCameraLeft, rotateCameraRight } from './renderer.js';

const MOVE_DIRS_FIXED = {
  left:  [-1, 0, 0],
  right: [ 1, 0, 0],
};
import {
  renderer, camera, orbitControls, scene,
  updatePieceVisual, rebuildLockedVisual
} from './renderer.js';
import { createGameState, startGame, updateGame, dropStep, getGhostY } from './game.js';
import { getColor, getBaseCells } from './tetromino.js';
import { setupControls } from './controls.js';
import {
  showMenu, showGame, showPause, hidePause,
  showGameOver, showScores, showSettings, showAbout,
  showClearMessage, updateHUD, getBaseInterval,
  bindMenuButtons // <--- ОСЬ ЦЕЙ РЯДОК ОБОВ'ЯЗКОВИЙ
} from './ui.js';
import { initPreviews, setPreviewPiece, resetPreviews, renderPreviews } from './preview.js';
import { initAudio, sfx, startMusic, stopMusic } from './audio.js';
import { initMobileControls } from './mobile.js';

// ── Ініціалізація ────────────────────────────────
initAudio();

const state    = createGameState();
const previews = initPreviews();

// ── Старт / рестарт ──────────────────────────────
function onStart() {
  const baseInterval = getBaseInterval();
  startGame(state, baseInterval);
  resetPreviews(previews);
  rebuildLockedVisual(state.board);
  showGame();
  updateHUD(state.score, state.level, state.linesCleared);
  stopMusic();
  startMusic();
}

// ── Пауза ────────────────────────────────────────
function onPause() {
  if (!state.isRunning) return;
  state.isPaused = !state.isPaused;
  if (state.isPaused) showPause();
  else hidePause();
}

// ── Оновлення поля після фіксації ────────────────
function onBoardUpdate(result) {
  rebuildLockedVisual(state.board);
  updateHUD(state.score, state.level, state.linesCleared);

  if (result.locked)          sfx.lock();
  if (result.linesCleared > 0) {
    sfx.clear(result.linesCleared);
    showClearMessage(result.linesCleared);
  }
  if (result.leveledUp)       sfx.levelUp();
  if (result.gameOver) {
    sfx.gameOver();
    stopMusic();
    showGameOver(state.score, state.level, state.linesCleared);
  }

  visualOy = state.oy;
  snapNext  = false;
}

// ── Кнопки меню ──────────────────────────────────
bindMenuButtons({
  onStart:    onStart,
  onScores:   showScores,
  onSettings: showSettings,
  onAbout:    showAbout,
  onMenu:     showMenu,
  onResume:   onPause,
  onExit: () => {
    if (confirm('Справді вийти з гри?')) window.close();
  },
});

setupControls(state, onBoardUpdate, onPause);

// ── Візуальна позиція (lerp) ──────────────────────
let visualOy      = 0;
let prevTimestamp = 0;
let snapNext      = false;

state._snapVisual = () => { snapNext = true; };

// ── Рендер-цикл ──────────────────────────────────
function animate(timestamp) {
  requestAnimationFrame(animate);

  const delta = Math.min(timestamp - prevTimestamp, 100) / 1000;
  prevTimestamp = timestamp;

  if (state.isRunning && !state.isPaused) {
    const prevOy = state.oy;
    const result = updateGame(state, timestamp);

    if (result.locked) {
      onBoardUpdate(result);
    } else if (state.oy !== prevOy) {
      visualOy = prevOy;
    }

    if (state.type) {
      if (snapNext) {
        visualOy = state.oy;
        snapNext = false;
      } else {
        const tau    = Math.min(state.dropInterval * 0.35, 80) / 1000;
        const factor = 1 - Math.exp(-delta / tau);
        visualOy    += (state.oy - visualOy) * factor;
        if (Math.abs(visualOy - state.oy) < 0.008) visualOy = state.oy;
      }

      updatePieceVisual(
        state.cells, state.ox, visualOy, state.oz,
        getColor(state.type), getGhostY(state)
      );

      setPreviewPiece(previews.current, state.type, getBaseCells(state.type), getColor(state.type));
      if (state.nextType) {
        setPreviewPiece(previews.next, state.nextType, state.nextCells, getColor(state.nextType));
      }
    }
  }

  orbitControls.update();
  renderer.render(scene, camera);
  renderPreviews(previews, delta);
}

animate(0);
showMenu();

// ── Мобільне керування ────────────────────────────
initMobileControls({
  moveLeft:    () => { if (!state.isRunning || state.isPaused) return;
                       const d = MOVE_DIRS_FIXED.left;
                       if (tryMove(state, ...d)) sfx.move(); },
  moveRight:   () => { if (!state.isRunning || state.isPaused) return;
                       const d = MOVE_DIRS_FIXED.right;
                       if (tryMove(state, ...d)) sfx.move(); },
  moveForward: () => { if (!state.isRunning || state.isPaused) return;
                       if (tryMove(state, 0, 0, -1)) sfx.move(); },
  moveBack:    () => { if (!state.isRunning || state.isPaused) return;
                       if (tryMove(state, 0, 0,  1)) sfx.move(); },
  rotateH: () => { if (!state.isRunning || state.isPaused) return;
                   if (tryRotateH(state)) sfx.rotate(); },
  rotateF: () => { if (!state.isRunning || state.isPaused) return;
                   if (tryRotateF(state)) sfx.rotate(); },
  rotateR: () => { if (!state.isRunning || state.isPaused) return;
                   if (tryRotateR(state)) sfx.rotate(); },
  rotateG: () => { if (!state.isRunning || state.isPaused) return;
                   if (tryRotateG(state)) sfx.rotate(); },
  softDrop: () => {
    if (!state.isRunning || state.isPaused) return;
    sfx.softDrop();
    const r = dropStep(state);
    if (r.locked) onBoardUpdate(r);
  },
  hardDrop: () => {
    if (!state.isRunning || state.isPaused) return;
    sfx.hardDrop();
    let r;
    do { r = dropStep(state); } while (!r.locked && !r.gameOver);
    state._snapVisual?.();
    onBoardUpdate(r);
  },
  cameraLeft:  () => rotateCameraLeft(),
  cameraRight: () => rotateCameraRight(),
  pause:       () => onPause(),
});