/* Drives synthetic pointer gestures against a real build to check the
   camera invariant and that pinch release never taps an arrow. */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const dir = path.join(__dirname, "dist", "standalone");
const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => errors.push(String(e.detail || e.message)));

function ctxStub(){
  const noop = () => {};
  return new Proxy({canvas:{width:800,height:600}}, {
    get(t,k){ return k in t ? t[k] : noop; }, set(t,k,v){ t[k]=v; return true; }
  });
}

const dom = new JSDOM(fs.readFileSync(path.join(dir,"index.html"),"utf8"), {
  runScripts:"outside-only", pretendToBeVisual:true, virtualConsole:vc, url:"https://example.com/"
});
const { window } = dom;
window.HTMLCanvasElement.prototype.getContext = () => ctxStub();
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};
class G { constructor(){ this.gain={value:0,setValueAtTime(){},linearRampToValueAtTime(){},
  exponentialRampToValueAtTime(){},cancelScheduledValues(){}}; } connect(n){ return n; } }
window.AudioContext = class {
  constructor(){ this.currentTime=0; this.sampleRate=44100; this.state="running"; this.destination={}; }
  createOscillator(){ return { type:"", frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},
    detune:{value:0}, connect(n){ return n; }, start(){}, stop(){} }; }
  createGain(){ return new G(); }
  createBiquadFilter(){ return { type:"", Q:{value:0},
    frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}}, connect(n){ return n; } }; }
  createDelay(){ return { delayTime:{value:0}, connect(n){ return n; } }; }
  createBuffer(c,n){ return { getChannelData:()=>new Float32Array(n) }; }
  createBufferSource(){ return { buffer:null, connect(n){ return n; }, start(){} }; }
  resume(){}
};
Object.defineProperty(window.HTMLElement.prototype,"clientWidth",{get(){ return 800; }});
Object.defineProperty(window.HTMLElement.prototype,"clientHeight",{get(){ return 600; }});
window.requestAnimationFrame = cb => setTimeout(()=>cb(Date.now()),16);

for(const f of ["sdk.js","game.js"]){
  try{ window.eval(fs.readFileSync(path.join(dir,f),"utf8")); }
  catch(e){ errors.push("load "+f+": "+e.message); }
}

const doc = window.document;
const cv = doc.getElementById("cv");
cv.setPointerCapture = () => {};
cv.getBoundingClientRect = () => ({left:0, top:0, width:800, height:600});

