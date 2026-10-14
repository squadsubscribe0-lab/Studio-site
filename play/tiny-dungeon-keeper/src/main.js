import { Brain, ACTIONS } from './brain.js';
import { LEVELS, THEMES } from './levels.js';
import { sfx, sound, unlockAudio } from './audio.js';

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

const TRAPS = {
  block:  { name: 'Block',        price: 3,  mount: 'floor',   tip: 'A brick wall. Reshape the path — heroes can only hop 2 tiles high.' },
  spring: { name: 'Spring',       price: 4,  mount: 'floor',   tip: 'Bounces heroes backwards. Put it before a pit!' },
  spikes: { name: 'Spikes',       price: 6,  mount: 'floor',   tip: 'Pointy floor: 60 damage. Two in a row finish a hero.' },
  slime:  { name: 'Slime Pit',    price: 6,  mount: 'floor',   tip: 'Sticky goo. Heroes that stay in it sink.' },
  fire:   { name: 'Fire Vent',    price: 10, mount: 'floor',   tip: 'Blasts a tall flame on a timer.' },
  rock:   { name: 'Falling Rock', price: 8,  mount: 'ceiling', tip: 'Drops when a hero walks close. Needs a ceiling.' },
  saw:    { name: 'Saw Blade',    price: 12, mount: 'floor',   tip: 'Rolls back and forth, cutting again and again.' },
  axe:    { name: 'Swing Axe',    price: 12, mount: 'ceiling', tip: 'A pendulum — timing is everything.' },
  bomb:   { name: 'Bomb Barrel',  price: 12, mount: 'floor',   tip: 'Lights up when heroes come close, then BOOM.' },
  wheel:  { name: 'Stone Wheel',  price: 14, mount: 'floor',   tip: 'Rolls at incoming heroes. They must jump it.' },
  cannon: { name: 'Cannon',       price: 15, mount: 'floor',   tip: 'Fires cannonballs at the nearest heroes.' },
  cage:   { name: 'Drop Cage',    price: 14, mount: 'ceiling', tip: 'Snaps shut on heroes right below.' },
};
const UNLOCK = ['block', 'spring', 'spikes', 'slime', 'fire', 'rock', 'saw', 'axe', 'bomb', 'wheel', 'cannon', 'cage'];
const BRAIN_KINDS = UNLOCK.filter((k) => k !== 'block');

const CLASSES = {
  hero:   { name: 'The Hero',   speed: 100, hp: 100, reward: 1, dmg: 1, w: 22, h: 34, draw: 48 },
  thief:  { name: 'The Runner', speed: 140, hp: 70,  reward: 1, dmg: 2, w: 20, h: 32, draw: 46 },
  knight: { name: 'The Knight', speed: 78,  hp: 220, reward: 2, dmg: 3, w: 24, h: 36, draw: 52 },
  barb:   { name: 'The Brute',  speed: 82,  hp: 260, reward: 3, dmg: 4, w: 26, h: 36, draw: 52 },
  wizard: { name: 'The Wizard', speed: 90,  hp: 90,  reward: 2, dmg: 2, w: 22, h: 34, draw: 50 },
};
const CLASS_ORDER = ['hero', 'thief', 'knight', 'barb', 'wizard'];

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
  await Promise.all(Object.keys(meta).map((n) => new Promise((res) => {
    const im = new Image();
    im.onload = im.onerror = () => res();
    im.src = `assets/sprites/${n}.png`;
    IMG[n] = im;
  })));
  try {
    const f = new FontFace('SG', 'url(assets/fonts/space-grotesk-latin.woff2)', { weight: '300 700' });
    document.fonts.add(await f.load());
  } catch (e) {}
}

