import { Vector3, Vector4 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { getColor } from '../../utils/color.js';
import { DecalType } from '../../effects/GroundDecals.js';

const HITS = 4;
const _p = new Vector3();
const _n = new Vector3();

const DOME_VERTEX = /* glsl */ `
  uniform float uSquash;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vWorld;
  void main() {
    if (uHold <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    float el = position.x * PI * 0.5;
    float az = position.y * TAU;
    vec3 n = vec3(cos(el) * cos(az), sin(el), cos(el) * sin(az));
    vec3 world = uCenter + (uSide * n.x + uDir * n.z) * uRadius + vec3(0.0, n.y * uRadius * uSquash, 0.0);
    vUv = position.xy;
    vN = n;
    vWorld = world;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const DOME_FRAGMENT = /* glsl */ `
  uniform float uRise;
  uniform float uHexScale;
  uniform float uEdgeW;
  uniform float uFresnel;
  uniform float uFill;
  uniform float uScan;
  uniform float uRipple;
  uniform float uShatter;
  uniform vec4  uHits[${HITS}];   // xyz = unit direction in dome space, w = time of hit
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vWorld;

  float hexDist(vec2 p) {
    p = abs(p);
    return max(dot(p, normalize(vec2(1.0, 1.732))), p.x);
  }

  // x,y: offset inside the cell; z,w: cell id
  vec4 hexCell(vec2 uv) {
    vec2 r = vec2(1.0, 1.732);
    vec2 h = r * 0.5;
    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    return vec4(gv, uv - gv);
  }

  void main() {
    // Rising: everything above the rise line is not built yet.
    float rise = smoothstep(0.0, max(uRise, 1e-3), uHold);
    if (vUv.x > rise * 1.02) discard;
    float front = smoothstep(0.05, 0.0, abs(vUv.x - rise)) * step(rise, 0.999);

    // Plates: azimuth wraps, so its scale is kept a whole number of cells.
    float around = floor(uHexScale * 3.0);
    vec2 uv = vec2(vUv.y * around, vUv.x * uHexScale * 1.2);
    vec4 cell = hexCell(uv);
    float edge = smoothstep(uEdgeW, 0.0, 0.5 - hexDist(cell.xy));
    float id = fract(sin(dot(cell.zw, vec2(12.9898, 78.233)) + uSeed) * 43758.5453);

    // Shatter: plates drop out in random order through the fade.
    float gone = step(uFade, id * 0.95);
    if (gone > 0.5) discard;
    float dying = smoothstep(0.12, 0.0, uFade - id * 0.95) * step(uFade, 0.999);

    vec3 V = normalize(cameraPosition - vWorld);
    vec3 N = normalize(vN);
    float fres = pow(1.0 - abs(dot(N, V)), 2.5) * uFresnel;

    float scan = smoothstep(0.05, 0.0, abs(fract(uHold * uScan) - vUv.x));

    float ripple = 0.0;
    for (int i = 0; i < ${HITS}; i++) {
      float age = uHold - uHits[i].w;
      if (age < 0.0 || age > 1.2) continue;
      float ang = acos(clamp(dot(N, uHits[i].xyz), -1.0, 1.0));
      ripple += smoothstep(0.08, 0.0, abs(ang - age * 2.2)) * (1.0 - age / 1.2);
      ripple += smoothstep(0.25, 0.0, ang) * exp(-age * 6.0);
    }
    ripple *= uRipple;

    float flicker = 0.85 + 0.15 * sin(uTime * 3.0 + id * 20.0);
    float m = edge * (0.5 + fres) + uFill * flicker + scan * 0.4 + ripple + front * 1.5 + dying * uShatter;
    vec3 col = mix(uColorC, uColorB, clamp(edge + fres * 0.5, 0.0, 1.0)) + uColorA * (ripple + scan * 0.3 + front + dying * uShatter);
    float alpha = clamp(m, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

/**
 * AEGIS — a far cast: a hex-plated dome that builds itself upward.
 *
 * Plates are a hex tiling in (azimuth, elevation) space, with the azimuth
 * scale snapped to a whole number of cells so the seam closes. Hits are
 * events: the CPU writes a direction and a timestamp into a four-slot ring of
 * uniforms, and the shader draws an expanding ring around each by angular
 * distance. The shatter is the fade itself — each plate's hash decides when it
 * drops out.
 */
export class AegisAbility extends KitAbility {
  static zone = true;
  static layers = {
    motes: { shape: ParticleShape.SOFT, curl: true, drag: 1.2, endSize: 0.3, fadeOut: 0.5 },
    sparks: { shape: ParticleShape.STREAK, stretch: true, drag: 1.0, endSize: 0.3, stretchAmount: 0.12, softFade: 0.2 },
    shards: { shape: ParticleShape.CHIP, curl: true, drag: 0.6, endSize: 0.4, fadeOut: 0.6 }
  };

  constructor(ctx) {
    super('aegis', ctx);
  }

  buildMeshes() {
    this.hits = Array.from({ length: HITS }, () => new Vector4(0, 1, 0, -100));
    this.dome = createKitMaterial({
      vertexShader: DOME_VERTEX, fragmentShader: DOME_FRAGMENT,
      uniforms: {
        uSquash: { value: 0.85 }, uRise: { value: 0.5 }, uHexScale: { value: 9 }, uEdgeW: { value: 0.08 },
        uFresnel: { value: 2 }, uFill: { value: 0.1 }, uScan: { value: 0.8 }, uRipple: { value: 1 },
        uShatter: { value: 2 }, uHits: { value: this.hits }
      }
    });
    this.makeMesh(createParamGrid(40, 96), this.dome, 12);
    this._hitClock = 0;
    this._hitSlot = 0;
    this._shattered = false;
  }

  onCast() {
    for (const h of this.hits) h.w = -100;
    this._hitClock = 0;
    this._hitSlot = 0;
    this._shattered = false;
  }

  _domePoint(n, out) {
    const c = this.cfg;
    const R = this.zoneR;
    return this.center(out)
      .addScaledVector(this.side, n.x * R)
      .addScaledVector(this.direction, n.z * R)
      .setY(n.y * R * c.squash);
  }

  step(dt, beat) {
    const c = this.cfg;
    const u = this.dome.uniforms;
    u.uSquash.value = c.squash;
    u.uRise.value = c.riseTime;
    u.uHexScale.value = c.hexScale;
    u.uEdgeW.value = c.edgeWidth;
    u.uFresnel.value = c.fresnel;
    u.uFill.value = c.fill;
    u.uScan.value = c.scanSpeed;
    u.uRipple.value = c.ripple;
    u.uShatter.value = c.shatterGlow;

    if (beat.phase === 'travel') return;
    const R = this.zoneR;
    this.center(this.position).setY(R * c.squash * 0.6);

    if (beat.phase === 'hold' && this.holdTime > c.riseTime) {
      // Random strikes on the upper half of the dome.
      this._hitClock += dt * c.hitRate;
      if (this._hitClock >= 1) {
        this._hitClock -= 1;
        const az = Math.random() * Math.PI * 2;
        const el = 0.2 + Math.random() * 1.1;
        _n.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
        this.hits[this._hitSlot].set(_n.x, _n.y, _n.z, this.holdTime);
        this._hitSlot = (this._hitSlot + 1) % HITS;
        this._domePoint(_n, _p);
        this.burst('sparks', 24, { position: _p, radius: 0.1, direction: _n, spread: 0.8 });
        this.lightBoost = Math.max(this.lightBoost, c.lightIntensity * 0.4);
      }
    }

    if (beat.phase === 'fade' && !this._shattered) {
      this._shattered = true;
      this.center(_p).setY(R * c.squash * 0.4);
      this.impactFx(_p, { scale: 0.8 });
      for (let i = 0; i < 12; i++) {
        const az = Math.random() * Math.PI * 2;
        const el = Math.random() * 1.4;
        _n.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
        this._domePoint(_n, _p);
        this.burst('shards', 8, { position: _p, radius: 0.3, direction: _n, spread: 0.6, spin: 10 });
      }
    }

    const scale = beat.phase === 'fade' ? this.fade : 1;
    const az = Math.random() * Math.PI * 2;
    _n.set(Math.cos(az), 0.05, Math.sin(az));
    this._domePoint(_n, _p);
    this.emit('motes', this.tick('motes', dt, scale), { position: _p, radius: 0.4, spread: 0.4 });
  }

  onLand() {
    const c = this.cfg;
    this.center(_p);
    this.decal(DecalType.SHOCKWAVE, _p, { radius: this.zoneR * 1.2, life: 0.5, width: 0.05, colorA: getColor(c.colorC), colorB: getColor(c.colorA) });
    this.decal(DecalType.FROST, _p, { radius: this.zoneR * 1.05, life: this.impactDuration + 1, width: 1.2, intensity: 0.5, colorA: getColor(c.colorA), colorB: getColor(c.colorB) });
  }
}
