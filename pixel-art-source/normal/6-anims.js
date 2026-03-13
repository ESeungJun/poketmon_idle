// 리자몽(Charizard) — pixel art (auto-converted from 32×27)
const _ = null

export const COLORS = {
  outline: '#313131',
  body: '#525252',
  bodyL: '#316B5A',
  bodyD: '#B5423A',
  belly: '#4A8473',
  shadow: '#D66342',
  accent: '#FF5A3A',
  highlight: '#F79429',
  detail1: '#D6B563',
  detail2: '#FFE629',
  detail3: '#BDBDBD',
  detail4: '#F7D673',
  detail5: '#FFFFFF',
}

// grid: 32×27
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'accent', 'outline', _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'accent', 'outline', _, _, _, _, _],
/* row  3 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'accent', 'accent', 'accent', 'outline', _, _, _, _],
/* row  4 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'accent', 'highlight', 'accent', 'accent', 'outline', _, _, _],
/* row  5 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'accent', 'detail2', 'accent', 'accent', 'outline', _, _, _],
/* row  6 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'accent', 'detail2', 'detail2', 'accent', 'accent', 'outline', _, _],
/* row  7 */ [_, _, _, _, _, _, 'outline', _, _, _, _, _, 'outline', 'outline', 'outline', _, _, 'outline', 'outline', _, _, _, _, _, 'outline', 'highlight', 'detail2', 'detail2', 'accent', 'outline', _, _],
/* row  8 */ [_, _, _, _, _, 'outline', 'highlight', 'outline', _, _, _, 'outline', 'bodyD', 'bodyD', 'bodyD', 'outline', 'outline', 'highlight', 'highlight', 'outline', 'outline', _, _, _, 'outline', 'accent', 'detail2', 'detail2', 'highlight', 'outline', _, _],
/* row  9 */ [_, _, _, _, _, 'outline', 'highlight', 'outline', _, _, 'outline', 'highlight', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'highlight', 'highlight', 'highlight', 'outline', 'outline', _, _, 'outline', 'highlight', 'detail2', 'outline', _, _, _],
/* row 10 */ [_, _, _, _, 'outline', 'highlight', 'shadow', 'outline', _, 'outline', 'shadow', 'highlight', 'outline', 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', 'detail5', 'outline', 'highlight', 'outline', _, _, _],
/* row 11 */ [_, _, _, _, 'outline', 'highlight', 'outline', _, _, 'outline', 'highlight', 'outline', 'detail5', 'detail5', 'outline', 'bodyD', 'bodyD', 'bodyD', 'body', 'highlight', 'body', 'shadow', 'highlight', 'highlight', 'highlight', 'outline', 'body', 'shadow', 'shadow', 'outline', _, _],
/* row 12 */ [_, _, _, 'outline', 'highlight', 'highlight', 'body', 'outline', 'outline', 'highlight', 'highlight', 'outline', 'detail5', 'detail5', 'detail5', 'outline', 'bodyD', 'body', 'highlight', 'body', 'bodyL', 'bodyL', 'shadow', 'shadow', 'highlight', 'highlight', 'body', 'shadow', 'shadow', 'outline', _, _],
/* row 13 */ [_, _, _, 'outline', 'highlight', 'highlight', 'highlight', 'shadow', 'highlight', 'highlight', 'body', 'outline', 'outline', 'detail5', 'detail5', 'outline', 'body', 'highlight', 'highlight', 'body', 'bodyL', 'bodyL', 'bodyL', 'shadow', 'shadow', 'shadow', 'highlight', 'body', 'shadow', 'shadow', 'outline', _],
/* row 14 */ [_, _, 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'shadow', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'body', 'shadow', 'body', 'belly', 'belly', 'bodyL', 'bodyL', 'shadow', 'shadow', 'shadow', 'body', 'shadow', 'outline', _],
/* row 15 */ [_, _, 'outline', 'highlight', 'highlight', 'highlight', 'shadow', 'highlight', 'detail5', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'body', 'body', 'belly', 'belly', 'bodyL', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'outline'],
/* row 16 */ [_, _, 'outline', 'shadow', 'highlight', 'bodyD', 'highlight', 'outline', 'detail5', 'shadow', 'body', 'body', 'shadow', 'shadow', 'shadow', 'highlight', 'body', 'highlight', 'highlight', 'highlight', 'body', 'shadow', 'shadow', 'body', 'belly', 'outline', 'outline', 'shadow', 'shadow', 'body', 'shadow', 'outline'],
/* row 17 */ [_, 'outline', 'highlight', 'highlight', 'shadow', 'shadow', 'outline', 'bodyL', 'shadow', 'shadow', 'body', 'bodyD', 'outline', 'shadow', 'detail4', 'detail4', 'detail4', 'body', 'body', 'highlight', 'highlight', 'body', 'shadow', 'shadow', 'outline', 'detail5', 'detail5', 'outline', 'shadow', 'body', 'shadow', 'outline'],
/* row 18 */ ['outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'body', 'bodyD', 'outline', 'detail5', 'outline', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'body', 'highlight', 'highlight', 'body', 'shadow', 'shadow', 'outline', 'outline', 'shadow', 'body', 'body', 'shadow', 'outline'],
/* row 19 */ ['outline', 'highlight', 'highlight', 'bodyD', 'highlight', 'highlight', 'shadow', 'outline', 'body', 'bodyD', 'bodyD', 'outline', 'detail5', 'outline', 'detail1', 'detail4', 'detail4', 'detail4', 'body', 'body', 'highlight', 'body', 'body', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _],
/* row 20 */ [_, 'outline', 'shadow', 'highlight', 'shadow', 'outline', 'outline', _, 'outline', 'detail3', 'bodyD', 'detail3', 'outline', 'shadow', 'body', 'detail1', 'detail4', 'body', 'body', 'highlight', 'highlight', 'body', 'highlight', 'shadow', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'shadow', 'outline', _],
/* row 21 */ [_, _, 'outline', 'outline', 'outline', _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'shadow', 'shadow', 'shadow', 'body', 'detail5', 'highlight', 'highlight', 'body', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'outline', _, _],
/* row 22 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'shadow', 'shadow', 'body', 'body', 'detail5', 'body', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'outline', 'outline', 'outline', _, _, _],
/* row 23 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'detail1', 'body', 'shadow', 'highlight', 'highlight', 'shadow', 'shadow', 'outline', _, _, _, _, _, _],
/* row 24 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _, _, _, _, _, _],
/* row 25 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'detail5', 'shadow', 'detail3', 'outline', _, _, _, _, _, _, _],
/* row 26 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _],
]
