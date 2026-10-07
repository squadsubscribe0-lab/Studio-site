# Sound effects

**This folder can stay empty.** Every cue in the game is synthesised in
WebAudio at runtime (`src/core/audio.js`), so the game ships with no audio
payload and is never silent because a download failed.

Drop an MP3 here named after a cue and it overrides *just that one sound*;
everything else stays synthesised. The full list lives in `AUDIO_KEYS` in
`src/config.js`:

| File            | Plays when                                        |
|-----------------|---------------------------------------------------|
| `hit.mp3`       | ball touched by a player                          |
| `spike.mp3`     | spike / smash                                     |
| `block.mp3`     | a jump-block kills the ball                       |
| `net.mp3`       | ball clips the net                                |
| `wall.mp3`      | ball bounces off a side wall or the ceiling       |
| `jump.mp3`      | jump                                              |
| `land.mp3`      | landing on the sand                               |
| `dive.mp3`      | ground dive                                       |
| `orb.mp3`       | a power orb appears                               |
| `pickup.mp3`    | the ball smashes through an orb                   |
| `fire.mp3`      | a fireball is launched, and where it lands        |
| `ice.mp3`       | an ice ball is launched                           |
| `freeze.mp3`    | a player is encased in ice                        |
| `shatter.mp3`   | ice breaks — a thaw, or an ice ball hitting sand  |
| `multi.mp3`     | multiball splits                                  |
| `burn.mp3`      | a defender is scorched digging a fireball         |
| `poof.mp3`      | extra multiballs expire                           |
| `whistle.mp3`   | serve and match start                             |
| `point.mp3`     | a point is scored                                 |
| `win.mp3`       | match won                                         |
| `lost.mp3`      | match lost                                        |
| `crowd.mp3`     | crowd reaction after a point                      |
| `click.mp3`     | settings sliders                                  |
| `ui.mp3`        | menu buttons                                      |

Keep them short (under 1s except `crowd`) and normalised to about -6 dBFS.

Background music is **not** loaded from files — it is a step sequencer in
`src/core/audio.js`. To use a real track instead, load it into a looping
`AudioBufferSourceNode` on `audio.musicBus` and stop calling `playMusic`.

CrazyGames requires all audio to stop during ads — that is already handled in
`src/main.js`.
