export const BOARD_W = 6;
export const BOARD_D = 6;
export const BOARD_H = 20;
export const CELL_SIZE = 1;

export function createBoard() {
  return Array.from({ length: BOARD_H }, () =>
    Array.from({ length: BOARD_D }, () =>
      Array(BOARD_W).fill(null)
    )
  );
}

// Сітка → світові координати Three.js
export function gridToWorld(gx, gy, gz) {
  return {
    x: (gx - BOARD_W / 2 + 0.5) * CELL_SIZE,
    y: (BOARD_H - 1 - gy) * CELL_SIZE + 0.5,
    z: (gz - BOARD_D / 2 + 0.5) * CELL_SIZE,
  };
}

export function isValidPosition(board, cells, ox, oy, oz) {
  for (const [dx, dy, dz] of cells) {
    const x = ox + dx, y = oy + dy, z = oz + dz;
    if (x < 0 || x >= BOARD_W || z < 0 || z >= BOARD_D) return false;
    if (y >= BOARD_H) return false;
    if (y >= 0 && board[y][z][x] !== null) return false;
  }
  return true;
}

export function lockPiece(board, cells, ox, oy, oz, color) {
  for (const [dx, dy, dz] of cells) {
    const x = ox + dx, y = oy + dy, z = oz + dz;
    if (y >= 0 && y < BOARD_H && z >= 0 && z < BOARD_D && x >= 0 && x < BOARD_W) {
      board[y][z][x] = color;
    }
  }
}

export function clearLayers(board) {
  let cleared = 0;
  for (let y = BOARD_H - 1; y >= 0; y--) {
    if (board[y].every(row => row.every(c => c !== null))) {
      board.splice(y, 1);
      board.unshift(Array.from({ length: BOARD_D }, () => Array(BOARD_W).fill(null)));
      cleared++;
      y++;
    }
  }
  return cleared;
}