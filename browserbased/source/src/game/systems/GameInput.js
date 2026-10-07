/**
 * Movement input: WASD / arrows, a gamepad stick, and a floating touch
 * joystick that appears under the thumb. The camera looks down -Z, so screen
 * up is world -Z.
 */
export class GameInput {
  constructor(stickBase, stickKnob) {
    this.keys = new Set();
    this.move = { x: 0, z: 0 };
    this.touch = null;
    this.base = stickBase;
    this.knob = stickKnob;
    this.enabled = true;
    this.onPause = null;
    this.onPick = null;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'Escape' || e.code === 'KeyP') this.onPause?.();
      const n = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[e.code];
      if (n !== undefined) this.onPick?.(n);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    const surface = document.getElementById('touch-surface');
    surface.addEventListener('pointerdown', (e) => this._down(e));
    window.addEventListener('pointermove', (e) => this._moveTouch(e));
    window.addEventListener('pointerup', (e) => this._up(e));
    window.addEventListener('pointercancel', (e) => this._up(e));
  }

  _down(e) {
    if (!this.enabled || this.touch) return;
    this.touch = { id: e.pointerId, ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 };
    this.base.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    this.knob.style.transform = 'translate(-50%, -50%)';
    this.base.classList.add('is-on');
  }

  _moveTouch(e) {
    const t = this.touch;
    if (!t || e.pointerId !== t.id) return;
    const max = 52;
    let dx = e.clientX - t.ox;
    let dy = e.clientY - t.oy;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    t.dx = dx / max;
    t.dy = dy / max;
    this.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  _up(e) {
    if (!this.touch || e.pointerId !== this.touch.id) return;
    this.touch = null;
    this.base.classList.remove('is-on');
  }

  update() {
    let x = 0;
    let z = 0;
    const k = this.keys;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (k.has('KeyW') || k.has('ArrowUp')) z -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) z += 1;
    if (this.touch) {
      x += this.touch.dx;
      z += this.touch.dy;
    }
    const pad = navigator.getGamepads?.()[0];
    if (pad) {
      const ax = pad.axes[0] ?? 0;
      const az = pad.axes[1] ?? 0;
      if (Math.hypot(ax, az) > 0.18) {
        x += ax;
        z += az;
      }
    }
    if (!this.enabled) x = z = 0;
    this.move.x = x;
    this.move.z = z;
    return this.move;
  }
}
