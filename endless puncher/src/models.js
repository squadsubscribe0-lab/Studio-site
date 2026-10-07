import * as THREE from 'three';

// ---------- shared geometry / helpers ----------
export const GEO = {
  torso: new THREE.CapsuleGeometry(0.3, 0.45, 4, 10),
  head: new THREE.SphereGeometry(0.3, 16, 12),
  limb: new THREE.CapsuleGeometry(0.11, 0.5, 3, 8),
  shoulder: new THREE.SphereGeometry(0.14, 10, 8),
  glove: new THREE.SphereGeometry(0.24, 14, 10),
  cuff: new THREE.CylinderGeometry(0.16, 0.19, 0.16, 12),
  armTube: new THREE.CylinderGeometry(0.085, 0.085, 1, 8, 1, true).translate(0, 0.5, 0),
  eye: new THREE.SphereGeometry(0.055, 8, 6),
  gem: new THREE.OctahedronGeometry(0.2, 0),
  coin: new THREE.CylinderGeometry(0.2, 0.2, 0.06, 14),
  spark: new THREE.TetrahedronGeometry(0.12, 0),
  rock: new THREE.SphereGeometry(0.22, 7, 5),
  helmet: new THREE.SphereGeometry(0.34, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
  belt: new THREE.TorusGeometry(0.31, 0.06, 6, 18),
  shoe: new THREE.BoxGeometry(0.22, 0.14, 0.34),
  headband: new THREE.TorusGeometry(0.3, 0.05, 6, 18),
  crown: new THREE.CylinderGeometry(0.28, 0.22, 0.22, 6, 1, true),
  plane: new THREE.PlaneGeometry(1, 1),
};

const matCache = new Map();
export function lambert(color, opts = {}) {
  const { unique, ...rest } = opts;
  const key = color + JSON.stringify(rest);
  if (!unique && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshLambertMaterial({ color, ...rest });
  if (!unique) matCache.set(key, m);
  return m;
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const shadowTex = canvasTex(64, 64, (g, w, h) => {
  const grd = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
});
const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });

export function blobShadow(size = 1.2) {
  const m = new THREE.Mesh(GEO.plane, shadowMat);
  m.rotation.x = -Math.PI / 2;
  m.scale.set(size, size, 1);
  m.position.y = 0.02;
  m.renderOrder = 1;
  return m;
}

// ---------- characters ----------
// Builds a rounded stick-figure brawler. Returns the root plus handles for animation.
export function buildFighter({ color = '#e8343f', player = false, uniqueMat = false } = {}) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const mat = uniqueMat ? new THREE.MeshLambertMaterial({ color }) : lambert(color);

  const torso = new THREE.Mesh(GEO.torso, mat);
  torso.position.y = 1.25;
  body.add(torso);

  const head = new THREE.Mesh(GEO.head, mat);
  head.position.y = 1.95;
  body.add(head);

  const eyeMat = lambert('#ffffff');
  const pupilMat = lambert('#111418');
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(GEO.eye, player ? eyeMat : pupilMat);
    e.position.set(0.11 * sx, 1.99, 0.26);
    e.scale.set(player ? 1.2 : 0.9, player ? 1.5 : 1.2, 0.6);
    body.add(e);
  }

  const legs = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(0.15 * sx, 0.88, 0);
    const leg = new THREE.Mesh(GEO.limb, mat);
    leg.position.y = -0.4;
    pivot.add(leg);
    body.add(pivot);
    legs.push(pivot);
  }

  const shoulders = [];
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Mesh(GEO.shoulder, mat);
    sh.position.set(0.36 * sx, 1.52, 0);
    body.add(sh);
    shoulders.push(sh);
    if (!player) {
      const pivot = new THREE.Group();
      pivot.position.copy(sh.position);
      const arm = new THREE.Mesh(GEO.limb, mat);
      arm.position.y = -0.35;
      pivot.add(arm);
      pivot.rotation.x = -0.6;
      body.add(pivot);
      arms.push(pivot);
    }
  }

  const shadow = blobShadow(player ? 1.6 : 1.3);
  root.add(shadow);

  return { root, body, torso, head, legs, arms, shoulders, mat, shadow };
}

