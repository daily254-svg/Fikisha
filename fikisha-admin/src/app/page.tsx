'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, hasHydrated, initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    router.replace(isAuthenticated ? '/dashboard' : '/login')
  }, [hasHydrated, isAuthenticated, router])

  return null
}
