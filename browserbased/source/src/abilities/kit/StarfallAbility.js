import { InstancedBufferAttribute, Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid, createInstancedQuad } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { getColor } from '../../utils/color.js';
import { DecalType } from '../../effects/GroundDecals.js';

const MAX_STARS = 80;
const _p = new Vector3();
const _d = new Vector3();

const STAR_VERTEX = /* glsl */ `
  attribute float aIndex;
  attribute vec3  aStar;   // x, z in the unit disc; delay as a fraction of rainTime
  uniform float uCount;
  uniform float uRain;
  uniform float uFall;
  uniform float uFallH;
  uniform float uSlant;
  uniform float uStarSize;
  uniform float uTail;
  varying vec2 vUv;

  void main() {
    float t = (uHold - aStar.z * uRain) / max(uFall, 1e-3);
    if (aIndex > uCount - 0.5 || t < 0.0 || t > 1.0 || uHold <= 0.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return;
    }
    vec3 land = uCenter + (uSide * aStar.x + uDir * aStar.y) * uRadius;
    vec3 from = land + vec3(0.0, uFallH, 0.0) + (uSide * 0.6 - uDir * 0.8) * uFallH * uSlant;
    vec3 head = mix(from, land, t * t);
    vec3 axis = normalize(land - from);
    vec3 w = faceCamera(head, axis);
    // position.y: -0.5 at the head, +0.5 at the end of the tail.
    float along = position.y + 0.5;
    float width = uStarSize * mix(1.0, 0.1, along);
    vec3 world = head - axis * along * uTail + w * position.x * 2.0 * width;
    vUv = position.xy + 0.5;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float across = 1.0 - abs(vUv.x * 2.0 - 1.0);
    float head = smoothstep(0.25, 0.0, vUv.y);
    float tail = pow(1.0 - vUv.y, 2.0);
    vec3 col = mix(uColorC, uColorB, tail) + uColorA * head * 2.5;
    float alpha = pow(across, 2.0) * max(tail, head) * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const FIELD_VERTEX = /* glsl */ `
  varying vec2 vQ;
  void main() {
    if (uHold <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec2 q = position.xy * 2.0 - 1.0;
    vec3 world = uCenter + (uSide * q.x + uDir * q.y) * uRadius * 1.1 + vec3(0.0, 0.035, 0.0);
    vQ = q * 1.1;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const FIELD_FRAGMENT = /* glsl */ `
  uniform float uFieldGlow;
  varying vec2 vQ;
  void main() {
    float d = length(vQ);
    if (d > 1.05) discard;
    float open = smoothstep(0.0, 0.25, uHold);
    vec2 cell = voronoi2(vQ * 9.0 + uSeed);
    float twinkle = 0.5 + 0.5 * sin(uTime * (3.0 + cell.y * 6.0) + cell.y * 40.0);
    float stars = smoothstep(0.12, 0.0, cell.x) * twinkle * step(0.55, cell.y);
    float rim = smoothstep(0.03, 0.0, abs(d - open));
    float wash = smoothstep(1.0, 0.0, d) * 0.15;
    float m = (stars + wash) * step(d, open) + rim;
    vec3 col = mix(uColorC, uColorB, wash * 4.0) * wash + uColorA * stars + uColorB * rim;
    gl_FragColor = vec4(col * uFieldGlow * uGlow * uGlobalGlow, clamp(m, 0.0, 1.0) * uFade * uOpacity);
  }
`;

/**
 * STARFALL — a far cast: stars rain into the circle over `rainTime`.
 *
 * The shower is the one kit effect with per-instance data: each cast re-rolls
 * a landing point and a release delay per star into an instanced attribute
 * (written in place, so nothing is allocated). Those are dice, not dimensions —
 * `zoneRadius`, `fallHeight`, `rainTime` and `slant` still reshape the shower
 * live. The CPU reads the same dice to fire each star's landing on time.
 */
export class StarfallAbility extends KitAbility {
  static zone = true;
  static layers = {
    sparks: { shape: ParticleShape.STREAK, stretch: true, drag: 0.8, endSize: 0.3, stretchAmount: 0.12, softFade: 0.2 },
    dust: { shape: ParticleShape.SMOKE, curl: true, drag: 1.6, endSize: 2.0, fadeIn: 0.05, fadeOut: 0.3, softFade: 0.8 },
    glitter: { shape: ParticleShape.SOFT, curl: true, drag: 1.2, endSize: 0.2, fadeOut: 0.5 }
  };

  constructor(ctx) {
    super('starfall', ctx);
  }

  buildMeshes() {
    this.starGeo = createInstancedQuad(MAX_STARS);
    this.dice = new Float32Array(MAX_STARS * 3);
    this.diceAttr = new InstancedBufferAttribute(this.dice, 3);
    this.starGeo.setAttribute('aStar', this.diceAttr);
    this.starMat = createKitMaterial({
      vertexShader: STAR_VERTEX, fragmentShader: STAR_FRAGMENT,
      uniforms: {
        uCount: { value: 30 }, uRain: { value: 2 }, uFall: { value: 0.3 }, uFallH: { value: 16 },
        uSlant: { value: 0.4 }, uStarSize: { value: 0.3 }, uTail: { value: 3 }
      }
    });
    this.field = createKitMaterial({ vertexShader: FIELD_VERTEX, fragmentShader: FIELD_FRAGMENT, uniforms: { uFieldGlow: { value: 0.7 } } });
    this.makeMesh(createParamGrid(2, 2), this.field, 8);
    this.makeMesh(this.starGeo, this.starMat, 13);
    this.landedStars = new Array(MAX_STARS).fill(false);
  }

  get count() {
    return Math.max(1, Math.min(MAX_STARS, Math.round(this.cfg.stars)));
  }

  get instanceCount() {
    return this.count;
  }

  get impactDuration() {
    const c = this.cfg;
    return Math.max(super.impactDuration, c.rainTime + c.fallTime + 0.2);
  }

  onCast() {
    for (let i = 0; i < MAX_STARS; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.95;
      this.dice[i * 3] = Math.cos(a) * r;
      this.dice[i * 3 + 1] = Math.sin(a) * r;
      this.dice[i * 3 + 2] = Math.pow(Math.random(), 0.8);
    }
    this.diceAttr.needsUpdate = true;
    this.landedStars.fill(false);
  }

  step(dt, beat) {
    const c = this.cfg;
    const u = this.starMat.uniforms;
    u.uCount.value = this.count;
    u.uRain.value = c.rainTime;
    u.uFall.value = c.fallTime;
    u.uFallH.value = c.fallHeight;
    u.uSlant.value = c.slant;
    u.uStarSize.value = c.starSize;
    u.uTail.value = c.tailLength;
    this.field.uniforms.uFieldGlow.value = c.fieldGlow;
    this.starGeo.instanceCount = this.count;

    if (beat.phase === 'travel') return;

    const R = this.zoneR;
    this.center(this.position).setY(2);
    this.center(_p).setY(0.3);
    this.emit('glitter', this.tick('glitter', dt, beat.phase === 'fade' ? this.fade : 1), { position: _p, radius: R, spread: 1 });

    for (let i = 0; i < this.count; i++) {
      if (this.landedStars[i]) continue;
      if (this.holdTime < this.dice[i * 3 + 2] * c.rainTime + c.fallTime) continue;
      this.landedStars[i] = true;
      this.center(_p)
        .addScaledVector(this.side, this.dice[i * 3] * R)
        .addScaledVector(this.direction, this.dice[i * 3 + 1] * R);
      this.decal(DecalType.SHOCKWAVE, _p, { radius: c.shockRadius, life: 0.4, width: 0.06, colorA: getColor(c.colorB), colorB: getColor(c.colorA) });
      _p.y = 0.15;
      _d.set(0, 1, 0);
      this.burst('sparks', 14, { position: _p, radius: 0.1, direction: _d, spread: 1 });
      this.burst('dust', 3, { position: _p, radius: 0.3, spread: 1 });
      this.ctx.shake.add(c.impactShake * 0.4, 4, 26);
      this.lightBoost = Math.max(this.lightBoost, c.lightIntensity * 0.5);
    }
  }

  onLand() {
    const c = this.cfg;
    this.center(_p);
    this.decal(DecalType.SHOCKWAVE, _p, { radius: this.zoneR * 1.1, life: 0.45, width: 0.04, colorA: getColor(c.colorC), colorB: getColor(c.colorB) });
  }
}
