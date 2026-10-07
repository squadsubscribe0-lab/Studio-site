/* Renders every cover / thumbnail from the live game canvas.
   node keyart.js [only-name ...] */
"use strict";
const {execFileSync} = require("child_process");
const {launch, openGame, advance, ensure, OUT, path} = require("./harness");
const {applyScene} = require("./scene");

const LEVEL = 6;          // Heart — reads instantly at any size
const MASTER = ensure(path.join(__dirname, "masters"));

/* Logical sizes keep the short side >= 1080 so the game's dpr cap of 2 still
   supersamples; everything is downscaled to the exact final size. */
const ASSETS = [
  // CrazyGames covers (game title allowed, no other text)
  {name:"cg-landscape", out:"crazygames/cover-landscape-1920x1080.jpg", W:1920, H:1080, lw:1920, lh:1080, layout:"land"},
  {name:"cg-portrait",  out:"crazygames/cover-portrait-800x1200.jpg",  W:800,  H:1200, lw:1080, lh:1620, layout:"portrait"},
  {name:"cg-square",    out:"crazygames/cover-square-800x800.jpg",     W:800,  H:800,  lw:1080, lh:1080, layout:"square"},
  // Playgama (square + landscape reuse the CrazyGames covers)
  {name:"pg-portrait",  out:"playgama/cover-portrait-1080x1920.jpg",   W:1080, H:1920, lw:1080, lh:1920, layout:"tall"},
  // GameDistribution: title only on the 1280 sizes, per their design guidelines
  {name:"gd-1280x720",  out:"gamedistribution/1280x720.jpg",           W:1280, H:720,  lw:1920, lh:1080, layout:"land"},
  {name:"gd-1280x550",  out:"gamedistribution/1280x550.jpg",           W:1280, H:550,  lw:2513, lh:1080, layout:"wide"},
  {name:"gd-512x384",   out:"gamedistribution/512x384.jpg",            W:512,  H:384,  lw:1440, lh:1080, layout:"bare", zoom:1.25},
  {name:"gd-512x512",   out:"gamedistribution/512x512.jpg",            W:512,  H:512,  lw:1080, lh:1080, layout:"bare", zoom:1.2},
  {name:"gd-200x120",   out:"gamedistribution/200x120.jpg",            W:200,  H:120,  lw:1800, lh:1080, layout:"bare", zoom:2.1}
];

async function render(browser, a){
  const page = await openGame(browser, {w:a.lw, h:a.lh, dsf:2});
  const L = await applyScene(page, {layout:a.layout, lw:a.lw, lh:a.lh, level:LEVEL, zoom:a.zoom});
  await advance(page, 16);

  /* Freeze a moment mid-play: some arrows well on their way out, some just
     launched, so the mechanic reads in one still. */
  for (const [k, frames] of [[4, 12], [3, 5], [2, 2]]) {
    await page.evaluate((k, away) => {
      const f = away ? p => !(p.dir[0] === away[0] && p.dir[1] === away[1]) : null;
      window.__MK.spread(k, f).forEach(p => window.__MK.release(p));
    }, k, L.away);
    for (let i = 0; i < frames; i++) await advance(page, 1000/60);
  }

  const png = path.join(MASTER, a.name + ".png");
  await page.screenshot({path: png});
  await page.close();

  const out = path.join(OUT, a.out);
  ensure(path.dirname(out));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", png,
    "-vf", `scale=${a.W}:${a.H}:flags=lanczos`, "-q:v", "2", out]);
  console.log("  " + a.out);
}

if (require.main === module) (async () => {
  const only = process.argv.slice(2);
  const browser = await launch();
  for (const a of ASSETS) if (!only.length || only.includes(a.name)) await render(browser, a);
  await browser.close();
})();
