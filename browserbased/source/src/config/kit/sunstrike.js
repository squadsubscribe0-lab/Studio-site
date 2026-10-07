import { cast, look, layer, light, impact, BURST } from './helpers.js';

/** SUNSTRIKE — a far cast. A rune circle charges on the floor, then a column of light slams down from the sky. */
export const sunstrike = {
  ...cast({ range: 18, minRange: 0, zoneRadius: 2.6, speed: 45, lifetime: 1.9, fadeTime: 0.7, cooldown: 1.2, castAnim: 'cast3' }),

  chargeTime: 0.65, // seconds the circle charges before the strike
  dropTime: 0.1, // seconds the column takes to fall
  skyHeight: 32,
  columnRadius: 0.45, // × zoneRadius
  shafts: 10, // falling light shafts around the rim during charge (max 16)
  shaftHeight: 7,
  shaftWidth: 0.1,
  runeSpin: 0.5,
  runeGlyphs: 16,
  runeGlow: 1.2,

  ...look({ colorA: '#ffffff', colorB: '#ffe27a', colorC: '#ff9a2a', glow: 1.5 }),

  ...layer('sparks', { rate: 0, size: 0.08, speed: 9, lifetime: 0.8, gravity: -10, turbulence: 0.1, colors: ['#ffffff', '#fff0a0', '#ffb040', '#401800'] }),
  ...layer('motes', { rate: 90, size: 0.08, speed: 0.5, lifetime: 1.2, gravity: -2.5, turbulence: 0.4, colors: ['#ffffff', '#fff0a0', '#ffcf4a', '#402000'] }),
  ...layer('embers', { rate: 60, size: 0.06, speed: 1.5, lifetime: 1.4, gravity: 1.4, turbulence: 0.8, colors: ['#fff7d0', '#ffcf4a', '#ff7a18', '#200800'] }),

  ...light('#ffe7a0', 14, 15, 0.1),
  ...impact({
    burstMode: BURST.fire, burstSize: 4.6, burstIntensity: 1.0, burstLife: 0.7, shockRadius: 9, impactShake: 0.9, shakeDuration: 0.8, impactFlash: 0.16,
    colorBurstA: '#ff9a2a', colorBurstB: '#ffe27a', colorBurstC: '#ffffff',
    colorShockA: '#ffe27a', colorShockB: '#ffffff', colorFlash: '#fff6d8'
  })
};
