// Y8 (minimal SDK 2.0 + AFP ads).
// Docs: https://developer.y8.com/  ·  https://github.com/Y8Games/y8-afp-ads-sdk-javascript
// Script: https://cdn.y8.com/minimal-sdk/2-0/y8.min.js  (loaded async)
//
// Y8's bootstrap is event-driven and fires exactly once: you must subscribe to
// "y8sdk.ready" *before* the script finishes loading. The build step therefore
// installs a tiny page-level shim that latches the event, and init() below
// reads the latch rather than racing it.
//
// Ads are Google AFP under the hood, so both interstitial and rewarded go
// through the same showAd() call, distinguished by `type`.

import { PlatformAdapter } from '../base.js';

export class Y8Adapter extends PlatformAdapter {
  static id = 'y8';
  static label = 'Y8';

  constructor(options = {}) {
    super(options);
    this.y8Sdk = null;
  }

  async _init() {
    // __y8Ready is the promise installed by the build-time shim in index.html.
    const gate = window.__y8Ready;
    if (!gate) { this.warn('ready-shim missing — build the game with the platform builder'); return; }

    const y8 = await Promise.race([
      gate,
      new Promise((r) => setTimeout(() => r(null), 8000))
    ]);
    if (!y8) { return; }

    try {
      this.y8Sdk = y8.sdk();
      await new Promise((resolve) => {
        let settled = false;
        const done = () => { if (!settled) { settled = true; resolve(); } };
        this.y8Sdk.init(
          { appId: this.options.appId, autoLogin: false },
          {
            gameId: this.options.gameId,
            preloadAdBreaks: 'auto',
            sound: 'on',
            onReady: done
          }
        );
        setTimeout(done, 5000);   // onReady is not guaranteed to fire
      });
      this.ready = true;
      this.log('ready');
    } catch (e) {
      this.warn('init failed', e);
    }
  }

  async _midgame(onStart) {
    await this.y8Sdk.showAd({
      type: 'next',
      name: 'between-matches',
      beforeAd: () => onStart?.(),
      afterAd: () => {},
      adDismissed: () => {},
      adViewed: () => {}
    });
  }

  async _rewarded(onStart, onReward) {
    let granted = false;
    await this.y8Sdk.showAd({
      type: 'reward',
      name: 'reward',
      // AFP hands us a function and waits for us to call it, which is where a
      // "watch an ad?" confirmation would go. The caller already confirmed.
      beforeReward: (showAdFn) => { onStart?.(); showAdFn(); },
      adViewed: () => { granted = true; onReward?.(); },
      adDismissed: () => {}
    });
    return granted;
  }
}
