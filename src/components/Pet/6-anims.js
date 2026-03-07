// 리자몽(Charizard) — pixel art (auto-converted from 32×24)
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#191919',
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
/* row 10 */ [_, _, _, _, 'outline', 'highlight', 'shadow', 'outline', _, 'outline', 'shadow', 'highlight', 'outline', 'outline', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'body', 'highlight', 'highlight', 'highlight', 'highlight', 'outline', 'outline', _, 'outline', 'highlight', 'outline', _, _, _],
/* row 11 */ [_, _, _, _, 'outline', 'highlight', 'outline', _, _, 'outline', 'highlight', 'outline', _, _, 'outline', 'bodyD', 'bodyD', 'bodyD', 'body', 'highlight', 'body', 'shadow', 'highlight', 'highlight', 'highlight', 'outline', 'body', 'shadow', 'shadow', 'outline', _, _],
/* row 12 */ [_, _, _, 'outline', 'highlight', 'highlight', 'body', 'outline', 'outline', 'highlight', 'highlight', 'outline', _, _, _, 'outline', 'bodyD', 'body', 'highlight', 'body', 'bodyL', 'bodyL', 'shadow', 'shadow', 'highlight', 'highlight', 'body', 'shadow', 'shadow', 'outline', _, _],
/* row 13 */ [_, _, _, 'outline', 'highlight', 'highlight', 'highlight', 'shadow', 'highlight', 'highlight', 'body', 'outline', 'outline', _, _, 'outline', 'body', 'highlight', 'highlight', 'body', 'bodyL', 'bodyL', 'bodyL', 'shadow', 'shadow', 'shadow', 'highlight', 'body', 'shadow', 'shadow', 'outline', _],
/* row 14 */ [_, _, 'outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'shadow', 'outline', 'outline', 'highlight', 'highlight', 'highlight', 'body', 'shadow', 'body', 'belly', 'belly', 'bodyL', 'bodyL', 'shadow', 'shadow', 'shadow', 'body', 'shadow', 'outline', _],
/* row 15 */ [_, _, 'outline', 'highlight', 'highlight', 'highlight', 'shadow', 'highlight', 'detail5', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'body', 'body', 'belly', 'belly', 'bodyL', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'outline'],
/* row 16 */ [_, _, 'outline', 'shadow', 'highlight', 'bodyD', 'highlight', 'outline', 'detail5', 'shadow', 'body', 'body', 'shadow', 'shadow', 'shadow', 'highlight', 'body', 'highlight', 'highlight', 'highlight', 'body', 'shadow', 'shadow', 'body', 'belly', 'outline', 'outline', 'shadow', 'shadow', 'body', 'shadow', 'outline'],
/* row 17 */ [_, 'outline', 'highlight', 'highlight', 'shadow', 'shadow', 'outline', 'bodyL', 'shadow', 'shadow', 'body', 'bodyD', 'outline', 'shadow', 'detail4', 'detail4', 'detail4', 'body', 'body', 'highlight', 'highlight', 'body', 'shadow', 'shadow', 'outline', _, _, 'outline', 'shadow', 'body', 'shadow', 'outline'],
/* row 18 */ ['outline', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'body', 'bodyD', 'outline', _, 'outline', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'body', 'highlight', 'highlight', 'body', 'shadow', 'shadow', 'outline', 'outline', 'shadow', 'body', 'body', 'shadow', 'outline'],
/* row 19 */ ['outline', 'highlight', 'highlight', 'bodyD', 'highlight', 'highlight', 'shadow', 'outline', 'body', 'bodyD', 'bodyD', 'outline', _, 'outline', 'detail1', 'detail4', 'detail4', 'detail4', 'body', 'body', 'highlight', 'body', 'body', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _],
/* row 20 */ [_, 'outline', 'shadow', 'highlight', 'shadow', 'outline', 'outline', _, 'outline', 'detail3', 'bodyD', 'detail3', 'outline', 'shadow', 'body', 'detail1', 'detail4', 'body', 'body', 'highlight', 'highlight', 'body', 'highlight', 'shadow', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'shadow', 'outline', _],
/* row 21 */ [_, _, 'outline', 'outline', 'outline', _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'shadow', 'shadow', 'shadow', 'body', 'detail5', 'highlight', 'highlight', 'body', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'body', 'shadow', 'shadow', 'outline', _, _],
/* row 22 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'shadow', 'shadow', 'shadow', 'body', 'body', 'detail5', 'body', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'outline', 'outline', 'outline', _, _, _],
/* row 23 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'detail1', 'body', 'shadow', 'highlight', 'highlight', 'shadow', 'shadow', 'outline', _, _, _, _, _, _],
/* row 24 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _, _, _, _, _, _],
/* row 25 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'detail5', 'shadow', 'detail3', 'outline', _, _, _, _, _, _, _],
/* row 26 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _],
]

// grid: 32×18 (sleeping / sitting)

// sleep/6-anims.js — pixel art (auto-converted from 32×27)


export const SLEEP_COLORS = {
  outline: '#191919',
  body: '#336D5F',
  bodyL: '#191919',
  bodyD: '#CA4033',
  belly: '#4A8374',
  shadow: '#D65F3F',
  accent: '#FC5832',
  highlight: '#D38545',
  detail1: '#F48F27',
  detail2: '#D5B05F',
  detail3: '#FCDA30',
  detail4: '#F4D26E',
  detail5: '#C0C0C0',
  detail6: '#FEFEFE',
}

// grid: 32×27
export const SLEEP_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'bodyD', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, 'bodyD', 'accent', 'bodyD', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, 'bodyD', 'detail1', 'accent', 'bodyD', _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */ [_, _, _, _, 'outline', 'shadow', 'outline', _, 'outline', _, _, _, _, _, _, 'accent', 'detail1', 'accent', _, 'outline', _, _, _, _, _, _, _, _, _, _, _, _],
/* row  4 */ [_, _, _, _, 'outline', 'shadow', 'shadow', 'outline', 'detail1', 'outline', _, _, _, _, 'bodyD', 'detail1', 'detail1', 'detail3', 'outline', 'detail1', 'outline', _, _, _, _, _, _, _, _, _, _, _],
/* row  5 */ [_, _, _, 'outline', 'shadow', 'bodyL', 'outline', 'detail1', 'shadow', 'outline', 'outline', _, _, _, 'bodyD', 'detail1', 'detail3', 'detail1', 'bodyD', 'outline', 'detail1', 'outline', 'outline', _, _, _, _, _, _, _, _, _],
/* row  6 */ [_, _, _, 'outline', 'detail1', 'shadow', 'shadow', 'detail1', 'outline', 'detail1', 'detail1', 'outline', 'outline', _, _, 'bodyD', 'detail1', 'outline', 'shadow', 'outline', 'detail1', 'detail1', 'detail1', 'outline', _, _, _, _, _, _, _, _],
/* row  7 */ [_, _, 'outline', 'shadow', 'detail1', 'detail1', 'detail1', 'detail1', 'shadow', 'detail1', 'detail1', 'detail1', 'detail1', 'outline', _, _, 'outline', 'shadow', 'outline', 'detail1', 'bodyL', 'body', 'bodyL', 'detail1', 'outline', _, _, _, _, _, _, _],
/* row  8 */ [_, 'outline', 'shadow', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'shadow', 'shadow', 'detail1', 'detail1', 'detail1', 'outline', _, 'outline', 'outline', 'detail1', 'bodyL', 'body', 'body', 'belly', 'bodyL', 'detail1', 'outline', _, _, _, _, _, _],
/* row  9 */ [_, 'outline', 'outline', 'detail1', 'detail1', 'detail1', 'outline', 'detail1', 'shadow', 'outline', 'shadow', 'shadow', 'detail1', 'detail1', 'detail1', 'outline', 'detail1', 'shadow', 'bodyL', 'body', 'belly', 'body', 'belly', 'belly', 'bodyL', 'detail1', 'outline', _, _, _, _, _],
/* row 10 */ ['outline', 'shadow', 'outline', 'shadow', 'detail1', 'outline', 'detail1', 'shadow', 'outline', 'body', 'outline', 'shadow', 'shadow', 'detail1', 'detail1', 'detail1', 'bodyL', 'bodyL', 'body', 'body', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'bodyL', 'detail1', 'outline', _, _, _, _],
/* row 11 */ ['outline', 'shadow', 'outline', 'detail1', 'detail1', 'detail1', 'shadow', 'outline', 'body', 'outline', 'outline', 'shadow', 'shadow', 'detail1', 'detail1', 'detail1', 'detail1', 'outline', 'body', 'body', 'body', 'belly', 'belly', 'bodyL', 'belly', 'belly', 'bodyL', 'detail1', 'outline', _, _, _],
/* row 12 */ ['outline', 'outline', 'detail1', 'detail1', 'detail1', 'shadow', 'outline', 'shadow', 'outline', 'shadow', 'bodyL', 'detail1', 'detail1', 'detail1', 'bodyL', 'detail1', 'detail1', 'detail1', 'bodyL', 'outline', 'outline', 'outline', 'outline', 'bodyL', 'belly', 'belly', 'body', 'detail1', 'outline', _, _, _],
/* row 13 */ ['outline', 'shadow', 'outline', 'detail1', 'shadow', 'outline', _, 'outline', 'shadow', 'bodyL', 'detail1', 'bodyL', 'bodyL', 'detail1', 'bodyL', 'detail1', 'bodyL', 'detail1', 'outline', _, _, 'outline', 'shadow', 'outline', 'belly', 'belly', 'belly', 'bodyL', 'detail1', 'outline', _, _],
/* row 14 */ [_, 'outline', 'body', 'outline', 'outline', _, _, 'outline', 'shadow', 'detail1', 'bodyL', 'detail1', 'detail1', 'bodyL', 'detail1', 'shadow', 'outline', 'detail1', 'shadow', 'outline', _, 'outline', 'shadow', 'shadow', 'outline', 'outline', 'belly', 'bodyL', 'detail1', 'outline', _, _],
/* row 15 */ [_, 'outline', 'shadow', 'outline', _, _, _, _, 'outline', 'outline', 'outline', 'outline', 'detail1', 'detail1', 'shadow', 'outline', 'detail1', 'detail1', 'detail1', 'shadow', 'outline', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyL', 'outline', 'bodyL', 'detail1', 'outline', _, _],
/* row 16 */ [_, _, 'outline', 'outline', _, _, 'outline', 'outline', 'outline', 'highlight', 'detail4', 'detail4', 'outline', 'outline', 'outline', 'detail1', 'detail1', 'detail1', 'detail1', 'shadow', 'bodyL', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _, 'outline', 'detail1', 'outline', _, _],
/* row 17 */ [_, _, _, _, _, 'outline', 'detail1', 'detail1', 'bodyL', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail1', 'detail1', 'bodyL', 'detail1', 'detail1', 'bodyL', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _, 'outline', 'shadow', 'outline', _, _],
/* row 18 */ [_, _, _, _, 'outline', 'outline', 'detail1', 'shadow', 'bodyL', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'bodyL', 'detail1', 'detail1', 'detail1', 'detail1', 'bodyL', 'shadow', 'shadow', 'detail2', 'outline', _, _, 'outline', _, _, _],
/* row 19 */ [_, _, _, 'outline', 'detail6', 'detail5', 'bodyL', 'shadow', 'bodyL', 'detail2', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'detail4', 'bodyL', 'detail1', 'detail1', 'detail1', 'detail1', 'bodyL', 'shadow', 'detail2', 'outline', _ , _, _, _, _, _, _],
/* row 20 */ [_, _, 'outline', 'detail6', 'bodyL', 'detail1', 'detail1', 'shadow', 'bodyL', 'detail2', 'detail2', 'detail4', 'detail4', 'detail4', 'detail4', 'bodyL', 'detail1', 'detail1', 'detail1', 'detail1', 'shadow', 'bodyL', 'detail2', 'outline', _, _, _, _, _, _, _, _],
/* row 21 */ [_, _, _, 'outline', 'detail1', 'detail4', 'detail4', 'shadow', 'shadow', 'bodyL', 'detail2', 'detail2', 'detail2', 'detail2', 'detail2', 'bodyL', 'bodyL', 'shadow', 'bodyL', 'shadow', 'shadow', 'bodyL', 'outline', _,_,_,_,_,_,_, _, _],
/* row 22 */ [_, _, _, _, 'outline', 'detail1', 'detail4', 'detail4', 'shadow', 'shadow', 'outline', 'detail2', 'detail2', 'detail2', 'detail2', 'bodyL', 'detail6', 'bodyL', 'detail6', 'bodyL', 'shadow', 'outline', _, _, _, _, _, _, _, _, _, _],
/* row 23 */ [_, _, _, _, _, 'outline', 'detail1', 'detail4', 'shadow', 'outline', _, 'outline', 'outline', 'outline', 'bodyL', 'shadow', 'detail1', 'detail1', 'bodyL', 'detail6', 'outline', _,_,_,_,_, _, _, _, _, _, _],
/* row 24 */ [_, _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, 'outline', 'detail4', 'detail4', 'detail4', 'detail1', 'outline', _, _, _, _, _, _, _, _, _, _, _, _],
/* row 25 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'detail1', 'detail4', 'detail1', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row 26 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]
