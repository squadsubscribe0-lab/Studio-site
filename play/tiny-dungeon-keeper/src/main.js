import { Brain, ACTIONS } from './brain.js';
import { LEVELS, THEMES } from './levels.js';
import { play, sound, loadAudio, unlockAudio, setMusic, setSfx, duck } from './audio.js';

/* ═════════════════════════ constants ═════════════════════════ */
const W = 1280, H = 720;
const T = 40;                  // tile size (world px)
const TOP = 72;                // HUD height
const BAR = 632;               // bottom bar y
const VIEW_H = BAR - TOP;      // 560
const GRAVITY = 2000;
const STEP = 1 / 120;
const FONT = 'SG, "Trebuchet MS", system-ui, sans-serif';
const INK = '#1b1f3b';

// mount: floor = stands on ground · ceiling = hangs under a ceiling · air = floats anywhere · any = floor or mid-air
const TRAPS = {
  block:       { name: 'Block',         price: 3,  mount: 'floor',   tip: 'A brick wall. Reshape the path — heroes can only hop 2 tiles high.' },
  spring:      { name: 'Spring',        price: 4,  mount: 'floor',   tip: 'Bounces heroes backwards. Put it before a pit!' },
  spikes:      { name: 'Spikes',        price: 6,  mount: 'floor',   tip: 'Pointy floor: 60 damage. Two in a row finish a hero.' },
  slime:       { name: 'Slime Pit',     price: 6,  mount: 'floor',   tip: 'Sticky goo. Heroes that stay in it sink.' },
  fire:        { name: 'Fire Vent',     price: 10, mount: 'floor',   tip: 'Blasts a tall flame on a timer.' },
  spikeball:   { name: 'Spike Ball',    price: 8,  mount: 'air',     tip: 'Floats anywhere in mid-air. Great for catching jumpers!' },
  rock:        { name: 'Falling Rock',  price: 8,  mount: 'ceiling', tip: 'Drops when a hero walks close. Needs a ceiling.' },
  saw:         { name: 'Saw Blade',     price: 12, mount: 'floor',   tip: 'Rolls back and forth, cutting again and again.' },
  axe:         { name: 'Swing Axe',     price: 12, mount: 'ceiling', tip: 'A pendulum — timing is everything.' },
  firecannon:  { name: 'Fire Cannon',   price: 14, mount: 'any',     tip: 'Shoots fireballs that set heroes on fire. Place it on the floor or in mid-air.' },
  bomb:        { name: 'Bomb Barrel',   price: 12, mount: 'floor',   tip: 'Lights up when heroes come close, then BOOM.' },
  croc:        { name: 'Croc Pond',     price: 16, mount: 'floor',   tip: 'A hungry crocodile leaps out and snaps — even at heroes jumping over!' },
  wheel:       { name: 'Stone Wheel',   price: 14, mount: 'floor',   tip: 'Rolls at incoming heroes. They must jump it.' },
  icecannon:   { name: 'Ice Cannon',    price: 13, mount: 'any',     tip: 'Freezes heroes in place. Frozen heroes take 50% more damage.' },
  cannon:      { name: 'Cannon',        price: 15, mount: 'floor',   tip: 'Fires heavy cannonballs at the nearest heroes.' },
  loglauncher: { name: 'Log Launcher',  price: 14, mount: 'floor',   tip: 'Launches rolling logs down the path.' },
  cage:        { name: 'Drop Cage',     price: 14, mount: 'ceiling', tip: 'Snaps shut on heroes right below.' },
};
const UNLOCK = Object.keys(TRAPS);
const BRAIN_KINDS = UNLOCK.filter((k) => k !== 'block');
const PREMIUM = ['croc', 'firecannon', 'icecannon', 'loglauncher', 'cage', 'axe'];
const BACK_LAYER = (k) => TRAPS[k].mount === 'floor';

const CLASSES = {
  hero:   { name: 'The Hero',   speed: 100, hp: 100, reward: 1, dmg: 1, w: 22, h: 34, draw: 48 },
  thief:  { name: 'The Runner', speed: 140, hp: 70,  reward: 1, dmg: 2, w: 20, h: 32, draw: 46 },
  knight: { name: 'The Knight', speed: 78,  hp: 220, reward: 2, dmg: 3, w: 24, h: 36, draw: 52 },
  barb:   { name: 'The Brute',  speed: 82,  hp: 260, reward: 3, dmg: 4, w: 26, h: 36, draw: 52 },
  wizard: { name: 'The Wizard', speed: 90,  hp: 90,  reward: 2, dmg: 2, w: 22, h: 34, draw: 50 },
};
const CLASS_ORDER = ['hero', 'thief', 'knight', 'barb', 'wizard'];
const LAUGHS = ['Mwahaha!', 'Hehehe!', 'Too easy!', 'Bwahaha!', 'Next!'];
const SADS = ['Nooo!', 'My gold!', 'Not fair!', 'Grrr…'];

/* ═════════════════════════ platform (ads / portal SDKs) ═════════════════════════ */
const STUB = {
  name: 'standalone', hasRewarded: true,
  loadingStart() {}, loadingStop() {}, ready() {}, gameplayStart() {}, gameplayStop() {}, happyTime() {},
  interstitial: () => Promise.resolve(),
  rewarded: () => new Promise((r) => setTimeout(() => r(true), 400)),
};
const P = () => window.Platform || STUB;
const pcall = (fn, ...a) => { try { return P()[fn]?.(...a); } catch (e) { return undefined; } };
// portal adapters call these
window.Game = {
  mute(on) { duck(on); },
  pause() { if (S.screen !== 'title') S.adPause = true; },
  resume() { S.adPause = false; },
};

async function showInterstitial() {
  S.adBusy = true;
  try { await P().interstitial(); } catch (e) {}
  S.adBusy = false;
}
async function showRewarded() {
  S.adBusy = true;
  let ok = false;
  try { ok = !!(await P().rewarded()); } catch (e) {}
  S.adBusy = false;
  if (!ok) toast('No ad available right now — try again later', 1.8);
  return ok;
}
const adLabel = () => (P().name === 'standalone' || P().name === 'selfhost' ? 'FREE' : 'AD');

/* ═════════════════════════ canvas & assets ═════════════════════════ */
const canvas = document.getElementById('game');
const g = canvas.getContext('2d');

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.min(vw / W, vh / H);
  canvas.style.width = W * scale + 'px';
  canvas.style.height = H * scale + 'px';
  canvas.width = Math.round(W * scale * dpr);
  canvas.height = Math.round(H * scale * dpr);
  canvas.style.left = (vw - W * scale) / 2 + 'px';
  canvas.style.top = (vh - H * scale) / 2 + 'px';
  g.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  g.imageSmoothingQuality = 'high';
}
window.addEventListener('resize', resize);

const IMG = {};
async function loadAssets() {
  const meta = await (await fetch('assets/sprites/sprites.json')).json();
  const names = Object.keys(meta);
  let done = 0;
  const total = names.length + 52;
  const tick = () => { S.loadP = Math.min(1, ++done / total); };
  const imgs = Promise.all(names.map((n) => new Promise((res) => {
    const im = new Image();
    im.onload = im.onerror = () => { tick(); res(); };
    im.src = `assets/sprites/${n}.png`;
    IMG[n] = im;
  })));
  const font = (async () => {
    try {
      const f = new FontFace('SG', 'url(assets/fonts/space-grotesk-latin.woff2)', { weight: '300 700' });
      document.fonts.add(await f.load());
    } catch (e) {}
    tick();
  })();
  await Promise.all([imgs, font, loadAudio(() => tick())]);
  S.loadP = 1;
}

function spr(name, x, y, h, o = {}) {
  const im = o.tint ? tinted(name, o.tint) : IMG[name];
  if (!im || !im.width) return;
  const w = (im.width * h) / im.height;
  g.save();
  g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  if (o.flip) g.scale(-1, 1);
  if (o.sx || o.sy) g.scale(o.sx || 1, o.sy || 1);
  if (o.alpha != null) g.globalAlpha *= o.alpha;
  g.drawImage(im, -w / 2, o.center ? -h / 2 : -h, w, h);
  g.restore();
}
const sprW = (name, x, y, w, o) => { const im = IMG[name]; if (im && im.width) spr(name, x, y, (w / im.width) * im.height, o); };

/** A coloured copy of a sprite (red when hit, blue when frozen…). */
const tintCache = {};
function tinted(name, color) {
  const key = name + color;
  if (tintCache[key]) return tintCache[key];
  const im = IMG[name];
  if (!im || !im.width) return im;
  const c = document.createElement('canvas');
  c.width = im.width; c.height = im.height;
  const b = c.getContext('2d');
  b.drawImage(im, 0, 0);
  b.globalCompositeOperation = 'source-atop';
  b.globalAlpha = 0.62;
  b.fillStyle = color;
  b.fillRect(0, 0, c.width, c.height);
  tintCache[key] = c;
  return c;
}

/* ═════════════════════════ state ═════════════════════════ */
const brain = new Brain();
let progress = { unlocked: 1, stars: {} };
try { progress = { ...progress, ...JSON.parse(localStorage.getItem('tdk_progress3') || 'null') }; } catch (e) {}
const saveProgress = () => { try { localStorage.setItem('tdk_progress3', JSON.stringify(progress)); } catch (e) {} };

const S = {
  screen: 'loading', loadP: 0, menu: null, levelIndex: 0, theme: THEMES.meadow,
  grid: [], cols: 0, rows: 0, door: null, goal: null, decor: [],
  traps: [], heroes: [], balls: [], particles: [], coinsFly: [], floaters: [], toasts: [],
  coins: 0, hp: 100, maxHp: 100, wave: 0, kills: 0, escaped: 0,
  waveStats: null, lastKillRate: null, nextWave: [],
  spawnQueue: [], spawnT: 0, stepT: 0,
  offers: [], selected: null, sellMode: false, freeTrap: null, bonusSlots: 0, slotsAdUsed: false, crateUsed: false,
  speed: 1, paused: false, adPause: false, adBusy: false, showBrain: false, showHeat: false, heat: [],
  cam: { x: 0, y: 0, z: 1, follow: true },
  shake: 0, mood: 'idle', moodT: 0, speech: null, laughT: 0, time: 0, hover: null, tutorial: true, minimap: null,
  clouds: [], stars: [], summaryT: 0, winStars: 0, doubled: false,
};
let nextId = 1;

/* ═════════════════════════ level helpers ═════════════════════════ */
const solidAt = (c, r) => (c < 0 || c >= S.cols ? true : r < 0 || r >= S.rows ? false : S.grid[r][c] !== 0);
const solidPx = (x, y) => solidAt(Math.floor(x / T), Math.floor(y / T));
const worldW = () => S.cols * T;
const worldH = () => S.rows * T;

function loadLevel(i) {
  const L = LEVELS[i];
  S.levelIndex = i;
  S.theme = THEMES[L.theme];
  S.rows = L.map.length;
  S.cols = L.map[0].length;
  S.grid = [];
  S.decor = [];
  L.map.forEach((row, r) => {
    S.grid.push([...row].map((ch, c) => {
      if (ch === 'D') S.door = { c, r };
      if (ch === 'C') S.goal = { c, r };
      if ('fkt'.includes(ch)) S.decor.push({ c, r, ch });
      return ch === '#' ? 1 : ch === 'B' ? 2 : ch === 'S' ? 3 : 0;
    }));
  });
  S.traps = []; S.heroes = []; S.balls = []; S.particles = []; S.coinsFly = []; S.floaters = [];
  S.coins = 45 + i * 10;
  S.hp = S.maxHp = 100;
  S.wave = 0; S.kills = 0; S.escaped = 0; S.lastKillRate = null; S.waveStats = null;
  S.selected = null; S.sellMode = false; S.freeTrap = null; S.bonusSlots = 0; S.slotsAdUsed = false; S.crateUsed = false;
  S.screen = 'build'; S.paused = false; S.menu = null; S.speech = null;
  S.heat = Array.from({ length: S.rows }, () => Array(S.cols).fill(0));
  S.clouds = Array.from({ length: 9 }, (_, k) => ({ x: Math.random() * 2400, y: 20 + Math.random() * 160, s: 0.6 + Math.random() * 0.7, k }));
  S.stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * 320, p: Math.random() * 6 }));
  const cam = S.cam;
  cam.z = Math.min(1.05, VIEW_H / worldH());
  cam.x = 0;
  cam.y = 1e9;
  cam.follow = true;
  clampCam();
  planWave();
  rollOffers(true);
  buildMinimap();
  say('Build your traps!', 2.5);
  toast(`Level ${i + 1}: ${L.name}`, 2.5);
}

function floorBelow(c, r) {
  for (let rr = r; rr < S.rows; rr++) if (solidAt(c, rr)) return rr * T;
  return S.rows * T + 400;
}

const unlockedKinds = () => UNLOCK.slice(0, Math.min(UNLOCK.length, 5 + S.levelIndex * 2 + S.wave));

function rollOffers(free) {
  const pool = unlockedKinds().filter((k) => k !== 'block');
  for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  S.offers = ['block', ...pool.slice(0, 4)];
  if (S.selected && !S.offers.includes(S.selected) && S.selected !== S.freeTrap) S.selected = null;
  if (!free) play('select');
}

const maxTraps = () => Math.min(18, 5 + S.wave + Math.floor(S.levelIndex / 2)) + S.bonusSlots;
const trapAtCell = (c, r) => S.traps.find((t) => t.c === c && t.r === r);
const priceOf = (k) => (k === S.freeTrap ? 0 : TRAPS[k].price);

function canPlace(kind, c, r) {
  if (c < 1 || c >= S.cols - 1 || r < 1 || r >= S.rows) return false;
  if (solidAt(c, r) || trapAtCell(c, r)) return false;
  const mount = TRAPS[kind].mount;
  if (mount === 'floor' && !solidAt(c, r + 1)) return false;
  if (mount === 'ceiling') {
    if (!solidAt(c, r - 1) || solidAt(c, r + 1)) return false;
    if (floorBelow(c, r) > (r + 5) * T) return false;
  }
  if (kind === 'block') {
    if (trapAtCell(c, r - 1)) return false;
    let h = 1;
    for (let rr = r + 1; rr < S.rows && solidAt(c, rr) && h < 4; rr++) {
      if (solidAt(c - 1, rr) && solidAt(c + 1, rr)) break;
      h++;
    }
    if (h > 2) return false;
  }
  const rows = mount === 'ceiling' ? [Math.floor(floorBelow(c, r) / T) - 1] : mount === 'floor' ? [r] : [r, r + 1];
  for (const p of [S.door, S.goal]) if (p && rows.includes(p.r) && Math.abs(p.c - c) <= (p === S.goal ? 2 : 1)) return false;
  return true;
}

function makeTrap(kind, c, r) {
  const t = {
    id: nextId++, kind, c, r, x: c * T, cx: c * T + T / 2, cy: r * T + T / 2,
    floorY: floorBelow(c, r), ceilY: r * T,
    state: 'armed', timer: 0, disabledT: 0, broken: false, phaseOffset: Math.random(),
  };
  if (kind === 'fire') t.timer = Math.random() * 3;
  if (kind === 'axe') { t.len = Math.max(60, Math.min(130, t.floorY - t.ceilY - 36)); t.period = 2.6; t.amp = 1.1; }
  if (kind === 'rock' || kind === 'cage') { t.y = t.ceilY; t.vy = 0; }
  if (kind === 'wheel') { t.wx = t.cx; t.vx = 0; t.rot = 0; }
  if (kind === 'saw') { t.sx = t.cx; t.dir = 1; t.rot = 0; sawRange(t); }
  if (kind === 'spring') t.squish = 0;
  if (['cannon', 'firecannon', 'icecannon', 'loglauncher'].includes(kind)) { t.face = -1; t.aim = Math.PI; t.timer = 0.8 + Math.random(); t.recoil = 0; }
  if (kind === 'croc') { t.state = 'ready'; t.lunge = 0; t.jaw = 0; }
  if (kind === 'spikeball') t.rot = 0;
  return t;
}

function sawRange(t) {
  let a = t.c, b = t.c;
  const fr = t.r + 1;
  while (a > t.c - 2 && solidAt(a - 1, fr) && !solidAt(a - 1, t.r)) a--;
  while (b < t.c + 2 && solidAt(b + 1, fr) && !solidAt(b + 1, t.r)) b++;
  t.minX = a * T + 18; t.maxX = (b + 1) * T - 18;
}

function refreshTraps() {
  for (const t of S.traps) { t.floorY = floorBelow(t.c, t.r); if (t.kind === 'saw') sawRange(t); }
  buildMinimap();
}
function placeBlock(c, r) { S.grid[r][c] = 2; refreshTraps(); }
function removeBlock(c, r) {
  S.grid[r][c] = 0;
  S.traps = S.traps.filter((t) => !(t.c === c && t.r === r - 1 && TRAPS[t.kind].mount === 'floor'));
  refreshTraps();
}

/* ═════════════════════════ waves ═════════════════════════ */
function planWave() {
  const w = S.wave + 1, L = S.levelIndex;
  const total = Math.min(200, Math.round((6 + w * 5 + w * w * 1.2) * (L === 0 ? 0.68 : 0.8 + L * 0.22)));
  const pool = ['hero'];
  if (w + L >= 2) pool.push('thief');
  if (w + L >= 3) pool.push('knight');
  if (w + L >= 4) pool.push('barb');
  if (w + L >= 5) pool.push('wizard');
  S.nextWave = Array.from({ length: total }, (_, i) => (i < 3 || Math.random() < 0.45 ? 'hero' : pool[(Math.random() * pool.length) | 0]));
}

