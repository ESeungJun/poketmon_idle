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

// grid: 30×26
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */ [_, _, _, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'shadow', 'bodyD', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  4 */ [_, _, _, _, _, _, _, 'outline', 'outline', _, _, 'outline', 'shadow', 'shadow', 'bodyD', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _],
/* row  5 */ [_, _, _, _, _, _, _, 'outline', 'bodyD', 'outline', 'outline', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', 'outline', _, _, _, _, _, 'outline', 'outline', 'outline', 'outline'],
/* row  6 */ [_, _, _, _, _, _, _, 'outline', 'bodyD', 'bodyD', 'body', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'outline', 'outline', 'outline', 'outline', 'outline', 'shadow', 'shadow', 'bodyD', 'outline'],
/* row  7 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyD', 'body', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'outline', _],
/* row  8 */ [_, _, _, _, _, _, _, _, 'outline', 'body', 'accent', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _],
/* row  9 */ [_, _, _, _, _, _, _, _, '_', 'outline', 'detail1', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', '-', _, _],
/* row 10 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyD', 'accent', 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'outline', 'outline', 'outline', _],
/* row 11 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyD', 'bodyD', 'body', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'body', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline'],
/* row 12 */ [_, _, _, _, 'outline', 'outline', _, _, _, 'outline', 'bodyD', 'bodyD', 'shadow', 'shadow', 'bodyD', 'bodyD', 'outline', 'body', 'accent', 'detail1', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', 'outline', _],
/* row 13 */ [_, _, 'outline', 'outline', 'shadow', 'shadow', 'outline', _, _, 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'detail1', 'outline', 'detail1', 'detail1', 'detail1', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'body', 'outline', _, _, _],
/* row 14 */ [_, 'outline', 'bodyD', 'body', 'shadow', 'shadow', 'shadow', 'outline', 'outline', '_', 'outline', 'bodyD', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'accent', 'detail1', 'accent', 'bodyD', 'body', 'bodyD', 'bodyD', 'bodyD', 'outline', '-', _, _, _],
/* row 15 */ ['outline', 'bodyD', 'body', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', '_', 'outline', 'belly', 'body', 'bodyD', 'body', 'body', 'bodyD', 'body', 'body', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _, _],
/* row 16 */ ['outline', 'bodyD', 'body', 'shadow', 'bodyD', 'body', 'shadow', 'shadow', 'bodyD', 'outline', _, '_', 'outline', 'belly', 'body', 'belly', 'belly', 'body', 'belly', 'belly', 'body', 'bodyD', 'bodyD', 'bodyD', 'body', 'body', 'outline', _, _, _],
/* row 17 */ [_, 'outline', 'bodyD', 'outline', 'outline', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _, 'outline', 'body', 'belly', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'body', 'bodyD', 'bodyD', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', _],
/* row 18 */ [_, 'outline', 'outline', '_', 'outline', 'bodyD', 'bodyD', 'outline', _, _, _, _, 'outline', 'body', 'body', 'highlight', 'highlight', 'highlight', 'body', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline'],
/* row 19 */ [_, _, _, _, _, 'outline', 'bodyD', 'outline', _, _, _, _, _, 'outline', 'bodyL', 'body', 'body', 'body', 'bodyL', 'bodyL', 'outline', 'outline', 'shadow', 'shadow', 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 20 */ [_, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', 'outline', 'outline', _, _],
/* row 21 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _, _, _],
/* row 22 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyD', 'body', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'outline', _, _, _],
/* row 23 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'body', 'bodyD', 'bodyD', 'outline', 'bodyD', 'shadow', 'outline', _, _, _],
/* row 24 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyD', 'outline', '-', 'outline', 'bodyD', 'outline', _, _, _],
/* row 25 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, _, 'outline', _, _, _, _],
]

export const SLEEP_COLORS = {
  outline: '#191919',
  body: '#505050',
  bodyL: '#604788',
  bodyD: '#7960B1',
  belly: '#AB7F96',
  shadow: '#9B78D4',
  accent: '#F3A9C2',
}

// grid: 30×26
export const SLEEP_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */ [_, _, _, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'shadow', 'bodyD', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  4 */ [_, _, _, _, _, _, _, 'outline', 'outline', _, _, 'outline', 'shadow', 'shadow', 'bodyD', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _],
/* row  5 */ [_, _, _, _, _, _, _, 'outline', 'bodyD', 'outline', 'outline', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', 'outline', _, _, _, _, _, 'outline', 'outline', 'outline', 'outline'],
/* row  6 */ [_, _, _, _, _, _, _, 'outline', 'bodyD', 'bodyD', 'body', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'outline', 'outline', 'outline', 'outline', 'outline', 'shadow', 'shadow', 'bodyD', 'outline'],
/* row  7 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyD', 'body', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'outline', _],
/* row  8 */ [_, _, _, _, _, _, _, _, 'outline', 'body', 'bodyD', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _],
/* row  9 */ [_, _, _, _, _, _, _, _, _, 'outline', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _, _],
/* row 10 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'outline', 'outline', 'outline', _],
/* row 11 */ [_, _, _, _, _, _, _, _, 'outline', 'bodyD', 'outline', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline'],
/* row 12 */ [_, _, _, _, 'outline', 'outline', _, _, _, 'outline', 'bodyD', 'outline', 'outline', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'outline', 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', 'outline', _],
/* row 13 */ [_, _, 'outline', 'outline', 'shadow', 'shadow', 'outline', _, _, 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', 'outline', 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'body', 'outline', _, _, _],
/* row 14 */ [_, 'outline', 'bodyD', 'body', 'shadow', 'shadow', 'shadow', 'outline', 'outline', '', 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _, _, _],
/* row 15 */ ['outline', 'bodyD', 'body', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _, 'outline', 'bodyD', 'body', 'body', 'body', 'body', 'bodyD', 'body', 'body', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _, _],
/* row 16 */ ['outline', 'bodyD', 'body', 'shadow', 'bodyD', 'body', 'shadow', 'shadow', 'bodyD', 'outline', _, _, 'outline', 'belly', 'belly', 'belly', 'belly', 'body', 'belly', 'belly', 'body', 'bodyD', 'bodyD', 'bodyD', 'body', 'body', 'outline', _, _, _],
/* row 17 */ [_, 'outline', 'bodyD', 'outline', 'outline', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _, 'outline', 'bodyD', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'bodyD', 'bodyD', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', _],
/* row 18 */ [_, 'outline', 'outline', _, 'outline', 'bodyD', 'bodyD', 'outline', _, _, _, _, 'outline', 'bodyL', 'body', 'body', 'body', 'body', 'body', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline'],
/* row 19 */ [_, _, _, _, _, 'outline', 'bodyD', 'outline', _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'shadow', 'shadow', 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline', _],
/* row 20 */ [_, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', 'outline', 'outline', _, _],
/* row 21 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _, _, _],
/* row 22 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyD', 'body', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'outline', _, _, _],
/* row 23 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'body', 'bodyD', 'bodyD', 'outline', 'bodyD', 'shadow', 'outline', _, _, _],
/* row 24 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyD', 'outline', _, 'outline', 'bodyD', 'outline', _, _, _],
/* row 25 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, _, 'outline', _, _, _, _],
]
