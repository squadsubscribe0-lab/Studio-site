// The AI brain.
//
// The old brain chased the ball and swung at it. This one plays volleyball:
//
//   perception  Each AI sees a *stale* copy of the ball, refreshed every
//               `reaction` seconds. Fast balls therefore genuinely beat it,
//               which is what makes a fireball feel dangerous instead of just
//               fast, and it is the single biggest source of difficulty.
//   claiming    One team-mate owns the ball, chosen by intercept cost rather
//               than raw distance, with hysteresis so two players never
//               shoulder-barge each other over the same dig.
//   plans       Touch 1 digs the ball up, touch 2 sets it near the net, touch 3
//               attacks the emptiest patch of the opponent's sand. In 1v1 the
//               brain sets itself up and then jumps on its own ball.
//   defence     The player nearest the net blocks a live attack; everyone else
//               spreads to cover the half the attacker is swinging towards.
//   greed       Loose power orbs are targets: the brain aims a dig straight
//               through one when the detour is cheap.
//
// The aim solver in physics.js does the ballistics, so all this file has to
// decide is *where* the ball should go.

import { COURT, PHYS, RULES, TEAM, POWERS } from '../config.js';
import { predictLanding, clamp, lerp } from './physics.js';

// Rise time to the top of a jump — used to start jumps early enough that the
// player actually meets the ball at the apex.
const JUMP_RISE = Math.abs(PHYS.jumpVel) / PHYS.gravityPlayer;

/** Difficulty 0.7 (Easy) .. 1.3 (Hard) mapped onto every knob at once. */
function profileFor(d) {
  const t = clamp((d - 0.7) / 0.6, 0, 1);
  return {
    reaction: lerp(0.38, 0.055, t),   // seconds between looks at the ball
    aimError: lerp(265, 75, t),       // how far off the intended spot a shot lands
    // How far towards the true gap an attack is aimed. Even at Hard this is
    // short of 1: an AI that hits the exact open corner every time turns 1v1
    // into serve-return-point, because one defender cannot cover a whole half.
    placement: lerp(0.30, 0.80, t),
    posError: lerp(85, 12, t),        // wobble on the standing position
    spikeChance: lerp(0.40, 0.96, t),
    blockChance: lerp(0.10, 0.72, t),
    diveChance: lerp(0.12, 0.95, t),
    speedMul: lerp(0.80, 1.05, t),
    orbGreed: lerp(0.15, 0.9, t),
    // Self-setting in 1v1 is a three-touch chain: lift, set, spike. Any slip in
    // it loses the point outright, so it is a Hard-end habit - ramped on t*t
    // so Normal only tries it occasionally.
    selfSet: lerp(0.03, 0.75, t * t),
    deadzone: lerp(34, 9, t)
  };
}

/** Cheap forward integration of a ball-like state. Shared by every query. */
function march(state, seconds, step = 1 / 60) {
  let { x, y, vx, vy } = state;
  const r = state.r || PHYS.ballRadius;
  const dragK = state.kind === 'fire' ? PHYS.ballDrag * 0.35 : PHYS.ballDrag;
  for (let t = 0; t < seconds; t += step) {
    vy += PHYS.gravityBall * step;
    const drag = 1 - dragK * step;
    vx *= drag; vy *= drag;
    x += vx * step; y += vy * step;
    if (x - r < COURT.left) { x = COURT.left + r; vx = Math.abs(vx) * PHYS.ballRestitutionWall; }
    if (x + r > COURT.right) { x = COURT.right - r; vx = -Math.abs(vx) * PHYS.ballRestitutionWall; }
  }
  return { x, y, vx, vy };
}

/**
 * When does this ball next fall past `hitY`, and where?
 * Returns { x, t, reachable } — reachable is false if it never gets there.
 */
function crossing(state, hitY, maxTime = 3) {
  let { x, y, vx, vy } = state;
  const r = state.r || PHYS.ballRadius;
  const dragK = state.kind === 'fire' ? PHYS.ballDrag * 0.35 : PHYS.ballDrag;
  const step = 1 / 90;
  for (let t = 0; t < maxTime; t += step) {
    vy += PHYS.gravityBall * step;
    const drag = 1 - dragK * step;
    vx *= drag; vy *= drag;
    x += vx * step; y += vy * step;
    if (x - r < COURT.left) { x = COURT.left + r; vx = Math.abs(vx) * PHYS.ballRestitutionWall; }
    if (x + r > COURT.right) { x = COURT.right - r; vx = -Math.abs(vx) * PHYS.ballRestitutionWall; }
    if (vy > 0 && y >= hitY) return { x, y, t, reachable: true };
    if (y + r >= COURT.groundY) return { x, y, t, reachable: false };
  }
  return { x, y, t: maxTime, reachable: false };
}

