# Small moments — Volume 02

Five new, light mobile product concepts. The original collection at `../index.html` and its assets are untouched.

Open `index.html` for the dual-device gallery. Each app also works on its own in `themes/<name>/index.html`. Serve the project root with `python -m http.server 5173 --bind 127.0.0.1`, then visit `http://127.0.0.1:5173/v2/`.

## The concepts

| App | Niche and audience | Palette | Fonts | Signature interaction |
| --- | --- | --- | --- | --- |
| Murmur | A thoughtful AI companion for adults who want help making sense of everyday life | Warm paper `#FBF8F4`, apricot `#FFBE98`, blush `#FFB4C6`, sky `#BCDDFF`, ink `#24211D` | Newsreader + Albert Sans | One translucent orb follows attention, ripples at touch, frosts at password focus, and changes energy during thinking |
| Kin | Customer support for small, human-first teams | Soft white `#FAFBF5`, leaf ink `#283D31`, butter `#EADDAA`, sage `#C3D9C9`, coral `#E9BAA7` | DM Serif Display + DM Sans | Four friendly shapes track your pointer, close their eyes for passwords, peek on reveal, and hop after success |
| Inkling | A pocket animation studio for indie animators and curious beginners | Paper `#FCFAF3`, graphite `#363630`, highlighter `#F5E9AB`, onion red `#D18A81`, onion blue `#7B9FAE` | Outfit + Caveat | A stepped pencil walk with onion skins, transient drawing on the paper, password blindfold, scrub-able frames |
| Draft | Collaborative whiteboards for small product and creative teams | Canvas `#FBFCFB`, ink `#313936`, sticky yellow `#F2E8B9`, sage `#E4EADA`, pale peach `#F4E0D5` | Geist; Geist Mono available for metadata | Teammate cursors wander on eased paths, gather near typing, fly away for privacy, and accompany draggable notes |
| Pulse | Calm uptime monitoring for independent developers and small SaaS teams | White `#FCFEFD`, deep green `#283D35`, mint `#E1F0E7`, signal `#83AD92`, amber `#DFC48B` | DM Sans + Martian Mono | The signal responds to typing, encrypts on password focus, and becomes an inspectable response-time chart |

## Five design rules per concept

### Murmur

1. One living object per screen; the rest is warm paper and type.
2. Keep soft colour inside the orb and occasional prompt accents.
3. Newsreader italic is the product voice; Albert Sans carries controls.
4. Give input, focus, reveal and touch a visible response.
5. Use slow, eased motion rather than bounces or spins for the object.

### Kin

1. Each character is one simple shape and two eyes.
2. Use pastel bodies with dark pupils; keep outlines out of the crew.
3. Bodies lag behind attention and move independently.
4. Support copy is human and specific: names, questions, timestamps.
5. Keep one strong action per screen; the team provides the colour.

### Inkling

1. Graphite on paper; colour comes from onion skins and one highlighter.
2. Drawn elements use stepped timing; controls use smooth easing.
3. Outfit carries the UI; Caveat is reserved for one small annotation.
4. Reveal the main drawing with its stroke.
5. Preserve breathing room around the drawing.

### Draft

1. Dot-grid canvas with pastel notes and cursor tags.
2. Cursors move on eased, curved paths.
3. Use understated typography and tiny metadata.
4. Transitions use canvas-like camera movement.
5. Name the people and their activity: “Jun is adding a thought…”

### Pulse

1. Mostly white; mint is healthy, amber is degraded, coral flags an error.
2. Hairline charts, no heavy grid, monospaced data.
3. The calm status sentence leads; charts support it.
4. Motion signifies a signal or a data interaction.
5. Screens arrive through a scan-line wipe.

## Screens and behavior

All five include sign in, sign up, password reset with an inbox state and 30-second resend countdown, and a niche-specific home screen. The gallery synchronizes routes between native-size iPhone 15 Pro (393×852) and Pixel 8 (412×915) frames. Screen and theme selections are shareable through query parameters. Error, loading and reset-success states are available from the state menu.

Forms validate locally; password reveal and animated strength meters work. Social buttons, AI replies, tickets and monitoring data are demonstrations. No authentication, email, AI or monitoring service is connected. Nothing entered in a form is sent to a server or persisted. Do not use real credentials.

The four newer apps include focused modal previews for secondary actions. Kin resolves demo tickets and updates its waiting count. Inkling adds named loops and scrubs a stepped walk cycle. Draft adds named boards and pans notes. Pulse inspects chart history and daily uptime bars.

## Research and artwork

`refs/<theme>/` contains eight selected references, source links and research notes per direction. `research/` retains the earlier contact sheets and candidate set. Research notes describe the intended direction; this README describes implemented behavior.

This edition deliberately uses editable SVG, CSS and canvas artwork rather than flattened hero bitmaps: eyes, limbs, cursors, light and chart points need to move independently. No new raster image generation was run for Volume 02. The original collection retains its generation manifest, script, raw assets and processed WebP files.

## Files and verification

- `shared/app.js`: event bus, springs, routing, validation, strength meters, resend timer, gallery bridge.
- `shared/ui.css`: common form primitives; `themes/*/theme.css` owns each concept's visual identity.
- `shared/interactions.js`: accessible modal previews and local actions for Kin, Inkling, Draft and Pulse.
- `themes/*/theme.js`: each product's live object and signature interaction.
- `tools/build-pages.py`: regenerates HTML for the four newer concepts. It does not replace custom CSS or motion code.
- `tools/review.py`: native-size browser captures and real form-flow checks using Python Playwright and installed Microsoft Edge.
- `shots/`: all screen captures, reset success states and machine-readable review results.

Use `python v2/tools/review.py` from the project root while the local server runs. Google Fonts and Phosphor icons load from their CDNs. Core controls remain usable with fallback fonts if those requests fail. Reduced-motion settings suppress continuous decorative motion and screen transitions.
