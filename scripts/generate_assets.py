#!/usr/bin/env python3
"""Generate AI image assets for ミンのミニルーム.

Reads API keys from .env (GEMINI_API_KEY or OPENAI_API_KEY), generates the
assets defined in MANIFEST into assets/generated/*.png, then you run
scripts/bake_assets.py to embed them into gen-assets.js.

Usage:
    python3 scripts/generate_assets.py            # generate missing assets
    python3 scripts/generate_assets.py --force    # regenerate everything
    python3 scripts/generate_assets.py --only minimi-sprite

No third-party dependencies (urllib only).
"""
import base64
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "generated"

# ── asset manifest ──────────────────────────────────────────────
# aspect: "1:1" | "3:4" | "4:3"  (openai maps to nearest supported size)
# transparent: request transparent background (openai only; gemini ignores)
#
# wiring status (app.js):
#   frame-photo   → wired: replaces the procedural polaroid photo when present
#   minimi-sprite → generated only; 3D→2D sprite swap is a separate decision

# ── shared style strings ────────────────────────────────────────
MODEL = os.environ.get("IMAGE_MODEL", "gpt-image-2")

PX_OBJ = (
    "16-bit SNES-era JRPG pixel art object sprite, viewed straight-on "
    "(orthographic front view), cozy night-room palette — dark muted colors "
    "with warm glowing accents, crisp clean pixels, subtle dark outline. "
    "The object occupies about 80% of the canvas. "
    "IMPORTANT: flat solid magenta (#FF00FF) fills all empty background, "
    "no floor, no drop shadow, no vignette, no text unless specified. "
)

PX_CHAR = (
    "16-bit SNES-era JRPG pixel art character sprite: a young Korean man with "
    "medium-length wavy BLACK center-parted hair (curtain bangs), small dot "
    "eyes, short angled eyebrows, calm deadpan face, fresh leaf-green crew-neck "
    "t-shirt, off-white loose pants, white sneakers. About 3.5 heads tall, "
    "clean silhouette, crisp pixels, muted palette, front view, no text. "
    "The character is centered and occupies only 70% of the canvas height with "
    "wide empty margins — hair and shoes fully inside the frame. "
    "IMPORTANT: flat solid magenta (#FF00FF) background edge to edge, "
    "no shadow, no glow, no floor. Pose: "
)

PX_EMOTE = (
    "16-bit JRPG floating reaction icon, chunky readable pixel art with a "
    "dark outline, centered, occupying about 55% of the canvas. "
    "IMPORTANT: flat solid magenta (#FF00FF) background, no shadow, no text "
    "unless specified. "
)

