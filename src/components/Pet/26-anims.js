// 라이츄(26) — pixel art
const _ = null

export const COLORS = {
  outline: '#191919',
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

// grid: 21×20
export const BASE_BODY = [
/* row  0 */[_, _, _, _, _, _, 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */[_, _, _, _, _, 'outline', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */[_, _, _, _, 'outline', 'bodyL', 'outline', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */[_, _, _, _, 'outline', 'bodyL', 'outline', '_', _, _, _, _, '_', 'outline', 'outline', 'outline', 'outline', 'outline', _, 'outline', _, _, _],
/* row  4 */[_, _, _, 'outline', 'bodyL', 'bodyL', 'outline', '_', _, _, _, 'outline', 'outline', 'bodyD', 'bodyD', 'bodyD', 'outline', _, 'outline', 'highlight', 'outline', _, _],
/* row  5 */[_, _, _, 'outline', 'bodyL', 'outline', '_', _, _, _, 'outline', 'bodyD', 'bodyD', 'shadow', 'highlight', 'outline', _, _, 'outline', 'highlight', 'outline', _, _],
/* row  6 */[_, _, _, 'outline', 'body', 'outline', 'outline', 'outline', _, 'outline', 'bodyD', 'bodyD', 'highlight', 'highlight', 'outline', _, _, _, 'outline', 'highlight', 'highlight', 'outline', _],
/* row  7 */[_, _, 'outline', 'outline', 'accent', 'accent', 'accent', 'accent', 'outline', 'bodyD', 'bodyD', 'highlight', 'highlight', 'outline', _, _, _, _, 'outline', 'highlight', 'highlight', 'outline', _],
/* row  8 */[_, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'bodyD', 'bodyD', 'shadow', 'highlight', 'highlight', 'outline', 'outline', _, _, 'outline', 'highlight', 'highlight', 'highlight', 'outline'],
/* row  9 */[_, 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'body', 'bodyD', 'bodyD', 'body', 'outline', _, 'outline', '-', 'outline', 'body', 'highlight', 'highlight', 'highlight', 'outline'],
/* row 10 */['outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'belly', 'accent', 'accent', 'body', 'body', 'body', 'outline', _, _, _, 'outline', 'shadow', 'body', 'shadow', 'highlight', 'highlight', 'outline'],
/* row 11 */['outline', 'accent', 'bodyD', 'accent', 'accent', 'accent', 'detail3', 'outline', 'accent', 'accent', 'accent', 'accent', 'accent', 'outline', _, _, _, 'outline', 'shadow', 'shadow', 'outline', 'highlight', 'outline'],
/* row 12 */[_, 'outline', 'accent', 'accent', 'accent', 'accent', 'outline', 'body', 'highlight', 'highlight', 'accent', 'accent', 'accent', 'outline', _, _, _, 'outline', 'shadow', 'shadow', 'outline', 'outline', 'outline'],
/* row 13 */[_, _, 'outline', 'belly', 'belly', 'accent', 'accent', 'accent', 'highlight', 'highlight', 'accent', 'accent', 'accent', 'belly', 'outline', _, _, _, 'outline', 'shadow', 'outline', _, _],
/* row 14 */[_, 'outline', 'belly', 'body', 'accent', 'accent', 'accent', 'accent', 'accent', 'body', 'accent', 'accent', 'accent', 'bodyL', 'outline', _, _, _, _, 'outline', 'outline', _, _],
/* row 15 */[_, 'outline', 'belly', 'body', 'detail2', 'detail2', 'accent', 'body', 'body', 'accent', 'accent', 'accent', 'belly', 'belly', 'belly', 'outline', _, _, _, _, 'outline', _, _],
/* row 16 */[_, _, 'outline', 'outline', 'body', 'detail2', 'body', 'bodyD', 'accent', 'accent', 'accent', 'belly', 'belly', 'belly', 'bodyL', 'outline', _, _, _, _, 'outline', 'outline', _],
/* row 17 */[_, _, _, _, 'outline', 'detail2', 'body', 'bodyD', 'bodyD', 'accent', 'body', 'belly', 'belly', 'bodyL', 'bodyL', 'outline', _, _, _, _, _, 'outline', _],
/* row 18 */[_, _, _, _, 'outline', 'belly', 'detail1', 'body', 'body', 'body', 'belly', 'belly', 'belly', 'belly', 'bodyD', 'outline', 'outline', _, _, _, _, 'outline', _],
/* row 19 */[_, _, _, 'outline', 'bodyL', 'body', 'outline', 'outline', 'detail1', 'detail1', 'belly', 'belly', 'belly', 'belly', 'outline', _, 'outline', 'outline', _, _, 'outline', 'outline', _],
/* row 20 */[_, _, _, 'outline', 'outline', 'outline', 'outline', _, 'outline', 'belly', 'belly', 'belly', 'bodyD', 'outline', '-', _, _, 'outline', 'outline', 'outline', 'outline', _, _],
/* row 21 */[_, _, _, _, _, _, _, _, _, 'outline', 'body', 'body', 'belly', 'belly', 'outline', _, _, '_', '_', '_', '_', _, _],
/* row 22 */[_, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _, _, _, _, _, _, _],
/* row 23 */[_, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = COLORS
export const SLEEP_BODY = BASE_BODY