function startWave() {
  if (S.screen !== 'build') return;
  S.wave++;
  S.screen = 'wave';
  S.selected = null; S.sellMode = false; S.tutorial = false;
  S.spawnQueue = S.nextWave.slice();
  S.spawnT = 0.6;
  S.waveStats = { total: S.spawnQueue.length, killed: 0, damage: 0 };
  for (const t of S.traps) { t.broken = false; t.disabledT = 0; resetTrap(t); }
  S.cam.follow = true;
  mood('lever', 0.8);
  say('Release the heroes!', 1.6);
  play('wavestart');
  setTimeout(() => play('fight'), 350);
  pcall('gameplayStart');
}

function resetTrap(t) {
  if (t.kind === 'croc') { t.state = 'ready'; t.lunge = 0; return; }
  t.state = 'armed';
  if (t.kind === 'rock' || t.kind === 'cage') { t.y = t.ceilY; t.vy = 0; t.victim = null; }
  if (t.kind === 'wheel') { t.wx = t.cx; t.vx = 0; }
}

function spawnHero(cls) {
  const C = CLASSES[cls];
  const x = S.door.c * T + T / 2 - C.w / 2 + (Math.random() - 0.5) * 6;
  const y = S.door.r * T + T - C.h;
  S.heroes.push({
    id: nextId++, cls, C, x, y, w: C.w, h: C.h, vx: 0, vy: 0, dir: 1,
    hp: C.hp, hpShowT: 0, grounded: false, alive: true, gone: false, anim: Math.random() * 10,
    action: 'go', decisionT: 0, lastKey: null, enc: new Map(), hitCd: new Map(),
    slimeT: 0, stunT: 0, springCd: 0, forceGoT: 0, bounces: 0, life: 0, freezeT: 0, burnT: 0, burnTick: 0,
    shield: cls === 'knight', castT: 0, wizardCd: 1.5, swingT: 0, flashT: 0,
    thought: null, thoughtT: 0, deadT: 0, spin: 0, caged: null, speedMul: 0.92 + Math.random() * 0.16,
  });
}

function endWave() {
  brain.save();
  pcall('gameplayStop');
  const st = S.waveStats;
  st.rate = st.total ? st.killed / st.total : 1;
  st.better = S.lastKillRate == null ? null : st.rate - S.lastKillRate;
  S.lastKillRate = st.rate;
  st.payout = 10 + S.wave * 2;
  st.perfect = st.damage === 0;
  S.coins += st.payout + (st.perfect ? 8 : 0);
  S.doubled = false;
  S.crateUsed = false;
  if (S.wave >= LEVELS[S.levelIndex].waves) {
    const stars = S.hp >= 90 ? 3 : S.hp >= 50 ? 2 : 1;
    progress.stars[S.levelIndex] = Math.max(progress.stars[S.levelIndex] || 0, stars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length, S.levelIndex + 2));
    saveProgress();
    S.screen = 'win';
    S.winStars = stars;
    mood('celebrate', 99);
    say('The gold is safe! Mwahaha!', 4);
    play('win');
    setTimeout(() => play('youwin'), 700);
    pcall('happyTime');
    return;
  }
  S.screen = 'summary';
  S.summaryT = 0;
  mood(st.rate > 0.95 ? 'celebrate' : 'laugh', 2);
  play('wavedone');
  if (st.perfect) { setTimeout(() => play('flawless'), 600); pcall('happyTime'); }
}

async function toBuild() {
  if (S.wave % 2 === 0) await showInterstitial();
  S.screen = 'build';
  planWave();
  rollOffers(true);
  if (5 + S.levelIndex * 2 + S.wave <= UNLOCK.length) {
    toast(`New trap unlocked: ${TRAPS[unlockedKinds().at(-1)].name}!`, 2.4);
    play('unlock');
  }
}

/* ═════════════════════════ hero AI ═════════════════════════ */
function heroGroup(h) {
  if (h.cls === 'barb') return 'b';
  if (h.cls === 'knight' && h.shield) return 'k';
  return 'n';
}
const PROJ = { ball: 'cannon', fireball: 'firecannon', iceball: 'icecannon', log: 'loglauncher' };
const isProj = (t) => !!PROJ[t.kind];

function trapZone(t) {
  if (isProj(t)) return [t.x - t.r - 2, t.x + t.r + 2];
  if (t.kind === 'wheel') return [t.wx - 18, t.wx + 18];
  if (t.kind === 'saw') return [t.sx - 18, t.sx + 18];
  if (t.kind === 'axe') { const r = Math.min(60, t.len * 0.72); return [t.cx - r, t.cx + r]; }
  if (t.kind === 'bomb') return [t.cx - 34, t.cx + 34];
  if (t.kind === 'croc') return [t.cx - 26, t.cx + 26];
  return [t.x + 2, t.x + T - 2];
}
function inLane(h, t) {
  if (isProj(t)) return Math.abs(t.y - (h.y + h.h / 2)) < 70;
  if (t.kind === 'spikeball') { const top = h.y - 70, bot = h.y + h.h + 6; return t.cy > top && t.cy < bot; }
  const feet = h.y + h.h;
  return feet <= t.floorY + 6 && feet > t.floorY - 3.5 * T;
}
const trapActive = (t) => !t.broken && t.disabledT <= 0 && t.kind !== 'block';
const isShooter = (t) => ['cannon', 'firecannon', 'icecannon', 'loglauncher'].includes(t.kind);

function aheadDist(h, t) {
  const [z0, z1] = trapZone(t);
  if (h.dir > 0) return { d: z0 - (h.x + h.w), passed: h.x > z1 };
  return { d: h.x - z1, passed: h.x + h.w < z0 };
}
function distBucket(d) {
  if (d < 0) return 0;
  if (d < 10) return 1;
  if (d < 38) return 2;
  if (d < 80) return 3;
  if (d < 130) return 4;
  return -1;
}

const axeAngle = (t) => t.amp * Math.sin((2 * Math.PI * (S.time + t.phaseOffset * t.period)) / t.period);
const axeVel = (t) => Math.cos((2 * Math.PI * (S.time + t.phaseOffset * t.period)) / t.period);

function trapPhase(t, h) {
  switch (t.kind) {
    case 'fire': return t.state === 'on' ? 2 : t.state === 'warn' ? 1 : 0;
    case 'axe': {
      const a = axeAngle(t) * h.dir, v = axeVel(t) * h.dir;
      return (v > 0 ? 0 : 4) + Math.min(3, Math.max(0, Math.floor(((a / t.amp + 1) / 2) * 4)));
    }
    case 'rock': case 'cage': return t.state === 'armed' ? 0 : t.state === 'falling' || t.state === 'trigger' ? 1 : 2;
    case 'wheel': return t.state === 'rolling' ? 1 : 0;
    case 'saw': return Math.sign(t.dir) === -h.dir ? 1 : 0;
    case 'bomb': return t.state === 'lit' ? 1 : 0;
    case 'croc': return t.state === 'ready' ? 0 : t.state === 'lunge' || t.state === 'hold' ? 1 : 2;
    case 'spikeball': return Math.min(2, Math.max(0, Math.floor((h.y + h.h - t.cy) / 30)));
    default: return isProj(t) ? (t.y < h.y + h.h * 0.4 ? 1 : 2) : 0;
  }
}
const brainKind = (t) => PROJ[t.kind] || t.kind;
const findThreat = (id) => S.traps.find((x) => x.id === id) || S.balls.find((b) => b.id === id);

function think(h, dt) {
  for (const [id, e] of h.enc) {
    const t = findThreat(id);
    if (!t) { // a projectile that vanished without hitting = dodged
      if (e.proj) finishEncounter(h, { id, kind: e.proj }, 1 - e.dmg);
      h.enc.delete(id);
      continue;
    }
    const { passed } = aheadDist(h, t);
    if (passed) finishEncounter(h, t, 1 - Math.min(0.5, e.waitT * 0.05) - e.dmg * 1.5);
    else if (!inLane(h, t)) h.enc.delete(id);
  }

  let best = null, bd = 1e9;
  const consider = (t) => {
    if (!inLane(h, t)) return;
    const { d, passed } = aheadDist(h, t);
    if (passed || d > 130) return;
    if (d < bd) { bd = d; best = t; }
  };
  for (const t of S.traps) {
    if (!trapActive(t) || t.state === 'respawn' || isShooter(t)) continue;
    if (t.kind === 'spring' && h.bounces >= 3) continue;
    consider(t);
  }
  for (const b of S.balls) if (Math.sign(b.vx) === -h.dir) consider(b);

  if (h.forceGoT > 0) { h.forceGoT -= dt; h.action = 'go'; return; }
  if (!best) { h.action = 'go'; h.lastKey = null; return; }

  const key = brain.key(brainKind(best), distBucket(bd), trapPhase(best, h), heroGroup(h));
  let e = h.enc.get(best.id);
  if (!e) { e = { steps: [], waitT: 0, dmg: 0, proj: isProj(best) ? best.kind : null }; h.enc.set(best.id, e); }
  if (h.action === 'wait') {
    e.waitT += dt;
    if (e.waitT > 6) { h.forceGoT = 1.2; h.action = 'go'; return; }
  }
  h.decisionT -= dt;
  if (key !== h.lastKey || h.decisionT <= 0) {
    const { a, explore } = brain.choose(key);
    h.action = ACTIONS[a];
    e.steps.push({ k: key, a });
    h.lastKey = key;
    h.decisionT = 0.18;
    if ((h.action !== 'go' || explore) && Math.random() < 0.5) { h.thought = explore ? '?' : '!'; h.thoughtT = 0.6; }
  }
}

function finishEncounter(h, t, reward) {
  const e = h.enc.get(t.id);
  if (!e) return;
  h.enc.delete(t.id);
  reward = Math.max(-1, Math.min(1, reward));
  if (e.steps.length) brain.learn(e.steps, reward);
  const kind = brainKind(t);
  const { before, after } = brain.record(kind, reward > 0);
  if (before < 0.7 && after >= 0.7) {
    toast(`Heroes figured out the ${TRAPS[kind].name}! Mix it up!`, 3);
    play('learn');
    mood('angry', 1.5);
    say('They learned it?!', 1.8);
  }
}

/* ═════════════════════════ physics ═════════════════════════ */
function collideX(h) {
  const top = h.y + 2, bot = h.y + h.h - 2, mid = (top + bot) / 2;
  if (h.vx > 0) {
    const edge = h.x + h.w;
    if (solidPx(edge, top) || solidPx(edge, bot) || solidPx(edge, mid)) { h.x = Math.floor(edge / T) * T - h.w - 0.01; return true; }
  } else if (h.vx < 0) {
    if (solidPx(h.x, top) || solidPx(h.x, bot) || solidPx(h.x, mid)) { h.x = (Math.floor(h.x / T) + 1) * T + 0.01; return true; }
  }
  return false;
}
function collideY(h) {
  const l = h.x + 2, r = h.x + h.w - 2;
  if (h.vy > 0) {
    const foot = h.y + h.h;
    if (solidPx(l, foot) || solidPx(r, foot)) { h.y = Math.floor(foot / T) * T - h.h; h.vy = 0; h.grounded = true; return; }
  } else if (h.vy < 0 && (solidPx(l, h.y) || solidPx(r, h.y))) {
    h.y = (Math.floor(h.y / T) + 1) * T + 0.01;
    h.vy = 0;
  }
  h.grounded = false;
}

function jump(h, vy, vx) {
  h.vy = vy; h.vx = h.dir * vx; h.grounded = false;
  if (onScreen(h.x, h.y)) play(Math.random() < 0.5 ? 'jump' : 'jump2', { vol: 0.8 });
}

/** Ground navigation: steps, walls, ledges and pits. */
function navigate(h, air) {
  const frontX = h.dir > 0 ? h.x + h.w : h.x;
  const footRow = Math.floor((h.y + h.h - 4) / T);
  const pc = Math.floor((frontX + h.dir * 3) / T);
  if (solidAt(pc, footRow)) {
    const s2 = solidAt(pc, footRow - 1), s3 = solidAt(pc, footRow - 2);
    const headClear = !solidPx(h.x + h.w / 2, h.y - 6);
    if (!s2 && headClear) return jump(h, -640, air);
    if (s2 && !s3 && headClear && !solidAt(pc, footRow - 3)) return jump(h, -770, air);
    h.dir = -h.dir; h.vx = 0; h.lastKey = null;
    return;
  }
  const edgeCol = Math.floor((frontX + h.dir) / T);
  if (solidAt(edgeCol, footRow + 1)) return;
  for (let r = footRow + 2; r <= footRow + 6 && r < S.rows; r++) if (solidAt(edgeCol, r)) return;
  for (let k = 1; k <= 4; k++) {
    const lc = edgeCol + h.dir * k;
    for (const dr of [0, -1, 1]) {
      const lr = footRow + 1 + dr;
      if (solidAt(lc, lr) && !solidAt(lc, lr - 1) && !solidAt(lc, lr - 2)) {
        const landX = h.dir > 0 ? lc * T + 10 : (lc + 1) * T - 10;
        const dist = Math.abs(landX - frontX) + h.w * 0.3;
        return jump(h, dr < 0 ? -700 : -640, Math.max(air, Math.min(380, dist / (dr < 0 ? 0.5 : 0.62))));
      }
    }
  }
  h.dir = -h.dir; h.vx = 0; h.lastKey = null;
}

function updateHero(h, dt) {
  h.anim += dt;
  if (h.thoughtT > 0) h.thoughtT -= dt;
  if (h.castT > 0) h.castT -= dt;
  if (h.swingT > 0) h.swingT -= dt;
  if (h.springCd > 0) h.springCd -= dt;
  if (h.hpShowT > 0) h.hpShowT -= dt;
  if (h.flashT > 0) h.flashT -= dt;

  if (!h.alive) {
    h.deadT += dt;
    if (h.caged || h.deadT < 0.28) return; // flash red for a moment first
    h.vy += GRAVITY * 0.6 * dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.spin += dt * 9;
    if (h.deadT > 1.4) h.gone = true;
    return;
  }

  const C = h.C;
  const walk = C.speed * h.speedMul;
  const air = Math.max(150, walk * 1.45);
  h.life += dt;
  if (h.life > 90) { h.alive = false; h.gone = true; h.enc.clear(); poof(h.x + h.w / 2, h.y + h.h / 2, 8); return; }

  if (h.burnT > 0) {
    h.burnT -= dt;
    h.burnTick -= dt;
    if (Math.random() < dt * 20) S.particles.push({ x: h.x + Math.random() * h.w, y: h.y + Math.random() * h.h, vx: 0, vy: -60, life: 0.4, max: 0.4, type: 'ember', color: '#ffb347', size: 3 });
    if (h.burnTick <= 0) { h.burnTick = 0.4; damage(h, 12, null, 'burnt'); if (!h.alive) return; }
  }

  if (h.freezeT > 0) {
    h.freezeT -= dt;
    if (h.grounded) h.vx = 0;
  } else if (h.stunT > 0) {
    h.stunT -= dt;
    if (h.grounded) h.vx *= Math.pow(0.02, dt);
  } else {
    think(h, dt);
    if (h.cls === 'wizard') {
      h.wizardCd -= dt;
      if (h.wizardCd <= 0) {
        const t = S.traps.find((t) => trapActive(t) && !isShooter(t) && inLane(h, t) && (({ d, passed }) => !passed && d < 90 && d > -10)(aheadDist(h, t)));
        if (t) {
          t.disabledT = 3; h.wizardCd = 7; h.castT = 0.6;
          play('magic');
          for (let i = 0; i < 14; i++) spark(t.cx, TRAPS[t.kind].mount === 'ceiling' ? t.ceilY + 20 : t.floorY - 14, '#7fd8ff');
        }
      }
    }
    if (h.grounded) {
      const act = h.action;
      let speed = act === 'wait' ? 0 : act === 'dash' ? walk * 1.7 : walk;
      if (h.castT > 0) speed = 0;
      if (h.wade) speed *= 0.55;
      h.vx = h.dir * speed;
      if (speed > 0) navigate(h, air);
      if (h.grounded && act === 'jump' && h.slimeT <= 0) jump(h, -560, air);
    }
  }
  h.wade = false;

  if (h.inSlime) {
    h.slimeT += dt;
    h.vx *= 0.3;
    if (h.vy < 0) h.vy *= 0.5;
    if (h.slimeT > 1.0) damage(h, 999, h.inSlime, 'sank');
  } else h.slimeT = 0;
  h.inSlime = null;

  h.vy = Math.min(h.vy + GRAVITY * dt, 950);
  h.x += h.vx * dt;
  collideX(h);
  h.y += h.vy * dt;
  collideY(h);
  if (!h.alive) return;

  if (h.y > worldH() + 40) {
    const c = Math.max(0, Math.min(S.cols - 1, Math.floor((h.x + h.w / 2) / T)));
    S.heat[S.rows - 1][c]++;
    defeat(h, null, 'fell');
    return;
  }

  const gl = S.goal;
  if (gl) {
    const gx = gl.c * T + T / 2, gy = gl.r * T + T;
    if (Math.abs(h.x + h.w / 2 - gx) < 26 && Math.abs(h.y + h.h - gy) < 24) {
      h.alive = false; h.gone = true;
      S.hp = Math.max(0, S.hp - C.dmg);
      S.escaped++;
      S.waveStats.damage += C.dmg;
      for (const [id] of h.enc) { const t = findThreat(id); if (t) finishEncounter(h, t, 1); }
      for (let i = 0; i < 6; i++) spark(gx, gy - 30, '#ffd34d');
      floater(gx, gy - 70, `-${C.dmg}`, '#ff6b6b', 22);
      S.shake = Math.max(S.shake, 4);
      mood('sad', 1.6);
      if (Math.random() < 0.5 || !S.speech) say(SADS[(Math.random() * SADS.length) | 0], 1.4);
      for (let i = 0; i < 3; i++) S.particles.push({ x: monsterPos().x + (i - 1) * 10, y: monsterPos().y - 40, vx: (i - 1) * 30, vy: 40, life: 0.8, max: 0.8, type: 'spark', color: '#7fd8ff', size: 3, grav: true });
      play('castle');
      play('sad');
    }
  }
}

