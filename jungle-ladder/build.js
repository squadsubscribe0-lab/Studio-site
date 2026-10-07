#!/usr/bin/env node
/* Jungle Ladder build script
   node build.js              -> builds every portal into builds/<portal>/
   node build.js poki yandex  -> builds only those portals
   Each build folder is self-contained: zip its CONTENTS (index.html at the zip root) and upload. */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'builds');

const PORTALS = {
  crazygames:       { head:['<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'], vendor:['peerjs.min.js'] },
  poki:             { head:['<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>'], vendor:['peerjs.min.js'] },
  gamedistribution: { head:[], vendor:['peerjs.min.js'] },                 // SDK is injected by the adapter (needs GD_OPTIONS first)
  gamemonetize:     { head:[], vendor:['peerjs.min.js'] },                 // SDK is injected by the adapter (needs SDK_OPTIONS first)
  gamepix:          { head:['<script src="https://integration.gamepix.com/sdk/v3/gamepix.sdk.js"></script>'], vendor:[] },          // SDK tag is the first script in <head>, as GamePix requires
  lagged:           { head:['<script src="https://lagged.com/api/rev-share/lagged.js"></script>'], vendor:['peerjs.min.js'] },
  newgrounds:       { head:[], vendor:['peerjs.min.js'] },
  playgama:         { head:['<script src="js/vendor/playgama-bridge.js"></script>'], vendor:['peerjs.min.js', 'playgama-bridge.js'] },
  y8:               { head:['<script src="https://cdn.y8.com/minimal-sdk/2-0/y8.min.js" async></script>'], vendor:['peerjs.min.js'] },
  yandex:           { head:['<script src="/sdk.js"></script>'], vendor:[] },
  selfhost:         { head:[], vendor:['peerjs.min.js'] },
  standalone:       { head:[], vendor:['peerjs.min.js'], inline:true }   // one single index.html, everything inlined
};

const read = p => fs.readFileSync(path.join(SRC, p), 'utf8');
const rmrf = p => fs.rmSync(p, { recursive:true, force:true });
const mkdir = p => fs.mkdirSync(p, { recursive:true });
const copy = (from, to) => { mkdir(path.dirname(to)); fs.copyFileSync(from, to); };

function build(name){
  const cfg = PORTALS[name];
  if(!cfg){ console.error('Unknown portal: ' + name); process.exitCode = 1; return; }
  const dir = path.join(OUT, name);
  rmrf(dir); mkdir(dir);

  const platformJs = read('platforms/_base.js') + '\n' + read('platforms/' + name + '.js');
  const gameJs = read('js/game.js');
  let css = read('css/style.css');
  let html = read('index.template.html');
  const head = cfg.head.join('\n');

  if(cfg.inline){
    const fontsDir = path.join(SRC, 'fonts');
    css = css.replace(/url\('\.\.\/fonts\/([^']+)'\)/g, (m, f) => "url('data:font/woff2;base64," + fs.readFileSync(path.join(fontsDir, f)).toString('base64') + "')");
    const vendor = cfg.vendor.map(v => '<script>\n' + read('js/vendor/' + v) + '\n</script>').join('\n');
    html = html.replace('{{HEAD_SDK}}', head)
               .replace('{{STYLES}}', () => '<style>\n' + css + '</style>')
               .replace('{{SCRIPTS}}', () => vendor + '\n<script>\n' + platformJs + '\n</script>\n<script>\n' + gameJs + '</script>');
  } else {
    mkdir(path.join(dir, 'css')); mkdir(path.join(dir, 'js'));
    fs.writeFileSync(path.join(dir, 'css', 'style.css'), css);
    fs.writeFileSync(path.join(dir, 'js', 'platform.js'), platformJs);
    fs.writeFileSync(path.join(dir, 'js', 'game.js'), gameJs);
    for(const f of fs.readdirSync(path.join(SRC, 'fonts'))) copy(path.join(SRC, 'fonts', f), path.join(dir, 'fonts', f));
    for(const v of cfg.vendor){
      copy(path.join(SRC, 'js/vendor', v), path.join(dir, 'js/vendor', v));
      const lic = 'LICENSE-' + v.replace(/\.min\.js$|\.js$/, '') + '.txt';
      if(fs.existsSync(path.join(SRC, 'js/vendor', lic))) copy(path.join(SRC, 'js/vendor', lic), path.join(dir, 'js/vendor', lic));
    }
    html = html.replace('{{HEAD_SDK}}', head)
               .replace('{{STYLES}}', '<link rel="stylesheet" href="css/style.css">')
               .replace('{{SCRIPTS}}', '<script src="js/platform.js"></script>\n<script src="js/game.js"></script>');
  }
  fs.writeFileSync(path.join(dir, 'index.html'), html);

  // zip the folder contents (index.html at the zip root) when a zip tool is available
  const zipPath = path.join(OUT, name + '.zip');
  rmrf(zipPath);
  try{
    if(process.platform === 'win32') execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${dir}\\*' -DestinationPath '${zipPath}'"`, { stdio:'ignore' });
    else execSync(`cd "${dir}" && zip -qr "${zipPath}" .`, { stdio:'ignore' });
  }catch(e){ console.warn('  (zip skipped: no zip tool found)'); }
  console.log('built ' + name);
}

const wanted = process.argv.slice(2);
mkdir(OUT);
(wanted.length ? wanted : Object.keys(PORTALS)).forEach(build);
