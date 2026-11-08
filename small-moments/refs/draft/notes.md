# Draft — multiplayer whiteboard SaaS
Refs: sources.txt

## What the research showed
01 named-cursors — cursors with pill name tags read instantly as "other people are here".
02 live-collab-cursor — a single cursor with a soft pastel tag is friendlier than saturated ones.
03 minimal-sticky-notes — pastel stickies with tiny type, rotated 1–3°.
04 canvas-comments — comment pins with avatars.
05 pen-stroke-on-grid — dot grid + one smooth ink stroke = whiteboard.
06 toolbar-press-depth — tool buttons press in with a darker inner state.
07 collaborators-menu — avatar stack with presence dots.
08 line-arrow-tool — hand-drawn arrows connecting ideas.

## Signature: live cursors
Three teammates (Maya, Jun, Theo) are live on the sign-in canvas, drifting and doodling.
- Focus email: the cursors gather around the field like curious coworkers; one follows your caret.
- Password: they politely fly to the corners; their tags switch to "not looking".
- Error: Maya drops a comment pin on the field: "typo?".
- Success: everyone converges, the form gets selection handles, and the canvas zooms into Home.
- Drag the background: the canvas pans with inertia (dot grid and stickies move in parallax).
- Home: a live board preview with cursors at work, plus boards drawn as tiny SVG thumbnails.

## 5 rules
1. White canvas with a dot grid; pastel only on stickies, tags and cursors.
2. Cursors travel on eased curved paths, never straight linear tweens.
3. Geist for UI, Geist Mono for meta (timestamps, counts).
4. Transitions are camera moves (zoom and pan), because it is a canvas product.
5. Real collaboration copy: names, edits, "Jun is typing…".
