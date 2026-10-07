/* Shared art direction: the logo, background glow and per-format layouts.
   Colours are sampled from the game's own rainbow ramp. */
"use strict";

const LOGO_CSS = `
#bgfx{position:fixed;inset:0;z-index:0;pointer-events:none}
#app{position:relative;z-index:1}
#logo{position:fixed;z-index:3;font-family:Fredoka,sans-serif;font-weight:700;line-height:.86;
  letter-spacing:.01em;text-transform:uppercase;pointer-events:none}
#logo .w{display:block;white-space:nowrap}
#logo .t{background-clip:text;-webkit-background-clip:text;color:transparent;
  filter:drop-shadow(0 0 .04em rgba(255,255,255,.35)) drop-shadow(0 0 .16em var(--g)) drop-shadow(0 .05em .1em rgba(0,0,0,.6))}
#logo .w1 .t{background-image:linear-gradient(100deg,#6ff3ff 0%,#8f7bff 48%,#ff5cd1 100%);--g:rgba(150,110,255,.75)}
#logo .w2{display:flex;align-items:center;gap:.14em}
#logo .w2 .t{background-image:linear-gradient(100deg,#ff5cd1 0%,#ff7a45 55%,#ffd23f 100%);--g:rgba(255,110,80,.75)}
#logo svg{height:.62em;width:auto;overflow:visible;
  filter:drop-shadow(0 0 .05em rgba(255,255,255,.4)) drop-shadow(0 0 .16em rgba(255,190,60,.8))}
#logo svg path{fill:none;stroke:url(#lg);stroke-width:12;stroke-linecap:round;stroke-linejoin:round}
#logo.one{display:flex;align-items:center;gap:.26em}
`;

// gradientUnits=userSpaceOnUse: a bounding-box gradient on a flat line has
// zero height, which silently makes the shaft stroke invisible
const LOGO_HTML = `<div class="w w1"><span class="t">Arrow</span></div>
<div class="w w2"><span class="t">Out</span>
<svg viewBox="0 0 130 64"><defs><linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="130" y2="0"><stop offset="0" stop-color="#ff7a45"/><stop offset="1" stop-color="#ffd23f"/></linearGradient></defs>
<path d="M8 32H120"/><path d="M96 10 120 32 96 54"/></svg></div>`;

/* stage box, logo placement and glow per layout, in logical px.
   away: direction arrows must NOT point when launched, so none fly into the logo. */
function layoutFor(layout, lw, lh){
  switch(layout){
    case "land": return {stage:{l:lw*0.44, t:0, w:lw*0.55, h:lh}, logo:{l:lw*0.055, t:lh*0.5, fs:lh*0.19, ty:"-50%"}, away:[-1,0],
      glow:`radial-gradient(ellipse 45% 60% at 71% 50%, rgba(141,92,246,.30), transparent 70%),radial-gradient(ellipse 40% 55% at 22% 50%, rgba(255,92,209,.14), transparent 70%)`};
    case "wide": return {stage:{l:lw*0.45, t:0, w:lw*0.53, h:lh}, logo:{l:lw*0.075, t:lh*0.5, fs:lh*0.225, ty:"-50%"}, away:[-1,0],
      glow:`radial-gradient(ellipse 40% 65% at 71% 50%, rgba(141,92,246,.30), transparent 70%),radial-gradient(ellipse 35% 60% at 24% 50%, rgba(255,92,209,.14), transparent 70%)`};
    case "portrait": return {stage:{l:0, t:lh*0.25, w:lw, h:lh*0.75}, logo:{l:lw*0.5, t:lh*0.04, fs:lw*0.18, tx:"-50%"}, away:[0,-1],
      glow:`radial-gradient(ellipse 70% 45% at 50% 62%, rgba(141,92,246,.30), transparent 70%),radial-gradient(ellipse 60% 20% at 50% 12%, rgba(255,92,209,.16), transparent 70%)`};
    case "tall": return {stage:{l:0, t:lh*0.33, w:lw, h:lh*0.6}, logo:{l:lw*0.5, t:lh*0.13, fs:lw*0.18, tx:"-50%"}, away:[0,-1],
      glow:`radial-gradient(ellipse 75% 32% at 50% 63%, rgba(141,92,246,.32), transparent 70%),radial-gradient(ellipse 65% 14% at 50% 23%, rgba(255,92,209,.16), transparent 70%)`};
    case "square": return {stage:{l:lw*0.05, t:lh*0.2, w:lw*0.9, h:lh*0.8}, logo:{l:lw*0.5, t:lh*0.055, fs:lh*0.098, tx:"-50%", one:true}, away:[0,-1],
      glow:`radial-gradient(ellipse 55% 50% at 50% 60%, rgba(141,92,246,.32), transparent 70%),radial-gradient(ellipse 60% 16% at 50% 10%, rgba(255,92,209,.16), transparent 70%)`};
    case "center": return {stage:{l:0, t:0, w:lw, h:lh}, logo:{l:lw*0.5, t:lh*0.5, fs:lh*0.24, tx:"-50%", ty:"-50%"}, away:null,
      glow:`radial-gradient(ellipse 60% 60% at 50% 50%, rgba(141,92,246,.30), transparent 72%)`};
    default: return {stage:{l:0, t:0, w:lw, h:lh}, logo:null, away:null,
      glow:`radial-gradient(ellipse 60% 60% at 50% 50%, rgba(141,92,246,.30), transparent 72%)`};
  }
}

/* Strip the game UI and stage the board as key art. */
async function applyScene(page, {layout, lw, lh, level, zoom, showLogo = true}){
  const L = layoutFor(layout, lw, lh);
  await page.evaluate(({L, css, html, level, zoom, showLogo}) => {
    const st = document.createElement("style");
    st.textContent = css + `
      #loader,#hud,#controls,.overlay,#combo{display:none!important}
      #app{display:block!important;width:100vw;height:100vh}
      #stage{position:fixed!important;left:${L.stage.l}px;top:${L.stage.t}px;width:${L.stage.w}px;height:${L.stage.h}px;
        -webkit-mask-image:linear-gradient(to right,transparent 0,#000 7%,#000 93%,transparent 100%),
                           linear-gradient(to bottom,transparent 0,#000 7%,#000 93%,transparent 100%);
        -webkit-mask-composite:source-in;mask-composite:intersect}
      body{background:#0d111b!important}`;
    document.head.appendChild(st);
    const bg = document.createElement("div"); bg.id = "bgfx"; bg.style.background = L.glow;
    document.body.prepend(bg);
    if (L.logo && showLogo) {
      const lg = document.createElement("div"); lg.id = "logo"; lg.innerHTML = html;
      if (L.logo.one) lg.className = "one";
      Object.assign(lg.style, {left: L.logo.l + "px", top: L.logo.t + "px", fontSize: L.logo.fs + "px",
        transform: `translate(${L.logo.tx || 0},${L.logo.ty || 0})`});
      document.body.appendChild(lg);
    }
    window.__TEST__.goto(level);
    window.dispatchEvent(new Event("resize"));
    if (zoom) { const s = document.getElementById("stage"); window.__TEST__.zoomAt(zoom, s.clientWidth/2, s.clientHeight/2); }
  }, {L, css: LOGO_CSS, html: LOGO_HTML, level, zoom, showLogo});
  return L;
}

module.exports = {LOGO_CSS, LOGO_HTML, layoutFor, applyScene};
