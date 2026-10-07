import { COURT, PHYS, POWERS } from '../config.js';

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;

export function ballSpeedCap(ball) {
  return ball && ball.kind && ball.kind !== 'normal'
    ? PHYS.ballMaxSpeedSuper
    : PHYS.ballMaxSpeed;
}

export function clampBallSpeed(ball, max = null) {
  if (max === null) max = ballSpeedCap(ball);
  const s = Math.hypot(ball.vx, ball.vy);
  if (s > max) { ball.vx = (ball.vx / s) * max; ball.vy = (ball.vy / s) * max; }
  return s;
}

/** Advances the ball one fixed step. Returns a list of events for sound/scoring. */
export function stepBall(ball, dt) {
  const events = [];

  ball.vy += PHYS.gravityBall * dt;

  // Air drag and Magnus: spin curves the flight, which makes serves readable.
  // A fireball is burning through the air, so it barely slows at all.
  const dragK = ball.kind === 'fire' ? PHYS.ballDrag * 0.35 : PHYS.ballDrag;
  const drag = 1 - dragK * dt;
  ball.vx *= drag;
  ball.vy *= drag;
  ball.vx += ball.spin * ball.vy * PHYS.magnus;
  ball.vy -= ball.spin * ball.vx * PHYS.magnus;
  // Ice balls hang in the air a beat longer, which is what makes them feel cold.
  if (ball.kind === 'ice') ball.vy -= PHYS.gravityBall * 0.16 * dt;
  ball.spin *= Math.pow(PHYS.ballSpinDecay, dt * 60);

  clampBallSpeed(ball);

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.rot += ball.vx * dt * 0.012;

  const r = ball.r;

  // Side walls
  if (ball.x - r < COURT.left) {
    ball.x = COURT.left + r;
    ball.vx = Math.abs(ball.vx) * PHYS.ballRestitutionWall;
    events.push({ type: 'wall' });
  } else if (ball.x + r > COURT.right) {
    ball.x = COURT.right - r;
    ball.vx = -Math.abs(ball.vx) * PHYS.ballRestitutionWall;
    events.push({ type: 'wall' });
  }

  // Ceiling
  if (ball.y - r < COURT.ceiling) {
    ball.y = COURT.ceiling + r;
    ball.vy = Math.abs(ball.vy) * 0.6;
    events.push({ type: 'wall' });
  }

  const netEv = collideNet(ball);
  if (netEv) events.push(netEv);

  // Sand: this ends the rally, the caller decides who scores.
  if (ball.y + r >= COURT.groundY) {
    ball.y = COURT.groundY - r;
    ball.vy = -Math.abs(ball.vy) * 0.42;
    ball.vx *= 0.7;
    events.push({ type: 'ground', x: ball.x });
  }

  return events;
}

/** Net is a rounded band: a capsule from netTopY down to the sand. */
function collideNet(ball) {
  const hw = COURT.netHalfWidth;
  const capY = COURT.netTopY;
  const r = ball.r;

  if (ball.y < capY) {
    // Top cap — treat the net edge as a circle so tape hits feel fair.
    const dx = ball.x - COURT.netX;
    const dy = ball.y - capY;
    const d = Math.hypot(dx, dy);
    const rsum = r + COURT.postCapR;
    if (d < rsum && d > 0.0001) {
      const nx = dx / d, ny = dy / d;
      ball.x = COURT.netX + nx * rsum;
      ball.y = capY + ny * rsum;
      const vn = ball.vx * nx + ball.vy * ny;
      ball.vx -= (1 + PHYS.ballRestitutionNet) * vn * nx;
      ball.vy -= (1 + PHYS.ballRestitutionNet) * vn * ny;
      return { type: 'net', tape: true };
    }
    return null;
  }

  // Body of the net — flat vertical faces.
  if (Math.abs(ball.x - COURT.netX) < hw + r && ball.y + r > capY) {
    const side = ball.x < COURT.netX ? -1 : 1;
    ball.x = COURT.netX + side * (hw + r);
    ball.vx = side * Math.abs(ball.vx) * PHYS.ballRestitutionNet;
    return { type: 'net', tape: false };
  }
  return null;
}

