import { cast, look, layer, light, impact, BURST } from './helpers.js';

/**
 * GALE — Gale Crescents. A volley of wind blades flung down the line one after
 * another, each a crescent that rolls as it flies and tears apart on arrival.
 */
export const gale = {
  ...cast({ range: 20, minRange: 2, speed: 30, lifetime: 0.6, fadeTime: 0.45, cooldown: 0.5, castAnim: 'cast2' }),

  /* --- the volley --- */
  blades: 5, // crescents per cast (max 9)
  stagger: 0.075, // seconds between launches
  bladeRadius: 1.25, // metres, at launch
  grow: 1.7, // radius multiplier by the far end
  arc: 2.3, // radians the crescent spans
  thickness: 0.34, // metres at the belly
  height: 1.1, // flight height
  weave: 0.9, // metres the blades swing left/right mid-flight
  roll: 0.35, // base roll of the crescent, radians
  rollJitter: 1.2,
  spin: 2.2, // radians/second of roll in flight
  burstSpread: 1.6, // how much a blade widens as it tears apart

  ...look({ colorA: '#dffff4', colorB: '#44d8b6', colorC: '#ffffff', glow: 1.3, opacity: 1 }),
  streaks: 0.45, // wind streaks running through the blade
  streakSpeed: 7,

  ...layer('gust', { rate: 220, size: 0.09, speed: 4, lifetime: 0.45, gravity: 0, turbulence: 0.2, colors: ['#ffffff', '#b8ffea', '#44d8b6', '#0b3b33'] }),
  ...layer('leaves', { rate: 26, size: 0.22, speed: 3.2, lifetime: 1.6, gravity: -2.2, turbulence: 1.2, opacity: 1, colors: ['#b5e36a', '#7fc24a', '#4e8a2f', '#2b4a1d'] }),
  ...layer('dust', { rate: 20, size: 1.1, speed: 1.4, lifetime: 1.2, gravity: 0.2, turbulence: 0.6, opacity: 0.18, colors: ['#d9e8e2', '#b6c9c2', '#7f948d', '#2b3533'] }),

  ...light('#7fffe0', 4, 9, 0.1),
  ...impact({
    burstMode: BURST.air, burstSize: 3.2, burstIntensity: 0.9, burstLife: 0.5, shockRadius: 5, impactShake: 0.3, impactFlash: 0.04,
    colorBurstA: '#44d8b6', colorBurstB: '#b8ffea', colorBurstC: '#ffffff',
    colorShockA: '#44d8b6', colorShockB: '#ffffff', colorFlash: '#dffff4'
  })
};
