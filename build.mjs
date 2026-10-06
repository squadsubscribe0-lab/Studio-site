#!/usr/bin/env node
/**
 * Static site generator — zero dependencies.
 *
 *   node build.mjs
 *
 * Reads site.config.mjs and writes:
 *   index.html, games/<slug>/index.html, devlog/index.html,
 *   devlog/<slug>/index.html, 404.html, sitemap.xml, robots.txt,
 *   site.webmanifest
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './site.config.mjs';
import { icons, iconFor } from './src/icons.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = config.siteUrl.replace(/\/+$/, '');
const DEV = config.developer;
const YEAR = new Date().getFullYear();
const warnings = [];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const hashOf = (file) =>
  createHash('sha1').update(readFileSync(join(ROOT, file))).digest('hex').slice(0, 8);

const asset = (r, file) => `${r}${file}?v=${hashOf(file)}`;

const abs = (path = '') => `${SITE}/${path.replace(/^\/+/, '')}`;

const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

const STATUS = {
  live: 'Live',
  development: 'In Development',
  prototype: 'Prototype',
  soon: 'Coming Soon',
};

const SOCIALS = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  discord: 'Discord',
  googlePlay: 'Google Play',
};

const socials = Object.entries(config.socials || {})
  .filter(([key, url]) => url && SOCIALS[key])
  .map(([key, url]) => ({ key, url, label: SOCIALS[key] }));

const games = config.games;
const posts = [...config.devlog].sort((a, b) => b.date.localeCompare(a.date));

/** Responsive <picture> for art produced by scripts/images.mjs. */
const IMAGE_WIDTHS = [640, 960, 1280];
function picture(r, prefix, alt, { ratio = [16, 10], sizes = '100vw', eager = false, cls = '' } = {}) {
  const [rw, rh] = ratio;
  const missing = IMAGE_WIDTHS.filter((w) => !existsSync(join(ROOT, `${prefix}-${w}.webp`)));
  if (missing.length) warnings.push(`Missing image sizes for ${prefix}: ${missing.join(', ')} (run npm run images)`);
  const set = (ext) => IMAGE_WIDTHS.map((w) => `${r}${prefix}-${w}.${ext} ${w}w`).join(', ');
  const hasAvif = existsSync(join(ROOT, `${prefix}-640.avif`));
  return `<picture${cls ? ` class="${cls}"` : ''}>${
    hasAvif ? `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` : ''
  }<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="${r}${prefix}-960.webp" alt="${esc(alt)}" width="${rw * 80}" height="${rh * 80}" ${
    eager ? 'fetchpriority="high"' : 'loading="lazy"'
  } decoding="async"></picture>`;
}

const socialLinks = (cls = 'socials') =>
  socials.length
    ? `<ul class="${cls}">${socials
        .map(
          (s) =>
            `<li><a href="${esc(s.url)}" target="_blank" rel="noopener me" aria-label="${s.label}" title="${s.label}">${icons[s.key]}</a></li>`,
        )
        .join('')}</ul>`
    : '';

const statusBadge = (status) =>
  `<span class="status status--${status}"><span class="status__dot" aria-hidden="true"></span>${STATUS[status] || status}</span>`;

const tagList = (tags) => `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

/* ── Layout ──────────────────────────────────────────────────────────────── */

const NAV = [
  ['Home', 'top'],
  ['Games', 'games'],
  ['About', 'about'],
  ['Devlog', 'devlog'],
  ['Contact', 'contact'],
];

function header(r, isHome) {
  const href = (id) => (isHome ? `#${id}` : `${r}${id === 'top' ? '' : `#${id}`}`) || './';
  return `<a class="skip-link" href="#main">Skip to content</a>
<div class="scroll-progress" aria-hidden="true"><span></span></div>
<header class="site-header" data-header>
  <nav class="nav container" aria-label="Primary">
    <a class="brand" href="${isHome ? '#top' : r || './'}">
      <span class="brand__mark" aria-hidden="true">${esc(DEV.monogram)}</span>
      <span class="brand__name">${esc(DEV.name)}</span>
    </a>
    <div class="nav__menu" id="nav-menu" data-menu>
      <ul class="nav__links">
        ${NAV.map(([label, id]) => `<li><a href="${href(id) || './'}" data-nav="${id}">${label}</a></li>`).join('\n        ')}
      </ul>
      <a class="btn btn--primary btn--sm nav__cta" href="${href('contact')}">Let’s talk</a>
    </div>
    <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to day mode" title="Switch theme">
      <span class="theme-toggle__track" aria-hidden="true">
        <span class="theme-toggle__thumb">
          <svg class="theme-toggle__moon" viewBox="0 0 24 24"><path fill="currentColor" d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"/></svg>
          <svg class="theme-toggle__sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g></svg>
        </span>
      </span>
    </button>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-menu" data-menu-toggle>
      <span class="visually-hidden">Menu</span><span class="nav__bars" aria-hidden="true"></span>
    </button>
  </nav>
</header>`;
}

