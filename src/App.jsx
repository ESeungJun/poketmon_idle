import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import PetCanvas, { getWinSize } from './components/Pet/PetCanvas'
import Panel from './components/Panel/Panel'
import useStore from './store/useStore'
import { getPokemon } from './data/pokemon'

function PetView() {
  const petState = useStore(s => s.petState)
  const initialize = useStore(s => s.initialize)
  const syncFromOtherWindow = useStore(s => s.syncFromOtherWindow)
  const initialized = useStore(s => s.initialized)
  const petSpeciesId = useStore(s => s.petSpeciesId)
  const confirmEvolution = useStore(s => s.confirmEvolution)

  const dragging = useRef(false)
  const dragMoved = useRef(false)
  const [flipX, setFlipX] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)
  const [heartKey, setHeartKey] = useState(0)  // 매번 새 key로 애니메이션 재트리거

  // happy 상태가 될 때마다 key를 올려 하트 애니메이션을 새로 시작
  useLayoutEffect(() => {
    if (petState === 'happy') setHeartKey(k => k + 1)
  }, [petState])

  useEffect(() => {
    initialize()

    const cleanups = []
    if (window.electronAPI) {
      cleanups.push(window.electronAPI.onStateSync(data => syncFromOtherWindow(data)))
      cleanups.push(window.electronAPI.onWanderDirection(dir => setFlipX(dir > 0)))
      cleanups.push(window.electronAPI.onForceRemount(() => setCanvasKey(k => k + 1)))
    }

    const handleMouseUp = () => {
      if (!dragging.current) return
      dragging.current = false
      if (window.electronAPI) window.electronAPI.stopDrag()

      if (!dragMoved.current) {
        window.electronAPI?.togglePanel()
      }
      dragMoved.current = false
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      cleanups.forEach(fn => fn?.())
    }
  }, [])

  // Trigger evolution confirmation after 3-second white flash
  useEffect(() => {
    if (petState !== 'evolving') return
    const timer = setTimeout(() => confirmEvolution(), 3000)
    return () => clearTimeout(timer)
  }, [petState])

  // 진화 단계에 따라 Electron 창 크기 조정
  useEffect(() => {
    if (!petSpeciesId || !window.electronAPI) return
    window.electronAPI.resizePetWindow(getWinSize(petSpeciesId))
  }, [petSpeciesId])

  const handleMouseDown = (e) => {
    if (e.button === 2) return
    dragging.current = true
    dragMoved.current = false
    if (window.electronAPI) {
      window.electronAPI.startDrag({ offsetX: e.clientX, offsetY: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (dragging.current && e.buttons === 1) {
      dragMoved.current = true
    }
  }

  if (!initialized) return null
  if (!petSpeciesId) return null

  const pokemon = getPokemon(petSpeciesId)
  const dexNum = pokemon ? pokemon.dexNum : null

  return (
    <div
      style={styles.petContainer}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <PetCanvas
        key={canvasKey}
        state={petState}
        flipX={flipX}
        dexNum={dexNum}
        speciesId={petSpeciesId}
      />
      {petState === 'happy' && HEARTS.map((h, i) => (
        <div
          key={`${heartKey}-${i}`}
          style={{
            ...styles.heart,
            left: `calc(50% + ${flipX ? h.dx : -h.dx}px)`,
            top: h.top,
            fontSize: h.size,
            animationDelay: h.delay,
          }}
        >❤</div>
      ))}
    </div>
  )
}

function PanelView() {
  const initialize = useStore(s => s.initialize)
  const syncFromOtherWindow = useStore(s => s.syncFromOtherWindow)

  useEffect(() => {
    initialize()
    if (window.electronAPI) {
      const cleanup = window.electronAPI.onStateSync(data => syncFromOtherWindow(data))
      return () => cleanup?.()
    }
  }, [])

  return <Panel />
}

export default function App() {
  const [view] = useState(() => new URLSearchParams(window.location.search).get('view') || 'pet')

  if (view === 'panel') return <PanelView />
  return <PetView />
}

// 하트 3개: 캐릭터 앞쪽으로 퍼지며 시차를 두고 떠오름
// dx: 중심에서 앞쪽(flipX 방향)으로 벌어지는 거리
const HEARTS = [
  { dx: 22, top: '10px', size: '22px', delay: '0s'    },
  { dx: 34, top: '18px', size: '18px', delay: '0.18s' },
  { dx: 14, top: '20px', size: '16px', delay: '0.32s' },
]

const styles = {
  petContainer: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    userSelect: 'none',
    background: 'transparent',
    position: 'relative',
  },
  heart: {
    position: 'absolute',
    color: '#FF4D6D',
    pointerEvents: 'none',
    animation: 'heartFloat 1.8s ease-out forwards',
  },
}

// 하트 플로팅 애니메이션 (위로 올라가며 사라짐)
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes heartFloat {
      0%   { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-30px); }
    }
  `
  document.head.appendChild(style)
}
