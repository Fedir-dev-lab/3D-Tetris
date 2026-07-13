import {
  renderer, camera, orbitControls, scene,
  updatePieceVisual, rebuildLockedVisual
} from './renderer.js';
import { createGameState, startGame, updateGame, dropStep, getGhostY } from './game.js';
import { getColor } from './tetromino.js';
import { setupControls } from './controls.js';
import {
  showMenu, showGame, showPause, hidePause,
  showGameOver, showScores, showSettings, showClearMessage,
  updateHUD, bindMenuButtons, getBaseInterval
} from './ui.js';

const state = createGameState();

// Візуальна позиція — лише для рендера, логіка її не знає
let visualOy = 0;
let prevTimestamp = 0;
let snapNext = false; // миттєвий стрибок (після hard drop)

// ── Старт ────────────────────────────────────────
function onStart() {
  const baseInterval = getBaseInterval();
  startGame(state, baseInterval);
  visualOy = state.oy;
  snapNext = false;
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

  // Після фіксації — нова фігура зверху, стрибаємо без анімації
  visualOy = state.oy;
  snapNext = false;
}

// ── Кнопки меню ──────────────────────────────────
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

  const delta = Math.min(timestamp - prevTimestamp, 100); // cap щоб не стрибало після blur
  prevTimestamp = timestamp;

  if (state.isRunning && !state.isPaused) {
    const prevOy = state.oy;
    const result = updateGame(state, timestamp);

    if (result.locked) {
      onBoardUpdate(result);
    } else if (state.oy !== prevOy) {
      // Логічний крок відбувся — запускаємо анімацію з попередньої позиції
      visualOy = prevOy;
    }

    if (state.type) {
      if (snapNext) {
        // Hard drop або пробіл — миттєвий стрибок
        visualOy = state.oy;
        snapNext = false;
      } else {
        // Lerp: часова константа ~60мс — встигає за будь-якого dropInterval
        const tau = Math.min(state.dropInterval * 0.35, 80);
        const factor = 1 - Math.exp(-delta / tau);
        visualOy += (state.oy - visualOy) * factor;

        // Snap якщо дуже близько
        if (Math.abs(visualOy - state.oy) < 0.008) visualOy = state.oy;
      }

      updatePieceVisual(
        state.cells, state.ox, visualOy, state.oz,
        getColor(state.type), getGhostY(state)
      );
    }
  }

  orbitControls.update();
  renderer.render(scene, camera);
}

// Передаємо snap-функцію в controls через глобальний стан
state._snapVisual = () => { snapNext = true; };

animate(0);
showMenu();