const BINDINGS_KEY = 'tetris3d_bindings';

export const DEFAULT_BINDINGS = {
  moveLeft:    'KeyA',
  moveRight:   'KeyD',
  softDrop:    'KeyS',
  hardDrop:    'Space',
  rotateH:     'KeyH',
  rotateF:     'KeyF',
  rotateR:     'KeyR',
  rotateG:     'KeyG',
  cameraLeft:  'KeyQ',
  cameraRight: 'KeyE',
  pause:       'KeyP',
};

export const ACTION_LABELS = {
  moveLeft:    'Рух ліворуч',
  moveRight:   'Рух праворуч',
  softDrop:    'Прискорити',
  hardDrop:    'Хард-дроп',
  rotateH:     'Поворот Y →',
  rotateF:     'Поворот Y ←',
  rotateR:     'Поворот X ↑',
  rotateG:     'Поворот X ↓',
  cameraLeft:  'Камера ліво',
  cameraRight: 'Камера право',
  pause:       'Пауза',
};

export function loadBindings() {
  try {
    const saved = JSON.parse(localStorage.getItem(BINDINGS_KEY));
    return { ...DEFAULT_BINDINGS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_BINDINGS };
  }
}

export function saveBindings(bindings) {
  localStorage.setItem(BINDINGS_KEY, JSON.stringify(bindings));
}

export function resetBindings() {
  localStorage.removeItem(BINDINGS_KEY);
  return { ...DEFAULT_BINDINGS };
}

export function getKeyLabel(code) {
  const map = {
    Space:        'Пробіл',
    ArrowUp:      '↑',
    ArrowDown:    '↓',
    ArrowLeft:    '←',
    ArrowRight:   '→',
    ShiftLeft:    'Shift L',
    ShiftRight:   'Shift R',
    ControlLeft:  'Ctrl L',
    ControlRight: 'Ctrl R',
    AltLeft:      'Alt L',
    AltRight:     'Alt R',
    Tab:          'Tab',
    Enter:        'Enter',
    Backspace:    '⌫',
    Delete:       'Del',
    Escape:       'Esc',
  };
  if (map[code]) return map[code];
  if (code.startsWith('Key'))    return code.slice(3);
  if (code.startsWith('Digit'))  return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num' + code.slice(6);
  return code;
}