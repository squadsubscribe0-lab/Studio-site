import { cast, look, layer, light, impact, BURST } from './helpers.js';

/** SINGULARITY — a far cast. A black hole opens over the circle, drinks everything in, then detonates. */
export const singularity = {
  ...cast({ range: 16, minRange: 0, zoneRadius: 3.0, speed: 42, lifetime: 2.6, fadeTime: 0.9, cooldown: 1.2, castAnim: 'cast3' }),

  coreSize: 0.75,
  hoverHeight: 1.9,
  diskInner: 1.5, // × coreSize
  diskTilt: 0.35, // radians
  diskSpin: 2.4,
  diskArms: 3,
  lensSize: 3.2, // × coreSize
  growTime: 0.45,
  implodeAt: 0.55, // fraction of the fade where it collapses and detonates

  ...look({ colorA: '#fff0ff', colorB: '#a060ff', colorC: '#0b0214', glow: 1.5 }),
  voidFloor: 0.8, // darkness of the pool on the floor

  ...layer('motes', { rate: 200, size: 0.07, speed: 0, lifetime: 1.3, gravity: 0, turbulence: 0.1, swirl: 3.5, colors: ['#ffffff', '#d4b0ff', '#8a4dff', '#1a0630'] }),
  ...layer('streaks', { rate: 70, size: 0.06, speed: 5, lifetime: 0.6, gravity: 0, turbulence: 0, colors: ['#1a0630', '#8a4dff', '#e2c8ff', '#ffffff'] }),
  ...layer('debris', { rate: 30, size: 0.12, speed: 2.4, lifetime: 1.1, gravity: 0, turbulence: 0.2, colors: ['#6f655d', '#4d4540', '#3a2e44', '#120818'] }),

  ...light('#9a5cff', 8, 12, 0.3, 7),
  ...impact({
    burstMode: BURST.storm, burstSize: 5.5, burstIntensity: 1.3, burstLife: 0.8, shockRadius: 8, impactShake: 0.7, impactFlash: 0.22,
    colorBurstA: '#2a0a50', colorBurstB: '#a060ff', colorBurstC: '#ffffff',
    colorShockA: '#a060ff', colorShockB: '#fff0ff', colorFlash: '#e8d0ff'
  })
};
