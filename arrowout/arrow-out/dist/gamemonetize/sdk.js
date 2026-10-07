
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "gamemonetize",
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

/* GameMonetize mirrors the GameDistribution API. Put your game id from
   gamemonetize.com into __GM_GAME_ID__ in index.html. */
Platform.name = "gamemonetize";
Platform.hasRewarded = true;

function gmAd(type){
  return new Promise(function(resolve){
    var sdk = window.sdk;
    if(!sdk || !sdk.showBanner){ resolve(false); return; }
    Platform._mute(true);
    var done = false;
    var finish = function(ok){
      if(done) return;
      done = true;
      Platform._mute(false);
      resolve(ok);
    };
    try{
      if(type === "rewarded" && sdk.showAd){
        sdk.showAd("rewarded").then(function(){ finish(true); }).catch(function(){ finish(false); });
      }else{
        var r = sdk.showBanner();
        if(r && r.then) r.then(function(){ finish(true); }).catch(function(){ finish(false); });
        else finish(true);
      }
    }catch(e){ finish(false); }
    setTimeout(function(){ finish(false); }, 30000);
  });
}
Platform.interstitial = function(){ return gmAd("interstitial").then(function(){}); };
Platform.rewarded     = function(){ return gmAd("rewarded"); };
