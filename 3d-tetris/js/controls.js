import { tryMove, tryRotateH, tryRotateF, tryRotateR, tryRotateG, dropStep } from './game.js';
import { rotateCameraLeft, rotateCameraRight, getCameraStep } from './renderer.js';

// A/D рухають фігуру відносно поточного кута камери
// Камера може бути в 4 позиціях (NE, NW, SW, SE) — по 90° кожна
const MOVE_DIRS = [
  { A: [-1, 0,  0], D: [ 1, 0,  0] }, // step 0: NE — рух по X
  { A: [ 0, 0, -1], D: [ 0, 0,  1] }, // step 1: NW — рух по Z
  { A: [ 1, 0,  0], D: [-1, 0,  0] }, // step 2: SW — рух по X навпаки
  { A: [ 0, 0,  1], D: [ 0, 0, -1] }, // step 3: SE — рух по Z навпаки
];

export function setupControls(state, onBoardUpdate) {
  window.addEventListener('keydown', (e) => {

    // Камера — працює завжди, навіть після Game Over
    if (e.code === 'KeyQ') { rotateCameraLeft();  return; }
    if (e.code === 'KeyE') { rotateCameraRight(); return; }

    if (!state.isRunning) return;

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

      case 'KeyH': tryRotateH(state); break; // поворот фігури вправо (навколо Y)
      case 'KeyF': tryRotateF(state); break; // поворот фігури вліво (навколо Y)
      case 'KeyR': tryRotateR(state); break; // поворот фігури вгору (навколо X)
      case 'KeyG': tryRotateG(state); break; // поворот фігури вниз (навколо X)

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