// Thin wrapper around the CrazyGames HTML5 v3 SDK.
// Everything degrades to a no-op when the game runs outside crazygames.com,
// so local development and itch/self-hosted builds still work.
//
// Docs: https://docs.crazygames.com/sdk/html5-v3/intro

const sdk = () => (window.CrazyGames && window.CrazyGames.SDK) || null;

class CrazyBridge {
  constructor() {
    this.ready = false;
    this.available = false;
    this.settings = { muteAudio: false, disableChat: false };
    this.onSettingsChanged = () => {};
    this.onJoinRoom = () => {};
    this.adInProgress = false;
    this.midgameCooldown = 0;
  }

  async init() {
    const s = sdk();
    if (!s) { console.info('[CrazyGames] SDK not present — running standalone'); return; }
    try {
      await s.init();
      this.ready = true;
      this.available = true;
      this.settings = s.game.settings || this.settings;

      s.game.addSettingsChangeListener((next) => {
        this.settings = next;
        this.onSettingsChanged(next);
      });
      s.game.addJoinRoomListener((params) => this.onJoinRoom(params));

      console.info('[CrazyGames] SDK ready', {
        instantMultiplayer: s.game.isInstantMultiplayer,
        inviteParams: s.game.inviteParams
      });
    } catch (e) {
      console.warn('[CrazyGames] init failed', e);
    }
  }

  // ---- loading + session signals (required by the CrazyGames checklist)
  loadingStart() { this.ready && sdk().game.loadingStart(); }
  loadingStop() { this.ready && sdk().game.loadingStop(); }
  gameplayStart() { this.ready && sdk().game.gameplayStart(); }
  gameplayStop() { this.ready && sdk().game.gameplayStop(); }
  happytime() { this.ready && sdk().game.happytime(); }

  setContext(obj) { this.ready && sdk().game.setGameContext(obj); }
  clearContext() { this.ready && sdk().game.clearGameContext(); }
  reportProgress(pct) { this.ready && sdk().game.reportGameCompletedPercentage(pct); }

  get isInstantMultiplayer() { return this.ready ? !!sdk().game.isInstantMultiplayer : false; }
  getInviteParam(key) { return this.ready ? sdk().game.getInviteParam(key) : new URLSearchParams(location.search).get(key); }

  // ---- multiplayer room state, so friends can join from the platform
  updateRoom(data) { this.ready && sdk().game.updateRoom(data); }
  leftRoom() { this.ready && sdk().game.leftRoom(); }

  inviteLink(params) {
    if (this.ready) return sdk().game.inviteLink(params);
    const url = new URL(location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
  }

  // ---- ads
  /**
   * Midgame ad. Callers must mute audio and pause on start, and resume on
   * finish/error — that is handled by the callbacks passed in from main.js.
   */
  async midgame({ onStart, onEnd }) {
    if (!this.ready || this.adInProgress) { onEnd?.(); return; }
    if (performance.now() < this.midgameCooldown) { onEnd?.(); return; }
    this.adInProgress = true;
    this.midgameCooldown = performance.now() + 120000; // never more than one ad per 2 min
    try {
      await sdk().ad.requestAd('midgame', {
        adStarted: () => onStart?.(),
        adFinished: () => {},
        adError: () => {}
      });
    } catch (e) {
      console.warn('[CrazyGames] midgame ad failed', e);
    } finally {
      this.adInProgress = false;
      onEnd?.();
    }
  }

  async rewarded({ onStart, onReward, onEnd }) {
    if (!this.ready || this.adInProgress) { onEnd?.(); return false; }
    this.adInProgress = true;
    let rewarded = false;
    try {
      await sdk().ad.requestAd('rewarded', {
        adStarted: () => onStart?.(),
        adFinished: () => { rewarded = true; onReward?.(); },
        adError: () => {}
      });
    } catch (e) {
      console.warn('[CrazyGames] rewarded ad failed', e);
    } finally {
      this.adInProgress = false;
      onEnd?.();
    }
    return rewarded;
  }

  // ---- cloud/local save
  async setItem(key, value) {
    try {
      if (this.ready && sdk().data) sdk().data.setItem(key, value);
      else localStorage.setItem(key, value);
    } catch { /* storage blocked */ }
  }

  async getItem(key) {
    try {
      if (this.ready && sdk().data) return sdk().data.getItem(key);
      return localStorage.getItem(key);
    } catch { return null; }
  }
}

export const crazy = new CrazyBridge();
