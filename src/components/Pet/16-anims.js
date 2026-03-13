// 구구(16) — pixel art
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#525252',
  bodyL: '#9C5A3A',
  bodyD: '#BD7342',
  belly: '#A5945A',
  shadow: '#DE9C29',
  accent: '#C5737B',
  highlight: '#CEBD63',
  detail1: '#E6A5A5',
  detail2: '#BDBDBD',
  detail3: '#F7EF9C',
  detail4: '#FFFFFF',
}

// grid: 21x20
export const BASE_BODY = [
/* row  0 */[_, _, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */[_, _, _, 'outline', 'outline', _, 'outline', 'shadow', 'outline', _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */[_, _, _, 'outline', 'detail3', 'outline', 'shadow', 'shadow', 'outline', _, _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */[_, _, _, 'outline', 'detail3', 'outline', 'shadow', 'shadow', 'outline', _, _, 'outline', 'outline', _, _, _, _, 'outline', 'outline', 'outline', _],
/* row  4 */[_, _, _, 'outline', 'detail3', 'body', 'shadow', 'shadow', 'body', 'outline', 'outline', 'detail3', 'outline', _, 'outline', 'outline', 'outline', 'bodyL', 'bodyL', 'outline', 'outline'],
/* row  5 */[_, _, _, 'outline', 'detail3', 'bodyD', 'shadow', 'shadow', 'bodyD', 'detail3', 'detail3', 'detail3', 'outline', 'outline', 'bodyL', 'body', 'body', 'bodyL', 'body', 'bodyL', 'outline'],
/* row  6 */[_, _, 'outline', 'detail3', 'bodyD', 'shadow', 'shadow', 'bodyD', 'detail3', 'detail3', 'detail3', 'highlight', 'highlight', 'body', 'bodyL', 'body', 'body', 'body', 'bodyL', 'bodyL', 'outline'],
/* row  7 */[_, _, 'outline', 'highlight', 'bodyD', 'shadow', 'bodyD', 'detail3', 'detail3', 'highlight', 'highlight', 'highlight', 'body', 'body', 'body', 'body', 'body', 'body', 'bodyL', 'outline', _],
/* row  8 */[_, _, 'outline', 'highlight', 'shadow', 'bodyD', 'detail3', 'highlight', 'highlight', 'body', 'body', 'body', 'bodyD', 'shadow', 'shadow', 'body', 'body', 'detail3', 'outline', _, _],
/* row  9 */[_, _, _, 'outline', 'body', 'detail3', 'highlight', 'body', 'body', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyL', 'bodyL', 'detail3', 'detail3', 'detail3', 'highlight', 'outline', _],
/* row 10 */[_, _, 'outline', 'outline', 'body', 'detail3', 'highlight', 'detail4', 'body', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyL', 'bodyL', 'detail3', 'detail3', 'detail3', 'highlight', 'outline', _],
/* row 11 */[_, 'outline', 'detail1', 'detail1', 'detail1', 'body', 'outline', 'detail4', 'body', 'body', 'bodyD', 'bodyD', 'bodyL', 'shadow', 'shadow', 'detail3', 'detail3', 'highlight', 'highlight', 'outline', _],
/* row 12 */['outline', 'detail1', 'detail1', 'detail1', 'detail1', 'detail1', 'body', 'body', 'body', 'body', 'body', 'body', 'shadow', 'shadow', 'shadow', 'bodyD', 'bodyD', 'highlight', 'outline', _, _],
/* row 13 */['outline', 'detail1', 'accent', 'accent', 'body', 'body', 'body', 'detail3', 'detail3', 'detail3', 'detail3', 'body', 'shadow', 'shadow', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _],
/* row 14 */[_, 'outline', 'outline', 'outline', 'accent', 'accent', 'body', 'highlight', 'detail3', 'detail3', 'detail3', 'body', 'body', 'bodyD', 'bodyD', 'bodyD', 'bodyD', 'outline', _, _, _],
/* row 15 */[_, _, _, _, 'outline', 'outline', 'highlight', 'belly', 'highlight', 'belly', 'belly', 'highlight', 'body', 'body', 'outline', 'outline', 'outline', _, _, _, _],
/* row 16 */[_, _, _, _, _, 'outline', 'highlight', 'belly', 'highlight', 'belly', 'belly', 'highlight', 'body', 'body', 'outline', _, _, _, _, _, _],
/* row 17 */[_, _, _, _, _, _, 'outline', 'outline', 'highlight', 'body', 'body', 'body', 'accent', 'outline', _, _, _, _, _, _, _],
/* row 18 */[_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'detail2', 'outline', _, _, _, _, _, _, _, _],
/* row 19 */[_, _, _, _, _, _, _, _, _, _, 'outline', 'outline', _, _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = {
  outline: '#191919',
  bodyL: '#4F4F4F',
  bodyD: '#6E6A44',
  belly: '#9C5038',
  shadow: '#BC703F',
  accent: '#A19156',
  highlight: '#DD9823',
  detail1: '#C16E78',
  detail2: '#CAB95D',
  detail3: '#E39FA0',
  detail4: '#F6CB87',
  detail5: '#F3EC94',

}

// grid: 21x20
export const SLEEP_BODY = [
/* row  0 */[_, _, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */[_, _, _, 'outline', 'outline', _, 'outline', 'highlight', 'outline', _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */[_, _, _, 'outline', 'detail5', 'outline', 'highlight', 'highlight', 'outline', _, _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */[_, _, _, 'outline', 'detail5', 'outline', 'highlight', 'highlight', 'outline', _, _, 'outline', 'outline', _, _, _, _, 'outline', 'outline', 'outline', _],
/* row  4 */[_, _, _, 'outline', 'detail5', 'bodyL', 'highlight', 'highlight', 'bodyL', 'outline', 'outline', 'detail5', 'outline', _, 'outline', 'outline', 'outline', 'shadow', 'shadow', 'outline', _],
/* row  5 */[_, _, _, 'outline', 'detail5', 'shadow', 'highlight', 'highlight', 'shadow', 'detail4', 'detail5', 'detail5', 'outline', 'outline', 'shadow', 'bodyL', 'bodyL', 'shadow', 'bodyL', 'shadow', 'outline'],
/* row  6 */[_, _, 'outline', 'detail5', 'shadow', 'highlight', 'highlight', 'shadow', 'detail5', 'detail5', 'detail5', 'bodyL', 'shadow', 'shadow', 'bodyL', 'shadow', 'shadow', 'bodyL', 'shadow', 'shadow', 'outline'],
/* row  7 */[_, _, 'outline', 'detail5', 'shadow', 'highlight', 'shadow', 'detail5', 'detail5', 'detail2', 'detail2', 'detail2', 'belly', 'shadow', 'shadow', 'bodyL', 'bodyL', 'shadow', 'outline', 'outline', _],
/* row  8 */[_, _, 'outline', 'detail5', 'highlight', 'shadow', 'detail5', 'detail2', 'detail2', 'shadow', 'shadow', 'bodyL', 'shadow', 'shadow', 'shadow', 'shadow', 'shadow', 'outline', _, _, _],
/* row  9 */[_, _, _, 'outline', 'highlight', 'detail5', 'detail2', 'bodyL', 'bodyL', 'belly', 'shadow', 'shadow', 'bodyL', 'belly', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 10 */[_, _, 'outline', 'outline', 'highlight', 'detail5', 'detail2', 'bodyL', 'outline', 'belly', 'shadow', 'shadow', 'bodyL', 'belly', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _],
/* row 11 */[_, 'outline', 'detail3', 'detail3', 'detail3', 'bodyL', 'outline', 'outline', 'bodyL', 'bodyL', 'bodyL', 'shadow', 'belly', 'highlight', 'highlight', 'detail5', 'detail5', 'bodyL', 'detail1', 'outline', _],
/* row 12 */['outline', 'detail3', 'detail3', 'detail3', 'detail3', 'detail3', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'belly', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'detail5', 'bodyL', 'detail3', 'outline'],
/* row 13 */['outline', 'detail3', 'detail1', 'detail1', 'detail1', 'detail1', 'detail5', 'detail5', 'detail5', 'bodyD', 'bodyL', 'shadow', 'highlight', 'highlight', 'shadow', 'detail2', 'detail2', 'detail2', 'bodyL', 'detail1', 'outline'],
/* row 14 */[_, 'outline', 'detail1', 'detail1', 'detail1', 'detail2', 'detail5', 'detail5', 'detail5', 'detail5', 'detail5', 'bodyL', 'bodyL', 'shadow', 'shadow', 'shadow', 'shadow', 'bodyL', 'outline', 'outline', _],
/* row 15 */[_, _, 'outline', 'outline', 'outline', 'detail2', 'accent', 'detail2', 'detail2', 'accent', 'accent', 'detail2', 'bodyL', 'bodyL', 'bodyL', 'outline', 'outline', 'outline', _, _, _],
/* row 16 */[_, _, _, _, 'outline', 'detail2', 'accent', 'detail2', 'detail2', 'accent', 'accent', 'detail2', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _, _, _],
/* row 17 */[_, _, _, _, _, 'outline', 'outline', 'outline', 'detail2', 'detail3', 'detail3', 'detail1', 'detail1', 'outline', 'outline', _, _, _, _, _, _],
/* row 18 */[_, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'detail3', 'outline', _, _, _, _, _, _, _, _],
/* row 19 */[_, _, _, _, _, _, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, _],
]
