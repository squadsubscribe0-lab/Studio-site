// Base platform adapter.
//
// Every portal we ship to gets a subclass in ./adapters. The base class is not
// abstract: on its own it *is* the "standalone" adapter used by itch.io,
// Newgrounds, self-hosting and local development. Everything degrades to a
// no-op or to localStorage, so a build with no SDK still plays exactly the
// same game.
//
// Rules that hold for every adapter:
//   - No method may throw. A portal SDK that is missing, blocked by an ad
//     blocker or broken must never take the game down with it.
//   - Ad methods always call onEnd exactly once, even on failure, because the
//     caller un-pauses the game in that callback.
//   - `init()` resolves even when the SDK never loads.

export class PlatformAdapter {
  /** Portal id, matching the folder name under dist/. */
  static id = 'standalone';
  /** Human name, used in logs and in the build report. */
  static label = 'Standalone / self-hosted';

  constructor(options = {}) {
    this.options = options;
    this.ready = false;               // SDK present *and* initialised
    this.settings = { muteAudio: false, disableChat: false };
    this.onSettingsChanged = () => {};
    this.onJoinRoom = () => {};

    this.adInProgress = false;
    /** Set when the portal reports that it will not serve ads to this game. */
    this.adsDisabled = false;
    this.midgameCooldown = 0;
    /** Minimum gap between interstitials. Portals police this; so do we. */
    this.midgameCooldownMs = options.midgameCooldownMs ?? 120000;
    /** Hard ceiling on SDK start-up, after which we play without it. */
    this.initTimeoutMs = options.initTimeoutMs ?? 10000;
  }

  get id() { return this.constructor.id; }
  get label() { return this.constructor.label; }

  log(...args) { console.info(`[${this.id}]`, ...args); }
  warn(...args) { console.warn(`[${this.id}]`, ...args); }

  /**
   * Wait for a global the portal's script tag defines. Portals load their SDK
   * from their own CDN, so it can land after our modules do — and it can also
   * never land at all when an ad blocker eats it.
   */
  waitForGlobal(name, timeoutMs = 8000) {
    return new Promise((resolve) => {
      if (window[name]) { resolve(window[name]); return; }
      const started = performance.now();
      const tick = () => {
        if (window[name]) { resolve(window[name]); return; }
        if (performance.now() - started > timeoutMs) { resolve(null); return; }
        setTimeout(tick, 60);
      };
      tick();
    });
  }

  /**
   * Bounded SDK start-up. Subclasses implement `_init`; this wrapper is what
   * the game calls.
   *
   * The bound matters: a portal SDK that never settles — off-platform, behind
   * an ad blocker, or mid-outage — would otherwise hold the loading screen
   * forever, because boot awaits this. Timing out just leaves `ready` false,
   * which every other method already treats as "no SDK": the game plays on
   * with ads disabled instead of not playing at all.
   */
  async init() {
    let timer;
    try {
      await Promise.race([
        this._init(),
        new Promise((resolve) => { timer = setTimeout(resolve, this.initTimeoutMs); })
      ]);
    } catch (e) {
      this.warn('init failed', e);
    } finally {
      clearTimeout(timer);
    }
    if (!this.ready) this.warn('no SDK — running standalone');
  }

  /** @protected */
  async _init() {}

  // ---- session signals ---------------------------------------------------
  // Portals use these to decide when it is safe to show an ad and to measure
  // load time. Unimplemented ones are deliberately silent.
  loadingStart() {}
  loadingStop() {}
  gameplayStart() {}
  gameplayStop() {}
  /** "The player just had a good time" — some portals use it to time prompts. */
  happytime() {}
  setContext(_obj) {}
  clearContext() {}
  reportProgress(_pct) {}

  // ---- multiplayer / invites --------------------------------------------
  get isInstantMultiplayer() { return false; }

  getInviteParam(key) {
    try { return new URLSearchParams(location.search).get(key); }
    catch { return null; }
  }

  inviteLink(params) {
    try {
      const url = new URL(location.href);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      return url.toString();
    } catch { return location.href; }
  }

  updateRoom(_data) {}
  leftRoom() {}

  /**
   * The portal's own account, when it has one.
   *
   * CrazyGames requires a game to use the player's CrazyGames username rather
   * than asking them to invent one - a game that runs its own identity beside
   * the portal's is running a second login system, which is not allowed.
   * Returns null where the portal has no account concept, and the game falls
   * back to the name box.
   */
  async getUser() { return null; }

  // ---- ads ---------------------------------------------------------------
  /**
   * Whether this build can serve ads at all. Anything that offers the player
   * an ad - the rewarded button above all - must check this first, because a
   * button that can never pay out is a dead button.
   */
  get adsEnabled() { return this.ready && !this.adsDisabled; }

  /**
   * Shared gate for interstitials. Subclasses implement `_midgame` and get the
   * cooldown, the re-entrancy guard and the guaranteed onEnd for free.
   */
  async midgame({ onStart, onEnd } = {}) {
    if (this.adInProgress) { onEnd?.(); return; }
    if (performance.now() < this.midgameCooldown) { onEnd?.(); return; }
    if (!this.adsEnabled) { onEnd?.(); return; }
    this.adInProgress = true;
    this.midgameCooldown = performance.now() + this.midgameCooldownMs;
    try {
      await this._midgame(onStart);
    } catch (e) {
      this.warn('midgame ad failed', e);
    } finally {
      this.adInProgress = false;
      onEnd?.();
    }
  }

  /**
   * Rewarded video. Resolves true only when the player actually earned it.
   */
  async rewarded({ onStart, onReward, onEnd } = {}) {
    if (this.adInProgress || !this.adsEnabled) { onEnd?.(); return false; }
    this.adInProgress = true;
    let granted = false;
    try {
      granted = await this._rewarded(onStart, onReward);
    } catch (e) {
      this.warn('rewarded ad failed', e);
    } finally {
      this.adInProgress = false;
      onEnd?.();
    }
    return granted;
  }

  /** @protected — no SDK, so nothing to show. */
  async _midgame(_onStart) {}
  /** @protected */
  async _rewarded(_onStart, _onReward) { return false; }

  // ---- storage -----------------------------------------------------------
  // Portals with a player account give us cloud saves; the rest fall through
  // to localStorage. Both are async at the call site so adapters are free to
  // hit the network.
  async setItem(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage blocked */ }
  }

  async getItem(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
}
