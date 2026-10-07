import {
  BoxGeometry,
  Color,
  InstancedBufferGeometry,
  Mesh,
  OctahedronGeometry,
  ShaderMaterial,
  InstancedBufferAttribute,
  Sphere,
  Vector3,
  AdditiveBlending
} from 'three';
import { sharedUniforms } from '../../core/FrameUniforms.js';
import { LAYER } from '../../core/Layers.js';

const CAPACITY = 1400;
const KIND = { gem: 0, heart: 1, magnet: 2, chest: 3 };
// Gem tiers by value: colour and size grow with worth.
const TIERS = [
  { min: 0, color: '#3ee8c9', size: 0.16 },
  { min: 4, color: '#4a8dff', size: 0.22 },
  { min: 15, color: '#b060ff', size: 0.3 },
  { min: 60, color: '#ff4a8a', size: 0.4 }
];
const KIND_LOOK = {
  1: { color: '#ff3b4a', size: 0.34 },
  2: { color: '#4ab8ff', size: 0.4 },
  3: { color: '#ffb347', size: 0.5 }
};

const VERTEX = /* glsl */ `
  attribute vec4 aPos;   // x, z, size, seed
  attribute vec3 aColor;
  attribute float aKind;
  uniform float uTime;
  varying vec3 vColor;
  varying vec3 vN;
  varying vec3 vWorld;
  varying float vKind;
  void main() {
    float spin = uTime * (aKind > 2.5 ? 0.6 : 2.2) + aPos.w * 6.0;
    float c = cos(spin), s = sin(spin);
    vec3 p = position * aPos.z;
    p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
    vec3 n = vec3(c * normal.x + s * normal.z, normal.y, -s * normal.x + c * normal.z);
    float bob = aKind > 2.5 ? 0.0 : sin(uTime * 3.0 + aPos.w * 20.0) * 0.08;
    float lift = aKind > 2.5 ? aPos.z * 0.5 : 0.45;
    vec3 world = vec3(aPos.x, lift + bob, aPos.y) + p;
    vColor = aColor;
    vN = n;
    vWorld = world;
    vKind = aKind;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec3 vColor;
  varying vec3 vN;
  varying vec3 vWorld;
  varying float vKind;
  void main() {
    vec3 V = normalize(cameraPosition - vWorld);
    vec3 N = normalize(vN);
    float facet = pow(abs(dot(N, V)), 3.0);
    float rim = pow(1.0 - abs(dot(N, V)), 2.0);
    vec3 col = vColor * (0.9 + facet * 1.4) + vec3(1.0) * rim * 0.6;
    if (vKind > 2.5) {
      // Chests: a dark box with a hot rim and a pulsing seam.
      col = vColor * (0.25 + facet * 0.5) + vColor * rim * 2.0 * (0.7 + 0.3 * sin(uTime * 5.0));
    }
    gl_FragColor = vec4(col * 1.4, 1.0);
  }
`;

const HALO_VERTEX = /* glsl */ `
  attribute vec4 aPos;
  attribute vec3 aColor;
  attribute float aKind;
  varying vec2 vUv;
  varying vec3 vColor;
  void main() {
    vec2 q = position.xy * aPos.z * 5.0;
    gl_Position = projectionMatrix * viewMatrix * vec4(aPos.x + q.x, 0.04, aPos.y + q.y, 1.0);
    vUv = position.xy * 2.0;
    vColor = aColor;
  }
`;

const HALO_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vColor;
  void main() {
    float d = length(vUv);
    gl_FragColor = vec4(vColor * smoothstep(1.0, 0.0, d) * 0.35, 1.0);
  }
