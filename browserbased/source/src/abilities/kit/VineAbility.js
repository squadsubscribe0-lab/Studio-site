import { ConeGeometry, Vector3, FrontSide } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid, instanceGeometry } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { getColor } from '../../utils/color.js';
import { hash11, randRange, saturate } from '../../utils/math.js';

const MAX_VINES = 6;
const MAX_THORNS = 110;
const _p = new Vector3();
const _d = new Vector3();

const PATH_GLSL = /* glsl */ `
  uniform float uCount;
  uniform float uSpacing;
  uniform float uFanOut;
  uniform float uArch;
  uniform float uArchRate;
  uniform float uWeave;
  uniform float uCut;

  float reach() { return min(uFront, uLength); }

  // Centre of vine i at b metres from the caster.
  vec3 vinePath(float i, float b) {
    float s = b / max(uLength, 1e-3);
    float lane = (i - (uCount - 1.0) * 0.5) * uSpacing * (1.0 + uFanOut * s);
    float ph = hash11(i * 5.3 + uSeed) * TAU;
    float lat = lane + uWeave * sin(b * 0.9 + ph);
    float h = uArch * abs(sin(b * uArchRate * PI + ph)) * smoothstep(0.0, 1.0, b);
    return uOrigin + uDir * b + uSide * lat + vec3(0.0, h, 0.0);
  }
`;

const VINE_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uVineR;
  ${PATH_GLSL}
  varying vec3 vN;
  varying vec2 vUv;
  varying float vB;
  void main() {
    float i = aIndex;
    float b = position.x * reach();
    vec3 c = vinePath(i, b);
    vec3 T = normalize(vinePath(i, b + 0.05) - vinePath(i, max(b - 0.05, 0.0)) + vec3(1e-4));
    vec3 N1 = normalize(cross(T, vec3(0.0, 1.0, 0.0)) + vec3(1e-4));
    vec3 N2 = cross(N1, T);
    float a = position.y * TAU;
    vec3 radial = N1 * cos(a) + N2 * sin(a);
    float r = uVineR * mix(1.0, 0.45, position.x) * smoothstep(1.0, 0.94, position.x);
    vN = radial;
    vUv = position.xy;
    vB = b;
    gl_Position = projectionMatrix * viewMatrix * vec4(c + radial * r, 1.0);
  }
