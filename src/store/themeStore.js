import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      // Call this once on app mount to apply saved preference
      init: () => {
        const { isDark } = get()
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggle: () => {
        const newDark = !get().isDark
        if (newDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        set({ isDark: newDark })
      },

      setDark: (value) => {
        if (value) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        set({ isDark: value })
      },
    }),
    { name: 'ff_theme' }
  )
)
