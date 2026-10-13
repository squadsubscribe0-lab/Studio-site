import { Brain, ACTIONS } from './brain.js';
import { LEVELS } from './levels.js';
import { sfx, sound, unlockAudio } from './audio.js';

/* ───────────────────────── constants ───────────────────────── */
const W = 1280, H = 720;
const T = 40;                 // tile size
const COLS = 32, ROWS = 14;
const TOP = 72;               // level area starts below the HUD
const BAR = TOP + ROWS * T;   // bottom bar y (632)
const GRAVITY = 2000;
const STEP = 1 / 120;         // fixed physics step
const FONT = 'SG, "Trebuchet MS", system-ui, sans-serif';

const TRAPS = {
  spikes: { name: 'Spikes',      price: 15, mount: 'floor',   tip: 'Pointy floor. Jump over it or else!' },
  spring: { name: 'Spring',      price: 10, mount: 'floor',   tip: 'Bounces heroes back — great combo starter.' },
  slime:  { name: 'Slime Pit',   price: 20, mount: 'floor',   tip: 'Sticky goo. Heroes that stay in it sink.' },
  fire:   { name: 'Fire Vent',   price: 25, mount: 'floor',   tip: 'Blasts a tall flame on a timer.' },
  rock:   { name: 'Falling Rock',price: 20, mount: 'ceiling', tip: 'Drops when a hero walks close.' },
  axe:    { name: 'Swing Axe',   price: 30, mount: 'ceiling', tip: 'A pendulum — timing is everything.' },
  wheel:  { name: 'Stone Wheel', price: 35, mount: 'floor',   tip: 'Rolls at heroes. They must jump it.' },
  cage:   { name: 'Drop Cage',   price: 35, mount: 'ceiling', tip: 'Snaps shut on heroes right below.' },
};
const UNLOCK = ['spikes', 'spring', 'slime', 'fire', 'rock', 'axe', 'wheel', 'cage'];

const CLASSES = {
  hero:   { name: 'Adventurer', speed: 100, reward: 4,  steal: 1, w: 22, h: 34, draw: 48 },
  thief:  { name: 'Thief',      speed: 140, reward: 5,  steal: 2, w: 20, h: 32, draw: 46 },
  knight: { name: 'Knight',     speed: 78,  reward: 7, steal: 1, w: 24, h: 36, draw: 52 },
  barb:   { name: 'Barbarian',  speed: 82,  reward: 8, steal: 1, w: 26, h: 36, draw: 52 },
  wizard: { name: 'Wizard',     speed: 90,  reward: 8, steal: 1, w: 22, h: 34, draw: 50 },
};

/* ───────────────────────── canvas & assets ───────────────────────── */
const canvas = document.getElementById('game');
const g = canvas.getContext('2d');
let scale = 1, offX = 0, offY = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth, vh = window.innerHeight;
  scale = Math.min(vw / W, vh / H);
  canvas.style.width = W * scale + 'px';
  canvas.style.height = H * scale + 'px';
  canvas.width = Math.round(W * scale * dpr);
  canvas.height = Math.round(H * scale * dpr);
  offX = (vw - W * scale) / 2;
  offY = (vh - H * scale) / 2;
  canvas.style.left = offX + 'px';
  canvas.style.top = offY + 'px';
  g.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  g.imageSmoothingQuality = 'high';
}
window.addEventListener('resize', resize);

const IMG = {};
async function loadAssets() {
  const meta = await (await fetch('assets/sprites/sprites.json')).json();
  await Promise.all(
    Object.keys(meta).map(
      (n) =>
        new Promise((res) => {
          const im = new Image();
          im.onload = () => res();
          im.onerror = () => res();
          im.src = `assets/sprites/${n}.png`;
          IMG[n] = im;
        }),
    ),
  );
  try {
    const f = new FontFace('SG', 'url(assets/fonts/space-grotesk-latin.woff2)', { weight: '300 700' });
    document.fonts.add(await f.load());
  } catch (e) {}
}

/** Draw a sprite scaled to a given height, anchored bottom-centre at (x, y). */
function spr(name, x, y, h, o = {}) {
  const im = IMG[name];
  if (!im || !im.width) return;
  const s = h / im.height;
  const w = im.width * s;
  g.save();
  g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  if (o.flip) g.scale(-1, 1);
  if (o.sx || o.sy) g.scale(o.sx || 1, o.sy || 1);
  if (o.alpha != null) g.globalAlpha *= o.alpha;
  g.drawImage(im, -w / 2, o.center ? -h / 2 : -h, w, h);
  g.restore();
}
/** Draw a sprite fitted to a width, anchored bottom-centre. */
function sprW(name, x, y, w, o = {}) {
  const im = IMG[name];
  if (!im || !im.width) return;
  spr(name, x, y, (w / im.width) * im.height, o);
}

/* ───────────────────────── game state ───────────────────────── */
const brain = new Brain();
let progress = { unlocked: 1 };
try { progress = JSON.parse(localStorage.getItem('tdk_progress') || 'null') || progress; } catch (e) {}
const saveProgress = () => { try { localStorage.setItem('tdk_progress', JSON.stringify(progress)); } catch (e) {} };

const S = {
  screen: 'title', // title | build | wave | win | lose
  levelIndex: 0,
  grid: [], door: null, chest: null, torches: [],
  traps: [], heroes: [], particles: [], coinsFly: [], toasts: [],
  coins: 0, hearts: 10, wave: 0, kills: 0, stolen: 0,
  spawnQueue: [], spawnT: 0,
  offers: [], selected: null, sellMode: false,
  speed: 1, paused: false, showBrain: false,
  mood: 'idle', moodT: 0, time: 0,
  hover: null, tutorial: true, bg: null,
};
let nextId = 1;

/* ───────────────────────── level helpers ───────────────────────── */
const solidAt = (c, r) => c < 0 || c >= COLS || r >= ROWS ? true : r < 0 ? true : S.grid[r][c];
const solidPx = (x, y) => solidAt(Math.floor(x / T), Math.floor((y - TOP) / T));
const cellX = (c) => c * T;
const cellY = (r) => TOP + r * T;

function loadLevel(i) {
  const L = LEVELS[i];
  S.levelIndex = i;
  S.grid = [];
  S.torches = [];
  L.map.forEach((row, r) => {
    if (row.length !== COLS) console.warn('row length', r, row.length);
    S.grid.push([...row].map((ch, c) => {
      if (ch === 'D') S.door = { c, r };
      if (ch === 'C') S.chest = { c, r };
      if (ch === 't') S.torches.push({ c, r });
      return ch === '#';
    }));
  });
  S.traps = [];
  S.heroes = [];
  S.particles = [];
  S.coinsFly = [];
  S.coins = 110 + i * 30;
  S.hearts = 10;
  S.wave = 0;
  S.kills = 0;
  S.stolen = 0;
  S.selected = null;
  S.sellMode = false;
  S.screen = 'build';
  rollOffers(true);
  buildBackground();
  toast(`Level ${i + 1}: ${L.name}`, 2.5);
}

