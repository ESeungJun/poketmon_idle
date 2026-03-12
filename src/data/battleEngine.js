import { getPokemon, MOVE_META, getMovesUpToLevel, calcLevel, getMaxPP } from './pokemon'
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

// Same NATURES as PokemonStats.jsx
const NATURES = [
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

// Move accuracy (100 if not specified)
function getMoveAccuracy(moveName) {
  return MOVE_META[moveName]?.accuracy ?? 100
}

// Move status effect (null if none)
function getMoveStatusEffect(moveName) {
  return MOVE_META[moveName]?.statusEffect ?? null
}

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
  return {
    speciesId,
    level,
    dexNum: pokemon.dexNum,
    types: pokemon.types,
    maxHP,
    hp: maxHP,
    stats,
    moves,
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
  const resolvedMoves = (petStats.moves || []).map(name => {
    const base = pokemon.baseMoves.find(m => m.name === name)
    if (base) return base
    if (shopItems) {
      const tm = shopItems.find(i => i.category === 'tm' && i.moveName === name)
      if (tm) return { name, type: tm.moveType, category: tm.moveCategory, power: tm.movePower }
    }
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
    status: null,
    statusTurns: 0,
  }
}

// Execute one full turn: player acts → wild acts
// Returns { newBattle, pointsGained }
export function processTurn(battle, playerMoveName) {
  const { wild, player } = battle
  const myPokemon  = getPokemon(player.speciesId)
  const wildPokemon = getPokemon(wild.speciesId)
  const logs = []
  let newWild   = { ...wild }
  let newPlayer = { ...player }

  // ── Player turn ────────────────────────────────────────────────
  const pCheck = checkStatusAction(player.status, player.statusTurns)
  if (pCheck.cleared) {
    newPlayer = { ...newPlayer, status: null, statusTurns: 0 }
    logs.push(`${myPokemon.speciesName}의 ${STATUS_KO[player.status]}이(가) 풀렸다!`)
  } else {
    newPlayer = { ...newPlayer, statusTurns: pCheck.newTurns }
  }

  if (pCheck.prevented) {
    const msg = { sleep: '잠들어 있다!', paralysis: '마비로 움직일 수 없다!', freeze: '꽁꽁 얼어 있다!' }
    logs.push(`${myPokemon.speciesName}은(는) ${msg[player.status] || '움직일 수 없다!'}`)
  } else {
    const moveData = player.resolvedMoves?.find(m => m.name === playerMoveName)
    const currentPP = player.movePP?.[playerMoveName] ?? getMaxPP(playerMoveName)
    if (!moveData || currentPP <= 0) {
      logs.push(currentPP <= 0 ? `${playerMoveName}의 PP가 바닥났다!` : '기술을 사용할 수 없다!')
    } else {
      // Decrement PP
      newPlayer = { ...newPlayer, movePP: { ...newPlayer.movePP, [playerMoveName]: currentPP - 1 } }
      logs.push(`${myPokemon.speciesName}은(는) ${playerMoveName}을(를) 사용했다!`)
      const accuracy = getMoveAccuracy(playerMoveName)
      if (Math.random() * 100 >= accuracy) {
        logs.push('빗나갔다!')
      } else if (moveData.category !== '변화' && moveData.power) {
        // Damage move
        const atkStat = moveData.category === '물리' ? player.stats.공격 : player.stats.특수공격
        const defStat = moveData.category === '물리' ? wild.stats.방어   : wild.stats.특수방어
        const typeEff = getTypeEffectiveness(moveData.type, wildPokemon.types)
        if (typeEff === 0) {
          logs.push('효과가 없다!')
        } else {
          const dmg = Math.max(1, Math.floor(moveData.power * (atkStat / defStat) * typeEff * 0.5))
          newWild = { ...newWild, hp: Math.max(0, wild.hp - dmg) }
          if (typeEff > 1) logs.push('효과는 굉장했다!')
          else if (typeEff < 1) logs.push('효과가 별로인 것 같다...')
        }
        // Status effect on wild
        const eff = getMoveStatusEffect(playerMoveName)
        if (eff && !newWild.status && typeEff > 0 && Math.random() < eff.chance) {
          newWild = {
            ...newWild,
            status: eff.type,
            statusTurns: eff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0,
          }
          logs.push(`야생 ${wildPokemon.speciesName}은(는) ${STATUS_KO[eff.type]}에 걸렸다!`)
        }
      } else if (moveData.category === '변화') {
        // Status-only move
        const eff = getMoveStatusEffect(playerMoveName)
        const accuracy = getMoveAccuracy(playerMoveName)
        if (Math.random() * 100 < accuracy && eff && !newWild.status && Math.random() < eff.chance) {
          newWild = {
            ...newWild,
            status: eff.type,
            statusTurns: eff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0,
          }
          logs.push(`야생 ${wildPokemon.speciesName}은(는) ${STATUS_KO[eff.type]}에 걸렸다!`)
        } else if (!eff) {
          logs.push('하지만 효과가 없는 것 같다...')
        }
      }
    }
  }

  // Check wild fainted
  if (newWild.hp <= 0) {
    logs.push(`야생 ${wildPokemon.speciesName}이(가) 쓰러졌다!`)
    return {
      newBattle: { ...battle, wild: newWild, player: newPlayer, log: logs.join('\n'), phase: 'ended', result: 'win' },
      pointsGained: 30,
    }
  }

  // ── Wild's burn/poison damage ───────────────────────────────────
  if (newWild.status === 'burn' || newWild.status === 'poison') {
    const dmg = calcStatusDamage(newWild.status, newWild.maxHP)
    newWild = { ...newWild, hp: Math.max(0, newWild.hp - dmg) }
    logs.push(`야생 ${wildPokemon.speciesName}은(는) ${STATUS_KO[newWild.status]} 피해를 입었다!`)
    if (newWild.hp <= 0) {
      logs.push(`야생 ${wildPokemon.speciesName}이(가) 쓰러졌다!`)
      return {
        newBattle: { ...battle, wild: newWild, player: newPlayer, log: logs.join('\n'), phase: 'ended', result: 'win' },
        pointsGained: 30,
      }
    }
  }

  // ── Wild turn ──────────────────────────────────────────────────
  if (wild.moves.length > 0) {
    const wildMoveName = wild.moves[Math.floor(Math.random() * wild.moves.length)]
    const wildMoveData = wildPokemon.baseMoves.find(m => m.name === wildMoveName)

    if (wildMoveData) {
      const wCheck = checkStatusAction(newWild.status, newWild.statusTurns)
      if (wCheck.cleared) {
        newWild = { ...newWild, status: null, statusTurns: 0 }
        logs.push(`야생 ${wildPokemon.speciesName}의 ${STATUS_KO[wild.status]}이(가) 풀렸다!`)
      } else {
        newWild = { ...newWild, statusTurns: wCheck.newTurns }
      }

      if (wCheck.prevented) {
        const msg = { sleep: '잠들어 있다!', paralysis: '마비로 움직일 수 없다!', freeze: '꽁꽁 얼어 있다!' }
        logs.push(`야생 ${wildPokemon.speciesName}은(는) ${msg[newWild.status] || '움직일 수 없다!'}`)
      } else {
        logs.push(`야생 ${wildPokemon.speciesName}은(는) ${wildMoveName}을(를) 사용했다!`)
        const accuracy = getMoveAccuracy(wildMoveName)
        if (Math.random() * 100 >= accuracy) {
          logs.push('빗나갔다!')
        } else if (wildMoveData.category !== '변화' && wildMoveData.power) {
          const atkStat = wildMoveData.category === '물리' ? wild.stats.공격 : wild.stats.특수공격
          const defStat = wildMoveData.category === '물리' ? player.stats.방어   : player.stats.특수방어
          const typeEff = getTypeEffectiveness(wildMoveData.type, myPokemon.types)
          if (typeEff === 0) {
            logs.push('효과가 없다!')
          } else {
            const dmg = Math.max(1, Math.floor(wildMoveData.power * (atkStat / defStat) * typeEff * 0.5))
            newPlayer = { ...newPlayer, hp: Math.max(0, player.hp - dmg) }
            if (typeEff > 1) logs.push('효과는 굉장했다!')
          }
          // Wild's status effect on player
          const wEff = getMoveStatusEffect(wildMoveName)
          if (wEff && !newPlayer.status && typeEff > 0 && Math.random() < wEff.chance) {
            newPlayer = {
              ...newPlayer,
              status: wEff.type,
              statusTurns: wEff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0,
            }
            logs.push(`${myPokemon.speciesName}은(는) ${STATUS_KO[wEff.type]}에 걸렸다!`)
          }
        } else if (wildMoveData.category === '변화') {
          const wEff = getMoveStatusEffect(wildMoveName)
          if (wEff && !newPlayer.status && Math.random() < wEff.chance) {
            newPlayer = {
              ...newPlayer,
              status: wEff.type,
              statusTurns: wEff.type === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0,
            }
            logs.push(`${myPokemon.speciesName}은(는) ${STATUS_KO[wEff.type]}에 걸렸다!`)
          } else {
            logs.push('하지만 효과가 없는 것 같다...')
          }
        }
      }
    }
  }

  // ── Player's burn/poison damage ─────────────────────────────────
  if (newPlayer.status === 'burn' || newPlayer.status === 'poison') {
    const dmg = calcStatusDamage(newPlayer.status, newPlayer.maxHP)
    newPlayer = { ...newPlayer, hp: Math.max(0, newPlayer.hp - dmg) }
    logs.push(`${myPokemon.speciesName}은(는) ${STATUS_KO[newPlayer.status]} 피해를 입었다!`)
  }

  // Check player fainted
  if (newPlayer.hp <= 0) {
    logs.push(`${myPokemon.speciesName}이(가) 쓰러졌다...`)
    return {
      newBattle: { ...battle, wild: newWild, player: newPlayer, log: logs.join('\n'), phase: 'ended', result: 'lose' },
      pointsGained: 0,
    }
  }

  return {
    newBattle: {
      ...battle,
      wild: newWild,
      player: newPlayer,
      turn: battle.turn + 1,
      log: logs.join('\n'),
      phase: 'selecting',
    },
    pointsGained: 0,
  }
}
