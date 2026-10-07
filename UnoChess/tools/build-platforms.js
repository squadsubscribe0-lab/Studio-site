// Builds one HTML file per portal from the CrazyGames source, swapping only the Platform layer
// (the game's own abstraction over ads, storage, lifecycle and invites).
//   node tools/build-platforms.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
// normalise line endings so the markers below match whatever the source file uses
const SRC = fs.readFileSync(path.join(ROOT, 'index (1).html'), 'utf8').split('\r\n').join('\n');
const CG_SCRIPT = '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>';
const FONT_LINK = /<link rel="preconnect"[\s\S]*?family=Baloo\+2[^>]*>\n/;
const START = 'const Platform = {', END = '/* =========================================================\n   NETWORK';

const shared = `
  playing:false, inRoom:false, cache:{},
  call(fn){ try{ fn(); }catch(e){} },
  banner(){}, clearBanners(){},
  room(){}, leaveRoom(){}, onJoinRoom(){}, context(){},
  get instantMultiplayer(){ return false; },
  async userName(){ return null; },
  inviteLink(params){
    const u=new URL(location.href); u.search='';
    for(const k in params) u.searchParams.set(k,params[k]);
    if(Net.useBC()) u.searchParams.set('net','bc');
    return u.toString();
  },
  param(name){ return new URLSearchParams(location.search).get(name); },
`;

/* ---------------- Playgama Bridge ---------------- */
const playgama = `const Platform = {
  bridge:null, pendingStart:false,
  _keys:['wg_board','wg_time','wg_played','wg_seen_skip','wg_seen_draw2','wg_seen_rev','wg_seen_wild',
         'wg_games','wg_wins','wg_streak','wg_best','wg_daily_day','wg_daily_streak','wg_daily_best'],
${shared}
  async init(){
    try{
      const b=window.bridge; if(!b) return;
      await b.initialize(); this.bridge=b;
      const vals=await b.storage.get(this._keys);
      this._keys.forEach((k,i)=>{ if(vals[i]!=null) this.cache[k]=String(vals[i]); });
      try{ Sfx.sdkMute = b.platform.isAudioEnabled===false; }catch(e){}
      try{
        b.platform.on(b.EVENT_NAME.AUDIO_STATE_CHANGED, on=>{ Sfx.sdkMute=!on; });
        b.platform.on(b.EVENT_NAME.PAUSE_STATE_CHANGED, p=>{ p ? pauseGame() : resumeGame(); });
      }catch(e){}
      try{ b.advertisement.setMinimumDelayBetweenInterstitial(60); }catch(e){}
    }catch(e){ this.bridge=null; }
    // the player can start a game before Bridge is up; send what they missed
    setTimeout(()=>{ if(this.pendingStart){ this.pendingStart=false; this.start(); } },0);   // after game_ready
  },
  loadingStart(){ this.call(()=>this.bridge && this.bridge.platform.sendMessage('in_game_loading_started')); },
  loadingStop(){ this.call(()=>{ if(!this.bridge) return; const p=this.bridge.platform;
    p.sendMessage('in_game_loading_stopped'); p.sendMessage('game_ready'); }); },
  start(){ if(this.playing) return; if(!this.bridge){ this.pendingStart=true; return; }
    this.playing=true; this.call(()=>this.bridge.platform.sendMessage('level_started')); },
  stop(){ this.pendingStart=false; if(!this.playing) return; this.playing=false;
    this.call(()=>this.bridge && this.bridge.platform.sendMessage('level_paused')); },
  happy(){ this.call(()=>this.bridge && this.bridge.platform.sendMessage('level_completed')); },
  get hasRewarded(){ return !!this.bridge; },

  midgame(done){
    const b=this.bridge; if(!b){ done && done(); return; }
    let fin=false; const end=()=>{ if(fin) return; fin=true; Sfx.adMute=false; done && done(); };
    try{
      const off=b.advertisement.on(b.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, s=>{
        if(s==='opened') Sfx.adMute=true;
        if(s==='closed' || s==='failed'){ end(); if(typeof off==='function') off(); }
      });
      b.advertisement.showInterstitial('between_games');
      setTimeout(end,45000);                       // never leave the game waiting on an ad
    }catch(e){ end(); }
  },
  rewarded(onReward,onFail){
    const b=this.bridge; if(!b){ onFail ? onFail('unavailable') : onReward(); return; }
    let fin=false, got=false;
    const end=()=>{ if(fin) return; fin=true; Sfx.adMute=false; got ? onReward() : (onFail ? onFail('no-reward') : onReward()); };
    try{
      const off=b.advertisement.on(b.EVENT_NAME.REWARDED_STATE_CHANGED, s=>{
        if(s==='opened') Sfx.adMute=true;
        if(s==='rewarded') got=true;
        if(s==='closed' || s==='failed'){ end(); if(typeof off==='function') off(); }
      });
      b.advertisement.showRewarded('revive');
      setTimeout(end,60000);
    }catch(e){ end(); }
  },
  getItem(k){ return k in this.cache ? this.cache[k] : null; },
  setItem(k,v){ this.cache[k]=String(v); this.call(()=>this.bridge && this.bridge.storage.set([k],[String(v)])); }
};

`;

