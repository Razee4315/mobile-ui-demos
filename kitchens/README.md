# Five Kitchens: themed mobile auth concepts (food delivery)

Five complete sign-in flows for a food delivery app. Each theme is its own invented brand, with four linked screens (Sign in, Sign up, Forgot password with a sent state, and Home) shown in CSS-built iPhone 15 Pro and Pixel 8 frames.

```
python -m http.server 5173 --bind 127.0.0.1     # then open http://127.0.0.1:5173/
```

`index.html` is the gallery. Tabs switch theme and screen, and the **State** control shows the Error / Loading / Sent states. Clicking inside either phone navigates both, with that theme's transition. Every theme also runs standalone at `themes/<theme>/index.html` (`?device=ios|android`, `#signin|signup|forgot|home`).

## Themes

### A · Soft Clay 3D, **Dumpli** (dumplings and comfort bowls, delivered warm)
- **Palette:** cream `#FFF4E6` · peach `#FFB997` · butter `#FFE08A` · lilac `#C9B6FF` · mint `#A8E6CF` · cocoa text `#4A2E22`
- **Fonts:** Fredoka (display) + Nunito (body) · Phosphor Bold/Fill icons
- **Transition:** squish (jelly overshoot, scale-y squash)
- **Rules**
  1. Everything is puffy: minimum radius 20px, no hairlines, every shape has an inner highlight and a soft outer shadow.
  2. Raised = interactive, sunken = input. Buttons pop out on a thick bottom lip; fields press in.
  3. Pastels sit on warm cream, never white. Text is cocoa, never black.
  4. The mascot breaks the frame: hero objects overlap card edges and bob slowly.
  5. Motion squishes: presses squash to 0.94, screens arrive with a jelly overshoot.

### B · Futuristic Glass, **Orbyt** (midnight food drops by drone)
- **Palette:** space navy `#070B1A` · cyan `#22E6FF` · violet `#8B5CFF` · magenta `#FF3DCB` · ink `#EAF2FF`
- **Fonts:** Sora (display) + JetBrains Mono (data, labels) · Phosphor Light/Fill
- **Transition:** blur fade (blur 16px → sharp, slight scale)
- **Rules**
  1. Three layers always: deep-space backdrop, floating glass/chrome objects, frosted panels (blur ≥ 24px, 6–10% white).
  2. Light lives on the edges: 1px gradient strokes, no solid borders.
  3. Saturation is rationed: only the CTA and focus state use the full cyan→magenta gradient.
  4. Sora for statements, JetBrains Mono for data (ETAs, prices, timers), uppercase and tracked.
  5. Motion blurs, nothing bounces.

### C · Plush Textile, **Hearthly** (home-cooked meals from cooks next door)
- **Palette:** oatmeal `#E9DCC6` · linen `#FAF4EA` · terracotta `#B4553A` · sage `#9CAF88` / `#566B48` · dusty rose `#D7A1A0` · brown text `#3F2B22`
- **Fonts:** Fraunces (display, SOFT/WONK axes, italic accents) + DM Sans (body) · Phosphor Duotone
- **Transition:** soft settle (drops onto a cushion, slight rotate)
- **Rules**
  1. Every container is a fabric patch: felt-noise fill, radius 18–26px, dashed stitch inset 5–7px.
  2. Fraunces carries the warmth, DM Sans stays quiet.
  3. Shadows are short and warm (brown-tinted, never grey).
  4. Terracotta = action, sage = success/calm, rose = gentle accent. No pure white.
  5. Motion is slow and soft (ease-out ~500ms), no snapping.

### D · Neo Brutal Playful, **Grubby** (loud street food, fast)
- **Palette:** paper `#FFF8EC` · lemon `#FFE14D` · cobalt `#2346FF` · hot pink `#FF4FA3` · tomato `#FF5A36` · black `#111111`
- **Fonts:** Archivo Black (display) + Space Grotesk (body) · Phosphor Bold/Fill
- **Transition:** hard cut with a one-frame flash, then content bounces in with a stagger
- **Rules**
  1. 3px black outline + flat fill + hard offset shadow on everything; pressing removes the shadow and shifts the element by the same amount.
  2. Archivo Black huge, tight and uppercase; Space Grotesk for anything you read.
  3. Stickers are rotated and overlap edges; nothing perfectly centred twice in a row.
  4. Colour blocks, never gradients; text is black or off-white for AA contrast.
  5. Hard cut + bounce; buttons clunk down on press.

