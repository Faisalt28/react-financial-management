import { create } from 'zustand'
import { db } from '../lib/db.js'
import { useAuthStore } from './authStore.js'
import { getMonth, getYear } from 'date-fns'

const getUserId = () => useAuthStore.getState().user?.id

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,

  fetchBudgets: async (month, year) => {
    const userId = getUserId()
    if (!userId) {
      set({ budgets: [], loading: false })
      return
    }
    set({ loading: true })
    const now = new Date()
    const m = month ?? getMonth(now)
    const y = year ?? getYear(now)
    const all = await db.budgets.where('userId').equals(userId).toArray()
    const budgets = all.filter(b => b.month === m && b.year === y)
    set({ budgets, loading: false })
  },

  addBudget: async (data) => {
    const userId = getUserId()
    const all = await db.budgets.where('userId').equals(userId).toArray()
    const existing = all.find(b => b.categoryId === data.categoryId && b.month === data.month && b.year === data.year)
    if (existing) {
      await db.budgets.update(existing.id, { amount: Number(data.amount) || 0 })
    } else {
      await db.budgets.add({ ...data, userId, amount: Number(data.amount) || 0 })
    }
    await get().fetchBudgets(data.month, data.year)
  },

  updateBudget: async (id, data) => {
    await db.budgets.update(id, data)
    await get().fetchBudgets()
  },

  deleteBudget: async (id) => {
    await db.budgets.delete(id)
    await get().fetchBudgets()
  },

  getAllBudgets: async () => {
    const userId = getUserId()
    if (!userId) return []
    return await db.budgets.where('userId').equals(userId).toArray()
  },

  resetStore: () => {
    set({ budgets: [], loading: false })
  }
}))
