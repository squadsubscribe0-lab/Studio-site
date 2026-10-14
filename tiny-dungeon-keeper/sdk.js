
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "standalone",
    hasRewarded: false,
    loadingStart: noop,
    loadingStop: noop,
    ready: noop,
    gameplayStart: noop,
    gameplayStop: noop,
    happyTime: noop,
    interstitial: function(){ return Promise.resolve(); },
    rewarded: function(){ return Promise.resolve(false); }
  };
  // muting is identical everywhere, so it lives here
  window.Platform._mute = function(on){
    try{ if(window.Game) window.Game.mute(on); }catch(e){}
  };
  window.Platform._safe = function(fn, fallback){
    try{ return fn(); }catch(e){ return fallback; }
  };
})();

/* No portal SDK (your own website). There is no ad network here, so
   "watch an ad" rewards are simply granted. */
Platform.name = "standalone";
Platform.hasRewarded = true;
Platform.rewarded = function(){ return new Promise(function(r){ setTimeout(function(){ r(true); }, 300); }); };
