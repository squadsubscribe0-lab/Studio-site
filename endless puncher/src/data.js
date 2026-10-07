// Static game definitions: rarities, gear, pets, talents, ring tiers, run skills, missions.

export const RARITIES = [
  { id: 0, name: 'Common',    color: '#9aa4b5', dark: '#5d6679', mult: 1 },
  { id: 1, name: 'Uncommon',  color: '#4fd16b', dark: '#23833a', mult: 1.8 },
  { id: 2, name: 'Rare',      color: '#3fa2ff', dark: '#1d5fb3', mult: 3.2 },
  { id: 3, name: 'Epic',      color: '#b25cff', dark: '#6b27b0', mult: 5.6 },
  { id: 4, name: 'Legendary', color: '#ffc531', dark: '#b17c00', mult: 9.5 },
  { id: 5, name: 'Mythic',    color: '#ff4d5e', dark: '#a8182a', mult: 16 },
];

// Each gear slot contributes either attack or HP.
export const GEAR_SLOTS = [
  { id: 'gloves', name: 'Gloves', stat: 'atk', base: 4 },
  { id: 'helmet', name: 'Helmet', stat: 'hp',  base: 22 },
  { id: 'armor',  name: 'Armor',  stat: 'hp',  base: 30 },
  { id: 'belt',   name: 'Belt',   stat: 'atk', base: 3 },
  { id: 'pants',  name: 'Pants',  stat: 'hp',  base: 18 },
  { id: 'shoes',  name: 'Shoes',  stat: 'atk', base: 2 },
];

export const GEAR_MAX_LEVEL = [10, 15, 20, 30, 40, 50];

export function gearStat(item) {
  const slot = GEAR_SLOTS.find(s => s.id === item.slot);
  const r = RARITIES[item.rarity];
  return Math.round(slot.base * r.mult * (1 + 0.12 * (item.lvl - 1)));
}

export function gearUpgradeCost(item) {
  return Math.round(40 * Math.pow(1.16, item.lvl - 1) * (1 + item.rarity * 0.6));
}

// Pets are original elemental slime heroes. Each has a signature skill (see petSkills.js)
// and its own costume colors (cape, mask, emblem). Ids are kept stable for existing saves.
export const PETS = [
  { id: 'pebbit',   name: 'Drip',     rarity: 0, color: '#4fc3ff', stat: 'hp',  base: 3,  element: 'water',
    skill: { name: 'Tidal Splash',    desc: 'A wave that knocks enemies back' },     costume: { cape: '#ffd23f', mask: '#1b3a8c' } },
  { id: 'snork',    name: 'Pebble',   rarity: 0, color: '#c9a27a', stat: 'atk', base: 3,  element: 'rock',
    skill: { name: 'Boulder Toss',    desc: 'Hurls a boulder that stuns on impact' }, costume: { cape: '#5a7d3a', mask: '#3b2a1c' } },
  { id: 'mossy',    name: 'Sprout',   rarity: 0, color: '#6fdc5a', stat: 'xp',  base: 4,  element: 'leaf',
    skill: { name: 'Healing Bloom',   desc: 'Heals you and slows nearby enemies' },   costume: { cape: '#ff8fc8', mask: '#2a6b1f' } },
  { id: 'fizzle',   name: 'Ember',    rarity: 1, color: '#ff7a2e', stat: 'atk', base: 5,  element: 'fire',
    skill: { name: 'Flamethrower',    desc: 'Sprays a cone of burning fire' },        costume: { cape: '#2b2d42', mask: '#ffd23f' } },
  { id: 'crumble',  name: 'Frosty',   rarity: 1, color: '#9fe8ff', stat: 'hp',  base: 5,  element: 'ice',
    skill: { name: 'Frost Nova',      desc: 'Freezes every enemy around it' },        costume: { cape: '#ffffff', mask: '#2f6fb8' } },
  { id: 'zapzap',   name: 'Zappy',    rarity: 1, color: '#ffe14a', stat: 'gold',base: 6,  element: 'spark',
    skill: { name: 'Chain Lightning', desc: 'A bolt that jumps between 5 enemies' },  costume: { cape: '#3a2bb8', mask: '#1a1030' } },
  { id: 'glub',     name: 'Toxi',     rarity: 2, color: '#9b6bff', stat: 'atk', base: 8,  element: 'poison',
    skill: { name: 'Toxic Cloud',     desc: 'Leaves a poison cloud that eats HP' },   costume: { cape: '#8dff5a', mask: '#2a1650' } },
  { id: 'thornling',name: 'Bubbly',   rarity: 2, color: '#ff8fd0', stat: 'hp',  base: 8,  element: 'bubble',
    skill: { name: 'Bubble Trap',     desc: 'Traps an enemy in a bubble, then pops' },costume: { cape: '#5ad8ff', mask: '#ffffff' } },
  { id: 'wisp',     name: 'Nebby',    rarity: 3, color: '#7d6bff', stat: 'xp',  base: 12, element: 'cosmic',
    skill: { name: 'Meteor Shower',   desc: 'Calls down a rain of meteors' },         costume: { cape: '#101535', mask: '#ffd6f5' } },
  { id: 'brambo',   name: 'Magmo',    rarity: 3, color: '#e8452a', stat: 'atk', base: 12, element: 'lava',
    skill: { name: 'Lava Pool',       desc: 'Melts the ground into burning lava' },   costume: { cape: '#3a2626', mask: '#ffb347' } },
  { id: 'sunpuff',  name: 'Aurum',    rarity: 4, color: '#ffc93a', stat: 'gold',base: 18, element: 'gold',
    skill: { name: 'Midas Strike',    desc: 'A golden blow that drops extra coins' }, costume: { cape: '#b0122e', mask: '#6b3fd6' } },
  { id: 'voidlet',  name: 'Voidling', rarity: 5, color: '#4b2a8c', stat: 'atk', base: 25, element: 'void',
    skill: { name: 'Black Hole',      desc: 'Sucks enemies in, then detonates' },     costume: { cape: '#d06bff', mask: '#0b0618' } },
];

