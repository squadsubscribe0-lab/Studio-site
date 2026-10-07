/**
 * Builders for the kit ability settings blocks.
 *
 * These files deliberately import nothing from the rest of the project:
 * `config/settings.js` spreads them into the live `settings` object, and a
 * settings module that reached back into the ability code would create an
 * import cycle.
 */

/** Numeric ids of `BurstMode` (effects/BurstSphere.js). */
export const BURST = Object.freeze({ fire: 0, water: 1, air: 2, earth: 3, frost: 4, storm: 5 });

const cap = (key) => key[0].toUpperCase() + key.slice(1);

/** The fields every cast needs. `zoneRadius` only for far casts. */
export function cast({
  range = 16,
  minRange = 2.5,
  speed = 20,
  lifetime = 1.2,
  fadeTime = 0.8,
  cooldown = 0.5,
  castAnim = 'cast1',
  zoneRadius
} = {}) {
  const block = { range, minRange, speed, lifetime, fadeTime, cooldown, castAnim };
  if (zoneRadius !== undefined) block.zoneRadius = zoneRadius;
  return block;
}

/** Signature palette + master gains for the ability's own shaders. */
export function look({ colorA, colorB, colorC, glow = 1, opacity = 1, intensity = 1 }) {
  return { colorA, colorB, colorC, glow, opacity, intensity };
}

/**
 * One particle layer. The keys follow the convention `KitAbility` reads:
 * `<key>Rate`, `<key>Size`, … and `color<Key>A..D` (birth → death).
 */
export function layer(key, {
  rate = 0,
  size = 0.2,
  speed = 1,
  lifetime = 1,
  gravity = 0,
  turbulence = 0.3,
  opacity = 1,
  swirl,
  colors
}) {
  const C = cap(key);
  const block = {
    [`${key}Rate`]: rate,
    [`${key}Size`]: size,
    [`${key}Speed`]: speed,
    [`${key}Lifetime`]: lifetime,
    [`${key}Gravity`]: gravity,
    [`${key}Turbulence`]: turbulence,
    [`${key}Opacity`]: opacity
  };
  if (swirl !== undefined) block[`${key}Swirl`] = swirl;
  const [a, b, c, d] = colors;
  block[`color${C}A`] = a;
  block[`color${C}B`] = b;
  block[`color${C}C`] = c;
  block[`color${C}D`] = d ?? c;
  return block;
}

export function light(color, intensity = 8, radius = 12, flicker = 0.12, flickerSpeed = 9) {
  return {
    lightColor: color,
    lightIntensity: intensity,
    lightRadius: radius,
    lightFlicker: flicker,
    lightFlickerSpeed: flickerSpeed
  };
}

/** The shared impact package (see `KitAbility#impactFx`). */
export function impact({
  burstMode = BURST.air,
  burstSize = 3,
  burstIntensity = 1,
  burstLife = 0.8,
  shockRadius = 5,
  impactShake = 0.4,
  shakeDuration = 0.7,
  impactFlash = 0.1,
  rumble = 0,
  colorBurstA,
  colorBurstB,
  colorBurstC,
  colorShockA,
  colorShockB,
  colorFlash
}) {
  return {
    burstMode,
    burstSize,
    burstIntensity,
    burstLife,
    shockRadius,
    impactShake,
    shakeDuration,
    impactFlash,
    rumble,
    colorBurstA,
    colorBurstB,
    colorBurstC,
    colorShockA,
    colorShockB,
    colorFlash
  };
}
