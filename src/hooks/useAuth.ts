'use client'
import { useAuth as useSupabaseAuth } from '@/contexts/AuthContext'
import type { AppUser } from '@/types/auth'

interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const ctx = useSupabaseAuth()
  if (!ctx) {
    return { user: null, loading: true, signOut: async () => {} }
  }
  const { user, loading, signOut } = ctx

  const meta = (user as any)?.user_metadata || {}
  const name =
    meta.name ||
    meta.full_name ||
    user?.email?.split('@')[0] ||
    'User'

  const avatar =
    meta.avatar_url ||
    meta.picture ||
    undefined

  return {
    user: user
      ? {
          id: user.id,
          email: user.email || '',
          name,
          avatar_url: avatar
        }
      : null,
    loading,
    signOut
  }
}