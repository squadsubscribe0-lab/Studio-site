// Yandex Games.
// Docs: https://yandex.com/dev/games/doc/en/sdk/sdk-about
// Script: https://sdk.games.s3.yandex.net/sdk.js  (must load before YaGames.init)
//
// Yandex is the only target here with real cloud saves for anonymous players
// plus a login prompt, so getItem/setItem route through ysdk.getPlayer() when
// the player is authorised and fall back to localStorage when they are not.
//
// It also wants an explicit "the game finished loading" call — without it the
// portal keeps its own loader on screen over your game.

import { PlatformAdapter } from '../base.js';

export class YandexAdapter extends PlatformAdapter {
  static id = 'yandex';
  static label = 'Yandex Games';

  constructor(options = {}) {
    super(options);
    this.ysdk = null;
    this.player = null;
  }

  async _init() {
    const YaGames = await this.waitForGlobal('YaGames');
    if (!YaGames) { return; }
    try {
      this.ysdk = await YaGames.init();
      this.ready = true;
      this.log('ready', { lang: this.ysdk.environment?.i18n?.lang });

      // Anonymous players get a player object too; only `scopes: false` keeps
      // it from throwing a login dialog in their face on first load.
      try {
        this.player = await this.ysdk.getPlayer({ scopes: false });
      } catch {
        this.log('no player object — saves stay local');
      }
    } catch (e) {
      this.warn('init failed', e);
    }
  }

  loadingStop() {
    try { this.ysdk?.features?.LoadingAPI?.ready(); } catch { /* older SDK */ }
  }

  gameplayStart() {
    try { this.ysdk?.features?.GameplayAPI?.start(); } catch { /* older SDK */ }
  }

  gameplayStop() {
    try { this.ysdk?.features?.GameplayAPI?.stop(); } catch { /* older SDK */ }
  }

  async _midgame(onStart) {
    await new Promise((resolve) => {
      this.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => onStart?.(),
          onClose: () => resolve(),
          onError: () => resolve()
        }
      });
    });
  }

  async _rewarded(onStart, onReward) {
    let granted = false;
    await new Promise((resolve) => {
      this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => onStart?.(),
          onRewarded: () => { granted = true; onReward?.(); },
          onClose: () => resolve(),
          onError: () => resolve()
        }
      });
    });
    return granted;
  }

  async setItem(key, value) {
    await super.setItem(key, value);           // always keep a local copy
    try { await this.player?.setData({ [key]: value }); } catch { /* not logged in */ }
  }

  async getItem(key) {
    try {
      const data = await this.player?.getData([key]);
      if (data && data[key] != null) return data[key];
    } catch { /* not logged in */ }
    return super.getItem(key);
  }
}
