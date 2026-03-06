export function drawPokemon(ctx, BASE_BODY, COLORS, frameData, scale = 5) {
  const { yOffset = 0 } = frameData
  const rows = BASE_BODY.length
  const cols = BASE_BODY[0]?.length ?? 0
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorKey = BASE_BODY[row][col]
      if (!colorKey) continue
      const color = COLORS[colorKey]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(col * scale, (row + yOffset) * scale, scale, scale)
    }
  }
}

export const DEFAULT_ANIMATIONS = {
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
