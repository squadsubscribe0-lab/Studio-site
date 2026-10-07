import { Save, queueSave } from './save.js';
import {
  RARITIES, GEAR_SLOTS, GEAR_MAX_LEVEL, gearStat, gearUpgradeCost,
  PETS, PET_ROLL_WEIGHTS, petCardsNeeded, petBonus,
  TALENT_TIERS, TALENT_NODES, TALENT_MAX, talentCost,
  RING_TIERS, RING_TRAITS, ringStarStats, ringStarCost, MISSIONS,
} from './data.js';
import { computeStats, getItem, fmt, talentTierDone } from './stats.js';
import { icon, art } from './icons.js';
import { Audio } from './audio.js';
import { Sdk } from './sdk.js';

const $ = (s, r = document) => r.querySelector(s);

export const UI = {
  preview: null,
  hooks: {},

  init(preview, hooks) {
    this.preview = preview;
    this.hooks = hooks;
    $('#btnSettings').innerHTML = art('settings');
    $('#hpIcon').innerHTML = art('heart');
    $('#stageBoss').innerHTML = art('skull');
    const labels = { pet: ['paw', 'PET'], talents: ['tree', 'TALENTS'], battle: ['battle', 'BATTLE'], inventory: ['bag', 'INVENTORY'], ring: ['ring', 'RING'] };
    for (const b of document.querySelectorAll('#nav button')) {
      const [ic, label] = labels[b.dataset.tab];
      b.innerHTML = `${icon(ic)}<span class="stroke">${label}</span>`;
    }
    $('#btnSettings').onclick = () => { Audio.play('click'); this.settings(); };
    setInterval(() => this.updateAdTimers(), 1000);
    this.renderCurrencies();
  },

  // ---------------- common ----------------
  renderCurrencies(bump) {
    const s = Save.state;
    const el = $('#currencies');
    el.innerHTML = [
      ['coin', s.coins], ['gem', s.gems], ['shard', s.shards], ['star', s.bestStage],
    ].map(([k, v]) => `<div class="cur stroke ${bump === k ? 'bump' : ''}">${icon(k)}<b>${fmt(v)}</b></div>`).join('');
    this.renderNavDots();
  },

  renderNavDots() {
    const s = Save.state;
    const dots = {
      inventory: this.mergeGroups().length > 0 || GEAR_SLOTS.some(sl => !s.equipped[sl.id] && s.items.some(i => i.slot === sl.id)),
      pet: s.shards >= 10 || PETS.some(p => s.pets[p.id] && s.pets[p.id].cards >= petCardsNeeded(s.pets[p.id].lvl)),
      talents: this.cheapestTalent() !== null && s.coins >= this.cheapestTalent(),
      ring: s.coins >= this.ringCost(),
    };
    for (const b of document.querySelectorAll('#nav button')) {
      b.querySelector('.dot')?.remove();
      if (dots[b.dataset.tab]) b.insertAdjacentHTML('beforeend', '<span class="dot"></span>');
    }
  },

  toast(msg) {
    const t = $('#toast');
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.remove('show'), 1600);
  },

  modal(html, bind, { closable = true } = {}) {
    const m = $('#modal');
    const c = $('#modalCard');
    if (m.classList.contains('hidden')) Audio.play('open', 0.15);
    c.innerHTML = html;
    m.classList.remove('hidden');
    m.onclick = closable ? (e) => { if (e.target === m) this.closeModal(); } : null;
    bind?.(c);
  },
  closeModal() { $('#modal').classList.add('hidden'); $('#modalCard').innerHTML = ''; },
  get modalOpen() { return !$('#modal').classList.contains('hidden'); },

  spend(kind, amount) {
    const s = Save.state;
    if (s[kind] < amount) {
      const names = { coins: 'coins', gems: 'gems', shards: 'shards' };
      this.toast(`Not enough ${names[kind]}!`);
      Audio.play('error', 0.2);
      return false;
    }
    s[kind] -= amount;
    this.renderCurrencies();
    queueSave();
    return true;
  },

  // Rewarded ad per CrazyGames rules: game paused, muted and input-blocked during the ad,
  // reward only on adFinished, and a visible confirmation once it is granted.
  async rewardedAd(label = 'Reward received!') {
    if (this.adblock) { this.toast('Ads are blocked, bonus offers are off'); return false; }
    this.hooks.adStart?.();
    const ok = await Sdk.rewarded({
      onError: (err) => { if (err === 'adblock' || err?.code === 'adblock') this.setAdblock(true); },
    });
    this.hooks.adEnd?.();
    if (ok) this.rewardFx(label);
    else this.toast('Ad not available right now');
    return ok;
  },

  adblock: false,
  setAdblock(on) {
    this.adblock = on;
    document.body.classList.toggle('adblock', on);
  },

  // Rewarded-ad button: video icon + a notice that replaces it when ads are blocked.
  adBtn(id, label, cls = 'green', cdKey = null) {
    const cd = cdKey ? ` data-adcd="${cdKey}" data-label="${label}"` : '';
    return `<button class="btn ${cls} ad" id="${id}"${cd}>${icon('ad')}<span class="lbl">${label}</span></button>`
      + '<span class="adblock-note">Ads blocked: bonus unavailable</span>';
  },

  rewardFx(text, sub = '') {
    const el = document.createElement('div');
    el.className = 'reward-fx' + (sub ? ' big' : '');
    el.innerHTML = `${icon('star')}<span class="stroke">${text}${sub ? `<small>${sub}</small>` : ''}</span>`;
    document.getElementById('app').appendChild(el);
    if (!sub) Audio.play('reward');
    setTimeout(() => el.remove(), sub ? 2400 : 1500);
  },

  // Red warning banner for incoming threats (boss cart, ambush).
  alertFx(text) {
    const el = document.createElement('div');
    el.className = 'alert-fx stroke';
    el.textContent = text;
    document.getElementById('app').appendChild(el);
    setTimeout(() => el.remove(), 1800);
  },

  // Cooldowns keep rewarded offers from appearing too often; buttons show a countdown.
  AD_COOLDOWNS: { chest: 4 * 60e3, summon: 4 * 60e3, double: 2 * 60e3 },
  adLeft(key) { return Math.max(0, this.AD_COOLDOWNS[key] - (Date.now() - (Save.state.adCd?.[key] || 0))); },
  adReady(key) { return this.adLeft(key) === 0; },
  markAd(key) { (Save.state.adCd ||= {})[key] = Date.now(); queueSave(); },
  updateAdTimers() {
    for (const b of document.querySelectorAll('[data-adcd]')) {
      const left = Math.ceil(this.adLeft(b.dataset.adcd) / 1000);
      b.disabled = left > 0;
      b.querySelector('.lbl').textContent = left > 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : b.dataset.label;
    }
  },

  settings() {
    const s = Save.state;
    this.modal(`
      <h2 class="stroke">SETTINGS</h2>
      <div class="set-row"><span>Sound</span><button class="btn small ${s.muted ? 'red' : 'green'}" id="stSound">${icon(s.muted ? 'mute' : 'sound')} ${s.muted ? 'OFF' : 'ON'}</button></div>
      <div class="set-row"><span>Music</span><button class="btn small ${s.musicMuted ? 'red' : 'green'}" id="stMusic">${icon(s.musicMuted ? 'mute' : 'sound')} ${s.musicMuted ? 'OFF' : 'ON'}</button></div>
      <div class="set-row"><span>Global Power</span><b>${fmt(computeStats().power)}</b></div>
      <div class="set-row"><span>Best Stage</span><b>${s.bestStage}</b></div>
      <div class="set-row"><span>Enemies defeated</span><b>${fmt(s.stats.kills)}</b></div>
      <button class="btn small red" id="stReset">Reset progress</button>
      <button class="btn green" id="stClose">CLOSE</button>
    `, (c) => {
      $('#stSound', c).onclick = () => { s.muted = !s.muted; Audio.setMuted(s.muted); queueSave(); this.settings(); };
      $('#stMusic', c).onclick = () => { s.musicMuted = !s.musicMuted; Audio.setMusicMuted(s.musicMuted); Audio.play('click'); queueSave(); this.settings(); };
      $('#stClose', c).onclick = () => this.closeModal();
      $('#stReset', c).onclick = () => {
        this.modal(`<h2>Reset?</h2><p class="muted">All progress will be lost.</p><div class="modal-btns"><button class="btn" id="rsNo">Cancel</button><button class="btn red" id="rsYes">Reset</button></div>`, (c2) => {
          $('#rsNo', c2).onclick = () => this.settings();
          $('#rsYes', c2).onclick = () => { Save.reset(); location.reload(); };
        });
      };
    });
  },

  // ---------------- missions ----------------
  mission() {
    const s = Save.state;
    const def = MISSIONS[s.mission.idx % MISSIONS.length];
    const target = Math.round(def.base * (1 + s.mission.round * 0.6));
    const cur = Math.min(target, s.stats[def.stat] - s.mission.startVal);
    return { def, target, cur, reward: 15 + s.mission.round * 5, done: cur >= target };
  },

  renderMission() {
    const m = this.mission();
    const el = $('#mission');
    el.className = m.done ? 'ready' : '';
    el.innerHTML = `
      <div class="mbar"><div class="mfill" style="width:${(m.cur / m.target) * 100}%"></div><span class="stroke">${m.cur}/${m.target}</span></div>
      <div class="mtext stroke">${m.done ? 'TAP TO CLAIM!' : m.def.text.replace('{n}', m.target)}</div>
      <div class="mreward stroke">${icon('gem')}${m.reward}</div>`;
    el.onclick = () => {
      if (!m.done) { this.toast(m.def.text.replace('{n}', m.target)); return; }
      const s = Save.state;
      s.gems += m.reward;
      s.mission.idx = (s.mission.idx + 1) % MISSIONS.length;
      if (s.mission.idx === 0) s.mission.round++;
      const next = MISSIONS[s.mission.idx];
      s.mission.startVal = s.stats[next.stat];
      Audio.play('buy');
      this.renderCurrencies('gem');
      this.renderMission();
      queueSave();
    };
  },

  // ---------------- inventory ----------------
  mergeGroups() {
    const groups = {};
    for (const it of Save.state.items) {
      if (it.rarity >= RARITIES.length - 1) continue;
      const k = it.slot + ':' + it.rarity;
      (groups[k] ||= []).push(it);
    }
    return Object.values(groups).filter(g => g.length >= 3);
  },

  itemSlotHtml(it, extra = '') {
    if (!it) return '';
    const r = RARITIES[it.rarity];
    return `<div class="gslot r${it.rarity} ${extra}" data-uid="${it.uid}">
      ${icon(it.slot)}<span class="lv stroke">Lv.${it.lvl}</span></div>`;
  },

  renderInventory() {
    const s = Save.state;
    const st = computeStats();
    const sec = $('#scr-inventory');
    const slotHtml = (slotId) => {
      const it = getItem(s.equipped[slotId]);
      if (!it) {
        const has = s.items.some(i => i.slot === slotId);
        return `<div class="gslot empty" data-slot="${slotId}">${icon(slotId)}${has ? `<span class="up">${art('up')}</span>` : ''}</div>`;
      }
      const r = RARITIES[it.rarity];
      const canUp = it.lvl < GEAR_MAX_LEVEL[it.rarity] && s.coins >= gearUpgradeCost(it);
      const better = s.items.some(i => i.slot === slotId && i.uid !== it.uid && (i.rarity > it.rarity || (i.rarity === it.rarity && i.lvl > it.lvl)));
      return `<div class="gslot r${it.rarity}" data-uid="${it.uid}">
        ${icon(slotId)}<span class="lv stroke">Lv.${it.lvl}</span>${canUp || better ? `<span class="up">${art('up')}</span>` : ''}</div>`;
    };
    const loose = s.items.filter(i => !Object.values(s.equipped).includes(i.uid))
      .sort((a, b) => b.rarity - a.rarity || GEAR_SLOTS.findIndex(x => x.id === a.slot) - GEAR_SLOTS.findIndex(x => x.id === b.slot) || b.lvl - a.lvl);
    const mergeable = this.mergeGroups();
    const mergeSet = new Set(mergeable.flat().map(i => i.uid));

    sec.innerHTML = `<div class="screen-inner split">
      <div class="panel">
        <div class="hero-box">
          <div class="slot-col">${['gloves', 'helmet', 'armor'].map(slotHtml).join('')}</div>
          <div class="hero-view" id="heroView"></div>
          <div class="slot-col">${['belt', 'pants', 'shoes'].map(slotHtml).join('')}</div>
        </div>
        <div class="stat-strip stroke" style="margin-top:10px">
          <div>${icon('sword')}${fmt(st.power)}</div>
          <div>${icon('fist')}${fmt(st.atk)}</div>
          <div>${icon('heart')}${fmt(st.hp)}</div>
        </div>
        <div class="row" style="margin-top:10px;justify-content:center;gap:8px;flex-wrap:wrap">
          <button class="btn orange small" id="invMerge" ${mergeable.length ? '' : 'disabled'}>MERGE ${mergeable.length ? `(${mergeable.length})` : ''}</button>
          <button class="btn purple small" id="invChest">${icon('chest')} CHEST ${icon('gem')}30</button>
          ${this.adBtn('invAdChest', 'FREE CHEST', 'green small', 'chest')}
        </div>
      </div>
      <div class="panel">
        <h3 class="stroke">INVENTORY</h3>
        ${loose.length ? `<div class="inv-grid">${loose.map(it => this.itemSlotHtml(it).replace('class="gslot', `class="gslot${mergeSet.has(it.uid) ? ' mg' : ''}`).replace('</div>', mergeSet.has(it.uid) ? '<span class="merge">3x</span></div>' : '</div>')).join('')}</div>`
          : '<p class="muted" style="text-align:center">No spare gear. Clear stages or open chests!</p>'}
      </div>
    </div>`;

    this.preview.mount($('#heroView', sec), 'hero');
    sec.querySelectorAll('.gslot[data-uid]').forEach(el => el.onclick = () => { Audio.play('click'); this.itemModal(+el.dataset.uid); });
    sec.querySelectorAll('.gslot[data-slot]').forEach(el => el.onclick = () => {
      const best = s.items.filter(i => i.slot === el.dataset.slot).sort((a, b) => b.rarity - a.rarity || b.lvl - a.lvl)[0];
      if (best) { s.equipped[el.dataset.slot] = best.uid; Audio.play('buy'); queueSave(); this.renderInventory(); this.hooks.gearChanged?.(); }
      else this.toast('No item for this slot yet');
    });
    $('#invMerge', sec).onclick = () => this.mergeAll();
    $('#invChest', sec).onclick = () => { if (this.spend('gems', 30)) this.openChest(); };
    $('#invAdChest', sec).onclick = async () => {
      if (!this.adReady('chest')) return;
      if (await this.rewardedAd('Free chest!')) { this.markAd('chest'); this.openChest(); }
    };
    this.updateAdTimers();
  },

  rollItem(stageBias = 0) {
    const s = Save.state;
    const r = Math.random() * 100;
    const bias = Math.min(20, stageBias);
    let rarity = 0;
    if (r < 1 + bias * 0.2) rarity = 3;
    else if (r < 8 + bias * 0.8) rarity = 2;
    else if (r < 35 + bias) rarity = 1;
    const slot = GEAR_SLOTS[Math.floor(Math.random() * GEAR_SLOTS.length)].id;
    const it = { uid: s.uid++, slot, rarity, lvl: 1 };
    s.items.push(it);
    if (!s.equipped[slot]) s.equipped[slot] = it.uid;
    return it;
  },

  openChest() {
    const it = this.rollItem(Save.state.bestStage);
    Audio.play('level');
    const r = RARITIES[it.rarity];
    const slot = GEAR_SLOTS.find(x => x.id === it.slot);
    this.modal(`<h2 class="stroke" style="color:${r.color}">${r.name.toUpperCase()}!</h2>
      <div style="width:110px">${this.itemSlotHtml(it)}</div>
      <p class="stroke">${slot.name} · ${slot.stat === 'atk' ? 'Attack' : 'HP'} +${gearStat(it)}</p>
      <button class="btn green" id="okC">NICE!</button>`, (c) => {
      $('#okC', c).onclick = () => { this.closeModal(); this.renderInventory(); this.hooks.gearChanged?.(); };
    });
    queueSave();
    this.renderNavDots();
  },

  mergeAll() {
    const s = Save.state;
    let merged = 0;
    let groups;
    while ((groups = this.mergeGroups()).length) {
      for (const g of groups) {
        g.sort((a, b) => b.lvl - a.lvl);
        const three = g.slice(0, 3);
        const wasEquipped = three.some(i => s.equipped[i.slot] === i.uid);
        s.items = s.items.filter(i => !three.includes(i));
        const it = { uid: s.uid++, slot: three[0].slot, rarity: three[0].rarity + 1, lvl: three[0].lvl };
        s.items.push(it);
        if (wasEquipped || !getItem(s.equipped[it.slot]) || getItem(s.equipped[it.slot]).rarity < it.rarity) s.equipped[it.slot] = it.uid;
        merged++;
      }
    }
    Audio.play('level');
    this.toast(`Merged ${merged} item${merged > 1 ? 's' : ''}!`);
    queueSave();
    this.renderInventory();
    this.hooks.gearChanged?.();
  },

  itemModal(uid) {
    const s = Save.state;
    const it = getItem(uid);
    if (!it) return;
    const r = RARITIES[it.rarity];
    const slot = GEAR_SLOTS.find(x => x.id === it.slot);
    const equipped = s.equipped[it.slot] === uid;
    const max = GEAR_MAX_LEVEL[it.rarity];
    const cost = gearUpgradeCost(it);
    const next = { ...it, lvl: it.lvl + 1 };
    const sell = Math.round(20 * (1 + it.rarity * 2) * it.lvl);
    this.modal(`
      <h2 class="stroke" style="color:${r.color}">${r.name} ${slot.name}</h2>
      <div class="item-detail">
        ${this.itemSlotHtml(it)}
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div class="set-row"><span>${slot.stat === 'atk' ? icon('fist') + ' Attack' : icon('heart') + ' HP'}</span><b>${gearStat(it)}${it.lvl < max ? ` <span style="color:var(--green)">→ ${gearStat(next)}</span>` : ''}</b></div>
          <div class="set-row"><span>Level</span><b>${it.lvl} / ${max}</b></div>
        </div>
      </div>
      <div class="modal-btns">
        ${equipped ? '' : `<button class="btn teal" id="imEquip">EQUIP</button>`}
        ${it.lvl < max ? `<button class="btn green" id="imUp">${icon('up')} UPGRADE ${icon('coin')}${fmt(cost)}</button>` : '<button class="btn" disabled>MAX LEVEL</button>'}
        ${equipped ? '' : `<button class="btn red small" id="imSell">SELL ${icon('coin')}${fmt(sell)}</button>`}
      </div>
      <button class="btn small" id="imClose">CLOSE</button>`, (c) => {
      $('#imClose', c).onclick = () => this.closeModal();
      const eq = $('#imEquip', c);
      if (eq) eq.onclick = () => { s.equipped[it.slot] = uid; Audio.play('buy'); queueSave(); this.closeModal(); this.renderInventory(); this.hooks.gearChanged?.(); };
      const up = $('#imUp', c);
      if (up) up.onclick = () => {
        if (!this.spend('coins', cost)) return;
        it.lvl++; s.stats.gearUps++;
        Audio.play('buy');
        queueSave();
        this.itemModal(uid);
        this.renderInventory();
        this.hooks.gearChanged?.();
      };
      const sl = $('#imSell', c);
      if (sl) sl.onclick = () => {
        s.items = s.items.filter(i => i.uid !== uid);
        s.coins += sell;
        Audio.play('coin');
        this.renderCurrencies('coin');
        queueSave();
        this.closeModal(); this.renderInventory();
      };
    });
  },

  // ---------------- pets ----------------
  renderPets() {
    const s = Save.state;
    const sec = $('#scr-pet');
    const card = (pet, opts = {}) => {
      const owned = s.pets[pet.id];
      const r = RARITIES[pet.rarity];
      const lvl = owned?.lvl || 1;
      const need = petCardsNeeded(lvl);
      const cards = owned?.cards || 0;
      const eq = s.petSlots.includes(pet.id);
      return `<div class="pet-card r${pet.rarity} ${owned ? '' : 'locked'} ${eq && !opts.slot ? 'equipped' : ''}" data-pet="${pet.id}">
        <span class="lvtag stroke">${owned ? lvl : '?'}</span>
        <img class="pet-img" src="${this.preview.petImage(pet)}" alt="">
        <b class="stroke">${pet.name}</b>
        <span class="pet-skill">${pet.skill.name}</span>
        ${owned ? `<div class="cards"><i style="width:${Math.min(100, cards / need * 100)}%"></i><span class="stroke">${cards}/${need}</span></div>` : ''}
      </div>`;
    };
    const slots = s.petSlots.map((id, i) => {
      const pet = PETS.find(p => p.id === id);
      return pet ? card(pet, { slot: true }).replace('data-pet', `data-slot="${i}" data-pet`) :
        `<div class="pet-card empty" data-slot="${i}"><span class="muted">EMPTY</span></div>`;
    }).join('');
    const bonus = { atk: 0, hp: 0, xp: 0, gold: 0 };
    for (const id of s.petSlots) { const p = PETS.find(x => x.id === id); if (p && s.pets[id]) bonus[p.stat] += petBonus(p, s.pets[id].lvl); }

    sec.innerHTML = `<div class="screen-inner split">
      <div class="panel">
        <div class="pet-slots">${slots}</div>
        <p class="muted" style="text-align:center;margin:8px 0">Pets: +${bonus.atk.toFixed(0)}% ATK · +${bonus.hp.toFixed(0)}% HP · +${bonus.xp.toFixed(0)}% EXP · +${bonus.gold.toFixed(0)}% Gold</p>
        <div class="row" style="justify-content:center;gap:10px">
          <button class="btn teal small" id="petBest">EQUIP BEST</button>
          <button class="btn green small" id="petUpAll">UPGRADE ALL</button>
        </div>
        <div class="row" style="justify-content:center;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn purple" id="petBuy1">SUMMON 1x ${icon('shard')}10</button>
          <button class="btn purple" id="petBuy10">SUMMON 10x ${icon('shard')}90</button>
          ${this.adBtn('petAd', 'FREE SUMMON', 'orange small', 'summon')}
        </div>
      </div>
      <div class="panel"><div class="pet-grid">${PETS.slice().sort((a, b) => (!!s.pets[b.id] - !!s.pets[a.id]) || b.rarity - a.rarity).map(p => card(p)).join('')}</div></div>
    </div>`;

    sec.querySelectorAll('.pet-card[data-pet]').forEach(el => el.onclick = () => { Audio.play('click'); this.petModal(el.dataset.pet); });
    $('#petBuy1', sec).onclick = () => { if (this.spend('shards', 10)) this.summon(1); };
    $('#petBuy10', sec).onclick = () => { if (this.spend('shards', 90)) this.summon(10); };
    $('#petAd', sec).onclick = async () => {
      if (!this.adReady('summon')) return;
      if (await this.rewardedAd('Free summon!')) { this.markAd('summon'); this.summon(1); }
    };
    this.updateAdTimers();
    $('#petBest', sec).onclick = () => {
      const owned = PETS.filter(p => s.pets[p.id]).sort((a, b) => petBonus(b, s.pets[b.id].lvl) * (b.stat === 'atk' ? 1.3 : 1) - petBonus(a, s.pets[a.id].lvl) * (a.stat === 'atk' ? 1.3 : 1));
      s.petSlots = [0, 1, 2].map(i => owned[i]?.id || null);
      Audio.play('buy'); queueSave(); this.renderPets(); this.hooks.gearChanged?.();
    };
    $('#petUpAll', sec).onclick = () => {
      let n = 0;
      for (const p of PETS) {
        const o = s.pets[p.id];
        while (o && o.cards >= petCardsNeeded(o.lvl)) { o.cards -= petCardsNeeded(o.lvl); o.lvl++; n++; }
      }
      if (n) { Audio.play('level'); this.toast(`${n} pet level${n > 1 ? 's' : ''} gained!`); queueSave(); this.renderPets(); this.hooks.gearChanged?.(); }
      else this.toast('Collect more duplicate cards');
    };
  },

  skillBox(pet) {
    return `<div class="skill-box">${icon('star')}<div><b class="stroke">${pet.skill.name}</b><span>${pet.skill.desc}</span></div></div>`;
  },

  summon(n) {
    const s = Save.state;
    const got = [];
    const total = PET_ROLL_WEIGHTS.reduce((a, b) => a + b, 0);
    for (let i = 0; i < n; i++) {
      let r = Math.random() * total, rarity = 0;
      for (let k = 0; k < PET_ROLL_WEIGHTS.length; k++) { r -= PET_ROLL_WEIGHTS[k]; if (r <= 0) { rarity = k; break; } }
      let pool = PETS.filter(p => p.rarity === rarity);
      if (!pool.length) pool = PETS.filter(p => p.rarity === 0);
      const pet = pool[Math.floor(Math.random() * pool.length)];
      if (s.pets[pet.id]) s.pets[pet.id].cards++;
      else {
        s.pets[pet.id] = { lvl: 1, cards: 0 };
        const free = s.petSlots.indexOf(null);
        if (free >= 0) s.petSlots[free] = pet.id;
      }
      got.push(pet);
    }
    s.stats.summons += n;
    Audio.play('level');
    this.modal(`<h2 class="stroke">SUMMONED!</h2>
      <div class="pet-grid" style="width:${n === 1 ? '150px' : '100%'};grid-template-columns:repeat(${Math.min(5, n)},1fr)">
        ${got.map(p => `<div class="pet-card r${p.rarity}"><img class="pet-img" src="${this.preview.petImage(p)}"><b class="stroke">${p.name}</b><span class="pet-skill">${p.skill.name}</span></div>`).join('')}
      </div><button class="btn green" id="okS">OK</button>`, (c) => {
      $('#okS', c).onclick = () => { this.closeModal(); this.renderPets(); };
    });
    queueSave();
    this.renderPets();
    this.hooks.gearChanged?.();
  },

  petModal(id) {
    const s = Save.state;
    const pet = PETS.find(p => p.id === id);
    const o = s.pets[id];
    const r = RARITIES[pet.rarity];
    const statName = { atk: 'Attack', hp: 'Max HP', xp: 'Fight EXP', gold: 'Gold' }[pet.stat];
    if (!o) {
      this.modal(`<h2 class="stroke" style="color:${r.color}">${pet.name}</h2><img src="${this.preview.petImage(pet)}" width="120" style="filter:brightness(.3)">${this.skillBox(pet)}<p class="muted">${r.name} pet · +${statName}. Summon to unlock!</p><button class="btn" id="pmC">CLOSE</button>`,
        (c) => { $('#pmC', c).onclick = () => this.closeModal(); });
      return;
    }
    const need = petCardsNeeded(o.lvl);
    const eqIdx = s.petSlots.indexOf(id);
    this.modal(`<h2 class="stroke" style="color:${r.color}">${pet.name} · Lv.${o.lvl}</h2>
      <img src="${this.preview.petImage(pet)}" width="130">
      <div class="set-row"><span>${statName}</span><b>+${petBonus(pet, o.lvl).toFixed(1)}% <span style="color:var(--green)">→ +${petBonus(pet, o.lvl + 1).toFixed(1)}%</span></b></div>
      <div class="set-row"><span>Cards</span><b>${o.cards} / ${need}</b></div>
      ${this.skillBox(pet)}
      <p class="muted">Equipped pets fight beside you. Skills get stronger with every level.</p>
      <div class="modal-btns">
        <button class="btn green" id="pmUp" ${o.cards >= need ? '' : 'disabled'}>LEVEL UP</button>
        <button class="btn teal" id="pmEq">${eqIdx >= 0 ? 'UNEQUIP' : 'EQUIP'}</button>
      </div><button class="btn small" id="pmC">CLOSE</button>`, (c) => {
      $('#pmC', c).onclick = () => this.closeModal();
      $('#pmUp', c).onclick = () => { o.cards -= need; o.lvl++; Audio.play('level'); queueSave(); this.petModal(id); this.renderPets(); this.hooks.gearChanged?.(); };
      $('#pmEq', c).onclick = () => {
        if (eqIdx >= 0) s.petSlots[eqIdx] = null;
        else {
          let free = s.petSlots.indexOf(null);
          if (free < 0) free = 0;
          s.petSlots[free] = id;
        }
        Audio.play('buy'); queueSave(); this.closeModal(); this.renderPets(); this.hooks.gearChanged?.();
      };
    });
  },

  // ---------------- talents ----------------
  cheapestTalent() {
    const s = Save.state;
    const tier = s.talentTier;
    if (tier >= TALENT_TIERS.length) return null;
    let min = null;
    for (const n of TALENT_NODES) {
      const lvl = s.talents[`${tier}:${n.id}`] || 0;
      if (lvl < TALENT_MAX) { const c = talentCost(tier, lvl); if (min === null || c < min) min = c; }
    }
    return min;
  },

  renderTalents() {
    const s = Save.state;
    const sec = $('#scr-talents');
    const top = Math.min(TALENT_TIERS.length - 1, s.talentTier + 1);
    let html = '';
    for (let t = top; t >= 0; t--) {
      const locked = t > s.talentTier;
      html += `<div class="talent-tier" data-tier="${t}">
        <div class="talent-hex">${icon(locked ? 'lock' : 'star')}</div>
        <div class="tier-name stroke">${TALENT_TIERS[t]}</div>
        <div class="talent-row">${TALENT_NODES.map(n => {
          const lvl = s.talents[`${t}:${n.id}`] || 0;
          const ic = { atk: 'fist', hp: 'heart', xp: 'star', gold: 'coin' }[n.id];
          const cls = locked ? 'locked' : lvl >= TALENT_MAX ? 'max' : '';
          return `<button class="talent-node ${cls}" data-t="${t}" data-n="${n.id}">
            ${icon(ic)}<span class="stroke">${n.desc.replace('{v}', n.per)}</span>
            <span class="tl stroke">${lvl >= TALENT_MAX ? 'MAX' : locked ? `0/${TALENT_MAX}` : `${icon('coin')} ${fmt(talentCost(t, lvl))}`}</span>
          </button>`;
        }).join('')}</div>
        <div class="muted">${locked ? 'Max all talents below to unlock' : `${TALENT_NODES.reduce((a, n) => a + (s.talents[`${t}:${n.id}`] || 0), 0)}/${TALENT_NODES.length * TALENT_MAX} learned`}</div>
      </div>${t > 0 ? `<div class="talent-path ${t > s.talentTier ? 'dim' : ''}" style="margin:0 auto"></div>` : ''}`;
    }
    const st = computeStats();
    sec.innerHTML = `<div class="screen-inner">
      <div class="panel stat-strip stroke"><div>${icon('sword')} Global Power ${fmt(st.power)}</div></div>
      <div class="panel">${html}</div></div>`;
    sec.querySelectorAll('.talent-node').forEach(el => el.onclick = () => {
      const t = +el.dataset.t, id = el.dataset.n;
      if (t > s.talentTier) { this.toast('Locked'); Audio.play('error', 0.2); return; }
      const key = `${t}:${id}`;
      const lvl = s.talents[key] || 0;
      if (lvl >= TALENT_MAX) return;
      if (!this.spend('coins', talentCost(t, lvl))) return;
      s.talents[key] = lvl + 1;
      Audio.play('buy');
      if (talentTierDone(t) && s.talentTier === t && t < TALENT_TIERS.length - 1) {
        s.talentTier++;
        Audio.play('level');
        this.toast(`${TALENT_TIERS[s.talentTier]} unlocked!`);
      }
      queueSave();
      this.renderTalents();
      this.hooks.gearChanged?.();
    });
    const cur = sec.querySelector(`[data-tier="${s.talentTier}"]`);
    cur?.scrollIntoView({ block: 'center' });
  },

  // ---------------- ring ----------------
  ringCost() {
    const r = Save.state.ring;
    if (r.tier >= RING_TIERS.length - 1 && r.star >= 10) return Infinity;
    return r.star >= 10 ? ringStarCost(r.tier + 1, 0) * 3 : ringStarCost(r.tier, r.star);
  },

  renderRing() {
    const s = Save.state;
    const sec = $('#scr-ring');
    const r = s.ring;
    const t = RING_TIERS[r.tier];
    const maxed = r.tier >= RING_TIERS.length - 1 && r.star >= 10;
    const tierUp = r.star >= 10 && !maxed;
    const cur = ringStarStats(r.tier, r.star);
    const nxt = tierUp ? ringStarStats(r.tier + 1, 0) : ringStarStats(r.tier, Math.min(10, r.star + 1));
    const cost = this.ringCost();
    const statRow = (ic, name, a, b) => `${icon(ic)}<span>${name}</span><b>+${a}</b><span class="arrow">➜</span><b style="color:var(--green)">+${b}</b>`;
    sec.innerHTML = `<div class="screen-inner split">
      <div class="panel">
        <div class="ring-view" id="ringView"></div>
        <div class="ring-title stroke" style="margin-top:8px">${t.name}</div>
        <div class="ring-sub stroke">Tier-${r.tier + 1}</div>
      </div>
      <div class="panel" style="display:flex;flex-direction:column;gap:10px">
        <h3 class="stroke" style="margin:0 auto">Basic Stats</h3>
        <div class="stat-table stroke">
          ${statRow('heart', 'Max HP', cur.hp, nxt.hp)}
          ${statRow('fist', 'Damage', Math.round(cur.atk * 0.2), Math.round(nxt.atk * 0.2))}
          ${statRow('shield', 'Defence', cur.def, nxt.def)}
        </div>
        <h3 class="stroke" style="margin:0 auto">Ring Traits</h3>
        ${RING_TRAITS.map(tr => {
          const on = r.tier > tr.tier || (r.tier === tr.tier && r.star >= 5);
          return `<div class="trait ${on ? '' : 'locked'}"><span class="b"></span>${on ? '' : `T${tr.tier + 1}★5 `}${tr.desc}</div>`;
        }).join('')}
        <div class="stars">${Array.from({ length: 10 }, (_, i) => `<span class="${i < r.star ? '' : 'off'}">${icon('star')}</span>`).join('')}</div>
        <button class="btn green" id="ringUp" ${maxed ? 'disabled' : ''}>${maxed ? 'MAXED' : tierUp ? 'TIER UP' : 'LEVEL UP'} ${maxed ? '' : `${icon('coin')} ${fmt(cost)}`}</button>
      </div></div>`;
    this.preview.mount($('#ringView', sec), 'ring');
    $('#ringUp', sec).onclick = () => {
      if (!this.spend('coins', cost)) return;
      if (tierUp) { r.tier++; r.star = 0; this.toast(`${RING_TIERS[r.tier].name} unlocked!`); Audio.play('win'); }
      else { r.star++; Audio.play('buy'); }
      queueSave();
      this.renderRing();
      this.hooks.gearChanged?.();
    };
  },
};
