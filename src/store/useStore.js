import { create } from 'zustand'
import { calcLevel, getPokemon } from '../data/pokemon'

const DEFAULT_STATE = {
  points: 0,
  totalPointsEarned: 0,
  purchasedItems: [],
  equippedItems: [],
  todos: [],
  pomodoroHistory: [],
  petState: 'idle', // idle | happy | working | sleeping | evolving
  lastActiveTime: Date.now(),
  totalWorkMinutes: 0,
  petSpeciesId: null,
  petStats: null, // { speciesId, ivs, natureName, moves, learnedPool, abilityName }
  petName: null,
  petEVs: { HP: 0, 공격: 0, 방어: 0, 특수공격: 0, 특수방어: 0, 스피드: 0 },
  ownedTMs: [],
  equippedTool: null,
}

async function loadFromStore() {
  if (!window.electronAPI) return DEFAULT_STATE
  try {
    const saved = await window.electronAPI.getAllStore()
    return saved && Object.keys(saved).length > 0 ? { ...DEFAULT_STATE, ...saved } : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

function saveToStore(key, value) {
  if (!window.electronAPI) return
  try {
    window.electronAPI.setStoreSync(key, value)
  } catch (e) {
    console.error('Failed to save to store:', e)
  }
}

const useStore = create((set, get) => ({
  ...DEFAULT_STATE,
  initialized: false,

  initialize: async () => {
    const saved = await loadFromStore()
    set({ ...saved, initialized: true })
  },

  addPoints: (amount, showHappy = true) => {
    const state = get()
    const prevState = state.petState
    const newPoints = state.points + amount
    const newTotalEarned = (state.totalPointsEarned || 0) + amount
    const prevLevel = calcLevel(state.totalPointsEarned || 0)
    const newLevel = calcLevel(newTotalEarned)

    saveToStore('points', newPoints)
    saveToStore('totalPointsEarned', newTotalEarned)

    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ points: newPoints, totalPointsEarned: newTotalEarned })
    }

    const update = {
      points: newPoints,
      totalPointsEarned: newTotalEarned,
      lastActiveTime: Date.now(),
      ...(showHappy ? { petState: 'happy' } : {}),
    }

    // Check for evolution on level-up
    if (newLevel > prevLevel && state.petSpeciesId) {
      const pokemon = getPokemon(state.petSpeciesId)
      if (pokemon && pokemon.evolveAt && newLevel >= pokemon.evolveAt) {
        update.petState = 'evolving'
      }
    }

    set(update)

    // Reset happy state after 2s (unless evolving)
    if (showHappy && update.petState !== 'evolving') {
      setTimeout(() => {
        set(s => {
          if (s.petState === 'happy') {
            return { petState: prevState === 'happy' ? 'idle' : prevState }
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

  selectStarter: (speciesId) => {
    set({ petSpeciesId: speciesId, petStats: null })
    saveToStore('petSpeciesId', speciesId)
    saveToStore('petStats', null)
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ petSpeciesId: speciesId })
    }
  },

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
    // Return to idle after happy animation
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
    addPoints(20)
  },

  deleteTodo: (id) => {
    const { todos } = get()
    const newTodos = todos.filter(t => t.id !== id)
    set({ todos: newTodos })
    saveToStore('todos', newTodos)
  },

  addPomodoroSession: () => {
    const { pomodoroHistory, addPoints } = get()
    const session = {
      id: Date.now(),
      completedAt: Date.now(),
      durationMinutes: 25,
    }
    const newHistory = [...pomodoroHistory, session]
    set({ pomodoroHistory: newHistory, lastActiveTime: Date.now() })
    saveToStore('pomodoroHistory', newHistory)
    addPoints(50)
  },

  addWorkMinute: () => {
    const { totalWorkMinutes, addPoints } = get()
    const newTotal = totalWorkMinutes + 1
    set({ totalWorkMinutes: newTotal, lastActiveTime: Date.now() })
    saveToStore('totalWorkMinutes', newTotal)
    addPoints(1, false) // 매분 포인트는 happy 애니메이션 없이 조용히 추가
  },

  setPetState: (state) => {
    set({ petState: state })
  },

  setPetSpecies: (speciesId) => {
    set({ petSpeciesId: speciesId, petStats: null })
    saveToStore('petSpeciesId', speciesId)
    saveToStore('petStats', null)
  },

  setPetStats: (stats) => {
    set({ petStats: stats })
    saveToStore('petStats', stats)
  },

  setPetName: (name) => {
    set({ petName: name })
    saveToStore('petName', name)
  },

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

  useTM: (moveName) => {
    const { petStats } = get()
    if (!petStats) return
    const pool = petStats.learnedPool || petStats.moves || []
    if (pool.includes(moveName)) return
    const newStats = { ...petStats, learnedPool: [...pool, moveName] }
    set({ petStats: newStats })
    saveToStore('petStats', newStats)
  },

  swapMove: (activeIdx, newMoveName) => {
    const { petStats } = get()
    if (!petStats) return
    const newMoves = [...petStats.moves]
    newMoves[activeIdx] = newMoveName
    const newStats = { ...petStats, moves: newMoves }
    set({ petStats: newStats })
    saveToStore('petStats', newStats)
  },

  resetAllData: async () => {
    if (window.electronAPI) await window.electronAPI.clearStore()
    set({ ...DEFAULT_STATE, initialized: true })
    if (window.electronAPI) {
      window.electronAPI.sendStateUpdate({ ...DEFAULT_STATE })
    }
  },

  checkSleepState: () => {
    const { lastActiveTime, petState } = get()
    const thirtyMinutes = 30 * 60 * 1000
    if (Date.now() - lastActiveTime > thirtyMinutes && petState !== 'sleeping') {
      set({ petState: 'sleeping' })
    }
  },

  syncFromOtherWindow: (data) => {
    set(state => ({ ...state, ...data }))
  },
}))

export default useStore
