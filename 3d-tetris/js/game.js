import { createBoard, isValidPosition, lockPiece, clearLines } from './board.js';
import { getCells, getColor, getRandomType } from './tetromino.js';

export function createGameState() {
  const state = {
    board: createBoard(),
    type: null,
    rotation: 0,
    col: 3,
    row: 0,
    isRunning: true,
    dropInterval: 500,
    lastDropTime: 0,
    score: 0,
    linesCleared: 0,
  };
  spawnPiece(state);
  return state;
}

export function spawnPiece(state) {
  state.type = getRandomType();
  state.rotation = 0;
  state.col = 3;
  state.row = 0;

  const cells = getCells(state.type, state.rotation);
  if (!isValidPosition(state.board, cells, state.col, state.row)) {
    state.isRunning = false; // Game Over
  }
}

export function tryMove(state, dCol, dRow) {
  const cells = getCells(state.type, state.rotation);
  if (isValidPosition(state.board, cells, state.col + dCol, state.row + dRow)) {
    state.col += dCol;
    state.row += dRow;
    return true;
  }
  return false;
}

export function tryRotate(state) {
  const newRotation = (state.rotation + 1) % 4;
  const cells = getCells(state.type, newRotation);
  // Спроби обертання з wall kicks
  for (const kick of [0, -1, 1, -2, 2]) {
    if (isValidPosition(state.board, cells, state.col + kick, state.row)) {
      state.col += kick;
      state.rotation = newRotation;
      return true;
    }
  }
  return false;
}

// Повертає { locked, linesCleared, gameOver }
export function dropStep(state) {
  const cells = getCells(state.type, state.rotation);

  if (isValidPosition(state.board, cells, state.col, state.row + 1)) {
    state.row++;
    return { locked: false, linesCleared: 0, gameOver: false };
  }

  // Фіксуємо фігуру
  lockPiece(state.board, cells, state.col, state.row, getColor(state.type));
  const linesCleared = clearLines(state.board);

  const scores = [0, 100, 300, 500, 800];
  state.score += scores[linesCleared] || 0;
  state.linesCleared += linesCleared;

  spawnPiece(state);

  return { locked: true, linesCleared, gameOver: !state.isRunning };
}

export function updateGame(state, timestamp) {
  if (!state.isRunning) return { locked: false, linesCleared: 0, gameOver: false };

  if (timestamp - state.lastDropTime > state.dropInterval) {
    state.lastDropTime = timestamp;
    return dropStep(state);
  }

  return { locked: false, linesCleared: 0, gameOver: false };
}