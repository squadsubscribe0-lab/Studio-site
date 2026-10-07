import { tide } from './tide.js';
import { gale } from './gale.js';
import { dragon } from './dragon.js';
import { boulder } from './boulder.js';
import { arcane } from './arcane.js';
import { venom } from './venom.js';
import { solar } from './solar.js';
import { vine } from './vine.js';
import { cyclone } from './cyclone.js';
import { singularity } from './singularity.js';
import { sunstrike } from './sunstrike.js';
import { starfall } from './starfall.js';
import { miasma } from './miasma.js';
import { geyser } from './geyser.js';
import { aegis } from './aegis.js';

/**
 * The kit abilities, in slot order after the original six.
 *
 * `code` is the `KeyboardEvent.code` the slot answers to; `cast: 'zone'` makes
 * it a far cast (the literal of `CastShape.ZONE`, spelled out to keep this
 * folder free of imports from `settings.js`).
 */
export const KIT_META = {
  tide: { label: 'Tidal Surge', accent: '#3fb6ff', key: 'T', code: 'KeyT', hint: 'Tidal Surge' },
  gale: { label: 'Gale Crescents', accent: '#5ff0cc', key: 'Y', code: 'KeyY', hint: 'Gale Crescents' },
  dragon: { label: 'Dragon Coil', accent: '#ff7a2a', key: 'U', code: 'KeyU', hint: 'Dragon Coil' },
  boulder: { label: 'Boulder Roll', accent: '#d08a55', key: 'I', code: 'KeyI', hint: 'Boulder Roll' },
  arcane: { label: 'Arcane Missiles', accent: '#b87bff', key: 'O', code: 'KeyO', hint: 'Arcane Missiles' },
  venom: { label: 'Venom Glob', accent: '#8ce83a', key: 'B', code: 'KeyB', hint: 'Venom Glob' },
  solar: { label: 'Solar Lance', accent: '#ffcf4a', key: 'N', code: 'KeyN', hint: 'Solar Lance' },
  vine: { label: 'Vine Lash', accent: '#6fd64a', key: 'M', code: 'KeyM', hint: 'Vine Lash' },
  cyclone: { label: 'Cyclone', accent: '#a9d8e6', key: 'Z', code: 'KeyZ', hint: 'Cyclone', cast: 'zone' },
  singularity: { label: 'Singularity', accent: '#9a5cff', key: 'J', code: 'KeyJ', hint: 'Singularity', cast: 'zone' },
  sunstrike: { label: 'Sunstrike', accent: '#ffe27a', key: 'K', code: 'KeyK', hint: 'Sunstrike', cast: 'zone' },
  starfall: { label: 'Starfall', accent: '#8fb8ff', key: 'L', code: 'KeyL', hint: 'Starfall', cast: 'zone' },
  miasma: { label: 'Miasma', accent: '#9be04a', key: 'A', code: 'KeyA', hint: 'Miasma', cast: 'zone' },
  geyser: { label: 'Lava Geyser', accent: '#ff6a2a', key: 'S', code: 'KeyS', hint: 'Lava Geyser', cast: 'zone' },
  aegis: { label: 'Aegis Dome', accent: '#5fe8ff', key: 'D', code: 'KeyD', hint: 'Aegis Dome', cast: 'zone' }
};

export const KIT_SETTINGS = { tide, gale, dragon, boulder, arcane, venom, solar, vine, cyclone, singularity, sunstrike, starfall, miasma, geyser, aegis };

export const KIT_ELEMENTS = Object.keys(KIT_META);
