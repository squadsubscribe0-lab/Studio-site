# Platform builds

Each folder holds one self-contained `index.html`, built from the CrazyGames source by
`node tools/build-platforms.js`. Only the Platform layer differs: ads, storage, lifecycle calls
and the SDK script tag. The game, rules and art are identical everywhere.

Rebuild after any change to `index (1).html`, otherwise the builds go stale.

## playgama/ — Playgama Bridge
- SDK: `https://bridge.playgama.com/v2/stable/playgama-bridge.js`
- Interstitial between games, rewarded ad for Revive, 60 s minimum gap between interstitials.
- Settings are saved with `bridge.storage`, never localStorage, so cloud saves work.
- Sends `in_game_loading_started/stopped`, `game_ready`, `level_started/paused/completed`.
- **You must add** `playgama-bridge-config.json` next to `index.html`. Generate it with Playgama's
  config editor for your game; Bridge loads it from `./playgama-bridge-config.json`.

## gamedistribution/ — GameDistribution
- SDK: `https://html5.api.gamedistribution.com/main.min.js`
- **You must fill in** `gameId: "GD-GAME-ID-HERE"` with the id from developer.gamedistribution.com.
- Interstitial (`showAd()`) between games; rewarded (`preloadAd('rewarded')` + `showAd('rewarded')`)
  for Revive, and the reward is only given after `SDK_REWARDED_WATCH_COMPLETE`.
- Rewarded ads must also be enabled for the game in the GD dashboard, or the Revive button stays hidden.
- `SDK_GAME_PAUSE` / `SDK_GAME_START` pause, mute and resume the game.

## gamemonetize/ — GameMonetize
- SDK: `https://api.gamemonetize.com/sdk.js`
- **You must fill in** `gameId: "GAMEMONETIZE-GAME-ID-HERE"` from gamemonetize.com.
- `sdk.showBanner()` is used as the interstitial between games.
- GameMonetize has no rewarded ad format, so the Revive button never appears in this build.

## youtube-playables/ — YouTube Playables
- SDK: `https://www.youtube.com/game_api/v1`, loaded before the game code.
- `firstFrameReady()` and `gameReady()` are called; `onPause` / `onResume` pause the game;
  `isAudioEnabled()` and `onAudioEnabledChange()` follow YouTube's mute setting.
- All settings go through `saveData()` / `loadData()`, because no other save mechanism is allowed.
  `loadData()` is awaited before the first save.
- Ads: `requestInterstitialAd()` between games, `requestRewardedAd('revive')` for Revive.
- The font is embedded in the file and **online play is hidden**: PeerJS needs outside servers, which
  Playables does not allow. This build is bot and 2-players-on-one-device only.
