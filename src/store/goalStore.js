import { create } from 'zustand'
import { api } from '../lib/api'

const normalizeGoal = (g) => ({
  ...g,
  targetAmount: Number(g.targetAmount ?? g.target_amount ?? 0),
  currentAmount: Number(g.currentAmount ?? g.current_amount ?? 0),
  createdAt: g.createdAt || g.created_at,
})

export const useGoalStore = create((set, get) => ({
  goals: [],
  loading: false,

  fetchGoals: async () => {
    set({ loading: true })
    try {
      const { goals } = await api.goals.getAll()
      const normalized = (goals || []).map(normalizeGoal)
      set({ goals: normalized, loading: false })
    } catch (err) {
      set({ goals: [], loading: false })
    }
  },

  addGoal: async (data) => {
    const payload = {
      name: data.name,
      targetAmount: Number(data.targetAmount) || 0,
      currentAmount: Number(data.currentAmount) || 0,
      deadline: data.deadline || null,
      color: data.color || '#6366f1',
      icon: data.icon || '🎯',
    }
    const { goal } = await api.goals.create(payload)
    await get().fetchGoals()
    return goal?.id
  },

  addContribution: async (goalId, amount) => {
    const goal = get().goals.find(g => g.id === goalId)
    if (!goal) return
    const addAmt = Number(amount) || 0
    const newAmount = goal.currentAmount + addAmt
    await api.goals.update(goalId, {
      currentAmount: newAmount,
    })
    await get().fetchGoals()
  },

  updateGoal: async (id, data) => {
    await api.goals.update(id, data)
    await get().fetchGoals()
  },

  deleteGoal: async (id) => {
    await api.goals.delete(id)
    await get().fetchGoals()
  },

  resetStore: () => {
    set({ goals: [], loading: false })
  }
}))