function floorBelow(c, r) {
  for (let rr = r; rr < ROWS; rr++) if (solidAt(c, rr)) return cellY(rr);
  return cellY(ROWS);
}

function unlockedKinds() {
  const n = Math.min(UNLOCK.length, 3 + S.levelIndex * 2 + S.wave);
  return UNLOCK.slice(0, n);
}

function rollOffers(free) {
  const pool = unlockedKinds().slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  S.offers = pool.slice(0, 4);
  if (S.selected && !S.offers.includes(S.selected)) S.selected = null;
  if (!free) sfx.click();
}

const maxTraps = () => Math.min(16, 6 + S.wave + S.levelIndex);

function canPlace(kind, c, r) {
  if (c < 1 || c >= COLS - 1 || r < 0 || r >= ROWS) return false;
  if (solidAt(c, r)) return false;
  if (S.traps.some((t) => t.c === c && t.r === r)) return false;
  const mount = TRAPS[kind].mount;
  if (mount === 'floor' && !solidAt(c, r + 1)) return false;
  if (mount === 'ceiling') {
    if (!solidAt(c, r - 1)) return false;
    if (solidAt(c, r + 1)) return false; // needs room to swing / drop
  }
  // keep the spawn door and the chest clear
  const fy = mount === 'floor' ? r : Math.round((floorBelow(c, r) - TOP) / T) - 1;
  for (const p of [S.door, S.chest]) if (p && p.r === fy && Math.abs(p.c - c) <= 1) return false;
  return true;
}

function makeTrap(kind, c, r) {
  const t = {
    id: nextId++, kind, c, r,
    x: cellX(c), cx: cellX(c) + T / 2,
    floorY: floorBelow(c, r),
    ceilY: cellY(r),
    state: 'armed', timer: 0, disabledT: 0, broken: false,
    phaseOffset: Math.random(),
  };
  if (kind === 'fire') t.timer = Math.random() * 3;
  if (kind === 'axe') { t.len = 84; t.period = 2.6; t.amp = 1.1; }
  if (kind === 'rock' || kind === 'cage') { t.y = t.ceilY; t.vy = 0; }
  if (kind === 'wheel') { t.wx = t.cx; t.vx = 0; t.rot = 0; }
  if (kind === 'spring') t.squish = 0;
  return t;
}

/* ───────────────────────── waves ───────────────────────── */
function startWave() {
  if (S.screen !== 'build') return;
  S.wave++;
  S.screen = 'wave';
  S.selected = null;
  S.sellMode = false;
  S.tutorial = false;
  const L = S.levelIndex;
  const count = Math.min(30, 3 + Math.round(S.wave * 1.7) + L * 3);
  const pool = ['hero'];
  if (S.wave + L * 3 >= 2) pool.push('thief');
  if (S.wave + L * 3 >= 3) pool.push('knight');
  if (S.wave + L * 3 >= 5) pool.push('barb');
  if (S.wave + L * 3 >= 7) pool.push('wizard');
  S.spawnQueue = [];
  for (let i = 0; i < count; i++) S.spawnQueue.push(i < 2 ? 'hero' : pool[(Math.random() * pool.length) | 0]);
  S.spawnT = 0.6;
  for (const t of S.traps) { t.broken = false; t.disabledT = 0; resetTrap(t); }
  mood('lever', 0.8);
  sfx.lever();
}

function resetTrap(t) {
  t.state = 'armed';
  t.timer = t.kind === 'fire' ? t.timer : 0;
  if (t.kind === 'rock' || t.kind === 'cage') { t.y = t.ceilY; t.vy = 0; t.victim = null; }
  if (t.kind === 'wheel') { t.wx = t.cx; t.vx = 0; }
}

function spawnHero(cls) {
  const C = CLASSES[cls];
  const x = cellX(S.door.c) + T / 2 - C.w / 2;
  const y = cellY(S.door.r) + T - C.h;
  S.heroes.push({
    id: nextId++, cls, C, x, y, w: C.w, h: C.h, vx: 0, vy: 0, dir: 1,
    grounded: false, alive: true, gone: false, anim: Math.random() * 10,
    action: 'go', decisionT: 0, lastKey: null, enc: new Map(),
    slimeT: 0, stunT: 0, springCd: 0, forceGoT: 0,
    shield: cls === 'knight', castT: 0, wizardCd: 1.5, swingT: 0,
    thought: null, thoughtT: 0, deadT: 0, spin: 0, caged: null, life: 0, bounces: 0,
  });
  poof(x + C.w / 2, y + C.h / 2, 8);
}

function endWave() {
  const L = LEVELS[S.levelIndex];
  brain.save();
  if (S.wave >= L.waves) {
    S.screen = 'win';
    progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length, S.levelIndex + 2));
    saveProgress();
    mood('celebrate', 99);
    sfx.win();
    return;
  }
  const bonus = 15 + S.wave * 3;
  S.coins += bonus;
  S.screen = 'build';
  rollOffers(true);
  mood('celebrate', 1.6);
  toast(`Wave ${S.wave} cleared! +${bonus} coins`, 2.2);
  const fresh = unlockedKinds()[unlockedKinds().length - 1];
  if (UNLOCK.indexOf(fresh) === Math.min(UNLOCK.length, 3 + S.levelIndex * 2 + S.wave) - 1 && S.wave + S.levelIndex * 2 <= 5)
    toast(`New trap unlocked: ${TRAPS[fresh].name}!`, 2.6);
}

/* ───────────────────────── hero AI ───────────────────────── */
function heroGroup(h) {
  if (h.cls === 'barb') return 'b';
  if (h.cls === 'knight' && h.shield) return 'k';
  return 'n';
}

function trapZone(t) {
  if (t.kind === 'wheel') return [t.wx - 18, t.wx + 18];
  if (t.kind === 'axe') return [t.cx - 60, t.cx + 60];
  return [t.x + 2, t.x + T - 2];
}

function inLane(h, t) {
  const feet = h.y + h.h;
  return feet <= t.floorY + 6 && feet > t.floorY - 3 * T;
}

function trapActive(t) {
  return !t.broken && t.disabledT <= 0;
}

/** Distance from the hero's front to the trap zone along its walking direction. */
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

function trapPhase(t, h) {
  switch (t.kind) {
    case 'fire': return t.state === 'on' ? 2 : t.state === 'warn' ? 1 : 0;
    case 'axe': {
      const a = axeAngle(t) * h.dir; // + means blade is on the far side
      const v = axeVel(t) * h.dir;
      const pos = Math.min(3, Math.max(0, Math.floor(((a / t.amp + 1) / 2) * 4)));
      return (v > 0 ? 0 : 4) + pos;
    }
    case 'rock':
    case 'cage': return t.state === 'armed' ? 0 : t.state === 'falling' || t.state === 'trigger' ? 1 : 2;
    case 'wheel': return t.state === 'rolling' ? 1 : 0;
    default: return 0;
  }
}

