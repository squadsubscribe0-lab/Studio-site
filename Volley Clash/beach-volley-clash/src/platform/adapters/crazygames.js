// CrazyGames HTML5 SDK v3.
// Docs: https://docs.crazygames.com/sdk/html5-v3/intro
// Script: https://sdk.crazygames.com/crazygames-sdk-v3.js
//
// The richest of the portals we target: it is the only one with a first-class
// multiplayer/invite API, which the online lobby leans on.

import { PlatformAdapter } from '../base.js';

const sdk = () => (window.CrazyGames && window.CrazyGames.SDK) || null;

export class CrazyGamesAdapter extends PlatformAdapter {
  static id = 'crazygames';
  static label = 'CrazyGames';

  async _init() {
    const s = await this.waitForGlobal('CrazyGames').then(() => sdk());
    if (!s) { return; }
    try {
      await s.init();
      this.ready = true;
      this.settings = s.game.settings || this.settings;

      s.game.addSettingsChangeListener((next) => {
        this.settings = next;
        this.onSettingsChanged(next);
      });
      s.game.addJoinRoomListener((params) => this.onJoinRoom(params));

      this.log('ready', {
        instantMultiplayer: s.game.isInstantMultiplayer,
        inviteParams: s.game.inviteParams
      });
    } catch (e) {
      this.warn('init failed', e);
    }
  }

  loadingStart() { this.ready && sdk().game.loadingStart(); }
  loadingStop() { this.ready && sdk().game.loadingStop(); }
  gameplayStart() { this.ready && sdk().game.gameplayStart(); }
  gameplayStop() { this.ready && sdk().game.gameplayStop(); }
  happytime() { this.ready && sdk().game.happytime(); }

  setContext(obj) { this.ready && sdk().game.setGameContext(obj); }
  clearContext() { this.ready && sdk().game.clearGameContext(); }
  reportProgress(pct) { this.ready && sdk().game.reportGameCompletedPercentage(pct); }

  get isInstantMultiplayer() { return this.ready ? !!sdk().game.isInstantMultiplayer : false; }

  getInviteParam(key) {
    return this.ready ? sdk().game.getInviteParam(key) : super.getInviteParam(key);
  }

  inviteLink(params) {
    return this.ready ? sdk().game.inviteLink(params) : super.inviteLink(params);
  }

  updateRoom(data) { this.ready && sdk().game.updateRoom(data); }
  leftRoom() { this.ready && sdk().game.leftRoom(); }

  /**
   * Ads are off for the whole of Basic Launch, and the SDK has no call that
   * says so up front - the only signal is an `adsDisabledBasicLaunch` error on
   * the first request. So the build says it instead: platforms.json ships
   * `adsEnabled: false` until the game is invited to Full Launch. A reviewer
   * who clicks a rewarded button that can never pay is looking at exactly the
   * "rewarded ad button without effect" the QA checklist rejects.
   */
  get adsEnabled() {
    return super.adsEnabled && this.options.adsEnabled !== false;
  }

  /**
   * requestAd() is callback-only - it returns nothing to await. Awaiting it
   * directly resolved on the spot, so the game un-muted and un-paused while the
   * ad was still playing, and a rewarded view came back "not granted" before it
   * had even started. This wraps it in a promise that settles on the SDK's own
   * finish or error callback.
   */
  _requestAd(type, onStart) {
    return new Promise((resolve) => {
      let settled = false;
      const settle = (finished, error) => {
        if (settled) return;
        settled = true;
        if (error?.code === 'adsDisabledBasicLaunch') this.adsDisabled = true;
        resolve(finished);
      };
      try {
        sdk().ad.requestAd(type, {
          adStarted: () => onStart?.(),
          adFinished: () => settle(true),
          adError: (error) => settle(false, error)
        });
      } catch (e) {
        this.warn(`${type} request threw`, e);
        settle(false);
      }
    });
  }

  async _midgame(onStart) {
    await this._requestAd('midgame', onStart);
  }

  async _rewarded(onStart, onReward) {
    const granted = await this._requestAd('rewarded', onStart);
    if (granted) onReward?.();
    return granted;
  }

  /**
   * The signed-in CrazyGames player, or null when nobody is signed in.
   *
   * Their username is what the lobby must show: the portal requires the game to
   * use the CrazyGames account rather than asking the player to type a name of
   * their own, and registered users are meant to be logged in automatically.
   */
  async getUser() {
    if (!this.ready || !sdk().user) return null;
    try {
      const user = await sdk().user.getUser();
      return user ? { name: user.username, avatar: user.profilePictureUrl || null } : null;
    } catch (e) {
      this.warn('getUser failed', e);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      if (this.ready && sdk().data) sdk().data.setItem(key, value);
      else await super.setItem(key, value);
    } catch { /* storage blocked */ }
  }

  async getItem(key) {
    try {
      if (this.ready && sdk().data) return sdk().data.getItem(key);
      return await super.getItem(key);
    } catch { return null; }
  }
}
