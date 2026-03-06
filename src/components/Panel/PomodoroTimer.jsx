import { useState, useEffect, useRef } from 'react'
import useStore from '../../store/useStore'

const DEFAULT_MINUTES = 25
const MIN_MINUTES = 1
const MAX_MINUTES = 120

export default function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_MINUTES)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_MINUTES * 60)
  const [isRunning, setIsRunning] = useState(false)

  const intervalRef      = useRef(null)
  const endTimeRef       = useRef(null)   // wall-clock 기준 종료 시각
  const timeLeftRef      = useRef(DEFAULT_MINUTES * 60)
  const tickStartRef     = useRef(null)   // 현재 실행 시작 시각
  const totalActiveMsRef = useRef(0)      // 누적 실제 작업 시간(ms)
  const awardedMinRef    = useRef(0)      // 이미 지급한 분(min)

  const addPomodoroSession = useStore(s => s.addPomodoroSession)
  const addWorkMinute      = useStore(s => s.addWorkMinute)
  const setPetState        = useStore(s => s.setPetState)

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current)
      // 일시정지 시 누적 활성 시간 저장
      if (tickStartRef.current) {
        totalActiveMsRef.current += Date.now() - tickStartRef.current
        tickStartRef.current = null
      }
      setPetState('idle')
      window.electronAPI?.startWandering()
      return
    }

    // 시작/재개: 실제 종료 시각을 벽시계 기준으로 설정
    endTimeRef.current  = Date.now() + timeLeftRef.current * 1000
    tickStartRef.current = Date.now()

    setPetState('sleeping')
    window.electronAPI?.stopWandering()

    // 200ms마다 체크 → 스로틀링 되더라도 실제 경과 시간 반영
    intervalRef.current = setInterval(() => {
      const now       = Date.now()
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))
      timeLeftRef.current = remaining
      setTimeLeft(remaining)

      // 실제 활성 시간 기준으로 분당 포인트 지급
      if (tickStartRef.current) {
        const activeMs       = totalActiveMsRef.current + (now - tickStartRef.current)
        const elapsedMinutes = Math.floor(activeMs / 60000)
        while (awardedMinRef.current < elapsedMinutes) {
          awardedMinRef.current++
          addWorkMinute()
        }
      }

      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        if (tickStartRef.current) {
          totalActiveMsRef.current += now - tickStartRef.current
          tickStartRef.current = null
        }
        addPomodoroSession()
        totalActiveMsRef.current = 0
        awardedMinRef.current    = 0
        timeLeftRef.current = workMinutes * 60
        setTimeLeft(workMinutes * 60)
        setIsRunning(false)
      }
    }, 200)

    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  // 패널이 다시 보일 때 즉시 시간 갱신
  useEffect(() => {
    const onVisible = () => {
      if (isRunning && endTimeRef.current) {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
        timeLeftRef.current = remaining
        setTimeLeft(remaining)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [isRunning])

  const changeMinutes = (delta) => {
    if (isRunning) return
    const next = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, workMinutes + delta))
    setWorkMinutes(next)
    timeLeftRef.current = next * 60
    setTimeLeft(next * 60)
  }

  const toggle = () => setIsRunning(r => !r)

  const reset = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    timeLeftRef.current      = workMinutes * 60
    setTimeLeft(workMinutes * 60)
    endTimeRef.current       = null
    tickStartRef.current     = null
    totalActiveMsRef.current = 0
    awardedMinRef.current    = 0
    setPetState('idle')
    window.electronAPI?.startWandering()
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = 1 - timeLeft / (workMinutes * 60)
  const circumference = 2 * Math.PI * 45

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>⏱ 집중모드</span>
        <span style={styles.mode}>{isRunning ? '집중 중' : '대기 중'}</span>
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

      {!isRunning && (
        <div style={styles.timeSetRow}>
          <button onClick={() => changeMinutes(-5)} style={styles.stepBtn}>−5</button>
          <button onClick={() => changeMinutes(-1)} style={styles.stepBtn}>−1</button>
          <span style={styles.minuteLabel}>{workMinutes}분</span>
          <button onClick={() => changeMinutes(1)} style={styles.stepBtn}>+1</button>
          <button onClick={() => changeMinutes(5)} style={styles.stepBtn}>+5</button>
        </div>
      )}

      <div style={styles.controls}>
        <button onClick={reset} style={styles.resetBtn}>↺</button>
        <button onClick={toggle} style={styles.playBtn}>
          {isRunning ? '⏸' : '▶'}
        </button>
      </div>

      <div style={styles.hint}>
        완료 시 +75pt · 작업 1분마다 +2pt
      </div>
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
