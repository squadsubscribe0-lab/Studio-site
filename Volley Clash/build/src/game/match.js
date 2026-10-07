import { COURT, PHYS, RULES, TEAM, FORMATIONS } from '../config.js';
import { Ball, Player } from './entities.js';
import { stepBall, collideBallCircle, separatePlayers } from './physics.js';
import { PowerSystem } from './powers.js';
import { aiInput } from './ai.js';
import { EMPTY_INPUT } from '../core/input.js';

export const STATE = {
  SERVE: 'serve',
  RALLY: 'rally',
  POINT: 'point',
  OVER: 'over'
};

export class Match {
  /**
   * @param {object} cfg
   *   teamSize   1..4
   *   mode       'ai' | 'local' | 'online'
   *   difficulty 0.7 | 1 | 1.3
   *   characters { left:[ids], right:[ids] }
   *   ballSkin   ball manifest entry
   *   names      { left, right }
   *   localSeats [{team, slot, controller}]  which bodies this machine drives
   */
  constructor(cfg, assets) {
    this.cfg = Object.assign({
      teamSize: 1, mode: 'ai', difficulty: 1,
      pointsToWin: RULES.pointsToWin, matchSeconds: RULES.matchSeconds
    }, cfg);
    this.assets = assets;

    // balls[0] is always the real ball; multiball adds temporary copies behind
    // it. Everything that used to say `match.ball` still works.
    this.balls = [new Ball(cfg.ballSkin || assets.balls[0])];
    this.players = [];
    this.score = [0, 0];
    this.touches = 0;
    this.touchTeam = -1;
    this.time = 0;
    this.clock = this.cfg.matchSeconds;
    this.state = STATE.SERVE;
    this.stateTimer = RULES.serveDelay;
    this.serveTimer = RULES.serveDelay;
    this.servingTeam = TEAM.LEFT;
    this.rallyLength = 0;
    this.longestRally = 0;
    this.events = [];
    this.lastPointReason = '';
    this.winner = -1;

    this.powers = new PowerSystem(this);

    this.buildTeams();
    this.setupServe();
  }

  get ball() { return this.balls[0]; }

  addBall(ball) { this.balls.push(ball); }

  /** Drops every multiball copy, leaving the one real ball. */
  retireExtraBalls() {
    for (const b of this.balls) {
      if (!b.primary) this.events.push({ type: 'ballGone', x: b.x, y: b.y, kind: b.kind });
    }
    this.balls = this.balls.filter((b) => b.primary);
  }

  buildTeams() {
    const n = this.cfg.teamSize;
    const form = FORMATIONS[n] || FORMATIONS[1];
    const chars = this.cfg.characters || { left: [], right: [] };
    const seats = this.cfg.localSeats || [{ team: TEAM.LEFT, slot: 0, controller: 'human0' }];

    for (const team of [TEAM.LEFT, TEAM.RIGHT]) {
      for (let slot = 0; slot < n; slot++) {
        const frac = form[slot];
        const homeX = team === TEAM.LEFT
          ? COURT.netX - frac * (COURT.netX - COURT.left)
          : COURT.netX + frac * (COURT.right - COURT.netX);

        const seat = seats.find((s) => s.team === team && s.slot === slot);
        const list = team === TEAM.LEFT ? chars.left : chars.right;
        const character = list[slot] || this.assets.characters[(slot + team) % this.assets.characters.length];

        this.players.push(new Player({
          team, slot, homeX, character,
          controller: seat ? seat.controller : 'ai',
          name: seat ? (seat.name || 'You') : (team === TEAM.LEFT ? 'Ally' : 'Rival')
        }));
      }
    }
  }

  playerAt(team, slot) {
    return this.players.find((p) => p.team === team && p.slot === slot);
  }

  setupServe() {
    // The slot furthest from the net serves — like a real rotation, simplified.
    const team = this.servingTeam;
    const mates = this.players.filter((p) => p.team === team);
    const server = mates[mates.length - 1];
    this.serverId = server.id;

    for (const p of this.players) {
      p.x = p.homeX; p.y = COURT.groundY;
      p.vx = 0; p.vy = 0;
      p.onGround = true;
      p.diveTimer = 0;
      p.frozen = 0;
      p.slow = 0;
      p.slowFactor = 1;
      p.burning = 0;
      p.aimX = null;
      p.facing = p.team === TEAM.LEFT ? 1 : -1;
    }

    this.balls = this.balls.filter((b) => b.primary);
    this.ball.reset(server.x + (team === TEAM.LEFT ? 60 : -60), COURT.groundY - 300);
    this.ball.held = true;
    this.touches = 0;
    this.touchTeam = -1;
    this.rallyLength = 0;
    this.state = STATE.SERVE;
    this.serveTimer = RULES.serveDelay;
    this.powers.resetRally();
    this.powers.onServe(team);
    this.events.push({ type: 'whistle' });
  }

