import * as THREE from 'three';
import { CELL_SIZE } from './board.js';

const GEO = new THREE.BoxGeometry(
  CELL_SIZE * 0.88,
  CELL_SIZE * 0.88,
  CELL_SIZE * 0.88
);

function createPreviewScene(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(120, 120);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  // Ізометрична камера
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(4.5, 3.5, 4.5);
  camera.lookAt(0, 0, 0);

  // Освітлення
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(5, 8, 5);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0x4466ff, 0.2);
  fill.position.set(-5, 2, -5);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);

  return { renderer, scene, camera, group, currentType: null };
}

export function initPreviews() {
  return {
    current: createPreviewScene('current-canvas'),
    next:    createPreviewScene('next-canvas'),
  };
}

function rebuildGroup(previewObj, cells, color) {
  const { group } = previewObj;

  // Очищаємо попередні меші
  while (group.children.length > 0) group.remove(group.children[0]);
  if (!cells?.length) return;

  // Центруємо фігуру в кадрі
  const xs = cells.map(c => c[0]);
  const ys = cells.map(c => c[1]);
  const zs = cells.map(c => c[2]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.2,
  });

  cells.forEach(([dx, dy, dz]) => {
    const m = new THREE.Mesh(GEO, mat.clone());
    m.position.set(
      (dx - cx) * CELL_SIZE,
      (dy - cy) * CELL_SIZE,
      (dz - cz) * CELL_SIZE
    );
    group.add(m);
  });
}

// Оновлюємо прев'ю лише коли змінився тип фігури
export function setPreviewPiece(previewObj, type, cells, color) {
  if (!previewObj || previewObj.currentType === type) return;
  previewObj.currentType = type;
  rebuildGroup(previewObj, cells, color);
}

// Скидаємо при старті нової гри
export function resetPreviews(previews) {
  if (previews.current) previews.current.currentType = null;
  if (previews.next)    previews.next.currentType    = null;
}

// Рендеримо обидва прев'ю (з повільним обертанням)
export function renderPreviews(previews, delta) {
  const angle = delta * 0.5;
  for (const p of Object.values(previews)) {
    if (!p) continue;
    p.group.rotation.y += angle;
    p.renderer.render(p.scene, p.camera);
  }
}