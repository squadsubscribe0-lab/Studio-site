// Synthesized sound effects + a quiet procedural music loop (no audio files needed).
// Everything is mixed low: SFX go through a master bus, music through its own softer bus.
let ctx = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let muted = false;
let musicMuted = false;
let sdkMuted = false;
let paused = false;
const lastPlay = {};

const MASTER_VOL = 0.3;
const MUSIC_VOL = 0.28; // relative to master, so music sits well under the effects
const SFX_VOL = 1.7;    // effects boosted on their own bus so the music level stays put

function ensure() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = MASTER_VOL;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = SFX_VOL;
    sfxBus.connect(master);
    musicBus = ctx.createGain();
    musicBus.gain.value = musicMuted ? 0 : MUSIC_VOL;
    musicBus.connect(master);
  } catch { ctx = null; }
  return ctx;
}

function applyGain() {
  if (!master) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime((muted || sdkMuted || paused) ? 0 : MASTER_VOL, t, 0.03);
  musicBus.gain.setTargetAtTime(musicMuted ? 0 : MUSIC_VOL * (musicMode === 'menu' ? 0.7 : 1), t, 0.2);
}

function tone({ f = 440, f2 = null, dur = 0.1, type = 'sine', vol = 0.5, delay = 0, bus = sfxBus, attack = 0 }) {
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  if (attack) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
  } else g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus);
  o.start(t); o.stop(t + dur + 0.02);
}

let noiseBuf = null;
function noise({ dur = 0.08, vol = 0.4, freq = 800, freq2 = null, type = 'lowpass', q = 1, delay = 0, bus = sfxBus, attack = 0 }) {
  const t = ctx.currentTime + delay;
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const filt = ctx.createBiquadFilter();
  filt.type = type; filt.Q.value = q;
  filt.frequency.setValueAtTime(freq, t);
  if (freq2) filt.frequency.exponentialRampToValueAtTime(freq2, t + dur);
  const g = ctx.createGain();
  if (attack) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
  } else g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filt); filt.connect(g); g.connect(bus);
  src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
}

