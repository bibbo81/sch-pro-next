'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Ship, Package, BarChart3, MoreHorizontal } from 'lucide-react'

const items = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Tracking', href: '/dashboard/tracking', icon: Ship },
  { name: 'Spedizioni', href: '/dashboard/shipments', icon: Package },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Altro', href: '/dashboard/settings', icon: MoreHorizontal },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-white/5 backdrop-blur-2xl bg-background/80 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(item => {
          const Icon = item.icon
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className="text-[10px] font-medium truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
