import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calcDamage, calcCatchRate, buildWildBattler, buildPlayerBattler, processTurn, processWildOnlyTurn, heldItemPowerMod } from './battleEngine'
import { battleReward } from './balance'
import { SHOP_ITEMS } from '../components/Shop/items'

// 난수 0.5: 명중은 맞고(100% 기술), 마비·부가 효과는 걸리지 않는다
beforeEach(() => { vi.spyOn(Math, 'random').mockReturnValue(0.5) })
afterEach(() => { vi.restoreAllMocks() })

const PET_STATS = { speciesId: 'charmander', ivs: {}, natureName: '개구쟁이', moves: ['할퀴기', '불꽃세례'], abilityName: '맹화' }
const player = (item = null, xp = 1024) => buildPlayerBattler('charmander', PET_STATS, {}, xp, SHOP_ITEMS, item)
const battle = (p, w) => ({ player: p, wild: w, turn: 1, phase: 'selecting', weather: null, weatherTurns: 0 })
const last = (frames) => frames[frames.length - 1]
const logs = (frames) => frames.map(f => f.addLog).filter(Boolean)

describe('calcDamage', () => {
  it('위력이 없으면 0, 있으면 최소 1', () => {
    expect(calcDamage(null, 50, 50, '노말', ['노말'])).toBe(0)
    expect(calcDamage(1, 1, 999, '노말', ['노말'])).toBeGreaterThanOrEqual(1)
  })
  it('상성이 반영된다', () => {
    const neutral = calcDamage(40, 50, 50, '불꽃', ['노말'], 20)
    expect(calcDamage(40, 50, 50, '불꽃', ['풀'], 20)).toBeGreaterThan(neutral)
    expect(calcDamage(40, 50, 50, '불꽃', ['물'], 20)).toBeLessThan(neutral)
  })
  it('레벨이 높을수록 세다', () => {
    expect(calcDamage(40, 50, 50, '노말', ['노말'], 30)).toBeGreaterThan(calcDamage(40, 50, 50, '노말', ['노말'], 5))
  })
})

describe('calcCatchRate', () => {
  it('5%~95% 사이', () => {
    expect(calcCatchRate(100, 100, 1, 3)).toBe(0.05)
    expect(calcCatchRate(1, 100, 2, 255, 'sleep')).toBe(0.95)
  })
  it('HP 가 낮고, 볼이 좋고, 상태이상이면 오른다', () => {
    const base = calcCatchRate(50, 100, 1, 100)
    expect(calcCatchRate(10, 100, 1, 100)).toBeGreaterThan(base)
    expect(calcCatchRate(50, 100, 2, 100)).toBeGreaterThan(base)
    expect(calcCatchRate(50, 100, 1, 100, 'paralysis')).toBeGreaterThan(base)
  })
})

describe('buildPlayerBattler', () => {
  it('레벨은 집중 경험치에서 나온다', () => {
    expect(player(null, 1024).level).toBe(16)
    expect(player(null, 0).level).toBe(1)
  })
  it('지닌 도구를 싣는다', () => {
    expect(player('tool_leftovers').heldItem).toBe('tool_leftovers')
    expect(player().heldItem).toBeNull()
  })
  it('기술이 없으면 배틀할 수 없다', () => {
    expect(buildPlayerBattler('charmander', { ...PET_STATS, moves: [] }, {}, 0, SHOP_ITEMS)).toBeNull()
  })
})

describe('processTurn', () => {
  it('턴이 끝나면 다시 기술을 고른다', () => {
    const { frames, pointsGained } = processTurn(battle(player(), buildWildBattler('snorlax', 30)), '할퀴기')
    expect(last(frames).phase).toBe('selecting')
    expect(last(frames).result).toBeNull()
    expect(pointsGained).toBe(0)
    expect(last(frames).player.movePP['할퀴기']).toBe(player().movePP['할퀴기'] - 1)
  })

  it('이기면 야생 레벨에 따른 포인트를 받는다', () => {
    const wild = { ...buildWildBattler('pidgey', 12), hp: 1 }
    const { frames, pointsGained } = processTurn(battle(player(), wild), '할퀴기')
    expect(last(frames).result).toBe('win')
    expect(last(frames).phase).toBe('ended')
    expect(pointsGained).toBe(battleReward(12))
    expect(pointsGained).toBe(28)
  })

  it('지면 포인트가 없다', () => {
    const p = { ...player(), hp: 1 }
    const { frames, pointsGained } = processTurn(battle(p, buildWildBattler('snorlax', 40)), '할퀴기')
    expect(last(frames).result).toBe('lose')
    expect(pointsGained).toBe(0)
  })

  it('PP 가 없는 기술은 쓰지 못한다', () => {
    const p = { ...player(), movePP: { 할퀴기: 0, 불꽃세례: 5 } }
    const wild = buildWildBattler('snorlax', 30)
    const { frames } = processTurn(battle(p, wild), '할퀴기')
    expect(logs(frames)).toContain('할퀴기의 PP가 바닥났다!')
    expect(last(frames).wild.hp).toBe(wild.hp)
  })

  it('전투 상대가 없으면 아무 일도 없다', () => {
    expect(processTurn({ wild: null, player: null }, '할퀴기')).toEqual({ frames: [], pointsGained: 0 })
  })
})

