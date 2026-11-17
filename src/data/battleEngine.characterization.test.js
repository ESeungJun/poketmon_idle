// 배틀 엔진 특성 테스트 (#65 리팩토링 전 동작 고정)
// 시드를 고정한 난수로 수백 가지 전투 상황을 만들고, processTurn·processWildOnlyTurn 이 내놓는
// 장면(frames) 전체와 난수를 몇 번 불렀는지를 스냅샷으로 남긴다.
// 스냅샷은 리팩토링 전 코드로 만들었다. 구조를 바꾼 뒤에도 한 글자도 달라지면 안 된다.
// 난수를 부르는 순서가 바뀌어도 결과가 바뀌므로 함께 잡힌다.
// 전투 규칙을 일부러 바꾸는 작업이라면 `npx vitest run -u` 로 스냅샷을 다시 만든다.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { buildWildBattler, buildPlayerBattler, processTurn, processWildOnlyTurn, NATURES } from './battleEngine'
import { POKEMON_DB } from './pokemon'
import { SHOP_ITEMS } from '../components/Shop/items'

afterEach(() => { vi.restoreAllMocks() })

// 시드 고정 난수 (mulberry32)
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

// Math.random 을 지금 쓰는 시드 난수로 돌린다. 호출 횟수를 센다
let current = Math.random
let calls = 0
function useRandom(rng) { current = rng; calls = 0 }
function mockRandom() {
  vi.spyOn(Math, 'random').mockImplementation(() => { calls++; return current() })
}

// 입력을 얼려서, 엔진이 받은 battle 을 고치면 바로 에러가 나게 한다
function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o)
    for (const v of Object.values(o)) deepFreeze(v)
  }
  return o
}