function spr(name, x, y, h, o = {}) {
  const im = IMG[name];
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

/* ═════════════════════════ state ═════════════════════════ */
const brain = new Brain();
let progress = { unlocked: 1, stars: {} };
try { progress = { ...progress, ...JSON.parse(localStorage.getItem('tdk_progress2') || 'null') }; } catch (e) {}
const saveProgress = () => { try { localStorage.setItem('tdk_progress2', JSON.stringify(progress)); } catch (e) {} };

const S = {
  screen: 'title', levelIndex: 0, theme: THEMES.meadow,
  grid: [], cols: 0, rows: 0, door: null, goal: null, decor: [],
  traps: [], heroes: [], balls: [], particles: [], coinsFly: [], floaters: [], toasts: [],
  coins: 0, hp: 100, maxHp: 100, wave: 0, kills: 0, escaped: 0,
  waveStats: null, lastKillRate: null, nextWave: [],
  spawnQueue: [], spawnT: 0,
  offers: [], selected: null, sellMode: false,
  speed: 1, paused: false, showBrain: false, showHeat: false, heat: [],
  cam: { x: 0, y: 0, z: 1, follow: true },
  shake: 0, mood: 'idle', moodT: 0, time: 0, hover: null, tutorial: true, minimap: null,
  clouds: [], stars: [], summaryT: 0, winStars: 0,
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
  S.coins = 45 + i * 12;
  S.hp = S.maxHp = 100;
  S.wave = 0; S.kills = 0; S.escaped = 0; S.lastKillRate = null; S.waveStats = null;
  S.selected = null; S.sellMode = false; S.screen = 'build'; S.paused = false;
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
  toast(`Level ${i + 1}: ${L.name}`, 2.5);
}

function floorBelow(c, r) {
  for (let rr = r; rr < S.rows; rr++) if (solidAt(c, rr)) return rr * T;
  return S.rows * T + 400;
}

function unlockedKinds() {
  return UNLOCK.slice(0, Math.min(UNLOCK.length, 5 + S.levelIndex + S.wave));
}

function rollOffers(free) {
  const pool = unlockedKinds().filter((k) => k !== 'block');
  for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  S.offers = ['block', ...pool.slice(0, 4)];
  if (S.selected && !S.offers.includes(S.selected)) S.selected = null;
  if (!free) sfx.click();
}

const maxTraps = () => Math.min(16, 5 + S.wave + Math.floor(S.levelIndex / 2));
const trapAtCell = (c, r) => S.traps.find((t) => t.c === c && t.r === r);

function canPlace(kind, c, r) {
  if (c < 1 || c >= S.cols - 1 || r < 1 || r >= S.rows) return false;
  if (solidAt(c, r) || trapAtCell(c, r)) return false;
  const mount = TRAPS[kind].mount;
  if (mount === 'floor' && !solidAt(c, r + 1)) return false;
  if (mount === 'ceiling') {
    if (!solidAt(c, r - 1) || solidAt(c, r + 1)) return false;
    if (floorBelow(c, r) > (r + 5) * T) return false; // needs a floor within reach
  }
  if (kind === 'block') {
    // nothing may hang right above it, and the wall must stay hop-able (≤ 2 high)
    if (trapAtCell(c, r - 1)) return false;
    let h = 1;
    for (let rr = r + 1; rr < S.rows && solidAt(c, rr) && h < 4; rr++) {
      if (solidAt(c - 1, rr) && solidAt(c + 1, rr)) break;
      h++;
    }
    if (h > 2) return false;
  }
  const fy = mount === 'floor' ? r : Math.floor(floorBelow(c, r) / T) - 1;
  for (const p of [S.door, S.goal]) if (p && p.r === fy && Math.abs(p.c - c) <= (p === S.goal ? 2 : 1)) return false;
  return true;
}

function makeTrap(kind, c, r) {
  const t = {
    id: nextId++, kind, c, r, x: c * T, cx: c * T + T / 2,
    floorY: floorBelow(c, r), ceilY: r * T,
    state: 'armed', timer: 0, disabledT: 0, broken: false, phaseOffset: Math.random(),
  };
  if (kind === 'fire') t.timer = Math.random() * 3;
  if (kind === 'axe') { t.len = Math.max(60, Math.min(130, t.floorY - t.ceilY - 36)); t.period = 2.6; t.amp = 1.1; }
  if (kind === 'rock' || kind === 'cage') { t.y = t.ceilY; t.vy = 0; }
  if (kind === 'wheel') { t.wx = t.cx; t.vx = 0; t.rot = 0; }
  if (kind === 'saw') { t.sx = t.cx; t.dir = 1; t.rot = 0; sawRange(t); }
  if (kind === 'spring') t.squish = 0;
  if (kind === 'cannon') { t.face = -1; t.timer = 1 + Math.random(); t.recoil = 0; }
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
  const total = Math.min(200, Math.round((6 + w * 5 + w * w * 1.2) * (0.8 + L * 0.25)));
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
  S.spawnT = 0.4;
  S.waveStats = { total: S.spawnQueue.length, killed: 0, damage: 0 };
  for (const t of S.traps) { t.broken = false; t.disabledT = 0; resetTrap(t); }
  S.cam.follow = true;
  mood('lever', 0.8);
  sfx.lever();
}

function resetTrap(t) {
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
    slimeT: 0, stunT: 0, springCd: 0, forceGoT: 0, bounces: 0, life: 0,
    shield: cls === 'knight', castT: 0, wizardCd: 1.5, swingT: 0, flashT: 0,
    thought: null, thoughtT: 0, deadT: 0, spin: 0, caged: null, speedMul: 0.92 + Math.random() * 0.16,
  });
}

function endWave() {
  brain.save();
  const st = S.waveStats;
  st.rate = st.total ? st.killed / st.total : 1;
  st.better = S.lastKillRate == null ? null : st.rate - S.lastKillRate;
  S.lastKillRate = st.rate;
  st.payout = 10 + S.wave * 2;
  st.perfect = st.damage === 0;
  S.coins += st.payout + (st.perfect ? 8 : 0);
  if (S.wave >= LEVELS[S.levelIndex].waves) {
    const stars = S.hp >= 90 ? 3 : S.hp >= 50 ? 2 : 1;
    progress.stars[S.levelIndex] = Math.max(progress.stars[S.levelIndex] || 0, stars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length, S.levelIndex + 2));
    saveProgress();
    S.screen = 'win';
    S.winStars = stars;
    mood('celebrate', 99);
    sfx.win();
    return;
  }
  S.screen = 'summary';
  S.summaryT = 0;
  mood(st.rate > 0.95 ? 'celebrate' : 'laugh', 2);
  sfx.win();
}

function toBuild() {
  S.screen = 'build';
  planWave();
  rollOffers(true);
  if (5 + S.levelIndex + S.wave <= UNLOCK.length) toast(`New trap unlocked: ${TRAPS[unlockedKinds().at(-1)].name}!`, 2.4);
}

/* ═════════════════════════ hero AI ═════════════════════════ */
function heroGroup(h) {
  if (h.cls === 'barb') return 'b';
  if (h.cls === 'knight' && h.shield) return 'k';
  return 'n';
}

function trapZone(t) {
  if (t.kind === 'wheel') return [t.wx - 18, t.wx + 18];
  if (t.kind === 'saw') return [t.sx - 18, t.sx + 18];
  if (t.kind === 'axe') { const r = Math.min(60, t.len * 0.72); return [t.cx - r, t.cx + r]; }
  if (t.kind === 'bomb') return [t.cx - 34, t.cx + 34];
  if (t.kind === 'ball') return [t.x - 10, t.x + 10];
  return [t.x + 2, t.x + T - 2];
}
const inLane = (h, t) => { const feet = h.y + h.h; return feet <= t.floorY + 6 && feet > t.floorY - 3.5 * T; };
const trapActive = (t) => !t.broken && t.disabledT <= 0 && t.kind !== 'block';

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
    case 'ball': return 1;
    default: return 0;
  }
}
const brainKind = (t) => (t.kind === 'ball' ? 'cannon' : t.kind);
const findThreat = (id) => S.traps.find((x) => x.id === id) || S.balls.find((b) => b.id === id);

