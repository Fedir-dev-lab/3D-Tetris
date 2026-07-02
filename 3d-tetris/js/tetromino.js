// Фігури визначені плоско в площині XZ (dy=0)
// Кожна клітинка: [dx, dy, dz]
const BASE_SHAPES = {
  I: { color: 0x00f0f0, cells: [[0,0,0],[1,0,0],[2,0,0],[3,0,0]] },
  O: { color: 0xf0f000, cells: [[0,0,0],[1,0,0],[0,0,1],[1,0,1]] },
  T: { color: 0xa000f0, cells: [[1,0,0],[0,0,1],[1,0,1],[2,0,1]] },
  S: { color: 0x00f000, cells: [[1,0,0],[2,0,0],[0,0,1],[1,0,1]] },
  Z: { color: 0xf00000, cells: [[0,0,0],[1,0,0],[1,0,1],[2,0,1]] },
  J: { color: 0x0000f0, cells: [[0,0,0],[0,0,1],[1,0,1],[2,0,1]] },
  L: { color: 0xf0a000, cells: [[2,0,0],[0,0,1],[1,0,1],[2,0,1]] },
};

// Нормалізація: мінімальні координати → 0
function normalize(cells) {
  const minX = Math.min(...cells.map(c => c[0]));
  const minY = Math.min(...cells.map(c => c[1]));
  const minZ = Math.min(...cells.map(c => c[2]));
  return cells.map(([x, y, z]) => [x - minX, y - minY, z - minZ]);
}

// Матриці обертання
export const rotations = {
  H:    cells => normalize(cells.map(([x,y,z]) => [ z,  y, -x])), // CW навколо Y (H)
  F:    cells => normalize(cells.map(([x,y,z]) => [-z,  y,  x])), // CCW навколо Y (F)
  R:    cells => normalize(cells.map(([x,y,z]) => [ x, -z,  y])), // навколо X вперед (R)
  G:    cells => normalize(cells.map(([x,y,z]) => [ x,  z, -y])), // навколо X назад (G)
};

export function getBaseCells(type) {
  return BASE_SHAPES[type].cells.map(c => [...c]);
}

export function getColor(type) {
  return BASE_SHAPES[type].color;
}

export function getRandomType() {
  const types = Object.keys(BASE_SHAPES);
  return types[Math.floor(Math.random() * types.length)];
}