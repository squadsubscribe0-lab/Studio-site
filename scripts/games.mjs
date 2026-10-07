/**
 * Copies the playable build of every game into play/<slug>/ so GitHub Pages
 * serves it at  <siteUrl>/play/<slug>/
 *
 *   npm run games
 *
 * Edit GAMES below when a build moves or you add a new game. `from` is the
 * folder (or single .html file) in this repo that holds the game's index.html.
 * `skip` lists files/folders inside it that are not needed to play.
 */
import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const GAMES = [
  { slug: 'arrow-out', from: 'arrowout/arrow-out/dist/standalone' },
  {
    slug: 'beach-volley-clash',
    from: 'Volley Clash/beach-volley-clash',
    skip: ['README.md', 'PUBLISHING.md', 'build.py', 'capture.html', 'platforms.json', 'server', 'tools'],
  },
  { slug: 'idle-scoop-empire', from: 'scoop-empire' },
  { slug: 'paddle-royal', from: 'Royal Paddle/game-files' },
  { slug: 'piniata-payday', from: 'pinata payday/pinata-party-orders', skip: ['SUBMISSION.md'] },
  { slug: 'tiny-tandem', from: 'pinopark/index.html' },
  { slug: 'wild-gambit', from: 'UnoChess/upload/index.html' },
  { slug: 'dungeon-io', from: 'browserbased', skip: ['source', 'sandbox.html'] },
  { slug: 'astro-war', from: 'logic gate/astro-war', skip: ['.claude'] },
  { slug: 'birddoku', from: 'birddoku', skip: ['tools'] },
  { slug: 'endless-puncher', from: 'endless puncher/dist' },
  { slug: 'jungle-ladder', from: 'jungle-ladder/builds/standalone' },
  { slug: 'meow-bag-cat-mafia', from: 'Meow Bag Cat Mafia' },
];

const outDir = join(root, 'play');

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  rmSync(outDir, { recursive: true, force: true });
  for (const game of GAMES) {
    const src = join(root, game.from);
    const dest = join(outDir, game.slug);
    if (!existsSync(src)) {
      console.warn(`! ${game.slug}: ${game.from} not found, skipped`);
      continue;
    }
    mkdirSync(dest, { recursive: true });
    if (statSync(src).isFile()) {
      cpSync(src, join(dest, 'index.html'));
    } else {
      const skip = new Set(game.skip || []);
      cpSync(src, dest, {
        recursive: true,
        filter: (p) => {
          const rel = relative(src, p);
          return !rel || (!skip.has(rel) && !/\.(zip|md)$/i.test(basename(p)));
        },
      });
    }
    console.log(`✓ play/${game.slug}/  ←  ${game.from}`);
  }
}
