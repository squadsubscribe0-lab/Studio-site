/* Merge Six: Dice Blast — HTML5 dice merge puzzle.
   Drag dice pieces onto a 7x7 board. 3+ touching dice with the same value merge into the next value.
   Merging up to a 6 BURSTS the whole row and column. Chains build combos. */
(() => {
'use strict';
const Q = new URLSearchParams(location.search);
const CAPTURE = Q.has('capture');          // deterministic frame stepping for trailer capture
const BOT = Q.has('bot') || CAPTURE;       // auto-player (used for trailers)
const GRID = 7;
const FONT = "'Lilita One','Arial Black',Impact,sans-serif";
const VALUE_COLORS = ['#ffffff', '#36d67a', '#3aa2ff', '#ff9a2e', '#a565ff', '#19cfc2', '#ff4d8b'];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/* ------------------------------------------------------------------ utils */
let _seed = (parseInt(Q.get('seed'), 10) || ((Math.random() * 2 ** 31) | 0)) | 0;
function rnd() { _seed = (_seed + 0x6D2B79F5) | 0; let t = _seed; t = Math.imul(t ^ (t >>> 15), 1 | t); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutBack = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function hexRgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mix(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return '#' + A.map((x, i) => Math.round(lerp(x, B[i], t)).toString(16).padStart(2, '0')).join(''); }
function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }
function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
let _uid = 1; const uid = () => _uid++;
const fmt = n => Math.round(n).toLocaleString('en-US');

/* ------------------------------------------------------------------ dice art */
const PIPS = {
  1: [[.5, .5]], 2: [[.28, .28], [.72, .72]], 3: [[.27, .27], [.5, .5], [.73, .73]],
  4: [[.28, .28], [.72, .28], [.28, .72], [.72, .72]], 5: [[.27, .27], [.73, .27], [.5, .5], [.27, .73], [.73, .73]],
  6: [[.28, .24], [.72, .24], [.28, .5], [.72, .5], [.28, .76], [.72, .76]],
};
const SKINS = [
  { id: 'classic', name: 'Classic', price: 0, ads: 0 },
  { id: 'neon', name: 'Neon', price: 250, ads: 2 },
  { id: 'candy', name: 'Candy', price: 400, ads: 3 },
  { id: 'wood', name: 'Wooden', price: 600, ads: 3 },
  { id: 'gem', name: 'Gem', price: 900, ads: 4 },
  { id: 'gold', name: 'Gold', price: 1500, ads: 5 },
];

function pips(c, x, y, w, h, v, color, rad, outline) {
  const p = PIPS[v]; if (!p) return;
  for (const [px, py] of p) {
    const cx = x + px * w, cy = y + py * h;
    if (outline) { c.fillStyle = outline; c.beginPath(); c.arc(cx, cy + rad * 0.18, rad * 1.12, 0, 7); c.fill(); }
    c.fillStyle = color; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
  }
}
function star(c, cx, cy, R, r, n = 5) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rad = i % 2 ? r : R; c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
  c.closePath();
}
function sparkle(c, x, y, s, a = 0.9) { c.save(); c.fillStyle = `rgba(255,255,255,${a})`; star(c, x, y, s, s * 0.22, 4); c.fill(); c.restore(); }

/* Draw one die whose top-left is (x,y) and size s. */
function drawDieRaw(c, x, y, s, v, skin = 'classic', f = {}) {
  c.save();
  const r = s * 0.22, depth = s * 0.075, fh = s - depth, pr = s * 0.085;
  if (f.bomb) { drawBomb(c, x, y, s); c.restore(); return; }
  if (f.wild) { drawWild(c, x, y, s, depth, r); c.restore(); return; }
  const base = VALUE_COLORS[v] || '#888888';
  switch (skin) {
    case 'neon': {
      c.fillStyle = '#05030f'; rr(c, x, y + depth, s, fh, r); c.fill();
      c.fillStyle = '#160e33'; rr(c, x, y, s, fh, r); c.fill();
      c.shadowColor = base; c.shadowBlur = s * 0.22;
      c.strokeStyle = base; c.lineWidth = s * 0.075; rr(c, x + s * 0.06, y + s * 0.06, s - s * 0.12, fh - s * 0.12, r * 0.8); c.stroke();
      pips(c, x, y, s, fh, v, mix(base, '#ffffff', .35), pr);
      c.shadowBlur = 0;
      break;
    }
    case 'candy': {
      const pastel = mix(base, '#ffffff', .3);
      c.fillStyle = mix(base, '#000000', .25); rr(c, x, y + depth, s, fh, r); c.fill();
      c.fillStyle = pastel; rr(c, x, y, s, fh, r); c.fill();
      c.save(); rr(c, x, y, s, fh, r); c.clip();
      c.fillStyle = 'rgba(255,255,255,.28)';
      for (let i = -2; i < 6; i++) { c.beginPath(); const sx = x + i * s * 0.28; c.moveTo(sx, y + fh); c.lineTo(sx + s * 0.13, y + fh); c.lineTo(sx + s * 0.13 + fh, y); c.lineTo(sx + fh, y); c.fill(); }
      c.restore();
      c.fillStyle = 'rgba(255,255,255,.45)'; rr(c, x + s * .12, y + s * .07, s * .5, s * .14, s * .07); c.fill();
      pips(c, x, y, s, fh, v, '#ffffff', pr, mix(base, '#000000', .35));
      break;
    }
    case 'wood': {
      const wood = mix(base, '#b3742f', .68);
      c.fillStyle = mix(wood, '#000000', .45); rr(c, x, y + depth, s, fh, r * 0.7); c.fill();
      const g = c.createLinearGradient(x, y, x + s, y + fh); g.addColorStop(0, mix(wood, '#ffffff', .2)); g.addColorStop(1, mix(wood, '#000000', .1));
      c.fillStyle = g; rr(c, x, y, s, fh, r * 0.7); c.fill();
      c.save(); rr(c, x, y, s, fh, r * 0.7); c.clip();
      c.strokeStyle = 'rgba(60,28,6,.28)'; c.lineWidth = s * 0.025;
      for (let i = 0; i < 5; i++) { const yy = y + fh * (0.12 + i * 0.2); c.beginPath(); c.moveTo(x, yy); c.bezierCurveTo(x + s * .3, yy - s * .08, x + s * .6, yy + s * .08, x + s, yy - s * .02); c.stroke(); }
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = s * 0.03; rr(c, x + s * .05, y + s * .05, s * .9, fh - s * .1, r * .6); c.stroke();
      pips(c, x, y, s, fh, v, '#2a1607', pr);
      break;
    }
    case 'gem': {
      c.fillStyle = mix(base, '#000000', .5); rr(c, x, y + depth, s, fh, r * 0.6); c.fill();
      c.fillStyle = mix(base, '#000000', .12); rr(c, x, y, s, fh, r * 0.6); c.fill();
      const ix = x + s * .16, iy = y + s * .14, iw = s * .68, ih = fh - s * .28;
      c.fillStyle = 'rgba(255,255,255,.22)';
      c.beginPath(); c.moveTo(x + r * .4, y); c.lineTo(x + s - r * .4, y); c.lineTo(ix + iw, iy); c.lineTo(ix, iy); c.fill();
      c.fillStyle = 'rgba(0,0,0,.18)';
      c.beginPath(); c.moveTo(x, y + fh - r * .4); c.lineTo(x + s, y + fh - r * .4); c.lineTo(ix + iw, iy + ih); c.lineTo(ix, iy + ih); c.fill();
      const g = c.createLinearGradient(ix, iy, ix + iw, iy + ih); g.addColorStop(0, mix(base, '#ffffff', .45)); g.addColorStop(1, base);
      c.fillStyle = g; rr(c, ix, iy, iw, ih, s * .06); c.fill();
      pips(c, x, y, s, fh, v, '#ffffff', pr * 0.92, mix(base, '#000000', .45));
      sparkle(c, x + s * .25, y + s * .2, s * .1);
      break;
    }
    case 'gold': {
      c.fillStyle = '#8a5a08'; rr(c, x, y + depth, s, fh, r); c.fill();
      const g = c.createLinearGradient(x, y, x + s, y + fh); g.addColorStop(0, '#fff2a6'); g.addColorStop(.45, '#ffcf3a'); g.addColorStop(1, '#d9900f');
      c.fillStyle = g; rr(c, x, y, s, fh, r); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = s * .03; rr(c, x + s * .05, y + s * .05, s * .9, fh - s * .1, r * .8); c.stroke();
      pips(c, x, y, s, fh, v, base, pr * 1.05, '#5a3a00');
      sparkle(c, x + s * .8, y + s * .18, s * .11);
      break;
    }
    default: { // classic
      c.fillStyle = mix(base, '#000000', .38); rr(c, x, y + depth, s, fh, r); c.fill();
      const g = c.createLinearGradient(0, y, 0, y + fh); g.addColorStop(0, mix(base, '#ffffff', .3)); g.addColorStop(1, base);
      c.fillStyle = g; rr(c, x, y, s, fh, r); c.fill();
      c.fillStyle = 'rgba(255,255,255,.3)'; rr(c, x + s * .12, y + s * .06, s * .76, s * .2, s * .1); c.fill();
      pips(c, x, y, s, fh, v, '#ffffff', pr, mix(base, '#000000', .3));
    }
  }
  c.restore();
}
function drawWild(c, x, y, s, depth, r) {
  const fh = s - depth;
  c.fillStyle = '#3a1c6e'; rr(c, x, y + depth, s, fh, r); c.fill();
  const g = c.createLinearGradient(x, y, x + s, y + fh);
  [1, 2, 4, 6, 3].forEach((v, i, a) => g.addColorStop(i / (a.length - 1), VALUE_COLORS[v]));
  c.fillStyle = g; rr(c, x, y, s, fh, r); c.fill();
  c.fillStyle = 'rgba(255,255,255,.3)'; rr(c, x + s * .12, y + s * .06, s * .76, s * .2, s * .1); c.fill();
  c.lineJoin = 'round';
  star(c, x + s / 2, y + fh / 2 + s * .02, s * .3, s * .13); c.fillStyle = 'rgba(40,10,80,.45)'; c.fill();
  star(c, x + s / 2, y + fh / 2, s * .3, s * .13); c.fillStyle = '#ffffff'; c.fill();
}
function drawBomb(c, x, y, s) {
  const cx = x + s / 2, cy = y + s * .56, R = s * .36;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(cx, y + s * .93, R * .9, R * .22, 0, 0, 7); c.fill();
  const g = c.createRadialGradient(cx - R * .35, cy - R * .35, R * .1, cx, cy, R); g.addColorStop(0, '#6b6f8a'); g.addColorStop(1, '#14152a');
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
  c.fillStyle = '#3a3c55'; rr(c, cx - s * .1, cy - R - s * .06, s * .2, s * .1, s * .03); c.fill();
  c.strokeStyle = '#c9a36a'; c.lineWidth = s * .05; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, cy - R - s * .05); c.quadraticCurveTo(cx + s * .12, cy - R - s * .2, cx + s * .22, cy - R - s * .12); c.stroke();
  c.fillStyle = '#ffb02e'; star(c, cx + s * .24, cy - R - s * .13, s * .11, s * .05, 6); c.fill();
  c.fillStyle = '#fff6c2'; c.beginPath(); c.arc(cx + s * .24, cy - R - s * .13, s * .035, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(cx - R * .38, cy - R * .38, R * .22, R * .14, -0.7, 0, 7); c.fill();
}

/* Outlined chunky title text */
function bigText(c, t, x, y, size, top, bottom, stroke) {
  c.save();
  c.font = `${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = size * 0.2; c.strokeStyle = stroke; c.fillStyle = stroke;
  c.strokeText(t, x, y + size * 0.09); c.fillText(t, x, y + size * 0.09); c.strokeText(t, x, y);
  const g = c.createLinearGradient(0, y - size * .45, 0, y + size * .45); g.addColorStop(0, top); g.addColorStop(1, bottom);
  c.fillStyle = g; c.fillText(t, x, y);
  c.save(); c.beginPath(); c.rect(x - size * 6, y - size * .6, size * 12, size * .5); c.clip(); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillText(t, x, y); c.restore();
  c.restore();
}
function tiltDie(c, cx, cy, s, v, rot, skin = 'classic', f = {}) {
  c.save(); c.translate(cx, cy); c.rotate(rot);
  c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = s * .2; c.shadowOffsetY = s * .08;
  drawDieRaw(c, -s / 2, -s / 2, s, v, skin, f); c.restore();
}
/* Game logo, fits inside w x h */
function drawLogo(c, w, h) {
  const s1 = h * 0.3, s2 = h * 0.56;
  c.save();
  c.font = `${s2}px ${FONT}`;
  const tw = c.measureText('SIX').width;
  const ds = h * 0.3;
  tiltDie(c, w / 2 - tw / 2 - ds * 0.75, h * 0.66, ds, 6, -0.28);
  tiltDie(c, w / 2 + tw / 2 + ds * 0.75, h * 0.64, ds, 5, 0.25, 'classic');
  bigText(c, 'MERGE', w / 2, h * 0.23, s1, '#ffffff', '#a9d8ff', '#14114a');
  bigText(c, 'SIX', w / 2, h * 0.66, s2, '#ffe34d', '#ff4d8b', '#2a0d44');
  c.font = `${h * 0.11}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const bw = c.measureText('DICE BLAST').width + h * 0.14, by = h * 0.94;
  c.fillStyle = '#2a0d44'; rr(c, w / 2 - bw / 2, by - h * .075 + h * .02, bw, h * .15, h * .075); c.fill();
  c.fillStyle = '#7a3ef0'; rr(c, w / 2 - bw / 2, by - h * .075, bw, h * .15, h * .075); c.fill();
  c.fillStyle = '#fff'; c.fillText('DICE BLAST', w / 2, by + h * .005);
  c.restore();
}

window.DiceArt = { drawDieRaw, drawLogo, bigText, tiltDie, sparkle, rr, mix, SKINS, VALUE_COLORS, FONT, GRID };
if (window.NO_AUTOSTART) return;

/* ------------------------------------------------------------------ sound (WebAudio, no files) */
const Sound = (() => {
  let ac = null, master = null, muted = false, adMute = false, hidden = false;
  function ensure() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.connect(ac.destination); } catch (e) { return; } }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    apply();
  }
  function apply() { if (master) master.gain.value = (muted || adMute || hidden) ? 0 : 0.55; }
  function tone(freq, dur, type = 'sine', vol = .3, slide = 0, delay = 0) {
    if (!ac || muted || adMute) return;
    const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur, vol, freq, delay = 0) {
    if (!ac || muted || adMute) return;
    const t = ac.currentTime + delay, len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(80, t + dur);
    g.gain.value = vol; src.connect(f); f.connect(g); g.connect(master); src.start(t);
  }
  const NOTES = [0, 392, 440, 523, 587, 659, 784];
  return {
    ensure,
    get muted() { return muted; },
    setMuted(m) { muted = m; apply(); },
    setAdMute(m) { adMute = m; apply(); },
    setHidden(m) { hidden = m; apply(); },
    place() { tone(180, .09, 'triangle', .3, .55); noise(.05, .12, 1800); },
    merge(v, chain) { const f = NOTES[clamp(v, 1, 6)] * Math.pow(1.0595, (chain - 1) * 2); tone(f, .18, 'triangle', .28, 1.25); tone(f * 2, .14, 'sine', .1, 1, .05); },
    burst() { noise(.6, .4, 2400); [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .28, 'square', .06, 1, i * .045)); tone(110, .5, 'sine', .4, .4); },
    bomb() { noise(.7, .55, 700); tone(80, .5, 'sine', .45, .45); },
    smash() { noise(.25, .35, 1500); tone(140, .18, 'square', .1, .5); },
    rotate() { tone(520, .07, 'sine', .14, 1.5); },
    click() { tone(700, .05, 'square', .06); },
    invalid() { tone(150, .12, 'sawtooth', .08, .8); },
    over() { [392, 330, 262, 196].forEach((f, i) => tone(f, .32, 'triangle', .2, 1, i * .16)); },
    coin() { tone(988, .08, 'square', .07); tone(1318, .14, 'square', .07, 1, .07); },
    praise() { [659, 784, 988].forEach((f, i) => tone(f, .12, 'triangle', .12, 1, i * .06)); },
  };
})();

