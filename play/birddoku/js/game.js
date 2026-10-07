/* ---------------------------------------------------------------
   Birddoku - game flow
---------------------------------------------------------------- */

(function () {

  const LEVEL_COUNT = 60;
  const HEARTS = 3;
  const HINTS = 2;
  const AD_EVERY = 3;                 // midgame ad after every N cleared levels
  const MAX_SIZE = 9;                 // 10x10 and up takes too long to generate

  const $ = s => document.querySelector(s);
  const el = {
    board: $('#board'),
    name: $('#level-name'),
    sub: $('#level-sub'),
    hearts: $('#hearts'),
    count: $('#count'),
    countBird: $('#count-bird'),
    hintLeft: $('#hint-left'),
    loading: $('#loading'),
    home: $('#screen-home'),
    levels: $('#screen-levels'),
    grid: $('#level-grid'),
    modal: $('#modal'),
    sheet: $('#sheet')
  };

  let save = Store.load();
  let S = null;                        // current level state
  let clears = 0;                      // levels cleared this session (ad pacing)
  let drag = false;

  /* ---------- level shape ---------- */

  /* the board grows by one every level until it tops out at 9x9 */
  function boardSize(level) {
    return Math.min(4 + level, MAX_SIZE);
  }

  /* ---------- screens ---------- */

  function show(screen) {
    el.home.hidden = screen !== 'home';
    el.levels.hidden = screen !== 'levels';
    if (screen !== 'game') CG.gameplayStop();
  }

  function openSheet(html, wire) {
    el.sheet.innerHTML = html;
    el.modal.hidden = false;
    wire && wire(el.sheet);
  }
  function closeSheet() { el.modal.hidden = true; el.sheet.innerHTML = ''; }

  /* ---------- starting a level ---------- */

  function startLevel(level) {
    closeSheet();
    show('game');
    el.loading.hidden = false;
    el.board.classList.add('locked');

    // let the loading line paint before the generator blocks the thread
    setTimeout(() => {
      const n = boardSize(level);
      const rng = mulberry32((1103515245 * level + 12345) >>> 0);
      const puz = Puzzle.generate(n, rng);

      S = {
        level, n,
        sol: puz.sol,
        reg: puz.regions,
        cells: new Array(n * n).fill(0),   // 0 empty, 1 marked, 2 bird
        hearts: HEARTS,
        hints: HINTS,
        history: [],
        palette: shuffleIdx(9, rng).slice(0, n),
        birds: shuffleIdx(BIRDS.length, rng),
        start: performance.now(),
        done: false,
        busy: false
      };

      renderBoard();
      updateHUD();
      el.loading.hidden = true;
      el.board.classList.remove('locked');
      CG.gameplayStart();
      Sound.startMusicIfWanted();
    }, 30);
  }

  function shuffleIdx(len, rng) {
    const a = [...Array(len).keys()];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function birdIdFor(region) {
    return BIRDS[S.birds[region % S.birds.length] % BIRDS.length].id;
  }

  /* ---------- drawing ---------- */

  function renderBoard() {
    const n = S.n;
    el.board.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    el.board.innerHTML = '';

    for (let i = 0; i < n * n; i++) {
      const r = (i / n) | 0, c = i % n, g = S.reg[i];
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.i = i;
      cell.setAttribute('aria-label', `row ${r + 1} column ${c + 1}`);
      cell.style.background = `var(--r${S.palette[g]})`;

      cell.innerHTML =
        '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M5.5 5.5 L18.5 18.5 M18.5 5.5 L5.5 18.5" stroke="#24382F" stroke-width="3" ' +
        'stroke-linecap="round" fill="none"/></svg>';

      const img = document.createElement('img');
      img.alt = '';
      img.src = birdSrc(birdIdFor(g), restFace(g));
      img.onerror = () => { img.onerror = null; img.src = BIRD_FALLBACK; };
      cell.appendChild(img);

      el.board.appendChild(cell);
    }
    el.countBird.src = birdSrc(birdIdFor(0), restFace(0));
  }

  function paint(i) {
    const cell = el.board.children[i];
    if (!cell) return;
    const v = S.cells[i];
    cell.classList.toggle('marked', v === 1);
    cell.classList.toggle('bird', v === 2);
    if (v !== 2) cell.classList.remove('settled', 'hinted');
  }

  function face(i, expr) {
    const img = el.board.children[i].querySelector('img');
    img.src = birdSrc(birdIdFor(S.reg[i]), expr);
  }

  function updateHUD() {
    el.name.textContent = 'Level ' + S.level;
    el.sub.textContent = `${S.n} x ${S.n} \u00b7 ${S.n} birds`;

    el.hearts.innerHTML = '';
    for (let h = 0; h < HEARTS; h++) {
      const s = document.createElement('span');
      s.className = 'heart' + (h < S.hearts ? '' : ' gone');
      s.textContent = '\u2665';
      el.hearts.appendChild(s);
    }

    const placed = S.cells.filter(v => v === 2).length;
    el.count.textContent = `${placed}/${S.n}`;
    el.hintLeft.textContent = S.hints;
    $('#btn-undo').disabled = !S.history.length;
  }

  /* ---------- moves ---------- */

  function snapshot() {
    S.history.push(S.cells.slice());
    if (S.history.length > 120) S.history.shift();
  }

  function setCell(i, v) {
    S.cells[i] = v;
    paint(i);
  }

  function mark(i) {
    snapshot();
    setCell(i, 1);
    Sound.mark();
    updateHUD();
  }

  function clear(i) {
    snapshot();
    setCell(i, 0);
    Sound.unmark();
    updateHUD();
  }

  function placeBird(i) {
    const clash = Puzzle.conflicts(S.n, S.reg, S.cells, i);

    if (clash.length) {
      S.busy = true;
      setCell(i, 2);
      face(i, 'surprised');
      const cell = el.board.children[i];
      cell.classList.add('clash');
      clash.forEach(j => {
        el.board.children[j].classList.add('clash');
        face(j, 'angry');
      });

      S.hearts--;
      const hearts = el.hearts.children;
      if (hearts[S.hearts]) hearts[S.hearts].classList.add('losing');
      Sound.error();

      setTimeout(() => {
        cell.classList.remove('clash');
        clash.forEach(j => {
          el.board.children[j].classList.remove('clash');
          face(j, restFace(S.reg[j]));
        });
        setCell(i, 1);
        face(i, restFace(S.reg[i]));
        updateHUD();
        S.busy = false;
        if (S.hearts <= 0) outOfHearts();
      }, 620);
      return;
    }

    snapshot();
    setCell(i, 2);
    Sound.place();
    if (save.settings.autoMark) autoMark(i);
    updateHUD();
    checkWin();
  }

  /* cross out everything the new bird rules out */
  function autoMark(i) {
    const n = S.n, r = (i / n) | 0, c = i % n, g = S.reg[i];
    const hit = new Set(Puzzle.neighbours(n, i));
    for (let k = 0; k < n; k++) { hit.add(r * n + k); hit.add(k * n + c); }
    for (let j = 0; j < n * n; j++) if (S.reg[j] === g) hit.add(j);
    hit.forEach(j => { if (S.cells[j] === 0) setCell(j, 1); });
  }

  function checkWin() {
    const placed = [];
    for (let i = 0; i < S.n * S.n; i++) if (S.cells[i] === 2) placed.push(i);
    if (placed.length !== S.n) return;
    for (const i of placed) if (Puzzle.conflicts(S.n, S.reg, S.cells, i).length) return;

    S.done = true;
    el.board.classList.add('locked');
    CG.gameplayStop();
    Sound.win();
    CG.happytime();

    placed.forEach((i, k) => setTimeout(() => {
      face(i, 'happy');
      el.board.children[i].classList.add('settled');
    }, k * 90));

    const secs = Math.max(1, Math.round((performance.now() - S.start) / 1000));
    const best = save.best[S.level];
    if (!best || secs < best) save.best[S.level] = secs;
    if (save.unlocked < S.level + 1) save.unlocked = S.level + 1;
    Store.save(save);
    clears++;

    setTimeout(() => winSheet(secs), 700 + placed.length * 90);
  }

  function fmt(s) {
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function winSheet(secs) {
    const best = save.best[S.level];
    const id = birdIdFor(S.reg[S.sol[0]]);
    openSheet(`
      <img class="sheet-bird" src="${birdSrc(id, 'happy')}" alt="">
      <h3>Every bird found</h3>
      <p>Level ${S.level} in ${fmt(secs)}${best && best < secs ? ` \u00b7 best ${fmt(best)}` : ''}</p>
      <button class="btn btn-main" data-go="next">Next level</button>
      <button class="btn" data-go="levels">Levels</button>
    `, sheet => {
      sheet.querySelector('[data-go="next"]').onclick = () => {
        const next = S.level + 1;
        if (clears % AD_EVERY === 0) CG.midgameAd(() => startLevel(next));
        else startLevel(next);
      };
      sheet.querySelector('[data-go="levels"]').onclick = () => { closeSheet(); openLevels(); };
    });
  }

  function outOfHearts() {
    S.done = true;
    el.board.classList.add('locked');
    CG.gameplayStop();
    const extra = CG.ready
      ? '<button class="btn" data-go="ad">Watch an ad for one heart</button>' : '';
    openSheet(`
      <img class="sheet-bird" src="${birdSrc(birdIdFor(0), 'sad')}" alt="">
      <h3>The flock flew off</h3>
      <p>Three wrong guesses. Your marks are still on the board if you carry on.</p>
      <button class="btn btn-main" data-go="retry">Start this level again</button>
      ${extra}
      <button class="btn" data-go="levels">Levels</button>
    `, sheet => {
      sheet.querySelector('[data-go="retry"]').onclick = () => startLevel(S.level);
      sheet.querySelector('[data-go="levels"]').onclick = () => { closeSheet(); openLevels(); };
      const ad = sheet.querySelector('[data-go="ad"]');
      if (ad) ad.onclick = () => CG.rewardedAd(() => {
        S.hearts = 1; S.done = false;
        el.board.classList.remove('locked');
        closeSheet(); updateHUD(); CG.gameplayStart();
      }, () => { ad.textContent = 'No ad available right now'; ad.disabled = true; });
    });
  }

  /* ---------- hint ---------- */

  function useHint() {
    if (!S || S.done || S.busy) return;
    if (S.hints <= 0) {
      if (!CG.ready) return;
      openSheet(`
        <h3>Out of hints</h3>
        <p>Watch a short ad and one more bird will show itself.</p>
        <button class="btn btn-main" data-go="ad">Watch ad</button>
        <button class="btn" data-go="no">Keep thinking</button>
      `, sheet => {
        sheet.querySelector('[data-go="no"]').onclick = closeSheet;
        sheet.querySelector('[data-go="ad"]').onclick = () => CG.rewardedAd(
          () => { S.hints++; closeSheet(); updateHUD(); useHint(); },
          () => closeSheet());
      });
      return;
    }

    const missing = [];
    for (let r = 0; r < S.n; r++) {
      const i = r * S.n + S.sol[r];
      if (S.cells[i] !== 2) missing.push(i);
    }
    if (!missing.length) return;

    const target = missing[(Math.random() * missing.length) | 0];
    snapshot();
    // clear anything wrongly placed that would fight the revealed bird
    Puzzle.conflicts(S.n, S.reg, S.cells, target).forEach(j => setCell(j, 1));
    setCell(target, 2);
    el.board.children[target].classList.add('hinted');
    if (save.settings.autoMark) autoMark(target);
    S.hints--;
    Sound.hint();
    updateHUD();
    checkWin();
  }

  /* ---------- input ---------- */

  function cellFrom(target) {
    const c = target && target.closest ? target.closest('.cell') : null;
    return c ? +c.dataset.i : -1;
  }

  el.board.addEventListener('pointerdown', e => {
    if (!S || S.done || S.busy) return;
    const i = cellFrom(e.target);
    if (i < 0) return;
    e.preventDefault();
    Sound.unlock();

    const v = S.cells[i];
    if (v === 0) { mark(i); drag = true; }
    else if (v === 1) placeBird(i);
    else clear(i);
  });

  window.addEventListener('pointermove', e => {
    if (!drag || !S || S.done || S.busy) return;
    const t = document.elementFromPoint(e.clientX, e.clientY);
    const i = cellFrom(t);
    if (i >= 0 && S.cells[i] === 0) { setCell(i, 1); Sound.mark(); updateHUD(); }
  });

  window.addEventListener('pointerup', () => { drag = false; });
  window.addEventListener('pointercancel', () => { drag = false; });

  $('#btn-undo').onclick = () => {
    if (!S || S.done || S.busy || !S.history.length) return;
    S.cells = S.history.pop();
    for (let i = 0; i < S.cells.length; i++) paint(i);
    updateHUD();
  };
  $('#btn-hint').onclick = useHint;
  $('#btn-restart').onclick = () => S && startLevel(S.level);
  $('#btn-home').onclick = () => { CG.gameplayStop(); closeSheet(); show('home'); };

  /* ---------- level select ---------- */

  function openLevels() {
    const top = Math.max(LEVEL_COUNT, save.unlocked);
    el.grid.innerHTML = '';
    for (let lv = 1; lv <= top; lv++) {
      const b = document.createElement('button');
      const locked = lv > save.unlocked;
      b.className = 'lv' + (save.best[lv] ? ' done' : '') +
                    (locked ? ' locked' : '') + (lv === save.unlocked ? ' current' : '');
      b.innerHTML = `${lv}<span class="size">${boardSize(lv)}\u00d7${boardSize(lv)}</span>`;
      b.disabled = locked;
      b.onclick = () => startLevel(lv);
      el.grid.appendChild(b);
    }
    show('levels');
  }

  $('#btn-levels').onclick = openLevels;
  $('#btn-levels-back').onclick = () => show('home');
  $('#btn-play').onclick = () => { Sound.unlock(); startLevel(save.unlocked); };

  /* ---------- settings toggles ---------- */

  function paintToggles() {
    $('#tg-music').classList.toggle('on', save.settings.music);
    $('#tg-sfx').classList.toggle('on', save.settings.sfx);
    $('#tg-auto').classList.toggle('on', save.settings.autoMark);
  }

  function toggle(key) {
    save.settings[key] = !save.settings[key];
    Store.save(save);
    paintToggles();
    Sound.applySettings(save.settings);
  }

  $('#tg-music').onclick = () => toggle('music');
  $('#tg-sfx').onclick = () => toggle('sfx');
  $('#tg-auto').onclick = () => toggle('autoMark');

  /* ---------- boot ---------- */

  CG.loadingStart();
  preloadBirds();
  paintToggles();
  show('home');

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) CG.gameplayStop();
  });

  window.addEventListener('pointerdown', function once() {
    Sound.applySettings(save.settings);
    window.removeEventListener('pointerdown', once);
  }, { once: true });

  CG.init().then(() => CG.loadingStop());

})();
