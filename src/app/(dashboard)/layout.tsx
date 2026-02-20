'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastProvider } from '@/components/ui/toast'

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace('/login')
    }
  }, [mounted, loading, user, router])

  const handleSignOut = async () => {
    try {
      setSidebarMobileOpen(false)
      await supabase.auth.signOut()
      router.replace('/login')
    } catch {
      window.location.href = '/login'
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Reindirizzamento...</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="h-screen bg-background flex overflow-hidden">
        {/* Sidebar - Desktop: persistent, Mobile: overlay */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
          onSignOut={handleSignOut}
        />

        {/* Mobile backdrop */}
        {sidebarMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarMobileOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onMenuClick={() => setSidebarMobileOpen(true)}
            onSignOut={handleSignOut}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
              {children}
            </div>
          </main>

          {/* Mobile bottom navigation */}
          <BottomNav />
        </div>
      </div>
    </ToastProvider>
  )
}

export default DashboardLayout