function think(h, dt) {
  for (const [id, e] of h.enc) {
    const t = findThreat(id);
    if (!t) { // a cannonball that vanished without hitting = dodged
      if (e.ball) finishEncounter(h, { id, kind: 'ball' }, 1 - e.dmg);
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
    if (!trapActive(t) || t.state === 'respawn' || t.kind === 'cannon') continue;
    if (t.kind === 'spring' && h.bounces >= 3) continue;
    consider(t);
  }
  for (const b of S.balls) if (Math.sign(b.vx) === -h.dir) consider(b);

  if (h.forceGoT > 0) { h.forceGoT -= dt; h.action = 'go'; return; }
  if (!best) { h.action = 'go'; h.lastKey = null; return; }

  const key = brain.key(brainKind(best), distBucket(bd), trapPhase(best, h), heroGroup(h));
  let e = h.enc.get(best.id);
  if (!e) { e = { steps: [], waitT: 0, dmg: 0, ball: best.kind === 'ball' }; h.enc.set(best.id, e); }
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
    sfx.learn();
    mood('angry', 1.5);
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

function jump(h, vy, vx) { h.vy = vy; h.vx = h.dir * vx; h.grounded = false; }

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
  if (solidAt(edgeCol, footRow + 1)) return; // still ground under the front foot
  for (let r = footRow + 2; r <= footRow + 6 && r < S.rows; r++) if (solidAt(edgeCol, r)) return; // a drop: walk off
  // a bottomless pit: find a landing up to 4 columns away
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
    if (h.caged) return;
    h.vy += GRAVITY * 0.6 * dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.spin += dt * 9;
    if (h.deadT > 1.2) h.gone = true;
    return;
  }

  const C = h.C;
  const walk = C.speed * h.speedMul;
  const air = Math.max(150, walk * 1.45);
  h.life += dt;
  if (h.life > 90) { h.alive = false; h.gone = true; h.enc.clear(); poof(h.x + h.w / 2, h.y + h.h / 2, 8); return; }

  if (h.stunT > 0) {
    h.stunT -= dt;
    if (h.grounded) h.vx *= Math.pow(0.02, dt);
  } else {
    think(h, dt);
    if (h.cls === 'wizard') {
      h.wizardCd -= dt;
      if (h.wizardCd <= 0) {
        const t = S.traps.find((t) => trapActive(t) && inLane(h, t) && (({ d, passed }) => !passed && d < 90 && d > -10)(aheadDist(h, t)));
        if (t) {
          t.disabledT = 3; h.wizardCd = 7; h.castT = 0.6;
          sfx.magic();
          for (let i = 0; i < 14; i++) spark(t.cx, TRAPS[t.kind].mount === 'ceiling' ? t.ceilY + 20 : t.floorY - 14, '#7fd8ff');
        }
      }
    }
    if (h.grounded) {
      const act = h.action;
      let speed = act === 'wait' ? 0 : act === 'dash' ? walk * 1.7 : walk;
      if (h.castT > 0) speed = 0;
      h.vx = h.dir * speed;
      if (speed > 0) navigate(h, air);
      if (h.grounded && act === 'jump' && h.slimeT <= 0) { jump(h, -560, air); sfx.jump(); }
    }
  }

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
      mood('angry', 1.2);
      sfx.steal();
    }
  }
}

function damage(h, amount, trap, how) {
  if (!h.alive) return;
  if (trap && h.hitCd.get(trap.id) > S.time) return;
  h.hp -= amount;
  h.hpShowT = 1.5;
  h.flashT = 0.12;
  const e = trap && h.enc.get(trap.id);
  if (e) e.dmg += amount / h.C.hp;
  floater(h.x + h.w / 2 + (Math.random() - 0.5) * 16, h.y - 6, String(Math.min(amount, 999)), amount >= 100 ? '#fff' : '#ffd36b', amount >= 100 ? 18 : 15);
  if (h.hp <= 0) defeat(h, trap, how);
}

function defeat(h, trap, how) {
  if (!h.alive) return;
  h.alive = false;
  h.deadT = 0;
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
  S.coinsFly.push({ x: cx, y: cy, t: 0 });
  poof(cx, cy, 6);
  for (let i = 0; i < 4; i++) spark(cx, cy, ['#ff7a1a', '#ffd34d', '#ff5c8a'][i % 3]);
  if (Math.random() < 0.3) mood(Math.random() < 0.5 ? 'laugh' : 'celebrate', 0.9);
  sfx.defeat();
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
  if (h.shield && ['axe', 'rock', 'wheel', 'ball', 'saw'].includes(t.kind)) {
    h.shield = false; h.swingT = 0.45; h.stunT = 0.35; h.vx = -h.dir * 120; h.vy = -200;
    sfx.clang();
    for (let i = 0; i < 8; i++) spark(h.x + h.w / 2 + h.dir * 12, h.y + h.h / 2, '#dfe6ee');
    if (t.kind === 'rock' || t.kind === 'wheel') shatter(t);
    if (t.kind === 'ball') t.dead = true;
    h.hitCd.set(t.id, S.time + 0.6);
    return true;
  }
  return false;
}

function shatter(t) {
  if (t.kind === 'rock' || t.kind === 'cage') {
    for (let i = 0; i < 10; i++) shard(t.cx, (t.y || t.floorY) + 20, t.kind === 'rock' ? '#8a8f99' : '#5b616e');
    t.state = 'respawn'; t.timer = 2.5; t.y = t.ceilY; t.vy = 0;
  }
  if (t.kind === 'wheel') {
    for (let i = 0; i < 10; i++) shard(t.wx, t.floorY - 18, '#8a8f99');
    t.state = 'respawn'; t.timer = 3; t.wx = t.cx; t.vx = 0;
  }
  sfx.crash();
}

