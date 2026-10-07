/* Shared Chrome harness: opens the real Arrow Out build on a virtual clock,
   so every frame is rendered deterministically regardless of capture speed. */
"use strict";
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const GAME = "file:///D:/arrowout/arrow-out/dist/standalone/index.html";
const OUT = "D:/arrowout/arrow-out/marketing";

const CLOCK = `(() => {
  let now = 0, tid = 1;
  const timers = [];
  let rafs = [];
  const base = Date.now();
  performance.now = () => now;
  Date.now = () => base + now;
  window.setTimeout = (fn, ms, ...a) => { const id = tid++; timers.push({id, t: now + Math.max(0, ms||0), fn, a}); return id; };
  window.setInterval = (fn, ms, ...a) => { const id = tid++; timers.push({id, t: now + Math.max(1, ms||1), fn, a, every: Math.max(1, ms||1)}); return id; };
  window.clearTimeout = window.clearInterval = id => { const i = timers.findIndex(x => x.id === id); if (i >= 0) timers.splice(i, 1); };
  window.requestAnimationFrame = fn => { rafs.push(fn); return rafs.length; };
  window.cancelAnimationFrame = () => {};
  window.__advance = ms => {
    const target = now + ms;
    for (;;) {
      timers.sort((a, b) => a.t - b.t);
      const t = timers[0];
      if (!t || t.t > target) break;
      now = t.t;
      if (t.every) t.t += t.every; else timers.shift();
      try { typeof t.fn === "function" ? t.fn(...t.a) : null; } catch (e) { console.error(e); }
    }
    now = target;
    const run = rafs; rafs = [];
    for (const f of run) { try { f(now); } catch (e) { console.error(e); } }
  };
  window.__now = () => now;
})();`;

/* Page-side helpers for picking and releasing arrows. */
const HELPERS = `(() => {
  const T = () => window.__TEST__;
  const S = () => T().raw();
  const tipOf = p => p.cells[p.cells.length - 1];
  function clear(p){
    const s = S(), t = tipOf(p);
    let x = t.x + p.dir[0], y = t.y + p.dir[1];
    while (x >= 0 && y >= 0 && x < s.w && y < s.h) {
      if (s.occ.has(x + "," + y)) return false;
      x += p.dir[0]; y += p.dir[1];
    }
    return true;
  }
  let seedV = 12345;
  const rnd = () => { seedV = (seedV * 1103515245 + 12345) & 0x7fffffff; return seedV / 0x7fffffff; };
  window.__MK = {
    seed(v){ seedV = v; },
    still(){ return S().pieces.filter(p => !p.leaving); },
    open(){ return this.still().filter(clear); },
    blocked(){ return this.still().filter(p => !clear(p)); },
    tip: tipOf,
    release(p){ if (p && !p.leaving && clear(p)) { T().tapPiece(p); return true; } return false; },
    /* spread picks: sort open arrows by angle around the board centre */
    spread(k, filter){
      const s = S(), cx = s.w / 2, cy = s.h / 2;
      let open = this.open();
      if (filter) open = open.filter(filter);
      open.sort((a, b) => Math.atan2(tipOf(a).y - cy, tipOf(a).x - cx) - Math.atan2(tipOf(b).y - cy, tipOf(b).x - cx));
      const out = [];
      for (let i = 0; i < k && open.length; i++) out.push(open[Math.floor(i * open.length / k)]);
      return out;
    },
    randomOpen(){ const o = this.open(); return o.length ? o[Math.floor(rnd() * o.length)] : null; },
    /* nearest open arrow to a screen point, like a human scanning the board */
    nearestOpen(x, y){
      let best = null, bd = 1e9;
      for (const p of this.open()) {
        const c = T().cellCentre(p), d = Math.hypot(c.x - x, c.y - y);
        if (d < bd) { bd = d; best = p; }
      }
      return best;
    },
    centre(p){ return T().cellCentre(p); }
  };
})();`;

async function launch(){
  return puppeteer.launch({
    executablePath: CHROME, headless: "new",
    args: ["--mute-audio", "--autoplay-policy=no-user-gesture-required", "--allow-file-access-from-files",
           "--hide-scrollbars", "--force-color-profile=srgb"]
  });
}

async function openGame(browser, {w, h, dsf = 1}){
  const page = await browser.newPage();
  page.on("pageerror", e => console.error("pageerror:", e.message));
  page.on("console", m => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.setViewport({width: w, height: h, deviceScaleFactor: dsf});
  await page.evaluateOnNewDocument(CLOCK);
  // fresh settings each run: never inherit localStorage from a previous page
  await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
  await page.goto(GAME, {waitUntil: "networkidle0"});
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(HELPERS);
  for (let i = 0; i < 40; i++) await page.evaluate(() => window.__advance(100));   // fake loader
  await page.evaluate(() => { document.getElementById("playBtn").onclick(); });
  for (let i = 0; i < 10; i++) await page.evaluate(() => window.__advance(60));
  return page;
}

const advance = (page, ms) => page.evaluate(m => window.__advance(m), ms);

function ensure(p){ fs.mkdirSync(p, {recursive: true}); return p; }

module.exports = {launch, openGame, advance, ensure, OUT, path, fs};
