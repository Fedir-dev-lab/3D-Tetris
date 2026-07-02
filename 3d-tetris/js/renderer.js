import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BOARD_W, BOARD_D, BOARD_H, CELL_SIZE, gridToWorld } from './board.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080818);

export const camera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight, 0.1, 300
);
const boardCenterY = (BOARD_H * CELL_SIZE) / 2;
camera.position.set(14, boardCenterY + 8, 14);

const canvas = document.getElementById('game-canvas');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Освітлення
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(15, 30, 15);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
fillLight.position.set(-10, 10, -10);
scene.add(fillLight);

// Orbit controls
export const orbitControls = new OrbitControls(camera, renderer.domElement);
const boardCenter = new THREE.Vector3(0, boardCenterY, 0);
orbitControls.target.copy(boardCenter);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.08;
orbitControls.update();

// Рамка поля (сітка)
function buildBoardLines() {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: 0x1a2a4a, transparent: true, opacity: 0.8 });
  const halfW = (BOARD_W * CELL_SIZE) / 2;
  const halfD = (BOARD_D * CELL_SIZE) / 2;
  const H = BOARD_H * CELL_SIZE;

  // Підлога — сітка
  for (let i = 0; i <= BOARD_W; i++) {
    const x = -halfW + i * CELL_SIZE;
    const pts = [new THREE.Vector3(x, 0, -halfD), new THREE.Vector3(x, 0, halfD)];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  for (let i = 0; i <= BOARD_D; i++) {
    const z = -halfD + i * CELL_SIZE;
    const pts = [new THREE.Vector3(-halfW, 0, z), new THREE.Vector3(halfW, 0, z)];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // Вертикальні лінії по кутах
  for (const [x, z] of [[-halfW,-halfD],[-halfW,halfD],[halfW,-halfD],[halfW,halfD]]) {
    const pts = [new THREE.Vector3(x, 0, z), new THREE.Vector3(x, H, z)];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // Верхня рамка
  const top = [
    [-halfW, H, -halfD], [halfW, H, -halfD],
    [halfW, H, halfD], [-halfW, H, halfD], [-halfW, H, -halfD]
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(top), mat));

  return group;
}
scene.add(buildBoardLines());

// Підлога
const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(BOARD_W, BOARD_D),
  new THREE.MeshStandardMaterial({ color: 0x0d0d22, roughness: 1 })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.set(0, 0.01, 0);
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// Групи мешів
export const pieceMeshGroup = new THREE.Group();
export const ghostMeshGroup = new THREE.Group();
export const lockedMeshGroup = new THREE.Group();
scene.add(pieceMeshGroup, ghostMeshGroup, lockedMeshGroup);

const cubeGeo = new THREE.BoxGeometry(CELL_SIZE * 0.9, CELL_SIZE * 0.9, CELL_SIZE * 0.9);

function syncGroup(group, count, color, opacity) {
  // Додаємо яких не вистачає
  while (group.children.length < count) {
    const mesh = new THREE.Mesh(
      cubeGeo,
      new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.2 })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  // Оновлюємо всі
  for (let i = 0; i < group.children.length; i++) {
    const m = group.children[i];
    m.visible = i < count;
    if (i < count) {
      m.material.color.setHex(color);
      m.material.opacity = opacity;
      m.material.transparent = opacity < 1;
    }
  }
}

export function updatePieceVisual(cells, ox, oy, oz, color, ghostY) {
  syncGroup(pieceMeshGroup, cells.length, color, 1.0);
  syncGroup(ghostMeshGroup, cells.length, color, 0.18);

  cells.forEach(([dx, dy, dz], i) => {
    const w = gridToWorld(ox + dx, oy + dy, oz + dz);
    pieceMeshGroup.children[i].position.set(w.x, w.y, w.z);

    const gw = gridToWorld(ox + dx, ghostY + dy, oz + dz);
    ghostMeshGroup.children[i].position.set(gw.x, gw.y, gw.z);
  });
}

export function rebuildLockedVisual(board) {
  while (lockedMeshGroup.children.length > 0) {
    lockedMeshGroup.remove(lockedMeshGroup.children[0]);
  }
  for (let y = 0; y < BOARD_H; y++) {
    for (let z = 0; z < BOARD_D; z++) {
      for (let x = 0; x < BOARD_W; x++) {
        const color = board[y][z][x];
        if (color !== null) {
          const mesh = new THREE.Mesh(
            cubeGeo,
            new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 })
          );
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const w = gridToWorld(x, y, z);
          mesh.position.set(w.x, w.y, w.z);
          lockedMeshGroup.add(mesh);
        }
      }
    }
  }
}

let cameraStep = 0; // 0=NE, 1=NW, 2=SW, 3=SE

export function getCameraStep() { return cameraStep; }

export function rotateCameraLeft() {
  // Q — поворот камери на 90° проти годинникової стрілки
  const t = orbitControls.target;
  const p = camera.position.clone().sub(t);
  // CCW 90°: x' = -z, z' = x
  camera.position.set(-p.z + t.x, p.y + t.y, p.x + t.z);
  cameraStep = (cameraStep + 1) % 4;
  orbitControls.update();
}

export function rotateCameraRight() {
  // E — поворот камери на 90° за годинниковою стрілкою
  const t = orbitControls.target;
  const p = camera.position.clone().sub(t);
  // CW 90°: x' = z, z' = -x
  camera.position.set(p.z + t.x, p.y + t.y, -p.x + t.z);
  cameraStep = (cameraStep + 3) % 4;
  orbitControls.update();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});