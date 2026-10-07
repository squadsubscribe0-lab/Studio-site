import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  ShaderMaterial,
  AdditiveBlending,
  InstancedBufferAttribute,
  Mesh,
  Sphere,
  Vector3,
  InstancedBufferGeometry
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LAYER } from '../../core/Layers.js';
import { sharedUniforms } from '../../core/FrameUniforms.js';
import { settings } from '../../config/settings.js';

const CELL = 15;
const SPAN = 4; // cells each side of the player that get dressed
const MAX = (SPAN * 2 + 1) ** 2;
const PILLAR_R = 0.85;
const _o = new Object3D();

function hash(x, z, s) {
  const h = Math.sin(x * 127.1 + z * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
}

const FLAME_VERTEX = /* glsl */ `
  attribute vec3 aPos;
  varying vec2 vUv;
  varying float vSeed;
  void main() {
    vec4 mv = viewMatrix * vec4(aPos + vec3(0.0, 1.55, 0.0), 1.0);
    mv.xy += position.xy * vec2(0.7, 1.1);
    vUv = position.xy + vec2(0.5, 0.5);
    vSeed = aPos.x * 0.37 + aPos.z * 0.91;
    gl_Position = projectionMatrix * mv;
  }
`;

const FLAME_FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vSeed;
  float n2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(n2(i), n2(i + vec2(1, 0)), f.x), mix(n2(i + vec2(0, 1)), n2(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    vec2 p = vUv;
    float n = vnoise(vec2(p.x * 4.0 + vSeed, p.y * 3.0 - uTime * 3.5)) * 0.5 + vnoise(vec2(p.x * 8.0, p.y * 6.0 - uTime * 5.0)) * 0.25;
    float shape = smoothstep(0.5, 0.0, abs(p.x - 0.5) + (p.y) * 0.35 - n * 0.25);
    shape *= smoothstep(1.0, 0.15, p.y + n * 0.3) * smoothstep(0.0, 0.08, p.y);
    vec3 col = mix(vec3(1.0, 0.25, 0.05), vec3(1.0, 0.85, 0.45), smoothstep(0.3, 0.9, shape));
    gl_FragColor = vec4(col * shape * 2.2, 1.0);
  }
`;

const GLOW_VERTEX = /* glsl */ `
  attribute vec3 aPos;
  varying vec2 vUv;
  void main() {
    vec2 q = position.xy * 9.0;
    gl_Position = projectionMatrix * viewMatrix * vec4(aPos.x + q.x, 0.03, aPos.z + q.y, 1.0);
    vUv = position.xy * 2.0;
  }
`;

const GLOW_FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float d = length(vUv);
    float flicker = 0.85 + 0.15 * sin(uTime * 11.0) * sin(uTime * 7.3);
    gl_FragColor = vec4(vec3(1.0, 0.45, 0.15) * pow(smoothstep(1.0, 0.0, d), 2.0) * 0.28 * flicker, 1.0);
  }
`;

function billboards(capacity, material, order) {
  const g = new InstancedBufferGeometry();
  const quad = new BoxGeometry(1, 1, 0.001);
  g.setAttribute('position', quad.attributes.position);
  g.setIndex(quad.index);
  const attr = new InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
  g.setAttribute('aPos', attr);
  g.instanceCount = 0;
  g.boundingSphere = new Sphere(new Vector3(), 1e5);
  const mesh = new Mesh(g, material);
  mesh.frustumCulled = false;
  mesh.layers.set(LAYER.VFX);
  mesh.renderOrder = order;
  return { mesh, attr, geometry: g };
}

/**
 * The endless dungeon floor.
 *
 * The sandbox floor is a 400 m plane; here it is snapped to its own texture
 * tile as the player walks, so the stone never slides. Pillars and braziers
 * are a pure function of the grid cell (hashed), dressed only in the cells
 * around the player — the world is infinite and costs a fixed 81 instances.
 */
export class Dungeon {
  constructor(ctx) {
    this.ctx = ctx;
    const shaft = new CylinderGeometry(0.58, 0.7, 2.1, 8).translate(0, 1.05, 0);
    const base = new BoxGeometry(1.7, 0.45, 1.7).translate(0, 0.22, 0);
    const cap = new CylinderGeometry(0.5, 0.58, 0.5, 8, 1).translate(0.08, 2.3, 0).rotateZ(0.08);
    const pillar = mergeGeometries([shaft.toNonIndexed(), base.toNonIndexed(), cap.toNonIndexed()]);
    this.pillarMat = new MeshStandardMaterial({ color: new Color('#34302e'), roughness: 0.92, metalness: 0, flatShading: true });
    this.pillars = new InstancedMesh(pillar, this.pillarMat, MAX);
    this.pillars.castShadow = true;
    this.pillars.receiveShadow = true;
    this.pillars.frustumCulled = false;

    const bowl = mergeGeometries([
      new CylinderGeometry(0.45, 0.2, 0.35, 10).translate(0, 1.2, 0).toNonIndexed(),
      new CylinderGeometry(0.07, 0.1, 1.05, 6).translate(0, 0.52, 0).toNonIndexed(),
      new CylinderGeometry(0.35, 0.42, 0.1, 10).translate(0, 0.05, 0).toNonIndexed()
    ]);
    this.brazierMat = new MeshStandardMaterial({ color: new Color('#2a2420'), roughness: 0.6, metalness: 0.6 });
    this.braziers = new InstancedMesh(bowl, this.brazierMat, MAX);
    this.braziers.castShadow = true;
    this.braziers.frustumCulled = false;

    this.flames = billboards(MAX, new ShaderMaterial({ uniforms: sharedUniforms({}), vertexShader: FLAME_VERTEX, fragmentShader: FLAME_FRAGMENT, transparent: true, depthWrite: false, blending: AdditiveBlending }), 12);
    this.glows = billboards(MAX, new ShaderMaterial({ uniforms: sharedUniforms({}), vertexShader: GLOW_VERTEX, fragmentShader: GLOW_FRAGMENT, transparent: true, depthWrite: false, blending: AdditiveBlending }), 1);

    ctx.scene.add(this.pillars, this.braziers, this.flames.mesh, this.glows.mesh);
    this._cellX = null;
    this._cellZ = null;
    this.solid = []; // [x, z] of pillars currently dressed
  }

  /** What stands in a cell: 0 nothing, 1 pillar, 2 brazier, with a position. */
  _cell(cx, cz) {
    if (Math.abs(cx) <= 0 && Math.abs(cz) <= 0) return null; // keep the spawn clear
    const r = hash(cx, cz, 1);
    const kind = r < 0.42 ? 1 : r < 0.62 ? 2 : 0;
    if (!kind) return null;
    return {
      kind,
      x: (cx + 0.2 + hash(cx, cz, 2) * 0.6) * CELL,
      z: (cz + 0.2 + hash(cx, cz, 3) * 0.6) * CELL,
      s: 0.85 + hash(cx, cz, 4) * 0.35,
      rot: hash(cx, cz, 5) * Math.PI
    };
  }

  update(px, pz) {
    const ground = this.ctx.ground;
    const tile = Math.max(1, settings.environment.floorTextureScale);
    const gx = Math.round(px / tile) * tile;
    const gz = Math.round(pz / tile) * tile;
    if (ground.mesh.position.x !== gx || ground.mesh.position.z !== gz) {
      ground.mesh.position.set(gx, 0, gz);
      ground.mesh.updateMatrix();
    }

    const cx = Math.floor(px / CELL);
    const cz = Math.floor(pz / CELL);
    if (cx === this._cellX && cz === this._cellZ) return;
    this._cellX = cx;
    this._cellZ = cz;

    let np = 0;
    let nb = 0;
    this.solid.length = 0;
    const fa = this.flames.attr.array;
    const ga = this.glows.attr.array;
    for (let dz = -SPAN; dz <= SPAN; dz++) {
      for (let dx = -SPAN; dx <= SPAN; dx++) {
        const c = this._cell(cx + dx, cz + dz);
        if (!c) continue;
        _o.position.set(c.x, 0, c.z);
        _o.rotation.set(0, c.rot, 0);
        if (c.kind === 1) {
          _o.scale.set(c.s, c.s * (0.55 + hash(c.x, c.z, 6) * 0.6), c.s);
          _o.updateMatrix();
          this.pillars.setMatrixAt(np++, _o.matrix);
          this.solid.push(c.x, c.z, PILLAR_R * c.s);
        } else {
          _o.scale.set(1, 1, 1);
          _o.updateMatrix();
          this.braziers.setMatrixAt(nb, _o.matrix);
          fa[nb * 3] = ga[nb * 3] = c.x;
          fa[nb * 3 + 1] = ga[nb * 3 + 1] = 0;
          fa[nb * 3 + 2] = ga[nb * 3 + 2] = c.z;
          nb++;
          this.solid.push(c.x, c.z, 0.45);
        }
      }
    }
    this.pillars.count = np;
    this.braziers.count = nb;
    this.pillars.instanceMatrix.needsUpdate = true;
    this.braziers.instanceMatrix.needsUpdate = true;
    this.flames.geometry.instanceCount = nb;
    this.glows.geometry.instanceCount = nb;
    this.flames.attr.needsUpdate = true;
    this.glows.attr.needsUpdate = true;
  }

  /** Push a point-like body (`{x, z}`) out of every pillar. */
  collidePoint(body, radius) {
    const s = this.solid;
    for (let k = 0; k < s.length; k += 3) {
      const dx = body.x - s[k];
      const dz = body.z - s[k + 1];
      const rr = radius + s[k + 2];
      const d2 = dx * dx + dz * dz;
      if (d2 < rr * rr && d2 > 1e-8) {
        const d = Math.sqrt(d2);
        body.x = s[k] + (dx / d) * rr;
        body.z = s[k + 1] + (dz / d) * rr;
      }
    }
  }

  /** Same for enemy `i` in the SoA arrays. Only nearby pillars matter. */
  collide(enemies, i) {
    const s = this.solid;
    const x = enemies.x[i];
    const z = enemies.z[i];
    const r = enemies.radius[i];
    for (let k = 0; k < s.length; k += 3) {
      const dx = x - s[k];
      const dz = z - s[k + 1];
      const rr = r + s[k + 2];
      if (Math.abs(dx) > rr || Math.abs(dz) > rr) continue;
      const d2 = dx * dx + dz * dz;
      if (d2 < rr * rr && d2 > 1e-8) {
        const d = Math.sqrt(d2);
        enemies.x[i] = s[k] + (dx / d) * rr;
        enemies.z[i] = s[k + 1] + (dz / d) * rr;
        // Slide around rather than stick: nudge sideways.
        enemies.x[i] += (-dz / d) * 0.02;
        enemies.z[i] += (dx / d) * 0.02;
      }
    }
  }
}
