import { Brain, ACTIONS } from './brain.js';
import { LEVELS, THEMES, WORLDS } from './levels.js';
import { t as tx, detectLang, setLang, getLang, LANGS } from './i18n.js';
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
//        pit = sits in a pit's water/lava · floorpit = floor or pit
const TRAPS = {
  block:        { name: 'Block',          price: 3,  mount: 'floor',    tip: 'A brick wall. Reshape the path — heroes can only hop 2 tiles high.' },
  spring:       { name: 'Spring',         price: 4,  mount: 'floor',    tip: 'Bounces heroes backwards. Put it before a pit!' },
  spikes:       { name: 'Spikes',         price: 6,  mount: 'floor',    tip: 'Pointy floor: 60 damage. Two in a row finish a hero.' },
  slime:        { name: 'Slime Pit',      price: 6,  mount: 'floor',    tip: 'Sticky goo. Heroes that stay in it sink.' },
  fire:         { name: 'Fire Vent',      price: 10, mount: 'floor',    tip: 'Blasts a tall flame on a timer.' },
  spikeball:    { name: 'Spike Ball',     price: 8,  mount: 'air',      tip: 'Floats anywhere in mid-air. Great for catching jumpers!' },
  rock:         { name: 'Falling Rock',   price: 8,  mount: 'ceiling',  tip: 'Drops when a hero walks close. Hang it under any ceiling or floating platform.' },
  croc:         { name: 'Croc',           price: 14, mount: 'floorpit', tip: 'Put it IN a pit (or on the floor as a pond). Snaps at heroes jumping over!' },
  spear:        { name: 'Spear Trap',     price: 11,  mount: 'floor',    tip: 'Spears shoot up a moment after a hero steps close.' },
  saw:          { name: 'Saw Blade',      price: 12, mount: 'floor',    tip: 'Rolls back and forth, cutting again and again.' },
  axe:          { name: 'Swing Axe',      price: 12, mount: 'ceiling',  tip: 'A pendulum — timing is everything.' },
  lavaball:     { name: 'Lava Bubble',    price: 11, mount: 'pit',      tip: 'Lives in a pit and leaps high out of it on a timer.' },
  firecannon:   { name: 'Fire Cannon',    price: 14, mount: 'any',      tip: 'Shoots fireballs that set heroes on fire. Place it on the floor or in mid-air.' },
  bomb:         { name: 'Bomb Barrel',    price: 12, mount: 'floor',    tip: 'Lights up when heroes come close, then BOOM.' },
  crusher:      { name: 'Crusher',        price: 15, mount: 'ceiling',  tip: 'A spiked stone block that slams down on heroes below.' },
  geyser:       { name: 'Acid Geyser',    price: 12, mount: 'pit',      tip: 'Sits in a pit and erupts a tall column of acid.' },
  wheel:        { name: 'Stone Wheel',    price: 14, mount: 'floor',    tip: 'Rolls at incoming heroes. They must jump it.' },
  icecannon:    { name: 'Ice Cannon',     price: 13, mount: 'any',      tip: 'Freezes heroes in place. Frozen heroes take 50% more damage.' },
  launchpad:    { name: 'Launch Pad',     price: 9,  mount: 'floor',    tip: 'Rockets heroes straight up — into Spike Balls or the ceiling!' },
  pendulum:     { name: 'Spiked Mace',    price: 15, mount: 'ceiling',  tip: 'A heavy spiked ball on a long chain. Hits hard and knocks back.' },
  cannon:       { name: 'Cannon',         price: 15, mount: 'floor',    tip: 'Fires heavy cannonballs at the nearest heroes.' },
  crossbow:     { name: 'Crossbow',       price: 13, mount: 'any',      tip: 'Rapid-fire arrows in a straight line. Floor or mid-air.' },
  loglauncher:  { name: 'Log Launcher',   price: 14, mount: 'floor',    tip: 'Launches rolling logs down the path.' },
  flamethrower: { name: 'Flamethrower',   price: 16, mount: 'any',      tip: 'Sprays a long jet of flame toward the hero door on a timer.' },
  roller:       { name: 'Spike Roller',   price: 13, mount: 'floor',    tip: 'A spiked log that patrols the whole platform.' },
  cage:         { name: 'Drop Cage',      price: 14, mount: 'ceiling',  tip: 'Snaps shut on heroes right below.' },
};
const UNLOCK = Object.keys(TRAPS);
const BRAIN_KINDS = UNLOCK.filter((k) => k !== 'block');
const PREMIUM = ['croc', 'firecannon', 'icecannon', 'loglauncher', 'cage', 'axe', 'crusher', 'pendulum', 'flamethrower', 'lavaball'];
const BACK_LAYER = (k) => TRAPS[k].mount === 'floor' || k === 'geyser';
const PIT_TRAPS = ['croc', 'lavaball', 'geyser'];
const SHOOTERS = ['cannon', 'firecannon', 'icecannon', 'loglauncher', 'crossbow'];
const ICON = {
  crusher: 'x_crusher', pendulum: 'x_pend_ball', spear: 'x_spear', flamethrower: 'x_flamethrower', crossbow: 'x_crossbow',
  launchpad: 'x_pad_red', geyser: 'x_acid_spout', lavaball: 'x_lavaball', roller: 'x_spikelog',
};

// frames: 6 = classic sheet (walk1-6 + special), 5 = second sheet (walk1-5, act1-2, dizzy)
const CLASSES = {
  hero:       { name: 'The Hero',     speed: 100, hp: 100, reward: 1, dmg: 1, w: 22, h: 34, draw: 48, frames: 6, tip: 'Brave but plain.' },
  thief:      { name: 'The Runner',   speed: 140, hp: 70,  reward: 1, dmg: 2, w: 20, h: 32, draw: 46, frames: 6, tip: 'Fast on its feet.' },
  knight:     { name: 'The Knight',   speed: 78,  hp: 220, reward: 2, dmg: 3, w: 24, h: 36, draw: 52, frames: 6, tip: 'Its shield blocks one heavy hit.' },
  barb:       { name: 'The Brute',    speed: 82,  hp: 260, reward: 3, dmg: 4, w: 26, h: 36, draw: 52, frames: 6, tip: 'Smashes Rocks and Cages.' },
  wizard:     { name: 'The Wizard',   speed: 90,  hp: 90,  reward: 2, dmg: 2, w: 22, h: 34, draw: 50, frames: 6, tip: 'Switches a trap off for a moment.' },
  archer:     { name: 'The Archer',   speed: 100, hp: 90,  reward: 2, dmg: 2, w: 22, h: 34, draw: 50, frames: 5, tip: 'Shoots Rocks, Cages, Crushers and Bombs to set them off early.' },
  assassin:   { name: 'The Assassin', speed: 150, hp: 70,  reward: 2, dmg: 2, w: 20, h: 32, draw: 48, frames: 5, tip: 'Shadow-steps past the first hit it would take.' },
  witch:      { name: 'The Witch',    speed: 96,  hp: 85,  reward: 2, dmg: 2, w: 22, h: 34, draw: 50, frames: 5, tip: 'Flies over floor traps on her broom.' },
  paladin:    { name: 'The Paladin',  speed: 84,  hp: 180, reward: 3, dmg: 3, w: 24, h: 36, draw: 52, frames: 5, tip: 'Shield + heals nearby heroes.' },
  firemage:   { name: 'Fire Mage',    speed: 92,  hp: 95,  reward: 2, dmg: 2, w: 22, h: 34, draw: 50, frames: 5, tip: 'Immune to fire, flames and burning.' },
  icemage:    { name: 'Ice Mage',     speed: 92,  hp: 95,  reward: 2, dmg: 2, w: 22, h: 34, draw: 50, frames: 5, tip: 'Immune to ice. Freezes traps and ice-bridges pits.' },
  druid:      { name: 'The Druid',    speed: 90,  hp: 110, reward: 2, dmg: 2, w: 22, h: 34, draw: 52, frames: 5, tip: 'Grows vine bridges over pits and heals.' },
  viking:     { name: 'The Viking',   speed: 92,  hp: 220, reward: 3, dmg: 3, w: 26, h: 36, draw: 52, frames: 5, tip: 'Smashes your Blocks. Rages when hurt.' },
  orc:        { name: 'The Orc',      speed: 80,  hp: 300, reward: 3, dmg: 4, w: 26, h: 36, draw: 54, frames: 5, tip: 'Breaks Rocks, Cages, Crushers and floor cannons.' },
  darkknight: { name: 'Dark Knight',  speed: 70,  hp: 340, reward: 4, dmg: 5, w: 26, h: 38, draw: 56, frames: 5, tip: 'Cannot be knocked back, bounced or caged.' },
};
const CLASS_ORDER = Object.keys(CLASSES);
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
  if (!ok) toast(tx('No ad available right now — try again later'), 1.8);
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
  const total = names.length + 63;
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
/** Draw part of a sprite (fractions of its size), bottom-centre at (x, y), `w` wide. */
function sprPart(name, fx0, fy0, fx1, fy1, x, y, w, o = {}) {
  const im = IMG[name];
  if (!im || !im.width) return;
  const sw = im.width * (fx1 - fx0), sh = im.height * (fy1 - fy0), h = (w / sw) * sh;
  g.save();
  g.translate(x, y);
  if (o.flip) g.scale(-1, 1);
  if (o.rot) g.rotate(o.rot);
  g.drawImage(im, im.width * fx0, im.height * fy0, sw, sh, -w / 2, o.center ? -h / 2 : -h, w, h);
  g.restore();
}

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
// progress v4 stores stars by level name, so adding levels never mixes them up
let progress = { unlocked: 1, stars: {}, seen: {} };
try {
  const v4 = JSON.parse(localStorage.getItem('tdk_progress4') || 'null');
  if (v4) progress = { ...progress, ...v4 };
  else {
    const v3 = JSON.parse(localStorage.getItem('tdk_progress3') || 'null');
    if (v3) {
      const old = ['The Old Cellar', 'Bumpy Halls', 'The Long Vault', 'Green Meadow', 'Rolling Hills', 'Sunset Bridges', 'Starry Tunnels'];
      for (const [i, st] of Object.entries(v3.stars || {})) if (old[i]) progress.stars[old[i]] = st;
      progress.unlocked = (v3.unlocked || 1) <= 3 ? v3.unlocked || 1 : v3.unlocked + 2;
    }
  }
} catch (e) {}
const saveProgress = () => { try { localStorage.setItem('tdk_progress4', JSON.stringify(progress)); } catch (e) {} };
const starsOf = (i) => progress.stars[LEVELS[i].name] || 0;

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
  killBy: {}, crates: [], walls: {}, wallMemory: new Set(), pits: [], pitAt: [], bridges: [], smashed: [], bats: [], flakes: [], replayed: 0,
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
      if ('fktpg'.includes(ch)) S.decor.push({ c, r, ch });
      return ch === '#' ? 1 : ch === 'B' ? 2 : ch === 'S' ? 3 : 0;
    }));
  });
  S.traps = []; S.heroes = []; S.balls = []; S.particles = []; S.coinsFly = []; S.floaters = [];
  S.bridges = []; S.smashed = []; S.crates = []; S.walls = {}; S.wallMemory = new Set();
  findPits();
  S.coins = 45 + Math.min(i, 8) * 10 + (L.hard?.coins || 0);
  S.hp = S.maxHp = 100;
  S.wave = 0; S.kills = 0; S.escaped = 0; S.lastKillRate = null; S.waveStats = null;
  S.selected = null; S.sellMode = false; S.freeTrap = null; S.bonusSlots = 0; S.slotsAdUsed = false; S.crateUsed = false;
  S.screen = 'build'; S.paused = false; S.menu = null; S.speech = null;
  S.mood = 'idle'; S.moodT = 0; S.moodPrio = 0;
  S.heat = Array.from({ length: S.rows }, () => Array(S.cols).fill(0));
  S.clouds = Array.from({ length: 9 }, (_, k) => ({ x: Math.random() * 2400, y: 20 + Math.random() * 160, s: 0.6 + Math.random() * 0.7, k }));
  S.stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * 320, p: Math.random() * 6 }));
  S.bats = Array.from({ length: 6 }, () => ({ x: Math.random() * W, y: 40 + Math.random() * 200, p: Math.random() * 6, s: 30 + Math.random() * 40 }));
  S.flakes = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * VIEW_H, s: 1 + Math.random() * 2.5, p: Math.random() * 6 }));
  const cam = S.cam;
  cam.z = Math.min(1.05, VIEW_H / worldH());
  cam.x = 0;
  cam.y = 1e9;
  cam.follow = true;
  clampCam();
  planWave();
  rollOffers(true);
  buildMinimap();
  say(tx('Build your traps!'), 2.5);
  toast(tx('Level {n}: {name}', { n: i + 1, name: tx(L.name) }), 2.5);
  introduceHeroes();
  if (S.pits.length) setTimeout(() => S.levelIndex === i && S.screen === 'build' && toast(tx('The pits are full of {fluid} — drop a Croc, Lava Bubble or Acid Geyser in them!', { fluid: tx(FLUID[S.theme.fluid].name) }), 3.6), 2600);
  if (S.theme.ice) setTimeout(() => S.levelIndex === i && toast(tx("Ice level: heroes slip and slide — they can't stop on a dime!"), 3), 6400);
}

/* ═════════════════════════ pits & fluids ═════════════════════════ */
const FLUID = {
  water:     { name: 'water',      top: '#5ab8ff', body: '#2f7fd1', deep: '#1d4f94', foam: 'rgba(255,255,255,.6)' },
  lava:      { name: 'lava',       top: '#ffcf4d', body: '#ff6a1a', deep: '#b8240f', foam: 'rgba(255,240,170,.8)', glow: 'rgba(255,120,30,' },
  toxic:     { name: 'toxic goo',  top: '#b6ff4d', body: '#5fc42a', deep: '#2f7a1a', foam: 'rgba(230,255,180,.7)', glow: 'rgba(140,255,60,' },
  icewater:  { name: 'icy water',  top: '#d4f3ff', body: '#7cc6ec', deep: '#3f86b8', foam: 'rgba(255,255,255,.85)' },
  quicksand: { name: 'quicksand',  top: '#f0cf86', body: '#c99a52', deep: '#8a6430', foam: 'rgba(255,240,200,.5)' },
};
/** Every column whose floor is missing is a pit; pits fill with the theme's fluid. */
function findPits() {
  S.pits = []; S.pitAt = Array(S.cols).fill(null);
  if (!S.theme.fluid) return;
  const isPit = (c) => !S.grid[S.rows - 1][c];
  const topOf = (c) => { let r = S.rows - 1; while (r > 0 && S.grid[r - 1][c]) r--; return r; };
  for (let c = 1; c < S.cols - 1; c++) {
    if (!isPit(c)) continue;
    let c1 = c;
    while (c1 + 1 < S.cols && isPit(c1 + 1)) c1++;
    if (c1 >= S.cols - 1) break;
    const top = Math.max(topOf(c - 1), topOf(c1 + 1));
    const run = { c0: c, c1, top, y: top * T + T * 0.7 };
    S.pits.push(run);
    for (let k = c; k <= c1; k++) S.pitAt[k] = run;
    c = c1;
  }
}
const pitAtX = (x) => S.pitAt[Math.floor(x / T)] || null;

function floorBelow(c, r) {
  for (let rr = r; rr < S.rows; rr++) if (solidAt(c, rr)) return rr * T;
  return S.rows * T + 400;
}

const unlockedKinds = () => UNLOCK.slice(0, Math.min(UNLOCK.length, 5 + S.levelIndex * 2 + S.wave));

function rollOffers(free) {
  const pool = unlockedKinds().filter((k) => k !== 'block' && (S.pits.length || TRAPS[k].mount !== 'pit'));
  for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const pick = pool.slice(0, 4);
  // pits are only fun with something living in them: often offer a pit trap
  const pitPick = pool.find((k) => PIT_TRAPS.includes(k));
  if (S.pits.length && pitPick && !pick.some((k) => PIT_TRAPS.includes(k)) && Math.random() < 0.6) pick[3] = pitPick;
  S.offers = ['block', ...pick.filter(Boolean)];
  if (S.selected && !S.offers.includes(S.selected) && S.selected !== S.freeTrap) S.selected = null;
  if (!free) play('select');
}

const maxTraps = () => Math.min(18, 5 + S.wave + Math.floor(S.levelIndex / 2)) + S.bonusSlots;
const trapAtCell = (c, r) => S.traps.find((t) => t.c === c && t.r === r);
const priceOf = (k) => (k === S.freeTrap ? 0 : TRAPS[k].price);

/** No spamming: at most 2 traps of the same kind close to each other. */
const SPREAD = 4;
// mid-air traps (Spike Ball, Fire/Ice Cannon, Crossbow, Flamethrower) can be stacked anywhere
// up and down, so for them the whole column band counts, whatever the height
const crowdedAt = (kind, c, r) => {
  if (kind === 'block') return false;
  const air = TRAPS[kind].mount === 'air' || TRAPS[kind].mount === 'any';
  return S.traps.filter((t) => t.kind === kind && Math.abs(t.c - c) <= SPREAD && (air || Math.abs(t.r - r) <= 3)).length >= 2;
};

