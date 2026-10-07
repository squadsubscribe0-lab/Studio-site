/**
 * Portal SDK adapter.
 *
 * Dungeon.io is built once and shipped to many portals; each portal build only
 * swaps the SDK <script> in index.html. This adapter detects which SDK is on
 * the page and maps the game's lifecycle onto it. With no SDK (self-hosted,
 * standalone, local dev) every call is a harmless no-op and rewarded breaks
 * resolve as granted.
 *
 * Supported shapes: CrazyGames SDK v3 (`window.CrazyGames.SDK`) and Poki
 * (`window.PokiSDK`). Check each portal's current docs before release — SDK
 * surfaces change, and some portals require extra calls (e.g. happytime,
 * data saving, or banner handling).
 */
export class Platform {
  constructor() {
    this.name = 'none';
    this.sdk = null;
  }

  async init() {
    try {
      if (window.CrazyGames?.SDK) {
        this.name = 'crazygames';
        this.sdk = window.CrazyGames.SDK;
        await this.sdk.init?.();
      } else if (window.PokiSDK) {
        this.name = 'poki';
        this.sdk = window.PokiSDK;
        await this.sdk.init();
      }
    } catch (err) {
      console.warn('[platform] SDK init failed, continuing without it', err);
      this.name = 'none';
      this.sdk = null;
    }
  }

  loadingDone() {
    try {
      if (this.name === 'crazygames') this.sdk.game?.loadingStop?.();
      if (this.name === 'poki') this.sdk.gameLoadingFinished?.();
    } catch { /* ignore */ }
  }

  gameplayStart() {
    try {
      if (this.name === 'crazygames') this.sdk.game?.gameplayStart?.();
      if (this.name === 'poki') this.sdk.gameplayStart?.();
    } catch { /* ignore */ }
  }

  gameplayStop() {
    try {
      if (this.name === 'crazygames') this.sdk.game?.gameplayStop?.();
      if (this.name === 'poki') this.sdk.gameplayStop?.();
    } catch { /* ignore */ }
  }

  happy() {
    try {
      if (this.name === 'crazygames') this.sdk.game?.happytime?.();
    } catch { /* ignore */ }
  }

  /** Between runs. Resolves when the game may continue. */
  midgame() {
    return new Promise((resolve) => {
      try {
        if (this.name === 'crazygames') {
          this.sdk.ad.requestAd('midgame', { adFinished: resolve, adError: resolve, adStarted: () => {} });
          return;
        }
        if (this.name === 'poki') {
          this.sdk.commercialBreak().then(resolve, resolve);
          return;
        }
      } catch { /* fall through */ }
      resolve();
    });
  }

  /** Revive offer. Resolves true if the reward should be granted. */
  rewarded() {
    return new Promise((resolve) => {
      try {
        if (this.name === 'crazygames') {
          this.sdk.ad.requestAd('rewarded', { adFinished: () => resolve(true), adError: () => resolve(false), adStarted: () => {} });
          return;
        }
        if (this.name === 'poki') {
          this.sdk.rewardedBreak().then((ok) => resolve(!!ok), () => resolve(false));
          return;
        }
      } catch { /* fall through */ }
      resolve(true);
    });
  }
}
