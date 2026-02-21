'use client'

import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
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
import { Search, Settings, LogOut, User, Menu, Bell } from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/tracking': 'Tracking',
  '/dashboard/shipments': 'Spedizioni',
  '/dashboard/products': 'Prodotti',
  '/dashboard/carriers': 'Spedizionieri',
  '/dashboard/costs': 'Costi',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/custom-dashboards': 'Dashboard Custom',
  '/dashboard/notifications': 'Notifiche',
  '/dashboard/users': 'Utenti',
  '/dashboard/help': 'Help',
  '/dashboard/support': 'Supporto',
  '/dashboard/settings': 'Impostazioni',
}

interface HeaderProps {
  onMenuClick: () => void
  onSignOut: () => Promise<void>
}

export function Header({ onMenuClick, onSignOut }: HeaderProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  const pageTitle = PAGE_TITLES[pathname] || 'SCH Pro'

  const getUserInitials = (): string => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(' ')
        .map((s: string) => s[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || '?'
  }

  return (
    <header className="sticky top-0 z-30 h-header shrink-0 flex items-center gap-4 px-4 md:px-6 glass rounded-none border-t-0 border-l-0 border-r-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>

      {/* Search bar - center */}
      <div className="hidden md:flex flex-1 max-w-md mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border-0 bg-black/[0.04] dark:bg-white/[0.06] text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-black/[0.07] dark:focus:bg-white/[0.1] transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                // TODO: global search
              }
            }}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.03] dark:bg-white/[0.05] px-1.5 text-[10px] font-medium text-muted-foreground/50">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 ml-auto">
        <NotificationBell type="tracking" icon={<Bell className="h-5 w-5" />} />
        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url || ''}
                  alt={user?.email || 'User'}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.user_metadata?.name || 'Utente'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Impostazioni
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
