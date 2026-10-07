/* Paddle Royale — client */
(() => {
  'use strict';
  const Core = window.PongCore;
  const CONF = Object.assign({ SERVER_URL: '' }, window.GAME_CONFIG || {});
  const QS = new URLSearchParams(location.search);
  if (QS.get('server')) CONF.SERVER_URL = QS.get('server');
  // no server configured: Quick Play is against bots and private rooms run peer-to-peer (see P2P below)
  const ONLINE = !!CONF.SERVER_URL && !CONF.SERVER_URL.includes('YOUR-SERVER');

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const show = (el, on = true) => el.classList.toggle('hidden', !on);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const AVATARS = 16;
  const BOT_NAMES = ['Anika', 'Freya', 'Iris', 'Leo', 'Maya', 'Kai', 'Zara', 'Omar', 'Nina', 'Theo', 'Luna', 'Ravi',
    'Sana', 'Milo', 'Aria', 'Hugo', 'Ines', 'Yuki', 'Noah', 'Lena', 'Ezra', 'Tara', 'Remy', 'Nora', 'Ayaan', 'Hana'];
  const ADJ = ['Swift', 'Lucky', 'Bouncy', 'Sunny', 'Brave', 'Zippy', 'Cosmic', 'Mellow', 'Turbo', 'Pixel', 'Happy', 'Sneaky', 'Jolly', 'Rapid', 'Fuzzy', 'Clever'];
  const NOUN = ['Otter', 'Panda', 'Comet', 'Falcon', 'Koala', 'Tiger', 'Pebble', 'Rocket', 'Fox', 'Mango', 'Lynx', 'Puffin', 'Yeti', 'Gecko', 'Moose', 'Orca'];
  const randomName = () => pick(ADJ) + pick(NOUN) + (10 + ((Math.random() * 90) | 0));

  // =====================================================================
  // CrazyGames SDK v3 wrapper (everything degrades gracefully without it)
  // =====================================================================
  const CG = {
    sdk: null, ready: false, env: 'disabled', playing: false, mem: {}, room: null,
    // the SDK is loaded here rather than with a blocking <script> in <head>, so the loading screen paints instantly
    loadScript() {
      if (window.CrazyGames && window.CrazyGames.SDK) return Promise.resolve(true);
      return new Promise(res => {
        const el = document.createElement('script');
        el.src = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';
        const t = setTimeout(() => res(false), 5000);
        el.onload = () => { clearTimeout(t); res(true); };
        el.onerror = () => { clearTimeout(t); res(false); };
        document.head.appendChild(el);
      });
    },
    async init() {
      try {
        if (QS.get('nosdk') === '1') return;
        if (!(await this.loadScript())) return;
        await window.CrazyGames.SDK.init();
        this.sdk = window.CrazyGames.SDK;
        this.env = this.sdk.environment;
        this.ready = this.env === 'crazygames' || this.env === 'local';
      } catch (e) { console.warn('CrazyGames SDK unavailable', e); }
    },
    call(fn, fallback) { if (!this.ready) return fallback; try { return fn(this.sdk); } catch (e) { console.warn(e); return fallback; } },
    loadingStart() { this.call(s => s.game.loadingStart()); },
    loadingStop() { this.call(s => s.game.loadingStop()); },
    gameplayStart() { if (this.playing) return; this.playing = true; this.call(s => s.game.gameplayStart()); },
    gameplayStop() { if (!this.playing) return; this.playing = false; this.call(s => s.game.gameplayStop()); },
    happytime() { this.call(s => s.game.happytime()); },
    ad(type, onDone, onReward) {
      if (!this.ready) { onDone(false); return; }
      let finished = false;
      const wasPlaying = this.playing;
      const end = ok => {
        if (finished) return; finished = true; Sound.setAd(false);
        if (wasPlaying) this.gameplayStart();
        onDone(ok);
      };
      try {
        this.sdk.ad.requestAd(type, {
          adStarted: () => { Sound.setAd(true); this.gameplayStop(); },
          adFinished: () => { if (onReward) onReward(); end(true); },
          adError: () => end(false),
        });
      } catch (e) { end(false); }
    },
    midgame(cb) { this.ad('midgame', () => cb()); },
    rewarded(onReward, onFail) { this.ad('rewarded', ok => { if (!ok && onFail) onFail(); }, onReward); },
    // save data: CrazyGames data module (cloud-synced for logged-in players), localStorage elsewhere
    getItem(k) {
      const v = this.call(s => s.data.getItem(k), undefined);
      if (v !== undefined) return v;
      try { return localStorage.getItem(k); } catch { return this.mem[k] ?? null; }
    },
    setItem(k, v) {
      if (this.ready) { this.call(s => s.data.setItem(k, v)); return; }
      try { localStorage.setItem(k, v); } catch { this.mem[k] = v; }
    },
    async getUser() {
      if (!this.ready) return null;
      try { if (!this.sdk.user.isUserAccountAvailable) return null; return await this.sdk.user.getUser(); } catch { return null; }
    },
    inviteParam(k) {
      const all = this.call(s => s.game.inviteParams, null);
      const v = (all && all[k]) || this.call(s => s.game.getInviteParam(k), null);
      return v || QS.get(k);
    },
    get instantMultiplayer() { return !!this.call(s => s.game.isInstantMultiplayer, false); },
    inviteLink(code) {
      const link = this.call(s => s.game.inviteLink({ roomId: code }), null);
      if (link) return link;
      const u = new URL(location.href);
      u.searchParams.set('roomId', code);
      return u.toString();
    },
    // Room Data API (falls back to the older invite button on SDK builds without it)
    roomOpen(code) {
      this.room = code;
      this.call(s => {
        if (s.game.updateRoom) s.game.updateRoom({ roomId: code, isJoinable: true, inviteParams: { roomId: code } });
        else s.game.showInviteButton({ roomId: code });
      });
    },
    roomBusy(code) {
      this.room = code;
      this.call(s => {
        if (s.game.updateRoom) s.game.updateRoom({ roomId: code, isJoinable: false });
        else s.game.hideInviteButton();
      });
    },
    leftRoom() {
      if (!this.room) return;
      this.room = null;
      this.call(s => { if (s.game.leftRoom) s.game.leftRoom(); else s.game.hideInviteButton(); });
    },
    onJoinRoom(fn) { this.call(s => s.game.addJoinRoomListener && s.game.addJoinRoomListener(fn)); },
    get sdkMuted() { return !!this.call(s => s.game.settings && s.game.settings.muteAudio, false) || QS.get('muteAudio') === 'true'; },
    get chatDisabled() { return !!this.call(s => s.game.settings && s.game.settings.disableChat, false) || QS.get('disableChat') === 'true'; },
    onSettings(fn) { this.call(s => s.game.addSettingsChangeListener(fn)); },
    onAuth(fn) { this.call(s => s.user.addAuthListener(fn)); },
    context(o) { this.call(s => s.game.setGameContext && s.game.setGameContext(o)); },
    clearContext() { this.call(s => s.game.clearGameContext && s.game.clearGameContext()); },
  };

  // =====================================================================
  // Sound (tiny WebAudio synth, no asset files)
  // =====================================================================
  const Sound = {
    ctx: null, master: null, userMute: false, sdkMute: false, adMute: false,
    unlock() {
      if (!this.ctx) {
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          this.master = this.ctx.createGain();
          this.master.connect(this.ctx.destination);
        } catch { return; }
      }
      this.apply();
    },
    on() { return !(this.userMute || this.sdkMute || this.adMute); },
    apply() {
      if (!this.ctx) return;
      this.master.gain.value = this.on() ? 0.55 : 0;
      if (this.adMute) this.ctx.suspend && this.ctx.suspend();
      else if (this.ctx.state === 'suspended') this.ctx.resume && this.ctx.resume();
    },
    setAd(v) { this.adMute = v; this.apply(); },
    tone(f, dur, type = 'sine', vol = 0.25, slide = 0, delay = 0) {
      if (!this.ctx || !this.on()) return;
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f * slide), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
    },
    play(n, v = 0) {
      switch (n) {
        case 'hit': this.tone(420 + v, 0.08, 'square', 0.09); break;
        case 'wall': this.tone(260, 0.05, 'triangle', 0.12); break;
        case 'bump': this.tone(620, 0.14, 'sine', 0.2, 1.7); break;
        case 'goal': this.tone(300, 0.22, 'triangle', 0.18, 0.6); break;
        case 'hurt': this.tone(190, 0.38, 'sawtooth', 0.14, 0.45); break;
        case 'pu': this.tone(660, 0.1, 'sine', 0.2); this.tone(990, 0.16, 'sine', 0.2, 0, 0.08); break;
        case 'out': this.tone(330, 0.2, 'triangle', 0.2, 0.7); this.tone(220, 0.3, 'triangle', 0.2, 0.7, 0.18); break;
        case 'win': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.2, 0, i * 0.12)); break;
        case 'lose': [392, 330, 262].forEach((f, i) => this.tone(f, 0.26, 'triangle', 0.18, 0, i * 0.15)); break;
        case 'count': this.tone(520, 0.1, 'sine', 0.18); break;
        case 'go': this.tone(880, 0.22, 'sine', 0.22); break;
        case 'haz': this.tone(160, 0.35, 'sine', 0.22, 2.4); break;
        case 'shield': this.tone(720, 0.12, 'sine', 0.16, 0.8); break;
        case 'click': this.tone(760, 0.04, 'triangle', 0.08); break;
        case 'spawn': this.tone(1200, 0.08, 'sine', 0.07); break;
      }
    },
  };

  // =====================================================================
  // Save data: profile, coins, inventory, stats, settings.
  // Stored as one JSON blob through the CrazyGames data module (localStorage fallback).
  // =====================================================================
  const SAVE_KEY = 'pr_profile';
  const FREE_AVATARS = 8, AVATAR_PRICE = 150;
  const today = () => new Date().toISOString().slice(0, 10);
  const Profile = {
    name: '', saved: '', avatar: 0, cgName: false,
    coins: 0, owned: { paddle: [0], ball: [0], trail: [0], avatar: [] }, eq: { p: 0, b: 0, t: 0 },
    stats: { played: 0, wins: 0, hits: 0, goals: 0, pu: 0, best: 0 },
    tut: false, ghostTip: false, chat: true, day: '', streak: 0, freeAt: 0, fresh: true,
    xp: 0, lvl: 1, quests: { day: '', list: [] },
    load() {
      try {
        const d = JSON.parse(CG.getItem(SAVE_KEY) || 'null');
        if (d) {
          this.fresh = false;
          this.name = d.name || ''; this.avatar = d.avatar | 0; Sound.userMute = !!d.mute;
          this.coins = Math.max(0, d.coins | 0);
          Object.assign(this.stats, d.stats || {});
          if (d.owned) for (const k in this.owned) if (Array.isArray(d.owned[k])) this.owned[k] = d.owned[k].map(v => v | 0);
          if (d.eq) this.eq = { p: d.eq.p | 0, b: d.eq.b | 0, t: d.eq.t | 0 };
          // players from before the tutorial existed have already played: don't force it on them
          this.tut = d.tut != null ? !!d.tut : this.stats.played > 0;
          this.ghostTip = !!d.ghostTip; this.chat = d.chat !== false;
          this.day = d.day || ''; this.streak = d.streak | 0; this.freeAt = +d.freeAt || 0;
          this.xp = Math.max(0, d.xp | 0); this.lvl = Math.max(1, d.lvl | 0);
          if (d.quests && Array.isArray(d.quests.list)) this.quests = { day: String(d.quests.day || ''), list: d.quests.list.map(q => ({ id: String(q.id), p: q.p | 0, done: !!q.done })) };
        }
      } catch { /* fresh profile */ }
      if (!this.name) this.name = randomName();
      for (let i = 0; i < FREE_AVATARS; i++) if (!this.owned.avatar.includes(i)) this.owned.avatar.push(i);
      if (!this.owned.avatar.includes(this.avatar)) this.owned.avatar.push(this.avatar); // keep whatever they already used
      for (const [slot, k] of [['p', 'paddle'], ['b', 'ball'], ['t', 'trail']]) if (!this.owned[k].includes(this.eq[slot])) this.eq[slot] = 0;
    },
    saveNow() {
      CG.setItem(SAVE_KEY, JSON.stringify({
        v: 2, name: this.cgName ? this.saved || this.name : this.name, avatar: this.avatar, mute: Sound.userMute,
        coins: this.coins, owned: this.owned, eq: this.eq, stats: this.stats,
        tut: this.tut, ghostTip: this.ghostTip, chat: this.chat, day: this.day, streak: this.streak, freeAt: this.freeAt,
        xp: this.xp, lvl: this.lvl, quests: this.quests,
      }));
    },
    save() { clearTimeout(this._t); this._t = setTimeout(() => this.saveNow(), 150); },
    addCoins(n) { this.coins = Math.max(0, this.coins + Math.round(n)); this.save(); updateCoinPills(); },
    owns(cat, id) { return this.owned[cat].includes(id); },
    // daily bonus: a 7-day cycle of consecutive days, with a big payout on day 7
    claimDaily() {
      const d = today();
      if (this.day === d) return 0;
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      this.streak = this.day === y ? this.streak + 1 : 1;
      this.day = d;
      const bonus = dailyBonus(this.streak);
      this.addCoins(bonus);
      return bonus;
    },
    // XP comes from match coins (before any ad doubling); every level pays out coins
    addXp(n) {
      this.xp += Math.max(0, Math.round(n));
      let bonus = 0;
      while (this.xp >= xpNeed(this.lvl)) { this.xp -= xpNeed(this.lvl); this.lvl++; bonus += levelBonus(this.lvl); }
      if (bonus) this.addCoins(bonus);
      this.save();
      return bonus;
    },
  };
  const DAILY = [30, 40, 50, 60, 80, 100, 200];
  const dailyBonus = streak => DAILY[(Math.max(1, streak) - 1) % DAILY.length];
  const xpNeed = lvl => 80 + 40 * (lvl - 1);
  const levelBonus = lvl => 40 + 10 * lvl;

  // =====================================================================
  // Daily quests: three a day, the same three for everyone on a given date
  // =====================================================================
  const QUESTS = {
    play: { text: n => `Finish ${n} matches`, n: 3, coins: 50 },
    hits: { text: n => `Hit the ball ${n} times`, n: 40, coins: 60 },
    goals: { text: n => `Knock off ${n} hearts`, n: 6, coins: 60 },
    pu: { text: n => `Claim ${n} power-ups`, n: 5, coins: 60 },
    top3: { text: n => `Finish top 3 ${n} times`, n: 2, coins: 80 },
    win: { text: () => 'Win a match', n: 1, coins: 100 },
  };
  const Quests = {
    // refresh the list when the date changes; always keeps one easy "finish matches" quest
    list() {
      const d = today(), q = Profile.quests;
      if (q.day !== d || q.list.length !== 3 || q.list.some(x => !QUESTS[x.id])) {
        const seed = +d.replace(/-/g, '');
        const pool = ['hits', 'goals', 'pu', 'top3', 'win'].sort((a, b) => hash(seed + a.charCodeAt(0)) - hash(seed + b.charCodeAt(0)));
        Profile.quests = { day: d, list: ['play', pool[0], pool[1]].map(id => ({ id, p: 0, done: false })) };
        Profile.save();
      }
      return Profile.quests.list;
    },
    // returns the quests finished by this match, already paid out
    record(delta) {
      const done = [];
      for (const q of this.list()) {
        if (q.done || !delta[q.id]) continue;
        const Q = QUESTS[q.id];
        q.p = Math.min(Q.n, q.p + delta[q.id]);
        if (q.p >= Q.n) { q.done = true; Profile.addCoins(Q.coins); done.push(q); }
      }
      Profile.save();
      return done;
    },
    html() {
      return this.list().map(q => {
        const Q = QUESTS[q.id];
        return `<div class="quest${q.done ? ' done' : ''}"><div class="q-top"><span>${esc(Q.text(Q.n))}</span><span class="q-rw">${q.done ? 'Done' : `<span class="coin"></span>${Q.coins}`}</span></div>`
          + `<div class="q-bar"><i style="width:${Math.round(100 * q.p / Q.n)}%"></i></div><div class="q-n">${q.p} / ${Q.n}</div></div>`;
      }).join('');
    },
    open() { return this.list().filter(q => !q.done).length; },
  };
  addEventListener('pagehide', () => Profile.saveNow());

  // =====================================================================
  // Colors & procedural avatars
  // =====================================================================
  const rgbCache = new Map();
  function hexRgb(h) {
    if (rgbCache.has(h)) return rgbCache.get(h);
    const n = parseInt(h.slice(1), 16);
    const r = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(h, r);
    return r;
  }
  function shade(h, amt) {
    const [r, g, b] = hexRgb(h);
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return `rgb(${Math.round(r + (t - r) * p)},${Math.round(g + (t - g) * p)},${Math.round(b + (t - b) * p)})`;
  }
  function shadeHex(h, amt) {
    const [r, g, b] = hexRgb(h), t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return '#' + [r, g, b].map(v => Math.round(v + (t - v) * p).toString(16).padStart(2, '0')).join('');
  }
  function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }

  const SKIN = ['#f8d9bd', '#eebd92', '#d39a6a', '#a86d45', '#6e4428'];
  const HAIR = ['#2d2019', '#5b3a22', '#b8672e', '#e9bf55', '#2a3350', '#9b3c2c', '#ece5da', '#6a4bb0'];
  function look(id) {
    id = Math.abs(id | 0) % AVATARS;
    return {
      skin: SKIN[(id * 3) % 5], hair: HAIR[(id * 5 + 1) % 8], style: (id * 7 + 2) % 5,
      bg: Core.COLORS[(id * 5 + 3) % 8], shirt: Core.COLORS[(id * 3 + 6) % 8], acc: id % 4,
    };
  }
  function paintAvatar(g, x, y, r, id, ring, dim) {
    const L = look(id);
    g.save();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.arc(x, y, r * 0.9, 0, Math.PI * 2); g.fillStyle = ring || L.bg; g.fill();
    g.beginPath(); g.arc(x, y, r * 0.78, 0, Math.PI * 2); g.fillStyle = shade(L.bg, 0.5); g.fill();
    g.save(); g.clip();
    const hr = r * 0.34, hx = x, hy = y - r * 0.02;
    if (L.style === 2 || L.style === 4) { // long hair behind
      g.fillStyle = shade(L.hair, -0.1);
      g.beginPath(); g.ellipse(hx, hy + hr * 0.55, hr * 1.28, hr * 1.55, 0, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = L.shirt; g.beginPath(); g.ellipse(x, y + r * 0.86, r * 0.6, r * 0.42, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = shade(L.skin, -0.1); g.fillRect(hx - hr * 0.33, hy + hr * 0.6, hr * 0.66, hr * 0.9);
    g.fillStyle = L.skin;
    g.beginPath(); g.ellipse(hx, hy, hr, hr * 1.08, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(hx - hr * 0.98, hy + hr * 0.12, hr * 0.2, 0, Math.PI * 2); g.arc(hx + hr * 0.98, hy + hr * 0.12, hr * 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = L.hair;
    const cap = () => { g.beginPath(); g.ellipse(hx, hy - hr * 0.25, hr * 1.08, hr * 0.92, 0, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill(); };
    switch (L.style) {
      case 0: cap(); g.beginPath(); g.ellipse(hx + hr * 0.35, hy - hr * 0.62, hr * 0.62, hr * 0.3, -0.3, 0, Math.PI * 2); g.fill(); break;
      case 1: cap(); g.beginPath(); g.arc(hx, hy - hr * 1.18, hr * 0.42, 0, Math.PI * 2); g.fill(); break;
      case 2: cap(); g.beginPath(); g.ellipse(hx - hr * 0.3, hy - hr * 0.6, hr * 0.7, hr * 0.32, 0.35, 0, Math.PI * 2); g.fill(); break;
      case 3: for (let k = 0; k <= 8; k++) { const a = Math.PI + k * Math.PI / 8; g.beginPath(); g.arc(hx + Math.cos(a) * hr * 0.95, hy - hr * 0.15 + Math.sin(a) * hr * 0.95, hr * 0.36, 0, Math.PI * 2); g.fill(); } break;
      case 4: cap(); g.beginPath(); g.ellipse(hx + hr * 0.2, hy - hr * 0.62, hr * 0.85, hr * 0.34, -0.25, 0, Math.PI * 2); g.fill(); break;
    }
    // face
    g.fillStyle = '#2b1f1a';
    g.beginPath(); g.ellipse(hx - hr * 0.36, hy + hr * 0.12, hr * 0.11, hr * 0.14, 0, 0, Math.PI * 2); g.ellipse(hx + hr * 0.36, hy + hr * 0.12, hr * 0.11, hr * 0.14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(hx - hr * 0.33, hy + hr * 0.07, hr * 0.04, 0, Math.PI * 2); g.arc(hx + hr * 0.39, hy + hr * 0.07, hr * 0.04, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(239,107,123,0.35)';
    g.beginPath(); g.arc(hx - hr * 0.6, hy + hr * 0.42, hr * 0.15, 0, Math.PI * 2); g.arc(hx + hr * 0.6, hy + hr * 0.42, hr * 0.15, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#6b3a2a'; g.lineWidth = hr * 0.1; g.lineCap = 'round';
    g.beginPath(); g.arc(hx, hy + hr * 0.36, hr * 0.26, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
    if (L.acc === 1) { // headphones
      g.strokeStyle = '#3b3550'; g.lineWidth = hr * 0.18;
      g.beginPath(); g.arc(hx, hy - hr * 0.05, hr * 1.15, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
      g.fillStyle = shade(L.bg, -0.3);
      g.beginPath(); g.ellipse(hx - hr * 1.1, hy + hr * 0.1, hr * 0.22, hr * 0.34, 0, 0, Math.PI * 2); g.ellipse(hx + hr * 1.1, hy + hr * 0.1, hr * 0.22, hr * 0.34, 0, 0, Math.PI * 2); g.fill();
    } else if (L.acc === 3) { // flower clip
      g.fillStyle = '#fff';
      for (let k = 0; k < 5; k++) { const a = k * Math.PI * 0.4; g.beginPath(); g.arc(hx + hr * 0.75 + Math.cos(a) * hr * 0.13, hy - hr * 0.55 + Math.sin(a) * hr * 0.13, hr * 0.1, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#f4c84a'; g.beginPath(); g.arc(hx + hr * 0.75, hy - hr * 0.55, hr * 0.07, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    if (dim) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = 'rgba(245,235,215,0.62)'; g.fill(); }
    g.restore();
  }
  const avCache = new Map();
  function avatarCanvas(id, ring, size, dim) {
    const key = `${id}|${ring}|${size}|${dim ? 1 : 0}`;
    let c = avCache.get(key);
    if (!c) {
      c = document.createElement('canvas'); c.width = c.height = size;
      paintAvatar(c.getContext('2d'), size / 2, size / 2, size / 2 - 1, id, ring, dim);
      avCache.set(key, c);
    }
    return c;
  }
  const urlCache = new Map();
  function avatarURL(id, ring) {
    const k = id + '|' + ring;
    if (!urlCache.has(k)) urlCache.set(k, avatarCanvas(id, ring, 96).toDataURL());
    return urlCache.get(k);
  }

  // =====================================================================
  // Renderer
  // =====================================================================
  const cvs = $('#game'), ctx = cvs.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
  }
  addEventListener('resize', resize);
  resize();

  const View = {
    rot: 0, tgt: 0, cx: 0, cy: 0, sc: 1, tilt: 0.78, sx: 0, sy: 0, shake: 0,
    fit() {
      // small screens: less room reserved for avatars and the HUD, so the arena gets bigger
      const small = W < 600 || H < 500;
      const ext = Core.R + Core.WALL_T + (small ? 60 : 74);
      const sw = (W * 0.98) / (ext * 2);
      const sh = (H - (H < 500 ? 64 : 110)) / (ext * 2 * this.tilt + 30);
      this.sc = Math.max(0.2, Math.min(sw, sh));
      this.cx = W / 2; this.cy = H / 2 + (H < 500 ? 14 : 22);
    },
    w2s(x, y) {
      const c = Math.cos(this.rot), s = Math.sin(this.rot);
      return [this.cx + (x * c - y * s) * this.sc + this.sx, this.cy + (x * s + y * c) * this.sc * this.tilt + this.sy];
    },
    s2w(px, py) {
      const rx = (px - this.cx - this.sx) / this.sc, ry = (py - this.cy - this.sy) / (this.sc * this.tilt);
      const c = Math.cos(-this.rot), s = Math.sin(-this.rot);
      return [rx * c - ry * s, rx * s + ry * c];
    },
    vy(x, y) { return x * Math.sin(this.rot) + y * Math.cos(this.rot); },
    update(s, you, dt, snap) {
      const me = s.players[you];
      const e = me && me.alive ? s.sides[me.side] : null;
      if (e) this.tgt = Math.PI / 2 - Math.atan2(e.my, e.mx);
      else if (you < 0) this.tgt += dt * 0.06;
      let d = this.tgt - this.rot;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.rot += snap ? d : d * Math.min(1, dt * 5);
      this.shake = Math.max(0, this.shake - dt * 30);
      this.sx = (Math.random() - 0.5) * this.shake; this.sy = (Math.random() - 0.5) * this.shake;
    },
  };

  function poly(pts, fill) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  }
  function ellipse(x, y, rx, ry, fill) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

  // extruded bar (paddles, spinner, gates, hazard bars)
  function paintBar(g, A, B, w, h, color) {
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(90,60,30,0.16)'; g.lineWidth = w;
    g.beginPath(); g.moveTo(A[0], A[1] + w * 0.25); g.lineTo(B[0], B[1] + w * 0.25); g.stroke();
    g.strokeStyle = shade(color, -0.22);
    for (let k = 0; k <= h; k += 1.5) { g.beginPath(); g.moveTo(A[0], A[1] - k); g.lineTo(B[0], B[1] - k); g.stroke(); }
    g.strokeStyle = shade(color, 0.12);
    g.beginPath(); g.moveTo(A[0], A[1] - h); g.lineTo(B[0], B[1] - h); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = Math.max(1, w * 0.22);
    g.beginPath(); g.moveTo(A[0], A[1] - h - w * 0.18); g.lineTo(B[0], B[1] - h - w * 0.18); g.stroke();
  }
  function drawBar(ax, ay, bx, by, th, height, color) {
    paintBar(ctx, View.w2s(ax, ay), View.w2s(bx, by), th * View.sc, height * View.sc * 0.9, color);
  }

  // =====================================================================
  // Cosmetics (shop items). Paddle skins keep the player's colour so everyone can
  // still tell whose paddle is whose; the skin adds a pattern or finish on top.
  // =====================================================================
  const SHOP = {
    paddle: [
      { name: 'Classic', price: 0 }, { name: 'Candy', price: 120 }, { name: 'Polka', price: 120 }, { name: 'Zigzag', price: 180 },
      { name: 'Neon', price: 250 }, { name: 'Starry', price: 320 }, { name: 'Rainbow', price: 450 }, { name: 'Golden', price: 700 },
    ],
    ball: [
      { name: 'Classic', price: 0 }, { name: 'Tennis', price: 100 }, { name: 'Beach', price: 150 }, { name: 'Bubblegum', price: 150 },
      { name: 'Frost', price: 220 }, { name: 'Lava', price: 300 }, { name: 'Galaxy', price: 400 }, { name: 'Gold', price: 700 },
    ],
    trail: [
      { name: 'Classic', price: 0 }, { name: 'Sparkle', price: 120 }, { name: 'Hearts', price: 150 }, { name: 'Bubbles', price: 150 },
      { name: 'Confetti', price: 220 }, { name: 'Fire', price: 300 }, { name: 'Rainbow', price: 450 }, { name: 'Comet', price: 600 },
    ],
  };
  const randomCos = () => {
    const r = n => (Math.random() < 0.5 ? 0 : (Math.random() * n) | 0);
    return { p: r(SHOP.paddle.length), b: r(SHOP.ball.length), t: r(SHOP.trail.length) };
  };
  const RAINBOW = ['#ef6b7b', '#f29a4a', '#f4c84a', '#8bcb5c', '#4bb3e6', '#9b7be0'];
  const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  function starPath(g, x, y, r) {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, rr = i % 2 ? r * 0.32 : r;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
  }
  function heartPathG(g, x, y, s) {
    g.beginPath(); g.moveTo(x, y + s * 0.45);
    g.bezierCurveTo(x - s * 0.75, y, x - s * 0.4, y - s * 0.6, x, y - s * 0.2);
    g.bezierCurveTo(x + s * 0.4, y - s * 0.6, x + s * 0.75, y, x, y + s * 0.45);
  }

  function paintPaddle(g, A, B, w, h, color, skin, t) {
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, px = -uy, py = ux;
    const top = f => [A[0] + dx * f, A[1] - h + dy * f];
    if (skin === 4) { g.save(); g.shadowColor = color; g.shadowBlur = w * 1.3; }
    paintBar(g, A, B, w, h, skin === 5 ? shadeHex(color, -0.42) : color);
    if (skin === 4) g.restore();
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    switch (skin) {
      case 1: // candy stripes
        g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = w * 0.24;
        for (let d = w * 0.5; d < len - w * 0.2; d += w * 0.85) {
          const [x, y] = top(d / len), qx = (ux + px) * 0.7, qy = (uy + py) * 0.7;
          g.beginPath(); g.moveTo(x - qx * w * 0.3, y - qy * w * 0.3); g.lineTo(x + qx * w * 0.3, y + qy * w * 0.3); g.stroke();
        }
        break;
      case 2: // polka dots
        g.fillStyle = 'rgba(255,255,255,0.9)';
        for (let d = w * 0.45, i = 0; d < len - w * 0.1; d += w * 0.8, i++) {
          const [x, y] = top(d / len);
          g.beginPath(); g.arc(x + px * w * (i % 2 ? 0.14 : -0.14), y + py * w * (i % 2 ? 0.14 : -0.14), w * 0.15, 0, Math.PI * 2); g.fill();
        }
        break;
      case 3: { // zigzag
        g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = Math.max(1, w * 0.14);
        g.beginPath();
        for (let d = 0, i = 0; d <= len; d += w * 0.45, i++) {
          const [x, y] = top(d / len), o = (i % 2 ? 0.2 : -0.2) * w;
          g.lineTo(x + px * o, y + py * o);
        }
        g.stroke();
        break;
      }
      case 4: // neon core
        g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = Math.max(1, w * 0.26);
        g.beginPath(); g.moveTo(...top(0)); g.lineTo(...top(1)); g.stroke();
        break;
      case 5: // starry night
        g.fillStyle = '#fff6c8';
        for (let i = 0; i < Math.max(3, len / (w * 0.9)); i++) {
          const f = hash(i + 1), tw = 0.55 + 0.45 * Math.sin(t * 4 + i * 1.7);
          const [x, y] = top(0.05 + f * 0.9);
          starPath(g, x + px * w * (hash(i + 9) - 0.5) * 0.5, y + py * w * (hash(i + 9) - 0.5) * 0.5, w * 0.3 * tw); g.fill();
        }
        break;
      case 6: { // rainbow top
        const gr = g.createLinearGradient(A[0], A[1], B[0], B[1]);
        RAINBOW.forEach((c, i) => gr.addColorStop(i / (RAINBOW.length - 1), c));
        g.strokeStyle = gr; g.lineWidth = w * 0.62;
        g.beginPath(); g.moveTo(...top(0)); g.lineTo(...top(1)); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = Math.max(1, w * 0.16);
        g.beginPath(); g.moveTo(...top(0.02)); g.lineTo(...top(0.98)); g.stroke();
        break;
      }
      case 7: // golden trim + caps
        g.strokeStyle = '#f2c14e'; g.lineWidth = Math.max(1, w * 0.2);
        g.beginPath(); g.moveTo(...top(0)); g.lineTo(...top(1)); g.stroke();
        for (const f of [0, 1]) {
          const [x, y] = top(f);
          g.beginPath(); g.arc(x, y, w * 0.56, 0, Math.PI * 2); g.fillStyle = '#f2c14e'; g.fill();
          g.lineWidth = Math.max(1, w * 0.12); g.strokeStyle = '#b8871f'; g.stroke();
          g.beginPath(); g.arc(x - w * 0.15, y - w * 0.15, w * 0.16, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fill();
        }
        break;
    }
    g.restore();
  }

  const BALL_BASE = [['#ffffff', '#e3e9ef'], ['#eef98a', '#b8d13a'], ['#ffffff', '#ececec'], ['#ffd0e3', '#f08ab6'],
    ['#f1fbff', '#98cff0'], ['#ffd36b', '#d9432c'], ['#7c69d8', '#231a4c'], ['#fff4b8', '#d49a17']];
  function paintBall(g, x, y, r, skin, outline, t) {
    const [c0, c1] = BALL_BASE[skin] || BALL_BASE[0];
    const grd = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    grd.addColorStop(0, c0); grd.addColorStop(1, c1);
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = grd; g.fill();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
    g.lineCap = 'round';
    switch (skin) {
      case 1: // tennis seams
        g.strokeStyle = '#fff'; g.lineWidth = r * 0.16;
        g.beginPath(); g.arc(x - r * 1.15, y, r * 0.85, -0.95, 0.95); g.stroke();
        g.beginPath(); g.arc(x + r * 1.15, y, r * 0.85, Math.PI - 0.95, Math.PI + 0.95); g.stroke();
        break;
      case 2: // beach ball wedges
        for (let i = 0; i < 6; i++) {
          g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, t * 1.5 + i * Math.PI / 3, t * 1.5 + (i + 1) * Math.PI / 3); g.closePath();
          g.fillStyle = ['#ef6b7b', '#ffffff', '#5b8def', '#ffffff', '#f4c84a', '#ffffff'][i]; g.fill();
        }
        g.beginPath(); g.arc(x, y, r * 0.22, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
        break;
      case 4: // frost flake
        g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = r * 0.13;
        for (let k = 0; k < 3; k++) {
          const a = t * 0.8 + k * Math.PI / 3;
          g.beginPath(); g.moveTo(x - Math.cos(a) * r * 0.62, y - Math.sin(a) * r * 0.62); g.lineTo(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62); g.stroke();
        }
        break;
      case 5: // lava cracks
        g.strokeStyle = '#7a1d12'; g.lineWidth = r * 0.12;
        g.beginPath(); g.moveTo(x - r * 0.7, y - r * 0.2); g.lineTo(x - r * 0.2, y + r * 0.05); g.lineTo(x + r * 0.1, y - r * 0.35); g.lineTo(x + r * 0.7, y - r * 0.1); g.stroke();
        g.beginPath(); g.moveTo(x - r * 0.1, y + r * 0.7); g.lineTo(x, y + r * 0.3); g.lineTo(x + r * 0.45, y + r * 0.45); g.stroke();
        break;
      case 6: // galaxy specks
        g.fillStyle = '#fff';
        for (let i = 0; i < 7; i++) {
          const a = hash(i) * Math.PI * 2 + t * 0.6, d = hash(i + 20) * r * 0.8;
          g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.05 + hash(i + 40) * 0.07), 0, Math.PI * 2); g.fill();
        }
        break;
    }
    g.restore();
    g.beginPath(); g.arc(x - r * 0.35, y - r * 0.4, r * 0.28, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.lineWidth = Math.max(1.5, r * 0.22); g.strokeStyle = outline || 'rgba(120,100,80,0.35)'; g.stroke();
  }

  // pts: screen points, oldest first. col: colour of the last player to hit the ball.
  function paintTrail(g, pts, r, skin, col, t) {
    const n = pts.length;
    if (!n) return;
    g.save();
    for (let i = 0; i < n; i++) {
      const [x, y] = pts[i], f = (i + 1) / n, a = 0.1 + 0.55 * f;
      switch (skin) {
        case 1: starPath(g, x, y, r * (0.35 + 0.55 * f)); g.globalAlpha = a; g.fillStyle = i % 2 ? '#fff6c8' : col; g.fill(); break;
        case 2: if (i % 2) break; heartPathG(g, x, y, r * (0.5 + 0.7 * f)); g.globalAlpha = a; g.fillStyle = '#ef6b7b'; g.fill(); break;
        case 3: g.beginPath(); g.arc(x + Math.sin(t * 6 + i) * r * 0.3, y, r * (0.9 - 0.5 * f), 0, Math.PI * 2); g.globalAlpha = a; g.lineWidth = Math.max(1, r * 0.14); g.strokeStyle = '#8fd0ff'; g.stroke(); break;
        case 4: {
          g.save(); g.translate(x + (hash(i) - 0.5) * r, y + (hash(i + 5) - 0.5) * r); g.rotate(i * 1.7 + t * 4);
          g.globalAlpha = a; g.fillStyle = RAINBOW[i % RAINBOW.length]; g.fillRect(-r * 0.3, -r * 0.14, r * 0.6, r * 0.28); g.restore();
          break;
        }
        case 5: {
          const rr = r * (0.4 + 0.75 * f), gr = g.createRadialGradient(x, y, 0, x, y, rr);
          gr.addColorStop(0, '#fff3a0'); gr.addColorStop(0.5, '#f7a13a'); gr.addColorStop(1, 'rgba(226,72,40,0)');
          g.globalAlpha = 0.2 + 0.7 * f; g.fillStyle = gr; g.beginPath(); g.arc(x, y - (1 - f) * r * 0.6, rr, 0, Math.PI * 2); g.fill();
          break;
        }
        case 6: if (i === 0) break; g.globalAlpha = 0.25 + 0.6 * f; g.strokeStyle = RAINBOW[i % RAINBOW.length]; g.lineWidth = r * (0.4 + 1.1 * f); g.lineCap = 'round';
          g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(x, y); g.stroke(); break;
        case 7: if (i === 0) break; g.globalAlpha = 0.15 + 0.7 * f; g.lineCap = 'round';
          g.strokeStyle = col; g.lineWidth = r * 1.7 * f; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(x, y); g.stroke();
          g.strokeStyle = '#fff'; g.lineWidth = r * 0.7 * f; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(x, y); g.stroke(); break;
        default: g.beginPath(); g.arc(x, y, r * (0.35 + 0.6 * f), 0, Math.PI * 2); g.globalAlpha = 1; g.fillStyle = rgba(col, 0.08 + 0.3 * f); g.fill();
      }
    }
    g.restore();
  }

  function drawCylinder(x, y, r, height, color) {
    const [sx, sy] = View.w2s(x, y), sc = View.sc, rr = r * sc, h = height * sc * 0.9, ry = rr * View.tilt;
    ellipse(sx, sy + 3 * sc, rr * 1.05, ry * 1.05, 'rgba(90,60,30,0.16)');
    ctx.fillStyle = shade(color, -0.2);
    ctx.beginPath(); ctx.ellipse(sx, sy, rr, ry, 0, 0, Math.PI); ctx.lineTo(sx - rr, sy - h); ctx.ellipse(sx, sy - h, rr, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
    ellipse(sx, sy - h, rr, ry, shade(color, 0.15));
    ellipse(sx - rr * 0.25, sy - h - ry * 0.2, rr * 0.35, ry * 0.3, 'rgba(255,255,255,0.35)');
  }

  function drawIcon(type, x, y, s) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const tri = (x1, y1, x2, y2, x3, y3) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill(); };
    const ln = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    switch (type) {
      case 'grow': ln(0, -s * 0.4, 0, s * 0.4); tri(-s * 0.3, -s * 0.28, s * 0.3, -s * 0.28, 0, -s * 0.62); tri(-s * 0.3, s * 0.28, s * 0.3, s * 0.28, 0, s * 0.62); break;
      case 'shrink': tri(-s * 0.62, -s * 0.3, -s * 0.62, s * 0.3, -s * 0.12, 0); tri(s * 0.62, -s * 0.3, s * 0.62, s * 0.3, s * 0.12, 0); break;
      case 'multi': for (const [dx, dy] of [[0, -0.3], [-0.3, 0.22], [0.3, 0.22]]) { ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.2, 0, Math.PI * 2); ctx.fill(); } break;
      case 'speed': ln(-s * 0.45, -s * 0.35, -s * 0.1, 0); ln(-s * 0.1, 0, -s * 0.45, s * 0.35); ln(s * 0.05, -s * 0.35, s * 0.4, 0); ln(s * 0.4, 0, s * 0.05, s * 0.35); break;
      case 'shield': ctx.beginPath(); ctx.moveTo(0, -s * 0.5); ctx.lineTo(s * 0.42, -s * 0.32); ctx.quadraticCurveTo(s * 0.4, s * 0.3, 0, s * 0.55); ctx.quadraticCurveTo(-s * 0.4, s * 0.3, -s * 0.42, -s * 0.32); ctx.closePath(); ctx.fill(); break;
      case 'heart': ctx.beginPath(); ctx.moveTo(0, s * 0.5); ctx.bezierCurveTo(-s * 0.7, 0, -s * 0.4, -s * 0.6, 0, -s * 0.2); ctx.bezierCurveTo(s * 0.4, -s * 0.6, s * 0.7, 0, 0, s * 0.5); ctx.fill(); break;
      case 'slow': ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2); ctx.stroke(); ln(0, 0, 0, -s * 0.28); ln(0, 0, s * 0.2, s * 0.1); break;
      case 'reverse': ln(-s * 0.45, -s * 0.18, s * 0.3, -s * 0.18); tri(s * 0.25, -s * 0.38, s * 0.25, s * 0.02, s * 0.55, -s * 0.18); ln(s * 0.45, s * 0.2, -s * 0.3, s * 0.2); tri(-s * 0.25, 0, -s * 0.25, s * 0.4, -s * 0.55, s * 0.2); break;
    }
    ctx.restore();
  }

  function heartPath(x, y, s) {
    ctx.beginPath(); ctx.moveTo(x, y + s * 0.45);
    ctx.bezierCurveTo(x - s * 0.75, y, x - s * 0.4, y - s * 0.6, x, y - s * 0.2);
    ctx.bezierCurveTo(x + s * 0.4, y - s * 0.6, x + s * 0.75, y, x, y + s * 0.45);
  }

  // ---------- FX ----------
  const FX = { parts: [], floats: [], trails: new Map(), flash: {} };
  function burst(x, y, color, n, speed = 160) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = rand(0.3, 1) * speed;
      FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.35, 0.7), max: 0.7, color, r: rand(2, 4.5) });
    }
  }
  function floatText(x, y, text, color) { FX.floats.push({ x, y, text, color, life: 1.2 }); }
  function resetFX() { FX.parts = []; FX.floats = []; FX.trails.clear(); FX.flash = {}; }

  function drawMatch(s, you, dt, snapView) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    View.fit();
    View.update(s, you, dt, snapView);
    const B = s.boundary;
    if (!B.length) return;
    const n = B.length, sc = View.sc;
    const arena = Core.ARENAS[s.arena] || Core.ARENAS[0];

    // mitred outer wall points
    const outer = [];
    for (let i = 0; i < n; i++) {
      const e1 = B[(i - 1 + n) % n], e2 = B[i];
      let mx = -(e1.nx + e2.nx), my = -(e1.ny + e2.ny);
      const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
      const k = Core.WALL_T / Math.max(0.3, -(mx * e2.nx + my * e2.ny));
      outer.push({ x: e2.a.x + mx * k, y: e2.a.y + my * k });
    }
    View.minX = Math.min(...outer.map(p => View.w2s(p.x, p.y)[0]));
    // drop shadow + floor
    poly(outer.map(p => { const q = View.w2s(p.x, p.y); return [q[0], q[1] + 12 * sc]; }), 'rgba(140,100,60,0.16)');
    const floor = B.map(e => View.w2s(e.a.x, e.a.y));
    poly(floor, arena.floor);
    ctx.save(); poly(floor); ctx.clip();
    // grid (screen-aligned, like a board seen from the front)
    const g = 38 * sc;
    ctx.strokeStyle = arena.grid; ctx.lineWidth = Math.max(1, 1.3 * sc);
    const ox = View.cx + View.sx, oy = View.cy + View.sy, ext = (Core.R + 30) * sc;
    ctx.beginPath();
    for (let x = ox - Math.ceil(ext / g) * g; x <= ox + ext; x += g) { ctx.moveTo(x, oy - ext); ctx.lineTo(x, oy + ext); }
    for (let y = oy - Math.ceil(ext / (g * View.tilt)) * g * View.tilt; y <= oy + ext; y += g * View.tilt) { ctx.moveTo(ox - ext, y); ctx.lineTo(ox + ext, y); }
    ctx.stroke();
    // inner edge shade
    ctx.strokeStyle = 'rgba(40,80,60,0.10)'; ctx.lineWidth = 14 * sc; poly(floor); ctx.stroke();
    // shields glow on the floor
    for (const p of s.players) {
      if (!p.alive || p.eff.shield <= 0) continue;
      const e = s.sides[p.side]; if (!e) continue;
      const A = View.w2s(e.a.x + e.nx * 5, e.a.y + e.ny * 5), Bq = View.w2s(e.b.x + e.nx * 5, e.b.y + e.ny * 5);
      ctx.strokeStyle = rgba('#8fd0ff', 0.55 + 0.25 * Math.sin(s.time * 10)); ctx.lineWidth = 7 * sc; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(Bq[0], Bq[1]); ctx.stroke();
    }
    // gravity wells (arena vortex + ghost hazards)
    for (const w of s.obs ? s.obs.wells : []) {
      const [wx, wy] = View.w2s(w.x, w.y);
      const col = w.kind === 'vortex' ? '#3a8f88' : '#6d4fb0';
      for (let k = 0; k < 3; k++) {
        const rr = w.r * sc * (0.35 + k * 0.28);
        ctx.strokeStyle = rgba(col, 0.28 - k * 0.07); ctx.lineWidth = 3 * sc;
        ctx.beginPath(); ctx.ellipse(wx, wy, rr, rr * View.tilt, 0, s.time * (2 + k) % (Math.PI * 2), s.time * (2 + k) % (Math.PI * 2) + Math.PI * 1.3); ctx.stroke();
      }
    }
    ctx.restore();

    // walls
    const walls = B.map((e, i) => ({ e, oa: outer[i], ob: outer[(i + 1) % n], color: e.owner >= 0 && s.players[e.owner] ? s.players[e.owner].color : '#e8d9bd', depth: View.vy(e.mx, e.my) }));
    walls.sort((a, b) => a.depth - b.depth);
    const Hs = 17 * sc * 0.9;
    const drawWall = w => {
      const A = View.w2s(w.e.a.x, w.e.a.y), Bp = View.w2s(w.e.b.x, w.e.b.y), OA = View.w2s(w.oa.x, w.oa.y), OB = View.w2s(w.ob.x, w.ob.y);
      const up = p => [p[0], p[1] - Hs];
      if (View.vy(w.e.nx, w.e.ny) > 0) poly([A, Bp, up(Bp), up(A)], shade(w.color, -0.12));
      else poly([OA, OB, up(OB), up(OA)], shade(w.color, -0.22));
      poly([up(A), up(Bp), up(OB), up(OA)], shade(w.color, 0.22));
    };
    walls.filter(w => w.depth <= 0).forEach(drawWall);

    // obstacles
    const o = s.obs || { circles: [], segs: [], wells: [] };
    const items = [];
    for (const c of o.circles) items.push({ y: View.vy(c.x, c.y), draw: () => {
      if (c.kind === 'pillar') drawCylinder(c.x, c.y, c.r, 26, '#f4e7cf');
      else if (c.kind === 'bumper') { drawCylinder(c.x, c.y, c.r, 12, '#ef8fa0'); drawCylinder(c.x, c.y, c.r * 0.55, 16, '#fff3d6'); }
      else if (c.kind === 'core') drawCylinder(c.x, c.y, c.r, 18, '#3a8f88');
    } });
    for (const g2 of o.segs) items.push({ y: View.vy((g2.ax + g2.bx) / 2, (g2.ay + g2.by) / 2), draw: () => {
      if (g2.kind === 'spinner') { drawBar(g2.ax, g2.ay, g2.bx, g2.by, g2.r * 2, 12, '#77709a'); drawCylinder(0, 0, 11, 16, '#f4e7cf'); }
      else if (g2.kind === 'gate') drawBar(g2.ax, g2.ay, g2.bx, g2.by, g2.r * 2, 14, '#d4a86a');
      else drawBar(g2.ax, g2.ay, g2.bx, g2.by, g2.r * 2, 12, '#6a6480');
    } });
    // power-ups
    for (const u of s.powerups) items.push({ y: View.vy(u.x, u.y), draw: () => {
      const P = Core.POWERUPS[u.type]; if (!P) return;
      if (u.t < 3 && Math.sin(s.time * 20) > 0.3) return;
      const [px, py] = View.w2s(u.x, u.y), rr = 15 * sc, bob = (12 + Math.sin(s.time * 3 + u.id) * 3) * sc;
      ellipse(px, py, rr * 0.9, rr * 0.9 * View.tilt * 0.6, 'rgba(90,60,30,0.2)');
      if (Tut.target === u.id) { // tutorial: pulse around the power-up to hit
        const k = (s.time * 1.2) % 1;
        ctx.strokeStyle = `rgba(124,197,90,${1 - k})`; ctx.lineWidth = 4 * sc;
        ctx.beginPath(); ctx.ellipse(px, py - bob, rr * (1.4 + k * 1.6), rr * (1.4 + k * 1.6), 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(px, py - bob, rr + 3 * sc, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py - bob, rr, 0, Math.PI * 2); ctx.fillStyle = P.color; ctx.fill();
      drawIcon(u.type, px, py - bob, rr * 1.05);
    } });
    // paddles
    for (const p of s.players) {
      if (!p.alive) continue;
      const g3 = Core.paddleSeg(s, p); if (!g3) continue;
      items.push({ y: View.vy(g3.cx, g3.cy), draw: () => {
        if (p.eff.grow > 0 || p.eff.speed > 0 || p.eff.rev > 0) {
          const A = View.w2s(g3.ax, g3.ay), Bq = View.w2s(g3.bx, g3.by);
          ctx.strokeStyle = rgba(p.eff.rev > 0 ? '#d46bc9' : p.eff.grow > 0 ? '#7cc55a' : '#3dbfb0', 0.45);
          ctx.lineWidth = (Core.PADDLE_TH + 12) * sc; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(A[0], A[1] - 4 * sc); ctx.lineTo(Bq[0], Bq[1] - 4 * sc); ctx.stroke();
        }
        paintPaddle(ctx, View.w2s(g3.ax, g3.ay), View.w2s(g3.bx, g3.by), Core.PADDLE_TH * sc, 9 * sc * 0.9,
          p.eff.shrink > 0 ? shadeHex(p.color, -0.15) : p.color, (p.cos && p.cos.p) | 0, s.time);
        if (p.id === you) {
          const [cx, cy] = View.w2s(g3.cx, g3.cy);
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy - 11 * sc, 2.4 * sc, 0, Math.PI * 2); ctx.fill();
        }
      } });
    }
    // balls
    for (const b of s.balls) {
      const x = b.x + (b.ox || 0), y = b.y + (b.oy || 0);
      items.push({ y: View.vy(x, y), draw: () => {
        const [bx, by] = View.w2s(x, y), r = Core.BALL_R * sc;
        const tr = FX.trails.get(b.id) || [];
        const hitter = b.last >= 0 && s.players[b.last];
        const col = hitter ? hitter.color : '#ffffff';
        const cos = (hitter && hitter.cos) || {};
        paintTrail(ctx, tr.map(t => { const q = View.w2s(t[0], t[1]); return [q[0], q[1] - r * 0.9]; }), r, cos.t | 0, col === '#ffffff' ? '#ffffff' : col, s.time);
        ellipse(bx, by + r * 0.2, r * 1.05, r * 0.5, 'rgba(60,40,20,0.22)');
        paintBall(ctx, bx, by - r * 0.9, r, cos.b | 0, hitter ? col : null, s.time);
      } });
    }
    items.sort((a, b) => a.y - b.y).forEach(it => it.draw());

    // particles
    for (const q of FX.parts) {
      const [px, py] = View.w2s(q.x, q.y);
      ctx.globalAlpha = clamp(q.life / q.max, 0, 1);
      ctx.beginPath(); ctx.arc(px, py - 8 * sc, q.r * sc * 1.4, 0, Math.PI * 2); ctx.fillStyle = q.color; ctx.fill();
    }
    ctx.globalAlpha = 1;

    walls.filter(w => w.depth > 0).forEach(drawWall);

    // avatars + hearts next to each side
    const ar = clamp(26 * sc, 15, 30);
    for (const p of s.players) {
      if (!p.alive) continue;
      const e = s.sides[p.side]; if (!e) continue;
      const off = Core.WALL_T + 46;
      const [ax, ay0] = View.w2s(e.mx - e.nx * off, e.my - e.ny * off);
      const fl = FX.flash[p.id] || 0;
      const ay = ay0 - Hs * 0.5 + (fl > 0 ? Math.sin(fl * 40) * 3 : 0);
      ctx.drawImage(avatarCanvas(p.avatar, p.color, 128), ax - ar, ay - ar, ar * 2, ar * 2);
      if (fl > 0) { ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI * 2); ctx.fillStyle = `rgba(239,107,123,${fl * 0.8})`; ctx.fill(); }
      const hs = clamp(ar * 0.34, 6, 10), cnt = Math.max(Core.START_HEARTS, p.hearts);
      const pw = cnt * hs * 1.35 + hs * 0.9, ph = hs * 1.7, py = ay + ar + 3;
      rrect(ax - pw / 2, py, pw, ph, ph / 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#ead9bb'; ctx.stroke();
      for (let i = 0; i < cnt; i++) {
        heartPath(ax - pw / 2 + hs * 0.95 + i * hs * 1.35, py + ph / 2, hs);
        if (i < p.hearts) { ctx.fillStyle = '#ef5a6b'; ctx.fill(); } else { ctx.strokeStyle = '#e2b6bb'; ctx.lineWidth = 1.3; ctx.stroke(); }
      }
      ctx.font = `700 ${clamp(ar * 0.44, 10, 13)}px Fredoka, sans-serif`; ctx.textAlign = 'center';
      const label = p.id === you ? 'YOU' : p.name;
      ctx.fillStyle = p.id === you ? '#4b3a2c' : '#8b7663';
      ctx.fillText(label.length > 10 ? label.slice(0, 9) + '…' : label, ax, ay - ar - 5);
    }
    // quick-chat bubbles above avatars
    for (const [pid, bub] of (s === Match.state ? Chat.bubbles : [])) {
      const p = s.players[pid], e = p && p.alive && s.sides[p.side];
      if (!e) continue;
      const off = Core.WALL_T + 46;
      const [ax, ay0] = View.w2s(e.mx - e.nx * off, e.my - e.ny * off);
      const fs = clamp(ar * 0.52, 11, 15);
      ctx.font = `700 ${fs}px Fredoka, sans-serif`;
      const tw = ctx.measureText(bub.text).width + fs * 1.2, th = fs * 1.9;
      const ay = ay0 - Hs * 0.5;
      // lower half: bubble beside the avatar so it never covers a paddle; otherwise above it
      const side = ay > View.cy + 40 * sc;
      const bx = side ? (ax + ar + 10 + tw < W - 6 ? ax + ar + 10 : ax - ar - 10 - tw) : clamp(ax - tw / 2, 6, W - tw - 6);
      const by = side ? ay - th / 2 : ay - ar - th - 20;
      ctx.globalAlpha = clamp(bub.t * 3, 0, 1);
      rrect(bx, by, tw, th, th / 2); ctx.fillStyle = p.id === you ? '#4b3a2c' : '#fff'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = p.color; ctx.stroke();
      ctx.beginPath();
      if (!side) { ctx.moveTo(ax - 5, by + th - 1); ctx.lineTo(ax + 5, by + th - 1); ctx.lineTo(ax, by + th + 7); }
      else if (bx > ax) { ctx.moveTo(bx + 1, ay - 5); ctx.lineTo(bx + 1, ay + 5); ctx.lineTo(bx - 7, ay); }
      else { ctx.moveTo(bx + tw - 1, ay - 5); ctx.lineTo(bx + tw - 1, ay + 5); ctx.lineTo(bx + tw + 7, ay); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = p.id === you ? '#fff' : '#4b3a2c'; ctx.textAlign = 'center';
      ctx.fillText(bub.text, bx + tw / 2, by + th * 0.68);
      ctx.globalAlpha = 1;
    }
    // eliminated players row (bottom-right)
    const dead = s.players.filter(p => !p.alive);
    const dr = clamp(14 * (W / 700), 11, 16);
    dead.forEach((p, i) => {
      const x = W - 16 - dr - i * (dr * 2 + 4), y = H - 18 - dr;
      ctx.drawImage(avatarCanvas(p.avatar, p.color, 64, true), x - dr, y - dr, dr * 2, dr * 2);
    });
    // floating texts
    ctx.textAlign = 'center';
    for (const f of FX.floats) {
      const [fx, fy] = View.w2s(f.x, f.y);
      ctx.globalAlpha = clamp(f.life, 0, 1);
      ctx.font = `700 ${Math.round(18 * clamp(sc * 1.4, 0.7, 1.3))}px Fredoka, sans-serif`;
      ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(f.text, fx, fy - 30 - (1.2 - f.life) * 40);
      ctx.fillStyle = f.color; ctx.fillText(f.text, fx, fy - 30 - (1.2 - f.life) * 40);
    }
    ctx.globalAlpha = 1;
    // arming cursor for hazards
    if (Input.arm && Input.px != null) {
      ctx.strokeStyle = '#6d4fb0'; ctx.setLineDash([6, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(Input.px, Input.py, 34 * sc, 34 * sc * View.tilt, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  function updateFX(s, dt) {
    for (const q of FX.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.94; q.vy *= 0.94; q.life -= dt; }
    FX.parts = FX.parts.filter(q => q.life > 0);
    for (const f of FX.floats) f.life -= dt;
    FX.floats = FX.floats.filter(f => f.life > 0);
    for (const k in FX.flash) FX.flash[k] = Math.max(0, FX.flash[k] - dt * 1.6);
    const ids = new Set();
    for (const b of s.balls) {
      ids.add(b.id);
      let tr = FX.trails.get(b.id);
      if (!tr) { tr = []; FX.trails.set(b.id, tr); }
      tr.push([b.x + (b.ox || 0), b.y + (b.oy || 0)]);
      if (tr.length > 9) tr.shift();
      b.ox = (b.ox || 0) * Math.exp(-dt * 12); b.oy = (b.oy || 0) * Math.exp(-dt * 12);
    }
    for (const k of FX.trails.keys()) if (!ids.has(k)) FX.trails.delete(k);
  }

  // =====================================================================
  // Input
  // =====================================================================
  const Input = { keys: {}, mode: 'pointer', px: null, py: null, down: false, arm: null, moved: false };
  const KEYMAP = { arrowleft: -1, a: -1, arrowright: 1, d: 1 };
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 's'].includes(k) && !(e.target instanceof HTMLInputElement)) e.preventDefault();
    if (k in KEYMAP) { Input.keys[k] = true; Input.mode = 'keys'; Input.moved = true; }
    if (k === 'escape' || k === 'p') { if (Match.active) togglePause(); }
    Sound.unlock();
  });
  addEventListener('keyup', e => { Input.keys[e.key.toLowerCase()] = false; });
  addEventListener('blur', () => { Input.keys = {}; });
  const keyAxis = () => { let a = 0; for (const k in KEYMAP) if (Input.keys[k]) a += KEYMAP[k]; return clamp(a, -1, 1); };

  cvs.addEventListener('pointermove', e => {
    Input.px = e.clientX; Input.py = e.clientY;
    if (e.pointerType === 'mouse' || Input.down) { Input.mode = 'pointer'; Input.moved = true; }
  });
  cvs.addEventListener('pointerdown', e => {
    Sound.unlock();
    Input.down = true; Input.px = e.clientX; Input.py = e.clientY; Input.mode = 'pointer'; Input.moved = true;
    try { cvs.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    if (Input.arm && Match.active) dropHazard(e.clientX, e.clientY);
  });
  const up = () => { Input.down = false; };
  cvs.addEventListener('pointerup', up); cvs.addEventListener('pointercancel', up);
  addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('pointerdown', () => Sound.unlock(), { once: false, passive: true });

  function localInput(s, you) {
    const p = s.players[you];
    if (!p || !p.alive || Input.arm) return null;
    const e = s.sides[p.side];
    if (!e) return null;
    if (Input.mode === 'keys') {
      const A = View.w2s(e.a.x, e.a.y), B = View.w2s(e.b.x, e.b.y);
      const dx = B[0] - A[0], dy = B[1] - A[1];
      const sign = Math.abs(dx) >= Math.abs(dy) * 0.4 ? Math.sign(dx) || 1 : Math.sign(dy) || 1;
      return { a: keyAxis() * sign };
    }
    if (Input.px == null) return null;
    const [wx, wy] = View.s2w(Input.px, Input.py);
    const along = (wx - e.a.x) * e.ux + (wy - e.a.y) * e.uy;
    const { margin, range } = Core.paddleRange(p, e);
    return { t: Math.round(clamp((along - margin) / range, 0, 1) * 1000) / 1000 };
  }

  // =====================================================================
  // Quick chat: preset phrases only. No free text means no user-generated content
  // to moderate; it still turns off when CrazyGames' disableChat setting is on.
  // =====================================================================
  const CHAT = ['Hi!', 'Good luck!', 'Nice shot!', 'Wow!', 'Oops!', 'So close!', 'Watch out!', 'Thanks!', 'Sorry!', 'Good game!', 'Rematch?', 'Ha ha!'];
  const LOBBY_CHAT = [0, 1, 10, 9, 11, 7];
  const Chat = {
    bubbles: new Map(), pending: [], last: 0, lobbyTimers: {},
    enabled() { return Profile.chat && !CG.chatDisabled; },
    reset() { this.bubbles.clear(); this.pending = []; },
    show(pid, k) {
      if (!this.enabled() || !CHAT[k]) return;
      this.bubbles.set(pid, { text: CHAT[k], t: 3 });
      Sound.play('click');
    },
    tick(dt) { for (const [k, b] of this.bubbles) { b.t -= dt; if (b.t <= 0) this.bubbles.delete(k); } },
    say(k) {
      const now = performance.now();
      if (!this.enabled() || now - this.last < 1200) return;
      this.last = now;
      if (Match.active && !Match.online) { this.show(Match.you, k); this.reply(k); }
      else Net.send({ t: 'chat', k });
    },
    // offline matches: bots answer now and then, so practice doesn't feel empty
    reply(k) {
      const answers = { 0: [0, 1], 1: [1, 0], 2: [7], 3: [11, 3], 4: [11, 5], 5: [4, 11], 6: [11], 8: [11], 9: [9], 10: [9, 11], 11: [11] };
      const opts = answers[k] || [];
      const bots = Match.state ? Match.state.players.filter(p => p.bot && p.alive) : [];
      if (!opts.length || !bots.length || Math.random() < 0.3) return;
      this.pending.push({ t: rand(0.7, 1.6), pid: pick(bots).id, k: pick(opts) });
    },
    botReact(kind, ev) {
      const s = Match.state;
      if (Match.online || !s || Tut.active && Tut.step < 3) return;
      if (kind === 'goal' && Math.random() < 0.16) {
        const v = s.players[ev.v], by = s.players[ev.by];
        if (v && v.bot && v.alive) this.pending.push({ t: rand(0.3, 0.9), pid: v.id, k: pick([4, 5, 3]) });
        else if (by && by.bot && by.alive) this.pending.push({ t: rand(0.3, 0.9), pid: by.id, k: 11 });
      }
      if (kind === 'over') s.players.filter(p => p.bot && p.alive).forEach(p => this.pending.push({ t: 0.2, pid: p.id, k: 9 }));
    },
    botTick(dt) {
      this.pending = this.pending.filter(q => { q.t -= dt; if (q.t <= 0) { this.show(q.pid, q.k); return false; } return true; });
    },
    // lobby: bubble over the member's slot
    lobbyShow(member, k) {
      if (!this.enabled() || !CHAT[k]) return;
      const slot = $$('#slots .slot')[member];
      if (!slot) return;
      let b = slot.querySelector('.bubble');
      if (!b) { b = document.createElement('div'); b.className = 'bubble'; slot.appendChild(b); }
      b.textContent = CHAT[k];
      Sound.play('click');
      clearTimeout(this.lobbyTimers[member]);
      this.lobbyTimers[member] = setTimeout(() => b.remove(), 3000);
    },
  };
  function buildChatPanel() {
    const kb = !matchMedia('(pointer: coarse)').matches;
    $('#chatPanel').innerHTML = CHAT.map((t, i) => `<button data-k="${i}">${kb && i < 9 ? `<kbd>${i + 1}</kbd>` : ''}${esc(t)}</button>`).join('');
    $('#lobbyChat').innerHTML = LOBBY_CHAT.map(i => `<button class="chip" data-k="${i}">${esc(CHAT[i])}</button>`).join('');
  }
  function closeChat() { show($('#chatPanel'), false); }
  $('#chatPanel').addEventListener('click', e => {
    const b = e.target.closest('button[data-k]'); if (!b) return;
    e.stopPropagation(); Chat.say(+b.dataset.k); closeChat();
  });
  $('#lobbyChat').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) Chat.say(+b.dataset.k); });
  $('#btnChat').addEventListener('click', e => { e.stopPropagation(); Sound.play('click'); show($('#chatPanel'), $('#chatPanel').classList.contains('hidden')); });

  // =====================================================================
  // Coach card (tutorial steps and one-off tips)
  // =====================================================================
  let coachT = null;
  function coach(title, sub, o = {}) {
    const c = $('#coach');
    $('#coachTitle').textContent = title; $('#coachSub').textContent = sub;
    $('#coachSteps').innerHTML = o.steps ? Array.from({ length: o.steps[1] }, (_, i) => `<i class="${i <= o.steps[0] ? 'on' : ''}"></i>`).join('') : '';
    show($('#coachDemo'), !!o.demo);
    show($('#coachSkip'), !!o.skip);
    placeCoach();
    show(c, true); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
    clearTimeout(coachT);
    if (o.hideAfter) coachT = setTimeout(() => show(c, false), o.hideAfter);
  }
  // dock the card beside the arena when there's room, otherwise above it
  function placeCoach() {
    const free = (View.minX != null ? View.minX : View.cx - Core.R * View.sc) - 95 * View.sc;
    $('#coach').classList.toggle('side', free >= 300);
  }
  addEventListener('resize', () => { if (!$('#coach').classList.contains('hidden')) placeCoach(); });
  function hideCoach() { clearTimeout(coachT); show($('#coach'), false); }
  function ghostTip() {
    if (Profile.ghostTip) return;
    Profile.ghostTip = true; Profile.save();
    setTimeout(() => { if (Match.active) coach('You\'re a ghost now', 'Tap WELL or BAR, then tap inside the arena to drop it on the players still in.', { hideAfter: 6500 }); }, 1400);
  }

  // =====================================================================
  // Tutorial: the first match a new player sees. It is a real match against gentle
  // bots with three guided steps, and nobody loses hearts until the steps are done.
  // =====================================================================
  const Tut = {
    active: false, step: -1, moveAcc: 0, hits: 0, target: null, wait: 0, stepT: 0,
    start() {
      startOffline({ kind: 'tutorial', mode: 'ffa', size: 4, arena: 0, botSkill: [0.28, 0.42] });
      this.active = true;
      this.go(0);
    },
    stop() { this.active = false; this.step = -1; this.target = null; hideCoach(); },
    frozen() { return this.active && this.step === 0; },
    protecting() { return this.active && this.step >= 1 && this.step <= 2; },
    go(n) {
      this.step = n; this.stepT = 0; this.hits = 0; this.moveAcc = 0; this.wait = 0;
      const touch = matchMedia('(pointer: coarse)').matches;
      const s = Match.state;
      if (n === 0) {
        coach('Move your paddle', touch ? 'Drag left and right anywhere on the screen.' : 'Move your mouse, or use A / D or the arrow keys.', { steps: [0, 3], demo: true, skip: true });
      } else if (n === 1) {
        s.phase = 'countdown'; s.timer = 2.2;
        coach('Block the ball', 'Don\'t let it past your wall. Hit it back twice.', { steps: [1, 3], skip: true });
      } else if (n === 2) {
        coach('Grab a power-up', 'Hit the ball through the glowing bubble. The last paddle to touch the ball claims it.', { steps: [2, 3], skip: true });
        this.spawnTarget(s);
      } else if (n === 3) {
        this.target = null;
        this.finish();
        coach('Last paddle standing', 'Lose all 4 hearts and you\'re out. Knock everyone else out to win!', { hideAfter: 5000 });
      }
    },
    finish() { Profile.tut = true; Profile.save(); },
    skip() {
      Sound.play('click');
      const s = Match.state;
      if (this.step === 0 && s) { s.phase = 'countdown'; s.timer = 2.2; }
      this.step = 4; this.target = null; this.finish(); hideCoach();
    },
    onMove(d, dt) {
      if (!this.active || this.step !== 0) return;
      this.moveAcc += d;
      if (this.moveAcc > 0.9 && !this.wait) { this.wait = 0.5; banner('NICE!', '#7cc55a'); Sound.play('pu'); }
    },
    spawnTarget(s) {
      const me = s.players[Match.you], e = me && s.sides[me.side];
      if (!e) return;
      const u = { id: s.uid++, x: e.mx * 0.42, y: e.my * 0.42, type: 'grow', t: 60 };
      s.powerups = s.powerups.filter(q => Math.hypot(q.x - u.x, q.y - u.y) > 80);
      s.powerups.push(u);
      this.target = u.id;
    },
    aimAt(s, b, x, y) {
      const d = Math.hypot(x - b.x, y - b.y) || 1, sp = Math.max(b.spd, 300);
      b.vx = (x - b.x) / d * sp; b.vy = (y - b.y) / d * sp;
    },
    // runs on the frame's events before the normal handlers see them
    beforeEvents(s, evs) {
      if (!this.active) return;
      const me = s.players[Match.you], e = me && s.sides[me.side];
      for (const ev of evs) {
        if (ev.e === 'goal' && this.protecting()) {
          const v = s.players[ev.v];
          if (v && v.alive) v.hearts = Math.min(Core.START_HEARTS, v.hearts + 1); // no lost hearts during the lesson
          if (ev.v === Match.you) { const aw = avatarWorld(s, ev.v); if (aw) floatText(aw[0], aw[1] - 26, 'Try again!', '#8b7663'); }
        }
        if (ev.e === 'serve' && this.protecting() && e) {
          // serve toward the new player so they get to practise
          for (const b of s.balls) if (b.last === -1) this.aimAt(s, b, e.mx + (Math.random() - 0.5) * e.len * 0.4, e.my);
        }
        if (ev.e === 'hit' && ev.p === Match.you) {
          if (this.step === 1) {
            this.hits++;
            if (this.hits >= 2 && !this.wait) { this.wait = 0.6; banner('GREAT!', '#7cc55a'); }
          } else if (this.step === 2) {
            // gentle assist: send the ball toward the power-up
            const u = s.powerups.find(q => q.id === this.target);
            if (u) for (const b of s.balls) if (b.last === Match.you && Math.hypot(b.x - e.mx, b.y - e.my) < 90) this.aimAt(s, b, u.x, u.y);
          }
        }
        if (ev.e === 'pu' && this.step === 2) {
          if (ev.p === Match.you) { this.target = null; if (!this.wait) this.wait = 1.1; }
        }
      }
    },
    tick(s, dt) {
      if (!this.active || this.step < 0 || this.step > 3) return;
      this.stepT += dt;
      if (this.wait) {
        this.wait -= dt;
        if (this.wait <= 0) { this.wait = 0; this.go(this.step + 1); }
        return;
      }
      if (this.step === 1 && this.stepT > 35) this.go(2);          // never get stuck on a step
      if (this.step === 2) {
        if (this.target != null && !s.powerups.some(q => q.id === this.target)) this.spawnTarget(s);
        if (this.stepT > 30) this.go(3);
      }
    },
  };
  $('#coachSkip').addEventListener('click', e => { e.stopPropagation(); Tut.skip(); });

  // =====================================================================
  // Coins
  // =====================================================================
  function updateCoinPills() {
    $$('.coinTxt').forEach(el => { el.textContent = Profile.coins.toLocaleString(); });
    const affordable = ['paddle', 'ball', 'trail'].some(c => SHOP[c].some((it, i) => !Profile.owns(c, i) && it.price <= Profile.coins))
      || (Profile.coins >= AVATAR_PRICE && Profile.owned.avatar.length < AVATARS);
    show($('#shopDot'), affordable);
  }
  function matchReward(s, won) {
    const me = s.players[Match.you], st = Match.stats, kind = Match.cfg && Match.cfg.kind;
    let place;
    if (s.mode === 'teams') place = won ? 40 : 10;
    else place = won ? 50 : Math.round(8 + 30 * (1 - ((me ? me.place : s.total) - 1) / Math.max(1, s.total - 1)));
    const hits = Math.min(25, st.hits), goals = st.goals * 5, pu = st.pu * 3;
    let total = place + hits + goals + pu;
    if (kind === 'practice') total = Math.round(total * 0.5);
    const why = [`placing ${place}`, hits && `hits ${hits}`, goals && `scores ${goals}`, pu && `power-ups ${pu}`].filter(Boolean).join(', ')
      + (kind === 'practice' ? ', halved in practice' : '');
    return { total, why };
  }

  // =====================================================================
  // Shop
  // =====================================================================
  const SHOP_NOTES = {
    paddle: 'Skins keep your colour, so everyone can still tell which paddle is yours.',
    ball: 'Everyone sees your ball skin on any ball you hit last.',
    trail: 'Your trail follows every ball you hit last.',
    avatar: 'Your avatar shows beside your wall and in lobbies.',
  };
  const Shop = {
    tab: 'paddle', back: 'menu',
    open(tab) {
      if (tab) this.tab = tab;
      if (currentScreen !== 'shop') this.back = currentScreen || 'menu';
      showScreen('shop');
      this.render();
    },
    price(cat, id) { return cat === 'avatar' ? (id < FREE_AVATARS ? 0 : AVATAR_PRICE) : SHOP[cat][id].price; },
    equipped(cat, id) { return cat === 'avatar' ? Profile.avatar === id : Profile.eq[cat[0]] === id; },
    render() {
      $$('#shopTabs button').forEach(b => b.classList.toggle('on', b.dataset.v === this.tab));
      $('#shopNote').textContent = SHOP_NOTES[this.tab];
      const cat = this.tab, n = cat === 'avatar' ? AVATARS : SHOP[cat].length;
      const html = [];
      for (let i = 0; i < n; i++) {
        const name = cat === 'avatar' ? `Avatar ${i + 1}` : SHOP[cat][i].name;
        const owned = Profile.owns(cat, i), eq = this.equipped(cat, i), price = this.price(cat, i);
        const btn = eq ? '<button class="on" disabled>Equipped</button>'
          : owned ? `<button class="equip" data-a="equip" data-i="${i}">Equip</button>`
            : `<button class="buy${price > Profile.coins ? ' poor' : ''}" data-a="buy" data-i="${i}"><span class="coin"></span>${price}</button>`;
        html.push(`<div class="item${eq ? ' eq' : ''}"><canvas width="160" height="120" data-i="${i}"></canvas><div class="nm">${esc(name)}</div>${btn}</div>`);
      }
      $('#shopGrid').innerHTML = html.join('');
      $$('#shopGrid canvas').forEach(c => this.preview(c, cat, +c.dataset.i));
      updateCoinPills();
      const cd = Math.ceil((Profile.freeAt - Date.now()) / 1000);
      const fb = $('#btnFreeCoins');
      show(fb, CG.ready);
      fb.disabled = cd > 0;
      $('#freeSub').textContent = cd > 0 ? `ready in ${Math.floor(cd / 60)}:${String(cd % 60).padStart(2, '0')}` : 'watch an ad for 40';
    },
    preview(c, cat, id) {
      const g = c.getContext('2d');
      g.clearRect(0, 0, 160, 120);
      const col = '#5b8def';
      if (cat === 'paddle') paintPaddle(g, [28, 80], [132, 80], 20, 16, col, id, 1.3);
      else if (cat === 'ball') { g.beginPath(); g.ellipse(80, 96, 22, 7, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(60,40,20,0.15)'; g.fill(); paintBall(g, 80, 58, 26, id, col, 0.6); }
      else if (cat === 'trail') {
        const pts = [];
        for (let k = 0; k < 9; k++) { const f = k / 8; pts.push([18 + f * 100, 88 - Math.sin(f * 2.2) * 44]); }
        paintTrail(g, pts, 12, id, col, 0.8);
        paintBall(g, 124, 88 - Math.sin(2.2) * 44, 13, 0, col, 0);
      } else paintAvatar(g, 80, 60, 50, id, Profile.owns('avatar', id) ? null : '#e2d3b7', !Profile.owns('avatar', id));
    },
    act(action, i) {
      const cat = this.tab;
      if (action === 'buy') {
        const price = this.price(cat, i);
        if (price > Profile.coins) { toast(`You need ${price - Profile.coins} more coins. Play matches to earn them.`); Sound.play('click'); return; }
        Profile.coins -= price;
        Profile.owned[cat].push(i);
        Sound.play('pu');
      } else Sound.play('click');
      if (cat === 'avatar') Profile.avatar = i; else Profile.eq[cat[0]] = i;
      Profile.save();
      if (Net.open || P2P.active) Net.send({ t: 'hello', name: Profile.name, avatar: Profile.avatar, cos: Profile.eq });
      this.render();
    },
  };
  $('#shopTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; Shop.tab = b.dataset.v; Sound.play('click'); Shop.render(); });
  $('#shopGrid').addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (b) Shop.act(b.dataset.a, +b.dataset.i); });
  $('#btnShopBack').onclick = () => { Sound.play('click'); showScreen(Shop.back === 'shop' ? 'menu' : Shop.back); };
  $('#btnFreeCoins').onclick = () => {
    if (Date.now() < Profile.freeAt) return;
    CG.rewarded(() => {
      Profile.freeAt = Date.now() + 3 * 60 * 1000;
      Profile.addCoins(40); Sound.play('win'); toast('+40 coins');
      if (currentScreen === 'shop') Shop.render();
    }, () => toast('The ad could not play. Try again in a moment.'));
  };
  setInterval(() => { if (currentScreen === 'shop' && Profile.freeAt > Date.now() - 2000) Shop.render(); }, 1000);

  // =====================================================================
  // Settings
  // =====================================================================
  function settingsModal() {
    const sdkMute = Sound.sdkMute, noChat = CG.chatDisabled;
    openModal(`
      <h3>Settings</h3>
      <div class="set-row"><div>Sound${sdkMute ? '<small>Muted in your CrazyGames settings</small>' : ''}</div><button class="toggle${Sound.userMute ? '' : ' on'}" id="sSound" aria-label="Sound"${sdkMute ? ' disabled' : ''}></button></div>
      <div class="set-row"><div>Quick chat<small>${noChat ? 'Turned off in your CrazyGames settings' : 'Preset messages from you and other players'}</small></div><button class="toggle${Profile.chat && !noChat ? ' on' : ''}" id="sChat" aria-label="Quick chat"${noChat ? ' disabled' : ''}></button></div>
      <div class="set-row"><div>Replay the tutorial<small>A short guided match against easy bots</small></div><button class="chip" id="sTut">Play</button></div>
      <button class="btn green" id="sClose">DONE</button>`);
    $('#sSound').onclick = () => { toggleSound(); $('#sSound').classList.toggle('on', !Sound.userMute); };
    $('#sChat').onclick = () => { Profile.chat = !Profile.chat; Profile.save(); $('#sChat').classList.toggle('on', Profile.chat); Sound.play('click'); };
    $('#sTut').onclick = () => { closeModal(); Tut.start(); };
    $('#sClose').onclick = closeModal;
  }

  // =====================================================================
  // Loading screen
  // =====================================================================
  const LOAD_TIPS = [
    'Hit the ball near the edge of your paddle to angle it.',
    'Knock the ball through a power-up to claim it.',
    'Knocked out? Drop wells and bars on the players still in.',
    'The arena shrinks every time a player is knocked out.',
    'Earn coins every match and spend them in the shop.',
  ];
  const Loader = {
    tipI: (Math.random() * LOAD_TIPS.length) | 0, timer: null,
    start() {
      $('#loadTip').textContent = LOAD_TIPS[this.tipI];
      this.timer = setInterval(() => { this.tipI = (this.tipI + 1) % LOAD_TIPS.length; $('#loadTip').textContent = LOAD_TIPS[this.tipI]; }, 2600);
    },
    set(p, label) {
      p = Math.round(clamp(p, 0, 100));
      $('#loadFill').style.width = p + '%';
      $('#loadPct').textContent = p + '%';
      $('.load-track').setAttribute('aria-valuenow', p);
      if (label) $('#loadLabel').textContent = label;
    },
    done() { clearInterval(this.timer); $('#loader').classList.add('gone'); setTimeout(() => $('#loader').remove(), 400); },
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));

  // =====================================================================
  // Match control
  // =====================================================================
  const Match = {
    active: false, online: false, demo: null, state: null, you: -1, cfg: null, paused: false,
    sendT: 0, lastIn: '', inAge: 0, revived: false, overHandled: false, lastCount: 0, snapView: false, room: null,
    stats: { hits: 0, goals: 0, pu: 0 },
  };

  function newDemo() {
    const players = [];
    for (let i = 0; i < 6; i++) players.push({ name: BOT_NAMES[i * 3 % BOT_NAMES.length], avatar: (i * 5 + 2) % AVATARS, bot: true, skill: rand(0.6, 0.9) });
    Match.demo = Core.createMatch({ mode: 'ffa', arena: (Math.random() * Core.ARENAS.length) | 0, players });
    Match.demo.phase = 'play'; Match.demo.timer = 0;
  }

  function botRoster(cap, taken) {
    const used = new Set(taken);
    const pool = BOT_NAMES.filter(n => !used.has(n)).sort(() => Math.random() - 0.5);
    const out = [];
    for (let i = 0; i < cap; i++) out.push({ name: pool[i % pool.length], avatar: (Math.random() * AVATARS) | 0, bot: true, skill: rand(0.5, 0.85), cos: randomCos() });
    return out;
  }

  function startOffline(cfg) {
    const cap = cfg.mode === 'teams' ? cfg.size * 2 : cfg.size;
    const me = { name: Profile.name, avatar: Profile.avatar, bot: false, cos: Profile.eq };
    const list = [me].concat(botRoster(cap - 1, [Profile.name]));
    if (cfg.botSkill) list.forEach(q => { if (q.bot) q.skill = rand(cfg.botSkill[0], cfg.botSkill[1]); });
    list.sort(() => Math.random() - 0.5);
    const arena = cfg.arena >= 0 ? cfg.arena : (Math.random() * Core.ARENAS.length) | 0;
    const st = Core.createMatch({ mode: cfg.mode, arena, players: list });
    beginMatch({ online: false, state: st, you: list.indexOf(me), cfg });
  }

  function beginMatch(o) {
    Object.assign(Match, { active: true, online: o.online, state: o.state, you: o.you, cfg: o.cfg, paused: false, sendT: 0, lastIn: '', revived: false, overHandled: false, lastCount: 0, snapView: true, room: o.room || null, stats: { hits: 0, goals: 0, pu: 0 } });
    Chat.reset();
    resetFX();
    Input.arm = null; Input.moved = false;
    showScreen(null);
    show($('#hud'), true);
    $('#controlsHint').textContent = matchMedia('(pointer: coarse)').matches ? 'Drag anywhere to move your paddle' : 'Move: mouse, A / D or ← →';
    $('#controlsHint').style.opacity = '1';
    show($('#ghostBar'), false); show($('#banner'), false); show($('#claim'), false); show($('#armHint'), false);
    closeChat();
    show($('#btnChat'), Chat.enabled());
    show($('#coach'), false);
    updateHud(true);
    if (o.online && o.cfg && o.cfg.kind === 'private' && o.room) CG.roomBusy(o.room); else CG.leftRoom();
    CG.context({ mode: o.state.mode, players: o.state.total, arena: (Core.ARENAS[o.state.arena] || {}).name, online: !!o.online, coins: Profile.coins });
    CG.gameplayStart();
  }

  function endMatchView() {
    Match.active = false; Match.state = null; Match.paused = false;
    show($('#hud'), false);
    closeModal(); closeChat();
    Tut.stop();
    CG.clearContext();
    CG.gameplayStop();
  }

  function updateMatch(dt) {
    const s = Match.state;
    const inp = localInput(s, Match.you);
    if (Input.moved) $('#controlsHint').style.opacity = '0';
    if (!Match.online) {
      if (inp) Core.setInput(s, Match.you, inp);
      if (Tut.frozen()) {
        // tutorial step 1: only your paddle moves until you've tried it
        const me = s.players[Match.you];
        const before = me.pos;
        Core.movePaddle(s, me, dt);
        Tut.onMove(Math.abs(me.pos - before), dt);
        s.obs = Core.obstacles(s);
      } else {
        Core.step(s, dt);
        Tut.beforeEvents(s, s.events);
        handleEvents(s.events);
        s.events = [];
      }
      Tut.tick(s, dt);
      Chat.botTick(dt);
    } else {
      const me = s.players[Match.you];
      if (inp) {
        Core.setInput(s, Match.you, inp);
        Match.sendT -= dt; Match.inAge += dt;
        const key = JSON.stringify(inp);
        if (Match.sendT <= 0 && (key !== Match.lastIn || Match.inAge > 0.5)) {
          Net.send({ t: 'in', m: inp }); Match.lastIn = key; Match.sendT = 1 / 30; Match.inAge = 0;
        }
      }
      if (me && me.alive) {
        Core.movePaddle(s, me, dt);
        if (me.netPos != null && Math.abs(me.netPos - me.pos) > 0.3) me.pos = me.netPos;
      }
      for (const p of s.players) if (p !== me && p.alive && p.netPos != null) p.pos += (p.netPos - p.pos) * Math.min(1, dt * 16);
      Core.step(s, dt, true);
    }
    updateFX(s, dt);
    Chat.tick(dt);
    updateHud(false);
  }

  function nameOf(id) { const p = Match.state && Match.state.players[id]; return p ? (id === Match.you ? 'YOU' : p.name.toUpperCase()) : ''; }
  function avatarWorld(s, id) {
    const p = s.players[id];
    const e = p && s.sides[p.side];
    if (!e) return null;
    const off = Core.WALL_T + 46;
    return [e.mx - e.nx * off, e.my - e.ny * off];
  }

  function handleEvents(evs) {
    const s = Match.state;
    if (!s) return;
    for (const ev of evs) {
      switch (ev.e) {
        case 'hit': {
          const p = s.players[ev.p]; const g = p && Core.paddleSeg(s, p);
          if (g) burst(g.cx, g.cy, p.color, 6, 110);
          Sound.play('hit', ev.p === Match.you ? 140 : 0);
          if (ev.p === Match.you) Match.stats.hits++;
          break;
        }
        case 'wall': Sound.play('wall'); break;
        case 'bump': Sound.play('bump'); burst(ev.x, ev.y, '#ef8fa0', 5, 90); break;
        case 'shield': Sound.play('shield'); break;
        case 'serve': Sound.play('go'); if (ev.rush) flashClaim('RUSH  ·  EXTRA BALL', '#f29a4a'); break;
        case 'spawn': Sound.play('spawn'); break;
        case 'goal': {
          burst(ev.x, ev.y, '#ffffff', 14, 200);
          FX.flash[ev.v] = 1;
          const aw = avatarWorld(s, ev.v);
          if (aw) floatText(aw[0], aw[1], '-1', '#ef5a6b');
          if (ev.v === Match.you) { View.shake = 12; Sound.play('hurt'); } else Sound.play('goal');
          if (ev.by === Match.you && ev.v !== Match.you) { Match.stats.goals++; if (aw) floatText(aw[0], aw[1] + 30, '+5', '#e5b32f'); }
          Chat.botReact('goal', ev);
          break;
        }
        case 'out':
          Sound.play('out');
          if (ev.v === Match.you) { banner('YOU\'RE OUT', '#efe3cd'); ghostTip(); }
          else flashClaim(`${nameOf(ev.v)} IS OUT`, '#ef6b7b');
          break;
        case 'pu': {
          const P = Core.POWERUPS[ev.k]; if (!P) break;
          Sound.play('pu');
          flashClaim(`${nameOf(ev.p)} CLAIMED  ·  ${P.label}`, P.color);
          if (ev.p === Match.you) { banner(P.label + '.', P.color); Match.stats.pu++; }
          break;
        }
        case 'haz': Sound.play('haz'); burst(ev.x, ev.y, '#9b7be0', 10, 120); break;
        case 'over':
          Chat.botReact('over', ev);
          if (!Match.overHandled) { Match.overHandled = true; setTimeout(() => showResults(), 1300); }
          break;
      }
    }
  }

  // =====================================================================
  // HUD
  // =====================================================================
  let bannerT = null, claimT = null;
  function banner(text, color) {
    const b = $('#banner');
    b.textContent = text; b.style.background = color || '#7cc55a';
    b.style.color = color && ['#efe3cd', '#f4c84a', '#7cc55a'].includes(color) ? '#4a3a22' : (color ? '#fff' : '#4a3a22');
    show(b, true); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    clearTimeout(bannerT); bannerT = setTimeout(() => show(b, false), 1400);
  }
  function flashClaim(text, color) {
    const c = $('#claim');
    c.textContent = text; c.style.borderColor = color || '#f0a3ad';
    show(c, true);
    clearTimeout(claimT); claimT = setTimeout(() => show(c, false), 2200);
  }

  let hudCache = '';
  function updateHud(force) {
    const s = Match.state;
    if (!s) return;
    const alive = s.players.filter(p => p.alive).length;
    let txt;
    if (s.mode === 'teams') {
      const a = s.players.filter(p => p.alive && p.team === 0).length, b = s.players.filter(p => p.alive && p.team === 1).length;
      txt = `ROUND ${s.round}|BLUE ${a}  ·  RED ${b}`;
    } else txt = `ROUND ${s.round}|${alive}/${s.total}`;
    if (force || txt !== hudCache) {
      hudCache = txt;
      const [r, al] = txt.split('|');
      $('#roundTxt').textContent = r; $('#aliveTxt').textContent = al;
    }
    // countdown
    if (s.phase === 'countdown') {
      const c = Math.ceil(s.timer);
      if (c !== Match.lastCount && c > 0 && c <= 3) { Match.lastCount = c; banner(String(c), '#f4c84a'); Sound.play('count'); }
    } else if (Match.lastCount) { Match.lastCount = 0; banner('GO!', '#7cc55a'); }
    // ghost bar
    const me = s.players[Match.you];
    const ghost = me && !me.alive && s.phase !== 'over';
    show($('#ghostBar'), !!ghost);
    if (ghost) {
      $('#cWell').textContent = me.charges.well; $('#cBar').textContent = me.charges.bar;
      $$('.haz[data-k]').forEach(b => { b.disabled = !(me.charges[b.dataset.k] > 0) || me.hazCd > 0; b.classList.toggle('armed', Input.arm === b.dataset.k); });
      const canRevive = !Match.online && !Match.revived && s.players.filter(p => p.alive).length >= 2 && (s.mode !== 'teams' || s.players.some(p => p.alive && p.team === me.team));
      show($('#btnRevive'), canRevive && CG.ready);
      show($('#btnNext'), !Match.online && s.mode !== 'teams');
    } else if (Input.arm) { Input.arm = null; }
    show($('#armHint'), !!Input.arm);
    if (!$('#coach').classList.contains('hidden')) placeCoach();
  }

  function dropHazard(sx, sy) {
    const s = Match.state, kind = Input.arm;
    Input.arm = null;
    if (!s) return;
    const [x, y] = View.s2w(sx, sy);
    if (Match.online) Net.send({ t: 'haz', k: kind, x: Math.round(x), y: Math.round(y) });
    else { Core.placeHazard(s, Match.you, kind, x, y); handleEvents(s.events); s.events = []; }
  }

  $$('.haz[data-k]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    Sound.play('click');
    Input.arm = Input.arm === b.dataset.k ? null : b.dataset.k;
  }));
  // knocked out of a bot match: skip the wait and go straight to results (and the next match)
  $('#btnNext').addEventListener('click', e => {
    e.stopPropagation();
    const s = Match.state, me = s && s.players[Match.you];
    if (Match.online || Match.overHandled || !me || me.alive) return;
    Sound.play('click');
    showResults();
  });
  $('#btnRevive').addEventListener('click', () => {
    if (Match.online || Match.revived) return;
    Match.paused = true;
    CG.rewarded(() => {
      const s = Match.state, me = s && s.players[Match.you];
      Match.paused = false;
      if (!s || !me || s.phase === 'over') return;
      Match.revived = true;
      me.alive = true; me.hearts = 2; me.place = 0;
      s.balls = []; Core.rebuild(s);
      s.phase = 'point'; s.timer = 1.6;
      banner('REVIVED!', '#7cc55a');
    }, () => { Match.paused = false; toast('The ad could not play. Try again in a moment.'); });
  });

  // =====================================================================
  // Networking
  // =====================================================================
  const Net = {
    ws: null, open: false,
    connect() {
      return new Promise((resolve, reject) => {
        if (this.ws && this.open) return resolve();
        if (!CONF.SERVER_URL || CONF.SERVER_URL.includes('YOUR-SERVER')) return reject(new Error('no server configured'));
        let ws;
        try { ws = new WebSocket(CONF.SERVER_URL); } catch (e) { return reject(e); }
        const to = setTimeout(() => { try { ws.close(); } catch { /* ignore */ } reject(new Error('timeout')); }, 6000);
        ws.onopen = () => {
          clearTimeout(to); this.ws = ws; this.open = true;
          this.send({ t: 'hello', name: Profile.name, avatar: Profile.avatar, cos: Profile.eq });
          resolve();
        };
        ws.onerror = () => {};
        ws.onclose = () => {
          clearTimeout(to);
          const was = this.open;
          this.open = false; this.ws = null;
          if (!was) reject(new Error('closed')); else onDisconnect();
        };
        ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch { return; } onNet(m); };
      });
    },
    send(o) {
      if (P2P.active) { P2P.sendUp(o); return; }
      if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(o));
    },
  };

  // =====================================================================
  // Peer-to-peer rooms (used when no game server is configured)
  // The player who creates a room runs the match in their own browser, the same way
  // server/server.js does, and friends connect straight to them over WebRTC.
  // PeerJS's free public broker only introduces the browsers; gameplay never goes through it.
  // =====================================================================
  const P2P_PREFIX = 'paddleroyale-v1-';
  const HOST_TICK = 1000 / 60, HOST_SNAP_EVERY = 3;
  const P2P = {
    peer: null, conn: null, room: null, self: null, clock: null, closing: false,
    loadLib() {
      if (window.Peer) return Promise.resolve(true);
      return new Promise(res => {
        const el = document.createElement('script');
        el.src = 'lib/peerjs.min.js';
        el.onload = () => res(!!window.Peer); el.onerror = () => res(false);
        document.head.appendChild(el);
      });
    },
    makeCode() {
      const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let c = ''; for (let i = 0; i < 5; i++) c += A[(Math.random() * A.length) | 0];
      return c;
    },
    // opens a Peer with the given id (or a random one when id is null)
    openPeer(id) {
      return new Promise((resolve, reject) => {
        const peer = id ? new window.Peer(id, { debug: 0 }) : new window.Peer({ debug: 0 });
        const to = setTimeout(() => { peer.destroy(); reject(new Error('timeout')); }, 10000);
        peer.on('open', () => { clearTimeout(to); resolve(peer); });
        peer.on('error', e => { if (!peer.open) { clearTimeout(to); peer.destroy(); reject(e); } });
      });
    },
    // a steady 60 Hz clock from a worker, so the match keeps running while the host's tab is in the background
    startClock(fn) {
      this.stopClock();
      try {
        const url = URL.createObjectURL(new Blob([`setInterval(() => postMessage(0), ${HOST_TICK});`], { type: 'text/javascript' }));
        const w = new Worker(url);
        w.onmessage = fn;
        this.clock = { stop: () => { w.terminate(); URL.revokeObjectURL(url); } };
      } catch {
        const t = setInterval(fn, HOST_TICK);
        this.clock = { stop: () => clearInterval(t) };
      }
    },
    stopClock() { if (this.clock) { this.clock.stop(); this.clock = null; } },

    // ---------- hosting ----------
    async host(opt) {
      if (!(await this.loadLib())) throw new Error('lib');
      let peer = null, code = '';
      for (let i = 0; i < 4 && !peer; i++) {
        code = this.makeCode();
        try { peer = await this.openPeer(P2P_PREFIX + code); } catch (e) { if (!e || e.type !== 'unavailable-id') throw e; }
      }
      if (!peer) throw new Error('no code');
      this.peer = peer; this.closing = false;
      const mode = opt.mode === 'teams' ? 'teams' : 'ffa';
      const size = mode === 'teams' ? Math.min(4, Math.max(1, (opt.size | 0) || 4)) : Math.min(8, Math.max(2, (opt.size | 0) || 8));
      const arena = Number.isInteger(opt.arena) && opt.arena >= 0 && opt.arena < Core.ARENAS.length ? opt.arena : -1;
      this.room = { code, mode, size, cap: mode === 'teams' ? size * 2 : size, arena, members: [], host: null, phase: 'lobby', state: null, last: 0, frame: 0, overAt: 0, sec: 0 };
      this.self = { conn: null, name: Profile.name, avatar: Profile.avatar, cos: Core.cleanCos(Profile.eq), seat: -1, msgs: 0, chatAt: 0, joined: false };
      peer.on('connection', conn => this.accept(conn));
      peer.on('disconnected', () => { if (!this.closing && this.peer === peer) try { peer.reconnect(); } catch { /* ignore */ } });
      this.join(this.self);
    },
    accept(conn) {
      if (!this.room) { conn.close(); return; }
      const c = { conn, name: 'Player', avatar: 0, cos: null, seat: -1, msgs: 0, chatAt: 0, joined: false };
      conn.on('data', data => {
        if (typeof data !== 'string' || data.length > 4096) return;
        let m; try { m = JSON.parse(data); } catch { return; }
        if (m && typeof m.t === 'string') this.handle(c, m);
      });
      conn.on('close', () => { if (c.joined) this.leave(c); });
      conn.on('error', () => {});
    },
    // the host's own messages are delivered in-process; everyone else gets JSON over their data channel
    send(c, o, str) {
      if (!c.conn) { queueMicrotask(() => onNet(o)); return; }
      if (c.conn.open) try { c.conn.send(str || JSON.stringify(o)); } catch { /* ignore */ }
    },
    lobbyMsg(c) {
      const r = this.room;
      return {
        t: 'lobby', code: r.code, quick: false, mode: r.mode, size: r.size, cap: r.cap, arena: r.arena, host: r.host === c,
        players: r.members.map(m => ({ name: m.name, avatar: m.avatar, host: r.host === m, you: m === c })), wait: -1,
      };
    },
    broadcastLobby() { for (const m of this.room.members) this.send(m, this.lobbyMsg(m)); },
    join(c) {
      const r = this.room;
      r.members.push(c); c.joined = true; c.seat = -1;
      if (!r.host) r.host = c;
      this.broadcastLobby();
    },
    leave(c) {
      const r = this.room;
      if (!r) return;
      if (c === this.self) { this.close(); return; } // the host leaving ends the room
      r.members = r.members.filter(m => m !== c);
      c.joined = false;
      if (r.phase === 'play' && r.state && c.seat >= 0) { const p = r.state.players[c.seat]; if (p) { p.bot = true; p.skill = 0.7; } }
      c.seat = -1;
      if (c.conn) try { c.conn.close(); } catch { /* ignore */ }
      if (r.phase === 'lobby') this.broadcastLobby();
    },
    handle(c, m) {
      const r = this.room;
      if (!r) return;
      if (c.conn && ++c.msgs > 150) return; // flood guard (reset every second)
      switch (m.t) {
        case 'hello':
          c.name = String(m.name || '').replace(/[^\p{L}\p{N} _\-.]/gu, '').trim().slice(0, 16) || 'Player';
          c.avatar = Math.abs(m.avatar | 0) % AVATARS; c.cos = Core.cleanCos(m.cos);
          if (c.joined && r.phase === 'lobby') this.broadcastLobby();
          break;
        case 'join':
          if (c.joined) break;
          if (String(m.code || '').toUpperCase() !== r.code) { this.send(c, { t: 'err', msg: 'No room with that code. Check the code and try again.' }); break; }
          if (r.phase !== 'lobby') { this.send(c, { t: 'err', msg: 'That room is mid-match. Try again when it ends.' }); break; }
          if (r.members.length >= r.cap) { this.send(c, { t: 'err', msg: 'That room is full.' }); break; }
          this.join(c);
          break;
        case 'arena':
          if (r.host === c && r.phase === 'lobby') { const a = m.arena | 0; r.arena = a >= 0 && a < Core.ARENAS.length ? a : -1; this.broadcastLobby(); }
          break;
        case 'start':
          if (r.host === c) this.startMatch();
          break;
        case 'in':
          if (r.state && c.seat >= 0) Core.setInput(r.state, c.seat, m.m);
          break;
        case 'haz':
          if (r.state && c.seat >= 0) Core.placeHazard(r.state, c.seat, m.k === 'bar' ? 'bar' : 'well', +m.x || 0, +m.y || 0);
          break;
        case 'chat': {
          // preset phrases only, at most one per second
          const k = m.k | 0, now = Date.now();
          if (!c.joined || k < 0 || k >= CHAT.length || now - c.chatAt < 1000) break;
          c.chatAt = now;
          if (r.phase === 'play' && c.seat >= 0) for (const o of r.members) this.send(o, { t: 'chat', seat: c.seat, k });
          else if (r.phase === 'lobby') { const member = r.members.indexOf(c); for (const o of r.members) this.send(o, { t: 'chat', member, k }); }
          break;
        }
        case 'leave':
          this.leave(c);
          break;
      }
    },
    startMatch() {
      const r = this.room;
      if (r.phase !== 'lobby' || !r.members.length) return;
      const seats = r.members.slice(0, r.cap).map(m => ({ name: m.name, avatar: m.avatar, cos: m.cos, bot: false, client: m }));
      const used = new Set(seats.map(s => s.name));
      const pool = BOT_NAMES.filter(n => !used.has(n)).sort(() => Math.random() - 0.5);
      while (seats.length < r.cap) seats.push({ name: pool.pop() || 'Bot', avatar: (Math.random() * AVATARS) | 0, cos: randomCos(), bot: true, skill: rand(0.55, 0.9) });
      if (r.mode !== 'teams') seats.sort(() => Math.random() - 0.5); // team rooms keep lobby order (slot i -> team i%2)
      const arena = r.arena >= 0 ? r.arena : (Math.random() * Core.ARENAS.length) | 0;
      r.state = Core.createMatch({ mode: r.mode, arena, players: seats });
      seats.forEach((st, i) => { if (st.client) st.client.seat = i; });
      r.phase = 'play'; r.overAt = 0; r.frame = 0; r.last = performance.now();
      const info = Core.startInfo(r.state);
      for (const m of r.members) this.send(m, { t: 'start', you: m.seat, info, code: r.code, quick: false });
      this.startClock(() => this.tick());
    },
    tick() {
      const r = this.room, s = r && r.state;
      if (!s) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - r.last) / 1000);
      r.last = now;
      if (now - r.sec > 1000) { r.sec = now; for (const m of r.members) m.msgs = 0; }
      Core.step(s, dt);
      r.frame++;
      if (s.events.length || r.frame % HOST_SNAP_EVERY === 0) {
        const msg = Object.assign({ t: 's' }, Core.snapshot(s));
        const str = JSON.stringify(msg);
        s.events = [];
        for (const m of r.members) this.send(m, msg, str);
      }
      if (s.phase === 'over') {
        if (!r.overAt) r.overAt = now;
        else if (now - r.overAt > 1000) this.endMatch();
      }
    },
    endMatch() {
      const r = this.room;
      this.stopClock();
      r.state = null; r.phase = 'lobby';
      for (const m of r.members) { m.seat = -1; m.msgs = 0; }
      this.broadcastLobby();
    },

    // ---------- joining ----------
    async connect(code) {
      if (!(await this.loadLib())) throw new Error('lib');
      const peer = await this.openPeer(null);
      this.peer = peer; this.closing = false;
      return new Promise((resolve, reject) => {
        let done = false;
        const conn = peer.connect(P2P_PREFIX + code, { reliable: true, serialization: 'raw' });
        const fail = e => { if (done) return; done = true; clearTimeout(to); this.close(); reject(e); };
        const to = setTimeout(() => fail(new Error('timeout')), 15000);
        peer.on('error', e => { if (!this.conn) fail(e); });
        conn.on('open', () => { if (done) return; done = true; clearTimeout(to); this.conn = conn; resolve(); });
        conn.on('data', data => { let m; try { m = JSON.parse(data); } catch { return; } if (m) onNet(m); });
        conn.on('close', () => {
          if (this.conn !== conn) return;
          this.conn = null;
          const unexpected = !this.closing;
          this.close();
          if (unexpected) onDisconnect('The room closed. The host left or lost connection.');
        });
        conn.on('error', () => {});
      });
    },

    get active() { return !!(this.room || this.conn); },
    sendUp(o) {
      if (this.room) this.handle(this.self, o);
      else if (o.t === 'leave') this.close();
      else if (this.conn && this.conn.open) try { this.conn.send(JSON.stringify(o)); } catch { /* ignore */ }
    },
    close() {
      this.closing = true;
      this.stopClock();
      if (this.room) {
        for (const m of this.room.members) if (m.conn) try { m.conn.close(); } catch { /* ignore */ }
        this.room = null; this.self = null;
      }
      if (this.conn) { const c = this.conn; this.conn = null; try { c.close(); } catch { /* ignore */ } }
      if (this.peer) { const p = this.peer; this.peer = null; setTimeout(() => { try { p.destroy(); } catch { /* ignore */ } }, 300); }
    },
  };

  let pendingLobby = null;
  function onNet(m) {
    switch (m.t) {
      case 'lobby':
        // the host reopens the room ~1s after the match ends, before our results screen shows: keep it for BACK TO ROOM
        if (Match.active) { if (Match.online && Match.overHandled) pendingLobby = m; return; }
        if (currentScreen === 'results') { pendingLobby = m; show($('#btnBackRoom'), true); return; }
        renderLobby(m);
        break;
      case 'start': {
        pendingLobby = null;
        const st = Core.createMatch(m.info);
        beginMatch({ online: true, state: st, you: m.you, cfg: Object.assign({}, Match.queueCfg || {}, { code: m.code, quick: m.quick }), room: m.code });
        break;
      }
      case 's':
        if (Match.active && Match.online && Match.state) handleEvents(Core.applySnapshot(Match.state, m));
        break;
      case 'chat':
        if (Match.active && Match.online) { if (m.seat >= 0) Chat.show(m.seat, m.k); }
        else if (currentScreen === 'lobby') Chat.lobbyShow(m.member, m.k);
        break;
      case 'err':
        toast(m.msg);
        if (P2P.conn && !lobbyState) P2P.close();
        if (currentScreen === 'lobby' && !lobbyState) showScreen('menu');
        break;
    }
  }
  function onDisconnect(msg) {
    if (Match.active && Match.online) { endMatchView(); showScreen('menu'); toast(msg || 'Connection lost. You are back at the menu.'); }
    else if (currentScreen === 'lobby') { showScreen('menu'); toast(msg || 'Connection lost. Try again.'); }
    else if (currentScreen === 'results' && Match.cfg && Match.cfg.kind === 'private') { show($('#btnBackRoom'), false); toast(msg || 'Connection lost.'); }
    lobbyState = null; pendingLobby = null; CG.leftRoom();
  }
  async function goOnline(msg) {
    show($('#connecting'), true);
    try { await Net.connect(); } catch { show($('#connecting'), false); return false; }
    show($('#connecting'), false);
    Net.send({ t: 'hello', name: Profile.name, avatar: Profile.avatar, cos: Profile.eq });
    Net.send(msg);
    return true;
  }

  async function queueQuick(mode, size, quiet) {
    // no server configured: Quick Play is against bots, with full rewards (only PRACTICE is halved)
    if (!ONLINE) return startOffline({ kind: 'quick', mode, size: mode === 'teams' ? size : 8, arena: -1 });
    Match.queueCfg = { kind: 'quick', mode, size: mode === 'teams' ? size : 8 };
    lobbyState = null;
    renderLobby({ quick: true, mode, size, cap: mode === 'teams' ? size * 2 : 8, players: [{ name: Profile.name, avatar: Profile.avatar, you: true }], wait: -1, connecting: true });
    const ok = await goOnline({ t: 'quick', mode, size });
    if (!ok) {
      if (!quiet) toast('Server unreachable, so this match is against bots.');
      startOffline({ kind: 'quick', mode, size: mode === 'teams' ? size : 8, arena: -1 });
    }
  }
  async function createRoom(opt) {
    Match.queueCfg = Object.assign({ kind: 'private' }, opt);
    if (!ONLINE) {
      show($('#connecting'), true);
      P2P.close();
      try { await P2P.host(opt); } catch { toast('Could not create a room. Check your connection and try again.'); }
      show($('#connecting'), false);
      return;
    }
    const ok = await goOnline({ t: 'create', mode: opt.mode, size: opt.size, arena: opt.arena });
    if (!ok) toast('Could not reach the game server. Practice mode works offline.');
  }
  async function joinRoom(code) {
    Match.queueCfg = { kind: 'private' };
    if (!ONLINE) {
      show($('#connecting'), true);
      P2P.close();
      try { await P2P.connect(code); } catch (e) {
        show($('#connecting'), false);
        toast(e && e.type === 'peer-unavailable' ? 'No room with that code. Check the code and try again.' : 'Could not reach that room. Check your connection and try again.');
        return;
      }
      show($('#connecting'), false);
      Net.send({ t: 'hello', name: Profile.name, avatar: Profile.avatar, cos: Profile.eq });
      Net.send({ t: 'join', code });
      return;
    }
    const ok = await goOnline({ t: 'join', code });
    if (!ok) toast('Could not reach the game server. Check your connection and try again.');
  }
  function leaveLobby() {
    Net.send({ t: 'leave' });
    lobbyState = null; pendingLobby = null;
    CG.leftRoom();
    showScreen('menu');
  }

  // =====================================================================
  // Screens
  // =====================================================================
  let currentScreen = 'menu';
  function showScreen(name) {
    currentScreen = name;
    for (const id of ['menu', 'lobby', 'results', 'shop']) $('#scr-' + id).classList.toggle('on', id === name);
    updateCoinPills();
    if (name === 'menu') { refreshMenu(); CG.gameplayStop(); }
  }
  let toastT = null;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; show(t, true);
    clearTimeout(toastT); toastT = setTimeout(() => show(t, false), 3200);
  }
  function openModal(html) { $('#modalBody').innerHTML = html; show($('#modal'), true); }
  function closeModal() { show($('#modal'), false); }
  $('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal' && !Match.active) closeModal(); });

  function refreshMenu() {
    const c = $('#myAvatar').getContext('2d');
    c.clearRect(0, 0, 128, 128); paintAvatar(c, 64, 64, 62, Profile.avatar);
    $('#myName').textContent = Profile.name;
    show($('#btnReroll'), !Profile.cgName);
    $('#btnMuteHud').classList.toggle('muted', Sound.userMute);
    $('#stats').textContent = Profile.stats.played ? `${Profile.stats.wins} wins, ${Profile.stats.played} played` : '';
    renderXp('menu');
    $('#menuQuests').innerHTML = Quests.html();
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streakOn = Profile.day === today() || Profile.day === y;
    $('#menuStreak').textContent = Profile.day === today() ? `· day ${Profile.streak} streak`
      : `· finish a match for +${dailyBonus(streakOn ? Profile.streak + 1 : 1)} daily coins`;
    updateCoinPills();
  }
  function renderXp(where) {
    $(`#${where}Lvl`).textContent = `LV ${Profile.lvl}`;
    $(`#${where}XpFill`).style.width = `${Math.round(100 * Profile.xp / xpNeed(Profile.lvl))}%`;
    const t = $(`#${where}XpTxt`);
    if (t) t.textContent = `${Profile.xp} / ${xpNeed(Profile.lvl)} XP`;
  }

  const segVal = id => +($(`#${id} button.on`) || {}).dataset?.v || 4;
  function wireSeg(root) {
    root.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      Sound.play('click');
      seg.dispatchEvent(new CustomEvent('change'));
    }));
  }
  wireSeg(document);

  // options modal used by Create Room and Practice
  function optionsModal(title, cta, onGo) {
    const arenas = ['<button data-v="-1" class="on">Random</button>'].concat(Core.ARENAS.map((a, i) => `<button data-v="${i}">${esc(a.name)}</button>`)).join('');
    openModal(`
      <h3>${esc(title)}</h3>
      <div class="field"><div>Mode</div><div class="seg" id="oMode"><button data-v="ffa" class="on">Free-for-all</button><button data-v="teams">Teams</button></div></div>
      <div class="field" id="oFfa"><div>Players</div><div class="seg" id="oSize">${[2, 3, 4, 5, 6, 7, 8].map(n => `<button data-v="${n}" class="${n === 8 ? 'on' : ''}">${n}</button>`).join('')}</div></div>
      <div class="field hidden" id="oTeams"><div>Team size</div><div class="seg" id="oTSize">${[1, 2, 3, 4].map(n => `<button data-v="${n}" class="${n === 4 ? 'on' : ''}">${n}v${n}</button>`).join('')}</div></div>
      <div class="field"><div>Arena</div><div class="seg" id="oArena">${arenas}</div></div>
      <button class="btn green" id="oGo">${esc(cta)}</button>
      <button class="btn plain" id="oCancel">CANCEL</button>`);
    const body = $('#modalBody');
    wireSeg(body);
    const val = id => body.querySelector(`#${id} button.on`).dataset.v;
    body.querySelector('#oMode').addEventListener('change', () => {
      const t = val('oMode') === 'teams';
      show(body.querySelector('#oFfa'), !t); show(body.querySelector('#oTeams'), t);
    });
    body.querySelector('#oCancel').onclick = closeModal;
    body.querySelector('#oGo').onclick = () => {
      const mode = val('oMode');
      const opt = { mode, size: +(mode === 'teams' ? val('oTSize') : val('oSize')), arena: +val('oArena') };
      closeModal(); onGo(opt);
    };
  }

  function howToModal() {
    openModal(`
      <h3>How to play</h3>
      <p>Every player guards one wall of the arena. Let the ball past your paddle and you lose a heart. Lose all four and you're out, and the arena shrinks to fit the players left.</p>
      <ul>
        <li>Move with the mouse, by dragging, or with A / D or the arrow keys.</li>
        <li>Hit the ball near a paddle's edge to angle it.</li>
        <li>Knock the ball through a power-up to claim it.</li>
        <li>Knocked out? You come back as a ghost and drop wells and bars on the survivors.</li>
        <li>Big lobbies serve two balls, and after two and a half minutes every serve adds a rush ball.</li>
        <li>Every match earns coins. Spend them on paddle skins, balls, trails and avatars in the shop.</li>
        <li>Tap the speech bubble (or press 1 to 9) to send a quick-chat message.</li>
      </ul>
      <p style="margin-top:10px">Power-ups: Grow, Shrink (opponents), Multiball, Speed, Shield, +1 Heart, Slow-mo and Reverse (opponents' controls).</p>
      <button class="btn green" id="hClose">GOT IT</button>`);
    $('#hClose').onclick = closeModal;
  }

  function joinModal() {
    openModal(`
      <h3>Join a room</h3>
      <p style="text-align:center;color:var(--ink-soft)">Enter the 5-letter code from your friend.</p>
      <input class="codeInput" id="jCode" maxlength="5" autocomplete="off" spellcheck="false" inputmode="text">
      <button class="btn purple" id="jGo">JOIN</button>
      <button class="btn plain" id="jCancel">CANCEL</button>`);
    const inp = $('#jCode');
    setTimeout(() => inp.focus(), 50);
    inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
    const go = () => { const c = inp.value.trim(); if (c.length !== 5) { toast('Room codes have 5 letters.'); return; } closeModal(); joinRoom(c); };
    $('#jGo').onclick = go;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    $('#jCancel').onclick = closeModal;
  }

  function togglePause() {
    if (!Match.active) return;
    if (!$('#modal').classList.contains('hidden')) { resumeGame(); return; }
    if (!Match.online) { Match.paused = true; CG.gameplayStop(); }
    openModal(`
      <h3>${Match.online ? 'Leave match?' : 'Paused'}</h3>
      ${Match.online ? `<p style="text-align:center;color:var(--ink-soft)">${P2P.room ? 'You are hosting, so leaving ends the match for everyone.' : 'The match keeps going while this is open. A bot takes your seat if you leave.'}</p>` : ''}
      <button class="btn green" id="pResume">${Match.online ? 'KEEP PLAYING' : 'RESUME'}</button>
      <button class="btn plain" id="pQuit">LEAVE MATCH</button>`);
    $('#pResume').onclick = resumeGame;
    $('#pQuit').onclick = () => {
      if (Match.online) Net.send({ t: 'leave' });
      endMatchView(); showScreen('menu');
    };
  }
  function resumeGame() { closeModal(); if (Match.active) { Match.paused = false; CG.gameplayStart(); } }

  // ---------- lobby ----------
  let lobbyState = null;
  function renderLobby(m) {
    lobbyState = m.connecting ? null : m;
    showScreen('lobby');
    const quick = m.quick;
    $('#lobbyTitle').textContent = quick ? 'Finding players' : 'Private room';
    const modeTxt = m.mode === 'teams' ? `${m.size}v${m.size} teams` : `${m.cap}-player free-for-all`;
    if (m.connecting) $('#lobbySub').textContent = 'Connecting…';
    else if (quick) $('#lobbySub').textContent = `${modeTxt}. ${m.wait >= 0 ? `Starting in ${m.wait}s. Empty seats get bots.` : ''}`;
    else $('#lobbySub').textContent = `${modeTxt}. ${m.host ? 'Start when your friends are in. Empty seats get bots.' : 'Waiting for the host to start.'}`;
    show($('#lobbyCode'), !quick && !!m.code);
    if (m.code) $('#lobbyCode').textContent = m.code;
    const slots = [];
    for (let i = 0; i < m.cap; i++) {
      const p = m.players[i];
      const teamCls = m.mode === 'teams' ? ` team${i % 2}` : '';
      if (p) slots.push(`<div class="slot${teamCls}"><img alt="" src="${avatarURL(p.avatar)}"><div class="nm">${esc(p.you ? 'You' : p.name)}${p.host && !quick ? ' ★' : ''}</div></div>`);
      else slots.push(`<div class="slot empty${teamCls}">Open</div>`);
    }
    $('#slots').innerHTML = slots.join('');
    show($('#btnStart'), !quick && !!m.host);
    show($('#btnInvite'), !quick && !!m.code);
    // arena picker for host
    const ap = $('#arenaPick');
    show(ap, !quick && !!m.host);
    if (!quick && m.host) {
      ap.innerHTML = `<div class="seg" id="lArena">${['<button data-v="-1">Random</button>'].concat(Core.ARENAS.map((a, i) => `<button data-v="${i}">${esc(a.name)}</button>`)).join('')}</div>`;
      ap.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.v === m.arena));
      wireSeg(ap);
      ap.querySelector('.seg').addEventListener('change', () => Net.send({ t: 'arena', arena: +ap.querySelector('button.on').dataset.v }));
    }
    if (!quick && m.code) CG.roomOpen(m.code); else CG.leftRoom();
    show($('#lobbyChat'), !m.connecting && Chat.enabled());
  }
  $('#btnStart').onclick = () => { Sound.play('click'); Net.send({ t: 'start' }); };
  $('#btnInvite').onclick = async () => {
    if (!lobbyState) return;
    const link = CG.inviteLink(lobbyState.code);
    try { await navigator.clipboard.writeText(link); toast('Invite link copied.'); }
    catch { toast(`Share this code: ${lobbyState.code}`); }
  };
  $('#btnLeaveLobby').onclick = leaveLobby;

  // ---------- results ----------
  let lastReward = 0, doubled = false;
  function showResults() {
    const s = Match.state;
    if (!s) return;
    const me = s.players[Match.you];
    const kind = Match.cfg && Match.cfg.kind;
    let won, title, sub;
    if (s.mode === 'teams') {
      won = me && s.winnerTeam === me.team;
      title = won ? 'YOUR TEAM WINS!' : 'DEFEAT';
      sub = `${Core.TEAM_NAMES[s.winnerTeam] || ''} team takes it in round ${s.round}.`;
    } else {
      won = me && me.place === 1;
      title = won ? 'VICTORY!' : `#${me ? me.place : '-'} OF ${s.total}`;
      sub = won ? 'Last paddle standing.'
        : s.phase !== 'over' ? 'Knocked out. The survivors play on without you.'
          : `${(s.players[s.winner] || {}).name || 'Someone'} was the last paddle standing.`;
    }
    Match.overHandled = true;
    // stats
    const st = Profile.stats;
    st.played++; if (won) st.wins++;
    st.hits += Match.stats.hits; st.goals += Match.stats.goals; st.pu += Match.stats.pu;
    if (me && me.place && s.mode !== 'teams') st.best = st.best ? Math.min(st.best, me.place) : me.place;
    // coins
    const r = matchReward(s, won);
    let why = r.why;
    if (kind === 'tutorial') { r.total += 100; why = 'welcome gift 100, ' + why; }
    lastReward = r.total; doubled = false;
    Profile.addCoins(r.total);
    $('#resCoinTxt').textContent = `+${r.total}`;
    $('#resCoinWhy').textContent = why;
    show($('#btnDouble'), CG.ready && r.total > 0);
    const daily = Profile.claimDaily();
    show($('#resDaily'), daily > 0);
    if (daily) $('#resDaily').textContent = `Daily bonus +${daily} coins, day ${Profile.streak} in a row. Come back tomorrow for +${dailyBonus(Profile.streak + 1)}!`;
    // quests and XP
    const top3 = won || (s.mode !== 'teams' && me && me.place && me.place <= 3);
    const qDone = Quests.record({ play: 1, hits: Match.stats.hits, goals: Match.stats.goals, pu: Match.stats.pu, top3: top3 ? 1 : 0, win: won ? 1 : 0 });
    $('#resQuests').innerHTML = Quests.html();
    const lvlBefore = Profile.lvl;
    const lvlBonus = Profile.addXp(r.total);
    renderXp('res');
    const ups = [];
    if (Profile.lvl > lvlBefore) ups.push(`LEVEL ${Profile.lvl}! +${lvlBonus} coins`);
    for (const q of qDone) ups.push(`Quest done! +${QUESTS[q.id].coins} coins`);
    show($('#resLevelUp'), ups.length > 0);
    $('#resLevelUp').textContent = ups.join('  ·  ');
    Profile.save();

    // keep the list short so PLAY AGAIN stays on screen: the top 3, plus you if you placed lower
    const rank = p => p.place || (p.alive ? 1 : 99); // players still in (you left early) rank above the knocked out
    const ranked = s.players.slice().sort((a, b) => rank(a) - rank(b) || a.team - b.team);
    const shown = s.mode === 'teams' ? ranked : ranked.filter((p, i) => i < 3 || p.id === Match.you);
    const rows = shown.map(p => {
      const pl = s.mode === 'teams' ? '' : p.place ? `#${p.place}` : p.alive ? 'IN' : '-';
      return `<div class="res-row${p.id === Match.you ? ' you' : ''}"><span class="pl">${pl}</span><img alt="" src="${avatarURL(p.avatar, p.color)}"><span class="nm">${esc(p.id === Match.you ? 'You' : p.name)}</span><span class="dot" style="background:${p.color}"></span></div>`;
    });
    $('#resBadge').textContent = title;
    $('#resBadge').classList.toggle('lose', !won);
    $('#resSub').textContent = sub;
    $('#resList').innerHTML = rows.join('');
    const priv = Match.online && Match.cfg && Match.cfg.kind === 'private';
    show($('#btnAgain'), !priv);
    $('#btnAgain').textContent = kind === 'tutorial' ? (ONLINE ? 'PLAY ONLINE' : 'PLAY NOW') : 'PLAY AGAIN';
    show($('#btnBackRoom'), priv && !!pendingLobby);
    Sound.play(won ? 'win' : 'lose');
    if (won) CG.happytime();
    endMatchView();
    showScreen('results');
  }
  $('#btnDouble').onclick = () => {
    if (doubled || !lastReward) return;
    CG.rewarded(() => {
      doubled = true;
      Profile.addCoins(lastReward);
      $('#resCoinTxt').textContent = `+${lastReward * 2}`;
      show($('#btnDouble'), false);
      Sound.play('win');
    }, () => toast('The ad could not play. Try again in a moment.'));
  };
  $('#btnAgain').onclick = () => {
    Sound.play('click');
    const cfg = Match.cfg || { kind: 'practice', mode: 'ffa', size: 8, arena: -1 };
    CG.midgame(() => {
      if (cfg.kind === 'quick' || cfg.kind === 'tutorial') queueQuick(cfg.kind === 'tutorial' ? 'ffa' : cfg.mode, cfg.kind === 'tutorial' ? 8 : cfg.size);
      else startOffline(cfg);
    });
  };
  $('#btnBackRoom').onclick = () => { if (pendingLobby) { const m = pendingLobby; pendingLobby = null; CG.midgame(() => renderLobby(m)); } };
  $('#btnMenu').onclick = () => {
    Sound.play('click');
    if (Match.cfg && Match.cfg.kind === 'private') Net.send({ t: 'leave' });
    pendingLobby = null; lobbyState = null; CG.leftRoom();
    showScreen('menu');
  };
  $('#btnResShop').onclick = () => { Sound.play('click'); Shop.open(); };

  // ---------- menu buttons ----------
  $('#btnQuick').onclick = () => { Sound.play('click'); queueQuick('ffa', 8); };
  $('#btnTeams').onclick = () => { Sound.play('click'); queueQuick('teams', segVal('segTeam')); };
  $('#btnCreate').onclick = () => { Sound.play('click'); optionsModal('Create a room', 'CREATE ROOM', opt => createRoom(opt)); };
  $('#btnJoin').onclick = () => { Sound.play('click'); joinModal(); };
  show($('.team-row'), ONLINE);
  $('#btnPractice').onclick = () => { Sound.play('click'); optionsModal('Practice vs bots', 'PLAY', opt => startOffline(Object.assign({ kind: 'practice' }, opt))); };
  $('#btnShop').onclick = () => { Sound.play('click'); Shop.open(); };
  $('#menuCoins').onclick = () => { Sound.play('click'); Shop.open(); };
  $('#btnHow').onclick = () => { Sound.play('click'); howToModal(); };
  $('#btnTutorial').onclick = () => { Sound.play('click'); Tut.start(); };
  $('#btnSettings').onclick = () => { Sound.play('click'); settingsModal(); };
  const toggleSound = () => { Sound.userMute = !Sound.userMute; Sound.unlock(); Sound.apply(); Profile.save(); refreshMenu(); };
  $('#btnMuteHud').onclick = toggleSound;
  $('#btnPause').onclick = togglePause;
  // avatar button cycles through the avatars you own; the shop has the rest
  const nextAvatar = () => {
    const own = Profile.owned.avatar.slice().sort((a, b) => a - b);
    Profile.avatar = own[(own.indexOf(Profile.avatar) + 1) % own.length];
    Profile.save(); refreshMenu(); Sound.play('click');
    if (Net.open || P2P.active) Net.send({ t: 'hello', name: Profile.name, avatar: Profile.avatar, cos: Profile.eq });
  };
  $('#btnAvatar').onclick = nextAvatar;
  $('#myAvatar').onclick = nextAvatar;
  $('#btnReroll').onclick = () => { Profile.name = randomName(); Profile.save(); refreshMenu(); Sound.play('click'); };

  // quick-chat hotkeys (1-9) during a match
  addEventListener('keydown', e => {
    if (!Match.active || e.target instanceof HTMLInputElement || !Chat.enabled()) return;
    if (/^[1-9]$/.test(e.key)) Chat.say(+e.key - 1);
  });
  // a tap on the arena closes the chat panel
  cvs.addEventListener('pointerdown', () => closeChat());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && Match.active && !Match.online && !Match.paused) togglePause();
  });

  // =====================================================================
  // Main loop
  // =====================================================================
  let last = performance.now();
  let frameErrors = 0;
  function frame(now) {
    // schedule first, so one bad frame can never freeze the game
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    try {
      if (Match.active && Match.state) {
        if (!Match.paused) updateMatch(dt);
        drawMatch(Match.state, Match.you, Match.paused ? 0 : dt, Match.snapView);
        Match.snapView = false;
      } else {
        if (!Match.demo || Match.demo.phase === 'over') newDemo();
        Core.step(Match.demo, dt);
        Match.demo.events = [];
        updateFX(Match.demo, dt);
        drawMatch(Match.demo, -1, dt, false);
      }
      frameErrors = 0;
    } catch (e) {
      if (frameErrors++ < 3) console.warn('frame error', e);
      // a match stuck throwing every frame: bail out to the menu instead of a frozen screen
      if (frameErrors > 30) {
        frameErrors = 0;
        if (Match.active) { try { endMatchView(); } catch { /* ignore */ } showScreen('menu'); toast('Something went wrong in that match. Try again!'); }
        else Match.demo = null;
      }
    }
  }

  // =====================================================================
  // Boot
  // =====================================================================
  async function boot() {
    Loader.start();
    Loader.set(4, 'Starting up');
    await CG.init();
    CG.loadingStart();
    Loader.set(20, 'Loading fonts');
    if (document.fonts && document.fonts.load) {
      try { await Promise.race([Promise.all([document.fonts.load('600 16px Fredoka'), document.fonts.load('700 16px Fredoka')]), wait(3000)]); } catch { /* fallback fonts are fine */ }
    }
    Loader.set(34, 'Loading your save');
    Profile.load();
    const user = await CG.getUser();
    if (user && user.username) { Profile.saved = Profile.name; Profile.name = user.username.slice(0, 16); Profile.cgName = true; }
    CG.onAuth(u => { if (u && u.username) { Profile.saved = Profile.saved || Profile.name; Profile.name = u.username.slice(0, 16); Profile.cgName = true; refreshMenu(); } });
    Sound.sdkMute = CG.sdkMuted;
    CG.onSettings(st => {
      if (st && 'muteAudio' in st) { Sound.sdkMute = !!st.muteAudio; Sound.apply(); }
      if (st && st.disableChat) { closeChat(); Chat.reset(); show($('#btnChat'), false); show($('#lobbyChat'), false); }
    });
    buildChatPanel();
    // draw every avatar once so the first match doesn't hitch
    Loader.set(44, 'Drawing players');
    for (let i = 0; i < AVATARS; i++) {
      for (const c of Core.COLORS) avatarCanvas(i, c, 128);
      avatarURL(i);
      if (i % 2) { Loader.set(44 + 40 * (i + 1) / AVATARS); await nextFrame(); }
    }
    // open the server connection early so Quick Play starts faster (never blocks for long)
    if (ONLINE) {
      Loader.set(86, 'Connecting');
      await Promise.race([Net.connect().catch(() => {}), wait(2500)]);
    }
    Loader.set(100, 'Ready');
    refreshMenu();
    showScreen('menu');
    newDemo();
    requestAnimationFrame(frame);
    await wait(150);
    Loader.done();
    CG.loadingStop();

    // friends joining from the CrazyGames UI while the game is already open
    CG.onJoinRoom(params => {
      const code = params && params.roomId;
      if (!code) return;
      if (Match.active) { if (Match.online) Net.send({ t: 'leave' }); endMatchView(); }
      if (lobbyState) Net.send({ t: 'leave' });
      joinRoom(String(code).toUpperCase().slice(0, 5));
    });

    // Land players in gameplay straight away:
    // invite link -> the room, instant multiplayer -> a new room, first visit -> tutorial, everyone else -> Quick Play.
    const roomId = CG.inviteParam('roomId');
    if (roomId) joinRoom(String(roomId).toUpperCase().slice(0, 5));
    else if (CG.instantMultiplayer) createRoom({ mode: 'ffa', size: 8, arena: -1 });
    else if (QS.get('menu') === '1') { /* developer shortcut: stay on the menu */ }
    else if (!Profile.tut) Tut.start();
    else queueQuick('ffa', 8, true);
  }
  if (QS.get('debug') === '1') window.__PR = { Match, Tut, Profile, Core, Shop, Chat, Input };
  boot();
})();
