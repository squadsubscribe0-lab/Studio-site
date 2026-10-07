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
