"""Build Beach Volley Clash once per game portal.

Each portal forbids third-party ad code inside the game, so shipping every SDK
in one bundle is not an option: the only compliant approach is one build per
store, each carrying exactly that portal's SDK. This script produces them.

    python build.py                 # every platform in platforms.json
    python build.py poki yandex     # just those
    python build.py --list          # what is configured, and what it needs

For each platform it writes:

    dist/<id>/                      unpacked build, servable as-is
    dist/<id>.zip                   upload-ready, index.html at the zip root

The only file that differs between builds is index.html: the block between the
PLATFORM-SDK markers is replaced with that portal's script tags, plus

    window.__PLATFORM__         = '<id>'
    window.__PLATFORM_OPTIONS__ = { ...ids and placements... }

which src/platform/index.js reads to pick its adapter. Nothing else in the game
changes, so a bug fixed in src/ is fixed for every store at once.
"""

import json
import os
import re
import shutil
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(HERE, 'dist')
CONFIG = os.path.join(HERE, 'platforms.json')

# Only these top-level entries ship. Anything new the game needs at runtime has
# to be added here or it will silently not make the build.
INCLUDE_DIRS = ['src', 'styles', 'vendor', 'assets']
INCLUDE_FILES = ['index.html']

# Development-only clutter, excluded wherever it appears.
SKIP_NAMES = {'.gitkeep', '.gitignore', '.DS_Store', 'Thumbs.db'}
SKIP_EXTS = {'.md', '.py', '.log'}
SKIP_DIRS = {'node_modules', '.git', '__pycache__', 'server', 'dist'}

START = '<!-- PLATFORM-SDK:START -->'
END = '<!-- PLATFORM-SDK:END -->'

TOKEN = re.compile(r'\{\{([A-Z0-9_]+)\}\}')


def should_skip(name):
    if name in SKIP_NAMES:
        return True
    return os.path.splitext(name)[1].lower() in SKIP_EXTS


def substitute(value, credentials, missing):
    """Replace {{TOKEN}} anywhere in a nested JSON structure.

    An unset credential is left as the literal placeholder rather than an empty
    string: a build that is missing its game id should look obviously wrong in
    the browser console, not quietly serve zero ads.
    """
    if isinstance(value, str):
        def repl(m):
            key = m.group(1)
            val = credentials.get(key, '')
            if not val:
                missing.add(key)
                return m.group(0)
            return val
        return TOKEN.sub(repl, value)
    if isinstance(value, list):
        return [substitute(v, credentials, missing) for v in value]
    if isinstance(value, dict):
        return {k: substitute(v, credentials, missing) for k, v in value.items()}
    return value


def render_head(platform, credentials, missing):
    """The replacement for the PLATFORM-SDK block."""
    head = substitute(platform.get('head', []), credentials, missing)
    options = substitute(platform.get('options', {}), credentials, missing)

    lines = [START]
    lines.append('<!-- {} -->'.format(platform['label']))
    # The selector runs at module-evaluation time, so both globals have to be
    # set by a classic script that executes before src/main.js is fetched.
    lines.append('<script>')
    lines.append('  window.__PLATFORM__ = {};'.format(json.dumps(platform['id'])))
    lines.append('  window.__PLATFORM_OPTIONS__ = {};'.format(json.dumps(options)))
    lines.append('</script>')
    lines.extend(head)
    lines.append(END)
    return '\n'.join(lines)


def write_index(src_html, out_path, platform, credentials, missing):
    start = src_html.find(START)
    end = src_html.find(END)
    if start == -1 or end == -1:
        raise SystemExit('index.html is missing the PLATFORM-SDK markers')
    patched = src_html[:start] + render_head(platform, credentials, missing) + src_html[end + len(END):]
    with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(patched)


def copy_tree(out_dir):
    for d in INCLUDE_DIRS:
        root_dir = os.path.join(HERE, d)
        if not os.path.isdir(root_dir):
            continue
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
            for name in sorted(files):
                if should_skip(name):
                    continue
                full = os.path.join(root, name)
                rel = os.path.relpath(full, HERE)
                dest = os.path.join(out_dir, rel)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                shutil.copy2(full, dest)


def zip_dir(out_dir, zip_path):
    if os.path.exists(zip_path):
        os.remove(zip_path)
    count = 0
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for root, dirs, files in os.walk(out_dir):
            dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
            for name in sorted(files):
                full = os.path.join(root, name)
                rel = os.path.relpath(full, out_dir).replace(os.sep, '/')
                z.write(full, rel)
                count += 1
        if 'index.html' not in z.namelist():
            raise SystemExit('index.html is not at the zip root - portals reject this')
    return count


def build(platform, credentials, src_html):
    pid = platform['id']
    out_dir = os.path.join(DIST, pid)
    if os.path.exists(out_dir):
        shutil.rmtree(out_dir)
    os.makedirs(out_dir)

    missing = set()
    copy_tree(out_dir)
    write_index(src_html, os.path.join(out_dir, 'index.html'), platform, credentials, missing)

    # Portals like Playgama read a sidecar config file next to index.html.
    for name, content in substitute(platform.get('extraFiles', {}), credentials, missing).items():
        path = os.path.join(out_dir, name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            if isinstance(content, str):
                f.write(content)
            else:
                json.dump(content, f, indent=2)

    zip_path = os.path.join(DIST, pid + '.zip')
    files = zip_dir(out_dir, zip_path)
    size = os.path.getsize(zip_path)

    print('  {:<18} {:>3} files  {:>6.2f} MB  dist/{}.zip'.format(
        platform['label'][:18], files, size / 1024 / 1024, pid))
    for key in sorted(missing):
        print('      ! credential {} is not set - fill it in platforms.json and rebuild'.format(key))
    return {'id': pid, 'files': files, 'bytes': size, 'missing': sorted(missing)}


def main(argv):
    with open(CONFIG, encoding='utf-8') as f:
        cfg = json.load(f)
    credentials = cfg.get('credentials', {})
    platforms = cfg['platforms']

    if '--list' in argv:
        for p in platforms:
            print('{:<18} {}'.format(p['id'], p['revshare']))
            print('{:<18} {}'.format('', p['site']))
        return

    wanted = [a for a in argv if not a.startswith('-')]
    if wanted:
        by_id = {p['id']: p for p in platforms}
        unknown = [w for w in wanted if w not in by_id]
        if unknown:
            raise SystemExit('unknown platform(s): ' + ', '.join(unknown))
        platforms = [by_id[w] for w in wanted]

    with open(os.path.join(HERE, 'index.html'), encoding='utf-8') as f:
        src_html = f.read()

    os.makedirs(DIST, exist_ok=True)
    print('building {} platform(s) into dist/'.format(len(platforms)))
    results = [build(p, credentials, src_html) for p in platforms]

    total = sum(r['bytes'] for r in results)
    needs = [r for r in results if r['missing']]
    print()
    print('{} builds, {:.2f} MB total'.format(len(results), total / 1024 / 1024))
    if needs:
        print('{} build(s) still need credentials: {}'.format(
            len(needs), ', '.join(r['id'] for r in needs)))


if __name__ == '__main__':
    main(sys.argv[1:])
