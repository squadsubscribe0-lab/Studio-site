// Asset loading.
//
// Characters and balls are described by JSON manifests inside assets/. Every
// sprite is optional: if the PNG is missing the renderer falls back to drawing
// the character/ball procedurally from the palette in the manifest. That means
// you can drop your art in one file at a time and see it appear immediately.

import { OVERRIDES } from '../config.js';

const cache = new Map();

export function loadImage(src) {
  if (cache.has(src)) return cache.get(src);
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);   // missing art is not an error
    img.src = src;
  });
  cache.set(src, p);
  return p;
}

async function loadJSON(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.warn('[assets] could not read', url, '- using built-in defaults');
    return fallback;
  }
}

const DEFAULT_CHARACTERS = {
  characters: [
    { id: 'kai',   price: 0,    name: 'Kai',   palette: { skin: '#e8b184', hair: '#2b1a10', top: '#2f6fe0', bottom: '#14306b', shoe: '#ffffff', accent: '#ffd34d' } },
    { id: 'luna',  price: 0,    name: 'Luna',  palette: { skin: '#f4d0ae', hair: '#f0a91b', top: '#e0392f', bottom: '#7a1a14', shoe: '#111827', accent: '#ffe27a' } },
    { id: 'rico',  price: 400,  name: 'Rico',  palette: { skin: '#8d5a3b', hair: '#161616', top: '#37c24a', bottom: '#155e2b', shoe: '#ffffff', accent: '#c6ff8f' } },
    { id: 'mei',   price: 600,  name: 'Mei',   palette: { skin: '#f2c6a0', hair: '#5b21b6', top: '#a855f7', bottom: '#4c1d95', shoe: '#fde68a', accent: '#f5d0fe' } }
  ]
};

const DEFAULT_BALLS = {
  balls: [
    { id: 'beach',  price: 0,   name: 'Beach',      style: 'beach',  colors: ['#ffffff', '#ff5252', '#ffd34d', '#4aa3ff'] },
    { id: 'classic',price: 0,   name: 'Classic',    style: 'volley', colors: ['#ffffff', '#1e40af', '#facc15'] },
    { id: 'coconut',price: 650, name: 'Coconut',    style: 'plain',  colors: ['#8b5a2b', '#5b3a1a'] },
    { id: 'melon',  price: 400, name: 'Watermelon', style: 'melon',  colors: ['#e8453c', '#2e8b3a', '#f4f4f4'] }
  ]
};

// No art in the checkout means no icons; the manifest that ships alongside the
// PNGs is what turns them on.
const DEFAULT_POWERS = { icons: {} };

/**
 * Re-cuts a square badge into a disc.
 *
 * The icons are authored as UI tiles: opaque right into the corners, on the
 * same dark navy the HUD panels use. That is invisible on a panel and plain
 * wrong on an orb floating against a bright sky, where it reads as a sticker
 * rather than something in the world.
 *
 * The rim is feathered instead of hard-clipped because the artwork's glow runs
 * all the way to the tile edge - cutting straight through it leaves a bright
 * seam around the circle.
 */
function roundIcon(img) {
  const w = img.width, h = img.height;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const r = Math.min(w, h) / 2;
  const fade = ctx.createRadialGradient(w / 2, h / 2, r * 0.8, w / 2, h / 2, r);
  fade.addColorStop(0, 'rgba(0,0,0,0)');     // keep
  fade.addColorStop(1, 'rgba(0,0,0,1)');     // erase
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, w, h);
  return c;                                   // a canvas draws like an image
}

async function hydrateSprites(entry, folder) {
  const parts = entry.sprites || {};
  const out = {};
  await Promise.all(Object.entries(parts).map(async ([slot, file]) => {
    out[slot] = await loadImage(`${folder}/${file}`);
  }));
  entry.images = out;
  return entry;
}

export async function loadAllAssets(onProgress = () => {}) {
  onProgress(0.1, 'Reading manifests…');
  const [chars, balls, powers] = await Promise.all([
    loadJSON('assets/characters/manifest.json', DEFAULT_CHARACTERS),
    loadJSON('assets/balls/manifest.json', DEFAULT_BALLS),
    loadJSON('assets/powers/manifest.json', DEFAULT_POWERS)
  ]);

  onProgress(0.4, 'Loading characters…');
  await Promise.all((chars.characters || []).map((c) => hydrateSprites(c, 'assets/characters')));

  onProgress(0.7, 'Loading balls…');
  await Promise.all((balls.balls || []).map((b) => hydrateSprites(b, 'assets/balls')));

  onProgress(0.8, 'Loading super throws…');
  // Optional badge art for the super throws. Each one is independent: a type
  // with no file just keeps the shape the renderer draws for it.
  const powerIcons = {};
  await Promise.all(Object.entries((powers.icons || {})).map(async ([type, file]) => {
    const img = await loadImage(`assets/powers/${file}`);
    if (img) powerIcons[type] = roundIcon(img);
  }));

  onProgress(0.85, 'Loading backdrop…');
  // The beach is drawn procedurally unless a painted backdrop is declared.
  const background = OVERRIDES.background
    ? await loadImage('assets/background.png')
    : null;

  return {
    characters: chars.characters || [],
    balls: balls.balls || [],
    powerIcons,
    background
  };
}
