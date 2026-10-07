import { Mesh, Vector3 } from 'three';
import { Ability, AbilityPhase } from '../Ability.js';
import { RateEmitter } from '../../particles/ParticleEngine.js';
import { DecalType } from '../../effects/GroundDecals.js';
import { BurstMode } from '../../effects/BurstSphere.js';
import { LAYER } from '../../core/Layers.js';
import { frame } from '../../core/FrameUniforms.js';
import { settings } from '../../config/settings.js';
import { getColor } from '../../utils/color.js';
import { saturate, Easing } from '../../utils/math.js';

const _emit = {};
const _pos = new Vector3();
const UP = new Vector3(0, 1, 0);

const cap = (key) => key[0].toUpperCase() + key.slice(1);

/**
 * Shared base for the fifteen kit abilities.
 *
 * The five original abilities each re-wrote the same scaffolding: register
 * three or four particle systems, push twelve uniforms into each of them every
 * frame, keep a `RateEmitter` per system, fill a scratch emit object, fire a
 * burst + shockwave + flash + shake + light punch on impact. That scaffolding is
 * the *strategy* of the project, so here it is written once:
 *
 *   - **Layers are declared, not coded.** A subclass lists its particle layers
 *     in `static layers`; each layer's live values are read from the settings
 *     block by naming convention (`<layer>Rate`, `<layer>Size`, `<layer>Speed`,
 *     `<layer>Lifetime`, `<layer>Gravity`, `<layer>Turbulence`,
 *     `<layer>Opacity`, `color<Layer>A..D`), and re-synced every frame.
 *   - **One uniform block.** Every kit material gets the same cast frame, clocks
 *     and palette via `syncKit`, so a signature shader only declares what is
 *     genuinely its own.
 *   - **The same rule.** A cast captures a seed and timestamps (`age`,
 *     `impactTime`, `fadeTime`) and nothing else. Every metre is resolved from
 *     `settings[element]` inside the frame, which runs with `dt = 0` while
 *     paused — so the editor keeps reshaping effects that are already standing.
 *
 * Subclass hooks: `buildMeshes()`, `onCast()`, `step(dt, beat)`, `onLand()`.
 * `beat` is `{ phase: 'travel' | 'hold' | 'fade', t, hold }`.
 */
export class KitAbility extends Ability {
  /** `{ key: { shape, additive, curl, stretch, swirl, lit, capacity, drag, endSize, sizeIn, fadeIn, fadeOut, softFade, stretchAmount, swirlExpand } }` */
  static layers = {};

  /** Far casts read their target as `pointAt(1)` and work outward from it. */
  static zone = false;

  createShaders() {
    this.kitMaterials = [];
    this.kitMeshes = [];
    this.seed = 0;
    this.fade = 1;
    this.landed = false;
    this.buildMeshes();
  }

