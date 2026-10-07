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

/* Playgama Bridge v2 (bundled in js/vendor/playgama-bridge.js) — https://wiki.playgama.com
   Create playgama-bridge-config.json with the Bridge config page and put it next to index.html. */
Object.assign(window.PLATFORM, {
  id:'playgama',
  features:{ ads:true, rewarded:true, friends:true },
  _ad:null,
  async init(){
    const b = window.bridge;
    if(!b){ this.features.ads = false; return; }
    await b.initialize();
    this.sdk = b;
    const E = b.EVENT_NAME || {};
    this.features.rewarded = !!b.advertisement.isRewardedSupported;
    this.features.ads = !!(b.advertisement.isInterstitialSupported || b.advertisement.isRewardedSupported);
    this.safe(() => { this.muted = b.platform.isAudioEnabled === false; });
    this.safe(() => b.platform.on(E.AUDIO_STATE_CHANGED || 'audio_state_changed', on => { this.muted = !on; this.hooks.audio(); this.hooks.mute(); }));
    this.safe(() => b.platform.on(E.PAUSE_STATE_CHANGED || 'pause_state_changed', paused => { this.platformPaused = !!paused; this.hooks.audio(); }));
    const route = kind => state => {
      const a = this._ad; if(!a || a.kind !== kind) return;
      if(state === 'opened') a.opened();
      else if(state === 'rewarded') a.rewarded = true;
      else if(state === 'closed'){ this._ad = null; a.end(kind === 'rewarded' ? a.rewarded : true); }
      else if(state === 'failed'){ this._ad = null; a.end(false); }
    };
    b.advertisement.on(E.INTERSTITIAL_STATE_CHANGED || 'interstitial_state_changed', route('interstitial'));
    b.advertisement.on(E.REWARDED_STATE_CHANGED || 'rewarded_state_changed', route('rewarded'));
  },
  msg(m){ this.safe(() => this.sdk && this.sdk.platform.sendMessage(m)); },
  loadingStop(){ this.msg('game_ready'); },
  onStart(){ this.msg('gameplay_started'); },
  onStop(){ this.msg('gameplay_stopped'); },
  showAd(type, opened, end){
    if(!this.sdk) return end(false);
    const kind = type === 'rewarded' ? 'rewarded' : 'interstitial';
    const a = { kind, opened, end, rewarded:false }; this._ad = a;
    if(kind === 'rewarded') this.sdk.advertisement.showRewarded('bonus');
    else this.sdk.advertisement.showInterstitial('level_complete');
    // interstitials may be skipped silently by the minimum-delay timer
    if(kind === 'interstitial') setTimeout(() => { if(this._ad === a && !this.adPlaying){ this._ad = null; end(false); } }, 4000);
  }
});
