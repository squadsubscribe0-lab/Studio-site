import { Sdk } from './sdk.js';
import { GEAR_SLOTS, MISSIONS } from './data.js';

const KEY = 'punchhorde_save_v1';

function freshState() {
  const equipped = {};
  const items = [];
  let uid = 1;
  // Starter kit: common gloves and shoes equipped.
  for (const slot of ['gloves', 'shoes']) {
    const it = { uid: uid++, slot, rarity: 0, lvl: 1 };
    items.push(it); equipped[slot] = it.uid;
  }
  // A few loose commons so merging is discoverable early.
  items.push({ uid: uid++, slot: 'helmet', rarity: 0, lvl: 1 });
  items.push({ uid: uid++, slot: 'gloves', rarity: 0, lvl: 1 });
  return {
    v: 1,
    coins: 150,
    gems: 30,
    shards: 20,
    stage: 1,
    bestStage: 1,
    uid,
    items,
    equipped,
    pets: {},          // id -> { lvl, cards }
    petSlots: [null, null, null],
    talents: {},       // "tier:node" -> lvl
    talentTier: 0,
    ring: { tier: 0, star: 0 },
    stats: { levels: 0, kills: 0, stages: 0, gearUps: 0, bosses: 0, summons: 0 },
    mission: { idx: 0, round: 0, startVal: 0 },
    speedUnlocked: false,
    lastEvent: 0,
    lastSeen: Date.now(),
    muted: false,
    musicMuted: false,
    tutorialDone: false,
  };
}

export const Save = {
  state: freshState(),

  load() {
    try {
      const raw = Sdk.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.state = Object.assign(freshState(), data);
        this.state.stats = Object.assign(freshState().stats, data.stats || {});
      }
    } catch (e) {
      console.warn('Save corrupted, starting fresh', e);
      this.state = freshState();
    }
    // Keep only valid slots in equipped map.
    for (const k of Object.keys(this.state.equipped)) {
      if (!GEAR_SLOTS.find(s => s.id === k)) delete this.state.equipped[k];
    }
    if (this.state.mission.idx >= MISSIONS.length) this.state.mission.idx = 0;
    return this.state;
  },

  save() {
    this.state.lastSeen = Date.now();
    try { Sdk.setItem(KEY, JSON.stringify(this.state)); } catch {}
  },

  reset() {
    this.state = freshState();
    this.save();
  },
};

let saveTimer = null;
export function queueSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = null; Save.save(); }, 800);
}