/** The ball this player should be thinking about. Handles multiball. */
function chooseBall(player, match) {
  let best = null, bestCost = Infinity;
  for (const ball of match.balls) {
    if (ball.dead) continue;
    const onMySide = (ball.x < COURT.netX) === (player.team === TEAM.LEFT);
    const land = predictLanding(ball, COURT.groundY - 110);
    const landsMySide = (land.x < COURT.netX) === (player.team === TEAM.LEFT);
    // Prefer a ball that is coming to us and coming soon.
    let cost = land.t * 100 + Math.abs(land.x - player.x) * 0.35;
    if (!onMySide && !landsMySide) cost += 1400;
    else if (!onMySide) cost += 200;
    if (cost < bestCost) { bestCost = cost; best = ball; }
  }
  return best || match.ball;
}

/** Who on this team takes the ball? Lowest intercept cost, with hysteresis. */
function claimFor(mates, landing, match) {
  let best = mates[0], bestCost = Infinity;
  for (const m of mates) {
    if (m.disabled) continue;
    const gap = Math.abs(m.x - landing.x);
    const travel = gap / (PHYS.playerSpeed * (m.speedMul || 1));
    // Someone already in position beats someone sprinting, and a player who
    // claimed the ball a moment ago keeps it unless badly beaten.
    let cost = travel + (travel > landing.t ? (travel - landing.t) * 1.4 : 0);
    if (m.aiState.claimUntil > match.time) cost -= 0.12;
    if (m.diveTimer > 0) cost -= 0.2;
    if (cost < bestCost) { bestCost = cost; best = m; }
  }
  return best;
}

/** The team-mate best placed to hit the third ball. */
function attackerFor(mates, team, exclude) {
  const netward = (p) => (team === TEAM.LEFT ? -p.x : p.x);
  let best = null;
  for (const m of mates) {
    if (m === exclude || m.disabled) continue;
    if (!best || netward(m) > netward(best)) best = m;
  }
  return best;
}

/** The middle of a team's own half. */
function halfCentre(team) {
  return team === TEAM.LEFT ? (COURT.left + COURT.netX) / 2 : (COURT.netX + COURT.right) / 2;
}

/** The centre of the opponent's half — where a safe return goes. */
function safeReturn(team) {
  const min = team === TEAM.LEFT ? COURT.netX + 120 : COURT.left + 120;
  const max = team === TEAM.LEFT ? COURT.right - 120 : COURT.netX - 120;
  const mid = (min + max) / 2;
  return mid + (Math.random() * 2 - 1) * (max - min) * 0.22;
}

/**
 * Where an attack is aimed: somewhere on the line between the middle of the
 * opponent's court and the genuine gap, how far along set by difficulty.
 */
function attackTarget(match, team, prof) {
  const gap = match.powers.openSpot(team);
  const min = team === TEAM.LEFT ? COURT.netX + 110 : COURT.left + 110;
  const max = team === TEAM.LEFT ? COURT.right - 110 : COURT.netX - 110;
  const mid = (min + max) / 2;
  return clamp(mid + (gap - mid) * prof.placement, min, max);
}

/** Nearest live orb worth detouring for, or null. */
function orbTarget(match, team, prof) {
  if (!POWERS.enabled || !match.powers.orbs.length) return null;
  if (match.powers.chargeOf(team)) return null;        // already loaded
  if (Math.random() > prof.orbGreed) return null;
  let best = null, bestD = Infinity;
  for (const o of match.powers.orbs) {
    const d = Math.abs(o.x - COURT.netX);
    if (d < bestD) { bestD = d; best = o; }
  }
  return best;
}

