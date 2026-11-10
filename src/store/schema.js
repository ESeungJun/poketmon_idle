import { MAX_TICKETS } from '../data/balance'

export const DEFAULT_STATE = {
  points: 0,
  totalPointsEarned: 0,   // 지금까지 번 포인트 합계 (통계)
  focusXp: 0,             // 레벨 경험치. 집중으로만 오른다
  encounterTickets: 1,    // 조우권. 집중 25분마다 한 장
  ticketMinutes: 0,       // 다음 조우권까지 쌓인 집중 분 (Rust 가 쓴다)
  purchasedItems: [],
  pomodoroHistory: [],
  petState: 'idle', // idle | happy | sleeping | evolving
  lastActiveTime: Date.now(),
  totalWorkMinutes: 0,
  petSpeciesId: null,
  petStats: null, // { speciesId, ivs, natureName, moves, learnedPool, abilityName }
  petName: null,
  petEVs: { HP: 0, 공격: 0, 방어: 0, 특수공격: 0, 특수방어: 0, 스피드: 0 },
  ownedTMs: [],
  equippedTool: null,
  ballInventory: { ball_pokeball: 0, ball_superball: 0, ball_hyperball: 0 },
  caughtPokemon: [],  // { speciesId, dexNum, level, natureName, abilityName, ivs, moves, learnedPool, evs, currentHP, movePP, caughtAt }
  seenSpecies: [],    // 도감: 만난 종
  focusSession: null, // 진행 중인 집중 { minutes, endsAt, remainingMs, awarded }. Rust 가 관리한다
  focusResult: null,  // 방금 끝난 집중의 결과 { minutes, gained, bonus, tickets }. 펫을 누르면 사라진다
  wildBattle: null, // in-memory only, not persisted
}

const isNumber = (v) => typeof v === 'number' && isFinite(v)

// 저장된 데이터의 타입을 검증해 DEFAULT_STATE 기준으로 안전한 값만 반환
// config.json 직접 편집 등으로 잘못된 타입이 유입되는 것을 방어
// 예전 구조(focusXp·조우권이 없는 파일)도 받아 레벨과 보유물을 그대로 잇는다
export function validateStore(saved) {
  const d = DEFAULT_STATE
  const v = { ...d }
  if (isNumber(saved.points))            v.points = Math.max(0, saved.points)
  if (isNumber(saved.totalPointsEarned)) v.totalPointsEarned = Math.max(0, saved.totalPointsEarned)
  if (isNumber(saved.totalWorkMinutes))  v.totalWorkMinutes  = Math.max(0, saved.totalWorkMinutes)
  // 레벨 경험치가 없는 예전 데이터는 지금까지 번 포인트를 그대로 물려받는다 (레벨 유지)
  v.focusXp = isNumber(saved.focusXp) ? Math.max(0, saved.focusXp) : v.totalPointsEarned
  if (Array.isArray(saved.purchasedItems))  v.purchasedItems  = saved.purchasedItems.filter(x => typeof x === 'string')
  if (Array.isArray(saved.pomodoroHistory)) v.pomodoroHistory = saved.pomodoroHistory
  if (Array.isArray(saved.ownedTMs))        v.ownedTMs        = saved.ownedTMs.filter(x => typeof x === 'string')
  if (Array.isArray(saved.caughtPokemon))   v.caughtPokemon   = saved.caughtPokemon
  if (typeof saved.petSpeciesId === 'string' || saved.petSpeciesId === null) v.petSpeciesId = saved.petSpeciesId
  if (typeof saved.petName === 'string' || saved.petName === null)           v.petName      = saved.petName
  if (typeof saved.equippedTool === 'string' || saved.equippedTool === null) v.equippedTool = saved.equippedTool
  if (saved.petStats && typeof saved.petStats === 'object') {
    const ps = saved.petStats
    // petStats 핵심 필드 검증 — 손상된 데이터 방어
    if (typeof ps.speciesId === 'string' && Array.isArray(ps.moves)) {
      v.petStats = {
        ...ps,
        moves: ps.moves.filter(m => typeof m === 'string'),
        learnedPool: Array.isArray(ps.learnedPool) ? ps.learnedPool.filter(m => typeof m === 'string') : ps.moves.filter(m => typeof m === 'string'),
        ivs: (ps.ivs && typeof ps.ivs === 'object') ? ps.ivs : {},
        currentHP: typeof ps.currentHP === 'number' ? Math.max(0, ps.currentHP) : null,
        movePP: (ps.movePP && typeof ps.movePP === 'object') ? ps.movePP : null,
      }
    }
    // speciesId나 moves가 손상됐으면 petStats = null → 자동 재생성됨
  }
  if (saved.petEVs   && typeof saved.petEVs   === 'object')                  v.petEVs       = { ...d.petEVs, ...saved.petEVs }
  if (saved.ballInventory && typeof saved.ballInventory === 'object')        v.ballInventory = { ...d.ballInventory, ...saved.ballInventory }
  const VALID_STATES = new Set(['idle', 'happy', 'sleeping', 'evolving'])
  if (typeof saved.petState === 'string' && VALID_STATES.has(saved.petState)) v.petState = saved.petState

  // 조우권: 없으면 쓰던 사람은 가득, 처음이면 한 장 (Rust 의 migrate 와 같은 규칙)
  if (isNumber(saved.encounterTickets)) v.encounterTickets = Math.min(MAX_TICKETS, Math.max(0, Math.floor(saved.encounterTickets)))
  else v.encounterTickets = v.petSpeciesId ? MAX_TICKETS : 1
  if (isNumber(saved.ticketMinutes)) v.ticketMinutes = Math.max(0, Math.floor(saved.ticketMinutes))
  // 도감: 없으면 지금 가진 종을 본 것으로 친다
  if (Array.isArray(saved.seenSpecies)) {
    v.seenSpecies = saved.seenSpecies.filter(x => typeof x === 'string')
  } else {
    const owned = [v.petSpeciesId, ...v.caughtPokemon.map(p => p?.speciesId)].filter(x => typeof x === 'string')
    v.seenSpecies = [...new Set(owned)]
  }
  return v
}
