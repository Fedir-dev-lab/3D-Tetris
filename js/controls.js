import { tryMove, tryRotateH, tryRotateF, tryRotateR, tryRotateG, dropStep } from './game.js';
import { rotateCameraLeft, rotateCameraRight, getCameraStep } from './renderer.js';
import { loadBindings } from './bindings.js';

const MOVE_DIRS = [
  { moveLeft: [-1,0, 0], moveRight: [ 1,0, 0] },
  { moveLeft: [ 0,0,-1], moveRight: [ 0,0, 1] },
  { moveLeft: [ 1,0, 0], moveRight: [-1,0, 0] },
  { moveLeft: [ 0,0, 1], moveRight: [ 0,0,-1] },
];

export function setupControls(state, onBoardUpdate, onPause) {
  window.addEventListener('keydown', (e) => {
    const b    = loadBindings();
    const code = e.code;

    if (code === b.cameraLeft)  { rotateCameraLeft();  return; }
    if (code === b.cameraRight) { rotateCameraRight(); return; }
    if (code === b.pause)       { onPause();           return; }

    if (!state.isRunning || state.isPaused) return;

    const dir = MOVE_DIRS[getCameraStep()];

    if (code === b.moveLeft)  { tryMove(state, ...dir.moveLeft);  return; }
    if (code === b.moveRight) { tryMove(state, ...dir.moveRight); return; }

    if (code === b.softDrop) {
      const r = dropStep(state);
      if (r.locked) onBoardUpdate(r);
      return;
    }

    if (code === b.rotateH) { tryRotateH(state); return; }
    if (code === b.rotateF) { tryRotateF(state); return; }
    if (code === b.rotateR) { tryRotateR(state); return; }
    if (code === b.rotateG) { tryRotateG(state); return; }

    if (code === b.hardDrop) {
      e.preventDefault();
      let r;
      do { r = dropStep(state); } while (!r.locked && !r.gameOver);
      state._snapVisual?.();
      onBoardUpdate(r);
      return;
    }
  });
}