function damage(h, amount, trap, how) {
  if (!h.alive) return;
  if (trap && h.hitCd.get(trap.id) > S.time) return;
  if (h.freezeT > 0) amount = Math.round(amount * 1.5);
  h.hp -= amount;
  h.hpShowT = 1.5;
  h.flashT = 0.16;
  const e = trap && h.enc.get(trap.id);
  if (e) e.dmg += amount / h.C.hp;
  floater(h.x + h.w / 2 + (Math.random() - 0.5) * 16, h.y - 6, String(Math.min(amount, 999)), amount >= 100 ? '#fff' : '#ffd36b', amount >= 100 ? 18 : 15);
  if (h.hp <= 0) defeat(h, trap, how);
  else if (onScreen(h.x, h.y)) play('hurt');
}

function defeat(h, trap, how) {
  if (!h.alive) return;
  h.alive = false;
  h.deadT = 0;
  h.flashT = 0.3;
  h.vx = -h.dir * 70;
  h.vy = -520;
  if (trap) finishEncounter(h, trap, -1);
  h.enc.clear();
  S.kills++;
  if (S.waveStats) S.waveStats.killed++;
  const cx = h.x + h.w / 2, cy = h.y + h.h / 2;
  const r = Math.floor(cy / T), c = Math.floor(cx / T);
  if (S.heat[r] && S.heat[r][c] != null) S.heat[r][c]++;
  S.coins += h.C.reward;
  S.coinsFly.push({ x: cx, y: cy, t: -0.25 });
  setTimeout(() => poof(cx, cy, 6), 250);
  for (let i = 0; i < 4; i++) spark(cx, cy, ['#ff4d4d', '#ffd34d', '#ff5c8a'][i % 3]);
  if (onScreen(cx, cy)) play('defeat');
  if (S.time - S.laughT > 1.6) {
    S.laughT = S.time;
    mood(Math.random() < 0.6 ? 'laugh' : 'celebrate', 1.1);
    if (Math.random() < 0.45) { say(LAUGHS[(Math.random() * LAUGHS.length) | 0], 1.2); play('laugh', { vol: 0.7 }); }
  }
  if (how === 'caged') { h.caged = trap; h.vy = 0; h.vx = 0; }
}

const rectHit = (h, x, y, w, hh) => h.x < x + w && h.x + h.w > x && h.y < y + hh && h.y + h.h > y;
function circleHit(h, cx, cy, r) {
  const nx = Math.max(h.x, Math.min(cx, h.x + h.w)), ny = Math.max(h.y, Math.min(cy, h.y + h.h));
  return (nx - cx) ** 2 + (ny - cy) ** 2 < r * r;
}

function absorb(h, t) {
  if (h.cls === 'barb' && (t.kind === 'rock' || t.kind === 'cage')) {
    h.swingT = 0.4;
    shatter(t);
    if (t.kind === 'cage') t.broken = true;
    return true;
  }
  if (h.shield && ['axe', 'rock', 'wheel', 'ball', 'saw', 'log', 'spikeball'].includes(t.kind)) {
    h.shield = false; h.swingT = 0.45; h.stunT = 0.35; h.vx = -h.dir * 120; h.vy = -200;
    play('clang');
    for (let i = 0; i < 8; i++) spark(h.x + h.w / 2 + h.dir * 12, h.y + h.h / 2, '#dfe6ee');
    if (t.kind === 'rock' || t.kind === 'wheel') shatter(t);
    if (t.kind === 'ball' || t.kind === 'log') t.dead = true;
    h.hitCd.set(t.id, S.time + 0.6);
    return true;
  }
  return false;
}

function shatter(t) {
  if (t.kind === 'rock' || t.kind === 'cage') {
    for (let i = 0; i < 10; i++) shard(t.cx, (t.y || t.floorY) + 20, t.kind === 'rock' ? '#8a8f99' : '#5b616e');
    t.state = 'respawn'; t.timer = 2.5; t.y = t.ceilY; t.vy = 0;
    play('rock');
  }
  if (t.kind === 'wheel') {
    for (let i = 0; i < 10; i++) shard(t.wx, t.floorY - 18, '#8a8f99');
    t.state = 'respawn'; t.timer = 3; t.wx = t.cx; t.vx = 0;
    play('rock');
  }
}

function explode(x, y, radius, dmg, src) {
  S.shake = Math.max(S.shake, 10);
  play('bomb');
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 260;
    S.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 0.7, max: 0.7, type: 'fire', color: ['#ff7a1a', '#ffd34d', '#ff4d4d'][i % 3], size: 5 + Math.random() * 7 });
  }
  poof(x, y, 10);
  for (const h of S.heroes) {
    if (!h.alive) continue;
    const hx = h.x + h.w / 2, hy = h.y + h.h / 2;
    if (Math.hypot(hx - x, hy - y) < radius) {
      h.vx = Math.sign(hx - x || 1) * 220; h.vy = -380; h.stunT = 0.5; h.grounded = false;
      damage(h, dmg, src, 'boom');
    }
  }
}

/** Line of sight between two points (for aiming shooters). */
function clearShot(x0, y0, x1, y1) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 12);
  for (let i = 1; i < n; i++) if (solidPx(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n)) return false;
  return true;
}

function updateShooter(t, dt, live) {
  if (t.recoil > 0) t.recoil -= dt * 4;
  if (!trapActive(t)) return;
  const mx = t.cx, my = t.kind === 'cannon' || t.kind === 'loglauncher' ? t.floorY - 18 : t.cy;
  let target = null, td = 1e9;
  for (const h of live) {
    const hx = h.x + h.w / 2, hy = h.y + h.h / 2, dx = hx - mx;
    if (Math.abs(dx) > 9 * T || Math.abs(dx) < 26 || Math.sign(dx) !== -h.dir) continue;
    if (t.kind === 'cannon' || t.kind === 'loglauncher') { if (!inLane(h, t)) continue; }
    else if (Math.abs(hy - my) > 4 * T || !clearShot(mx, my, hx, hy)) continue;
    const d = Math.hypot(dx, hy - my);
    if (d < td) { td = d; target = h; }
  }
  if (target) {
    t.face = Math.sign(target.x - t.cx) || t.face;
    if (t.kind === 'firecannon' || t.kind === 'icecannon') {
      const want = Math.atan2(target.y + target.h / 2 - my, target.x + target.w / 2 + target.vx * 0.25 - mx);
      let da = want - t.aim;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      t.aim += da * Math.min(1, dt * 8);
    } else t.aim = t.face > 0 ? 0 : Math.PI;
  }
  t.timer -= dt;
  if (t.timer > 0 || !target) return;
  t.recoil = 1;
  const id = nextId++;
  if (t.kind === 'cannon') {
    t.timer = 2.2;
    S.balls.push({ id, kind: 'ball', x: mx + t.face * 22, y: my, vx: t.face * 330, vy: 0, r: 9, life: 3 });
    play('cannon');
    S.shake = Math.max(S.shake, 2);
  } else if (t.kind === 'loglauncher') {
    t.timer = 3.2;
    S.balls.push({ id, kind: 'log', x: mx + t.face * 24, y: t.floorY - 14, vx: t.face * 210, vy: 0, r: 14, life: 8, rot: 0, hit: new Set() });
    play('log');
  } else {
    const sp = t.kind === 'firecannon' ? 340 : 300;
    t.timer = t.kind === 'firecannon' ? 1.9 : 2.5;
    S.balls.push({ id, kind: t.kind === 'firecannon' ? 'fireball' : 'iceball', x: mx + Math.cos(t.aim) * 24, y: my + Math.sin(t.aim) * 24, vx: Math.cos(t.aim) * sp, vy: Math.sin(t.aim) * sp, r: 9, life: 3 });
    play(t.kind === 'firecannon' ? 'fireball' : 'iceshot');
  }
  S.particles.push({ x: mx + Math.cos(t.aim) * 26, y: my + Math.sin(t.aim) * 26, vx: Math.cos(t.aim) * 60, vy: Math.sin(t.aim) * 60, life: 0.35, max: 0.35, type: 'poof', color: t.kind === 'icecannon' ? '#c9f1ff' : '#fff', size: 9 });
}

function updateTrap(t, dt) {
  if (t.disabledT > 0) t.disabledT -= dt;
  const live = S.heroes.filter((h) => h.alive);
  const on = trapActive(t);
  if (isShooter(t)) return updateShooter(t, dt, live);
  switch (t.kind) {
    case 'spikes':
      if (!on) break;
      for (const h of live) if (rectHit(h, t.x + 5, t.floorY - 15, T - 10, 15)) { damage(h, 60, t, 'spiked'); h.hitCd.set(t.id, S.time + 0.8); play('spikes'); }
      break;
    case 'spikeball':
      t.rot += dt * 2;
      if (!on) break;
      for (const h of live) if (circleHit(h, t.cx, t.cy + Math.sin(S.time * 2 + t.c) * 3, 16) && !absorb(h, t)) {
        damage(h, 70, t, 'spiked'); h.hitCd.set(t.id, S.time + 0.6);
        h.vy = Math.max(h.vy, 120);
        play('spikeball');
      }
      break;
    case 'slime':
      if (!on) break;
      for (const h of live) if (rectHit(h, t.x + 3, t.floorY - 10, T - 6, 10) && h.vy >= 0) { if (!h.inSlime) play('slime'); h.inSlime = t; }
      if (Math.random() < dt * 3) S.particles.push({ x: t.x + 8 + Math.random() * 24, y: t.floorY - 10, vx: 0, vy: -20, life: 0.6, max: 0.6, type: 'bubble', color: '#8cf03c', size: 3 + Math.random() * 3 });
      break;
    case 'spring':
      if (t.squish > 0) t.squish -= dt * 3;
      if (!on) break;
      for (const h of live) {
        if (h.springCd > 0 || h.vy < 0 || h.bounces >= 3) continue;
        if (rectHit(h, t.x + 6, t.floorY - 14, T - 12, 14)) {
          h.vy = -820; h.vx = -h.dir * 170; h.stunT = 0.75; h.springCd = 0.6; h.grounded = false; h.bounces++;
          t.squish = 1;
          play('spring');
          finishEncounter(h, t, -0.6);
        }
      }
      break;
    case 'fire': {
      t.timer = (t.timer + dt) % 3;
      const prev = t.state;
      t.state = t.timer < 1.4 ? 'off' : t.timer < 1.9 ? 'warn' : 'on';
      if (!on) { t.state = 'off'; break; }
      if (t.state === 'on' && prev !== 'on' && S.screen === 'wave' && onScreen(t.cx, t.floorY)) play('fire');
      if (t.state === 'warn' && Math.random() < dt * 20) S.particles.push({ x: t.cx + (Math.random() - 0.5) * 16, y: t.floorY - 18, vx: 0, vy: -40, life: 0.5, max: 0.5, type: 'smoke', color: '#555', size: 5 });
      if (t.state === 'on') {
        if (Math.random() < dt * 30) S.particles.push({ x: t.cx + (Math.random() - 0.5) * 18, y: t.floorY - 20 - Math.random() * 60, vx: 0, vy: -90, life: 0.4, max: 0.4, type: 'ember', color: '#ffb347', size: 3 });
        for (const h of live) if (rectHit(h, t.cx - 13, t.floorY - 2.1 * T, 26, 2.1 * T)) { damage(h, 50, t, 'burnt'); h.hitCd.set(t.id, S.time + 0.2); }
      }
      break;
    }
    case 'axe': {
      if (!on) break;
      const a = axeAngle(t), bx = t.cx + Math.sin(a) * t.len, by = t.ceilY + Math.cos(a) * t.len;
      for (const h of live) if (circleHit(h, bx, by, 14) && !absorb(h, t)) { damage(h, 120, t, 'chopped'); h.hitCd.set(t.id, S.time + 0.6); play('axe'); }
      break;
    }
    case 'saw': {
      t.rot += dt * 14;
      if (!on) break;
      t.sx += t.dir * 85 * dt;
      if (t.sx > t.maxX) { t.sx = t.maxX; t.dir = -1; }
      if (t.sx < t.minX) { t.sx = t.minX; t.dir = 1; }
      for (const h of live) if (circleHit(h, t.sx, t.floorY - 14, 15) && !absorb(h, t)) {
        damage(h, 55, t, 'sawed'); h.hitCd.set(t.id, S.time + 0.25);
        play('saw');
        if (Math.random() < 0.6) spark(t.sx, t.floorY - 16, '#ffe9a8');
      }
      break;
    }
    case 'croc': {
      const live2 = live.filter((h) => Math.abs(h.x + h.w / 2 - t.cx) < 30 && h.y + h.h <= t.floorY + 6 && h.y + h.h > t.floorY - 4 * T);
      for (const h of live) if (h.grounded && rectHit(h, t.x, t.floorY - 8, T, 8)) h.wade = true;
      if (!on) break;
      t.timer -= dt;
      if (t.state === 'ready') {
        t.lunge = Math.max(0, t.lunge - dt * 200);
        if (live2.length) { t.state = 'lunge'; t.timer = 0.16; play('splash', { vol: 0.8 }); for (let i = 0; i < 8; i++) S.particles.push({ x: t.cx + (Math.random() - 0.5) * 30, y: t.floorY - 6, vx: (Math.random() - 0.5) * 120, vy: -150 - Math.random() * 120, life: 0.6, max: 0.6, type: 'spark', color: '#7fc8ff', size: 3, grav: true }); }
      } else if (t.state === 'lunge') {
        t.lunge = 2.4 * T * (1 - Math.max(0, t.timer) / 0.16);
        t.jaw = 1;
        if (t.timer <= 0) { t.state = 'hold'; t.timer = 0.14; }
      } else if (t.state === 'hold') {
        t.jaw = Math.max(0, t.timer / 0.14);
        if (t.timer <= 0) { t.state = 'down'; t.timer = 0.3; play('chomp'); }
      } else if (t.state === 'down') {
        t.lunge = 2.4 * T * Math.max(0, t.timer / 0.3);
        if (t.timer <= 0) { t.state = 'cool'; t.timer = 1.0; t.lunge = 0; }
      } else if (t.state === 'cool' && t.timer <= 0) t.state = 'ready';
      if (t.state === 'lunge' || t.state === 'hold') {
        for (const h of live) if (rectHit(h, t.cx - 16, t.floorY - t.lunge, 32, t.lunge)) { damage(h, 200, t, 'chomped'); h.hitCd.set(t.id, S.time + 1); }
      }
      break;
    }
    case 'bomb': {
      if (t.state === 'respawn') { t.timer -= dt; if (t.timer <= 0) t.state = 'armed'; break; }
      if (!on) break;
      if (t.state === 'armed') {
        for (const h of live) if (Math.abs(h.x + h.w / 2 - t.cx) < 40 && inLane(h, t)) { t.state = 'lit'; t.timer = 0.75; play('fuse'); break; }
      } else if (t.state === 'lit') {
        t.timer -= dt;
        if (Math.random() < dt * 30) S.particles.push({ x: t.cx + 6, y: t.floorY - 48, vx: (Math.random() - 0.5) * 40, vy: -60, life: 0.3, max: 0.3, type: 'spark', color: '#ffd34d', size: 2 });
        if (t.timer <= 0) { explode(t.cx, t.floorY - 18, 72, 150, t); t.state = 'respawn'; t.timer = 4; }
      }
      break;
    }
    case 'rock':
    case 'cage': {
      if (t.state === 'respawn') { t.timer -= dt; if (t.timer <= 0) { t.state = 'armed'; t.y = t.ceilY; } break; }
      if (t.state === 'landed') {
        t.timer -= dt;
        if (t.victim) t.victim.x = t.cx - t.victim.w / 2;
        if (t.timer <= 0) {
          if (t.victim) { t.victim.gone = true; poof(t.cx, t.floorY - 20, 8); t.victim = null; }
          t.state = 'rising';
        }
        break;
      }
      if (t.state === 'rising') { t.y -= 120 * dt; if (t.y <= t.ceilY) { t.y = t.ceilY; t.state = 'armed'; } break; }
      if (!on) break;
      if (t.state === 'armed') {
        for (const h of live) {
          if (!inLane(h, t)) continue;
          const hx = h.x + h.w / 2;
          const d = h.dir > 0 ? t.cx - hx : hx - t.cx;
          const trig = t.kind === 'cage' ? Math.abs(hx - t.cx) < 10 : d > -6 && d < 62;
          if (trig) { t.state = 'trigger'; t.timer = t.kind === 'cage' ? 0.1 : 0.15; if (t.kind === 'cage') play('latch'); break; }
        }
      } else if (t.state === 'trigger') {
        t.timer -= dt;
        if (t.timer <= 0) { t.state = 'falling'; t.vy = t.kind === 'cage' ? 350 : 0; }
      } else if (t.state === 'falling') {
        t.vy += (t.kind === 'cage' ? 3200 : GRAVITY) * dt;
        t.y += t.vy * dt;
        const size = t.kind === 'cage' ? 42 : 34;
        for (const h of live) {
          const hit = t.kind === 'cage' ? rectHit(h, t.cx - 17, t.y, 34, size) : circleHit(h, t.cx, t.y + 17, 16);
          if (!hit) continue;
          if (absorb(h, t)) break;
          if (t.kind === 'cage') {
            t.y = t.floorY - size; t.state = 'landed'; t.timer = 1.4; t.victim = h;
            play('cage');
            defeat(h, t, 'caged');
            break;
          }
          damage(h, 150, t, 'bonked'); h.hitCd.set(t.id, S.time + 1);
        }
        if (t.state === 'falling' && t.y + size >= t.floorY) {
          t.y = t.floorY - size;
          if (t.kind === 'rock') { shatter(t); S.shake = Math.max(S.shake, 4); }
          else { t.state = 'landed'; t.timer = 1.0; play('cage'); }
        }
      }
      break;
    }
    case 'wheel': {
      if (t.state === 'respawn') { t.timer -= dt; if (t.timer <= 0) { t.state = 'armed'; t.wx = t.cx; } break; }
      if (!on) break;
      if (t.state === 'armed') {
        for (const h of live) {
          if (!inLane(h, t)) continue;
          const dx = h.x + h.w / 2 - t.wx;
          if (Math.abs(dx) < 7 * T && Math.sign(dx) === -h.dir) { t.state = 'rolling'; t.vx = Math.sign(dx) * 240; play('wheel'); break; }
        }
      } else {
        t.wx += t.vx * dt;
        t.rot += (t.vx / 18) * dt;
        const ahead = t.wx + Math.sign(t.vx) * 18;
        if (solidPx(ahead, t.floorY - 18) || !solidPx(t.wx, t.floorY + 4)) shatter(t);
        else for (const h of live) if (circleHit(h, t.wx, t.floorY - 18, 15) && !absorb(h, t)) { damage(h, 140, t, 'flattened'); h.hitCd.set(t.id, S.time + 1); }
      }
      break;
    }
  }
}

