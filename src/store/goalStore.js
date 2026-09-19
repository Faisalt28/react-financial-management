import { create } from 'zustand'
import { db } from '../lib/db.js'
import { useAuthStore } from './authStore.js'

const getUserId = () => useAuthStore.getState().user?.id

export const useGoalStore = create((set, get) => ({
  goals: [],
  loading: false,

  fetchGoals: async () => {
    const userId = getUserId()
    if (!userId) {
      set({ goals: [], loading: false })
      return
    }
    set({ loading: true })
    const all = await db.goals.where('userId').equals(userId).toArray()
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    set({ goals: all, loading: false })
  },

  addGoal: async (data) => {
    const userId = getUserId()
    const id = await db.goals.add({
      ...data,
      userId,
      targetAmount: Number(data.targetAmount) || 0,
      currentAmount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    await get().fetchGoals()
    return id
  },

  addContribution: async (goalId, amount) => {
    const goal = await db.goals.get(goalId)
    if (!goal) return
    const addAmt = Number(amount) || 0
    const newAmount = (Number(goal.currentAmount) || 0) + addAmt
    const status = newAmount >= (Number(goal.targetAmount) || 0) ? 'completed' : 'active'
    await db.goals.update(goalId, { currentAmount: newAmount, status })
    await get().fetchGoals()
  },

  updateGoal: async (id, data) => {
    await db.goals.update(id, data)
    await get().fetchGoals()
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id)
    await get().fetchGoals()
  },

  resetStore: () => {
    set({ goals: [], loading: false })
  }
}))