function think(h, dt) {
  // close finished encounters
  for (const [id, e] of h.enc) {
    const t = S.traps.find((x) => x.id === id);
    if (!t) { h.enc.delete(id); continue; }
    const { passed } = aheadDist(h, t);
    if (passed || !inLane(h, t)) {
      if (passed) finishEncounter(h, t, 1 - Math.min(0.5, e.waitT * 0.05));
      else h.enc.delete(id);
    }
  }

  // find the nearest trap ahead
  let best = null, bd = 1e9;
  for (const t of S.traps) {
    if (!trapActive(t) || !inLane(h, t)) continue;
    if (t.kind === 'wheel' && t.state === 'respawn') continue;
    if ((t.kind === 'rock' || t.kind === 'cage') && t.state === 'respawn') continue;
    const { d, passed } = aheadDist(h, t);
    if (passed || d > 130) continue;
    if (d < bd) { bd = d; best = t; }
  }

  if (h.forceGoT > 0) { h.forceGoT -= dt; h.action = 'go'; return; }
  if (!best) { h.action = 'go'; h.lastKey = null; return; }

  const key = brain.key(best.kind, distBucket(bd), trapPhase(best, h), heroGroup(h));
  let e = h.enc.get(best.id);
  if (!e) { e = { steps: [], waitT: 0 }; h.enc.set(best.id, e); }
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
    if (h.action !== 'go' || explore) {
      h.thought = explore ? '?' : '!';
      h.thoughtT = 0.6;
    }
  }
}

function finishEncounter(h, t, reward) {
  const e = h.enc.get(t.id);
  if (!e) return;
  h.enc.delete(t.id);
  if (e.steps.length) brain.learn(e.steps, reward);
  const { before, after } = brain.record(t.kind, reward > 0);
  if (before < 0.7 && after >= 0.7) {
    toast(`Heroes figured out the ${TRAPS[t.kind].name}! Mix it up!`, 3);
    sfx.learn();
    mood('angry', 1.5);
  }
}

/* ───────────────────────── physics ───────────────────────── */
function collideX(h) {
  const top = h.y + 2, bot = h.y + h.h - 2;
  if (h.vx > 0) {
    const edge = h.x + h.w;
    if (solidPx(edge, top) || solidPx(edge, bot) || solidPx(edge, (top + bot) / 2)) {
      h.x = Math.floor(edge / T) * T - h.w - 0.01;
      return true;
    }
  } else if (h.vx < 0) {
    if (solidPx(h.x, top) || solidPx(h.x, bot) || solidPx(h.x, (top + bot) / 2)) {
      h.x = (Math.floor(h.x / T) + 1) * T + 0.01;
      return true;
    }
  }
  return false;
}

function collideY(h) {
  const l = h.x + 2, r = h.x + h.w - 2;
  if (h.vy > 0) {
    const foot = h.y + h.h;
    if (solidPx(l, foot) || solidPx(r, foot)) {
      h.y = TOP + Math.floor((foot - TOP) / T) * T - h.h;
      h.vy = 0;
      h.grounded = true;
      return;
    }
  } else if (h.vy < 0) {
    if (solidPx(l, h.y) || solidPx(r, h.y)) {
      h.y = TOP + (Math.floor((h.y - TOP) / T) + 1) * T + 0.01;
      h.vy = 0;
    }
  }
  h.grounded = false;
}

function updateHero(h, dt) {
  h.anim += dt;
  if (h.thoughtT > 0) h.thoughtT -= dt;
  if (h.castT > 0) h.castT -= dt;
  if (h.swingT > 0) h.swingT -= dt;
  if (h.springCd > 0) h.springCd -= dt;

  if (!h.alive) {
    h.deadT += dt;
    if (h.caged) return;
    h.vy += GRAVITY * 0.6 * dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.spin += dt * 9;
    if (h.deadT > 1.3) h.gone = true;
    return;
  }

  const C = h.C;
  const air = Math.max(150, C.speed * 1.45);

  // safety net: a hero stuck for too long gives up and runs home
  h.life += dt;
  if (h.life > 45) {
    h.alive = false; h.gone = true; h.enc.clear();
    poof(h.x + h.w / 2, h.y + h.h / 2, 10);
    toast(`A ${C.name.toLowerCase()} gave up and ran home!`, 1.5);
    return;
  }

  if (h.stunT > 0) {
    h.stunT -= dt;
    if (h.grounded) h.vx *= Math.pow(0.02, dt);
  } else {
    think(h, dt);
    // wizard dispels the next trap
    if (h.cls === 'wizard') {
      h.wizardCd -= dt;
      if (h.wizardCd <= 0) {
        const t = S.traps.find((t) => trapActive(t) && inLane(h, t) && (({ d, passed }) => !passed && d < 90 && d > -10)(aheadDist(h, t)));
        if (t) {
          t.disabledT = 3;
          h.wizardCd = 7;
          h.castT = 0.6;
          sfx.magic();
          for (let i = 0; i < 14; i++) spark(t.cx, (t.kind === 'axe' || t.kind === 'rock' || t.kind === 'cage') ? t.ceilY + 20 : t.floorY - 14, '#7fd8ff');
        }
      }
    }

    if (h.grounded) {
      const act = h.action;
      let speed = act === 'wait' ? 0 : act === 'dash' ? C.speed * 1.7 : C.speed;
      if (h.castT > 0) speed = 0;
      h.vx = h.dir * speed;
      // navigation: bumps and walls
      if (speed > 0) {
        const probe = h.dir > 0 ? h.x + h.w + 3 : h.x - 3;
        const foot = h.y + h.h - 4;
        if (solidPx(probe, foot)) {
          const free1 = !solidPx(probe, foot - T) && !solidPx(h.x + h.w / 2, h.y - 6);
          if (free1 && !solidPx(probe, foot - T - 4)) {
            h.vy = -620; h.vx = h.dir * air; h.grounded = false;
          } else {
            h.dir = -h.dir; h.vx = 0; h.lastKey = null;
          }
        }
      }
      if (act === 'jump' && h.grounded && h.slimeT <= 0) {
        h.vy = -560;
        h.vx = h.dir * air;
        h.grounded = false;
        sfx.jump();
      }
    }
  }

  // slime
  if (h.inSlime) {
    h.slimeT += dt;
    h.vx *= 0.3;
    if (h.vy < 0) h.vy *= 0.5;
    if (h.slimeT > 1.0) defeat(h, h.inSlime, 'sank');
  } else h.slimeT = 0;
  h.inSlime = null;

  h.vy = Math.min(h.vy + GRAVITY * dt, 950);
  h.x += h.vx * dt;
  collideX(h); // keep pushing forward so a jump can slide up and over a ledge
  h.y += h.vy * dt;
  collideY(h);

  if (h.y > H) defeat(h, null, 'fell');

  // reached the chest?
  const ch = S.chest;
  if (ch && h.alive) {
    const cx = cellX(ch.c) + T / 2, cy = cellY(ch.r) + T;
    if (Math.abs(h.x + h.w / 2 - cx) < 22 && Math.abs(h.y + h.h - cy) < 20) {
      h.alive = false; h.gone = true;
      S.hearts = Math.max(0, S.hearts - C.steal);
      S.stolen++;
      for (const [id] of h.enc) { const t = S.traps.find((x) => x.id === id); if (t) finishEncounter(h, t, 1); }
      poof(cx, cy - 20, 12);
      for (let i = 0; i < 8; i++) spark(cx, cy - 20, '#ffd34d');
      mood('angry', 1.2);
      sfx.steal();
      toast(`${C.name} stole ${C.steal > 1 ? C.steal + ' treasures' : 'treasure'}!`, 1.4);
    }
  }
}

