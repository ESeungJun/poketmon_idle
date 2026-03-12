// 이브이(133) — pixel art
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#525252',
  bodyL: '#735A42',
  bodyD: '#BD843A',
  belly: '#DEB55A',
  shadow: '#E6CE73',
  accent: '#FFF7D6',
  highlight: '#FFFFFF',
}

// grid: 20×21
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, 'outline', 'outline', 'belly', 'belly', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, 'outline', 'belly', 'belly', 'bodyL', 'belly', 'outline', _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, 'outline', _],
/* row  3 */ [_, 'outline', 'belly', 'belly', 'bodyL', 'belly', 'outline', _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, 'outline', _],
/* row  4 */ [_, 'outline', 'belly', 'belly', 'bodyL', 'bodyD', 'outline', 'outline', _, 'outline', 'outline', 'outline', 'shadow', 'shadow', 'outline', 'outline', 'outline', 'outline', 'accent', 'outline'],
/* row  5 */ [_, 'outline', 'bodyL', 'bodyL', 'body', 'body', 'shadow', 'outline', 'outline', 'bodyD', 'bodyD', 'shadow', 'bodyL', 'belly', 'body', 'bodyD', 'bodyD', 'accent', 'accent', 'outline'],
/* row  6 */ [_, 'outline', 'body', 'body', 'belly', 'shadow', 'belly', 'shadow', 'bodyL', 'belly', 'belly', 'bodyL', 'bodyL', 'belly', 'body', 'bodyD', 'bodyD', 'shadow', 'accent', 'outline'],
/* row  7 */ ['outline', 'bodyL', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'bodyL', 'bodyL', 'bodyL', 'belly', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'outline'],
/* row  8 */ ['outline', 'highlight', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'bodyD', 'bodyD', 'belly', 'body', 'bodyL', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _],
/* row  9 */ ['outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'bodyD', 'bodyL', 'belly', 'belly', 'belly', 'body', 'bodyL', 'bodyD', 'bodyL', 'outline', 'outline', 'outline', _, _],
/* row 10 */ ['outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'bodyD', 'bodyL', 'belly', 'belly', 'belly', 'body', 'bodyL', 'bodyD', 'bodyL', 'outline', 'outline', 'outline', _, _],
/* row 11 */ ['outline', 'belly', 'belly', 'belly', 'belly', 'bodyD', 'highlight', 'outline', 'belly', 'bodyL', 'bodyL', 'shadow', 'bodyL', 'bodyD', 'bodyD', 'outline', 'outline', _, _, _],
/* row 12 */ [_, 'outline', 'bodyD', 'bodyD', 'belly', 'belly', 'bodyL', 'outline', 'bodyD', 'bodyL', 'bodyL', 'shadow', 'shadow', 'bodyL', 'bodyD', 'outline', 'outline', _, _, _],
/* row 13 */ ['outline', 'accent', 'bodyL', 'bodyL', 'bodyL', 'bodyD', 'bodyD', 'bodyD', 'bodyL', 'accent', 'accent', 'shadow', 'shadow', 'bodyL', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _],
/* row 14 */ ['outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'accent', 'accent', 'accent', 'shadow', 'body', 'bodyL', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _],
/* row 15 */ [_, 'outline', 'accent', 'accent', 'shadow', 'accent', 'accent', 'shadow', 'accent', 'shadow', 'shadow', 'bodyL', 'outline', 'outline', 'bodyL', 'bodyD', 'bodyD', 'outline', _, _],
/* row 16 */ [_, 'outline', 'accent', 'accent', 'shadow', 'accent', 'accent', 'shadow', 'accent', 'shadow', 'shadow', 'bodyL', 'outline', 'outline', 'bodyL', 'bodyD', 'bodyD', 'outline', _, _],
/* row 17 */ [_, _, 'outline', 'outline', 'body', 'shadow', 'shadow', 'accent', 'bodyL', 'bodyD', 'bodyD', 'outline', _, _, 'outline', 'outline', 'outline', _, _, _],
/* row 18 */ [_, _, _, _, 'outline', 'bodyD', 'body', 'body', 'bodyD', 'outline', 'outline', _, _, _, _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, 'outline', 'outline', 'belly', 'bodyD', 'outline', 'outline', _, _, _, _, _, _, _, _, _],
/* row 20 */ [_, _, _, _, _, _, _, 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = COLORS
export const SLEEP_BODY = BASE_BODY
