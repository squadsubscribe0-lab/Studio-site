import { OctahedronGeometry, Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid, instanceGeometry } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { getColor } from '../../utils/color.js';
import { smoothstep } from '../../utils/math.js';

const MAX_RINGS = 5;
const _p = new Vector3();
const _a = new Vector3();

/** Spear frame shared by spear + rings: centre, unit axis (tail → tip). */
const FRAME_GLSL = /* glsl */ `
  uniform vec3  uSpearPos;
  uniform vec3  uSpearAxis;
  uniform float uSpearShow;
  vec3 spearSide() { return normalize(cross(uSpearAxis, vec3(0.0, 1.0, 0.0)) + vec3(1e-4, 0.0, 0.0)); }
`;

const SPEAR_VERTEX = /* glsl */ `
  ${FRAME_GLSL}
  uniform float uSpearLen;
  uniform float uSpearW;
  varying vec3 vWorld;
  varying float vAlong;
  void main() {
    if (uSpearShow <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec3 S = spearSide();
    vec3 B = normalize(cross(S, uSpearAxis));
    // Octahedron: y is the long axis, stretched into a blade with a longer tip.
    float y = position.y;
    float along = y > 0.0 ? y * 0.62 : y * 0.38;
    vec3 world = uSpearPos + uSpearAxis * along * uSpearLen + (S * position.x + B * position.z) * uSpearW;
    vWorld = world;
    vAlong = y;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const SPEAR_FRAGMENT = /* glsl */ `
  varying vec3 vWorld;
  varying float vAlong;
  void main() {
    vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    vec3 V = normalize(cameraPosition - vWorld);
    float facing = abs(dot(n, V));
    float energy = snoise(vec3(vAlong * 6.0 - uTime * 9.0, uSeed, 0.0)) * 0.5 + 0.5;
    vec3 col = mix(uColorB, uColorA, pow(facing, 2.0)) * (1.2 + energy);
    col += uColorC * pow(1.0 - facing, 2.0);
    gl_FragColor = vec4(col * uGlow * uGlobalGlow * 1.4, uOpacity);
  }
`;

const RING_VERTEX = /* glsl */ `
  attribute float aIndex;
  ${FRAME_GLSL}
  uniform float uRingR;
  uniform float uRingW;
  uniform float uRingGap;
  uniform float uRingSpin;
  uniform float uCount;
  varying vec2 vUv;
  varying float vOut;
  void main() {
    float i = aIndex;
    // After lodging, the rings slip off the shaft and blow outward.
    float release = uHold > 0.0 ? smoothstep(0.0, 0.45, uHold) : 0.0;
    vOut = release;
    if (i > uCount - 0.5 || release >= 1.0 || uSpearShow <= 0.0 && uHold <= 0.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return;
    }
    vec3 S = spearSide();
    vec3 B = normalize(cross(S, uSpearAxis));
    float offset = (i - (uCount - 1.0) * 0.5) * uRingGap;
    float r = uRingR * (1.0 + 0.12 * sin(uTime * 12.0 + i)) * (1.0 + release * 5.0);
    r += (position.x - 0.5) * uRingW * 2.0;
    float a = position.y * TAU + uTime * uRingSpin * (mod(i, 2.0) * 2.0 - 1.0);
    vec3 world = uSpearPos + uSpearAxis * offset + (S * cos(a) + B * sin(a)) * r;
    vUv = position.xy;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const RING_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying float vOut;
  void main() {
    float band = 1.0 - abs(vUv.x * 2.0 - 1.0);
    float gap = step(0.18, fract(vUv.y * 3.0));
    vec3 col = mix(uColorB, uColorA, band);
    float alpha = band * gap * (1.0 - vOut) * uOpacity * uFade;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow * 1.6, alpha);
  }