function explode(x, y, radius, dmg, src) {
  S.shake = Math.max(S.shake, 10);
  sfx.crash();
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

function updateTrap(t, dt) {
  if (t.disabledT > 0) t.disabledT -= dt;
  const live = S.heroes.filter((h) => h.alive);
  const on = trapActive(t);
  switch (t.kind) {
    case 'spikes':
      if (!on) break;
      for (const h of live) if (rectHit(h, t.x + 5, t.floorY - 15, T - 10, 15)) { damage(h, 60, t, 'spiked'); h.hitCd.set(t.id, S.time + 0.8); }
      break;
    case 'slime':
      if (!on) break;
      for (const h of live) if (rectHit(h, t.x + 3, t.floorY - 10, T - 6, 10) && h.vy >= 0) h.inSlime = t;
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
          sfx.boing();
          finishEncounter(h, t, -0.6);
        }
      }
      break;
    case 'fire': {
      t.timer = (t.timer + dt) % 3;
      const prev = t.state;
      t.state = t.timer < 1.4 ? 'off' : t.timer < 1.9 ? 'warn' : 'on';
      if (!on) { t.state = 'off'; break; }
      if (t.state === 'on' && prev !== 'on' && S.screen === 'wave') sfx.fire();
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
      for (const h of live) if (circleHit(h, bx, by, 14) && !absorb(h, t)) { damage(h, 120, t, 'chopped'); h.hitCd.set(t.id, S.time + 0.6); }
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
        if (Math.random() < 0.6) spark(t.sx, t.floorY - 16, '#ffe9a8');
      }
      break;
    }
    case 'bomb': {
      if (t.state === 'respawn') { t.timer -= dt; if (t.timer <= 0) t.state = 'armed'; break; }
      if (!on) break;
      if (t.state === 'armed') {
        for (const h of live) if (Math.abs(h.x + h.w / 2 - t.cx) < 40 && inLane(h, t)) { t.state = 'lit'; t.timer = 0.75; break; }
      } else if (t.state === 'lit') {
        t.timer -= dt;
        if (Math.random() < dt * 30) S.particles.push({ x: t.cx + 6, y: t.floorY - 48, vx: (Math.random() - 0.5) * 40, vy: -60, life: 0.3, max: 0.3, type: 'spark', color: '#ffd34d', size: 2 });
        if (t.timer <= 0) { explode(t.cx, t.floorY - 18, 72, 150, t); t.state = 'respawn'; t.timer = 4; }
      }
      break;
    }
    case 'cannon': {
      if (t.recoil > 0) t.recoil -= dt * 4;
      if (!on) break;
      let target = null, td = 1e9;
      for (const h of live) {
        if (!inLane(h, t)) continue;
        const dx = h.x + h.w / 2 - t.cx;
        if (Math.abs(dx) < 9 * T && Math.abs(dx) > 30 && Math.sign(dx) === -h.dir && Math.abs(dx) < td) { td = Math.abs(dx); target = h; }
      }
      if (target) t.face = Math.sign(target.x - t.cx) || t.face;
      t.timer -= dt;
      if (t.timer <= 0 && target) {
        t.timer = 2.2;
        t.recoil = 1;
        S.balls.push({ id: nextId++, kind: 'ball', x: t.cx + t.face * 22, y: t.floorY - 18, vx: t.face * 330, floorY: t.floorY, life: 3 });
        S.particles.push({ x: t.cx + t.face * 26, y: t.floorY - 18, vx: t.face * 60, vy: -10, life: 0.35, max: 0.35, type: 'poof', color: '#fff', size: 10 });
        sfx.crash();
        S.shake = Math.max(S.shake, 2);
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
          if (trig) { t.state = 'trigger'; t.timer = t.kind === 'cage' ? 0.1 : 0.15; break; }
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
            sfx.clang();
            defeat(h, t, 'caged');
            break;
          }
          damage(h, 150, t, 'bonked'); h.hitCd.set(t.id, S.time + 1);
        }
        if (t.state === 'falling' && t.y + size >= t.floorY) {
          t.y = t.floorY - size;
          if (t.kind === 'rock') { shatter(t); S.shake = Math.max(S.shake, 4); }
          else { t.state = 'landed'; t.timer = 1.0; sfx.clang(); }
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
          if (Math.abs(dx) < 7 * T && Math.sign(dx) === -h.dir) { t.state = 'rolling'; t.vx = Math.sign(dx) * 240; break; }
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
    b.x += b.vx * dt;
    b.life -= dt;
    if (solidPx(b.x + Math.sign(b.vx) * 10, b.y) || b.life <= 0) { b.dead = true; poof(b.x, b.y, 4); continue; }
    for (const h of S.heroes) {
      if (!h.alive || !circleHit(h, b.x, b.y, 10)) continue;
      if (absorb(h, b)) { b.dead = true; break; }
      h.vx = Math.sign(b.vx) * 160; h.vy = -260; h.stunT = 0.3; h.grounded = false;
      damage(h, 110, b, 'blasted');
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
    if (S.hp <= 0) { S.screen = 'lose'; mood('sad', 99); sfx.lose(); brain.save(); }
    else if (!S.spawnQueue.length && !S.heroes.length) endWave();
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
  for (const c of S.coinsFly) if ((c.t += dt * 1.6) >= 1 && !c.done) { c.done = true; if (Math.random() < 0.5) sfx.coin(); }
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
  const layer = (col, amp, base, freq, par, line) => {
    const off = S.cam.x * par;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, BAR);
    for (let x = 0; x <= W; x += 16) {
      const wx = x + off;
      g.lineTo(x, TOP + base - amp * (0.6 * Math.sin(wx * freq) + 0.4 * Math.sin(wx * freq * 2.3 + 1)));
    }
    g.lineTo(W, BAR);
    g.closePath();
    g.fill();
    if (line) { g.strokeStyle = line; g.lineWidth = 3; g.stroke(); }
  };
  layer(th.far, 70, 330, 0.004, 0.15);
  if (th.clouds) for (const c of S.clouds) cloud(((c.x - S.cam.x * 0.25 + S.time * 8 * c.s) % 2600 + 2600) % 2600 - 200, TOP + c.y, c.s);
  layer(th.near, 50, 420, 0.007, 0.35, th.hillLine);
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

function drawCastle() {
  const th = S.theme;
  const x = S.goal.c * T + T / 2, y = S.goal.r * T + T;
  if (!th.sprites) {
    const w = 100, h = 150;
    g.save();
    g.lineWidth = 4; g.strokeStyle = INK; g.fillStyle = th.castle;
    for (const dx of [-w / 2 - 6, w / 2 + 6]) {
      roundRect(x + dx - 18, y - h + 20, 36, h - 20, 4); g.fill(); g.stroke();
      g.fillStyle = th.roof;
      g.beginPath(); g.moveTo(x + dx - 24, y - h + 22); g.lineTo(x + dx, y - h - 30); g.lineTo(x + dx + 24, y - h + 22); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = th.castle;
    }
    roundRect(x - w / 2, y - h * 0.72, w, h * 0.72, 4); g.fill(); g.stroke();
    for (let i = 0; i < 5; i++) { g.fillRect(x - w / 2 + i * 22, y - h * 0.72 - 12, 14, 14); g.strokeRect(x - w / 2 + i * 22, y - h * 0.72 - 12, 14, 14); }
    g.strokeStyle = th.castleDark; g.lineWidth = 2;
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x - w / 2 + 4, y - i * 20); g.lineTo(x + w / 2 - 4, y - i * 20); g.stroke(); }
    g.fillStyle = '#3a2a3f'; g.strokeStyle = INK; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x - 22, y); g.lineTo(x - 22, y - 40); g.arc(x, y - 40, 22, Math.PI, 0); g.lineTo(x + 22, y); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x, y - h * 0.72 - 12); g.lineTo(x, y - h - 30); g.stroke();
    g.fillStyle = '#ff7a1a';
    g.beginPath(); g.moveTo(x, y - h - 30); g.lineTo(x + 30 + Math.sin(S.time * 5) * 4, y - h - 20); g.lineTo(x, y - h - 10); g.closePath(); g.fill(); g.stroke();
    g.restore();
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
      break; // placed blocks are part of the grid
    case 'spikes': sprW('trap_spikes', t.cx, t.floorY + 2, T - 2); break;
    case 'slime': sprW('trap_slime', t.cx, t.floorY + 4, T + 2); break;
    case 'spring': sprW('trap_spring', t.cx, t.floorY + 1, T * 0.78, { sy: 1 - Math.max(0, t.squish || 0) * 0.4 }); break;
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
    case 'cannon': {
      const f = t.face || -1, rec = Math.max(0, t.recoil || 0) * 5;
      g.save(); g.translate(t.cx - f * rec, t.floorY);
      g.strokeStyle = INK; g.lineWidth = 3;
      g.save(); g.scale(f, 1);
      g.fillStyle = '#3a3f4f'; roundRect(-6, -30, 30, 18, 8); g.fill(); g.stroke();
      g.fillStyle = '#1b1f2b'; g.beginPath(); g.ellipse(24, -21, 3, 7, 0, 0, 7); g.fill();
      g.restore();
      g.fillStyle = '#8b5a2b'; roundRect(-14, -14, 28, 14, 4); g.fill(); g.stroke();
      g.fillStyle = '#5a3a1b'; g.beginPath(); g.arc(-7, -4, 7, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(7, -4, 7, 0, 7); g.fill(); g.stroke();
      g.restore();
      break;
    }
  }
  if (t.disabledT > 0 && !ghost) {
    const y = TRAPS[t.kind].mount === 'ceiling' ? t.ceilY + 20 : t.floorY - 18;
    g.globalAlpha = 0.8; g.fillStyle = '#7fd8ff';
    for (let i = 0; i < 3; i++) { const a = S.time * 3 + i * 2.1; g.beginPath(); g.arc(t.cx + Math.cos(a) * 16, y + Math.sin(a) * 10, 2.5, 0, 7); g.fill(); }
  }
  g.restore();
}

