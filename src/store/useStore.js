import { create } from 'zustand'
import { calcLevel, getPokemon, pickWildEncounter, getMovesUpToLevel } from '../data/pokemon'
import { buildWildBattler, buildPlayerBattler, processTurn, processWildOnlyTurn, calcCatchRate, generatePetStats } from '../data/battleEngine'
import { SHOP_ITEMS } from '../components/Shop/items'
import { BOX_LIMIT } from '../data/balance'
import { DEFAULT_STATE, validateStore } from './schema'

// 레벨업 시 새로 배울 수 있는 기술을 learnedPool과 moves에 반영
// prevLevel → newLevel 사이에 learnAt이 걸쳐 있는 기술을 순서대로 추가
// moves는 최대 4개 슬롯이므로 빈 자리가 있을 때만 자동 세팅
// 변경이 없으면 null을 반환해 불필요한 store 업데이트를 방지
function applyLevelUpMoves(petStats, pokemon, prevLevel, newLevel) {
  if (!petStats || !pokemon) return null
  const existingPool = petStats.learnedPool || petStats.moves || []
  let pool = [...existingPool]
  let moves = [...petStats.moves]
  for (let lv = prevLevel + 1; lv <= newLevel; lv++) {
    for (const m of pokemon.baseMoves) {
      if ((m.learnAt ?? 1) === lv && !pool.includes(m.name)) {
        pool.push(m.name)
        if (moves.length < 4) moves.push(m.name)
      }
    }
  }
  if (pool.length === existingPool.length) return null
  return { ...petStats, learnedPool: pool, moves }
}

// 레벨이 올랐을 때 따라오는 변화(진화 시작, 새 기술)를 계산한다
// running: 집중 중이면 진화가 끝난 뒤 다시 잠든다
function levelUpEffects(state, prevXp, newXp, running) {
  const prevLevel = calcLevel(prevXp || 0)
  const newLevel = calcLevel(newXp || 0)
  if (newLevel <= prevLevel || !state.petSpeciesId) return null
  const pokemon = getPokemon(state.petSpeciesId)
  if (!pokemon) return null
  const effects = {}
  // 진화 조건 충족 시 evolving 상태 전환 (App.jsx에서 3초 후 confirmEvolution 호출)
  // 이미 진화 레벨을 넘겼어도 레벨업 시 진화 (한 단계씩)
  if (pokemon.evolveAt && newLevel >= pokemon.evolveAt && state.petState !== 'evolving') {
    effects.petState = 'evolving'
    effects.preEvolvingState = running ? 'sleeping' : 'idle'
  }
  const updatedStats = applyLevelUpMoves(state.petStats, pokemon, prevLevel, newLevel)
  if (updatedStats) effects.petStats = updatedStats
  return Object.keys(effects).length ? effects : null
}