function footer(r, isHome) {
  const href = (id) => (isHome ? `#${id}` : `${r}#${id}`);
  return `<footer class="site-footer">
  <div class="container footer__inner">
    <div class="footer__brand">
      <a class="brand" href="${isHome ? '#top' : r || './'}">
        <span class="brand__mark" aria-hidden="true">${esc(DEV.monogram)}</span>
        <span class="brand__name">${esc(DEV.name)}</span>
      </a>
      <p class="footer__tagline">${esc(DEV.tagline)}</p>
    </div>
    <nav class="footer__nav" aria-label="Footer">
      <ul>${NAV.map(([label, id]) => `<li><a href="${id === 'top' ? (isHome ? '#top' : r || './') : href(id)}">${label}</a></li>`).join('')}</ul>
    </nav>
    ${socialLinks('socials socials--footer')}
  </div>
  <div class="container footer__legal">
    <p>© ${YEAR} ${esc(DEV.name)}. All rights reserved.</p>
    <p>Designed &amp; built independently.</p>
  </div>
</footer>
<button class="to-top" type="button" aria-label="Back to top" data-to-top>
  <svg class="to-top__ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/></svg>
  ${icons.arrowUp}
</button>`;
}

function layout({ r, path, title, description, image, body, isHome = false, jsonLd = [], type = 'website' }) {
  const fullTitle = title ? `${title} | ${DEV.name}` : `${DEV.name} — ${config.seo.title}`;
  const desc = description || config.seo.description;
  const ogImage = abs(image || config.seo.ogImage);
  const url = abs(path);
  return `<!doctype html>
<html lang="${config.lang}" class="no-js" data-theme="${config.defaultTheme === 'light' ? 'light' : 'dark'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#05070d">
<meta name="color-scheme" content="dark light">
<meta name="author" content="${esc(DEV.name)}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(DEV.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:alt" content="${esc(`${DEV.name} — ${DEV.role}`)}">
<meta name="twitter:card" content="summary_large_image">${
    config.seo.twitterHandle ? `\n<meta name="twitter:site" content="${esc(config.seo.twitterHandle)}">` : ''
  }
<link rel="icon" href="${r}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${r}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${r}apple-touch-icon.png">
<link rel="manifest" href="${r}site.webmanifest">
<link rel="preload" href="${r}assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${r}assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset(r, 'assets/css/main.css')}">
<script>(function(d){d.classList.replace('no-js','js');var t;try{t=localStorage.getItem('theme')}catch(e){}d.setAttribute('data-theme',t==='light'||t==='dark'?t:'${config.defaultTheme === 'light' ? 'light' : 'dark'}');if(innerWidth>=760&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('split-hero')})(document.documentElement)</script>
${['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js', 'lenis.min.js'].map((f) => `<script src="${asset(r, `assets/vendor/${f}`)}" defer></script>`).join('\n')}
<script src="${asset(r, 'assets/js/main.js')}" defer></script>
${jsonLd.map((d) => `<script type="application/ld+json">${JSON.stringify(d)}</script>`).join('\n')}
</head>
<body${isHome ? ' class="is-home"' : ''}>
${header(r, isHome)}
<main id="main">
${body}
</main>
${footer(r, isHome)}
<script>document.body.classList.add('is-loaded')</script>
</body>
</html>
`;
}

/* ── Structured data ─────────────────────────────────────────────────────── */

const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE}/#person`,
  name: DEV.name,
  jobTitle: DEV.role,
  url: `${SITE}/`,
  knowsAbout: ['Game development', 'HTML5 games', 'JavaScript', 'Unity', 'C#', 'Casual games', 'Hypercasual games', 'Idle games'],
  ...(socials.length ? { sameAs: socials.map((s) => s.url) } : {}),
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  name: DEV.name,
  url: `${SITE}/`,
  description: config.seo.description,
  publisher: { '@id': `${SITE}/#person` },
};

const gameLd = (g) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: g.title,
  description: g.description,
  genre: g.tags,
  url: abs(`games/${g.slug}/`),
  image: abs(`${g.image}-1280.webp`),
  author: { '@id': `${SITE}/#person` },
  ...(g.platforms?.length ? { gamePlatform: g.platforms } : {}),
  applicationCategory: 'Game',
  ...(g.links?.googlePlay ? { sameAs: [g.links.googlePlay] } : {}),
});

const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: abs(path),
  })),
});

/* ── Home sections ───────────────────────────────────────────────────────── */

