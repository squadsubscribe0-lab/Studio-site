import { cast, look, layer, light, impact, BURST } from './helpers.js';

/**
 * SOLAR — Solar Lance. A spear of sunlight wrapped in spinning rings is
 * hurled down the line; it lodges in the floor, a sun sigil burns open around
 * it and a pillar of light erupts.
 */
export const solar = {
  ...cast({ range: 20, minRange: 3, speed: 34, lifetime: 1.5, fadeTime: 0.8, cooldown: 0.8, castAnim: 'cast2' }),

  /* --- the spear --- */
  spearLength: 2.4,
  spearWidth: 0.17,
  height: 1.4,
  rings: 3, // max 5
  ringRadius: 0.42,
  ringWidth: 0.05,
  ringSpacing: 0.55, // metres between rings along the shaft
  ringSpin: 9,
  stickAngle: 0.55, // radians from vertical when lodged
  sink: 0.55, // metres buried

  /* --- the eruption --- */
  pillarRadius: 0.95,
  pillarHeight: 10,
  pillarRise: 0.22, // seconds
  pillarStreaks: 14,
  pillarFlow: 3.5,
  glyphRadius: 2.8,
  glyphSpin: 0.35,
  glyphRays: 12,

  ...look({ colorA: '#fffbea', colorB: '#ffcf4a', colorC: '#ff7a18', glow: 1.5 }),

  ...layer('sparks', { rate: 110, size: 0.07, speed: 5, lifetime: 0.7, gravity: -7, turbulence: 0.1, colors: ['#ffffff', '#ffe89a', '#ffb230', '#401804'] }),
  ...layer('motes', { rate: 70, size: 0.09, speed: 2.2, lifetime: 1.6, gravity: 1.2, turbulence: 0.7, colors: ['#fffbea', '#ffe07a', '#ffa030', '#301004'] }),
  ...layer('flares', { rate: 18, size: 1.4, speed: 0.4, lifetime: 0.7, gravity: 0.5, turbulence: 0.3, opacity: 0.35, colors: ['#fff6d0', '#ffcf4a', '#ff8a18', '#200800'] }),

  ...light('#ffcf6a', 12, 14, 0.15, 10),
  ...impact({
    burstMode: BURST.fire, burstSize: 3.4, burstIntensity: 1.2, burstLife: 0.6, shockRadius: 6.5, impactShake: 0.5, impactFlash: 0.2,
    colorBurstA: '#ff7a18', colorBurstB: '#ffcf4a', colorBurstC: '#fffbea',
    colorShockA: '#ffcf4a', colorShockB: '#fffbea', colorFlash: '#fff0c0'
  })
};
