# Publishing Beach Volley Clash

Where this game can earn money, what each portal pays, and how to produce the
build each one wants.

```bash
python build.py            # every platform
python build.py poki       # just one
python build.py --list     # what is configured
```

Output lands in `dist/<platform>/` (servable as-is) and `dist/<platform>.zip`
(upload-ready, `index.html` at the zip root).

---

## Why one build per portal, not one build with every SDK

Every portal contract on this list forbids third-party ad code inside the game,
and two ad SDKs competing for the same slot is the fastest route to being
delisted. So the SDKs are not bundled together. Instead:

- `src/platform/` holds one adapter per portal behind a single interface.
- The game only ever talks to `platform.*` — it has no idea which portal it is
  running on.
- `build.py` stamps exactly one portal's SDK into `index.html` per build.

Fix a bug in `src/` once and every store gets it on the next build.

---

## The platforms

Ordered roughly by what a game like this can realistically earn per upload.

### Tier 1 — apply here first

| Portal | Revenue share | SDK | Notes |
|---|---|---|---|
| **[CrazyGames](https://developer.crazygames.com)** | up to 70% net ad rev | v3, bundled | Already live. The only portal with a real invite/room API — the online lobby uses it. |
| **[Poki](https://developers.poki.com)** | ~50% on Poki traffic, 100% on traffic you bring | v2, bundled | Highest quality bar. **Mobile support is effectively mandatory.** |
| **[GameDistribution](https://developer.gamedistribution.com)** | ~33% of net ad + IAP, €100 floor | bundled | Syndicates onward to thousands of portals — widest reach per upload. |
| **[Yandex Games](https://games.yandex.ru/console)** | ad rev share (Yandex Ad Network) | bundled | Real cloud saves. A Russian-language build ranks far better. |

### Tier 2 — worth the upload

| Portal | Revenue share | SDK | Notes |
|---|---|---|---|
| **[GamePix](https://partners.gamepix.com)** | 45% | bundled | Replace the stub SDK URL in `platforms.json` with your dashboard snippet. |
| **[Y8](https://developer.y8.com)** | 50%, or direct AdSense (AFP) | bundled | AFP mode pays you through your own AdSense account. |
| **[Lagged](https://lagged.dev)** | 50% AdSense | bundled | Also carries achievements and leaderboards. |
| **[GameMonetize](https://gamemonetize.com/dashboard)** | varies | bundled | Same engine as GameDistribution, separate payout. |
| **[Playgama Bridge](https://playgama.com/partners)** | varies downstream | bundled | **One build → ~25 destinations**: VK, OK, Telegram/Playdeck, YouTube Playables, MSN and more. Best effort-to-reach ratio on the list. |

### Tier 3 — no ad SDK to embed

| Portal | Revenue | Build to use |
|---|---|---|
| **[itch.io](https://itch.io)** | you set the cut (10% default); pay-what-you-want, donations | `standalone` |
| **[Newgrounds](https://www.newgrounds.com/projects/games)** | site-wrapper ad share + Supporter pool, $50 floor | `newgrounds` (medals + scoreboards over newgrounds.io) |
| **Discord Activity** | Discord's own monetization | `standalone`, wrapped in the Embedded App SDK |
| **Telegram Mini App** | Stars / TON, or via Playgama's Playdeck route | `standalone` or `playgama` |
| **Licensing** (MarketJS, CodeThisLab, coolmath, Miniclip, Addicting Games) | one-time fee, typically $500–$5k | `standalone` — they add their own wrapper |
| **Your own domain** (Netlify, Cloudflare Pages, a VPS) | you keep 100% of the ad network's payout | `selfhost` — see below |

### Deliberately not included

- **Kongregate** — no longer taking new browser-game submissions.
- **Facebook Instant Games** — the FBInstant SDK is a fundamentally different
  session and payments model, not a drop-in adapter. Worth a separate pass.
- **4399 / 7k7k and other CN portals** — require a local publishing partner.


---

## Your own site (Netlify + Monetag)

```bash
python build.py selfhost
```

Then either drag `dist/selfhost/` onto [app.netlify.com](https://app.netlify.com/) —
it deploys as-is, no build command — or:

```bash
netlify deploy --prod --dir dist/selfhost
```

`netlify.toml` ships inside the build. It exists for one reason: the game serves
unbundled ES modules with no content hashing, so `index.html`, `src/` and
`styles/` are set to revalidate on every load, while `vendor/` and `assets/` are
cached hard. Cache the modules aggressively and a deploy goes out while players
keep running yesterday's JavaScript.

### What Monetag can and cannot do here

Monetag is two products, and only one of them is a game ad SDK:

- **Website tags** (popunder / vignette / push / in-page push) are pasted once
  and fire on their own schedule. No JS API, no completion callback, nothing for
  a game to call. They earn whether or not the game cooperates, so they are not
  wired into the adapter — paste one into the `head` block in `platforms.json`
  if you want it.
- **The `show_XXX()` SDK** is promise-based and is the only Monetag surface that
  can report a finished view, which is what the rewarded button needs. Monetag
  documents it for **Telegram Mini Apps**; on an ordinary website it may not be
  present or may not fill.

The adapter is built around that uncertainty. It sets `ready` only when the SDK
global actually exists. If it does not, every ad call stays a no-op and the
rewarded button hides itself — no dead button, no hung promise — while any
page-level tag keeps earning on its own.

Fill in two credentials in `platforms.json`:

| Key | Where it comes from |
|---|---|
| `MONETAG_SDK_DOMAIN` | the per-account SDK domain shown with your zone |
| `MONETAG_ZONE_ID` | the zone id (the global becomes `show_<zone id>`) |

Interstitial frequency is set once at boot through Monetag's own `inApp`
capping (2 per hour, 60s apart) rather than being requested per match, so the
two schedules cannot stack an ad on top of an ad.

> **Never ship the `selfhost` build to a game portal.** Every portal contract on
> this page forbids third-party ad code, and shipping Monetag inside a
> CrazyGames or Poki upload is grounds for removal. Portal builds carry that
> portal's SDK and nothing else — which is the whole reason builds are separate.

---

## Setting up a new portal

1. Register the game on the portal and collect whatever id it issues.
2. Put that id in the `credentials` block of `platforms.json`.
3. `python build.py <platform>`
4. Upload `dist/<platform>.zip`.

Missing credentials do not break the build — the placeholder is written
through verbatim and the build prints a warning, so you can generate every zip
before you have every account and rebuild one target when its id arrives.

### What each portal needs

| Platform | Credentials |
|---|---|
| crazygames | *(none — the SDK identifies the game by its host)* |
| poki | *(none)* |
| gamedistribution | `GD_GAME_ID` |
| gamemonetize | `GAMEMONETIZE_GAME_ID` |
| yandex | *(none)* |
| gamepix | `GAMEPIX_SDK_URL` (per-game snippet from the dashboard) |
| y8 | `Y8_APP_ID`, `Y8_GAME_ID` |
| lagged | `LAGGED_DEV_ID`, `LAGGED_PUBLISHER_ID` |
| playgama | `PLAYGAMA_GAME_ID` |
| newgrounds | `NEWGROUNDS_APP_ID`, `NEWGROUNDS_MEDAL_ID`, `NEWGROUNDS_SCOREBOARD_ID` |
| selfhost | `MONETAG_SDK_DOMAIN`, `MONETAG_ZONE_ID` |
| standalone | *(none)* |

Also flip the **rewarded ads** flag on for GameDistribution and GameMonetize in
their dashboards, or rewarded requests are refused server-side.

---

## The adapter interface

Every adapter in `src/platform/adapters/` extends `PlatformAdapter` and honours
three invariants, because the game leans on them:

1. **Nothing throws.** A missing, blocked or broken SDK degrades to standalone.
2. **`onEnd` fires exactly once** on every ad path — that callback is where the
   game un-pauses and un-mutes, so a missed call freezes the game.
3. **`init()` is time-bounded.** It is awaited during boot, so an SDK that never
   settles would otherwise hold the loading screen forever. After
   `initTimeoutMs` the game continues with ads disabled.

| Method | Purpose |
|---|---|
| `init()` | bounded SDK start-up |
| `loadingStart()` / `loadingStop()` | load-time measurement; several portals keep their own loader up until `loadingStop` |
| `gameplayStart()` / `gameplayStop()` | when it is safe to show an ad |
| `midgame({onStart, onEnd})` | interstitial, between matches |
| `rewarded({onStart, onReward, onEnd})` | opt-in video → +250 coins on the result screen |
| `happytime()` | "the player just won" signal |
| `setItem` / `getItem` | cloud save where the portal has one, `localStorage` otherwise |
| `updateRoom` / `leftRoom` / `inviteLink` / `isInstantMultiplayer` | multiplayer lobby (CrazyGames only, no-ops elsewhere) |

Ad frequency is capped at one interstitial per 2 minutes in the base class.
Poki and Playgama set that to zero because they police frequency themselves and
throttling on our side would only cost fill.

---

## Before you submit

**CrazyGames: Basic Launch vs Full Launch.** The `crazygames` build ships with
`"adsEnabled": false` in `platforms.json`. CrazyGames serves no ads during Basic
Launch, and QA rejects a game that shows a rewarded button which does nothing,
so the build hides the button and skips ad requests. When the game is invited to
Full Launch, set `adsEnabled` to `true`, rebuild, and submit that zip.

Two things about this build will affect acceptance:

- **No touch controls.** The game is keyboard-only (`A`/`D`/`W`/`S`/`Space`).
  Poki treats mobile support as a requirement, and CrazyGames, Yandex,
  GameDistribution and GamePix all rank mobile-capable games considerably
  higher — mobile is the majority of their traffic. This is the single highest
  -value change left.
- **Peer-to-peer online play** routes WebRTC signalling through PeerJS's free
  public broker. Some portals ask where multiplayer traffic goes; the answer is
  browser-to-browser with no server of ours in the path.
