import { cast, look, layer, light, impact, BURST } from './helpers.js';

/**
 * DRAGON — Dragon Coil. Braided fire serpents race down the line, then coil
 * up into a spiralling pillar at the target before bursting.
 */
export const dragon = {
  ...cast({ range: 17, minRange: 3, speed: 15, lifetime: 1.3, fadeTime: 0.8, cooldown: 0.6, castAnim: 'cast2' }),

  /* --- the serpents --- */
  strands: 3, // braided bodies (max 5)
  bodyLength: 7, // metres of body behind the head
  bodyWidth: 0.5,
  headSize: 1.0, // half-width at the head
  height: 1.2, // flight height
  coilRadius: 0.75, // radius of the braid
  twist: 1.3, // radians of braid per metre
  undulate: 0.55, // lateral slither, metres
  undulateSpeed: 5,
  riseHeight: 5.5, // height of the pillar at the target
  riseRadius: 1.4,
  riseTurns: 2.2,
  coilTime: 0.55, // seconds to wind up into the pillar
  spinSpeed: 3.2, // radians/second the pillar turns

  ...look({ colorA: '#fff4c9', colorB: '#ff8a1f', colorC: '#a3130a', glow: 1.6, opacity: 1 }),
  flameSpeed: 2.6,
  flameScale: 1.0,
  flameEdge: 0.45, // how much the noise eats into the body outline

  ...layer('embers', { rate: 160, size: 0.07, speed: 1.6, lifetime: 1.4, gravity: 1.2, turbulence: 1.1, colors: ['#fff3c4', '#ffb347', '#ff5a1f', '#3a0a04'] }),
  ...layer('smoke', { rate: 36, size: 1.3, speed: 1.0, lifetime: 2.2, gravity: 0.8, turbulence: 0.6, opacity: 0.35, colors: ['#3a2a22', '#241a16', '#15100e', '#0a0808'] }),
  ...layer('sparks', { rate: 60, size: 0.06, speed: 6, lifetime: 0.6, gravity: -8, turbulence: 0.1, colors: ['#ffffff', '#ffd27a', '#ff7a1f', '#401004'] }),

  scorchRate: 1.3, // burns per metre of travel
  scorchRadius: 1.1,

  ...light('#ff8a3a', 11, 13, 0.35, 14),
  ...impact({
    burstMode: BURST.fire, burstSize: 4.2, burstIntensity: 1.1, burstLife: 0.9, shockRadius: 7, impactShake: 0.55, impactFlash: 0.14, rumble: 0.04,
    colorBurstA: '#ff5a1f', colorBurstB: '#ffb347', colorBurstC: '#fff3c4',
    colorShockA: '#ff7a1f', colorShockB: '#fff3c4', colorFlash: '#ffcf8a'
  })
};