function heroScene() {
  // Purely decorative, original abstract environment (not from any game).
  return `<div class="hero__scene" aria-hidden="true" data-hero-scene>
    <div class="hero__layer hero__sky" data-depth="0.06"></div>
    <svg class="hero__layer hero__world" data-depth="0.14" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="hz-sun" cx="50%" cy="100%" r="60%">
          <stop offset="0" style="stop-color:var(--hz-sun)" stop-opacity=".55"/>
          <stop offset=".35" style="stop-color:var(--hz-sun)" stop-opacity=".16"/>
          <stop offset="1" style="stop-color:var(--hz-sun)" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="hz-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--hz-far-a)"/><stop offset="1" style="stop-color:var(--hz-far-b)"/>
        </linearGradient>
        <linearGradient id="hz-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--hz-near-a)"/><stop offset="1" style="stop-color:var(--hz-near-b)"/>
        </linearGradient>
        <linearGradient id="hz-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff9a40" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="hz-grid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff8a2a" stop-opacity="0"/><stop offset=".25" stop-color="#ff8a2a" stop-opacity=".16"/><stop offset="1" stop-color="#ff8a2a" stop-opacity=".04"/>
        </linearGradient>
      </defs>
      <ellipse cx="800" cy="700" rx="900" ry="420" fill="url(#hz-sun)"/>
      <circle cx="800" cy="640" r="250" fill="none" style="stroke:var(--hz-ring)" stroke-opacity=".3" stroke-width="1.5"/>
      <circle cx="800" cy="640" r="300" fill="none" stroke="#ffffff" stroke-opacity=".05" stroke-width="1"/>
      <path d="M0 690 L120 600 L180 640 L300 520 L360 580 L470 470 L540 560 L620 610 L980 610 L1060 540 L1130 470 L1250 560 L1320 520 L1430 610 L1520 570 L1600 640 L1600 900 L0 900Z" fill="url(#hz-far)" opacity=".85"/>
      <path d="M300 520 L360 580 M1130 470 L1250 560 M470 470 L540 560" stroke="url(#hz-edge)" stroke-width="1.5" opacity=".55"/>
      <g stroke="url(#hz-grid)" stroke-width="1">
        <path d="M0 700H1600M0 728H1600M0 766H1600M0 818H1600M0 890H1600"/>
        <path d="M800 690 L-400 900 M800 690 L0 900 M800 690 L300 900 M800 690 L560 900 M800 690 L800 900 M800 690 L1040 900 M800 690 L1300 900 M800 690 L1600 900 M800 690 L2000 900"/>
      </g>
      <path d="M0 760 L140 700 L260 740 L380 690 L520 760 L0 900Z M1600 760 L1470 690 L1340 730 L1220 680 L1080 770 L1600 900Z" fill="url(#hz-near)"/>
    </svg>
    <canvas class="hero__particles" data-particles></canvas>
    <div class="hero__layer hero__floaters">
      ${floater('cube', 'f1', 0.55)}
      ${floater('ring', 'f2', 0.35)}
      ${floater('orb', 'f3', 0.8)}
      ${floater('pyramid', 'f4', 0.45)}
      ${floater('diamond', 'f5', 0.25)}
      ${floater('cube', 'f6', 0.2)}
      ${floater('orb', 'f7', 0.3)}
      ${floater('ring', 'f8', 0.65)}
    </div>
    <div class="hero__fog"></div>
    <div class="hero__vignette"></div>
  </div>`;
}

function floater(shape, cls, depth) {
  const svgs = {
    cube: `<svg viewBox="0 0 100 100"><defs><linearGradient id="${cls}-t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4a78"/><stop offset="1" stop-color="#1a2444"/></linearGradient><linearGradient id="${cls}-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18223f"/><stop offset="1" stop-color="#0b1022"/></linearGradient><linearGradient id="${cls}-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a2a"/><stop offset="1" stop-color="#b8430a"/></linearGradient></defs><path d="M50 8 88 29 50 50 12 29Z" fill="url(#${cls}-t)"/><path d="M12 29 50 50v42L12 71Z" fill="url(#${cls}-l)"/><path d="M88 29 50 50v42l38-21Z" fill="url(#${cls}-r)" opacity=".9"/><path d="M50 8 88 29 50 50 12 29Z M50 50v42" fill="none" stroke="#ffd2a6" stroke-opacity=".35" stroke-width=".8"/></svg>`,
    ring: `<svg viewBox="0 0 100 100"><defs><linearGradient id="${cls}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb36b"/><stop offset=".5" stop-color="#ff7a1a" stop-opacity=".5"/><stop offset="1" stop-color="#3a4a78" stop-opacity=".4"/></linearGradient></defs><ellipse cx="50" cy="50" rx="40" ry="40" fill="none" stroke="url(#${cls}-g)" stroke-width="7"/><ellipse cx="50" cy="50" rx="40" ry="40" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1" transform="translate(-1.5 -1.5)"/></svg>`,
    orb: `<svg viewBox="0 0 100 100"><defs><radialGradient id="${cls}-g" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffe0bf"/><stop offset=".3" stop-color="#ff9a40"/><stop offset=".75" stop-color="#c2450a"/><stop offset="1" stop-color="#3a1404"/></radialGradient></defs><circle cx="50" cy="50" r="44" fill="url(#${cls}-g)"/></svg>`,
    pyramid: `<svg viewBox="0 0 100 100"><defs><linearGradient id="${cls}-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e3c66"/><stop offset="1" stop-color="#0f162d"/></linearGradient><linearGradient id="${cls}-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa057"/><stop offset="1" stop-color="#a63d0a"/></linearGradient></defs><path d="M50 6 10 84 50 94Z" fill="url(#${cls}-a)"/><path d="M50 6 90 84 50 94Z" fill="url(#${cls}-b)" opacity=".85"/><path d="M50 6 50 94" stroke="#ffd9b3" stroke-opacity=".45" stroke-width=".8"/></svg>`,
    diamond: `<svg viewBox="0 0 100 100"><defs><linearGradient id="${cls}-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9eefc" stop-opacity=".55"/><stop offset="1" stop-color="#6d7fb3" stop-opacity=".15"/></linearGradient></defs><path d="M50 4 86 50 50 96 14 50Z" fill="url(#${cls}-a)" stroke="#fff" stroke-opacity=".35" stroke-width="1"/><path d="M14 50h72M50 4 40 50 50 96 60 50Z" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width=".8"/></svg>`,
  };
  return `<div class="floater floater--${cls}" data-depth="${depth}"><div class="floater__bob">${svgs[shape]}</div></div>`;
}

