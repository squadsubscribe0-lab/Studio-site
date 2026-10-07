// Audio.
//
// Everything here is synthesised in WebAudio at runtime: sound effects, the
// crowd, and the background music. That is deliberate — the game ships with no
// audio files at all, weighs nothing extra, and can never be silent because an
// asset failed to download. If you later drop a real mp3 into assets/sfx/ with
// a matching name it is used instead of the synth for that one cue.
//
// Three gain stages: master -> (music | sfx) -> destination, so the music can
// duck under a big moment without touching the effects, and the platform mute
// (CrazyGames settings) can kill everything at the top.

import { AUDIO, OVERRIDES } from '../config.js';

const FILES = {
  hit: 'assets/sfx/hit.mp3',
  spike: 'assets/sfx/spike.mp3',
  jump: 'assets/sfx/jump.mp3',
  whistle: 'assets/sfx/whistle.mp3',
  point: 'assets/sfx/point.mp3',
  crowd: 'assets/sfx/crowd.mp3'
};

// ---------------------------------------------------------------- music data
// Scale degrees over a I-V-vi-IV style loop. Written as semitone offsets from
// the track root so a track can be transposed by changing one number.
const TRACKS = {
  menu: {
    bpm: 96, root: 57,                       // A3
    chords: [[0, 4, 7], [-3, 2, 5], [5, 9, 12], [-5, 0, 4]],
    arp: [0, 7, 12, 16, 12, 7, 12, 4],
    drums: 'soft',
    lead: [null, 12, 14, 16, null, 14, 12, null],
    swing: 0.12
  },
  match: {
    bpm: 128, root: 55,                      // G3
    chords: [[0, 3, 7], [5, 8, 12], [-2, 3, 7], [3, 7, 10]],
    arp: [0, 7, 12, 15, 19, 15, 12, 7],
    drums: 'driving',
    lead: [0, null, 3, 5, 7, null, 5, 3],
    swing: 0
  },
  tense: {
    bpm: 142, root: 53,
    chords: [[0, 3, 7], [-1, 2, 6], [0, 3, 7], [-2, 1, 5]],
    arp: [0, 3, 7, 10, 12, 10, 7, 3],
    drums: 'driving',
    lead: [0, 3, null, 7, null, 10, 7, 3],
    swing: 0
  }
};

const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

class AudioSystem {
  constructor() {
    this.muted = false;
    this.platformMuted = false;
    this.buffers = new Map();
    this.ctx = null;
    this.volumes = { master: AUDIO.master, sfx: AUDIO.sfx, music: AUDIO.music };
    this.currentTrack = null;
    this.musicTimer = null;
    this.step = 0;
    this.nextNoteTime = 0;
    this.noiseBuffer = null;
    this.crowdNode = null;
    this.crowdGain = null;
    this.duckUntil = 0;
  }

  // ------------------------------------------------------------------ setup
  async load() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();

    this.master = this.ctx.createGain();
    this.master.gain.value = this.volumes.master;
    this.master.connect(this.ctx.destination);

    // A gentle limiter keeps a fireball + crowd + music from clipping.
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -10;
    this.limiter.ratio.value = 12;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.25;
    this.limiter.connect(this.master);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.volumes.sfx;
    this.sfxBus.connect(this.limiter);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.volumes.music;
    this.musicBus.connect(this.limiter);

    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(1.6, 2.4);
    this.reverbSend = this.ctx.createGain();
    this.reverbSend.gain.value = 0.22;
    this.reverbSend.connect(this.reverb);
    this.reverb.connect(this.limiter);

    this.noiseBuffer = this.makeNoise(2);
    this.startCrowdBed();