  createParticles() {
    this.layers = {};
    this.emitters = {};
    for (const [key, def] of Object.entries(this.constructor.layers)) {
      const system = this.ctx.particles.get(`${this.element}.${key}`, {
        capacity: def.capacity ?? 1500,
        shape: def.shape,
        additive: def.additive ?? true,
        curl: !!def.curl,
        stretch: !!def.stretch,
        swirl: !!def.swirl,
        lit: !!def.lit,
        softFade: def.softFade ?? 0.4
      });
      const u = system.uniforms;
      u.uDrag.value = def.drag ?? 1;
      u.uEndSize.value = def.endSize ?? 0.4;
      u.uSizeIn.value = def.sizeIn ?? 0.08;
      u.uFadeIn.value = def.fadeIn ?? 0.08;
      u.uFadeOut.value = def.fadeOut ?? 0.55;
      u.uStretch.value = def.stretchAmount ?? 0.15;
      u.uSwirlExpand.value = def.swirlExpand ?? 0.4;
      this.layers[key] = system;
      this.emitters[key] = new RateEmitter();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Subclass hooks                                                      */
  /* ------------------------------------------------------------------ */

  buildMeshes() {}
  onCast() {}
  // eslint-disable-next-line no-unused-vars
  step(_dt, _beat) {}
  onLand() {}

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  get cfg() {
    return settings[this.element];
  }

  get zoneR() {
    return Math.max(0.05, this.cfg.zoneRadius ?? 1);
  }

  get impactDuration() {
    return Math.max(0.05, this.cfg.lifetime * settings.global.lifetime);
  }

  get fadeDuration() {
    return Math.max(0.05, this.cfg.fadeTime ?? 0.8);
  }

  /** Seconds since the cast landed, across hold and fade. */
  get holdTime() {
    return this.impactTime + this.fadeTime;
  }

  lightShimmer() {
    const flicker = saturate(this.cfg.lightFlicker ?? 0.1);
    const a = this.age * (this.cfg.lightFlickerSpeed ?? 9);
    return 1 - flicker * (0.5 + 0.5 * Math.sin(a * 1.7) * Math.sin(a * 0.63 + this.seed));
  }

  /** Target point of the cast, on the floor. */
  center(out) {
    return this.pointAt(1, out);
  }

  /** Register a material + mesh pair on the ability group. */
  makeMesh(geometry, material, renderOrder = 11) {
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;
    mesh.layers.set(LAYER.VFX);
    mesh.renderOrder = renderOrder;
    this.group.add(mesh);
    this.kitMaterials.push(material);
    this.kitMeshes.push(mesh);
    return mesh;
  }

  /** Fill the shared kit uniform block of every registered material. */
  syncKit() {
    const c = this.cfg;
    const g = settings.global;
    const travelling = this.phase === AbilityPhase.TRAVEL;
    this.center(_pos);
    for (const m of this.kitMaterials) {
      const u = m.uniforms;
      u.uAge.value = this.age;
      u.uHold.value = travelling ? 0 : this.holdTime;
      u.uFade.value = this.fade;
      u.uProgress.value = travelling ? this.u : 1;
      u.uFront.value = this.front;
      u.uSeed.value = this.seed;
      u.uIntensity.value = (c.intensity ?? 1) * g.shaderIntensity;
      u.uOpacity.value = (c.opacity ?? 1) * g.opacity;
      u.uGlow.value = c.glow ?? 1;
      u.uLength.value = this.length;
      u.uRadius.value = this.zoneR;
      u.uOrigin.value.copy(this.origin);
      u.uDir.value.copy(this.direction);
      u.uSide.value.copy(this.side);
      u.uCenter.value.copy(_pos);
      u.uColorA.value.copy(getColor(c.colorA));
      u.uColorB.value.copy(getColor(c.colorB));
      u.uColorC.value.copy(getColor(c.colorC));
    }
  }

  _syncLayers() {
    const c = this.cfg;
    const g = settings.global;
    for (const [key, system] of Object.entries(this.layers)) {
      const C = cap(key);
      const u = system.uniforms;
      system.setGradient(
        getColor(c[`color${C}A`]),
        getColor(c[`color${C}B`]),
        getColor(c[`color${C}C`]),
        getColor(c[`color${C}D`])
      );
      u.uGravity.value.set(0, c[`${key}Gravity`] ?? 0, 0);
      u.uSizeScale.value = (c[`${key}Size`] ?? 0.2) * g.particleSize;
      u.uLifeScale.value = g.particleLifetime;
      u.uSpeedScale.value = g.particleSpeed;
      u.uOpacity.value = (c[`${key}Opacity`] ?? 1) * g.opacity;
      u.uTurbulence.value = (c[`${key}Turbulence`] ?? 0.3) * g.turbulence;
      if (c[`${key}Swirl`] !== undefined) u.uSwirl.value = c[`${key}Swirl`];
    }
  }

  /** Whole particles due this frame for a layer, from its `<layer>Rate`. */
  tick(key, dt, scale = 1) {
    const rate = (this.cfg[`${key}Rate`] ?? 0) * scale;
    return Math.round(this.emitters[key].tick(dt, rate) * settings.global.particleCount);
  }

  /**
   * Emit on a layer. Size/speed/life are *multipliers* on the layer's live
   * settings, so the editor owns the absolute numbers.
   */
  emit(key, count, p) {
    if (count <= 0) return;
    const c = this.cfg;
    _emit.position = p.position;
    _emit.radius = p.radius ?? 0;
    _emit.direction = p.direction ?? UP;
    _emit.speed = (c[`${key}Speed`] ?? 1) * (p.speed ?? 1);
    _emit.speedVariance = p.speedVariance ?? 0.4;
    _emit.spread = p.spread ?? 0.5;
    _emit.inherit = p.inherit ?? null;
    _emit.anchor = p.anchor ?? null;
    _emit.size = p.size ?? 1;
    _emit.sizeVariance = p.sizeVariance ?? 0.5;
    _emit.life = (c[`${key}Lifetime`] ?? 1) * (p.life ?? 1);
    _emit.lifeVariance = p.lifeVariance ?? 0.4;
    _emit.spin = p.spin ?? 0;
    _emit.tint = p.tint ?? null;
    _emit.time = frame.uTime.value;
    this.layers[key].emit(count, _emit);
  }

  /** Emit a fixed burst scaled by the global particle count. */
  burst(key, count, p) {
    this.emit(key, Math.round(count * settings.global.particleCount), p);
  }

  /**
   * The impact package every kit ability shares: a burst shell, a floor
   * shockwave, a screen flash, camera trauma and a light punch — all read from
   * the block's `burst*`, `shock*`, `impact*` and `colorFlash` fields.
   */
  impactFx(position, { scale = 1, mode = this.cfg.burstMode ?? BurstMode.AIR, shell = true } = {}) {
    const c = this.cfg;
    const g = settings.global;
    const boom = g.explosionIntensity * scale;

    if (shell && c.burstSize > 0) {
      this.ctx.bursts.spawn(mode, position, {
        radius: c.burstSize * 0.2,
        endRadius: c.burstSize * boom,
        life: c.burstLife ?? 0.8,
        intensity: c.burstIntensity ?? 1,
        opacity: 0.9,
        fresnel: 1.4,
        displace: 0.5,
        squash: c.burstSquash ?? 0.8,
        colorA: getColor(c.colorBurstA ?? c.colorA),
        colorB: getColor(c.colorBurstB ?? c.colorB),
        colorC: getColor(c.colorBurstC ?? c.colorC)
      });
    }

    if (c.shockRadius > 0) {
      _pos.set(position.x, 0, position.z);
      this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
        radius: c.shockRadius * boom,
        life: 0.65,
        width: 0.05,
        intensity: 1,
        colorA: getColor(c.colorShockA ?? c.colorA),
        colorB: getColor(c.colorShockB ?? c.colorC)
      });
    }

    this.ctx.shake.add((c.impactShake ?? 0.4) * boom * g.cameraShake, 1 / Math.max(0.1, c.shakeDuration ?? 0.7), 22);
    this.ctx.flash.trigger(getColor(c.colorFlash ?? c.colorC), (c.impactFlash ?? 0.1) * boom);
    this.lightBoost = c.lightIntensity * 1.4 * boom;
  }

