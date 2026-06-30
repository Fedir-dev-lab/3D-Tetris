export function setupControls(piece, onMoveDown) {
  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        piece.position.x -= 1;
        break;

      case 'ArrowRight':
      case 'KeyD':
        piece.position.x += 1;
        break;

      case 'ArrowDown':
      case 'KeyS':
        onMoveDown(); // примусовий крок падіння (soft drop)
        break;

      case 'ArrowUp':
      case 'KeyW':
        piece.rotation.z += Math.PI / 2; // поки проста візуальна ротація
        break;

      case 'Space':
        e.preventDefault(); // щоб сторінка не скролилась
        // хард-дроп зробимо пізніше, коли буде board.js з колізіями
        break;
    }
  });
}