// Player extras: headband + gear pieces that recolor with equipped rarity.
export function dressPlayer(f) {
  const band = new THREE.Mesh(GEO.headband, lambert('#ff7a1a', { unique: true }));
  band.position.y = 2.03; band.rotation.x = Math.PI / 2;
  f.body.add(band);

  const helmet = new THREE.Mesh(GEO.helmet, lambert('#9aa4b5', { unique: true }));
  helmet.position.y = 1.98;
  f.body.add(helmet);

  const belt = new THREE.Mesh(GEO.belt, lambert('#9aa4b5', { unique: true }));
  belt.position.y = 0.98; belt.rotation.x = Math.PI / 2;
  f.body.add(belt);

  const armor = new THREE.Mesh(new THREE.CapsuleGeometry(0.33, 0.25, 4, 10), lambert('#9aa4b5', { unique: true }));
  armor.position.y = 1.35;
  f.body.add(armor);

  const shoes = [];
  const pants = [];
  for (const leg of f.legs) {
    const s = new THREE.Mesh(GEO.shoe, lambert('#9aa4b5', { unique: true }));
    s.position.set(0, -0.78, 0.06);
    leg.add(s); shoes.push(s);
    const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.28, 3, 8), lambert('#9aa4b5', { unique: true }));
    p.position.y = -0.2;
    leg.add(p); pants.push(p);
  }
  f.gear = { helmet, belt, armor, shoes, pants, band };
  return f;
}

export function buildGlove(color = '#e23') {
  const g = new THREE.Group();
  const ball = new THREE.Mesh(GEO.glove, lambert(color, { unique: true }));
  ball.scale.set(1, 0.95, 1.15);
  g.add(ball);
  const cuff = new THREE.Mesh(GEO.cuff, lambert('#f4f4f4'));
  cuff.rotation.x = Math.PI / 2;
  cuff.position.z = -0.22;
  g.add(cuff);
  g.userData.ball = ball;
  return g;
}

export function addCrown(f) {
  const c = new THREE.Mesh(GEO.crown, lambert('#ffcc33', { emissive: '#553300' }));
  c.position.y = 2.32;
  f.body.add(c);
  return c;
}

// ---------- pets: elemental slimes ----------
// Teardrop jelly body (lathe profile), translucent shell with a darker core,
// big glossy eyes and one element-specific topper.
const SLIME_PROFILE = [
  [0, 0], [0.28, 0], [0.4, 0.03], [0.46, 0.1], [0.47, 0.2], [0.44, 0.31],
  [0.37, 0.43], [0.27, 0.54], [0.17, 0.63], [0.08, 0.71], [0.03, 0.77], [0, 0.8],
].map(([x, y]) => new THREE.Vector2(x, y));
const SLIME_GEO = new THREE.LatheGeometry(SLIME_PROFILE, 28);
const SLIME_CORE_GEO = new THREE.LatheGeometry(SLIME_PROFILE.map(v => new THREE.Vector2(v.x * 0.62, v.y * 0.62)), 20);
const SLIME_EYE = new THREE.SphereGeometry(0.1, 14, 10);
const SLIME_PUPIL = new THREE.SphereGeometry(0.06, 12, 8);
const SLIME_GLINT = new THREE.SphereGeometry(0.022, 8, 6);
const SLIME_CHEEK = new THREE.CircleGeometry(0.05, 12);
const SLIME_MOUTH = new THREE.TorusGeometry(0.045, 0.013, 6, 14, Math.PI);

function glow(color, intensity = 0.8) {
  return new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: intensity });
}

