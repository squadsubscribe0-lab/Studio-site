/**
 * Levels and visual themes.
 *
 * Map characters:
 *   #  ground (grass on top when open to the sky)   B  brick   S  stone
 *   D  hero spawn door     C  castle / treasure (goal)
 *   f  flower   k  bush (cactus in the desert)   t  wall torch
 *   p  pumpkin  g  gravestone   .  air
 *
 * Heroes walk toward the goal, hop 1–2 tile steps, jump pits up to 3 tiles
 * wide, drop off ledges and turn around at tall walls.
 *
 * Every pit is filled with something (water, lava, toxic goo, icy water,
 * quicksand). Falling in is the end of a hero, and pit traps — the Croc,
 * Lava Bubble and Acid Geyser — live inside them.
 */

export const THEMES = {
  meadow: {
    sky: ['#6cc4ff', '#cfeeff'], far: '#a7dcae', near: '#78c47e', hillLine: '#4f9a5a',
    top: '#63c93f', topDark: '#3f9a29', dirt: '#c98a4b', dirtDark: '#9a6331',
    brick: '#e07a43', brickDark: '#a9502a', stone: '#a7b0c2', stoneDark: '#737d93',
    castle: '#f2c48d', castleDark: '#c9935a', roof: '#ff6f61', clouds: true, fluid: 'water',
  },
  sunset: {
    sky: ['#ff8fa3', '#ffd6a5'], far: '#e48aa8', near: '#c4668d', hillLine: '#9c4a72',
    top: '#7fd65e', topDark: '#4fa33a', dirt: '#b4714a', dirtDark: '#87502f',
    brick: '#e2685a', brickDark: '#a84236', stone: '#b7a6c9', stoneDark: '#837399',
    castle: '#ffb4a2', castleDark: '#d07f6f', roof: '#6c5ce7', clouds: true, fluid: 'water',
  },
  night: {
    sky: ['#0f1433', '#33397a'], far: '#262c63', near: '#1d2350', hillLine: '#3a4290',
    top: '#4dbb6a', topDark: '#2f8a48', dirt: '#7a5440', dirtDark: '#553828',
    brick: '#9a5ad0', brickDark: '#6a3a99', stone: '#6f7aa6', stoneDark: '#4a5378',
    castle: '#b8c0ff', castleDark: '#7d86c9', roof: '#ff9f43', stars: true, fluid: 'water',
  },
  desert: {
    sky: ['#ffb85c', '#ffe9b0'], far: '#f0c27a', near: '#e0a65a', hillLine: '#b97c3a',
    top: '#f3d27c', topDark: '#d4a94e', dirt: '#d89b55', dirtDark: '#a8702f',
    brick: '#d9813f', brickDark: '#9a5522', stone: '#d8b98a', stoneDark: '#a88a5c',
    castle: '#f7dca0', castleDark: '#c9a35a', roof: '#3fa7a0', fluid: 'quicksand', spikes: 'x_spikes_gold', sun: true,
  },
  snow: {
    sky: ['#9ccbf2', '#eef7ff'], far: '#dbe9f7', near: '#c3d8ee', hillLine: '#8fb0d4',
    top: '#ffffff', topDark: '#cfe4f7', dirt: '#8aa6c4', dirtDark: '#6a86a6',
    brick: '#9fd2f0', brickDark: '#5f9ec7', stone: '#c7dcef', stoneDark: '#8eabc9',
    castle: '#e9f3ff', castleDark: '#a7c1dd', roof: '#4a7fd6', clouds: true, snow: true, ice: true,
    fluid: 'icewater', spikes: 'x_spikes_ice',
  },
  halloween: {
    sky: ['#1b0f2e', '#7a3a5a'], far: '#3a2350', near: '#24163a', hillLine: '#5a3a7a',
    top: '#6a8a3a', topDark: '#4a6228', dirt: '#4a3428', dirtDark: '#2f2018',
    brick: '#7a4ab0', brickDark: '#4e2a7a', stone: '#6a6080', stoneDark: '#463e5a',
    castle: '#5a4a6e', castleDark: '#3a2e4a', roof: '#ff7a1a', stars: true, spooky: true,
    fluid: 'toxic', spikes: 'x_spikes_purple',
  },
  dungeon: { sprites: true, sky: ['#120f1d', '#120f1d'] },
  ruins: { sprites: true, sky: ['#0f1a17', '#0f1a17'], tint: 'rgba(40,120,70,.22)', fluid: 'water', moss: true },
  lava: { sprites: true, sky: ['#1d0b0b', '#1d0b0b'], tint: 'rgba(160,40,10,.25)', fluid: 'lava', spikes: 'x_spikes_red', embers: true },
};

