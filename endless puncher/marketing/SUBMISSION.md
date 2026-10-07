# Punch Horde: CrazyGames submission kit

## Files to upload
| Field | File |
|---|---|
| Game build (HTML5 zip) | `punch-horde-crazygames.zip` (contents of `dist/`, `index.html` at zip root) |
| Cover 16:9 | `cover-landscape-1920x1080.png` |
| Cover 2:3 | `cover-portrait-800x1200.png` |
| Cover 1:1 | `cover-square-800x800.png` |
| Preview video, landscape 1080p | `preview-landscape-1920x1080.mp4` (18 s, no sound) |
| Preview video, portrait 2:3 1080p | `preview-portrait-1080x1620.mp4` (18 s, no sound) |

Covers show only the game title. Videos have no sound, cursor, text, logo transition or black bars; their first frame is the same scene as the cover.

## Listing text
**Title:** Punch Horde

**Short description:**
Stretch your arms, punch the horde! Level up in every fight, grow extra arms, equip gear and bring elemental slime pets to become the strongest brawler in the ring.

**Description:**
Punch Horde is an arena brawler where you fight wave after wave of enemies with super-stretchy arms. Your fighter punches automatically, so focus on moving around the ring and choosing the right skill on every level-up: grow extra arms, set your gloves on fire, chain lightning between enemies or slam the ground with a shockwave.

Between fights, make your fighter stronger:
- Equip and upgrade gloves, helmets, armor and more, and merge 3 items into a higher rarity.
- Summon elemental slime pets that hop beside you and shoot enemies.
- Learn talents to boost attack, health, experience and gold.
- Upgrade your ring to unlock powerful traits.
- Smash a car in the bonus event for extra coins.

Clear stages, beat the boss and see how far you can punch!

**Controls:**
- Desktop: WASD / arrow keys to move (or drag with the mouse). Punching is automatic. Space / click to punch faster in the car event.
- Mobile: drag anywhere to move. Punching is automatic. Tap rapidly in the car event.

**Suggested tags:** Brawler, Idle, Arena, Upgrade, Pets, Casual, 3D, Mobile

**Orientation:** both (portrait and landscape).

## Compliance checklist (CrazyGames requirements)
- [x] SDK v3 loaded from `sdk.crazygames.com`, `init()` awaited before use; sitelock is handled by the v3 SDK.
- [x] `loadingStart` / `loadingStop` around boot.
- [x] `gameplayStart` / `gameplayStop` from one place (`syncGameplay` in `src/main.js`): on only while fighting; menus, pause dialogs, results screens and ads are breaks. Focus loss is not reported (platform handles it). Calls are spaced ≥1.1 s to respect SDK throttling.
- [x] `happytime` only on stage clear.
- [x] Midgame ads only between stages (natural break), SDK controls frequency.
- [x] During every ad: game paused, audio muted, input blocked (`#adShield`).
- [x] Rewarded ads: reward only on `adFinished`, never on `adError`; video icon on every ad button; ad and non-ad buttons have the same size, font and color; offers live only on non-gameplay screens (results, menus, pause dialogs); cooldown timers on free chest / free summon; one revive per run; visible confirmation animation after reward; a non-ad way exists for every reward.
- [x] Adblock: game fully playable; ad buttons are removed and replaced by a notice (not clickable-but-broken).
- [x] `settings.muteAudio` respected (+ settings change listener). AudioContext resumed on user gesture (iOS).
- [x] Progress saved with `SDK.data` (falls back to localStorage outside CrazyGames).
- [x] New players land straight in gameplay (no start menu).
- [x] No custom fullscreen button, no external links, no cross-promotion, English UI.
- [x] Arrow keys / space don't scroll the page; right-click menu disabled; text selection disabled.
- [x] Relative paths only (`base: './'`); build ≈1.5 MB total (well under the 20 MB mobile-homepage limit), < 100 files.
- [x] Frame-rate independent simulation (delta-time, capped step).
- [x] PEGI 12-friendly cartoon violence.

## Regenerating assets
1. `npm run dev`
2. Open `http://localhost:5173/capture.html?job=covers` (or `video-landscape`, `video-portrait`, `all`). Files land in `marketing/`.
3. Encode videos:
   ```
   ffmpeg -y -framerate 30 -i marketing/video-landscape/f_%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 -an -movflags +faststart marketing/preview-landscape-1920x1080.mp4
   ffmpeg -y -framerate 30 -i marketing/video-portrait/f_%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 -an -movflags +faststart marketing/preview-portrait-1080x1620.mp4
   ```
