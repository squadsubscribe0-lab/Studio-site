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

export function initInput(target = window) {
  target.addEventListener('keydown', (e) => {
    if (BLOCK.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    down.add(e.code);
    pressedThisFrame.add(e.code);
    listeners.forEach((fn) => fn(e.code));
  });
  target.addEventListener('keyup', (e) => down.delete(e.code));
  // Losing focus with a key held would otherwise leave a player running forever.
  window.addEventListener('blur', () => down.clear());
}

export function onKey(fn) { listeners.push(fn); }
export function isDown(code) { return down.has(code); }
export function wasPressed(code) { return pressedThisFrame.has(code); }
export function endFrame() { pressedThisFrame.clear(); }
export function clearKeys() { down.clear(); pressedThisFrame.clear(); }

/** Reads one control slot into the plain object the simulation consumes. */
export function readInput(slot) {
  const b = BINDINGS[slot] || BINDINGS[0];
  return {
    move: (isDown(b.right) ? 1 : 0) - (isDown(b.left) ? 1 : 0),
    jump: isDown(b.jump),
    spike: isDown(b.spike),
    serve: isDown(b.serve) || isDown(b.jump),
    // Humans do not aim explicitly: their touches come out of the contact
    // geometry, which is the feel the controls were designed around. The field
    // exists so Match can clear any stale aim left on the body.
    aimX: null,
    aimY: null
  };
}

export const EMPTY_INPUT = { move: 0, jump: false, spike: false, serve: false, aimX: null, aimY: null };