/**
 * Ball vs one player circle. Mutates the ball, returns true if it connected.
 * `circle` = { x, y, r, kind } where kind is 'head' | 'body' | 'arm'.
 */
/**
 * Ball vs one player circle. Mutates the ball, returns true if it connected.
 * `circle` = { x, y, r, kind } where kind is 'head' | 'body' | 'arm'.
 *
 * opts: { spike, block, facing, lastTouch }
 *   facing    +1 if this player attacks to the right, -1 to the left
 *   lastTouch true when this is the side's final legal touch
 */
export function collideBallCircle(ball, circle, playerVX, playerVY, opts = {}) {
  const dx = ball.x - circle.x;
  const dy = ball.y - circle.y;
  const d = Math.hypot(dx, dy);
  const rsum = ball.r + circle.r;
  if (d >= rsum || d < 0.0001) return false;

  const nx = dx / d, ny = dy / d;

  // Separate first so the ball can never sink into a player.
  ball.x = circle.x + nx * rsum;
  ball.y = circle.y + ny * rsum;

  const inSpeed = Math.hypot(ball.vx, ball.vy);
  const playerSpeed = Math.hypot(playerVX, playerVY);
  const facing = opts.facing || 0;

  if (opts.spike) {
    // Smash: a steep angle towards the opponent, powered by the run-up.
    const speed = Math.min(PHYS.spikeMaxSpeed, PHYS.spikePower + inSpeed * 0.45 + playerSpeed * 0.3);
    let ax = facing * (1 - PHYS.spikeAngle);
    let ay = PHYS.spikeAngle;
    if (opts.aimX !== undefined && opts.aimX !== null) {
      // Steer the smash towards the chosen spot without letting it go flat -
      // a spike that does not come down is just a fast free ball.
      const dx = opts.aimX - ball.x;
      const dy = Math.max(140, (opts.aimY ?? COURT.groundY) - ball.y);
      const len = Math.hypot(dx, dy) || 1;
      ax = (dx / len) * 0.75 + ax * 0.25;
      ay = Math.max((dy / len) * 0.75 + ay * 0.25, PHYS.spikeAngle * 0.55);
    }
    const len = Math.hypot(ax, ay);
    ball.vx = (ax / len) * speed;
    ball.vy = (ay / len) * speed;
    ball.spin += facing * 7;
    clampBallSpeed(ball);
    return true;
  }

  if (opts.block) {
    // Block: kill most of the pace and drop it back over.
    ball.vx = (-ball.vx * 0.35) + facing * 180;
    ball.vy = Math.abs(ball.vy) * -PHYS.blockDamp - 120;
    clampBallSpeed(ball);
    return true;
  }

  let speedCap = PHYS.touchMaxSpeed;
  if (circle.kind === 'head') speedCap *= PHYS.headBonus;

  // Placed touch: the hitter has a spot in mind, so solve the arc that lands
  // there instead of deflecting off the contact normal. This is what turns the
  // AI from "returns the ball" into "puts the ball where you are not".
  if (opts.aimX !== undefined && opts.aimX !== null) {
    const aim = aimVelocity(ball.x, ball.y, opts.aimX, opts.aimY ?? (COURT.groundY - 60), {
      pace: opts.pace || 760,
      minTime: 0.42,
      maxTime: 1.5,
      clearance: PHYS.clearMargin
    });
    let vx = aim.vx, vy = aim.vy;
    const s = Math.hypot(vx, vy);
    // Respect the same energy budget a normal bump gets - placement must not
    // become a free power-up.
    let want = PHYS.touchBaseSpeed + inSpeed * PHYS.touchIncomingKeep + playerSpeed * PHYS.touchPlayerKeep;
    want = clamp(want, PHYS.touchMinSpeed, speedCap);
    if (s > want) { vx = (vx / s) * want; vy = (vy / s) * want; }
    ball.vx = vx;
    ball.vy = Math.min(vy, -PHYS.minRise * 200);
    ball.spin += ball.vx * 0.003;
    // Only force the ball over the tape when the target really is on the far
    // side. A dig or a set is aimed into our own court on purpose, and the
    // clearance assist would turn it into an accidental free ball.
    const acrossNet = (ball.x - COURT.netX) * (opts.aimX - COURT.netX) < 0;
    if (acrossNet) ensureNetClearance(ball, facing);
    clampBallSpeed(ball);
    return true;
  }

  // Normal touch: aim = contact normal, biased towards the opponent's court and
  // always upward, so a bump is readable instead of a random ricochet.
  const bias = opts.lastTouch ? PHYS.clearBias : PHYS.forwardBias;
  let ax = nx * (1 - bias) + facing * bias;
  let ay = Math.min(ny, -PHYS.minRise);
  const len = Math.hypot(ax, ay) || 1;
  ax /= len; ay /= len;

  let speed = PHYS.touchBaseSpeed
            + inSpeed * PHYS.touchIncomingKeep
            + playerSpeed * PHYS.touchPlayerKeep;
  if (circle.kind === 'head') speed *= PHYS.headBonus;
  if (circle.kind === 'arm') speed *= 1.08;
  speed = clamp(speed, PHYS.touchMinSpeed, PHYS.touchMaxSpeed);

  ball.vx = ax * speed + playerVX * 0.2;
  ball.vy = ay * speed;
  ball.spin += (ball.vx * 0.003);

  ensureNetClearance(ball, facing);
  clampBallSpeed(ball);
  return true;
}

