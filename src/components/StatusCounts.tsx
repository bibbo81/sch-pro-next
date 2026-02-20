'use client'

import { GlassCard } from '@/components/ui/glass-card'

interface StatusCountsProps {
  trackings: any[]
}

const statuses = [
  { key: 'registered', label: 'Registrati', color: 'text-muted-foreground' },
  { key: 'in_transit', label: 'In Transito', color: 'text-blue-600 dark:text-blue-400' },
  { key: 'delivered', label: 'Consegnati', color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'delayed', label: 'Ritardati', color: 'text-amber-600 dark:text-amber-400' },
  { key: 'exception', label: 'Eccezioni', color: 'text-red-600 dark:text-red-400' }
]

export default function StatusCounts({ trackings }: StatusCountsProps) {
  const counts = trackings.reduce((acc, tracking) => {
    const status = tracking.status || 'unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">Riepilogo Stati</h3>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map((status) => {
          const count = counts[status.key] || 0
          return (
            <div
              key={status.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]"
            >
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
              <span className="text-sm font-bold text-foreground">{count}</span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
