import { COURT, PHYS, TEAM, POWERS } from '../config.js';
import { clamp, aimVelocity } from './physics.js';

let nextBallId = 1;

export class Ball {
  constructor(skin) {
    this.id = nextBallId++;
    this.r = PHYS.ballRadius;
    this.skin = skin;
    this.primary = true;        // false for multiball copies, which expire
    this.reset(COURT.netX, 300);
  }

  reset(x, y) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.spin = 0; this.rot = 0;
    this.held = true;              // frozen above the server until the serve
    this.lastTouchTeam = -1;
    this.lastTouchId = -1;
    this.trail = [];
    this.kind = 'normal';          // 'normal' | 'fire' | 'ice'
    this.kindTimer = 0;
    this.dead = false;
    this.glow = 0;
  }

  /**
   * Sends the ball into the far court on an arc that actually clears the tape.
   *
   * This used to be a fixed velocity, which quietly broke every match with more
   * than two players a side: the deepest player serves, and from that far back
   * a fixed serve is still below the net when it arrives. Solving the arc makes
   * the serve correct from anywhere on the court.
   */
  serve(dir, targetX = null, power = 1) {
    this.held = false;
    const tx = targetX ?? (COURT.netX + dir * (COURT.right - COURT.netX) * 0.55);
    // A long, hanging flight is what keeps a serve from being a free point:
    // the receiver needs roughly a second to cross their half.
    const aim = aimVelocity(this.x, this.y, tx, COURT.groundY - 90, {
      pace: 620 * power,
      minTime: 0.95,
      maxTime: 1.8,
      clearance: 110          // serve well over the tape, not at it
    });
    this.vx = aim.vx;
    this.vy = aim.vy;
    this.spin = dir * 2;
  }

  /** Turns this ball into a super throw. `kind` is 'fire' | 'ice' | 'normal'. */
  charge(kind) {
    this.kind = kind;
    this.kindTimer = 0;
    this.glow = 1;
  }

  /** A multiball copy: same skin and ownership, its own velocity. */
  spawnCopy(vx, vy) {
    const b = new Ball(this.skin);
    b.primary = false;
    b.x = this.x; b.y = this.y;
    b.vx = vx; b.vy = vy;
    b.spin = this.spin;
    b.rot = this.rot;
    b.held = false;
    b.kind = this.kind;
    b.lastTouchTeam = this.lastTouchTeam;
    b.lastTouchId = this.lastTouchId;
    return b;
  }

  recordTrail() {
    this.trail.push({ x: this.x, y: this.y });
    const max = this.kind === 'normal' ? 12 : 20;
    if (this.trail.length > max) this.trail.shift();
  }

  update(dt) {
    if (this.kind !== 'normal') this.kindTimer += dt;
    this.glow = Math.max(0, this.glow - dt * 1.6);
  }
}

let nextId = 1;

export class Player {
  /**
   * @param {object} opts { team, slot, character, controller, homeX, name }
   * controller: 'human0' | 'human1' | 'ai' | 'remote'
   */
  constructor(opts) {
    this.id = nextId++;
    this.team = opts.team;
    this.slot = opts.slot ?? 0;
    this.name = opts.name || 'Player';
    this.character = opts.character;
    this.controller = opts.controller || 'ai';
    this.homeX = opts.homeX;

    this.x = opts.homeX;
    this.y = COURT.groundY;
    this.vx = 0; this.vy = 0;
    this.onGround = true;
    this.facing = this.team === TEAM.LEFT ? 1 : -1;

    this.diveTimer = 0;
    this.diveCooldown = 0;
    this.spikeHeld = false;
    this.jumpHeld = false;
    this.blocking = false;
    this.animTime = 0;
    this.squash = 0;
    this.hitFlash = 0;
    this.hitTimer = 0;      // short lockout so one contact cannot register twice

    // Status effects from super throws.
    this.frozen = 0;        // seconds left encased in ice - no input at all
    this.slow = 0;          // seconds left sluggish (chill or burn)
    this.slowFactor = 1;
    this.burning = 0;       // cosmetic: scorched by a fireball
    this.speedMul = 1;      // AI difficulty / status scaling

    // What this player wants to do with the ball, filled in by the brain or by
    // the human's movement. Used by the aim solver in physics.js.
    this.aimX = null;
    this.aimY = null;
    this.aiState = {
      targetX: opts.homeX, reaction: 0, jumpWish: false,
      role: 'support', claimUntil: 0, spikeWindow: 0,
      seenBall: null, seenAt: -99, plan: null, blockUntil: 0
    };
  }

  /** Half of the court this player is allowed to walk on. */
  get bounds() {
    const pad = PHYS.playerRadius;
    return this.team === TEAM.LEFT
      ? { min: COURT.left + pad, max: COURT.netX - COURT.netHalfWidth - pad }
      : { min: COURT.netX + COURT.netHalfWidth + pad, max: COURT.right - pad };
  }

  get bodyY() { return this.y + PHYS.bodyOffsetY; }
  get headY() { return this.y + PHYS.headOffsetY; }

