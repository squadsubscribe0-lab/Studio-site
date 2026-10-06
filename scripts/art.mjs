/**
 * Original, procedurally composed SVG artwork for the site.
 * Rendered to AVIF/WebP by scripts/images.mjs. Replace with real
 * screenshots / key art whenever you have them.
 */

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const poly = (cx, cy, r, sides, rot = 0) =>
  Array.from({ length: sides }, (_, i) => {
    const a = rot + (i / sides) * Math.PI * 2 - Math.PI / 2;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');

const FONT = "font-family=\"Space Grotesk, Inter, sans-serif\"";

const stars = (rand, w, h, n, maxY = h) =>
  Array.from({ length: n }, () => {
    const r = rand() * 1.2 + 0.3;
    return `<circle cx="${(rand() * w).toFixed(1)}" cy="${(rand() * maxY).toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(rand() * 0.5 + 0.15).toFixed(2)}"/>`;
  }).join('');

/* ── Idle Shape Shooter key art ─────────────────────────────────────────── */

export function idleShapeShooter({ w = 1280, h = 800 } = {}) {
  const rand = rng(7);
  const tx = 400;
  const ty = 500;
  const enemyColors = ['#4fd1ff', '#9b7bff', '#ff5c8a', '#ffd166', '#5ef2c2'];
  const enemies = [];
  const targets = [];
  for (let i = 0; i < 26; i++) {
    const x = 640 + rand() * 640;
    const y = 60 + rand() * 640;
    const size = 18 + rand() * 46 * (x / 1280);
    const sides = [3, 4, 5, 6][Math.floor(rand() * 4)];
    const color = enemyColors[Math.floor(rand() * enemyColors.length)];
    const rot = rand() * Math.PI;
    const blur = x > 1150 ? 1.5 : 0;
    enemies.push(`<g filter="url(#ess-soft)"${blur ? ' opacity=".55"' : ''}>
      <polygon points="${poly(x, y, size, sides, rot)}" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="${poly(x, y, size * 0.45, sides, rot)}" fill="${color}" fill-opacity=".55"/>
    </g>`);
    if (i < 7) targets.push([x, y, color, size]);
  }
  // Explosions on some targets
  const bursts = targets.slice(0, 4).map(([x, y, color, size], i) => {
    const frags = Array.from({ length: 10 }, (_, k) => {
      const a = (k / 10) * Math.PI * 2 + rand();
      const d = size * (1.2 + rand() * 1.4);
      const fx = x + Math.cos(a) * d;
      const fy = y + Math.sin(a) * d;
      return `<polygon points="${poly(fx, fy, 4 + rand() * 6, 3, rand() * 6)}" fill="${color}" opacity="${(0.5 + rand() * 0.5).toFixed(2)}"/>`;
    }).join('');
    return `<g><circle cx="${x}" cy="${y}" r="${size * 1.6}" fill="url(#ess-burst)"/><circle cx="${x}" cy="${y}" r="${size * 1.25}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>${frags}</g>`;
  });
  // Bullets from turret to targets
  const angleTo = (x, y) => Math.atan2(y - ty, x - tx);
  const bullets = targets
    .map(([x, y], i) => {
      const a = angleTo(x, y);
      const dist = Math.hypot(x - tx, y - ty);
      const pts = [];
      for (let k = 0; k < 3; k++) {
        const d = 110 + ((dist - 140) * (k + 0.4 + i * 0.05)) / 3.2;
        const bx = tx + Math.cos(a) * d;
        const by = ty + Math.sin(a) * d;
        const len = 46;
        pts.push(
          `<line x1="${(bx - Math.cos(a) * len).toFixed(1)}" y1="${(by - Math.sin(a) * len).toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="url(#ess-trail)" stroke-width="5" stroke-linecap="round" transform="rotate(0)"/><circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="5" fill="#fff4e6"/>`,
        );
      }
      return pts.join('');
    })
    .join('');
  const aim = (angleTo(targets[0][0], targets[0][1]) * 180) / Math.PI;
  const numbers = [
    [760, 170, '+1.2K'],
    [980, 420, '+860'],
    [830, 610, 'CRIT ×2'],
    [1080, 230, '+2.4K'],
  ]
    .map(
      ([x, y, t], i) =>
        `<text x="${x}" y="${y}" ${FONT} font-weight="700" font-size="${i === 2 ? 26 : 30}" fill="${i === 2 ? '#ffd166' : '#fff'}" opacity=".92" stroke="#1a0b00" stroke-width="5" paint-order="stroke">${t}</text>`,
    )
    .join('');
  const coins = Array.from({ length: 9 }, () => {
    let x = 520 + rand() * 600;
    let y = 120 + rand() * 600;
    if ([[760, 170], [980, 420], [830, 610], [1080, 230]].some(([nx, ny]) => Math.abs(x - nx - 50) < 90 && Math.abs(y - ny + 10) < 40)) y += 70;
    return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><circle r="11" fill="#ffb43a" stroke="#ffe3a3" stroke-width="2"/><circle r="5" fill="none" stroke="#a65c00" stroke-width="2"/></g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <radialGradient id="ess-bg" cx="32%" cy="62%" r="85%">
      <stop offset="0" stop-color="#2a1a3e"/><stop offset=".35" stop-color="#121a38"/><stop offset="1" stop-color="#060914"/>
    </radialGradient>
    <radialGradient id="ess-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ff8a2a" stop-opacity=".75"/><stop offset=".4" stop-color="#ff6a00" stop-opacity=".2"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ess-burst" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".25" stop-color="#ffc178" stop-opacity=".7"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ess-trail" x1="0" x2="1">
      <stop offset="0" stop-color="#ff7a1a" stop-opacity="0"/><stop offset="1" stop-color="#ffd2a1"/>
    </linearGradient>
    <linearGradient id="ess-metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b4a78"/><stop offset="1" stop-color="#151d38"/>
    </linearGradient>
    <linearGradient id="ess-barrel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffb066"/><stop offset=".5" stop-color="#ff7a1a"/><stop offset="1" stop-color="#b8430a"/>
    </linearGradient>
    <pattern id="ess-grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="#8ea5ff" stroke-opacity=".07" stroke-width="1"/>
    </pattern>
    <filter id="ess-soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="ess-blur"><feGaussianBlur stdDeviation="18"/></filter>
    <radialGradient id="ess-vig" cx="50%" cy="50%" r="75%">
      <stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".65"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#ess-bg)"/>
  <rect width="${w}" height="${h}" fill="url(#ess-grid)"/>
  ${stars(rand, w, h, 70)}
  <circle cx="${tx}" cy="${ty}" r="330" fill="url(#ess-glow)" opacity=".7"/>
  <g opacity=".5" filter="url(#ess-blur)">
    <polygon points="${poly(1150, 640, 90, 6, 0.3)}" fill="#9b7bff" opacity=".35"/>
    <polygon points="${poly(160, 140, 70, 3, 0.2)}" fill="#4fd1ff" opacity=".3"/>
  </g>
  <circle cx="${tx}" cy="${ty}" r="250" fill="none" stroke="#ff8a2a" stroke-opacity=".18" stroke-width="2" stroke-dasharray="4 12"/>
  <circle cx="${tx}" cy="${ty}" r="170" fill="none" stroke="#fff" stroke-opacity=".06" stroke-width="1"/>
  ${enemies.join('')}
  ${bullets}
  ${bursts.join('')}
  ${coins}
  <!-- Turret -->
  <g>
    <ellipse cx="${tx}" cy="${ty + 70}" rx="140" ry="34" fill="#000" opacity=".45"/>
    <polygon points="${poly(tx, ty + 18, 96, 6, Math.PI / 6)}" fill="url(#ess-metal)" stroke="#5a6ca3" stroke-width="2"/>
    <polygon points="${poly(tx, ty + 18, 72, 6, Math.PI / 6)}" fill="#0d1428" stroke="#ff7a1a" stroke-opacity=".6" stroke-width="2"/>
    <g transform="rotate(${aim.toFixed(1)} ${tx} ${ty})">
      <rect x="${tx}" y="${ty - 17}" width="150" height="34" rx="8" fill="url(#ess-barrel)"/>
      <rect x="${tx + 20}" y="${ty - 17}" width="10" height="34" fill="#1a0b00" opacity=".25"/>
      <rect x="${tx + 136}" y="${ty - 21}" width="22" height="42" rx="6" fill="#ffcf9f"/>
      <circle cx="${tx + 190}" cy="${ty}" r="34" fill="url(#ess-burst)"/>
      <polygon points="${tx + 160},${ty - 14} ${tx + 214},${ty} ${tx + 160},${ty + 14}" fill="#fff6ea" opacity=".9"/>
    </g>
    <circle cx="${tx}" cy="${ty}" r="54" fill="url(#ess-metal)" stroke="#8ea5ff" stroke-opacity=".5" stroke-width="2"/>
    <circle cx="${tx}" cy="${ty}" r="22" fill="#ff7a1a"/>
    <circle cx="${tx}" cy="${ty}" r="22" fill="none" stroke="#ffe0bf" stroke-width="3" opacity=".7"/>
    <circle cx="${tx - 8}" cy="${ty - 8}" r="6" fill="#fff" opacity=".7"/>
  </g>
  ${numbers}
  <!-- HUD -->
  <g ${FONT} font-weight="700">
    <rect x="36" y="${h - 88}" width="188" height="56" rx="16" fill="#0a0f1e" fill-opacity=".72" stroke="#fff" stroke-opacity=".12"/>
    <text x="58" y="${h - 64}" font-size="13" fill="#8b94a9" letter-spacing="3">WAVE</text>
    <text x="58" y="${h - 42}" font-size="22" fill="#fff">27</text>
    <rect x="112" y="${h - 66}" width="94" height="8" rx="4" fill="#fff" fill-opacity=".1"/>
    <rect x="112" y="${h - 66}" width="62" height="8" rx="4" fill="#ff7a1a"/>
    <rect x="${w - 236}" y="32" width="200" height="56" rx="16" fill="#0a0f1e" fill-opacity=".72" stroke="#fff" stroke-opacity=".12"/>
    <g transform="translate(${w - 206} 60)"><circle r="14" fill="#ffb43a" stroke="#ffe3a3" stroke-width="2"/><circle r="6" fill="none" stroke="#a65c00" stroke-width="2.5"/></g>
    <text x="${w - 180}" y="69" font-size="24" fill="#fff">128.4K</text>
  </g>
  <rect width="${w}" height="${h}" fill="url(#ess-vig)"/>
</svg>`;
}

/* ── Casual project teaser (tile puzzle mood) ───────────────────────────── */

export function casualProject({ w = 1280, h = 800 } = {}) {
  const rand = rng(21);
  const colors = ['#ff9a4a', '#ffd166', '#ff6f91', '#7bdff2', '#b39cff', '#6ee7b7'];
  const size = 92;
  const gap = 16;
  const cols = 7;
  const rows = 5;
  const ox = (w - (cols * size + (cols - 1) * gap)) / 2;
  const oy = (h - (rows * size + (rows - 1) * gap)) / 2 + 20;
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = colors[Math.floor(rand() * colors.length)];
      const lifted = (r === 2 && c === 3) || (r === 1 && c === 4);
      const x = ox + c * (size + gap);
      const y = oy + r * (size + gap) - (lifted ? 26 : 0);
      const shape = Math.floor(rand() * 3);
      const icon =
        shape === 0
          ? `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="18" fill="#fff" fill-opacity=".85"/>`
          : shape === 1
            ? `<polygon points="${poly(x + size / 2, y + size / 2 + 3, 22, 3)}" fill="#fff" fill-opacity=".85"/>`
            : `<rect x="${x + size / 2 - 16}" y="${y + size / 2 - 16}" width="32" height="32" rx="7" fill="#fff" fill-opacity=".85" transform="rotate(45 ${x + size / 2} ${y + size / 2})"/>`;
      tiles.push(`<g${lifted ? ' filter="url(#cp-lift)"' : ''}>
        <rect x="${x}" y="${y + 8}" width="${size}" height="${size}" rx="22" fill="#000" opacity=".35"/>
        <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="22" fill="${color}"/>
        <rect x="${x + 6}" y="${y + 6}" width="${size - 12}" height="${size / 2 - 6}" rx="16" fill="#fff" opacity=".18"/>
        ${icon}
      </g>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <radialGradient id="cp-bg" cx="50%" cy="45%" r="75%">
      <stop offset="0" stop-color="#2b2145"/><stop offset=".5" stop-color="#141a35"/><stop offset="1" stop-color="#070a16"/>
    </radialGradient>
    <radialGradient id="cp-spot" cx="50%" cy="48%" r="42%">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#05070d" stop-opacity=".55"/><stop offset="1" stop-color="#05070d" stop-opacity=".92"/>
    </radialGradient>
    <filter id="cp-lift" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#ff7a1a" flood-opacity=".45"/></filter>
    <filter id="cp-blur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#cp-bg)"/>
  ${stars(rand, w, h, 40)}
  <g filter="url(#cp-blur)" opacity=".9">${tiles.join('')}</g>
  <rect width="${w}" height="${h}" fill="url(#cp-spot)"/>
  <g transform="translate(${w / 2} ${h / 2 + 10})">
    <circle r="78" fill="#0a0f1e" fill-opacity=".8" stroke="#ff9a4a" stroke-opacity=".55" stroke-width="2"/>
    <text y="30" text-anchor="middle" ${FONT} font-size="92" font-weight="700" fill="#ffad5c">?</text>
  </g>
</svg>`;
}

/* ── Hypercasual project teaser (one-tap runner mood) ───────────────────── */

export function hypercasualProject({ w = 1280, h = 800 } = {}) {
  const rand = rng(33);
  const platforms = [];
  let x = -40;
  let y = 560;
  for (let i = 0; i < 9; i++) {
    const pw = 120 + rand() * 90;
    platforms.push(`<g><rect x="${x}" y="${y}" width="${pw}" height="22" rx="11" fill="url(#hc-plat)"/><rect x="${x}" y="${y + 22}" width="${pw}" height="160" fill="url(#hc-fall)" opacity=".5"/></g>`);
    x += pw + 40 + rand() * 50;
    y += (rand() - 0.55) * 110;
    y = Math.max(300, Math.min(620, y));
  }
  const bx = 560;
  const by = 330;
  const trail = Array.from({ length: 10 }, (_, i) => {
    const t = i / 10;
    const tx = bx - 300 + t * 300;
    const ty = by + 120 - Math.sin(t * Math.PI * 0.9 + 0.25) * 150 + 30;
    return `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(6 + t * 20).toFixed(1)}" fill="#ff8a2a" opacity="${(0.05 + t * 0.35).toFixed(2)}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="hc-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1330"/><stop offset=".6" stop-color="#1d1840"/><stop offset="1" stop-color="#2a1530"/>
    </linearGradient>
    <linearGradient id="hc-plat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9eefc"/><stop offset="1" stop-color="#8ea5ff"/>
    </linearGradient>
    <linearGradient id="hc-fall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8ea5ff" stop-opacity=".35"/><stop offset="1" stop-color="#8ea5ff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="hc-ball" cx="35%" cy="30%" r="70%">
      <stop offset="0" stop-color="#fff1e0"/><stop offset=".35" stop-color="#ffad5c"/><stop offset="1" stop-color="#d4500a"/>
    </radialGradient>
    <radialGradient id="hc-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ff8a2a" stop-opacity=".6"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hc-sun" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ff6f91" stop-opacity=".5"/><stop offset="1" stop-color="#ff6f91" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#hc-bg)"/>
  ${stars(rand, w, h, 60, h * 0.6)}
  <circle cx="980" cy="260" r="260" fill="url(#hc-sun)"/>
  <circle cx="980" cy="260" r="110" fill="#ff8aa6" opacity=".18"/>
  <path d="M0 640 L180 560 L320 610 L520 520 L700 600 L900 540 L1100 600 L1280 540 L1280 800 L0 800Z" fill="#120f2a" opacity=".9"/>
  ${platforms.join('')}
  ${trail}
  <circle cx="${bx}" cy="${by}" r="110" fill="url(#hc-glow)"/>
  <circle cx="${bx}" cy="${by}" r="34" fill="url(#hc-ball)"/>
  <ellipse cx="${bx - 10}" cy="${by - 12}" rx="10" ry="6" fill="#fff" opacity=".7"/>
  <g transform="translate(${w - 180} ${h - 150})" opacity=".9">
    <circle r="46" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
    <circle r="66" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
    <circle r="14" fill="#fff" opacity=".85"/>
    <text y="104" text-anchor="middle" ${FONT} font-size="18" font-weight="700" letter-spacing="5" fill="#fff" opacity=".75">TAP</text>
  </g>
</svg>`;
}

/* ── Developer at desk (About) — portrait 4:5 ───────────────────────────── */

export function developerDesk({ w = 1024, h = 1280 } = {}) {
  const rand = rng(99);
  // Night skyline in the window
  const buildings = [];
  let bx = 70;
  while (bx < 520) {
    const bw = 30 + rand() * 50;
    const bh = 80 + rand() * 220;
    const top = 470 - bh;
    let lights = '';
    for (let yy = top + 12; yy < 460; yy += 16) {
      for (let xx = bx + 6; xx < bx + bw - 6; xx += 12) {
        if (rand() < 0.28) lights += `<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="5" height="7" fill="${rand() < 0.7 ? '#ffc27a' : '#9fc3ff'}" opacity="${(0.4 + rand() * 0.6).toFixed(2)}"/>`;
      }
    }
    buildings.push(`<rect x="${bx.toFixed(0)}" y="${top.toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="#0d1631"/>${lights}`);
    bx += bw + 4;
  }
  // Code lines on the second monitor
  const codeColors = ['#ff9a4a', '#8ea5ff', '#6ee7b7', '#c4cada', '#ffd166'];
  let code = '';
  for (let i = 0; i < 17; i++) {
    const indent = [0, 14, 28, 14][i % 4];
    const segs = 1 + Math.floor(rand() * 3);
    let cx = 742 + indent;
    for (let s = 0; s < segs; s++) {
      const sw = 14 + rand() * 46;
      code += `<rect x="${cx.toFixed(0)}" y="${470 + i * 13}" width="${sw.toFixed(0)}" height="5" rx="2.5" fill="${codeColors[Math.floor(rand() * codeColors.length)]}" opacity=".85"/>`;
      cx += sw + 6;
    }
  }
  // Mini game view on the main monitor
  const shapes = Array.from({ length: 12 }, () => {
    const x = 470 + rand() * 170;
    const y = 470 + rand() * 120;
    const c = ['#4fd1ff', '#9b7bff', '#ff5c8a', '#ffd166'][Math.floor(rand() * 4)];
    return `<polygon points="${poly(x, y, 5 + rand() * 7, 3 + Math.floor(rand() * 4), rand() * 3)}" fill="none" stroke="${c}" stroke-width="1.8"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="dd-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0a0f22"/><stop offset=".6" stop-color="#0e1530"/><stop offset="1" stop-color="#070a16"/>
    </linearGradient>
    <linearGradient id="dd-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1838"/><stop offset=".7" stop-color="#26325e"/><stop offset="1" stop-color="#5a3a50"/>
    </linearGradient>
    <radialGradient id="dd-screenglow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#7fa2ff" stop-opacity=".45"/><stop offset=".5" stop-color="#4c6bd6" stop-opacity=".15"/><stop offset="1" stop-color="#4c6bd6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="dd-warm" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ff8a2a" stop-opacity=".55"/><stop offset=".5" stop-color="#ff6a00" stop-opacity=".15"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="dd-desk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c2442"/><stop offset=".06" stop-color="#121931"/><stop offset="1" stop-color="#05070d"/>
    </linearGradient>
    <linearGradient id="dd-screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111a33"/><stop offset="1" stop-color="#0a1022"/>
    </linearGradient>
    <linearGradient id="dd-game" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1d1840"/><stop offset="1" stop-color="#0d1530"/>
    </linearGradient>
    <linearGradient id="dd-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d1226"/><stop offset="1" stop-color="#03050b"/>
    </linearGradient>
    <linearGradient id="dd-rim" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#ff9a4a"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="dd-tower" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0c1124"/><stop offset="1" stop-color="#151d38"/>
    </linearGradient>
    <radialGradient id="dd-fan" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffb066" stop-opacity=".9"/><stop offset=".55" stop-color="#ff7a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/>
    </radialGradient>
    <filter id="dd-blur"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="dd-soft"><feGaussianBlur stdDeviation="1.2"/></filter>
    <radialGradient id="dd-vig" cx="55%" cy="45%" r="75%">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/>
    </radialGradient>
    <linearGradient id="dd-haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8a2a" stop-opacity="0"/><stop offset="1" stop-color="#ff8a2a" stop-opacity=".08"/>
    </linearGradient>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#dd-wall)"/>

  <!-- Window -->
  <g>
    <rect x="60" y="120" width="470" height="360" rx="6" fill="url(#dd-sky)"/>
    ${stars(rand, 470, 200, 30).replace(/cx="([\d.]+)" cy="([\d.]+)"/g, (_, a, b) => `cx="${(60 + Number(a)).toFixed(1)}" cy="${(120 + Number(b)).toFixed(1)}"`)}
    <circle cx="430" cy="190" r="26" fill="#ffe7c7" opacity=".85"/>
    <circle cx="430" cy="190" r="70" fill="#ffe7c7" opacity=".08"/>
    <g>${buildings.join('')}</g>
    <rect x="60" y="120" width="470" height="360" rx="6" fill="none" stroke="#1b2443" stroke-width="14"/>
    <path d="M295 120V480M60 300H530" stroke="#1b2443" stroke-width="8"/>
    <rect x="44" y="478" width="502" height="16" rx="4" fill="#141c38"/>
  </g>

  <!-- Shelf -->
  <g>
    <rect x="640" y="250" width="320" height="10" rx="3" fill="#18203c"/>
    <rect x="660" y="196" width="22" height="54" rx="3" fill="#2a3560"/>
    <rect x="686" y="206" width="18" height="44" rx="3" fill="#ff7a1a" opacity=".75"/>
    <rect x="708" y="190" width="24" height="60" rx="3" fill="#202a4e"/>
    <polygon points="${poly(800, 222, 26, 6, 0.3)}" fill="#0f1630" stroke="#ff9a4a" stroke-opacity=".6" stroke-width="2"/>
    <path d="M900 250c-6-30 10-52 22-58M905 250c4-24 22-38 40-36M902 250c-14-18-30-22-44-18" stroke="#3ddc97" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="886" y="226" width="34" height="24" rx="4" fill="#1b2443"/>
  </g>

  <!-- Monitor glow on wall -->
  <ellipse cx="610" cy="560" rx="420" ry="260" fill="url(#dd-screenglow)" filter="url(#dd-blur)"/>
  <ellipse cx="920" cy="760" rx="220" ry="260" fill="url(#dd-warm)" filter="url(#dd-blur)"/>

  <!-- Main monitor -->
  <g>
    <rect x="300" y="400" width="420" height="250" rx="12" fill="#05070d" stroke="#2a3560" stroke-width="3"/>
    <rect x="312" y="412" width="396" height="226" rx="4" fill="url(#dd-screen)"/>
    <!-- editor chrome -->
    <rect x="312" y="412" width="396" height="16" fill="#1b2443"/>
    <circle cx="324" cy="420" r="3" fill="#ff7a1a"/><circle cx="334" cy="420" r="3" fill="#ffd166"/><circle cx="344" cy="420" r="3" fill="#6ee7b7"/>
    <rect x="316" y="434" width="132" height="200" rx="3" fill="#0d1428"/>
    ${Array.from({ length: 11 }, (_, i) => `<rect x="${324 + (i % 3) * 8}" y="${444 + i * 16}" width="${50 + ((i * 37) % 60)}" height="5" rx="2.5" fill="#8b94a9" opacity=".55"/>`).join('')}
    <rect x="${324}" y="${444 + 3 * 16 - 4}" width="118" height="13" rx="3" fill="#ff7a1a" opacity=".22"/>
    <rect x="456" y="434" width="246" height="200" rx="3" fill="url(#dd-game)"/>
    ${shapes}
    <g transform="translate(560 560)"><circle r="14" fill="#ff7a1a"/><rect x="0" y="-5" width="30" height="10" rx="3" fill="#ffad5c" transform="rotate(-35)"/></g>
    <rect x="456" y="434" width="246" height="200" rx="3" fill="none" stroke="#ff9a4a" stroke-opacity=".5"/>
    <rect x="490" y="650" width="40" height="70" fill="#141c38"/>
    <rect x="440" y="716" width="140" height="10" rx="5" fill="#1b2443"/>
  </g>

  <!-- Second monitor (angled, code) -->
  <g>
    <polygon points="728,430 900,410 900,640 728,622" fill="#05070d" stroke="#2a3560" stroke-width="3"/>
    <polygon points="736,440 892,422 892,630 736,614" fill="#0b1124"/>
    <g transform="skewY(-6) translate(0 76)">${code}</g>
    <rect x="800" y="636" width="28" height="84" fill="#141c38"/>
    <rect x="770" y="716" width="90" height="10" rx="5" fill="#1b2443"/>
  </g>

  <!-- PC tower with orange glass -->
  <g>
    <rect x="900" y="560" width="124" height="230" rx="8" fill="url(#dd-tower)" stroke="#2a3560" stroke-width="2"/>
    <rect x="912" y="574" width="96" height="200" rx="5" fill="#070a16" stroke="#ff8a2a" stroke-opacity=".5"/>
    <circle cx="960" cy="625" r="34" fill="url(#dd-fan)"/>
    <circle cx="960" cy="625" r="28" fill="none" stroke="#ffb066" stroke-width="2.5" opacity=".9"/>
    <circle cx="960" cy="715" r="34" fill="url(#dd-fan)"/>
    <circle cx="960" cy="715" r="28" fill="none" stroke="#ffb066" stroke-width="2.5" opacity=".9"/>
    <path d="M960 597v56M932 625h56M960 687v56M932 715h56" stroke="#ffcf9f" stroke-opacity=".45" stroke-width="2"/>
  </g>

  <!-- Desk -->
  <rect x="0" y="788" width="${w}" height="${h - 788}" fill="url(#dd-desk)"/>
  <rect x="0" y="786" width="${w}" height="3" fill="#ff9a4a" opacity=".35"/>
  <ellipse cx="560" cy="800" rx="380" ry="40" fill="#7fa2ff" opacity=".12" filter="url(#dd-blur)"/>
  <ellipse cx="930" cy="800" rx="150" ry="30" fill="#ff8a2a" opacity=".22" filter="url(#dd-blur)"/>
  <!-- Keyboard & mouse -->
  <rect x="440" y="812" width="270" height="34" rx="7" fill="#0c1124" stroke="#ff9a4a" stroke-opacity=".45" stroke-width="2"/>
  ${Array.from({ length: 3 }, (_, r) => Array.from({ length: 16 }, (_, c) => `<rect x="${450 + c * 16}" y="${818 + r * 9}" width="12" height="6" rx="1.5" fill="#ffad5c" opacity="${(0.12 + ((c + r) % 4) * 0.06).toFixed(2)}"/>`).join('')).join('')}
  <rect x="740" y="816" width="26" height="40" rx="13" fill="#0c1124" stroke="#ff9a4a" stroke-opacity=".5" stroke-width="2"/>
  <!-- Mug with steam -->
  <g>
    <rect x="236" y="756" width="46" height="54" rx="8" fill="#1b2443"/>
    <path d="M282 770c18 0 18 26 0 26" stroke="#1b2443" stroke-width="7" fill="none"/>
    <path d="M250 742c-8-14 8-22 0-36M266 744c-8-14 8-22 0-36" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none" stroke-linecap="round" filter="url(#dd-soft)"/>
  </g>

  <!-- Chair back + developer silhouette (from behind) -->
  <g>
    <path d="M150 1280 C150 1080 190 960 330 930 C 400 915 460 915 520 930 C 640 960 690 1080 690 1280Z" fill="#0a0e1d"/>
    <path d="M200 1280 C205 1110 240 1010 340 990 L 500 990 C 610 1010 640 1110 640 1280Z" fill="#111733" opacity=".8"/>
    <!-- shoulders/torso -->
    <path d="M190 1280 C 190 1070 235 965 330 936 Q 420 912 510 936 C 605 965 650 1070 650 1280Z" fill="url(#dd-body)"/>
    <!-- neck & head -->
    <rect x="390" y="790" width="60" height="140" rx="24" fill="#0b1022"/>
    <ellipse cx="420" cy="738" rx="78" ry="90" fill="#0a0e1d"/>
    <!-- hair hint -->
    <path d="M346 716 C 350 660 400 640 438 646 C 482 652 500 690 498 726 C 470 700 420 694 346 716Z" fill="#070a14"/>
    <!-- headphones -->
    <path d="M336 740 C 330 640 510 640 504 740" stroke="#1b2443" stroke-width="16" fill="none" stroke-linecap="round"/>
    <rect x="318" y="716" width="34" height="64" rx="14" fill="#141c38" stroke="#ff9a4a" stroke-opacity=".5" stroke-width="2"/>
    <rect x="488" y="716" width="34" height="64" rx="14" fill="#141c38" stroke="#ff9a4a" stroke-opacity=".7" stroke-width="2"/>
    <!-- rim lights -->
    <path d="M496 690 C 506 720 504 770 486 810" stroke="url(#dd-rim)" stroke-width="4" fill="none" opacity=".75" stroke-linecap="round"/>
    <path d="M470 922 C 580 945 630 1030 640 1160" stroke="#ff9a4a" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M370 922 C 270 945 215 1020 202 1130" stroke="#7fa2ff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M344 700 C 336 730 340 770 356 810" stroke="#7fa2ff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>

  <rect width="${w}" height="${h}" fill="url(#dd-haze)"/>
  <rect width="${w}" height="${h}" fill="url(#dd-vig)"/>
</svg>`;
}

/* ── Devlog thumbnails ──────────────────────────────────────────────────── */

const thumbFrame = (id, inner, accent = '#ff7a1a') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  <defs>
    <radialGradient id="${id}-bg" cx="50%" cy="40%" r="80%">
      <stop offset="0" stop-color="#18223f"/><stop offset=".55" stop-color="#0c1326"/><stop offset="1" stop-color="#05070d"/>
    </radialGradient>
    <radialGradient id="${id}-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#8ea5ff" stroke-opacity=".07"/>
    </pattern>
    <filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1280" height="800" fill="url(#${id}-bg)"/>
  <rect width="1280" height="800" fill="url(#${id}-grid)"/>
  ${inner}
</svg>`;

export function devlogNewIdea() {
  const rand = rng(5);
  const sketches = Array.from({ length: 9 }, () => {
    const x = 760 + rand() * 420;
    const y = 160 + rand() * 480;
    return `<polygon points="${poly(x, y, 16 + rand() * 26, 3 + Math.floor(rand() * 4), rand() * 3)}" fill="none" stroke="#c4cada" stroke-opacity=".55" stroke-width="3" stroke-dasharray="7 6" stroke-linejoin="round"/>`;
  }).join('');
  return thumbFrame(
    'ni',
    `<circle cx="470" cy="360" r="300" fill="url(#ni-glow)"/>
    <g filter="url(#ni-soft)">
      <path d="M470 170c-92 0-160 70-160 156 0 58 30 98 62 128 22 21 34 44 34 70v22h128v-22c0-26 12-49 34-70 32-30 62-70 62-128 0-86-68-156-160-156z" fill="#0a0f1e" stroke="#ffad5c" stroke-width="6"/>
      <polygon points="${poly(470, 330, 62, 6, 0)}" fill="none" stroke="#ff7a1a" stroke-width="5"/>
      <polygon points="${poly(470, 330, 30, 3, 0)}" fill="#ff7a1a"/>
    </g>
    <rect x="410" y="566" width="120" height="16" rx="8" fill="#2a3560"/>
    <rect x="420" y="592" width="100" height="16" rx="8" fill="#2a3560"/>
    <path d="M470 120v-40M330 170l-28-28M610 170l28-28M260 320h-40M680 320h40" stroke="#ffad5c" stroke-width="6" stroke-linecap="round" opacity=".8"/>
    ${sketches}
    <path d="M700 380 C 760 300 800 300 860 300" stroke="#ffad5c" stroke-opacity=".6" stroke-width="3" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>`,
  );
}

export function devlogPerformance() {
  const rand = rng(11);
  let spiky = 'M120 540';
  let smooth = 'M120 470';
  for (let i = 1; i <= 52; i++) {
    const x = 120 + i * 20;
    const spike = i < 26 ? (rand() < 0.25 ? 220 : 40 + rand() * 60) : 0;
    spiky += ` L${x} ${(540 - (i < 26 ? spike : 0)).toFixed(0)}`;
    smooth += ` L${x} ${(470 - rand() * 14).toFixed(0)}`;
  }
  const bars = Array.from({ length: 26 }, (_, i) => {
    const bh = i < 13 ? 40 + rand() * 120 : 30 + rand() * 30;
    return `<rect x="${120 + i * 40}" y="${700 - bh}" width="26" height="${bh.toFixed(0)}" rx="4" fill="${i < 13 ? '#5a6ca3' : '#ff7a1a'}" opacity="${i < 13 ? 0.6 : 0.85}"/>`;
  }).join('');
  return thumbFrame(
    'pf',
    `<circle cx="900" cy="440" r="320" fill="url(#pf-glow)" opacity=".7"/>
    <rect x="80" y="110" width="1120" height="620" rx="26" fill="#0a0f1e" fill-opacity=".75" stroke="#fff" stroke-opacity=".08"/>
    <g ${FONT} font-weight="700">
      <text x="120" y="176" font-size="24" letter-spacing="5" fill="#8b94a9">FRAME TIME</text>
      <rect x="980" y="146" width="180" height="44" rx="22" fill="#3ddc97" fill-opacity=".14" stroke="#3ddc97" stroke-opacity=".6"/>
      <circle cx="1006" cy="168" r="6" fill="#3ddc97"/>
      <text x="1022" y="176" font-size="20" fill="#3ddc97" letter-spacing="2">STABLE</text>
    </g>
    <path d="M120 470H1160" stroke="#fff" stroke-opacity=".12" stroke-dasharray="6 8"/>
    <path d="${spiky}" fill="none" stroke="#ff5c8a" stroke-opacity=".55" stroke-width="3" stroke-linejoin="round"/>
    <path d="${smooth}" fill="none" stroke="#ffad5c" stroke-width="5" stroke-linejoin="round" filter="url(#pf-soft)"/>
    <path d="M640 230V700" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
    ${bars}`,
  );
}

export function devlogUiPolish() {
  return thumbFrame(
    'ui',
    `<circle cx="640" cy="420" r="340" fill="url(#ui-glow)" opacity=".7"/>
    <g transform="rotate(-6 640 400)">
      <rect x="250" y="170" width="560" height="460" rx="30" fill="#0e1530" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
      <rect x="250" y="170" width="560" height="74" rx="30" fill="#141d3d"/>
      <rect x="290" y="198" width="160" height="18" rx="9" fill="#c4cada" opacity=".8"/>
      <circle cx="760" cy="207" r="16" fill="#2a3560"/>
      ${[0, 1, 2]
        .map(
          (i) => `<g transform="translate(290 ${276 + i * 104})">
        <rect width="480" height="84" rx="18" fill="#141d3d" stroke="${i === 0 ? '#ff9a4a' : '#fff'}" stroke-opacity="${i === 0 ? 0.7 : 0.08}" stroke-width="2"/>
        <polygon points="${poly(46, 42, 22, [6, 4, 3][i], 0.3)}" fill="none" stroke="${['#ff9a4a', '#8ea5ff', '#6ee7b7'][i]}" stroke-width="4"/>
        <rect x="88" y="24" width="${[150, 120, 170][i]}" height="14" rx="7" fill="#c4cada" opacity=".8"/>
        <rect x="88" y="48" width="200" height="8" rx="4" fill="#fff" opacity=".1"/>
        <rect x="88" y="48" width="${[140, 90, 60][i]}" height="8" rx="4" fill="${['#ff9a4a', '#8ea5ff', '#6ee7b7'][i]}"/>
        <rect x="340" y="18" width="122" height="48" rx="24" fill="${i === 0 ? '#ff7a1a' : '#2a3560'}"/>
        <circle cx="368" cy="42" r="10" fill="#ffd166" stroke="#ffe3a3" stroke-width="2"/>
        <rect x="386" y="36" width="56" height="12" rx="6" fill="${i === 0 ? '#1a0b00' : '#8b94a9'}" opacity=".85"/>
      </g>`,
        )
        .join('')}
    </g>
    <g transform="translate(860 300)">
      <rect width="230" height="150" rx="24" fill="#141d3d" fill-opacity=".9" stroke="#fff" stroke-opacity=".1" stroke-width="2"/>
      <rect x="28" y="36" width="90" height="12" rx="6" fill="#c4cada" opacity=".7"/>
      <rect x="146" y="28" width="58" height="30" rx="15" fill="#ff7a1a"/><circle cx="189" cy="43" r="11" fill="#fff"/>
      <rect x="28" y="96" width="174" height="8" rx="4" fill="#fff" opacity=".12"/>
      <rect x="28" y="96" width="110" height="8" rx="4" fill="#ffad5c"/><circle cx="138" cy="100" r="13" fill="#fff"/>
    </g>
    <path d="M690 560 l0 70 18-16 14 30 14-7-14-29 24-2z" fill="#fff" stroke="#05070d" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="690" cy="560" r="36" fill="none" stroke="#ffad5c" stroke-opacity=".6" stroke-width="3"/>`,
  );
}

/* ── Favicon (geometric cube mark) ──────────────────────────────────────── */

export function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="fv-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffad5c"/><stop offset="1" stop-color="#ff6a00"/></linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#fv-bg)"/>
  <path d="M32 12 50 22.5 32 33 14 22.5Z" fill="#1a0b00" opacity=".55"/>
  <path d="M14 22.5 32 33v21L14 43.5Z" fill="#1a0b00" opacity=".9"/>
  <path d="M50 22.5 32 33v21l18-10.5Z" fill="#1a0b00" opacity=".72"/>
</svg>`;
}
