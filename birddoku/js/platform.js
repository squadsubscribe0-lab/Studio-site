/* ---------------------------------------------------------------
   CrazyGames SDK wrapper + saved progress.
   Everything here degrades quietly: open index.html on your desktop
   with no SDK and the game behaves normally.
---------------------------------------------------------------- */

const CG = (function () {
  let sdk = null, ready = false, inGameplay = false;

  async function init() {
    try {
      if (window.CrazyGames && window.CrazyGames.SDK) {
        await window.CrazyGames.SDK.init();
        sdk = window.CrazyGames.SDK;
        ready = true;
      }
    } catch (e) { ready = false; }
    return ready;
  }

  const call = fn => { try { if (ready) fn(sdk); } catch (e) { /* ignore */ } };

  return {
    init,
    get ready() { return ready; },

    loadingStart() { call(s => s.game.loadingStart()); },
    loadingStop()  { call(s => s.game.loadingStop()); },

    gameplayStart() { if (inGameplay) return; inGameplay = true; call(s => s.game.gameplayStart()); },
    gameplayStop()  { if (!inGameplay) return; inGameplay = false; call(s => s.game.gameplayStop()); },

    happytime() { call(s => s.game.happytime()); },

    midgameAd(done) {
      if (!ready) { done(); return; }
      Sound.duck(true);
      const finish = () => { Sound.duck(false); done(); };
      try {
        sdk.ad.requestAd('midgame', { adFinished: finish, adError: finish, adStarted: () => {} });
      } catch (e) { finish(); }
    },

    rewardedAd(onReward, onFail) {
      if (!ready) { onFail && onFail(); return; }
      Sound.duck(true);
      try {
        sdk.ad.requestAd('rewarded', {
          adFinished: () => { Sound.duck(false); onReward(); },
          adError: () => { Sound.duck(false); onFail && onFail(); },
          adStarted: () => {}
        });
      } catch (e) { Sound.duck(false); onFail && onFail(); }
    }
  };
})();


const Store = (function () {
  const KEY = 'birddoku.save.v1';
  const blank = {
    unlocked: 1,
    best: {},                                   // level -> seconds
    settings: { music: true, sfx: true, autoMark: true }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(blank));
      const data = JSON.parse(raw);
      return Object.assign(JSON.parse(JSON.stringify(blank)), data, {
        settings: Object.assign({}, blank.settings, data.settings || {})
      });
    } catch (e) {
      return JSON.parse(JSON.stringify(blank));
    }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode */ }
  }

  return { load, save };
})();
