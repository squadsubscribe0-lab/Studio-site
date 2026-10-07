import { IcosahedronGeometry, Vector3, NormalBlending } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid, instanceGeometry } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { lerp } from '../../utils/math.js';

const _p = new Vector3();
const _v = new Vector3();

const GLOB_VERTEX = /* glsl */ `
  uniform vec3  uGlobPos;
  uniform vec3  uGlobVel;
  uniform float uGlobSize;
  uniform float uWobble;
  uniform float uWobbleSpeed;
  uniform float uStretch;
  uniform float uShow;
  varying vec3 vN;
  varying vec3 vWorld;
  varying float vDisp;

  void main() {
    if (uShow <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec3 n = normalize(position);
    float disp = snoise(n * 1.2 + vec3(0.0, uTime * uWobbleSpeed * 0.3, uSeed)) * uWobble;
    vec3 p = n * (1.0 + disp);
    // Stretch along the flight direction, squash across it.
    vec3 v = normalize(uGlobVel + vec3(1e-4));
    float along = dot(p, v);
    p += v * along * uStretch - (p - v * along) * uStretch * 0.35;
    vec3 world = uGlobPos + p * uGlobSize;
    vN = normalize(p);
    vWorld = world;
    vDisp = disp;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const GLOB_FRAGMENT = /* glsl */ `
  uniform float uFresnel;
  varying vec3 vN;
  varying vec3 vWorld;
  varying float vDisp;
  void main() {
    vec3 n = normalize(vN);
    vec3 V = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(n, V), 0.0), 2.5) * uFresnel;
    float inner = fbm3(vN * 3.0 + uTime * 0.8) * 0.5 + 0.5;
    vec3 col = mix(uColorC, uColorB, inner + vDisp);
    float spec = pow(max(dot(reflect(-uLightDir, n), V), 0.0), 24.0);
    col += uColorA * (fres + spec * 1.5);
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, 0.95 * uOpacity);
  }