/* ---------------- GameDistribution ---------------- */
const gd = `const Platform = {
  sdk:null, rewardedReady:false, _rewardSeen:false,
${shared}
  async init(){
    window.GD_OPTIONS = {
      gameId: "GD-GAME-ID-HERE",                   // paste the game id from developer.gamedistribution.com
      onEvent: (event)=>{
        switch(event.name){
          case 'SDK_GAME_PAUSE': Sfx.adMute=true; pauseGame(); break;
          case 'SDK_GAME_START': Sfx.adMute=false; resumeGame(); break;
          case 'SDK_REWARDED_WATCH_COMPLETE': this._rewardSeen=true; break;
        }
      }
    };
    (function(d,s,id){ var js,fjs=d.getElementsByTagName(s)[0]; if(d.getElementById(id)) return;
      js=d.createElement(s); js.id=id; js.src='https://html5.api.gamedistribution.com/main.min.js';
      fjs.parentNode.insertBefore(js,fjs); }(document,'script','gamedistribution-jssdk'));
    await new Promise(res=>{ const t=setInterval(()=>{ if(window.gdsdk){ clearInterval(t); res(); } },100); setTimeout(()=>{ clearInterval(t); res(); },8000); });
    this.sdk = window.gdsdk || null;
    this.preloadRewarded();
  },
  preloadRewarded(){
    if(!this.sdk || !this.sdk.preloadAd) return;
    try{ this.sdk.preloadAd('rewarded').then(()=>{ this.rewardedReady=true; }).catch(()=>{ this.rewardedReady=false; }); }catch(e){}
  },
  loadingStart(){}, loadingStop(){},
  start(){ this.playing=true; }, stop(){ this.playing=false; }, happy(){},
  get hasRewarded(){ return !!this.sdk && this.rewardedReady; },

  midgame(done){
    if(!this.sdk || !this.sdk.showAd){ done && done(); return; }
    let fin=false; const end=()=>{ if(fin) return; fin=true; Sfx.adMute=false; done && done(); };
    try{ this.sdk.showAd().then(end).catch(end); setTimeout(end,45000); }catch(e){ end(); }
  },
  rewarded(onReward,onFail){
    if(!this.sdk || !this.sdk.showAd || !this.rewardedReady){ onFail ? onFail('unavailable') : onReward(); return; }
    this._rewardSeen=false;
    let fin=false;
    const end=()=>{ if(fin) return; fin=true; Sfx.adMute=false; this.rewardedReady=false; this.preloadRewarded();
      this._rewardSeen ? onReward() : (onFail ? onFail('no-reward') : onReward()); };
    try{ this.sdk.showAd('rewarded').then(end).catch(end); setTimeout(end,60000); }catch(e){ end(); }
  },
  getItem(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  setItem(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};

`;

/* ---------------- GameMonetize ---------------- */
const gm = `const Platform = {
  sdk:null, _adDone:null,
${shared}
  async init(){
    window.SDK_OPTIONS = {
      gameId: "GAMEMONETIZE-GAME-ID-HERE",         // paste the game id from gamemonetize.com
      onEvent: (a)=>{
        switch(a.name){
          case 'SDK_GAME_PAUSE': Sfx.adMute=true; pauseGame(); break;
          case 'SDK_GAME_START': Sfx.adMute=false; resumeGame(); if(this._adDone){ const f=this._adDone; this._adDone=null; f(); } break;
        }
      }
    };
    (function(a,b,c){ var d=a.getElementsByTagName(b)[0];
      a.getElementById(c) || (a=a.createElement(b), a.id=c, a.src='https://api.gamemonetize.com/sdk.js', d.parentNode.insertBefore(a,d));
    })(document,'script','gamemonetize-sdk');
    await new Promise(res=>{ const t=setInterval(()=>{ if(window.sdk){ clearInterval(t); res(); } },100); setTimeout(()=>{ clearInterval(t); res(); },8000); });
    this.sdk = window.sdk || null;
  },
  loadingStart(){}, loadingStop(){},
  start(){ this.playing=true; }, stop(){ this.playing=false; }, happy(){},
  get hasRewarded(){ return false; },                // GameMonetize has no rewarded ad format

  midgame(done){
    if(!this.sdk || !this.sdk.showBanner){ done && done(); return; }
    let fin=false; const end=()=>{ if(fin) return; fin=true; this._adDone=null; Sfx.adMute=false; done && done(); };
    this._adDone=end;
    try{ this.sdk.showBanner(); setTimeout(end,45000); }catch(e){ end(); }
  },
  rewarded(onReward,onFail){ onFail ? onFail('unavailable') : onReward(); },
  getItem(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  setItem(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};

`;

