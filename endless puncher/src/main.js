import * as THREE from 'three';
import '@fontsource/lilita-one/latin-400.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import './style.css';
import { Sdk } from './sdk.js';
import { Save, queueSave } from './save.js';
import { Battle } from './battle.js';
import { CarEvent } from './event.js';
import { Preview } from './preview.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { icon, art, spriteUrl } from './icons.js';
import { fmt, computeStats, getItem } from './stats.js';
import { RARITIES, GEAR_SLOTS, gearStat } from './data.js';

const $ = (s) => document.querySelector(s);
const EVENT_COOLDOWN = 5 * 60 * 1000;

let renderer, battle, carEvent, preview;
let tab = 'battle';
let mode = 'battle'; // 'battle' | 'event'
let adPlaying = false;
let hidden = false;
let revivedThisRun = false;
let stagesSinceAd = 0;
let lastTime = performance.now();

function setLoad(p) { $('#loadFill').style.transform = `scaleX(${p})`; }

async function boot() {
  setLoad(0.1);
  await Sdk.init();
  Sdk.loadingStart();
  setLoad(0.3);
  Save.load();
  Audio.setMuted(Save.state.muted);
  Audio.setMusicMuted(!!Save.state.musicMuted);
  Audio.setSdkMuted(Sdk.muteAudio);
  Sdk.onSettings((s) => { if ('muteAudio' in s) Audio.setSdkMuted(s.muteAudio); });

  renderer = new THREE.WebGLRenderer({ canvas: $('#view'), antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  setLoad(0.5);

  battle = new Battle(renderer, {
    onHud: () => renderHud(),
    onLevelUp: (choices) => showLevelUp(choices),
    onEnd: (win) => onBattleEnd(win),
    onBoss: (on) => $('#bossBar').classList.toggle('hidden', !on),
    onAlert: (text) => UI.alertFx(text),
    onCombo: (c) => UI.rewardFx(`COMBO: ${c.name}!`, c.desc),
  });
  carEvent = new CarEvent(renderer, {
    onHud: (ev) => { $('#evTotal').textContent = fmt(ev.total); },
    onEnd: (coins) => onEventEnd(coins),
  });
  preview = new Preview();
  setLoad(0.75);

  UI.init(preview, {
    adStart: () => setAdPlaying(true),
    adEnd: () => setAdPlaying(false),
    gearChanged: () => { battle.applyLooks(); UI.renderCurrencies(); },
  });

  // Adblock users keep a fully playable game; rewarded buttons are swapped for a notice.
  Sdk.hasAdblock().then((b) => UI.setAdblock(b));

  bindNav();
  bindInput();
  bindHudButtons();
  onResize();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 200));
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; Audio.setPaused(hidden); if (hidden) Save.save(); });
  window.addEventListener('pagehide', () => Save.save());
  // Keep the page from scrolling on game keys (CrazyGames requirement).
  window.addEventListener('keydown', (e) => { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('wheel', (e) => { if (!e.target.closest('.screen, #modalCard')) e.preventDefault(); }, { passive: false });

  startStage();
  if (import.meta.env.DEV) window.__game = { battle, carEvent, Save, UI, syncGameplay, Audio };
  setLoad(1);
  Sdk.loadingStop();
  setTimeout(() => {
    $('#loading').style.opacity = 0;
    setTimeout(() => $('#loading').remove(), 400);
    offlineEarnings();
  }, 250);
  requestAnimationFrame(loop);
}

// ---------------- loop ----------------
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  if (hidden) return;
  syncGameplay();
  const frozen = adPlaying;
  if (mode === 'event') {
    if (!frozen) carEvent.update(dt);
    carEvent.render();
  } else {
    battle.paused = frozen || tab !== 'battle' || battle.pendingLevels > 0 || UI.modalOpen && !levelUpOpen;
    if (battle.pendingLevels > 0) battle.paused = true;
    battle.update(dt);
    if (tab === 'battle') battle.render();
  }
  preview.update(dt);
  updateEventButton();
}

// During any video ad: pause the game, mute audio and block all input.
function setAdPlaying(on) {
  adPlaying = on;
  Audio.setPaused(on);
  $('#adShield').classList.toggle('hidden', !on);
}

