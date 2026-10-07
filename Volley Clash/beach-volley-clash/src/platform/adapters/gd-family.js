// Shared implementation for the two Azerion-lineage SDKs, which are the same
// codebase under different names and CDNs:
//
//   GameDistribution  window.GD_OPTIONS  https://html5.api.gamedistribution.com/main.min.js
//   GameMonetize      window.SDK_OPTIONS https://api.gamemonetize.com/sdk.js
//
// Both are event-driven: you hand them an onEvent callback at script-load time
// and they push SDK_READY / SDK_GAME_PAUSE / SDK_GAME_START at you. The build
// step writes the options object into index.html *before* the SDK script tag,
// which is why init() here only waits for the ready event rather than creating
// the options itself.
//
// Ad flow quirk that bites people: SDK_GAME_PAUSE means "mute and freeze right
// now", SDK_GAME_START means "you may resume". showAd() resolves/rejects too,
// but the events are what the portal actually audits, so we honour both.

import { PlatformAdapter } from '../base.js';

export class GdFamilyAdapter extends PlatformAdapter {
  /** @protected — name of the global the SDK instance lands on. */
  static instanceGlobal = 'gdsdk';
  /** @protected — name of the options object the page defines. */
  static optionsGlobal = 'GD_OPTIONS';

  constructor(options = {}) {
    super(options);
    this._pauseHooks = { onStart: null, onEnd: null };
    this._rewardedComplete = false;
    this._rewardedPreloaded = false;
  }

  get sdk() { return window[this.constructor.instanceGlobal] || null; }

  async _init() {
    const opts = window[this.constructor.optionsGlobal];
    if (!opts) {
      this.warn(`${this.constructor.optionsGlobal} missing — build the game with the platform builder`);
      return;
    }
    if (!opts.gameId || /^\[/.test(String(opts.gameId))) {
      this.warn('gameId is not set for this build — ads will not serve');
    }

    // The page-level onEvent was installed by the build step and simply
    // forwards here, so listeners survive however late this module runs.
    opts.__forward = (event) => this._onEvent(event);
    (opts.__buffered || []).forEach((event) => this._onEvent(event));
    opts.__buffered = [];

    const instance = await this.waitForGlobal(this.constructor.instanceGlobal);
    if (!instance) { return; }
    this.ready = true;
    this.log('ready');

    // Rewarded needs an explicit preload, and the flag has to be enabled on
    // the developer dashboard or the request is refused.
    this._preloadRewarded();
  }

  _onEvent(event) {
    const name = event?.name || event;
    switch (name) {
      case 'SDK_GAME_PAUSE':
        this._pauseHooks.onStart?.();
        break;
      case 'SDK_GAME_START':
        this._pauseHooks.onEnd?.();
        break;
      case 'SDK_REWARDED_WATCH_COMPLETE':
        this._rewardedComplete = true;
        break;
      default:
        break;
    }
  }

  _preloadRewarded() {
    try {
      this.sdk?.preloadAd?.('rewarded')
        .then(() => { this._rewardedPreloaded = true; })
        .catch(() => { this._rewardedPreloaded = false; });
    } catch { /* older SDK build without preloadAd */ }
  }

  async _midgame(onStart) {
    let resumed = false;
    const resume = () => { resumed = true; };
    this._pauseHooks = { onStart: () => onStart?.(), onEnd: resume };
    try {
      await this.sdk.showAd();
    } finally {
      this._pauseHooks = { onStart: null, onEnd: null };
      // If SDK_GAME_START never arrived the caller still gets unblocked by the
      // base class's onEnd — this only records that the portal went quiet.
      if (!resumed) this.log('no SDK_GAME_START after interstitial');
    }
  }

  async _rewarded(onStart, onReward) {
    this._rewardedComplete = false;
    this._pauseHooks = { onStart: () => onStart?.(), onEnd: null };
    try {
      await this.sdk.showAd('rewarded');
    } finally {
      this._pauseHooks = { onStart: null, onEnd: null };
      this._preloadRewarded();
    }
    if (this._rewardedComplete) onReward?.();
    return this._rewardedComplete;
  }
}
