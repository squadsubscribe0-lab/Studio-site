// Three alternative square covers to test against the current one.
//   node tools/make-cover-variants.js <outDir> [size]
// a = cards in front, board behind   b = close-up of a capture   c = current layout, bigger cards
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const GAME = 'file:///D:/UnoChess/index%20(1).html';
const POS = ['r.b.k..r', 'pp...ppp', '..n..n..', '...pp.B.', '...P....', '..N..Q..', 'PPP..PPP', 'R...K..R'];

function scene({ POS, w, h, variant }) {
  const css = `
  #cover{position:fixed;inset:0;z-index:999;overflow:hidden;font-family:var(--font);
    background:
      radial-gradient(ellipse at 60% 45%, rgba(242,180,42,.30), transparent 48%),
      radial-gradient(ellipse at 50% 40%, #16597c, #0F4561 45%, #072536 100%);}
  #cover::before{content:"";position:absolute;inset:0;
    background:repeating-linear-gradient(45deg,transparent 0 2.2%,rgba(255,244,220,.035) 2.2% 4.4%)}
  .cv-board{position:absolute;padding:1.6%;background:var(--rim);border-radius:2%;
    box-shadow:0 1.6% 0 var(--rimShadow),0 4% 8% rgba(0,0,0,.45)}
  .cv-grid{display:grid;grid-template-columns:repeat(8,1fr);width:100%;aspect-ratio:1;border-radius:4px;
    overflow:hidden;position:relative;container-type:inline-size}
  .cv-grid .sq{position:relative}
  .cv-p{position:absolute;inset:0;background-size:92%;background-position:center 60%;background-repeat:no-repeat;z-index:2}
  .cv-dim::after{content:"";position:absolute;inset:0;background:rgba(7,37,54,.42);z-index:3;border-radius:2%}
  .cv-card{position:absolute;transform-origin:50% 50%}
  .cv-card .card{box-shadow:0 10% 0 rgba(0,0,0,.25),0 22% 36% rgba(0,0,0,.45);border-width:calc(var(--cw)*.06)}
  .cv-glow .card{box-shadow:0 0 0 calc(var(--cw)*.06) var(--yellow),0 0 44% 8% rgba(242,180,42,.6),0 22% 36% rgba(0,0,0,.45)}
  .cv-logo{position:absolute;font-weight:800;line-height:.86;letter-spacing:-.02em;color:var(--cream);z-index:6;
    text-shadow:0 .06em 0 #06263a,0 .12em .25em rgba(0,0,0,.5)}
  .cv-logo span{display:block}
  .cv-logo .w{color:var(--yellow)}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  document.querySelectorAll('.ov').forEach(o => o.classList.remove('show'));
  const root = document.createElement('div'); root.id = 'cover'; document.body.appendChild(root);

  const board = (x, y, size, rot, opts = {}) => {
    const b = document.createElement('div'); b.className = 'cv-board' + (opts.dim ? ' cv-dim' : '');
    Object.assign(b.style, { left: x + 'px', top: y + 'px', width: size + 'px', transform: `rotate(${rot}deg)` });
    const g = document.createElement('div'); g.className = 'cv-grid'; b.appendChild(g);
    const tgt = opts.plain ? [] : [19, 21, 13, 37, 38], cap = opts.plain ? [] : [28], sel = opts.plain ? -1 : 45;
    for (let i = 0; i < 64; i++) {
      const s = document.createElement('div');
      s.className = 'sq ' + ((((i >> 3) + (i & 7)) & 1) ? 'd' : 'l');
      if (!opts.plain && (i === 52 || i === 36)) s.classList.add('last');
      if (i === sel) s.classList.add('from');
      if (tgt.includes(i)) s.classList.add('tgt');
      if (cap.includes(i) || (opts.cap || []).includes(i)) s.classList.add('cap');
      if ((opts.hot || []).includes(i)) s.classList.add('last');
      const ch = POS[i >> 3][i & 7];
      if (ch !== '.') {
        const p = document.createElement('div');
        p.className = 'cv-p pi-' + (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase();
        s.appendChild(p);
      }
      g.appendChild(s);
    }
    root.appendChild(b);
  };
  const cardEl = (c) => {
    const e = document.createElement('div');
    e.className = 'card c-' + (c.kind === 'wild' ? 'w' : c.color);
    const t = c.kind === 'num' ? c.n : { skip: '⊘', draw2: '+2', rev: '⇄', wild: '★' }[c.kind];
    e.innerHTML = `<span class="n">${t}</span><span class="face act">${t}</span><span class="n b">${t}</span>`;
    return e;
  };
  const card = (c, x, y, cw, rot, glow) => {
    const d = document.createElement('div'); d.className = 'cv-card' + (glow ? ' cv-glow' : '');
    d.style.cssText += `left:${x}px;top:${y}px;--cw:${cw}px;transform:rotate(${rot}deg);z-index:${glow ? 5 : 4}`;
    d.appendChild(cardEl(c)); root.appendChild(d);
  };
  const logo = (x, y, fs, center) => {
    const l = document.createElement('div'); l.className = 'cv-logo';
    l.style.cssText += `left:${x}px;top:${y}px;font-size:${fs}px`;
    if (center) { l.style.left = '0'; l.style.right = '0'; l.style.textAlign = 'center'; }
    l.innerHTML = '<span class="w">Wild</span><span>Gambit</span>';
    root.appendChild(l);
  };

  const Y = { color: 'y', kind: 'num', n: 3 }, R = { color: 'r', kind: 'rev' }, B = { color: 'b', kind: 'num', n: 2 },
    W = { kind: 'wild' }, G = { color: 'g', kind: 'draw2' };

  if (variant === 'a') {                    // cards in front, board behind and dimmed
    board(.20 * w, .10 * h, .78 * w, 6, { dim: true, plain: true });
    logo(0, .05 * h, .142 * h, true);
    card(G, .06 * w, .52 * h, .23 * h, -20);
    card(B, .27 * w, .49 * h, .23 * h, -8);
    card(R, .49 * w, .50 * h, .23 * h, 6);
    card(Y, .60 * w, .215 * h, .26 * h, 12, true);
    card(W, .70 * w, .56 * h, .23 * h, 18);
  } else if (variant === 'b') {             // close-up: the queen taking a pawn, one big card
    board(-.62 * w, -.30 * h, 1.95 * w, 3, { plain: true, cap: [28], hot: [45, 36] });
    logo(.05 * w, .04 * h, .135 * h);
    card(Y, .54 * w, .40 * h, .34 * h, 10, true);
    card(R, .06 * w, .70 * h, .2 * h, -14);
    card(W, .24 * w, .755 * h, .2 * h, 4);
  } else {                                  // current layout, bigger cards and a smaller logo
    board(.30 * w, .30 * h, .66 * w, 4);
    logo(.05 * w, .05 * h, .125 * h);
    card(Y, .70 * w, .035 * h, .2 * h, 13, true);
    card(W, .02 * w, .56 * h, .19 * h, -16);
    card(R, .19 * w, .615 * h, .19 * h, 0);
    card(B, .38 * w, .73 * h, .19 * h, 14);
  }
}

(async () => {
  const outDir = process.argv[2], size = +process.argv[3] || 800;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const variant of ['a', 'b', 'c']) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.goto(GAME, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(scene, { POS, w: size, h: size, variant });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);
    const file = path.join(outDir, `cover-square-${variant}-${size}x${size}.png`);
    await page.screenshot({ path: file });
    console.log(file);
    await page.close();
  }
  await browser.close();
})();
