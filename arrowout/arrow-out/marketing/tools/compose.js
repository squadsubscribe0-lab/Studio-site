/* CrazyGames preview videos: static cover as the opening frame, a short
   crossfade into real gameplay, silent, capped under 20s. */
"use strict";
const {execFileSync} = require("child_process");
const {OUT, ensure, path} = require("./harness");

const HERE = __dirname;
const JOBS = [
  {cover: "masters/cg-landscape.png", clip: "clips/gameplay-land.mp4",     W: 1920, H: 1080, out: "crazygames/video-landscape-1920x1080.mp4"},
  {cover: "masters/cg-portrait.png",  clip: "clips/gameplay-portrait.mp4", W: 1080, H: 1620, out: "crazygames/video-portrait-1080x1620.mp4"}
];

const HOLD = 1.0, FADE = 0.4, MAX = 19.9;

for (const j of JOBS) {
  const out = path.join(OUT, j.out);
  ensure(path.dirname(out));
  const norm = `fps=30,format=yuv420p,settb=AVTB`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error",
    "-loop", "1", "-framerate", "30", "-t", String(HOLD + FADE), "-i", path.join(HERE, j.cover),
    "-i", path.join(HERE, j.clip),
    "-filter_complex",
      `[0:v]scale=${j.W}:${j.H}:flags=lanczos,${norm}[c];` +
      `[1:v]scale=${j.W}:${j.H},${norm}[g];` +
      `[c][g]xfade=transition=fade:duration=${FADE}:offset=${HOLD}[v]`,
    "-map", "[v]", "-t", String(MAX), "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
  console.log("  " + j.out);
}
