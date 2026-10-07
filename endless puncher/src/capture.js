// Dev-only marketing capture (open /capture.html on the dev server).
// Renders CrazyGames covers (1920x1080, 800x1200, 800x800) and preview-video frames using the
// real battle engine, then POSTs them to the dev server's /__capture sink (see vite.config.js).
import * as THREE from 'three';
import '@fontsource/lilita-one/latin-400.css';
import { Battle } from './battle.js';
import { Save } from './save.js';
import { mulberry } from './models.js';
import logoUrl from './assets/ui/logo.webp';

const log = (m) => { document.getElementById('log').textContent += '\n' + m; document.title = m; };

// Never touch the player's real save from this page.
Save.save = () => {};

function showcaseState() {
  const s = Save.state;
  const items = [
    ['gloves', 4, 24], ['helmet', 3, 15], ['armor', 3, 15],
    ['belt', 4, 20], ['pants', 2, 12], ['shoes', 3, 15],
  ].map(([slot, rarity, lvl], i) => ({ uid: 100 + i, slot, rarity, lvl }));
  s.items = items;
  s.equipped = Object.fromEntries(items.map(it => [it.slot, it.uid]));
  s.pets = { fizzle: { lvl: 6, cards: 0 }, voidlet: { lvl: 3, cards: 0 }, crumble: { lvl: 4, cards: 0 } };
  s.petSlots = ['fizzle', 'voidlet', 'crumble'];
  s.ring = { tier: 2, star: 6 };
  s.stage = 7;
}

const SKILL_ORDER = ['arm', 'arm', 'burn', 'arm', 'chain', 'dmg', 'rate', 'arm', 'slam', 'dmg', 'crit', 'range', 'dmg', 'rate'];

function makeBattle(renderer) {
  let pick = 0;
  const b = new Battle(renderer, {
    onLevelUp: () => {
      let id = SKILL_ORDER[pick++ % SKILL_ORDER.length];
      if (b.sk(id) >= 4 && id === 'arm') id = 'dmg';
      b.chooseSkill(id);
    },
  });
  return b;
}

// Deterministic fight: same seed -> same frame for the cover and the video's first frame.
function stageFight(b) {
  Math.random = mulberry(1337);
  b.start(7);
  b.killsNeeded = 1e9;            // keep the horde coming, no boss / victory screen
  b.maxHp = b.hp = 1e9;           // hero never falls
  b.skills = { arm: 3, burn: 2, chain: 2, dmg: 3, rate: 3, range: 1 };
  b.timeScale = 1;
  for (let i = 0; i < 26; i++) b.spawnEnemy(i % 7 === 0 ? 'brute' : i % 3 === 0 ? 'runner' : 'grunt');
  for (const p of b.pets) p.skillCd = 99; // hold skills until the showcase moment
  for (let i = 0; i < 60 * 3; i++) b.update(1 / 60);
  // Time the signature skills so the flamethrower, black hole and frost are all live at frame 0.
  const [ember, voidling, frosty] = b.pets;
  if (ember) ember.skillCd = 0.35;
  if (voidling) voidling.skillCd = 0.2;
  if (frosty) frosty.skillCd = 0.75;
  for (let i = 0; i < 60; i++) b.update(1 / 60);
  for (const p of b.pets) p.skillCd = Math.min(p.skillCd, 2);
  // Fresh wave closing in on the hero so the horde reads clearly on the cover.
  const p = b.player.root.position;
  for (let i = 0; i < 22; i++) {
    const e = b.spawnEnemy(i % 6 === 0 ? 'brute' : i % 3 === 0 ? 'runner' : 'grunt');
    const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
    const d = 3.2 + Math.random() * 4;
    e.f.root.position.set(p.x + Math.cos(a) * d, 0, p.z + Math.sin(a) * d);
  }
  for (let i = 0; i < 12; i++) b.update(1 / 60);
}

// Hero-focused camera. `frame.lift` moves the hero down the frame (positive = look past the hero) to leave room for the logo.
function aimCamera(b, cam, { dist, az = Math.PI / 4, el = 52, lift = 0 }) {
  const p = b.player.root.position;
  const e = THREE.MathUtils.degToRad(el);
  cam.position.set(p.x + Math.sin(az) * Math.cos(e) * dist, Math.sin(e) * dist, p.z + Math.cos(az) * Math.cos(e) * dist);
  const fwd = new THREE.Vector3(-Math.sin(az), 0, -Math.cos(az));
  cam.lookAt(p.x + fwd.x * lift, 1.1, p.z + fwd.z * lift);
}

function drawFloaters(ctx, b, cam, w, h, scale) {
  const v = new THREE.Vector3();
  const colors = { crit: '#ffe23f', burn: '#ffa24a', zap: '#8ff3ff', pet: '#ffb8f2', heal: '#8dff6a' };
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  for (const fl of b.floaters) {
    if (fl.life <= 0) continue;
    v.copy(fl.pos).project(cam);
    if (v.z > 1) continue;
    const kind = fl.el.className.split(' ')[1] || 'hit';
    if (kind === 'skill') continue; // no words on store media, only numbers
    const big = fl.el.className.includes('big');
    const size = (kind === 'crit' ? 30 : big ? 23 : 18) * scale;
    ctx.globalAlpha = Math.min(1, fl.life * 3);
    ctx.font = `${size}px "Lilita One"`;
    ctx.lineWidth = size * 0.28;
    ctx.strokeStyle = '#000';
    const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
    ctx.strokeText(fl.el.textContent, x, y);
    ctx.fillStyle = colors[kind] || '#ffffff';
    ctx.fillText(fl.el.textContent, x, y);
  }
  ctx.globalAlpha = 1;
}

