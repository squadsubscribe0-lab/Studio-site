import { Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { BurstMode } from '../../effects/BurstSphere.js';
import { getColor } from '../../utils/color.js';
import { saturate, smoothstep, lerp, randRange } from '../../utils/math.js';

const MAX_STRANDS = 5;
const TAU = Math.PI * 2;
const _p = new Vector3();
const _q = new Vector3();
const _d = new Vector3();

const SERPENT_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uCount;
  uniform float uBodyLen;
  uniform float uBodyW;
  uniform float uHeadW;
  uniform float uHeight;
  uniform float uCoilR;
  uniform float uTwist;
  uniform float uUndulate;
  uniform float uUndSpeed;
  uniform float uRiseH;
  uniform float uRiseR;
  uniform float uRiseTurns;
  uniform float uCoilTime;
  uniform float uSpin;

  varying vec2  vUv;
  varying float vStrand;

  vec3 serpent(float k, float strand) {
    float head = min(uFront, uLength);
    float tail = max(0.0, head - uBodyLen);
    float b = mix(tail, head, k);
    float phase = strand / uCount * TAU;

    float ang = b * uTwist - uTime * 2.0 + phase;
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 braid = (uSide * cos(ang) + up * sin(ang)) * uCoilR;
    vec3 slither = uSide * uUndulate * sin(b * 1.1 - uTime * uUndSpeed);
    vec3 onLine = uOrigin + uDir * b + up * uHeight + braid + slither;

    float ca = k * TAU * uRiseTurns + uTime * uSpin + phase;
    float rr = uRiseR * (1.0 - 0.45 * k);
    vec3 pillar = uCenter + (uSide * cos(ca) + uDir * sin(ca)) * rr + up * (0.3 + k * uRiseH);

    float coil = smoothstep(0.0, max(uCoilTime, 1e-3), uHold);
    return mix(onLine, pillar, coil);
  }

  void main() {
    float k = position.x;
    float strand = aIndex;
    vec3 p = serpent(k, strand);
    vec3 q = serpent(min(k + 0.01, 1.0), strand);
    vec3 r = serpent(max(k - 0.01, 0.0), strand);
    vec3 tangent = q - r;

    float taper = pow(k, 0.7);
    float head = smoothstep(0.78, 0.95, k);
    float w = uBodyW * taper * mix(1.0, uHeadW / max(uBodyW, 1e-3), head) * smoothstep(1.0, 0.975, k);

    vec3 world = p + faceCamera(p, tangent) * (position.y * 2.0 - 1.0) * w;
    vUv = position.xy;
    vStrand = strand;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const SERPENT_FRAGMENT = /* glsl */ `
  uniform float uFlameSpeed;
  uniform float uFlameScale;
  uniform float uFlameEdge;
  uniform float uBodyLen;
  varying vec2  vUv;
  varying float vStrand;

  void main() {
    float across = abs(vUv.y * 2.0 - 1.0);
    vec3 q = vec3(vUv.x * uBodyLen * 0.7 * uFlameScale - uTime * uFlameSpeed, across * 2.2, vStrand * 3.1 + uSeed);
    float n = fbm3(q) * 0.5 + 0.5;
    float flame = smoothstep(1.0, 0.0, across + (n - 0.35) * uFlameEdge * 1.6);
    float heat = flame * mix(0.35, 1.0, vUv.x) * (0.7 + n * 0.6);

    vec3 col = mix(uColorC, uColorB, smoothstep(0.15, 0.55, heat));
    col = mix(col, uColorA, smoothstep(0.6, 1.0, heat));
    // A white-hot eye near the head.
    col += uColorA * smoothstep(0.9, 0.97, vUv.x) * (1.0 - across) * 1.5;

    float alpha = smoothstep(0.04, 0.3, heat) * uFade * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow * uIntensity, alpha);
  }
`;

/**
 * DRAGON — braided fire serpents that wind up into a pillar at the target.
 *
 * Each serpent is one instance of a camera-facing ribbon. Its path is a pure
 * function of (k along the body, strand, time), evaluated three times per
 * vertex for a tangent; after landing, the same function blends into a
 * vertical helix at the target over `coilTime`. `_serpentPoint` is the CPU
 * mirror, used only to shed embers from where the body actually is.
 */
export class DragonAbility extends KitAbility {
  static layers = {
    embers: { shape: ParticleShape.SOFT, curl: true, drag: 1.1, endSize: 0.2, fadeOut: 0.5, softFade: 0.3 },
    smoke: { shape: ParticleShape.SMOKE, additive: false, curl: true, drag: 1.6, endSize: 3.0, fadeIn: 0.2, fadeOut: 0.3, softFade: 1.0 },
    sparks: { shape: ParticleShape.STREAK, stretch: true, drag: 0.8, endSize: 0.3, stretchAmount: 0.14, softFade: 0.2 }
  };

  constructor(ctx) {
    super('dragon', ctx);
  }

  buildMeshes() {
    this.geometry = createParamGrid(110, 2, MAX_STRANDS);
    this.serpent = createKitMaterial({
      vertexShader: SERPENT_VERTEX,
      fragmentShader: SERPENT_FRAGMENT,
      uniforms: {
        uCount: { value: 3 }, uBodyLen: { value: 7 }, uBodyW: { value: 0.5 }, uHeadW: { value: 1 },
        uHeight: { value: 1.2 }, uCoilR: { value: 0.7 }, uTwist: { value: 1.3 }, uUndulate: { value: 0.5 },
        uUndSpeed: { value: 5 }, uRiseH: { value: 5 }, uRiseR: { value: 1.4 }, uRiseTurns: { value: 2 },
        uCoilTime: { value: 0.5 }, uSpin: { value: 3 }, uFlameSpeed: { value: 2.5 }, uFlameScale: { value: 1 },
        uFlameEdge: { value: 0.45 }
      }
    });
    this.makeMesh(this.geometry, this.serpent, 13);
    this._burnDistance = 0;
    this._blown = false;
  }

  get count() {
    return Math.max(1, Math.min(MAX_STRANDS, Math.round(this.cfg.strands)));
  }

  get instanceCount() {
    return this.count;
  }

  onCast() {
    this._burnDistance = 0;
    this._blown = false;
  }

  /** CPU mirror of the shader's `serpent()`. */
  _serpentPoint(k, strand, out) {
    const c = this.cfg;
    const time = this.serpent.uniforms.uTime.value;
    const head = Math.min(this.front, this.length);
    const tail = Math.max(0, head - c.bodyLength);
    const b = lerp(tail, head, k);
    const phase = (strand / this.count) * TAU;
    const ang = b * c.twist - time * 2 + phase;
    out.copy(this.origin).addScaledVector(this.direction, b);
    out.addScaledVector(this.side, Math.cos(ang) * c.coilRadius + c.undulate * Math.sin(b * 1.1 - time * c.undulateSpeed));
    out.y = c.height + Math.sin(ang) * c.coilRadius;

    const coil = this.landed ? smoothstep(0, c.coilTime, this.holdTime) : 0;
    if (coil > 0) {
      const ca = k * TAU * c.riseTurns + time * c.spinSpeed + phase;
      const rr = c.riseRadius * (1 - 0.45 * k);
      this.center(_q)
        .addScaledVector(this.side, Math.cos(ca) * rr)
        .addScaledVector(this.direction, Math.sin(ca) * rr);
      _q.y = 0.3 + k * c.riseHeight;
      out.lerp(_q, coil);
    }
    return out;
  }

  step(dt, beat) {
    const c = this.cfg;
    const u = this.serpent.uniforms;
    u.uCount.value = this.count;
    u.uBodyLen.value = c.bodyLength;
    u.uBodyW.value = c.bodyWidth;
    u.uHeadW.value = c.headSize;
    u.uHeight.value = c.height;
    u.uCoilR.value = c.coilRadius;
    u.uTwist.value = c.twist;
    u.uUndulate.value = c.undulate;
    u.uUndSpeed.value = c.undulateSpeed;
    u.uRiseH.value = c.riseHeight;
    u.uRiseR.value = c.riseRadius;
    u.uRiseTurns.value = c.riseTurns;
    u.uCoilTime.value = c.coilTime;
    u.uSpin.value = c.spinSpeed;
    u.uFlameSpeed.value = c.flameSpeed;
    u.uFlameScale.value = c.flameScale;
    u.uFlameEdge.value = c.flameEdge;
    this.geometry.instanceCount = this.count;

    this._serpentPoint(1, 0, this.position);

    const scale = beat.phase === 'fade' ? this.fade * 0.5 : 1;
    const embers = this.tick('embers', dt, scale);
    if (embers > 0) {
      const batches = Math.min(embers, 6);
      for (let b = 0; b < batches; b++) {
        this._serpentPoint(randRange(0.2, 1), Math.floor(Math.random() * this.count), _p);
        this.emit('embers', Math.ceil(embers / batches), { position: _p, radius: c.bodyWidth, spread: 1 });
      }
    }
    const sparks = this.tick('sparks', dt, scale);
    if (sparks > 0) {
      this._serpentPoint(randRange(0.7, 1), Math.floor(Math.random() * this.count), _p);
      _d.copy(this.direction).setY(0.6).normalize();
      this.emit('sparks', sparks, { position: _p, radius: c.headSize * 0.5, direction: _d, spread: 1 });
    }
    const smoke = this.tick('smoke', dt, scale);
    if (smoke > 0) {
      this._serpentPoint(randRange(0, 0.6), 0, _p);
      this.emit('smoke', smoke, { position: _p, radius: c.coilRadius, spread: 0.8, spin: 0.5 });
    }

    if (beat.phase === 'travel') {
      const stepLen = 1 / Math.max(0.05, c.scorchRate);
      while (this.front - this._burnDistance >= stepLen) {
        this._burnDistance += stepLen;
        this.pointAt(saturate(this._burnDistance / this.length), _p);
        _p.addScaledVector(this.side, randRange(-0.5, 0.5));
        this.decal(DecalType.SCORCH, _p, {
          radius: c.scorchRadius * randRange(0.7, 1.3), life: 3.2, intensity: 1,
          colorA: getColor(c.colorSmokeD), colorB: getColor(c.colorEmbersB), height: 0.015
        });
      }
    }

    // The pillar blows its top off as the fade begins.
    if (beat.phase === 'fade' && !this._blown) {
      this._blown = true;
      this.center(_p).setY(c.riseHeight * 0.8);
      this.ctx.bursts.spawn(BurstMode.FIRE, _p, {
        radius: 0.6, endRadius: c.burstSize * 0.8, life: 0.7, intensity: c.burstIntensity,
        colorA: getColor(c.colorBurstA), colorB: getColor(c.colorBurstB), colorC: getColor(c.colorBurstC)
      });
      this.burst('embers', 120, { position: _p, radius: 0.8, spread: 1, speed: 3 });
      this.burst('sparks', 80, { position: _p, radius: 0.5, spread: 1, speed: 1.5 });
      this.lightBoost = c.lightIntensity;
    }
  }

  onLand() {
    const c = this.cfg;
    this.center(_p).setY(1);
    this.impactFx(_p);
    this.center(_p);
    this.decal(DecalType.SCORCH, _p, {
      radius: c.scorchRadius * 3, life: 5, intensity: 1.3,
      colorA: getColor(c.colorSmokeD), colorB: getColor(c.colorEmbersB), height: 0.015
    });
    _p.y = 0.4;
    this.burst('smoke', 40, { position: _p, radius: 1.5, spread: 1, speed: 2, size: 1.4 });
    this.burst('embers', 90, { position: _p, radius: 1, spread: 1, speed: 2.5 });
  }
}
