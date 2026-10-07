"""Slice the AI-generated UI sheets in assets/UI into individual transparent WebP sprites.

Usage: python tools/slice_ui.py
Sheets are identified by filename order (oldest first): icons, skills, kit, bars, logo,
and optionally a 6th sheet with the new power icons (skills2).
"""
import glob
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'UI')
OUT = os.path.join(ROOT, 'src', 'assets', 'ui')
INK = (27, 16, 64)
# Sample bars are only used to locate parts; fills are drawn in CSS.
SKIP = {'bar_green', 'bar_yellow', 'bar_purple', 'bar_red'}
MAGENTA = np.array([246, 3, 251], np.float32)

NAMES = {
    'icons': [
        'coin', 'gem', 'shard', 'star', 'heart', 'power',
        'fist', 'shield', 'chest', 'car', 'settings', 'lock',
        'paw', 'tree', 'battle', 'bag', 'ring', 'skull',
        'gloves', 'helmet', 'armor', 'belt', 'pants', 'shoes',
        'ad', 'speed', 'sound', 'mute', 'close', 'up',
    ],
    'skills': [
        'skill_dmg', 'skill_rate', 'skill_range', 'skill_arm',
        'skill_hp', 'skill_burn', 'skill_chain', 'skill_slam',
        'skill_crit', 'skill_leech', 'skill_magnet', 'skill_splash',
    ],
    'kit': [
        'btn_green', 'btn_orange', 'btn_purple', 'btn_blue', 'btn_red', 'btn_grey',
        'panel', 'well',
        'ribbon',
        'btn_square', 'dot', 'check', 'hex', 'pill',
    ],
    # Optional 6th sheet: icons for the level-up powers added later (3 x 2 grid).
    'skills2': [
        'skill_boomerang', 'skill_whirl', 'skill_shield',
        'skill_clone', 'skill_rage', 'skill_uppercut',
    ],
    'bars': [
        'bar_track', 'bar_green', 'bar_yellow', 'bar_purple', 'bar_red',
        'slot_0', 'slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_empty',
        'card', 'tab_off', 'tab_on', 'tag',
    ],
}


# ---------- helpers ----------
def runs(mask, min_gap, min_len=1):
    idx = np.flatnonzero(mask)
    if not len(idx):
        return []
    out, s, p = [], idx[0], idx[0]
    for i in idx[1:]:
        if i - p > min_gap:
            if p - s + 1 >= min_len:
                out.append((s, p + 1))
            s = i
        p = i
    if p - s + 1 >= min_len:
        out.append((s, p + 1))
    return out


def find_boxes(fg, min_gap=6, min_size=30):
    """Row bands first, then column runs inside each band -> row-major boxes."""
    res = []
    for y0, y1 in runs(fg.any(1), min_gap, min_size):
        band = fg[y0:y1]
        for x0, x1 in runs(band.any(0), min_gap, min_size):
            ys = runs(band[:, x0:x1].any(1), 1)
            res.append((int(x0), int(y0 + ys[0][0]), int(x1), int(y0 + ys[-1][1])))
    return res


def dilate(mask, r):
    img = Image.fromarray((mask * 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.MaxFilter(2 * r + 1))) > 127


def flood_region(similar, seeds):
    # .copy(): fromarray images share the numpy buffer and ignore in-place pixel writes.
    m = Image.fromarray((similar * 255).astype(np.uint8)).copy()
    for s in seeds:
        if m.getpixel(s) == 255:
            ImageDraw.floodfill(m, s, 128)
    return np.asarray(m) == 128


def border_seeds(w, h, step=24):
    pts = [(x, 0) for x in range(0, w, step)] + [(x, h - 1) for x in range(0, w, step)]
    pts += [(0, y) for y in range(0, h, step)] + [(w - 1, y) for y in range(0, h, step)]
    return pts


