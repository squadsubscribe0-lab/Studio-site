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
