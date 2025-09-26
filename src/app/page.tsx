'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading) {
      if (user) {
        console.log('User found, redirecting to dashboard...')
        router.replace('/dashboard')
      } else {
        console.log('No user, redirecting to login...')
        router.replace('/login')
      }
    }
  }, [mounted, loading, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Caricamento...</p>
      </div>
    </div>
  )
}