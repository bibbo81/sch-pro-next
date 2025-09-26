'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refreshUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error && error.message !== 'The user is not authenticated') {
        console.error('Auth error:', error)
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            console.log('✅ Real user authenticated:', session.user.email)
            setUser(session.user)
            setSession(session)
          } else {
            console.log('❌ No authenticated user found - redirect to login required')
            setUser(null)
            setSession(null)
            // ✅ NON usare mock user - forza login reale
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setSession(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signOut,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}