/* Shared cover art: the game's own characters, redrawn large with shading + sticker outlines. */
const INK = '#243056';
let RES = 1;   // render resolution multiplier (sprites are rasterised at RES so nothing gets upscaled)
const HERO = { body:'#a0612f', light:'#d08a4c', dark:'#6e3f1c', face:'#ffd9b0', faceLight:'#fff0dc', angry:false };
const RIVAL = { body:'#6c5ce7', light:'#9a8cff', dark:'#4536b0', face:'#ffd0c2', faceLight:'#ffe9e2', angry:true };
const TEAL = { top:'#1fbfb6', bot:'#d6fab0', far:'#8fe3b8', near:'#44c38f', accent:'#ff5a5f', grass:'#4cc267', dirt:'#d59a62', dirt2:'#c3884f' };

const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(c, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function ell(c, x, y, rx, ry, rot = 0){ c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function circ(c, x, y, r, col){ c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function rgbOf(a){ if(a[0] === '#'){ const n = parseInt(a.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; } return a.match(/[\d.]+/g).slice(0, 3).map(Number); }
function mix(a, b, t){
  const A = rgbOf(a), B = rgbOf(b);
  return 'rgb(' + A.map((v, i) => Math.round(v * (1 - t) + B[i] * t)).join(',') + ')';
}
function blob(c, x, y, r, base, light){
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.08, x, y, r * 1.15);
  g.addColorStop(0, light); g.addColorStop(1, base); return g;
}

/* ---------- sprites: draw once at scale on an offscreen canvas, then place with outline/shadow ---------- */
function sprite(w, h, ax, ay, s, fn){
  s *= RES;
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * s); cv.height = Math.ceil(h * s);
  const c = cv.getContext('2d'); c.translate(ax * s, ay * s); c.scale(s, s); fn(c);
  return { cv, ax:ax * s, ay:ay * s };
}
function outlined(sp, px, col){
  const pad = Math.ceil(px) + 2, o = document.createElement('canvas');
  o.width = sp.cv.width + pad * 2; o.height = sp.cv.height + pad * 2;
  const t = document.createElement('canvas'); t.width = sp.cv.width; t.height = sp.cv.height;
  const tc = t.getContext('2d'); tc.drawImage(sp.cv, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, t.width, t.height);
  const c = o.getContext('2d');
  for(const k of [1, 0.66, 0.33]) for(let a = 0; a < 36; a++){ const an = a / 36 * Math.PI * 2; c.drawImage(t, pad + Math.cos(an) * px * k, pad + Math.sin(an) * px * k); }
  c.drawImage(sp.cv, pad, pad);
  return { cv:o, ax:sp.ax + pad, ay:sp.ay + pad };
}
function place(c, sp, x, y, o = {}){
  const s = o.outline ? outlined(sp, o.outline * RES, o.oc || INK) : sp;
  c.save(); c.translate(x, y);
  if(o.rot) c.rotate(o.rot);
  if(o.flip) c.scale(-1, 1);
  c.scale(1 / RES, 1 / RES);
  if(o.shadow){ c.shadowColor = o.shadow; c.shadowBlur = (o.blur || 30) * RES; c.shadowOffsetY = (o.sy == null ? 14 : o.sy) * RES; }
  if(o.filter) c.filter = o.filter;
  if(o.alpha != null) c.globalAlpha = o.alpha;
  c.drawImage(s.cv, -s.ax, -s.ay);
  c.restore();
}

/* ---------- monkey (faces +x, feet at 0,0, ~72 units tall) ---------- */
function monkey(c, p, pose, expr){
  c.lineCap = 'round'; c.lineJoin = 'round';
  // tail
  c.strokeStyle = p.dark; c.lineWidth = 7;
  c.beginPath(); c.moveTo(-12, -14); c.bezierCurveTo(-36, -6, -42, -44, -24, -48); c.bezierCurveTo(-15, -50, -12, -41, -19, -39); c.stroke();
  // legs + feet
  c.strokeStyle = p.body; c.lineWidth = 8;
  if(pose === 'leap'){
    c.beginPath(); c.moveTo(-6, -10); c.lineTo(-13, 1); c.moveTo(7, -10); c.lineTo(15, 3); c.stroke();
    c.fillStyle = p.dark; ell(c, -15, 3, 8, 5.5, 0.3); c.fill(); ell(c, 17, 5, 8, 5.5, -0.3); c.fill();
  } else {
    c.fillStyle = p.dark; ell(c, -8, -4, 8.5, 5.5); c.fill(); ell(c, 9, -4, 8.5, 5.5); c.fill();
  }
  // back arm (behind body)
  c.strokeStyle = p.dark; c.lineWidth = 8;
  c.beginPath();
  if(pose === 'leap'){ c.moveTo(-8, -30); c.quadraticCurveTo(-20, -44, -16, -64); }
  else { c.moveTo(-8, -28); c.lineTo(2, -15); }
  c.stroke();
  if(pose === 'leap'){ c.fillStyle = p.dark; ell(c, -16, -66, 5.5, 5.5); c.fill(); }
  // body
  c.fillStyle = blob(c, 0, -21, 18, p.body, p.light); ell(c, 0, -21, 17, 18); c.fill();
  c.fillStyle = blob(c, 3, -17, 10, p.face, p.faceLight); ell(c, 3, -17, 10, 11); c.fill();
  // front arm
  c.strokeStyle = p.body; c.lineWidth = 8.5; c.beginPath();
  if(pose === 'leap'){ c.moveTo(9, -31); c.quadraticCurveTo(24, -42, 26, -62); }
  else { c.moveTo(9, -30); c.lineTo(25, -25); }
  c.stroke();
  c.fillStyle = p.body;
  if(pose === 'leap'){ ell(c, 26, -64, 6, 6); c.fill(); } else { ell(c, 26, -25, 5.5, 5.5); c.fill(); }
  // ears
  c.fillStyle = p.body; ell(c, -15, -51, 8.5, 8.5); c.fill(); ell(c, 17, -51, 8.5, 8.5); c.fill();
  c.fillStyle = p.face; ell(c, -15, -51, 4.5, 4.5); c.fill(); ell(c, 17, -51, 4.5, 4.5); c.fill();
  // head
  c.fillStyle = blob(c, 0, -49, 19, p.body, p.light); ell(c, 0, -49, 19, 18); c.fill();
  // face mask: two eye lobes + muzzle
  c.fillStyle = blob(c, 5, -45, 13, p.face, p.faceLight);
  c.beginPath(); c.ellipse(-1, -50, 8, 8.5, 0, 0, Math.PI * 2); c.ellipse(10, -50, 8, 8.5, 0, 0, Math.PI * 2); c.fill();
  ell(c, 5, -40, 13, 9); c.fill();
  // blush
  c.fillStyle = 'rgba(255,110,120,.45)'; ell(c, -5, -39, 3.8, 2.6); c.fill(); ell(c, 16, -39, 3.8, 2.6); c.fill();
  // eyes
  const lx = expr === 'angry' ? 1.2 : 0.6, ly = expr === 'angry' ? 0.2 : -1.6;
  c.fillStyle = '#ffffff'; ell(c, -1, -51, 5.6, 6.6); c.fill(); ell(c, 10, -51, 5.6, 6.6); c.fill();
  c.fillStyle = INK; ell(c, -1 + lx, -51 + ly, 3.4, 4); c.fill(); ell(c, 10 + lx, -51 + ly, 3.4, 4); c.fill();
  c.fillStyle = '#ffffff'; ell(c, 0.3 + lx, -52.6 + ly, 1.3, 1.3); c.fill(); ell(c, 11.3 + lx, -52.6 + ly, 1.3, 1.3); c.fill();
  ell(c, -1.8 + lx, -49.6 + ly, 0.6, 0.6); c.fill(); ell(c, 9.2 + lx, -49.6 + ly, 0.6, 0.6); c.fill();
  // brows
  c.strokeStyle = INK; c.lineWidth = 2.6;
  c.beginPath();
  if(expr === 'angry'){ c.moveTo(-6, -61); c.lineTo(4, -56.5); c.moveTo(16, -61); c.lineTo(7, -56.5); }
  else { c.moveTo(-5, -60); c.quadraticCurveTo(-1, -63, 3, -60.5); c.moveTo(7, -60.5); c.quadraticCurveTo(11, -63, 15, -60); }
  c.stroke();
  // nostrils
  c.fillStyle = mix(p.face, '#7a4a3a', 0.45); ell(c, 3, -44.5, 1, 0.8); c.fill(); ell(c, 7, -44.5, 1, 0.8); c.fill();
  // mouth
  if(expr === 'joy'){
    c.fillStyle = '#7a2230'; c.beginPath(); c.moveTo(-2, -41.5); c.quadraticCurveTo(5.5, -39.5, 13, -41.5); c.quadraticCurveTo(12, -31, 5.5, -31); c.quadraticCurveTo(-1, -31, -2, -41.5); c.fill();
    c.save(); c.clip(); c.fillStyle = '#ff6b81'; ell(c, 5.5, -31.5, 5.5, 3.5); c.fill(); c.fillStyle = '#ffffff'; rr(c, -2, -42.5, 15, 3.2, 1.2); c.fill(); c.restore();
  } else {
    c.fillStyle = '#ffffff'; rr(c, -1, -40.5, 13, 6, 2.5); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.6; rr(c, -1, -40.5, 13, 6, 2.5); c.stroke();
    c.beginPath(); c.moveTo(-1, -37.5); c.lineTo(12, -37.5); c.moveTo(3.5, -40.5); c.lineTo(3.5, -34.5); c.moveTo(7.5, -40.5); c.lineTo(7.5, -34.5); c.stroke();
    // sweat drop
    c.fillStyle = '#7fd8ff'; c.beginPath(); c.moveTo(-13, -68); c.quadraticCurveTo(-8, -60, -11, -57); c.quadraticCurveTo(-16, -56, -16, -60); c.quadraticCurveTo(-15, -64, -13, -68); c.fill();
    c.fillStyle = 'rgba(255,255,255,.8)'; ell(c, -13.5, -59.5, 1, 1.5); c.fill();
  }
}

/* ---------- sticks, axe, toucan, bananas ---------- */
function stick(c, kind){
  const defs = {
    bamboo:{ shaft:'#fff4dc', fl:'#ff5a5f' },
    rainbow:{ rainbow:true, fl:'#ffffff' },
    lava:{ shaft:'#ff7b39', fl:'#ffcf3f', glow:'rgba(255,120,50,.45)' },
    candy:{ shaft:'#ffffff', stripes:'#ff5a5f', fl:'#ff5a5f' },
    ice:{ shaft:'#c9f1ff', fl:'#4fc3f7', glow:'rgba(140,220,255,.5)' },
    purple:{ shaft:'#fff4dc', fl:'#6c5ce7' }
  };
  const d = defs[kind] || defs.bamboo;
  if(d.glow){ c.fillStyle = d.glow; ell(c, 24, 0, 46, 11); c.fill(); }
  if(d.rainbow){ const g = c.createLinearGradient(-16, 0, 64, 0); ['#ff5a5f', '#ffcf3f', '#3ddc6f', '#23c9c0', '#6c5ce7'].forEach((col, i) => g.addColorStop(i / 4, col)); c.fillStyle = g; }
  else c.fillStyle = d.shaft;
  rr(c, -16, -4, 80, 8, 4); c.fill();
  if(d.stripes){ c.save(); rr(c, -16, -4, 80, 8, 4); c.clip(); c.fillStyle = d.stripes;
    for(let x = -22; x < 70; x += 13){ c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 6, 4); c.lineTo(x + 12, -4); c.lineTo(x + 6, -4); c.closePath(); c.fill(); } c.restore(); }
  c.fillStyle = 'rgba(255,255,255,.55)'; rr(c, -14, -3, 76, 2.2, 1.1); c.fill();
  c.fillStyle = 'rgba(36,48,86,.18)'; rr(c, -16, 1, 80, 3, 1.5); c.fill();
  c.fillStyle = d.fl;
  c.beginPath(); c.moveTo(46, -3); c.lineTo(68, -14); c.quadraticCurveTo(72, -6, 66, -2); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(46, 3); c.lineTo(68, 14); c.quadraticCurveTo(72, 6, 66, 2); c.closePath(); c.fill();
}
function axe(c){
  c.fillStyle = '#a0663a'; rr(c, -6, -4, 72, 8, 4); c.fill();
  c.fillStyle = '#ff5a5f'; rr(c, 2, -5, 9, 10, 3); c.fill();
  c.fillStyle = '#b8c6d6'; c.beginPath(); c.moveTo(-2, -9); c.lineTo(-22, -18); c.quadraticCurveTo(-30, 0, -22, 18); c.lineTo(-2, 9); c.closePath(); c.fill();
  c.fillStyle = '#eef4fa'; c.beginPath(); c.moveTo(-2, -9); c.lineTo(-22, -18); c.quadraticCurveTo(-26, -8, -24, -2); c.lineTo(-2, -2); c.closePath(); c.fill();
}
function toucan(c, flap){
  c.fillStyle = INK; c.beginPath(); c.moveTo(-14, -2); c.lineTo(-30, -8); c.lineTo(-28, 6); c.closePath(); c.fill();
  c.fillStyle = blob(c, 0, 0, 19, INK, '#3f5391'); ell(c, 0, 0, 19, 13); c.fill();
  c.fillStyle = '#fff4d6'; ell(c, 9, 3, 8, 8); c.fill();
  c.fillStyle = '#ff8a1f'; c.beginPath(); c.moveTo(11, -7); c.quadraticCurveTo(38, -10, 40, 2); c.quadraticCurveTo(26, 4, 12, 3); c.closePath(); c.fill();
  c.fillStyle = '#ffcf3f'; c.beginPath(); c.moveTo(11, -7); c.quadraticCurveTo(30, -9, 36, -4); c.lineTo(12, -2); c.closePath(); c.fill();
  c.fillStyle = '#ffffff'; ell(c, 9, -5, 4, 4); c.fill(); c.fillStyle = INK; ell(c, 10, -5, 2, 2.2); c.fill();
  c.fillStyle = '#4a5c96'; ell(c, -4, -9, 14, 6.5, -0.4 - flap); c.fill();
}
function banana(c, x, y, s, rot){
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#ffd84a'; c.beginPath(); c.moveTo(-11, -4); c.quadraticCurveTo(0, 15, 12, -5); c.quadraticCurveTo(0, 5, -11, -4); c.closePath(); c.fill();
  c.fillStyle = '#e0a800'; c.beginPath(); c.moveTo(-11, -4); c.quadraticCurveTo(0, 9, 12, -5); c.quadraticCurveTo(0, 15, -11, -4); c.closePath(); c.fill();
  c.fillStyle = '#6b4a1a'; ell(c, -11, -4, 1.6, 1.6); c.fill(); ell(c, 12, -5, 1.6, 1.6); c.fill();
  c.restore();
}
function smileBanana(c, x, y, L, rot){        // chunky crescent, tips at (+-L/2, 0), belly toward +y
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = '#e8a900'; c.beginPath(); c.moveTo(-L / 2, 0); c.quadraticCurveTo(0, L * 0.62, L / 2, 0); c.quadraticCurveTo(0, L * 0.2, -L / 2, 0); c.fill();
  c.fillStyle = '#ffd84a'; c.beginPath(); c.moveTo(-L / 2, 0); c.quadraticCurveTo(0, L * 0.5, L / 2, 0); c.quadraticCurveTo(0, L * 0.2, -L / 2, 0); c.fill();
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(-L * 0.3, L * 0.1); c.quadraticCurveTo(0, L * 0.3, L * 0.3, L * 0.1); c.quadraticCurveTo(0, L * 0.22, -L * 0.3, L * 0.1); c.fill();
  c.fillStyle = '#6b4a1a'; ell(c, -L / 2, 0, L * 0.05, L * 0.05); c.fill(); ell(c, L / 2, 0, L * 0.05, L * 0.05); c.fill();
  c.restore();
}
function bunch(c){
  smileBanana(c, -13, -8, 34, 1.9); smileBanana(c, 13, -8, 34, -1.9 + Math.PI);
  smileBanana(c, -6, -12, 36, 1.75); smileBanana(c, 6, -12, 36, -1.75 + Math.PI);
  c.fillStyle = '#6a9a2e'; rr(c, -5, -34, 10, 14, 5); c.fill();
  c.fillStyle = '#4f7d22'; ell(c, 0, -24, 9, 6); c.fill();
}
const COIN_PATH = 'M10 10c-1 7 3 12 12 11 1 0 1-1.2.3-1.6C16 18 13 15 12.4 10c-.2-1-2.2-1-2.4 0z';
function coin(c){
  c.translate(-16, -16);
  circ(c, 16, 17, 15, '#d69a00'); circ(c, 16, 16, 15, '#ffcf3f'); circ(c, 16, 16, 11, '#ffe27a');
  c.fillStyle = '#e0a800'; c.fill(new Path2D(COIN_PATH));
  c.fillStyle = 'rgba(255,255,255,.75)'; ell(c, 10.5, 9, 3.5, 2, -0.6); c.fill();
}
function sparkle(c, x, y, r, col){
  c.save(); c.translate(x, y); c.fillStyle = col || '#ffffff';
  c.beginPath(); c.moveTo(0, -r); c.quadraticCurveTo(r * 0.14, -r * 0.14, r, 0); c.quadraticCurveTo(r * 0.14, r * 0.14, 0, r); c.quadraticCurveTo(-r * 0.14, r * 0.14, -r, 0); c.quadraticCurveTo(-r * 0.14, -r * 0.14, 0, -r); c.fill();
  c.restore();
}

/* ---------- scenery ---------- */
function sky(c, W, H, sunX, sunY, rayR){
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#12aeb4'); g.addColorStop(0.45, '#3fd3c2'); g.addColorStop(0.8, '#bff3b4'); g.addColorStop(1, '#e6ffc2');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // sunburst
  c.save(); c.translate(sunX, sunY);
  const rg = c.createRadialGradient(0, 0, 0, 0, 0, rayR);
  rg.addColorStop(0, 'rgba(255,255,235,.5)'); rg.addColorStop(0.55, 'rgba(255,255,235,.2)'); rg.addColorStop(1, 'rgba(255,255,235,0)');
  c.fillStyle = rg;
  for(let k = 0; k < 16; k++){ c.rotate(Math.PI / 8); c.beginPath(); c.moveTo(0, 0); c.lineTo(-rayR * 0.13, -rayR); c.lineTo(rayR * 0.13, -rayR); c.closePath(); c.fill(); }
  c.restore();
  const glow = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, rayR * 0.45);
  glow.addColorStop(0, 'rgba(255,253,225,.95)'); glow.addColorStop(0.25, 'rgba(255,250,210,.55)'); glow.addColorStop(1, 'rgba(255,250,210,0)');
  c.fillStyle = glow; c.fillRect(0, 0, W, H);
}
function cloud(c, x, y, w, a){
  c.fillStyle = 'rgba(255,255,255,' + a + ')';
  rr(c, x - w * 0.7, y, w * 1.4, w * 0.3, w * 0.15); c.fill();
  c.beginPath(); c.arc(x - w * 0.3, y + w * 0.03, w * 0.28, 0, 7); c.arc(x + w * 0.1, y - w * 0.06, w * 0.38, 0, 7); c.fill();
  c.beginPath(); c.arc(x + w * 0.45, y + w * 0.05, w * 0.24, 0, 7); c.fill();
}
function hills(c, W, base, h, col, seed, f){
  c.fillStyle = col; c.beginPath(); c.moveTo(-20, base + 2000);
  for(let x = -20; x <= W + 20; x += 8){
    const y = base - h * (0.45 + 0.3 * Math.sin(x * 0.006 / f + seed) + 0.15 * Math.sin(x * 0.017 / f + seed * 3) + 0.08 * Math.sin(x * 0.041 / f + seed));
    c.lineTo(x, y);
  }
  c.lineTo(W + 20, base + 2000); c.closePath(); c.fill();
}
function canopy(c, W, base, h, col, seed, step){
  c.fillStyle = col; c.fillRect(-10, base - h * 0.4, W + 20, 3000);
  for(let x = -60, i = 0; x < W + 80; x += step, i++){
    const r = h * (0.32 + 0.3 * hash(i + seed));
    circ(c, x + hash(i * 3 + seed) * step * 0.4, base - h * 0.4 - r * 0.25, r, col);
  }
}
function palm(c, x, base, h, lean, col, u){
  c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round';
  c.lineWidth = 9 * u; c.beginPath(); c.moveTo(x, base);
  const tx = x + lean, ty = base - h;
  c.quadraticCurveTo(x + lean * 0.2, base - h * 0.55, tx, ty); c.stroke();
  for(let k = 0; k < 7; k++){
    const a = -Math.PI / 2 + (k - 3) * 0.55, len = (62 + (k % 2) * 14) * u;
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.5 + 30 * u;
    const mx = tx + Math.cos(a) * len * 0.55, my = ty + Math.sin(a) * len * 0.7 - 12 * u;
    c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my - 6 * u, ex, ey); c.quadraticCurveTo(mx, my + 8 * u, tx, ty); c.fill();
  }
  circ(c, tx, ty + 4 * u, 8 * u, col);
}
function leaf(c, x, y, len, wid, rot, col, vein){
  c.save(); c.translate(x, y); c.rotate(rot);
  const g = c.createLinearGradient(0, -wid, 0, wid); g.addColorStop(0, mix(col, '#ffffff', 0.18)); g.addColorStop(1, mix(col, '#000000', 0.25));
  c.fillStyle = g;
  c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(len * 0.3, -wid, len * 0.75, -wid * 0.9, len, 0); c.bezierCurveTo(len * 0.75, wid * 0.9, len * 0.3, wid, 0, 0); c.fill();
  c.strokeStyle = vein || 'rgba(255,255,255,.25)'; c.lineWidth = Math.max(2, wid * 0.08); c.lineCap = 'round';
  c.beginPath(); c.moveTo(len * 0.04, 0); c.quadraticCurveTo(len * 0.5, -wid * 0.08, len * 0.94, 0); c.stroke();
  c.lineWidth = Math.max(1.5, wid * 0.05);
  for(let k = 1; k < 6; k++){ const t = k / 6.5; c.beginPath(); c.moveTo(len * t, 0); c.lineTo(len * (t + 0.1), -wid * 0.55 * Math.sin(Math.PI * t)); c.moveTo(len * t, 0); c.lineTo(len * (t + 0.1), wid * 0.55 * Math.sin(Math.PI * t)); c.stroke(); }
  c.restore();
}
function fern(c, x, y, rot, s, col){           // a cluster of leaves fanning out from one point
  for(let k = 0; k < 5; k++) leaf(c, x, y, (230 + 60 * hash(k + s)) * s, (62 + 10 * hash(k * 3)) * s, rot + (k - 2) * 0.32, mix(col, '#0b3d22', 0.12 * (k % 2)));
}
function vine(c, x, top, len, u, col, sway){
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 5 * u; c.lineCap = 'round';
  c.beginPath();
  for(let t = 0; t <= len; t += 8){ const xx = x + Math.sin(t * 0.012 + sway) * 14 * u; t ? c.lineTo(xx, top + t) : c.moveTo(xx, top); }
  c.stroke();
  for(let t = 24; t < len; t += 40 * u){
    const xx = x + Math.sin(t * 0.012 + sway) * 14 * u, dir = Math.round(t / (40 * u)) % 2 ? 1 : -1;
    ell(c, xx + dir * 13 * u, top + t, 15 * u, 6.5 * u, dir * 0.6); c.fill();
  }
}
function ground(c, W, H, gy, u){
  const dg = c.createLinearGradient(0, gy, 0, H);
  dg.addColorStop(0, TEAL.dirt); dg.addColorStop(1, mix(TEAL.dirt2, '#3a2412', 0.4));
  c.fillStyle = dg; c.fillRect(0, gy + 14 * u, W, H - gy + 40);
  c.fillStyle = TEAL.dirt2; for(let x = 30 * u, i = 0; x < W; x += 90 * u, i++){ rr(c, x + hash(i) * 40 * u, gy + 50 * u + hash(i + 9) * 100 * u, (26 + hash(i + 3) * 18) * u, 11 * u, 5.5 * u); c.fill(); }
  c.fillStyle = TEAL.grass; rr(c, -10, gy - 10 * u, W + 20, 34 * u, 14 * u); c.fill();
  c.beginPath();
  for(let x = -6, i = 0; x < W + 10; x += 13 * u, i++){ const h = (7 + hash(i + 200) * 11) * u; c.moveTo(x, gy - 5 * u); c.lineTo(x + 5 * u, gy - 5 * u - h); c.lineTo(x + 10 * u, gy - 5 * u); }
  c.fill();
  c.fillStyle = 'rgba(255,255,255,.22)'; rr(c, -10, gy - 10 * u, W + 20, 8 * u, 4 * u); c.fill();
}
function bush(c, x, gy, r, col){ circ(c, x, gy - 4, r, col); circ(c, x + r * 0.85, gy, r * 0.75, col); circ(c, x - r * 0.85, gy + 2, r * 0.7, col); circ(c, x + r * 0.2, gy - r * 0.55, r * 0.6, mix(col, '#ffffff', 0.1)); }
function flower(c, x, y, s, col){ for(let k = 0; k < 5; k++){ const a = k * 1.2566; circ(c, x + Math.cos(a) * 5 * s, y + Math.sin(a) * 5 * s, 3.8 * s, col); } circ(c, x, y, 3 * s, '#ff9f1c'); }