// Adds the element topper to the slime and returns per-frame animation callbacks.
function slimeTopper(element, g) {
  const anim = [];
  const add = (mesh, x, y, z) => { mesh.position.set(x, y, z); g.add(mesh); return mesh; };
  switch (element) {
    case 'water': {
      const drop = add(new THREE.Mesh(new THREE.LatheGeometry(SLIME_PROFILE, 16), new THREE.MeshPhongMaterial({ color: '#bfefff', transparent: true, opacity: 0.85, shininess: 120 })), 0, 0.84, 0);
      drop.scale.setScalar(0.28);
      anim.push((t) => { drop.position.y = 0.84 + Math.sin(t * 4) * 0.03; });
      break;
    }
    case 'rock': {
      const mat = lambert('#7c7f8c');
      [[-0.14, 0.62, 0.05, 0.11], [0.12, 0.66, -0.02, 0.13], [0, 0.78, 0, 0.09]].forEach(([x, y, z, r]) => {
        const m = add(new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), mat), x, y, z);
        m.rotation.set(x * 5, y * 3, z);
      });
      break;
    }
    case 'leaf': {
      const leafMat = lambert('#3fae2a');
      const stem = add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.16, 6), lambert('#2f7a1f')), 0, 0.86, 0);
      stem.rotation.z = 0.1;
      for (const sx of [-1, 1]) {
        const leaf = add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 6), leafMat), 0.11 * sx, 0.95, 0);
        leaf.scale.set(1, 0.3, 0.55);
        anim.push((t) => { leaf.rotation.z = sx * (0.5 + Math.sin(t * 3) * 0.12); });
      }
      break;
    }
    case 'fire': {
      [['#ff5a1a', 0.26, 0, 0], ['#ffb02e', 0.19, -0.1, 0.03], ['#ffe066', 0.13, 0.09, 0.04]].forEach(([c, h, x, z], k) => {
        const f = add(new THREE.Mesh(new THREE.ConeGeometry(0.08 + h * 0.2, h, 8), glow(c, 0.9)), x, 0.74 + h / 2, z);
        anim.push((t) => { f.scale.y = 1 + Math.sin(t * 14 + k * 2) * 0.18; f.rotation.z = Math.sin(t * 9 + k) * 0.15; });
      });
      break;
    }
    case 'ice': {
      const mat = new THREE.MeshPhongMaterial({ color: '#e4fbff', emissive: '#4fb8e6', emissiveIntensity: 0.35, shininess: 140, transparent: true, opacity: 0.92 });
      [[-0.12, 0.68, -0.35, 1.6], [0.02, 0.82, 0, 2.2], [0.14, 0.68, 0.4, 1.5]].forEach(([x, y, rz, sy]) => {
        const c = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), mat), x, y, 0);
        c.scale.set(1, sy, 1);
        c.rotation.z = rz;
      });
      break;
    }
    case 'spark': {
      const zig = new THREE.Shape();
      zig.moveTo(0, 0); zig.lineTo(0.06, 0.1); zig.lineTo(0.01, 0.1); zig.lineTo(0.07, 0.22);
      zig.lineTo(-0.03, 0.08); zig.lineTo(0.02, 0.08); zig.lineTo(-0.03, 0);
      const bolt = add(new THREE.Mesh(new THREE.ExtrudeGeometry(zig, { depth: 0.03, bevelEnabled: false }), glow('#fff27a', 0.9)), -0.02, 0.76, -0.015);
      const ball = add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), glow('#ffffff', 1)), 0.05, 1.0, 0);
      anim.push((t) => { ball.scale.setScalar(0.8 + Math.abs(Math.sin(t * 12)) * 0.5); bolt.rotation.y = Math.sin(t * 6) * 0.3; });
      break;
    }
    case 'poison': {
      const mat = new THREE.MeshPhongMaterial({ color: '#8dff5a', emissive: '#2a8a10', transparent: true, opacity: 0.85, shininess: 100 });
      const bubbles = [0, 1, 2].map(k => add(new THREE.Mesh(new THREE.SphereGeometry(0.035 + k * 0.012, 10, 8), mat), 0, 0.8, 0));
      anim.push((t) => bubbles.forEach((b, k) => {
        const p = (t * 0.6 + k / 3) % 1;
        b.position.set(Math.sin(k * 2.1) * 0.12, 0.78 + p * 0.35, Math.cos(k * 2.1) * 0.08);
        b.scale.setScalar(1 - p * 0.6);
      }));
      break;
    }
    case 'bubble': {
      const bowMat = lambert('#ffffff');
      for (const sx of [-1, 1]) {
        const loop = add(new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), bowMat), 0.09 * sx, 0.72, 0.02);
        loop.rotation.z = sx * Math.PI / 2;
      }
      add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), bowMat), 0, 0.72, 0.03);
      break;
    }
    case 'cosmic': {
      const ring = add(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 8, 40), glow('#c9b8ff', 0.5)), 0, 0.3, 0);
      ring.rotation.set(Math.PI / 2 - 0.35, 0, 0.25);
      const stars = [0, 1, 2].map(() => add(new THREE.Mesh(new THREE.OctahedronGeometry(0.04, 0), glow('#fff6a8', 1)), 0, 0.5, 0));
      anim.push((t) => {
        ring.rotation.z = 0.25 + t * 0.8;
        stars.forEach((st, k) => {
          const a = t * 1.5 + k * 2.1;
          st.position.set(Math.cos(a) * 0.55, 0.45 + Math.sin(a * 1.3) * 0.2, Math.sin(a) * 0.4);
          st.rotation.y = t * 4;
        });
      });
      break;
    }
    case 'lava': {
      const crust = lambert('#3a2626');
      [[-0.15, 0.58, 0.18, 0.1], [0.16, 0.6, 0.12, 0.09], [0, 0.74, 0.02, 0.1]].forEach(([x, y, z, r]) => add(new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), crust), x, y, z));
      const puff = add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glow('#ffb347', 1)), 0, 0.9, 0);
      anim.push((t) => { const p = (t * 0.8) % 1; puff.position.y = 0.85 + p * 0.3; puff.scale.setScalar(Math.max(0.01, 1 - p)); });
      break;
    }
    case 'gold': {
      const goldMat = new THREE.MeshPhongMaterial({ color: '#ffd23f', emissive: '#6b4a00', shininess: 120, side: THREE.DoubleSide });
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.12, 8, 1, true), goldMat), 0, 0.76, 0);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2;
        add(new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), goldMat), Math.cos(a) * 0.14, 0.86, Math.sin(a) * 0.14);
      }
      add(new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), glow('#ff3b5c', 0.6)), 0, 0.78, 0.15);
      break;
    }
    case 'void': {
      const hornMat = lambert('#1c1030');
      for (const sx of [-1, 1]) {
        const h = add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 8), hornMat), 0.17 * sx, 0.68, 0);
        h.rotation.z = -sx * 0.55;
      }
      const halo = add(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 6, 24), glow('#d06bff', 1)), 0, 0.98, 0);
      halo.rotation.x = Math.PI / 2;
      anim.push((t) => { halo.position.y = 0.98 + Math.sin(t * 3) * 0.04; });
      break;
    }
  }
  return anim;
}

