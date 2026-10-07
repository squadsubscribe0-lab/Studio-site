"""Record deterministic gameplay preview videos for CrazyGames.

Needs the game served at http://localhost:8765 (python -m http.server 8765 in the repo root).
Drives the real game loop frame by frame with scripted inputs from autoplay.js,
screenshots every frame, then encodes H.264 MP4s with ffmpeg (<= 20 s each).
"""
import os, shutil, subprocess, sys
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
URL = "http://localhost:8765/index.html"
FPS = 30
STEPS_PER_FRAME = 2  # game runs at 60 Hz

# (plan name, sim steps to fast-forward before filming, frames to hold after the clear)
CLIPS = [
    ("lendAHead", 70, 16),
    ("trueColors", 50, 16),
    ("goingUp", 170, 30),
]
FORMATS = {
    "landscape": (1280, 720),
    "portrait": (720, 1280),
}

# Freeze the game's own rAF loop so only we advance time.
INIT = "window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};"

SETUP = """async (name)=>{
  if(!window.AUTO){eval(await (await fetch('/marketing/autoplay.js')).text());}
  const c=AUTO.PLANS[name];N=c.N;startLevel(c.idx);FX=[];
  window.__nx=AUTO.runner(c.plan());
}"""
FFWD = """(n)=>{for(let k=0;k<n&&mode==='play';k++){const r=__nx();step(STEP,r.inp);}updateCamera(0,true);}"""
FRAME = """([spf,dt])=>{
  for(let k=0;k<spf;k++){if(mode!=='play')break;const r=__nx();step(STEP,r.inp);}
  render(dt);if(mode==='play')updateHud();
  // focus point in CSS px: centre of the buddies still in play (falls back to the door)
  const r=cv.getBoundingClientRect(),k=r.width/cv.width,act=L.players.filter(p=>!p.entered);
  let pts=act.length?act.map(p=>[p.x+p.w/2,p.y+p.h/2]):[[L.door.x+16,L.door.y+32]];
  // buddies far apart: follow whoever has (or is nearest) the key
  const xs=pts.map(p=>p[0]);if(Math.max(...xs)-Math.min(...xs)>(window.__spread||1e9)&&L.key){const k=L.key,j=k.carrier>=0?L.players[k.carrier]:act.reduce((a,p)=>Math.abs(p.x-k.x)<Math.abs(a.x-k.x)?p:a);pts=[[j.x+j.w/2,j.y+j.h/2]];}
  const wx=pts.reduce((a,p)=>a+p[0],0)/pts.length,wy=pts.reduce((a,p)=>a+p[1],0)/pts.length;
  return [mode,r.left+(wx-L.cam)*scale*k,r.top+(wy+GY)*scale*k,[r.left,r.top,r.width,r.height]];
}"""


ZOOM = {"landscape": 1.7, "portrait": 2.1}


def reframe(frames, focus, size):
    """Virtual camera: zoom in on the buddies, ease back to full frame on the clear card."""
    W, H = size
    n = len(focus)
    # smooth focus with a centred moving average so the camera glides
    # clip id per frame, so smoothing never blends across a cut
    seg, s = [], 0
    for i in range(n):
        if i and not focus[i][2] and focus[i - 1][2]:
            s += 1
        seg.append(s)
    sm = []
    for i in range(n):
        a, b = max(0, i - 10), min(n, i + 11)
        while seg[a] != seg[i]:
            a += 1
        while seg[b - 1] != seg[i]:
            b -= 1
        sm.append((sum(f[0] for f in focus[a:b]) / (b - a), sum(f[1] for f in focus[a:b]) / (b - a)))
    z, zoom_in = 1.0, ZOOM[FMT]
    for i in range(n):
        target = 1.0 if focus[i][2] else zoom_in
        z = target if i == 0 or (i > 0 and focus[i][2] is False and focus[i - 1][2]) else z + (target - z) * 0.18
        # largest W:H window inside the game canvas, shrunk by the zoom
        bx, by, bw, bh = focus[i][3]
        fw = min(bw, bh * W / H)
        cw, ch = fw / z, fw * H / W / z
        x = min(max(sm[i][0] - cw / 2, bx), bx + bw - cw)
        y = min(max(sm[i][1] - ch * 0.55, by), by + bh - ch)
        p = os.path.join(frames, f"{i:05d}.jpg")
        im = Image.open(p)
        s = im.width / W
        im.crop((round(x * s), round(y * s), round((x + cw) * s), round((y + ch) * s))).resize((W, H), Image.LANCZOS).save(p, quality=93)


def record(fmt, size):
    global FMT
    FMT = fmt
    frames = os.path.join(OUT, "frames_" + fmt)
    shutil.rmtree(frames, ignore_errors=True)
    os.makedirs(frames)
    n = 0
    focus = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", args=["--autoplay-policy=no-user-gesture-required"])
        pg = b.new_page(viewport={"width": size[0], "height": size[1]}, device_scale_factor=2)
        # keep the CrazyGames SDK out so its local test ads never show up in the footage
        pg.route("**/sdk.crazygames.com/**", lambda r: r.abort())
        pg.add_init_script(INIT)
        pg.goto(URL)
        pg.wait_for_function("typeof startLevel==='function' && !!window.__raf", timeout=20000)
        pg.wait_for_timeout(1500)
        pg.evaluate("(s)=>{document.body.style.background='#9fd0f5';window.__spread=s;}", 200 if fmt == "portrait" else 1e9)
        for name, skip, tail in CLIPS:
            pg.evaluate(SETUP, name)
            pg.evaluate(FFWD, skip)
            held = 0
            while True:
                mode, fx, fy, box = pg.evaluate(FRAME, [STEPS_PER_FRAME, 1 / FPS])
                focus.append((fx, fy, mode != "play", box))
                pg.screenshot(path=os.path.join(frames, f"{n:05d}.jpg"), type="jpeg", quality=92)
                n += 1
                if mode != "play":
                    held += 1
                    if held >= tail:
                        break
                if n > FPS * 25:
                    sys.exit("clip ran too long: " + name)
            print(fmt, name, "->", n, "frames total")
        b.close()
    dur = n / FPS
    print(fmt, "duration", round(dur, 2), "s")
    reframe(frames, focus, size)
    mp4 = os.path.join(OUT, f"preview-{fmt}.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(frames, "%05d.jpg"),
        "-t", "19.9", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "18",
        "-movflags", "+faststart", "-an", mp4,
    ], check=True)
    shutil.rmtree(frames, ignore_errors=True)
    print("wrote", mp4, os.path.getsize(mp4) // 1024, "KB")


if __name__ == "__main__":
    for fmt in (sys.argv[1:] or FORMATS):
        record(fmt, FORMATS[fmt])
