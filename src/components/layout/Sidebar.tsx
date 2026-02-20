'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Package,
  Truck,
  DollarSign,
  Ship,
  Settings,
  LogOut,
  Home,
  Users,
  Layout,
  MessageSquare,
  BookOpen,
  Bell,
  ChevronLeft,
  ChevronRight,
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
]

const secondaryNav = [
  { name: 'Notifiche', href: '/dashboard/notifications', icon: Bell },
  { name: 'Utenti', href: '/dashboard/users', icon: Users },
  { name: 'Help', href: '/dashboard/help', icon: BookOpen },
  { name: 'Supporto', href: '/dashboard/support', icon: MessageSquare },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
  onSignOut: () => Promise<void>
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const Icon = item.icon
    const active = isActive(item.href)

    return (
      <Link
        href={item.href}
        onClick={onMobileClose}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          active
            ? "glass text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        )}
        title={collapsed ? item.name : undefined}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
        {!collapsed && <span className="truncate">{item.name}</span>}
      </Link>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-header px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ship className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">SCH Pro</span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-muted-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Menu
          </p>
        )}
        {navigation.map(item => (
          <NavItem key={item.href} item={item} />
        ))}

        <div className="pt-4">
          {!collapsed && (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Altro
            </p>
          )}
          {secondaryNav.map(item => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-black/[0.06] dark:border-white/[0.08] p-3 space-y-1">
        <Link
          href="/dashboard/settings"
          onClick={onMobileClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Impostazioni</span>}
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 glass rounded-none border-l-0 border-t-0 border-b-0",
          "transition-all duration-300 ease-glass",
          collapsed ? "w-sidebar-collapsed" : "w-sidebar"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 lg:hidden",
          "glass rounded-none border-l-0 border-t-0 border-b-0 shadow-2xl",
          "transition-transform duration-300 ease-glass",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
