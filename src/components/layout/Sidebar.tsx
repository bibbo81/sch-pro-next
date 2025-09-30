'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import OrganizationSwitcher from '@/components/OrganizationSwitcher'
import SuperAdminButton from '@/components/SuperAdminButton'
import {
  BarChart3,
  Package,
  Truck,
  DollarSign,
  FileText,
  Ship,
  Activity,
  Settings,
  LogOut,
  X,
  Home,
  Users,
  Layout,
  MessageSquare
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tracking', href: '/dashboard/tracking', icon: Ship },
  { name: 'Spedizioni', href: '/dashboard/shipments', icon: Package },
  { name: 'Prodotti', href: '/dashboard/products', icon: Package },
  { name: 'Spedizionieri', href: '/dashboard/carriers', icon: Truck },
  { name: 'Costi', href: '/dashboard/costs', icon: DollarSign },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Dashboard Custom', href: '/dashboard/custom-dashboards', icon: Layout },
  { name: 'Supporto', href: '/dashboard/support', icon: MessageSquare },
  { name: 'Utenti', href: '/dashboard/users', icon: Users },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => Promise<void>
  className?: string
}

export function Sidebar({ isOpen, onClose, onSignOut, className }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      if (onSignOut) {
        await onSignOut()
      } else {
        await signOut()
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleLinkClick = () => {
    // Chiudi sempre la sidebar dopo aver cliccato un link
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        // Sidebar completamente overlay con z-index alto
        "fixed inset-y-0 left-0 z-50 w-80 bg-background border-r shadow-2xl transform transition-transform duration-300 ease-in-out",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b bg-background">
        <div className="flex items-center">
          <Ship className="h-8 w-8 text-primary" />
          <span className="ml-3 text-xl font-bold text-foreground">SCH Pro</span>
        </div>

        {/* Close button */}
        <button
          type="button"
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Organization Switcher */}
      <div className="px-6 py-4 border-b">
        <OrganizationSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "mr-4 h-6 w-6 flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-6 bg-muted/30">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-base font-medium text-primary">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <p className="text-base font-medium text-foreground truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href="/dashboard/settings"
            onClick={handleLinkClick}
            className="group flex items-center px-4 py-3 text-base font-medium text-muted-foreground rounded-xl hover:bg-accent hover:text-foreground transition-colors"
          >
            <Settings className="mr-4 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            Impostazioni
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full group flex items-center px-4 py-3 text-base font-medium text-muted-foreground rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="mr-4 h-5 w-5 text-muted-foreground group-hover:text-destructive" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}