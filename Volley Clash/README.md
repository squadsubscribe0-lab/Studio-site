# Beach Volley Clash

A 2D beach volleyball game for CrazyGames (desktop). Plain HTML5 + JavaScript
modules, custom physics, no build step and no framework.

Modes: **1v1** local, **1v1** vs AI, **1v1–4v4** online, and **2v2 / 3v3 / 4v4**
with AI team-mates.

## Run it

Any static server works — ES modules will not load from `file://`.

```bash
cd beach-volley-clash
python3 -m http.server 5173
# open http://localhost:5173
```

For online play, start the relay too:

```bash
cd server && npm install && npm start
```

## Controls

| Key | Action |
|-----|--------|
| `A` / `D` | move |
| `W` | jump (release early for a short hop, hold at the top to block) |
| `S` | dive on the ground, spike in the air |
| `Space` | serve |
| `P` | pause &nbsp;·&nbsp; `M` mute |

Second local player: arrow keys, `↑` jump, `↓` spike.

## Where things live

```
index.html            markup for the canvas, HUD and every menu screen
styles/main.css       the whole UI skin
src/
  config.js           every tuning number in the game — start here
  core/
    input.js          keyboard, one binding set per local player
    audio.js          sfx, with synthesised fallbacks when files are missing
    assets.js         manifest loading, tolerant of missing sprites
  game/
    physics.js        ball integration, net/wall collision, contact model
    entities.js       Player and Ball
    match.js          rules: serve, touches, scoring, state machine
    ai.js             one brain per AI player
    renderer.js       beach backdrop, characters, ball, effects
  ui/
    hud.js            scoreboard, clock, banners, meta pills
    menus.js          screen routing and the character/ball pickers
  net/
    crazy.js          CrazyGames SDK v3 wrapper (safe no-ops when standalone)
    netclient.js      rooms, input relay, snapshot sync
assets/               your art goes here — see the README in each folder
server/               WebSocket relay for online rooms
```

## Adding characters and balls

Both are data-driven. Add an entry to `assets/characters/manifest.json` or
`assets/balls/manifest.json` and it appears in the picker with no code changes.
Sprites are optional — anything missing is drawn procedurally from the palette,
so the game runs before any art exists. Sizes and file layout are documented in
`assets/characters/README.md` and `assets/balls/README.md`.

## The physics, briefly

- Fixed 120 Hz step with an accumulator, so the simulation is frame-rate
  independent and can be replayed identically on the network host.
- The ball is a circle with gravity, linear drag, spin and a Magnus term, so
  served balls curve.
- Players are two circles (body and head) plus an arm circle that appears while
  spiking or diving. Heads pop the ball harder — the classic head-sports feel.
- A touch does **not** bounce like a wall. It rebuilds the ball's velocity from
  the contact normal, biased towards the opponent's court and always upward.
  Pure restitution made the ball gain energy on every hit and the rally turned
  into pinball.
- `ensureNetClearance` raises a bump's arc to exactly clear the tape when it is
  heading for the net. Spikes and blocks are excluded, so a mistimed smash still
  goes into the net.

Everything above is tunable in `src/config.js`. The values that change the feel
most: `touchBaseSpeed`, `touchMaxSpeed`, `spikePower`, `jumpVel`, `playerSpeed`.

## Online play

One peer per room is the host and runs the authoritative match; everyone else
sends four numbers of input per frame and receives 20 snapshots a second. Each
client predicts its own player and eases towards the host's version, so your own
movement feels instant. Empty seats in a 2v2/3v3/4v4 room are filled by AI.

Before launch, move the simulation to the server so a modified client cannot
rewrite the score. `Match` has no DOM or canvas dependency, so it imports into
Node as-is. Details in `server/README.md`.

## CrazyGames submission

The SDK is wired up in `src/net/crazy.js` and used across the game:

- `loadingStart` / `loadingStop` around asset loading
- `gameplayStart` / `gameplayStop` on match start, pause and menu
- midgame ad between matches, with audio muted and the game paused while it runs
- `happytime()` on a win
- `settings.muteAudio` respected and given priority over the in-game toggle
- `updateRoom` / `inviteLink` / `getInviteParam` / `isInstantMultiplayer` for
  friends joining an online room from the platform
- progress saved via `SDK.data`, falling back to `localStorage`

Before you upload:

1. Self-host the font (see `assets/fonts/README.md`) — no external requests are
   allowed except the SDK itself.
2. Point `NET_CONFIG.url` in `src/config.js` at your deployed `wss://` relay.
3. Zip the contents of this folder (not the folder itself, and leave out
   `server/`) with `index.html` at the root.
4. Test with the CrazyGames QA tool before submitting.

## Known gaps

- Mobile/touch controls are not implemented — the brief is PC and laptop.
- The character art is procedural until you drop sprites in.
- Rewarded ads are wired but nothing is offered in exchange yet; a "double your
  coins" button on the result screen is the obvious first use.
