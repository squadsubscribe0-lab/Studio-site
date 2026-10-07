// Keyboard input. Player 1 is WASD (the layout the brief asks for);
// a second player on the same keyboard uses the arrow keys.

const down = new Set();
const pressedThisFrame = new Set();
const listeners = [];

const BLOCK = new Set([
  'KeyW','KeyA','KeyS','KeyD','Space',
  'ArrowUp','ArrowDown','ArrowLeft','ArrowRight'
]);

export const BINDINGS = [
  { left: 'KeyA', right: 'KeyD', jump: 'KeyW', spike: 'KeyS', serve: 'Space' },
  { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', spike: 'ArrowDown', serve: 'Enter' }
];

/**
 * True while the player is typing into a form control, where the keys belong to
 * the field and not to the game.
 *
 * Without this the whole keydown handler fires over the top of every input:
 * WASD never reaches the room-code box (typing "wasteroom" gets you "teroom"),
 * preventDefault eats Space and the arrow keys, and M quietly toggles mute
 * while you type your name. Selects and sliders are included because they are
 * keyboard-driven too — arrows change a slider, letters jump a select.
 */
function isTextEntry(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}

export function initInput(target = window) {
  target.addEventListener('keydown', (e) => {
    if (isTextEntry(e.target)) return;
    if (BLOCK.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    down.add(e.code);
    pressedThisFrame.add(e.code);
    listeners.forEach((fn) => fn(e.code));
  });
  // Deliberately not gated on isTextEntry: releasing a key must always clear
  // it, including the key that was already held when a field took focus.
  target.addEventListener('keyup', (e) => down.delete(e.code));
  // Losing focus with a key held would otherwise leave a player running forever.
  window.addEventListener('blur', () => { down.clear(); clearVirtual(); });
}

// ---------------------------------------------------------------- touch
//
// The on-screen pad writes here and readInput folds it into the first local
// seat, so the simulation never learns there is more than one way to drive a
// player. Everything downstream - prediction, the network, replay - keeps
// seeing one input shape.
const virtual = { left: false, right: false, jump: false, spike: false };

export function setVirtual(action, on) {
  if (action in virtual) virtual[action] = !!on;
}

export function clearVirtual() {
  for (const k of Object.keys(virtual)) virtual[k] = false;
}

// ---------------------------------------------------------------- key labels
//
// The bindings themselves already adapt to the keyboard: KeyboardEvent.code
// names a physical position against a US layout, so 'KeyW' is the key above
// 'KeyA' whatever is printed on it - a French AZERTY player is moving with
// ZQSD without anything being remapped.
//
// What does not adapt is the letter we print in the HUD. So ask the browser
// what each key is actually called and label the prompts with that.
export const KEY_LABELS = {
  KeyA: 'A', KeyD: 'D', KeyW: 'W', KeyS: 'S', Space: 'SPACE', KeyP: 'P', KeyM: 'M'
};

export async function loadKeyLabels() {
  try {
    if (!navigator.keyboard || !navigator.keyboard.getLayoutMap) return KEY_LABELS;
    const map = await navigator.keyboard.getLayoutMap();
    for (const code of Object.keys(KEY_LABELS)) {
      if (code === 'Space') continue;            // the map gives an empty string
      const label = map.get(code);
      if (label) KEY_LABELS[code] = label.toUpperCase();
    }
  } catch { /* not supported, or blocked - the US labels are the fallback */ }
  return KEY_LABELS;
}

export function onKey(fn) { listeners.push(fn); }
export function isDown(code) { return down.has(code); }
export function wasPressed(code) { return pressedThisFrame.has(code); }
export function endFrame() { pressedThisFrame.clear(); }
export function clearKeys() { down.clear(); pressedThisFrame.clear(); clearVirtual(); }

/** Reads one control slot into the plain object the simulation consumes. */
export function readInput(slot) {
  const b = BINDINGS[slot] || BINDINGS[0];
  // Only the first seat gets the touch pad: there is one pad on the glass, and
  // a second local player is by definition on the same keyboard.
  const t = slot === 0 || slot === undefined ? virtual : null;
  // Coerced, not just truthy: these go over the wire as flags and a stray null
  // from the `t &&` guard would serialise differently to false.
  const right = isDown(b.right) || !!(t && t.right);
  const left = isDown(b.left) || !!(t && t.left);
  const jump = isDown(b.jump) || !!(t && t.jump);
  return {
    move: (right ? 1 : 0) - (left ? 1 : 0),
    jump,
    spike: isDown(b.spike) || !!(t && t.spike),
    serve: isDown(b.serve) || jump,
    // Humans do not aim explicitly: their touches come out of the contact
    // geometry, which is the feel the controls were designed around. The field
    // exists so Match can clear any stale aim left on the body.
    aimX: null,
    aimY: null
  };
}

export const EMPTY_INPUT = { move: 0, jump: false, spike: false, serve: false, aimX: null, aimY: null };
