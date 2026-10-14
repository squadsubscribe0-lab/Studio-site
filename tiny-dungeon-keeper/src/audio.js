/**
 * Sound effects and music.
 *
 * Every effect is a real recording / hand-made sound from Kenney's CC0
 * packs (see assets/sfx/SOURCES.txt and CREDITS.txt) — nothing is
 * synthesised or AI generated. Music: "The Villain's Blueprints"
 * (assets/music), supplied by the studio.
 */
const NAMES = [
  'jump', 'jump2', 'step1', 'step2', 'stepc1', 'stepc2', 'coin', 'defeat', 'hurt', 'spikes', 'spring', 'slime',
  'fire', 'rock', 'saw', 'axe', 'bomb', 'fuse', 'wheel', 'cannon', 'fireball', 'iceshot', 'freeze', 'log',
  'spikeball', 'cage', 'latch', 'chomp', 'splash', 'place', 'block', 'sell', 'click', 'select', 'error',
  'castle', 'learn', 'laugh', 'sad', 'wavestart', 'fight', 'wavedone', 'flawless', 'win', 'youwin', 'lose',
  'youlose', 'unlock', 'reward', 'magic', 'clang',
];

// default volume per sound, and the shortest gap between two plays (crowds!)
const VOL = { step1: 0.25, step2: 0.25, stepc1: 0.25, stepc2: 0.25, jump: 0.35, jump2: 0.35, coin: 0.35, hurt: 0.45, defeat: 0.4, fire: 0.5, music: 0.38 };
const GAP = { step1: 0.12, step2: 0.12, stepc1: 0.12, stepc2: 0.12, jump: 0.07, jump2: 0.07, coin: 0.06, hurt: 0.05, defeat: 0.06, spikes: 0.05, saw: 0.08, fire: 0.25, laugh: 3.5, sad: 2.5, castle: 0.15 };

let ctx = null, master = null, sfxGain = null;
const buffers = {};
const lastPlay = {};
let musicEl = null;

const prefs = { music: true, sfx: true };
try { Object.assign(prefs, JSON.parse(localStorage.getItem('tdk_audio') || '{}')); } catch (e) {}
const savePrefs = () => { try { localStorage.setItem('tdk_audio', JSON.stringify(prefs)); } catch (e) {} };

export const sound = {
  get music() { return prefs.music; },
  get sfx() { return prefs.sfx; },
  ducked: false,
};

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = prefs.sfx ? 1 : 0;
    sfxGain.connect(master);
  }
  return ctx;
}

/** Load every effect. onProgress(doneCount, total). */
export async function loadAudio(onProgress) {
  const c = ac();
  let done = 0;
  await Promise.all(NAMES.map(async (n) => {
    try {
      const res = await fetch(`assets/sfx/${n}.mp3`);
      const data = await res.arrayBuffer();
      if (c) buffers[n] = await new Promise((ok, bad) => c.decodeAudioData(data, ok, bad));
    } catch (e) { /* a missing sound must never break the game */ }
    onProgress?.(++done, NAMES.length);
  }));
  musicEl = new Audio('assets/music/villains-blueprints.mp3');
  musicEl.loop = true;
  musicEl.preload = 'auto';
  musicEl.volume = VOL.music;
}

export function unlockAudio() {
  const c = ac();
  if (c && c.state === 'suspended') c.resume();
  if (prefs.music && musicEl && musicEl.paused && !sound.ducked) musicEl.play().catch(() => {});
}

export function play(name, { vol = 1, rate = 1, detune = 0 } = {}) {
  if (!prefs.sfx || sound.ducked) return;
  const c = ctx, b = buffers[name];
  if (!c || !b || c.state !== 'running') return;
  const now = c.currentTime;
  if (now - (lastPlay[name] || -1) < (GAP[name] ?? 0.03)) return;
  lastPlay[name] = now;
  const src = c.createBufferSource();
  src.buffer = b;
  src.playbackRate.value = rate * (1 + (Math.random() - 0.5) * 0.08) * Math.pow(2, detune / 12);
  const gn = c.createGain();
  gn.gain.value = (VOL[name] ?? 0.6) * vol;
  src.connect(gn).connect(sfxGain);
  src.start();
}

export function setMusic(on) {
  prefs.music = on;
  savePrefs();
  if (!musicEl) return;
  if (on && !sound.ducked) musicEl.play().catch(() => {});
  else musicEl.pause();
}
export function setSfx(on) {
  prefs.sfx = on;
  savePrefs();
  if (sfxGain) sfxGain.gain.value = on ? 1 : 0;
}

/** Silence everything while an ad plays (portal requirement). */
export function duck(on) {
  sound.ducked = on;
  if (master) master.gain.value = on ? 0 : 1;
  if (musicEl) {
    if (on) musicEl.pause();
    else if (prefs.music) musicEl.play().catch(() => {});
  }
}
