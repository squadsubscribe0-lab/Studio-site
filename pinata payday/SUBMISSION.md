# Piñata Payday: CrazyGames submission sheet

## Files
- Game upload: `pinata-payday-crazygames.zip` (index.html at the root, 444 KB zipped, 5 files)
- Covers: `covers/cover-landscape-1920x1080.png`, `covers/cover-portrait-800x1200.png`, `covers/cover-square-800x800.png`
- Preview videos (16.9 s, 30 fps, H.264 MP4, no audio, open on the cover): `preview-landscape-1920x1080.mp4`, `preview-portrait-1080x1620.mp4`
- Everything for the upload form is in the `upload/` folder.

## Form fields (copy-paste)
**Title:** Piñata Payday

**Short description:**
Smash swinging piñatas, chain combos, beat giant boss piñatas and pay your bills before the late fees pile up.

**Description:**
Rent is due and your bank account is empty. Luckily, the party is full of piñatas stuffed with cash. Swing at piñatas swinging on their ropes, watch them crack, and send gold, silver and bronze coins and dollar bills flying. Pay off every bill from your phone bill all the way to your student loan, but pay on time: late bills start taxing everything you earn.

Start with little piñatas that pop in a few hits, then take on big donkeys, golden jackpots, bombs that chain-react and armored piñatas. Hit fast for double and triple cash combos, and beat a giant boss piñata every third day.

Grow a skill tree with 16 skills, buy and upgrade 7 weapons (from a frying pan to a sledgehammer and a golden bat), grab boosts for tomorrow, and find 16 collectibles in gift boxes to complete sets with permanent bonuses. Unlock a birthday bash, a beach party and a spooky night, earn 13 achievements, and come back daily for a bigger bonus and your Piñata Factory earnings.

**Controls:**
- Mouse: click or hold on a piñata to swing the bat
- Touch: tap or hold on a piñata to swing

**Suggested category / tags:** Clicker / Idle; tags: clicker, incremental, 3D, casual, upgrade, smash

**Orientation:** Landscape (portrait works too)

**Mobile:** Supported (touch)

## SDK checklist (already in the build)
- [x] SDK v3 script and `await SDK.init()`
- [x] `loadingStart` / `loadingStop`
- [x] `gameplayStart` when a day starts, `gameplayStop` on the end-of-day screen
- [x] `happytime` when a bill is paid and when a boss piñata is beaten
- [x] Midgame ad when leaving the end-of-day screen (from day 4 on; the SDK also enforces its own cooldown)
- [x] Rewarded ads (all optional, the game still works when an ad fails or an adblocker is on):
  - "Watch an ad: +$X more" on the end-of-day screen
  - "Watch an ad: collect 2x" on the daily bonus / factory screen
  - "Watch an ad to unlock" for the Neon Bat (it also unlocks with a 30 combo)
- [x] Audio muted and game paused while an ad plays
- [x] `settings.muteAudio` respected, plus an in-game sound toggle
- [x] Data module for saves (localStorage fallback). **Turn on the "Progress Save" toggle in the submission form**, or saves stay local only.
- [x] New players land straight in gameplay (day 1 starts without a menu click)
- [x] No external links, no custom fullscreen button, English text, no third-party CDNs (Three.js and fonts are bundled)

## Leaderboard (optional, needs CrazyGames approval)
CrazyGames leaderboards are invite-only. The game already has the submit code (best day's earnings, AES-GCM encrypted as their docs describe). Once CrazyGames enables a leaderboard for the game:
1. In the developer portal, set it up as: metric POINTS, higher is better, and copy the encryption key.
2. Paste the key into `LEADERBOARD_KEY` near the top of the script in `pinata-payday.html`.
3. Run `python build_crazygames.py` and re-zip.

Until then the in-game "Best" tab shows the player's own top 5 days.

## Before you submit
1. Upload the zip and use CrazyGames' preview/QA tool: play a full day, pay the phone bill, try the rewarded buttons, reach day 3 for the boss.
2. Test on a phone through the CrazyGames preview link.

## Sound credits
All sound effects are CC0 recordings from Kenney's RPG, Casino, Impact, Sci-fi and Interface sound packs (kenney.nl). Credit is optional; `CREDITS.txt` is included in the zip. The game falls back to code-generated tones only if a sound fails to decode.

## Rebuilding
The source is `pinata-payday.html` (it runs as-is in the browser and in the claude.ai artifact; the SDK calls do nothing there). After changing it, run `python tools/embed_sfx.py` (only if sounds in `assets/sfx/` changed) and `python build_crazygames.py` to regenerate `crazygames-build/index.html`, then re-zip.
