# ミンのミニルーム

Cyworld-style isometric 3D miniroom for a Japanese self-introduction presentation
(TimeTree Japan HQ visit). three.js r160, primitives only, no external assets.

## Files

| File | Purpose |
|---|---|
| `index.html` + `app.js` + `three.module.js` | dev version (needs an HTTP server) |
| `min-miniroom-offline.html` | **presentation file** — single self-contained HTML, works from `file://` with no network |
| `scripts/build.py` | regenerates the offline file from the dev files |

## Develop

```sh
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

`file://` does not work for the dev version (ES module CORS). Use the offline build instead.

## Build the offline file

```sh
python3 scripts/build.py
```

Inlines three.js + app.js + gen-assets.js into `min-miniroom-offline.html`. Double-click it — no wifi needed.

## AI asset pipeline (optional)

Assets live in `assets/generated/` and get baked into `gen-assets.js` as base64.
app.js falls back to procedural textures when an asset is missing, so this whole
pipeline is optional.

```sh
cp .env.example .env          # fill in OPENAI_API_KEY or GEMINI_API_KEY
python3 scripts/generate_assets.py [--only <name>] [--force]
python3 scripts/key_bg.py assets/generated/minimi-sprite.png   # sprite only
python3 scripts/bake_assets.py
python3 scripts/build.py
```

Notes:
- The sprite is requested on a **flat magenta background** and chroma-keyed by
  `key_bg.py` (gpt-image-1 ignores `background: transparent` often enough that
  magenta keying is the reliable path). A `.orig.png` copy is kept so re-keying
  is always safe.
- Model: `gpt-image-2` (override with `IMAGE_MODEL` in .env).
- Current assets (all 16-bit JRPG pixel art): `minimi-sprite` (character based on
  Min's reference illustration — black center-parted hair, green tee), 10
  furniture sprites (`fx-*`), a plant, 7 emote icons (`emote-*`), and
  `frame-photo` (Incheon sunset, used by the 3D-fallback polaroid).
- Floor furniture renders as bottom-pivot billboards with blob shadows; wall
  items as wall-fixed planes. Every item keeps a procedural 3D fallback when
  its asset is missing.
- Keep generated PNGs committed — rebuilds then never need an API key.

## Presentation controls

The site runs as a linear deck over the miniroom: intro card → 10 stories → thanks card.
The rail at the bottom shows progress; the camera zooms to each item and minimi reacts.

- **Space / →** — next step · **←** — previous step (also ‹ › buttons on the rail)
- **1–9** — jump to steps 1–9 (minimi → 額縁 → ゲーム機 → カレンダー → デスク → サーバーラック → ソファ → ラケット → 本棚) · **0** — ユニクロ
- **Click furniture** — jumps to that step directly (rail stays in sync)
- **Drag** — rotates the room ±24°
- **Esc / ×** — close the story window
- Finale: thanks card + confetti; collecting all 10 dotori also fires the キリ番 banner

## Pre-presentation checklist

- [ ] Open `min-miniroom-offline.html` with wifi OFF and click through everything
- [ ] Browser zoom 100%, fullscreen (⌘⇧F / F11)
- [ ] Check the story window is readable at projector resolution
- [ ] Backup: screen recording or screenshots on USB
