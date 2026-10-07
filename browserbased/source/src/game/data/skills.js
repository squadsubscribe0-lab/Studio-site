/**
 * Dungeon.io spell book.
 *
 * Every spell is one of the sandbox VFX (`element`) plus the gameplay the
 * sandbox never had: how it picks a target, how often it fires, how hard it
 * hits and — the important part — a **hit model** that mirrors the shape the
 * effect draws, so damage lands exactly where the light does.
 *
 *   hit.type 'line'   sweeps the travelling front: anything within `width` of
 *                     the cast line is hit once as the front passes it.
 *   hit.sweep false   no sweep (lobbed spells only hurt where they land).
 *   hit.impact        one burst of that radius where the line ends.
 *   hit.hold          repeated damage while the effect lingers — along the whole
 *                     line, or in `radius` around the end if given.
 *   hit.pool          like hold, around the end, sized by `poolRadius`.
 *   hit.type 'zone'   a far cast: `burst` × damage on landing (after `delay`),
 *                     then `tick` × damage every `every` seconds while it holds.
 *   pull / slow / knock / shield modify what a hit does.
 *
 * `tune(cfg, level)` writes the VFX settings block, so a stronger spell also
 * *looks* stronger. `evolve` is the awakened form (max level + its relic).
 * Per-level arrays: index 0 = level 1.
 */

export const lv = (arr, level) => arr[Math.min(arr.length, Math.max(1, level)) - 1];

