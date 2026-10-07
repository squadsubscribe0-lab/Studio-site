// Poki SDK.
// Docs: https://developers.poki.com/guide/sdk-html5
// Script: https://game-cdn.poki.com/scripts/v2/poki-sdk.js
//
// Poki's model is the inverse of everyone else's: you do NOT decide when an ad
// runs. You call commercialBreak() at every legitimate opportunity and Poki
// picks. So the base-class cooldown is switched off here — throttling on our
// side would only cost us fill.
//
// Poki also has no ad-blocking failure mode we need to special-case: every
// promise resolves whether or not an ad played.

import { PlatformAdapter } from '../base.js';

const sdk = () => window.PokiSDK || null;

export class PokiAdapter extends PlatformAdapter {
  static id = 'poki';
  static label = 'Poki';

  constructor(options = {}) {
    // Poki decides ad frequency; do not second-guess it.
    super({ ...options, midgameCooldownMs: 0 });
  }

  async _init() {
    const s = await this.waitForGlobal('PokiSDK');
    if (!s) { return; }
    if (this.options.debug) { try { s.setDebug(true); } catch { /* older SDK */ } }
    try {
      await s.init();
      this.ready = true;
      this.log('ready');
    } catch {
      // Poki explicitly tells you to start the game anyway when init rejects.
      this.ready = true;
      this.log('init rejected — continuing, ads may not serve');
    }
  }

  loadingStart() { /* Poki has no start signal; timing begins at page load */ }
  loadingStop() { this.ready && sdk()?.gameLoadingFinished(); }
  gameplayStart() { this.ready && sdk()?.gameplayStart(); }
  gameplayStop() { this.ready && sdk()?.gameplayStop(); }

  getInviteParam(key) {
    if (this.ready && sdk()?.getURLParam) {
      try { return sdk().getURLParam(key) || super.getInviteParam(key); } catch { /* fall through */ }
    }
    return super.getInviteParam(key);
  }

  inviteLink(params) {
    // shareableURL is async, so it cannot satisfy this synchronous call. The
    // plain URL still works — Poki preserves query params on the game frame.
    return super.inviteLink(params);
  }

  async _midgame(onStart) {
    // The callback fires only if an ad actually starts; the promise always
    // resolves, so the caller's onEnd is safe either way.
    await sdk().commercialBreak(() => onStart?.());
  }

  async _rewarded(onStart, onReward) {
    const success = await sdk().rewardedBreak(() => onStart?.());
    if (success) onReward?.();
    return !!success;
  }
}
