import { useEffect, useRef } from 'react'
import * as pokeballData  from './ball-anims'
import * as superballData from './superball-anims'
import * as hyperballData from './hyperball-anims'

const BALL_DATA = {
  ball_pokeball:  pokeballData,
  ball_superball: superballData,
  ball_hyperball: hyperballData,
}

export default function BallCanvas({ ballId, size = 32 }) {
  const canvasRef = useRef(null)
  const data = BALL_DATA[ballId]

  useEffect(() => {
    if (!data || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: true })
    ctx.imageSmoothingEnabled = false

    const { BASE_BODY, COLORS } = data
    const rows = BASE_BODY.length
    const cols = BASE_BODY[0]?.length ?? rows
    const scale = Math.max(1, Math.floor(size / Math.max(rows, cols)))

    canvas.width  = cols * scale
    canvas.height = rows * scale

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = BASE_BODY[r][c]
        if (!key) continue
        ctx.fillStyle = COLORS[key]
        ctx.fillRect(c * scale, r * scale, scale, scale)
      }
    }
  }, [ballId, size])

  if (!data) return null
  const rows  = data.BASE_BODY.length
  const cols  = data.BASE_BODY[0]?.length ?? rows
  const scale = Math.max(1, Math.floor(size / Math.max(rows, cols)))

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <canvas
        ref={canvasRef}
        width={cols * scale}
        height={rows * scale}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
    </div>
  )
}
