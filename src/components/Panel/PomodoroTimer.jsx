import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import { completionBonus, remainingSeconds, POINTS_PER_MINUTE, BONUS_MIN_MINUTES } from '../../data/balance'

const DEFAULT_MINUTES = 25
const MIN_MINUTES = 1
const MAX_MINUTES = 120

// 집중 타이머 화면. 시간은 Rust 가 재고(종료 시각을 저장) 여기서는 남은 시간을 보여 주기만 한다.
// 그래서 패널을 닫거나 앱을 다시 켜도 세션이 이어진다.
export default function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_MINUTES)
  const [now, setNow] = useState(Date.now())

  const session     = useStore(s => s.focusSession)
  const result      = useStore(s => s.focusResult)
  const startFocus  = useStore(s => s.startFocus)
  const pauseFocus  = useStore(s => s.pauseFocus)
  const resumeFocus = useStore(s => s.resumeFocus)
  const cancelFocus = useStore(s => s.cancelFocus)

  const isRunning = session?.endsAt != null
  const isPaused  = session != null && !isRunning

  // 남은 시간 표시만 갱신한다 (벽시계 기준이라 늦게 돌아도 값은 맞다)
  useEffect(() => {
    if (!isRunning) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 500)
    const onVisible = () => setNow(Date.now())
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isRunning])

  const changeMinutes = (delta) => {
    if (session) return
    setWorkMinutes(m => Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, m + delta)))
  }

  const toggle = () => {
    if (isRunning) pauseFocus()
    else if (isPaused) resumeFocus()
    else startFocus(workMinutes)
  }

  const minutesShown = session ? session.minutes : workMinutes
  const timeLeft = session ? remainingSeconds(session, now) : workMinutes * 60
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = 1 - timeLeft / (minutesShown * 60)
  const circumference = 2 * Math.PI * 45
  const bonus = completionBonus(minutesShown)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>⏱ 집중모드</span>
        <span style={styles.mode}>{isRunning ? '집중 중' : isPaused ? '멈춤' : '대기 중'}</span>
      </div>

      <div style={styles.timerWrapper}>
        <svg width="120" height="120" style={styles.svg}>
          <circle cx="60" cy="60" r="45" stroke="#2a2a3e" strokeWidth="8" fill="none" />
          <circle
            cx="60" cy="60" r="45"
            stroke="#FF6B6B"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.2s linear' }}
          />
        </svg>
        <div style={styles.timeDisplay}>
          <span style={styles.time}>{timeStr}</span>
        </div>
      </div>

      {!session && (
        <div style={styles.timeSetRow}>
          <button onClick={() => changeMinutes(-5)} style={styles.stepBtn}>−5</button>
          <button onClick={() => changeMinutes(-1)} style={styles.stepBtn}>−1</button>
          <span style={styles.minuteLabel}>{workMinutes}분</span>
          <button onClick={() => changeMinutes(1)} style={styles.stepBtn}>+1</button>
          <button onClick={() => changeMinutes(5)} style={styles.stepBtn}>+5</button>
        </div>
      )}

      <div style={styles.controls}>
        <button onClick={cancelFocus} style={styles.resetBtn} disabled={!session} aria-label="집중 중단">↺</button>
        <button onClick={toggle} style={styles.playBtn} aria-label={isRunning ? '멈춤' : '시작'}>
          {isRunning ? '⏸' : '▶'}
        </button>
      </div>

      <div style={styles.hint}>
        {bonus > 0
          ? `완료 시 +${bonus}pt · 1분마다 +${POINTS_PER_MINUTE}pt`
          : `1분마다 +${POINTS_PER_MINUTE}pt · 완료 보너스는 ${BONUS_MIN_MINUTES}분부터`}
      </div>
      {!session && result && (
        <div style={styles.lastResult}>
          방금 {result.minutes}분 완료 · +{result.gained}pt{result.tickets > 0 ? ` · 조우권 +${result.tickets}` : ''}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mode: {
    fontSize: '12px',
    color: '#888',
    background: '#2a2a3e',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  timerWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '12px',
  },
  svg: {
    display: 'block',
  },
  timeDisplay: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  time: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '2px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  resetBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: '#2a2a3e',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer',
  },
  playBtn: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    background: '#FF6B6B',
    color: '#FFFFFF',
    fontSize: '22px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  hint: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#555',
  },
  lastResult: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#FFD700',
    marginTop: '6px',
  },
  timeSetRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
  },
  stepBtn: {
    padding: '2px 8px',
    borderRadius: '6px',
    border: 'none',
    background: '#2a2a3e',
    color: '#aaa',
    fontSize: '12px',
    cursor: 'pointer',
  },
  minuteLabel: {
    fontSize: '13px',
    color: '#ccc',
    minWidth: '36px',
    textAlign: 'center',
  },
}
