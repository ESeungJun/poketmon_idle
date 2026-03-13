import { useState } from 'react'
import useStore from '../../store/useStore'
import { getPokemon } from '../../data/pokemon'

export default function Settings() {
  const resetAllData = useStore(s => s.resetAllData)
  const addPoints = useStore(s => s.addPoints)
  const setPetState = useStore(s => s.setPetState)
  const petSpeciesId = useStore(s => s.petSpeciesId)
  const [confirm, setConfirm] = useState(false)
  const [devOpen, setDevOpen] = useState(false)

  const pokemon = getPokemon(petSpeciesId)
  const canEvolve = pokemon?.evolveTo != null

  const handleForceEvolve = () => {
    if (!canEvolve) return
    setPetState('evolving')
  }

  const handleReset = async () => {
    await resetAllData()
    setConfirm(false)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>데이터 관리</div>
        {!confirm ? (
          <button style={styles.resetBtn} onClick={() => setConfirm(true)}>
            데이터 초기화
          </button>
        ) : (
          <div style={styles.confirmBox}>
            <p style={styles.confirmText}>모든 데이터가 삭제됩니다. 정말 초기화할까요?</p>
            <div style={styles.confirmBtns}>
              <button style={styles.cancelBtn} onClick={() => setConfirm(false)}>취소</button>
              <button style={styles.confirmBtn} onClick={handleReset}>초기화</button>
            </div>
          </div>
        )}
      </div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>앱</div>
        <button style={styles.quitBtn} onClick={() => window.electronAPI.quitApp()}>
          앱 종료
        </button>
      </div>
      <div style={styles.section}>
        <button style={styles.devToggle} onClick={() => setDevOpen(v => !v)}>
          🛠 개발자 모드 {devOpen ? '▲' : '▼'}
        </button>
        {devOpen && (
          <div style={styles.devContent}>
            <div style={styles.devLabel}>포인트 추가</div>
            <div style={styles.devRow}>
              {[100, 500, 1000, 5000].map(n => (
                <button key={n} style={styles.devBtn} onClick={() => addPoints(n, false)}>
                  +{n.toLocaleString()}
                </button>
              ))}
            </div>
            <div style={styles.devLabel}>진화</div>
            <button
              style={{ ...styles.devBtn, opacity: canEvolve ? 1 : 0.4, cursor: canEvolve ? 'pointer' : 'default' }}
              onClick={handleForceEvolve}
              disabled={!canEvolve}
            >
              강제 진화 {canEvolve ? `→ ${getPokemon(pokemon.evolveTo)?.speciesName ?? pokemon.evolveTo}` : '(최종 진화형)'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  section: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
  },
  sectionTitle: {
    color: '#888',
    fontSize: '12px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  resetBtn: {
    background: '#3a1a1a',
    border: '1px solid #6b2020',
    color: '#ff6b6b',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
  },
  confirmBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  confirmText: {
    color: '#ccc',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.5',
  },
  confirmBtns: {
    display: 'flex',
    gap: '8px',
  },
  cancelBtn: {
    flex: 1,
    background: '#2a2a3e',
    border: '1px solid #3a3a5e',
    color: '#aaa',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1,
    background: '#6b2020',
    border: '1px solid #8b3030',
    color: '#ff6b6b',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  quitBtn: {
    background: '#1a1a2e',
    border: '1px solid #3a3a5e',
    color: '#aaa',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
  },
  devToggle: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0,
    width: '100%',
    textAlign: 'left',
  },
  devContent: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  devLabel: {
    color: '#666',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  devRow: {
    display: 'flex',
    gap: '6px',
  },
  devBtn: {
    flex: 1,
    background: '#2a2a3e',
    border: '1px solid #3a3a5e',
    color: '#aaa',
    borderRadius: '6px',
    padding: '6px 4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
}
