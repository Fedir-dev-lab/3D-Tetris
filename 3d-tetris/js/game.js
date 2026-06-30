const CELL_SIZE = 1;
let dropInterval = 500;
let lastDropTime = 0;

export function dropStep(piece, shapeHeight) {
  const floorY = shapeHeight * CELL_SIZE + 0.5;

  if (piece.position.y - CELL_SIZE > floorY) {
    piece.position.y -= CELL_SIZE;
  } else {
    piece.position.y = floorY;
  }
}

export function updateGame(piece, timestamp, shapeHeight) {
  if (timestamp - lastDropTime > dropInterval) {
    lastDropTime = timestamp;
    dropStep(piece, shapeHeight);
  }
}