/* ── tiny level builder ── */
function build(cols, rows, fn) {
  const g = Array.from({ length: rows }, () => Array(cols).fill('.'));
  const set = (c, r, ch) => { if (c >= 0 && c < cols && r >= 0 && r < rows) g[r][c] = ch; };
  const api = {
    ground(c0, c1, top) { for (let c = c0; c <= c1; c++) for (let r = top; r < rows; r++) set(c, r, '#'); },
    raise(c0, c1, h, base = 13) { for (let c = c0; c <= c1; c++) for (let r = base - h; r < rows; r++) set(c, r, '#'); },
    pit(c0, c1) { for (let c = c0; c <= c1; c++) for (let r = 0; r < rows; r++) set(c, r, '.'); },
    /** remove the floor only (keeps any ceiling) — the hole fills with the theme's fluid */
    hole(c0, c1, from) { for (let c = c0; c <= c1; c++) for (let r = from; r < rows; r++) set(c, r, '.'); },
    ceil(c0, c1, h) { for (let c = c0; c <= c1; c++) for (let r = 0; r < h; r++) set(c, r, 'S'); },
    box(c, r, w, h, ch = 'B') { for (let x = c; x < c + w; x++) for (let y = r; y < r + h; y++) set(x, y, ch); },
    spawn(c, r) { set(c, r, 'D'); },
    goal(c, r) { set(c, r, 'C'); },
    deco(list) { for (const [c, r, ch] of list) if (g[r]?.[c] === '.') set(c, r, ch); },
  };
  fn(api);
  return g.map((r) => r.join(''));
}

export const WORLDS = [
  { name: 'The Dungeon', color: '#5b3a8a', dark: '#3a2260' },
  { name: 'The Overworld', color: '#2f8a5a', dark: '#1d5e3b' },
  { name: 'Halloween Night', color: '#c4561a', dark: '#7a2e0a' },
];

