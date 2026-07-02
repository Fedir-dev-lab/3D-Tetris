import { renderer, camera, orbitControls, updatePieceVisual, rebuildLockedVisual } from './renderer.js';
import { scene } from './renderer.js';
import { createGameState, updateGame, getGhostY } from './game.js';
import { getColor } from './tetromino.js';
import { setupControls } from './controls.js';

const state = createGameState();

function onBoardUpdate(result) {
  rebuildLockedVisual(state.board);
  if (result.gameOver) {
    console.log('Game Over! Рахунок:', state.score, '| Шарів:', state.linesCleared);
  }
}

setupControls(state, onBoardUpdate);

function animate(timestamp) {
  requestAnimationFrame(animate);

  const result = updateGame(state, timestamp);
  if (result.locked) onBoardUpdate(result);

  if (state.isRunning && state.type) {
    const ghostY = getGhostY(state);
    updatePieceVisual(
      state.cells, state.ox, state.oy, state.oz,
      getColor(state.type), ghostY
    );
  }

  orbitControls.update();
  renderer.render(scene, camera);
}

animate(0);