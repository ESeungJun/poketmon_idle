import { useEffect, useRef } from 'react'
import { ANIMATIONS, drawFrame } from './animations'
import { drawPokemon, DEFAULT_ANIMATIONS } from './pokemonDraw'
import * as squirtleData from './squirtle-anims'
import * as charmanderData from './charmander-anims'
import * as bulbasaurData from './bulbasaur-anims'
import { spriteUrl } from '../../data/pokemon'

const PIXEL_ART = {
  squirtle:   squirtleData,
  charmander: charmanderData,
  bulbasaur:  bulbasaurData,
}

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

export default function PetCanvas({ state = 'idle', equippedItems = [], scale = 5, flipX = false, dexNum = null, speciesId = null }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const animRef = useRef(null)

  injectStyles()

  // Pixel-art canvas rendering for starters with custom dot art
  if (speciesId && PIXEL_ART[speciesId]) {
    const pokemonData = PIXEL_ART[speciesId]
    return <PixelArtCanvas pokemonData={pokemonData} state={state} scale={scale} flipX={flipX} />
  }

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

function PixelArtCanvas({ pokemonData, state, flipX }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const animRef = useRef(null)

  const activeBody = (state === 'sleeping' && pokemonData.SLEEP_BODY) ? pokemonData.SLEEP_BODY : pokemonData.BASE_BODY
  const rows = activeBody.length
  const cols = activeBody[0]?.length ?? rows
  const scale = Math.floor(100 / Math.max(rows, cols))
  const canvasW = cols * scale
  const canvasH = rows * scale

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    ctx.imageSmoothingEnabled = false

    const isSleeping = state === 'sleeping' && pokemonData.SLEEP_BODY
    const body = isSleeping ? pokemonData.SLEEP_BODY : pokemonData.BASE_BODY
    const colors = isSleeping ? pokemonData.SLEEP_COLORS : pokemonData.COLORS

    const animation = DEFAULT_ANIMATIONS[isSleeping ? 'sleeping' : state] || DEFAULT_ANIMATIONS.idle
    const { frames, fps } = animation
    const interval = 1000 / fps
    frameRef.current = 0

    const animate = () => {
      const frame = frames[frameRef.current % frames.length]
      drawPokemon(ctx, body, colors, frame, scale)
      frameRef.current = (frameRef.current + 1) % frames.length
      animRef.current = setTimeout(animate, interval)
    }

    animate()
    return () => { if (animRef.current) clearTimeout(animRef.current) }
  }, [state, scale, pokemonData])

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      style={{ imageRendering: 'pixelated', display: 'block', background: 'transparent', transform: flipX ? 'scaleX(-1)' : 'none' }}
    />
  )
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
