'use client'

import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Ship, CheckCircle, Package } from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import { normalizeStatus, getStatusConfig } from '@/lib/statusMapping'
import type { ControlShipment } from '../lib/calculations'
import type { ControlFilterType } from '../lib/useDashboardData'

interface ControlTowerProps {
  shipments: ControlShipment[]
  allShipments: ControlShipment[]
  controlFilter: ControlFilterType
  onFilterChange: (filter: ControlFilterType) => void
}

export function ControlTower({
  shipments,
  allShipments,
  controlFilter,
  onFilterChange,
}: ControlTowerProps) {
  const transitCount = allShipments.filter(s => {
    const status = s.status.toLowerCase()
    return ['in_transit', 'sailing', 'departed', 'shipped'].some(st => status.includes(st))
  }).length

  const arrivedCount = allShipments.length - transitCount

  const filters: { key: ControlFilterType; label: string; count: number; icon: typeof Activity }[] = [
    { key: 'all', label: 'Tutti', count: allShipments.length, icon: Activity },
    { key: 'in_transit', label: 'In Viaggio', count: transitCount, icon: Ship },
    { key: 'recent_arrived', label: 'Arrivati 7gg', count: arrivedCount, icon: CheckCircle },
  ]

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <GlassCardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Control Tower
          </GlassCardTitle>
          <div className="flex gap-1.5">
            {filters.map(f => {
              const Icon = f.icon
              return (
                <Button
                  key={f.key}
                  variant={controlFilter === f.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onFilterChange(f.key)}
                  className="gap-1.5 text-xs"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{f.label}</span>
                  <span className="text-xs opacity-60">({f.count})</span>
                </Button>
              )
            })}
          </div>
        </div>
      </GlassCardHeader>

      <GlassCardContent className="p-0">
        {shipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nessuna spedizione trovata</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Destinazione
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ETA
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {shipments.slice(0, 20).map(shipment => {
                  const normalized = normalizeStatus(shipment.status)
                  const config = getStatusConfig(normalized)

                  return (
                    <tr key={shipment.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium">
                        {shipment.tracking_number}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={config.badgeVariant as any}>
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {shipment.carrier_name}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {shipment.destination}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground text-center">
                        {formatDate(shipment.eta)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}
