import { useState, useEffect, useRef } from 'react'
import useStore from '../../store/useStore'

const WORK_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  const intervalRef      = useRef(null)
  const endTimeRef       = useRef(null)   // wall-clock 기준 종료 시각
  const timeLeftRef      = useRef(WORK_TIME)
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

    if (isBreak) {
      setPetState('idle')
      window.electronAPI?.startWandering()
    } else {
      setPetState('sleeping')
      window.electronAPI?.stopWandering()
    }

    // 200ms마다 체크 → 스로틀링 되더라도 실제 경과 시간 반영
    intervalRef.current = setInterval(() => {
      const now       = Date.now()
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))
      timeLeftRef.current = remaining
      setTimeLeft(remaining)

      // 실제 활성 시간 기준으로 분당 포인트 지급
      if (!isBreak && tickStartRef.current) {
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
        setIsRunning(false)
        if (!isBreak) {
          addPomodoroSession()
          totalActiveMsRef.current = 0
          awardedMinRef.current    = 0
          setIsBreak(true)
          timeLeftRef.current = BREAK_TIME
          setTimeLeft(BREAK_TIME)
        } else {
          totalActiveMsRef.current = 0
          awardedMinRef.current    = 0
          setIsBreak(false)
          timeLeftRef.current = WORK_TIME
          setTimeLeft(WORK_TIME)
          setPetState('idle')
        }
      }
    }, 200)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, isBreak])

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

  const toggle = () => setIsRunning(r => !r)

  const reset = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setIsBreak(false)
    timeLeftRef.current      = WORK_TIME
    setTimeLeft(WORK_TIME)
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
  const progress = isBreak ? 1 - timeLeft / BREAK_TIME : 1 - timeLeft / WORK_TIME
  const circumference = 2 * Math.PI * 45

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>⏱ 집중모드</span>
        <span style={styles.mode}>{isRunning && !isBreak ? '집중 중' : isBreak ? '휴식 중' : '대기 중'}</span>
      </div>

      <div style={styles.timerWrapper}>
        <svg width="120" height="120" style={styles.svg}>
          <circle cx="60" cy="60" r="45" stroke="#2a2a3e" strokeWidth="8" fill="none" />
          <circle
            cx="60" cy="60" r="45"
            stroke={isBreak ? '#4CAF50' : '#FF6B6B'}
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
          {isBreak && <span style={styles.breakLabel}>휴식</span>}
        </div>
      </div>

      <div style={styles.controls}>
        <button onClick={reset} style={styles.resetBtn}>↺</button>
        <button onClick={toggle} style={{ ...styles.playBtn, background: isBreak ? '#4CAF50' : '#FF6B6B' }}>
          {isRunning ? '⏸' : '▶'}
        </button>
      </div>

      <div style={styles.hint}>
        완료 시 +50pt · 작업 1분마다 +1pt
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
  breakLabel: {
    fontSize: '10px',
    color: '#4CAF50',
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
}
