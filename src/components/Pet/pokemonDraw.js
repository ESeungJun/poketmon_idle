// 픽셀아트 렌더러: BASE_BODY 그리드를 ctx에 그림
// yOffset: 애니메이션 프레임마다 픽셀 단위로 상하 이동해 호버 효과를 만듦
export function drawPokemon(ctx, BASE_BODY, COLORS, frameData, scale = 5) {
  const { yOffset = 0 } = frameData
  const rows = BASE_BODY.length
  const cols = BASE_BODY[0]?.length ?? 0
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorKey = BASE_BODY[row][col]
      if (!colorKey) continue        // null이면 투명 픽셀
      const color = COLORS[colorKey]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(col * scale, (row + yOffset) * scale, scale, scale)
    }
  }
}

// 상태별 애니메이션 정의
// frames: 각 프레임의 yOffset(픽셀 단위 수직 이동) 배열
// fps: 프레임 전환 속도
export const DEFAULT_ANIMATIONS = {
  // idle: 느린 호버. 위로 1px 떴다가 돌아오는 반복
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
  // happy: 빠른 점프. 최대 3px까지 튀어오르며 활발한 움직임
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
  // sleeping: SLEEP_BODY 이미지를 정적으로 보여줌 (yOffset=0 고정, 낮은 fps)
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
