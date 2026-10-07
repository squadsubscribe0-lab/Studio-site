
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "lagged",
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

/* Docs: https://lagged.com/api
   Fill in your developer and publisher ids below before uploading. */
Platform.name = "lagged";
Platform.hasRewarded = true;

var LAGGED_DEV_ID = "__LAGGED_DEV_ID__";
var LAGGED_PUB_ID = "__LAGGED_PUB_ID__";

Platform._safe(function(){
  if(window.LaggedAPI) window.LaggedAPI.init(LAGGED_DEV_ID, LAGGED_PUB_ID);
});

Platform.interstitial = function(){
  return new Promise(function(resolve){
    if(!window.LaggedAPI || !window.LaggedAPI.APIAds){ resolve(); return; }
    Platform._mute(true);
    try{ window.LaggedAPI.APIAds.playAd(); }catch(e){}
    // Lagged has no reliable completion callback, so resume on a timer
    setTimeout(function(){ Platform._mute(false); resolve(); }, 1200);
  });
};

Platform.rewarded = function(){
  return new Promise(function(resolve){
    if(!window.LaggedAPI || !window.LaggedAPI.APIRewards){ resolve(false); return; }
    Platform._mute(true);
    try{
      window.LaggedAPI.APIRewards.playRewarded(function(res){
        Platform._mute(false);
        resolve(!!res);
      });
    }catch(e){ Platform._mute(false); resolve(false); }
    setTimeout(function(){ Platform._mute(false); resolve(false); }, 30000);
  });
};