// Superhero outfit: flowing cape, eye-mask band and a chest emblem in the element color.
const MASK_PROFILE = [[0.468, 0.235], [0.46, 0.27], [0.448, 0.31], [0.43, 0.35], [0.41, 0.375]]
  .map(([x, y]) => new THREE.Vector2(x * 1.035, y));
const MASK_GEO = new THREE.LatheGeometry(MASK_PROFILE, 18, -1.25, 2.5);
const EMBLEM_GEO = new THREE.CircleGeometry(0.085, 20);
const EMBLEM_RIM_GEO = new THREE.RingGeometry(0.085, 0.108, 20);

// Cape cloth: a small verlet sheet simulated in world space. The top row is pinned to the
// collar; the rest swings with gravity, inertia from hops/moves, a gentle breeze, and is kept
// outside the slime's body and above the floor.
const CLOTH_COLS = 7;
const CLOTH_ROWS = 9;
const CT = new THREE.Vector3();
const CM = new THREE.Matrix4();

function makeCapeCloth(g, mat) {
  const C = CLOTH_COLS, R = CLOTH_ROWS, n = C * R;
  const rest = [];
  for (let r = 0; r < R; r++) {
    const k = r / (R - 1);
    const rad = 0.215 + k * 0.3;   // hugs the slime's narrow top, flares toward the base
    const y = 0.6 - k * 0.56;
    for (let c = 0; c < C; c++) {
      const a = Math.PI + (c / (C - 1) - 0.5) * 1.75;
      rest.push(new THREE.Vector3(Math.sin(a) * rad, y, Math.cos(a) * rad));
    }
  }
  const pos = new Float32Array(n * 3);
  rest.forEach((v, i) => v.toArray(pos, i * 3));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const index = [];
  for (let r = 0; r < R - 1; r++) {
    for (let c = 0; c < C - 1; c++) {
      const a = r * C + c, b = a + 1, d = a + C, e = d + 1;
      index.push(a, d, b, b, d, e);
    }
  }
  geo.setIndex(index);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  g.add(mesh);

  // Structural + shear links with their rest lengths (body space).
  const links = [];
  const link = (i, j) => links.push([i, j, rest[i].distanceTo(rest[j])]);
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const i = r * C + c;
      if (c < C - 1) link(i, i + 1);
      if (r < R - 1) link(i, i + C);
      if (r < R - 1 && c < C - 1) { link(i, i + C + 1); link(i + 1, i + C); }
    }
  }

  const P = rest.map(v => v.clone());
  const Q = rest.map(v => v.clone());
  const center = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const rootPos = new THREE.Vector3();
  let ready = false;
  let time = Math.random() * 10;

  function step(dt) {
    if (!(dt > 0)) return;
    dt = Math.min(dt, 1 / 30);
    g.updateWorldMatrix(true, false);
    const M = g.matrixWorld;
    // Cloth size follows the pet's fixed scale, not the body's hop squash/stretch.
    (g.parent || g).getWorldScale(scale);
    const s = scale.x;
    if (!ready) {
      for (let i = 0; i < n; i++) { P[i].copy(rest[i]).applyMatrix4(M); Q[i].copy(P[i]); }
      ready = true;
    }
    time += dt;
    const dt2 = dt * dt;
    const grav = -14 * s * dt2;
    const windX = Math.sin(time * 1.9) * 1.2 * s * dt2;
    const windZ = Math.cos(time * 1.4) * 1.2 * s * dt2;

    // Integrate free particles (verlet with air drag). A per-particle flutter term makes
    // the fabric ripple instead of moving as one flat sheet.
    for (let i = C; i < n; i++) {
      const p = P[i], q = Q[i];
      const row = (i / C) | 0, col = i % C;
      const w = row / (R - 1);
      const vx = (p.x - q.x) * 0.95, vy = (p.y - q.y) * 0.95, vz = (p.z - q.z) * 0.95;
      const speed = Math.min(1, Math.hypot(vx, vz) / (0.04 * s));
      const flutter = Math.sin(time * 11 + row * 0.9 + col * 1.3) * (0.6 + speed * 2.2) * s * dt2 * w;
      q.copy(p);
      p.x += vx + windX * w + flutter;
      p.y += vy + grav + Math.cos(time * 9 + col * 1.1 + row * 0.7) * flutter * 0.8;
      p.z += vz + windZ * w - flutter;
    }
    // Pin the collar row.
    for (let c = 0; c < C; c++) { P[c].copy(rest[c]).applyMatrix4(M); Q[c].copy(P[c]); }

    center.set(0, 0.3, 0).applyMatrix4(M);
    const bodyR = 0.5 * s;
    const floorY = (g.parent ? g.parent.getWorldPosition(rootPos).y : 0) + 0.02;
    for (let it = 0; it < 4; it++) {
      for (const [i, j, len] of links) {
        const a = P[i], b = P[j];
        CT.subVectors(b, a);
        const d = CT.length() || 1e-6;
        const diff = (d - len * s) / d;
        const wa = i < C ? 0 : (j < C ? 1 : 0.5);
        const wb = j < C ? 0 : (i < C ? 1 : 0.5);
        a.addScaledVector(CT, diff * wa);
        b.addScaledVector(CT, -diff * wb);
      }
      for (let i = C; i < n; i++) {
        CT.subVectors(P[i], center);
        const d = CT.length();
        if (d < bodyR) P[i].addScaledVector(CT, (bodyR - d) / (d || 1));
        if (P[i].y < floorY) P[i].y = floorY;
      }
    }

    // Write back into body-local space for rendering.
    CM.copy(M).invert();
    for (let i = 0; i < n; i++) CT.copy(P[i]).applyMatrix4(CM).toArray(pos, i * 3);
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  }

  return { step, mesh, reset() { ready = false; } };
}