export const PET_ROLL_WEIGHTS = [52, 28, 12, 5.5, 2, 0.5];

export function petCardsNeeded(lvl) { return 2 + lvl * 3; }
export function petBonus(pet, lvl) { return pet.base * (1 + 0.35 * (lvl - 1)); }

// Talent tiers: each tier has four nodes with 3 levels each; maxing a tier unlocks the next.
export const TALENT_TIERS = [
  'Rookie-1', 'Rookie-2', 'Amateur-1', 'Amateur-2', 'Pro-1', 'Pro-2',
  'Champion-1', 'Champion-2', 'Legend-1', 'Legend-2', 'Titan-1', 'Titan-2',
];
export const TALENT_NODES = [
  { id: 'atk',  name: 'Power Fist', stat: 'atk',  per: 4,  desc: '+{v}% Attack' },
  { id: 'hp',   name: 'Iron Body',  stat: 'hp',   per: 5,  desc: '+{v}% Max HP' },
  { id: 'xp',   name: 'Fast Learner', stat: 'xp', per: 5,  desc: '+{v}% Fight EXP' },
  { id: 'gold', name: 'Gold Rush',  stat: 'gold', per: 6,  desc: '+{v}% Gold' },
];
export const TALENT_MAX = 3;
export function talentCost(tier, lvl) {
  return Math.round(120 * Math.pow(1.55, tier) * (1 + lvl * 0.5));
}

// Ring tiers: each has 10 stars. Stars add flat stats, tiers unlock traits.
export const RING_TIERS = [
  { name: 'Backyard Brawl',   color: '#8a5a33', rope: '#d33' },
  { name: 'Street Pit',       color: '#6b6b73', rope: '#f5a623' },
  { name: 'Crown Arena',      color: '#3b4c7a', rope: '#9b4dff' },
  { name: 'Steel Colosseum',  color: '#4b5560', rope: '#27d3ff' },
  { name: 'Volcano Arena',    color: '#5a2320', rope: '#ff6a00' },
  { name: 'Sky Palace',       color: '#e8e3d6', rope: '#ffd54a' },
];
export const RING_TRAITS = [
  { tier: 0, key: 'burnBoost',  desc: 'Burn damage +25%' },
  { tier: 1, key: 'armBoost',   desc: 'Each extra arm +20% punch damage' },
  { tier: 2, key: 'lvlHeal',    desc: 'Level ups restore 3% HP' },
  { tier: 3, key: 'reflect',    desc: 'Reflect 15% of damage received' },
  { tier: 4, key: 'startSkill', desc: 'Start every fight with a free skill' },
  { tier: 5, key: 'bossDmg',    desc: '+30% damage to bosses' },
];
export function ringStarStats(tier, star) {
  const steps = tier * 10 + star;
  return { hp: steps * 10, atk: steps * 5, def: steps * 1 };
}
export function ringStarCost(tier, star) {
  return Math.round(150 * Math.pow(1.13, tier * 10 + star));
}