describe('지닌 도구', () => {
  it('위력 보정표', () => {
    const special = { category: '특수', type: '불꽃' }
    const physical = { category: '물리', type: '노말' }
    expect(heldItemPowerMod('tool_lifejewel', physical)).toBe(1.3)
    expect(heldItemPowerMod('tool_wiseglasses', special)).toBe(1.1)
    expect(heldItemPowerMod('tool_wiseglasses', physical)).toBe(1)
    expect(heldItemPowerMod('tool_spelltag', { category: '특수', type: '고스트' })).toBe(1.2)
    expect(heldItemPowerMod('tool_spelltag', special)).toBe(1)
    expect(heldItemPowerMod('tool_poisonbarb', { category: '특수', type: '독' })).toBe(1.2)
    expect(heldItemPowerMod('tool_leftovers', special)).toBe(1)
    expect(heldItemPowerMod(null, special)).toBe(1)
    // 효과를 아직 넣지 않은 도구는 보정이 없다
    for (const id of ['tool_specs', 'tool_scarf', 'tool_sash', 'tool_sludge']) {
      expect(heldItemPowerMod(id, special)).toBe(1)
    }
  })

  it('효과를 넣은 도구만 팔고, 나머지는 준비 중으로 표시한다', () => {
    const tools = SHOP_ITEMS.filter(i => i.category === 'tool')
    const live = tools.filter(i => !i.pending).map(i => i.id).sort()
    expect(live).toEqual(['tool_leftovers', 'tool_lifejewel', 'tool_poisonbarb', 'tool_shellbell', 'tool_spelltag', 'tool_wiseglasses'])
    expect(tools.filter(i => i.pending)).toHaveLength(4)
  })

  // 같은 상대에게 같은 기술을 썼을 때 준 대미지
  const dealt = (item, move) => {
    const wild = buildWildBattler('snorlax', 30)
    const { frames } = processTurn(battle(player(item), wild), move)
    return { damage: wild.hp - last(frames).wild.hp, frames }
  }

  it('생명의구슬: 대미지 1.3배, 공격할 때 최대 HP 의 1/10 을 잃는다', () => {
    const plain = dealt(null, '불꽃세례')
    const orb = dealt('tool_lifejewel', '불꽃세례')
    expect(orb.damage).toBeGreaterThan(plain.damage)
    expect(orb.damage).toBeLessThanOrEqual(Math.ceil(plain.damage * 1.3) + 1)
    const p = player()
    const recoil = Math.floor(p.maxHP / 10)
    expect(last(plain.frames).player.hp - last(orb.frames).player.hp).toBe(recoil)
    expect(logs(orb.frames).some(l => l.includes('생명의구슬'))).toBe(true)
  })

  it('박식안경: 특수 기술만 세진다', () => {
    expect(dealt('tool_wiseglasses', '불꽃세례').damage).toBeGreaterThanOrEqual(dealt(null, '불꽃세례').damage)
    expect(dealt('tool_wiseglasses', '할퀴기').damage).toBe(dealt(null, '할퀴기').damage)
  })

  it('먹다남은음식: 턴 끝에 최대 HP 의 1/16 회복', () => {
    const wild = { ...buildWildBattler('snorlax', 30), moves: [] }
    const run = (item) => processTurn(battle({ ...player(item), hp: 20 }, wild), '할퀴기').frames
    const p = player()
    expect(last(run(null)).player.hp).toBe(20)
    expect(last(run('tool_leftovers')).player.hp).toBe(20 + Math.max(1, Math.floor(p.maxHP / 16)))
    expect(logs(run('tool_leftovers')).some(l => l.includes('먹다남은음식'))).toBe(true)
  })

  it('먹다남은음식: HP 가 가득이면 문구도 없다', () => {
    const wild = { ...buildWildBattler('pidgey', 1), moves: [] }
    const { frames } = processTurn(battle(player('tool_leftovers'), wild), '불꽃세례')
    expect(logs(frames).some(l => l.includes('먹다남은음식'))).toBe(false)
  })

  it('조개껍질방울: 준 대미지의 1/8 회복', () => {
    const hurt = { ...player('tool_shellbell'), hp: 5 }
    const wild = { ...buildWildBattler('snorlax', 30), moves: [] }
    const { frames } = processTurn(battle(hurt, wild), '불꽃세례')
    const damage = wild.hp - last(frames).wild.hp
    expect(last(frames).player.hp).toBe(5 + Math.max(1, Math.floor(damage / 8)))
  })

  it('볼을 던져 실패한 턴에도 먹다남은음식이 듣는다', () => {
    const hurt = { ...player('tool_leftovers'), hp: 20 }
    const wild = { ...buildWildBattler('pidgey', 1), moves: [] }
    const { frames } = processWildOnlyTurn(battle(hurt, { ...wild, moves: ['모래뿌리기'] }))
    expect(last(frames).player.hp).toBeGreaterThanOrEqual(20)
  })
})
