# Dungeon.io

A survivor-style web game (think Survivor.io / Vampire Survivors) built on top of the
**Elemental Sandbox** VFX engine. Walk through an endless dungeon; your spells cast themselves;
survive ten minutes and kill the Dungeon Heart.

- `index.html` → **Dungeon.io** (the game)
- `sandbox.html` → the original VFX playground (now with 21 abilities)

```bash
npm install
npm run dev      # http://127.0.0.1:5173  (game)  ·  /sandbox.html (VFX playground)
npm run build    # → dist/  (both pages, static files, deploy anywhere)
```

## How to play

| | |
|---|---|
| Move | WASD / arrow keys · gamepad stick · touch anywhere and drag (floating joystick) |
| Pick a card | click, or keys 1 / 2 / 3 |
| Pause | Esc or P (the game also pauses when the tab is hidden) |

Spells fire automatically at the nearest enemy (aimed spells) or the densest pack (area spells).
Kills drop XP gems; each level offers three cards. You hold up to **6 spells** and **6 relics**,
each up to level 5. A level-5 spell plus its paired relic **awakens** when you open a chest
(chests drop from elites and bosses). Bosses arrive at 3:00, 6:00 and 9:00; killing the last one
wins the run. One revive per run.

## How it's built

```
src/game/
  GameApp.js            engine setup, run lifecycle, frame loop
  data/skills.js        21 spells: targeting, cooldowns, damage, hit model, level + awakening tuning
  data/passives.js      6 relics
  data/enemies.js       bestiary + 3 bosses
  systems/
    SkillSystem.js      casts spells and turns each live VFX into damage (see below)
    EnemySystem.js      SoA simulation, spatial grid, boss slams, instanced procedural monsters
    PickupSystem.js     XP gems (tiered, merging), hearts, magnets, chests
    Director.js         spawn pacing, swarms, elites, bosses
    Dungeon.js          infinite floor, hashed pillars/braziers, collision
    Player.js · GameCamera.js · GameInput.js · DamageText.js · Sfx.js · Quality.js
  platform/Platform.js  portal SDK adapter (CrazyGames / Poki / none)
  ui/GameUI.js, game.css
```

**Effects stay pure visuals.** The sandbox abilities never learn they are in a game. When a
spell casts, `SkillSystem` keeps a *hit record* that reads the ability's live state every frame —
how far its front has travelled, whether it has landed, how long it has held, where the line
ends — and applies damage in the same shape:

- `line` spells hit anything within `width` of the cast line as the front passes it (once per cast),
  plus optional `impact` bursts, `hold` ticks along the line, or a lingering `pool`.
- `zone` spells hit on landing (after an optional `delay`, e.g. Sunstrike's charge), then `tick`
  while they hold, with `pull`, `slow`, `knock` or `shield` modifiers. Singularity adds a `finale`
  burst exactly when its visual implodes.

Levelling a spell rewrites its VFX settings block (`tune`), so a stronger spell also *looks*
stronger — more missiles, wider waves, bigger zones. Relic "area" scales both the hit radius and
the drawn radius, so they always agree.

### Adding a spell

1. Make (or pick) an ability in the sandbox — see `src/abilities/kit/` and `src/config/kit/`.
2. Add an entry to `SKILLS` in `src/game/data/skills.js` with its `element`, `target`,
   `cooldown` / `damage` arrays, a `hit` model matching its shape, and optional `tune` / `evolve`.
3. Give it an icon in `src/ui/kitGlyphs.js`. That's it — cards, HUD, damage stats pick it up.

## Performance

- Enemies and pickups are instanced: hundreds of monsters cost a handful of draw calls.
- `Quality.js` watches real frame time and steps render resolution and particle budgets down
  (high → medium → low → potato) if a device can't hold ~45 fps.
- Up to 22 spell effects can be live at once (`maxConcurrent` in `GameApp.js`); the oldest is
  retired first.
- The JS bundle is ~1.1 MB minified (three.js + all shaders) plus ~15 MB of assets (character
  FBX files, HDRI, floor textures). For size-capped portals, compress the textures, convert the
  FBX files to Draco/meshopt GLB, or drop the HDRI (the floor and characters are the main users).

## Publishing to portals

`Platform.js` detects an SDK on the page and maps the game's lifecycle to it: loading finished,
gameplay start/stop (menus, pause, level-up screens are *not* gameplay stops — only pause, quit
and death), happy moments (chests, boss kills), a midgame break between runs, and a rewarded
break for the revive. With no SDK every call is a no-op and the revive is free.

For each portal build, add that portal's SDK `<script>` to the `<head>` of `index.html`, then
`npm run build`. **Check each portal's current SDK docs before submitting** — method names and
requirements change (and some portals need extra calls, e.g. data saving or banners). Portals
that need other SDKs (GameDistribution, GameMonetize, Y8, Yandex, …) only need a new branch in
`Platform.js`.

Saves (best run, mute) use `localStorage` with try/catch, so blocked storage never breaks a run.

## Known limitations

- The hero's own Mixamo export has no run clip; the run is retargeted at load from the three.js
  example soldier (`public/models/Soldier.glb`), legs-only while a cast clip plays. If that file is
  missing, locomotion falls back to a procedural bob and sway over the idle.
- Monsters start the run at 55% speed, reach full speed by 4:00 and creep to 130% by the end
  (`Director.speedMul`).
- Sounds are Ogg Vorbis; browsers that cannot decode Ogg fall back to the synthesised voices.
- No online play, meta-progression or unlockable characters yet — natural next steps.
- Balance is a first pass: tune numbers in `data/skills.js`, `data/enemies.js` and `Director.js`.

## Credits

VFX engine, character setup and original five abilities: **Elemental Sandbox** by
mohamedachrefelouafi (MIT — see `LICENSE`). Kit abilities (15 more), Dungeon.io game layer and
UI built on top of it. Character and animations from Mixamo — check Adobe's terms before
publishing. Run clip from the three.js `Soldier.glb` example model (mrdoob/three.js, MIT; itself a
Mixamo character). Sound effects from Kenney's Sci-fi Sounds and Impact Sounds (CC0), via the
GitHub ports `Boyquotes/kenney-sci-fi-sounds-for-godot` and `Boyquotes/kenney-impact-sounds-for-godot`. Fonts: Rubik and Grenze Gotisch (SIL Open Font License) via Fontsource.