function drawBalls() {
  for (const b of S.balls) {
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(b.x - Math.sign(b.vx) * 14, b.y, 5, 0, 7); g.fill();
    g.fillStyle = '#222634'; g.strokeStyle = INK; g.lineWidth = 2;
    g.beginPath(); g.arc(b.x, b.y, 9, 0, 7); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.arc(b.x - 3, b.y - 3, 3, 0, 7); g.fill();
  }
}

function heroSprite(h) {
  const p = h.cls;
  if (!h.alive) return p + '_dizzy';
  if (h.castT > 0 && p === 'wizard') return 'wizard_cast';
  if (h.swingT > 0) return p === 'barb' ? 'barb_swing' : p === 'knight' ? 'knight_block' : p + '_walk1';
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
  if (!h.alive && !h.caged) g.globalAlpha = Math.max(0, 1 - h.deadT / 1.2);
  if (h.alive && h.grounded) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, h.y + h.h + 1, 11, 3, 0, 0, 7); g.fill(); }
  spr(heroSprite(h), x, y + bob, h.C.draw, { flip: h.dir < 0, rot: h.alive ? tilt : Math.sin(h.spin) * 0.6 });
  if (h.flashT > 0 && h.alive) {
    g.globalAlpha = 0.5; g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(x, h.y + h.h / 2, h.w * 0.7, h.h * 0.65, 0, 0, 7); g.fill();
    g.globalAlpha = 1;
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
  const c0 = Math.max(0, Math.floor(S.cam.x / T)), c1 = Math.min(S.cols - 1, Math.ceil((S.cam.x + W / S.cam.z) / T));
  g.fillStyle = 'rgba(255,255,255,.18)';
  for (let rr = 0; rr < S.rows; rr++) for (let cc = c0; cc <= c1; cc++) if (canPlace(S.selected, cc, rr)) g.fillRect(cc * T + 4, rr * T + 4, T - 8, T - 8);
  const ok = canPlace(S.selected, c, r) && S.coins >= TRAPS[S.selected].price;
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
  for (const t of S.traps) if (TRAPS[t.kind].mount === 'floor') drawTrap(t);
  for (const h of S.heroes) if (!h.caged) drawHero(h);
  drawBalls();
  for (const t of S.traps) if (TRAPS[t.kind].mount === 'ceiling') drawTrap(t);
  drawParticles();
  if (S.showHeat) drawHeat();
  drawGhost();
  g.restore();
  for (const cf of S.coinsFly) {
    const e = cf.t * cf.t * (3 - 2 * cf.t);
    const sx = (cf.x - c.x) * c.z, sy = TOP + (cf.y - c.y) * c.z;
    spr('coin', sx + (398 - sx) * e, sy + (36 - sy) * e - Math.sin(e * Math.PI) * 60, 18, { center: true });
  }
}

