import {
  renderer, camera, orbitControls, scene,
  updatePieceVisual, rebuildLockedVisual,
  rotateCameraLeft, rotateCameraRight
} from './renderer.js';
import {
  createGameState, startGame, updateGame,
  dropStep, getGhostY,
  tryMove, tryRotateH, tryRotateF, tryRotateR, tryRotateG
} from './game.js';
import { getColor, getBaseCells } from './tetromino.js';
import { setupControls } from './controls.js';
import {
  showMenu, showGame, showPause, hidePause,
  showGameOver, showScores, showSettings, showAbout,
  showClearMessage, updateHUD, bindMenuButtons, getBaseInterval, loadSettings,
  updateFullscreenButton
} from './ui.js';
import { setRendererTheme } from './renderer.js';
import { initPreviews, setPreviewPiece, resetPreviews, renderPreviews } from './preview.js';
import { initAudio, sfx, startMusic, stopMusic } from './audio.js';
import { initMobileControls } from './mobile.js';

// ── Константи руху ────────────────────────────────
const MOVE_LEFT    = [-1, 0,  0];
const MOVE_RIGHT   = [ 1, 0,  0];
const MOVE_FORWARD = [ 0, 0, -1];
const MOVE_BACK    = [ 0, 0,  1];

// ── Ініціалізація ────────────────────────────────
initAudio();

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.classList.toggle('light-theme', isLight);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isLight ? '#f3f6fc' : '#3f2e6b');
  setRendererTheme(theme);
}

async function toggleFullscreen() {
  const root = document.documentElement;
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen;

  try {
    if (root.classList.contains('mobile-fullscreen')) {
      root.classList.remove('mobile-fullscreen');
      updateFullscreenButton(false);
    } else if (fullscreenElement && exit) {
      await exit.call(document);
    } else if (request) {
      await request.call(root);
    } else {
      // iOS Safari до підтримки Fullscreen API: використовуємо весь доступний viewport.
      root.classList.add('mobile-fullscreen');
      window.scrollTo(0, 1);
      updateFullscreenButton(true);
    }
  } catch (error) {
    // Деякі мобільні браузери мають API, але забороняють його для сторінки.
    root.classList.add('mobile-fullscreen');
    window.scrollTo(0, 1);
    updateFullscreenButton(true);
    console.warn('Нативний повноекранний режим недоступний, увімкнено режим viewport:', error);
  }
}

function syncFullscreenState() {
  updateFullscreenButton(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
}

document.addEventListener('fullscreenchange', syncFullscreenState);
document.addEventListener('webkitfullscreenchange', syncFullscreenState);

applyTheme(loadSettings().theme);

const state    = createGameState();
const previews = initPreviews();

// ── Візуальна позиція (lerp) ──────────────────────
let visualOy      = 0;
let prevTimestamp = 0;
let snapNext      = false;

state._snapVisual = () => { snapNext = true; };

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

  if (result.locked)           sfx.lock();
  if (result.linesCleared > 0) {
    sfx.clear(result.linesCleared);
    showClearMessage(result.linesCleared);
  }
  if (result.leveledUp)        sfx.levelUp();
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
  onThemeChange: applyTheme,
  onFullscreen: toggleFullscreen,
});

setupControls(state, onBoardUpdate, onPause);

// ── Мобільне керування ────────────────────────────
initMobileControls({
  moveLeft: () => {
    if (!state.isRunning || state.isPaused) return;
    if (tryMove(state, ...MOVE_LEFT)) sfx.move();
  },
  moveRight: () => {
    if (!state.isRunning || state.isPaused) return;
    if (tryMove(state, ...MOVE_RIGHT)) sfx.move();
  },
  moveForward: () => {
    if (!state.isRunning || state.isPaused) return;
    if (tryMove(state, ...MOVE_FORWARD)) sfx.move();
  },
  moveBack: () => {
    if (!state.isRunning || state.isPaused) return;
    if (tryMove(state, ...MOVE_BACK)) sfx.move();
  },
  rotateH: () => {
    if (!state.isRunning || state.isPaused) return;
    if (tryRotateH(state)) sfx.rotate();
  },
  rotateF: () => {
    if (!state.isRunning || state.isPaused) return;
    if (tryRotateF(state)) sfx.rotate();
  },
  rotateR: () => {
    if (!state.isRunning || state.isPaused) return;
    if (tryRotateR(state)) sfx.rotate();
  },
  rotateG: () => {
    if (!state.isRunning || state.isPaused) return;
    if (tryRotateG(state)) sfx.rotate();
  },
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
  fullscreen:  () => toggleFullscreen(),
  pause:       () => onPause(),
});

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

      setPreviewPiece(
        previews.current,
        state.type,
        getBaseCells(state.type),
        getColor(state.type)
      );
      if (state.nextType) {
        setPreviewPiece(
          previews.next,
          state.nextType,
          state.nextCells,
          getColor(state.nextType)
        );
      }
    }
  }

  orbitControls.update();
  renderer.render(scene, camera);
  renderPreviews(previews, delta);
}

animate(0);
showMenu();
