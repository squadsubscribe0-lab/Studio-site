
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "gamedistribution",
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

/* Docs: https://github.com/GameDistribution/GD-HTML5/wiki
   Replace __GD_GAME_ID__ in index.html with your key from
   developer.gamedistribution.com, and tick the rewarded-ads flag there
   or rewarded requests will always fail. */
Platform.name = "gamedistribution";
Platform.hasRewarded = true;

// GD pauses/resumes the game itself through SDK_GAME_PAUSE / SDK_GAME_START
function gdAd(type){
  return new Promise(function(resolve){
    var sdk = window.gdsdk;
    if(!sdk || !sdk.showAd){ resolve(false); return; }
    Platform._mute(true);
    var done = false;
    var finish = function(ok){
      if(done) return;
      done = true;
      Platform._mute(false);
      resolve(ok);
    };
    try{
      sdk.showAd(type)
        .then(function(){ finish(true); })
        .catch(function(){ finish(false); });
    }catch(e){ finish(false); }
    setTimeout(function(){ finish(false); }, 30000);
  });
}
Platform.interstitial = function(){ return gdAd("interstitial").then(function(){}); };
Platform.rewarded     = function(){ return gdAd("rewarded"); };

// preload a rewarded ad so the revive button is responsive
Platform.ready = function(){
  Platform._safe(function(){
    if(window.gdsdk && window.gdsdk.preloadAd) window.gdsdk.preloadAd("rewarded").catch(function(){});
  });
};