function hero() {
  const featured = games.find((g) => g.featured) || games[0];
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  ${heroScene()}
  <div class="container hero__content" data-hero-content>
    <p class="badge hero__badge"><span class="badge__dot" aria-hidden="true"></span>Solo Indie Developer</p>
    <h1 class="hero__title" id="hero-title">
      <span class="hero__line"><span>I build simple games</span></span>
      <span class="hero__line"><span>people <em>can’t put down.</em></span></span>
    </h1>
    <p class="hero__lead">I’m an indie game developer focused on creating fun, addictive and polished casual, hypercasual and idle games.</p>
    <div class="hero__actions">
      <a class="btn btn--primary btn--lg" href="#games" data-magnetic>View My Games ${icons.arrow}</a>
      <a class="btn btn--ghost btn--lg" href="#about" data-magnetic>About Me</a>
    </div>
    <ul class="hero__genres">
      <li>Casual</li><li>Hypercasual</li><li>Idle</li><li>HTML5 &amp; Unity</li>
    </ul>
  </div>
  ${
    featured
      ? `<a class="hero__spotlight glass" href="games/${featured.slug}/">
    <span class="hero__spotlight-label">${featured.status === 'live' ? 'Latest release' : 'Now building'}</span>
    <span class="hero__spotlight-title">${esc(featured.title)}</span>
    ${statusBadge(featured.status)}
    <span class="hero__spotlight-arrow" aria-hidden="true">${icons.arrow}</span>
  </a>`
      : ''
  }
  <a class="scroll-cue" href="#games" aria-label="Scroll to games">
    <span class="scroll-cue__mouse" aria-hidden="true"><span></span></span>
    <span class="scroll-cue__text" aria-hidden="true">Scroll</span>
  </a>
</section>`;
}

function gameCard(g, r = '') {
  const featured = !!g.featured;
  return `<article class="game-card${featured ? ' game-card--featured' : ''} reveal" data-tilt>
  <div class="game-card__media">
    ${picture(r, g.image, g.imageAlt || g.title, {
      sizes: featured ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 760px) 50vw, 100vw',
    })}
    <div class="game-card__shade" aria-hidden="true"></div>
    ${statusBadge(g.status)}
  </div>
  <div class="game-card__body">
    ${featured ? '<p class="game-card__kicker">Featured game</p>' : ''}
    <h3 class="game-card__title">${esc(g.title)}</h3>
    ${tagList(g.tags)}
    <p class="game-card__desc">${esc(g.description)}</p>
    <a class="game-card__link" href="${r}games/${g.slug}/">
      <span>View Details<span class="visually-hidden">: ${esc(g.title)}</span></span><span class="game-card__arrow" aria-hidden="true">${icons.arrow}</span>
    </a>
  </div>
</article>`;
}

function marquee() {
  const words = ['Casual', 'Hypercasual', 'Idle', 'HTML5', 'Unity', 'Web games'];
  const row = words.map((w, i) => `<span class="marquee__word${i % 2 ? ' marquee__word--outline' : ''}">${w}</span><span class="marquee__star">✦</span>`).join('');
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track" data-marquee>${row}${row}</div></div>`;
}

function webGamesCarousel() {
  const list = config.webGames || [];
  if (!list.length) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const first = list[0];
  const data = list.map((g) => ({ title: g.title, tags: g.tags, description: g.description, url: g.url || '' }));
  // Both buttons are rendered; JS shows the right one for the selected game.
  const playBtn = (g) =>
    `<a class="btn btn--primary btn--lg" data-wg-play href="${esc(g.url || '#play')}" target="_blank" rel="noopener" data-magnetic${g.url ? '' : ' hidden'}>${icons.play}<span>Play now</span></a>` +
    `<button class="btn btn--primary btn--lg is-disabled" type="button" data-wg-play disabled${g.url ? ' hidden' : ''}>${icons.play}<span>Play link coming soon</span></button>`;
  return `<div class="play" id="play">
  <div class="play__info">
    <h3 class="play__heading reveal">Play in your browser</h3>
    <p class="play__intro reveal">${list.length} HTML5 games that load instantly on phone or desktop — no download needed.</p>
    <div class="play__detail reveal" data-wg-detail aria-live="polite">
      <p class="play__count"><span data-wg-index>01</span><span class="play__total"> / ${pad(list.length)}</span></p>
      <h4 class="play__title" data-wg-title>${esc(first.title)}</h4>
      <ul class="tags" data-wg-tags>${first.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <p class="play__desc" data-wg-desc>${esc(first.description)}</p>
      <div class="play__actions">
        ${playBtn(first)}
        <div class="play__arrows">
          <button class="icon-btn" type="button" data-wg-prev aria-label="Previous game">${icons.chevronUp}</button>
          <button class="icon-btn" type="button" data-wg-next aria-label="Next game">${icons.chevronDown}</button>
        </div>
      </div>
    </div>
  </div>
  <section class="wg reveal" data-wg aria-roledescription="carousel" aria-label="Web games" tabindex="0">
    <div class="wg__glow" aria-hidden="true"></div>
    <div class="wg__stage" data-wg-stage>
      ${list
        .map(
          (g, i) => `<article class="wg-card${i === 0 ? ' is-active' : ''}" data-wg-card aria-roledescription="slide" aria-label="${i + 1} of ${list.length}: ${esc(g.title)}">
        <div class="wg-card__media">
          <picture><source type="image/avif" srcset="assets/img/web-games/${g.slug}.avif"><img src="assets/img/web-games/${g.slug}.webp" alt="" width="432" height="768" loading="${i < 3 || i === list.length - 1 ? 'eager' : 'lazy'}" decoding="async"></picture>
          <video muted loop playsinline preload="none" data-webm="assets/video/${g.slug}.webm" data-mp4="assets/video/${g.slug}.mp4" aria-hidden="true"></video>
        </div>
        <div class="wg-card__shade" aria-hidden="true"></div>
        <div class="wg-card__meta">
          <span class="wg-card__title">${esc(g.title)}</span>
          <span class="wg-card__tags">${g.tags.map(esc).join(' / ')}</span>
        </div>
        <span class="wg-card__progress" aria-hidden="true"><span></span></span>
      </article>`,
        )
        .join('\n      ')}
    </div>
    <ol class="wg__rail">
      ${list.map((g, i) => `<li><button type="button" data-wg-go="${i}" aria-label="Show ${esc(g.title)}"${i === 0 ? ' aria-current="true"' : ''}></button></li>`).join('')}
    </ol>
  </section>
  <script type="application/json" id="wg-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</div>`;
}

