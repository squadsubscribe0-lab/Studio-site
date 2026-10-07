#!/usr/bin/env node
/* ============================================================
   Arrow Out — build script

     node build.js            build every platform
     node build.js poki gd    build only the named ones

   Writes dist/<platform>/ and dist/<platform>.zip.
   No npm install needed: the zip writer below uses only node's
   built-in zlib, so this runs anywhere node runs.
   ============================================================ */
"use strict";

const fs   = require("fs");
const path = require("path");
const zlib = require("zlib");

const PLATFORMS = require("./platforms");
const BASE = PLATFORMS.__BASE__;
delete PLATFORMS.__BASE__;

const SRC  = path.join(__dirname, "src");
const DIST = path.join(__dirname, "dist");

/* ------------------------------------------------------------
   Minimal ZIP writer (deflate, no external modules)
   ------------------------------------------------------------ */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for(let n=0;n<256;n++){
    let c = n;
    for(let k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf){
  let c = -1;
  for(let i=0;i<buf.length;i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function dosTime(d){
  return ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xFFFF;
}
function dosDate(d){
  return (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
}

function writeZip(files, outPath){
  const now = new Date();
  const chunks = [];
  const central = [];
  let offset = 0;

  for(const f of files){
    const nameBuf = Buffer.from(f.name, "utf8");
    const raw = f.data;
    const comp = zlib.deflateRawSync(raw, {level: 9});
    const useDeflate = comp.length < raw.length;
    const body = useDeflate ? comp : raw;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(dosTime(now), 10);
    local.writeUInt16LE(dosDate(now), 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    chunks.push(local, nameBuf, body);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0, 8);
    cen.writeUInt16LE(method, 10);
    cen.writeUInt16LE(dosTime(now), 12);
    cen.writeUInt16LE(dosDate(now), 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(body.length, 20);
    cen.writeUInt32LE(raw.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt16LE(0, 30);
    cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34);
    cen.writeUInt16LE(0, 36);
    cen.writeUInt32LE(0, 38);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);

    offset += local.length + nameBuf.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  fs.writeFileSync(outPath, Buffer.concat([...chunks, centralBuf, end]));
}

/* ------------------------------------------------------------
   Helpers
   ------------------------------------------------------------ */
function rmrf(p){
  if(fs.existsSync(p)) fs.rmSync(p, {recursive: true, force: true});
}
function ensure(p){ fs.mkdirSync(p, {recursive: true}); }

function collect(dir, base, out){
  for(const entry of fs.readdirSync(dir, {withFileTypes: true})){
    const full = path.join(dir, entry.name);
    const rel  = path.posix.join(base, entry.name);
    if(entry.isDirectory()) collect(full, rel, out);
    else out.push({name: rel, data: fs.readFileSync(full)});
  }
  return out;
}

function humanSize(n){
  return n < 1024*1024 ? (n/1024).toFixed(0) + " KB" : (n/1024/1024).toFixed(2) + " MB";
}

/* ------------------------------------------------------------
   Build
   ------------------------------------------------------------ */
const wanted = process.argv.slice(2);
const names = Object.keys(PLATFORMS).filter(n => !wanted.length || wanted.includes(n));

if(!names.length){
  console.error("No matching platforms. Available: " + Object.keys(PLATFORMS).join(", "));
  process.exit(1);
}

const indexSrc = fs.readFileSync(path.join(SRC, "index.html"), "utf8");
const gameSrc  = fs.readFileSync(path.join(SRC, "game.js"), "utf8");
const cssSrc   = fs.readFileSync(path.join(SRC, "style.css"), "utf8");
const musicPath = path.join(SRC, "audio", "music.mp3");
const hasMusic = fs.existsSync(musicPath);

ensure(DIST);
console.log("Building Arrow Out\n");

let total = 0;
for(const name of names){
  const p = PLATFORMS[name];
  const outDir = path.join(DIST, name);
  rmrf(outDir);
  ensure(outDir);

  const html = indexSrc.replace("<!--PLATFORM_HEAD-->", p.head || "");
  const sdk  = BASE.replace("__NAME__", name) + "\n" + p.sdk.trim() + "\n";

  fs.writeFileSync(path.join(outDir, "index.html"), html);
  fs.writeFileSync(path.join(outDir, "game.js"), gameSrc);
  fs.writeFileSync(path.join(outDir, "style.css"), cssSrc);
  fs.writeFileSync(path.join(outDir, "sdk.js"), sdk);
  if(hasMusic){
    ensure(path.join(outDir, "audio"));
    fs.copyFileSync(musicPath, path.join(outDir, "audio", "music.mp3"));
  }

  const files = collect(outDir, "", []);
  const zipPath = path.join(DIST, name + ".zip");
  writeZip(files, zipPath);

  const size = fs.statSync(zipPath).size;
  total += size;
  console.log("  " + name.padEnd(18) + humanSize(size).padStart(9) + "   " + p.label);
}

console.log("\n" + names.length + " builds in dist/  (" + humanSize(total) + " of zips)");
