// GamePix.
// Partner docs: https://partners.gamepix.com/developers
// Public dev library: https://gamepix.blob.core.windows.net/gpxlib/dev/gamepix.js
//
// GamePix has shipped two different API shapes on the same `window.GamePix`
// global and both are still in the wild, so everything here is feature-detected:
//
//   legacy   GamePix.game.gameLoaded(cb) · GamePix.game.ping(hook, obj)
//            GamePix.on.pause / on.resume / on.soundOff / on.soundOn  (callbacks
//            *we* assign; GamePix invokes them)
//   current  GamePix.interstitialAd() · GamePix.rewardAd() · happyMoment()
//            gameLoadingFinished() · updateScore/updateLevel · set/getItem
//
// The dev library above is a stub that draws a placeholder and resolves — the
// real ad-serving build is the per-game snippet from your dashboard. Point
// platforms.json at that snippet before shipping; this file needs no change.

import { PlatformAdapter } from '../base.js';

export class GamePixAdapter extends PlatformAdapter {
  static id = 'gamepix';
  static label = 'GamePix';

  get sdk() { return window.GamePix || null; }

  async _init() {
    const s = await this.waitForGlobal('GamePix');
    if (!s) { return; }
    this.ready = true;
    this.log('ready', { api: s.interstitialAd ? 'current' : 'legacy' });

    // The portal can pause us itself (its own overlay, a hidden tab). Route it
    // through the same mute path the platform-settings listener uses.
    const mute = (on) => this.onSettingsChanged({ ...this.settings, muteAudio: on });
    if (s.on && typeof s.on === 'object') {
      s.on.pause = () => mute(true);
      s.on.resume = () => mute(false);
      s.on.soundOff = () => mute(true);
      s.on.soundOn = () => mute(false);
    }
  }

  loadingStop() {
    const s = this.sdk;
    try {
      if (s?.gameLoadingFinished) s.gameLoadingFinished();
      else s?.game?.gameLoaded?.(() => {});
    } catch { /* optional */ }
  }

  happytime() {
    const s = this.sdk;
    try {
      if (s?.happyMoment) s.happyMoment();
      else s?.game?.ping?.(s.Hooks?.Rewards ?? 'Rewards', {});
    } catch { /* optional */ }
  }

  reportProgress(pct) {
    try { this.sdk?.updateLevel?.(Math.round(pct)); } catch { /* optional */ }
  }

  async _midgame(onStart) {
    const s = this.sdk;
    if (s?.interstitialAd) {
      onStart?.();
      await s.interstitialAd();
      return;
    }
    // Legacy: ping() shows the break and calls the on.pause/on.resume hooks
    // we registered above, so onStart is redundant but kept for symmetry.
    if (s?.game?.ping) {
      onStart?.();
      s.game.ping(s.Hooks?.Video ?? 'VIDEO', {});
      await new Promise((r) => setTimeout(r, 6000));
    }
  }

  async _rewarded(onStart, onReward) {
    const s = this.sdk;
    if (!s?.rewardAd) return false;   // legacy library has no rewarded slot
    onStart?.();
    const res = await s.rewardAd();
    // Older builds resolve with a boolean, newer ones with { status: true }.
    const granted = res === true || res?.status === true || res?.success === true;
    if (granted) onReward?.();
    return granted;
  }

  async setItem(key, value) {
    await super.setItem(key, value);
    const s = this.sdk;
    try { await (s?.setItem ?? s?.data?.setItem)?.call(s, key, value); } catch { /* optional */ }
  }

  async getItem(key) {
    const s = this.sdk;
    try {
      const v = await (s?.getItem ?? s?.data?.getItem)?.call(s, key);
      if (v != null) return v;
    } catch { /* optional */ }
    return super.getItem(key);
  }
}
