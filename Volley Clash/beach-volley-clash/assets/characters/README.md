# Character sprites

Put your art here, then reference it from `manifest.json`. Nothing is required —
any missing file is drawn procedurally from the character's `palette`, so you can
add art one character at a time and see it immediately on reload.

## Folder layout

```
assets/characters/
  manifest.json
  kai/
    full.png        (optional — whole character in one image)
    head.png
    body.png
    hat.png
  luna/
    ...
```

## Two ways to build a character

**1. One sprite.** Simplest. Add `"full": "kai/full.png"` to that character's
`sprites`. The image is drawn 210px tall with the feet on the sand line.

**2. Parts.** Better animation: the body and head move independently while legs
and arms stay procedural (they swing when running and reach up on a spike).
Supported keys: `head`, `body`, `hat`.

## Sizes and rules

| Slot   | Size      | Notes                                             |
|--------|-----------|---------------------------------------------------|
| `full` | 220 × 260 | Feet touching the bottom edge, centred horizontally |
| `head` | 120 × 120 | Face looking right, eyes roughly centred          |
| `body` | 110 × 150 | Torso only, shoulders at the top                  |
| `hat`  | 130 × 90  | Sits above the head, anchored bottom-centre       |

- Transparent PNG.
- Draw the character **facing right**. The renderer mirrors it for the right-hand team.
- Keep a heavy dark outline (about 5px at these sizes) to match the UI.
- Keep the head large — the head is a real collision circle and reads best when chunky.

## Adding a new character

```json
{
  "id": "pirate",
  "name": "Pirate",
  "palette": { "skin": "#e8b184", "hair": "#1b1b1b", "top": "#8b1e1e", "bottom": "#2b2b2b", "shoe": "#5b3a1a", "accent": "#ffd34d" },
  "sprites": { "full": "pirate/full.png" }
}
```

The character picker in the menu is generated from this file, so a new entry
appears with no code changes.
