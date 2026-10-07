# Birddoku

A quiet logic puzzle for web and mobile browsers. Plain HTML5 + JavaScript,
no build step, no dependencies. Open `index.html` and it runs.

## The rules

Each level is an N×N board split into N coloured patches. Hide one bird in
every patch so that:

1. every colour holds exactly one bird
2. every row and every column holds exactly one bird
3. no two birds touch, not even diagonally

Tap a cell once to cross it out, tap again to place a bird, tap a third time
to clear it. Drag across the board to cross out a run of cells. Three wrong
placements and the level restarts.

Every level has **exactly one solution** — the generator verifies this before
handing the board to the player, so nothing is ever guesswork.

## Files

```
index.html                  markup and screens
css/style.css               all styling
js/puzzle.js                generator + solver (the interesting part)
js/birds.js                 which art files to load
js/audio.js                 music and effects, synthesised in the browser
js/platform.js              CrazyGames SDK wrapper + save data
js/game.js                  game flow, input, levels
assets/birds/               bird art, 4 birds x 6 faces (see the README in there)
assets/icon.png             game icon, also used on the home screen
tools/make_bird_placeholders.py   redraws simple stand-in birds if ever needed
```

## Levels

The board grows by one square every level: level 1 is 5×5, level 2 is 6×6,
up to 9×9 at level 5, and it stays there. 9×9 is the ceiling because a 10×10
board with the no-touching rule takes seconds to generate and plays more like
homework than a puzzle — past level 5 the difficulty comes from the colour
patches, which get more awkward as the seed changes. One line controls it:
`boardSize()` at the top of `js/game.js`.

Levels are generated from a fixed seed, so level 23 is the same board for
everyone, every time. 60 levels show in the picker and it keeps generating
after that.

## How the generator works

1. Place N birds, one per row and column, never adjacent.
2. Grow N colour patches outward from those birds, round-robin so no patch
   swallows the board.
3. Solve the board. If a second solution exists, move one boundary cell into
   a neighbouring colour to kill that rival solution, and solve again.
4. Reject boards with a one-cell patch (free bird) or a patch that eats more
   than a fifth of the grid.

Worst case is about a quarter of a second on a 9×9, hidden behind the
"Settling the flock" line.

## Music

There are no audio files. `js/audio.js` synthesises slow pad chords over a
four-chord drift plus the occasional bell, and short chirps for taps. It
starts on the first tap because browsers block audio before that. Tempo,
chords and volume are all at the top of that file if you want a different
mood.

## CrazyGames

The SDK is loaded in `index.html` and wrapped in `js/platform.js`. Already
wired up:

- `loadingStart` / `loadingStop` on boot
- `gameplayStart` / `gameplayStop` around each level and on tab blur
- `happytime` when a level is solved
- midgame ad every 3 cleared levels, with the music ducked
- rewarded ad for one extra heart, and for an extra hint

If the SDK is missing (local file, itch.io, your own site) everything
degrades quietly — the ad buttons simply don't appear.

To submit: zip the contents of this folder with `index.html` at the root.

## Aap ke liye chhoti si note

- Aap ki bheji hui bird sheet cut karke `assets/birds/` mein daal di hai:
  4 birds x 6 faces, background transparent, 192px PNG.
- Naya bird add karna ho to 6 files (`bird05_happy.png` waghera) daal kar
  `js/birds.js` ki list mein ek line add kar dein.
- Pink wala icon `assets/icon.png` hai - favicon, home screen aur
  loading screen teeno par wahi lag raha hai.
- Music files ki zaroorat nahi — sab code se ban raha hai, size bhi kam.
