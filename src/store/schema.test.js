import { describe, it, expect } from 'vitest'
import { validateStore, DEFAULT_STATE } from './schema'
import { calcLevel } from '../data/pokemon'
import { MAX_TICKETS } from '../data/balance'

// v1.1.0 이 저장하던 모양 (focusXp·조우권·도감이 없다)
const V1 = {
  points: 340,
  totalPointsEarned: 2100,
  totalWorkMinutes: 410,
  purchasedItems: ['tool_leftovers', 'evostone_thunder'],
  pomodoroHistory: [{ id: 1, completedAt: 1, durationMinutes: 25 }],
  petSpeciesId: 'charmeleon',
  petStats: { speciesId: 'charmeleon', ivs: { HP: 20 }, natureName: '용감한', moves: ['할퀴기', '불꽃세례'], learnedPool: ['할퀴기', '불꽃세례', '울음소리'], abilityName: '맹화', currentHP: 31, movePP: { 할퀴기: 20 } },
  petName: '리자',
  petEVs: { HP: 10, 공격: 20 },
  ownedTMs: ['tm35'],
  equippedTool: 'tool_leftovers',
  ballInventory: { ball_pokeball: 3 },
  caughtPokemon: [{ speciesId: 'pidgey', level: 3 }, { speciesId: 'gastly', level: 9 }, { speciesId: 'pidgey', level: 5 }],
}

describe('예전 저장 데이터 이어받기', () => {
  const v = validateStore(V1)

  it('레벨이 그대로다', () => {
    expect(v.focusXp).toBe(2100)
    expect(calcLevel(v.focusXp)).toBe(calcLevel(V1.totalPointsEarned))
  })

  it('포인트·보유물·기록을 깎지 않는다', () => {
    expect(v.points).toBe(340)
    expect(v.totalPointsEarned).toBe(2100)
    expect(v.totalWorkMinutes).toBe(410)
    expect(v.purchasedItems).toEqual(V1.purchasedItems)
    expect(v.ownedTMs).toEqual(['tm35'])
    expect(v.equippedTool).toBe('tool_leftovers')
    expect(v.ballInventory.ball_pokeball).toBe(3)
    expect(v.caughtPokemon).toEqual(V1.caughtPokemon)
    expect(v.pomodoroHistory).toEqual(V1.pomodoroHistory)
    expect(v.petSpeciesId).toBe('charmeleon')
    expect(v.petName).toBe('리자')
    expect(v.petStats.moves).toEqual(['할퀴기', '불꽃세례'])
    expect(v.petStats.currentHP).toBe(31)
    expect(v.petEVs).toMatchObject({ HP: 10, 공격: 20, 스피드: 0 })
  })

  it('새 키를 채운다: 조우권은 가득, 도감은 가진 종', () => {
    expect(v.encounterTickets).toBe(MAX_TICKETS)
    expect(v.ticketMinutes).toBe(0)
    expect(v.seenSpecies).toEqual(['charmeleon', 'pidgey', 'gastly'])
  })
})

describe('새 구조 데이터', () => {
  it('저장된 focusXp 를 쓴다 (배틀로 번 포인트는 레벨에 들어가지 않는다)', () => {
    const v = validateStore({ ...V1, focusXp: 2100, totalPointsEarned: 9999, encounterTickets: 2, ticketMinutes: 7, seenSpecies: ['eevee'] })
    expect(v.focusXp).toBe(2100)
    expect(v.totalPointsEarned).toBe(9999)
    expect(v.encounterTickets).toBe(2)
    expect(v.ticketMinutes).toBe(7)
    expect(v.seenSpecies).toEqual(['eevee'])
  })

  it('조우권은 0~상한으로 자른다', () => {
    expect(validateStore({ encounterTickets: 99 }).encounterTickets).toBe(MAX_TICKETS)
    expect(validateStore({ encounterTickets: -3 }).encounterTickets).toBe(0)
  })
})

describe('깨진 값 방어', () => {
  it('타입이 틀린 값은 기본값으로 둔다', () => {
    const v = validateStore({ points: 'many', totalPointsEarned: NaN, focusXp: Infinity, purchasedItems: 'x', petStats: { speciesId: 1 }, petSpeciesId: 7, caughtPokemon: {}, seenSpecies: [1, 'pidgey', null] })
    expect(v.points).toBe(0)
    expect(v.focusXp).toBe(0)
    expect(v.purchasedItems).toEqual([])
    expect(v.petStats).toBeNull()
    expect(v.petSpeciesId).toBeNull()
    expect(v.caughtPokemon).toEqual([])
    expect(v.seenSpecies).toEqual(['pidgey'])
  })

  it('음수는 0 으로', () => {
    const v = validateStore({ points: -5, focusXp: -1, totalWorkMinutes: -9 })
    expect([v.points, v.focusXp, v.totalWorkMinutes]).toEqual([0, 0, 0])
  })

  it('처음 쓰는 사람은 조우권 한 장', () => {
    expect(validateStore({}).encounterTickets).toBe(1)
    expect(DEFAULT_STATE.encounterTickets).toBe(1)
  })

  it('집중 세션은 저장 파일에서 읽지 않는다 (Rust 가 따로 준다)', () => {
    expect(validateStore({ focusSession: { minutes: 25 } }).focusSession).toBeNull()
  })
})
