# Super throw icons

One badge per super throw. `manifest.json` maps a power type from
`config.POWERS.types` to a file in this folder.

## Spec

- Square-ish transparent PNG, 96 × 96 or larger
- A **complete badge**: ring, fill and glow all included in the art
- Artwork fills the frame — the renderer fits it to the orb by its longest side

The art replaces the orb's drawn face, not just the little symbol on it. The
animated parts around it — the coloured halo and the spinning dashed ring — are
still drawn underneath, so a badge does not need its own motion.

## Where each icon shows up

| Place                        | Drawn by                       |
|------------------------------|--------------------------------|
| Orb floating in a rally      | `renderer.drawOrbs`            |
| Charge slot on the scoreboard| `hud.drawPowerIcon`            |
| "Charged!" toast             | `hud.drawPowerIcon`            |
| SUPER THROWS reference screen| `hud.drawPowerIcon`            |

The charged ball itself is not iconified — it is tinted and cracked in flight by
`renderer.paintCharge`, because a badge stuck on a spinning ball reads as a
sticker.

## Adding one

Drop the PNG in, add the type to `manifest.json`, done. Remove the entry and the
procedural glyph comes back — nothing else needs touching.
