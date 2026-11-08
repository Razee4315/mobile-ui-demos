// Image manifest. Every prompt gets its concept's style block appended. No text/logos in images.
const T = 'a genuinely transparent background (real alpha channel), no backdrop, no surface, no floor, no cast shadow';
const NOTEXT = 'Absolutely no text, letters, numbers, logos, watermarks or UI elements anywhere in the image.';

export const styles = {
  lumen: 'Style: premium high-end 3D render, cinematic, deep midnight black with electric indigo, violet and cyan light, soft bloom, iridescent thin-film reflections, ultra clean, Apple keynote quality. ' + NOTEXT,
  tern: 'Style: real photograph, shot on a full-frame camera with a 35mm lens, natural soft light, fine film grain, muted earthy greens, slate blue and warm sunrise amber, calm and airy, editorial travel magazine quality. ' + NOTEXT,
  moko: 'Style: soft 3D clay render, matte plasticine material with subtle handmade texture, rounded chunky shapes, cheerful, palette of lime green (#C6F432), warm cream, coral pink, sky blue and sunny yellow, soft studio lighting from the top left, charming animated-film quality. ' + NOTEXT,
  kiln: 'Style: luxury product 3D render, glossy molten glass and liquid metal, saturated ember orange (#FF5A1F) and amber glowing from within, deep black environment reflections, sharp specular highlights, dramatic studio lighting, sculptural and bold. ' + NOTEXT,
  halo: 'Style: delicate premium 3D render, liquid glass aesthetic, clear refractive glass with pearlescent iridescent edges in soft lilac, ice blue, peach and mint, bright airy white studio light, soft caustics, minimal and serene. ' + NOTEXT,
};

export const images = [
  { id: 'lumen-orb', concept: 'lumen', shape: 'square 1:1', alpha: true,
    prompt: `A single floating glass sphere with swirling iridescent liquid light inside (indigo, violet, cyan, a hint of magenta), like a captured aurora, perfectly centered with generous empty margin around it, ${T}.` },
  { id: 'lumen-sky', concept: 'lumen', shape: 'tall portrait 9:16', alpha: false,
    prompt: `A dark minimal night scene seen from space: the top two thirds is near-black deep space with a few faint tiny stars, the bottom third is the curved glowing rim of a planet horizon emitting a soft aurora of electric blue fading to violet, a smooth luminous arc spanning the full width, very subtle and elegant.` },
  { id: 'tern-lake', concept: 'tern', shape: 'tall portrait 9:16', alpha: false,
    prompt: `A misty alpine lake at sunrise, still mirror-like water in the lower half, dark pine forest on the shores, layered blue mountains fading into soft fog, a warm amber glow behind the peaks, a large calm empty sky in the top third. Vertical composition.` },
  { id: 'tern-coast', concept: 'tern', shape: 'tall portrait 9:16', alpha: false,
    prompt: `A lone hiker seen small from behind standing on a grassy green clifftop trail above a misty ocean coastline at golden hour, rolling green hills, soft haze, warm light, a large calm empty sky in the top third. Vertical composition.` },
  { id: 'moko-crew', concept: 'moko', shape: 'landscape 3:2', alpha: true,
    prompt: `A happy group of four cute round blob characters huddled together: a lime green one in the middle with big glossy eyes waving, a coral pink one, a sky blue one with a tiny sprout on its head, a sunny yellow one smiling, simple dot eyes and small smiles, no clothing, centered with margin, ${T}.` },
  { id: 'moko-solo', concept: 'moko', shape: 'square 1:1', alpha: true,
    prompt: `A single cute round lime green blob character jumping with joy, both little arms raised, big glossy eyes, open happy smile, holding a small yellow star, centered with generous margin, ${T}.` },
  { id: 'kiln-sculpt', concept: 'kiln', shape: 'square 1:1', alpha: true,
    prompt: `An abstract twisted ribbon sculpture made of glossy molten orange glass flowing into liquid chrome, like a Moebius loop, glowing ember core, centered and floating with generous margin, ${T}.` },
  { id: 'kiln-coins', concept: 'kiln', shape: 'square 1:1', alpha: true,
    prompt: `Three thick smooth discs of translucent ember-orange glass stacked loosely and tilted in mid-air, polished chrome rims, blank faces with no symbols, warm inner glow, centered with generous margin, ${T}.` },
  { id: 'halo-blob', concept: 'halo', shape: 'square 1:1', alpha: true,
    prompt: `A soft flowing abstract shape of clear liquid glass, like a droplet caught mid-motion folding into a smooth wave, iridescent pearlescent edges, centered and floating with generous margin, ${T}.` },
  { id: 'halo-ring', concept: 'halo', shape: 'square 1:1', alpha: true,
    prompt: `A single smooth thick torus ring made of clear refractive glass with pearlescent iridescent highlights, tilted slightly toward the viewer, centered with generous margin, ${T}.` },
];
