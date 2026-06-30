import * as THREE from 'three';

// Форми фігур: масив [x, y] координат клітинок у локальній 4x4 сітці
export const SHAPES = {
  I: { cells: [[0,1],[1,1],[2,1],[3,1]], color: 0x00f0f0 },
  O: { cells: [[1,0],[2,0],[1,1],[2,1]], color: 0xf0f000 },
  T: { cells: [[1,0],[0,1],[1,1],[2,1]], color: 0xa000f0 },
  S: { cells: [[1,0],[2,0],[0,1],[1,1]], color: 0x00f000 },
  Z: { cells: [[0,0],[1,0],[1,1],[2,1]], color: 0xf00000 },
  J: { cells: [[0,0],[0,1],[1,1],[2,1]], color: 0x0000f0 },
  L: { cells: [[2,0],[0,1],[1,1],[2,1]], color: 0xf0a000 },
};

const CELL_SIZE = 1;

export function createTetrominoMesh(type) {
  const shape = SHAPES[type];
  const group = new THREE.Group();
  group.userData.type = type;

  const geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
  const material = new THREE.MeshStandardMaterial({ color: shape.color });

  shape.cells.forEach(([x, y]) => {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x * CELL_SIZE, -y * CELL_SIZE, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    group.add(cube);
  });

  return group;
}

export function getRandomType() {
  const types = Object.keys(SHAPES);
  return types[Math.floor(Math.random() * types.length)];
}