import {
  BufferAttribute,
  Color,
  ConeGeometry,
  CapsuleGeometry,
  BoxGeometry,
  SphereGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  NormalBlending,
  AdditiveBlending,
  ShaderMaterial,
  Sphere,
  Vector3,
  DoubleSide
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createAsteroidGeometry } from '../../assets/ProceduralGeometry.js';
import { createInstancedQuad } from '../../assets/KitGeometry.js';
import { sharedUniforms } from '../../core/FrameUniforms.js';
import { LAYER } from '../../core/Layers.js';
import { BurstMode } from '../../effects/BurstSphere.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { frame } from '../../core/FrameUniforms.js';
import { ENEMIES } from '../data/enemies.js';

const CAPACITY = 700;
const TYPE_IDS = Object.keys(ENEMIES);
const TYPES = TYPE_IDS.map((id) => ({ id, ...ENEMIES[id] }));
const SHAPES = ['blob', 'wisp', 'ghoul', 'golem'];

// Spatial grid, centred on the player each frame.
const CELL = 2.5;
const GRID = 64;
const HALF = (GRID * CELL) / 2;

const _v = new Vector3();
const _emit = {};
const UP = new Vector3(0, 1, 0);

/* -------------------------------------------------------------------- */
/* Procedural monster meshes                                             */
/* -------------------------------------------------------------------- */

/** Strip a geometry down to position + normal and tag it with a part id. */
function part(geometry, id) {
  let g = geometry.index ? geometry.toNonIndexed() : geometry;
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
  }
  if (!g.attributes.normal) g.computeVertexNormals();
  const count = g.attributes.position.count;
  g.setAttribute('aPart', new BufferAttribute(new Float32Array(count).fill(id), 1));
  return g;
}

const BODY = 0;
const GLOW = 1;
const DARK = 2;

function buildShape(shape) {
  const parts = [];
  const eyes = (x, y, z, r) => {
    parts.push(part(new SphereGeometry(r, 8, 6).translate(x, y, z), GLOW));
    parts.push(part(new SphereGeometry(r, 8, 6).translate(-x, y, z), GLOW));
  };
  switch (shape) {
    case 'blob':
      parts.push(part(new SphereGeometry(0.5, 20, 14).scale(1, 0.85, 1).translate(0, 0.42, 0), BODY));
      parts.push(part(new SphereGeometry(0.16, 10, 8).scale(1.4, 0.5, 1).translate(0, 0.3, 0.44), DARK));
      eyes(0.17, 0.56, 0.4, 0.08);
      break;
    case 'wisp':
      parts.push(part(new SphereGeometry(0.36, 16, 12).translate(0, 0.62, 0), BODY));
      parts.push(part(new ConeGeometry(0.3, 0.75, 12, 4).rotateX(Math.PI).translate(0, 0.2, -0.06), BODY));
      eyes(0.12, 0.68, 0.3, 0.07);
      break;
    case 'ghoul':
      parts.push(part(new CapsuleGeometry(0.27, 0.55, 4, 10).translate(0, 0.72, 0), BODY));
      parts.push(part(new SphereGeometry(0.23, 12, 10).translate(0, 1.32, 0.06), BODY));
      parts.push(part(new CapsuleGeometry(0.075, 0.5, 2, 6).rotateX(-1.1).translate(0.32, 1.0, 0.22), DARK));
      parts.push(part(new CapsuleGeometry(0.075, 0.5, 2, 6).rotateX(-1.1).translate(-0.32, 1.0, 0.22), DARK));
      parts.push(part(new ConeGeometry(0.06, 0.22, 6).rotateX(-0.4).translate(0.12, 1.55, 0.02), DARK));
      parts.push(part(new ConeGeometry(0.06, 0.22, 6).rotateX(-0.4).translate(-0.12, 1.55, 0.02), DARK));
      eyes(0.08, 1.35, 0.26, 0.045);
      break;
    case 'golem': {
      const body = createAsteroidGeometry({ seed: 7, detail: 1, lumpiness: 0.25 });
      parts.push(part(body.scale(0.72, 0.68, 0.58).translate(0, 1.0, 0), BODY));
      parts.push(part(new BoxGeometry(0.42, 0.36, 0.38).translate(0, 1.72, 0.12), BODY));
      parts.push(part(new BoxGeometry(0.3, 0.95, 0.32).rotateX(-0.25).translate(0.78, 0.95, 0.12), DARK));
      parts.push(part(new BoxGeometry(0.3, 0.95, 0.32).rotateX(-0.25).translate(-0.78, 0.95, 0.12), DARK));
      parts.push(part(new BoxGeometry(0.3, 0.5, 0.32).translate(0.3, 0.25, 0), DARK));
      parts.push(part(new BoxGeometry(0.3, 0.5, 0.32).translate(-0.3, 0.25, 0), DARK));
      parts.push(part(new SphereGeometry(0.14, 8, 6).translate(0, 1.15, 0.42), GLOW));
      eyes(0.1, 1.76, 0.32, 0.05);
      break;
    }
  }
  return mergeGeometries(parts);
}

