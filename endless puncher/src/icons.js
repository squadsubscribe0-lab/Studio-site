// Inline SVG icon set, drawn for this game.
const svg = (body, vb = '0 0 24 24') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const ICONS = {
  coin: svg('<circle cx="12" cy="12" r="10" fill="#ffc531" stroke="#a86b00" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#fff3b0" stroke-width="2"/>'),
  gem: svg('<path d="M12 2 21 9 12 22 3 9Z" fill="#c45cff" stroke="#5e1d99" stroke-width="1.6"/><path d="M3 9h18M12 2 8 9l4 13 4-13Z" fill="none" stroke="#f0d0ff" stroke-width="1"/>'),
  shard: svg('<path d="M12 2 20 8 17 21H7L4 8Z" fill="#3dff7a" stroke="#0f7a33" stroke-width="1.6"/><path d="M12 2 12 21M4 8l8 3 8-3" fill="none" stroke="#c7ffd9" stroke-width="1"/>'),
  star: svg('<path d="m12 2 3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8Z" fill="#ffd23f" stroke="#a86b00" stroke-width="1.5"/>'),
  heart: svg('<path d="M12 21S3 14.5 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 14.5 12 21 12 21Z" fill="#ff4d6a" stroke="#8a1025" stroke-width="1.6"/>'),
  fist: svg('<rect x="4" y="6" width="14" height="12" rx="5" fill="#ff4d4d" stroke="#8a1010" stroke-width="1.6"/><rect x="16" y="9" width="5" height="6" rx="1.5" fill="#fff" stroke="#8a1010" stroke-width="1.4"/><path d="M8 6v5M12 6v5" stroke="#8a1010" stroke-width="1.4"/>'),
  sword: svg('<path d="M4 20 16 8l2-4 2 2-4 2L4 20Z" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5"/><path d="M3 15l6 6M6 18l-2 2" stroke="#8a5a00" stroke-width="2"/><path d="M20 20 8 8 6 4 4 6l4 2 12 12Z" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5"/>'),
  shield: svg('<path d="M12 2 20 5v7c0 5-4 8.5-8 10-4-1.5-8-5-8-10V5Z" fill="#4fa3ff" stroke="#123f7a" stroke-width="1.6"/>'),
  bolt: svg('<path d="M13 2 4 14h7l-1 8 9-12h-7Z" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5"/>'),
  fire: svg('<path d="M12 22c-4 0-7-3-7-7 0-4 4-6 4-11 3 2 5 5 5 8 1-1 2-2 2-4 2 2 3 4 3 7 0 4-3 7-7 7Z" fill="#ff8a2a" stroke="#8a3000" stroke-width="1.5"/><path d="M12 22c-2 0-3-1.5-3-3.5S12 15 12 13c1.5 1.5 3 3 3 5.5S14 22 12 22Z" fill="#ffe066"/>'),
  range: svg('<circle cx="12" cy="12" r="9" fill="none" stroke="#4fd1ff" stroke-width="2" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="3" fill="#4fd1ff"/><path d="M12 12h9" stroke="#fff" stroke-width="2"/>'),
  arm: svg('<path d="M3 17c4-1 6-5 9-8" stroke="#2fb4ff" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="16" cy="7" r="5" fill="#ff4d4d" stroke="#8a1010" stroke-width="1.5"/><path d="M19 17h3M20.5 15.5v3" stroke="#fff" stroke-width="2"/>'),
  slam: svg('<ellipse cx="12" cy="18" rx="10" ry="3" fill="none" stroke="#f0a060" stroke-width="2"/><ellipse cx="12" cy="18" rx="5" ry="1.5" fill="none" stroke="#f0a060" stroke-width="2"/><path d="M12 2v10M8 8l4 4 4-4" stroke="#fff" stroke-width="2" fill="none"/>'),
  drop: svg('<path d="M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13Z" fill="#e0354b" stroke="#6b0f1c" stroke-width="1.5"/>'),
  magnet: svg('<path d="M5 3v9a7 7 0 0 0 14 0V3h-4v9a3 3 0 0 1-6 0V3Z" fill="#ff4d4d" stroke="#6b0f1c" stroke-width="1.4"/><path d="M5 3h4v3H5zM15 3h4v3h-4z" fill="#ddd"/>'),
  burst: svg('<path d="m12 1 2.5 6 6-2.5-2.5 6 6 2.5-6 2.5 2.5 6-6-2.5L12 25l-2.5-6-6 2.5 2.5-6-6-2.5 6-2.5L3.5 4.5l6 2.5Z" transform="scale(.92) translate(1 0)" fill="#ffae4f" stroke="#8a4a00" stroke-width="1.3"/>'),
  settings: svg('<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 5.5v-3l-2.4-.6a7 7 0 0 0-.8-1.9l1.3-2.1-2.1-2.1-2.1 1.3a7 7 0 0 0-1.9-.8L12.5 2h-3l-.6 2.4a7 7 0 0 0-1.9.8L4.9 3.9 2.8 6l1.3 2.1a7 7 0 0 0-.8 1.9L1 10.5v3l2.4.6c.2.7.4 1.3.8 1.9l-1.3 2.1L5 20.2l2.1-1.3c.6.4 1.2.6 1.9.8l.6 2.3h3l.6-2.4a7 7 0 0 0 1.9-.8l2.1 1.3 2.1-2.1-1.3-2.1c.4-.6.6-1.2.8-1.9Z" fill="#dfe6f5"/>'),
  skull: svg('<path d="M12 2C7 2 4 5.5 4 10c0 3 1.5 5 3 6v3h10v-3c1.5-1 3-3 3-6 0-4.5-3-8-8-8Z" fill="#ff3b4f" stroke="#6b0f1c" stroke-width="1.5"/><circle cx="9" cy="11" r="2" fill="#2a0a10"/><circle cx="15" cy="11" r="2" fill="#2a0a10"/><path d="M10 19v-2M14 19v-2M12 19v-2" stroke="#6b0f1c" stroke-width="1.3"/>'),
  lock: svg('<rect x="5" y="10" width="14" height="11" rx="2" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#c9d1e0" stroke-width="2.5"/>'),
  paw: svg('<ellipse cx="12" cy="16" rx="5" ry="4.5" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.5"/><circle cx="6" cy="10" r="2.3" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.3"/><circle cx="10" cy="6.5" r="2.3" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.3"/><circle cx="14" cy="6.5" r="2.3" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.3"/><circle cx="18" cy="10" r="2.3" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.3"/>'),
  tree: svg('<path d="M12 21V11M12 11 6 6M12 11l6-5M6 6V3M18 6V3" stroke="#ffe066" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="12" cy="11" r="3" fill="#b25cff" stroke="#fff" stroke-width="1.3"/><circle cx="6" cy="4" r="2.2" fill="#ff8a2a"/><circle cx="18" cy="4" r="2.2" fill="#ff8a2a"/>'),
  battle: svg('<path d="M3 3 14 14M3 3h4M3 3v4" stroke="#dfe6f5" stroke-width="2.5" stroke-linecap="round"/><path d="M21 3 10 14M21 3h-4M21 3v4" stroke="#dfe6f5" stroke-width="2.5" stroke-linecap="round"/><path d="M6 16l2 2-3 3-2-2ZM18 16l-2 2 3 3 2-2Z" fill="#ffd23f"/>'),
  chest: svg('<rect x="3" y="9" width="18" height="12" rx="2" fill="#b0672f" stroke="#4a2408" stroke-width="1.5"/><path d="M3 12c0-6 18-6 18 0" fill="#d08a45" stroke="#4a2408" stroke-width="1.5"/><rect x="10" y="11" width="4" height="5" rx="1" fill="#ffd23f" stroke="#4a2408"/>'),
  ring: svg('<path d="M3 15 12 20l9-5-9-5Z" fill="#6b8cff" stroke="#1a2a6b" stroke-width="1.4"/><path d="M4 9v6M20 9v6M12 4v6M12 14v6" stroke="#ffd23f" stroke-width="2"/><path d="M4 11 12 6l8 5" stroke="#b25cff" stroke-width="1.5" fill="none"/>'),
  play: svg('<path d="M7 4v16l13-8Z" fill="#fff"/>'),
  ad: svg('<rect x="2" y="5" width="20" height="14" rx="3" fill="#fff"/><path d="M10 9v6l5-3Z" fill="#2a8a3a"/>'),
  car: svg('<path d="M3 15v-3l3-4h9l4 4h2v3Z" fill="#e8343f" stroke="#6b0f1c" stroke-width="1.4"/><circle cx="7" cy="16" r="2.3" fill="#222"/><circle cx="17" cy="16" r="2.3" fill="#222"/><path d="M7 11l2-2.5h5l2 2.5Z" fill="#9fd3ff"/>'),
  speed: svg('<path d="M4 5v14l8-7ZM12 5v14l8-7Z" fill="#fff"/>'),
  sound: svg('<path d="M3 9h4l5-4v14l-5-4H3Z" fill="#fff"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13" stroke="#fff" stroke-width="2" fill="none"/>'),
  mute: svg('<path d="M3 9h4l5-4v14l-5-4H3Z" fill="#fff"/><path d="m16 9 6 6M22 9l-6 6" stroke="#ff5a5a" stroke-width="2.4"/>'),
  close: svg('<path d="M5 5l14 14M19 5 5 19" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>'),
  up: svg('<path d="M12 3 21 13h-5v8H8v-8H3Z" fill="#3dff7a" stroke="#0f6b2a" stroke-width="1.4"/>'),
  info: svg('<circle cx="12" cy="12" r="10" fill="#fff"/><path d="M12 10v7M12 6.5v.5" stroke="#28314a" stroke-width="2.6" stroke-linecap="round"/>'),
  // gear slots
  gloves: svg('<rect x="4" y="5" width="13" height="12" rx="5" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><rect x="6" y="16" width="9" height="5" rx="1.5" fill="#f4f4f4" stroke="#1a1a2a" stroke-width="1.3"/><rect x="15" y="8" width="5" height="5" rx="2" fill="currentColor" stroke="#1a1a2a" stroke-width="1.3"/>'),
  helmet: svg('<path d="M3 15a9 9 0 0 1 18 0v3H3Z" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><path d="M7 13h10v5H7Z" fill="#1d2230"/><path d="M12 6v5" stroke="#fff" stroke-width="1.5" opacity=".6"/>'),
  armor: svg('<path d="M7 3 4 6v7l3 1v7h10v-7l3-1V6l-3-3-2 2c-1 1-5 1-6 0Z" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><path d="M9 11h6M9 15h6" stroke="#fff" stroke-width="1.5" opacity=".6"/>'),
  belt: svg('<rect x="2" y="9" width="20" height="6" rx="2" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><rect x="9" y="7.5" width="6" height="9" rx="1.5" fill="#ffd23f" stroke="#1a1a2a" stroke-width="1.4"/>'),
  pants: svg('<path d="M5 3h14l1 18h-6l-2-11-2 11H4Z" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><path d="M5 6h14" stroke="#fff" stroke-width="1.4" opacity=".6"/>'),
  shoes: svg('<path d="M3 17V9h6l2 3c3 0 7 1 9 3v3H3Z" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><path d="M3 18h18" stroke="#f4f4f4" stroke-width="2.4"/><path d="M9 12l2 2M11 11l2 2" stroke="#fff" stroke-width="1.2"/>'),
};

// Painted sprites sliced from assets/UI by tools/slice_ui.py. They take priority over the SVGs.
const SPRITE_FILES = import.meta.glob('./assets/ui/*.webp', { eager: true, query: '?url', import: 'default' });
export const SPRITES = {};
for (const [path, url] of Object.entries(SPRITE_FILES)) SPRITES[path.split('/').pop().replace('.webp', '')] = url;

// Old SVG names that map onto a differently named sprite.
const ALIAS = { sword: 'power', play: 'ad', bolt: 'skill_rate', fire: 'skill_burn', arm: 'skill_arm', slam: 'skill_slam', drop: 'skill_leech', magnet: 'skill_magnet', burst: 'skill_splash' };

export function spriteUrl(name) {
  return SPRITES[name] || SPRITES[ALIAS[name]] || null;
}

export function art(name) {
  const url = spriteUrl(name);
  return url ? `<img src="${url}" alt="" draggable="false">` : (ICONS[name] || '');
}

export function icon(name, cls = 'ic') {
  return `<span class="${cls}">${art(name)}</span>`;
}
