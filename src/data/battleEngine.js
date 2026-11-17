import { getPokemon, MOVE_META, getMovesUpToLevel, calcLevel, getMaxPP, resolveMove } from './pokemon'
import { getTypeEffectiveness } from './typeChart'
import { battleReward } from './balance'

// Auto-generate petStats when null (same logic as PokemonStats.jsx generate())
export function generatePetStats(pokemon, playerLevel) {
  const STAT_KEYS = ['HP', '공격', '방어', '특수공격', '특수방어', '스피드']
  const ivs = {}
  STAT_KEYS.forEach(k => { ivs[k] = Math.floor(Math.random() * 32) })
  const nature   = NATURES[Math.floor(Math.random() * NATURES.length)]
  const ability  = pokemon.abilities[Math.floor(Math.random() * pokemon.abilities.length)]
  const learnedMoves = getMovesUpToLevel(pokemon, playerLevel).map(m => m.name)
  const moves = learnedMoves.slice(-4)
  if (!moves.length && pokemon.baseMoves[0]) moves.push(pokemon.baseMoves[0].name)
  return {
    speciesId: pokemon.id,
    ivs,
    natureName: nature.name,
    moves,
    learnedPool: [...learnedMoves],
    abilityName: ability.name,
    currentHP: null,
    movePP: null,
  }
}

// Korean status names
export const STATUS_KO = {
  burn:      '화상',
  poison:    '독',
  paralysis: '마비',
  sleep:     '잠듦',
  freeze:    '얼음',
}

// Korean weather names/messages
export const WEATHER_KO = {
  sunny_day:  { name: '쾌청', start: '날씨가 맑아졌다!', end: '날씨가 원래대로 돌아왔다.' },
  rain_dance: { name: '비', start: '비가 내리기 시작했다!', end: '비가 그쳤다.' },
}

export const NATURES = [
  { name: '개구쟁이',   up: null,        down: null },
  { name: '외로움',     up: '공격',      down: '방어' },
  { name: '용감한',     up: '공격',      down: '스피드' },
  { name: '개구진',     up: '공격',      down: '특수방어' },
  { name: '장난꾸러기', up: '방어',      down: '특수공격' },
  { name: '대담한',     up: '방어',      down: '공격' },
  { name: '온순한',     up: null,        down: null },
  { name: '느긋한',     up: '방어',      down: '스피드' },
  { name: '장난기',     up: '방어',      down: '특수공격' },
  { name: '촐랑대는',   up: '방어',      down: '특수공격' },
  { name: '성급한',     up: '스피드',    down: '방어' },
  { name: '서두른',     up: '스피드',    down: '공격' },
  { name: '진지한',     up: null,        down: null },
  { name: '기쁜',       up: '스피드',    down: '특수공격' },
  { name: '덜렁대는',   up: '스피드',    down: '특수방어' },
  { name: '냉정한',     up: '특수공격',  down: '공격' },
  { name: '온화한',     up: '특수공격',  down: '방어' },
  { name: '조용한',     up: '특수공격',  down: '스피드' },
  { name: '솔직한',     up: null,        down: null },
  { name: '건방진',     up: '특수공격',  down: '특수방어' },
  { name: '차분한',     up: '특수방어',  down: '공격' },
  { name: '온후한',     up: '특수방어',  down: '방어' },
  { name: '신중한',     up: '특수방어',  down: '특수공격' },
  { name: '주의깊은',   up: '특수방어',  down: '스피드' },
  { name: '이상한',     up: null,        down: null },
]
const NEUTRAL_NATURE = { up: null, down: null }
const STAT_KEYS = ['HP', '공격', '방어', '특수공격', '특수방어', '스피드']

// Same formula as PokemonStats.jsx
function calcStat(base, iv, ev, key, nature = NEUTRAL_NATURE, level = 1) {
  const evBonus = Math.floor((ev || 0) / 4)
  if (key === 'HP') return Math.floor((2 * base + iv + evBonus) * level / 100) + level + 10
  let v = Math.floor((2 * base + iv + evBonus) * level / 100) + 5
  if (nature?.up === key)   v = Math.floor(v * 1.1)
  if (nature?.down === key) v = Math.floor(v * 0.9)
  return v
}

// Move status effect (null if none)
function getMoveStatusEffect(moveName) {
  return MOVE_META[moveName]?.statusEffect ?? null
}

// 공식 포켓몬 스탯 단계 배율 (-6 ~ +6)
function getStageMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, stage))
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s)
}

