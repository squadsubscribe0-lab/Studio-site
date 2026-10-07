
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "playgama",
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

/* Docs: https://docs.playgama.com/bridge
   The bridge normalises many portals behind one API. */
Platform.name = "playgama";
Platform.hasRewarded = true;

var bridgeReady = false;
Platform._safe(function(){
  if(window.bridge && window.bridge.initialize){
    window.bridge.initialize().then(function(){ bridgeReady = true; });
  }
});

Platform.ready = function(){
  Platform._safe(function(){
    if(window.bridge && window.bridge.platform && window.bridge.platform.sendMessage)
      window.bridge.platform.sendMessage("game_ready");
  });
};
Platform.gameplayStart = function(){
  Platform._safe(function(){ window.bridge.platform.sendMessage("gameplay_started"); });
};
Platform.gameplayStop = function(){
  Platform._safe(function(){ window.bridge.platform.sendMessage("gameplay_stopped"); });
};

Platform.interstitial = function(){
  return new Promise(function(resolve){
    if(!bridgeReady || !window.bridge.advertisement){ resolve(); return; }
    var done = false;
    var finish = function(){ if(done) return; done = true; Platform._mute(false); resolve(); };
    try{
      window.bridge.advertisement.on("interstitial_state_changed", function(state){
        if(state === "opened") Platform._mute(true);
        if(state === "closed" || state === "failed") finish();
      });
      window.bridge.advertisement.showInterstitial();
      setTimeout(finish, 30000);
    }catch(e){ finish(); }
  });
};

Platform.rewarded = function(){
  return new Promise(function(resolve){
    if(!bridgeReady || !window.bridge.advertisement){ resolve(false); return; }
    var granted = false, done = false;
    var finish = function(){ if(done) return; done = true; Platform._mute(false); resolve(granted); };
    try{
      window.bridge.advertisement.on("rewarded_state_changed", function(state){
        if(state === "opened")   Platform._mute(true);
        if(state === "rewarded") granted = true;
        if(state === "closed" || state === "failed") finish();
      });
      window.bridge.advertisement.showRewarded();
      setTimeout(finish, 30000);
    }catch(e){ finish(); }
  });
};
