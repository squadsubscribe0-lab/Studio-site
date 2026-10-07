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