function updateBalls(dt) {
  for (const b of S.balls) {
    b.life -= dt;
    if (b.kind === 'log') {
      b.vy = Math.min(b.vy + GRAVITY * dt, 900);
      b.y += b.vy * dt;
      if (solidPx(b.x, b.y + b.r)) { b.y = Math.floor((b.y + b.r) / T) * T - b.r; b.vy = 0; }
      b.x += b.vx * dt;
      b.rot += (b.vx / b.r) * dt;
      if (solidPx(b.x + Math.sign(b.vx) * b.r, b.y) || b.y > worldH() + 60 || b.life <= 0) {
        b.dead = true;
        for (let i = 0; i < 6; i++) shard(b.x, b.y, '#8b5a2b');
        if (onScreen(b.x, b.y)) play('log', { vol: 0.6 });
        continue;
      }
    } else {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.kind !== 'ball' && Math.random() < dt * 40) S.particles.push({ x: b.x, y: b.y, vx: -b.vx * 0.1, vy: -b.vy * 0.1, life: 0.3, max: 0.3, type: 'fire', color: b.kind === 'fireball' ? '#ffb347' : '#bfefff', size: 4 });
      if (solidPx(b.x + Math.sign(b.vx) * b.r, b.y) || solidPx(b.x, b.y) || b.life <= 0) { b.dead = true; poof(b.x, b.y, 4); continue; }
    }
    for (const h of S.heroes) {
      if (!h.alive || !circleHit(h, b.x, b.y, b.r)) continue;
      if (b.kind === 'log') {
        if (b.hit.has(h.id)) continue;
        b.hit.add(h.id);
        if (absorb(h, b)) { b.dead = true; break; }
        h.vx = Math.sign(b.vx) * 140; h.vy = -280; h.stunT = 0.35; h.grounded = false;
        damage(h, 90, b, 'flattened');
        continue;
      }
      if (b.kind === 'ball' && absorb(h, b)) { b.dead = true; break; }
      if (b.kind === 'fireball') { damage(h, 60, b, 'burnt'); h.burnT = 1.6; play('fire', { vol: 0.5 }); }
      else if (b.kind === 'iceball') { damage(h, 25, b, 'frozen'); h.freezeT = 1.6; play('freeze'); for (let i = 0; i < 6; i++) spark(b.x, b.y, '#bfefff'); }
      else { h.vx = Math.sign(b.vx) * 160; h.vy = -260; h.stunT = 0.3; h.grounded = false; damage(h, 110, b, 'blasted'); }
      b.dead = true;
      break;
    }
  }
  S.balls = S.balls.filter((b) => !b.dead);
}

/* ═════════════════════════ effects ═════════════════════════ */
function poof(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 80;
    S.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: 0.6, max: 0.6, type: 'poof', color: '#fff', size: 6 + Math.random() * 8 });
  }
}
function spark(x, y, color) {
  const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 120;
  S.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.7, max: 0.7, type: 'spark', color, size: 3 + Math.random() * 2 });
}
function shard(x, y, color) {
  const a = -Math.random() * Math.PI, s = 80 + Math.random() * 160;
  S.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.8, max: 0.8, type: 'shard', color, size: 4 + Math.random() * 4, grav: true });
}
function floater(x, y, txt, color, size) {
  S.floaters.push({ x, y, txt, color, size, t: 0 });
  if (S.floaters.length > 120) S.floaters.shift();
}
function toast(text, dur = 2) {
  S.toasts.push({ text, t: 0, dur });
  if (S.toasts.length > 3) S.toasts.shift();
}
function mood(m, t) { S.mood = m; S.moodT = t; }
function say(text, dur) { S.speech = { text, t: 0, dur }; }
function onScreen(x, y) {
  const c = S.cam;
  return x > c.x - 60 && x < c.x + W / c.z + 60 && y > c.y - 60 && y < c.y + VIEW_H / c.z + 60;
}

/* ═════════════════════════ camera ═════════════════════════ */
function clampCam() {
  const c = S.cam;
  const fit = Math.min(VIEW_H / worldH(), W / worldW());
  c.z = Math.max(Math.min(fit, 0.45), Math.min(1.8, c.z));
  const vw = W / c.z, vh = VIEW_H / c.z;
  c.x = worldW() <= vw ? (worldW() - vw) / 2 : Math.max(0, Math.min(worldW() - vw, c.x));
  c.y = worldH() <= vh ? worldH() - vh : Math.max(0, Math.min(worldH() - vh, c.y));
}
const toWorld = (sx, sy) => ({ x: S.cam.x + sx / S.cam.z, y: S.cam.y + (sy - TOP) / S.cam.z });

function zoomAt(f, sx = W / 2, sy = TOP + VIEW_H / 2) {
  const before = toWorld(sx, sy);
  S.cam.z *= f;
  clampCam();
  const after = toWorld(sx, sy);
  S.cam.x += before.x - after.x;
  S.cam.y += before.y - after.y;
  clampCam();
}

function updateCamera(dt) {
  const c = S.cam;
  const pan = 560 / c.z;
  if (keys.left) { c.x -= pan * dt; c.follow = false; }
  if (keys.right) { c.x += pan * dt; c.follow = false; }
  if (keys.up) { c.y -= pan * dt; c.follow = false; }
  if (keys.down) { c.y += pan * dt; c.follow = false; }
  if (c.follow && S.screen === 'wave') {
    let lead = null, best = 1e9;
    for (const h of S.heroes) {
      if (!h.alive) continue;
      const d = Math.abs(h.x - S.goal.c * T) + Math.abs(h.y - S.goal.r * T) * 3;
      if (d < best) { best = d; lead = h; }
    }
    if (lead) {
      const tx = lead.x - (W / c.z) * 0.5, ty = lead.y - (VIEW_H / c.z) * 0.55;
      c.x += (tx - c.x) * Math.min(1, dt * 2.5);
      c.y += (ty - c.y) * Math.min(1, dt * 2.5);
    }
  }
  clampCam();
}

/* ═════════════════════════ update ═════════════════════════ */
function update(dt) {
  S.time += dt;
  if (S.moodT > 0 && (S.moodT -= dt) <= 0) S.mood = 'idle';
  if (S.speech && (S.speech.t += dt) > S.speech.dur) S.speech = null;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 30);
  for (const t of S.traps) updateTrap(t, dt);
  updateBalls(dt);

  if (S.screen === 'wave') {
    S.spawnT -= dt;
    if (S.spawnQueue.length && S.spawnT <= 0) {
      spawnHero(S.spawnQueue.shift());
      const crowd = S.spawnQueue.length > 40 ? 0.22 : 0.45;
      S.spawnT = Math.random() < 0.25 ? 0.08 : crowd + Math.random() * 0.4;
    }
    for (const h of S.heroes) updateHero(h, dt);
    S.heroes = S.heroes.filter((h) => !h.gone);
    // little footsteps from whoever is walking on screen
    S.stepT -= dt;
    if (S.stepT <= 0) {
      S.stepT = 0.26;
      if (S.heroes.some((h) => h.alive && h.grounded && Math.abs(h.vx) > 20 && onScreen(h.x, h.y))) {
        const dungeon = S.theme.sprites;
        play(dungeon ? (Math.random() < 0.5 ? 'stepc1' : 'stepc2') : Math.random() < 0.5 ? 'step1' : 'step2');
      }
    }
    if (S.hp <= 0) {
      S.screen = 'lose'; mood('sad', 99); say('My treasure… noooo!', 4);
      play('lose'); setTimeout(() => play('youlose'), 600);
      pcall('gameplayStop');
      brain.save();
    } else if (!S.spawnQueue.length && !S.heroes.length) endWave();
  }
  if (S.screen === 'summary') S.summaryT += dt;

  for (const p of S.particles) {
    p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.grav) p.vy += 900 * dt;
    if (p.type === 'poof' || p.type === 'fire') { p.vx *= 0.92; p.vy *= 0.92; }
  }
  S.particles = S.particles.filter((p) => p.life > 0);
  if (S.particles.length > 900) S.particles.splice(0, S.particles.length - 900);
  for (const f of S.floaters) f.t += dt;
  S.floaters = S.floaters.filter((f) => f.t < 0.9);
  for (const c of S.coinsFly) if ((c.t += dt * 1.6) >= 1 && !c.done) { c.done = true; play('coin'); }
  S.coinsFly = S.coinsFly.filter((c) => c.t < 1);
  for (const t of S.toasts) t.t += dt;
  S.toasts = S.toasts.filter((t) => t.t < t.dur);
}

/* ═════════════════════════ rendering: world ═════════════════════════ */
function roundRect(x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }

function text(str, x, y, size, color = '#fff', align = 'center', weight = 700) {
  g.font = `${weight} ${size}px ${FONT}`;
  g.textAlign = align;
  g.textBaseline = 'middle';
  if (!/^#[2-5]a/.test(color) && color !== INK) {
    g.lineWidth = Math.max(3, size / 5);
    g.strokeStyle = 'rgba(15,10,30,.85)';
    g.lineJoin = 'round';
    g.strokeText(str, x, y);
  }
  g.fillStyle = color;
  g.fillText(str, x, y);
}

function cloud(x, y, s) {
  g.fillStyle = 'rgba(255,255,255,.92)';
  g.beginPath();
  g.ellipse(x, y, 46 * s, 18 * s, 0, 0, 7);
  g.ellipse(x - 26 * s, y + 4 * s, 26 * s, 14 * s, 0, 0, 7);
  g.ellipse(x + 24 * s, y - 8 * s, 30 * s, 20 * s, 0, 0, 7);
  g.fill();
}

function hills(th, camX, y0, y1, w) {
  const layer = (col, amp, base, freq, par, line) => {
    const off = camX * par;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, y1);
    for (let x = 0; x <= w; x += 16) {
      const wx = x + off;
      g.lineTo(x, y0 + base - amp * (0.6 * Math.sin(wx * freq) + 0.4 * Math.sin(wx * freq * 2.3 + 1)));
    }
    g.lineTo(w, y1);
    g.closePath();
    g.fill();
    if (line) { g.strokeStyle = line; g.lineWidth = 3; g.stroke(); }
  };
  // a distant mountain
  const mx = 900 - camX * 0.06;
  g.fillStyle = 'rgba(80,80,110,.35)';
  g.beginPath(); g.moveTo(mx - 260, y0 + 330); g.lineTo(mx - 40, y0 + 90); g.lineTo(mx + 30, y0 + 140); g.lineTo(mx + 90, y0 + 70); g.lineTo(mx + 300, y0 + 330); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.5)';
  g.beginPath(); g.moveTo(mx - 72, y0 + 128); g.lineTo(mx - 40, y0 + 90); g.lineTo(mx - 10, y0 + 122); g.closePath(); g.fill();
  layer(th.far, 70, 330, 0.004, 0.15);
  if (th.clouds) for (const c of S.clouds) cloud(((c.x - camX * 0.25 + S.time * 8 * c.s) % 2600 + 2600) % 2600 - 200, y0 + c.y, c.s);
  layer(th.near, 50, 420, 0.007, 0.35, th.hillLine);
}

function drawSky() {
  const th = S.theme;
  if (th.sprites) { g.fillStyle = '#120f1d'; g.fillRect(0, TOP, W, VIEW_H); return; }
  const grd = g.createLinearGradient(0, TOP, 0, BAR);
  grd.addColorStop(0, th.sky[0]);
  grd.addColorStop(1, th.sky[1]);
  g.fillStyle = grd;
  g.fillRect(0, TOP, W, VIEW_H);
  if (th.stars) {
    g.fillStyle = '#fff';
    for (const s of S.stars) { g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(S.time * 1.5 + s.p)); g.fillRect(s.x, TOP + s.y, 2, 2); }
    g.globalAlpha = 1;
    g.fillStyle = '#fff6d6'; g.beginPath(); g.arc(1060, TOP + 90, 34, 0, 7); g.fill();
  } else {
    g.fillStyle = 'rgba(255,255,230,.8)'; g.beginPath(); g.arc(1080, TOP + 90, 40, 0, 7); g.fill();
  }
  hills(th, S.cam.x, TOP, BAR, W);
}

const tileCache = {};
function tileImg(key, draw) {
  const id = S.levelIndex + ':' + key;
  if (!tileCache[id]) {
    const c = document.createElement('canvas');
    c.width = c.height = T;
    draw(c.getContext('2d'));
    tileCache[id] = c;
  }
  return tileCache[id];
}

function drawTile(v, c, r) {
  const th = S.theme;
  const x = c * T, y = r * T;
  if (th.sprites) {
    const top = r > 0 && !solidAt(c, r - 1);
    const im = IMG[top || v === 2 ? 'tile_floor' : 'tile_wall'];
    if (im) g.drawImage(im, x, y, T, T);
    if (!top && v !== 2) { g.fillStyle = 'rgba(10,8,20,.35)'; g.fillRect(x, y, T, T); }
    return;
  }
  if (v === 1) {
    const grass = r === 0 || !solidAt(c, r - 1);
    g.drawImage(tileImg(grass ? 'grass' : 'dirt', (b) => {
      b.fillStyle = th.dirt; b.fillRect(0, 0, T, T);
      b.fillStyle = th.dirtDark;
      for (const [px, py] of [[8, 14], [26, 24], [14, 32], [32, 8]]) { b.beginPath(); b.arc(px, py, 3, 0, 7); b.fill(); }
      if (grass) {
        b.fillStyle = th.top; b.fillRect(0, 0, T, 13);
        b.fillStyle = th.topDark; b.fillRect(0, 11, T, 4);
        for (let i = 0; i < 5; i++) { b.beginPath(); b.moveTo(i * 8 + 2, 13); b.lineTo(i * 8 + 6, 18); b.lineTo(i * 8 + 10, 13); b.fill(); }
      }
    }), x, y);
  } else if (v === 2) {
    g.drawImage(tileImg('brick', (b) => {
      b.fillStyle = th.brick; b.fillRect(0, 0, T, T);
      b.strokeStyle = th.brickDark; b.lineWidth = 3;
      b.strokeRect(1.5, 1.5, T - 3, T - 3);
      b.beginPath(); b.moveTo(0, T / 2); b.lineTo(T, T / 2); b.moveTo(T / 2, 0); b.lineTo(T / 2, T / 2); b.moveTo(T / 4, T / 2); b.lineTo(T / 4, T); b.moveTo(T * 0.75, T / 2); b.lineTo(T * 0.75, T); b.stroke();
      b.fillStyle = 'rgba(255,255,255,.18)'; b.fillRect(3, 3, T - 6, 4);
    }), x, y);
  } else {
    g.drawImage(tileImg('stone', (b) => {
      b.fillStyle = th.stone; b.fillRect(0, 0, T, T);
      b.fillStyle = th.stoneDark; b.fillRect(0, T - 6, T, 6); b.fillRect(T - 6, 0, 6, T);
      b.fillStyle = 'rgba(255,255,255,.2)'; b.fillRect(4, 4, T - 14, 5);
    }), x, y);
  }
  const open = (dc, dr) => r + dr >= 0 && r + dr < S.rows && !solidAt(c + dc, r + dr);
  g.strokeStyle = INK;
  g.lineWidth = 3;
  g.beginPath();
  if (r === 0 || open(0, -1)) { g.moveTo(x, y + 1.5); g.lineTo(x + T, y + 1.5); }
  if (open(-1, 0)) { g.moveTo(x + 1.5, y); g.lineTo(x + 1.5, y + T); }
  if (open(1, 0)) { g.moveTo(x + T - 1.5, y); g.lineTo(x + T - 1.5, y + T); }
  if (open(0, 1)) { g.moveTo(x, y + T - 1.5); g.lineTo(x + T, y + T - 1.5); }
  g.stroke();
}