/* ═════════════════════════ minimap ═════════════════════════ */
const MM = { w: 210, x: 0, y: 0, h: 0, k: 1 };
function buildMinimap() {
  MM.k = MM.w / worldW();
  MM.h = Math.round(worldH() * MM.k);
  MM.x = 12;
  MM.y = TOP + 12;
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
  for (const t of S.traps) if (t.kind !== 'block') g.fillRect(MM.x + t.cx * MM.k - 1.5, MM.y + (t.floorY - 10) * MM.k - 1.5, 3, 3);
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
  g.strokeStyle = o.active ? '#fff3e0' : 'rgba(255,255,255,.15)'; g.lineWidth = 2; g.stroke();
  g.restore();
  if (o.icon) spr(o.icon, x + (label ? 26 : w / 2), y + h / 2 + lift + (o.iconH || 24) / 2, o.iconH || 24);
  if (label) text(label, x + (o.icon ? w / 2 + 14 : w / 2), y + h / 2 + lift, o.size || 18, o.disabled ? '#9a95b5' : o.active ? '#2a1400' : '#fff');
}

function panel(x, y, w, h, title) {
  g.save();
  g.fillStyle = 'rgba(13,10,24,.92)'; roundRect(x, y, w, h, 14); g.fill();
  g.strokeStyle = 'rgba(255,173,92,.45)'; g.lineWidth = 2; g.stroke();
  g.restore();
  if (title) text(title, x + 16, y + 22, 16, '#ffad5c', 'left');
}

function iconTrap(k, x, y, s = 0.85) {
  const fake = { kind: k, c: 0, r: 0, x: x - T / 2, cx: x, floorY: y, ceilY: y - 40, state: 'armed', disabledT: 0, broken: false, rot: 0, face: 1, len: 30, sx: x, minX: x - 12, maxX: x + 12 };
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(-x, -y);
  if (k === 'block') { g.fillStyle = S.theme.brick || '#c96a3a'; g.strokeStyle = INK; g.lineWidth = 3; roundRect(x - 16, y - 32, 32, 32, 4); g.fill(); g.stroke(); }
  else if (IMG['trap_' + k]) sprW('trap_' + k, x, y, 40);
  else drawTrap(fake, false);
  g.restore();
}

function drawHUD() {
  g.fillStyle = '#0d0a18'; g.fillRect(0, 0, W, TOP);
  g.fillStyle = 'rgba(255,122,26,.3)'; g.fillRect(0, TOP - 2, W, 2);
  button('menu', 12, 14, 48, 44, '☰', { size: 20 });
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
  text(`Hero Brain IQ ${brain.iq()}`, 500, 48, 14, '#9fe3ff', 'left', 600);
  button('brain', 664, 14, 100, 44, 'Brain', { icon: 'gem', iconH: 22, active: S.showBrain, size: 15 });
  button('heat', 770, 14, 92, 44, 'Heat', { active: S.showHeat, size: 15 });
  button('mute', 868, 14, 48, 44, sound.muted ? '🔇' : '🔊', { size: 16 });
  text('Castle', 1103, 17, 13, '#c9c3e6', 'center', 600);
  g.fillStyle = '#05040a'; roundRect(940, 28, 326, 30, 8); g.fill();
  const grd = g.createLinearGradient(944, 0, 1262, 0);
  grd.addColorStop(0, '#ff4d4d'); grd.addColorStop(1, '#ff7ab8');
  g.fillStyle = grd; roundRect(944, 32, Math.max(4, 318 * (S.hp / S.maxHp)), 22, 6); g.fill();
  text(`${S.hp}/${S.maxHp}`, 1103, 43, 16, '#fff');
}

