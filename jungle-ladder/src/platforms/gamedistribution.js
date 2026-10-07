/* GameDistribution HTML5 SDK — https://github.com/GameDistribution/GD-HTML5
   Put your Game ID (developer.gamedistribution.com > Upload tab) below, and enable Rewarded Ads for the game there. */
const GD_GAME_ID = 'YOUR_GAMEDISTRIBUTION_GAME_ID';
Object.assign(window.PLATFORM, {
  id:'gamedistribution',
  features:{ ads:true, rewarded:true, friends:true },
  _rewardDone:false,
  init(){
    return new Promise(resolve => {
      let finished = false; const done = () => { if(!finished){ finished = true; resolve(); } };
      window.GD_OPTIONS = {
        gameId: GD_GAME_ID,
        onEvent: ev => {
          switch(ev && ev.name){
            case 'SDK_READY': this.sdk = window.gdsdk; done(); break;
            case 'SDK_ERROR': done(); break;
            case 'SDK_GAME_PAUSE': this.adPlaying = true; this.hooks.audio(); break;     // also fires for prerolls
            case 'SDK_GAME_START': this.adPlaying = false; this.hooks.audio(); break;
            case 'SDK_REWARDED_WATCH_COMPLETE': this._rewardDone = true; break;
          }
        }
      };
      this.loadScript('https://html5.api.gamedistribution.com/main.min.js', { id:'gamedistribution-jssdk' }).then(ok => { if(!ok){ this.features.ads = false; done(); } });
      setTimeout(done, 4000);
    });
  },
  showAd(type, opened, end){
    const gd = window.gdsdk;
    if(!gd || typeof gd.showAd !== 'function') return end(false);
    this._rewardDone = false; opened();
    gd.showAd(type === 'rewarded' ? 'rewarded' : 'interstitial')
      .then(() => end(type === 'rewarded' ? this._rewardDone : true))
      .catch(() => end(false));
  }
});