function flower(x, y, seed) {
  const col = ['#ff6fa1', '#ffd34d', '#ffffff', '#b28dff'][seed % 4];
  const sway = Math.sin(S.time * 2 + seed) * 2;
  g.strokeStyle = '#3f9a29'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + sway, y - 16); g.stroke();
  g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 2;
  for (let i = 0; i < 5; i++) { const a = i * 1.257; g.beginPath(); g.arc(x + sway + Math.cos(a) * 5, y - 18 + Math.sin(a) * 5, 4, 0, 7); g.fill(); g.stroke(); }
  g.fillStyle = '#ffb000'; g.beginPath(); g.arc(x + sway, y - 18, 3, 0, 7); g.fill();
}
function bush(x, y) {
  g.fillStyle = S.theme.topDark || '#3f9a29'; g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath();
  g.arc(x - 14, y - 10, 12, Math.PI, 0); g.arc(x, y - 16, 15, Math.PI, 0); g.arc(x + 15, y - 10, 12, Math.PI, 0);
  g.closePath(); g.fill(); g.stroke();
}

function drawSpawn() {
  const x = S.door.c * T + T / 2, y = S.door.r * T + T;
  spr('door', x, y + 2, 62);
  if (!S.theme.sprites) {
    g.strokeStyle = INK; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x - 30, y); g.lineTo(x - 30, y - 70); g.stroke();
    g.fillStyle = '#4dabf7';
    g.beginPath(); g.moveTo(x - 30, y - 70); g.lineTo(x - 4 + Math.sin(S.time * 5) * 3, y - 62); g.lineTo(x - 30, y - 54); g.closePath(); g.fill(); g.stroke();
  }
}

/** A cartoon castle tower; returns the point where the keeper sits. */
function castleArt(x, y, th, s = 1) {
  const w = 100 * s, h = 150 * s;
  g.save();
  g.lineWidth = 4 * s; g.strokeStyle = INK; g.fillStyle = th.castle;
  for (const dx of [-w / 2 - 6 * s, w / 2 + 6 * s]) {
    roundRect(x + dx - 18 * s, y - h + 20 * s, 36 * s, h - 20 * s, 4); g.fill(); g.stroke();
    g.fillStyle = th.roof;
    g.beginPath(); g.moveTo(x + dx - 24 * s, y - h + 22 * s); g.lineTo(x + dx, y - h - 30 * s); g.lineTo(x + dx + 24 * s, y - h + 22 * s); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = th.castle;
  }
  roundRect(x - w / 2, y - h * 0.72, w, h * 0.72, 4); g.fill(); g.stroke();
  for (let i = 0; i < 5; i++) { g.fillRect(x - w / 2 + i * 22 * s, y - h * 0.72 - 12 * s, 14 * s, 14 * s); g.strokeRect(x - w / 2 + i * 22 * s, y - h * 0.72 - 12 * s, 14 * s, 14 * s); }
  g.strokeStyle = th.castleDark; g.lineWidth = 2;
  for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x - w / 2 + 4, y - i * 20 * s); g.lineTo(x + w / 2 - 4, y - i * 20 * s); g.stroke(); }
  g.fillStyle = '#3a2a3f'; g.strokeStyle = INK; g.lineWidth = 4 * s;
  g.beginPath(); g.moveTo(x - 22 * s, y); g.lineTo(x - 22 * s, y - 40 * s); g.arc(x, y - 40 * s, 22 * s, Math.PI, 0); g.lineTo(x + 22 * s, y); g.closePath(); g.fill(); g.stroke();
  g.restore();
  return { x, y: y - h * 0.72 - 10 * s };
}

function monsterPos() {
  if (!S.goal) return { x: 0, y: 0 };
  const x = S.goal.c * T + T / 2, y = S.goal.r * T + T;
  return S.theme.sprites ? { x, y: y - 40 } : { x, y: y - 150 * 0.72 - 10 };
}

/** The keeper sits on the castle and reacts to everything that happens. */
function drawKeeper(x, y, hgt, bubbleScale = 1) {
  const m = S.mood === 'idle' ? (Math.floor(S.time * 2) % 2 ? 'monster_idle1' : 'monster_idle2') : 'monster_' + S.mood;
  const happy = S.mood === 'laugh' || S.mood === 'celebrate';
  const bounce = happy ? Math.abs(Math.sin(S.time * 14)) * 6 : S.mood === 'sad' ? 0 : Math.sin(S.time * 3) * 2;
  const shake = S.mood === 'angry' ? Math.sin(S.time * 40) * 2 : 0;
  spr(m, x + shake, y - bounce + 4, hgt);
  if (S.speech) {
    const k = Math.min(1, S.speech.t * 6), a = Math.min(1, (S.speech.dur - S.speech.t) * 4);
    g.save();
    g.globalAlpha = Math.max(0, a);
    g.translate(x - 30 * bubbleScale, y - hgt - 26 * bubbleScale);
    g.scale(k * bubbleScale, k * bubbleScale);
    g.font = `700 16px ${FONT}`;
    const w = g.measureText(S.speech.text).width + 24;
    g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 3;
    roundRect(-w + 30, -18, w, 34, 14); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(18, 14); g.lineTo(30, 30); g.lineTo(6, 15); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = S.mood === 'sad' ? '#3a6bd6' : S.mood === 'angry' ? '#d63a3a' : INK;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(S.speech.text, -w / 2 + 30, -1);
    g.restore();
  }
}

function drawCastle() {
  const th = S.theme;
  const x = S.goal.c * T + T / 2, y = S.goal.r * T + T;
  if (!th.sprites) {
    const top = castleArt(x, y, th);
    drawKeeper(top.x, top.y + 10, 66);
  } else {
    g.fillStyle = '#3a2c4f'; g.strokeStyle = INK; g.lineWidth = 3;
    roundRect(x - 22, y - 24, 44, 24, 4); g.fill(); g.stroke();
    spr('chest', x, y - 20, 34);
    drawKeeper(x, y - 46, 56);
    return;
  }
  spr('chest', x, y + 1, 40);
}

function drawWorld() {
  const c = S.cam;
  const c0 = Math.max(0, Math.floor(c.x / T) - 1), c1 = Math.min(S.cols - 1, Math.ceil((c.x + W / c.z) / T) + 1);
  const r0 = Math.max(0, Math.floor(c.y / T) - 1), r1 = Math.min(S.rows - 1, Math.ceil((c.y + VIEW_H / c.z) / T) + 1);
  if (S.theme.sprites && IMG.tile_wall?.width) {
    g.globalAlpha = 0.28;
    for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) if (!S.grid[r][cc]) g.drawImage(IMG.tile_wall, cc * T, r * T, T, T);
    g.globalAlpha = 1;
  }
  for (const d of S.decor) {
    const x = d.c * T + T / 2, y = d.r * T + T;
    if (d.ch === 't') {
      const f = 0.85 + Math.sin(S.time * 9 + d.c) * 0.08;
      const grd = g.createRadialGradient(x, y - 40, 4, x, y - 40, 90 * f);
      grd.addColorStop(0, 'rgba(255,170,70,.32)'); grd.addColorStop(1, 'rgba(255,170,70,0)');
      g.fillStyle = grd; g.fillRect(x - 100, y - 140, 200, 200);
      spr('torch', x, y - 12, 34);
    } else if (d.ch === 'f') flower(x, y, d.c);
    else if (d.ch === 'k') bush(x, y);
  }
  for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) { const v = S.grid[r][cc]; if (v) drawTile(v, cc, r); }
  if (S.door) drawSpawn();
  if (S.goal) drawCastle();
}

function drawCroc(t) {
  const x = t.cx, base = t.floorY;
  // the pond
  g.fillStyle = '#2f7fd1'; g.strokeStyle = INK; g.lineWidth = 3;
  roundRect(t.x + 1, base - 9, T - 2, 10, 4); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.55)';
  for (let i = 0; i < 2; i++) g.fillRect(t.x + 6 + ((S.time * 18 + i * 17) % 26), base - 7, 6, 2);
  const L = t.lunge || 0;
  g.save();
  g.beginPath(); g.rect(t.x - 30, base - 200, T + 60, 200 - 6); g.clip();
  if (L < 4) {
    // eyes peeking out of the water
    const bob = Math.sin(S.time * 3 + t.c) * 1.5;
    g.fillStyle = '#5aa83a'; g.strokeStyle = INK; g.lineWidth = 2;
    for (const dx of [-7, 7]) { g.beginPath(); g.arc(x + dx, base - 9 + bob, 5, Math.PI, 0); g.fill(); g.stroke(); }
    g.fillStyle = '#fff'; g.fillRect(x - 9, base - 13 + bob, 3, 3); g.fillRect(x + 5, base - 13 + bob, 3, 3);
  } else {
    const top = base - 6 - L, jaw = (t.jaw || 0) * 0.55;
    g.translate(x, top);
    g.fillStyle = '#5aa83a'; g.strokeStyle = INK; g.lineWidth = 3;
    roundRect(-13, 18, 26, L, 10); g.fill(); g.stroke();
    g.fillStyle = '#8fd16a'; roundRect(-7, 24, 14, L - 6, 6); g.fill();
    // upper jaw (rotates open)
    for (const side of [-1, 1]) {
      g.save();
      g.rotate(side * jaw);
      g.fillStyle = '#5aa83a';
      g.beginPath(); g.moveTo(-side * 2, 20); g.lineTo(side * 13, 18); g.lineTo(side * 9, -8); g.quadraticCurveTo(side * 2, -16, -side * 2, -8); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#fff';
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-side * 1, -4 + i * 7); g.lineTo(-side * 6, -1 + i * 7); g.lineTo(-side * 1, 2 + i * 7); g.fill(); }
      g.restore();
    }
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-10, 22, 5, 0, 7); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(-9, 23, 2, 0, 7); g.fill();
  }
  g.restore();
}

