/* Poki SDK v2 — https://sdk.poki.com/html5 */
Object.assign(window.PLATFORM, {
  id:'poki',
  features:{ ads:true, rewarded:true, friends:true },
  canInvite:true,
  async init(){
    if(!window.PokiSDK){ this.features.ads = false; this.canInvite = false; return; }
    try{ await window.PokiSDK.init(); }catch(e){ /* adblock: game must still run */ this.adblock = true; }
    this.sdk = window.PokiSDK;
  },
  loadingStop(){ this.safe(() => this.sdk && this.sdk.gameLoadingFinished()); },
  onStart(){ this.safe(() => this.sdk && this.sdk.gameplayStart()); },
  onStop(){ this.safe(() => this.sdk && this.sdk.gameplayStop()); },
  inviteLink(params){ return this.sdk ? this.sdk.shareableURL(params) : null; },
  inviteRoom(){ return this.safe(() => this.sdk && this.sdk.getURLParam('room')) || null; },
  showAd(type, opened, end){
    if(!this.sdk) return end(false);
    if(type === 'rewarded') this.sdk.rewardedBreak({ size:'medium', onStart:opened }).then(ok => end(!!ok)).catch(() => end(false));
    else this.sdk.commercialBreak(opened).then(() => end(true)).catch(() => end(false));
  }
});
