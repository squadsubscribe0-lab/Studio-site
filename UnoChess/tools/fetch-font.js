// Downloads the Baloo 2 woff2 files (SIL Open Font License) and writes an inline @font-face
// stylesheet, so builds that must not hit external servers still get the game's font.
const https = require('https'), fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const get = (url, bin) => new Promise((res, rej) => https.get(url, { headers: { 'User-Agent': UA } }, r => {
  if (r.statusCode >= 300 && r.headers.location) return get(r.headers.location, bin).then(res, rej);
  const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(bin ? Buffer.concat(c) : Buffer.concat(c).toString()));
}).on('error', rej));

(async () => {
  const css = await get('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap');
  const blocks = css.split('@font-face').slice(1).filter(b => /unicode-range:\s*U\+0000/.test(b)); // latin subset only
  let out = '/* Baloo 2 by Ek Type, SIL Open Font License 1.1 */\n';
  for (const b of blocks) {
    const w = b.match(/font-weight:\s*(\d+)/)[1], u = b.match(/url\((https:[^)]+\.woff2)\)/)[1];
    const data = await get(u, true);
    out += `@font-face{font-family:"Baloo 2";font-style:normal;font-weight:${w};font-display:swap;` +
      `src:url(data:font/woff2;base64,${data.toString('base64')}) format("woff2")}\n`;
    console.error('weight', w, (data.length / 1024).toFixed(0) + ' KB');
  }
  fs.writeFileSync(__dirname + '/baloo2.css', out);
  console.error('wrote baloo2.css', (out.length / 1024).toFixed(0) + ' KB');
})();
