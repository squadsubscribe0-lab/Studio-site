import * as THREE from 'three';
import { buildFighter, dressPlayer, buildGlove, buildPet, lambert, GEO } from './models.js';
import { Save } from './save.js';
import { getItem } from './stats.js';
import { RARITIES, RING_TIERS } from './data.js';

// One shared offscreen-capable renderer that is moved between menu screens,
// plus a portrait cache for pets (rendered once to data URLs).
export class Preview {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.mode = null;
    this.petCache = new Map();
    this.t = 0;

    // Hero scene
    this.heroScene = new THREE.Scene();
    this.heroScene.add(new THREE.HemisphereLight('#dfe8ff', '#403040', 1.6));
    const d = new THREE.DirectionalLight('#fff', 1.4); d.position.set(3, 5, 6); this.heroScene.add(d);
    this.hero = dressPlayer(buildFighter({ color: '#2fb4ff', player: true }));
    this.hero.shadow.visible = true;
    this.heroScene.add(this.hero.root);
    this.heroGloves = [];
    const armMat = lambert('#2fb4ff');
    for (const sx of [-1, 1]) {
      const g = buildGlove('#e23');
      g.position.set(0.45 * sx, 1.35, 0.45);
      this.hero.body.add(g);
      this.heroGloves.push(g);
      const tube = new THREE.Mesh(GEO.armTube, armMat);
      tube.position.set(0.36 * sx, 1.52, 0);
      tube.lookAt(tube.position.clone().add(new THREE.Vector3(0.1 * sx, -0.17, 0.45)));
      tube.rotateX(Math.PI / 2);
      tube.scale.y = 0.5;
      this.hero.body.add(tube);
    }
    this.heroCam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.heroCam.position.set(0, 1.5, 6.2);
    this.heroCam.lookAt(0, 1.15, 0);

    // Ring scene
    this.ringScene = new THREE.Scene();
    this.ringScene.add(new THREE.HemisphereLight('#dfe8ff', '#302030', 1.5));
    const d2 = new THREE.DirectionalLight('#fff', 1.2); d2.position.set(-3, 8, 5); this.ringScene.add(d2);
    this.ringGroup = new THREE.Group();
    this.ringScene.add(this.ringGroup);
    this.ringCam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.ringCam.position.set(7, 7, 7);
    this.ringCam.lookAt(0, 0, 0);

    // Pet portrait scene
    this.petScene = new THREE.Scene();
    this.petScene.add(new THREE.HemisphereLight('#ffffff', '#606080', 1.8));
    const d3 = new THREE.DirectionalLight('#fff', 1.2); d3.position.set(2, 3, 4); this.petScene.add(d3);
    this.petCam = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    this.petCam.position.set(0.45, 1.0, 2.2);
    this.petCam.lookAt(0, 0.52, 0);
  }

  buildRing(tier) {
    this.ringGroup.clear();
    const t = RING_TIERS[tier % RING_TIERS.length];
    const floor = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), lambert(t.color));
    floor.position.y = -0.25; this.ringGroup.add(floor);
    const mat = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.05, 5.6), lambert('#ffffff', { opacity: 0.12, transparent: true }));
    mat.position.y = 0.01; this.ringGroup.add(mat);
    const ropeMat = lambert(t.rope);
    const corners = [[-3, -3], [3, -3], [3, 3], [-3, 3]];
    for (const [x, z] of corners) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.6, 8), lambert('#ffcc33'));
      post.position.set(x, 0.8, z); this.ringGroup.add(post);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), lambert('#ffcc33', { emissive: '#553300' }));
      top.position.set(x, 1.7, z); this.ringGroup.add(top);
    }
    const ropeGeo = new THREE.CylinderGeometry(0.04, 0.04, 6, 6).rotateZ(Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      for (const h of [0.5, 0.9, 1.3]) {
        const r = new THREE.Mesh(ropeGeo, ropeMat);
        const a = corners[i], b = corners[(i + 1) % 4];
        r.position.set((a[0] + b[0]) / 2, h, (a[1] + b[1]) / 2);
        r.rotation.y = i % 2 ? Math.PI / 2 : 0;
        this.ringGroup.add(r);
      }
    }
    const emblem = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32), lambert(t.rope, { transparent: true, opacity: 0.5 }));
    emblem.rotation.x = -Math.PI / 2; emblem.position.y = 0.03;
    this.ringGroup.add(emblem);
  }

  dressHero() {
    const s = Save.state;
    const g = this.hero.gear;
    const col = (slot) => { const it = getItem(s.equipped[slot]); return it ? RARITIES[it.rarity].color : null; };
    const set = (m, slot) => { const c = col(slot); m.visible = !!c; if (c) m.material.color.set(c); };
    set(g.helmet, 'helmet'); set(g.belt, 'belt'); set(g.armor, 'armor');
    g.shoes.forEach(m => set(m, 'shoes')); g.pants.forEach(m => set(m, 'pants'));
    g.band.visible = !g.helmet.visible;
    const gl = getItem(s.equipped.gloves);
    const gc = !gl || gl.rarity === 0 ? '#e23b3b' : RARITIES[gl.rarity].color;
    this.heroGloves.forEach(gl => gl.userData.ball.material.color.set(gc));
  }

  mount(container, mode) {
    this.mode = mode;
    container.appendChild(this.canvas);
    if (mode === 'hero') this.dressHero();
    if (mode === 'ring') this.buildRing(Save.state.ring.tier);
    this.resize();
  }

  unmount() { this.mode = null; this.canvas.remove(); }

  resize() {
    const r = this.canvas.parentElement?.getBoundingClientRect();
    if (!r || !r.width) return;
    this.renderer.setSize(r.width, r.height, false);
    const a = r.width / r.height;
    this.heroCam.aspect = a; this.heroCam.updateProjectionMatrix();
    this.ringCam.aspect = a; this.ringCam.updateProjectionMatrix();
  }

  update(dt) {
    if (!this.mode || !this.canvas.isConnected) return;
    this.t += dt;
    if (this.mode === 'hero') {
      this.hero.root.rotation.y = Math.sin(this.t * 0.6) * 0.5;
      this.hero.body.position.y = Math.sin(this.t * 3) * 0.03;
      this.renderer.render(this.heroScene, this.heroCam);
    } else if (this.mode === 'ring') {
      this.ringGroup.rotation.y = this.t * 0.3;
      this.renderer.render(this.ringScene, this.ringCam);
    }
  }

  petImage(pet) {
    if (this.petCache.has(pet.id)) return this.petCache.get(pet.id);
    const prevMode = this.mode;
    const parent = this.canvas.parentElement;
    const oldSize = new THREE.Vector2(); this.renderer.getSize(oldSize);
    const m = buildPet(pet.color, pet.element, pet.costume);
    m.userData.tick?.(0.6);
    // Let the cape cloth settle into a natural drape before the snapshot.
    for (let i = 0; i < 90; i++) m.userData.cloth?.step(1 / 60);
    m.children[1].visible = false; // no shadow in portrait
    m.rotation.y = -0.35;
    this.petScene.add(m);
    this.renderer.setSize(160, 160, false);
    this.petCam.aspect = 1; this.petCam.updateProjectionMatrix();
    this.renderer.render(this.petScene, this.petCam);
    const url = this.canvas.toDataURL('image/png');
    this.petScene.remove(m);
    this.petCache.set(pet.id, url);
    if (parent && prevMode) this.resize(); else if (oldSize.x) this.renderer.setSize(oldSize.x, oldSize.y, false);
    return url;
  }
}
