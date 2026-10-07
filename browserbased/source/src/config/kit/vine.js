import { cast, look, layer, light, impact, BURST } from './helpers.js';

/**
 * VINE — Vine Lash. Thorned vines burst out of the floor and race down the
 * line in arching loops, bloom into a thicket at the target, then retract.
 */
export const vine = {
  ...cast({ range: 15, minRange: 2.5, speed: 12, lifetime: 1.6, fadeTime: 0.9, cooldown: 0.7, castAnim: 'cast3' }),

  vines: 4, // max 6
  spacing: 0.45, // metres between vines at the caster
  fanOut: 1.8, // extra spacing by the far end
  vineRadius: 0.11,
  arch: 0.75, // metres the loops rise
  archRate: 0.7, // loops per metre
  weave: 0.35,
  thorns: 70, // max 110
  thornSize: 0.26,
  bloom: 2.4, // thorn size multiplier near the target
  sapSpeed: 3,
  sapGlow: 1.2,

  ...look({ colorA: '#c9ff7a', colorB: '#3c7a28', colorC: '#1e2d12', glow: 1.0 }),

  ...layer('leaves', { rate: 35, size: 0.2, speed: 1.8, lifetime: 1.8, gravity: -1.8, turbulence: 1.0, colors: ['#9fdc5a', '#6fb23c', '#3f7d2a', '#1e2d12'] }),
  ...layer('pollen', { rate: 80, size: 0.05, speed: 0.6, lifetime: 1.8, gravity: 0.4, turbulence: 0.9, colors: ['#faffc8', '#e0ff8a', '#9fdc5a', '#1e2d12'] }),
  ...layer('dirt', { rate: 45, size: 0.1, speed: 3, lifetime: 1.0, gravity: -14, turbulence: 0.1, colors: ['#6b5540', '#4f3f30', '#3a2e24', '#1a1410'] }),

  ...light('#9dff5a', 4, 9, 0.1),
  ...impact({
    burstMode: BURST.earth, burstSize: 2.6, burstIntensity: 0.7, burstLife: 0.8, shockRadius: 4.5, impactShake: 0.35, impactFlash: 0.03, rumble: 0.05,
    colorBurstA: '#2e2a1c', colorBurstB: '#6b5f40', colorBurstC: '#c9ff7a',
    colorShockA: '#6fb23c', colorShockB: '#c9ff7a', colorFlash: '#c9ff7a'
  })
};
