import { Vector3 } from 'three';
import { AbilityPhase } from '../../abilities/Ability.js';
import { settings } from '../../config/settings.js';
import { SKILLS, lv, MAX_SKILL_LEVEL, MAX_SLOTS } from '../data/skills.js';
import { PASSIVES, MAX_PASSIVE_LEVEL } from '../data/passives.js';

const _o = new Vector3();
const _d = new Vector3();
const _e = new Vector3();
const CRIT_CHANCE = 0.08;
const CRIT_MULT = 1.8;

/**
 * Spells, relics and — the bridge this whole game rests on — hit tracking.
 *
 * A cast hands a pooled sandbox ability to a `Hit` record. Each frame the Hit
 * reads the ability's *live* state (how far its front has run, whether it has
 * landed, how long it has held, where it ends) and applies damage in the same
 * shape the effect is drawing. The VFX code never learns it is in a game.
 */
export class SkillSystem {
  constructor(ctx) {
    this.ctx = ctx;
    this.owned = new Map(); // id → { level, cd, evolved }
    this.passives = new Map(); // id → level
    this.hits = [];
    this.damageBy = new Map();
    // Pristine VFX blocks, so tuning is always base → level → awakening → area.
    this.base = new Map();
    for (const def of Object.values(SKILLS)) this.base.set(def.element, structuredClone(settings[def.element]));
    this._lastAnim = 0;
  }

  reset() {
    for (const [element, block] of this.base) Object.assign(settings[element], structuredClone(block));
    this.owned.clear();
    this.passives.clear();
    this.hits.length = 0;
    this.damageBy.clear();
  }

  /* ------------------------------------------------------------------ */
  /* Loadout                                                             */
  /* ------------------------------------------------------------------ */

  level(id) {
    return this.owned.get(id)?.level ?? 0;
  }

  passiveLevel(id) {
    return this.passives.get(id) ?? 0;
  }

  addSkill(id) {
    const entry = this.owned.get(id);
    if (entry) entry.level = Math.min(MAX_SKILL_LEVEL, entry.level + 1);
    else this.owned.set(id, { level: 1, cd: 0.3, evolved: false });
    this.retune(id);
  }

  addPassive(id) {
    const lvl = Math.min(MAX_PASSIVE_LEVEL, this.passiveLevel(id) + 1);
    this.passives.set(id, lvl);
    PASSIVES[id].apply(this.ctx.player.stats, this.ctx.player);
    for (const skill of this.owned.keys()) this.retune(skill);
  }

  /** Spells at max level whose relic is owned and that have not awakened yet. */
  evolvable() {
    return [...this.owned].filter(([id, e]) => !e.evolved && e.level >= MAX_SKILL_LEVEL && this.passives.has(SKILLS[id].evolve.passive)).map(([id]) => id);
  }

  evolve(id) {
    const entry = this.owned.get(id);
    if (!entry) return;
    entry.evolved = true;
    this.retune(id);
  }

  retune(id) {
    const def = SKILLS[id];
    const entry = this.owned.get(id);
    const cfg = settings[def.element];
    Object.assign(cfg, structuredClone(this.base.get(def.element)));
    def.tune?.(cfg, entry.level);
    if (entry.evolved) def.evolve.tune?.(cfg);
    const area = this.ctx.player.stats.area;
    if (typeof cfg.zoneRadius === 'number') cfg.zoneRadius *= area;
    if (typeof cfg.poolRadius === 'number') cfg.poolRadius *= area;
    // Casts in this game run to the target, not the sandbox's full range.
    cfg.minRange = Math.min(cfg.minRange ?? 0, 1.5);
  }

  displayName(id) {
    const e = this.owned.get(id);
    return e?.evolved ? SKILLS[id].evolve.name : SKILLS[id].name;
  }

  get slotsFull() {
    return this.owned.size >= MAX_SLOTS;
  }

