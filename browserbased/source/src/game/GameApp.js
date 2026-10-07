import { Vector3 } from 'three';

import { Renderer } from '../core/Renderer.js';
import { Time } from '../core/Time.js';
import { frame } from '../core/FrameUniforms.js';
import { Environment } from '../world/Environment.js';
import { Ground } from '../world/Ground.js';
import { DustMotes } from '../world/DustMotes.js';
import { ContactShadows } from '../world/ContactShadows.js';
import { AssetLoader } from '../loaders/AssetLoader.js';
import { CharacterController } from '../animation/CharacterController.js';
import { ParticleEngine } from '../particles/ParticleEngine.js';
import { LightPool } from '../effects/LightPool.js';
import { DecalSystem } from '../effects/GroundDecals.js';
import { FissureSystem } from '../effects/GroundFissures.js';
import { BurstSystem, BurstMode } from '../effects/BurstSphere.js';
import { CameraShake } from '../effects/CameraShake.js';
import { ScreenFlash } from '../effects/ScreenFlash.js';
import { AbilityManager } from '../abilities/AbilityManager.js';
import { PostProcessing } from '../postprocessing/PostProcessing.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';

import { GameCamera } from './systems/GameCamera.js';
import { GameInput } from './systems/GameInput.js';
import { Player } from './systems/Player.js';
import { EnemySystem } from './systems/EnemySystem.js';
import { PickupSystem } from './systems/PickupSystem.js';
import { SkillSystem } from './systems/SkillSystem.js';
import { Director } from './systems/Director.js';
import { Dungeon } from './systems/Dungeon.js';
import { DamageText } from './systems/DamageText.js';
import { Sfx } from './systems/Sfx.js';
import { Platform } from './platform/Platform.js';
import { Quality } from './systems/Quality.js';
import { GameUI } from './ui/GameUI.js';
import { SKILLS, SKILL_IDS, STARTERS, MAX_SKILL_LEVEL } from './data/skills.js';
import { PASSIVES, PASSIVE_IDS, MAX_PASSIVE_LEVEL } from './data/passives.js';

const HDR_URL = './hdri/spruit_sunrise.hdr';
const BEST_KEY = 'dungeonio.best';
const _v = new Vector3();

/** The look of the dungeon, applied over the sandbox defaults once at boot. */
function dressSettings() {
  Object.assign(settings.environment, {
    sunIntensity: 1.9,
    sunColor: '#ffd9b0',
    ambientIntensity: 0.16,
    ambientColor: '#8a7f90',
    hemiIntensity: 0.38,
    hemiSkyColor: '#c9b8a8',
    hemiGroundColor: '#2a2530',
    rimIntensity: 0.9,
    rimColor: '#ff9a60',
    backgroundColor: '#0a0a0d',
    fogEnabled: true,
    fogColor: '#0a0a0d',
    fogNear: 20,
    fogFar: 52,
    floorTexture: true,
    floorTextureScale: 12,
    floorColor: '#1a1719',
    floorTint: '#7d8796',
    floorTexTint: 0.85,
    floorPool: 0.35,
    dustAmount: 0.6
  });
  Object.assign(settings.post, { vignette: 0.75, bloomStrength: 0.12, chromaticAberration: 0.2 });
  // Many effects at once: trim particle budgets and the camera's own drama.
  settings.global.cameraShake = 0.55;
  settings.global.explosionIntensity = 0.85;
  settings.character.castLean = Math.min(settings.character.castLean ?? 0, 0.15);
}

/**
 * Dungeon.io.
 *
 * The sandbox engine is reused as-is — renderer, lights, particles, decals,
 * bursts, shake, flash, post, the character and all 21 abilities. What this
 * class adds is a *game*: a follow camera instead of an orbit rig, a
 * simulation that runs at a clamped delta and stops dead on menus, and the run
 * lifecycle (title → starter pick → play → level-ups → end).
 */
