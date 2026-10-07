import { cast, look, layer, light, impact, BURST } from './helpers.js';

/** GEYSER — a far cast. The floor cracks into a lava pool and a molten column surges out of it in pulses. */
export const geyser = {
  ...cast({ range: 16, minRange: 0, zoneRadius: 2.2, speed: 40, lifetime: 3.0, fadeTime: 0.9, cooldown: 1.2, castAnim: 'cast1' }),

  buildTime: 0.5, // seconds of rumble before the eruption
  columnHeight: 8,
  columnRadius: 0.7,
  crown: 0.8, // how far the top splashes out
  surgeRate: 1.3, // surges per second
  surge: 0.35, // how much each surge swells the column
  flowSpeed: 4,
  crust: 1.0, // dark crust on the column and pool
  crackGlow: 1.4,

  ...look({ colorA: '#fff1b8', colorB: '#ff6a1a', colorC: '#2e0a04', glow: 1.4 }),

  ...layer('blobs', { rate: 40, size: 0.22, speed: 7, lifetime: 1.4, gravity: -14, turbulence: 0.1, colors: ['#fff1b8', '#ffa030', '#ff4a10', '#2e0a04'] }),
  ...layer('embers', { rate: 90, size: 0.06, speed: 2, lifetime: 1.6, gravity: 1.5, turbulence: 1.0, colors: ['#fff1b8', '#ffb050', '#ff5a1f', '#200600'] }),
  ...layer('smoke', { rate: 22, size: 2.0, speed: 1.2, lifetime: 3.0, gravity: 1.0, turbulence: 0.6, opacity: 0.4, colors: ['#3a2a24', '#231a17', '#140f0d', '#080606'] }),

  ...light('#ff7a2a', 12, 13, 0.3, 11),
  ...impact({
    burstMode: BURST.fire, burstSize: 3.2, burstIntensity: 1.1, burstLife: 0.8, shockRadius: 6, impactShake: 0.6, impactFlash: 0.12, rumble: 0.12,
    colorBurstA: '#ff4a10', colorBurstB: '#ffa030', colorBurstC: '#fff1b8',
    colorShockA: '#ff6a1a', colorShockB: '#fff1b8', colorFlash: '#ffc890'
  })
};