// 공식 포켓몬 명중률/회피율 단계 배율 (-6 ~ +6)
// +N → (3+N)/3, -N → 3/(3+N)
function getAccEvaMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, stage))
  return s >= 0 ? (3 + s) / 3 : 3 / (3 - s)
}

// 스탯 단계가 적용된 실효 스탯
function getEffectiveStat(battler, statName) {
  const base = battler.stats[statName] ?? 0
  const stage = battler.stages?.[statName] ?? 0
  return Math.max(1, Math.floor(base * getStageMultiplier(stage)))
}

// 날씨에 따른 기술 위력 보정 배율
function getWeatherModifier(moveType, weather) {
  if (weather === 'sunny_day') {
    if (moveType === '불꽃') return 1.5
    if (moveType === '물')   return 0.5
  }
  if (weather === 'rain_dance') {
    if (moveType === '물')   return 1.5
    if (moveType === '불꽃') return 0.5
  }
  return 1
}

// 스탯 단계 변화 적용 (불변성 유지)
function applyStatChanges(battler, changes, name) {
  let b = { ...battler, stages: { ...battler.stages } }
  const logs = []
  for (const [stat, delta] of Object.entries(changes)) {
    const old = b.stages[stat] ?? 0
    if ((delta > 0 && old >= 6) || (delta < 0 && old <= -6)) {
      logs.push(`${name}의 ${stat}은(는) 더 이상 ${delta > 0 ? '올라가' : '내려가'}지 않는다!`)
      continue
    }
    b.stages[stat] = Math.max(-6, Math.min(6, old + delta))
    const adverb = Math.abs(delta) >= 2 ? '크게 ' : ''
    const verb = delta > 0 ? '올라갔다!' : '떨어졌다!'
    logs.push(`${name}의 ${stat}이(가) ${adverb}${verb}`)
  }
  return { battler: b, logs }
}

// 지닌 도구의 기술 위력 보정 (7세대 기준). 고정 대미지 기술에는 적용하지 않는다
export function heldItemPowerMod(itemId, move) {
  if (!itemId || !move) return 1
  if (itemId === 'tool_lifejewel') return 1.3
  if (itemId === 'tool_wiseglasses' && move.category === '특수') return 1.1
  if (itemId === 'tool_spelltag' && move.type === '고스트') return 1.2
  if (itemId === 'tool_poisonbarb' && move.type === '독') return 1.2
  return 1
}

// 먹다남은음식: 턴이 끝날 때 최대 HP의 1/16 회복. 회복할 것이 없으면 null
function leftoversHeal(battler) {
  if (battler.heldItem !== 'tool_leftovers' || battler.hp <= 0 || battler.hp >= battler.maxHP) return null
  const heal = Math.max(1, Math.floor(battler.maxHP / 16))
  return { ...battler, hp: Math.min(battler.maxHP, battler.hp + heal) }
}

const INITIAL_STAGES = { '공격': 0, '방어': 0, '특수공격': 0, '특수방어': 0, '스피드': 0, '명중률': 0, '회피율': 0 }

// 대미지 공식의 유일한 정의. 상성·보정을 곱하기 전의 값(내림 전)을 돌려준다
// (2×level/5+2) × power × atk/def / 50 + 2 — 본가 포켓몬 대미지 공식 간소화 버전, 레벨이 높을수록 세다
// 내림·최소 1 처리는 부르는 쪽마다 시점이 달라서(아래 calcDamage, 턴 처리의 공격) 여기서 하지 않는다
function rawDamage(level, power, atkStat, defStat) {
  const levelFactor = Math.floor(2 * level / 5) + 2
  return levelFactor * power * atkStat / defStat / 50 + 2
}

// Damage = floor(rawDamage × typeEffect), 최소 1
export function calcDamage(movePower, atkStat, defStat, moveType, defenderTypes, level = 1) {
  if (!movePower) return 0
  const typeEff = getTypeEffectiveness(moveType, defenderTypes)
  return Math.max(1, Math.floor(rawDamage(level, movePower, atkStat, defStat) * typeEff))
}

// HP damage from burn/poison at turn start
function calcStatusDamage(status, maxHP) {
  if (status === 'burn')   return Math.max(1, Math.floor(maxHP / 16))
  if (status === 'poison') return Math.max(1, Math.floor(maxHP / 8))
  return 0
}

