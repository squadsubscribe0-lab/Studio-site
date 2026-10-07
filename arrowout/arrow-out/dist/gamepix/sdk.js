
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "gamepix",
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

/* Docs: https://integration.gamepix.com/sdk
   Verify method names against the current SDK version before publishing. */
Platform.name = "gamepix";
Platform.hasRewarded = true;

Platform.ready         = function(){ Platform._safe(function(){ window.GamePix.ping("start"); }); };
Platform.gameplayStart = function(){ Platform._safe(function(){ window.GamePix.ping("start"); }); };
Platform.gameplayStop  = function(){ Platform._safe(function(){ window.GamePix.ping("stop");  }); };
Platform.happyTime     = function(){ Platform._safe(function(){ window.GamePix.ping("level_up"); }); };

Platform.interstitial = function(){
  return new Promise(function(resolve){
    if(!window.GamePix || !window.GamePix.interstitialAd){ resolve(); return; }
    Platform._mute(true);
    try{
      var r = window.GamePix.interstitialAd();
      if(r && r.then) r.then(function(){ Platform._mute(false); resolve(); })
                       .catch(function(){ Platform._mute(false); resolve(); });
      else { Platform._mute(false); resolve(); }
    }catch(e){ Platform._mute(false); resolve(); }
  });
};

Platform.rewarded = function(){
  return new Promise(function(resolve){
    if(!window.GamePix || !window.GamePix.rewardAd){ resolve(false); return; }
    Platform._mute(true);
    try{
      var r = window.GamePix.rewardAd();
      if(r && r.then) r.then(function(res){
                          Platform._mute(false);
                          resolve(res === undefined ? true : !!(res && res.success !== false));
                        })
                       .catch(function(){ Platform._mute(false); resolve(false); });
      else { Platform._mute(false); resolve(false); }
    }catch(e){ Platform._mute(false); resolve(false); }
  });
};
