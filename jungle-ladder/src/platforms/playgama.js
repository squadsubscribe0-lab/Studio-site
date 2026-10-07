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
