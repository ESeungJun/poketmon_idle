import { useEffect, useRef } from 'react'
import { PIXEL_ART } from './pixelArtRegistry'
import { drawPokemon, DEFAULT_ANIMATIONS } from './pokemonDraw'
import { spriteUrl } from '../../data/pokemon'

// 정적(첫 프레임) 픽셀아트 스프라이트 렌더러
// Box, PokemonStats 등 애니메이션이 필요없는 곳에 사용
export default function StaticPokemonSprite({ speciesId, dexNum, size = 56 }) {
  const canvasRef = useRef(null)
  const data = PIXEL_ART[speciesId]

  useEffect(() => {
    if (!data) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    ctx.imageSmoothingEnabled = false
    const rows  = data.BASE_BODY.length
    const cols  = data.BASE_BODY[0]?.length ?? rows
    const scale = Math.floor(size / Math.max(rows, cols))
    const frame = DEFAULT_ANIMATIONS.idle.frames[0]
    drawPokemon(ctx, data.BASE_BODY, data.COLORS, frame, scale)
  }, [speciesId, size])

  if (data) {
    const rows  = data.BASE_BODY.length
    const cols  = data.BASE_BODY[0]?.length ?? rows
    const scale = Math.floor(size / Math.max(rows, cols))
    return (
      <canvas
        ref={canvasRef}
        width={cols * scale}
        height={rows * scale}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
    )
  }

  if (dexNum) {
    return (
      <img
        src={spriteUrl(dexNum)}
        alt={speciesId}
        draggable={false}
        style={{ width: size, height: size, imageRendering: 'pixelated', objectFit: 'contain', display: 'block' }}
      />
    )
  }

  return <div style={{ width: size, height: size, background: '#2a2a3e', borderRadius: '8px' }} />
}
