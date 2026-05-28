// 라이츄(26) — pixel art
const _ = null

export const COLORS = {
  outline: '#191919',
  body: '#191919',
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
/* row 19 */[_, _, _, 'outline', 'bodyL', 'bodyL', 'outline', 'outline', 'detail1', 'detail1', 'belly', 'belly', 'belly', 'belly', 'outline', _, 'outline', 'outline', _, _, 'outline', 'outline', _],
/* row 20 */[_, _, _, 'outline', 'outline', 'outline', 'outline', _, 'outline', 'belly', 'belly', 'belly', 'bodyD', 'outline', '-', _, _, 'outline', 'outline', 'outline', 'outline', _, _],
/* row 21 */[_, _, _, _, _, _, _, _, _, 'outline', 'body', 'body', 'belly', 'belly', 'outline', _, _, '_', '_', '_', '_', _, _],
/* row 22 */[_, _, _, _, _, _, _, _, 'outline', 'bodyL', 'bodyL', 'bodyL', 'bodyL', 'outline', _, _, _, _, _, _, _, _, _],
/* row 23 */[_, _, _, _, _, _, _, _, _, 'outline', 'outline', 'outline', 'outline', _, _, _, _, _, _, _, _, _, _],
]

export const SLEEP_COLORS = {
  outline: '#191919',
  body: '#191919',
  bodyL: '#504E4F',
  bodyD: '#6B4C38',
  belly: '#966C42',
  shadow: '#C77D32',
  accent: '#F7B531',
  highlight: '#F3AF2A',
  detail1: '#FCE34B',
  detail2: '#FEF4C3',
  detail3: '#FFFFFF',
}

// grid: 21×20
export const SLEEP_BODY = [
/* row  0 */ [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
/* row  1 */ [_, _, _, _, _, _, _, _, ' ', ' ', _, _, _, _, _, _, _, _, _, _, _],
/* row  2 */ [_, _, _, 'body', _, _, _, ' ', ' ', _, _, _, _, _, _, _, _, _, _, _, _],
/* row  3 */ [_, _, 'body', 'bodyD', 'body', _, _, _, _, _, 'body', 'body', 'body', 'body', _, _, _, _, _, _, _],
/* row  4 */ [_, _, 'body', 'bodyD', 'body', _, _, _, 'body', 'body', 'belly', 'belly', 'body', _, _, _, _, _, _, _, _],
/* row  5 */ [_, _, 'body', 'bodyD', 'body', _, _, _, 'belly', 'belly', 'bodyL', 'detail1', 'body', _, _, _, _, _, _, _, _],
/* row  6 */ [_, 'body', 'bodyD', 'body', 'body', 'body', 'body', 'body', 'belly', 'bodyL', 'detail1', 'body', _, _, _, _, _, _, _, _, _],
/* row  7 */ [_, 'body', 'bodyD', 'highlight', 'highlight', 'highlight', 'highlight', 'body', 'bodyL', 'detail1', 'detail1', 'body', 'body', _, _, _, _, _, _, _, _],
/* row  8 */ [_, 'body', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'body', 'body', 'body', 'highlight', 'bodyD', 'body', _, _, _, _, _, _, _],
/* row  9 */ [_, 'body', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'bodyD', 'highlight', 'highlight', 'bodyD', 'highlight', 'body', _, _, _, _, _, _],
/* row 10 */ ['body', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'bodyD', 'highlight', 'bodyD', 'body', _, _, _, _, _],
/* row 11 */ ['body', 'highlight', 'highlight', 'highlight', 'highlight', 'body', 'body', 'detail1', 'detail1', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'body', '_', _, _, _],
/* row 12 */ ['body', 'highlight', 'belly', 'highlight', 'highlight', 'highlight', 'highlight', 'detail1', 'detail1', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'body', 'body', 'body', _, _],
/* row 13 */ [_, 'body', 'highlight', 'highlight', 'highlight', 'highlight', 'belly', 'belly', 'highlight', 'bodyD', 'highlight', 'highlight', 'highlight', 'highlight', 'shadow', 'shadow', 'body', _, 'body', 'body', _],
/* row 14 */ [_, 'body', 'shadow', 'body', 'body', 'body', 'body', 'highlight', 'body', 'body', 'body', 'bodyD', 'shadow', 'shadow', 'shadow', 'body', _, _, '', 'body', _],
/* row 15 */ [_, _, 'body', 'body', 'accent', 'detail1', 'detail1', 'body', 'body', 'accent', 'detail1', 'body', 'shadow', 'shadow', 'body', '', _, _, '', 'body', _],
/* row 16 */ [_, _, _, _, 'body', 'accent', 'detail1', 'detail1', 'body', 'detail1', 'detail1', 'accent', 'body', 'body', _, _, _, 'body', 'body', 'body', _],
/* row 17 */ [_, _, _, _, _, 'body', 'body', 'detail1', 'detail1', 'detail1', 'body', 'body', 'accent', 'body', 'body', 'body', 'body', 'body', _, _, _],
/* row 18 */ [_, _, _, _, _, _, _, _, 'outline', 'detail1', 'body', _, 'body', _, _, _, _, _, _, _, _],
/* row 19 */ [_, _, _, _, _, _, _, _, _, 'body', 'body', _, _, _, _, _, _, _, _, _, _],
]