// Skills picked during a fight on level up.
export const SKILLS = [
  { id: 'dmg',    name: 'Heavy Hands',  max: 10, desc: 'Punch damage +20%',          icon: 'fist',  color: '#ff5a5a' },
  { id: 'rate',   name: 'Quick Jabs',   max: 8,  desc: 'Punch speed +15%',           icon: 'bolt',  color: '#ffd23f' },
  { id: 'range',  name: 'Long Reach',   max: 6,  desc: 'Punch range +4 feet',        icon: 'range', color: '#4fd1ff' },
  { id: 'arm',    name: 'Extra Arm',    max: 4,  desc: 'Grow one more punching arm', icon: 'arm',   color: '#b25cff' },
  { id: 'hp',     name: 'Thick Skin',   max: 8,  desc: 'Max HP +20% and heal 30%',   icon: 'heart', color: '#ff4d7a' },
  { id: 'burn',   name: 'Fire Gloves',  max: 5,  desc: 'Punches set enemies ablaze', icon: 'fire',  color: '#ff8a2a' },
  { id: 'chain',  name: 'Shock Knuckle',max: 5,  desc: 'Hits chain lightning',       icon: 'bolt',  color: '#6be3ff' },
  { id: 'slam',   name: 'Ground Slam',  max: 5,  desc: 'Periodic shockwave around you', icon: 'slam', color: '#f0a060' },
  { id: 'crit',   name: 'Lucky Strike', max: 6,  desc: 'Crit chance +8%',            icon: 'star',  color: '#ffe066' },
  { id: 'leech',  name: 'Vampire Fist', max: 5,  desc: 'Heal 3% of damage dealt',    icon: 'drop',  color: '#e0354b' },
  { id: 'magnet', name: 'Magnet',       max: 3,  desc: 'Pick up gems from further',  icon: 'magnet',color: '#9ad0ff' },
  { id: 'splash', name: 'Shockwave Fist', max: 4, desc: 'Punches hit nearby enemies', icon: 'burst', color: '#ffae4f' },
  { id: 'boomerang', name: 'Boomerang Glove', max: 5, desc: 'Throws a glove that flies out and back', icon: 'arm', color: '#ffb347' },
  { id: 'whirl', name: 'Whirlwind', max: 5, desc: 'Spin and smash everything around you', icon: 'slam', color: '#6fe6ff' },
  { id: 'shield', name: 'Bubble Shield', max: 5, desc: 'Blocks one hit every few seconds', icon: 'shield', color: '#5ad8ff' },
  { id: 'clone', name: 'Shadow Double', max: 5, desc: 'A shadow clone fights beside you', icon: 'fist', color: '#8a5cff' },
  { id: 'rage', name: 'Berserker', max: 5, desc: 'Below 40% HP: harder and faster punches', icon: 'fire', color: '#ff4a5a' },
  { id: 'uppercut', name: 'Rocket Uppercut', max: 5, desc: 'Punches can launch enemies sky-high', icon: 'up', color: '#ffd23f' },
];

// Hidden combo powers: unlocked automatically once both skills have been picked.
export const COMBOS = [
  { id: 'firetornado', name: 'Fire Tornado',      needs: ['burn', 'whirl'],       desc: 'Whirlwind spins set everything ablaze' },
  { id: 'thunderang',  name: 'Thunder Boomerang', needs: ['chain', 'boomerang'],  desc: 'Boomerang hits call down lightning' },
  { id: 'novashield',  name: 'Nova Shield',       needs: ['shield', 'slam'],      desc: 'A breaking shield blasts a shockwave' },
  { id: 'vampclone',   name: 'Vampire Double',    needs: ['leech', 'clone'],      desc: 'Shadow clone hits heal you' },
  { id: 'meteorupper', name: 'Meteor Uppercut',   needs: ['uppercut', 'crit'],    desc: 'Launched enemies crash down as meteors' },
  { id: 'bloodfrenzy', name: 'Blood Frenzy',      needs: ['rage', 'leech'],       desc: 'Triple lifesteal while raging' },
];

export const ENEMY_TYPES = {
  grunt:   { hp: 1,   dmg: 1,   speed: 2.1, scale: 1,    color: '#e8343f', xp: 1, from: 1 },
  runner:  { hp: 0.6, dmg: 0.7, speed: 3.6, scale: 0.8,  color: '#ff6a4f', xp: 1, from: 2 },
  brute:   { hp: 4.5, dmg: 2.2, speed: 1.4, scale: 1.45, color: '#b01e2e', xp: 4, from: 3 },
  thrower: { hp: 0.9, dmg: 1.2, speed: 1.8, scale: 0.95, color: '#d44fa0', xp: 2, from: 4, ranged: true },
  boss:    { hp: 20,  dmg: 2,   speed: 1.4, scale: 2.4,  color: '#8e0f1f', xp: 25, boss: true },
};

export const MISSIONS = [
  { id: 'lvl',   text: 'Gain {n} levels in fights',   stat: 'levels',  base: 15 },
  { id: 'kill',  text: 'Defeat {n} enemies',          stat: 'kills',   base: 150 },
  { id: 'stage', text: 'Clear {n} stages',            stat: 'stages',  base: 2 },
  { id: 'gear',  text: 'Upgrade gear {n} times',      stat: 'gearUps', base: 4 },
  { id: 'boss',  text: 'Defeat {n} bosses',           stat: 'bosses',  base: 2 },
  { id: 'pet',   text: 'Summon {n} pets',             stat: 'summons', base: 5 },
];