function canPlace(kind, c, r) {
  if (crowdedAt(kind, c, r)) return false;
  if (c < 1 || c >= S.cols - 1 || r < 1 || r >= S.rows) return false;
  if (solidAt(c, r) || trapAtCell(c, r)) return false;
  const mount = TRAPS[kind].mount;
  const pit = S.pitAt[c];
  if (mount === 'pit' || (mount === 'floorpit' && pit && r === pit.top)) return !!pit && r === pit.top;
  if ((mount === 'floor' || mount === 'floorpit') && !solidAt(c, r + 1)) return false;
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
  const rows = mount === 'ceiling' ? [Math.floor(floorBelow(c, r) / T) - 1] : mount === 'air' || mount === 'any' ? [r, r + 1] : [r];
  for (const p of [S.door, S.goal]) if (p && rows.includes(p.r) && Math.abs(p.c - c) <= (p === S.goal ? 2 : 1)) return false;
  return true;
}

function makeTrap(kind, c, r) {
  const t = {
    id: nextId++, kind, c, r, x: c * T, cx: c * T + T / 2, cy: r * T + T / 2,
    floorY: floorBelow(c, r), ceilY: r * T,
    state: 'armed', timer: 0, disabledT: 0, broken: false, phaseOffset: Math.random(),
  };
  const pit = (TRAPS[kind].mount === 'pit' || kind === 'croc') && S.pitAt[c] && r === S.pitAt[c].top ? S.pitAt[c] : null;
  if (pit) { t.pit = pit; t.floorY = pit.y; }
  if (kind === 'fire' || kind === 'geyser' || kind === 'flamethrower') t.timer = Math.random() * 3;
  if (kind === 'axe') { t.len = Math.max(60, Math.min(130, t.floorY - t.ceilY - 36)); t.period = 2.6; t.amp = 1.1; }
  if (kind === 'pendulum') { t.len = Math.max(70, Math.min(150, t.floorY - t.ceilY - 30)); t.period = 3.0; t.amp = 0.9; }
  if (kind === 'rock' || kind === 'cage' || kind === 'crusher') { t.y = t.ceilY; t.vy = 0; }
  if (kind === 'spear') t.up = 0;
  if (kind === 'lavaball') { t.timer = Math.random() * 2.8; t.by = t.floorY; t.bvy = 0; }
  if (kind === 'flamethrower') { t.face = S.door ? Math.sign(S.door.c - c) || -1 : -1; t.state = 'off'; }
  if (kind === 'launchpad') t.squish = 0;
  if (kind === 'roller') { t.sx = t.cx; t.dir = 1; t.rot = 0; sawRange(t, 4); }
  if (kind === 'wheel') { t.wx = t.cx; t.vx = 0; t.rot = 0; }
  if (kind === 'saw') { t.sx = t.cx; t.dir = 1; t.rot = 0; sawRange(t); }
  if (kind === 'spring') t.squish = 0;
  if (SHOOTERS.includes(kind)) { t.face = -1; t.aim = Math.PI; t.timer = 0.8 + Math.random(); t.recoil = 0; }
  if (kind === 'croc') { t.state = 'ready'; t.lunge = 0; t.jaw = 0; t.reach = pit ? pit.y - pit.top * T + 2.5 * T : 2.4 * T; }
  if (kind === 'spikeball') t.rot = 0;
  return t;
}

function sawRange(t, n = 2) {
  let a = t.c, b = t.c;
  const fr = t.r + 1;
  while (a > t.c - n && solidAt(a - 1, fr) && !solidAt(a - 1, t.r)) a--;
  while (b < t.c + n && solidAt(b + 1, fr) && !solidAt(b + 1, t.r)) b++;
  t.minX = a * T + 18; t.maxX = (b + 1) * T - 18;
}

function refreshTraps() {
  for (const t of S.traps) {
    if (t.pit) continue;
    t.floorY = floorBelow(t.c, t.r);
    if (t.kind === 'saw') sawRange(t);
    if (t.kind === 'roller') sawRange(t, 4);
  }
  buildMinimap();
}
function placeBlock(c, r) { S.grid[r][c] = 2; refreshTraps(); }
function removeBlock(c, r) {
  S.grid[r][c] = 0;
  S.traps = S.traps.filter((t) => !(t.c === c && t.r === r - 1 && TRAPS[t.kind].mount === 'floor'));
  refreshTraps();
}

/* ═════════════════════════ waves ═════════════════════════ */
// which heroes each theme likes to send a few extra of
const THEME_HEROES = { lava: ['firemage', 'orc'], snow: ['icemage', 'viking'], halloween: ['witch', 'darkknight', 'assassin'], night: ['witch', 'assassin'], desert: ['archer', 'orc'], ruins: ['druid', 'archer'] };
function planWave() {
  const w = S.wave + 1, L = S.levelIndex;
  const hard = LEVELS[L].hard?.crowd || 1;
  const total = Math.min(200, Math.round((6 + w * 5 + w * w * 1.2) * (L === 0 ? 0.68 : Math.min(2.4, 0.8 + L * 0.15)) * hard));
  // a new class joins roughly every wave; later levels start with more of them
  const n = Math.min(CLASS_ORDER.length, 1 + Math.floor((w - 1) * 0.8 + L * 1.4));
  const pool = CLASS_ORDER.slice(0, n);
  const fav = (THEME_HEROES[LEVELS[L].theme] || []).filter((c) => CLASS_ORDER.indexOf(c) < n + 3 && w >= 2);
  S.nextWave = Array.from({ length: total }, (_, i) => {
    if (i < 3 || Math.random() < 0.38) return 'hero';
    if (fav.length && Math.random() < 0.18) return fav[(Math.random() * fav.length) | 0];
    return pool[(Math.random() * pool.length) | 0];
  });
}

function startWave() {
  if (S.screen !== 'build') return;
  S.builtToast = false;
  S.wave++;
  S.screen = 'wave';
  S.selected = null; S.sellMode = false; S.tutorial = false;
  S.spawnQueue = S.nextWave.slice();
  S.spawnT = 0.6;
  S.waveStats = { total: S.spawnQueue.length, killed: 0, damage: 0 };
  for (const t of S.traps) { t.broken = false; t.disabledT = 0; t.kills = (t.kills || 0) * 0.5; resetTrap(t); }
  S.cam.follow = true;
  mood('laugh', 1.2, 1);
  say(tx('Release the heroes!'), 1.6);
  play('wavestart');
  setTimeout(() => play('fight'), 350);
  pcall('gameplayStart');
}

function resetTrap(t) {
  if (t.kind === 'croc') { t.state = 'ready'; t.lunge = 0; return; }
  if (t.kind === 'flamethrower') { t.state = 'off'; return; }
  t.state = 'armed';
  if (t.kind === 'rock' || t.kind === 'cage' || t.kind === 'crusher') { t.y = t.ceilY; t.vy = 0; t.victim = null; }
  if (t.kind === 'spear') t.up = 0;
  if (t.kind === 'roller') { t.sx = t.cx; t.dir = 1; }
  if (t.kind === 'wheel') { t.wx = t.cx; t.vx = 0; }
}

function spawnHero(cls) {
  const C = CLASSES[cls];
  const x = S.door.c * T + T / 2 - C.w / 2 + (Math.random() - 0.5) * 6;
  const y = S.door.r * T + T - C.h;
  S.heroes.push({
    id: nextId++, cls, C, x, y, w: C.w, h: C.h, vx: 0, vy: 0, dir: 1,
    hp: Math.round(C.hp * (LEVELS[S.levelIndex].hard?.hp || 1)), maxHp: Math.round(C.hp * (LEVELS[S.levelIndex].hard?.hp || 1)), hpShowT: 0, grounded: false, alive: true, gone: false, anim: Math.random() * 10,
    action: 'go', decisionT: 0, lastKey: null, enc: new Map(), hitCd: new Map(),
    slimeT: 0, stunT: 0, springCd: 0, forceGoT: 0, bounces: 0, life: 0, freezeT: 0, burnT: 0, burnTick: 0,
    shield: cls === 'knight' || cls === 'paladin', castT: 0, wizardCd: 1.5, swingT: 0, flashT: 0,
    abCd: 1 + Math.random() * 1.5, actT: 0, glideT: 0, rage: false, dodgeCd: 0, heavy: cls === 'darkknight',
    thought: null, thoughtT: 0, deadT: 0, spin: 0, caged: null, speedMul: 0.92 + Math.random() * 0.16,
  });
}

/** Bridges, smashed blocks and other wave-only changes go back to normal. */
function restoreLevel() {
  let changed = false;
  for (const b of S.bridges) for (const [c, r] of b.cells) { if (S.grid[r][c] === 4) S.grid[r][c] = 0; changed = true; }
  for (const { c, r } of S.smashed) { S.grid[r][c] = 2; changed = true; }
  for (const [c, r] of S.crates) { if (S.grid[r][c] === 5) S.grid[r][c] = 0; changed = true; }
  S.bridges = []; S.smashed = []; S.crates = []; S.walls = {};
  if (changed) refreshTraps();
}

function endWave() {
  restoreLevel();
  S.replayed = brain.replay(160);
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
    progress.stars[LEVELS[S.levelIndex].name] = Math.max(starsOf(S.levelIndex), stars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length, S.levelIndex + 2));
    saveProgress();
    S.screen = 'win';
    S.winStars = stars;
    mood('celebrate', 99, 5);
    say(tx('The gold is safe! Mwahaha!'), 4);
    play('win');
    setTimeout(() => play('youwin'), 700);
    pcall('happyTime');
    return;
  }
  S.screen = 'summary';
  S.summaryT = 0;
  mood(st.rate > 0.95 ? 'celebrate' : st.damage > 8 ? 'angry' : 'laugh', 2.5, 4);
  play('wavedone');
  if (st.perfect) { setTimeout(() => play('flawless'), 600); pcall('happyTime'); }
}

async function toBuild() {
  if (S.wave % 2 === 0) await showInterstitial();
  S.screen = 'build';
  planWave();
  rollOffers(true);
  if (5 + S.levelIndex * 2 + S.wave <= UNLOCK.length) {
    toast(tx('New trap unlocked: {name}!', { name: tx(TRAPS[unlockedKinds().at(-1)].name) }), 2.4);
    play('unlock');
  }
  introduceHeroes();
}

/** The first time a hero class shows up, tell the player what it can do. */
function introduceHeroes() {
  const fresh = [...new Set(S.nextWave)].filter((c) => !progress.seen[c] && c !== 'hero');
  fresh.slice(0, 2).forEach((c, i) => {
    progress.seen[c] = 1;
    setTimeout(() => toast(tx('New hero: {name} — {tip}', { name: tx(CLASSES[c].name), tip: tx(CLASSES[c].tip) }), 3.6), 900 + i * 3700);
  });
  if (fresh.length) saveProgress();
}

/* ═════════════════════════ hero AI ═════════════════════════ */
/** Hero "tactics groups": the brain keeps separate tactics for heroes that play differently. */
function heroGroup(h) {
  switch (h.cls) {
    case 'barb': case 'orc': case 'viking': return 'b';      // breakers
    case 'knight': case 'paladin': return h.shield ? 'k' : 'n';
    case 'darkknight': return 'h';                            // heavy, no knockback
    case 'thief': case 'assassin': return 'q';                // quick
    case 'firemage': return 'f';
    case 'icemage': return 'i';
    case 'witch': return 'w';
    default: return 'n';
  }
}
const PROJ = { ball: 'cannon', fireball: 'firecannon', iceball: 'icecannon', log: 'loglauncher', arrow: 'crossbow' };
const isProj = (t) => !!PROJ[t.kind];

