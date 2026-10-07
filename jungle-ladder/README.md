# Jungle Ladder — multi-portal project

One game, one codebase, a separate build folder for every portal.

```
jungle-ladder/
├── build.js                  node build.js  → rebuilds every portal
├── src/                      edit the game HERE, never inside builds/
│   ├── index.template.html   markup (SDK tags and scripts are filled in by build.js)
│   ├── css/style.css
│   ├── js/game.js            all gameplay, UI, menu, upgrades, sticks, friend mode
│   ├── js/vendor/            peerjs.min.js, playgama-bridge.js (bundled, no CDN)
│   ├── fonts/                Fredoka woff2 (bundled, no Google Fonts request)
│   └── platforms/            _base.js + one adapter per portal
└── builds/<portal>/          generated, upload-ready (plus builds/<portal>.zip)
```

## Workflow

1. Change the game in `src/` (usually `src/js/game.js`).
2. Run `node build.js` (or `node build.js poki yandex` for just some portals).
3. Upload `builds/<portal>.zip` (index.html is at the root of every zip).

The game never calls a portal SDK directly. It only talks to `window.PLATFORM`,
and each file in `src/platforms/` maps that interface to one portal's SDK.

## Portals

| Folder | Ads | Rewarded | Friend match | Save | Fill in before upload |
|---|---|---|---|---|---|
| crazygames | midgame + rewarded | yes | yes (room + invite link) | CrazyGames Data module | nothing (select "Progress Save" in submission) |
| poki | commercialBreak | rewardedBreak | yes (shareable URL) | localStorage | nothing |
| gamedistribution | interstitial | yes | yes | localStorage | `GD_GAME_ID` in `src/platforms/gamedistribution.js`, enable Rewarded Ads in the GD dashboard |
| gamemonetize | showBanner | no (not offered by GameMonetize) | yes | localStorage | `GM_GAME_ID` in `src/platforms/gamemonetize.js` |
| gamepix | interstitialAd | rewardAd | **off** (GamePix bans external resources) | GamePix.localStorage | nothing |
| lagged | APIAds | GEvents.reward | yes | localStorage | `LAGGED_DEV_ID`, `LAGGED_PUBLISHER_ID` in `src/platforms/lagged.js` |
| newgrounds | none (site ads) | no | yes | localStorage | nothing |
| playgama | Bridge interstitial | Bridge rewarded | yes | localStorage | add `playgama-bridge-config.json` (make it on the Playgama Bridge config page) next to index.html |
| y8 | showAd next | showAd reward | yes | localStorage | `Y8_APP_ID`, `Y8_GAME_ID` in `src/platforms/y8.js` |
| yandex | fullscreen adv | rewarded video | **off** (external connections) | Yandex player data + localStorage | nothing; add Russian text if Yandex moderation asks for it |
| selfhost | none | no | yes | localStorage | nothing |
| standalone | none | no | yes | localStorage | nothing (single index.html, everything inlined) |

When a portal has no rewarded ads, or the SDK is blocked, the rewarded buttons are hidden
and the "Skip for 150 bananas" option is still there, so no button ever does nothing.

## Friend match (PeerJS)

Uses the free public PeerJS signalling server. For a real launch, run your own PeerServer
and pass its host in `new window.Peer(...)` inside `src/js/game.js`.
Upgrades are switched off in friend matches so races stay fair.

## Adding another portal

1. Create `src/platforms/<name>.js` with `Object.assign(window.PLATFORM, { id:'<name>', features:{...}, ... })`
   and implement only what that portal needs (see `_base.js` for the full interface).
2. Add an entry for it to `PORTALS` at the top of `build.js` (SDK script tag + vendor files).
3. `node build.js <name>`.
