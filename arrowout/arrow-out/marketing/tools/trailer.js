/* Promo trailer (1920x1080, ~26s, with the game's music track).
   node trailer.js            record segments + captions, then assemble
   node trailer.js assemble   assemble only */
"use strict";
const {execFileSync} = require("child_process");
const {launch, openGame, advance, ensure, OUT, path, fs} = require("./harness");
const {applyScene} = require("./scene");
const {recordFrames, CLIPS} = require("./record");

const W = 1920, H = 1080, FPS = 30, XF = 0.35;
const SEG = ensure(path.join(__dirname, "trailer-seg"));
const MUSIC = "D:/arrowout/arrow-out/src/audio/music.mp3";

const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(1 - k, 3);

/* An attract-mode scene: key-art staging, arrows streaming out, optional
   slow zoom and animated logo. */
async function attract(browser, {name, layout, level, seconds, rate, releaseFrom = 0, zoomFrom, zoomTo, logoIn, sub, dimBoard}){
  const page = await openGame(browser, {w: W, h: H, dsf: 1});
  const L = await applyScene(page, {layout, lw: W, lh: H, level});
  await page.evaluate((sub, dim) => {
    if (dim) document.getElementById("stage").style.opacity = dim;
    if (sub) {
      const s = document.createElement("div");
      s.id = "sub"; s.textContent = sub;
      Object.assign(s.style, {position: "fixed", left: "50%", top: "73%", transform: "translateX(-50%)", zIndex: 4,
        font: "600 52px Fredoka, sans-serif", color: "#e8eefc", letterSpacing: ".04em", opacity: 0,
        textShadow: "0 0 18px rgba(141,92,246,.7), 0 2px 8px rgba(0,0,0,.7)"});
      document.body.appendChild(s);
    }
    const lg = document.getElementById("logo");
    if (lg) lg.dataset.base = lg.style.transform;
  }, sub, dimBoard);
  await advance(page, 16);

  let owed = 0;
  await recordFrames(page, {out: path.join(SEG, name + ".mp4"), maxSeconds: seconds, fps: FPS,
    async onFrame(t){
      await page.evaluate((t, o) => {
        const lg = document.getElementById("logo");
        if (lg && o.logoIn) {
          const k = Math.min(1, Math.max(0, (t - o.logoIn[0]) / (o.logoIn[1] - o.logoIn[0])));
          const e = 1 - Math.pow(1 - k, 3);
          lg.style.opacity = e;
          lg.style.transform = lg.dataset.base + ` scale(${0.9 + 0.1 * e})`;
        }
        const sub = document.getElementById("sub");
        if (sub && o.logoIn) sub.style.opacity = Math.min(1, Math.max(0, (t - o.logoIn[1] - 0.2) / 0.5));
        if (o.zoomFrom) {
          const s = document.getElementById("stage");
          const k = t / o.seconds;
          window.__TEST__.zoomAt(o.zoomFrom + (o.zoomTo - o.zoomFrom) * k, s.clientWidth / 2, s.clientHeight / 2);
        }
      }, t, {logoIn, zoomFrom, zoomTo, seconds});
      if (t >= releaseFrom) {
        owed += rate / FPS;
        while (owed >= 1) {
          owed -= 1;
          await page.evaluate(away => {
            const M = window.__MK;
            let o = M.open();
            if (away) o = o.filter(p => !(p.dir[0] === away[0] && p.dir[1] === away[1]));
            if (o.length) M.release(o[Math.floor(Math.random() * o.length)]);
          }, L.away);
        }
      }
      return true;
    }});
  await page.close();
  console.log("  segment " + name);
}

/* Caption pill rendered by Chrome on a transparent frame. */
async function caption(browser, name, html){
  const page = await browser.newPage();
  await page.setViewport({width: W, height: H});
  await page.setContent(`<html><head>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap" rel="stylesheet">
    <style>html,body{margin:0;background:transparent}
    .c{position:fixed;left:50%;top:88%;transform:translate(-50%,-50%);white-space:nowrap;
      font:600 50px Fredoka,sans-serif;color:#e8eefc;padding:.34em 1.05em .4em;border-radius:999px;
      background:rgba(13,17,27,.78);box-shadow:0 0 0 2px rgba(141,92,246,.35),0 10px 30px rgba(0,0,0,.5)}
    b{font-weight:700;background:linear-gradient(100deg,#ff5cd1,#ff7a45 55%,#ffd23f);-webkit-background-clip:text;background-clip:text;color:transparent}
    </style></head><body><div class="c">${html}</div></body></html>`, {waitUntil: "networkidle0"});
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path: path.join(SEG, name + ".png"), omitBackground: true});
  await page.close();
}

