'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Trash2, Package, Plane, Truck as TruckIcon } from 'lucide-react'

interface TrackingPreviewProps {
  tracking: any
  onDelete: (id: string) => void
  onUpdate: () => void
}

export default function TrackingPreview({ tracking, onDelete, onUpdate }: TrackingPreviewProps) {
  if (!tracking) return null

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-muted text-muted-foreground'

    const normalized = status.toLowerCase()
    const colors: Record<string, string> = {
      'registered': 'bg-muted text-muted-foreground',
      'in_transit': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      'sailing': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
      'arrived': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      'discharged': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
      'delivered': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      'delayed': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      'exception': 'bg-red-500/10 text-red-600 dark:text-red-400',
      'customs_hold': 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    }
    return colors[normalized] || 'bg-muted text-muted-foreground'
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'awb': return <Plane className="h-4 w-4" />
      case 'truck': return <TruckIcon className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponibile'
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Data non valida'
    }
  }

  const getLocation = (location?: string, port?: string, country?: string) => {
    if (port && country) return `${port}, ${country}`
    if (port) return port
    if (location) return location
    return 'Non specificato'
  }

  return (
    <GlassCard className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {getTypeIcon(tracking.tracking_type)}
          Dettagli Tracking
        </h3>
        <div className="flex gap-1.5">
          <Badge className={getStatusColor(tracking.status)}>
            {tracking.status || 'Sconosciuto'}
          </Badge>
          {tracking.updated_by_robot && (
            <Badge variant="secondary" className="text-[10px]">API</Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Main info */}
        <div>
          <h4 className="font-semibold text-foreground text-base mb-2">
            {tracking.tracking_number || 'Tracking non specificato'}
          </h4>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {tracking.tracking_type?.toUpperCase() || 'CONTAINER'}
            </Badge>
            {tracking.container_count && tracking.container_count > 1 && (
              <Badge variant="outline" className="text-[10px]">
                {tracking.container_count} Container
              </Badge>
            )}
            {tracking.container_size && (
              <Badge variant="outline" className="text-[10px]">
                {tracking.container_size}
              </Badge>
            )}
          </div>
        </div>

        {/* Carrier & Vessel */}
        <div className="grid grid-cols-2 gap-3">
          <InfoField label="Vettore" value={tracking.carrier_name || tracking.carrier || tracking.carrier_code || 'Non specificato'} />
          {tracking.vessel_name && (
            <InfoField label="Nave" value={tracking.vessel_name} />
          )}
        </div>

        {/* Locations */}
        <div className="grid grid-cols-2 gap-3">
          <InfoField label="Origine" value={getLocation(tracking.origin, tracking.origin_port, tracking.origin_country)} />
          <InfoField label="Destinazione" value={getLocation(tracking.destination, tracking.destination_port, tracking.destination_country)} />
        </div>

        {/* Dates */}
        {(tracking.eta || tracking.estimated_delivery || tracking.actual_delivery) && (
          <div className="grid grid-cols-2 gap-3">
            {(tracking.eta || tracking.estimated_delivery) && (
              <InfoField label="ETA" value={formatDate(tracking.eta || tracking.estimated_delivery)} />
            )}
            {tracking.actual_delivery && (
              <InfoField label="Consegnato" value={formatDate(tracking.actual_delivery)} />
            )}
          </div>
        )}

        {/* Booking numbers */}
        {(tracking.reference_number || tracking.booking_number || tracking.bl_number) && (
          <div className="space-y-2">
            {tracking.reference_number && <InfoField label="Riferimento" value={tracking.reference_number} />}
            {tracking.booking_number && <InfoField label="Booking" value={tracking.booking_number} />}
            {tracking.bl_number && <InfoField label="B/L" value={tracking.bl_number} />}
          </div>
        )}

        {/* Last event */}
        {tracking.last_event_description && (
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Ultimo Evento</p>
            <div className="text-sm text-foreground bg-black/[0.03] dark:bg-white/[0.04] p-3 rounded-xl">
              <p>{tracking.last_event_description}</p>
              {tracking.last_event_location && (
                <p className="text-xs text-muted-foreground mt-1">{tracking.last_event_location}</p>
              )}
              {tracking.last_event_date && (
                <p className="text-xs text-muted-foreground">{formatDate(tracking.last_event_date)}</p>
              )}
            </div>
          </div>
        )}

        {/* Logistics metrics */}
        {(tracking.total_weight_kg || tracking.total_volume_cbm || tracking.transit_time) && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            {tracking.total_weight_kg && (
              <div className="text-center p-2.5 bg-primary/5 rounded-xl">
                <div className="font-semibold text-foreground">{tracking.total_weight_kg} kg</div>
                <div className="text-[10px] text-muted-foreground">Peso</div>
              </div>
            )}
            {tracking.total_volume_cbm && (
              <div className="text-center p-2.5 bg-primary/5 rounded-xl">
                <div className="font-semibold text-foreground">{tracking.total_volume_cbm} cbm</div>
                <div className="text-[10px] text-muted-foreground">Volume</div>
              </div>
            )}
            {tracking.transit_time && (
              <div className="text-center p-2.5 bg-primary/5 rounded-xl">
                <div className="font-semibold text-foreground">{tracking.transit_time} gg</div>
                <div className="text-[10px] text-muted-foreground">Transit</div>
              </div>
            )}
          </div>
        )}

        <InfoField label="Data Creazione" value={formatDate(tracking.created_at)} />

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdate()}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Aggiorna
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm(`Eliminare il tracking ${tracking.tracking_number || tracking.id}?`)) {
                onDelete(tracking.id)
              }
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/5"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Elimina
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm text-foreground mt-0.5">{value}</p>
    </div>
  )
}
