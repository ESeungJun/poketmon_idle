import { describe, it, expect } from 'vitest'
import { completionBonus, sessionPoints, battleReward, remainingSeconds, weekSummary, POINTS_PER_MINUTE } from './balance'
import { calcLevel, expForLevel } from './pokemon'

describe('완료 보너스', () => {
  // Rust 의 focus.rs 테스트(bonus_is_proportional_to_minutes)와 같은 표
  it.each([[1, 0], [4, 0], [5, 15], [10, 30], [25, 75], [50, 150], [120, 360]])('%i분 → %i', (minutes, bonus) => {
    expect(completionBonus(minutes)).toBe(bonus)
  })

  it('이상한 값은 0', () => {
    expect(completionBonus(NaN)).toBe(0)
    expect(completionBonus(-5)).toBe(0)
    expect(completionBonus(undefined)).toBe(0)
  })
})

describe('세션 포인트', () => {
  it('개선안의 예상 결과: 1분 2pt, 25분 125pt, 50분 250pt', () => {
    expect(sessionPoints(1)).toBe(2)
    expect(sessionPoints(25)).toBe(125)
    expect(sessionPoints(50)).toBe(250)
  })

  it('짧게 쪼개도 길게 한 번 한 것보다 많이 받지 못한다', () => {
    for (const total of [25, 50, 120]) {
      for (const piece of [1, 2, 4, 5, 10]) {
        const pieces = Math.floor(total / piece)
        expect(pieces * sessionPoints(piece)).toBeLessThanOrEqual(sessionPoints(total))
      }
    }
  })

  it('분당 포인트는 길이와 상관없이 5 를 넘지 않는다', () => {
    for (let m = 1; m <= 120; m++) {
      expect(sessionPoints(m) / m).toBeLessThanOrEqual(POINTS_PER_MINUTE + 3)
    }
  })
})

describe('레벨', () => {
  it('누적 경험치 n²×4 에서 레벨 n', () => {
    expect(calcLevel(0)).toBe(1)
    expect(calcLevel(1023)).toBe(15)
    expect(calcLevel(1024)).toBe(16)
    expect(calcLevel(expForLevel(36))).toBe(36)
  })

  it('1차 진화(Lv.16)까지 25분 집중 9번(약 205분)이 필요하다', () => {
    const sessions = Math.ceil(expForLevel(16) / sessionPoints(25))
    expect(sessions).toBe(9)
  })

  it('경험치가 늘면 레벨이 내려가지 않는다', () => {
    let prev = 1
    for (let xp = 0; xp < 20000; xp += 37) {
      const lv = calcLevel(xp)
      expect(lv).toBeGreaterThanOrEqual(prev)
      prev = lv
    }
  })
})

describe('배틀 보상', () => {
  it('10 + 레벨×1.5, 최소 10', () => {
    expect(battleReward(1)).toBe(11)
    expect(battleReward(16)).toBe(34)
    expect(battleReward(0)).toBe(10)
    expect(battleReward(undefined)).toBe(10)
  })
})

describe('남은 시간', () => {
  const session = { minutes: 25, endsAt: 1_000_000, remainingMs: 25 * 60000 }
  it('종료 시각 기준으로 센다', () => {
    expect(remainingSeconds(session, 1_000_000 - 90_500)).toBe(91)
    expect(remainingSeconds(session, 1_000_000)).toBe(0)
    expect(remainingSeconds(session, 2_000_000)).toBe(0)
  })
  it('시계가 뒤로 가도 세션 길이를 넘지 않는다', () => {
    expect(remainingSeconds(session, -99_999_999)).toBe(25 * 60)
  })
  it('멈춘 세션은 남은 시간을 그대로 보여 준다', () => {
    expect(remainingSeconds({ minutes: 25, endsAt: null, remainingMs: 61_000 }, 5)).toBe(61)
  })
  it('세션이 없으면 0', () => {
    expect(remainingSeconds(null, 0)).toBe(0)
  })
})

describe('주간 기록', () => {
  const noon = (y, m, d) => new Date(y, m - 1, d, 12).getTime()
  const now = noon(2026, 11, 10)
  it('최근 7일의 날짜별 분과 연속 일수', () => {
    const history = [
      { completedAt: noon(2026, 11, 10), durationMinutes: 25 },
      { completedAt: noon(2026, 11, 10) + 3600_000, durationMinutes: 50 },
      { completedAt: noon(2026, 11, 9), durationMinutes: 25 },
      { completedAt: noon(2026, 11, 8), durationMinutes: 10 },
      { completedAt: noon(2026, 11, 6), durationMinutes: 25 },
      { completedAt: noon(2026, 10, 1), durationMinutes: 99 },
    ]
    const week = weekSummary(history, now)
    expect(week.days.map(d => d.minutes)).toEqual([0, 0, 25, 0, 10, 25, 75])
    expect(week.days[6].today).toBe(true)
    expect(week.streak).toBe(3)
    expect(week.totalMinutes).toBe(135)
  })
  it('오늘 아직 안 했으면 어제까지 이어진 날을 센다', () => {
    const history = [{ completedAt: noon(2026, 11, 9), durationMinutes: 25 }, { completedAt: noon(2026, 11, 8), durationMinutes: 25 }]
    expect(weekSummary(history, now).streak).toBe(2)
  })
  it('기록이 없거나 깨져 있어도 죽지 않는다', () => {
    expect(weekSummary(undefined, now).streak).toBe(0)
    expect(weekSummary([null, {}, { completedAt: 'x' }], now).totalMinutes).toBe(0)
  })
})
