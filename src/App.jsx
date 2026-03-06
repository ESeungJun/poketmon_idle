import { useEffect, useState, useRef } from 'react'
import PetCanvas from './components/Pet/PetCanvas'
import Panel from './components/Panel/Panel'
import useStore from './store/useStore'
import { getPokemon } from './data/pokemon'

function PetView() {
  const petState = useStore(s => s.petState)
  const equippedItems = useStore(s => s.equippedItems)
  const initialize = useStore(s => s.initialize)
  const syncFromOtherWindow = useStore(s => s.syncFromOtherWindow)
  const initialized = useStore(s => s.initialized)
  const petSpeciesId = useStore(s => s.petSpeciesId)
  const confirmEvolution = useStore(s => s.confirmEvolution)

  const dragging = useRef(false)
  const dragMoved = useRef(false)
  const [flipX, setFlipX] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)

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

  const handleMouseDown = (e) => {
    if (e.button === 2) return
    dragging.current = true
    dragMoved.current = false
    if (window.electronAPI) {
      window.electronAPI.startDrag({ offsetX: e.clientX, offsetY: e.clientY })
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    window.electronAPI?.showContextMenu()
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
      onContextMenu={handleContextMenu}
    >
      <PetCanvas
        key={canvasKey}
        state={petState}
        equippedItems={equippedItems}
        scale={5}
        flipX={flipX}
        dexNum={dexNum}
        speciesId={petSpeciesId}
      />
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
  const [view, setView] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setView(params.get('view') || 'pet')
  }, [])

  if (!view) return null
  if (view === 'panel') return <PanelView />
  return <PetView />
}

const styles = {
  petContainer: {
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    userSelect: 'none',
    background: 'transparent',
  },
}