/* ------------------------------------------------------------------ state */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
const L = {};
let now = 0;
const timers = [];
const wait = d => new Promise(res => timers.push({ t: now + d, res }));
const fx = [], parts = [];
let shake = 0, flash = 0;
const pauseReasons = new Set();
const isPaused = () => pauseReasons.size > 0;

const DEFAULT_SAVE = { best: 0, coins: 0, skin: 'classic', owned: ['classic'], adProg: {}, hammer: 1, refresh: 1, sound: true, games: 0 };
let save = Object.assign({}, DEFAULT_SAVE);
function persist() { Portal.store(save); }

const S = { grid: emptyGrid(), tray: [null, null, null], score: 0, shown: 0, state: 'boot', busy: false, hammer: false, revived: false, combo: 0, comboT: -9, placed: 0, newBest: false, pending: null, stuckHint: false, firstPlay: true };
let D = null; // active drag

function emptyGrid() { return Array.from({ length: GRID }, () => Array(GRID).fill(null)); }

/* ------------------------------------------------------------------ pieces */
const SHAPES = [
  { w: 28, c: [[0, 0]] },
  { w: 22, c: [[0, 0], [1, 0]] },
  { w: 18, c: [[0, 0], [0, 1]] },
  { w: 8, c: [[0, 0], [1, 0], [2, 0]] },
  { w: 6, c: [[0, 0], [0, 1], [0, 2]] },
  { w: 9, c: [[0, 0], [1, 0], [0, 1]] },
  { w: 9, c: [[0, 0], [1, 0], [1, 1]] },
];
function maxVal() { return CAPTURE ? 5 : S.score < 1500 ? 3 : S.score < 6000 ? 4 : 5; }
function randVal() { return CAPTURE ? 2 + Math.floor(Math.pow(rnd(), .8) * 4) : 1 + Math.floor(Math.pow(rnd(), 1.3) * maxVal()); }
function makePiece() {
  if (S.placed > 8 && rnd() < 0.035) return { id: uid(), spawn: now, cells: [{ dx: 0, dy: 0, v: 0, bomb: true }] };
  const tot = SHAPES.reduce((a, s) => a + s.w, 0); let x = rnd() * tot, sh = SHAPES[0];
  for (const s of SHAPES) { if ((x -= s.w) < 0) { sh = s; break; } }
  const cells = sh.c.map(([dx, dy]) => { const wild = S.placed > 5 && rnd() < 0.045; return { dx, dy, v: wild ? 0 : randVal(), wild }; });
  if (cells.length === 3 && cells.every(k => !k.wild && k.v === cells[0].v)) cells[2].v = cells[2].v % maxVal() + 1;
  return { id: uid(), spawn: now, cells };
}
function bbox(p) { let w = 0, h = 0; for (const k of p.cells) { w = Math.max(w, k.dx + 1); h = Math.max(h, k.dy + 1); } return { w, h }; }
function rotated(p) { const { h } = bbox(p); return Object.assign({}, p, { cells: p.cells.map(k => Object.assign({}, k, { dx: h - 1 - k.dy, dy: k.dx })) }); }
function canPlace(p, r, c, g = S.grid) {
  for (const k of p.cells) { const y = r + k.dy, x = c + k.dx; if (y < 0 || x < 0 || y >= GRID || x >= GRID || g[y][x]) return false; }
  return true;
}
function fitsAnywhere(p) {
  let q = p;
  for (let i = 0; i < 4; i++) { for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) if (canPlace(q, r, c)) return true; q = rotated(q); }
  return false;
}
function fillTray() {
  for (let i = 0; i < 14; i++) { S.tray = [makePiece(), makePiece(), makePiece()]; if (S.tray.some(fitsAnywhere)) break; }
  S.tray.forEach(p => p.spawn = now);
}

