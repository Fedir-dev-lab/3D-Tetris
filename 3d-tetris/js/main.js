import { scene, camera, renderer, controls } from './renderer.js';
import { updateGame } from './game.js';
import { createTetrominoMesh, getRandomType, getShapeHeight } from './tetromino.js';

const type = getRandomType();
const piece = createTetrominoMesh(type);
const shapeHeight = getShapeHeight(type);

piece.position.set(-1, 9, 0);
scene.add(piece);

function animate(timestamp) {
  requestAnimationFrame(animate);

  updateGame(piece, timestamp, shapeHeight);

  controls.update();
  renderer.render(scene, camera);
}

animate(0);