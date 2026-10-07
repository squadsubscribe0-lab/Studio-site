import { Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';

const MAX_SHELLS = 5;
const _p = new Vector3();

const CLOUD_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uHeight;
  uniform float uBillow;
  uniform float uBillowScale;
  uniform float uChurn;
  uniform float uGrowT;
  uniform float uShells;
  varying vec3 vN;
  varying vec3 vWorld;
  varying float vH;
  varying float vShell;

  void main() {
    float shell = aIndex;
    if (uHold <= 0.0 || shell > uShells - 0.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    float grow = smoothstep(0.0, max(uGrowT, 1e-3), uHold);
    // u: 0 at the crown, 1 just below the equator. v: around.
    float el = mix(PI * 0.5, -0.12, position.x);
    float az = position.y * TAU;
    vec3 n = vec3(cos(el) * cos(az), sin(el), cos(el) * sin(az));
    float R = uRadius * (1.0 - shell * 0.14) * grow * mix(0.6, 1.0, uFade);
    float b = fbm3(n * uBillowScale * 2.0 + vec3(0.0, uTime * uChurn, shell * 3.1 + uSeed)) * uBillow;
    vec3 local = n * (1.0 + b);
    vec3 world = uCenter
      + (uSide * local.x + uDir * local.z) * R
      + vec3(0.0, max(local.y, -0.05) * R * uHeight * 0.5, 0.0);
    vN = n;
    vWorld = world;
    vH = n.y;
    vShell = shell;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const CLOUD_FRAGMENT = /* glsl */ `
  uniform float uDensity;
  uniform float uChurn;
  varying vec3 vN;
  varying vec3 vWorld;
  varying float vH;
  varying float vShell;
  void main() {
    vec3 V = normalize(cameraPosition - vWorld);
    float edge = 1.0 - abs(dot(normalize(vWorld - uCenter), V));
    float n = fbm3(vWorld * 0.8 + vec3(0.0, -uTime * uChurn * 2.0, vShell * 5.0 + uSeed)) * 0.5 + 0.5;
    float body = smoothstep(0.35, 0.8, n);
    float lit = max(dot(normalize(vN), uLightDir), 0.0);
    vec3 col = mix(uColorC, uColorB, vH * 0.5 + 0.5 + lit * 0.3);
    col += uColorA * pow(edge, 3.0) * 0.4;
    float alpha = body * uDensity * (1.0 - edge * 0.6) * (1.0 - vShell * 0.12) * uFade * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

const POOL_VERTEX = /* glsl */ `
  varying vec2 vQ;
  void main() {
    if (uHold <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec2 q = position.xy * 2.0 - 1.0;
    vec3 world = uCenter + (uSide * q.x + uDir * q.y) * uRadius * 1.15 + vec3(0.0, 0.03, 0.0);
    vQ = q * 1.15;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const POOL_FRAGMENT = /* glsl */ `
  uniform float uEdge;
  uniform float uTendrils;
  uniform float uPoolGlow;
  uniform float uGrowT;
  varying vec2 vQ;
  void main() {
    float grow = smoothstep(0.0, max(uGrowT, 1e-3), uHold);
    float d = length(vQ);
    float ang = atan(vQ.y, vQ.x);
    float fingers = pow(abs(cos(ang * uTendrils * 0.5 + uSeed)), 8.0) * 0.18;
    float ragged = fbm3(vec3(cos(ang) * 2.0, sin(ang) * 2.0, uSeed + uHold * 0.1)) * uEdge;
    float reach = grow * (0.82 + fingers - ragged * 0.5);
    if (d > reach) discard;
    float rim = smoothstep(reach - 0.1, reach, d);
    vec2 warp = vec2(fbm3(vec3(vQ * 2.0, uTime * 0.2 + uSeed)), fbm3(vec3(vQ * 2.0 + 4.0, uTime * 0.2)));
    float sludge = fbm3(vec3(vQ * 3.0 + warp, uTime * 0.1)) * 0.5 + 0.5;
    float veins = smoothstep(0.9, 0.97, ridged(vec3(vQ * 4.0 + warp, uSeed), 4) / 0.9375);
    vec3 col = mix(uColorC, uColorB * 0.6, sludge) + uColorA * (veins + rim * 0.7) * uPoolGlow;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, mix(0.8, 1.0, rim) * uFade * uOpacity);
  }
`;

/**
 * MIASMA — a far cast: a seeping pool and a layered plague cloud.
 *
 * The cloud is a hemisphere parameter grid drawn as several shells, each
 * displaced by its own slice of fbm and eroded by more fbm in the fragment
 * stage — a cheap stand-in for a volume that still churns and parallaxes when
 * you orbit it.
 */
export class MiasmaAbility extends KitAbility {
  static zone = true;
  static layers = {
    fumes: { shape: ParticleShape.SMOKE, additive: false, curl: true, drag: 1.5, endSize: 2.6, fadeIn: 0.25, fadeOut: 0.3, softFade: 1.0 },
    spores: { shape: ParticleShape.SOFT, curl: true, drag: 1.2, endSize: 0.3, fadeOut: 0.5 },
    bubbles: { shape: ParticleShape.RING, drag: 1, endSize: 1.8, sizeIn: 0.3, fadeIn: 0.1, fadeOut: 0.4 }
  };

  constructor(ctx) {
    super('miasma', ctx);
  }

  buildMeshes() {
    this.pool = createKitMaterial({
      vertexShader: POOL_VERTEX, fragmentShader: POOL_FRAGMENT, additive: false,
      uniforms: { uEdge: { value: 0.25 }, uTendrils: { value: 7 }, uPoolGlow: { value: 0.8 }, uGrowT: { value: 0.9 } }
    });
    this.cloud = createKitMaterial({
      vertexShader: CLOUD_VERTEX, fragmentShader: CLOUD_FRAGMENT, additive: false,
      uniforms: {
        uHeight: { value: 1.8 }, uBillow: { value: 0.4 }, uBillowScale: { value: 0.8 }, uChurn: { value: 0.35 },
        uGrowT: { value: 0.9 }, uShells: { value: 4 }, uDensity: { value: 0.3 }
      }
    });
    this.makeMesh(createParamGrid(2, 2), this.pool, 7);
    this.makeMesh(createParamGrid(24, 48, MAX_SHELLS), this.cloud, 11);
  }

  step(dt, beat) {
    const c = this.cfg;
    const p = this.pool.uniforms;
    p.uEdge.value = c.poolEdge;
    p.uTendrils.value = c.tendrils;
    p.uPoolGlow.value = c.poolGlow;
    p.uGrowT.value = c.growTime;
    const u = this.cloud.uniforms;
    u.uHeight.value = c.cloudHeight;
    u.uBillow.value = c.billow;
    u.uBillowScale.value = c.billowScale;
    u.uChurn.value = c.churn;
    u.uGrowT.value = c.growTime;
    u.uShells.value = Math.min(MAX_SHELLS, Math.round(c.shells));
    u.uDensity.value = c.cloudDensity;

    if (beat.phase === 'travel') {
      this.pointAt(this.u, _p).setY(0.5);
      this.emit('spores', this.tick('spores', dt), { position: _p, radius: 0.3, spread: 1 });
      return;
    }
    const R = this.zoneR;
    const scale = beat.phase === 'fade' ? this.fade : 1;
    this.center(this.position).setY(1.2);
    this.center(_p).setY(R * c.cloudHeight * 0.3);
    this.emit('fumes', this.tick('fumes', dt, scale), { position: _p, radius: R * 0.8, spread: 0.6, spin: 0.3 });
    this.emit('spores', this.tick('spores', dt, scale), { position: _p, radius: R, spread: 1 });
    const bubbles = this.tick('bubbles', dt, scale);
    for (let i = 0; i < bubbles; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * R * 0.8;
      this.center(_p).addScaledVector(this.side, Math.cos(a) * d).addScaledVector(this.direction, Math.sin(a) * d);
      _p.y = 0.1;
      this.emit('bubbles', 1, { position: _p, spread: 0 });
    }
  }

  onLand() {
    this.center(_p).setY(0.6);
    this.impactFx(_p);
    this.burst('fumes', 24, { position: _p, radius: this.zoneR * 0.5, spread: 1, speed: 2.5, size: 1.2 });
  }
}
