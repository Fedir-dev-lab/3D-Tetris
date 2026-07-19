const REPEAT_DELAY    = 200;
const REPEAT_INTERVAL = 90;

function bindBtn(id, onPress) {
  const el = document.getElementById(id);
  if (!el) return;

  let timer    = null;
  let interval = null;

  function start(e) {
    e.preventDefault();
    e.stopPropagation();
    onPress();
    timer = setTimeout(() => {
      interval = setInterval(onPress, REPEAT_INTERVAL);
    }, REPEAT_DELAY);
  }

  function end(e) {
    e.preventDefault();
    clearTimeout(timer);
    clearInterval(interval);
    timer = interval = null;
  }

  el.addEventListener('touchstart',  start, { passive: false });
  el.addEventListener('touchend',    end,   { passive: false });
  el.addEventListener('touchcancel', end,   { passive: false });
  el.addEventListener('mousedown',   start);
  el.addEventListener('mouseup',     end);
  el.addEventListener('mouseleave',  end);
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

  // Показуємо на тачскрінах І на вузьких екранах (телефон у браузері)
  const isTouch  = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const isNarrow = window.innerWidth <= 768;

  if (!isTouch && !isNarrow) return;

  container.classList.remove('hidden');

  bindBtn('mb-move-left',    () => actions.moveLeft());
  bindBtn('mb-move-right',   () => actions.moveRight());
  bindBtn('mb-move-forward', () => actions.moveForward());
  bindBtn('mb-move-back',    () => actions.moveBack());

  bindBtn('mb-rot-h', () => actions.rotateH());
  bindBtn('mb-rot-f', () => actions.rotateF());
  bindBtn('mb-rot-r', () => actions.rotateR());
  bindBtn('mb-rot-g', () => actions.rotateG());

  bindOnce('mb-soft-drop',  () => actions.softDrop());
  bindOnce('mb-hard-drop',  () => actions.hardDrop());
  bindOnce('mb-cam-left',   () => actions.cameraLeft());
  bindOnce('mb-cam-right',  () => actions.cameraRight());
  bindOnce('mb-pause',      () => actions.pause());
}