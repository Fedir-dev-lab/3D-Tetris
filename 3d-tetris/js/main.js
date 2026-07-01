import { scene, camera, renderer, controls, updatePieceVisual, rebuildLockedVisual } from './renderer.js';
import { createGameState, updateGame, dropStep } from './game.js';
import { getCells, getColor } from './tetromino.js';
import { setupControls } from './controls.js';

const state = createGameState();

function onBoardUpdate(result) {
  rebuildLockedVisual(state.board);
  if (result.gameOver) {
    console.log('Game Over! Рахунок:', state.score, '| Ліній:', state.linesCleared);
  }
}

setupControls(state, onBoardUpdate);

function animate(timestamp) {
  requestAnimationFrame(animate);

  const result = updateGame(state, timestamp);
  if (result.locked) onBoardUpdate(result);

  // Оновлюємо візуал поточної фігури кожен кадр
  if (state.isRunning && state.type) {
    updatePieceVisual(
      getCells(state.type, state.rotation),
      state.col,
      state.row,
      getColor(state.type)
    );
  }

  controls.update();
  renderer.render(scene, camera);
}

animate(0);