/* ------------------------------------------------------------------ merge logic */
function findGroup(g, r, c) {
  const st = g[r][c]; if (!st || st.bomb) return null;
  let best = null;
  const vals = st.wild ? [5, 4, 3, 2, 1] : [st.v];
  for (const v of vals) {
    if (v >= 6) continue;
    const seen = new Set([r * GRID + c]), stack = [[r, c]], cells = []; let real = 0;
    while (stack.length) {
      const [y, x] = stack.pop(); cells.push([y, x]); if (!g[y][x].wild) real++;
      for (const [dy, dx] of DIRS) {
        const ny = y + dy, nx = x + dx; if (ny < 0 || nx < 0 || ny >= GRID || nx >= GRID) continue;
        const k = ny * GRID + nx; if (seen.has(k)) continue;
        const n = g[ny][nx]; if (!n || n.bomb) continue;
        if (n.wild || n.v === v) { seen.add(k); stack.push([ny, nx]); }
      }
    }
    if (cells.length >= 3 && real >= 1 && (!best || cells.length > best.cells.length)) best = { v, cells };
  }
  return best;
}
function cellCenter(r, c) { return [L.bx + L.pad + (c + .5) * L.cell, L.by + L.pad + (r + .5) * L.cell]; }

async function place(slot, p, r, c) {
  S.busy = true; S.tray[slot] = null; S.stuckHint = false;
  const placed = [];
  for (const k of p.cells) { const y = r + k.dy, x = c + k.dx; S.grid[y][x] = { v: k.v, wild: !!k.wild, bomb: !!k.bomb, pop: now, id: uid() }; placed.push([y, x]); }
  S.placed++; S.score += p.cells.length * 2;
  Sound.place();
  if (p.cells[0].bomb) await explodeBomb(placed[0][0], placed[0][1]);
  else { await wait(0.07); await resolveFrom(placed); }
  if (S.tray.every(t => !t)) fillTray();
  S.busy = false;
  if (S.pending) {
    const pd = S.pending; S.pending = null;
    if (S.tray[pd.slot] && S.tray[pd.slot].id === pd.p.id && canPlace(pd.p, pd.r, pd.c)) return place(pd.slot, pd.p, pd.r, pd.c);
  }
  checkStuck();
}
async function resolveFrom(placed) {
  let queue = placed.slice(), chain = 0;
  for (;;) {
    queue = queue.filter(([r, c]) => S.grid[r][c] && !S.grid[r][c].bomb);
    let best = null;
    for (const [r, c] of queue) {
      const g = findGroup(S.grid, r, c);
      if (g && (!best || g.cells.length > best.cells.length || (g.cells.length === best.cells.length && g.v > best.v))) best = Object.assign(g, { r, c });
    }
    if (!best) break;
    chain++;
    const burst = await doMerge(best, chain);
    if (!burst) queue.push([best.r, best.c]);
  }
  return chain;
}
async function doMerge(g, chain) {
  const { r, c, cells, v } = g, nv = v + 1, [ax, ay] = cellCenter(r, c);
  for (const [y, x] of cells) {
    if (y === r && x === c) continue;
    const d = S.grid[y][x]; S.grid[y][x] = null;
    const [sx, sy] = cellCenter(y, x);
    fx.push({ type: 'fly', x0: sx, y0: sy, x1: ax, y1: ay, t0: now, dur: .16, v: d.v, wild: d.wild });
  }
  Sound.merge(nv, chain);
  await wait(0.16);
  S.grid[r][c] = { v: nv, wild: false, pop: now, id: uid() };
  const pts = nv * 10 * cells.length * chain;
  addScore(pts, ax, ay - L.cell * .35, VALUE_COLORS[nv]);
  burstParticles(ax, ay, VALUE_COLORS[nv], 14);
  fx.push({ type: 'ring', x: ax, y: ay, t0: now, dur: .4, color: VALUE_COLORS[nv] });
  S.combo = chain; S.comboT = now;
  if (chain >= 2) praise(chain);
  if (nv >= 6) { await wait(0.2); await burstLine(r, c, chain); return true; }
  await wait(0.07);
  return false;
}
async function burstLine(r, c, chain) {
  const [ax, ay] = cellCenter(r, c);
  Sound.burst(); shake = Math.max(shake, L.cell * .28); flash = .35;
  fx.push({ type: 'laser', r, c, t0: now, dur: .6 });
  fx.push({ type: 'text', text: 'BURST!', x: ax, y: ay - L.cell * .6, t0: now, dur: 1.1, size: L.cell * .85, color: '#ff4d8b' });
  let gained = 300 * chain;
  const targets = [];
  for (let i = 0; i < GRID; i++) { targets.push([r, i]); if (i !== r) targets.push([i, c]); }
  for (const [y, x] of targets) {
    const d = S.grid[y][x]; if (!d) continue;
    const dist = Math.abs(y - r) + Math.abs(x - c), [px, py] = cellCenter(y, x);
    fx.push({ type: 'pop', x: px, y: py, v: d.v, wild: d.wild, bomb: d.bomb, t0: now + dist * .035, dur: .28 });
    burstParticles(px, py, d.wild ? '#ffffff' : (VALUE_COLORS[d.v] || '#ffffff'), 9, dist * .035);
    S.grid[y][x] = null;
    gained += (d.wild ? 3 : d.v) * 25 * chain;
  }
  addScore(gained, ax, ay + L.cell * .3, '#ffe34d', true);
  Portal.happytime();
  await wait(0.5);
}
async function explodeBomb(r, c) {
  await wait(0.22);
  Sound.bomb(); shake = Math.max(shake, L.cell * .32); flash = .25;
  const [ax, ay] = cellCenter(r, c);
  fx.push({ type: 'ring', x: ax, y: ay, t0: now, dur: .5, color: '#ffb02e', big: true });
  fx.push({ type: 'text', text: 'BOOM!', x: ax, y: ay - L.cell * .5, t0: now, dur: 1, size: L.cell * .8, color: '#ffb02e' });
  let n = 0;
  for (let y = r - 1; y <= r + 1; y++) for (let x = c - 1; x <= c + 1; x++) {
    if (y < 0 || x < 0 || y >= GRID || x >= GRID) continue;
    const d = S.grid[y][x]; if (!d) continue;
    const [px, py] = cellCenter(y, x);
    if (!d.bomb) { fx.push({ type: 'pop', x: px, y: py, v: d.v, wild: d.wild, t0: now, dur: .25 }); n++; }
    burstParticles(px, py, d.bomb ? '#ffb02e' : (VALUE_COLORS[d.v] || '#fff'), 10);
    S.grid[y][x] = null;
  }
  addScore(n * 15 + 20, ax, ay, '#ffb02e');
  await wait(0.35);
}
function addScore(pts, x, y, color = '#ffffff', big = false) {
  S.score += pts;
  if (x != null) fx.push({ type: 'text', text: '+' + fmt(pts), x, y, t0: now, dur: .9, size: L.cell * (big ? .6 : .42), color });
  if (!S.newBest && save.best > 0 && S.score > save.best) {
    S.newBest = true;
    fx.push({ type: 'banner', text: 'NEW BEST!', t0: now, dur: 1.6, color: '#ffe34d' });
  }
}
const PRAISE = ['', '', 'GOOD!', 'GREAT!', 'AMAZING!', 'UNBELIEVABLE!'];
function praise(chain) {
  Sound.praise();
  fx.push({ type: 'banner', text: PRAISE[Math.min(chain, 5)], t0: now, dur: 1.1, color: ['#fff', '#fff', '#55e08a', '#3aa2ff', '#b27bff', '#ff4d8b'][Math.min(chain, 5)] });
}
function burstParticles(x, y, color, n, delay = 0) {
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, sp = L.cell * (1.5 + rnd() * 4);
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - L.cell * 2, life: .5 + rnd() * .5, age: -delay, size: L.cell * (.06 + rnd() * .08), color, rot: rnd() * 6, vr: (rnd() - .5) * 12, sq: rnd() < .5 });
  }
}

