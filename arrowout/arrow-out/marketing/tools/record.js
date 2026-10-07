/* Frame-exact recorder. Each frame: advance the page's virtual clock by
   1/fps, capture a JPEG over CDP, pipe it to ffmpeg.

   node record.js gameplay land|portrait     real UI, a human-paced clear of the Heart
   (scenarios for the promo trailer live in trailer.js) */
"use strict";
const {spawn} = require("child_process");
const {launch, openGame, advance, ensure, path, fs} = require("./harness");

const CLIPS = ensure(path.join(__dirname, "clips"));

async function recordFrames(page, {fps = 30, out, maxSeconds, onFrame}){
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps),
    "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", out],
    {stdio: ["pipe", "inherit", "inherit"]});
  const done = new Promise((res, rej) => ff.on("close", c => c ? rej(new Error("ffmpeg " + c)) : res()));
  const cdp = await page.target().createCDPSession();
  const dt = 1000 / fps;
  let f = 0;
  for (; f < maxSeconds * fps; f++) {
    const t = f / fps;
    const keep = await onFrame(t, f);
    if (keep === false) break;
    const {data} = await cdp.send("Page.captureScreenshot", {format: "jpeg", quality: 95, optimizeForSpeed: false});
    if (!ff.stdin.write(Buffer.from(data, "base64"))) await new Promise(r => ff.stdin.once("drain", r));
    await advance(page, dt);
  }
  ff.stdin.end();
  await done;
  return f / fps;
}

/* Deterministic jitter so the tap rhythm feels human, not metronomic. */
function jitter(i){ const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

async function gameplay(orient){
  const [w, h] = orient === "portrait" ? [1080, 1620] : [1920, 1080];
  const browser = await launch();
  const page = await openGame(browser, {w, h, dsf: 1});
  const LEVEL = 6, KEEP = 44;           // clip must fit in 20s incl. the cover

  // start partway into the Heart, matching the cover where arrows are already leaving
  await page.evaluate((level, keep) => {
    const T = window.__TEST__;
    T.goto(level);
    window.__MK.seed(777);
    let n = 0;
    while (window.__MK.still().length > keep) { const p = window.__MK.randomOpen(); if (!p) break; window.__MK.release(p); n++; }
    T.finishAnimations();
    const S = T.raw();
    // pre-clearing bumped the combo; start the clip with a clean readout
    S.taps = n; S.elapsed = 16.4; S.combo = 0; S.bestCombo = 0;
    document.getElementById("combo").classList.remove("show");
    T.redraw();
  }, LEVEL, KEEP);
  await advance(page, 50);

  const stageBox = await page.evaluate(() => { const r = document.getElementById("stage").getBoundingClientRect(); return {x: r.left, y: r.top}; });
  const events = [];
  let nextTap = 0.55, tapIdx = 0, last = {x: w / 2, y: h / 2}, winAt = null;
  const CRASH_AT = 4;

  const dur = await recordFrames(page, {
    out: path.join(CLIPS, `gameplay-${orient}.mp4`), maxSeconds: 19,
    async onFrame(t){
      const left = await page.evaluate(() => window.__MK.still().length);
      if (left === 0 && winAt === null) { winAt = t; events.push({t, type: "lastTap"}); }
      if (winAt !== null) return t < winAt + 2.9;
      if (t >= nextTap) {
        const crash = tapIdx === CRASH_AT;
        const pt = await page.evaluate((crash, lx, ly) => {
          const M = window.__MK;
          let p;
          if (crash) {
            let bd = 1e9;
            for (const q of M.blocked()) { const c = M.centre(q), d = Math.hypot(c.x - lx, c.y - ly); if (d < bd) { bd = d; p = q; } }
          } else p = M.nearestOpen(lx, ly);
          return p ? M.centre(p) : null;
        }, crash, last.x, last.y);
        if (pt) {
          await page.mouse.click(stageBox.x + pt.x, stageBox.y + pt.y);
          events.push({t, type: crash ? "crash" : "tap"});
          last = pt;
        }
        tapIdx++;
        // >= 310ms keeps two nearby taps from registering as a double-tap zoom
        nextTap = t + (crash ? 0.75 : 0.31 + jitter(tapIdx) * 0.07);
      }
      return true;
    }
  });
  fs.writeFileSync(path.join(CLIPS, `gameplay-${orient}.json`), JSON.stringify({dur, events}, null, 1));
  console.log(`gameplay-${orient}: ${dur.toFixed(2)}s, ${events.length} events, win at ${winAt && winAt.toFixed(2)}`);
  await browser.close();
}

module.exports = {recordFrames, jitter, CLIPS};

if (require.main === module) {
  const [mode, arg] = process.argv.slice(2);
  if (mode === "gameplay") gameplay(arg || "land").catch(e => { console.error(e); process.exit(1); });
}
