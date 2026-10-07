# Arrow Out

An HTML5 arrow-clearing puzzle. Tap an arrow and it leaves the board tip first,
its body following its own shape — but only if the straight lane ahead of the tip
is completely empty. Tap a blocked arrow and it crashes, costing a heart.

40 levels, each a different silhouette, 41 arrows on level 1 up to 372 on level 40.

---

## Quick start

```
node build.js              # build every platform into dist/
node build.js poki         # build just one
node test.js standalone    # headless smoke test
ALL=1 node test.js         # play all 40 levels headlessly
```

`build.js` has **no dependencies** — it uses a small ZIP writer built on node's
own `zlib`, so it runs on Windows with nothing installed but node.
(`test.js` needs `npm install jsdom`, but it is only for testing.)

Each build lands in `dist/<platform>/` with a matching `dist/<platform>.zip`
ready to upload.

---

## Project layout

```
src/
  index.html    shell; <!--PLATFORM_HEAD--> is where each SDK script is injected
  style.css     themes + portrait/landscape layout
  game.js       the whole game
  audio/
    music.mp3   background track (96 kbps, ~2 MB)
platforms/
  index.js      one adapter per portal
build.js        generates dist/ folders + zips
test.js         headless playthrough
```

To change the game, edit `src/` and re-run `node build.js`. Never edit `dist/`
— it is overwritten on every build.

---

## Platform setup

Everything builds and runs as-is. Three platforms need an ID pasted in before
you upload; the placeholder strings are in the built `index.html` / `sdk.js`.

| Platform | Ads | Needs from you |
|---|---|---|
| `gamedistribution` | interstitial + rewarded | `__GD_GAME_ID__` in `index.html`, and tick the **rewarded ads** flag on developer.gamedistribution.com or rewarded calls always fail |
| `gamemonetize` | interstitial + rewarded | `__GM_GAME_ID__` in `index.html` |
| `lagged` | interstitial + rewarded | `__LAGGED_DEV_ID__` / `__LAGGED_PUB_ID__` in `sdk.js` |
| `y8` | none | `__Y8_GAME_KEY__` in `sdk.js` |
| `crazygames` | interstitial + rewarded | nothing |
| `poki` | interstitial + rewarded | nothing |
| `yandex` | interstitial + rewarded | nothing |
| `playgama` | interstitial + rewarded | nothing |
| `gamepix` | interstitial + rewarded | nothing |
| `gamearter` | interstitial + rewarded | nothing |
| `newgrounds` | none | nothing |
| `selfhost` / `standalone` | none | nothing |

### How the adapter layer works

`game.js` never knows which portal it is on. It only calls:

```js
Platform.loadingStart()   Platform.loadingStop()
Platform.ready()
Platform.gameplayStart()  Platform.gameplayStop()
Platform.happyTime()
Platform.interstitial()   // -> Promise<void>
Platform.rewarded()       // -> Promise<boolean>
Platform.hasRewarded      // hides the revive button when false
```

Two guarantees hold in every adapter:

1. **Every SDK call is wrapped.** If a portal's script is blocked by an
   adblocker, fails to load, or changes its API, the game still plays — the ad
   promise just resolves immediately. This is tested: the headless suite runs
   every build with no SDK present and all 40 levels still clear.
2. **Ads mute the game** on start and unmute on finish *or* error. Every portal
   requires this for approval.

Ad placement: an interstitial on **Next level** (gameplay has stopped, the player
has already seen their result, and they just asked to continue), and a rewarded
ad on **Out of hearts** that hands back two hearts and drops them straight back
into the board they were working on.

---

## How levels are built

Each level is an ASCII mask in `SHAPES` — `#` marks a cell arrows may occupy.
Rows can be ragged; they are padded to the widest. Masks are then resampled up
to a per-level size from `SCALES`, so the silhouette is unchanged and only the
cell count grows.

Boards are generated **in reverse removal order**. Each new piece only has to
keep its exit lane clear of pieces already placed, because the pieces added
after it are the ones removed before it. Since clearing an arrow only ever
frees cells, the finished board is solvable in *any* greedy order — you can
never lock yourself out, so the challenge is reading the board, not move order.

