import { useEffect, useRef } from 'react'
import { ANIMATIONS, drawFrame } from './animations'
import { spriteUrl } from '../../data/pokemon'

// Inject CSS keyframes once
let injected = false
function injectStyles() {
  if (injected || typeof document === 'undefined') return
  injected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes petBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes petEvolve {
      0%, 100% { filter: brightness(1); opacity: 1; }
      50% { filter: brightness(8) saturate(0); opacity: 0.6; }
    }
    @keyframes petSleep {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.4; }
    }
  `
  document.head.appendChild(style)
}

function getSpriteStyle(state) {
  switch (state) {
    case 'happy':
      return { animation: 'petBounce 0.5s ease-in-out infinite' }
    case 'evolving':
      return { animation: 'petEvolve 0.4s ease-in-out infinite' }
    case 'sleeping':
      return { animation: 'petSleep 2s ease-in-out infinite', filter: 'grayscale(40%)' }
    case 'working':
      return { opacity: 0.9 }
    default:
      return {}
  }
}

export default function PetCanvas({ state = 'idle', equippedItems = [], scale = 5, flipX = false, dexNum = null }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const animRef = useRef(null)

  injectStyles()

  // Sprite-based rendering (Pokémon species selected)
  if (dexNum) {
    const size = 20 * scale
    return (
      <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: flipX ? 'scaleX(-1)' : 'none',
        background: 'transparent',
        position: 'relative',
      }}>
        <img
          src={spriteUrl(dexNum)}
          alt="pet"
          draggable={false}
          style={{
            imageRendering: 'pixelated',
            width: '80%',
            height: '80%',
            objectFit: 'contain',
            display: 'block',
            ...getSpriteStyle(state),
          }}
        />
      </div>
    )
  }

  // Legacy Gengar pixel-art canvas rendering
  return <GengarCanvas state={state} equippedItems={equippedItems} scale={scale} flipX={flipX} canvasRef={canvasRef} frameRef={frameRef} animRef={animRef} />
}

function GengarCanvas({ state, equippedItems, scale, flipX, canvasRef, frameRef, animRef }) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    ctx.imageSmoothingEnabled = false

    const animation = ANIMATIONS[state] || ANIMATIONS.idle
    const { frames, fps } = animation
    const interval = 1000 / fps
    frameRef.current = 0

    const animate = () => {
      const frame = frames[frameRef.current % frames.length]
      drawFrame(ctx, frame, scale, equippedItems)
      frameRef.current = (frameRef.current + 1) % frames.length
      animRef.current = setTimeout(animate, interval)
    }

    animate()
    return () => { if (animRef.current) clearTimeout(animRef.current) }
  }, [state, equippedItems, scale])

  const size = 20 * scale
  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', display: 'block', background: 'transparent', transform: flipX ? 'scaleX(-1)' : 'none' }}
    />
  )
}