  awardPoint(team, reason) {
    if (this.state === STATE.POINT || this.state === STATE.OVER) return;
    this.score[team]++;
    this.lastPointReason = reason;
    this.longestRally = Math.max(this.longestRally, this.rallyLength);
    this.servingTeam = team;
    this.state = STATE.POINT;
    this.stateTimer = RULES.pointDelay;
    this.events.push({ type: 'point', team, reason, rally: this.rallyLength });

    const target = this.cfg.pointsToWin;
    const [a, b] = this.score;
    const lead = Math.abs(a - b);
    if ((a >= target || b >= target) && (!RULES.winByTwo || lead >= 2)) {
      this.finish(a > b ? TEAM.LEFT : TEAM.RIGHT);
    }
  }

  finish(team) {
    this.winner = team;
    this.state = STATE.OVER;
    this.events.push({ type: 'over', team });
  }

  /**
   * One fixed step.
   * @param {Map<number, object>} inputs player id -> input object
   */
  step(dt, inputs) {
    this.time += dt;

    if (this.state === STATE.OVER) return;

    if (this.state === STATE.POINT) {
      this.stateTimer -= dt;
      // Players keep moving during the freeze so it does not feel dead.
      for (const p of this.players) p.update(EMPTY_INPUT, dt, this.events);
      if (this.stateTimer <= 0) this.setupServe();
      return;
    }

    if (this.clock > 0) {
      this.clock = Math.max(0, this.clock - dt);
      if (this.clock === 0 && this.state !== STATE.OVER) {
        if (this.score[0] !== this.score[1]) this.finish(this.score[0] > this.score[1] ? TEAM.LEFT : TEAM.RIGHT);
        else this.clock = 30; // sudden death: 30 more seconds, next point wins
      }
    }

    // ---- players
    for (const p of this.players) {
      let input = inputs.get(p.id);
      if (!input) {
        // `p.difficulty` lets one body be tuned on its own - handicap matches,
        // mixed-skill AI squads - and falls back to the match setting.
        input = p.controller === 'ai'
          ? aiInput(p, this, dt, p.difficulty ?? this.cfg.difficulty)
          : EMPTY_INPUT;
      }
      if (input.aimX !== undefined) p.aimX = input.aimX;
      if (input.aimY !== undefined) p.aimY = input.aimY;
      p.update(input, dt, this.events);
    }
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        if (this.players[i].team === this.players[j].team) separatePlayers(this.players[i], this.players[j]);
      }
    }

    // ---- serve
    if (this.state === STATE.SERVE) {
      this.serveTimer -= dt;
      const server = this.players.find((p) => p.id === this.serverId);
      if (server) {
        // Hold the ball beside the server, but never let it drift onto — or
        // past — the net, or the serve leaves from the wrong side of the court.
        const held = server.x + (server.team === TEAM.LEFT ? 55 : -55);
        const limit = COURT.netHalfWidth + this.ball.r + 20;
        this.ball.x = server.team === TEAM.LEFT
          ? Math.min(held, COURT.netX - limit)
          : Math.max(held, COURT.netX + limit);
      }
      const input = inputs.get(this.serverId);
      // Auto-serve if nobody presses anything, so a match can never stall.
      const wantsServe = (input ? (input.serve || input.jump) : false) || this.serveTimer <= -2.5;
      if (this.serveTimer <= 0 && wantsServe) {
        // The server's own aim (the AI picks a gap; a human just gets the
        // default deep-middle target) shapes where the serve lands.
        this.ball.serve(server.team === TEAM.LEFT ? 1 : -1, input ? input.aimX : server.aimX);
        this.state = STATE.RALLY;
        this.touchTeam = server.team;
        this.touches = 1;
        this.ball.lastTouchTeam = server.team;
        this.ball.lastTouchId = server.id;
        this.events.push({ type: 'hit', power: 0.6, x: this.ball.x, y: this.ball.y, team: server.team });
        // A charge held at the whistle fires on the serve itself.
        this.powers.fire(server.team, server, this.ball);
      }
      return;
    }

    // ---- balls
    this.powers.tick(dt, this.balls);
    for (const ball of this.balls) {
      if (ball.dead) continue;
      ball.update(dt);
      const ballEvents = stepBall(ball, dt);
      ball.recordTrail();

      for (const ev of ballEvents) {
        if (ev.type === 'ground') {
          this.onBallDown(ball, ev);
          if (this.state !== STATE.RALLY) return;
          break;
        }
        if (ev.type === 'net') this.events.push({ type: 'net', x: ball.x, y: ball.y });
        if (ev.type === 'wall') this.events.push({ type: 'wall', x: ball.x, y: ball.y });
      }
    }
    this.balls = this.balls.filter((b) => !b.dead);
    if (!this.balls.length) return;

    // ---- balls vs players
    for (const p of this.players) {
      if (p.hitTimer > 0 || p.disabled) continue;
      let hitSomething = false;
      for (const ball of this.balls) {
        if (ball.held || ball.dead) continue;
        for (const c of p.hitCircles()) {
          const spike = !p.onGround && p.spikeHeld;
          const hit = collideBallCircle(ball, c, p.vx, p.vy, {
            spike,
            block: p.blocking,
            facing: p.team === TEAM.LEFT ? 1 : -1,
            aimX: p.aimX,
            aimY: p.aimY,
            lastTouch: p.team === this.touchTeam && this.touches >= RULES.maxTouches - 1
          });
          if (!hit) continue;

          // Digging a charged ball has a cost, and clears the charge off it.
          if (ball.kind !== 'normal' && ball.lastTouchTeam !== p.team) {
            this.powers.onDefenderTouch(p, ball);
            ball.kind = 'normal';
          }

          this.registerTouch(p, spike, ball);
          hitSomething = true;
          break;
        }
        if (hitSomething) break;
      }
    }

    // Which side is the ball on? Crossing the net resets the touch count.
    // With extra balls in the air the count is meaningless, so it is paused.
    if (!this.powers.multiActive) {
      const side = this.ball.x < COURT.netX ? TEAM.LEFT : TEAM.RIGHT;
      if (this.ball.lastTouchTeam !== -1 && side !== this.touchTeam && this.touches > 0) {
        this.touchTeam = side;
        this.touches = 0;
      }
    }
  }

  /** A ball has reached the sand. During multiball the first one down ends it. */
  onBallDown(ball, ev) {
    const side = ev.x < COURT.netX ? TEAM.LEFT : TEAM.RIGHT;
    this.events.push({ type: 'impact', x: ev.x, y: COURT.groundY, kind: ball.kind });
    this.awardPoint(side === TEAM.LEFT ? TEAM.RIGHT : TEAM.LEFT, 'ball down');
    this.retireExtraBalls();
    this.powers.multiTimer = 0;
  }

  registerTouch(p, spike, ball = this.ball) {
    const isNewSide = p.team !== this.touchTeam;
    if (isNewSide) { this.touchTeam = p.team; this.touches = 0; }

    if (!RULES.allowDoubleTouch && ball.lastTouchId === p.id && !isNewSide && !this.powers.multiActive) {
      this.awardPoint(p.team === TEAM.LEFT ? TEAM.RIGHT : TEAM.LEFT, 'double touch');
      return;
    }

    this.touches++;
    this.rallyLength++;
    ball.lastTouchTeam = p.team;
    ball.lastTouchId = p.id;
    p.hitFlash = 1;
    p.hitTimer = 0.12;

    // Spend a charge on this contact. This runs for humans, AI and remote
    // players alike, so nothing has to know how a power is "activated".
    const fired = ball.primary || !this.powers.multiActive
      ? this.powers.fire(p.team, p, ball)
      : null;

    this.events.push({
      type: spike ? 'spike' : 'hit',
      power: Math.min(1, Math.hypot(ball.vx, ball.vy) / PHYS.ballMaxSpeed),
      x: ball.x, y: ball.y, team: p.team, super: fired || null
    });

    if (!this.powers.multiActive && this.touches > RULES.maxTouches) {
      this.awardPoint(p.team === TEAM.LEFT ? TEAM.RIGHT : TEAM.LEFT, 'four touches');
    }
  }

  drainEvents() {
    const e = this.events;
    this.events = [];
    return e;
  }

  /** Compact snapshot for the network host to broadcast. */
  snapshot() {
    return {
      t: Math.round(this.time * 1000),
      s: this.score,
      st: this.state,
      c: Math.round(this.clock),
      b: this.balls.map((b) => [
        Math.round(b.x), Math.round(b.y), Math.round(b.vx), Math.round(b.vy),
        b.held ? 1 : 0, b.kind === 'fire' ? 1 : b.kind === 'ice' ? 2 : 0, b.primary ? 1 : 0
      ]),
      p: this.players.map((p) => p.serialize()),
      pw: this.powers.snapshot()
    };
  }

  applySnapshot(s) {
    this.score = s.s;
    this.state = s.st;
    this.clock = s.c;

    const KIND = ['normal', 'fire', 'ice'];
    const incoming = Array.isArray(s.b[0]) ? s.b : [s.b];   // tolerate old packets
    // Reuse ball objects where we can so trails do not flicker every snapshot.
    while (this.balls.length > incoming.length) this.balls.pop();
    while (this.balls.length < incoming.length) {
      this.balls.push(this.ball.spawnCopy(0, 0));
    }
    incoming.forEach((a, i) => {
      const b = this.balls[i];
      b.x = a[0]; b.y = a[1]; b.vx = a[2]; b.vy = a[3];
      b.held = !!a[4];
      b.kind = KIND[a[5]] || 'normal';
      b.primary = a[6] === undefined ? i === 0 : !!a[6];
    });

    s.p.forEach((arr, i) => this.players[i] && this.players[i].applySnapshot(arr));
    this.powers.applySnapshot(s.pw);
  }
}
