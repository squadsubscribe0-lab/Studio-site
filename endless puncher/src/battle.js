import * as THREE from 'three';
import {
  buildArena, styleArena, buildFighter, dressPlayer, buildGlove, addCrown, buildPet,
  buildMinecart, RAIL_R,
  GEO, lambert, RING_HALF,
} from './models.js';
import { ENEMY_TYPES, SKILLS, RARITIES, GEAR_SLOTS, PETS, COMBOS } from './data.js';
import { computeStats, getItem, fmt } from './stats.js';
import { Save } from './save.js';
import { Audio } from './audio.js';
import { PET_SKILLS, petPower } from './petSkills.js';

const STUN_TINT = { ice: '#2a7fb8', rock: '#6b5a2a', bubble: '#8a3a7a', void: '#4a1a8a' };
const BUBBLE_GEO = new THREE.SphereGeometry(0.75, 20, 14);
const PUFF_GEO = new THREE.IcosahedronGeometry(1, 0);
const puffMats = new Map();
function puffMat(color) {
  if (!puffMats.has(color)) puffMats.set(color, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false }));
  return puffMats.get(color);
}
const V1 = new THREE.Vector3();
const V2 = new THREE.Vector3();
const V3 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const PLAY_HALF = RING_HALF - 0.8;
const MAX_FLOATERS = 70;

// Local-space origins for each arm; the first two are shoulders, the rest sprout from the back.
const ARM_ORIGINS = [
  [-0.36, 1.52, 0], [0.36, 1.52, 0],
  [-0.32, 1.25, -0.18], [0.32, 1.25, -0.18],
  [-0.22, 1.78, -0.2], [0.22, 1.78, -0.2],
];
const ARM_REST = [
  [-0.32, 1.42, 0.62], [0.32, 1.42, 0.62],
  [-0.95, 1.1, 0.25], [0.95, 1.1, 0.25],
  [-0.8, 2.2, 0.1], [0.8, 2.2, 0.1],
];

export class Battle {
  constructor(renderer, hooks) {
    this.renderer = renderer;
    this.hooks = hooks;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#1b2233');
    this.scene.fog = new THREE.Fog('#1b2233', 30, 70);
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 200);
    this.camTarget = new THREE.Vector3();
    this.shake = 0;

    const hemi = new THREE.HemisphereLight('#bcd4ff', '#3a2a22', 1.3);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff1dc', 1.6);
    sun.position.set(-8, 20, 10);
    this.scene.add(sun);

