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
