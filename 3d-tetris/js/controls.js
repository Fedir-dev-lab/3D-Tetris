import { tryMove, tryRotateH, tryRotateF, tryRotateR, tryRotateG, dropStep } from './game.js';
import { rotateCameraLeft, rotateCameraRight, getCameraStep } from './renderer.js';

const MOVE_DIRS = [
  { A: [-1, 0, 0], D: [ 1, 0, 0] },
  { A: [ 0, 0,-1], D: [ 0, 0, 1] },
  { A: [ 1, 0, 0], D: [-1, 0, 0] },
  { A: [ 0, 0, 1], D: [ 0, 0,-1] },
];

export function setupControls(state, onBoardUpdate, onPause) {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyQ') { rotateCameraLeft();  return; }
    if (e.code === 'KeyE') { rotateCameraRight(); return; }
    if (e.code === 'KeyP') { onPause(); return; }

    if (!state.isRunning || state.isPaused) return;

    const dir = MOVE_DIRS[getCameraStep()];

    switch (e.code) {
      case 'KeyA': tryMove(state, ...dir.A); break;
      case 'KeyD': tryMove(state, ...dir.D); break;

      case 'KeyS':
      case 'ArrowDown': {
        const r = dropStep(state);
        if (r.locked) onBoardUpdate(r);
        break;
      }

      case 'KeyH': tryRotateH(state); break;
      case 'KeyF': tryRotateF(state); break;
      case 'KeyR': tryRotateR(state); break;
      case 'KeyG': tryRotateG(state); break;

      case 'Space': {
        e.preventDefault();
        let r;
        do { r = dropStep(state); } while (!r.locked && !r.gameOver);
        onBoardUpdate(r);
        break;
      }
    }
  });
}