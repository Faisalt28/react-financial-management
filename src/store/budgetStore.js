import { create } from 'zustand'
import { api } from '../lib/api'
import { getMonth, getYear } from 'date-fns'

const normalizeBudget = (b) => ({
  ...b,
  categoryId: b.categoryId || b.category_id,
  month: Number(b.month),
  year: Number(b.year),
  amount: Number(b.amount) || 0,
})

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,

  fetchBudgets: async (month, year) => {
    set({ loading: true })
    const now = new Date()
    const m = month ?? getMonth(now)
    const y = year ?? getYear(now)

    try {
      const { budgets } = await api.budgets.getAll(m, y)
      const normalized = (budgets || []).map(normalizeBudget)
      set({ budgets: normalized, loading: false })
    } catch (err) {
      set({ budgets: [], loading: false })
    }
  },

  addBudget: async (data) => {
    const payload = {
      categoryId: data.categoryId,
      month: data.month,
      year: data.year,
      amount: Number(data.amount) || 0,
    }
    await api.budgets.create(payload)
    await get().fetchBudgets(data.month, data.year)
  },

  updateBudget: async (id, data) => {
    await api.budgets.update(id, data)
    await get().fetchBudgets()
  },

  deleteBudget: async (id) => {
    await api.budgets.delete(id)
    await get().fetchBudgets()
  },

  getAllBudgets: async () => {
    try {
      const { budgets } = await api.budgets.getAll()
      return (budgets || []).map(normalizeBudget)
    } catch (err) {
      return []
    }
  },

  resetStore: () => {
    set({ budgets: [], loading: false })
  }
}))