function gamesSection() {
  const sorted = [...games].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return `<section class="section games" id="games" aria-labelledby="games-title">
  <div class="container">
    <header class="section-head reveal">
      <p class="eyebrow">Portfolio</p>
      <h2 id="games-title">My Games</h2>
      <p class="section-head__lead">A collection of casual, hypercasual and idle games built with a focus on fun, simplicity and replayability.</p>
    </header>
    ${webGamesCarousel()}
    <h3 class="games__sub reveal">Featured &amp; in development</h3>
    <div class="games-grid" data-stagger>
      ${sorted.map((g) => gameCard(g)).join('\n      ')}
    </div>
  </div>
</section>`;
}

const DISCIPLINES = [
  ['design', 'Game design', 'Core loops, progression and balancing'],
  ['html5', 'HTML5 development', 'Browser games that load instantly on any device'],
  ['engine', 'Unity development', 'Gameplay systems, scenes and builds'],
  ['code', 'Programming', 'Clean, maintainable C#'],
  ['ui', 'UI', 'Clear menus and satisfying feedback'],
  ['speed', 'Optimization', 'Smooth on mobile and the web'],
  ['publish', 'Publishing', 'Store and web-portal releases'],
  ['feedback', 'Player feedback', 'Iterating on what players actually do'],
];

function aboutSection() {
  const building = games.find((g) => g.status === 'development') || games.find((g) => g.status !== 'live');
  return `<section class="section about" id="about" aria-labelledby="about-title">
  <div class="container about__grid">
    <div class="about__visual reveal reveal--left">
      <div class="about__frame" data-parallax="0.06">
        ${picture('', 'assets/img/about/developer-desk', 'An indie developer working late at a desk with a gaming PC, two monitors showing a game in progress', {
          ratio: [4, 5],
          sizes: '(min-width: 1024px) 40vw, 100vw',
        })}
      </div>
      ${
        building
          ? `<div class="about__chip about__chip--top glass"><span class="about__chip-label">Currently building</span><strong>${esc(building.title)}</strong></div>`
          : ''
      }
      <div class="about__chip about__chip--bottom glass">${icons.html5}<span>HTML5 &amp; Unity games</span></div>
    </div>
    <div class="about__copy">
      <p class="eyebrow reveal">About</p>
      <h2 id="about-title" class="reveal">Hi, I’m an <span class="text-accent">Indie Developer</span></h2>
      <div class="about__text reveal">
        <p>I make games on my own — from the first rough idea to the build that ends up in players’ hands. Every step is mine: designing the core loop, building it — mostly as HTML5 games that run instantly in any browser, and in Unity — writing the code, crafting the UI, optimising performance and preparing the game for release.</p>
        <p>I focus on casual, hypercasual and idle games because they reward clarity. A good one is understood in seconds, feels great to play right away and always gives you a reason to come back. That’s the bar I aim for with every project.</p>
        <p>Launch isn’t the finish line. I watch how people actually play, listen to feedback and keep iterating — small, deliberate changes that make each game better over time.</p>
      </div>
      <ul class="disciplines" data-stagger>
        ${DISCIPLINES.map(
          ([icon, title, text]) =>
            `<li class="discipline reveal"><span class="discipline__icon">${icons[icon]}</span><span><strong>${title}</strong><span>${text}</span></span></li>`,
        ).join('\n        ')}
      </ul>
      <div class="about__actions reveal">
        <a class="btn btn--primary" href="#contact" data-magnetic>Get in touch ${icons.arrow}</a>
        <a class="btn btn--ghost" href="#devlog" data-magnetic>Read the devlog</a>
      </div>
    </div>
  </div>
</section>`;
}

