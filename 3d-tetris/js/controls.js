import { tryMove, tryRotate, dropStep } from './game.js';

export function setupControls(state, onBoardUpdate) {
  window.addEventListener('keydown', (e) => {
    if (!state.isRunning) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        tryMove(state, -1, 0);
        break;

      case 'ArrowRight':
      case 'KeyD':
        tryMove(state, 1, 0);
        break;

      case 'ArrowDown':
      case 'KeyS': {
        const result = dropStep(state);
        if (result.locked) onBoardUpdate(result);
        break;
      }

      case 'ArrowUp':
      case 'KeyW':
        tryRotate(state);
        break;

      case 'Space': {
        e.preventDefault();
        // Hard drop — падіння до упору
        let result;
        do {
          result = dropStep(state);
        } while (!result.locked && !result.gameOver);
        onBoardUpdate(result);
        break;
      }
    }
  });
}