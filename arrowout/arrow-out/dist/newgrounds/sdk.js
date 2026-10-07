
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "newgrounds",
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

/* Newgrounds has no ad SDK for HTML5 games; medals and scoreboards go
   through newgrounds.io if you want them later. Ship as-is. */
Platform.name = "newgrounds";
Platform.hasRewarded = false;
