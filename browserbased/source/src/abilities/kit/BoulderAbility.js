import { Mesh, Quaternion, Vector3, FrontSide } from 'three';
import { KitAbility } from './KitAbility.js';
import { createKitMaterial } from '../../materials/kit/kitShader.js';
import { createAsteroidGeometry } from '../../assets/ProceduralGeometry.js';
import { ParticleShape } from '../../particles/ParticleSystem.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { LAYER } from '../../core/Layers.js';
import { getColor } from '../../utils/color.js';
import { saturate, randRange } from '../../utils/math.js';

const _p = new Vector3();
const _d = new Vector3();
const _axis = new Vector3();
const _q = new Quaternion();

const ROCK_VERTEX = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vWorld;
  void main() {
    vObj = position;
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const ROCK_FRAGMENT = /* glsl */ `
  uniform float uHeat;
  uniform float uCrackScale;
  uniform float uCrackWidth;
  uniform float uCrackPulse;
  uniform float uAmbient;
  uniform float uRim;
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vWorld;

  void main() {
    vec3 n = normalize(vN);
    vec3 V = normalize(cameraPosition - vWorld);
    float grain = fbm3(vObj * 4.0 + uSeed) * 0.5 + 0.5;
    vec3 rock = uColorA * mix(0.6, 1.2, grain);
    float diff = max(dot(n, uLightDir), 0.0);
    vec3 col = rock * (uAmbient + diff * 0.9);
    col += uColorA * pow(1.0 - max(dot(n, V), 0.0), 3.0) * uRim;

    float r = ridged(vObj * uCrackScale + uSeed, 4) / 0.9375;
    float crack = smoothstep(0.88 - uCrackWidth, 0.95, r);
    float pulse = 1.0 + uCrackPulse * sin(uTime * 7.0 + grain * 6.0);
    float glow = crack * uHeat * pulse;
    col += mix(uColorB, uColorC, smoothstep(0.4, 1.2, glow)) * glow * 2.4 * uGlow * uGlobalGlow;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * BOULDER — a rolling, hopping rock that shatters at the target.
 *
 * The one kit ability with a real, opaque, CPU-placed mesh: position and roll
 * are recomputed each frame from `front` (roll angle = distance ÷ radius, about
 * `up × heading`), so nothing about the rock's pose is ever stored. The glowing
 * seams are ridged noise in object space, heated by how far it has come.
 */
export class BoulderAbility extends KitAbility {
  static layers = {
    dust: { shape: ParticleShape.SMOKE, additive: false, curl: true, drag: 1.7, endSize: 2.8, fadeIn: 0.15, fadeOut: 0.3, softFade: 1.0 },
    debris: { shape: ParticleShape.CHIP, additive: false, lit: true, drag: 0.3, endSize: 0.8, fadeOut: 0.75, softFade: 0.2 },
    embers: { shape: ParticleShape.SOFT, curl: true, drag: 1.0, endSize: 0.2, fadeOut: 0.5 }
  };

  constructor(ctx) {
    super('boulder', ctx);
  }

  buildMeshes() {
    this.rockMaterial = createKitMaterial({
      vertexShader: ROCK_VERTEX,
      fragmentShader: ROCK_FRAGMENT,
      additive: false,
      transparent: false,
      depthWrite: true,
      side: FrontSide,
      uniforms: {
        uHeat: { value: 0 }, uCrackScale: { value: 2 }, uCrackWidth: { value: 0.1 },
        uCrackPulse: { value: 0.3 }, uAmbient: { value: 0.35 }, uRim: { value: 0.3 }
      }
    });
    this.rock = new Mesh(createAsteroidGeometry({ seed: 3, detail: 3, lumpiness: this.cfg.lumpiness }), this.rockMaterial);
    this.rock.matrixAutoUpdate = false;
    this.rock.frustumCulled = false;
    this.rock.layers.set(LAYER.VFX);
    this.group.add(this.rock);
    this.kitMaterials.push(this.rockMaterial);
    this.kitMeshes.push(this.rock);

    this.baseTurn = new Quaternion();
    this._trail = 0;
  }

  onCast() {
    this._trail = 0;
    this.baseTurn.setFromAxisAngle(_axis.set(Math.random(), Math.random(), Math.random()).normalize(), Math.random() * 6.28);
  }

  step(dt, beat) {
    const c = this.cfg;
    const u = this.rockMaterial.uniforms;
    u.uCrackScale.value = c.crackScale;
    u.uCrackWidth.value = c.crackWidth;
    u.uCrackPulse.value = c.crackPulse;
    u.uAmbient.value = c.ambient;
    u.uRim.value = c.rim;
    u.uHeat.value = 0.25 + this.u * c.heatRamp;

    if (beat.phase !== 'travel') {
      this.rock.visible = false;
      const scale = beat.phase === 'hold' ? 1 - beat.t : 0;
      const dust = this.tick('dust', dt, scale * 0.6);
      if (dust > 0) this.emit('dust', dust, { position: this.center(_p).setY(0.4), radius: c.fissureRadius * 0.6, spread: 1 });
      const embers = this.tick('embers', dt, scale);
      if (embers > 0) this.emit('embers', embers, { position: this.center(_p).setY(0.2), radius: c.fissureRadius * 0.7, spread: 0.6 });
      return;
    }

    // Pose: roll about (up × heading) by distance ÷ radius, hop on a |sin|.
    const hop = Math.abs(Math.sin(this.front * c.bounceRate * Math.PI)) * c.bounce;
    this.pointAt(this.u, this.rock.position);
    this.rock.position.y = c.radius + hop;
    _axis.set(0, 1, 0).cross(this.direction).normalize();
    _q.setFromAxisAngle(_axis, this.front / Math.max(0.1, c.radius));
    this.rock.quaternion.copy(_q).multiply(this.baseTurn);
    this.rock.scale.setScalar(c.radius);
    this.rock.updateMatrix();
    this.position.copy(this.rock.position);

    // Everything is thrown from the contact patch, behind the rock.
    this.pointAt(this.u, _p).addScaledVector(this.direction, -c.radius * 0.5).setY(0.15);
    _d.copy(this.direction).multiplyScalar(-0.6).setY(1).normalize();
    this.emit('dust', this.tick('dust', dt), { position: _p, radius: c.radius, direction: _d, spread: 0.8, spin: 0.4 });
    this.emit('debris', this.tick('debris', dt), { position: _p, radius: c.radius * 0.5, direction: _d, spread: 0.7, spin: 9 });
    this.emit('embers', this.tick('embers', dt, this.u), { position: this.rock.position, radius: c.radius, spread: 1 });

    const stepLen = 1 / Math.max(0.05, c.trailRate);
    while (this.front - this._trail >= stepLen) {
      this._trail += stepLen;
      this.pointAt(saturate(this._trail / this.length), _p);
      this.decal(DecalType.CRACK, _p, {
        radius: c.radius * randRange(0.9, 1.3), life: 2.2, width: 0.15,
        colorA: getColor(c.colorDustD), colorB: getColor(c.colorB)
      });
    }
  }

  onLand() {
    const c = this.cfg;
    this.center(_p).setY(c.radius);
    this.impactFx(_p);
    _d.set(0, 1, 0);
    this.burst('debris', 70, { position: _p, radius: c.radius, direction: _d, spread: 1, speed: 1.8, size: 2.2, spin: 12 });
    this.burst('embers', 80, { position: _p, radius: c.radius, spread: 1, speed: 3 });
    this.burst('dust', 40, { position: _p.setY(0.4), radius: c.radius * 1.5, spread: 1, speed: 2.5, size: 1.3 });
    this.center(_p);
    this.ctx.fissures.spawn(_p, { radius: c.fissureRadius, life: c.fissureLife });
    this.decal(DecalType.DUSTRING, _p, { radius: c.fissureRadius * 1.5, life: 1.2, colorA: getColor(c.colorDustC), colorB: getColor(c.colorDustA) });
  }
}