function philosophySection() {
  const items = [
    ['simple', 'Keep it simple', 'Easy to understand. Hard to master.', 'If a player needs a tutorial to start having fun, the design isn’t done yet.'],
    ['fun', 'Focus on fun', 'If it’s not fun, it doesn’t work.', 'Every feature has to earn its place by making the moment-to-moment play feel better.'],
    ['iterate', 'Iterate & improve', 'Small changes, big results.', 'Playtest, measure, adjust, repeat. Steady polish beats big rewrites.'],
  ];
  return `<section class="section philosophy" aria-labelledby="philosophy-title">
  <div class="container">
    <header class="section-head section-head--center reveal">
      <p class="eyebrow">How I work</p>
      <h2 id="philosophy-title">My Philosophy</h2>
    </header>
    <div class="philosophy__grid" data-stagger>
      ${items
        .map(
          ([icon, title, quote, text], i) => `<article class="principle glass reveal" data-tilt>
        <div class="principle__top"><span class="principle__icon">${icons[icon]}</span><span class="principle__num" aria-hidden="true">0${i + 1}</span></div>
        <h3>${title}</h3>
        <p class="principle__quote">“${quote}”</p>
        <p class="principle__text">${text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;
}

function statsSection() {
  return `<section class="stats" aria-label="At a glance">
  <div class="container">
    <dl class="stats__grid glass reveal" data-stagger>
      ${config.stats
        .map((s) => {
          const value =
            s.display != null
              ? `<span class="stat__value">${esc(s.display)}</span>`
              : `<span class="stat__value"><span data-count="${Number(s.value)}">${Number(s.value)}</span>${esc(s.suffix || '')}</span>`;
          return `<div class="stat"><dt>${esc(s.label)}</dt><dd>${value}</dd></div>`;
        })
        .join('\n      ')}
    </dl>
  </div>
</section>`;
}

function skillsSection() {
  return `<section class="section skills" aria-labelledby="skills-title">
  <div class="container">
    <header class="section-head section-head--split reveal">
      <div>
        <p class="eyebrow">Toolkit</p>
        <h2 id="skills-title">Skills &amp; Technologies</h2>
      </div>
      <p class="section-head__lead">The tools I use every day to take a game from sketch to store.</p>
    </header>
    <ul class="skills__grid" data-stagger>
      ${config.skills
        .map(
          (s) => `<li class="skill reveal" data-tilt>
        <span class="skill__icon">${iconFor(s.icon, s.short || s.name)}</span>
        <span class="skill__name">${esc(s.name)}</span>
        ${s.note ? `<span class="skill__note">${esc(s.note)}</span>` : ''}
      </li>`,
        )
        .join('\n      ')}
    </ul>
  </div>
</section>`;
}

function postCard(p, r = '') {
  return `<article class="post-card reveal">
  <div class="post-card__media">
    ${picture(r, p.thumbnail, '', { sizes: '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw' })}
  </div>
  <div class="post-card__body">
    <time class="post-card__date" datetime="${p.date}">${fmtDate(p.date)}</time>
    <h3 class="post-card__title">${esc(p.title)}</h3>
    <p class="post-card__excerpt">${esc(p.excerpt)}</p>
    <a class="post-card__link" href="${r}devlog/${p.slug}/">Read More<span class="visually-hidden"> about “${esc(p.title)}”</span> <span aria-hidden="true">${icons.arrow}</span></a>
  </div>
</article>`;
}

function devlogSection() {
  const latest = posts.slice(0, 3);
  return `<section class="section devlog" id="devlog" aria-labelledby="devlog-title">
  <div class="container">
    <header class="section-head section-head--split reveal">
      <div>
        <p class="eyebrow">Behind the scenes</p>
        <h2 id="devlog-title">Devlog</h2>
      </div>
      <p class="section-head__lead">Progress notes, experiments and lessons learned while building games solo.</p>
    </header>
    <ol class="timeline" data-stagger>
      ${latest.map((p) => `<li class="timeline__item"><span class="timeline__dot" aria-hidden="true"></span>${postCard(p)}</li>`).join('\n      ')}
    </ol>
    <p class="devlog__more reveal"><a class="btn btn--ghost" href="devlog/" data-magnetic>All devlog posts ${icons.arrow}</a></p>
  </div>
</section>`;
}

function contactSection() {
  const { formEndpoint, email } = config.contact;
  if (!formEndpoint && !email) warnings.push('contact.formEndpoint and contact.email are both empty — the contact form cannot deliver messages.');
  return `<section class="section contact" id="contact" aria-labelledby="contact-title">
  <div class="contact__glow" aria-hidden="true"></div>
  <div class="container contact__grid">
    <div class="contact__intro">
      <p class="eyebrow reveal">Contact</p>
      <h2 id="contact-title" class="reveal">Let’s Create Something <span class="text-accent">Fun.</span></h2>
      <p class="contact__lead reveal">Have a game idea, feedback, publishing opportunity or business inquiry? Feel free to reach out.</p>
      <ul class="contact__topics reveal">
        <li>Publishing partnerships</li><li>Collaborations</li><li>Player feedback</li><li>Business inquiries</li>
      </ul>
      ${email ? `<a class="contact__email reveal" href="mailto:${esc(email)}">${icons.mail}<span>${esc(email)}</span></a>` : ''}
      ${socials.length ? `<div class="contact__socials reveal"><p class="contact__socials-label">Find me on</p>${socialLinks('socials socials--lg')}</div>` : ''}
    </div>
    <form class="contact-form glass reveal" data-contact-form action="${esc(formEndpoint || (email ? `mailto:${email}` : '#'))}" method="post" data-endpoint="${esc(formEndpoint)}" data-email="${esc(email)}" novalidate>
      <div class="field">
        <input id="cf-name" name="name" type="text" autocomplete="name" required maxlength="100" placeholder=" ">
        <label for="cf-name">Name</label>
        <span class="field__error" id="cf-name-error"></span>
      </div>
      <div class="field">
        <input id="cf-email" name="email" type="email" autocomplete="email" required maxlength="200" placeholder=" ">
        <label for="cf-email">Email</label>
        <span class="field__error" id="cf-email-error"></span>
      </div>
      <div class="field">
        <textarea id="cf-message" name="message" rows="5" required maxlength="5000" placeholder=" "></textarea>
        <label for="cf-message">Message</label>
        <span class="field__error" id="cf-message-error"></span>
      </div>
      <div class="field--hp" aria-hidden="true">
        <label for="cf-company">Company</label>
        <input id="cf-company" name="_gotcha" type="text" tabindex="-1" autocomplete="off">
      </div>
      <button class="btn btn--primary btn--lg btn--block" type="submit" data-magnetic>
        <span class="btn__label">Send Message</span> ${icons.send}
      </button>
      <p class="contact-form__status" role="status" aria-live="polite" data-form-status></p>
    </form>
  </div>
</section>`;
}

/* ── Pages ───────────────────────────────────────────────────────────────── */

function homePage() {
  const body = [hero(), marquee(), gamesSection(), aboutSection(), philosophySection(), statsSection(), skillsSection(), devlogSection(), contactSection()].join('\n');
  return layout({
    r: '',
    path: '',
    body,
    isHome: true,
    jsonLd: [personLd, websiteLd, { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Games', itemListElement: games.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`games/${g.slug}/`), name: g.title })) }],
  });
}

function pageHero(r, { eyebrow, title, lead, back }) {
  return `<section class="page-hero">
  <div class="page-hero__bg" aria-hidden="true"></div>
  <div class="container">
    <a class="back-link" href="${back[0]}">${icons.arrowLeft}<span>${back[1]}</span></a>
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
    <h1>${title}</h1>
    ${lead ? `<p class="page-hero__lead">${lead}</p>` : ''}
  </div>
</section>`;
}

function gamePage(g) {
  const r = '../../';
  const others = games.filter((o) => o.slug !== g.slug);
  const links = [];
  if (g.links?.play) links.push(`<a class="btn btn--primary btn--lg" href="${esc(g.links.play)}" target="_blank" rel="noopener" data-magnetic>${icons.play} Play now</a>`);
  if (g.links?.googlePlay) links.push(`<a class="btn btn--ghost btn--lg" href="${esc(g.links.googlePlay)}" target="_blank" rel="noopener" data-magnetic>${icons.googlePlay} Google Play</a>`);
  if (!links.length) links.push(`<a class="btn btn--primary btn--lg" href="${r}#contact" data-magnetic>Ask about this game ${icons.arrow}</a>`);

  const body = `<article class="game-page">
  <header class="game-hero">
    <div class="game-hero__art" aria-hidden="true">${picture(r, g.image, '', { eager: true, cls: 'game-hero__picture' })}</div>
    <div class="container game-hero__content">
      <a class="back-link" href="${r}#games">${icons.arrowLeft}<span>All games</span></a>
      <div class="game-hero__meta">${statusBadge(g.status)}${tagList(g.tags)}</div>
      <h1>${esc(g.title)}</h1>
      <p class="game-hero__lead">${esc(g.description)}</p>
      <div class="hero__actions">${links.join('')}</div>
    </div>
  </header>
  <div class="container game-page__grid">
    <div class="game-page__main">
      <figure class="game-page__shot reveal">${picture(r, g.image, g.imageAlt || g.title, { sizes: '(min-width: 1024px) 60vw, 100vw' })}</figure>
      <section class="prose reveal" aria-labelledby="about-game">
        <h2 id="about-game">About the game</h2>
        ${(g.about || [g.description]).map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
      </section>
      ${
        g.features?.length
          ? `<section class="prose reveal" aria-labelledby="features"><h2 id="features">Highlights</h2><ul class="check-list">${g.features
              .map((f) => `<li>${icons.check}<span>${esc(f)}</span></li>`)
              .join('')}</ul></section>`
          : ''
      }
    </div>
    <aside class="game-page__aside">
      <dl class="facts glass reveal">
        <div><dt>Status</dt><dd>${STATUS[g.status] || g.status}</dd></div>
        <div><dt>Genre</dt><dd>${g.tags.map(esc).join(' • ')}</dd></div>
        ${g.platforms?.length ? `<div><dt>Platforms</dt><dd>${g.platforms.map(esc).join(', ')}</dd></div>` : ''}
        ${g.engine ? `<div><dt>Engine</dt><dd>${esc(g.engine)}</dd></div>` : ''}
        <div><dt>Developer</dt><dd>${esc(DEV.name)} (solo)</dd></div>
      </dl>
      <div class="aside-cta glass reveal">
        <h2>Publishing or partnership inquiry?</h2>
        <p>I’m open to conversations with publishers and partners.</p>
        <a class="btn btn--primary btn--block" href="${r}#contact">Get in touch</a>
      </div>
    </aside>
  </div>
  ${
    others.length
      ? `<section class="section more-games" aria-labelledby="more-games"><div class="container"><header class="section-head reveal"><p class="eyebrow">Portfolio</p><h2 id="more-games">More games</h2></header><div class="games-grid games-grid--compact" data-stagger>${others
          .map((o) => gameCard({ ...o, featured: false }, r))
          .join('')}</div></div></section>`
      : ''
  }
</article>`;
  return layout({
    r,
    path: `games/${g.slug}/`,
    title: `${g.title} — ${g.tags.join(', ')} Game`,
    description: g.description,
    image: `${g.image}-1280.webp`,
    body,
    jsonLd: [gameLd(g), breadcrumbLd([['Home', ''], ['Games', '#games'], [g.title, `games/${g.slug}/`]])],
  });
}

function renderBlocks(blocks) {
  return blocks
    .map((b) => {
      if (typeof b === 'string') return `<p>${esc(b)}</p>`;
      if (b.h) return `<h2>${esc(b.h)}</h2>`;
      if (b.list) return `<ul>${b.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
      if (b.html) return b.html;
      return '';
    })
    .join('\n      ');
}

function postPage(p, i) {
  const r = '../../';
  const newer = posts[i - 1];
  const older = posts[i + 1];
  const body = `<article class="post">
  ${pageHero(r, { eyebrow: `<time datetime="${p.date}">${fmtDate(p.date)}</time> · Devlog`, title: esc(p.title), lead: esc(p.excerpt), back: [`${r}devlog/`, 'All posts'] })}
  <div class="container container--narrow">
    <figure class="post__cover reveal">${picture(r, p.thumbnail, '', { eager: true, sizes: '(min-width: 860px) 800px, 100vw' })}</figure>
    <div class="prose reveal">
      ${renderBlocks(p.body || [p.excerpt])}
    </div>
    <nav class="post-nav" aria-label="More posts">
      ${older ? `<a class="post-nav__link glass" href="${r}devlog/${older.slug}/"><span>Previous</span><strong>${esc(older.title)}</strong></a>` : '<span></span>'}
      ${newer ? `<a class="post-nav__link post-nav__link--next glass" href="${r}devlog/${newer.slug}/"><span>Next</span><strong>${esc(newer.title)}</strong></a>` : '<span></span>'}
    </nav>
  </div>
</article>`;
  return layout({
    r,
    path: `devlog/${p.slug}/`,
    title: `${p.title} — Devlog`,
    description: p.excerpt,
    image: `${p.thumbnail}-1280.webp`,
    type: 'article',
    body,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.excerpt,
        datePublished: p.date,
        image: abs(`${p.thumbnail}-1280.webp`),
        url: abs(`devlog/${p.slug}/`),
        author: { '@id': `${SITE}/#person`, '@type': 'Person', name: DEV.name },
      },
      breadcrumbLd([['Home', ''], ['Devlog', 'devlog/'], [p.title, `devlog/${p.slug}/`]]),
    ],
  });
}

function devlogIndexPage() {
  const r = '../';
  const body = `${pageHero(r, { eyebrow: 'Behind the scenes', title: 'Devlog', lead: 'Progress notes, experiments and lessons learned while building games solo.', back: [`${r}`, 'Home'] })}
<section class="section section--tight devlog">
  <div class="container">
    <ol class="timeline timeline--full" data-stagger>
      ${posts.map((p) => `<li class="timeline__item"><span class="timeline__dot" aria-hidden="true"></span>${postCard(p, r)}</li>`).join('\n      ')}
    </ol>
  </div>
</section>`;
  return layout({
    r,
    path: 'devlog/',
    title: 'Devlog',
    description: 'Development updates, experiments and lessons learned from a solo indie game developer.',
    body,
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'Blog', name: `${DEV.name} Devlog`, url: abs('devlog/'), author: { '@id': `${SITE}/#person` } }],
  });
}

