// All gameplay tuning lives here. Values are in "world units" = pixels of the
// 1600x900 logical canvas, and seconds.

export const VIEW = { W: 1600, H: 900 };

export const COURT = {
  groundY: 782,          // sand line (feet rest here)
  left: 60,
  right: 1540,
  netX: 800,
  // The band is deliberately wider than a real net's cord. At 9 the net was
  // 18px in a 1600px world, which cannot be drawn as anything but a pole - and
  // a volleyball game whose net reads as a pole looks unfinished. The collider
  // and the art are widened together so the ball never passes through mesh it
  // visibly hit.
  netHalfWidth: 14,
  netTopY: 470,          // top of the net band
  postCapR: 14,
  ceiling: 40            // ball bounces off an invisible ceiling so rallies stay on screen
};

export const PHYS = {
  dt: 1 / 120,           // fixed simulation step
  maxFrameTime: 0.25,

  gravityBall: 1750,
  gravityPlayer: 2900,

  ballRadius: 24,
  ballDrag: 0.16,        // per second, linear velocity damping
  ballMaxSpeed: 1800,
  ballMaxSpeedSuper: 2500,   // fireballs are allowed past the normal ceiling
  ballRestitutionWall: 0.78,
  ballRestitutionNet: 0.55,
  ballSpinDecay: 0.9,
  magnus: 0.00028,       // sideways force from spin

  // Players
  playerRadius: 40,      // body circle
  headRadius: 26,
  bodyOffsetY: -48,      // body circle centre, relative to feet
  headOffsetY: -108,
  playerSpeed: 560,
  playerAccel: 4200,
  playerFriction: 3600,
  jumpVel: -1180,
  airControl: 0.55,
  maxJumps: 1,

  // Hitting.
  // A touch does not bounce the ball like a wall would - it "catches and pops"
  // it, the way a bump works in volleyball. The outgoing speed is built from the
  // incoming speed plus the player's own movement, then clamped. Without this
  // the ball gains energy on every contact and the rally turns into pinball.
  touchBaseSpeed: 540,    // floor speed of a clean touch
  touchIncomingKeep: 0.40,// how much of the incoming speed survives
  touchPlayerKeep: 0.40,  // how much of the player's own speed is added
  touchMinSpeed: 580,
  touchMaxSpeed: 1260,
  headBonus: 1.14,        // heads pop the ball a little harder
  forwardBias: 0.34,      // players play the ball towards the opponent...
  clearBias: 0.58,        // ...and harder on the last legal touch of the side
  minRise: 0.45,          // every touch leaves with at least this much lift
  clearMargin: 55,        // how far above the tape a bump aims to pass

  spikePower: 1320,       // base speed of a smash
  spikeMaxSpeed: 1780,
  spikeAngle: 0.62,       // 0 = flat, 1 = straight down
  blockDamp: 0.42,        // holding jump at the top kills the ball into a block

  diveSpeed: 900,         // ground dive (S on the sand)
  diveDuration: 0.42,
  diveCooldown: 0.7
};

export const RULES = {
  pointsToWin: 5,
  matchSeconds: 120,     // 0 = no clock
  maxTouches: 3,         // touches allowed per side before the point is lost
  allowDoubleTouch: true,// arcade: the same player may hit twice in a row
  serveDelay: 1.1,       // pause between the whistle and the serve becoming live
  pointDelay: 1.4,       // freeze after a point before the next serve
  winByTwo: false
};

export const TEAM = {
  LEFT: 0,
  RIGHT: 1
};

// Where each player of a team stands, as a fraction of their own half.
// Index = team size, value = array of fractions from the net outwards.
export const FORMATIONS = {
  1: [0.55],
  2: [0.38, 0.72],
  3: [0.30, 0.55, 0.80],
  4: [0.26, 0.45, 0.65, 0.85]
};

// ---------------------------------------------------------------- power-ups
//
// Orbs drift into the rally at random. Whichever team last touched the ball
// when it hits an orb is charged with a random super throw, so the pick-up is
// genuinely up for grabs by either side - a spike into an orb steals it back.
export const POWERS = {
  enabled: true,
  firstSpawn: 3.5,        // live-rally seconds before the first orb can appear
  spawnMin: 5,            // gap between orbs (counted across rallies)
  spawnMax: 10,
  orbLife: 14,            // an uncollected orb fades away after this
  orbRadius: 34,
  maxOrbs: 2,
  serveGrantChance: 0.16, // chance the whistle simply hands one side a power
  types: ['fire', 'ice', 'multi'],

  fire: {
    label: 'FIREBALL',
    speedMul: 1.62,       // how much faster the charged hit leaves the hands
    minSpeed: 1500,
    maxSpeed: 2350,
    flatten: 0.55,        // 0 = keep the arc, 1 = drive it flat at the sand
    burnSlow: 0.45,       // a defender who touches it is scorched and sluggish...
    burnTime: 0.8         // ...for this long
  },
  ice: {
    label: 'ICE BALL',
    freezeTime: 1.7,
    targetsSolo: 1,       // 1v1 freezes the single opponent...
    targetsTeam: 2,       // ...bigger sides lose two players
    slowAfter: 0.55,      // lingering chill once the ice breaks
    slowTime: 1.0,
    speedMul: 1.12
  },
  multi: {
    label: 'MULTI BALL',
    duration: 10,         // extra balls live for ten seconds
    extraMin: 1,          // x2 ...
    extraMax: 2,          // ... or x3
    spread: 0.42,         // fan angle between the copies
    speedJitter: 0.18
  }
};

// Optional file overrides.
//
// The game ships with no art and no audio: characters, balls, the beach and
// every sound are generated at runtime. The loaders can still prefer a real
// file when one exists, but they only look for the files listed here. Probing
// for files that are not there produced a wall of 404s on every single load,
// which is the first thing a reviewer or a player with devtools open sees.
//
// Dropped `assets/sfx/spike.mp3` in? Add 'spike' to `sfx` and it takes over
// from the synthesised cue. Same for a painted backdrop at assets/background.png.
export const OVERRIDES = {
  background: false,
  sfx: []              // e.g. ['hit', 'spike', 'crowd']
};

export const AUDIO = {
  master: 0.9,
  sfx: 0.85,
  music: 0.42,
  duckOnPoint: true
};

// Guarded so this module can also be imported by Node (see server/README.md).
const loc = typeof location !== 'undefined' ? location : { protocol: 'http:', hostname: 'localhost' };

export const NET_CONFIG = {
  // Transport. 'p2p' needs no server of your own at all: it uses PeerJS's free
  // public broker to introduce the two browsers, then all match traffic runs
  // directly between them over WebRTC. 'ws' is the self-hosted relay in server/.
  transport: 'p2p',
  peerPrefix: 'bvclash-',            // keeps room codes from colliding with other games
  peerHost: undefined,               // undefined = PeerJS public cloud (free)
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ],
  wsUrl: (loc.protocol === 'https:' ? 'wss://' : 'ws://') + (loc.hostname || 'localhost') + ':8080',
  snapshotHz: 20,
  interpDelay: 0.09,
  maxPeers: 8
};

// Every cue the game can fire. All of them are synthesised in core/audio.js;
// dropping assets/sfx/<key>.mp3 next to one overrides just that cue.
export const AUDIO_KEYS = [
  'hit', 'spike', 'block', 'net', 'wall',
  'jump', 'land', 'dive',
  'orb', 'pickup', 'fire', 'ice', 'freeze', 'shatter', 'multi', 'burn', 'poof',
  'whistle', 'point', 'lost', 'win', 'crowd', 'click', 'ui'
];
