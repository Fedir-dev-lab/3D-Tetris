import * as THREE from 'three';
import { scene, camera, renderer, controls } from './renderer.js';
import { updateGame } from './game.js';

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
const cube = new THREE.Mesh(geometry, material);

cube.position.set(0, 9, 0); // стартуємо вище, щоб бачити падіння
cube.castShadow = true;
cube.receiveShadow = true;

scene.add(cube);

function animate(timestamp) {
  requestAnimationFrame(animate);

  updateGame(cube, timestamp);

  controls.update();
  renderer.render(scene, camera);
}

animate(0);
