// Original pixel-art cast for MediaVault. Each sprite is a grid of
// palette characters ('.' = transparent). Eye pixels are 'e'; any 'w'
// touching an 'e' counts as an eye white. Together they get covered by
// the `lid` color for the blink animation.
//
// Want to swap in your own art? Any key here can be replaced by an image
// in <Sprite> - see the `src` prop there.

const OUTLINE = '#1b1426';

export const SPRITES = {
  // The vault itself - your companion.
  vaulty: {
    name: 'Vaulty',
    lid: '#e8284c',
    palette: { k: OUTLINE, R: '#ff2e55', r: '#ff7a93', y: '#f6c945', w: '#ffffff', e: OUTLINE },
    rows: [
      '................',
      '..kkkkkkkkkkkk..',
      '.kRRRRRRRRRRRRk.',
      '.kRrRRRRRRRRrRk.',
      '.kRRRRRRRRRRRRk.',
      'kkyyyyykkyyyyykk',
      'kRRRRRRyyRRRRRRk',
      'kRRweRRRRRRweRRk',
      'kRRweRRRRRRweRRk',
      'kRRRRRRRRRRRRRRk',
      'kRRRRRkkkkRRRRRk',
      'kRRRRRRkkRRRRRRk',
      'kyyRRRRRRRRRRyyk',
      'kkkkkkkkkkkkkkkk',
      '.kk..........kk.',
    ],
  },
  // Movies - a popcorn bucket with opinions.
  reel: {
    name: 'Reel',
    lid: '#fde7b0',
    palette: { k: OUTLINE, R: '#e0463a', w: '#fff6e0', y: '#f6c945', f: '#fde7b0', e: OUTLINE, m: '#b8332a' },
    rows: [
      '...ww.www.ww....',
      '..wwwywwwwywww..',
      '.wwywwwwwwwywww.',
      '.kkkkkkkkkkkkkk.',
      '.kRRwwRRwwRRwwk.',
      '.kRRwwRRwwRRwwk.',
      '..kRffffffffRk..',
      '..kRfeffffefRk..',
      '..kRfffmmfffRk..',
      '..kRffffffffRk..',
      '...kRRwwRRwwk...',
      '...kRRwwRRwwk...',
      '....kkkkkkkk....',
      '.....kk..kk.....',
    ],
  },
  // Series - a CRT that's seen every season.
  telly: {
    name: 'Telly',
    lid: '#9fdcf5',
    palette: { k: OUTLINE, B: '#2f9fd8', s: '#9fdcf5', w: '#ffffff', e: OUTLINE, o: '#f6c945', m: '#1f6f9a' },
    rows: [
      '...k........k...',
      '....k......k....',
      '.....k....k.....',
      '.kkkkkkkkkkkkkk.',
      '.kBBBBBBBBBBBBk.',
      '.kBkkkkkkkkkkBk.',
      '.kBksssssssskBk.',
      '.kBkswessweskok.',
      '.kBkswessweskBk.',
      '.kBksssmmssskok.',
      '.kBksssssssskBk.',
      '.kBkkkkkkkkkkBk.',
      '.kBBBBBBBBBBBBk.',
      '.kkkkkkkkkkkkkk.',
      '..kk........kk..',
    ],
  },
  // Anime - a spiky-haired rookie with a headband and big dreams.
  kit: {
    name: 'Kit',
    lid: '#ffd8b5',
    palette: { P: '#e0508a', h: '#ffffff', f: '#ffd8b5', w: '#ffffff', e: OUTLINE, m: '#c2415f', t: '#2a2440', y: '#f6c945', k: OUTLINE },
    rows: [
      '......P..P......',
      '....P.PPPP.P....',
      '...PPPPPPPPPP...',
      '..PPPPPPPPPPPP..',
      '.PPhhhhhhhhhhPP.',
      '.PPffffffffffPP.',
      '..PfweffffwefP..',
      '..PfweffffwefP..',
      '...ffffmmffff...',
      '....ffffffff....',
      '...tttttttttt...',
      '..tttttyyttttt..',
      '..ff.tttttt.ff..',
      '....tt....tt....',
      '...kkk....kkk...',
    ],
  },
  // Games - a slime that never puts the controller down.
  pip: {
    name: 'Pip',
    lid: '#9170f0',
    palette: { k: OUTLINE, V: '#9170f0', v: '#c7b6ff', w: '#ffffff', e: OUTLINE, m: '#4b2f9e', g: '#3a3550', r: '#ff2e55', d: '#d9d4ea' },
    rows: [
      '................',
      '......kkkk......',
      '....kkVVVVkk....',
      '...kVVvVVVVVk...',
      '..kVvvVVVVVVVk..',
      '..kVVVVVVVVVVk..',
      '.kVVwVVVVVVwVVk.',
      '.kVVeVVVVVVeVVk.',
      '.kVVVVVmmVVVVVk.',
      'kVVVVVVVVVVVVVVk',
      'kVVggggggggggVVk',
      'kVVgdggggggrgVVk',
      'kVVggggggggggVVk',
      '.kVVVVVVVVVVVVk.',
      '..kkkkkkkkkkkk..',
    ],
  },
};

export const TYPE_SPRITE = { MOVIE: 'reel', SERIES: 'telly', ANIME: 'kit', GAME: 'pip' };