function trapZone(t) {
  if (isProj(t)) return [t.x - t.r - 2, t.x + t.r + 2];
  if (t.kind === 'wheel') return [t.wx - 18, t.wx + 18];
  if (t.kind === 'saw') return [t.sx - 18, t.sx + 18];
  if (t.kind === 'roller') return [t.sx - 24, t.sx + 24];
  if (t.kind === 'axe' || t.kind === 'pendulum') { const r = Math.min(66, t.len * 0.72); return [t.cx - r, t.cx + r]; }
  if (t.kind === 'bomb') return [t.cx - 34, t.cx + 34];
  if (t.kind === 'croc') return [t.cx - (t.pit ? 34 : 26), t.cx + (t.pit ? 34 : 26)];
  if (t.kind === 'flamethrower') { const a = t.cx + t.face * 12, b = t.cx + t.face * 3.2 * T; return [Math.min(a, b), Math.max(a, b)]; }
  if (t.kind === 'crusher') return [t.cx - 24, t.cx + 24];
  return [t.x + 2, t.x + T - 2];
}
function inLane(h, t) {
  if (isProj(t)) return Math.abs(t.y - (h.y + h.h / 2)) < 70;
  if (t.kind === 'spikeball') { const top = h.y - 70, bot = h.y + h.h + 6; return t.cy > top && t.cy < bot; }
  if (t.kind === 'flamethrower') return Math.abs(t.cy - (h.y + h.h / 2)) < 34;
  const feet = h.y + h.h;
  if (t.pit) { const ground = t.pit.top * T; return feet <= ground + 6 && feet > ground - 3.5 * T; }
  return feet <= t.floorY + 6 && feet > t.floorY - 3.5 * T;
}
const trapActive = (t) => !t.broken && t.disabledT <= 0 && t.kind !== 'block';
const isShooter = (t) => SHOOTERS.includes(t.kind);

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
    case 'axe': case 'pendulum': {
      const a = axeAngle(t) * h.dir, v = axeVel(t) * h.dir;
      return (v > 0 ? 0 : 4) + Math.min(3, Math.max(0, Math.floor(((a / t.amp + 1) / 2) * 4)));
    }
    case 'rock': case 'cage': case 'crusher': return t.state === 'armed' ? 0 : t.state === 'falling' || t.state === 'trigger' ? 1 : 2;
    case 'spear': return t.state === 'armed' ? 0 : t.state === 'warn' ? 1 : t.state === 'up' ? 2 : 3;
    case 'geyser': case 'flamethrower': return t.state === 'on' ? 2 : t.state === 'warn' ? 1 : 0;
    case 'lavaball': return t.state === 'hidden' ? 0 : t.bvy < 0 ? 1 : 2;
    case 'roller': return Math.sign(t.dir) === -h.dir ? 1 : 0;
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
    if ((t.kind === 'spring' || t.kind === 'launchpad') && h.bounces >= 3) continue;
    consider(t);
  }
  for (const b of S.balls) if (b.kind !== 'harrow' && Math.sign(b.vx) === -h.dir) consider(b);

  if (h.forceGoT > 0) { h.forceGoT -= dt; h.action = 'go'; return; }
  if (!best) { h.action = 'go'; h.lastKey = null; return; }

  // combo sense: is another trap waiting right behind this one?
  const combo = S.traps.some((t) => {
    if (t === best || !trapActive(t) || isShooter(t) || !inLane(h, t)) return false;
    const { d, passed } = aheadDist(h, t);
    return !passed && d > bd && d < bd + 120;
  }) ? 1 : 0;
  const key = brain.key(brainKind(best), distBucket(bd), trapPhase(best, h), heroGroup(h), combo);
  let e = h.enc.get(best.id);
  if (!e) { e = { steps: [], waitT: 0, dmg: 0, proj: isProj(best) ? best.kind : null }; h.enc.set(best.id, e); }
  if (h.action === 'wait') {
    e.waitT += dt;
    if (e.waitT > 6) { h.forceGoT = 1.2; h.action = 'go'; return; }
  }
  h.decisionT -= dt;
  if (key !== h.lastKey || h.decisionT <= 0) {
    // danger sense: a trap that keeps killing heroes makes them try new tricks
    const { a, explore } = brain.choose(key, Math.min(0.35, (best.kills || 0) * 0.04));
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
  if (reward <= -1 && !isProj(t)) t.kills = (t.kills || 0) + 1;
  const { before, after } = brain.record(kind, reward > 0);
  if (before < 0.7 && after >= 0.7 && brain.mastery[kind].seen >= 10 && S.time - (S.learnToastT || -99) > 6) {
    S.learnToastT = S.time;
    toast(tx('Heroes figured out the {name}! Mix it up!', { name: tx(TRAPS[kind].name) }), 3);
    play('learn');
    mood('angry', 1.8, 3);
    say(tx('They learned it?!'), 1.8);
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
    if (smashBlocks(h, pc, footRow)) return;
    if (buildStep(h, pc, footRow)) return;
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

/** Vikings and Orcs smash the player's Blocks that stand in their way (for this wave). */
function smashBlocks(h, c, footRow) {
  if (h.cls !== 'viking' && h.cls !== 'orc') return false;
  let hit = false;
  for (let r = footRow - 3; r <= footRow; r++) {
    if (S.grid[r]?.[c] === 2 && trapAtCell(c, r)?.kind === 'block') {
      S.grid[r][c] = 0;
      S.smashed.push({ c, r });
      for (let i = 0; i < 8; i++) shard(c * T + T / 2, r * T + T / 2, S.theme.brick || '#c96a3a');
      hit = true;
    }
  }
  if (!hit) return false;
  h.swingT = 0.4; h.actT = 0.4;
  play('rock');
  S.shake = Math.max(S.shake, 3);
  floater(h.x + h.w / 2, h.y - 14, tx('SMASH!'), '#ffd34d', 15);
  refreshTraps();
  return true;
}

/**
 * Teamwork: when a wall is too tall and keeps sending heroes back, a hero
 * drops a crate right where it stands and climbs on. Repeating that builds a
 * staircase of any height: once the crate pile itself gets too tall, the next
 * heroes build in front of it, and so on (2-step stairs, up to 8 tiles high).
 * The guild remembers such walls for the level, so later waves start building
 * at once.
 */
const MAX_CRATES = 40;
function buildStep(h, pc, footRow) {
  let top = footRow;
  while (top - 1 >= 0 && solidAt(pc, top - 1)) top--;
  const tall = footRow - top + 1;
  if (tall < 3 || tall > 8 || top < 2 || solidAt(pc, top - 2) || S.crates.length >= MAX_CRATES) return false;
  const key = `${pc},${h.dir}`;
  const known = S.wallMemory.has(key) || S.grid[footRow][pc] === 5;
  const n = (S.walls[key] = (S.walls[key] || 0) + 1);
  if (n < (known ? 1 : 3)) return false;
  const bc = pc - h.dir, r = footRow;
  if (bc < 1 || bc >= S.cols - 1 || S.grid[r][bc] || solidAt(bc, r - 1) || solidAt(bc, r - 2)) return false;
  S.grid[r][bc] = 5;
  S.crates.push([bc, r]);
  S.wallMemory.add(key);
  S.walls[key] = 0;
  // everyone standing there climbs on top of the new crate
  for (const o of S.heroes) if (o.alive && rectHit(o, bc * T, r * T, T, T)) { o.y = r * T - o.h - 0.01; o.vy = 0; }
  h.castT = 0.5; h.actT = 0.5;
  floater(h.x + h.w / 2, h.y - 14, tx('BUILD!'), '#ffd34d', 15);
  for (let i = 0; i < 6; i++) shard(bc * T + T / 2, r * T + 10, '#c98a4b');
  play('block');
  if (!S.builtToast) { S.builtToast = true; toast(tx('The heroes are building steps over your wall!'), 2.4); mood('angry', 1.5, 3); }
  refreshTraps();
  return true;
}

function drawCrate(c, r) {
  const x = c * T, y = r * T;
  g.fillStyle = '#c98a4b'; g.strokeStyle = INK; g.lineWidth = 3;
  g.fillRect(x + 1, y + 1, T - 2, T - 2); g.strokeRect(x + 2.5, y + 2.5, T - 5, T - 5);
  g.strokeStyle = '#8b5a2b'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x + 5, y + 5); g.lineTo(x + T - 5, y + T - 5); g.moveTo(x + T - 5, y + 5); g.lineTo(x + 5, y + T - 5); g.stroke();
}

/** Lay a temporary bridge over a pit (Druid vines / Ice Mage ice). */
function makeBridge(pit, type) {
  if (S.bridges.some((b) => b.pit === pit)) return false;
  const cells = [];
  for (let c = pit.c0; c <= pit.c1; c++) if (!S.grid[pit.top][c]) { S.grid[pit.top][c] = 4; cells.push([c, pit.top]); }
  if (!cells.length) return false;
  S.bridges.push({ pit, type, cells, t: type === 'ice' ? 5 : 6 });
  for (const [c, r] of cells) for (let i = 0; i < 4; i++) spark(c * T + T / 2, r * T + 8, type === 'ice' ? '#d4f3ff' : '#7bdc4a');
  // the pit's residents are pushed down for a while
  for (const t of S.traps) if (t.pit === pit) t.disabledT = Math.max(t.disabledT, 3);
  play(type === 'ice' ? 'freeze' : 'bridge');
  return true;
}
function updateBridges(dt) {
  if (!S.bridges.length) return;
  for (const b of S.bridges) b.t -= dt;
  const done = S.bridges.filter((b) => b.t <= 0);
  if (!done.length) return;
  for (const b of done) for (const [c, r] of b.cells) {
    if (S.grid[r][c] === 4) S.grid[r][c] = 0;
    for (let i = 0; i < 3; i++) shard(c * T + T / 2, r * T + 10, b.type === 'ice' ? '#d4f3ff' : '#4f9a2a');
  }
  S.bridges = S.bridges.filter((b) => b.t > 0);
  refreshTraps();
}

const nearest = (h, list, maxD) => {
  let best = null, bd = maxD;
  for (const t of list) { const d = aheadDist(h, t); if (!d.passed && d.d > -10 && d.d < bd && inLane(h, t)) { bd = d.d; best = t; } }
  return best;
};

/** Hero class abilities. */
function ability(h, dt) {
  h.abCd -= dt;
  const cx = h.x + h.w / 2, cy = h.y + h.h / 2;
  switch (h.cls) {
    case 'wizard': {
      h.wizardCd -= dt;
      if (h.wizardCd > 0) break;
      const t = nearest(h, S.traps.filter((t) => trapActive(t) && !isShooter(t)), 90);
      if (t) {
        t.disabledT = 3; h.wizardCd = 7; h.castT = 0.6;
        play('magic');
        for (let i = 0; i < 14; i++) spark(t.cx, TRAPS[t.kind].mount === 'ceiling' ? t.ceilY + 20 : t.floorY - 14, '#7fd8ff');
      }
      break;
    }
    case 'archer': {
      if (h.abCd > 0) break;
      const targets = S.traps.filter((t) => trapActive(t) && t.state === 'armed' && ['rock', 'cage', 'crusher', 'bomb', 'spikeball'].includes(t.kind));
      let best = null, bd = 6 * T;
      for (const t of targets) {
        const ty = t.kind === 'bomb' ? t.floorY - 20 : t.kind === 'spikeball' ? t.cy : t.ceilY + 20;
        const dx = (t.cx - cx) * h.dir;
        if (dx < 20 || dx > bd || Math.abs(ty - cy) > 5 * T || !clearShot(cx, cy - 6, t.cx, ty)) continue;
        bd = dx; best = { t, ty };
      }
      if (!best) break;
      const { t, ty } = best, d = Math.hypot(t.cx - cx, ty - cy), sp = 560;
      S.balls.push({ id: nextId++, kind: 'harrow', x: cx + h.dir * 10, y: cy - 6, vx: ((t.cx - cx) / d) * sp, vy: ((ty - cy + 6) / d) * sp, r: 6, life: 2, target: t, owner: h.id });
      h.abCd = 5; h.castT = 0.45; h.actT = 0.45;
      play('arrow');
      break;
    }
    case 'paladin': case 'druid': {
      if (h.abCd > 0) break;
      const hurt = S.heroes.filter((o) => o.alive && o.hp < o.maxHp && Math.hypot(o.x + o.w / 2 - cx, o.y + o.h / 2 - cy) < 110);
      if (!hurt.length) break;
      const amt = h.cls === 'paladin' ? 35 : 25;
      for (const o of hurt) {
        o.hp = Math.min(o.maxHp, o.hp + amt); o.hpShowT = 1.2;
        floater(o.x + o.w / 2, o.y - 10, `+${amt}`, '#7dff9a', 14);
      }
      h.abCd = h.cls === 'paladin' ? 5 : 6; h.actT = 0.5; h.ring = { t: 0, color: h.cls === 'paladin' ? '#ffe680' : '#8cf05a' };
      play('heal', { vol: 0.6 });
      break;
    }
    case 'icemage': {
      if (h.abCd > 0) break;
      const t = nearest(h, S.traps.filter((t) => trapActive(t) && !isShooter(t) && t.kind !== 'spring'), 100);
      if (!t) break;
      t.disabledT = 3.5; t.iced = 3.5; h.abCd = 7; h.castT = 0.5; h.actT = 0.5;
      play('freeze');
      for (let i = 0; i < 12; i++) spark(t.cx, (t.pit ? t.floorY : TRAPS[t.kind].mount === 'ceiling' ? t.ceilY + 20 : t.floorY - 14), '#d4f3ff');
      break;
    }
    case 'firemage': {
      if (h.abCd > 0) break;
      const frozen = S.heroes.filter((o) => o.alive && o.freezeT > 0 && Math.hypot(o.x - h.x, o.y - h.y) < 120);
      if (!frozen.length) break;
      for (const o of frozen) { o.freezeT = 0; for (let i = 0; i < 5; i++) spark(o.x + o.w / 2, o.y + o.h / 2, '#ffb347'); }
      h.abCd = 3; h.actT = 0.4;
      play('fireball', { vol: 0.6 });
      break;
    }
    case 'witch': {
      if (h.abCd > 0 || !h.grounded || h.glideT > 0) break;
      const t = nearest(h, S.traps.filter((t) => trapActive(t) && !isShooter(t) && (BACK_LAYER(t.kind) || t.pit || t.kind === 'saw' || t.kind === 'wheel' || t.kind === 'roller')), 70);
      if (!t) break;
      h.glideT = 1.4; h.abCd = 6; h.actT = 1.4;
      jump(h, -600, Math.max(150, h.C.speed * 1.5));
      play('glide', { vol: 0.6 });
      break;
    }
    case 'viking': {
      if (!h.rage && h.hp < h.maxHp * 0.5) {
        h.rage = true; h.speedMul *= 1.45; h.actT = 0.6;
        floater(cx, h.y - 16, tx('RAGE!'), '#ff4d4d', 18);
        play('rage', { vol: 0.7 });
      }
      break;
    }
    case 'orc': {
      // knocks floor cannons it walks into out of action
      for (const t of S.traps) {
        if (!isShooter(t) || !trapActive(t) || !solidAt(t.c, t.r + 1)) continue;
        if (Math.abs(t.cx - cx) < 26 && Math.abs(t.floorY - (h.y + h.h)) < 10) {
          t.disabledT = 5; h.swingT = 0.4; h.actT = 0.4;
          play('clang');
          for (let i = 0; i < 6; i++) spark(t.cx, t.floorY - 16, '#dfe6ee');
        }
      }
      break;
    }
  }
  // Druid vines and Ice Mage ice: bridge the pit right ahead
  if ((h.cls === 'druid' || h.cls === 'icemage') && h.grounded && (h.bridgeCd = (h.bridgeCd || 0) - dt) <= 0) {
    const front = h.dir > 0 ? h.x + h.w + 6 : h.x - 6;
    const pit = pitAtX(front + h.dir * 10);
    if (pit && Math.abs(h.y + h.h - pit.top * T) < 6 && makeBridge(pit, h.cls === 'druid' ? 'vine' : 'ice')) { h.bridgeCd = 9; h.castT = 0.5; h.actT = 0.5; }
  }
}

function updateHero(h, dt) {
  h.anim += dt;
  if (h.thoughtT > 0) h.thoughtT -= dt;
  if (h.castT > 0) h.castT -= dt;
  if (h.swingT > 0) h.swingT -= dt;
  if (h.actT > 0) h.actT -= dt;
  if (h.springCd > 0) h.springCd -= dt;
  if (h.hpShowT > 0) h.hpShowT -= dt;
  if (h.flashT > 0) h.flashT -= dt;
  if (h.dodgeCd > 0) h.dodgeCd -= dt;
  if (h.ring && (h.ring.t += dt) > 0.6) h.ring = null;

  if (!h.alive) {
    h.deadT += dt;
    if (h.caged || h.deadT < 0.28) return; // flash red for a moment first
    if (h.sinking) { h.y += 34 * dt; if (h.deadT > 1.2) h.gone = true; return; }
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
    ability(h, dt);
    think(h, dt);
    if (h.grounded) {
      const act = h.action;
      let speed = act === 'wait' ? 0 : act === 'dash' ? walk * 1.7 : walk;
      if (h.castT > 0) speed = 0;
      if (h.wade) speed *= 0.55;
      // ice: heroes slide and can't stop on a dime (the Ice Mage keeps its footing)
      if (S.theme.ice && h.cls !== 'icemage') {
        h.vx += (h.dir * speed - h.vx) * Math.min(1, dt * (speed ? 3.2 : 1.4));
        if (speed === 0 && Math.abs(h.vx) > 30 && Math.random() < dt * 4) S.particles.push({ x: h.x + h.w / 2, y: h.y + h.h, vx: -h.vx * 0.2, vy: -20, life: 0.4, max: 0.4, type: 'spark', color: '#e8f6ff', size: 2 });
      } else h.vx = h.dir * speed;
      if (speed > 0) navigate(h, air);
      if (h.grounded && act === 'jump' && h.slimeT <= 0) {
        // jumping right before a pit means a long jump across it
        const front = h.dir > 0 ? h.x + h.w : h.x;
        const pit = pitAtX(front + h.dir * 1.2 * T) || pitAtX(front + h.dir * 4);
        if (pit) {
          const far = h.dir > 0 ? (pit.c1 + 1) * T + 14 : pit.c0 * T - 14;
          jump(h, -640, Math.max(air, Math.min(400, Math.abs(far - front) / 0.62)));
        } else jump(h, -560, air);
      }
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

  if (h.glideT > 0) {
    // the Witch's broom: float gently forward
    h.glideT -= dt;
    if (!h.grounded) { h.vx = h.dir * Math.max(150, walk * 1.5); if (h.vy > 40) h.vy = 40; }
    if (Math.random() < dt * 25) S.particles.push({ x: h.x + h.w / 2 - h.dir * 10, y: h.y + h.h - 4, vx: -h.dir * 30, vy: 10, life: 0.5, max: 0.5, type: 'spark', color: '#c08cff', size: 3 });
  }

  h.vy = Math.min(h.vy + GRAVITY * dt * (h.glideT > 0 && h.vy > 0 ? 0.15 : 1), 950);
  h.x += h.vx * dt;
  collideX(h);
  h.y += h.vy * dt;
  collideY(h);
  if (!h.alive) return;

  const pit = pitAtX(h.x + h.w / 2);
  if (pit && h.y + h.h > pit.y + 8) {
    S.heat[Math.min(S.rows - 1, pit.top)][Math.floor((h.x + h.w / 2) / T)]++;
    drown(h, pit);
    return;
  }
  if (h.y > worldH() + 40) {
    const c = Math.max(0, Math.min(S.cols - 1, Math.floor((h.x + h.w / 2) / T)));
    S.heat[S.rows - 1][c]++;
    defeat(h, null, 'fell');
    return;
  }

  const gl = S.goal;
  if (gl) {
    const gx = gl.c * T + T / 2, gy = gl.r * T + T;
    const near = Math.abs(h.x + h.w / 2 - gx);
    if (near < 4 * T && Math.abs(h.y + h.h - gy) < 2 * T && S.mood === 'idle' && !S.speech) { mood('surprised', 0.8, 2); if (Math.random() < 0.3) say(tx('Uh-oh…'), 0.9); }
    if (near < 26 && Math.abs(h.y + h.h - gy) < 24) {
      h.alive = false; h.gone = true;
      S.hp = Math.max(0, S.hp - C.dmg);
      S.escaped++;
      S.waveStats.damage += C.dmg;
      for (const [id] of h.enc) { const t = findThreat(id); if (t) finishEncounter(h, t, 1); }
      for (let i = 0; i < 6; i++) spark(gx, gy - 30, '#ffd34d');
      floater(gx, gy - 70, `-${C.dmg}`, '#ff6b6b', 22);
      S.shake = Math.max(S.shake, 4);
      mood('sad', 1.8, 3);
      if (Math.random() < 0.5 || !S.speech) say(tx(SADS[(Math.random() * SADS.length) | 0]), 1.4);
      play('castle');
      play('sad');
    }
  }
}

/** A hero fell into the water / lava / goo of a pit. */
function drown(h, pit) {
  const fl = FLUID[S.theme.fluid];
  const x = h.x + h.w / 2;
  for (let i = 0; i < 10; i++) S.particles.push({ x: x + (Math.random() - 0.5) * 20, y: pit.y, vx: (Math.random() - 0.5) * 140, vy: -120 - Math.random() * 160, life: 0.6, max: 0.6, type: 'spark', color: fl.top, size: 3 + Math.random() * 2, grav: true });
  if (onScreen(x, pit.y)) play(S.theme.fluid === 'lava' ? 'fire' : 'splash', { vol: 0.7 });
  const tr = [...h.enc.keys()].map(findThreat).find((t) => t && t.pit === pit);
  defeat(h, tr || null, S.theme.fluid === 'lava' ? 'lava' : 'drowned');
  h.sinking = true; h.vx = 0; h.vy = 0;
}

const FIREY = ['burnt'];
function immune(h, how) {
  return (h.cls === 'firemage' && FIREY.includes(how)) || (h.cls === 'icemage' && how === 'frozen');
}
/** Set a hero on fire / freeze it, unless it is immune. */
const burn = (h, t) => { if (h.cls !== 'firemage') h.burnT = t; };
const freeze = (h, t) => { if (h.cls !== 'icemage') h.freezeT = t; };

function damage(h, amount, trap, how) {
  if (!h.alive) return;
  if (trap && h.hitCd.get(trap.id) > S.time) return;
  if (immune(h, how)) {
    if (trap) h.hitCd.set(trap.id, S.time + 0.6);
    if (Math.random() < 0.3) floater(h.x + h.w / 2, h.y - 6, tx('IMMUNE'), '#9fe3ff', 12);
    return;
  }
  // the Assassin shadow-steps out of the first heavy hit
  if (h.cls === 'assassin' && h.dodgeCd <= 0 && amount >= 40 && trap) {
    h.dodgeCd = 7;
    h.hitCd.set(trap.id, S.time + 0.8);
    poof(h.x + h.w / 2, h.y + h.h / 2, 6);
    const to = h.x + h.dir * 2 * T;
    if (!solidPx(to + h.w / 2, h.y + h.h / 2) && !pitAtX(to + h.w / 2) && solidPx(to + h.w / 2, h.y + h.h + 4)) h.x = to;
    else { h.x -= h.dir * T; h.dir = -h.dir; h.lastKey = null; }
    h.actT = 0.4;
    floater(h.x + h.w / 2, h.y - 8, tx('DODGE!'), '#c08cff', 14);
    play('dodge');
    return;
  }
  if (h.rage) amount = Math.round(amount * 0.7);
  if (h.freezeT > 0) amount = Math.round(amount * 1.5);
  h.hp -= amount;
  h.hpShowT = 1.5;
  h.flashT = 0.16;
  const e = trap && h.enc.get(trap.id);
  if (e) e.dmg += amount / h.maxHp;
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
  const by = trap ? brainKind(trap) : how;
  S.killBy[by] = (S.killBy[by] || 0) + 1;
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
    if (Math.random() < 0.45) { say(tx(LAUGHS[(Math.random() * LAUGHS.length) | 0]), 1.2); play('laugh', { vol: 0.7 }); }
  }
  if (how === 'caged') { h.caged = trap; h.vy = 0; h.vx = 0; }
}

const rectHit = (h, x, y, w, hh) => h.x < x + w && h.x + h.w > x && h.y < y + hh && h.y + h.h > y;
function circleHit(h, cx, cy, r) {
  const nx = Math.max(h.x, Math.min(cx, h.x + h.w)), ny = Math.max(h.y, Math.min(cy, h.y + h.h));
  return (nx - cx) ** 2 + (ny - cy) ** 2 < r * r;
}

function absorb(h, t) {
  if ((h.cls === 'barb' || h.cls === 'orc') && (t.kind === 'rock' || t.kind === 'cage' || (h.cls === 'orc' && t.kind === 'crusher'))) {
    h.swingT = 0.4; h.actT = 0.4;
    shatter(t);
    if (t.kind === 'cage') t.broken = true;
    return true;
  }
  if (h.shield && ['axe', 'pendulum', 'rock', 'wheel', 'ball', 'saw', 'log', 'spikeball', 'roller', 'arrow', 'crusher'].includes(t.kind)) {
    h.shield = false; h.swingT = 0.45; h.stunT = 0.35; h.vx = -h.dir * 120; h.vy = -200;
    play('clang');
    for (let i = 0; i < 8; i++) spark(h.x + h.w / 2 + h.dir * 12, h.y + h.h / 2, '#dfe6ee');
    if (t.kind === 'rock' || t.kind === 'wheel' || t.kind === 'crusher') shatter(t);
    if (t.kind === 'ball' || t.kind === 'log' || t.kind === 'arrow') t.dead = true;
    h.hitCd.set(t.id, S.time + 0.6);
    return true;
  }
  return false;
}

function shatter(t) {
  if (t.kind === 'crusher') {
    for (let i = 0; i < 10; i++) shard(t.cx, (t.y || t.ceilY) + 20, '#6b6f80');
    t.state = 'rising'; t.timer = 0;
    play('rock');
    return;
  }
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
      if (!h.heavy) { h.vx = Math.sign(hx - x || 1) * 220; h.vy = -380; h.stunT = 0.5; h.grounded = false; }
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
    else if (t.kind === 'crossbow') { if (Math.abs(hy - my) > 28 || !clearShot(mx, my, hx, my)) continue; }
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
  } else if (t.kind === 'crossbow') {
    t.timer = 1.4;
    S.balls.push({ id, kind: 'arrow', x: mx + t.face * 20, y: my, vx: t.face * 520, vy: 0, r: 6, life: 2 });
    play('arrow', { vol: 0.7 });
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
  if (t.iced > 0) t.iced -= dt;
  const live = S.heroes.filter((h) => h.alive);
  const on = trapActive(t);
  if (isShooter(t)) return updateShooter(t, dt, live);
  switch (t.kind) {
    case 'spikes':
      if (!on) break;
      for (const h of live) if (rectHit(h, t.x + 5, t.floorY - 15, T - 10, 15)) {
        if (h.hitCd.get(t.id) > S.time) continue;
        damage(h, 60, t, 'spiked'); h.hitCd.set(t.id, S.time + 0.8); play('spikes');
        if (S.theme.spikes === 'x_spikes_ice' && h.alive) freeze(h, 0.6); // ice spikes chill
        if (S.theme.spikes === 'x_spikes_red' && h.alive) burn(h, 0.8);   // lava spikes scorch
      }
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
        if (h.springCd > 0 || h.vy < 0 || h.bounces >= 3 || h.heavy) continue;
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
    case 'axe': case 'pendulum': {
      if (!on) break;
      const a = axeAngle(t), bx = t.cx + Math.sin(a) * t.len, by = t.ceilY + Math.cos(a) * t.len;
      const heavy = t.kind === 'pendulum';
      for (const h of live) if (circleHit(h, bx, by, 14) && !absorb(h, t)) {
        damage(h, heavy ? 150 : 120, t, 'chopped'); h.hitCd.set(t.id, S.time + 0.6);
        if (heavy && h.alive && !h.heavy) { h.vx = Math.sign(axeVel(t) || 1) * 260; h.vy = -300; h.stunT = 0.4; h.grounded = false; }
        play(heavy ? 'spikeball' : 'axe');
      }
      break;
    }
    case 'spear': {
      if (t.state === 'armed') {
        t.up = Math.max(0, t.up - dt * 4);
        if (!on) break;
        for (const h of live) if (inLane(h, t) && Math.abs(h.x + h.w / 2 - t.cx) < 46) { t.state = 'warn'; t.timer = 0.32; play('latch', { vol: 0.5 }); break; }
      } else if (t.state === 'warn') {
        t.timer -= dt; t.up = 0.15;
        if (t.timer <= 0) { t.state = 'up'; t.timer = 0.5; if (onScreen(t.cx, t.floorY)) play('spear'); }
      } else if (t.state === 'up') {
        t.timer -= dt; t.up = Math.min(1, t.up + dt * 14);
        for (const h of live) if (rectHit(h, t.x + 6, t.floorY - 46 * t.up, T - 12, 46 * t.up)) { damage(h, 110, t, 'speared'); h.hitCd.set(t.id, S.time + 0.7); }
        if (t.timer <= 0) { t.state = 'cool'; t.timer = 1.1; }
      } else { t.timer -= dt; t.up = Math.max(0, t.up - dt * 3); if (t.timer <= 0) t.state = 'armed'; }
      break;
    }
    case 'launchpad': {
      if (t.squish > 0) t.squish -= dt * 3;
      if (!on) break;
      for (const h of live) {
        if (h.springCd > 0 || h.vy < 0 || h.bounces >= 3 || h.heavy) continue;
        if (rectHit(h, t.x + 6, t.floorY - 12, T - 12, 12)) {
          h.vy = -1180; h.vx = -h.dir * 50; h.stunT = 0.9; h.springCd = 0.8; h.grounded = false; h.bounces++;
          t.squish = 1;
          play('launch');
          for (let i = 0; i < 6; i++) spark(t.cx, t.floorY - 6, '#ff6b6b');
          finishEncounter(h, t, -0.6);
        }
      }
      break;
    }
    case 'geyser': {
      t.timer = (t.timer + dt) % 2.7;
      const prev = t.state;
      t.state = t.timer < 1.2 ? 'off' : t.timer < 1.6 ? 'warn' : 'on';
      if (!on) { t.state = 'off'; break; }
      const topY = (t.pit ? t.pit.top * T : t.floorY) - 2.4 * T;
      if (t.state === 'warn' && Math.random() < dt * 25) S.particles.push({ x: t.cx + (Math.random() - 0.5) * 20, y: t.floorY - 4, vx: 0, vy: -50, life: 0.5, max: 0.5, type: 'bubble', color: '#8cf03c', size: 3 + Math.random() * 3 });
      if (t.state === 'on') {
        if (prev !== 'on' && onScreen(t.cx, t.floorY)) play('splash', { vol: 0.8 });
        if (Math.random() < dt * 30) S.particles.push({ x: t.cx + (Math.random() - 0.5) * 22, y: topY + Math.random() * 20, vx: (Math.random() - 0.5) * 80, vy: -40, life: 0.5, max: 0.5, type: 'spark', color: '#b6ff4d', size: 3, grav: true });
        for (const h of live) if (rectHit(h, t.cx - 16, topY, 32, t.floorY - topY) && !(h.hitCd.get(t.id) > S.time)) {
          damage(h, 60, t, 'dissolved'); h.hitCd.set(t.id, S.time + 0.4);
          // the blast throws heroes up and kills their jump — straight back into the pit
          if (h.alive && !h.heavy) { h.vy = -380; h.vx *= 0.2; h.stunT = 0.5; h.grounded = false; }
        }
      }
      break;
    }
    case 'lavaball': {
      if (!on) { t.state = 'hidden'; t.by = t.floorY; break; }
      if (t.state !== 'jump') {
        t.state = 'hidden';
        t.timer -= dt;
        if (t.timer <= 0) {
          const rise = (t.pit ? t.floorY - t.pit.top * T : 0) + 3.2 * T;
          t.state = 'jump'; t.by = t.floorY; t.bvy = -Math.sqrt(2 * GRAVITY * 0.9 * rise);
          if (onScreen(t.cx, t.floorY)) play('fireball', { vol: 0.6 });
        }
      } else {
        t.bvy += GRAVITY * 0.9 * dt;
        t.by += t.bvy * dt;
        if (Math.random() < dt * 30) S.particles.push({ x: t.cx + (Math.random() - 0.5) * 10, y: t.by + 8, vx: 0, vy: 30, life: 0.4, max: 0.4, type: 'ember', color: '#ffb347', size: 3 });
        for (const h of live) if (circleHit(h, t.cx, t.by, 14)) { damage(h, 70, t, 'burnt'); burn(h, 1.2); h.hitCd.set(t.id, S.time + 0.8); }
        if (t.by >= t.floorY && t.bvy > 0) { t.state = 'hidden'; t.timer = 1.5; t.by = t.floorY; }
      }
      break;
    }
    case 'flamethrower': {
      t.timer = (t.timer + dt) % 3.2;
      const prev = t.state;
      t.state = t.timer < 1.6 ? 'off' : t.timer < 2.0 ? 'warn' : 'on';
      if (!on) { t.state = 'off'; break; }
      const [z0, z1] = trapZone(t);
      if (t.state === 'on') {
        if (prev !== 'on' && S.screen === 'wave' && onScreen(t.cx, t.cy)) play('fire');
        if (Math.random() < dt * 40) S.particles.push({ x: t.cx + t.face * (14 + Math.random() * 3 * T), y: t.cy + (Math.random() - 0.5) * 14, vx: t.face * 60, vy: -30, life: 0.35, max: 0.35, type: 'ember', color: '#ffb347', size: 3 });
        for (const h of live) if (rectHit(h, z0, t.cy - 14, z1 - z0, 28)) { damage(h, 45, t, 'burnt'); burn(h, 1.2); h.hitCd.set(t.id, S.time + 0.3); }
      }
      break;
    }
    case 'roller': {
      t.rot += t.dir * dt * 6;
      if (!on) break;
      t.sx += t.dir * 110 * dt;
      if (t.sx > t.maxX) { t.sx = t.maxX; t.dir = -1; }
      if (t.sx < t.minX) { t.sx = t.minX; t.dir = 1; }
      for (const h of live) if (rectHit(h, t.sx - 22, t.floorY - 26, 44, 26) && !absorb(h, t)) {
        damage(h, 90, t, 'rolled'); h.hitCd.set(t.id, S.time + 0.8);
        if (h.alive && !h.heavy) { h.vx = t.dir * 200; h.vy = -260; h.stunT = 0.3; h.grounded = false; }
        play('wheel', { vol: 0.7 });
      }
      break;
    }
    case 'crusher': {
      if (t.state === 'rising') { t.y -= 70 * dt; if (t.y <= t.ceilY) { t.y = t.ceilY; t.state = 'armed'; } break; }
      if (t.state === 'down') { t.timer -= dt; if (t.timer <= 0) t.state = 'rising'; break; }
      if (!on) break;
      if (t.state === 'armed') {
        for (const h of live) if (inLane(h, t) && Math.abs(h.x + h.w / 2 - t.cx) < 22) { t.state = 'trigger'; t.timer = 0.18; break; }
      } else if (t.state === 'trigger') {
        t.timer -= dt;
        if (t.timer <= 0) { t.state = 'falling'; t.vy = 200; }
      } else if (t.state === 'falling') {
        t.vy += 3600 * dt;
        t.y += t.vy * dt;
        for (const h of live) {
          if (!rectHit(h, t.cx - 18, t.y, 36, 40)) continue;
          if (absorb(h, t)) break;
          damage(h, 220, t, 'crushed'); h.hitCd.set(t.id, S.time + 1);
        }
        if (t.state === 'falling' && t.y + 40 >= t.floorY) {
          t.y = t.floorY - 40; t.state = 'down'; t.timer = 0.7;
          S.shake = Math.max(S.shake, 6);
          if (onScreen(t.cx, t.floorY)) play('crush');
          for (let i = 0; i < 6; i++) S.particles.push({ x: t.cx + (Math.random() - 0.5) * 40, y: t.floorY - 4, vx: (Math.random() - 0.5) * 120, vy: -40, life: 0.5, max: 0.5, type: 'smoke', color: '#9a96a8', size: 4 });
        }
      }
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
      const base = t.pit ? t.pit.top * T : t.floorY;
      const live2 = live.filter((h) => Math.abs(h.x + h.w / 2 - t.cx) < (t.pit ? 44 : 30) && h.y + h.h <= base + 6 && h.y + h.h > base - 4 * T);
      if (!t.pit) for (const h of live) if (h.grounded && rectHit(h, t.x, t.floorY - 8, T, 8)) h.wade = true;
      if (!on) break;
      t.timer -= dt;
      if (t.state === 'ready') {
        t.lunge = Math.max(0, t.lunge - dt * 200);
        if (live2.length) { t.state = 'lunge'; t.timer = 0.16; play('splash', { vol: 0.8 }); for (let i = 0; i < 8; i++) S.particles.push({ x: t.cx + (Math.random() - 0.5) * 30, y: t.floorY - 6, vx: (Math.random() - 0.5) * 120, vy: -150 - Math.random() * 120, life: 0.6, max: 0.6, type: 'spark', color: '#7fc8ff', size: 3, grav: true }); }
      } else if (t.state === 'lunge') {
        t.lunge = t.reach * (1 - Math.max(0, t.timer) / 0.16);
        t.jaw = 1;
        if (t.timer <= 0) { t.state = 'hold'; t.timer = 0.14; }
      } else if (t.state === 'hold') {
        t.jaw = Math.max(0, t.timer / 0.14);
        if (t.timer <= 0) { t.state = 'down'; t.timer = 0.3; play('chomp'); }
      } else if (t.state === 'down') {
        t.lunge = t.reach * Math.max(0, t.timer / 0.3);
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
          if (t.kind === 'cage' && !h.heavy) {
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
    } else if (b.kind === 'harrow') {
      b.x += b.vx * dt; b.y += b.vy * dt;
      const t = b.target;
      if (t && Math.hypot(b.x - t.cx, b.y - (t.kind === 'bomb' ? t.floorY - 20 : t.kind === 'spikeball' ? t.cy : t.ceilY + 20)) < 22) {
        b.dead = true;
        if (trapActive(t) && t.state === 'armed') {
          if (t.kind === 'bomb') { t.state = 'lit'; t.timer = 0.25; }
          else if (t.kind === 'spikeball') t.disabledT = 4;
          else { t.state = 'trigger'; t.timer = 0.05; }
          for (let i = 0; i < 5; i++) spark(b.x, b.y, '#ffe9a8');
          play('clang', { vol: 0.5 });
        }
        continue;
      }
      if (b.life <= 0 || solidPx(b.x, b.y)) { b.dead = true; continue; }
      continue;
    } else {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if ((b.kind === 'fireball' || b.kind === 'iceball') && Math.random() < dt * 40) S.particles.push({ x: b.x, y: b.y, vx: -b.vx * 0.1, vy: -b.vy * 0.1, life: 0.3, max: 0.3, type: 'fire', color: b.kind === 'fireball' ? '#ffb347' : '#bfefff', size: 4 });
      if (solidPx(b.x + Math.sign(b.vx) * b.r, b.y) || solidPx(b.x, b.y) || b.life <= 0) { b.dead = true; poof(b.x, b.y, 4); continue; }
    }
    for (const h of S.heroes) {
      if (!h.alive || !circleHit(h, b.x, b.y, b.r)) continue;
      if (b.kind === 'log') {
        if (b.hit.has(h.id)) continue;
        b.hit.add(h.id);
        if (absorb(h, b)) { b.dead = true; break; }
        if (!h.heavy) { h.vx = Math.sign(b.vx) * 140; h.vy = -280; h.stunT = 0.35; h.grounded = false; }
        damage(h, 90, b, 'flattened');
        continue;
      }
      if (b.kind === 'harrow') continue;
      if (b.kind === 'ball' && absorb(h, b)) { b.dead = true; break; }
      if (b.kind === 'fireball') { damage(h, 60, b, 'burnt'); burn(h, 1.6); play('fire', { vol: 0.5 }); }
      else if (b.kind === 'iceball') { damage(h, 25, b, 'frozen'); freeze(h, 1.6); play('freeze'); for (let i = 0; i < 6; i++) spark(b.x, b.y, '#bfefff'); }
      else if (b.kind === 'arrow') { if (absorb(h, b)) { b.dead = true; break; } damage(h, 45, b, 'shot'); }
      else if (b.kind === 'ball') { if (!h.heavy) { h.vx = Math.sign(b.vx) * 160; h.vy = -260; h.stunT = 0.3; h.grounded = false; } damage(h, 110, b, 'blasted'); }
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
/** The keeper's face. Stronger feelings (sad, angry) are not interrupted by a quick laugh. */
function mood(m, t, prio = 1) {
  if (S.mood !== 'idle' && S.moodT > 0 && (S.moodPrio || 0) > prio) return;
  if (S.mood !== m) S.moodStart = S.time;
  S.mood = m; S.moodT = t; S.moodPrio = prio;
}
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
  if (S.moodT > 0 && (S.moodT -= dt) <= 0) { S.mood = 'idle'; S.moodPrio = 0; }
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
    updateBridges(dt);
    for (const h of S.heroes) updateHero(h, dt);
    S.heroes = S.heroes.filter((h) => !h.gone);
    // little footsteps from whoever is walking on screen
    S.stepT -= dt;
    if (S.stepT <= 0) {
      S.stepT = 0.26;
      if (S.heroes.some((h) => h.alive && h.grounded && Math.abs(h.vx) > 20 && onScreen(h.x, h.y))) {
        const set = S.theme.sprites ? ['stepc1', 'stepc2'] : S.theme.snow ? ['steps1', 'steps2'] : ['step1', 'step2'];
        play(set[Math.random() < 0.5 ? 0 : 1]);
      }
    }
    if (S.hp <= 0) {
      S.screen = 'lose'; mood('sad', 99, 9); say(tx('My treasure… noooo!'), 4);
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

function text(str, x, y, size, color = '#fff', align = 'center', weight = 700, maxW) {
  g.font = `${weight} ${size}px ${FONT}`;
  g.textAlign = align;
  g.textBaseline = 'middle';
  if (!/^#[2-5]a/.test(color) && color !== INK) {
    g.lineWidth = Math.max(3, size / 5);
    g.strokeStyle = 'rgba(15,10,30,.85)';
    g.lineJoin = 'round';
    g.strokeText(str, x, y, maxW);
  }
  g.fillStyle = color;
  g.fillText(str, x, y, maxW);
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

function bat(x, y, s, p) {
  const f = Math.sin(S.time * 14 + p) * 0.8;
  g.fillStyle = '#120a1c';
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(x - s * 0.5, y - s * (0.2 + f * 0.4), x - s, y + s * 0.1 - f * s * 0.3);
  g.quadraticCurveTo(x - s * 0.6, y + s * 0.05, x - s * 0.3, y + s * 0.2);
  g.lineTo(x, y + s * 0.12);
  g.lineTo(x + s * 0.3, y + s * 0.2);
  g.quadraticCurveTo(x + s * 0.6, y + s * 0.05, x + s, y + s * 0.1 - f * s * 0.3);
  g.quadraticCurveTo(x + s * 0.5, y - s * (0.2 + f * 0.4), x, y);
  g.fill();
  g.beginPath(); g.arc(x, y + 2, s * 0.16, 0, 7); g.fill();
}

function drawSky() {
  const th = S.theme;
  if (th.sprites) {
    g.fillStyle = th.sky[0]; g.fillRect(0, TOP, W, VIEW_H);
    if (th.fluid === 'lava') {
      const grd = g.createLinearGradient(0, TOP, 0, BAR);
      grd.addColorStop(0, 'rgba(255,90,20,0)'); grd.addColorStop(1, 'rgba(255,90,20,.28)');
      g.fillStyle = grd; g.fillRect(0, TOP, W, VIEW_H);
    }
    return;
  }
  const grd = g.createLinearGradient(0, TOP, 0, BAR);
  grd.addColorStop(0, th.sky[0]);
  grd.addColorStop(1, th.sky[1]);
  g.fillStyle = grd;
  g.fillRect(0, TOP, W, VIEW_H);
  if (th.stars) {
    g.fillStyle = '#fff';
    for (const s of S.stars) { g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(S.time * 1.5 + s.p)); g.fillRect(s.x, TOP + s.y, 2, 2); }
    g.globalAlpha = 1;
    if (th.spooky) {
      // a big orange Halloween moon
      const glow = g.createRadialGradient(1040, TOP + 110, 30, 1040, TOP + 110, 160);
      glow.addColorStop(0, 'rgba(255,170,60,.45)'); glow.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = glow; g.fillRect(860, TOP, 360, 300);
      g.fillStyle = '#ffb347'; g.beginPath(); g.arc(1040, TOP + 110, 62, 0, 7); g.fill();
      g.fillStyle = 'rgba(200,110,30,.45)';
      for (const [dx, dy, r] of [[-20, -14, 12], [18, 10, 9], [-6, 26, 7], [26, -22, 6]]) { g.beginPath(); g.arc(1040 + dx, TOP + 110 + dy, r, 0, 7); g.fill(); }
    } else { g.fillStyle = '#fff6d6'; g.beginPath(); g.arc(1060, TOP + 90, 34, 0, 7); g.fill(); }
  } else if (th.sun) {
    const glow = g.createRadialGradient(1080, TOP + 100, 20, 1080, TOP + 100, 150);
    glow.addColorStop(0, 'rgba(255,250,200,.9)'); glow.addColorStop(1, 'rgba(255,220,120,0)');
    g.fillStyle = glow; g.fillRect(920, TOP, 320, 280);
    g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(1080, TOP + 100, 48, 0, 7); g.fill();
  } else {
    g.fillStyle = 'rgba(255,255,230,.8)'; g.beginPath(); g.arc(1080, TOP + 90, 40, 0, 7); g.fill();
  }
  hills(th, S.cam.x, TOP, BAR, W);
  if (th.spooky) for (const b of S.bats) {
    const x = ((b.x + S.time * b.s) % (W + 80)) - 40, y = TOP + b.y + Math.sin(S.time * 2 + b.p) * 14;
    bat(x, y, 16, b.p);
  }
}

/** Falling snow / drifting embers in front of the scenery (screen space). */
function drawWeather() {
  const th = S.theme;
  if (th.snow) {
    g.fillStyle = 'rgba(255,255,255,.85)';
    for (const f of S.flakes) {
      const y = (f.y + S.time * 30 * f.s) % VIEW_H, x = (f.x + Math.sin(S.time + f.p) * 20 - S.cam.x * 0.3 * f.s / 2) % W;
      g.beginPath(); g.arc((x + W) % W, TOP + y, f.s, 0, 7); g.fill();
    }
  }
  if (th.embers) {
    for (const f of S.flakes.slice(0, 40)) {
      const y = VIEW_H - ((f.y + S.time * 40 * f.s) % VIEW_H), x = (f.x + Math.sin(S.time * 2 + f.p) * 16 + W) % W;
      g.fillStyle = `rgba(255,${120 + (f.p * 20 | 0)},40,${0.35 + 0.4 * Math.abs(Math.sin(S.time * 3 + f.p))})`;
      g.fillRect(x, TOP + y, 2.5, 2.5);
    }
  }
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
  if (v === 4) return drawBridgeTile(c, r);
  if (v === 5) return drawCrate(c, r);
  if (th.sprites) {
    const top = r > 0 && !solidAt(c, r - 1);
    const im = IMG[top || v === 2 ? 'tile_floor' : 'tile_wall'];
    if (im) g.drawImage(im, x, y, T, T);
    if (!top && v !== 2) { g.fillStyle = 'rgba(10,8,20,.35)'; g.fillRect(x, y, T, T); }
    if (th.tint) { g.fillStyle = th.tint; g.fillRect(x, y, T, T); }
    if (th.moss && top && (c * 7 + r) % 3 === 0) { g.fillStyle = '#4f9a3a'; g.fillRect(x + 4, y, 14 + (c % 3) * 6, 4); g.fillRect(x + 8, y + 4, 4, 5 + (c % 4)); }
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

function drawBridgeTile(c, r) {
  const x = c * T, y = r * T;
  const b = S.bridges.find((b) => b.cells.some(([cc, rr]) => cc === c && rr === r));
  const ice = b?.type === 'ice', fade = b ? Math.min(1, b.t) : 1;
  g.save();
  g.globalAlpha = fade;
  if (ice) {
    g.fillStyle = 'rgba(200,240,255,.9)'; g.strokeStyle = '#7cc6ec'; g.lineWidth = 2;
    roundRect(x, y + 2, T, 14, 4); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(x + 6, y + 5, 12, 3);
  } else {
    g.strokeStyle = '#3f8a2a'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(x, y + 8); g.quadraticCurveTo(x + T / 2, y + 14, x + T, y + 8); g.stroke();
    g.fillStyle = '#7bdc4a';
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(x + 8 + i * 12, y + 14 + (i % 2) * 3, 5, 3, 0.5, 0, 7); g.fill(); }
  }
  g.restore();
}

/** Water, lava, goo… in every pit. Drawn in front of heroes so they sink into it. */
function drawPits() {
  const fl = FLUID[S.theme.fluid];
  if (!fl) return;
  for (const p of S.pits) {
    const x0 = p.c0 * T, x1 = (p.c1 + 1) * T, y = p.y, bottom = worldH() + 4;
    if (fl.glow) {
      const grd = g.createLinearGradient(0, y - 60, 0, y);
      grd.addColorStop(0, fl.glow + '0)'); grd.addColorStop(1, fl.glow + '.35)');
      g.fillStyle = grd; g.fillRect(x0, y - 60, x1 - x0, 60);
    }
    const grd = g.createLinearGradient(0, y, 0, bottom);
    grd.addColorStop(0, fl.body); grd.addColorStop(1, fl.deep);
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(x0, bottom);
    for (let x = x0; x <= x1; x += 4) g.lineTo(x, y + Math.sin(S.time * 3 + x * 0.12) * 2.2);
    g.lineTo(x1, bottom);
    g.closePath(); g.fill();
    g.strokeStyle = fl.top; g.lineWidth = 3;
    g.beginPath();
    for (let x = x0; x <= x1; x += 4) g.lineTo(x, y + Math.sin(S.time * 3 + x * 0.12) * 2.2);
    g.stroke();
    g.fillStyle = fl.foam;
    for (let i = 0; i < (p.c1 - p.c0 + 1) * 2; i++) {
      const fx = x0 + ((S.time * 14 + i * 23) % (x1 - x0 - 8)) + 2;
      g.fillRect(fx, y + 6 + (i % 3) * 7, 7, 2);
    }
    if (S.theme.fluid === 'lava' || S.theme.fluid === 'toxic') {
      // bubbles popping
      for (let i = 0; i <= p.c1 - p.c0; i++) {
        const k = (S.time * 0.8 + i * 0.37 + p.c0 * 0.13) % 1;
        g.fillStyle = fl.top; g.globalAlpha = 1 - k;
        g.beginPath(); g.arc(x0 + 12 + i * T + (k * 10), y - k * 10, 3 + k * 3, 0, 7); g.fill();
        g.globalAlpha = 1;
      }
    }
    if (S.theme.fluid === 'icewater') {
      g.fillStyle = 'rgba(240,250,255,.9)'; g.strokeStyle = '#9ccbf2'; g.lineWidth = 1.5;
      for (let i = 0; i <= p.c1 - p.c0; i++) { const fx = x0 + 8 + i * T + Math.sin(S.time + i) * 4; roundRect(fx, y - 3, 16, 6, 2); g.fill(); g.stroke(); }
    }
  }
}

function pumpkin(x, y, seed) {
  const s = 1 + (seed % 3) * 0.12;
  g.save(); g.translate(x, y); g.scale(s, s);
  const glow = g.createRadialGradient(0, -10, 2, 0, -10, 34);
  glow.addColorStop(0, 'rgba(255,170,50,.35)'); glow.addColorStop(1, 'rgba(255,170,50,0)');
  g.fillStyle = glow; g.fillRect(-34, -44, 68, 68);
  g.fillStyle = '#ff8a1a'; g.strokeStyle = INK; g.lineWidth = 2.5;
  g.beginPath(); g.ellipse(-6, -10, 9, 10, 0, 0, 7); g.ellipse(6, -10, 9, 10, 0, 0, 7); g.ellipse(0, -10, 9, 11, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#3f8a2a'; g.fillRect(-2, -25, 4, 6);
  const lit = 0.75 + Math.sin(S.time * 8 + seed) * 0.25;
  g.fillStyle = `rgba(255,${200 + 40 * lit | 0},80,${lit})`;
  g.beginPath(); g.moveTo(-8, -14); g.lineTo(-4, -10); g.lineTo(-10, -9); g.fill();
  g.beginPath(); g.moveTo(8, -14); g.lineTo(4, -10); g.lineTo(10, -9); g.fill();
  g.beginPath(); g.moveTo(-9, -5); g.lineTo(9, -5); g.lineTo(5, -1); g.lineTo(0, -4); g.lineTo(-5, -1); g.fill();
  g.restore();
}
function gravestone(x, y, seed) {
  const tilt = ((seed % 5) - 2) * 0.05;
  g.save(); g.translate(x, y); g.rotate(tilt);
  g.fillStyle = '#8a86a0'; g.strokeStyle = INK; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-12, 0); g.lineTo(-12, -22); g.arc(0, -22, 12, Math.PI, 0); g.lineTo(12, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#5c5873'; g.font = `700 9px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RIP', 0, -20);
  g.restore();
}
function cactus(x, y) {
  g.fillStyle = '#4fa33a'; g.strokeStyle = INK; g.lineWidth = 2.5;
  roundRect(x - 6, y - 38, 12, 38, 6); g.fill(); g.stroke();
  roundRect(x - 18, y - 28, 9, 16, 4); g.fill(); g.stroke();
  roundRect(x + 9, y - 32, 9, 18, 4); g.fill(); g.stroke();
}
function snowPine(x, y) {
  g.fillStyle = '#2f6a5a'; g.strokeStyle = INK; g.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 20 + i * 4, y - 6 - i * 14); g.lineTo(x, y - 30 - i * 14); g.lineTo(x + 20 - i * 4, y - 6 - i * 14); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = '#fff';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 8 + i * 2, y - 22 - i * 14); g.lineTo(x, y - 30 - i * 14); g.lineTo(x + 8 - i * 2, y - 22 - i * 14); g.closePath(); g.fill(); }
  g.fillStyle = '#6b4a2a'; g.fillRect(x - 3, y - 6, 6, 6);
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

/** A cartoon castle tower. `inside(x, wallTop)` draws whoever stands on the wall walk,
 *  behind the front battlements. */
function castleArt(x, y, th, s = 1, inside) {
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
  g.strokeStyle = th.castleDark; g.lineWidth = 2;
  for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x - w / 2 + 4, y - i * 20 * s); g.lineTo(x + w / 2 - 4, y - i * 20 * s); g.stroke(); }
  g.fillStyle = '#3a2a3f'; g.strokeStyle = INK; g.lineWidth = 4 * s;
  g.beginPath(); g.moveTo(x - 22 * s, y); g.lineTo(x - 22 * s, y - 40 * s); g.arc(x, y - 40 * s, 22 * s, Math.PI, 0); g.lineTo(x + 22 * s, y); g.closePath(); g.fill(); g.stroke();
  g.restore();
  const wallTop = y - h * 0.72;
  if (inside) inside(x, wallTop);
  // front battlements, drawn over the keeper's feet
  g.save();
  g.lineWidth = 4 * s; g.strokeStyle = INK; g.fillStyle = th.castle;
  for (let i = 0; i < 5; i++) { g.fillRect(x - w / 2 + i * 22 * s, wallTop - 12 * s, 14 * s, 14 * s); g.strokeRect(x - w / 2 + i * 22 * s, wallTop - 12 * s, 14 * s, 14 * s); }
  g.fillRect(x - w / 2, wallTop - 2 * s, w, 8 * s);
  g.beginPath(); g.moveTo(x - w / 2, wallTop + 6 * s); g.lineTo(x + w / 2, wallTop + 6 * s); g.stroke();
  g.restore();
  return { x, y: wallTop };
}

function monsterPos() {
  if (!S.goal) return { x: 0, y: 0 };
  const x = S.goal.c * T + T / 2, y = S.goal.r * T + T;
  return S.theme.sprites ? { x, y: y - 40 } : { x, y: y - 150 * 0.72 - 10 };
}

const MOOD_SPRITE = { laugh: 'monster_laugh', celebrate: 'monster_celebrate', sad: 'monster_sad', angry: 'monster_angry', surprised: 'monster_surprised' };
function keeperSprite() {
  if (S.mood === 'idle') return Math.floor(S.time * 1.6) % 5 === 4 ? 'monster_idle2' : 'monster_idle1';
  if (S.mood === 'laugh') return Math.floor(S.time * 8) % 2 ? 'monster_laugh' : 'monster_celebrate';
  return MOOD_SPRITE[S.mood] || 'monster_idle1';
}

/** The keeper stands on the castle and reacts to everything that happens.
 *  (x, y) = its feet; hgt = sprite height. */
function drawKeeper(x, y, hgt, bubbleScale = 1) {
  const m = keeperSprite();
  const happy = S.mood === 'laugh' || S.mood === 'celebrate';
  const since = S.time - (S.moodStart || 0);
  let bounce = Math.sin(S.time * 3) * 1.5, shake = 0, sx = 1, sy = 1;
  if (happy) { bounce = Math.abs(Math.sin(S.time * 14)) * 6; sy = 1 + Math.sin(S.time * 28) * 0.03; }
  if (S.mood === 'sad') { bounce = -2; sy = 0.96; }
  if (S.mood === 'angry') { shake = Math.sin(S.time * 45) * 2.2; sx = 1.04; }
  if (S.mood === 'surprised') bounce = since < 0.25 ? Math.sin(since / 0.25 * Math.PI) * 12 : 0;
  const tint = S.mood === 'angry' && Math.floor(S.time * 6) % 2 ? '#ff3b3b' : null;
  const fx = x + shake, fy = y - bounce;
  spr(m, fx, fy, hgt, { sx, sy, tint });
  // face landmarks (the sprite's eyes and mouth), used for tears and the speech tail
  const eyeY = fy - hgt * 0.6, mouthX = fx + hgt * 0.05, mouthY = fy - hgt * 0.36;
  g.save();
  if (S.mood === 'sad') {
    for (const [dx, ph] of [[-0.14, 0], [0.18, 0.5]]) {
      const k = (S.time * 1.4 + ph) % 1;
      g.globalAlpha = 1 - k;
      g.fillStyle = '#5ab8ff'; g.strokeStyle = '#1d4f94'; g.lineWidth = 1.5;
      const tx = fx + dx * hgt, ty = eyeY + 4 + k * hgt * 0.5;
      g.beginPath(); g.moveTo(tx, ty - 6); g.quadraticCurveTo(tx + 4, ty, tx, ty + 3); g.quadraticCurveTo(tx - 4, ty, tx, ty - 6); g.fill(); g.stroke();
    }
  } else if (S.mood === 'angry') {
    for (const side of [-1, 1]) {
      const k = (S.time * 1.8 + (side > 0 ? 0.5 : 0)) % 1;
      g.globalAlpha = (1 - k) * 0.8;
      g.fillStyle = '#eef0f5';
      g.beginPath(); g.arc(fx + side * hgt * (0.32 + k * 0.2), fy - hgt * (0.95 + k * 0.4), 5 + k * 7, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    text('💢', fx + hgt * 0.42, fy - hgt * 0.9, 16 * bubbleScale, '#ff3b3b');
  } else if (S.mood === 'laugh') {
    const k = (S.time * 1.5) % 1;
    g.globalAlpha = 1 - k;
    text(tx(Math.floor(S.time * 1.5) % 2 ? 'HA!' : 'HA HA!'), fx + hgt * (0.55 + k * 0.2), fy - hgt * (0.7 + k * 0.4), 14 * bubbleScale, '#ffd34d');
  } else if (S.mood === 'surprised') {
    text('!', fx + hgt * 0.36, fy - hgt * 1.02 - Math.abs(Math.sin(S.time * 10)) * 4, 26 * bubbleScale, '#ffd34d');
  } else if (S.mood === 'celebrate') {
    for (let i = 0; i < 6; i++) {
      const k = (S.time * 0.9 + i / 6) % 1;
      g.globalAlpha = 1 - k;
      g.fillStyle = ['#ff6b6b', '#ffd34d', '#6ee7b7', '#7b5cff', '#ff7ab8', '#5ab8ff'][i];
      g.fillRect(fx + Math.sin(i * 2.3) * hgt * 0.7, fy - hgt * 1.1 + k * hgt * 0.8, 5, 5);
    }
  }
  g.restore();
  if (S.speech) {
    const k = Math.min(1, S.speech.t * 6), a = Math.min(1, (S.speech.dur - S.speech.t) * 4);
    const sc = k * bubbleScale;
    g.save();
    g.globalAlpha = Math.max(0, a);
    g.font = `700 ${16 * sc}px ${FONT}`;
    const w = g.measureText(S.speech.text).width + 24 * sc, bh = 34 * sc;
    // the bubble floats up-left; its tail points right at the keeper's mouth
    const bx = mouthX - hgt * 0.55 - w, by = fy - hgt * 1.05 - bh;
    g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 3;
    roundRect(bx, by, w, bh, 14 * sc); g.fill(); g.stroke();
    g.beginPath();
    g.moveTo(bx + w - 26 * sc, by + bh - 2); g.lineTo(mouthX - hgt * 0.16, mouthY); g.lineTo(bx + w - 8 * sc, by + bh - 2);
    g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.fillRect(bx + w - 25 * sc, by + bh - 5, 16 * sc, 5);
    g.fillStyle = S.mood === 'sad' ? '#3a6bd6' : S.mood === 'angry' ? '#d63a3a' : INK;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(S.speech.text, bx + w / 2, by + bh / 2 + 1);
    g.restore();
  }
}

function drawCastle() {
  const th = S.theme;
  const x = S.goal.c * T + T / 2, y = S.goal.r * T + T;
  if (!th.sprites) {
    castleArt(x, y, th, 1, (kx, wallTop) => drawKeeper(kx, wallTop - 5, 66));
    spr('chest', x, y + 1, 40);
  } else {
    g.fillStyle = '#3a2c4f'; g.strokeStyle = INK; g.lineWidth = 3;
    roundRect(x - 22, y - 24, 44, 24, 4); g.fill(); g.stroke();
    spr('chest', x, y - 20, 34);
    drawKeeper(x, y - 46, 56);
  }
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
    else if (d.ch === 'p') pumpkin(x, y, d.c);
    else if (d.ch === 'g') gravestone(x, y, d.c);
    else if (d.ch === 'k') S.theme.sun ? cactus(x, y) : S.theme.snow ? snowPine(x, y) : bush(x, y);
  }
  for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) { const v = S.grid[r][cc]; if (v) drawTile(v, cc, r); }
  if (S.door) drawSpawn();
  if (S.goal) drawCastle();
}

function drawCroc(t) {
  const x = t.cx, base = t.floorY;
  if (!t.pit) {
    // the pond
    g.fillStyle = '#2f7fd1'; g.strokeStyle = INK; g.lineWidth = 3;
    roundRect(t.x + 1, base - 9, T - 2, 10, 4); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 2; i++) g.fillRect(t.x + 6 + ((S.time * 18 + i * 17) % 26), base - 7, 6, 2);
  }
  const L = t.lunge || 0;
  g.save();
  const reach = (t.reach || 2.4 * T) + 60;
  g.beginPath(); g.rect(t.x - 30, base - reach, T + 60, reach - (t.pit ? -2 : 6)); g.clip();
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
    case 'spikes': sprW(S.theme.spikes || 'trap_spikes', t.cx, t.floorY + 2, T - 2); break;
    case 'spear': {
      g.save();
      g.beginPath(); g.rect(t.x - 10, t.floorY - 80, T + 20, 80 - 6); g.clip();
      const up = ghost ? 1 : t.up || 0;
      if (t.state === 'warn') g.translate((Math.random() - 0.5) * 2, 0);
      sprPart('x_spear', 0, 0, 1, 0.82, t.cx, t.floorY - 6 + (1 - up) * 44, T - 2);
      g.restore();
      sprPart('x_spear', 0, 0.8, 1, 1, t.cx, t.floorY + 2, T - 2);
      break;
    }
    case 'launchpad': sprW('x_pad_red', t.cx, t.floorY + 2, T * 0.86, { sy: 1 - Math.max(0, t.squish || 0) * 0.35 }); break;
    case 'roller': sprW('x_spikelog', ghost ? t.cx : t.sx, t.floorY + 2, 50, { flip: t.dir < 0, rot: Math.sin(S.time * 12) * 0.03 }); break;
    case 'crossbow': sprW('x_crossbow', t.cx, t.cy + 20, 38, { flip: (ghost ? -1 : t.face) < 0 }); break;
    case 'lavaball': {
      if (ghost || t.state !== 'jump') {
        g.fillStyle = 'rgba(255,140,40,.55)';
        g.beginPath(); g.ellipse(t.cx, t.floorY + 1, 14 + Math.sin(S.time * 6 + t.c) * 2, 4, 0, 0, 7); g.fill();
        if (ghost) sprW('x_lavaball', t.cx, t.floorY - 6, 28, { center: true });
      } else {
        const grd = g.createRadialGradient(t.cx, t.by, 4, t.cx, t.by, 30);
        grd.addColorStop(0, 'rgba(255,160,40,.5)'); grd.addColorStop(1, 'rgba(255,160,40,0)');
        g.fillStyle = grd; g.fillRect(t.cx - 30, t.by - 30, 60, 60);
        sprW('x_lavaball', t.cx, t.by, 30, { center: true, rot: S.time * 4, flip: t.bvy > 0 });
      }
      break;
    }
    case 'geyser': {
      const topY = (t.pit ? t.pit.top * T : t.floorY) - 2.4 * T;
      if (t.state === 'on' && !dis) {
        const wob = Math.sin(S.time * 20) * 2;
        const grd = g.createLinearGradient(0, topY, 0, t.floorY);
        grd.addColorStop(0, 'rgba(200,255,120,.95)'); grd.addColorStop(1, 'rgba(90,200,40,.95)');
        g.fillStyle = grd; g.strokeStyle = '#2f7a1a'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(t.cx - 11 + wob, t.floorY); g.lineTo(t.cx - 9 - wob, topY + 12); g.quadraticCurveTo(t.cx, topY - 8, t.cx + 9 + wob, topY + 12); g.lineTo(t.cx + 11 - wob, t.floorY); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(t.cx - 4 + wob, topY + 16, 3, t.floorY - topY - 24);
      }
      sprW(t.state === 'warn' ? 'x_acid_spout' : 'x_acid_idle', t.cx, t.floorY + 10, T + 4, { alpha: t.pit ? 0.95 : 1 });
      break;
    }
    case 'flamethrower': {
      const f = ghost ? -1 : t.face;
      const on = t.state === 'on' && !dis, warn = t.state === 'warn' && !dis;
      if (on || warn) {
        const len = on ? 3.2 * T * (0.94 + Math.random() * 0.08) : 18;
        const x0 = t.cx + f * 14;
        const grd = g.createLinearGradient(x0, 0, x0 + f * len, 0);
        grd.addColorStop(0, 'rgba(255,240,150,.95)'); grd.addColorStop(0.5, 'rgba(255,140,30,.9)'); grd.addColorStop(1, 'rgba(255,60,20,0)');
        g.fillStyle = grd;
        g.beginPath(); g.moveTo(x0, t.cy - 5); g.quadraticCurveTo(x0 + f * len * 0.5, t.cy - 18, x0 + f * len, t.cy - 4); g.lineTo(x0 + f * len, t.cy + 4); g.quadraticCurveTo(x0 + f * len * 0.5, t.cy + 18, x0, t.cy + 5); g.closePath(); g.fill();
      }
      const onFloor = solidAt(t.c, t.r + 1);
      sprPart('x_flamethrower', 0, 0, 0.44, 1, t.cx, onFloor ? t.floorY + 2 : t.cy + 18, 30, { flip: f < 0 });
      break;
    }
    case 'crusher': {
      const y = ghost ? t.ceilY : t.y ?? t.ceilY;
      g.strokeStyle = '#3b3f4a'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(t.cx - 10, t.ceilY); g.lineTo(t.cx - 10, y + 4); g.moveTo(t.cx + 10, t.ceilY); g.lineTo(t.cx + 10, y + 4); g.stroke();
      const jit = t.state === 'trigger' ? (Math.random() - 0.5) * 4 : 0;
      sprPart('x_crusher', 0, 0, 1, 0.5, t.cx + jit, y + 42, T + 2);
      break;
    }
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
    case 'pendulum': {
      const a = ghost ? 0.5 : axeAngle(t);
      const ex = t.cx + Math.sin(a) * t.len, ey = t.ceilY + Math.cos(a) * t.len;
      g.strokeStyle = '#3b3f4a'; g.lineWidth = 3; g.setLineDash([5, 3]);
      g.beginPath(); g.moveTo(t.cx, t.ceilY); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#2a2d36'; g.fillRect(t.cx - 6, t.ceilY - 2, 12, 6);
      sprPart('x_pend_ball', 0.05, 0.45, 0.95, 1, ex, ey, 40, { center: true, rot: -a });
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
  if (t.iced > 0 && !ghost) {
    const y = TRAPS[t.kind].mount === 'ceiling' ? t.ceilY : t.pit ? t.floorY - 26 : TRAPS[t.kind].mount === 'floor' ? t.floorY - 34 : t.cy - 18;
    g.globalAlpha = Math.min(0.6, t.iced);
    g.fillStyle = '#c9f1ff'; g.strokeStyle = '#fff'; g.lineWidth = 2;
    roundRect(t.x + 2, y, T - 4, 34, 6); g.fill(); g.stroke();
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
    if (b.kind === 'arrow' || b.kind === 'harrow') {
      const a = Math.atan2(b.vy, b.vx);
      g.save(); g.translate(b.x, b.y); g.rotate(a);
      g.strokeStyle = '#6b4a2a'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(-16, 0); g.lineTo(8, 0); g.stroke();
      g.fillStyle = '#c9ced8'; g.strokeStyle = INK; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(14, 0); g.lineTo(6, -5); g.lineTo(6, 5); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = b.kind === 'harrow' ? '#4fa33a' : '#d9443c';
      g.beginPath(); g.moveTo(-16, 0); g.lineTo(-20, -5); g.lineTo(-12, 0); g.lineTo(-20, 5); g.closePath(); g.fill();
      g.restore();
      continue;
    }
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
  if (h.C.frames === 5) {
    if (!h.alive) return h.deadT < 0.28 ? p + '_walk3' : p + '_dizzy';
    if (h.actT > 0 || h.castT > 0 || h.swingT > 0) return p + (Math.floor(S.time * 8) % 2 ? '_act1' : '_act2');
    if (h.freezeT > 0) return p + '_walk1';
    if (!h.grounded) return p + '_walk3';
    if (h.action === 'wait' && Math.abs(h.vx) < 1) return p + '_walk1';
    return `${p}_walk${1 + (Math.floor(h.anim * (h.action === 'dash' ? 14 : 9)) % 5)}`;
  }
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
  if (h.ring) {
    g.save();
    g.globalAlpha = 1 - h.ring.t / 0.6;
    g.strokeStyle = h.ring.color; g.lineWidth = 4;
    g.beginPath(); g.ellipse(x, h.y + h.h, 20 + h.ring.t * 150, 6 + h.ring.t * 40, 0, 0, 7); g.stroke();
    g.restore();
  }
  if (h.glideT > 0 && !h.grounded && h.alive) {
    // the broom
    g.strokeStyle = '#8b5a2b'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x - 20 * h.dir, h.y + h.h - 4); g.lineTo(x + 18 * h.dir, h.y + h.h - 8); g.stroke();
    g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(x - 20 * h.dir, h.y + h.h - 4); g.lineTo(x - 32 * h.dir, h.y + h.h - 12); g.lineTo(x - 32 * h.dir, h.y + h.h + 4); g.closePath(); g.fill();
  }
  let tint = null;
  if (h.flashT > 0 || (!h.alive && h.deadT < 0.28)) tint = '#ff1e1e';
  else if (h.rage && Math.floor(S.time * 5) % 2) tint = '#ff5a3a';
  else if (h.freezeT > 0) tint = '#7fd8ff';
  else if (h.burnT > 0 && Math.floor(S.time * 14) % 2) tint = '#ff8a1a';
  const jitter = !h.alive && h.deadT < 0.28 ? (Math.random() - 0.5) * 4 : 0;
  spr(heroSprite(h), x + jitter, y + bob, h.C.draw, { flip: h.dir < 0, rot: h.alive || h.deadT < 0.28 ? tilt : Math.sin(h.spin) * 0.6, tint });
  if (h.freezeT > 0 && h.alive) {
    g.fillStyle = 'rgba(190,240,255,.35)'; g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2;
    roundRect(h.x - 4, h.y - 8, h.w + 8, h.h + 10, 6); g.fill(); g.stroke();
  }
  if (h.hpShowT > 0 && h.alive) {
    const k = Math.max(0, h.hp / h.maxHp);
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
  if (!S.selected) {
    // show that floating platforms are ceilings for hanging traps
    if (S.screen === 'build') {
      g.strokeStyle = 'rgba(255,215,140,.55)'; g.fillStyle = 'rgba(255,215,140,.55)'; g.lineWidth = 2;
      const c0 = Math.max(1, Math.floor(S.cam.x / T)), c1 = Math.min(S.cols - 2, Math.ceil((S.cam.x + W / S.cam.z) / T));
      for (let cc = c0; cc <= c1; cc++) for (let rr = 1; rr < S.rows - 1; rr++) {
        const v = S.grid[rr - 1][cc];
        if ((v === 2 || v === 3) && !S.grid[rr][cc] && !trapAtCell(cc, rr) && canPlace('rock', cc, rr) && (cc + rr) % 2 === 0) {
          const x = cc * T + T / 2, y = rr * T;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 7); g.arc(x - 3, y + 10, 3, 0, Math.PI); g.stroke();
        }
      }
    }
    return;
  }
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
  drawPits();
  drawParticles();
  if (S.showHeat) drawHeat();
  drawGhost();
  g.restore();
  g.save(); g.beginPath(); g.rect(0, TOP, W, VIEW_H); g.clip(); drawWeather(); g.restore();
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
  const fl = FLUID[S.theme.fluid];
  if (fl) for (const p of S.pits) { b.fillStyle = fl.body; b.fillRect(p.c0 * T * MM.k, p.y * MM.k, (p.c1 - p.c0 + 1) * T * MM.k, MM.h - p.y * MM.k); }
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
/** Lighten (k > 0) or darken (k < 0) a #rrggbb colour. */
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
/** Chunky, beveled game buttons. */
function button(id, x, y, w, h, label, o = {}) {
  const hot = S.hover && S.hover.x >= x && S.hover.x <= x + w && S.hover.y >= y && S.hover.y <= y + h;
  buttons.push({ id, x, y, w, h, ...o });
  const base = o.disabled ? '#4a4660' : o.active ? '#ffad5c' : o.color || '#2c2645';
  const press = hot && !o.disabled ? 2 : 0, fh = h - 5, r = Math.min(12, h / 3);
  g.save();
  g.fillStyle = 'rgba(0,0,0,.35)'; roundRect(x + 1, y + 4, w, h, r); g.fill();
  g.fillStyle = shade(base, -0.42); roundRect(x, y, w, h, r); g.fill();
  const grd = g.createLinearGradient(0, y + press, 0, y + press + fh);
  grd.addColorStop(0, shade(base, hot && !o.disabled ? 0.18 : 0.08)); grd.addColorStop(1, base);
  g.fillStyle = grd; roundRect(x, y + press, w, fh, r); g.fill();
  if (!o.disabled) { g.fillStyle = 'rgba(255,255,255,.16)'; roundRect(x + 4, y + press + 3, w - 8, fh * 0.36, r * 0.7); g.fill(); }
  g.strokeStyle = o.active ? '#fff3e0' : 'rgba(10,6,20,.85)'; g.lineWidth = 2.5;
  roundRect(x, y, w, h, r); g.stroke();
  g.restore();
  const cy = y + fh / 2 + press;
  if (o.icon) spr(o.icon, x + (label ? 26 : w / 2), cy + (o.iconH || 24) / 2, o.iconH || 24);
  if (label) text(label, x + (o.icon ? w / 2 + 14 : w / 2), cy, o.size || 18, o.disabled ? '#9a95b5' : o.active || o.dark ? '#2a1400' : '#fff', 'center', 700, o.icon ? w - 52 : w - 14);
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
  else if (k === 'spikes') sprW(S.theme.spikes || 'trap_spikes', x, y, 40);
  else if (ICON[k]) { const im = IMG[ICON[k]]; if (im?.width) spr(ICON[k], x, y, Math.min(40, (40 / im.width) * im.height * (im.height > im.width ? 0.85 : 1))); }
  else if (IMG['trap_' + k]) sprW('trap_' + k, x, y, 40);
  else drawTrap(fake, false);
  g.restore();
}

function drawHUD() {
  g.fillStyle = '#0d0a18'; g.fillRect(0, 0, W, TOP);
  g.fillStyle = 'rgba(255,122,26,.3)'; g.fillRect(0, TOP - 2, W, 2);
  button('menu', 12, 14, 48, 44, '❚❚', { size: 16 });
  spr(keeperSprite(), 100, 66 + Math.sin(S.time * 3) * 2, 56, { tint: S.mood === 'angry' && Math.floor(S.time * 6) % 2 ? '#ff3b3b' : null });
  const L = LEVELS[S.levelIndex];
  const box = (x, label, val, w = 110) => {
    g.fillStyle = '#05040a'; roundRect(x, 10, w, 52, 8); g.fill();
    text(tx(label), x + w / 2, 22, 12, '#c9c3e6', 'center', 600, w - 6);
    text(val, x + w / 2, 45, 22, '#fff');
  };
  box(140, 'Wave', `${Math.min(L.waves, Math.max(1, S.wave + (S.screen === 'build' ? 1 : 0)))}/${L.waves}`);
  const remaining = S.screen === 'wave' ? S.spawnQueue.length + S.heroes.filter((h) => h.alive).length : S.nextWave.length;
  box(256, S.screen === 'wave' ? 'Remaining' : 'Inbound', String(remaining));
  g.fillStyle = '#05040a'; roundRect(372, 10, 112, 52, 8); g.fill();
  spr('coin', 398, 47, 24);
  text(String(S.coins), 418, 36, 22, '#ffe07a', 'left');
  text(tx('Traps {a}/{b}', { a: S.traps.length, b: maxTraps() }), 500, 24, 14, S.traps.length >= maxTraps() ? '#ff9d9d' : '#ffe9cf', 'left', 600);
  text(tx('Hero Brain IQ {n}', { n: brain.iq(BRAIN_KINDS.length) }), 500, 48, 14, '#9fe3ff', 'left', 600, 145);
  button('brain', 652, 14, 96, 44, tx('Brain'), { icon: 'gem', iconH: 22, active: S.showBrain, size: 15 });
  button('heat', 754, 14, 72, 44, tx('Heat'), { active: S.showHeat, size: 15 });
  button('music', 832, 14, 48, 44, sound.music ? '♫' : '♫̸', { size: 18, active: sound.music });
  button('sfx', 886, 14, 48, 44, sound.sfx ? '🔊' : '🔇', { size: 16 });
  text(tx('Castle'), 1103, 17, 13, '#c9c3e6', 'center', 600);
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
      text(tx(info.name), x + 56, BAR + 32, 14, sel ? '#2a1400' : afford ? '#fff' : '#9a95b5', 'left', 700, 80);
      if (free) text(tx('FREE!'), x + 58, BAR + 55, 14, sel ? '#2a1400' : '#9dff9d', 'left');
      else { spr('coin', x + 64, BAR + 64, 15); text(String(price), x + 75, BAR + 55, 14, sel ? '#2a1400' : '#ffe07a', 'left'); }
      const fav = k !== 'block' && brain.favourite(k);
      if (fav && !free) { g.fillStyle = sel ? 'rgba(90,44,0,.25)' : 'rgba(159,227,255,.15)'; roundRect(x + 100, BAR + 46, 44, 18, 9); g.fill(); text(tx(fav), x + 122, BAR + 55, 10, sel ? '#5a2c00' : '#9fe3ff', 'center', 600); }
      text(String(i + 1), x + 142, BAR + 22, 11, sel ? '#5a2c00' : '#77729a', 'right', 600);
    });
    button('reroll', 806, BAR + 12, 112, 64, tx('Restock 3'), { disabled: S.coins < 3, size: 15 });
    button('sell', 924, BAR + 12, 84, 64, tx('Sell'), { active: S.sellMode, size: 16 });
    button('start', 1014, BAR + 12, 254, 64, tx('START WAVE ▶'), { color: '#e8641a', size: 22 });
    if (S.selected) {
      const fav = S.selected !== 'block' && brain.favourite(S.selected);
      text(tx(TRAPS[S.selected].tip) + (fav ? tx('  ·  Heroes have learned to {action} it', { action: tx(fav).toUpperCase() }) : ''), W / 2, BAR - 18, 15, '#ffe9cf', 'center', 700, W - 30);
    }
  } else if (S.screen === 'wave') {
    button('speed', 12, BAR + 14, 90, 60, `${S.speed}×`, { size: 20 });
    button('follow', 110, BAR + 14, 120, 60, tx('Follow'), { active: S.cam.follow, size: 16 });
    const st = S.waveStats;
    text(tx('Killed {a}/{b}', { a: st.killed, b: st.total }), 260, BAR + 44, 20, '#9dff9d', 'left');
    text(tx('Damage taken {n}', { n: st.damage }), 470, BAR + 44, 18, '#ff9d9d', 'left', 600, 230);
    text(tx('Drag or WASD to look around · Z/X or wheel to zoom · H heatmap'), 1250, BAR + 44, 14, '#9fe3ff', 'right', 500, 540);
  }
}

/** Rewarded-ad offers shown while building. */
function drawAdOffers() {
  if (S.screen !== 'build') return;
  let y = (minimapShown() ? MM.y + MM.h + 22 : TOP + 22);
  const x = 12;
  if (!S.slotsAdUsed) { button('ad:slots', x, y, 190, 40, tx('+2 Trap slots'), { color: '#4a2f78', size: 14 }); adBadge(x + 150, y - 9); y += 52; }
  if (!S.crateUsed && !S.freeTrap) { button('ad:crate', x, y, 190, 40, tx('🎁 Lucky Crate'), { color: '#4a2f78', size: 14 }); adBadge(x + 150, y - 9); }
}

function drawNextUp() {
  const counts = {};
  for (const c of S.nextWave) counts[c] = (counts[c] || 0) + 1;
  const all = CLASS_ORDER.filter((c) => counts[c]);
  const rows = all.length > 7 ? all.sort((a, b) => counts[b] - counts[a]).slice(0, 6) : all;
  const more = all.length - rows.length;
  if (more) rows.push('more');
  const x = W - 262, y = TOP + 12, w = 250, h = 112 + rows.length * 30;
  panel(x, y, w, h, tx('NEXT UP · INBOUND'));
  rows.forEach((c, i) => {
    const yy = y + 52 + i * 30;
    if (c === 'more') { text(tx('+ {n} more hero types', { n: more }), x + 46, yy, 14, '#c9c3e6', 'left', 600); return; }
    spr(c + '_walk1', x + 26, yy + 14, 28);
    text(tx(CLASSES[c].name), x + 46, yy, 15, '#fff', 'left', 600, 150);
    text(String(counts[c]), x + w - 16, yy, 16, '#ffd7a8', 'right');
  });
  const py = y + 58 + rows.length * 30;
  g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 14, py - 8, w - 28, 1);
  text(tx('Payout'), x + 16, py + 12, 14, '#c9c3e6', 'left', 600);
  text(tx('+{n} base · 1–3 per kill', { n: 10 + (S.wave + 1) * 2 }), x + w - 16, py + 12, 13, '#ffe07a', 'right', 600, 150);
  text(tx('Perfect wave bonus +8'), x + w - 16, py + 34, 12, '#9dff9d', 'right', 500, 220);
}

function drawBrainPanel() {
  const n = BRAIN_KINDS.length, half = Math.ceil(n / 2);
  const x = 12, y = TOP + 8, colW = 300, w = colW * 2 + 24, rowH = 24, h = 112 + half * rowH + 48;
  panel(x, y, w, h, tx('Hero Guild Brain v2'));
  text(tx('IQ {iq}  ·  {s} situations  ·  {m} memories  ·  {g} hero tactics', { iq: brain.iq(n), s: brain.states(), m: brain.memory.length, g: brain.groups() }), x + w - 16, y + 22, 12, '#9fe3ff', 'right', 600, 360);
  text(tx('Learns per trap, per hero type, and spots trap combos. Studies old fights between waves;'), x + 16, y + 46, 12, '#c9c3e6', 'left', 500, w - 32);
  text(tx('at traps that keep killing them, heroes try brand-new tricks (danger sense).'), x + 16, y + 64, 12, '#c9c3e6', 'left', 500, w - 32);
  BRAIN_KINDS.forEach((k, i) => {
    const col = i < half ? 0 : 1, row = i % half;
    const xx = x + 12 + col * (colW + 4), yy = y + 92 + row * rowH;
    iconTrap(k, xx + 14, yy + 14, 0.42);
    const m = brain.mastery[k];
    text(tx(TRAPS[k].name), xx + 34, yy + 2, 12, '#fff', 'left', 700, 104);
    const pct = m ? m.ema : 0;
    g.fillStyle = '#2c2645'; roundRect(xx + 140, yy - 2, 70, 8, 4); g.fill();
    g.fillStyle = pct > 0.7 ? '#ff6b6b' : pct > 0.35 ? '#ffc04d' : '#6ee7b7';
    roundRect(xx + 140, yy - 2, Math.max(4, 70 * pct), 8, 4); g.fill();
    text(m ? `${Math.round(pct * 100)}% ${brain.favourite(k) ? tx(brain.favourite(k)) : ''}` : tx('unseen'), xx + colW - 10, yy + 2, 11, '#c9c3e6', 'right', 500);
  });
  button('resetbrain', x + 16, y + h - 44, w - 32, 32, tx('Wipe hero memory'), { size: 13, color: '#3a2440' });
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
  text(title, W / 2, 210, 56, color, 'center', 700, W - 60);
  if (sub) text(sub, W / 2, 274, 20, '#e8e3ff', 'center', 500, W - 60);
  btns.forEach((b, i) => button(b.id, W / 2 - 150, 320 + i * 70, 300, 56, b.label, { color: b.color, size: 21 }));
}

function drawPause() {
  drawOverlay(tx('Paused'), null, [{ id: 'resume', label: tx('Resume'), color: '#e8641a' }, { id: 'retry', label: tx('Restart level') }, { id: 'quit', label: tx('Main menu') }]);
  button('music', W / 2 - 150, 540, 145, 46, tx(sound.music ? 'Music: ON' : 'Music: OFF'), { size: 15, active: sound.music });
  button('sfx', W / 2 + 5, 540, 145, 46, tx(sound.sfx ? 'Sound: ON' : 'Sound: OFF'), { size: 15, active: sound.sfx });
}

function drawSummary() {
  const st = S.waveStats;
  g.fillStyle = 'rgba(30,40,110,.86)'; g.fillRect(0, TOP, W, VIEW_H);
  const e = Math.min(1, S.summaryT * 3);
  g.save(); g.translate(W / 2, TOP + 90); g.scale(0.6 + e * 0.4, 0.6 + e * 0.4);
  text(tx('WAVE COMPLETE'), 0, 0, 72, '#fff', 'center', 700, 1000);
  g.restore();
  text(`${Math.round(st.rate * 100 * Math.min(1, S.summaryT * 1.5))}%`, 330, TOP + 240, 110, '#ffd34d');
  text(tx('KILL RATE'), 330, TOP + 320, 22, '#fff');
  if (st.better != null) text(tx('{n}% vs last wave', { n: `${st.better >= 0 ? '+' : ''}${Math.round(st.better * 100)}` }), 330, TOP + 354, 18, st.better >= 0 ? '#9dff9d' : '#ff9d9d', 'center', 600);
  text(tx('{n} Killed', { n: st.killed }), W / 2, TOP + 215, 32, '#fff');
  g.fillStyle = '#fff'; g.fillRect(W / 2 - 110, TOP + 240, 220, 3);
  text(tx('{n} Total', { n: st.total }), W / 2, TOP + 268, 32, '#fff');
  text(String(st.damage), 950, TOP + 240, 110, st.damage ? '#ff6b6b' : '#9dff9d');
  text(tx('DAMAGE TAKEN'), 950, TOP + 320, 22, '#fff');
  text(tx(st.perfect ? 'PERFECT WAVE! +8' : 'Lost perfect wave'), 950, TOP + 354, 18, st.perfect ? '#9dff9d' : '#ff9d9d', 'center', 600);
  text(tx('Payout +{n} coins', { n: st.payout * (S.doubled ? 2 : 1) }) + (S.doubled ? tx('  (doubled!)') : ''), W / 2, TOP + 350, 22, '#ffe07a');
  if (S.replayed) text(tx('🧠 The hero guild studied {n} old fights', { n: S.replayed }), W / 2, TOP + 388, 15, '#9fe3ff', 'center', 600);
  if (S.summaryT > 0.8) {
    if (!S.doubled) { button('ad:double', W / 2 - 290, TOP + 420, 280, 60, tx('Double payout +{n}', { n: st.payout }), { color: '#6b3fb0', size: 19 }); adBadge(W / 2 - 60, TOP + 410); }
    button('continue', S.doubled ? W / 2 - 140 : W / 2 + 10, TOP + 420, 280, 60, tx('Continue ▶'), { color: '#e8641a', size: 22 });
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
  text(tx('Loading the dungeon… {n}%', { n: Math.round(S.loadP * 100) }), W / 2, 500, 18, '#e8e3ff', 'center', 600);
  const tips = ['Tip: a Spring right before a pit sends heroes flying.', 'Tip: heroes learn — swap your traps when they get smart.', 'Tip: Spike Balls can float anywhere in the air.', 'Tip: the Croc snaps at heroes who try to jump over it.'];
  text(tx(tips[Math.floor(S.time / 2.5) % tips.length]), W / 2, 560, 16, '#9fe3ff', 'center', 500);
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
  const saved = { mood: S.mood, speech: S.speech, start: S.moodStart };
  const mi = Math.floor(S.time / 1.8) % 6;
  S.mood = ['idle', 'laugh', 'celebrate', 'idle', 'laugh', 'surprised'][mi];
  S.moodStart = Math.floor(S.time / 1.8) * 1.8;
  if (!S.titleSpeech || S.time - S.titleSpeech > 4) { S.titleSpeech = S.time; S.speech = { text: LAUGHS[Math.floor(S.time) % LAUGHS.length], t: 0, dur: 2 }; S.menuSpeech = S.speech; }
  S.speech = S.menuSpeech && S.time - S.titleSpeech < 2 ? { ...S.menuSpeech, t: S.time - S.titleSpeech } : null;
  castleArt(1080, groundY, THEMES.meadow, 1.25, (kx, wallTop) => drawKeeper(kx, wallTop - 7, 84, 1.1));
  S.mood = saved.mood; S.speech = saved.speech; S.moodStart = saved.start;
  const parade = ['hero', 'archer', 'knight', 'witch', 'barb', 'icemage', 'thief', 'orc', 'wizard', 'paladin', 'firemage', 'assassin', 'druid', 'viking', 'darkknight'];
  for (let i = 0; i < 8; i++) {
    const x = ((S.time * 80 + i * 150) % (W + 300)) - 150;
    if (x > 990) continue;
    const p = parade[(i + Math.floor((S.time * 80 + i * 150) / (W + 300)) * 3) % parade.length];
    const n = CLASSES[p].frames;
    spr(`${p}_walk${1 + (Math.floor(S.time * 10 + i) % n)}`, x, groundY - Math.abs(Math.sin(S.time * 12 + i)) * 3, 50);
  }
  // logo
  g.save();
  g.translate(470, 150);
  g.rotate(Math.sin(S.time * 1.5) * 0.02);
  text('TINY DUNGEON', 0, -34, 70, '#ff8a2a');
  text('KEEPER', 0, 36, 84, '#ffd34d');
  g.restore();
  text(tx('Build the traps. The heroes learn. Outsmart them.'), 470, 240, 19, INK, 'center', 600, 620);
  // seasonal ribbon
  g.save();
  g.translate(150, 40); g.rotate(-0.08 + Math.sin(S.time * 3) * 0.02);
  g.fillStyle = '#ff7a1a'; g.strokeStyle = INK; g.lineWidth = 3;
  roundRect(-118, -20, 236, 40, 12); g.fill(); g.stroke();
  text(tx('🎃 NEW: Halloween Night!'), 0, 0, 17, '#fff', 'center', 700, 220);
  g.restore();
  const next = Math.min(progress.unlocked - 1, LEVELS.length - 1);
  button('play', 320, 290, 300, 72, tx('▶  PLAY  ·  Level {n}', { n: next + 1 }), { color: '#e8641a', size: 26 });
  button('menu:levels', 320, 376, 300, 54, tx('Levels'), { color: '#3a2a5a', size: 20 });
  button('menu:settings', 320, 442, 145, 50, tx('Settings'), { color: '#2c2645', size: 17 });
  button('menu:credits', 475, 442, 145, 50, tx('Credits'), { color: '#2c2645', size: 17 });
  text(tx('Hero Brain IQ {n} · heroes remember your traps', { n: brain.iq(BRAIN_KINDS.length) }), 470, 520, 15, INK, 'center', 600);
  if (S.menu === 'levels') drawLevelSelect();
  if (S.menu === 'settings') drawSettings();
  if (S.menu === 'credits') drawCredits();
}

/** A tiny picture of a level for its card. */
const thumbs = {};
function levelThumb(i, w, h) {
  if (thumbs[i]) return thumbs[i];
  const L = LEVELS[i], th = THEMES[L.theme];
  const rows = L.map.length, cols = L.map[0].length;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const b = c.getContext('2d');
  const grd = b.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, th.sky[0]); grd.addColorStop(1, th.sky[1]);
  b.fillStyle = grd; b.fillRect(0, 0, w, h);
  const k = Math.max(w / cols, h / rows);
  const ox = (w - cols * k) / 2, oy = h - rows * k;
  const fluid = th.fluid && FLUID[th.fluid];
  for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
    const ch = L.map[r][cc];
    const x = ox + cc * k, y = oy + r * k;
    if (ch === '#' || ch === 'B' || ch === 'S') {
      b.fillStyle = th.sprites ? (L.map[r - 1]?.[cc] && L.map[r - 1][cc] !== '#' ? '#8d88b5' : '#5d5980') : ch === 'B' ? th.brick : ch === 'S' ? th.stone : r > 0 && L.map[r - 1][cc] !== '#' ? th.top : th.dirt;
      b.fillRect(x, y, k + 0.6, k + 0.6);
    } else if (fluid && L.map[rows - 1][cc] === '.' && r >= rows - 3) { b.fillStyle = fluid.body; b.fillRect(x, y, k + 0.6, k + 0.6); }
    if (ch === 'D') { b.fillStyle = '#8b5a2b'; b.fillRect(x - k * 0.3, y - k * 0.6, k * 1.6, k * 1.6); }
    if (ch === 'C') { b.fillStyle = th.castle || '#ffcf4d'; b.fillRect(x - k, y - k * 2.5, k * 3, k * 3.5); b.fillStyle = th.roof || '#ff7a1a'; b.fillRect(x - k, y - k * 3, k * 3, k * 0.8); }
    if (th.tint && (ch === '#' || ch === 'S')) { b.fillStyle = th.tint; b.fillRect(x, y, k + 0.6, k + 0.6); }
  }
  if (th.spooky) { b.fillStyle = '#ffb347'; b.beginPath(); b.arc(w * 0.82, h * 0.25, h * 0.14, 0, 7); b.fill(); }
  if (th.snow) { b.fillStyle = '#fff'; for (let n = 0; n < 18; n++) b.fillRect((n * 37) % w, (n * 23) % (h * 0.7), 2, 2); }
  thumbs[i] = c;
  return c;
}

function woodFrame(x, y, w, h) {
  g.save();
  g.fillStyle = 'rgba(0,0,0,.45)'; roundRect(x + 6, y + 10, w, h, 26); g.fill();
  const wood = g.createLinearGradient(0, y, 0, y + h);
  wood.addColorStop(0, '#a8682e'); wood.addColorStop(1, '#7a4520');
  g.fillStyle = wood; roundRect(x, y, w, h, 26); g.fill();
  g.strokeStyle = '#3a1e0a'; g.lineWidth = 5; g.stroke();
  // planks and grain
  g.strokeStyle = 'rgba(60,30,10,.35)'; g.lineWidth = 2;
  for (let yy = y + 26; yy < y + h; yy += 26) { g.beginPath(); g.moveTo(x + 8, yy); g.lineTo(x + w - 8, yy); g.stroke(); }
  // dark inner board
  g.fillStyle = '#21162e'; roundRect(x + 22, y + 22, w - 44, h - 44, 16); g.fill();
  g.strokeStyle = '#3a1e0a'; g.lineWidth = 4; g.stroke();
  // bolts
  g.fillStyle = '#e0b04a'; g.strokeStyle = '#5a3418'; g.lineWidth = 2;
  for (const [bx, by] of [[x + 11, y + 11], [x + w - 11, y + 11], [x + 11, y + h - 11], [x + w - 11, y + h - 11]]) { g.beginPath(); g.arc(bx, by, 6, 0, 7); g.fill(); g.stroke(); }
  g.restore();
}

function ribbon(cx, cy, w, label) {
  g.save();
  g.fillStyle = '#9a1f1f'; g.strokeStyle = '#3a0a0a'; g.lineWidth = 3;
  for (const sd of [-1, 1]) {
    g.beginPath();
    g.moveTo(cx + sd * (w / 2 - 20), cy - 12); g.lineTo(cx + sd * (w / 2 + 40), cy - 12); g.lineTo(cx + sd * (w / 2 + 22), cy + 10); g.lineTo(cx + sd * (w / 2 + 40), cy + 32); g.lineTo(cx + sd * (w / 2 - 20), cy + 32);
    g.closePath(); g.fill(); g.stroke();
  }
  const grd = g.createLinearGradient(0, cy - 26, 0, cy + 26);
  grd.addColorStop(0, '#ff4d3d'); grd.addColorStop(1, '#c42a22');
  g.fillStyle = grd;
  g.beginPath(); g.moveTo(cx - w / 2, cy - 24); g.quadraticCurveTo(cx, cy - 34, cx + w / 2, cy - 24); g.lineTo(cx + w / 2, cy + 22); g.quadraticCurveTo(cx, cy + 12, cx - w / 2, cy + 22); g.closePath(); g.fill(); g.stroke();
  g.restore();
  text(label, cx, cy - 3, 30, '#fff', 'center', 700, w - 30);
}

function drawLevelSelect() {
  g.fillStyle = 'rgba(8,6,16,.72)'; g.fillRect(0, 0, W, H);
  const fx = 70, fy = 40, fw = W - 140, fh = 650;
  woodFrame(fx, fy, fw, fh);
  ribbon(W / 2, fy + 8, 380, tx('Choose a level'));
  const cardW = 200, cardH = 140, gap = 14, x0 = W / 2 - (5 * cardW + 4 * gap) / 2;
  WORLDS.forEach((wd, wi) => {
    const ids = LEVELS.map((L, i) => (L.world === wi ? i : -1)).filter((i) => i >= 0);
    const y = fy + 62 + wi * 184;
    g.fillStyle = wd.color; roundRect(x0, y - 12, 230, 24, 12); g.fill();
    text(tx('World {n} · {name}', { n: wi + 1, name: tx(wd.name) }), x0 + 12, y, 15, '#fff', 'left', 700, 210);
    ids.forEach((i, k) => {
      const L = LEVELS[i];
      const open = i < progress.unlocked;
      const x = x0 + k * (cardW + gap), by = y + 18;
      button('level:' + i, x, by, cardW, cardH, '', { disabled: !open, color: open ? wd.color : undefined });
      const tw = cardW - 20, th = 70;
      g.save();
      roundRect(x + 10, by + 10, tw, th, 8); g.clip();
      g.drawImage(levelThumb(i, tw, th), x + 10, by + 10);
      if (!open) { g.fillStyle = 'rgba(20,14,30,.65)'; g.fillRect(x + 10, by + 10, tw, th); }
      g.restore();
      g.strokeStyle = 'rgba(10,6,20,.8)'; g.lineWidth = 2; roundRect(x + 10, by + 10, tw, th, 8); g.stroke();
      // number badge
      g.fillStyle = open ? '#ffd34d' : '#77729a'; g.strokeStyle = '#3a1e0a'; g.lineWidth = 3;
      g.beginPath(); g.arc(x + 14, by + 12, 15, 0, 7); g.fill(); g.stroke();
      text(String(i + 1), x + 14, by + 12, 16, open ? '#3a1e0a' : '#fff');
      if (!open) text('🔒', x + cardW / 2, by + 45, 26, '#fff');
      text(open ? tx(L.name) : tx('Locked'), x + cardW / 2, by + 96, 15, open ? '#fff' : '#9a95b5', 'center', 700, cardW - 16);
      const st = starsOf(i);
      if (open) text('★★★'.slice(0, st) + '☆☆☆'.slice(0, 3 - st), x + cardW / 2, by + 118, 18, '#ffe07a');
      if (L.theme === 'snow' || L.theme === 'halloween') {
        const tag = tx(L.theme === 'snow' ? '❄ ICE' : '🎃 NEW');
        g.fillStyle = L.theme === 'snow' ? '#5ab8ff' : '#ff7a1a'; roundRect(x + cardW - 64, by + 4, 58, 20, 10); g.fill();
        text(tag, x + cardW - 35, by + 14, 11, '#fff');
      }
    });
  });
  button('menu:close', W / 2 - 110, fy + fh - 54, 220, 50, tx('◀  Back'), { size: 20, color: '#f2b233', dark: true });
}

function drawSettings() {
  g.fillStyle = 'rgba(8,6,16,.7)'; g.fillRect(0, 0, W, H);
  panel(W / 2 - 220, 120, 440, 450);
  text(tx('Settings'), W / 2, 160, 30, '#ffad5c');
  const L = LANGS.find((l) => l.code === getLang());
  button('lang', W / 2 - 160, 440, 320, 56, `🌐 ${tx('Language')}: ${L.name}`, { size: 18, color: '#2f6a8a' });
  button('music', W / 2 - 160, 200, 320, 56, tx(sound.music ? 'Music: ON' : 'Music: OFF'), { size: 19, active: sound.music });
  button('sfx', W / 2 - 160, 280, 320, 56, tx(sound.sfx ? 'Sound effects: ON' : 'Sound effects: OFF'), { size: 19, active: sound.sfx });
  button('resetbrain', W / 2 - 160, 360, 320, 56, tx('Wipe hero memory'), { size: 17, color: '#5a2440' });
  button('menu:close', W / 2 - 100, 512, 200, 46, tx('Back'), { size: 18 });
}

function drawCredits() {
  g.fillStyle = 'rgba(8,6,16,.7)'; g.fillRect(0, 0, W, H);
  panel(W / 2 - 330, 110, 660, 470);
  text(tx('Credits'), W / 2, 150, 30, '#ffad5c');
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
    text(tx(a), W / 2 - 290, 210 + i * 40, 17, '#c9c3e6', 'left', 600, 260);
    text(b, W / 2 + 290, 210 + i * 40, 17, '#fff', 'right', 600);
  });
  button('menu:close', W / 2 - 100, 508, 200, 46, tx('Back'), { size: 18 });
}

