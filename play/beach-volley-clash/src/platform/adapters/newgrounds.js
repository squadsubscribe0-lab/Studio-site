// Newgrounds.
//
// Newgrounds has no ad SDK you embed: the site wraps your game and serves its
// own pre-roll around it, and the revenue share is on that wrapper. What their
// API *does* give you is medals, scoreboards and cloud saves, all through
// newgrounds.io with an app id and a session.
//
// This adapter therefore runs the game exactly as standalone but adds the two
// signals worth having: a medal unlock on the first win, and scoreboard posts.
// Both are best-effort HTTP calls with no SDK dependency, so nothing is
// bundled and nothing breaks when the ids are left blank.
//
// Docs: https://www.newgrounds.io/help/

import { PlatformAdapter } from '../base.js';

const GATEWAY = 'https://www.newgrounds.io/gateway_v3.php';

export class NewgroundsAdapter extends PlatformAdapter {
  static id = 'newgrounds';
  static label = 'Newgrounds';

  constructor(options = {}) {
    super(options);
    this.sessionId = null;
  }

  async _init() {
    this.sessionId = this.getInviteParam('ngio_session_id');
    if (!this.options.appId) {
      this.log('no appId configured — medals and scoreboards are off');
      return;
    }
    // No SDK to wait for; the gateway is plain HTTP. `ready` stays false
    // because there are still no ads to request on this platform.
    this.log('ready', { session: !!this.sessionId });
  }

  /** @private best-effort gateway call; failures are silent by design. */
  async _call(component, parameters) {
    if (!this.options.appId) return null;
    try {
      const body = new FormData();
      body.append('input', JSON.stringify({
        app_id: this.options.appId,
        session_id: this.sessionId,
        call: { component, parameters }
      }));
      const res = await fetch(GATEWAY, { method: 'POST', body });
      return await res.json();
    } catch {
      return null;
    }
  }

  happytime() {
    if (this.options.medalId) this._call('Medal.unlock', { id: Number(this.options.medalId) });
  }

  reportProgress(pct) {
    if (this.options.scoreboardId) {
      this._call('ScoreBoard.postScore', {
        id: Number(this.options.scoreboardId),
        value: Math.round(pct)
      });
    }
  }
}