    // Optional real files, and only the ones config says are actually there.
    // Anything not listed stays synthesised.
    await Promise.all(OVERRIDES.sfx.map(async (key) => {
      const url = FILES[key] || `assets/sfx/${key}.mp3`;
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        this.buffers.set(key, await this.ctx.decodeAudioData(buf));
      } catch (e) {
        console.warn('[audio] could not load override', url, '- using the synth');
      }
    }));
  }

  makeNoise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Cheap synthetic room: exponentially decaying noise. */
  makeImpulse(seconds, decay) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  get isMuted() { return this.muted || this.platformMuted; }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  setVolume(which, value) {
    this.volumes[which] = value;
    if (!this.ctx) return;
    const bus = which === 'music' ? this.musicBus : which === 'sfx' ? this.sfxBus : this.master;
    if (bus) bus.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
  }

  toggle() {
    this.muted = !this.muted;
    this.applyMute();
    return !this.isMuted;
  }

  applyMute() {
    if (!this.master) return;
    this.master.gain.setTargetAtTime(
      this.isMuted ? 0 : this.volumes.master, this.ctx.currentTime, 0.04
    );
  }

  // ------------------------------------------------------------- primitives
  now() { return this.ctx.currentTime; }

  env(gainNode, t, peak, attack, decay, sustain = 0) {
    const g = gainNode.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    if (sustain > 0) g.setValueAtTime(Math.max(0.0002, peak), t + attack + sustain);
    g.exponentialRampToValueAtTime(0.0001, t + attack + sustain + decay);
  }

  /** One oscillator with a pitch sweep and an envelope. */
  tone(opts) {
    if (!this.ctx || this.isMuted) return;
    const {
      freq = 440, to = null, type = 'sine', dur = 0.2, gain = 0.3,
      attack = 0.004, delay = 0, bus = this.sfxBus, detune = 0, reverb = 0
    } = opts;
    const t = this.now() + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, t);
    if (to !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    this.env(g, t, gain, attack, dur);
    osc.connect(g);
    g.connect(bus);
    if (reverb > 0) {
      const r = this.ctx.createGain();
      r.gain.value = reverb;
      g.connect(r); r.connect(this.reverbSend);
    }
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  /** Filtered noise burst — impacts, sand, whooshes, crowd swells. */
  noise(opts) {
    if (!this.ctx || this.isMuted) return;
    const {
      dur = 0.2, gain = 0.3, type = 'bandpass', freq = 1200, q = 1,
      sweepTo = null, delay = 0, bus = this.sfxBus, attack = 0.003, reverb = 0
    } = opts;
    const t = this.now() + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filt = this.ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.setValueAtTime(freq, t);
    filt.Q.value = q;
    if (sweepTo !== null) filt.frequency.exponentialRampToValueAtTime(Math.max(40, sweepTo), t + dur);
    const g = this.ctx.createGain();
    this.env(g, t, gain, attack, dur);
    src.connect(filt); filt.connect(g); g.connect(bus);
    if (reverb > 0) {
      const r = this.ctx.createGain();
      r.gain.value = reverb;
      g.connect(r); r.connect(this.reverbSend);
    }
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  // ----------------------------------------------------------- the sfx bank
  play(key, volume = 1, rate = 1) {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const buf = this.buffers.get(key);
    if (buf) {
      const src = this.ctx.createBufferSource();
      const g = this.ctx.createGain();
      src.buffer = buf;
      src.playbackRate.value = rate;
      g.gain.value = volume;
      src.connect(g); g.connect(this.sfxBus);
      src.start();
      return;
    }

    const v = volume;
    switch (key) {
      // ---- contact
      case 'hit':
        this.tone({ freq: 520 * rate, to: 190 * rate, type: 'triangle', dur: 0.09, gain: 0.30 * v });
        this.noise({ freq: 2600, sweepTo: 700, q: 0.8, dur: 0.07, gain: 0.20 * v });
        break;
      case 'spike':
        this.tone({ freq: 300 * rate, to: 70, type: 'sawtooth', dur: 0.20, gain: 0.34 * v });
        this.noise({ freq: 3400, sweepTo: 400, q: 0.7, dur: 0.22, gain: 0.30 * v, reverb: 0.3 });
        this.tone({ freq: 90, to: 45, type: 'sine', dur: 0.26, gain: 0.40 * v });
        break;
      case 'block':
        this.tone({ freq: 180, to: 90, type: 'square', dur: 0.12, gain: 0.26 * v });
        this.noise({ freq: 900, sweepTo: 300, dur: 0.14, gain: 0.22 * v });
        break;
      case 'net':
        this.noise({ freq: 1500, sweepTo: 600, q: 3, dur: 0.18, gain: 0.18 * v });
        break;
      case 'wall':
        this.tone({ freq: 260, to: 150, type: 'triangle', dur: 0.08, gain: 0.16 * v });
        break;

      // ---- movement
      case 'jump':
        this.tone({ freq: 340 * rate, to: 660 * rate, type: 'sine', dur: 0.12, gain: 0.18 * v });
        this.noise({ freq: 700, sweepTo: 1800, dur: 0.10, gain: 0.10 * v });
        break;
      case 'land':
        this.noise({ freq: 480, sweepTo: 160, q: 0.6, dur: 0.16, gain: 0.20 * v });
        break;
      case 'dive':
        this.noise({ freq: 1200, sweepTo: 200, q: 0.5, dur: 0.34, gain: 0.26 * v });
        this.tone({ freq: 160, to: 70, type: 'sine', dur: 0.3, gain: 0.16 * v });
        break;

      // ---- powers
      case 'orb':                       // an orb appears
        this.tone({ freq: 900, to: 1500, type: 'sine', dur: 0.28, gain: 0.14 * v, reverb: 0.5 });
        this.tone({ freq: 1350, to: 2250, type: 'sine', dur: 0.28, gain: 0.09 * v, delay: 0.05 });
        break;
      case 'pickup':                    // ball smashes through an orb
        for (let i = 0; i < 4; i++) {
          this.tone({ freq: 660 * Math.pow(1.26, i), type: 'triangle', to: 1320 * Math.pow(1.26, i), dur: 0.12, gain: 0.16 * v, delay: i * 0.045, reverb: 0.4 });
        }
        break;
      case 'fire':
        this.noise({ freq: 300, sweepTo: 4200, q: 0.4, dur: 0.5, gain: 0.34 * v, reverb: 0.4 });
        this.tone({ freq: 140, to: 900, type: 'sawtooth', dur: 0.35, gain: 0.26 * v });
        this.tone({ freq: 70, to: 40, type: 'sine', dur: 0.6, gain: 0.42 * v });
        break;
      case 'ice':
        for (let i = 0; i < 5; i++) {
          this.tone({ freq: 2400 + i * 700, to: 1800 + i * 500, type: 'sine', dur: 0.3, gain: 0.10 * v, delay: i * 0.03, reverb: 0.6 });
        }
        this.noise({ freq: 6000, sweepTo: 1200, q: 2, dur: 0.5, gain: 0.16 * v, reverb: 0.5 });
        break;
      case 'freeze':
        this.tone({ freq: 1800, to: 240, type: 'sine', dur: 0.45, gain: 0.22 * v, reverb: 0.4 });
        this.noise({ freq: 3000, sweepTo: 400, q: 1.5, dur: 0.4, gain: 0.14 * v });
        break;
      case 'shatter':
        for (let i = 0; i < 7; i++) {
          this.noise({ freq: 2500 + Math.random() * 4000, q: 6, dur: 0.12, gain: 0.13 * v, delay: i * 0.028 });
        }
        break;
      case 'multi':
        for (let i = 0; i < 3; i++) {
          this.tone({ freq: 440 * (i + 1), to: 880 * (i + 1), type: 'square', dur: 0.16, gain: 0.12 * v, delay: i * 0.07 });
        }
        this.noise({ freq: 1800, sweepTo: 5000, dur: 0.3, gain: 0.14 * v, reverb: 0.4 });
        break;
      case 'burn':
        this.noise({ freq: 1800, sweepTo: 300, q: 0.6, dur: 0.4, gain: 0.22 * v });
        break;
      case 'poof':
        this.noise({ freq: 2200, sweepTo: 500, dur: 0.2, gain: 0.14 * v });
        break;

      // ---- match flow
      case 'whistle':
        this.tone({ freq: 1750 * rate, to: 2050 * rate, type: 'square', dur: 0.18, gain: 0.13 * v, reverb: 0.3 });
        this.tone({ freq: 2100 * rate, to: 2400 * rate, type: 'square', dur: 0.18, gain: 0.07 * v, detune: 12 });
        break;
      case 'point':
        [0, 4, 7, 12].forEach((s, i) => this.tone({
          freq: midiToHz(72 + s), type: 'triangle', dur: 0.34, gain: 0.20 * v,
          delay: i * 0.07, reverb: 0.5
        }));
        break;
      case 'lost':
        [0, -2, -5].forEach((s, i) => this.tone({
          freq: midiToHz(64 + s), type: 'triangle', dur: 0.3, gain: 0.18 * v, delay: i * 0.11
        }));
        break;
      case 'win':
        [0, 4, 7, 12, 16, 19].forEach((s, i) => this.tone({
          freq: midiToHz(60 + s), type: 'triangle', dur: 0.5, gain: 0.20 * v,
          delay: i * 0.09, reverb: 0.6
        }));
        break;
      case 'crowd':
        this.swellCrowd(0.9 * v, 1.1);
        break;
      case 'click':
        this.tone({ freq: 900, to: 1400, type: 'square', dur: 0.05, gain: 0.13 * v });
        break;
      case 'ui':
        this.tone({ freq: 600, to: 900, type: 'triangle', dur: 0.07, gain: 0.12 * v });
        break;
      default:
        this.tone({ freq: 440, to: 300, dur: 0.1, gain: 0.15 * v });
    }
  }

  // ------------------------------------------------------------- the crowd
  /** A permanent low murmur that swells on big moments. */
  startCrowdBed() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 700;
    filt.Q.value = 0.6;
    const g = this.ctx.createGain();
    g.gain.value = 0.012;
    src.connect(filt); filt.connect(g); g.connect(this.sfxBus);
    src.start();
    this.crowdNode = src;
    this.crowdGain = g;
  }

  swellCrowd(amount = 1, seconds = 1) {
    if (!this.crowdGain || this.isMuted) return;
    const t = this.now();
    const g = this.crowdGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0.09 * amount, t + 0.12);
    g.exponentialRampToValueAtTime(0.012, t + seconds);
    // A cheering crowd is mostly high-mid noise, so open the filter with it.
    this.noise({ freq: 1400, sweepTo: 800, q: 0.5, dur: seconds, gain: 0.10 * amount, reverb: 0.7 });
  }

  /** Pull the music down for a moment so a big cue lands. */
  duck(seconds = 1.2, amount = 0.35) {
    if (!this.musicBus || !AUDIO.duckOnPoint) return;
    const t = this.now();
    const g = this.musicBus.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(this.volumes.music * amount, t + 0.08);
    g.linearRampToValueAtTime(this.volumes.music, t + seconds);
  }

  // ------------------------------------------------------------- the music
  playMusic(name) {
    if (!this.ctx || this.currentTrack === name) return;
    this.stopMusic();
    const track = TRACKS[name];
    if (!track) return;
    this.currentTrack = name;
    this.track = track;
    this.step = 0;
    this.nextNoteTime = this.now() + 0.08;
    // 16th notes, scheduled a quarter-second ahead so timing survives a busy
    // main thread. The interval only queues; WebAudio does the actual timing.
    this.musicTimer = setInterval(() => this.scheduleMusic(), 40);
  }

  stopMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.currentTrack = null;
  }

  scheduleMusic() {
    if (!this.ctx || !this.track) return;
    if (this.ctx.state === 'suspended') return;
    const spb = 60 / this.track.bpm;
    const sixteenth = spb / 4;
    while (this.nextNoteTime < this.now() + 0.25) {
      this.emitStep(this.step, this.nextNoteTime);
      this.step = (this.step + 1) % 64;
      const swung = (this.step % 2 === 1) ? this.track.swing * sixteenth : 0;
      this.nextNoteTime += sixteenth + swung;
    }
  }

  emitStep(step, t) {
    const tr = this.track;
    const bar = Math.floor(step / 16) % tr.chords.length;
    const chord = tr.chords[bar];
    const beat = step % 16;
    const M = this.musicBus;

    // ---- drums
    const driving = tr.drums === 'driving';
    if (beat === 0 || beat === 8 || (driving && beat === 6)) this.kick(t);
    if (beat === 4 || beat === 12) this.snare(t, driving ? 0.16 : 0.10);
    if (beat % 2 === 0) this.hat(t, beat % 4 === 0 ? 0.035 : 0.020);
    if (driving && beat === 14 && bar === tr.chords.length - 1) this.snare(t + 0.06, 0.13);

    // ---- bass on the chord root
    if (beat % 4 === 0) {
      const n = tr.root - 12 + chord[0];
      this.voice({
        freq: midiToHz(n), type: 'sawtooth', dur: 0.24, gain: 0.16,
        t, bus: M, filter: 420, q: 6
      });
    }

    // ---- arpeggio / pad
    const arpNote = tr.arp[step % tr.arp.length];
    if (arpNote !== null && step % 2 === 0) {
      this.voice({
        freq: midiToHz(tr.root + chord[0] + arpNote), type: 'triangle',
        dur: 0.22, gain: 0.055, t, bus: M, filter: 2600, q: 1, reverb: 0.35
      });
    }

    // ---- pad chord, once a bar
    if (beat === 0) {
      chord.forEach((s, i) => this.voice({
        freq: midiToHz(tr.root + s), type: 'sine', dur: 1.5, gain: 0.035,
        t, bus: M, filter: 1400, q: 0.7, attack: 0.12, reverb: 0.5, detune: i * 4
      }));
    }

    // ---- lead answer in the second half of each bar
    const leadNote = tr.lead[(step / 2) % tr.lead.length | 0];
    if (leadNote !== null && beat >= 8 && step % 4 === 0) {
      this.voice({
        freq: midiToHz(tr.root + 12 + chord[0] + leadNote), type: 'square',
        dur: 0.18, gain: 0.045, t, bus: M, filter: 3200, q: 2, reverb: 0.4
      });
    }
  }

  /** A filtered, enveloped oscillator scheduled at an absolute time. */
  voice({ freq, type, dur, gain, t, bus, filter = 4000, q = 1, attack = 0.006, reverb = 0, detune = 0 }) {
    const osc = this.ctx.createOscillator();
    const filt = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    filt.type = 'lowpass';
    filt.frequency.value = filter;
    filt.Q.value = q;
    this.env(g, t, gain, attack, dur);
    osc.connect(filt); filt.connect(g); g.connect(bus);
    if (reverb > 0) {
      const r = this.ctx.createGain();
      r.gain.value = reverb * 0.5;
      g.connect(r); r.connect(this.reverbSend);
    }
    osc.start(t);
    osc.stop(t + dur + attack + 0.1);
  }

  kick(t) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.13);
    this.env(g, t, 0.34, 0.002, 0.16);
    osc.connect(g); g.connect(this.musicBus);
    osc.start(t); osc.stop(t + 0.25);
  }

  snare(t, gain = 0.14) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 1400;
    const g = this.ctx.createGain();
    this.env(g, t, gain, 0.002, 0.13);
    src.connect(filt); filt.connect(g); g.connect(this.musicBus);
    const r = this.ctx.createGain();
    r.gain.value = 0.25; g.connect(r); r.connect(this.reverbSend);
    src.start(t); src.stop(t + 0.2);
  }

  hat(t, gain = 0.03) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 7000;
    const g = this.ctx.createGain();
    this.env(g, t, gain, 0.001, 0.045);
    src.connect(filt); filt.connect(g); g.connect(this.musicBus);
    src.start(t); src.stop(t + 0.1);
  }
}

export const audio = new AudioSystem();
