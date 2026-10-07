/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — the only file you need to edit to update the website.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  After editing, regenerate the HTML pages:
 *
 *      node build.mjs
 *
 *  That rebuilds index.html, every game page, every devlog post, the devlog
 *  index, 404.html, sitemap.xml, robots.txt and site.webmanifest.
 *
 *  Images: put your artwork in assets/img/... (see README.md for the expected
 *  sizes) or drop an SVG/PNG into src/art/ and run `npm run images`.
 */

export default {
  /* ── Site ─────────────────────────────────────────────────────────────── */

  // Public URL of the site, no trailing slash. Used for canonical URLs,
  // Open Graph tags, structured data and the sitemap.
  siteUrl: 'https://squadsubscribe0-lab.github.io/Studio-site',
  lang: 'en',
  // 'dark' or 'light' — the starting theme before a visitor picks one.
  defaultTheme: 'dark',

  /* ── You ──────────────────────────────────────────────────────────────── */

  developer: {
    // Studio / developer name: shown in the logo, page titles, footer and structured data.
    name: 'Loopkind',
    // Two-letter mark used in the logo badge and favicon text.
    monogram: 'LK',
    role: 'Solo Indie Game Developer',
    tagline: 'Better games. Brighter days.',
    // Optional, e.g. 'Based in Europe · Working worldwide'. Leave '' to hide.
    location: '',
  },

  seo: {
    title: 'Casual, Hypercasual & Idle HTML5 Games',
    description:
      'Loopkind is a one-person indie game studio making fun, polished casual, hypercasual and idle games — mostly HTML5 games you can play instantly in your browser.',
    // 1200×630 image used when the site is shared on social media.
    ogImage: 'assets/img/og-image.jpg',
    // Your X/Twitter handle including @, or '' to omit.
    twitterHandle: '',
  },

  /* ── Contact ─────────────────────────────────────────────────────────── */

  contact: {
    // Recommended: a form backend such as Formspree (https://formspree.io).
    // Paste the form endpoint, e.g. 'https://formspree.io/f/abcdwxyz'.
    formEndpoint: '',
    // Fallback / public address. If no formEndpoint is set, the form opens the
    // visitor's email app pre-filled and addressed to this email.
    email: '',
  },

  // Only platforms with a URL are shown — leave the rest empty.
  socials: {
    youtube: '',
    instagram: '',
    linkedin: '',
    x: '',
    discord: '',
    googlePlay: '',
  },

  /* ── Stats ───────────────────────────────────────────────────────────── */
  // `value` is animated as a counter. Use `display` instead for text values.
  // Keep these honest — publishers check.
  stats: [
    { value: 12, label: 'Games Created' },
    { value: 3, label: 'Genres Explored' },
    { value: 100, suffix: '%', label: 'Self Developed' },
    { display: '∞', label: 'Still Learning' },
  ],

  /* ── Skills & technologies ───────────────────────────────────────────── */
  // `icon` must be a key from src/icons.mjs. Unknown keys fall back to a
  // monogram built from `short` (or the first two letters of the name), so a
  // new tool can be added with just a name.
  skills: [
    { name: 'HTML5', icon: 'html5', note: 'Web games' },
    { name: 'JavaScript', icon: 'javascript', note: 'Game logic' },
    { name: 'Unity', icon: 'unity', note: 'Engine' },
    { name: 'C#', icon: 'csharp', note: 'Gameplay code' },
    { name: 'Blender', icon: 'blender', note: '3D assets' },
    { name: 'Photoshop', icon: 'photoshop', note: '2D art & UI' },
    { name: 'Figma', icon: 'figma', note: 'UI / UX design' },
    // { name: 'Git', short: 'Gt', note: 'Version control' },
  ],

  /* ── Games ───────────────────────────────────────────────────────────── */
  // status: 'live' | 'development' | 'prototype' | 'soon'
  // image: path prefix under assets/img without extension. The build expects
  //        <image>-{640,960,1280}.{avif,webp} — `npm run images` creates them.
  games: [
    {
      slug: 'idle-shape-shooter',
      title: 'Idle Shape Shooter',
      tags: ['Idle', 'Shooter', 'Casual'],
      status: 'live',
      featured: true,
      image: 'assets/img/games/idle-shape-shooter',
      imageAlt:
        'Idle Shape Shooter key art: a glowing turret firing at waves of geometric shapes',
      description:
        'Blast through endless waves of geometric enemies, upgrade your firepower and watch the numbers climb — even while you’re away.',
      about: [
        'Idle Shape Shooter is a relaxing yet satisfying idle shooter. Shapes keep coming, your turret keeps firing, and every upgrade makes the next wave feel a little more explosive.',
        'It was designed around short, rewarding sessions: jump in for a minute, spend your earnings on upgrades, and come back later to a pile of progress.',
      ],
      features: [
        'Simple one-touch upgrades with clear, satisfying feedback',
        'Idle progression that keeps earning while you’re away',
        'Clean geometric art style that stays readable on any screen',
        'Runs instantly in the browser and is optimised for smooth play on mobile',
      ],
      platforms: ['Web', 'Android'],
      engine: 'HTML5',
      // Store / play links — leave '' to hide the button.
      links: { play: '', googlePlay: '' },
    },
    {
      slug: 'casual-project',
      title: 'Casual Project',
      tags: ['Casual', 'Puzzle'],
      status: 'development',
      image: 'assets/img/games/casual-project',
      imageAlt: 'Teaser art for an unannounced casual game',
      description:
        'A cosy, easy-to-learn casual game currently in development. More details soon.',
      about: [
        'An unannounced casual project, currently in development. The focus is a relaxing core loop that’s instantly readable and pleasant to come back to.',
        'Follow the devlog for progress updates as the project takes shape.',
      ],
      features: [],
      platforms: ['Android', 'Web'],
      engine: 'Unity',
      links: {},
    },
    {
      slug: 'hypercasual-project',
      title: 'Hypercasual Project',
      tags: ['Hypercasual', 'Arcade'],
      status: 'prototype',
      image: 'assets/img/games/hypercasual-project',
      imageAlt: 'Teaser art for an unannounced hypercasual game',
      description:
        'A one-tap hypercasual prototype built around a single, satisfying mechanic. Currently being tested and iterated.',
      about: [
        'A one-tap hypercasual prototype built around a single mechanic that should feel good within the first three seconds.',
        'It’s being iterated on through quick playtests — the idea only moves forward if the core loop is fun on its own.',
      ],
      features: [],
      platforms: ['Android', 'Web'],
      engine: 'Unity',
      links: {},
    },
  ],

  /* ── Web games carousel ──────────────────────────────────────────────── */
  // Portrait (9:16) video carousel of browser games.
  //  url:    where "Play now" goes (Poki, CrazyGames, itch.io, your own host…)
  //  video:  assets/video/<slug>.mp4 — put your raw capture in src/video/<slug>.mp4
  //          and run `npm run videos` to compress it and make a poster frame.
  // The entries below are PLACEHOLDERS: replace titles, text, links and clips.
  webGames: [
    {
      slug: 'idle-shape-shooter',
      title: 'Idle Shape Shooter',
      tags: ['Idle', 'Shooter'],
      description: 'Blast waves of geometric enemies and upgrade your turret — progress keeps climbing even while you’re away.',
      url: '',
      motif: 'shooter',
    },
    { slug: 'web-game-02', title: 'Web Game 02', tags: ['Hypercasual', 'Runner'], description: 'One-tap runner: time your jumps across floating platforms and chase a new best score.', url: '', motif: 'runner' },
    { slug: 'web-game-03', title: 'Web Game 03', tags: ['Casual', 'Stacking'], description: 'Stack sliding blocks as high as you can. Perfect drops keep the tower wide.', url: '', motif: 'stack' },
    { slug: 'web-game-04', title: 'Web Game 04', tags: ['Puzzle', 'Merge'], description: 'Slide and merge number tiles to reach the highest value on the board.', url: '', motif: 'tiles' },
    { slug: 'web-game-05', title: 'Web Game 05', tags: ['Arcade', 'Timing'], description: 'Jump between orbiting rings and dodge the shapes circling the planet.', url: '', motif: 'orbit' },
    { slug: 'web-game-06', title: 'Web Game 06', tags: ['Hypercasual', 'Reflex'], description: 'Tap to bounce through spinning rings — only pass through the matching colour.', url: '', motif: 'rings' },
    { slug: 'web-game-07', title: 'Web Game 07', tags: ['Idle', 'Arcade'], description: 'Short, satisfying rounds with upgrades that make every run a little stronger.', url: '', motif: 'shooter' },
    { slug: 'web-game-08', title: 'Web Game 08', tags: ['Casual', 'Runner'], description: 'A relaxed endless hopper with collectibles and gentle difficulty ramps.', url: '', motif: 'runner' },
    { slug: 'web-game-09', title: 'Web Game 09', tags: ['Hypercasual', 'Stack'], description: 'Precision stacking with combo streaks for perfect placements.', url: '', motif: 'stack' },
    { slug: 'web-game-10', title: 'Web Game 10', tags: ['Puzzle', 'Casual'], description: 'Bite-sized puzzle boards that are easy to start and hard to put down.', url: '', motif: 'tiles' },
    { slug: 'web-game-11', title: 'Web Game 11', tags: ['Arcade', 'Space'], description: 'Hop between orbits, collect stars and survive the asteroid belt.', url: '', motif: 'orbit' },
    { slug: 'web-game-12', title: 'Web Game 12', tags: ['Hypercasual', 'Colour'], description: 'Fast colour-matching reflex game built for quick sessions on any device.', url: '', motif: 'rings' },
  ],

  /* ── Devlog ──────────────────────────────────────────────────────────── */
  // Newest first is not required — posts are sorted by date automatically.
  // The home page shows the latest 3; every post gets its own page.
  // `body` is an array of blocks: a string is a paragraph, or use
  // { h: 'Heading' } and { list: ['item', 'item'] }.
  devlog: [
    {
      slug: 'ui-polish-and-small-fixes',
      date: '2026-09-18',
      title: 'UI Polish & Small Fixes',
      thumbnail: 'assets/img/devlog/ui-polish',
      excerpt:
        'A round of small but noticeable improvements: clearer buttons, smoother transitions and a handful of bug fixes.',
      body: [
        'This update was all about the small details that make a game feel finished. None of them are big on their own, but together they make the whole experience feel smoother.',
        { h: 'What changed' },
        {
          list: [
            'Cleaner upgrade buttons with clearer affordable / not-affordable states',
            'Softer screen transitions between menus',
            'Better number formatting for large values',
            'Fixed a few layout issues on unusual screen sizes',
          ],
        },
        'Polish is never really “done”, but each pass makes the game a little nicer to play. Thanks to everyone who sent feedback.',
      ],
    },
    {
      slug: 'improved-game-performance',
      date: '2026-08-21',
      title: 'Improved Game Performance',
      thumbnail: 'assets/img/devlog/performance',
      excerpt:
        'Profiling, pooling and fewer allocations — making busy waves run smoothly on lower-end phones and in the browser.',
      body: [
        'When a lot of shapes are on screen at once, every frame counts. This round of work focused on keeping gameplay smooth on lower-end devices and in web builds.',
        { h: 'What I worked on' },
        {
          list: [
            'Object pooling for projectiles, enemies and effects instead of instantiating them every time',
            'Reducing garbage-collection spikes by removing allocations from per-frame code',
            'Combining sprites into atlases to cut down on draw calls',
            'Profiling on real devices rather than relying only on the editor',
          ],
        },
        'The game now feels noticeably steadier during busy moments. Performance work is ongoing, and I’ll keep profiling as new content is added.',
      ],
    },
    {
      slug: 'new-game-idea-idle-shooter',
      date: '2026-06-30',
      title: 'New Game Idea – Idle Shooter',
      thumbnail: 'assets/img/devlog/new-idea',
      excerpt:
        'How a tiny prototype about shapes and a turret turned into the idea for Idle Shape Shooter.',
      body: [
        'Every project starts as a small experiment. This one began with a simple question: what if an idle game felt as punchy as an arcade shooter?',
        { h: 'The first prototype' },
        'The first version was just a turret in the middle of the screen and shapes drifting towards it. No menus, no art — only the core loop. It was already fun to watch the numbers grow, which was a good sign.',
        { h: 'Next steps' },
        {
          list: [
            'Define the upgrade paths and progression pacing',
            'Find a clean visual style that stays readable when the screen gets busy',
            'Get the prototype into players’ hands as early as possible',
          ],
        },
        'Keeping the scope small is the main goal: a simple idea, executed well.',
      ],
    },
  ],
};
