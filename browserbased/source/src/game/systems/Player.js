import { MathUtils } from 'three';

/**
 * The hero: movement, health, experience. Locomotion drives the character's
 * retargeted run clip; if that clip failed to load, it falls back to a
 * procedural bob and waddle on the root over the idle.
 */
export class Player {
  constructor(character, ctx) {
    this.character = character;
    this.ctx = ctx;
    this.radius = 0.45;
    this.reset();
  }

  reset() {
    this.x = 0;
    this.z = 0;
    this.vx = 0;
    this.vz = 0;
    this.stats = { maxHp: 100, regen: 0, speed: 4.8, magnet: 2.4, might: 1, haste: 1, area: 1, xpGain: 1 };
    this.hp = this.stats.maxHp;
    this.level = 1;
    this.xp = 0;
    this.xpNext = this._xpFor(1);
    this.invuln = 0;
    this.shield = 1; // damage multiplier, lowered by an Aegis Dome standing on us
    this.hurtFlash = 0;
    this.dead = false;
    this.revived = false;
    this._walk = 0;
    this.character.root.position.set(0, 0, 0);
    this.character.root.rotation.z = 0;
    this.character.setLocomotion(0, 0);
  }

  _xpFor(level) {
    return Math.round(6 + level * 5 + Math.pow(level, 1.55) * 1.6);
  }

  get alive() {
    return !this.dead;
  }

  update(dt, move) {
    if (this.dead) {
      this.character.setLocomotion(0, 0);
      return;
    }
    const s = this.stats;
    const len = Math.hypot(move.x, move.z);
    const mx = len > 1 ? move.x / len : move.x;
    const mz = len > 1 ? move.z / len : move.z;
    const accel = 1 - Math.exp(-dt * 14);
    this.vx += (mx * s.speed - this.vx) * accel;
    this.vz += (mz * s.speed - this.vz) * accel;
    this.x += this.vx * dt;
    this.z += this.vz * dt;
    this.ctx.dungeon.collidePoint(this, this.radius);

    const speed = Math.hypot(this.vx, this.vz);
    const moving = MathUtils.clamp(speed / s.speed, 0, 1);
    if (speed > 0.2) this.character.turnToward(Math.atan2(this.vx, this.vz), 0.0005, dt);
    const root = this.character.root;
    this.character.setLocomotion(moving, speed);
    if (this.character.hasRun) {
      root.position.set(this.x, 0, this.z);
      root.rotation.z = 0;
    } else {
      this._walk += dt * (6 + speed * 1.6) * moving;
      root.position.set(this.x, Math.abs(Math.sin(this._walk)) * 0.07 * moving, this.z);
      root.rotation.z = Math.sin(this._walk) * 0.06 * moving;
    }

    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 3);
    if (s.regen > 0) this.heal(s.regen * dt, true);
  }

  hurt(amount) {
    if (this.dead || this.invuln > 0) return;
    const taken = amount * this.shield;
    this.hp -= taken;
    this.invuln = 0.25;
    this.hurtFlash = 1;
    this.ctx.sfx.hurt();
    this.ctx.shake.add(0.18, 4, 26);
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.ctx.onPlayerDown?.();
    }
  }

  heal(amount, quiet = false) {
    if (this.dead) return;
    const before = this.hp;
    this.hp = Math.min(this.stats.maxHp, this.hp + amount);
    if (!quiet && this.hp > before) this.ctx.damageText.spawn(this.x, 2.3, this.z, Math.round(this.hp - before), false, 'heal');
  }

  revive() {
    this.dead = false;
    this.revived = true;
    this.hp = this.stats.maxHp;
    this.invuln = 3;
  }

  /** @returns {number} levels gained */
  addXp(amount) {
    this.xp += amount * this.stats.xpGain;
    let gained = 0;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = this._xpFor(this.level);
      gained++;
    }
    return gained;
  }
}
