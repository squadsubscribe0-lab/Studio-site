// Platform selector.
//
// Exactly one adapter is live per build. The build step writes
//
//     window.__PLATFORM__         = 'poki'
//     window.__PLATFORM_OPTIONS__ = { ... }
//
// into index.html alongside that portal's SDK script tag. Nothing else in the
// game knows which portal it is running on.
//
// Why one SDK per build rather than all of them in one file: every portal's
// contract forbids third-party ad code inside the game, and two ad SDKs racing
// for the same slot is also the fastest way to get a game pulled. Shipping one
// bundle per store is the only compliant option — and it keeps the download
// small, which portals score you on.
//
// Auto-detection exists purely so `python3 -m http.server` and an unmodified
// source checkout still boot; it is never how a release build decides.

import { PlatformAdapter } from './base.js';
import { CrazyGamesAdapter } from './adapters/crazygames.js';
import { PokiAdapter } from './adapters/poki.js';
import { GameDistributionAdapter } from './adapters/gamedistribution.js';
import { GameMonetizeAdapter } from './adapters/gamemonetize.js';
import { YandexAdapter } from './adapters/yandex.js';
import { GamePixAdapter } from './adapters/gamepix.js';
import { Y8Adapter } from './adapters/y8.js';
import { LaggedAdapter } from './adapters/lagged.js';
import { PlaygamaAdapter } from './adapters/playgama.js';
import { NewgroundsAdapter } from './adapters/newgrounds.js';
import { MonetagAdapter } from './adapters/monetag.js';

const ADAPTERS = [
  CrazyGamesAdapter, PokiAdapter, GameDistributionAdapter, GameMonetizeAdapter,
  YandexAdapter, GamePixAdapter, Y8Adapter, LaggedAdapter, PlaygamaAdapter,
  NewgroundsAdapter, MonetagAdapter, PlatformAdapter
];

const BY_ID = new Map(ADAPTERS.map((A) => [A.id, A]));

/** Last-resort guess, for source checkouts with no build step applied. */
function detect() {
  const globals = [
    ['CrazyGames', 'crazygames'], ['PokiSDK', 'poki'], ['GD_OPTIONS', 'gamedistribution'],
    ['SDK_OPTIONS', 'gamemonetize'], ['YaGames', 'yandex'], ['GamePix', 'gamepix'],
    ['LaggedAPI', 'lagged'], ['bridge', 'playgama'], ['y8', 'y8']
  ];
  for (const [g, id] of globals) if (window[g]) return id;
  return 'standalone';
}

const id = window.__PLATFORM__ || detect();
const Adapter = BY_ID.get(id) || PlatformAdapter;

export const platform = new Adapter(window.__PLATFORM_OPTIONS__ || {});
export const PLATFORM_ID = platform.id;
export { PlatformAdapter };
