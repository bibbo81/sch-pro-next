'use client'

import { Ship, Eye, ChevronDown, ChevronUp, Truck, ExternalLink, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/formatters'
import { normalizeStatus, getStatusConfig } from '@/lib/statusMapping'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Shipment } from '../lib/useShipmentsData'

interface Props {
  shipment: Shipment
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

export function ShipmentCard({ shipment, isSelected, onToggleSelect }: Props) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const normalizedStatus = normalizeStatus(shipment.status)
  const statusConfig = getStatusConfig(normalizedStatus)
  const items = shipment.shipment_items || []
  const displayName = shipment.shipment_number || shipment.tracking_number || `SPD-${shipment.id.slice(0, 8)}`
  const route = `${shipment.origin_port || shipment.origin || '?'} → ${shipment.destination_port || shipment.destination || '?'}`

  return (
    <GlassCard className={cn(
      "p-0 overflow-hidden transition-all duration-200",
      isSelected && "ring-2 ring-primary/40"
    )}>
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Selection + icon */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(shipment.id) }}
            className={cn(
              "h-5 w-5 rounded border-2 shrink-0 transition-colors",
              isSelected
                ? "bg-primary border-primary"
                : "border-muted-foreground/30 hover:border-muted-foreground/60"
            )}
          >
            {isSelected && (
              <svg className="h-full w-full text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <Ship className="h-5 w-5 text-primary shrink-0" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{displayName}</h3>
              <Badge variant={statusConfig.badgeVariant as any} className="text-[10px]">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {shipment.carrier_name || 'Vettore N/A'} &middot; {route}
            </p>
          </div>

          {/* Quick stats - desktop */}
          <div className="hidden md:flex items-center gap-6 text-xs shrink-0">
            <div className="text-center">
              <p className="text-muted-foreground">Tracking</p>
              <p className="font-medium font-mono text-primary truncate max-w-[120px]">
                {shipment.tracking_number || '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Valore</p>
              <p className="font-medium text-green-600 dark:text-green-400">
                {shipment.total_value ? formatCurrency(shipment.total_value) : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Data</p>
              <p className="font-medium">{formatDate(shipment.created_at)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push(`/dashboard/shipments/${shipment.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/30 p-4 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Shipment details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Dettagli Spedizione
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Tracking" value={shipment.tracking_number} mono />
                <Detail label="Spedizione" value={shipment.shipment_number} mono />
                <Detail label="Vettore" value={shipment.carrier_name} />
                <Detail label="ETA" value={shipment.eta ? formatDate(shipment.eta) : null} />
                <Detail label="Origine" value={shipment.origin_port || shipment.origin} />
                <Detail label="Destinazione" value={shipment.destination_port || shipment.destination} />
              </div>
            </div>

            {/* Right: Items + timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Prodotti ({items.length})
              </h4>
              {items.length > 0 ? (
                <div className="space-y-1.5">
                  {items.slice(0, 4).map((item, i) => (
                    <div key={item.id || i} className="flex justify-between text-xs">
                      <span className="truncate text-muted-foreground">{item.name || `Item ${i + 1}`}</span>
                      <span className="font-medium shrink-0 ml-2">x{item.quantity || 1}</span>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <p className="text-xs text-muted-foreground">...e altri {items.length - 4}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Nessun prodotto associato</p>
              )}

              <div className="pt-2 border-t border-border/20 space-y-1 text-xs text-muted-foreground">
                <p>Creata: {formatDateTime(shipment.created_at)}</p>
                <p>Aggiornata: {formatDateTime(shipment.updated_at)}</p>
                {shipment.total_value != null && (
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Valore: {formatCurrency(shipment.total_value)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-border/20 flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => router.push(`/dashboard/shipments/${shipment.id}`)}
              className="gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Dettagli
            </Button>
            {shipment.tracking_number && (
              <Button
                size="sm"
                variant="glass"
                onClick={() => router.push(`/dashboard/tracking?q=${shipment.tracking_number}`)}
                className="gap-1.5"
              >
                <Ship className="h-3.5 w-3.5" />
                Traccia
              </Button>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  )
}

function Detail({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium", mono && "font-mono", !value && "text-muted-foreground")}>
        {value || '-'}
      </p>
    </div>
  )
}
