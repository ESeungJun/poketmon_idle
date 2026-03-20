import { getPokemon, MOVE_META, getMovesUpToLevel, calcLevel, getMaxPP, resolveMove } from './pokemon'
import { getTypeEffectiveness } from './typeChart'

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

const INITIAL_STAGES = { '공격': 0, '방어': 0, '특수공격': 0, '특수방어': 0, '스피드': 0, '명중률': 0, '회피율': 0 }

// Damage = power × (atkStat / defStat) × typeEffect × 0.5
export function calcDamage(movePower, atkStat, defStat, moveType, defenderTypes) {
  if (!movePower) return 0
  const typeEff = getTypeEffectiveness(moveType, defenderTypes)
  return Math.max(1, Math.floor(movePower * (atkStat / defStat) * typeEff * 0.5))
}

// HP damage from burn/poison at turn start
function calcStatusDamage(status, maxHP) {
  if (status === 'burn')   return Math.max(1, Math.floor(maxHP / 16))
  if (status === 'poison') return Math.max(1, Math.floor(maxHP / 8))
  return 0
}

// Returns { prevented, newTurns, cleared }
function checkStatusAction(status, statusTurns) {
  if (!status) return { prevented: false, newTurns: statusTurns, cleared: false }
  if (status === 'paralysis') {
    return { prevented: Math.random() < 0.25, newTurns: statusTurns, cleared: false }
  }
  if (status === 'sleep') {
    if (statusTurns <= 0) return { prevented: false, newTurns: 0, cleared: true }
    return { prevented: true, newTurns: statusTurns - 1, cleared: false }
  }
  if (status === 'freeze') {
    const thaw = Math.random() < 0.2
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
  if (!moves.length && pokemon.baseMoves[0]) moves.push(pokemon.baseMoves[0].name)
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
export function buildPlayerBattler(petSpeciesId, petStats, petEVs, totalPointsEarned, shopItems) {
  const pokemon = getPokemon(petSpeciesId)
  if (!pokemon || !petStats) return null
  const playerLevel = Math.max(1, calcLevel(totalPointsEarned || 0))
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
  // Build movePP: use stored value or initialize to max
  const movePP = {}
  resolvedMoves.forEach(m => {
    const stored = petStats.movePP?.[m.name]
    movePP[m.name] = stored != null ? stored : getMaxPP(m.name)
  })
  // Use stored currentHP or full HP
  const hp = petStats.currentHP != null ? Math.min(petStats.currentHP, maxHP) : maxHP
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
    stages: { ...INITIAL_STAGES },
    status: null,
    statusTurns: 0,
  }
}

// Execute one full turn, returning animation frames instead of a single final state.
// Each frame = { addLog, wild, player, weather, weatherTurns, phase, result }
//   addLog: string → append to log box; null → silent HP-bar update only
//   phase: 'animating' | 'selecting' | 'ended'
// Speed determines who attacks first (ties go to player).
// Returns { frames, pointsGained }
export function processTurn(battle, playerMoveName) {
  const { wild, player } = battle
  if (!wild || !player) return { frames: [], pointsGained: 0 }
  const myPokemon   = getPokemon(player.speciesId)
  const wildPokemon = getPokemon(wild.speciesId)

  let curWild         = { ...wild }
  let curPlayer       = { ...player }
  let curWeather      = battle.weather ?? null
  let curWeatherTurns = battle.weatherTurns ?? 0
  const frames        = []
  let pointsGained    = 0

  // Pre-select wild's move for the whole turn so it's consistent across frames
  const wildMoveName = wild.moves.length > 0
    ? wild.moves[Math.floor(Math.random() * wild.moves.length)]
    : null
  const wildMoveData = wildMoveName ? wildPokemon.baseMoves.find(m => m.name === wildMoveName) : null

  // Snapshot current state as one frame
  const snap = (addLog, phase = 'animating', result = null) => {
    frames.push({ addLog, wild: { ...curWild }, player: { ...curPlayer }, weather: curWeather, weatherTurns: curWeatherTurns, phase, result })
  }

  // ── Player action ──────────────────────────────────────────────
  const processPlayerAction = () => {
    const pCheck = checkStatusAction(curPlayer.status, curPlayer.statusTurns)
    if (pCheck.cleared) {
      const old = curPlayer.status
      curPlayer = { ...curPlayer, status: null, statusTurns: 0 }
      snap(`${myPokemon.speciesName}의 ${STATUS_KO[old]}이(가) 풀렸다!`)
    } else {
      curPlayer = { ...curPlayer, statusTurns: pCheck.newTurns }
    }

    if (pCheck.prevented) {
      const msg = { sleep: '잠들어 있다!', paralysis: '마비로 움직일 수 없다!', freeze: '꽁꽁 얼어 있다!' }
      snap(`${myPokemon.speciesName}은(는) ${msg[curPlayer.status] || '움직일 수 없다!'}`)
      return false
    }

    const moveData  = player.resolvedMoves?.find(m => m.name === playerMoveName)
    const currentPP = curPlayer.movePP?.[playerMoveName] ?? getMaxPP(playerMoveName)
    if (!moveData || currentPP <= 0) {
      snap(currentPP <= 0 ? `${playerMoveName}의 PP가 바닥났다!` : '기술을 사용할 수 없다!')
      return false
    }

    curPlayer = { ...curPlayer, movePP: { ...curPlayer.movePP, [playerMoveName]: currentPP - 1 } }
    snap(`${myPokemon.speciesName}은(는) ${playerMoveName}을(를) 사용했다!`)

    const moveMeta = MOVE_META[playerMoveName]
    const moveAcc = moveMeta?.accuracy ?? 100
    if (moveAcc !== null) {
      const accMul = getAccEvaMultiplier(curPlayer.stages?.['명중률'] ?? 0)
      const evaMul = getAccEvaMultiplier(curWild.stages?.['회피율'] ?? 0)
      const finalAcc = moveAcc * (accMul / evaMul)
      if (Math.random() * 100 >= finalAcc) {
        snap('빗나갔다!')
        return false
      }
    }

    if (moveData.category !== '변화' && moveData.fixedDamage) {
      const fixedDmg = moveData.fixedDamage === 'level' ? curPlayer.level : moveData.fixedDamage
      curWild = { ...curWild, hp: Math.max(0, curWild.hp - fixedDmg) }
      snap(null)
    } else if (moveData.category !== '변화' && moveData.power) {
      const atkStat = moveData.category === '물리' ? getEffectiveStat(curPlayer, '공격') : getEffectiveStat(curPlayer, '특수공격')
      const defStat = moveData.category === '물리' ? getEffectiveStat(curWild, '방어')   : getEffectiveStat(curWild, '특수방어')
      const typeEff = getTypeEffectiveness(moveData.type, wildPokemon.types)
      if (typeEff === 0) {
        snap('효과가 없다!')
      } else {
        const weatherMod = getWeatherModifier(moveData.type, curWeather)
        // 태양의힘: 맑은 날씨에 특수기술 위력 1.5배
        const abilityMod = (curPlayer.abilityName === '태양의힘' && curWeather === 'sunny_day' && moveData.category === '특수') ? 1.5 : 1
        const dmg = Math.max(1, Math.floor(moveData.power * (atkStat / defStat) * typeEff * weatherMod * abilityMod * 0.5))
        if (typeEff > 1)      snap('효과는 굉장했다!')
        else if (typeEff < 1) snap('효과가 별로인 것 같다...')
        curWild = { ...curWild, hp: Math.max(0, curWild.hp - dmg) }
        snap(null)
        const eff = getMoveStatusEffect(playerMoveName)
        if (eff && !curWild.status && Math.random() < eff.chance) {
          curWild = { ...curWild, status: eff.type, statusTurns: eff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0 }
          snap(`야생 ${wildPokemon.speciesName}은(는) ${STATUS_KO[eff.type]}에 걸렸다!`)
        }
      }
    } else if (moveData.category === '변화') {
      // 1) 날씨 기술
      if (moveMeta?.special === 'sunny_day') {
        if (curWeather === 'sunny_day') {
          snap('날씨는 이미 맑다!')
        } else {
          curWeather = 'sunny_day'
          curWeatherTurns = 5
          snap(WEATHER_KO.sunny_day.start)
        }
      } else if (moveMeta?.special === 'rain_dance') {
        if (curWeather === 'rain_dance') {
          snap('이미 비가 내리고 있다!')
        } else {
          curWeather = 'rain_dance'
          curWeatherTurns = 5
          snap(WEATHER_KO.rain_dance.start)
        }
      // 2) special 기술
      } else if (moveMeta?.special === 'roar') {
        snap('야생 포켓몬이 도망쳤다!', 'ended', 'flee_roar')
        return true
      } else if (moveMeta?.special === 'synthesis') {
        // 날씨에 따라 회복량 변동: 맑음 2/3, 비 1/4, 평상시 1/2
        const healFraction = curWeather === 'sunny_day' ? 2/3 : curWeather ? 0.25 : 0.5
        const heal = Math.floor(curPlayer.maxHP * healFraction)
        curPlayer = { ...curPlayer, hp: Math.min(curPlayer.maxHP, curPlayer.hp + heal) }
        snap(`${myPokemon.speciesName}은(는) HP를 회복했다!`)
      } else if (moveMeta?.special === 'rest') {
        curPlayer = { ...curPlayer, hp: curPlayer.maxHP, status: 'sleep', statusTurns: 2 }
        snap(`${myPokemon.speciesName}은(는) 잠들어서 HP를 회복했다!`)
      } else if (moveMeta?.special === 'pain_split') {
        const avg = Math.floor((curPlayer.hp + curWild.hp) / 2)
        curPlayer = { ...curPlayer, hp: Math.min(curPlayer.maxHP, avg) }
        curWild = { ...curWild, hp: Math.max(0, Math.min(curWild.maxHP, avg)) }
        snap('서로의 HP를 나누었다!')
        if (curWild.hp <= 0) {
          snap(`야생 ${wildPokemon.speciesName}이(가) 쓰러졌다!`, 'ended', 'win')
          pointsGained = 30
          return true
        }
        if (curPlayer.hp <= 0) {
          snap(`${myPokemon.speciesName}이(가) 쓰러졌다...`, 'ended', 'lose')
          return true
        }
      // 3) statEffect 기술
      } else if (moveMeta?.statEffect) {
        const se = moveMeta.statEffect
        const target = se.target === 'self' ? curPlayer : curWild
        const targetName = se.target === 'self' ? myPokemon.speciesName : `야생 ${wildPokemon.speciesName}`
        const { battler: updated, logs } = applyStatChanges(target, se.changes, targetName)
        if (se.target === 'self') curPlayer = updated; else curWild = updated
        for (const log of logs) snap(log)
      // 4) statusEffect 기술
      } else {
        const eff = getMoveStatusEffect(playerMoveName)
        if (eff && !curWild.status && Math.random() < eff.chance) {
          curWild = { ...curWild, status: eff.type, statusTurns: eff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0 }
          snap(`야생 ${wildPokemon.speciesName}은(는) ${STATUS_KO[eff.type]}에 걸렸다!`)
        } else if (!eff) {
          snap('하지만 효과가 없는 것 같다...')
        }
      }
    }

    if (curWild.hp <= 0) {
      snap(`야생 ${wildPokemon.speciesName}이(가) 쓰러졌다!`, 'ended', 'win')
      pointsGained = 30
      return true
    }
    return false
  }

  // ── Wild action ────────────────────────────────────────────────
  const processWildAction = () => {
    if (!wildMoveData) return false

    const wCheck = checkStatusAction(curWild.status, curWild.statusTurns)
    if (wCheck.cleared) {
      const old = curWild.status
      curWild = { ...curWild, status: null, statusTurns: 0 }
      snap(`야생 ${wildPokemon.speciesName}의 ${STATUS_KO[old]}이(가) 풀렸다!`)
    } else {
      curWild = { ...curWild, statusTurns: wCheck.newTurns }
    }

    if (wCheck.prevented) {
      const msg = { sleep: '잠들어 있다!', paralysis: '마비로 움직일 수 없다!', freeze: '꽁꽁 얼어 있다!' }
      snap(`야생 ${wildPokemon.speciesName}은(는) ${msg[curWild.status] || '움직일 수 없다!'}`)
      return false
    }

    snap(`야생 ${wildPokemon.speciesName}은(는) ${wildMoveName}을(를) 사용했다!`)

    const wildMoveMeta = MOVE_META[wildMoveName]
    const wildMoveAcc = wildMoveMeta?.accuracy ?? 100
    if (wildMoveAcc !== null) {
      const accMul = getAccEvaMultiplier(curWild.stages?.['명중률'] ?? 0)
      const evaMul = getAccEvaMultiplier(curPlayer.stages?.['회피율'] ?? 0)
      const finalAcc = wildMoveAcc * (accMul / evaMul)
      if (Math.random() * 100 >= finalAcc) {
        snap('빗나갔다!')
        return false
      }
    }

    if (wildMoveData.category !== '변화' && wildMoveData.fixedDamage) {
      const fixedDmg = wildMoveData.fixedDamage === 'level' ? curWild.level : wildMoveData.fixedDamage
      curPlayer = { ...curPlayer, hp: Math.max(0, curPlayer.hp - fixedDmg) }
      snap(null)
    } else if (wildMoveData.category !== '변화' && wildMoveData.power) {
      const atkStat = wildMoveData.category === '물리' ? getEffectiveStat(curWild, '공격')   : getEffectiveStat(curWild, '특수공격')
      const defStat = wildMoveData.category === '물리' ? getEffectiveStat(curPlayer, '방어') : getEffectiveStat(curPlayer, '특수방어')
      const typeEff = getTypeEffectiveness(wildMoveData.type, myPokemon.types)
      if (typeEff === 0) {
        snap('효과가 없다!')
      } else {
        const weatherMod = getWeatherModifier(wildMoveData.type, curWeather)
        const dmg = Math.max(1, Math.floor(wildMoveData.power * (atkStat / defStat) * typeEff * weatherMod * 0.5))
        if (typeEff > 1)      snap('효과는 굉장했다!')
        else if (typeEff < 1) snap('효과가 별로인 것 같다...')
        curPlayer = { ...curPlayer, hp: Math.max(0, curPlayer.hp - dmg) }
        snap(null)
        const wEff = getMoveStatusEffect(wildMoveName)
        if (wEff && !curPlayer.status && Math.random() < wEff.chance) {
          curPlayer = { ...curPlayer, status: wEff.type, statusTurns: wEff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0 }
          snap(`${myPokemon.speciesName}은(는) ${STATUS_KO[wEff.type]}에 걸렸다!`)
        }
      }
    } else if (wildMoveData.category === '변화') {
      // 1) 날씨 기술
      if (wildMoveMeta?.special === 'sunny_day') {
        if (curWeather === 'sunny_day') {
          snap('날씨는 이미 맑다!')
        } else {
          curWeather = 'sunny_day'
          curWeatherTurns = 5
          snap(WEATHER_KO.sunny_day.start)
        }
      } else if (wildMoveMeta?.special === 'rain_dance') {
        if (curWeather === 'rain_dance') {
          snap('이미 비가 내리고 있다!')
        } else {
          curWeather = 'rain_dance'
          curWeatherTurns = 5
          snap(WEATHER_KO.rain_dance.start)
        }
      // 2) special 기술
      } else if (wildMoveMeta?.special === 'roar') {
        // 야생이 울부짖기를 쓸 경우 배틀 종료 대신 무효 처리
        snap('하지만 효과가 없는 것 같다...')
        return true
      } else if (wildMoveMeta?.special === 'synthesis') {
        const heal = Math.floor(curWild.maxHP * 0.5)
        curWild = { ...curWild, hp: Math.min(curWild.maxHP, curWild.hp + heal) }
        snap(`야생 ${wildPokemon.speciesName}은(는) HP를 회복했다!`)
      } else if (wildMoveMeta?.special === 'rest') {
        curWild = { ...curWild, hp: curWild.maxHP, status: 'sleep', statusTurns: 2 }
        snap(`야생 ${wildPokemon.speciesName}은(는) 잠들어서 HP를 회복했다!`)
      } else if (wildMoveMeta?.special === 'pain_split') {
        const avg = Math.floor((curPlayer.hp + curWild.hp) / 2)
        curPlayer = { ...curPlayer, hp: Math.max(0, Math.min(curPlayer.maxHP, avg)) }
        curWild = { ...curWild, hp: Math.max(0, Math.min(curWild.maxHP, avg)) }
        snap('서로의 HP를 나누었다!')
        if (curPlayer.hp <= 0) {
          snap(`${myPokemon.speciesName}이(가) 쓰러졌다...`, 'ended', 'lose')
          return true
        }
        if (curWild.hp <= 0) {
          snap(`야생 ${wildPokemon.speciesName}이(가) 쓰러졌다!`, 'ended', 'win')
          pointsGained = 30
          return true
        }
      // 3) statEffect 기술
      } else if (wildMoveMeta?.statEffect) {
        const se = wildMoveMeta.statEffect
        const target = se.target === 'self' ? curWild : curPlayer
        const targetName = se.target === 'self' ? `야생 ${wildPokemon.speciesName}` : myPokemon.speciesName
        const { battler: updated, logs } = applyStatChanges(target, se.changes, targetName)
        if (se.target === 'self') curWild = updated; else curPlayer = updated
        for (const log of logs) snap(log)
      // 4) statusEffect 기술
      } else {
        const wEff = getMoveStatusEffect(wildMoveName)
        if (wEff && !curPlayer.status && Math.random() < wEff.chance) {
          curPlayer = { ...curPlayer, status: wEff.type, statusTurns: wEff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0 }
          snap(`${myPokemon.speciesName}은(는) ${STATUS_KO[wEff.type]}에 걸렸다!`)
        } else if (!wEff) {
          snap('하지만 효과가 없는 것 같다...')
        }
      }
    }

    if (curPlayer.hp <= 0) {
      snap(`${myPokemon.speciesName}이(가) 쓰러졌다...`, 'ended', 'lose')
      return true
    }
    return false
  }

  // ── Speed ordering (엽록소: 맑은 날씨에 스피드 2배) ────────────────
  const playerSpd = getEffectiveStat(curPlayer, '스피드') * (curWeather === 'sunny_day' && curPlayer.abilityName === '엽록소' ? 2 : 1)
  const wildSpd   = getEffectiveStat(curWild,   '스피드') * (curWeather === 'sunny_day' && curWild.abilityName   === '엽록소' ? 2 : 1)
  const playerFirst = playerSpd >= wildSpd

  if (playerFirst) {
    if (processPlayerAction()) return { frames, pointsGained }
    if (processWildAction())   return { frames, pointsGained }
  } else {
    if (processWildAction())   return { frames, pointsGained }
    if (processPlayerAction()) return { frames, pointsGained }
  }

  // ── End-of-turn burn/poison damage ─────────────────────────────
  if (curWild.status === 'burn' || curWild.status === 'poison') {
    const dmg = calcStatusDamage(curWild.status, curWild.maxHP)
    snap(`야생 ${wildPokemon.speciesName}은(는) ${STATUS_KO[curWild.status]} 피해를 입었다!`)
    curWild = { ...curWild, hp: Math.max(0, curWild.hp - dmg) }
    snap(null)
    if (curWild.hp <= 0) {
      snap(`야생 ${wildPokemon.speciesName}이(가) 쓰러졌다!`, 'ended', 'win')
      pointsGained = 30
      return { frames, pointsGained }
    }
  }

  if (curPlayer.status === 'burn' || curPlayer.status === 'poison') {
    const dmg = calcStatusDamage(curPlayer.status, curPlayer.maxHP)
    snap(`${myPokemon.speciesName}은(는) ${STATUS_KO[curPlayer.status]} 피해를 입었다!`)
    curPlayer = { ...curPlayer, hp: Math.max(0, curPlayer.hp - dmg) }
    snap(null)
    if (curPlayer.hp <= 0) {
      snap(`${myPokemon.speciesName}이(가) 쓰러졌다...`, 'ended', 'lose')
      return { frames, pointsGained }
    }
  }

  // ── End-of-turn ability effects ────────────────────────────────
  // 빗속준비: 비 날씨에 매 턴 HP 1/16 회복
  if (curWeather === 'rain_dance' && curPlayer.abilityName === '빗속준비') {
    const heal = Math.max(1, Math.floor(curPlayer.maxHP / 16))
    curPlayer = { ...curPlayer, hp: Math.min(curPlayer.maxHP, curPlayer.hp + heal) }
    snap(`${myPokemon.speciesName}은(는) 빗속준비로 체력을 회복했다!`)
  }

  // 태양의힘: 맑은 날씨에 매 턴 HP 1/8 소모
  if (curWeather === 'sunny_day' && curPlayer.abilityName === '태양의힘') {
    const drain = Math.max(1, Math.floor(curPlayer.maxHP / 8))
    curPlayer = { ...curPlayer, hp: Math.max(0, curPlayer.hp - drain) }
    snap(`${myPokemon.speciesName}은(는) 태양의힘으로 체력을 소모했다!`)
    snap(null)
    if (curPlayer.hp <= 0) {
      snap(`${myPokemon.speciesName}이(가) 쓰러졌다...`, 'ended', 'lose')
      return { frames, pointsGained }
    }
  }

  // ── End-of-turn weather countdown ─────────────────────────────
  if (curWeather) {
    curWeatherTurns--
    if (curWeatherTurns <= 0) {
      const msg = WEATHER_KO[curWeather]?.end ?? '날씨가 원래대로 돌아왔다.'
      curWeather = null
      curWeatherTurns = 0
      snap(msg)
    }
  }

  // ── Turn complete: mark last frame as selecting ─────────────────
  if (frames.length > 0) {
    frames[frames.length - 1] = { ...frames[frames.length - 1], phase: 'selecting' }
  }
  return { frames, pointsGained }
}

// ── Catch rate calculation ──────────────────────────────────────
// HP가 낮을수록, 볼 보정이 높을수록 포획 확률 상승
// 최소 5%, 최대 95%
export function calcCatchRate(wildHP, wildMaxHP, ballModifier) {
  const BASE_RATE = 0.4
  const hpFactor = 1 - (wildHP / wildMaxHP)  // 0 at full HP, ~1 at 1 HP
  const rate = (0.1 + hpFactor * 0.9) * ballModifier * BASE_RATE
  return Math.min(0.95, Math.max(0.05, rate))
}

// ── Wild-only turn (after failed ball throw) ────────────────────
// 볼 투척 실패 시 야생 포켓몬만 반격하는 턴 (플레이어 공격 없음)
export function processWildOnlyTurn(battle) {
  const { wild, player } = battle
  const wildPokemon = getPokemon(wild.speciesId)
  const myPokemon   = getPokemon(player.speciesId)
  if (!wildPokemon || !myPokemon) return { frames: [], pointsGained: 0 }

  let curWild         = { ...wild }
  let curPlayer       = { ...player }
  let curWeather      = battle.weather ?? null
  let curWeatherTurns = battle.weatherTurns ?? 0
  const frames        = []

  const wildMoveName = wild.moves.length > 0
    ? wild.moves[Math.floor(Math.random() * wild.moves.length)]
    : null
  const wildMoveData = wildMoveName ? wildPokemon.baseMoves.find(m => m.name === wildMoveName) : null

  const snap = (addLog, phase = 'animating', result = null) => {
    frames.push({ addLog, wild: { ...curWild }, player: { ...curPlayer }, weather: curWeather, weatherTurns: curWeatherTurns, phase, result })
  }

  if (!wildMoveData) {
    snap(null, 'selecting')
    return { frames, pointsGained: 0 }
  }

  // Wild status check
  const wCheck = checkStatusAction(curWild.status, curWild.statusTurns)
  if (wCheck.cleared) {
    const old = curWild.status
    curWild = { ...curWild, status: null, statusTurns: 0 }
    snap(`야생 ${wildPokemon.speciesName}의 ${STATUS_KO[old]}이(가) 풀렸다!`)
  } else {
    curWild = { ...curWild, statusTurns: wCheck.newTurns }
  }

  if (wCheck.prevented) {
    const msg = { sleep: '잠들어 있다!', paralysis: '마비로 움직일 수 없다!', freeze: '꽁꽁 얼어 있다!' }
    snap(`야생 ${wildPokemon.speciesName}은(는) ${msg[curWild.status] || '움직일 수 없다!'}`, 'selecting')
    return { frames, pointsGained: 0 }
  }

  snap(`야생 ${wildPokemon.speciesName}은(는) ${wildMoveName}을(를) 사용했다!`)

  const wildMoveMeta = MOVE_META[wildMoveName]
  const wildMoveAcc = wildMoveMeta?.accuracy ?? 100
  if (wildMoveAcc !== null) {
    const accMul = getAccEvaMultiplier(curWild.stages?.['명중률'] ?? 0)
    const evaMul = getAccEvaMultiplier(curPlayer.stages?.['회피율'] ?? 0)
    const finalAcc = wildMoveAcc * (accMul / evaMul)
    if (Math.random() * 100 >= finalAcc) {
      snap('빗나갔다!', 'selecting')
      return { frames, pointsGained: 0 }
    }
  }

  if (wildMoveData.category !== '변화' && wildMoveData.power) {
    const atkStat = wildMoveData.category === '물리' ? getEffectiveStat(curWild, '공격')   : getEffectiveStat(curWild, '특수공격')
    const defStat = wildMoveData.category === '물리' ? getEffectiveStat(curPlayer, '방어') : getEffectiveStat(curPlayer, '특수방어')
    const typeEff = getTypeEffectiveness(wildMoveData.type, myPokemon.types)
    if (typeEff === 0) {
      snap('효과가 없다!', 'selecting')
    } else {
      const weatherMod = getWeatherModifier(wildMoveData.type, curWeather)
      const dmg = Math.max(1, Math.floor(wildMoveData.power * (atkStat / defStat) * typeEff * weatherMod * 0.5))
      if (typeEff > 1)      snap('효과는 굉장했다!')
      else if (typeEff < 1) snap('효과가 별로인 것 같다...')
      curPlayer = { ...curPlayer, hp: Math.max(0, curPlayer.hp - dmg) }
      snap(null)
      const wEff = getMoveStatusEffect(wildMoveName)
      if (wEff && !curPlayer.status && Math.random() < wEff.chance) {
        curPlayer = { ...curPlayer, status: wEff.type, statusTurns: wEff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0 }
        snap(`${myPokemon.speciesName}은(는) ${STATUS_KO[wEff.type]}에 걸렸다!`)
      }
      if (curPlayer.hp <= 0) {
        snap(`${myPokemon.speciesName}이(가) 쓰러졌다...`, 'ended', 'lose')
        return { frames, pointsGained: 0 }
      }
    }
  } else if (wildMoveData.category === '변화') {
    // 변화 기술은 간단 처리
    const wEff = getMoveStatusEffect(wildMoveName)
    if (wEff && !curPlayer.status && Math.random() < wEff.chance) {
      curPlayer = { ...curPlayer, status: wEff.type, statusTurns: wEff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0 }
      snap(`${myPokemon.speciesName}은(는) ${STATUS_KO[wEff.type]}에 걸렸다!`)
    }
  }

  // End-of-turn status damage
  if (curPlayer.status === 'burn' || curPlayer.status === 'poison') {
    const dmg = calcStatusDamage(curPlayer.status, curPlayer.maxHP)
    snap(`${myPokemon.speciesName}은(는) ${STATUS_KO[curPlayer.status]} 피해를 입었다!`)
    curPlayer = { ...curPlayer, hp: Math.max(0, curPlayer.hp - dmg) }
    snap(null)
    if (curPlayer.hp <= 0) {
      snap(`${myPokemon.speciesName}이(가) 쓰러졌다...`, 'ended', 'lose')
      return { frames, pointsGained: 0 }
    }
  }

  // 빗속준비 HP 회복
  if (curWeather === 'rain_dance' && curPlayer.abilityName === '빗속준비') {
    const heal = Math.max(1, Math.floor(curPlayer.maxHP / 16))
    curPlayer = { ...curPlayer, hp: Math.min(curPlayer.maxHP, curPlayer.hp + heal) }
    snap(`${myPokemon.speciesName}은(는) 빗속준비로 체력을 회복했다!`)
  }

  // 태양의힘 HP 소모
  if (curWeather === 'sunny_day' && curPlayer.abilityName === '태양의힘') {
    const drain = Math.max(1, Math.floor(curPlayer.maxHP / 8))
    curPlayer = { ...curPlayer, hp: Math.max(0, curPlayer.hp - drain) }
    snap(`${myPokemon.speciesName}은(는) 태양의힘으로 체력을 소모했다!`)
    snap(null)
    if (curPlayer.hp <= 0) {
      snap(`${myPokemon.speciesName}이(가) 쓰러졌다...`, 'ended', 'lose')
      return { frames, pointsGained: 0 }
    }
  }

  // Weather countdown
  if (curWeather) {
    curWeatherTurns--
    if (curWeatherTurns <= 0) {
      const msg = WEATHER_KO[curWeather]?.end ?? '날씨가 원래대로 돌아왔다.'
      curWeather = null
      curWeatherTurns = 0
      snap(msg)
    }
  }

  // Mark last frame as selecting
  if (frames.length > 0) {
    frames[frames.length - 1] = { ...frames[frames.length - 1], phase: 'selecting' }
  }
  return { frames, pointsGained: 0 }
}
