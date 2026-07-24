#!/usr/bin/env python3
"""Build the single-file offline version of ミンのミニルーム.

Inlines three.module.js and app.js into index.html so the result opens
directly from file:// with no network and no CORS issues.

Usage: python3 scripts/build.py
Output: min-miniroom-offline.html
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "min-miniroom-offline.html"

html = (ROOT / "index.html").read_text(encoding="utf-8")
three = (ROOT / "three.module.js").read_text(encoding="utf-8")
app = (ROOT / "app.js").read_text(encoding="utf-8")

# 1. three.module.js: turn its final `export { A, B, ... };` into
#    `const THREE = { A, B, ... };` so the namespace exists in scope.
idx = three.rfind("export {")
if idx == -1:
    sys.exit("build error: could not find `export {` in three.module.js")
three_inline = three[:idx] + "const THREE = {" + three[idx + len("export {"):]

# 2. app.js: drop the `import * as THREE from 'three';` line and wrap in an
#    IIFE so app-level names cannot collide with three's top-level names.
app_inline, n = re.subn(r"^import\s.*?;\s*\n", "", app, count=1, flags=re.M)
if n != 1:
    sys.exit("build error: could not strip the import line from app.js")
app_inline = "(function () {\n" + app_inline + "\n})();"

# 3. Inline gen-assets.js (AI-generated assets; empty object when none baked).
gen_path = ROOT / "gen-assets.js"
gen_inline = ""
if gen_path.exists():
    gen_inline = "<script>\n" + gen_path.read_text(encoding="utf-8") + "\n</script>\n"

# 4. Replace the dev script block in index.html.
begin, end = "<!--BUILD:SCRIPTS-->", "<!--/BUILD:SCRIPTS-->"
b, e = html.find(begin), html.find(end)
if b == -1 or e == -1:
    sys.exit("build error: BUILD:SCRIPTS markers not found in index.html")
inline = (
    gen_inline
    + '<script type="module">\n'
    + three_inline
    + "\n"
    + app_inline
    + "\n</script>"
)
out_html = html[:b] + inline + html[e + len(end):]

OUT.write_text(out_html, encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")