/* ------------------------------------------------------------------ stuck / revive / boosters */
function checkStuck() {
  if (S.state !== 'play' || S.busy) return;
  const any = S.tray.some(p => p && fitsAnywhere(p));
  if (any) { S.stuckHint = false; return; }
  if (save.hammer > 0 || save.refresh > 0) { S.stuckHint = true; return; }
  stuck();
}
async function stuck() {
  if (S.state !== 'play') return;
  S.state = 'stuck'; Sound.invalid(); shake = L.cell * .2;
  fx.push({ type: 'banner', text: 'NO SPACE!', t0: now, dur: 1.2, color: '#ff6b6b' });
  await wait(1.0);
  Portal.gameplayStop();
  if (BOT) { gameOver(); return; }
  if (!S.revived) { document.getElementById('revScore').textContent = fmt(S.score); showOv('revive'); }
  else gameOver();
}
async function doRevive() {
  S.revived = true; S.state = 'play'; hideOv();
  Portal.gameplayStart();
  const cells = [];
  for (let y = 2; y <= 4; y++) for (let x = 2; x <= 4; x++) cells.push([y, x]);
  const others = [];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (S.grid[y][x] && !(y >= 2 && y <= 4 && x >= 2 && x <= 4)) others.push([y, x]);
  for (let i = 0; i < 6 && others.length; i++) cells.push(others.splice(Math.floor(rnd() * others.length), 1)[0]);
  Sound.bomb(); shake = L.cell * .3; flash = .3;
  for (const [y, x] of cells) {
    const d = S.grid[y][x]; if (!d) continue; const [px, py] = cellCenter(y, x);
    fx.push({ type: 'pop', x: px, y: py, v: d.v, wild: d.wild, t0: now, dur: .3 }); burstParticles(px, py, VALUE_COLORS[d.v] || '#fff', 8);
    S.grid[y][x] = null;
  }
  fx.push({ type: 'banner', text: 'REVIVED!', t0: now, dur: 1.2, color: '#55e08a' });
  fillTray();
}
async function onHammer() {
  Sound.click();
  if (S.hammer) { S.hammer = false; return; }
  if (save.hammer <= 0) {
    toast('Loading ad...');
    const ok = await Portal.rewarded('hammer');
    if (!ok) { toast('No ad available right now'); return; }
    save.hammer++; persist(); toast('+1 Hammer!'); Sound.coin();
  }
  S.hammer = true;
}
async function onRefresh() {
  Sound.click();
  if (S.busy) return;
  if (save.refresh <= 0) {
    toast('Loading ad...');
    const ok = await Portal.rewarded('refresh');
    if (!ok) { toast('No ad available right now'); return; }
    save.refresh++; persist(); Sound.coin();
  }
  save.refresh--; persist();
  fillTray(); Sound.rotate(); S.stuckHint = false;
  checkStuck();
}
function smash(r, c) {
  const d = S.grid[r][c]; const [px, py] = cellCenter(r, c);
  fx.push({ type: 'pop', x: px, y: py, v: d.v, wild: d.wild, t0: now, dur: .3 });
  fx.push({ type: 'hammer', x: px, y: py, t0: now, dur: .35 });
  burstParticles(px, py, VALUE_COLORS[d.v] || '#fff', 14);
  S.grid[r][c] = null; S.hammer = false; save.hammer--; persist();
  Sound.smash(); shake = L.cell * .15;
  checkStuck();
}

/* ------------------------------------------------------------------ bot (trailer autoplay) */
let botWait = 0.6;
function evalMove(p, r, c) {
  const g = S.grid.map(row => row.slice()); const pl = []; let sc = 0;
  for (const k of p.cells) { const y = r + k.dy, x = c + k.dx; g[y][x] = { v: k.v, wild: k.wild, bomb: k.bomb }; pl.push([y, x]); }
  if (p.cells[0].bomb) { let n = 0; for (let y = r - 1; y <= r + 1; y++) for (let x = c - 1; x <= c + 1; x++) if (g[y] && g[y][x] && !(y === r && x === c)) n++; return n * 8 - 12; }
  for (const [y, x] of pl) {
    const gr = findGroup(g, y, x);
    if (gr) sc += 40 + gr.v * 30 + gr.cells.length * 6 + (gr.v === 5 ? 250 : 0);
    else for (const [dy, dx] of DIRS) { const n = g[y + dy] && g[y + dy][x + dx]; if (n && !n.bomb) sc += (n.v === g[y][x].v) ? 7 : 1; }
    if (y === 0 || x === 0 || y === GRID - 1 || x === GRID - 1) sc += 1.5;
  }
  return sc;
}
function bestMove() {
  let best = null;
  for (let s = 0; s < 3; s++) {
    let p = S.tray[s]; if (!p) continue; const seen = new Set();
    for (let rot = 0; rot < 4; rot++) {
      const key = p.cells.map(k => k.dx + ',' + k.dy).join('|');
      if (!seen.has(key)) {
        seen.add(key);
        for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
          if (!canPlace(p, r, c)) continue;
          const sc = evalMove(p, r, c) - rot * .5 + rnd() * 3;
          if (!best || sc > best.sc) best = { slot: s, rot, r, c, sc };
        }
      }
      p = rotated(p);
    }
  }
  return best;
}
function botUpdate(dt) {
  if (S.state !== 'play' || S.busy || D) return;
  botWait -= dt; if (botWait > 0) return;
  const mv = bestMove(); if (!mv) { botWait = .5; return; }
  for (let i = 0; i < mv.rot; i++) S.tray[mv.slot] = rotated(S.tray[mv.slot]);
  if (mv.rot) { S.tray[mv.slot].rotT = now; Sound.rotate(); }
  const s = L.slots[mv.slot], p = S.tray[mv.slot], { w, h } = bbox(p);
  const tx = L.bx + L.pad + (mv.c + w / 2) * L.cell, ty = L.by + L.pad + (mv.r + h / 2) * L.cell;
  D = { bot: true, slot: mv.slot, x: s.x + s.w / 2, y: s.y + s.h / 2, sx: s.x + s.w / 2, sy: s.y + s.h / 2, tx, ty, t: 0, dur: .55, moved: false, lift: 0, delay: mv.rot ? .3 : .15, r: mv.r, c: mv.c, key: '' };
}
function botDrag(dt) {
  if (D.delay > 0) { D.delay -= dt; return; }
  D.moved = true;
  D.t = Math.min(1, D.t + dt / D.dur);
  const e = easeInOut(D.t);
  D.x = lerp(D.sx, D.tx, e); D.y = lerp(D.sy, D.ty, e) - Math.sin(e * Math.PI) * L.cell * .5;
  updateDrag();
  if (D.t >= 1) { const { slot, r, c } = D, p = S.tray[slot]; D = null; botWait = .3 + rnd() * .35; place(slot, p, r, c); }
}
function prefill(n) {
  // trailer opening: pairs of equal dice so merges and bursts come quickly
  for (const v of [5, 5, 4, 5, 4, 3]) {
    for (let t = 0; t < 60; t++) {
      const r = Math.floor(rnd() * GRID), c = Math.floor(rnd() * GRID), hz = rnd() < .5, r2 = r + (hz ? 0 : 1), c2 = c + (hz ? 1 : 0);
      if (r2 >= GRID || c2 >= GRID || S.grid[r][c] || S.grid[r2][c2]) continue;
      S.grid[r][c] = { v, wild: false, pop: -1, id: uid() }; S.grid[r2][c2] = { v, wild: false, pop: -1, id: uid() };
      if (findGroup(S.grid, r, c)) { S.grid[r][c] = S.grid[r2][c2] = null; continue; }
      n -= 2; break;
    }
  }
  let tries = 0;
  while (n > 0 && tries++ < 500) {
    const r = Math.floor(rnd() * GRID), c = Math.floor(rnd() * GRID);
    if (S.grid[r][c] || (r >= 2 && r <= 4 && c >= 2 && c <= 4 && rnd() < .6)) continue;
    const v = 1 + Math.floor(Math.pow(rnd(), 1.1) * 5);
    S.grid[r][c] = { v, wild: false, pop: -1, id: uid() };
    if (findGroup(S.grid, r, c)) { S.grid[r][c] = null; continue; }
    n--;
  }
}

