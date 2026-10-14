/**
 * Levels and visual themes.
 *
 * Map characters:
 *   #  ground (grass on top when open to the sky)   B  brick   S  stone
 *   D  hero spawn door     C  castle / treasure (goal)
 *   f  flower   k  bush   t  wall torch   .  air
 *
 * Heroes walk toward the goal, hop 1–2 tile steps, jump pits up to 3 tiles
 * wide, drop off ledges and turn around at tall walls.
 */

export const THEMES = {
  meadow: {
    sky: ['#6cc4ff', '#cfeeff'], far: '#a7dcae', near: '#78c47e', hillLine: '#4f9a5a',
    top: '#63c93f', topDark: '#3f9a29', dirt: '#c98a4b', dirtDark: '#9a6331',
    brick: '#e07a43', brickDark: '#a9502a', stone: '#a7b0c2', stoneDark: '#737d93',
    castle: '#f2c48d', castleDark: '#c9935a', roof: '#ff6f61', clouds: true,
  },
  sunset: {
    sky: ['#ff8fa3', '#ffd6a5'], far: '#e48aa8', near: '#c4668d', hillLine: '#9c4a72',
    top: '#7fd65e', topDark: '#4fa33a', dirt: '#b4714a', dirtDark: '#87502f',
    brick: '#e2685a', brickDark: '#a84236', stone: '#b7a6c9', stoneDark: '#837399',
    castle: '#ffb4a2', castleDark: '#d07f6f', roof: '#6c5ce7', clouds: true,
  },
  night: {
    sky: ['#0f1433', '#33397a'], far: '#262c63', near: '#1d2350', hillLine: '#3a4290',
    top: '#4dbb6a', topDark: '#2f8a48', dirt: '#7a5440', dirtDark: '#553828',
    brick: '#9a5ad0', brickDark: '#6a3a99', stone: '#6f7aa6', stoneDark: '#4a5378',
    castle: '#b8c0ff', castleDark: '#7d86c9', roof: '#ff9f43', stars: true,
  },
  dungeon: { sprites: true, sky: ['#120f1d', '#120f1d'] },
};

/* ── tiny level builder ── */
function build(cols, rows, fn) {
  const g = Array.from({ length: rows }, () => Array(cols).fill('.'));
  const set = (c, r, ch) => { if (c >= 0 && c < cols && r >= 0 && r < rows) g[r][c] = ch; };
  const api = {
    ground(c0, c1, top) { for (let c = c0; c <= c1; c++) for (let r = top; r < rows; r++) set(c, r, '#'); },
    raise(c0, c1, h, base = 13) { for (let c = c0; c <= c1; c++) for (let r = base - h; r < rows; r++) set(c, r, '#'); },
    pit(c0, c1) { for (let c = c0; c <= c1; c++) for (let r = 0; r < rows; r++) set(c, r, '.'); },
    box(c, r, w, h, ch = 'B') { for (let x = c; x < c + w; x++) for (let y = r; y < r + h; y++) set(x, y, ch); },
    spawn(c, r) { set(c, r, 'D'); },
    goal(c, r) { set(c, r, 'C'); },
    deco(list) { for (const [c, r, ch] of list) if (g[r]?.[c] === '.') set(c, r, ch); },
  };
  fn(api);
  return g.map((r) => r.join(''));
}