/**
 * Aim assist with a physical basis: if a bump is heading for the net but would
 * not clear the tape, raise its vertical velocity to exactly the arc that does.
 * Without this, touches taken near the sand slam into the net and every rally
 * ends in a four-touch fault. Spikes and blocks are deliberately excluded -
 * those are meant to be flat and to fail if they are mistimed.
 */
export function ensureNetClearance(ball, facing) {
  if (facing === 0) return;
  const towardsNet = Math.sign(COURT.netX - ball.x) === Math.sign(facing);
  if (!towardsNet) return;
  if (Math.sign(ball.vx) !== Math.sign(facing)) return;

  const dxToNet = Math.abs(COURT.netX - ball.x);
  const t = dxToNet / Math.max(120, Math.abs(ball.vx));
  const targetY = COURT.netTopY - PHYS.clearMargin;
  const g = PHYS.gravityBall;

  // y(t) = y0 + vy*t + 0.5*g*t^2  ->  vy needed to arrive at targetY
  const needed = (targetY - ball.y - 0.5 * g * t * t) / t;
  if (needed < ball.vy) {
    ball.vy = Math.max(needed, -PHYS.touchMaxSpeed);
  }
}

/** Keeps team-mates from standing inside each other. */
export function separatePlayers(a, b) {
  const dx = b.x - a.x;
  const dist = Math.abs(dx);
  const min = PHYS.playerRadius * 1.25;
  if (dist >= min || dist < 0.0001) return;
  const push = (min - dist) / 2 * Math.sign(dx || 1);
  a.x -= push; b.x += push;
}

/**
 * Predicts where a ball will cross a given height. Used by the AI and by the
 * landing marker. Pure: it never touches the live ball.
 */
export function predictLanding(ball, targetY = COURT.groundY - PHYS.ballRadius, maxTime = 4) {
  let x = ball.x, y = ball.y, vx = ball.vx, vy = ball.vy;
  const dt = 1 / 60;
  for (let t = 0; t < maxTime; t += dt) {
    vy += PHYS.gravityBall * dt;
    const drag = 1 - PHYS.ballDrag * dt;
    vx *= drag; vy *= drag;
    x += vx * dt;
    y += vy * dt;

    if (x - ball.r < COURT.left) { x = COURT.left + ball.r; vx = Math.abs(vx) * PHYS.ballRestitutionWall; }
    if (x + ball.r > COURT.right) { x = COURT.right - ball.r; vx = -Math.abs(vx) * PHYS.ballRestitutionWall; }

    if (vy > 0 && y >= targetY) return { x, y, t };
  }
  return { x, y, t: maxTime };
}


