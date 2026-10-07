/* Y8 SDK 2.0 — https://docs.y8.com/sdk/intro/
   Put your App ID and Game ID from the Y8 Developer Portal (SDK Initialization page) below. */
const Y8_APP_ID = 'YOUR_Y8_APP_ID';
const Y8_GAME_ID = 'YOUR_Y8_GAME_ID';
Object.assign(window.PLATFORM, {
  id:'y8',
  features:{ ads:true, rewarded:true, friends:true },
  init(){
    return new Promise(resolve => {
      let finished = false; const done = () => { if(!finished){ finished = true; resolve(); } };
      window.addEventListener('y8sdk.ready', () => {
        try{
          const s = window.y8.sdk();
          s.init({ appId:Y8_APP_ID, autoLogin:true }, { gameId:Y8_GAME_ID, preloadAdBreaks:'on', sound:'on', onReady:() => {} });
          s.onAuth((user, err) => { if(!err && user) this.user = { username:user.nickname || user.username || '' }; });
          this.sdk = s;
        }catch(e){ this.features.ads = false; }
        done();
      }, { once:true });
      if(window.y8 && window.y8.emitReadyEvent) window.y8.emitReadyEvent();
      setTimeout(() => { if(!this.sdk) this.features.ads = false; done(); }, 4000);
    });
  },
  showAd(type, opened, end){
    if(!this.sdk) return end(false);
    const reward = type === 'rewarded'; let viewed = false;
    this.sdk.showAd({
      type: reward ? 'reward' : 'next',
      name: reward ? 'bonus-bananas' : 'level-complete',
      beforeAd: opened,
      afterAd: () => {},
      beforeReward: showAdFn => showAdFn(),
      adViewed: () => { viewed = true; },
      adDismissed: () => {},
      adBreakDone: () => end(reward ? viewed : true)
    }).catch(() => end(false));
  }
});
