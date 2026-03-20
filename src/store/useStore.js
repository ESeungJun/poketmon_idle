import { create } from 'zustand'
import { calcLevel, getPokemon, pickWildEncounter, getMovesUpToLevel } from '../data/pokemon'
import { buildWildBattler, buildPlayerBattler, processTurn, processWildOnlyTurn, calcCatchRate, generatePetStats } from '../data/battleEngine'
import { SHOP_ITEMS } from '../components/Shop/items'

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

const DEFAULT_STATE = {
  points: 0,
  totalPointsEarned: 0,
  purchasedItems: [],
  todos: [],
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
  wildBattle: null, // in-memory only, not persisted
}

// 앱 시작 시 electron-store에서 저장된 데이터를 로드
// electron 환경이 아니면(브라우저 개발 등) 기본값 반환
async function loadFromStore() {
  if (!window.electronAPI) return DEFAULT_STATE
  try {
    const saved = await window.electronAPI.getAllStore()
    return saved && Object.keys(saved).length > 0 ? { ...DEFAULT_STATE, ...saved } : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

// 비동기로 electron-store에 단일 키 저장
// ipcRenderer.invoke('set-store')는 Promise를 반환하지만
// store 업데이트를 블로킹할 필요가 없으므로 에러만 로깅하고 무시
function saveToStore(key, value) {
  if (!window.electronAPI) return
  window.electronAPI.setStoreAsync(key, value).catch(e => {
    console.error('Failed to save to store:', e)
  })
}

const useStore = create((set, get) => ({
  ...DEFAULT_STATE,
  initialized: false,

  initialize: async () => {
    const saved = await loadFromStore()
    set({ ...saved, initialized: true })
  },

  // 포인트 추가 + 레벨업/진화 체크
  // showHappy: false이면 happy 애니메이션 없이 조용히 추가 (집중 중 1분마다 +1pt)
  addPoints: (amount, showHappy = true) => {
    const state = get()
    const prevState = state.petState
    const newPoints = state.points + amount
    const newTotalEarned = (state.totalPointsEarned || 0) + amount

    // 레벨 계산은 totalPointsEarned 기준 (points를 소비해도 레벨은 유지됨)
    const prevLevel = calcLevel(state.totalPointsEarned || 0)
    const newLevel = calcLevel(newTotalEarned)

    saveToStore('points', newPoints)
    saveToStore('totalPointsEarned', newTotalEarned)

    const update = {
      points: newPoints,
      totalPointsEarned: newTotalEarned,
      lastActiveTime: Date.now(),
      ...(showHappy ? { petState: 'happy' } : {}),
    }

    // 레벨업 발생 시 진화 체크 및 신규 기술 습득 처리
    if (newLevel > prevLevel && state.petSpeciesId) {
      const pokemon = getPokemon(state.petSpeciesId)
      if (pokemon) {
        // 진화 조건 충족 시 evolving 상태 전환 (App.jsx에서 3초 후 confirmEvolution 호출)
        // 이미 진화 레벨을 넘겼어도 레벨업 시 진화 (한 단계씩)
        if (pokemon.evolveAt && newLevel >= pokemon.evolveAt) {
          update.petState = 'evolving'
          update.preEvolvingState = prevState === 'happy' ? 'idle' : prevState
        }
        const updatedStats = applyLevelUpMoves(state.petStats, pokemon, prevLevel, newLevel)
        if (updatedStats) {
          update.petStats = updatedStats
          saveToStore('petStats', updatedStats)
        }
      }
    }

    set(update)

    // 변경된 필드만 골라 다른 창에 동기화
    if (window.electronAPI) {
      const syncData = { points: newPoints, totalPointsEarned: newTotalEarned }
      if (update.petState) syncData.petState = update.petState
      if (update.petStats) syncData.petStats = update.petStats
      if (update.preEvolvingState !== undefined) syncData.preEvolvingState = update.preEvolvingState
      window.electronAPI.sendStateUpdate(syncData)
    }

    // happy 상태 2초 후 이전 상태로 복귀 (진화 중이면 스킵)
    if (showHappy && update.petState !== 'evolving') {
      setTimeout(() => {
        set(s => {
          if (s.petState === 'happy') {
            const nextState = prevState === 'happy' ? 'idle' : prevState
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
    set({ petSpeciesId: speciesId, petStats: null })
    saveToStore('petSpeciesId', speciesId)
    saveToStore('petStats', null)
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petSpeciesId: speciesId })
      window.electronAPI.notifyStarterSelected()  // main에 알려 펫 창 표시
    }
  },

  // 진화 확정: App.jsx에서 evolving 상태 3초 후 호출
  // 새 종 ID로 교체하고 petStats의 speciesId만 갱신 (성격·특성·개체값은 유지)
  confirmEvolution: () => {
    const { petSpeciesId, petStats, preEvolvingState, totalPointsEarned } = get()
    const prevState = preEvolvingState || 'idle'
    const pokemon = getPokemon(petSpeciesId)
    if (!pokemon || !pokemon.evolveTo) return
    const newSpeciesId = pokemon.evolveTo
    const newPokemon = getPokemon(newSpeciesId)
    let newPetStats = petStats
      ? { ...petStats, speciesId: newSpeciesId }
      : null
    // 진화형의 현재 레벨 이하 기술을 learnedPool에 추가
    if (newPetStats && newPokemon) {
      const currentLevel = Math.max(1, calcLevel(totalPointsEarned || 0))
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
    set({ petSpeciesId: newSpeciesId, petStats: newPetStats, petState: 'happy', preEvolvingState: null })
    saveToStore('petSpeciesId', newSpeciesId)
    saveToStore('petStats', newPetStats)
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petSpeciesId: newSpeciesId, petState: 'happy', petStats: newPetStats })
    }
    setTimeout(() => {
      set(s => {
        if (s.petState === 'happy') {
          if (window.electronAPI) window.electronAPI.sendStateUpdate({ petState: prevState })
          return { petState: prevState }
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

  addTodo: (text) => {
    const { todos } = get()
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: Date.now(),
    }
    const newTodos = [...todos, newTodo]
    set({ todos: newTodos })
    saveToStore('todos', newTodos)
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ todos: newTodos })
  },

  completeTodo: (id) => {
    const { todos, addPoints } = get()
    const todo = todos.find(t => t.id === id)
    if (!todo || todo.completed) return

    const newTodos = todos.map(t =>
      t.id === id ? { ...t, completed: true, completedAt: Date.now() } : t
    )
    set({ todos: newTodos, lastActiveTime: Date.now() })
    saveToStore('todos', newTodos)
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ todos: newTodos })
    addPoints(30)
  },

  deleteTodo: (id) => {
    const { todos } = get()
    const newTodos = todos.filter(t => t.id !== id)
    set({ todos: newTodos })
    saveToStore('todos', newTodos)
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ todos: newTodos })
  },

  addPomodoroSession: () => {
    const { pomodoroHistory, addPoints } = get()
    const session = {
      id: Date.now(),
      completedAt: Date.now(),
      durationMinutes: 25,
    }
    // 최근 100개만 유지해 store 비대화 방지
    const newHistory = [...pomodoroHistory, session].slice(-100)
    set({ pomodoroHistory: newHistory, lastActiveTime: Date.now() })
    saveToStore('pomodoroHistory', newHistory)
    addPoints(75)
  },

  // 집중 타이머 실행 중 1분마다 호출 (happy 애니메이션 없이 조용히 +2pt)
  addWorkMinute: () => {
    const { totalWorkMinutes, addPoints } = get()
    const newTotal = totalWorkMinutes + 1
    set({ totalWorkMinutes: newTotal, lastActiveTime: Date.now() })
    saveToStore('totalWorkMinutes', newTotal)
    addPoints(2, false)
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
    saveToStore('petSpeciesId', speciesId)
    saveToStore('petStats', null)
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
    saveToStore('petStats', newStats)
    saveToStore('petName', name)
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
    const { wildBattle, ballInventory } = get()
    if (!wildBattle || wildBattle.phase !== 'selecting') return
    if ((ballInventory[ballId] || 0) <= 0) return

    const { wild, player } = wildBattle
    const wildPokemon = getPokemon(wild.speciesId)
    const wildName = wildPokemon?.speciesName ?? wild.speciesId

    const catchRate = calcCatchRate(wild.hp, wild.maxHP, ballModifier)
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
    const { caughtPokemon, petSpeciesId, petStats, petName, petEVs, totalPointsEarned, wildBattle } = get()
    if (wildBattle) return  // 배틀 중 교체 금지
    if (boxIndex < 0 || boxIndex >= caughtPokemon.length) return
    if (!petSpeciesId) return

    const boxPoke = caughtPokemon[boxIndex]
    const playerLevel = Math.max(1, calcLevel(totalPointsEarned || 0))

    // 현재 파트너 → 보관함에 저장
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
      caughtAt: Date.now(),
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
    saveToStore('petSpeciesId', newSpeciesId)
    saveToStore('petStats', newPetStats)
    saveToStore('petName', newNickname)
    saveToStore('petEVs', newEVs)
    saveToStore('caughtPokemon', newCaught)
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
    const { petSpeciesId, petEVs, totalPointsEarned, spendPoints } = get()
    let { petStats } = get()
    if (!petSpeciesId) return
    if (!spendPoints(10)) return
    const playerLevel = Math.max(1, calcLevel(totalPointsEarned || 0))
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
    const player = buildPlayerBattler(petSpeciesId, petStats, petEVs, totalPointsEarned, SHOP_ITEMS)
    if (!wild || !player) return
    const wildName = getPokemon(wild.speciesId)?.speciesName ?? wild.speciesId
    set({
      wildBattle: {
        wild,
        player,
        turn: 1,
        phase: 'selecting',
        logLines: [`야생 ${wildName}이(가) 나타났다!`],
        result: null,
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
      wild:     frame.wild,
      player:   frame.player,
      logLines: newLogLines,
      phase:    frame.phase,
      result:   frame.result,
      ballState: frame.ballState ?? null,
      frameIndex: nextIdx,
      pendingFrames: isLast ? null : pendingFrames,
      // Increment turn counter when a selecting frame is the last one
      turn: (isLast && frame.phase === 'selecting') ? wildBattle.turn + 1 : wildBattle.turn,
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

  // 다른 창에서 state-sync IPC로 받은 데이터를 store에 병합
  // allowed 키 목록으로 필터링해 알 수 없는 키가 store를 오염시키지 않도록 방어
  syncFromOtherWindow: (data) => {
    const allowed = [
      'points', 'totalPointsEarned', 'purchasedItems',
      'todos', 'pomodoroHistory', 'petState', 'preEvolvingState', 'lastActiveTime', 'totalWorkMinutes',
      'petSpeciesId', 'petStats', 'petName', 'petEVs', 'ownedTMs', 'equippedTool',
      'ballInventory', 'caughtPokemon',
    ]
    const safe = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)))
    if (Object.keys(safe).length > 0) set(safe)
  },
}))

export default useStore
