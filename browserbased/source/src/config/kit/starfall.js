import { cast, look, layer, light, impact, BURST } from './helpers.js';

/** STARFALL — a far cast. A shower of falling stars rains into the circle, each landing on its own beat. */
export const starfall = {
  ...cast({ range: 18, minRange: 0, zoneRadius: 3.4, speed: 45, lifetime: 2.5, fadeTime: 0.6, cooldown: 1.2, castAnim: 'cast3' }),

  stars: 36, // max 80
  rainTime: 1.9, // seconds over which they are released
  fallTime: 0.32, // seconds each takes to fall
  fallHeight: 18,
  slant: 0.45, // how far off vertical they come in
  starSize: 0.32,
  tailLength: 3.2,
  fieldGlow: 0.7, // the starry disc on the floor

  ...look({ colorA: '#ffffff', colorB: '#8fb8ff', colorC: '#3a46ff', glow: 1.6 }),

  ...layer('sparks', { rate: 0, size: 0.06, speed: 5, lifetime: 0.5, gravity: -9, turbulence: 0.1, colors: ['#ffffff', '#cfe0ff', '#7a9dff', '#0a1040'] }),
  ...layer('dust', { rate: 0, size: 0.7, speed: 0.8, lifetime: 0.8, gravity: 0.3, turbulence: 0.4, opacity: 0.4, colors: ['#cfe0ff', '#7a9dff', '#3a46ff', '#050820'] }),
  ...layer('glitter', { rate: 70, size: 0.05, speed: 0.4, lifetime: 1.4, gravity: 0.4, turbulence: 0.6, colors: ['#ffffff', '#dfe8ff', '#8fb8ff', '#0a1040'] }),

  ...light('#9fc0ff', 7, 12, 0.35, 16),
  ...impact({
    burstMode: BURST.storm, burstSize: 1.3, burstIntensity: 1, burstLife: 0.35, shockRadius: 1.6, impactShake: 0.08, impactFlash: 0.02,
    colorBurstA: '#3a46ff', colorBurstB: '#8fb8ff', colorBurstC: '#ffffff',
    colorShockA: '#8fb8ff', colorShockB: '#ffffff', colorFlash: '#dfe8ff'
  })
};