/* trunk: cx, width, top & bottom in px, block height; blocks[i] optional type overrides from the bottom */
function trunk(c, cx, w, top, bottom, bh, types){
  const FL = cx - w / 2, FR = cx + w / 2, s = w / 150;
  c.save(); c.beginPath(); c.rect(FL - 2, top, w + 4, bottom - top + 2); c.clip();
  c.fillStyle = '#7a3f1d'; c.fillRect(FL, top, w, bottom - top);
  let i = 0;
  for(let y = bottom; y > top - bh; y -= bh, i++){
    const by = y - bh, t = (types && types[i]) || 'bark';
    c.fillStyle = i % 2 ? '#c7773f' : '#b96b37'; rr(c, FL + 3 * s, by + 2 * s, w - 6 * s, bh - 4 * s, 12 * s); c.fill();
    c.fillStyle = 'rgba(255,255,255,.14)'; rr(c, FL + 9 * s, by + 7 * s, 13 * s, bh - 14 * s, 6.5 * s); c.fill();
    c.fillStyle = 'rgba(0,0,0,.10)'; rr(c, FR - 28 * s, by + 2 * s, 25 * s, bh - 4 * s, 9 * s); c.fill();
    c.strokeStyle = 'rgba(110,55,25,.28)'; c.lineWidth = 2.4 * s; c.lineCap = 'round';
    c.beginPath(); const gx = FL + (40 + hash(i) * 50) * s; c.moveTo(gx, by + 14 * s); c.quadraticCurveTo(gx + 6 * s, by + bh / 2, gx - 2 * s, by + bh - 14 * s); c.stroke();
    const hz = cx - 18 * s;
    if(t === 'stone'){
      c.fillStyle = '#8e9db0'; rr(c, hz, by + 2 * s, FR - hz + 6 * s, bh - 4 * s, 13 * s); c.fill();
      c.fillStyle = '#b8c6d6'; rr(c, hz, by + 2 * s, FR - hz + 6 * s, bh - 13 * s, 13 * s); c.fill();
      c.fillStyle = 'rgba(255,255,255,.6)'; rr(c, hz + 9 * s, by + 9 * s, 32 * s, 7 * s, 3.5 * s); c.fill();
    } else if(t === 'rot'){
      c.fillStyle = '#e8b889'; rr(c, hz, by + 2 * s, FR - hz, bh - 4 * s, 11 * s); c.fill();
      c.strokeStyle = '#a8703f'; c.lineWidth = 3 * s; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(hz + 14 * s, by + 10 * s); c.lineTo(hz + 30 * s, by + 26 * s); c.lineTo(hz + 22 * s, by + 38 * s); c.lineTo(hz + 40 * s, by + 52 * s);
      c.moveTo(hz + 30 * s, by + 26 * s); c.lineTo(hz + 52 * s, by + 22 * s); c.stroke();
    }
  }
  // trunk side shading
  const sg = c.createLinearGradient(FL, 0, FR, 0);
  sg.addColorStop(0, 'rgba(255,240,200,.12)'); sg.addColorStop(0.5, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(40,10,0,.18)');
  c.fillStyle = sg; c.fillRect(FL, top, w, bottom - top);
  c.restore();
  // roots
  c.fillStyle = '#8a4a24';
  c.beginPath(); c.moveTo(FL - 34 * s, bottom + 8 * s); c.quadraticCurveTo(FL, bottom, FL + 4 * s, bottom - 44 * s); c.lineTo(FL + 22 * s, bottom + 8 * s); c.fill();
  c.beginPath(); c.moveTo(FR + 34 * s, bottom + 8 * s); c.quadraticCurveTo(FR, bottom, FR - 4 * s, bottom - 44 * s); c.lineTo(FR - 22 * s, bottom + 8 * s); c.fill();
  return { FL, FR };
}
function crown(c, cx, top, s){
  const cols = ['#2fae62', '#3fc573', '#5ad487'];
  [[-150,-70,68],[150,-66,70],[-70,-150,80],[80,-156,84],[0,-215,86],[0,-100,78],[-220,-20,50],[220,-24,52]].forEach(([dx, dy, r], k) => {
    c.fillStyle = blob(c, cx + dx * s, top + dy * s, r * s, cols[k % 3], '#8ff0ad'); c.beginPath(); c.arc(cx + dx * s, top + dy * s, r * s, 0, 7); c.fill();
  });
  c.fillStyle = '#e39a52'; rr(c, cx - 145 * s, top - 4 * s, 290 * s, 18 * s, 9 * s); c.fill();
  c.fillStyle = '#c47a36'; rr(c, cx - 145 * s, top + 6 * s, 290 * s, 8 * s, 4 * s); c.fill();
}
function speedLines(c, x0, y, x1, n, spread, u){
  for(let k = 0; k < n; k++){
    const yy = y + (k - (n - 1) / 2) * spread, len = (x1 - x0) * (0.55 + 0.45 * hash(k + 7)), xs = x0 + (x1 - x0 - len) * hash(k + 3) * 0.3;
    const g = c.createLinearGradient(xs, 0, xs + len, 0); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; rr(c, xs, yy - 3 * u, len, 6 * u, 3 * u); c.fill();
  }
}
function vignette(c, W, H, a){
  const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62);
  g.addColorStop(0, 'rgba(10,40,40,0)'); g.addColorStop(1, 'rgba(10,40,40,' + a + ')');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

/* ---------- title (matches the in-game logo: white "Jungle", gold "Ladder", Fredoka, heavy ink outline) ---------- */
function titleLine(c, txt, x, y, size, top, bot){
  c.font = '700 ' + size + 'px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
  const depth = size * 0.075, sw = size * 0.2;
  // soft drop shadow
  c.save(); c.shadowColor = 'rgba(10,30,50,.45)'; c.shadowBlur = size * 0.18; c.shadowOffsetY = size * 0.1;
  c.lineWidth = sw; c.strokeStyle = INK; c.strokeText(txt, x, y + depth); c.restore();
  // 3D extrude
  for(let d = depth; d > 0; d -= 1.5){ c.lineWidth = sw; c.strokeStyle = INK; c.strokeText(txt, x, y + d); c.fillStyle = INK; c.fillText(txt, x, y + d); }
  c.lineWidth = sw; c.strokeStyle = INK; c.strokeText(txt, x, y);
  const g = c.createLinearGradient(0, y - size * 0.75, 0, y + size * 0.05);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillText(txt, x, y);
  // glossy top highlight
  c.save(); c.beginPath(); c.rect(x - size * 4, y - size * 0.8, size * 8, size * 0.36); c.clip();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillText(txt, x, y); c.restore();
}
function title(c, x, y, size, rot){
  c.save(); c.translate(x, y); c.rotate(rot || -0.07);
  titleLine(c, 'Jungle', -size * 0.12, -size * 0.12, size, '#ffffff', '#d9f3ff');
  titleLine(c, 'Ladder', size * 0.1, size * 0.86, size * 1.15, '#fff38a', '#ffb000');
  c.restore();
}
