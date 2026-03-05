// Gengar (팬텀 / #94) — 20×20 grid auto-converted from 94.png
// scale 5 → 100×100px (fits the pet window exactly)

const _ = null

const COLORS = {
  body:       '#7845CC',
  bodyDark:   '#3D2080',
  bodyLight:  '#9868E8',
  eye:        '#E06050',
  teeth:      '#C8B8C0',
  teethBack:  '#FFFFFF',
  outline:    '#1C1010',
}

const GRID = 20

const BASE_BODY = [
/* row  0 */ [ _,         _,         'outline', 'outline', _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _         ],
/* row  1 */ [ _,         _,         'outline', 'body',    'outline', _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _         ],
/* row  2 */ [ _,         _,         _,         'outline', 'body',    'body',    'body',    _,         'outline', 'bodyLight','outline', _,         'outline', _,         _,         _,         'outline', 'bodyLight','bodyLight','outline' ],
/* row  3 */ [ _,         _,         _,         'outline', 'body',    'body',    'body',    'outline', 'bodyLight','bodyLight','outline', 'outline', 'outline', _,         'outline', 'outline', 'bodyLight','body',    'outline', _         ],
/* row  4 */ [ _,         _,         _,         'outline', 'body',    'body',    'body',    'bodyLight','bodyLight','bodyLight','outline', 'bodyLight','outline', 'outline', 'bodyLight','bodyLight','bodyLight','body',    'outline', _         ],
/* row  5 */ [ _,         _,         _,         _,         'outline', 'body',    'bodyLight','bodyLight','bodyLight','bodyLight','bodyLight','bodyLight','body',    'bodyLight','bodyLight','bodyLight','body',    'outline', _,         _         ],
/* row  6 */ [ _,         _,         _,         _,         'outline', 'bodyLight','bodyLight','bodyLight','bodyLight','bodyLight','bodyLight','bodyLight','body',    'bodyLight','body',    'body',    'body',    'outline', _,         _         ],
/* row  7 */ [ _,         _,         'outline', 'eye',     'body',    'body',    'bodyLight','bodyLight','bodyLight','body',    'body',    'body',    'body',    'body',    'body',    'body',    'body',    'outline', 'outline', _         ],
/* row  8 */ [ _,         'outline', 'body',    'eye',     'body',    'body',    'body',    'body',    'body',    'body',    'body',    'eye',     'body',    'body',    'body',    'body',    'bodyDark', 'bodyDark','outline', _         ],
/* row  9 */ [ 'outline', 'bodyDark','body',    'eye',     'outline', 'body',    'body',    'body',    'body',    'eye',     'eye',     'eye',     'body',    'body',    'body',    'body',    'bodyDark', 'outline', _,         _         ],
/* row 10 */ [ 'outline', 'bodyDark','body',    'body',    'body',    'body',    'body',    'eye',     'outline', 'eye',     'eye',     'eye',     'body',    'body',    'body',    'body',    'body',    'bodyDark', 'outline', _         ],
/* row 11 */ [ _,         'outline', 'outline', 'body',    'body',    'body',    'body',    'body',    'eye',     'eye',     'eye',     'body',    'bodyDark', 'body',    'body',    'body',    'body',    'bodyDark', 'bodyDark','outline' ],
/* row 12 */ [ _,         _,         _,         'outline', 'teethBack','teeth',  'body',    'body',    'body',    'body',    'body',    _,         'body',    'body',    'body',    'body',    'body',    'bodyDark', 'outline', _         ],
/* row 13 */ [ _,         _,         _,         'outline', 'body',    'teeth',   'teethBack','teeth', 'teethBack','teeth',  'teethBack','bodyDark','body',   'body',    'body',    'body',    'body',    'outline', _,         _         ],
/* row 14 */ [ _,         _,         _,         _,         'outline', 'body',    'teeth',   'teeth',   'teethBack','bodyDark','bodyDark','body',   'body',    'body',    'body',    'body',    'body',    'outline', _,         _         ],
/* row 15 */ [ _,         _,         _,         _,         'outline', 'body',    'body',    'bodyDark', 'bodyDark','body',    'body',    'body',    'body',    'body',    'body',    'body',    'body',    'bodyDark', 'outline', _         ],
/* row 16 */ [ _,         _,         _,         _,         'outline', 'bodyDark','body',    'body',    'body',    'body',    'body',    'body',    'body',    'bodyDark', 'body',    'body',    'body',    'bodyDark', 'bodyDark','outline' ],
/* row 17 */ [ _,         _,         _,         _,         _,         _,         'outline', 'outline', _,         'outline', 'outline', 'outline', 'body',    'body',    'body',    'body',    'outline', _,         _,         _         ],
/* row 18 */ [ _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         'body',    'body',    'body',    'outline', _,         _,         _,         _         ],
/* row 19 */ [ _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         _,         'outline', 'outline', 'outline', _,         _,         _,         _,         _         ],
]