// Returns { prevented, newTurns, cleared }. rng: 0 이상 1 미만 난수 함수
function checkStatusAction(status, statusTurns, rng) {
  if (!status) return { prevented: false, newTurns: statusTurns, cleared: false }
  if (status === 'paralysis') {
    return { prevented: rng() < 0.25, newTurns: statusTurns, cleared: false }
  }
  if (status === 'sleep') {
    if (statusTurns <= 0) return { prevented: false, newTurns: 0, cleared: true }
    return { prevented: true, newTurns: statusTurns - 1, cleared: false }
  }
  if (status === 'freeze') {
    const thaw = rng() < 0.2
    return { prevented: !thaw, newTurns: 0, cleared: thaw }
  }
  return { prevented: false, newTurns: statusTurns, cleared: false }
}

// Build wild pokemon battler object
export function buildWildBattler(speciesId, level) {
  const pokemon = getPokemon(speciesId)
  if (!pokemon) return null
  const bs = pokemon.baseStats
  const ivs = {}
  STAT_KEYS.forEach(k => { ivs[k] = Math.floor(Math.random() * 16) })
  const maxHP = calcStat(bs.HP, ivs.HP, 0, 'HP', NEUTRAL_NATURE, level)
  const stats = {}
  STAT_KEYS.filter(k => k !== 'HP').forEach(k => {
    stats[k] = calcStat(bs[k], ivs[k], 0, k, NEUTRAL_NATURE, level)
  })
  const learnedMoves = getMovesUpToLevel(pokemon, level).map(m => m.name)
  // Take up to last 4 moves (most recently learned are more powerful)
  const moves = learnedMoves.slice(-4)
  if (!moves.length && pokemon.baseMoves?.length) moves.push(pokemon.baseMoves[0].name)
  // 최소 1개 기술 보장 — baseMoves도 비어있으면 몸통박치기 할당
  if (!moves.length) moves.push('몸통박치기')
  const nature = NATURES[Math.floor(Math.random() * NATURES.length)]
  const ability = pokemon.abilities?.[Math.floor(Math.random() * (pokemon.abilities?.length || 1))]
  return {
    speciesId,
    level,
    dexNum: pokemon.dexNum,
    types: pokemon.types,
    maxHP,
    hp: maxHP,
    stats,
    moves,
    ivs,
    natureName: nature.name,
    abilityName: ability?.name ?? null,
    learnedPool: [...learnedMoves],
    stages: { ...INITIAL_STAGES },
    status: null,
    statusTurns: 0,
  }
}

// Build player battler object (resolves moves to full data)
// focusXp: 레벨 경험치 / heldItem: 지닌 도구 id (없으면 null)
export function buildPlayerBattler(petSpeciesId, petStats, petEVs, focusXp, shopItems, heldItem = null) {
  const pokemon = getPokemon(petSpeciesId)
  if (!pokemon || !petStats) return null
  const playerLevel = Math.max(1, calcLevel(focusXp || 0))
  const bs = pokemon.baseStats
  const ivs = petStats.ivs || {}
  const evs = petEVs || {}
  const nature = NATURES.find(n => n.name === petStats.natureName) || NEUTRAL_NATURE
  const maxHP = calcStat(bs.HP, ivs.HP || 0, evs.HP || 0, 'HP', nature, playerLevel)
  const stats = {}
  STAT_KEYS.filter(k => k !== 'HP').forEach(k => {
    stats[k] = calcStat(bs[k], ivs[k] || 0, evs[k] || 0, k, nature, playerLevel)
  })
  // Resolve move names → full move data (power, type, category)
  // resolveMove: 현재 종 → 전체 DB → TM 순서로 검색 (진화 전 기술도 찾을 수 있도록)
  const resolvedMoves = (petStats.moves || []).map(name => {
    const found = resolveMove(name, pokemon, shopItems)
    if (found) return found
    return null
  }).filter(Boolean)
  // resolvedMoves가 비어있으면 배틀 불가
  if (!resolvedMoves.length) return null
  // Build movePP: use stored value or initialize to max (음수 방지)
  const movePP = {}
  resolvedMoves.forEach(m => {
    const stored = petStats.movePP?.[m.name]
    movePP[m.name] = stored != null ? Math.max(0, stored) : getMaxPP(m.name)
  })
  // Use stored currentHP or full HP (음수/0 방지)
  const hp = petStats.currentHP != null ? Math.max(0, Math.min(petStats.currentHP, maxHP)) : maxHP
  return {
    speciesId: petSpeciesId,
    dexNum: pokemon.dexNum,
    types: pokemon.types,
    level: playerLevel,
    maxHP,
    hp,
    stats,
    resolvedMoves,
    movePP,
    abilityName: petStats.abilityName ?? null,
    heldItem,
    stages: { ...INITIAL_STAGES },
    status: null,
    statusTurns: 0,
  }
}

