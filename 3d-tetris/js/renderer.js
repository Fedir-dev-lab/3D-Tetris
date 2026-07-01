import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE, gridToWorld } from './board.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 28);
camera.lookAt(0, 10, 0);

const canvas = document.getElementById('game-canvas');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Освітлення
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 30, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// Камера з обертанням мишею
export const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
controls.enableDamping = true;

// Рамка поля
const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE));
const borderMat = new THREE.LineBasicMaterial({ color: 0x555555 });
const border = new THREE.LineSegments(borderGeo, borderMat);
border.position.set(0, BOARD_HEIGHT / 2, 0);
scene.add(border);

// Підлога
const floorGeo = new THREE.PlaneGeometry(BOARD_WIDTH, BOARD_WIDTH);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Група для поточної фігури
export const pieceMeshGroup = new THREE.Group();
scene.add(pieceMeshGroup);

// Група для зафіксованих блоків
export const lockedMeshGroup = new THREE.Group();
scene.add(lockedMeshGroup);

// Оновлює візуал поточної фігури (викликається кожен кадр)
export function updatePieceVisual(cells, col, row, color) {
  // Синхронізуємо кількість мешів
  while (pieceMeshGroup.children.length > cells.length) {
    pieceMeshGroup.remove(pieceMeshGroup.children[pieceMeshGroup.children.length - 1]);
  }
  while (pieceMeshGroup.children.length < cells.length) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE),
      new THREE.MeshStandardMaterial({ color })
    );
    mesh.castShadow = true;
    pieceMeshGroup.add(mesh);
  }

  // Позиціонуємо кубики
  const origin = gridToWorld(col, row);
  cells.forEach(([c, r], i) => {
    const mesh = pieceMeshGroup.children[i];
    mesh.material.color.setHex(color);
    mesh.position.set(
      origin.x + c * CELL_SIZE,
      origin.y - r * CELL_SIZE,
      0
    );
  });
}

// Перебудовує зафіксовані блоки (викликається лише коли фігура фіксується)
export function rebuildLockedVisual(board) {
  while (lockedMeshGroup.children.length > 0) {
    lockedMeshGroup.remove(lockedMeshGroup.children[0]);
  }

  const geo = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    for (let c = 0; c < BOARD_WIDTH; c++) {
      const color = board[r][c];
      if (color !== null) {
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));
        const world = gridToWorld(c, r);
        mesh.position.set(world.x, world.y, 0);
        mesh.receiveShadow = true;
        lockedMeshGroup.add(mesh);
      }
    }
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});