export const ANIMATIONS = {
  idle: {
    frames: [
      { yOffset:  0 },
      { yOffset: -1 },
      { yOffset: -1 },
      { yOffset: -1 },
      { yOffset:  0 },
      { yOffset:  0 },
    ],
    fps: 3,
  },
  happy: {
    frames: [
      { yOffset:  0 },
      { yOffset: -1 },
      { yOffset: -2 },
      { yOffset: -3 },
      { yOffset: -2 },
      { yOffset: -1 },
      { yOffset:  0 },
      { yOffset:  0 },
    ],
    fps: 8,
  },
  working: {
    frames: [
      { yOffset:  0 },
      { yOffset: -1 },
      { yOffset: -1 },
      { yOffset:  0 },
      { yOffset:  0 },
      { yOffset:  0 },
    ],
    fps: 5,
  },
  sleeping: {
    frames: [
      { yOffset: 0 },
      { yOffset: 0 },
      { yOffset: 0 },
      { yOffset: 0 },
    ],
    fps: 2,
  },
}

// --- Item overlays ---

const ITEM_COLORS = {
  gold:   '#FFD700',
  goldD:  '#B8860B',
  capB:   '#1E3A8A',
  capD:   '#0F1F5C',
  santaR: '#DC2626',
  santaW: '#F5F5F5',
  gF:     '#1A1A1A',
  scarfO: '#F97316',
  scarfD: '#C2410C',
  wingB:  '#60A5FA',
  wingD:  '#1D4ED8',
}

function buildOverlay(rowDefs) {
  const empty = Array(20).fill(null)
  const overlay = Array.from({ length: 20 }, () => empty)
  for (const [i, row] of rowDefs) overlay[i] = row
  return overlay
}

