/* Yandex Games SDK v2 — https://yandex.com/dev/games/doc/en/sdk/sdk-about
   Yandex serves /sdk.js itself. External resources are not allowed there, so friend matches are off in this build.
   Progress is saved to Yandex player data (and mirrored to localStorage). */
Object.assign(window.PLATFORM, {
  id:'yandex',
  features:{ ads:true, rewarded:true, friends:false },
  _data:{}, _player:null, _saveT:0,
  async init(){
    if(!window.YaGames){ this.features.ads = false; return; }
    const ysdk = await window.YaGames.init();
    this.sdk = ysdk;
    this.safe(() => ysdk.on('game_api_pause', () => { this.platformPaused = true; this.hooks.audio(); }));
    this.safe(() => ysdk.on('game_api_resume', () => { this.platformPaused = false; this.hooks.audio(); }));
    try{
      this._player = await ysdk.getPlayer({ scopes:false });
      this._data = (await this._player.getData()) || {};
    }catch(e){ this._player = null; }
  },
  loadingStop(){ this.safe(() => this.sdk.features.LoadingAPI && this.sdk.features.LoadingAPI.ready()); },
  onStart(){ this.safe(() => this.sdk.features.GameplayAPI && this.sdk.features.GameplayAPI.start()); },
  onStop(){ this.safe(() => this.sdk.features.GameplayAPI && this.sdk.features.GameplayAPI.stop()); },
  storageGet(k){
    if(this._data && this._data[k] != null) return String(this._data[k]);
    try{ return localStorage.getItem(k); }catch(e){ return null; }
  },
  storageSet(k, v){
    try{ localStorage.setItem(k, v); }catch(e){}
    this._data[k] = v;
    if(this._player){ clearTimeout(this._saveT); this._saveT = setTimeout(() => this.safe(() => this._player.setData(this._data, false)), 1500); }
  },
  showAd(type, opened, end){
    if(!this.sdk) return end(false);
    if(type === 'rewarded'){
      let got = false;
      this.sdk.adv.showRewardedVideo({ callbacks:{ onOpen:opened, onRewarded:() => { got = true; }, onClose:() => end(got), onError:() => end(false) } });
    } else {
      this.sdk.adv.showFullscreenAdv({ callbacks:{ onOpen:opened, onClose:shown => end(!!shown), onError:() => end(false), onOffline:() => end(false) } });
    }
  }
});
