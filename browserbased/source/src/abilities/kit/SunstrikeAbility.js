import { Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { getColor } from '../../utils/color.js';
import { smoothstep } from '../../utils/math.js';

const MAX_SHAFTS = 16;
const _p = new Vector3();
const _d = new Vector3();

const TIMING_GLSL = /* glsl */ `
  uniform float uCharge;
  uniform float uDrop;
  float strikeT() { return smoothstep(uCharge, uCharge + max(uDrop, 1e-3), uHold); }
  float sinceStrike() { return max(0.0, uHold - uCharge - uDrop); }
`;

const RUNE_VERTEX = /* glsl */ `
  varying vec2 vQ;
  void main() {
    if (uHold <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec2 q = position.xy * 2.0 - 1.0;
    vec3 world = uCenter + (uSide * q.x + uDir * q.y) * uRadius * 1.2 + vec3(0.0, 0.04, 0.0);
    vQ = q * 1.2;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const RUNE_FRAGMENT = /* glsl */ `
  ${TIMING_GLSL}
  uniform float uSpin;
  uniform float uGlyphs;
  uniform float uRuneGlow;
  varying vec2 vQ;

  float line(vec2 p, vec2 a, vec2 b, float w) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return smoothstep(w, 0.0, length(pa - ba * h));
  }

  void main() {
    float d = length(vQ);
    if (d > 1.15) discard;
    float charge = smoothstep(0.0, uCharge, uHold);
    float ang = atan(vQ.y, vQ.x);
    float spinA = ang + uHold * uSpin;

    float m = 0.0;
    // Rings draw themselves on, sweeping around as the circle charges.
    float sweep = step(fract((ang + PI) / TAU), charge);
    m += smoothstep(0.022, 0.0, abs(d - 1.0)) * sweep;
    m += smoothstep(0.015, 0.0, abs(d - 0.86)) * sweep;
    m += smoothstep(0.012, 0.0, abs(d - 0.45)) * step(0.3, charge);

    // Glyph band: each cell picks one of a few stroke patterns.
    float cells = uGlyphs;
    float cellA = fract(spinA / TAU * cells);
    float id = floor(spinA / TAU * cells);
    float band = smoothstep(0.87, 0.89, d) * smoothstep(0.99, 0.97, d);
    float h = fract(sin(id * 91.7 + uSeed) * 4375.85);
    float glyph = h < 0.33 ? step(abs(cellA - 0.5), 0.08)
                : h < 0.66 ? step(abs(fract(d * 20.0) - 0.5), 0.15) * step(abs(cellA - 0.5), 0.3)
                : step(abs(cellA - 0.5 - (d - 0.93) * 4.0), 0.07);
    m += glyph * band * step(h * 0.8, charge);

    // Hexagram, counter-rotating.
    vec2 p = vQ * mat2(cos(-uHold * uSpin * 1.5), -sin(-uHold * uSpin * 1.5), sin(-uHold * uSpin * 1.5), cos(-uHold * uSpin * 1.5));
    float star = 0.0;
    for (int k = 0; k < 6; k++) {
      float a0 = float(k) * TAU / 6.0;
      float a1 = a0 + TAU / 3.0;
      star += line(p, vec2(cos(a0), sin(a0)) * 0.84, vec2(cos(a1), sin(a1)) * 0.84, 0.012);
    }
    m += star * smoothstep(0.4, 0.9, charge);

    float flare = exp(-sinceStrike() * 3.0) * step(uCharge + uDrop, uHold);
    float wash = smoothstep(1.0, 0.0, d) * (0.08 + flare * 0.6);
    vec3 col = mix(uColorC, uColorB, clamp(m, 0.0, 1.0)) * m * uRuneGlow + uColorA * (m * flare + wash);
    float alpha = clamp(m + wash, 0.0, 1.0) * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const COLUMN_VERTEX = /* glsl */ `
  ${TIMING_GLSL}
  uniform float uSky;
  uniform float uColR;
  varying vec2 vUv;
  varying vec3 vRadial;
  varying vec3 vWorld;
  void main() {
    float st = strikeT();
    if (st <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    float bottom = uSky * (1.0 - st);
    float y = mix(bottom, uSky, position.x);
    float since = sinceStrike();
    float r = uColR * uRadius * (1.0 + 0.9 * exp(-since * 6.0)) * mix(0.15, 1.0, uFade);
    r *= 1.0 + 0.5 * smoothstep(1.5, 0.0, y);
    float a = position.y * TAU;
    vRadial = uSide * cos(a) + uDir * sin(a);
    vec3 world = uCenter + vRadial * r + vec3(0.0, y, 0.0);
    vUv = position.xy;
    vWorld = world;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const COLUMN_FRAGMENT = /* glsl */ `
  ${TIMING_GLSL}
  varying vec2 vUv;
  varying vec3 vRadial;
  varying vec3 vWorld;
  void main() {
    vec3 V = normalize(cameraPosition - vWorld);
    float facing = abs(dot(normalize(vRadial), V));
    float core = pow(facing, 1.5);
    float streak = smoothstep(0.3, 0.9, snoise(vec3(vUv.y * 16.0, vUv.x * 8.0 + uTime * 12.0, uSeed)) * 0.5 + 0.5);
    float top = smoothstep(1.0, 0.7, vUv.x);
    vec3 col = mix(uColorB, uColorA, core) * (0.55 + exp(-sinceStrike() * 4.0) * 1.1);
    float alpha = (0.15 + core * 0.55 + streak * 0.3) * top * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const SHAFT_VERTEX = /* glsl */ `
  attribute float aIndex;
  ${TIMING_GLSL}
  uniform float uShafts;
  uniform float uShaftH;
  uniform float uShaftW;
  varying vec2 vUv;
  varying float vIdx;
  void main() {
    if (uHold <= 0.0 || aIndex > uShafts - 0.5 || uHold > uCharge + uDrop + 0.3) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return;
    }
    float a = aIndex / uShafts * TAU + uHold * 0.8;
    vec3 base = uCenter + (uSide * cos(a) + uDir * sin(a)) * uRadius * 0.93;
    vec3 p = base + vec3(0.0, position.x * uShaftH, 0.0);
    vec3 w = faceCamera(p, vec3(0.0, 1.0, 0.0));
    vec3 world = p + w * (position.y * 2.0 - 1.0) * uShaftW;
    vUv = position.xy;
    vIdx = aIndex;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const SHAFT_FRAGMENT = /* glsl */ `
  ${TIMING_GLSL}
  varying vec2 vUv;
  varying float vIdx;
  void main() {
    float across = 1.0 - abs(vUv.y * 2.0 - 1.0);
    float fall = fract(vUv.x * 1.5 + uHold * 2.5 + vIdx * 0.37);
    float pulse = smoothstep(0.0, 0.2, fall) * smoothstep(0.6, 0.2, fall);
    float charge = smoothstep(0.0, uCharge, uHold);
    float gone = 1.0 - smoothstep(uCharge, uCharge + uDrop + 0.3, uHold);
    float alpha = across * across * (0.2 + pulse) * smoothstep(1.0, 0.4, vUv.x) * charge * gone * uOpacity;
    gl_FragColor = vec4(mix(uColorB, uColorA, pulse) * uGlow * uGlobalGlow, alpha);
  }
`;

const timing = () => ({ uCharge: { value: 0.6 }, uDrop: { value: 0.1 } });

/**
 * SUNSTRIKE — a far cast with a wind-up: charge, strike, burn.
 *
 * Everything keys off one clock, `uHold`, and two live durations: the rune
 * circle sweeps itself on through `chargeTime`, light shafts rain around its
 * rim, and at `chargeTime + dropTime` the column hits. The CPU watches the same
 * clock for the single strike event.
 */
export class SunstrikeAbility extends KitAbility {
  static zone = true;
  static layers = {
    sparks: { shape: ParticleShape.STREAK, stretch: true, drag: 0.7, endSize: 0.3, stretchAmount: 0.12, softFade: 0.2 },
    motes: { shape: ParticleShape.SOFT, drag: 0.6, endSize: 0.3, fadeIn: 0.2, fadeOut: 0.5 },
    embers: { shape: ParticleShape.SOFT, curl: true, drag: 1.1, endSize: 0.2, fadeOut: 0.5 }
  };

  constructor(ctx) {
    super('sunstrike', ctx);
  }

  buildMeshes() {
    this.rune = createKitMaterial({ vertexShader: RUNE_VERTEX, fragmentShader: RUNE_FRAGMENT, uniforms: { ...timing(), uSpin: { value: 0.5 }, uGlyphs: { value: 16 }, uRuneGlow: { value: 1 } } });
    this.column = createKitMaterial({ vertexShader: COLUMN_VERTEX, fragmentShader: COLUMN_FRAGMENT, uniforms: { ...timing(), uSky: { value: 30 }, uColR: { value: 0.6 } } });
    this.shaft = createKitMaterial({ vertexShader: SHAFT_VERTEX, fragmentShader: SHAFT_FRAGMENT, uniforms: { ...timing(), uShafts: { value: 10 }, uShaftH: { value: 7 }, uShaftW: { value: 0.1 } } });
    this.makeMesh(createParamGrid(2, 2), this.rune, 8);
    this.makeMesh(createParamGrid(24, 40), this.column, 13);
    this.makeMesh(createParamGrid(12, 2, MAX_SHAFTS), this.shaft, 12);
    this._struck = false;
  }

  /** The circle charges before anything lands, so the hold is at least that long. */
  get impactDuration() {
    const c = this.cfg;
    return Math.max(super.impactDuration, c.chargeTime + c.dropTime + 0.4);
  }

  onCast() {
    this._struck = false;
  }

  step(dt, beat) {
    const c = this.cfg;
    for (const m of [this.rune, this.column, this.shaft]) {
      m.uniforms.uCharge.value = c.chargeTime;
      m.uniforms.uDrop.value = c.dropTime;
    }
    this.rune.uniforms.uSpin.value = c.runeSpin;
    this.rune.uniforms.uGlyphs.value = c.runeGlyphs;
    this.rune.uniforms.uRuneGlow.value = c.runeGlow;
    this.column.uniforms.uSky.value = c.skyHeight;
    this.column.uniforms.uColR.value = c.columnRadius;
    this.shaft.uniforms.uShafts.value = Math.min(MAX_SHAFTS, Math.round(c.shafts));
    this.shaft.uniforms.uShaftH.value = c.shaftHeight;
    this.shaft.uniforms.uShaftW.value = c.shaftWidth;

    if (beat.phase === 'travel') return;

    const R = this.zoneR;
    const hitAt = c.chargeTime + c.dropTime;
    this.center(this.position).setY(1.5);

    if (this.holdTime < hitAt) {
      // Charging: motes drift down onto the circle.
      const k = smoothstep(0, c.chargeTime, this.holdTime);
      this.center(_p).setY(4);
      this.emit('motes', this.tick('motes', dt, k), { position: _p, radius: R, spread: 0.3 });
      this.ctx.shake.rumble(0.03 * k, dt);
      return;
    }

    if (!this._struck) {
      this._struck = true;
      this.center(_p).setY(0.8);
      this.impactFx(_p);
      _d.set(0, 1, 0);
      this.burst('sparks', 160, { position: _p, radius: R * 0.4, direction: _d, spread: 0.9 });
      this.burst('embers', 80, { position: _p, radius: R * 0.6, spread: 1, speed: 2 });
      this.center(_p);
      this.decal(DecalType.SCORCH, _p, { radius: R * 1.1, life: 5, intensity: 1.3, colorA: getColor('#1a0c04'), colorB: getColor(c.colorC), height: 0.015 });
      this.decal(DecalType.CRACK, _p, { radius: R * 1.4, life: 3.5, width: 0.35, colorA: getColor('#1a0c04'), colorB: getColor(c.colorB) });
    }

    const scale = beat.phase === 'fade' ? this.fade : 1;
    this.center(_p).setY(0.3);
    this.emit('embers', this.tick('embers', dt, scale), { position: _p, radius: R * c.columnRadius, spread: 0.7 });
  }

  onLand() {
    const c = this.cfg;
    this.center(_p);
    this.decal(DecalType.SHOCKWAVE, _p, { radius: this.zoneR * 1.1, life: 0.4, width: 0.04, colorA: getColor(c.colorC), colorB: getColor(c.colorB) });
  }
}
