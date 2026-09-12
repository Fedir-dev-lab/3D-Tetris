const BINDINGS_KEY = 'tetris3d_bindings';

export const DEFAULT_BINDINGS = {
  moveLeft:    'KeyA',
  moveRight:   'KeyD',
  moveForward: 'KeyW',
  moveBack:    'KeyS',
  hardDrop:    'Space',
  rotateH:     'KeyH',
  rotateF:     'KeyF',
  rotateR:     'KeyR',
  rotateG:     'KeyG',
  cameraLeft:  'KeyQ',
  cameraRight: 'KeyE',
  pause:       'KeyP',
};

const ACTION_LABELS = {
  moveLeft:    'Рух ліворуч  (X-)',
  moveRight:   'Рух праворуч (X+)',
  moveForward: 'Рух вглиб    (Z-)',
  moveBack:    'Рух назовні  (Z+)',
  hardDrop:    'Хард-дроп',
  rotateH:     'Поворот Y →',
  rotateF:     'Поворот Y ←',
  rotateR:     'Поворот X ↑',
  rotateG:     'Поворот X ↓',
  cameraLeft:  'Камера ліво',
  cameraRight: 'Камера право',
  pause:       'Пауза',
};

const ACTION_LABELS_RU = {
  moveLeft:    'Движение влево  (X-)',
  moveRight:   'Движение вправо (X+)',
  moveForward: 'Движение вглубь (Z-)',
  moveBack:    'Движение наружу (Z+)',
  hardDrop:    'Жёсткий сброс',
  rotateH:     'Поворот Y →',
  rotateF:     'Поворот Y ←',
  rotateR:     'Поворот X ↑',
  rotateG:     'Поворот X ↓',
  cameraLeft:  'Камера влево',
  cameraRight: 'Камера вправо',
  pause:       'Пауза',
};

export function getActionLabels(language) {
  return language === 'ru' ? ACTION_LABELS_RU : ACTION_LABELS;
}

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

export function getKeyLabel(code, language = 'uk') {
  const map = {
    Space:        language === 'ru' ? 'Пробел' : 'Пробіл',
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