def unmix(rgb, alpha, bg):
    """Remove background color bleeding from semi-transparent edge pixels."""
    a = np.clip(alpha, 1e-3, 1)[..., None]
    return np.clip((rgb - (1 - a) * bg) / a, 0, 255)


def key_magenta(img):
    rgb = np.asarray(img.convert('RGB')).astype(np.float32)
    d = np.sqrt(((rgb - MAGENTA) ** 2).sum(-1))
    h, w = d.shape
    region = flood_region(d < 120, border_seeds(w, h)) | (d < 70)
    band = dilate(region, 3) & ~region
    alpha = np.ones((h, w), np.float32)
    alpha[region] = 0
    alpha[band] = np.clip((d[band] - 40) / 100, 0, 1)
    out = unmix(rgb, alpha, MAGENTA)
    return np.dstack([out, alpha * 255]).astype(np.uint8)


def drop_specks(arr, keep_ratio=0.03):
    """Remove small disconnected blobs (tile-edge residue) by labelling alpha components."""
    solid = (arr[..., 3] > 40).astype(np.uint8) * 255
    lab = Image.fromarray(solid).copy()
    sizes = {}
    label = 1
    while True:
        ys, xs = np.nonzero(np.asarray(lab) == 255)
        if not len(ys) or label > 250:
            break
        ImageDraw.floodfill(lab, (int(xs[0]), int(ys[0])), label)
        sizes[label] = int((np.asarray(lab) == label).sum())
        label += 1
    if not sizes:
        return arr
    biggest = max(sizes.values())
    keep_labels = [k for k, v in sizes.items() if v >= biggest * keep_ratio]
    L = np.asarray(lab)
    keep = dilate(np.isin(L, keep_labels), 2)
    out = arr.copy()
    out[..., 3] = np.where(keep, out[..., 3], 0)
    return out


