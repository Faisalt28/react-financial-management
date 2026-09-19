import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '../lib/utils.js'
import { seedDefaultData } from '../lib/db.js'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const users = JSON.parse(localStorage.getItem('ff_users') || '[]')
        const user = users.find(u => u.email === email && u.password === password)
        if (!user) throw new Error('Email atau password salah')
        const { password: _, ...safeUser } = user
        set({ user: safeUser, isAuthenticated: true })
        await seedDefaultData(safeUser.id)
        return safeUser
      },

      register: async (name, email, password) => {
        const users = JSON.parse(localStorage.getItem('ff_users') || '[]')
        if (users.find(u => u.email === email)) throw new Error('Email sudah terdaftar')
        const newUser = { id: generateId(), name, email, password, avatar: null, createdAt: new Date().toISOString() }
        users.push(newUser)
        localStorage.setItem('ff_users', JSON.stringify(users))
        const { password: _, ...safeUser } = newUser
        set({ user: safeUser, isAuthenticated: true })
        await seedDefaultData(safeUser.id)
        return safeUser
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (updates) => {
        const current = get().user
        const updated = { ...current, ...updates }
        set({ user: updated })
        // Also update in users list
        const users = JSON.parse(localStorage.getItem('ff_users') || '[]')
        const idx = users.findIndex(u => u.id === current.id)
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updates }
          localStorage.setItem('ff_users', JSON.stringify(users))
        }
      },
    }),
    { name: 'ff_auth' }
  )
)
