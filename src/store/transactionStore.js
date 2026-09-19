import { create } from 'zustand'
import { db } from '../lib/db.js'
import { useAuthStore } from './authStore.js'
import { getMonth, getYear } from 'date-fns'

const getUserId = () => useAuthStore.getState().user?.id

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async () => {
    const userId = getUserId()
    if (!userId) {
      set({ transactions: [], loading: false })
      return
    }
    set({ loading: true })
    const all = await db.transactions.where('userId').equals(userId).toArray()
    all.sort((a, b) => new Date(b.date) - new Date(a.date))
    set({ transactions: all, loading: false })
  },

  addTransaction: async (data) => {
    const userId = getUserId()
    const amount = Number(data.amount) || 0
    const id = await db.transactions.add({
      ...data,
      amount,
      userId,
      createdAt: new Date().toISOString(),
    })
    // Update account balance
    if (data.type === 'expense') {
      await db.accounts.where('id').equals(data.accountId).modify(acc => {
        acc.balance = (Number(acc.balance) || 0) - amount
      })
    } else if (data.type === 'income') {
      await db.accounts.where('id').equals(data.accountId).modify(acc => {
        acc.balance = (Number(acc.balance) || 0) + amount
      })
    } else if (data.type === 'transfer') {
      await db.accounts.where('id').equals(data.accountId).modify(acc => {
        acc.balance = (Number(acc.balance) || 0) - amount
      })
      await db.accounts.where('id').equals(data.toAccountId).modify(acc => {
        acc.balance = (Number(acc.balance) || 0) + amount
      })
    }
    await get().fetchTransactions()
    return id
  },

  updateTransaction: async (id, data) => {
    const oldTx = await db.transactions.get(id)
    if (oldTx) {
      const oldAmount = Number(oldTx.amount) || 0
      // Revert old effect
      if (oldTx.type === 'expense') {
        await db.accounts.where('id').equals(oldTx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) + oldAmount
        })
      } else if (oldTx.type === 'income') {
        await db.accounts.where('id').equals(oldTx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) - oldAmount
        })
      } else if (oldTx.type === 'transfer') {
        await db.accounts.where('id').equals(oldTx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) + oldAmount
        })
        await db.accounts.where('id').equals(oldTx.toAccountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) - oldAmount
        })
      }

      // Apply new effect
      const newTx = { ...oldTx, ...data, amount: Number(data.amount !== undefined ? data.amount : oldTx.amount) || 0 }
      const newAmount = newTx.amount
      if (newTx.type === 'expense') {
        await db.accounts.where('id').equals(newTx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) - newAmount
        })
      } else if (newTx.type === 'income') {
        await db.accounts.where('id').equals(newTx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) + newAmount
        })
      } else if (newTx.type === 'transfer') {
        await db.accounts.where('id').equals(newTx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) - newAmount
        })
        await db.accounts.where('id').equals(newTx.toAccountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) + newAmount
        })
      }
    }
    await db.transactions.update(id, data)
    await get().fetchTransactions()
  },

  deleteTransaction: async (id) => {
    const tx = await db.transactions.get(id)
    if (tx) {
      const amount = Number(tx.amount) || 0
      // Reverse balance effect
      if (tx.type === 'expense') {
        await db.accounts.where('id').equals(tx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) + amount
        })
      } else if (tx.type === 'income') {
        await db.accounts.where('id').equals(tx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) - amount
        })
      } else if (tx.type === 'transfer') {
        await db.accounts.where('id').equals(tx.accountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) + amount
        })
        await db.accounts.where('id').equals(tx.toAccountId).modify(acc => {
          acc.balance = (Number(acc.balance) || 0) - amount
        })
      }
    }
    await db.transactions.delete(id)
    await get().fetchTransactions()
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