function drawTutorial() {
  if (!S.tutorial || S.screen !== 'build' || S.levelIndex !== 0 || S.wave !== 0) return;
  const x = 300, y = TOP + 120, w = 680, h = 180;
  panel(x, y, w, h);
  text(tx('How to play'), x + w / 2, y + 26, 22, '#ffad5c');
  text(tx('1. Pick a trap below (or press 1–5), then click a glowing cell.'), x + 24, y + 62, 15, '#fff', 'left', 500, w - 40);
  text(tx('2. Spike Balls & cannons float in mid-air · Rocks, Axes, Crushers hang under ceilings and platforms.'), x + 24, y + 88, 14, '#fff', 'left', 500, w - 40);
  text(tx('3. Press START WAVE and watch the crowd come. Drag to look around.'), x + 24, y + 114, 15, '#fff', 'left', 500, w - 40);
  text(tx('4. Heroes LEARN from every trap — keep changing your plan!'), x + 24, y + 140, 15, '#fff', 'left', 500, w - 40);
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
    drawOverlay(`${'★'.repeat(S.winStars)}${'☆'.repeat(3 - S.winStars)}  ${tx('Level complete!')}`, tx('{k} heroes defeated · Castle {hp}/100 · Hero Brain IQ {iq}', { k: S.kills, hp: S.hp, iq: brain.iq(BRAIN_KINDS.length) }),
      last ? [{ id: 'retry', label: tx('Play again'), color: '#e8641a' }, { id: 'quit', label: tx('Main menu') }]
           : [{ id: 'next', label: tx('Next level ▶'), color: '#e8641a' }, { id: 'retry', label: tx('Replay') }, { id: 'quit', label: tx('Main menu') }], '#ffe07a');
  }
  if (S.screen === 'lose') drawOverlay(tx('The castle fell!'), tx('The heroes got smarter. Try new trap combos! (wave {n})', { n: S.wave }), [{ id: 'retry', label: tx('Try again'), color: '#e8641a' }, { id: 'quit', label: tx('Main menu') }], '#ff9d9d');
  if (S.adBusy) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H); text(tx('Loading ad…'), W / 2, H / 2, 26, '#fff'); }
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
  if (!canPlace(S.selected, c, r)) {
    if (crowdedAt(S.selected, c, r)) toast(tx('Max 2 {name} traps close together — spread them out!', { name: tx(TRAPS[S.selected].name) }), 2);
    play('error');
    return;
  }
  const price = priceOf(S.selected);
  if (S.coins < price) { toast(tx('Not enough coins'), 1); play('error'); return; }
  if (S.traps.length >= maxTraps()) { toast(tx('Trap limit reached ({n}). Sell one or start the wave.', { n: maxTraps() }), 1.6); play('error'); return; }
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
    case 'lang': {
      const i = LANGS.findIndex((l) => l.code === getLang());
      setLang(LANGS[(i + 1) % LANGS.length].code, true);
      localizePage();
      break;
    }
    case 'menu': if (S.screen !== 'title') { S.paused = !S.paused; pcall(S.paused ? 'gameplayStop' : 'gameplayStart'); } break;
    case 'resume': S.paused = false; if (S.screen === 'wave') pcall('gameplayStart'); break;
    case 'continue': toBuild(); break;
    case 'quit': S.paused = false; brain.save(); await showInterstitial(); S.screen = 'title'; S.menu = null; break;
    case 'retry': S.paused = false; await showInterstitial(); loadLevel(S.levelIndex); break;
    case 'next': await showInterstitial(); loadLevel(Math.min(LEVELS.length - 1, S.levelIndex + 1)); break;
    case 'ad:double':
      if (!S.doubled && await showRewarded()) { S.doubled = true; S.coins += S.waveStats.payout; play('reward'); toast(tx('+{n} coins!', { n: S.waveStats.payout }), 1.5); }
      break;
    case 'ad:slots':
      if (!S.slotsAdUsed && await showRewarded()) { S.slotsAdUsed = true; S.bonusSlots += 2; play('reward'); toast(tx('+2 trap slots for this level!'), 1.8); }
      break;
    case 'ad:crate':
      if (!S.crateUsed && await showRewarded()) {
        S.crateUsed = true;
        S.freeTrap = PREMIUM[(Math.random() * PREMIUM.length) | 0];
        S.selected = S.freeTrap;
        play('reward');
        toast(tx('Lucky Crate: a FREE {name}! Place it anywhere it fits.', { name: tx(TRAPS[S.freeTrap].name) }), 2.6);
      }
      break;
    case 'resetbrain':
      if (confirm(tx("Wipe the heroes' memory? They will forget everything they learned."))) { brain.reset(); toast(tx('Hero memory wiped'), 1.5); }
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

window.__tdk = { S, brain, CLASSES, spawnHero, makeBridge, progress, loadLevel, startWave, makeTrap, canPlace, update, TRAPS, maxTraps, placeBlock, toBuild, LEVELS, onButton };

/** The few HTML texts outside the canvas. */
function localizePage() {
  const r = document.getElementById('rotate');
  if (r) r.textContent = tx('Turn your phone sideways to play 🔄');
}

(async function boot() {
  detectLang();
  localizePage();
  resize();
  requestAnimationFrame(frame);
  pcall('loadingStart');
  await loadAssets();
  // portal SDKs (Playgama, CrazyGames) may know the player's language; give the bridge up to 2s to start
  if (window.bridge?.initialize && !window.bridge.isInitialized) {
    await new Promise((res) => { const t0 = Date.now(); const id = setInterval(() => { if (window.bridge.isInitialized || Date.now() - t0 > 2000) { clearInterval(id); res(); } }, 50); });
  }
  detectLang();
  localizePage();
  pcall('loadingStop');
  pcall('ready');
  document.getElementById('loading')?.remove();
  setTimeout(() => { S.screen = 'title'; }, 300);
  setInterval(() => brain.save(), 5000);
})();