export const LEVELS = [
  // World 1 · The Dungeon
  {
    name: 'The Old Cellar', theme: 'dungeon', waves: 7,
    map: [
      '################################',
      '#..............................#',
      '#......t...........t...........#',
      '#D.............................#',
      '#############################..#',
      '#..............................#',
      '#..........t...........t.......#',
      '#..............................#',
      '#..#############################',
      '#..............................#',
      '#.....t...........t............#',
      '#............................C.#',
      '################################',
      '################################',
    ],
  },
  {
    name: 'Bumpy Halls', theme: 'dungeon', waves: 7,
    map: [
      '################################',
      '#..............................#',
      '#.........t.........t..........#',
      '#D...........#.................#',
      '#############################..#',
      '#..............................#',
      '#......t...........t...........#',
      '#...............#..............#',
      '#..#############################',
      '#..............................#',
      '#.........t...........t........#',
      '#.........#.........#........C.#',
      '################################',
      '################################',
    ],
  },
  {
    name: 'The Long Vault', theme: 'dungeon', waves: 8,
    map: [
      '################################',
      '#..............................#',
      '#.....t...........t.......t....#',
      '#D.........#...................#',
      '###############..###############',
      '#..............................#',
      '#....t..........t..........t...#',
      '#.......#..............#.......#',
      '#..#############################',
      '#..............................#',
      '#.....t...........t.......t....#',
      '#.............#..............C.#',
      '################################',
      '################################',
    ],
  },
  // World 2 · The Overworld
  {
    name: 'Green Meadow', theme: 'meadow', waves: 6,
    map: build(60, 16, (L) => {
      L.ground(0, 59, 13);
      L.pit(15, 16);
      L.raise(22, 30, 1);
      L.box(25, 8, 4, 1);
      L.box(36, 9, 5, 1);
      L.pit(45, 47);
      L.spawn(2, 12);
      L.goal(56, 12);
      L.deco([[6, 12, 'k'], [9, 12, 'f'], [12, 12, 'f'], [19, 12, 'k'], [33, 12, 'f'], [42, 12, 'k'], [50, 12, 'f'], [53, 12, 'f']]);
    }),
  },
  {
    name: 'Rolling Hills', theme: 'meadow', waves: 6,
    map: build(72, 16, (L) => {
      L.ground(0, 71, 13);
      L.raise(14, 15, 1);
      L.raise(16, 17, 2);
      L.raise(18, 27, 3);
      L.box(21, 6, 4, 1);
      L.pit(28, 29);
      L.raise(30, 35, 3);
      L.raise(36, 37, 2);
      L.raise(38, 39, 1);
      L.pit(46, 48);
      L.box(51, 9, 5, 1);
      L.raise(58, 62, 2);
      L.spawn(2, 12);
      L.goal(67, 12);
      L.deco([[7, 12, 'k'], [10, 12, 'f'], [24, 9, 'f'], [33, 9, 'k'], [42, 12, 'f'], [55, 12, 'k'], [64, 12, 'f']]);
    }),
  },
  {
    name: 'Sunset Bridges', theme: 'sunset', waves: 7,
    map: build(76, 16, (L) => {
      L.ground(0, 12, 13);
      L.ground(15, 24, 12);
      L.box(18, 8, 5, 1);
      L.ground(28, 37, 12);
      L.box(32, 11, 1, 1);
      L.ground(40, 52, 13);
      L.box(44, 9, 6, 1);
      L.ground(56, 75, 13);
      L.raise(62, 64, 1);
      L.box(66, 9, 4, 1);
      L.spawn(2, 12);
      L.goal(71, 12);
      L.deco([[6, 12, 'k'], [9, 12, 'f'], [21, 11, 'f'], [35, 11, 'k'], [48, 12, 'f'], [59, 12, 'k'], [68, 12, 'f']]);
    }),
  },
  {
    name: 'Starry Tunnels', theme: 'night', waves: 7,
    map: build(80, 16, (L) => {
      L.ground(0, 79, 13);
      L.pit(12, 13);
      L.box(20, 9, 14, 1, 'S');
      L.box(20, 0, 14, 2, 'S');
      L.raise(36, 40, 1);
      L.pit(44, 46);
      L.box(50, 9, 12, 1, 'S');
      L.raise(54, 55, 1);
      L.pit(66, 67);
      L.box(70, 9, 3, 1);
      L.spawn(2, 12);
      L.goal(75, 12);
      L.deco([[6, 12, 'k'], [9, 12, 'f'], [17, 12, 'f'], [42, 12, 'k'], [63, 12, 'f']]);
    }),
  },
];
