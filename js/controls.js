import { tryMove, tryRotateH, tryRotateF, tryRotateR, tryRotateG, dropStep } from './game.js';
import { rotateCameraLeft, rotateCameraRight } from './renderer.js';
import { loadBindings } from './bindings.js';
import { sfx } from './audio.js';

// WASD — фіксовані напрямки незалежно від камери:
// W = -Z (вглиб)   S = +Z (назовні)
// A = -X (ліво)    D = +X (право)

export function setupControls(state, onBoardUpdate, onPause) {
  window.addEventListener('keydown', (e) => {
    const b    = loadBindings();
    const code = e.code;

    // Камера — завжди працює
    if (code === b.cameraLeft)  { rotateCameraLeft();  return; }
    if (code === b.cameraRight) { rotateCameraRight(); return; }
    if (code === b.pause)       { onPause();           return; }

    if (!state.isRunning || state.isPaused) return;

    // Рух — фіксовані осі, незалежно від камери
    switch (code) {
      case 'KeyA':
        if (tryMove(state, -1, 0, 0)) sfx.move();
        return;
      case 'KeyD':
        if (tryMove(state,  1, 0, 0)) sfx.move();
        return;
      case 'KeyW':
        if (tryMove(state, 0, 0, -1)) sfx.move();
        return;
      case 'KeyS':
        if (tryMove(state, 0, 0,  1)) sfx.move();
        return;

      // Soft drop — стрілка вниз
      case 'ArrowDown': {
        sfx.softDrop();
        const r = dropStep(state);
        if (r.locked) onBoardUpdate(r);
        return;
      }
    }

    // Обертання фігури
    if (code === b.rotateH) { if (tryRotateH(state)) sfx.rotate(); return; }
    if (code === b.rotateF) { if (tryRotateF(state)) sfx.rotate(); return; }
    if (code === b.rotateR) { if (tryRotateR(state)) sfx.rotate(); return; }
    if (code === b.rotateG) { if (tryRotateG(state)) sfx.rotate(); return; }

    // Hard drop — пробіл
    if (code === b.hardDrop) {
      e.preventDefault();
      sfx.hardDrop();
      let r;
      do { r = dropStep(state); } while (!r.locked && !r.gameOver);
      state._snapVisual?.();
      onBoardUpdate(r);
      return;
    }
  });
}