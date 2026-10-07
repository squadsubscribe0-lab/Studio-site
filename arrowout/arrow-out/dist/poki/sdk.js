
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "poki",
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

/* Docs: https://sdk.poki.com/sdk-documentation
   Poki decides when an ad actually plays, so call commercialBreak freely. */
Platform.name = "poki";
Platform.hasRewarded = true;

Platform._safe(function(){ window.PokiSDK.init(); });

Platform.loadingStop = function(){
  Platform._safe(function(){ window.PokiSDK.gameLoadingFinished(); });
};
Platform.gameplayStart = function(){ Platform._safe(function(){ window.PokiSDK.gameplayStart(); }); };
Platform.gameplayStop  = function(){ Platform._safe(function(){ window.PokiSDK.gameplayStop();  }); };
Platform.happyTime     = function(){ Platform._safe(function(){ window.PokiSDK.happyTime(1); }); };

Platform.interstitial = function(){
  return new Promise(function(resolve){
    if(!window.PokiSDK){ resolve(); return; }
    try{
      window.PokiSDK.commercialBreak(function(){ Platform._mute(true); })
        .then(function(){ Platform._mute(false); resolve(); })
        .catch(function(){ Platform._mute(false); resolve(); });
    }catch(e){ Platform._mute(false); resolve(); }
  });
};

Platform.rewarded = function(){
  return new Promise(function(resolve){
    if(!window.PokiSDK){ resolve(false); return; }
    try{
      Platform._mute(true);
      window.PokiSDK.rewardedBreak()
        .then(function(withReward){ Platform._mute(false); resolve(!!withReward); })
        .catch(function(){ Platform._mute(false); resolve(false); });
    }catch(e){ Platform._mute(false); resolve(false); }
  });
};
