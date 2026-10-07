# Solo Indie Game Developer — Portfolio

A fast, static portfolio site for a solo developer making casual, hypercasual and idle games. No framework and no runtime dependencies. It deploys anywhere that serves static files (GitHub Pages, Netlify, Cloudflare Pages…).

## Editing content

**Everything lives in [`site.config.mjs`](site.config.mjs)**: your name, SEO text, contact settings, social links, stats, skills, games and devlog posts.

After editing, regenerate the pages:

```bash
node build.mjs
```

This writes `index.html`, `games/<slug>/`, `devlog/`, `devlog/<slug>/`, `404.html`, `sitemap.xml`, `robots.txt` and `site.webmanifest`. Commit the generated files too.

### Before going live
- [ ] `siteUrl`: your real domain. It's used for canonical URLs, the sitemap and Open Graph.
- [ ] `contact.formEndpoint`: e.g. a free [Formspree](https://formspree.io) endpoint. Alternatively, set `contact.email` and the form opens the visitor's email app instead.
- [ ] `socials`: fill in the links you have. Only platforms with a URL are shown.
- [ ] Check the Idle Shape Shooter description, platforms and store links (`links.play`, `links.googlePlay`).
- [ ] Re-run `npm run images` so the share image (`og-image.jpg`) uses your name.

### Web games carousel (portrait videos + Play now)
1. Put your gameplay clips in **`src/video/`**. Each file name becomes the game title (`Idle Shape Shooter.mp4`).
2. Optional: create `src/video/games.txt` with each game's play link, tags and description (see `games.example.txt`).
3. Run `npm run videos` and then `node build.mjs`.

Clips are cropped to portrait and trimmed to 12 s. Each is saved as MP4 + WebM with a poster frame. Games without a link show "Play link coming soon". With no clips in the folder, the placeholder entries from `webGames` in the config are shown.

### Playable games (`play/`)
Every game's playable build is copied into `play/<slug>/`, so it is hosted with the site at `…/Studio-site/play/<slug>/`. The list of games and which folder each build comes from is in [`scripts/games.mjs`](scripts/games.mjs).

After updating a game in its own folder (e.g. `Royal Paddle/game-files`), run:

```bash
npm run games    # re-copies every build into play/
```

The carousel's **Play now** button uses the `url:` line in `src/video/games.txt` (e.g. `url: play/paddle-royal/`).

### Adding a game or devlog post
Copy an existing entry in `games` or `devlog`, change the `slug` and the text, then run `node build.mjs`. Posts are sorted by date automatically. The home page shows the latest three, and every post gets its own page.

### Adding a technology
Add `{ name: 'Git', short: 'Gt', note: 'Version control' }` to `skills`. To give it a real icon, add an SVG to `src/icons.mjs` and reference it with `icon: 'key'`. Without one, a monogram is shown.

## Images

All artwork is original and generated from [`scripts/art.mjs`](scripts/art.mjs). To use your **real game art or screenshots**, save the file as `src/art/<name>.png` (or `.jpg`/`.webp`), then run:

```bash
npm install      # once: sharp + playwright-core (uses a local Chromium)
npm run images   # → AVIF + WebP at 640/960/1280 px, favicons, og-image.jpg
node build.mjs
```

| `<name>` | Used for | Aspect |
|---|---|---|
| `idle-shape-shooter` | game card + game page | 16:10 |
| `casual-project`, `hypercasual-project` | game cards | 16:10 |
| `developer-desk` | About section | 4:5 |
| `devlog-new-idea`, `devlog-performance`, `devlog-ui-polish` | devlog thumbnails | 16:10 |

For a new game or post, add a matching job to `JOBS` in `scripts/images.mjs`. If Chromium isn't found, set `CHROME_PATH`.

## Claude Code skills
`.claude/skills/` contains `frontend-design` and `webapp-testing` from [anthropics/skills](https://github.com/anthropics/skills) (Apache-2.0). They're used when this repo is edited with Claude Code.

## Local preview

```bash
npm run dev      # builds, then serves on http://localhost:5173
```

## What's inside
- **Performance:** self-hosted variable fonts (preloaded), responsive AVIF/WebP with lazy loading, animations only on `transform`/`opacity`, carousel clips that load only when the carousel is on screen, and animation loops that pause when off-screen or idle. Lighthouse (simulated mobile, plain local server, no compression): Performance 89, Accessibility 100, Best Practices 100, SEO 100.
- **SEO:** unique titles and descriptions, canonical URLs, Open Graph/Twitter cards, a JSON-LD graph (Person, WebSite, VideoGame, BlogPosting, Breadcrumbs), sitemap, robots.txt and web manifest.
- **Accessibility:** semantic landmarks, skip link, visible focus states, a labelled form with inline errors, and full `prefers-reduced-motion` support (no parallax, particles or reveal motion).
- **Day / night mode:** toggle in the header. The visitor's choice is remembered, and switching plays a circular reveal. Set the starting theme with `defaultTheme` in the config.
- **Motion libraries:** [GSAP](https://gsap.com) (ScrollTrigger, SplitText) and [Lenis](https://lenis.darkroom.engineering) smooth scrolling, vendored in `assets/vendor/`. To update them: `npm install` then copy from `node_modules/gsap/dist` and `node_modules/lenis/dist`.
- **Reduced motion:** visitors with *Reduce motion* turned on in their OS get gentle fades only, with no parallax, scrolling effects or autoplaying clips.
- **Motion:** cinematic hero with parallax layers, mouse depth, floating shapes and particles; scroll reveals with stagger; 3D card tilt; magnetic buttons; desktop cursor ring; scroll progress; back-to-top progress ring; animated counters; page transitions through the View Transitions API.

## Deploying on GitHub Pages
In the repository, go to Settings → Pages and choose **Deploy from a branch**, then select your branch and the `/ (root)` folder. The default `siteUrl` already points at `https://squadsubscribe0-lab.github.io/Studio-site`.
