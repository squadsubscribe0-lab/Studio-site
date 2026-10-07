(() => {
'use strict';

/* ---------- platform adapter ----------
   js/platform.js (one per portal) defines window.PLATFORM with the same interface everywhere:
   init, loadingStart/Stop, start/stop, happy, context, progress, levelUp, ad(type, done), storageGet/Set,
   room, leftRoom, inviteLink, inviteRoom, instantMultiplayer, username, prepareRewarded, rewardedReady, features. */
const CG = window.PLATFORM;
function showAdWait(v){ $('adwait').hidden = !v; }
let toastT = 0;
function toast(msg){ const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

/* ---------- constants ---------- */
const BLK = 60, TRUNK_W = 150, BASE_REACH = 150, GOLD_BONUS = 90, BASE_PERFECT = 34, BASE_AXE = 2.2, DART_CD = 0.16;
let GROUND = 210;   // world units shown below the ground line; smaller in landscape so the tree gets more of the screen
const PAL_P = { body:'#a0612f', dark:'#7d4a22', face:'#ffd9b0', angry:false };
const PAL_R = { body:'#6c5ce7', dark:'#4b3fbf', face:'#ffd0c2', angry:true };
const INK = '#243056';
const THEMES = [
  { top:'#23c9c0', bot:'#d6fab0', far:'#8fe3b8', near:'#44c38f', accent:'#ff5a5f', grass:'#4cc267', dirt:'#d59a62', dirt2:'#c3884f' },
  { top:'#ff8a7a', bot:'#ffe7a8', far:'#ffc3a0', near:'#f39a78', accent:'#6c5ce7', grass:'#79c86a', dirt:'#d59a62', dirt2:'#c3884f' },
  { top:'#7688ff', bot:'#ffcbe8', far:'#b3a9ff', near:'#9384f0', accent:'#ffb400', grass:'#63c98a', dirt:'#c48d63', dirt2:'#b07b52' }
];
const STICKS = [
  { name:'Bamboo Dart',    lv:1,  shaft:'#fff4dc', fl:'accent' },
  { name:'Bone Spear',     lv:15, shaft:'#f3ede0', knob:true },
  { name:'Candy Cane',     lv:30, shaft:'#ffffff', stripes:'#ff5a5f', fl:'#ff5a5f' },
  { name:'Ice Shard',      lv:45, shaft:'#c9f1ff', fl:'#4fc3f7', glow:'rgba(140,220,255,.5)' },
  { name:'Golden Trident', lv:60, shaft:'#ffcf3f', trident:true },
  { name:'Lava Spike',     lv:75, shaft:'#ff7b39', fl:'#ffcf3f', glow:'rgba(255,120,50,.45)' },
  { name:'Rainbow Stick',  lv:90, rainbow:true, fl:'#ffffff' }
];
const UPG = [
  { id:'jump',    name:'Longer jump',    col:'#3ddc6f', eff:l => '+' + l * 6 + ' reach',
    svg:'<svg viewBox="0 0 24 24"><path d="M12 2l7 8h-4v6H9v-6H5z" fill="#fff"/><rect x="6" y="19" width="12" height="3" rx="1.5" fill="#fff"/></svg>' },
  { id:'perfect', name:'Bigger perfect', col:'#ffb400', eff:l => 'Zone +' + l * 4,
    svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="3"/><circle cx="12" cy="12" r="3.5" fill="#fff"/></svg>' },
  { id:'axe',     name:'Axe recharge',   col:'#23c9c0', eff:l => (BASE_AXE - l * 0.14).toFixed(1) + 's cooldown',
    svg:'<svg viewBox="0 0 24 24"><rect x="10" y="4" width="3.5" height="18" rx="1.7" fill="#fff" transform="rotate(35 12 13)"/><path d="M5 3c4-1 8 1 9 4.5l-4.5 3C7.5 8 5.5 6 5 3z" fill="#fff"/></svg>' },
  { id:'coins',   name:'More bananas',   col:'#ff5a5f', eff:l => '+' + l * 15 + '% bananas',
    svg:'<svg viewBox="0 0 24 24"><path d="M6 5c-1 7 3 13 13 12 1 0 1.2-1.4.4-1.8C13 14 9 10 8.6 5 8.4 3.8 6.2 3.8 6 5z" fill="#fff"/></svg>' }
];
const UPG_MAX = 10;
const SKIP_COST = 150;
const upCost = l => Math.round(80 * Math.pow(1.55, l));
const BANANA_SVG = '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#ffcf3f"/><circle cx="16" cy="16" r="11" fill="#ffe27a"/><path d="M10 10c-1 7 3 12 12 11 1 0 1-1.2.3-1.6C16 18 13 15 12.4 10c-.2-1-2.2-1-2.4 0z" fill="#e0a800"/></svg>';
const CHEST_SVG = '<svg viewBox="0 0 32 32"><rect x="3" y="13" width="26" height="15" rx="3" fill="#c7773f"/><path d="M3 15c0-6 4-10 13-10s13 4 13 10z" fill="#e39a52"/><rect x="3" y="13" width="26" height="4" fill="#8a4a24"/><rect x="13" y="12" width="6" height="8" rx="2" fill="#ffcf3f"/></svg>';

/* ---------- dom ---------- */
const $ = id => document.getElementById(id);
const stage = $('stage'), cvs = $('c');
let ctx = cvs.getContext('2d');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- save ---------- */
const SAVE_KEY = 'jungle-ladder-v3';
let save = { level:1, bananas:0, muted:false, stick:0, seenSticks:1, up:{ jump:0, perfect:0, axe:0, coins:0 } };
let isNewPlayer = true;
/* Saving goes through the platform adapter (CrazyGames Data module, GamePix storage, Yandex player data, or localStorage). */
function storeGet(){ try{ return CG.storageGet(SAVE_KEY); }catch(e){ return null; } }
function loadSave(){
  const raw = storeGet(); isNewPlayer = raw == null;
  try{ const s = JSON.parse(raw); if(s){ save = Object.assign(save, s); save.up = Object.assign({ jump:0, perfect:0, axe:0, coins:0 }, s.up || {}); } }catch(e){}
  shownCoins = save.bananas;
}
function persist(){ try{ CG.storageSet(SAVE_KEY, JSON.stringify(save)); }catch(e){} }
let shownCoins = 0;
const progressPct = () => Math.min(100, Math.floor((save.level - 1) / 90 * 100));
const stickUnlocked = i => i === 0 || save.level > STICKS[i].lv;
const unlockedCount = () => STICKS.filter((s, i) => stickUnlocked(i)).length;

/* ---------- audio & haptics ---------- */
let AC = null;
const isMuted = () => save.muted || CG.muted || CG.adPlaying || CG.platformPaused || document.hidden;
function audio(){ if(!AC){ try{ AC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} } applyAudio(); }
function applyAudio(){ if(!AC) return; try{ if(isMuted()){ if(AC.state === 'running') AC.suspend(); } else if(AC.state === 'suspended') AC.resume(); }catch(e){} }
function tone(f1, f2, dur, type='sine', vol=0.08, delay=0){
  if(!AC || isMuted()) return;
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
}
const buzz = ms => { try{ navigator.vibrate && navigator.vibrate(ms); }catch(e){} };
const SFX = {
  throw:  () => tone(1200, 700, 0.06, 'triangle', 0.03),
  thunk:  () => tone(260, 110, 0.08, 'square', 0.05),
  perfect:(k) => { const b = 660 * Math.pow(1.06, Math.min(k, 8)); tone(b, b * 1.5, 0.12, 'sine', 0.08); tone(b * 1.5, b * 2, 0.1, 'sine', 0.05, 0.07); },
  clang:  () => { tone(1500, 900, 0.12, 'triangle', 0.06); tone(2200, 1500, 0.08, 'sine', 0.035); },
  coin:   () => tone(1300, 1900, 0.06, 'sine', 0.04),
  bonk:   () => tone(340, 110, 0.22, 'sawtooth', 0.05),
  jump:   () => tone(420, 700, 0.07, 'sine', 0.025),
  crumble:() => tone(170, 60, 0.28, 'sawtooth', 0.045),
  axe:    () => tone(150, 70, 0.15, 'square', 0.08),
  squawk: () => tone(760, 1200, 0.1, 'sawtooth', 0.035),
  buy:    () => { tone(700, 1400, 0.1, 'sine', 0.07); tone(1050, 2100, 0.1, 'sine', 0.05, 0.08); },
  beep:   (hi) => tone(hi ? 1320 : 660, hi ? 1320 : 660, hi ? 0.3 : 0.15, 'triangle', 0.08),
  win:    () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.07, i * 0.09)),
  lose:   () => [440, 370, 311, 262].forEach((f, i) => tone(f, f * 0.96, 0.2, 'triangle', 0.06, i * 0.13))
};

/* ---------- layout ---------- */
let dpr = 1, SC = 1, VW = 540, VH = 960, trunkCX = 230, FR = 305, FL = 155;
function resize(){
  const r = stage.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  cvs.width = Math.max(1, Math.round(r.width * dpr)); cvs.height = Math.max(1, Math.round(r.height * dpr));
  const land = r.width > r.height;
  SC = Math.min(r.width / 540, r.height / (land ? 640 : 820));   // landscape (all CrazyGames desktop sizes) zooms in more
  GROUND = land ? 120 : 210;
  VW = r.width / SC; VH = r.height / SC;
  trunkCX = VW / 2 - 40; FR = trunkCX + TRUNK_W / 2; FL = trunkCX - TRUNK_W / 2;
}
window.addEventListener('resize', resize);
window.addEventListener('wheel', e => e.preventDefault(), { passive:false });
const spawnX = () => VW + 40;
const flyMaxX = () => Math.min(VW - 40, FR + 420);

/* ---------- helpers ---------- */
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const easeOut = k => 1 - (1 - k) * (1 - k);
const rnd = (a, b) => a + Math.random() * (b - a);
function rr(x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function ell(x, y, rx, ry, rot = 0){ ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function circ(x, y, r, col){ ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
let G = null;
const sy = wy => VH - GROUND - (wy - G.camY);
const wyFromSy = s => G.camY + (VH - GROUND - s);

/* ---------- level ---------- */
function newLevel(n, mode){
  const R = mulberry32(n * 7919 + 13);
  const towerH = 1500 + Math.min(n - 1, 12) * 250;
  const nb = Math.ceil(towerH / BLK);
  const pStone = n < 2 ? 0.05 : Math.min(0.26, 0.07 + 0.025 * n);
  const pRot   = n < 2 ? 0 : Math.min(0.22, 0.04 + 0.025 * n);
  const maxRun = 1;                      // never stack stone: from anywhere below it, the reach zone (88 tall) always has open bark above a 60-tall stone
  const blocks = []; let run = 0;
  for(let i = 0; i < nb; i++){
    let type = 'bark';
    if(i >= 3 && i < nb - 2){
      const r = R();
      if(r < pStone && run < maxRun) type = 'stone';
      else if(r >= pStone && r < pStone + pRot) type = 'rot';
    }
    run = type === 'stone' ? run + 1 : 0;
    const b = { type, k:R() };
    if(type === 'bark' && i >= 2 && i < nb - 1 && R() < 0.17) b.banana = { y: i * BLK + 16 + R() * 28, taken:false };
    blocks.push(b);
  }
  // the blocks touching a stone run must be solid bark, or the landing spot could crumble away
  for(let i = 0; i < nb; i++) if(blocks[i].type === 'stone'){
    for(const j of [i - 1, i + 1]) if(blocks[j] && blocks[j].type === 'rot') blocks[j].type = 'bark';
  }
  // two rotten blocks in a row would leave a 120-tall hole once both crumble, so split them
  for(let i = 1; i < nb; i++) if(blocks[i].type === 'rot' && blocks[i - 1].type === 'rot') blocks[i].type = 'bark';
  const toucans = [];
  if(n >= 3){
    const count = Math.floor(towerH / 560) + (n >= 6 ? 1 : 0);
    const nearStone = y => { for(let i = Math.floor((y - 110) / BLK); i <= Math.floor((y + 110) / BLK); i++){ const b = blocks[i]; if(b && b.type === 'stone') return true; } return false; };
    for(let k = 0; k < count; k++){
      let y = 420 + (k + 0.2 + R() * 0.6) * ((towerH - 600) / count);
      for(let tries = 0; tries < 12 && nearStone(y); tries++) y += 60;          // keep birds away from stone so a gap always exists
      if(nearStone(y) || y > towerH - 250 || toucans.some(o => Math.abs(o.y - y) < 280)) continue;   // never two birds in the same reach zone
      toucans.push({ y, baseY:y, fx:R(), dir:R() < 0.5 ? -1 : 1, sp: 55 + R() * 45 + n * 4, flap:R() * 6, dead:false, vy:0, rot:0, hitT:0, x:null, flee:0 });
    }
  }
  const up = mode === 'solo' ? save.up : { jump:0, perfect:0, axe:0, coins:0 };
  const gR = { y:0, side:'R', kind:'ground' }, gL = { y:0, side:'L', kind:'ground' };
  G = {
    n, mode, towerH, nb, blocks, toucans, theme:THEMES[(n - 1) % THEMES.length],
    reach:BASE_REACH + up.jump * 6, perf:BASE_PERFECT + up.perfect * 4, axeCd:BASE_AXE - up.axe * 0.14, coinMul:1 + up.coins * 0.15,
    myStick:save.stick, rivalStick: mode === 'online' ? NET.remoteStick : 0,
    plats:[gR, gL], projs:[], parts:[], pops:[], flies:[], holes:[],
    camY:0, time:0, started:false, over:false, result:null, overT:0, endShown:false,
    earned:0, bonus:0, chest:0, newStick:-1, streak:0, perfects:0, cd:{ dart:0, axe:0 }, armed:false, shake:0, said:{},
    count:mode === 'online' ? 3.4 : 0, lastCount:0, netT:0,
    player:{ y:0, plat:gR, state:'idle', t:0, dur:0, fromY:0, toY:0, target:null, idleT:0.2, stunT:0, stunAfter:0, vy:0, squash:0, top:false, blink:2 },
    rival:{ y:0, ty:0, rst:'idle', state:'idle', t:0, dur:0, fromY:0, toY:0, timer:1.4, sweat:0, squash:0, blink:3 }
  };
  document.documentElement.style.setProperty('--page-bg', G.theme.top);
  document.body.classList.toggle('online', mode === 'online');
  $('lvA').textContent = mode === 'online' ? 'VS' : n; $('lvB').textContent = mode === 'online' ? '🏁' : n + 1;
  $('lvA').style.fontSize = mode === 'online' ? '14px' : '';
  hideEnd(); setArmed(false); refreshCoins(true);
  if(mode === 'solo'){ pop(FR + 60, VH * 0.38, 'Level ' + n, '#ffffff', 46, true); CG.start(); }
  else CG.stop();
  CG.context(mode === 'menu' ? null : { mode, level:n, stick:STICKS[save.stick].name, bananas:save.bananas, upgrades:JSON.stringify(save.up) });
}

/* ---------- ui helpers ---------- */
function refreshCoins(instant){ if(instant) shownCoins = save.bananas; $('coins').textContent = shownCoins; refreshBadges(); }
function bumpCoins(){ const b = $('coinsBox'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
function canAffordUpgrade(){ return UPG.some(u => save.up[u.id] < UPG_MAX && save.bananas >= upCost(save.up[u.id])); }
function refreshBadges(){
  const a = canAffordUpgrade();
  $('upBadge').hidden = !a; $('endUpBadge').hidden = !a;
  $('stickBadge').hidden = unlockedCount() <= save.seenSticks;
}
function setArmed(v){ if(!G) return; G.armed = v; $('axeBtn').classList.toggle('armed', v); }
function updateMute(){ const m = save.muted || CG.muted; $('snd-on').hidden = m; $('snd-off').hidden = !m; $('mute').setAttribute('aria-label', m ? 'Unmute sound' : 'Mute sound'); $('mute').disabled = CG.muted; }
function hideEnd(){ const e = $('end'); e.classList.remove('show'); e.hidden = true; }

function drawStickPreview(cv, idx, accent){
  const c = cv.getContext('2d'), w = cv.width, h = cv.height, s = w / 112;
  const saved = ctx; ctx = c;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  c.translate(w / 2 - 26 * s, h / 2); c.scale(s, s);
  stickShape(STICKS[idx], false, accent || '#ff5a5f');
  ctx = saved;
}

function buildChapter(){
  const n = G.n, ch = Math.floor((n - 1) / 15), start = ch * 15 + 1;
  $('chTitle').textContent = 'Levels ' + start + '–' + (start + 14);
  const nextStick = STICKS[ch + 1];
  const left = start + 14 - n;
  $('chNext').textContent = nextStick ? (left > 0 ? nextStick.name + ' in ' + left : nextStick.name + ' unlocked!') : (left > 0 ? 'Big chest in ' + left : 'Big chest!');
  const nodes = $('nodes'); nodes.innerHTML = '<i class="bar"></i><i class="prog" id="prog"></i>';
  for(let k = 0; k < 15; k++){
    const lvN = start + k, d = document.createElement('i');
    d.className = 'nd' + (lvN < n ? ' done' : lvN === n ? ' now' : '') + (k === 14 ? ' big' : '');
    if(k === 4 || k === 9 || k === 14){
      const rw = document.createElement('span'); rw.className = 'rw' + (lvN <= n ? ' got' : '');
      if(k === 14 && nextStick){ const cv = document.createElement('canvas'); cv.width = 60; cv.height = 60; rw.appendChild(cv);
        setTimeout(() => { const c2 = cv.getContext('2d'); const saved = ctx; ctx = c2; c2.translate(30, 30); c2.rotate(-0.8); c2.scale(0.55, 0.55); c2.translate(-26, 0); stickShape(nextStick, false, '#ff5a5f'); ctx = saved; }, 0); }
      else rw.innerHTML = CHEST_SVG;
      d.appendChild(rw);
    }
    nodes.appendChild(d);
  }
  const pct = Math.max(0, (n - start) / 14 * 100), prev = Math.max(0, (n - 1 - start) / 14 * 100);
  const prog = $('prog'); prog.style.transition = 'none'; prog.style.width = 'calc(' + prev + '% - ' + (prev / 100 * 14) + 'px)';
  requestAnimationFrame(() => requestAnimationFrame(() => { prog.style.transition = ''; prog.style.width = 'calc(' + pct + '% - ' + (pct / 100 * 14) + 'px)'; }));
}

function updateAdButton(){
  if(!G || !G.endShown) return;
  const adB = $('endAd');
  if(G.mode === 'online' || G.watchedAd){ adB.hidden = true; return; }
  if(G.result === 'win') adB.hidden = !(G.n >= 2 && G.earned + G.bonus > 0 && CG.rewardedReady());
  else adB.hidden = !((fails[G.n] || 0) >= 2 && CG.rewardedReady());
}
/* ---------- chest opening ---------- */
function showChest(){
  G.chestShown = true; G.chestOpen = true;
  const cp = $('chestPanel'); cp.classList.remove('opened'); cp.hidden = false;
  $('chestTitle').textContent = G.bigChest ? 'Big chest!' : 'Treasure chest!';
  $('chestHint').hidden = false; $('chestReward').hidden = true; $('chestBtns').hidden = true;
  $('chestAmt').textContent = '+0'; $('chestBurst').innerHTML = '';
  SFX.beep(false);
}
function countUp(el, from, to, ms){
  const t0 = performance.now();
  const step = now => { const k = Math.min(1, (now - t0) / ms); el.textContent = '+' + Math.round(from + (to - from) * (1 - (1 - k) * (1 - k))); if(k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function chestCoins(n){
  const box = $('chestBurst');
  for(let i = 0; i < n; i++){
    const c = document.createElement('i'); box.appendChild(c);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, d = 90 + Math.random() * 90;
    requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transform = 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) scale(' + (0.6 + Math.random() * 0.6) + ')'; c.style.opacity = '0'; }));
  }
}
function openChest(){
  const cp = $('chestPanel'); if(cp.classList.contains('opened') || cp.hidden) return;
  audio(); cp.classList.add('opened'); $('chestHint').hidden = true;
  SFX.axe(); buzz(40);
  setTimeout(() => {
    SFX.win(); chestCoins(14);
    $('chestReward').hidden = false; countUp($('chestAmt'), 0, G.chest, 800);
    [0, 120, 240, 360, 480].forEach(t => setTimeout(SFX.coin, t));
    save.seenChest = 1;
  }, 380);
  setTimeout(() => {
    $('chestBtns').hidden = false;
    $('chestDouble').hidden = !CG.rewardedReady() || G.watchedAd;
  }, 1250);
}
function closeChest(){
  $('chestPanel').hidden = true; G.chestOpen = false;
  refreshCoins(true); bumpCoins(); showEnd();
}
$('chestBtn').addEventListener('click', openChest);
$('chestCollect').addEventListener('click', () => { audio(); closeChest(); });
$('chestDouble').addEventListener('click', () => {
  audio(); const btn = $('chestDouble'); btn.disabled = true;
  CG.ad('rewarded', ok => {
    G.watchedAd = true; btn.hidden = true; btn.disabled = false;
    if(ok){
      const extra = G.chest; save.bananas += extra; G.bonus += extra; persist();
      countUp($('chestAmt'), G.chest, G.chest * 2, 700); G.chest *= 2; chestCoins(10); SFX.buy();
      toast('Doubled! +' + extra + ' bananas');
    } else toast('No ad available right now. Try again later.');
  });
});

function showEnd(){
  G.endShown = true;
  const mode = G.mode, win = G.result === 'win';
  const online = mode === 'online';
  const stars = win && !online ? 1 + (G.rival.y < G.towerH * 0.85 ? 1 : 0) + (G.rival.y < G.towerH * 0.62 ? 1 : 0) : 0;
  $('stars').hidden = !(win && !online); $('rivalFace').hidden = win || G.result === 'left';
  [...$('stars').children].forEach((s, i) => s.classList.toggle('off', i >= stars));
  if(online){
    $('endSmall').textContent = G.result === 'left' ? 'Match ended' : 'Friend match';
    const nm = NET.remoteName || 'Friend';
    $('endBig').textContent = G.result === 'left' ? nm + ' left' : win ? 'You win!' : nm + ' wins';
    $('endBig').style.fontSize = nm.length > 10 && !win ? '36px' : '';
  } else {
    $('endSmall').textContent = win ? 'Level ' + G.n : 'So close!';
    $('endBig').textContent = win ? 'Complete!' : 'Bongo wins';
  }
  $('endCoins').textContent = '+' + (G.earned + G.bonus);
  $('endChest').hidden = !G.chest; $('endChest').textContent = G.chest ? 'incl. chest +' + G.chest : '';
  $('chapter').hidden = online || !win;
  if(!online && win) buildChapter();
  $('unlock').hidden = G.newStick < 0;
  if(G.newStick >= 0){ $('unlockName').textContent = STICKS[G.newStick].name; drawStickPreview($('unlockCv'), G.newStick); }
  const main = $('endMain'), adB = $('endAd'), alt = $('endAlt');
  main.disabled = false; adB.disabled = false; alt.disabled = false;
  const blocked = CG.adblock && !CG.adsOff;
  $('adNote').hidden = true;
  if(online){
    $('endMainT').textContent = 'Rematch'; main.hidden = G.result === 'left' || !NET.conn;
    adB.hidden = true; alt.hidden = true;
  } else if(win){
    $('endMainT').textContent = 'Next level'; main.hidden = false;
    $('endAdT').textContent = 'x3 bananas';
    alt.hidden = true;
    $('adNote').hidden = !(blocked && G.n >= 2);
  } else {
    $('endMainT').textContent = 'Try again'; main.hidden = false;
    const stuck = (fails[G.n] || 0) >= 2;
    $('endAdT').textContent = 'Skip level';
    alt.hidden = !stuck; alt.textContent = 'Skip for ' + SKIP_COST + ' bananas'; alt.disabled = save.bananas < SKIP_COST;
    $('adNote').hidden = !(blocked && stuck);
  }
  $('endUp').hidden = online;
  updateAdButton(); if(!online) CG.prepareRewarded(updateAdButton);
  refreshBadges();
  const e = $('end'); e.hidden = false; requestAnimationFrame(() => e.classList.add('show'));
}

/* ---------- panels ---------- */
function openPanel(id){ ['upPanel', 'stickPanel', 'friendPanel'].forEach(p => $(p).hidden = p !== id); if(id === 'upPanel') buildUpgrades(); if(id === 'stickPanel') buildSticks(); }
function closePanels(){ ['upPanel', 'stickPanel', 'friendPanel'].forEach(p => $(p).hidden = true); }
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => {
  const p = b.closest('.panel'); p.hidden = true;
  if(p.id === 'friendPanel' && !(G && G.mode === 'online')) netLeave();
}));

function buildUpgrades(){
  const grid = $('upGrid'); grid.innerHTML = '';
  UPG.forEach(u => {
    const l = save.up[u.id], max = l >= UPG_MAX, cost = upCost(l);
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = '<div class="ic" style="background:' + u.col + '">' + u.svg + '</div><div class="nm">' + u.name + '</div>' +
      '<div class="lvl">' + (max ? u.eff(l) : (l ? u.eff(l) + ' → ' : '') + u.eff(l + 1).replace(/^./, c => l ? c : c)) + '</div>' +
      '<div class="pips">' + Array.from({ length:UPG_MAX }, (_, i) => '<i class="' + (i < l ? 'on' : '') + '"></i>').join('') + '</div>';
    const b = document.createElement('button'); b.className = 'buy';
    if(max){ b.textContent = 'Maxed'; b.disabled = true; }
    else { b.innerHTML = BANANA_SVG + cost; b.disabled = save.bananas < cost; b.setAttribute('aria-label', 'Buy ' + u.name + ' for ' + cost + ' bananas'); }
    b.addEventListener('click', () => {
      if(save.bananas < cost || max) return;
      audio(); save.bananas -= cost; save.up[u.id]++; persist(); SFX.buy(); buzz(20);
      refreshCoins(true); bumpCoins(); buildUpgrades();
    });
    card.appendChild(b); grid.appendChild(card);
  });
}

function buildSticks(){
  save.seenSticks = unlockedCount(); persist(); refreshBadges();
  const grid = $('stickGrid'); grid.innerHTML = '';
  STICKS.forEach((s, i) => {
    const un = stickUnlocked(i), eq = save.stick === i;
    const b = document.createElement('button'); b.className = 'stick' + (eq ? ' eq' : '') + (un ? '' : ' locked');
    b.innerHTML = '<canvas width="300" height="80"></canvas><div class="nm">' + (un ? s.name : '???') + '</div><div class="st">' + (eq ? 'Equipped' : un ? 'Tap to equip' : 'Beat level ' + s.lv) + '</div>';
    if(!un) b.setAttribute('aria-disabled', 'true');
    b.addEventListener('click', () => { if(!un) return; audio(); save.stick = i; persist(); if(G) G.myStick = i; SFX.coin(); buildSticks(); });
    grid.appendChild(b);
    drawStickPreview(b.querySelector('canvas'), i);
  });
}

/* ---------- fx ---------- */
function burst(x, wy, n, o){
  if(reduceMotion) n = Math.ceil(n / 2);
  for(let i = 0; i < n; i++){
    const life = (o.life || 0.6) * rnd(0.6, 1.2);
    G.parts.push({ x, y:wy, vx:rnd(-1, 1) * (o.sx || 200) + (o.vx || 0), vy:Math.random() * (o.sy || 200) + (o.vy || 0),
      life, max:life, col:Array.isArray(o.col) ? o.col[(Math.random() * o.col.length) | 0] : o.col,
      sz:(o.sz || 5) * rnd(0.6, 1.4), rot:Math.random() * 6, vr:rnd(-10, 10), g:o.g == null ? 1400 : o.g, shape:o.shape || 'dot' });
  }
  if(G.parts.length > 500) G.parts.splice(0, G.parts.length - 500);
}
function pop(x, s, txt, col, size, screen){ G.pops.push({ x, s, txt, col, size:size || 34, t:0, life:1, screen:!!screen }); }
function popW(x, wy, txt, col, size){
  let n = 0; for(const q of G.pops) if(!q.screen && q.t < 0.5 && Math.abs(q.wy - wy) < 60) n++;
  G.pops.push({ x, wy:wy + n * 42, txt, col, size:size || 34, t:0, life:1, screen:false });
}
function coinFly(x, wy, n){
  const b = $('coinsBox').getBoundingClientRect(), r = cvs.getBoundingClientRect();
  const tx = (b.left + 20 - r.left) / SC, ty = (b.top + b.height / 2 - r.top) / SC;
  for(let i = 0; i < Math.min(n, 12); i++) G.flies.push({ x0:x + rnd(-14, 14), y0:sy(wy) + rnd(-14, 14), tx, ty, t:-i * 0.05, dur:0.55 });
}
function gainCoins(n){ n = Math.round(n * G.coinMul); save.bananas += n; G.earned += n; persist(); return n; }

/* ---------- actions ---------- */
function throwAt(screenY){
  if(!G || G.over || G.mode === 'menu') return;
  if(G.mode === 'online' && !G.started) return;
  const axe = G.armed && G.cd.axe <= 0;
  if(!axe && G.cd.dart > 0) return;
  const wy = Math.max(8, wyFromSy(screenY));
  const x = spawnX(), time = axe ? 0.38 : 0.17;
  if(axe){ G.cd.axe = G.axeCd; setArmed(false); } else G.cd.dart = DART_CD;
  G.projs.push({ kind:axe ? 'axe' : 'dart', x, y:wy, vx:-(x - FR) / time, rot:0, pastTop: wy > G.towerH - 4 });
  if(!G.started) G.started = true;
  SFX.throw();
}

function say(key, x, wy, txt, col){ if(G.said[key]) return; G.said[key] = 1; popW(x, wy, txt, col || '#ffffff', 30); }

function knock(){
  const pl = G.player;
  pl.state = 'fall'; pl.vy = 240; pl.stunAfter = 0.7; pl.target = null; pl.top = false;
  G.streak = 0; G.shake = 10; SFX.bonk(); buzz(40);
  popW(FR + 40, pl.y + 80, 'Ouch!', '#ff6b6b', 34);
  burst(FR + 30, pl.y + 55, 7, { col:'#ffcf3f', shape:'star', sy:280, sx:170, g:900, sz:7, life:0.7 });
}

function reachOf(plat){ return G.reach + (plat && plat.golden ? GOLD_BONUS : 0); }
function nextStep(pl){
  const reach = reachOf(pl.plat); let best = null;
  for(const p of G.plats) if(p.side === 'R' && !p.fall && p.y > pl.y + 22 && p.y <= pl.y + reach && (!best || p.y > best.y)) best = p;
  for(const p of G.projs){
    if(p.pastTop || p.y <= pl.y + 62 || p.y > pl.y + reach || (best && p.y <= best.y)) continue;
    const b = G.blocks[Math.floor(p.y / BLK)];
    if(!b || b.type === 'hole' || (b.type === 'stone' && p.kind !== 'axe')) continue;
    best = { y:p.y, golden:!!(b.banana && !b.banana.taken && Math.abs(p.y - b.banana.y) < 20) };
  }
  return best;
}
function bandFor(pl){
  let base = pl.state === 'jump' ? pl.toY : pl.y;
  let reach = pl.state === 'jump' ? reachOf(pl.target) : reachOf(pl.plat);
  if(pl.state === 'idle'){ const nx = nextStep(pl); if(nx){ base = nx.y; reach = reachOf(nx); } }
  return { lo:base + 62, hi:Math.min(base + reach, G.towerH), gold:reach > G.reach };
}

function land(p){
  const y = p.y, bi = Math.floor(y / BLK), b = G.blocks[bi];
  if(!b) return;
  if(b.type === 'hole'){ burst(FR - 10, y, 5, { col:'#6b3d1f', sx:80, sy:60, vx:40, sz:4, life:0.4 }); return; }
  if(b.type === 'stone'){
    if(p.kind === 'axe'){
      b.type = 'bark'; b.smashed = true;
      burst(FR - 30, bi * BLK + 30, 18, { col:['#b8c6d6', '#8e9db0', '#dfe8f1'], sx:280, sy:340, vx:120, sz:10, life:0.9, shape:'rect' });
      popW(FR + 50, y + 30, 'Smash!', '#ffcf3f', 38); G.shake = 8; SFX.axe(); buzz(30);
    } else {
      G.parts.push({ x:FR + 10, y, vx:rnd(220, 340), vy:rnd(150, 300), life:1.2, max:1.2, rot:0, vr:rnd(8, 14), g:1500, sz:1, shape:'dart', col:'' });
      burst(FR, y, 7, { col:['#ffffff', '#ffcf3f'], sx:160, sy:180, vx:100, sz:4, life:0.35, g:300, shape:'star' });
      G.streak = 0; SFX.clang(); buzz(15);
      say('stone', FR + 70, y + 40, 'Use the axe!');
      $('axeBtn').classList.add('nudge'); setTimeout(() => $('axeBtn').classList.remove('nudge'), 2400);
      return;
    }
  }
  const pl = G.player, band = bandFor(pl);
  const plat = { y, side:'R', kind:p.kind, rot:b.type === 'rot' && p.kind !== 'axe', golden:false, crumbleT:null, fall:false, vy:0, ang:0, bi, wob:1 };
  let fx = false;
  if(b.banana && !b.banana.taken && Math.abs(y - b.banana.y) < 20){
    b.banana.taken = true; plat.golden = true;
    const gain = gainCoins(5);
    coinFly(FR - 16, b.banana.y, gain);
    popW(FR + 60, y + 30, 'Jackpot!', '#ffcf3f', 38);
    burst(FR - 16, y, 16, { col:['#ffcf3f', '#fff3b0', '#ffffff'], sx:240, sy:280, sz:6, life:0.7, g:500, shape:'star' });
    SFX.coin(); buzz(20); fx = true;
  }
  if(pl.state !== 'fall' && y >= band.hi - G.perf && y <= band.hi && y > band.lo){
    G.streak++; G.perfects++;
    const words = ['Perfect!', 'Great!', 'Awesome!', 'Unreal!'];
    popW(FR + 70, y + 34, G.streak > 1 ? words[Math.min(G.streak - 1, 3)] + ' x' + G.streak : 'Perfect!', G.theme.accent, 32 + Math.min(G.streak, 5) * 2);
    coinFly(FR + 20, y, gainCoins(1));
    SFX.perfect(G.streak); fx = true;
    burst(FR + 20, y, 8, { col:['#ffffff', G.theme.accent], sx:160, sy:200, sz:5, life:0.5, g:400, shape:'star' });
  } else if(!fx){ (p.kind === 'axe' ? SFX.axe : SFX.thunk)(); }
  if(plat.rot) say('rot', FR + 70, y + 60, 'Fragile!', '#ffb36b');
  burst(FR, y, 5, { col:['#8a4a24', '#c7773f'], sx:100, sy:160, vx:90, sz:5, life:0.5, shape:'rect' });
  G.plats.push(plat);
  if(G.mode === 'online') netSend({ t:'p', y:Math.round(y), k:p.kind, g:plat.golden ? 1 : 0 });
}

function finish(res){
  if(G.over) return;
  G.over = true; G.result = res; G.overT = res === 'left' ? 0.2 : 1.2; setArmed(false);
  CG.stop();
  if(G.mode === 'online'){
    if(res === 'win'){ netSend({ t:'win' }); save.bananas += 50; G.bonus = 50; SFX.win(); buzz(60); confetti(); CG.happy(); }
    else if(res === 'lose'){ save.bananas += 10; G.bonus = 10; SFX.lose(); }
    persist(); return;
  }
  if(res === 'win'){
    G.bonus = Math.round((20 + G.n * 5) * G.coinMul);
    const k = G.n % 15, ch = Math.floor((G.n - 1) / 15);
    if(k === 5 || k === 10) G.chest = Math.round((80 + ch * 40) * G.coinMul);
    else if(k === 0 && !STICKS[G.n / 15]){ G.chest = Math.round((220 + ch * 80) * G.coinMul); G.bigChest = true; }   // after the last stick: big chest
    if(k === 0 && G.n / 15 < STICKS.length && save.level <= G.n){ G.newStick = G.n / 15; save.stick = G.newStick; save.seenSticks = unlockedCount() + 1; CG.happy(); }
    G.bonus += G.chest;
    save.bananas += G.bonus;
    if(save.level <= G.n) save.level = G.n + 1;
    persist(); CG.progress(progressPct()); CG.levelUp(G.n);
    SFX.win(); buzz(60); confetti();
  } else { fails[G.n] = (fails[G.n] || 0) + 1; SFX.lose(); }
}
const fails = {};
function confetti(){ burst(trunkCX, G.towerH + 40, 70, { col:['#ffcf3f', '#ff5a5f', '#3ddc6f', '#6c5ce7', '#ffffff', '#23c9c0'], sx:460, sy:640, sz:9, life:1.9, g:700, shape:'rect' }); }

/* ---------- update ---------- */
function startJump(pl, toY, target, top){ pl.state = 'jump'; pl.t = 0; pl.fromY = pl.y; pl.toY = toY; pl.target = target; pl.top = top; pl.dur = 0.24 + Math.max(0, toY - pl.y) / 1200; SFX.jump(); }
function landPlayerOn(pl, p){
  pl.y = p.y; pl.plat = p; pl.squash = 1; pl.idleT = 0.08; p.wob = 1;
  if(pl.stunAfter > 0){ pl.state = 'stun'; pl.stunT = pl.stunAfter; pl.stunAfter = 0; } else pl.state = 'idle';
  if(p.rot && p.crumbleT == null) p.crumbleT = 0.75;
}

function updPlayer(dt){
  const pl = G.player; pl.squash = Math.max(0, pl.squash - dt * 4); pl.blink -= dt; if(pl.blink < -0.12) pl.blink = rnd(2, 4);
  if(G.mode === 'menu') return;
  if(pl.state === 'idle'){
    if(pl.plat && pl.plat.fall){ pl.state = 'fall'; pl.vy = 0; return; }
    pl.idleT -= dt; if(pl.idleT > 0) return;
    const reach = reachOf(pl.plat);
    if(G.towerH - pl.y <= reach){ startJump(pl, G.towerH, null, true); return; }
    let best = null;
    for(const p of G.plats) if(p.side === 'R' && !p.fall && p.y > pl.y + 22 && p.y <= pl.y + reach && (!best || p.y > best.y)) best = p;
    if(best) startJump(pl, best.y, best, false);
  } else if(pl.state === 'jump'){
    pl.t += dt; const k = Math.min(1, pl.t / pl.dur);
    pl.y = pl.fromY + (pl.toY - pl.fromY) * easeOut(k) + Math.sin(Math.PI * k) * 26;
    if(k >= 1){
      pl.y = pl.toY;
      if(pl.top){ pl.state = 'win'; pl.squash = 1; finish('win'); return; }
      const tg = pl.target;
      if(!tg || tg.fall){ pl.state = 'fall'; pl.vy = 0; return; }
      landPlayerOn(pl, tg);
    }
  } else if(pl.state === 'fall'){
    const prev = pl.y; pl.vy -= 2400 * dt; pl.y += pl.vy * dt;
    if(pl.vy < 0){
      let best = null;
      for(const p of G.plats) if(p.side === 'R' && !p.fall && p.y <= prev + 0.01 && p.y >= pl.y && (!best || p.y > best.y)) best = p;
      if(best) landPlayerOn(pl, best);
    }
  } else if(pl.state === 'stun'){
    if(pl.plat && pl.plat.fall){ pl.state = 'fall'; pl.vy = 0; pl.stunAfter = pl.stunT; return; }
    pl.stunT -= dt; if(pl.stunT <= 0){ pl.state = 'idle'; pl.idleT = 0.05; }
  }
}

function updRival(dt){
  const r = G.rival; r.squash = Math.max(0, r.squash - dt * 4); r.sweat = Math.max(0, r.sweat - dt); r.blink -= dt; if(r.blink < -0.12) r.blink = rnd(2, 4);
  if(G.mode === 'online'){
    const prevY = r.y; r.y += (r.ty - r.y) * Math.min(1, dt * 14);
    r.state = r.rst === 'jump' ? 'jump' : r.rst === 'win' ? 'top' : r.rst === 'fall' ? 'fall' : 'idle';
    if(r.state === 'idle' && Math.abs(prevY - r.y) < 0.5 && r.lastSt !== 'idle') r.squash = 1;
    r.lastSt = r.state; return;
  }
  if(!G.started || r.state === 'top' || G.mode === 'menu') return;
  if(r.state === 'jump'){
    r.t += dt; const k = Math.min(1, r.t / r.dur);
    r.y = r.fromY + (r.toY - r.fromY) * easeOut(k) + Math.sin(Math.PI * k) * 22;
    if(k >= 1){ r.y = r.toY; r.squash = 1; if(r.y >= G.towerH){ r.state = 'top'; if(!G.over) finish('lose'); } else r.state = 'idle'; }
    return;
  }
  if(G.over) return;
  r.timer -= dt;
  if(r.timer <= 0){
    r.fromY = r.y; r.toY = Math.min(G.towerH, r.y + rnd(95, 145));
    if(r.toY < G.towerH) G.plats.push({ y:r.toY, side:'L', kind:'dart', golden:false, fall:false, vy:0, ang:0, crumbleT:null, bi:-1, wob:1 });
    r.state = 'jump'; r.t = 0; r.dur = 0.3;
    const base = Math.max(0.52, 0.98 - 0.045 * (G.n - 1));
    const diff = r.y - G.player.y;
    r.timer = base * rnd(0.8, 1.2) * (diff > 320 ? 1.4 : diff < -320 ? 0.78 : 1);
    if(Math.random() < 0.07){ r.timer += 0.9; r.sweat = 1.3; }
  }
}

function updToucans(dt){
  const minX = FR + 80, maxX = flyMaxX();
  for(const t of G.toucans){
    if(t.x == null) t.x = minX + t.fx * Math.max(10, maxX - minX);
    t.flap += dt * 14; t.hitT = Math.max(0, t.hitT - dt);
    if(t.dead){ t.x += 240 * dt; t.vy -= 500 * dt; t.y += t.vy * dt; t.rot += dt * 9; continue; }
    if(t.flee > 0){                                   // startled: flap off screen, come back a few seconds later
      t.flee -= dt; t.x += 420 * dt; t.y = t.baseY + Math.min(80, (3.5 - t.flee) * 60); t.dir = 1;
      if(t.flee <= 0){ t.x = maxX + 80; t.y = t.baseY; t.dir = -1; }
      continue;
    }
    t.x += t.dir * t.sp * dt;
    if(t.x > maxX + 20 && t.dir === -1){ /* flying back in */ }
    else if(t.x < minX){ t.x = minX; t.dir = 1; } else if(t.x > maxX){ t.x = maxX; t.dir = -1; }
  }
}

function updProjs(dt){
  const pl = G.player;
  for(const p of G.projs){
    const x0 = p.x; p.x += p.vx * dt; if(p.kind === 'axe') p.rot -= dt * 18;
    for(const t of G.toucans){
      if(t.dead || t.x == null || t.flee > 0) continue;
      if(Math.abs(p.y - t.y) < 24 && p.x < t.x + 28 && x0 > t.x - 28){
        if(p.kind === 'axe'){
          t.dead = true; t.vy = 260; SFX.squawk();
          burst(t.x, t.y, 12, { col:['#243056', '#ffffff', '#ff8a1f'], sx:200, sy:200, sz:6, life:0.9, g:400 });
          popW(t.x, t.y + 34, 'Shoo!', '#ffffff', 32);
        } else {
          p.dead = true; t.hitT = 0.4; t.flee = 3.5; G.streak = 0; SFX.squawk();
          burst(t.x, t.y, 6, { col:['#243056', '#ffffff'], sx:140, sy:160, sz:5, life:0.6, g:400 });
          G.parts.push({ x:t.x, y:p.y, vx:rnd(-60, 60), vy:rnd(100, 200), life:1.2, max:1.2, rot:0, vr:rnd(-12, 12), g:1500, sz:1, shape:'dart', col:'' });
          say('toucan', t.x, t.y + 40, 'Scared it off!', '#ffffff');
        }
        break;
      }
    }
    if(p.dead) continue;
    if(pl.state !== 'fall' && p.x < FR + 54 && x0 > FR + 6 && p.y > pl.y + 4 && p.y < pl.y + 62){
      p.dead = true;
      G.parts.push({ x:FR + 40, y:p.y, vx:rnd(120, 220), vy:rnd(200, 320), life:1.2, max:1.2, rot:0, vr:rnd(8, 14), g:1500, sz:1, shape:p.kind === 'axe' ? 'axe' : 'dart', col:'' });
      knock(); continue;
    }
    if(p.pastTop){ if(p.x < -80) p.dead = true; continue; }
    if(p.x <= FR){ land(p); p.dead = true; }
  }
  G.projs = G.projs.filter(p => !p.dead);
}

function updPlats(dt){
  for(const p of G.plats){
    if(p.wob) p.wob = Math.max(0, p.wob - dt * 3);
    if(p.crumbleT != null && !p.fall){
      p.crumbleT -= dt;
      if(p.crumbleT <= 0){
        const b = G.blocks[p.bi]; if(b && b.type === 'rot'){ b.type = 'hole'; b.holeT = 4; G.holes.push(b); }
        for(const q of G.plats) if(q.side === 'R' && q.bi === p.bi && !q.fall){ q.fall = true; q.vy = 0; }
        burst(FR - 30, p.bi * BLK + 30, 16, { col:['#e8b889', '#c7955f', '#8a5a34'], sx:190, sy:130, vx:60, sz:9, life:0.9, shape:'rect' });
        SFX.crumble(); G.shake = 6; buzz(25);
        if(G.mode === 'online') netSend({ t:'d', bi:p.bi });
      }
    }
    if(p.fall){ p.vy -= 2000 * dt; p.y += p.vy * dt; p.ang += dt * 5; }
  }
  G.plats = G.plats.filter(p => !(p.fall && p.y < G.camY - 400));
}

function update(dt){
  G.time += dt;
  if(G.mode === 'online' && !G.started && !G.over){
    G.count -= dt;
    const c = Math.ceil(G.count - 0.4);
    if(c !== G.lastCount){
      G.lastCount = c;
      if(c > 0){ pop(VW / 2, VH * 0.4, String(c), '#ffffff', 96, true); SFX.beep(false); }
      else { G.started = true; CG.start(); pop(VW / 2, VH * 0.4, 'Go!', '#ffcf3f', 100, true); SFX.beep(true); }
    }
  }
  G.cd.dart = Math.max(0, G.cd.dart - dt); G.cd.axe = Math.max(0, G.cd.axe - dt);
  G.shake = Math.max(0, G.shake - dt * 30);
  updPlayer(dt); updRival(dt); updToucans(dt); updProjs(dt); updPlats(dt);
  for(const b of G.holes){ b.holeT -= dt; if(b.holeT <= 0 && b.type === 'hole'){ b.type = 'bark'; b.regrow = 1; } }
  G.holes = G.holes.filter(b => b.type === 'hole');
  for(const p of G.parts){ p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life -= dt; }
  G.parts = G.parts.filter(p => p.life > 0);
  for(const p of G.pops){ p.t += dt; } G.pops = G.pops.filter(p => p.t < p.life);
  for(const f of G.flies){
    f.t += dt;
    if(f.t >= f.dur && !f.done){ f.done = true; if(shownCoins < save.bananas) shownCoins++; refreshCoins(); bumpCoins(); SFX.coin(); }
  }
  G.flies = G.flies.filter(f => !f.done);
  if(!G.flies.length && shownCoins !== save.bananas && !G.over) refreshCoins(true);

  const pl = G.player;
  if(G.mode === 'menu'){ G.camY = VW > VH ? -VH * 0.1 : -Math.min(300, VH * 0.3); }
  else {
  let target = Math.max(0, pl.y - (VH - GROUND) * 0.36);
  target = Math.min(target, Math.max(0, G.towerH + 300 - (VH - GROUND)));
  G.camY += (target - G.camY) * Math.min(1, dt * 4.5);
  }

  if(G.mode === 'online' && NET.conn && NET.conn.open){
    G.netT -= dt;
    if(G.netT <= 0){ G.netT = 0.066; netSend({ t:'s', y:Math.round(pl.y), st:pl.state }); }
  }
  if(!G.over && G.mode !== 'menu' && G.started && pl.state === 'idle' && !nextStep(pl)){
    const bd = bandFor(pl); let open = false;
    for(let y = bd.lo + 2; y < bd.hi; y += 6){ const blk = G.blocks[Math.floor(y / BLK)]; if(blk && blk.type !== 'stone' && blk.type !== 'hole'){ open = true; break; } }
    G.stuckT = open || G.armed ? 0 : (G.stuckT || 0) + dt;
    if(G.stuckT > 1.2){
      G.stuckT = -3.5;
      popW(FR + 90, bd.hi + 30, 'Smash the stone!', '#ffcf3f', 30);
      $('axeBtn').classList.add('nudge'); setTimeout(() => $('axeBtn').classList.remove('nudge'), 2400);
    }
  } else G.stuckT = 0;
  if(!G.over && !G.said.stoneNear && G.mode !== 'menu'){
    for(let i = Math.floor(pl.y / BLK); i <= Math.floor((pl.y + 220) / BLK) && i < G.nb; i++){
      if(G.blocks[i] && G.blocks[i].type === 'stone'){ G.said.stoneNear = 1; $('axeBtn').classList.add('nudge'); setTimeout(() => $('axeBtn').classList.remove('nudge'), 2400); break; }
    }
  }
  if(G.over && !G.endShown && !G.chestOpen){ G.overT -= dt; if(G.overT <= 0){ refreshCoins(true); if(G.chest > 0 && !G.chestShown) showChest(); else showEnd(); } }

  const btn = $('axeBtn'); btn.style.setProperty('--p', (1 - G.cd.axe / G.axeCd).toFixed(3)); btn.classList.toggle('cool', G.cd.axe > 0);
  const pp = Math.min(1, pl.y / G.towerH), rp = Math.min(1, G.rival.y / G.towerH);
  $('fill').style.width = (pp * 100).toFixed(1) + '%';
  $('dotP').style.left = (pp * 100).toFixed(1) + '%';
  $('dotR').style.left = (rp * 100).toFixed(1) + '%';
}

/* ---------- drawing ---------- */
function mixHex(a, b, t){
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = sh => Math.round(((A >> sh) & 255) * (1 - t) + ((B >> sh) & 255) * t);
  return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')';
}
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function mountains(f, col, h, seed){
  const base = VH - GROUND - 40 + G.camY * f;
  if(base - h > VH) return;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-20, VH + 20);
  for(let x = -20; x <= VW + 20; x += 12){
    const y = base - h * (0.45 + 0.3 * Math.sin(x * 0.006 + seed) + 0.15 * Math.sin(x * 0.017 + seed * 3) + 0.08 * Math.sin(x * 0.041 + seed));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(VW + 20, VH + 20); ctx.closePath(); ctx.fill();
}

function canopy(f, col, h, seed, step){
  const base = VH - GROUND + 10 + G.camY * f;
  if(base - h * 1.3 > VH) return;
  ctx.fillStyle = col;
  ctx.fillRect(-10, base - h * 0.4, VW + 20, VH - base + h + 40);
  for(let x = -60, i = 0; x < VW + 80; x += step, i++){
    const r = h * (0.32 + 0.3 * hash(i + seed));
    circ(x + hash(i * 3 + seed) * step * 0.4, base - h * 0.4 - r * 0.25, r, col);
  }
}

function palm(x, base, h, lean, col){
  ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x, base);
  const tx = x + lean, ty = base - h;
  ctx.quadraticCurveTo(x + lean * 0.2, base - h * 0.55, tx, ty); ctx.stroke();
  ctx.lineWidth = 7;
  for(let k = 0; k < 6; k++){
    const a = -Math.PI / 2 + (k - 2.5) * 0.62, len = 58 + (k % 2) * 12;
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.55 + 26;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.55, ty + Math.sin(a) * len * 0.7 - 10, ex, ey); ctx.stroke();
  }
  circ(tx, ty + 4, 7, col);
}

function palms(f, col, seed){
  const base = VH - GROUND + 20 + G.camY * f;
  if(base - 260 > VH) return;
  for(let i = 0; i < 7; i++){
    const x = (hash(i + seed) * 0.9 + i / 7) * (VW + 120) - 60;
    if(x > FL - 40 && x < FR + 40) continue;               // keep the tree itself clear
    palm(x, base, 150 + hash(i * 7 + seed) * 90, (hash(i * 5 + seed) - 0.5) * 70, col);
  }
}

function vines(col){
  const period = 520, off = (G.camY * 0.6) % period;
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  for(const side of [0, 1]){
    for(let k = -1; k < VH / period + 1; k++){
      const topY = k * period + off - 40, x0 = side ? VW - 18 - (k & 1) * 26 : 18 + (k & 1) * 26, len = 180 + ((k + side) & 1) * 90;
      ctx.beginPath();
      for(let t = 0; t <= len; t += 10){ const x = x0 + Math.sin((t + G.time * 20) * 0.03 + k) * 6; t ? ctx.lineTo(x, topY + t) : ctx.moveTo(x, topY); }
      ctx.stroke();
      for(let t = 20; t < len; t += 34){
        const x = x0 + Math.sin((t + G.time * 20) * 0.03 + k) * 6, dir = (t / 34) & 1 ? 1 : -1;
        ell(x + dir * 9, topY + t, 10, 4.5, dir * 0.6); ctx.fill();
      }
    }
  }
}

function drawBG(){
  const th = G.theme, c = G.camY;
  const hi = Math.min(1, c / 3500);                                   // the higher you climb, the lighter the sky
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, mixHex(th.top, '#ffffff', hi * 0.15)); g.addColorStop(0.7, mixHex(th.bot, th.top, 0.15)); g.addColorStop(1, th.bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  // sun + slow rays
  const sx = VW * 0.8, sY = 150 + c * 0.015;
  ctx.save(); ctx.translate(sx, sY); ctx.rotate(G.time * 0.05);
  ctx.fillStyle = 'rgba(255,255,255,.10)';
  for(let k = 0; k < 8; k++){ ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-26, -420); ctx.lineTo(26, -420); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  circ(sx, sY, 78, 'rgba(255,255,255,.22)'); circ(sx, sY, 56, 'rgba(255,255,255,.4)'); circ(sx, sY, 40, 'rgba(255,250,225,.9)');
  // puffy clouds
  for(let i = 0; i < 7; i++){
    const y = ((i * 263 + c * 0.14) % 1800) - 260, x = ((i * 197 + G.time * (6 + i % 3 * 3)) % (VW + 260)) - 130, w = 70 + (i % 3) * 26;
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    rr(x - w * 0.7, y, w * 1.4, 22, 11); ctx.fill();
    circ(x - w * 0.3, y + 2, w * 0.28, 'rgba(255,255,255,.85)'); circ(x + w * 0.1, y - 6, w * 0.36, 'rgba(255,255,255,.85)'); circ(x + w * 0.45, y + 4, w * 0.24, 'rgba(255,255,255,.85)');
  }
  // layered jungle
  mountains(0.05, mixHex(th.far, th.top, 0.4), 340, 1.7);
  mountains(0.09, mixHex(th.far, th.top, 0.18), 250, 4.2);
  canopy(0.14, th.far, 200, 3, 64);
  palms(0.22, mixHex(th.near, th.far, 0.2), 9);
  canopy(0.3, th.near, 120, 11, 52);
  palms(0.4, mixHex(th.near, '#123524', 0.35), 21);
  // soft haze where layers meet the sky
  const hz = ctx.createLinearGradient(0, VH * 0.35, 0, VH);
  hz.addColorStop(0, 'rgba(255,255,255,0)'); hz.addColorStop(1, 'rgba(255,255,255,.08)');
  ctx.fillStyle = hz; ctx.fillRect(0, VH * 0.35, VW, VH * 0.65);
  // hanging vines at the edges + drifting pollen
  vines(mixHex(th.near, '#123524', 0.45));
  for(let i = 0; i < 16; i++){
    const px = (hash(i) * VW + Math.sin(G.time * 0.6 + i) * 24 + VW) % VW;
    const py = ((hash(i + 40) * (VH + 100) + c * 0.5 - G.time * (8 + i % 4 * 4)) % (VH + 100) + VH + 100) % (VH + 100) - 50;
    circ(px, py, 2 + (i % 3), 'rgba(255,255,230,' + (0.35 + 0.35 * Math.sin(G.time * 2 + i)) + ')');
  }
}

function drawGround(){
  const gy = sy(0), th = G.theme; if(gy > VH + 40) return;
  // soil with darker layers going down
  const dg = ctx.createLinearGradient(0, gy, 0, VH);
  dg.addColorStop(0, th.dirt); dg.addColorStop(1, mixHex(th.dirt2, '#3a2412', 0.35));
  ctx.fillStyle = dg; ctx.fillRect(0, gy + 14, VW, VH - gy + 40);
  ctx.fillStyle = 'rgba(58,36,18,.12)';
  for(let k = 1; k < 5; k++){ const y = gy + 30 + k * 46; ctx.beginPath(); ctx.moveTo(0, y);
    for(let x = 0; x <= VW + 20; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.02 + k) * 5); ctx.lineTo(VW + 20, y + 14); ctx.lineTo(0, y + 14); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = th.dirt2; for(let x = 30, i = 0; x < VW; x += 70, i++){ rr(x + hash(i) * 30, gy + 44 + hash(i + 9) * 120, 22 + hash(i + 3) * 14, 9, 4.5); ctx.fill(); }
  // bushes along the back of the grass, kept clear of the tree
  const bush = mixHex(th.grass, '#123524', 0.25);
  for(let i = 0; i < 12; i++){
    const x = hash(i + 70) * VW; if(x > FL - 60 && x < FR + 60) continue;
    const r = 18 + hash(i + 80) * 16;
    circ(x, gy - 4, r, bush); circ(x + r * 0.8, gy, r * 0.75, bush); circ(x - r * 0.8, gy + 2, r * 0.7, bush);
  }
  // grass lip with tufts and a few flowers
  ctx.fillStyle = th.grass; rr(-10, gy - 8, VW + 20, 30, 12); ctx.fill();
  ctx.beginPath();
  for(let x = -6, i = 0; x < VW + 10; x += 11, i++){ const h = 6 + hash(i + 200) * 9; ctx.moveTo(x, gy - 4); ctx.lineTo(x + 4, gy - 4 - h); ctx.lineTo(x + 8, gy - 4); }
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.2)'; rr(-10, gy - 8, VW + 20, 7, 3.5); ctx.fill();
  const petals = ['#ffffff', '#ffcf3f', '#ff8fb1'];
  for(let i = 0; i < 9; i++){
    const x = hash(i + 300) * VW; if(x > FL - 30 && x < FR + 70) continue;
    const y = gy - 2 + hash(i + 310) * 8;
    for(let k = 0; k < 5; k++){ const a = k * 1.2566; circ(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3, petals[i % 3]); }
    circ(x, y, 2.4, '#ff9f1c');
  }
}

function bananaIcon(x, y, s, rot){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#ffcf3f'; ctx.beginPath(); ctx.moveTo(-11, -4); ctx.quadraticCurveTo(0, 15, 12, -5); ctx.quadraticCurveTo(0, 5, -11, -4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e0a800'; ctx.beginPath(); ctx.moveTo(-11, -4); ctx.quadraticCurveTo(0, 9, 12, -5); ctx.quadraticCurveTo(0, 15, -11, -4); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawTop(ts){
  const cols = ['#2fae62', '#3fc573', '#5ad487'];
  [[-150,-70,68],[150,-66,70],[-70,-150,80],[80,-156,84],[0,-215,86],[0,-100,78]].forEach(([dx, dy, r], k) => circ(trunkCX + dx, ts + dy, r, cols[k % 3]));
  ctx.fillStyle = '#e39a52'; rr(FL - 70, ts - 4, TRUNK_W + 140, 18, 9); ctx.fill();
  ctx.fillStyle = '#c47a36'; rr(FL - 70, ts + 6, TRUNK_W + 140, 8, 4); ctx.fill();
  const bob = Math.sin(G.time * 3) * 4;
  circ(trunkCX, ts - 44 + bob, 34, 'rgba(255,240,150,.55)');
  for(let k = 0; k < 5; k++) bananaIcon(trunkCX - 14 + k * 7, ts - 40 + bob + Math.abs(k - 2) * 3, 1.3, -0.8 + k * 0.4);
  ctx.fillStyle = '#5a8f2a'; rr(trunkCX - 3, ts - 66 + bob, 6, 14, 3); ctx.fill();
}

function drawTrunk(){
  const topS = sy(G.towerH), botS = sy(0);
  const y0 = Math.max(topS, -10), y1 = Math.min(botS, VH + 10);
  if(y1 > y0){
    ctx.fillStyle = '#8a4a24'; ctx.fillRect(FL, y0, TRUNK_W, y1 - y0);
    const i0 = Math.max(0, Math.floor(wyFromSy(y1) / BLK)), i1 = Math.min(G.nb - 1, Math.floor(wyFromSy(y0) / BLK));
    const hz = trunkCX - 18;
    for(let i = i0; i <= i1; i++){
      const b = G.blocks[i], by = sy((i + 1) * BLK);
      ctx.fillStyle = i % 2 ? '#c7773f' : '#b96b37'; rr(FL + 3, by + 2, TRUNK_W - 6, BLK - 4, 10); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.13)'; rr(FL + 8, by + 6, 12, BLK - 12, 6); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.08)'; rr(FR - 26, by + 2, 23, BLK - 4, 8); ctx.fill();
      if(b.regrow){ b.regrow = Math.max(0, b.regrow - 0.03); ctx.fillStyle = 'rgba(120,230,120,' + b.regrow * 0.8 + ')'; rr(FL + 3, by + 2, TRUNK_W - 6, BLK - 4, 10); ctx.fill(); }
      if(b.smashed){ ctx.fillStyle = 'rgba(90,45,20,.35)'; rr(hz + 6, by + 10, FR - hz - 14, BLK - 20, 10); ctx.fill(); }
      if(b.type === 'stone'){
        ctx.fillStyle = '#8e9db0'; rr(hz, by + 2, FR - hz + 6, BLK - 4, 12); ctx.fill();
        ctx.fillStyle = '#b8c6d6'; rr(hz, by + 2, FR - hz + 6, BLK - 12, 12); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; rr(hz + 8, by + 8, 30, 7, 3.5); ctx.fill();
      } else if(b.type === 'rot'){
        ctx.fillStyle = '#e8b889'; rr(hz, by + 2, FR - hz, BLK - 4, 10); ctx.fill();
        ctx.strokeStyle = '#a8703f'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(hz + 14, by + 10); ctx.lineTo(hz + 30, by + 26); ctx.lineTo(hz + 22, by + 38); ctx.lineTo(hz + 40, by + 52);
        ctx.moveTo(hz + 30, by + 26); ctx.lineTo(hz + 52, by + 22); ctx.stroke();
      } else if(b.type === 'hole'){
        ctx.fillStyle = '#4a2410'; rr(hz + 4, by + 6, FR - hz - 4, BLK - 12, 14); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.25)'; rr(hz + 4, by + 6, FR - hz - 4, 12, 6); ctx.fill();
        if(b.holeT != null){ const k = 1 - b.holeT / 4; ctx.fillStyle = 'rgba(120,200,90,.55)'; rr(hz + 4, by + 6 + (BLK - 12) * (1 - k), FR - hz - 4, (BLK - 12) * k, 8); ctx.fill(); }
      }
      if(b.banana && !b.banana.taken){
        const x = FR - 18, s = sy(b.banana.y), pz = 1 + Math.sin(G.time * 5) * 0.06;
        ctx.save(); ctx.translate(x, s); ctx.scale(pz, pz);
        circ(0, 0, 18, '#ffffff'); circ(0, 0, 14, '#ffcf3f'); circ(0, 0, 9, '#ffffff');
        bananaIcon(0, -1, 0.75, -0.4); ctx.restore();
      }
    }
  }
  if(botS < VH + 60){
    ctx.fillStyle = '#8a4a24';
    ctx.beginPath(); ctx.moveTo(FL - 30, botS + 8); ctx.quadraticCurveTo(FL, botS, FL + 4, botS - 40); ctx.lineTo(FL + 20, botS + 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(FR + 30, botS + 8); ctx.quadraticCurveTo(FR, botS, FR - 4, botS - 40); ctx.lineTo(FR - 20, botS + 8); ctx.fill();
  }
  if(topS > -320 && topS < VH + 100) drawTop(topS);
}

function drawBand(){
  const pl = G.player;
  if(G.over || G.mode === 'menu' || !(pl.state === 'idle' || pl.state === 'jump' || pl.state === 'stun')) return;
  const b = bandFor(pl); if(b.hi <= b.lo) return;
  const sHi = sy(b.hi), sLo = sy(b.lo), sP = sy(b.hi - G.perf), w = Math.min(260, flyMaxX() - FR);
  const pulse = 0.5 + 0.5 * Math.sin(G.time * 5);
  let g = ctx.createLinearGradient(FR, 0, FR + w, 0);
  g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(FR + 4, sP, w, sLo - sP);
  g = ctx.createLinearGradient(FR, 0, FR + w, 0);
  const a = 0.55 + 0.2 * pulse;
  g.addColorStop(0, b.gold ? 'rgba(255,207,63,' + a + ')' : 'rgba(255,255,255,' + a + ')');
  g.addColorStop(1, b.gold ? 'rgba(255,207,63,0)' : 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(FR + 4, sHi, w, sP - sHi);
  for(let i = Math.floor(b.lo / BLK); i <= Math.floor(b.hi / BLK); i++){
    const blk = G.blocks[i]; if(!blk || (blk.type !== 'stone' && blk.type !== 'hole')) continue;
    const top = sy(Math.min(b.hi, (i + 1) * BLK)), bot = sy(Math.max(b.lo, i * BLK)); if(bot <= top) continue;
    const smash = blk.type === 'stone' && G.armed;
    const rg = ctx.createLinearGradient(FR, 0, FR + w, 0);
    rg.addColorStop(0, smash ? 'rgba(255,207,63,.75)' : 'rgba(255,90,95,.6)'); rg.addColorStop(1, smash ? 'rgba(255,207,63,0)' : 'rgba(255,90,95,0)');
    ctx.fillStyle = rg; ctx.fillRect(FR + 4, top, w, bot - top);
    if(!smash){ ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; const cx = FR + 34, cy = (top + bot) / 2;
      ctx.beginPath(); ctx.moveTo(cx - 6, cy - 6); ctx.lineTo(cx + 6, cy + 6); ctx.moveTo(cx + 6, cy - 6); ctx.lineTo(cx - 6, cy + 6); ctx.stroke(); }
  }
  if(!G.started && G.mode === 'solo'){
    const t = (G.time % 1.1) / 1.1, hx = FR + 118, hy = (sHi + sP) / 2;
    const press = t < 0.2 ? t / 0.2 : t < 0.4 ? 1 - (t - 0.2) / 0.2 : 0;
    if(t > 0.15 && t < 0.8){ const k = (t - 0.15) / 0.65; ctx.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(hx, hy, 10 + k * 34, 0, Math.PI * 2); ctx.stroke(); }
    gloveHand(hx, hy + 2 + press * 8, 1 - press * 0.08);
    if(G.n <= 2){
      ctx.font = '700 22px Fredoka, "Arial Rounded MT Bold", sans-serif'; ctx.textAlign = 'center';
      const tw = ctx.measureText('Tap to throw').width + 32;
      ctx.fillStyle = INK; rr(hx - tw / 2, hy - 100, tw, 38, 19); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillText('Tap to throw', hx, hy - 73);
    }
  }
}

/* cartoon glove: fingertip sits at (0,0) */
function gloveHand(x, y, s){
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.18);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 4.5; ctx.strokeStyle = INK;
  const W = '#ffffff', S = '#dfe4f2';
  // shadow
  ctx.fillStyle = 'rgba(36,48,86,.18)'; ell(8, 70, 26, 7); ctx.fill();
  // index finger
  ctx.fillStyle = W; rr(-8, 0, 17, 46, 8.5); ctx.fill(); ctx.stroke();
  // thumb
  ctx.save(); ctx.translate(-20, 36); ctx.rotate(-0.55); ctx.fillStyle = W; rr(-7, -14, 15, 30, 7.5); ctx.fill(); ctx.stroke(); ctx.restore();
  // palm / curled fingers
  ctx.fillStyle = W; rr(-17, 28, 44, 36, 15); ctx.fill(); ctx.stroke();
  ctx.fillStyle = S; rr(12, 32, 12, 28, 6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10, 30); ctx.quadraticCurveTo(19, 30, 22, 38); ctx.moveTo(12, 42); ctx.quadraticCurveTo(21, 42, 24, 50); ctx.stroke();
  // fingernail highlight
  ctx.fillStyle = S; rr(-3, 4, 7, 10, 3.5); ctx.fill();
  // cuff
  ctx.fillStyle = W; rr(-13, 60, 36, 13, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = S; rr(-9, 63, 28, 3, 1.5); ctx.fill();
  ctx.restore();
}

function stickShape(def, golden, accent){
  if(golden){ ctx.fillStyle = 'rgba(255,207,63,.55)'; ell(24, 0, 48, 13); ctx.fill(); }
  if(def.glow){ ctx.fillStyle = def.glow; ell(24, 0, 46, 11); ctx.fill(); }
  const fl = def.fl === 'accent' ? accent : def.fl;
  if(def.rainbow){ const g = ctx.createLinearGradient(-16, 0, 64, 0); ['#ff5a5f', '#ffcf3f', '#3ddc6f', '#23c9c0', '#6c5ce7'].forEach((c, i) => g.addColorStop(i / 4, c)); ctx.fillStyle = g; }
  else ctx.fillStyle = def.shaft;
  rr(-16, -4, 80, 8, 4); ctx.fill();
  if(def.stripes){
    ctx.save(); rr(-16, -4, 80, 8, 4); ctx.clip(); ctx.fillStyle = def.stripes;
    for(let x = -22; x < 70; x += 13){ ctx.beginPath(); ctx.moveTo(x, 4); ctx.lineTo(x + 6, 4); ctx.lineTo(x + 12, -4); ctx.lineTo(x + 6, -4); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(36,48,86,.16)'; rr(-16, 1, 80, 3, 1.5); ctx.fill();
  if(def.knob){ circ(64, -4, 6.5, def.shaft); circ(64, 4, 6.5, def.shaft); ctx.fillStyle = 'rgba(36,48,86,.12)'; ell(64, 6, 5, 2.5); ctx.fill(); }
  else if(def.trident){
    ctx.fillStyle = def.shaft; rr(52, -12, 7, 24, 3.5); ctx.fill();
    circ(68, 0, 6, '#ffe27a'); circ(68, 0, 3, '#ff5a5f');
    ctx.fillStyle = '#e0a800'; rr(52, -12, 7, 5, 2.5); ctx.fill();
  } else {
    ctx.fillStyle = fl;
    ctx.beginPath(); ctx.moveTo(46, -3); ctx.lineTo(68, -14); ctx.quadraticCurveTo(72, -6, 66, -2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(46, 3); ctx.lineTo(68, 14); ctx.quadraticCurveTo(72, 6, 66, 2); ctx.closePath(); ctx.fill();
  }
}
function axeShape(){
  ctx.fillStyle = '#a0663a'; rr(-6, -4, 72, 8, 4); ctx.fill();
  ctx.fillStyle = '#ff5a5f'; rr(2, -5, 9, 10, 3); ctx.fill();
  ctx.fillStyle = '#b8c6d6'; ctx.beginPath(); ctx.moveTo(-2, -9); ctx.lineTo(-22, -18); ctx.quadraticCurveTo(-30, 0, -22, 18); ctx.lineTo(-2, 9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#dfe8f1'; ctx.beginPath(); ctx.moveTo(-2, -9); ctx.lineTo(-22, -18); ctx.quadraticCurveTo(-26, -8, -24, -2); ctx.lineTo(-2, -2); ctx.closePath(); ctx.fill();
}
const myStick = () => STICKS[G.myStick] || STICKS[0];
const rivalStick = () => STICKS[G.rivalStick] || STICKS[0];

function drawPlats(){
  for(const p of G.plats){
    if(p.kind === 'ground') continue;
    const s = sy(p.y); if(s < -40 || s > VH + 40) continue;
    ctx.save();
    let dx = 0; if(p.crumbleT != null && !p.fall) dx = Math.sin(G.time * 60) * 2;
    ctx.translate((p.side === 'R' ? FR : FL) + dx, s);
    if(p.side === 'L') ctx.scale(-1, 1);
    if(p.fall) ctx.rotate(p.ang); else if(p.wob) ctx.rotate(Math.sin(p.wob * 18) * p.wob * 0.12);
    if(p.kind === 'axe') axeShape();
    else if(p.side === 'L') stickShape(rivalStick(), p.golden, '#6c5ce7');
    else stickShape(myStick(), p.golden, G.theme.accent);
    ctx.restore();
  }
}

function drawMonkey(x, feet, pal, facing, pose, squash, blink){
  ctx.save(); ctx.translate(x, feet); ctx.scale(facing, 1);
  const sq = 1 + 0.22 * squash; ctx.scale(sq, 1 / sq);
  ctx.lineCap = 'round';
  ctx.strokeStyle = pal.body; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-12, -14); ctx.bezierCurveTo(-32, -8, -34, -40, -20, -44); ctx.stroke();
  ctx.fillStyle = pal.dark; ell(-8, -4, 8, 5.5); ctx.fill(); ell(9, -4, 8, 5.5); ctx.fill();
  ctx.fillStyle = pal.body; ell(0, -21, 17, 18); ctx.fill();
  ctx.fillStyle = pal.face; ell(3, -18, 10, 11); ctx.fill();
  ctx.strokeStyle = pal.body; ctx.lineWidth = 8;
  if(pose === 'jump' || pose === 'win'){
    const w = pose === 'win' ? Math.sin(G.time * 12) * 5 : 0;
    ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(-17, -54 + w); ctx.moveTo(10, -30); ctx.lineTo(17, -54 - w); ctx.stroke();
  } else if(pose === 'fall'){
    ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(-26, -42); ctx.moveTo(10, -30); ctx.lineTo(26, -42); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(9, -30); ctx.lineTo(24, -26); ctx.moveTo(-8, -28); ctx.lineTo(2, -15); ctx.stroke();
  }
  ctx.fillStyle = pal.body; ell(-15, -50, 8, 8); ctx.fill(); ell(16, -50, 8, 8); ctx.fill();
  ctx.fillStyle = pal.face; ell(-15, -50, 4, 4); ctx.fill(); ell(16, -50, 4, 4); ctx.fill();
  ctx.fillStyle = pal.body; ell(0, -48, 18, 17); ctx.fill();
  ctx.fillStyle = pal.face; ell(4, -43, 13, 11); ctx.fill();
  ctx.fillStyle = 'rgba(255,120,120,.35)'; ell(-5, -40, 3.5, 2.5); ctx.fill(); ell(15, -40, 3.5, 2.5); ctx.fill();
  if(pose === 'stun'){
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-1, -54); ctx.lineTo(5, -48); ctx.moveTo(5, -54); ctx.lineTo(-1, -48);
    ctx.moveTo(8, -54); ctx.lineTo(14, -48); ctx.moveTo(14, -54); ctx.lineTo(8, -48); ctx.stroke();
  } else if(blink < 0){
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-1, -50); ctx.lineTo(5, -50); ctx.moveTo(8, -50); ctx.lineTo(14, -50); ctx.stroke();
  } else {
    ctx.fillStyle = '#ffffff'; ell(2, -51, 5, 6); ctx.fill(); ell(12, -51, 5, 6); ctx.fill();
    ctx.fillStyle = INK; ell(3.5, -50, 2.8, 3.3); ctx.fill(); ell(13.5, -50, 2.8, 3.3); ctx.fill();
    ctx.fillStyle = '#ffffff'; ell(4.5, -51.5, 1, 1); ctx.fill(); ell(14.5, -51.5, 1, 1); ctx.fill();
  }
  if(pal.angry){ ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-3, -60); ctx.lineTo(6, -57); ctx.moveTo(17, -60); ctx.lineTo(9, -57); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.beginPath();
  if(pose === 'win' || pose === 'jump'){ ctx.fillStyle = INK; ell(8, -39, 4, 3.4); ctx.fill(); }
  else if(pose === 'fall' || pose === 'stun'){ ctx.arc(8, -36, 3, Math.PI + 0.3, -0.3); ctx.stroke(); }
  else { ctx.arc(8, -41, 3.4, 0.2, Math.PI - 0.2); ctx.stroke(); }
  ctx.restore();
}

function starPath(r){ ctx.beginPath(); for(let j = 0; j < 10; j++){ const a = -Math.PI / 2 + j * Math.PI / 5, r2 = j % 2 ? r * 0.45 : r; j ? ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2) : ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2); } ctx.closePath(); }
function drawStars(x, s){
  for(let k = 0; k < 3; k++){
    const a = G.time * 6 + k * 2.1;
    ctx.save(); ctx.translate(x + Math.cos(a) * 18, s - 72 + Math.sin(a) * 5); starPath(6); ctx.fillStyle = '#ffcf3f'; ctx.fill(); ctx.restore();
  }
}

function drawClimbers(){
  const r = G.rival, rs = sy(r.y);
  if(rs > -80 && rs < VH + 80){
    drawMonkey(FL - 30, rs - 4, PAL_R, 1, r.state === 'jump' ? 'jump' : r.state === 'top' ? 'win' : r.state === 'fall' ? 'fall' : 'idle', r.squash, r.blink);
    if(r.sweat > 0){ ctx.fillStyle = '#7fd8ff'; ell(FL - 52, rs - 64, 4, 6); ctx.fill(); }
    if(G.mode === 'online'){ const nm = NET.remoteName || 'Friend'; ctx.font = '700 16px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText(nm, FL - 30, rs - 78); ctx.fillStyle = '#fff'; ctx.fillText(nm, FL - 30, rs - 78); }
  }
  const pl = G.player, ps = sy(pl.y);
  const stunned = pl.state === 'stun' || (pl.state === 'fall' && pl.stunAfter > 0);
  const pose = pl.state === 'jump' ? 'jump' : pl.state === 'win' ? 'win' : pl.state === 'fall' ? 'fall' : stunned ? 'stun' : 'idle';
  drawMonkey(FR + 30, ps - 4, PAL_P, -1, pose, pl.squash, pl.blink);
  if(stunned) drawStars(FR + 30, ps);
}

function drawToucan(t){
  const s = sy(t.y); if(s < -60 || s > VH + 60) return;
  ctx.save(); ctx.translate(t.x + (t.hitT > 0 ? Math.sin(G.time * 50) * 3 : 0), s);
  ctx.scale(t.dir, 1); if(t.dead) ctx.rotate(t.rot);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-14, -2); ctx.lineTo(-30, -8); ctx.lineTo(-28, 6); ctx.closePath(); ctx.fill();
  ell(0, 0, 19, 13); ctx.fill();
  ctx.fillStyle = '#fff4d6'; ell(9, 3, 8, 8); ctx.fill();
  ctx.fillStyle = '#ff8a1f'; ctx.beginPath(); ctx.moveTo(11, -7); ctx.quadraticCurveTo(38, -10, 40, 2); ctx.quadraticCurveTo(26, 4, 12, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffcf3f'; ctx.beginPath(); ctx.moveTo(11, -7); ctx.quadraticCurveTo(30, -9, 36, -4); ctx.lineTo(12, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff'; ell(9, -5, 4, 4); ctx.fill(); ctx.fillStyle = INK; ell(10, -5, 2, 2.2); ctx.fill();
  const f = Math.sin(t.flap) * 0.9;
  ctx.fillStyle = '#3a4a7a'; ell(-4, -7, 13, 6, -0.4 - f); ctx.fill();
  ctx.restore();
}

function drawProjs(){
  for(const p of G.projs){
    ctx.save(); ctx.translate(p.x, sy(p.y));
    if(p.kind === 'axe'){ ctx.translate(30, 0); ctx.rotate(p.rot); ctx.translate(-30, 0); axeShape(); }
    else { ctx.fillStyle = 'rgba(255,255,255,.5)'; rr(66, -2, 60, 4, 2); ctx.fill(); stickShape(myStick(), false, G.theme.accent); }
    ctx.restore();
  }
}

function drawParts(){
  for(const p of G.parts){
    const s = sy(p.y); if(s < -40 || s > VH + 40) continue;
    ctx.globalAlpha = Math.min(1, p.life / p.max * 2);
    ctx.save(); ctx.translate(p.x, s); ctx.rotate(p.rot);
    if(p.shape === 'dart'){ ctx.scale(0.9, 0.9); stickShape(myStick(), false, G.theme.accent); }
    else if(p.shape === 'axe'){ ctx.scale(0.9, 0.9); axeShape(); }
    else if(p.shape === 'star'){ starPath(p.sz); ctx.fillStyle = p.col; ctx.fill(); }
    else if(p.shape === 'rect'){ ctx.fillStyle = p.col; rr(-p.sz / 2, -p.sz / 3, p.sz, p.sz * 0.66, 2); ctx.fill(); }
    else { circ(0, 0, p.sz / 2, p.col); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawPops(){
  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  for(const p of G.pops){
    const k = p.t / p.life, sc = p.t < 0.12 ? (p.t / 0.12) * 1.25 : p.t < 0.22 ? 1.25 - (p.t - 0.12) / 0.1 * 0.25 : 1;
    const y = (p.screen ? p.s : sy(p.wy)) - p.t * 50;
    ctx.save(); ctx.translate(p.x, y); ctx.scale(sc, sc); ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    ctx.font = '700 ' + p.size + 'px Fredoka, "Arial Rounded MT Bold", sans-serif';
    ctx.lineWidth = p.size * 0.22; ctx.strokeStyle = INK; ctx.strokeText(p.txt, 0, 0);
    ctx.fillStyle = p.col; ctx.fillText(p.txt, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawFlies(){
  for(const f of G.flies){
    if(f.t < 0) continue;
    const k = easeOut(Math.min(1, f.t / f.dur));
    const x = f.x0 + (f.tx - f.x0) * k, y = f.y0 + (f.ty - f.y0) * k - Math.sin(Math.PI * k) * 60;
    circ(x, y, 11, '#e0a800'); circ(x, y - 1, 10, '#ffcf3f'); circ(x, y - 1, 6, '#ffe27a');
  }
}

function drawAim(){
  if(hoverY == null || G.over || G.mode === 'menu') return;
  const wy = wyFromSy(hoverY), b = G.blocks[Math.floor(wy / BLK)];
  const bad = b && (b.type === 'hole' || (b.type === 'stone' && !G.armed));
  const col = bad ? 'rgba(255,90,95,.9)' : 'rgba(255,255,255,.9)';
  for(let x = FR + 20; x < flyMaxX(); x += 22) circ(x, hoverY, 3, col);
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(FR + 6, hoverY, 9, 0, Math.PI * 2); ctx.stroke();
}

function draw(){
  ctx.setTransform(dpr * SC, 0, 0, dpr * SC, 0, 0);
  drawBG();
  ctx.save();
  if(G.shake > 0 && !reduceMotion) ctx.translate(rnd(-1, 1) * G.shake, rnd(-1, 1) * G.shake);
  drawGround(); drawTrunk(); drawBand(); drawAim(); drawPlats(); drawClimbers();
  for(const t of G.toucans) drawToucan(t);
  drawProjs(); drawParts(); drawPops();
  ctx.restore();
  drawFlies();
}

/* ---------- networking (PeerJS) ---------- */
const NET = { peer:null, conn:null, host:false, code:'', remoteStick:0, remoteName:'', inRoom:false };
const PEER_PREFIX = 'jungleladder-v1-';
function netStatus(msg, err, busy){ const s = $('fpStatus'); s.innerHTML = (busy ? '<span class="spinner"></span>' : '') + msg; s.classList.toggle('err', !!err); }
function netSend(m){ try{ if(NET.conn && NET.conn.open) NET.conn.send(m); }catch(e){} }
function loadPeer(cb){
  if(window.Peer) return cb();
  netStatus('Loading multiplayer…', false, true);
  const s = document.createElement('script');
  s.src = 'js/vendor/peerjs.min.js';
  s.onload = () => window.Peer ? cb() : netStatus('Multiplayer could not start here.', true);
  s.onerror = () => netStatus('Could not load multiplayer. Check your connection.', true);
  document.head.appendChild(s);
}
function netLeave(){
  try{ NET.conn && NET.conn.close(); }catch(e){}
  try{ NET.peer && NET.peer.destroy(); }catch(e){}
  if(NET.inRoom) CG.leftRoom();
  NET.peer = null; NET.conn = null; NET.host = false; NET.code = ''; NET.inRoom = false; NET.remoteName = '';
  $('fpChoose').hidden = false; $('fpRoom').hidden = true; $('fpHost').disabled = false; $('fpJoin').disabled = false;
}
function randCode(){ const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for(let i = 0; i < 5; i++) s += A[(Math.random() * A.length) | 0]; return s; }
function peerError(e){
  const t = e && e.type;
  if(t === 'unavailable-id' && NET.host){ try{ NET.peer.destroy(); }catch(_){} NET.peer = null; hostRoom(); return; }
  if(t === 'peer-unavailable') netStatus('Room not found. Check the code and try again.', true);
  else if(t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') netStatus('Could not reach the match server. Check your connection.', true);
  else if(t === 'browser-incompatible') netStatus('This browser does not support online play.', true);
  else netStatus('Connection problem. Try again.', true);
  $('fpHost').disabled = false; $('fpJoin').disabled = false;
}
function hostRoom(){
  $('fpHost').disabled = true; $('fpJoin').disabled = true;
  loadPeer(() => {
    NET.host = true; NET.code = randCode();
    try{ NET.peer = new window.Peer(PEER_PREFIX + NET.code); }catch(e){ netStatus('Multiplayer could not start here.', true); return; }
    NET.peer.on('open', () => {
      $('fpChoose').hidden = true; $('fpRoom').hidden = false; $('fpCodeShow').textContent = NET.code;
      $('fpCopy').textContent = CG.canInvite ? 'Copy invite link' : 'Copy code';
      NET.inRoom = true;
      CG.room({ roomId:NET.code, isJoinable:true, inviteParams:{ room:NET.code } });
      netStatus('Waiting for your friend to join…', false, true);
    });
    NET.peer.on('connection', c => { if(NET.conn){ c.on('open', () => c.close()); return; } setupConn(c); });
    NET.peer.on('error', peerError);
  });
}
function joinRoom(){
  const code = $('fpCode').value.trim().toUpperCase();
  if(code.length < 5){ netStatus('Enter the 5-letter room code.', true); return; }
  $('fpHost').disabled = true; $('fpJoin').disabled = true;
  loadPeer(() => {
    NET.host = false; NET.code = code;
    try{ NET.peer = new window.Peer(); }catch(e){ netStatus('Multiplayer could not start here.', true); return; }
    NET.peer.on('open', () => { netStatus('Joining room ' + code + '…', false, true); setupConn(NET.peer.connect(PEER_PREFIX + code, { reliable:true })); });
    NET.inRoom = true; CG.room({ roomId:code, isJoinable:false });
    NET.peer.on('error', peerError);
  });
}
function setupConn(c){
  NET.conn = c;
  c.on('open', () => {
    netStatus('Connected!');
    if(NET.host) CG.room({ roomId:NET.code, isJoinable:false });
    netSend({ t:'hi', stick:save.stick, name:CG.username().slice(0, 24) });
    if(NET.host) hostStart();
  });
  c.on('data', onNet);
  c.on('close', netClosed);
  c.on('error', () => netClosed());
}
function hostStart(){ const lv = 3 + ((Math.random() * 9) | 0); netSend({ t:'start', lv }); startOnline(lv); }
function netClosed(){
  const wasConn = !!NET.conn; NET.conn = null;
  if(NET.host && NET.peer) CG.room({ roomId:NET.code, isJoinable:true, inviteParams:{ room:NET.code } });
  if(G && G.mode === 'online'){
    if(!G.over) finish('left');
    else if(G.endShown) $('endMain').hidden = true;
  } else if(wasConn) netStatus('Your friend disconnected.', true);
}
function onNet(m){
  if(!m || typeof m !== 'object') return;
  if(m.t === 'hi'){ NET.remoteStick = Math.max(0, Math.min(STICKS.length - 1, m.stick | 0)); NET.remoteName = String(m.name || '').replace(/[<>]/g, '').slice(0, 24);
    if(G && G.mode === 'online') G.rivalStick = NET.remoteStick; }
  else if(m.t === 'start'){ startOnline(Math.max(1, m.lv | 0)); }
  else if(m.t === 'rematch'){ if(NET.host) hostStart(); }
  else if(!G || G.mode !== 'online') return;
  else if(m.t === 's'){ G.rival.ty = +m.y || 0; G.rival.rst = String(m.st || 'idle'); }
  else if(m.t === 'p'){ G.plats.push({ y:+m.y || 0, side:'L', kind:m.k === 'axe' ? 'axe' : 'dart', golden:!!m.g, fall:false, vy:0, ang:0, crumbleT:null, bi:-1, wob:1 }); }
  else if(m.t === 'd'){ for(const q of G.plats) if(q.side === 'L' && q.kind !== 'ground' && Math.floor(q.y / BLK) === (m.bi | 0) && !q.fall){ q.fall = true; q.vy = 0; } }
  else if(m.t === 'win'){ G.rival.ty = G.towerH; G.rival.rst = 'win'; if(!G.over) finish('lose'); }
}
function startOnline(lv){
  closePanels(); hideEnd(); document.body.classList.remove('menu');
  newLevel(lv, 'online');
}

/* ---------- menu flow ---------- */
function openMenu(){
  CG.stop(); closePanels(); hideEnd(); showAdWait(false);
  if(G && G.mode === 'online') netLeave();
  document.body.classList.add('menu');
  newLevel(save.level, 'menu');
  $('menuLv').textContent = 'Level ' + save.level;
  refreshBadges();
}
function quickPlay(){ audio(); closePanels(); document.body.classList.remove('menu'); newLevel(save.level, 'solo'); }

/* ---------- input ---------- */
let hoverY = null;
function localY(e){ const r = cvs.getBoundingClientRect(); return (e.clientY - r.top) / SC; }
cvs.addEventListener('pointerdown', e => { audio(); e.preventDefault(); throwAt(localY(e)); });
cvs.addEventListener('pointermove', e => { hoverY = e.pointerType === 'mouse' ? localY(e) : null; });
cvs.addEventListener('pointerleave', () => { hoverY = null; });
$('axeBtn').addEventListener('click', () => { audio(); if(G && !G.over && G.cd.axe <= 0) setArmed(!G.armed); $('axeBtn').blur(); });
$('restart').addEventListener('click', () => { audio(); if(G.mode === 'online') return; CG.stop(); newLevel(G.n, 'solo'); $('restart').blur(); });
$('home').addEventListener('click', () => { audio(); openMenu(); });
$('mute').addEventListener('click', () => { if(CG.muted) return; save.muted = !save.muted; persist(); updateMute(); audio(); });
$('btnQuick').addEventListener('click', quickPlay);
function openFriend(){ netLeave(); netStatus(''); openPanel('friendPanel'); }
function joinFromInvite(code){
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); if(code.length < 5) return;
  if(G && G.mode === 'online') netLeave();
  openMenu(); openFriend(); $('fpCode').value = code; joinRoom();
}
$('btnFriend').addEventListener('click', () => { audio(); openFriend(); });
$('btnUp').addEventListener('click', () => { audio(); openPanel('upPanel'); });
$('btnSticks').addEventListener('click', () => { audio(); openPanel('stickPanel'); });
$('endUp').addEventListener('click', () => { audio(); openPanel('upPanel'); });
$('endMenu').addEventListener('click', () => { audio(); openMenu(); });
$('fpHost').addEventListener('click', () => { audio(); hostRoom(); });
$('fpJoin').addEventListener('click', () => { audio(); joinRoom(); });
$('fpCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
$('fpCode').addEventListener('keydown', e => { if(e.key === 'Enter') joinRoom(); });
$('fpCopy').addEventListener('click', () => {
  const label = CG.canInvite ? 'Copy invite link' : 'Copy code';
  Promise.resolve(CG.canInvite ? CG.inviteLink({ room:NET.code }) : null).catch(() => null).then(link => {
    try{ navigator.clipboard.writeText(link || NET.code).then(() => { $('fpCopy').textContent = 'Copied!'; setTimeout(() => $('fpCopy').textContent = label, 1500); }); }catch(e){}
  });
});
/* Midgame ads only at natural breaks (next level / retry), never on navigation buttons, never in friend matches. */
function goNext(level, withMidgame){
  if(withMidgame && G.n >= 2) CG.ad('midgame', () => newLevel(level, 'solo'));
  else newLevel(level, 'solo');
}
$('endMain').addEventListener('click', () => {
  audio();
  if(G.mode === 'online'){
    if(!NET.conn) return;
    if(NET.host) hostStart(); else { netSend({ t:'rematch' }); $('endMainT').textContent = 'Waiting…'; $('endMain').disabled = true; }
    return;
  }
  goNext(G.result === 'win' ? save.level : G.n, !G.watchedAd);   // never chain a midgame right after a rewarded ad
});
$('endAd').addEventListener('click', () => {
  audio();
  const btn = $('endAd'); btn.disabled = true;
  if(G.result === 'win'){
    const extra = (G.earned + G.bonus) * 2;
    CG.ad('rewarded', ok => {
      G.watchedAd = true;
      if(ok){ save.bananas += extra; persist(); refreshCoins(true); bumpCoins(); SFX.buy(); $('endCoins').textContent = '+' + (extra + G.earned + G.bonus); toast('Tripled! +' + extra + ' bananas'); btn.hidden = true; }
      else { toast('No ad available right now. Try again later.'); btn.hidden = true; }
    });
  } else {
    CG.ad('rewarded', ok => {
      if(ok){ if(save.level <= G.n) save.level = G.n + 1; persist(); toast('Level skipped!'); newLevel(save.level, 'solo'); }
      else { toast('No ad available right now. Try again later.'); btn.hidden = true; }
    });
  }
});
$('endAlt').addEventListener('click', () => {
  audio();
  if(save.bananas < SKIP_COST) return;
  save.bananas -= SKIP_COST; if(save.level <= G.n) save.level = G.n + 1; persist(); refreshCoins(true); SFX.buy();
  toast('Level skipped!'); newLevel(save.level, 'solo');
});
window.addEventListener('keydown', e => {
  if(e.target && e.target.tagName === 'INPUT') return;
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  if(!G) return;
  if(e.key === 'Escape'){ closePanels(); return; }
  if(e.key === '2' || e.key === 'e' || e.key === 'E'){ if(!G.over && G.cd.axe <= 0 && G.mode !== 'menu') setArmed(!G.armed); }
  else if(e.code === 'Space' && !G.over && G.mode !== 'menu'){
    e.preventDefault(); audio();
    if(hoverY != null) throwAt(hoverY); else { const b = bandFor(G.player); throwAt(sy(b.hi - 10)); }
  }
});

/* ---------- loop ---------- */
let last = performance.now();
function frame(now){
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if(!document.hidden && G){ update(dt); draw(); }
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { last = performance.now(); applyAudio(); });

async function boot(){
  resize();
  CG.hooks = { audio:applyAudio, adWait:showAdWait, mute:updateMute };
  try{ await CG.init(); }catch(e){}
  $('btnFriend').hidden = !CG.features.friends;
  CG.loadingStart();
  loadSave();
  await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1500))]);
  updateMute(); refreshCoins(true);
  CG.progress(progressPct());
  CG.onJoinRoom(room => { if(CG.features.friends) joinFromInvite(room); });
  $('boot').hidden = true;
  CG.loadingStop();
  const invite = CG.features.friends ? CG.inviteRoom() : null;
  if(invite) joinFromInvite(invite);
  else if(CG.features.friends && CG.instantMultiplayer()){ openMenu(); openFriend(); hostRoom(); }
  else if(isNewPlayer) quickPlay();        // new players land straight in gameplay
  else openMenu();                         // returning players: menu, Quick Play is one click
  requestAnimationFrame(frame);
}
boot();
})();
