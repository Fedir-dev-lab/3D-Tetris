import { createBoard, isValidPosition, lockPiece, clearLayers, BOARD_W, BOARD_D } from './board.js';
import { getBaseCells, getColor, getRandomType, rotations } from './tetromino.js';

// Швидкість за рівнем (мс між кроками)
const LEVEL_SPEEDS = [800,700,600,500,420,350,280,220,160,100];

function getSpeed(level) {
  return LEVEL_SPEEDS[Math.min(level - 1, LEVEL_SPEEDS.length - 1)];
}

export function createGameState() {
  const state = {
    board: createBoard(),
    type: null,
    cells: null,
    ox: 0, oy: 0, oz: 0,
    isRunning: false,
    isPaused: false,
    dropInterval: LEVEL_SPEEDS[0],
    lastDropTime: 0,
    score: 0,
    linesCleared: 0,
    level: 1,
  };
  return state;
}

export function startGame(state) {
  state.board = createBoard();
  state.score = 0;
  state.linesCleared = 0;
  state.level = 1;
  state.dropInterval = getSpeed(1);
  state.isRunning = true;
  state.isPaused = false;
  state.lastDropTime = 0;
  spawnPiece(state);
}

function spawnPiece(state) {
  state.type = getRandomType();
  state.cells = getBaseCells(state.type);
  const maxX = Math.max(...state.cells.map(c => c[0]));
  const maxZ = Math.max(...state.cells.map(c => c[2]));
  state.ox = Math.floor((BOARD_W - maxX - 1) / 2);
  state.oz = Math.floor((BOARD_D - maxZ - 1) / 2);
  state.oy = 0;
  if (!isValidPosition(state.board, state.cells, state.ox, state.oy, state.oz)) {
    state.isRunning = false;
  }
}

export function tryMove(state, dx, dy, dz) {
  if (isValidPosition(state.board, state.cells, state.ox+dx, state.oy+dy, state.oz+dz)) {
    state.ox += dx; state.oy += dy; state.oz += dz;
    return true;
  }
  return false;
}

function tryApplyRotation(state, rotFn) {
  const newCells = rotFn(state.cells);
  for (const [kdx, kdz] of [[0,0],[-1,0],[1,0],[0,-1],[0,1],[-2,0],[2,0],[0,-2],[0,2]]) {
    if (isValidPosition(state.board, newCells, state.ox+kdx, state.oy, state.oz+kdz)) {
      state.cells = newCells;
      state.ox += kdx;
      state.oz += kdz;
      return true;
    }
  }
  return false;
}

export function tryRotateH(state) { return tryApplyRotation(state, rotations.H); }
export function tryRotateF(state) { return tryApplyRotation(state, rotations.F); }
export function tryRotateR(state) { return tryApplyRotation(state, rotations.R); }
export function tryRotateG(state) { return tryApplyRotation(state, rotations.G); }

export function getGhostY(state) {
  let gy = state.oy;
  while (isValidPosition(state.board, state.cells, state.ox, gy + 1, state.oz)) gy++;
  return gy;
}

export function dropStep(state) {
  if (!isValidPosition(state.board, state.cells, state.ox, state.oy + 1, state.oz)) {
    lockPiece(state.board, state.cells, state.ox, state.oy, state.oz, getColor(state.type));
    const cleared = clearLayers(state.board);

    const SCORES = [0, 100, 300, 500, 800];
    state.score += (SCORES[Math.min(cleared, 4)] || 0) * state.level;
    state.linesCleared += cleared;

    // Рівень — кожні 10 ліній
    const newLevel = Math.floor(state.linesCleared / 10) + 1;
    if (newLevel !== state.level) {
      state.level = newLevel;
      state.dropInterval = getSpeed(newLevel);
    }

    spawnPiece(state);
    return { locked: true, linesCleared: cleared, gameOver: !state.isRunning };
  }
  state.oy++;
  return { locked: false, linesCleared: 0, gameOver: false };
}

export function updateGame(state, timestamp) {
  if (!state.isRunning || state.isPaused) {
    return { locked: false, linesCleared: 0, gameOver: false };
  }
  if (timestamp - state.lastDropTime > state.dropInterval) {
    state.lastDropTime = timestamp;
    return dropStep(state);
  }
  return { locked: false, linesCleared: 0, gameOver: false };
}