// Playgama Bridge — a meta-adapter.
//
// Bridge is one SDK that fronts ~25 destinations (Playgama itself, VK, OK,
// Telegram/Playdeck, YouTube Playables, Yandex, Crazy Games, MSN and more): it
// sniffs the host, loads that platform's native script and routes calls. One
// build, many stores.
//
// Docs:   https://wiki.playgama.com/playgama/bridge-sdk
// Script: https://bridge.playgama.com/v2/stable/playgama-bridge.js
// Config: playgama-bridge-config.json, next to index.html (the build writes it)
//
// Ads are event-driven, not promise-based: showInterstitial()/showRewarded()
// return immediately and you follow the state machine. `rewarded` is the only
// state that may grant a reward — `closed` fires for skips too.

import { PlatformAdapter } from '../base.js';

export class PlaygamaAdapter extends PlatformAdapter {
  static id = 'playgama';
  static label = 'Playgama Bridge (multi-platform)';

  constructor(options = {}) {
    // Bridge enforces its own minimum interval between interstitials.
    super({ ...options, midgameCooldownMs: 0 });
    this.bridge = null;
  }

  async _init() {
    const bridge = await this.waitForGlobal('bridge');
    if (!bridge) { return; }
    try {
      await bridge.initialize();
      this.bridge = bridge;
      this.ready = true;
      this.log('ready', { platform: bridge.platform?.id });
    } catch (e) {
      this.warn('init failed', e);
    }
  }

  loadingStop() { try { this.bridge?.platform?.sendMessage?.('game_ready'); } catch { /* optional */ } }
  gameplayStart() { try { this.bridge?.platform?.sendMessage?.('gameplay_started'); } catch { /* optional */ } }
  gameplayStop() { try { this.bridge?.platform?.sendMessage?.('gameplay_stopped'); } catch { /* optional */ } }

  /** Wait for an ad state machine to reach a terminal state. */
  _awaitAdState(eventName, terminalStates, onOpen, onState) {
    return new Promise((resolve) => {
      const ad = this.bridge.advertisement;
      let settled = false;
      const finish = () => { if (!settled) { settled = true; ad.off?.(eventName, handler); resolve(); } };
      const handler = (state) => {
        if (state === 'opened') onOpen?.();
        onState?.(state);
        if (terminalStates.includes(state)) finish();
      };
      ad.on(eventName, handler);
      setTimeout(finish, 90000);   // never leave the game paused forever
    });
  }

  async _midgame(onStart) {
    const ad = this.bridge.advertisement;
    if (!ad.isInterstitialSupported) return;
    const done = this._awaitAdState(
      this.bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED,
      ['closed', 'failed'],
      onStart
    );
    ad.showInterstitial(this.options.interstitialPlacement);
    await done;
  }

  async _rewarded(onStart, onReward) {
    const ad = this.bridge.advertisement;
    if (!ad.isRewardedSupported) return false;
    let granted = false;
    const done = this._awaitAdState(
      this.bridge.EVENT_NAME.REWARDED_STATE_CHANGED,
      ['closed', 'failed'],
      onStart,
      (state) => { if (state === 'rewarded') { granted = true; onReward?.(); } }
    );
    ad.showRewarded(this.options.rewardedPlacement);
    await done;
    return granted;
  }

  async setItem(key, value) {
    await super.setItem(key, value);
    try { await this.bridge?.storage?.set?.(key, value); } catch { /* platform has no storage */ }
  }

  async getItem(key) {
    try {
      const v = await this.bridge?.storage?.get?.(key);
      if (v != null) return v;
    } catch { /* platform has no storage */ }
    return super.getItem(key);
  }
}
