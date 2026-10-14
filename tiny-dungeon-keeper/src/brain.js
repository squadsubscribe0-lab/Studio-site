/**
 * The Hero Guild Brain — a shared, learning memory for every hero.
 *
 * It is a small tabular reinforcement learner. When a hero approaches a trap
 * it looks at the situation (which trap, how far away, what the trap is doing
 * right now, and what kind of hero it is) and picks an action:
 *
 *   go   – keep walking
 *   jump – jump now
 *   wait – stand still for a moment
 *   dash – sprint
 *
 * When the encounter ends the brain is told how it went (+1 got past, −1 was
 * defeated) and every decision taken during that encounter is nudged toward
 * the result. Over many heroes the guild learns, e.g., to jump spikes at the
 * last moment, to wait for fire vents to switch off, or to sprint under cages.
 * The memory is saved in localStorage, so heroes remember between sessions.
 */
export const ACTIONS = ['go', 'jump', 'wait', 'dash'];
const STORE = 'tdk_brain_v1';
const ALPHA = 0.25;
const GAMMA = 0.85;

export class Brain {
  constructor() {
    this.q = {};
    this.visits = {};
    this.mastery = {};
    this.load();
  }

  key(kind, dist, phase, group) {
    return `${kind}|${dist}|${phase}|${group}`;
  }

  values(k) {
    // A brand-new situation: heroes are naive and just keep walking.
    return this.q[k] || (this.q[k] = [0.15, 0, 0, 0.05]);
  }

  choose(k) {
    const v = this.values(k);
    const n = this.visits[k] || 0;
    this.visits[k] = n + 1;
    const eps = Math.max(0.04, 0.45 / (1 + n / 4));
    if (Math.random() < eps) return { a: (Math.random() * 4) | 0, explore: true };
    let a = 0;
    for (let i = 1; i < 4; i++) if (v[i] > v[a] + 1e-9 || (Math.abs(v[i] - v[a]) < 1e-9 && Math.random() < 0.5)) a = i;
    return { a, explore: false };
  }

  /** steps: [{k, a}] in the order they were taken; reward in [-1, 1]. */
  learn(steps, reward) {
    const n = steps.length;
    steps.forEach((s, i) => {
      const v = this.values(s.k);
      const r = reward * Math.pow(GAMMA, n - 1 - i);
      v[s.a] += ALPHA * (r - v[s.a]);
    });
    this.dirty = true;
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

  iq(total = 16) {
    const kinds = Object.values(this.mastery);
    if (!kinds.length) return 0;
    return Math.round((kinds.reduce((s, m) => s + m.ema, 0) / total) * 100);
  }

  save() {
    if (!this.dirty) return;
    this.dirty = false;
    try {
      localStorage.setItem(STORE, JSON.stringify({ q: this.q, visits: this.visits, mastery: this.mastery }));
    } catch (e) {}
  }

  load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (d) Object.assign(this, { q: d.q || {}, visits: d.visits || {}, mastery: d.mastery || {} });
    } catch (e) {}
  }

  reset() {
    this.q = {};
    this.visits = {};
    this.mastery = {};
    this.dirty = true;
    this.save();
  }
}