const SOUNDS = {
  // combat
  punch: () => { noise({ dur: 0.07, vol: 0.35, freq: 1200 }); tone({ f: 160, f2: 60, dur: 0.08, type: 'triangle', vol: 0.4 }); },
  hit:   () => { noise({ dur: 0.05, vol: 0.25, freq: 2500 }); },
  crit:  () => { noise({ dur: 0.1, vol: 0.4, freq: 3000 }); tone({ f: 900, f2: 300, dur: 0.12, type: 'square', vol: 0.12 }); },
  die:   () => { tone({ f: 300, f2: 90, dur: 0.15, type: 'sawtooth', vol: 0.12 }); },
  hurt:  () => { tone({ f: 200, f2: 80, dur: 0.12, type: 'square', vol: 0.15 }); },
  throw: () => { noise({ dur: 0.18, vol: 0.18, freq: 600, freq2: 2400, type: 'bandpass', q: 2 }); },
  boss:  () => { tone({ f: 110, f2: 55, dur: 0.6, type: 'sawtooth', vol: 0.3 }); tone({ f: 82, f2: 41, dur: 0.8, type: 'square', vol: 0.15, delay: 0.1 }); },
  slam:  () => { noise({ dur: 0.3, vol: 0.5, freq: 400 }); tone({ f: 90, f2: 40, dur: 0.3, type: 'sine', vol: 0.5 }); },
  zap:   () => { noise({ dur: 0.06, vol: 0.2, freq: 5000 }); tone({ f: 1800, f2: 600, dur: 0.07, type: 'sawtooth', vol: 0.06 }); },
  metal: () => { noise({ dur: 0.12, vol: 0.4, freq: 3500 }); tone({ f: 420, f2: 300, dur: 0.15, type: 'square', vol: 0.1 }); },
  crash: () => { noise({ dur: 0.35, vol: 0.45, freq: 5000, freq2: 900 }); tone({ f: 260, f2: 120, dur: 0.25, type: 'square', vol: 0.08 }); },
  pew:   () => { tone({ f: 900, f2: 1500, dur: 0.06, type: 'sine', vol: 0.08 }); },

  // pickups & progression
  gem:   () => { tone({ f: 1200, f2: 1800, dur: 0.06, type: 'sine', vol: 0.12 }); },
  coin:  () => { tone({ f: 1400, dur: 0.05, type: 'square', vol: 0.08 }); tone({ f: 2100, dur: 0.08, type: 'square', vol: 0.08, delay: 0.05 }); },
  level: () => { [523, 659, 784, 1046].forEach((f, i) => tone({ f, dur: 0.14, type: 'triangle', vol: 0.3, delay: i * 0.07 })); },
  win:   () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone({ f, dur: 0.2, type: 'triangle', vol: 0.3, delay: i * 0.09 })); },
  lose:  () => { [392, 330, 262, 196].forEach((f, i) => tone({ f, dur: 0.25, type: 'triangle', vol: 0.3, delay: i * 0.12 })); },
  reward:() => { [784, 988, 1175, 1568].forEach((f, i) => tone({ f, dur: 0.18, type: 'sine', vol: 0.22, delay: i * 0.06 })); noise({ dur: 0.4, vol: 0.08, freq: 7000, type: 'highpass', delay: 0.05 }); },
  heal:  () => { [659, 880, 1109].forEach((f, i) => tone({ f, dur: 0.3, type: 'sine', vol: 0.18, delay: i * 0.08, attack: 0.02 })); },

  // UI
  click: () => { tone({ f: 700, f2: 500, dur: 0.05, type: 'sine', vol: 0.2 }); },
  buy:   () => { tone({ f: 660, dur: 0.07, type: 'triangle', vol: 0.3 }); tone({ f: 990, dur: 0.1, type: 'triangle', vol: 0.3, delay: 0.06 }); },
  open:  () => { noise({ dur: 0.14, vol: 0.12, freq: 700, freq2: 2600, type: 'bandpass', q: 1.5 }); tone({ f: 440, f2: 660, dur: 0.1, type: 'sine', vol: 0.1 }); },
  error: () => { tone({ f: 220, dur: 0.09, type: 'square', vol: 0.1 }); tone({ f: 175, dur: 0.14, type: 'square', vol: 0.1, delay: 0.09 }); },
  tick:  () => { tone({ f: 1500, dur: 0.02, type: 'square', vol: 0.05 }); },

  // pet skills
  splash:() => { noise({ dur: 0.45, vol: 0.35, freq: 2500, freq2: 400 }); tone({ f: 300, f2: 120, dur: 0.2, type: 'sine', vol: 0.2 }); },
  whoosh:() => { noise({ dur: 0.5, vol: 0.3, freq: 300, freq2: 1600, type: 'bandpass', q: 0.8, attack: 0.08 }); },
  sizzle:() => { noise({ dur: 0.2, vol: 0.1, freq: 4000, type: 'highpass' }); },
  freeze:() => { [1760, 2093, 2637].forEach((f, i) => tone({ f, f2: f * 1.02, dur: 0.35, type: 'sine', vol: 0.12, delay: i * 0.04 })); noise({ dur: 0.35, vol: 0.18, freq: 6000, type: 'highpass' }); },
  pop:   () => { tone({ f: 500, f2: 1400, dur: 0.07, type: 'sine', vol: 0.25 }); noise({ dur: 0.04, vol: 0.1, freq: 3000, delay: 0.03 }); },
  meteor:() => { tone({ f: 1600, f2: 300, dur: 0.4, type: 'sine', vol: 0.1 }); },
  hum:   () => { tone({ f: 70, f2: 45, dur: 1.8, type: 'sawtooth', vol: 0.12, attack: 0.3 }); tone({ f: 140, f2: 90, dur: 1.8, type: 'sine', vol: 0.1, attack: 0.3 }); },
  bell:  () => { [1318, 1976, 2637].forEach((f, i) => tone({ f, dur: 0.5 - i * 0.1, type: 'sine', vol: 0.14 / (i + 1) })); },
  bubble:() => { for (let i = 0; i < 4; i++) tone({ f: 300 + Math.random() * 400, f2: 700 + Math.random() * 500, dur: 0.06, type: 'sine', vol: 0.08, delay: i * 0.07 }); },
  grow:  () => { noise({ dur: 0.4, vol: 0.12, freq: 800, freq2: 2400, type: 'bandpass', q: 2 }); },
  rumble:() => { noise({ dur: 1.4, vol: 0.35, freq: 180, attack: 0.3 }); tone({ f: 55, f2: 70, dur: 1.4, type: 'sawtooth', vol: 0.08, attack: 0.3 }); },
  horn:  () => { tone({ f: 330, dur: 0.22, type: 'square', vol: 0.12 }); tone({ f: 262, dur: 0.3, type: 'square', vol: 0.12, delay: 0.24 }); },
  combo: () => { [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone({ f, dur: 0.22, type: 'square', vol: 0.09, delay: i * 0.05 })); noise({ dur: 0.5, vol: 0.1, freq: 6000, type: 'highpass', delay: 0.1 }); },
};

