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
  showClearMessage, updateHUD, bindMenuButtons, getBaseInterval
} from './ui.js';
import { initPreviews, setPreviewPiece, resetPreviews, renderPreviews } from './preview.js';

const state    = createGameState();
const previews = initPreviews();

// ── Старт ────────────────────────────────────────
function onStart() {
  const baseInterval = getBaseInterval();
  startGame(state, baseInterval);
  resetPreviews(previews);
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

// ── Оновлення поля після фіксації ────────────────
function onBoardUpdate(result) {
  rebuildLockedVisual(state.board);
  updateHUD(state.score, state.level, state.linesCleared);
  if (result.linesCleared > 0) showClearMessage(result.linesCleared);
  if (result.gameOver) showGameOver(state.score, state.level, state.linesCleared);

  visualOy  = state.oy;
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
let visualOy       = 0;
let prevTimestamp  = 0;
let snapNext       = false;

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

      // Оновлюємо прев'ю (лише коли тип змінився)
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

  // Рендер прев'ю (з повільним обертанням)
  renderPreviews(previews, delta);
}

animate(0);
showMenu();