  /** Ground mark helper, colours default to the palette. */
  decal(type, position, options = {}) {
    _pos.set(position.x, 0, position.z);
    return this.ctx.decals.spawn(type, _pos, options);
  }

  /* ------------------------------------------------------------------ */
  /* Lifecycle plumbing                                                  */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    for (const emitter of Object.values(this.emitters)) emitter.reset();
    this.seed = Math.random() * 100;
    this.fade = 1;
    this.landed = false;
    for (const mesh of this.kitMeshes) mesh.visible = true;
    this.onCast();
    this._frame(0, { phase: 'travel', t: 0, hold: 0 });
  }

  onTravel(dt) {
    this._frame(dt, { phase: 'travel', t: this.u, hold: 0 });
    const rumble = this.cfg.rumble ?? 0;
    if (rumble > 0) this.ctx.shake.rumble(rumble * settings.global.cameraShake, dt);
  }

  onImpact() {
    this.landed = true;
    if (this.constructor.zone) this.center(this.position).setY(1);
    this.onLand();
  }

  onFade(dt, t) {
    const fading = t > 1;
    this.fade = fading ? 1 - Easing.inCubic(saturate(t - 1)) : 1;
    this._frame(dt, { phase: fading ? 'fade' : 'hold', t: fading ? t - 1 : t, hold: this.holdTime });
  }

  _frame(dt, beat) {
    this._syncLayers();
    this.step(dt, beat);
    this.syncKit();
  }

  onDestroy() {
    this.fade = 0;
    for (const mesh of this.kitMeshes) mesh.visible = false;
  }

  dispose() {
    for (const mesh of this.kitMeshes) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    super.dispose();
  }
}

