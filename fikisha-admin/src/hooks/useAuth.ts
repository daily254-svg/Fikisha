'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { LoginDto } from '@/types'

export function useAuth() {
  const router = useRouter()
  const { token, user, isAuthenticated, setAuth, clearAuth, initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  // Listen for token expiry event from axios interceptor
  useEffect(() => {
    const handleExpired = () => {
      clearAuth()
      // Toast shown by the listener in layout
      router.push('/login')
    }

    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const login = async (dto: LoginDto) => {
    const { accessToken } = await authService.login(dto)

    // Decode payload from JWT
    const base64 = accessToken.split('.')[1]
    const payload = JSON.parse(atob(base64))

    setAuth(accessToken, {
      id: payload.sub,
      schoolId: payload.schoolId,
      role: payload.role,
      phone: payload.phone,
      name: '',  // fetched separately if needed
    })

    router.push('/dashboard')
  }

  const logout = () => {
    clearAuth()
    router.push('/login')
  }

  return { token, user, isAuthenticated, login, logout }
}
