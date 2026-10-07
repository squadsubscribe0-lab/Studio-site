# Beach Volley Clash

A 2D beach volleyball game for CrazyGames (desktop). Plain HTML5 + JavaScript
modules, custom physics, no build step and no framework.

Modes: **1v1** local, **1v1** vs AI, **1v1–4v4** online, and **2v2 / 3v3 / 4v4**
with AI team-mates. Rallies are interrupted by **super throws** — fireballs, ice
balls and multiball — picked up mid-flight by either side.

Online play is **peer-to-peer and free to run**: there is no server to pay for.

## Run it

Any static server works — ES modules will not load from `file://`.

```bash
cd beach-volley-clash
python3 -m http.server 5173
# open http://localhost:5173
```

Online play needs nothing else — it runs browser-to-browser (see
[Online play](#online-play)).

## Controls

| Key | Action |
|-----|--------|
| `A` / `D` | move |
| `W` | jump (release early for a short hop, hold at the top to block) |
| `S` | dive on the ground, spike in the air |
| `Space` | serve |
| `P` | pause &nbsp;·&nbsp; `M` mute |

Second local player: arrow keys, `↑` jump, `↓` spike.

Super throws need no key of their own: charge one by striking a floating orb
with the ball, and it fires automatically on your team's next contact.

## Where things live

```
index.html            markup for the canvas, HUD and every menu screen
styles/main.css       the whole UI skin
src/
  config.js           every tuning number in the game — start here
  core/
    input.js          keyboard, one binding set per local player
    audio.js          synthesised sfx bank + the background music sequencer
    assets.js         manifest loading, tolerant of missing sprites
  game/
    physics.js        ball integration, net/wall collision, contact model
    entities.js       Player and Ball
    match.js          rules: serve, touches, scoring, state machine
    ai.js             one brain per AI player
    powers.js         super throws: orbs, charges, fire/ice/multiball
    renderer.js       beach backdrop, characters, balls, all VFX
  ui/
    hud.js            scoreboard, clock, banners, meta pills
    menus.js          screen routing and the character/ball pickers
  net/
    netclient.js      P2P (WebRTC) and WebSocket transports, snapshot sync
  platform/
    index.js          picks this build's portal adapter
    base.js           the adapter contract; also the standalone no-op adapter
    adapters/         one file per portal (CrazyGames, Poki, Yandex, ...)
assets/               your art goes here — see the README in each folder
server/               optional self-hosted relay (the P2P default needs none)
```

## Coins

Coins used to be write-only: earned for points, wins and the rewarded video, and
spent on nothing. Every character and ball was free, so the number in the HUD
counted up forever and meant nothing.

Characters and balls now carry a `price` in their manifests. `0` or absent means
free, and two of each are, so a new player still has a choice before earning
anything. Only *bought* ids go into the save (`meta.owned`) - whether something
is free is a property of the manifest, so dropping a price to zero later hands it
to everyone rather than leaving old saves locked out.

    starting balance   525
    point won          15 x streak multiplier
    match won          100
    rewarded video     250

`ensureSelectionOwned` runs after the save loads and keeps the equipped items
legal, because a save can outlive the manifest that made it: a free character can
be given a price, or dropped from the roster. The equipped ids are saved too -
they never used to be, which did not matter while everything was free and matters
a great deal once you have spent 400 coins on a character.

The `X2` pill in the HUD used to be hard-coded into the markup with nothing in
the game reading or writing it - it permanently advertised a bonus that did not
exist. The bonus is real now: two points in a row doubles what each is worth,
climbing to a cap of x4, and the pill is hidden entirely at x1. It also gives the
streak counter next to it something to be for.

## Audio

Everything is synthesised in WebAudio at runtime - cues, crowd and music - so
the game ships no audio files and can never be silent because a download failed.
Dropping an mp3 into `assets/sfx/` and listing it in `config.OVERRIDES.sfx`
replaces that one cue and nothing else.

**Levels are calibrated, not guessed.** `TRIM_DB` in `core/audio.js` holds a
per-cue trim in decibels, kept separate from the synthesis so retuning how a
fireball *sounds* cannot silently move where it sits in the mix. The numbers
come from `tools/audio-levels.html`, which rebuilds the real mixer inside an
OfflineAudioContext, renders every cue in `AUDIO_KEYS` and measures peak and
RMS. Run it after touching any cue.

That tool is why `buildGraph()` is split out of `load()`: the same graph has to
be constructible on an offline context. Before the table the bank spanned 38 dB
and `hit` - the sound of every ball contact, the one you hear hundreds of times
a match - sat 23 dB under the win fanfare and disappeared under the music. It is
now a 16.7 dB spread with `hit` in the middle.

**Cues are panned to where they happened.** `panAt()` in `main.js` turns a court
x into a stereo position and `audio.route()` clamps it to ±0.7 - hard-panned
mono cues sound broken on headphones and vanish on a laptop that only has one
usable speaker. A dig on the far side of the net sounds like it came from over
there.

**The limiter is a safety net.** At its old -10 dB / 12:1 it was clamping the
whole game and the music pumped under every spike. With the cue levels
calibrated it sits at -3 dB / 8:1 and only catches genuine stacks.

**The music is an eight-bar loop with an A/B shape.** The first half is sparse -
quarter-note hats, half-density arpeggio, no lead - and the second half lets the
lead, the offbeat hats and the extra kick in, then fills into the top. A
two-minute match is thirty-odd passes through it; without an arrangement it is
the same bar thirty times. Swing shuffles a pair of sixteenths rather than
adding to both, which is what it used to do - that quietly dragged the menu
track from 96 BPM to about 90.

The reverb is a 0.55s slap, not the 1.6s hall it was. A beach is outdoors.

## Mobile

`ui/touch.js` decides whether the device wants on-screen controls - it needs
both a touch point and a coarse pointer, so a touchscreen laptop keeps its
keyboard and does not get a thumb pad over the court. `?touch=1` and `?touch=0`
force the decision either way for testing.

The pad is four buttons: left and right on one side, SPIKE and JUMP on the
other. There is no virtual stick - a rally is won by standing on exactly the
right spot, and an analogue value you cannot feel under your thumb is worse at
that than a discrete press. There is no serve button either, because `readInput`
already folds jump into serve.

Everything the pad touches goes through the virtual input state in
`core/input.js`, which `readInput` merges into the first local seat. The
simulation, the prediction and the network never learn whether a frame came from
a keyboard or a thumb, so nothing downstream has a second code path.

Portrait is refused rather than supported: a 16:9 court letterboxed into a phone
held upright is a strip a few centimetres tall. The rotate prompt covers the
screen and the simulation is held while it is up, so nobody loses a point to an
opponent they cannot see.

## Keyboard layouts

Bindings are physical positions, not letters. `KeyboardEvent.code` is reported
against a US layout, so `KeyW` means "the key above `KeyA`" wherever you are -
a French AZERTY player is already moving with ZQSD and nothing needs remapping.

What does not follow is the letter printed in the HUD, so `loadKeyLabels` asks
the browser for this keyboard's layout map and every prompt, legend row and
controls line is relabelled from it. Where the API is missing or empty the US
letters stand.

`Escape` is deliberately not bound to anything: the portal's player uses it to
leave fullscreen, so a game that also pauses on it makes one press do two
things.

## Onboarding

The page finishes loading and a 1v1 against the computer is already running -
there is no title screen to click through and no mode picker in the way. The
menu, the character picker and online play all live behind the `MENU` button in
the HUD.

A first-time player is taught inside that match. `COACH` in `src/main.js` lists
four basics - serve, move, jump, spike - and `updateCoach` shows one keycap at a
time over the player's head for whichever they have not used yet, plus a control
legend in the corner. Each prompt clears the moment the action happens, gives up
after `COACH_TIMEOUT` if it is ignored, and the whole thing can be dismissed with
one button. Progress is read off the player's own body rather than the match
event stream, because the AI opponent jumps and spikes too and the events do not
say whose they are.

Coaching only runs for a first-time player in a plain 1v1 against the computer,
and never in an online match.

## Characters and ball skins

A character is a manifest entry, not code. `hair` (short | long | ponytail | bun
| curly | buzz) and `outfit` (tank | tee | jersey | twopiece | wetsuit |
vest) are drawn by `renderer.drawVectorBody`, and together with the palette they
are what makes a roster rather than one body recoloured six times - at the size
these are on screen, six palettes read as one character in six shirts.

Ball skins work the same way: `style` picks a painter in `renderer.paintBallSkin`
(beach | volley | panels | melon | star | swirl | stripe | dots | eclipse |
plain) and `colors` is read positionally as [base, ...accents].

Both the shop card and the thing on the sand go through the same painter. They
used not to - the picker carried its own copy of both, and the copies had drifted:
characters were drawn faceless and armless, and every ball that was not a beach
ball was sold as a volleyball.

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

## Super throws

Every few seconds of live rally a glowing orb drifts onto the court. Whichever
team last touched the ball when it strikes the orb is **charged**, so a pickup
is genuinely contested: spiking through an orb steals it back off the other
side. A charge is spent automatically on that team's next contact, which means
humans, AI and remote players all use powers through the same code path — there
is no "activate" button to keep in sync.

| Power | What it does |
|-------|--------------|
| **Fireball** | A flat, burning rocket well past the normal speed ceiling. Whoever digs it is scorched and moves at half pace for a moment. |
| **Ice ball** | Freezes the receiving side solid — one opponent in 1v1, two in team matches — long enough for the ball to land. |
| **Multi ball** | Splits into two or three live balls for ten seconds. The first one to reach the sand ends the rally, and the touch limit is suspended while it runs. |

All of it is tunable under `POWERS` in `src/config.js`, including switching the
whole system off (the mode screen exposes that as a dropdown).

## Sound

There are no audio files. Every effect, the crowd and all three music tracks are
synthesised in WebAudio at runtime (`src/core/audio.js`), which means the game
ships with zero audio payload and can never fall silent because a download
failed. Three gain stages — master → music/sfx → output — let the music duck
under a big moment and let the CrazyGames mute setting cut everything at once.

The music is a small step sequencer: a chord loop with bass, arpeggio, pad,
lead and drums, scheduled ahead of time against the WebAudio clock so a busy
main thread cannot make it stutter. It changes track for the menu, for a match,
and again when either side reaches match point.

If you would rather use real recordings, drop an MP3 into `assets/sfx/` named
after a cue in `AUDIO_KEYS` and it overrides just that one sound.

## The AI

`src/game/ai.js` runs one brain per computer player, and it plays volleyball
rather than chasing the ball:

- **Perception is stale on purpose.** Each brain refreshes its picture of the
  ball on a timer (0.38s on Easy, 0.055s on Hard) and reasons about that copy,
  ageing it forward between glances. A fast ball genuinely beats it, which is
  what makes a fireball feel dangerous rather than merely quick.
- **One team-mate claims the ball**, chosen by intercept cost rather than raw
  distance, with hysteresis so two players never barge each other over one dig.
- **Three-touch plans.** Touch one digs the ball up, touch two sets it near the
  net, touch three attacks. In 1v1 the brain will set itself up and then jump on
  its own ball — but only off a comfortable dig, and mostly at Hard.
- **Placement is solved, not guessed.** `aimVelocity` in `physics.js` returns
  the arc that lands on a chosen spot and still clears the tape, so the AI aims
  at real gaps. It deliberately stops short of perfect: an AI that hits the exact
  open corner every time turns 1v1 into serve-return-point.
- **Defence holds its shape**, shifting the whole line towards the threat rather
  than collapsing every defender onto the same square metre, and the player
  nearest the net jumps into blocks.
- **Orbs are targets.** A brain with no charge will aim a dig straight through a
  loose orb when the detour is cheap.

One number, `difficulty`, drives every knob at once (reaction, aim error,
placement, spike/block/dive appetite, movement speed, greed). Individual bodies
can override it with `player.difficulty`, which is what the balance soak tests
use to pit one tier against another.

## Online play

**There is nothing to host and nothing to pay for.** The default transport is
peer-to-peer: the host claims the peer id `bvclash-<ROOM>` on PeerJS's free
public broker, guests dial that id, and from then on every packet travels
directly between the browsers over WebRTC. The broker is used only for the
introduction, and public STUN servers for NAT traversal.

Claiming the room id *is* the matchmaking. Whoever wins the race is the host;
whoever loses it gets `unavailable-id` back, which tells them a host already
exists, and they connect to it instead.

One peer per room runs the authoritative match; everyone else sends four numbers
of input per frame and receives 20 snapshots a second. Each client predicts its
own player and eases towards the host's version, so your own movement feels
instant. Empty seats in a 2v2/3v3/4v4 room are filled by AI.

If you would rather run your own server, set `NET_CONFIG.transport` to `'ws'`
and point `NET_CONFIG.wsUrl` at the relay in `server/`. Details in
`server/README.md`.

Before a serious launch, move the simulation to the server so a modified client
cannot rewrite the score. `Match` has no DOM or canvas dependency, so it imports
into Node as-is.

## Publishing

The game ships to eleven web portals. Each one gets its own build carrying only
that portal's SDK — see **[PUBLISHING.md](PUBLISHING.md)** for the full list,
what each pays, and the ids each needs.

```bash
python build.py            # every platform -> dist/<id>/ and dist/<id>.zip
python build.py poki       # just one
python build.py --list     # what is configured
```

The game never talks to a portal SDK directly. It calls `platform.*`
(`src/platform/index.js`), and `build.py` decides which adapter that is by
stamping the SDK script tag and `window.__PLATFORM__` into `index.html`. What
the game uses:

- `loadingStart` / `loadingStop` around asset loading
- `gameplayStart` / `gameplayStop` on match start, pause and menu
- midgame ad between matches, with audio muted and the game paused while it runs
- rewarded video on the result screen, worth 250 coins, granted only on a
  completed view
- `happytime()` on a win
- platform mute setting respected and given priority over the in-game toggle
- `updateRoom` / `inviteLink` / `getInviteParam` / `isInstantMultiplayer` for
  friends joining an online room from the platform
- progress saved to the portal's cloud storage, falling back to `localStorage`

Before you upload:

1. Self-host the font (see `assets/fonts/README.md`) — most portals allow no
   external requests except their own SDK.
2. Nothing to configure for online play — it is peer-to-peer by default. If you
   switch `NET_CONFIG.transport` to `'ws'`, point `NET_CONFIG.wsUrl` at your
   deployed `wss://` relay instead.
3. Run `python build.py` and upload the zip for that portal. It already has
   `index.html` at the root and leaves out `server/`.
4. Test with the portal's QA tool before submitting.

## Known gaps

- Portrait play is not supported; phones are asked to rotate to landscape. This
  is now the main thing holding submissions back: Poki treats mobile support as
  a requirement, and the other portals rank mobile-capable games much higher.
- The character art is procedural until you drop sprites in.
- P2P online play leans on PeerJS's free public broker. That is fine for launch,
  but it is someone else's service: for guaranteed uptime either self-host
  PeerServer (set `NET_CONFIG.peerHost`) or switch to the `ws` transport.
- Symmetric-NAT networks can fail to connect peer-to-peer without a TURN server.
  STUN covers the large majority of players; add a TURN entry to
  `NET_CONFIG.iceServers` if you need the rest.