function defeat(h, trap, how) {
  if (!h.alive) return;
  h.alive = false;
  h.deadT = 0;
  h.vx = -h.dir * 70;
  h.vy = -520;
  if (trap) finishEncounter(h, trap, -1);
  for (const [id] of h.enc) h.enc.delete(id);
  S.kills++;
  const reward = h.C.reward;
  S.coins += reward;
  const cx = h.x + h.w / 2, cy = h.y + h.h / 2;
  S.coinsFly.push({ x: cx, y: cy, t: 0, n: reward });
  poof(cx, cy, 10);
  mood(Math.random() < 0.5 ? 'laugh' : 'celebrate', 0.9);
  sfx.defeat();
  if (how === 'caged') { h.caged = trap; h.vy = 0; h.vx = 0; }
}

function rectHit(h, x, y, w, hh) {
  return h.x < x + w && h.x + h.w > x && h.y < y + hh && h.y + h.h > y;
}
function circleHit(h, cx, cy, r) {
  const nx = Math.max(h.x, Math.min(cx, h.x + h.w));
  const ny = Math.max(h.y, Math.min(cy, h.y + h.h));
  return (nx - cx) ** 2 + (ny - cy) ** 2 < r * r;
}

/** Shield / barbarian resistances. Returns true if the hit was absorbed. */
function absorb(h, t) {
  if (h.cls === 'barb' && (t.kind === 'rock' || t.kind === 'cage')) {
    h.swingT = 0.4;
    shatter(t);
    if (t.kind === 'cage') t.broken = true;
    toast('The barbarian smashed it!', 1.2);
    return true;
  }
  if (h.shield && (t.kind === 'axe' || t.kind === 'rock' || t.kind === 'wheel')) {
    h.shield = false;
    h.swingT = 0.45;
    h.stunT = 0.35;
    h.vx = -h.dir * 120;
    h.vy = -200;
    sfx.clang();
    for (let i = 0; i < 8; i++) spark(h.x + h.w / 2 + h.dir * 12, h.y + h.h / 2, '#dfe6ee');
    if (t.kind !== 'axe') shatter(t);
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

const axeAngle = (t) => t.amp * Math.sin((2 * Math.PI * (S.time + t.phaseOffset * t.period)) / t.period);
const axeVel = (t) => Math.cos((2 * Math.PI * (S.time + t.phaseOffset * t.period)) / t.period);

function updateTrap(t, dt) {
  if (t.disabledT > 0) t.disabledT -= dt;
  const live = S.heroes.filter((h) => h.alive);
  const on = trapActive(t);

  switch (t.kind) {
    case 'spikes':
      if (!on) break;
      for (const h of live) if (rectHit(h, t.x + 5, t.floorY - 15, T - 10, 15)) defeat(h, t, 'spiked');
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
        for (const h of live) if (rectHit(h, t.cx - 13, t.floorY - 2.1 * T, 26, 2.1 * T)) defeat(h, t, 'burnt');
      }
      break;
    }

    case 'axe': {
      if (!on) break;
      const a = axeAngle(t);
      const bx = t.cx + Math.sin(a) * t.len, by = t.ceilY + Math.cos(a) * t.len;
      for (const h of live) if (circleHit(h, bx, by, 14) && !absorb(h, t)) defeat(h, t, 'chopped');
      break;
    }

    case 'rock':
    case 'cage': {
      if (t.state === 'respawn') {
        t.timer -= dt;
        if (t.timer <= 0) { t.state = 'armed'; t.y = t.ceilY; }
        break;
      }
      if (t.state === 'landed') {
        t.timer -= dt;
        if (t.victim) t.victim.x = t.cx - t.victim.w / 2;
        if (t.timer <= 0) {
          if (t.victim) { t.victim.gone = true; poof(t.cx, t.floorY - 20, 10); t.victim = null; }
          t.state = 'rising';
        }
        break;
      }
      if (t.state === 'rising') {
        t.y -= 120 * dt;
        if (t.y <= t.ceilY) { t.y = t.ceilY; t.state = 'armed'; }
        break;
      }
      if (!on) break;
      if (t.state === 'armed') {
        for (const h of live) {
          if (!inLane(h, t)) continue;
          const hx = h.x + h.w / 2;
          const trig = t.kind === 'cage' ? Math.abs(hx - t.cx) < 10 : (h.dir > 0 ? t.cx - hx : hx - t.cx);
          if (t.kind === 'cage' ? trig : trig > -6 && trig < 62) { t.state = 'trigger'; t.timer = t.kind === 'cage' ? 0.1 : 0.15; break; }
        }
      } else if (t.state === 'trigger') {
        t.timer -= dt;
        if (t.timer <= 0) { t.state = 'falling'; t.vy = t.kind === 'cage' ? 350 : 0; }
      } else if (t.state === 'falling') {
        t.vy += (t.kind === 'cage' ? 3200 : GRAVITY) * dt;
        t.y += t.vy * dt;
        const size = t.kind === 'cage' ? 42 : 34;
        for (const h of live) {
          const hit = t.kind === 'cage'
            ? rectHit(h, t.cx - 17, t.y, 34, size)
            : circleHit(h, t.cx, t.y + 17, 16);
          if (!hit) continue;
          if (absorb(h, t)) break;
          if (t.kind === 'cage') {
            t.y = t.floorY - size; t.state = 'landed'; t.timer = 1.4; t.victim = h;
            sfx.clang();
            defeat(h, t, 'caged');
          } else defeat(h, t, 'bonked');
        }
        if (t.state === 'falling' && t.y + size >= t.floorY) {
          t.y = t.floorY - size;
          if (t.kind === 'rock') shatter(t);
          else { t.state = 'landed'; t.timer = 1.0; sfx.clang(); }
        }
      }
      break;
    }

    case 'wheel': {
      if (t.state === 'respawn') {
        t.timer -= dt;
        if (t.timer <= 0) { t.state = 'armed'; t.wx = t.cx; }
        break;
      }
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
        else for (const h of live) if (circleHit(h, t.wx, t.floorY - 18, 15) && !absorb(h, t)) defeat(h, t, 'flattened');
      }
      break;
    }
  }
}

/* ───────────────────────── effects ───────────────────────── */
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
function toast(text, dur = 2) {
  S.toasts.push({ text, t: 0, dur });
  if (S.toasts.length > 3) S.toasts.shift();
}
function mood(m, t) {
  S.mood = m;
  S.moodT = t;
}