  /** Collision circles, in the order they should be tested. */
  hitCircles() {
    const circles = [
      { x: this.x, y: this.headY, r: PHYS.headRadius, kind: 'head' },
      { x: this.x, y: this.bodyY, r: PHYS.playerRadius, kind: 'body' }
    ];
    if (this.diveTimer > 0) {
      circles.push({ x: this.x + this.facing * 44, y: this.y - 28, r: 30, kind: 'arm' });
    }
    if (!this.onGround && this.spikeHeld) {
      circles.push({ x: this.x + this.facing * 40, y: this.headY - 26, r: 30, kind: 'arm' });
    }
    return circles;
  }

  /** True while a status effect has taken this player out of the rally. */
  get disabled() { return this.frozen > 0; }

  freeze(seconds) {
    this.frozen = Math.max(this.frozen, seconds);
    this.vx = 0;
    this.diveTimer = 0;
  }

  chill(factor, seconds) {
    this.slow = Math.max(this.slow, seconds);
    this.slowFactor = Math.min(this.slowFactor, factor);
  }

  scorch(seconds) {
    this.burning = Math.max(this.burning, seconds);
    this.chill(POWERS.fire.burnSlow, POWERS.fire.burnTime);
  }

  update(input, dt, events) {
    this.animTime += dt;
    this.diveCooldown = Math.max(0, this.diveCooldown - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 3);
    this.hitTimer = Math.max(0, this.hitTimer - dt);
    this.burning = Math.max(0, this.burning - dt);

    if (this.slow > 0) {
      this.slow -= dt;
      if (this.slow <= 0) this.slowFactor = 1;
    }

    // Frozen solid: gravity still applies so a player iced mid-air drops, but
    // nothing they press does anything until the block cracks.
    if (this.frozen > 0) {
      this.frozen -= dt;
      if (this.frozen <= 0) {
        events.push({ type: 'unfreeze', player: this, x: this.x, y: this.bodyY });
        this.chill(POWERS.ice.slowAfter, POWERS.ice.slowTime);
      }
      this.vx *= 0.86;
      this.vy += PHYS.gravityPlayer * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.y >= COURT.groundY) { this.y = COURT.groundY; this.vy = 0; this.onGround = true; }
      const bf = this.bounds;
      this.x = clamp(this.x, bf.min, bf.max);
      this.squash += (0 - this.squash) * Math.min(1, dt * 10);
      this.blocking = false;
      return;
    }

    const diving = this.diveTimer > 0;
    if (diving) this.diveTimer -= dt;

    // ---- horizontal movement
    const control = this.onGround ? 1 : PHYS.airControl;
    if (!diving) {
      const want = input.move * PHYS.playerSpeed * this.speedMul * this.slowFactor;
      if (input.move !== 0) {
        const accel = PHYS.playerAccel * control * this.slowFactor * dt;
        this.vx += clamp(want - this.vx, -accel, accel);
        this.facing = Math.sign(input.move);
      } else if (this.onGround) {
        const f = PHYS.playerFriction * dt;
        this.vx += clamp(-this.vx, -f, f);
      }
    }

    // ---- jump
    if (input.jump && !this.jumpHeld && this.onGround && !diving) {
      this.vy = PHYS.jumpVel * (0.72 + 0.28 * this.slowFactor);
      this.onGround = false;
      this.squash = -0.35;
      events.push({ type: 'jump', player: this });
    }
    this.jumpHeld = input.jump;
    // Short hop: releasing early cuts the rise.
    if (!input.jump && this.vy < -400) this.vy *= 0.86;

    // Holding jump at the apex turns the touch into a soft block.
    this.blocking = !this.onGround && input.jump && this.vy > -260 && !input.spike;

    // ---- dive / spike
    const spikePressed = input.spike && !this.spikeHeld;
    if (spikePressed && this.onGround && !diving && this.diveCooldown <= 0) {
      this.diveTimer = PHYS.diveDuration;
      this.diveCooldown = PHYS.diveCooldown + PHYS.diveDuration;
      this.vx = this.facing * PHYS.diveSpeed;
      this.vy = -260;
      this.onGround = false;
      events.push({ type: 'dive', player: this });
    }
    this.spikeHeld = input.spike;

    // ---- integrate
    this.vy += PHYS.gravityPlayer * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const b = this.bounds;
    if (this.x < b.min) { this.x = b.min; this.vx = Math.max(0, this.vx); }
    if (this.x > b.max) { this.x = b.max; this.vx = Math.min(0, this.vx); }

    if (this.y >= COURT.groundY) {
      if (!this.onGround) { this.squash = 0.3; events.push({ type: 'land', player: this }); }
      this.y = COURT.groundY;
      this.vy = 0;
      this.onGround = true;
      if (diving) this.vx *= 0.82;
    }

    this.squash += (0 - this.squash) * Math.min(1, dt * 10);
  }

  serialize() {
    return [
      Math.round(this.x), Math.round(this.y),
      Math.round(this.vx), Math.round(this.vy),
      this.facing, this.onGround ? 1 : 0, this.diveTimer > 0 ? 1 : 0,
      Math.round(this.frozen * 100), Math.round(this.burning * 100)
    ];
  }

  applySnapshot(a) {
    this.x = a[0]; this.y = a[1];
    this.vx = a[2]; this.vy = a[3];
    this.facing = a[4]; this.onGround = !!a[5];
    this.diveTimer = a[6] ? 0.2 : 0;
    this.frozen = (a[7] || 0) / 100;
    this.burning = (a[8] || 0) / 100;
  }
}
