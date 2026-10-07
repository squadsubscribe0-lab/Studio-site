import { VIEW, COURT, PHYS, RULES, TEAM, POWERS, AUDIO, NET_CONFIG } from './config.js';
import { initInput, readInput, onKey, endFrame, clearKeys, EMPTY_INPUT, KEY_LABELS, loadKeyLabels } from './core/input.js';
import { audio } from './core/audio.js';
import { loadAllAssets } from './core/assets.js';
import { Match, STATE } from './game/match.js';
import { POWER_META, attachPowerIcons } from './game/powers.js';
import { Renderer } from './game/renderer.js';
import { HUD } from './ui/hud.js';
import { Menus } from './ui/menus.js';
import { touch, wantsTouchControls } from './ui/touch.js';
import { platform } from './platform/index.js';
import { net } from './net/netclient.js';

const $ = (id) => document.getElementById(id);

/** Payout for the opt-in rewarded video on the result screen. */
const REWARDED_COINS = 250;
const REWARD_LABEL = `WATCH AD · +${REWARDED_COINS} COINS`;

/** Base coins for winning a point, before the streak multiplier. */
const COINS_PER_POINT = 15;

/** Coins for taking a match. */
const COINS_PER_WIN = 100;

/**
 * The streak multiplier.
 *
 * Two points in a row doubles what each one pays, and it keeps climbing to a
 * cap. This exists because the HUD already had an "X2" pill hard-coded into the
 * markup that nothing in the game ever read or wrote - it permanently advertised
 * a bonus that did not exist. Rather than delete it, the bonus is now real, and
 * it gives the streak counter beside it something to be for.
 */
const STREAK_MULTIPLIER_CAP = 4;
const coinMultiplier = (streak) =>
  Math.min(STREAK_MULTIPLIER_CAP, 1 + Math.floor(streak / 2));

/**
 * Onboarding.
 *
 * The game used to open on a menu, then a mode screen with six tiles and four
 * dropdowns, and only then start a match - at which point a modal box covered
 * the court with five written lessons you had to read through. CrazyGames asks
 * for the opposite: land the player in gameplay, teach inside it, visually, and
 * let them skip.
 *
 * So the match is already running when the page finishes loading, and teaching
 * is four keycaps that appear over the player, one at a time, for whichever
 * basic they have not used yet. Each clears itself the instant the action
 * happens. Nothing is modal and nothing has to be dismissed.
 *
 * `show` decides whether a step can be asked for right now - there is no point
 * prompting SPACE when it is not your serve, or S in the air when you are
 * standing on the sand.
 */
const COACH = [
  {
    id: 'serve', codes: ['Space'], touch: ['JUMP'], label: 'SERVE',
    show: (g, me) => g.match.state === STATE.SERVE && g.match.serverId === me.id
  },
  { id: 'move',  codes: ['KeyA', 'KeyD'], touch: ['◀', '▶'], label: 'MOVE',  show: () => true },
  { id: 'jump',  codes: ['KeyW'],         touch: ['JUMP'],               label: 'JUMP',  show: (g) => g.match.state === STATE.RALLY },
  { id: 'spike', codes: ['KeyS'],         touch: ['SPIKE'],              label: 'SPIKE', show: (g, me) => !me.onGround }
];

/**
 * Smallest base font the HUD and menus may shrink to, in CSS px. CrazyGames QA
 * requires text to be legible at devicePixelRatio 1 in iframes as small as
 * 821x462; the smallest labels also carry their own px floors in main.css.
 */
const MIN_UI_FONT = 12;

/** A prompt nobody acts on gives up after this long rather than nagging. */
const COACH_TIMEOUT = 15;

