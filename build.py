"""Build the portfolio into ./dist, optionally serving it with live rebuilds.

Usage:
    python build.py            # build once into dist/
    python build.py --serve    # build, serve on http://localhost:8000, rebuild on changes
    python build.py --serve --port 5500
"""
from __future__ import annotations

import argparse
import datetime as dt
import functools
import http.server
import shutil
import socketserver
import threading
import time
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined

ROOT = Path(__file__).resolve().parent
TEMPLATES = ROOT / "templates"
STATIC = ROOT / "static"
CONTENT = ROOT / "content.yaml"
DIST = ROOT / "dist"
WATCHED = [TEMPLATES, STATIC, CONTENT]


def build() -> None:
    data = yaml.safe_load(CONTENT.read_text(encoding="utf-8"))
    env = Environment(
        loader=FileSystemLoader(TEMPLATES),
        autoescape=True,
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    html = env.get_template("index.html.j2").render(
        **data,
        year=dt.date.today().year,
        build_id=int(time.time()),
    )

    if DIST.exists():
        shutil.rmtree(DIST)
    shutil.copytree(STATIC, DIST)
    (DIST / "index.html").write_text(html, encoding="utf-8")
    print(f"[build] {dt.datetime.now():%H:%M:%S}  dist/index.html written")


def _snapshot() -> dict[Path, float]:
    files: dict[Path, float] = {}
    for p in WATCHED:
        for f in ([p] if p.is_file() else p.rglob("*")):
            if f.is_file():
                files[f] = f.stat().st_mtime
    return files


def _watch() -> None:
    last = _snapshot()
    while True:
        time.sleep(0.8)
        now = _snapshot()
        if now != last:
            last = now
            try:
                build()
            except Exception as exc:  # keep the server alive on template/YAML errors
                print(f"[build] ERROR: {exc}")


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args) -> None:
        pass

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def serve(port: int) -> None:
    threading.Thread(target=_watch, daemon=True).start()
    handler = functools.partial(_QuietHandler, directory=str(DIST))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("127.0.0.1", port), handler) as httpd:
        print(f"[serve] http://localhost:{port}  (Ctrl+C to stop; edits rebuild automatically)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[serve] stopped")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--serve", action="store_true", help="serve dist/ and rebuild on changes")
    ap.add_argument("--port", type=int, default=8000)
    args = ap.parse_args()
    build()
    if args.serve:
        serve(args.port)