/* ───────────────────────── main update ───────────────────────── */
function update(dt) {
  S.time += dt;
  if (S.moodT > 0 && (S.moodT -= dt) <= 0) S.mood = 'idle';
  for (const t of S.traps) updateTrap(t, dt);

  if (S.screen === 'wave') {
    S.spawnT -= dt;
    if (S.spawnQueue.length && S.spawnT <= 0) {
      spawnHero(S.spawnQueue.shift());
      S.spawnT = 1.3 + Math.random() * 0.8;
    }
    for (const h of S.heroes) updateHero(h, dt);
    S.heroes = S.heroes.filter((h) => !h.gone);
    if (S.hearts <= 0) {
      S.screen = 'lose';
      mood('sad', 99);
      sfx.lose();
      brain.save();
    } else if (!S.spawnQueue.length && !S.heroes.length) endWave();
  }

  for (const p of S.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.grav) p.vy += 900 * dt;
    if (p.type === 'poof') { p.vx *= 0.92; p.vy *= 0.92; }
  }
  S.particles = S.particles.filter((p) => p.life > 0);

  for (const c of S.coinsFly) {
    if ((c.t += dt * 1.6) >= 1 && !c.done) { c.done = true; sfx.coin(); }
  }
  S.coinsFly = S.coinsFly.filter((c) => c.t < 1);
  for (const t of S.toasts) t.t += dt;
  S.toasts = S.toasts.filter((t) => t.t < t.dur);
}

/* ───────────────────────── rendering ───────────────────────── */
function buildBackground() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = ROWS * T;
  const b = c.getContext('2d');
  b.fillStyle = '#120f1d';
  b.fillRect(0, 0, W, c.height);
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * T, y = r * T;
      if (S.grid[r][col]) {
        const top = r > 0 && !S.grid[r - 1][col];
        const im = IMG[top ? 'tile_floor' : 'tile_wall'];
        if (im) b.drawImage(im, x, y, T, T);
        if (!top) { b.fillStyle = 'rgba(10,8,20,.35)'; b.fillRect(x, y, T, T); }
      } else {
        const im = IMG.tile_wall;
        b.globalAlpha = 0.28;
        if (im) b.drawImage(im, x, y, T, T);
        b.globalAlpha = 1;
      }
    }
  }
  // soft vignette
  const v = b.createRadialGradient(W / 2, c.height / 2, 200, W / 2, c.height / 2, 760);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,.45)');
  b.fillStyle = v;
  b.fillRect(0, 0, W, c.height);
  S.bg = c;
}

function roundRect(x, y, w, h, r) {
  g.beginPath();
  g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h);
}

function text(str, x, y, size, color = '#fff', align = 'center', weight = 700) {
  g.font = `${weight} ${size}px ${FONT}`;
  g.textAlign = align;
  g.textBaseline = 'middle';
  if (!/^#[2-5]a/.test(color)) {
    g.lineWidth = Math.max(3, size / 5);
    g.strokeStyle = 'rgba(15,10,30,.85)';
    g.lineJoin = 'round';
    g.strokeText(str, x, y);
  }
  g.fillStyle = color;
  g.fillText(str, x, y);
}

function drawLevel() {
  g.drawImage(S.bg, 0, TOP);
  // torch light
  for (const tc of S.torches) {
    const x = cellX(tc.c) + T / 2, y = cellY(tc.r) + T * 0.7;
    const f = 0.85 + Math.sin(S.time * 9 + tc.c) * 0.08 + Math.random() * 0.05;
    const grd = g.createRadialGradient(x, y - 14, 4, x, y - 14, 90 * f);
    grd.addColorStop(0, 'rgba(255,170,70,.32)');
    grd.addColorStop(1, 'rgba(255,170,70,0)');
    g.fillStyle = grd;
    g.fillRect(x - 100, y - 114, 200, 200);
    spr('torch', x, y, 34);
  }
  if (S.door) spr('door', cellX(S.door.c) + T / 2, cellY(S.door.r) + T, 58);
  if (S.chest) {
    const bounce = S.screen === 'wave' ? 0 : Math.sin(S.time * 3) * 1.5;
    spr('chest', cellX(S.chest.c) + T / 2, cellY(S.chest.r) + T + bounce, 44);
  }
}