// ── 한 턴 처리 도구 ──────────────────────────────────────────────
// processTurn·processWildOnlyTurn 이 같이 쓴다.
// 턴 상태 t 는 createTurn 이 만들고, 두 포켓몬은 'player'·'wild' 로 가리킨다(t.player, t.wild).
// 도구는 t 의 battler·날씨를 새 객체로 바꾸고(입력 battle 은 건드리지 않는다) 장면을 t.frames 에 쌓는다.
// 난수는 모두 t.rng 로 부른다. 부르는 순서와 횟수가 결과를 정하므로 호출 순서를 바꾸지 않는다.

const PREVENTED_MSG = { sleep: '잠들어 있다!', paralysis: '마비로 움직일 수 없다!', freeze: '꽁꽁 얼어 있다!' }
const WEATHER_ALREADY = { sunny_day: '날씨는 이미 맑다!', rain_dance: '이미 비가 내리고 있다!' }
const opponent = (side) => (side === 'player' ? 'wild' : 'player')

// 턴 상태 만들기
// 장면(frame) = { addLog, wild, player, weather, weatherTurns, phase, result }
//   addLog: 문자열이면 로그 창에 한 줄, null 이면 HP 바만 갱신
//   phase: 'animating' | 'selecting' | 'ended'
function createTurn(battle, rng) {
  const t = {
    rng,
    player: { ...battle.player },
    wild: { ...battle.wild },
    weather: battle.weather ?? null,
    weatherTurns: battle.weatherTurns ?? 0,
    frames: [],
    pointsGained: 0,
    species: { player: getPokemon(battle.player.speciesId), wild: getPokemon(battle.wild.speciesId) },
  }
  t.snap = (addLog, phase = 'animating', result = null) => {
    t.frames.push({ addLog, wild: { ...t.wild }, player: { ...t.player }, weather: t.weather, weatherTurns: t.weatherTurns, phase, result })
  }
  return t
}

// 문구에 쓰는 이름. 야생 쪽은 앞에 "야생" 을 붙인다
function nameOf(t, side) {
  return side === 'player' ? t.species.player.speciesName : `야생 ${t.species.wild.speciesName}`
}

// 야생이 이번 턴에 쓸 기술 (턴 처음에 한 번 고른다, 난수 1회). 종 데이터에 없는 기술이면 data 가 비어 있다
function pickWildMove(t) {
  const moves = t.wild.moves ?? []
  const name = moves.length > 0 ? moves[Math.floor(t.rng() * moves.length)] : null
  const data = name ? t.species.wild.baseMoves?.find(m => m.name === name) : null
  return { name, data }
}

// 상태이상 확인: 풀렸으면 문구를 남기고, 이번 턴에 못 움직이면 문구를 남기고 false
// preventedPhase: 못 움직였을 때 장면의 phase (볼 실패 턴은 여기서 바로 고르기로 돌아간다)
function canAct(t, side, preventedPhase = 'animating') {
  const check = checkStatusAction(t[side].status, t[side].statusTurns, t.rng)
  if (check.cleared) {
    const old = t[side].status
    t[side] = { ...t[side], status: null, statusTurns: 0 }
    t.snap(`${nameOf(t, side)}의 ${STATUS_KO[old]}이(가) 풀렸다!`)
  } else {
    t[side] = { ...t[side], statusTurns: check.newTurns }
  }
  if (check.prevented) {
    t.snap(`${nameOf(t, side)}은(는) ${PREVENTED_MSG[t[side].status] || '움직일 수 없다!'}`, preventedPhase)
    return false
  }
  return true
}

// 명중 판정. 명중률이 null 인 기술은 반드시 맞고 난수를 부르지 않는다
// 최종 명중률 = 기술 명중률 × (공격 쪽 명중률 단계 배율 / 방어 쪽 회피율 단계 배율)
function rollHit(t, side, moveName) {
  const moveAcc = MOVE_META[moveName]?.accuracy ?? 100
  if (moveAcc === null) return true
  const accMul = getAccEvaMultiplier(t[side].stages?.['명중률'] ?? 0)
  const evaMul = getAccEvaMultiplier(t[opponent(side)].stages?.['회피율'] ?? 0)
  const finalAcc = moveAcc * (accMul / evaMul)
  const missed = t.rng() * 100 >= finalAcc
  return !missed
}