def crop_alpha(arr, pad=4):
    ys, xs = np.nonzero(arr[..., 3] > 12)
    y0, y1 = max(0, ys.min() - pad), min(arr.shape[0], ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(arr.shape[1], xs.max() + pad + 1)
    return arr[y0:y1, x0:x1]


def add_outline(arr, r):
    """Put a solid ink silhouette (dilated alpha) under the sprite."""
    h, w = arr.shape[:2]
    big = np.zeros((h + 2 * r, w + 2 * r, 4), np.uint8)
    big[r:r + h, r:r + w] = arr
    a = Image.fromarray(big[..., 3]).filter(ImageFilter.MaxFilter(2 * r + 1))
    a = np.asarray(a.filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255
    base = np.zeros_like(big, np.float32)
    base[..., :3] = INK
    base[..., 3] = a * 255
    fa = big[..., 3:4].astype(np.float32) / 255
    rgb = big[..., :3] * fa + base[..., :3] * (1 - fa)
    alpha = np.maximum(big[..., 3], base[..., 3])
    return np.dstack([rgb, alpha]).astype(np.uint8)


def save(arr, name, max_side=None):
    img = Image.fromarray(arr)
    if max_side and max(img.size) > max_side:
        k = max_side / max(img.size)
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    img.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=92, alpha_quality=100, method=6)
    return img.size


# ---------- sheets ----------
def slice_icons(path, manifest):
    arr = np.asarray(Image.open(path).convert('RGBA')).astype(np.float32)
    rgb, alpha = arr[..., :3], arr[..., 3]
    tiles = find_boxes(alpha > 150, min_gap=3, min_size=80)
    tiles = [t for t in tiles if (t[2] - t[0]) > 120 and (t[3] - t[1]) > 120]
    assert len(tiles) == 30, f'expected 30 icon tiles, got {len(tiles)}'
    for (x0, y0, x1, y1), name in zip(tiles, NAMES['icons']):
        m = 6
        X0, Y0, X1, Y1 = max(0, x0 - m), max(0, y0 - m), x1 + m, y1 + m
        c_rgb, c_a = rgb[Y0:Y1, X0:X1], alpha[Y0:Y1, X0:X1]
        h, w = c_a.shape
        # Tile color from a ring just inside the tile edge.
        ring = np.zeros((h, w), bool)
        ring[m + 18:m + 28, m + 24:w - m - 24] = True
        ring[h - m - 28:h - m - 18, m + 24:w - m - 24] = True
        tile_col = np.median(c_rgb[ring & (c_a > 200)], axis=0)
        d = np.sqrt(((c_rgb - tile_col) ** 2).sum(-1))
        similar = (d < 48) | (c_a < 200)
        region = flood_region(similar, border_seeds(w, h, 8) + [(m + 8, m + 8), (w - m - 9, m + 8), (m + 8, h - m - 9), (w - m - 9, h - m - 9)])
        # Enclosed holes (gear centre, triangle inside the talent icon) that are pure tile colour.
        region |= d < 16
        band = dilate(region, 2) & ~region
        a = c_a / 255
        a = np.where(region, 0, a)
        a = np.where(band, a * np.clip((d - 24) / 50, 0, 1), a)
        out = np.dstack([c_rgb, a * 255]).astype(np.uint8)
        out = crop_alpha(drop_specks(out), 2)
        # Uniform ink outline so icons match the rest of the kit.
        scale = 160 / max(out.shape[:2])
        out = add_outline(out, max(3, round(5 / scale)))
        manifest[name] = save(out, name, 160)


def slice_keyed(path, key, manifest, max_side, min_gap=6):
    keyed = key_magenta(Image.open(path))
    boxes = find_boxes(keyed[..., 3] > 40, min_gap=min_gap, min_size=24)
    names = NAMES[key]
    assert len(boxes) == len(names), f'{key}: expected {len(names)} parts, got {len(boxes)}: {boxes}'
    parts = {}
    for (x0, y0, x1, y1), name in zip(boxes, names):
        crop = crop_alpha(keyed[y0:y1, x0:x1], 3)
        parts[name] = crop
        if name in SKIP:
            continue
        ms = max_side(name) if callable(max_side) else max_side
        manifest[name] = save(crop, name, ms)
    return parts


def main():
    # Only the sheets that are present are (re)sliced; existing sprites are overwritten
    # per file and never wiped up-front, so a missing sheet can't erase shipped art.
    os.makedirs(OUT, exist_ok=True)
    files = sorted(glob.glob(os.path.join(SRC, '*.png')))
    extra = [f for f in files if os.path.basename(f).lower().startswith('zz-skills2')]
    base = [f for f in files if f not in extra]
    if not extra and len(base) >= 6:
        extra = [base[5]]  # legacy: an unnamed 6th sheet is the power icons
    if not base and not extra:
        raise SystemExit(f'No sheets found in {SRC}')

    mpath = os.path.join(OUT, 'manifest.json')
    manifest = {}
    if os.path.exists(mpath):
        with open(mpath) as fh:
            manifest = {k: tuple(v) for k, v in json.load(fh).items()}

    if len(base) >= 5:
        icons, skills, kit, bars, logo = base[:5]
        slice_icons(icons, manifest)
        slice_keyed(skills, 'skills', manifest, 160)
        slice_keyed(kit, 'kit', manifest, lambda n: 900 if n == 'ribbon' else 320)
        slice_keyed(bars, 'bars', manifest, lambda n: 1400 if n.startswith('bar_') else 320)
        lg = crop_alpha(key_magenta(Image.open(logo)), 4)
        manifest['logo'] = save(lg, 'logo', 900)
    elif base:
        print(f'Skipping base sheets: found {len(base)}, need all 5 (icons, skills, kit, bars, logo).')
    for sheet in extra:
        slice_keyed(sheet, 'skills2', manifest, 160)

    with open(mpath, 'w') as fh:
        json.dump({k: list(v) for k, v in manifest.items()}, fh, indent=1)
    for k, v in manifest.items():
        print(f'{k:14s} {v[0]}x{v[1]}')


if __name__ == '__main__':
    main()
