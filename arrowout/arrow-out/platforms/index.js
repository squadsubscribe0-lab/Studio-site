/* ============================================================
   Platform adapters.

   Every build exports the same tiny interface, so game.js never knows
   which portal it is running on:

     Platform.loadingStart()   Platform.loadingStop()
     Platform.ready()
     Platform.gameplayStart()  Platform.gameplayStop()
     Platform.happyTime()
     Platform.interstitial() -> Promise<void>
     Platform.rewarded()     -> Promise<boolean>
     Platform.hasRewarded

   Two rules hold everywhere:
   1. Every SDK call is wrapped. If a portal's script fails to load, is
      blocked by an adblocker, or changes its API, the game still runs —
      the promise just resolves immediately.
   2. Ads mute the game on start and unmute on finish/error, which every
      portal requires for approval.
   ============================================================ */

const BASE = `
(function(){
  "use strict";
  var noop = function(){};
  window.Platform = {
    name: "__NAME__",
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
`;

module.exports = {

  /* ---------------- plain builds ---------------- */
  standalone: {
    label: "Standalone / itch.io / any host",
    head: "",
    sdk: `
/* No portal SDK. Ads resolve instantly so the flow is identical. */
Platform.name = "standalone";
Platform.hasRewarded = false;
`
  },

  selfhost: {
    label: "Self-hosted (your own domain)",
    head: "",
    sdk: `
Platform.name = "selfhost";
Platform.hasRewarded = false;
`
  },

  /* ---------------- CrazyGames (SDK v3) ---------------- */
  crazygames: {
    label: "CrazyGames",
    head: '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>',
    sdk: `
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
`
  },

  /* ---------------- GameDistribution ---------------- */
  gamedistribution: {
    label: "GameDistribution",
    head: `<script>
  window["GD_OPTIONS"] = {
    "gameId": "8cd05c7c42be4dac92a5858d366dd10e",
    "onEvent": function(event){
      switch(event.name){
        case "SDK_GAME_START": if(window.Game) window.Game.resume(); break;
        case "SDK_GAME_PAUSE": if(window.Game) window.Game.pause();  break;
        case "SDK_READY": break;
        case "SDK_ERROR": break;
      }
    }
  };
  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if(d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = 'https://html5.api.gamedistribution.com/main.min.js';
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'gamedistribution-jssdk'));
</script>`,
    sdk: `
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
`
  },

  /* ---------------- GameMonetize ---------------- */
  gamemonetize: {
    label: "GameMonetize",
    head: `<script>
  window.SDK_OPTIONS = {
    gameId: "__GM_GAME_ID__",
    onEvent: function(a){
      switch(a.name){
        case "SDK_GAME_START": if(window.Game) window.Game.resume(); break;
        case "SDK_GAME_PAUSE": if(window.Game) window.Game.pause();  break;
        case "SDK_READY": break;
      }
    }
  };
  (function(){
    var s = document.createElement("script");
    s.src = "https://api.gamemonetize.com/sdk.js";
    document.head.appendChild(s);
  })();
</script>`,
    sdk: `
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
`
  },

  /* ---------------- Poki ---------------- */
  poki: {
    label: "Poki",
    head: '<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>',
    sdk: `
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
`
  },

  /* ---------------- GamePix ---------------- */
  gamepix: {
    label: "GamePix",
    head: '<script src="https://integration.gamepix.com/sdk/v3/gamepix.sdk.js"></script>',
    sdk: `
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
`
  },

  /* ---------------- Yandex Games ---------------- */
  yandex: {
    label: "Yandex Games",
    head: '<script src="https://yandex.ru/games/sdk/v2"></script>',
    sdk: `
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
`
  },

  /* ---------------- Playgama ---------------- */
  playgama: {
    label: "Playgama Bridge",
    head: '<script src="https://bridge.playgama.com/v1/stable/playgama-bridge.js"></script>',
    sdk: `
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
`
  },

  /* ---------------- Lagged ---------------- */
  lagged: {
    label: "Lagged",
    head: '<script src="https://lagged.com/api/revision/api.js"></script>',
    sdk: `
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
`
  },

  /* ---------------- Y8 ---------------- */
  y8: {
    label: "Y8",
    head: '<script src="https://cdn.y8.com/api/js/y8.js"></script>',
    sdk: `
/* Docs: https://developers.y8.com
   Y8's ad API varies by account type. This build loads the SDK for login
   and analytics but keeps ads off, so it is always safe to upload.
   Add ID.showAd()-style calls here once you have confirmed your setup. */
Platform.name = "y8";
Platform.hasRewarded = false;

Platform._safe(function(){
  if(window.ID && window.ID.init) window.ID.init("__Y8_GAME_KEY__");
});
`
  },

  /* ---------------- Newgrounds ---------------- */
  newgrounds: {
    label: "Newgrounds",
    head: "",
    sdk: `
/* Newgrounds has no ad SDK for HTML5 games; medals and scoreboards go
   through newgrounds.io if you want them later. Ship as-is. */
Platform.name = "newgrounds";
Platform.hasRewarded = false;
`
  },

  /* ---------------- Playgama-style catch-all for GamePix clones ---------------- */
  gamearter: {
    label: "GameArter",
    head: '<script src="https://ssl.gstatic.com/gamearter/gamearter.js"></script>',
    sdk: `
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
`
  }
};

module.exports.__BASE__ = BASE;
