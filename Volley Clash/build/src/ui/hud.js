import { RULES, TEAM, POWERS } from '../config.js';
import { POWER_META } from '../game/powers.js';

const $ = (id) => document.getElementById(id);

export class HUD {
  constructor() {
    this.el = {
      root: $('hud'),
      scoreL: $('scoreLeft'), scoreR: $('scoreRight'),
      nameL: $('nameLeft'), nameR: $('nameRight'),
      clock: $('clock'), target: $('target'),
      coins: $('coins'), streak: $('streak'), trophies: $('trophies'),
      banner: $('banner'), bannerTitle: $('bannerTitle'), bannerBody: $('bannerBody'),
      lessonTag: $('lessonTag'), skip: $('btnSkip'),
      rally: $('rallyToast'), pips: $('touchPips'),
      audio: $('btnAudio'),
      chargeL: $('chargeLeft'), chargeR: $('chargeRight'),
      powerToast: $('powerToast'), ptTitle: $('ptTitle'), ptBody: $('ptBody'),
      ptIcon: document.querySelector('#powerToast .pt-icon')
    };
    this.toastTimer = 0;
    this.powerTimer = 0;
    this.shown = [null, null];   // which power each slot is currently drawing
  }

  show(on) { this.el.root.classList.toggle('hidden', !on); }

  setNames(left, right) {
    this.el.nameL.textContent = left.toUpperCase();
    this.el.nameR.textContent = right.toUpperCase();
  }

  setTarget(points) { this.el.target.textContent = `FIRST TO ${points}`; }

  setMeta({ coins, streak, best, trophies }) {
    if (coins !== undefined) this.el.coins.textContent = coins;
    if (streak !== undefined) this.el.streak.textContent = `${streak} (Best: ${best ?? streak})`;
    if (trophies !== undefined) this.el.trophies.textContent = trophies;
  }

  setAudioLabel(on) { this.el.audio.textContent = `AUDIO: ${on ? 'ON' : 'OFF'}`; }

  banner(title, body, tag = 'TIP') {
    this.el.bannerTitle.textContent = title;
    this.el.bannerBody.textContent = body;
    this.el.lessonTag.textContent = tag;
    this.el.banner.classList.remove('hidden');
  }

  hideBanner() { this.el.banner.classList.add('hidden'); }

  toast(text, seconds = 1.2) {
    this.el.rally.textContent = text;
    this.el.rally.classList.remove('hidden');
    // restart the pop animation
    this.el.rally.style.animation = 'none';
    void this.el.rally.offsetWidth;
    this.el.rally.style.animation = '';
    this.toastTimer = seconds;
  }

  /** The big "FIREBALL — charged!" card that slides in from the side. */
  announcePower(power, subtitle, team) {
    const meta = POWER_META[power];
    if (!meta) return;
    const el = this.el.powerToast;
    this.el.ptTitle.textContent = meta.label;
    this.el.ptBody.textContent = subtitle;
    el.style.setProperty('--pw', meta.color);
    el.style.setProperty('--pw-glow', meta.glow);
    el.classList.toggle('mine', team === TEAM.LEFT);
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    drawPowerIcon(this.el.ptIcon, power);
    this.powerTimer = 1.9;
  }

  /** Redraws a team's charge slot only when the held power actually changes. */
  syncCharge(slot, el, power) {
    if (this.shown[slot] === power) return;
    this.shown[slot] = power;
    const meta = power ? POWER_META[power] : null;
    el.classList.toggle('empty', !power);
    el.querySelector('span').textContent = meta ? meta.label : '';
    if (meta) {
      el.style.setProperty('--pw', meta.color);
      el.style.setProperty('--pw-glow', meta.glow);
    }
    drawPowerIcon(el.querySelector('canvas'), power);
  }

  update(match, dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.el.rally.classList.add('hidden');
    }
    if (this.powerTimer > 0) {
      this.powerTimer -= dt;
      if (this.powerTimer <= 0) this.el.powerToast.classList.add('hidden');
    }
    if (!match) return;

    this.el.scoreL.textContent = match.score[TEAM.LEFT];
    this.el.scoreR.textContent = match.score[TEAM.RIGHT];

    if (match.cfg.matchSeconds > 0) {
      const s = Math.max(0, Math.ceil(match.clock));
      this.el.clock.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      this.el.clock.classList.toggle('urgent', s <= 10 && s > 0);
    } else {
      this.el.clock.textContent = '∞';
    }

    // Charged super throws. With powers switched off the slots are emptied
    // rather than left frozen on whatever was last held.
    const l = POWERS.enabled ? match.powers.chargeOf(TEAM.LEFT) : null;
    const r = POWERS.enabled ? match.powers.chargeOf(TEAM.RIGHT) : null;
    this.syncCharge(0, this.el.chargeL, l ? l.type : null);
    this.syncCharge(1, this.el.chargeR, r ? r.type : null);

    // touch pips show how many contacts the side has left
    const used = match.powers.multiActive ? 0 : match.touches;
    if (this.pipCount !== RULES.maxTouches) {
      this.el.pips.innerHTML = '<i></i>'.repeat(RULES.maxTouches);
      this.pipCount = RULES.maxTouches;
    }
    this.el.pips.classList.toggle('off', match.powers.multiActive);
    [...this.el.pips.children].forEach((pip, i) => pip.classList.toggle('on', i < used));
  }
}

/**
 * Draws a power's symbol into a small canvas. Shared by the HUD chips, the
 * announcement card and the codex screen so there is one source of truth for
 * what a fireball looks like.
 */
export function drawPowerIcon(canvas, power) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (!power) return;
  const meta = POWER_META[power];
  const r = Math.min(w, h) * 0.36;

  ctx.save();
  ctx.translate(w / 2, h / 2);

  const halo = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.7);
  halo.addColorStop(0, hexa(meta.color, 0.5));
  halo.addColorStop(1, hexa(meta.color, 0));
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2); ctx.fill();

  const core = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.45, meta.glow);
  core.addColorStop(1, meta.color);
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

  const s = r * 0.6;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0b1122';
  if (power === 'fire') {
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.75, -s * 0.1, s * 0.35, s * 0.55);
    ctx.quadraticCurveTo(0, s, -s * 0.35, s * 0.55);
    ctx.quadraticCurveTo(-s * 0.75, -s * 0.1, 0, -s);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (power === 'ice') {
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate((i * Math.PI) / 3);
      ctx.strokeStyle = '#0b1122'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
      ctx.strokeStyle = '#eaffff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
      ctx.restore();
    }
  } else {
    ctx.fillStyle = '#fdf4ff';
    for (const [dx, dy] of [[-s * 0.45, s * 0.25], [s * 0.45, s * 0.25], [0, -s * 0.45]]) {
      ctx.beginPath(); ctx.arc(dx, dy, s * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();
}

function hexa(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
