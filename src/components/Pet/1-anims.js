// 이상해씨(Bulbasaur) — pixel art (auto-converted from 21×20)
const _ = null

export const COLORS = {
  outline: '#191919',
  bodyD: '#42733A',
  grayD: '#525252',
  nose: '#BD4A42',
  body: '#639C63',
  red: '#E64A42',
  bodyL: '#7BCE7B',
  gray: '#BDBDBD',
  white: '#FFFFFF',
}

// grid: 21×20
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', _, 'outline', _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'bodyL', 'outline', 'bodyL', 'outline', _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'body', 'bodyL', 'body', 'outline', _, _, _, _],
/* row  3 */ [_, _, _, _, _, _, _, _, _, 'outline', 'outline', 'body', 'bodyD', 'bodyD', 'body', 'bodyD', 'body', 'outline', 'outline', _, _],
/* row  4 */ [_, _, _, _, _, _, _, 'outline', 'outline', 'body', 'body', 'bodyD', 'body', 'bodyD', 'body', 'bodyD', 'body', 'body', 'bodyD', 'outline', _],
/* row  5 */ [_, _, _, 'outline', _, _, 'outline', 'body', 'body', 'body', 'bodyD', 'body', 'body', 'bodyD', 'body', 'body', 'bodyD', 'body', 'body', 'bodyD', 'outline'],
/* row  6 */ [_, _, 'outline', 'bodyL', 'outline', 'outline', 'grayD', 'body', 'body', 'bodyD', 'body', 'body', 'bodyD', 'body', 'body', 'body', 'body', 'bodyD', 'body', 'body', 'outline'],
/* row  7 */ [_, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'body', 'grayD', 'grayD', 'grayD', 'body', 'body', 'bodyD', 'body', 'body', 'body', 'body', 'bodyD', 'body', 'body', 'outline'],
/* row  8 */ [_, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'body', 'grayD', 'grayD', 'grayD', 'body', 'body', 'bodyD', 'body', 'body', 'body', 'body', 'bodyD', 'body', 'body', 'outline'],
/* row  9 */ [_, _, 'outline', 'bodyL', 'bodyL', 'body', 'bodyD', 'bodyD', 'bodyD', 'body', 'grayD', 'body', 'bodyD', 'body', 'body', 'body', 'body', 'bodyD', 'body', 'body', 'outline'],
/* row 10 */ [_, 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'bodyL', 'body', 'grayD', 'grayD', 'grayD', 'body', 'body', 'body', 'bodyD', 'body', 'outline', _],
/* row 11 */ [_, 'outline', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'grayD', 'body', 'body', 'bodyD', 'grayD', 'outline', _, _],
/* row 12 */ ['outline', 'nose', 'bodyD', 'bodyL', 'bodyL', 'bodyL', 'body', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'grayD', 'body', 'grayD', 'grayD', 'grayD', 'body', 'outline', _, _],
/* row 13 */ ['outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyD', 'bodyL', 'grayD', 'grayD', 'outline', 'grayD', 'bodyL', 'body', 'body', 'body', 'body', 'body', 'bodyD', 'bodyD', 'outline', _],
/* row 14 */ [_, 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'outline', 'white', 'white', 'body', 'body', 'body', 'grayD', 'body', 'body', 'bodyD', 'bodyD', 'outline', _],
/* row 15 */ [_, 'outline', 'body', 'bodyL', 'bodyL', 'bodyL', 'outline', 'red', 'red', 'white', 'body', 'body', 'body', 'bodyD', 'bodyD', 'grayD', 'body', 'body', 'body', 'outline', _],
/* row 16 */ [_, _, 'outline', 'outline', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'grayD', 'body', 'bodyD', 'bodyD', 'grayD', 'body', 'gray', 'outline', _, _],
/* row 17 */ [_, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'outline', 'body', 'body', 'body', 'body', 'grayD', 'outline', 'outline', _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, _, _, _, 'outline', 'white', 'body', 'white', 'grayD', 'outline', _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _],
]

