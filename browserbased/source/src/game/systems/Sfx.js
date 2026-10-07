/**
 * Sound effects.
 *
 * Spells, hits, footsteps and boss slams play recorded samples from Kenney's
 * Sci-fi and Impact packs (CC0, `public/sfx/`), each voiced to match its VFX
 * and pitched a little at random so repeats never sound stamped. Menu blips,
 * gems, level-ups and chests stay synthesised. Anything whose sample is
 * missing or undecodable falls back to a synthesised voice, so the game is
 * never silent. Every voice is throttled so a screen of hits stays musical.
 */

const SFX_URL = (name) => `./sfx/${name}.ogg`;

const seq = (prefix, count) => Array.from({ length: count }, (_, k) => `${prefix}_${String(k).padStart(3, '0')}`);

const LASER_SMALL = seq('laser_small', 3);
const LASER_LARGE = seq('laser_large', 3);
const LASER_RETRO = seq('laser_retro', 2);
const FORCE = seq('force_field', 3);
const BOOM = seq('explosion_crunch', 3);
const LOW_BOOM = seq('low_frequency_explosion', 2);
const SLIME = seq('slime', 2);
const WHOOSH = ['thruster_fire_000'];
const STEP = seq('footstep_concrete', 5);
const GLASS = seq('impact_glass_heavy', 3);
const ROCK = seq('impact_mining', 2);
const PUNCH_HEAVY = seq('impact_punch_heavy', 2);
const PUNCH = ['impact_punch_medium_000'];
const SOFT = seq('impact_soft_medium', 3);
const WOOD = seq('impact_wood_heavy', 2);
const PLATE = ['impact_plate_heavy_000'];

const FILES = [
  ...LASER_SMALL, ...LASER_LARGE, ...LASER_RETRO, ...FORCE, ...BOOM, ...LOW_BOOM, ...SLIME, ...WHOOSH,
  ...STEP, ...GLASS, ...ROCK, ...PUNCH_HEAVY, ...PUNCH, ...SOFT, ...WOOD, ...PLATE
];

/**
 * One layer of a sound: a pool of samples, a gain, a random playback-rate
 * range (pitch), and optionally a slice (`offset`/`dur`, seconds) with a fade.
 */
const v = (samples, gain, rate = [0.95, 1.05], extra = {}) => ({ samples, gain, rate, ...extra });

/**
 * Per spell: `cast` when it fires, `impact` when it lands (or bursts), `finale`
 * for a closing detonation. Each is one layer or an array of layers.
 */
const SPELLS = {
  arcane: {
    cast: v(LASER_RETRO, 0.28, [1.15, 1.35]),
    impact: v(FORCE, 0.22, [1.6, 1.9], { dur: 0.35 })
  },
  ice: {
    cast: v(LASER_SMALL, 0.22, [0.7, 0.8]),
    impact: [v(GLASS, 0.45, [0.9, 1.1]), v(ROCK, 0.18, [1.3, 1.5])]
  },
  thunder: {
    cast: [v(LASER_LARGE, 0.34, [0.55, 0.65]), v(LOW_BOOM, 0.4, [1.2, 1.4], { dur: 0.9 })]
  },
  meteor: {
    cast: v(WHOOSH, 0.3, [0.8, 0.95], { offset: 0.3, dur: 0.7 }),
    impact: [v(BOOM, 0.55, [0.85, 1.0]), v(LOW_BOOM, 0.35, [0.9, 1.0], { dur: 1.1 })]
  },
  beam: {
    cast: v(LASER_LARGE, 0.34, [0.8, 0.9])
  },
  snare: {
    cast: v(FORCE, 0.3, [1.1, 1.25]),
    impact: v(LASER_SMALL, 0.25, [1.4, 1.7])
  },
  glacier: {
    impact: [v(GLASS, 0.5, [0.7, 0.85]), v(ROCK, 0.3, [0.8, 0.95])]
  },
  tide: {
    cast: v(SLIME, 0.4, [0.55, 0.65]),
    impact: v(WHOOSH, 0.25, [0.6, 0.7], { offset: 0.2, dur: 0.6 })
  },
  gale: {
    cast: v(WHOOSH, 0.28, [1.5, 1.8], { offset: 0.2, dur: 0.45 })
  },
  dragon: {
    cast: v(WHOOSH, 0.36, [0.75, 0.9], { offset: 0.1, dur: 0.9 }),
    impact: v(BOOM, 0.4, [1.05, 1.2])
  },
  boulder: {
    cast: v(ROCK, 0.35, [0.7, 0.8]),
    impact: [v(ROCK, 0.45, [0.55, 0.65]), v(BOOM, 0.3, [0.7, 0.8])]
  },
  venom: {
    cast: v(SLIME, 0.3, [1.1, 1.3]),
    impact: v(SLIME, 0.45, [0.8, 0.95])
  },
  solar: {
    cast: v(LASER_LARGE, 0.32, [1.05, 1.2]),
    impact: v(BOOM, 0.42, [1.1, 1.25])
  },
  vine: {
    cast: v(WOOD, 0.4, [0.8, 0.95]),
    impact: v(WOOD, 0.3, [0.6, 0.7])
  },
  cyclone: {
    cast: v(WHOOSH, 0.34, [0.6, 0.7], { offset: 0.2, dur: 1.4 })
  },
  singularity: {
    cast: v(FORCE, 0.36, [0.5, 0.6]),
    finale: [v(LOW_BOOM, 0.6, [0.8, 0.9]), v(BOOM, 0.4, [0.6, 0.7])]
  },
  sunstrike: {
    cast: v(FORCE, 0.3, [0.8, 0.9]),
    impact: [v(LASER_LARGE, 0.4, [0.45, 0.55]), v(BOOM, 0.5, [0.8, 0.95])]
  },
  starfall: {
    cast: v(LASER_RETRO, 0.22, [1.5, 1.8]),
    impact: v(LASER_SMALL, 0.26, [1.2, 1.5])
  },
  miasma: {
    cast: v(SLIME, 0.35, [0.45, 0.55])
  },
  geyser: {
    cast: v(ROCK, 0.3, [0.6, 0.7]),
    impact: [v(BOOM, 0.5, [0.75, 0.85]), v(WHOOSH, 0.3, [0.7, 0.8], { offset: 0.4, dur: 1.0 })]
  },
  aegis: {
    cast: v(FORCE, 0.4, [0.75, 0.85])
  }
};