function drawTrap(t, ghost) {
  const dis = t.disabledT > 0 || t.broken;
  g.save();
  if (dis) g.globalAlpha = 0.45;
  if (ghost) g.globalAlpha = 0.6;
  switch (t.kind) {
    case 'spikes': sprW('trap_spikes', t.cx, t.floorY + 2, T - 2); break;
    case 'slime': sprW('trap_slime', t.cx, t.floorY + 4, T + 2); break;
    case 'spring': sprW('trap_spring', t.cx, t.floorY + 1, T * 0.78, { sy: 1 - Math.max(0, t.squish) * 0.4 }); break;
    case 'fire': {
      const im = IMG.trap_fire;
      if (!im || !im.width) break;
      const s = (T - 2) / im.width;
      const baseH = im.height * 0.36 * s;
      const fl = t.state === 'on' && !dis ? 2.1 * T * (0.92 + Math.random() * 0.12) : t.state === 'warn' && !dis ? 0.35 * T : 0;
      if (fl > 0) {
        g.save();
        if (t.state === 'warn') g.globalAlpha *= 0.7;
        if (t.state === 'on') {
          const grd = g.createRadialGradient(t.cx, t.floorY - fl / 2, 4, t.cx, t.floorY - fl / 2, 70);
          grd.addColorStop(0, 'rgba(255,150,40,.35)');
          grd.addColorStop(1, 'rgba(255,150,40,0)');
          g.fillStyle = grd;
          g.fillRect(t.cx - 70, t.floorY - fl / 2 - 70, 140, 140);
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
      // chain
      g.strokeStyle = '#3b3f4a';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(t.cx, t.ceilY);
      g.lineTo(t.cx + Math.sin(a) * (t.len - 14), t.ceilY + Math.cos(a) * (t.len - 14));
      g.stroke();
      g.fillStyle = '#2a2d36';
      g.fillRect(t.cx - 6, t.ceilY - 2, 12, 6);
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
    case 'rock': {
      if (t.state === 'respawn') { g.globalAlpha *= Math.max(0, 1 - t.timer / 2.5) * 0.4; }
      const shake = t.state === 'trigger' ? (Math.random() - 0.5) * 4 : 0;
      sprW('trap_rock', t.cx + shake, (t.y ?? t.ceilY) + 36, 38);
      break;
    }
    case 'cage': {
      if (t.state === 'respawn') g.globalAlpha *= 0.3;
      const y = t.y ?? t.ceilY;
      g.strokeStyle = '#3b3f4a';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(t.cx, t.ceilY);
      g.lineTo(t.cx, y + 2);
      g.stroke();
      const shake = t.state === 'trigger' ? (Math.random() - 0.5) * 3 : 0;
      t._drawY = y;
      if (t.victim) drawHero(t.victim);
      sprW('trap_cage', t.cx + shake, y + 44, 38);
      break;
    }
    case 'wheel': {
      if (t.state === 'respawn') g.globalAlpha *= 0.25;
      const x = t.state === 'respawn' ? t.cx : t.wx;
      sprW('trap_wheel', x, t.floorY - 20, 40, { rot: t.rot, center: true });
      break;
    }
  }
  if (t.disabledT > 0 && !ghost) {
    for (let i = 0; i < 3; i++) {
      const a = S.time * 3 + i * 2.1;
      const y = t.kind === 'axe' || t.kind === 'rock' || t.kind === 'cage' ? t.ceilY + 20 : t.floorY - 18;
      g.globalAlpha = 0.8;
      g.fillStyle = '#7fd8ff';
      g.beginPath();
      g.arc(t.cx + Math.cos(a) * 16, y + Math.sin(a) * 10, 2.5, 0, 7);
      g.fill();
    }
  }
  g.restore();
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
  if (!h.alive && !h.caged) g.globalAlpha = Math.max(0, 1 - h.deadT / 1.3);
  // shadow
  if (h.alive) {
    g.fillStyle = 'rgba(0,0,0,.3)';
    g.beginPath();
    g.ellipse(x, h.y + h.h + 1, 12, 3.5, 0, 0, 7);
    g.fill();
  }
  spr(heroSprite(h), x, y + bob, h.C.draw, { flip: h.dir < 0, rot: h.alive ? tilt : Math.sin(h.spin) * 0.6 });
  if (h.cls === 'knight' && !h.shield && h.alive) {
    // shield lost: little crack marks
    g.fillStyle = 'rgba(255,255,255,.8)';
    g.font = `700 10px ${FONT}`;
    g.fillText('✕', x + h.dir * 12, h.y + 18);
  }
  if (h.thoughtT > 0 && h.alive) {
    const a = Math.min(1, h.thoughtT * 4);
    g.globalAlpha = a;
    const bx = x, by = h.y - 18;
    g.fillStyle = '#fff';
    roundRect(bx - 9, by - 10, 18, 18, 6);
    g.fill();
    g.fillStyle = h.thought === '?' ? '#7b5cff' : '#ff7a1a';
    g.font = `700 13px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(h.thought, bx, by);
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
      g.arc(p.x, p.y, p.type === 'poof' ? p.size * (1.4 - k * 0.6) : p.size * (p.type === 'smoke' ? 2 - k : 1), 0, 7);
      g.fill();
    }
  }
  g.globalAlpha = 1;
  // coins flying to the HUD
  for (const c of S.coinsFly) {
    const e = c.t * c.t * (3 - 2 * c.t);
    const tx = 345, ty = 36;
    const x = c.x + (tx - c.x) * e, y = c.y + (ty - c.y) * e - Math.sin(e * Math.PI) * 80;
    spr('coin', x, y + 10, 20, { center: false });
  }
}

/* ── UI buttons are rebuilt every frame; clicks test against them ── */
let buttons = [];
function button(id, x, y, w, h, label, o = {}) {
  const hot = S.hover && S.hover.x >= x && S.hover.x <= x + w && S.hover.y >= y && S.hover.y <= y + h;
  buttons.push({ id, x, y, w, h, ...o });
  g.save();
  const lift = hot && !o.disabled ? -2 : 0;
  g.fillStyle = 'rgba(0,0,0,.35)';
  roundRect(x, y + 4, w, h, 12);
  g.fill();
  const col = o.disabled ? '#4a4660' : o.active ? '#ffad5c' : o.color || '#2c2645';
  g.fillStyle = col;
  roundRect(x, y + lift, w, h, 12);
  g.fill();
  g.strokeStyle = o.active ? '#fff3e0' : 'rgba(255,255,255,.15)';
  g.lineWidth = 2;
  g.stroke();
  g.restore();
  if (o.icon) {
    spr(o.icon, x + (label ? 26 : w / 2), y + h / 2 + lift + (o.iconH || 24) / 2, o.iconH || 24);
  }
  if (label) text(label, x + (o.icon ? w / 2 + 14 : w / 2), y + h / 2 + lift, o.size || 18, o.disabled ? '#9a95b5' : o.active ? '#2a1400' : '#fff');
}

function drawHUD() {
  g.fillStyle = '#0d0a18';
  g.fillRect(0, 0, W, TOP);
  g.fillStyle = 'rgba(255,122,26,.25)';
  g.fillRect(0, TOP - 2, W, 2);
  // monster portrait
  const m = S.mood === 'idle' ? (Math.floor(S.time * 2) % 2 ? 'monster_idle1' : 'monster_idle2') : 'monster_' + S.mood;
  spr(m, 52, 66 + Math.sin(S.time * 3) * 2, 58);
  const L = LEVELS[S.levelIndex];
  text(L.name, 100, 22, 18, '#ffd7a8', 'left');
  text(`Wave ${Math.max(1, S.wave + (S.screen === 'build' ? 1 : 0))}/${L.waves}`, 100, 48, 16, '#c9c3e6', 'left', 500);
  // coins
  spr('coin', 330, 50, 26);
  text(String(S.coins), 350, 37, 24, '#ffe07a', 'left');
  // hearts (treasure)
  text('Treasure', 470, 20, 13, '#c9c3e6', 'left', 500);
  for (let i = 0; i < 10; i++) spr('heart', 478 + i * 22, 56, 18, { alpha: i < S.hearts ? 1 : 0.18 });
  // brain IQ
  text(`Traps ${S.traps.length}/${maxTraps()}`, 740, 22, 15, S.traps.length >= maxTraps() ? '#ff9d9d' : '#ffe9cf', 'left', 600);
  text(`Hero Brain IQ ${brain.iq()}`, 740, 48, 15, '#9fe3ff', 'left', 600);
  button('brain', 930, 14, 116, 44, 'Brain', { icon: 'gem', iconH: 24, active: S.showBrain, size: 16 });
  if (S.screen === 'wave') button('speed', 1056, 14, 70, 44, `${S.speed}×`, { size: 18 });
  button('mute', 1136, 14, 60, 44, sound.muted ? '🔇' : '🔊', { size: 18 });
  button('menu', 1206, 14, 60, 44, '☰', { size: 20 });
}

function drawBar() {
  g.fillStyle = '#0d0a18';
  g.fillRect(0, BAR, W, H - BAR);
  g.fillStyle = 'rgba(255,122,26,.25)';
  g.fillRect(0, BAR, W, 2);

  if (S.screen === 'build') {
    S.offers.forEach((k, i) => {
      const info = TRAPS[k];
      const x = 16 + i * 196;
      const afford = S.coins >= info.price;
      button('offer:' + k, x, BAR + 12, 184, 64, '', { active: S.selected === k, disabled: !afford });
      sprW('trap_' + k, x + 34, BAR + 66, 44);
      text(info.name, x + 64, BAR + 32, 16, S.selected === k ? '#2a1400' : afford ? '#fff' : '#9a95b5', 'left');
      spr('coin', x + 72, BAR + 66, 16);
      text(String(info.price), x + 84, BAR + 56, 15, S.selected === k ? '#2a1400' : '#ffe07a', 'left');
      const fav = brain.favourite(k);
      if (fav) text(`they ${fav}`, x + 176, BAR + 56, 12, S.selected === k ? '#5a2c00' : '#9fe3ff', 'right', 500);
    });
    button('reroll', 806, BAR + 12, 112, 64, 'Reroll 5', { disabled: S.coins < 5, size: 16 });
    button('sell', 928, BAR + 12, 92, 64, 'Sell', { active: S.sellMode, size: 17 });
    button('start', 1030, BAR + 12, 234, 64, 'Start Wave ▶', { color: '#e8641a', size: 22 });
    if (S.selected) {
      text(TRAPS[S.selected].tip, W / 2, BAR - 16, 15, '#ffe9cf');
    }
  } else if (S.screen === 'wave') {
    const left = S.spawnQueue.length + S.heroes.filter((h) => h.alive).length;
    text(`Heroes left: ${left}`, 24, BAR + 44, 20, '#fff', 'left');
    text(`Defeated: ${S.kills}`, 230, BAR + 44, 18, '#9dff9d', 'left', 600);
    text(`Escaped: ${S.stolen}`, 400, BAR + 44, 18, '#ff9d9d', 'left', 600);
    text('The heroes learn from every trap that gets them…', 860, BAR + 44, 16, '#9fe3ff', 'center', 500);
  }
}

function drawBrainPanel() {
  const x = W - 330, y = TOP + 10, w = 316, h = 450;
  g.save();
  g.fillStyle = 'rgba(13,10,24,.93)';
  roundRect(x, y, w, h, 16);
  g.fill();
  g.strokeStyle = 'rgba(159,227,255,.35)';
  g.lineWidth = 2;
  g.stroke();
  g.restore();
  text('Hero Guild Brain', x + 18, y + 26, 20, '#9fe3ff', 'left');
  text('How well heroes handle each trap', x + 18, y + 50, 13, '#c9c3e6', 'left', 500);
  UNLOCK.forEach((k, i) => {
    const yy = y + 78 + i * 39;
    sprW('trap_' + k, x + 32, yy + 16, 30);
    const m = brain.mastery[k];
    text(TRAPS[k].name, x + 58, yy, 14, '#fff', 'left');
    const pct = m ? m.ema : 0;
    g.fillStyle = '#2c2645';
    roundRect(x + 58, yy + 10, 150, 9, 4);
    g.fill();
    g.fillStyle = pct > 0.7 ? '#ff6b6b' : pct > 0.35 ? '#ffc04d' : '#6ee7b7';
    roundRect(x + 58, yy + 10, Math.max(4, 150 * pct), 9, 4);
    g.fill();
    const fav = brain.favourite(k);
    text(m ? `${Math.round(pct * 100)}% · ${fav || 'learning'}` : 'never seen', x + 300, yy + 8, 12, '#c9c3e6', 'right', 500);
  });
  button('resetbrain', x + 18, y + h - 52, w - 36, 38, 'Wipe hero memory', { size: 14, color: '#3a2440' });
}

function drawToasts() {
  S.toasts.forEach((t, i) => {
    const a = Math.min(1, t.t * 5, (t.dur - t.t) * 3);
    g.globalAlpha = Math.max(0, a);
    const y = TOP + 40 + i * 44 - (1 - Math.min(1, t.t * 5)) * 10;
    g.font = `700 20px ${FONT}`;
    const w = g.measureText(t.text).width + 40;
    g.fillStyle = 'rgba(13,10,24,.85)';
    roundRect(W / 2 - w / 2, y - 18, w, 36, 18);
    g.fill();
    text(t.text, W / 2, y, 20, '#ffe9cf');
    g.globalAlpha = 1;
  });
}

function drawGhost() {
  if (S.screen !== 'build' || !S.hover || S.hover.y < TOP || S.hover.y >= BAR) return;
  const c = Math.floor(S.hover.x / T), r = Math.floor((S.hover.y - TOP) / T);
  if (S.sellMode) {
    const t = trapAtCell(c, r);
    if (t) {
      g.strokeStyle = '#ff6b6b';
      g.lineWidth = 3;
      roundRect(cellX(t.c) + 2, cellY(t.r) + 2, T - 4, T - 4, 8);
      g.stroke();
      text(`+${Math.floor(TRAPS[t.kind].price * 0.6)}`, cellX(t.c) + T / 2, cellY(t.r) - 10, 16, '#ffe07a');
    }
    return;
  }
  if (!S.selected) return;
  const ok = canPlace(S.selected, c, r) && S.coins >= TRAPS[S.selected].price;
  // show every valid cell faintly
  for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) {
    if (canPlace(S.selected, cc, rr)) {
      g.fillStyle = 'rgba(110,231,183,.10)';
      g.fillRect(cellX(cc) + 3, cellY(rr) + 3, T - 6, T - 6);
    }
  }
  g.fillStyle = ok ? 'rgba(110,231,183,.28)' : 'rgba(255,107,107,.28)';
  roundRect(cellX(c) + 2, cellY(r) + 2, T - 4, T - 4, 8);
  g.fill();
  if (ok) drawTrap(makeTrap(S.selected, c, r), true);
}

function trapAtCell(c, r) {
  return S.traps.find((t) => t.c === c && t.r === r);
}

function drawOverlay(title, sub, btns) {
  g.fillStyle = 'rgba(8,6,16,.72)';
  g.fillRect(0, 0, W, H);
  text(title, W / 2, 250, 56, '#ffd7a8');
  if (sub) text(sub, W / 2, 312, 20, '#e8e3ff', 'center', 500);
  btns.forEach((b, i) => button(b.id, W / 2 - 150, 360 + i * 72, 300, 58, b.label, { color: b.color, size: 22 }));
}

function drawTitle() {
  g.fillStyle = '#120f1d';
  g.fillRect(0, 0, W, H);
  if (IMG.tile_wall?.width) {
    g.globalAlpha = 0.22;
    for (let y = 0; y < H; y += T) for (let x = 0; x < W; x += T) g.drawImage(IMG.tile_wall, x, y, T, T);
    g.globalAlpha = 1;
  }
  const grd = g.createRadialGradient(W / 2, 250, 20, W / 2, 250, 420);
  grd.addColorStop(0, 'rgba(255,122,26,.35)');
  grd.addColorStop(1, 'rgba(255,122,26,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  const m = ['monster_idle1', 'monster_laugh', 'monster_celebrate', 'monster_lever'][Math.floor(S.time / 1.4) % 4];
  spr(m, W / 2, 250 + Math.sin(S.time * 2.5) * 8, 170);
  ['hero', 'thief', 'knight', 'barb', 'wizard'].forEach((p, i) => {
    const x = ((S.time * 70 + i * 260) % (W + 200)) - 100;
    spr(`${p}_walk${1 + (Math.floor(S.time * 10 + i) % 6)}`, x, H - 40 - Math.abs(Math.sin(S.time * 12 + i)) * 3, 52);
  });
  g.fillStyle = 'rgba(0,0,0,.35)';
  g.fillRect(0, H - 40, W, 40);
  text('TINY DUNGEON KEEPER', W / 2, 300, 64, '#ffad5c');
  text('Build the traps. The heroes learn. Outsmart them.', W / 2, 352, 20, '#e8e3ff', 'center', 500);
  for (let i = 0; i < LEVELS.length; i++) {
    const open = i < progress.unlocked;
    button('level:' + i, W / 2 - 330 + i * 225, 400, 210, 70, open ? `Level ${i + 1}` : '🔒 Locked', { disabled: !open, color: '#e8641a', size: 22 });
    if (open) text(LEVELS[i].name, W / 2 - 225 + i * 225, 488, 14, '#c9c3e6', 'center', 500);
  }
  text(`Hero Brain IQ: ${brain.iq()}  ·  heroes remember your traps between games`, W / 2, 540, 15, '#9fe3ff', 'center', 500);
  button('mute', W - 76, 16, 60, 44, sound.muted ? '🔇' : '🔊', { size: 18 });
}

function drawTutorial() {
  if (!S.tutorial || S.screen !== 'build' || S.levelIndex !== 0 || S.wave !== 0) return;
  const x = 380, y = TOP + 180, w = 520, h = 150;
  g.fillStyle = 'rgba(13,10,24,.9)';
  roundRect(x, y, w, h, 16);
  g.fill();
  g.strokeStyle = '#ffad5c';
  g.lineWidth = 2;
  g.stroke();
  text('How to play', x + w / 2, y + 26, 20, '#ffad5c');
  text('1. Pick a trap below, then tap a glowing cell to place it.', x + 24, y + 60, 15, '#fff', 'left', 500);
  text('2. Pull the lever with "Start Wave" and watch the heroes.', x + 24, y + 86, 15, '#fff', 'left', 500);
  text('3. Heroes LEARN from every trap that gets them — keep changing!', x + 24, y + 112, 15, '#fff', 'left', 500);
}

function render() {
  buttons = [];
  g.clearRect(0, 0, W, H);
  if (S.screen === 'title') { drawTitle(); return; }
  drawLevel();
  for (const t of S.traps) if (TRAPS[t.kind].mount === 'floor') drawTrap(t);
  for (const h of S.heroes) if (!h.caged) drawHero(h);
  for (const t of S.traps) if (TRAPS[t.kind].mount === 'ceiling') drawTrap(t);
  drawParticles();
  drawGhost();
  drawHUD();
  drawBar();
  drawTutorial();
  if (S.showBrain) drawBrainPanel();
  drawToasts();
  if (S.paused) drawOverlay('Paused', null, [{ id: 'resume', label: 'Resume', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }]);
  if (S.screen === 'win') {
    const last = S.levelIndex >= LEVELS.length - 1;
    drawOverlay(last ? 'Dungeon defended!' : 'Level complete!', `Defeated ${S.kills} heroes · ${S.hearts}/10 treasure left · Hero Brain IQ ${brain.iq()}`,
      last ? [{ id: 'retry', label: 'Play again', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }]
           : [{ id: 'next', label: 'Next level ▶', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }]);
  }
  if (S.screen === 'lose') drawOverlay('The treasure is gone!', `The heroes got smarter. Try new trap combos! (wave ${S.wave})`, [{ id: 'retry', label: 'Try again', color: '#e8641a' }, { id: 'quit', label: 'Main menu' }]);
}

/* ───────────────────────── input ───────────────────────── */
function toLocal(e) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}

canvas.addEventListener('pointermove', (e) => (S.hover = toLocal(e)));
canvas.addEventListener('pointerleave', () => (S.hover = null));
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  unlockAudio();
  const p = toLocal(e);
  S.hover = p;
  const b = [...buttons].reverse().find((b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
  if (b) { if (!b.disabled) onButton(b.id); return; }
  if (S.paused || S.screen !== 'build' || p.y < TOP || p.y >= BAR) return;
  const c = Math.floor(p.x / T), r = Math.floor((p.y - TOP) / T);
  if (S.sellMode || e.button === 2) {
    const t = trapAtCell(c, r);
    if (t) {
      S.traps = S.traps.filter((x) => x !== t);
      S.coins += Math.floor(TRAPS[t.kind].price * 0.6);
      poof(t.cx, cellY(r) + T / 2, 8);
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
    poof(cellX(c) + T / 2, cellY(r) + T / 2, 6);
    sfx.place();
    if (S.coins < price) S.selected = null;
  }
});

function onButton(id) {
  sfx.click();
  if (id.startsWith('level:')) { loadLevel(+id.slice(6)); return; }
  if (id.startsWith('offer:')) {
    const k = id.slice(6);
    S.selected = S.selected === k ? null : k;
    S.sellMode = false;
    return;
  }
  switch (id) {
    case 'start': startWave(); break;
    case 'reroll': if (S.coins >= 5) { S.coins -= 5; rollOffers(); } break;
    case 'sell': S.sellMode = !S.sellMode; S.selected = null; break;
    case 'brain': S.showBrain = !S.showBrain; break;
    case 'speed': S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 3 : 1; break;
    case 'mute': sound.muted = !sound.muted; break;
    case 'menu': S.paused = !S.paused; break;
    case 'resume': S.paused = false; break;
    case 'quit': S.paused = false; brain.save(); S.screen = 'title'; break;
    case 'retry': loadLevel(S.levelIndex); break;
    case 'next': loadLevel(Math.min(LEVELS.length - 1, S.levelIndex + 1)); break;
    case 'resetbrain':
      if (confirm('Wipe the heroes\' memory? They will forget everything they learned.')) { brain.reset(); toast('Hero memory wiped', 1.5); }
      break;
  }
}

window.addEventListener('keydown', (e) => {
  if (S.screen === 'build') {
    if (e.key >= '1' && e.key <= '4' && S.offers[+e.key - 1]) onButton('offer:' + S.offers[+e.key - 1]);
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startWave(); }
    if (e.key === 's' || e.key === 'S') onButton('sell');
    if (e.key === 'r' || e.key === 'R') onButton('reroll');
  }
  if (e.key === 'Escape') { S.selected = null; S.sellMode = false; if (S.screen !== 'title') S.paused = !S.paused; }
  if (e.key === 'b' || e.key === 'B') S.showBrain = !S.showBrain;
  if (e.key === 'm' || e.key === 'M') sound.muted = !sound.muted;
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { brain.save(); if (S.screen === 'wave') S.paused = true; } });

/* ───────────────────────── loop ───────────────────────── */
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!S.paused && S.screen !== 'title') {
    acc += dt * (S.screen === 'wave' ? S.speed : 1);
    while (acc >= STEP) { update(STEP); acc -= STEP; }
  } else if (S.screen === 'title') S.time += dt;
  render();
  requestAnimationFrame(frame);
}

// Expose a tiny API for automated tests / tooling.
window.__tdk = { S, brain, loadLevel, startWave, makeTrap, canPlace, update, TRAPS, maxTraps };

(async function boot() {
  resize();
  await loadAssets();
  document.getElementById('loading')?.remove();
  setInterval(() => brain.save(), 5000);
  requestAnimationFrame(frame);
})();
