import { Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { BurstMode } from '../../effects/BurstSphere.js';
import { getColor } from '../../utils/color.js';
import { smoothstep } from '../../utils/math.js';

const _p = new Vector3();
const _d = new Vector3();

const ERUPT_GLSL = /* glsl */ `
  uniform float uBuild;
  uniform float uSurgeRate;
  uniform float uSurge;
  float eruptT() { return smoothstep(uBuild, uBuild + 0.25, uHold); }
  float surgeAt(float k) {
    float ph = fract((uHold - uBuild) * uSurgeRate - k * 0.6);
    return exp(-ph * 5.0) * uSurge;
  }
`;

const COLUMN_VERTEX = /* glsl */ `
  ${ERUPT_GLSL}
  uniform float uColH;
  uniform float uColR;
  uniform float uCrown;
  varying vec2 vUv;
  varying vec3 vRadial;
  varying vec3 vWorld;
  void main() {
    float e = eruptT();
    if (e <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    float k = position.x;
    float H = uColH * e * mix(0.25, 1.0, uFade) * (1.0 + surgeAt(1.0) * 0.5);
    float a = position.y * TAU;
    float wobble = 1.0 + 0.15 * snoise(vec3(k * 4.0 - uTime * 3.0, a, uSeed));
    float r = uColR * (1.0 + surgeAt(k)) * wobble * mix(1.0, 0.55, k);
    r += uColR * uCrown * smoothstep(0.78, 1.0, k) * 2.0;
    float y = H * (k < 0.85 ? k : 0.85 + (k - 0.85) * 0.4);
    // The crown curls back down.
    y -= uColR * uCrown * smoothstep(0.9, 1.0, k) * 1.5;
    vRadial = uSide * cos(a) + uDir * sin(a);
    vec3 world = uCenter + vRadial * r + vec3(0.0, y, 0.0);
    vUv = position.xy;
    vWorld = world;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const COLUMN_FRAGMENT = /* glsl */ `
  ${ERUPT_GLSL}
  uniform float uFlow;
  uniform float uCrust;
  uniform float uCrackGlow;
  varying vec2 vUv;
  varying vec3 vRadial;
  varying vec3 vWorld;
  void main() {
    vec3 V = normalize(cameraPosition - vWorld);
    float facing = abs(dot(normalize(vRadial), V));
    vec3 q = vec3(vUv.y * 6.0, vUv.x * 5.0 - uTime * uFlow * 0.4, uSeed);
    float heat = fbm3(q) * 0.5 + 0.5;
    float crust = smoothstep(0.45, 0.7, fbm3(q * 1.7 + 3.0) * 0.5 + 0.5) * uCrust * smoothstep(0.0, 0.5, vUv.x);
    vec3 col = mix(uColorB, uColorA, pow(heat, 2.0) * facing);
    col = mix(col, uColorC, crust * 0.85);
    col *= 1.0 + surgeAt(vUv.x) * uCrackGlow;
    float alpha = smoothstep(1.0, 0.92, vUv.x) * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const POOL_VERTEX = /* glsl */ `
  varying vec2 vQ;
  void main() {
    if (uHold <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec2 q = position.xy * 2.0 - 1.0;
    vec3 world = uCenter + (uSide * q.x + uDir * q.y) * uRadius * 1.1 + vec3(0.0, 0.04, 0.0);
    vQ = q * 1.1;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const POOL_FRAGMENT = /* glsl */ `
  ${ERUPT_GLSL}
  uniform float uCrust;
  uniform float uCrackGlow;
  varying vec2 vQ;
  void main() {
    float open = smoothstep(0.0, uBuild + 0.3, uHold);
    float d = length(vQ);
    float ang = atan(vQ.y, vQ.x);
    float reach = open * (0.9 - 0.12 * fbm3(vec3(cos(ang) * 2.0, sin(ang) * 2.0, uSeed)));
    if (d > reach) discard;
    vec2 cell = voronoi2(vQ * 5.0 * uRadius * 0.5 + uSeed);
    float seam = smoothstep(0.18, 0.02, cell.x);   // near a cell centre = plate interior
    float plates = 1.0 - seam;
    float molten = smoothstep(0.75, 1.0, 1.0 - cell.x) ; // unused-ish flavour
    float cracks = smoothstep(0.35, 0.6, cell.x);
    float rim = smoothstep(reach - 0.12, reach, d);
    float pulse = 1.0 + surgeAt(0.0) * 2.0;
    vec3 hot = mix(uColorB, uColorA, cracks * 0.6) * uCrackGlow * pulse;
    vec3 col = mix(hot, uColorC, (1.0 - cracks) * uCrust * mix(0.4, 1.0, d));
    col += uColorB * rim * 0.6 + uColorA * molten * 0.1;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, uFade * uOpacity);
  }
`;

const eruptUniforms = () => ({ uBuild: { value: 0.5 }, uSurgeRate: { value: 1.3 }, uSurge: { value: 0.35 } });

/**
 * GEYSER — a far cast: build-up, eruption, rhythmic surges.
 *
 * `surgeAt(k)` is a decaying pulse that travels up the column (the `- k × 0.6`
 * phase lag), so each surge visibly climbs. The CPU counts the same surges —
 * `floor((hold − build) × rate)` — to fire a fire-burst and a spray of molten
 * blobs at the top exactly when the shader's pulse arrives there.
 */
export class GeyserAbility extends KitAbility {
  static zone = true;
  static layers = {
    blobs: { shape: ParticleShape.SOFT, drag: 0.2, endSize: 0.6, fadeOut: 0.8, softFade: 0.2 },
    embers: { shape: ParticleShape.SOFT, curl: true, drag: 1.1, endSize: 0.2, fadeOut: 0.5 },
    smoke: { shape: ParticleShape.SMOKE, additive: false, curl: true, drag: 1.4, endSize: 3.2, fadeIn: 0.2, fadeOut: 0.3, softFade: 1.0 }
  };

  constructor(ctx) {
    super('geyser', ctx);
  }

  buildMeshes() {
    this.pool = createKitMaterial({
      vertexShader: POOL_VERTEX, fragmentShader: POOL_FRAGMENT, additive: false,
      uniforms: { ...eruptUniforms(), uCrust: { value: 1 }, uCrackGlow: { value: 1.4 } }
    });
    this.column = createKitMaterial({
      vertexShader: COLUMN_VERTEX, fragmentShader: COLUMN_FRAGMENT, additive: false, transparent: true,
      uniforms: { ...eruptUniforms(), uColH: { value: 8 }, uColR: { value: 0.7 }, uCrown: { value: 0.8 }, uFlow: { value: 4 }, uCrust: { value: 1 }, uCrackGlow: { value: 1.4 } }
    });
    this.makeMesh(createParamGrid(2, 2), this.pool, 7);
    this.makeMesh(createParamGrid(48, 36), this.column, 11);
    this._surges = 0;
    this._erupted = false;
  }

  get impactDuration() {
    return Math.max(super.impactDuration, this.cfg.buildTime + 0.5);
  }

  onCast() {
    this._surges = 0;
    this._erupted = false;
  }

  step(dt, beat) {
    const c = this.cfg;
    for (const m of [this.pool, this.column]) {
      m.uniforms.uBuild.value = c.buildTime;
      m.uniforms.uSurgeRate.value = c.surgeRate;
      m.uniforms.uSurge.value = c.surge;
      m.uniforms.uCrust.value = c.crust;
      m.uniforms.uCrackGlow.value = c.crackGlow;
    }
    const col = this.column.uniforms;
    col.uColH.value = c.columnHeight;
    col.uColR.value = c.columnRadius;
    col.uCrown.value = c.crown;
    col.uFlow.value = c.flowSpeed;

    if (beat.phase === 'travel') return;

    const R = this.zoneR;
    if (this.holdTime < c.buildTime) {
      const k = this.holdTime / c.buildTime;
      this.ctx.shake.rumble(c.rumble * 2 * k, dt);
      this.center(_p).setY(0.1);
      this.emit('smoke', this.tick('smoke', dt, k * 0.6), { position: _p, radius: R * 0.8, spread: 0.5 });
      this.emit('embers', this.tick('embers', dt, k), { position: _p, radius: R * 0.8, spread: 0.6 });
      return;
    }

    const e = smoothstep(c.buildTime, c.buildTime + 0.25, this.holdTime);
    const top = c.columnHeight * e * (beat.phase === 'fade' ? 0.25 + 0.75 * this.fade : 1);
    this.center(this.position).setY(top * 0.5 + 0.5);

    if (!this._erupted) {
      this._erupted = true;
      this.center(_p).setY(0.6);
      this.impactFx(_p);
      this.center(_p);
      this.ctx.fissures.spawn(_p, { radius: R * 1.4, life: this.impactDuration + this.fadeDuration });
    }

    // Surges, counted on the shader's clock.
    const surges = Math.floor((this.holdTime - c.buildTime) * c.surgeRate + 0.6);
    if (surges > this._surges && beat.phase !== 'fade') {
      this._surges = surges;
      this.center(_p).setY(top);
      this.ctx.bursts.spawn(BurstMode.FIRE, _p, {
        radius: 0.4, endRadius: c.columnRadius * 3, life: 0.5, intensity: 1,
        colorA: getColor(c.colorBurstA), colorB: getColor(c.colorBurstB), colorC: getColor(c.colorBurstC)
      });
      _d.set(0, 1, 0);
      this.burst('blobs', 28, { position: _p, radius: c.columnRadius, direction: _d, spread: 0.6 });
      this.ctx.shake.add(0.12, 3, 20);
      this.lightBoost = c.lightIntensity * 0.6;
    }

    const scale = beat.phase === 'fade' ? this.fade : 1;
    this.center(_p).setY(top);
    _d.set(0, 1, 0);
    this.emit('blobs', this.tick('blobs', dt, scale), { position: _p, radius: c.columnRadius, direction: _d, spread: 0.45 });
    this.emit('embers', this.tick('embers', dt, scale), { position: _p, radius: c.columnRadius * 1.5, spread: 1 });
    this.center(_p).setY(top * 0.7);
    this.emit('smoke', this.tick('smoke', dt, scale), { position: _p, radius: c.columnRadius * 1.5, spread: 0.6, spin: 0.3 });
    this.ctx.shake.rumble(c.rumble * scale, dt);
  }
}
