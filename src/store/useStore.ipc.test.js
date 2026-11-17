// 스토어 저장·동기화 특성 테스트 (#65 리팩토링 전 동작 고정)
// 액션마다 "상태 바꾸기(set) · 디스크 저장(setStoreAsync / setStoreMany) · 다른 창 알림(sendStateUpdate)"이
// 어떤 순서로, 어떤 값으로 일어나는지 기록해 스냅샷으로 남긴다. 스냅샷은 리팩토링 전 코드로 만들었다.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const log = []
globalThis.window = {
  electronAPI: {
    setStoreAsync: (key, value) => { log.push(['save', key, value]); return Promise.resolve() },
    setStoreMany: (values) => { log.push(['saveMany', values]); return Promise.resolve() },
    sendStateUpdate: (data) => { log.push(['sync', data]) },
    notifyStarterSelected: () => { log.push(['notifyStarter']) },
    dismissFocusResult: () => Promise.resolve(true),
  },
}

const { default: useStore } = await import('./useStore')
const { DEFAULT_STATE } = await import('./schema')

const PET_STATS = { speciesId: 'charmander', ivs: {}, natureName: '개구쟁이', moves: ['할퀴기', '불꽃세례'], learnedPool: ['할퀴기', '울음소리', '불꽃세례'], abilityName: '맹화', currentHP: null, movePP: null }
const BOXED = { speciesId: 'pidgey', dexNum: 16, level: 3, ivs: {}, natureName: '온순한', moves: ['몸통박치기'], learnedPool: ['몸통박치기'], evs: {}, caughtAt: 1234 }
const get = () => useStore.getState()

// 시드 고정 난수
function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let unsubscribe
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-17T00:00:00Z'))
  vi.spyOn(Math, 'random').mockImplementation(seeded(42))
  useStore.setState({
    ...DEFAULT_STATE, initialized: true, lastActiveTime: 0,
    petSpeciesId: 'charmander', petStats: PET_STATS, focusXp: 1020, totalPointsEarned: 400, points: 500, encounterTickets: 3,
    purchasedItems: ['tool_leftovers', 'evostone_thunder'], ballInventory: { ball_pokeball: 2, ball_superball: 0, ball_hyperball: 0 },
    caughtPokemon: [BOXED],
  })
  log.length = 0
  // set 이 일어난 시점도 같은 기록에 남긴다 (바뀐 키만)
  unsubscribe = useStore.subscribe((next, prev) => {
    const changed = Object.keys(next).filter(k => next[k] !== prev[k]).sort()
    log.push(['set', changed])
  })
})
afterEach(() => {
  unsubscribe()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// 액션 하나 실행 → 기록 + 남은 타이머까지 돌린 기록
function record(run) {
  const ret = run()
  vi.runAllTimers()
  return { ret: ret === undefined ? null : ret, log: JSON.parse(JSON.stringify(log)) }
}

describe('특성 테스트: 액션별 저장·동기화 순서', () => {
  const cases = {
    addPoints: () => get().addPoints(30),
    addPointsQuiet: () => get().addPoints(30, false),
    gainFocusXp: () => get().gainFocusXp(10),
    spendPoints: () => get().spendPoints(40),
    spendPointsShort: () => get().spendPoints(99999),
    selectStarter: () => get().selectStarter('bulbasaur'),
    confirmEvolution: () => get().confirmEvolution(),
    purchaseItem: () => get().purchaseItem('tool_shellbell', 50),
    purchaseItemOwned: () => get().purchaseItem('tool_leftovers', 50),
    useEvoStone: () => { useStore.setState({ petSpeciesId: 'pikachu', petStats: { ...PET_STATS, speciesId: 'pikachu' } }); log.length = 0; return get().useEvoStone('evostone_thunder') },
    setPetState: () => get().setPetState('evolving'),
    setPetSpecies: () => get().setPetSpecies('squirtle'),
    setPetStats: () => get().setPetStats({ ...PET_STATS, moves: ['할퀴기'] }),
    setPetName: () => get().setPetName('불꼬리'),
    applyVitamin: () => get().applyVitamin('공격', 20),
    equipTool: () => get().equipTool('tool_leftovers'),
    buyTM: () => get().buyTM('tm11', 100),
    buyBall: () => get().buyBall('ball_superball', 30),
    swapPartner: () => get().swapPartner(0),
    releaseFromBox: () => get().releaseFromBox(0),
    useTM: () => get().useTM('쾌청'),
    swapMove: () => get().swapMove(1, '울음소리'),
    healAtCenter: () => get().healAtCenter(),
    startWildBattleNoStats: () => { useStore.setState({ petStats: null }); log.length = 0; return get().startWildBattle() },
  }
  for (const [name, run] of Object.entries(cases)) {
    it(name, () => {
      expect(record(run)).toMatchSnapshot()
    })
  }

  it('배틀 한 판(기술 → 장면 끝까지)', () => {
    expect(record(() => {
      get().startWildBattle()
      for (let turn = 0; turn < 30 && get().wildBattle.phase !== 'ended'; turn++) {
        get().executePlayerMove('불꽃세례')
        while (get().wildBattle.phase === 'animating') get().advanceBattleFrame()
      }
      return get().wildBattle.result
    })).toMatchSnapshot()
  })

  it('배틀 승리 (보상 포인트)', () => {
    expect(record(() => {
      get().startWildBattle()
      const b = get().wildBattle
      useStore.setState({ wildBattle: { ...b, wild: { ...b.wild, hp: 1 } } })
      get().executePlayerMove('불꽃세례')
      while (get().wildBattle.phase === 'animating') get().advanceBattleFrame()
      return [get().wildBattle.result, get().points]
    })).toMatchSnapshot()
  })

  it('도망치기', () => {
    expect(record(() => {
      get().startWildBattle()
      get().executePlayerMove('할퀴기')
      while (get().wildBattle.phase === 'animating') get().advanceBattleFrame()
      if (get().wildBattle.phase === 'selecting') get().fleeFromBattle()
      return get().wildBattle.result
    })).toMatchSnapshot()
  })

  it('볼 던지기 (잡을 때까지)', () => {
    expect(record(() => {
      useStore.setState({ ballInventory: { ball_pokeball: 0, ball_superball: 0, ball_hyperball: 10 } })
      get().startWildBattle()
      for (let i = 0; i < 10 && get().wildBattle.phase === 'selecting'; i++) {
        get().throwBall('ball_hyperball', 2)
        while (get().wildBattle.phase === 'animating') get().advanceBattleFrame()
      }
      return get().wildBattle.result
    })).toMatchSnapshot()
  })
})
