import { IcosahedronGeometry, Vector3, FrontSide } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid, createInstancedQuad, instanceGeometry } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { getColor } from '../../utils/color.js';
import { smoothstep, saturate } from '../../utils/math.js';

const _p = new Vector3();
const _a = new Vector3();
const _d = new Vector3();

/** Shared: where the hole is and how big it is right now. */
const HOLE_GLSL = /* glsl */ `
  uniform float uHover;
  uniform float uCore;
  uniform float uScale;   // grow × implode, CPU-resolved
  vec3 holePos() { return uCenter + vec3(0.0, uHover, 0.0); }
`;

const CORE_VERTEX = /* glsl */ `
  ${HOLE_GLSL}
  varying vec3 vN;
  varying vec3 vWorld;
  void main() {
    if (uScale <= 0.001) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec3 world = holePos() + position * uCore * uScale;
    vN = normalize(position);
    vWorld = world;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const CORE_FRAGMENT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vWorld;
  void main() {
    vec3 V = normalize(cameraPosition - vWorld);
    float rim = pow(1.0 - max(dot(normalize(vN), V), 0.0), 5.0);
    vec3 col = uColorC + (uColorB + uColorA * rim) * rim * 2.5 * uGlow * uGlobalGlow;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const DISK_VERTEX = /* glsl */ `
  ${HOLE_GLSL}
  uniform float uInner;
  uniform float uTilt;
  varying vec2 vUv;
  varying float vR;
  void main() {
    if (uScale <= 0.001) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    float r = mix(uInner * uCore, uRadius, position.x) * uScale;
    float a = position.y * TAU;
    vec3 ax = uSide;
    vec3 ay = normalize(uDir * cos(uTilt) + vec3(0.0, sin(uTilt), 0.0));
    vec3 world = holePos() + (ax * cos(a) + ay * sin(a)) * r;
    vUv = position.xy;
    vR = r;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const DISK_FRAGMENT = /* glsl */ `
  uniform float uSpin;
  uniform float uArms;
  varying vec2 vUv;
  varying float vR;
  void main() {
    float a = vUv.y * TAU;
    float r = max(vR, 0.05);
    float swirl = a * uArms - log(r) * 5.0 + uTime * uSpin / r;
    float arms = pow(sin(swirl) * 0.5 + 0.5, 3.0);
    float n = fbm3(vec3(cos(a) * 3.0, sin(a) * 3.0, r * 2.0 - uTime * 0.7 + uSeed)) * 0.5 + 0.5;
    float falloff = pow(1.0 - vUv.x, 1.6);
    float inner = smoothstep(0.0, 0.06, vUv.x);
    float doppler = 1.0 + 0.6 * cos(a);
    vec3 col = mix(uColorB, uColorA, pow(1.0 - vUv.x, 4.0));
    float alpha = (arms * 0.7 + n * 0.5) * falloff * inner * doppler * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const LENS_VERTEX = /* glsl */ `
  ${HOLE_GLSL}
  uniform float uLens;
  varying vec2 vUv;
  void main() {
    if (uScale <= 0.001) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec4 mv = viewMatrix * vec4(holePos(), 1.0);
    mv.xy += position.xy * uCore * uLens * uScale * 2.0;
    vUv = position.xy + 0.5;
    gl_Position = projectionMatrix * mv;
  }
`;

const LENS_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    float d = length(c);
    if (d > 1.0) discard;
    float ang = atan(c.y, c.x);
    float photon = smoothstep(0.03, 0.0, abs(d - 0.34));
    float lens = smoothstep(1.0, 0.34, d) * smoothstep(0.3, 0.4, d);
    float streak = pow(snoise(vec3(ang * 3.0, d * 6.0 - uTime * 2.0, uSeed)) * 0.5 + 0.5, 3.0);
    vec3 col = uColorA * photon * 2.0 + uColorB * lens * streak * 0.8;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, (photon + lens * 0.4) * uFade);
  }
`;

const FLOOR_VERTEX = /* glsl */ `
  ${HOLE_GLSL}
  varying vec2 vQ;
  void main() {
    if (uHold <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec2 q = position.xy * 2.0 - 1.0;
    vec3 world = uCenter + (uSide * q.x + uDir * q.y) * uRadius * 1.15 + vec3(0.0, 0.03, 0.0);
    vQ = q * 1.15;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const FLOOR_FRAGMENT = /* glsl */ `
  ${HOLE_GLSL}
  uniform float uVoid;
  uniform float uSpin;
  varying vec2 vQ;
  void main() {
    float d = length(vQ);
    if (d > 1.0) discard;
    float ang = atan(vQ.y, vQ.x);
    float spiral = sin(ang * 3.0 + log(max(d, 0.02)) * 6.0 + uTime * uSpin) * 0.5 + 0.5;
    float dark = smoothstep(1.0, 0.2, d) * (0.6 + 0.4 * spiral);
    float edge = smoothstep(0.04, 0.0, abs(d - 0.97)) * 0.8;
    vec3 col = uColorB * (edge + spiral * smoothstep(1.0, 0.5, d) * 0.15) * uGlow;
    gl_FragColor = vec4(col, max(dark * uVoid, edge) * uFade * uScale);
  }
`;

/**
 * SINGULARITY — a far cast: a black hole over the circle.
 *
 * Four passes share one centre and one live scale (grow on landing, implode
 * partway through the fade): an opaque core with an event-horizon rim, a
 * tilted accretion disk with log-spiral arms, a camera-facing photon ring, and
 * a void pool on the floor. Motes use swirl mode with *negative* expansion so
 * the GPU spirals them inward; streaks are fired straight at the core.
 */
export class SingularityAbility extends KitAbility {
  static zone = true;
  static layers = {
    motes: { shape: ParticleShape.SOFT, swirl: true, drag: 1, endSize: 0.3, swirlExpand: -0.95, fadeIn: 0.2, fadeOut: 0.5 },
    streaks: { shape: ParticleShape.STREAK, stretch: true, drag: 0, endSize: 0.2, stretchAmount: 0.2, fadeIn: 0.2, fadeOut: 0.8, softFade: 0.2 },
    debris: { shape: ParticleShape.CHIP, additive: false, lit: true, drag: 0, endSize: 0.1, fadeOut: 0.8, softFade: 0.2 }
  };

  constructor(ctx) {
    super('singularity', ctx);
  }

  buildMeshes() {
    const hole = () => ({ uHover: { value: 2 }, uCore: { value: 0.7 }, uScale: { value: 0 } });
    this.core = createKitMaterial({ vertexShader: CORE_VERTEX, fragmentShader: CORE_FRAGMENT, additive: false, transparent: false, depthWrite: true, side: FrontSide, uniforms: hole() });
    this.disk = createKitMaterial({ vertexShader: DISK_VERTEX, fragmentShader: DISK_FRAGMENT, uniforms: { ...hole(), uInner: { value: 1.5 }, uTilt: { value: 0.3 }, uSpin: { value: 2 }, uArms: { value: 3 } } });
    this.lens = createKitMaterial({ vertexShader: LENS_VERTEX, fragmentShader: LENS_FRAGMENT, uniforms: { ...hole(), uLens: { value: 3 } } });
    this.floor = createKitMaterial({ vertexShader: FLOOR_VERTEX, fragmentShader: FLOOR_FRAGMENT, additive: false, uniforms: { ...hole(), uVoid: { value: 0.8 }, uSpin: { value: 2 } } });
    this.holeMats = [this.core, this.disk, this.lens, this.floor];
    this.makeMesh(createParamGrid(2, 2), this.floor, 7);
    this.makeMesh(instanceGeometry(new IcosahedronGeometry(1, 3), 1), this.core, 9);
    this.makeMesh(createParamGrid(16, 128), this.disk, 12);
    this.makeMesh(createInstancedQuad(1), this.lens, 13);
    this._popped = false;
  }

  onCast() {
    this._popped = false;
  }

  _scale(beat) {
    const c = this.cfg;
    if (beat.phase === 'travel') return 0;
    const grow = smoothstep(0, c.growTime, this.holdTime);
    if (beat.phase !== 'fade') return grow * (1 + 0.04 * Math.sin(this.age * 20));
    // Hold, then collapse to nothing at `implodeAt`.
    return grow * (1 - smoothstep(c.implodeAt * 0.6, c.implodeAt, beat.t));
  }

  step(dt, beat) {
    const c = this.cfg;
    const scale = this._scale(beat);
    for (const m of this.holeMats) {
      m.uniforms.uHover.value = c.hoverHeight;
      m.uniforms.uCore.value = c.coreSize;
      m.uniforms.uScale.value = scale;
    }
    this.disk.uniforms.uInner.value = c.diskInner;
    this.disk.uniforms.uTilt.value = c.diskTilt;
    this.disk.uniforms.uSpin.value = c.diskSpin;
    this.disk.uniforms.uArms.value = c.diskArms;
    this.lens.uniforms.uLens.value = c.lensSize;
    this.floor.uniforms.uVoid.value = c.voidFloor;
    this.floor.uniforms.uSpin.value = c.diskSpin;

    if (beat.phase === 'travel') {
      this.pointAt(this.u, _p).setY(c.hoverHeight * this.u);
      this.emit('motes', this.tick('motes', dt, 0.3), { position: _p, radius: 0.3, spread: 1 });
      return;
    }

    this.center(_a).setY(c.hoverHeight);
    this.position.copy(_a);
    const R = this.zoneR;

    if (beat.phase === 'fade' && beat.t >= c.implodeAt && !this._popped) {
      this._popped = true;
      this.impactFx(_a, { scale: 1.2 });
      this.burst('streaks', 150, { position: _a, radius: 0.3, spread: 1, speed: 2.5, life: 1.2 });
      this.burst('motes', 120, { position: _a, radius: 0.5, spread: 1, speed: 0, anchor: _a });
      this.center(_p);
      this.decal(DecalType.ARC, _p, { radius: R * 1.4, life: 2.2, width: 0.7, intensity: 1, colorA: getColor(c.colorC), colorB: getColor(c.colorB) });
    }
    if (scale <= 0.01) return;

    const motes = this.tick('motes', dt, scale);
    for (let b = 0; b < 4 && motes > 0; b++) {
      const ang = Math.random() * Math.PI * 2;
      _p.copy(_a).addScaledVector(this.side, Math.cos(ang) * R).addScaledVector(this.direction, Math.sin(ang) * R);
      _p.y += (Math.random() - 0.5) * 0.6;
      this.emit('motes', Math.ceil(motes / 4), { position: _p, radius: 0.3, anchor: _a, speed: 0, spread: 0 });
    }

    // Streaks fired straight at the core from the rim; life matched to arrival.
    const streaks = this.tick('streaks', dt, scale);
    if (streaks > 0) {
      const ang = Math.random() * Math.PI * 2;
      const r = R * (0.8 + Math.random() * 0.6);
      _p.copy(_a).addScaledVector(this.side, Math.cos(ang) * r).addScaledVector(this.direction, Math.sin(ang) * r);
      _p.y += (Math.random() - 0.5) * 2;
      _d.copy(_a).sub(_p);
      const life = _d.length() / Math.max(0.1, c.streaksSpeed) / Math.max(0.05, c.streaksLifetime);
      this.emit('streaks', streaks, { position: _p, radius: 0.2, direction: _d.normalize(), spread: 0.05, speedVariance: 0, life: saturate(life) });
    }

    // Floor debris ripped up toward the hole.
    const debris = this.tick('debris', dt, scale);
    if (debris > 0) {
      this.center(_p).addScaledVector(this.side, (Math.random() - 0.5) * R * 1.6).addScaledVector(this.direction, (Math.random() - 0.5) * R * 1.6);
      _p.y = 0.05;
      _d.copy(_a).sub(_p).normalize();
      this.emit('debris', debris, { position: _p, radius: 0.2, direction: _d, spread: 0.15, spin: 10 });
    }
    this.ctx.shake.rumble(0.05 * scale, dt);
  }

  onLand() {
    const c = this.cfg;
    this.center(_p);
    this.decal(DecalType.SHOCKWAVE, _p, { radius: this.zoneR * 1.2, life: 0.5, width: 0.05, colorA: getColor(c.colorB), colorB: getColor(c.colorA) });
    this.ctx.flash.trigger(getColor(c.colorC), 0.15);
  }
}
