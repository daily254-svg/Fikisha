import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { AuthUser } from '@/types'

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isFirstLogin: boolean

  setAuth: (token: string, user: AuthUser, isFirstLogin?: boolean) => Promise
  clearAuth: () => Promise
  initAuth: () => Promise
  setFirstLoginDone: () => void
}

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isFirstLogin: false,

  setAuth: async (token, user, isFirstLogin = false) => {
    await SecureStore.setItemAsync('fikisha_token', token)
    await SecureStore.setItemAsync('fikisha_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true, isFirstLogin })
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('fikisha_token')
    await SecureStore.deleteItemAsync('fikisha_user')
    set({ token: null, user: null, isAuthenticated: false, isFirstLogin: false })
  },

  initAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('fikisha_token')
      const userStr = await SecureStore.getItemAsync('fikisha_user')

      if (token && userStr) {
        const user = JSON.parse(userStr) as AuthUser
        set({ token, user, isAuthenticated: true, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  setFirstLoginDone: () => set({ isFirstLogin: false }),
}))
