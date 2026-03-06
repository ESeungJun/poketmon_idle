import { useState } from 'react'
import useStore from '../../store/useStore'

export default function Settings() {
  const resetAllData = useStore(s => s.resetAllData)
  const [confirm, setConfirm] = useState(false)

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
}
