import { create } from 'zustand'
import { calcLevel, getPokemon } from '../data/pokemon'

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
  equippedItems: [],
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
        if (pokemon.evolveAt && newLevel >= pokemon.evolveAt) {
          update.petState = 'evolving'
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
      window.electronAPI.sendStateUpdate(syncData)
    }

    // happy 상태 2초 후 이전 상태로 복귀 (진화 중이면 스킵)
    if (showHappy && update.petState !== 'evolving') {
      setTimeout(() => {
        set(s => {
          if (s.petState === 'happy') {
            return { petState: prevState === 'happy' ? 'idle' : prevState }
          }
          return {}
        })
        if (window.electronAPI) {
          window.electronAPI.sendStateUpdate({ petState: prevState === 'happy' ? 'idle' : prevState })
        }
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
  // 새 종 ID로 교체하고 petStats를 null로 초기화 (PokemonStats에서 새 스탯 생성)
  confirmEvolution: () => {
    const { petSpeciesId } = get()
    const pokemon = getPokemon(petSpeciesId)
    if (!pokemon || !pokemon.evolveTo) return
    const newSpeciesId = pokemon.evolveTo
    set({ petSpeciesId: newSpeciesId, petStats: null, petState: 'happy' })
    saveToStore('petSpeciesId', newSpeciesId)
    saveToStore('petStats', null)
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petSpeciesId: newSpeciesId })
    }
    setTimeout(() => {
      set(s => {
        if (s.petState === 'happy') return { petState: 'idle' }
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

  toggleEquipItem: (itemId) => {
    const { equippedItems, purchasedItems } = get()
    if (!purchasedItems.includes(itemId)) return

    let newEquipped
    if (equippedItems.includes(itemId)) {
      newEquipped = equippedItems.filter(id => id !== itemId)
    } else {
      newEquipped = [...equippedItems, itemId]
    }
    set({ equippedItems: newEquipped })
    saveToStore('equippedItems', newEquipped)
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ equippedItems: newEquipped })
    }
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
    addPoints(20)
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
    addPoints(50)
  },

  // 집중 타이머 실행 중 1분마다 호출 (happy 애니메이션 없이 조용히 +1pt)
  addWorkMinute: () => {
    const { totalWorkMinutes, addPoints } = get()
    const newTotal = totalWorkMinutes + 1
    set({ totalWorkMinutes: newTotal, lastActiveTime: Date.now() })
    saveToStore('totalWorkMinutes', newTotal)
    addPoints(1, false)
  },

  // petState 변경 + 다른 창에 동기화
  setPetState: (state) => {
    set({ petState: state })
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petState: state })
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

  setPetName: (name) => {
    set({ petName: name })
    saveToStore('petName', name)
    if (window.electronAPI) window.electronAPI.sendStateUpdate({ petName: name })
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
      'points', 'totalPointsEarned', 'purchasedItems', 'equippedItems',
      'todos', 'pomodoroHistory', 'petState', 'lastActiveTime', 'totalWorkMinutes',
      'petSpeciesId', 'petStats', 'petName', 'petEVs', 'ownedTMs', 'equippedTool',
    ]
    const safe = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)))
    if (Object.keys(safe).length > 0) set(safe)
  },
}))

export default useStore
