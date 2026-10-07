import { cast, look, layer, light, impact, BURST } from './helpers.js';

/**
 * BOULDER — Boulder Roll. A cracked rock rolls and hops down the line, heating
 * as it goes, and shatters at the target, tearing the floor open.
 */
export const boulder = {
  ...cast({ range: 18, minRange: 3, speed: 9, lifetime: 1.0, fadeTime: 0.8, cooldown: 0.7, castAnim: 'cast1' }),

  /* --- the rock --- */
  radius: 0.95,
  bounce: 0.28, // hop height, metres
  bounceRate: 0.55, // hops per metre rolled
  lumpiness: 0.28, // silhouette, applied on the next rebuild (seed changes per cast)
  heatRamp: 1.0, // how hot the cracks get by the far end
  crackScale: 1.8, // cracks per unit radius
  crackWidth: 0.1,
  crackPulse: 0.35,

  ...look({ colorA: '#6f655d', colorB: '#ff6a1f', colorC: '#ffe0a0', glow: 1.2 }),
  ambient: 0.35,
  rim: 0.35,

  trailRate: 1.4, // cracked floor marks per metre
  fissureRadius: 3.2,
  fissureLife: 3.2,

  ...layer('dust', { rate: 70, size: 1.1, speed: 1.2, lifetime: 1.5, gravity: 0.3, turbulence: 0.6, opacity: 0.4, colors: ['#a89c8f', '#877b70', '#5c534c', '#2a2522'] }),
  ...layer('debris', { rate: 40, size: 0.16, speed: 3.5, lifetime: 1.2, gravity: -16, turbulence: 0.1, colors: ['#8a7f76', '#6f655d', '#4d4540', '#2b2724'] }),
  ...layer('embers', { rate: 50, size: 0.06, speed: 1.4, lifetime: 1.0, gravity: 0.8, turbulence: 0.9, colors: ['#ffe0a0', '#ffa040', '#ff5a1f', '#300a04'] }),

  ...light('#ff8a3a', 5, 9, 0.2),
  ...impact({
    burstMode: BURST.earth, burstSize: 4.2, burstIntensity: 1, burstLife: 1.0, shockRadius: 7.5, impactShake: 0.85, shakeDuration: 0.9, impactFlash: 0.08, rumble: 0.12,
    colorBurstA: '#5c534c', colorBurstB: '#a89c8f', colorBurstC: '#ffb060',
    colorShockA: '#ff8a3a', colorShockB: '#ffe0a0', colorFlash: '#ffcf9a'
  })
};
