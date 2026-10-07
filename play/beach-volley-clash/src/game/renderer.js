import { VIEW, COURT, PHYS, TEAM, POWERS } from '../config.js';
import { predictLanding } from './physics.js';
import { POWER_META } from './powers.js';

// Scenery is laid out by hand rather than randomised, so the beach reads as a
// real place and looks the same on every reload. Everything is in world units
// of the 1600x900 canvas.
//
// Depth is faked with three bands: far (islands, birds), mid (sea, palms,
// parasols) and near (the court). Anything far is tinted towards the sky so the
// eye reads it as distance.
const HORIZON = 552;   // waterline
const SHORE_Y = 706;   // where the surf meets the sand
const SUN = { x: 1310, y: 152, r: 66 };

/**
 * The one font stack, used by every string the canvas draws.
 *
 * It has to match --hud-font in styles/main.css: the HUD is DOM and the popups
 * are canvas, and when the two disagree the same word is set in two different
 * typefaces on the same screen. Three of the four canvas calls used to say
 * `system-ui` and the fourth said `"Baloo 2", system-ui`, which is exactly that
 * bug.
 *
 * Note that none of the named faces are bundled - assets/fonts/ is empty and
 * there is no @font-face - so today every platform lands on its own system
 * font. Dropping a woff2 in and declaring it is the single change that makes
 * the game look the same everywhere.
 */
const HUD_FONT = '"Baloo 2","Fredoka","Nunito",system-ui,-apple-system,"Segoe UI",sans-serif';

const CLOUDS = [
  { x: 180, y: 150, s: 1.0, drift: 5 },   { x: 520, y: 95, s: 0.7, drift: 8 },
  { x: 980, y: 130, s: 1.2, drift: 4 },   { x: 1380, y: 92, s: 0.85, drift: 7 },
  { x: 760, y: 258, s: 0.55, drift: 11 }, { x: 1180, y: 306, s: 0.45, drift: 13 }
];

// Headlands on the horizon. Each is an arc of `r` whose centre sits `sink`
// below the waterline, so only the cap shows.
const ISLANDS = [
  { x: 210, r: 165, sink: 118, tint: 0.55, palms: [-52, 18] },
  { x: 1290, r: 210, sink: 158, tint: 0.42, palms: [-70, 0, 66] }
];

const BIRDS = [
  { x: 430, y: 205, s: 1.0, speed: 14 },
  { x: 500, y: 178, s: 0.75, speed: 14 },
  { x: 1090, y: 165, s: 0.85, speed: 9 }
];

// Trunks sit outside the side walls so the fronds frame the shot without ever
// hanging over the rally.
const PALMS = [
  { x: 18, lean: -1, h: 300, scale: 1.0 },
  { x: 1582, lean: 1, h: 330, scale: 1.1 }
];

const PARASOLS = [
  { x: 150, c: '#ff5f52', h: 132, towel: '#5ecbf0' },
  { x: 1450, c: '#ffc31e', h: 124, towel: '#ff8fb1' }
];

// Small props along the back of the beach. None of them enter the court.
const PROPS = [
  { kind: 'cooler', x: 262, y: 758 },
  { kind: 'ball',   x: 1362, y: 760 },
  { kind: 'tuft',   x: 92,   y: 752 },
  { kind: 'tuft',   x: 206,  y: 746 },
  { kind: 'tuft',   x: 1418, y: 748 },
  { kind: 'tuft',   x: 1524, y: 756 }
];

