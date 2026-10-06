/**
 * The list of games shown in the web-games carousel.
 *
 * If src/video/ contains gameplay clips, each clip becomes one game and its
 * FILE NAME is used as the game title (e.g. "Idle Shape Shooter.mp4").
 * Extra details (description, tags, play link) come from src/video/games.txt
 * or from config.webGames, matched by title. With no clips at all, the
 * placeholder entries in config.webGames are used.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

export const VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.m4v', '.mkv', '.avi'];

export const slugify = (s) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'game';

/** "idle_shape-shooter (final)" → "idle shape shooter (final)" */
const titleFromFile = (file) =>
  file
    .slice(0, -extname(file).length)
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // all-lowercase names ("birddoku") get a capital first letter
    .replace(/^[a-z][^A-Z]*$/, (t) => t.charAt(0).toUpperCase() + t.slice(1));

/**
 * Optional src/video/games.txt — one block per game, separated by blank lines:
 *
 *   Idle Shape Shooter
 *   url: https://poki.com/en/g/...
 *   tags: Idle, Shooter
 *   Blast waves of shapes and upgrade your turret.
 *
 * The first line must match the video's file name (without extension).
 */
function readDetailsFile(root) {
  const file = join(root, 'src/video/games.txt');
  const details = new Map();
  if (!existsSync(file)) return details;
  for (const block of readFileSync(file, 'utf8').replace(/\r/g, '').split(/\n\s*\n/)) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const entry = { description: [] };
    for (const line of lines.slice(1)) {
      const m = line.match(/^(url|link|play|tags|genre|genres)\s*:\s*(.+)$/i);
      if (!m) entry.description.push(line);
      else if (/^(url|link|play)$/i.test(m[1])) entry.url = m[2].trim();
      else entry.tags = m[2].split(/[,/|•]/).map((t) => t.trim()).filter(Boolean);
    }
    entry.description = entry.description.join(' ');
    details.set(slugify(lines[0]), entry);
  }
  return details;
}

export function webGamesList(root, config) {
  const dir = join(root, 'src/video');
  const clips = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => VIDEO_EXTS.includes(extname(f).toLowerCase()) && !f.startsWith('.'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    : [];

  if (!clips.length) return (config.webGames || []).map((g) => ({ ...g, source: null }));

  const fromConfig = new Map((config.webGames || []).flatMap((g) => [[g.slug, g], [slugify(g.title), g]]));
  const fromFile = readDetailsFile(root);
  const seen = new Set();
  return clips.flatMap((file) => {
    const title = titleFromFile(file);
    let slug = slugify(title);
    if (seen.has(slug)) slug = `${slug}-${seen.size}`;
    seen.add(slug);
    const extra = { ...(fromConfig.get(slug) || {}), ...(fromFile.get(slug) || {}) };
    return [
      {
        slug,
        title,
        tags: extra.tags?.length ? extra.tags : ['HTML5'],
        description: extra.description || '',
        url: extra.url || '',
        source: join(dir, file),
      },
    ];
  });
}
