// Captures real gameplay screenshots (auto-played human vs bot).
//   node tools/make-screenshots.js <outDir> <w> <h> <deviceScale> <count>
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const GAME = 'file:///D:/UnoChess/index%20(1).html';
const [outDir, W, H, SCALE, COUNT] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5] || 1, +process.argv[6] || 3];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({
    viewport: { width: Math.round(W / SCALE), height: Math.round(H / SCALE) }, deviceScaleFactor: SCALE });
  const sdkReady = new Promise(res => { page.on('console', m => { if (/SDK initialized/.test(m.text())) res(); }); setTimeout(res, 15000); });
  await page.addInitScript(() => {
    for (const [k, v] of Object.entries({ wg_played: '1', wg_time: '300', wg_board: 'wood',
      wg_seen_skip: '1', wg_seen_draw2: '1', wg_seen_rev: '1', wg_seen_wild: '1' })) localStorage.setItem(k, v);
  });
  await page.goto(GAME, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await sdkReady;
  await page.waitForTimeout(400);
  // the game now lands straight in a bot game; only the menu needs a click
  if(await page.evaluate(() => document.querySelector('#ovTitle').classList.contains('show'))) await page.click('#playBot');

  const step = async () => {
    await page.evaluate(() => {
      const $ = s => document.querySelector(s), pick = a => a[Math.random() * a.length | 0];
      if ($('#ovWild.show')) { $('#ovWild [data-m="3"]').click(); return; }
      const caps = [...document.querySelectorAll('.sq.cap')], tg = [...document.querySelectorAll('.sq.tgt')];
      if (caps.length || tg.length) { pick(caps.length ? caps : tg).click(); return; }
      const mov = [...document.querySelectorAll('.sq.mov')];
      if (mov.length) { pick(mov).click(); return; }
      const hand = [...document.querySelectorAll('#hand.live .card')];
      if (hand.length) pick(hand).click();
    });
    await page.waitForTimeout(700);
  };

  for (let i = 1; i <= COUNT; i++) {
    for (let k = 0; k < 5 + i * 2; k++) await step();     // let the board fill up between shots
    const file = path.join(outDir, `screenshot-${W}x${H}-${i}.png`);
    await page.screenshot({ path: file });
    console.log(file);
  }
  await browser.close();
})();