### E · Liquid Chrome Aurora, **Lume** (chef-crafted dinners, quietly delivered)
- **Palette:** white `#FFFFFF` · pearl `#F4F1EE` · sky `#9CC9FF` · lavender `#C9B8FF` · blush `#FFB8D9` · ink `#1B1E3C`
- **Fonts:** Manrope only (300 display vs 700–800 labels) · Phosphor Light/Fill
- **Transition:** liquid rise (slide up, blur → sharp)
- **Rules**
  1. Air first: ≥ 40% untouched white/pearl, one hero object per screen.
  2. Surfaces are pearl glass: white 66% + blur, 1px white highlight, lavender-tinted shadow.
  3. Manrope only, contrast through weight and tight tracking.
  4. Iridescence is the accent: aurora ring for focus, loaders and active tab; the CTA is deep ink with a sheen sweep.
  5. Motion is liquid: slow blob drift, rise-and-sharpen transitions.

Full reference notes (what each ref contributes, plus the rules) are in `refs/<theme>/notes.md`; pin URLs are in `refs/<theme>/sources.txt`.

## Shared behaviour (all themes)
- Hash router with themed enter/leave animations; back navigation uses a reverse variant where the theme defines one.
- Password show/hide, animated 4-step strength meter with themed labels, required terms checkbox.
- Validation with inline error messages (`aria-invalid`, `role="alert"`), shake on invalid, loading state on every CTA.
- Forgot password → "Check your inbox" state with a 30-second resend countdown and progress indicator.
- Parallax on `[data-depth]` layers plus slow float loops; everything respects `prefers-reduced-motion`.
- 44px minimum tap targets, visible focus states, AA contrast on body text.
- All text is HTML; images never contain text.

## Folder map
| Path | What |
|---|---|
| `index.html` | Gallery: iPhone 15 Pro (393×852) + Pixel 8 (412×915) frames in CSS |
| `themes/<theme>/index.html`, `theme.css` | The four screens + design tokens (CSS variables) |
| `shared/base.css`, `shared/app.js` | Structural layer + runtime (router, forms, meter, countdown, parallax, gallery bridge) |
| `assets/<theme>/*.webp` | Final trimmed WebP assets at 2× (sizes in `assets/sizes.json`) |
| `raw-assets/<theme>/*.png` | Every Codex output, including rejected candidates |
| `refs/<theme>/` | 10 Pinterest refs per theme + `notes.md` + `sources.txt` |
| `tools/manifest.mjs` | Asset manifest: style blocks per theme, prompts, shapes, transparency |
| `tools/generate.mjs` | Parallel Codex runner (`--phase`, `--only`, `--ids`, `--concurrency`, `--force`) |
| `tools/process.py` + `select.json` | Alpha cleanup, trim, resize, WebP, icon-sheet splitting |
| `tools/fix_dims.py` | Writes real width/height onto every `<img>` |
| `tools/review.py`, `shot.sh`, `montage.py` | Checkerboard contact sheets, headless gallery screenshots, montages |

## Asset pipeline
1. `node tools/generate.mjs --phase 1`: heroes, logo marks and backgrounds (3/3/2 candidates per theme).
2. Pick winners, copy the chosen hero to `raw-assets/<theme>/_hero-ref.png`.
3. `node tools/generate.mjs --phase 2`: depth objects, home content and icon sheets, generated with `-i _hero-ref.png` as a style reference so the whole set matches.
4. `python tools/process.py` then `python tools/fix_dims.py`.

78 images were generated (40 in phase 1, 38 in phase 2, 0 failures). Alpha was checked numerically: subjects came back at alpha ≈ 250 with a faint 1–7 haze, so `process.py` remaps alpha (≤14 → 0, ≥238 → 255) and drops specks before trimming.
