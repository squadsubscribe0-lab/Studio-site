#!/usr/bin/env node
/**
 * Renders the site artwork to optimised responsive images.
 *
 *   npm install        (once — installs sharp + playwright-core)
 *   npm run images
 *
 * - Artwork defined in scripts/art.mjs is rendered with headless Chromium
 *   (so the self-hosted fonts are used), then encoded with sharp to
 *   AVIF + WebP at 640 / 960 / 1280 px wide.
 * - Your own artwork: drop a PNG/JPG/WebP into src/art/<name>.<ext> where
 *   <name> matches an entry in JOBS below (e.g. src/art/idle-shape-shooter.png)
 *   and it will be used instead of the generated art.
 * - Also produces favicon PNGs and the 1200×630 Open Graph image.
 *
 * Set CHROME_PATH if Chromium isn't found automatically.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import config from '../site.config.mjs';
import * as art from './art.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WIDTHS = [640, 960, 1280];

const JOBS = [
  { name: 'idle-shape-shooter', out: 'assets/img/games/idle-shape-shooter', svg: art.idleShapeShooter, w: 1280, h: 800 },
  { name: 'casual-project', out: 'assets/img/games/casual-project', svg: art.casualProject, w: 1280, h: 800 },
  { name: 'hypercasual-project', out: 'assets/img/games/hypercasual-project', svg: art.hypercasualProject, w: 1280, h: 800 },
  { name: 'developer-desk', out: 'assets/img/about/developer-desk', svg: art.developerDesk, w: 1024, h: 1280 },
  { name: 'devlog-new-idea', out: 'assets/img/devlog/new-idea', svg: art.devlogNewIdea, w: 1280, h: 800 },
  { name: 'devlog-performance', out: 'assets/img/devlog/performance', svg: art.devlogPerformance, w: 1280, h: 800 },
  { name: 'devlog-ui-polish', out: 'assets/img/devlog/ui-polish', svg: art.devlogUiPolish, w: 1280, h: 800 },
];

// Fonts are inlined as data URLs: pages created with setContent can't load file:// URLs.
const fontUrl = (file) => `data:font/woff2;base64,${readFileSync(join(ROOT, 'assets/fonts', file)).toString('base64')}`;
const fontCss = `
@font-face{font-family:'Space Grotesk';src:url('${fontUrl('space-grotesk-latin.woff2')}') format('woff2');font-weight:500 700}
@font-face{font-family:'Inter';src:url('${fontUrl('inter-latin.woff2')}') format('woff2');font-weight:400 700}
html,body{margin:0;background:#05070d}svg{display:block}`;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PLAYWRIGHT_BROWSERS_PATH && join(process.env.PLAYWRIGHT_BROWSERS_PATH, 'chromium'),
    '/opt/pw-browsers/chromium',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

async function render(page, html, w, h, scale = 1) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><head><style>${fontCss}</style></head><body>${html}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: w, height: h }, scale: scale === 1 ? 'css' : 'device' });
}

async function encode(buffer, out) {
  mkdirSync(dirname(join(ROOT, out)), { recursive: true });
  for (const width of WIDTHS) {
    const base = sharp(buffer).resize({ width, withoutEnlargement: false });
    await base.clone().webp({ quality: 80, effort: 6 }).toFile(join(ROOT, `${out}-${width}.webp`));
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(join(ROOT, `${out}-${width}.avif`));
  }
}

const userArt = (name) =>
  ['png', 'jpg', 'jpeg', 'webp'].map((ext) => join(ROOT, 'src/art', `${name}.${ext}`)).find((p) => existsSync(p));

const browser = await chromium.launch({ executablePath: findChrome() });
const context = await browser.newContext({ deviceScaleFactor: 1 });
const page = await context.newPage();

for (const job of JOBS) {
  const custom = userArt(job.name);
  let buffer;
  if (custom) {
    buffer = readFileSync(custom);
    console.log(`• ${job.name}: using ${custom.replace(ROOT + '/', '')}`);
  } else {
    // Render at the largest output width (1280px) for crisp downscales.
    const ctx = await browser.newContext({ deviceScaleFactor: 1280 / job.w });
    buffer = await render(await ctx.newPage(), job.svg({ w: job.w, h: job.h }), job.w, job.h, 1280 / job.w);
    await ctx.close();
    console.log(`• ${job.name}: rendered`);
  }
  await encode(buffer, job.out);
}

/* Favicons */
const fav = art.favicon();
writeFileSync(join(ROOT, 'favicon.svg'), `${fav}\n`);
for (const [file, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  const png = await render(page, fav.replace('<svg ', `<svg width="${size}" height="${size}" `), size, size);
  await sharp(png).png({ compressionLevel: 9, palette: size <= 32 }).toFile(join(ROOT, file));
}
console.log('• favicons');

/* Open Graph image */
const dev = config.developer;
const ogHtml = `
<div style="position:relative;width:1200px;height:630px;overflow:hidden;font-family:Inter,sans-serif;background:
  radial-gradient(700px 380px at 72% 100%, rgba(255,120,30,.28), transparent 65%),
  radial-gradient(600px 400px at 10% 0%, rgba(52,72,140,.45), transparent 60%),
  linear-gradient(180deg,#070a17,#0b1124 60%,#05070d)">
  <div style="position:absolute;right:-40px;top:70px;width:620px;transform:rotate(4deg);border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.14);box-shadow:0 40px 90px -20px rgba(255,122,26,.45)">
    ${art.idleShapeShooter({ w: 1280, h: 800 }).replace('<svg ', '<svg style="width:100%;height:auto" ')}
  </div>
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,#05070d 0%,rgba(5,7,13,.92) 42%,rgba(5,7,13,.2) 75%,transparent)"></div>
  <div style="position:absolute;left:72px;top:74px;right:420px">
    <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border:1px solid rgba(255,173,92,.35);border-radius:999px;background:rgba(255,122,26,.1);font:600 15px 'Space Grotesk';letter-spacing:.22em;color:#ffad5c">
      <span style="width:9px;height:9px;border-radius:50%;background:#ff7a1a;box-shadow:0 0 12px #ff7a1a"></span>SOLO INDIE DEVELOPER
    </div>
    <div style="margin-top:34px;font:700 70px/0.98 'Space Grotesk';letter-spacing:-.035em;color:#f3f5f9;text-transform:uppercase">
      I build simple games<br><span style="background:linear-gradient(100deg,#ffd0a1,#ffad5c 30%,#ff7a1a 70%);-webkit-background-clip:text;color:transparent">people can’t put down.</span>
    </div>
    <div style="margin-top:30px;font:500 22px 'Inter';color:#c4cada">Casual, hypercasual &amp; idle — HTML5 and Unity</div>
  </div>
  <div style="position:absolute;left:72px;bottom:56px;display:flex;align-items:center;gap:14px;font:700 22px 'Space Grotesk';color:#f3f5f9">
    <span style="display:grid;place-items:center;width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#ffad5c,#ff7a1a);color:#1a0b00;font-size:18px">${dev.monogram}</span>${dev.name}
  </div>
</div>`;
const og = await render(page, ogHtml, 1200, 630);
await sharp(og).jpeg({ quality: 86, mozjpeg: true }).toFile(join(ROOT, 'assets/img/og-image.jpg'));
console.log('• og-image.jpg');

await browser.close();
console.log('Done. Run `node build.mjs` to refresh the HTML.');