/* ------------------------------------------------------------------ layout */
function layout() {
  W = window.innerWidth; H = window.innerHeight;
  DPR = CAPTURE ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  const portrait = H / W >= 1.08;
  L.portrait = portrait;
  if (portrait) {
    const top = Math.max(H * 0.15, 86);
    const bs = Math.min(W * 0.94, H * 0.54);
    Object.assign(L, { bs, bx: (W - bs) / 2, by: top });
    const below = L.by + bs, rem = H - below;
    const trayY = below + rem * 0.06, trayH = Math.min(rem * 0.58, bs * 0.42);
    const tw = Math.min(W * 0.98, bs * 1.06), sw = tw / 3;
    L.slots = [0, 1, 2].map(i => ({ x: (W - tw) / 2 + i * sw, y: trayY, w: sw, h: trayH }));
    const by = trayY + trayH + (H - trayY - trayH) * 0.48;
    const br = clamp(Math.min((H - trayY - trayH) * 0.34, bs * 0.08), 20, 72);
    L.btnHammer = { x: W / 2 - bs * 0.2, y: by, r: br };
    L.btnRefresh = { x: W / 2 + bs * 0.2, y: by, r: br };
    const pr = clamp(Math.min(top * 0.2, bs * 0.055), 18, 56);
    L.btnPause = { x: 14 + pr, y: top * 0.4, r: pr };
    L.scoreX = W / 2; L.scoreY = top * 0.42; L.scoreSize = clamp(Math.min(top * 0.4, bs * 0.12), 30, 130);
    L.bestX = W / 2; L.bestY = top * 0.8; L.bestSize = clamp(Math.min(top * 0.15, bs * 0.042), 14, 48);
    L.coinX = W - 14; L.coinY = top * 0.4; L.coinSize = clamp(Math.min(top * 0.14, bs * 0.038), 14, 44);
  } else {
    const bs = Math.min(H * 0.88, W * 0.6);
    const P = Math.min(bs * 0.52, W - bs - W * 0.08), gap = Math.max(W * 0.03, 16), total = bs + gap + P, sx = (W - total) / 2;
    Object.assign(L, { bs, bx: sx, by: (H - bs) / 2 });
    const px = sx + bs + gap;
    L.scoreX = px + P / 2; L.scoreY = L.by + bs * 0.08; L.scoreSize = clamp(bs * 0.1, 28, 70);
    L.bestX = px + P / 2; L.bestY = L.by + bs * 0.17; L.bestSize = clamp(bs * 0.04, 14, 26);
    const ty = L.by + bs * 0.23, th = bs * 0.2;
    L.slots = [0, 1, 2].map(i => ({ x: px, y: ty + i * th, w: P, h: th }));
    const br = clamp(bs * 0.06, 20, 64);
    L.btnHammer = { x: px + P * 0.3, y: L.by + bs * 0.92, r: br };
    L.btnRefresh = { x: px + P * 0.7, y: L.by + bs * 0.92, r: br };
    const pr = clamp(bs * 0.045, 18, 52);
    L.btnPause = { x: 16 + pr, y: 16 + pr, r: pr };
    L.coinX = W - 16; L.coinY = 16 + pr; L.coinSize = clamp(bs * 0.034, 14, 40);
  }
  L.pad = L.bs * 0.03;
  L.cell = (L.bs - 2 * L.pad) / GRID;
  L.slotCell = Math.min(...L.slots.map(s => Math.min(s.w / 3.3, s.h / 3.3)), L.cell * 0.8);
  bgCache = null;
}
window.addEventListener('resize', () => { if (!CAPTURE) layout(); });

/* ------------------------------------------------------------------ input */
function pt(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
const hitC = (b, x, y) => b && Math.hypot(x - b.x, y - b.y) <= b.r * 1.25;
function cellAt(x, y) {
  const c = Math.floor((x - L.bx - L.pad) / L.cell), r = Math.floor((y - L.by - L.pad) / L.cell);
  return (r >= 0 && c >= 0 && r < GRID && c < GRID) ? { r, c } : null;
}
function anchorFor(p, px, py) {
  const { w, h } = bbox(p);
  return { c: Math.round((px - w * L.cell / 2 - L.bx - L.pad) / L.cell), r: Math.round((py - h * L.cell / 2 - L.by - L.pad) / L.cell) };
}
function updateDrag() {
  const p = S.tray[D.slot]; if (!p) { D = null; return; }
  const a = anchorFor(p, D.x, D.y - D.lift);
  const key = a.r + ',' + a.c + ',' + p.cells.map(k => k.dx + '' + k.dy).join('');
  if (key === D.key) return;
  D.key = key; D.anchor = a; D.valid = canPlace(p, a.r, a.c); D.preview = null;
  if (D.valid && !p.cells[0].bomb) {
    const g = S.grid.map(row => row.slice()), pl = [];
    for (const k of p.cells) { const y = a.r + k.dy, x = a.c + k.dx; g[y][x] = { v: k.v, wild: k.wild }; pl.push([y, x]); }
    const set = new Set();
    for (const [y, x] of pl) { const gr = findGroup(g, y, x); if (gr) gr.cells.forEach(([yy, xx]) => set.add(yy * GRID + xx)); }
    D.preview = set.size ? set : null;
  } else if (D.valid) {
    const set = new Set();
    for (let y = a.r - 1; y <= a.r + 1; y++) for (let x = a.c - 1; x <= a.c + 1; x++) if (y >= 0 && x >= 0 && y < GRID && x < GRID) set.add(y * GRID + x);
    D.preview = set; D.bombPrev = true;
  }
}
canvas.addEventListener('pointerdown', e => {
  Sound.ensure();
  if (S.state !== 'play' || isPaused() || BOT) return;
  const { x, y } = pt(e);
  if (hitC(L.btnPause, x, y)) { Sound.click(); return pauseGame(); }
  if (hitC(L.btnHammer, x, y)) return onHammer();
  if (hitC(L.btnRefresh, x, y)) return onRefresh();
  if (S.hammer) {
    const cl = cellAt(x, y);
    if (cl && S.grid[cl.r][cl.c] && !S.busy) smash(cl.r, cl.c); else S.hammer = false;
    return;
  }
  for (let i = 0; i < 3; i++) {
    const s = L.slots[i];
    if (S.tray[i] && x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) {
      if (S.pending && S.pending.slot === i) return;
      D = { slot: i, x, y, sx: x, sy: y, t0: performance.now(), moved: false, lift: e.pointerType === 'mouse' ? L.cell * 0.15 : L.cell * 1.35, key: '' };
      try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      updateDrag();
      return;
    }
  }
});
canvas.addEventListener('pointermove', e => {
  if (!D || D.bot) return;
  const { x, y } = pt(e); D.x = x; D.y = y;
  if (Math.hypot(x - D.sx, y - D.sy) > 9) D.moved = true;
  updateDrag();
});
function endDrag() {
  if (!D || D.bot) return;
  const p = S.tray[D.slot];
  if (!p) { D = null; return; }
  if (!D.moved && performance.now() - D.t0 < 380) {
    S.tray[D.slot] = rotated(p); S.tray[D.slot].rotT = now; Sound.rotate(); D = null; return;
  }
  if (D.valid) {
    const { r, c } = D.anchor, slot = D.slot; D = null;
    if (S.busy) S.pending = { slot, p, r, c }; else place(slot, p, r, c);
  } else { if (D.moved) Sound.invalid(); D = null; }
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', () => { if (D && !D.bot) D = null; });
window.addEventListener('keydown', e => { if ((e.key === 'Escape' || e.key === 'p') && S.state === 'play' && !isPaused()) pauseGame(); });
document.addEventListener('contextmenu', e => e.preventDefault());

/* ------------------------------------------------------------------ rendering */
let bgCache = null;
function drawBg() {
  if (!bgCache || bgCache.width !== canvas.width || bgCache.height !== canvas.height) {
    bgCache = document.createElement('canvas'); bgCache.width = canvas.width; bgCache.height = canvas.height;
    const c = bgCache.getContext('2d'), cx = canvas.width / 2, cy = canvas.height * .45;
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height) * .8);
    g.addColorStop(0, '#2b3b8a'); g.addColorStop(.55, '#17205a'); g.addColorStop(1, '#080c26');
    c.fillStyle = g; c.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bgCache, 0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H * .45); ctx.rotate(now * .04);
  ctx.fillStyle = 'rgba(140,170,255,0.035)'; const R = Math.max(W, H);
  for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, -R * .14); ctx.lineTo(R, R * .14); ctx.fill(); }
  ctx.restore();
}

