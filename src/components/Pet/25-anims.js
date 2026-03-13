// 피카츄(25) — pixel art
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#525252',
  bodyL: '#B57329',
  bodyD: '#9C8442',
  belly: '#C5A529',
  shadow: '#F76352',
  accent: '#F7D631',
  highlight: '#FFFFFF',
}

// grid: 21×20
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, 'outline', 'body', 'outline', _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, _],
/* row  2 */ [_, _, _, _, _, 'outline', 'body', 'outline', _, _, _, _, _, _, _, _, 'outline', 'accent', 'belly', 'outline', _],
/* row  3 */ [_, _, _, _, 'outline', 'belly', 'belly', 'outline', _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'accent', 'belly', 'belly', 'belly', 'outline'],
/* row  4 */ [_, _, _, _, 'outline', 'belly', 'bodyD', 'outline', _, _, 'outline', 'outline', 'body', 'body', 'body', 'accent', 'belly', 'belly', 'belly', 'belly', 'outline'],
/* row  5 */ [_, _, _, 'outline', 'outline', 'belly', 'outline', _, _, 'outline', 'accent', 'accent', 'body', 'body', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', _],
/* row  6 */ [_, _, 'outline', 'belly', 'accent', 'accent', 'accent', 'outline', 'outline', 'accent', 'accent', 'accent', 'body', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', _, _],
/* row  7 */ [_, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'bodyD', 'accent', 'accent', 'body', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', _, _, _],
/* row  8 */ [_, 'outline', 'accent', 'accent', 'accent', 'accent', 'belly', 'accent', 'accent', 'accent', 'bodyD', 'outline', 'outline', 'belly', 'belly', 'belly', 'outline', _, _, _, _],
/* row  9 */ ['outline', 'accent', 'accent', 'accent', 'accent', 'belly', 'highlight', 'outline', 'accent', 'accent', 'accent', 'outline', '-', 'outline', 'belly', 'belly', 'belly', 'outline', _, _, _],
/* row 10 */ ['outline', 'accent', 'bodyD', 'accent', 'accent', 'accent', 'outline', 'body', 'accent', 'accent', 'accent', 'accent', 'outline', '-', 'outline', 'belly', 'belly', 'outline', _, _, _],
/* row 11 */ [_, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'shadow', 'shadow', 'accent', 'accent', 'accent', 'accent', 'outline', 'belly', 'belly', 'outline', _, _, _, _],
/* row 12 */ ['outline', 'belly', 'body', 'belly', 'accent', 'accent', 'accent', 'shadow', 'shadow', 'accent', 'accent', 'accent', 'bodyL', 'body', 'bodyL', 'outline', _, _, _, _, _],
/* row 13 */ [_, 'outline', 'outline', 'outline', 'belly', 'belly', 'accent', 'accent', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'bodyL', 'outline', _, _, _, _],
/* row 14 */ [_, _, _, _, 'outline', 'belly', 'belly', 'body', 'accent', 'accent', 'body', 'accent', 'accent', 'bodyL', 'body', 'outline', _, _, _, _, _],
/* row 15 */ [_, _, _, _, 'outline', 'belly', 'belly', 'accent', 'body', 'body', 'accent', 'accent', 'accent', 'accent', 'outline', _, _, _, _, _, _],
/* row 16 */ [_, _, _, _, _, 'outline', 'belly', 'belly', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'outline', _, _, _, _, _, _],
/* row 17 */ [_, _, _, _, _, _, 'outline', 'outline', 'outline', 'accent', 'accent', 'accent', 'accent', 'outline', _, _, _, _, _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, _, _, 'outline', 'outline', 'accent', 'outline', _, _, _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = COLORS
export const SLEEP_BODY = BASE_BODY
