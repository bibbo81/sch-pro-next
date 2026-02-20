'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Ship, TrendingUp, Package, Weight, Clock, CheckCircle } from 'lucide-react'
import { formatCurrency, formatNumber, formatWeight } from '@/lib/formatters'
import type { DashboardMetrics } from '../lib/calculations'

interface DashboardKPIsProps {
  metrics: DashboardMetrics | null
  loading: boolean
}

const KPI_ITEMS = [
  {
    key: 'totalShipments' as const,
    label: 'Spedizioni Totali',
    icon: Ship,
    format: (v: number) => formatNumber(v),
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    key: 'inTransitCount' as const,
    label: 'In Transito',
    icon: TrendingUp,
    format: (v: number) => formatNumber(v),
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    key: 'deliveredThisMonth' as const,
    label: 'Consegnate (mese)',
    icon: CheckCircle,
    format: (v: number) => formatNumber(v),
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    key: 'totalCosts' as const,
    label: 'Costi Totali',
    icon: Package,
    format: (v: number) => formatCurrency(v),
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    key: 'avgCostPerShipment' as const,
    label: 'Costo Medio',
    icon: Weight,
    format: (v: number) => formatCurrency(v),
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    key: 'avgDeliveryTime' as const,
    label: 'Tempo Medio',
    icon: Clock,
    format: (v: number) => `${Math.round(v)} gg`,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
]

export function DashboardKPIs({ metrics, loading }: DashboardKPIsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassCard key={i} className="p-5">
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-4 w-24" />
          </GlassCard>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {KPI_ITEMS.map(kpi => {
        const Icon = kpi.icon
        const value = metrics?.[kpi.key] ?? 0

        return (
          <GlassCard key={kpi.key} className="p-5 group">
            <div className={`inline-flex p-2.5 rounded-xl ${kpi.bg} mb-3 transition-transform group-hover:scale-110`}>
              <Icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold tracking-tight">{kpi.format(value)}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </GlassCard>
        )
      })}
    </div>
  )
}