const ENEMY_VERTEX = /* glsl */ `
  attribute float aPart;
  attribute vec4 aPos;    // x, z, yaw, scale
  attribute vec4 aState;  // flash, death 0..1, phase, elite
  attribute vec3 aTint;
  attribute vec3 aGlow;
  uniform float uTime;
  varying vec3 vN;
  varying vec3 vCol;
  varying vec3 vGlowCol;
  varying float vPart;
  varying vec4 vState;
  varying vec3 vWorld;
  varying vec3 vLocal;

  void main() {
    vec3 p = position;
    vec3 n = normal;
    float ph = aState.z;
  #if SHAPE == 0
    float hop = abs(sin(uTime * 6.0 + ph));
    p.y *= 0.78 + 0.34 * hop;
    p.xz *= 1.12 - 0.18 * hop;
    p.y += hop * 0.22;
  #elif SHAPE == 1
    float lowness = 1.0 - clamp(p.y / 0.6, 0.0, 1.0);
    p.x += sin(p.y * 6.0 - uTime * 8.0 + ph) * 0.1 * lowness;
    p.y += 0.3 + sin(uTime * 3.0 + ph) * 0.14;
  #else
    float w = sin(uTime * 7.0 + ph);
    float roll = w * 0.09;
    p.xy = mat2(cos(roll), -sin(roll), sin(roll), cos(roll)) * p.xy;
    p.y += abs(w) * 0.05;
  #endif
    float death = aState.y;
    p *= 1.0 + death * 0.35;
    p.y *= 1.0 - death * 0.7;

    float c = cos(aPos.z);
    float s = sin(aPos.z);
    vec3 rp = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
    vec3 rn = vec3(c * n.x + s * n.z, n.y, -s * n.x + c * n.z);
    vec3 world = vec3(aPos.x, 0.0, aPos.y) + rp * aPos.w;

    vN = rn;
    vCol = aTint;
    vGlowCol = aGlow;
    vPart = aPart;
    vState = aState;
    vWorld = world;
    vLocal = position;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const ENEMY_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLightDir;
  varying vec3 vN;
  varying vec3 vCol;
  varying vec3 vGlowCol;
  varying float vPart;
  varying vec4 vState;
  varying vec3 vWorld;
  varying vec3 vLocal;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }

  void main() {
    float death = vState.y;
    float grain = hash(floor(vLocal * 14.0));
    if (death > 0.0 && grain < death * 1.1) discard;

    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vWorld);
    float diff = max(dot(N, uLightDir), 0.0);
    float hemi = N.y * 0.5 + 0.5;
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);

    vec3 col;
    if (vPart > 0.5 && vPart < 1.5) {
      col = vGlowCol * (2.2 + 0.6 * sin(uTime * 8.0 + vState.z));
    } else {
      vec3 base = vPart > 1.5 ? vCol * 0.45 : vCol;
      col = base * (0.28 + hemi * 0.3 + diff * 0.85);
      col += vGlowCol * rim * (0.35 + vState.w * 1.2);
    }
    // Hit flash, and the burning edge of the death dissolve.
    col = mix(col, vec3(2.2), vState.x * 0.7);
    if (death > 0.0) col += vGlowCol * 3.0 * step(grain, death * 1.1 + 0.12);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const SHADOW_VERTEX = /* glsl */ `
  attribute vec4 aPos;
  attribute vec4 aState;
  varying vec2 vUv;
  varying float vFade;
  void main() {
    vec2 q = position.xy * 2.2 * aPos.w;
    vec3 world = vec3(aPos.x + q.x, 0.02, aPos.y + q.y);
    vUv = position.xy * 2.0;
    vFade = 1.0 - aState.y;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const SHADOW_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying float vFade;
  void main() {
    float d = length(vUv);
    float a = smoothstep(1.0, 0.2, d) * 0.55 * vFade;
    gl_FragColor = vec4(0.0, 0.0, 0.0, a);
  }
`;

/** Red telegraph rings for boss attacks. */
const TELE_VERTEX = /* glsl */ `
  attribute vec4 aPos;    // x, z, radius, progress
  varying vec2 vUv;
  varying float vProg;
  void main() {
    vec2 q = position.xy * 2.0 * aPos.z;
    gl_Position = projectionMatrix * viewMatrix * vec4(aPos.x + q.x, 0.05, aPos.y + q.y, 1.0);
    vUv = position.xy * 2.0;
    vProg = aPos.w;
  }
`;

const TELE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vProg;
  void main() {
    float d = length(vUv);
    if (d > 1.0) discard;
    float rim = smoothstep(0.05, 0.0, abs(d - 0.97));
    float fill = step(d, vProg) * 0.28;
    float front = smoothstep(0.04, 0.0, abs(d - vProg)) * 0.8;
    float pulse = 0.75 + 0.25 * sin(uTime * 18.0);
    vec3 col = vec3(1.0, 0.18, 0.12) * (rim + fill + front) * pulse * 1.6;
    gl_FragColor = vec4(col, (rim + fill + front) * 0.9);
  }
`;

class InstancedLayer {
  constructor(geometry, material, capacity, stride) {
    this.geometry = geometry;
    this.capacity = capacity;
    this.attrs = {};
    for (const [name, size] of Object.entries(stride)) {
      const attr = new InstancedBufferAttribute(new Float32Array(capacity * size), size);
      attr.setUsage(35048); // DynamicDrawUsage
      geometry.setAttribute(name, attr);
      this.attrs[name] = attr;
    }
    geometry.instanceCount = 0;
    geometry.boundingSphere = new Sphere(new Vector3(), 1e5);
    this.mesh = new Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.mesh.layers.set(LAYER.VFX);
    this.count = 0;
  }

  begin() {
    this.count = 0;
  }

  end() {
    this.geometry.instanceCount = this.count;
    for (const attr of Object.values(this.attrs)) {
      attr.clearUpdateRanges?.();
      attr.addUpdateRange?.(0, this.count * attr.itemSize);
      attr.needsUpdate = true;
    }
  }
}

function toInstanced(source) {
  const g = new InstancedBufferGeometry();
  for (const [name, attr] of Object.entries(source.attributes)) g.setAttribute(name, attr);
  if (source.index) g.setIndex(source.index);
  return g;
}

/* -------------------------------------------------------------------- */
/* The system                                                            */
/* -------------------------------------------------------------------- */

/**
 * Every monster in the run.
 *
 * Structure-of-arrays simulation (no per-enemy objects, nothing allocated per
 * frame), a counting-sort grid for crowd separation, and one instanced mesh
 * per body shape — five draw calls however many are alive. Bosses share the
 * same arrays and add a telegraphed slam.
 */
export class EnemySystem {
  constructor(ctx) {
    this.ctx = ctx;
    const n = CAPACITY;
    this.alive = new Uint8Array(n);
    this.type = new Uint8Array(n);
    this.x = new Float32Array(n);
    this.z = new Float32Array(n);
    this.kx = new Float32Array(n);
    this.kz = new Float32Array(n);
    this.hp = new Float32Array(n);
    this.maxHp = new Float32Array(n);
    this.speed = new Float32Array(n);
    this.radius = new Float32Array(n);
    this.dmg = new Float32Array(n);
    this.xp = new Float32Array(n);
    this.scale = new Float32Array(n);
    this.flash = new Float32Array(n);
    this.death = new Float32Array(n);
    this.phase = new Float32Array(n);
    this.elite = new Uint8Array(n);
    this.slow = new Float32Array(n);
    this.slowT = new Float32Array(n);
    this.attackCd = new Float32Array(n);
    this.yaw = new Float32Array(n);
    this.uid = new Uint32Array(n);
    this.bossT = new Float32Array(n);
    this.bossState = new Uint8Array(n);
    this.tint = new Float32Array(n * 3);
    this.glow = new Float32Array(n * 3);
    this.free = [];
    for (let i = n - 1; i >= 0; i--) this.free.push(i);
    this.liveCount = 0;
    this._uid = 1;

    this.cellCount = new Int32Array(GRID * GRID + 1);
    this.cellItems = new Int32Array(n);
    this.cellOf = new Int32Array(n);

    this.bosses = [];
    this.telegraphs = [];

    this._buildRender();

    this.souls = ctx.particles.get('game.souls', { capacity: 2500, shape: ParticleShape.SOFT, additive: true, curl: true, softFade: 0.3 });
    this.souls.setGradient(new Color('#ffffff'), new Color('#9ff3ff'), new Color('#3ea8ff'), new Color('#0a1830'));
    this.souls.uniforms.uSizeScale.value = 0.12;
    this.souls.uniforms.uEndSize.value = 0.2;
    this.souls.uniforms.uGravity.value.set(0, 1.5, 0);
    this.souls.uniforms.uDrag.value = 1.5;
    this.souls.uniforms.uTurbulence.value = 0.6;
    this.chunks = ctx.particles.get('game.chunks', { capacity: 1500, shape: ParticleShape.CHIP, additive: false, lit: true, softFade: 0.2 });
    this.chunks.uniforms.uSizeScale.value = 0.14;
    this.chunks.uniforms.uGravity.value.set(0, -16, 0);
    this.chunks.uniforms.uDrag.value = 0.4;
    this.chunks.uniforms.uEndSize.value = 0.6;
    this.chunks.uniforms.uFadeOut.value = 0.8;
  }

  _buildRender() {
    this.layers = {};
    const stride = { aPos: 4, aState: 4, aTint: 3, aGlow: 3 };
    SHAPES.forEach((shape, index) => {
      const material = new ShaderMaterial({
        defines: { SHAPE: Math.min(index, 2) },
        uniforms: sharedUniforms({}),
        vertexShader: ENEMY_VERTEX,
        fragmentShader: ENEMY_FRAGMENT
      });
      const layer = new InstancedLayer(toInstanced(buildShape(shape)), material, CAPACITY, stride);
      layer.mesh.renderOrder = 2;
      this.ctx.scene.add(layer.mesh);
      this.layers[shape] = layer;
    });

    const shadowMat = new ShaderMaterial({
      vertexShader: SHADOW_VERTEX,
      fragmentShader: SHADOW_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending
    });
    this.shadowLayer = new InstancedLayer(createInstancedQuad(1), shadowMat, CAPACITY, { aPos: 4, aState: 4 });
    this.shadowLayer.mesh.renderOrder = 1;
    this.ctx.scene.add(this.shadowLayer.mesh);

    const teleMat = new ShaderMaterial({
      uniforms: sharedUniforms({}),
      vertexShader: TELE_VERTEX,
      fragmentShader: TELE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide
    });
    this.teleLayer = new InstancedLayer(createInstancedQuad(1), teleMat, 32, { aPos: 4 });
    this.teleLayer.mesh.renderOrder = 3;
    this.ctx.scene.add(this.teleLayer.mesh);
  }

  /* ------------------------------------------------------------------ */

  spawn(typeId, x, z, { hpMul = 1, dmgMul = 1, elite = false } = {}) {
    if (this.free.length === 0) return -1;
    const t = TYPE_IDS.indexOf(typeId);
    const def = TYPES[t];
    const i = this.free.pop();
    const eliteMul = elite ? 1 : 0;
    this.alive[i] = 1;
    this.type[i] = t;
    this.x[i] = x;
    this.z[i] = z;
    this.kx[i] = 0;
    this.kz[i] = 0;
    this.maxHp[i] = this.hp[i] = def.hp * hpMul * (elite ? 10 : 1);
    this.speed[i] = def.speed * (0.9 + Math.random() * 0.2) * (elite ? 0.85 : 1);
    this.scale[i] = def.scale * (elite ? 1.7 : 1);
    this.radius[i] = def.radius * (elite ? 1.7 : 1);
    this.dmg[i] = def.damage * dmgMul * (elite ? 1.5 : 1);
    this.xp[i] = def.xp * (elite ? 8 : 1);
    this.flash[i] = 0;
    this.death[i] = 0;
    this.phase[i] = Math.random() * 10;
    this.elite[i] = eliteMul;
    this.slow[i] = 0;
    this.slowT[i] = 0;
    this.attackCd[i] = 0;
    this.yaw[i] = 0;
    this.uid[i] = this._uid++;
    this.bossT[i] = 2.5;
    this.bossState[i] = 0;
    const tint = new Color(def.color);
    const glow = new Color(elite ? '#ffd24a' : def.glow);
    tint.toArray(this.tint, i * 3);
    glow.toArray(this.glow, i * 3);
    this.liveCount++;
    if (def.boss) this.bosses.push(i);
    return i;
  }

  isBoss(i) {
    return !!TYPES[this.type[i]].boss;
  }

  def(i) {
    return TYPES[this.type[i]];
  }

  /** True while alive and not already dissolving. */
  hittable(i) {
    return this.alive[i] === 1 && this.death[i] === 0;
  }

  damage(i, amount, { kx = 0, kz = 0, slow = 0, crit = false } = {}) {
    if (!this.hittable(i)) return 0;
    const dealt = Math.min(this.hp[i], amount);
    this.hp[i] -= amount;
    const boss = this.isBoss(i);
    this.flash[i] = boss ? 0.35 : 1;
    const resist = boss ? 0.08 : this.elite[i] ? 0.35 : 1;
    this.kx[i] += kx * resist;
    this.kz[i] += kz * resist;
    if (slow > 0) {
      this.slow[i] = Math.max(this.slow[i], boss ? slow * 0.3 : slow);
      this.slowT[i] = 1.2;
    }
    this.ctx.damageText.spawn(this.x[i], 1.4 * this.scale[i] + 0.4, this.z[i], amount, crit);
    if (this.hp[i] <= 0) this._kill(i);
    else this.ctx.sfx.hit();
    return dealt;
  }

  _kill(i) {
    const ctx = this.ctx;
    const def = TYPES[this.type[i]];
    this.death[i] = 0.001;
    ctx.stats.kills++;
    _v.set(this.x[i], 0.6 * this.scale[i], this.z[i]);
    this._emit(this.souls, 6 + (this.elite[i] ? 20 : 0), _v, 0.3 * this.scale[i], 1.4, 0.9);
    this._emit(this.chunks, 3, _v, 0.2 * this.scale[i], 3.5, 1.0);
    ctx.pickups.dropXp(this.x[i], this.z[i], this.xp[i]);
    if (Math.random() < 0.012) ctx.pickups.drop('heart', this.x[i], this.z[i]);
    if (Math.random() < 0.003) ctx.pickups.drop('magnet', this.x[i], this.z[i]);
    if (this.elite[i] || def.boss) {
      ctx.pickups.drop('chest', this.x[i], this.z[i]);
      ctx.bursts.spawn(def.boss ? BurstMode.STORM : BurstMode.AIR, _v, {
        radius: 0.5, endRadius: def.boss ? 9 : 4, life: 0.8, intensity: 1.2,
        colorA: new Color(def.glow), colorB: new Color('#ffffff'), colorC: new Color('#ffffff')
      });
      ctx.shake.add(def.boss ? 1.2 : 0.4, 1.2, 20);
      ctx.flash.trigger(new Color(def.glow), def.boss ? 0.35 : 0.1);
    }
    if (def.boss) ctx.onBossDown?.(def);
    ctx.sfx.kill();
  }

  _emit(system, count, position, radius, speed, life) {
    _emit.position = position;
    _emit.radius = radius;
    _emit.direction = UP;
    _emit.speed = speed;
    _emit.speedVariance = 0.5;
    _emit.spread = 0.9;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 1;
    _emit.sizeVariance = 0.5;
    _emit.life = life;
    _emit.lifeVariance = 0.4;
    _emit.spin = 8;
    _emit.time = frame.uTime.value;
    system.emit(count, _emit);
  }

  _release(i) {
    this.alive[i] = 0;
    this.free.push(i);
    this.liveCount--;
    const b = this.bosses.indexOf(i);
    if (b >= 0) this.bosses.splice(b, 1);
  }

  knock(i, dx, dz, strength) {
    const len = Math.hypot(dx, dz) || 1;
    const resist = this.isBoss(i) ? 0.08 : this.elite[i] ? 0.35 : 1;
    this.kx[i] += (dx / len) * strength * resist;
    this.kz[i] += (dz / len) * strength * resist;
  }

  clear() {
    for (let i = 0; i < CAPACITY; i++) if (this.alive[i]) this._release(i);
    this.bosses.length = 0;
    this.telegraphs.length = 0;
  }

  /* ------------------------------------------------------------------ */
  /* Queries                                                             */
  /* ------------------------------------------------------------------ */

  forEachInRadius(x, z, r, fn) {
    for (let i = 0; i < CAPACITY; i++) {
      if (!this.hittable(i)) continue;
      const dx = this.x[i] - x;
      const dz = this.z[i] - z;
      const rr = r + this.radius[i];
      if (dx * dx + dz * dz <= rr * rr) fn(i, dx, dz);
    }
  }

  /** Enemies whose projection on the line lies in [t0, t1] and within `width`. */
  forEachInLine(ox, oz, dx, dz, t0, t1, width, fn) {
    for (let i = 0; i < CAPACITY; i++) {
      if (!this.hittable(i)) continue;
      const px = this.x[i] - ox;
      const pz = this.z[i] - oz;
      const along = px * dx + pz * dz;
      if (along < t0 - this.radius[i] || along > t1 + this.radius[i]) continue;
      const lateral = Math.abs(px * dz - pz * dx);
      if (lateral <= width + this.radius[i]) fn(i, along, lateral);
    }
  }

  nearest(x, z, maxDist) {
    let best = -1;
    let bestD = maxDist * maxDist;
    for (let i = 0; i < CAPACITY; i++) {
      if (!this.hittable(i)) continue;
      const dx = this.x[i] - x;
      const dz = this.z[i] - z;
      const d = dx * dx + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  /** A target with many neighbours: samples candidates, scores by grid density. */
  densest(x, z, maxDist) {
    let best = -1;
    let bestScore = -1;
    const r2 = maxDist * maxDist;
    for (let tries = 0, seen = 0; tries < 400 && seen < 24; tries++) {
      const i = (Math.random() * CAPACITY) | 0;
      if (!this.hittable(i)) continue;
      const dx = this.x[i] - x;
      const dz = this.z[i] - z;
      const d2 = dx * dx + dz * dz;
      if (d2 > r2) continue;
      seen++;
      const cell = this.cellOf[i];
      let score = cell >= 0 ? this.cellCount[cell + 1] - this.cellCount[cell] : 0;
      if (this.isBoss(i)) score += 6;
      score -= Math.sqrt(d2) * 0.05;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best >= 0 ? best : this.nearest(x, z, maxDist);
  }

  /* ------------------------------------------------------------------ */
  /* Simulation                                                          */
  /* ------------------------------------------------------------------ */

  _buildGrid(px, pz) {
    const counts = this.cellCount;
    counts.fill(0);
    for (let i = 0; i < CAPACITY; i++) {
      this.cellOf[i] = -1;
      if (!this.alive[i]) continue;
      const cx = Math.floor((this.x[i] - px + HALF) / CELL);
      const cz = Math.floor((this.z[i] - pz + HALF) / CELL);
      if (cx < 0 || cz < 0 || cx >= GRID || cz >= GRID) continue;
      const c = cz * GRID + cx;
      this.cellOf[i] = c;
      counts[c + 1]++;
    }
    for (let c = 1; c <= GRID * GRID; c++) counts[c] += counts[c - 1];
    const cursor = this._cursor ?? (this._cursor = new Int32Array(GRID * GRID));
    cursor.set(counts.subarray(0, GRID * GRID));
    for (let i = 0; i < CAPACITY; i++) {
      const c = this.cellOf[i];
      if (c >= 0) this.cellItems[cursor[c]++] = i;
    }
  }

  update(dt, player) {
    const px = player.x;
    const pz = player.z;
    this._buildGrid(px, pz);
    const ctx = this.ctx;

    for (let i = 0; i < CAPACITY; i++) {
      if (!this.alive[i]) continue;

      this.flash[i] = Math.max(0, this.flash[i] - dt * 7);
      if (this.death[i] > 0) {
        this.death[i] += dt / 0.35;
        if (this.death[i] >= 1) this._release(i);
        continue;
      }

      let dx = px - this.x[i];
      let dz = pz - this.z[i];
      const dist = Math.hypot(dx, dz) || 1;
      dx /= dist;
      dz /= dist;

      // Stragglers far behind are re-seated ahead of the player.
      if (dist > 42 && !this.isBoss(i)) {
        const a = Math.atan2(player.vz, player.vx) + (Math.random() - 0.5) * 1.6;
        const moving = Math.hypot(player.vx, player.vz) > 0.1;
        const ang = moving ? a : Math.random() * Math.PI * 2;
        this.x[i] = px + Math.cos(ang) * 22;
        this.z[i] = pz + Math.sin(ang) * 22;
        continue;
      }

      if (this.slowT[i] > 0) {
        this.slowT[i] -= dt;
        if (this.slowT[i] <= 0) this.slow[i] = 0;
      }

      let speed = this.speed[i] * (1 - this.slow[i]) * ctx.director.speedMul;
      if (this.isBoss(i)) speed = this._bossStep(i, dt, dist, speed, player);

      // Separation from neighbours in the 3×3 cells around this one.
      let sx = 0;
      let sz = 0;
      const cell = this.cellOf[i];
      if (cell >= 0) {
        const cx = cell % GRID;
        const cz = (cell / GRID) | 0;
        for (let oz = -1; oz <= 1; oz++) {
          const rz = cz + oz;
          if (rz < 0 || rz >= GRID) continue;
          for (let ox = -1; ox <= 1; ox++) {
            const rx = cx + ox;
            if (rx < 0 || rx >= GRID) continue;
            const c = rz * GRID + rx;
            for (let k = this.cellCount[c]; k < this.cellCount[c + 1]; k++) {
              const j = this.cellItems[k];
              if (j === i) continue;
              const ex = this.x[i] - this.x[j];
              const ez = this.z[i] - this.z[j];
              const rr = this.radius[i] + this.radius[j];
              const d2 = ex * ex + ez * ez;
              if (d2 < rr * rr && d2 > 1e-6) {
                const d = Math.sqrt(d2);
                const push = (rr - d) / d;
                const w = this.radius[j] / rr;
                sx += ex * push * w;
                sz += ez * push * w;
              }
            }
          }
        }
      }

      this.x[i] += (dx * speed + this.kx[i]) * dt + sx * Math.min(1, dt * 12);
      this.z[i] += (dz * speed + this.kz[i]) * dt + sz * Math.min(1, dt * 12);
      const decay = Math.exp(-dt * 7);
      this.kx[i] *= decay;
      this.kz[i] *= decay;

      ctx.dungeon.collide(this, i);

      // Never overlap the player; bite on contact.
      const ex = this.x[i] - px;
      const ez = this.z[i] - pz;
      const rr = this.radius[i] + player.radius;
      const d2 = ex * ex + ez * ez;
      if (d2 < rr * rr) {
        const d = Math.sqrt(d2) || 1;
        this.x[i] = px + (ex / d) * rr;
        this.z[i] = pz + (ez / d) * rr;
        this.attackCd[i] -= dt;
        if (this.attackCd[i] <= 0) {
          this.attackCd[i] = 0.8;
          player.hurt(this.dmg[i]);
        }
      } else {
        this.attackCd[i] = Math.min(this.attackCd[i], 0.25);
      }

      const targetYaw = Math.atan2(dx, dz);
      let delta = targetYaw - this.yaw[i];
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      this.yaw[i] += delta * Math.min(1, dt * 8);
    }

    this._updateTelegraphs(dt, player);
  }

  /** Boss brain: chase, stop, telegraph, slam. Returns this frame's speed. */
  _bossStep(i, dt, dist, speed, player) {
    const def = TYPES[this.type[i]];
    const enraged = this.ctx.director.time > 600 ? 1.5 : 1;
    this.bossT[i] -= dt;
    if (this.bossState[i] === 0) {
      if (this.bossT[i] <= 0 && dist < 14) {
        this.bossState[i] = 1;
        this.bossT[i] = 1.1;
        this.telegraphs.push({ x: this.x[i], z: this.z[i], r: 3.2 + this.scale[i] * 0.6, t: 0, dur: 1.1, owner: i, dmg: this.dmg[i] * 1.6 });
        this.ctx.sfx.warn();
      }
      return speed * enraged;
    }
    if (this.bossT[i] <= 0) {
      this.bossState[i] = 0;
      this.bossT[i] = (def.final ? 3.2 : 4.2) / enraged;
      if (def.spawns) {
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2;
          this.spawn(def.spawns, this.x[i] + Math.cos(a) * 2.5, this.z[i] + Math.sin(a) * 2.5, { hpMul: 1 + this.ctx.director.time / 100 });
        }
      }
    }
    return 0;
  }

  _updateTelegraphs(dt, player) {
    const ctx = this.ctx;
    for (let k = this.telegraphs.length - 1; k >= 0; k--) {
      const t = this.telegraphs[k];
      // Follow the boss while it winds up.
      if (this.alive[t.owner] && this.death[t.owner] === 0) {
        t.x = this.x[t.owner];
        t.z = this.z[t.owner];
      }
      t.t += dt;
      if (t.t < t.dur) continue;
      this.telegraphs.splice(k, 1);
      if (!this.alive[t.owner] || this.death[t.owner] > 0) continue;
      _v.set(t.x, 0.5, t.z);
      const def = TYPES[this.type[t.owner]];
      ctx.bursts.spawn(BurstMode.EARTH, _v, {
        radius: 0.6, endRadius: t.r * 1.1, life: 0.7, intensity: 1,
        colorA: new Color('#3a2a22'), colorB: new Color('#8a7a6a'), colorC: new Color(def.glow)
      });
      ctx.decals.spawn(DecalType.SHOCKWAVE, _v.setY(0), { radius: t.r * 1.3, life: 0.6, width: 0.06, colorA: new Color('#ff5030'), colorB: new Color('#ffd0a0') });
      ctx.decals.spawn(DecalType.CRACK, _v, { radius: t.r, life: 3, width: 0.4, colorA: new Color('#120c08'), colorB: new Color(def.glow) });
      _v.setY(0.3);
      this._emit(this.chunks, 30, _v, t.r * 0.5, 5, 1.2);
      ctx.shake.add(0.9, 1.1, 18);
      ctx.sfx.slam();
      if (Math.hypot(player.x - t.x, player.z - t.z) < t.r + player.radius) player.hurt(t.dmg);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                           */
  /* ------------------------------------------------------------------ */

  render() {
    for (const layer of Object.values(this.layers)) layer.begin();
    this.shadowLayer.begin();
    const sp = this.shadowLayer.attrs.aPos.array;
    const ss = this.shadowLayer.attrs.aState.array;

    for (let i = 0; i < CAPACITY; i++) {
      if (!this.alive[i]) continue;
      const layer = this.layers[TYPES[this.type[i]].shape];
      const k = layer.count++;
      const pos = layer.attrs.aPos.array;
      const st = layer.attrs.aState.array;
      const tint = layer.attrs.aTint.array;
      const glow = layer.attrs.aGlow.array;
      pos[k * 4] = this.x[i];
      pos[k * 4 + 1] = this.z[i];
      pos[k * 4 + 2] = this.yaw[i];
      pos[k * 4 + 3] = this.scale[i];
      st[k * 4] = this.flash[i];
      st[k * 4 + 1] = this.death[i];
      st[k * 4 + 2] = this.phase[i];
      st[k * 4 + 3] = this.elite[i] ? 1 : this.isBoss(i) ? 0.6 : 0;
      tint[k * 3] = this.tint[i * 3];
      tint[k * 3 + 1] = this.tint[i * 3 + 1];
      tint[k * 3 + 2] = this.tint[i * 3 + 2];
      glow[k * 3] = this.glow[i * 3];
      glow[k * 3 + 1] = this.glow[i * 3 + 1];
      glow[k * 3 + 2] = this.glow[i * 3 + 2];

      const s = this.shadowLayer.count++;
      sp[s * 4] = this.x[i];
      sp[s * 4 + 1] = this.z[i];
      sp[s * 4 + 2] = 0;
      sp[s * 4 + 3] = this.radius[i];
      ss[s * 4 + 1] = this.death[i];
    }
    for (const layer of Object.values(this.layers)) layer.end();
    this.shadowLayer.end();

    this.teleLayer.begin();
    const tp = this.teleLayer.attrs.aPos.array;
    for (const t of this.telegraphs) {
      if (this.teleLayer.count >= 32) break;
      const k = this.teleLayer.count++;
      tp[k * 4] = t.x;
      tp[k * 4 + 1] = t.z;
      tp[k * 4 + 2] = t.r;
      tp[k * 4 + 3] = Math.min(1, t.t / t.dur);
    }
    this.teleLayer.end();
  }

  /** Boss with the most health, for the boss bar. */
  get headlineBoss() {
    let best = -1;
    for (const i of this.bosses) if (this.hittable(i) && (best < 0 || this.maxHp[i] > this.maxHp[best])) best = i;
    return best;
  }
}