function drawShooter(t, ghost) {
  const isAir = !solidAt(t.c, t.r + 1) && (t.kind === 'firecannon' || t.kind === 'icecannon');
  const mx = t.cx, my = t.kind === 'firecannon' || t.kind === 'icecannon' ? t.cy : t.floorY - 18;
  const rec = Math.max(0, t.recoil || 0) * 5;
  g.save();
  g.strokeStyle = INK; g.lineWidth = 3;
  if (t.kind === 'firecannon' || t.kind === 'icecannon') {
    const fire = t.kind === 'firecannon';
    if (isAir) {
      // floating turret on a little chain-anchored platform
      g.fillStyle = '#6b5a7a'; roundRect(mx - 16, my + 8, 32, 10, 4); g.fill(); g.stroke();
      g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(mx, my + 22 + Math.sin(S.time * 6) * 2, 4, 0, 7); g.fill();
    } else {
      g.fillStyle = '#6b5a7a'; roundRect(mx - 16, t.floorY - 12, 32, 12, 4); g.fill(); g.stroke();
    }
    const a = ghost ? Math.PI : t.aim;
    g.save(); g.translate(mx - Math.cos(a) * rec, my - Math.sin(a) * rec); g.rotate(a);
    g.fillStyle = fire ? '#c0392b' : '#3498db';
    roundRect(-4, -8, 28, 16, 6); g.fill(); g.stroke();
    g.fillStyle = fire ? '#ffb347' : '#bfefff'; g.fillRect(16, -8, 4, 16);
    g.restore();
    g.fillStyle = fire ? '#e74c3c' : '#5dade2';
    g.beginPath(); g.arc(mx, my, 12, 0, 7); g.fill(); g.stroke();
    g.fillStyle = fire ? '#ffd34d' : '#e8fbff'; g.beginPath(); g.arc(mx, my, 4, 0, 7); g.fill();
  } else if (t.kind === 'loglauncher') {
    const f = ghost ? -1 : t.face || -1;
    g.translate(mx - f * rec, t.floorY);
    g.scale(f, 1);
    g.fillStyle = '#8b5a2b'; roundRect(-18, -34, 36, 34, 5); g.fill(); g.stroke();
    g.fillStyle = '#5a3a1b'; g.beginPath(); g.ellipse(18, -16, 6, 13, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#c98a4b'; g.beginPath(); g.arc(18, -16, 9, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = '#8b5a2b'; g.lineWidth = 2; g.beginPath(); g.arc(18, -16, 5, 0, 7); g.stroke();
  } else {
    const f = ghost ? -1 : t.face || -1;
    g.translate(mx - f * rec, t.floorY);
    g.save(); g.scale(f, 1);
    g.fillStyle = '#3a3f4f'; roundRect(-6, -30, 30, 18, 8); g.fill(); g.stroke();
    g.fillStyle = '#1b1f2b'; g.beginPath(); g.ellipse(24, -21, 3, 7, 0, 0, 7); g.fill();
    g.restore();
    g.fillStyle = '#8b5a2b'; roundRect(-14, -14, 28, 14, 4); g.fill(); g.stroke();
    g.fillStyle = '#5a3a1b'; g.beginPath(); g.arc(-7, -4, 7, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(7, -4, 7, 0, 7); g.fill(); g.stroke();
  }
  g.restore();
}

function drawSpikeBall(t, ghost) {
  const x = t.cx, y = t.cy + (ghost ? 0 : Math.sin(S.time * 2 + t.c) * 3);
  g.save();
  g.translate(x, y); g.rotate(t.rot || 0);
  g.fillStyle = '#c9ced8'; g.strokeStyle = INK; g.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) {
    g.save(); g.rotate((i / 8) * Math.PI * 2);
    g.beginPath(); g.moveTo(-5, -11); g.lineTo(0, -21); g.lineTo(5, -11); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  g.fillStyle = '#3d4250'; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(-4, -4, 4, 0, 7); g.fill();
  g.restore();
  // a faint magic glow under it so it reads as "floating"
  g.fillStyle = 'rgba(180,120,255,.25)';
  g.beginPath(); g.ellipse(x, t.cy + 24, 12, 3, 0, 0, 7); g.fill();
}

function drawTrap(t, ghost) {
  const dis = t.disabledT > 0 || t.broken;
  g.save();
  if (dis) g.globalAlpha = 0.45;
  if (ghost) g.globalAlpha = 0.6;
  switch (t.kind) {
    case 'block':
      if (ghost) {
        g.fillStyle = S.theme.brick || '#c96a3a'; g.fillRect(t.x, t.r * T, T, T);
        g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(t.x + 1.5, t.r * T + 1.5, T - 3, T - 3);
      }
      break;
    case 'spikes': sprW('trap_spikes', t.cx, t.floorY + 2, T - 2); break;
    case 'slime': sprW('trap_slime', t.cx, t.floorY + 4, T + 2); break;
    case 'spring': sprW('trap_spring', t.cx, t.floorY + 1, T * 0.78, { sy: 1 - Math.max(0, t.squish || 0) * 0.4 }); break;
    case 'spikeball': drawSpikeBall(t, ghost); break;
    case 'croc': drawCroc(t); break;
    case 'cannon': case 'firecannon': case 'icecannon': case 'loglauncher': drawShooter(t, ghost); break;
    case 'fire': {
      const im = IMG.trap_fire;
      if (!im || !im.width) break;
      const s = (T - 2) / im.width, baseH = im.height * 0.36 * s;
      const fl = t.state === 'on' && !dis ? 2.1 * T * (0.92 + Math.random() * 0.12) : t.state === 'warn' && !dis ? 0.35 * T : 0;
      if (fl > 0) {
        g.save();
        if (t.state === 'warn') g.globalAlpha *= 0.7;
        if (t.state === 'on') {
          const grd = g.createRadialGradient(t.cx, t.floorY - fl / 2, 4, t.cx, t.floorY - fl / 2, 70);
          grd.addColorStop(0, 'rgba(255,150,40,.35)'); grd.addColorStop(1, 'rgba(255,150,40,0)');
          g.fillStyle = grd; g.fillRect(t.cx - 70, t.floorY - fl / 2 - 70, 140, 140);
        }
        g.drawImage(im, 0, 0, im.width, im.height * 0.64, t.cx - (im.width * s) / 2, t.floorY - baseH - fl + 6, im.width * s, fl);
        g.restore();
      }
      g.drawImage(im, 0, im.height * 0.64, im.width, im.height * 0.36, t.cx - (im.width * s) / 2, t.floorY - baseH + 1, im.width * s, baseH);
      break;
    }
    case 'axe': {
      const a = ghost ? 0.5 : axeAngle(t);
      const im = IMG.trap_axe;
      g.strokeStyle = '#3b3f4a'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(t.cx, t.ceilY); g.lineTo(t.cx + Math.sin(a) * (t.len - 14), t.ceilY + Math.cos(a) * (t.len - 14)); g.stroke();
      g.fillStyle = '#2a2d36'; g.fillRect(t.cx - 6, t.ceilY - 2, 12, 6);
      if (im && im.width) {
        g.save();
        g.translate(t.cx + Math.sin(a) * t.len, t.ceilY + Math.cos(a) * t.len);
        g.rotate(-a);
        const s = 40 / im.width;
        g.drawImage(im, 0, im.height * 0.38, im.width, im.height * 0.62, -20, -im.height * 0.62 * s * 0.45, 40, im.height * 0.62 * s);
        g.restore();
      }
      break;
    }
    case 'rock':
      if (t.state === 'respawn') g.globalAlpha *= Math.max(0, 1 - t.timer / 2.5) * 0.4;
      sprW('trap_rock', t.cx + (t.state === 'trigger' ? (Math.random() - 0.5) * 4 : 0), (t.y ?? t.ceilY) + 36, 38);
      break;
    case 'cage': {
      if (t.state === 'respawn') g.globalAlpha *= 0.3;
      const y = t.y ?? t.ceilY;
      g.strokeStyle = '#3b3f4a'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(t.cx, t.ceilY); g.lineTo(t.cx, y + 2); g.stroke();
      if (t.victim) drawHero(t.victim);
      sprW('trap_cage', t.cx + (t.state === 'trigger' ? (Math.random() - 0.5) * 3 : 0), y + 44, 38);
      break;
    }
    case 'wheel':
      if (t.state === 'respawn') g.globalAlpha *= 0.25;
      sprW('trap_wheel', t.state === 'respawn' ? t.cx : t.wx, t.floorY - 20, 40, { rot: t.rot, center: true });
      break;
    case 'saw': {
      const x = ghost ? t.cx : t.sx, y = t.floorY - 14;
      g.strokeStyle = 'rgba(27,31,59,.55)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(t.minX, t.floorY - 3); g.lineTo(t.maxX, t.floorY - 3); g.stroke();
      g.save(); g.translate(x, y); g.rotate(t.rot || 0);
      g.fillStyle = '#d7dde8'; g.strokeStyle = INK; g.lineWidth = 3;
      g.beginPath();
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr = i % 2 ? 12 : 17; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#8a93a6'; g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fill(); g.stroke();
      g.restore();
      break;
    }
    case 'bomb': {
      if (t.state === 'respawn') g.globalAlpha *= 0.25;
      const lit = t.state === 'lit';
      const pulse = lit ? 1 + Math.sin(S.time * 40) * 0.06 : 1;
      g.save(); g.translate(t.cx, t.floorY); g.scale(pulse, pulse);
      g.fillStyle = lit && Math.floor(S.time * 12) % 2 ? '#fff' : '#d9443c'; g.strokeStyle = INK; g.lineWidth = 3;
      roundRect(-14, -34, 28, 34, 7); g.fill(); g.stroke();
      g.fillStyle = '#2c2a3a'; g.fillRect(-14, -26, 28, 5); g.fillRect(-14, -11, 28, 5);
      g.strokeStyle = '#6b4a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(4, -34); g.quadraticCurveTo(10, -44, 6, -48); g.stroke();
      if (lit) { g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(6, -49, 3 + Math.random() * 2, 0, 7); g.fill(); }
      g.restore();
      break;
    }
  }
  if (t.disabledT > 0 && !ghost) {
    const y = TRAPS[t.kind].mount === 'ceiling' ? t.ceilY + 20 : TRAPS[t.kind].mount === 'floor' ? t.floorY - 18 : t.cy;
    g.globalAlpha = 0.8; g.fillStyle = '#7fd8ff';
    for (let i = 0; i < 3; i++) { const a = S.time * 3 + i * 2.1; g.beginPath(); g.arc(t.cx + Math.cos(a) * 16, y + Math.sin(a) * 10, 2.5, 0, 7); g.fill(); }
  }
  g.restore();
}

function drawBalls() {
  for (const b of S.balls) {
    if (b.kind === 'log') {
      g.save(); g.translate(b.x, b.y); g.rotate(b.rot);
      g.fillStyle = '#c98a4b'; g.strokeStyle = INK; g.lineWidth = 3;
      g.beginPath(); g.arc(0, 0, b.r, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = '#8b5a2b'; g.lineWidth = 2;
      g.beginPath(); g.arc(0, 0, b.r * 0.6, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, b.r * 0.25, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(0, -b.r); g.lineTo(0, -b.r * 0.6); g.stroke();
      g.restore();
      continue;
    }
    if (b.kind === 'fireball' || b.kind === 'iceball') {
      const fire = b.kind === 'fireball';
      const grd = g.createRadialGradient(b.x, b.y, 2, b.x, b.y, 18);
      grd.addColorStop(0, fire ? 'rgba(255,220,120,.9)' : 'rgba(220,250,255,.9)');
      grd.addColorStop(1, fire ? 'rgba(255,90,20,0)' : 'rgba(90,180,255,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(b.x, b.y, 18, 0, 7); g.fill();
      g.fillStyle = fire ? '#ff7a1a' : '#7fd8ff'; g.strokeStyle = INK; g.lineWidth = 2;
      g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = fire ? '#ffd34d' : '#fff'; g.beginPath(); g.arc(b.x - 2, b.y - 2, 4, 0, 7); g.fill();
      continue;
    }
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(b.x - Math.sign(b.vx) * 14, b.y, 5, 0, 7); g.fill();
    g.fillStyle = '#222634'; g.strokeStyle = INK; g.lineWidth = 2;
    g.beginPath(); g.arc(b.x, b.y, 9, 0, 7); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.arc(b.x - 3, b.y - 3, 3, 0, 7); g.fill();
  }
}

function heroSprite(h) {
  const p = h.cls;
  if (!h.alive) return h.deadT < 0.28 ? (p === 'hero' ? 'hero_jump' : p + '_walk3') : p + '_dizzy';
  if (h.castT > 0 && p === 'wizard') return 'wizard_cast';
  if (h.swingT > 0) return p === 'barb' ? 'barb_swing' : p === 'knight' ? 'knight_block' : p + '_walk1';
  if (h.freezeT > 0) return p + '_walk1';
  if (!h.grounded) return p === 'hero' ? 'hero_jump' : p + '_walk3';
  if (h.action === 'wait' && Math.abs(h.vx) < 1) return p === 'thief' ? 'thief_sneak' : p + '_walk1';
  return `${p}_walk${1 + (Math.floor(h.anim * (h.action === 'dash' ? 16 : 10)) % 6)}`;
}

function drawHero(h) {
  const x = h.x + h.w / 2, y = h.y + h.h + 2;
  const walking = h.alive && h.grounded && Math.abs(h.vx) > 1;
  const bob = walking ? -Math.abs(Math.sin(h.anim * (h.action === 'dash' ? 18 : 12))) * 3 : 0;
  const tilt = walking ? Math.sin(h.anim * 12) * 0.06 : 0;
  g.save();
  if (!h.alive && !h.caged && h.deadT > 0.28) g.globalAlpha = Math.max(0, 1 - (h.deadT - 0.28) / 1.1);
  if (h.alive && h.grounded) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, h.y + h.h + 1, 11, 3, 0, 0, 7); g.fill(); }
  let tint = null;
  if (h.flashT > 0 || (!h.alive && h.deadT < 0.28)) tint = '#ff1e1e';
  else if (h.freezeT > 0) tint = '#7fd8ff';
  else if (h.burnT > 0 && Math.floor(S.time * 14) % 2) tint = '#ff8a1a';
  const jitter = !h.alive && h.deadT < 0.28 ? (Math.random() - 0.5) * 4 : 0;
  spr(heroSprite(h), x + jitter, y + bob, h.C.draw, { flip: h.dir < 0, rot: h.alive || h.deadT < 0.28 ? tilt : Math.sin(h.spin) * 0.6, tint });
  if (h.freezeT > 0 && h.alive) {
    g.fillStyle = 'rgba(190,240,255,.35)'; g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2;
    roundRect(h.x - 4, h.y - 8, h.w + 8, h.h + 10, 6); g.fill(); g.stroke();
  }
  if (h.hpShowT > 0 && h.alive) {
    const k = Math.max(0, h.hp / h.C.hp);
    g.fillStyle = 'rgba(15,10,30,.8)'; g.fillRect(x - 15, h.y - 8, 30, 5);
    g.fillStyle = k > 0.5 ? '#6ee7b7' : k > 0.25 ? '#ffc04d' : '#ff6b6b'; g.fillRect(x - 14, h.y - 7, 28 * k, 3);
  }
  if (h.thoughtT > 0 && h.alive) {
    g.globalAlpha = Math.min(1, h.thoughtT * 4);
    const by = h.y - 20;
    g.fillStyle = '#fff'; roundRect(x - 9, by - 10, 18, 18, 6); g.fill();
    g.fillStyle = h.thought === '?' ? '#7b5cff' : '#ff7a1a';
    g.font = `700 13px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(h.thought, x, by);
  }
  g.restore();
}

function drawParticles() {
  for (const p of S.particles) {
    const k = p.life / p.max;
    g.globalAlpha = Math.max(0, k);
    g.fillStyle = p.color;
    if (p.type === 'shard') g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    else {
      g.beginPath();
      g.arc(p.x, p.y, p.type === 'poof' ? p.size * (1.4 - k * 0.6) : p.type === 'fire' ? p.size * (0.5 + k) : p.size * (p.type === 'smoke' ? 2 - k : 1), 0, 7);
      g.fill();
    }
  }
  g.globalAlpha = 1;
  for (const f of S.floaters) {
    g.globalAlpha = Math.max(0, 1 - Math.max(0, f.t - 0.5) * 2.5);
    text(f.txt, f.x, f.y - f.t * 40, f.size * (f.t < 0.1 ? 0.6 + f.t * 4 : 1), f.color);
  }
  g.globalAlpha = 1;
}

function drawHeat() {
  let max = 1;
  for (const row of S.heat) for (const v of row) if (v > max) max = v;
  for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) {
    const v = S.heat[r][c];
    if (!v) continue;
    const k = v / max, cx = c * T + T / 2, cy = r * T + T / 2;
    const grd = g.createRadialGradient(cx, cy, 2, cx, cy, T * (0.7 + k));
    grd.addColorStop(0, `rgba(255,${Math.round(200 - k * 180)},40,${0.35 + k * 0.45})`);
    grd.addColorStop(1, 'rgba(255,60,40,0)');
    g.fillStyle = grd;
    g.fillRect(c * T - T, r * T - T, T * 3, T * 3);
  }
}

function drawGhost() {
  if (S.screen !== 'build' || !S.hover || S.hover.y < TOP || S.hover.y >= BAR || overMinimap(S.hover) || drag?.moved) return;
  const p = toWorld(S.hover.x, S.hover.y);
  const c = Math.floor(p.x / T), r = Math.floor(p.y / T);
  if (S.sellMode) {
    const t = trapAtCell(c, r);
    if (t) {
      g.strokeStyle = '#ff6b6b'; g.lineWidth = 3;
      roundRect(t.c * T + 2, t.r * T + 2, T - 4, T - 4, 8); g.stroke();
      text(`+${Math.floor(TRAPS[t.kind].price * 0.6)}`, t.c * T + T / 2, t.r * T - 10, 16, '#ffe07a');
    }
    return;
  }
  if (!S.selected) return;
  const mount = TRAPS[S.selected].mount;
  const c0 = Math.max(0, Math.floor(S.cam.x / T)), c1 = Math.min(S.cols - 1, Math.ceil((S.cam.x + W / S.cam.z) / T));
  if (mount === 'air' || mount === 'any') {
    // a light grid shows that anything in the air is fair game
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1;
    for (let cc = c0; cc <= c1; cc++) { g.beginPath(); g.moveTo(cc * T, 0); g.lineTo(cc * T, worldH()); g.stroke(); }
    for (let rr = 0; rr <= S.rows; rr++) { g.beginPath(); g.moveTo(c0 * T, rr * T); g.lineTo((c1 + 1) * T, rr * T); g.stroke(); }
  } else {
    g.fillStyle = 'rgba(255,255,255,.18)';
    for (let rr = 0; rr < S.rows; rr++) for (let cc = c0; cc <= c1; cc++) if (canPlace(S.selected, cc, rr)) g.fillRect(cc * T + 4, rr * T + 4, T - 8, T - 8);
  }
  const ok = canPlace(S.selected, c, r) && S.coins >= priceOf(S.selected);
  g.fillStyle = ok ? 'rgba(110,231,183,.4)' : 'rgba(255,107,107,.3)';
  roundRect(c * T + 2, r * T + 2, T - 4, T - 4, 8); g.fill();
  if (ok) drawTrap(makeTrap(S.selected, c, r), true);
}

function renderWorld() {
  g.save();
  g.beginPath(); g.rect(0, TOP, W, VIEW_H); g.clip();
  drawSky();
  const c = S.cam;
  const sh = S.shake > 0 ? (Math.random() - 0.5) * S.shake : 0;
  const sv = S.shake > 0 ? (Math.random() - 0.5) * S.shake : 0;
  g.translate(sh, TOP + sv);
  g.scale(c.z, c.z);
  g.translate(-c.x, -c.y);
  drawWorld();
  for (const t of S.traps) if (BACK_LAYER(t.kind)) drawTrap(t);
  for (const h of S.heroes) if (!h.caged) drawHero(h);
  drawBalls();
  for (const t of S.traps) if (!BACK_LAYER(t.kind)) drawTrap(t);
  drawParticles();
  if (S.showHeat) drawHeat();
  drawGhost();
  g.restore();
  for (const cf of S.coinsFly) {
    if (cf.t < 0) continue;
    const e = cf.t * cf.t * (3 - 2 * cf.t);
    const sx = (cf.x - c.x) * c.z, sy = TOP + (cf.y - c.y) * c.z;
    spr('coin', sx + (398 - sx) * e, sy + (36 - sy) * e - Math.sin(e * Math.PI) * 60, 18, { center: true });
  }
}

/* ═════════════════════════ minimap ═════════════════════════ */
const MM = { w: 210, x: 12, y: TOP + 12, h: 0, k: 1 };
function buildMinimap() {
  MM.k = MM.w / worldW();
  MM.h = Math.round(worldH() * MM.k);
  const c = document.createElement('canvas');
  c.width = MM.w; c.height = MM.h;
  const b = c.getContext('2d');
  b.fillStyle = S.theme.sprites ? '#241d38' : S.theme.sky[1];
  b.fillRect(0, 0, MM.w, MM.h);
  for (let r = 0; r < S.rows; r++) for (let cc = 0; cc < S.cols; cc++) {
    const v = S.grid[r][cc];
    if (!v) continue;
    b.fillStyle = S.theme.sprites ? '#6b6890' : v === 1 ? (r > 0 && !S.grid[r - 1][cc] ? S.theme.top : S.theme.dirt) : v === 2 ? S.theme.brick : S.theme.stone;
    b.fillRect(cc * T * MM.k, r * T * MM.k, T * MM.k + 0.5, T * MM.k + 0.5);
  }
  if (S.goal) { b.fillStyle = '#ff7a1a'; b.fillRect(S.goal.c * T * MM.k - 2, (S.goal.r - 2) * T * MM.k, 6, 3 * T * MM.k); }
  S.minimap = c;
}
const minimapShown = () => S.minimap && worldW() > W / S.cam.z + 1;
const overMinimap = (p) => minimapShown() && p && p.x >= MM.x && p.x <= MM.x + MM.w && p.y >= MM.y && p.y <= MM.y + MM.h;

function drawMinimap() {
  if (!minimapShown()) return;
  g.save();
  g.fillStyle = 'rgba(13,10,24,.75)'; roundRect(MM.x - 4, MM.y - 4, MM.w + 8, MM.h + 8, 8); g.fill();
  g.drawImage(S.minimap, MM.x, MM.y);
  g.fillStyle = '#ff7a1a';
  for (const t of S.traps) if (t.kind !== 'block') g.fillRect(MM.x + t.cx * MM.k - 1.5, MM.y + (BACK_LAYER(t.kind) ? t.floorY - 10 : t.cy) * MM.k - 1.5, 3, 3);
  g.fillStyle = '#fff';
  for (const h of S.heroes) if (h.alive) g.fillRect(MM.x + (h.x + h.w / 2) * MM.k - 1, MM.y + (h.y + h.h / 2) * MM.k - 1, 2, 2);
  g.strokeStyle = '#ffd7a8'; g.lineWidth = 2;
  g.strokeRect(MM.x + S.cam.x * MM.k, MM.y + S.cam.y * MM.k, (W / S.cam.z) * MM.k, (VIEW_H / S.cam.z) * MM.k);
  g.restore();
}

/* ═════════════════════════ rendering: UI ═════════════════════════ */
let buttons = [];
function button(id, x, y, w, h, label, o = {}) {
  const hot = S.hover && S.hover.x >= x && S.hover.x <= x + w && S.hover.y >= y && S.hover.y <= y + h;
  buttons.push({ id, x, y, w, h, ...o });
  const lift = hot && !o.disabled ? -2 : 0;
  g.save();
  g.fillStyle = 'rgba(0,0,0,.35)'; roundRect(x, y + 4, w, h, 12); g.fill();
  g.fillStyle = o.disabled ? '#4a4660' : o.active ? '#ffad5c' : o.color || '#2c2645';
  roundRect(x, y + lift, w, h, 12); g.fill();
  if (o.color && !o.disabled) { g.fillStyle = 'rgba(255,255,255,.14)'; roundRect(x + 3, y + lift + 3, w - 6, h * 0.42, 10); g.fill(); }
  g.strokeStyle = o.active ? '#fff3e0' : hot ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.15)'; g.lineWidth = 2;
  roundRect(x, y + lift, w, h, 12); g.stroke();
  g.restore();
  if (o.icon) spr(o.icon, x + (label ? 26 : w / 2), y + h / 2 + lift + (o.iconH || 24) / 2, o.iconH || 24);
  if (label) text(label, x + (o.icon ? w / 2 + 14 : w / 2), y + h / 2 + lift, o.size || 18, o.disabled ? '#9a95b5' : o.active ? '#2a1400' : '#fff');
}

function adBadge(x, y) {
  g.fillStyle = '#ffd34d'; roundRect(x, y, 50, 18, 9); g.fill();
  g.fillStyle = '#2a1400'; g.font = `700 11px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('▶ ' + adLabel(), x + 25, y + 9.5);
}

function panel(x, y, w, h, title) {
  g.save();
  g.fillStyle = 'rgba(13,10,24,.93)'; roundRect(x, y, w, h, 14); g.fill();
  g.strokeStyle = 'rgba(255,173,92,.45)'; g.lineWidth = 2; g.stroke();
  g.restore();
  if (title) text(title, x + 16, y + 22, 16, '#ffad5c', 'left');
}

function iconTrap(k, x, y, s = 0.85) {
  const fake = makeTrap(k, 0, 0);
  Object.assign(fake, { x: x - T / 2, cx: x, cy: y - 20, floorY: y, ceilY: y - 40, rot: 0, face: 1, aim: 0, len: 30, sx: x, minX: x - 12, maxX: x + 12, lunge: 20, jaw: 0.5, state: k === 'croc' ? 'hold' : 'armed' });
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(-x, -y);
  if (k === 'block') { g.fillStyle = S.theme.brick || '#c96a3a'; g.strokeStyle = INK; g.lineWidth = 3; roundRect(x - 16, y - 32, 32, 32, 4); g.fill(); g.stroke(); }
  else if (IMG['trap_' + k]) sprW('trap_' + k, x, y, 40);
  else drawTrap(fake, false);
  g.restore();
}

function drawHUD() {
  g.fillStyle = '#0d0a18'; g.fillRect(0, 0, W, TOP);
  g.fillStyle = 'rgba(255,122,26,.3)'; g.fillRect(0, TOP - 2, W, 2);
  button('menu', 12, 14, 48, 44, '❚❚', { size: 16 });
  const m = S.mood === 'idle' ? (Math.floor(S.time * 2) % 2 ? 'monster_idle1' : 'monster_idle2') : 'monster_' + S.mood;
  spr(m, 100, 66 + Math.sin(S.time * 3) * 2, 56);
  const L = LEVELS[S.levelIndex];
  const box = (x, label, val, w = 110) => {
    g.fillStyle = '#05040a'; roundRect(x, 10, w, 52, 8); g.fill();
    text(label, x + w / 2, 22, 12, '#c9c3e6', 'center', 600);
    text(val, x + w / 2, 45, 22, '#fff');
  };
  box(140, 'Wave', `${Math.min(L.waves, Math.max(1, S.wave + (S.screen === 'build' ? 1 : 0)))}/${L.waves}`);
  const remaining = S.screen === 'wave' ? S.spawnQueue.length + S.heroes.filter((h) => h.alive).length : S.nextWave.length;
  box(256, S.screen === 'wave' ? 'Remaining' : 'Inbound', String(remaining));
  g.fillStyle = '#05040a'; roundRect(372, 10, 112, 52, 8); g.fill();
  spr('coin', 398, 47, 24);
  text(String(S.coins), 418, 36, 22, '#ffe07a', 'left');
  text(`Traps ${S.traps.length}/${maxTraps()}`, 500, 24, 14, S.traps.length >= maxTraps() ? '#ff9d9d' : '#ffe9cf', 'left', 600);
  text(`Hero Brain IQ ${brain.iq(BRAIN_KINDS.length)}`, 500, 48, 14, '#9fe3ff', 'left', 600);
  button('brain', 652, 14, 96, 44, 'Brain', { icon: 'gem', iconH: 22, active: S.showBrain, size: 15 });
  button('heat', 754, 14, 72, 44, 'Heat', { active: S.showHeat, size: 15 });
  button('music', 832, 14, 48, 44, sound.music ? '♫' : '♫̸', { size: 18, active: sound.music });
  button('sfx', 886, 14, 48, 44, sound.sfx ? '🔊' : '🔇', { size: 16 });
  text('Castle', 1103, 17, 13, '#c9c3e6', 'center', 600);
  g.fillStyle = '#05040a'; roundRect(946, 28, 320, 30, 8); g.fill();
  const grd = g.createLinearGradient(950, 0, 1262, 0);
  grd.addColorStop(0, '#ff4d4d'); grd.addColorStop(1, '#ff7ab8');
  g.fillStyle = grd; roundRect(950, 32, Math.max(4, 312 * (S.hp / S.maxHp)), 22, 6); g.fill();
  text(`${S.hp}/${S.maxHp}`, 1106, 43, 16, '#fff');
}

function drawBar() {
  g.fillStyle = '#0d0a18'; g.fillRect(0, BAR, W, H - BAR);
  g.fillStyle = 'rgba(255,122,26,.3)'; g.fillRect(0, BAR, W, 2);
  if (S.screen === 'build') {
    const cards = S.freeTrap ? [...S.offers.slice(0, 4), S.freeTrap] : S.offers;
    cards.forEach((k, i) => {
      const info = TRAPS[k];
      const x = 12 + i * 158;
      const price = priceOf(k);
      const afford = S.coins >= price;
      const sel = S.selected === k;
      const free = k === S.freeTrap;
      button('offer:' + k, x, BAR + 12, 150, 64, '', { active: sel, disabled: !afford, color: free ? '#6b3fb0' : undefined });
      iconTrap(k, x + 30, BAR + 64);
      text(info.name, x + 56, BAR + 32, 14, sel ? '#2a1400' : afford ? '#fff' : '#9a95b5', 'left');
      if (free) text('FREE!', x + 58, BAR + 55, 14, sel ? '#2a1400' : '#9dff9d', 'left');
      else { spr('coin', x + 64, BAR + 64, 15); text(String(price), x + 75, BAR + 55, 14, sel ? '#2a1400' : '#ffe07a', 'left'); }
      const fav = k !== 'block' && brain.favourite(k);
      if (fav && !free) { g.fillStyle = sel ? 'rgba(90,44,0,.25)' : 'rgba(159,227,255,.15)'; roundRect(x + 100, BAR + 46, 44, 18, 9); g.fill(); text(fav, x + 122, BAR + 55, 10, sel ? '#5a2c00' : '#9fe3ff', 'center', 600); }
      text(String(i + 1), x + 142, BAR + 22, 11, sel ? '#5a2c00' : '#77729a', 'right', 600);
    });
    button('reroll', 806, BAR + 12, 112, 64, 'Restock 3', { disabled: S.coins < 3, size: 15 });
    button('sell', 924, BAR + 12, 84, 64, 'Sell', { active: S.sellMode, size: 16 });
    button('start', 1014, BAR + 12, 254, 64, 'START WAVE ▶', { color: '#e8641a', size: 22 });
    if (S.selected) {
      const fav = S.selected !== 'block' && brain.favourite(S.selected);
      text(TRAPS[S.selected].tip + (fav ? `  ·  Heroes have learned to ${fav.toUpperCase()} it` : ''), W / 2, BAR - 18, 15, '#ffe9cf');
    }
  } else if (S.screen === 'wave') {
    button('speed', 12, BAR + 14, 90, 60, `${S.speed}×`, { size: 20 });
    button('follow', 110, BAR + 14, 120, 60, 'Follow', { active: S.cam.follow, size: 16 });
    const st = S.waveStats;
    text(`Killed ${st.killed}/${st.total}`, 260, BAR + 44, 20, '#9dff9d', 'left');
    text(`Damage taken ${st.damage}`, 470, BAR + 44, 18, '#ff9d9d', 'left', 600);
    text('Drag or WASD to look around · Z/X or wheel to zoom · H heatmap', 1250, BAR + 44, 14, '#9fe3ff', 'right', 500);
  }
}

/** Rewarded-ad offers shown while building. */
function drawAdOffers() {
  if (S.screen !== 'build') return;
  let y = (minimapShown() ? MM.y + MM.h + 22 : TOP + 22);
  const x = 12;
  if (!S.slotsAdUsed) { button('ad:slots', x, y, 190, 40, '+2 Trap slots', { color: '#4a2f78', size: 14 }); adBadge(x + 150, y - 9); y += 52; }
  if (!S.crateUsed && !S.freeTrap) { button('ad:crate', x, y, 190, 40, '🎁 Lucky Crate', { color: '#4a2f78', size: 14 }); adBadge(x + 150, y - 9); }
}

function drawNextUp() {
  const counts = {};
  for (const c of S.nextWave) counts[c] = (counts[c] || 0) + 1;
  const rows = CLASS_ORDER.filter((c) => counts[c]);
  const x = W - 262, y = TOP + 12, w = 250, h = 112 + rows.length * 30;
  panel(x, y, w, h, 'NEXT UP · INBOUND');
  rows.forEach((c, i) => {
    const yy = y + 52 + i * 30;
    spr(c + '_walk1', x + 26, yy + 14, 28);
    text(CLASSES[c].name, x + 46, yy, 15, '#fff', 'left', 600);
    text(String(counts[c]), x + w - 16, yy, 16, '#ffd7a8', 'right');
  });
  const py = y + 58 + rows.length * 30;
  g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 14, py - 8, w - 28, 1);
  text('Payout', x + 16, py + 12, 14, '#c9c3e6', 'left', 600);
  text(`+${10 + (S.wave + 1) * 2} base · 1–3 per kill`, x + w - 16, py + 12, 13, '#ffe07a', 'right', 600);
  text('Perfect wave bonus +8', x + w - 16, py + 34, 12, '#9dff9d', 'right', 500);
}

function drawBrainPanel() {
  const n = BRAIN_KINDS.length;
  const x = 12, y = TOP + 8, w = 340, rowH = 25, h = 64 + n * rowH + 50;
  panel(x, y, w, h, 'Hero Guild Brain');
  text('How well heroes handle each trap', x + 16, y + 42, 12, '#c9c3e6', 'left', 500);
  BRAIN_KINDS.forEach((k, i) => {
    const yy = y + 60 + i * rowH;
    iconTrap(k, x + 26, yy + 16, 0.45);
    const m = brain.mastery[k];
    text(TRAPS[k].name, x + 48, yy + 2, 12, '#fff', 'left');
    const pct = m ? m.ema : 0;
    g.fillStyle = '#2c2645'; roundRect(x + 150, yy - 2, 90, 8, 4); g.fill();
    g.fillStyle = pct > 0.7 ? '#ff6b6b' : pct > 0.35 ? '#ffc04d' : '#6ee7b7';
    roundRect(x + 150, yy - 2, Math.max(4, 90 * pct), 8, 4); g.fill();
    text(m ? `${Math.round(pct * 100)}% ${brain.favourite(k) || ''}` : 'unseen', x + w - 12, yy + 2, 11, '#c9c3e6', 'right', 500);
  });
  button('resetbrain', x + 16, y + h - 44, w - 32, 32, 'Wipe hero memory', { size: 13, color: '#3a2440' });
}

function drawToasts() {
  S.toasts.forEach((t, i) => {
    g.globalAlpha = Math.max(0, Math.min(1, t.t * 5, (t.dur - t.t) * 3));
    const y = TOP + 34 + i * 42;
    g.font = `700 19px ${FONT}`;
    const w = g.measureText(t.text).width + 40;
    g.fillStyle = 'rgba(13,10,24,.85)'; roundRect(W / 2 - w / 2, y - 17, w, 34, 17); g.fill();
    text(t.text, W / 2, y, 19, '#ffe9cf');
    g.globalAlpha = 1;
  });
}

function drawOverlay(title, sub, btns, color = '#ffd7a8') {
  g.fillStyle = 'rgba(8,6,16,.75)'; g.fillRect(0, 0, W, H);
  text(title, W / 2, 210, 56, color);
  if (sub) text(sub, W / 2, 274, 20, '#e8e3ff', 'center', 500);
  btns.forEach((b, i) => button(b.id, W / 2 - 150, 320 + i * 70, 300, 56, b.label, { color: b.color, size: 21 }));
}

function drawPause() {
  drawOverlay('Paused', null, [{ id: 'resume', label: 'Resume', color: '#e8641a' }, { id: 'retry', label: 'Restart level' }, { id: 'quit', label: 'Main menu' }]);
  button('music', W / 2 - 150, 540, 145, 46, sound.music ? 'Music: ON' : 'Music: OFF', { size: 15, active: sound.music });
  button('sfx', W / 2 + 5, 540, 145, 46, sound.sfx ? 'Sound: ON' : 'Sound: OFF', { size: 15, active: sound.sfx });
}

function drawSummary() {
  const st = S.waveStats;
  g.fillStyle = 'rgba(30,40,110,.86)'; g.fillRect(0, TOP, W, VIEW_H);
  const e = Math.min(1, S.summaryT * 3);
  g.save(); g.translate(W / 2, TOP + 90); g.scale(0.6 + e * 0.4, 0.6 + e * 0.4);
  text('WAVE COMPLETE', 0, 0, 72, '#fff');
  g.restore();
  text(`${Math.round(st.rate * 100 * Math.min(1, S.summaryT * 1.5))}%`, 330, TOP + 240, 110, '#ffd34d');
  text('KILL RATE', 330, TOP + 320, 22, '#fff');
  if (st.better != null) text(`${st.better >= 0 ? '+' : ''}${Math.round(st.better * 100)}% vs last wave`, 330, TOP + 354, 18, st.better >= 0 ? '#9dff9d' : '#ff9d9d', 'center', 600);
  text(`${st.killed} Killed`, W / 2, TOP + 215, 32, '#fff');
  g.fillStyle = '#fff'; g.fillRect(W / 2 - 110, TOP + 240, 220, 3);
  text(`${st.total} Total`, W / 2, TOP + 268, 32, '#fff');
  text(String(st.damage), 950, TOP + 240, 110, st.damage ? '#ff6b6b' : '#9dff9d');
  text('DAMAGE TAKEN', 950, TOP + 320, 22, '#fff');
  text(st.perfect ? 'PERFECT WAVE! +8' : 'Lost perfect wave', 950, TOP + 354, 18, st.perfect ? '#9dff9d' : '#ff9d9d', 'center', 600);
  text(`Payout +${st.payout * (S.doubled ? 2 : 1)} coins${S.doubled ? '  (doubled!)' : ''}`, W / 2, TOP + 350, 22, '#ffe07a');
  if (S.summaryT > 0.8) {
    if (!S.doubled) { button('ad:double', W / 2 - 290, TOP + 420, 280, 60, `Double payout +${st.payout}`, { color: '#6b3fb0', size: 19 }); adBadge(W / 2 - 60, TOP + 410); }
    button('continue', S.doubled ? W / 2 - 140 : W / 2 + 10, TOP + 420, 280, 60, 'Continue ▶', { color: '#e8641a', size: 22 });
  }
}

function drawLoading() {
  g.fillStyle = '#0d0a18'; g.fillRect(0, 0, W, H);
  const grd = g.createRadialGradient(W / 2, 300, 20, W / 2, 300, 500);
  grd.addColorStop(0, 'rgba(255,122,26,.25)'); grd.addColorStop(1, 'rgba(255,122,26,0)');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  if (IMG.monster_idle1?.width) spr(Math.floor(S.time * 3) % 2 ? 'monster_idle1' : 'monster_laugh', W / 2, 330 + Math.abs(Math.sin(S.time * 5)) * -14, 130);
  text('TINY DUNGEON KEEPER', W / 2, 400, 46, '#ff8a2a');
  g.fillStyle = '#2c2645'; roundRect(W / 2 - 220, 450, 440, 22, 11); g.fill();
  const grd2 = g.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0);
  grd2.addColorStop(0, '#ffad5c'); grd2.addColorStop(1, '#ff6a00');
  g.fillStyle = grd2; roundRect(W / 2 - 220, 450, Math.max(22, 440 * S.loadP), 22, 11); g.fill();
  text(`Loading the dungeon… ${Math.round(S.loadP * 100)}%`, W / 2, 500, 18, '#e8e3ff', 'center', 600);
  const tips = ['Tip: a Spring right before a pit sends heroes flying.', 'Tip: heroes learn — swap your traps when they get smart.', 'Tip: Spike Balls can float anywhere in the air.', 'Tip: the Croc snaps at heroes who try to jump over it.'];
  text(tips[Math.floor(S.time / 2.5) % tips.length], W / 2, 560, 16, '#9fe3ff', 'center', 500);
}

function drawTitle() {
  // living background: sky, mountains, hills, a castle with the keeper on top
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#6cc4ff'); grd.addColorStop(1, '#d6f0ff');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,230,.85)'; g.beginPath(); g.arc(1120, 90, 46, 0, 7); g.fill();
  if (!S.clouds.length) S.clouds = Array.from({ length: 9 }, (_, k) => ({ x: Math.random() * 2400, y: 20 + Math.random() * 160, s: 0.6 + Math.random() * 0.7, k }));
  hills(THEMES.meadow, S.time * 30, 0, H, W);
  const groundY = H - 70;
  g.fillStyle = '#c98a4b'; g.fillRect(0, groundY, W, 70);
  g.fillStyle = '#63c93f'; g.fillRect(0, groundY, W, 14);
  g.fillStyle = INK; g.fillRect(0, groundY - 2, W, 3);
  const top = castleArt(1080, groundY, THEMES.meadow, 1.25);
  const saved = { mood: S.mood, speech: S.speech };
  S.mood = ['idle', 'laugh', 'celebrate', 'idle', 'laugh'][Math.floor(S.time / 1.8) % 5];
  if (!S.titleSpeech || S.time - S.titleSpeech > 4) { S.titleSpeech = S.time; S.speech = { text: LAUGHS[Math.floor(S.time) % LAUGHS.length], t: 0, dur: 2 }; S.menuSpeech = S.speech; }
  S.speech = S.menuSpeech && S.time - S.titleSpeech < 2 ? { ...S.menuSpeech, t: S.time - S.titleSpeech } : null;
  drawKeeper(top.x, top.y + 12, 84, 1.1);
  S.mood = saved.mood; S.speech = saved.speech;
  ['hero', 'thief', 'knight', 'barb', 'wizard', 'hero', 'thief'].forEach((p, i) => {
    const x = ((S.time * 80 + i * 150) % (W + 300)) - 150;
    if (x > 990) return;
    spr(`${p}_walk${1 + (Math.floor(S.time * 10 + i) % 6)}`, x, groundY - Math.abs(Math.sin(S.time * 12 + i)) * 3, 50);
  });
  // logo
  g.save();
  g.translate(470, 150);
  g.rotate(Math.sin(S.time * 1.5) * 0.02);
  text('TINY DUNGEON', 0, -34, 70, '#ff8a2a');
  text('KEEPER', 0, 36, 84, '#ffd34d');
  g.restore();
  text('Build the traps. The heroes learn. Outsmart them.', 470, 240, 19, INK, 'center', 600);
  const next = Math.min(progress.unlocked - 1, LEVELS.length - 1);
  button('play', 320, 290, 300, 72, `▶  PLAY  ·  Level ${next + 1}`, { color: '#e8641a', size: 26 });
  button('menu:levels', 320, 376, 300, 54, 'Levels', { color: '#3a2a5a', size: 20 });
  button('menu:settings', 320, 442, 145, 50, 'Settings', { color: '#2c2645', size: 17 });
  button('menu:credits', 475, 442, 145, 50, 'Credits', { color: '#2c2645', size: 17 });
  text(`Hero Brain IQ ${brain.iq(BRAIN_KINDS.length)} · heroes remember your traps`, 470, 520, 15, INK, 'center', 600);
  if (S.menu === 'levels') drawLevelSelect();
  if (S.menu === 'settings') drawSettings();
  if (S.menu === 'credits') drawCredits();
}

function drawLevelSelect() {
  g.fillStyle = 'rgba(8,6,16,.7)'; g.fillRect(0, 0, W, H);
  panel(140, 80, 1000, 520);
  text('Choose a level', W / 2, 120, 32, '#ffad5c');
  const worlds = [['World 1 · The Dungeon', [0, 1, 2]], ['World 2 · The Overworld', [3, 4, 5, 6]]];
  worlds.forEach(([name, ids], wi) => {
    const y = 180 + wi * 190;
    text(name, 180, y, 20, '#ffe9cf', 'left');
    ids.forEach((i, k) => {
      const L = LEVELS[i];
      const open = i < progress.unlocked;
      const x = 180 + k * 232, by = y + 22;
      button('level:' + i, x, by, 216, 120, '', { disabled: !open, color: open ? (L.theme === 'dungeon' ? '#5b3a8a' : '#2f8a5a') : undefined });
      text(open ? `${i + 1}` : '🔒', x + 30, by + 30, 28, '#fff');
      text(open ? L.name : 'Locked', x + 108, by + 64, 16, open ? '#fff' : '#9a95b5');
      if (open) { const st = progress.stars[i] || 0; text('★★★'.slice(0, st) + '☆☆☆'.slice(0, 3 - st), x + 108, by + 94, 20, '#ffe07a'); }
    });
  });
  button('menu:close', W / 2 - 100, 540, 200, 46, 'Back', { size: 18 });
}

function drawSettings() {
  g.fillStyle = 'rgba(8,6,16,.7)'; g.fillRect(0, 0, W, H);
  panel(W / 2 - 220, 150, 440, 380);
  text('Settings', W / 2, 190, 30, '#ffad5c');
  button('music', W / 2 - 160, 230, 320, 56, sound.music ? 'Music: ON' : 'Music: OFF', { size: 19, active: sound.music });
  button('sfx', W / 2 - 160, 300, 320, 56, sound.sfx ? 'Sound effects: ON' : 'Sound effects: OFF', { size: 19, active: sound.sfx });
  button('resetbrain', W / 2 - 160, 370, 320, 56, 'Wipe hero memory', { size: 17, color: '#5a2440' });
  button('menu:close', W / 2 - 100, 456, 200, 46, 'Back', { size: 18 });
}

function drawCredits() {
  g.fillStyle = 'rgba(8,6,16,.7)'; g.fillRect(0, 0, W, H);
  panel(W / 2 - 330, 110, 660, 470);
  text('Credits', W / 2, 150, 30, '#ffad5c');
  const lines = [
    ['Game, code & design', 'Loopkind'],
    ['Characters & traps art', 'Loopkind'],
    ['Music', '"The Villain\'s Blueprints"'],
    ['Sound effects', 'Kenney (kenney.nl) — CC0'],
    ['', 'Impact, RPG, Sci-fi, Interface, Digital,'],
    ['', 'Music Jingles & Voiceover Fighter packs'],
    ['Font', 'Space Grotesk (SIL OFL)'],
  ];
  lines.forEach(([a, b], i) => {
    text(a, W / 2 - 290, 210 + i * 40, 17, '#c9c3e6', 'left', 600);
    text(b, W / 2 + 290, 210 + i * 40, 17, '#fff', 'right', 600);
  });
  button('menu:close', W / 2 - 100, 508, 200, 46, 'Back', { size: 18 });
}

function drawTutorial() {
  if (!S.tutorial || S.screen !== 'build' || S.levelIndex !== 0 || S.wave !== 0) return;
  const x = 340, y = TOP + 120, w = 600, h = 180;
  panel(x, y, w, h);
  text('How to play', x + w / 2, y + 26, 22, '#ffad5c');
  text('1. Pick a trap below (or press 1–5), then click a glowing cell.', x + 24, y + 62, 15, '#fff', 'left', 500);
  text('2. Some traps (Spike Ball, cannons) can float anywhere in mid-air.', x + 24, y + 88, 15, '#fff', 'left', 500);
  text('3. Press START WAVE and watch the crowd come. Drag to look around.', x + 24, y + 114, 15, '#fff', 'left', 500);
  text('4. Heroes LEARN from every trap — keep changing your plan!', x + 24, y + 140, 15, '#fff', 'left', 500);
}

function render() {
  buttons = [];
  g.clearRect(0, 0, W, H);
  if (S.screen === 'loading') { drawLoading(); return; }
  if (S.screen === 'title') { drawTitle(); return; }
  renderWorld();
  drawMinimap();
  drawHUD();
  drawBar();
  if (S.screen === 'build') { drawNextUp(); drawAdOffers(); drawTutorial(); }
  if (S.showBrain) drawBrainPanel();
  if (S.screen === 'summary') drawSummary();
  drawToasts();
  if (S.paused) drawPause();
  if (S.screen === 'win') {
    const last = S.levelIndex >= LEVELS.length - 1;
    drawOverlay(`${'★'.repeat(S.winStars)}${'☆'.repeat(3 - S.winStars)}  Level complete!`, `${S.kills} heroes defeated · Castle ${S.hp}/100 · Hero Brain IQ ${brain.iq(BRAIN_KINDS.length)}`,
      last ? [{ id: 'retry', label: 'Play again', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }]
           : [{ id: 'next', label: 'Next level ▶', color: '#e8641a' }, { id: 'retry', label: 'Replay' }, { id: 'quit', label: 'Main menu' }], '#ffe07a');
  }
  if (S.screen === 'lose') drawOverlay('The castle fell!', `The heroes got smarter. Try new trap combos! (wave ${S.wave})`, [{ id: 'retry', label: 'Try again', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }], '#ff9d9d');
  if (S.adBusy) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H); text('Loading ad…', W / 2, H / 2, 26, '#fff'); }
}

