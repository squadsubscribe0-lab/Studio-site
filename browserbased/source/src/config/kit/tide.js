import { cast, look, layer, light, impact, BURST } from './helpers.js';

/**
 * TIDE — Tidal Surge. A curling wall of water rolls down the line and breaks
 * at the far end. The wall is one parameter grid: `u` across the wave, `v` up
 * its profile — the skirt behind, over the crest, down into the curling lip.
 */
export const tide = {
  ...cast({ range: 18, minRange: 3, speed: 11, lifetime: 0.7, fadeTime: 1.1, cooldown: 0.6, castAnim: 'cast1' }),

  /* --- the wall (metres) --- */
  waveHeight: 2.6,
  widthNear: 1.3,
  width: 4.4,
  curl: 1.0, // how far the lip rolls over, 0 = a ramp
  backSlope: 2.6, // length of the skirt trailing the crest
  bow: 1.2, // how far the ends of the wall lag the middle
  crestNoise: 0.3,
  crestScale: 1.4,
  riseTime: 0.35, // seconds for the wall to stand up
  crash: 0.85, // fraction of height lost as it breaks
  crashPush: 2.2, // metres/second it keeps rolling after it lands

  /* --- the water --- */
  ...look({ colorA: '#062f57', colorB: '#1c9ad4', colorC: '#e9fbff', opacity: 0.88, glow: 1.0 }),
  foam: 1.0,
  foamScale: 1.0,
  fresnel: 1.6,
  caustics: 0.55,
  flowSpeed: 1.3,

  /* --- the wake on the floor --- */
  wakeLength: 7,
  wakeWidth: 0.9,
  wakeGlow: 0.6,
  rippleRate: 1.1, // ripple rings per metre of travel

  ...layer('spray', { rate: 120, size: 0.2, speed: 3.2, lifetime: 0.9, gravity: -6, turbulence: 0.4, opacity: 0.35, colors: ['#ffffff', '#d8f4ff', '#8fd3f5', '#2a6f9a'] }),
  ...layer('mist', { rate: 45, size: 1.6, speed: 0.8, lifetime: 1.8, gravity: 0.4, turbulence: 0.5, opacity: 0.22, colors: ['#e6f8ff', '#b4e4fa', '#7cc2e6', '#1b4a66'] }),
  ...layer('drops', { rate: 90, size: 0.09, speed: 5, lifetime: 1.0, gravity: -14, turbulence: 0.1, opacity: 1, colors: ['#ffffff', '#bfeaff', '#5fb9e8', '#154d73'] }),

  ...light('#5cc6ff', 6, 11, 0.08),
  ...impact({
    burstMode: BURST.water, burstSize: 3.8, burstIntensity: 0.9, shockRadius: 6.5, impactShake: 0.45, impactFlash: 0.06, rumble: 0.05,
    colorBurstA: '#1c9ad4', colorBurstB: '#9adfff', colorBurstC: '#ffffff',
    colorShockA: '#1c9ad4', colorShockB: '#e9fbff', colorFlash: '#bfeaff'
  })
};
