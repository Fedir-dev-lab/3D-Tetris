export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const CELL_SIZE = 1;

export function createBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

// Координати сітки → координати Three.js
export function gridToWorld(col, row) {
  return {
    x: (col - BOARD_WIDTH / 2 + 0.5) * CELL_SIZE,
    y: (BOARD_HEIGHT - 1 - row) * CELL_SIZE + 0.5
  };
}

export function isValidPosition(board, cells, offsetCol, offsetRow) {
  for (const [col, row] of cells) {
    const c = col + offsetCol;
    const r = row + offsetRow;
    if (c < 0 || c >= BOARD_WIDTH) return false;
    if (r >= BOARD_HEIGHT) return false;
    if (r >= 0 && board[r][c] !== null) return false;
  }
  return true;
}

export function lockPiece(board, cells, offsetCol, offsetRow, color) {
  for (const [col, row] of cells) {
    const c = col + offsetCol;
    const r = row + offsetRow;
    if (r >= 0) board[r][c] = color;
  }
}

export function clearLines(board) {
  let cleared = 0;
  for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== null)) {
      board.splice(r, 1);
      board.unshift(Array(BOARD_WIDTH).fill(null));
      cleared++;
      r++;
    }
  }
  return cleared;
}