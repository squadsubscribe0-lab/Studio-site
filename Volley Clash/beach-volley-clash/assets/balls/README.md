# Ball variations

Each entry in `manifest.json` becomes a ball in the picker. Sprites are optional —
without one, the ball is drawn from `style` + `colors`.

## Sprite spec

- 128 × 128, square, transparent PNG
- Ball fills the frame, dark outline included in the art
- The renderer rotates it in flight, so it should look right at any angle

```json
{ "id": "pirate", "name": "Cannonball", "style": "plain",
  "colors": ["#333", "#111"], "sprites": { "ball": "pirate/ball.png" } }
```

## Built-in procedural styles

| Style    | Uses colors as                                  |
|----------|--------------------------------------------------|
| `beach`  | base + one wedge per extra colour (classic beach ball) |
| `volley` | base + seam colour (three crossed seams)         |
| `melon`  | rind, flesh, pith + seeds                        |
| `plain`  | base + shading blob                              |