  get relicSlotsFull() {
    return this.passives.size >= MAX_SLOTS;
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  update(dt) {
    const { player, enemies } = this.ctx;
    player.shield = 1;
    if (player.alive) {
      for (const [id, entry] of this.owned) {
        entry.cd -= dt;
        if (entry.cd > 0) continue;
        if (this._cast(id, entry)) {
          entry.cd = lv(SKILLS[id].cooldown, entry.level) * player.stats.haste * (entry.evolved ? 0.85 : 1);
        } else {
          entry.cd = 0.2; // nothing in reach — look again shortly
        }
      }
    }
    for (let k = this.hits.length - 1; k >= 0; k--) {
      if (!this._updateHit(this.hits[k], dt, enemies, player)) this.hits.splice(k, 1);
    }
  }

  _cast(id, entry) {
    const { player, enemies, abilities, character } = this.ctx;
    const def = SKILLS[id];
    let tx;
    let tz;
    if (def.target === 'self') {
      if (enemies.nearest(player.x, player.z, 9) < 0) return false;
      const yaw = character.facing;
      tx = player.x + Math.sin(yaw) * 0.12;
      tz = player.z + Math.cos(yaw) * 0.12;
    } else {
      const i = def.target === 'cluster'
        ? enemies.densest(player.x, player.z, def.range)
        : enemies.nearest(player.x, player.z, def.range);
      if (i < 0) return false;
      tx = enemies.x[i];
      tz = enemies.z[i];
    }

    _o.set(player.x, 0, player.z);
    _d.set(tx - player.x, 0, tz - player.z);
    let dist = _d.length();
    if (dist < 1e-3) _d.set(Math.sin(character.facing), 0, Math.cos(character.facing));
    _d.normalize();
    // Line spells run a little past the target; far casts land on it.
    const isLine = def.hit.type === 'line';
    if (isLine) dist = Math.min(def.range + 2, Math.max(4, dist + 3));
    else dist = Math.max(0.12, dist);

    const ability = abilities.cast(_o, _d, dist, def.element);
    if (!ability) return false;

    const now = this.ctx.clock;
    if (now - this._lastAnim > 0.7) {
      this._lastAnim = now;
      character.playCast(settings[def.element].castAnim);
    }
    this.ctx.sfx.spell(def.element, def.hit.type === 'zone' ? 'zone' : 'line');

    const mul = entry.evolved ? def.evolve.damage : 1;
    this.hits.push({
      id,
      def,
      ability,
      serial: ability.serial,
      damage: lv(def.damage, entry.level) * mul,
      width: (def.hit.width ?? 1) * player.stats.area * (entry.evolved ? def.evolve.width ?? 1 : 1),
      impactMul: entry.evolved ? def.evolve.impact ?? 1 : 1,
      lastFront: 0,
      struck: new Set(),
      landed: false,
      burstDone: false,
      finaleDone: false,
      tickClock: 0
    });
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* Hit tracking                                                        */
  /* ------------------------------------------------------------------ */

  _deal(hit, i, scale, opts = {}) {
    const { enemies, player } = this.ctx;
    const crit = Math.random() < CRIT_CHANCE;
    const amount = hit.damage * scale * player.stats.might * (crit ? CRIT_MULT : 1);
    const dealt = enemies.damage(i, amount, { ...opts, crit });
    this.damageBy.set(hit.id, (this.damageBy.get(hit.id) ?? 0) + dealt);
  }

  _burstAt(hit, x, z, radius, scale, { knock = 0, slow = 0, pull = 0 } = {}) {
    const { enemies } = this.ctx;
    enemies.forEachInRadius(x, z, radius, (i, dx, dz) => {
      if (knock) enemies.knock(i, dx, dz, knock);
      if (pull) enemies.knock(i, -dx, -dz, pull);
      this._deal(hit, i, scale, { slow });
    });
  }

  /** @returns {boolean} false once the hit is done */
  _updateHit(hit, dt, enemies, player) {
    const a = hit.ability;
    if (a.serial !== hit.serial || !a.isActive) return false;
    const h = hit.def.hit;
    const cfg = settings[hit.def.element];
    const landed = a.phase !== AbilityPhase.TRAVEL;
    const holdTime = a.impactTime + a.fadeTime;
    a.pointAt(1, _e);

    if (h.type === 'line') {
      const ox = a.origin.x;
      const oz = a.origin.z;
      const dx = a.direction.x;
      const dz = a.direction.z;
      const front = Math.min(a.front, a.length);

      if (h.sweep !== false && front > hit.lastFront) {
        enemies.forEachInLine(ox, oz, dx, dz, hit.lastFront - 0.3, front + 0.3, hit.width, (i) => {
          const uid = enemies.uid[i];
          if (hit.struck.has(uid)) return;
          hit.struck.add(uid);
          if (h.knock) enemies.knock(i, dx, dz, h.knock);
          this._deal(hit, i, 1, { slow: h.slow ?? 0 });
        });
        hit.lastFront = front;
      }

      if (landed && !hit.landed) {
        hit.landed = true;
        this.ctx.sfx.spellImpact(hit.def.element);
        if (h.impact) {
          this._burstAt(hit, _e.x, _e.z, h.impact * player.stats.area * hit.impactMul, h.sweep === false ? 1 : 0.6, { knock: h.knock ?? 0, slow: h.slow ?? 0 });
        }
      }

      if (landed && (h.hold || h.pool)) {
        const spec = h.hold ?? h.pool;
        hit.tickClock -= dt;
        if (hit.tickClock <= 0) {
          hit.tickClock = spec.every;
          const mul = spec.mul ?? 1;
          if (h.pool) {
            this._burstAt(hit, _e.x, _e.z, (cfg.poolRadius ?? 2) * 0.9, 0.5, { slow: spec.slow ?? 0 });
          } else if (spec.radius) {
            this._burstAt(hit, _e.x, _e.z, spec.radius * player.stats.area, mul, { slow: spec.slow ?? 0 });
          } else {
            enemies.forEachInLine(ox, oz, dx, dz, 0, a.length, hit.width, (i) => this._deal(hit, i, mul, { slow: spec.slow ?? 0 }));
          }
        }
      }
      return true;
    }

    // ---- far casts ----
    if (!landed) return true;
    const radius = (cfg.zoneRadius ?? 2) * 1.0;
    if (h.shield && Math.hypot(player.x - _e.x, player.z - _e.z) < radius) {
      player.shield = Math.min(player.shield, 1 - h.shield);
    }

    let delay = 0;
    if (h.delay === 'sunstrike') delay = cfg.chargeTime + cfg.dropTime;
    else if (h.delay === 'geyser') delay = cfg.buildTime;
    else if (typeof h.delay === 'number') delay = h.delay;
    if (holdTime < delay) return true;

    // The sound lands with the damage: on the burst, or on arrival if there is none.
    if (!hit.landed) {
      hit.landed = true;
      this.ctx.sfx.spellImpact(hit.def.element);
    }

    if (h.burst && !hit.burstDone) {
      hit.burstDone = true;
      this._burstAt(hit, _e.x, _e.z, radius, h.burst, { knock: h.knock ?? 0, slow: h.slow ?? 0 });
    }

    if (h.finale && !hit.finaleDone && a.phase === AbilityPhase.FADE && a.fadeTime / Math.max(0.01, a.fadeDuration) >= (cfg.implodeAt ?? 0.5)) {
      hit.finaleDone = true;
      this.ctx.sfx.spellFinale(hit.def.element);
      this._burstAt(hit, _e.x, _e.z, radius * 1.4, h.finale, { knock: 8 });
    }

    if (h.tick && a.phase !== AbilityPhase.FADE) {
      hit.tickClock -= dt;
      if (hit.tickClock <= 0) {
        hit.tickClock = h.every;
        this._burstAt(hit, _e.x, _e.z, radius, h.tick, { knock: h.knock ?? 0, slow: h.slow ?? 0, pull: h.pull ?? 0 });
      }
    }
    return true;
  }
}
