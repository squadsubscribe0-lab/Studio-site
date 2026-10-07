import { VIEW, PHYS, RULES, TEAM, POWERS, AUDIO, NET_CONFIG } from './config.js';
import { initInput, readInput, onKey, endFrame, clearKeys, EMPTY_INPUT } from './core/input.js';
import { audio } from './core/audio.js';
import { loadAllAssets } from './core/assets.js';
import { Match, STATE } from './game/match.js';
import { POWER_META } from './game/powers.js';
import { Renderer } from './game/renderer.js';
import { HUD } from './ui/hud.js';
import { Menus } from './ui/menus.js';
import { crazy } from './net/crazy.js';
import { net } from './net/netclient.js';

const TUTORIAL = [
  { tag: 'LESSON 1', title: 'MOVE', body: 'Use A and D to run along your side of the sand.' },
  { tag: 'LESSON 2', title: 'JUMP', body: 'Press W to jump. Release early for a shorter hop.' },
  { tag: 'LESSON 3', title: 'SPIKE', body: 'Press S in the air to smash the ball down at the opponent.' },
  { tag: 'LESSON 4', title: 'DIVE', body: 'Press S on the ground to dive for a ball you cannot reach.' },
  { tag: 'LESSON 5', title: 'SUPER THROWS', body: 'Hit a glowing orb with the ball to charge a super throw!' }
];

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.overlay = document.getElementById('overlay');
    this.match = null;
    this.paused = false;
    this.mode = 'ai';
    this.selection = { character: null, ball: null };
    this.meta = {
      coins: 525, streak: 0, best: 0, trophies: 0, tutorialDone: false,
      volMaster: AUDIO.master, volMusic: AUDIO.music, volSfx: AUDIO.sfx,
      shake: 1, vfx: true
    };
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.tutorialStep = 0;
    this.netAccum = 0;
    this.musicMood = null;
  }

  async boot() {
    initInput();
    this.hud = new HUD();
    this.menus = new Menus(this);
    // Size the overlay before anything loads, otherwise the loading screen
    // renders into a zero-sized box and the player stares at an empty page.
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.menus.show('loading');

    crazy.onSettingsChanged = (s) => {
      audio.platformMuted = !!s.muteAudio;
      audio.applyMute();
      this.hud.setAudioLabel(!audio.isMuted);
    };

    await crazy.init();
    // loadingStart has to come *after* init: every SDK wrapper method is
    // guarded on `ready`, so calling it first was silently a no-op and the
    // platform only ever saw the matching loadingStop.
    crazy.loadingStart();
    audio.platformMuted = !!crazy.settings.muteAudio;

    this.assets = await loadAllAssets((v, msg) => this.menus.progress(v, msg));
    this.menus.progress(0.92, 'Tuning the sound system…');
    await audio.load();

    this.selection.character = this.assets.characters[0];
    this.selection.ball = this.assets.balls[0];

    this.renderer = new Renderer(this.canvas, this.assets);
    this.resize();

    await this.loadMeta();
    this.applySettings();
    this.hud.setMeta(this.meta);
    this.hud.setAudioLabel(!audio.isMuted);

    this.wireUI();
    this.wireNet();

    this.menus.progress(1, 'Ready');
    crazy.loadingStop();

    // Someone arriving from an invite link or the platform's "join" button
    // should land straight in the online lobby.
    const invitedRoom = crazy.getInviteParam('room');
    if (invitedRoom) {
      this.menus.show('online');
      document.getElementById('netRoom').value = invitedRoom;
      this.joinRoom(invitedRoom);
    } else if (crazy.isInstantMultiplayer) {
      this.menus.show('online');
      this.createRoom();
    } else {
      this.menus.show('menu');
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
      // Every HUD size is in em, so one font-size scales the whole overlay.
      fontSize: (16 * r.scale) + 'px'
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
    $('btnRestart').addEventListener('click', () => { this.setPaused(false); this.startMatch(this.lastConfig); });
    $('btnQuit').addEventListener('click', () => this.quitToMenu());
    $('btnAgain').addEventListener('click', () => this.startMatch(this.lastConfig));
    $('btnMenu').addEventListener('click', () => this.quitToMenu());
    $('btnSkip').addEventListener('click', () => { this.tutorialStep = TUTORIAL.length; this.hud.hideBanner(); });

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
      const link = crazy.inviteLink({ room: net.room });
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
    document.querySelectorAll('#overlay button').forEach((b) => {
      b.addEventListener('click', () => audio.play('ui', 0.7));
    });

    onKey((code) => {
      audio.resume();
      if (code === 'KeyP' && this.match && this.menus.current === 'none') this.setPaused(!this.paused);
      if (code === 'Escape' && this.match) this.setPaused(true);
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
      crazy.updateRoom({ roomId: room, isJoinable: peers.length < NET_CONFIG.maxPeers, inviteParams: { room } });
    });

    net.addEventListener('start', (e) => this.startOnlineMatch(e.detail));
    net.addEventListener('neterror', (e) => { status.textContent = e.detail; });
    net.addEventListener('closed', () => { status.textContent = 'Disconnected — the host left the room.'; });

    crazy.onJoinRoom = (params) => {
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
      const name = (document.getElementById('netName').value || 'Player').slice(0, 12);
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

    this.tutorialStep = this.meta.tutorialDone ? TUTORIAL.length : 0;
    this.showTutorialStep();

    crazy.setContext({ mode: cfg.mode, teamSize: String(cfg.teamSize) });
    crazy.gameplayStart();
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
    this.tutorialStep = TUTORIAL.length;
    crazy.gameplayStart();
    this.setMusic('match');
  }

  quitToMenu() {
    this.match = null;
    this.hud.show(false);
    this.hud.hideBanner();
    this.setPaused(false);
    this.menus.show('menu');
    crazy.gameplayStop();
    crazy.clearContext();
    this.setMusic('menu');
    if (this.mode === 'online') { net.leave(); crazy.leftRoom(); }
  }

  setPaused(on) {
    if (this.mode === 'online') return;    // pausing a live online match is not fair
    this.paused = on;
    if (on) { this.menus.show('pause'); crazy.gameplayStop(); audio.duck(2, 0.4); }
    else { this.menus.hideAll(); crazy.gameplayStart(); clearKeys(); }
  }

  showTutorialStep() {
    if (this.tutorialStep >= TUTORIAL.length) { this.hud.hideBanner(); return; }
    const t = TUTORIAL[this.tutorialStep];
    this.hud.banner(t.title, t.body, t.tag);
  }

  // ---------------------------------------------------------------- loop
  frame(now) {
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > PHYS.maxFrameTime) dt = PHYS.maxFrameTime;

    if (this.match && !this.paused) {
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

  get vfxOn() { return this.meta.vfx !== false; }

  handleEvents() {
    const R = this.renderer;
    for (const ev of this.match.drainEvents()) {
      switch (ev.type) {
        // ---------------------------------------------------- contact
        case 'hit':
          audio.play('hit', 0.5 + ev.power * 0.5, 0.9 + ev.power * 0.4);
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 6, 'rgba(255,255,255,ALPHA)', 220);
            R.ring(ev.x, ev.y, { to: 46 + ev.power * 40, life: 0.26, width: 4 });
          }
          this.advanceTutorial('hit');
          break;
        case 'spike':
          audio.play('spike', 1);
          this.shake(1);
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 16, 'rgba(255,220,120,ALPHA)', 420, { glow: true });
            R.ring(ev.x, ev.y, { to: 150, life: 0.35, width: 8, color: 'rgba(255,220,140,ALPHA)' });
          }
          this.advanceTutorial('spike');
          break;
        case 'jump': audio.play('jump', 0.35, 1.1); this.advanceTutorial('jump'); break;
        case 'dive':
          audio.play('dive', 0.6);
          if (this.vfxOn) R.burst(ev.player.x, ev.player.y, 10, 'rgba(240,215,160,ALPHA)', 260);
          this.advanceTutorial('dive');
          break;
        case 'land':
          audio.play('land', 0.3);
          if (this.vfxOn) R.burst(ev.player.x, ev.player.y, 5, 'rgba(240,215,160,ALPHA)', 180);
          break;
        case 'net': audio.play('net', 0.7); break;
        case 'wall': audio.play('wall', 0.5); break;
        case 'whistle': audio.play('whistle', 0.5); break;

        // ---------------------------------------------------- powers
        case 'orbSpawn':
          audio.play('orb', 0.7);
          if (this.vfxOn) {
            R.ring(ev.x, ev.y, {
              to: 120, life: 0.5, width: 5,
              color: this.powerRGBA(ev.power, 'ALPHA')
            });
          }
          break;

        case 'orbTaken': {
          const meta = POWER_META[ev.power];
          audio.play('pickup', 1);
          this.shake(0.5);
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 26, this.powerRGBA(ev.power, 'ALPHA'), 460, { glow: true, shape: 'star', gravity: 200 });
            R.ring(ev.x, ev.y, { to: 200, life: 0.5, width: 9, color: this.powerRGBA(ev.power, 'ALPHA') });
            R.popup(ev.x, ev.y - 40, meta.label, { color: meta.glow, size: 40, life: 1.0 });
          }
          break;
        }

        case 'powerGained':
          this.advanceTutorial('power');
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
          audio.play('freeze', 0.9);
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 20, 'rgba(200,244,255,ALPHA)', 300, { shape: 'shard', glow: true });
            R.ring(ev.x, ev.y, { to: 130, life: 0.45, width: 7, color: 'rgba(120,220,255,ALPHA)' });
          }
          break;

        case 'unfreeze':
          audio.play('shatter', 0.8);
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 26, 'rgba(223,251,255,ALPHA)', 420, { shape: 'shard', gravity: 1400 });
          }
          break;

        case 'scorched':
          audio.play('burn', 0.7);
          if (this.vfxOn) {
            R.burst(ev.x, ev.y, 14, 'rgba(255,140,40,ALPHA)', 260, { glow: true, shape: 'flame', gravity: -180 });
          }
          break;

        case 'multiStart':
          audio.play('multi', 1);
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

  advanceTutorial(action) {
    if (this.tutorialStep >= TUTORIAL.length) return;
    const map = ['hit', 'jump', 'spike', 'dive', 'power'];
    if (map[this.tutorialStep] === action || (this.tutorialStep === 0 && action === 'hit')) {
      this.tutorialStep++;
      this.showTutorialStep();
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
      this.meta.coins += 15;
      this.meta.streak += 1;
      this.meta.best = Math.max(this.meta.best, this.meta.streak);
      if (this.vfxOn) {
        // confetti from the top of the screen
        for (const c of ['rgba(255,195,30,ALPHA)', 'rgba(47,111,224,ALPHA)', 'rgba(55,194,74,ALPHA)']) {
          this.renderer.burst(VIEW.W * 0.5, 120, 14, c, 520, { gravity: 620, life: 1.2, shape: 'star', size: 4, sizeVar: 6 });
        }
      }
    } else {
      this.meta.streak = 0;
    }
    this.hud.setMeta(this.meta);
    this.saveMeta();
  }

  async onMatchOver(ev) {
    const won = ev.team === TEAM.LEFT;
    crazy.gameplayStop();
    this.hud.show(false);
    audio.play(won ? 'win' : 'lost', 1);
    audio.swellCrowd(won ? 1.3 : 0.5, 2);
    this.setMusic('menu');

    if (won) {
      this.meta.coins += 100;
      this.meta.trophies += 1;
      if (!this.meta.tutorialDone) { this.meta.tutorialDone = true; crazy.reportProgress(100); }
      crazy.happytime();
    }
    this.saveMeta();

    const stats = this.match
      ? `Longest rally: ${this.match.longestRally} hits`
      : '';
    const showResult = () => this.menus.result(won, this.match.score, stats);

    if (this.mode !== 'online') {
      // Ad break between matches, with audio muted while it plays.
      const wasMuted = audio.muted;
      await crazy.midgame({
        onStart: () => { audio.muted = true; audio.applyMute(); this.paused = true; },
        onEnd: () => { audio.muted = wasMuted; audio.applyMute(); this.paused = false; }
      });
    }
    showResult();
  }

  // ---------------------------------------------------------------- storage
  async loadMeta() {
    const raw = await crazy.getItem('bvc_meta');
    if (raw) { try { Object.assign(this.meta, JSON.parse(raw)); } catch { /* ignore */ } }
  }

  saveMeta() { crazy.setItem('bvc_meta', JSON.stringify(this.meta)); }
}

const game = new Game();
window.__bvc = game;   // handy for debugging in the console
game.boot().catch((err) => {
  console.error(err);
  document.getElementById('loadmsg').textContent = 'Something broke while loading. Check the console.';
});