/* ═════════════════════════ input ═════════════════════════ */
const keys = {};
let drag = null;
function toLocal(e) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}
function jumpMinimap(p) {
  S.cam.x = (p.x - MM.x) / MM.k - W / S.cam.z / 2;
  S.cam.y = (p.y - MM.y) / MM.k - VIEW_H / S.cam.z / 2;
  S.cam.follow = false;
  clampCam();
}

canvas.addEventListener('pointermove', (e) => {
  const p = toLocal(e);
  S.hover = p;
  if (!drag) return;
  if (drag.mini) return jumpMinimap(p);
  const dx = p.x - drag.x, dy = p.y - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) > 8) drag.moved = true;
  if (drag.moved) {
    S.cam.x = drag.camX - dx / S.cam.z;
    S.cam.y = drag.camY - dy / S.cam.z;
    S.cam.follow = false;
    clampCam();
  }
});
canvas.addEventListener('pointerleave', () => { S.hover = null; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (S.screen === 'title' || S.screen === 'loading') return;
  const p = toLocal(e);
  zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y);
}, { passive: false });

canvas.addEventListener('pointerdown', (e) => {
  unlockAudio();
  if (S.adBusy || S.screen === 'loading') return;
  const p = toLocal(e);
  S.hover = p;
  const b = [...buttons].reverse().find((b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
  if (b) { if (!b.disabled) onButton(b.id); return; }
  if (S.screen === 'title' || S.paused || p.y < TOP || p.y >= BAR) return;
  if (overMinimap(p)) { drag = { mini: true }; jumpMinimap(p); return; }
  drag = { x: p.x, y: p.y, camX: S.cam.x, camY: S.cam.y, moved: false, button: e.button };
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
});
canvas.addEventListener('pointerup', (e) => {
  const d = drag;
  drag = null;
  if (!d || d.moved || d.mini || S.screen !== 'build') return;
  const p = toLocal(e);
  const wp = toWorld(p.x, p.y);
  const c = Math.floor(wp.x / T), r = Math.floor(wp.y / T);
  if (S.sellMode || d.button === 2) {
    const t = trapAtCell(c, r);
    if (t) {
      S.traps = S.traps.filter((x) => x !== t);
      if (t.kind === 'block') removeBlock(t.c, t.r);
      S.coins += Math.floor(TRAPS[t.kind].price * 0.6);
      poof(t.cx, r * T + T / 2, 8);
      play('sell');
    }
    return;
  }
  if (!S.selected) return;
  if (!canPlace(S.selected, c, r)) { play('error'); return; }
  const price = priceOf(S.selected);
  if (S.coins < price) { toast('Not enough coins', 1); play('error'); return; }
  if (S.traps.length >= maxTraps()) { toast(`Trap limit reached (${maxTraps()}). Sell one or start the wave.`, 1.6); play('error'); return; }
  S.coins -= price;
  S.traps.push(makeTrap(S.selected, c, r));
  if (S.selected === 'block') { placeBlock(c, r); play('block'); } else play('place');
  poof(c * T + T / 2, r * T + T / 2, 6);
  if (S.selected === S.freeTrap) { S.freeTrap = null; S.selected = null; }
  else if (S.coins < price) S.selected = null;
});

async function onButton(id) {
  play('click');
  if (id.startsWith('level:')) { loadLevel(+id.slice(6)); return; }
  if (id.startsWith('offer:')) { const k = id.slice(6); S.selected = S.selected === k ? null : k; S.sellMode = false; if (S.selected) play('select'); return; }
  if (id.startsWith('menu:')) { const m = id.slice(5); S.menu = m === 'close' ? null : m; return; }
  switch (id) {
    case 'play': loadLevel(Math.min(progress.unlocked - 1, LEVELS.length - 1)); break;
    case 'start': startWave(); break;
    case 'reroll': if (S.coins >= 3) { S.coins -= 3; rollOffers(); } break;
    case 'sell': S.sellMode = !S.sellMode; S.selected = null; break;
    case 'brain': S.showBrain = !S.showBrain; break;
    case 'heat': S.showHeat = !S.showHeat; break;
    case 'speed': S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 4 : 1; break;
    case 'follow': S.cam.follow = !S.cam.follow; break;
    case 'music': setMusic(!sound.music); break;
    case 'sfx': setSfx(!sound.sfx); break;
    case 'menu': if (S.screen !== 'title') { S.paused = !S.paused; pcall(S.paused ? 'gameplayStop' : 'gameplayStart'); } break;
    case 'resume': S.paused = false; if (S.screen === 'wave') pcall('gameplayStart'); break;
    case 'continue': toBuild(); break;
    case 'quit': S.paused = false; brain.save(); await showInterstitial(); S.screen = 'title'; S.menu = null; break;
    case 'retry': S.paused = false; await showInterstitial(); loadLevel(S.levelIndex); break;
    case 'next': await showInterstitial(); loadLevel(Math.min(LEVELS.length - 1, S.levelIndex + 1)); break;
    case 'ad:double':
      if (!S.doubled && await showRewarded()) { S.doubled = true; S.coins += S.waveStats.payout; play('reward'); toast(`+${S.waveStats.payout} coins!`, 1.5); }
      break;
    case 'ad:slots':
      if (!S.slotsAdUsed && await showRewarded()) { S.slotsAdUsed = true; S.bonusSlots += 2; play('reward'); toast('+2 trap slots for this level!', 1.8); }
      break;
    case 'ad:crate':
      if (!S.crateUsed && await showRewarded()) {
        S.crateUsed = true;
        S.freeTrap = PREMIUM[(Math.random() * PREMIUM.length) | 0];
        S.selected = S.freeTrap;
        play('reward');
        toast(`Lucky Crate: a FREE ${TRAPS[S.freeTrap].name}! Place it anywhere it fits.`, 2.6);
      }
      break;
    case 'resetbrain':
      if (confirm('Wipe the heroes\' memory? They will forget everything they learned.')) { brain.reset(); toast('Hero memory wiped', 1.5); }
      break;
  }
}

const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };
window.addEventListener('keydown', (e) => {
  unlockAudio();
  if (S.screen === 'loading' || S.adBusy) return;
  if (KEYMAP[e.key] && S.screen !== 'title') { keys[KEYMAP[e.key]] = true; e.preventDefault(); }
  if (S.screen === 'build') {
    const cards = S.freeTrap ? [...S.offers.slice(0, 4), S.freeTrap] : S.offers;
    if (e.key >= '1' && e.key <= '5' && cards[+e.key - 1]) onButton('offer:' + cards[+e.key - 1]);
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startWave(); }
    if (e.key === 'q' || e.key === 'Q') onButton('sell');
    if (e.key === 'r' || e.key === 'R') onButton('reroll');
  } else if (S.screen === 'summary' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); toBuild(); }
  if (S.screen === 'title') { if (e.key === 'Escape') S.menu = null; return; }
  if (e.key === 'z' || e.key === 'Z') zoomAt(1.15);
  if (e.key === 'x' || e.key === 'X') zoomAt(1 / 1.15);
  if (e.key === 'h' || e.key === 'H') S.showHeat = !S.showHeat;
  if (e.key === 'f' || e.key === 'F') S.cam.follow = !S.cam.follow;
  if (e.key === 'Escape') { S.selected = null; S.sellMode = false; onButton('menu'); }
  if (e.key === 'b' || e.key === 'B') S.showBrain = !S.showBrain;
  if (e.key === 'm' || e.key === 'M') setMusic(!sound.music);
});
window.addEventListener('keyup', (e) => { if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { brain.save(); duck(true); if (S.screen === 'wave') S.paused = true; }
  else if (!S.adBusy) duck(false);
});

/* ═════════════════════════ loop ═════════════════════════ */
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (S.screen === 'title' || S.screen === 'loading') S.time += dt;
  else if (!S.paused && !S.adPause && !S.adBusy) {
    acc += dt * (S.screen === 'wave' ? S.speed : 1);
    let n = 0;
    while (acc >= STEP && n++ < 60) { update(STEP); acc -= STEP; }
    if (n >= 60) acc = 0;
    updateCamera(dt);
  }
  render();
  requestAnimationFrame(frame);
}

window.__tdk = { S, brain, loadLevel, startWave, makeTrap, canPlace, update, TRAPS, maxTraps, placeBlock, toBuild, LEVELS, onButton };

(async function boot() {
  resize();
  requestAnimationFrame(frame);
  pcall('loadingStart');
  await loadAssets();
  pcall('loadingStop');
  pcall('ready');
  document.getElementById('loading')?.remove();
  setTimeout(() => { S.screen = 'title'; }, 300);
  setInterval(() => brain.save(), 5000);
})();