function ptr(type, id, x, y){
  const e = new window.Event(type, {bubbles:true});
  e.pointerId = id; e.clientX = x; e.clientY = y;
  cv.dispatchEvent(e);
}
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  doc.getElementById("playBtn").onclick();
  await wait(150);
  const T = window.__TEST__;
  T.goto(20);
  await wait(60);

  const cam = () => T.camera();
  const ok = (label, cond, extra="") =>
    console.log("  " + (cond ? "pass" : "FAIL") + "  " + label + (extra ? "  " + extra : "")) ||
    (cond ? 0 : errors.push(label));

  // --- 1. anchor invariant: the board point under the anchor must not move
  const before = cam();
  const ax = 300, ay = 220;
  const boardBefore = {x:(ax-before.ox)/before.cell, y:(ay-before.oy)/before.cell};
  T.zoomAt(3.4, ax, ay);
  const after = cam();
  const boardAfter = {x:(ax-after.ox)/after.cell, y:(ay-after.oy)/after.cell};
  const drift = Math.hypot(boardBefore.x-boardAfter.x, boardBefore.y-boardAfter.y);
  ok("zoom holds the point under the anchor", drift < 0.02, "drift " + drift.toFixed(4) + " cells");

  // --- 2. clamping
  T.zoomAt(99, 400, 300);
  ok("zoom clamps at max", Math.abs(cam().zoom - 9) < 1e-6, "zoom " + cam().zoom.toFixed(2));
  T.zoomAt(0.01, 400, 300);
  ok("zoom clamps at min (fit)", Math.abs(cam().zoom - 1) < 1e-6, "zoom " + cam().zoom.toFixed(2));

  // --- 3. pinch out then in, and confirm zoom actually tracks the fingers
  ptr("pointerdown", 1, 300, 300);
  ptr("pointerdown", 2, 500, 300);          // 200px apart
  ptr("pointermove", 1, 200, 300);
  ptr("pointermove", 2, 600, 300);          // 400px apart -> 2x
  const pinched = cam().zoom;
  ok("pinch out zooms in", pinched > 1.8 && pinched < 2.2, "zoom " + pinched.toFixed(2));

  ptr("pointermove", 1, 350, 300);
  ptr("pointermove", 2, 450, 300);          // 100px apart -> 0.5x of start
  const squeezed = cam().zoom;
  ok("pinch in zooms back out", squeezed < 1.1, "zoom " + squeezed.toFixed(2));
  ptr("pointerup", 1, 350, 300);
  ptr("pointerup", 2, 450, 300);

  // --- 4. the bug that mattered: releasing a pinch must not tap an arrow
  T.goto(20);
  await wait(60);
  const arrowsBefore = T.state().left;
  const heartsBefore = T.state().hearts;
  ptr("pointerdown", 3, 380, 300);
  ptr("pointerdown", 4, 420, 300);
  ptr("pointermove", 3, 300, 300);
  ptr("pointermove", 4, 500, 300);
  ptr("pointerup", 3, 300, 300);            // first finger up
  ptr("pointerup", 4, 500, 300);            // second finger up -> used to tap
  await wait(40);
  ok("pinch release does not tap an arrow",
     T.state().left === arrowsBefore && T.state().hearts === heartsBefore,
     "arrows " + arrowsBefore + "->" + T.state().left + ", hearts " +
     heartsBefore + "->" + T.state().hearts);

  // --- 5. a drag must not tap either
  const beforeDrag = T.state().left;
  ptr("pointerdown", 5, 400, 300);
  ptr("pointermove", 5, 460, 340);
  ptr("pointerup", 5, 460, 340);
  await wait(30);
  ok("drag pans without tapping", T.state().left === beforeDrag);

  // --- 6. a clean tap still works
  T.goto(1);
  await wait(60);
  T.zoomAt(1, 400, 300);
  const p = T.anyClearable();
  const c = T.cellCentre(p);
  const n0 = T.state().left;
  ptr("pointerdown", 6, c.x, c.y);
  ptr("pointerup", 6, c.x, c.y);
  await wait(30);
  ok("single tap clears an arrow", T.state().left === n0 - 1,
     "arrows " + n0 + "->" + T.state().left);

  // --- 7. animated button zoom settles on target
  T.zoomAt(1, 400, 300);
  T.animateZoom(4);
  await wait(420);
  ok("button zoom animates to target", Math.abs(cam().zoom - 4) < 0.05,
     "zoom " + cam().zoom.toFixed(2));

  // --- 8. instruments rotate per level
  const names = [];
  for(const lvl of [1,2,3,12,13,14]){ T.goto(lvl); await wait(20); names.push(T.instrument()); }
  ok("instrument changes each level", new Set(names.slice(0,3)).size === 3, names.join(", "));
  ok("instrument bank wraps after 12", names[3] === "Koto" && names[4] === "Piano",
     "L12=" + names[3] + " L13=" + names[4]);

  // --- 9. a lost pointerup must not wedge the input layer
  ptr("pointerdown", 7, 400, 300);
  ptr("pointerdown", 8, 500, 300);
  const up = new window.Event("pointerup", {bubbles:true});
  up.pointerId = 7; up.clientX = 400; up.clientY = 300;
  window.dispatchEvent(up);                       // released outside the canvas
  const up2 = new window.Event("pointerup", {bubbles:true});
  up2.pointerId = 8; up2.clientX = 500; up2.clientY = 300;
  window.dispatchEvent(up2);
  await wait(20);
  ok("pointer released off-canvas is cleaned up", T.probe().pts === 0,
     "pts " + T.probe().pts);

  T.goto(1); await wait(60); T.zoomAt(1,400,300);
  const p2 = T.anyClearable(), c2 = T.cellCentre(p2), n2 = T.state().left;
  ptr("pointerdown", 9, c2.x, c2.y);
  ptr("pointerup", 9, c2.x, c2.y);
  await wait(30);
  ok("tapping still works afterwards", T.state().left === n2 - 1);

  console.log("\n" + (errors.length ? errors.length + " FAILURES" : "All camera + audio checks passed."));
  errors.slice(0,10).forEach(e => console.log("  - " + e));
  process.exit(errors.length ? 1 : 0);
})();