function drawBar() {
  g.fillStyle = '#0d0a18'; g.fillRect(0, BAR, W, H - BAR);
  g.fillStyle = 'rgba(255,122,26,.3)'; g.fillRect(0, BAR, W, 2);
  if (S.screen === 'build') {
    S.offers.forEach((k, i) => {
      const info = TRAPS[k];
      const x = 12 + i * 158;
      const afford = S.coins >= info.price;
      const sel = S.selected === k;
      button('offer:' + k, x, BAR + 12, 150, 64, '', { active: sel, disabled: !afford });
      iconTrap(k, x + 30, BAR + 64);
      text(info.name, x + 56, BAR + 32, 14, sel ? '#2a1400' : afford ? '#fff' : '#9a95b5', 'left');
      spr('coin', x + 64, BAR + 64, 15);
      text(String(info.price), x + 75, BAR + 55, 14, sel ? '#2a1400' : '#ffe07a', 'left');
      const fav = k !== 'block' && brain.favourite(k);
      if (fav) { g.fillStyle = sel ? 'rgba(90,44,0,.25)' : 'rgba(159,227,255,.15)'; roundRect(x + 100, BAR + 46, 44, 18, 9); g.fill(); text(fav, x + 122, BAR + 55, 10, sel ? '#5a2c00' : '#9fe3ff', 'center', 600); }
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
  const x = 12, y = TOP + 12, w = 330, h = 66 + BRAIN_KINDS.length * 32 + 52;
  panel(x, y, w, h, 'Hero Guild Brain');
  text('How well heroes handle each trap', x + 16, y + 44, 12, '#c9c3e6', 'left', 500);
  BRAIN_KINDS.forEach((k, i) => {
    const yy = y + 64 + i * 32;
    iconTrap(k, x + 30, yy + 20, 0.6);
    const m = brain.mastery[k];
    text(TRAPS[k].name, x + 54, yy, 13, '#fff', 'left');
    const pct = m ? m.ema : 0;
    g.fillStyle = '#2c2645'; roundRect(x + 54, yy + 9, 150, 8, 4); g.fill();
    g.fillStyle = pct > 0.7 ? '#ff6b6b' : pct > 0.35 ? '#ffc04d' : '#6ee7b7';
    roundRect(x + 54, yy + 9, Math.max(4, 150 * pct), 8, 4); g.fill();
    text(m ? `${Math.round(pct * 100)}% · ${brain.favourite(k) || 'learning'}` : 'never seen', x + w - 14, yy + 6, 11, '#c9c3e6', 'right', 500);
  });
  button('resetbrain', x + 16, y + h - 46, w - 32, 34, 'Wipe hero memory', { size: 13, color: '#3a2440' });
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
  g.fillStyle = 'rgba(8,6,16,.72)'; g.fillRect(0, 0, W, H);
  text(title, W / 2, 230, 56, color);
  if (sub) text(sub, W / 2, 296, 20, '#e8e3ff', 'center', 500);
  btns.forEach((b, i) => button(b.id, W / 2 - 150, 350 + i * 72, 300, 58, b.label, { color: b.color, size: 22 }));
}

function drawSummary() {
  const st = S.waveStats;
  g.fillStyle = 'rgba(30,40,110,.85)'; g.fillRect(0, TOP, W, VIEW_H);
  const e = Math.min(1, S.summaryT * 3);
  g.save(); g.translate(W / 2, TOP + 100); g.scale(0.6 + e * 0.4, 0.6 + e * 0.4);
  text('WAVE COMPLETE', 0, 0, 72, '#fff');
  g.restore();
  text(`${Math.round(st.rate * 100 * Math.min(1, S.summaryT * 1.5))}%`, 330, TOP + 260, 110, '#ffd34d');
  text('KILL RATE', 330, TOP + 340, 22, '#fff');
  if (st.better != null) text(`${st.better >= 0 ? '+' : ''}${Math.round(st.better * 100)}% vs last wave`, 330, TOP + 374, 18, st.better >= 0 ? '#9dff9d' : '#ff9d9d', 'center', 600);
  text(`${st.killed} Killed`, W / 2, TOP + 235, 32, '#fff');
  g.fillStyle = '#fff'; g.fillRect(W / 2 - 110, TOP + 260, 220, 3);
  text(`${st.total} Total`, W / 2, TOP + 288, 32, '#fff');
  text(String(st.damage), 950, TOP + 260, 110, st.damage ? '#ff6b6b' : '#9dff9d');
  text('DAMAGE TAKEN', 950, TOP + 340, 22, '#fff');
  text(st.perfect ? 'PERFECT WAVE! +8' : 'Lost perfect wave', 950, TOP + 374, 18, st.perfect ? '#9dff9d' : '#ff9d9d', 'center', 600);
  text(`Payout +${st.payout} coins`, W / 2, TOP + 372, 22, '#ffe07a');
  if (S.summaryT > 0.8) button('continue', W / 2 - 140, TOP + 430, 280, 60, 'Continue ▶', { color: '#e8641a', size: 22 });
}

function drawTitle() {
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#6cc4ff'); grd.addColorStop(1, '#cfeeff');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) cloud(((i * 260 + S.time * 15) % (W + 300)) - 150, 60 + (i % 3) * 46, 0.8 + (i % 2) * 0.3);
  g.fillStyle = '#a7dcae';
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 16) g.lineTo(x, 600 - 60 * Math.sin(x * 0.005 + 1));
  g.lineTo(W, H); g.fill();
  g.fillStyle = '#c98a4b'; g.fillRect(0, H - 60, W, 60);
  g.fillStyle = '#63c93f'; g.fillRect(0, H - 72, W, 16);
  g.fillStyle = INK; g.fillRect(0, H - 74, W, 3);
  const m = ['monster_idle1', 'monster_laugh', 'monster_celebrate', 'monster_lever'][Math.floor(S.time / 1.4) % 4];
  spr(m, W / 2, 190 + Math.sin(S.time * 2.5) * 8, 140);
  ['hero', 'thief', 'knight', 'barb', 'wizard'].forEach((p, i) => {
    const x = ((S.time * 70 + i * 260) % (W + 200)) - 100;
    spr(`${p}_walk${1 + (Math.floor(S.time * 10 + i) % 6)}`, x, H - 72 - Math.abs(Math.sin(S.time * 12 + i)) * 3, 52);
  });
  text('TINY DUNGEON KEEPER', W / 2, 240, 62, '#ff8a2a');
  text('Build the traps. The heroes learn. Outsmart them.', W / 2, 286, 20, INK, 'center', 600);
  const bw = 280, gap = 16, perRow = 4;
  LEVELS.forEach((L, i) => {
    const open = i < progress.unlocked;
    const col = i % perRow, row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, LEVELS.length - row * perRow);
    const bx = (W - (inRow * bw + (inRow - 1) * gap)) / 2 + col * (bw + gap), y = 320 + row * 96;
    button('level:' + i, bx, y, bw, 80, '', { disabled: !open, color: open ? '#e8641a' : undefined });
    text(open ? `${i + 1}. ${L.name}` : '🔒 Locked', bx + bw / 2, y + 28, 19, open ? '#fff' : '#9a95b5');
    if (open) { const st = progress.stars[i] || 0; text('★★★'.slice(0, st) + '☆☆☆'.slice(0, 3 - st), bx + bw / 2, y + 56, 20, '#ffe07a'); }
  });
  text(`Hero Brain IQ: ${brain.iq()} · heroes remember your traps between games`, W / 2, H - 28, 15, '#fff', 'center', 600);
  button('mute', W - 70, 14, 56, 44, sound.muted ? '🔇' : '🔊', { size: 18 });
}

function drawTutorial() {
  if (!S.tutorial || S.screen !== 'build' || S.levelIndex !== 0 || S.wave !== 0) return;
  const x = 340, y = TOP + 110, w = 600, h = 180;
  panel(x, y, w, h);
  text('How to play', x + w / 2, y + 26, 22, '#ffad5c');
  text('1. Pick a trap below (or press 1–5), then click a glowing cell.', x + 24, y + 62, 15, '#fff', 'left', 500);
  text('2. Use Blocks to reshape the path. A Spring before a pit is deadly!', x + 24, y + 88, 15, '#fff', 'left', 500);
  text('3. Press START WAVE and watch the crowd come. Drag to look around.', x + 24, y + 114, 15, '#fff', 'left', 500);
  text('4. Heroes LEARN from every trap — keep changing your plan!', x + 24, y + 140, 15, '#fff', 'left', 500);
}

function render() {
  buttons = [];
  g.clearRect(0, 0, W, H);
  if (S.screen === 'title') { drawTitle(); return; }
  renderWorld();
  drawMinimap();
  drawHUD();
  drawBar();
  if (S.screen === 'build') { drawNextUp(); drawTutorial(); }
  if (S.showBrain) drawBrainPanel();
  if (S.screen === 'summary') drawSummary();
  drawToasts();
  if (S.paused) drawOverlay('Paused', null, [{ id: 'resume', label: 'Resume', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }]);
  if (S.screen === 'win') {
    const last = S.levelIndex >= LEVELS.length - 1;
    drawOverlay(`${'★'.repeat(S.winStars)}${'☆'.repeat(3 - S.winStars)}  Level complete!`, `${S.kills} heroes defeated · Castle ${S.hp}/100 · Hero Brain IQ ${brain.iq()}`,
      last ? [{ id: 'retry', label: 'Play again', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }]
           : [{ id: 'next', label: 'Next level ▶', color: '#e8641a' }, { id: 'retry', label: 'Replay' }, { id: 'quit', label: 'Main menu' }], '#ffe07a');
  }
  if (S.screen === 'lose') drawOverlay('The castle fell!', `The heroes got smarter. Try new trap combos! (wave ${S.wave})`, [{ id: 'retry', label: 'Try again', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }], '#ff9d9d');
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
  if (S.screen === 'title') return;
  const p = toLocal(e);
  zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y);
}, { passive: false });

