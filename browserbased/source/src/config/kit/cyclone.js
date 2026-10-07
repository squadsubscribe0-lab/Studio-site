import { cast, look, layer, light, impact, BURST } from './helpers.js';

/** CYCLONE — a far cast. A twisting funnel tears up out of the circle, hauling debris into orbit. */
export const cyclone = {
  ...cast({ range: 16, minRange: 0, zoneRadius: 2.4, speed: 42, lifetime: 3.2, fadeTime: 1.0, cooldown: 1.0, castAnim: 'cast3' }),

  funnelHeight: 7.5,
  baseRadius: 0.22, // × zoneRadius at the floor
  topRadius: 1.25, // × zoneRadius at the top
  flare: 1.7, // >1 keeps it narrow low down
  shells: 3, // nested walls (max 4)
  sway: 0.9, // metres the axis wanders at the top
  swayScale: 0.25,
  spinSpeed: 4.5,
  twist: 3.5, // how far the streaks wrap
  bands: 7,
  growTime: 0.55,

  ...look({ colorA: '#f1f4f2', colorB: '#a3aba6', colorC: '#3e4440', glow: 1.0, opacity: 0.8 }),

  ...layer('debris', { rate: 45, size: 0.18, speed: 1.6, lifetime: 2.4, gravity: 0, turbulence: 0.4, swirl: 4.5, colors: ['#8a7f76', '#6f655d', '#4d4540', '#2b2724'] }),
  ...layer('dust', { rate: 40, size: 1.4, speed: 0.9, lifetime: 1.8, gravity: 0.5, turbulence: 0.5, opacity: 0.3, swirl: 3.2, colors: ['#cdd8dc', '#9fb0b7', '#6b7a80', '#252c2f'] }),
  ...layer('streaks', { rate: 120, size: 0.06, speed: 2.5, lifetime: 0.9, gravity: 0, turbulence: 0.2, swirl: 6, colors: ['#ffffff', '#d8eef5', '#8fb3c2', '#1a2428'] }),

  ...light('#bfe4f2', 4, 12, 0.1),
  ...impact({
    burstMode: BURST.air, burstSize: 3.6, burstIntensity: 0.8, burstLife: 0.6, shockRadius: 5.5, impactShake: 0.35, impactFlash: 0.03, rumble: 0.08,
    colorBurstA: '#6b7a80', colorBurstB: '#cdd8dc', colorBurstC: '#ffffff',
    colorShockA: '#8fb3c2', colorShockB: '#ffffff', colorFlash: '#e6f4f8'
  })
};