/** What a match started straight off the loading screen is set to. */
const QUICK_MATCH = {
  mode: 'ai', teamSize: 1,
  pointsToWin: RULES.pointsToWin,
  matchSeconds: RULES.matchSeconds,
  difficulty: 1,
  powers: POWERS.enabled
};

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.overlay = document.getElementById('overlay');
    this.match = null;
    this.paused = false;
    this.mode = 'ai';
    this.selection = { character: null, ball: null };
    this.meta = {
      coins: 525, streak: 0, best: 0, trophies: 0, tutorialDone: false, wonOnce: false,
      // Only *bought* ids are stored. Whether something is free is a property
      // of the manifest, so dropping a price to 0 later hands it to everyone
      // instead of leaving old saves locked out of it.
      owned: { characters: [], balls: [] },
      // Which of them is equipped. Selection was never saved before, which did
      // not matter while everything was free - it matters a lot when you have
      // just spent 400 coins on a character and come back as the default one.
      selected: { characters: null, balls: null },
      volMaster: AUDIO.master, volMusic: AUDIO.music, volSfx: AUDIO.sfx,
      shake: 1, vfx: true
    };
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.coach = { done: new Set(), step: null, timer: 0, active: false, servePending: false, servedByHand: false };
    this.blockedByOrientation = false;
    this.netAccum = 0;
    this.musicMood = null;
  }

  async boot() {
    initInput();
    if (wantsTouchControls()) touch.init();
    this.hud = new HUD();
    this.menus = new Menus(this);
    // Size the overlay before anything loads, otherwise the loading screen
    // renders into a zero-sized box and the player stares at an empty page.
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.menus.show('loading');

    platform.onSettingsChanged = (s) => {
      audio.platformMuted = !!s.muteAudio;
      audio.applyMute();
      this.hud.setAudioLabel(!audio.isMuted);
    };

    await platform.init();
    // loadingStart has to come *after* init: every SDK wrapper method is
    // guarded on `ready`, so calling it first was silently a no-op and the
    // portal only ever saw the matching loadingStop.
    platform.loadingStart();
    audio.platformMuted = !!platform.settings.muteAudio;

    this.assets = await loadAllAssets((v, msg) => this.menus.progress(v, msg));
    attachPowerIcons(this.assets.powerIcons);
    this.menus.progress(0.92, 'Tuning the sound system…');
    await audio.load();

    this.selection.character = this.assets.characters[0];
    this.selection.ball = this.assets.balls[0];

    this.renderer = new Renderer(this.canvas, this.assets);
    this.resize();

    await this.loadMeta();
    this.ensureSelectionOwned();
    this.applySettings();
    this.syncMeta();
    this.hud.setAudioLabel(!audio.isMuted);

    this.wireUI();
    this.wireNet();
    // Print the letters this player's keyboard actually has. The bindings are
    // already layout-independent - they are physical positions - but an AZERTY
    // player reading "W" for a key printed "Z" is being told the wrong thing.
    await loadKeyLabels();
    this.applyKeyLabels();
    this.watchOrientation();
    await this.adoptPortalAccount();

    this.menus.progress(1, 'Ready');
    platform.loadingStop();

    // Someone arriving from an invite link or the platform's "join" button
    // should land straight in the online lobby.
    const invitedRoom = platform.getInviteParam('room');
    if (invitedRoom) {
      this.menus.show('online');
      document.getElementById('netRoom').value = invitedRoom;
      this.joinRoom(invitedRoom);
    } else if (platform.isInstantMultiplayer) {
      this.menus.show('online');
      this.createRoom();
    } else {
      // Straight into a match. No menu, no mode screen, no "press start" - the
      // first thing a new player sees is the sand and their own character.
      // Everything the menu offered is one MENU button away in the HUD.
      this.startMatch({ ...QUICK_MATCH, powers: POWERS.enabled });
    }

    requestAnimationFrame((t) => this.frame(t));
  }

  /** Same letterbox maths the renderer uses, available before it exists. */
  computeRect() {
    const w = window.innerWidth, h = window.innerHeight;
    const scale = Math.min(w / VIEW.W, h / VIEW.H);
    const dw = Math.round(VIEW.W * scale), dh = Math.round(VIEW.H * scale);
    return { x: Math.round((w - dw) / 2), y: Math.round((h - dh) / 2), w: dw, h: dh, scale };
  }

  resize() {
    const r = this.renderer ? this.renderer.resize() : this.computeRect();
    Object.assign(this.overlay.style, {
      left: r.x + 'px', top: r.y + 'px',
      width: r.w + 'px', height: r.h + 'px',
      // Every HUD size is in em, so one font-size scales the whole overlay -
      // down to a floor. Scaled purely with the canvas, the non-fullscreen
      // 821x462 frame CrazyGames tests in gave an 8px base and 5-7px labels.
      fontSize: Math.max(16 * r.scale, MIN_UI_FONT) + 'px'
    });
  }

  // ---------------------------------------------------------------- UI
  wireUI() {
    const $ = (id) => document.getElementById(id);

    $('btnAudio').addEventListener('click', () => {
      audio.toggle();
      this.hud.setAudioLabel(!audio.isMuted);
    });
    $('btnPause').addEventListener('click', () => this.setPaused(true));
    $('btnResume').addEventListener('click', () => this.setPaused(false));
    $('btnRestart').addEventListener('click', () => {
      this.setPaused(false);
      if (this.mode === 'online') this.returnToLobby();
      else this.startMatch(this.lastConfig);
    });
    $('btnQuit').addEventListener('click', () => this.quitToMenu());
    // startMatch() is the offline path: it seats the local player and fills the
    // rest with AI. Handing it an online lastConfig dropped the player into a
    // solo match against the computer while their friends sat in a room that
    // never heard the round had ended.
    $('btnAgain').addEventListener('click', () => {
      if (this.mode === 'online') this.returnToLobby();
      else this.startMatch(this.lastConfig);
    });
    $('btnMenu').addEventListener('click', () => this.quitToMenu());
    $('btnReward').addEventListener('click', () => this.claimRewardedCoins());
    $('btnHudMenu').addEventListener('click', () => this.quitToMenu());
    $('btnSkip').addEventListener('click', () => this.endCoach());

    $('btnCreate').addEventListener('click', () => this.createRoom());
    $('btnJoin').addEventListener('click', () => this.joinRoom(($('netRoom').value || '').trim().toUpperCase()));
    $('btnStartNet').addEventListener('click', () => {
      net.startMatch({
        teamSize: Number($('netSize').value),
        pointsToWin: Number($('optPoints').value || RULES.pointsToWin),
        matchSeconds: Number($('optTime').value ?? RULES.matchSeconds),
        powers: POWERS.enabled
      });
    });
    $('btnInvite').addEventListener('click', async () => {
      const link = platform.inviteLink({ room: net.room });
      try { await navigator.clipboard.writeText(link); $('netStatus').textContent = 'Invite link copied.'; }
      catch { $('netStatus').textContent = link; }
    });

    // ---- settings sliders
    const slider = (id, key, apply) => {
      const el = $(id);
      const out = $(id + 'Val');
      if (!el) return;
      el.value = Math.round((this.meta[key] ?? 1) * 100);
      if (out) out.textContent = el.value;
      el.addEventListener('input', () => {
        const v = Number(el.value) / 100;
        this.meta[key] = v;
        if (out) out.textContent = el.value;
        apply(v);
        this.saveMeta();
      });
    };
    slider('volMaster', 'volMaster', (v) => audio.setVolume('master', v));
    slider('volMusic', 'volMusic', (v) => audio.setVolume('music', v));
    slider('volSfx', 'volSfx', (v) => { audio.setVolume('sfx', v); audio.play('click', 0.6); });
    slider('optShake', 'shake', () => {});

    const vfx = $('optVfx');
    if (vfx) {
      vfx.checked = this.meta.vfx !== false;
      vfx.addEventListener('change', () => { this.meta.vfx = vfx.checked; this.saveMeta(); });
    }

    // A click anywhere is the browser gesture WebAudio waits for.
    document.addEventListener('pointerdown', () => audio.resume(), { once: false });
    // iOS suspends the context on any interruption - a call, the tab going to
    // the background, the app being backgrounded - and does not resume it when
    // you come back. CrazyGames call this out specifically.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) audio.resume();
    });
    document.querySelectorAll('#overlay button').forEach((b) => {
      b.addEventListener('click', () => audio.play('ui', 0.7));
    });

    onKey((code) => {
      audio.resume();
      if (code === 'KeyP' && this.match && this.menus.current === 'none') this.setPaused(!this.paused);
      // Escape is deliberately not bound. The portal's player closes fullscreen
      // on it, so pausing as well means one press does two things at once.
      if (code === 'KeyM') { audio.toggle(); this.hud.setAudioLabel(!audio.isMuted); }
    });
  }

  applySettings() {
    audio.setVolume('master', this.meta.volMaster ?? AUDIO.master);
    audio.setVolume('music', this.meta.volMusic ?? AUDIO.music);
    audio.setVolume('sfx', this.meta.volSfx ?? AUDIO.sfx);
  }

  /** Menu music has to wait for a user gesture, so this is safe to call often. */
  setMusic(name) {
    if (this.musicMood === name) return;
    this.musicMood = name;
    audio.playMusic(name);
  }

  wireNet() {
    const status = document.getElementById('netStatus');
    const list = document.getElementById('lobbyList');

    net.addEventListener('lobby', (e) => {
      const { peers, isHost, room } = e.detail;
      status.textContent = `Room ${room} — ${peers.length} player${peers.length === 1 ? '' : 's'} connected. Empty slots are AI.`;
      list.innerHTML = '';
      peers.forEach((p, i) => {
        const row = document.createElement('div');
        row.textContent = `${i % 2 === 0 ? '🔵' : '🔴'} ${p.name}${p.id === net.id ? ' (you)' : ''}${i === 0 ? ' — host' : ''}`;
        list.appendChild(row);
      });
      document.getElementById('btnStartNet').classList.toggle('hidden', !isHost);
      document.getElementById('btnInvite').classList.remove('hidden');
      platform.updateRoom({ roomId: room, isJoinable: peers.length < NET_CONFIG.maxPeers, inviteParams: { room } });
    });

    net.addEventListener('start', (e) => this.startOnlineMatch(e.detail));
    net.addEventListener('neterror', (e) => { status.textContent = e.detail; });
    net.addEventListener('closed', () => { status.textContent = 'Disconnected — the host left the room.'; });

    platform.onJoinRoom = (params) => {
      if (params?.room) { this.menus.show('online'); this.joinRoom(params.room); }
    };
  }

  async createRoom() {
    const code = Math.random().toString(36).slice(2, 7).toUpperCase();
    document.getElementById('netRoom').value = code;
    await this.joinRoom(code);
  }

  async joinRoom(code) {
    const status = document.getElementById('netStatus');
    if (!code) { status.textContent = 'Enter a room code first.'; return; }
    status.textContent = 'Connecting…';
    try {
      if (!net.connected || !net.peer) await net.connect();
      const name = (this.portalUser?.name || document.getElementById('netName').value || 'Player').slice(0, 16);
      net.join(code, name, Number(document.getElementById('netSize').value));
    } catch (err) {
      status.textContent = net.p2p
        ? 'Online play could not start — the peer-to-peer library did not load. Check your connection and reload.'
        : `Could not reach ${NET_CONFIG.wsUrl}. Start the relay in server/ or point NET_CONFIG.wsUrl at your host.`;
    }
  }

  // ---------------------------------------------------------------- match
  startMatch(cfg) {
    this.lastConfig = cfg;
    this.mode = cfg.mode;
    if (cfg.powers !== undefined) POWERS.enabled = !!cfg.powers;

    const seats = [{ team: TEAM.LEFT, slot: 0, controller: 'human0', name: 'You' }];
    if (cfg.mode === 'local') {
      seats.push({ team: TEAM.RIGHT, slot: 0, controller: 'human1', name: 'P2' });
    }

    const chars = { left: [], right: [] };
    chars.left[0] = this.selection.character;
    chars.right[0] = this.assets.characters[1] || this.selection.character;

    this.match = new Match({
      ...cfg,
      characters: chars,
      ballSkin: this.selection.ball,
      localSeats: seats
    }, this.assets);

    this.hud.setNames(
      cfg.mode === 'local' ? 'Player 1' : 'You',
      cfg.mode === 'local' ? 'Player 2' : 'Rivals'
    );
    this.hud.setTarget(this.match.cfg.pointsToWin);
    this.hud.show(true);
    this.menus.hideAll();
    this.paused = false;
    clearKeys();

    this.startCoach(cfg);
    touch.show(true);

    platform.setContext({ mode: cfg.mode, teamSize: String(cfg.teamSize) });
    platform.gameplayStart();
    this.setMusic('match');
    audio.play('whistle');
  }

  startOnlineMatch(config) {
    this.mode = 'online';
    this.lastConfig = { ...config, mode: 'online' };
    if (config.powers !== undefined) POWERS.enabled = !!config.powers;

    const teamSize = config.teamSize || 1;
    // The host ships its roster with the start packet so every machine seats
    // the same players in the same slots.
    const roster = config.seats || null;
    const seats = net.seatsFor(teamSize, roster).map((s) => ({
      team: s.team, slot: s.slot, name: s.name,
      controller: s.peerId === net.id ? 'human0' : 'remote'
    }));
    this.seatByPeer = new Map(net.seatsFor(teamSize, roster).map((s) => [s.peerId, s]));

    const chars = { left: [], right: [] };
    chars.left[0] = this.selection.character;
    chars.right[0] = this.assets.characters[1] || this.selection.character;

    this.match = new Match({
      ...config, mode: 'online', teamSize,
      characters: chars, ballSkin: this.selection.ball, localSeats: seats
    }, this.assets);

    this.mySeat = seats.find((s) => s.controller === 'human0');
    this.myPlayer = this.mySeat ? this.match.playerAt(this.mySeat.team, this.mySeat.slot) : null;

    this.hud.setNames('Blue', 'Red');
    this.hud.setTarget(this.match.cfg.pointsToWin);
    this.hud.show(true);
    this.menus.hideAll();
    this.paused = false;
    this.endCoach();          // never coach over the top of a live online match
    touch.show(true);
    platform.gameplayStart();
    this.setMusic('match');
  }

  /**
   * Back to the room at the end of an online round, with the peer connection
   * left up so the party survives the match.
   *
   * Deliberately not quitToMenu(): that calls net.leave(), which is the one
   * thing that must not happen here - CrazyGames require a game to retain
   * friends in a lobby between rounds, and dropping the room to show a menu
   * loses the party every single game.
   */
  returnToLobby() {
    this.match = null;
    this.hud.show(false);
    this.hud.setCoach(false);
    touch.show(false);
    this.renderer.coachPrompt = null;
    this.setPaused(false);
    this.menus.show('online');
    platform.gameplayStop();
    this.setMusic('menu');
  }

  quitToMenu() {
    this.match = null;
    this.hud.show(false);
    this.hud.setCoach(false);
    touch.show(false);
    this.renderer.coachPrompt = null;
    this.setPaused(false);
    this.menus.show('menu');
    platform.gameplayStop();
    platform.clearContext();
    this.setMusic('menu');
    if (this.mode === 'online') { net.leave(); platform.leftRoom(); }
  }

  setPaused(on) {
    if (this.mode === 'online') return;    // pausing a live online match is not fair
    this.paused = on;
    // The pad goes away with the game: leaving thumb buttons live over a dialog
    // is how you resume a match by accident.
    touch.show(!on);
    if (on) { this.menus.show('pause'); platform.gameplayStop(); audio.duck(2, 0.4); }
    else { this.menus.hideAll(); platform.gameplayStart(); clearKeys(); }
  }

  /**
   * Rewrites every printed key with the label from this keyboard's layout, and
   * drops the "[P]" from the pause button when there is no keyboard at all.
   */
  applyKeyLabels() {
    for (const el of document.querySelectorAll('[data-key]')) {
      const label = KEY_LABELS[el.dataset.key];
      if (label) el.textContent = label;
    }
    if (touch.enabled) document.getElementById('btnPause').textContent = 'PAUSE';
    else document.getElementById('btnPause').textContent = `PAUSE [${KEY_LABELS.KeyP}]`;
  }

  /**
   * Portrait on a phone squeezes a 16:9 court into a strip a few centimetres
   * tall. Rather than ship a layout nobody can play, ask for landscape and hold
   * the match while the screen is the wrong way round - otherwise the player
   * loses points to an AI they cannot see.
   */
  watchOrientation() {
    const rotate = document.getElementById('rotate');
    const check = () => {
      const portrait = touch.enabled && window.innerHeight > window.innerWidth;
      rotate.classList.toggle('hidden', !portrait);

      // Only act on a change of state. This runs on every resize, and firing
      // gameplayStart on each one sends the portal a second start for a session
      // that never stopped - the SDK's own log shows the duplicate. The pairs
      // are supposed to balance.
      if (portrait === this.blockedByOrientation) return;
      this.blockedByOrientation = portrait;

      if (portrait) { clearKeys(); touch.show(false); platform.gameplayStop(); }
      else if (this.match && !this.paused) { touch.show(true); platform.gameplayStart(); }
    };
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', () => setTimeout(check, 120));
    check();
  }

  // ---------------------------------------------------------------- coaching
  startCoach(cfg) {
    const c = this.coach;
    c.done = new Set();
    c.step = null;
    c.timer = 0;
    c.servePending = false;
    c.servedByHand = false;
    // Only ever coach a fresh player in a normal 1v1. A second local player or
    // a full 4v4 squad is not where anyone learns which key jumps.
    c.active = !this.meta.tutorialDone && cfg.mode === 'ai' && cfg.teamSize === 1;
    this.hud.setCoach(c.active);
    this.renderer.coachPrompt = null;
  }

  /** Ends coaching for good - skipped, or every basic used. */
  endCoach() {
    const wasCoaching = this.coach.active;
    this.coach.active = false;
    this.coach.step = null;
    this.hud.setCoach(false);
    this.renderer.coachPrompt = null;
    // Only a run that actually taught something counts. Otherwise dropping into
    // an online match, which ends coaching too, would silently mark a player
    // who has never seen a prompt as taught.
    if (wasCoaching && !this.meta.tutorialDone) {
      this.meta.tutorialDone = true;
      this.saveMeta();
    }
  }

  /**
   * Watches the local player and picks the prompt to show.
   *
   * Progress is read off the player's own body rather than the match event
   * stream: the AI opponent jumps and spikes too, and events do not say who
   * they belong to, so a shared 'jump' would tick the tutorial along while the
   * player stood still.
   */
  updateCoach(dt) {
    const c = this.coach;
    if (!c.active) return;
    // The result screen is up once the match is over; a prompt left drawing
    // underneath it would show through.
    if (this.match.state === STATE.OVER) { this.renderer.coachPrompt = null; return; }

    const me = this.localPlayer();
    if (!me) { this.renderer.coachPrompt = null; return; }

    if (Math.abs(me.vx) > 60) c.done.add('move');
    if (!me.onGround) c.done.add('jump');
    if (!me.onGround && me.spikeHeld) c.done.add('spike');

    // A serve only counts if the player put it in play themselves. The match
    // auto-serves after a few idle seconds so it can never stall, and crediting
    // that would tick the lesson off for someone who never touched the key.
    if (this.match.state === STATE.SERVE && this.match.serverId === me.id) {
      c.servePending = true;
      if (readInput(0).serve) c.servedByHand = true;
    } else if (c.servePending) {
      if (c.servedByHand) c.done.add('serve');
      c.servePending = false;
      c.servedByHand = false;
    }

    const next = COACH.find((s) => !c.done.has(s.id) && s.show(this, me));
    if (!next) {
      // Nothing to ask for right now. That is either because every step is done
      // or because the showable ones are waiting on the match state.
      if (COACH.every((s) => c.done.has(s.id))) { this.endCoach(); return; }
      this.renderer.coachPrompt = null;
      return;
    }

    if (next.id !== c.step) { c.step = next.id; c.timer = 0; }
    c.timer += dt;
    if (c.timer > COACH_TIMEOUT) { c.done.add(next.id); return; }

    // Pushed up and back from the player: at serve height the held ball sits
    // just off their hip, and a prompt centred on the head landed right on it.
    this.renderer.coachPrompt = {
      x: me.x - Math.sign(COURT.netX - me.x) * 46,
      y: me.y - 340,
      keys: touch.enabled ? next.touch : next.codes.map((c) => KEY_LABELS[c]),
      label: next.label
    };
  }

  /**
   * Uses the portal's account name for online play when there is one.
   *
   * CrazyGames requires the game to use the CrazyGames username rather than
   * running an identity of its own, and to have registered players already
   * signed in. Where the portal has no account concept the name box stays as it
   * was, which is what every other build falls back to.
   */
  async adoptPortalAccount() {
    const field = document.getElementById('netName');
    const note = document.getElementById('netNameNote');
    const user = await platform.getUser();
    if (!user || !user.name) return;

    this.portalUser = user;
    field.value = user.name;
    field.readOnly = true;
    field.classList.add('locked');
    if (note) note.classList.remove('hidden');
  }

  /** The player this keyboard drives, whichever seat they were given. */
  localPlayer() {
    if (!this.match) return null;
    return this.myPlayer || this.match.players.find((p) => p.controller === 'human0') || null;
  }

  // ---------------------------------------------------------------- loop
  frame(now) {
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > PHYS.maxFrameTime) dt = PHYS.maxFrameTime;

    if (this.match && !this.paused && !this.blockedByOrientation) {
      this.accumulator += dt;
      let steps = 0;
      while (this.accumulator >= PHYS.dt && steps < 8) {
        this.simulate(PHYS.dt);
        this.accumulator -= PHYS.dt;
        steps++;
      }
      this.syncNetwork(dt);
      this.handleEvents();
      this.hud.update(this.match, dt);
      this.updateCoach(dt);
      this.updateMusicMood();
    }

    this.renderer.updateEffects(dt);
    this.renderer.draw(this.match, dt);
    endFrame();
    requestAnimationFrame((t) => this.frame(t));
  }

  /** Music tightens up when the match reaches its last point. */
  updateMusicMood() {
    const m = this.match;
    if (!m || m.state === STATE.OVER) return;
    const target = m.cfg.pointsToWin;
    const closest = Math.max(m.score[0], m.score[1]);
    const clutch = closest >= target - 1;
    this.setMusic(clutch ? 'tense' : 'match');
  }

  collectInputs() {
    const inputs = new Map();
    for (const p of this.match.players) {
      if (p.controller === 'human0') inputs.set(p.id, readInput(0));
      else if (p.controller === 'human1') inputs.set(p.id, readInput(1));
      else if (p.controller === 'remote') {
        const seat = [...(this.seatByPeer?.values() || [])]
          .find((s) => s.team === p.team && s.slot === p.slot);
        inputs.set(p.id, (seat && net.remoteInputs.get(seat.peerId)) || EMPTY_INPUT);
      }
      // 'ai' players are left out so Match falls through to the AI brain.
    }
    return inputs;
  }

  simulate(dt) {
    // Online clients do not own the world: the host does. They still run the
    // sim locally for smoothness and get corrected by each snapshot.
    this.match.step(dt, this.collectInputs());
  }

  syncNetwork(dt) {
    if (this.mode !== 'online' || !net.connected) return;

    net.sendInput(readInput(0));

    if (net.isHost) {
      this.netAccum += dt;
      const interval = 1 / NET_CONFIG.snapshotHz;
      if (this.netAccum >= interval) {
        this.netAccum = 0;
        net.sendSnapshot(this.match.snapshot());
      }
    } else if (net.latestSnapshot) {
      const snap = net.latestSnapshot;
      net.latestSnapshot = null;
      // Keep our own player local (prediction), take everything else from the host.
      const mine = this.myPlayer;
      const keep = mine ? { x: mine.x, y: mine.y, vx: mine.vx, vy: mine.vy } : null;
      this.match.applySnapshot(snap);
      if (mine && keep) {
        const authoritative = { x: mine.x, y: mine.y };
        // Snap if we are badly out of sync, otherwise ease back.
        const err = Math.hypot(authoritative.x - keep.x, authoritative.y - keep.y);
        if (err < 90) {
          mine.x = keep.x + (authoritative.x - keep.x) * 0.15;
          mine.y = keep.y + (authoritative.y - keep.y) * 0.15;
          mine.vx = keep.vx; mine.vy = keep.vy;
        }
      }
    }
  }

  // ---------------------------------------------------------------- events
  /** Screen shake respects the settings slider. */
  shake(amount) {
    this.renderer.shake = Math.max(this.renderer.shake, amount * (this.meta.shake ?? 1));
  }

  // ---------------------------------------------------------------- the shop
  /**
   * Free items are free for everyone; everything else has to have been bought.
   * `kind` is 'characters' or 'balls', matching both the assets and the manifest.
   */
  owns(kind, item) {
    if (!item) return false;
    if (!item.price) return true;
    return (this.meta.owned[kind] || []).includes(item.id);
  }

  /**
   * Attempts a purchase. Returns 'owned', 'bought' or 'poor' so the caller can
   * say something useful rather than just failing quietly.
   */
  buy(kind, item) {
    if (this.owns(kind, item)) return 'owned';
    if (this.meta.coins < item.price) return 'poor';
    this.meta.coins -= item.price;
    if (!this.meta.owned[kind]) this.meta.owned[kind] = [];
    this.meta.owned[kind].push(item.id);
    this.syncMeta();
    this.saveMeta();
    return 'bought';
  }

  /** Equips an item and remembers it. */
  equip(kind, item) {
    if (kind === 'characters') this.selection.character = item;
    else this.selection.ball = item;
    this.meta.selected[kind] = item.id;
    this.saveMeta();
  }

  /**
   * Restores the saved selection, and keeps it legal.
   *
   * A save can outlive the manifest that made it: a character that used to be
   * free can be given a price, or dropped from the roster entirely. Either way
   * the player has to end up on the court in something they own.
   */
  ensureSelectionOwned() {
    const fix = (kind, list) => {
      const savedId = this.meta.selected && this.meta.selected[kind];
      const saved = savedId && list.find((i) => i.id === savedId);
      if (saved && this.owns(kind, saved)) return saved;
      return list.find((i) => this.owns(kind, i)) || list[0];
    };
    this.selection.character = fix('characters', this.assets.characters);
    this.selection.ball = fix('balls', this.assets.balls);
  }

  /** One place that pushes wallet state at the HUD, multiplier included. */
  syncMeta() {
    this.hud.setMeta(this.meta, coinMultiplier(this.meta.streak));
  }

  get vfxOn() { return this.meta.vfx !== false; }

  /**
   * Turns a court position into a stereo pan. A dig on the far side of the net
   * should sound like it came from over there - it is the cheapest way to make
   * the audio agree with what is on screen, and in a 2v2 it tells you which
   * side of your own half a team-mate just played from.
   *
   * audio.route() clamps the extremes; this only has to map the court.
   */
  panAt(x) {
    if (x === undefined || x === null) return null;
    return (x / VIEW.W) * 2 - 1;
  }

  handleEvents() {
    const R = this.renderer;
    for (const ev of this.match.drainEvents()) {
      switch (ev.type) {
        // ---------------------------------------------------- contact
        case 'hit':
          audio.play('hit', 0.5 + ev.power * 0.5, 0.9 + ev.power * 0.4, this.panAt(ev.x));
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 6, 'rgba(255,255,255,ALPHA)', 220);
            R.ring(ev.x, ev.y, { to: 46 + ev.power * 40, life: 0.26, width: 4 });
          }
          break;
        case 'spike':
          audio.play('spike', 1, 1, this.panAt(ev.x));
          this.shake(1);
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 16, 'rgba(255,220,120,ALPHA)', 420, { glow: true });
            R.ring(ev.x, ev.y, { to: 150, life: 0.35, width: 8, color: 'rgba(255,220,140,ALPHA)' });
          }
          break;
        case 'jump': audio.play('jump', 0.35, 1.1, this.panAt(ev.player && ev.player.x)); break;
        case 'dive':
          audio.play('dive', 0.6, 1, this.panAt(ev.player && ev.player.x));
          if (this.vfxOn) R.burst(ev.player.x, ev.player.y, 10, 'rgba(240,215,160,ALPHA)', 260);
          break;
        case 'land':
          audio.play('land', 0.3, 1, this.panAt(ev.player && ev.player.x));
          if (this.vfxOn) R.burst(ev.player.x, ev.player.y, 5, 'rgba(240,215,160,ALPHA)', 180);
          break;
        case 'net': audio.play('net', 0.7, 1, this.panAt(ev.x)); break;
        case 'wall': audio.play('wall', 0.5, 1, this.panAt(ev.x)); break;
        case 'whistle': audio.play('whistle', 0.5); break;

        // ---------------------------------------------------- powers
        case 'orbSpawn':
          audio.play('orb', 0.7, 1, this.panAt(ev.x));
          if (this.vfxOn) {
            R.ring(ev.x, ev.y, {
              to: 120, life: 0.5, width: 5,
              color: this.powerRGBA(ev.power, 'ALPHA')
            });
          }
          break;

        case 'orbTaken': {
          const meta = POWER_META[ev.power];
          audio.play('pickup', 1, 1, this.panAt(ev.x));
          this.shake(0.5);
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 26, this.powerRGBA(ev.power, 'ALPHA'), 460, { glow: true, shape: 'star', gravity: 200 });
            R.ring(ev.x, ev.y, { to: 200, life: 0.5, width: 9, color: this.powerRGBA(ev.power, 'ALPHA') });
            R.popup(ev.x, ev.y - 40, meta.label, { color: meta.glow, size: 40, life: 1.0 });
          }
          break;
        }

        case 'powerGained':
          this.hud.announcePower(
            ev.power,
            ev.team === TEAM.LEFT ? 'Charged — your next hit!' : 'Rivals are charged!',
            ev.team
          );
          break;

        case 'powerFired':
          this.onPowerFired(ev);
          break;

        case 'frozen':
          audio.play('freeze', 0.9, 1, this.panAt(ev.x));
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 20, 'rgba(200,244,255,ALPHA)', 300, { shape: 'shard', glow: true });
            R.ring(ev.x, ev.y, { to: 130, life: 0.45, width: 7, color: 'rgba(120,220,255,ALPHA)' });
          }
          break;

        case 'unfreeze':
          audio.play('shatter', 0.8, 1, this.panAt(ev.x));
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 26, 'rgba(223,251,255,ALPHA)', 420, { shape: 'shard', gravity: 1400 });
          }
          break;

        case 'scorched':
          audio.play('burn', 0.7, 1, this.panAt(ev.x));
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 14, 'rgba(255,140,40,ALPHA)', 260, { glow: true, shape: 'flame', gravity: -180 });
          }
          break;

        case 'multiStart':
          audio.play('multi', 1, 1, this.panAt(ev.x));
          this.shake(0.7);
          if (this.vfxOn) {
            R.flash('#c084fc', 0.35, 0.3);
            R.popup(ev.x, ev.y - 60, `x${ev.count}`, { color: '#f5d0fe', size: 72, life: 1.1, shake: 6 });
          }
          break;

        case 'multiEnd':
          audio.play('poof', 0.6);
          break;

        case 'ballGone':
          if (this.vfxOn) R.burst(ev.x, ev.y, 12, 'rgba(200,170,255,ALPHA)', 260, { glow: true });
          break;

        case 'impact':
          this.onImpact(ev);
          break;

        // ---------------------------------------------------- flow
        case 'point': this.onPoint(ev); break;
        case 'over': this.onMatchOver(ev); break;
      }
    }
  }

  powerRGBA(power, alpha) {
    const meta = POWER_META[power] || POWER_META.fire;
    const n = parseInt(meta.color.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  }

  onPowerFired(ev) {
    const R = this.renderer;
    const meta = POWER_META[ev.power];
    audio.play(ev.power === 'multi' ? 'multi' : ev.power, 1);
    audio.duck(0.9, 0.55);
    this.shake(ev.power === 'fire' ? 1.4 : 1);

    if (!this.vfxOn) return;
    R.flash(meta.color, 0.3, 0.26);
    R.ring(ev.x, ev.y, { to: 260, life: 0.5, width: 12, color: this.powerRGBA(ev.power, 'ALPHA') });
    R.burst(ev.x, ev.y, 30, this.powerRGBA(ev.power, 'ALPHA'), 620, {
      glow: true, gravity: ev.power === 'fire' ? -200 : 400,
      shape: ev.power === 'ice' ? 'shard' : 'flame'
    });
    R.popup(ev.x, ev.y - 70, meta.label, { color: meta.glow, size: 52, life: 1.2, shake: 5 });
  }

  /** A ball reaching the sand — a charged one leaves a mark. */
  onImpact(ev) {
    const R = this.renderer;
    if (ev.kind === 'fire') {
      audio.play('fire', 0.8);
      this.shake(1.3);
      if (this.vfxOn) {
        R.flash('#ff7a1a', 0.32, 0.24);
        R.ring(ev.x, ev.y, { to: 240, life: 0.5, width: 12, color: 'rgba(255,140,40,ALPHA)', squash: 0.32 });
        R.burst(ev.x, ev.y, 34, 'rgba(255,150,40,ALPHA)', 520, {
          glow: true, shape: 'flame', gravity: -140, angle: -Math.PI / 2, spread: Math.PI * 1.4
        });
      }
    } else if (ev.kind === 'ice') {
      audio.play('shatter', 0.9);
      this.shake(0.9);
      if (this.vfxOn) {
        R.ring(ev.x, ev.y, { to: 200, life: 0.5, width: 9, color: 'rgba(140,225,255,ALPHA)', squash: 0.32 });
        R.burst(ev.x, ev.y, 26, 'rgba(223,251,255,ALPHA)', 460, { shape: 'shard', glow: true });
      }
    } else if (this.vfxOn) {
      R.burst(ev.x, ev.y, 12, 'rgba(240,215,160,ALPHA)', 260, { angle: -Math.PI / 2, spread: Math.PI });
      R.ring(ev.x, ev.y, { to: 90, life: 0.35, width: 5, color: 'rgba(255,240,200,ALPHA)', squash: 0.3 });
    }
  }

  onPoint(ev) {
    audio.play('point');
    audio.swellCrowd(1, 1.4);
    audio.duck(1.4, 0.45);
    this.shake(0.8);
    const mine = ev.team === TEAM.LEFT;
    this.hud.toast(mine ? 'POINT!' : 'THEY SCORE', 1.3);

    if (this.vfxOn && ev.rally >= 8) {
      this.renderer.popup(VIEW.W / 2, 300, `${ev.rally} HIT RALLY!`, {
        color: '#ffd34d', size: 46, life: 1.4
      });
    }

    if (mine) {
      // The streak is counted first, so the point that starts a run of two is
      // already paid at the higher rate - the pill lights up on the same point
      // the bonus applies to, which is the only reading that is not confusing.
      this.meta.streak += 1;
      this.meta.best = Math.max(this.meta.best, this.meta.streak);
      const mult = coinMultiplier(this.meta.streak);
      this.meta.coins += COINS_PER_POINT * mult;
      if (mult > 1 && this.vfxOn) {
        this.renderer.popup(VIEW.W / 2, 380, `x${mult} COINS`, {
          color: '#ffc31e', size: 40, life: 1.1
        });
      }
      if (this.vfxOn) {
        // confetti from the top of the screen
        for (const c of ['rgba(255,195,30,ALPHA)', 'rgba(47,111,224,ALPHA)', 'rgba(55,194,74,ALPHA)']) {
          this.renderer.burst(VIEW.W * 0.5, 120, 14, c, 520, { gravity: 620, life: 1.2, shape: 'star', size: 4, sizeVar: 6 });
        }
      }
    } else {
      this.meta.streak = 0;
    }
    this.syncMeta();
    this.saveMeta();
  }

  async onMatchOver(ev) {
    const won = ev.team === TEAM.LEFT;
    platform.gameplayStop();
    this.hud.show(false);
    touch.show(false);
    audio.play(won ? 'win' : 'lost', 1);
    audio.swellCrowd(won ? 1.3 : 0.5, 2);
    this.setMusic('menu');

    if (won) {
      this.meta.coins += COINS_PER_WIN;
      this.meta.trophies += 1;
      if (!this.meta.wonOnce) { this.meta.wonOnce = true; platform.reportProgress(100); }
      platform.happytime();
    }
    this.saveMeta();

    const stats = this.match
      ? `Longest rally: ${this.match.longestRally} hits`
      : '';
    const rewardBtn = $('btnReward');
    // Only offer the ad when the portal can actually serve one. On CrazyGames
    // during Basic Launch it cannot, and a button that does nothing is an
    // explicit QA rejection.
    rewardBtn.classList.toggle('hidden', !platform.adsEnabled);
    rewardBtn.textContent = REWARD_LABEL;
    rewardBtn.disabled = false;

    const showResult = () => this.menus.result(won, this.match.score, stats);

    if (this.mode !== 'online') {
      // Ad break between matches, with audio muted while it plays.
      const wasMuted = audio.muted;
      await platform.midgame({
        onStart: () => { audio.muted = true; audio.applyMute(); this.paused = true; },
        onEnd: () => { audio.muted = wasMuted; audio.applyMute(); this.paused = false; }
      });
    }
    showResult();
  }

  // ------------------------------------------------------------ rewarded ad
  /**
   * The one opt-in ad in the game. Every portal doc says the same thing: the
   * player must know an ad is coming before it starts, and the reward is only
   * granted when the ad actually completed — never on a skip or a no-fill.
   */
  async claimRewardedCoins() {
    const btn = $('btnReward');
    btn.disabled = true;
    const wasMuted = audio.muted;
    const granted = await platform.rewarded({
      onStart: () => { audio.muted = true; audio.applyMute(); this.paused = true; },
      onEnd: () => { audio.muted = wasMuted; audio.applyMute(); this.paused = false; }
    });
    if (granted) {
      this.meta.coins += REWARDED_COINS;
      this.syncMeta();
      this.saveMeta();
      btn.textContent = `+${REWARDED_COINS} COINS ADDED!`;
      audio.play('pickup', 0.9);
      setTimeout(() => btn.classList.add('hidden'), 1400);   // one claim per result screen
    } else {
      // No fill, ad blocker, or the player closed it early. Say so and take the
      // offer away, rather than leave a button that looks like it did nothing.
      btn.textContent = 'NO AD AVAILABLE RIGHT NOW';
      setTimeout(() => btn.classList.add('hidden'), 1600);
    }
  }

  // ---------------------------------------------------------------- storage
  async loadMeta() {
    const raw = await platform.getItem('bvc_meta');
    if (raw) { try { Object.assign(this.meta, JSON.parse(raw)); } catch { /* ignore */ } }
  }

  saveMeta() { platform.setItem('bvc_meta', JSON.stringify(this.meta)); }
}

const game = new Game();
window.__bvc = game;   // handy for debugging in the console
game.boot().catch((err) => {
  console.error(err);
  document.getElementById('loadmsg').textContent = 'Something broke while loading. Check the console.';
});
