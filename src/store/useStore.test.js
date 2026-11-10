import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// 스토어는 window.electronAPI 가 없으면 저장·동기화를 건너뛴다. 저장 호출은 가짜로 받아 확인한다
const saved = []
globalThis.window = {
  electronAPI: {
    setStoreAsync: (key, value) => { saved.push({ [key]: value }); return Promise.resolve() },
    setStoreMany: (values) => { saved.push(values); return Promise.resolve() },
    sendStateUpdate: () => {},
    notifyStarterSelected: () => {},
    dismissFocusResult: () => Promise.resolve(true),
  },
}

const { default: useStore } = await import('./useStore')
const { DEFAULT_STATE } = await import('./schema')
const { calcLevel } = await import('../data/pokemon')
const { BOX_LIMIT } = await import('../data/balance')

const PET_STATS = { speciesId: 'charmander', ivs: {}, natureName: '개구쟁이', moves: ['할퀴기', '불꽃세례'], learnedPool: ['할퀴기', '울음소리', '불꽃세례'], abilityName: '맹화', currentHP: null, movePP: null }
const get = () => useStore.getState()

beforeEach(() => {
  saved.length = 0
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  useStore.setState({ ...DEFAULT_STATE, initialized: true, petSpeciesId: 'charmander', petStats: PET_STATS, focusXp: 400, totalPointsEarned: 400, points: 100, encounterTickets: 2 })
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('조우권', () => {
  it('조우하면 조우권 한 장을 쓰고 포인트는 쓰지 않는다', () => {
    get().startWildBattle()
    expect(get().wildBattle?.phase).toBe('selecting')
    expect(get().encounterTickets).toBe(1)
    expect(get().points).toBe(100)
    expect(saved).toContainEqual(expect.objectContaining({ encounterTickets: 1 }))
  })

  it('조우권이 없으면 포인트가 많아도 조우하지 못한다', () => {
    useStore.setState({ encounterTickets: 0, points: 99999 })
    get().startWildBattle()
    expect(get().wildBattle).toBeNull()
    expect(get().points).toBe(99999)
  })

  it('쓰러진 상태로는 조우권을 쓰지 않는다', () => {
    useStore.setState({ petStats: { ...PET_STATS, currentHP: 0 } })
    get().startWildBattle()
    expect(get().encounterTickets).toBe(2)
  })

  it('만난 종이 도감에 남는다', () => {
    get().startWildBattle()
    expect(get().seenSpecies).toContain(get().wildBattle.wild.speciesId)
  })
})

describe('배틀 보상', () => {
  const winBattle = () => {
    get().startWildBattle()
    const battle = get().wildBattle
    useStore.setState({ wildBattle: { ...battle, wild: { ...battle.wild, hp: 1 } } })
    get().executePlayerMove('할퀴기')
    while (get().wildBattle.phase === 'animating') get().advanceBattleFrame()
    return battle.wild.level
  }

  it('이기면 쓸 포인트만 늘고 레벨 경험치는 그대로다', () => {
    const level = calcLevel(get().focusXp)
    const wildLevel = winBattle()
    const reward = Math.floor(10 + wildLevel * 1.5)
    expect(get().wildBattle.result).toBe('win')
    expect(get().points).toBe(100 + reward)
    expect(get().totalPointsEarned).toBe(400 + reward)
    expect(get().focusXp).toBe(400)
    expect(calcLevel(get().focusXp)).toBe(level)
  })

  it('승리 문구에 쓸 실제 보상 값을 남긴다', () => {
    const wildLevel = winBattle()
    expect(get().wildBattle.pointsGained).toBe(Math.floor(10 + wildLevel * 1.5))
  })

  it('배틀을 아무리 이겨도 진화하지 않는다', () => {
    useStore.setState({ focusXp: 1020, encounterTickets: 5 }) // Lv.15, 진화는 Lv.16
    for (let i = 0; i < 5; i++) winBattle()
    expect(get().petSpeciesId).toBe('charmander')
    expect(get().petState).not.toBe('evolving')
  })
})

describe('집중 보상 반영 (Rust 가 보낸 focus-update)', () => {
  const payload = (over = {}) => ({
    session: null, result: null, done: false, prevXp: 400, history: null,
    values: { points: 102, focusXp: 402, totalPointsEarned: 402, totalWorkMinutes: 1, encounterTickets: 2, ticketMinutes: 1 },
    ...over,
  })

  it('숫자를 그대로 반영한다', () => {
    get().applyFocusUpdate(payload({ session: { minutes: 25, endsAt: 999, remainingMs: 0, awarded: 1 } }), true)
    expect(get().points).toBe(102)
    expect(get().focusXp).toBe(402)
    expect(get().totalWorkMinutes).toBe(1)
    expect(get().ticketMinutes).toBe(1)
  })

  it('세션이 돌면 잠들고, 멈추거나 끝나면 깬다', () => {
    get().applyFocusUpdate(payload({ session: { minutes: 25, endsAt: 999 } }), false)
    expect(get().petState).toBe('sleeping')
    get().applyFocusUpdate(payload({ session: { minutes: 25, endsAt: null, remainingMs: 5000 } }), false)
    expect(get().petState).toBe('idle')
  })

  it('완료하면 결과를 남기고 2초간 기뻐한 뒤 돌아온다', () => {
    useStore.setState({ petState: 'sleeping' })
    const result = { minutes: 25, gained: 125, bonus: 75, tickets: 1 }
    get().applyFocusUpdate(payload({ done: true, result, history: [{ id: 1, completedAt: 1, durationMinutes: 25 }] }), true)
    expect(get().focusResult).toEqual(result)
    expect(get().pomodoroHistory).toHaveLength(1)
    expect(get().petState).toBe('happy')
    vi.advanceTimersByTime(2000)
    expect(get().petState).toBe('idle')
  })

  it('레벨이 진화 레벨에 닿으면 펫 창(leader)만 진화를 시작한다', () => {
    const up = payload({ prevXp: 1020, values: { points: 200, focusXp: 1024, totalPointsEarned: 1024 } })
    useStore.setState({ focusXp: 1020 })
    get().applyFocusUpdate(up, false)
    expect(get().petState).toBe('idle')
    useStore.setState({ focusXp: 1020 })
    get().applyFocusUpdate(up, true)
    expect(get().petState).toBe('evolving')
    get().confirmEvolution()
    expect(get().petSpeciesId).toBe('charmeleon')
    expect(get().seenSpecies).toContain('charmeleon')
  })

  it('집중 중 진화하면 끝난 뒤 다시 잠든다', () => {
    useStore.setState({ focusXp: 1020, petState: 'sleeping' })
    get().applyFocusUpdate(payload({ session: { minutes: 25, endsAt: 999 }, prevXp: 1020, values: { focusXp: 1024 } }), true)
    expect(get().petState).toBe('evolving')
    expect(get().preEvolvingState).toBe('sleeping')
  })

  it('레벨이 오르면 새 기술을 배우고 저장한다', () => {
    // 파이리는 Lv.10 에 연막을 배운다
    useStore.setState({ focusXp: 396 })
    get().applyFocusUpdate(payload({ prevXp: 396, values: { focusXp: 400 } }), true)
    expect(get().petStats.learnedPool).toContain('연막')
    expect(saved).toContainEqual({ petStats: expect.objectContaining({ learnedPool: expect.arrayContaining(['연막']) }) })
  })

  it('말풍선을 닫으면 결과가 사라진다', () => {
    useStore.setState({ focusResult: { minutes: 25, gained: 125 } })
    get().dismissFocusResult()
    expect(get().focusResult).toBeNull()
  })
})

describe('보관함', () => {
  const boxed = { speciesId: 'pidgey', dexNum: 16, level: 3, ivs: {}, natureName: '온순한', moves: ['몸통박치기'], learnedPool: ['몸통박치기'], evs: {}, caughtAt: 1234 }

  it('파트너로 바꿔도 포획 시각이 유지되고, 한 번에 저장한다', () => {
    useStore.setState({ caughtPokemon: [boxed] })
    get().swapPartner(0)
    expect(get().petSpeciesId).toBe('pidgey')
    expect(get().petStats.caughtAt).toBe(1234)
    const writes = saved.filter(v => 'petSpeciesId' in v)
    expect(writes).toHaveLength(1)
    expect(Object.keys(writes[0]).sort()).toEqual(['caughtPokemon', 'petEVs', 'petName', 'petSpeciesId', 'petStats'])
    // 다시 넣어도 그대로
    get().swapPartner(0)
    expect(get().caughtPokemon[0].caughtAt).toBe(1234)
  })

  it('가득 차면 볼을 쓰지 않는다', () => {
    useStore.setState({ caughtPokemon: Array.from({ length: BOX_LIMIT }, () => boxed), ballInventory: { ball_pokeball: 3 } })
    get().startWildBattle()
    get().throwBall('ball_pokeball', 1)
    expect(get().ballInventory.ball_pokeball).toBe(3)
    expect(get().wildBattle.phase).toBe('selecting')
  })
})
