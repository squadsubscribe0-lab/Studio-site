# Game clips for the web-games carousel

1. Put one gameplay clip per game in this folder. **The file name is the game title**,
   e.g. `Idle Shape Shooter.mp4`. Portrait (9:16) looks best; landscape clips are centre-cropped.
   The first 12 seconds are used, and the sound is removed. MP4, MOV, WebM, M4V, MKV and AVI all work.
2. Optional: add details in `games.txt` (copy `games.example.txt`). Write one block per game,
   with a blank line between blocks. The first line must match the file name.
3. Run `npm run videos`, then `node build.mjs`.
