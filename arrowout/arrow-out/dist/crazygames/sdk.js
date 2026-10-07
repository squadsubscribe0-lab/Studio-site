
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "crazygames",
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

/* Docs: https://docs.crazygames.com/sdk/html5-v3/ */
Platform.name = "crazygames";
Platform.hasRewarded = true;

var CG = null;
Platform._safe(function(){
  if(window.CrazyGames && window.CrazyGames.SDK){
    CG = window.CrazyGames.SDK;
    CG.init();
  }
});

Platform.loadingStart  = function(){ Platform._safe(function(){ CG.game.loadingStart(); }); };
Platform.loadingStop   = function(){ Platform._safe(function(){ CG.game.loadingStop(); }); };
Platform.gameplayStart = function(){ Platform._safe(function(){ CG.game.gameplayStart(); }); };
Platform.gameplayStop  = function(){ Platform._safe(function(){ CG.game.gameplayStop(); }); };
Platform.happyTime     = function(){ Platform._safe(function(){ CG.game.happytime(); }); };

function cgAd(type){
  return new Promise(function(resolve){
    if(!CG || !CG.ad){ resolve(false); return; }
    var settled = false;
    var finish = function(ok){
      if(settled) return;
      settled = true;
      Platform._mute(false);
      resolve(ok);
    };
    try{
      CG.ad.requestAd(type, {
        adStarted:  function(){ Platform._mute(true); },
        adFinished: function(){ finish(true); },
        adError:    function(){ finish(false); }
      });
    }catch(e){ finish(false); }
    // never leave the player stuck if no callback ever fires
    setTimeout(function(){ finish(false); }, 30000);
  });
}
Platform.interstitial = function(){ return cgAd("midgame").then(function(){}); };
Platform.rewarded     = function(){ return cgAd("rewarded"); };