function dressSlime(g, costume, color) {
  const capeMat = new THREE.MeshLambertMaterial({ color: costume.cape, side: THREE.DoubleSide });
  const cloth = makeCapeCloth(g, capeMat);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.028, 6, 20, Math.PI * 1.1), capeMat);
  collar.rotation.set(Math.PI / 2, 0, Math.PI * 0.45);
  collar.position.y = 0.6;
  g.add(collar);

  const mask = new THREE.Mesh(MASK_GEO, new THREE.MeshLambertMaterial({ color: costume.mask, side: THREE.DoubleSide }));
  g.add(mask);

  const rim = new THREE.Mesh(EMBLEM_RIM_GEO, new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#5a3a00' }));
  const emblem = new THREE.Mesh(EMBLEM_GEO, new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.35 }));
  for (const m of [emblem, rim]) {
    m.position.set(0, 0.1, 0.472);
    m.rotation.x = -0.08;
    g.add(m);
  }
  return cloth;
}

export function buildPet(color, element = 'water', costume = null) {
  const root = new THREE.Group();
  const g = new THREE.Group();
  root.add(g);

  const base = new THREE.Color(color);
  const lava = element === 'lava';
  const shell = new THREE.MeshPhongMaterial({
    color: base, transparent: true, opacity: element === 'void' ? 0.95 : 0.82,
    shininess: 110, specular: new THREE.Color('#ffffff'),
    emissive: lava ? new THREE.Color('#ff3a0a') : base.clone().multiplyScalar(0.12),
    emissiveIntensity: lava ? 0.35 : 1,
  });
  const body = new THREE.Mesh(SLIME_GEO, shell);
  body.renderOrder = 2;
  g.add(body);

  // Darker (or glowing) core visible through the jelly.
  const core = lava || element === 'void'
    ? new THREE.Mesh(SLIME_CORE_GEO, glow(lava ? '#ffcf4a' : '#b04dff', 0.9))
    : new THREE.Mesh(SLIME_CORE_GEO, lambert('#' + base.clone().multiplyScalar(0.55).getHexString()));
  core.position.y = 0.04;
  g.add(core);

  const gloss = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 }));
  gloss.scale.set(0.6, 1.3, 0.35);
  gloss.position.set(-0.22, 0.42, 0.28);
  gloss.rotation.z = 0.5;
  g.add(gloss);

  const eyeWhite = lambert('#ffffff');
  const pupilMat = element === 'void' ? glow('#ffd84a', 1) : lambert('#1a1030');
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const cheekMat = new THREE.MeshBasicMaterial({ color: '#ff7aa8', transparent: true, opacity: 0.55 });
  const ez = costume ? 0.045 : 0; // eyes sit on top of the mask band
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(SLIME_EYE, eyeWhite);
    eye.scale.set(0.9, 1.15, 0.5);
    eye.position.set(0.13 * sx, 0.3, 0.39 + ez);
    g.add(eye);
    const pupil = new THREE.Mesh(SLIME_PUPIL, pupilMat);
    pupil.scale.set(0.9, 1.2, 0.5);
    pupil.position.set(0.13 * sx, 0.29, 0.44 + ez);
    g.add(pupil);
    const glint = new THREE.Mesh(SLIME_GLINT, glintMat);
    glint.position.set(0.13 * sx - 0.025, 0.33, 0.47 + ez);
    g.add(glint);
    const cheek = new THREE.Mesh(SLIME_CHEEK, cheekMat);
    cheek.position.set(0.25 * sx, 0.2, 0.39);
    cheek.rotation.y = sx * 0.55;
    g.add(cheek);
  }
  const mouth = new THREE.Mesh(SLIME_MOUTH, lambert('#1a1030'));
  mouth.position.set(0, 0.2, 0.44);
  mouth.rotation.z = Math.PI;
  g.add(mouth);

  const anim = slimeTopper(element, g);
  // Cape cloth is stepped by the owner each frame via root.userData.cloth.step(dt).
  if (costume) root.userData.cloth = dressSlime(g, costume, color);

  root.add(blobShadow(0.9));
  root.userData.body = g;
  root.userData.tick = (t) => anim.forEach(fn => fn(t));
  return root;
}