export class Renderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assets;
    this.particles = [];
    this.rings = [];
    this.popups = [];
    this.flashes = [];
    this.shake = 0;
    this.time = 0;
    this.rect = { x: 0, y: 0, w: VIEW.W, h: VIEW.H, scale: 1 };
    this.coachPrompt = null;   // set by the game loop, cleared when coaching ends
  }

  /** Fits the 1600x900 world into the window and reports the on-screen rect. */
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    const scale = Math.min(w / VIEW.W, h / VIEW.H);
    const dw = Math.round(VIEW.W * scale), dh = Math.round(VIEW.H * scale);

    this.canvas.width = Math.round(dw * dpr);
    this.canvas.height = Math.round(dh * dpr);
    this.canvas.style.width = dw + 'px';
    this.canvas.style.height = dh + 'px';
    this.dpr = dpr;

    this.rect = { x: Math.round((w - dw) / 2), y: Math.round((h - dh) / 2), w: dw, h: dh, scale };
    return this.rect;
  }

  // ---------------- effects API ----------------
  //
  // Everything the game can throw on screen goes through four primitives:
  // particles (with a shape and a gravity scale), expanding rings, floating
  // text, and a full-screen colour flash. Every VFX in the game is a
  // combination of those, which keeps the draw loop small.

  burst(x, y, n, color, speed = 320, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = opts.angle !== undefined
        ? opts.angle + (Math.random() - 0.5) * (opts.spread ?? Math.PI * 2)
        : Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.particles.push({
        x: x + (Math.random() - 0.5) * (opts.jitter || 0),
        y: y + (Math.random() - 0.5) * (opts.jitter || 0),
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - (opts.lift ?? 80),
        life: (opts.life ?? 0.5) + Math.random() * 0.4, age: 0, color,
        r: (opts.size ?? 3) + Math.random() * (opts.sizeVar ?? 5),
        gravity: opts.gravity ?? 900,
        shape: opts.shape || 'dot',
        spin: (Math.random() - 0.5) * 12,
        rot: Math.random() * 6.28,
        drag: opts.drag ?? 0,
        glow: opts.glow || false
      });
    }
  }

  /** An expanding outline — impacts, power activations, freezes. */
  ring(x, y, opts = {}) {
    this.rings.push({
      x, y, age: 0,
      life: opts.life ?? 0.45,
      from: opts.from ?? 10,
      to: opts.to ?? 140,
      color: opts.color || 'rgba(255,255,255,ALPHA)',
      width: opts.width ?? 6,
      squash: opts.squash ?? 1
    });
  }

  /** Canvas-space floating text: POWER names, combo counts, point reasons. */
  popup(x, y, text, opts = {}) {
    this.popups.push({
      x, y, text, age: 0,
      life: opts.life ?? 1.1,
      color: opts.color || '#ffffff',
      stroke: opts.stroke || '#0b1122',
      size: opts.size ?? 44,
      rise: opts.rise ?? 90,
      shake: opts.shake ?? 0
    });
  }

  /** Tints the whole screen for a moment. Used sparingly — it is loud. */
  flash(color, strength = 0.5, seconds = 0.28) {
    this.flashes.push({ color, strength, age: 0, life: seconds });
  }

  /** Persistent emitter that follows a moving ball (fire trail, frost trail). */
  emitBallTrail(ball, dt) {
    if (ball.kind === 'normal') return;
    const speed = Math.hypot(ball.vx, ball.vy);
    const rate = ball.kind === 'fire' ? 90 : 55;
    const n = Math.min(6, Math.round(rate * dt * (0.5 + speed / 1400)));
    for (let i = 0; i < n; i++) {
      // Spread the spawn along the segment travelled this frame, otherwise a
      // fast ball leaves a dotted line instead of a flame.
      const back = Math.random();
      const px = ball.x - ball.vx * dt * back;
      const py = ball.y - ball.vy * dt * back;
      if (ball.kind === 'fire') {
        this.particles.push({
          x: px, y: py,
          vx: (Math.random() - 0.5) * 90 - ball.vx * 0.05,
          vy: (Math.random() - 0.5) * 90 - 140,
          life: 0.28 + Math.random() * 0.3, age: 0,
          color: Math.random() < 0.35 ? 'rgba(255,238,150,ALPHA)' : 'rgba(255,120,26,ALPHA)',
          r: 7 + Math.random() * 12, gravity: -260, shape: 'flame',
          spin: 0, rot: 0, drag: 2.2, glow: true
        });
      } else {
        this.particles.push({
          x: px, y: py,
          vx: (Math.random() - 0.5) * 70,
          vy: (Math.random() - 0.5) * 70 + 40,
          life: 0.5 + Math.random() * 0.4, age: 0,
          color: Math.random() < 0.4 ? 'rgba(223,251,255,ALPHA)' : 'rgba(87,217,255,ALPHA)',
          r: 4 + Math.random() * 7, gravity: 120, shape: 'shard',
          spin: (Math.random() - 0.5) * 10, rot: Math.random() * 6.28, drag: 1.4, glow: true
        });
      }
    }
  }

  updateEffects(dt) {
    this.shake = Math.max(0, this.shake - dt * 3);
    this.time += dt;

    for (const p of this.particles) {
      p.age += dt;
      p.vy += (p.gravity ?? 900) * dt;
      if (p.drag) { const k = 1 - p.drag * dt; p.vx *= k; p.vy *= k; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
    }
    this.particles = this.particles.filter((p) => p.age < p.life);
    // A runaway effect must never be allowed to tank the frame rate.
    if (this.particles.length > 620) this.particles.splice(0, this.particles.length - 620);

    for (const r of this.rings) r.age += dt;
    this.rings = this.rings.filter((r) => r.age < r.life);

    for (const p of this.popups) { p.age += dt; }
    this.popups = this.popups.filter((p) => p.age < p.life);

    for (const f of this.flashes) f.age += dt;
    this.flashes = this.flashes.filter((f) => f.age < f.life);
  }

  draw(match, dt) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.scale(this.rect.scale, this.rect.scale);

    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake * 14, (Math.random() - 0.5) * this.shake * 14);
    }

    this.drawSky(ctx);
    this.drawSea(ctx);
    this.drawShore(ctx);
    this.drawSand(ctx);
    this.drawNetBack(ctx);

    if (match) {
      this.drawLandingMarkers(ctx, match);
      for (const p of match.players) this.drawShadow(ctx, p.x, p.y, PHYS.playerRadius * 1.1);
      for (const b of match.balls) this.drawShadow(ctx, b.x, COURT.groundY, b.r * 0.9, b.y);
      this.drawOrbs(ctx, match, dt);
      // Back-court players first so the near side overlaps correctly.
      const sorted = [...match.players].sort((a, b) => a.y - b.y);
      for (const p of sorted) this.drawPlayer(ctx, p, match, dt);
      for (const b of match.balls) {
        this.emitBallTrail(b, dt);
        this.drawBall(ctx, b);
      }
    }

    this.drawNetFront(ctx);
    this.drawCoachPrompt(ctx, this.coachPrompt);
    this.drawRings(ctx);
    this.drawParticles(ctx);
    this.drawPopups(ctx);
    if (match) this.drawMultiBanner(ctx, match);
    this.drawFlashes(ctx);
  }

  // ---------------- scenery ----------------
  //
  // The whole beach is vector art drawn every frame. It is built back-to-front
  // in five passes - sky, sea, shoreline, sand, court - so anything added later
  // only has to pick the pass it belongs to.

  drawSky(ctx) {
    const bg = this.assets.background;
    if (bg) { ctx.drawImage(bg, 0, 0, VIEW.W, VIEW.H); return; }

    const t = this.time;

    const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
    g.addColorStop(0, '#0e6fc4');
    g.addColorStop(0.42, '#3fa6ec');
    g.addColorStop(0.78, '#8fd6f8');
    g.addColorStop(1, '#d9f1ff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW.W, HORIZON + 4);

    // A warm haze sitting on the waterline. Without it the sky and the sea meet
    // on a hard line and the horizon looks like a sticker.
    const haze = ctx.createLinearGradient(0, HORIZON - 150, 0, HORIZON);
    haze.addColorStop(0, 'rgba(255,225,170,0)');
    haze.addColorStop(1, 'rgba(255,222,160,0.5)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, HORIZON - 150, VIEW.W, 150);

    this.drawSun(ctx, t);
    this.drawIslands(ctx);

    for (const c of CLOUDS) {
      const x = ((c.x + t * c.drift) % (VIEW.W + 320)) - 160;
      this.cloud(ctx, x, c.y, c.s);
    }
    for (const b of BIRDS) {
      const x = ((b.x + t * b.speed) % (VIEW.W + 200)) - 100;
      this.bird(ctx, x, b.y + Math.sin(t * 1.4 + b.x) * 6, b.s);
    }
  }

  drawSun(ctx, t) {
    const x = SUN.x, y = SUN.y;

    // Rays first, so the disc sits on top of them.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.06);
    ctx.fillStyle = 'rgba(255,246,196,0.07)';
    for (let i = 0; i < 12; i++) {
      ctx.rotate((Math.PI * 2) / 12);
      ctx.beginPath();
      ctx.moveTo(0, -SUN.r - 8);
      ctx.lineTo(-16, -SUN.r - 128);
      ctx.lineTo(16, -SUN.r - 128);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    const glow = ctx.createRadialGradient(x, y, SUN.r * 0.7, x, y, SUN.r * 3.1);
    glow.addColorStop(0, 'rgba(255,246,200,0.55)');
    glow.addColorStop(0.45, 'rgba(255,240,175,0.22)');
    glow.addColorStop(1, 'rgba(255,240,175,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, SUN.r * 3.1, 0, Math.PI * 2); ctx.fill();

    const disc = ctx.createRadialGradient(x - 14, y - 16, 6, x, y, SUN.r);
    disc.addColorStop(0, '#fffdf0');
    disc.addColorStop(0.7, '#fff2b8');
    disc.addColorStop(1, '#ffdf87');
    ctx.fillStyle = disc;
    ctx.beginPath(); ctx.arc(x, y, SUN.r, 0, Math.PI * 2); ctx.fill();
  }

  /** Headlands on the horizon, tinted towards the sky so they read as distant. */
  drawIslands(ctx) {
    for (const isle of ISLANDS) {
      const baseY = HORIZON + 6;
      ctx.save();
      ctx.beginPath();
      ctx.rect(isle.x - isle.r, baseY - isle.r, isle.r * 2, isle.r);
      ctx.clip();

      ctx.fillStyle = `rgba(46,110,120,${0.30 + isle.tint * 0.35})`;
      ctx.beginPath();
      ctx.arc(isle.x, baseY + isle.sink, isle.r, 0, Math.PI * 2);
      ctx.fill();

      // A lighter cap suggests sunlit scrub on the ridge.
      ctx.fillStyle = `rgba(120,180,160,${0.18 + isle.tint * 0.18})`;
      ctx.beginPath();
      ctx.arc(isle.x - isle.r * 0.18, baseY + isle.sink + 12, isle.r * 0.88, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Palm silhouettes on the ridge line, three strokes each - any more and
      // they turn to mush at this size.
      ctx.strokeStyle = `rgba(38,96,104,${0.34 + isle.tint * 0.3})`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (const off of isle.palms) {
        const px = isle.x + off;
        const top = baseY + isle.sink - Math.sqrt(Math.max(0, isle.r * isle.r - off * off)) - 2;
        ctx.beginPath();
        ctx.moveTo(px, top); ctx.lineTo(px + 2, top - 22);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + 2, top - 22);
        ctx.quadraticCurveTo(px - 12, top - 32, px - 20, top - 24);
        ctx.moveTo(px + 2, top - 22);
        ctx.quadraticCurveTo(px + 16, top - 33, px + 24, top - 25);
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
    }
  }

  cloud(ctx, x, y, s) {
    // Shadowed underside first, offset down, then the lit body over it.
    ctx.fillStyle = 'rgba(196,226,246,0.85)';
    this.cloudBlob(ctx, x, y + 9 * s, s);
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    this.cloudBlob(ctx, x, y, s);
  }

  cloudBlob(ctx, x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 34 * s, 0, Math.PI * 2);
    ctx.arc(x + 40 * s, y + 8 * s, 26 * s, 0, Math.PI * 2);
    ctx.arc(x - 38 * s, y + 10 * s, 24 * s, 0, Math.PI * 2);
    ctx.arc(x + 10 * s, y - 20 * s, 28 * s, 0, Math.PI * 2);
    ctx.arc(x - 14 * s, y - 6 * s, 30 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  bird(ctx, x, y, s) {
    ctx.strokeStyle = 'rgba(40,70,95,0.42)';
    ctx.lineWidth = 3 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 11 * s, y);
    ctx.quadraticCurveTo(x - 5 * s, y - 7 * s, x, y - 1 * s);
    ctx.quadraticCurveTo(x + 5 * s, y - 7 * s, x + 11 * s, y);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  drawSea(ctx) {
    if (this.assets.background) return;
    const t = this.time;

    const g = ctx.createLinearGradient(0, HORIZON, 0, SHORE_Y);
    g.addColorStop(0, '#0a5f9c');
    g.addColorStop(0.35, '#1287c2');
    g.addColorStop(1, '#3dbcd9');
    ctx.fillStyle = g;
    ctx.fillRect(0, HORIZON, VIEW.W, SHORE_Y - HORIZON + 20);

    // Glitter column under the sun, clipped to the water so it cannot spill on
    // to the sand.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, HORIZON, VIEW.W, SHORE_Y - HORIZON);
    ctx.clip();
    const col = ctx.createLinearGradient(SUN.x - 150, 0, SUN.x + 150, 0);
    col.addColorStop(0, 'rgba(255,244,190,0)');
    col.addColorStop(0.5, 'rgba(255,244,190,0.26)');
    col.addColorStop(1, 'rgba(255,244,190,0)');
    ctx.fillStyle = col;
    ctx.fillRect(SUN.x - 150, HORIZON, 300, SHORE_Y - HORIZON);
    ctx.restore();

    // Wave rows. Nearer rows are longer, brighter and travel faster, which is
    // most of what sells the depth.
    ctx.lineCap = 'round';
    for (let row = 0; row < 6; row++) {
      const f = row / 5;
      const y = HORIZON + 14 + row * 26;
      ctx.strokeStyle = `rgba(255,255,255,${0.26 + f * 0.42})`;
      ctx.lineWidth = 3 + f * 3;
      const dash = 40 + f * 90;
      ctx.setLineDash([dash, dash * 1.35]);
      ctx.lineDashOffset = -((t * (14 + row * 12)) % (dash * 2.35));
      ctx.beginPath();
      for (let x = 0; x <= VIEW.W; x += 20) {
        const yy = y + Math.sin((x / 90) + t * (0.8 + row * 0.22) + row) * (2 + f * 4);
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.lineCap = 'butt';
  }

  /** The surf: the white break and the wet sand it leaves behind. */
  drawShore(ctx) {
    if (this.assets.background) return;
    const t = this.time;
    const wobble = (x, amp, speed, k) => Math.sin(x / k + t * speed) * amp;

    // Wet sand, drawn first so the foam sits on top of it.
    ctx.fillStyle = '#c69a5e';
    ctx.beginPath();
    ctx.moveTo(0, SHORE_Y + 4);
    for (let x = 0; x <= VIEW.W; x += 24) ctx.lineTo(x, SHORE_Y + 4 + wobble(x, 7, 0.9, 78));
    ctx.lineTo(VIEW.W, SHORE_Y + 46); ctx.lineTo(0, SHORE_Y + 46);
    ctx.closePath(); ctx.fill();

    const wet = ctx.createLinearGradient(0, SHORE_Y + 4, 0, SHORE_Y + 46);
    wet.addColorStop(0, 'rgba(120,90,50,0.30)');
    wet.addColorStop(1, 'rgba(120,90,50,0)');
    ctx.fillStyle = wet;
    ctx.fillRect(0, SHORE_Y + 4, VIEW.W, 42);

    // The break itself, two overlapping bands so the edge is not a single line.
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, SHORE_Y - 16);
    for (let x = 0; x <= VIEW.W; x += 22) ctx.lineTo(x, SHORE_Y - 16 + wobble(x + 40, 8, 1.15, 64));
    ctx.lineTo(VIEW.W, SHORE_Y + 14); ctx.lineTo(0, SHORE_Y + 14);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.moveTo(0, SHORE_Y - 4);
    for (let x = 0; x <= VIEW.W; x += 22) ctx.lineTo(x, SHORE_Y - 4 + wobble(x, 6, 0.9, 78));
    ctx.lineTo(VIEW.W, SHORE_Y + 12); ctx.lineTo(0, SHORE_Y + 12);
    ctx.closePath(); ctx.fill();
  }

  /**
   * Everything below the surf is static: the sand, the dunes, the grain, the
   * palms, the props and the court lines never move. Painting them once into an
   * offscreen canvas and blitting it costs a third of a millisecond less per
   * frame than redrawing 500-odd shapes, which matters on the low-end laptops
   * a browser game actually runs on.
   */
  drawSand(ctx) {
    if (this.assets.background) return;

    if (!this.sandLayer) {
      const layer = document.createElement('canvas');
      layer.width = VIEW.W;
      layer.height = VIEW.H;
      this.paintSand(layer.getContext('2d'));
      this.sandLayer = layer;
    }
    ctx.drawImage(this.sandLayer, 0, 0);
  }

  paintSand(ctx) {
    const g = ctx.createLinearGradient(0, SHORE_Y + 20, 0, VIEW.H);
    g.addColorStop(0, '#f7e2b4');
    g.addColorStop(0.3, '#f0d094');
    g.addColorStop(1, '#d9a862');
    ctx.fillStyle = g;
    ctx.fillRect(0, SHORE_Y + 20, VIEW.W, VIEW.H - SHORE_Y - 20);

    // Low dunes rolling along the back of the beach, behind everything else.
    ctx.fillStyle = 'rgba(255,240,205,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, 748);
    ctx.quadraticCurveTo(220, 712, 470, 742);
    ctx.quadraticCurveTo(760, 772, 1030, 734);
    ctx.quadraticCurveTo(1330, 700, VIEW.W, 740);
    ctx.lineTo(VIEW.W, 800); ctx.lineTo(0, 800);
    ctx.closePath(); ctx.fill();

    // Deterministic speckle - a random one shimmers on every frame.
    ctx.fillStyle = 'rgba(158,108,48,0.15)';
    for (let i = 0; i < 320; i++) {
      const x = (i * 137.5) % VIEW.W;
      const y = SHORE_Y + 34 + ((i * 91.7) % 150);
      ctx.fillRect(x, y, 3, 3);
    }
    // A second, lighter grain pass gives the sand some tooth.
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    for (let i = 0; i < 200; i++) {
      const x = (i * 211.3 + 40) % VIEW.W;
      const y = SHORE_Y + 40 + ((i * 57.1) % 140);
      ctx.fillRect(x, y, 2, 2);
    }

    for (const p of PALMS) this.palm(ctx, p);
    for (const p of PROPS) this.prop(ctx, p);
    for (const p of PARASOLS) this.parasol(ctx, p);
    this.drawCourt(ctx);
  }

  /**
   * The court markings. Drawn as a shallow trapezoid - wider at the front than
   * at the back - so the flat sand reads as ground receding away from the
   * camera instead of as a wall.
   */
  drawCourt(ctx) {
    const back = COURT.groundY + 12, front = VIEW.H - 26;
    const inset = 46;
    const bl = COURT.left + inset, br = COURT.right - inset;
    const fl = COURT.left - 34, fr = COURT.right + 34;

    // Raked, slightly paler sand inside the lines.
    ctx.fillStyle = 'rgba(255,245,214,0.34)';
    ctx.beginPath();
    ctx.moveTo(bl, back); ctx.lineTo(br, back);
    ctx.lineTo(fr, front); ctx.lineTo(fl, front);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.82)';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(bl, back); ctx.lineTo(br, back);
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(fl, front); ctx.lineTo(fr, front);
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(bl, back); ctx.lineTo(fl, front);
    ctx.moveTo(br, back); ctx.lineTo(fr, front);
    ctx.stroke();

    // Centre line running out from under the net.
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(COURT.netX, back); ctx.lineTo(COURT.netX, front);
    ctx.stroke();
  }

  palm(ctx, p) {
    const baseY = 792, line = '#3b2412';
    ctx.save();
    ctx.translate(p.x, baseY);
    ctx.scale(p.scale, p.scale);

    const topX = p.lean * 54, topY = -p.h;

    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(p.lean * 6, -p.h * 0.55, topX, topY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(60,38,18,0.35)';
    ctx.lineWidth = 5;
    for (let i = 1; i < 7; i++) {
      const f = i / 7;
      const x = p.lean * 12 * f * (1 - f) + topX * f * f;
      const y = -p.h * f;
      ctx.beginPath();
      ctx.moveTo(x - 11, y); ctx.lineTo(x + 11, y - 3);
      ctx.stroke();
    }

    // Fronds sweep away from the court so they never sit over the rally.
    ctx.translate(topX, topY);
    ctx.fillStyle = '#1f8a4c';
    ctx.strokeStyle = line;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    for (let i = 0; i < 6; i++) {
      const a = (-Math.PI * 0.92) + i * 0.36;
      ctx.save();
      ctx.rotate(p.lean < 0 ? Math.PI - a : a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(70, -34, 152, -6);
      ctx.quadraticCurveTo(74, 20, 0, 16);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#c98a3a';
    ctx.beginPath(); ctx.arc(0, 6, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.lineCap = 'butt';
  }

  parasol(ctx, p) {
    const x = p.x, y = 762, line = '#3b2412';

    // Towel on the sand under it, so the parasol is not floating on a stick.
    ctx.fillStyle = 'rgba(90,60,25,0.18)';
    ctx.beginPath(); ctx.ellipse(x + 4, y + 6, 78, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.towel;
    ctx.strokeStyle = line; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    this.roundRect(ctx, x - 62, y - 6, 124, 26, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x - 62, y + 4, 124, 5);

    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - p.h); ctx.stroke();
    ctx.lineCap = 'butt';

    ctx.save();
    ctx.translate(x + 6, y - p.h);
    ctx.strokeStyle = line; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#fff8e6' : p.c;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 76, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // Scalloped fringe along the rim.
    ctx.fillStyle = '#fff8e6';
    for (let i = 0; i < 8; i++) {
      const a = Math.PI + (i + 0.5) * (Math.PI / 8);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 76, Math.sin(a) * 76, 7, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  prop(ctx, p) {
    const line = '#3b2412';
    ctx.save();
    ctx.strokeStyle = line; ctx.lineWidth = 4; ctx.lineJoin = 'round';

    if (p.kind === 'cooler') {
      ctx.fillStyle = 'rgba(90,60,25,0.16)';
      ctx.beginPath(); ctx.ellipse(p.x + 2, p.y + 20, 40, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2fa8dd';
      this.roundRect(ctx, p.x - 32, p.y - 20, 64, 40, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f2f7fb';
      this.roundRect(ctx, p.x - 36, p.y - 30, 72, 16, 6); ctx.fill(); ctx.stroke();
    } else if (p.kind === 'ball') {
      ctx.fillStyle = 'rgba(90,60,25,0.16)';
      ctx.beginPath(); ctx.ellipse(p.x + 2, p.y + 20, 24, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff8e6';
      ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff5f52';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 20);
      ctx.quadraticCurveTo(p.x + 10, p.y, p.x, p.y + 20);
      ctx.quadraticCurveTo(p.x - 10, p.y, p.x, p.y - 20);
      ctx.fill(); ctx.stroke();
    } else {
      // Grass tuft: three blades, no outline - outlines make them read as weeds.
      ctx.strokeStyle = '#4aa85c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      const blades = [[-7, -3, -22, -20], [-3, -8, -12, -30], [0, -9, 2, -34],
                      [3, -8, 13, -29], [7, -3, 23, -18]];
      for (const [bx, by, tx, ty] of blades) {
        ctx.beginPath();
        ctx.moveTo(p.x + bx, p.y);
        ctx.quadraticCurveTo(p.x + bx + by, p.y + ty * 0.55, p.x + tx, p.y + ty);
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
    }
    ctx.restore();
  }

  // ---------------- the net ----------------
  //
  // Split in two so the players pass behind the mesh: the post and its shadow
  // go down before the sprites, the mesh, tape and antenna after them.

  drawNetBack(ctx) {
    const x = COURT.netX, top = COURT.netTopY, bottom = COURT.groundY;

    // Shadow across the sand, leaning away from the sun on the right.
    ctx.fillStyle = 'rgba(120,84,36,0.20)';
    ctx.beginPath();
    ctx.moveTo(x - 14, bottom + 6);
    ctx.lineTo(x + 14, bottom + 6);
    ctx.lineTo(x - 46, VIEW.H - 34);
    ctx.lineTo(x - 76, VIEW.H - 34);
    ctx.closePath();
    ctx.fill();

    // The post, behind the mesh. Deliberately plain: anything patterned here
    // shows through the translucent net and turns the whole thing into a
    // barber pole.
    // Kept narrow on purpose. A 16px post behind a 34px mesh band filled the
    // band edge to edge and the net read as a plain pole; at 8px there is mesh
    // visible either side of it and the eye resolves the whole thing as a net.
    ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    ctx.fillStyle = '#22355c';
    this.roundRect(ctx, x - 4, top - 30, 8, bottom - top + 38, 4);
    ctx.fill(); ctx.stroke();

    // Base plate half-buried in the sand.
    ctx.fillStyle = '#1b2c4a';
    this.roundRect(ctx, x - 22, bottom - 2, 44, 15, 6);
    ctx.fill(); ctx.stroke();
  }

  drawNetFront(ctx) {
    const x = COURT.netX, top = COURT.netTopY, bottom = COURT.groundY;
    // The mesh is drawn wider than the collider. A net has thickness, and at
    // the collider's 18px the band was too thin to read as a net at all.
    const hw = COURT.netHalfWidth + 8;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x - hw, top - 2, hw * 2, bottom - top + 2);
    ctx.clip();

    // No fill behind the mesh. Backing it with a dark panel made the net opaque
    // and the whole thing read as a white tower instead of something you can
    // see the sea through. The cords are drawn twice - a dark pass offset by a
    // pixel, then the white - so they hold up against both the bright sky and
    // the pale sand.
    // Diagonals, not a grid. A grid of horizontal rules across a narrow band
    // reads as the gradations on a thermometer; crossed diagonals read as
    // netting immediately, even at a couple of dozen pixels wide.
    const step = 22;
    const mesh = (color, off, width) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (let y = top - hw * 2; y < bottom + hw * 2; y += step) {
        ctx.moveTo(x - hw, y + off);              ctx.lineTo(x + hw, y + hw * 2 + off);
        ctx.moveTo(x - hw, y + hw * 2 + off);     ctx.lineTo(x + hw, y + off);
      }
      ctx.stroke();
    };
    mesh('rgba(16,32,58,0.28)', 2, 2.5);
    mesh('rgba(255,255,255,0.8)', 0, 2);
    ctx.restore();

    // No side cords. Two solid white verticals down the edges turned the band
    // into a tube; the tape and the mesh are enough to bound it.

    // Tape along the top - the edge players actually aim over, so it gets the
    // strongest contrast on screen.
    ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, x - hw - 6, top - 16, (hw + 6) * 2, 26, 9);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(11,17,34,0.10)';
    ctx.fillRect(x - hw - 4, top + 2, (hw + 4) * 2, 6);

    // Bottom band where the mesh meets the sand.
    ctx.fillStyle = '#d8d2c4';
    this.roundRect(ctx, x - hw - 3, bottom - 18, (hw + 3) * 2, 20, 6);
    ctx.fill(); ctx.stroke();
  }


  drawShadow(ctx, x, groundOrY, r, height) {
    const y = COURT.groundY + 14;
    const h = height !== undefined ? Math.max(0, COURT.groundY - height) : Math.max(0, COURT.groundY - groundOrY);
    const shrink = 1 - Math.min(0.55, h / 900);
    ctx.fillStyle = `rgba(90,60,20,${0.28 * shrink})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.3 * shrink, r * 0.42 * shrink, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLandingMarkers(ctx, match) {
    for (const ball of match.balls) {
      if (ball.held || ball.vy < 0) continue;
      const l = predictLanding(ball);
      if (l.t > 2.2) continue;
      const a = 0.45 * (1 - l.t / 2.2);
      const meta = ball.kind === 'fire' ? POWER_META.fire : ball.kind === 'ice' ? POWER_META.ice : null;
      ctx.strokeStyle = meta ? this.rgba(meta.color, a + 0.35) : `rgba(255,255,255,${a + 0.2})`;
      ctx.lineWidth = meta ? 6 : 4;
      ctx.beginPath();
      ctx.ellipse(l.x, COURT.groundY + 12, 34, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      // A charged ball's marker pulses, so you know the danger before it lands.
      if (meta) {
        const pulse = 1 + Math.sin(this.time * 14) * 0.18;
        ctx.strokeStyle = this.rgba(meta.glow, a * 0.7);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(l.x, COURT.groundY + 12, 34 * pulse + 12, 12 * pulse + 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // ---------------- power orbs ----------------
  drawOrbs(ctx, match, dt) {
    if (!match.powers) return;
    for (const orb of match.powers.orbs) {
      const meta = POWER_META[orb.type] || POWER_META.fire;
      const fade = orb.age > orb.life - 2 ? Math.max(0, (orb.life - orb.age) / 2) : 1;
      const pulse = 1 + Math.sin(this.time * 5 + orb.id) * 0.09;
      const r = orb.r * pulse;

      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(orb.x, orb.y);

      // outer halo
      const halo = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.3);
      halo.addColorStop(0, this.rgba(meta.color, 0.45));
      halo.addColorStop(1, this.rgba(meta.color, 0));
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(0, 0, r * 2.3, 0, Math.PI * 2); ctx.fill();

      // spinning rune ring
      ctx.rotate(this.time * 1.6);
      ctx.strokeStyle = this.rgba(meta.glow, 0.9);
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.rotate(-this.time * 1.6);

      // Face of the orb. The badge art is a finished disc - ring, fill and all -
      // so it stands in for both the core and the glyph rather than being laid
      // over them. The halo and the dashed ring above are still drawn: they are
      // the moving parts, and a still PNG has none.
      if (meta.icon) {
        this.drawFitted(ctx, meta.icon, r * 2.12);
      } else {
        const core = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
        core.addColorStop(0, '#ffffff');
        core.addColorStop(0.45, meta.glow);
        core.addColorStop(1, meta.color);
        ctx.fillStyle = core;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

        this.drawPowerGlyph(ctx, orb.type, r * 0.62);
      }
      ctx.restore();

      // a few drifting sparks so the orb reads as alive
      if (Math.random() < dt * 22) {
        this.burst(orb.x, orb.y, 1, this.rgba(meta.glow, 1).replace(/[\d.]+\)$/, 'ALPHA)'),
          70, { gravity: -60, life: 0.5, size: 2, sizeVar: 3, glow: true });
      }
    }
  }

  /**
   * Draws an image centred on the origin, scaled so its longest side is `size`.
   * The badges are hand-made at slightly different sizes and none of them is
   * exactly square, so fitting by the longest side is what keeps three icons
   * looking like one set.
   */
  drawFitted(ctx, img, size) {
    const k = size / Math.max(img.width, img.height);
    const w = img.width * k, h = img.height * k;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  }

  /** The little symbol inside an orb / on a HUD chip. Used when there is no art. */
  drawPowerGlyph(ctx, type, s) {
    ctx.save();
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0b1122';
    if (type === 'fire') {
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.75, -s * 0.1, s * 0.35, s * 0.55);
      ctx.quadraticCurveTo(0, s, -s * 0.35, s * 0.55);
      ctx.quadraticCurveTo(-s * 0.75, -s * 0.1, 0, -s);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (type === 'ice') {
      ctx.strokeStyle = '#0b1122';
      ctx.lineWidth = 5;
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = '#eaffff';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
        ctx.restore();
      }
    } else {
      ctx.fillStyle = '#fdf4ff';
      for (const [dx, dy, rr] of [[-s * 0.45, s * 0.25, s * 0.42], [s * 0.45, s * 0.25, s * 0.42], [0, -s * 0.45, s * 0.42]]) {
        ctx.beginPath(); ctx.arc(dx, dy, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---------------- characters ----------------
  drawPlayer(ctx, p, match, dt = 0.016) {
    const img = p.character?.images || {};
    const pal = p.character?.palette || { skin: '#e8b184', hair: '#222', top: '#2f6fe0', bottom: '#14306b', shoe: '#fff', accent: '#ffd34d' };

    const run = Math.abs(p.vx) > 40 && p.onGround;
    const swing = run ? Math.sin(p.animTime * 16) : 0;
    const squash = 1 + p.squash * 0.5;
    const stretch = 1 - p.squash * 0.4;
    const diving = p.diveTimer > 0;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.facing, 1);
    if (diving) ctx.rotate(-0.7);
    ctx.scale(stretch, squash);

    if (p.hitFlash > 0) {
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 26 * p.hitFlash;
    }

    const body = (target) => {
      if (img.full) {
        // Single-sprite character: draw it standing on the origin.
        const h = 210, w = h * (img.full.width / img.full.height);
        target.drawImage(img.full, -w / 2, -h, w, h);
      } else {
        this.drawVectorBody(target, pal, img, swing, p, p.character || {});
      }
    };

    // Status tints go on top of whatever body was drawn, so they work for
    // sprite characters and vector ones alike.
    const tint = p.frozen > 0
      ? 'rgba(120,215,255,0.55)'
      : p.burning > 0
        ? `rgba(255,110,30,${0.42 * Math.min(1, p.burning * 2)})`
        : null;

    if (tint) this.tintedBody(ctx, body, tint);
    else body(ctx);

    ctx.restore();

    // Ice casing and embers are drawn unrotated, in world space, so they do
    // not shear with the dive rotation.
    if (p.frozen > 0) this.drawIceBlock(ctx, p);
    if (p.burning > 0) this.drawEmbers(ctx, p, dt);
    if (p.slowFactor < 1 && p.frozen <= 0) this.drawChillAura(ctx, p);
  }

  /**
   * Draws a body and tints only the body.
   *
   * This used to composite the tint straight onto the main canvas with
   * 'source-atop' and a rectangle. source-atop keeps the new paint wherever the
   * *destination* is already opaque - and by this point the destination is a
   * fully painted beach, so the rectangle tinted the sky and the sand behind
   * the player too. Every frozen or burning player stood inside a visible
   * coloured box.
   *
   * On a scratch canvas the only opaque pixels are the body itself, which is
   * what source-atop needs to mean what it was being asked to mean.
   */
  tintedBody(ctx, body, color) {
    const K = 2;                              // supersample, so it survives zoom
    const W = 260, H = 320, OX = 130, OY = 268;
    let s = this.bodyScratch;
    if (!s) {
      s = this.bodyScratch = document.createElement('canvas');
      s.width = W * K;
      s.height = H * K;
    }
    const sc = s.getContext('2d');
    sc.setTransform(1, 0, 0, 1, 0, 0);
    sc.clearRect(0, 0, s.width, s.height);
    sc.setTransform(K, 0, 0, K, OX * K, OY * K);
    body(sc);
    sc.setTransform(1, 0, 0, 1, 0, 0);
    sc.globalCompositeOperation = 'source-atop';
    sc.fillStyle = color;
    sc.fillRect(0, 0, s.width, s.height);
    sc.globalCompositeOperation = 'source-over';

    ctx.drawImage(s, -OX, -OY, W, H);
  }

  /** The block of ice a frozen player is stuck inside. */
  drawIceBlock(ctx, p) {
    const w = 108, h = 200;
    const x = p.x - w / 2, y = p.y - h;
    const wobble = Math.sin(this.time * 30) * (p.frozen < 0.35 ? 3 : 0);

    ctx.save();
    ctx.translate(wobble, 0);
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, 'rgba(200,242,255,0.55)');
    g.addColorStop(0.5, 'rgba(120,205,245,0.34)');
    g.addColorStop(1, 'rgba(180,235,255,0.5)');
    ctx.fillStyle = g;
    ctx.strokeStyle = 'rgba(235,252,255,0.9)';
    ctx.lineWidth = 5;
    this.roundRect(ctx, x, y, w, h, 16);
    ctx.fill(); ctx.stroke();

    // internal facets
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + h * 0.75); ctx.lineTo(x + w * 0.45, y + h * 0.2);
    ctx.moveTo(x + w - 16, y + h * 0.62); ctx.lineTo(x + w * 0.58, y + h * 0.12);
    ctx.moveTo(x + 20, y + h * 0.3); ctx.lineTo(x + w * 0.4, y + h * 0.55);
    ctx.stroke();

    // frost spikes on the sand
    ctx.fillStyle = 'rgba(215,246,255,0.8)';
    for (let i = -2; i <= 2; i++) {
      const sx = p.x + i * 26;
      ctx.beginPath();
      ctx.moveTo(sx - 9, p.y + 10);
      ctx.lineTo(sx, p.y - 22 - Math.abs(i) * -6);
      ctx.lineTo(sx + 9, p.y + 10);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  drawEmbers(ctx, p, dt) {
    if (Math.random() < (dt || 0.016) * 45) {
      this.burst(p.x + (Math.random() - 0.5) * 46, p.bodyY + (Math.random() - 0.5) * 70, 1,
        Math.random() < 0.4 ? 'rgba(255,240,170,ALPHA)' : 'rgba(255,120,40,ALPHA)',
        60, { gravity: -220, life: 0.45, size: 3, sizeVar: 4, glow: true, shape: 'flame' });
    }
  }

  drawChillAura(ctx, p) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(p.x, p.bodyY, 10, p.x, p.bodyY, 78);
    g.addColorStop(0, 'rgba(140,225,255,0.22)');
    g.addColorStop(1, 'rgba(140,225,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.bodyY, 78, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /**
   * The procedural character. Every anchor point here matches the collision
   * circles in config (body at bodyOffsetY, head at headOffsetY), so changing a
   * number below moves the art but never the hitbox.
   *
   * Draw order is what makes the silhouette read: back hair, back arm, back
   * leg, torso, front leg, head, front arm.
   *
   * `style` carries `hair` and `outfit` from the character manifest. Six
   * palettes recoloured the same body six times, which at this size read as one
   * character in six shirts; a ponytail and a two-piece are the difference
   * between a roster and a colour picker. Both are data, so a new character is
   * a manifest entry rather than a code change.
   */
  drawVectorBody(ctx, pal, img, swing, p, style = {}) {
    const line = '#0b1122';
    const hair = style.hair || 'short';
    const outfit = style.outfit || 'tank';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const airborne = !p.onGround;
    const diving = p.diveTimer > 0;
    const spiking = airborne && p.spikeHeld;

    // One shade darker than the kit, for the limb that is furthest from camera.
    const back = this.shade(pal.skin, -0.16);
    const backTop = this.shade(pal.top, -0.18);

    // A sleeved outfit colours the upper arm; a bare one leaves it skin.
    const sleeve = (outfit === 'tee' || outfit === 'wetsuit') ? pal.top : null;

    const legSwing = swing * 20;
    const bob = Math.abs(swing) * 3;

    ctx.save();
    ctx.translate(0, -bob);

    // ---- hair that sits behind the body
    this.hairBack(ctx, pal, line, hair);

    // ---- back arm
    this.arm(ctx, -31, -102, this.armAngle(-1, swing, airborne, spiking, diving),
      back, line, 3.5, sleeve && this.shade(sleeve, -0.18));

    // ---- legs
    this.leg(ctx, -13, -legSwing, airborne, diving, back, this.shade(pal.bottom, -0.18), this.shade(pal.shoe, -0.14), line);

    // ---- torso
    if (img.body) {
      ctx.drawImage(img.body, -26, -112, 52, 70);
    } else {
      this.torso(ctx, pal, line, outfit, backTop);
    }

    // ---- front leg, over the torso hem
    this.leg(ctx, 13, legSwing, airborne, diving, pal.skin, pal.bottom, pal.shoe, line);

    // ---- head
    if (img.head) {
      ctx.drawImage(img.head, -30, -166, 60, 60);
    } else {
      this.head(ctx, pal, line, p, hair);
    }

    // ---- front arm, last, so a spike reads clearly against the body
    this.arm(ctx, 30, -104, this.armAngle(1, swing, airborne, spiking, diving),
      pal.skin, line, 4, sleeve);

    ctx.restore();

    if (img.hat) ctx.drawImage(img.hat, -32, -196, 64, 40);
    ctx.lineCap = 'butt';
  }

  /**
   * The torso and whatever it is wearing.
   *
   * Every outfit is cut from the same shoulder-to-hem silhouette so the
   * characters stay a set; what changes is the fill, the trim and how much skin
   * is left showing.
   */
  torso(ctx, pal, line, outfit, backTop) {
    const shape = () => {
      ctx.beginPath();
      ctx.moveTo(-25, -108);
      ctx.quadraticCurveTo(-28, -78, -21, -44);
      ctx.lineTo(21, -44);
      ctx.quadraticCurveTo(28, -78, 25, -108);
      ctx.quadraticCurveTo(0, -118, -25, -108);
      ctx.closePath();
    };

    ctx.strokeStyle = line;
    ctx.lineWidth = 5;

    // A two-piece leaves the midriff bare, so the body is skin first and the
    // clothing is painted on top of it.
    ctx.fillStyle = outfit === 'twopiece' ? pal.skin : pal.top;
    shape(); ctx.fill(); ctx.stroke();

    ctx.save();
    shape(); ctx.clip();

    if (outfit === 'twopiece') {
      ctx.fillStyle = pal.top;
      ctx.fillRect(-30, -120, 60, 30);                  // the top
      ctx.fillStyle = pal.accent || '#ffd34d';
      ctx.fillRect(-30, -92, 60, 5);
      ctx.fillStyle = pal.bottom;
      ctx.fillRect(-30, -54, 60, 14);                   // the waistband
    } else if (outfit === 'jersey') {
      ctx.fillStyle = backTop;
      for (let y = -104; y < -44; y += 16) ctx.fillRect(-30, y, 60, 8);
      ctx.fillStyle = pal.accent || '#ffd34d';
      ctx.fillRect(-30, -58, 60, 6);
    } else if (outfit === 'wetsuit') {
      ctx.fillStyle = pal.accent || '#caf0f8';
      ctx.fillRect(-4, -114, 8, 74);                    // the zip
      ctx.fillStyle = backTop;
      ctx.fillRect(-30, -70, 60, 10);
    } else if (outfit === 'vest') {
      // An open vest: the chest under it is a lighter singlet.
      ctx.fillStyle = this.shade(pal.top, 0.55);
      ctx.fillRect(-11, -118, 22, 80);
      ctx.fillStyle = pal.accent || '#fee2e2';
      ctx.fillRect(-6, -96, 12, 30);                    // cross, upright
      ctx.fillRect(-15, -87, 30, 12);                   // cross, arm
    } else if (outfit === 'tee') {
      ctx.fillStyle = backTop;
      ctx.fillRect(-30, -56, 60, 14);
      ctx.fillStyle = pal.accent || '#ffd34d';
      ctx.beginPath(); ctx.arc(0, -80, 11, 0, Math.PI * 2); ctx.fill();
    } else {
      // 'tank': the original chest band and hem.
      ctx.fillStyle = pal.accent || '#ffd34d';
      ctx.fillRect(-30, -92, 60, 9);
      ctx.fillStyle = backTop;
      ctx.fillRect(-30, -56, 60, 14);
    }
    ctx.restore();

    // Collar, and the straps that make a tank or a two-piece read as one.
    ctx.strokeStyle = line; ctx.lineWidth = 4;
    if (outfit === 'tank' || outfit === 'twopiece') {
      ctx.beginPath();
      ctx.moveTo(-16, -110); ctx.lineTo(-11, -96);
      ctx.moveTo(16, -110); ctx.lineTo(11, -96);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-11, -110);
      ctx.quadraticCurveTo(0, -100, 11, -110);
      ctx.stroke();
    }
  }

  /** Hair drawn behind the head - long styles and the tail of a ponytail. */
  hairBack(ctx, pal, line, hair) {
    if (hair !== 'long' && hair !== 'ponytail') return;
    ctx.fillStyle = this.shade(pal.hair, -0.18);
    ctx.strokeStyle = line;
    ctx.lineWidth = 4;

    if (hair === 'long') {
      ctx.beginPath();
      ctx.moveTo(-26, -160);
      ctx.quadraticCurveTo(-40, -110, -30, -66);
      ctx.lineTo(-8, -70);
      ctx.quadraticCurveTo(-16, -114, -10, -158);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(26, -160);
      ctx.quadraticCurveTo(40, -110, 30, -66);
      ctx.lineTo(8, -70);
      ctx.quadraticCurveTo(16, -114, 10, -158);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      // Ponytail, swept back off the crown.
      ctx.beginPath();
      ctx.moveTo(-20, -158);
      ctx.quadraticCurveTo(-52, -150, -46, -112);
      ctx.quadraticCurveTo(-34, -126, -20, -136);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  armAngle(side, swing, airborne, spiking, diving) {
    if (diving) return side > 0 ? -1.85 : -1.45;
    if (spiking) return side > 0 ? -2.55 : -2.0;
    if (airborne) return side > 0 ? -2.15 : -1.75;
    return -swing * 0.8 * side + side * 0.2;
  }

  arm(ctx, x, y, angle, skin, line, width, sleeve = null) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);   // the arm is authored pointing down, so 0 = at rest
    ctx.fillStyle = skin;
    ctx.strokeStyle = line;
    ctx.lineWidth = width;
    this.roundRect(ctx, -7.5, -4, 15, 44, 7.5);
    ctx.fill(); ctx.stroke();
    if (sleeve) {
      // Drawn over the top of the arm, so a sleeve length is one number.
      ctx.fillStyle = sleeve;
      this.roundRect(ctx, -8, -4, 16, 18, 7);
      ctx.fill(); ctx.stroke();
    }
    // Hand.
    ctx.beginPath();
    ctx.arc(0, 42, 9, 0, Math.PI * 2);
    ctx.fillStyle = skin;
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  leg(ctx, x, swingDeg, airborne, diving, skin, shorts, shoe, line) {
    ctx.save();
    ctx.translate(x, -48);
    ctx.rotate((swingDeg * Math.PI) / 180 + (airborne ? (x > 0 ? -0.3 : 0.22) : 0) + (diving ? 0.5 : 0));

    const lift = airborne ? 8 : 0;

    ctx.fillStyle = skin;
    ctx.strokeStyle = line; ctx.lineWidth = 5;
    this.roundRect(ctx, -8.5, 0, 17, 42 - lift, 8);
    ctx.fill(); ctx.stroke();

    // Shorts sit over the top of the thigh.
    ctx.fillStyle = shorts;
    this.roundRect(ctx, -11, -8, 22, 24, 8);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = shoe;
    this.roundRect(ctx, -11, 34 - lift, 25, 14, 6);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /**
   * The face and the hair on top of it. Expression is driven by state rather
   * than being static: eyes go wide and the mouth opens on a spike, and the
   * brows drop when frozen or burning.
   */
  head(ctx, pal, line, p, hair = 'short') {
    const cy = -137;   // centre of the drawn head
    const spiking = !p.onGround && p.spikeHeld;
    const hurt = p.frozen > 0 || p.burning > 0;

    // Neck.
    ctx.fillStyle = this.shade(pal.skin, -0.12);
    ctx.strokeStyle = line; ctx.lineWidth = 5;
    this.roundRect(ctx, -9, -118, 18, 16, 5);
    ctx.fill(); ctx.stroke();

    // Skull.
    ctx.fillStyle = pal.skin;
    this.roundRect(ctx, -26, -166, 52, 58, 18);
    ctx.fill(); ctx.stroke();

    // Ear on the far side of the face.
    ctx.beginPath();
    ctx.arc(-25, cy + 2, 7, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    this.hairFront(ctx, pal, line, hair);

    // Brows.
    ctx.strokeStyle = line;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-13, hurt ? -146 : -148); ctx.lineTo(-3, hurt ? -143 : -147);
    ctx.moveTo(5, hurt ? -143 : -147);   ctx.lineTo(15, hurt ? -146 : -148);
    ctx.stroke();

    // Eyes.
    const er = spiking ? 6 : 5;
    ctx.fillStyle = line;
    for (const ex of [-7, 9]) {
      ctx.beginPath();
      ctx.ellipse(ex, cy - 1, er * 0.8, er, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const ex of [-8.5, 7.5]) {
      ctx.beginPath();
      ctx.arc(ex, cy - 3, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth.
    ctx.strokeStyle = line; ctx.lineWidth = 3.5;
    if (spiking) {
      ctx.fillStyle = '#8a2b33';
      ctx.beginPath();
      ctx.ellipse(3, cy + 17, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-5, cy + 15);
      ctx.quadraticCurveTo(3, cy + (hurt ? 10 : 21), 11, cy + 15);
      ctx.stroke();
    }
  }

  /** The hair that covers the forehead. One shape per style. */
  hairFront(ctx, pal, line, hair) {
    ctx.fillStyle = pal.hair;
    ctx.strokeStyle = line;
    ctx.lineWidth = 4;

    if (hair === 'buzz') {
      // Cropped tight to the skull, no fringe at all.
      ctx.beginPath();
      ctx.moveTo(-27, -150);
      ctx.quadraticCurveTo(-30, -172, 0, -172);
      ctx.quadraticCurveTo(30, -172, 27, -150);
      ctx.quadraticCurveTo(0, -158, -27, -150);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      return;
    }

    if (hair === 'curly') {
      // A ring of tufts rather than one cap.
      for (const [dx, dy, r] of [[-24, -152, 12], [-11, -166, 14], [4, -170, 14],
                                 [19, -160, 13], [26, -146, 10]]) {
        ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      return;
    }

    if (hair === 'bun') {
      ctx.beginPath();
      ctx.arc(2, -186, 15, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.hair;
      ctx.beginPath();
      ctx.moveTo(-27, -148);
      ctx.quadraticCurveTo(-30, -174, 0, -174);
      ctx.quadraticCurveTo(30, -174, 27, -148);
      ctx.quadraticCurveTo(14, -158, 0, -156);
      ctx.quadraticCurveTo(-14, -154, -27, -148);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      return;
    }

    // 'short', 'long' and 'ponytail' share a cap with a fringe sweeping over
    // the brow; the length is drawn behind the head by hairBack().
    ctx.beginPath();
    ctx.moveTo(-27, -146);
    ctx.quadraticCurveTo(-30, -172, 0, -172);
    ctx.quadraticCurveTo(30, -172, 27, -146);
    ctx.quadraticCurveTo(16, -154, 4, -148);
    ctx.quadraticCurveTo(-8, -142, -27, -146);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  /** Lightens (t > 0) or darkens (t < 0) a #rrggbb colour by a fraction. */
  shade(hex, t) {
    const n = parseInt((hex || '#888888').slice(1), 16);
    const mix = (c) => Math.round(t < 0 ? c * (1 + t) : c + (255 - c) * t);
    const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255);
    return `rgb(${r},${g},${b})`;
  }

  /**
   * The tutorial prompt: a keycap and one word, floating over the player it is
   * talking about, with a tail pointing down at them.
   *
   * Drawn in world space rather than in the HUD so it stays glued to the player
   * as they run - a prompt in a fixed corner makes you look away from the thing
   * it is describing, which is exactly what the old lesson box did.
   */
  drawCoachPrompt(ctx, prompt) {
    if (!prompt) return;

    const caps = prompt.keys;
    const capH = 52;
    const gap = 10;
    const widths = caps.map((k) => (k.length > 1 ? 34 + k.length * 20 : 52));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (caps.length - 1);

    const bob = Math.sin(this.time * 3.4) * 5;
    // Kept clear of the side walls and of the scoreboard along the top.
    const x = Math.max(total / 2 + 30, Math.min(VIEW.W - total / 2 - 30, prompt.x));
    const y = Math.max(210, prompt.y) + bob;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Tail pointing down at the player.
    ctx.fillStyle = 'rgba(11,17,34,0.55)';
    ctx.beginPath();
    ctx.moveTo(x - 13, y + capH / 2 + 2);
    ctx.lineTo(x + 13, y + capH / 2 + 2);
    ctx.lineTo(x, y + capH / 2 + 26);
    ctx.closePath();
    ctx.fill();

    // Label above the keys.
    ctx.font = `900 34px ${HUD_FONT}`;
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0b1122';
    ctx.strokeText(prompt.label, x, y - capH / 2 - 26);
    ctx.fillStyle = '#ffd34d';
    ctx.fillText(prompt.label, x, y - capH / 2 - 26);

    // Keycaps.
    let cx = x - total / 2;
    ctx.font = `900 26px ${HUD_FONT}`;
    ctx.lineWidth = 5;
    for (let i = 0; i < caps.length; i++) {
      const w = widths[i];
      ctx.fillStyle = 'rgba(11,17,34,0.5)';
      this.roundRect(ctx, cx, y - capH / 2 + 6, w, capH, 11);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0b1122';
      this.roundRect(ctx, cx, y - capH / 2, w, capH, 11);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#101a33';
      ctx.fillText(caps[i], cx + w / 2, y + 1);
      cx += w + gap;
    }
    ctx.restore();
  }

  // ---------------- ball ----------------
  drawBall(ctx, ball) {
    const meta = ball.kind === 'fire' ? POWER_META.fire : ball.kind === 'ice' ? POWER_META.ice : null;

    // motion trail — a charged ball smears a wide comet instead of dots
    ctx.save();
    for (let i = 0; i < ball.trail.length; i++) {
      const t = ball.trail[i];
      const f = i / ball.trail.length;
      if (meta) {
        ctx.fillStyle = this.rgba(meta.color, f * 0.34);
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.r * (0.5 + 0.8 * f), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(255,255,255,${f * 0.22})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.r * (0.4 + 0.5 * f), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // aura behind a charged ball
    if (meta) {
      const pulse = 1 + Math.sin(this.time * 22) * 0.12;
      const g = ctx.createRadialGradient(ball.x, ball.y, ball.r * 0.5, ball.x, ball.y, ball.r * 2.6 * pulse);
      g.addColorStop(0, this.rgba(meta.glow, 0.6));
      g.addColorStop(0.5, this.rgba(meta.color, 0.35));
      g.addColorStop(1, this.rgba(meta.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r * 2.6 * pulse, 0, Math.PI * 2); ctx.fill();
    }

    const skin = ball.skin || {};
    const img = skin.images?.ball;

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rot);

    if (img) {
      ctx.drawImage(img, -ball.r, -ball.r, ball.r * 2, ball.r * 2);
      ctx.restore();
      return;
    }

    const colors = skin.colors || ['#ffffff', '#ff5252', '#ffd34d', '#4aa3ff'];
    this.paintBallSkin(ctx, ball.r, skin.style || 'beach', colors);

    // A charged ball is skinned over the top of whatever ball you picked, so
    // your cosmetic choice still shows through underneath.
    if (meta) this.paintCharge(ctx, ball, meta);

    ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, Math.PI * 2); ctx.stroke();

    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(-ball.r * 0.32, -ball.r * 0.36, ball.r * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /**
   * Paints one ball skin onto a unit circle of radius `r`, centred on the
   * origin and already rotated.
   *
   * Shared by the ball in flight and by the picker's preview canvas, so a skin
   * can never look like one thing on the shop card and another on the sand.
   * Every style reads `colors` positionally - [base, ...accents] - which is what
   * lets a new skin be a manifest entry rather than a code change.
   */
  paintBallSkin(ctx, r, style, colors) {
    const c = (i, fallback) => colors[i] || fallback;

    ctx.fillStyle = c(0, '#ffffff');
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

    switch (style) {
      // Wedges of colour, the classic inflatable.
      case 'beach': {
        const segs = Math.max(1, colors.length - 1);
        for (let i = 0; i < segs; i++) {
          ctx.fillStyle = c(i + 1, '#ff5252');
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, r, (i * 2 * Math.PI) / segs, ((i + 0.55) * 2 * Math.PI) / segs);
          ctx.closePath(); ctx.fill();
        }
        break;
      }

      // Three seams crossing, the way a match ball is stitched.
      case 'volley':
        ctx.strokeStyle = c(1, '#1e40af'); ctx.lineWidth = 5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 0.92, r * 0.34, (i * Math.PI) / 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      // Six panels: two bands per axis, the real six-panel volleyball.
      case 'panels': {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 3);
          ctx.fillStyle = c(1 + (i % 2), '#1e40af');
          ctx.fillRect(-r, -r * 0.30, r * 2, r * 0.60);
          ctx.restore();
        }
        ctx.restore();
        ctx.strokeStyle = 'rgba(11,17,34,0.35)'; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.save(); ctx.rotate((i * Math.PI) / 3);
          ctx.beginPath(); ctx.moveTo(-r, -r * 0.30); ctx.lineTo(r, -r * 0.30);
          ctx.moveTo(-r, r * 0.30); ctx.lineTo(r, r * 0.30);
          ctx.stroke(); ctx.restore();
        }
        break;
      }

      case 'melon':
        ctx.fillStyle = c(1, '#2e8b3a');
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c(2, '#f4f4f4');
        ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c(0, '#e8453c');
        ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#20160f';
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, r * 0.11, r * 0.19, a, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      // A five-point star, drawn as one path so the points stay sharp.
      case 'star': {
        ctx.fillStyle = c(1, '#ffd34d');
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const rad = i % 2 === 0 ? r * 0.78 : r * 0.33;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = c(2, 'rgba(11,17,34,0.5)'); ctx.lineWidth = 3; ctx.stroke();
        break;
      }

      // Arms curling out of the centre - reads as spin when the ball rotates.
      case 'swirl': {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
        const arms = 3;
        for (let a = 0; a < arms; a++) {
          ctx.fillStyle = c(1 + (a % 2), '#7b2ff7');
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let t = 0; t <= 1.01; t += 0.08) {
            const ang = (a / arms) * Math.PI * 2 + t * 2.4;
            ctx.lineTo(Math.cos(ang) * r * t, Math.sin(ang) * r * t);
          }
          for (let t = 1; t >= 0; t -= 0.08) {
            const ang = (a / arms) * Math.PI * 2 + t * 2.4 + 0.75;
            ctx.lineTo(Math.cos(ang) * r * t, Math.sin(ang) * r * t);
          }
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        break;
      }

      // Deckchair stripes, clipped to the ball.
      case 'stripe': {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
        const bands = 7, h = (r * 2) / bands;
        for (let i = 0; i < bands; i++) {
          if (i % 2 === 0) continue;
          ctx.fillStyle = c(1 + ((i >> 1) % 2), '#ff5252');
          ctx.fillRect(-r, -r + i * h, r * 2, h);
        }
        ctx.restore();
        break;
      }

      // Polka dots on a ring, plus one in the middle.
      case 'dots': {
        ctx.fillStyle = c(1, '#e0392f');
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.17, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = c(2, '#4aa3ff');
        ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
        break;
      }

      // Solid with a hard terminator, like a planet half in shadow.
      case 'eclipse': {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = c(1, '#0b1122');
        ctx.beginPath();
        ctx.ellipse(r * 0.18, 0, r, r, 0, -Math.PI / 2, Math.PI / 2);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = c(2, '#ffd34d');
        ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.2, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        break;
      }

      // 'plain' and anything unrecognised: a single shaded sphere.
      default:
        ctx.fillStyle = c(1, '#5b3a1a');
        ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2); ctx.fill();
        break;
    }
  }

  /** Molten crust or frozen rind, painted over the ball's own artwork. */
  paintCharge(ctx, ball, meta) {
    const r = ball.r;
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    if (ball.kind === 'fire') {
      const g = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
      g.addColorStop(0, 'rgba(255,255,220,0.95)');
      g.addColorStop(0.45, 'rgba(255,180,40,0.85)');
      g.addColorStop(1, 'rgba(220,60,10,0.75)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      // cracks of white heat
      ctx.strokeStyle = 'rgba(255,250,210,0.8)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + this.time * 0.6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15);
        ctx.lineTo(Math.cos(a + 0.5) * r * 0.9, Math.sin(a + 0.5) * r * 0.9);
        ctx.stroke();
      }
    } else {
      const g = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
      g.addColorStop(0, 'rgba(245,255,255,0.95)');
      g.addColorStop(0.5, 'rgba(140,225,255,0.8)');
      g.addColorStop(1, 'rgba(40,140,215,0.75)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      // faceted ice
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---------------- effect layers ----------------
  drawParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const a = 1 - p.age / p.life;
      const color = p.color.replace('ALPHA', a.toFixed(2));
      if (p.glow) ctx.globalCompositeOperation = 'lighter';
      else ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = color;

      if (p.shape === 'shard') {
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.moveTo(0, -p.r * a * 1.6); ctx.lineTo(p.r * a * 0.6, 0);
        ctx.lineTo(0, p.r * a * 1.6); ctx.lineTo(-p.r * a * 0.6, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      } else if (p.shape === 'flame') {
        // A flame licks upward: taller than it is wide, shrinking fast.
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * a * 0.8, p.r * a * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        const R = p.r * a * 1.5;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const rad = i % 2 === 0 ? R : R * 0.42;
          const ang = (i / 8) * Math.PI * 2;
          i === 0 ? ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad)
                  : ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawRings(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const r of this.rings) {
      const t = r.age / r.life;
      const a = 1 - t;
      const rad = r.from + (r.to - r.from) * (1 - Math.pow(1 - t, 2));
      ctx.strokeStyle = r.color.replace('ALPHA', (a * 0.85).toFixed(2));
      ctx.lineWidth = r.width * a;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, rad, rad * r.squash, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPopups(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const p of this.popups) {
      const t = p.age / p.life;
      const a = t < 0.15 ? t / 0.15 : 1 - Math.pow((t - 0.15) / 0.85, 2);
      // pops in past its final size, then settles
      const scale = t < 0.15 ? 0.5 + (t / 0.15) * 0.7 : 1.2 - Math.min(0.2, (t - 0.15) * 0.6);
      const jitter = p.shake ? (Math.random() - 0.5) * p.shake * (1 - t) : 0;
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      ctx.translate(p.x + jitter, p.y - p.rise * t + jitter);
      ctx.scale(scale, scale);
      ctx.font = `900 ${p.size}px ${HUD_FONT}`;
      ctx.lineWidth = p.size * 0.22;
      ctx.strokeStyle = p.stroke;
      ctx.strokeText(p.text, 0, 0);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  drawFlashes(ctx) {
    for (const f of this.flashes) {
      const a = (1 - f.age / f.life) * f.strength;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = this.rgba(f.color, a);
      ctx.fillRect(0, 0, VIEW.W, VIEW.H);
      ctx.restore();
    }
  }

  /** The MULTI BALL countdown ribbon, drawn in world space above the net. */
  drawMultiBanner(ctx, match) {
    if (!match.powers || !match.powers.multiActive) return;
    const left = match.powers.multiTimer;
    const total = POWERS.multi.duration;
    // Sits in the open sky just above the net: the top of the screen is taken
    // by the scoreboard overlay, and this has to stay readable.
    // World units: at the smallest 821x462 frame the canvas draws at about half
    // scale, so the label's 26 lands near 13px on screen.
    const w = 300, h = 42, x = COURT.netX - w / 2, y = COURT.netTopY - 124;

    ctx.save();
    ctx.globalAlpha = left < 1 ? left : 1;      // fade out on the last second
    ctx.fillStyle = 'rgba(16,26,51,0.85)';
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 4;
    this.roundRect(ctx, x, y, w, h, 10);
    ctx.fill(); ctx.stroke();

    const meta = POWER_META.multi;
    ctx.fillStyle = this.rgba(meta.color, 0.9);
    this.roundRect(ctx, x + 4, y + 4, (w - 8) * (left / total), h - 8, 7);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = `900 26px ${HUD_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#05080f'; ctx.lineWidth = 5;
    const label = `MULTI BALL  ${left.toFixed(1)}s`;
    ctx.strokeText(label, COURT.netX, y + h / 2 + 1);
    ctx.fillText(label, COURT.netX, y + h / 2 + 1);
    ctx.restore();
  }

  /** '#rrggbb' -> 'rgba(r,g,b,a)'. Accepts an existing rgba() unchanged. */
  rgba(hex, alpha = 1) {
    if (!hex) return `rgba(255,255,255,${alpha})`;
    if (hex.startsWith('rgb')) return hex;
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
