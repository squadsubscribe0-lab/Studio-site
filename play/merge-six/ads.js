/* Portal layer: one API for CrazyGames SDK v3, GameDistribution SDK and Playgama Bridge.
   The build script sets window.GAME_CFG = { portal: 'crazygames' | 'gamedistribution' | 'playgama' | 'dev' }.
   'dev' shows fake test ads so every ad flow can be tested locally. */
window.Portal = (() => {
  'use strict';
  const cfg = window.GAME_CFG || {};
  const P = cfg.portal || 'dev';
  const SAVE_KEY = 'mergesix_save_v1';
  const MIN_GAP = (cfg.interstitialGap != null ? cfg.interstitialGap : 45) * 1000;

  let hooks = { pause() {}, resume() {} };
  let adOpen = false;
  let lastInterstitial = -1e12;
  let playing = false;
  let lastHappy = 0;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const withTimeout = (p, ms, fallback) => Promise.race([Promise.resolve(p), sleep(ms).then(() => fallback)]);
  const log = (...a) => console.log('[Portal:' + P + ']', ...a);

  function begin() { if (adOpen) return; adOpen = true; try { hooks.pause(); } catch (e) {} }
  function end() { if (!adOpen) return; adOpen = false; try { hooks.resume(); } catch (e) {} }

  /* ---------------- CrazyGames SDK v3 ---------------- */
  const CG = () => (window.CrazyGames && window.CrazyGames.SDK) || null;
  function cgAd(type) {
    return new Promise(res => {
      let done = false;
      const finish = v => { if (done) return; done = true; end(); res(v); };
      try {
        CG().ad.requestAd(type, {
          adStarted: () => begin(),
          adFinished: () => finish(true),
          adError: err => { log('ad error', err && err.code); finish(false); },
        });
      } catch (e) { finish(false); }
      setTimeout(() => finish(false), 120000);
    });
  }

  /* ---------------- GameDistribution ---------------- */
  let gdReady = false, gdReadyWaiters = [], gdRewardFlag = false;
  window.__gdEvent = ev => {
    if (!ev) return;
    switch (ev.name) {
      case 'SDK_READY': gdReady = true; gdReadyWaiters.forEach(f => f()); gdReadyWaiters = []; break;
      case 'SDK_GAME_PAUSE': begin(); break;
      case 'SDK_GAME_START': end(); break;
      case 'SDK_REWARDED_WATCH_COMPLETE': gdRewardFlag = true; break;
    }
  };
  (window.__gdq || []).forEach(e => window.__gdEvent(e));
  const gd = () => (typeof window.gdsdk !== 'undefined' && window.gdsdk && typeof window.gdsdk.showAd === 'function') ? window.gdsdk : null;
  async function gdShow(type) {
    const sdk = gd(); if (!sdk) return false;
    try {
      const r = type ? sdk.showAd(type) : sdk.showAd();
      if (r && r.then) await withTimeout(r, 120000);
      return true;
    } catch (e) { log('showAd failed', e && e.message); return false; }
    finally { end(); }
  }
  async function gdRewarded() {
    const sdk = gd(); if (!sdk) return false;
    gdRewardFlag = false;
    try { if (typeof sdk.preloadAd === 'function') await withTimeout(sdk.preloadAd('rewarded'), 5000); }
    catch (e) { log('no rewarded fill'); return false; }
    await gdShow('rewarded');
    await sleep(250);
    return gdRewardFlag;
  }

  /* ---------------- Playgama Bridge ---------------- */
  const PG = () => window.bridge || null;
  let pgI = null, pgR = null, pgRewardFlag = false, pgSeen = false;
  function pgInterState(s) {
    pgSeen = true;
    if (s === 'opened') begin();
    if (s === 'closed' || s === 'failed') { end(); if (pgI) { const f = pgI; pgI = null; f(s === 'closed'); } }
  }
  function pgRewState(s) {
    pgSeen = true;
    if (s === 'opened') begin();
    if (s === 'rewarded') pgRewardFlag = true;
    if (s === 'closed' || s === 'failed') { end(); if (pgR) { const f = pgR; pgR = null; f(pgRewardFlag); } }
  }
  function pgShow(kind, placement) {
    return new Promise(res => {
      const b = PG();
      const supported = kind === 'i' ? b.advertisement.isInterstitialSupported : b.advertisement.isRewardedSupported;
      if (!supported) return res(false);
      pgSeen = false; pgRewardFlag = false;
      let settled = false;
      const settle = v => { if (settled) return; settled = true; res(v); };
      if (kind === 'i') pgI = settle; else pgR = settle;
      // If the platform silently skips (e.g. min delay not passed) no state arrives: give up quickly.
      setTimeout(() => { if (!pgSeen) { if (kind === 'i') pgI = null; else pgR = null; settle(false); } }, 3000);
      setTimeout(() => { end(); settle(kind === 'r' ? pgRewardFlag : false); }, 120000);
      try { kind === 'i' ? b.advertisement.showInterstitial(placement) : b.advertisement.showRewarded(placement); }
      catch (e) { settle(false); }
    });
  }

  /* ---------------- Dev fake ads ---------------- */
  function fakeAd(kind) {
    return new Promise(res => {
      begin();
      const el = document.getElementById('adfake');
      if (!el) { end(); return res(true); }
      el.querySelector('b').textContent = kind === 'rewarded' ? 'REWARDED TEST AD' : 'TEST AD';
      el.classList.add('show');
      setTimeout(() => { el.classList.remove('show'); end(); res(true); }, kind === 'rewarded' ? 1500 : 900);
    });
  }

  /* ---------------- Public API ---------------- */
  async function init(h) {
    hooks = Object.assign(hooks, h || {});
    try {
      if (P === 'crazygames' && CG()) {
        await withTimeout(CG().init(), 8000);
        try { CG().game.loadingStart(); } catch (e) {}
      } else if (P === 'gamedistribution') {
        if (!gdReady) await withTimeout(new Promise(r => gdReadyWaiters.push(r)), 6000);
        try { if (gd() && gd().preloadAd) gd().preloadAd('rewarded').catch(() => {}); } catch (e) {}
      } else if (P === 'playgama' && PG()) {
        await withTimeout(PG().initialize(), 10000);
        const b = PG();
        try {
          b.advertisement.on(b.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, pgInterState);
          b.advertisement.on(b.EVENT_NAME.REWARDED_STATE_CHANGED, pgRewState);
          b.advertisement.setMinimumDelayBetweenInterstitial(Math.round(MIN_GAP / 1000));
        } catch (e) {}
        try {
          b.game.on(b.EVENT_NAME.VISIBILITY_STATE_CHANGED, s => { if (s === 'hidden') hooks.pause('hidden'); else hooks.resume('hidden'); });
        } catch (e) {}
      }
    } catch (e) { log('init failed, continuing without SDK', e && e.message); }
  }

  async function interstitial(placement) {
    if (adOpen) return false;
    if (Date.now() - lastInterstitial < MIN_GAP) return false;
    let ok = false;
    if (P === 'crazygames' && CG()) ok = await cgAd('midgame');
    else if (P === 'gamedistribution') ok = await gdShow();
    else if (P === 'playgama' && PG()) ok = await pgShow('i', placement || 'break');
    else if (P === 'dev') ok = await fakeAd('interstitial');
    if (ok) lastInterstitial = Date.now();
    return ok;
  }

  async function rewarded(placement) {
    if (adOpen) return false;
    let ok = false;
    if (P === 'crazygames' && CG()) ok = await cgAd('rewarded');
    else if (P === 'gamedistribution') ok = await gdRewarded();
    else if (P === 'playgama' && PG()) ok = await pgShow('r', placement || 'reward');
    else if (P === 'dev') ok = await fakeAd('rewarded');
    else ok = true; // no ad network: just grant
    lastInterstitial = Date.now(); // never stack an interstitial right after a rewarded ad
    return ok;
  }

  function gameplayStart() {
    if (playing) return; playing = true;
    try { if (P === 'crazygames' && CG()) CG().game.gameplayStart(); } catch (e) {}
    try { if (P === 'playgama' && PG()) PG().platform.sendMessage('gameplay_started'); } catch (e) {}
  }
  function gameplayStop() {
    if (!playing) return; playing = false;
    try { if (P === 'crazygames' && CG()) CG().game.gameplayStop(); } catch (e) {}
    try { if (P === 'playgama' && PG()) PG().platform.sendMessage('gameplay_stopped'); } catch (e) {}
  }
  function loadingDone() {
    try { if (P === 'crazygames' && CG()) CG().game.loadingStop(); } catch (e) {}
    try { if (P === 'playgama' && PG()) PG().platform.sendMessage('game_ready'); } catch (e) {}
  }
  function happytime() {
    if (Date.now() - lastHappy < 20000) return; lastHappy = Date.now();
    try { if (P === 'crazygames' && CG()) CG().game.happytime(); } catch (e) {}
  }

  async function load() {
    let raw = null;
    try {
      if (P === 'crazygames' && CG() && CG().data) raw = CG().data.getItem(SAVE_KEY);
      else if (P === 'playgama' && PG() && PG().storage) raw = await withTimeout(PG().storage.get(SAVE_KEY), 4000, null);
    } catch (e) {}
    if (!raw) { try { raw = localStorage.getItem(SAVE_KEY); } catch (e) {} }
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function store(obj) {
    const s = JSON.stringify(obj);
    try { if (P === 'crazygames' && CG() && CG().data) CG().data.setItem(SAVE_KEY, s); } catch (e) {}
    try { if (P === 'playgama' && PG() && PG().storage) PG().storage.set(SAVE_KEY, s).catch(() => {}); } catch (e) {}
    try { localStorage.setItem(SAVE_KEY, s); } catch (e) {}
  }

  return { portal: P, init, interstitial, rewarded, gameplayStart, gameplayStop, loadingDone, happytime, load, store, get adOpen() { return adOpen; } };
})();
