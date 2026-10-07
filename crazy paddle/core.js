/* Paddle Royale — shared game simulation.
 * Runs in the browser (offline / practice / visual prediction) and in Node (authoritative server).
 * Keep client/core.js and server/core.js identical.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PongCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- tuning ----------
  const R = 300;               // arena radius (world units)
  const BALL_R = 9;
  const PADDLE_TH = 12;        // paddle thickness
  const PADDLE_INSET = 18;     // paddle distance in from its goal line
  const WALL_T = 16;           // wall thickness (visual + miter)
  const BASE_SPEED = 320, MAX_SPEED = 740, HIT_BOOST = 20, RAMP = 9;
  const PADDLE_SPEED = 620;
  const START_HEARTS = 4, MAX_HEARTS = 5, MAX_BALLS = 5, MAX_HAZARDS = 6;

  const COLORS = ['#5b8def', '#8bcb5c', '#f4c84a', '#f29a4a', '#ef6b7b', '#3dbfb0', '#d46bc9', '#9b7be0'];
  const TEAM_SHADES = [
    ['#5b8def', '#4bb3e6', '#6f78e8', '#3f93c9'],
    ['#ef6b7b', '#f28a55', '#e5609f', '#f07a64'],
  ];
  const TEAM_NAMES = ['Blue', 'Red'];

  const POWERUPS = {
    grow:    { label: 'GROW',      color: '#7cc55a', w: 3 },
    shrink:  { label: 'SHRINK',    color: '#9b7be0', w: 2 },
    multi:   { label: 'MULTIBALL', color: '#f29a4a', w: 3 },
    speed:   { label: 'SPEED',     color: '#3dbfb0', w: 2 },
    shield:  { label: 'SHIELD',    color: '#5b8def', w: 2 },
    heart:   { label: '+1 HEART',  color: '#ef6b7b', w: 1 },
    slow:    { label: 'SLOW-MO',   color: '#4bb3e6', w: 2 },
    reverse: { label: 'REVERSE',   color: '#d46bc9', w: 2 },
  };
  const POWER_TYPES = Object.keys(POWERUPS);

  const ARENAS = [
    { name: 'Meadow',        floor: '#a9dcc1', grid: 'rgba(255,255,255,0.72)' },
    { name: 'Pillar Park',   floor: '#b8d7ef', grid: 'rgba(255,255,255,0.7)' },
    { name: 'Spinner',       floor: '#d5c9ef', grid: 'rgba(255,255,255,0.7)' },
    { name: 'Bumper Bay',    floor: '#f5d3ba', grid: 'rgba(255,255,255,0.7)' },
    { name: 'Vortex',        floor: '#a5dbd6', grid: 'rgba(255,255,255,0.68)' },
    { name: 'Sliding Gates', floor: '#eee0b3', grid: 'rgba(255,255,255,0.72)' },
  ];

  // ---------- helpers ----------
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const r1 = v => Math.round(v * 10) / 10;
  const r3 = v => Math.round(v * 1000) / 1000;

  function makeEdge(a, b, owner) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    let nx = -uy, ny = ux;
    if (nx * -mx + ny * -my < 0) { nx = -nx; ny = -ny; } // inward normal
    return { a, b, len, ux, uy, nx, ny, mx, my, owner };
  }

  function setSpeed(b, spd) {
    const l = Math.hypot(b.vx, b.vy) || 1;
    b.vx = b.vx / l * spd; b.vy = b.vy / l * spd;
  }

  function capsuleDist(b, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t = L2 ? clamp(((b.x - ax) * dx + (b.y - ay) * dy) / L2, 0, 1) : 0;
    return Math.hypot(b.x - (ax + dx * t), b.y - (ay + dy * t));
  }

  // push ball out of a capsule and reflect; returns true when it bounced
  function collideCapsule(b, ax, ay, bx, by, rad, bounce) {
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t = L2 ? clamp(((b.x - ax) * dx + (b.y - ay) * dy) / L2, 0, 1) : 0;
    const px = ax + dx * t, py = ay + dy * t;
    let nx = b.x - px, ny = b.y - py;
    const d = Math.hypot(nx, ny), min = rad + BALL_R;
    if (d >= min || d < 1e-6) return false;
    nx /= d; ny /= d;
    b.x = px + nx * min; b.y = py + ny * min;
    const vn = b.vx * nx + b.vy * ny;
    if (vn >= 0) return false;
    b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny;
    if (bounce) { b.spd = Math.min(MAX_SPEED, b.spd * bounce); }
    setSpeed(b, b.spd);
    return true;
  }

  // ---------- arena obstacles ----------
  function arenaObstacles(arena, t) {
    const o = { circles: [], segs: [], wells: [] };
    switch (arena) {
      case 1: // Pillar Park
        for (let k = 0; k < 4; k++) {
          const a = Math.PI / 4 + k * Math.PI / 2;
          o.circles.push({ x: Math.cos(a) * R * 0.4, y: Math.sin(a) * R * 0.4, r: 20, kind: 'pillar' });
        }
        break;
      case 2: { // Spinner
        const a = t * 1.1, L = 72;
        o.segs.push({ ax: -Math.cos(a) * L, ay: -Math.sin(a) * L, bx: Math.cos(a) * L, by: Math.sin(a) * L, r: 7, kind: 'spinner' });
        break;
      }
      case 3: // Bumper Bay
        for (let k = 0; k < 3; k++) {
          const a = t * 0.35 + k * Math.PI * 2 / 3;
          o.circles.push({ x: Math.cos(a) * R * 0.38, y: Math.sin(a) * R * 0.38, r: 22, bump: 1.08, kind: 'bumper' });
        }
        break;
      case 4: // Vortex
        o.wells.push({ x: 0, y: 0, r: 135, pow: 650, kind: 'vortex' });
        o.circles.push({ x: 0, y: 0, r: 14, bump: 1.05, kind: 'core' });
        break;
      case 5: // Sliding Gates
        for (let k = 0; k < 2; k++) {
          const y = (k ? 1 : -1) * R * 0.3, x = Math.sin(t * 0.8 + k * Math.PI) * R * 0.28, L = 44;
          o.segs.push({ ax: x - L, ay: y, bx: x + L, by: y, r: 8, kind: 'gate' });
        }
        break;
    }
    return o;
  }

  function obstacles(s) {
    const o = arenaObstacles(s.arena, s.time);
    for (const h of s.hazards) {
      if (h.kind === 'well') o.wells.push({ x: h.x, y: h.y, r: 110, pow: 900, kind: 'hwell' });
      else {
        const L = 46, c = Math.cos(h.ang), sn = Math.sin(h.ang);
        o.segs.push({ ax: h.x - c * L, ay: h.y - sn * L, bx: h.x + c * L, by: h.y + sn * L, r: 7, kind: 'hbar' });
      }
    }
    return o;
  }

  // ---------- match setup ----------
  function createMatch(cfg) {
    const mode = cfg.mode === 'teams' ? 'teams' : 'ffa';
    const s = {
      mode, arena: clamp(cfg.arena | 0, 0, ARENAS.length - 1), time: 0, phase: 'countdown', timer: 3.2,
      round: 1, players: [], balls: [], powerups: [], hazards: [], sides: [], walls: [], boundary: [],
      events: [], nextPU: 4, slowT: 0, winner: -1, winnerTeam: -1, uid: 1, total: cfg.players.length, obs: null,
    };
    const shadeIdx = [0, 0];
    cfg.players.forEach((q, i) => {
      const team = mode === 'teams' ? i % 2 : i;
      const color = mode === 'teams' ? TEAM_SHADES[team][shadeIdx[team]++ % 4] : COLORS[i % COLORS.length];
      s.players.push({
        id: i, name: String(q.name || 'Player'), avatar: q.avatar | 0, bot: !!q.bot, skill: q.skill || 0.7, team, color,
        cos: cleanCos(q.cos),
        hearts: START_HEARTS, alive: true, pos: 0.5, target: 0.5, axis: 0, useAxis: false, side: -1, place: 0,
        eff: { grow: 0, shrink: 0, speed: 0, shield: 0, rev: 0 },
        charges: { well: 0, bar: 0 }, chargeT: 0, hazCd: 0, hazT: rand(3, 7),
        ai: { t: 0, err: 0, aim: 0, key: '' },
      });
    });
    rebuild(s);
    s.obs = obstacles(s);
    return s;
  }

  // cosmetics: paddle skin, ball skin, trail (small ints, validated so a client can't send junk)
  function cleanCos(c) {
    c = c || {};
    const n = v => Math.min(7, Math.max(0, v | 0)); // 8 items per category
    return { p: n(c.p), b: n(c.b), t: n(c.t) };
  }
  function startInfo(s) {
    return { mode: s.mode, arena: s.arena, players: s.players.map(p => ({ name: p.name, avatar: p.avatar, bot: p.bot, cos: p.cos })) };
  }

  // rebuild the arena polygon from the players still alive
  function rebuild(s) {
    const alive = s.players.filter(p => p.alive);
    const n = alive.length;
    if (n < 2) return;
    s.sides = []; s.walls = []; s.boundary = [];
    if (n >= 3) {
      const th0 = Math.PI / 2 - Math.PI / n;
      const v = [];
      for (let k = 0; k < n; k++) {
        const a = th0 + 2 * Math.PI * k / n;
        v.push({ x: R * Math.cos(a), y: R * Math.sin(a) });
      }
      alive.forEach((p, k) => {
        const e = makeEdge(v[k], v[(k + 1) % n], p.id);
        s.sides.push(e); s.boundary.push(e); p.side = k;
      });
    } else {
      const w = R * 0.62, h = R * 0.86;
      const bottom = makeEdge({ x: w, y: h }, { x: -w, y: h }, alive[0].id);
      const left = makeEdge({ x: -w, y: h }, { x: -w, y: -h }, -1);
      const top = makeEdge({ x: -w, y: -h }, { x: w, y: -h }, alive[1].id);
      const right = makeEdge({ x: w, y: -h }, { x: w, y: h }, -1);
      s.sides = [bottom, top]; s.walls = [left, right]; s.boundary = [bottom, left, top, right];
      alive[0].side = 0; alive[1].side = 1;
    }
    for (const p of s.players) {
      if (!p.alive) p.side = -1;
      p.pos = 0.5; p.target = 0.5;
    }
    s.powerups = s.powerups.filter(u => inside(s, u.x, u.y, 30));
    s.hazards = s.hazards.filter(h => inside(s, h.x, h.y, 30));
  }

  function inside(s, x, y, m) {
    for (const e of s.boundary) if ((x - e.a.x) * e.nx + (y - e.a.y) * e.ny < m) return false;
    return true;
  }

  // ---------- paddles ----------
  function paddleLen(p, e) {
    let L = Math.min(e.len * 0.34, 92);
    if (p.eff.grow > 0) L *= 1.6;
    if (p.eff.shrink > 0) L *= 0.6;
    return Math.min(L, e.len * 0.8);
  }
  function paddleRange(p, e) {
    const L = paddleLen(p, e), margin = L / 2 + 8;
    return { L, margin, range: Math.max(1, e.len - 2 * margin) };
  }
  function paddleSeg(s, p) {
    const e = s.sides[p.side];
    if (!e || !p.alive) return null;
    const { L, margin, range } = paddleRange(p, e);
    const d = margin + p.pos * range;
    const cx = e.a.x + e.ux * d + e.nx * PADDLE_INSET, cy = e.a.y + e.uy * d + e.ny * PADDLE_INSET;
    return { e, L, cx, cy, ax: cx - e.ux * L / 2, ay: cy - e.uy * L / 2, bx: cx + e.ux * L / 2, by: cy + e.uy * L / 2 };
  }
  function movePaddle(s, p, dt) {
    const e = s.sides[p.side];
    if (!e || !p.alive) return;
    const { range } = paddleRange(p, e);
    const sp = PADDLE_SPEED * (p.eff.speed > 0 ? 1.7 : 1) / range * dt;
    const rev = p.eff.rev > 0;
    let tgt;
    if (p.useAxis) tgt = p.pos + (rev ? -p.axis : p.axis) * sp;
    else tgt = rev ? 1 - p.target : p.target;
    tgt = clamp(tgt, 0, 1);
    p.pos += clamp(tgt - p.pos, -sp, sp);
  }
  function setInput(s, id, m) {
    const p = s.players[id];
    if (!p || !m) return;
    if (typeof m.a === 'number' && isFinite(m.a)) { p.useAxis = true; p.axis = clamp(m.a, -1, 1); }
    else if (typeof m.t === 'number' && isFinite(m.t)) { p.useAxis = false; p.target = clamp(m.t, 0, 1); }
  }

  // ---------- bots ----------
  function botThink(s, p, dt) {
    const e = s.sides[p.side];
    if (!e) return;
    p.ai.t -= dt;
    if (p.ai.t > 0) return;
    p.ai.t = 0.07 + (1 - p.skill) * 0.2;
    const { L, margin, range } = paddleRange(p, e);
    let best = null, bt = 1e9;
    for (const b of s.balls) {
      const d = (b.x - e.a.x) * e.nx + (b.y - e.a.y) * e.ny - PADDLE_INSET;
      const vn = b.vx * e.nx + b.vy * e.ny;
      if (vn < -1) { const t = d / -vn; if (t < bt) { bt = t; best = b; } }
    }
    let along;
    if (best && bt < 3.5) {
      along = (best.x + best.vx * bt - e.a.x) * e.ux + (best.y + best.vy * bt - e.a.y) * e.uy;
      const key = best.id + ':' + best.last;
      if (p.ai.key !== key) {
        p.ai.key = key;
        p.ai.err = (Math.random() * 2 - 1) * (1 - p.skill) * 115;
        p.ai.aim = (Math.random() * 2 - 1) * L * 0.3;
      }
      along += p.ai.err + p.ai.aim;
    } else {
      along = e.len / 2 + Math.sin(s.time * 0.7 + p.id) * e.len * 0.12;
    }
    p.useAxis = false;
    p.target = clamp((along - margin) / range, 0, 1);
  }

  function ghostTick(s, p, dt) {
    if (s.phase !== 'play') return;
    p.hazCd = Math.max(0, p.hazCd - dt);
    p.chargeT += dt;
    if (p.chargeT >= 12) {
      p.chargeT = 0;
      if (p.charges.well + p.charges.bar < 4) { if (Math.random() < 0.5) p.charges.well++; else p.charges.bar++; }
    }
    if (!p.bot) return;
    p.hazT -= dt;
    if (p.hazT > 0) return;
    p.hazT = rand(5, 10);
    let kind = null;
    if (p.charges.well > 0 && p.charges.bar > 0) kind = Math.random() < 0.5 ? 'well' : 'bar';
    else if (p.charges.well > 0) kind = 'well';
    else if (p.charges.bar > 0) kind = 'bar';
    if (!kind) return;
    const targets = s.sides.filter(e => s.players[e.owner] && s.players[e.owner].team !== p.team);
    const e = (targets.length ? targets : s.sides)[(Math.random() * (targets.length || s.sides.length)) | 0];
    if (!e) return;
    const f = rand(0.35, 0.6);
    placeHazard(s, p.id, kind, e.mx * f + rand(-30, 30), e.my * f + rand(-30, 30));
  }

  function placeHazard(s, id, kind, x, y) {
    const p = s.players[id];
    if (!p || p.alive || s.phase !== 'play') return false;
    if (kind !== 'well' && kind !== 'bar') return false;
    if (p.hazCd > 0 || !(p.charges[kind] > 0) || s.hazards.length >= MAX_HAZARDS) return false;
    if (!isFinite(x) || !isFinite(y)) return false;
    const d = Math.hypot(x, y), lim = R * 0.62;
    if (d > lim) { x *= lim / d; y *= lim / d; }
    if (!inside(s, x, y, 45)) return false;
    p.charges[kind]--; p.hazCd = 1.5;
    s.hazards.push({ id: s.uid++, kind, x, y, ang: rand(0, Math.PI), t: kind === 'well' ? 7 : 8, by: id });
    s.events.push({ e: 'haz', p: id, k: kind, x: x | 0, y: y | 0 });
    return true;
  }

  // ---------- power-ups ----------
  function pickPower() {
    let tot = 0;
    for (const k of POWER_TYPES) tot += POWERUPS[k].w;
    let r = Math.random() * tot;
    for (const k of POWER_TYPES) { r -= POWERUPS[k].w; if (r <= 0) return k; }
    return 'grow';
  }
  function spawnPowerup(s) {
    if (s.powerups.length >= 2) return;
    for (let tries = 0; tries < 24; tries++) {
      const a = rand(0, Math.PI * 2), r = rand(40, R * 0.5);
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (!inside(s, x, y, 60)) continue;
      let ok = true;
      for (const c of s.obs.circles) if (Math.hypot(c.x - x, c.y - y) < c.r + 40) ok = false;
      for (const u of s.powerups) if (Math.hypot(u.x - x, u.y - y) < 60) ok = false;
      if (!ok) continue;
      s.powerups.push({ id: s.uid++, x, y, type: pickPower(), t: 12 });
      s.events.push({ e: 'spawn' });
      return;
    }
  }
  function opponents(s, p) { return s.players.filter(q => q.alive && q.team !== p.team); }
  function applyPower(s, p, type, b) {
    switch (type) {
      case 'grow': p.eff.grow = 10; p.eff.shrink = 0; break;
      case 'shrink': for (const q of opponents(s, p)) q.eff.shrink = 8; break;
      case 'speed': p.eff.speed = 10; break;
      case 'shield': p.eff.shield = 8; break;
      case 'heart': p.hearts = Math.min(MAX_HEARTS, p.hearts + 1); break;
      case 'slow': s.slowT = 6; break;
      case 'reverse': for (const q of opponents(s, p)) q.eff.rev = 6; break;
      case 'multi': {
        const a = Math.atan2(b.vy, b.vx);
        for (const da of [-0.5, 0.5]) {
          if (s.balls.length >= MAX_BALLS) break;
          s.balls.push({ id: s.uid++, x: b.x, y: b.y, vx: Math.cos(a + da) * b.spd, vy: Math.sin(a + da) * b.spd, spd: b.spd, last: p.id, idle: 0 });
        }
        break;
      }
    }
    s.events.push({ e: 'pu', p: p.id, k: type });
  }

  // ---------- flow ----------
  // big lobbies serve two balls; after 2.5 minutes every serve adds a rush ball
  function serve(s) {
    const alive = s.sides.length;
    const count = (alive >= 6 ? 2 : 1) + (s.time > 150 ? 1 : 0);
    const first = (Math.random() * alive) | 0;
    for (let i = 0; i < count; i++) {
      const e = s.sides[(first + Math.round(i * alive / count)) % alive];
      if (!e) return;
      const t = rand(0.3, 0.7);
      const tx = e.a.x + e.ux * e.len * t, ty = e.a.y + e.uy * e.len * t;
      const d = Math.hypot(tx, ty) || 1;
      s.balls.push({ id: s.uid++, x: tx / d * 30, y: ty / d * 30, vx: tx / d * BASE_SPEED, vy: ty / d * BASE_SPEED, spd: BASE_SPEED, last: -1, idle: 0 });
    }
    s.events.push({ e: 'serve', n: count, rush: s.time > 150 });
  }

  function checkWin(s) {
    const alive = s.players.filter(p => p.alive);
    const over = s.mode === 'teams' ? new Set(alive.map(p => p.team)).size <= 1 : alive.length <= 1;
    if (!over) return false;
    s.phase = 'over'; s.balls = [];
    s.winner = alive.length ? alive[0].id : -1;
    s.winnerTeam = alive.length ? alive[0].team : -1;
    alive.forEach(p => { p.place = 1; });
    s.events.push({ e: 'over', w: s.winner, wt: s.winnerTeam });
    return true;
  }

  function goal(s, victimId, b) {
    const i = s.balls.indexOf(b);
    if (i >= 0) s.balls.splice(i, 1);
    const v = s.players[victimId];
    if (!v || !v.alive) return;
    v.hearts -= 1; s.round++;
    s.events.push({ e: 'goal', v: v.id, by: b.last, x: b.x | 0, y: b.y | 0 });
    if (v.hearts <= 0) {
      const aliveBefore = s.players.filter(p => p.alive).length;
      v.alive = false; v.place = aliveBefore;
      v.charges = { well: 1, bar: 1 }; v.chargeT = 0; v.hazCd = 1;
      v.eff = { grow: 0, shrink: 0, speed: 0, shield: 0, rev: 0 };
      s.events.push({ e: 'out', v: v.id });
      s.balls = [];
      rebuild(s);
      if (checkWin(s)) return;
      s.phase = 'point'; s.timer = 2.2;
    } else if (s.balls.length === 0) {
      s.phase = 'point'; s.timer = 1.2;
    }
  }

  // one physics sub-step for a ball; returns 'gone' when removed
  function ballStep(s, b, h, visual) {
    const o = s.obs;
    for (const w of o.wells) {
      const dx = w.x - b.x, dy = w.y - b.y, d = Math.hypot(dx, dy);
      if (d < w.r && d > 1) {
        const f = w.pow * (1 - d / w.r) * h;
        b.vx += dx / d * f; b.vy += dy / d * f;
        setSpeed(b, b.spd);
      }
    }
    const k = s.slowT > 0 ? 0.6 : 1;
    b.x += b.vx * h * k; b.y += b.vy * h * k;
    b.idle = (b.idle || 0) + h;

    // paddles
    for (const p of s.players) {
      if (!p.alive) continue;
      const g = paddleSeg(s, p);
      if (!g) continue;
      if (capsuleDist(b, g.ax, g.ay, g.bx, g.by) >= BALL_R + PADDLE_TH / 2) continue;
      const e = g.e;
      const vn = b.vx * e.nx + b.vy * e.ny;
      const nd = (b.x - g.cx) * e.nx + (b.y - g.cy) * e.ny;
      if (vn >= 0 || nd < -PADDLE_TH * 0.5) continue;
      const along = (b.x - g.cx) * e.ux + (b.y - g.cy) * e.uy;
      const ang = clamp(along / (g.L / 2), -1, 1) * 1.0;
      const c = Math.cos(ang), sn = Math.sin(ang);
      if (!visual) b.spd = Math.min(MAX_SPEED, b.spd + HIT_BOOST);
      b.vx = (e.nx * c + e.ux * sn) * b.spd;
      b.vy = (e.ny * c + e.uy * sn) * b.spd;
      const need = BALL_R + PADDLE_TH / 2 + 0.5;
      if (nd < need) { b.x += e.nx * (need - nd); b.y += e.ny * (need - nd); }
      b.last = p.id; b.idle = 0;
      if (!visual) s.events.push({ e: 'hit', p: p.id });
    }

    // shields turn a goal line into a wall
    for (const p of s.players) {
      if (!p.alive || p.eff.shield <= 0) continue;
      const e = s.sides[p.side];
      if (!e) continue;
      const d = (b.x - e.a.x) * e.nx + (b.y - e.a.y) * e.ny;
      const vn = b.vx * e.nx + b.vy * e.ny;
      if (d < BALL_R && d > -BALL_R * 3 && vn < 0) {
        const t = (b.x - e.a.x) * e.ux + (b.y - e.a.y) * e.uy;
        if (t > -BALL_R && t < e.len + BALL_R) {
          b.vx -= 2 * vn * e.nx; b.vy -= 2 * vn * e.ny;
          b.x += e.nx * (BALL_R - d); b.y += e.ny * (BALL_R - d);
          if (!visual) s.events.push({ e: 'shield', p: p.id });
        }
      }
    }

    // side walls (2-player court)
    for (const e of s.walls) {
      const d = (b.x - e.a.x) * e.nx + (b.y - e.a.y) * e.ny;
      const vn = b.vx * e.nx + b.vy * e.ny;
      if (d < BALL_R && vn < 0) {
        b.vx -= 2 * vn * e.nx; b.vy -= 2 * vn * e.ny;
        b.x += e.nx * (BALL_R - d); b.y += e.ny * (BALL_R - d);
        // keep the rally moving toward a goal
        if (Math.abs(b.vy) < b.spd * 0.35) { b.vy = (b.vy < 0 ? -1 : 1) * b.spd * 0.35; setSpeed(b, b.spd); }
        if (!visual) s.events.push({ e: 'wall' });
      }
    }

    // obstacles & hazards
    for (const c of o.circles) {
      if (collideCapsule(b, c.x, c.y, c.x, c.y, c.r, visual ? 0 : c.bump) && !visual) s.events.push({ e: 'bump', k: c.kind, x: c.x | 0, y: c.y | 0 });
    }
    for (const g of o.segs) {
      if (collideCapsule(b, g.ax, g.ay, g.bx, g.by, g.r, 0) && !visual) s.events.push({ e: 'wall' });
    }

    // power-ups: claimed by whoever touched the ball last
    if (!visual) {
      for (let i = s.powerups.length - 1; i >= 0; i--) {
        const u = s.powerups[i];
        if (Math.hypot(u.x - b.x, u.y - b.y) < BALL_R + 16) {
          const p = s.players[b.last];
          if (p && p.alive) { s.powerups.splice(i, 1); applyPower(s, p, u.type, b); }
        }
      }
    }

    // goals
    let worst = null, wd = 0;
    for (const e of s.sides) {
      const d = (b.x - e.a.x) * e.nx + (b.y - e.a.y) * e.ny;
      if (d < wd) { wd = d; worst = e; }
    }
    if (worst && wd < -BALL_R * 2) {
      if (visual) {
        if (wd < -70) { const i = s.balls.indexOf(b); if (i >= 0) s.balls.splice(i, 1); return 'gone'; }
        return;
      }
      goal(s, worst.owner, b);
      return 'gone';
    }

    // anti-stall nudge
    if (!visual && b.idle > 6 && s.sides.length) {
      b.idle = 0;
      const e = s.sides[(Math.random() * s.sides.length) | 0];
      const tx = e.mx - b.x, ty = e.my - b.y, d = Math.hypot(tx, ty) || 1;
      b.vx = b.vx * 0.4 + tx / d * b.spd * 0.6; b.vy = b.vy * 0.4 + ty / d * b.spd * 0.6;
      setSpeed(b, b.spd);
    }
  }

  // advance the match. visual=true is used by online clients between snapshots
  // (moves balls and bounces them, but never scores, spawns or emits events).
  function step(s, dt, visual) {
    dt = Math.min(dt, 0.05);
    s.time += dt;
    s.obs = obstacles(s);
    if (s.phase === 'over') return;

    for (const p of s.players) {
      for (const k in p.eff) if (p.eff[k] > 0) p.eff[k] = Math.max(0, p.eff[k] - dt);
      if (visual) continue;
      if (p.alive) { if (p.bot) botThink(s, p, dt); movePaddle(s, p, dt); }
      else ghostTick(s, p, dt);
    }

    if (s.phase === 'countdown' || s.phase === 'point') {
      if (visual) { s.timer = Math.max(0, s.timer - dt); return; }
      s.timer -= dt;
      if (s.timer <= 0) { s.phase = 'play'; serve(s); }
      return;
    }

    if (s.slowT > 0) s.slowT = Math.max(0, s.slowT - dt);
    for (const h of s.hazards) h.t -= dt;
    for (const u of s.powerups) u.t -= dt;
    if (!visual) {
      s.hazards = s.hazards.filter(h => h.t > 0);
      s.powerups = s.powerups.filter(u => u.t > 0);
      s.nextPU -= dt;
      if (s.nextPU <= 0) { spawnPowerup(s); s.nextPU = rand(5, 8); }
    }

    let maxV = 0;
    for (const b of s.balls) maxV = Math.max(maxV, b.spd);
    const sub = Math.max(1, Math.ceil(maxV * dt / (BALL_R * 0.7)));
    const h = dt / sub;
    for (let i = 0; i < sub; i++) {
      for (const b of s.balls.slice()) {
        if (s.balls.indexOf(b) < 0) continue;
        ballStep(s, b, h, visual);
        if (s.phase !== 'play') return;
      }
    }
    if (!visual) for (const b of s.balls) { b.spd = Math.min(MAX_SPEED, b.spd + RAMP * dt); setSpeed(b, b.spd); }
  }

  // ---------- network snapshots ----------
  function snapshot(s) {
    return {
      tm: r3(s.time), ph: s.phase, ti: r1(s.timer), rd: s.round, sl: r1(s.slowT), w: s.winner, wt: s.winnerTeam,
      p: s.players.map(p => [p.hearts, p.alive ? 1 : 0, r3(p.pos), r1(p.eff.grow), r1(p.eff.shrink), r1(p.eff.speed),
        r1(p.eff.shield), r1(p.eff.rev), p.charges.well, p.charges.bar, p.place, p.bot ? 1 : 0, r1(p.hazCd)]),
      b: s.balls.map(b => [b.id, r1(b.x), r1(b.y), r1(b.vx), r1(b.vy), b.last, r1(b.spd)]),
      u: s.powerups.map(u => [u.id, r1(u.x), r1(u.y), u.type, r1(u.t)]),
      h: s.hazards.map(h => [h.id, h.kind, r1(h.x), r1(h.y), r3(h.ang), r1(h.t)]),
      ev: s.events,
    };
  }

  // apply a server snapshot to a client-side state; returns the events it carried
  function applySnapshot(s, n) {
    s.time = n.tm; s.phase = n.ph; s.timer = n.ti; s.round = n.rd; s.slowT = n.sl; s.winner = n.w; s.winnerTeam = n.wt;
    let changed = false;
    n.p.forEach((a, i) => { const p = s.players[i]; if (p && !!a[1] !== p.alive) { p.alive = !!a[1]; changed = true; } });
    if (changed) rebuild(s);
    n.p.forEach((a, i) => {
      const p = s.players[i];
      if (!p) return;
      p.hearts = a[0]; p.netPos = a[2];
      if (changed) p.pos = a[2];
      p.eff.grow = a[3]; p.eff.shrink = a[4]; p.eff.speed = a[5]; p.eff.shield = a[6]; p.eff.rev = a[7];
      p.charges.well = a[8]; p.charges.bar = a[9]; p.place = a[10]; p.bot = !!a[11]; p.hazCd = a[12] || 0;
    });
    const old = new Map(s.balls.map(b => [b.id, b]));
    s.balls = n.b.map(a => {
      let b = old.get(a[0]);
      if (b) {
        let ox = b.x + (b.ox || 0) - a[1], oy = b.y + (b.oy || 0) - a[2];
        if (Math.hypot(ox, oy) > 60) { ox = 0; oy = 0; }
        b.ox = ox; b.oy = oy;
      } else b = { id: a[0], ox: 0, oy: 0, idle: 0 };
      b.x = a[1]; b.y = a[2]; b.vx = a[3]; b.vy = a[4]; b.last = a[5]; b.spd = a[6];
      return b;
    });
    s.powerups = n.u.map(a => ({ id: a[0], x: a[1], y: a[2], type: a[3], t: a[4] }));
    s.hazards = n.h.map(a => ({ id: a[0], kind: a[1], x: a[2], y: a[3], ang: a[4], t: a[5] }));
    return n.ev || [];
  }

  return {
    R, BALL_R, PADDLE_TH, PADDLE_INSET, WALL_T, START_HEARTS, MAX_HEARTS,
    COLORS, TEAM_NAMES, POWERUPS, POWER_TYPES, ARENAS,
    createMatch, startInfo, cleanCos, rebuild, inside, step, setInput, movePaddle, paddleSeg, paddleRange,
    placeHazard, obstacles, snapshot, applySnapshot,
  };
});