function notFoundPage() {
  // Served from any path on GitHub Pages / Netlify, so use absolute-from-site paths.
  const base = new URL(`${SITE}/`).pathname;
  const body = `<section class="page-hero page-hero--404">
  <div class="page-hero__bg" aria-hidden="true"></div>
  <div class="container">
    <p class="eyebrow">Error 404</p>
    <h1>Game over… <span class="text-accent">this page doesn’t exist.</span></h1>
    <p class="page-hero__lead">The link may be broken or the page may have moved. Press continue to head back home.</p>
    <div class="hero__actions"><a class="btn btn--primary btn--lg" href="${base}">Continue ${icons.arrow}</a></div>
  </div>
</section>`;
  return layout({ r: base, path: '404.html', title: 'Page not found', body });
}

/* ── Write ───────────────────────────────────────────────────────────────── */

function write(path, content) {
  const full = join(ROOT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  return path;
}

const written = [];
written.push(write('index.html', homePage()));
for (const g of games) written.push(write(`games/${g.slug}/index.html`, gamePage(g)));
posts.forEach((p, i) => written.push(write(`devlog/${p.slug}/index.html`, postPage(p, i))));
written.push(write('devlog/index.html', devlogIndexPage()));
written.push(write('404.html', notFoundPage()));

const today = new Date().toISOString().slice(0, 10);
const urls = [
  ['', today, '1.0'],
  ...games.map((g) => [`games/${g.slug}/`, today, '0.8']),
  ['devlog/', posts[0]?.date || today, '0.7'],
  ...posts.map((p) => [`devlog/${p.slug}/`, p.date, '0.6']),
];
written.push(
  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, d, pr]) => `  <url><loc>${abs(p)}</loc><lastmod>${d}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`,
  ),
);
written.push(write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${abs('sitemap.xml')}\n`));
written.push(
  write(
    'site.webmanifest',
    `${JSON.stringify(
      {
        name: `${DEV.name} — ${DEV.role}`,
        short_name: DEV.name,
        start_url: './',
        display: 'standalone',
        background_color: '#05070d',
        theme_color: '#05070d',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      null,
      2,
    )}\n`,
  ),
);

console.log(`Built ${written.length} files:\n  ${written.join('\n  ')}`);
for (const w of new Set(warnings)) console.warn(`⚠ ${w}`);
