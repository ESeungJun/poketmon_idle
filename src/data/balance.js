// 성장 밸런스 수식. 전부 순수 함수다.
// 집중 보상은 Rust(src-tauri/src/focus.rs)가 실제로 지급한다. 여기 값은 화면 표시에 쓰며 그쪽과 같아야 한다.

export const POINTS_PER_MINUTE = 2
export const BONUS_PER_MINUTE = 3
export const BONUS_MIN_MINUTES = 5
export const TICKET_EVERY_MINUTES = 25
export const MAX_TICKETS = 5
// 보관함에 둘 수 있는 포켓몬 수
export const BOX_LIMIT = 60

// 완료 보너스: 집중한 분 × 3. 5분 미만은 없다 (1분 세션 반복으로 보너스만 챙기는 것을 막는다)
export function completionBonus(minutes) {
  if (!Number.isFinite(minutes) || minutes < BONUS_MIN_MINUTES) return 0
  return Math.round(minutes * BONUS_PER_MINUTE)
}

// 세션 하나를 끝까지 했을 때 받는 포인트
export function sessionPoints(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0
  return Math.floor(minutes) * POINTS_PER_MINUTE + completionBonus(minutes)
}

// 배틀 승리 보상. 쓸 수 있는 포인트만 주고 레벨 경험치는 주지 않는다
export function battleReward(wildLevel) {
  return Math.max(10, Math.floor(10 + (wildLevel || 0) * 1.5))
}

// 집중 세션의 남은 초. session 은 Rust 가 저장하는 { minutes, endsAt, remainingMs }
export function remainingSeconds(session, now) {
  if (!session) return 0
  const total = session.minutes * 60000
  const ms = session.endsAt != null ? session.endsAt - now : session.remainingMs
  return Math.ceil(Math.min(total, Math.max(0, ms ?? total)) / 1000)
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function dayKey(time) {
  const d = new Date(time)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// 최근 7일(오늘 포함)의 날짜별 완료 집중 분과 연속 일수
// 연속 일수는 오늘 아직 안 했으면 어제까지 이어진 날을 센다
export function weekSummary(history, now) {
  const minutesByDay = new Map()
  for (const s of Array.isArray(history) ? history : []) {
    if (!s || !Number.isFinite(s.completedAt)) continue
    const minutes = Number.isFinite(s.durationMinutes) ? s.durationMinutes : 0
    const key = dayKey(s.completedAt)
    minutesByDay.set(key, (minutesByDay.get(key) || 0) + minutes)
  }
  const dayAt = (back) => {
    const d = new Date(now)
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - back)
    return d
  }
  const days = []
  for (let back = 6; back >= 0; back--) {
    const d = dayAt(back)
    days.push({ label: DAY_LABELS[d.getDay()], minutes: minutesByDay.get(dayKey(d)) || 0, today: back === 0 })
  }
  let streak = 0
  let back = minutesByDay.has(dayKey(dayAt(0))) ? 0 : 1
  while (minutesByDay.has(dayKey(dayAt(back)))) {
    streak++
    back++
  }
  return { days, streak, totalMinutes: days.reduce((sum, d) => sum + d.minutes, 0) }
}
