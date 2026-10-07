/* ---------------------------------------------------------------
   Sound. Everything is synthesised in the browser, so the build stays
   tiny and there are no licence worries with music files.

   Music: slow pad chords drifting through a pentatonic progression,
   with the odd soft bell on top. Meant to sit under the game, not
   compete with it.
---------------------------------------------------------------- */

const Sound = (function () {
  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let started = false, timer = null, step = 0;
  let settings = { music: true, sfx: true };

  /* A minor pentatonic-ish drift: quiet, no strong resolution */
  const CHORDS = [
    [220.00, 329.63, 440.00],   // Am
    [196.00, 293.66, 392.00],   // G
    [174.61, 261.63, 349.23],   // F
    [196.00, 246.94, 392.00]    // Gsus
  ];
  const BELLS = [587.33, 659.25, 783.99, 880.00, 1046.50];

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = settings.music ? 0.16 : 0;
    musicGain.connect(master);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = settings.sfx ? 0.5 : 0;
    sfxGain.connect(master);
    return ctx;
  }

  function pad(freqs, at, len) {
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 900;
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 4;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.18, at + len * 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      osc.connect(filt); filt.connect(g); g.connect(musicGain);
      osc.start(at); osc.stop(at + len + 0.1);
    });
  }

  function bell(freq, at, vol) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 2.2);
    osc.connect(g); g.connect(musicGain);
    osc.start(at); osc.stop(at + 2.3);
  }

  function tick() {
    if (!ctx) return;
    const at = ctx.currentTime + 0.05;
    pad(CHORDS[step % CHORDS.length], at, 5.2);
    if (Math.random() < 0.7) {
      bell(BELLS[(Math.random() * BELLS.length) | 0], at + Math.random() * 3, 0.07);
    }
    step++;
  }

  function startMusic() {
    if (!ensure() || timer) return;
    if (ctx.state === 'suspended') ctx.resume();
    started = true;
    tick();
    timer = setInterval(tick, 4600);
  }

  function stopMusic() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* --- effects --- */

  function blip(type, freq, len, vol, sweepTo) {
    if (!ensure() || !settings.sfx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const at = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, at + len);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    osc.connect(g); g.connect(sfxGain);
    osc.start(at); osc.stop(at + len + 0.05);
  }

  const api = {
    unlock() { if (ensure() && ctx.state === 'suspended') ctx.resume(); },

    applySettings(s) {
      settings = Object.assign(settings, s);
      if (ctx) {
        musicGain.gain.value = settings.music ? 0.16 : 0;
        sfxGain.gain.value = settings.sfx ? 0.5 : 0;
      }
      if (settings.music) { api.unlock(); startMusic(); } else stopMusic();
    },

    duck(on) {                       // quiet down while an ad plays
      if (master) master.gain.value = on ? 0 : 0.9;
    },

    mark()   { blip('sine', 520, 0.07, 0.12); },
    unmark() { blip('sine', 380, 0.06, 0.09); },
    place()  { blip('triangle', 700, 0.18, 0.16, 1180); },   // little chirp
    error()  { blip('sawtooth', 190, 0.22, 0.10, 120); },
    hint()   { blip('sine', 880, 0.3, 0.12, 1320); },

    win() {
      if (!ensure() || !settings.sfx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        setTimeout(() => blip('triangle', f, 0.35, 0.16, f * 1.02), i * 110));
    },

    startMusicIfWanted() { if (settings.music) startMusic(); },
    isRunning() { return started; }
  };

  return api;
})();
