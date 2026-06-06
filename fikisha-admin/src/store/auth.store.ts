import { create } from 'zustand'
import { AuthUser } from '@/types'

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean

  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  initAuth: () => void
}

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    localStorage.setItem('fikisha_token', token)
    localStorage.setItem('fikisha_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('fikisha_token')
    localStorage.removeItem('fikisha_user')
    set({ token: null, user: null, isAuthenticated: false })
  },

  initAuth: () => {
    const token = localStorage.getItem('fikisha_token')
    const userStr = localStorage.getItem('fikisha_user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser
        set({ token, user, isAuthenticated: true })
      } catch {
        localStorage.removeItem('fikisha_token')
        localStorage.removeItem('fikisha_user')
      }
    }
  },
}))