`;

const POOL_VERTEX = /* glsl */ `
  uniform float uPoolR;
  uniform float uSpread;
  varying vec2 vPlane;
  varying float vR;
  void main() {
    float grow = smoothstep(0.0, max(uSpread, 1e-3), uHold);
    float r = position.x * uPoolR * (0.2 + 0.8 * grow) * (1.08);
    float a = position.y * TAU;
    vec3 world = uCenter + uSide * cos(a) * r + uDir * sin(a) * r + vec3(0.0, 0.035, 0.0);
    vPlane = vec2(cos(a), sin(a)) * r;
    vR = position.x;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const POOL_FRAGMENT = /* glsl */ `
  uniform float uPoolR;
  uniform float uEdge;
  uniform float uBubbleScale;
  uniform float uBubbleSpeed;
  uniform float uPoolGlow;
  uniform float uPoolOpacity;
  uniform float uSpread;
  varying vec2 vPlane;
  varying float vR;

  void main() {
    if (uHold <= 0.0) discard;
    float grow = 0.2 + 0.8 * smoothstep(0.0, max(uSpread, 1e-3), uHold);
    vec2 q = vPlane;
    float d = length(q) / (uPoolR * grow);

    // Ragged rim, creeping over time.
    float ang = atan(q.y, q.x);
    float rim = 1.0 - uEdge * (fbm3(vec3(cos(ang) * 2.0, sin(ang) * 2.0, uSeed + uHold * 0.15)) * 0.5 + 0.5);
    if (d > rim) discard;
    float edge = smoothstep(rim - 0.12, rim, d);

    vec2 warp = vec2(fbm3(vec3(q * 0.5, uTime * 0.2 + uSeed)), fbm3(vec3(q * 0.5 + 7.0, uTime * 0.2)));
    float sludge = fbm3(vec3(q * 0.9 + warp, uTime * 0.15)) * 0.5 + 0.5;

    vec2 cell = voronoi2(q * uBubbleScale + uSeed);
    float cycle = fract(uTime * uBubbleSpeed * (0.5 + cell.y) + cell.y * 13.0);
    float bubble = smoothstep(0.05, 0.0, abs(cell.x - cycle * 0.42)) * (1.0 - cycle);

    vec3 col = mix(uColorC, uColorB, sludge * 0.8);
    col += uColorA * (bubble * 1.4 + edge * 0.9) * uPoolGlow;
    float alpha = mix(0.75, 1.0, edge) * uPoolOpacity * uFade * uOpacity;
    gl_FragColor = vec4(col * uGlow * uGlobalGlow, alpha);
  }
`;

/**
 * VENOM — a lobbed toxin glob and the acid pool it leaves.
 *
 * The glob's centre is the one thing placed on the CPU (a ballistic arc
 * resolved from `u` each frame); its shape — wobble, stretch along the flight —
 * is in the vertex shader. The pool is a polar parameter grid whose radius,
 * ragged rim and bubbles are all functions of `uHold`.
 */
export class VenomAbility extends KitAbility {
  static layers = {
    drips: { shape: ParticleShape.SOFT, additive: false, drag: 0.4, endSize: 0.5, fadeOut: 0.7, softFade: 0.2 },
    fumes: { shape: ParticleShape.SMOKE, additive: false, curl: true, drag: 1.5, endSize: 2.8, fadeIn: 0.25, fadeOut: 0.3, softFade: 1.0 },
    bubbles: { shape: ParticleShape.RING, drag: 1, endSize: 1.8, sizeIn: 0.3, fadeIn: 0.1, fadeOut: 0.4 }
  };

  constructor(ctx) {
    super('venom', ctx);
  }

  buildMeshes() {
    this.glob = createKitMaterial({
      vertexShader: GLOB_VERTEX, fragmentShader: GLOB_FRAGMENT, additive: false,
      uniforms: {
        uGlobPos: { value: new Vector3() }, uGlobVel: { value: new Vector3(0, 0, 1) }, uGlobSize: { value: 0.5 },
        uWobble: { value: 0.2 }, uWobbleSpeed: { value: 8 }, uStretch: { value: 0.3 }, uShow: { value: 1 },
        uFresnel: { value: 1.5 }
      }
    });
    this.glob.blending = NormalBlending;
    this.makeMesh(instanceGeometry(new IcosahedronGeometry(1, 4), 1), this.glob, 14);

    this.pool = createKitMaterial({
      vertexShader: POOL_VERTEX, fragmentShader: POOL_FRAGMENT, additive: false,
      uniforms: {
        uPoolR: { value: 2.5 }, uSpread: { value: 0.35 }, uEdge: { value: 0.2 }, uBubbleScale: { value: 3 },
        uBubbleSpeed: { value: 1.4 }, uPoolGlow: { value: 1 }, uPoolOpacity: { value: 0.9 }
      }
    });
    this.makeMesh(createParamGrid(20, 72), this.pool, 7);
  }

  /** Ballistic arc, resolved from progress each frame. */
  _globAt(s, out) {
    const c = this.cfg;
    this.pointAt(s, out);
    out.y = lerp(c.launchHeight, c.globSize * 0.6, s) + c.arcHeight * 4 * s * (1 - s);
    return out;
  }

  step(dt, beat) {
    const c = this.cfg;
    const g = this.glob.uniforms;
    g.uGlobSize.value = c.globSize;
    g.uWobble.value = c.wobble;
    g.uWobbleSpeed.value = c.wobbleSpeed;
    g.uStretch.value = c.stretch;
    g.uFresnel.value = c.fresnel;
    g.uShow.value = beat.phase === 'travel' ? 1 : 0;

    const p = this.pool.uniforms;
    p.uPoolR.value = c.poolRadius;
    p.uSpread.value = c.poolSpread;
    p.uEdge.value = c.poolEdge;
    p.uBubbleScale.value = c.bubbleScale;
    p.uBubbleSpeed.value = c.bubbleSpeed;
    p.uPoolGlow.value = c.poolGlow;
    p.uPoolOpacity.value = c.poolOpacity;

    if (beat.phase === 'travel') {
      this._globAt(this.u, g.uGlobPos.value);
      this._globAt(Math.min(1, this.u + 0.02), _v).sub(g.uGlobPos.value);
      g.uGlobVel.value.copy(_v);
      this.position.copy(g.uGlobPos.value);
      this.emit('drips', this.tick('drips', dt), { position: g.uGlobPos.value, radius: c.globSize * 0.7, spread: 0.6, speed: 0.5 });
      return;
    }

    // The pool breathes fumes and pops bubbles until it drains.
    const scale = beat.phase === 'fade' ? this.fade : 1;
    const r = c.poolRadius * 0.85;
    const fumes = this.tick('fumes', dt, scale);
    if (fumes > 0) this.emit('fumes', fumes, { position: this.center(_p).setY(0.2), radius: r, spread: 0.5, spin: 0.3 });
    const bubbles = this.tick('bubbles', dt, scale);
    for (let i = 0; i < bubbles; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r;
      this.center(_p).addScaledVector(this.side, Math.cos(a) * d).addScaledVector(this.direction, Math.sin(a) * d);
      _p.y = 0.12;
      this.emit('bubbles', 1, { position: _p, spread: 0 });
    }
  }

  onLand() {
    const c = this.cfg;
    this.center(_p).setY(0.5);
    this.impactFx(_p);
    this.burst('drips', 90, { position: _p, radius: 0.4, spread: 1, speed: 5, size: 1.4 });
    this.burst('fumes', 16, { position: _p, radius: c.poolRadius * 0.5, spread: 1, speed: 2 });
  }
}
