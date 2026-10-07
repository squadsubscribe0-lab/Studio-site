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

/* Lagged SDK — https://lagged.dev/sdk
   Put your dev ID and publisher ID below. Reward ads are offered only after Lagged says one is available. */
const LAGGED_DEV_ID = 'YOUR_LAGGED_DEV_ID';
const LAGGED_PUBLISHER_ID = 'YOUR_LAGGED_PUBLISHER_ID';
Object.assign(window.PLATFORM, {
  id:'lagged',
  features:{ ads:true, rewarded:true, friends:true },
  rewardAvailable:false, _showReward:null, _rewardCb:null,
  async init(){
    if(!window.LaggedAPI){ this.features.ads = false; return; }
    this.sdk = window.LaggedAPI;
    this.safe(() => this.sdk.init(LAGGED_DEV_ID, LAGGED_PUBLISHER_ID));
    this.safe(() => this.sdk.User.get(d => { if(d && d.user && d.user.id > 0) this.user = { username:d.user.name }; }));
  },
  prepareRewarded(cb){
    if(!this.sdk){ if(cb) cb(); return; }
    this.rewardAvailable = false; this._showReward = null;
    this.safe(() => this.sdk.GEvents.reward(
      (ok, showAdFn) => { if(ok){ this.rewardAvailable = true; this._showReward = showAdFn; } if(cb) cb(); },
      success => { const f = this._rewardCb; this._rewardCb = null; this.rewardAvailable = false; this._showReward = null; if(f) f(!!success); }
    ));
  },
  showAd(type, opened, end){
    if(!this.sdk) return end(false);
    if(type === 'rewarded'){
      if(!this._showReward) return end(false);
      this._rewardCb = end; opened(); this._showReward();
    } else {
      opened(); this.sdk.APIAds.show(() => end(true));
    }
  }
});
