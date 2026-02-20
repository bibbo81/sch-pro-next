'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2, RefreshCw, Ship } from 'lucide-react'

interface TrackingListProps {
  trackings: any[]
  onSelect: (tracking: any) => void
  selected: any
  onDelete: (id: string) => void
  onUpdate: () => void
}

const getStatusColor = (status?: string) => {
  if (!status) return 'bg-muted text-muted-foreground'

  const colors: Record<string, string> = {
    'registered': 'bg-muted text-muted-foreground',
    'in_transit': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'delivered': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'delayed': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'exception': 'bg-red-500/10 text-red-600 dark:text-red-400',
    'sailing': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'customs_hold': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'arrived': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  }
  const normalized = status.toLowerCase()
  return colors[normalized] || 'bg-muted text-muted-foreground'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Data non disponibile'
  try {
    return new Date(dateString).toLocaleDateString('it-IT')
  } catch {
    return 'Data non valida'
  }
}

export default function TrackingList({
  trackings,
  onSelect,
  selected,
  onDelete,
  onUpdate
}: TrackingListProps) {
  const safeTrackings = Array.isArray(trackings) ? trackings : []

  if (safeTrackings.length === 0) {
    return (
      <GlassCard className="py-12 text-center">
        <Ship className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground mb-1">
          Nessun tracking trovato
        </h3>
        <p className="text-sm text-muted-foreground">
          Aggiungi il tuo primo tracking per iniziare
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Lista Tracking ({safeTrackings.length})
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={onUpdate}
          title="Aggiorna lista tracking"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Aggiorna
        </Button>
      </div>

      <div className="space-y-2">
        {safeTrackings.map((tracking) => (
          <div
            key={tracking.id || tracking.tracking_number}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ease-glass ${
              selected?.id === tracking.id
                ? 'bg-primary/10 border border-primary/20 shadow-sm'
                : 'bg-black/[0.02] dark:bg-white/[0.03] border border-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:border-black/[0.06] dark:hover:border-white/[0.08]'
            }`}
            onClick={() => onSelect(tracking)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {tracking.tracking_number || 'Tracking non specificato'}
                  </h4>
                  <Badge className={getStatusColor(tracking.status)}>
                    {tracking.status || 'N/A'}
                  </Badge>

                  {tracking.is_api_tracked !== undefined && (
                    <Badge variant={tracking.is_api_tracked ? "default" : "secondary"} className="text-[10px]">
                      {tracking.is_api_tracked ? 'API' : 'MAN'}
                    </Badge>
                  )}
                </div>

                {tracking.carrier_name && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {tracking.carrier_name}
                  </p>
                )}

                {(tracking.origin_port || tracking.destination_port || tracking.origin || tracking.destination) && (
                  <p className="text-xs text-muted-foreground">
                    {tracking.origin_port || tracking.origin || '?'} → {tracking.destination_port || tracking.destination || '?'}
                  </p>
                )}

                {tracking.reference_number && (
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    Rif: {tracking.reference_number}
                  </p>
                )}

                <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                  {formatDate(tracking.created_at)}
                  {tracking.updated_at && tracking.updated_at !== tracking.created_at && (
                    <span> · Agg. {formatDate(tracking.updated_at)}</span>
                  )}
                </p>
              </div>

              <div className="flex gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(tracking)
                  }}
                  title="Visualizza dettagli"
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Eliminare il tracking ${tracking.tracking_number || tracking.id}?`)) {
                      onDelete(tracking.id)
                    }
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Elimina tracking"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