// 앱 시작 시 config.json 에 저장된 데이터를 로드 (Rust 가 읽어 준다)
// Tauri 환경이 아니면(브라우저 개발 등) 기본값 반환
async function loadFromStore() {
  if (!window.electronAPI) return DEFAULT_STATE
  try {
    const saved = await window.electronAPI.getAllStore()
    return saved && Object.keys(saved).length > 0 ? validateStore(saved) : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

// 비동기로 단일 키 저장
// Promise 를 반환하지만 store 업데이트를 블로킹할 필요가 없으므로 에러만 로깅하고 무시
function saveToStore(key, value) {
  if (!window.electronAPI) return
  window.electronAPI.setStoreAsync(key, value).catch(e => {
    console.error('Failed to save to store:', e)
  })
}

// 함께 바뀌어야 하는 여러 키를 한 번에 저장 (디스크 쓰기 한 번)
function saveMany(values) {
  if (!window.electronAPI) return
  window.electronAPI.setStoreMany(values).catch(e => {
    console.error('Failed to save to store:', e)
  })
}

const useStore = create((set, get) => ({
  ...DEFAULT_STATE,
  initialized: false,

  initialize: async () => {
    const saved = await loadFromStore()
    set({ ...saved, initialized: true })
    // 진행 중인 집중 세션과 방금 끝난 결과는 Rust 가 갖고 있다
    if (window.electronAPI) {
      try {
        get().applyFocusUpdate(await window.electronAPI.getFocus(), false)
      } catch (e) {
        console.error('Failed to load focus state:', e)
      }
    }
  },

  // 쓸 수 있는 포인트 추가 (배틀 보상 등). 레벨 경험치는 주지 않는다
  // showHappy: false이면 happy 애니메이션 없이 조용히 추가
  addPoints: (amount, showHappy = true) => {
    const state = get()
    const prevState = state.petState
    const newPoints = state.points + amount
    const newTotalEarned = (state.totalPointsEarned || 0) + amount
    const happy = showHappy && prevState !== 'evolving'

    saveMany({ points: newPoints, totalPointsEarned: newTotalEarned })
    set({
      points: newPoints,
      totalPointsEarned: newTotalEarned,
      lastActiveTime: Date.now(),
      ...(happy ? { petState: 'happy' } : {}),
    })

    // 변경된 필드만 골라 다른 창에 동기화
    if (window.electronAPI) {
      const syncData = { points: newPoints, totalPointsEarned: newTotalEarned }
      if (happy) syncData.petState = 'happy'
      window.electronAPI.sendStateUpdate(syncData)
    }

    // happy 상태 2초 후 이전 상태로 복귀
    if (happy) {
      setTimeout(() => {
        set(s => {
          if (s.petState === 'happy') {
            // 그사이 집중이 끝났거나 시작됐을 수 있으니 지금 세션으로 정한다
            const nextState = s.focusSession?.endsAt != null ? 'sleeping' : 'idle'
            if (window.electronAPI) {
              window.electronAPI.sendStateUpdate({ petState: nextState })
            }
            return { petState: nextState }
          }
          return {}
        })
      }, 2000)
    }
  },

  // 레벨 경험치 추가 + 레벨업/진화 체크. 개발자 모드 전용 (평소에는 집중 타이머만 경험치를 준다)
  gainFocusXp: (amount) => {
    const state = get()
    const newXp = (state.focusXp || 0) + amount
    const effects = levelUpEffects(state, state.focusXp, newXp, state.petState === 'sleeping') || {}
    const update = { focusXp: newXp, ...effects }
    saveMany({ focusXp: newXp, ...(effects.petStats ? { petStats: effects.petStats } : {}) })
    set(update)
    if (window.electronAPI) window.electronAPI.sendStateUpdate(update)
  },

  // Rust 집중 타이머가 보낸 상태를 반영한다 (시작·1분 지급·멈춤·완료)
  // leader: 레벨업에 따른 진화·기술 습득을 처리하는 창 (펫 창 하나만). 두 창이 같은 일을 두 번 하지 않게 한다
  applyFocusUpdate: (payload, leader) => {
    if (!payload) return
    const state = get()
    const session = payload.session ?? null
    const running = session?.endsAt != null
    const update = { focusSession: session, focusResult: payload.result ?? null }

    for (const [key, value] of Object.entries(payload.values || {})) {
      if (typeof value === 'number' && isFinite(value)) update[key] = value
    }
    if (Array.isArray(payload.history)) update.pomodoroHistory = payload.history

    // 잠든 모습 = 집중 중
    if (running) {
      if (state.petState === 'evolving') update.preEvolvingState = 'sleeping'
      else update.petState = 'sleeping'
    } else if (state.petState === 'sleeping') {
      update.petState = 'idle'
    } else if (state.petState === 'evolving' && state.preEvolvingState === 'sleeping') {
      update.preEvolvingState = 'idle'
    }

    if (leader && typeof payload.prevXp === 'number' && typeof update.focusXp === 'number') {
      const effects = levelUpEffects(state, payload.prevXp, update.focusXp, running)
      if (effects) {
        Object.assign(update, effects)
        if (effects.petStats) saveToStore('petStats', effects.petStats)
        if (window.electronAPI) window.electronAPI.sendStateUpdate(effects)
      }
    }

    // 완료: 깨어나서 2초간 기뻐한다 (진화 중이면 생략)
    const evolving = (update.petState ?? state.petState) === 'evolving'
    if (payload.done && !evolving) {
      update.petState = 'happy'
      setTimeout(() => {
        set(s => (s.petState === 'happy' ? { petState: s.focusSession?.endsAt != null ? 'sleeping' : 'idle' } : {}))
      }, 2000)
    }
    set(update)
  },

  spendPoints: (amount) => {
    const { points } = get()
    if (points < amount) return false
    const newPoints = points - amount
    set({ points: newPoints })
    saveToStore('points', newPoints)
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ points: newPoints })
    }
    return true
  },

  // 스타터 선택 완료: petStats를 null로 초기화해 PokemonStats에서 새로 생성하게 함
  selectStarter: (speciesId) => {
    const seenSpecies = [...new Set([...get().seenSpecies, speciesId])]
    set({ petSpeciesId: speciesId, petStats: null, seenSpecies })
    saveMany({ petSpeciesId: speciesId, petStats: null, seenSpecies })
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petSpeciesId: speciesId, seenSpecies })
      window.electronAPI.notifyStarterSelected()  // main에 알려 펫 창 표시
    }
  },

  // 진화 확정: App.jsx에서 evolving 상태 3초 후 호출
  // 새 종 ID로 교체하고 petStats의 speciesId만 갱신 (성격·특성·개체값은 유지)
  confirmEvolution: () => {
    const { petSpeciesId, petStats, focusXp } = get()
    const pokemon = getPokemon(petSpeciesId)
    if (!pokemon || !pokemon.evolveTo) return
    const newSpeciesId = pokemon.evolveTo
    const newPokemon = getPokemon(newSpeciesId)
    let newPetStats = petStats
      ? { ...petStats, speciesId: newSpeciesId }
      : null
    // 진화형의 현재 레벨 이하 기술을 learnedPool에 추가
    if (newPetStats && newPokemon) {
      const currentLevel = Math.max(1, calcLevel(focusXp || 0))
      const evoMoves = getMovesUpToLevel(newPokemon, currentLevel).map(m => m.name)
      const pool = newPetStats.learnedPool || newPetStats.moves || []
      const newPool = [...pool]
      for (const moveName of evoMoves) {
        if (!newPool.includes(moveName)) newPool.push(moveName)
      }
      // moves 슬롯에 빈 자리가 있으면 새 기술 자동 세팅
      const moves = [...(newPetStats.moves || [])]
      for (const moveName of newPool) {
        if (moves.length >= 4) break
        if (!moves.includes(moveName)) moves.push(moveName)
      }
      newPetStats = { ...newPetStats, learnedPool: newPool, moves }
    }
    const seenSpecies = [...new Set([...get().seenSpecies, newSpeciesId])]
    set({ petSpeciesId: newSpeciesId, petStats: newPetStats, petState: 'happy', preEvolvingState: null, seenSpecies })
    saveMany({ petSpeciesId: newSpeciesId, petStats: newPetStats, seenSpecies })
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petSpeciesId: newSpeciesId, petState: 'happy', petStats: newPetStats, seenSpecies })
    }
    setTimeout(() => {
      set(s => {
        if (s.petState === 'happy') {
          // 진화하는 사이 집중이 끝났을 수 있으니 지금 세션으로 정한다
          const nextState = s.focusSession?.endsAt != null ? 'sleeping' : 'idle'
          if (window.electronAPI) window.electronAPI.sendStateUpdate({ petState: nextState })
          return { petState: nextState }
        }
        return {}
      })
    }, 2000)
  },

  purchaseItem: (itemId, cost) => {
    const { spendPoints, purchasedItems } = get()
    if (purchasedItems.includes(itemId)) return false
    if (!spendPoints(cost)) return false
    const newPurchased = [...purchasedItems, itemId]
    set({ purchasedItems: newPurchased })
    saveToStore('purchasedItems', newPurchased)
    return true
  },

  // 진화 아이템 사용: 현재 펫의 evolveItem과 일치하면 진화 시작 + 아이템 소모
  useEvoStone: (itemId) => {
    const { purchasedItems, petSpeciesId, petState } = get()
    if (!purchasedItems.includes(itemId)) return false
    if (petState === 'evolving') return false
    const pokemon = getPokemon(petSpeciesId)
    if (!pokemon || pokemon.evolveItem !== itemId || !pokemon.evolveTo) return false
    const prevState = petState === 'happy' ? 'idle' : petState
    const newPurchased = purchasedItems.filter(id => id !== itemId)
    set({ purchasedItems: newPurchased, petState: 'evolving', preEvolvingState: prevState })
    saveToStore('purchasedItems', newPurchased)
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petState: 'evolving', purchasedItems: newPurchased })
    }
    return true
  },

  // ── 집중 타이머 ──────────────────────────────────────────────────
  // 시간과 보상은 Rust 가 맡는다. 여기서는 요청만 보내고, 결과는 focus-update 이벤트로 돌아온다
  startFocus: (minutes) => window.electronAPI?.startFocus(minutes),
  pauseFocus: () => window.electronAPI?.pauseFocus(),
  resumeFocus: () => window.electronAPI?.resumeFocus(),
  cancelFocus: () => window.electronAPI?.cancelFocus(),
  dismissFocusResult: () => {
    set({ focusResult: null })
    window.electronAPI?.dismissFocusResult()
  },

  // petState 변경 + 다른 창에 동기화
  setPetState: (state) => {
    const update = { petState: state }
    if (state === 'evolving') {
      update.preEvolvingState = get().petState
    }
    set(update)
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate(update)
    }
  },

  setPetSpecies: (speciesId) => {
    set({ petSpeciesId: speciesId, petStats: null })
    saveMany({ petSpeciesId: speciesId, petStats: null })
  },

  // petStats 형식: { speciesId, ivs, natureName, moves, learnedPool, abilityName }
  setPetStats: (stats) => {
    set({ petStats: stats })
    saveToStore('petStats', stats)
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ petStats: stats })
  },

  // 닉네임을 petStats.nickname에 저장 (개별 포켓몬에 귀속)
  setPetName: (name) => {
    const { petStats } = get()
    if (!petStats) return
    const newStats = { ...petStats, nickname: name || null }
    set({ petStats: newStats, petName: name })
    saveMany({ petStats: newStats, petName: name })
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ petStats: newStats, petName: name })
  },

  // 비타민 사용: 해당 스탯 EV를 10씩 증가 (단일 스탯 max 252, 총합 max 510)
  applyVitamin: (stat, cost) => {
    const { petEVs, spendPoints } = get()
    const cur = petEVs[stat] || 0
    const total = Object.values(petEVs).reduce((s, v) => s + v, 0)
    if (cur >= 252 || total >= 510) return false
    const add = Math.min(10, 252 - cur, 510 - total)
    if (!spendPoints(cost)) return false
    const newEVs = { ...petEVs, [stat]: cur + add }
    set({ petEVs: newEVs })
    saveToStore('petEVs', newEVs)
    return true
  },

  // 도구 장착/해제 토글 (구매한 아이템만 장착 가능)
  equipTool: (toolId) => {
    const { equippedTool, purchasedItems } = get()
    if (!purchasedItems.includes(toolId)) return
    const newTool = equippedTool === toolId ? null : toolId
    set({ equippedTool: newTool })
    saveToStore('equippedTool', newTool)
  },

  buyTM: (tmId, cost) => {
    const { ownedTMs, spendPoints } = get()
    if (ownedTMs.includes(tmId)) return false
    if (!spendPoints(cost)) return false
    const newOwned = [...ownedTMs, tmId]
    set({ ownedTMs: newOwned })
    saveToStore('ownedTMs', newOwned)
    return true
  },

  // ── 몬스터볼 ─────────────────────────────────────────────────────

  buyBall: (ballId, cost) => {
    const { spendPoints, ballInventory } = get()
    if (!spendPoints(cost)) return false
    const newInventory = { ...ballInventory, [ballId]: (ballInventory[ballId] || 0) + 1 }
    set({ ballInventory: newInventory })
    saveToStore('ballInventory', newInventory)
    return true
  },

  throwBall: (ballId, ballModifier) => {
    const { wildBattle, ballInventory, caughtPokemon } = get()
    if (!wildBattle || wildBattle.phase !== 'selecting') return
    if ((ballInventory[ballId] || 0) <= 0) return
    if (caughtPokemon.length >= BOX_LIMIT) return  // 보관함이 가득 차면 볼을 쓰지 않는다

    const { wild, player } = wildBattle
    const wildPokemon = getPokemon(wild.speciesId)
    const wildName = wildPokemon?.speciesName ?? wild.speciesId

    const speciesCatchRate = wildPokemon?.catchRate ?? 100
    const catchRate = calcCatchRate(wild.hp, wild.maxHP, ballModifier, speciesCatchRate, wild.status)
    const caught = Math.random() < catchRate

    // 흔들림 프레임 생성 (공식 포켓몬 포획 연출)
    // ballState: 'thrown' → 볼 등장, 'shaking' → 흔들림, 'caught' → 포획 확정, 'break' → 튀어나옴, null → 포켓몬 표시
    const frames = []
    const snap = (addLog, phase = 'animating', result = null, ballState = null) => {
      frames.push({ addLog, wild: { ...wild }, player: { ...player }, phase, result, ballState })
    }

    snap(`몬스터볼을 던졌다!`, 'animating', null, 'thrown')

    if (caught) {
      snap('... 흔들 흔들 ...', 'animating', null, 'shaking')
      snap('... 흔들 흔들 ...', 'animating', null, 'shaking')
      snap('... 흔들 흔들 ...', 'animating', null, 'shaking')
      snap(`딸깍! 야생 ${wildName}을(를) 잡았다!`, 'ended', 'caught', 'caught')
    } else {
      // catchRate에 비례해서 흔들림 횟수 결정 (0~2회)
      const shakeCount = catchRate > 0.6 ? 2 : catchRate > 0.3 ? 1 : 0
      for (let i = 0; i < shakeCount; i++) {
        snap('... 흔들 흔들 ...', 'animating', null, 'shaking')
      }
      snap(`아깝다! ${wildName}이(가) 튀어나왔다!`, 'animating', null, 'break')

      // 야생 반격 프레임 추가 (ballState: null → 포켓몬 다시 표시)
      const tempBattle = { ...wildBattle, wild: { ...wild }, player: { ...player } }
      const { frames: wildFrames } = processWildOnlyTurn(tempBattle)
      for (const wf of wildFrames) frames.push(wf)
    }

    // 볼 소비 + 배틀 애니메이션 시작을 하나의 set으로 원자적 업데이트
    const newInventory = { ...ballInventory, [ballId]: ballInventory[ballId] - 1 }
    saveToStore('ballInventory', newInventory)
    set({
      ballInventory: newInventory,
      wildBattle: {
        ...wildBattle,
        phase: 'animating',
        pendingFrames: frames,
        frameIndex: 0,
        pendingPointsGained: 0,
        logLines: [],
        ballState: null,
      },
    })
  },

  // ── 보관함 파트너 교체 ────────────────────────────────────────────

  swapPartner: (boxIndex) => {
    const { caughtPokemon, petSpeciesId, petStats, petName, petEVs, focusXp, wildBattle } = get()
    if (wildBattle) return  // 배틀 중 교체 금지
    if (boxIndex < 0 || boxIndex >= caughtPokemon.length) return
    if (!petSpeciesId) return

    const boxPoke = caughtPokemon[boxIndex]
    const playerLevel = Math.max(1, calcLevel(focusXp || 0))

    // 현재 파트너 → 보관함에 저장 (원래 포획 시점 보존)
    const currentToBox = {
      speciesId: petSpeciesId,
      dexNum: getPokemon(petSpeciesId)?.dexNum ?? null,
      level: playerLevel,
      nickname: petStats?.nickname ?? petName ?? null,
      natureName: petStats?.natureName ?? '개구쟁이',
      abilityName: petStats?.abilityName ?? null,
      ivs: petStats?.ivs ?? {},
      moves: petStats?.moves ?? [],
      learnedPool: petStats?.learnedPool ?? [],
      evs: { ...petEVs },
      currentHP: petStats?.currentHP ?? null,
      movePP: petStats?.movePP ?? null,
      caughtAt: petStats?.caughtAt ?? Date.now(),
    }

    // 보관함 포켓몬 → 파트너로
    const newSpeciesId = boxPoke.speciesId
    const newNickname = boxPoke.nickname ?? null
    const newPetStats = {
      speciesId: newSpeciesId,
      nickname: newNickname,
      ivs: boxPoke.ivs ?? {},
      natureName: boxPoke.natureName ?? '개구쟁이',
      abilityName: boxPoke.abilityName ?? null,
      moves: boxPoke.moves ?? [],
      learnedPool: boxPoke.learnedPool ?? [],
      currentHP: boxPoke.currentHP ?? null,
      movePP: boxPoke.movePP ?? null,
      caughtAt: boxPoke.caughtAt ?? null,  // 다시 보관함에 넣어도 포획 시각이 바뀌지 않게
    }
    const newEVs = boxPoke.evs ?? { HP: 0, 공격: 0, 방어: 0, 특수공격: 0, 특수방어: 0, 스피드: 0 }

    // 보관함 업데이트
    const newCaught = [...caughtPokemon]
    newCaught[boxIndex] = currentToBox

    set({
      petSpeciesId: newSpeciesId,
      petStats: newPetStats,
      petName: newNickname,
      petEVs: newEVs,
      caughtPokemon: newCaught,
    })
    // 종·스탯·보관함이 어긋난 채로 남지 않게 한 번에 쓴다
    saveMany({ petSpeciesId: newSpeciesId, petStats: newPetStats, petName: newNickname, petEVs: newEVs, caughtPokemon: newCaught })
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petSpeciesId: newSpeciesId, petStats: newPetStats, petName: newNickname, petEVs: newEVs })
    }
  },

  releaseFromBox: (boxIndex) => {
    const { caughtPokemon } = get()
    if (boxIndex < 0 || boxIndex >= caughtPokemon.length) return
    const newCaught = caughtPokemon.filter((_, i) => i !== boxIndex)
    set({ caughtPokemon: newCaught })
    saveToStore('caughtPokemon', newCaught)
  },

  // TM 사용: learnedPool에 기술명 추가 (moves 슬롯 교체는 swapMove로 별도 처리)
  useTM: (moveName) => {
    const { petStats } = get()
    if (!petStats) return
    const pool = petStats.learnedPool || petStats.moves || []
    if (pool.includes(moveName)) return
    const newStats = { ...petStats, learnedPool: [...pool, moveName] }
    set({ petStats: newStats })
    saveToStore('petStats', newStats)
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ petStats: newStats })
  },

  // 활성 기술 슬롯(0~3)의 기술을 learnedPool에서 선택한 기술로 교체
  swapMove: (activeIdx, newMoveName) => {
    const { petStats } = get()
    if (!petStats) return
    const newMoves = [...petStats.moves]
    newMoves[activeIdx] = newMoveName
    const newStats = { ...petStats, moves: newMoves }
    set({ petStats: newStats })
    saveToStore('petStats', newStats)
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ petStats: newStats })
  },

  // ── Wild Battle ─────────────────────────────────────────────────

  startWildBattle: () => {
    const { petSpeciesId, petEVs, focusXp, petState, encounterTickets, equippedTool, seenSpecies } = get()
    let { petStats } = get()
    if (!petSpeciesId) return
    // 진화 중 배틀 시작 금지
    if (petState === 'evolving') return
    // HP 0이면 배틀 불가 (petStats 존재 시)
    if (petStats?.currentHP === 0) return
    // 조우는 집중으로 얻은 조우권으로만 한다
    if (!(encounterTickets >= 1)) return
    const playerLevel = Math.max(1, calcLevel(focusXp || 0))
    // petStats가 null이면 자동 생성 (스탯 탭 미방문 시 대비)
    if (!petStats) {
      const pokemon = getPokemon(petSpeciesId)
      if (!pokemon) return
      petStats = generatePetStats(pokemon, playerLevel)
      set({ petStats })
      saveToStore('petStats', petStats)
      if (window.electronAPI) window.electronAPI.sendStateUpdate({ petStats })
    }
    const encounter = pickWildEncounter(playerLevel)
    if (!encounter) {
      set({ wildBattle: { wild: null, player: null, phase: 'ended', result: null, log: '근처에 야생 포켓몬이 없다...' } })
      return
    }
    const wild   = buildWildBattler(encounter.speciesId, encounter.level)
    const player = buildPlayerBattler(petSpeciesId, petStats, petEVs, focusXp, SHOP_ITEMS, equippedTool)
    if (!wild || !player) return
    const wildName = getPokemon(wild.speciesId)?.speciesName ?? wild.speciesId
    // 배틀이 실제로 열릴 때 조우권을 쓰고, 만난 종을 도감에 적는다
    const tickets = encounterTickets - 1
    const seen = seenSpecies.includes(wild.speciesId) ? seenSpecies : [...seenSpecies, wild.speciesId]
    saveMany({ encounterTickets: tickets, seenSpecies: seen })
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ encounterTickets: tickets, seenSpecies: seen })
    set({
      encounterTickets: tickets,
      seenSpecies: seen,
      wildBattle: {
        wild,
        player,
        turn: 1,
        phase: 'selecting',
        logLines: [`야생 ${wildName}이(가) 나타났다!`],
        result: null,
        weather: null,
        weatherTurns: 0,
      },
    })
  },

  executePlayerMove: (moveName) => {
    const { wildBattle } = get()
    if (!wildBattle || wildBattle.phase !== 'selecting') return
    const { frames, pointsGained } = processTurn(wildBattle, moveName)
    if (!frames.length) return
    set({
      wildBattle: {
        ...wildBattle,
        phase: 'animating',
        pendingFrames: frames,
        frameIndex: 0,
        pendingPointsGained: pointsGained,
        logLines: [],
      },
    })
  },

  advanceBattleFrame: () => {
    const { wildBattle } = get()
    if (!wildBattle || wildBattle.phase !== 'animating') return
    const { pendingFrames, frameIndex = 0, logLines = [], pendingPointsGained = 0 } = wildBattle
    if (!pendingFrames || frameIndex >= pendingFrames.length) return

    const frame   = pendingFrames[frameIndex]
    const nextIdx = frameIndex + 1
    const isLast  = nextIdx >= pendingFrames.length
    const newLogLines = frame.addLog ? [...logLines, frame.addLog] : logLines

    const newBattle = {
      ...wildBattle,
      wild:         frame.wild,
      player:       frame.player,
      weather:      frame.weather ?? wildBattle.weather ?? null,
      weatherTurns: frame.weatherTurns ?? wildBattle.weatherTurns ?? 0,
      logLines:     newLogLines,
      phase:        frame.phase,
      result:       frame.result,
      ballState:    frame.ballState ?? null,
      frameIndex:   nextIdx,
      pendingFrames: isLast ? null : pendingFrames,
      // Increment turn counter when a selecting frame is the last one
      turn: (isLast && frame.phase === 'selecting') ? wildBattle.turn + 1 : wildBattle.turn,
      // 승리 문구에 실제로 받은 포인트를 보여 주려고 남긴다
      pointsGained: isLast && pendingPointsGained > 0 ? pendingPointsGained : (wildBattle.pointsGained ?? 0),
    }
    set({ wildBattle: newBattle })

    if (isLast) {
      // Save HP/PP to petStats
      const { petStats } = get()
      if (petStats && frame.player) {
        const updatedPetStats = {
          ...petStats,
          currentHP: frame.player.hp,
          movePP: { ...petStats.movePP, ...frame.player.movePP },
        }
        set({ petStats: updatedPetStats })
        saveToStore('petStats', updatedPetStats)
        if (window.electronAPI) window.electronAPI.sendStateUpdate({ petStats: updatedPetStats })
      }
      if (pendingPointsGained > 0) get().addPoints(pendingPointsGained)

      // 포획 성공 시 보관함에 저장
      if (frame.result === 'caught') {
        const { caughtPokemon } = get()
        const wild = frame.wild
        if (wild) {
          const caughtData = {
            speciesId: wild.speciesId,
            dexNum: wild.dexNum,
            level: wild.level,
            natureName: wild.natureName ?? '개구쟁이',
            abilityName: wild.abilityName ?? null,
            ivs: wild.ivs ?? {},
            moves: [...wild.moves],
            learnedPool: wild.learnedPool ? [...wild.learnedPool] : [...wild.moves],
            evs: { HP: 0, 공격: 0, 방어: 0, 특수공격: 0, 특수방어: 0, 스피드: 0 },
            currentHP: null,
            movePP: null,
            caughtAt: Date.now(),
          }
          const newCaught = [...caughtPokemon, caughtData]
          set({ caughtPokemon: newCaught })
          saveToStore('caughtPokemon', newCaught)
        }
      }
    }
  },

  fleeFromBattle: () => {
    const { wildBattle, petStats } = get()
    if (!wildBattle || wildBattle.phase !== 'selecting') return
    set({
      wildBattle: { ...wildBattle, phase: 'ended', result: 'flee', logLines: [...(wildBattle.logLines || []), '도망쳤다!'] },
    })
    if (petStats && wildBattle.player) {
      const updatedPetStats = {
        ...petStats,
        currentHP: wildBattle.player.hp,
        movePP: { ...petStats.movePP, ...wildBattle.player.movePP },
      }
      set({ petStats: updatedPetStats })
      saveToStore('petStats', updatedPetStats)
      if (window.electronAPI) window.electronAPI.sendStateUpdate({ petStats: updatedPetStats })
    }
  },

  dismissBattle: () => {
    set({ wildBattle: null })
  },

  healAtCenter: () => {
    const { petStats, spendPoints } = get()
    if (!petStats) return
    if (!spendPoints(20)) return
    const updatedPetStats = { ...petStats, currentHP: null, movePP: null }
    set({ petStats: updatedPetStats })
    saveToStore('petStats', updatedPetStats)
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ petStats: updatedPetStats })
  },

  resetAllData: async () => {
    if (window.electronAPI) await window.electronAPI.clearStore()
    set({ ...DEFAULT_STATE, initialized: true })
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ ...DEFAULT_STATE })
    }
  },

  // 설정의 "백업에서 되돌리기". 성공하면 Rust 가 두 창에 store-reloaded 를 보내 다시 읽게 한다
  restoreBackup: async () => {
    if (!window.electronAPI) return false
    return window.electronAPI.restoreBackup()
  },

  // 다른 창에서 state-sync IPC로 받은 데이터를 store에 병합
  // allowed 키 목록으로 필터링해 알 수 없는 키가 store를 오염시키지 않도록 방어
  syncFromOtherWindow: (data) => {
    const allowed = [
      'points', 'totalPointsEarned', 'purchasedItems',
      'pomodoroHistory', 'petState', 'preEvolvingState', 'lastActiveTime', 'totalWorkMinutes',
      'petSpeciesId', 'petStats', 'petName', 'petEVs', 'ownedTMs', 'equippedTool',
      'ballInventory', 'caughtPokemon',
      'focusXp', 'encounterTickets', 'ticketMinutes', 'seenSpecies', 'focusSession', 'focusResult',
    ]
    const safe = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)))
    if (Object.keys(safe).length > 0) set(safe)
  },
}))

export default useStore
