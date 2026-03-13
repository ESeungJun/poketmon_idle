// normal/26-anims.js — pixel art (auto-converted from 20×20)
const _ = null

export const COLORS = {
  outline: '#313131',
  body: '#525252',
  bodyL: '#73523A',
  bodyD: '#946B42',
  belly: '#CE8431',
  shadow: '#CEB552',
  accent: '#F7B531',
  highlight: '#FFE652',
  detail1: '#E6DE9C',
  detail2: '#FFF7C5',
  detail3: '#FFFFFF',
}

// grid: 20×20
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, 'outline', 'bodyL', 'outline', _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', _, _, _, _, _],
/* row  3 */ [_, _, 'outline', 'bodyL', 'bodyL', 'outline', _, _, _, 'outline', 'outline', 'bodyD', 'bodyD', 'outline', _, _, 'outline', 'outline', _, _],
/* row  4 */ [_, _, 'outline', 'bodyL', 'outline', _, _, _, 'outline', 'bodyD', 'bodyD', 'shadow', 'outline', _, _, _, 'outline', 'outline', _, _],
/* row  5 */ [_, _, 'outline', 'body', 'outline', 'outline', 'outline', 'outline', 'bodyD', 'bodyD', 'highlight', 'highlight', _, _, _, _, 'outline', 'highlight', 'outline', _],
/* row  6 */ [_, _, 'outline', 'accent', 'accent', 'accent', 'accent', 'bodyD', 'bodyD', 'highlight', 'highlight', 'outline', _, _, _, _, 'outline', 'highlight', 'outline', _],
/* row  7 */ [_, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'bodyD', 'bodyD', 'body', 'outline', 'outline', _, 'outline', 'outline', 'body', 'highlight', 'highlight', 'outline'],
/* row  8 */ ['outline', 'accent', 'accent', 'accent', 'accent', 'belly', 'accent', 'body', 'body', 'body', 'outline', _, _, _, 'outline', 'shadow', 'body', 'highlight', 'highlight', 'highlight'],
/* row  9 */ ['outline', 'accent', 'accent', 'accent', 'accent', 'detail3', 'outline', 'accent', 'accent', 'accent', 'accent', 'outline', _, _, _, 'outline', 'shadow', 'body', 'outline', 'highlight'],
/* row 10 */ [_, 'outline', 'accent', 'accent', 'accent', 'outline', 'body', 'highlight', 'accent', 'accent', 'accent', 'outline', _, _, _, 'outline', 'shadow', 'outline', _, 'outline'],
/* row 11 */ [_, _, 'belly', 'belly', 'accent', 'accent', 'accent', 'highlight', 'accent', 'accent', 'accent', 'belly', _, _, _, _, 'outline', 'outline', _, _],
/* row 12 */ [_, 'outline', 'body', 'detail2', 'detail2', 'accent', 'body', 'accent', 'accent', 'accent', 'belly', 'belly', 'outline', _, _, _, _, 'outline', _, _],
/* row 13 */ [_, _, 'outline', 'body', 'detail2', 'body', 'bodyD', 'accent', 'accent', 'belly', 'belly', 'belly', 'outline', _, _, _, _, 'outline', 'outline', _],
/* row 14 */ [_, _, _, 'outline', 'detail2', 'body', 'bodyD', 'accent', 'body', 'belly', 'belly', 'bodyL', 'outline', _, _, _, _, _, 'outline', _],
/* row 15 */ [_, _, _, 'outline', 'belly', 'detail1', 'body', 'body', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _, _, _, _, 'outline', _],
/* row 16 */ [_, _, 'outline', 'bodyL', 'body', 'outline', 'outline', 'detail1', 'belly', 'belly', 'belly', 'belly', _, 'outline', 'outline', _, _, 'outline', 'outline', _],
/* row 17 */ [_, _, _, _, _, _, _, 'outline', 'body', 'body', 'belly', 'belly', _, _, _, _, _, _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _],
]
