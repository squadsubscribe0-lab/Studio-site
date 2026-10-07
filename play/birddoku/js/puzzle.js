/* ---------------------------------------------------------------
   Birddoku - puzzle engine
   Rules of a valid board (N x N, N birds):
     1. exactly one bird per colour region
     2. exactly one bird per row and per column
     3. no two birds may touch, not even diagonally
   Every generated level has exactly ONE solution.
---------------------------------------------------------------- */

/* deterministic RNG so level 12 is always the same puzzle */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Puzzle = (function () {

  function shuffled(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* one bird per row/column, never touching -> |c(r) - c(r+1)| >= 2 */
  function buildSolution(n, rng) {
    const cols = [];
    const used = new Array(n).fill(false);
    function step(row) {
      if (row === n) return true;
      for (const c of shuffled([...Array(n).keys()], rng)) {
        if (used[c]) continue;
        if (row > 0 && Math.abs(cols[row - 1] - c) < 2) continue;
        used[c] = true;
        cols.push(c);
        if (step(row + 1)) return true;
        cols.pop();
        used[c] = false;
      }
      return false;
    }
    return step(0) ? cols : null;
  }

  /* grow N contiguous colour blobs, each seeded on one bird cell */
  function growRegions(n, sol, rng) {
    const reg = new Array(n * n).fill(-1);
    for (let r = 0; r < n; r++) reg[r * n + sol[r]] = r;
    let left = n * n - n;

    /* round-robin growth: every colour gets a turn, so sizes stay in range */
    while (left > 0) {
      let moved = false;
      for (const g of shuffled([...Array(n).keys()], rng)) {
        if (left === 0) break;
        const take = 1 + ((rng() * 2) | 0);
        for (let t = 0; t < take && left > 0; t++) {
          const edge = [];
          for (let i = 0; i < n * n; i++) {
            if (reg[i] !== g) continue;
            const r = (i / n) | 0, c = i % n;
            if (r > 0 && reg[i - n] === -1) edge.push(i - n);
            if (r < n - 1 && reg[i + n] === -1) edge.push(i + n);
            if (c > 0 && reg[i - 1] === -1) edge.push(i - 1);
            if (c < n - 1 && reg[i + 1] === -1) edge.push(i + 1);
          }
          if (!edge.length) break;
          reg[edge[(rng() * edge.length) | 0]] = g;
          left--;
          moved = true;
        }
      }
      if (!moved) return null;   // stranded cells, try again
    }
    return reg;
  }

  /* solve, stopping once `limit` solutions are found */
  function findSolutions(n, reg, limit) {
    const usedCol = new Array(n).fill(false);
    const usedReg = new Array(n).fill(false);
    const pick = new Array(n).fill(-1);
    const out = [];

    (function step(row) {
      if (out.length >= limit) return;
      if (row === n) { out.push(pick.slice()); return; }
      for (let c = 0; c < n; c++) {
        if (usedCol[c]) continue;
        const r = reg[row * n + c];
        if (usedReg[r]) continue;
        if (row > 0 && Math.abs(pick[row - 1] - c) < 2) continue;
        usedCol[c] = usedReg[r] = true;
        pick[row] = c;
        step(row + 1);
        usedCol[c] = usedReg[r] = false;
        if (out.length >= limit) return;
      }
    })(0);

    return out;
  }

  function countSolutions(n, reg, limit) {
    return findSolutions(n, reg, limit).length;
  }

  /* would region `g` still be one connected blob without cell `x`? */
  function staysConnected(n, reg, g, x) {
    const cells = [];
    for (let i = 0; i < n * n; i++) if (reg[i] === g && i !== x) cells.push(i);
    if (!cells.length) return false;
    const seen = new Set([cells[0]]);
    const stack = [cells[0]];
    while (stack.length) {
      const i = stack.pop();
      const r = (i / n) | 0, c = i % n;
      const adj = [];
      if (r > 0) adj.push(i - n);
      if (r < n - 1) adj.push(i + n);
      if (c > 0) adj.push(i - 1);
      if (c < n - 1) adj.push(i + 1);
      for (const j of adj)
        if (j !== x && reg[j] === g && !seen.has(j)) { seen.add(j); stack.push(j); }
    }
    return seen.size === cells.length;
  }

  /* Move one boundary cell into a neighbouring colour so that the rival
     solution `other` dies, while the intended solution stays untouched. */
  function carve(n, reg, sol, other, rng) {
    const rows = [];
    for (let r = 0; r < n; r++) if (other[r] !== sol[r]) rows.push(r);

    for (const r of shuffled(rows, rng)) {
      const x = r * n + other[r];
      const g = reg[x];
      if (!staysConnected(n, reg, g, x)) continue;

      const c = other[r];
      const near = [];
      if (r > 0) near.push(x - n);
      if (r < n - 1) near.push(x + n);
      if (c > 0) near.push(x - 1);
      if (c < n - 1) near.push(x + 1);

      const taken = new Set();               // colours the rival already uses
      for (let rr = 0; rr < n; rr++) if (rr !== r) taken.add(reg[rr * n + other[rr]]);

      const opts = shuffled(near, rng).map(i => reg[i]).filter(h => h !== g);

      // prefer a colour that instantly invalidates the rival
      const best = opts.find(h => taken.has(h));
      const target = best !== undefined ? best : opts[0];
      if (target === undefined) continue;

      reg[x] = target;
      return true;
    }
    return false;
  }

  /* regions that are all the same size feel dull - reject the flattest ones */
  function shapeScore(n, reg) {
    const size = new Array(n).fill(0);
    for (const r of reg) size[r]++;
    let spread = 0;
    for (const s of size) spread += Math.abs(s - n);
    return spread;
  }

  /* 0 = a good looking board. Higher = lazier board. */
  function grade(n, reg) {
    const size = new Array(n).fill(0);
    for (const r of reg) size[r]++;
    const small = Math.min(...size), big = Math.max(...size);
    const cap = Math.round(n * 2.2);
    let bad = 0;
    if (small < 2) bad += (2 - small) * 20;          // a lone cell gives a bird away
    if (big > cap) bad += (big - cap) * 4;           // one colour swallowing the board
    if (shapeScore(n, reg) < n) bad += 6;            // too neat to be interesting
    return bad;
  }

  function generate(n, rng) {
    let fallback = null, fallbackBad = Infinity;

    for (let attempt = 0; attempt < 150; attempt++) {
      const sol = buildSolution(n, rng);
      if (!sol) continue;
      const reg = growRegions(n, sol, rng);
      if (!reg) continue;
      if (!fallback) fallback = { n, sol, regions: reg.slice() };   // never return nothing

      for (let step = 0; step < 240; step++) {
        const sols = findSolutions(n, reg, 2);
        if (sols.length === 1) {
          const puz = { n, sol, regions: reg };
          const bad = grade(n, reg);
          if (bad === 0) return puz;
          if (bad < fallbackBad) { fallback = puz; fallbackBad = bad; }
          break;
        }
        const rival = sols.find(s => s.some((c, r) => c !== sol[r]));
        if (!rival || !carve(n, reg, sol, rival, rng)) break;
      }
    }
    return fallback;
  }

  /* --- helpers used by the game --- */

  function neighbours(n, i) {
    const r = (i / n) | 0, c = i % n, out = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n) out.push(nr * n + nc);
      }
    return out;
  }

  /* which placed birds clash with a bird dropped on cell `i` */
  function conflicts(n, reg, cells, i) {
    const r = (i / n) | 0, c = i % n, out = [];
    for (let j = 0; j < n * n; j++) {
      if (j === i || cells[j] !== 2) continue;
      const jr = (j / n) | 0, jc = j % n;
      if (jr === r || jc === c || reg[j] === reg[i] ||
          (Math.abs(jr - r) <= 1 && Math.abs(jc - c) <= 1)) out.push(j);
    }
    return out;
  }

  return { generate, neighbours, conflicts, countSolutions };
})();

if (typeof module !== 'undefined') module.exports = { Puzzle, mulberry32 };
