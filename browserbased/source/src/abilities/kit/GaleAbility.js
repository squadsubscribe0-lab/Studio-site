import { Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { getColor } from '../../utils/color.js';
import { hash11 } from '../../utils/math.js';

const MAX_BLADES = 9;
const _p = new Vector3();
const _d = new Vector3();

const BLADE_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uStagger;
  uniform float uSpeed;
  uniform float uBladeR;
  uniform float uGrow;
  uniform float uArc;
  uniform float uThick;
  uniform float uHeight;
  uniform float uWeave;
  uniform float uRoll;
  uniform float uRollJitter;
  uniform float uSpin;
  uniform float uSpread;

  varying vec2  vUv;
  varying float vLife;
  varying float vIdx;

  void main() {
    float i = aIndex;
    float t = uAge - i * uStagger;              // this blade's own clock
    float travel = uLength / max(uSpeed, 1e-3);
    float dist = clamp(t * uSpeed, 0.0, uLength);
    float s = dist / uLength;
    float since = max(0.0, t - travel);        // seconds since it arrived
    float tear = smoothstep(0.0, 0.28, since);

    vLife = step(0.0, t) * (1.0 - tear);
    vIdx = i;
    vUv = position.xy;
    if (vLife <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }

    float R = uBladeR * mix(1.0, uGrow, s) * (1.0 + tear * uSpread);
    float a = (position.x - 0.5) * uArc;
    float belly = sin(position.x * PI);
    float r = R - position.y * uThick * belly;
    vec2 local = vec2(cos(a), sin(a)) * r;

    float sideSign = mod(i, 2.0) * 2.0 - 1.0;
    float weave = sideSign * uWeave * sin(s * PI) * (0.6 + 0.4 * hash11(i * 7.3 + uSeed));
    float roll = uRoll + (hash11(i * 3.1 + uSeed) - 0.5) * uRollJitter + uSpin * t;
    vec3 lat = uSide * cos(roll) + vec3(0.0, 1.0, 0.0) * sin(roll);

    vec3 center = uOrigin + uDir * (dist - R * 0.9) + uSide * weave + vec3(0.0, uHeight, 0.0);
    vec3 world = center + uDir * local.x + lat * local.y;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const BLADE_FRAGMENT = /* glsl */ `
  uniform float uStreaks;
  uniform float uStreakSpeed;
  varying vec2  vUv;
  varying float vLife;
  varying float vIdx;

  void main() {
    if (vLife <= 0.0) discard;
    float edge = pow(1.0 - vUv.y, 2.4);
    float tips = pow(sin(vUv.x * PI), 0.8);
    float n = fbm3(vec3(vUv.x * 9.0 - uTime * uStreakSpeed, vUv.y * 2.5, vIdx * 3.7 + uSeed)) * 0.5 + 0.5;
    float streak = smoothstep(0.45, 0.85, n) * (1.0 - vUv.y) * uStreaks;
    vec3 col = mix(uColorB, uColorA, edge) + uColorC * pow(edge, 8.0) * 1.6;
    float alpha = (edge * 0.9 + streak) * tips * vLife * uFade * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow * uIntensity, alpha);
  }
`;

/**
 * GALE — a staggered volley of wind crescents.
 *
 * All blades are instances of one crescent grid; each runs on its own clock
 * (`age - index × stagger`), so the volley is a function of time rather than a
 * queue. The CPU mirrors the same clock only to know *when* each blade lands,
 * which is an event, and to shed particles from where it is.
 */
export class GaleAbility extends KitAbility {
  static layers = {
    gust: { shape: ParticleShape.STREAK, stretch: true, drag: 1.2, endSize: 0.3, stretchAmount: 0.18, softFade: 0.2 },
    leaves: { shape: ParticleShape.LEAF, additive: false, lit: true, curl: true, drag: 0.8, endSize: 0.9, fadeOut: 0.7 },
    dust: { shape: ParticleShape.SMOKE, additive: false, curl: true, drag: 1.8, endSize: 2.4, fadeIn: 0.2, fadeOut: 0.3, softFade: 1.0 }
  };

  constructor(ctx) {
    super('gale', ctx);
  }

  buildMeshes() {
    this.geometry = createParamGrid(40, 6, MAX_BLADES);
    this.blade = createKitMaterial({
      vertexShader: BLADE_VERTEX,
      fragmentShader: BLADE_FRAGMENT,
      uniforms: {
        uStagger: { value: 0.1 }, uSpeed: { value: 30 }, uBladeR: { value: 1 }, uGrow: { value: 1.5 },
        uArc: { value: 2 }, uThick: { value: 0.3 }, uHeight: { value: 1 }, uWeave: { value: 1 },
        uRoll: { value: 0 }, uRollJitter: { value: 1 }, uSpin: { value: 2 }, uSpread: { value: 1.5 },
        uStreaks: { value: 0.5 }, uStreakSpeed: { value: 6 }
      }
    });
    this.makeMesh(this.geometry, this.blade, 13);
    this.arrived = new Array(MAX_BLADES).fill(false);
  }

  get count() {
    return Math.max(1, Math.min(MAX_BLADES, Math.round(this.cfg.blades)));
  }

  get instanceCount() {
    return this.count;
  }

  /** The hold lasts until the last blade has landed and torn apart. */
  get impactDuration() {
    return Math.max(super.impactDuration, this.count * this.cfg.stagger + 0.35);
  }

  onCast() {
    this.arrived.fill(false);
  }

  _bladePoint(i, out) {
    const c = this.cfg;
    const t = this.age - i * c.stagger;
    const dist = Math.min(Math.max(t * c.speed, 0), this.length);
    const s = dist / this.length;
    const sign = i % 2 === 1 ? 1 : -1;
    const weave = sign * c.weave * Math.sin(s * Math.PI) * (0.6 + 0.4 * hash11(i * 7.3 + this.seed));
    return this.pointAt(s, out).addScaledVector(this.side, weave).setY(c.height);
  }

  step(dt, beat) {
    const c = this.cfg;
    const u = this.blade.uniforms;
    u.uStagger.value = c.stagger;
    u.uSpeed.value = c.speed;
    u.uBladeR.value = c.bladeRadius;
    u.uGrow.value = c.grow;
    u.uArc.value = c.arc;
    u.uThick.value = c.thickness;
    u.uHeight.value = c.height;
    u.uWeave.value = c.weave;
    u.uRoll.value = c.roll;
    u.uRollJitter.value = c.rollJitter;
    u.uSpin.value = c.spin;
    u.uSpread.value = c.burstSpread;
    u.uStreaks.value = c.streaks;
    u.uStreakSpeed.value = c.streakSpeed;
    this.geometry.instanceCount = this.count;

    const travel = this.length / Math.max(c.speed, 1e-3);
    const scale = beat.phase === 'fade' ? 0.3 : 1;
    const n = this.count;
    const gust = this.tick('gust', dt, scale);
    const leaves = this.tick('leaves', dt, scale);
    const dust = this.tick('dust', dt, scale);

    let flying = 0;
    for (let i = 0; i < n; i++) {
      const t = this.age - i * c.stagger;
      if (t < 0) continue;
      if (t < travel) flying++;
      if (!this.arrived[i] && t >= travel) {
        this.arrived[i] = true;
        this._bladePoint(i, _p);
        this.decal(DecalType.DUSTRING, _p, { radius: c.bladeRadius * c.grow * 1.4, life: 0.9, colorA: getColor(c.colorDustB), colorB: getColor(c.colorDustA) });
        this.burst('gust', 26, { position: _p, radius: 0.4, direction: this.direction, spread: 1, speed: 1.6 });
        this.burst('leaves', 6, { position: _p, radius: 0.6, spread: 1, speed: 1.2, spin: 6 });
        this.ctx.shake.add(0.08, 3, 24);
      }
    }
    if (flying === 0) return;

    // Split this frame's particles between the blades that are still in the air.
    for (let i = 0; i < n; i++) {
      const t = this.age - i * c.stagger;
      if (t < 0 || t >= travel) continue;
      this._bladePoint(i, _p);
      if (i === n - 1 || i === 0) this.position.copy(_p);
      _d.copy(this.direction).multiplyScalar(-0.4).setY(0.15).normalize();
      this.emit('gust', Math.ceil(gust / flying), { position: _p, radius: c.bladeRadius * 0.8, direction: _d, spread: 0.35 });
      if (leaves > 0 && Math.random() < 1 / flying) {
        this.emit('leaves', leaves, { position: _p, radius: c.bladeRadius * 0.6, direction: _d, spread: 1, spin: 7 });
      }
      if (dust > 0 && Math.random() < 1 / flying) {
        _p.y = 0.25;
        this.emit('dust', dust, { position: _p, radius: 0.8, spread: 1, spin: 0.4 });
      }
    }
  }

  onLand() {
    this.pointAt(1, _p).setY(this.cfg.height);
    this.impactFx(_p, { scale: 0.8 });
  }
}
