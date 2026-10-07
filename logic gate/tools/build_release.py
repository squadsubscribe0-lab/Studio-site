"""Package Astro War for upload.

    python tools/build_release.py

Writes two zips to dist/:
  astro-war-web.zip      - Playgama and other web portals (Playgama Bridge picks the platform)
  astro-war-youtube.zip  - YouTube Playables (YouTube SDK script tag first in <head>, as required)
"""
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, "astro-war")
DIST = os.path.join(ROOT, "dist")
INCLUDE = ["index.html", "playgama-bridge-config.json", "lib", "fonts", "assets"]
YT_MARKER = re.compile(r"<!-- YT_SDK:.*?-->")
YT_TAG = '<script src="https://www.youtube.com/game_api/v1"></script>'
NAME_OK = re.compile(r"[A-Za-z0-9_.\-]+")      # YouTube: alphanumerics, _ - . only


def game_files():
    for item in INCLUDE:
        path = os.path.join(GAME, item)
        if os.path.isfile(path):
            yield path
        else:
            for folder, _, names in os.walk(path):
                for name in names:
                    yield os.path.join(folder, name)


def build(zip_name, html):
    files = list(game_files())
    bad = [f for f in files if not NAME_OK.fullmatch(os.path.basename(f))]
    if bad:
        sys.exit(f"bad file names: {bad}")
    out = os.path.join(DIST, zip_name)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for f in files:
            rel = os.path.relpath(f, GAME).replace(os.sep, "/")
            if rel == "index.html":
                z.writestr(rel, html)
            else:
                z.write(f, rel)
    raw = sum(os.path.getsize(f) for f in files)
    print(f"{zip_name}: {len(files)} files, {raw / 1e6:.2f} MB unpacked, {os.path.getsize(out) / 1e6:.2f} MB zipped")


def main():
    os.makedirs(DIST, exist_ok=True)
    html = open(os.path.join(GAME, "index.html"), encoding="utf-8").read()
    if not YT_MARKER.search(html):
        sys.exit("YT_SDK marker missing from index.html")
    build("astro-war-web.zip", YT_MARKER.sub("", html, count=1))
    build("astro-war-youtube.zip", YT_MARKER.sub(YT_TAG, html, count=1))


if __name__ == "__main__":
    main()
