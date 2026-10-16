/**
 * The Hero Guild Brain (v2) — a shared, learning memory for every hero.
 *
 * It is a small tabular reinforcement learner. When a hero approaches a trap
 * it looks at the situation and picks an action:
 *
 *   go   – keep walking
 *   jump – jump now
 *   wait – stand still for a moment
 *   dash – sprint
 *
 * The situation ("state") is: which trap, how far away, what the trap is
 * doing right now, the hero's tactics group (breakers, shields, quick ones,
 * fire/ice mages, flyers, heavies…) and whether another trap waits right
 * behind it (a combo).
 *
 * When the encounter ends the brain is told how it went (+1 got past, −1 was
 * defeated) and every decision taken during that encounter is nudged toward
 * the result. Version 2 adds:
 *
 *   · adaptive learning rate — new situations are learned fast, well-known
 *     ones change slowly and stay stable;
 *   · experience replay — the guild keeps a memory of recent encounters and
 *     studies them again between waves;
 *   · danger sense — at a trap that keeps killing heroes they explore more
 *     and try new tricks (passed in by the game as an exploration boost).
 *
 * The memory is saved in localStorage, so heroes remember between sessions.
 */
export const ACTIONS = ['go', 'jump', 'wait', 'dash'];
const STORE = 'tdk_brain_v2';
const GAMMA = 0.85;
const MEMORY = 400;

export class Brain {
  constructor() {
    this.q = {};
    this.visits = {};
    this.mastery = {};
    this.memory = [];
    this.studied = 0;
    this.load();
  }

  key(kind, dist, phase, group, combo = 0) {
    return `${kind}|${dist}|${phase}|${group}|${combo}`;
  }

  values(k) {
    // A brand-new situation: heroes are naive and just keep walking.
    return this.q[k] || (this.q[k] = [0.15, 0, 0, 0.05]);
  }

  choose(k, boost = 0) {
    const v = this.values(k);
    const n = this.visits[k] || 0;
    this.visits[k] = n + 1;
    const eps = Math.max(0.04 + boost, 0.45 / (1 + n / 4));
    if (Math.random() < eps) return { a: (Math.random() * 4) | 0, explore: true };
    let a = 0;
    for (let i = 1; i < 4; i++) if (v[i] > v[a] + 1e-9 || (Math.abs(v[i] - v[a]) < 1e-9 && Math.random() < 0.5)) a = i;
    return { a, explore: false };
  }

  /** steps: [{k, a}] in the order they were taken; reward in [-1, 1]. */
  learn(steps, reward, scale = 1) {
    const n = steps.length;
    steps.forEach((s, i) => {
      const v = this.values(s.k);
      const seen = this.visits[s.k] || 1;
      const alpha = Math.max(0.08, 0.55 / Math.sqrt(1 + seen / 6)) * scale;
      const r = reward * Math.pow(GAMMA, n - 1 - i);
      v[s.a] += alpha * (r - v[s.a]);
    });
    if (scale === 1 && n) {
      this.memory.push({ s: steps.map((x) => [x.k, x.a]), r: reward });
      if (this.memory.length > MEMORY) this.memory.splice(0, this.memory.length - MEMORY);
    }
    this.dirty = true;
  }

  /** Study random old encounters again (between waves). Returns how many. */
  replay(n = 120) {
    const m = this.memory.length;
    if (!m) return 0;
    const count = Math.min(n, m * 2);
    for (let i = 0; i < count; i++) {
      // recent memories are picked more often
      const e = this.memory[m - 1 - Math.floor(Math.pow(Math.random(), 2) * m)];
      this.learn(e.s.map(([k, a]) => ({ k, a })), e.r, 0.35);
    }
    this.studied += count;
    return count;
  }

  /** Track how well the guild does against each trap kind (0..1). */
  record(kind, success) {
    const m = this.mastery[kind] || (this.mastery[kind] = { ema: 0, seen: 0 });
    const before = m.ema;
    m.ema = m.ema * 0.8 + (success ? 0.2 : 0);
    m.seen++;
    this.dirty = true;
    return { before, after: m.ema };
  }

  /** The trick the guild has learned for a trap kind (e.g. "jump"), or null. */
  favourite(kind) {
    const votes = [0, 0, 0, 0];
    let seen = false;
    for (const k in this.q) {
      if (!k.startsWith(kind + '|')) continue;
      const dist = +k.split('|')[1];
      const n = this.visits[k] || 0;
      if (dist > 2 || n < 3) continue;
      const v = this.q[k];
      let a = 0;
      for (let i = 1; i < 4; i++) if (v[i] > v[a]) a = i;
      if (v[a] <= 0.1) continue;
      seen = true;
      votes[a] += n;
    }
    if (!seen) return null;
    let a = 1;
    for (const i of [2, 3]) if (votes[i] > votes[a]) a = i;
    return votes[a] > 0 ? ACTIONS[a] : 'walk on';
  }

  /** How many different tactics groups have learned something. */
  groups() {
    const s = new Set();
    for (const k in this.q) if ((this.visits[k] || 0) >= 3) s.add(k.split('|')[3]);
    return s.size;
  }

  states() { return Object.keys(this.q).length; }

  iq(total = 16) {
    const kinds = Object.values(this.mastery);
    if (!kinds.length) return 0;
    return Math.round((kinds.reduce((s, m) => s + m.ema, 0) / total) * 100);
  }

  save() {
    if (!this.dirty) return;
    this.dirty = false;
    try {
      localStorage.setItem(STORE, JSON.stringify({ q: this.q, visits: this.visits, mastery: this.mastery, memory: this.memory.slice(-200), studied: this.studied }));
    } catch (e) {}
  }

  load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (d) Object.assign(this, { q: d.q || {}, visits: d.visits || {}, mastery: d.mastery || {}, memory: d.memory || [], studied: d.studied || 0 });
      else {
        // carry over what v1 heroes already knew about each trap
        const old = JSON.parse(localStorage.getItem('tdk_brain_v1') || 'null');
        if (old && old.mastery) this.mastery = old.mastery;
      }
    } catch (e) {}
  }

  reset() {
    this.q = {};
    this.visits = {};
    this.mastery = {};
    this.memory = [];
    this.studied = 0;
    this.dirty = true;
    this.save();
  }
}
