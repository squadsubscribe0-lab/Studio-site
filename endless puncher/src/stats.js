import { Save } from './save.js';
import {
  GEAR_SLOTS, gearStat, PETS, petBonus, TALENT_NODES, TALENT_TIERS,
  RING_TRAITS, ringStarStats,
} from './data.js';

export function getItem(uid) {
  return Save.state.items.find(i => i.uid === uid);
}

// Aggregate every meta-progression source into the stats used by a fight.
export function computeStats() {
  const s = Save.state;
  let atk = 10, hp = 100, def = 0;
  const pct = { atk: 0, hp: 0, xp: 0, gold: 0 };

  for (const slot of GEAR_SLOTS) {
    const it = getItem(s.equipped[slot.id]);
    if (!it) continue;
    if (slot.stat === 'atk') atk += gearStat(it); else hp += gearStat(it);
  }

  for (const [key, lvl] of Object.entries(s.talents)) {
    const node = TALENT_NODES.find(n => n.id === key.split(':')[1]);
    if (node) pct[node.stat] += node.per * lvl;
  }

  for (const id of s.petSlots) {
    if (!id) continue;
    const pet = PETS.find(p => p.id === id);
    const owned = s.pets[id];
    if (pet && owned) pct[pet.stat] += petBonus(pet, owned.lvl);
  }

  const ring = ringStarStats(s.ring.tier, s.ring.star);
  atk += ring.atk * 0.2; hp += ring.hp; def += ring.def;

  atk = Math.round(atk * (1 + pct.atk / 100));
  hp = Math.round(hp * (1 + pct.hp / 100));

  const traits = {};
  for (const t of RING_TRAITS) if (s.ring.tier > t.tier || (s.ring.tier === t.tier && s.ring.star >= 5)) traits[t.key] = true;

  return {
    atk, hp, def,
    xpMult: 1 + pct.xp / 100,
    goldMult: 1 + pct.gold / 100,
    traits,
    power: Math.round(atk * 12 + hp * 1.5 + def * 8),
  };
}

export function talentTierDone(tier) {
  return TALENT_NODES.every(n => (Save.state.talents[`${tier}:${n.id}`] || 0) >= 3);
}

export function talentTierName(tier) {
  return TALENT_TIERS[Math.min(tier, TALENT_TIERS.length - 1)];
}

export function fmt(n) {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  const units = ['K', 'M', 'B', 'T', 'aa', 'ab', 'ac'];
  let u = -1;
  let v = n;
  while (v >= 1000 && u < units.length - 1) { v /= 1000; u++; }
  return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)).replace(/\.0+$/, '') + units[u];
}
