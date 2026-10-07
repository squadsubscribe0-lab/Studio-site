"""Static dev server that refuses to be cached.

`python -m http.server` sends Last-Modified and nothing else, so Chrome applies
heuristic caching to the ES modules and an edit to src/ does not show up on
reload - you end up debugging the previous version of the file. This is the same
server with no-store headers bolted on.

    python .claude/dev-server.py 8123
"""

import os
import re
import sys
from functools import partial
from urllib.parse import parse_qs, urlparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


# Where POSTed renders are allowed to land. Anything outside this directory is
# refused - the endpoint exists so tools/covers.html can write three PNGs, not
# so a page can write anywhere on the disk.
SAVE_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "store-assets"))


class NoCacheHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".json": "application/json",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self):
        """Saves a rendered image to store-assets/.

        The cover tool draws to a canvas and has no way of its own to put the
        result on disk; a download would land in the browser's downloads folder
        under whatever name Chrome felt like. This takes ?name=<file> and the
        raw bytes as the body.
        """
        if not self.path.startswith("/__save"):
            self.send_error(404)
            return

        query = parse_qs(urlparse(self.path).query)
        name = (query.get("name") or [""])[0]
        # One optional subdirectory, for the trailer's frame dump.
        sub = (query.get("dir") or [""])[0]
        if sub and not re.fullmatch(r"[A-Za-z0-9_-]{1,32}", sub):
            self.send_error(400, "bad dir")
            return
        # No directories, no traversal, and only the extensions a cover can be.
        if not re.fullmatch(r"[A-Za-z0-9._-]{1,64}\.(png|jpg|jpeg|webp|webm|mp4|bin)", name):
            self.send_error(400, "bad name")
            return

        root = os.path.join(SAVE_ROOT, sub) if sub else SAVE_ROOT
        target = os.path.abspath(os.path.join(root, name))
        if os.path.dirname(target) != os.path.abspath(root):
            self.send_error(400, "outside save root")
            return

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 256 * 1024 * 1024:
            self.send_error(400, "bad length")
            return

        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "wb") as fh:
            fh.write(self.rfile.read(length))

        print(f"saved {target} ({length} bytes)")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b"ok")

    def log_message(self, fmt, *args):
        # Keep the console readable: errors only, not a line per asset.
        if not args or not str(args[0]).startswith(("GET", "HEAD")) or str(args[1]) != "200":
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    root = sys.argv[2] if len(sys.argv) > 2 else "."
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(NoCacheHandler, directory=root))
    print(f"serving {root} on http://localhost:{port} (no-store)")
    server.serve_forever()