// ---------- arena ----------
function woodTexture(base) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const planks = 10;
    const ph = h / planks;
    for (let i = 0; i < planks; i++) {
      const shade = (Math.random() * 0.18 - 0.09);
      g.fillStyle = shade > 0 ? `rgba(255,230,190,${shade})` : `rgba(0,0,0,${-shade})`;
      g.fillRect(0, i * ph, w, ph);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fillRect(0, i * ph, w, 3);
      const off = Math.random() * w;
      g.fillRect(off, i * ph, 3, ph);
      for (let k = 0; k < 18; k++) {
        g.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.08})`;
        g.beginPath();
        const y = i * ph + Math.random() * ph;
        g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y + 2);
        g.stroke();
      }
    }
  });
}

function groundTexture() {
  const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#2b3347'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.06})`;
      const s = 2 + Math.random() * 8;
      g.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(12, 12);
  return t;
}

export const RING_HALF = 8;
export const RAIL_R = 12.5;

// Mine cart that rolls around the rail loop, loaded with glowing crystals.
export function buildMinecart(variant = 'normal') {
  const root = new THREE.Group();
  const boss = variant === 'boss';
  const metal = lambert(boss ? '#1d1a24' : '#5d6472');
  const wood = lambert(boss ? '#8e1020' : '#7a5234');
  const tub = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.5, 0.8), wood);
  tub.position.y = 0.42;
  root.add(tub);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.1, 0.9), metal);
  rim.position.y = 0.7;
  root.add(rim);
  for (const x of [-0.45, 0, 0.45]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.52, 0.84), metal);
    band.position.set(x, 0.42, 0);
    root.add(band);
  }
  if (boss) {
    // Spiked war-cart with a glowing warning lamp.
    const spikeMat = lambert('#d8d8d8');
    for (const [x, z] of [[-0.6, 0.42], [0, 0.42], [0.6, 0.42], [-0.6, -0.42], [0, -0.42], [0.6, -0.42]]) {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 6), spikeMat);
      s.position.set(x, 0.42, z);
      s.rotation.x = z > 0 ? Math.PI / 2 : -Math.PI / 2;
      root.add(s);
    }
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: '#ff3030' }));
    lamp.position.set(0.62, 0.85, 0);
    root.add(lamp);
    root.userData.lamp = lamp;
  }
  const crystalMat = new THREE.MeshLambertMaterial({ color: '#46b8ff', emissive: '#0f4c8a' });
  for (let i = 0; i < (boss ? 0 : 5); i++) {
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.16 + Math.random() * 0.08, 0), crystalMat);
    c.position.set(-0.4 + i * 0.2, 0.78 + Math.random() * 0.08, (Math.random() - 0.5) * 0.35);
    c.rotation.set(Math.random(), Math.random() * 3, Math.random());
    root.add(c);
  }
  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12).rotateX(Math.PI / 2);
  for (const [x, z] of [[-0.4, 0.36], [0.4, 0.36], [-0.4, -0.36], [0.4, -0.36]]) {
    const w = new THREE.Mesh(wheelGeo, metal);
    w.position.set(x, 0.16, z);
    root.add(w);
    wheels.push(w);
  }
  const shadow = blobShadow(1.6);
  shadow.scale.set(1.8, 1.2, 1);
  shadow.position.y = 0.03;
  root.add(shadow);
  root.userData.wheels = wheels;
  return root;
}

