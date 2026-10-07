/**
 * Passive relics. Each level applies its bonus once more, and each unlocks the
 * awakening of the spells that name it in `evolve.passive`.
 */
export const PASSIVES = {
  might: { name: 'Ember Heart', blurb: '+12% spell damage.', apply: (s) => { s.might += 0.12; } },
  haste: { name: 'Hourglass', blurb: '−8% spell cooldowns.', apply: (s) => { s.haste *= 0.92; } },
  reach: { name: 'Runed Lens', blurb: '+10% spell area.', apply: (s) => { s.area += 0.1; } },
  swift: { name: 'Wind Boots', blurb: '+8% move speed.', apply: (s) => { s.speed *= 1.08; } },
  vitality: { name: 'Troll Blood', blurb: '+20 max HP, +0.4 HP/s.', apply: (s, p) => { s.maxHp += 20; s.regen += 0.4; p.heal(20); } },
  focus: { name: 'Lodestone', blurb: '+30% pickup range, +5% XP.', apply: (s) => { s.magnet *= 1.3; s.xpGain += 0.05; } }
};

export const PASSIVE_IDS = Object.keys(PASSIVES);
export const MAX_PASSIVE_LEVEL = 5;
