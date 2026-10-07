# CrazyGames store assets

Upload-ready files are in `crazygames/`:

| File | Spec (CrazyGames) |
|---|---|
| cover-landscape-1920x1080.png | Landscape cover, 16:9 |
| cover-portrait-800x1200.png | Portrait cover, 2:3 |
| cover-square-800x800.png | Square cover, 1:1 |
| video-landscape-1920x1080.mp4 | Landscape preview, ~18s, 60fps, H.264, no audio |
| video-portrait-1080x1620.mp4 | Portrait preview (1080p, 2:3), ~18s, 60fps, H.264, no audio |

Each video opens on its static cover, as CrazyGames recommends, then crossfades into real gameplay (level 10).
The gameplay has no text overlays, cursor, black bars or speed-up.

## Regenerate

```
npm install                   # puppeteer-core (uses the installed Chrome)
node render-covers.js         # covers (+ work/cover-portrait-1080x1620.png for the portrait video)
node record-video.js land     # rebuild builds/standalone first if the game changed (node ../build.js standalone)
node record-video.js port
node record-video.js land --dry      # timing check only, no capture
node record-video.js land --compose  # re-encode from work/*-gameplay.mp4 without re-recording
```

- Cover art lives in `src/art.js` (characters redrawn from `game.js` at large scale) and `src/cover.html` (one layout per format).
- `record-video.js` patches a copy of the standalone build so a bot can play it on a virtual 60fps clock.
  The landscape recording zooms the camera slightly (`zoom:480`, the game uses 640) so the monkeys read at preview size.
