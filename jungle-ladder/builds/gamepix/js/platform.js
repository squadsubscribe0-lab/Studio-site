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

/* GamePix SDK v3 — https://partners.gamepix.com/sdk/doc/javascript
   GamePix does not allow external resources, so online friend matches are disabled in this build. */
Object.assign(window.PLATFORM, {
  id:'gamepix',
  features:{ ads:true, rewarded:true, friends:false },
  async init(){
    if(!window.GamePix){ this.features.ads = false; return; }
    this.sdk = window.GamePix;
  },
  loadingStart(){ this.safe(() => this.sdk && this.sdk.loading(10)); },
  loadingStop(){ this.safe(() => { if(this.sdk){ this.sdk.loading(100); this.sdk.loaded(); } }); },
  happy(){ this.safe(() => this.sdk && this.sdk.happyMoment()); },
  levelUp(n){ this.safe(() => this.sdk && this.sdk.updateLevel(n + 1)); },
  storageGet(k){ const v = this.safe(() => this.sdk && this.sdk.localStorage.getItem(k)); if(v != null) return v; try{ return localStorage.getItem(k); }catch(e){ return null; } },
  storageSet(k, v){ if(this.sdk){ this.safe(() => this.sdk.localStorage.setItem(k, String(v))); return; } try{ localStorage.setItem(k, v); }catch(e){} },
  showAd(type, opened, end){
    if(!this.sdk) return end(false);
    opened();   // GamePix: pause the game before calling, resume in the callback
    const call = type === 'rewarded' ? this.sdk.rewardAd() : this.sdk.interstitialAd();
    Promise.resolve(call).then(res => end(!!(res && res.success))).catch(() => end(false));
  }
});
