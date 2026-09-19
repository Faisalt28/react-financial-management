import { create } from 'zustand'
import { api } from '../lib/api'

export const useAccountStore = create((set, get) => ({
  accounts: [],
  loading: false,

  fetchAccounts: async () => {
    set({ loading: true })
    try {
      const { accounts } = await api.accounts.getAll()
      set({ accounts: accounts || [], loading: false })
    } catch (err) {
      set({ accounts: [], loading: false })
    }
  },

  addAccount: async (data) => {
    const { account } = await api.accounts.create(data)
    await get().fetchAccounts()
    return account?.id
  },

  updateAccount: async (id, data) => {
    await api.accounts.update(id, data)
    await get().fetchAccounts()
  },

  deleteAccount: async (id) => {
    await api.accounts.delete(id)
    await get().fetchAccounts()
  },

  getTotalBalance: () => {
    return get().accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0)
  },

  resetStore: () => {
    set({ accounts: [], loading: false })
  }
}))