// Single source of truth for CrazyGames gameplayStart/Stop: gameplay is "on" only while the
// player is actually fighting (menus, results, pause dialogs and ads count as breaks).
// Focus loss is deliberately ignored; the platform handles that itself.
function syncGameplay() {
  const active = !adPlaying && (mode === 'event'
    ? carEvent.running && !carEvent.done
    : tab === 'battle' && battle.running && !battle.over && (!UI.modalOpen || levelUpOpen));
  if (active) Sdk.gameplayStart(); else Sdk.gameplayStop();
}

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  battle.resize(w, h);
  carEvent.resize(w, h);
  preview.resize();
}

// ---------------- tabs ----------------
function bindNav() {
  for (const b of document.querySelectorAll('#nav button')) {
    b.onclick = () => { Audio.unlock(); Audio.play('click'); switchTab(b.dataset.tab); };
  }
}

function switchTab(t) {
  if (mode === 'event' && t !== 'battle') return UI.toast('Finish the event first!');
  tab = t;
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  preview.unmount();
  const inBattle = t === 'battle';
  document.body.classList.toggle('menu', !inBattle);
  Audio.setMusicMode(inBattle ? 'battle' : 'menu');
  $('#hud').classList.toggle('hidden', !inBattle || mode === 'event');
  $('#floaters').classList.toggle('hidden', !inBattle);
  if (inBattle) {
    battle.applyLooks();
  } else {
    $(`#scr-${t}`).classList.add('active');
    ({ pet: () => UI.renderPets(), talents: () => UI.renderTalents(), inventory: () => UI.renderInventory(), ring: () => UI.renderRing() })[t]();
  }
  UI.renderCurrencies();
}

// ---------------- battle flow ----------------
function startStage() {
  revivedThisRun = false;
  battle.start(Save.state.stage);
  $('#bossBar').classList.add('hidden');
  renderHud();
}

let levelUpOpen = false;
function showLevelUp(choices) {
  levelUpOpen = true;
  UI.modal(`<h2 class="stroke">LEVEL UP!</h2><p class="muted">Choose a skill</p>
    <div class="skill-list">${choices.map(c => `
      <button class="skill-card ${c.combo ? 'has-combo' : ''}" data-id="${c.id}">
        ${c.combo ? `<span class="combo-tag stroke">COMBO: ${c.combo}</span>` : ''}
        ${spriteUrl('skill_' + c.id) ? `<span class="sic art">${art('skill_' + c.id)}</span>` : `<span class="sic" style="background:${c.color}">${icon(c.icon)}</span>`}
        <b class="stroke">${c.name}</b>
        <span class="d">${c.desc}</span>
        ${c.max < 99 ? `<span class="pips">${Array.from({ length: c.max }, (_, i) => `<i class="${i < c.cur + 1 ? 'on' : ''}"></i>`).join('')}</span>` : ''}
      </button>`).join('')}</div>`, (card) => {
    card.querySelectorAll('.skill-card').forEach(el => el.onclick = () => {
      Audio.play('buy');
      levelUpOpen = false;
      UI.closeModal();
      battle.chooseSkill(el.dataset.id);
    });
  }, { closable: false });
}

function stageRewards(win) {
  const s = Save.state;
  const st = battle.stats;
  const stage = battle.stage;
  const base = Math.round(40 * Math.pow(1.22, stage - 1) * st.goldMult);
  return {
    coins: (win ? base : Math.round(base * 0.25)) + battle.runCoins,
    gems: win ? 4 + Math.floor(stage / 2) : 0,
    shards: win ? 3 + Math.floor(stage / 3) : 1,
    item: win && (Math.random() < 0.75 || stage <= 3),
  };
}

