'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Package, Search, BarChart3 } from 'lucide-react'

export function DashboardQuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: 'Nuova Spedizione',
      icon: Package,
      href: '/dashboard/shipments',
      variant: 'primary' as const,
    },
    {
      label: 'Traccia Spedizione',
      icon: Search,
      href: '/dashboard/tracking',
      variant: 'glass' as const,
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      variant: 'glass' as const,
    },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map(action => {
        const Icon = action.icon
        return (
          <Button
            key={action.href}
            variant={action.variant}
            onClick={() => router.push(action.href)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