/* ---------------- YouTube Playables ---------------- */
const yt = `const Platform = {
  yt:null, loaded:false, _save:null,
${shared}
  async init(){
    const g = (typeof ytgame!=='undefined' && ytgame.IN_PLAYABLES_ENV) ? ytgame : null;
    this.yt = g; if(!g) return;
    try{ Sfx.sdkMute = !g.system.isAudioEnabled(); }catch(e){}
    try{ g.system.onAudioEnabledChange(on=>{ Sfx.sdkMute=!on; }); }catch(e){}
    try{ g.system.onPause(()=>pauseGame()); g.system.onResume(()=>resumeGame()); }catch(e){}
    try{ const raw=await g.game.loadData(); if(raw) this.cache=JSON.parse(raw)||{}; }catch(e){ this.cache={}; }
    this.loaded=true;
  },
  // firstFrameReady must fire before init() finishes, so it looks the SDK up itself
  loadingStart(){ this.call(()=>{ if(typeof ytgame!=='undefined' && ytgame.IN_PLAYABLES_ENV) ytgame.game.firstFrameReady(); }); },
  loadingStop(){ this.call(()=>this.yt && this.yt.game.gameReady()); },
  start(){ this.playing=true; }, stop(){ this.playing=false; }, happy(){},
  get hasRewarded(){ return !!this.yt; },

  midgame(done){
    const g=this.yt; if(!g){ done && done(); return; }
    let fin=false; const end=()=>{ if(fin) return; fin=true; Sfx.adMute=false; done && done(); };
    try{ Sfx.adMute=true; g.ads.requestInterstitialAd().then(end).catch(end); setTimeout(end,45000); }catch(e){ end(); }
  },
  rewarded(onReward,onFail){
    const g=this.yt; if(!g){ onFail ? onFail('unavailable') : onReward(); return; }
    let fin=false;
    const end=ok=>{ if(fin) return; fin=true; Sfx.adMute=false; ok ? onReward() : (onFail ? onFail('no-reward') : onReward()); };
    try{ Sfx.adMute=true; g.ads.requestRewardedAd('revive').then(ok=>end(!!ok)).catch(()=>end(false)); setTimeout(()=>end(false),60000); }catch(e){ end(false); }
  },
  // YouTube Playables allows no other save mechanism, so everything goes through saveData()
  getItem(k){ return k in this.cache ? String(this.cache[k]) : null; },
  setItem(k,v){
    this.cache[k]=String(v);
    if(!this.yt || !this.loaded) return;
    clearTimeout(this._save);
    this._save=setTimeout(()=>{ this.call(()=>this.yt.game.saveData(JSON.stringify(this.cache)).catch(()=>{})); },400);
  }
};

`;

const CG_COMMENT = `   PLATFORM LAYER — CrazyGames SDK v3 (ads, banners, invites, user, data)
   Everything here is a safe no-op when the SDK isn't available, so the
   same file runs on your own site. Swap this object for Poki/GD builds.`;

const BUILDS = [
  { dir: 'playgama', title: 'Playgama Bridge (ads, storage, lifecycle)', adapter: playgama,
    head: '<script src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>',
    extra: { 'playgama-bridge-config.json': JSON.stringify({
      advertisement: {
        minimumDelayBetweenInterstitial: 60,
        interstitial: { placements: [{ id: 'between_games' }] },
        rewarded: { placements: [{ id: 'revive' }] }
      }
    }, null, 2) + '\n' } },
  { dir: 'gamedistribution', title: 'GameDistribution HTML5 SDK (ads)', adapter: gd, head: '' },
  { dir: 'gamemonetize', title: 'GameMonetize SDK (ads)', adapter: gm, head: '' },
  { dir: 'youtube-playables', title: 'YouTube Playables SDK (ads, cloud save, audio)', adapter: yt, head: '<script src="https://www.youtube.com/game_api/v1"></script>', offline: true },
];

for (const b of BUILDS) {
  const i = SRC.indexOf(START), j = SRC.indexOf(END);
  if (i < 0 || j < 0) throw new Error('Platform block not found');
  let out = SRC.slice(0, i) + b.adapter + SRC.slice(j);
  out = out.replace(CG_SCRIPT, b.head)
    .replace(CG_COMMENT, '   PLATFORM LAYER — ' + b.title +
      '\n   Every call is a safe no-op when the SDK is missing, so the file also runs on its own.')
    .replace('/* accepting a CrazyGames invite while the game is already open */',
      '/* accepting an invite while the game is already open */');
  if (b.offline) {
    // no external servers: inline the font, and hide online play (PeerJS needs outside servers)
    const font = fs.readFileSync(path.join(__dirname, 'baloo2.css'), 'utf8');
    out = out.replace(FONT_LINK, '').replace('<style>\n', '<style>\n' + font + '#playOnline{display:none}\n');
  }
  const dir = path.join(ROOT, 'builds', b.dir);
  fs.mkdirSync(dir, { recursive: true });
  if (b.extra) for (const [name, body] of Object.entries(b.extra)) fs.writeFileSync(path.join(dir, name), body);
  fs.writeFileSync(path.join(dir, 'index.html'), out);
  console.log(b.dir, (out.length / 1024).toFixed(0) + ' KB');
}
