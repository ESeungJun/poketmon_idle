import { useState, useEffect } from 'react'
import PomodoroTimer from './PomodoroTimer'
import PointDisplay from './PointDisplay'
import Shop from '../Shop/Shop'
import PokemonStats from './PokemonStats'
import Battle from './Battle'
import PokeCenter from './PokeCenter'
import StarterSelect from './StarterSelect'
import Box from './Box'
import Settings from './Settings'
import useStore from '../../store/useStore'

const TABS = ['홈', '샵', '스탯', '보관함', '배틀', '센터', '설정']

export default function Panel() {
  const [tab, setTab] = useState(0)
  const petSpeciesId = useStore(s => s.petSpeciesId)
  const initialized = useStore(s => s.initialized)
  const [storeNotice, setStoreNotice] = useState(null)

  // 저장 파일을 읽지 못해 복구했거나 저장이 안 되는 상태면 알린다
  useEffect(() => {
    window.electronAPI?.storeStatus().then(status => {
      if (status?.notice === 'recovered') setStoreNotice(`저장 파일을 읽지 못해 이전 사본으로 되살렸습니다.${status.file ? ` 원본은 ${status.file} 로 남겨 두었습니다.` : ''}`)
      else if (status?.notice === 'reset') setStoreNotice(`저장 파일을 읽지 못해 새로 시작했습니다. 원본은 데이터 폴더에 ${status.file} 로 남겨 두었습니다.`)
      else if (status?.notice === 'readonly') setStoreNotice('저장 파일을 읽지 못했고 옮기지도 못했습니다. 이번 실행의 진행 상황은 저장되지 않습니다.')
      else if (status?.saveFailed) setStoreNotice('저장에 실패한 적이 있습니다. 디스크 공간을 확인해 주세요.')
    }).catch(() => {})
  }, [])

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closePanel()
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.titleBar}>
        <div style={styles.appInfo}>
          <img src="app-icon.png" alt="" style={styles.appIcon} />
          <span style={styles.appName}>포켓몬키우기</span>
        </div>
        <button onClick={handleClose} style={styles.closeBtn}>×</button>
      </div>

      {storeNotice && (
        <div style={styles.notice} onClick={() => setStoreNotice(null)} role="status">{storeNotice}</div>
      )}

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
            <div style={{ display: tab === 0 ? 'block' : 'none' }}>
              <PointDisplay />
              <PomodoroTimer />
            </div>
            {tab === 1 && <Shop />}
            {tab === 2 && <PokemonStats />}
            {tab === 3 && <Box />}
            {tab === 4 && <Battle />}
            <div style={{ display: tab === 5 ? 'block' : 'none' }}><PokeCenter /></div>
            {tab === 6 && <Settings />}
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  notice: {
    background: '#3a2a12',
    color: '#FFD98A',
    fontSize: '11px',
    lineHeight: 1.5,
    padding: '8px 12px',
    cursor: 'pointer',
    wordBreak: 'break-all',
  },
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
  appInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  appIcon: {
    width: '20px',
    height: '20px',
    imageRendering: 'pixelated',
    borderRadius: '4px',
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
    padding: '8px 12px',
    gap: '4px',
    borderBottom: '1px solid #2a2a3e',
    flexShrink: 0,
    overflowX: 'auto',
  },
  tab: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
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
