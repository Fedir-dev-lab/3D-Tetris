const CELL_SIZE = 1;
const FLOOR_Y = 0.5; // центр кубика на половині висоти над підлогою
let dropInterval = 500;
let lastDropTime = 0;

export function updateGame(cube, timestamp) {
  if (timestamp - lastDropTime > dropInterval) {
    lastDropTime = timestamp;

    if (cube.position.y - CELL_SIZE > FLOOR_Y) {
      cube.position.y -= CELL_SIZE;
    } else {
      cube.position.y = FLOOR_Y;
    }
  }
}