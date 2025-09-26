'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Sidebar } from '@/components/layout/Sidebar'
import { Ship, Menu, LogOut } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { loading, user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      console.log('No user in dashboard, redirecting to login...')
      router.replace('/login')
    }
  }, [mounted, loading, user, router])

  const handleSignOut = async () => {
    try {
      console.log('Signing out user:', user?.email)
      setSidebarOpen(false)
      await supabase.auth.signOut()
      router.replace('/login')
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Reindirizzamento al login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background">
      {/* Main Content Area - Occupa sempre tutto lo spazio disponibile */}
      <div className="h-full flex flex-col">
        {/* Header Bar */}
        <header className="bg-background shadow-sm border-b px-4 py-4 flex items-center justify-between">
          {/* Left side with menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary mr-4"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Toggle sidebar</span>
              <Menu className="h-6 w-6" />
            </button>

            {/* Brand */}
            <div className="flex items-center">
              <Ship className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-lg font-semibold text-foreground">SCH Pro</h1>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive p-1 transition-colors"
              title="Disconnetti"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content - Prende tutto lo spazio disponibile */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay - Solo quando aperta, completamente sopra il contenuto */}
      {sidebarOpen && (
        <>
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={closeSidebar} 
            onSignOut={handleSignOut}
          />
          
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={closeSidebar}
          />
        </>
      )}
    </div>
  )
}

export default DashboardLayout