import { PerspectiveCamera, Vector3 } from 'three';
import { LAYER } from '../../core/Layers.js';

/**
 * High three-quarter follow camera. Exposes `shakeOffset`/`shakeRoll` so the
 * sandbox's `CameraShake` can drive it unchanged. On portrait screens it backs
 * off so the player sees roughly the same width of dungeon.
 */
export class GameCamera {
  constructor() {
    this.camera = new PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 300);
    this.camera.layers.enable(LAYER.VFX);
    this.target = new Vector3();
    this.shakeOffset = new Vector3();
    this.shakeRoll = 0;
    this.pitch = 0.98; // radians below horizontal
    this.distance = 16;
    this.zoom = 1;
  }

  snap(x, z) {
    this.target.set(x, 0, z);
    this.update(0, x, z);
  }

  update(dt, x, z) {
    const k = 1 - Math.exp(-dt * 6);
    this.target.x += (x - this.target.x) * (dt === 0 ? 1 : k);
    this.target.z += (z - this.target.z) * (dt === 0 ? 1 : k);
    const aspect = this.camera.aspect;
    const d = this.distance * this.zoom * (aspect < 1 ? Math.min(1.7, 1 / aspect) * 0.95 : 1);
    this.camera.position.set(
      this.target.x,
      Math.sin(this.pitch) * d,
      this.target.z + Math.cos(this.pitch) * d
    );
    this.camera.lookAt(this.target.x, 0.6, this.target.z);
    if (this.shakeOffset.lengthSq() > 0) {
      this.camera.position.add(this.shakeOffset);
      this.camera.rotateZ(this.shakeRoll);
    }
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
