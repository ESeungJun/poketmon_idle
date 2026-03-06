import { useEffect, useRef } from 'react'
import { drawPokemon, DEFAULT_ANIMATIONS } from './pokemonDraw'
import * as squirtleData from './squirtle-anims'
import * as charmanderData from './charmander-anims'
import * as bulbasaurData from './bulbasaur-anims'
import { spriteUrl } from '../../data/pokemon'

// 커스텀 도트 데이터가 있는 포켓몬 목록
// 새 포켓몬 도트를 추가할 때: *-anims.js 파일 만들고 여기에 등록
const PIXEL_ART = {
  squirtle:   squirtleData,
  charmander: charmanderData,
  bulbasaur:  bulbasaurData,
}

// CSS 애니메이션 키프레임을 DOM에 한 번만 주입
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

// 스프라이트 img 태그용 CSS 스타일 (PokeAPI CDN 이미지에 적용)
function getSpriteStyle(state) {
  switch (state) {
    case 'happy':    return { animation: 'petBounce 0.5s ease-in-out infinite' }
    case 'evolving': return { animation: 'petEvolve 0.4s ease-in-out infinite' }
    case 'sleeping': return { animation: 'petSleep 2s ease-in-out infinite', filter: 'grayscale(40%)' }
    case 'working':  return { opacity: 0.9 }
    default:         return {}
  }
}

// 렌더링 분기:
// 1. speciesId가 PIXEL_ART 맵에 있으면 → 커스텀 도트 canvas (PixelArtCanvas)
// 2. dexNum이 있으면 → PokeAPI CDN 스프라이트 img 태그 (진화형 등 도트 미완성 종)
// 3. 둘 다 없으면 → null
export default function PetCanvas({ state = 'idle', equippedItems = [], scale = 5, flipX = false, dexNum = null, speciesId = null }) {
  injectStyles()

  if (speciesId && PIXEL_ART[speciesId]) {
    const pokemonData = PIXEL_ART[speciesId]
    return <PixelArtCanvas pokemonData={pokemonData} state={state} scale={scale} flipX={flipX} />
  }

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

  return null
}

// 커스텀 도트 포켓몬용 canvas 렌더러
// - state가 'sleeping'이고 SLEEP_BODY가 있으면 수면 전용 도트 + 색상 사용
// - canvas 크기는 그리드 크기에서 자동 계산 (100px 창에 맞게 scale 조정)
// - setTimeout 기반 애니메이션 루프: state나 pokemonData가 바뀌면 useEffect가 재실행되어 루프 재시작
function PixelArtCanvas({ pokemonData, state, flipX }) {
  const canvasRef = useRef(null)
  const frameRef  = useRef(0)
  const animRef   = useRef(null)

  const isSleeping = state === 'sleeping' && pokemonData.SLEEP_BODY
  const body      = isSleeping ? pokemonData.SLEEP_BODY   : pokemonData.BASE_BODY
  const colors    = isSleeping ? pokemonData.SLEEP_COLORS : pokemonData.COLORS
  const animation = DEFAULT_ANIMATIONS[isSleeping ? 'sleeping' : state] || DEFAULT_ANIMATIONS.idle

  // 캔버스 크기: 그리드의 행/열 중 큰 쪽을 기준으로 100px에 맞는 scale 계산
  const rows  = body.length
  const cols  = body[0]?.length ?? rows
  const scale = Math.floor(100 / Math.max(rows, cols))

  // 애니메이션 중 가장 많이 위로 올라가는 양(px)만큼 캔버스 상단에 여유 공간 추가
  // 이 값을 baseYOffset으로 drawPokemon에 전달해 전체 그리기 위치를 아래로 내림
  const maxUpOffset = Math.abs(Math.min(0, ...animation.frames.map(f => f.yOffset ?? 0)))

  const canvasW = cols * scale
  const canvasH = (rows + maxUpOffset) * scale  // 상단 여유 공간 포함

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    ctx.imageSmoothingEnabled = false  // 픽셀아트 선명도 유지

    const { frames, fps } = animation
    const interval = 1000 / fps
    frameRef.current = 0

    const animate = () => {
      const frame = frames[frameRef.current % frames.length]
      drawPokemon(ctx, body, colors, frame, scale, maxUpOffset)
      frameRef.current = (frameRef.current + 1) % frames.length
      animRef.current  = setTimeout(animate, interval)
    }

    animate()
    return () => { if (animRef.current) clearTimeout(animRef.current) }
  }, [state, scale, pokemonData])

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        background: 'transparent',
        transform: flipX ? 'scaleX(-1)' : 'none',
      }}
    />
  )
}
