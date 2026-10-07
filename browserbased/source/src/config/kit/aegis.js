import { cast, look, layer, light, impact, BURST } from './helpers.js';

/** AEGIS — a far cast. A hex-plated energy dome rises over the circle, rippling where it is struck, then shatters. */
export const aegis = {
  ...cast({ range: 14, minRange: 0, zoneRadius: 3.2, speed: 45, lifetime: 3.4, fadeTime: 0.8, cooldown: 1.4, castAnim: 'cast3' }),

  riseTime: 0.5,
  squash: 0.85, // dome height / radius
  hexScale: 9, // plates across the dome
  edgeWidth: 0.08, // plate borders
  fresnel: 2.2,
  fill: 0.12, // wash across the plates
  scanSpeed: 0.8, // the sweep that climbs the dome
  ripple: 1.0,
  hitRate: 1.6, // ripples per second
  shatterGlow: 2.0,

  ...look({ colorA: '#effeff', colorB: '#5fe8ff', colorC: '#1b5bd6', glow: 1.3 }),

  ...layer('motes', { rate: 60, size: 0.06, speed: 0.6, lifetime: 1.6, gravity: 0.6, turbulence: 0.5, colors: ['#ffffff', '#bff6ff', '#5fe8ff', '#061a40'] }),
  ...layer('sparks', { rate: 0, size: 0.06, speed: 4, lifetime: 0.45, gravity: -6, turbulence: 0.1, colors: ['#ffffff', '#bff6ff', '#5fe8ff', '#061a40'] }),
  ...layer('shards', { rate: 0, size: 0.18, speed: 3, lifetime: 1.0, gravity: -6, turbulence: 0.3, colors: ['#effeff', '#8ff0ff', '#3aa8ff', '#061a40'] }),

  ...light('#7fefff', 6, 12, 0.1),
  ...impact({
    burstMode: BURST.frost, burstSize: 3.4, burstIntensity: 0.8, burstLife: 0.6, shockRadius: 6, impactShake: 0.3, impactFlash: 0.06,
    colorBurstA: '#1b5bd6', colorBurstB: '#5fe8ff', colorBurstC: '#effeff',
    colorShockA: '#5fe8ff', colorShockB: '#effeff', colorFlash: '#bff6ff'
  })
};
