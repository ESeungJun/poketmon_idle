// 고우스트(93) — pixel art
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#525252',
  bodyL: '#634A8C',
  bodyD: '#7B63B5',
  belly: '#AD849C',
  shadow: '#9C7BD6',
  accent: '#BDADB5',
  highlight: '#F7ADC5',
  detail1: '#FFFFFF',
}

// grid: 23×20
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'outline', _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, _, 'shadow', 'shadow', 'bodyD', _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */ [_, _, _, _, _, 'outline', 'outline', _, _, 'shadow', 'shadow', 'bodyD', 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _],
/* row  4 */ [_, _, _, _, _, 'outline', 'bodyD', 'outline', 'outline', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _, _, _, 'outline', 'outline', 'outline'],
/* row  5 */ [_, _, _, _, _, _, 'outline', 'bodyD', 'body', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', _],
/* row  6 */ [_, _, _, _, _, _, 'outline', 'body', 'accent', 'shadow', 'shadow', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'outline', _],
/* row  7 */ [_, _, _, _, _, _, _, 'outline', 'detail1', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _],
/* row  8 */ [_, _, _, _, _, _, 'outline', 'bodyD', 'accent', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'outline', 'outline', _],
/* row  9 */ [_, _, _, 'outline', 'outline', _, _, 'outline', 'bodyD', 'shadow', 'shadow', 'bodyD', 'outline', 'body', 'accent', 'detail1', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _],
/* row 10 */ [_, _, 'outline', 'shadow', 'shadow', _, _, 'outline', 'bodyD', 'bodyD', 'bodyD', 'body', 'outline', 'detail1', 'detail1', 'detail1', 'bodyD', 'bodyD', 'bodyD', 'body', 'outline', _, _],
/* row 11 */ [_, 'outline', 'body', 'shadow', 'shadow', 'outline', 'outline', 'detail1', 'outline', 'body', 'bodyD', 'bodyD', 'bodyD', 'accent', 'detail1', 'accent', 'body', 'bodyD', 'bodyD', 'outline', _, _, _],
/* row 12 */ ['outline', 'bodyD', 'shadow', 'bodyD', 'body', 'shadow', 'bodyD', 'outline', _, 'outline', 'belly', 'body', 'belly', 'body', 'belly', 'belly', 'bodyD', 'bodyD', 'bodyD', 'body', 'outline', _, _],
/* row 13 */ [_, 'outline', 'outline', 'outline', 'bodyD', 'bodyD', 'outline', _, _, 'body', 'belly', 'highlight', 'highlight', 'belly', 'belly', 'body', 'bodyD', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 14 */ [_, 'outline', _, 'outline', 'bodyD', 'outline', _, _, _, 'outline', 'body', 'body', 'highlight', 'highlight', 'body', 'bodyL', 'bodyL', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline'],
/* row 15 */ [_, _, _, _, 'outline', 'outline', _, _, _, _, 'outline', 'bodyL', 'body', 'body', 'bodyL', 'bodyL', 'outline', 'shadow', 'shadow', 'bodyL', 'bodyL', 'bodyL', _],
/* row 16 */ [_, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'shadow', 'body', 'shadow', 'shadow', 'shadow', 'outline', _, _],
/* row 17 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyD', 'shadow', 'shadow', 'body', 'shadow', 'outline', _, _],
/* row 18 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyD', 'bodyD', 'outline', 'shadow', 'outline', _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, 'outline', _, _, _],
]

export const SLEEP_COLORS = COLORS
export const SLEEP_BODY = BASE_BODY
