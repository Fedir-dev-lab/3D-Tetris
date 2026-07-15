// ── Елементи ──────────────────────────────────────
const hud            = document.getElementById('hud');
const scoreEl        = document.getElementById('score');
const levelEl        = document.getElementById('level');
const linesEl        = document.getElementById('lines');

const menuScreen     = document.getElementById('menu-screen');
const scoresScreen   = document.getElementById('scores-screen');
const settingsScreen = document.getElementById('settings-screen');
const pauseScreen    = document.getElementById('pause-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const clearMsg       = document.getElementById('clear-msg');

const finalScore     = document.getElementById('final-score');
const finalLevel     = document.getElementById('final-level');
const finalLines     = document.getElementById('final-lines');
const newRecordEl    = document.getElementById('new-record');
const scoresList     = document.getElementById('scores-list');

const speedSlider    = document.getElementById('speed-slider');
const speedLabel     = document.getElementById('speed-label');

import { loadBindings, saveBindings, resetBindings, getKeyLabel, ACTION_LABELS, DEFAULT_BINDINGS } from './bindings.js';

// ── Стан прив'язки клавіш ──────────────────────
let tempBindings     = {};
let pendingAction    = null;
let captureListener  = null;
const bindingBtns    = {};

// ── Налаштування ──────────────────────────────────
const SETTINGS_KEY = 'tetris3d_settings';

// Базові інтервали падіння для кожного рівня слайдера (1–10)
const SPEED_BASE_MS = [1400, 1200, 1050, 900, 800, 650, 500, 380, 280, 180];

const SPEED_NAMES = [
  'Дуже повільно', 'Дуже повільно',
  'Повільно',      'Повільно',
  'Нормально',     'Нормально',
  'Швидко',        'Швидко',
  'Дуже швидко',   'Дуже швидко',
];

export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { speed: 5 }; }
  catch { return { speed: 5 }; }
}