export class GameApp {
  constructor(canvas) {
    dressSettings();
    this.time = new Time();
    this.elapsed = 0;
    this.clock = 0;
    this.state = 'loading';
    this.pendingLevels = 0;
    this.stats = { kills: 0, time: 0 };

    this.renderer = new Renderer(canvas);
    this.gcam = new GameCamera();
    this.camera = this.gcam.camera;
    this.environment = new Environment(this.renderer, this.camera);
    this.scene = this.environment.scene;

    this.ground = new Ground(this.environment);
    this.dust = new DustMotes();
    this.contactShadows = new ContactShadows(this.renderer, { size: 2.6, height: 2.4, blur: 2.0 });
    this.scene.add(this.ground.mesh, this.dust.points, this.contactShadows.group);
    this.dust.setPixelRatio(this.renderer.gl.getPixelRatio());

    this.particles = new ParticleEngine(this.scene);
    this.lights = new LightPool(this.scene);
    this.decals = new DecalSystem(this.scene);
    this.fissures = new FissureSystem(this.scene);
    this.bursts = new BurstSystem(this.scene);
    this.shake = new CameraShake(this.gcam);
    this.flash = new ScreenFlash();

    this.abilities = new AbilityManager({
      scene: this.scene,
      camera: this.camera,
      environment: this.environment,
      particles: this.particles,
      lights: this.lights,
      decals: this.decals,
      fissures: this.fissures,
      bursts: this.bursts,
      shake: this.shake,
      flash: this.flash,
      maxConcurrent: 22
    });

    this.character = new CharacterController(this.environment);
    this.character.onStep = () => {
      if (this.state === 'play') this.sfx.footstep();
    };
    this.scene.add(this.character.root);
    this.post = new PostProcessing(this.renderer, this.scene, this.camera);

    this.platform = new Platform();
    this.sfx = new Sfx();
    const uiRoot = document.getElementById('ui');
    this.ui = new GameUI(uiRoot, {
      onPlay: () => this._clickPlay(),
      onPause: () => this.togglePause(),
      onResume: () => this.togglePause(false),
      onQuit: () => this._quit(),
      onRevive: () => this._revive(),
      onMute: () => this._toggleMute()
    });
    this.input = new GameInput(document.getElementById('stick'), document.getElementById('stick-knob'));
    this.input.onPause = () => this.togglePause();
    this.input.onPick = (i) => this.ui.pick(i);
    this.damageText = new DamageText(document.getElementById('dmg-layer'), this.camera);

    // Systems share this object as their context.
    this.dungeon = new Dungeon(this);
    this.player = new Player(this.character, this);
    this.pickups = new PickupSystem(this);
    this.enemies = new EnemySystem(this);
    this.skills = new SkillSystem(this);
    this.director = new Director(this);

    this.renderer.onResize((w, h, dpr) => {
      this.gcam.resize(w, h);
      this.post.setSize(w, h, dpr);
      this.dust.setPixelRatio(dpr);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'play') this.togglePause(true);
    });
    this.quality = new Quality(this.renderer);
    try {
      this.sfx.setMuted(localStorage.getItem('dungeonio.muted') === '1');
    } catch { /* storage may be blocked */ }
    this.ui.setMuted(this.sfx.muted);
    this.gcam.snap(0, 0);
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */

  async load() {
    const assets = new AssetLoader();
    this.ui.progress(0.05, 'Waking the dungeon…');
    await this.platform.init();
    const hdr = await assets.loadHDR(HDR_URL);
    await this.environment.loadEnvironment(hdr);
    frame.uEnvMap.value = this.environment.equirect;

    this.ui.progress(0.35, 'Laying stone…');
    await this.ground.loadTextures(assets);

    this.ui.progress(0.55, 'Summoning the hero…');
    await this.character.load(assets);

    this.ui.progress(0.8, 'Forging spells…');
    await this._warmUp();

    this.ui.progress(1, 'Ready');
    this.ui.hideLoader();
    this.platform.loadingDone();
    this._toTitle();
    this._loop();
  }

