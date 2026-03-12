// 고오스(92) — pixel art
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#525252',
  bodyL: '#C55231',
  bodyD: '#7B7B7B',
  belly: '#7B63B5',
  shadow: '#AD849C',
  accent: '#9C7BD6',
  highlight: '#BDBDB5',
  detail1: '#F7ADC5',
  detail2: '#FFFFFF',
}

// grid: 22×20
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, 'belly', 'belly', _, 'belly', _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, 'belly', 'belly', _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, 'belly', 'belly', 'belly', _, _, _, _, _, 'belly', _, _, 'belly', 'belly', _, _, _],
/* row  3 */ [_, _, _, _, 'belly', 'belly', 'accent', 'accent', 'accent', 'belly', 'belly', 'belly', _, 'belly', 'accent', 'belly', _, 'belly', 'belly', _, _, _],
/* row  4 */ [_, _, _, 'belly', 'accent', 'accent', 'accent', 'outline', 'outline', 'outline', 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'belly', _, _, _, _, _],
/* row  5 */ [_, _, _, 'belly', 'accent', 'outline', 'outline', 'body', 'body', 'body', 'body', 'outline', 'outline', 'accent', 'accent', 'accent', 'belly', _, _, _, _, _],
/* row  6 */ [_, _, 'outline', 'accent', 'outline', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'outline', 'accent', 'belly', _, _, _, _, _, _],
/* row  7 */ [_, 'outline', 'highlight', 'outline', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'accent', 'belly', _, 'belly', 'belly', _, _, _],
/* row  8 */ [_, 'outline', 'detail2', 'bodyD', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'accent', 'accent', 'belly', 'accent', 'accent', 'belly', _, _],
/* row  9 */ [_, 'outline', 'detail2', 'highlight', 'bodyL', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'highlight', 'body', 'outline', 'accent', 'accent', 'accent', 'accent', 'belly', _, _],
/* row 10 */ ['belly', 'outline', 'detail2', 'body', 'bodyL', 'body', 'bodyL', 'body', 'body', 'body', 'highlight', 'detail2', 'detail2', 'body', 'outline', 'accent', 'accent', 'accent', 'belly', _, _, 'belly'],
/* row 11 */ ['belly', 'outline', 'highlight', 'body', 'highlight', 'body', 'bodyL', 'body', 'detail2', 'detail2', 'detail2', 'detail2', 'detail2', 'bodyL', 'outline', 'accent', 'accent', 'belly', 'detail2', 'belly', 'belly', _],
/* row 12 */ ['belly', 'accent', 'outline', 'detail2', 'body', 'body', 'body', 'detail2', 'outline', 'detail2', 'detail2', 'detail2', 'highlight', 'bodyL', 'outline', 'accent', 'accent', 'belly', 'detail2', 'belly', 'belly', _],
/* row 13 */ [_, 'belly', 'belly', 'outline', 'body', 'body', 'bodyL', 'detail2', 'outline', 'detail2', 'detail2', 'detail2', 'bodyL', 'body', 'accent', 'accent', 'accent', 'accent', 'belly', _, _, _],
/* row 14 */ [_, _, 'belly', 'accent', 'outline', 'shadow', 'shadow', 'shadow', 'body', 'body', 'body', 'shadow', 'body', 'outline', 'accent', 'accent', 'accent', 'belly', _, _, _, _],
/* row 15 */ [_, _, 'belly', 'accent', 'accent', 'outline', 'outline', 'detail1', 'detail1', 'shadow', 'detail2', 'outline', 'outline', 'accent', 'accent', 'accent', 'belly', _, _, _, _, _],
/* row 16 */ [_, _, _, 'belly', 'accent', 'accent', 'accent', 'outline', 'outline', 'outline', 'highlight', 'outline', 'accent', 'belly', 'belly', 'belly', _, _, _, _, _, _],
/* row 17 */ [_, _, _, _, 'belly', 'accent', 'accent', 'belly', 'belly', 'accent', 'outline', 'belly', 'belly', _, _, _, _, _, _, _, _, _],
/* row 18 */ [_, _, _, _, _, 'belly', 'belly', _, _, 'belly', 'belly', _, _, _, 'belly', _, _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, 'belly', _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = COLORS
export const SLEEP_BODY = BASE_BODY
