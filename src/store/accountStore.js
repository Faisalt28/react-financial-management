import { create } from 'zustand'
import { db } from '../lib/db.js'
import { useAuthStore } from './authStore.js'

const getUserId = () => useAuthStore.getState().user?.id

export const useAccountStore = create((set, get) => ({
  accounts: [],
  loading: false,

  fetchAccounts: async () => {
    const userId = getUserId()
    if (!userId) {
      set({ accounts: [], loading: false })
      return
    }
    set({ loading: true })
    const accounts = await db.accounts.where('userId').equals(userId).toArray()
    set({ accounts, loading: false })
  },

  addAccount: async (data) => {
    const userId = getUserId()
    const id = await db.accounts.add({
      ...data,
      userId,
      balance: Number(data.balance) || 0,
      createdAt: new Date().toISOString()
    })
    await get().fetchAccounts()
    return id
  },

  updateAccount: async (id, data) => {
    await db.accounts.update(id, data)
    await get().fetchAccounts()
  },

  deleteAccount: async (id) => {
    await db.accounts.delete(id)
    await get().fetchAccounts()
  },

  getTotalBalance: () => {
    return get().accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0)
  },

  resetStore: () => {
    set({ accounts: [], loading: false })
  }
}))
