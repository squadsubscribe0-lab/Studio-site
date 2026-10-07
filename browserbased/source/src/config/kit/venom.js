import { cast, look, layer, light, impact, BURST } from './helpers.js';

/**
 * VENOM — Venom Glob. A wobbling blob of toxin is lobbed on an arc and bursts
 * into a spreading, bubbling acid pool that lingers.
 */
export const venom = {
  ...cast({ range: 16, minRange: 3, speed: 13, lifetime: 3.2, fadeTime: 1.2, cooldown: 0.8, castAnim: 'cast1' }),

  /* --- the glob --- */
  launchHeight: 1.3,
  arcHeight: 3.4,
  globSize: 0.55,
  wobble: 0.2,
  wobbleSpeed: 9,
  stretch: 0.35, // squash along the flight direction

  /* --- the pool --- */
  poolRadius: 2.7,
  poolSpread: 0.35, // seconds to reach full size
  poolEdge: 0.22, // how ragged the rim is
  bubbleScale: 3.2, // bubbles per metre
  bubbleSpeed: 1.4,
  poolGlow: 1.0,
  poolOpacity: 0.9,

  ...look({ colorA: '#e2ff8a', colorB: '#6fe11c', colorC: '#173d07', glow: 1.2, opacity: 1 }),
  fresnel: 1.5,

  ...layer('drips', { rate: 60, size: 0.12, speed: 0.8, lifetime: 0.8, gravity: -9, turbulence: 0.1, opacity: 0.95, colors: ['#e2ff8a', '#8ef034', '#4aa812', '#173d07'] }),
  ...layer('fumes', { rate: 30, size: 1.2, speed: 0.6, lifetime: 2.4, gravity: 0.6, turbulence: 0.7, opacity: 0.28, colors: ['#a6f25a', '#5fb02a', '#2e5e16', '#0c1a06'] }),
  ...layer('bubbles', { rate: 14, size: 0.35, speed: 0.05, lifetime: 0.5, gravity: 0, turbulence: 0, colors: ['#f2ffc0', '#b6ff5a', '#6fe11c', '#1e4a08'] }),

  ...light('#8cff3a', 5, 10, 0.18, 6),
  ...impact({
    burstMode: BURST.water, burstSize: 2.8, burstIntensity: 0.9, burstLife: 0.6, shockRadius: 4.2, impactShake: 0.3, impactFlash: 0.05,
    colorBurstA: '#173d07', colorBurstB: '#6fe11c', colorBurstC: '#e2ff8a',
    colorShockA: '#6fe11c', colorShockB: '#e2ff8a', colorFlash: '#c8ff7a'
  })
};
