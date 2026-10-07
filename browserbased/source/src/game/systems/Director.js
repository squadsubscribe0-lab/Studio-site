import { ENEMIES } from '../data/enemies.js';

export const RUN_LENGTH = 600; // seconds until the final boss enrages

/** Who shows up when. Weights per phase of the run. */
const PHASES = [
  { until: 60, mix: { slime: 1, wisp: 0.5 } },
  { until: 180, mix: { slime: 0.7, wisp: 0.8, ghoul: 0.6 } },
  { until: 300, mix: { ghoul: 1, imp: 0.8, wisp: 0.5, magma: 0.3 } },
  { until: 450, mix: { imp: 1, magma: 0.7, wraith: 0.5, ghoul: 0.5, brute: 0.12 } },
  { until: Infinity, mix: { wraith: 1, magma: 0.8, imp: 0.8, brute: 0.3 } }
];

/**
 * The run's pacing: a target population that climbs with the clock, a spawn
 * ring just outside the screen (biased ahead of the player), and scripted
 * beats — swarms, elites and three bosses, the last of which ends the run.
 */
export class Director {
  constructor(ctx) {
    this.ctx = ctx;
    this.reset();
  }

  reset() {
    this.time = 0;
    this.acc = 0;
    this.events = [
      { t: 45, run: () => this._ring('wisp', 26, 15) },
      { t: 100, run: () => this._elite('ghoul') },
      { t: 150, run: () => this._ring('slime', 36, 16) },
      { t: 180, run: () => this._boss('warden') },
      { t: 240, run: () => this._elite('brute') },
      { t: 270, run: () => this._ring('ghoul', 30, 16) },
      { t: 330, run: () => this._elite('magma') },
      { t: 360, run: () => this._boss('broodmother') },
      { t: 420, run: () => { this._elite('brute'); this._elite('wraith'); } },
      { t: 480, run: () => this._ring('wraith', 30, 17) },
      { t: 540, run: () => this._boss('heart') },
      { t: 570, run: () => this._ring('imp', 40, 16) }
    ];
    this.finalSpawned = false;
  }

  get hpMul() {
    return 1 + this.time / 90 + Math.pow(this.time / 300, 2);
  }

  get dmgMul() {
    return 1 + this.time / 300;
  }

  /**
   * Monster pace. The run opens slow (55%) so the first minutes are about
   * learning to move, eases up to full speed by 4:00, then keeps creeping
   * faster — 130% by the final boss.
   */
  get speedMul() {
    const t = this.time;
    if (t < 240) {
      const k = t / 240;
      return 0.55 + 0.45 * k * k * (3 - 2 * k);
    }
    return Math.min(1.3, 1 + (t - 240) / 1200);
  }

  update(dt) {
    this.time += dt;
    const { enemies } = this.ctx;

    for (const e of this.events) {
      if (!e.done && this.time >= e.t) {
        e.done = true;
        e.run();
      }
    }

    const bossUp = enemies.bosses.length > 0;
    const target = Math.min(360, 28 + this.time * 0.75) * (bossUp ? 0.6 : 1);
    if (enemies.liveCount >= target) return;
    const rate = (2 + this.time / 22) * (bossUp ? 0.5 : 1);
    this.acc += rate * dt;
    while (this.acc >= 1) {
      this.acc -= 1;
      this._spawnOne(this._pick());
    }
  }

  _pick() {
    const phase = PHASES.find((p) => this.time < p.until);
    const entries = Object.entries(phase.mix);
    let total = 0;
    for (const [, w] of entries) total += w;
    let r = Math.random() * total;
    for (const [id, w] of entries) {
      r -= w;
      if (r <= 0) return id;
    }
    return entries[0][0];
  }

  _ringPoint(radius, spread = Math.PI * 2) {
    const { player } = this.ctx;
    const moving = Math.hypot(player.vx, player.vz) > 0.5;
    const ahead = Math.atan2(player.vz, player.vx);
    const ang = moving && Math.random() < 0.6 ? ahead + (Math.random() - 0.5) * 2.2 : Math.random() * spread;
    return { x: player.x + Math.cos(ang) * radius, z: player.z + Math.sin(ang) * radius };
  }

  _spawnOne(id, opts = {}) {
    const p = this._ringPoint(19 + Math.random() * 4);
    return this.ctx.enemies.spawn(id, p.x, p.z, { hpMul: this.hpMul, dmgMul: this.dmgMul, ...opts });
  }

  _ring(id, count, radius) {
    const { player, enemies } = this.ctx;
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2;
      enemies.spawn(id, player.x + Math.cos(a) * radius, player.z + Math.sin(a) * radius, { hpMul: this.hpMul, dmgMul: this.dmgMul });
    }
    this.ctx.ui.banner('They surround you!', 'swarm');
  }

  _elite(id) {
    this._spawnOne(id, { elite: true });
    this.ctx.ui.banner('An elite approaches', 'elite');
  }

  _boss(id) {
    const def = ENEMIES[id];
    const p = this._ringPoint(15);
    // Bosses scale gently: their base numbers are already tuned per slot.
    this.ctx.enemies.spawn(id, p.x, p.z, { hpMul: 1 + this.time / 600, dmgMul: this.dmgMul });
    this.ctx.ui.banner(def.title, 'boss');
    this.ctx.sfx.boss();
    if (def.final) this.finalSpawned = true;
  }
}