Two details do most of the work on density:

- **Placement order is by distance to the board edge, descending.** A lane runs
  from the tip to the edge of the board, so what predicts its cost is distance
  to that edge, not depth inside the silhouette. Ordering by silhouette depth
  caps density near 88% and leaves big boards visibly hollow in the middle;
  edge distance holds ~94% even on the largest levels.
- **Among the legal directions, the shortest clear lane wins.** A short lane is
  cheaper to keep clear, leaving more room for later pieces.

Generation is cheap, so each level runs many attempts and keeps the densest,
with the attempt budget scaled to board size. Measured across all 40 levels:
**94.4% average fill, 93% worst case, zero unsolvable boards**, slowest level
load 224 ms.

### Tuning

- `PROFILES` — arrow-length mix per band of 5 levels. Later bands use shorter
  arrows, so late boards are a tighter tangle rather than just a bigger one.
- `SCALES` — per-level mask scale, calibrated to hit the arrow-count curve
  (40 → 355). Change `PROFILES` and you should recalibrate `SCALES`.
- `CFG.hearts` / `hints` / `bombs` / `reveals` — starting resources.

Adding a level is one entry in `SHAPES` plus one number in `SCALES`.

---

## Features

- **40 silhouettes** — square through to lion, skull, plane, elephant, guitar.
- **Colour** — arrows are tinted by position, so the board reads as one diagonal
  gradient. Rainbow / random / mono.
- **Two themes** — neon (dark, glowing) and paper (light, flat).
- **Combo** — consecutive clears without a crash. Drives the pentatonic ladder
  in the audio, so a good run literally sounds like a rising melody.
- **Stars** — three per level, lost for hearts spent and powerups used.
- **Powerups** — hint (highlights one legal arrow), bomb (blasts one arrow out
  regardless of what blocks it — the only thing that breaks the lane rule),
  reveal (flashes every legal arrow for a few seconds).
- **Zen mode** — no hearts, no clock. Crashes still break the combo but nothing
  can end the run.
- **Party popper** on level complete — confetti from both bottom corners plus a
  shower from above, with a synthesised pop and a rising arpeggio.
- **Portrait and landscape** — see below.

### Responsive layout

One CSS grid with two arrangements:

- **Portrait / tall screens** — HUD on top, board in the middle, controls along
  the bottom.
- **Short landscape** (`orientation:landscape` and `max-height:600px`) — HUD and
  controls move into a side rail, because that is where vertical space is scarce
  and horizontal space is not. Below `max-height:430px` every control shrinks
  again so the rail still fits on a phone held sideways.

Keyed on **height**, not orientation alone, so a wide desktop window keeps the
stacked layout instead of growing a pointless side rail.

Two things that bit me here, both worth knowing if you edit the CSS:

1. **Grid children default to `min-width:auto`.** The non-wrapping chip row was
   therefore forcing the whole column wider than the viewport — on a 390 px
   phone the layout came out 476 px wide and the board and zoom buttons hung off
   the screen. Every grid and flex child now has `min-width:0`.
2. **Media queries carry no extra specificity.** The responsive block originally
   sat above the component rules, so the plain rules won and the overrides did
   nothing — the landscape rail kept full-size buttons and the third powerup
   hung off the edge. The responsive block now lives at the *end* of
   `style.css`. Keep it there.

Verified in Chrome at 390×844, 360×640, 844×390, 740×360, 820×1180 and
1440×900: no page overflow, no control overflow, overlays fit and scroll, and
rotating mid-game resizes both canvases and preserves zoom.

### The three helper powerups

| | Uses | What it does |
|---|---|---|
| **Hint** (bulb) | 3 | Flashes **one** arrow that can legally leave right now, in green. Use it when you're stuck and want a nudge rather than the answer. |
| **Bomb** (spark) | 2 | Tap the bomb to arm it, then tap **any** arrow — it blasts out even if something blocks it, and costs no heart. The only thing in the game that breaks the lane rule. Tap the bomb again to disarm. |
| **Reveal** (eye) | 1 | Flashes **every** currently legal arrow green for 3 seconds. Use it when you've lost the thread of a big board. |

