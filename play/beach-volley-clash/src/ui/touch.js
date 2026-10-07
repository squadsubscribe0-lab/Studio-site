// On-screen controls for phones and tablets.
//
// Four buttons, no virtual stick. A volleyball rally is won and lost on being
// on exactly the right spot when the ball arrives, and a thumbstick on glass
// gives you an analogue value you cannot feel - discrete left/right is both
// more precise and easier to learn. JUMP doubles as the serve, because
// readInput already folds jump into serve, so there is no fifth button for a
// thing you press once a point.
//
// Everything here writes into the virtual input state in core/input.js. The
// simulation never learns whether a frame came from a keyboard or a thumb.

import { setVirtual, clearVirtual } from '../core/input.js';

const $ = (id) => document.getElementById(id);

/**
 * Does this device actually want touch controls?
 *
 * Both halves matter. `maxTouchPoints` alone is true of every touchscreen
 * laptop, where the player still has a keyboard and a pad over the court would
 * be an insult; `pointer: coarse` alone can be true of a TV remote. `?touch=1`
 * forces them on so the layout can be checked from a desktop browser.
 */
export function wantsTouchControls() {
  const params = new URLSearchParams(location.search);
  if (params.get('touch') === '1') return true;
  if (params.get('touch') === '0') return false;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  return (navigator.maxTouchPoints || 0) > 0 && !!coarse;
}

export class TouchControls {
  constructor() {
    this.enabled = false;
    this.root = $('touchPad');
    this.buttons = [];
    // Which button each active pointer is currently holding, so a finger that
    // slides off one and onto another releases the first.
    this.pointers = new Map();
  }

  /** Builds the pad and starts listening. Safe to call once. */
  init() {
    if (this.enabled) return;
    this.enabled = true;
    document.body.classList.add('touch');
    this.root.classList.remove('hidden');

    for (const el of this.root.querySelectorAll('[data-act]')) {
      this.buttons.push(el);
      el.addEventListener('pointerdown', (e) => this.press(e, el));
      el.addEventListener('pointerenter', (e) => {
        // Only if this pointer is already down - a hover on a hybrid device
        // must not make the player run.
        if (e.buttons) this.press(e, el);
      });
      el.addEventListener('pointerup', (e) => this.release(e));
      el.addEventListener('pointercancel', (e) => this.release(e));
      el.addEventListener('pointerleave', (e) => this.release(e));
      // Long-press on a button otherwise pops the OS text/callout menu.
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // A pointer released anywhere - dragged off the pad, off the screen edge,
    // interrupted by a notification - must still let go of the button.
    window.addEventListener('pointerup', (e) => this.release(e));
    window.addEventListener('pointercancel', (e) => this.release(e));
    window.addEventListener('blur', () => this.releaseAll());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.releaseAll();
    });
  }

  press(e, el) {
    e.preventDefault();
    const act = el.dataset.act;
    const held = this.pointers.get(e.pointerId);
    if (held === act) return;
    if (held) this.set(held, false);
    this.pointers.set(e.pointerId, act);
    this.set(act, true);
    el.classList.add('held');
  }

  release(e) {
    const act = this.pointers.get(e.pointerId);
    if (!act) return;
    this.pointers.delete(e.pointerId);
    // Another finger may still be on the same button.
    if (![...this.pointers.values()].includes(act)) this.set(act, false);
  }

  releaseAll() {
    this.pointers.clear();
    clearVirtual();
    for (const el of this.buttons) el.classList.remove('held');
  }

  set(act, on) {
    setVirtual(act, on);
    if (!on) {
      for (const el of this.buttons) {
        if (el.dataset.act === act) el.classList.remove('held');
      }
    }
  }

  /** Hidden while a menu is up, so the pad never sits over a dialog. */
  show(on) {
    if (!this.enabled) return;
    this.root.classList.toggle('hidden', !on);
    if (!on) this.releaseAll();
  }
}

export const touch = new TouchControls();
