// node record-video.js land|port [--dry]
// Plays a real level of the standalone build with an autoplay bot on a virtual 60fps clock,
// captures every frame, then prepends the static cover (CrazyGames: "use your static cover as the opening frame").
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.join(__dirname, '..');
const WORK = path.join(__dirname, 'work');
const OUT = path.join(__dirname, 'crazygames');
const MODES = {
  land:{ vw:960, vh:540, zoom:480, cover:path.join(OUT, 'cover-landscape-1920x1080.png'), out:'video-landscape-1920x1080.mp4' },
  port:{ vw:540, vh:810, cover:path.join(WORK, 'cover-portrait-1080x1620.png'), out:'video-portrait-1080x1620.mp4' }
};
const mode = process.argv[2] || 'land', DRY = process.argv.includes('--dry'), COMPOSE_ONLY = process.argv.includes('--compose');
const M = MODES[mode];
const FPS = 60, COVER_HOLD = 0.5, XFADE = 0.45, MAX_TOTAL = 19.6;
const MAX_GAME = MAX_TOTAL - COVER_HOLD;
const LEVEL = +(process.env.LEVEL || 10);

/* 1. patched copy of the standalone build that exposes game internals to the bot */
let html = fs.readFileSync(path.join(ROOT, 'builds/standalone/index.html'), 'utf8');
if(!html.includes('\nboot();\n')) throw new Error('patch anchor not found');
html = html.replace('\nboot();\n', "\nwindow.__dbg = { get G(){ return G; }, bandFor, throwAt, sy, setArmed };\nboot();\n");
fs.mkdirSync(WORK, { recursive:true });
const GAME = path.join(WORK, 'game.html');
fs.writeFileSync(GAME, html);

/* 2. virtual clock: rAF, timers, performance.now and CSS animations all advance only when we step */
const SHIM = `(() => {
  let now = 0; const d0 = Date.now();
  performance.now = () => now; Date.now = () => d0 + now;
  let rafQ = [], rid = 0;
  window.requestAnimationFrame = cb => { rafQ.push({ id:++rid, cb }); return rid; };
  window.cancelAnimationFrame = id => { rafQ = rafQ.filter(r => r.id !== id); };
  const timers = new Map(); let tid = 0;
  window.setTimeout = (fn, ms = 0, ...a) => { timers.set(++tid, { t:now + Math.max(0, +ms || 0), fn, a }); return tid; };
  window.setInterval = (fn, ms = 0, ...a) => { timers.set(++tid, { t:now + Math.max(1, +ms || 0), fn, a, iv:Math.max(1, +ms || 0) }); return tid; };
  window.clearTimeout = window.clearInterval = id => timers.delete(id);
  const started = new WeakMap();
  window.__step = ms => {
    now += ms;
    for(let guard = 0; guard < 50; guard++){
      const due = [...timers].filter(([, t]) => t.t <= now).sort((a, b) => a[1].t - b[1].t);
      if(!due.length) break;
      for(const [id, t] of due){ if(t.iv) t.t += t.iv; else timers.delete(id); try{ t.fn(...t.a); }catch(e){ console.error(e); } }
    }
    const q = rafQ; rafQ = []; for(const r of q){ try{ r.cb(now); }catch(e){ console.error(e); } }
    for(const an of document.getAnimations()){ if(!started.has(an)){ started.set(an, now); an.pause(); } an.currentTime = now - started.get(an); }
    return now;
  };
  localStorage.setItem('jungle-ladder-v3', JSON.stringify({ level:${LEVEL}, bananas:1860, muted:true, stick:6, seenSticks:7, up:{ jump:6, perfect:4, axe:5, coins:3 } }));
})();`;

