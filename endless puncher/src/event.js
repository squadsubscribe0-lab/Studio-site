import * as THREE from 'three';
import { buildFighter, dressPlayer, buildGlove, buildCar, buildJunkyard, GEO, lambert } from './models.js';
import { computeStats, fmt } from './stats.js';
import { Audio } from './audio.js';

const UP = new THREE.Vector3(0, 1, 0);
const V1 = new THREE.Vector3();
const V2 = new THREE.Vector3();

// Bonus event: pummel a car for a limited time; damage converts into coins.
export class CarEvent {
  constructor(renderer, hooks) {
    this.renderer = renderer;
    this.hooks = hooks;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#d9a27a');
    this.scene.fog = new THREE.Fog('#d9a27a', 18, 60);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.3, 200);
    this.scene.add(new THREE.HemisphereLight('#ffe9d0', '#8a5a3a', 1.5));
    const sun = new THREE.DirectionalLight('#fff', 1.3);
    sun.position.set(5, 12, 8);
    this.scene.add(sun);
    this.scene.add(buildJunkyard());

    this.player = dressPlayer(buildFighter({ color: '#2fb4ff', player: true }));
    this.player.root.position.set(-4.2, 0, 0);
    this.player.root.rotation.y = Math.PI / 2;
    this.scene.add(this.player.root);

    this.tube = new THREE.Mesh(GEO.armTube, lambert('#2fb4ff'));
    this.glove = buildGlove('#e23');
    this.glove.scale.setScalar(1.6);
    this.scene.add(this.tube, this.glove);

