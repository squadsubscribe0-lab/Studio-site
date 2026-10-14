#!/usr/bin/env node
/* ============================================================
   Tiny Dungeon Keeper — platform builds

     node build.mjs                 every platform
     node build.mjs crazygames gd   only the named ones

   Writes dist/<platform>/ and dist/tiny-dungeon-keeper-<platform>.zip
   and refreshes the root sdk.js (standalone) used by the website copy.
   No npm install needed.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ALL = require('./platforms.cjs');
const BASE = ALL.__BASE__;

const TARGETS = {
  web: { from: 'standalone', label: 'Website / itch.io / any host' },
  crazygames: { from: 'crazygames', label: 'CrazyGames (SDK v3)' },
  gamedistribution: { from: 'gamedistribution', label: 'GameDistribution — put your game id in index.html (__GD_GAME_ID__)' },
  playgama: { from: 'playgama', label: 'Playgama Bridge' },
};
const COPY = ['src', 'assets'];
const EXTRA = { playgama: { 'playgama-bridge-config.json': '{}\n' } };

/* ---------- minimal ZIP writer (deflate, no external modules) ---------- */
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc32 = (b) => { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function writeZip(files, out) {
  const d = new Date();
  const time = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xffff;
  const date = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
  const chunks = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8');
    const comp = zlib.deflateRawSync(f.data, { level: 9 });
    const deflate = comp.length < f.data.length;
    const body = deflate ? comp : f.data;
    const crc = crc32(f.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6); local.writeUInt16LE(deflate ? 8 : 0, 8);
    local.writeUInt16LE(time, 10); local.writeUInt16LE(date, 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18); local.writeUInt32LE(f.data.length, 22); local.writeUInt16LE(name.length, 26); local.writeUInt16LE(0, 28);
    chunks.push(local, name, body);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0, 8); cen.writeUInt16LE(deflate ? 8 : 0, 10);
    cen.writeUInt16LE(time, 12); cen.writeUInt16LE(date, 14); cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(body.length, 20); cen.writeUInt32LE(f.data.length, 24);
    cen.writeUInt16LE(name.length, 28); cen.writeUInt32LE(offset, 42);
    central.push(cen, name);
    offset += local.length + name.length + body.length;
  }
  const cbuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cbuf.length, 12); end.writeUInt32LE(offset, 16);
  fs.writeFileSync(out, Buffer.concat([...chunks, cbuf, end]));
}
function collect(dir, base, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name), rel = path.posix.join(base, e.name);
    if (e.isDirectory()) collect(full, rel, out); else out.push({ name: rel, data: fs.readFileSync(full) });
  }
  return out;
}
const sdkFor = (key) => BASE.replace('__NAME__', key) + '\n' + ALL[key].sdk.trim() + '\n';
const size = (n) => (n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(2) + ' MB');

/* ---------- build ---------- */
fs.writeFileSync(path.join(ROOT, 'sdk.js'), sdkFor('standalone'));
const want = process.argv.slice(2).map((a) => (a === 'gd' ? 'gamedistribution' : a));
const names = Object.keys(TARGETS).filter((n) => !want.length || want.includes(n));
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
console.log('Building Tiny Dungeon Keeper\n');
for (const n of names) {
  const t = TARGETS[n], p = ALL[t.from];
  const out = path.join(DIST, n);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), index.replace('<!--PLATFORM_HEAD-->', p.head || ''));
  fs.writeFileSync(path.join(out, 'sdk.js'), sdkFor(t.from));
  for (const d of COPY) fs.cpSync(path.join(ROOT, d), path.join(out, d), { recursive: true, filter: (f) => !/SOURCES\.txt$/.test(f) });
  fs.copyFileSync(path.join(ROOT, 'CREDITS.txt'), path.join(out, 'CREDITS.txt'));
  for (const [f, body] of Object.entries(EXTRA[n] || {})) fs.writeFileSync(path.join(out, f), body);
  const zip = path.join(DIST, `tiny-dungeon-keeper-${n}.zip`);
  writeZip(collect(out, ''), zip);
  console.log('  ' + n.padEnd(18) + size(fs.statSync(zip).size).padStart(9) + '   ' + t.label);
}