// 상태이상 걸기: 효과가 있고 상대에게 상태이상이 없을 때 확률로 건다(잠듦은 1~3턴). 걸었으면 true
// 난수는 확률 판정 1회 + 잠듦이면 턴 수 1회
function tryInflictStatus(t, target, eff) {
  if (!eff || t[target].status) return false
  if (!(t.rng() < eff.chance)) return false
  t[target] = { ...t[target], status: eff.type, statusTurns: eff.type === 'sleep' ? 1 + Math.floor(t.rng() * 3) : 0 }
  t.snap(`${nameOf(t, target)}은(는) ${STATUS_KO[eff.type]}에 걸렸다!`)
  return true
}

// 쓰러졌는지 확인. 쓰러졌으면 끝 장면을 남기고 true. 야생이 쓰러지면 승리 보상을 정한다
function fainted(t, side) {
  if (t[side].hp <= 0) {
    if (side === 'wild') {
      t.snap(`${nameOf(t, 'wild')}이(가) 쓰러졌다!`, 'ended', 'win')
      t.pointsGained = battleReward(t.wild.level)
    } else {
      t.snap(`${nameOf(t, 'player')}이(가) 쓰러졌다...`, 'ended', 'lose')
    }
    return true
  }
  return false
}

// 공격·방어 실효 스탯: 물리는 공격/방어, 특수는 특수공격/특수방어
function attackDefense(attacker, defender, category) {
  return category === '물리'
    ? [getEffectiveStat(attacker, '공격'), getEffectiveStat(defender, '방어')]
    : [getEffectiveStat(attacker, '특수공격'), getEffectiveStat(defender, '특수방어')]
}

// 플레이어 공격 대미지
// 1. 상성까지 곱해 한 번 내림  2. 날씨 × 특성(태양의힘) × 지닌 도구 보정  3. 다시 내림, 최소 1
function playerDamage(attacker, defender, move, typeEff, weather) {
  const [atkStat, defStat] = attackDefense(attacker, defender, move.category)
  const weatherMod = getWeatherModifier(move.type, weather)
  // 태양의힘: 맑은 날씨에 특수기술 위력 1.5배
  const abilityMod = (attacker.abilityName === '태양의힘' && weather === 'sunny_day' && move.category === '특수') ? 1.5 : 1
  const baseDmg = Math.floor(rawDamage(attacker.level, move.power, atkStat, defStat) * typeEff)
  const itemMod = heldItemPowerMod(attacker.heldItem, move)
  return Math.max(1, Math.floor(baseDmg * weatherMod * abilityMod * itemMod))
}

// 야생 공격 대미지: 상성 × 날씨를 곱하고 한 번만 내림, 최소 1 (야생은 특성·지닌 도구 보정이 없다)
function wildDamage(attacker, defender, move, typeEff, weather) {
  const [atkStat, defStat] = attackDefense(attacker, defender, move.category)
  const weatherMod = getWeatherModifier(move.type, weather)
  return Math.max(1, Math.floor(rawDamage(attacker.level, move.power, atkStat, defStat) * typeEff * weatherMod))
}

// 플레이어 지닌 도구의 공격 뒤 효과 (대미지 직후, 부가 상태이상보다 먼저)
function playerItemAfterAttack(t, dealt) {
  // 조개껍질방울: 준 대미지의 1/8 회복
  if (t.player.heldItem === 'tool_shellbell' && dealt > 0 && t.player.hp < t.player.maxHP) {
    const heal = Math.max(1, Math.floor(dealt / 8))
    t.player = { ...t.player, hp: Math.min(t.player.maxHP, t.player.hp + heal) }
    t.snap(`${nameOf(t, 'player')}은(는) 조개껍질방울로 HP를 조금 회복했다!`)
  }
  // 생명의구슬: 공격할 때마다 최대 HP의 1/10 감소
  if (t.player.heldItem === 'tool_lifejewel') {
    const recoil = Math.max(1, Math.floor(t.player.maxHP / 10))
    t.player = { ...t.player, hp: Math.max(0, t.player.hp - recoil) }
    t.snap(`${nameOf(t, 'player')}은(는) 생명의구슬에 생명력을 조금 빼앗겼다!`)
  }
}

// 위력이 있는 공격 기술
// 1. 상성 확인(무효면 문구만 남기고 false)  2. 대미지와 상성 문구  3. (플레이어) 지닌 도구  4. 부가 상태이상
// immunePhase: 상성 무효 장면의 phase (볼 실패 턴은 'selecting')
function applyDamagingMove(t, side, moveName, move, immunePhase = 'animating') {
  const target = opponent(side)
  const typeEff = getTypeEffectiveness(move.type, t.species[target].types)
  if (typeEff === 0) {
    t.snap('효과가 없다!', immunePhase)
    return false
  }
  const calc = side === 'player' ? playerDamage : wildDamage
  const dmg = calc(t[side], t[target], move, typeEff, t.weather)
  if (typeEff > 1)      t.snap('효과는 굉장했다!')
  else if (typeEff < 1) t.snap('효과가 별로인 것 같다...')
  const dealt = Math.min(t[target].hp, dmg)
  t[target] = { ...t[target], hp: Math.max(0, t[target].hp - dmg) }
  t.snap(null)
  if (side === 'player') playerItemAfterAttack(t, dealt)
  tryInflictStatus(t, target, getMoveStatusEffect(moveName))
  return true
}

