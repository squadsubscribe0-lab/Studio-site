// Super throws.
//
// Three things are modelled here and nothing else touches them:
//
//   1. Orbs      - collectables that drift into a live rally at random times
//                  and random places. A ball striking an orb charges whichever
//                  team last touched that ball, so the pickup is contested:
//                  spiking through an orb steals it off the other side.
//   2. Charges   - a team holds at most one charge. It is spent automatically
//                  on that team's next contact, which means the AI and remote
//                  players use powers exactly the way a human does.
//   3. Effects   - the live consequences: a burning ball, frozen defenders, a
//                  court with three balls on it.
//
// Match owns a PowerSystem and calls tick()/fire(); everything the renderer and
// HUD need is readable off this object.

import { COURT, POWERS, TEAM } from '../config.js';
import { shapeSuperThrow, fanVelocities, predictLanding } from './physics.js';

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

export const POWER_META = {
  fire:  { label: 'FIREBALL',   color: '#ff7a1a', glow: '#ffd166', blurb: 'A burning rocket. Anyone who digs it gets scorched.' },
  ice:   { label: 'ICE BALL',   color: '#57d9ff', glow: '#dffbff', blurb: 'Freezes the defence solid for a moment.' },
  multi: { label: 'MULTI BALL', color: '#c084fc', glow: '#f5d0fe', blurb: 'Splits the ball in two or three for ten seconds.' }
};

/**
 * Hangs the loaded badge art on the metadata, called once at boot.
 *
 * It lives on POWER_META rather than being passed around because both the
 * canvas renderer and the DOM HUD draw these icons, and the HUD's painter is a
 * module-level function reached from three different screens - threading an
 * assets object down to it would mean changing every one of those call sites to
 * carry something they otherwise have no use for.
 */
export function attachPowerIcons(icons = {}) {
  for (const [type, img] of Object.entries(icons)) {
    if (POWER_META[type] && img) POWER_META[type].icon = img;
  }
}

export class PowerSystem {
  constructor(match) {
    this.match = match;
    this.orbs = [];
    this.charges = [null, null];      // per team: { type } or null
    this.multiTimer = 0;              // >0 while extra balls are live
    this.multiTeam = -1;
    this.nextSpawn = POWERS.firstSpawn;
    this.orbSeq = 1;
    this.rallyTime = 0;
  }

  get multiActive() { return this.multiTimer > 0; }

  chargeOf(team) { return this.charges[team]; }

  /** Called when a rally ends: orbs and ice melt, extra balls are cleaned up. */
  resetRally() {
    this.orbs.length = 0;
    this.multiTimer = 0;
    this.multiTeam = -1;
    this.rallyTime = 0;
    // The countdown deliberately carries over between rallies. Resetting it
    // meant that in 1v1 - where a point can be over in four seconds - an orb
    // never had time to appear at all.
    this.nextSpawn = Math.min(this.nextSpawn, POWERS.spawnMax);
  }

  /** The whistle occasionally just hands a side a power, so no rally is dull. */
  onServe(servingTeam) {
    if (!POWERS.enabled) return;
    if (Math.random() > POWERS.serveGrantChance) return;
    // Either team can be gifted - being on serve is not an advantage here.
    const team = Math.random() < 0.5 ? servingTeam : 1 - servingTeam;
    if (this.charges[team]) return;
    this.grant(team, pick(POWERS.types), 'whistle');
  }

  grant(team, type, source = 'orb') {
    this.charges[team] = { type };
    this.match.events.push({ type: 'powerGained', team, power: type, source });
  }

  clear(team) { this.charges[team] = null; }

  // ------------------------------------------------------------------ orbs
  spawnOrb() {
    // Orbs favour the middle of the court so both sides can fight for them, and
    // sit at a height a jumping player can plausibly reach the ball at.
    const mid = COURT.netX;
    const halfSpan = (COURT.right - COURT.left) * 0.34;
    const x = rand(mid - halfSpan, mid + halfSpan);
    const y = rand(COURT.ceiling + 120, COURT.netTopY - 40);
    const orb = {
      id: this.orbSeq++,
      x, y, baseY: y,
      r: POWERS.orbRadius,
      type: pick(POWERS.types),
      age: 0,
      life: POWERS.orbLife,
      bob: Math.random() * Math.PI * 2,
      taken: false
    };
    this.orbs.push(orb);
    this.match.events.push({ type: 'orbSpawn', x, y, power: orb.type });
    return orb;
  }

  tick(dt, balls) {
    if (!POWERS.enabled) return;
    this.rallyTime += dt;

    // ---- multiball countdown
    if (this.multiTimer > 0) {
      this.multiTimer -= dt;
      if (this.multiTimer <= 0) {
        this.multiTimer = 0;
        this.match.retireExtraBalls();
        this.match.events.push({ type: 'multiEnd' });
      }
    }

    // ---- orb spawning
    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0) {
      if (this.orbs.length < POWERS.maxOrbs) this.spawnOrb();
      this.nextSpawn = rand(POWERS.spawnMin, POWERS.spawnMax);
    }

