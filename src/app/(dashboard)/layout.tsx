'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastProvider } from '@/components/ui/toast'
import { QueryProvider } from '@/components/providers/QueryProvider'

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
    <QueryProvider>
    <ToastProvider>
      <div className="h-screen flex overflow-hidden relative">
        {/* Gradient mesh background - provides color for glass refraction */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-background to-purple-50/80 dark:from-slate-950 dark:via-background dark:to-indigo-950/50">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-[80px]" />
          <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-pink-300/10 dark:bg-pink-500/5 rounded-full blur-[80px]" />
        </div>

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
    </QueryProvider>
  )
}

export default DashboardLayout
