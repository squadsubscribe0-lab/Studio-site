
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "gamearter",
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

/* Docs: https://www.gamearter.com/documentation
   GameArter injects its own instance; calls are wrapped so a missing SDK
   simply degrades to no ads. */
Platform.name = "gamearter";
Platform.hasRewarded = true;

Platform.interstitial = function(){
  return new Promise(function(resolve){
    var ga = window.gameArter || window.GameArter;
    if(!ga || !ga.showAd){ resolve(); return; }
    Platform._mute(true);
    try{
      ga.showAd("interstitial", function(){ Platform._mute(false); resolve(); });
    }catch(e){ Platform._mute(false); resolve(); }
    setTimeout(function(){ Platform._mute(false); resolve(); }, 30000);
  });
};

Platform.rewarded = function(){
  return new Promise(function(resolve){
    var ga = window.gameArter || window.GameArter;
    if(!ga || !ga.showAd){ resolve(false); return; }
    Platform._mute(true);
    try{
      ga.showAd("reward", function(ok){ Platform._mute(false); resolve(!!ok); });
    }catch(e){ Platform._mute(false); resolve(false); }
    setTimeout(function(){ Platform._mute(false); resolve(false); }, 30000);
  });
};