`;

function instanced(source, capacity) {
  const g = new InstancedBufferGeometry();
  for (const [n, a] of Object.entries(source.attributes)) g.setAttribute(n, a);
  if (source.index) g.setIndex(source.index);
  const attrs = {
    aPos: new InstancedBufferAttribute(new Float32Array(capacity * 4), 4),
    aColor: new InstancedBufferAttribute(new Float32Array(capacity * 3), 3),
    aKind: new InstancedBufferAttribute(new Float32Array(capacity), 1)
  };
  for (const [n, a] of Object.entries(attrs)) {
    a.setUsage(35048);
    g.setAttribute(n, a);
  }
  g.instanceCount = 0;
  g.boundingSphere = new Sphere(new Vector3(), 1e5);
  return { geometry: g, attrs };
}

/**
 * XP gems, hearts, magnets and chests. Gems merge when the floor is saturated
 * so a long run never runs out of slots; anything inside the pickup radius is
 * pulled in with accelerating speed, which is what makes collecting feel good.
 */
export class PickupSystem {
  constructor(ctx) {
    this.ctx = ctx;
    const n = CAPACITY;
    this.alive = new Uint8Array(n);
    this.kind = new Uint8Array(n);
    this.x = new Float32Array(n);
    this.z = new Float32Array(n);
    this.value = new Float32Array(n);
    this.pull = new Float32Array(n); // 0 = resting, >0 = seconds being pulled
    this.seed = new Float32Array(n);
    this.free = [];
    for (let i = n - 1; i >= 0; i--) this.free.push(i);
    this.count = 0;
    this._combo = 0;
    this._comboT = 0;

    const mat = new ShaderMaterial({ uniforms: sharedUniforms({}), vertexShader: VERTEX, fragmentShader: FRAGMENT });
    const gem = new OctahedronGeometry(1, 0).scale(0.7, 1, 0.7);
    this.gems = instanced(gem, CAPACITY);
    this.gemMesh = new Mesh(this.gems.geometry, mat);
    const box = new BoxGeometry(1.1, 0.8, 0.8);
    this.boxes = instanced(box, 32);
    this.boxMesh = new Mesh(this.boxes.geometry, mat);
    const quad = new BoxGeometry(1, 1, 0.001).rotateX(-Math.PI / 2).scale(1, 1, 1);
    const haloMat = new ShaderMaterial({ vertexShader: HALO_VERTEX, fragmentShader: HALO_FRAGMENT, transparent: true, depthWrite: false, blending: AdditiveBlending });
    // Halo quad lives in the XY plane of the shader's own maths.
    const flat = new BoxGeometry(1, 1, 0.001);
    this.halos = instanced(flat, 64);
    this.haloMesh = new Mesh(this.halos.geometry, haloMat);
    quad.dispose();
    for (const m of [this.gemMesh, this.boxMesh, this.haloMesh]) {
      m.frustumCulled = false;
      m.layers.set(LAYER.VFX);
      ctx.scene.add(m);
    }
    this.haloMesh.renderOrder = 1;
  }

  _add(kind, x, z, value) {
    if (this.free.length === 0) return -1;
    const i = this.free.pop();
    this.alive[i] = 1;
    this.kind[i] = kind;
    this.x[i] = x + (Math.random() - 0.5) * 0.5;
    this.z[i] = z + (Math.random() - 0.5) * 0.5;
    this.value[i] = value;
    this.pull[i] = 0;
    this.seed[i] = Math.random();
    this.count++;
    return i;
  }

  dropXp(x, z, value) {
    if (value <= 0) return;
    // Saturated: fold the value into a random resting gem instead.
    if (this.free.length < 80) {
      for (let tries = 0; tries < 30; tries++) {
        const i = (Math.random() * CAPACITY) | 0;
        if (this.alive[i] && this.kind[i] === KIND.gem && this.pull[i] === 0) {
          this.value[i] += value;
          return;
        }
      }
    }
    this._add(KIND.gem, x, z, value);
  }

  drop(kind, x, z) {
    this._add(KIND[kind], x, z, 0);
  }

  /** Pull every gem on the floor to the player. */
  vacuum() {
    for (let i = 0; i < CAPACITY; i++) {
      if (this.alive[i] && this.kind[i] === KIND.gem && this.pull[i] === 0) this.pull[i] = 0.001;
    }
  }

  clear() {
    for (let i = 0; i < CAPACITY; i++) if (this.alive[i]) this._free(i);
  }

  _free(i) {
    this.alive[i] = 0;
    this.free.push(i);
    this.count--;
  }

  update(dt, player) {
    const magnet = player.stats.magnet;
    this._comboT -= dt;
    if (this._comboT <= 0) this._combo = 0;

    for (let i = 0; i < CAPACITY; i++) {
      if (!this.alive[i]) continue;
      const dx = player.x - this.x[i];
      const dz = player.z - this.z[i];
      const d = Math.hypot(dx, dz);
      const kind = this.kind[i];
      const reach = kind === KIND.chest ? 1.4 : magnet;

      if (this.pull[i] === 0 && d < reach && player.alive) this.pull[i] = 0.001;
      if (this.pull[i] > 0) {
        this.pull[i] += dt;
        // A small hop away first, then an accelerating dive in.
        const t = this.pull[i];
        const speed = t < 0.12 ? -3 : 4 + (t - 0.12) * 40;
        const step = Math.min(d, speed * dt);
        this.x[i] += (dx / (d || 1)) * step;
        this.z[i] += (dz / (d || 1)) * step;
        if (d < 0.5 && t > 0.12) this._collect(i, player);
      }
    }
  }

  _collect(i, player) {
    const ctx = this.ctx;
    const kind = this.kind[i];
    const value = this.value[i];
    this._free(i);
    switch (kind) {
      case KIND.gem:
        this._combo++;
        this._comboT = 0.4;
        ctx.sfx.gem(this._combo);
        ctx.onXp(value);
        break;
      case KIND.heart:
        player.heal(player.stats.maxHp * 0.3);
        ctx.sfx.heal();
        break;
      case KIND.magnet:
        this.vacuum();
        ctx.sfx.magnet();
        break;
      case KIND.chest:
        ctx.onChest();
        break;
    }
  }

  render() {
    const g = this.gems.attrs;
    const b = this.boxes.attrs;
    const h = this.halos.attrs;
    let gc = 0;
    let bc = 0;
    let hc = 0;
    const tmp = this._c ?? (this._c = new Color());
    for (let i = 0; i < CAPACITY; i++) {
      if (!this.alive[i]) continue;
      const kind = this.kind[i];
      let look;
      if (kind === KIND.gem) {
        look = TIERS[0];
        for (const t of TIERS) if (this.value[i] >= t.min) look = t;
      } else {
        look = KIND_LOOK[kind];
      }
      tmp.set(look.color);
      const isBox = kind === KIND.chest;
      const target = isBox ? b : g;
      const k = isBox ? bc++ : gc++;
      if (isBox && bc > 32) { bc--; continue; }
      target.aPos.array[k * 4] = this.x[i];
      target.aPos.array[k * 4 + 1] = this.z[i];
      target.aPos.array[k * 4 + 2] = look.size;
      target.aPos.array[k * 4 + 3] = this.seed[i];
      tmp.toArray(target.aColor.array, k * 3);
      target.aKind.array[k] = kind;
      if (kind !== KIND.gem && hc < 64) {
        const q = hc++;
        h.aPos.array[q * 4] = this.x[i];
        h.aPos.array[q * 4 + 1] = this.z[i];
        h.aPos.array[q * 4 + 2] = look.size;
        tmp.toArray(h.aColor.array, q * 3);
      }
    }
    this.gems.geometry.instanceCount = gc;
    this.boxes.geometry.instanceCount = bc;
    this.halos.geometry.instanceCount = hc;
    for (const set of [g, b, h]) for (const a of Object.values(set)) a.needsUpdate = true;
  }
}