export function aiInput(player, match, dt, difficulty = 1) {
  const st = player.aiState;
  const prof = profileFor(difficulty);
  player.speedMul = prof.speedMul;

  const out = { move: 0, jump: false, spike: false, serve: true, aimX: null, aimY: null };
  if (player.disabled) return out;

  const towardsNet = player.team === TEAM.LEFT ? 1 : -1;
  const mates = match.players.filter((p) => p.team === player.team);
  const foes = match.players.filter((p) => p.team !== player.team);

  // ---------------------------------------------------------- perception
  // Refresh the mental picture on a timer. Everything below reasons about
  // `seen`, which may be a fraction of a second out of date.
  const live = chooseBall(player, match);
  if (!st.seen || match.time - st.seenAt >= prof.reaction || live.id !== st.seenId) {
    st.seen = { x: live.x, y: live.y, vx: live.vx, vy: live.vy, r: live.r, kind: live.kind, held: live.held };
    st.seenAt = match.time;
    st.seenId = live.id;
  }
  // Age the memory forward so the target does not sit still between glances.
  const age = match.time - st.seenAt;
  const seen = st.seen.held
    ? { ...st.seen }
    : { ...st.seen, ...march(st.seen, age) };

  const ballOnMySide = (seen.x < COURT.netX) === (player.team === TEAM.LEFT);
  const hitY = COURT.groundY - 110;
  const contact = crossing(seen, hitY);
  const landing = predictLanding({ ...seen, r: live.r });

  // ---------------------------------------------------------- serving
  if (live.held) {
    const serving = match.servingTeam === player.team && match.serverId === player.id;
    if (serving) {
      // Stand still and serve. The held ball is pinned to the server's own
      // hands, so walking "towards the ball" would chase a target that moves
      // with you — straight into the net.
      out.move = stepTowards(player, player.homeX, prof.deadzone);
      out.serve = match.serveTimer <= 0;
      // Aim a serve deep and to one side, but only half as decisively as an
      // attack: a serve placed straight into the gap is an unreturnable ace,
      // and a match decided on serves is not a match.
      const gap = match.powers.openSpot(player.team);
      const mid = safeReturn(player.team);   // centre of the receiving half
      out.aimX = mid + (gap - mid) * prof.placement * 0.5;
    } else {
      out.move = stepTowards(player, player.homeX, prof.deadzone);
    }
    return out;
  }

  // ---------------------------------------------------------- roles
  const claimant = mates.length === 1 ? player : claimFor(mates, landing, match);
  const isClaimant = claimant === player;
  if (isClaimant) st.claimUntil = match.time + 0.35;

  const attacker = mates.length === 1 ? player : (attackerFor(mates, player.team, claimant) || player);
  const touchesUsed = match.touchTeam === player.team ? match.touches : 0;
  const mustSend = touchesUsed >= RULES.maxTouches - 1 || match.powers.multiActive;

  if (ballOnMySide) {
    st.role = isClaimant ? 'play' : (player === attacker ? 'attack' : 'support');
  } else {
    st.role = 'defend';
  }

  // ---------------------------------------------------------- where to stand
  let targetX;

  if (st.role === 'play') {
    // Stand a little behind the contact point so the ball travels forward off
    // the touch rather than straight back up.
    const spot = contact.reachable ? contact.x : landing.x;
    targetX = spot - towardsNet * (mustSend ? 44 : 24);
  } else if (st.role === 'attack') {
    // Wait in the attacking zone, ready for the set.
    targetX = COURT.netX - towardsNet * 210;
  } else if (st.role === 'support') {
    // Cover the rest of the court while the claimant plays the ball — and stay
    // out of their way. Two players converging on the same dig is how a big
    // side loses points it should never lose.
    const centre = halfCentre(player.team);
    let spot = player.homeX + (landing.x - centre) * 0.2;
    const claimSpot = claimant ? claimant.aiState.targetX : landing.x;
    if (Math.abs(spot - claimSpot) < 130) {
      spot = claimSpot + Math.sign(spot - claimSpot || towardsNet) * 130;
    }
    targetX = spot;
  } else {
    // Defending: cover the half of our court the opponent is swinging at.
    targetX = defensiveSpot(player, foes, seen);
  }

  targetX += Math.sin(match.time * 1.6 + player.id * 2.3) * prof.posError * 0.4;
  targetX = clamp(targetX, player.bounds.min, player.bounds.max);
  st.targetX = targetX;
  out.move = stepTowards(player, targetX, prof.deadzone);

  // ---------------------------------------------------------- what to aim at
  // Anybody standing on the ball's side can end up touching it — in a 4v4 that
  // happens constantly. Giving every one of them a sensible target means a
  // stray contact is still a playable ball instead of a coin flip, which is
  // what was flattening skill out of the bigger team sizes.
  if (ballOnMySide && st.role !== 'play') {
    out.aimX = mustSend
      ? attackTarget(match, player.team, prof)
      : (mates.length === 1 ? safeReturn(player.team) : COURT.netX - towardsNet * 330);
    out.aimY = mustSend ? COURT.groundY - 50 : COURT.netTopY - 170;
  }

  if (st.role === 'play') {
    const plan = planShot(player, match, mates, attacker, touchesUsed, mustSend, prof, contact);
    // A dig or a set is a controlled touch to a team-mate a few metres away;
    // spraying it as wildly as an attack collapses the whole three-touch chain,
    // so the error is scaled down for the setup touches.
    const errScale = (plan.kind === 'set' || plan.kind === 'selfset' || plan.kind === 'dig') ? 0.35 : 1;
    out.aimX = plan.x + (Math.random() * 2 - 1) * prof.aimError * errScale;
    out.aimY = plan.y;
    st.plan = plan.kind;

    // ------------------------------------------------------- jump timing
    // Start the jump so the apex lands on the ball, not when the ball is
    // already past. This is what makes the AI spike instead of flailing.
    // Only an *attack* goes airborne: jumping on your own set would smash the
    // ball you were trying to lift.
    const wantsAir = plan.kind === 'attack';
    const reach = Math.abs(contact.x - player.x);
    if (wantsAir && contact.reachable && reach < 150 && player.onGround) {
      const airContact = crossing(seen, player.headY - 40);
      if (airContact.reachable && airContact.t <= JUMP_RISE + 0.06 && airContact.t > JUMP_RISE - 0.14) {
        if (Math.random() < prof.spikeChance) { out.jump = true; st.spikeWindow = 0.34; }
      }
    } else if (contact.reachable && contact.t < 0.5 && seen.y < player.headY + 30 && reach < 120) {
      // A ball arriving above head height still wants a small hop.
      out.jump = player.onGround && seen.y < player.headY - 10;
    }

    // Swing while airborne and the ball is in the strike zone.
    if (st.spikeWindow > 0) {
      st.spikeWindow -= dt;
      out.jump = true;
      const inZone = seen.y > player.headY - 110 && seen.y < player.headY + 50
                  && Math.abs(seen.x - player.x) < 95;
      if (!player.onGround && inZone) {
        out.spike = true;
        player.facing = towardsNet;
        st.spikeWindow = 0;
      }
    }

    // ------------------------------------------------------- emergency dive
    const outOfReach = Math.abs(landing.x - player.x) > 95 && Math.abs(landing.x - player.x) < 290;
    const noTime = landing.t < 0.5;
    if (player.onGround && outOfReach && noTime && player.diveCooldown <= 0 &&
        Math.random() < prof.diveChance) {
      player.facing = Math.sign(landing.x - player.x) || towardsNet;
      out.spike = true;
      out.move = player.facing;
    }
  } else if (st.role === 'defend') {
    // -------------------------------------------------------- blocking
    const blocker = nearestToNet(mates, player.team);
    if (blocker === player && shouldBlock(player, foes, seen, prof, match)) {
      out.jump = true;
      st.blockUntil = match.time + 0.5;
      out.move = Math.sign(COURT.netX - towardsNet * 60 - player.x) || 0;
    } else if (st.blockUntil > match.time) {
      out.jump = true;   // hold the block at the top
    }
  }

  return out;
}