export function buildArena() {
  const root = new THREE.Group();

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshLambertMaterial({ map: groundTexture() }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.6;
  root.add(ground);

  // Platform
  const floorMat = new THREE.MeshLambertMaterial({ map: woodTexture('#9a6a3e') });
  const sideMat = lambert('#5b3a1f');
  const platform = new THREE.Mesh(new THREE.BoxGeometry(RING_HALF * 2 + 0.6, 0.6, RING_HALF * 2 + 0.6),
    [sideMat, sideMat, floorMat, sideMat, sideMat, sideMat]);
  platform.position.y = -0.3;
  root.add(platform);

  const skirt = new THREE.Mesh(new THREE.BoxGeometry(RING_HALF * 2 + 1.2, 0.25, RING_HALF * 2 + 1.2), lambert('#3a2412'));
  skirt.position.y = -0.52;
  root.add(skirt);

  // Posts + ropes
  const postMat = lambert('#d8d8d8');
  const ropeMat = new THREE.MeshLambertMaterial({ color: '#d33' });
  const padMat = new THREE.MeshLambertMaterial({ color: '#d33' });
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => new THREE.Vector3(x * RING_HALF, 0, z * RING_HALF));
  for (const c of corners) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.9, 10), postMat);
    post.position.set(c.x, 0.95, c.z);
    root.add(post);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.1, 0.42), padMat);
    pad.position.set(c.x, 1.05, c.z);
    root.add(pad);
  }
  const ropeGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 6).rotateZ(Math.PI / 2);
  for (let i = 0; i < 4; i++) {
    const a = corners[i], b = corners[(i + 1) % 4];
    for (const hgt of [0.55, 1.0, 1.45]) {
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set((a.x + b.x) / 2, hgt, (a.z + b.z) / 2);
      rope.scale.x = a.distanceTo(b);
      rope.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
      root.add(rope);
    }
  }

  // Outer rail track loop
  const railMat = lambert('#8f97a6');
  const tieMat = lambert('#5a4030');
  const R = 12.5;
  const tieGeo = new THREE.BoxGeometry(1.1, 0.08, 0.22);
  const railGeo = new THREE.BoxGeometry(0.07, 0.08, 1);
  for (let side = 0; side < 4; side++) {
    for (let t = -R; t <= R; t += 0.7) {
      const tie = new THREE.Mesh(tieGeo, tieMat);
      const x = side % 2 === 0 ? t : (side === 1 ? R : -R);
      const z = side % 2 === 0 ? (side === 0 ? -R : R) : t;
      tie.position.set(x, -0.54, z);
      if (side % 2 === 0) tie.rotation.y = Math.PI / 2;
      root.add(tie);
    }
    for (const off of [-0.35, 0.35]) {
      const rail = new THREE.Mesh(railGeo, railMat);
      if (side % 2 === 0) {
        rail.position.set(0, -0.46, (side === 0 ? -R : R) + off);
        rail.rotation.y = Math.PI / 2;
      } else {
        rail.position.set((side === 1 ? R : -R) + off, -0.46, 0);
      }
      rail.scale.z = R * 2 + 0.7;
      root.add(rail);
    }
  }

  // Crystals, rocks and props scattered outside the ring
  const crystalMat = new THREE.MeshLambertMaterial({ color: '#46b8ff', emissive: '#0f4c8a' });
  const crystalGeo = new THREE.OctahedronGeometry(0.5, 0);
  const rockMat = lambert('#4a5263');
  const rockGeo = new THREE.DodecahedronGeometry(0.8, 0);
  const rand = mulberry(7);
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2;
    const d = 15 + rand() * 22;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (rand() < 0.45) {
      const cl = new THREE.Group();
      const n = 2 + Math.floor(rand() * 4);
      for (let k = 0; k < n; k++) {
        const c = new THREE.Mesh(crystalGeo, crystalMat);
        c.scale.set(0.5 + rand() * 0.4, 1 + rand() * 1.6, 0.5 + rand() * 0.4);
        c.position.set((rand() - 0.5) * 1.2, 0, (rand() - 0.5) * 1.2);
        c.rotation.set((rand() - 0.5) * 0.6, rand() * 3, (rand() - 0.5) * 0.6);
        cl.add(c);
      }
      cl.position.set(x, -0.4, z);
      root.add(cl);
    } else {
      const r = new THREE.Mesh(rockGeo, rockMat);
      r.scale.set(1 + rand() * 1.5, 0.6 + rand(), 1 + rand() * 1.5);
      r.position.set(x, -0.5, z);
      r.rotation.y = rand() * 3;
      root.add(r);
    }
  }
  // Lanterns
  const lampMat = new THREE.MeshBasicMaterial({ color: '#ffdd88' });
  for (const [x, z] of [[-14, -6], [14, 5], [-5, 15], [6, -15]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 6), lambert('#333842'));
    pole.position.set(x, 0.7, z); root.add(pole);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), lampMat);
    bulb.position.set(x, 2.1, z); root.add(bulb);
  }

  return { root, floorMat, ropeMat, padMat, sideMat };
}

