import './ui/game.css';
import { GameApp } from './GameApp.js';

/** Dungeon.io entry point. The VFX sandbox lives on at sandbox.html. */
async function boot() {
  const canvas = document.getElementById('game-canvas');
  try {
    const app = new GameApp(canvas);
    window.game = app;
    await app.load();
  } catch (error) {
    console.error('[dungeon.io] failed to start', error);
    const text = document.getElementById('loader-text');
    if (text) text.textContent = `The dungeon would not open: ${error?.message ?? 'unknown error'}`;
  }
}

boot();
