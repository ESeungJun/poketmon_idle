import { useState } from 'react'
import PomodoroTimer from './PomodoroTimer'
import TodoList from './TodoList'
import PointDisplay from './PointDisplay'
import Shop from '../Shop/Shop'
import PokemonStats from './PokemonStats'
import StarterSelect from './StarterSelect'
import Settings from './Settings'
import useStore from '../../store/useStore'

const TABS = ['홈', '샵', '스탯', '설정']

export default function Panel() {
  const [tab, setTab] = useState(0)
  const petSpeciesId = useStore(s => s.petSpeciesId)
  const initialized = useStore(s => s.initialized)

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closePanel()
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.titleBar}>
        <span style={styles.appName}>🐾 Desktop Pet</span>
        <button onClick={handleClose} style={styles.closeBtn}>×</button>
      </div>

      {initialized && !petSpeciesId ? (
        <div style={styles.content}>
          <StarterSelect />
        </div>
      ) : (
        <>
          <div style={styles.tabBar}>
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                style={{ ...styles.tab, ...(tab === i ? styles.tabActive : {}) }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={styles.content}>
            {tab === 0 && (
              <>
                <PointDisplay />
                <PomodoroTimer />
                <TodoList />
              </>
            )}
            {tab === 1 && <Shop />}
            {tab === 2 && <PokemonStats />}
            {tab === 3 && <Settings />}
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    width: '100%',
    height: '100vh',
    background: '#0f0f1e',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: '#1a1a2e',
    borderBottom: '1px solid #2a2a3e',
    WebkitAppRegion: 'drag',
    flexShrink: 0,
  },
  appName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '20px',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    lineHeight: '1',
    padding: '0 4px',
  },
  tabBar: {
    display: 'flex',
    background: '#1a1a2e',
    padding: '8px 16px',
    gap: '8px',
    borderBottom: '1px solid #2a2a3e',
    flexShrink: 0,
  },
  tab: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  tabActive: {
    background: '#2a2a3e',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
}
