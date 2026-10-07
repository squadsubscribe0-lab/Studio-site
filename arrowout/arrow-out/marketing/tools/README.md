# Marketing asset tools

Everything here renders from the real build in `dist/standalone`, driven on a
virtual clock so every frame is exact. Rebuild the game first (`node build.js`).

```
npm install puppeteer-core@23      # once, in this folder
node keyart.js                     # 8 covers/thumbnails  -> ../crazygames, ../gamedistribution
node record.js gameplay land       # raw gameplay clips   -> clips/
node record.js gameplay portrait
node compose.js                    # CrazyGames videos (cover first frame, silent, <20s)
node trailer.js                    # promo trailer with music + tap sounds -> ../trailer
```

Needs Google Chrome at the default path and ffmpeg on PATH.
