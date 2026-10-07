// Lagged (DAB3 Games). AdSense revenue share.
// Docs: https://lagged.dev/sdk
// Script: https://lagged.com/api/rev-share/lagged.js
//
// Two things about Lagged's rewarded flow are unusual and are handled here:
//   1. Availability and playback are separate steps. GEvents.reward() first
//      tells you *whether* an ad can be shown and hands back the function that
//      actually shows it — you are expected to hang that off a button.
//      We already gate on a player action, so we invoke it immediately.
//   2. Interstitials take a completion callback rather than returning a
//      promise, and it is not called at all when no ad was available, so the
//      wrapper races it against a timeout.

import { PlatformAdapter } from '../base.js';

export class LaggedAdapter extends PlatformAdapter {
  static id = 'lagged';
  static label = 'Lagged';

  get api() { return window.LaggedAPI || null; }

  async _init() {
    const api = await this.waitForGlobal('LaggedAPI');
    if (!api) { return; }
    const { devId, publisherId } = this.options;
    if (!devId || !publisherId) {
      this.warn('devId/publisherId not set for this build — ads will not serve');
    }
    try {
      api.init(devId, publisherId);
      this.ready = true;
      this.log('ready');
    } catch (e) {
      this.warn('init failed', e);
    }
  }

  async _midgame(onStart) {
    onStart?.();
    await new Promise((resolve) => {
      let settled = false;
      const done = () => { if (!settled) { settled = true; resolve(); } };
      try { this.api.APIAds.show(done); } catch { done(); }
      setTimeout(done, 45000);  // no callback fires when there is no fill
    });
  }

  async _rewarded(onStart, onReward) {
    let granted = false;
    await new Promise((resolve) => {
      let settled = false;
      const done = () => { if (!settled) { settled = true; resolve(); } };
      const available = (ok, showAdFn) => {
        if (!ok || typeof showAdFn !== 'function') { done(); return; }
        onStart?.();
        try { showAdFn(); } catch { done(); }
      };
      const finished = (ok) => {
        if (ok) { granted = true; onReward?.(); }
        done();
      };
      try { this.api.GEvents.reward(available, finished); } catch { done(); }
      setTimeout(done, 60000);
    });
    return granted;
  }
}