async function post(name, canvas, type = 'image/png', quality) {
  const blob = await new Promise((r) => canvas.toBlob(r, type, quality));
  const res = await fetch(`/__capture?name=${encodeURIComponent(name)}`, { method: 'POST', body: blob });
  if (!res.ok) throw new Error('upload failed: ' + name);
}

const COVERS = [
  { name: 'cover-landscape-1920x1080.png', w: 1920, h: 1080, ss: 1, cam: { dist: 16.5, lift: 3.2 }, logo: { w: 0.34, x: 0.5, y: 0.2 } },
  { name: 'cover-portrait-800x1200.png', w: 800, h: 1200, ss: 2, cam: { dist: 22, lift: 5.2 }, logo: { w: 0.84, x: 0.5, y: 0.17 } },
  { name: 'cover-square-800x800.png', w: 800, h: 800, ss: 2, cam: { dist: 18, lift: 3.8 }, logo: { w: 0.62, x: 0.5, y: 0.18 } },
];

const VIDEOS = [
  { dir: 'video-landscape', w: 1920, h: 1080, cam: { dist: 16.5, lift: 1.2 } },
  { dir: 'video-portrait', w: 1080, h: 1620, cam: { dist: 21, lift: 1.5 } },
];

function setup(w, h) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const b = makeBattle(renderer);
  b.resize(w, h);
  b.camera.fov = 36;
  b.camera.aspect = w / h;
  b.camera.updateProjectionMatrix();
  b.scene.fog.near = 30; b.scene.fog.far = 90;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  return { renderer, b, out, ctx: out.getContext('2d') };
}

function frame(env, cover, camOpts, withLogo, logoImg) {
  const { renderer, b, out, ctx } = env;
  aimCamera(b, b.camera, camOpts);
  b.syncArms();
  renderer.render(b.scene, b.camera);
  ctx.drawImage(renderer.domElement, 0, 0, out.width, out.height);
  // Covers may only carry the title, so floating numbers are drawn on video frames only.
  if (!withLogo) drawFloaters(ctx, b, b.camera, out.width, out.height, out.width / 1000);
  if (withLogo) {
    const lw = out.width * cover.logo.w;
    const lh = lw * (logoImg.height / logoImg.width);
    ctx.shadowColor = 'rgba(20,8,50,.45)';
    ctx.shadowOffsetY = lh * 0.04;
    ctx.drawImage(logoImg, out.width * cover.logo.x - lw / 2, out.height * cover.logo.y - lh / 2, lw, lh);
    ctx.shadowColor = 'transparent';
  }
}

async function makeCovers(logoImg) {
  for (const c of COVERS) {
    const env = setup(c.w * c.ss, c.h * c.ss);
    showcaseState();
    env.b.applyLooks();
    stageFight(env.b);
    frame(env, c, c.cam, true, logoImg);
    let canvas = env.out;
    if (c.ss !== 1) {
      canvas = document.createElement('canvas');
      canvas.width = c.w; canvas.height = c.h;
      const cx = canvas.getContext('2d');
      cx.imageSmoothingQuality = 'high';
      cx.drawImage(env.out, 0, 0, c.w, c.h);
    }
    await post(c.name, canvas);
    env.renderer.dispose();
    log('cover done: ' + c.name);
  }
}

async function makeVideo(v, seconds = 18, fps = 30) {
  const env = setup(v.w, v.h);
  showcaseState();
  env.b.applyLooks();
  stageFight(env.b);
  const total = seconds * fps;
  for (let f = 0; f < total; f++) {
    const t = f / total;
    // Slow orbit + gentle push-in keeps the preview lively without cuts.
    const cam = { ...v.cam, az: Math.PI / 4 + t * 0.5, dist: v.cam.dist * (1 - t * 0.12) };
    frame(env, null, cam, false);
    await post(`${v.dir}/f_${String(f).padStart(4, '0')}.jpg`, env.out, 'image/jpeg', 0.92);
    // Show off the rail threats: the boss rides in on its war-cart, later an ambush cart unloads.
    if (f === 120) env.b.callCart(['boss'], true);
    if (f === 330) env.b.callCart(['grunt', 'runner', 'grunt', 'brute', 'runner'], false);
    // Keep the horde dense for the whole clip: refill from just outside the frame edges.
    if (f % 15 === 0) {
      const b = env.b;
      const p = b.player.root.position;
      const alive = b.enemies.filter(e => e.alive).length;
      for (let i = alive; i < 32; i++) {
        const e = b.spawnEnemy(i % 6 === 0 ? 'brute' : i % 3 === 0 ? 'runner' : 'grunt');
        const a = Math.random() * Math.PI * 2;
        const d = 6 + Math.random() * 2.5;
        e.f.root.position.set(p.x + Math.cos(a) * d, 0, p.z + Math.sin(a) * d);
      }
    }
    env.b.update(1 / fps);
    if (f % 30 === 0) log(`${v.dir}: ${f}/${total}`);
  }
  env.renderer.dispose();
  log('video frames done: ' + v.dir);
}

async function main() {
  const job = new URLSearchParams(location.search).get('job') || 'covers';
  await document.fonts.load('40px "Lilita One"');
  // createImageBitmap works in hidden tabs; Image.decode() can stall there forever.
  const logoImg = await createImageBitmap(await (await fetch(logoUrl)).blob());
  if (job === 'covers' || job === 'all') await makeCovers(logoImg);
  if (job === 'video-landscape' || job === 'all') await makeVideo(VIDEOS[0]);
  if (job === 'video-portrait' || job === 'all') await makeVideo(VIDEOS[1]);
  log('DONE');
}

main().catch((e) => log('ERROR ' + e.message));