    this.arena = buildArena();
    // Mine carts rolling around the rail loop (pure ambience).
    this.carts = [0, 0.37, 0.71].map((frac) => {
      const mesh = buildMinecart();
      this.scene.add(mesh);
      return { mesh, s: frac * RAIL_R * 8, speed: 2.2 + frac, yaw: 0 };
    });
    this.shieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 24, 16),
      new THREE.MeshPhongMaterial({ color: '#7fe3ff', transparent: true, opacity: 0.28, shininess: 140, specular: '#ffffff', depthWrite: false }),
    );
    this.shieldMesh.visible = false;
    this.scene.add(this.arena.root);

    this.buildPlayer();

    this.enemies = [];
    this.enemyPool = { grunt: [], runner: [], brute: [], thrower: [], boss: [] };
    this.drops = [];
    this.dropPool = [];
    this.projectiles = [];
    this.effects = [];
    this.zones = [];
    this.pets = [];
    this.input = { x: 0, z: 0 };
    this.timeScale = 1;
    this.running = false;
    this.paused = false;

    this.floatLayer = document.getElementById('floaters');
    this.floaters = [];
    for (let i = 0; i < MAX_FLOATERS; i++) {
      const el = document.createElement('div');
      el.className = 'floater';
      el.style.display = 'none';
      this.floatLayer.appendChild(el);
      this.floaters.push({ el, life: 0, pos: new THREE.Vector3(), vy: 0 });
    }
    this.floatIdx = 0;

    // Shared FX materials
    this.sparkMat = new THREE.MeshBasicMaterial({ color: '#fff3b0' });
    this.gemMat = new THREE.MeshLambertMaterial({ color: '#3dff7a', emissive: '#0d6b2a' });
    this.coinMat = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#6b4d00' });
    this.rockMat = lambert('#6d5a4a');
    this.ringFxMat = new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
    this.warnMat = new THREE.MeshBasicMaterial({ color: '#ff2a2a', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    this.boltMat = new THREE.LineBasicMaterial({ color: '#8ff3ff' });
    this.bubbleMat = new THREE.MeshPhongMaterial({ color: '#ffc6ee', transparent: true, opacity: 0.4, shininess: 120, specular: '#ffffff', depthWrite: false });
  }

  // ---------------- setup ----------------
  buildPlayer() {
    const f = dressPlayer(buildFighter({ color: '#2fb4ff', player: true }));
    this.player = f;
    this.scene.add(f.root);
    this.arms = [];
    this.armMat = lambert('#2fb4ff');
    for (let i = 0; i < ARM_ORIGINS.length; i++) {
      const tube = new THREE.Mesh(GEO.armTube, this.armMat);
      const glove = buildGlove('#e23');
      this.scene.add(tube); this.scene.add(glove);
      this.arms.push({
        tube, glove, idx: i,
        state: 'idle', t: 0, cd: 0.2 + i * 0.13,
        target: null, aim: new THREE.Vector3(), from: new THREE.Vector3(),
        pos: new THREE.Vector3(),
      });
    }
  }

  applyLooks() {
    const s = Save.state;
    const g = this.player.gear;
    const colorOf = (slot) => {
      const it = getItem(s.equipped[slot]);
      return it ? RARITIES[it.rarity].color : null;
    };
    const set = (mesh, slot) => {
      const c = colorOf(slot);
      mesh.visible = !!c;
      if (c) mesh.material.color.set(c);
    };
    set(g.helmet, 'helmet');
    set(g.belt, 'belt');
    set(g.armor, 'armor');
    g.shoes.forEach(m => set(m, 'shoes'));
    g.pants.forEach(m => set(m, 'pants'));
    g.band.visible = !g.helmet.visible;
    const gl = getItem(s.equipped.gloves);
    const gloveColor = !gl || gl.rarity === 0 ? '#e23b3b' : RARITIES[gl.rarity].color;
    for (const a of this.arms) a.glove.userData.ball.material.color.set(gloveColor);
    styleArena(this.arena, s.ring.tier);
    this.buildPets();
  }

  buildPets() {
    for (const p of this.pets) this.scene.remove(p.root);
    this.pets = [];
    Save.state.petSlots.forEach((id, i) => {
      if (!id) return;
      const def = PETS.find(p => p.id === id);
      if (!def) return;
      const root = buildPet(def.color, def.element, def.costume);
      root.scale.setScalar(0.9);
      root.position.set(this.player.root.position.x + (i - 1) * 1.2, 0, this.player.root.position.z - 1.5);
      this.scene.add(root);
      this.pets.push({ root, def, cd: 1 + i * 0.4, slot: i, bob: Math.random() * 6, skillCd: 2 + i * 1.2, channel: null });
    });
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    // Fit the ring on screen for both portrait and landscape.
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const needH = this.camera.aspect > 1 ? 13 : 11.5, needW = 10;
    const dV = needH / Math.tan(vfov / 2);
    const dW = needW / (Math.tan(vfov / 2) * this.camera.aspect);
    this.camDist = Math.max(dV, dW);
    this.camera.far = this.camDist + 120;
    this.scene.fog.near = this.camDist + 4;
    this.scene.fog.far = this.camDist + 45;
    this.camera.updateProjectionMatrix();
  }

  // ---------------- run lifecycle ----------------
  start(stage) {
    this.clearAll();
    this.stats = computeStats();
    this.stage = stage;
    this.skills = {};
    this.level = 1;
    this.xp = 0;
    this.xpNext = this.xpFor(1);
    this.maxHp = this.stats.hp;
    this.hp = this.maxHp;
    this.kills = 0;
    this.killsNeeded = Math.min(90, 28 + stage * 4);
    this.boss = null;
    this.bossSpawned = false;
    this.spawnT = 0.5;
    this.slamT = 0;
    this.runCoins = 0;
    this.runGems = 0;
    this.pendingLevels = 0;
    this.time = 0;
    this.over = false;
    this.hurtCd = 0;
    this.resetPose();
    this.boomT = 1.5; this.whirlT = 3; this.whirlSpin = 0; this.whirlTick = 0;
    this.shieldUp = false; this.shieldT = 0; this.cloneT = 2;
    this.combos = new Set();
    this.cartRuns = [];
    this.ambushT = 22 + Math.random() * 8;
    this.player.root.position.set(0, 0, 0);
    this.player.root.rotation.y = Math.PI * 0.25;
    this.camTarget.set(0, 0, 0);
    this.applyLooks();
    for (const a of this.arms) { a.state = 'idle'; a.target = null; }
    this.running = true;
    this.paused = false;
    if (this.stats.traits.startSkill) this.queueLevelUp();
    this.hooks.onHud?.();
  }

  clearAll() {
    for (const e of this.enemies) { this.scene.remove(e.f.root); this.enemyPool[e.type].push(e); }
    this.enemies = [];
    for (const d of this.drops) { this.scene.remove(d.mesh); }
    this.drops = [];
    for (const p of this.projectiles) this.scene.remove(p.mesh);
    this.projectiles = [];
    for (const fx of this.effects) this.scene.remove(fx.obj);
    this.effects = [];
    for (const z of this.zones) this.scene.remove(z.mesh);
    for (const cr of this.cartRuns || []) this.scene.remove(cr.mesh);
    this.cartRuns = [];
    for (const bm of this.boomers || []) this.scene.remove(bm.mesh);
    this.boomers = [];
    for (const c of this.clones || []) this.scene.remove(c.f.root);
    this.clones = [];
    if (this.shieldMesh) { this.scene.remove(this.shieldMesh); this.shieldMesh.visible = false; }
    this.zones = [];
    for (const fl of this.floaters) { fl.life = 0; fl.el.style.display = 'none'; }
  }

  xpFor(level) { return Math.round(4 + level * 3.2 + level * level * 0.35); }

  // ---------------- derived combat values ----------------
  sk(id) { return this.skills[id] || 0; }
  get punchDamage() {
    let d = this.stats.atk * (1 + 0.2 * this.sk('dmg'));
    if (this.rageOn) d *= 1 + 0.25 * this.sk('rage');
    if (this.stats.traits.armBoost) d *= 1 + 0.2 * this.sk('arm');
    return d;
  }
  get punchInterval() { return 0.95 / (1 + 0.15 * this.sk('rate')) / (this.rageOn ? 1 + 0.15 * this.sk('rage') : 1); }
  get rageOn() { return this.sk('rage') > 0 && this.hp < this.maxHp * 0.4 && !this.over; }
  get range() { return 3.6 + this.sk('range') * 1.1; }
  get armCount() { return 2 + this.sk('arm'); }
  get critChance() { return 0.05 + 0.08 * this.sk('crit'); }
  get magnetRange() { return 2.4 + this.sk('magnet') * 1.8; }

  // ---------------- update ----------------
  update(rawDt) {
    if (!this.running) return;
    const dt = Math.min(rawDt, 0.05) * (this.paused ? 0 : this.timeScale);
    if (dt > 0 && !this.over) {
      this.time += dt;
      this.updateSpawns(dt);
      this.updatePlayer(dt);
      this.updateArms(dt);
      this.updateEnemies(dt);
      this.updatePets(dt);
      this.updateProjectiles(dt);
      this.updateZones(dt);
      this.updateDrops(dt);
      this.updateSlam(dt);
      this.updatePowers(dt);
    }
    this.updateCarts(dt);
    this.updateEffects(dt);
    this.updateFloaters(Math.min(rawDt, 0.05));
    this.updateCamera(Math.min(rawDt, 0.05));
    this.syncArms();
  }

  enemyStats(type) {
    const def = ENEMY_TYPES[type];
    const s = this.stage;
    const hp = 14 * Math.pow(1.21, s - 1) * def.hp;
    const dmg = 5 * Math.pow(1.16, s - 1) * def.dmg;
    return { hp, dmg };
  }

  updateSpawns(dt) {
    if (this.kills >= this.killsNeeded && !this.bossSpawned) {
      this.bossSpawned = true;
      this.callCart(['boss'], true);
      this.hooks.onAlert?.('BOSS INCOMING!');
    }
    if (this.stage >= 2 && !this.bossSpawned) {
      this.ambushT -= dt;
      if (this.ambushT <= 0) {
        this.ambushT = 30 + Math.random() * 12;
        const n = Math.min(6, 3 + Math.floor(this.stage / 3));
        this.callCart(Array.from({ length: n }, () => this.pickType()), false);
        this.hooks.onAlert?.('AMBUSH!');
      }
    }
    this.spawnT -= dt;
    const maxAlive = Math.min(70, 26 + this.stage * 2);
    if (this.spawnT <= 0 && this.enemies.length < maxAlive) {
      const interval = Math.max(0.28, 1.0 - this.stage * 0.035) * (this.bossSpawned ? 2.2 : 1);
      this.spawnT = interval;
      const group = 1 + Math.floor(Math.random() * Math.min(4, 1 + this.stage / 3));
      for (let i = 0; i < group; i++) this.spawnEnemy(this.pickType());
    }
  }

  pickType() {
    const s = this.stage;
    const r = Math.random();
    if (s >= ENEMY_TYPES.thrower.from && r < 0.1) return 'thrower';
    if (s >= ENEMY_TYPES.brute.from && r < 0.2) return 'brute';
    if (s >= ENEMY_TYPES.runner.from && r < 0.42) return 'runner';
    return 'grunt';
  }

  spawnEnemy(type) {
    const def = ENEMY_TYPES[type];
    let e = this.enemyPool[type].pop();
    if (!e) {
      const f = buildFighter({ color: def.color, uniqueMat: true });
      f.root.scale.setScalar(def.scale);
      if (def.boss) addCrown(f);
      e = { f, type, def };
    }
    const st = this.enemyStats(type);
    const a = Math.random() * Math.PI * 2;
    const d = 11 + Math.random() * 3;
    e.f.root.position.set(Math.cos(a) * d, -0.6, Math.sin(a) * d);
    e.f.root.rotation.set(0, 0, 0);
    e.f.body.rotation.set(0, 0, 0);
    e.f.body.position.set(0, 0, 0);
    e.f.mat.emissive.set('#000000');
    e.f.mat.transparent = false; e.f.mat.opacity = 1;
    e.f.shadow.visible = true;
    e.hp = e.maxHp = st.hp;
    e.dmg = st.dmg;
    e.speed = def.speed * (0.9 + Math.random() * 0.2);
    e.alive = true;
    e.dying = 0;
    e.vel = new THREE.Vector3();
    e.atkCd = 0.6 + Math.random() * 0.5;
    e.burn = 0; e.burnDps = 0; e.burnTick = 0;
    e.flash = 0;
    e.walk = Math.random() * 6;
    e.targetedBy = 0;
    e.knock = new THREE.Vector3();
    e.slamT = 3;
    e.warn = null;
    e.stun = 0; e.stunKind = null; e.slow = 0; e.air = null; e.leap = null;
    if (e.bubble) { this.scene.remove(e.bubble.mesh); e.bubble = null; }
    this.scene.add(e.f.root);
    this.enemies.push(e);
    return e;
  }

  updatePlayer(dt) {
    const p = this.player.root.position;
    let mx = this.input.x, mz = this.input.z;
    const manual = Math.abs(mx) + Math.abs(mz) > 0.05;
    let nearest = null, nd = Infinity;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = e.f.root.position.distanceToSquared(p);
      if (d < nd) { nd = d; nearest = e; }
    }
    this.nearest = nearest;
    let speed = 5.2;
    if (!manual && nearest) {
      // Idle mode: drift toward the closest enemy if it's out of reach.
      const dist = Math.sqrt(nd);
      if (dist > this.range * 0.85) {
        V1.subVectors(nearest.f.root.position, p).setY(0).normalize();
        mx = V1.x; mz = V1.z; speed = 2.6;
      }
    }
    const len = Math.hypot(mx, mz);
    this.moving = len > 0.05;
    if (this.moving) {
      const k = Math.min(1, len);
      p.x += (mx / len) * speed * k * dt;
      p.z += (mz / len) * speed * k * dt;
      p.x = THREE.MathUtils.clamp(p.x, -PLAY_HALF, PLAY_HALF);
      p.z = THREE.MathUtils.clamp(p.z, -PLAY_HALF, PLAY_HALF);
    }
    // Face nearest enemy, otherwise movement direction
    let face = null;
    if (nearest) face = Math.atan2(nearest.f.root.position.x - p.x, nearest.f.root.position.z - p.z);
    else if (this.moving) face = Math.atan2(mx, mz);
    if (face !== null) {
      let diff = face - this.player.root.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.player.root.rotation.y += diff * Math.min(1, dt * 10);
    }
    // Walk cycle
    this.walkT = (this.walkT || 0) + dt * (this.moving ? 12 : 3);
    const amp = this.moving ? 0.7 : 0.05;
    this.player.legs[0].rotation.x = Math.sin(this.walkT) * amp;
    this.player.legs[1].rotation.x = -Math.sin(this.walkT) * amp;
    this.player.body.position.y = this.moving ? Math.abs(Math.sin(this.walkT)) * 0.08 : Math.sin(this.time * 3) * 0.03;
    this.hurtCd -= dt;
    // Red hit flash, driven by game time so it can't get stuck while paused or fast-forwarded.
    if (this.hurtFlash > 0) this.hurtFlash -= dt;
    if (this.hurtFlash > 0) this.player.mat.emissive.set('#ff2020');
    else if (this.rageOn) this.player.mat.emissive.setRGB(0.35 + Math.sin(this.time * 10) * 0.15, 0.04, 0.02);
    else this.player.mat.emissive.setRGB(0, 0, 0);
  }

  pickTarget(arm) {
    const p = this.player.root.position;
    const r2 = this.range * this.range;
    let best = null, bd = Infinity;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = e.f.root.position.distanceToSquared(p);
      if (d > r2) continue;
      const score = d + e.targetedBy * 6;
      if (score < bd) { bd = score; best = e; }
    }
    return best;
  }

  updateArms(dt) {
    const n = this.armCount;
    for (let i = 0; i < this.arms.length; i++) {
      const a = this.arms[i];
      const active = i < n;
      a.tube.visible = a.glove.visible = active;
      if (!active) continue;
      if (a.state === 'idle') {
        if (this.whirlSpin > 0) continue;
        a.cd -= dt;
        if (a.cd <= 0) {
          const t = this.pickTarget(a);
          if (t) {
            a.target = t; t.targetedBy++;
            a.state = 'out'; a.t = 0;
            a.from.copy(a.pos);
            a.aim.copy(t.f.root.position).setY(t.f.root.position.y + 1.2 * t.def.scale);
            const dist = a.from.distanceTo(a.aim);
            a.dur = Math.max(0.07, dist / 34);
            Audio.play('punch', 0.05);
          } else {
            a.cd = 0.1;
          }
        }
      } else if (a.state === 'out') {
        a.t += dt;
        if (a.target && a.target.alive) {
          a.aim.copy(a.target.f.root.position).setY(a.target.f.root.position.y + 1.2 * a.target.def.scale);
        }
        if (a.t >= a.dur) {
          if (a.target) {
            a.target.targetedBy = Math.max(0, a.target.targetedBy - 1);
            if (a.target.alive) this.landPunch(a.target, a.aim);
          }
          a.target = null;
          a.state = 'hold'; a.t = 0;
        }
      } else if (a.state === 'hold') {
        a.t += dt;
        if (a.t >= 0.04) { a.state = 'back'; a.t = 0; a.from.copy(a.aim); }
      } else if (a.state === 'back') {
        a.t += dt;
        if (a.t >= 0.13) {
          a.state = 'idle';
          // Spread arms so they alternate instead of firing in unison.
          a.cd = Math.max(0.02, this.punchInterval - a.dur - 0.17) * (0.85 + Math.random() * 0.3);
        }
      }
    }
  }

  // Positions arm tubes and gloves every frame (runs even while paused for stable visuals).
  syncArms() {
    const body = this.player.body;
    body.updateWorldMatrix(true, false);
    const n = this.armCount || 2;
    const bob = Math.sin((this.time || 0) * 6);
    for (let i = 0; i < this.arms.length; i++) {
      const a = this.arms[i];
      if (i >= n) { a.tube.visible = a.glove.visible = false; continue; }
      const origin = V1.set(...ARM_ORIGINS[i]);
      body.localToWorld(origin);
      const fan = this.whirlSpin > 0 ? 2.8 : 1;
      const rest = V2.set(ARM_REST[i][0] * fan, ARM_REST[i][1] + bob * 0.04 * (i % 2 ? 1 : -1), ARM_REST[i][2] / fan);
      body.localToWorld(rest);
      if (a.state === 'out') {
        const k = Math.min(1, a.t / a.dur);
        a.pos.lerpVectors(a.from, a.aim, 1 - Math.pow(1 - k, 2));
      } else if (a.state === 'hold') {
        a.pos.copy(a.aim);
      } else if (a.state === 'back') {
        const k = Math.min(1, a.t / 0.13);
        a.pos.lerpVectors(a.from, rest, k * k);
      } else {
        a.pos.lerp(rest, 0.5);
      }
      a.glove.position.copy(a.pos);
      V3.subVectors(a.pos, origin);
      const len = V3.length();
      if (len > 0.001) {
        a.tube.position.copy(origin);
        a.tube.quaternion.setFromUnitVectors(UP, V3.normalize());
        a.tube.scale.set(1, len, 1);
        a.glove.lookAt(V2.copy(a.pos).add(V3));
      }
      a.tube.visible = a.glove.visible = true;
    }
  }

  landPunch(target, at) {
    let dmg = this.punchDamage * (0.9 + Math.random() * 0.2);
    const crit = Math.random() < this.critChance;
    if (crit) dmg *= 2.2;
    this.damageEnemy(target, dmg, crit ? 'crit' : 'hit', true);
    this.spawnSparks(at, crit ? 7 : 4, crit ? '#ffe45c' : '#fff3b0');
    if (crit) { Audio.play('crit'); this.shake = Math.max(this.shake, 0.12); } else Audio.play('hit');

    // Knockback away from player
    V1.subVectors(target.f.root.position, this.player.root.position).setY(0).normalize();
    const kb = target.def.boss ? 0.4 : target.type === 'brute' ? 1.5 : 4.5;
    target.knock.addScaledVector(V1, kb);

    if (this.sk('burn')) {
      const burnMul = this.stats.traits.burnBoost ? 1.25 : 1;
      target.burn = 3;
      target.burnDps = this.stats.atk * 0.22 * this.sk('burn') * burnMul;
    }
    if (this.sk('splash')) {
      const r = 1.3 + 0.3 * this.sk('splash');
      for (const e of this.enemies) {
        if (e === target || !e.alive) continue;
        if (e.f.root.position.distanceTo(target.f.root.position) < r) {
          this.damageEnemy(e, dmg * 0.3 * this.sk('splash'), 'hit', false);
        }
      }
    }
    if (this.sk('chain') && Math.random() < 0.35 + this.sk('chain') * 0.08) {
      this.chainLightning(target, dmg * 0.55, this.sk('chain'));
    }
    if (this.sk('leech')) this.heal(dmg * 0.03 * this.sk('leech') * (this.rageOn && this.combos.has('bloodfrenzy') ? 3 : 1), false);
    const ul = this.sk('uppercut');
    if (ul && target.alive && !target.def.boss && !target.air && Math.random() < 0.06 + 0.05 * ul) {
      target.air = { vy: 11, y0: target.f.root.position.y, dmg: this.stats.atk * (0.8 + 0.4 * ul) };
      target.knock.set(0, 0, 0);
      this.floatText(V1.copy(target.f.root.position).setY(2.6), 'UPPERCUT!', 'skill', true);
      Audio.play('crit');
    }
  }

  chainLightning(from, dmg, jumps) {
    let cur = from;
    const hit = new Set([from]);
    const pts = [cur.f.root.position.clone().setY(cur.f.root.position.y + 1.2)];
    for (let j = 0; j < jumps + 1; j++) {
      let best = null, bd = 12;
      for (const e of this.enemies) {
        if (!e.alive || hit.has(e)) continue;
        const d = e.f.root.position.distanceToSquared(cur.f.root.position);
        if (d < bd) { bd = d; best = e; }
      }
      if (!best) break;
      hit.add(best);
      pts.push(best.f.root.position.clone().setY(best.f.root.position.y + 1.2));
      this.damageEnemy(best, dmg, 'zap', false);
      cur = best;
    }
    if (pts.length > 1) {
      const jag = [];
      for (let i = 0; i < pts.length - 1; i++) {
        for (let k = 0; k < 4; k++) {
          const p = pts[i].clone().lerp(pts[i + 1], k / 4);
          if (k) p.add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5));
          jag.push(p);
        }
      }
      jag.push(pts[pts.length - 1]);
      const geo = new THREE.BufferGeometry().setFromPoints(jag);
      const line = new THREE.Line(geo, this.boltMat);
      this.scene.add(line);
      this.effects.push({ obj: line, life: 0.15, max: 0.15, kind: 'bolt' });
      Audio.play('zap');
    }
  }

  damageEnemy(e, dmg, kind, showBig) {
    if (!e.alive) return;
    if (e.def.boss && this.stats.traits.bossDmg) dmg *= 1.3;
    e.hp -= dmg;
    e.flash = 0.1;
    const pos = V1.copy(e.f.root.position);
    pos.y += 2.2 * e.def.scale;
    this.floatText(pos, fmt(Math.max(1, dmg)), kind, showBig);
    if (e.hp <= 0) this.killEnemy(e);
    if (e === this.boss) this.hooks.onHud?.();
  }

  killEnemy(e) {
    e.alive = false;
    if (e.bubble) { this.popBubble(e, false); }
    e.dying = 1.2;
    V1.subVectors(e.f.root.position, this.player.root.position).setY(0).normalize();
    e.vel.set(V1.x * 9, 7 + Math.random() * 3, V1.z * 9);
    e.spin = (Math.random() - 0.5) * 20;
    e.f.shadow.visible = false;
    Audio.play('die', 0.06);
    this.kills++;
    Save.state.stats.kills++;
    const pos = e.f.root.position;
    const xp = e.def.xp;
    for (let i = 0; i < Math.min(xp, 6); i++) this.spawnDrop('xp', pos, Math.ceil(xp / Math.min(xp, 6)));
    if (Math.random() < (e.def.boss ? 1 : 0.12)) {
      const coins = e.def.boss ? 8 : 1;
      for (let i = 0; i < coins; i++) this.spawnDrop('coin', pos, Math.ceil(3 * Math.pow(1.18, this.stage - 1)));
    }
    if (e === this.boss) {
      this.boss = null;
      this.hooks.onBoss?.(false);
      Save.state.stats.bosses++;
      this.victory();
    }
    this.hooks.onHud?.();
  }

  updateEnemies(dt) {
    const p = this.player.root.position;
    const list = this.enemies;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      const r = e.f.root;
      if (!e.alive) {
        e.dying -= dt;
        e.vel.y -= 22 * dt;
        r.position.addScaledVector(e.vel, dt);
        r.rotation.x += e.spin * dt;
        r.rotation.z += e.spin * 0.6 * dt;
        if (e.dying < 0.4) { e.f.mat.transparent = true; e.f.mat.opacity = e.dying / 0.4; }
        if (e.dying <= 0) {
          this.scene.remove(r);
          if (e.warn) { this.scene.remove(e.warn); e.warn = null; }
          list.splice(i, 1);
          this.enemyPool[e.type].push(e);
        }
        continue;
      }
      // Burn
      if (e.burn > 0) {
        e.burn -= dt;
        e.burnTick -= dt;
        if (e.burnTick <= 0) {
          e.burnTick = 0.5;
          this.damageEnemy(e, e.burnDps * 0.5, 'burn', false);
          if (!e.alive) continue;
        }
      }
      // Status effects from pet skills
      const stunned = e.stun > 0;
      if (stunned) e.stun -= dt;
      if (e.slow > 0) e.slow -= dt;
      if (e.bubble) {
        e.bubble.mesh.position.copy(r.position).setY(r.position.y + 1.1 * e.def.scale + 0.4);
        e.bubble.mesh.rotation.y += dt * 2;
        if (e.stun <= 0) { this.popBubble(e, true); if (!e.alive) continue; }
      }
      // Flash tint (hit flash > stun color > burn glow)
      if (e.flash > 0) { e.flash -= dt; e.f.mat.emissive.set('#ffffff').multiplyScalar(Math.max(0, e.flash) * 6); }
      else if (stunned) e.f.mat.emissive.set(STUN_TINT[e.stunKind] || '#444444');
      else if (e.burn > 0) e.f.mat.emissive.setRGB(0.5 + Math.sin(this.time * 20) * 0.2, 0.15, 0);
      else if (e.slow > 0) e.f.mat.emissive.setRGB(0.05, 0.25, 0.05);
      else e.f.mat.emissive.setRGB(0, 0, 0);

      if (e.leap) {
        const L = e.leap;
        L.t += dt;
        const k = THREE.MathUtils.clamp(L.t / L.dur, 0, 1); // riders queue up (negative t) before jumping
        r.position.lerpVectors(L.from, L.to, k);
        r.position.y += Math.sin(k * Math.PI) * L.h;
        r.rotation.y = Math.atan2(L.to.x - L.from.x, L.to.z - L.from.z);
        e.f.legs[0].rotation.x = -0.9; e.f.legs[1].rotation.x = 0.6;
        e.f.arms[0].rotation.x = -2.6; e.f.arms[1].rotation.x = -2.6;
        if (k >= 1) {
          e.leap = null;
          e.f.shadow.visible = true;
          this.landRider(e);
          if (!e.alive) continue;
        }
        continue;
      }

      if (e.air) {
        e.air.vy -= 24 * dt;
        r.position.y += e.air.vy * dt;
        r.rotation.x += dt * 14;
        if (this.combos.has('meteorupper') && e.air.vy < 0 && Math.random() < 0.6) this.puff(r.position.clone().setY(r.position.y + 1), new THREE.Vector3(0, 2, 0), '#ff7a1a', 0.2, 0.35);
        if (e.air.vy < 0 && r.position.y <= e.air.y0) {
          r.position.y = e.air.y0;
          r.rotation.x = 0;
          const land = r.position.clone();
          this.ringBlast(land, 2, '#ffd9a0');
          this.spawnSparks(land, 8, '#ffe066');
          this.shake = Math.max(this.shake, 0.2);
          Audio.play('slam', 0.08);
          const meteor = this.combos.has('meteorupper');
          const rad = meteor ? 3.2 : 2;
          const dmg = e.air.dmg * (meteor ? 1.6 : 1);
          e.air = null;
          if (meteor) { this.ringBlast(land, rad, '#ff8a2a'); for (let k = 0; k < 10; k++) this.puff(land.clone().setY(0.4), new THREE.Vector3((Math.random() - 0.5) * 8, 3, (Math.random() - 0.5) * 8), k % 2 ? '#ff5a1a' : '#ffd23f', 0.25, 0.5); }
          for (const o of this.enemiesNear(land, rad)) {
            this.damageEnemy(o, dmg, 'crit', o === e);
            this.stunEnemy(o, 0.6, 'rock');
            if (meteor) { o.burn = 3; o.burnDps = Math.max(o.burnDps, this.stats.atk * 0.4); }
          }
          if (!e.alive) continue;
        }
        continue;
      }

      V1.subVectors(p, r.position).setY(0);
      const dist = V1.length();
      V1.normalize();
      const reach = 0.9 + e.def.scale * 0.35;
      let move = 0;
      const spd = e.speed * (e.slow > 0 ? 0.45 : 1);
      if (stunned) {
        // frozen / trapped: no movement, no attacks
      } else if (e.def.ranged) {
        if (dist > 6.5) move = spd;
        else if (dist < 4.5) move = -spd * 0.5;
        e.atkCd -= dt;
        if (e.atkCd <= 0 && dist < 8) { e.atkCd = 2.4; this.throwRock(e); }
      } else if (dist > reach) {
        move = spd;
      } else {
        e.atkCd -= dt;
        if (e.atkCd <= 0) {
          e.atkCd = e.def.boss ? 1.3 : 1.0;
          e.swing = 0.25;
          this.hurtPlayer(e.dmg, e);
        }
      }
      if (e.def.boss && !stunned) this.bossSlam(e, dt, dist);

      r.position.addScaledVector(V1, move * dt);
      // Knockback decay
      r.position.addScaledVector(e.knock, dt);
      e.knock.multiplyScalar(Math.max(0, 1 - dt * 6));
      // Separation
      for (let j = 0; j < list.length; j++) {
        const o = list[j];
        if (o === e || !o.alive) continue;
        const dx = r.position.x - o.f.root.position.x;
        const dz = r.position.z - o.f.root.position.z;
        const d2 = dx * dx + dz * dz;
        const min = 0.55 * (e.def.scale + o.def.scale);
        if (d2 < min * min && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const push = (min - d) * 0.5;
          r.position.x += (dx / d) * push;
          r.position.z += (dz / d) * push;
        }
      }
      // Step up onto ring
      const inside = Math.max(Math.abs(r.position.x), Math.abs(r.position.z)) < RING_HALF + 0.3;
      r.position.y += ((inside ? 0 : -0.6) - r.position.y) * Math.min(1, dt * 10);
      r.rotation.y = Math.atan2(V1.x, V1.z);

      // Animation
      e.walk += dt * e.speed * 4;
      const amp = move !== 0 ? 0.7 : 0.1;
      e.f.legs[0].rotation.x = Math.sin(e.walk) * amp;
      e.f.legs[1].rotation.x = -Math.sin(e.walk) * amp;
      e.f.arms[0].rotation.x = -0.6 - Math.sin(e.walk) * amp * 0.6;
      e.f.arms[1].rotation.x = -0.6 + Math.sin(e.walk) * amp * 0.6;
      if (e.swing > 0) {
        e.swing -= dt;
        e.f.arms[0].rotation.x = -2.2;
        e.f.arms[1].rotation.x = -2.2;
      }
      e.f.body.position.y = Math.abs(Math.sin(e.walk)) * 0.06;
    }
  }

  bossSlam(e, dt, dist) {
    e.slamT -= dt;
    if (e.slamT <= 0 && !e.warn) {
      const warn = new THREE.Mesh(new THREE.CircleGeometry(3.4, 32), this.warnMat);
      warn.rotation.x = -Math.PI / 2;
      warn.position.copy(e.f.root.position).setY(e.f.root.position.y + 0.05);
      this.scene.add(warn);
      e.warn = warn; e.warnT = 1.1;
    }
    if (e.warn) {
      e.warnT -= dt;
      e.warn.position.x = e.f.root.position.x; e.warn.position.z = e.f.root.position.z;
      e.warn.scale.setScalar(1 - e.warnT / 1.1 * 0.6);
      e.f.body.position.y = 0.4 * Math.sin((1 - e.warnT / 1.1) * Math.PI);
      if (e.warnT <= 0) {
        this.scene.remove(e.warn); e.warn = null;
        e.slamT = 4.5;
        this.ringBlast(e.f.root.position, 3.4, '#ff6a4a');
        Audio.play('slam');
        this.shake = 0.5;
        if (e.f.root.position.distanceTo(this.player.root.position) < 3.4) this.hurtPlayer(e.dmg * 2.5, e);
      }
    }
  }

  throwRock(e) {
    const mesh = new THREE.Mesh(GEO.rock, this.rockMat);
    const from = e.f.root.position.clone().setY(e.f.root.position.y + 1.8);
    const to = this.player.root.position.clone().setY(0.8);
    mesh.position.copy(from);
    this.scene.add(mesh);
    this.projectiles.push({ mesh, from, to, t: 0, dur: 0.9, dmg: e.dmg, src: e, kind: 'rock' });
    Audio.play('throw', 0.12);
    e.swing = 0.3;
  }

  hurtPlayer(dmg, src) {
    if (this.shieldUp) {
      this.shieldUp = false;
      this.shieldMesh.visible = false;
      this.shieldT = Math.max(3, 11 - 1.6 * this.sk('shield'));
      this.spawnSparks(V1.copy(this.player.root.position).setY(1.2), 10, '#bff4ff');
      this.floatText(V1.copy(this.player.root.position).setY(2.8), 'BLOCKED!', 'skill', true);
      Audio.play('pop');
      if (this.combos.has('novashield')) {
        const p = this.player.root.position;
        this.ringBlast(p, 4.5, '#7fe3ff');
        this.shake = Math.max(this.shake, 0.3);
        Audio.play('slam');
        for (const e of this.enemiesNear(p, 4.5)) {
          this.damageEnemy(e, this.stats.atk * 1.6, 'zap', true);
          V1.subVectors(e.f.root.position, p).setY(0).normalize();
          e.knock.addScaledVector(V1, e.def.boss ? 1 : 10);
        }
      }
      return;
    }
    const taken = dmg * 100 / (100 + this.stats.def);
    this.hp -= taken;
    if (this.stats.traits.reflect && src && src.alive) this.damageEnemy(src, taken * 0.15, 'hit', false);
    if (this.hurtCd <= 0) { Audio.play('hurt', 0.15); this.hurtCd = 0.25; }
    this.hurtFlash = 0.09;
    if (this.hp <= 0) {
      this.hp = 0;
      this.defeat();
    }
    this.hooks.onHud?.();
  }

  heal(amount, show = true) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (show) this.floatText(V1.copy(this.player.root.position).setY(2.6), '+' + fmt(amount), 'heal', true);
    this.hooks.onHud?.();
  }

  updateSlam(dt) {
    const lvl = this.sk('slam');
    if (!lvl) return;
    this.slamT -= dt;
    if (this.slamT > 0) return;
    this.slamT = 6 - lvl * 0.7;
    const r = 3 + lvl * 0.5;
    const p = this.player.root.position;
    this.ringBlast(p, r, '#ffd9a0');
    Audio.play('slam');
    this.shake = Math.max(this.shake, 0.25);
    const dmg = this.stats.atk * (1 + lvl * 0.6);
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = e.f.root.position.distanceTo(p);
      if (d < r) {
        V1.subVectors(e.f.root.position, p).setY(0).normalize();
        e.knock.addScaledVector(V1, e.def.boss ? 1 : 9);
        this.damageEnemy(e, dmg, 'hit', false);
      }
    }
  }

  updatePets(dt) {
    const p = this.player.root.position;
    const rot = this.player.root.rotation.y;
    this.pets.forEach((pet, i) => {
      const ang = rot + Math.PI + (i - 1) * 0.9;
      const tx = p.x + Math.sin(ang) * 1.6, tz = p.z + Math.cos(ang) * 1.6;
      pet.root.position.x += (tx - pet.root.position.x) * Math.min(1, dt * 4);
      pet.root.position.z += (tz - pet.root.position.z) * Math.min(1, dt * 4);
      // Slime hop: arc through the air, squash on landing, stretch on take-off.
      pet.bob += dt * 7;
      const hop = Math.sin(pet.bob);
      const body = pet.root.userData.body;
      body.position.y = Math.max(0, hop) * 0.45;
      const squash = hop < 0 ? -hop * 0.28 : 0;
      body.scale.set(1 + squash * 0.6, 1 - squash + Math.max(0, hop) * 0.08, 1 + squash * 0.6);
      pet.root.userData.tick?.(this.time);
      pet.root.userData.cloth?.step(dt);
      pet.cd -= dt;
      const target = this.nearest;
      if (target) pet.root.rotation.y = Math.atan2(target.f.root.position.x - pet.root.position.x, target.f.root.position.z - pet.root.position.z);
      this.updatePetSkill(pet, dt, target);
      if (pet.cd <= 0 && target && target.alive && target.f.root.position.distanceTo(pet.root.position) < 9) {
        pet.cd = 1.4;
        const mesh = new THREE.Mesh(GEO.eye, new THREE.MeshBasicMaterial({ color: pet.def.color }));
        mesh.scale.setScalar(2.6);
        const from = pet.root.position.clone().setY(0.9);
        mesh.position.copy(from);
        this.scene.add(mesh);
        const owned = Save.state.pets[pet.def.id];
        const dmg = this.stats.atk * (0.3 + 0.12 * pet.def.rarity) * (1 + 0.1 * ((owned?.lvl || 1) - 1));
        this.projectiles.push({ mesh, from, to: null, target, t: 0, dur: 0.35, dmg, kind: 'pet' });
        Audio.play('pew', 0.12);
      }
    });
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.t += dt;
      const k = Math.min(1, pr.t / pr.dur);
      if (pr.onHit) {
        // Skill projectiles: optionally home on a living target, optional lob arc.
        if (pr.target && pr.target.alive) pr.to.copy(pr.target.f.root.position).setY(pr.target.f.root.position.y + 1);
        pr.mesh.position.lerpVectors(pr.from, pr.to, k);
        pr.mesh.position.y += Math.sin(k * Math.PI) * (pr.arc || 0);
        pr.mesh.rotation.x += dt * 8; pr.mesh.rotation.y += dt * 6;
      } else if (pr.kind === 'pet') {
        const to = pr.target.f.root.position;
        pr.mesh.position.lerpVectors(pr.from, V1.copy(to).setY(to.y + 1.2), k);
      } else {
        pr.mesh.position.lerpVectors(pr.from, pr.to, k);
        pr.mesh.position.y += Math.sin(k * Math.PI) * 2;
        pr.mesh.rotation.x += dt * 10;
      }
      if (k >= 1) {
        if (pr.onHit) {
          pr.onHit(pr.mesh.position.clone());
        } else if (pr.kind === 'pet') {
          if (pr.target.alive) { this.damageEnemy(pr.target, pr.dmg, 'pet', false); this.spawnSparks(pr.mesh.position, 3, '#ffffff'); }
        } else if (pr.mesh.position.distanceTo(V1.copy(this.player.root.position).setY(0.8)) < 1.3) {
          this.hurtPlayer(pr.dmg, pr.src);
        }
        this.scene.remove(pr.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  // ---------------- pet skills ----------------
  updatePetSkill(pet, dt, target) {
    const skill = PET_SKILLS[pet.def.element];
    if (!skill) return;
    if (pet.channel) {
      pet.channel.t += dt;
      pet.channel.update?.(dt, pet.channel.t);
      if (pet.channel.t >= pet.channel.dur) { pet.channel.end?.(); pet.channel = null; }
      return;
    }
    pet.skillCd -= dt;
    if (pet.skillCd > 0) return;
    const inRange = skill.selfCast || (target && target.alive && target.f.root.position.distanceTo(pet.root.position) < skill.range);
    if (!inRange) return;
    pet.skillCd = skill.cd;
    const lvl = Save.state.pets[pet.def.id]?.lvl || 1;
    const ch = skill.cast(this, pet, target, petPower(this.stats.atk, pet.def, lvl));
    if (ch) pet.channel = { t: 0, ...ch };
    // Cast feedback: big hop + skill name over the slime.
    pet.bob = Math.PI / 2;
    this.floatText(V1.copy(pet.root.position).setY(1.6), pet.def.skill.name + '!', 'skill', true);
  }

  enemiesNear(pos, radius) {
    const r2 = radius * radius;
    return this.enemies.filter(e => e.alive && e.f.root.position.distanceToSquared(pos) < r2);
  }

  stunEnemy(e, time, kind) {
    const t = e.def.boss ? time * 0.3 : time;
    if (t > e.stun) { e.stun = t; e.stunKind = kind; }
  }

  slowEnemy(e, time) { e.slow = Math.max(e.slow, time); }

  // Timed ground area (poison cloud, lava pool, black hole). onTick runs every `interval` for each enemy inside.
  addZone({ pos, radius, life, interval, mesh, onTick, onFrame, onEnd }) {
    if (mesh) { mesh.position.copy(pos); this.scene.add(mesh); }
    this.zones.push({ pos: pos.clone(), radius, life, max: life, interval, tickT: 0, mesh, onTick, onFrame, onEnd });
  }

  updateZones(dt) {
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i];
      z.life -= dt;
      z.tickT -= dt;
      z.onFrame?.(z, 1 - z.life / z.max, dt);
      if (z.tickT <= 0 && z.onTick) {
        z.tickT = z.interval;
        for (const e of this.enemiesNear(z.pos, z.radius)) z.onTick(e, z);
      }
      if (z.life <= 0) {
        z.onEnd?.(z);
        if (z.mesh) this.scene.remove(z.mesh);
        this.zones.splice(i, 1);
      }
    }
  }

  // Skill projectile: flies (or lobs) from `from` to a target/point and calls onHit(position).
  launch({ mesh, from, to, target = null, dur, arc = 0, onHit }) {
    mesh.position.copy(from);
    this.scene.add(mesh);
    this.projectiles.push({ mesh, from: from.clone(), to: to.clone(), target, t: 0, dur, arc, onHit, kind: 'skill' });
  }

  trapInBubble(e, time, dmg) {
    if (!e.alive) return;
    if (e.bubble) this.scene.remove(e.bubble.mesh);
    const mesh = new THREE.Mesh(BUBBLE_GEO, this.bubbleMat);
    mesh.scale.setScalar(1.25 * e.def.scale);
    this.scene.add(mesh);
    e.bubble = { mesh, dmg };
    this.stunEnemy(e, time, 'bubble');
    e.knock.set(0, 0, 0);
  }

  popBubble(e, dealDamage) {
    const b = e.bubble;
    e.bubble = null;
    this.scene.remove(b.mesh);
    this.spawnSparks(b.mesh.position, 8, '#ffc6ee');
    Audio.play('pop', 0.05);
    if (dealDamage) {
      for (const o of this.enemiesNear(e.f.root.position, 1.8)) this.damageEnemy(o, o === e ? b.dmg : b.dmg * 0.4, 'pet', o === e);
    }
  }

  // Short-lived particle that drifts along `vel`, grows and fades (fire, water, gas puffs).
  puff(pos, vel, color, size = 0.25, life = 0.5) {
    const m = new THREE.Mesh(PUFF_GEO, puffMat(color));
    m.position.copy(pos);
    m.scale.setScalar(size);
    this.scene.add(m);
    this.effects.push({ obj: m, life, max: life, vel, kind: 'puff', size });
  }

  spawnDrop(kind, pos, value) {
    let d = this.dropPool.pop();
    if (!d) d = { mesh: new THREE.Mesh(GEO.gem, this.gemMat) };
    d.kind = kind;
    d.mesh.geometry = kind === 'coin' ? GEO.coin : GEO.gem;
    d.mesh.material = kind === 'coin' ? this.coinMat : this.gemMat;
    d.mesh.rotation.set(kind === 'coin' ? Math.PI / 2 : 0, 0, 0);
    d.value = value;
    d.pos = d.mesh.position;
    d.pos.copy(pos).setY(Math.max(0, pos.y) + 0.5);
    const a = Math.random() * Math.PI * 2;
    d.vel = new THREE.Vector3(Math.cos(a) * 2.5, 5, Math.sin(a) * 2.5);
    d.collecting = false;
    d.life = 0;
    this.scene.add(d.mesh);
    this.drops.push(d);
  }

  updateDrops(dt) {
    const p = this.player.root.position;
    const mr = this.magnetRange;
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.life += dt;
      if (!d.collecting) {
        d.vel.y -= 18 * dt;
        d.pos.addScaledVector(d.vel, dt);
        const floor = Math.max(Math.abs(d.pos.x), Math.abs(d.pos.z)) < RING_HALF ? 0.3 : -0.3;
        if (d.pos.y < floor) { d.pos.y = floor; d.vel.set(0, 0, 0); }
        d.mesh.rotation.y += dt * 3;
        if (d.life > 0.4 && d.pos.distanceTo(p) < mr) d.collecting = true;
        // Everything flies in after a while so idle play never misses XP.
        if (d.life > 4) d.collecting = true;
      } else {
        V1.copy(p).setY(1);
        V2.subVectors(V1, d.pos);
        const dist = V2.length();
        d.pos.addScaledVector(V2.normalize(), Math.min(dist, dt * (14 + d.life * 4)));
        if (dist < 0.5) {
          this.collect(d);
          this.scene.remove(d.mesh);
          this.drops.splice(i, 1);
          this.dropPool.push(d);
        }
      }
    }
  }

  collect(d) {
    if (d.kind === 'coin') {
      const v = Math.round(d.value * this.stats.goldMult);
      this.runCoins += v;
      Audio.play('coin', 0.05);
    } else {
      Audio.play('gem', 0.04);
      this.xp += d.value * this.stats.xpMult;
      while (this.xp >= this.xpNext) {
        this.xp -= this.xpNext;
        this.level++;
        this.xpNext = this.xpFor(this.level);
        Save.state.stats.levels++;
        this.queueLevelUp();
      }
    }
    this.hooks.onHud?.();
  }

  queueLevelUp() {
    this.pendingLevels++;
    if (this.pendingLevels === 1) this.offerLevelUp();
  }

  offerLevelUp() {
    const avail = SKILLS.filter(s => this.sk(s.id) < s.max);
    const picks = [];
    const pool = avail.slice();
    while (picks.length < 3 && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(i, 1)[0]);
    }
    if (!picks.length) picks.push({ id: 'heal', name: 'Second Wind', desc: 'Heal 50% HP', icon: 'heart', color: '#4fd16b', max: 99 });
    this.paused = true;
    Audio.play('level');
    this.hooks.onLevelUp?.(picks.map(s => ({ ...s, cur: this.sk(s.id), combo: this.comboFor(s.id)?.name })));
  }

  chooseSkill(id) {
    if (id === 'heal') this.heal(this.maxHp * 0.5);
    else {
      this.skills[id] = this.sk(id) + 1;
      if (id === 'hp') {
        const old = this.maxHp;
        this.maxHp = Math.round(this.stats.hp * (1 + 0.2 * this.skills.hp));
        this.hp += this.maxHp - old;
        this.heal(this.maxHp * 0.3);
      }
      if (id === 'arm') {
        const a = this.arms[this.armCount - 1];
        a.state = 'idle'; a.cd = 0.1;
        body_localToWorld(this.player.body, a.pos, ARM_REST[this.armCount - 1]);
      }
    }
    if (this.stats.traits.lvlHeal) this.heal(this.maxHp * 0.03, false);
    this.checkCombos();
    this.pendingLevels--;
    if (this.pendingLevels > 0) this.offerLevelUp();
    else this.paused = false;
    this.hooks.onHud?.();
  }

  victory() {
    if (this.over) return;
    this.over = true;
    Audio.play('win');
    // Let the boss fly before showing results.
    setTimeout(() => this.hooks.onEnd?.(true), 1100);
  }

  defeat() {
    if (this.over) return;
    this.over = true;
    Audio.play('lose');
    this.player.body.rotation.x = -Math.PI / 2.2;
    this.player.body.position.y = 0.3;
    setTimeout(() => this.hooks.onEnd?.(false), 900);
  }

  // Stand the hero back up (after a knockout) and clear any lingering tint.
  resetPose() {
    this.player.body.rotation.set(0, 0, 0);
    this.player.body.position.y = 0;
    this.hurtFlash = 0;
    this.player.mat.emissive.setRGB(0, 0, 0);
  }

  revive() {
    this.over = false;
    Audio.play('heal');
    this.hp = this.maxHp;
    this.resetPose();
    // Clear space around the player.
    const p = this.player.root.position;
    this.ringBlast(p, 6, '#9ff');
    for (const e of this.enemies) {
      if (!e.alive) continue;
      V1.subVectors(e.f.root.position, p).setY(0);
      if (V1.length() < 6) { V1.normalize(); e.knock.addScaledVector(V1, 14); if (!e.def.boss) this.damageEnemy(e, e.maxHp * 0.5, 'hit', false); }
    }
    this.hooks.onHud?.();
  }

  // ---------------- level-up powers ----------------
  updatePowers(dt) {
    const p = this.player.root.position;

    // Boomerang Glove: arcs out and back, hitting everything on each leg.
    const bl = this.sk('boomerang');
    if (bl) {
      this.boomT -= dt;
      if (this.boomT <= 0 && this.nearest) {
        this.boomT = Math.max(1.6, 4.2 - bl * 0.5);
        const dir = new THREE.Vector3().subVectors(this.nearest.f.root.position, p).setY(0).normalize();
        const mesh = buildGlove('#' + this.arms[0].glove.userData.ball.material.color.getHexString());
        mesh.scale.setScalar(1.4);
        this.scene.add(mesh);
        this.boomers.push({ mesh, dir, t: 0, dur: 1.3, hit: new Set(), back: false, dist: 6.5 + bl, dmg: this.stats.atk * (0.9 + 0.35 * bl) });
        Audio.play('throw', 0.1);
      }
    }
    for (let i = this.boomers.length - 1; i >= 0; i--) {
      const bm = this.boomers[i];
      bm.t += dt;
      const k = Math.min(1, bm.t / bm.dur);
      const side = V2.set(-bm.dir.z, 0, bm.dir.x).multiplyScalar(Math.sin(k * Math.PI * 2) * 1.3);
      bm.mesh.position.copy(p).addScaledVector(bm.dir, Math.sin(k * Math.PI) * bm.dist).add(side).setY(1.2);
      bm.mesh.rotation.y += dt * 26;
      if (k > 0.5 && !bm.back) { bm.back = true; bm.hit.clear(); }
      for (const e of this.enemies) {
        if (!e.alive || bm.hit.has(e)) continue;
        const dx = e.f.root.position.x - bm.mesh.position.x, dz = e.f.root.position.z - bm.mesh.position.z;
        if (dx * dx + dz * dz < (1.1 * e.def.scale) ** 2) {
          bm.hit.add(e);
          this.damageEnemy(e, bm.dmg, 'hit', false);
          e.knock.addScaledVector(bm.dir, bm.back ? -4 : 4);
          this.spawnSparks(bm.mesh.position, 3, '#fff3b0');
          if (this.combos.has('thunderang') && e.alive) this.chainLightning(e, bm.dmg * 0.6, 2);
          Audio.play('hit', 0.04);
        }
      }
      if (k >= 1) { this.scene.remove(bm.mesh); this.boomers.splice(i, 1); }
    }

    // Whirlwind: spin with arms fanned out, hitting everything in reach.
    const wl = this.sk('whirl');
    if (wl) {
      if (this.whirlSpin > 0) {
        this.whirlSpin -= dt;
        this.player.body.rotation.y += dt * 24;
        this.whirlTick -= dt;
        if (this.whirlTick <= 0) {
          this.whirlTick = 0.15;
          const fireT = this.combos.has('firetornado');
          if (fireT) for (let k = 0; k < 8; k++) {
            const a = Math.random() * Math.PI * 2, d = this.range * (0.4 + Math.random() * 0.5);
            this.puff(new THREE.Vector3(p.x + Math.cos(a) * d, 0.5, p.z + Math.sin(a) * d), new THREE.Vector3(-Math.sin(a) * 6, 2.5, Math.cos(a) * 6), k % 2 ? '#ff7a1a' : '#ffd23f', 0.22, 0.45);
          }
          for (const e of this.enemiesNear(p, this.range * 0.9)) {
            if (fireT) { e.burn = 3; e.burnDps = Math.max(e.burnDps, this.stats.atk * 0.45); }
            this.damageEnemy(e, this.stats.atk * (0.35 + 0.2 * wl), 'hit', false);
            V1.subVectors(e.f.root.position, p).setY(0).normalize();
            e.knock.addScaledVector(V1, e.def.boss ? 0.5 : 3);
          }
          Audio.play('punch', 0.1);
        }
        if (this.whirlSpin <= 0) this.player.body.rotation.y = 0;
      } else {
        this.whirlT -= dt;
        if (this.whirlT <= 0 && this.nearest && this.nearest.f.root.position.distanceTo(p) < this.range) {
          this.whirlT = Math.max(3, 8 - wl);
          this.whirlSpin = 0.9 + 0.1 * wl;
          this.whirlTick = 0;
          this.ringBlast(p, this.range * 0.9, '#b6f0ff');
          Audio.play('whoosh');
        }
      }
    }

    // Bubble Shield: recharges, absorbs the next hit (see hurtPlayer).
    const sl = this.sk('shield');
    if (sl && !this.shieldUp) {
      this.shieldT -= dt;
      if (this.shieldT <= 0) {
        this.shieldUp = true;
        if (!this.shieldMesh.parent) this.scene.add(this.shieldMesh);
        this.shieldMesh.visible = true;
        Audio.play('pop');
      }
    }
    if (this.shieldMesh.visible) {
      this.shieldMesh.position.copy(p).setY(1.1);
      this.shieldMesh.scale.setScalar(1 + Math.sin(this.time * 4) * 0.04);
    }

    // Shadow Double: a temporary clone that brawls on its own.
    const cl = this.sk('clone');
    if (cl) {
      this.cloneT -= dt;
      if (this.cloneT <= 0) {
        this.cloneT = Math.max(5, 12 - cl * 1.5);
        const f = buildFighter({ color: '#2b1a55', uniqueMat: true });
        f.mat.transparent = true; f.mat.opacity = 0.8;
        f.mat.emissive.set('#5a2ab8');
        f.root.position.copy(p).add(new THREE.Vector3(1.2, 0, 1.2));
        this.scene.add(f.root);
        this.clones.push({ f, life: 4 + cl, max: 4 + cl, cd: 0.3, walk: 0 });
        for (let i = 0; i < 10; i++) this.puff(f.root.position.clone().setY(1), new THREE.Vector3((Math.random() - 0.5) * 3, 2, (Math.random() - 0.5) * 3), '#8a5cff', 0.15, 0.5);
        Audio.play('whoosh', 0.2);
      }
    }
    for (let i = this.clones.length - 1; i >= 0; i--) {
      const c = this.clones[i];
      c.life -= dt;
      const r = c.f.root;
      let target = null, bd = Infinity;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const d = e.f.root.position.distanceToSquared(r.position);
        if (d < bd) { bd = d; target = e; }
      }
      let moving = false;
      if (target) {
        V1.subVectors(target.f.root.position, r.position).setY(0);
        const d = V1.length();
        r.rotation.y = Math.atan2(V1.x, V1.z);
        if (d > 1.3) { r.position.addScaledVector(V1.normalize(), Math.min(d, 6 * dt)); moving = true; }
        c.cd -= dt;
        if (d <= 1.4 && c.cd <= 0) {
          c.cd = 0.45;
          c.swing = 0.18;
          this.damageEnemy(target, this.stats.atk * (0.4 + 0.15 * cl), 'pet', false);
          if (this.combos.has('vampclone')) this.heal(this.maxHp * 0.012, false);
          target.knock.addScaledVector(V1.normalize(), 3);
          this.spawnSparks(target.f.root.position.clone().setY(1.2), 3, '#b98cff');
          Audio.play('punch', 0.08);
        }
      }
      r.position.x = THREE.MathUtils.clamp(r.position.x, -PLAY_HALF, PLAY_HALF);
      r.position.z = THREE.MathUtils.clamp(r.position.z, -PLAY_HALF, PLAY_HALF);
      c.walk += dt * (moving ? 14 : 3);
      c.f.legs[0].rotation.x = Math.sin(c.walk) * (moving ? 0.7 : 0.05);
      c.f.legs[1].rotation.x = -Math.sin(c.walk) * (moving ? 0.7 : 0.05);
      const swing = (c.swing = Math.max(0, (c.swing || 0) - dt)) > 0;
      c.f.arms[0].rotation.x = swing ? -2.3 : -0.6;
      c.f.arms[1].rotation.x = swing ? -1.2 : -0.6;
      c.f.mat.opacity = 0.8 * Math.min(1, c.life / 0.5);
      if (c.life <= 0) {
        for (let k = 0; k < 8; k++) this.puff(r.position.clone().setY(1), new THREE.Vector3((Math.random() - 0.5) * 3, 2, (Math.random() - 0.5) * 3), '#8a5cff', 0.14, 0.5);
        this.scene.remove(r);
        this.clones.splice(i, 1);
      }
    }
  }

  // Carts follow the square rail loop; yaw eases round the corners.
  placeOnRail(c, dt, speed) {
    const R = RAIL_R, side = R * 2, loop = side * 4;
    c.s = ((c.s % loop) + loop) % loop;
    const seg = Math.floor(c.s / side), t = c.s - seg * side - R;
    const pos = [[t, -R], [R, t], [-t, R], [-R, -t]][seg];
    const dir = [[1, 0], [0, 1], [-1, 0], [0, -1]][seg];
    c.mesh.position.set(pos[0], -0.46, pos[1]);
    const want = Math.atan2(-dir[1], dir[0]);
    let diff = want - c.yaw;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    c.yaw += diff * Math.min(1, dt * 6);
    c.mesh.rotation.y = c.yaw;
    c.mesh.rotation.z = Math.sin(c.s * 3.1) * 0.015; // rattling on the sleepers
    for (const w of c.mesh.userData.wheels) w.rotation.z -= speed * dt / 0.16;
  }

  updateCarts(dt) {
    for (const c of this.carts) {
      c.s += c.speed * dt;
      this.placeOnRail(c, dt, c.speed);
    }
    this.updateCartRuns(dt);
  }

  // Rail distance of the point on the loop closest to (x, z).
  nearestRailS(x, z) {
    const R = RAIL_R, side = R * 2;
    const clamp = (v) => THREE.MathUtils.clamp(v, -R + 2.5, R - 2.5);
    const opts = [
      { s: clamp(x) + R, d: Math.abs(z + R) },
      { s: side + clamp(z) + R, d: Math.abs(x - R) },
      { s: side * 2 + (R - clamp(x)), d: Math.abs(z - R) },
      { s: side * 3 + (R - clamp(z)), d: Math.abs(x + R) },
    ];
    return opts.sort((a, b) => a.d - b.d)[0].s;
  }

  // A cart races along the track, brakes beside the hero and its riders leap into the ring.
  callCart(riders, boss) {
    const mesh = buildMinecart(boss ? 'boss' : 'normal');
    if (boss) mesh.scale.setScalar(1.7);
    this.scene.add(mesh);
    const p = this.player.root.position;
    const stopS = this.nearestRailS(p.x, p.z);
    const run = { mesh, s: stopS - 22, stopS, yaw: 0, phase: 'arrive', riders, boss, wait: 0, left: 0, speed: 14 };
    this.placeOnRail(run, 1, 0);
    run.yaw = mesh.rotation.y;
    this.cartRuns.push(run);
    Audio.play('rumble', 0.5);
    Audio.play('horn', 0.5);
  }

  updateCartRuns(dt) {
    for (let i = this.cartRuns.length - 1; i >= 0; i--) {
      const c = this.cartRuns[i];
      if (c.mesh.userData.lamp) c.mesh.userData.lamp.visible = Math.sin(this.time * 18) > 0;
      if (c.phase === 'arrive') {
        const remain = c.stopS - c.s;
        c.speed = Math.min(14, 1.5 + remain * 1.4);
        c.s += Math.min(remain, c.speed * dt);
        if (remain < 0.05) { c.phase = 'unload'; c.speed = 0; this.unloadCart(c); }
      } else if (c.phase === 'unload') {
        c.wait += dt;
        if (c.wait > 1.3) c.phase = 'leave';
      } else {
        c.speed = Math.min(12, c.speed + dt * 10);
        c.s += c.speed * dt;
        c.left += c.speed * dt;
        if (c.left > 30) { this.scene.remove(c.mesh); this.cartRuns.splice(i, 1); continue; }
      }
      this.placeOnRail(c, dt, c.speed);
      c.mesh.position.y += c.phase === 'unload' ? Math.abs(Math.sin(c.wait * 30)) * 0.03 : 0;
    }
  }

  unloadCart(c) {
    const from = c.mesh.position.clone().setY(c.boss ? 0.6 : 0.3);
    // Land a few metres inside the ropes, on the line toward the ring centre.
    const inward = new THREE.Vector3(-from.x, 0, -from.z).normalize();
    c.riders.forEach((type, k) => {
      const e = this.spawnEnemy(type);
      const spread = new THREE.Vector3(-inward.z, 0, inward.x).multiplyScalar((k - (c.riders.length - 1) / 2) * 1.3);
      const to = from.clone().setY(0).addScaledVector(inward, c.boss ? 6 : 4.5 + Math.random() * 1.5).add(spread);
      to.x = THREE.MathUtils.clamp(to.x, -PLAY_HALF, PLAY_HALF);
      to.z = THREE.MathUtils.clamp(to.z, -PLAY_HALF, PLAY_HALF);
      e.f.root.position.copy(from);
      e.f.shadow.visible = false;
      e.leap = { from: from.clone(), to, t: -k * 0.12, dur: c.boss ? 1.1 : 0.7, h: c.boss ? 5 : 3 };
      if (type === 'boss') this.boss = e;
    });
    Audio.play(c.boss ? 'boss' : 'throw');
  }

  // A rider touches down inside the ring.
  landRider(e) {
    const pos = e.f.root.position;
    if (e.def.boss) {
      this.ringBlast(pos, 4, '#ff6a4a');
      this.spawnSparks(pos.clone().setY(0.5), 14, '#ffb347');
      this.shake = 0.6;
      Audio.play('slam');
      this.hooks.onBoss?.(true);
      this.hooks.onHud?.();
      for (const o of this.enemiesNear(pos, 4)) {
        if (o === e) continue;
        V1.subVectors(o.f.root.position, pos).setY(0).normalize();
        o.knock.addScaledVector(V1, 9);
      }
      if (this.player.root.position.distanceTo(pos) < 3.5) this.hurtPlayer(e.dmg * 1.5, e);
    } else {
      this.ringBlast(pos, 1.2, '#d9b98a');
      Audio.play('hit', 0.05);
    }
  }

  // Combo whose last missing skill is `id` (used to tag level-up cards).
  comboFor(id) {
    return COMBOS.find(c => !this.combos.has(c.id) && c.needs.includes(id)
      && this.sk(id) === 0 && c.needs.every(n => n === id || this.sk(n) > 0));
  }

  checkCombos() {
    for (const c of COMBOS) {
      if (this.combos.has(c.id) || !c.needs.every(n => this.sk(n) > 0)) continue;
      this.combos.add(c.id);
      this.ringBlast(this.player.root.position, 3.5, '#ffd23f');
      this.floatText(V1.copy(this.player.root.position).setY(3), 'COMBO!', 'crit', true);
      Audio.play('combo');
      this.hooks.onCombo?.(c);
    }
  }

  // ---------------- effects ----------------
  spawnSparks(pos, n, color) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(GEO.spark, color === '#fff3b0' ? this.sparkMat : new THREE.MeshBasicMaterial({ color }));
      m.position.copy(pos);
      const v = new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 6, (Math.random() - 0.5) * 8);
      this.scene.add(m);
      this.effects.push({ obj: m, life: 0.35, max: 0.35, vel: v, kind: 'spark' });
    }
  }

  ringBlast(pos, radius, color) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), this.ringFxMat.clone());
    m.material.color.set(color);
    m.rotation.x = -Math.PI / 2;
    m.position.copy(pos).setY(Math.max(0.05, pos.y + 0.05));
    this.scene.add(m);
    this.effects.push({ obj: m, life: 0.45, max: 0.45, kind: 'ring', radius });
  }

  updateEffects(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const fx = this.effects[i];
      fx.life -= dt;
      const k = 1 - fx.life / fx.max;
      if (fx.kind === 'spark') {
        fx.vel.y -= 20 * dt;
        fx.obj.position.addScaledVector(fx.vel, dt);
        fx.obj.scale.setScalar(Math.max(0.01, 1 - k));
        fx.obj.rotation.x += dt * 10;
      } else if (fx.kind === 'puff') {
        fx.obj.position.addScaledVector(fx.vel, dt);
        fx.obj.scale.setScalar(fx.size * (1 + k * 1.8) * (1 - k * 0.6));
      } else if (fx.kind === 'ring') {
        fx.obj.scale.setScalar(0.3 + k * fx.radius);
        fx.obj.material.opacity = 0.9 * (1 - k);
      }
      if (fx.life <= 0) {
        this.scene.remove(fx.obj);
        if (fx.kind === 'bolt') fx.obj.geometry.dispose();
        if (fx.kind === 'ring') { fx.obj.geometry.dispose(); fx.obj.material.dispose(); }
        this.effects.splice(i, 1);
      }
    }
  }

  floatText(pos, text, kind, big) {
    const fl = this.floaters[this.floatIdx];
    this.floatIdx = (this.floatIdx + 1) % MAX_FLOATERS;
    fl.pos.copy(pos);
    fl.pos.x += (Math.random() - 0.5) * 0.6;
    fl.life = 0.8;
    fl.el.textContent = text;
    fl.el.className = 'floater ' + kind + (big ? ' big' : '');
    fl.el.style.display = 'block';
  }

  updateFloaters(dt) {
    const w = this.renderer.domElement.clientWidth, h = this.renderer.domElement.clientHeight;
    for (const fl of this.floaters) {
      if (fl.life <= 0) continue;
      fl.life -= dt;
      if (fl.life <= 0) { fl.el.style.display = 'none'; continue; }
      fl.pos.y += dt * 1.6;
      V3.copy(fl.pos).project(this.camera);
      const x = (V3.x * 0.5 + 0.5) * w, y = (-V3.y * 0.5 + 0.5) * h;
      const s = fl.life > 0.65 ? 1 + (fl.life - 0.65) * 3 : 1;
      fl.el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${s})`;
      fl.el.style.opacity = Math.min(1, fl.life * 3);
    }
  }

  updateCamera(dt) {
    const p = this.player.root.position;
    this.camTarget.x += (p.x * 0.55 - this.camTarget.x) * Math.min(1, dt * 3);
    this.camTarget.z += (p.z * 0.55 - this.camTarget.z) * Math.min(1, dt * 3);
    const el = THREE.MathUtils.degToRad(58);
    const az = Math.PI / 4;
    const d = this.camDist || 30;
    this.camera.position.set(
      this.camTarget.x + Math.sin(az) * Math.cos(el) * d,
      Math.sin(el) * d,
      this.camTarget.z + Math.cos(az) * Math.cos(el) * d,
    );
    if (this.shake > 0) {
      this.shake -= dt;
      const s = this.shake * 0.8;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
    }
    this.camera.lookAt(this.camTarget.x, 0, this.camTarget.z);
  }

  // Converts screen-space joystick input to world movement for the diagonal camera.
  setInput(sx, sy) {
    // screen right = (1,0,-1)/√2, screen up = (-1,0,-1)/√2
    const k = Math.SQRT1_2;
    this.input.x = (sx - sy) * k;
    this.input.z = (-sx - sy) * k;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

function body_localToWorld(body, out, local) {
  out.set(local[0], local[1], local[2]);
  body.localToWorld(out);
}