export const SLEEP_COLORS = {
  outline: '#191919',
  body: '#333333',
  bodyL: '#43723C',
  bodyD: '#525252',
  belly: '#568855',
  shadow: '#B84844',
  accent: '#DF4841',
  highlight: '#6DAB55',
  detail1: '#7BCA77',
  detail2: '#9CD699',
  detail3: '#BAB9B7',
  detail6: '#FFFFFF',
}

// grid: 21×20
export const SLEEP_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, 'body', _, 'body', _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, _, _, 'body', 'detail1', 'body', 'detail1', 'body', _, _, _, _],
/* row  2 */ [_, _, _, _, _, _, _, _, _, _, _, 'body', 'body', 'highlight', 'detail1', 'highlight', 'body', _, _, _, _],
/* row  3 */ [_, _, _, _, _, _, _, _, 'outline', 'body', 'body', 'highlight', 'bodyL', 'bodyL', 'highlight', 'bodyL', 'highlight', 'body', 'body', _, _],
/* row  4 */ [_, _, _, _, _, _, _, 'body', 'highlight', 'highlight', 'highlight', 'bodyL', 'highlight', 'highlight', 'highlight', 'bodyL', 'highlight', 'highlight', 'bodyL', 'body', _],
/* row  5 */ [_, _, _, 'body', _, _, 'body', 'belly', 'highlight', 'highlight', 'bodyL', 'highlight', 'highlight', 'bodyL', 'highlight', 'highlight', 'bodyL', 'highlight', 'highlight', 'bodyL', 'body'],
/* row  6 */ [_, _, 'body', 'detail1', 'body', 'body', 'bodyD', 'bodyD', 'body', 'body', 'belly', 'highlight', 'highlight', 'bodyL', 'highlight', 'highlight', 'highlight', 'bodyL', 'highlight', 'belly', 'body'],
/* row  7 */ [_, _, 'body', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'belly', 'belly', 'body', 'body', 'body', 'highlight', 'highlight', 'highlight', 'highlight', 'bodyL', 'belly', 'belly', 'body'],
/* row  8 */ [_, _, 'body', 'detail1', 'detail1', 'belly', 'bodyL', 'detail1', 'bodyL', 'bodyD', 'detail2', 'detail2', 'body', 'bodyL', 'bodyL', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'body'],
/* row  9 */ [_, _, 'body', 'detail1', 'detail1', 'highlight', 'bodyL', 'detail1', 'body', 'bodyD', 'detail1', 'detail1', 'body', 'belly', 'belly', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'body'],
/* row 10 */ [_, 'body', 'detail1', 'detail1', 'highlight', 'bodyL', 'bodyL', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'belly', 'body', 'belly', 'belly', 'belly', 'bodyL', 'belly', 'body', _],
/* row 11 */ [_, 'body', 'belly', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'highlight', 'highlight', 'belly', 'body', 'body', 'body', 'bodyD', 'body', _, _],
/* row 12 */ ['body', 'shadow', 'bodyL', 'detail1', 'bodyL', 'detail1', 'highlight', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'highlight', 'highlight', 'belly', 'bodyL', 'bodyL', 'belly', 'body', _, _],
/* row 13 */ ['body', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'belly', 'highlight', 'belly', 'belly', 'belly', 'belly', 'belly', 'body', _],
/* row 14 */ ['body', 'highlight', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'body', 'body', 'body', 'body', 'highlight', 'highlight', 'belly', 'highlight', 'highlight', 'bodyD', 'bodyL', 'belly', 'body', _],
/* row 15 */ [_, 'body', 'highlight', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'accent', 'accent', 'bodyD', 'bodyL', 'bodyL', 'bodyD', 'belly', 'bodyL', 'belly', 'body', _],
/* row 16 */ [_, _, 'body', 'body', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'bodyD', 'highlight', 'bodyL', 'bodyL', 'bodyD', 'highlight', 'belly', 'body', _, _],
/* row 17 */ [_, _, _, _, 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'highlight', 'highlight', 'highlight', 'highlight', 'bodyD', 'body', 'body', _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, _, _, _, 'body', 'detail6', 'highlight', 'detail3', 'bodyD', 'body', _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, _, 'body', 'body', 'body', _, _, _, _, _, _, _],
]