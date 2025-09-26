'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    NotificationSystem?: {
      success: (m: string) => void
      error: (m: string) => void
      info: (m: string) => void
    }
  }
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.NotificationSystem) {
      const spawn = (msg: string, cls: string, ttl: number) => {
        const el = document.createElement('div')
        el.className = `px-4 py-2 rounded shadow text-white text-sm mb-2 ${cls}`
        el.textContent = msg
        const container = document.getElementById('toast-container')
        if (container) {
          container.appendChild(el)
          setTimeout(() => el.remove(), ttl)
        }
      }
      
      window.NotificationSystem = {
        success: (m: string) => spawn('✅ ' + m, 'bg-green-600', 3000),
        error: (m: string) => spawn('❌ ' + m, 'bg-red-600', 5000),
        info: (m: string) => spawn('ℹ️ ' + m, 'bg-blue-600', 4000),
      }
    }
  }, [])

  return <>{children}</>
}