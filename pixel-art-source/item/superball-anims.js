// superball — pixel art (auto-converted from 23×25)
const _ = null

export const COLORS = {
  outline: '#000000',
  body: '#3D0000',
  bodyL: '#383838',
  bodyD: '#0F647F',
  belly: '#FE0000',
  shadow: '#68686A',
  accent: '#797C83',
  highlight: '#01B0F1',
  detail1: '#2BA5DB',
  detail2: '#979799',
  detail3: '#D8D8D8',
  detail4: '#FFFFFF',
}

// grid: 23×25
export const BASE_BODY = [
/* row  0 */ [_, _, _, 'detail3', _, _, 'detail3', _, 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', _, 'detail3', 'detail3', _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, 'shadow', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'shadow', 'shadow', 'shadow', 'shadow', _, _, _],
/* row  3 */ [_, _, _, _, 'outline', 'outline', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', 'outline', 'outline', _, _, _],
/* row  4 */ [_, _, 'detail3', 'detail3', 'body', 'body', 'body', 'body', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'body', 'body', 'body', 'body', 'detail3', 'detail3', _],
/* row  5 */ [_, _, 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _],
/* row  6 */ [_, _, 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'detail1', 'detail1', 'highlight', 'highlight', 'highlight', 'highlight', 'detail1', 'detail1', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _],
/* row  7 */ [_, _, 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _],
/* row  8 */ [_, _, 'outline', 'outline', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'outline', 'outline', _],
/* row  9 */ ['outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'belly', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'belly', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'outline'],
/* row 10 */ ['outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'belly', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'belly', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'outline'],
/* row 11 */ ['outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'outline'],
/* row 12 */ ['outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'outline'],
/* row 13 */ ['outline', 'outline', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', 'detail4', 'detail4', 'detail3', 'detail3', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', 'outline'],
/* row 14 */ ['outline', 'outline', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', 'detail4', 'detail4', 'detail3', 'detail3', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', 'outline'],
/* row 15 */ ['outline', 'outline', 'detail4', 'detail4', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'detail3', 'detail3', 'outline'],
/* row 16 */ ['outline', 'outline', 'detail4', 'detail4', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'detail3', 'detail3', 'outline'],
/* row 17 */ [_, _, 'outline', 'outline', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'outline', 'outline', 'outline', 'outline', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', _],
/* row 18 */ [_, _, 'outline', 'outline', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'outline', 'outline', 'outline', 'outline', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', _],
/* row 19 */ [_, _, 'outline', 'outline', 'detail3', 'detail3', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', _],
/* row 20 */ [_, _, 'outline', 'outline', 'detail3', 'detail3', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', _],
/* row 21 */ [_, _, 'detail2', 'detail2', 'outline', 'outline', 'outline', 'outline', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', 'outline', 'outline', 'detail2', 'detail2', _],
/* row 22 */ [_, _, _, _, 'outline', 'outline', 'outline', 'outline', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', 'outline', 'outline', _, _, _],
/* row 23 */ [_, _, _, _, 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', _, _, _],
/* row 24 */ [_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _],
]
