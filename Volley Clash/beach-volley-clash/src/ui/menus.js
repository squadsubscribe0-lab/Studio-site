import { POWERS } from '../config.js';
import { POWER_META } from '../game/powers.js';
import { drawPowerIcon } from './hud.js';
import { audio } from '../core/audio.js';
import { Renderer } from '../game/renderer.js';

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

  /**
   * Builds both pickers. Each card is either owned - click to equip - or for
   * sale, in which case the click is the purchase and the card equips itself
   * straight afterwards. Buying and then having to find and press the thing
   * again is a step nobody wants.
   */
  buildPickers() {
    const { assets, selection } = this.game;
    $('shopCoins').textContent = this.game.meta.coins;

    this.buildGrid({
      grid: $('charGrid'),
      items: assets.characters,
      kind: 'characters',
      isSelected: (c) => selection.character === c,
      equip: (c) => this.game.equip('characters', c),
      paint: (card, c) => {
        const cv = document.createElement('canvas');
        cv.width = 120; cv.height = 128;
        drawCharacterPreview(cv, c);
        card.append(cv);
      }
    });

    this.buildGrid({
      grid: $('ballGrid'),
      items: assets.balls,
      kind: 'balls',
      isSelected: (b) => selection.ball === b,
      equip: (b) => this.game.equip('balls', b),
      paint: (card, b) => {
        const cv = document.createElement('canvas');
        cv.width = 96; cv.height = 84;
        drawBallPreview(cv, b);
        card.append(cv);
      }
    });
  }

  buildGrid({ grid, items, kind, isSelected, equip, paint }) {
    grid.innerHTML = '';
    for (const item of items) {
      const owned = this.game.owns(kind, item);
      const affordable = owned || this.game.meta.coins >= item.price;

      const card = document.createElement('button');
      card.className = 'card'
        + (isSelected(item) ? ' selected' : '')
        + (owned ? '' : ' locked')
        + (owned || affordable ? '' : ' unaffordable');
      paint(card, item);

      const label = document.createElement('b');
      label.textContent = item.name;
      card.append(label);

      if (!owned) {
        const tag = document.createElement('span');
        tag.className = 'price';
        tag.innerHTML = `<i class="ic-coin"></i>${item.price}`;
        card.append(tag);
      }

      card.addEventListener('click', () => this.onCardClick(kind, item, equip));
      grid.appendChild(card);
    }
  }

  onCardClick(kind, item, equip) {
    const result = this.game.buy(kind, item);
    if (result === 'poor') {
      // Say what is missing rather than doing nothing - a dead click reads as
      // a broken button.
      const short = item.price - this.game.meta.coins;
      this.shopMessage(`${short} more coin${short === 1 ? '' : 's'} needed`, false);
      audio.play('block', 0.7);
      return;
    }
    if (result === 'bought') {
      this.shopMessage(`${item.name} unlocked!`, true);
      audio.play('pickup', 0.9);
    } else {
      audio.play('ui', 0.7);
    }
    equip(item);
    this.buildPickers();
  }

  shopMessage(text, good) {
    const el = $('shopMsg');
    el.textContent = text;
    el.classList.toggle('bad', !good);
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    clearTimeout(this.shopMsgTimer);
    this.shopMsgTimer = setTimeout(() => el.classList.add('hidden'), 2200);
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
      cv.width = 96; cv.height = 84;
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
    // Online, the same button goes back to the room the round came from, so it
    // has to say so - "PLAY AGAIN" on a screen that returns you to a lobby is a
    // button lying about where it goes.
    const online = this.game.mode === 'online';
    $('btnAgain').textContent = online ? 'BACK TO LOBBY' : 'PLAY AGAIN';
    $('btnMenu').textContent = online ? 'LEAVE ROOM' : 'MAIN MENU';
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

// The picker used to carry its own copy of the character art, and the two
// drifted: the cards showed faceless, armless blobs while the match showed the
// real thing. It borrows the renderer's body instead - Renderer.drawVectorBody
// only touches other prototype methods, so a bare prototype instance is enough
// to call it with no canvas of its own.
const BODY = Object.create(Renderer.prototype);

/** A player-shaped object with just the fields the body drawing reads. */
const POSED = { onGround: true, spikeHeld: false, diveTimer: 0, frozen: 0, burning: 0 };

function drawCharacterPreview(canvas, c) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (c.images?.full) {
    ctx.drawImage(c.images.full, 10, 5, 100, 140);
    return;
  }
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height - 6);
  ctx.scale(0.66, 0.66);
  BODY.drawVectorBody(ctx, c.palette || {}, c.images || {}, 0, POSED, c);
  ctx.restore();
}

function drawBallPreview(canvas, b) {
  const ctx = canvas.getContext('2d');
  const r = 34;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (b.images?.ball) { ctx.drawImage(b.images.ball, -r, -r, r * 2, r * 2); return; }

  // The renderer's own painter, not a second copy of it. The copy that used to
  // live here only knew 'beach' and drew everything else as a volleyball, so
  // Watermelon and Coconut were sold as something they were not.
  BODY.paintBallSkin(ctx, r, b.style || 'beach', b.colors || ['#fff', '#f44']);

  ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.arc(-r * 0.32, -r * 0.36, r * 0.28, 0, Math.PI * 2); ctx.fill();
}

