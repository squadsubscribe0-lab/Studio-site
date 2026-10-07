import { Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid, createInstancedQuad } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { getColor } from '../../utils/color.js';

const MAX_MISSILES = 10;
const TAU = Math.PI * 2;
const _p = new Vector3();

/** The flight path, shared by the orb and trail vertex shaders. */
const PATH_GLSL = /* glsl */ `
  uniform float uCount;
  uniform float uStagger;
  uniform float uSpeed;
  uniform float uHeight;
  uniform float uWeave;
  uniform float uLift;
  uniform float uWaves;

  // sRaw may run past 1; the head parks at the target.
  vec3 missile(float i, float sRaw) {
    float s = clamp(sRaw, 0.0, 1.0);
    float phi = i / uCount * TAU + uSeed;
    float env = sin(PI * s);
    float a = s * uWaves * TAU + phi;
    vec3 up = vec3(0.0, 1.0, 0.0);
    return uOrigin + uDir * (s * uLength)
      + uSide * (uWeave * env * cos(a))
      + up * (uHeight * (1.0 - 0.7 * s) + uLift * env * sin(a));
  }

  float missileS(float i) {
    return (uAge - i * uStagger) * uSpeed / max(uLength, 1e-3);
  }
`;

const TRAIL_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uTrailLen;
  uniform float uTrailW;
  ${PATH_GLSL}
  varying vec2 vUv;
  varying float vAlive;

  void main() {
    float i = aIndex;
    float head = missileS(i);
    float k = position.x;
    float sRaw = head - (1.0 - k) * uTrailLen / uLength;
    vAlive = step(0.0, head) * step(sRaw, 1.0) * step(i, uCount - 0.5);
    vUv = position.xy;
    if (vAlive <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    sRaw = max(sRaw, 0.0);
    vec3 p = missile(i, sRaw);
    vec3 t = missile(i, sRaw + 0.01) - missile(i, sRaw - 0.01);
    vec3 world = p + faceCamera(p, t) * (position.y * 2.0 - 1.0) * uTrailW * k;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const TRAIL_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying float vAlive;
  void main() {
    if (vAlive <= 0.0) discard;
    float across = abs(vUv.y * 2.0 - 1.0);
    float core = smoothstep(1.0, 0.0, across);
    float sparkle = smoothstep(0.7, 1.0, snoise(vec3(vUv.x * 18.0 - uTime * 10.0, across * 3.0, uSeed)));
    vec3 col = mix(uColorC, uColorB, vUv.x) + uColorA * pow(core, 4.0) * vUv.x;
    float alpha = core * pow(vUv.x, 1.5) * (0.8 + sparkle) * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const ORB_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uOrbSize;
  ${PATH_GLSL}
  varying vec2 vUv;
  varying float vIdx;
  void main() {
    float i = aIndex;
    float s = missileS(i);
    vUv = position.xy + 0.5;
    vIdx = i;
    if (s < 0.0 || s >= 1.0 || i > uCount - 0.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec4 mv = viewMatrix * vec4(missile(i, s), 1.0);
    float pulse = 1.0 + 0.15 * sin(uTime * 17.0 + i * 2.3);
    mv.xy += position.xy * uOrbSize * 2.0 * pulse;
    gl_Position = projectionMatrix * mv;
  }
`;

const ORB_FRAGMENT = /* glsl */ `
  uniform float uRuneSpin;
  varying vec2 vUv;
  varying float vIdx;
  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    float d = length(c);
    if (d > 1.0) discard;
    float core = pow(smoothstep(0.45, 0.0, d), 1.5);
    float halo = smoothstep(1.0, 0.2, d) * 0.35;
    float ang = atan(c.y, c.x) + uTime * uRuneSpin * (mod(vIdx, 2.0) * 2.0 - 1.0);
    float ring = smoothstep(0.06, 0.0, abs(d - 0.66));
    float ticks = step(0.55, fract(ang / TAU * 7.0)) * smoothstep(0.1, 0.0, abs(d - 0.66));
    vec3 col = uColorA * core * 2.0 + uColorB * (ring * 1.4 + halo) + uColorA * ticks;
    float alpha = clamp(core + halo + ring + ticks, 0.0, 1.0) * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const pathUniforms = () => ({
  uCount: { value: 6 }, uStagger: { value: 0.1 }, uSpeed: { value: 20 }, uHeight: { value: 1.3 },
  uWeave: { value: 1.5 }, uLift: { value: 1 }, uWaves: { value: 1 }
});

/**
 * ARCANE — a staggered salvo of homing rune-orbs with light trails.
 *
 * Each missile's path is one GLSL function of (index, time); the trail is the
 * same function sampled over the last few metres, so it collapses onto the
 * target on its own once the head parks there. `_missilePoint` mirrors it for
 * the CPU-side motes and the per-missile landing events.
 */
export class ArcaneAbility extends KitAbility {
  static layers = {
    motes: { shape: ParticleShape.SOFT, curl: true, drag: 1.4, endSize: 0.2, fadeOut: 0.5 },
    sparkle: { shape: ParticleShape.STREAK, stretch: true, drag: 1.5, endSize: 0.3, stretchAmount: 0.12, softFade: 0.2 },
    rings: { shape: ParticleShape.RING, drag: 1, endSize: 2.4, sizeIn: 0.02, fadeIn: 0.02, fadeOut: 0.3 }
  };

  constructor(ctx) {
    super('arcane', ctx);
  }

  buildMeshes() {
    this.trailGeo = createParamGrid(48, 2, MAX_MISSILES);
    this.orbGeo = createInstancedQuad(MAX_MISSILES);
    this.trail = createKitMaterial({
      vertexShader: TRAIL_VERTEX, fragmentShader: TRAIL_FRAGMENT,
      uniforms: { ...pathUniforms(), uTrailLen: { value: 3 }, uTrailW: { value: 0.15 } }
    });
    this.orb = createKitMaterial({
      vertexShader: ORB_VERTEX, fragmentShader: ORB_FRAGMENT,
      uniforms: { ...pathUniforms(), uOrbSize: { value: 0.5 }, uRuneSpin: { value: 3 } }
    });
    this.makeMesh(this.trailGeo, this.trail, 12);
    this.makeMesh(this.orbGeo, this.orb, 14);
    this.arrived = new Array(MAX_MISSILES).fill(false);
  }

  get count() {
    return Math.max(1, Math.min(MAX_MISSILES, Math.round(this.cfg.missiles)));
  }

  get instanceCount() {
    return this.count * 2;
  }

  get impactDuration() {
    const c = this.cfg;
    return Math.max(super.impactDuration, this.count * c.stagger + c.trailLength / Math.max(1, c.speed) + 0.2);
  }

  onCast() {
    this.arrived.fill(false);
  }

  _missilePoint(i, sRaw, out) {
    const c = this.cfg;
    const s = Math.min(Math.max(sRaw, 0), 1);
    const phi = (i / this.count) * TAU + this.seed;
    const env = Math.sin(Math.PI * s);
    const a = s * c.waves * TAU + phi;
    this.pointAt(s, out).addScaledVector(this.side, c.weave * env * Math.cos(a));
    out.y = c.height * (1 - 0.7 * s) + c.lift * env * Math.sin(a);
    return out;
  }

  step(dt, beat) {
    const c = this.cfg;
    for (const m of [this.trail, this.orb]) {
      const u = m.uniforms;
      u.uCount.value = this.count;
      u.uStagger.value = c.stagger;
      u.uSpeed.value = c.speed;
      u.uHeight.value = c.height;
      u.uWeave.value = c.weave;
      u.uLift.value = c.lift;
      u.uWaves.value = c.waves;
    }
    this.trail.uniforms.uTrailLen.value = c.trailLength;
    this.trail.uniforms.uTrailW.value = c.trailWidth;
    this.orb.uniforms.uOrbSize.value = c.orbSize;
    this.orb.uniforms.uRuneSpin.value = c.runeSpin;
    this.trailGeo.instanceCount = this.count;
    this.orbGeo.instanceCount = this.count;

    const motes = this.tick('motes', dt, beat.phase === 'fade' ? 0.2 : 1);
    let flying = 0;
    for (let i = 0; i < this.count; i++) {
      const s = ((this.age - i * c.stagger) * c.speed) / this.length;
      if (s < 0) continue;
      if (s >= 1) {
        if (!this.arrived[i]) this._land(i);
        continue;
      }
      flying++;
      this._missilePoint(i, s, _p);
      if (i === 0) this.position.copy(_p);
      if (motes > 0) this.emit('motes', Math.ceil(motes / this.count), { position: _p, radius: 0.15, spread: 1 });
    }
    if (flying === 0 && this.landed) this.center(this.position).setY(0.6);
  }

  _land(i) {
    const c = this.cfg;
    this.arrived[i] = true;
    this._missilePoint(i, 1, _p);
    this.impactFx(_p, { scale: 0.7 });
    this.burst('sparkle', 30, { position: _p, radius: 0.2, spread: 1, speed: 1 });
    this.burst('rings', 1, { position: _p, sizeVariance: 0.1 });
    this.decal(DecalType.ARC, _p, {
      radius: 1.2, life: 1.2, width: 0.6, intensity: 0.8,
      colorA: getColor(c.colorC), colorB: getColor(c.colorB)
    });
  }

  onLand() {
    // Each missile lands on its own clock in `step`; nothing global here.
  }
}