canvas.addEventListener('pointerdown', (e) => {
  unlockAudio();
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
      sfx.sell();
    }
    return;
  }
  if (S.selected && canPlace(S.selected, c, r)) {
    const price = TRAPS[S.selected].price;
    if (S.coins < price) { toast('Not enough coins', 1); return; }
    if (S.traps.length >= maxTraps()) { toast(`Trap limit reached (${maxTraps()}). Sell one or start the wave.`, 1.6); return; }
    S.coins -= price;
    S.traps.push(makeTrap(S.selected, c, r));
    if (S.selected === 'block') placeBlock(c, r);
    poof(c * T + T / 2, r * T + T / 2, 6);
    sfx.place();
    if (S.coins < price) S.selected = null;
  }
});

function onButton(id) {
  sfx.click();
  if (id.startsWith('level:')) { loadLevel(+id.slice(6)); return; }
  if (id.startsWith('offer:')) { const k = id.slice(6); S.selected = S.selected === k ? null : k; S.sellMode = false; return; }
  switch (id) {
    case 'start': startWave(); break;
    case 'reroll': if (S.coins >= 3) { S.coins -= 3; rollOffers(); } break;
    case 'sell': S.sellMode = !S.sellMode; S.selected = null; break;
    case 'brain': S.showBrain = !S.showBrain; break;
    case 'heat': S.showHeat = !S.showHeat; break;
    case 'speed': S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 4 : 1; break;
    case 'follow': S.cam.follow = !S.cam.follow; break;
    case 'mute': sound.muted = !sound.muted; break;
    case 'menu': if (S.screen !== 'title') S.paused = !S.paused; break;
    case 'resume': S.paused = false; break;
    case 'continue': toBuild(); break;
    case 'quit': S.paused = false; brain.save(); S.screen = 'title'; break;
    case 'retry': loadLevel(S.levelIndex); break;
    case 'next': loadLevel(Math.min(LEVELS.length - 1, S.levelIndex + 1)); break;
    case 'resetbrain':
      if (confirm('Wipe the heroes\' memory? They will forget everything they learned.')) { brain.reset(); toast('Hero memory wiped', 1.5); }
      break;
  }
}

const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };
window.addEventListener('keydown', (e) => {
  if (KEYMAP[e.key] && S.screen !== 'title') { keys[KEYMAP[e.key]] = true; e.preventDefault(); }
  if (S.screen === 'build') {
    if (e.key >= '1' && e.key <= '5' && S.offers[+e.key - 1]) onButton('offer:' + S.offers[+e.key - 1]);
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startWave(); }
    if (e.key === 'q' || e.key === 'Q') onButton('sell');
    if (e.key === 'r' || e.key === 'R') onButton('reroll');
  } else if (S.screen === 'summary' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); toBuild(); }
  if (S.screen === 'title') return;
  if (e.key === 'z' || e.key === 'Z') zoomAt(1.15);
  if (e.key === 'x' || e.key === 'X') zoomAt(1 / 1.15);
  if (e.key === 'h' || e.key === 'H') S.showHeat = !S.showHeat;
  if (e.key === 'f' || e.key === 'F') S.cam.follow = !S.cam.follow;
  if (e.key === 'Escape') { S.selected = null; S.sellMode = false; S.paused = !S.paused; }
  if (e.key === 'b' || e.key === 'B') S.showBrain = !S.showBrain;
  if (e.key === 'm' || e.key === 'M') sound.muted = !sound.muted;
});
window.addEventListener('keyup', (e) => { if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) { brain.save(); if (S.screen === 'wave') S.paused = true; } });

/* ═════════════════════════ loop ═════════════════════════ */
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (S.screen === 'title') S.time += dt;
  else if (!S.paused) {
    acc += dt * (S.screen === 'wave' ? S.speed : 1);
    let n = 0;
    while (acc >= STEP && n++ < 60) { update(STEP); acc -= STEP; }
    if (n >= 60) acc = 0;
    updateCamera(dt);
  }
  render();
  requestAnimationFrame(frame);
}

window.__tdk = { S, brain, loadLevel, startWave, makeTrap, canPlace, update, TRAPS, maxTraps, placeBlock, toBuild, LEVELS };

(async function boot() {
  resize();
  await loadAssets();
  document.getElementById('loading')?.remove();
  setInterval(() => brain.save(), 5000);
  requestAnimationFrame(frame);
})();