// 키 순서와 상관없이 같은 내용이면 같은 문자열
function stable(v) {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`
  return JSON.stringify(v ?? null)
}
const hash = (v) => createHash('sha1').update(stable(v)).digest('hex').slice(0, 12)

// 스냅샷 한 줄: 전체 결과 해시 + 사람이 읽을 요약(마지막 장면, withLogs 면 문구까지)
// 해시가 장면 전체(문구·HP·상태·능력치 단계·PP·날씨)를 덮으므로 요약은 실패했을 때 보기 쉽게 하는 용도다
function digest(out, withLogs = false) {
  const { frames, pointsGained } = out
  const lastF = frames[frames.length - 1]
  const end = lastF
    ? `${lastF.phase}/${lastF.result} W${lastF.wild?.hp}${lastF.wild?.status ? ':' + lastF.wild.status : ''} P${lastF.player?.hp}${lastF.player?.status ? ':' + lastF.player.status : ''} ${lastF.weather ?? '-'}${lastF.weatherTurns}`
    : 'empty'
  const phases = frames.map(f => f.phase[0]).join('')
  const head = `${hash(out)} rng=${calls} pts=${pointsGained} n=${frames.length} [${phases}] ${end}`
  return withLogs ? `${head} | ${frames.map(f => f.addLog ?? '·').join(' / ')}` : head
}

const SPECIES = Object.keys(POKEMON_DB)
const TM_MOVES = SHOP_ITEMS.filter(i => i.category === 'tm').map(i => i.moveName)
const ITEMS = [null, null, 'tool_leftovers', 'tool_lifejewel', 'tool_shellbell', 'tool_wiseglasses', 'tool_spelltag', 'tool_poisonbarb']
const ABILITY_OVERRIDES = [null, null, null, '태양의힘', '엽록소', '빗속준비']
const STATUSES = [null, null, null, 'burn', 'poison', 'paralysis', 'sleep', 'freeze']
const WEATHERS = [null, null, 'sunny_day', 'rain_dance']
const STAGE_KEYS = ['공격', '방어', '특수공격', '특수방어', '스피드', '명중률', '회피율']

const pick = (r, arr) => arr[Math.floor(r() * arr.length)]
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1))

function randomStages(r) {
  const stages = {}
  for (const k of STAGE_KEYS) stages[k] = r() < 0.25 ? int(r, -6, 6) : 0
  return stages
}

// 상황 하나 만들기 (setup 난수로). 플레이어 기술 moveName 을 쓴다
// opts 로 날씨·야생 종·야생 기술을 정하고, calm 이면 상태이상 없이 양쪽 HP 를 절반으로 둔다
// (opts 는 난수를 다 뽑은 뒤에 덮어써서, opts 가 없을 때의 상황은 바뀌지 않는다)
function makeBattle(r, playerSpecies, moveName, opts = {}) {
  const sp = POKEMON_DB[playerSpecies]
  const otherMoves = sp.baseMoves.map(m => m.name).filter(n => n !== moveName)
  const moves = [moveName, ...otherMoves.filter(() => r() < 0.3)].slice(0, 4)
  const ivs = {}
  for (const k of ['HP', '공격', '방어', '특수공격', '특수방어', '스피드']) ivs[k] = int(r, 0, 31)
  const movePP = r() < 0.15 ? { [moveName]: r() < 0.5 ? 0 : 1 } : null
  const petStats = {
    speciesId: playerSpecies, ivs, natureName: pick(r, NATURES).name, moves,
    abilityName: pick(r, ABILITY_OVERRIDES) ?? sp.abilities[0]?.name ?? null,
    currentHP: r() < 0.3 ? int(r, 0, 40) : null, movePP,
  }
  const evs = r() < 0.3 ? { 공격: int(r, 0, 252), 특수공격: int(r, 0, 252), 스피드: int(r, 0, 252) } : {}
  const xp = int(r, 0, 60) ** 2 * 4
  const player = buildPlayerBattler(playerSpecies, petStats, evs, xp, SHOP_ITEMS, pick(r, ITEMS))
  if (!player) return null

  const wildSpecies = pick(r, SPECIES)
  const wildBase = buildWildBattler(wildSpecies, int(r, 1, 60))
  const wsp = POKEMON_DB[wildSpecies]
  const roll = r()
  // 대부분 배운 기술 하나, 가끔 없음 / 목록에 없는 기술(야생 기술 데이터 없음)
  const wildMoves = roll < 0.08 ? [] : roll < 0.12 ? ['없는기술'] : [pick(r, wsp.baseMoves).name]
  const wildStatus = pick(r, STATUSES)
  const playerStatus = pick(r, STATUSES)
  const wild = {
    ...wildBase,
    moves: wildMoves,
    hp: r() < 0.25 ? int(r, 1, 3) : r() < 0.5 ? int(r, 1, wildBase.maxHP) : wildBase.maxHP,
    abilityName: pick(r, ABILITY_OVERRIDES) ?? wildBase.abilityName,
    stages: randomStages(r),
    status: wildStatus,
    statusTurns: wildStatus === 'sleep' ? int(r, 0, 3) : 0,
  }
  const p = {
    ...player,
    hp: r() < 0.2 ? int(r, 1, 3) : player.hp,
    stages: randomStages(r),
    status: playerStatus,
    statusTurns: playerStatus === 'sleep' ? int(r, 0, 3) : 0,
  }
  let weather = pick(r, WEATHERS)
  let weatherTurns = weather ? int(r, 1, 5) : 0
  let w = wild
  if (opts.wildSpecies) {
    const fresh = buildWildBattler(opts.wildSpecies, wild.level)
    w = { ...fresh, moves: [opts.wildMove], hp: wild.hp > fresh.maxHP ? fresh.maxHP : wild.hp, stages: wild.stages, status: wild.status, statusTurns: wild.statusTurns }
  }
  if ('weather' in opts) { weather = opts.weather; weatherTurns = weather ? 3 : 0 }
  if (opts.calm) {
    w = { ...w, status: null, statusTurns: 0, hp: Math.ceil(w.maxHP / 2) }
    p.status = null; p.statusTurns = 0; p.hp = Math.ceil(p.maxHP / 2)
  }
  return { player: p, wild: w, turn: 1, phase: 'selecting', weather, weatherTurns }
}

const ALL_MOVES = [...new Set([...SPECIES.flatMap(id => POKEMON_DB[id].baseMoves.map(m => m.name)), ...TM_MOVES])]

// 플레이어 종·기술 조합마다 상황을 만든다
function scenarios(variants) {
  const list = []
  let seed = 1
  for (const species of SPECIES) {
    for (const move of POKEMON_DB[species].baseMoves) {
      for (let v = 0; v < variants; v++) {
        list.push({ id: `${species}:${move.name}:${v}`, species, move: move.name, seed: seed++ })
      }
    }
  }
  // 기술머신으로만 배우는 기술(쾌청 등)도 몇 종에게 써 본다
  for (const species of ['charmander', 'bulbasaur', 'squirtle', 'pikachu', 'gengar']) {
    for (const tm of TM_MOVES) {
      for (let v = 0; v < variants; v++) {
        list.push({ id: `${species}:TM:${tm}:${v}`, species, move: tm, seed: seed++ })
      }
    }
  }
  return list
}

describe('특성 테스트: processTurn', () => {
  it('종·기술·상황 조합마다 장면이 리팩토링 전과 같다', () => {
    mockRandom()
    const out = {}
    for (const sc of scenarios(3)) {
      useRandom(seeded(sc.seed))
      const b = makeBattle(seeded(sc.seed * 7919), sc.species, sc.move)
      if (!b) { out[sc.id] = 'no battle'; continue }
      deepFreeze(b)
      useRandom(seeded(sc.seed * 104729))
      out[sc.id] = digest(processTurn(b, sc.move))
    }
    expect(out).toMatchSnapshot()
  })

  it('플레이어 기술마다 날씨별로 리팩토링 전과 같다', () => {
    mockRandom()
    const out = {}
    ALL_MOVES.forEach((move, i) => {
      const results = []
      let total = 0
      for (const weather of [null, 'sunny_day', 'rain_dance']) {
        for (let v = 0; v < 4; v++) {
          const seed = 900000 + i * 100 + v * 10 + WEATHERS.indexOf(weather)
          const setup = seeded(seed)
          useRandom(setup)
          const b = makeBattle(setup, pick(setup, SPECIES), move, { weather, calm: v < 2 })
          deepFreeze(b)
          useRandom(seeded(seed * 3))
          results.push(processTurn(b, move))
          total += calls
        }
      }
      out[move] = `${hash(results)} rng=${total}`
    })
    expect(out).toMatchSnapshot()
  })

  it('배우지 않은 기술 이름이면 쓸 수 없다', () => {
    mockRandom()
    const out = []
    for (let s = 1; s <= 20; s++) {
      useRandom(seeded(s))
      const b = makeBattle(seeded(s * 31), 'charmander', '할퀴기')
      deepFreeze(b)
      useRandom(seeded(s * 131))
      out.push(digest(processTurn(b, '하이드로펌프'), true))
    }
    expect(out).toMatchSnapshot()
  })

  it('여러 턴을 이어 싸워도 리팩토링 전과 같다', () => {
    mockRandom()
    const out = {}
    for (let s = 1; s <= 120; s++) {
      const setup = seeded(s * 7)
      useRandom(setup)
      const species = pick(setup, SPECIES)
      const move = pick(setup, POKEMON_DB[species].baseMoves).name
      let b = makeBattle(setup, species, move)
      if (!b) { out[s] = 'no battle'; continue }
      const lines = []
      useRandom(seeded(s * 104723))
      for (let turn = 0; turn < 8; turn++) {
        const r = seeded(s * 1000 + turn)
        const names = b.player.resolvedMoves.map(m => m.name)
        const name = pick(r, names)
        deepFreeze(b)
        // 가끔 볼 실패 턴(야생만 반격)을 끼워 넣는다
        const res = r() < 0.2 ? processWildOnlyTurn(b) : processTurn(b, name)
        lines.push(digest(res))
        const lastF = res.frames[res.frames.length - 1]
        if (!lastF || lastF.phase === 'ended') break
        b = { ...b, wild: lastF.wild, player: lastF.player, weather: lastF.weather, weatherTurns: lastF.weatherTurns, turn: b.turn + 1 }
      }
      out[s] = lines
    }
    expect(out).toMatchSnapshot()
  })

  it('전투 상대가 없으면 난수를 부르지 않는다', () => {
    mockRandom()
    useRandom(seeded(1))
    expect(processTurn({ wild: null, player: null }, '할퀴기')).toEqual({ frames: [], pointsGained: 0 })
    expect(calls).toBe(0)
  })
})

describe('특성 테스트: processWildOnlyTurn', () => {
  it('종·기술·상황 조합마다 장면이 리팩토링 전과 같다', () => {
    mockRandom()
    const out = {}
    for (const sc of scenarios(2)) {
      useRandom(seeded(sc.seed))
      const b = makeBattle(seeded(sc.seed * 6007), sc.species, sc.move)
      if (!b) { out[sc.id] = 'no battle'; continue }
      deepFreeze(b)
      useRandom(seeded(sc.seed * 15485863))
      out[sc.id] = digest(processWildOnlyTurn(b))
    }
    expect(out).toMatchSnapshot()
  })

  it('야생 종·기술마다 날씨별로 리팩토링 전과 같다 (일반 턴과 볼 실패 턴)', () => {
    mockRandom()
    const out = {}
    let seed = 500000
    for (const species of SPECIES) {
      for (const { name } of POKEMON_DB[species].baseMoves) {
        const results = []
        let total = 0
        for (const weather of [null, 'sunny_day', 'rain_dance']) {
          for (let v = 0; v < 3; v++) {
            const setup = seeded(seed++)
            useRandom(setup)
            const ps = pick(setup, SPECIES)
            const pm = pick(setup, POKEMON_DB[ps].baseMoves).name
            const b = makeBattle(setup, ps, pm, { weather, wildSpecies: species, wildMove: name, calm: v < 2 })
            deepFreeze(b)
            useRandom(seeded(seed * 5))
            results.push(processWildOnlyTurn(b))
            total += calls
            useRandom(seeded(seed * 11))
            results.push(processTurn(b, pm))
            total += calls
          }
        }
        out[`${species}:${name}`] = `${hash(results)} rng=${total}`
      }
    }
    expect(out).toMatchSnapshot()
  })

  it('종 데이터가 없으면 빈 결과', () => {
    mockRandom()
    useRandom(seeded(1))
    const b = makeBattle(seeded(3), 'pikachu', '전기쇼크')
    expect(processWildOnlyTurn({ ...b, wild: { ...b.wild, speciesId: '없는종' } })).toEqual({ frames: [], pointsGained: 0 })
  })
})

describe('난수 주입', () => {
  it('rng 를 넘기면 Math.random 을 부르지 않고, 같은 난수면 결과도 같다', () => {
    mockRandom()
    for (let s = 1; s <= 60; s++) {
      useRandom(seeded(s))
      const species = SPECIES[s % SPECIES.length]
      const move = POKEMON_DB[species].baseMoves[s % POKEMON_DB[species].baseMoves.length].name
      const b = deepFreeze(makeBattle(seeded(s * 17), species, move))
      useRandom(seeded(s * 23))
      const viaMath = processTurn(b, move)
      const viaMathWild = processWildOnlyTurn(b)
      useRandom(() => { throw new Error('Math.random 을 부르면 안 된다') })
      const r = seeded(s * 23)
      expect(processTurn(b, move, r)).toEqual(viaMath)
      expect(processWildOnlyTurn(b, r)).toEqual(viaMathWild)
    }
  })
})