`;

const VINE_FRAGMENT = /* glsl */ `
  uniform float uCut;
  uniform float uSapSpeed;
  uniform float uSapGlow;
  varying vec3 vN;
  varying vec2 vUv;
  varying float vB;
  void main() {
    if (vB < uCut) discard;
    float bark = fbm3(vec3(vB * 3.0, vUv.y * 6.0, uSeed)) * 0.5 + 0.5;
    vec3 col = mix(uColorC, uColorB, bark);
    col *= max(dot(normalize(vN), uLightDir), 0.0) * 0.8 + 0.35;
    float sap = ridged(vec3(vB * 1.5 - uTime * uSapSpeed, vUv.y * 4.0, uSeed), 4) / 0.9375;
    col += uColorA * smoothstep(0.85, 0.97, sap) * uSapGlow * uGlow * uGlobalGlow;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const THORN_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uVineR;
  uniform float uThornCount;
  uniform float uThornSize;
  uniform float uBloom;
  ${PATH_GLSL}
  varying float vTip;
  void main() {
    float j = aIndex;
    float i = mod(j, uCount);
    float b = hash11(j * 12.9 + uSeed) * uLength;
    float grown = smoothstep(b, b + 0.6, reach());
    if (j > uThornCount - 0.5 || grown <= 0.0 || b < uCut) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec3 c = vinePath(i, b);
    vec3 T = normalize(vinePath(i, b + 0.05) - vinePath(i, max(b - 0.05, 0.0)) + vec3(1e-4));
    vec3 N1 = normalize(cross(T, vec3(0.0, 1.0, 0.0)) + vec3(1e-4));
    vec3 N2 = cross(N1, T);
    float a = hash11(j * 3.7) * TAU;
    vec3 out_ = normalize(N1 * cos(a) + N2 * sin(a) + T * 0.35);
    vec3 X = normalize(cross(out_, T) + vec3(1e-4));
    vec3 Z = cross(X, out_);
    float s = b / uLength;
    float size = uThornSize * (0.6 + 0.8 * hash11(j * 1.3)) * (1.0 + (uBloom - 1.0) * smoothstep(0.75, 1.0, s)) * grown;
    // Cone: y along its axis (-0.5..0.5); sit its base on the vine surface.
    vec3 p = position;
    vec3 world = c + out_ * (uVineR * 0.8 + (p.y + 0.5) * size) + (X * p.x + Z * p.z) * size * 0.45;
    vTip = p.y + 0.5;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const THORN_FRAGMENT = /* glsl */ `
  varying float vTip;
  void main() {
    vec3 col = mix(uColorC, uColorB * 0.8, vTip) + uColorA * pow(vTip, 6.0) * 0.8;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const pathUniforms = () => ({
  uCount: { value: 4 }, uSpacing: { value: 0.4 }, uFanOut: { value: 1.5 }, uArch: { value: 0.7 },
  uArchRate: { value: 0.7 }, uWeave: { value: 0.3 }, uCut: { value: 0 }, uVineR: { value: 0.1 }
});

/**
 * VINE — thorned vines that grow along the line and retract.
 *
 * The vine tubes and the thorns share one GLSL path function. Growth is
 * `reach()` (the front), retraction is `uCut` sweeping from the caster outward
 * through the fade — both are clocks, so the vine can be reshaped at any point.
 * These are the kit's opaque meshes: dissolve is a hard discard, not alpha.
 */
export class VineAbility extends KitAbility {
  static layers = {
    leaves: { shape: ParticleShape.LEAF, additive: false, lit: true, curl: true, drag: 0.9, endSize: 0.9, fadeOut: 0.7 },
    pollen: { shape: ParticleShape.SOFT, curl: true, drag: 1.3, endSize: 0.3, fadeOut: 0.5 },
    dirt: { shape: ParticleShape.CHIP, additive: false, lit: true, drag: 0.3, endSize: 0.7, fadeOut: 0.7, softFade: 0.2 }
  };

  constructor(ctx) {
    super('vine', ctx);
  }

  buildMeshes() {
    const opaque = { additive: false, transparent: false, depthWrite: true, side: FrontSide };
    this.vineGeo = createParamGrid(120, 9, MAX_VINES);
    this.thornGeo = instanceGeometry(new ConeGeometry(0.5, 1, 5), MAX_THORNS);
    this.vineMat = createKitMaterial({
      vertexShader: VINE_VERTEX, fragmentShader: VINE_FRAGMENT, ...opaque,
      uniforms: { ...pathUniforms(), uSapSpeed: { value: 3 }, uSapGlow: { value: 1 } }
    });
    this.vineMat.side = 2; // tubes are thin enough that backfaces never show; keep both for safety
    this.thornMat = createKitMaterial({
      vertexShader: THORN_VERTEX, fragmentShader: THORN_FRAGMENT, ...opaque,
      uniforms: { ...pathUniforms(), uThornCount: { value: 60 }, uThornSize: { value: 0.25 }, uBloom: { value: 2 } }
    });
    this.makeMesh(this.vineGeo, this.vineMat, 5);
    this.makeMesh(this.thornGeo, this.thornMat, 5);
    this._trail = 0;
  }

  get count() {
    return Math.max(1, Math.min(MAX_VINES, Math.round(this.cfg.vines)));
  }

  get instanceCount() {
    return this.count + Math.min(MAX_THORNS, Math.round(this.cfg.thorns));
  }

  onCast() {
    this._trail = 0;
  }

  _vinePoint(i, b, out) {
    const c = this.cfg;
    const s = b / this.length;
    const lane = (i - (this.count - 1) * 0.5) * c.spacing * (1 + c.fanOut * s);
    const ph = hash11(i * 5.3 + this.seed) * Math.PI * 2;
    this.pointAt(saturate(s), out).addScaledVector(this.side, lane + c.weave * Math.sin(b * 0.9 + ph));
    out.y = c.arch * Math.abs(Math.sin(b * c.archRate * Math.PI + ph));
    return out;
  }

  step(dt, beat) {
    const c = this.cfg;
    const cut = beat.phase === 'fade' ? beat.t * this.length * 1.05 : 0;
    for (const m of [this.vineMat, this.thornMat]) {
      const u = m.uniforms;
      u.uCount.value = this.count;
      u.uSpacing.value = c.spacing;
      u.uFanOut.value = c.fanOut;
      u.uArch.value = c.arch;
      u.uArchRate.value = c.archRate;
      u.uWeave.value = c.weave;
      u.uCut.value = cut;
      u.uVineR.value = c.vineRadius;
    }
    this.vineMat.uniforms.uSapSpeed.value = c.sapSpeed;
    this.vineMat.uniforms.uSapGlow.value = c.sapGlow;
    this.thornMat.uniforms.uThornCount.value = Math.min(MAX_THORNS, Math.round(c.thorns));
    this.thornMat.uniforms.uThornSize.value = c.thornSize;
    this.thornMat.uniforms.uBloom.value = c.bloom;
    this.vineGeo.instanceCount = this.count;
    this.thornGeo.instanceCount = MAX_THORNS;

    const reach = Math.min(this.front, this.length);
    const at = beat.phase === 'fade' ? Math.min(reach, cut + 0.2) : reach;
    const i = Math.floor(Math.random() * this.count);
    this._vinePoint(i, at, _p);
    this.position.copy(_p).setY(1);

    const scale = beat.phase === 'travel' ? 1 : beat.phase === 'hold' ? 0.35 : 0.6;
    _d.set(0, 1, 0);
    this.emit('leaves', this.tick('leaves', dt, scale), { position: _p, radius: 0.5, direction: _d, spread: 1, spin: 5 });
    this.emit('pollen', this.tick('pollen', dt, scale), { position: _p, radius: 0.8, spread: 1 });
    if (beat.phase === 'travel') {
      this.emit('dirt', this.tick('dirt', dt), { position: _p.setY(0.05), radius: 0.4, direction: _d, spread: 0.7, spin: 9 });
      const stepLen = 1.3;
      while (this.front - this._trail >= stepLen) {
        this._trail += stepLen;
        this.pointAt(saturate(this._trail / this.length), _p).addScaledVector(this.side, randRange(-0.5, 0.5));
        this.decal(DecalType.CRACK, _p, { radius: randRange(0.7, 1.1), life: 2.8, width: 0.2, colorA: getColor(c.colorC), colorB: getColor(c.colorB) });
      }
    }
  }

  onLand() {
    const c = this.cfg;
    this.center(_p).setY(0.6);
    this.impactFx(_p);
    _d.set(0, 1, 0);
    this.burst('leaves', 40, { position: _p, radius: 1, direction: _d, spread: 1, speed: 1.5, spin: 6 });
    this.burst('pollen', 80, { position: _p, radius: 1.2, spread: 1, speed: 2 });
    this.burst('dirt', 50, { position: _p.setY(0.1), radius: 1, direction: _d, spread: 0.8, speed: 1.4 });
    this.center(_p);
    this.decal(DecalType.DUSTRING, _p, { radius: 3, life: 1.2, colorA: getColor(c.colorDirtB), colorB: getColor(c.colorDirtA) });
  }
}
