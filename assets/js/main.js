/* Portfolio interactions. Vanilla JS; uses GSAP + ScrollTrigger + SplitText + Lenis when loaded. */
(() => {
  'use strict';

  const doc = document.documentElement;
  const body = document.body;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  let reduceMotion = reduceMotionQuery.matches;
  reduceMotionQuery.addEventListener?.('change', (e) => (reduceMotion = e.matches));
  const finePointer = () => finePointerQuery.matches && !reduceMotion;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // Fallbacks in case the inline bootstrap in <head> was blocked.
  doc.classList.remove('no-js');
  doc.classList.add('js');
  if (!doc.dataset.theme) doc.dataset.theme = 'dark';

  const gsap = window.gsap;
  const useGsap = !!(gsap && window.ScrollTrigger) && !reduceMotion;
  if (useGsap) doc.classList.add('has-gsap');
  else doc.classList.remove('split-hero');
  let lenis = null;

  requestAnimationFrame(() => body.classList.add('is-loaded'));

  /* ── Scroll state: header, progress bar, back-to-top ──────────────────── */

  const header = $('[data-header]');
  const progress = $('.scroll-progress');
  const toTop = $('[data-to-top]');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp(y / max, 0, 1) : 0;
    progress?.style.setProperty('--progress', p.toFixed(4));
    toTop?.style.setProperty('--progress', p.toFixed(4));
    header?.classList.toggle('is-scrolled', y > 24);
    // Hide the header when scrolling down quickly, show it again on scroll up.
    const menuOpen = body.classList.contains('menu-open');
    header?.classList.toggle('is-hidden', !menuOpen && y > 600 && y > lastY + 4);
    if (y < lastY - 4 || y < 600) header?.classList.remove('is-hidden');
    toTop?.classList.toggle('is-visible', y > window.innerHeight * 0.8);
    lastY = y;
    ticking = false;
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  onScroll();

  toTop?.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    $('.brand')?.focus({ preventScroll: true });
  });

  /* ── Mobile menu ───────────────────────────────────────────────────────── */

  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) $('a', menu)?.focus();
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener?.('change', (e) => e.matches && setMenu(false));

  /* ── Active nav link (scroll spy) ─────────────────────────────────────── */

  const navLinks = $$('[data-nav]');
  if (body.classList.contains('is-home') && 'IntersectionObserver' in window) {
    const sections = navLinks.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => {
            const active = a.dataset.nav === entry.target.id;
            a.classList.toggle('is-active', active);
            if (active) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ── Scroll reveal with stagger ────────────────────────────────────────── */

  $$('[data-stagger]').forEach((group) => {
    $$('.reveal', group).forEach((el, i) => el.style.setProperty('--delay', `${Math.min(i, 6) * 0.09}s`));
  });

  const reveals = $$('.reveal');
  if (useGsap) {
    // Handled by the GSAP motion layer further down.
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-visible');
          io.unobserve(el);
          // After the entrance finishes, let hover/tilt own the transform.
          const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;
          setTimeout(() => el.classList.add('is-done'), 1000 + delay * 1000);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible', 'is-done'));
  }

  /* ── Animated counters ────────────────────────────────────────────────── */

  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          countIO.unobserve(el);
          const target = Number(el.dataset.count) || 0;
          if (reduceMotion || target === 0) {
            el.textContent = target;
            return;
          }
          const duration = clamp(900 + target * 8, 900, 2000);
          const start = performance.now();
          const step = (now) => {
            const t = clamp((now - start) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            el.textContent = Math.round(target * eased);
            if (t < 1) requestAnimationFrame(step);
          };
          el.textContent = '0';
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => countIO.observe(el));
  }

  /* ── Hero: parallax layers, mouse depth, particles ────────────────────── */

  const hero = $('.hero');
  const scene = $('[data-hero-scene]');
  if (hero && scene) {
    const layers = $$('[data-depth]', scene).map((el) => ({ el, depth: Number(el.dataset.depth) || 0 }));
    const content = $('[data-hero-content]');
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let heroVisible = true;
    let rafId = 0;

    let lastScroll = -1;
    hero.addEventListener(
      'pointermove',
      (e) => {
        if (!finePointer()) return;
        const r = hero.getBoundingClientRect();
        pointer.tx = (e.clientX - r.left) / r.width - 0.5;
        pointer.ty = (e.clientY - r.top) / r.height - 0.5;
        start();
      },
      { passive: true },
    );
    hero.addEventListener('pointerleave', () => {
      pointer.tx = 0;
      pointer.ty = 0;
      start();
    });
    window.addEventListener('scroll', () => start(), { passive: true });

    // Runs only while something is changing, then goes idle.
    function frame() {
      rafId = 0;
      if (!heroVisible || reduceMotion) return;
      pointer.x = lerp(pointer.x, pointer.tx, 0.06);
      pointer.y = lerp(pointer.y, pointer.ty, 0.06);
      const sy = window.scrollY;
      const settled = Math.abs(pointer.x - pointer.tx) + Math.abs(pointer.y - pointer.ty) < 0.0005 && sy === lastScroll;
      lastScroll = sy;
      for (const { el, depth } of layers) {
        const mx = -pointer.x * depth * 60;
        const my = -pointer.y * depth * 40 + sy * depth * 0.6;
        el.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
      }
      if (content) {
        const fade = clamp(1 - sy / (window.innerHeight * 0.75), 0, 1);
        content.style.transform = `translate3d(0, ${(sy * 0.18).toFixed(2)}px, 0) rotateX(${(pointer.y * -3).toFixed(2)}deg) rotateY(${(pointer.x * 4).toFixed(2)}deg)`;
        content.style.opacity = fade.toFixed(3);
      }
      if (!settled) rafId = requestAnimationFrame(frame);
    }
    const start = () => {
      if (!rafId && !reduceMotion) rafId = requestAnimationFrame(frame);
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible) start();
      }).observe(hero);
    }
    if (content) content.parentElement.style.perspective = '1200px';
    start();

    /* Particles: embers + dust, light and capped for mobile. */
    const canvas = $('[data-particles]', scene);
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && !reduceMotion) {
      let w = 0;
      let h = 0;
      let particles = [];
      let pRaf = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      const spawn = (initial) => {
        const ember = Math.random() < 0.35;
        return {
          x: Math.random() * w,
          y: initial ? Math.random() * h : h + 10,
          r: ember ? Math.random() * 1.6 + 0.8 : Math.random() * 1.1 + 0.3,
          vy: -(Math.random() * 0.35 + 0.08) * (ember ? 1.4 : 1),
          vx: (Math.random() - 0.5) * 0.15,
          a: Math.random() * 0.5 + (ember ? 0.35 : 0.15),
          tw: Math.random() * Math.PI * 2,
          ember,
        };
      };

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(clamp((w * h) / 26000, 18, w < 700 ? 30 : 64));
        particles = Array.from({ length: count }, () => spawn(true));
      };

      const draw = () => {
        pRaf = 0;
        if (!heroVisible || document.hidden || reduceMotion) return;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx + pointer.x * -0.25;
          p.y += p.vy;
          p.tw += 0.02;
          if (p.y < -10 || p.x < -10 || p.x > w + 10) particles[i] = spawn(false);
          const alpha = p.a * (0.6 + Math.sin(p.tw) * 0.4) * clamp(p.y / (h * 0.35), 0, 1);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.ember ? `rgba(255,150,70,${alpha})` : `rgba(210,220,255,${alpha * 0.8})`;
          ctx.fill();
        }
        pRaf = requestAnimationFrame(draw);
      };
      const startParticles = () => {
        if (!pRaf) pRaf = requestAnimationFrame(draw);
      };

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
      });
      document.addEventListener('visibilitychange', () => !document.hidden && startParticles());
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => entry.isIntersecting && startParticles()).observe(hero);
      }
      // Particles are pure decoration: start them once the page has settled.
      const boot = () => {
        resize();
        canvas.classList.add('is-ready');
        startParticles();
      };
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      window.addEventListener('load', () => setTimeout(() => idle(boot, { timeout: 2000 }), 1200), { once: true });
    }
  }

  /* ── Subtle element parallax (non-hero) ───────────────────────────────── */

  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    let pTick = false;
    const update = () => {
      pTick = false;
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const offset = (r.top + r.height / 2 - vh / 2) * (Number(el.dataset.parallax) || 0.05);
        el.style.transform = `translate3d(0, ${(-offset).toFixed(2)}px, 0)`;
      });
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!pTick) {
          pTick = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  }

  /* ── 3D tilt + pointer glow on cards ──────────────────────────────────── */

  $$('[data-tilt]').forEach((card) => {
    const max = card.classList.contains('game-card--featured') ? 3 : 6;
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      if (!finePointer()) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        card.dataset.tilting = '';
        card.style.transform = `perspective(1000px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg) translateY(-6px)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      raf = 0;
      delete card.dataset.tilting;
      card.style.transform = '';
    });
  });

  /* ── Magnetic buttons ─────────────────────────────────────────────────── */

  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      if (!finePointer()) return;
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.setProperty('--btn-x', `${x.toFixed(1)}px`);
      btn.style.setProperty('--btn-y', `${y.toFixed(1)}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--btn-x', '0px');
      btn.style.setProperty('--btn-y', '0px');
    });
  });

  /* ── Custom cursor (desktop, fine pointer only) ───────────────────────── */

  if (finePointer()) {
    const ring = document.createElement('div');
    const dot = document.createElement('div');
    ring.className = 'cursor';
    dot.className = 'cursor-dot';
    ring.setAttribute('aria-hidden', 'true');
    dot.setAttribute('aria-hidden', 'true');
    body.append(ring, dot);
    const pos = { x: -100, y: -100, rx: -100, ry: -100 };
    let cRaf = 0;
    const loop = () => {
      pos.rx = lerp(pos.rx, pos.x, 0.2);
      pos.ry = lerp(pos.ry, pos.y, 0.2);
      ring.style.transform = `translate3d(${pos.rx.toFixed(1)}px, ${pos.ry.toFixed(1)}px, 0)`;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      cRaf = Math.abs(pos.rx - pos.x) + Math.abs(pos.ry - pos.y) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const interactive = 'a, button, [data-tilt], input, textarea, label';
    document.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        pos.x = e.clientX;
        pos.y = e.clientY;
        ring.classList.add('is-active');
        dot.classList.add('is-active');
        ring.classList.toggle('is-hover', !!e.target.closest?.(interactive));
        if (!cRaf) cRaf = requestAnimationFrame(loop);
      },
      { passive: true },
    );
    document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    document.addEventListener('pointerup', () => ring.classList.remove('is-down'));
    doc.addEventListener('pointerleave', () => {
      ring.classList.remove('is-active');
      dot.classList.remove('is-active');
    });
  }

  /* ── Day / night theme ─────────────────────────────────────────────────── */

  const themeBtn = $('[data-theme-toggle]');
  const themeMeta = $('meta[name="theme-color"]');
  const syncTheme = () => {
    const light = doc.dataset.theme === 'light';
    themeBtn?.setAttribute('aria-label', light ? 'Switch to night mode' : 'Switch to day mode');
    themeBtn?.setAttribute('aria-pressed', String(light));
    themeMeta?.setAttribute('content', light ? '#eef1f6' : '#05070d');
  };
  syncTheme();
  themeBtn?.addEventListener('click', () => {
    const next = doc.dataset.theme === 'light' ? 'dark' : 'light';
    const apply = () => {
      doc.dataset.theme = next;
      syncTheme();
      try {
        localStorage.setItem('theme', next);
      } catch {}
    };
    if (!document.startViewTransition || reduceMotion) return apply();
    const r = themeBtn.getBoundingClientRect();
    doc.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
    doc.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
    doc.classList.add('theme-vt');
    document.startViewTransition(apply).finished.finally(() => doc.classList.remove('theme-vt'));
  });

  /* ── Web games: vertical video carousel ───────────────────────────────── */

  const wg = $('[data-wg]');
  if (wg) {
    const cards = $$('[data-wg-card]', wg);
    const stage = $('[data-wg-stage]', wg);
    const rail = $$('[data-wg-go]', wg);
    const detail = $('[data-wg-detail]');
    let data = [];
    try {
      data = JSON.parse($('#wg-data')?.textContent || '[]');
    } catch {}
    const n = cards.length;
    const INTERVAL = 7;
    let active = 0;
    let inView = false;
    let hovering = false;
    wg.style.setProperty('--wg-interval', `${INTERVAL}s`);

    const offset = (i) => {
      let d = i - active;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      return d;
    };
    const pad = (v) => String(v).padStart(2, '0');

    // Attach sources lazily; the browser picks WebM (VP9) or MP4 (H.264).
    const load = (v) => {
      if (!v || v.dataset.loaded) return;
      v.dataset.loaded = '1';
      v.innerHTML = `<source src="${v.dataset.webm}" type="video/webm"><source src="${v.dataset.mp4}" type="video/mp4">`;
      v.load();
    };
    const playVideo = (card, on) => {
      const v = $('video', card);
      if (!v) return;
      if (on) {
        load(v);
        const p = v.play();
        p?.then(() => v.classList.add('is-playing')).catch(() => {});
      } else {
        v.pause();
        v.classList.remove('is-playing');
      }
    };

    const updateDetail = () => {
      const g = data[active];
      if (!g || !detail) return;
      const swap = () => {
        $('[data-wg-index]', detail).textContent = pad(active + 1);
        $('[data-wg-title]', detail).textContent = g.title;
        $('[data-wg-tags]', detail).innerHTML = g.tags.map((t) => `<li>${t.replace(/</g, '&lt;')}</li>`).join('');
        $('[data-wg-desc]', detail).textContent = g.description;
        const link = $('a[data-wg-play]', detail);
        const soon = $('button[data-wg-play]', detail);
        link.hidden = !g.url;
        soon.hidden = !!g.url;
        if (g.url) link.href = g.url;
        detail.classList.remove('is-swapping');
      };
      if (reduceMotion) return swap();
      detail.classList.add('is-swapping');
      setTimeout(swap, 260);
    };

    const render = () => {
      cards.forEach((card, i) => {
        const d = offset(i);
        const ad = Math.abs(d);
        card.style.setProperty('--d', d);
        card.style.setProperty('--ad', ad);
        card.classList.toggle('is-active', d === 0);
        card.classList.toggle('is-far', ad > 2);
        card.classList.remove('is-timing');
        card.setAttribute('aria-hidden', String(d !== 0));
        // Preload neighbours' clips; play only the active one.
        const v = $('video', card);
        if (ad === 1 && inView && !reduceMotion) load(v);
        playVideo(card, d === 0 && inView && !reduceMotion);
      });
      rail.forEach((b, i) => (i === active ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
      const current = cards[active];
      if (!reduceMotion && inView) {
        void current.offsetWidth; // restart the progress animation
        current.classList.add('is-timing');
      }
    };

    const go = (i, announce = true) => {
      active = (i + n) % n;
      render();
      if (announce) updateDetail();
    };
    const next = () => go(active + 1);
    const prev = () => go(active - 1);

    $('[data-wg-next]')?.addEventListener('click', next);
    $('[data-wg-prev]')?.addEventListener('click', prev);
    rail.forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.wgGo))));

    // Auto-advance when the progress bar finishes.
    wg.addEventListener('animationend', (e) => {
      if (e.animationName === 'wg-progress') next();
    });
    const setPaused = () => wg.classList.toggle('is-paused', hovering || !inView || document.hidden);
    wg.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') {
        hovering = true;
        setPaused();
      }
    });
    wg.addEventListener('pointerleave', () => {
      hovering = false;
      setPaused();
    });
    document.addEventListener('visibilitychange', setPaused);

    wg.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        prev();
      }
    });

    // Click a side card to bring it forward; click the active one to play.
    cards.forEach((card, i) =>
      card.addEventListener('click', () => {
        if (dragged) return;
        if (i !== active) return go(i);
        const url = data[i]?.url;
        if (url) window.open(url, '_blank', 'noopener');
      }),
    );

    // Swipe / drag: vertical on mouse, either axis on touch.
    let startX = 0;
    let startY = 0;
    let dragging = false;
    let dragged = false;
    stage.addEventListener('pointerdown', (e) => {
      dragging = true;
      dragged = false;
      startX = e.clientX;
      startY = e.clientY;
      stage.classList.add('is-dragging');
    });
    window.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const delta = Math.abs(dy) >= Math.abs(dx) ? dy : e.pointerType === 'mouse' ? 0 : dx;
      if (Math.abs(delta) > 40) {
        dragged = true;
        delta < 0 ? next() : prev();
        setTimeout(() => (dragged = false), 50);
      }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          setPaused();
          render();
        },
        { threshold: 0.35 },
      ).observe(wg);
    }
    go(0, false);
  }

  /* ── Motion layer: GSAP + ScrollTrigger + SplitText + Lenis ───────────── */

  if (useGsap) {
    const { ScrollTrigger, SplitText } = window;
    gsap.registerPlugin(ScrollTrigger);
    if (SplitText) gsap.registerPlugin(SplitText);

    // Smooth, inertial scrolling (keeps native scroll position & a11y).
    if (window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.09, anchors: { offset: -72 }, autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Hero headline: characters rise in with a 3D flip.
    // (Desktop only — phones get the lighter CSS intro so text paints sooner.)
    const heroLines = $$('.hero__line > span');
    const heroTitle = $('.hero__title');
    if (SplitText && heroLines.length && doc.classList.contains('split-hero')) {
      heroTitle.setAttribute('aria-label', heroTitle.textContent.replace(/\s+/g, ' ').trim());
      heroLines.forEach((l) => l.setAttribute('aria-hidden', 'true'));
      const split = new SplitText(heroLines, { type: 'words,chars', aria: 'none' });
      gsap.set(heroLines, { opacity: 1 });
      gsap.from(split.chars, {
        yPercent: 115,
        rotateX: -90,
        opacity: 0,
        transformOrigin: '50% 100% -20px',
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.022,
        delay: 0.25,
      });
    }

    // Hero scene drifts and zooms as you scroll away.
    const scene = $('[data-hero-scene]');
    if (scene) {
      gsap.to(scene, {
        scale: 1.14,
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // Marquee: endless loop that speeds up and flips with scroll velocity.
    const track = $('[data-marquee]');
    if (track) {
      const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
      let dir = 1;
      ScrollTrigger.create({
        onUpdate(self) {
          dir = self.direction;
          const boost = clamp(Math.abs(self.getVelocity()) / 250, 0, 6);
          gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.25, overwrite: true });
          gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.25, ease: 'power2.out' });
        },
      });
    }

    // Section headings: words slide up from a mask.
    if (SplitText) {
      $$('main h2').forEach((h) => {
        if (h.closest('.hero')) return;
        const split = new SplitText(h, { type: 'lines,words', linesClass: 'split-line', aria: 'auto' });
        gsap.from(split.words, {
          yPercent: 110,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.06,
          scrollTrigger: { trigger: h, start: 'top 88%' },
        });
      });
    }

    // Everything marked .reveal enters in staggered batches.
    gsap.set(reveals, { autoAlpha: 0, y: 60 });
    ScrollTrigger.batch(reveals, {
      start: 'top 90%',
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.12,
          onComplete() {
            batch.forEach((el) => el.classList.add('is-visible', 'is-done'));
            gsap.set(batch, { clearProps: 'transform,opacity,visibility' });
          },
        }),
    });

    // Artwork drifts inside its frame (parallax) while scrolling.
    $$('.game-card__media picture, .post-card__media picture, .about__frame picture').forEach((pic) => {
      gsap.fromTo(
        pic,
        { yPercent: -6, scale: 1.14 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: pic.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });

    // About photo opens like a shutter.
    const frame = $('.about__frame');
    if (frame) {
      gsap.from(frame, {
        clipPath: 'inset(18% 18% 18% 18% round 24px)',
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: frame, start: 'top 80%' },
      });
    }

    // Devlog timeline draws itself.
    $$('.timeline:not(.timeline--full)').forEach((tl) => {
      gsap.fromTo(tl, { '--line': 0 }, { '--line': 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 85%', end: 'bottom 60%', scrub: true } });
    });

    // Carousel stage tilts in as it arrives.
    const stageEl = $('[data-wg-stage]');
    if (stageEl) {
      gsap.from(stageEl, {
        rotateX: 18,
        y: 120,
        opacity: 0,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: stageEl, start: 'top 85%' },
      });
    }

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ── Contact form ─────────────────────────────────────────────────────── */

  const form = $('[data-contact-form]');
  if (form) {
    const status = $('[data-form-status]', form);
    const submit = $('button[type="submit"]', form);
    const label = $('.btn__label', submit);
    const endpoint = form.dataset.endpoint;
    const email = form.dataset.email;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setError = (field, message) => {
      const wrap = field.closest('.field');
      const err = $('.field__error', wrap);
      wrap.classList.toggle('is-invalid', !!message);
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message) field.setAttribute('aria-describedby', err.id);
      else field.removeAttribute('aria-describedby');
      err.textContent = message || '';
    };

    const validate = () => {
      const { name, email: from, message } = form.elements;
      let firstInvalid = null;
      const checks = [
        [name, name.value.trim().length >= 2 ? '' : 'Please enter your name.'],
        [from, emailRe.test(from.value.trim()) ? '' : 'Please enter a valid email address.'],
        [message, message.value.trim().length >= 10 ? '' : 'Please write a message (at least 10 characters).'],
      ];
      checks.forEach(([field, msg]) => {
        setError(field, msg);
        if (msg && !firstInvalid) firstInvalid = field;
      });
      return firstInvalid;
    };

    $$('input, textarea', form).forEach((field) =>
      field.addEventListener('input', () => field.closest('.field')?.classList.contains('is-invalid') && validate()),
    );

    const setStatus = (msg, type) => {
      status.textContent = msg;
      status.className = `contact-form__status${type ? ` is-${type}` : ''}`;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const invalid = validate();
      if (invalid) {
        invalid.focus();
        return;
      }
      if (form.elements._gotcha?.value) return; // bot

      const data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
      };

      if (endpoint) {
        submit.disabled = true;
        label.textContent = 'Sending…';
        setStatus('', '');
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...data, _subject: `Portfolio message from ${data.name}` }),
          });
          if (!res.ok) throw new Error(String(res.status));
          form.reset();
          setStatus('Thanks! Your message has been sent — I’ll get back to you soon.', 'success');
        } catch {
          setStatus(
            email ? `Something went wrong. Please email me directly at ${email}.` : 'Something went wrong. Please try again in a moment.',
            'error',
          );
        } finally {
          submit.disabled = false;
          label.textContent = 'Send Message';
        }
        return;
      }

      if (email) {
        const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
        const bodyText = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${bodyText}`;
        setStatus('Your email app should open with the message ready to send.', 'success');
        return;
      }

      setStatus('The contact form isn’t connected yet. Please reach out via the social links.', 'error');
    });
  }
})();
