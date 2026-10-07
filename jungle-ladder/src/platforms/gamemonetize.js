/* GameMonetize SDK — https://github.com/GameMonetize/GameMonetize.com-SDK
   Put your GameId (game hash from the GameMonetize control panel) below. GameMonetize documents no rewarded ads. */
const GM_GAME_ID = 'YOUR_GAMEMONETIZE_GAME_ID';
Object.assign(window.PLATFORM, {
  id:'gamemonetize',
  features:{ ads:true, rewarded:false, friends:true },
  _pending:null,
  init(){
    return new Promise(resolve => {
      let finished = false; const done = () => { if(!finished){ finished = true; resolve(); } };
      window.SDK_OPTIONS = {
        gameId: GM_GAME_ID,
        onEvent: a => {
          switch(a && a.name){
            case 'SDK_READY': this.sdk = window.sdk; done(); break;
            case 'SDK_GAME_PAUSE': this.adPlaying = true; this.hooks.audio(); if(this._pending) this._pending.started = true; break;
            case 'SDK_GAME_START': this.adPlaying = false; this.hooks.audio(); if(this._pending){ const p = this._pending; this._pending = null; p.end(true); } break;
          }
        }
      };
      this.loadScript('https://api.gamemonetize.com/sdk.js', { id:'gamemonetize-sdk' }).then(ok => { if(!ok){ this.features.ads = false; done(); } });
      setTimeout(done, 4000);
    });
  },
  showAd(type, opened, end){
    const s = window.sdk;
    if(!s || typeof s.showBanner !== 'function') return end(false);
    const p = { started:false, end }; this._pending = p;
    s.showBanner();
    // showBanner has no promise: if no ad starts shortly, carry on
    setTimeout(() => { if(this._pending === p && !p.started){ this._pending = null; end(false); } }, 3500);
  }
});
