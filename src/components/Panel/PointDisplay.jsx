import useStore from '../../store/useStore'

export default function PointDisplay() {
  const points = useStore(s => s.points)
  const pomodoroHistory = useStore(s => s.pomodoroHistory)
  const todos = useStore(s => s.todos)
  const totalWorkMinutes = useStore(s => s.totalWorkMinutes)

  const completedTodos = todos.filter(t => t.completed).length

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
          <span style={styles.statIcon}>✅</span>
          <span style={styles.statValue}>{completedTodos}</span>
          <span style={styles.statLabel}>할일 완료</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statIcon}>⏱️</span>
          <span style={styles.statValue}>{totalWorkMinutes}</span>
          <span style={styles.statLabel}>작업분</span>
        </div>
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
}
