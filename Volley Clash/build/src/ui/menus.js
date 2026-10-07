import { POWERS } from '../config.js';
import { POWER_META } from '../game/powers.js';
import { drawPowerIcon } from './hud.js';

const $ = (id) => document.getElementById(id);

const SCREENS = {
  loading: 'scrLoading',
  menu: 'scrMenu',
  modes: 'scrModes',
  characters: 'scrCharacters',
  online: 'scrOnline',
  controls: 'scrControls',
  settings: 'scrSettings',
  powers: 'scrPowers',
  pause: 'scrPause',
  result: 'scrResult'
};

export class Menus {
  constructor(game) {
    this.game = game;
    this.current = 'loading';

    // Any element with data-goto navigates.
    document.querySelectorAll('[data-goto]').forEach((el) => {
      el.addEventListener('click', () => this.show(el.dataset.goto));
    });

    document.querySelectorAll('[data-mode]').forEach((el) => {
      el.addEventListener('click', () => {
        game.startMatch({
          mode: el.dataset.mode,
          teamSize: Number(el.dataset.size),
          pointsToWin: Number($('optPoints').value),
          matchSeconds: Number($('optTime').value),
          difficulty: Number($('optDiff').value),
          powers: $('optPowers').value === '1'
        });
      });
    });
  }

  show(name) {
    this.current = name;
    Object.entries(SCREENS).forEach(([key, id]) => {
      $(id).classList.toggle('hidden', key !== name);
    });
    if (name === 'characters') this.buildPickers();
    if (name === 'powers') this.buildCodex();
  }

  hideAll() {
    this.current = 'none';
    Object.values(SCREENS).forEach((id) => $(id).classList.add('hidden'));
  }

  progress(v, msg) {
    $('loadfill').style.width = Math.round(v * 100) + '%';
    if (msg) $('loadmsg').textContent = msg;
  }

  /** Draws each character / ball into a small canvas so the picker works with or without art. */
  buildPickers() {
    const { assets, selection } = this.game;

    const charGrid = $('charGrid');
    charGrid.innerHTML = '';
    assets.characters.forEach((c) => {
      const card = document.createElement('button');
      card.className = 'card' + (selection.character === c ? ' selected' : '');
      const cv = document.createElement('canvas');
      cv.width = 120; cv.height = 150;
      drawCharacterPreview(cv, c);
      const label = document.createElement('b');
      label.textContent = c.name;
      card.append(cv, label);
      card.addEventListener('click', () => { selection.character = c; this.buildPickers(); });
      charGrid.appendChild(card);
    });

    const ballGrid = $('ballGrid');
    ballGrid.innerHTML = '';
    assets.balls.forEach((b) => {
      const card = document.createElement('button');
      card.className = 'card' + (selection.ball === b ? ' selected' : '');
      const cv = document.createElement('canvas');
      cv.width = 96; cv.height = 96;
      drawBallPreview(cv, b);
      const label = document.createElement('b');
      label.textContent = b.name;
      card.append(cv, label);
      card.addEventListener('click', () => { selection.ball = b; this.buildPickers(); });
      ballGrid.appendChild(card);
    });
  }

  /** The super throw reference screen. Built from POWER_META so it can never
      drift out of step with what the game actually does. */
  buildCodex() {
    const grid = $('powerGrid');
    if (grid.childElementCount) return;      // static content, build it once
    for (const type of POWERS.types) {
      const meta = POWER_META[type];
      const card = document.createElement('div');
      card.className = 'power-card';
      card.style.setProperty('--pw', meta.color);
      card.style.setProperty('--pw-glow', meta.glow);

      const cv = document.createElement('canvas');
      cv.width = 96; cv.height = 96;
      drawPowerIcon(cv, type);

      const body = document.createElement('div');
      const h = document.createElement('b');
      h.textContent = meta.label;
      const p = document.createElement('small');
      p.textContent = meta.blurb;
      const d = document.createElement('i');
      d.textContent = detailFor(type);
      body.append(h, p, d);

      card.append(cv, body);
      grid.appendChild(card);
    }
  }

  result(won, score, stats = '') {
    $('resultTitle').textContent = won ? 'You win!' : 'You lose';
    $('resultScore').textContent = `${score[0]} – ${score[1]}`;
    const el = $('resultStats');
    if (el) el.textContent = stats;
    this.show('result');
  }
}

/** One line of hard numbers per power, read straight out of the tuning. */
function detailFor(type) {
  if (type === 'fire') {
    return `${Math.round(POWERS.fire.speedMul * 100)}% pace · scorches the digger for ${POWERS.fire.burnTime}s`;
  }
  if (type === 'ice') {
    return `freezes ${POWERS.ice.targetsSolo} opponent (${POWERS.ice.targetsTeam} in team matches) for ${POWERS.ice.freezeTime}s`;
  }
  return `${POWERS.multi.extraMin + 1}–${POWERS.multi.extraMax + 1} balls for ${POWERS.multi.duration}s · no touch limit`;
}

function drawCharacterPreview(canvas, c) {
  const ctx = canvas.getContext('2d');
  const pal = c.palette || {};
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (c.images?.full) {
    ctx.drawImage(c.images.full, 10, 5, 100, 140);
    return;
  }
  ctx.save();
  ctx.translate(60, 145);
  ctx.scale(0.62, 0.62);
  ctx.lineWidth = 5; ctx.strokeStyle = '#0b1122'; ctx.lineJoin = 'round';
  // legs
  for (const s of [-1, 1]) {
    ctx.fillStyle = pal.skin || '#e8b184';
    rr(ctx, s * 14 - 9, -46, 18, 40, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = pal.bottom || '#14306b';
    rr(ctx, s * 14 - 11, -52, 22, 22, 8); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = pal.top || '#2f6fe0';
  rr(ctx, -24, -112, 48, 70, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = pal.skin || '#e8b184';
  rr(ctx, -26, -166, 52, 58, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = pal.hair || '#222';
  rr(ctx, -28, -170, 56, 22, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#0b1122';
  ctx.beginPath(); ctx.arc(8, -138, 4, 0, 7); ctx.arc(-8, -138, 4, 0, 7); ctx.fill();
  ctx.restore();
}

function drawBallPreview(canvas, b) {
  const ctx = canvas.getContext('2d');
  const r = 40;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(48, 48);
  if (b.images?.ball) { ctx.drawImage(b.images.ball, -r, -r, r * 2, r * 2); return; }
  const colors = b.colors || ['#fff', '#f44'];
  ctx.fillStyle = colors[0];
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  if ((b.style || 'beach') === 'beach') {
    const segs = colors.length - 1;
    for (let i = 0; i < segs; i++) {
      ctx.fillStyle = colors[i + 1];
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, (i * 2 * Math.PI) / segs, ((i + 0.55) * 2 * Math.PI) / segs);
      ctx.closePath(); ctx.fill();
    }
  } else {
    ctx.strokeStyle = colors[1]; ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, r * 0.34, (i * Math.PI) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
