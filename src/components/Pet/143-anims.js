// 잠만보(143) — pixel art
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#525252',
  bodyL: '#426B8C',
  bodyD: '#9C7342',
  belly: '#B58C5A',
  shadow: '#CEBD94',
  accent: '#FFEFC5',
  highlight: '#FFFFFF',
}

// grid: 32×29
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyL', 'outline', _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _, _, _, _, _],
/* row  3 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, '-', '-', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', '-', '-', 'outline', 'outline', 'outline', 'outline', 'outline'],
/* row  4 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, '-', 'outline', 'belly', 'accent', 'accent', 'accent', 'accent', 'bodyL', 'bodyL', 'outline', 'outline', 'body', 'bodyL', 'bodyL', 'bodyL', 'outline'],
/* row  5 */ [_, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', '', _, 'outline', 'accent', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline'],
/* row  6 */ [_, _, _, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'outline', 'belly', 'belly', 'accent', 'accent', 'body', 'body', 'body', 'belly', 'accent', 'accent', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline'],
/* row  7 */ [_, _, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'highlight', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'belly', 'belly', 'accent', 'accent', 'accent', 'belly', 'body', 'accent', 'bodyL', 'bodyL', 'bodyL', 'outline', '-'],
/* row  8 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'highlight', 'body', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'belly', 'accent', 'accent', 'accent', 'accent', 'accent', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row  9 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'body', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 10 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'body', 'body', 'body', 'body', 'body', 'accent', 'accent', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 11 */ [_, _, _, _, _, _, _, _, 'outline', 'body', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'outline', _],
/* row 12 */ [_, _, _, _, _, _, _, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'bodyL', 'bodyL', 'body', 'outline', _, _],
/* row 13 */ [_, _, _, _, _, _, _, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 14 */ [_, _, _, _, _, _, _, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 15 */ [_, 'outline', 'outline', 'outline', _, _, 'outline', 'shadow', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'body', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 16 */ ['outline', 'accent', 'belly', 'belly', 'outline', 'outline', 'outline', 'shadow', 'shadow', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 17 */ ['outline', 'belly', 'accent', 'accent', 'accent', 'body', 'bodyL', 'bodyL', 'shadow', 'shadow', 'shadow', 'shadow', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'shadow', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 18 */ ['outline', 'shadow', 'shadow', 'shadow', 'accent', 'shadow', 'body', 'bodyL', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'body', 'body', 'body', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 19 */ [_, 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'body', 'bodyL', 'bodyL', 'shadow', 'shadow', 'shadow', 'shadow', 'body', 'highlight', 'bodyD', 'bodyD', 'highlight', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 20 */ [_, 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'body', 'bodyL', 'bodyL', 'shadow', 'shadow', 'shadow', 'shadow', 'body', 'shadow', 'accent', 'accent', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', '-', _, _],
/* row 21 */ [_, 'outline', 'outline', 'shadow', 'shadow', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'shadow', 'body', 'accent', 'shadow', 'accent', 'accent', 'shadow', 'accent', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', '-', _, _],
/* row 22 */ [_, _, _, 'outline', 'outline', '-', 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _, _],
/* row 23 */ [_, _, _, '-', '-', '-', '-', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'body', 'accent', 'bodyD', 'bodyD', 'bodyD', 'accent', 'shadow', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', '-', _, _, _, _],
/* row 24 */ [_, _, _, '-', '-', '-', _, _, '-', 'outline', 'outline', 'outline', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'body', 'bodyL', 'bodyL', 'outline', 'outline', 'outline', '-', _, _, _, _, _],
/* row 25 */ [_, _, _, _, _, _, _, _, _, _, _, '-', 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'body', 'outline', 'outline', 'outline', '-', '-', _, _, _, _, _, _, _],
/* row 26 */ [_, _, _, _, _, _, _, _, _, _, _, '-', 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'body', 'outline', '-', '', '-', '-', _, _, _, _, _, _, _],
/* row 27 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'body', 'outline', '-', _, _, _, _, _, _, _, _, _, _, _],
/* row 28 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = COLORS
export const SLEEP_BODY = BASE_BODY
