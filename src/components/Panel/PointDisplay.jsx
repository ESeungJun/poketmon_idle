import useStore from '../../store/useStore'
import { weekSummary } from '../../data/balance'

export default function PointDisplay() {
  const points = useStore(s => s.points)
  const pomodoroHistory = useStore(s => s.pomodoroHistory)
  const totalWorkMinutes = useStore(s => s.totalWorkMinutes)
  const week = weekSummary(pomodoroHistory, Date.now())
  const peak = Math.max(1, ...week.days.map(d => d.minutes))

  return (
    <div style={styles.container}>
      <div style={styles.pointBadge}>
        <span style={styles.coin}>⭐</span>
        <span style={styles.pointValue}>{points.toLocaleString()}</span>
        <span style={styles.pointLabel}>포인트</span>
      </div>
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statIcon}>🍅</span>
          <span style={styles.statValue}>{pomodoroHistory.length}</span>
          <span style={styles.statLabel}>집중모드</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statIcon}>⏱️</span>
          <span style={styles.statValue}>{totalWorkMinutes}</span>
          <span style={styles.statLabel}>작업분</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statIcon}>🔥</span>
          <span style={styles.statValue}>{week.streak}</span>
          <span style={styles.statLabel}>연속 일</span>
        </div>
      </div>
      <div style={styles.week} title="최근 7일 동안 완료한 집중 시간">
        {week.days.map((d, i) => (
          <div key={i} style={styles.weekDay}>
            <div style={styles.weekBarWrap}>
              <div style={{ ...styles.weekBar, height: `${Math.round(d.minutes / peak * 100)}%`, opacity: d.today ? 1 : 0.6 }} />
            </div>
            <span style={styles.weekMinutes}>{d.minutes || ''}</span>
            <span style={{ ...styles.weekLabel, fontWeight: d.today ? 'bold' : 'normal' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  pointBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  coin: {
    fontSize: '24px',
  },
  pointValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: 'Courier New, monospace',
  },
  pointLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    alignSelf: 'flex-end',
    paddingBottom: '4px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statIcon: {
    fontSize: '16px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)',
  },
  week: {
    display: 'flex',
    gap: '6px',
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
  },
  weekDay: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  weekBarWrap: {
    width: '100%',
    height: '28px',
    display: 'flex',
    alignItems: 'flex-end',
  },
  weekBar: {
    width: '100%',
    minHeight: '2px',
    background: '#FFD700',
    borderRadius: '2px',
  },
  weekMinutes: {
    fontSize: '9px',
    color: 'rgba(255,255,255,0.8)',
    height: '11px',
  },
  weekLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)',
  },
}