function stepTowards(player, targetX, deadzone) {
  const dx = targetX - player.x;
  return Math.abs(dx) > deadzone ? Math.sign(dx) : 0;
}

/** Sag towards the side of our court the opposing attacker is facing. */
function defensiveSpot(player, foes, seen) {
  const towardsNet = player.team === TEAM.LEFT ? 1 : -1;
  // Mirror the attacker's position across the net: attackers hit cross-court
  // far more often than they hit line, so this is where the ball usually goes.
  let attacker = foes[0];
  for (const f of foes) {
    if (!attacker || Math.abs(f.x - seen.x) < Math.abs(attacker.x - seen.x)) attacker = f;
  }
  const mirrored = attacker ? COURT.netX - (attacker.x - COURT.netX) : player.homeX;

  // Shift the whole defensive line towards the threat instead of pulling every
  // defender to the same spot. Blending each player individually towards one
  // point squeezes a four-player wall into a huddle and opens the corners.
  const halfCentre = player.team === TEAM.LEFT
    ? (COURT.left + COURT.netX) / 2
    : (COURT.netX + COURT.right) / 2;
  const base = player.homeX + (mirrored - halfCentre) * 0.35;

  // Never park right against the net while defending.
  const minGap = 150;
  const netSide = COURT.netX - towardsNet * minGap;
  return towardsNet > 0 ? Math.min(base, netSide) : Math.max(base, netSide);
}

