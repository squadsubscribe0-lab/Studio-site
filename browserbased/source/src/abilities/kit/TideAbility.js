import { Vector3 } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createParamGrid } from '../../assets/KitGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { getColor } from '../../utils/color.js';
import { lerp, randRange, saturate, smoothstep } from '../../utils/math.js';

const _p = new Vector3();
const _d = new Vector3();

const WAVE_VERTEX = /* glsl */ `
  uniform float uWaveH;
  uniform float uWidthNear;
  uniform float uWidth;
  uniform float uCurl;
  uniform float uBack;
  uniform float uBow;
  uniform float uCrestNoise;
  uniform float uCrestScale;
  uniform float uRise;
  uniform float uCrash;
  uniform float uPush;

  varying vec2  vUv;
  varying vec3  vWorld;

  // Wave profile in the wave's own (forward, up) plane. v runs from the foot of
  // the skirt, up the back, over the crest, and down into the curling lip.
  vec2 profile(float v, float H, float curl) {
    float R = H * 0.46;
    float a0 = PI + 0.25;
    float a1 = -0.55 * curl;
    float split = 0.22;
    vec2 arcStart = vec2(R * cos(a0), H - R + R * sin(a0));
    if (v < split) {
      float t = v / split;
      vec2 foot = vec2(arcStart.x - uBack, 0.0);
      return mix(foot, arcStart, t * t * (3.0 - 2.0 * t));
    }
    float t = (v - split) / (1.0 - split);
    float a = mix(a0, a1, t);
    float r = R * (1.0 - 0.42 * curl * smoothstep(0.5, 1.0, t));
    vec2 p = vec2(r * cos(a), H - R + r * sin(a));
    p.y = max(p.y, 0.0);
    return p;
  }

  void main() {
    float u = position.x;
    float v = position.y;
    float lat = u * 2.0 - 1.0;

    float crashT = smoothstep(0.0, 0.6, uHold);
    float d = min(uFront, uLength) + uHold * uPush;
    float s = clamp(d / uLength, 0.0, 1.2);
    float halfW = mix(uWidthNear, uWidth, clamp(s, 0.0, 1.0));

    float edge = 1.0 - pow(abs(lat), 3.0);
    float grow = smoothstep(0.0, max(uRise, 1e-3), uAge);
    float H = uWaveH * grow * mix(0.22, 1.0, edge) * (1.0 - uCrash * crashT);
    H *= 1.0 + uCrestNoise * snoise(vec3(lat * halfW * uCrestScale * 0.35, uTime * 0.8, uSeed));
    H = max(H, 0.05);
    float curl = uCurl * (1.0 + crashT * 0.8);

    vec2 p = profile(v, H, curl);
    float bow = lat * lat * uBow;

    vec3 world = uOrigin
      + uDir * (d - bow + p.x)
      + uSide * (lat * halfW)
      + vec3(0.0, p.y, 0.0);

    vUv = vec2(u, v);
    vWorld = world;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const WAVE_FRAGMENT = /* glsl */ `
  uniform float uFoam;
  uniform float uFoamScale;
  uniform float uFresnel;
  uniform float uCaustics;
  uniform float uFlowSpeed;

  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    vec3 V = normalize(cameraPosition - vWorld);
    if (dot(n, V) < 0.0) n = -n;
    float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0) * uFresnel;

    float v = vUv.y;
    float flow = uTime * uFlowSpeed;
    float n1 = fbm3(vec3(vUv.x * 7.0 * uFoamScale, v * 4.0 - flow, uSeed)) * 0.5 + 0.5;

    vec3 col = mix(uColorA, uColorB, smoothstep(0.05, 0.8, v));
    vec2 cell = voronoi2(vec2(vUv.x * 16.0, v * 7.0 - flow * 1.3) + uSeed);
    col += uColorB * pow(1.0 - cell.x, 6.0) * uCaustics;

    float crest = smoothstep(0.72, 0.9, v);
    float foam = smoothstep(0.45, 0.85, crest * (0.45 + n1 * 0.9)) * uFoam;
    foam += smoothstep(0.06, 0.0, v) * n1 * uFoam * 0.6;
    foam = clamp(foam, 0.0, 1.0);

    float diff = max(dot(n, uLightDir), 0.0) * 0.5 + 0.55;
    col *= diff;
    col = mix(col, uColorC * 1.25, foam);
    col += mix(uColorB, uColorC, 0.5) * fres * 0.45;

    float edge = 1.0 - pow(abs(vUv.x * 2.0 - 1.0), 6.0);
    float alpha = clamp(0.55 + fres * 0.4 + foam, 0.0, 1.0) * edge * uOpacity;

    // Break up as it dies rather than dimming uniformly.
    float dis = fbm3(vec3(vUv * vec2(6.0, 3.0), uSeed + uTime * 0.4)) * 0.5 + 0.5;
    float th = 1.0 - uFade * 1.15;
    alpha *= smoothstep(th, th + 0.18, dis);
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(col * uGlow * uGlobalGlow * uIntensity, alpha);
  }
