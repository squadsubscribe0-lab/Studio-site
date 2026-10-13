// Tiny synthesized sound effects — no audio files needed.
let ctx = null;
let master = null;
export const sound = { muted: false };

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ac();
}

function tone(freq, dur, { type = 'square', to = null, vol = 0.3, delay = 0 } = {}) {
  if (sound.muted) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, { vol = 0.25, freq = 1200, delay = 0 } = {}) {
  if (sound.muted) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = vol;
  s.connect(f).connect(g).connect(master);
  s.start(t);
}

export const sfx = {
  place: () => tone(520, 0.08, { type: 'triangle', to: 780, vol: 0.25 }),
  sell: () => tone(700, 0.1, { type: 'triangle', to: 350, vol: 0.2 }),
  jump: () => tone(380, 0.12, { type: 'square', to: 760, vol: 0.06 }),
  boing: () => tone(180, 0.35, { type: 'sine', to: 620, vol: 0.3 }),
  defeat: () => { tone(640, 0.35, { type: 'square', to: 120, vol: 0.12 }); noise(0.15, { vol: 0.15, freq: 2500 }); },
  coin: () => { tone(988, 0.07, { type: 'square', vol: 0.08 }); tone(1319, 0.12, { type: 'square', vol: 0.08, delay: 0.07 }); },
  fire: () => noise(0.4, { vol: 0.18, freq: 700 }),
  crash: () => noise(0.3, { vol: 0.35, freq: 400 }),
  clang: () => { tone(220, 0.25, { type: 'sawtooth', vol: 0.12 }); noise(0.1, { vol: 0.2, freq: 3000 }); },
  steal: () => { tone(500, 0.15, { type: 'triangle', vol: 0.2 }); tone(380, 0.25, { type: 'triangle', vol: 0.2, delay: 0.15 }); },
  magic: () => { [0, 1, 2, 3].forEach((i) => tone(880 + i * 220, 0.08, { type: 'sine', vol: 0.12, delay: i * 0.05 })); },
  learn: () => { tone(660, 0.1, { type: 'sine', vol: 0.15 }); tone(990, 0.18, { type: 'sine', vol: 0.15, delay: 0.1 }); },
  lever: () => { tone(160, 0.15, { type: 'square', vol: 0.15 }); [523, 659, 784].forEach((f, i) => tone(f, 0.14, { type: 'triangle', vol: 0.18, delay: 0.15 + i * 0.1 })); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.2, delay: i * 0.12 })),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.2, delay: i * 0.18 })),
  click: () => tone(900, 0.04, { type: 'square', vol: 0.06 }),
};