export const LEVELS = [
  // World 1 · The Dungeon
  {
    name: 'The Old Cellar', theme: 'dungeon', waves: 7, world: 0,
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
    name: 'Bumpy Halls', theme: 'dungeon', waves: 7, world: 0,
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
    name: 'The Long Vault', theme: 'dungeon', waves: 8, world: 0,
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
  {
    name: 'Forgotten Ruins', theme: 'ruins', waves: 8, world: 0,
    map: build(56, 12, (L) => {
      L.ground(0, 55, 9);
      L.ceil(0, 55, 2);
      L.hole(11, 12, 9);
      L.raise(16, 19, 1, 9);
      L.box(23, 2, 3, 3, 'S');
      L.hole(28, 30, 9);
      L.raise(34, 36, 2, 9);
      L.box(39, 2, 7, 3, 'S');
      L.hole(48, 49, 9);
      L.spawn(2, 8);
      L.goal(52, 8);
      L.deco([[6, 5, 't'], [14, 5, 't'], [21, 5, 't'], [32, 5, 't'], [46, 5, 't']]);
    }),
  },
  {
    name: 'The Lava Pit', theme: 'lava', waves: 8, world: 0,
    map: build(64, 12, (L) => {
      L.ground(0, 63, 9);
      L.ceil(0, 63, 2);
      L.hole(9, 10, 9);
      L.hole(16, 18, 9);
      L.raise(22, 25, 1, 9);
      L.box(22, 2, 4, 2, 'S');
      L.box(33, 2, 8, 3, 'S');
      L.hole(36, 37, 9);
      L.raise(42, 43, 1, 9);
      L.hole(46, 48, 9);
      L.box(51, 2, 3, 3, 'S');
      L.spawn(2, 8);
      L.goal(60, 8);
      L.deco([[5, 5, 't'], [13, 5, 't'], [27, 5, 't'], [44, 5, 't'], [57, 5, 't']]);
    }),
  },
  // World 2 · The Overworld
  {
    name: 'Green Meadow', theme: 'meadow', waves: 6, world: 1,
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
    name: 'Rolling Hills', theme: 'meadow', waves: 6, world: 1,
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
    name: 'Sunset Bridges', theme: 'sunset', waves: 7, world: 1,
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
    name: 'Desert Ruins', theme: 'desert', waves: 7, world: 1,
    map: build(76, 16, (L) => {
      L.ground(0, 75, 13);
      L.pit(10, 11);
      L.raise(15, 24, 1);
      L.raise(18, 21, 2);
      L.box(17, 7, 6, 1, 'S');
      L.pit(27, 29);
      L.raise(32, 33, 1);
      L.raise(34, 40, 2);
      L.box(35, 6, 4, 1, 'S');
      L.pit(44, 45);
      L.box(48, 9, 6, 1, 'S');
      L.raise(56, 58, 1);
      L.pit(61, 62);
      L.spawn(2, 12);
      L.goal(71, 12);
      L.deco([[6, 12, 'k'], [13, 12, 'k'], [26, 12, 'k'], [43, 12, 'k'], [52, 12, 'k'], [66, 12, 'k']]);
    }),
  },
  {
    name: 'Snowy Pass', theme: 'snow', waves: 8, world: 1,
    map: build(80, 16, (L) => {
      L.ground(0, 79, 13);
      L.raise(8, 11, 1);
      L.pit(14, 15);
      L.box(18, 9, 5, 1, 'S');
      L.raise(24, 26, 1);
      L.raise(27, 29, 2);
      L.pit(32, 34);
      L.box(38, 9, 8, 1, 'S');
      L.pit(48, 49);
      L.raise(52, 57, 1);
      L.box(60, 8, 4, 1, 'S');
      L.pit(66, 67);
      L.spawn(2, 12);
      L.goal(75, 12);
      L.deco([[5, 12, 'k'], [21, 12, 'k'], [36, 12, 'k'], [44, 12, 'k'], [62, 12, 'k'], [71, 12, 'k']]);
    }),
  },
  // World 3 · Halloween Night
  {
    name: 'Starry Tunnels', theme: 'night', waves: 7, world: 2,
    map: build(80, 16, (L) => {
      L.ground(0, 79, 13);
      L.pit(12, 13);
      L.box(20, 9, 14, 1, 'S');
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
  {
    name: 'Haunted Hollow', theme: 'halloween', waves: 8, world: 2,
    map: build(78, 16, (L) => {
      L.ground(0, 77, 13);
      L.pit(11, 12);
      L.box(15, 9, 6, 1, 'S');
      L.raise(22, 25, 1);
      L.pit(28, 30);
      L.raise(33, 34, 1);
      L.raise(35, 38, 2);
      L.box(35, 6, 4, 1, 'S');
      L.pit(42, 43);
      L.box(47, 9, 10, 1, 'S');
      L.pit(60, 62);
      L.raise(65, 67, 1);
      L.spawn(2, 12);
      L.goal(73, 12);
      L.deco([[5, 12, 'g'], [8, 12, 'p'], [17, 12, 'g'], [24, 11, 'p'], [32, 12, 'g'], [40, 12, 'p'], [50, 12, 'g'], [55, 12, 'p'], [64, 12, 'g'], [70, 12, 'p']]);
    }),
  },
  {
    name: 'Pumpkin Patch', theme: 'halloween', waves: 8, world: 2,
    map: build(84, 16, (L) => {
      L.ground(0, 83, 13);
      L.raise(6, 8, 1);
      L.pit(12, 13);
      L.raise(17, 30, 2);
      L.pit(24, 25);
      L.box(19, 6, 4, 1, 'S');
      L.raise(31, 32, 1);
      L.pit(36, 38);
      L.box(41, 9, 7, 1, 'S');
      L.pit(51, 52);
      L.raise(55, 60, 2);
      L.box(56, 7, 4, 1, 'S');
      L.pit(64, 66);
      L.box(68, 8, 4, 1, 'S');
      L.pit(74, 75);
      L.spawn(2, 12);
      L.goal(79, 12);
      L.deco([[4, 12, 'p'], [10, 12, 'g'], [15, 12, 'p'], [21, 10, 'p'], [28, 10, 'g'], [34, 12, 'p'], [45, 12, 'g'], [48, 12, 'p'], [58, 10, 'p'], [62, 12, 'g'], [70, 12, 'p'], [77, 12, 'g']]);
    }),
  },
];
