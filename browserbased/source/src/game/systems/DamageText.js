import { Vector3 } from 'three';

const POOL = 48;
const _v = new Vector3();

/**
 * Floating damage numbers: a fixed pool of DOM nodes, positioned by projecting
 * a world point each frame. The oldest number is recycled when the pool runs
 * dry, so a screen full of hits never grows the DOM.
 */
export class DamageText {
  constructor(container, camera) {
    this.camera = camera;
    this.items = [];
    this.cursor = 0;
    this.enabled = true;
    for (let i = 0; i < POOL; i++) {
      const el = document.createElement('div');
      el.className = 'dmg';
      container.appendChild(el);
      this.items.push({ el, x: 0, y: 0, z: 0, t: 1, life: 0.8, live: false });
    }
  }

  spawn(x, y, z, amount, crit = false, kind = 'hit') {
    if (!this.enabled) return;
    const item = this.items[this.cursor];
    this.cursor = (this.cursor + 1) % POOL;
    item.x = x + (Math.random() - 0.5) * 0.6;
    item.y = y;
    item.z = z;
    item.t = 0;
    item.live = true;
    item.life = crit ? 1.0 : 0.7;
    item.el.textContent = kind === 'heal' ? `+${amount}` : `${Math.max(1, Math.round(amount))}`;
    item.el.className = `dmg ${crit ? 'dmg--crit' : ''} ${kind === 'heal' ? 'dmg--heal' : ''}`;
  }

  update(dt, width, height) {
    for (const item of this.items) {
      if (!item.live) continue;
      item.t += dt;
      if (item.t >= item.life) {
        item.live = false;
        item.el.style.opacity = '0';
        continue;
      }
      const k = item.t / item.life;
      _v.set(item.x, item.y + k * 1.2, item.z).project(this.camera);
      if (_v.z > 1) continue;
      const sx = (_v.x * 0.5 + 0.5) * width;
      const sy = (-_v.y * 0.5 + 0.5) * height;
      const pop = k < 0.15 ? 0.6 + (k / 0.15) * 0.6 : 1.2 - Math.min(0.2, (k - 0.15) * 0.5);
      item.el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${pop.toFixed(2)})`;
      item.el.style.opacity = String(1 - Math.max(0, (k - 0.6) / 0.4));
    }
  }

  clear() {
    for (const item of this.items) {
      item.live = false;
      item.el.style.opacity = '0';
    }
  }
}
