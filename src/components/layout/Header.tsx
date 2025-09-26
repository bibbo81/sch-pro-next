'use client'

import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Bell, Search, Settings, LogOut, User, Package, Ship, Activity } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export function Header() {
  const { user, loading } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const pathname = usePathname()
  const supabase = createClient()

  // Get page title based on pathname
  const getPageTitle = (path: string): string => {
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/dashboard/tracking') return 'Tracking Spedizioni'
    if (path === '/dashboard/shipments') return 'Gestione Spedizioni'
    if (path === '/dashboard/products') return 'Gestione Prodotti'
    if (path === '/dashboard/suppliers') return 'Gestione Fornitori'
    if (path === '/dashboard/reports') return 'Report & Analytics'
    if (path === '/dashboard/shipment-details') return 'Dettagli Spedizione'
    if (path === '/dashboard/costs') return 'Gestione Costi'
    if (path === '/dashboard/carriers') return 'Gestione Vettori'
    return 'SCH Pro'
  }

  const handleSignOut = async (): Promise<void> => {
    try {
      console.log('Header: Signing out user:', user?.email)
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Header: Error signing out:', error)
      window.location.href = '/login'
    }
  }

  const getUserInitials = (): string => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(' ')
        .map((nameSegment: string) => nameSegment[0])
        .join('')
        .toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || '?'
  }

  // Safe function to get breadcrumb
  const getBreadcrumb = (path: string): string => {
    const segments = path.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    
    if (!lastSegment || lastSegment === 'dashboard') return ''
    
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }

  if (loading) {
    return (
      <header className="bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  const userInitials = getUserInitials()

  return (
    <header className="bg-background border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Page Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground">
            {getPageTitle(pathname)}
          </h1>
          {pathname !== '/dashboard' && (
            <div className="text-sm text-muted-foreground">
              / {getBreadcrumb(pathname)}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca tracking, spedizioni, prodotti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  // TODO: Implementa ricerca globale
                  console.log('Global search:', searchTerm)
                }
              }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/dashboard/shipments'}
              title="Nuova Spedizione"
            >
              <Ship className="w-4 h-4 mr-1" />
              <span className="hidden xl:inline">Spedizione</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/dashboard/products'}
              title="Nuovo Prodotto"
            >
              <Package className="w-4 h-4 mr-1" />
              <span className="hidden xl:inline">Prodotto</span>
            </Button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => {
              // TODO: Apri pannello notifiche
              console.log('Open notifications panel')
            }}
            title="Notifiche"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url || ""} 
                    alt={user?.user_metadata?.name || user?.email || 'User'} 
                  />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.name || 'Utente'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  // TODO: Navigate to profile
                  console.log('Navigate to profile')
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profilo</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Navigate to settings
                  console.log('Navigate to settings')
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Impostazioni</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.location.href = '/dashboard/tracking'}
              >
                <Activity className="mr-2 h-4 w-4" />
                <span>Tracking</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Debug info per development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground mt-2">
          Path: {pathname} | User: {user?.email || 'No user'} | Search: "{searchTerm}"
        </div>
      )}
    </header>
  )
}