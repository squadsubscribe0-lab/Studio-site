import { VIEW, COURT, PHYS, TEAM, POWERS } from '../config.js';
import { predictLanding } from './physics.js';
import { POWER_META } from './powers.js';

// Palm/cloud/parasol positions are fixed so the beach reads as a real place
// rather than random noise each reload.
const CLOUDS = [
  { x: 180, y: 150, s: 1.0 }, { x: 520, y: 95, s: 0.7 },
  { x: 980, y: 130, s: 1.2 }, { x: 1380, y: 90, s: 0.85 }
];
const PARASOLS = [
  { x: 150, c: '#ff5f52' }, { x: 1450, c: '#ffc31e' }
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
    this.drawRings(ctx);
    this.drawParticles(ctx);
    this.drawPopups(ctx);
    if (match) this.drawMultiBanner(ctx, match);
    this.drawFlashes(ctx);
  }

  // ---------------- scenery ----------------
  drawSky(ctx) {
    const bg = this.assets.background;
    if (bg) { ctx.drawImage(bg, 0, 0, VIEW.W, VIEW.H); return; }

    const g = ctx.createLinearGradient(0, 0, 0, 560);
    g.addColorStop(0, '#1e8fe0');
    g.addColorStop(0.55, '#63c3f5');
    g.addColorStop(1, '#bfeaff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW.W, VIEW.H);

    // sun
    ctx.fillStyle = 'rgba(255,240,180,0.85)';
    ctx.beginPath(); ctx.arc(1320, 140, 62, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,210,0.25)';
    ctx.beginPath(); ctx.arc(1320, 140, 110, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    for (const c of CLOUDS) this.cloud(ctx, c.x, c.y, c.s);
  }

  cloud(ctx, x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 34 * s, 0, Math.PI * 2);
    ctx.arc(x + 40 * s, y + 8 * s, 26 * s, 0, Math.PI * 2);
    ctx.arc(x - 38 * s, y + 10 * s, 24 * s, 0, Math.PI * 2);
    ctx.arc(x + 10 * s, y - 20 * s, 28 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSea(ctx) {
    if (this.assets.background) return;
    const horizon = 560;
    const g = ctx.createLinearGradient(0, horizon, 0, 700);
    g.addColorStop(0, '#0b6fa8');
    g.addColorStop(1, '#27a9d8');
    ctx.fillStyle = g;
    ctx.fillRect(0, horizon, VIEW.W, 150);

    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 4;
    const t = performance.now() / 1000;
    for (let row = 0; row < 4; row++) {
      const y = horizon + 22 + row * 30;
      ctx.beginPath();
      for (let x = 0; x <= VIEW.W; x += 20) {
        const yy = y + Math.sin((x / 90) + t * (0.8 + row * 0.2) + row) * 4;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    // foam line where the sea meets the sand
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 700);
    for (let x = 0; x <= VIEW.W; x += 24) {
      ctx.lineTo(x, 700 + Math.sin(x / 70 + t) * 6);
    }
    ctx.lineTo(VIEW.W, 716); ctx.lineTo(0, 716); ctx.closePath(); ctx.fill();
  }

  drawSand(ctx) {
    if (this.assets.background) return;
    const g = ctx.createLinearGradient(0, 700, 0, VIEW.H);
    g.addColorStop(0, '#f6dfae');
    g.addColorStop(0.35, '#eecb8c');
    g.addColorStop(1, '#dcae68');
    ctx.fillStyle = g;
    ctx.fillRect(0, 706, VIEW.W, VIEW.H - 706);

    // court boundary lines
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(COURT.left, COURT.groundY + 12);
    ctx.lineTo(COURT.right, COURT.groundY + 12);
    ctx.stroke();

    // sand speckle, deterministic so it does not shimmer
    ctx.fillStyle = 'rgba(160,110,50,0.16)';
    for (let i = 0; i < 220; i++) {
      const x = (i * 137.5) % VIEW.W;
      const y = 720 + ((i * 91.7) % 170);
      ctx.fillRect(x, y, 3, 3);
    }

    for (const p of PARASOLS) this.parasol(ctx, p.x, 740, p.c);
  }

  parasol(ctx, x, y, color) {
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 130); ctx.stroke();
    ctx.save();
    ctx.translate(x + 6, y - 130);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#fff8e6' : color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 74, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  drawNetBack(ctx) {
    // Far post, drawn behind the players.
    ctx.fillStyle = '#7a4a22';
    ctx.fillRect(COURT.netX - 6, COURT.netTopY - 10, 12, COURT.groundY - COURT.netTopY + 12);
  }

  drawNetFront(ctx) {
    const x = COURT.netX, top = COURT.netTopY, bottom = COURT.groundY;
    const hw = COURT.netHalfWidth;

    // mesh
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    const cell = 16;
    ctx.beginPath();
    for (let y = top + 10; y < bottom; y += cell) {
      ctx.moveTo(x - hw - 4, y); ctx.lineTo(x + hw + 4, y);
    }
    ctx.stroke();
    ctx.restore();

    // tape at the top
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0b1122';
    ctx.lineWidth = 4;
    this.roundRect(ctx, x - hw - 6, top - 12, (hw + 6) * 2, 22, 8);
    ctx.fill(); ctx.stroke();

    // post
    ctx.fillStyle = '#a86a33';
    this.roundRect(ctx, x - 7, top - 4, 14, bottom - top + 6, 6);
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

      // core
      const core = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
      core.addColorStop(0, '#ffffff');
      core.addColorStop(0.45, meta.glow);
      core.addColorStop(1, meta.color);
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

      this.drawPowerGlyph(ctx, orb.type, r * 0.62);
      ctx.restore();

      // a few drifting sparks so the orb reads as alive
      if (Math.random() < dt * 22) {
        this.burst(orb.x, orb.y, 1, this.rgba(meta.glow, 1).replace(/[\d.]+\)$/, 'ALPHA)'),
          70, { gravity: -60, life: 0.5, size: 2, sizeVar: 3, glow: true });
      }
    }
  }

  /** The little symbol inside an orb / on a HUD chip. */
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

    if (img.full) {
      // Single-sprite character: draw it standing on the origin.
      const h = 210, w = h * (img.full.width / img.full.height);
      ctx.drawImage(img.full, -w / 2, -h, w, h);
    } else {
      this.drawVectorBody(ctx, pal, img, swing, p);
    }

    // Status tints go on top of whatever body was drawn, so they work for
    // sprite characters and vector ones alike.
    if (p.frozen > 0) this.tintBody(ctx, 'rgba(120,215,255,0.55)');
    else if (p.burning > 0) this.tintBody(ctx, `rgba(255,110,30,${0.42 * Math.min(1, p.burning * 2)})`);

    ctx.restore();

    // Ice casing and embers are drawn unrotated, in world space, so they do
    // not shear with the dive rotation.
    if (p.frozen > 0) this.drawIceBlock(ctx, p);
    if (p.burning > 0) this.drawEmbers(ctx, p, dt);
    if (p.slowFactor < 1 && p.frozen <= 0) this.drawChillAura(ctx, p);
  }

  tintBody(ctx, color) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color;
    ctx.fillRect(-90, -220, 180, 240);
    ctx.restore();
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

  /** Fallback character: chunky limbs in the reference game's style. */
  drawVectorBody(ctx, pal, img, swing, p) {
    const line = '#0b1122';
    ctx.lineWidth = 5;
    ctx.strokeStyle = line;
    ctx.lineJoin = 'round';

    const legLift = p.onGround ? 0 : 10;

    // legs
    for (const side of [-1, 1]) {
      const off = side * 14;
      const bend = swing * 16 * side;
      ctx.save();
      ctx.translate(off, -46);
      ctx.rotate((bend / 90) + (p.onGround ? 0 : side * 0.25));
      ctx.fillStyle = pal.skin;
      this.roundRect(ctx, -9, 0, 18, 40 - legLift, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.bottom;
      this.roundRect(ctx, -11, -6, 22, 22, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.shoe;
      this.roundRect(ctx, -12, 34 - legLift, 26, 14, 6); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // torso
    ctx.fillStyle = pal.top;
    if (img.body) {
      ctx.drawImage(img.body, -26, -112, 52, 70);
    } else {
      this.roundRect(ctx, -24, -112, 48, 70, 14); ctx.fill(); ctx.stroke();
      // stripe detail
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(-24, -86, 48, 8);
    }

    // arms
    const armAngle = (!p.onGround && p.spikeHeld) ? -2.2 : (!p.onGround ? -1.3 : swing * 0.5);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 22, -104);
      ctx.rotate(side === 1 ? armAngle : armAngle * 0.5 + 0.2);
      ctx.fillStyle = pal.skin;
      this.roundRect(ctx, -8, 0, 16, 46, 8); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // head
    ctx.fillStyle = pal.skin;
    if (img.head) {
      ctx.drawImage(img.head, -30, -166, 60, 60);
    } else {
      this.roundRect(ctx, -26, -166, 52, 58, 16); ctx.fill(); ctx.stroke();
      // hair
      ctx.fillStyle = pal.hair;
      this.roundRect(ctx, -28, -170, 56, 22, 10); ctx.fill(); ctx.stroke();
      // eyes
      ctx.fillStyle = line;
      ctx.beginPath();
      ctx.arc(6, -138, 4, 0, Math.PI * 2);
      ctx.arc(-8, -138, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (img.hat) ctx.drawImage(img.hat, -32, -196, 64, 40);
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
    const style = skin.style || 'beach';

    ctx.fillStyle = colors[0];
    ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, Math.PI * 2); ctx.fill();

    if (style === 'beach') {
      const segs = colors.length - 1;
      for (let i = 0; i < segs; i++) {
        ctx.fillStyle = colors[i + 1];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, ball.r, (i * 2 * Math.PI) / segs, ((i + 0.55) * 2 * Math.PI) / segs);
        ctx.closePath(); ctx.fill();
      }
    } else if (style === 'volley') {
      ctx.strokeStyle = colors[1]; ctx.lineWidth = 5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, ball.r * 0.92, ball.r * 0.34, (i * Math.PI) / 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (style === 'melon') {
      ctx.fillStyle = colors[1];
      ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors[2];
      ctx.beginPath(); ctx.arc(0, 0, ball.r * 0.82, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.arc(0, 0, ball.r * 0.72, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#20160f';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * ball.r * 0.4, Math.sin(a) * ball.r * 0.4, 3, 5, a, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = colors[1] || '#5b3a1a';
      ctx.beginPath(); ctx.arc(-ball.r * 0.3, -ball.r * 0.3, ball.r * 0.35, 0, Math.PI * 2); ctx.fill();
    }

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
      ctx.font = `900 ${p.size}px ${'"Baloo 2", "Fredoka", system-ui, sans-serif'}`;
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
    const w = 260, h = 34, x = COURT.netX - w / 2, y = COURT.netTopY - 120;

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
    ctx.font = '900 20px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#05080f'; ctx.lineWidth = 4;
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