Using any of the three costs you a star. Settings also has **Show all open
arrows**, a permanent version of Reveal for testing or an easier ride.

### Camera

Zooming always keeps the board point under the anchor exactly where it is on
screen — pinch anchors between your fingers, wheel anchors to the cursor,
buttons anchor to the centre. Pinch zooms and pans at once, button and
double-tap zooms are eased over 240 ms, and any gesture that ever had two
fingers down suppresses tapping until every finger is up, so ending a pinch
can't detonate an arrow. Pointers released off-canvas or lost to a focus
change are cleaned up, so a missed `pointerup` can't wedge the input layer.

### Instruments

Every arrow you clear plays the next note of a C major pentatonic ladder. The
ladder resets after a short pause, so a fast run of clears comes out as a rising
melody and a hesitant one comes out as single notes.

**Each level plays that ladder on a different instrument, in a different key.**
There are 12 instruments — Piano, Marimba, Music Box, Kalimba, Harp,
Vibraphone, Glass Bell, Nylon Guitar, Flute, Steel Drum, Celesta, Koto — which
rotate across the 40 levels. The key rotates on a cycle of 8, so the two never
line up and level 13 doesn't sound like level 1. The end-of-level fanfare plays
on the same instrument, so finishing sounds like the melody you just built.

Every instrument is synthesised from oscillators at runtime, so the whole bank
costs nothing to download. A voice is defined by its harmonic recipe, envelope,
and optionally a filter sweep (what makes plucks pluck), inharmonic FM (bells),
tremolo (vibraphone) or a noise blend (flute). Adding an instrument is one entry
in `INSTRUMENTS`.

### Audio

Background music is the supplied track, re-encoded to 96 kbps (4.0 MB → 2.0 MB)
and faded rather than cut, so ad breaks and tab switches are not jarring.
All sound effects are synthesised at runtime — no files to load. Clearing arrows
walks up a C major pentatonic ladder that resets after a pause.

Browsers block audio until a user gesture, which is what the **Play** button on
the loading screen is for.

---

### Saving

Progress (level reached, levels cleared, stars) and all settings persist to
`localStorage` under the `arrowout.` prefix. Saves happen on level start and on
level complete, and settings save on every change.

`localStorage` *throws* rather than returning null in several real situations —
Safari private browsing, a cross-origin iframe with storage partitioned off, and
some portal preview sandboxes. Every access is wrapped, availability is probed
once at boot, and if storage is unavailable the game runs exactly as before with
progress held in memory for the session. The settings panel says which mode
you're in. Nothing about saving is load-bearing.

Settings also has **Reset all progress**.

### Colourblind mode

The setting does two things, and the second is the one that matters.

The arrow gradient switches from a rainbow to a blue → cyan → light → amber →
orange ramp, which varies in lightness as well as hue so it still reads as a
gradient. This part is mostly cosmetic: the gradient is decoration, not
information.

**The real fix is the signal colours.** Green meant "this arrow can leave" and
red meant "crash" — the single worst pair for the most common deficiency.
Measured as CIE76 ΔE between the two colours after simulating each deficiency:

| pair | normal | deuteranopia | protanopia | tritanopia |
|---|---|---|---|---|
| old green / red | 131 | **3.5** | 48 | 140 |
| new cyan / orange | 123 | 103 | 80 | 133 |

A ΔE of 3.5 is effectively the same colour. Hints and crashes were
indistinguishable for roughly 1 in 12 men. Colourblind mode swaps them to
cyan/orange, worst case ΔE 80.

## Known limitations
- **GamePix, Playgama, GameArter, Lagged and Y8 adapters are written from their
  public docs but not verified against a live account.** CrazyGames,
  GameDistribution and Poki were checked against current documentation. The
  wrappers fail safe, so a wrong method name costs you the ad, not the game —
  but test each portal's preview before going live.
- Levels 36-40 are large enough that arrows render near 1 px at the default
  zoom. That matches the reference games, but if it reads as mush on a small
  phone, drop those `SCALES` entries by ~15%.