// ---------------- music ----------------
// Original upbeat loop: A-minor pentatonic, four chords, bass + soft pad + plucked arpeggio + light drums.
const BPM = 104;
const STEP = 60 / BPM / 4; // 16th notes
const CHORDS = [
  [57, 60, 64],  // Am
  [53, 57, 60],  // F
  [48, 52, 55],  // C
  [55, 59, 62],  // G
];
const ARP = [0, 1, 2, 1, 0, 2, 1, 2];
const LEAD = [ // sparse pentatonic motif, -1 = rest (step index within 2 bars)
  76, -1, -1, 74, -1, 72, -1, -1, 69, -1, 72, -1, 74, -1, -1, -1,
  76, -1, 79, -1, 76, -1, 74, -1, 72, -1, -1, 69, -1, -1, -1, -1,
];
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

let musicMode = 'battle';
let musicOn = false;
let step = 0;
let nextTime = 0;
let timer = null;

function scheduleStep(s, t) {
  const bar = Math.floor(s / 16) % 4;
  const pos = s % 16;
  const chord = CHORDS[bar];
  const bus = musicBus;
  const at = t - ctx.currentTime;
  const battle = musicMode === 'battle';

  // kick on 1 and 3, soft hats on off-beats
  if (battle && (pos === 0 || pos === 8)) tone({ f: 120, f2: 45, dur: 0.18, type: 'sine', vol: 0.5, delay: at, bus });
  if (battle && pos % 4 === 2) noise({ dur: 0.03, vol: 0.12, freq: 8000, type: 'highpass', delay: at, bus });
  if (battle && (pos === 4 || pos === 12)) noise({ dur: 0.09, vol: 0.14, freq: 1800, type: 'bandpass', q: 0.7, delay: at, bus });

  // bass: root with an octave hop
  if (pos % 4 === 0) tone({ f: midi(chord[0] - 12 + (pos === 8 ? 12 : 0)), dur: STEP * 3.2, type: 'triangle', vol: 0.32, delay: at, bus });

  // pad: whole-bar chord, very soft
  if (pos === 0) chord.forEach(n => tone({ f: midi(n), dur: STEP * 16, type: 'sine', vol: 0.06, delay: at, bus, attack: 0.25 }));

  // plucked arpeggio on 8ths
  if (pos % 2 === 0) tone({ f: midi(chord[ARP[(pos / 2) % 8]] + 12), dur: STEP * 1.6, type: 'triangle', vol: 0.07, delay: at, bus });

  // lead motif, every other 2-bar phrase
  const phrase = Math.floor(s / 32) % 2;
  const note = LEAD[s % 32];
  if (battle && phrase === 1 && note > 0) tone({ f: midi(note), dur: STEP * 2.5, type: 'square', vol: 0.035, delay: at, bus, attack: 0.01 });
}

function pump() {
  if (!ctx || !musicOn) return;
  while (nextTime < ctx.currentTime + 0.25) {
    scheduleStep(step, nextTime);
    step++;
    nextTime += STEP;
  }
}

export const Audio = {
  unlock() {
    ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    if (ctx && !musicOn) this.startMusic();
  },
  play(name, minGap = 0.03) {
    if (!ctx || muted || sdkMuted || paused) return;
    const now = ctx.currentTime;
    if (lastPlay[name] && now - lastPlay[name] < minGap) return;
    lastPlay[name] = now;
    try { SOUNDS[name]?.(); } catch {}
  },
  startMusic() {
    if (!ctx || musicOn) return;
    musicOn = true;
    nextTime = ctx.currentTime + 0.1;
    timer = setInterval(pump, 60);
  },
  setMusicMode(mode) { musicMode = mode; if (ctx) applyGain(); },
  setMuted(m) { muted = m; applyGain(); },
  setMusicMuted(m) { musicMuted = m; applyGain(); },
  setSdkMuted(m) { sdkMuted = m; applyGain(); },
  setPaused(p) {
    paused = p;
    applyGain();
    // Skip ahead after a pause so queued notes don't burst out at once.
    if (ctx && !p) nextTime = Math.max(nextTime, ctx.currentTime + 0.05);
  },
  get muted() { return muted; },
  get debug() { return { state: ctx?.state || 'none', musicOn, step, mode: musicMode }; },
  get musicMuted() { return musicMuted; },
};
