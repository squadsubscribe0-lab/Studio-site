// Thin wrapper around the CrazyGames HTML5 SDK v3. Every call is guarded so the
// game still runs when the SDK is missing (offline, other portals, local file).

let sdk = null;
let ready = false;
let inGameplay = false;
let lastGameplayCall = -Infinity;
const GAMEPLAY_GAP = 1100;
const settingsListeners = [];

export const Sdk = {
  async init() {
    try {
      if (window.CrazyGames && window.CrazyGames.SDK) {
        sdk = window.CrazyGames.SDK;
        await sdk.init();
        ready = true;
        try {
          sdk.game.addSettingsChangeListener?.((s) => settingsListeners.forEach(fn => fn(s)));
        } catch (e) { /* optional */ }
      }
    } catch (e) {
      console.warn('CrazyGames SDK init failed, running standalone', e);
      sdk = null; ready = false;
    }
  },
  get available() { return ready; },
  get environment() { try { return sdk?.environment || 'none'; } catch { return 'none'; } },

  loadingStart() { try { ready && sdk.game.loadingStart(); } catch {} },
  loadingStop()  { try { ready && sdk.game.loadingStop(); } catch {} },
  // The SDK throttles gameplay events closer than 1s apart. Callers poll these every frame,
  // so a skipped transition is simply sent on a later frame once the window has passed.
  gameplayStart() {
    if (inGameplay || performance.now() - lastGameplayCall < GAMEPLAY_GAP) return;
    inGameplay = true; lastGameplayCall = performance.now();
    try { ready && sdk.game.gameplayStart(); } catch {}
  },
  gameplayStop() {
    if (!inGameplay || performance.now() - lastGameplayCall < GAMEPLAY_GAP) return;
    inGameplay = false; lastGameplayCall = performance.now();
    try { ready && sdk.game.gameplayStop(); } catch {}
  },
  happytime() { try { ready && sdk.game.happytime(); } catch {} },

  get muteAudio() { try { return !!(ready && sdk.game.settings?.muteAudio); } catch { return false; } },
  onSettings(fn) { settingsListeners.push(fn); },

  // True when ads can't be shown (adblocker, or the SDK script itself was blocked).
  async hasAdblock() {
    if (!ready) return true;
    try { return !!(await sdk.ad.hasAdblock()); } catch { return false; }
  },

  // Resolves true only when a rewarded ad finished (never on adError, per CrazyGames rules).
  // Calls onStart/onEnd so the game can pause, mute and block input around the ad.
  rewarded(hooks = {}) {
    return new Promise((resolve) => {
      if (!ready) { resolve(false); return; }
      try {
        sdk.ad.requestAd('rewarded', {
          adStarted: () => hooks.onStart?.(),
          adFinished: () => { hooks.onEnd?.(); resolve(true); },
          adError: (err) => { hooks.onEnd?.(); hooks.onError?.(err); resolve(false); },
        });
      } catch { hooks.onEnd?.(); resolve(false); }
    });
  },

  midgame(hooks = {}) {
    return new Promise((resolve) => {
      if (!ready) { resolve(); return; }
      try {
        sdk.ad.requestAd('midgame', {
          adStarted: () => hooks.onStart?.(),
          adFinished: () => { hooks.onEnd?.(); resolve(); },
          adError: () => { hooks.onEnd?.(); resolve(); },
        });
      } catch { hooks.onEnd?.(); resolve(); }
    });
  },

  // Cloud-synced storage when available (CrazyGames Data module), localStorage otherwise.
  getItem(key) {
    try { if (ready && sdk.data) return sdk.data.getItem(key); } catch {}
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem(key, value) {
    try { if (ready && sdk.data) { sdk.data.setItem(key, value); return; } } catch {}
    try { localStorage.setItem(key, value); } catch {}
  },
};
