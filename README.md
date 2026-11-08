# Mobile UI Demos

**Live: https://razee4315.github.io/mobile-ui-demos/**

Twenty invented brands in four collections of mobile sign-in and sign-up concepts. Every screen is real HTML, CSS and JavaScript running inside CSS-built iPhone 15 Pro (393×852) and Pixel 8 (412×915) frames, so you can type, tap and poke the phones. No frameworks, no build step.

## Collections

### 04 · Small moments ([`small-moments/`](small-moments/index.html))
Five living interfaces drawn in SVG, CSS and canvas, each with sign in, sign up, reset (inbox state and resend countdown) and a home screen: **Murmur** (AI companion orb), **Kin** (customer support crew that covers its eyes), **Inkling** (pocket animation studio with onion skins), **Draft** (whiteboard with wandering teammate cursors) and **Pulse** (calm uptime monitoring). Design rules for each are in [`small-moments/README.md`](small-moments/README.md) and `small-moments/refs/<name>/notes.md`.

### 03 · Sign in, but alive ([`series-2/`](series-2/index.html))
Light, minimal, motion first.

| App | Niche | What moves |
|-----|-------|------------|
| **Wisp** | AI chat companion | WebGL pastel orb with eyes that follow you and close for passwords; sign up is a chat |
| **Peep** | Customer support desk | SVG mascot with googly eyes on springs; covers its eyes, peeks, reacts to pokes and errors |
| **Kin** | Team workspace (SaaS) | Colour fields with physics that scatter from your finger; email-first SSO detection |
| **Ease** | Motion design tool | Live cubic-bezier editor that rewrites the page's `--ease`; scrubbable timeline |
| **Muse** | AI image studio | Pixel-aligned Codex edit chains that "develop" between variations; tilt and long-press |

### 02 · Five Kitchens ([`kitchens/`](kitchens/index.html))
One food-delivery product in five design languages: **Dumpli** (soft clay), **Orbyt** (futuristic glass), **Hearthly** (plush textile), **Grubby** (neo-brutal) and **Lume** (liquid chrome). Each has sign in, sign up, forgot password (with a sent state) and a home feed, plus error and loading states. The design rules for each theme are in `kitchens/refs/<theme>/notes.md`, and [`kitchens/README.md`](kitchens/README.md) has the full write-up.

### 01 · Sign-in Studies ([`series-1.html`](series-1.html))
The first round of bold art directions: **Lumen** (aurora dream journal), **Tern** (trail journal over landscape photography), **Moko** (clay habit buddies), **Kiln** (poster-type money app) and **Halo** (liquid-glass meditation).

## Run locally

```
python tools/serve.py        # no-cache static server on http://127.0.0.1:5317
```

Opening `index.html` directly from disk also works. Any screen runs on its own on a real phone, for example `series-2/concepts/peep/screen.html?view=signup`.

## How it was made

1. **Research.** Pinterest searches per direction; the patterns kept are written into each concept. The pins themselves are not in this repo, because they are other designers' work. Local moodboards appear only if a `references/` folder is present.
2. **Art direction.** Each brand gets a name, an SVG logo, a palette, a type pairing and its own motion rules.
3. **Generated art.** Photos and 3D objects come from the Codex CLI image tool (`tools/generate.mjs` + `tools/manifest*.mjs`). Edit chains in a single session give pixel-aligned variants (Muse). Everything is checked for alpha, trimmed and converted to WebP (`tools/process.py`).
4. **Screens.** Hand-written HTML/CSS/JS. Series 02 shares a small motion kit (`series-2/shared/kit.js`): springs, an idle "gaze" that wanders when nobody touches, streamed text, caret tracking and haptics.

## Layout

```
index.html                 hub
series-1.html, concept.html, concepts/<name>/screen.html     collection 01
series-2/index.html, concept.html, concepts/<name>/screen.html, shared/kit.*   collection 03
kitchens/index.html, themes/<theme>/, shared/                collection 02
small-moments/index.html, themes/<name>/, shared/            collection 04
shared/devices.*           iPhone + Android frames that wrap a live iframe
assets/web, series-2/assets/web, kitchens/assets             shipped WebP art
tools/                     Codex image pipeline + preview server
```

All brands are made up. Concepts only.
