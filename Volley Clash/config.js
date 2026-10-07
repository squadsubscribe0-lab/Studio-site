// All gameplay tuning lives here. Values are in "world units" = pixels of the
// 1600x900 logical canvas, and seconds.

export const VIEW = { W: 1600, H: 900 };

export const COURT = {
  groundY: 782,          // sand line (feet rest here)
  left: 60,
  right: 1540,
  netX: 800,
  netHalfWidth: 9,
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

// Guarded so this module can also be imported by Node (see server/README.md).
const loc = typeof location !== 'undefined' ? location : { protocol: 'http:', hostname: 'localhost' };

export const NET_CONFIG = {
  // Change this to your own relay before publishing. See server/README.md.
  url: (loc.protocol === 'https:' ? 'wss://' : 'ws://') + (loc.hostname || 'localhost') + ':8080',
  snapshotHz: 20,
  interpDelay: 0.09
};

export const AUDIO_KEYS = ['hit', 'spike', 'jump', 'whistle', 'point', 'crowd'];