function onBattleEnd(win) {
  const r = stageRewards(win);
  const s = Save.state;
  if (win) {
    Sdk.happytime();
    s.stats.stages++;
    const item = r.item ? UI.rollItem(battle.stage) : null;
    const itemHtml = item ? `<div class="reward r${item.rarity}">${icon(item.slot)}<span class="stroke">${RARITIES[item.rarity].name}</span></div>` : '';
    const grant = (mult) => {
      s.coins += r.coins * mult; s.gems += r.gems * mult; s.shards += r.shards * mult;
      s.stage++;
      s.bestStage = Math.max(s.bestStage, s.stage);
      if (s.stage >= 4) s.speedUnlocked = true;
      Save.save();
      UI.renderCurrencies('coin');
      UI.closeModal();
      afterStage();
    };
    UI.modal(`<h2 class="stroke" style="color:#ffe066">STAGE ${battle.stage} CLEARED!</h2>
      <div class="reward-row">
        <div class="reward">${icon('coin')}<span class="stroke">${fmt(r.coins)}</span></div>
        <div class="reward">${icon('gem')}<span class="stroke">${r.gems}</span></div>
        <div class="reward">${icon('shard')}<span class="stroke">${r.shards}</span></div>
        ${itemHtml}
      </div>
      <div class="modal-btns">
        ${UI.adReady('double') ? UI.adBtn('rwAd', 'CLAIM x2') : ''}
        <button class="btn green" id="rwOk">CLAIM</button>
      </div>`, (c) => {
      c.querySelector('#rwOk').onclick = () => grant(1);
      const ad = c.querySelector('#rwAd');
      if (ad) ad.onclick = async () => {
        const ok = await UI.rewardedAd('Rewards doubled!');
        if (ok) UI.markAd('double');
        grant(ok ? 2 : 1);
      };
    }, { closable: false });
  } else {
    UI.modal(`<h2 class="stroke" style="color:#ff6a6a">DEFEATED</h2>
      <p class="muted">Upgrade gear, talents, pets and the ring to get stronger!</p>
      <div class="reward-row">
        <div class="reward">${icon('coin')}<span class="stroke">${fmt(r.coins)}</span></div>
        <div class="reward">${icon('shard')}<span class="stroke">${r.shards}</span></div>
      </div>
      <div class="modal-btns">
        ${revivedThisRun ? '' : UI.adBtn('dfRevive', 'REVIVE')}
        <button class="btn green" id="dfRetry">RETRY</button>
      </div>`, (c) => {
      c.querySelector('#dfRetry').onclick = () => {
        s.coins += r.coins; s.shards += r.shards;
        Save.save();
        UI.renderCurrencies('coin');
        UI.closeModal();
        afterStage();
      };
      const rv = c.querySelector('#dfRevive');
      if (rv) rv.onclick = async () => {
        if (await UI.rewardedAd('Revived!')) {
          revivedThisRun = true;
          UI.closeModal();
          battle.revive();
        }
      };
    }, { closable: false });
  }
}

async function afterStage() {
  stagesSinceAd++;
  // Midgame ad at natural breaks, not more than every other stage.
  if (stagesSinceAd >= 2) {
    stagesSinceAd = 0;
    await Sdk.midgame({ onStart: () => setAdPlaying(true), onEnd: () => setAdPlaying(false) });
    setAdPlaying(false);
  }
  UI.renderMission();
  startStage();
}

// ---------------- event ----------------
function eventReady() { return Date.now() - Save.state.lastEvent >= EVENT_COOLDOWN; }

let lastEvBtn = '';
function updateEventButton() {
  const b = $('#btnEvent');
  const ready = eventReady();
  let label;
  if (ready) label = 'EVENT!';
  else {
    const left = Math.ceil((EVENT_COOLDOWN - (Date.now() - Save.state.lastEvent)) / 1000);
    label = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  }
  if (label === lastEvBtn) return;
  lastEvBtn = label;
  b.classList.toggle('cooldown', !ready);
  b.innerHTML = `${icon('car')}<small class="stroke">${label}</small>`;
}

function startEvent() {
  mode = 'event';
  Audio.play('whoosh');
  $('#hud').classList.add('hidden');
  $('#floaters').classList.add('hidden');
  $('#eventHud').classList.remove('hidden');
  const glove = getItem(Save.state.equipped.gloves);
  // Mirror the battle hero's equipped gear onto the event hero.
  const src = battle.player.gear, dst = carEvent.player.gear;
  for (const k of ['helmet', 'belt', 'armor', 'band']) {
    dst[k].visible = src[k].visible;
    dst[k].material.color.copy(src[k].material.color);
  }
  for (const k of ['shoes', 'pants']) src[k].forEach((m, i) => { dst[k][i].visible = m.visible; dst[k][i].material.color.copy(m.material.color); });
  carEvent.start(glove && glove.rarity > 0 ? RARITIES[glove.rarity].color : '#e23b3b');
  $('#evTotal').textContent = '0';
  const timer = setInterval(() => {
    if (mode !== 'event') { clearInterval(timer); return; }
    $('#evTimer').textContent = Math.ceil(carEvent.time);
  }, 100);
}