function nearestToNet(mates, team) {
  let best = null;
  for (const m of mates) {
    if (m.disabled) continue;
    const d = Math.abs(m.x - COURT.netX);
    if (!best || d < Math.abs(best.x - COURT.netX)) best = m;
  }
  return best;
}

/** Jump into a block when an opponent is attacking a high ball at the net. */
function shouldBlock(player, foes, seen, prof, match) {
  if (!player.onGround) return false;
  if (Math.abs(seen.x - COURT.netX) > 300) return false;
  if (seen.y > COURT.netTopY + 60) return false;             // ball is too low to block
  const airborneFoe = foes.some((f) => !f.onGround && Math.abs(f.x - COURT.netX) < 320);
  if (!airborneFoe) return false;
  if (Math.abs(player.x - COURT.netX) > 260) return false;
  return Math.random() < prof.blockChance * (1 - Math.min(1, Math.abs(seen.x - player.x) / 400));
}

/**
 * Decide where this touch should put the ball.
 * Returns { x, y, kind } — kind drives whether the brain jumps.
 */
function planShot(player, match, mates, attacker, touchesUsed, mustSend, prof, contact) {
  const team = player.team;
  const towardsNet = team === TEAM.LEFT ? 1 : -1;
  const solo = mates.length === 1;

  // A loose orb is worth more than a tidy dig — punch the ball through it.
  const orb = orbTarget(match, team, prof);
  if (orb && !mustSend) {
    return { x: orb.x, y: orb.y, kind: 'dig' };
  }

  if (mustSend || match.powers.multiActive) {
    // Last legal touch: attack the gap, as accurately as this difficulty allows.
    return { x: attackTarget(match, team, prof), y: COURT.groundY - 50, kind: 'attack' };
  }

  if (touchesUsed === 0) {
    if (solo) {
      // 1v1: pop the ball up in front of ourselves and go and hit it, but only
      // if there is room.
      // Only try it off a slow, high ball with time to spare - a scrambled dig
      // is not the moment to start building an attack.
      const room = Math.abs(contact.x - COURT.netX) > 220;
      const comfortable = contact.reachable && contact.t > 0.45
                       && Math.abs(contact.x - player.x) < 150;
      if (room && comfortable && Math.random() < prof.selfSet) {
        return { x: player.x + towardsNet * 130, y: COURT.netTopY - 130, kind: 'selfset' };
      }
      // Otherwise this is a *dig*, not an attack: put it safely over the middle
      // with height on it. A first-touch return that snipes the open corner is
      // unreturnable in 1v1 and kills every rally on the serve.
      return { x: safeReturn(team), y: COURT.groundY - 170, kind: 'return' };
    }
    // Dig high and central so a team-mate has time to get under it.
    const mid = (COURT.netX - towardsNet * 330);
    return { x: mid, y: COURT.netTopY - 190, kind: 'dig' };
  }

  // Second touch: set the ball just in front of the attacker, near the tape.
  const target = attacker && attacker !== player ? attacker : player;
  const setX = clamp(
    target.x + towardsNet * 60,
    team === TEAM.LEFT ? COURT.left + 140 : COURT.netX + 140,
    team === TEAM.LEFT ? COURT.netX - 140 : COURT.right - 140
  );
  const height = lerp(COURT.netTopY - 60, COURT.netTopY - 170, prof.selfSet);
  return { x: setX, y: height, kind: target === player ? 'selfspike' : 'set' };
}
