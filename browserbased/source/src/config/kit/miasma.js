import { cast, look, layer, light, impact, BURST } from './helpers.js';

/** MIASMA — a far cast. A toxic pool seeps open and a churning plague cloud boils up over it. */
export const miasma = {
  ...cast({ range: 16, minRange: 0, zoneRadius: 3.2, speed: 36, lifetime: 4.0, fadeTime: 1.4, cooldown: 1.2, castAnim: 'cast1' }),

  cloudHeight: 1.9, // × zoneRadius squash of the dome
  shells: 4, // layered cloud shells (max 5)
  billow: 0.45, // how lumpy the cloud is
  billowScale: 0.8,
  churn: 0.35, // how fast it boils
  growTime: 0.9,
  cloudDensity: 0.3,
  poolEdge: 0.25,
  tendrils: 7, // creeping fingers at the pool's rim
  poolGlow: 0.8,

  ...look({ colorA: '#dcff8a', colorB: '#6ea83a', colorC: '#17240d', glow: 1.0 }),

  ...layer('fumes', { rate: 26, size: 1.5, speed: 0.5, lifetime: 2.8, gravity: 0.4, turbulence: 0.6, opacity: 0.25, colors: ['#9ed25a', '#5f8f32', '#2e4a18', '#0b1406'] }),
  ...layer('spores', { rate: 90, size: 0.06, speed: 0.5, lifetime: 2.2, gravity: 0.3, turbulence: 1.1, colors: ['#f4ffc8', '#c8ff6a', '#6ea83a', '#0b1406'] }),
  ...layer('bubbles', { rate: 18, size: 0.3, speed: 0.05, lifetime: 0.5, gravity: 0, turbulence: 0, colors: ['#e8ffb0', '#a8e05a', '#5f8f32', '#0b1406'] }),

  ...light('#a8ff5a', 4, 11, 0.15, 5),
  ...impact({
    burstMode: BURST.air, burstSize: 3.6, burstIntensity: 0.8, burstLife: 0.9, shockRadius: 5.5, impactShake: 0.25, impactFlash: 0.04,
    colorBurstA: '#17240d', colorBurstB: '#6ea83a', colorBurstC: '#dcff8a',
    colorShockA: '#6ea83a', colorShockB: '#dcff8a', colorFlash: '#c8ff8a'
  })
};
