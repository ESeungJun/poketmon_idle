// 이상해풀(Ivysaur) — pixel art (auto-converted from 21×20)
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#3A6B3A',
  bodyL: '#525252',
  bodyD: '#217363',
  belly: '#9C3A42',
  shadow: '#528C52',
  accent: '#429484',
  highlight: '#BD525A',
  detail1: '#6BAD52',
  detail2: '#E6636B',
  detail3: '#6BBDA5',
  detail4: '#BDBDBD',
  detail5: '#FFFFFF',
}

// grid: 21×20
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, 'outline', 'belly', 'detail2', 'detail2', 'outline', _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, 'outline', 'highlight', 'detail2', 'belly', 'detail2', 'detail2', 'outline', _, _, _, _, _, _],
/* row  3 */ [_, _, _, _, _, _, _, _, 'outline', 'detail2', 'highlight', 'belly', 'detail2', 'detail2', 'bodyL', 'outline', 'outline', 'outline', _, _, _],
/* row  4 */ [_, _, _, _, _, _, 'outline', 'outline', 'highlight', 'detail2', 'belly', 'detail2', 'detail2', 'highlight', 'highlight', 'bodyL', 'shadow', 'shadow', 'outline', _, _],
/* row  5 */ [_, _, _, 'outline', _, 'outline', 'body', 'bodyL', 'highlight', 'highlight', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'bodyL', 'bodyL', 'outline', _, _, _],
/* row  6 */ [_, _, 'outline', 'detail3', 'bodyL', 'shadow', 'shadow', 'body', 'bodyL', 'highlight', 'belly', 'highlight', 'highlight', 'highlight', 'bodyL', 'shadow', 'detail1', 'outline', 'outline', _, _],
/* row  7 */ [_, _, 'outline', 'detail3', 'detail3', 'bodyL', 'bodyL', 'shadow', 'shadow', 'bodyL', 'highlight', 'highlight', 'bodyL', 'bodyL', 'body', 'body', 'body', 'detail1', 'detail1', 'outline', _],
/* row  8 */ [_, _, 'outline', 'detail3', 'detail3', 'detail3', 'accent', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'detail1', 'body', 'detail1', 'detail1', 'body', 'body', 'body', 'outline', _],
/* row  9 */ [_, 'outline', 'detail3', 'detail3', 'detail3', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'accent', 'bodyL', 'bodyL', 'bodyL', 'shadow', 'detail1', 'body', 'detail1', 'detail1', 'body', 'detail1', 'outline'],
/* row 10 */ [_, 'outline', 'accent', 'detail3', 'detail3', 'detail3', 'bodyD', 'bodyD', 'accent', 'detail3', 'detail3', 'detail3', 'detail3', 'bodyL', 'shadow', 'body', 'shadow', 'body', 'detail1', 'body', 'outline'],
/* row 11 */ ['outline', 'highlight', 'bodyD', 'detail3', 'bodyD', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'accent', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'shadow', 'shadow', 'outline'],
/* row 12 */ ['outline', 'highlight', 'detail3', 'detail3', 'detail3', 'detail3', 'accent', 'detail3', 'detail3', 'detail3', 'accent', 'bodyL', 'bodyL', 'accent', 'accent', 'accent', 'accent', 'bodyL', 'bodyL', 'bodyL', 'outline'],
/* row 13 */ ['outline', 'detail3', 'detail3', 'detail3', 'detail3', 'bodyD', 'detail3', 'bodyL', 'outline', 'detail3', 'detail3', 'accent', 'accent', 'accent', 'bodyL', 'accent', 'bodyD', 'bodyD', 'accent', 'accent', 'outline'],
/* row 14 */ [_, 'outline', 'detail3', 'detail3', 'detail3', 'detail3', 'outline', 'outline', 'detail5', 'detail3', 'accent', 'accent', 'bodyD', 'bodyD', 'accent', 'bodyL', 'accent', 'accent', 'accent', 'outline', _],
/* row 15 */ [_, 'outline', 'accent', 'detail3', 'detail3', 'outline', 'detail2', 'detail2', 'detail5', 'accent', 'accent', 'accent', 'bodyD', 'bodyD', 'accent', 'outline', 'detail4', 'accent', 'detail4', 'outline', _],
/* row 16 */ [_, _, 'outline', 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'bodyL', 'accent', 'accent', 'accent', 'outline', _, 'outline', 'outline', 'outline', _, _],
/* row 17 */ [_, _, _, _, 'outline', 'outline', 'bodyL', 'detail4', 'outline', 'outline', 'accent', 'accent', 'accent', 'accent', 'outline', _, _, _, _, _, _],
/* row 18 */ [_, _, _, _, _, _, 'outline', 'outline', _, 'outline', 'detail5', 'accent', 'detail5', 'outline', _, _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = {
  outline: '#191919',
  body: '#3E6C3E',
  bodyL: '#545454',
  bodyD: '#267266',
  belly: '#A03A45',
  shadow: '#548951',
  accent: '#6AA551',
  highlight: '#BC4E57',
  detail1: '#4A9286',
  detail3: '#E5626A',
  detail4: '#75BEAB',
  detail5: '#FFFFFF',
}

// grid: 21×20
export const SLEEP_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, 'outline', 'outline', 'highlight', 'detail3', 'belly', 'highlight', 'outline', _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, 'outline', 'detail3', 'detail3', 'detail3', 'belly', 'highlight', 'detail3', 'detail3', 'outline', _, _, _, _],
/* row  3 */ [_, _, _, _, _, 'outline', 'outline', 'outline', 'highlight', 'detail3', 'detail3', 'belly', 'detail3', 'detail3', 'belly', 'detail3', 'highlight', 'outline', _, _, _],
/* row  4 */ [_, _, _, 'outline', 'outline', 'accent', 'body', 'outline', 'highlight', 'detail3', 'belly', 'detail3', 'detail3', 'detail3', 'belly', 'detail3', 'detail3', 'outline', 'outline', _, _],
/* row  5 */ [_, _, _, 'outline', 'accent', 'accent', 'accent', 'bodyL', 'highlight', 'highlight', 'belly', 'detail3', 'detail3', 'detail3', 'highlight', 'belly', 'highlight', 'outline', 'body', 'outline', _],
/* row  6 */ [_, _, _, 'outline', 'outline', 'body', 'accent', 'body', 'bodyL', 'highlight', 'belly', 'highlight', 'detail3', 'highlight', 'highlight', 'belly', 'highlight', 'bodyL', 'shadow', 'outline', _],
/* row  7 */ [_, _, 'outline', 'detail1', 'detail1', 'outline', 'outline', 'outline', 'shadow', 'body', 'bodyL', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'bodyL', 'body', 'outline', _, _],
/* row  8 */ [_, _, 'outline', 'detail1', 'detail1', 'detail4', 'detail4', 'detail4', 'bodyL', 'outline', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'accent', 'body', 'outline', _],
/* row  9 */ [_, _, 'outline', 'detail4', 'detail4', 'detail4', 'bodyD', 'bodyD', 'detail4', 'detail1', 'bodyL', 'bodyL', 'bodyL', 'shadow', 'body', 'accent', 'accent', 'body', 'accent', 'outline', _],
/* row 10 */ [_, 'outline', 'detail4', 'detail4', 'bodyD', 'detail4', 'bodyD', 'detail4', 'detail4', 'detail1', 'detail4', 'detail4', 'bodyL', 'outline', 'outline', 'outline', 'body', 'accent', 'body', 'accent', 'outline'],
/* row 11 */ [_, 'outline', 'detail4', 'detail1', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'bodyL', 'bodyL', 'detail1', 'bodyD', 'detail1', 'bodyL', 'shadow', 'outline', 'shadow', 'outline'],
/* row 12 */ ['outline', 'detail1', 'detail4', 'detail1', 'detail4', 'bodyD', 'detail4', 'detail1', 'detail4', 'detail4', 'detail4', 'detail4', 'bodyL', 'detail1', 'bodyD', 'bodyD', 'detail1', 'bodyL', 'outline', 'outline', _],
/* row 13 */ ['outline', 'detail3', 'outline', 'detail4', 'detail4', 'detail4', 'detail1', 'detail4', 'detail4', 'detail1', 'detail4', 'detail4', 'detail1', 'detail1', 'detail1', 'detail1', 'bodyL', 'detail4', 'detail1', 'outline', _],
/* row 14 */ ['outline', 'detail1', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'outline', 'outline', 'outline', 'detail4', 'detail4', 'detail1', 'detail1', 'detail1', 'bodyL', 'detail4', 'detail4', 'bodyD', 'outline', _],
/* row 15 */ [_, 'outline', 'detail1', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail3', 'detail3', 'detail1', 'detail4', 'detail1', 'bodyL', 'detail1', 'detail1', 'detail1', 'detail1', 'outline', _],
/* row 16 */ [_, _, 'outline', 'outline', 'detail4', 'detail4', 'detail4', 'detail4', 'detail1', 'detail1', 'bodyL', 'bodyD', 'detail4', 'detail1', 'bodyL', 'detail5', 'detail1', 'detail5', 'outline', _, _],
/* row 17 */ [_, _, _, _, 'outline', 'outline', 'outline', 'outline', 'bodyL', 'bodyL', 'detail4', 'detail4', 'bodyD', 'detail1', 'outline', 'outline', 'outline', 'outline', _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, 'outline', 'detail5', 'detail1', 'detail5', 'detail1', 'detail1', 'outline', _, _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _],
]