// 변화 기술: 1) 날씨 2) special 3) 능력치 단계 4) 상태이상 순으로 본다. 배틀이 끝나면 true
function applyStatusMove(t, side, moveName) {
  const meta = MOVE_META[moveName]
  const special = meta?.special
  const target = opponent(side)

  // 1) 날씨 기술: 5턴
  if (special === 'sunny_day' || special === 'rain_dance') {
    if (t.weather === special) {
      t.snap(WEATHER_ALREADY[special])
    } else {
      t.weather = special
      t.weatherTurns = 5
      t.snap(WEATHER_KO[special].start)
    }
    return false
  }
  // 2) special 기술
  if (special === 'roar') {
    // 플레이어가 쓰면 야생이 도망쳐 배틀이 끝난다. 야생이 쓰면 효과가 없다
    if (side === 'player') {
      t.snap('야생 포켓몬이 도망쳤다!', 'ended', 'flee_roar')
      return true
    }
    t.snap('하지만 효과가 없는 것 같다...')
    return false
  }
  if (special === 'synthesis') {
    // 플레이어: 날씨에 따라 맑음 2/3, 비 1/4, 평상시 1/2 회복 / 야생: 날씨와 상관없이 1/2
    const healFraction = side === 'wild' ? 0.5 : t.weather === 'sunny_day' ? 2/3 : t.weather ? 0.25 : 0.5
    const heal = Math.floor(t[side].maxHP * healFraction)
    t[side] = { ...t[side], hp: Math.min(t[side].maxHP, t[side].hp + heal) }
    t.snap(`${nameOf(t, side)}은(는) HP를 회복했다!`)
    return false
  }
  if (special === 'rest') {
    t[side] = { ...t[side], hp: t[side].maxHP, status: 'sleep', statusTurns: 2 }
    t.snap(`${nameOf(t, side)}은(는) 잠들어서 HP를 회복했다!`)
    return false
  }
  if (special === 'pain_split') {
    // 두 HP 의 평균으로 맞춘다. 쓰러짐은 상대 → 자신 순으로 본다
    const avg = Math.floor((t.player.hp + t.wild.hp) / 2)
    t.player = { ...t.player, hp: Math.max(0, Math.min(t.player.maxHP, avg)) }
    t.wild = { ...t.wild, hp: Math.max(0, Math.min(t.wild.maxHP, avg)) }
    t.snap('서로의 HP를 나누었다!')
    return fainted(t, target) || fainted(t, side)
  }
  // 3) 능력치 단계 기술
  if (meta?.statEffect) {
    const se = meta.statEffect
    const who = se.target === 'self' ? side : target
    const { battler, logs } = applyStatChanges(t[who], se.changes, nameOf(t, who))
    t[who] = battler
    for (const log of logs) t.snap(log)
    return false
  }
  // 4) 상태이상 기술
  const eff = getMoveStatusEffect(moveName)
  if (!eff) {
    t.snap('하지만 효과가 없는 것 같다...')
  } else if (!tryInflictStatus(t, target, eff)) {
    // 이미 상태이상이 있거나 확률에서 빗나감
    t.snap(`${nameOf(t, target)}에게는 통하지 않았다!`)
  }
  return false
}

// 명중한 기술의 효과: 고정 대미지 / 공격 / 변화. 배틀이 여기서 끝나면 true (울부짖기, 아픔나누기로 쓰러짐)
function applyMove(t, side, moveName, move) {
  if (move.category !== '변화' && move.fixedDamage) {
    // 고정 대미지(용의분노 40, 나이트헤드 = 레벨): 상성·날씨 무시
    const target = opponent(side)
    const fixedDmg = move.fixedDamage === 'level' ? t[side].level : move.fixedDamage
    t[target] = { ...t[target], hp: Math.max(0, t[target].hp - fixedDmg) }
    t.snap(null)
  } else if (move.category !== '변화' && move.power) {
    applyDamagingMove(t, side, moveName, move)
  } else if (move.category === '변화') {
    return applyStatusMove(t, side, moveName)
  }
  return false
}