const MAX_VOICES = 28;

export class Sfx {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.last = new Map();
    this.buffers = new Map();
    this.voices = 0;
    this._step = 0;
    // Fetching needs no user gesture; decoding waits for the AudioContext.
    this._raw = Promise.all(
      FILES.map((name) =>
        fetch(SFX_URL(name))
          .then((r) => (r.ok ? r.arrayBuffer() : null))
          .then((data) => [name, data])
          .catch(() => [name, null])
      )
    );
  }

  /** Browsers only allow audio after a user gesture. */
  unlock() {
    if (this.ctx) {
      this.ctx.resume?.();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    // A gentle limiter: a boss slam over a dozen spells should not clip.
    const limiter = this.ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 8;
    limiter.ratio.value = 6;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.2;
    limiter.connect(this.ctx.destination);
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(limiter);
    const len = this.ctx.sampleRate * 0.5;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this._decode();
  }

  async _decode() {
    const files = await this._raw;
    await Promise.all(
      files.map(async ([name, data]) => {
        if (!data) return;
        try {
          this.buffers.set(name, await this.ctx.decodeAudioData(data));
        } catch {
          /* unsupported codec: that voice stays synthesised */
        }
      })
    );
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  _ok(key, gap) {
    if (!this.ctx || this.muted) return false;
    const now = this.ctx.currentTime;
    if (now - (this.last.get(key) ?? -1) < gap) return false;
    this.last.set(key, now);
    return true;
  }

  /* ---- samples ---- */

  /** @returns {boolean} false when no layer could play (samples not ready). */
  _play(layers, delay = 0) {
    let played = false;
    for (const layer of Array.isArray(layers) ? layers : [layers]) {
      if (this.voices >= MAX_VOICES) break;
      const name = layer.samples[(Math.random() * layer.samples.length) | 0];
      const buffer = this.buffers.get(name);
      if (!buffer) continue;
      const c = this.ctx;
      const t = c.currentTime + delay;
      const src = c.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = layer.rate[0] + Math.random() * (layer.rate[1] - layer.rate[0]);
      const g = c.createGain();
      g.gain.setValueAtTime(layer.gain, t);
      const offset = Math.min(layer.offset ?? 0, buffer.duration * 0.9);
      src.connect(g).connect(this.master);
      src.start(t, offset);
      if (layer.dur) {
        g.gain.setValueAtTime(layer.gain, t + layer.dur * 0.55);
        g.gain.exponentialRampToValueAtTime(0.0001, t + layer.dur);
        src.stop(t + layer.dur + 0.02);
      }
      this.voices++;
      src.onended = () => {
        this.voices--;
        src.disconnect();
        g.disconnect();
      };
      played = true;
    }
    return played;
  }

  /* ---- synthesis ---- */

  _tone(freq, dur, { type = 'sine', gain = 0.2, slide = 1, delay = 0 } = {}) {
    const c = this.ctx;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  _noise(dur, { freq = 1200, q = 1, gain = 0.2, type = 'bandpass', slide = 1 } = {}) {
    const c = this.ctx;
    const t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.master);
    s.start(t);
    s.stop(t + dur + 0.02);
  }

  /* ---- spells ---- */

  /** A spell fires. `kind` ('zone' | 'line') picks the fallback voice. */
  spell(element, kind) {
    if (!this._ok(`cast:${element}`, 0.12)) return;
    const layers = SPELLS[element]?.cast;
    if (layers && this._play(layers)) return;
    if (!this._ok('cast', 0.09)) return;
    if (kind === 'zone') this._noise(0.35, { freq: 400, slide: 3, gain: 0.12 });
    else this._noise(0.22, { freq: 2400, slide: 0.4, gain: 0.1, q: 2 });
  }

  /** A spell lands, bursts or erupts. */
  spellImpact(element) {
    const layers = SPELLS[element]?.impact;
    if (!layers || !this._ok(`impact:${element}`, 0.1)) return;
    this._play(layers);
  }

  /** A spell's closing detonation (Singularity's implosion). */
  spellFinale(element) {
    const layers = SPELLS[element]?.finale ?? SPELLS[element]?.impact;
    if (!layers || !this._ok(`finale:${element}`, 0.2)) return;
    this._play(layers);
  }

  /* ---- combat ---- */

  hit() {
    if (!this._ok('hit', 0.07)) return;
    this._play(v(PUNCH, 0.1, [1.3, 1.7]));
  }

  kill() {
    if (!this._ok('kill', 0.05)) return;
    if (this._play(v(SOFT, 0.26, [0.75, 1.05]))) return;
    this._tone(220 + Math.random() * 80, 0.08, { type: 'triangle', gain: 0.06, slide: 0.5 });
  }

  hurt() {
    if (!this._ok('hurt', 0.15)) return;
    if (this._play(v(PUNCH_HEAVY, 0.5, [0.85, 1.0]))) return;
    this._tone(160, 0.18, { type: 'sawtooth', gain: 0.12, slide: 0.5 });
  }

  footstep() {
    if (!this._ok('step', 0.14)) return;
    // Alternate feet a touch apart in pitch.
    this._step = 1 - this._step;
    this._play(v(STEP, 0.16, this._step ? [0.9, 0.98] : [1.0, 1.08]));
  }

  slam() {
    if (!this._ok('slam', 0.2)) return;
    if (this._play([v(LOW_BOOM, 0.7, [0.7, 0.8]), v(PLATE, 0.25, [0.5, 0.6]), v(ROCK, 0.4, [0.5, 0.6])])) return;
    this._noise(0.6, { freq: 300, type: 'lowpass', gain: 0.4, slide: 0.3 });
    this._tone(60, 0.5, { type: 'sine', gain: 0.35, slide: 0.5 });
  }

  /* ---- synthesised UI and pickups ---- */

  gem(combo) {
    if (!this._ok('gem', 0.03)) return;
    const step = Math.min(combo, 24);
    this._tone(660 * Math.pow(2, step / 24), 0.07, { type: 'sine', gain: 0.07 });
  }

  levelUp() {
    if (!this._ok('lvl', 0.2)) return;
    [523, 659, 784, 1046].forEach((f, k) => this._tone(f, 0.25, { type: 'triangle', gain: 0.12, delay: k * 0.07 }));
  }

  heal() {
    if (!this._ok('heal', 0.1)) return;
    this._tone(440, 0.3, { type: 'sine', gain: 0.12, slide: 2 });
  }

  magnet() {
    if (!this._ok('mag', 0.1)) return;
    this._tone(300, 0.5, { type: 'sine', gain: 0.12, slide: 3 });
  }

  chest() {
    if (!this._ok('chest', 0.2)) return;
    [392, 523, 659, 784, 988, 1175].forEach((f, k) => this._tone(f, 0.3, { type: 'square', gain: 0.05, delay: k * 0.06 }));
  }

  warn() {
    if (!this._ok('warn', 0.3)) return;
    this._tone(110, 0.5, { type: 'sawtooth', gain: 0.08, slide: 1.5 });
  }

  boss() {
    if (!this._ok('boss', 1)) return;
    [98, 92, 87].forEach((f, k) => this._tone(f, 0.7, { type: 'sawtooth', gain: 0.1, delay: k * 0.35 }));
  }

  click() {
    if (!this._ok('click', 0.05)) return;
    this._tone(880, 0.05, { type: 'square', gain: 0.05 });
  }
}