`;

const PILLAR_VERTEX = /* glsl */ `
  uniform float uPillarR;
  uniform float uPillarH;
  uniform float uRise;
  varying vec2 vUv;
  varying vec3 vRadial;
  varying vec3 vWorld;
  void main() {
    if (uHold <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    float rise = smoothstep(0.0, max(uRise, 1e-3), uHold);
    float h = position.x * uPillarH * rise;
    float a = position.y * TAU;
    float flare = 1.0 + 0.8 * smoothstep(0.25, 0.0, position.x);
    float r = uPillarR * flare * mix(1.0, 0.35, uFade < 1.0 ? 1.0 - uFade : 0.0);
    vRadial = uSide * cos(a) + uDir * sin(a);
    vec3 world = uCenter + vRadial * r + vec3(0.0, h, 0.0);
    vUv = position.xy;
    vWorld = world;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const PILLAR_FRAGMENT = /* glsl */ `
  uniform float uStreaks;
  uniform float uFlow;
  varying vec2 vUv;
  varying vec3 vRadial;
  varying vec3 vWorld;
  void main() {
    vec3 V = normalize(cameraPosition - vWorld);
    float rim = pow(1.0 - abs(dot(normalize(vRadial), V)), 1.6);
    float core = 1.0 - rim;
    float streak = snoise(vec3(vUv.y * uStreaks, vUv.x * 3.0 - uTime * uFlow, uSeed)) * 0.5 + 0.5;
    streak = smoothstep(0.35, 0.9, streak);
    float top = smoothstep(1.0, 0.55, vUv.x);
    vec3 col = mix(uColorB, uColorA, core) + uColorC * rim * 0.6;
    float alpha = (0.25 + rim * 0.8 + streak * 0.6) * top * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const GLYPH_VERTEX = /* glsl */ `
  uniform float uGlyphR;
  varying vec2 vQ;
  void main() {
    if (uHold <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec2 q = position.xy * 2.0 - 1.0;
    vec3 world = uCenter + (uSide * q.x + uDir * q.y) * uGlyphR * 1.1 + vec3(0.0, 0.04, 0.0);
    vQ = q * 1.1;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const GLYPH_FRAGMENT = /* glsl */ `
  uniform float uGlyphSpin;
  uniform float uRays;
  varying vec2 vQ;
  void main() {
    float open = smoothstep(0.0, 0.3, uHold);
    float d = length(vQ) / max(open, 1e-3);
    if (d > 1.05) discard;
    float ang = atan(vQ.y, vQ.x);
    float outer = smoothstep(0.03, 0.0, abs(d - 0.95));
    float inner = smoothstep(0.02, 0.0, abs(d - 0.62));
    float a1 = ang + uHold * uGlyphSpin;
    float rays = pow(abs(cos(a1 * uRays * 0.5)), 30.0) * smoothstep(0.62, 0.66, d) * smoothstep(0.93, 0.88, d);
    float a2 = ang - uHold * uGlyphSpin * 2.0;
    float star = smoothstep(0.02, 0.0, abs(d - (0.3 + 0.12 * abs(cos(a2 * 4.0))))) ;
    float ticks = step(0.7, fract(a1 / TAU * 48.0)) * smoothstep(0.84, 0.86, d) * smoothstep(0.92, 0.9, d);
    float wash = smoothstep(1.0, 0.0, d) * 0.12;
    float m = outer + inner + rays + star + ticks * 0.8;
    vec3 col = mix(uColorC, uColorA, clamp(m, 0.0, 1.0)) * (m + wash);
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, clamp(m + wash, 0.0, 1.0) * uFade * uOpacity);
  }
`;

/**
 * SOLAR — a thrown sun-spear that lodges and erupts.
 *
 * The spear and its rings share one frame (centre + axis) computed on the CPU
 * from progress; the pillar and sun sigil are pure functions of `uHold`, so
 * they draw nothing until the spear lands and then open on their own clock.
 */
export class SolarAbility extends KitAbility {
  static layers = {
    sparks: { shape: ParticleShape.STREAK, stretch: true, drag: 0.9, endSize: 0.3, stretchAmount: 0.14, softFade: 0.2 },
    motes: { shape: ParticleShape.SOFT, curl: true, drag: 1.2, endSize: 0.2, fadeOut: 0.5 },
    flares: { shape: ParticleShape.SOFT, drag: 1.5, endSize: 2.2, fadeIn: 0.1, fadeOut: 0.4, softFade: 0.8 }
  };

  constructor(ctx) {
    super('solar', ctx);
  }

  buildMeshes() {
    const frame = () => ({ uSpearPos: { value: new Vector3() }, uSpearAxis: { value: new Vector3(0, 0, 1) }, uSpearShow: { value: 1 } });
    this.spear = createKitMaterial({
      vertexShader: SPEAR_VERTEX, fragmentShader: SPEAR_FRAGMENT, additive: false, transparent: false, depthWrite: true,
      uniforms: { ...frame(), uSpearLen: { value: 2 }, uSpearW: { value: 0.15 } }
    });
    this.ringMat = createKitMaterial({
      vertexShader: RING_VERTEX, fragmentShader: RING_FRAGMENT,
      uniforms: { ...frame(), uRingR: { value: 0.4 }, uRingW: { value: 0.05 }, uRingGap: { value: 0.5 }, uRingSpin: { value: 8 }, uCount: { value: 3 } }
    });
    this.pillar = createKitMaterial({
      vertexShader: PILLAR_VERTEX, fragmentShader: PILLAR_FRAGMENT,
      uniforms: { uPillarR: { value: 1 }, uPillarH: { value: 9 }, uRise: { value: 0.2 }, uStreaks: { value: 14 }, uFlow: { value: 3 } }
    });
    this.glyph = createKitMaterial({
      vertexShader: GLYPH_VERTEX, fragmentShader: GLYPH_FRAGMENT,
      uniforms: { uGlyphR: { value: 2.5 }, uGlyphSpin: { value: 0.3 }, uRays: { value: 12 } }
    });
    this.makeMesh(instanceGeometry(new OctahedronGeometry(1, 0), 1), this.spear, 10);
    this.ringGeo = createParamGrid(3, 48, MAX_RINGS);
    this.makeMesh(this.ringGeo, this.ringMat, 13);
    this.makeMesh(createParamGrid(40, 40), this.pillar, 12);
    this.makeMesh(createParamGrid(2, 2), this.glyph, 8);
  }

  step(dt, beat) {
    const c = this.cfg;
    const rings = Math.max(1, Math.min(MAX_RINGS, Math.round(c.rings)));
    this.ringGeo.instanceCount = rings;
    const travelling = beat.phase === 'travel';

    // The spear frame: flying level, or lodged tip-first at the target.
    const pos = this.spear.uniforms.uSpearPos.value;
    const axis = this.spear.uniforms.uSpearAxis.value;
    if (travelling) {
      axis.copy(this.direction).setY(-0.12 * this.u).normalize();
      this.pointAt(this.u, pos).setY(c.height * (1 - 0.3 * this.u));
      pos.addScaledVector(axis, -c.spearLength * 0.25);
    } else {
      axis.copy(this.direction).multiplyScalar(Math.sin(c.stickAngle)).setY(-Math.cos(c.stickAngle)).normalize();
      this.center(pos).addScaledVector(axis, -(c.spearLength * 0.62 - c.sink));
    }
    for (const m of [this.spear, this.ringMat]) {
      m.uniforms.uSpearPos.value.copy(pos);
      m.uniforms.uSpearAxis.value.copy(axis);
      m.uniforms.uSpearShow.value = beat.phase === 'fade' ? 0 : 1;
    }
    this.spear.uniforms.uSpearLen.value = c.spearLength;
    this.spear.uniforms.uSpearW.value = c.spearWidth;
    const r = this.ringMat.uniforms;
    r.uRingR.value = c.ringRadius;
    r.uRingW.value = c.ringWidth;
    r.uRingGap.value = c.ringSpacing;
    r.uRingSpin.value = c.ringSpin;
    r.uCount.value = rings;
    const p = this.pillar.uniforms;
    p.uPillarR.value = c.pillarRadius;
    p.uPillarH.value = c.pillarHeight;
    p.uRise.value = c.pillarRise;
    p.uStreaks.value = c.pillarStreaks;
    p.uFlow.value = c.pillarFlow;
    const g = this.glyph.uniforms;
    g.uGlyphR.value = c.glyphRadius;
    g.uGlyphSpin.value = c.glyphSpin;
    g.uRays.value = c.glyphRays;

    if (travelling) {
      this.position.copy(pos);
      _a.copy(axis).negate().setY(0.3).normalize();
      this.emit('sparks', this.tick('sparks', dt), { position: pos, radius: c.ringRadius, direction: _a, spread: 0.5 });
      this.emit('motes', this.tick('motes', dt, 0.5), { position: pos, radius: c.ringRadius, spread: 1 });
      return;
    }

    const rise = smoothstep(0, c.pillarRise, this.holdTime);
    const scale = beat.phase === 'fade' ? this.fade : 1;
    this.center(this.position).setY(c.pillarHeight * 0.3 * rise + 1);
    this.center(_p).setY(c.pillarHeight * Math.random() * rise);
    this.emit('motes', this.tick('motes', dt, scale * 1.5), { position: _p, radius: c.pillarRadius, spread: 0.6 });
    this.center(_p).setY(0.3);
    this.emit('flares', this.tick('flares', dt, scale), { position: _p, radius: c.pillarRadius, spread: 1 });
    this.emit('sparks', this.tick('sparks', dt, scale * 0.6), { position: _p, radius: c.pillarRadius * 0.6, spread: 0.8 });
  }

  onLand() {
    const c = this.cfg;
    this.center(_p).setY(0.6);
    this.impactFx(_p);
    this.burst('sparks', 120, { position: _p, radius: 0.4, spread: 1, speed: 2 });
    this.center(_p);
    this.decal(DecalType.SCORCH, _p, {
      radius: c.glyphRadius * 0.8, life: 4, intensity: 1.2,
      colorA: getColor('#1a0e06'), colorB: getColor(c.colorB), height: 0.015
    });
  }
}
