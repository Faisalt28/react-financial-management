import { create } from 'zustand'
import { api } from '../lib/api'
import { useAccountStore } from './accountStore'
import { getMonth, getYear } from 'date-fns'

const normalizeTx = (t) => ({
  ...t,
  categoryId: t.categoryId || t.category_id,
  accountId: t.accountId || t.account_id,
  toAccountId: t.toAccountId || t.to_account_id,
})

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true })
    try {
      const { transactions } = await api.transactions.getAll()
      const normalized = (transactions || []).map(normalizeTx)
      set({ transactions: normalized, loading: false })
    } catch (err) {
      set({ transactions: [], loading: false })
    }
  },

  addTransaction: async (data) => {
    const payload = {
      ...data,
      categoryId: data.categoryId,
      accountId: data.accountId,
      toAccountId: data.toAccountId,
      amount: Number(data.amount) || 0,
    }
    const { transaction } = await api.transactions.create(payload)
    await get().fetchTransactions()
    // Sync account balance
    await useAccountStore.getState().fetchAccounts()
    return transaction?.id
  },

  updateTransaction: async (id, data) => {
    const payload = {
      ...data,
      categoryId: data.categoryId,
      accountId: data.accountId,
      toAccountId: data.toAccountId,
      amount: Number(data.amount) || 0,
    }
    await api.transactions.update(id, payload)
    await get().fetchTransactions()
    // Sync account balance
    await useAccountStore.getState().fetchAccounts()
  },

  deleteTransaction: async (id) => {
    await api.transactions.delete(id)
    await get().fetchTransactions()
    // Sync account balance
    await useAccountStore.getState().fetchAccounts()
  },

  // Computed: get this month's summary
  getMonthSummary: (month, year) => {
    const { transactions } = get()
    const now = new Date()
    const m = month ?? getMonth(now)
    const y = year ?? getYear(now)
    const filtered = transactions.filter(tx => {
      const d = new Date(tx.date)
      return getMonth(d) === m && getYear(d) === y
    })
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0)
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0)
    return { income, expense, net: income - expense, count: filtered.length }
  },

  // Computed: get transactions for a specific account
  getByAccount: (accountId) => {
    return get().transactions.filter(t => t.accountId === accountId || t.toAccountId === accountId)
  },

  // Computed: spending by category this month
  getSpendingByCategory: (month, year) => {
    const { transactions } = get()
    const now = new Date()
    const m = month ?? getMonth(now)
    const y = year ?? getYear(now)
    const filtered = transactions.filter(tx => {
      const d = new Date(tx.date)
      return tx.type === 'expense' && getMonth(d) === m && getYear(d) === y
    })
    const map = {}
    filtered.forEach(tx => {
      map[tx.categoryId] = (map[tx.categoryId] || 0) + (Number(tx.amount) || 0)
    })
    return map
  },

  resetStore: () => {
    set({ transactions: [], loading: false })
  }
}))