const spriteCache = new Map();
function dieSprite(skin, v, f, s) {
  s = Math.max(6, Math.round(s));
  const key = skin + '|' + v + '|' + (f.wild ? 1 : 0) + (f.bomb ? 1 : 0) + '|' + s;
  let cv = spriteCache.get(key);
  if (!cv) {
    const m = Math.ceil(s * .3); cv = document.createElement('canvas'); cv.width = cv.height = s + m * 2;
    drawDieRaw(cv.getContext('2d'), m, m, s, v, skin, f); cv._m = m; cv._s = s;
    spriteCache.set(key, cv);
    if (spriteCache.size > 500) spriteCache.delete(spriteCache.keys().next().value);
  }
  return cv;
}
function drawDie(cx, cy, s, v, f = {}, scale = 1, alpha = 1, rot = 0) {
  if (scale <= 0.01 || alpha <= 0) return;
  const sp = dieSprite(save.skin, v, f, s * DPR), k = s / sp._s;
  const w = sp.width * k * scale;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); if (rot) ctx.rotate(rot);
  ctx.drawImage(sp, -w / 2, -w / 2, w, w); ctx.restore();
}
function txt(s, x, y, size, fill = '#fff', stroke = '#0b1030', align = 'center', lw = .16) {
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (stroke) { ctx.lineWidth = size * lw * 2; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
}
function drawBoard() {
  const { bx, by, bs, pad, cell } = L;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#131b46'; rr(ctx, bx, by, bs, bs, bs * .05); ctx.fill(); ctx.restore();
  ctx.strokeStyle = S.hammer ? '#ff9a2e' : '#3a4fae'; ctx.lineWidth = Math.max(2, bs * .008); rr(ctx, bx, by, bs, bs, bs * .05); ctx.stroke();
  ctx.fillStyle = '#0c1233';
  for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) { rr(ctx, bx + pad + c * cell + cell * .05, by + pad + r * cell + cell * .05, cell * .9, cell * .9, cell * .18); ctx.fill(); }
}
function drawPiece(p, cx, cy, cs, alpha = 1, scale = 1) {
  const { w, h } = bbox(p);
  for (const k of p.cells) drawDie(cx + (k.dx - w / 2 + .5) * cs, cy + (k.dy - h / 2 + .5) * cs, cs * .9, k.v, k, scale, alpha);
}
function drawGrid() {
  const ds = L.cell * .9;
  for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
    const d = S.grid[r][c]; if (!d) continue;
    const [x, y] = cellCenter(r, c);
    const t = clamp((now - d.pop) / .28, 0, 1);
    let sc = d.pop < 0 ? 1 : lerp(.55, 1, easeOutBack(t)), rot = 0;
    if (S.hammer) rot = Math.sin(now * 18 + r + c * 2) * .06;
    if (d.bomb) sc *= 1 + Math.sin(now * 40) * .06;
    drawDie(x, y, ds, d.v, d, sc, 1, rot);
  }
}
function drawPreview() {
  if (!D || !D.moved || !D.valid) return;
  const p = S.tray[D.slot]; if (!p) return;
  for (const k of p.cells) { const [x, y] = cellCenter(D.anchor.r + k.dy, D.anchor.c + k.dx); drawDie(x, y, L.cell * .9, k.v, k, 1, .38); }
  if (D.preview) {
    const pulse = .55 + Math.sin(now * 10) * .35;
    ctx.save(); ctx.lineWidth = Math.max(2, L.cell * .07); ctx.strokeStyle = D.bombPrev ? `rgba(255,150,40,${pulse})` : `rgba(255,255,255,${pulse})`;
    ctx.shadowColor = D.bombPrev ? '#ff9a2e' : '#ffffff'; ctx.shadowBlur = L.cell * .25;
    for (const k of D.preview) { const r = Math.floor(k / GRID), c = k % GRID; const [x, y] = cellCenter(r, c); rr(ctx, x - L.cell * .46, y - L.cell * .46, L.cell * .92, L.cell * .92, L.cell * .2); ctx.stroke(); }
    ctx.restore();
  }
}
function drawTray() {
  for (let i = 0; i < 3; i++) {
    const p = S.tray[i], s = L.slots[i]; if (!p) continue;
    if (D && D.slot === i && D.moved) continue;
    if (S.pending && S.pending.slot === i) continue;
    const fits = fitsAnywhere(p);
    const t = clamp((now - p.spawn) / .35, 0, 1), sc = easeOutBack(t);
    let rotA = 0;
    if (p.rotT != null) { const rt = clamp((now - p.rotT) / .18, 0, 1); rotA = (1 - easeOutCubic(rt)) * -Math.PI / 2; }
    ctx.save(); ctx.translate(s.x + s.w / 2, s.y + s.h / 2); if (rotA) ctx.rotate(rotA);
    const bb = bbox(p), cs = Math.min(s.w / (bb.w + .6), s.h / (bb.h + .6), L.cell * .74);
    drawPiece(p, 0, 0, cs, fits ? 1 : .35, sc * (D && D.slot === i ? 1.08 : 1));
    ctx.restore();
  }
}
function drawDragged() {
  if (S.pending) {
    const p = S.pending.p, { w, h } = bbox(p);
    drawPiece(p, L.bx + L.pad + (S.pending.c + w / 2) * L.cell, L.by + L.pad + (S.pending.r + h / 2) * L.cell, L.cell, .9);
  }
  if (!D || !D.moved) return;
  const p = S.tray[D.slot]; if (!p) return;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 14;
  drawPiece(p, D.x, D.y - D.lift, L.cell * 1.02, 1, 1);
  ctx.restore();
  if (D.bot) { // trailer finger
    const x = D.x + L.cell * .25, y = D.y + L.cell * .35;
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.strokeStyle = 'rgba(20,20,60,.6)'; ctx.lineWidth = L.cell * .05;
    ctx.beginPath(); ctx.arc(x, y, L.cell * .22, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(x, y, L.cell * .4, 0, 7); ctx.fill(); ctx.restore();
  }
}
function drawFx() {
  for (const f of fx) {
    const t = (now - f.t0) / f.dur;
    if (f.type === 'fly') {
      if (t > 1) continue; const e = t * t;
      drawDie(lerp(f.x0, f.x1, e), lerp(f.y0, f.y1, e), L.cell * .9, f.v, f, lerp(1, .7, t), 1);
    } else if (f.type === 'pop') {
      if (t > 1) continue;
      if (t < 0) drawDie(f.x, f.y, L.cell * .9, f.v, f, 1, 1);
      else drawDie(f.x, f.y, L.cell * .9, f.v, f, 1 + t * .4, 1 - t, t * 1.5);
    } else if (f.type === 'ring') {
      if (t > 1) continue; ctx.save(); ctx.strokeStyle = f.color; ctx.globalAlpha = 1 - t; ctx.lineWidth = L.cell * .12 * (1 - t) + 1;
      ctx.beginPath(); ctx.arc(f.x, f.y, L.cell * (f.big ? 1.6 : .7) * easeOutCubic(t) + L.cell * .3, 0, 7); ctx.stroke(); ctx.restore();
    } else if (f.type === 'laser') {
      if (t > 1) continue;
      const [x, y] = cellCenter(f.r, f.c), a = t < .15 ? t / .15 : 1 - (t - .15) / .85, w = L.cell * (.9 * a + .1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const [col, ww] of [['rgba(255,77,139,.55)', w], ['rgba(255,190,230,.8)', w * .45], ['rgba(255,255,255,.95)', w * .16]]) {
        ctx.fillStyle = col;
        ctx.fillRect(L.bx, y - ww / 2, L.bs, ww); ctx.fillRect(x - ww / 2, L.by, ww, L.bs);
      }
      ctx.restore();
    } else if (f.type === 'hammer') {
      if (t > 1) continue; ctx.save(); ctx.translate(f.x + L.cell * .3, f.y - L.cell * .3); ctx.rotate(-1.2 + easeOutBack(Math.min(1, t * 2)) * 1.0); ctx.globalAlpha = 1 - Math.max(0, t - .6) / .4;
      iconHammer(0, -L.cell * .2, L.cell * 1.2); ctx.restore();
    }
  }
}
function drawParticles() {
  for (const p of parts) {
    if (p.age < 0) continue;
    const a = 1 - p.age / p.life; ctx.globalAlpha = clamp(a, 0, 1); ctx.fillStyle = p.color;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    if (p.sq) { rr(ctx, -p.size, -p.size, p.size * 2, p.size * 2, p.size * .4); ctx.fill(); } else { star(ctx, 0, 0, p.size * 1.4, p.size * .6); ctx.fill(); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function drawTexts() {
  for (const f of fx) {
    const t = (now - f.t0) / f.dur; if (t < 0 || t > 1) continue;
    if (f.type === 'text') {
      const s = f.size * (t < .15 ? easeOutBack(t / .15) : 1);
      ctx.save(); ctx.globalAlpha = t > .7 ? 1 - (t - .7) / .3 : 1;
      txt(f.text, f.x, f.y - L.cell * .7 * easeOutCubic(t), s, f.color, '#120a33', 'center', .14); ctx.restore();
    } else if (f.type === 'banner') {
      const s = Math.min(L.bs * .14, L.bs / (f.text.length * .55)) * (t < .18 ? easeOutBack(t / .18) : 1);
      ctx.save(); ctx.globalAlpha = t > .75 ? 1 - (t - .75) / .25 : 1;
      ctx.translate(L.bx + L.bs / 2, L.by + L.bs * .42); ctx.rotate(-.06);
      txt(f.text, 0, 0, s, f.color, '#1a0a3a', 'center', .14); ctx.restore();
    }
  }
}
function iconHammer(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.6);
  ctx.fillStyle = '#7a4a1e'; rr(ctx, -s * .08, -s * .05, s * .16, s * .6, s * .05); ctx.fill();
  ctx.fillStyle = '#c98a4b'; rr(ctx, -s * .055, -s * .05, s * .06, s * .58, s * .03); ctx.fill();
  ctx.fillStyle = '#9aa3b8'; rr(ctx, -s * .34, -s * .32, s * .68, s * .3, s * .07); ctx.fill();
  ctx.fillStyle = '#dfe4f0'; rr(ctx, -s * .34, -s * .32, s * .68, s * .15, s * .07); ctx.fill();
  ctx.restore();
}
function iconRefresh(x, y, s) {
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = s * .13; ctx.lineCap = 'round';
  for (const off of [0, Math.PI]) {
    ctx.beginPath(); ctx.arc(x, y, s * .3, off + .35, off + Math.PI - .35); ctx.stroke();
    const a = off + Math.PI - .35, ax = x + Math.cos(a) * s * .3, ay = y + Math.sin(a) * s * .3, tg = a + Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(ax + Math.cos(tg) * s * .17, ay + Math.sin(tg) * s * .17);
    ctx.lineTo(ax + Math.cos(a) * s * .15, ay + Math.sin(a) * s * .15); ctx.lineTo(ax - Math.cos(a) * s * .15, ay - Math.sin(a) * s * .15); ctx.fill();
  }
  ctx.restore();
}
function iconCoin(x, y, r) {
  const g = ctx.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); g.addColorStop(0, '#fff3a8'); g.addColorStop(.5, '#ffd23f'); g.addColorStop(1, '#d38b0c');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#e7a51b'; ctx.lineWidth = r * .18; ctx.beginPath(); ctx.arc(x, y, r * .68, 0, 7); ctx.stroke();
}
function iconCrown(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#6a3a00'; ctx.lineWidth = s * .1; ctx.lineJoin = 'round';
  ctx.beginPath(); [[-.5, .32], [-.5, -.2], [-.24, .06], [0, -.36], [.24, .06], [.5, -.2], [.5, .32]].forEach(([a, b], i) => i ? ctx.lineTo(a * s, b * s) : ctx.moveTo(a * s, b * s)); ctx.closePath(); ctx.stroke(); ctx.fill();
  ctx.restore();
}
function roundBtn(b, color, icon, badge, adBadge, active) {
  const { x, y, r } = b;
  ctx.save();
  ctx.fillStyle = mix(color, '#000000', .45); ctx.beginPath(); ctx.arc(x, y + r * .14, r, 0, 7); ctx.fill();
  const g = ctx.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, mix(color, '#ffffff', .25)); g.addColorStop(1, color);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  if (active) { ctx.strokeStyle = '#ffe34d'; ctx.lineWidth = r * .14; ctx.beginPath(); ctx.arc(x, y, r * 1.1, 0, 7); ctx.stroke(); }
  icon(x, y, r * 1.25);
  if (adBadge && Portal.portal !== 'web') {
    const bw = r * .95, bh = r * .5, bx = x + r * .25, by = y - r * 1.05;
    ctx.fillStyle = '#a8560a'; rr(ctx, bx, by + bh * .12, bw, bh, bh * .4); ctx.fill();
    ctx.fillStyle = '#ff9a2e'; rr(ctx, bx, by, bw, bh, bh * .4); ctx.fill();
    txt('AD', bx + bw / 2, by + bh / 2, bh * .7, '#fff', null);
  } else if (badge != null) {
    const br = r * .4, bx = x + r * .72, by = y - r * .72;
    ctx.fillStyle = '#ff4d8b'; ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = br * .18; ctx.stroke();
    txt(String(badge), bx, by + br * .04, br * 1.2, '#fff', null);
  }
  ctx.restore();
}
function drawHud() {
  txt(fmt(S.shown), L.scoreX, L.scoreY, L.scoreSize, '#ffffff', '#0b1030', 'center', .12);
  const best = Math.max(save.best, S.score);
  ctx.font = `${L.bestSize}px ${FONT}`; const bw = ctx.measureText(fmt(best)).width;
  iconCrown(L.bestX - bw / 2 - L.bestSize * .7, L.bestY, L.bestSize * 1.1);
  txt(fmt(best), L.bestX + L.bestSize * .2, L.bestY, L.bestSize, '#ffd84a', '#0b1030', 'center', .14);
  // coins
  ctx.font = `${L.coinSize}px ${FONT}`; const cw = ctx.measureText(fmt(save.coins)).width;
  const ph = L.coinSize * 1.7, pw = cw + ph * 1.5, px = L.coinX - pw, py = L.coinY - ph / 2;
  ctx.fillStyle = 'rgba(5,8,30,.55)'; rr(ctx, px, py, pw, ph, ph / 2); ctx.fill();
  iconCoin(px + ph / 2, L.coinY, ph * .36);
  txt(fmt(save.coins), px + ph * .95, L.coinY, L.coinSize, '#ffe9a0', null, 'left');
  // pause
  roundBtn(L.btnPause, '#4b5aa8', (x, y, s) => { ctx.fillStyle = '#fff'; rr(ctx, x - s * .22, y - s * .26, s * .15, s * .52, s * .05); ctx.fill(); rr(ctx, x + s * .07, y - s * .26, s * .15, s * .52, s * .05); ctx.fill(); });
  // boosters
  roundBtn(L.btnHammer, '#ff8a3d', (x, y, s) => iconHammer(x, y + s * .02, s * .8), save.hammer, save.hammer <= 0, S.hammer);
  roundBtn(L.btnRefresh, '#3aa2ff', (x, y, s) => iconRefresh(x, y, s), save.refresh, save.refresh <= 0);
  if (S.stuckHint) {
    const a = .6 + Math.sin(now * 6) * .4;
    ctx.save(); ctx.globalAlpha = a;
    txt('NO MOVES - USE A BOOSTER!', (L.btnHammer.x + L.btnRefresh.x) / 2, L.btnHammer.y - L.btnHammer.r * (L.portrait ? 1.9 : 1.7), Math.min(L.cell * .32, 22), '#ffe34d');
    ctx.restore();
  }
  if (S.hammer) txt('TAP A DIE TO SMASH IT', L.bx + L.bs / 2, L.by - Math.min(L.cell * .3, 20), Math.min(L.cell * .32, 20), '#ffb36b');
  // combo badge
  if (S.combo >= 2 && now - S.comboT < 1.8) {
    const t = clamp((now - S.comboT) / .25, 0, 1);
    ctx.save(); ctx.translate(L.bx + L.bs - L.cell * 1.2, L.by - L.cell * .05); ctx.scale(easeOutBack(t), easeOutBack(t));
    const w = L.cell * 2, h = L.cell * .55;
    ctx.fillStyle = '#7a1e4c'; rr(ctx, -w / 2, -h / 2 + h * .12, w, h, h / 2); ctx.fill();
    ctx.fillStyle = '#ff4d8b'; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
    txt('COMBO x' + S.combo, 0, h * .03, h * .62, '#fff', null); ctx.restore();
  }
}
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawBg();
  if (S.state === 'boot') return;
  ctx.save();
  if (shake > .5) ctx.translate((rnd() - .5) * shake, (rnd() - .5) * shake);
  drawBoard(); drawGrid(); drawPreview(); drawFx(); drawParticles();
  ctx.restore();
  drawHud(); drawTray(); drawDragged(); drawTexts();
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash * .5})`; ctx.fillRect(0, 0, W, H); }
}

/* ------------------------------------------------------------------ loop */
function update(dt) {
  now += dt;
  for (let i = timers.length - 1; i >= 0; i--) if (timers[i].t <= now) { const t = timers.splice(i, 1)[0]; t.res(); }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.age += dt; if (p.age < 0) continue;
    p.vy += L.cell * 9 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.age > p.life) parts.splice(i, 1);
  }
  for (let i = fx.length - 1; i >= 0; i--) if (now - fx[i].t0 > fx[i].dur + .05) fx.splice(i, 1);
  shake = Math.max(0, shake - dt * L.cell * 1.4); flash = Math.max(0, flash - dt * 1.6);
  S.shown += (S.score - S.shown) * Math.min(1, dt * 9); if (Math.abs(S.score - S.shown) < 1) S.shown = S.score;
  if (D && D.bot) botDrag(dt);
  if (BOT) botUpdate(dt);
}
function step(dt) { if (!isPaused()) update(dt); render(); }
let last = 0;
function frame(ts) { const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; step(dt); requestAnimationFrame(frame); }

/* ------------------------------------------------------------------ DOM / flow */
const $ = id => document.getElementById(id);
function showOv(id) { document.querySelectorAll('.ov').forEach(o => o.classList.toggle('show', o.id === id)); }
function hideOv() { document.querySelectorAll('.ov').forEach(o => o.classList.remove('show')); }
let toastT = 0;
function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1600); }
function soundLabel() { const l = 'SOUND: ' + (save.sound ? 'ON' : 'OFF'); $('bSound').textContent = l; $('bPSound').textContent = l; }
function toggleSound() { save.sound = !save.sound; Sound.setMuted(!save.sound); soundLabel(); persist(); Sound.click(); }

function startGame() {
  S.grid = emptyGrid(); S.score = 0; S.shown = 0; S.busy = false; S.hammer = false; S.revived = false; S.combo = 0; S.comboT = -9; S.placed = 0; S.newBest = false; S.pending = null; S.stuckHint = false;
  fx.length = 0; parts.length = 0; timers.length = 0; D = null;
  if (CAPTURE) prefill(20);
  fillTray();
  S.state = 'play'; hideOv(); pauseReasons.delete('menu');
  Portal.gameplayStart();
}
function goMenu() {
  S.state = 'menu'; Portal.gameplayStop();
  $('menuBest').textContent = fmt(save.best);
  drawMenuLogo(); showOv('menu');
}
function pauseGame() { S.state = 'paused'; pauseReasons.add('overlay'); Portal.gameplayStop(); soundLabel(); showOv('pause'); }
function resumeGame() { pauseReasons.delete('overlay'); S.state = 'play'; hideOv(); Portal.gameplayStart(); }
function gameOver() {
  S.state = 'over'; Portal.gameplayStop(); Sound.over();
  const coins = Math.floor(S.score / 40);
  const isBest = S.score > save.best;
  save.best = Math.max(save.best, S.score); save.coins += coins; save.games++; persist();
  S.lastCoins = coins;
  $('ovScore').textContent = fmt(S.score); $('ovBest').textContent = fmt(save.best); $('ovCoins').textContent = fmt(coins);
  $('newBest').classList.toggle('show', isBest && S.score > 0);
  $('bDouble').disabled = coins <= 0;
  if (BOT) { setTimeout(startGame, 500); return; }
  showOv('over');
}
function drawMenuLogo() {
  const c = $('logo').getContext('2d'); c.clearRect(0, 0, 900, 520); drawLogo(c, 900, 520);
}

function btn(label, cls, fn) { const b = document.createElement('button'); b.className = 'btn small ' + cls; b.textContent = label; b.onclick = () => { Sound.click(); fn(); }; return b; }
function renderShop() {
  $('shopCoins').textContent = fmt(save.coins);
  const grid = $('skinGrid'); grid.innerHTML = '';
  for (const sk of SKINS) {
    const owned = save.owned.includes(sk.id), sel = save.skin === sk.id;
    const card = document.createElement('div'); card.className = 'skin' + (sel ? ' sel' : '');
    const cv = document.createElement('canvas'); cv.width = 300; cv.height = 120; const c = cv.getContext('2d');
    [1, 3, 6].forEach((v, i) => drawDieRaw(c, 14 + i * 96, 14, 80, v, sk.id));
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = sk.name;
    card.append(cv, nm);
    if (owned) card.append(btn(sel ? 'SELECTED' : 'SELECT', sel ? 'gray' : 'green', () => { save.skin = sk.id; persist(); spriteCache.clear(); renderShop(); }));
    else {
      card.append(btn(fmt(sk.price) + ' COINS', 'gold', () => {
        if (save.coins < sk.price) { toast('Not enough coins'); return; }
        save.coins -= sk.price; save.owned.push(sk.id); save.skin = sk.id; persist(); Sound.coin(); spriteCache.clear(); renderShop();
      }));
      const prog = save.adProg[sk.id] || 0;
      const ab = btn(`WATCH AD ${prog}/${sk.ads}`, 'purple', async () => {
        ab.disabled = true; const ok = await Portal.rewarded('skin_' + sk.id); ab.disabled = false;
        if (!ok) { toast('No ad available right now'); return; }
        save.adProg[sk.id] = (save.adProg[sk.id] || 0) + 1;
        if (save.adProg[sk.id] >= sk.ads) { save.owned.push(sk.id); save.skin = sk.id; spriteCache.clear(); toast(sk.name + ' unlocked!'); Sound.coin(); }
        persist(); renderShop();
      });
      card.append(ab);
    }
    grid.append(card);
  }
}

function wire() {
  $('bPlay').onclick = async () => {
    Sound.ensure(); Sound.click();
    if (S.firstPlay && Portal.portal === 'gamedistribution') await Portal.interstitial('preroll');
    S.firstPlay = false; startGame();
  };
  $('bSkins').onclick = () => { Sound.ensure(); Sound.click(); renderShop(); showOv('shop'); };
  $('bShopBack').onclick = () => { Sound.click(); goMenu(); };
  $('bFreeCoins').onclick = async () => {
    Sound.click(); const b = $('bFreeCoins'); b.disabled = true;
    const ok = await Portal.rewarded('free_coins'); b.disabled = false;
    if (ok) { save.coins += 100; persist(); Sound.coin(); toast('+100 coins!'); renderShop(); } else toast('No ad available right now');
  };
  $('bSound').onclick = () => { Sound.ensure(); toggleSound(); };
  $('bPSound').onclick = toggleSound;
  $('bResume').onclick = () => { Sound.click(); resumeGame(); };
  $('bRestart').onclick = async () => { Sound.click(); pauseReasons.delete('overlay'); hideOv(); await Portal.interstitial('restart'); startGame(); };
  $('bHome').onclick = async () => { Sound.click(); pauseReasons.delete('overlay'); hideOv(); await Portal.interstitial('home'); goMenu(); };
  $('bRevive').onclick = async () => {
    Sound.click(); const b = $('bRevive'); b.disabled = true;
    const ok = await Portal.rewarded('revive'); b.disabled = false;
    if (ok) doRevive(); else toast('No ad available right now');
  };
  $('bNoRevive').onclick = () => { Sound.click(); gameOver(); };
  $('bDouble').onclick = async () => {
    Sound.click(); const b = $('bDouble'); b.disabled = true;
    const ok = await Portal.rewarded('double_coins');
    if (ok) { save.coins += S.lastCoins; persist(); Sound.coin(); $('ovCoins').textContent = fmt(S.lastCoins * 2); toast('Coins doubled!'); } else { b.disabled = false; toast('No ad available right now'); }
  };
  $('bAgain').onclick = async () => { Sound.click(); hideOv(); await Portal.interstitial('game_over'); startGame(); };
  $('bOverHome').onclick = async () => { Sound.click(); hideOv(); await Portal.interstitial('game_over'); goMenu(); };
  document.addEventListener('visibilitychange', () => {
    Sound.setHidden(document.hidden);
    if (document.hidden && S.state === 'play' && !BOT) pauseGame();
  });
}

async function boot() {
  layout();
  if (!CAPTURE) requestAnimationFrame(frame);
  await Portal.init({
    pause: reason => { pauseReasons.add(reason === 'hidden' ? 'hidden' : 'ad'); Sound.setAdMute(true); },
    resume: reason => { pauseReasons.delete(reason === 'hidden' ? 'hidden' : 'ad'); Sound.setAdMute(false); },
  });
  const loaded = await Portal.load();
  if (loaded) save = Object.assign({}, DEFAULT_SAVE, loaded, { adProg: Object.assign({}, loaded.adProg || {}) });
  if (!Array.isArray(save.owned) || !save.owned.includes('classic')) save.owned = ['classic'].concat(save.owned || []);
  if (!save.owned.includes(save.skin)) save.skin = 'classic';
  Sound.setMuted(!save.sound);
  try { await Promise.race([document.fonts.load(`40px 'Lilita One'`), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
  spriteCache.clear();
  wire(); soundLabel();
  Portal.loadingDone();
  if (CAPTURE || BOT) { hideOv(); if (Q.get('skin')) save.skin = Q.get('skin'); save.hammer = 0; save.refresh = 0; startGame(); window.__ready = true; }
  else goMenu();
}

/* trailer capture hooks */
window.__step = dt => step(dt);
window.__dbg = () => ({ L, S, save });
window.__state = () => ({ score: S.score, state: S.state });
boot();
})();