async function record(){
  const browser = await launch();
  await attract(browser, {name: "intro", layout: "land", level: 6, seconds: 4.2, rate: 7, releaseFrom: 1.7, logoIn: [0.25, 1.1]});
  await attract(browser, {name: "shape-cat",   layout: "bare", level: 28, seconds: 2.3, rate: 16, zoomFrom: 1.0, zoomTo: 1.14});
  await attract(browser, {name: "shape-plane", layout: "bare", level: 14, seconds: 2.3, rate: 14, zoomFrom: 1.14, zoomTo: 1.0});
  await attract(browser, {name: "shape-lion",  layout: "bare", level: 39, seconds: 2.3, rate: 18, zoomFrom: 1.0, zoomTo: 1.14});
  await attract(browser, {name: "endcard", layout: "center", level: 7, seconds: 4.6, rate: 9, releaseFrom: 0, logoIn: [0.1, 0.8],
                          sub: "PLAY FREE NOW", dimBoard: 0.38});
  await caption(browser, "cap-tap",   "Tap an arrow to <b>slide it out</b>");
  await caption(browser, "cap-crash", "Lane blocked? It <b>crashes</b> and costs a heart");
  await caption(browser, "cap-note",  "Every clear plays the <b>next note</b>");
  await caption(browser, "cap-shape", "Clear the <b>whole shape</b>");
  await caption(browser, "cap-40",    "<b>40 shapes</b> &middot; up to 372 arrows");
  await browser.close();
}

/* Offline version of the game's clear sound: a vibraphone-ish voice walking
   up a C major pentatonic ladder, reset by a crash, which is a soft low thud. */
function writeSfx(file, hits, len){
  const SR = 44100, n = Math.ceil(len * SR), buf = new Float32Array(n);
  const PENTA = [0, 2, 4, 7, 9];
  let step = 0;
  for (const h of hits) {
    const i0 = Math.floor(h.t * SR);
    if (h.type === "crash") {
      step = 0;
      for (let i = 0; i < SR * 0.45 && i0 + i < n; i++) {
        const t = i / SR;
        const f = 55 + 110 * Math.exp(-t * 9);
        buf[i0 + i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * 0.8
                     + (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.18;
      }
      continue;
    }
    const k = step++ % 10;
    const semis = 12 * Math.floor(k / 5) + PENTA[k % 5];
    const f = 523.25 * Math.pow(2, semis / 12);
    for (let i = 0; i < SR * 1.3 && i0 + i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.004) * Math.exp(-t * 4.2) * (1 + 0.12 * Math.sin(2 * Math.PI * 5.5 * t));
      buf[i0 + i] += env * (Math.sin(2 * Math.PI * f * t) * 0.55
                          + Math.sin(2 * Math.PI * 4 * f * t) * 0.12 * Math.exp(-t * 12)
                          + Math.sin(2 * Math.PI * 2 * f * t) * 0.08 * Math.exp(-t * 8));
    }
  }
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const g = peak ? 0.6 / peak : 1;
  const wav = Buffer.alloc(44 + n * 2);
  wav.write("RIFF", 0); wav.writeUInt32LE(36 + n * 2, 4); wav.write("WAVE", 8);
  wav.write("fmt ", 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write("data", 36); wav.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(buf[i] * g * 32767))), 44 + i * 2);
  fs.writeFileSync(file, wav);
}

