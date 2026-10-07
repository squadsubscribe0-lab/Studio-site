/* Loads a real build in jsdom, stubs canvas + audio, and plays through
   levels by clicking arrows. Catches runtime errors the build step can't. */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const BUILD = process.argv[2] || "standalone";
const dir = path.join(__dirname, "dist", BUILD);

function ctxStub(){
  const noop = () => {};
  return new Proxy({
    canvas:{width:800,height:600},
    setTransform:noop, clearRect:noop, drawImage:noop, beginPath:noop,
    moveTo:noop, lineTo:noop, stroke:noop, fill:noop, arc:noop, fillRect:noop,
    save:noop, restore:noop, translate:noop, rotate:noop, scale:noop,
    createLinearGradient:()=>({addColorStop:noop}),
    measureText:()=>({width:10})
  }, {
    get(t,k){ return k in t ? t[k] : (typeof k === "string" ? noop : undefined); },
    set(t,k,v){ t[k]=v; return true; }
  });
}

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => errors.push("jsdomError: " + (e.detail || e.message)));
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const dom = new JSDOM(html, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole: vc,
  url: "https://example.com/"
});
const { window } = dom;

// --- stubs the game needs ---
window.HTMLCanvasElement.prototype.getContext = function(){ return ctxStub(); };
window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
window.HTMLMediaElement.prototype.pause = function(){};
class FakeOsc {
  constructor(){ this.frequency={value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}};
                 this.detune={value:0}; }
  connect(n){ return n; } start(){} stop(){}
}
class FakeGain {
  constructor(){ this.gain={value:0,setValueAtTime(){},linearRampToValueAtTime(){},
                            exponentialRampToValueAtTime(){},cancelScheduledValues(){}}; }
  connect(n){ return n; }
}
window.AudioContext = class {
  constructor(){ this.currentTime=0; this.sampleRate=44100; this.state="running";
                 this.destination={}; }
  createOscillator(){ return new FakeOsc(); }
  createGain(){ return new FakeGain(); }
  createBiquadFilter(){ return { type:"", Q:{value:0},
    frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},
    connect(n){ return n; } }; }
  createDelay(){ return { delayTime:{value:0}, connect(n){ return n; } }; }
  createBuffer(c,n){ return { getChannelData:()=>new Float32Array(n) }; }
  createBufferSource(){ return { buffer:null, connect(n){ return n; }, start(){} }; }
  resume(){}
};
Object.defineProperty(window.HTMLElement.prototype, "clientWidth",  {get(){ return 800; }});
Object.defineProperty(window.HTMLElement.prototype, "clientHeight", {get(){ return 600; }});
window.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 16);
window.cancelAnimationFrame = id => clearTimeout(id);

// --- run the build's own scripts, in order ---
for(const f of ["sdk.js", "game.js"]){
  try{
    window.eval(fs.readFileSync(path.join(dir, f), "utf8"));
  }catch(e){
    errors.push("load " + f + ": " + e.message + "\n" + (e.stack||"").split("\n")[1]);
  }
}

function click(el){
  if(!el) return;
  try{ el.onclick ? el.onclick({target:el, preventDefault(){}}) : el.click(); }
  catch(e){ errors.push("click " + (el.id||"?") + ": " + e.message); }
}

(async () => {
  const doc = window.document;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  click(doc.getElementById("playBtn"));
  await wait(200);

  const G = window.__TEST__;
  if(!G){ errors.push("game did not expose __TEST__ hook"); }
  else {
    let cleared = 0;
    for(const lvl of (process.env.ALL ? Array.from({length:40},(_,i)=>i+1) : [1,7,14,23,31,40])){
      G.goto(lvl);
      await wait(60);
      const total = G.state().total;
      if(!total){ errors.push("level " + lvl + " generated 0 arrows"); continue; }

      // play greedily: keep tapping arrows whose lane is clear
      let guard = 0, taps = 0;
      while(G.state().left > 0 && guard++ < 4000){
        const p = G.anyClearable();
        if(!p) break;
        G.tapPiece(p);
        taps++;
        G.finishAnimations();
      }
      const left = G.state().left;
      if(left > 0) errors.push("level " + lvl + " stuck with " + left + " arrows left");
      else cleared++;
      console.log("  level " + String(lvl).padStart(2) + "  " + G.state().name.padEnd(10) +
                  "  arrows " + String(total).padStart(3) + "  taps " + String(taps).padStart(3) +
                  "  " + (left ? "STUCK" : "cleared"));
    }
    console.log("\n  cleared " + cleared + " levels cleared");
  }

  // exercise the UI paths
  for(const id of ["gearBtn","closeSettings","backBtn","closeLevels",
                   "hintBtn","bombBtn","revealBtn","zoomIn","zoomOut","zoomFit",
                   "soundToggle","musicToggle","zenToggle","hintToggle"]){
    click(doc.getElementById(id));
    await wait(5);
  }
  for(const sel of ["#themeSeg button[data-t='paper']", "#colorSeg button[data-c='random']",
                    "#widthSeg button[data-w='0.24']", "#themeSeg button[data-t='neon']"]){
    const b = doc.querySelector(sel);
    if(b) { try { b.dispatchEvent(new window.MouseEvent("click", {bubbles:true})); }
            catch(e){ errors.push(sel + ": " + e.message); } }
    await wait(5);
  }
  await wait(100);

  console.log("\n" + (errors.length ? "ERRORS (" + errors.length + "):" : "No runtime errors."));
  errors.slice(0, 25).forEach(e => console.log("  - " + e));
  process.exit(errors.length ? 1 : 0);
})();
