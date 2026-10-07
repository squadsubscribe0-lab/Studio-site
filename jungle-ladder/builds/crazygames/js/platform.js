/* Shared platform adapter. Each portal file (crazygames.js, poki.js, ...) is appended after this
   by build.js and overrides only what that portal needs. The game only talks to window.PLATFORM. */
window.PLATFORM = (function(){
  const P = {
    id:'base',
    sdk:null, user:null,
    features:{ ads:false, rewarded:false, friends:true },
    canInvite:false,
    adsOff:false, adblock:false, adPlaying:false, muted:false, platformPaused:false,
    playing:false, lastRewarded:-1e9, rewardAvailable:true,
    rewardedCooldownMs:120000,
    hooks:{ audio(){}, adWait(){}, mute(){} },

    async init(){},
    loadingStart(){}, loadingStop(){},
    start(){ if(this.playing) return; this.playing = true; this.safe(() => this.onStart()); },
    stop(){ if(!this.playing) return; this.playing = false; this.safe(() => this.onStop()); },
    onStart(){}, onStop(){},
    happy(){}, context(){}, progress(){}, levelUp(){},
    room(){}, leftRoom(){}, onJoinRoom(){},
    inviteLink(){ return null; }, inviteRoom(){ return null; }, instantMultiplayer(){ return false; },
    username(){ return (this.user && (this.user.username || this.user.name)) || ''; },

    storageGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
    storageSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} },

    /* rewarded availability: some portals (Lagged) must be asked first */
    prepareRewarded(cb){ if(cb) cb(); },
    rewardedReady(){
      return this.features.ads && this.features.rewarded && this.rewardAvailable && !this.adsOff && !this.adblock &&
             performance.now() - this.lastRewarded > this.rewardedCooldownMs;
    },

    /* type: 'midgame' | 'rewarded'. done(true) only when the ad played through (always called exactly once). */
    ad(type, done){
      if(!this.features.ads || this.adsOff || (type === 'rewarded' && !this.features.rewarded)){ done(false); return; }
      this.hooks.adWait(true);
      let settled = false;
      const end = ok => {
        if(settled) return; settled = true; clearTimeout(guard);
        this.adPlaying = false; this.hooks.audio(); this.hooks.adWait(false);
        if(ok && type === 'rewarded') this.lastRewarded = performance.now();
        done(!!ok);
      };
      const opened = () => { this.adPlaying = true; this.hooks.audio(); };
      const guard = setTimeout(() => end(false), type === 'rewarded' ? 90000 : 45000);
      try{ this.showAd(type, opened, end); }catch(e){ end(false); }
    },
    showAd(type, opened, end){ end(false); },

    /* helpers for adapters */
    safe(fn){ try{ return fn(); }catch(e){ return undefined; } },
    loadScript(src, attrs){
      return new Promise(res => {
        const s = document.createElement('script'); s.src = src; s.async = true;
        if(attrs) Object.keys(attrs).forEach(k => s.setAttribute(k, attrs[k]));
        s.onload = () => res(true); s.onerror = () => res(false);
        document.head.appendChild(s);
      });
    },
    timeout(ms){ return new Promise(r => setTimeout(r, ms)); }
  };
  return P;
})();

/* CrazyGames SDK v3 — https://docs.crazygames.com/sdk/intro/ */
Object.assign(window.PLATFORM, {
  id:'crazygames',
  features:{ ads:true, rewarded:true, friends:true },
  canInvite:true,
  async init(){
    const S = window.CrazyGames && window.CrazyGames.SDK;
    if(!S){ this.features.ads = false; this.canInvite = false; return; }
    await S.init();
    if(S.environment === 'disabled'){ this.features.ads = false; this.canInvite = false; return; }
    this.sdk = S;
    this.muted = !!(S.game.settings && S.game.settings.muteAudio);
    S.game.addSettingsChangeListener(st => { this.muted = !!(st && st.muteAudio); this.hooks.audio(); this.hooks.mute(); });
    try{ this.adblock = !!(await S.ad.hasAdblock()); }catch(e){}
    try{ if(S.user && S.user.isUserAccountAvailable){ this.user = await S.user.getUser(); S.user.addAuthListener && S.user.addAuthListener(u => { this.user = u; }); } }catch(e){}
  },
  c(fn){ try{ if(this.sdk) fn(this.sdk); }catch(e){} },
  loadingStart(){ this.c(S => S.game.loadingStart()); },
  loadingStop(){ this.c(S => S.game.loadingStop()); },
  onStart(){ this.c(S => S.game.gameplayStart()); },
  onStop(){ this.c(S => S.game.gameplayStop()); },
  happy(){ this.c(S => S.game.happytime()); },
  context(o){ this.c(S => o ? S.game.setGameContext(o) : S.game.clearGameContext()); },
  progress(p){ this.c(S => S.game.reportGameCompletedPercentage && S.game.reportGameCompletedPercentage(p)); },
  room(o){ this.c(S => S.game.updateRoom(o)); },
  leftRoom(){ this.c(S => S.game.leftRoom()); },
  onJoinRoom(fn){ this.c(S => S.game.addJoinRoomListener(p => fn(p && p.room))); },
  inviteLink(params){ try{ return this.sdk ? this.sdk.game.inviteLink(params) : null; }catch(e){ return null; } },
  inviteRoom(){ try{ const S = this.sdk; if(!S) return null; return S.game.getInviteParam('room') || (S.game.inviteParams && S.game.inviteParams.room) || null; }catch(e){ return null; } },
  instantMultiplayer(){ try{ return !!(this.sdk && this.sdk.game.isInstantMultiplayer); }catch(e){ return false; } },
  /* Data module is the only save on CrazyGames; old localStorage progress is copied over once */
  storageGet(k){
    try{
      if(this.sdk && this.sdk.data){
        let v = this.sdk.data.getItem(k);
        if(v == null){ let l = null; try{ l = localStorage.getItem(k); }catch(e){} if(l != null){ this.sdk.data.setItem(k, l); v = l; } }
        return v;
      }
    }catch(e){}
    try{ return localStorage.getItem(k); }catch(e){ return null; }
  },
  storageSet(k, v){ try{ if(this.sdk && this.sdk.data){ this.sdk.data.setItem(k, v); return; } }catch(e){} try{ localStorage.setItem(k, v); }catch(e){} },
  showAd(type, opened, end){
    this.sdk.ad.requestAd(type === 'rewarded' ? 'rewarded' : 'midgame', {
      adStarted: opened,
      adFinished: () => end(true),
      adError: e => { const c = e && e.code; if(c === 'adsDisabledBasicLaunch') this.adsOff = true; if(c === 'adblock') this.adblock = true; end(false); }
    });
  }
});
