import { Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { getColor } from '../../utils/color.js';
import { lerp, smoothstep } from '../../utils/math.js';

const MAX_SHELLS = 4;
const _p = new Vector3();
const _a = new Vector3();
const _d = new Vector3();

const FUNNEL_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uHeight;
  uniform float uBaseR;
  uniform float uTopR;
  uniform float uFlare;
  uniform float uSway;
  uniform float uSwayScale;
  uniform float uSpin;
  uniform float uGrow;
  uniform float uShells;
  varying vec2 vUv;
  varying float vShell;
  varying vec3 vRadial;
  varying vec3 vWorld;

  void main() {
    float shell = aIndex;
    if (uHold <= 0.0 || shell > uShells - 0.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    float k = position.x;
    float grow = smoothstep(0.0, max(uGrow, 1e-3), uHold);
    float H = uHeight * grow * mix(0.6, 1.0, uFade);
    float lr = 1.0 - shell * 0.2;
    float R = uRadius * mix(uBaseR, uTopR, pow(k, uFlare)) * lr * mix(0.35, 1.0, uFade) * (0.4 + 0.6 * grow);

    vec2 sway = vec2(
      snoise(vec3(k * uSwayScale * H, uTime * 0.5, uSeed)),
      snoise(vec3(k * uSwayScale * H + 5.0, uTime * 0.5, uSeed))
    ) * uSway * k;
    float a = position.y * TAU + uTime * uSpin * (1.0 + k * 0.6) * (1.0 + shell * 0.25);
    vec3 axis = uCenter + uSide * sway.x + uDir * sway.y + vec3(0.0, k * H, 0.0);
    vRadial = uSide * cos(a) + uDir * sin(a);
    vec3 world = axis + vRadial * R;
    vUv = position.xy;
    vShell = shell;
    vWorld = world;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const FUNNEL_FRAGMENT = /* glsl */ `
  uniform float uTwist;
  uniform float uBands;
  varying vec2 vUv;
  varying float vShell;
  varying vec3 vRadial;
  varying vec3 vWorld;

  void main() {
    float k = vUv.x;
    float wrap = vUv.y * uBands + k * uTwist;
    float n = fbm3(vec3(wrap, k * 6.0 - uTime * 1.5, vShell * 7.0 + uSeed)) * 0.5 + 0.5;
    float band = smoothstep(0.35, 0.85, n);
    float ends = smoothstep(0.0, 0.12, k) * smoothstep(1.0, 0.8, k);
    vec3 V = normalize(cameraPosition - vWorld);
    float rim = pow(1.0 - abs(dot(normalize(vRadial), V)), 2.0);
    vec3 col = mix(uColorC, uColorB, n);
    col = mix(col, uColorA, band * rim);
    float alpha = (band * 0.55 + rim * 0.25) * ends * (1.0 - vShell * 0.2) * uOpacity * uFade;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

/**
 * CYCLONE — a far cast: a nested, swaying funnel standing in the circle.
 *
 * The funnel is a parameter tube (u up, v around) drawn as up to four nested
 * shells. Debris, dust and streaks use the particle system's *swirl* mode, so
 * the orbit is computed on the GPU around the circle's centre as an anchor.
 */
export class CycloneAbility extends KitAbility {
  static zone = true;
  static layers = {
    debris: { shape: ParticleShape.CHIP, additive: false, lit: true, swirl: true, drag: 0.5, endSize: 0.8, swirlExpand: 0.5, fadeOut: 0.8, softFade: 0.2 },
    dust: { shape: ParticleShape.SMOKE, additive: false, swirl: true, drag: 1.2, endSize: 2.2, swirlExpand: 0.9, fadeIn: 0.2, fadeOut: 0.3, softFade: 1.0 },
    streaks: { shape: ParticleShape.SOFT, swirl: true, drag: 0.8, endSize: 0.3, swirlExpand: 0.3, fadeOut: 0.5 }
  };

  constructor(ctx) {
    super('cyclone', ctx);
  }

  buildMeshes() {
    this.funnel = createKitMaterial({
      vertexShader: FUNNEL_VERTEX, fragmentShader: FUNNEL_FRAGMENT, additive: false,
      uniforms: {
        uHeight: { value: 7 }, uBaseR: { value: 0.2 }, uTopR: { value: 1.2 }, uFlare: { value: 1.6 },
        uSway: { value: 0.8 }, uSwayScale: { value: 0.25 }, uSpin: { value: 4 }, uGrow: { value: 0.5 },
        uShells: { value: 3 }, uTwist: { value: 3 }, uBands: { value: 7 }
      }
    });
    this.makeMesh(createParamGrid(40, 56, MAX_SHELLS), this.funnel, 11);
    this._ringClock = 0;
  }

  onCast() {
    this._ringClock = 0;
  }

  step(dt, beat) {
    const c = this.cfg;
    const u = this.funnel.uniforms;
    u.uHeight.value = c.funnelHeight;
    u.uBaseR.value = c.baseRadius;
    u.uTopR.value = c.topRadius;
    u.uFlare.value = c.flare;
    u.uSway.value = c.sway;
    u.uSwayScale.value = c.swayScale;
    u.uSpin.value = c.spinSpeed;
    u.uGrow.value = c.growTime;
    u.uShells.value = Math.min(MAX_SHELLS, Math.round(c.shells));
    u.uTwist.value = c.twist;
    u.uBands.value = c.bands;

    if (beat.phase === 'travel') {
      // The leash: a gust of streaks running out to the circle.
      this.pointAt(this.u, _p).setY(0.4);
      this.emit('dust', this.tick('dust', dt, 0.5), { position: _p, radius: 0.4, spread: 1 });
      return;
    }

    const R = this.zoneR;
    const grow = smoothstep(0, c.growTime, this.holdTime);
    const scale = (beat.phase === 'fade' ? this.fade : 1) * grow;
    this.center(_a);
    this.ctx.shake.rumble(c.rumble, dt);

    for (const key of ['debris', 'dust', 'streaks']) {
      const n = this.tick(key, dt, scale);
      if (n <= 0) continue;
      const k = key === 'dust' ? Math.random() * 0.2 : Math.random() * 0.8;
      const r = R * lerp(c.baseRadius, c.topRadius, Math.pow(k, c.flare));
      const ang = Math.random() * Math.PI * 2;
      _p.copy(_a).addScaledVector(this.side, Math.cos(ang) * r).addScaledVector(this.direction, Math.sin(ang) * r);
      _p.y = k * c.funnelHeight * grow;
      _d.set(0, 1, 0);
      this.emit(key, n, { position: _p, radius: 0.3, anchor: _a, direction: _d, spread: 0.2, spin: key === 'debris' ? 8 : 0.4 });
    }

    this._ringClock += dt;
    if (this._ringClock > 0.35 && beat.phase !== 'fade') {
      this._ringClock = 0;
      this.decal(DecalType.DUSTRING, _a, { radius: R * 1.3, life: 1.1, colorA: getColor(c.colorDustC), colorB: getColor(c.colorDustA) });
    }
  }

  onLand() {
    this.center(_p).setY(0.8);
    this.impactFx(_p);
  }
}
