// Monetag — for the build that runs on your own domain (Netlify, Cloudflare
// Pages, a VPS, anywhere you control).
//
// Docs:   https://docs.monetag.com/docs/sdk-reference/
// Script: <script src="https://<your-sdk-domain>/sdk.js"
//                 data-zone="123456" data-sdk="show_123456"></script>
//
// Monetag is two different products and the difference matters here:
//
//   Website tags (popunder / vignette / push / in-page push)
//       Pasted once, fire on their own schedule. No JS API, no callback, and
//       nothing for a game to call. They monetize whether or not this adapter
//       does anything, so they are not wired in below.
//
//   The SDK (show_XXX)
//       Promise-based, on-demand, and the only Monetag surface that can tell
//       us a player finished watching — which is what the rewarded button on
//       the result screen needs. Monetag documents it for Telegram Mini Apps;
//       on a plain website it may simply not be there or not fill.
//
// So `ready` is set only when the SDK global actually exists. If it does not,
// every ad call stays a no-op, the rewarded button hides itself (main.js keys
// that off `platform.ready`), and any page-level tag you pasted keeps earning
// on its own. No dead button, no broken promise.

import { PlatformAdapter } from '../base.js';

export class MonetagAdapter extends PlatformAdapter {
  static id = 'selfhost';
  static label = 'Self-hosted / Netlify (Monetag)';

  get handler() {
    const zone = this.options.zoneId;
    return zone ? window['show_' + zone] : null;
  }

  async _init() {
    const zone = this.options.zoneId;
    if (!zone) {
      this.log('no Monetag zone configured — running ad-free');
      return;
    }

    const fn = await this.waitForGlobal('show_' + zone);
    if (typeof fn !== 'function') {
      this.log('Monetag SDK not present — page-level tags (if any) still run');
      return;
    }
    this.ready = true;
    this.log('ready', { zone });

    // Automatic interstitials, configured once. Monetag handles the timing
    // from here, which is why _midgame below does not ask for one: two
    // schedules fighting over the same player is how you get an ad on top of
    // an ad. Capping is deliberately gentle — this is a game people are meant
    // to come back to.
    const s = this.options.inAppSettings;
    if (s) {
      try {
        this.handler({ type: 'inApp', inAppSettings: s });
      } catch (e) {
        this.warn('in-app interstitial setup failed', e);
      }
    }
  }

  /**
   * Deliberately empty. Monetag's in-app interstitial runs on its own capping
   * schedule (set in _init), so the game asking for one at every match end
   * would double up. The base class still calls onEnd, so the match-over flow
   * is unchanged.
   */
  async _midgame(_onStart) {}

  async _rewarded(onStart, onReward) {
    onStart?.();
    // Resolves once the player has watched; rejects on skip, no-fill or error.
    // `reward_event_type` describes whether the impression was monetizable,
    // not whether it was watched, so it must not gate the in-game reward.
    const res = await this.handler({ type: 'end' });
    onReward?.();
    this.log('rewarded complete', { valued: res?.reward_event_type });
    return true;
  }
}
