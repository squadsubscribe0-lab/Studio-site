import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Dev-only sink for tools/capture: the capture page POSTs rendered covers / video frames
// here and they are written under ./marketing. Never part of the production build.
function captureSink() {
  const root = path.resolve('marketing');
  return {
    name: 'capture-sink',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__capture', (req, res) => {
        const name = new URL(req.url, 'http://local').searchParams.get('name') || '';
        if (req.method !== 'POST' || !/^[\w\-/.]+$/.test(name) || name.includes('..')) {
          res.statusCode = 400;
          res.end('bad request');
          return;
        }
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          const out = path.join(root, name);
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.writeFileSync(out, Buffer.concat(chunks));
          res.end('ok');
        });
      });
    },
  };
}

// Relative base so the build works from any CrazyGames upload path.
export default defineConfig({
  base: './',
  plugins: [captureSink()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200,
  },
});