function saveSettingsData(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Базовий інтервал падіння згідно з налаштуванням
export function getBaseInterval() {
  const { speed } = loadSettings();
  return SPEED_BASE_MS[Math.min(Math.max(speed - 1, 0), 9)];
}

// ── Рекорди ───────────────────────────────────────
const STORAGE_KEY = 'tetris3d_scores';

export function saveScore(score, level, lines) {
  const scores = loadScores();
  scores.push({ score, level, lines, date: new Date().toLocaleDateString('uk') });
  scores.sort((a, b) => b.score - a.score);
  scores.splice(10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  return scores[0].score === score && scores[0].level === level;
}

export function loadScores() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

// ── Показати / сховати екрани ─────────────────────
const aboutScreen    = document.getElementById('about-screen');
const ALL_SCREENS = [menuScreen, scoresScreen, settingsScreen, aboutScreen, pauseScreen, gameoverScreen];

function hideAll() {
  ALL_SCREENS.forEach(s => s.classList.add('hidden'));
}

export function showMenu() {
  hideAll();
  hud.classList.add('hidden');
  menuScreen.classList.remove('hidden');
}

export function showGame() {
  hideAll();
  hud.classList.remove('hidden');
}

export function showPause() {
  pauseScreen.classList.remove('hidden');
}

export function hidePause() {
  pauseScreen.classList.add('hidden');
}

export function showGameOver(score, level, lines) {
  const isNew = saveScore(score, level, lines);
  finalScore.textContent = score;
  finalLevel.textContent = level;
  finalLines.textContent = lines;
  newRecordEl.classList.toggle('hidden', !isNew);
  gameoverScreen.classList.remove('hidden');
}

export function showScores() {
  hideAll();
  hud.classList.add('hidden');
  const scores = loadScores();
  if (scores.length === 0) {
    scoresList.innerHTML = '<div class="no-scores">Ще немає рекордів</div>';
  } else {
    scoresList.innerHTML = scores.map((s, i) => `
      <div class="score-row">
        <span class="rank">${i + 1}</span>
        <span>${s.date}</span>
        <span>Рів. ${s.level}</span>
        <span class="sc-val">${s.score}</span>
      </div>
    `).join('');
  }
  scoresScreen.classList.remove('hidden');
}

export function showSettings() {
  hideAll();
  hud.classList.add('hidden');
  cancelCapture();

  const { speed } = loadSettings();
  speedSlider.value = speed;
  speedLabel.textContent = `${SPEED_NAMES[speed - 1]} (${speed})`;

  tempBindings = loadBindings();
  rebuildBindingsUI();

  settingsScreen.classList.remove('hidden');
}

export function showAbout() {
  hideAll();
  hud.classList.add('hidden');
  aboutScreen.classList.remove('hidden');
}

// ── HUD ───────────────────────────────────────────
export function updateHUD(score, level, lines) {
  scoreEl.textContent  = score;
  levelEl.textContent  = level;
  linesEl.textContent  = lines;
}

// ── Повідомлення про очищення ─────────────────────
const MSG = ['', 'ОДНА!', 'ДУБЛЬ!', 'ТРИПЛ!', 'TETRIS!'];

export function showClearMessage(count) {
  if (!count) return;
  clearMsg.textContent = MSG[Math.min(count, 4)];
  clearMsg.classList.remove('hidden');
  clearMsg.style.animation = 'none';
  clearMsg.offsetHeight;
  clearMsg.style.animation = '';
  setTimeout(() => clearMsg.classList.add('hidden'), 850);
}

function cancelCapture() {
  if (!pendingAction) return;
  const btn = bindingBtns[pendingAction];
  if (btn) {
    btn.classList.remove('capturing');
    btn.textContent = getKeyLabel(tempBindings[pendingAction]);
  }
  if (captureListener) {
    window.removeEventListener('keydown', captureListener, true);
    captureListener = null;
  }
  pendingAction = null;
}

function rebuildBindingsUI() {
  const list = document.getElementById('bindings-list');
  if (!list) return;
  list.innerHTML = '';

  for (const [action, label] of Object.entries(ACTION_LABELS)) {
    const row = document.createElement('div');
    row.className = 'binding-row';

    const actionEl = document.createElement('span');
    actionEl.className = 'binding-action';
    actionEl.textContent = label;

    const btn = document.createElement('button');
    btn.className = 'binding-key';
    btn.textContent = getKeyLabel(tempBindings[action]);
    bindingBtns[action] = btn;

    btn.addEventListener('click', () => {
      cancelCapture();
      pendingAction = action;
      btn.textContent = '...';
      btn.classList.add('capturing');

      captureListener = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.code === 'Escape') {
          cancelCapture();
          return;
        }

        // Конфлікт — міняємо місцями
        const conflict = Object.keys(tempBindings).find(
          a => a !== action && tempBindings[a] === e.code
        );
        if (conflict) {
          tempBindings[conflict] = tempBindings[action];
          if (bindingBtns[conflict]) {
            bindingBtns[conflict].textContent = getKeyLabel(tempBindings[conflict]);
            bindingBtns[conflict].classList.remove('conflict');
          }
        }

        tempBindings[action] = e.code;
        window.removeEventListener('keydown', captureListener, true);
        captureListener = null;
        pendingAction = null;
        btn.classList.remove('capturing');
        btn.textContent = getKeyLabel(e.code);
      };

      window.addEventListener('keydown', captureListener, true);
    });

    row.appendChild(actionEl);
    row.appendChild(btn);
    list.appendChild(row);
  }
}

// ── Прив'язка кнопок ──────────────────────────────
export function bindMenuButtons(callbacks) {
  document.getElementById('btn-start').onclick          = callbacks.onStart;
  document.getElementById('btn-scores').onclick         = callbacks.onScores;
  document.getElementById('btn-settings').onclick       = callbacks.onSettings;
  document.getElementById('btn-scores-back').onclick    = callbacks.onMenu;
  document.getElementById('btn-settings-back').onclick  = callbacks.onMenu;
  document.getElementById('btn-resume').onclick         = callbacks.onResume;
  document.getElementById('btn-pause-menu').onclick     = callbacks.onMenu;
  document.getElementById('btn-restart').onclick        = callbacks.onStart;
  document.getElementById('btn-gameover-menu').onclick  = callbacks.onMenu;
  document.getElementById('btn-about').onclick       = callbacks.onAbout;
  document.getElementById('btn-about-back').onclick  = callbacks.onMenu;
  document.getElementById('btn-exit').onclick        = callbacks.onExit;
  document.getElementById('btn-reset-bindings').onclick = () => {
    tempBindings = resetBindings();
    rebuildBindingsUI();
  };

  document.getElementById('btn-settings-save').onclick = () => {
    cancelCapture();
    saveSettingsData({ speed: Number(speedSlider.value) });
    saveBindings(tempBindings);
    callbacks.onMenu();
  };

  // Слайдер — оновлює підпис у реальному часі
  speedSlider.addEventListener('input', () => {
    const v = Number(speedSlider.value);
    speedLabel.textContent = `${SPEED_NAMES[v - 1]} (${v})`;
  });

  // Кнопка "Зберегти"
  document.getElementById('btn-settings-save').onclick = () => {
    saveSettingsData({ speed: Number(speedSlider.value) });
    callbacks.onMenu();
  };
}