/* 3. the bot: aims for the perfect zone, grabs banana blocks, axes stones and toucans, opens the chest */
const BOT = `window.__bot = (() => {
  let next = 0.55, chestSeen = null, chestClicked = null, t = 0, ev = {};
  const $ = id => document.getElementById(id);
  return dt => {
    t += dt; const D = window.__dbg, G = D && D.G;
    if(!G || G.mode !== 'solo') return ev;
    if(G.over){
      ev.win = ev.win || (G.result === 'win' ? t : 0);
      if(!$('chestPanel').hidden){
        if(chestSeen == null) chestSeen = t;
        if(chestClicked == null && t - chestSeen > 0.7){ $('chestBtn').click(); chestClicked = t; ev.chest = t; }
      }
      if(!$('end').hidden && !ev.end) ev.end = t;
      return ev;
    }
    next -= dt; if(next > 0) return ev;
    const pl = G.player, r = G.rival;
    if(pl.state === 'fall' || pl.state === 'stun'){ next = 0.08; return ev; }
    // keep the race neck and neck for the first half so both monkeys stay on screen, then sprint to the top
    if(pl.y < 700 && pl.y - r.y > 130){ next = 0.05; return ev; }
    const b = D.bandFor(pl); if(b.hi <= b.lo + 8){ next = 0.08; return ev; }
    const blk = y => G.blocks[Math.floor(y / 60)];
    const birdAt = y => G.toucans.some(o => !o.dead && o.flee <= 0 && o.x != null && Math.abs(o.y - y) < 30);
    const axeReady = G.cd.axe <= 0;
    const body = pl.state === 'jump' ? Math.max(pl.y, pl.toY) : pl.y;
    const minY = Math.max(b.lo + 6, body + 80);                  // never throw into our own monkey
    const ok = (y, axe) => { const k = blk(y); if(!k || k.type === 'hole') return false; if(k.type === 'stone' && !axe) return false; if(birdAt(y) && !axe) return false; return true; };
    // candidates from the top of the zone down: banana first, then perfect zone, then anything plain, then axe shots
    const cands = [];
    for(let i = Math.floor(b.lo / 60); i <= Math.floor(b.hi / 60); i++){ const k = G.blocks[i]; if(k && k.banana && !k.banana.taken && k.banana.y >= minY && k.banana.y < b.hi) cands.push(k.banana.y); }
    for(let y = b.hi - 12; y >= minY; y -= 8) cands.push(y);
    let y = cands.find(v => ok(v, false)), useAxe = false;
    if(y == null || y < b.hi - 60){ const ya = cands.find(v => ok(v, true) && (blk(v).type === 'stone' || birdAt(v))); if(axeReady && ya != null){ y = ya; useAxe = true; } }
    if(y == null){ next = 0.05; return ev; }
    if(useAxe) D.setArmed(true);
    D.throwAt(D.sy(y));
    next = 0.27 + Math.random() * 0.07;
    return ev;
  };
})();`;

(async () => {
  if(!COMPOSE_ONLY) await record();
  if(!DRY) compose();
})();

async function record(){
  const browser = await puppeteer.launch({ executablePath:CHROME, headless:true, args:['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if(m.type() === 'error') console.error('console:', m.text()); });
  await page.setViewport({ width:M.vw, height:M.vh, deviceScaleFactor:2 });
  await page.evaluateOnNewDocument(SHIM);
  await page.goto('file:///' + GAME.replace(/\\/g, '/'));
  await page.evaluate(BOT);
  // boot (fonts load on real time, so step until the menu is up)
  for(let i = 0; i < 400; i++){
    const ok = await page.evaluate(() => { window.__step(1000 / 60); return !!(window.__dbg && window.__dbg.G) && document.getElementById('boot').hidden; });
    if(ok) break; await new Promise(r => setTimeout(r, 10));
  }
  await page.evaluate(() => document.getElementById('btnQuick').click());
  await page.evaluate(() => { for(let i = 0; i < 3; i++) window.__step(1000 / 60); });

  const cdp = await page.target().createCDPSession();
  const clip = path.join(WORK, mode + '-gameplay.mp4');
  let ff = null;
  if(!DRY){
    ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', clip], { stdio:['pipe', 'inherit', 'inherit'] });
  }
  const dt = 1 / FPS; let ev = {}, f = 0, stopAt = null;
  for(; f < MAX_GAME * FPS; f++){
    ev = await page.evaluate(d => { window.__step(d * 1000); return window.__bot(d); }, dt);
    if(!DRY){
      const { data } = await cdp.send('Page.captureScreenshot', { format:'png', optimizeForSpeed:true, clip:{ x:0, y:0, width:M.vw, height:M.vh, scale:2 } });
      if(!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    if(stopAt == null && ev.chest) stopAt = f + Math.round(2.2 * FPS);
    if(stopAt == null && ev.end) stopAt = f + Math.round(1.6 * FPS);
    if(stopAt != null && f >= stopAt) break;
    if(f % 120 === 0) process.stdout.write(`t=${(f / FPS).toFixed(1)}s ` + (DRY ? await page.evaluate(() => { const G = __dbg.G; return `p=${G.player.y.toFixed(0)}/${G.player.state} r=${G.rival.y.toFixed(0)} H=${G.towerH} axe=${G.cd.axe.toFixed(1)} armed=${G.armed}
`; }) : ""));
  }
  console.log('\nevents', JSON.stringify(ev), 'gameplay seconds', (f / FPS).toFixed(2));
  await browser.close();
  if(DRY) return;
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}

function compose(){
  const clip = path.join(WORK, mode + '-gameplay.mp4');
  /* 4. cover as the opening frame, crossfade into gameplay, no audio */
  const W = M.vw * 2, H = M.vh * 2;
  const out = path.join(OUT, M.out);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
    '-loop', '1', '-framerate', String(FPS), '-t', String(COVER_HOLD + XFADE), '-i', M.cover, '-i', clip,
    '-filter_complex', `[0]scale=${W}:${H},fps=${FPS},format=yuv420p,setsar=1,settb=AVTB[a];[1]fps=${FPS},format=yuv420p,setsar=1,settb=AVTB[b];[a][b]xfade=transition=fade:duration=${XFADE}:offset=${COVER_HOLD}[v]`,
    '-map', '[v]', '-an', '-t', String(MAX_TOTAL), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio:'inherit' });
  console.log('wrote', out);
}
