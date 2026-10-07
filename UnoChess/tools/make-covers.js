// Renders a cover at any size, using the game's own CSS, pieces and cards.
//   node tools/make-covers.js <outDir> <w>x<h> [<w>x<h> ...]
// Layout is chosen from the aspect ratio and scales proportionally, so 512x384 and
// 1920x1080 come out looking the same.
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const GAME = 'file:///D:/UnoChess/index%20(1).html';

const POS = ['r.b.k..r', 'pp...ppp', '..n..n..', '...pp.B.', '...P....', '..N..Q..', 'PPP..PPP', 'R...K..R'];

function scene({ POS, w, h }) {
  const css = `
  #cover{position:fixed;inset:0;z-index:999;overflow:hidden;font-family:var(--font);
    background:
      radial-gradient(ellipse at 62% 48%, rgba(242,180,42,.28), transparent 45%),
      radial-gradient(ellipse at 50% 40%, #16597c, #0F4561 45%, #082a3e 100%);}
  #cover::before{content:"";position:absolute;inset:0;
    background:repeating-linear-gradient(45deg,transparent 0 2.2%,rgba(255,244,220,.035) 2.2% 4.4%)}
  .cv-board{position:absolute;padding:1.6%;background:var(--rim);border-radius:2%;
    box-shadow:0 1.6% 0 var(--rimShadow),0 4% 8% rgba(0,0,0,.45)}
  .cv-grid{display:grid;grid-template-columns:repeat(8,1fr);width:100%;aspect-ratio:1;border-radius:4px;
    overflow:hidden;position:relative;container-type:inline-size}
  .cv-grid .sq{position:relative}
  .cv-p{position:absolute;inset:0;background-size:92%;background-position:center 60%;background-repeat:no-repeat;z-index:2}
  .cv-card{position:absolute;transform-origin:50% 50%}
  .cv-card .card{box-shadow:0 10% 0 rgba(0,0,0,.25),0 20% 34% rgba(0,0,0,.4);border-width:calc(var(--cw)*.06)}
  .cv-glow .card{box-shadow:0 0 0 calc(var(--cw)*.06) var(--yellow),0 0 40% 7% rgba(242,180,42,.55),0 20% 34% rgba(0,0,0,.4)}
  .cv-logo{position:absolute;font-weight:800;line-height:.86;letter-spacing:-.02em;color:var(--cream);
    text-shadow:0 .06em 0 #06263a,0 .12em .25em rgba(0,0,0,.45)}
  .cv-logo span{display:block}
  .cv-logo .w{color:var(--yellow)}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  document.querySelectorAll('.ov').forEach(o => o.classList.remove('show'));
  const root = document.createElement('div'); root.id = 'cover'; document.body.appendChild(root);

  const board = (x, y, size, rot) => {
    const b = document.createElement('div'); b.className = 'cv-board';
    Object.assign(b.style, { left: x + 'px', top: y + 'px', width: size + 'px', transform: `rotate(${rot}deg)` });
    const g = document.createElement('div'); g.className = 'cv-grid'; b.appendChild(g);
    const tgt = [19, 21, 13, 37, 38], cap = [28], sel = 45;
    for (let i = 0; i < 64; i++) {
      const s = document.createElement('div');
      s.className = 'sq ' + ((((i >> 3) + (i & 7)) & 1) ? 'd' : 'l');
      if (i === 52 || i === 36) s.classList.add('last');
      if (i === sel) s.classList.add('from');
      if (tgt.includes(i)) s.classList.add('tgt');
      if (cap.includes(i)) s.classList.add('cap');
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
  const cardEl = (c) => {                       // same markup as the game's cardEl()
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
  const r = w / h;

  if (r >= 1.45) {                               // wide: logo left, board right
    board(.49 * w, .139 * h, .731 * h, 4);
    logo(.068 * w, .176 * h, .231 * h);
    card(R, .078 * w, .639 * h, .139 * h, -16);
    card(B, .172 * w, .602 * h, .139 * h, -4);
    card(W, .266 * w, .611 * h, .139 * h, 9);
    card(G, .406 * w, .731 * h, .111 * h, -22);
    card(Y, .823 * w, .065 * h, .176 * h, 14, true);
  } else if (r >= 0.85) {                        // squarish: logo top left, board centre
    board(.344 * w, .319 * h, .6125 * w, 4);
    logo(.055 * w, .055 * h, .145 * h);
    card(W, .05 * w, .675 * h, .144 * h, -14);
    card(R, .2 * w, .719 * h, .144 * h, 2);
    card(Y, .7875 * w, .0625 * h, .144 * h, 14, true);
  } else {                                       // tall: logo on top, board in the middle
    logo(0, .05 * h, .125 * h, true);
    board(.0875 * w, .333 * h, .825 * w, -3);
    card(R, .05 * w, .8 * h, .108 * h, -18);
    card(W, .219 * w, .825 * h, .108 * h, -4);
    card(B, .75 * w, .825 * h, .108 * h, 12);
    card(Y, .7375 * w, .258 * h, .125 * h, 14, true);
  }
}

(async () => {
  const [outDir, ...sizes] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const s of sizes) {
    const [w, h] = s.split('x').map(Number);
    // render small covers at 2x and scale down, so the text stays crisp
    const scale = Math.min(w, h) < 700 ? 2 : 1;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
    await page.goto(GAME, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(scene, { POS, w, h });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);
    const big = path.join(outDir, `cover-${w}x${h}.png`);
    await page.screenshot({ path: big });
    await page.close();
    if (scale > 1) {
      require('child_process').execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', big,
        '-vf', `scale=${w}:${h}:flags=lanczos`, big + '.tmp.png']);
      fs.renameSync(big + '.tmp.png', big);
    }
    console.log(big);
  }
  await browser.close();
})();
