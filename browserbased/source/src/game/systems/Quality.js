import { settings } from '../../config/settings.js';

const TIERS = [
  { name: 'high', pixelRatio: 1.75, particles: 0.6 },
  { name: 'medium', pixelRatio: 1.25, particles: 0.42 },
  { name: 'low', pixelRatio: 1.0, particles: 0.28 },
  { name: 'potato', pixelRatio: 0.75, particles: 0.18 }
];

/**
 * Adaptive quality. Watches real frame time during play and steps down —
 * render resolution first, particle budgets with it — when a device can't
 * hold ~45 fps. It never steps back up mid-run (that reads as flicker); a new
 * run starts one tier above wherever the last run settled.
 */
export class Quality {
  constructor(renderer, onResize) {
    this.renderer = renderer;
    this.onResize = onResize;
    this.tier = 0;
    this._acc = 0;
    this._frames = 0;
    this._grace = 3;
    this.apply();
  }

  get name() {
    return TIERS[this.tier].name;
  }

  apply() {
    const t = TIERS[this.tier];
    settings.global.particleCount = t.particles;
    const ratio = Math.min(window.devicePixelRatio || 1, t.pixelRatio);
    this.renderer.targetPixelRatio = () => ratio;
    this.renderer.handleResize();
  }

  newRun() {
    this.tier = Math.max(0, this.tier - 1);
    this._grace = 3;
    this._acc = 0;
    this._frames = 0;
    this.apply();
  }

  /** Call with real frame time while a run is live. */
  sample(raw) {
    if (this._grace > 0) {
      this._grace -= raw; // let shaders and pools settle first
      return;
    }
    this._acc += Math.min(raw, 0.25);
    this._frames++;
    if (this._acc < 2) return;
    const fps = this._frames / this._acc;
    this._acc = 0;
    this._frames = 0;
    if (fps < 45 && this.tier < TIERS.length - 1) {
      this.tier++;
      this._grace = 1.5;
      this.apply();
    }
  }
}
