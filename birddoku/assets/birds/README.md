# Bird art

The SVGs in this folder are stand-ins. Drop your own art here using the same
file names and the game picks it up with no code changes.

## File names

Four birds (`bird01` bluebird, `bird02` cardinal, `bird03` chick, `bird04`
owl), six faces each:

```
bird01_happy.png       resting on the board, and the whole flock on a win
bird01_winking.png     resting, on odd-numbered patches
bird01_surprised.png   the bird you just dropped in a wrong square
bird01_angry.png       the birds it clashed with
bird01_sad.png         out of hearts
bird01_sleepy.png      loading screen
```

Files here are 192 × 192 PNG with a transparent background, cut from the
character sheet. Keep them square — the board cell is square and the image
is scaled to 84% of it.

## Adding more birds

Add the six files (`bird05_happy.png` … `bird05_sleepy.png`) and one line to
the list in `js/birds.js`:

```js
{ id: 'bird05', name: 'Parrot' },
```

The game hands out birds per colour region and shuffles the order each level,
so more birds means more variety. A board never needs more than 9 at once.

## Regenerating the placeholders

```
python3 tools/make_bird_placeholders.py
```

Only do this if you want the stand-ins back — it overwrites files with these
names.
