import { cast, look, layer, light, impact, BURST } from './helpers.js';

/**
 * ARCANE — Arcane Missiles. A salvo of rune-orbs spirals out and converges on
 * the target, each trailing a ribbon of light.
 */
export const arcane = {
  ...cast({ range: 22, minRange: 3, speed: 20, lifetime: 0.7, fadeTime: 0.5, cooldown: 0.8, castAnim: 'cast2' }),

  missiles: 6, // max 10
  stagger: 0.09,
  height: 1.3, // launch height, sinks toward the target
  weave: 1.5, // lateral spiral amplitude
  lift: 1.1, // vertical spiral amplitude
  waves: 0.9, // spiral turns over the flight
  orbSize: 0.5,
  runeSpin: 3,
  trailLength: 3.4,
  trailWidth: 0.16,

  ...look({ colorA: '#f7eeff', colorB: '#b46bff', colorC: '#4b22c9', glow: 1.6 }),

  ...layer('motes', { rate: 120, size: 0.07, speed: 0.6, lifetime: 1.1, gravity: 0.3, turbulence: 0.8, colors: ['#ffffff', '#d7b0ff', '#8c4dff', '#1a0840'] }),
  ...layer('sparkle', { rate: 0, size: 0.07, speed: 6, lifetime: 0.5, gravity: -4, turbulence: 0.1, colors: ['#ffffff', '#e2c8ff', '#9d5cff', '#200a50'] }),
  ...layer('rings', { rate: 0, size: 1.4, speed: 0.1, lifetime: 0.45, gravity: 0, turbulence: 0, colors: ['#ffffff', '#c89cff', '#7a3cff', '#1a0840'] }),

  ...light('#b07bff', 7, 11, 0.2, 12),
  ...impact({
    burstMode: BURST.storm, burstSize: 1.8, burstIntensity: 1, burstLife: 0.45, shockRadius: 2.6, impactShake: 0.14, impactFlash: 0.03,
    colorBurstA: '#4b22c9', colorBurstB: '#b46bff', colorBurstC: '#ffffff',
    colorShockA: '#b46bff', colorShockB: '#ffffff', colorFlash: '#d7b0ff'
  })
};
