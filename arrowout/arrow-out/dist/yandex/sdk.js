
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "yandex",
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

/* Docs: https://yandex.com/dev/games/doc/en/
   Yandex requires the SDK script above and calls ysdk.features.LoadingAPI.ready()
   once the game is interactive. */
Platform.name = "yandex";
Platform.hasRewarded = true;

var ysdk = null;
Platform._safe(function(){
  if(window.YaGames) window.YaGames.init().then(function(sdk){ ysdk = sdk; });
});

Platform.ready = function(){
  Platform._safe(function(){
    if(ysdk && ysdk.features && ysdk.features.LoadingAPI) ysdk.features.LoadingAPI.ready();
  });
};

Platform.interstitial = function(){
  return new Promise(function(resolve){
    if(!ysdk || !ysdk.adv){ resolve(); return; }
    try{
      ysdk.adv.showFullscreenAdv({ callbacks: {
        onOpen:  function(){ Platform._mute(true); },
        onClose: function(){ Platform._mute(false); resolve(); },
        onError: function(){ Platform._mute(false); resolve(); }
      }});
    }catch(e){ Platform._mute(false); resolve(); }
  });
};

Platform.rewarded = function(){
  return new Promise(function(resolve){
    if(!ysdk || !ysdk.adv){ resolve(false); return; }
    var granted = false;
    try{
      ysdk.adv.showRewardedVideo({ callbacks: {
        onOpen:     function(){ Platform._mute(true); },
        onRewarded: function(){ granted = true; },
        onClose:    function(){ Platform._mute(false); resolve(granted); },
        onError:    function(){ Platform._mute(false); resolve(false); }
      }});
    }catch(e){ Platform._mute(false); resolve(false); }
  });
};