// 플레이어 행동: 상태이상 확인 → 기술·PP 확인 → PP 1 소모 → 명중 → 효과 → 쓰러짐. 배틀이 끝나면 true
function playerAction(t, moveName) {
  if (!canAct(t, 'player')) return false
  const move = t.player.resolvedMoves?.find(m => m.name === moveName)
  const currentPP = t.player.movePP?.[moveName] ?? getMaxPP(moveName)
  if (!move || currentPP <= 0) {
    t.snap(currentPP <= 0 ? `${moveName}의 PP가 바닥났다!` : '기술을 사용할 수 없다!')
    return false
  }
  t.player = { ...t.player, movePP: { ...t.player.movePP, [moveName]: currentPP - 1 } }
  t.snap(`${nameOf(t, 'player')}은(는) ${moveName}을(를) 사용했다!`)
  if (!rollHit(t, 'player', moveName)) {
    t.snap('빗나갔다!')
    return false
  }
  if (applyMove(t, 'player', moveName, move)) return true
  // 생명의구슬 반동으로 플레이어가 쓰러질 수도 있다
  return fainted(t, 'wild') || fainted(t, 'player')
}

// 야생 행동: (기술 데이터가 없으면 쉰다) 상태이상 확인 → 명중 → 효과 → 쓰러짐. 배틀이 끝나면 true
function wildAction(t, wildMove) {
  if (!wildMove.data) return false
  if (!canAct(t, 'wild')) return false
  t.snap(`${nameOf(t, 'wild')}은(는) ${wildMove.name}을(를) 사용했다!`)
  if (!rollHit(t, 'wild', wildMove.name)) {
    t.snap('빗나갔다!')
    return false
  }
  if (applyMove(t, 'wild', wildMove.name, wildMove.data)) return true
  return fainted(t, 'player')
}

// 턴 끝 화상·독 피해. 쓰러지면 true
function statusDamage(t, side) {
  const b = t[side]
  if (b.status !== 'burn' && b.status !== 'poison') return false
  const dmg = calcStatusDamage(b.status, b.maxHP)
  t.snap(`${nameOf(t, side)}은(는) ${STATUS_KO[b.status]} 피해를 입었다!`)
  t[side] = { ...b, hp: Math.max(0, b.hp - dmg) }
  t.snap(null)
  return fainted(t, side)
}

// 턴 끝 처리
// 1. 화상·독 (wildStatusDamage 면 야생 먼저, 그다음 플레이어)  2. 먹다남은음식  3. 빗속준비  4. 태양의힘
// 5. 날씨 남은 턴 줄이기  6. 마지막 장면을 'selecting' 으로 (다음 기술 고르기)
// 누가 쓰러지면 그 자리에서 멈춘다(마지막 장면은 'ended' 그대로)
// wildStatusDamage: 볼 실패 턴은 야생 화상·독 피해를 주지 않는다
function endOfTurn(t, { wildStatusDamage }) {
  if (wildStatusDamage && statusDamage(t, 'wild')) return
  if (statusDamage(t, 'player')) return

  const fed = leftoversHeal(t.player)
  if (fed) {
    t.player = fed
    t.snap(`${nameOf(t, 'player')}은(는) 먹다남은음식으로 HP를 조금 회복했다!`)
  }
  // 빗속준비: 비 날씨에 매 턴 HP 1/16 회복
  if (t.weather === 'rain_dance' && t.player.abilityName === '빗속준비') {
    const heal = Math.max(1, Math.floor(t.player.maxHP / 16))
    t.player = { ...t.player, hp: Math.min(t.player.maxHP, t.player.hp + heal) }
    t.snap(`${nameOf(t, 'player')}은(는) 빗속준비로 체력을 회복했다!`)
  }
  // 태양의힘: 맑은 날씨에 매 턴 HP 1/8 소모
  if (t.weather === 'sunny_day' && t.player.abilityName === '태양의힘') {
    const drain = Math.max(1, Math.floor(t.player.maxHP / 8))
    t.player = { ...t.player, hp: Math.max(0, t.player.hp - drain) }
    t.snap(`${nameOf(t, 'player')}은(는) 태양의힘으로 체력을 소모했다!`)
    t.snap(null)
    if (fainted(t, 'player')) return
  }

  if (t.weather) {
    t.weatherTurns--
    if (t.weatherTurns <= 0) {
      const msg = WEATHER_KO[t.weather]?.end ?? '날씨가 원래대로 돌아왔다.'
      t.weather = null
      t.weatherTurns = 0
      t.snap(msg)
    }
  }

  if (t.frames.length > 0) {
    t.frames[t.frames.length - 1] = { ...t.frames[t.frames.length - 1], phase: 'selecting' }
  }
}