function onEventEnd(coins) {
  Save.state.lastEvent = Date.now();
  Audio.play('win');
  UI.modal(`<h2 class="stroke" style="color:#ffe066">CAR SMASHED!</h2>
    <p class="stroke">Total damage: ${fmt(carEvent.total)}</p>
    <div class="reward-row"><div class="reward">${icon('coin')}<span class="stroke">${fmt(coins)}</span></div></div>
    <div class="modal-btns">${UI.adBtn('evAd', 'CLAIM x3')}<button class="btn green" id="evOk">CLAIM</button></div>`, (c) => {
    const done = (mult) => {
      Save.state.coins += coins * mult;
      Save.save();
      UI.closeModal();
      UI.renderCurrencies('coin');
      mode = 'battle';
      carEvent.running = false;
      $('#eventHud').classList.add('hidden');
      $('#eventDmg').style.opacity = 0;
      $('#hud').classList.remove('hidden');
      $('#floaters').classList.remove('hidden');
    };
    c.querySelector('#evOk').onclick = () => done(1);
    c.querySelector('#evAd').onclick = async () => done((await UI.rewardedAd('Coins tripled!')) ? 3 : 1);
  }, { closable: false });
}

// ---------------- HUD ----------------
function renderHud() {
  if (!battle.stats) return;
  const b = battle;
  $('#stageFill').style.transform = `scaleX(${Math.min(1, b.kills / b.killsNeeded)})`;
  $('#stageLabel').innerHTML = `<span class="stroke">Stage-${b.stage}</span>`;
  $('#hpFill').style.transform = `scaleX(${b.hp / b.maxHp})`;
  $('#hpText').innerHTML = `<span class="stroke">${fmt(b.hp)} / ${fmt(b.maxHp)}</span>`;
  $('#lvlBadge').innerHTML = `<span class="stroke">${b.level}</span>`;
  $('#xpFill').style.transform = `scaleX(${Math.min(1, b.xp / b.xpNext)})`;
  if (b.boss) $('#bossFill').style.transform = `scaleX(${Math.max(0, b.boss.hp / b.boss.maxHp)})`;
  UI.renderMission();
}

function renderSpeedBtn() {
  const s = Save.state;
  const btn = $('#btnSpeed');
  const on = battle.timeScale > 1;
  btn.classList.toggle('on', on);
  btn.innerHTML = s.speedUnlocked
    ? `${icon('speed')}<span class="stroke">SPEED x${on ? 2 : 1}</span>`
    : `${icon('lock')}<span class="stroke">UNLOCK<br>SPEED UP</span>`;
}

function bindHudButtons() {
  renderSpeedBtn();
  $('#btnSpeed').onclick = async () => {
    Audio.unlock();
    const s = Save.state;
    if (s.speedUnlocked) {
      battle.timeScale = battle.timeScale > 1 ? 1 : 2;
      renderSpeedBtn();
      return;
    }
    if (battle.over) return;
    UI.modal(`<h2 class="stroke">SPEED UP</h2>
      <p class="muted">Fight at 2x speed. Unlocks for free when you reach Stage 4, or watch a video to unlock it now.</p>
      <div class="modal-btns">${UI.adBtn('spAd', 'UNLOCK NOW')}<button class="btn green" id="spNo">LATER</button></div>`, (c) => {
      c.querySelector('#spNo').onclick = () => UI.closeModal();
      c.querySelector('#spAd').onclick = async () => {
        if (await UI.rewardedAd('2x speed unlocked!')) { s.speedUnlocked = true; battle.timeScale = 2; queueSave(); }
        UI.closeModal();
        renderSpeedBtn();
      };
    });
  };
  $('#btnEvent').onclick = async () => {
    Audio.unlock();
    if (mode === 'event' || battle.over) return;
    if (eventReady()) return startEvent();
    UI.modal(`<h2 class="stroke">CAR SMASH</h2><p class="muted">Punch a car for 20 seconds and earn coins for every hit!</p>
      <p class="stroke">Next free event in <span id="evLeft">${lastEvBtn}</span></p>
      <div class="modal-btns">${UI.adBtn('evNow', 'PLAY NOW')}<button class="btn green" id="evNo">LATER</button></div>`, (c) => {
      const tick = setInterval(() => {
        const el = c.querySelector('#evLeft');
        if (!el || !UI.modalOpen) return clearInterval(tick);
        el.textContent = lastEvBtn;
      }, 500);
      c.querySelector('#evNo').onclick = () => UI.closeModal();
      c.querySelector('#evNow').onclick = async () => {
        const ok = await UI.rewardedAd('Event unlocked!');
        UI.closeModal();
        if (ok) startEvent();
      };
    });
  };
}

