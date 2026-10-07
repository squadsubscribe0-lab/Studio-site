
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "y8",
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

/* Docs: https://developers.y8.com
   Y8's ad API varies by account type. This build loads the SDK for login
   and analytics but keeps ads off, so it is always safe to upload.
   Add ID.showAd()-style calls here once you have confirmed your setup. */
Platform.name = "y8";
Platform.hasRewarded = false;

Platform._safe(function(){
  if(window.ID && window.ID.init) window.ID.init("__Y8_GAME_KEY__");
});