/**
 * Ballistic aim: the velocity that carries a ball from (x0,y0) to (tx,ty) under
 * gravity, choosing a flight time that also clears the net.
 *
 * This is what lets a touch be *placed* instead of merely deflected. The AI
 * uses it to drop balls into open sand; the power-ups use it to drive a
 * fireball at a chosen spot. Returns { vx, vy }.
 */
export function aimVelocity(x0, y0, tx, ty, opts = {}) {
  const g = PHYS.gravityBall;
  const dx = tx - x0;
  const dy = ty - y0;
  const dist = Math.hypot(dx, dy);

  // Start from a flight time that suits the distance, then loft it until the
  // arc passes over the tape. Four passes is plenty and keeps this cheap
  // enough to run for every AI player every step.
  let T = clamp(dist / (opts.pace || 720), opts.minTime || 0.45, opts.maxTime || 1.45);

  for (let i = 0; i < 5; i++) {
    const vx = dx / T;
    const vy = (dy - 0.5 * g * T * T) / T;

    // Where does this arc sit when it reaches the net?
    const crosses = (x0 - COURT.netX) * (tx - COURT.netX) < 0;
    if (!crosses) return { vx, vy, t: T };

    const tNet = (COURT.netX - x0) / (vx || 0.0001);
    if (tNet <= 0 || tNet >= T) return { vx, vy, t: T };
    const yNet = y0 + vy * tNet + 0.5 * g * tNet * tNet;

    const need = COURT.netTopY - (opts.clearance ?? PHYS.clearMargin);
    if (yNet <= need) return { vx, vy, t: T };

    T *= 1.18;   // too flat, throw it higher and try again
    if (T > 2.2) return { vx, vy, t: T };
  }
  return { vx: dx / T, vy: (dy - 0.5 * g * T * T) / T, t: T };
}

/**
 * Rewrites a ball's velocity as a charged super throw. Called the instant a
 * team spends a power, so the shot reads as different the moment it leaves.
 */
export function shapeSuperThrow(ball, kind, facing, aimX) {
  const speed = Math.hypot(ball.vx, ball.vy) || 600;

  if (kind === 'fire') {
    const cfg = POWERS.fire;
    const targetX = aimX ?? (COURT.netX + facing * (COURT.right - COURT.netX) * 0.62);
    const targetY = COURT.groundY - 40;
    const aim = aimVelocity(ball.x, ball.y, targetX, targetY, {
      pace: 1500, minTime: 0.34, maxTime: 0.8, clearance: 26
    });
    // Blend the placed arc with a flat drive so it looks like a rocket.
    const flat = cfg.flatten;
    let vx = aim.vx * (1 - flat) + facing * speed * flat;
    let vy = aim.vy * (1 - flat) + (-140) * flat;
    const s = Math.hypot(vx, vy) || 1;
    const target = clamp(speed * cfg.speedMul, cfg.minSpeed, cfg.maxSpeed);
    ball.vx = (vx / s) * target;
    ball.vy = (vy / s) * target;
    ball.spin += facing * 9;
    return;
  }

  if (kind === 'ice') {
    const cfg = POWERS.ice;
    ball.vx *= cfg.speedMul;
    ball.vy *= cfg.speedMul;
    ensureNetClearance(ball, facing);
    clampBallSpeed(ball);
    return;
  }

  // multi: the ball itself is unchanged, Match spawns the copies.
  ensureNetClearance(ball, facing);
  clampBallSpeed(ball);
}

/**
 * Splits a ball into `count` extra copies fanned around its current heading.
 * The originals keep flying, so a x3 multiball really is three live balls.
 */
export function fanVelocities(ball, count, spread, jitter = 0) {
  const speed = Math.hypot(ball.vx, ball.vy) || 700;
  const base = Math.atan2(ball.vy, ball.vx);
  const out = [];
  for (let i = 0; i < count; i++) {
    // -spread/2 .. +spread/2, skipping the centre line the original occupies
    const frac = count === 1 ? 1 : (i / (count - 1)) * 2 - 1;
    const a = base + frac * spread * (count === 1 ? 0.6 : 1);
    const s = speed * (1 + (Math.random() * 2 - 1) * jitter);
    out.push({ vx: Math.cos(a) * s, vy: Math.sin(a) * s });
  }
  return out;
}
