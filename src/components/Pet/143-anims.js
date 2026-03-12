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

// grid: 22×20
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyL', 'outline', 'outline', _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline', _, 'outline', 'outline', 'outline'],
/* row  3 */ [_, _, _, _, _, _, _, _, 'outline', 'outline', _, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'bodyL', 'bodyL', 'bodyL'],
/* row  4 */ [_, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'outline', 'outline', 'belly', 'accent', 'accent', 'body', 'body', 'belly', 'accent', 'bodyL', 'bodyL', 'bodyL'],
/* row  5 */ [_, _, _, _, _, _, 'outline', 'bodyL', 'highlight', 'body', 'accent', 'accent', 'accent', 'belly', 'belly', 'accent', 'accent', 'belly', 'body', 'bodyL', 'bodyL', 'outline'],
/* row  6 */ [_, _, _, _, _, _, 'outline', 'bodyL', 'body', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'belly', 'accent', 'accent', 'accent', 'bodyL', 'bodyL', 'outline'],
/* row  7 */ [_, _, _, _, _, _, 'outline', 'bodyL', 'body', 'accent', 'accent', 'accent', 'accent', 'body', 'body', 'body', 'body', 'accent', 'accent', 'bodyL', 'bodyL', 'outline'],
/* row  8 */ [_, _, _, _, _, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'body', 'outline', _],
/* row  9 */ [_, _, _, _, _, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 10 */ [_, 'outline', 'outline', _, 'outline', 'shadow', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 11 */ ['outline', 'accent', 'belly', 'outline', 'outline', 'shadow', 'shadow', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 12 */ ['outline', 'belly', 'accent', 'body', 'bodyL', 'bodyL', 'shadow', 'shadow', 'accent', 'accent', 'accent', 'accent', 'shadow', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 13 */ [_, 'outline', 'shadow', 'shadow', 'body', 'bodyL', 'bodyL', 'shadow', 'shadow', 'body', 'highlight', 'bodyD', 'highlight', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 14 */ [_, 'outline', 'shadow', 'shadow', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'accent', 'shadow', 'accent', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 15 */ [_, _, 'outline', 'shadow', 'outline', 'bodyL', 'bodyL', 'bodyL', 'body', 'accent', 'accent', 'accent', 'accent', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', _, _, _],
/* row 16 */ [_, _, _, 'outline', _, 'outline', 'outline', 'bodyL', 'body', 'accent', 'bodyD', 'bodyD', 'accent', 'shadow', 'body', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _],
/* row 17 */ [_, _, _, _, _, _, _, 'outline', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'body', 'bodyL', 'outline', 'outline', _, _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'outline', 'outline', _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = COLORS
export const SLEEP_BODY = BASE_BODY