  /**
   * Cast every spell once off-screen and compile, so the first real cast of
   * each never hitches. Enemies and pickups get a frame too.
   */
  async _warmUp() {
    _v.set(0, 0, 1);
    for (const id of SKILL_IDS) {
      const el = SKILLS[id].element;
      this.abilities.cast(new Vector3(0, 0, -400), _v, 6, el);
      this.abilities.update(0.05);
    }
    this.enemies.spawn('slime', 0, -400);
    this.pickups.dropXp(0, -400, 1);
    this.enemies.render();
    this.pickups.render();
    try {
      await this.renderer.gl.compileAsync(this.scene, this.camera);
    } catch { /* older drivers: fall back to lazy compile */ }
    this.abilities.clear();
    this.enemies.clear();
    this.pickups.clear();
  }

  _loop() {
    this.time.reset();
    const tick = () => {
      requestAnimationFrame(tick);
      if (!this.manual) this.frame();
    };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ */
  /* Run lifecycle                                                       */
  /* ------------------------------------------------------------------ */

  _best() {
    try {
      return JSON.parse(localStorage.getItem(BEST_KEY) ?? 'null');
    } catch {
      return null;
    }
  }

  _toTitle() {
    this.state = 'title';
    this._resetWorld();
    this.ui.showTitle(this._best());
  }

  _resetWorld() {
    this.abilities.clear();
    this.enemies.clear();
    this.pickups.clear();
    this.decals.clear();
    this.bursts.clear();
    this.fissures.clear();
    this.damageText.clear();
    this.skills.reset();
    this.director.reset();
    this.player.reset();
    this.stats.kills = 0;
    this.stats.time = 0;
    this.pendingLevels = 0;
    this.gcam.snap(0, 0);
    this.ui.boss(null);
  }

  async _clickPlay() {
    this.sfx.unlock();
    this.sfx.click();
    if (this._ranOnce) await this.platform.midgame();
    this._ranOnce = true;
    this._resetWorld();
    this.quality.newRun();
    this.ui.showHud();
    this.ui.loadout(this.skills);
    this.state = 'choice';
    const picks = shuffle([...STARTERS]).slice(0, 3);
    this.ui.showChoices('Choose your spell', 'It casts on its own. You just survive.', picks.map((id) => ({
      kind: 'skill', id, tag: 'Starter', name: SKILLS[id].name, desc: SKILLS[id].blurb
    })), (i) => {
      this.skills.addSkill(picks[i]);
      this.ui.loadout(this.skills);
      this.state = 'play';
      this.platform.gameplayStart();
    });
  }

  togglePause(force) {
    if (this.state !== 'play' && this.state !== 'paused') return;
    const on = force ?? this.state === 'play';
    if (on === (this.state === 'paused')) return;
    this.state = on ? 'paused' : 'play';
    this.ui.showPause(on, this.skills);
    if (on) this.platform.gameplayStop();
    else this.platform.gameplayStart();
  }

  _quit() {
    this.platform.gameplayStop();
    this.ui.showPause(false);
    this._toTitle();
  }

  _toggleMute() {
    this.sfx.unlock();
    this.sfx.setMuted(!this.sfx.muted);
    this.ui.setMuted(this.sfx.muted);
    try {
      localStorage.setItem('dungeonio.muted', this.sfx.muted ? '1' : '0');
    } catch { /* ignore */ }
  }

  /* ---- hooks the systems call ---- */

  onXp(value) {
    const gained = this.player.addXp(value);
    if (gained > 0) {
      this.pendingLevels += gained;
      this.sfx.levelUp();
    }
  }

  onChest() {
    this.sfx.chest();
    this.platform.happy();
    this.state = 'choice';
    const evolvable = this.skills.evolvable();
    let rewards;
    if (evolvable.length) {
      const id = evolvable[0];
      this.skills.evolve(id);
      rewards = [{ kind: 'skill', id, tag: 'Awakened', name: SKILLS[id].evolve.name, desc: `${SKILLS[id].name} awakens. Stronger, larger, faster.` }];
    } else {
      rewards = this._choices(Math.random() < 0.3 ? 3 : 1);
      rewards.forEach((r) => this._apply(r));
      if (rewards.length === 0) {
        this.player.heal(this.player.stats.maxHp);
        rewards = [{ kind: 'heal', id: 'heal', tag: 'Boon', name: 'Full Heal', desc: 'Your wounds close.' }];
      }
    }
    this.ui.loadout(this.skills);
    this.ui.showChoices('Treasure!', 'Pick any card to claim everything.', rewards, () => {
      this.state = 'play';
    });
  }

  onBossDown(def) {
    this.platform.happy();
    if (def.final) {
      this.ui.banner('Victory', 'good');
      setTimeout(() => this._endRun(true), 1800);
    } else {
      this.ui.banner(`${def.title} is slain`, 'good');
    }
  }

  onPlayerDown() {
    this.flash.trigger(getColor('#ff2030'), 0.4);
    setTimeout(() => this._endRun(false), 900);
  }

  _endRun(victory) {
    if (this.state === 'over' || this.state === 'title') return;
    this.state = 'over';
    this.platform.gameplayStop();
    const damage = [...this.skills.damageBy]
      .map(([id, amount]) => ({ id, amount, name: this.skills.displayName(id) }))
      .sort((a, b) => b.amount - a.amount);
    const run = { time: this.stats.time, kills: this.stats.kills };
    const best = this._best();
    if (!best || run.time > best.time || (run.time === best.time && run.kills > best.kills)) {
      try {
        localStorage.setItem(BEST_KEY, JSON.stringify(run));
      } catch { /* ignore */ }
    }
    this.ui.showEnd({
      victory,
      time: this.stats.time,
      kills: this.stats.kills,
      level: this.player.level,
      damage,
      canRevive: !victory && !this.player.revived
    });
  }

  async _revive() {
    const ok = await this.platform.rewarded();
    if (!ok) return;
    this.player.revive();
    // Clear breathing room.
    this.enemies.forEachInRadius(this.player.x, this.player.z, 9, (i, dx, dz) => {
      if (this.enemies.isBoss(i)) this.enemies.knock(i, dx, dz, 30);
      else this.enemies.damage(i, 99999);
    });
    _v.set(this.player.x, 1, this.player.z);
    this.bursts.spawn(BurstMode.AIR, _v, { radius: 0.5, endRadius: 10, life: 0.8, intensity: 1.2, colorA: getColor('#3ee8c9'), colorB: getColor('#ffffff'), colorC: getColor('#ffffff') });
    this.ui.showHud();
    this.state = 'play';
    this.platform.gameplayStart();
  }

  /* ------------------------------------------------------------------ */
  /* Level-up choices                                                    */
  /* ------------------------------------------------------------------ */

  _choices(count) {
    const s = this.skills;
    const pool = [];
    for (const id of SKILL_IDS) {
      const l = s.level(id);
      if (l > 0 && l < MAX_SKILL_LEVEL) pool.push({ kind: 'skill', id, w: 3, tag: `Lv ${l + 1}` });
      else if (l === 0 && !s.slotsFull) pool.push({ kind: 'skill', id, w: 1, tag: 'New' });
    }
    for (const id of PASSIVE_IDS) {
      const l = s.passiveLevel(id);
      if (l > 0 && l < MAX_PASSIVE_LEVEL) pool.push({ kind: 'relic', id, w: 2, tag: `Lv ${l + 1}` });
      else if (l === 0 && !s.relicSlotsFull) pool.push({ kind: 'relic', id, w: 1, tag: 'New' });
    }
    const out = [];
    while (out.length < count && pool.length) {
      const total = pool.reduce((a, p) => a + p.w, 0);
      let r = Math.random() * total;
      const k = pool.findIndex((p) => (r -= p.w) <= 0);
      const [pick] = pool.splice(Math.max(0, k), 1);
      out.push(pick);
    }
    return out.map((o) => ({
      ...o,
      name: o.kind === 'skill' ? SKILLS[o.id].name : PASSIVES[o.id].name,
      desc: o.kind === 'skill' ? this._skillDesc(o.id) : PASSIVES[o.id].blurb
    }));
  }

  _skillDesc(id) {
    const def = SKILLS[id];
    const l = this.skills.level(id);
    if (l === 0) return def.blurb;
    const d0 = def.damage[l - 1];
    const d1 = def.damage[l];
    const c0 = def.cooldown[l - 1];
    const c1 = def.cooldown[l];
    const evo = l + 1 === MAX_SKILL_LEVEL ? ` Max level awakens it with ${PASSIVES[def.evolve.passive].name}.` : '';
    return `Damage ${d0} → ${d1}, cooldown ${c0}s → ${c1}s.${evo}`;
  }

  _apply(o) {
    if (o.kind === 'skill') this.skills.addSkill(o.id);
    else if (o.kind === 'relic') this.skills.addPassive(o.id);
    else if (o.kind === 'heal') this.player.heal(this.player.stats.maxHp * 0.4);
  }

  _offerLevelUp() {
    this.pendingLevels--;
    this.state = 'choice';
    let options = this._choices(3);
    if (options.length === 0) {
      options = [{ kind: 'heal', id: 'heal', tag: 'Boon', name: 'Second Wind', desc: 'Restore 40% of your health.' }];
    }
    this.ui.showChoices('Level up!', `Level ${this.player.level - this.pendingLevels}`, options, (i) => {
      this._apply(options[i]);
      this.ui.loadout(this.skills);
      this.state = 'play';
    });
  }

  /* ------------------------------------------------------------------ */
  /* Frame                                                               */
  /* ------------------------------------------------------------------ */

  frame() {
    const gl = this.renderer.gl;
    gl.info.reset();
    const raw = this.time.tick();
    const playing = this.state === 'play';
    const dt = playing ? Math.min(raw, 1 / 20) : 0;
    this.elapsed += dt;
    this.clock = this.elapsed;

    frame.uTime.value = this.elapsed;
    frame.uDelta.value = dt;
    frame.uShaderIntensity.value = settings.global.shaderIntensity;
    frame.uGlobalGlow.value = settings.global.glow;
    frame.uCameraNear.value = this.camera.near;
    frame.uCameraFar.value = this.camera.far;
    this.renderer.syncSettings();

    const move = this.input.update();
    const p = this.player;
    if (playing) {
      this.quality.sample(raw);
      this.stats.time += dt;
      p.update(dt, move);
      this.director.update(dt);
      this.skills.update(dt);
      this.enemies.update(dt, p);
      this.pickups.update(dt, p);
      if (this.pendingLevels > 0 && p.alive) this._offerLevelUp();
    }

    this.dungeon.update(p.x, p.z);
    this.environment.setFocus(p.x, p.z);
    this.environment.update();
    this.character.update(this.state === 'title' ? raw : dt);
    this.ground.update(this.elapsed);
    this.dust.update(this.elapsed, this.character.position);

    this.abilities.update(dt);
    this.particles.flush();
    this.decals.update(dt);
    this.fissures.update(dt);
    this.bursts.update(dt);
    this.lights.update(dt);
    this.enemies.render();
    this.pickups.render();

    this.shake.update(playing ? raw : 0);
    this.flash.update(raw);
    this.gcam.zoom = this.state === 'title' ? 0.62 : 1;
    this.gcam.update(raw, p.x, p.z);

    this.contactShadows.setPosition(p.x, p.z);
    this.contactShadows.render(this.scene);
    gl.shadowMap.needsUpdate = true;
    this.post.sync(this.elapsed, this.flash);
    this.post.render();

    this._updateUi(raw, playing);
  }

  _updateUi(raw, playing) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const p = this.player;
    this.damageText.update(playing ? raw : 0, width, height);
    if (this.state === 'title' || this.state === 'loading') return;

    this.ui.loadout(this.skills);
    this.ui.hud({ xp: p.xp, xpNext: p.xpNext, level: p.level, time: this.stats.time, kills: this.stats.kills });
    _v.set(p.x, 0, p.z).project(this.camera);
    this.ui.playerBar((_v.x * 0.5 + 0.5) * width, (-_v.y * 0.5 + 0.5) * height + 14, p.hp / p.stats.maxHp, p.alive && this.state !== 'over');
    this.ui.hurt(p.hurtFlash * 0.6 + (p.alive && p.hp / p.stats.maxHp < 0.25 ? 0.25 : 0));

    const b = this.enemies.headlineBoss;
    if (b >= 0) this.ui.boss(this.enemies.def(b).title, this.enemies.hp[b] / this.enemies.maxHp[b]);
    else this.ui.boss(null);
  }
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