// Recolor the arena to match the upgraded ring tier.
export function styleArena(arena, tier) {
  const floorColors = ['#ffffff', '#c9ccd4', '#b9c7ff', '#b6c7d4', '#ffb38a', '#fff8e6'];
  arena.floorMat.color.set(floorColors[tier % floorColors.length]);
  const ropes = ['#dd3333', '#f5a623', '#9b4dff', '#27d3ff', '#ff6a00', '#ffd54a'];
  arena.ropeMat.color.set(ropes[tier % ropes.length]);
  arena.padMat.color.set(ropes[tier % ropes.length]);
}

// ---------- event: car ----------
export function buildCar() {
  const g = new THREE.Group();
  const paint = new THREE.MeshLambertMaterial({ color: '#c8262e' });
  const dark = lambert('#1d2230');
  const glass = new THREE.MeshLambertMaterial({ color: '#8fc4e8', emissive: '#1c3350' });
  const chrome = lambert('#d7dbe0');
  const parts = [];
  const add = (mesh, detachable = true) => { g.add(mesh); if (detachable) parts.push(mesh); return mesh; };

  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, 2), paint);
  body.position.y = 0.8; g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.7, 1.8), paint);
  cabin.position.set(-0.2, 1.55, 0); g.add(cabin);
  const wf = add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 1.6), glass));
  wf.position.set(0.95, 1.55, 0); wf.rotation.z = -0.35;
  for (const sz of [-1, 1]) {
    const win = add(new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.05), glass));
    win.position.set(-0.2, 1.58, 0.91 * sz);
    const door = add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.06), paint));
    door.position.set(0.2, 0.85, 1.02 * sz);
    const mirror = add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.2), paint));
    mirror.position.set(0.85, 1.3, 1.08 * sz);
  }
  const bumperF = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 2.1), chrome));
  bumperF.position.set(2.25, 0.55, 0);
  const bumperB = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 2.1), chrome));
  bumperB.position.set(-2.25, 0.55, 0);
  const hood = add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 1.9), paint));
  hood.position.set(1.5, 1.22, 0);
  for (const sz of [-1, 1]) {
    const light = add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.35), new THREE.MeshBasicMaterial({ color: '#fff6c0' })));
    light.position.set(2.21, 0.9, 0.7 * sz);
  }
  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16).rotateX(Math.PI / 2);
  for (const [x, z] of [[1.4, 1], [-1.4, 1], [1.4, -1], [-1.4, -1]]) {
    const w = add(new THREE.Mesh(wheelGeo, dark));
    w.position.set(x, 0.45, z);
  }
  const shadow = blobShadow(5);
  shadow.scale.set(5.5, 3, 1);
  g.add(shadow);
  return { root: g, body, cabin, paint, parts };
}

export function buildJunkyard() {
  const root = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), lambert('#c98d62'));
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
  const rand = mulberry(3);
  const colors = ['#5a5f6b', '#6b4a3a', '#44505e', '#7a6a5a', '#3e3f48'];
  for (let i = 0; i < 26; i++) {
    const c = new THREE.Group();
    const m = lambert(colors[i % colors.length]);
    const b = new THREE.Mesh(new THREE.BoxGeometry(4, 0.9, 1.9), m); b.position.y = 0.6; c.add(b);
    const t = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 1.7), m); t.position.y = 1.35; c.add(t);
    c.position.set(-30 + rand() * 60, rand() < 0.3 ? 1.2 : 0, -10 - rand() * 30);
    c.rotation.y = rand() * Math.PI;
    if (c.position.y > 0) c.rotation.z = 0.1;
    root.add(c);
  }
  // Crane silhouette
  const craneMat = lambert('#7c5a44');
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.5, 16, 0.5), craneMat);
  mast.position.set(6, 8, -32); root.add(mast);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 0.4), craneMat);
  boom.position.set(0, 15.5, -32); boom.rotation.z = 0.12; root.add(boom);
  // Dry trees
  for (let i = 0; i < 6; i++) {
    const tr = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 3, 6), lambert('#6b4a34'));
    trunk.position.y = 1.5; tr.add(trunk);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.4, 10), lambert('#8d6a47'));
    crown.position.y = 3.2; tr.add(crown);
    tr.position.set(-25 + rand() * 50, 0, -18 - rand() * 20);
    root.add(tr);
  }
  return root;
}

export function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
