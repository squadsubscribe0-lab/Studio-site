#!/usr/bin/env node
/**
 * Generates looping portrait (9:16) preview clips + posters for the web-games
 * carousel. These are PLACEHOLDERS — replace them with real gameplay captures:
 *
 *   put  src/video/<slug>.mp4  (portrait, ideally 720×1280, 5–10 s, no audio)
 *   run  npm run videos
 *
 * Your file is re-encoded to a small web-friendly MP4 and a poster frame is
 * extracted. Games without a source file get a generated attract-mode loop.
 * Requires ffmpeg on PATH (with libx264) and Chromium (CHROME_PATH).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import config from '../site.config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 432;
const H = 768;
const FPS = 24;
const SECONDS = 4;
const FRAMES = FPS * SECONDS;

const PALETTES = [
  ['#0d1430', '#ff7a1a', '#ffd166', '#4fd1ff', '#9b7bff'],
  ['#1a1033', '#ff5c8a', '#ffd166', '#6ee7b7', '#7bdff2'],
  ['#0a1e2a', '#5ef2c2', '#ffd166', '#ff7a1a', '#8ea5ff'],
  ['#21102a', '#b39cff', '#ff9a4a', '#4fd1ff', '#ff6f91'],
  ['#101a12', '#a3e635', '#ffd166', '#ff7a1a', '#4fd1ff'],
  ['#2a1410', '#ffad5c', '#ff5c8a', '#7bdff2', '#ffd166'],
];
const MOTIFS = ['shooter', 'runner', 'stack', 'tiles', 'orbit', 'rings'];

// Runs inside the browser: draws one frame at phase p ∈ [0, 1).
const SCENE = String.raw`
const c = document.querySelector('canvas');
const x = c.getContext('2d');
const W = c.width, H = c.height;
const TAU = Math.PI * 2;
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function poly(cx, cy, r, n, rot) { x.beginPath(); for (let i = 0; i < n; i++) { const a = rot + i / n * TAU - Math.PI / 2; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); }
function glow(col, blur) { x.shadowColor = col; x.shadowBlur = blur; }
function bg(pal, p) {
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, pal[0]); g.addColorStop(1, '#05070d');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const r = rnd(7);
  for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.15 + r() * 0.4) + ')'; const sy = (r() * H + p * H * 0.25 * (0.5 + r())) % H; x.fillRect(r() * W, sy, 1.6, 1.6); }
  const rg = x.createRadialGradient(W / 2, H * 0.62, 10, W / 2, H * 0.62, W);
  rg.addColorStop(0, pal[1] + '55'); rg.addColorStop(1, pal[1] + '00');
  x.fillStyle = rg; x.fillRect(0, 0, W, H);
}
function hud(pal, p, score) {
  x.shadowBlur = 0;
  x.fillStyle = 'rgba(5,7,13,.55)'; x.beginPath(); x.roundRect(W / 2 - 70, 26, 140, 44, 22); x.fill();
  x.fillStyle = '#fff'; x.font = '700 24px "Space Grotesk", sans-serif'; x.textAlign = 'center';
  x.fillText(String(Math.floor(score)), W / 2, 56);
  const a = 0.35 + 0.35 * Math.sin(p * TAU * 2);
  x.fillStyle = 'rgba(255,255,255,' + a + ')'; x.font = '600 15px "Space Grotesk", sans-serif';
  x.fillText('TAP TO PLAY', W / 2, H - 40);
}
const scenes = {
  shooter(pal, p) {
    const tx = W / 2, ty = H - 150;
    const r = rnd(3);
    for (let i = 0; i < 14; i++) {
      const sx = 40 + r() * (W - 80), off = r(), n = 3 + Math.floor(r() * 4), size = 14 + r() * 18, col = pal[1 + (i % 4)];
      const k = (p + off) % 1, sy = -40 + k * (ty - 60);
      x.save(); glow(col, 16); x.strokeStyle = col; x.lineWidth = 3; x.fillStyle = col + '33';
      poly(sx, sy, size, n, k * TAU + i); x.fill(); x.stroke(); x.restore();
      if (k > 0.55 && k < 0.6) { x.save(); glow('#fff', 30); x.fillStyle = 'rgba(255,240,220,.9)'; x.beginPath(); x.arc(sx, sy, size * 1.2, 0, TAU); x.fill(); x.restore(); }
      if (k > 0.25 && k < 0.55) { const bk = (k - 0.25) / 0.3; const bx = tx + (sx - tx) * bk, by = ty + (sy - ty) * bk; x.save(); glow(pal[1], 12); x.fillStyle = '#fff4e6'; x.beginPath(); x.arc(bx, by, 4, 0, TAU); x.fill(); x.restore(); }
    }
    const aim = Math.sin(p * TAU) * 0.6;
    x.save(); x.translate(tx, ty); glow(pal[1], 30);
    x.fillStyle = '#1b2443'; poly(0, 18, 58, 6, Math.PI / 6); x.fill();
    x.rotate(aim); x.fillStyle = pal[1]; x.beginPath(); x.roundRect(-11, -92, 22, 92, 6); x.fill();
    x.fillStyle = '#ffe0bf'; x.beginPath(); x.arc(0, 0, 26, 0, TAU); x.fill(); x.restore();
    hud(pal, p, 12840 + p * 960);
  },
  runner(pal, p) {
    const r = rnd(11), seg = 150, off = p * seg * 3;
    for (let i = -1; i < 8; i++) {
      const px = i * seg - (off % seg), idx = i + Math.floor(off / seg);
      const ph = H * 0.62 + Math.sin(idx * 1.7) * 60;
      x.fillStyle = pal[3]; x.fillRect(px + 10, ph, seg - 40, 14);
      const g = x.createLinearGradient(0, ph, 0, H); g.addColorStop(0, pal[3] + '55'); g.addColorStop(1, pal[3] + '00');
      x.fillStyle = g; x.fillRect(px + 10, ph + 14, seg - 40, H - ph);
      if (idx % 2 === 0) { x.save(); glow(pal[2], 14); x.fillStyle = pal[2]; x.beginPath(); x.arc(px + seg / 2 - 10, ph - 50, 9, 0, TAU); x.fill(); x.restore(); }
    }
    const bounce = Math.abs(Math.sin(p * TAU * 3));
    const by = H * 0.62 - 26 - bounce * 120 + Math.sin((p * 3 + 0.5) * 1.7) * 0;
    for (let t = 1; t < 8; t++) { x.fillStyle = pal[1] + Math.round(40 - t * 5).toString(16).padStart(2, '0'); x.beginPath(); x.arc(W * 0.32 - t * 14, by + t * 4 * Math.cos(p * TAU * 3), 18 - t * 1.5, 0, TAU); x.fill(); }
    x.save(); glow(pal[1], 30); x.fillStyle = pal[1]; x.beginPath(); x.arc(W * 0.32, by, 20, 0, TAU); x.fill(); x.restore();
    hud(pal, p, 340 + p * 12);
  },
  stack(pal, p) {
    const bh = 34, base = H - 120, cam = p * bh;
    for (let i = 0; i < 18; i++) {
      const y = base - i * bh + cam, w = 220 - i * 4, col = pal[1 + (i % 4)];
      if (y < -bh) continue;
      x.fillStyle = col; x.fillRect(W / 2 - w / 2 + Math.sin(i * 2.1) * 8, y, w, bh - 3);
      x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(W / 2 - w / 2 + Math.sin(i * 2.1) * 8, y, w, 6);
    }
    const top = 18, slide = Math.sin(p * TAU) * 150, y = base - top * bh + cam;
    x.save(); glow(pal[2], 24); x.fillStyle = pal[2]; x.fillRect(W / 2 - 75 + slide, y, 150, bh - 3); x.restore();
    hud(pal, p, 57 + p);
  },
  tiles(pal, p) {
    const n = 4, s = 82, gap = 12, ox = (W - (n * s + (n - 1) * gap)) / 2, oy = H / 2 - (n * s + (n - 1) * gap) / 2 + 30;
    const vals = [2, 4, 8, 16, 32, 64, 128, 256];
    for (let i = 0; i < n * n; i++) {
      const cx = ox + (i % n) * (s + gap), cy = oy + Math.floor(i / n) * (s + gap);
      x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.roundRect(cx, cy, s, s, 16); x.fill();
      if ((i * 7) % 5 === 0) continue;
      const pop = Math.max(0, Math.sin((p * 2 + i * 0.13) * TAU)) ** 6;
      const sc = 1 + pop * 0.14, v = vals[(i * 3 + Math.floor(p * 2 + i * 0.13)) % vals.length], col = pal[1 + (v.toString().length + i) % 4];
      x.save(); x.translate(cx + s / 2, cy + s / 2); x.scale(sc, sc); glow(col, pop * 30);
      x.fillStyle = col; x.beginPath(); x.roundRect(-s / 2, -s / 2, s, s, 16); x.fill();
      x.shadowBlur = 0; x.fillStyle = '#10131f'; x.font = '700 ' + (v > 99 ? 26 : 32) + 'px "Space Grotesk", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(v, 0, 2); x.restore();
    }
    x.textBaseline = 'alphabetic';
    hud(pal, p, 2048 + p * 256);
  },
  orbit(pal, p) {
    const cx = W / 2, cy = H / 2 + 20;
    x.save(); glow(pal[1], 50); const g = x.createRadialGradient(cx - 14, cy - 14, 4, cx, cy, 52); g.addColorStop(0, '#fff'); g.addColorStop(0.4, pal[1]); g.addColorStop(1, pal[0]);
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 48, 0, TAU); x.fill(); x.restore();
    [100, 150, 200].forEach((rr, k) => {
      x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, rr, 0, TAU); x.stroke();
      for (let j = 0; j < 3 + k; j++) {
        const a = (k % 2 ? -1 : 1) * p * TAU * (k + 1) + j / (3 + k) * TAU, col = pal[2 + ((j + k) % 3)];
        x.save(); glow(col, 16); x.fillStyle = col; poly(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 11, 3 + k, a); x.fill(); x.restore();
      }
    });
    const pa = p * TAU * 2; x.save(); glow('#fff', 20); x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + Math.cos(pa) * 150, cy + Math.sin(pa) * 150, 12, 0, TAU); x.fill(); x.restore();
    hud(pal, p, 88 + p * 4);
  },
  rings(pal, p) {
    const cx = W / 2;
    [H * 0.3, H * 0.62].forEach((cy, k) => {
      const rot = (k ? -1 : 1) * p * TAU;
      for (let q = 0; q < 4; q++) {
        x.save(); glow(pal[1 + q], 14); x.strokeStyle = pal[1 + q]; x.lineWidth = 16; x.lineCap = 'round';
        x.beginPath(); x.arc(cx, cy, 86 - k * 10, rot + q * TAU / 4 + 0.12, rot + (q + 1) * TAU / 4 - 0.12); x.stroke(); x.restore();
      }
    });
    const by = H * 0.86 - Math.abs(Math.sin(p * TAU * 2)) * 90;
    x.save(); glow(pal[2], 24); x.fillStyle = pal[2]; x.beginPath(); x.arc(cx, by, 15, 0, TAU); x.fill(); x.restore();
    x.save(); x.translate(cx, H * 0.46); x.rotate(p * TAU); x.fillStyle = '#fff'; poly(0, 0, 13, 4, 0); x.fill(); x.restore();
    hud(pal, p, 24 + p * 2);
  },
};
window.renderFrame = (motif, pal, p) => { x.clearRect(0, 0, W, H); bg(pal, p); scenes[motif](pal, p); };
`;

const ffmpeg = (args, input) =>
  new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
    if (input) input(proc.stdin);
  });

const toWebm = (mp4) =>
  ffmpeg(['-i', mp4, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '42', '-row-mt', '1', '-deadline', 'good', '-an', mp4.replace(/\.mp4$/, '.webm')]);

const ENCODE = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'main', '-crf', '30', '-preset', 'slow', '-movflags', '+faststart', '-an'];

async function writePoster(png, slug) {
  const out = join(ROOT, 'assets/img/web-games', slug);
  mkdirSync(dirname(out), { recursive: true });
  await sharp(png).resize(W).webp({ quality: 78 }).toFile(`${out}.webp`);
  await sharp(png).resize(W).avif({ quality: 50 }).toFile(`${out}.avif`);
}

if (spawnSync('ffmpeg', ['-version']).status !== 0) {
  console.error('ffmpeg not found on PATH.');
  process.exit(1);
}

const fontData = (f) => readFileSync(join(ROOT, 'assets/fonts', f)).toString('base64');
const chrome = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium'].find((p) => p && existsSync(p));
const browser = await chromium.launch({ executablePath: chrome });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(
  `<!doctype html><style>@font-face{font-family:'Space Grotesk';src:url(data:font/woff2;base64,${fontData('space-grotesk-latin.woff2')}) format('woff2');font-weight:500 700}html,body{margin:0;background:#000}canvas{display:block}</style><canvas width="${W}" height="${H}"></canvas><script>${SCENE}</script>`,
);
await page.evaluate(() => document.fonts.load('700 20px "Space Grotesk"'));

mkdirSync(join(ROOT, 'assets/video'), { recursive: true });
const WEBM_ONLY = process.argv.includes('--webm-only');
for (const [i, game] of config.webGames.entries()) {
  if (WEBM_ONLY) {
    await toWebm(join(ROOT, `assets/video/${game.slug}.mp4`));
    console.log(`• ${game.slug}: webm`);
    continue;
  }
  const slug = game.slug;
  const outVideo = join(ROOT, `assets/video/${slug}.mp4`);
  const source = ['mp4', 'mov', 'webm'].map((e) => join(ROOT, 'src/video', `${slug}.${e}`)).find(existsSync);
  if (source) {
    await ffmpeg(['-i', source, '-t', '12', '-vf', `scale=${W * 1.25}:-2,fps=30`, ...ENCODE, outVideo]);
    await ffmpeg(['-i', outVideo, '-frames:v', '1', join(ROOT, '.tmp-poster.png')]);
    await writePoster(readFileSync(join(ROOT, '.tmp-poster.png')), slug);
    spawnSync('rm', ['-f', join(ROOT, '.tmp-poster.png')]);
    await toWebm(outVideo);
    console.log(`• ${slug}: encoded from ${source.replace(`${ROOT}/`, '')}`);
    continue;
  }
  const motif = game.motif || MOTIFS[i % MOTIFS.length];
  const pal = PALETTES[(i + Math.floor(i / MOTIFS.length) * 3) % PALETTES.length];
  await ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', ...ENCODE, outVideo], async (stdin) => {
    for (let f = 0; f < FRAMES; f++) {
      await page.evaluate(([m, pl, p]) => window.renderFrame(m, pl, p), [motif, pal, f / FRAMES]);
      const png = await page.locator('canvas').screenshot({ type: 'png' });
      if (f === 0) await writePoster(png, slug);
      if (!stdin.write(png)) await new Promise((r) => stdin.once('drain', r));
    }
    stdin.end();
  });
  await toWebm(outVideo);
  console.log(`• ${slug}: generated placeholder (${motif})`);
}
await browser.close();
