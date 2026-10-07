import { ELEMENT_SIGILS } from '../../ui/glyphs.js';
import { RELIC_SIGILS } from '../../ui/kitGlyphs.js';
import { ELEMENT_META } from '../../config/settings.js';
import { SKILLS, MAX_SKILL_LEVEL, MAX_SLOTS } from '../data/skills.js';
import { PASSIVES, MAX_PASSIVE_LEVEL } from '../data/passives.js';

const RELIC_ACCENT = '#ffb347';
const $ = (root, sel) => root.querySelector(sel);

export const fmtTime = (s) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

/** Everything drawn in DOM: menus, HUD, choices, banners. */
export class GameUI {
  constructor(root, handlers) {
    this.root = root;
    this.h = handlers;
    this._choiceHandler = null;
    this._bannerTimer = 0;
    this._loadoutKey = '';

    this.el = {
      loader: document.getElementById('loader'),
      loaderBar: document.getElementById('loader-bar'),
      loaderText: document.getElementById('loader-text'),
      title: $(root, '#screen-title'),
      best: $(root, '#title-best'),
      hud: $(root, '#hud'),
      xpFill: $(root, '#xp-fill'),
      level: $(root, '#hud-level'),
      time: $(root, '#hud-time'),
      kills: $(root, '#hud-kills'),
      spells: $(root, '#loadout-spells'),
      relics: $(root, '#loadout-relics'),
      hpBar: $(root, '#player-hp'),
      hpFill: $(root, '#player-hp-fill'),
      boss: $(root, '#boss'),
      bossName: $(root, '#boss-name'),
      bossFill: $(root, '#boss-fill'),
      banner: $(root, '#banner'),
      choice: $(root, '#screen-choice'),
      choiceTitle: $(root, '#choice-title'),
      choiceSub: $(root, '#choice-sub'),
      cards: $(root, '#choice-cards'),
      pause: $(root, '#screen-pause'),
      pauseLoadout: $(root, '#pause-loadout'),
      end: $(root, '#screen-end'),
      endTitle: $(root, '#end-title'),
      endStats: $(root, '#end-stats'),
      endDamage: $(root, '#end-damage'),
      revive: $(root, '#btn-revive'),
      hurt: $(root, '#hurt'),
      mute: $(root, '#btn-mute')
    };

    $(root, '#btn-play').addEventListener('click', () => handlers.onPlay());
    $(root, '#btn-pause').addEventListener('click', () => handlers.onPause());
    $(root, '#btn-resume').addEventListener('click', () => handlers.onResume());
    $(root, '#btn-quit').addEventListener('click', () => handlers.onQuit());
    $(root, '#btn-again').addEventListener('click', () => handlers.onPlay());
    $(root, '#btn-menu').addEventListener('click', () => handlers.onQuit());
    this.el.revive.addEventListener('click', () => handlers.onRevive());
    this.el.mute.addEventListener('click', () => handlers.onMute());
  }

  /* ---------------- loading ---------------- */

  progress(p, text) {
    this.el.loaderBar.style.transform = `scaleX(${p})`;
    this.el.loaderText.textContent = text;
  }

  hideLoader() {
    this.el.loader.classList.add('is-gone');
  }

  /* ---------------- screens ---------------- */

  _show(el, on) {
    el.classList.toggle('is-open', on);
    el.setAttribute('aria-hidden', on ? 'false' : 'true');
  }

  showTitle(best) {
    this.el.best.textContent = best ? `Deepest run  ${fmtTime(best.time)}  ·  ${best.kills.toLocaleString()} slain` : 'No runs yet. The dungeon waits.';
    this._show(this.el.title, true);
    this._show(this.el.hud, false);
    this._show(this.el.end, false);
    this._show(this.el.pause, false);
    this._show(this.el.choice, false);
    requestAnimationFrame(() => $(this.root, '#btn-play').focus());
  }

