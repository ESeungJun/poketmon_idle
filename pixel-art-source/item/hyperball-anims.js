// hyperball — pixel art (auto-converted from 23×25)
const _ = null

export const COLORS = {
  outline: '#000000',
  body: '#FFFF01',
  bodyL: '#F0F130',
  bodyD: '#DADC60',
  belly: '#D8D8D8',
  shadow: '#FFFFFF',
}

// grid: 23×25
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'outline', 'outline', 'outline', 'outline', _, _, _],
/* row  3 */ [_, _, _, _, 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'outline', 'outline', 'outline', 'outline', _, _, _],
/* row  4 */ [_, _, 'outline', 'outline', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'bodyL', 'outline', 'outline', _],
/* row  5 */ [_, _, 'outline', 'outline', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'bodyL', 'outline', 'outline', _],
/* row  6 */ [_, _, 'outline', 'outline', 'body', 'body', 'body', 'body', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'bodyL', 'outline', 'outline', _],
/* row  7 */ [_, _, 'outline', 'outline', 'body', 'body', 'body', 'body', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'bodyL', 'outline', 'outline', _],
/* row  8 */ ['outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'body', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'bodyL', 'outline', 'outline', 'outline'],
/* row  9 */ ['outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'body', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'bodyL', 'outline', 'outline', 'outline'],
/* row 10 */ ['outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'body', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'bodyL', 'outline', 'outline', 'outline'],
/* row 11 */ ['outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'body', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'bodyL', 'outline', 'outline', 'outline'],
/* row 12 */ ['outline', 'outline', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyD', 'outline', 'outline', 'outline'],
/* row 13 */ ['outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'shadow', 'shadow', 'belly', 'belly', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline'],
/* row 14 */ ['outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'shadow', 'shadow', 'belly', 'belly', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline'],
/* row 15 */ ['outline', 'outline', 'shadow', 'shadow', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'belly', 'belly', 'outline'],
/* row 16 */ ['outline', 'outline', 'shadow', 'shadow', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'belly', 'belly', 'outline'],
/* row 17 */ [_, _, 'outline', 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', 'outline', 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _],
/* row 18 */ [_, _, 'outline', 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', 'outline', 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _],
/* row 19 */ [_, _, 'outline', 'outline', 'belly', 'belly', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _],
/* row 20 */ [_, _, 'outline', 'outline', 'belly', 'belly', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _],
/* row 21 */ [_, _, _, _, 'outline', 'outline', 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', 'outline', 'outline', _, _, _],
/* row 22 */ [_, _, _, _, 'outline', 'outline', 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', 'outline', 'outline', _, _, _],
/* row 23 */ [_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _],
/* row 24 */ [_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _],
]
