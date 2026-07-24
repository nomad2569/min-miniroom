#!/usr/bin/env python3
"""Remove a solid/gradient/vignette backdrop from a generated sprite PNG.

Region-growing from the image borders: a pixel joins the background if it is
color-continuous with an adjacent background pixel (small local step), so
smooth gradients and glows are eaten while the sprite's crisp outline stops
the growth. Then crops to content with a small margin.

Usage: python3 scripts/key_bg.py <file.png> [step_tol=45]
"""
import sys
import pathlib
import numpy as np
from PIL import Image

path = pathlib.Path(sys.argv[1])
STEP = int(sys.argv[2]) if len(sys.argv) > 2 else 45

# work from a pristine copy so re-runs with different thresholds are safe
# (keying in place would leave stale RGB under alpha=0 as stepping stones)
orig = path.with_suffix(".orig.png")
if orig.exists():
    img = Image.open(orig).convert("RGBA")
else:
    img = Image.open(path).convert("RGBA")
    img.save(orig)
a = np.asarray(img).astype(np.int16)
h, w = a.shape[:2]
rgb = a[:, :, :3]
alpha = a[:, :, 3]

bg = np.zeros((h, w), dtype=bool)
bg[0, :] = bg[-1, :] = bg[:, 0] = bg[:, -1] = True
bg |= alpha == 0

# magenta chroma key: if the corners are magenta-ish, remove every
# magenta-family pixel globally (glow tinted toward magenta included)
r, g_, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
corners = [rgb[2, 2], rgb[2, -3], rgb[-3, 2], rgb[-3, -3]]
magenta_corners = sum(1 for c in corners if c[0] > int(c[1]) + 80 and c[2] > int(c[1]) + 40)
if magenta_corners >= 3:
    key = (r > g_ + 80) & (b > g_ + 40)
    a[:, :, 3] = np.where(key, 0, a[:, :, 3])
    alpha = a[:, :, 3]
    bg |= alpha == 0
    STEP = -1   # no region growing needed

already_transparent = (alpha == 0).mean() > 0.3
if already_transparent:
    # the model delivered real alpha — don't grow (RGB under alpha=0 is
    # garbage and would eat the sprite); binarize alpha to kill any soft
    # glow halo, then just clean islands + crop below
    STEP = -1
    a[:, :, 3] = np.where(alpha >= 250, 255, 0)
    alpha = a[:, :, 3]
    bg = np.zeros((h, w), dtype=bool)
    bg[0, :] = bg[-1, :] = bg[:, 0] = bg[:, -1] = True
    bg |= alpha == 0

def step_ok(dy, dx):
    """pixels whose neighbor at (dy,dx) is bg and color-close to them"""
    src = np.roll(bg, (dy, dx), axis=(0, 1))
    diff = np.abs(rgb - np.roll(rgb, (dy, dx), axis=(0, 1))).sum(axis=2)
    ok = src & (diff < STEP)
    # roll wraps around edges; borders are all bg anyway, so wraps are harmless
    return ok

grew = True
it = 0
while grew and it < 2000:
    it += 1
    cand = np.zeros((h, w), dtype=bool)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        cand |= step_ok(dy, dx)
    cand &= ~bg
    grew = bool(cand.any())
    bg |= cand

out = a.astype(np.uint8)
out[:, :, 3] = np.where(bg, 0, out[:, :, 3])

# keep only the largest opaque connected component (drops leftover
# backdrop islands that survived the region-grow)
opaque = out[:, :, 3] > 0
labels = np.zeros((h, w), dtype=np.int32)
cur = 0
sizes = {}
from collections import deque
for sy in range(h):
    for sx in range(w):
        if opaque[sy, sx] and labels[sy, sx] == 0:
            cur += 1
            q = deque([(sy, sx)])
            labels[sy, sx] = cur
            n = 0
            while q:
                y, x2 = q.popleft()
                n += 1
                for ny, nx in ((y+1,x2),(y-1,x2),(y,x2+1),(y,x2-1)):
                    if 0 <= ny < h and 0 <= nx < w and opaque[ny, nx] and labels[ny, nx] == 0:
                        labels[ny, nx] = cur
                        q.append((ny, nx))
            sizes[cur] = n
if sizes:
    # keep every component at least 2% the size of the largest — drops stray
    # backdrop islands but preserves multi-part icons (the dot of a "!")
    biggest = max(sizes.values())
    keep_ids = {k for k, n in sizes.items() if n >= biggest * 0.02}
    keep_mask = np.isin(labels, list(keep_ids))
    out[:, :, 3] = np.where(keep_mask, out[:, :, 3], 0)

res = Image.fromarray(out, "RGBA")

bbox = res.getbbox()
if bbox:
    m = 12
    res = res.crop((max(0, bbox[0] - m), max(0, bbox[1] - m),
                    min(w, bbox[2] + m), min(h, bbox[3] + m)))
res.save(path)
print(f"keyed {path.name}: {it} iterations, size {res.size}, step {STEP}")
