// node render-covers.js  → crazygames/cover-landscape-1920x1080.png, cover-portrait-800x1200.png, cover-square-800x800.png
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(__dirname, 'crazygames');
const JOBS = [
  ['land', 1920, 1080, 'cover-landscape-1920x1080.png'],
  ['port', 800, 1200, 'cover-portrait-800x1200.png'],
  ['square', 800, 800, 'cover-square-800x800.png'],
  ['port', 1080, 1620, '../work/cover-portrait-1080x1620.png', 1.35]    // opening frame for the portrait video
];
(async () => {
  const browser = await puppeteer.launch({ executablePath:CHROME, headless:true, args:['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  for(const [layout, w, h, file, res = 1] of JOBS.filter(j => process.argv.length < 3 || process.argv.includes(j[0]))){
    await page.setViewport({ width:w, height:h, deviceScaleFactor:1 });
    await page.goto('file:///' + path.join(__dirname, 'src/cover.html').replace(/\\/g, '/') + '?layout=' + layout + '&res=' + res);
    await page.waitForFunction('window.DONE === true', { timeout:20000 });
    await page.screenshot({ path:path.join(OUT, file), clip:{ x:0, y:0, width:w, height:h } });
    console.log('wrote', file);
  }
  await browser.close();
})();