MANIFEST = [
    {
        "name": "frame-photo",
        "aspect": "3:4",
        "transparent": False,
        "prompt": (
            "A nostalgic 2000s film photograph style illustration of Incheon, Korea: "
            "harbor at sunset, warm orange sky, calm sea, soft pastel tones, "
            "cozy and slightly grainy, no people, no text"
        ),
    },
    {
        "name": "minimi-sprite",
        "aspect": "1:1",
        "transparent": False,
        "prompt": (
            "16-bit SNES-era JRPG pixel art character sprite, full body, standing "
            "front view, chic and deadpan (not cute): a young Korean man with "
            "medium-length wavy BLACK hair parted in the center (curtain bangs "
            "framing the forehead), small dot eyes, short angled eyebrows, calm "
            "neutral mouth. He wears a fresh leaf-green crew-neck t-shirt, "
            "off-white loose pants, white sneakers, one hand in his pocket. "
            "About 3.5 heads tall, clean silhouette, crisp pixels, muted palette. "
            "The character is centered and occupies only 70% of the canvas height "
            "with wide empty margins — hair and shoes fully inside the frame. "
            "IMPORTANT: flat solid magenta (#FF00FF) background edge to edge, "
            "no shadow, no glow, no floor, no text"
        ),
    },
    {
        "name": "minimi-bow",
        "aspect": "1:1",
        "transparent": False,
        "prompt": (
            "16-bit SNES-era JRPG pixel art character sprite: a young Korean man "
            "with medium-length wavy BLACK center-parted hair, wearing a fresh "
            "leaf-green crew-neck t-shirt, off-white loose pants, white sneakers "
            "— performing a deep, polite Japanese bow (ojigi): bent forward about "
            "45 degrees at the waist, back straight, arms straight down at his "
            "sides, face angled toward the floor. Front-side view, about 3.5 "
            "heads tall, clean silhouette, crisp pixels, muted palette, no text. "
            "The character is centered and occupies only 70% of the canvas with "
            "wide empty margins. IMPORTANT: flat solid magenta (#FF00FF) "
            "background edge to edge, no shadow, no glow, no floor"
        ),
    },
    # ── per-section character poses ──
    {"name": "pose-minimi",    "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "waving one hand cheerfully at shoulder height, the other hand in his pocket."},
    {"name": "pose-frame",     "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "pointing up and to one side with his index finger, looking slightly upward."},
    {"name": "pose-nameplate", "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "arms crossed, head tilted slightly, with the faintest smug smile."},
    {"name": "pose-game",      "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "holding a grey game controller with both hands, leaning forward slightly, focused."},
    {"name": "pose-study",     "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "reading a thick blue textbook held open in both hands."},
    {"name": "pose-beret",     "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "standing at attention giving a crisp military salute with his right hand, wearing a dark-green beret."},
    {"name": "pose-calendar",  "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "raising one index finger as if presenting a big idea, confident."},
    {"name": "pose-desk",      "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "arms crossed confidently with a pencil tucked behind his ear."},
    {"name": "pose-gadget",    "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "proudly holding up an ivory mechanical keyboard with both hands like a trophy."},
    {"name": "pose-server",    "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "holding a silver wrench in one hand, the other fist on his hip, like a proud mechanic."},
    {"name": "pose-sofa",      "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "hugging a soft red heart-shaped cushion with both arms."},
    {"name": "pose-tennis",    "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "mid forehand tennis swing, holding a light-blue tennis racket."},
    {"name": "pose-books",     "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "holding an open book in one hand and scratching his head with the other, puzzled but determined."},
    {"name": "pose-figure",    "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "carefully holding a tiny collectible figure box with both hands, admiring it."},
    {"name": "pose-uniqlo",    "aspect": "1:1", "transparent": False, "prompt": PX_CHAR + "carrying two white shopping bags, one in each hand, satisfied."},
    # ── emotes ──
    {"name": "emote-ex",    "aspect": "1:1", "transparent": False, "prompt": PX_EMOTE + "A bold golden-yellow exclamation mark."},
    {"name": "emote-heart", "aspect": "1:1", "transparent": False, "prompt": PX_EMOTE + "A bright red heart."},
    {"name": "emote-star",  "aspect": "1:1", "transparent": False, "prompt": PX_EMOTE + "A golden five-pointed star."},
    {"name": "emote-note",  "aspect": "1:1", "transparent": False, "prompt": PX_EMOTE + "A teal musical eighth note."},
    {"name": "emote-idea",  "aspect": "1:1", "transparent": False, "prompt": PX_EMOTE + "A glowing warm-yellow lightbulb."},
    {"name": "emote-bolt",  "aspect": "1:1", "transparent": False, "prompt": PX_EMOTE + "A yellow lightning bolt."},
    {"name": "emote-book",  "aspect": "1:1", "transparent": False, "prompt": PX_EMOTE + "A small red closed book with the white Japanese character あ on the cover."},
    # ── furniture ──
    {"name": "fx-desk",   "aspect": "4:3", "transparent": False, "prompt": PX_OBJ + "A developer desk setup: white desk on wooden legs, three glowing monitors showing colorful code lines, an ivory mechanical keyboard, a mouse, and a small green mug. The ENTIRE desk setup fits fully inside the frame with clear magenta margins on all four sides — no monitor or leg may touch or be cropped by the canvas edge."},
    {"name": "fx-server", "aspect": "3:4", "transparent": False, "prompt": PX_OBJ + "A tall dark-navy home server rack with five rack-mounted units, tiny glowing green and amber LED dots, and thin cables."},
    {"name": "fx-books",  "aspect": "3:4", "transparent": False, "prompt": PX_OBJ + "A tall wooden bookshelf full of books: one shelf of teal manga volumes, one shelf with red and white Japanese study books, one shelf of colorful mixed books."},
    {"name": "fx-sofa",   "aspect": "4:3", "transparent": False, "prompt": PX_OBJ + "A coral-red two-seat sofa with rounded armrests and two seat cushions; two small game controllers (one white, one mint) rest on the cushions."},
    {"name": "fx-game",   "aspect": "4:3", "transparent": False, "prompt": PX_OBJ + "A retro purple CRT television with antennas on a low wooden table, the screen glowing dark blue with the yellow number 500; beside it a small white game console and a golden trophy."},
    {"name": "fx-uniqlo", "aspect": "3:4", "transparent": False, "prompt": PX_OBJ + "A white paper shopping bag with rope handles and a red square logo panel on the front."},
    {"name": "fx-tennis", "aspect": "3:4", "transparent": False, "prompt": PX_OBJ + "A tennis racket with a light-blue frame and white strings, hanging vertically, with a yellow-green tennis ball floating beside the handle."},
    {"name": "fx-calendar","aspect": "3:4", "transparent": False, "prompt": PX_OBJ + "A wall calendar: white paper, green header band, a month grid with small green dots on some days and one day circled in red."},
    {"name": "fx-frame",  "aspect": "3:4", "transparent": False, "prompt": PX_OBJ + "A warm wooden picture frame containing a tiny pixel sunset harbor scene: orange sky, dark sea, small sun."},
    {"name": "fx-figure", "aspect": "3:4", "transparent": False, "prompt": PX_OBJ + "A small collectible anime figure on a tiny round wooden display base: a determined young soldier with a flowing green hooded cape over a tan jacket, white pants, brown harness straps, holding two thin silver blades in a heroic pose."},
    {"name": "fx-nameplate", "aspect": "4:3", "transparent": False, "prompt": PX_OBJ + "A small desk nameplate: a dark plate on a tiny wooden stand, engraved with the white capital letters MIN."},
    {"name": "fx-beret", "aspect": "1:1", "transparent": False, "prompt": PX_OBJ + "A dark-green military beret with a small golden insignia, hanging on a round wooden wall mount."},
    {"name": "fx-gadget", "aspect": "4:3", "transparent": False, "prompt": PX_OBJ + "A small gadget display table: an ivory premium mechanical keyboard propped on a stand, next to dark over-ear headphones on a headphone stand."},
    {"name": "fx-gradcap", "aspect": "1:1", "transparent": False, "prompt": PX_OBJ + "A black graduation cap (mortarboard) with a golden tassel, resting on top of a thick blue programming textbook with a big white letter C on the cover."},
    {"name": "fx-plant",  "aspect": "3:4", "transparent": False, "prompt": PX_OBJ + "A potted plant: terracotta pot with three rounded bushy green foliage clusters."},
]

OPENAI_SIZE = {"1:1": "1024x1024", "3:4": "1024x1536", "4:3": "1536x1024"}


def load_env():
    p = ROOT / ".env"
    if not p.exists():
        return
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def post_json(url, payload, headers):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:800]
        sys.exit(f"HTTP {e.code} from {url.split('?')[0]}\n{body}")


def gen_gemini(asset, key):
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash-image:generateContent?key={key}"
    )
    payload = {
        "contents": [{"parts": [{"text": asset["prompt"]}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": asset["aspect"]},
        },
    }
    data = post_json(url, payload, {"Content-Type": "application/json"})
    for part in data["candidates"][0]["content"]["parts"]:
        if "inlineData" in part:
            return base64.b64decode(part["inlineData"]["data"])
    sys.exit(f"gemini returned no image for {asset['name']}: {json.dumps(data)[:400]}")


def gen_openai(asset, key):
    payload = {
        "model": MODEL,
        "prompt": asset["prompt"],
        "size": OPENAI_SIZE[asset["aspect"]],
        "quality": "high",
        "n": 1,
    }
    if asset["transparent"]:
        payload["background"] = "transparent"
    data = post_json(
        "https://api.openai.com/v1/images/generations",
        payload,
        {"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
    )
    return base64.b64decode(data["data"][0]["b64_json"])


def main():
    load_env()
    force = "--force" in sys.argv
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None

    provider = os.environ.get("IMAGE_PROVIDER", "").lower()
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    if not provider:
        provider = "gemini" if gemini_key else ("openai" if openai_key else "")
    if provider == "gemini" and not gemini_key:
        sys.exit("IMAGE_PROVIDER=gemini but GEMINI_API_KEY is empty (check .env)")
    if provider == "openai" and not openai_key:
        sys.exit("IMAGE_PROVIDER=openai but OPENAI_API_KEY is empty (check .env)")
    if not provider:
        sys.exit("No API key found. cp .env.example .env and fill in a key.")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    generate = gen_gemini if provider == "gemini" else gen_openai
    key = gemini_key if provider == "gemini" else openai_key

    for asset in MANIFEST:
        if only and asset["name"] != only:
            continue
        out = OUT_DIR / f"{asset['name']}.png"
        if (out.exists() or out.with_suffix(".jpg").exists()) and not force:
            print(f"skip {out.name} (exists — use --force to regenerate)")
            continue
        print(f"generating {out.name} via {provider} ...")
        out.write_bytes(generate(asset, key))
        print(f"  wrote {out} ({out.stat().st_size // 1024} KB)")

    print("\nnext: python3 scripts/bake_assets.py && python3 scripts/build.py")


if __name__ == "__main__":
    main()
