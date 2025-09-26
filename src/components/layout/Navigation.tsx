'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  Ship, 
  FileText, 
  DollarSign, 
  Building,
  Settings,
  Users
} from 'lucide-react'

export const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Panoramica generale'
  },
  {
    title: 'Tracking',
    href: '/dashboard/tracking',
    icon: Package,
    description: 'Tracciamento spedizioni'
  },
  {
    title: 'Shipments',
    href: '/dashboard/shipments',
    icon: Ship,
    description: 'Gestione spedizioni'
  },
  {
    title: 'Products',
    href: '/dashboard/products',
    icon: FileText,
    description: 'Catalogo prodotti'
  },
  {
    title: 'Costs',
    href: '/dashboard/costs',
    icon: DollarSign,
    description: 'Gestione costi'
  },
  {
    title: 'Carriers',
    href: '/dashboard/carriers',
    icon: Building,
    description: 'Gestione vettori'
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    description: 'Gestione utenti'
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Impostazioni'
  }
]

interface NavigationProps {
  className?: string
  orientation?: 'vertical' | 'horizontal'
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Navigation({ 
  className, 
  orientation = 'vertical',
  showLabels = true,
  size = 'md'
}: NavigationProps) {
  const pathname = usePathname()

  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <nav className={cn('space-y-1', className)}>
      <ul className={cn(
        orientation === 'horizontal' ? 'flex space-x-1 space-y-0' : 'space-y-1'
      )}>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md font-medium transition-all duration-200',
                  sizeClasses[size],
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
                )}
                title={item.description}
              >
                <Icon className={cn(
                  iconSizes[size],
                  showLabels && orientation === 'vertical' ? 'mr-3' : '',
                  showLabels && orientation === 'horizontal' ? 'mr-2' : ''
                )} />
                {showLabels && (
                  <span className="flex-1 truncate">
                    {item.title}
                  </span>
                )}
                {isActive && orientation === 'vertical' && (
                  <div className="ml-auto h-2 w-2 bg-accent rounded-full" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// Hook per ottenere l'item di navigazione corrente
export function useCurrentNavigation() {
  const pathname = usePathname()
  return navigationItems.find(item => item.href === pathname)
}

// Componente per breadcrumb
export function NavigationBreadcrumb() {
  const currentItem = useCurrentNavigation()
  
  if (!currentItem) return null
  
  const Icon = currentItem.icon
  
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{currentItem.title}</span>
    </div>
  )
}