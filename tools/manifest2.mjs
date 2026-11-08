// Series 2 art. Only Muse (AI image studio) uses photography; the other concepts are drawn in code
// so they can move. Edit chains give pixel-aligned variants that cross-fade like a "generation".
export const out = 'series-2/assets/raw';

const NOTEXT = 'Absolutely no text, letters, numbers, logos, watermarks or signatures anywhere.';

export const styles = {
  muse: 'Style: minimal fine-art still life photograph, medium format camera, 80mm lens, soft diffused window light from the left, gentle long shadow, very shallow depth of field, matte surfaces, pale airy palette of bone white, warm blush (#F2D9CF), clay and soft sage, lots of calm negative space, quiet and serene, like a Kinfolk magazine cover. ' + NOTEXT,
};

export const images = [
  {
    id: 'muse-vase', concept: 'muse', shape: 'portrait 4:5',
    prompt: 'A single small matte ceramic bud vase in warm off-white, holding one pale pink tulip with a gently curved stem, standing on a smooth plaster plinth against a plain warm blush wall. The vase is centered in the lower half of the frame with a lot of empty wall above it.',
    chain: [
      'replace the pink tulip with a single soft blush peony bloom on a short stem.',
      'replace the pink tulip with a single slender olive branch with small sage green leaves.',
      'replace the pink tulip with a single white calla lily with a long elegant stem.',
    ],
  },
  {
    id: 'muse-fruit', concept: 'muse', shape: 'portrait 4:5',
    prompt: 'A single ripe pear resting on a folded piece of natural linen on a pale stone table, against a plain warm bone white wall. The pear sits in the lower half of the frame with a lot of empty wall above it.',
    chain: [
      'replace the pear with a single soft peach with a small leaf.',
      'replace the pear with a single bright yellow lemon with one green leaf.',
      'replace the pear with a single ripe purple fig, cut in half to show the inside.',
    ],
  },
];