function assemble(){
  const log = JSON.parse(fs.readFileSync(path.join(CLIPS, "gameplay-land.json"), "utf8"));
  const crash = log.events.find(e => e.type === "crash").t;
  const lastTap = log.events.find(e => e.type === "lastTap").t;

  const G1 = [0, 9.6];                        // opening run with the crash
  const G2 = [lastTap - 2.2, Math.min(log.dur, lastTap + 2.6)];   // final clears + win
  const segLen = {intro: 4.2, g1: G1[1] - G1[0], shapes: 2.3 * 3 - 2 * 0.3, g2: G2[1] - G2[0], endcard: 4.6};

  const caps = [          // [png, stream, start, end] in stream-local seconds
    ["cap-tap",   "g1", 0.3, crash - 0.1],
    ["cap-crash", "g1", crash + 0.05, crash + 2.4],
    ["cap-note",  "g1", crash + 2.7, crash + 4.9],
    ["cap-shape", "g1", crash + 5.2, G1[1] - 0.2],
    ["cap-40",    "shapes", 0.25, segLen.shapes - 0.25]
  ];

  const inputs = [], F = [];
  const add = a => { inputs.push(...a); return inputs.filter(x => x === "-i").length - 1; };
  const norm = `fps=${FPS},format=yuv420p,settb=AVTB`;

  const iIntro = add(["-i", path.join(SEG, "intro.mp4")]);
  const iGame  = add(["-i", path.join(CLIPS, "gameplay-land.mp4")]);
  const iCat   = add(["-i", path.join(SEG, "shape-cat.mp4")]);
  const iPlane = add(["-i", path.join(SEG, "shape-plane.mp4")]);
  const iLion  = add(["-i", path.join(SEG, "shape-lion.mp4")]);
  const iEnd   = add(["-i", path.join(SEG, "endcard.mp4")]);

  F.push(`[${iIntro}:v]${norm}[intro]`);
  F.push(`[${iGame}:v]${norm},split[ga][gb]`);
  F.push(`[ga]trim=${G1[0]}:${G1[1]},setpts=PTS-STARTPTS[g1raw]`);
  F.push(`[gb]trim=${G2[0]}:${G2[1]},setpts=PTS-STARTPTS[g2]`);
  F.push(`[${iCat}:v]${norm}[s1];[${iPlane}:v]${norm}[s2];[${iLion}:v]${norm}[s3]`);
  F.push(`[s1][s2]xfade=transition=fade:duration=0.3:offset=2.0[s12]`);
  F.push(`[s12][s3]xfade=transition=fade:duration=0.3:offset=4.0[shapesraw]`);
  F.push(`[${iEnd}:v]${norm}[endcard]`);

  // captions, faded in and out, laid over their stream
  const cur = {g1: "g1raw", shapes: "shapesraw"};
  caps.forEach(([png, stream, s, e], k) => {
    const d = (e - s).toFixed(3);
    const ic = add(["-loop", "1", "-framerate", String(FPS), "-t", d, "-i", path.join(SEG, png + ".png")]);
    F.push(`[${ic}:v]format=rgba,fade=in:st=0:d=0.22:alpha=1,fade=out:st=${(e - s - 0.22).toFixed(3)}:d=0.22:alpha=1,setpts=PTS-STARTPTS+${s.toFixed(3)}/TB[c${k}]`);
    F.push(`[${cur[stream]}][c${k}]overlay=eof_action=pass:format=auto[o${k}]`);
    cur[stream] = `o${k}`;
  });
  F.push(`[${cur.g1}]format=yuv420p[g1]`);
  F.push(`[${cur.shapes}]format=yuv420p[shapes]`);

  // crossfade chain
  const order = ["intro", "g1", "shapes", "g2", "endcard"];
  const start = {intro: 0};
  let label = order[0], len = segLen[order[0]];
  for (let k = 1; k < order.length; k++) {
    const next = order[k], out = k === order.length - 1 ? "vout" : "x" + k;
    start[next] = len - XF;
    F.push(`[${label}][${next}]xfade=transition=fade:duration=${XF}:offset=${(len - XF).toFixed(3)}[${out}]`);
    len = len + segLen[next] - XF;
    label = out;
  }

  // tap notes + crash, placed at the real tap times of the gameplay excerpts
  const hits = [];
  for (const [seg, [a, b]] of [["g1", G1], ["g2", G2]])
    for (const e of log.events)
      if ((e.type === "tap" || e.type === "crash") && e.t >= a && e.t < b - 0.05)
        hits.push({t: start[seg] + e.t - a, type: e.type});
  const sfx = path.join(SEG, "sfx.wav");
  writeSfx(sfx, hits, len);

  const iMusic = add(["-i", MUSIC]);
  const iSfx = add(["-i", sfx]);
  F.push(`[${iMusic}:a]atrim=0:${len.toFixed(3)},asetpts=PTS-STARTPTS,volume=0.8[m]`);
  F.push(`[${iSfx}:a]volume=0.7[s]`);
  F.push(`[m][s]amix=inputs=2:normalize=0:duration=first,afade=t=in:st=0:d=0.6,afade=t=out:st=${(len - 2.2).toFixed(3)}:d=2.2[aout]`);

  const out = path.join(OUT, "trailer/arrow-out-trailer-1920x1080.mp4");
  ensure(path.dirname(out));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", F.join(";"),
    "-map", "[vout]", "-map", "[aout]", "-t", len.toFixed(3),
    "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], {stdio: "inherit"});
  console.log(`  trailer/arrow-out-trailer-1920x1080.mp4  ${len.toFixed(2)}s (crash at ${crash.toFixed(2)}s in clip)`);
}

(async () => {
  if (process.argv[2] !== "assemble") await record();
  assemble();
})().catch(e => { console.error(e); process.exit(1); });