  showHud() {
    this._show(this.el.title, false);
    this._show(this.el.end, false);
    this._show(this.el.hud, true);
  }

  setMuted(m) {
    this.el.mute.textContent = m ? 'Sound: off' : 'Sound: on';
    this.el.mute.setAttribute('aria-pressed', String(m));
  }

  showPause(on, skills) {
    this._show(this.el.pause, on);
    if (on) {
      this.el.pauseLoadout.innerHTML = this._loadoutRows(skills);
      requestAnimationFrame(() => $(this.root, '#btn-resume').focus());
    }
  }

  /* ---------------- HUD ---------------- */

  hud({ xp, xpNext, level, time, kills }) {
    this.el.xpFill.style.transform = `scaleX(${Math.min(1, xp / xpNext)})`;
    this.el.level.textContent = level;
    this.el.time.textContent = fmtTime(time);
    this.el.kills.textContent = kills.toLocaleString();
  }

  playerBar(x, y, frac, visible) {
    const bar = this.el.hpBar;
    bar.style.opacity = visible ? '1' : '0';
    bar.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, 0)`;
    this.el.hpFill.style.transform = `scaleX(${Math.max(0, frac)})`;
    bar.classList.toggle('is-low', frac < 0.3);
  }

  hurt(amount) {
    this.el.hurt.style.opacity = String(Math.min(0.85, amount));
  }

  boss(name, frac) {
    if (!name) {
      this.el.boss.classList.remove('is-open');
      return;
    }
    this.el.boss.classList.add('is-open');
    this.el.bossName.textContent = name;
    this.el.bossFill.style.transform = `scaleX(${Math.max(0, frac)})`;
  }

  banner(text, kind = 'info') {
    const b = this.el.banner;
    b.textContent = text;
    b.dataset.kind = kind;
    b.classList.remove('is-on');
    void b.offsetWidth; // restart the animation
    b.classList.add('is-on');
    // Also clear on a timer, so reduced-motion users (no animation) never keep a stale banner.
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(() => b.classList.remove('is-on'), 2700);
  }

  loadout(skills) {
    const key = [...skills.owned].map(([id, e]) => `${id}${e.level}${e.evolved}`).join() + [...skills.passives].join();
    if (key === this._loadoutKey) return;
    this._loadoutKey = key;
    const spells = [];
    for (let k = 0; k < MAX_SLOTS; k++) {
      const entry = [...skills.owned][k];
      spells.push(entry ? this._slot(ELEMENT_SIGILS[SKILLS[entry[0]].element], ELEMENT_META[SKILLS[entry[0]].element].accent, entry[1].level, MAX_SKILL_LEVEL, entry[1].evolved) : '<div class="slot slot--empty"></div>');
    }
    const relics = [];
    for (let k = 0; k < MAX_SLOTS; k++) {
      const entry = [...skills.passives][k];
      relics.push(entry ? this._slot(RELIC_SIGILS[entry[0]], RELIC_ACCENT, entry[1], MAX_PASSIVE_LEVEL, false, true) : '<div class="slot slot--empty slot--small"></div>');
    }
    this.el.spells.innerHTML = spells.join('');
    this.el.relics.innerHTML = relics.join('');
  }

  _slot(icon, accent, level, max, evolved, small = false) {
    const pips = Array.from({ length: max }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('');
    return `<div class="slot ${small ? 'slot--small' : ''} ${evolved ? 'slot--evolved' : ''}" style="--accent:${accent}">
      <span class="slot__icon">${icon}</span><span class="slot__pips">${pips}</span></div>`;
  }

  _loadoutRows(skills) {
    const rows = [...skills.owned].map(([id, e]) => `<li style="--accent:${ELEMENT_META[SKILLS[id].element].accent}">
      <span class="row__icon">${ELEMENT_SIGILS[SKILLS[id].element]}</span>
      <span class="row__name">${skills.displayName(id)}</span><span class="row__lv">Lv ${e.level}</span></li>`);
    const relics = [...skills.passives].map(([id, l]) => `<li style="--accent:${RELIC_ACCENT}">
      <span class="row__icon">${RELIC_SIGILS[id]}</span><span class="row__name">${PASSIVES[id].name}</span><span class="row__lv">Lv ${l}</span></li>`);
    return `<ul class="rows">${rows.join('')}${relics.join('')}</ul>`;
  }

  /* ---------------- choices ---------------- */

  /**
   * @param {object[]} options { kind, id, tag, name, desc }
   * @param {object} [o] { reveal: single "claim" card list }
   */
  showChoices(title, sub, options, onPick) {
    this.el.choiceTitle.textContent = title;
    this.el.choiceSub.textContent = sub;
    this.el.cards.innerHTML = options.map((o, i) => {
      const isRelic = o.kind === 'relic';
      const icon = o.kind === 'heal' ? RELIC_SIGILS.vitality : isRelic ? RELIC_SIGILS[o.id] : ELEMENT_SIGILS[SKILLS[o.id].element];
      const accent = o.kind === 'skill' ? ELEMENT_META[SKILLS[o.id].element].accent : o.kind === 'heal' ? '#ff5a64' : RELIC_ACCENT;
      return `<button class="card ${o.tag === 'Awakened' ? 'card--evolve' : ''}" style="--accent:${accent}" data-i="${i}">
        <span class="card__key" aria-hidden="true">${i + 1}</span>
        <span class="card__tag">${o.tag}</span>
        <span class="card__icon">${icon}</span>
        <span class="card__name">${o.name}</span>
        <span class="card__kind">${o.kind === 'skill' ? 'Spell' : o.kind === 'relic' ? 'Relic' : 'Boon'}</span>
        <span class="card__desc">${o.desc}</span>
      </button>`;
    }).join('');
    this._choiceHandler = onPick;
    this.el.cards.querySelectorAll('.card').forEach((btn) => {
      btn.addEventListener('click', () => this.pick(Number(btn.dataset.i)));
    });
    this._show(this.el.choice, true);
    requestAnimationFrame(() => this.el.cards.querySelector('.card')?.focus());
  }

  get choosing() {
    return this._choiceHandler !== null;
  }

  pick(i) {
    const handler = this._choiceHandler;
    if (!handler || !this.el.cards.children[i]) return;
    this._choiceHandler = null;
    this._show(this.el.choice, false);
    handler(i);
  }

  /* ---------------- end ---------------- */

  showEnd({ victory, time, kills, level, damage, canRevive }) {
    this._show(this.el.hud, false);
    this._show(this.el.end, true);
    this.el.end.dataset.result = victory ? 'win' : 'loss';
    this.el.endTitle.textContent = victory ? 'The Heart Falls Silent' : 'Claimed by the Dark';
    this.el.endStats.innerHTML = `
      <div><dt>Survived</dt><dd>${fmtTime(time)}</dd></div>
      <div><dt>Slain</dt><dd>${kills.toLocaleString()}</dd></div>
      <div><dt>Level</dt><dd>${level}</dd></div>`;
    const top = damage[0]?.amount || 1;
    this.el.endDamage.innerHTML = damage.slice(0, 6).map((d) => `
      <li style="--accent:${ELEMENT_META[SKILLS[d.id].element].accent}">
        <span class="row__icon">${ELEMENT_SIGILS[SKILLS[d.id].element]}</span>
        <span class="row__name">${d.name}</span>
        <span class="row__bar"><i style="transform:scaleX(${(d.amount / top).toFixed(3)})"></i></span>
        <span class="row__lv">${Math.round(d.amount).toLocaleString()}</span>
      </li>`).join('');
    this.el.revive.hidden = !canRevive;
    requestAnimationFrame(() => (canRevive ? this.el.revive : $(this.root, '#btn-again')).focus());
  }
}