// ---------------- input ----------------
function bindInput() {
  const view = $('#view');
  const base = $('#joyBase');
  const knob = $('#joyKnob');
  let active = null;
  let origin = { x: 0, y: 0 };
  const keys = new Set();
  const R = 50;

  const hideHint = () => { $('#hint').style.opacity = 0; };

  view.addEventListener('pointerdown', (e) => {
    Audio.unlock();
    if (mode === 'event') { carEvent.tap(); return; }
    if (tab !== 'battle' || active !== null) return;
    active = e.pointerId;
    origin = { x: e.clientX, y: e.clientY };
    const r = $('#hud').getBoundingClientRect();
    base.style.left = `${e.clientX - r.left}px`;
    base.style.top = `${e.clientY - r.top}px`;
    knob.style.transform = 'translate(-50%,-50%)';
    base.classList.remove('hidden');
    view.setPointerCapture(e.pointerId);
    hideHint();
  });
  view.addEventListener('pointermove', (e) => {
    if (e.pointerId !== active) return;
    let dx = e.clientX - origin.x, dy = e.clientY - origin.y;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    const k = d < 8 ? 0 : 1;
    battle.setInput((dx / R) * k, (-dy / R) * k);
  });
  const end = (e) => {
    if (e.pointerId !== active) return;
    active = null;
    base.classList.add('hidden');
    battle.setInput(0, 0);
  };
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);

  const applyKeys = () => {
    let x = 0, y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x -= 1;
    if (keys.has('d') || keys.has('arrowright')) x += 1;
    if (keys.has('w') || keys.has('arrowup')) y += 1;
    if (keys.has('s') || keys.has('arrowdown')) y -= 1;
    const l = Math.hypot(x, y) || 1;
    battle.setInput(x / l, y / l);
  };
  window.addEventListener('keydown', (e) => {
    Audio.unlock();
    if (mode === 'event' && (e.key === ' ' || e.key === 'Enter')) { carEvent.tap(); return; }
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { keys.add(k); applyKeys(); hideHint(); }
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase());
    applyKeys();
  });
  window.addEventListener('blur', () => { keys.clear(); applyKeys(); });
}

// ---------------- offline ----------------
function offlineEarnings() {
  const s = Save.state;
  const away = (Date.now() - (s.lastSeen || Date.now())) / 1000;
  if (away < 120 || !s.tutorialDone) { s.tutorialDone = true; Save.save(); return; }
  const hours = Math.min(8, away / 3600);
  const coins = Math.round(hours * 120 * Math.pow(1.2, s.bestStage - 1) * computeStats().goldMult) + 10;
  UI.modal(`<h2 class="stroke">WELCOME BACK!</h2><p class="muted">Your brawler trained while you were away.</p>
    <div class="reward-row"><div class="reward">${icon('coin')}<span class="stroke">${fmt(coins)}</span></div></div>
    <div class="modal-btns">${UI.adBtn('ofAd', 'CLAIM x2')}<button class="btn green" id="ofOk">CLAIM</button></div>`, (c) => {
    const give = (m) => { s.coins += coins * m; Save.save(); UI.renderCurrencies('coin'); UI.closeModal(); };
    c.querySelector('#ofOk').onclick = () => give(1);
    c.querySelector('#ofAd').onclick = async () => give((await UI.rewardedAd('Coins doubled!')) ? 2 : 1);
  }, { closable: false });
}

boot();