`;

const WAKE_VERTEX = /* glsl */ `
  uniform float uWidthNear;
  uniform float uWidth;
  uniform float uWakeLen;
  uniform float uWakeWidth;
  uniform float uPush;
  varying vec2 vUv;
  varying float vAlong;

  void main() {
    float d = min(uFront, uLength) + uHold * uPush;
    float s0 = max(0.0, d - uWakeLen);
    float along = mix(s0, d, position.x);
    float halfW = mix(uWidthNear, uWidth, clamp(along / uLength, 0.0, 1.0)) * uWakeWidth;
    vec3 world = uOrigin + uDir * along + uSide * ((position.y * 2.0 - 1.0) * halfW) + vec3(0.0, 0.03, 0.0);
    vUv = position.xy;
    vAlong = along;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const WAKE_FRAGMENT = /* glsl */ `
  uniform float uWakeGlow;
  varying vec2 vUv;
  varying float vAlong;

  void main() {
    float lat = vUv.y * 2.0 - 1.0;
    float edge = smoothstep(1.0, 0.55, abs(lat));
    float tail = pow(vUv.x, 1.6);
    float rip = sin(vAlong * 5.0 - uTime * 7.0 + snoise(vec3(vUv * 4.0, uSeed)) * 2.0) * 0.5 + 0.5;
    float lines = smoothstep(0.8, 1.0, rip);
    float foam = smoothstep(0.35, 0.8, fbm3(vec3(vAlong * 0.8, lat * 2.0, uTime * 0.6 + uSeed)) * 0.5 + 0.5);
    vec3 col = mix(uColorB, uColorC, lines * 0.6 + foam * 0.4);
    float alpha = edge * tail * (0.25 + lines * 0.5 + foam * 0.35) * uWakeGlow * uFade * uOpacity;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col * uGlobalGlow, alpha);
  }
`;

/**
 * TIDE — a curling wall of water rolled down the aimed line.
 *
 * Two parameter grids: the wall (u across, v up the profile) and the wake it
 * leaves on the floor. Neither holds a metre — both are re-shaped from
 * `settings.tide` every frame. Spray, mist and falling drops are thrown from
 * the same crest height the shader computes, mirrored here on the CPU.
 */
export class TideAbility extends KitAbility {
  static layers = {
    spray: { shape: ParticleShape.SOFT, additive: false, curl: true, drag: 1.2, endSize: 1.8, fadeOut: 0.4, softFade: 0.6 },
    mist: { shape: ParticleShape.SMOKE, additive: false, curl: true, drag: 1.6, endSize: 2.6, fadeIn: 0.2, fadeOut: 0.35, softFade: 1.0 },
    drops: { shape: ParticleShape.STREAK, additive: true, stretch: true, drag: 0.3, endSize: 0.6, stretchAmount: 0.12, softFade: 0.2 }
  };

  constructor(ctx) {
    super('tide', ctx);
  }

  buildMeshes() {
    const waveUniforms = {
      uWaveH: { value: 1 }, uWidthNear: { value: 1 }, uWidth: { value: 1 }, uCurl: { value: 1 },
      uBack: { value: 1 }, uBow: { value: 1 }, uCrestNoise: { value: 0 }, uCrestScale: { value: 1 },
      uRise: { value: 0.3 }, uCrash: { value: 0.8 }, uPush: { value: 2 },
      uFoam: { value: 1 }, uFoamScale: { value: 1 }, uFresnel: { value: 1 }, uCaustics: { value: 0.5 }, uFlowSpeed: { value: 1 }
    };
    this.wave = createKitMaterial({ vertexShader: WAVE_VERTEX, fragmentShader: WAVE_FRAGMENT, uniforms: waveUniforms, additive: false });
    this.makeMesh(createParamGrid(56, 32), this.wave, 14);

    this.wake = createKitMaterial({
      vertexShader: WAKE_VERTEX,
      fragmentShader: WAKE_FRAGMENT,
      uniforms: {
        uWidthNear: { value: 1 }, uWidth: { value: 1 }, uWakeLen: { value: 6 }, uWakeWidth: { value: 1 },
        uPush: { value: 2 }, uWakeGlow: { value: 1 }
      }
    });
    this.makeMesh(createParamGrid(64, 10), this.wake, 9);
    this._rippleDistance = 0;
  }

  onCast() {
    this._rippleDistance = 0;
  }

  /** Metres from the caster the wall currently stands at. */
  _wallDistance() {
    return Math.min(this.front, this.length) + (this.landed ? this.holdTime * this.cfg.crashPush : 0);
  }

  _halfWidth(d) {
    const c = this.cfg;
    return lerp(c.widthNear, c.width, saturate(d / this.length));
  }

  step(dt, beat) {
    const c = this.cfg;
    const w = this.wave.uniforms;
    w.uWaveH.value = c.waveHeight;
    w.uWidthNear.value = c.widthNear;
    w.uWidth.value = c.width;
    w.uCurl.value = c.curl;
    w.uBack.value = c.backSlope;
    w.uBow.value = c.bow;
    w.uCrestNoise.value = c.crestNoise;
    w.uCrestScale.value = c.crestScale;
    w.uRise.value = c.riseTime;
    w.uCrash.value = c.crash;
    w.uPush.value = c.crashPush;
    w.uFoam.value = c.foam;
    w.uFoamScale.value = c.foamScale;
    w.uFresnel.value = c.fresnel;
    w.uCaustics.value = c.caustics;
    w.uFlowSpeed.value = c.flowSpeed;

    const k = this.wake.uniforms;
    k.uWidthNear.value = c.widthNear;
    k.uWidth.value = c.width;
    k.uWakeLen.value = c.wakeLength;
    k.uWakeWidth.value = c.wakeWidth;
    k.uPush.value = c.crashPush;
    k.uWakeGlow.value = c.wakeGlow;

    const d = this._wallDistance();
    const hw = this._halfWidth(d);
    const crashT = this.landed ? smoothstep(0, 0.6, this.holdTime) : 0;
    const height = c.waveHeight * smoothstep(0, c.riseTime, this.age) * (1 - c.crash * crashT);
    const scale = beat.phase === 'travel' ? 1 : beat.phase === 'hold' ? 0.8 : this.fade * 0.4;

    // The light and camera follow the crest.
    this.pointAt(d / this.length, this.position).setY(height * 0.7 + 0.4);

    // Spray off the crest, thrown forward and up.
    const spray = this.tick('spray', dt, scale);
    if (spray > 0) {
      this.pointAt(d / this.length, _p).addScaledVector(this.side, randRange(-hw, hw) * 0.8);
      _p.y = height * 0.9;
      _d.copy(this.direction).setY(1.1).normalize();
      this.emit('spray', spray, { position: _p, radius: hw * 0.35, direction: _d, spread: 0.6 });
    }
    const drops = this.tick('drops', dt, scale);
    if (drops > 0) {
      this.pointAt(d / this.length, _p).addScaledVector(this.side, randRange(-hw, hw));
      _p.y = height;
      _d.copy(this.direction).setY(0.5).normalize();
      this.emit('drops', drops, { position: _p, radius: hw * 0.3, direction: _d, spread: 0.7, speedVariance: 0.6 });
    }
    const mist = this.tick('mist', dt, scale);
    if (mist > 0) {
      this.pointAt(Math.max(0, d - 1) / this.length, _p).setY(0.3);
      this.emit('mist', mist, { position: _p, radius: hw * 0.8, spread: 0.9, spin: 0.4 });
    }

    // Ripples paid out as the wall passes, like the thunder burns.
    if (beat.phase === 'travel') {
      const stepLen = 1 / Math.max(0.05, c.rippleRate);
      while (this.front - this._rippleDistance >= stepLen) {
        this._rippleDistance += stepLen;
        this.pointAt(saturate(this._rippleDistance / this.length), _p);
        _p.addScaledVector(this.side, randRange(-0.6, 0.6) * this._halfWidth(this._rippleDistance));
        this.decal(DecalType.RIPPLE, _p, {
          radius: randRange(0.8, 1.6), life: 1.4, width: 0.06,
          colorA: getColor(c.colorB), colorB: getColor(c.colorC)
        });
      }
    }
  }

  onLand() {
    const c = this.cfg;
    this.pointAt(1, _p).setY(c.waveHeight * 0.5);
    this.impactFx(_p);
    const hw = this._halfWidth(this.length);
    _d.set(0, 1, 0);
    this.burst('spray', 90, { position: _p, radius: hw * 0.6, direction: _d, speed: 2.2, spread: 0.9, size: 1.3 });
    this.burst('drops', 120, { position: _p, radius: hw * 0.5, direction: _d, speed: 1.8, spread: 1.0 });
    this.burst('mist', 30, { position: _p.setY(0.4), radius: hw, speed: 1.5, spread: 1.0, size: 1.4 });
    this.pointAt(1, _p);
    this.decal(DecalType.FOAM, _p, { radius: hw * 1.3, life: 3.5, colorA: getColor(c.colorB), colorB: getColor(c.colorC) });
    this.decal(DecalType.RIPPLE, _p, { radius: hw * 1.8, life: 1.8, width: 0.05, colorA: getColor(c.colorB), colorB: getColor(c.colorC) });
  }
}