const ITEM_OVERLAYS = {
  crown: buildOverlay([
    [0, [_,_,_,_,_,'gold',_,_,_,'gold',_,_,_,'gold',_,_,_,_,_,_]],
    [1, [_,_,_,_,'gold','gold',_,_,'gold','gold',_,_,'gold','gold',_,_,_,_,_,_]],
    [2, [_,_,_,'goldD','gold','gold','gold','gold','gold','gold','gold','gold','gold','gold','gold','gold','goldD',_,_,_]],
    [3, [_,_,_,'goldD','goldD','goldD','goldD','goldD','goldD','goldD','goldD','goldD','goldD','goldD','goldD','goldD','goldD',_,_,_]],
  ]),

  baseball_cap: buildOverlay([
    [0, [_,_,_,_,_,'capB','capB','capB','capB','capB','capB','capB','capB','capB',_,_,_,_,_,_]],
    [1, [_,_,_,_,'capB','capB','capB','capB','capB','capB','capB','capB','capB','capB','capB',_,_,_,_,_]],
    [2, [_,_,_,'capB','capB','capB','capB','capB','capB','capB','capB','capB','capB','capB','capB','capB',_,_,_,_]],
    [3, [_,_,_,'capD','capD','capD','capD','capD','capD','capD','capD','capD','capD','capD','capD','capD',_,_,_,_]],
    [4, [_,_,'capD','capD','capD','capD','capD','capD','capD','capD','capD','capD','capD','capD','capD','capD','capD',_,_,_]],
  ]),

  santa_hat: buildOverlay([
    [0, [_,_,_,_,_,_,_,_,_,'santaW','santaW',_,_,_,_,_,_,_,_,_]],
    [1, [_,_,_,_,_,_,_,_,'santaR','santaR','santaR','santaR',_,_,_,_,_,_,_,_]],
    [2, [_,_,_,_,_,_,'santaR','santaR','santaR','santaR','santaR','santaR','santaR','santaR',_,_,_,_,_,_]],
    [3, [_,_,_,_,'santaR','santaR','santaR','santaR','santaR','santaR','santaR','santaR','santaR','santaR','santaR','santaR',_,_,_,_]],
    [4, [_,_,_,'santaW','santaW','santaW','santaW','santaW','santaW','santaW','santaW','santaW','santaW','santaW','santaW','santaW','santaW',_,_,_]],
  ]),

  glasses: buildOverlay([
    [7,  [_,_,'gF','gF','gF','gF',_,_,_,_,_,_,_,_,_,_,_,_,_,_]],
    [8,  [_,_,'gF',_,_,'gF',_,_,'gF','gF','gF','gF','gF',_,_,_,_,_,_,_]],
    [9,  [_,_,'gF',_,_,'gF','gF','gF','gF',_,_,_,'gF',_,_,_,_,_,_,_]],
    [10, [_,_,'gF','gF','gF','gF',_,_,'gF',_,_,_,'gF',_,_,_,_,_,_,_]],
    [11, [_,_,_,_,_,_,_,_,'gF','gF','gF','gF','gF',_,_,_,_,_,_,_]],
  ]),

  scarf: buildOverlay([
    [11, [_,_,_,'scarfO','scarfO','scarfO','scarfO','scarfO','scarfO','scarfO','scarfO','scarfO','scarfO','scarfO','scarfO','scarfO','scarfO',_,_,_]],
    [12, [_,_,_,'scarfD','scarfD','scarfD','scarfD','scarfD','scarfD','scarfD','scarfD','scarfD','scarfD','scarfD','scarfD','scarfD','scarfD',_,_,_]],
  ]),

  wings: buildOverlay([
    [6,  [_,'wingD',_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,'wingD',_]],
    [7,  [_,'wingD','wingB',_,_,_,_,_,_,_,_,_,_,_,_,_,_,'wingB','wingD',_]],
    [8,  ['wingD','wingB','wingB',_,_,_,_,_,_,_,_,_,_,_,_,_,_,'wingB','wingB','wingD']],
    [9,  ['wingD','wingB','wingB',_,_,_,_,_,_,_,_,_,_,_,_,_,_,'wingB','wingB','wingD']],
    [10, ['wingD','wingB','wingB',_,_,_,_,_,_,_,_,_,_,_,_,_,_,'wingB','wingB','wingD']],
    [11, [_,'wingD','wingB',_,_,_,_,_,_,_,_,_,_,_,_,_,_,'wingB','wingD',_]],
    [12, [_,'wingD',_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,'wingD',_]],
  ]),
}

export function drawFrame(ctx, frameData, scale = 5, equippedItems = []) {
  const { yOffset = 0 } = frameData

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Draw character
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const colorKey = BASE_BODY[row][col]
      if (!colorKey) continue
      const color = COLORS[colorKey]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(col * scale, (row + yOffset) * scale, scale, scale)
    }
  }

  // Draw equipped items on top
  for (const itemId of equippedItems) {
    const overlay = ITEM_OVERLAYS[itemId]
    if (!overlay) continue
    for (let row = 0; row < GRID; row++) {
      const rowData = overlay[row]
      if (!rowData) continue
      for (let col = 0; col < GRID; col++) {
        const colorKey = rowData[col]
        if (!colorKey) continue
        const color = ITEM_COLORS[colorKey]
        if (!color) continue
        ctx.fillStyle = color
        ctx.fillRect(col * scale, (row + yOffset) * scale, scale, scale)
      }
    }
  }
}
