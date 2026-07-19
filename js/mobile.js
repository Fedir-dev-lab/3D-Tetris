// Затримка до початку повторення (мс) і інтервал повторення (мс)
const REPEAT_DELAY    = 180;
const REPEAT_INTERVAL = 80;

function bindBtn(id, onPress, onRelease) {
  const el = document.getElementById(id);
  if (!el) return;

  let timer = null;
  let interval = null;

  function start(e) {
    e.preventDefault();
    onPress();
    // Повторення при утриманні
    timer = setTimeout(() => {
      interval = setInterval(() => onPress(), REPEAT_INTERVAL);
    }, REPEAT_DELAY);
  }

  function end(e) {
    e.preventDefault();
    clearTimeout(timer);
    clearInterval(interval);
    timer = interval = null;
    onRelease?.();
  }

  el.addEventListener('touchstart',  start, { passive: false });
  el.addEventListener('touchend',    end,   { passive: false });
  el.addEventListener('touchcancel', end,   { passive: false });

  // Мишка для тестування на десктопі
  el.addEventListener('mousedown', start);
  el.addEventListener('mouseup',   end);
  el.addEventListener('mouseleave',end);
}

function bindOnce(id, onPress) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('touchstart', (e) => { e.preventDefault(); onPress(); }, { passive: false });
  el.addEventListener('mousedown',  (e) => { e.preventDefault(); onPress(); });
}

export function initMobileControls(actions) {
  const container = document.getElementById('mobile-controls');
  if (!container) return;

  // Показуємо завжди на тачскрінах, і також на десктопі (можна прибрати умову)
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouch) return;

  container.classList.remove('hidden');

  // Рух — з повторенням при утриманні
  bindBtn('mb-move-left',    () => actions.moveLeft(),    null);
  bindBtn('mb-move-right',   () => actions.moveRight(),   null);
  bindBtn('mb-move-forward', () => actions.moveForward(), null);
  bindBtn('mb-move-back',    () => actions.moveBack(),    null);

  // Обертання — з повторенням
  bindBtn('mb-rot-h', () => actions.rotateH(), null);
  bindBtn('mb-rot-f', () => actions.rotateF(), null);
  bindBtn('mb-rot-r', () => actions.rotateR(), null);
  bindBtn('mb-rot-g', () => actions.rotateG(), null);

  // Одноразові
  bindOnce('mb-soft-drop',  () => actions.softDrop());
  bindOnce('mb-hard-drop',  () => actions.hardDrop());
  bindOnce('mb-cam-left',   () => actions.cameraLeft());
  bindOnce('mb-cam-right',  () => actions.cameraRight());
  bindOnce('mb-pause',      () => actions.pause());
}