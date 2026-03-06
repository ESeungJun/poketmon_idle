// 파이리(Charmander) — pixel art (auto-converted from 22×20)
const _ = null

export const COLORS = {
  outline: '#191919',
  eye: '#196363',
  grayD: '#525252',
  bodyD: '#AD5242',
  body: '#D66342',
  bodyL: '#F79429',
  flame: '#F7F729',
  belly: '#DEBD84',
  gray: '#BDBDBD',
  bellyL: '#F7E69C',
  white: '#FFFFFF',
}

// grid: 22×20
export const BASE_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', _, _, _],
/* row  1 */ [_, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _, 'outline', 'body', 'outline', _, _],
/* row  2 */ [_, _, _, 'outline', 'outline', 'bodyL', 'bodyL', 'body', 'outline', 'outline', _, _, _, _, _, _, _, 'outline', 'body', 'body', 'outline', _],
/* row  3 */ [_, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'body', 'outline', _, _, _, _, _, _, 'outline', 'body', 'body', 'outline', _],
/* row  4 */ [_, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _, _, _, 'outline', 'body', 'body', 'bodyL', 'body', 'outline'],
/* row  5 */ [_, 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'body', 'bodyL', 'bodyL', 'bodyL', 'body', 'outline', _, _, _, _, 'outline', 'body', 'bodyL', 'flame', 'body', 'outline'],
/* row  6 */ [_, 'outline', 'bodyL', 'bodyL', 'bodyL', 'body', 'white', 'outline', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _, _, 'outline', 'body', 'flame', 'flame', 'body', 'outline'],
/* row  7 */ ['outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyD', 'eye', 'outline', 'bodyL', 'bodyL', 'body', 'outline', _, _, _, _, _, 'outline', 'flame', 'body', 'outline', _],
/* row  8 */ ['outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'body', 'body', 'body', 'outline', _, _, _, _, _, 'outline', 'body', 'outline', _, _],
/* row  9 */ ['outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'body', 'body', 'body', 'outline', _, _, _, _, _, 'outline', 'body', 'outline', _, _],
/* row 10 */ [_, 'outline', 'body', 'bodyL', 'bodyL', 'bodyL', 'body', 'body', 'body', 'body', 'body', 'body', 'outline', _, _, _, _, 'outline', 'bodyL', 'outline', _, _],
/* row 11 */ [_, _, 'outline', 'outline', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'body', 'outline', _, _, _, 'outline', 'bodyL', 'bodyL', 'outline', _, _],
/* row 12 */ [_, _, _, _, 'outline', 'outline', 'belly', 'body', 'body', 'body', 'grayD', 'body', 'body', 'outline', _, 'outline', 'body', 'bodyL', 'outline', _, _, _],
/* row 13 */ [_, _, _, _, _, 'outline', 'bellyL', 'bellyL', 'grayD', 'grayD', 'bodyD', 'bodyL', 'body', 'body', 'outline', 'body', 'body', 'body', 'outline', _, _, _],
/* row 14 */ [_, _, _, _, _, 'outline', 'bellyL', 'bellyL', 'grayD', 'grayD', 'bodyL', 'body', 'grayD', 'body', 'body', 'grayD', 'body', 'outline', _, _, _, _],
/* row 15 */ [_, _, _, _, 'outline', 'bodyD', 'bodyD', 'bellyL', 'bellyL', 'bellyL', 'grayD', 'grayD', 'body', 'body', 'body', 'grayD', 'outline', _, _, _, _, _],
/* row 16 */ [_, _, _, _, 'outline', 'gray', 'bodyD', 'grayD', 'belly', 'belly', 'belly', 'body', 'body', 'body', 'bodyD', 'outline', _, _, _, _, _, _],
/* row 17 */ [_, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'outline', 'grayD', 'bodyD', 'body', 'bodyD', 'outline', _, _, _, _, _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, _, _, _, 'outline', 'white', 'bodyD', 'white', 'outline', _, _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = {
  outline: '#191919',
  body: '#323232',
  bodyL: '#515151',
  bodyD: '#A74F41',
  belly: '#D05D3E',
  shadow: '#D3735B',
  accent: '#F38F20',
  highlight: '#EB9E46',
  detail1: '#F1EC1F',
  detail2: '#F3E197',
  detail3: '#FEFEFE',
}

// grid: 22×20
export const SLEEP_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, 'body', 'body', 'body', _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, 'body', 'body', 'accent', 'accent', 'belly', 'body', 'outline', _, _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */ [_, _, 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'belly', 'shadow', 'body', _, _, _, _, _, _, _, _, _, _, _],
/* row  4 */ [_, _, 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', _, _, _, _, _, _, _, _, _, _, _],
/* row  5 */ [_, 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'belly', 'body', 'body', 'body', 'body', 'body', _, _, _, _, _, _],
/* row  6 */ [_, 'body', 'accent', 'accent', 'accent', 'belly', 'accent', 'accent', 'accent', 'accent', 'belly', 'body', 'belly', 'belly', 'accent', 'belly', 'body', 'body', _, _, _, _],
/* row  7 */ ['body', 'accent', 'accent', 'accent', 'accent', 'body', 'body', 'body', 'accent', 'accent', 'belly', 'belly', 'belly', 'belly', 'belly', 'accent', 'accent', 'belly', 'body', _, _, _],
/* row  8 */ ['body', 'accent', 'accent', 'accent', 'accent', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'accent', 'shadow', 'outline', _, _],
/* row  9 */ ['body', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'accent', 'belly', 'body', _, _],
/* row 10 */ [_, 'body', 'accent', 'belly', 'accent', 'accent', 'accent', 'belly', 'body', 'body', 'belly', 'accent', 'bodyL', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'accent', 'bodyD', 'body', _],
/* row 11 */ [_, _, 'body', 'body', 'body', 'body', 'body', 'body', 'highlight', 'accent', 'accent', 'belly', 'bodyL', 'detail2', 'bodyL', 'accent', 'belly', 'belly', 'belly', 'belly', 'body', _],
/* row 12 */ [_, _, _, 'bodyL', 'belly', 'body', 'body', 'belly', 'accent', 'accent', 'belly', 'bodyL', 'detail2', 'bodyL', 'accent', 'belly', 'belly', 'belly', 'belly', 'belly', 'belly', 'body'],
/* row 13 */ [_, _, _, 'body', 'accent', 'belly', 'body', 'bodyD', 'belly', 'shadow', 'body', 'detail2', 'detail2', 'bodyL', 'accent', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'belly', 'body'],
/* row 14 */ [_, _, 'body', 'belly', 'accent', 'detail1', 'belly', 'body', 'body', 'outline', 'detail3', 'bodyL', 'body', 'bodyL', 'belly', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'belly', 'body'],
/* row 15 */ [_, _, 'body', 'belly', 'accent', 'detail1', 'belly', 'body', 'detail3', 'detail3', 'body', 'bodyD', 'belly', 'belly', 'belly', 'bodyL', 'bodyL', 'detail2', 'belly', 'bodyD', 'body', _],
/* row 16 */ [_, _, _, _, 'belly', 'belly', 'accent', 'detail2', 'outline', 'body', 'body', 'body', 'bodyL', 'bodyL', 'bodyL', 'detail2', 'detail2', 'accent', 'belly', 'body', _, _],
/* row 17 */ [_, _, _, _, _, _, 'body', 'belly', 'accent', 'accent', 'detail2', 'detail2', 'detail2', 'detail2', 'detail2', 'accent', 'belly', 'belly', 'body', _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, 'body', 'body', 'body', 'body', 'belly', 'belly', 'belly', 'belly', 'belly', 'body', 'body', _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, _, _, 'body', 'body', 'body', 'body', 'body', _, _, _, _, _, _],
]