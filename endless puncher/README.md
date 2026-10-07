# Punch Horde

Idle arena brawler for CrazyGames (portrait + landscape). Three.js, no external assets.

## Develop
```
npm install
npm run dev
```

## Build & upload to CrazyGames
```
npm run build
```
Zip the **contents** of `dist/` (index.html at the zip root) and upload it in the CrazyGames developer portal as an HTML5 game. Enable both orientations and, optionally, the Data module so saves sync across devices.

## CrazyGames SDK v3 integration (src/sdk.js)
- `loadingStart/Stop` around boot
- `gameplayStart/Stop` on battle vs. menus, results screens and ads
- `happytime` on stage clear
- Rewarded ads: revive, x2 stage rewards, x3 event rewards, x2 offline earnings, free chest, free pet summon, speed-up unlock, extra car event
- Midgame ad every 2 stages, between fights
- Saves via `SDK.data` (falls back to localStorage), honours the portal's `muteAudio` setting
- Arrow keys / space don't scroll the page, and the context menu is disabled

## Controls
Drag anywhere (or WASD / arrow keys) to move. Punching is automatic. In the car event, tap / space to punch faster.