    this.flying = [];
    this.sparks = [];
    this.floatEl = document.getElementById('eventDmg');
    this.running = false;
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const needW = 7.5;
    this.camDist = Math.max(9 / Math.tan(vfov / 2) * 0.55, needW / (Math.tan(vfov / 2) * this.camera.aspect));
    this.camera.updateProjectionMatrix();
  }

  start(gloveColor) {
    if (this.car) this.scene.remove(this.car.root);
    for (const f of this.flying) this.scene.remove(f.mesh);
    this.flying = [];
    this.car = buildCar();
    this.car.root.position.set(1.8, 0, 0);
    this.car.root.rotation.y = Math.PI / 2 * 0.15;
    this.scene.add(this.car.root);
    this.glove.userData.ball.material.color.set(gloveColor || '#e23');

    const st = computeStats();
    this.atk = st.atk;
    this.goldMult = st.goldMult;
    this.time = 20;
    this.total = 0;
    this.combo = 0;
    this.punchT = 0;
    this.phase = 'rest';
    this.t = 0;
    this.boost = 0;
    this.nextBreak = 0;
    this.running = true;
    this.done = false;
    this.hooks.onHud?.(this);
  }

  tap() {
    if (!this.running || this.done) return;
    this.boost = Math.min(1.5, this.boost + 0.25);
    if (this.phase === 'rest') this.punchT = 0;
  }

  update(dt) {
    if (!this.running) return;
    dt = Math.min(dt, 0.05);
    const pr = this.player;
    // Arm origin and rest position
    pr.root.updateMatrixWorld(true);
    const origin = V1.set(0.36, 1.52, 0);
    pr.body.localToWorld(origin);
    const rest = new THREE.Vector3(0.3, 1.45, 0.7);
    pr.body.localToWorld(rest);
    const hitPoint = new THREE.Vector3(this.car.root.position.x - 1.2 + Math.sin(this.t * 7) * 0.3, 1.2 + Math.cos(this.t * 5) * 0.3, Math.sin(this.t * 3) * 0.6);

    if (!this.done) {
      this.time -= dt;
      this.boost = Math.max(0, this.boost - dt * 0.8);
      if (this.time <= 0) { this.time = 0; this.done = true; setTimeout(() => this.hooks.onEnd?.(this.reward()), 900); }
    }
    this.t += dt;
    const interval = 0.42 / (1 + this.boost * 1.6);
    let gp;
    if (this.phase === 'rest') {
      gp = rest;
      this.punchT -= dt;
      if (this.punchT <= 0 && !this.done) { this.phase = 'out'; this.pt = 0; Audio.play('punch', 0.04); }
    } else if (this.phase === 'out') {
      this.pt += dt;
      const k = Math.min(1, this.pt / 0.08);
      gp = rest.clone().lerp(hitPoint, k * k);
      if (k >= 1) { this.hit(hitPoint); this.phase = 'back'; this.pt = 0; }
    } else {
      this.pt += dt;
      const k = Math.min(1, this.pt / 0.1);
      gp = hitPoint.clone().lerp(rest, k);
      if (k >= 1) { this.phase = 'rest'; this.punchT = interval - 0.18; }
    }
    this.glove.position.copy(gp);
    V2.subVectors(gp, origin);
    const len = V2.length();
    this.tube.position.copy(origin);
    this.tube.quaternion.setFromUnitVectors(UP, V2.clone().normalize());
    this.tube.scale.set(1, len, 1);
    this.glove.lookAt(gp.clone().add(V2));

    pr.body.position.y = Math.sin(this.t * 8) * 0.03;

    // Car wobble
    const c = this.car.root;
    c.rotation.z += (0 - c.rotation.z) * Math.min(1, dt * 8);
    c.position.x += (1.8 - c.position.x) * Math.min(1, dt * 6);

    for (let i = this.flying.length - 1; i >= 0; i--) {
      const f = this.flying[i];
      f.vel.y -= 20 * dt;
      f.mesh.position.addScaledVector(f.vel, dt);
      f.mesh.rotation.x += f.spin * dt; f.mesh.rotation.z += f.spin * dt;
      if (f.mesh.position.y < 0.1) { f.mesh.position.y = 0.1; f.vel.set(f.vel.x * 0.5, Math.abs(f.vel.y) * 0.3, f.vel.z * 0.5); f.spin *= 0.5; }
      f.life -= dt;
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt;
      s.vel.y -= 18 * dt;
      s.mesh.position.addScaledVector(s.vel, dt);
      s.mesh.scale.setScalar(Math.max(0.01, s.life * 3));
      if (s.life <= 0) { this.scene.remove(s.mesh); this.sparks.splice(i, 1); }
    }
    // Floater decay
    if (this.floatLife > 0) {
      this.floatLife -= dt;
      this.floatEl.style.opacity = Math.min(1, this.floatLife * 3);
    }

    const d = this.camDist || 12;
    this.camera.position.set(-0.8, 3.2, d);
    this.camera.lookAt(-0.8, 1.6, 0);
  }

  hit(at) {
    const crit = Math.random() < 0.15;
    const dmg = this.atk * (0.9 + Math.random() * 0.3) * (crit ? 2.5 : 1) * (1 + this.boost * 0.3);
    this.total += dmg;
    Audio.play(crit ? 'crit' : 'metal', 0.04);
    const c = this.car;
    c.root.rotation.z = -0.06 - (crit ? 0.06 : 0);
    c.root.position.x = 2.1;
    // Dent: squash the body and darken the paint as damage accumulates.
    const wear = Math.min(1, this.total / (this.atk * 120));
    c.body.scale.set(1 - wear * 0.25, 1 - wear * 0.35, 1);
    c.cabin.scale.set(1 - wear * 0.2, 1 - wear * 0.55, 1 - wear * 0.1);
    c.cabin.position.y = 1.55 - wear * 0.35;
    c.paint.color.setRGB(0.78 - wear * 0.4, 0.15 - wear * 0.05, 0.18 - wear * 0.08);
    // Break parts off at thresholds
    const breakEvery = this.atk * 6;
    while (this.total > this.nextBreak + breakEvery && c.parts.length) {
      this.nextBreak += breakEvery;
      const idx = Math.floor(Math.random() * c.parts.length);
      const part = c.parts.splice(idx, 1)[0];
      Audio.play('crash', 0.08);
      part.getWorldPosition(V1);
      part.removeFromParent();
      part.position.copy(V1);
      this.scene.add(part);
      this.flying.push({ mesh: part, vel: new THREE.Vector3(3 + Math.random() * 6, 5 + Math.random() * 5, (Math.random() - 0.5) * 8), spin: (Math.random() - 0.5) * 16, life: 99 });
    }
    for (let i = 0; i < (crit ? 8 : 4); i++) {
      const m = new THREE.Mesh(GEO.spark, new THREE.MeshBasicMaterial({ color: crit ? '#ffe45c' : '#fff' }));
      m.position.copy(at);
      this.scene.add(m);
      this.sparks.push({ mesh: m, vel: new THREE.Vector3(Math.random() * 6, Math.random() * 6, (Math.random() - 0.5) * 6), life: 0.35 });
    }
    // Floating number near impact
    const p = at.clone().project(this.camera);
    const w = this.renderer.domElement.clientWidth, h = this.renderer.domElement.clientHeight;
    this.floatEl.textContent = fmt(dmg);
    this.floatEl.className = crit ? 'crit' : '';
    this.floatEl.style.left = ((p.x * 0.5 + 0.5) * w + 20) + 'px';
    this.floatEl.style.top = ((-p.y * 0.5 + 0.5) * h - 60) + 'px';
    this.floatLife = 0.6;
    this.hooks.onHud?.(this);
  }

  reward() {
    return Math.round(this.total * 0.35 * this.goldMult) + 50;
  }

  render() { this.renderer.render(this.scene, this.camera); }
}
