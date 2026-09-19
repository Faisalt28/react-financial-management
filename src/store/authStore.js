import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setToken, removeToken } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { user, token } = await api.auth.login(email, password)
        setToken(token)
        set({ user, isAuthenticated: true })
        return user
      },

      register: async (name, email, password) => {
        const { user, token } = await api.auth.register(name, email, password)
        setToken(token)
        set({ user, isAuthenticated: true })
        return user
      },

      logout: () => {
        removeToken()
        set({ user: null, isAuthenticated: false })
      },

      updateProfile: async (updates) => {
        const { user } = await api.auth.updateProfile(updates)
        set({ user })
        return user
      },
    }),
    { name: 'ff_auth' }
  )
)