export const SKILLS = {
  arcane: {
    name: 'Arcane Missiles', element: 'arcane', target: 'nearest', range: 14,
    blurb: 'Homing rune-orbs spiral into the nearest foe.',
    cooldown: [1.7, 1.55, 1.4, 1.25, 1.05], damage: [9, 11, 14, 17, 22],
    hit: { type: 'line', width: 1.5, impact: 1.8 },
    tune: (c, l) => { c.missiles = 2 + l; c.range = 16; },
    evolve: { passive: 'focus', name: 'Arcane Barrage', damage: 1.7, tune: (c) => { c.missiles = 10; c.stagger = 0.05; c.orbSize = 0.7; } }
  },
  ice: {
    name: 'Frost Lance', element: 'ice', target: 'nearest', range: 13,
    blurb: 'Ice spikes erupt toward the nearest foe and slow it.',
    cooldown: [2.4, 2.2, 2.0, 1.8, 1.6], damage: [16, 20, 25, 31, 40],
    hit: { type: 'line', width: 1.6, impact: 2.4, slow: 0.5 },
    tune: (c, l) => { c.width = 1.8 + l * 0.25; c.range = 15; },
    evolve: { passive: 'reach', name: 'Permafrost', damage: 1.6, width: 1.5, tune: (c) => { c.width = 3.8; c.height = 4.2; } }
  },
  thunder: {
    name: 'Storm Lance', element: 'thunder', target: 'nearest', range: 18,
    blurb: 'An instant bolt that pierces everything in a long line.',
    cooldown: [2.0, 1.8, 1.6, 1.45, 1.25], damage: [14, 18, 23, 29, 37],
    hit: { type: 'line', width: 1.0, impact: 2.2 },
    tune: (c, l) => { c.strands = 8 + l * 3; c.range = 20; },
    evolve: { passive: 'haste', name: 'Tempest Spear', damage: 1.6, width: 1.6, tune: (c) => { c.strands = 24; c.spread = 1.4; } }
  },
  meteor: {
    name: 'Cinder Fall', element: 'meteor', target: 'cluster', range: 14,
    blurb: 'Lobs a burning rock onto the densest pack.',
    cooldown: [3.4, 3.1, 2.8, 2.5, 2.2], damage: [30, 38, 48, 60, 78],
    hit: { type: 'line', sweep: false, impact: 3.2, knock: 6 },
    tune: (c) => { c.range = 16; },
    evolve: { passive: 'might', name: 'Starfire Comet', damage: 1.8, impact: 1.5, tune: (c) => { c.radius = (c.radius ?? 0.8) * 1.6; } }
  },
  beam: {
    name: 'Nova Beam', element: 'beam', target: 'nearest', range: 16,
    blurb: 'A held column of light that burns all along its length.',
    cooldown: [4.2, 3.9, 3.6, 3.3, 3.0], damage: [8, 10, 13, 16, 21],
    hit: { type: 'line', width: 1.3, hold: { every: 0.25 } },
    tune: (c) => { c.range = 18; },
    evolve: { passive: 'focus', name: 'Solar Flare', damage: 1.6, width: 1.6, tune: (c) => { c.radius = (c.radius ?? 0.5) * 1.6; } }
  },
  snare: {
    name: 'Voltaic Snare', element: 'snare', target: 'cluster', range: 12,
    blurb: 'A trap that shocks and roots anything inside.',
    cooldown: [4.4, 4.1, 3.8, 3.5, 3.1], damage: [10, 12, 15, 19, 24],
    hit: { type: 'zone', burst: 1.5, tick: 0.5, every: 0.4, slow: 0.9 },
    tune: (c, l) => { c.zoneRadius = 2.2 + l * 0.3; },
    evolve: { passive: 'reach', name: 'Storm Prison', damage: 1.5, tune: (c) => { c.zoneRadius = 4.4; } }
  },
  glacier: {
    name: 'Glacial Crown', element: 'glacier', target: 'cluster', range: 12,
    blurb: 'A ring of glacier blades bursts up and freezes the area.',
    cooldown: [4.6, 4.2, 3.9, 3.6, 3.2], damage: [26, 32, 40, 50, 64],
    hit: { type: 'zone', burst: 1, delay: 0.15, slow: 0.7 },
    tune: (c, l) => { c.zoneRadius = 2.4 + l * 0.3; },
    evolve: { passive: 'vitality', name: 'Winter Throne', damage: 1.7, tune: (c) => { c.zoneRadius = 4.6; } }
  },
  tide: {
    name: 'Tidal Surge', element: 'tide', target: 'nearest', range: 13,
    blurb: 'A wall of water rolls forward and shoves enemies back.',
    cooldown: [3.6, 3.3, 3.0, 2.7, 2.4], damage: [14, 18, 22, 28, 36],
    hit: { type: 'line', width: 2.6, knock: 9, impact: 2.8 },
    tune: (c, l) => { c.width = 3.6 + l * 0.3; c.waveHeight = 2.2 + l * 0.15; c.range = 15; },
    evolve: { passive: 'reach', name: 'Leviathan Tide', damage: 1.6, width: 1.4, tune: (c) => { c.width = 6.5; c.waveHeight = 3.6; } }
  },
  gale: {
    name: 'Gale Crescents', element: 'gale', target: 'nearest', range: 15,
    blurb: 'A volley of wind blades slices down the line.',
    cooldown: [1.9, 1.75, 1.6, 1.45, 1.25], damage: [8, 10, 12, 15, 19],
    hit: { type: 'line', width: 1.6 },
    tune: (c, l) => { c.blades = 2 + l; c.range = 17; },
    evolve: { passive: 'swift', name: 'Hurricane Edge', damage: 1.6, width: 1.4, tune: (c) => { c.blades = 9; c.bladeRadius = 1.7; } }
  },
  dragon: {
    name: 'Dragon Coil', element: 'dragon', target: 'nearest', range: 13,
    blurb: 'Fire serpents race out and coil into a burning pillar.',
    cooldown: [4.0, 3.7, 3.4, 3.1, 2.8], damage: [16, 20, 25, 31, 40],
    hit: { type: 'line', width: 1.8, impact: 2.2, hold: { every: 0.3, radius: 1.8, mul: 0.35 } },
    tune: (c, l) => { c.strands = Math.min(5, 1 + l); c.range = 15; },
    evolve: { passive: 'might', name: 'Wyrm Inferno', damage: 1.7, tune: (c) => { c.strands = 5; c.headSize = 1.4; c.riseHeight = 8; } }
  },
  boulder: {
    name: 'Boulder Roll', element: 'boulder', target: 'nearest', range: 13,
    blurb: 'A cracked boulder rolls through the pack and shatters.',
    cooldown: [3.2, 3.0, 2.7, 2.4, 2.1], damage: [22, 28, 35, 44, 56],
    hit: { type: 'line', width: 1.4, impact: 3.0, knock: 5 },
    tune: (c, l) => { c.radius = 0.85 + l * 0.08; c.range = 15; },
    evolve: { passive: 'vitality', name: 'Mountain Breaker', damage: 1.7, width: 1.5, tune: (c) => { c.radius = 1.6; } }
  },
  venom: {
    name: 'Venom Glob', element: 'venom', target: 'cluster', range: 12,
    blurb: 'Lobs toxin that leaves an acid pool which melts and slows.',
    cooldown: [3.8, 3.5, 3.2, 2.9, 2.6], damage: [8, 10, 12, 15, 19],
    hit: { type: 'line', sweep: false, impact: 2.4, pool: { every: 0.35, slow: 0.4 } },
    tune: (c, l) => { c.poolRadius = 2.2 + l * 0.25; c.range = 14; },
    evolve: { passive: 'reach', name: 'Plague Flood', damage: 1.6, tune: (c) => { c.poolRadius = 4.2; } }
  },
  solar: {
    name: 'Solar Lance', element: 'solar', target: 'nearest', range: 15,
    blurb: 'A sun-spear pierces the line and erupts where it lands.',
    cooldown: [3.4, 3.1, 2.8, 2.5, 2.2], damage: [18, 23, 29, 36, 46],
    hit: { type: 'line', width: 1.0, impact: 2.4, hold: { every: 0.3, radius: 1.6, mul: 0.3 } },
    tune: (c, l) => { c.rings = Math.min(5, 1 + l); c.range = 17; },
    evolve: { passive: 'focus', name: 'Dawnbreaker', damage: 1.7, tune: (c) => { c.pillarRadius = 1.6; c.glyphRadius = 4; } }
  },
  vine: {
    name: 'Vine Lash', element: 'vine', target: 'nearest', range: 12,
    blurb: 'Thorned vines tear through the ground and snare the line.',
    cooldown: [3.2, 2.9, 2.6, 2.4, 2.1], damage: [12, 15, 19, 24, 31],
    hit: { type: 'line', width: 1.8, hold: { every: 0.5, mul: 0.3, slow: 0.7 } },
    tune: (c, l) => { c.vines = Math.min(6, 2 + l); c.range = 14; },
    evolve: { passive: 'vitality', name: 'Bramble Wall', damage: 1.5, width: 1.5, tune: (c) => { c.vines = 6; c.thorns = 110; c.bloom = 3.2; } }
  },
  cyclone: {
    name: 'Cyclone', element: 'cyclone', target: 'cluster', range: 11,
    blurb: 'A funnel that drags enemies in and grinds them down.',
    cooldown: [5.2, 4.8, 4.4, 4.0, 3.6], damage: [5, 6, 8, 10, 13],
    hit: { type: 'zone', tick: 1, every: 0.25, pull: 3.5 },
    tune: (c, l) => { c.zoneRadius = 2.0 + l * 0.3; c.lifetime = 2.4 + l * 0.3; },
    evolve: { passive: 'swift', name: 'Maelstrom', damage: 1.6, tune: (c) => { c.zoneRadius = 4.2; c.funnelHeight = 11; } }
  },
  singularity: {
    name: 'Singularity', element: 'singularity', target: 'cluster', range: 11,
    blurb: 'A black hole drinks in the pack, then detonates.',
    cooldown: [8.5, 8.0, 7.4, 6.8, 6.0], damage: [40, 52, 66, 84, 110],
    hit: { type: 'zone', tick: 0.08, every: 0.3, pull: 5.5, finale: 1 },
    tune: (c, l) => { c.zoneRadius = 2.6 + l * 0.3; },
    evolve: { passive: 'might', name: 'Event Horizon', damage: 1.7, tune: (c) => { c.zoneRadius = 5; c.coreSize = 1.1; } }
  },
  sunstrike: {
    name: 'Sunstrike', element: 'sunstrike', target: 'cluster', range: 13,
    blurb: 'A rune circle charges, then a sky beam obliterates it.',
    cooldown: [5.0, 4.6, 4.2, 3.8, 3.3], damage: [50, 64, 80, 100, 130],
    hit: { type: 'zone', burst: 1, delay: 'sunstrike' },
    tune: (c, l) => { c.zoneRadius = 2.0 + l * 0.25; },
    evolve: { passive: 'haste', name: 'Judgement', damage: 1.8, tune: (c) => { c.zoneRadius = 3.8; c.chargeTime = 0.4; } }
  },
  starfall: {
    name: 'Starfall', element: 'starfall', target: 'cluster', range: 12,
    blurb: 'Stars rain over an area, pelting everything inside.',
    cooldown: [5.6, 5.2, 4.8, 4.4, 4.0], damage: [7, 9, 11, 14, 18],
    hit: { type: 'zone', tick: 1, every: 0.2 },
    tune: (c, l) => { c.stars = 18 + l * 6; c.zoneRadius = 2.8 + l * 0.25; },
    evolve: { passive: 'focus', name: 'Meteor Storm', damage: 1.6, tune: (c) => { c.stars = 80; c.zoneRadius = 5; } }
  },
  miasma: {
    name: 'Miasma', element: 'miasma', target: 'cluster', range: 11,
    blurb: 'A plague cloud that poisons and slows for a long time.',
    cooldown: [6.0, 5.6, 5.2, 4.8, 4.2], damage: [4, 5, 6, 8, 10],
    hit: { type: 'zone', tick: 1, every: 0.35, slow: 0.45 },
    tune: (c, l) => { c.zoneRadius = 2.6 + l * 0.3; },
    evolve: { passive: 'vitality', name: 'Black Death', damage: 1.8, tune: (c) => { c.zoneRadius = 5; c.lifetime = 6; } }
  },
  geyser: {
    name: 'Lava Geyser', element: 'geyser', target: 'cluster', range: 12,
    blurb: 'The floor cracks, then erupts in surging molten fire.',
    cooldown: [5.4, 5.0, 4.6, 4.2, 3.8], damage: [9, 11, 14, 18, 23],
    hit: { type: 'zone', burst: 2.5, delay: 'geyser', tick: 1, every: 0.3, knock: 3 },
    tune: (c, l) => { c.zoneRadius = 1.8 + l * 0.25; },
    evolve: { passive: 'might', name: 'Magma Heart', damage: 1.7, tune: (c) => { c.zoneRadius = 3.6; c.columnRadius = 1.2; } }
  },
  aegis: {
    name: 'Aegis Dome', element: 'aegis', target: 'self', range: 0,
    blurb: 'A dome around you that halves damage and repels foes.',
    cooldown: [9, 8.5, 8, 7.4, 6.6], damage: [6, 8, 10, 13, 17],
    hit: { type: 'zone', tick: 1, every: 0.4, knock: 7, shield: 0.5 },
    tune: (c, l) => { c.zoneRadius = 2.6 + l * 0.25; c.lifetime = 3 + l * 0.3; },
    evolve: { passive: 'vitality', name: 'Bastion', damage: 1.6, tune: (c) => { c.zoneRadius = 4.2; c.lifetime = 5.5; } }
  }
};

export const SKILL_IDS = Object.keys(SKILLS);
export const MAX_SKILL_LEVEL = 5;
export const MAX_SLOTS = 6;

/** Starter picks — reliable aimed spells so the first minute is fair. */
export const STARTERS = ['arcane', 'thunder', 'gale', 'ice', 'tide', 'boulder', 'solar'];
