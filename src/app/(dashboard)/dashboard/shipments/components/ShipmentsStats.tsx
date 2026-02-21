'use client'

import { Ship, Truck, DollarSign, Package, MapPin } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { formatCurrency, formatNumber } from '@/lib/formatters'
import type { ShipmentsStats } from '../lib/useShipmentsData'

const kpis = [
  { key: 'total' as const, label: 'Totale', icon: Ship, color: 'text-primary' },
  { key: 'inTransit' as const, label: 'In Transito', icon: Truck, color: 'text-orange-500' },
  { key: 'shipped' as const, label: 'Spedite', icon: Package, color: 'text-blue-500' },
  { key: 'delivered' as const, label: 'Consegnate', icon: MapPin, color: 'text-green-500' },
]

interface Props {
  stats: ShipmentsStats | null
  loading?: boolean
}

export function ShipmentsStatsRow({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <GlassCard key={i} className="p-4">
            <div className="h-6 w-16 shimmer rounded mb-2" />
            <div className="h-4 w-20 shimmer rounded" />
          </GlassCard>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {kpis.map(({ key, label, icon: Icon, color }) => (
        <GlassCard key={key} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{formatNumber(stats[key])}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <Icon className={`h-6 w-6 ${color} opacity-60`} />
          </div>
        </GlassCard>
      ))}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
            <p className="text-xs text-muted-foreground">Valore Totale</p>
          </div>
          <DollarSign className="h-6 w-6 text-green-500 opacity-60" />
        </div>
      </GlassCard>
    </div>
  )
}