    // ---- orb lifetime + pickup
    for (const orb of this.orbs) {
      orb.age += dt;
      orb.bob += dt * 2.4;
      orb.y = orb.baseY + Math.sin(orb.bob) * 16;

      if (orb.taken) continue;
      for (const ball of balls) {
        if (ball.held || ball.dead) continue;
        const d = Math.hypot(ball.x - orb.x, ball.y - orb.y);
        if (d > orb.r + ball.r) continue;

        // Whoever last touched this ball claims it. An untouched ball hands the
        // orb to the side it is flying towards.
        let team = ball.lastTouchTeam;
        if (team !== TEAM.LEFT && team !== TEAM.RIGHT) {
          team = ball.vx >= 0 ? TEAM.LEFT : TEAM.RIGHT;
        }
        orb.taken = true;
        this.match.events.push({ type: 'orbTaken', x: orb.x, y: orb.y, power: orb.type, team });
        // A team already holding a charge upgrades rather than wasting the pickup.
        this.grant(team, orb.type, 'orb');
        break;
      }
    }
    this.orbs = this.orbs.filter((o) => !o.taken && o.age < o.life);
  }

  // --------------------------------------------------------------- firing
  /**
   * Spends `team`'s charge on the ball they have just struck.
   * Returns the power type that fired, or null.
   */
  fire(team, player, ball) {
    const held = this.charges[team];
    if (!held) return null;
    // Multiball on top of multiball would spiral, so bank it for later.
    if (held.type === 'multi' && this.multiActive) return null;

    this.charges[team] = null;
    const facing = team === TEAM.LEFT ? 1 : -1;
    const aimX = this.openSpot(team);

    if (held.type === 'fire') {
      ball.charge('fire');
      shapeSuperThrow(ball, 'fire', facing, aimX);
    } else if (held.type === 'ice') {
      ball.charge('ice');
      shapeSuperThrow(ball, 'ice', facing, aimX);
      this.freezeDefence(team);
    } else if (held.type === 'multi') {
      shapeSuperThrow(ball, 'multi', facing, aimX);
      this.splitBall(team, ball);
    }

    this.match.events.push({
      type: 'powerFired', team, power: held.type,
      x: ball.x, y: ball.y, player
    });
    return held.type;
  }

  /** Freezes the opposing side. Solo opponents lose one body, teams lose two. */
  freezeDefence(team) {
    const foes = this.match.players.filter((p) => p.team !== team);
    const n = foes.length <= 1 ? POWERS.ice.targetsSolo
            : Math.min(POWERS.ice.targetsTeam, foes.length);
    // Freeze the defenders who matter: the ones closest to where the ball is
    // going. Icing someone parked in the corner would not feel like a power.
    const landing = predictLanding(this.match.ball);
    const ranked = [...foes].sort(
      (a, b) => Math.abs(a.x - landing.x) - Math.abs(b.x - landing.x)
    );
    for (let i = 0; i < n; i++) {
      const p = ranked[i];
      if (!p) break;
      p.freeze(POWERS.ice.freezeTime);
      this.match.events.push({ type: 'frozen', player: p, x: p.x, y: p.bodyY });
    }
  }

  /** x2 or x3: fans one or two clones off the struck ball. */
  splitBall(team, ball) {
    const extra = Math.round(rand(POWERS.multi.extraMin, POWERS.multi.extraMax));
    const vels = fanVelocities(ball, extra, POWERS.multi.spread, POWERS.multi.speedJitter);
    for (const v of vels) this.match.addBall(ball.spawnCopy(v.vx, v.vy));
    this.multiTimer = POWERS.multi.duration;
    this.multiTeam = team;
    this.match.events.push({
      type: 'multiStart', team, count: extra + 1, x: ball.x, y: ball.y
    });
  }

  /**
   * The emptiest patch of the opponent's court - used to aim super throws.
   * Sampling beats geometry here: it stays correct for 1v1 and for 4v4.
   */
  openSpot(team) {
    const foes = this.match.players.filter((p) => p.team !== team);
    const min = team === TEAM.LEFT ? COURT.netX + 90 : COURT.left + 90;
    const max = team === TEAM.LEFT ? COURT.right - 90 : COURT.netX - 90;
    let bestX = (min + max) / 2, bestScore = -Infinity;
    for (let i = 0; i <= 10; i++) {
      const x = min + ((max - min) * i) / 10;
      let score = foes.length ? Infinity : 0;
      for (const f of foes) score = Math.min(score, Math.abs(f.x - x));
      // Nudge towards the back of the court: deep balls are harder to dig.
      const depth = team === TEAM.LEFT ? (x - min) / (max - min) : (max - x) / (max - min);
      score += depth * 90;
      if (score > bestScore) { bestScore = score; bestX = x; }
    }
    return bestX;
  }

  /** Consequences of a defender making contact with a charged ball. */
  onDefenderTouch(player, ball) {
    if (ball.kind === 'fire') {
      player.scorch(POWERS.fire.burnTime);
      this.match.events.push({ type: 'scorched', player, x: player.x, y: player.bodyY });
    } else if (ball.kind === 'ice') {
      player.chill(POWERS.ice.slowAfter, POWERS.ice.slowTime);
    }
  }

  // ------------------------------------------------------------ networking
  snapshot() {
    return {
      c: this.charges.map((c) => (c ? c.type : 0)),
      m: Math.round(this.multiTimer * 10),
      o: this.orbs.map((o) => [Math.round(o.x), Math.round(o.y), POWERS.types.indexOf(o.type)])
    };
  }

  applySnapshot(s) {
    if (!s) return;
    this.charges = s.c.map((t) => (t ? { type: t } : null));
    this.multiTimer = s.m / 10;
    // Orbs are cosmetic for a guest - the host decides who collects them.
    this.orbs = s.o.map((a, i) => ({
      id: -i - 1, x: a[0], y: a[1], baseY: a[1], r: POWERS.orbRadius,
      type: POWERS.types[a[2]] || 'fire', age: 0, life: 99, bob: 0, taken: false
    }));
  }
}
