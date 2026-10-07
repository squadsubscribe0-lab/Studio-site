#!/usr/bin/env python3
"""
Draws the stand-in birds in assets/birds/.
Replace those files with your own art (same file names) and the game picks
it up with no code changes. Run this again only if you want the
placeholders back:  python3 tools/make_bird_placeholders.py
"""
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "birds")

# id, body, belly, beak, crest
BIRDS = [
    ("bird01", "#6FB3D2", "#DCEEF6", "#F0A73C", "#4E93B2"),
    ("bird02", "#E2846B", "#FBE2D6", "#E8B54A", "#C4614B"),
    ("bird03", "#7FC08A", "#E4F3E2", "#EFA23E", "#5FA06C"),
    ("bird04", "#EFC65B", "#FCF1D2", "#E08A3C", "#D6A63C"),
    ("bird05", "#B3A0DB", "#EDE7F8", "#EFA73C", "#8F79C2"),
    ("bird06", "#F0A7C4", "#FCE5EE", "#E8944A", "#D2809F"),
    ("bird07", "#79C5BC", "#E0F2EF", "#EFA73C", "#57A79E"),
    ("bird08", "#9AA7B8", "#E9EDF2", "#E8A24A", "#7A8899"),
]

EYE = "#2B3330"


def face(expr):
    """eyes + beak + extras for one expression"""
    if expr == "idle":
        return f"""
  <circle cx="26" cy="30" r="3.1" fill="{EYE}"/>
  <circle cx="40" cy="30" r="3.1" fill="{EYE}"/>
  <circle cx="27.1" cy="29" r="1.05" fill="#fff"/>
  <circle cx="41.1" cy="29" r="1.05" fill="#fff"/>
  <path d="M33 34 l5 4 -5 4 -5 -4 z" fill="{{beak}}"/>"""
    if expr == "happy":
        return f"""
  <path d="M22.5 30.5 q3.5 -4 7 0" fill="none" stroke="{EYE}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M36.5 30.5 q3.5 -4 7 0" fill="none" stroke="{EYE}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M33 34 l5.5 3.5 -5.5 6 -5.5 -6 z" fill="{{beak}}"/>
  <circle cx="19" cy="35" r="3.4" fill="#F49BA6" opacity=".55"/>
  <circle cx="47" cy="35" r="3.4" fill="#F49BA6" opacity=".55"/>"""
    # oops
    return f"""
  <circle cx="26" cy="29.5" r="4.2" fill="#fff"/>
  <circle cx="40" cy="29.5" r="4.2" fill="#fff"/>
  <circle cx="26" cy="29.8" r="2.3" fill="{EYE}"/>
  <circle cx="40" cy="29.8" r="2.3" fill="{EYE}"/>
  <path d="M30 37 q3 -2.5 6 0 q-3 5 -6 0 z" fill="{{beak}}"/>"""


def svg(bird, expr):
    bid, body, belly, beak, crest = bird
    tilt = {"idle": 0, "happy": -4, "oops": 5}[expr]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 66" width="66" height="66">
<g transform="rotate({tilt} 33 36)">
  <path d="M33 8 q3 -5 6 -5 q-1 4 -3 6" fill="{crest}"/>
  <ellipse cx="33" cy="34" rx="21" ry="20" fill="{body}"/>
  <ellipse cx="33" cy="40" rx="13" ry="12" fill="{belly}"/>
  <path d="M12 34 q-6 6 -1 12 q6 -1 8 -7 z" fill="{crest}"/>
  <path d="M54 34 q6 6 1 12 q-6 -1 -8 -7 z" fill="{crest}"/>
  <path d="M26 55 l-3 5 M40 55 l3 5" stroke="{beak}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
{face(expr).replace('{beak}', beak)}
</g>
</svg>
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    for bird in BIRDS:
        for expr in ("idle", "happy", "oops"):
            path = os.path.join(OUT, f"{bird[0]}_{expr}.svg")
            with open(path, "w", encoding="utf-8") as f:
                f.write(svg(bird, expr))
    print(f"wrote {len(BIRDS) * 3} files to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main()