// 한 턴 전체를 처리해 장면 배열을 돌려준다. Returns { frames, pointsGained }
// 순서: 야생 기술 고르기 → 스피드로 선공 결정(같으면 플레이어) → 두 행동 → 턴 끝 처리
// rng: 난수 함수(기본 Math.random). 테스트에서 시드 고정 난수를 넘길 수 있다
export function processTurn(battle, playerMoveName, rng = Math.random) {
  const { wild, player } = battle
  if (!wild || !player) return { frames: [], pointsGained: 0 }
  const t = createTurn(battle, rng)
  const result = () => ({ frames: t.frames, pointsGained: t.pointsGained })

  // 야생 기술은 턴 처음에 정한다 (장면마다 같은 기술이 보이게)
  const wildMove = pickWildMove(t)

  // 엽록소: 맑은 날씨에 스피드 2배
  const playerSpd = getEffectiveStat(t.player, '스피드') * (t.weather === 'sunny_day' && t.player.abilityName === '엽록소' ? 2 : 1)
  const wildSpd   = getEffectiveStat(t.wild,   '스피드') * (t.weather === 'sunny_day' && t.wild.abilityName   === '엽록소' ? 2 : 1)
  const order = playerSpd >= wildSpd ? ['player', 'wild'] : ['wild', 'player']

  for (const side of order) {
    const ended = side === 'player' ? playerAction(t, playerMoveName) : wildAction(t, wildMove)
    if (ended) return result()
  }
  endOfTurn(t, { wildStatusDamage: true })
  return result()
}

// ── Catch rate calculation ──────────────────────────────────────
// 본가 포켓몬 포획 공식 간소화 버전
// modifiedCatchRate = (3×MaxHP - 2×HP) / (3×MaxHP) × catchRate × ballBonus × statusBonus
// 최종 확률 = min(modifiedCatchRate / 255, 1)  (흔들림 4회 판정 생략 — 단판)
// 최소 5%, 최대 95%
const STATUS_CATCH_BONUS = { sleep: 2.5, freeze: 2.5, paralysis: 1.5, poison: 1.5, burn: 1.5 }
export function calcCatchRate(wildHP, wildMaxHP, ballModifier, speciesCatchRate = 100, wildStatus = null) {
  const hpFactor = (3 * wildMaxHP - 2 * wildHP) / (3 * wildMaxHP)
  const statusBonus = STATUS_CATCH_BONUS[wildStatus] ?? 1
  const modified = Math.floor(hpFactor * speciesCatchRate * ballModifier) * statusBonus
  const rate = Math.min(modified / 255, 1)
  return Math.min(0.95, Math.max(0.05, rate))
}

// ── Wild-only turn (after failed ball throw) ────────────────────
// 볼 투척 실패 시 야생 포켓몬만 반격하는 턴 (플레이어 공격 없음). rng 는 processTurn 과 같다
// 일반 턴의 야생 행동보다 간단하다: 공격 기술은 같지만, 변화 기술은 상태이상만 걸고
// 고정 대미지 기술은 아무 일도 없다. 턴 끝 처리에 야생 화상·독 피해가 없다.
// 못 움직임·빗나감·상성 무효 장면은 바로 'selecting'(볼 연출 뒤 다시 고르기)이다.
export function processWildOnlyTurn(battle, rng = Math.random) {
  const t = createTurn(battle, rng)
  if (!t.species.wild || !t.species.player) return { frames: [], pointsGained: 0 }
  const result = () => ({ frames: t.frames, pointsGained: 0 })
  const wildMove = pickWildMove(t)
  if (!wildMove.data) {
    t.snap(null, 'selecting')
    return result()
  }

  if (!canAct(t, 'wild', 'selecting')) return result()
  t.snap(`${nameOf(t, 'wild')}은(는) ${wildMove.name}을(를) 사용했다!`)
  if (!rollHit(t, 'wild', wildMove.name)) {
    t.snap('빗나갔다!', 'selecting')
    return result()
  }

  const move = wildMove.data
  if (move.category !== '변화' && move.power) {
    const hit = applyDamagingMove(t, 'wild', wildMove.name, move, 'selecting')
    if (hit && fainted(t, 'player')) return result()
  } else if (move.category === '변화') {
    tryInflictStatus(t, 'player', getMoveStatusEffect(wildMove.name))
  }

  endOfTurn(t, { wildStatusDamage: false })
  return result()
}
