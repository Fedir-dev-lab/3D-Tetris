const AUDIO_KEY = 'tetris3d_audio';

let actx     = null;
let sfxBus   = null;
let musicBus = null;

let cfg = { sfxOn: true, musicOn: true, sfxVol: 0.5, musicVol: 0.22 };

// ── Налаштування ──────────────────────────────────
export function initAudio() {
  try {
    const s = JSON.parse(localStorage.getItem(AUDIO_KEY));
    if (s) cfg = { ...cfg, ...s };
  } catch {}
}

export function getAudioCfg() { return { ...cfg }; }

export function setAudioCfg(patch) {
  cfg = { ...cfg, ...patch };
  localStorage.setItem(AUDIO_KEY, JSON.stringify(cfg));
  if (sfxBus)   sfxBus.gain.value   = cfg.sfxOn   ? cfg.sfxVol   : 0;
  if (musicBus) musicBus.gain.value = cfg.musicOn ? cfg.musicVol : 0;
}

// ── Контекст ──────────────────────────────────────
function ac() {
  if (!actx) {
    actx     = new (window.AudioContext || window.webkitAudioContext)();
    sfxBus   = actx.createGain();
    musicBus = actx.createGain();
    sfxBus.gain.value   = cfg.sfxOn   ? cfg.sfxVol   : 0;
    musicBus.gain.value = cfg.musicOn ? cfg.musicVol : 0;
    sfxBus.connect(actx.destination);
    musicBus.connect(actx.destination);
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

// ── Helpers ───────────────────────────────────────
function osc(freq, type, dur, gain, delay = 0) {
  const c = ac(), t = c.currentTime + delay;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(sfxBus);
  o.start(t); o.stop(t + dur + 0.05);
}

function noise(dur, gain, cutoff = 600, delay = 0) {
  const c = ac(), t = c.currentTime + delay;
  const len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const flt = c.createBiquadFilter();
  flt.type = 'lowpass'; flt.frequency.value = cutoff;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(flt); flt.connect(g); g.connect(sfxBus);
  src.start(t); src.stop(t + dur + 0.05);
}

// ── Звукові ефекти ────────────────────────────────
export const sfx = {
  move()     { if (!cfg.sfxOn) return; osc(220,'sine',0.055,0.32); },
  rotate()   { if (!cfg.sfxOn) return; osc(330,'sine',0.04,0.28); osc(495,'sine',0.04,0.14,0.03); },
  lock()     { if (!cfg.sfxOn) return; noise(0.09,0.45,500); osc(95,'square',0.09,0.22); },
  softDrop() { if (!cfg.sfxOn) return; osc(155,'sine',0.04,0.18); },
  hardDrop() {
    if (!cfg.sfxOn) return;
    [195,165,135,105].forEach((f,i) => osc(f,'square',0.04,0.16,i*0.017));
    noise(0.14,0.42,400,0.07);
  },
  clear(n)   {
    if (!cfg.sfxOn) return;
    [330,440,550,660].slice(0,n).forEach((f,i) => osc(f,'square',0.13,0.27,i*0.07));
  },
  levelUp()  {
    if (!cfg.sfxOn) return;
    [330,392,494,587,784].forEach((f,i) => osc(f,'square',0.09,0.22,i*0.07));
  },
  gameOver() {
    if (!cfg.sfxOn) return;
    [440,330,262,220,165].forEach((f,i) => osc(f,'sawtooth',0.22,0.27,i*0.16));
  },
  menuClick(){ if (!cfg.sfxOn) return; osc(520,'sine',0.05,0.18); },
};

// ── Музичний секвенсор ────────────────────────────
const BPM  = 148;
const BEAT = 60 / BPM;

function timeline(notes) {
  let beat = 0;
  const ev = [];
  for (const [f, b] of notes) { ev.push({ beat, freq: f, beats: b }); beat += b; }
  return { ev, total: beat };
}

// Оригінальна мелодія (дорійський лад, 32 долі)
const MEL = timeline([
  // Частина A
  [659,1],[494,.5],[523,.5],[587,1],[523,.5],[494,.5],
  [440,1],[440,.5],[523,.5],[659,1],[587,.5],[523,.5],
  [494,1.5],[523,.5],[587,1],[659,1],
  [523,1],[440,1],[440,2],
  // Частина B
  [0,.5],[587,.5],[698,1],[880,1],[784,.5],[698,.5],
  [659,1.5],[523,.5],[659,1],[587,.5],[523,.5],
  [494,1],[494,.5],[523,.5],[587,1],[659,1],
  [523,1],[440,1],[440,2],
]);

// Бас (32 долі)
const BAS = timeline([
  [165,1],[0,1],[220,1],[0,1],
  [196,1],[0,1],[220,1],[0,1],
  [175,1],[0,1],[220,1],[0,1],
  [165,2],[0,2],
  [165,1],[0,1],[220,1],[0,1],
  [196,1],[0,1],[220,1],[0,1],
  [175,1],[0,1],[220,1],[0,1],
  [165,2],[0,2],
]);

const LOOP_DUR = Math.max(MEL.total, BAS.total) * BEAT; // ~12.97 сек

let musicRunning = false;
let musicTimer   = null;
let musicStart   = 0;
let scheduled    = 0;

const LOOK = 0.25; // секунд наперед
const TICK = 80;   // мс між тіками

function schedMusNote(freq, t, beats, gain, type) {
  if (!freq || !musicRunning) return;
  const c = actx, dur = beats * BEAT * 0.82;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.008);
  g.gain.setValueAtTime(gain, t + dur * 0.75);
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g); g.connect(musicBus);
  o.start(t); o.stop(t + dur + 0.05);
}

function musicTick() {
  if (!musicRunning || !actx) return;
  const until = actx.currentTime + LOOK;
  let loopN = Math.floor(Math.max(0, scheduled - musicStart) / LOOP_DUR);

  for (let safe = 0; safe < 4; safe++) {
    const ls = musicStart + loopN * LOOP_DUR;
    for (const { beat, freq, beats } of MEL.ev) {
      const t = ls + beat * BEAT;
      if (t >= scheduled && t < until) schedMusNote(freq, t, beats, 0.13, 'square');
    }
    for (const { beat, freq, beats } of BAS.ev) {
      const t = ls + beat * BEAT;
      if (t >= scheduled && t < until) schedMusNote(freq, t, beats, 0.09, 'triangle');
    }
    if (ls + LOOP_DUR >= until) break;
    loopN++;
  }
  scheduled  = until;
  musicTimer = setTimeout(musicTick, TICK);
}

export function startMusic() {
  ac();
  if (musicRunning) return;
  musicRunning = true;
  musicStart   = actx.currentTime;
  scheduled    = actx.currentTime;
  musicTick();
}

export function stopMusic() {
  musicRunning = false;
  if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
}